import Link from "next/link";
import { Store, KeyRound, Layers, UserCircle, ArrowRight } from "lucide-react";

export const BusinessCard = ({ businessId, details }) => {
  return (
    <div className="card-modern group hover:border-polka-pink">
      {" "}
      {/* Using card-modern and adding hover border */}
      <div className="flex items-center mb-4">
        <div className="p-2.5 bg-polka-pink/10 rounded-lg mr-3">
          <Store size={22} className="text-polka-pink" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 leading-tight">{details.name || businessId}</h3>
      </div>
      <div className="space-y-2 text-xs mb-5">
        <p className="text-slate-600 flex items-center">
          <Layers size={14} className="mr-2 text-slate-400 flex-shrink-0" />
          Symbol:{" "}
          <span className="ml-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
            {details.symbol || "N/A"}
          </span>
        </p>
        <p className="text-slate-600 flex items-start">
          <KeyRound size={14} className="mr-2 mt-px text-slate-400 flex-shrink-0" />
          <span className="font-mono break-all">{details.address}</span>
        </p>
        <p className="text-slate-600 flex items-start">
          <UserCircle size={14} className="mr-2 mt-px text-slate-400 flex-shrink-0" />
          <span className="font-mono break-all">{details.owner}</span>
        </p>
      </div>
      <Link
        href={`/business/${businessId}`}
        className="btn-secondary-light w-full text-sm group-hover:bg-polka-pink group-hover:text-white group-hover:border-polka-pink transition-colors"
      >
        View Program <ArrowRight size={16} className="ml-auto transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
};
