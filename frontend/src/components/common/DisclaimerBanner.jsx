import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const DisclaimerBanner = () => {
  const { disclaimerDismissedSession, dismissDisclaimer } = useUIStore();

  if (disclaimerDismissedSession) {
    return (
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-1.5 flex items-center justify-between text-xs text-amber-800">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span><strong>Official Disclaimer:</strong> AI Decision Support Tool — Supplements, never replaces, official IMD bulletins.</span>
        </div>
        <a href="/about" className="underline font-semibold hover:text-amber-950">Read Methodology</a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white px-4 py-2 text-xs sm:text-sm shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white/20 rounded-md text-white shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="leading-snug">
            <span className="font-extrabold uppercase tracking-wide">Official Notice:</span>{' '}
            AI-driven decision-support tool. Designed to supplement — and <strong>never replace</strong> — official advisories from the <strong>India Meteorological Department (IMD)</strong>.
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/about"
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white font-semibold rounded text-xs transition border border-white/30"
          >
            Methodology
          </a>
          <button
            onClick={dismissDisclaimer}
            className="p-1 hover:bg-white/20 rounded text-white transition"
            title="Minimize for session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
