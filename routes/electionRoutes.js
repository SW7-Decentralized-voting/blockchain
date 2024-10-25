import express from 'express';
import startBlockchain from '../utils/startBlockchain.js';
import { ABI, ABIBytecode, accounts } from '../utils/constants.js';
import { getElection, setElection } from '../utils/electionManager.js';
import { generateKeyPair } from '../utils/encryption.js';

const router = express.Router();

router.post('/start', async (req, res, next) => {
  if (getElection() !== null) {
    return res.status(400).json({ error: 'Election has already started' });
  }

  try {
    // Generate a key pair for homomorphic encryption
    const { publicKey, privateKey } = await generateKeyPair();

    // Serialize the private key
    const privateKeyString = JSON.stringify({
      lambda: privateKey.lambda.toString(),
      mu: privateKey.mu.toString(),
      publicKey: {
        n: privateKey.publicKey.n.toString(),
        g: privateKey.publicKey.g.toString()
      }
    });

    // Start the blockchain and set the election instance
    const election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);
    setElection(election);

    // Upload the serialized private key to the smart contract
    await election.uploadDecryptionKey(privateKeyString);

    // Respond with a success message and the public key
    res.status(200).json({ message: 'Election started successfully', publicKey });
  } catch (error) {
    next(error);
  }
});



export default router;