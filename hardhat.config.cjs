require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      gasPrice: 0,  // No gas cost for transactions
      initialBaseFeePerGas: 0,  // No base fee per gas (EIP-1559 compatible)
      accounts: {
        count: 10,  // Define how many accounts you want (e.g., 10 citizens)
        balance: "10000000000000000000000"  // Each citizen has 10,000 ETH (for testing purposes)
      }
    },
  },
};
