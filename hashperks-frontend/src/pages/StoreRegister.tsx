// In hashperks-frontend/src/pages/StoreRegister.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet, WalletContextType } from '../context/WalletContext'; // Ensure path is correct
import LoyaltyProgramFactory_ABI_File from '../abi/LoyaltyProgramFactory_ABI.json'; // Import Factory ABI
import { LOYALTY_PROGRAM_FACTORY_ADDRESS } from '../config'; // Import Factory address

// Define API service functions directly or import them
const API_BASE_URL = 'http://localhost:3000/api';

interface StoreData {
  name: string;
  description?: string;
  category?: string;
  token_contract_address: string;
}
interface StoreResponse extends StoreData { id: number; user_id: number; /* ... other fields */ }

interface LoyaltyProgramData { name: string; description?: string; points_conversion_rate?: number; }
interface LoyaltyProgramResponse extends LoyaltyProgramData { id: number; store_id: number; /* ... */ }

const createStoreAPI = async (storeData: StoreData, authToken: string): Promise<StoreResponse> => {
    const response = await fetch(`${API_BASE_URL}/stores`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`},
        body: JSON.stringify(storeData),
    });
    if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to create store'); }
    return response.json();
};

const createLoyaltyProgramAPI = async (storeId: number, programData: LoyaltyProgramData, authToken: string): Promise<LoyaltyProgramResponse> => {
    const response = await fetch(`${API_BASE_URL}/store/${storeId}/loyalty`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`},
        body: JSON.stringify(programData),
    });
    if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to create loyalty program');}
    return response.json();
};
// End API service functions

// Define the placeholder string that is checked against.
const PLACEHOLDER_FACTORY_ADDRESS_VALUE: string = "0xYourFactoryContractAddressHere";

