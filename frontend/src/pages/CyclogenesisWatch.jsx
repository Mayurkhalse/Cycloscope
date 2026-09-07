import React from 'react';
import { useCyclogenesisWatch } from '../hooks/useHistoricalData';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import { Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CyclogenesisWatch = () => {
  const { disturbances, isLoading } = useCyclogenesisWatch();

  // Sort disturbances by formation probability descending
  const sortedDisturbances = [...disturbances].sort((a, b) => b.formationProbability48h - a.formationProbability48h);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-400" />
          <span>48-Hour Cyclogenesis Watch</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Early detection watch for emerging low-pressure disturbances & cyclogenesis formation probability in the North Indian Ocean.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map View showing Cyclogenesis Probabilities */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-slate-200">Formation Probability Heatmap (Next 48 Hours)</h3>
          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <MapContainer center={[13.0, 80.0]} zoom={5} scrollWheelZoom={true} className="w-full h-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CARTO Dark" />

              {sortedDisturbances.map((dist) => {
                const color = dist.formationProbability48h > 70 ? '#f43f5e' : '#f59e0b';
                return (
                  <Circle
                    key={dist.id}
                    center={[dist.currentLat, dist.currentLon]}
                    radius={dist.formationProbability48h * 2000}
                    pathOptions={{ fillColor: color, fillOpacity: 0.3, color: color, weight: 2, dashArray: '4, 4' }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs p-1">
                        <strong className="text-cyan-300">{dist.name}</strong>
                        <div>48h Prob: <strong>{dist.formationProbability48h}%</strong></div>
                      </div>
                    </Tooltip>
                  </Circle>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right List: Candidate Disturbances sorted by probability */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Candidate Disturbances</h3>

          {isLoading ? (
            <LoadingSpinner label="Evaluating atmospheric indicators..." />
          ) : (
            <div className="space-y-3">
              {sortedDisturbances.map((dist) => (
                <div key={dist.id} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{dist.name}</h4>
                      <span className="text-xs text-slate-400 font-medium">{dist.basin}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      dist.formationProbability48h > 70 ? 'bg-rose-950 text-rose-400 border border-rose-500/50' : 'bg-amber-950 text-amber-400 border border-amber-500/50'
                    }`}>
                      {dist.formationProbability48h}% Risk
                    </span>
                  </div>

                  {/* Rationale Bullet Points ("Why") */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Environmental Rationale (Why):
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {dist.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Est. Development Window:</span>
                    <strong className="text-slate-200">{dist.estimatedDevelopmentTime}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
