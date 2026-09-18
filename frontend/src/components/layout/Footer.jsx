import React from 'react';
import { ShieldAlert, ExternalLink, Info } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-8 px-4 sm:px-6 text-slate-500 text-xs mt-auto shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-800 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Decision-Support Intelligence System for North Indian Ocean
          </div>
          <p className="text-slate-500">
            Powered by Deep Learning Satellite Inference (INSAT-3D/3DR) + Statistical Climatology Fallback.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-ocean-700 hover:text-ocean-900 transition"
          >
            <span>IMD Official Advisories</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href="/about" className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Methodology & Data Limitations</span>
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-6 pt-4 text-center text-slate-400 text-[11px]">
        © 2026 NIO Cyclone Decision Support System. Experimental academic & research tool. All cyclone warnings must be cross-verified with official government authorities.
      </div>
    </footer>
  );
};
