import { ABI, ABIBytecode, accounts, ElectionPhase } from '../utils/constants.js';
import { getElection } from '../utils/electionManager.js';
import { publishParty } from '../controllers/party.js';
import { publishCandidate } from '../controllers/candidate.js';
import startContract from '../utils/startContract.js';

/**
 * Start the election by uploading the public key and the list of candidates and parties
 * @param {Request} req Express request object. Should contain the list of candidates and parties
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler) 
 * @returns {Promise<Response>} Express response object with a success message or an error message
 */
async function startElection(req, res, next) {
    if (getElection() !== null) {
        return res.status(400).json({ error: 'Election has already started' });
    }

    // Parse req to a list of candidates and parties
    const { candidates, parties } = req.body;
    if (!candidates || !parties) {
        return res.status(400).json({ error: 'Candidates and parties are required' });
    }

    try {

        const publicKey = req.body.publicKey;

        // Start the contract and set the election instance
        await startContract(ABI, ABIBytecode, accounts.citizen1);

        for (const party of parties) {
            await publishParty(party.voteId, party.name);
        }

        for (const candidate of candidates) {
            await publishCandidate(candidate.voteId, candidate.name, candidate.party);
        }

        // Upload the public key to the contract
        await getElection().uploadEncryptionKey(publicKey);

        // Respond with a success message and the public key
        res.status(200).json({ message: 'Election started successfully'});
    } catch (error) {
        next(error);
    }
}

/**
 * Advance the election phase to the next phase
 * @param {Request} req Express request object 
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with a success message or an error message
 */
async function advanceElectionPhase(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const currentPhase = await election.phase();

    try {
        if (currentPhase === ElectionPhase.Registration) {
            const tx = await election.startVotingPhase();
            await tx.wait();
            res.json({ message: 'Election phase advanced to voting phase', transactionHash: tx.hash });
        }
        if (currentPhase === ElectionPhase.Voting) {
            const tx = await election.startTallyingPhase();
            await tx.wait();

            // TODO Store the decryption key in a secure location and upload it during the tallying phase
            //const tx2 = await election.uploadDecryptionKey();
            //await tx2.wait();
            //res.json({ message: 'Election phase advanced to tallying phase', transactionHash: tx.hash, transactionHash2: tx2.hash });
            res.json({ message: 'Election phase advanced to tallying phase', transactionHash: tx.hash });
        }
        if (currentPhase === ElectionPhase.Tallying) {
            // Cannot advance past tallying phase
            res.status(400).json({ error: 'Election has already ended' });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Get the current phase of the election from the contract (blockchain)
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with the current phase of the election
 */
async function getCurrentPhase(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    try {
        const currentPhase = await election.phase();
        const serializedPhase = currentPhase.toString();
        res.json({ currentPhase: serializedPhase });
    } catch (error) {
        next(error);
    }
}


export { startElection, advanceElectionPhase, getCurrentPhase };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */