import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers, Signer } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

// Define the shape of the context
export type WalletContextType = {
    walletAddress: string | null;
    signer: Signer | null;
    connectWallet: () => Promise<void>;
};

// Create the context with default values
const WalletContext = createContext<WalletContextType>({
    walletAddress: null,
    signer: null,
    connectWallet: async () => {},
});

// Hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

// Provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [signer, setSigner] = useState<Signer | null>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum === "undefined") {
            alert("Please install MetaMask to use this feature.");
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            if (accounts.length > 0) {
                const signer = await provider.getSigner();
                setWalletAddress(accounts[0]);
                setSigner(signer);
            }
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    useEffect(() => {
        const checkWalletConnected = async () => {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();
                    setWalletAddress(address);
                    setSigner(signer);
                }
            }
        };

        checkWalletConnected();
    }, []);

    return (
        <WalletContext.Provider value={{ walletAddress, signer, connectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};
