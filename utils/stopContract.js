import helpers from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { setElection } from './electionManager.js';

async function stopContract() {
  await helpers.reset();
  setElection(null);
}

export default stopContract;