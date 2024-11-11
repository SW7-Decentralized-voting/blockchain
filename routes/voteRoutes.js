import express from 'express';
import { vote } from '../controllers/vote.js';

const router = express.Router();

router.post('/', vote);

export default router;