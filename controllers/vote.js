import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import { Buffer } from 'buffer';
import * as paillierBigint from 'paillier-bigint';

/**
 * Cast a vote in the election contract
 * @param {Request} req Express request object. Should contain the id of the candidate or party to vote for (or blank id)
 * @param {Response} res Express response object
 * @returns {Promise<Response>} Express response object with a success message or an error message
 */
async function vote(req, res) {
    const election = getElection();

    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const currentPhase = await election.phase();
    if (currentPhase !== ElectionPhase.Voting) {
        return res.status(400).json({ error: 'Election is not in the voting phase' });
    }

    let id  = req.body.id;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    // Convert id = '0x0' to bigint
    id = BigInt(id);

    const encryptionKeyJson = await election.encryptionKey();

    if (!encryptionKeyJson) {
        return res.status(400).json({ error: 'Encryption key is not set' });
    }

    const encryptionKeyObject = JSON.parse(encryptionKeyJson);
    const publicKey = new paillierBigint.PublicKey(BigInt(encryptionKeyObject.n), BigInt(encryptionKeyObject.g));
    const encryptedVote = publicKey.encrypt(id);

    // Ensure that encryptedVoted is bytes memory solidity type
    const encryptedVoteBuffer = Buffer.from(encryptedVote.toString(16), 'hex');

    try {
        const tx = await election.castVote(encryptedVoteBuffer);
        await tx.wait();

        return res.json({
            message: 'Vote cast successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(500).json({ error: 'Error casting vote' });
    }
}

export { vote };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */