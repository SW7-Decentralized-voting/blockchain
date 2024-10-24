import express from 'express';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';

const router = express.Router();

router.post('/add', async (req, res, next) => {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const { name, party } = req.body;

    if (!name || !party) {
        return res.status(400).json({ error: 'Name and party are required' });
    }

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Registration) {
            return res.status(400).json({ error: 'Election is not in the registration phase' });
        }

        const tx = await election.addCandidate(name, party);
        await tx.wait();

        res.json({
            message: 'Candidate added successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    const election = getElection();
    try {
        const candidates = await election.getCandidates();
        const candidatesWithStrings = convertBigIntToString(candidates);
        res.json(candidatesWithStrings);
    } catch (error) {
        next(error);
    }
});

export default router;