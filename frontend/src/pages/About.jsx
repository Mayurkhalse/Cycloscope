import React from 'react';
import { BookOpen, ShieldAlert, Database, Cpu } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ocean-50 border border-ocean-200 text-ocean-700 rounded-full text-xs font-bold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Technical Documentation & Disclaimer
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          System Methodology & Operational Scope
        </h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          An AI-driven decision-support dashboard designed for real-time tracking, intensity estimation, and cyclogenesis watch over the North Indian Ocean.
        </p>
      </div>

      {/* Mandatory Official Disclaimer Section */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-3 shadow-card">
        <div className="flex items-center gap-3 text-amber-900 font-extrabold text-base">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          <span>Official Disclaimer & Usage Policy</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
          This software application is an <strong>experimental decision-support prototype</strong> developed under SIH2026. It is designed solely to supplement meteorological analysis and must <strong>NEVER be used as a standalone authority</strong> for emergency evacuation, maritime routing, or official public warnings.
        </p>
        <p className="text-xs text-amber-900 font-bold">
          For official cyclone bulletins, warnings, and landfall predictions in India and neighboring coastal zones, always refer directly to the <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">India Meteorological Department (IMD)</a>.
        </p>
      </div>

      {/* Data Pipeline & Sources */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-ocean-600" />
          <span>Primary Data Sources & Satellite Feeds</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-ocean-900 font-extrabold text-sm block">MOSDAC / INSAT-3D/3DR Satellite Imagery</strong>
            <p className="text-slate-500 font-medium">
              Half-hourly Infrared (10.8 µm), Water Vapor (6.9 µm), and Visible channel satellite data ingested via MOSDAC API endpoints.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-emerald-900 font-extrabold text-sm block">IBTrACS & NIO Climatology DB</strong>
            <p className="text-slate-500 font-medium">
              Best track historical archives (1980–2025) for Bay of Bengal and Arabian Sea storms used for model training and fallback statistical regression.
            </p>
          </div>
        </div>
      </div>

      {/* AI Deep Learning Methodology */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-600" />
          <span>AI Architecture & Fallback Safeguards</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-medium">
          <p>
            <strong className="text-slate-900 font-bold">Track & Intensity Model (v0.1):</strong> Built using ConvNeXt-backboned Convolutional Neural Networks combined with Vision Transformers (ViT) trained on TCIR satellite imagery. Output features predict 6h–48h track displacement and Dvorak T-number intensity estimates.
          </p>
          <p>
            <strong className="text-slate-900 font-bold">Statistical Fallback Mechanism:</strong> If satellite data ingestion fails or the ML inference server returns an error, the backend automatically switches to a statistical climatology estimator based on historical storm motion vectors. All fallback estimates display a prominent amber banner.
          </p>
        </div>
      </div>
    </div>
  );
};
