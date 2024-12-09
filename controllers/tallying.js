import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import * as paillierBigint from 'paillier-bigint';

/**
 * Decrypts the votes and tallies them
 * @param {Request} req Express request object. Should contain the private key to 
 * decrypt the votes in the body
 * @param {Response} res Express response object
 * @returns {Response} Express response object with the tally of votes
 */
async function decryptAndTallyVotes(req, res) {
	try {
		const election = getElection();
		if (election === null) {
			return res.status(400).json({ error: 'Election has not started' });
		}

		if (await election.phase() !== ElectionPhase.Tallying) {
			return res.status(400).json({ error: 'Election is not in the tallying phase' });
		}

		const privateKeyObject = req.body.privateKey;

		// Deserialize the private key string
		//const privateKeyObject = JSON.parse(privateKeyString);

		const publicKey = new paillierBigint.PublicKey(BigInt(privateKeyObject.publicKey.n), BigInt(privateKeyObject.publicKey.g));
		const privateKey = new paillierBigint.PrivateKey(BigInt(privateKeyObject.lambda), BigInt(privateKeyObject.mu), publicKey);

		if (!privateKey) {
			return res.status(400).send({ error: 'Private key is required' });
		}

		const encryptedVoteVectors = await election.getEncryptedVoteVectors();

		if (encryptedVoteVectors.length === 0) {
			return res.status(200).json({});
		}

		// encryptedVoteVectors is an array of arrays of strings
		// Convert to an array of arrays of BigInts
		const encryptedVoteVectorsBigInt = encryptedVoteVectors.map(voteVector => {
			return voteVector.map(vote => BigInt(vote));
		});

		// perform homomorphic addition on each vote vector
		const encryptedTally = encryptedVoteVectorsBigInt.reduce((acc, voteVector) => {
			return acc.map((vote, index) => publicKey.addition(vote, voteVector[index]));
		});

		// Decrypt the tally
		const tally = encryptedTally.map(vote => privateKey.decrypt(vote));

		res.status(200).json({ tally: tally.map(vote => vote.toString()) });



	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);
		return res.status(500).json({ error: 'Error tallying votes' });
	}
}

export { decryptAndTallyVotes };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */