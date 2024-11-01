import express from 'express';
import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
    const election = getElection();
  if (election === null) {
    return res.status(400).json({ error: 'Election has not started' });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const currentPhase = await election.phase();
    if (currentPhase !== ElectionPhase.Registration) {
      return res.status(400).json({ error: 'Election is not in the registration phase' });
    }

    const tx = await election.addParty(name);
    await tx.wait();

    res.json({
      message: 'Party added successfully',
      transactionHash: tx.hash
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
    const election = getElection();
  if (election === null) {
    return res.status(400).json({ error: 'Election has not started' });
  }
  
  try {
    const parties = await election.getParties();
    const partiesWithStrings = convertBigIntToString(parties);
    res.json(partiesWithStrings);
  } catch (error) {
    next(error);
  }
});

export default router;