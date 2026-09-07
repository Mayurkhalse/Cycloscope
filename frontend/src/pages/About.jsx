import React from 'react';
import { BookOpen, ShieldAlert, Database, Cpu, ExternalLink } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Documentation & Disclaimer
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          System Methodology & Operational Scope
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          An AI-driven decision-support dashboard designed for real-time tracking, intensity estimation, and cyclogenesis watch over the North Indian Ocean.
        </p>
      </div>

      {/* Mandatory Official Disclaimer Section */}
      <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border border-amber-500/50 p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-3 text-amber-300 font-bold text-base">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
          <span>Official Disclaimer & Usage Policy</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
          This software application is an <strong>experimental research prototype</strong> and decision-support dashboard developed under SIH2026. It is designed solely to supplement meteorological decision-making and must <strong>NEVER be used as a standalone authority</strong> for emergency evacuation, maritime routing, or public advisories.
        </p>
        <p className="text-xs text-amber-300 font-semibold">
          For official cyclone bulletins, warnings, and landfall predictions in India and neighboring regions, always refer directly to the <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">India Meteorological Department (IMD)</a>.
        </p>
      </div>

      {/* Data Pipeline & Sources */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <span>Primary Data Sources & Satellite Feeds</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-cyan-300 font-semibold text-sm">MOSDAC / INSAT-3D/3DR Satellite Imagery</strong>
            <p className="text-slate-400">
              Half-hourly Infrared (10.8 µm), Water Vapor (6.9 µm), and Visible channel satellite data ingested via MOSDAC API endpoints.
            </p>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-emerald-300 font-semibold text-sm">IBTrACS & NIO Climatology DB</strong>
            <p className="text-slate-400">
              Best track historical archives (1980–2025) for Bay of Bengal and Arabian Sea storms used for model training and fallback statistical regression.
            </p>
          </div>
        </div>
      </div>

      {/* AI Deep Learning Methodology */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <span>AI Architecture & Fallback Safeguards</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            <strong>Track & Intensity Model (v0.1):</strong> Built using ConvNeXt-backboned Convolutional Neural Networks combined with Vision Transformers (ViT) trained on TCIR satellite imagery. Output features predict 6h–48h track displacement and Dvorak T-number intensity estimates.
          </p>
          <p>
            <strong>Statistical Fallback Mechanism:</strong> If satellite data ingestion fails or the ML inference server returns an error, the backend automatically switches to a statistical climatology estimator based on historical storm motion vectors. All fallback estimates display a prominent amber banner.
          </p>
        </div>
      </div>
    </div>
  );
};
