import express from 'express';
import startBlockchain from '../utils/startBlockchain.js';
import { ABI, ABIBytecode, accounts } from '../utils/constants.js';
import { getElection, setElection } from '../utils/electionManager.js';

const router = express.Router();

router.post('/start', async (req, res, next) => {
  if (getElection() !== null) {
    return res.status(400).json({ error: 'Election has already started' });
  }

  try {
    const election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);
    setElection(election);
    res.status(200).json({ message: 'Election started successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;