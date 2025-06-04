// In hashperks-frontend/src/pages/Register.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext"; // Assuming this is the correct path

const Register: React.FC = () => {
  const [role, setRole] = useState<"user" | "store_owner">("user"); // Updated roles
  const [storeNameInput, setStoreNameInput] = useState(""); // For the store name if role is store_owner
  const [username, setUsername] = useState(""); // Changed from 'name' to 'username'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // For displaying errors
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { connectWallet, walletAddress } = useWallet();

  const API_BASE_URL = 'http://localhost:3000/api'; // Or from your config

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    if (!walletAddress) {
      setError("Please connect your wallet to register.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    if (role === "store_owner" && !storeNameInput.trim()) {
        setError("Store name is required when registering as a store owner.");
        setIsLoading(false);
        return;
    }

    const payload = {
      username, // Changed from name
      email,
      wallet_address: walletAddress,
      password,
      role: role, // Directly use the state role ('user' or 'store_owner')
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to register. Please try again.");
      }
      
      // Assuming registration is successful, backend returns user data including id
      // and potentially an auth token if auto-login is implemented.
      // For now, we'll just navigate. If auto-login, save token here.
      console.log("Registration successful:", responseData);


      if (role === "store_owner") {
        // Navigate to StoreRegister, passing the storeName from the form
        // and the newly created user's ID (responseData.user.id or responseData.id)
        // Also, the user needs to log in to get an authToken for the next step.
        // For simplicity, let's assume they need to log in separately.
        alert("User registration successful! Please log in and then register your store details.");
        navigate("/login"); 
        // Or, if you want to pass data to StoreRegister directly after this:
        // navigate(`/store-register`, { state: { initialStoreName: storeNameInput } });
        // However, StoreRegister will need an authToken, so login is usually first.
      } else { // role === "user"
        alert("Registration successful! Please log in.");
        navigate("/login"); // Redirect to login after successful user registration
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-success">
      <div className="card shadow p-4 bg-warning" style={{ width: "30rem" }}>
        <h2 className="text-center mb-4">Register</h2>

        {!walletAddress ? (
          <button className="btn btn-outline-dark mb-3 w-100" onClick={connectWallet} type="button">
            Connect Wallet
          </button>
        ) : (
          <p className="text-center fw-bold mb-3">
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Register as</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as "user" | "store_owner")}
              required
            >
              <option value="user">User (Member)</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          {role === "store_owner" && (
            <div className="mb-3">
              <label htmlFor="storeNameInput" className="form-label">Store Name</label>
              <input
                type="text"
                id="storeNameInput"
                className="form-control"
                placeholder="Enter your store's name"
                value={storeNameInput}
                onChange={(e) => setStoreNameInput(e.target.value)}
                required={role === "store_owner"}
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label> {/* Changed from Full Name */}
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger text-center mb-3">{error}</p>}

          <button type="submit" className="btn btn-success w-100" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p className="mb-1">Already have an account?</p>
          <button
            className="btn btn-outline-secondary w-100"
            type="button"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
