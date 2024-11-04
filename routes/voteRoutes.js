import express from 'express';
import { vote, getEncryptionKey } from '../controllers/vote';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { encryptedVote } = req.body;

  try {
    const tx = await vote(encryptedVote);
    res.json({
      message: 'Vote cast successfully',
      transactionHash: tx.hash
    });
  } catch (error) {
    next(error);
  }
}
);

router.get('/get-key', async (req, res, next) => {
  try {
    const encryptionKey = await getEncryptionKey();
    res.json(encryptionKey);
  } catch (error) {
    next(error);
  }
}
);

export default router;