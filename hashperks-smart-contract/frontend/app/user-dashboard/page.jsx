// frontend/app/user-dashboard/page.jsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getBusinesses, subscribeToProgram, getUserSubscribedPrograms, getCustomerBalance } from "@/services/api";
import { Loader2, User, CheckCircle, XCircle, PlusCircle, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function UserDashboardPage() {
  const { user, loading: authLoading, isUser } = useAuth();
  const router = useRouter();
  const [allBusinesses, setAllBusinesses] = useState({});
  const [subscribedPrograms, setSubscribedPrograms] = useState([]);
  const [programBalances, setProgramBalances] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeError, setSubscribeError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch

  useEffect(() => {
    if (!authLoading && !isUser) {
      router.push("/login"); // Redirect if not a logged-in user
    }
  }, [authLoading, isUser, router]);

  const fetchAllData = useCallback(async () => {
    if (!user || !user.id || !user.walletAddress) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setError("");
    try {
      // Fetch all available businesses
      const businessesData = await getBusinesses();
      setAllBusinesses(businessesData);

      // Fetch user's subscribed programs
      const subscribedData = await getUserSubscribedPrograms(user.id);
      setSubscribedPrograms(subscribedData.subscribedPrograms);

      // Fetch balances for subscribed programs
      const balances = {};
      for (const program of subscribedData.subscribedPrograms) {
        if (program.address && user.walletAddress) {
          // Ensure contract address exists
          try {
            const balanceData = await getCustomerBalance(program.id, user.walletAddress);
            balances[program.id] = balanceData.balance;
          } catch (balanceErr) {
            console.warn(`Could not fetch balance for ${program.name}:`, balanceErr.message);
            balances[program.id] = "Error";
          }
        } else {
          balances[program.id] = "N/A"; // No contract address or wallet
        }
      }
      setProgramBalances(balances);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoadingData(false);
    }
  }, [user, refreshKey]); // Depend on user and refreshKey

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSubscribe = async (businessId) => {
    setSubscribeMessage("");
    setSubscribeError("");
    try {
      await subscribeToProgram(businessId, user.id); // Pass user.id as token for auth
      setSubscribeMessage(`Successfully subscribed to this program!`);
      setRefreshKey((prev) => prev + 1); // Trigger re-fetch of all data
    } catch (err) {
      setSubscribeError(err.message || "Failed to subscribe.");
    }
  };

  if (authLoading || !isUser) {
    return <div className="text-center py-10 text-slate-500">Loading...</div>;
  }

  const availableBusinesses = Object.entries(allBusinesses).filter(
    ([id, details]) => !subscribedPrograms.some((p) => p.id === id)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
        <User size={32} className="mr-3 text-polka-pink" />
        {user?.username} Dashboard
      </h1>
      <p className="text-slate-600 text-sm">
        Your Wallet Address: <span className="font-mono bg-slate-100 px-2 py-1 rounded-md">{user?.walletAddress}</span>
      </p>

      {isLoadingData ? (
        <div className="card-modern flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-polka-pink mr-3" />
          <p className="text-slate-600">Loading your loyalty programs...</p>
        </div>
      ) : error ? (
        <div className="card-modern bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow flex items-center">
          <XCircle size={20} className="mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Subscribed Programs */}
          <div className="card-modern">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                <CheckCircle size={22} className="mr-2 text-green-600" /> Your Subscribed Programs
              </h2>
              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="btn-secondary-light !py-1.5 !px-3 text-sm"
              >
                <RefreshCw size={16} className="mr-1.5" /> Refresh
              </button>
            </div>

            {subscribedPrograms.length === 0 ? (
              <p className="text-slate-600">You are not subscribed to any loyalty programs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscribedPrograms.map((program) => (
                  <div key={program.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800">
                      {program.name} ({program.symbol})
                    </h3>
                    <p className="text-sm text-slate-600 break-all">Contract: {program.address}</p>
                    <p className="text-lg font-bold text-polka-pink mt-2">
                      Balance:{" "}
                      {programBalances[program.id] !== undefined ? (
                        programBalances[program.id]
                      ) : (
                        <Loader2 size={16} className="inline animate-spin" />
                      )}{" "}
                      {program.symbol}
                    </p>
                    <Link
                      href={`/business/${program.id}`}
                      className="text-sm text-polka-pink hover:underline mt-2 inline-flex items-center"
                    >
                      View Program Details <ExternalLink size={14} className="ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Programs to Subscribe */}
          {availableBusinesses.length > 0 && (
            <div className="card-modern">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                <PlusCircle size={22} className="mr-2 text-polka-pink" /> Available Programs to Subscribe
              </h2>
              {subscribeError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm flex items-start mb-4">
                  <XCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{subscribeError}</span>
                </div>
              )}
              {subscribeMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-md text-sm flex items-start mb-4">
                  <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" /> <span>{subscribeMessage}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableBusinesses.map(([id, details]) => (
                  <div
                    key={id}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {details.name} ({details.symbol})
                      </h3>
                      <p className="text-sm text-slate-600 break-all">Contract: {details.address}</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe(id)}
                      className="btn-secondary-light mt-3 self-start !py-1.5 !px-3 text-sm"
                    >
                      Subscribe
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
