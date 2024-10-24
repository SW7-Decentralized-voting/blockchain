import express from 'express';
import { election, ElectionPhase } from '../utils/constants.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  const { votingKey, entityId, isParty, encryptedVote } = req.body;

  if (!votingKey || !entityId || encryptedVote === undefined) {
    return res.status(400).json({ error: 'Voting key, entity ID, and encrypted vote are required' });
  }

  try {
    const currentPhase = await election.phase();
    if (currentPhase.toString() !== '1') {
      return res.status(400).json({ error: 'Election is not in the voting phase' });
    }

    const tx = await election.voteWithKey(votingKey, entityId, isParty, encryptedVote);
    await tx.wait();

    res.json({
      message: 'Vote cast successfully',
      transactionHash: tx.hash
    });
  } catch (error) {
    next(error);
  }
});

export default router;