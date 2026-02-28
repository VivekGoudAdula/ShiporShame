import { ethers } from 'ethers';
import { ABI } from '../abi';

// Replace with your actual deployed contract address on Monad Testnet
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export const MONAD_TESTNET_PARAMS = {
  chainId: '0x279f', // 10143 in decimal
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

export const getContract = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei: bigint | string) => {
  return ethers.formatEther(wei);
};

export const parseEther = (ether: string) => {
  return ethers.parseEther(ether);
};
