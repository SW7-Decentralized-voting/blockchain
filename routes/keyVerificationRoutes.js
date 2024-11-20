import express from 'express';
import { verifyKey } from '../controllers/keyVerification.js';

const router = express.Router();

// POST /verify route to verify the key
router.post('/verify', async (req, res) => {
	verifyKey(req, res);
});

export default router;