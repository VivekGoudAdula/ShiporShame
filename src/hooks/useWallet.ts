import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { MONAD_TESTNET_PARAMS } from '../utils/contract';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef<ethers.BrowserProvider | null>(null);

  const checkNetwork = useCallback(async (p: ethers.BrowserProvider) => {
    try {
      const network = await p.getNetwork();
      const currentChainId = '0x' + network.chainId.toString(16);
      setChainId(currentChainId);
      return currentChainId === MONAD_TESTNET_PARAMS.chainId;
    } catch {
      return false;
    }
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_PARAMS.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_PARAMS],
          });
        } catch (addError) {
          console.error('Failed to add network', addError);
          setError('Failed to add Monad network to wallet');
        }
      } else {
        console.error('Failed to switch network', switchError);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    providerRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const p = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = p;
      const accounts = await p.send('eth_requestAccounts', []);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const s = await p.getSigner();

      setProvider(p);
      setSigner(s);
      setAddress(accounts[0]);

      const isCorrectNet = await checkNetwork(p);
      if (!isCorrectNet) {
        await switchNetwork();
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected by user.');
      } else {
        setError(err.message || 'Failed to connect');
      }
      disconnect();
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork, switchNetwork, disconnect]);

  // Auto-reconnect if already connected (page reload)
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const p = new ethers.BrowserProvider(window.ethereum);
        const accounts = await p.send('eth_accounts', []); // eth_accounts (no popup)
        if (accounts && accounts.length > 0) {
          providerRef.current = p;
          const s = await p.getSigner();
          setProvider(p);
          setSigner(s);
          setAddress(accounts[0]);
          await checkNetwork(p);
        }
      } catch {
        // Silently fail on auto-connect
      }
    };
    tryAutoConnect();
  }, [checkNetwork]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        disconnect();
      } else {
        setAddress(accounts[0]);
        // Refresh signer for new account
        if (providerRef.current) {
          try {
            const s = await providerRef.current.getSigner();
            setSigner(s);
          } catch {
            disconnect();
          }
        }
      }
    };

    const handleChainChanged = async (newChainId: string) => {
      // Update chainId state without full page reload
      setChainId(newChainId);
      // Refresh provider/signer on chain change
      if (window.ethereum && address) {
        try {
          const p = new ethers.BrowserProvider(window.ethereum);
          providerRef.current = p;
          const s = await p.getSigner();
          setProvider(p);
          setSigner(s);
        } catch {
          disconnect();
        }
      }
    };

    const handleDisconnect = () => {
      disconnect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    };
  }, [address, disconnect]);

  return {
    address,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    isCorrectNetwork: chainId === MONAD_TESTNET_PARAMS.chainId || chainId === null
  };
};
