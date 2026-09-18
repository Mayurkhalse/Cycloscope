import React from 'react';
import { AlertOctagon, HelpCircle } from 'lucide-react';

export const FallbackBanner = ({ fallbackReason = 'satellite-ingestion-delay' }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 text-xs sm:text-sm flex items-start gap-3.5 shadow-card">
      <div className="p-2 bg-amber-500/20 rounded-xl text-amber-700 shrink-0">
        <AlertOctagon className="w-5 h-5 animate-pulse" />
      </div>
      <div className="space-y-1">
        <div className="font-extrabold text-amber-900 flex items-center gap-2">
          <span>Statistical Climatology Fallback Active</span>
          <span className="text-[10px] px-2 py-0.5 bg-amber-100 border border-amber-300 rounded font-mono font-bold text-amber-800">
            Mode: Statistical
          </span>
        </div>
        <p className="text-amber-800 text-xs leading-relaxed font-medium">
          The trained ML vision pipeline is temporarily unreachable or experiencing satellite ingestion delay ({fallbackReason}). This forecast track is currently being generated using historical statistical climatology (NIO Climatology DB v2.1).
        </p>
        <div className="pt-1 text-xs text-amber-900 flex items-center gap-1 font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Confidence metrics have been scaled down accordingly.</span>
        </div>
      </div>
    </div>
  );
};
