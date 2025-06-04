// In hashperks-frontend/src/pages/MembershipRegister.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useWallet } from '../context/WalletContext'; // Not directly needed for joining, auth is via token

// Define the structure for a store object fetched from the backend
interface Store {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    token_contract_address: string | null; // May not be needed for display here but good to have
    // Add other relevant store fields your /api/stores endpoint returns
}

const MembershipRegister: React.FC = () => {
    const navigate = useNavigate();
    // const { walletAddress } = useWallet(); // Only needed if wallet connection is a prerequisite for this page

    const [stores, setStores] = useState<Store[]>([]);
    const [loadingStores, setLoadingStores] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [joiningStoreId, setJoiningStoreId] = useState<number | null>(null); // To show loading on specific button
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const API_BASE_URL = "http://localhost:3000/api";

    useEffect(() => {
        const fetchStores = async () => {
            setLoadingStores(true);
            setError(null);
            setSuccessMessage(null);
            try {
                const authToken = localStorage.getItem("authToken");
                if (!authToken) {
                    setError("You must be logged in to view and join programs.");
                    // navigate('/login'); // Optional: redirect
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/stores`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // Authorization might not be strictly needed for GET /stores if it's public,
                        // but include if your endpoint requires it.
                        // 'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    const errData = await response
                        .json()
                        .catch(() => ({
                            message: `Error fetching stores: ${response.status}`,
                        }));
                    throw new Error(
                        errData.message ||
                        `Failed to fetch stores. Status: ${response.status}`
                    );
                }
                const data: Store[] = await response.json();
                setStores(data);
            } catch (err: any) {
                console.error("Error fetching stores:", err);
                setError(err.message || "Could not fetch available stores.");
            } finally {
                setLoadingStores(false);
            }
        };

        fetchStores();
    }, [navigate]);

    const handleJoinProgram = async (storeId: number, storeName: string) => {
        setJoiningStoreId(storeId); // Set loading for this specific store's button
        setError(null);
        setSuccessMessage(null);
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                setError("Authentication token not found. Please log in.");
                // navigate('/login');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/store/${storeId}/membership`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    // No body needed if the backend uses the authenticated user and storeId from path
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                // Check for specific "already joined" message if your backend sends one
                if (
                    responseData.message &&
                    responseData.message.toLowerCase().includes("already joined")
                ) {
                    setError(
                        `You have already joined the loyalty program for ${storeName}.`
                    );
                } else {
                    throw new Error(
                        responseData.message ||
                        `Failed to join program for ${storeName}. Status: ${response.status}`
                    );
                }
            } else {
                setSuccessMessage(
                    `Successfully joined the loyalty program for ${storeName}!`
                );
                // Optionally, you could remove the joined store from the list or disable its button
                // For now, we'll just show a success message and let them navigate.
                // Consider navigating to the member dashboard after a short delay or on button click
                // setTimeout(() => navigate('/member/dashboard'), 2000);
            }
        } catch (err: any) {
            console.error(`Error joining program for store ${storeId}:`, err);
            setError(err.message || "Failed to join the program. Please try again.");
        } finally {
            setJoiningStoreId(null); // Clear loading for this button
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div
                className="card bg-warning shadow p-4"
                style={{ width: "80%", maxWidth: "900px" }}
            >
                <h2 className="text-center mb-4">Join a Loyalty Program</h2>

                {loadingStores && (
                    <p className="text-center text-muted">Loading available stores...</p>
                )}

                {/* Display general error or success messages */}
                {error && (
                    <p className="alert alert-danger text-center mt-2">{error}</p>
                )}
                {successMessage && (
                    <p className="alert alert-success text-center mt-2">
                        {successMessage}
                    </p>
                )}

                {!loadingStores && !error && stores.length === 0 && (
                    <p className="text-center text-muted">
                        No stores available to join at the moment.
                    </p>
                )}

                {!loadingStores && stores.length > 0 && (
                    <div className="list-group">
                        {stores.map((store) => (
                            <div
                                key={store.id}
                                className="list-group-item flex-column align-items-start mb-3 p-3 border rounded bg-light"
                            >
                                <div className="d-flex w-100 justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1">{store.name}</h5>
                                        <p className="mb-1 text-muted small">
                                            {store.description || "No description available."}
                                        </p>
                                        {store.category && (
                                            <small className="text-muted">
                                                Category: {store.category}
                                            </small>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleJoinProgram(store.id, store.name)}
                                        disabled={joiningStoreId === store.id}
                                    >
                                        {joiningStoreId === store.id ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Joining...
                                            </>
                                        ) : (
                                            "Join Program"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    className="btn btn-outline-secondary w-100 mt-4"
                    onClick={() => navigate(-1)} // Go back to previous page
                >
                    Back
                </button>
                <button
                    className="btn btn-info w-100 mt-2"
                    onClick={() => navigate("/member/dashboard")}
                >
                    Go to My Memberships
                </button>
            </div>
        </div>
    );
};

export default MembershipRegister;
