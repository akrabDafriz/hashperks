"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { getBusinessContractInfo, getCustomerBalance, redeemPointsTest } from "@/services/api";
import { ethers } from "ethers";
import { ArrowLeft, Gift, CheckCircle, XCircle, Loader2, ShieldAlert, WalletCards } from "lucide-react";
import Link from "next/link";

export default function BusinessDetailPage() {
  const params = useParams();
  const { businessId } = params;
  const { account, signer } = useWeb3();

  const [businessInfo, setBusinessInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingRedeem, setIsLoadingRedeem] = useState(false);
  const [infoError, setInfoError] = useState(null);
  const [balanceError, setBalanceError] = useState(null);

  const [customerPrivateKey, setCustomerPrivateKey] = useState(""); // For insecure test

  useEffect(() => {
    if (businessId) {
      async function fetchInfo() {
        setIsLoadingInfo(true);
        setInfoError(null);
        try {
          const info = await getBusinessContractInfo(businessId);
          setBusinessInfo(info);
        } catch (err) {
          setInfoError(err.message || "Failed to load business info.");
        } finally {
          setIsLoadingInfo(false);
        }
      }
      fetchInfo();
    }
  }, [businessId]);

  useEffect(() => {
    if (businessId && account && businessInfo) {
      async function fetchBalance() {
        setIsLoadingBalance(true);
        setBalanceError(null);
        setBalance(null);
        try {
          const balData = await getCustomerBalance(businessId, account);
          setBalance(balData);
        } catch (err) {
          setBalanceError(err.message || "Failed to load balance.");
        } finally {
          setIsLoadingBalance(false);
        }
      }
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [businessId, account, businessInfo]);

  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    if (!redeemAmount || parseInt(redeemAmount) <= 0) {
      setRedeemError("Please enter a valid amount.");
      return;
    }
    if (!account) {
      setRedeemError("Connect your wallet first.");
      return;
    }
    if (!customerPrivateKey) {
      setRedeemError("Private key is required for this test. DO NOT USE IN PRODUCTION.");
      return;
    }

    setIsLoadingRedeem(true);
    setRedeemError("");
    setRedeemSuccess("");
    try {
      const amount = parseInt(redeemAmount);
      const result = await redeemPointsTest(businessId, customerPrivateKey, amount);
      setRedeemSuccess(`Redeemed ${amount} points! Tx: ${result.transactionHash.substring(0, 10)}...`);
      setRedeemAmount("");
      setCustomerPrivateKey("");
      if (businessId && account) {
        // Refresh balance
        const balData = await getCustomerBalance(businessId, account);
        setBalance(balData);
      }
    } catch (err) {
      setRedeemError(err.message || "Redemption failed.");
    } finally {
      setIsLoadingRedeem(false);
    }
  };

  // Secure redemption function - conceptual (frontend part)
  const handleSecureRedeemPoints = async (e) => {
    e.preventDefault();
    if (!redeemAmount || parseInt(redeemAmount) <= 0) {
      setRedeemError("Valid amount required.");
      return;
    }
    if (!signer) {
      setRedeemError("Wallet not connected or signer unavailable.");
      return;
    }
    if (!businessInfo?.address) {
      setRedeemError("Business contract address not found.");
      return;
    }

    setIsLoadingRedeem(true);
    setRedeemError("");
    setRedeemSuccess("");
    try {
      const abiResponse = await fetch("/LoyaltyToken_ABI.json");
      if (!abiResponse.ok) throw new Error("Failed to fetch ABI");
      const LoyaltyTokenABI = await abiResponse.json();

      const contract = new ethers.Contract(businessInfo.address, LoyaltyTokenABI, signer);
      const amountToRedeem = ethers.parseUnits(redeemAmount, 0); // Assuming 0 decimals

      const tx = await contract.redeemPoints(amountToRedeem);
      await tx.wait();
      setRedeemSuccess(`Securely redeemed ${redeemAmount} points! Tx: ${tx.hash.substring(0, 10)}...`);
      setRedeemAmount("");
      if (businessId && account) {
        // Refresh balance
        const balData = await getCustomerBalance(businessId, account);
        setBalance(balData);
      }
    } catch (err) {
      console.error("Secure Redeem Error:", err);
      setRedeemError(err.reason || err.message || "Secure redemption failed.");
    } finally {
      setIsLoadingRedeem(false);
    }
  };

  if (isLoadingInfo)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-polka-pink" />
        <p className="ml-3 text-slate-500">Loading business details...</p>
      </div>
    );

  if (infoError)
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
        <XCircle className="h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-600 text-lg">Error loading business: {infoError}</p>
        <Link href="/" className="mt-4 btn-secondary-light inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" /> Back to Businesses
        </Link>
      </div>
    );

  if (!businessInfo)
    return (
      <div className="text-center min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-slate-500 text-lg">Business not found.</p>
        <Link href="/" className="mt-4 btn-secondary-light inline-flex items-center">
          <ArrowLeft size={18} className="mr-2" /> Back to Businesses
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link href="/" className="text-polka-pink hover:text-polka-dark inline-flex items-center mb-6 group text-sm">
        <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to all businesses
      </Link>

      <section className="card-modern">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          {businessInfo.name}
          <span className="ml-2 text-xl font-mono bg-polka-pink/10 text-polka-dark px-2.5 py-1 rounded-full align-middle">
            {businessInfo.symbol}
          </span>
        </h1>
        <div className="text-xs text-slate-600 space-y-1 mt-3">
          <p className="break-all">
            <strong>Contract:</strong> <span className="font-mono">{businessInfo.address}</span>
          </p>
          <p className="break-all">
            <strong>Owner:</strong> <span className="font-mono">{businessInfo.owner}</span>
          </p>
          <p>
            <strong>Total Supply:</strong>{" "}
            <span className="font-semibold">
              {businessInfo.totalSupply} {businessInfo.symbol}
            </span>
          </p>
        </div>
      </section>

      {account ? (
        <section className="card-modern">
          <h2 className="text-xl font-semibold text-slate-800 mb-3 flex items-center">
            <WalletCards size={22} className="mr-2 text-polka-pink" /> Your Loyalty Points
          </h2>
          {isLoadingBalance && (
            <div className="flex items-center text-slate-500">
              <Loader2 size={18} className="animate-spin mr-2" />
              Loading balance...
            </div>
          )}
          {balanceError && (
            <p className="text-red-600 text-sm flex items-center">
              <XCircle size={16} className="mr-1" />
              Error: {balanceError}
            </p>
          )}
          {balance && (
            <p className="text-2xl font-bold text-polka-pink">
              {balance.balance} <span className="text-lg font-medium">{balance.tokenSymbol}</span>
            </p>
          )}
          {!isLoadingBalance && !balance && !balanceError && (
            <p className="text-slate-500 text-sm">No balance found for this program.</p>
          )}
        </section>
      ) : (
        <div className="bg-polka-pink/5 border-l-4 border-polka-pink text-slate-700 p-4 rounded-md shadow">
          <p className="font-medium">
            Connect your wallet to view your points balance and access redemption options for this program.
          </p>
        </div>
      )}

      {account && (
        <section className="card-modern">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <Gift size={22} className="mr-2 text-polka-pink" />
            Redeem Points
          </h2>
          {/* Secure Redemption Form */}
          <form onSubmit={handleSecureRedeemPoints} className="space-y-4 mb-8 pb-8 border-b border-slate-200">
            <div>
              <label htmlFor="redeemAmountSecure" className="block text-sm font-medium text-slate-700">
                Amount to Redeem ({businessInfo.symbol})
              </label>
              <input
                type="number"
                id="redeemAmountSecure"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="e.g., 100"
                required
                className="input-field-modern"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingRedeem || !account || !signer}
              className="btn-primary-dark w-full flex justify-center items-center"
            >
              {isLoadingRedeem ? (
                <Loader2 size={20} className="animate-spin mr-2 text-white" />
              ) : (
                <Gift size={18} className="mr-2" />
              )}
              Redeem Securely (via Wallet)
            </button>
          </form>

          {/* Insecure Test Redemption Form - Keep for testing if needed, but visually de-emphasize */}
          <details className="mt-6 group">
            <summary className="text-xs text-slate-500 cursor-pointer group-hover:text-polka-pink">
              Advanced: Test Insecure Redemption (Dev Only)
            </summary>
            <div className="mt-3 bg-red-50 border border-red-200 p-4 rounded-md">
              <p className="text-sm font-semibold text-red-700 flex items-center mb-2">
                <ShieldAlert size={18} className="mr-2" /> DANGER ZONE: For Testing Only
              </p>
              <p className="text-xs text-red-600 mb-3">
                This method sends your private key to the server. Never use this with a real wallet or in a production
                environment.
              </p>
              <form onSubmit={handleRedeemPoints} className="space-y-3">
                <div>
                  <label htmlFor="customerPrivateKey" className="block text-xs font-medium text-slate-600">
                    Your Private Key (FOR TESTING ONLY)
                  </label>
                  <input
                    type="password"
                    id="customerPrivateKey"
                    value={customerPrivateKey}
                    onChange={(e) => setCustomerPrivateKey(e.target.value)}
                    placeholder="Test private key"
                    className="input-field-modern text-xs"
                  />
                </div>
                <button type="submit" disabled={isLoadingRedeem || !account} className="btn-danger w-full text-sm py-2">
                  {isLoadingRedeem ? "Processing..." : `Redeem (Insecure Test)`}
                </button>
              </form>
            </div>
          </details>

          {redeemError && (
            <p className="bg-red-50 text-red-700 p-3 rounded-md text-sm mt-3 flex items-start">
              <XCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>{redeemError}</span>
            </p>
          )}
          {redeemSuccess && (
            <p className="bg-green-50 text-green-700 p-3 rounded-md text-sm mt-3 flex items-start">
              <CheckCircle size={16} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>{redeemSuccess}</span>
            </p>
          )}
        </section>
      )}
    </div>
  );
}
