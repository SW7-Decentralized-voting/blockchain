import express from 'express';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import { decryptAndTallyVotes } from '../controllers/tallying.js';

const router = express.Router();

router.post('/upload-key', async (req, res, next) => {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    if (await election.phase() !== ElectionPhase.Tallying) {
        return res.status(400).json({ error: 'Election is not in the tallying phase' });
    }

    const { decryptionKey } = req.body;
    if (!decryptionKey) {
        return res.status(400).json({ error: 'decryptionKey is required' });
    }

    try {
        const tx = await election.uploadDecryptionKey(decryptionKey);
        await tx.wait();
        res.json({ message: 'Key uploaded successfully', transactionHash: tx.hash });
    } catch (error) {
        next(error);
    }
}
);

router.get('/encrypted-votes', async (req, res) => {
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
        // eslint-disable-next-line no-console
        console.error(error);
        return res.status(500).json({ error: 'Error getting encrypted votes' });
    }
}
);

router.get('/', async (req, res, next) => {
    decryptAndTallyVotes(req, res, next);
}
);

export default router;