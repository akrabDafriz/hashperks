"use client";
import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, LogOut, AlertTriangle, Loader2 } from "lucide-react";

export const ConnectWallet = () => {
  const { account, connectWallet, disconnectWallet, isLoading, error } = useWeb3();

  if (isLoading) {
    return (
      <button className="btn-secondary-light !py-2 !px-4 text-sm" disabled>
        <Loader2 className="animate-spin mr-1.5 h-4 w-4 text-slate-500" />
        Loading...
      </button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center space-x-2">
        <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-md shadow-sm">
          {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </span>
        <button
          onClick={disconnectWallet}
          className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-md shadow-sm transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={connectWallet} className="btn-primary-dark !py-2 !px-4 text-sm">
        <Wallet size={16} className="mr-1.5" />
        Connect
      </button>
      {error && (
        <p className="text-red-600 text-xs mt-1.5 flex items-center absolute bg-red-50 p-2 rounded shadow-md z-10 whitespace-nowrap">
          <AlertTriangle size={14} className="mr-1 text-red-400" />
          {error}
        </p>
      )}
    </div>
  );
};
