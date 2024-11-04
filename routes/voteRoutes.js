import express from 'express';
import { vote, getEncryptionKey } from '../controllers/vote.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    await vote(req, res, next);
  } catch (error) {
    next(error);
  }
}
);

router.get('/get-key', async (req, res, next) => {
  getEncryptionKey(req, res, next);
}
);

export default router;