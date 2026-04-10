import { ethers } from 'ethers';

// Convert ETH to Wei
export const toWei = (amount) => {
  return ethers.parseEther(amount.toString());
};

// Convert Wei to ETH
export const fromWei = (amount) => {
  return ethers.formatEther(amount.toString());
};

// Format wallet address
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format price
export const formatPrice = (price) => {
  return parseFloat(price).toFixed(4);
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

// Get network name
export const getNetworkName = (chainId) => {
  const networks = {
    '1': 'Ethereum Mainnet',
    '11155111': 'Sepolia Testnet',
    '31337': 'Hardhat Local',
    '137': 'Polygon Mainnet',
    '80001': 'Mumbai Testnet',
  };
  return networks[chainId] || `Unknown Network (${chainId})`;
};