const StoreRegister: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const walletContext = useWallet();

    const initialStoreNameFromState = location.state?.initialStoreName as string || "";

    const [storeName, setStoreName] = useState(initialStoreNameFromState);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tokenName, setTokenName] = useState(''); 
    const [tokenSymbol, setTokenSymbol] = useState(''); 
    const [businessId, setBusinessId] = useState(''); 

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const LoyaltyProgramFactory_ABI = (LoyaltyProgramFactory_ABI_File as any).abi || LoyaltyProgramFactory_ABI_File;

    useEffect(() => {
        if (!initialStoreNameFromState && !storeName) {
             console.warn("Initial store name not provided to StoreRegister page.");
        }
        if (storeName && !tokenName) {
            setTokenName(`${storeName} Rewards`);
        }
        if (storeName && !tokenSymbol) {
            setTokenSymbol(storeName.substring(0,3).toUpperCase() + "R");
        }
    }, [storeName, initialStoreNameFromState, tokenName, tokenSymbol]);


    const generateBusinessId = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!walletContext?.signer || !walletContext?.walletAddress) {
            setError('Please connect your wallet first.');
            setIsLoading(false);
            return;
        }

        if (!storeName.trim() || !tokenName.trim() || !tokenSymbol.trim()) {
            setError('Store name, token name, and token symbol are required.');
            setIsLoading(false);
            return;
        }

        // Updated check for the factory address configuration
        if (!LOYALTY_PROGRAM_FACTORY_ADDRESS || LOYALTY_PROGRAM_FACTORY_ADDRESS === PLACEHOLDER_FACTORY_ADDRESS_VALUE) {
            setError('LoyaltyProgramFactory address is not configured. Please update src/config.ts');
            setIsLoading(false);
            return;
        }
        
        const currentBusinessId = businessId.trim() || generateBusinessId(storeName);

        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setError('Authentication token not found. Please log in first.');
                setIsLoading(false);
                navigate('/login'); 
                return;
            }

            console.log(`Interacting with LoyaltyProgramFactory at: ${LOYALTY_PROGRAM_FACTORY_ADDRESS}`);
            const factoryContract = new ethers.Contract(
                LOYALTY_PROGRAM_FACTORY_ADDRESS,
                LoyaltyProgramFactory_ABI,
                walletContext.signer
            );

            const tokenDecimals = 0;
            const businessOwnerAddress = walletContext.walletAddress;

            console.log('Calling factory.deployLoyaltyProgram with:', currentBusinessId, tokenName, tokenSymbol, tokenDecimals, businessOwnerAddress);
            const tx = await factoryContract.deployLoyaltyProgram(
                currentBusinessId, tokenName, tokenSymbol, tokenDecimals, businessOwnerAddress
            );
            const receipt = await tx.wait();
            console.log('Transaction mined for token deployment via factory. Receipt:', receipt);
            
            const [deployedContractAddress] = await factoryContract.getLoyaltyProgramDetails(currentBusinessId);

            if (!deployedContractAddress || deployedContractAddress === ethers.ZeroAddress) { 
                throw new Error('Failed to get deployed token address from factory.');
            }
            console.log(`LoyaltyToken deployed via factory at: ${deployedContractAddress}`);

            console.log('Creating store in backend...');
            const newStore = await createStoreAPI(
                { name: storeName, description, category, token_contract_address: deployedContractAddress },
                authToken
            );
            console.log('Store created:', newStore);

            console.log('Creating default loyalty program...');
            await createLoyaltyProgramAPI(
                newStore.id,
                { name: `Default Program for ${storeName}`, description: `Points program for ${storeName}`, points_conversion_rate: 1 },
                authToken
            );
            console.log('Default loyalty program created.');

            setSuccessMessage(`Store "${storeName}" & Loyalty Program registered! Token: ${deployedContractAddress}. You can now go to your dashboard.`);
            // navigate('/store-dashboard'); 

        } catch (err: any) {
            console.error('Store registration process failed:', err);
            let displayError = err.message || 'An unexpected error occurred.';
            if (err.data?.message) displayError = err.data.message;
            else if (err.reason) displayError = err.reason;
            setError(displayError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Applying the green and yellow theme
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4" style={{ width: "35rem" }}> {/* Changed bg-light to bg-warning */}
                <h3 className="text-center mb-4">Register Your Store Details</h3>
                <p className="text-center text-muted small mb-3">
                    Your user account is created. Now, let's set up your store and its loyalty program.
                </p>

                {!walletContext?.walletAddress ? (
                     <p className="text-danger text-center">Please connect your wallet.</p>
                ): (
                    <p className="text-center fw-bold mb-3">
                        Owner Wallet: {walletContext.walletAddress.slice(0, 6)}...{walletContext.walletAddress.slice(-4)}
                    </p>
                )}


                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="storeName" className="form-label">Store Name</label>
                        <input type="text" id="storeName" className="form-control" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Store Description</label>
                        <textarea id="description" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="category" className="form-label">Store Category</label>
                        <input type="text" id="category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <hr/>
                    <h5 className="text-muted mb-3">Loyalty Token Setup</h5>
                     <div className="mb-3">
                        <label htmlFor="tokenName" className="form-label">Token Name</label>
                        <input type="text" id="tokenName" className="form-control" value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="e.g., MyStore Rewards" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tokenSymbol" className="form-label">Token Symbol</label>
                        <input type="text" id="tokenSymbol" className="form-control" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} placeholder="e.g., MSR (3-4 chars)" maxLength={5} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="businessId" className="form-label">Business ID (for Factory - Optional)</label>
                        <input type="text" id="businessId" className="form-control" value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="Auto-generated if empty" />
                        <small className="form-text text-muted">Unique ID for the factory to track this program. Leave empty to auto-generate.</small>
                    </div>
                    
                    {error && <p className="text-danger text-center mt-3">{error}</p>}
                    {successMessage && <p className="text-success text-center mt-3">{successMessage}</p>}
                    
                    {/* Using btn-primary for the main action button, consistent with other forms */}
                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isLoading || !walletContext?.walletAddress}>
                        {isLoading ? 'Processing...' : 'Finalize Store & Loyalty Program Setup'}
                    </button>
                </form>
                 <button
                    className="btn btn-outline-secondary w-100 mt-3"
                    onClick={() => navigate("/login")} // Or to a user dashboard if already logged in
                >
                    Back to Login / Dashboard
                </button>
            </div>
        </div>
    );
};

export default StoreRegister;
