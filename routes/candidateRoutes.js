import express from 'express';
import { getCandidates } from '../controllers/candidate.js';

const router = express.Router();

// Fetch candidates from contract
router.get('/', getCandidates);

export default router;