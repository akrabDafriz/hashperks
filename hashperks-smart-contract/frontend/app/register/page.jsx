// frontend/app/register/page.jsx
"use client";
import { useState } from "react";
import dynamic from "next/dynamic"; // NEW: Import dynamic
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Dynamically import RegisterForm with SSR disabled
// This ensures useAccount() and other Wagmi hooks are only called on the client
const DynamicRegisterForm = dynamic(
  () => import("@/app/(components)/auth/RegisterForm").then((mod) => mod.RegisterForm),
  { ssr: false } // Crucial: Only render this component on the client side
);

export default function RegisterPage() {
  const [registerType, setRegisterType] = useState("user"); // 'user' or 'business'

  return (
    <div className="max-w-md mx-auto card-modern p-6 sm:p-8">
      <Link href="/" className="text-polka-pink hover:text-polka-dark inline-flex items-center mb-6 group text-sm">
        <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Register for HashPerks</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setRegisterType("user")}
          className={`px-6 py-2 rounded-l-md font-medium transition-colors ${
            registerType === "user"
              ? "bg-polka-pink text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Register as User
        </button>
        <button
          onClick={() => setRegisterType("business")}
          className={`px-6 py-2 rounded-r-md font-medium transition-colors ${
            registerType === "business"
              ? "bg-polka-pink text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Register as Business
        </button>
      </div>

      {/* Use the dynamically imported component */}
      <DynamicRegisterForm type={registerType} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-polka-pink hover:underline font-medium">
          Login here
        </Link>
      </p>
    </div>
  );
}
