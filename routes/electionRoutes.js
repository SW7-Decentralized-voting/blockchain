import express from 'express';
import { startElection, advanceElectionPhase } from '../controllers/election.js';

const router = express.Router();

router.post('/start', async (req, res, next) => {
  await startElection(req, res, next);
});

// Advance election phase
router.post('/advance-phase', async (req, res, next) => {
  await advanceElectionPhase(req, res, next);
});



export default router;