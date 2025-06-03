"use client";
import Link from "next/link";
import { ConnectWallet } from "@/app/(components)/wallet/ConnectWallet";
import { Dot, Briefcase, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // NEW

export const Navbar = () => {
  const { user, business, isAuthenticated, logout, isUser, isBusiness } = useAuth();

  return (
    <nav className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-2xl font-bold text-slate-900 hover:text-polka-pink transition-colors"
          >
            <div className="flex items-center">
              <Dot size={32} className="text-polka-pink -mr-3" />
              <Dot size={32} className="text-polka-dark" />
            </div>
            <span className="-ml-1">HashPerks</span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm">
              Businesses
            </Link>

            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm"
                >
                  Register
                </Link>
              </>
            )}

            {isUser && (
              <Link
                href="/user-dashboard"
                className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm flex items-center"
              >
                <User size={16} className="mr-1" /> My Dashboard
              </Link>
            )}

            {isBusiness && (
              <Link
                href="/business-dashboard"
                className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm flex items-center"
              >
                <Briefcase size={16} className="mr-1" /> Business Dashboard
              </Link>
            )}

            {isAuthenticated && (
              <button
                onClick={logout}
                className="text-slate-700 hover:text-polka-pink font-medium transition-colors text-sm flex items-center"
              >
                <LogOut size={16} className="mr-1" /> Logout
              </button>
            )}

            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};
