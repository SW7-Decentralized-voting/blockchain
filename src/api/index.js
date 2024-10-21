import express from 'express';
import pkg from 'hardhat';
const { ethers } = pkg;
const app = express();
app.use(express.json());
import startBlockchain from '../utils/startBlockchain.js';
import electionConfig from '../../artifacts/contracts/Election.sol/Election.json' with { type: 'json' };

function convertBigIntToString(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertBigIntToString(value)])
    );
  } else {
    return obj;
  }
}

// Configuration
const main = async () => {
  // ABI is defined for communication with compiled contract
  const { abi: ABI, bytecode: ABIBytecode } = electionConfig;
  const accounts = await generateAccounts();

  let election = null;

  const provider = new ethers.JsonRpcProvider();

  const ElectionPhase = {
    Registration: 0n,
    Voting: 1n,
    Tallying: 2n
  };

  // Start election
  app.post('/election/start', async (req, res) => {
    if (election !== null) {
      return res.status(400).json({ error: 'Election has already started' });
    }

    try {
      // Start the election
      election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);
      return res.status(200).json({ message: 'Election started successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Error starting election' });
    }
  });

  // Add a candidate to the election
  app.post('/candidate/add', async (req, res) => {
    if (election === null) {
      return res.status(400).json({ error: 'Election has not started' });
    }

    const { name, party } = req.body;

    if (!name || !party) {
      return res.status(400).json({ error: 'Name and party are required' });
    }

    try {
      // Ensure the contract is in registration phase
      const currentPhase = await election.phase();
      if (currentPhase !== ElectionPhase.Registration) {
        return res.status(400).json({ error: 'Election is not in the registration phase' });
      }

      // Add candidate to the election
      const tx = await election.addCandidate(name, party);
      await tx.wait(); // Wait for the transaction to be mined

      res.json({
        message: 'Candidate added successfully',
        transactionHash: tx.hash
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500).json({ error: 'Error adding candidate ' + error.message });
    }
  });

  // Get all candidates
  app.get('/candidates', async (req, res) => {
    try {
      const candidates = await election.getCandidates();
      const candidatesWithStrings = convertBigIntToString(candidates);
      res.json(candidatesWithStrings);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500).json({ error: 'Error getting candidates' });
    }
  });

  app.post('/party/add', async (req, res) => {
    if (election === null) {
      return res.status(400).json({ error: 'Election has not started' });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      // Ensure the contract is in registration phase
      const currentPhase = await election.phase();
      if (currentPhase !== ElectionPhase.Registration) {
        return res.status(400).json({ error: 'Election is not in the registration phase' });
      }

      // Add party to the election
      const tx = await election.addParty(name);
      await tx.wait(); // Wait for the transaction to be mined

      res.json({
        message: 'Party added successfully',
        transactionHash: tx.hash
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500).json({ error: 'Error adding party' });
    }
  } );

  // Get all parties
  app.get('/parties', async (req, res) => {
    try {
      const parties = await election.getParties();
      const partiesWithStrings = convertBigIntToString(parties);
      res.json(partiesWithStrings);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500).json({ error: 'Error getting parties' });
    }
  });

  // Cast an encrypted vote
  app.post('/vote', async (req, res) => {
    const { votingKey, entityId, isParty, encryptedVote } = req.body;

    if (!votingKey || !entityId || encryptedVote === undefined) {
      return res.status(400).json({ error: 'Voting key, entity ID, and encrypted vote are required' });
    }

    try {
      // Ensure the contract is in voting phase
      const currentPhase = await election.phase();
      if (currentPhase.toString() !== '1') {
        return res.status(400).json({ error: 'Election is not in the voting phase' });
      }

      // Cast the encrypted vote
      const tx = await election.voteWithKey(votingKey, entityId, isParty, encryptedVote);
      await tx.wait(); // Wait for the transaction to be mined

      res.json({
        message: 'Vote cast successfully',
        transactionHash: tx.hash
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error casting vote' });
    }
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });
};

const generateAccounts = async () => {
  const [deployer, citizen1, citizen2, ...otherCitizens] = await ethers.getSigners();

  return { deployer, citizen1, citizen2, otherCitizens };
};

// Call the main function to start the application
main();