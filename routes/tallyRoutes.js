import express from 'express';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';

const router = express.Router();

router.get('/get-key', async (req, res, next) => {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    if (await election.phase() !== ElectionPhase.Tallying) {
        return res.status(400).json({ error: 'Election is not in the tallying phase' });
    }

    try {
        const decryptionKey = await election.decryptionKey();
        res.json(decryptionKey);
    } catch (error) {
        next(error);
    }
}
);

router.get('/get-encrypted-votes', async (req, res, next) => {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    if (await election.phase() !== ElectionPhase.Tallying) {
        return res.status(400).json({ error: 'Election is not in the tallying phase' });
    }

    try {
        const result = await election.getEncryptedVotes();
        res.json(result);
    } catch (error) {
        next(error);
    }
}
);

export default router;