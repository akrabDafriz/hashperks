"use client";
import { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { getBusinesses, issuePoints } from "@/services/api";
import { CheckCircle, XCircle, Loader2, Send, ListChecks, UserPlus } from "lucide-react";

export default function IssuePointsPage() {
  const { account: adminAccount } = useWeb3();
  const [businesses, setBusinesses] = useState({});
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBusinesses, setIsFetchingBusinesses] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchBusinesses() {
      setIsFetchingBusinesses(true);
      try {
        const data = await getBusinesses();
        setBusinesses(data);
        const firstBusinessId = Object.keys(data)[0];
        if (firstBusinessId) {
          setSelectedBusinessId(firstBusinessId);
        }
      } catch (err) {
        setError("Failed to load businesses: " + err.message);
      } finally {
        setIsFetchingBusinesses(false);
      }
    }
    fetchBusinesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId || !customerAddress || !amount || parseInt(amount) <= 0) {
      setError("All fields are required. Amount must be positive.");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await issuePoints(selectedBusinessId, customerAddress, parseInt(amount));
      setSuccess(
        `Issued ${result.amount} points to ${result.customerAddress.substring(
          0,
          10
        )}... Tx: ${result.transactionHash.substring(0, 10)}...`
      );
      setCustomerAddress("");
      setAmount("");
    } catch (err) {
      setError(err.message || "Failed to issue points.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingBusinesses)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-polka-pink" />
        <p className="ml-3 text-slate-500">Loading business data...</p>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      <div className="card-modern p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Issue Loyalty Points</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="business" className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
              <ListChecks size={16} className="mr-2 text-slate-500" /> Select Business Program
            </label>
            <select
              id="business"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              required
              className="input-field-modern"
            >
              <option value="" disabled>
                -- Choose a Program --
              </option>
              {Object.entries(businesses).map(([id, details]) => (
                <option key={id} value={id}>
                  {details.name || id} ({details.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="customerAddress"
              className="block text-sm font-medium text-slate-700 mb-1 flex items-center"
            >
              <UserPlus size={16} className="mr-2 text-slate-500" />
              Customer Wallet Address
            </label>
            <input
              type="text"
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="0x..."
              required
              className="input-field-modern"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
              Amount of Points
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 100"
              required
              min="1"
              className="input-field-modern"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !selectedBusinessId}
            className="btn-primary-dark w-full flex justify-center items-center !py-3"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin mr-2 text-white" />
            ) : (
              <Send size={18} className="mr-2" />
            )}
            Issue Points
          </button>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-start">
              <XCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm flex items-start">
              <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{success}</span>
            </div>
          )}
        </form>
        <p className="text-xs text-slate-500 mt-6 text-center">
          This action uses the backend's pre-configured wallet to sign and send the transaction. Your connected wallet (
          {adminAccount ? `${adminAccount.substring(0, 6)}...` : "none"}) is not used for this 'issue' operation.
        </p>
      </div>
    </div>
  );
}
