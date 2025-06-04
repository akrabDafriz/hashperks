// In hashperks-frontend/src/pages/StoreDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useWallet } from "../context/WalletContext"; // May not be directly needed if auth is via token

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

interface Store {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    token_contract_address: string | null;
    user_id: number;
    default_loyalty_program_id: number | null; // Added this
    // Add other fields your /api/stores/my-store endpoint returns for the store object
}

interface Perk {
    id: number;
    loyalty_program_id: number;
    name: string;
    description: string | null;
    points_required: number;
    is_active: boolean;
    // Add other fields your perks endpoint returns
}

const StoreDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [store, setStore] = useState<Store | null>(null);
    const [perks, setPerks] = useState<Perk[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for adding a new perk
    const [showAddPerkForm, setShowAddPerkForm] = useState(false);
    const [newPerkName, setNewPerkName] = useState("");
    const [newPerkDescription, setNewPerkDescription] = useState("");
    const [newPerkPoints, setNewPerkPoints] = useState("");
    const [isSubmittingPerk, setIsSubmittingPerk] = useState(false);

    const API_BASE_URL = 'http://localhost:3000/api';
    const userInfo = getUserInfoFromToken();

    useEffect(() => {
        const fetchStoreData = async () => {
            if (userInfo.role !== 'store_owner') {
                setError("Access denied. You must be a store owner.");
                setLoading(false);
                // navigate('/login'); // or to a different page
                return;
            }

            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                setError("Authentication required. Please log in.");
                setLoading(false);
                navigate('/login');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/stores/my-store`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    // If 404 or specific message indicates no store, it's not a hard error for this page's logic
                    if (response.status === 404 || (data.store === null && data.message)) {
                         setStore(null); // Explicitly set store to null
                         console.log(data.message || "No store registered for this user.");
                    } else {
                        throw new Error(data.message || `Failed to fetch store data. Status: ${response.status}`);
                    }
                } else {
                    if (data.store) {
                        setStore(data.store);
                    } else {
                        // This case handles if backend returns 200 with { store: null }
                        setStore(null); 
                        console.log(data.message || "No store registered for this user.");
                    }
                }
            } catch (err: any) {
                console.error("Error fetching store data:", err);
                setError(err.message || "Could not fetch store data.");
                setStore(null); // Ensure store is null on error
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [navigate, userInfo.role]); // Depend on role to re-check if it changes (e.g., after login)

    useEffect(() => {
        const fetchPerks = async () => {
            if (store && store.default_loyalty_program_id) {
                const authToken = localStorage.getItem('authToken');
                // No separate loading state for perks for now, piggybacks on main loading or re-fetches quietly
                try {
                    const response = await fetch(`${API_BASE_URL}/perks/program/${store.default_loyalty_program_id}/list`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.message || "Failed to fetch perks.");
                    }
                    const perksData: Perk[] = await response.json();
                    setPerks(perksData);
                } catch (err: any) {
                    console.error("Error fetching perks:", err);
                    setError(prevError => prevError ? `${prevError}\nFailed to load perks.` : "Failed to load perks.");
                }
            } else if (store && !store.default_loyalty_program_id) {
                console.warn("Store exists but no default loyalty program ID found to fetch perks.");
                setPerks([]); // Clear perks if no program ID
            }
        };

        if (store) { // Only fetch perks if store data is available
            fetchPerks();
        }
    }, [store]); // Re-fetch perks if the store object changes

    const handleAddPerkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store || !store.default_loyalty_program_id) {
            setError("Cannot add perk: No store or loyalty program identified.");
            return;
        }
        if (!newPerkName.trim() || !newPerkPoints.trim() || parseInt(newPerkPoints) <= 0) {
            setError("Perk name and valid positive points are required.");
            return;
        }

        setIsSubmittingPerk(true);
        setError(null);
        const authToken = localStorage.getItem('authToken');

        try {
            const response = await fetch(`${API_BASE_URL}/perks/program/${store.default_loyalty_program_id}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    name: newPerkName,
                    description: newPerkDescription,
                    points_required: parseInt(newPerkPoints),
                }),
            });
            const newPerkData = await response.json();
            if (!response.ok) {
                throw new Error(newPerkData.message || "Failed to create perk.");
            }
            setPerks(prevPerks => [...prevPerks, newPerkData]); // Add new perk to the list
            // Clear form and hide
            setNewPerkName("");
            setNewPerkDescription("");
            setNewPerkPoints("");
            setShowAddPerkForm(false);
        } catch (err: any) {
            console.error("Error adding perk:", err);
            setError(err.message || "Could not add perk.");
        } finally {
            setIsSubmittingPerk(false);
        }
    };
    
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
                <p className="text-light h3">Loading Store Dashboard...</p>
            </div>
        );
    }

    if (userInfo.role !== 'store_owner') {
         return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
                <div className="card bg-warning shadow p-4 w-75 text-center">
                    <h3 className="text-danger">Access Denied</h3>
                    <p>You must be a registered store owner to view this page.</p>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>Go to Login</button>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-success py-5">
                <div className="card bg-warning shadow p-4 w-75 text-center">
                    <h3 className="mb-3">No Store Registered</h3>
                    <p>You are logged in as a store owner, but you haven't registered a store yet.</p>
                    {error && <p className="text-danger mt-2">{error}</p>}
                    <button
                        className="btn btn-primary btn-lg mt-3"
                        onClick={() => navigate("/store/register")} // Navigate to your StoreRegister.tsx page
                    >
                        Register Your Store Now
                    </button>
                </div>
            </div>
        );
    }

    // If store exists, display dashboard
    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4" style={{width: '90%', maxWidth: '1200px'}}>
                <h1 className="text-center mb-2">{store.name}</h1>
                <p className="text-center text-muted small mb-1">({store.category || "Uncategorized"})</p>
                <p className="text-center text-muted small mb-3">{store.description || "No description."}</p>
                <p className="text-center text-muted small mb-4">Token Contract: <code className="user-select-all">{store.token_contract_address || "Not set"}</code></p>


                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Perks Offered</h3>
                    <div>
                        <button
                            className="btn btn-info me-2"
                            onClick={() => setShowAddPerkForm(!showAddPerkForm)}
                        >
                            {showAddPerkForm ? "Cancel Adding Perk" : "+ Add New Perk"}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/store/assign-point")} // Ensure this route exists and is correct
                        >
                            Assign Point to Member
                        </button>
                    </div>
                </div>

                {showAddPerkForm && (
                    <div className="card bg-light p-3 mb-4">
                        <h4>Add New Perk</h4>
                        <form onSubmit={handleAddPerkSubmit}>
                            <div className="mb-3">
                                <label htmlFor="newPerkName" className="form-label">Perk Name</label>
                                <input type="text" className="form-control" id="newPerkName" value={newPerkName} onChange={(e) => setNewPerkName(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="newPerkDescription" className="form-label">Description (Optional)</label>
                                <textarea className="form-control" id="newPerkDescription" value={newPerkDescription} onChange={(e) => setNewPerkDescription(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="newPerkPoints" className="form-label">Points Required</label>
                                <input type="number" className="form-control" id="newPerkPoints" value={newPerkPoints} onChange={(e) => setNewPerkPoints(e.target.value)} required min="1" />
                            </div>
                            {error && <p className="text-danger small">{error}</p>}
                            <button type="submit" className="btn btn-success" disabled={isSubmittingPerk}>
                                {isSubmittingPerk ? "Adding..." : "Add Perk"}
                            </button>
                        </form>
                    </div>
                )}

                {error && !showAddPerkForm && <p className="text-danger text-center mb-3">{error}</p>}

                {perks.length > 0 ? (
                    <div className="row">
                        {perks.map((perk) => (
                            <div className="col-md-4 col-lg-3 mb-4" key={perk.id}>
                                <div className="card h-100 text-center">
                                    {/* You might want a placeholder or way to upload perk images later */}
                                    {/* <img src="https://via.placeholder.com/150" className="card-img-top" alt={perk.name} style={{ objectFit: "cover", height: "120px" }} /> */}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{perk.name}</h5>
                                        <p className="card-text small flex-grow-1">{perk.description || "No description."}</p>
                                        <p className="card-text"><strong>Points: {perk.points_required}</strong></p>
                                        {/* Add Edit/Delete perk buttons here if needed */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !loading && <p className="text-center text-muted">No perks offered yet for this program.</p>
                )}
            </div>
        </div>
    );
};

export default StoreDashboard;
