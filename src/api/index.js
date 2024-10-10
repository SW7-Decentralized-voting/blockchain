import express from 'express';
import pkg from 'hardhat';
const { ethers } = pkg;
const app = express();
app.use(express.json());
import startBlockchain from '../utils/startBlockchain.js';
//import ABIArtifact from '../../artifacts/contracts/Election.sol/Election.json';
import electionConfig from '../../artifacts/contracts/Election.sol/Election.json' assert { type: "json" };

// Configuration
const main = async () => {
    // ABI is defined for communication with compiled contract
    const { abi: ABI, bytecode: ABIBytecode } = electionConfig;

    const accounts = await generateAccounts();

    // Starts the blockchain
    const election = await startBlockchain(ABI, ABIBytecode, accounts.citizen1);

    console.log('Initial election phase:', await election.phase());
    // Add a candidate to the election
    app.post('/add-candidate', async (req, res) => {
        const { name, party } = req.body;

        if (!name || !party) {
            return res.status(400).json({ error: 'Name and party are required' });
        }

        try {
            // Ensure the contract is in registration phase
            const currentPhase = await election.phase();
            console.log('Current phase:', currentPhase.toString());
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
            console.error(error);
            res.status(500).json({ error: 'Error getting candidates' });
        }
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

const generateAccounts = async () => {
    const [deployer, citizen1, citizen2, ...otherCitizens] = await ethers.getSigners();

    console.log(`Deployer: ${deployer.address}`);
    console.log(`Citizen 1: ${citizen1.address}`);
    console.log(`Citizen 2: ${citizen2.address}`);
    console.log('Citizen 1 balance:', (await ethers.provider.getBalance(citizen1.address)).toString());

    return { deployer, citizen1, citizen2, otherCitizens };
}

// Call the main function to start the application
main();