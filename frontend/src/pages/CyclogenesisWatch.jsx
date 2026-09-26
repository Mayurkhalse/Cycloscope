import React from 'react';
import { useCyclogenesisWatch } from '../hooks/useHistoricalData';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import { Shield, Zap } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GLOBAL_MAP_BOUNDS, CARTO_VOYAGER_URL, CARTO_ATTRIBUTION } from '../components/map/MapView';

export const CyclogenesisWatch = () => {
  const { disturbances, isLoading } = useCyclogenesisWatch();

  // Sort disturbances by formation probability descending
  const sortedDisturbances = [...disturbances].sort((a, b) => b.formationProbability48h - a.formationProbability48h);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-600" />
          <span>48-Hour Cyclogenesis Watch</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Early detection watch for emerging low-pressure disturbances & cyclogenesis formation probability in the North Indian Ocean.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map View showing Cyclogenesis Probabilities */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-800">Formation Probability Heatmap (Next 48 Hours)</h3>
          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-card relative bg-slate-100">
            <MapContainer
              center={[13.0, 80.0]}
              zoom={4.5}
              minZoom={2}
              maxZoom={12}
              maxBounds={GLOBAL_MAP_BOUNDS}
              maxBoundsViscosity={0.9}
              worldCopyJump={false}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <TileLayer
                url={CARTO_VOYAGER_URL}
                attribution={CARTO_ATTRIBUTION}
                subdomains="abcd"
                maxZoom={19}
                noWrap={true}
                bounds={GLOBAL_MAP_BOUNDS}
              />

              {sortedDisturbances.map((dist) => {
                const color = dist.formationProbability48h > 70 ? '#e11d48' : '#d97706';
                return (
                  <Circle
                    key={dist.id}
                    center={[dist.currentLat, dist.currentLon]}
                    radius={dist.formationProbability48h * 2000}
                    pathOptions={{ fillColor: color, fillOpacity: 0.25, color: color, weight: 2.5, dashArray: '4, 4' }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs p-1 font-semibold">
                        <strong className="text-slate-900 block">{dist.name}</strong>
                        <div className="text-rose-600">48h Prob: <strong>{dist.formationProbability48h}%</strong></div>
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
          <h3 className="font-extrabold text-sm text-slate-800">Candidate Disturbances</h3>

          {isLoading ? (
            <LoadingSpinner label="Evaluating atmospheric indicators..." />
          ) : (
            <div className="space-y-3">
              {sortedDisturbances.map((dist) => (
                <div key={dist.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{dist.name}</h4>
                      <span className="text-xs text-slate-500 font-semibold">{dist.basin}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      dist.formationProbability48h > 70 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {dist.formationProbability48h}% Risk
                    </span>
                  </div>

                  {/* Rationale Bullet Points ("Why") */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-xs font-bold text-ocean-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Environmental Rationale (Why):
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {dist.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 font-medium">
                          <span className="text-emerald-600 font-bold mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-1">
                    <span>Est. Development Window:</span>
                    <strong className="text-slate-900">{dist.estimatedDevelopmentTime}</strong>
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
