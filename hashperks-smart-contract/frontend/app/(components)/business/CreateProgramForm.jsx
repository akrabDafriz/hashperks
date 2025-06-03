// frontend/app/(components)/business/CreateProgramForm.jsx
"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createLoyaltyProgram } from "@/services/api";
import { Loader2, PlusCircle, CheckCircle, XCircle, Tag, DollarSign, Hash } from "lucide-react";

export const CreateProgramForm = ({ onCreateSuccess }) => {
  const { business, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(0); // Initialize with 0, not undefined
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!business || !business.id) {
      setError("Business not authenticated or ID missing.");
      setIsLoading(false);
      return;
    }

    // NEW LOG: Log the values right before sending them to the API
    console.log("[CreateProgramForm] Submitting with values:", { name, symbol, decimals });

    // Frontend validation before sending to backend
    if (!name.trim()) {
      setError("Program Name cannot be empty.");
      setIsLoading(false);
      return;
    }
    if (!symbol.trim()) {
      setError("Token Symbol cannot be empty.");
      setIsLoading(false);
      return;
    }
    if (decimals === undefined || isNaN(parseInt(decimals))) {
      setError("Decimals must be a valid number.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createLoyaltyProgram(business.id, name, symbol, decimals, business.id); // Pass business.id as token for auth
      setSuccess(
        `Loyalty program "${result.program.name}" deployed! Contract: ${result.program.contractAddress.substring(
          0,
          10
        )}...`
      );
      setName("");
      setSymbol("");
      setDecimals(0); // Reset to 0 after success
      onCreateSuccess && onCreateSuccess(); // Notify parent to refresh business data
    } catch (err) {
      console.error("Error creating program:", err);
      setError(err.message || "Failed to create loyalty program.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!business || authLoading) {
    return <div className="text-center text-slate-500">Loading business data...</div>;
  }

  return (
    <div className="card-modern">
      <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
        <PlusCircle size={22} className="mr-2 text-polka-pink" /> Create New Loyalty Program
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm flex items-start">
            <XCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-md text-sm flex items-start">
            <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{success}</span>
          </div>
        )}

        <div>
          <label htmlFor="program-name" className="block text-sm font-medium text-slate-700 mb-1">
            Program Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="program-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Starbucks Stars"
              required
              className="input-field-modern pl-10"
            />
            <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label htmlFor="program-symbol" className="block text-sm font-medium text-slate-700 mb-1">
            Token Symbol
          </label>
          <div className="relative">
            <input
              type="text"
              id="program-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., SBUX"
              required
              className="input-field-modern pl-10"
            />
            <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div>
          <label htmlFor="program-decimals" className="block text-sm font-medium text-slate-700 mb-1">
            Decimals (usually 0 for loyalty points)
          </label>
          <div className="relative">
            <input
              type="number"
              id="program-decimals"
              value={decimals}
              onChange={(e) => setDecimals(parseInt(e.target.value))}
              min="0"
              max="18"
              required
              className="input-field-modern pl-10"
            />
            <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary-dark w-full flex justify-center items-center !py-3"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <PlusCircle size={18} className="mr-2" />}
          Deploy Program
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500 text-center">
        This action will deploy a new smart contract on the blockchain via the HashPerks platform.
      </p>
    </div>
  );
};
