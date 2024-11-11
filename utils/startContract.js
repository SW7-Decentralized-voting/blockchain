import pkg from 'hardhat';
import { getElection, setElection } from './electionManager.js';
import { ABI, ABIBytecode, accounts } from './constants.js';
const { ethers } = pkg;

async function startContract() {
  if (getElection() !== null) {
    throw new Error('Election has already started');
  }
  
  const ElectionFactory = new ethers.ContractFactory(
    ABI,
    ABIBytecode,
    accounts.citizen1
  );

  try {
    const election = await ElectionFactory.deploy();
    setElection(election);
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('There was an error deploying the contract: ', error.message);
  }

}

export default startContract;
