import { ethers } from 'ethers';

const generateAccount = () => ethers.Wallet.createRandom();

export default generateAccount;