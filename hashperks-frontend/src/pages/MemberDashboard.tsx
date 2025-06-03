import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

// Define the structure returned by the backend
type Membership = {
    store_id: number;
    business_name: string;
    loyalty_program_id: number;
    program_name: string;
    loyalty_program_description: string;
    token_exchange_rate: number;
    membership_id: number;
    join_date: string;
    membership_status: string;
};

const MemberDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { walletAddress } = useWallet();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberships = async () => {
            setLoading(true); // Set loading true at the start
            try {
                const token = localStorage.getItem('authToken'); // Or however you store your token
                if (!token) {
                    // Handle case where token is not available, e.g., redirect to login
                    console.error("Authentication token not found.");
                    // navigate('/login'); // Example redirect
                    throw new Error("User not authenticated.");
                }

                const res = await fetch("http://localhost:3000/api/stores-of-member", {
                    method: 'GET', // Explicitly set method, though GET is default
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add the Authorization header
                        'Content-Type': 'application/json' // Good practice, though not strictly needed for GET
                    },
                    // credentials: "include", // This is likely not needed if using Bearer token
                });

                if (!res.ok) {
                    // More detailed error handling
                    const errorData = await res.json().catch(() => ({ message: "Failed to parse error response" }));
                    console.error("API Error:", res.status, errorData);
                    throw new Error(errorData.message || `Failed to fetch memberships. Status: ${res.status}`);
                }

                const data = await res.json();
                setMemberships(data);
            } catch (err) {
                console.error("Error fetching memberships:", err);
                // Optionally, set an error state to display to the user
            } finally {
                setLoading(false);
            }
        };

        if (walletAddress) { // Or some other check to ensure user is "logged in"
            fetchMemberships();
        } else {
            // Handle scenario where user is not considered logged in (e.g. no walletAddress)
            console.log("No wallet address, user might not be logged in.");
            setLoading(false);
            // navigate('/login'); // Example redirect
        }
    }, [walletAddress, navigate]); // Added navigate to dependency array if used inside

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4 w-75">
                <h2 className="text-center mb-4">My Memberships</h2>

                <div className="d-flex justify-content-end mb-4">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/member/membership-register")}
                    >
                        Register for New Store Membership
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-muted">Loading...</p>
                ) : memberships.length > 0 ? (
                    <div className="list-group">
                        {memberships.map((membership, index) => (
                            <div
                                key={membership.membership_id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{membership.business_name}</strong> <br />
                                    <small>{membership.program_name}</small>
                                </div>
                                <span className="badge bg-primary rounded-pill">
                                    {membership.membership_status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted">No memberships found.</p>
                )}
            </div>
        </div>
    );
};

export default MemberDashboard;
