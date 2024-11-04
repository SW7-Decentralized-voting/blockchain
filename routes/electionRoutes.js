import express from 'express';
import { startElection, advanceElectionPhase } from '../controllers/election.js';

const router = express.Router();

router.post('/start', startElection);

// Advance election phase
router.post('/advance-phase', advanceElectionPhase);

export default router;