import Key from '../schemas/Key.js';
import jwt from 'jsonwebtoken';
import keys from '../config/keys.js';
import PollingStation from '../schemas/PollingStation.js';

/**
 * Verify a key and return a JWT token if valid
 * @param {Request} req Express request object containing the key and pollingStation in req.body
 * @param {Response} res Express response object to send the response
 * @returns {Response} The response containing the token if the key is valid or an error message if the key is invalid
 */
async function verifyKey(req, res) {
	const { key, pollingStation } = req.body;

	if (!key || !pollingStation) {
		return res.status(400).json({ message: 'Key and pollingStation are required' });
	}
	try {
		const pollingStationDoc = await PollingStation.findById(pollingStation);
		if (!pollingStationDoc) {
			return res.status(400).json({ message: 'Polling station not found: ' + pollingStation });
		}

		const keyDoc = await Key.findOne({ keyHash: key, pollingStation: pollingStation });

		if (!keyDoc) {
			return res.status(401).json({ message: 'Invalid key' });
		}

		keyDoc.isUsed = true;
		await keyDoc.save();

		const token = jwt.sign({ key: keyDoc.keyHash, pollingStation: keyDoc.pollingStation }, keys.jwtSecret, { expiresIn: '10m' });

		return res.status(200).json({
			message: 'Key verified',
			token: token,
		});
	} catch (error) {

		if (error.name === 'CastError') {
			return res.status(400).json({ message: 'Invalid id: ' + error.value });
		}

		// eslint-disable-next-line no-console
		console.error(error);
		return res.status(500).json({ message: 'Error verifying key' });
	}
}

export { verifyKey };

/**
 * @import { Response, Request } from 'express';
 */