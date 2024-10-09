// utils/startBlockchain.js
const { ethers } = require('ethers');

async function startBlockchain(ABI, bytecode, wallet) {
  const ElectionFactory = new ethers.ContractFactory(
    ABI,
    bytecode,
    wallet
  );
  
  const election = await ElectionFactory.deploy(); // Note: Changed from Election to ElectionFactory
  await election.deployed();
  
  return election;
}

// Export the function
module.exports = startBlockchain;
