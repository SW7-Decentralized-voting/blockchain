import pkg from 'hardhat';
import { setElection } from './electionManager.js';
const { ethers } = pkg;

async function startContract(ABI, bytecode, wallet) {
  const ElectionFactory = new ethers.ContractFactory(
    ABI,
    bytecode,
    wallet
  );

  try {
    const election = await ElectionFactory.deploy();
    setElection(election);
  }
  catch (error) {
    console.error('There was an error deploying the contract: ', error.message);
  }

}

export default startContract;