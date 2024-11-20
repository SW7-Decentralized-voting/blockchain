import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import keys from '../config/keys.js';

dotenv.config();

const auth = (req, res, next) => {
	const token = req.headers['authorization'];

	if (!token) {
		return res.status(401).json({
			message: 'Access Denied: No Token Provided'
		});
	}

	try {
		const verified = jwt.verify(token, keys.jwtSecret);
		req.user = verified;
		next();
	} catch {
		res.status(401).json({
			message: 'Access Denied: Invalid Token'
		});
	}
};

export default auth;

