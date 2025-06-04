// In hashperks-frontend/src/pages/StoreAssignPoint.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers, BigNumberish } from "ethers"; // Import BigNumberish
import { useWallet, WalletContextType } from "../context/WalletContext"; // Ensure path is correct
import LoyaltyTokenArtifact from '../abi/LoyaltyToken_ABI.json'; // Ensure path is correct

// Helper to get user role - in a real app, this would come from your auth context or decoded JWT
const getUserInfoFromToken = (): { role: string | null; userId: number | null } => {
    const token = localStorage.getItem('authToken');
    if (!token) return { role: null, userId: null };
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decodedPayload = JSON.parse(decodedJson);
        return { role: decodedPayload.role || null, userId: decodedPayload.id || null };
    } catch (e) {
        console.error("Failed to decode token or token is invalid:", e);
        return { role: null, userId: null };
    }
};

interface StoreInfo {
    id: number;
    name: string;
    token_contract_address: string | null;
    default_loyalty_program_id: number | null;
    // Add other fields if needed
}

const StoreAssignPoint: React.FC = () => {
    const navigate = useNavigate();
    const walletContext = useWallet();
    const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
    const [customerWalletAddress, setCustomerWalletAddress] = useState("");
    const [pointsToIssue, setPointsToIssue] = useState("");
    
    const [isLoading, setIsLoading] = useState(false); // For overall page/data loading
    const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const API_BASE_URL = 'http://localhost:3000/api';
    const userInfo = getUserInfoFromToken();
    const loyaltyTokenAbiArray = (LoyaltyTokenArtifact as any).abi || LoyaltyTokenArtifact;

    useEffect(() => {
        const fetchStoreDetails = async () => {
            if (userInfo.role !== 'store_owner') {
                setStatusMessage({ type: 'error', message: "Access denied. You must be a store owner."});
                setIsLoading(false);
                // navigate('/login'); // or to a different page
                return;
            }
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setStatusMessage({ type: 'error', message: "Authentication required. Please log in."});
                setIsLoading(false);
                navigate('/login');
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/stores/my-store`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                if (!response.ok || !data.store) {
                    throw new Error(data.message || "Failed to fetch store details or no store registered.");
                }
                setStoreInfo(data.store);
            } catch (err: any) {
                console.error("Error fetching store details:", err);
                setStatusMessage({ type: 'error', message: err.message || "Could not load your store information." });
                setStoreInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStoreDetails();
    }, [navigate, userInfo.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (!walletContext?.signer || !walletContext.walletAddress) {
            setStatusMessage({ type: 'error', message: "Wallet not connected. Please connect your wallet." });
            return;
        }
        if (!storeInfo || !storeInfo.token_contract_address || !storeInfo.default_loyalty_program_id) {
            setStatusMessage({ type: 'error', message: "Store information or token contract address is missing." });
            return;
        }
        if (!ethers.isAddress(customerWalletAddress)) {
            setStatusMessage({ type: 'error', message: "Invalid customer wallet address." });
            return;
        }
        const pointsAmount = parseInt(pointsToIssue);
        if (isNaN(pointsAmount) || pointsAmount <= 0) {
            setStatusMessage({ type: 'error', message: "Points to issue must be a positive number." });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Blockchain Transaction: Issue Points
            const loyaltyTokenContract = new ethers.Contract(
                storeInfo.token_contract_address,
                loyaltyTokenAbiArray,
                walletContext.signer
            );

            console.log(`Issuing ${pointsAmount} points to ${customerWalletAddress} via contract ${storeInfo.token_contract_address}`);
            const tx = await loyaltyTokenContract.issuePoints(customerWalletAddress, pointsAmount.toString() as BigNumberish);
            const receipt = await tx.wait();
            console.log("Points issued on blockchain. Tx hash:", receipt.hash);
            const blockchainTxHash = receipt.hash;

            // 2. Backend Transaction Logging
            const authToken = localStorage.getItem('authToken');
            const transactionPayload = {
                member_wallet_address: customerWalletAddress,
                store_id: storeInfo.id,
                loyalty_program_id: storeInfo.default_loyalty_program_id,
                points_changed: pointsAmount, // Positive for earn
                transaction_type: 'earn',
                transaction_hash: blockchainTxHash,
                notes: `Issued ${pointsAmount} points to ${customerWalletAddress}`
                // user_id for the customer can be null if they are not yet registered in our backend users table
            };

            const logResponse = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(transactionPayload)
            });

            const logData = await logResponse.json();
            if (!logResponse.ok) {
                throw new Error(logData.message || "Failed to log transaction to backend after successful blockchain operation.");
            }
            console.log("Transaction logged to backend:", logData);

            setStatusMessage({ type: 'success', message: `Successfully issued ${pointsAmount} points to ${customerWalletAddress.substring(0,6)}... . Tx: ${blockchainTxHash.substring(0,10)}...` });
            setCustomerWalletAddress("");
            setPointsToIssue("");

        } catch (error: any) {
            console.error("Error assigning points:", error);
            let errMsg = error.message || "An unexpected error occurred.";
            if (error.data?.message) errMsg = error.data.message;
            else if (error.reason) errMsg = error.reason;
            setStatusMessage({ type: 'error', message: `Error: ${errMsg}` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
                <p className="text-light h3">Loading Store Information...</p>
            </div>
        );
    }

    if (userInfo.role !== 'store_owner') {
        return (
           <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
               <div className="card bg-warning shadow p-4 w-75 text-center">
                   <h3 className="text-danger">Access Denied</h3>
                   <p>You must be a store owner to assign points.</p>
                   <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Go to Login</button>
               </div>
           </div>
       );
   }

    if (!storeInfo) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
                <div className="card bg-warning shadow p-4 w-75 text-center">
                    <h3 className="mb-3">Store Not Found</h3>
                    <p>Could not load your store details. You might need to register your store first.</p>
                    {statusMessage && statusMessage.type === 'error' && <p className="text-danger mt-2">{statusMessage.message}</p>}
                    <button
                        className="btn btn-primary btn-lg mt-3"
                        onClick={() => navigate("/store-register")}
                    >
                        Register Your Store
                    </button>
                     <button className="btn btn-outline-secondary mt-2" onClick={() => navigate('/store-dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4" style={{width: '50%', maxWidth: '600px'}}>
                <h2 className="text-center mb-4">Assign Loyalty Points for {storeInfo.name}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="customerWalletAddress" className="form-label fw-bold">Customer Wallet Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="customerWalletAddress"
                            value={customerWalletAddress}
                            onChange={(e) => setCustomerWalletAddress(e.target.value)}
                            placeholder="0x..."
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="pointsToIssue" className="form-label fw-bold">Points to Issue</label>
                        <input
                            type="number"
                            className="form-control"
                            id="pointsToIssue"
                            value={pointsToIssue}
                            onChange={(e) => setPointsToIssue(e.target.value)}
                            required
                            min="1"
                            step="1"
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary px-4" disabled={isSubmitting || !walletContext?.signer}>
                            {isSubmitting ? (
                                <>
                                 <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                 Processing...
                                </>
                            ): "Assign Points"}
                        </button>
                    </div>
                    {statusMessage && (
                        <p className={`mt-3 text-center fw-bold ${statusMessage.type === 'success' ? 'text-success-emphasis' : 'text-danger'}`}>
                            {statusMessage.message}
                        </p>
                    )}
                </form>
                 <button className="btn btn-outline-dark w-100 mt-3" onClick={() => navigate('/store-dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default StoreAssignPoint;
