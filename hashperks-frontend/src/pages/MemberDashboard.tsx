// In hashperks-frontend/src/pages/MemberDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import the custom hook useWallet and the type WalletContextType
import { useWallet, WalletContextType } from "../context/WalletContext"; 
import { ethers } from 'ethers';
// Assuming LoyaltyTokenABI might be the full artifact object
import LoyaltyTokenArtifact from '../abi/LoyaltyToken_ABI.json'; // Ensure this ABI is correct and path is correct

// Define the structure returned by the backend endpoint: GET /api/memberships/my-programs
export interface MemberProgramInfo {
  store_id: number;
  store_name: string;
  store_description: string | null;
  store_category: string | null;
  token_contract_address: string | null; // This is the store's loyalty token address
  store_owner_username: string;
  loyalty_program_id: number;
  loyalty_program_name: string;
  loyalty_program_description: string | null;
  points_conversion_rate: string; // NUMERIC from PostgreSQL often comes as string
  membership_id: number;
  join_date: string; // Timestamp string
  current_points_balance: number;
}

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    // Use the custom useWallet hook
    const walletContext = useWallet(); 
    const [memberships, setMemberships] = useState<MemberProgramInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State to store on-chain balances, mapping: tokenAddress -> balance
    const [onChainBalances, setOnChainBalances] = useState<Record<string, string>>({});
    const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({});

    // Define API_BASE_URL directly or import from a config file
    const API_BASE_URL = 'http://localhost:3000/api';

    // Extract the ABI array from the imported artifact
    const loyaltyTokenAbiArray = (LoyaltyTokenArtifact as any).abi || LoyaltyTokenArtifact;


    useEffect(() => {
        const fetchMembershipsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error("Authentication token not found.");
                    setError("User not authenticated. Please log in.");
                    return; 
                }

                const response = await fetch(`${API_BASE_URL}/stores-of-member`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `Server error: ${response.status}` }));
                    const errorMessage = errorData.message || `Failed to fetch memberships. Status: ${response.status}`;
                    console.error("API Error:", response.status, errorData);
                    throw new Error(errorMessage);
                }
                
                const data: MemberProgramInfo[] = await response.json();
                setMemberships(data);
                
            } catch (err: any) {
                console.error("Error fetching memberships:", err);
                setError(err.message || "Failed to fetch memberships.");
            } finally {
                setLoading(false);
            }
        };
        
        if (localStorage.getItem('authToken')) {
            fetchMembershipsData();
        } else {
            setError("Please log in to view your memberships.");
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]); 

    const fetchOnChainBalance = async (tokenAddress: string, userAddress: string) => {
        const provider = walletContext?.signer?.provider;

        if (!provider || !tokenAddress || !userAddress) {
            console.warn("Provider (from signer), token address, or user address missing for balance check.");
            setOnChainBalances(prev => ({ ...prev, [tokenAddress]: "Setup Error" }));
            return "N/A";
        }
        setLoadingBalances(prev => ({ ...prev, [tokenAddress]: true }));
        try {
            const tokenContract = new ethers.Contract(tokenAddress, loyaltyTokenAbiArray, provider);
            const balance = await tokenContract.balanceOf(userAddress);
            const formattedBalance = balance.toString(); 
            setOnChainBalances(prev => ({ ...prev, [tokenAddress]: formattedBalance }));
            return formattedBalance;
        } catch (err) {
            console.error(`Error fetching balance for ${tokenAddress}:`, err);
            setOnChainBalances(prev => ({ ...prev, [tokenAddress]: "Error" }));
            return "Error";
        } finally {
            setLoadingBalances(prev => ({ ...prev, [tokenAddress]: false }));
        }
    };

    return (
        // Restoring your original green and yellow theme classes
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4 w-75"> {/* Restored bg-warning */}
                {/* Card header can be styled as you prefer, keeping it simple for now or you can add back bg-primary text-white if liked */}
                <h2 className="text-center mb-4">My Memberships</h2>
                
                <div className="d-flex justify-content-end mb-4">
                    <button
                        className="btn btn-primary" // Kept primary for this action button, or change to btn-success
                        onClick={() => navigate("/member/membership-register")} 
                    >
                        + Join New Program
                    </button>
                </div>

                {loading && <p className="text-center text-muted">Loading memberships...</p>}
                {error && !loading && <p className="text-center text-danger">{error}</p>}
                
                {!loading && !error && memberships.length === 0 && (
                    <p className="text-center text-muted">You haven't joined any loyalty programs yet.</p>
                )}

                {!loading && memberships.length > 0 && (
                    <div className="list-group">
                        {memberships.map((membership) => (
                            <div
                                key={membership.membership_id}
                                // Using default list-group-item styling, adjust if needed
                                className="list-group-item list-group-item-action flex-column align-items-start mb-3 p-3 border rounded" 
                            >
                                <div className="d-flex w-100 justify-content-between">
                                    <h5 className="mb-1">{membership.store_name}</h5>
                                    <small className="text-muted">Joined: {new Date(membership.join_date).toLocaleDateString()}</small>
                                </div>
                                <p className="mb-1">
                                    <strong>Program:</strong> {membership.loyalty_program_name}
                                </p>
                                <p className="mb-1">
                                    <small className="text-muted">{membership.loyalty_program_description || "No program description."}</small>
                                </p>
                                <p className="mb-1">
                                    <strong>Points (from DB):</strong> {membership.current_points_balance}
                                </p>
                                {membership.token_contract_address && walletContext?.walletAddress && (
                                    <div className="mt-2">
                                        <strong>Points (On-Chain for {membership.token_contract_address.substring(0,6)}...{membership.token_contract_address.substring(membership.token_contract_address.length - 4)}):</strong>
                                        {loadingBalances[membership.token_contract_address] ? (
                                            <span className="ms-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            onChainBalances[membership.token_contract_address] !== undefined ? (
                                                <span className="ms-2 badge bg-info">{onChainBalances[membership.token_contract_address]}</span>
                                            ) : (
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary ms-2"
                                                    onClick={() => fetchOnChainBalance(membership.token_contract_address!, walletContext.walletAddress!)}
                                                    disabled={loadingBalances[membership.token_contract_address] || !walletContext?.signer?.provider}
                                                >
                                                    Check Balance
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                                <div className="mt-2">
                                    <button 
                                        className="btn btn-sm btn-outline-primary me-2"
                                        onClick={() => navigate(`/store/${membership.store_id}/perks`)} 
                                    >
                                        View Perks
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDashboard;
