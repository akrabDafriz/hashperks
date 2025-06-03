import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"member" | "store">("member"); // For client-side redirection logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // For displaying errors
  const navigate = useNavigate();

  const { connectWallet, walletAddress } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Wallet connection is a good prerequisite check, but not part of the login payload itself
    // if (!walletAddress) {
    //   alert("Please connect your wallet first if it's required for your app's flow post-login.");
    //   // Depending on your app's logic, you might still allow login without a connected wallet
    //   // if the wallet is only used for specific features later.
    // }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include", // Generally not needed for JWT token auth for the login call itself
        body: JSON.stringify({
          email,
          password,
          // walletAddress and role are not expected by the backend /login endpoint
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use error message from backend if available, otherwise a generic one
        setError(data.error || data.message || `Login failed. Status: ${response.status}`);
        // alert(data.error || data.message || "Login failed"); // Replaced with setError
        return;
      }

      if (data.token) {
        // Save token to localStorage with a consistent key
        localStorage.setItem("authToken", data.token);

        // You might want to fetch user details here to get the authoritative role
        // or decode the token if it contains the role directly and is safe to do so client-side.
        // For now, using the selected role for immediate redirection:
        if (role === "member") {
          navigate("/member/dashboard");
        } else if (role === "store") { // Assuming 'store' maps to 'business_owner'
          navigate("/store/dashboard");
        } else {
          // Fallback or error if role is unexpected
          navigate("/");
        }
      } else {
        setError("Login successful, but no token received.");
        // alert("Login successful, but no token received."); // Replaced with setError
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred while logging in. Please try again.");
      // alert("An error occurred while logging in."); // Replaced with setError
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-success">
      <div className="card shadow p-4 bg-warning" style={{ width: "25rem" }}>
        <h2 className="text-center mb-4">Login</h2>

        {!walletAddress ? (
          <button className="btn btn-outline-dark mb-3 w-100" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p className="text-center fw-bold">
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Login as</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "store")}
              required
            >
              <option value="member">Member</option>
              <option value="store">Store Owner</option> {/* Changed for clarity */}
            </select>
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

          {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}


          <button type="submit" className="btn btn-primary w-100" disabled={loading || !walletAddress}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <p>Don't have an account?</p>
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
