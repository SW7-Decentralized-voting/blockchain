import crypto from 'crypto';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import * as paillierBigint from 'paillier-bigint'

/**
 * Decrypts the votes and tallies them
 * @param {Request} req Express request object. Should contain the private key to 
 * decrypt the votes in the body
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with the tally of votes
 */
async function decryptAndTallyVotes(req, res, next) {
	try {
		const election = getElection();
		if (election === null) {
			return res.status(400).json({ error: 'Election has not started' });
		}

		if (await election.phase() !== ElectionPhase.Tallying) {
			return res.status(400).json({ error: 'Election is not in the tallying phase' });
		}

		const privateKeyString = req.body.privateKey;

		// Deserialize the private key string
		const privateKeyObject = JSON.parse(privateKeyString);

		const publicKey = new paillierBigint.PublicKey(BigInt(privateKeyObject.publicKey.n), BigInt(privateKeyObject.publicKey.g));
		const privateKey = new paillierBigint.PrivateKey(BigInt(privateKeyObject.lambda), BigInt(privateKeyObject.mu), publicKey);

		if (!privateKey) {
			return res.status(400).send({ error: 'Private key is required' });
		}

		const votes = await election.getEncryptedVotes();

		if (!votes) {
			return res.status(200).json({});
		}

		const decryptedVotes = votes.map(vote => {
			try {
				return privateKey.decrypt(BigInt(vote));

			} catch (error) {
				console.error(error);
				return null;
			}

		});

		const tally = decryptedVotes.reduce((acc, vote) => {
			acc[vote] = acc[vote] ? acc[vote] + 1 : 1;
			return acc;
		}, {});

		// console.log('Tally:', tally);

		res.status(200).json(tally);



	} catch (error) {
		next(error);
	}
}

export { decryptAndTallyVotes };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */