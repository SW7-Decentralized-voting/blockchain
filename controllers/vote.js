import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
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

    const encryptionKeyJson = await election.encryptionKey();
    if (!encryptionKeyJson) {
        return res.status(400).json({ error: 'Encryption key is not set' });
    }

    let voteId = req.body.voteId;

    if (voteId === undefined) {
        return res.status(400).json({ error: 'Vote ID is required' });
    }

    let vectorLength;

    try {
        vectorLength =  Number(await election.getRequiredVectorLength());
    } catch (error) {
        return res.status(500).json({ error: 'Error getting required vector length: ' + error.message });
    }

    // Construct voteVector array. Must be of length vectorLength, be all zeroes except for the voteId index
    let voteVector = Array(vectorLength).fill(BigInt(0));
    voteVector[voteId] = BigInt(1);

    try {
        const encryptionKeyObject = JSON.parse(encryptionKeyJson);
        const publicKey = new paillierBigint.PublicKey(BigInt(encryptionKeyObject.n), BigInt(encryptionKeyObject.g));

        const encryptedVoteVector = voteVector.map(vote => publicKey.encrypt(BigInt(vote)));

        const encryptedVoteVectorString = encryptedVoteVector.map(vote => vote.toString());

        const tx = await election.castVote(encryptedVoteVectorString);
        await tx.wait();

        // eslint-disable-next-line no-console
        console.log(`Vote cast for candidate/party with ID ${voteId}. Transaction hash: ${tx.hash}`);

        return res.json({
            message: 'Vote cast successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error casting vote: ' + error.message });
    }
}

export { vote };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */