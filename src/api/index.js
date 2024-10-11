import express from 'express';
import pkg from 'hardhat';
const { ethers } = pkg;
const app = express();
app.use(express.json());
import startBlockchain from '../utils/startBlockchain.js';
//import ABIArtifact from '../../artifacts/contracts/Election.sol/Election.json';
import electionConfig from '../../artifacts/contracts/Election.sol/Election.json' assert { type: 'json' };

// Configuration
const main = async () => {
  // ABI is defined for communication with compiled contract
  const { abi: ABI, bytecode: ABIBytecode } = electionConfig;

  const accounts = await generateAccounts();

  let election = null;

  // Start election
  app.post('/election/start', async (req, res) => {
    console.log(req.body);
    if (election !== null) {
      return res.status(400).json({ error: 'Election has already started' });
    }

    try {
      election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);
      res.status(200).json({ message: 'Election started' });
    } catch (error) {
      res.status(500).json({ error: 'Error starting election' });
    }
  })

  // Add a candidate to the election
  app.post('/add-candidate', async (req, res) => {
    const { name, party } = req.body;

    if (!name || !party) {
      return res.status(400).json({ error: 'Name and party are required' });
    }

    try {
      // Ensure the contract is in registration phase
      const currentPhase = await election.phase();
      if (currentPhase.toString() !== '0') {
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
      res.status(500).json({ error: 'Error adding candidate' });
    }
  });

  // Get all candidates
  app.get('/candidates', async (req, res) => {
    try {
      const candidates = await election.getCandidates();
      res.json(candidates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      res.status(500).json({ error: 'Error getting candidates' });
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