import express from 'express';
import { getCandidates } from '../controllers/candidate.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    await getCandidates(req, res, next);
});

export default router;