require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');

// eslint-disable-next-line jsdoc/valid-types
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.27',
  networks: {
    hardhat: {
      gasPrice: 1,  // Set a reasonable gas price (20 gwei)
      initialBaseFeePerGas: 1,  // Set the initial base fee (same as gasPrice)
      gas: 30000000,
      accounts: {
        count: 10,
        balance: '10000000000000000000000'  // Each account gets 10,000 ETH
      }
    },
  },
};