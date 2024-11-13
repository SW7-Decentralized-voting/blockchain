import { getElection } from '../utils/electionManager.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';
import { ElectionPhase } from '../utils/constants.js';

/**
 * Get all candidates in the election contract
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with a list of candidates
 */
async function getCandidates(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }
    
    try {
        const candidates = await election.getCandidates();
        const candidatesWithStrings = convertBigIntToString(candidates);
        res.json(candidatesWithStrings);
    } catch (error) {
        next(error);
    }
}

/**
 * Publish a candidate to the blockchain
 * @param {String} objectId mongoose object id of the candidate
 * @param {String} name The name of the candidate
 * @param {String} party name of andidate's party
 * @returns {String} Transaction hash
 */
async function publishCandidate(objectId, name, party) {
    const election = getElection();
    if (election === null) {
        throw new Error('Election has not started');
    }

    if (!objectId || !name || !party) {
        throw new Error('objectId, candidate name and party are required');
    }

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Registration) {
            throw new Error('Candidates can only be added during the registration phase');
        }

        const tx = await election.addCandidate(objectId, name, party);
        await tx.wait();

        return tx.hash;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

export { getCandidates, publishCandidate };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */