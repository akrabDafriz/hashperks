// frontend/app/login/page.jsx
"use client";
import { useState } from "react";
import { LoginForm } from "@/app/(components)/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [loginType, setLoginType] = useState("user"); // 'user' or 'business'

  return (
    <div className="max-w-md mx-auto card-modern p-6 sm:p-8">
      <Link href="/" className="text-polka-pink hover:text-polka-dark inline-flex items-center mb-6 group text-sm">
        <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">Login to HashPerks</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setLoginType("user")}
          className={`px-6 py-2 rounded-l-md font-medium transition-colors ${
            loginType === "user"
              ? "bg-polka-pink text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          User Login
        </button>
        <button
          onClick={() => setLoginType("business")}
          className={`px-6 py-2 rounded-r-md font-medium transition-colors ${
            loginType === "business"
              ? "bg-polka-pink text-white shadow-md"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Business Login
        </button>
      </div>

      <LoginForm type={loginType} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link href="/register" className="text-polka-pink hover:underline font-medium">
          Register here
        </Link>
      </p>
    </div>
  );
}
