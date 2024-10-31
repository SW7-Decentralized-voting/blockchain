import express from 'express';
import { getElection } from '../utils/electionManager.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    try {
        const decryptionKey = await election.getDecryptionKey();
        res.json(decryptionKey);
    } catch (error) {
        next(error);
    }
}
);

export default router;