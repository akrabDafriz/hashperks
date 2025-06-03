"use client";
import { useEffect, useState } from "react";
import { getBusinesses } from "@/services/api";
import { BusinessCard } from "@/app/(components)/business/BusinessCard";
import { Loader2, ServerCrash, ArrowRight, DatabaseZap } from "lucide-react";
import Link from "next/link";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext"; // NEW

export default function HomePage() {
  const [businesses, setBusinesses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { connectWallet, account } = useWeb3();
  const { user, business, isAuthenticated, isUser, isBusiness } = useAuth(); // NEW

  useEffect(() => {
    async function fetchBusinesses() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (err) {
        setError(err.message || "Failed to load businesses.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBusinesses();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative text-white py-20 sm:py-32 md:py-40 overflow-hidden"
        style={{ backgroundImage: "var(--hero-gradient)" }}
      >
        {/* Optional: Subtle graphic element */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-polka-pink/30 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-polka-pink/20 rounded-full filter blur-3xl opacity-40"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Unlock Loyalty Potential
          </h1>
          <p className="max-w-xl md:max-w-2xl mx-auto text-lg sm:text-xl text-slate-100/90 mb-10">
            HashPerks leverages blockchain to create transparent, secure, and efficient loyalty reward systems for
            modern businesses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <Link href="#business-listings" className="btn-on-gradient-dark text-base w-full sm:w-auto">
              Explore Programs
            </Link>
            {!isAuthenticated && ( // Show login/register if not authenticated
              <>
                <Link href="/login" className="btn-on-gradient-light text-base w-full sm:w-auto">
                  Login <ArrowRight size={18} className="ml-2" />
                </Link>
                <Link href="/register" className="btn-on-gradient-light text-base w-full sm:w-auto">
                  Register <ArrowRight size={18} className="ml-2" />
                </Link>
              </>
            )}
            {isUser && ( // Show user dashboard link if user is logged in
              <Link href="/user-dashboard" className="btn-on-gradient-light text-base w-full sm:w-auto">
                Go to My Dashboard <ArrowRight size={18} className="ml-2" />
              </Link>
            )}
            {isBusiness && ( // Show business dashboard link if business is logged in
              <Link href="/business-dashboard" className="btn-on-gradient-light text-base w-full sm:w-auto">
                Go to Business Dashboard <ArrowRight size={18} className="ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Business Listings Section */}
      <section id="business-listings" className="py-16 sm:py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center justify-center">
              <DatabaseZap size={36} className="mr-3 text-polka-pink" />
              Available Loyalty Programs
            </h2>
            <p className="mt-3 text-md text-slate-600 max-w-xl mx-auto">
              Discover businesses offering unique loyalty rewards through HashPerks.
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <Loader2 className="h-10 w-10 animate-spin text-polka-pink mb-3" />
              <p className="text-slate-500">Loading programs...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center min-h-[30vh] text-center">
              <ServerCrash className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-xl font-semibold text-red-600 mb-1">Failed to Load</h3>
              <p className="text-slate-600 text-sm mb-3">Error: {error}</p>
              <button onClick={() => window.location.reload()} className="btn-secondary-light text-sm">
                Try Again
              </button>
            </div>
          )}
          {!isLoading && !error && Object.keys(businesses).length === 0 && (
            <div className="text-center min-h-[30vh] flex flex-col justify-center items-center">
              <h3 className="text-xl font-semibold text-slate-800 mb-1">No Programs Yet</h3>
              <p className="text-slate-500 text-sm">Check back soon for new loyalty programs!</p>
            </div>
          )}
          {!isLoading && !error && Object.keys(businesses).length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Object.entries(businesses).map(([id, details]) => (
                <BusinessCard key={id} businessId={id} details={details} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

