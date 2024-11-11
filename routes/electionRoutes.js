import express from 'express';
import { startElection, advanceElectionPhase, getCurrentPhase } from '../controllers/election.js';

const router = express.Router();

router.post('/start', startElection);

// Advance election phase
router.post('/advance-phase', advanceElectionPhase);

router.get('/current-phase', getCurrentPhase);


export default router;