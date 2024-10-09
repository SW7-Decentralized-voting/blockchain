const { ethers } = require('ethers');

const wallet = ethers.Wallet.createRandom();

module.exports = { wallet };