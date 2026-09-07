import React, { useState } from 'react';
import { Camera, Layers, Eye } from 'lucide-react';
import { ConfidenceBar } from '../common/ConfidenceBar';

export const SatelliteImagePanel = ({ satelliteImage, cycloneName, confidenceScore }) => {
  const [showBoundingBox, setShowBoundingBox] = useState(true);

  if (!satelliteImage) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Latest Satellite Observation</span>
        </h3>
        <button
          onClick={() => setShowBoundingBox(!showBoundingBox)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
            showBoundingBox
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Bounding Box Overlay</span>
        </button>
      </div>

      {/* Satellite Imagery Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-video group">
        <img
          src={satelliteImage.url}
          alt={`Satellite view of Cyclone ${cycloneName}`}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
        />

        {/* Dynamic Bounding Box Overlay */}
        {showBoundingBox && (
          <div className="absolute inset-x-[25%] inset-y-[20%] border-2 border-dashed border-rose-500 rounded-lg bg-rose-500/15 backdrop-blur-[1px] flex items-start justify-between p-2 shadow-2xl animate-pulse">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-950/90 text-rose-300 border border-rose-500/40 rounded">
              System Core Detection
            </span>
            <span className="text-[10px] font-mono text-white/90 bg-black/60 px-1 rounded">
              INSAT-3D
            </span>
          </div>
        )}

        {/* Channel & Timestamp Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" />
            Channel: <strong>{satelliteImage.channel}</strong>
          </span>
          <span>Captured: {new Date(satelliteImage.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Mandatory Labeled Confidence Bar */}
      <ConfidenceBar confidenceScore={confidenceScore} label="Detection Confidence Score" />
    </div>
  );
};
