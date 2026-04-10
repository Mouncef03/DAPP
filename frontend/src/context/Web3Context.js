import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import HorseMarketplaceABI from '../utils/HorseMarketplace.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');

  const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

  // ─── Initialize Contract ──────────────────────────────────
  const initContract = useCallback(async (signerOrProvider) => {
    try {
      const horseContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        HorseMarketplaceABI.abi,
        signerOrProvider
      );
      setContract(horseContract);
    } catch (error) {
      console.error('Contract init error:', error);
    }
  }, [CONTRACT_ADDRESS]);

  // ─── Connect Wallet ───────────────────────────────────────
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install MetaMask.');
      return;
    }

    try {
      setIsConnecting(true);
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);

      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();
      const bal = await web3Provider.getBalance(address);

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(network.chainId.toString());
      setBalance(ethers.formatEther(bal));

      await initContract(web3Signer);

      toast.success('Wallet connected successfully! 🐴');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  // ─── Disconnect Wallet ────────────────────────────────────
 const disconnectWallet = async () => {
  try {
    // Révoque les permissions du site
    await window.ethereum.request({
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }],
    });
  } catch (error) {
    console.error('Error revoking permissions:', error);
  }

  setAccount(null);
  setProvider(null);
  setSigner(null);
  setContract(null);
  setChainId(null);
  setBalance('0');
  toast.success('Wallet disconnected');
};

  // ─── Auto Connect ─────────────────────────────────────────
const autoConnect = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      if (accounts.length > 0 && !account) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Auto connect error:', error);
    }
  }
};

  // ─── Listen for Account/Chain Changes ────────────────────
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  // ─── Format Address ───────────────────────────────────────
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        chainId,
        isConnecting,
        balance,
        connectWallet,
        disconnectWallet,
        formatAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};