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
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, ExternalLink, RefreshCw, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

export const CycloneDetail = () => {
  const { cycloneId } = useParams();
  const { cyclone, prediction, isLoading, isError, refetch, isRefreshing, refreshPrediction } = useCycloneDetail(cycloneId);
  const [showMethodologyCalc, setShowMethodologyCalc] = useState(false);
  const [refreshNotification, setRefreshNotification] = useState(null);

  const handleTriggerPrediction = async () => {
    try {
      setRefreshNotification({ type: 'loading', message: 'Triggering live ML inference pipeline (intensity_regressor:v0.1)...' });
      await refreshPrediction();
      setRefreshNotification({
        type: 'success',
        message: `Prediction updated successfully at ${new Date().toLocaleTimeString()}! New track coordinates and uncertainty cones loaded.`,
      });
      setTimeout(() => setRefreshNotification(null), 6000);
    } catch (err) {
      setRefreshNotification({
        type: 'error',
        message: 'Could not connect to ML service. System maintained safe statistical backup.',
      });
      setTimeout(() => setRefreshNotification(null), 5000);
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Cyclone {cyclone.name}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${categoryStyle.bg}`}>
                {cyclone.category}
              </span>
              <RiskBadge riskLevel={cyclone.riskLevel} />
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>Basin: <strong className="text-slate-700">{cyclone.basin}</strong></span>
              <span>•</span>
              <span>Position: <strong className="text-slate-700">{formatCoordinates(cyclone.currentLat, cyclone.currentLon)}</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-slate-700">{formatDateTime(cyclone.lastUpdated)}</strong></span>
            </div>

            {/* AI Model & Provenance Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-md">
                🛰️ INSAT-3D 4km
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                ⚡ Intensity: ResNet-18 v0.1
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md">
                🧭 Track: LSTM v0.1
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
                🛡️ Cyclogenesis: RF v0.1
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md" title="Haversine Track Validation on IBTrACS">
                📊 Backtest: 83.9% Acc / 76.8km Track MAE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPrediction}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-ocean-700 hover:bg-ocean-800 active:scale-95 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Trigger real-time neural network intensity inference and track forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Computing Forecast...' : 'Run Live AI Prediction'}</span>
          </button>

          <a
            href="https://mausam.imd.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-ocean-700 rounded-xl text-xs font-bold border border-slate-200 transition shadow-xs"
          >
            <span>Verify with IMD Advisory</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Live Refresh Notification Banner */}
      {refreshNotification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-fade-in ${
            refreshNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : refreshNotification.type === 'loading'
              ? 'bg-ocean-50 text-ocean-900 border-ocean-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {refreshNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {refreshNotification.type === 'loading' && <Cpu className="w-4 h-4 text-ocean-600 animate-pulse shrink-0" />}
          {refreshNotification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{refreshNotification.message}</span>
        </div>
      )}

      {/* Fallback Banner if Statistical Mode Active */}
      {isFallback && <FallbackBanner fallbackReason={cyclone.fallbackReason} />}

      {/* Top Grid: Satellite Imagery Panel & Map Trajectory View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SatelliteImagePanel
          cycloneId={cyclone.id || cyclone.cycloneId}
          cycloneName={cyclone.name}
          category={cyclone.category}
          satelliteImage={cyclone.satelliteImage}
          confidenceScore={cyclone.confidenceScore}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>Observed vs Forecast Track</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Includes +48h Uncertainty Cone</span>
          </div>
          <MapView
            cyclones={[cyclone]}
            selectedCyclone={cyclone}
            predictionData={prediction}
            className="h-[380px] w-full rounded-2xl border border-slate-200/90 shadow-card overflow-hidden"
          />
        </div>
      </div>

      {/* Middle Grid: Trend Indicator & Intensity Panel & Environmental Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendIndicator
            trend={cyclone.trend}
            trendDescription={cyclone.trendDescription}
            trendConfidence={cyclone.trendConfidence || cyclone.confidenceScore}
            currentWind={cyclone.currentWindSpeedKmh || cyclone.maxWindSpeedKmh}
            predictionTrack={prediction?.predictedTrack || cyclone.predictedTrack}
          />
          <IntensityPanel cyclone={cyclone} predictionTrack={prediction?.predictedTrack} />
        </div>

        <div>
          <EnvironmentalIndicators environmental={cyclone.environmental} />
        </div>
      </div>

      {/* Expandable Section: "How this was calculated" */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <button
          onClick={() => setShowMethodologyCalc(!showMethodologyCalc)}
          className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ocean-50 text-ocean-700 rounded-xl border border-ocean-100">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">How this model calculation was derived</h4>
              <p className="text-xs text-slate-500 font-medium">Deep Learning (CNN + Vision Transformer) + Climatology Fallback parameters</p>
            </div>
          </div>
          {showMethodologyCalc ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showMethodologyCalc && (
          <div className="p-5 pt-0 border-t border-slate-100 text-xs text-slate-600 space-y-3 bg-slate-50/50 font-medium">
            <p className="leading-relaxed">
              Intensity estimates are derived from multi-channel INSAT-3D Infrared (10.8 µm) satellite images calibrated using the enhanced Dvorak technique (EDT) and ConvNeXt deep learning feature extractors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <strong className="text-ocean-900 font-bold block mb-1">Track Uncertainty Algorithm:</strong>
                <p className="text-slate-500">Concentric probability bounds expand at 25 km per 6h forecast step based on 10-year NIO historical track error variance.</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <strong className="text-emerald-900 font-bold block mb-1">Fallback Trigger Criteria:</strong>
                <p className="text-slate-500">If ML service response time exceeds 5000ms or satellite data is missing, system reverts to NIO climatology regression.</p>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/about" className="text-ocean-700 hover:text-ocean-900 font-bold flex items-center gap-1">
                <span>Read Full System Methodology & Technical Whitepaper</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
