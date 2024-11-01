import pkg from 'hardhat';
import { setElection } from './electionManager.js';
import { ABI, ABIBytecode, accounts } from '../../utils/constants.js';
const { ethers } = pkg;

async function startContract() {
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
    console.error('There was an error deploying the contract: ', error.message);
  }

}

export default startContract;
