import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import { Buffer } from 'buffer';
import { publicEncrypt } from 'crypto';

/**
 * Cast a vote in the election contract
 * @param {Request} req Express request object. Should contain the id of the candidate or party to vote for (or blank id)
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with a success message or an error message
 */
async function vote(req, res, next) {
    const election = getElection();

    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const currentPhase = await election.phase();
    if (currentPhase !== ElectionPhase.Voting) {
        return res.status(400).json({ error: 'Election is not in the voting phase' });
    }

    const id  = req.body.id;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    const encryptionKey = await election.encryptionKey();

    if (!encryptionKey) {
        return res.status(400).json({ error: 'Encryption key is not set' });
    }

    const encryptedVote = publicEncrypt(encryptionKey, Buffer.from(id));

    try {
        const tx = await election.castVote(encryptedVote);
        await tx.wait();

        res.json({
            message: 'Vote cast successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        next(error);
    }
}

export { vote };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */