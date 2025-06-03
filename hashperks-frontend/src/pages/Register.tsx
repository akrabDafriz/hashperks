import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const Register: React.FC = () => {
  const [role, setRole] = useState<"member" | "store">("member");
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const { connectWallet, walletAddress } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      alert("Please connect your wallet to register.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const payload = {
      name,
      email,
      wallet_address: walletAddress,
      password,
      role: role === "store" ? "business_owner" : "customer",
    };

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to register");

      const data = await res.json();
      const userId = data.id;

      if (role === "store") {
        navigate(`/store/register`, { state: { userId, storeName } });
      } else {
        navigate("/member/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-success">
      <div className="card shadow p-4 bg-warning" style={{ width: "30rem" }}>
        <h2 className="text-center mb-4">Register</h2>

        {!walletAddress ? (
          <button className="btn btn-outline-dark mb-3" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <p className="text-center fw-bold">
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Register as</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "store")}
              required
            >
              <option value="member">Member</option>
              <option value="store">Store</option>
            </select>
          </div>

          {role === "store" && (
            <div className="mb-3">
              <label htmlFor="storeName" className="form-label">Store Name</label>
              <input
                type="text"
                id="storeName"
                className="form-control"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <p>Already have an account?</p>
          <button
            className="btn btn-outline-secondary w-100"
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
