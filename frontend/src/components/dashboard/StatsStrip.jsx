import React from 'react';
import { ShieldAlert, Activity, Clock, Flame } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const StatsStrip = ({ cyclones = [], lastRefreshTime }) => {
  const activeCount = cyclones.length;

  // Determine highest category storm
  const categoriesOrder = ['SuCS', 'ESCS', 'VSCS', 'SCS', 'CS', 'DD', 'D'];
  const highestCategory = cyclones.reduce((prev, curr) => {
    const prevIdx = categoriesOrder.indexOf(prev?.category);
    const currIdx = categoriesOrder.indexOf(curr?.category);
    return currIdx !== -1 && (prevIdx === -1 || currIdx < prevIdx) ? curr : prev;
  }, cyclones[0]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Active Systems Count */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-slate-800">
        <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Active NIO Systems</div>
          <div className="text-xl font-bold text-slate-100">{activeCount} Storms Tracked</div>
        </div>
      </div>

      {/* Highest Category Storm */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-slate-800">
        <div className="p-3 rounded-lg bg-rose-500/20 text-rose-400">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Highest Category</div>
          <div className="text-xl font-bold text-rose-300">
            {highestCategory ? `${highestCategory.name} (${highestCategory.category})` : 'None Active'}
          </div>
        </div>
      </div>

      {/* Last Data Refresh Time */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3 border border-slate-800">
        <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Last Data Refresh</div>
          <div className="text-sm font-semibold text-slate-200">
            {formatDateTime(lastRefreshTime || new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
};
