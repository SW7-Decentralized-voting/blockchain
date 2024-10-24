import pkg from 'hardhat';
const { ethers } = pkg;

async function startBlockchain(ABI, bytecode, wallet) {
  const ElectionFactory = new ethers.ContractFactory(
    ABI,
    bytecode,
    wallet
  );
  
  const election = await ElectionFactory.deploy(); // Note: Changed from Election to ElectionFactory
  
  return election;
}

export default startBlockchain;
