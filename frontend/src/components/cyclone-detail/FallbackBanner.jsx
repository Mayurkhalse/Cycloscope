import React from 'react';
import { AlertOctagon, HelpCircle } from 'lucide-react';

export const FallbackBanner = ({ fallbackReason = 'satellite-ingestion-delay' }) => {
  return (
    <div className="bg-amber-950/80 border border-amber-500/50 p-4 rounded-xl text-amber-200 text-xs sm:text-sm flex items-start gap-3 backdrop-blur-md shadow-lg">
      <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
        <AlertOctagon className="w-5 h-5 animate-pulse" />
      </div>
      <div className="space-y-1">
        <div className="font-bold text-amber-100 flex items-center gap-2">
          <span>Statistical Climatology Fallback Active</span>
          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 font-mono">
            Mode: Statistical
          </span>
        </div>
        <p className="text-amber-200/90 text-xs">
          The trained ML vision pipeline is temporarily unreachable or experiencing satellite ingestion delay ({fallbackReason}). This forecast track is currently being generated using historical statistical climatology (NIO Climatology DB v2.1).
        </p>
        <div className="pt-1 text-[11px] text-amber-300 flex items-center gap-1 font-medium">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Confidence metrics have been scaled down accordingly.</span>
        </div>
      </div>
    </div>
  );
};
