require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');

// eslint-disable-next-line jsdoc/valid-types
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.27',
  networks: {
    hardhat: {
      gasPrice: 20000000000,  // Set a reasonable gas price (20 gwei)
      initialBaseFeePerGas: 20000000000,  // Set the initial base fee (same as gasPrice)
      gas: 12000000,
      accounts: {
        count: 10,
        balance: '10000000000000000000000'  // Each account gets 10,000 ETH
      }
    },
  },
};