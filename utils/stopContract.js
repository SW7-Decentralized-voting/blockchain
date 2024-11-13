import helpers from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { setElection } from './electionManager.js';

/**
 * Stop the election by resetting the contract and setting the election to null
 */
async function stopContract() {
  await helpers.reset();
  setElection(null);
}

export default stopContract;