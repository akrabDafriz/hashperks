"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// NEW: Wagmi Imports for MetaMask/Injected Provider
import { WagmiConfig, createConfig, http } from "wagmi"; // Removed createWeb3Modal, defaultWagmiConfig
import { mainnet, sepolia, arbitrum, optimism } from "wagmi/chains"; // Keep chains you need

const Web3Context = createContext(null);

export const useWeb3 = () => useContext(Web3Context);

// NEW: 1. Setup Wagmi config for injected provider (MetaMask)
// No projectId needed for direct MetaMask connection
const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum, optimism], // Define the chains your app supports
  transports: {
    // Configure HTTP transport for each chain, or use injected for MetaMask
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});

export const Web3Provider = ({ children }) => {
  // Existing ethers.js states
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const connectWallet = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          const web3Signer = await web3Provider.getSigner();
          setSigner(web3Signer);
          setAccount(accounts[0]);
        } else {
          setError("No accounts found. Please unlock MetaMask or create an account.");
        }
      } catch (err) {
        console.error("Error connecting to wallet:", err);
        if (err.code === 4001) {
          setError("Connection request denied by user.");
        } else {
          setError("Failed to connect wallet. Make sure MetaMask is installed and configured.");
        }
        setAccount(null);
        setSigner(null);
        setProvider(null);
      }
    } else {
      setError("MetaMask is not installed. Please install MetaMask to use this application.");
      setAccount(null);
      setSigner(null);
      setProvider(null);
    }
    setIsLoading(false);
  }, []);

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setError(null);
    console.log("Wallet disconnected (app state cleared).");
  };

  useEffect(() => {
    setIsLoading(false); // Initial load complete

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (provider) {
            provider.getSigner().then(setSigner).catch(console.error);
          }
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [provider, disconnectWallet]);

  return (
    // Wrap the entire Web3Context.Provider with WagmiConfig
    <WagmiConfig config={wagmiConfig}>
      <Web3Context.Provider value={{ provider, signer, account, isLoading, error, connectWallet, disconnectWallet }}>
        {children}
      </Web3Context.Provider>
    </WagmiConfig>
  );
};
