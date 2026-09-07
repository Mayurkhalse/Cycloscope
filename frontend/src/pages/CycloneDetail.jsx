import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCycloneDetail } from '../hooks/useCycloneDetail';
import { SatelliteImagePanel } from '../components/cyclone-detail/SatelliteImagePanel';
import { IntensityPanel } from '../components/cyclone-detail/IntensityPanel';
import { TrendIndicator } from '../components/cyclone-detail/TrendIndicator';
import { EnvironmentalIndicators } from '../components/cyclone-detail/EnvironmentalIndicators';
import { FallbackBanner } from '../components/cyclone-detail/FallbackBanner';
import { MapView } from '../components/map/MapView';
import { RiskBadge } from '../components/dashboard/RiskBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { formatCoordinates, formatDateTime, getCategoryBadgeStyle } from '../utils/formatters';
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export const CycloneDetail = () => {
  const { cycloneId } = useParams();
  const { cyclone, prediction, isLoading, isError, refetch } = useCycloneDetail(cycloneId);
  const [showMethodologyCalc, setShowMethodologyCalc] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <LoadingSpinner label={`Loading system parameters for ${cycloneId}...`} />
      </div>
    );
  }

  if (isError || !cyclone) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState message="Cyclone system ID not found." onRetry={refetch} />
      </div>
    );
  }

  const categoryStyle = getCategoryBadgeStyle(cyclone.category);
  const isFallback = cyclone.source === 'fallback-climatology';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back to Dashboard Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Cyclone {cyclone.name}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                {cyclone.category}
              </span>
              <RiskBadge riskLevel={cyclone.riskLevel} />
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>Basin: <strong>{cyclone.basin}</strong></span>
              <span>•</span>
              <span>Position: <strong>{formatCoordinates(cyclone.currentLat, cyclone.currentLon)}</strong></span>
              <span>•</span>
              <span>Updated: <strong>{formatDateTime(cyclone.lastUpdated)}</strong></span>
            </div>
          </div>
        </div>

        <a
          href="https://mausam.imd.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <span>Verify with IMD Advisory</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Fallback Banner if Statistical Mode Active */}
      {isFallback && <FallbackBanner fallbackReason={cyclone.fallbackReason} />}

      {/* Top Grid: Satellite Imagery Panel & Map Trajectory View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SatelliteImagePanel
          satelliteImage={cyclone.satelliteImage}
          cycloneName={cyclone.name}
          confidenceScore={cyclone.confidenceScore}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <span>Observed vs Forecast Track</span>
            </h3>
            <span className="text-xs text-slate-400">Includes +48h Uncertainty Cone</span>
          </div>
          <MapView
            cyclones={[cyclone]}
            selectedCyclone={cyclone}
            predictionData={prediction}
            className="h-[380px] w-full rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
          />
        </div>
      </div>

      {/* Middle Grid: Trend Indicator & Intensity Panel & Environmental Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendIndicator trend={cyclone.trend} trendConfidence={cyclone.trendConfidence} />
          <IntensityPanel cyclone={cyclone} predictionTrack={prediction?.predictedTrack} />
        </div>

        <div>
          <EnvironmentalIndicators environmental={cyclone.environmental} />
        </div>
      </div>

      {/* Expandable Section: "How this was calculated" */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowMethodologyCalc(!showMethodologyCalc)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-900/60 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">How this model calculation was derived</h4>
              <p className="text-xs text-slate-400">Deep Learning (CNN + Vision Transformer) + Climatology Fallback parameters</p>
            </div>
          </div>
          {showMethodologyCalc ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showMethodologyCalc && (
          <div className="p-5 pt-0 border-t border-slate-800 text-xs text-slate-300 space-y-3 bg-slate-950/40">
            <p>
              Intensity estimates are derived from multi-channel INSAT-3D Infrared (10.8 µm) satellite images calibrated using the enhanced Dvorak technique (EDT) and ConvNeXt deep learning feature extractors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <strong className="text-cyan-300 font-semibold">Track Uncertainty Algorithm:</strong>
                <p className="text-slate-400 mt-1">Concentric probability bounds expand at 25 km per 6h forecast step based on 10-year NIO historical track error variance.</p>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                <strong className="text-emerald-300 font-semibold">Fallback Trigger Criteria:</strong>
                <p className="text-slate-400 mt-1">If ML service response time exceeds 5000ms or satellite data is missing, system reverts to NIO climatology regression.</p>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/about" className="text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                <span>Read Full System Methodology & Technical Whitepaper</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
