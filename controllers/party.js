import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';

/**
 * Get all parties in the election contract
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with a list of parties
 */
async function getParties(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    try {
        const parties = await election.getParties();
        const partiesWithStrings = convertBigIntToString(parties);
        res.json(partiesWithStrings);
    } catch (error) {
        next(error);
    }
}

/**
 * Publish a party to the blockchain
 * @param {String} objectId mongoose object id of the party
 * @param {String} name The name of the party
 * @returns {String} Transaction hash
 */
async function publishParty(objectId, name) {
    const election = getElection();
    if (election === null) {
        throw new Error('Election has not started');
    }

    if (!name) {
        throw new Error('Party name is required');
    }

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Registration) {
            throw new Error('Parties can only be added during the registration phase');
        }

        const tx = await election.addParty(objectId, name);
        await tx.wait();

        return tx.hash;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

export { getParties, publishParty };

/**
 * @import { Request, Response, NextFunction } from 'express'; 
 */