import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';
import { formatWindSpeed, formatCoordinates, getCategoryBadgeStyle } from '../../utils/formatters';
import { ChevronRight, Wind, Navigation, ShieldCheck } from 'lucide-react';

export const ActiveSystemsList = ({ cyclones = [], selectedCycloneId, onSelectCyclone }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <span>Active Systems</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200">
            {cyclones.length} Tracked
          </span>
        </h3>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {cyclones.map((cyclone) => {
          const isSelected = cyclone.id === selectedCycloneId;
          const categoryStyle = getCategoryBadgeStyle(cyclone.category);

          return (
            <div
              key={cyclone.id}
              onClick={() => onSelectCyclone(cyclone.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-ocean-50/70 border-ocean-400 shadow-card ring-2 ring-ocean-400/30'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    {cyclone.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${categoryStyle.bg}`}>
                      {cyclone.category}
                    </span>
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">{cyclone.basin}</span>
                </div>
                <RiskBadge riskLevel={cyclone.riskLevel} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs my-3 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-medium">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-ocean-600 shrink-0" />
                  <span>{formatWindSpeed(cyclone.maxWindSpeedKnots)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{formatCoordinates(cyclone.currentLat, cyclone.currentLon)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Conf: <strong className="text-slate-800">{cyclone.confidenceScore}%</strong>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cyclone/${cyclone.id}`);
                  }}
                  className="text-ocean-700 hover:text-ocean-900 font-bold flex items-center gap-0.5 group"
                >
                  <span>Detail View</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
