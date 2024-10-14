import { ethers } from 'ethers';

// Generate numKeys keys
export const generateKeys = async (numKeys, providerUrl = 'http://localhost:8545') => {
  const keys = [];
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const [deployer] = await provider.listAccounts();

  for (let i = 0; i < numKeys; i++) {
    const key = ethers.Wallet.createRandom().connect(provider);
    const tx = await provider.getSigner(deployer).sendTransaction({
      to: key.address,
      value: ethers.utils.parseEther('1.0')
    });
    await tx.wait();
    keys.push(key);
  }

  return keys;
};