import pkg from 'hardhat';
const { ethers } = pkg;
import { HDNode } from '@ethersproject/hdnode';

// Generate numKeys derived from a single wallet
const generateKeys = async (numKeys, provider) => {
  const keys = [];
  
  // Use deployer as the account to send ETH
  const deployer = await provider.getSigner(0);

  // Create a master wallet (can replace with a known mnemonic if needed)
  const masterWallet = ethers.Wallet.createRandom().connect(provider);
  // eslint-disable-next-line no-console
  console.log(`Master wallet address: ${masterWallet.address}`);
  // eslint-disable-next-line no-console
  console.log(`Master wallet mnemonic: ${masterWallet.mnemonic.phrase}`);

  for (let i = 0; i < numKeys; i++) {
    // Derive new wallets from the master wallet's mnemonic
    const derivedNode = HDNode.fromMnemonic(masterWallet.mnemonic.phrase).derivePath(`m/44'/60'/0'/0/${i}`);
    const derivedWallet = new ethers.Wallet(derivedNode.privateKey, provider);
    // eslint-disable-next-line no-console
    console.log(`Generated wallet ${i}: ${derivedWallet.address}`);

    // Transfer 1 ETH from the deployer to each derived wallet
    try {
      const tx = await deployer.sendTransaction({
        to: derivedWallet.address,
        value: ethers.parseEther('1.0'),
      });
      await tx.wait();
      // eslint-disable-next-line no-console
      console.log(`Transferred 1.0 ETH to ${derivedWallet.address} (TX: ${tx.hash})`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to transfer ETH to ${derivedWallet.address}: ${error}`);
    }

    // Add the derived wallet to the keys array
    keys.push(derivedWallet);
  }

  return keys;
};

export default generateKeys;