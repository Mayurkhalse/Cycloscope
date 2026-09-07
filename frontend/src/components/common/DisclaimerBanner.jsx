import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const DisclaimerBanner = () => {
  const { disclaimerDismissedSession, dismissDisclaimer } = useUIStore();

  if (disclaimerDismissedSession) {
    return (
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span><strong>Official Disclaimer:</strong> AI Decision Support Tool — Supplements, never replaces, IMD bulletins.</span>
        </div>
        <a href="/about" className="underline hover:text-amber-200">Read Methodology</a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 border-b border-amber-500/40 px-4 py-2.5 text-amber-200 text-xs sm:text-sm backdrop-blur-md transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold text-amber-100">IMPORTANT NOTICE:</span>{' '}
            This system provides experimental AI-driven satellite track & intensity estimates for the North Indian Ocean. It is designed purely as a <strong>decision-support tool</strong> to supplement — and <strong>never replace</strong> — official advisories issued by the <strong>India Meteorological Department (IMD)</strong>.
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/about"
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs transition"
          >
            Methodology
          </a>
          <button
            onClick={dismissDisclaimer}
            className="p-1 hover:bg-amber-800/50 rounded text-amber-400 hover:text-white transition"
            title="Minimize for session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
