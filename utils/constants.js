import electionConfig from '../artifacts/contracts/Election.sol/Election.json' with { type: 'json' };
import generateAccounts from './generateAccounts.js';

const { abi: ABI, bytecode: ABIBytecode } = electionConfig;
const accounts = await generateAccounts();

const ElectionPhase = {
  Registration: 0n,
  Voting: 1n,
  Tallying: 2n
};

export { ABI, ABIBytecode, accounts, ElectionPhase };