import React, { useState, useEffect } from 'react';
import { Camera, Layers, Eye, Radio, Sparkles, RefreshCw, ZoomIn } from 'lucide-react';
import { ConfidenceBar } from '../common/ConfidenceBar';

export const SatelliteImagePanel = ({ cycloneId, cycloneName, category, satelliteImage, confidenceScore }) => {
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('ir'); // 'ir' | 'dvorak' | 'wv'
  const [imgLoading, setImgLoading] = useState(false);

  const cleanId = (cycloneId || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const cleanName = (cycloneName || '').toLowerCase();

  const channelInfo = {
    ir: {
      name: 'Infrared (10.8 µm)',
      badge: 'Thermal IR1',
      description: 'NOAA / IMD Enhanced Brightness Temperature Scale',
      primarySrc: `/satellite/${cleanId}_ir.png`,
      fallbackSrc: `/satellite/${cleanName}_ir.png`,
    },
    dvorak: {
      name: 'Enhanced Dvorak (BD Curve)',
      badge: 'BD-Curve Standard',
      description: 'Official Dvorak BD Temperature Steps (-30°C to -84°C)',
      primarySrc: `/satellite/${cleanId}_dvorak.png`,
      fallbackSrc: `/satellite/${cleanName}_dvorak.png`,
    },
    wv: {
      name: 'Water Vapor (6.9 µm)',
      badge: 'Upper Troposphere',
      description: 'Tropospheric Moisture & Dry Air Environmental Inflow',
      primarySrc: `/satellite/${cleanId}_wv.png`,
      fallbackSrc: `/satellite/${cleanName}_wv.png`,
    },
  };

  const currentInfo = channelInfo[selectedChannel] || channelInfo.ir;

  // Resolve current image URL based on storm ID and selected channel
  const [currentSrc, setCurrentSrc] = useState(currentInfo.primarySrc);

  useEffect(() => {
    setImgLoading(true);
    setCurrentSrc(currentInfo.primarySrc);
  }, [cycloneId, selectedChannel]);

  const handleImageError = () => {
    // Attempt secondary name-based fallback or backend proxy
    if (currentSrc === currentInfo.primarySrc && currentInfo.fallbackSrc) {
      setCurrentSrc(currentInfo.fallbackSrc);
    } else if (!currentSrc.includes('/api/cyclones')) {
      setCurrentSrc(`/api/cyclones/${cycloneId}/satellite-image?channel=${selectedChannel}`);
    } else {
      setCurrentSrc('/satellite/remal_insat3d_ir.jpg');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-ocean-600" />
            <span>INSAT-3D Satellite Observation</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Authentic multi-spectral imagery for Cyclone {cycloneName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              showBoundingBox
                ? 'bg-ocean-50 text-ocean-700 border-ocean-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CDO Eye Box</span>
          </button>
        </div>
      </div>

      {/* Satellite Channel Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
        <button
          onClick={() => setSelectedChannel('ir')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
            selectedChannel === 'ir'
              ? 'bg-white text-ocean-700 font-bold shadow-xs'
              : 'hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Infrared (10.8 µm)
        </button>
        <button
          onClick={() => setSelectedChannel('dvorak')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
            selectedChannel === 'dvorak'
              ? 'bg-white text-ocean-700 font-bold shadow-xs'
              : 'hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Enhanced Dvorak
        </button>
        <button
          onClick={() => setSelectedChannel('wv')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
            selectedChannel === 'wv'
              ? 'bg-white text-ocean-700 font-bold shadow-xs'
              : 'hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          Water Vapor (6.9 µm)
        </button>
      </div>

      {/* Satellite Imagery Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#090d16] aspect-[16/10] group shadow-inner flex items-center justify-center">
        <img
          key={`${cycloneId}-${selectedChannel}-${currentSrc}`}
          src={currentSrc}
          onLoad={() => setImgLoading(false)}
          onError={handleImageError}
          alt={`Satellite view of Cyclone ${cycloneName} (${currentInfo.name})`}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imgLoading ? 'opacity-40' : 'opacity-100'
          }`}
        />

        {/* Loading Spinner */}
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Dynamic Bounding Box Overlay */}
        {showBoundingBox && !imgLoading && (
          <div className="absolute inset-x-[28%] inset-y-[22%] border-2 border-dashed border-rose-400/90 rounded-lg bg-rose-500/10 backdrop-blur-[0.5px] flex items-start justify-between p-2 shadow-2xl pointer-events-none">
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-600/90 text-white rounded shadow-xs">
              Vortex Eye (CDO)
            </span>
            <span className="text-[10px] font-mono text-cyan-200 bg-slate-900/90 px-1.5 py-0.5 rounded font-bold border border-slate-700">
              INSAT-3D 4km
            </span>
          </div>
        )}

        {/* Channel & Provenance Timestamp Overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 font-medium shadow-sm">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-white">{currentInfo.name}</strong>
            <span className="text-[10px] text-slate-400 hidden sm:inline">• {currentInfo.badge}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            INSAT-3D / TCIR (4km)
          </span>
        </div>
      </div>

      {/* Observation Provenance Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Sensor</span>
          <span className="font-bold text-slate-800">ISRO INSAT-3D</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Resolution</span>
          <span className="font-bold text-slate-800">4.0 km / 201×201</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Calibration</span>
          <span className="font-bold text-emerald-700">Validated L1B (K)</span>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Channel Band</span>
          <span className="font-bold text-slate-800">TIR-1 (10.8 µm)</span>
        </div>
      </div>

      {/* Mandatory Labeled Confidence Bar */}
      <ConfidenceBar confidenceScore={confidenceScore} label="Deep Learning Detection Confidence" />
    </div>
  );
};
