import express from 'express';
import { vote } from '../controllers/vote.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, vote);

export default router;