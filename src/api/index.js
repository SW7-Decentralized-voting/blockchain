const express = require('express');
const { ethers } = require('ethers');
const app = express();
app.use(express.json());
const generateAccount = require('../utils/generateAccount');
const startBlockchain = require('../utils/startBlockchain');


// Configuration
const main = async () => {
  // ABI is defined for communication with compiled contract
  const ABI = require('../../artifacts/contracts/Election.sol/Election.json').abi; // Update path to your ABI
  const ABIBytecode = require('../../artifacts/contracts/Election.sol/Election.json').bytecode;
  const wallet = generateAccount;
  // Starts the blockchain
  const election = await startBlockchain(ABI, ABIBytecode, wallet);
  // Get address from election
  const CONTRACT_ADDRESS = election.address;
  // Get election contract from contract address, ABI and wallet
  const electionContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  // Blockchain host (?)
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');  

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