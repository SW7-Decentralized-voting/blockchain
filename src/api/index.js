import express from 'express';
import { ethers, JsonRpcProvider } from 'ethers';
const app = express();
app.use(express.json());
import generateAccount from '../utils/generateAccount.js';
import startBlockchain from '../utils/startBlockchain.js';
//import ABIArtifact from '../../artifacts/contracts/Election.sol/Election.json';
import electionConfig from '../../artifacts/contracts/Election.sol/Election.json' assert { type: "json" };


// Configuration
const main = async () => {
  // ABI is defined for communication with compiled contract
  const { abi: ABI, bytecode: ABIBytecode } = electionConfig;
  // Blockchain host (?)
  const provider = new JsonRpcProvider('http://127.0.0.1:8545'); 
  const wallet = generateAccount().connect(provider);
  // Starts the blockchain
  const election = await startBlockchain(ABI, ABIBytecode, wallet);
  // Get address from election
  const CONTRACT_ADDRESS = election.address;
  // Get election contract from contract address, ABI and wallet
  const electionContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet); 

  // Add a candidate to the election
  app.post('/add-candidate', async (req, res) => {
      const { name, party } = req.body;
      
      try {
          // Ensure the contract is in registration phase
          const currentPhase = await electionContract.phase();
          if (currentPhase !== 0) {
              return res.status(400).json({ error: 'Election is not in the registration phase' });
          }

          // Add candidate to the election
          const tx = await electionContract.addCandidate(name, party);
          await tx.wait(); // Wait for the transaction to be mined

          res.json({
              message: 'Candidate added successfully',
              transactionHash: tx.hash
          });
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error adding candidate' });
      }
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
};

// Call the main function to start the application
main();