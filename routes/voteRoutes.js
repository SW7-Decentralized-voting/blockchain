import express from 'express';
import { vote, getEncryptionKey } from '../controllers/vote.js';

const router = express.Router();

router.post('/', vote);

router.get('/get-key', getEncryptionKey);

export default router;