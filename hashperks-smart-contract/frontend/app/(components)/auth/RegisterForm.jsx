// frontend/app/(components)/auth/RegisterForm.jsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, UserPlus, Mail, User, Briefcase, Wallet, LogIn } from "lucide-react";
import { useAccount } from "wagmi"; // To get connected wallet address

export const RegisterForm = ({ type, onRegisterSuccess }) => {
  const { handleUserRegister, handleBusinessRegister, loading } = useAuth();

  // CRITICAL: Call useAccount unconditionally at the top level, as per React Rules of Hooks.
  // The value will be defensively used based on 'mounted' state.
  const { address: wagmiConnectedWalletAddress } = useAccount();

  // State to track if the component has fully mounted on the client
  // This helps guard against hydration timing issues, even with dynamic(ssr: false)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []); // Empty dependency array means this runs once on client mount

  const [username, setUsername] = useState(""); // For user
  const [email, setEmail] = useState(""); // For business
  const [name, setName] = useState(""); // For business
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState(""); // Local state for the input field
  const [error, setError] = useState("");

  // Use useEffect to set walletAddress when wagmiConnectedWalletAddress changes
  // AND only after the component is confirmed as mounted.
  useEffect(() => {
    if (mounted && wagmiConnectedWalletAddress) {
      setWalletAddress(wagmiConnectedWalletAddress);
    } else if (mounted && !wagmiConnectedWalletAddress) {
      // If mounted but no wallet connected, ensure field is empty or user-inputted
      // This allows manual input if wallet not connected or disconnected
      setWalletAddress("");
    }
  }, [mounted, wagmiConnectedWalletAddress]); // Depend on mounted and wagmiConnectedWalletAddress

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    let result;

    if (type === "user") {
      result = await handleUserRegister(username, password, walletAddress);
    } else {
      // type === 'business'
      result = await handleBusinessRegister(name, email, password, walletAddress);
    }

    if (!result.success) {
      setError(result.error);
    } else {
      onRegisterSuccess && onRegisterSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{error}</div>}

      {type === "user" ? (
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="input-field-modern pl-10"
            />
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-slate-700 mb-1">
              Business Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="business-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Business Name"
                required
                className="input-field-modern pl-10"
              />
              <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label htmlFor="business-email" className="block text-sm font-medium text-slate-700 mb-1">
              Business Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="business-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="business@example.com"
                required
                className="input-field-modern pl-10"
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            className="input-field-modern pl-10"
          />
          <LogIn size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div>
        <label htmlFor="wallet-address" className="block text-sm font-medium text-slate-700 mb-1">
          Your Wallet Address (for points/ownership)
        </label>
        <div className="relative">
          <input
            type="text"
            id="wallet-address"
            // Use wagmiConnectedWalletAddress if mounted and available, otherwise use local walletAddress state
            value={mounted ? wagmiConnectedWalletAddress || walletAddress : walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Connect wallet or enter address"
            required
            className="input-field-modern pl-10"
            // Disable if component is mounted AND a wallet address is connected
            disabled={mounted && !!wagmiConnectedWalletAddress}
          />
          <Wallet size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          {/* Only show "Connected" if component is mounted and a wallet address is connected */}
          {mounted && wagmiConnectedWalletAddress && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">Connected</span>
          )}
        </div>
        {/* Only show message if component is mounted and no wallet address is connected */}
        {mounted && !wagmiConnectedWalletAddress && (
          <p className="mt-1 text-xs text-slate-500">Connect your wallet to auto-fill this field.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary-dark w-full flex justify-center items-center !py-3"
      >
        {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <UserPlus size={18} className="mr-2" />}
        {type === "user" ? "Register as User" : "Register as Business"}
      </button>
    </form>
  );
};
