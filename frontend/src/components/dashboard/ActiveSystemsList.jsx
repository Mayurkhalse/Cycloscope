import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from './RiskBadge';
import { formatWindSpeed, formatCoordinates, getCategoryBadgeStyle } from '../../utils/formatters';
import { ChevronRight, Wind, Navigation, ShieldCheck } from 'lucide-react';

export const ActiveSystemsList = ({ cyclones = [], selectedCycloneId, onSelectCyclone }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <span>Active Systems</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
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
                  ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    {cyclone.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                      {cyclone.category}
                    </span>
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">{cyclone.basin}</span>
                </div>
                <RiskBadge riskLevel={cyclone.riskLevel} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs my-3 text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{formatWindSpeed(cyclone.maxWindSpeedKnots)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{formatCoordinates(cyclone.currentLat, cyclone.currentLon)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Conf: <strong>{cyclone.confidenceScore}%</strong>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cyclone/${cyclone.id}`);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5 group"
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
