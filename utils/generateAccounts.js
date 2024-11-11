import pkg from 'hardhat';
const { ethers } = pkg;

const generateAccounts = async () => {
  const [deployer, citizen1, citizen2, ...otherCitizens] = await ethers.getSigners();
  return { deployer, citizen1, citizen2, otherCitizens };
};

export default generateAccounts;