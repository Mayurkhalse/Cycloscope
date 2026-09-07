import React from 'react';
import { ShieldAlert, ExternalLink, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-ocean-950 border-t border-slate-800/80 py-8 px-4 sm:px-6 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-200 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Supplementary Decision-Support System for North Indian Ocean
          </div>
          <p className="text-slate-400">
            Powered by Deep Learning Satellite Inference (INSAT-3D/3DR) + Statistical Climatology Fallback.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>IMD Official Advisories</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a href="/about" className="flex items-center gap-1 hover:text-slate-200 transition">
            <Info className="w-3 h-3" />
            <span>Methodology & Data Limitations</span>
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800/50 mt-6 pt-4 text-center text-slate-400 text-[11px]">
        © 2026 NIO Cyclone Decision Support System. Not affiliated with IMD. All storm warnings must be cross-verified with official government authorities.
      </div>
    </footer>
  );
};
