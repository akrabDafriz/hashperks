// frontend/app/business-dashboard/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { CreateProgramForm } from "@/app/(components)/business/CreateProgramForm";
import { getMyBusinessPrograms } from "@/services/api";
import { Loader2, Briefcase, Info, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function BusinessDashboardPage() {
  const { business, loading: authLoading, isBusiness } = useAuth();
  const router = useRouter();
  const [isLoadingProgram, setIsLoadingProgram] = useState(true);
  const [programInfo, setProgramInfo] = useState(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // To trigger re-fetch

  useEffect(() => {
    if (!authLoading && !isBusiness) {
      router.push("/login"); // Redirect if not a logged-in business
    }
  }, [authLoading, isBusiness, router]);

  useEffect(() => {
    const fetchProgram = async () => {
      if (business && business.id) {
        setIsLoadingProgram(true);
        setError("");
        try {
          const response = await getMyBusinessPrograms(business.id);
          setProgramInfo(response.program);
        } catch (err) {
          setError(err.message || "Failed to fetch business program details.");
        } finally {
          setIsLoadingProgram(false);
        }
      }
    };
    fetchProgram();
  }, [business, refreshKey]); // Re-fetch when business or refreshKey changes

  const handleProgramCreated = () => {
    setRefreshKey((prev) => prev + 1); // Trigger re-fetch of program info
  };

  if (authLoading || !isBusiness) {
    return <div className="text-center py-10 text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
        <Briefcase size={32} className="mr-3 text-polka-pink" />
        {business?.name} Dashboard
      </h1>

      {isLoadingProgram ? (
        <div className="card-modern flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-polka-pink mr-3" />
          <p className="text-slate-600">Loading your loyalty program details...</p>
        </div>
      ) : error ? (
        <div className="card-modern bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow flex items-center">
          <Info size={20} className="mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : programInfo ? (
        <div className="card-modern">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Loyalty Program</h2>
          <div className="space-y-2 text-slate-700">
            <p>
              <strong>Name:</strong> {programInfo.name}
            </p>
            <p>
              <strong>Symbol:</strong> {programInfo.symbol}
            </p>
            <p className="break-all">
              <strong>Contract Address:</strong>{" "}
              <Link
                href={`/business/${programInfo.businessId}`}
                className="text-polka-pink hover:underline inline-flex items-center"
              >
                {" "}
                {programInfo.address} <ExternalLink size={16} className="ml-1" />
              </Link>
            </p>
            <p>
              <strong>Owner Address:</strong> {programInfo.owner}
            </p>
          </div>
          <div className="mt-6">
            <Link href={`/admin/issue-points`} className="btn-primary-dark inline-flex items-center">
              Go to Issue Points
            </Link>
          </div>
        </div>
      ) : (
        <CreateProgramForm onCreateSuccess={handleProgramCreated} />
      )}
    </div>
  );
}
