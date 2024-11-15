import crypto from 'crypto';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import { Buffer } from 'buffer';

/**
 * Decrypts the votes and tallies them
 * @param {Request} req Express request object. Should contain the private key to 
 * decrypt the votes in the body
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function (error handler)
 * @returns {Response} Express response object with the tally of votes
 */
async function decryptAndTallyVotes(req, res, next) {
	const privateKey = req.body.privateKey;

	if (!privateKey) {
		return res.status(400).send({ error: 'Private key is required' });
	}

	try {
		const election = getElection();
		if (election === null) {
			return res.status(400).json({ error: 'Election has not started' });
		}

		if (await election.phase() !== ElectionPhase.Tallying) {
			return res.status(400).json({ error: 'Election is not in the tallying phase' });
		}

		const votes = await election.getEncryptedVotes();

		console.log('Votes:', votes);

		const decryptedVotes = votes.map(vote => {
			try {
				const buffer = Buffer.from(vote, 'base64');
				console.log(buffer)
				const decrypted = crypto.privateDecrypt(privateKey, buffer);
				return decrypted.toString('utf8');
			} catch (error) {
				console.error(error);
				return null;
			}

		});

		const tally = decryptedVotes.reduce((acc, vote) => {
			acc[vote] = acc[vote] ? acc[vote] + 1 : 1;
			return acc;
		}, {});

		res.status(200).json(tally);
	} catch (error) {
		next(error);
	}
}

export { decryptAndTallyVotes };

/**
 * @import { Request, Response, NextFunction } from 'express';
 */