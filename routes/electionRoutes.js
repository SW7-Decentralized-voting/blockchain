import express from 'express';
import startBlockchain from '../utils/startBlockchain.js';
import { ABI, ABIBytecode, accounts, ElectionPhase } from '../utils/constants.js';
import { getElection, setElection } from '../utils/electionManager.js';
//import { generateKeyPair } from '../utils/encryption.js';

const router = express.Router();

router.post('/start', async (req, res, next) => {
  if (getElection() !== null) {
    return res.status(400).json({ error: 'Election has already started' });
  }

  try {
    // Generate a key pair for homomorphic encryption
    //const { publicKey, privateKey } = await generateKeyPair();

    // Start the blockchain and set the election instance
    const election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);
    setElection(election);

    //await election.uploadEncryptionKey(publicKeyString);

    // Upload the serialized private key to the smart contract
    //await election.uploadDecryptionKey(privateKeyString);

    // Respond with a success message and the public key
    //res.status(200).json({ message: 'Election started successfully', publicKeyString });
    res.status(200).json({ message: 'Election started successfully'});
  } catch (error) {
    next(error);
  }
});

// Advance election phase
router.post('/advance-phase', async (req, res, next) => {
  const election = getElection();
  if (election === null) {
    return res.status(400).json({ error: 'Election has not started' });
  }

  const currentPhase = await election.phase();

  try {
    if (currentPhase === ElectionPhase.Registration) {
      const tx = await election.startVotingPhase();
      await tx.wait();
      res.json({ message: 'Election phase advanced to voting phase', transactionHash: tx.hash });
    }
    if (currentPhase === ElectionPhase.Voting) {
      const tx = await election.startTallyingPhase();
      await tx.wait();
      res.json({ message: 'Election phase advanced to tallying phase', transactionHash: tx.hash });
    }
    if (currentPhase === ElectionPhase.Tallying) {
      // Cannot advance past tallying phase
      res.status(400).json({ error: 'Election has already ended' });
    }
  } catch (error) {
    next(error);
  }
});



export default router;