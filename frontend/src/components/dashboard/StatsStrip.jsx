import React from 'react';
import { Activity, Clock, Flame } from 'lucide-react';
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
      <div className="bg-white p-4 rounded-2xl flex items-center gap-3.5 border border-slate-200/90 shadow-card">
        <div className="p-3 rounded-xl bg-ocean-50 text-ocean-700 border border-ocean-100">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active NIO Systems</div>
          <div className="text-xl font-extrabold text-slate-900">{activeCount} Storms Tracked</div>
        </div>
      </div>

      {/* Highest Category Storm */}
      <div className="bg-white p-4 rounded-2xl flex items-center gap-3.5 border border-slate-200/90 shadow-card">
        <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Highest Category</div>
          <div className="text-xl font-extrabold text-rose-700">
            {highestCategory ? `${highestCategory.name} (${highestCategory.category})` : 'None Active'}
          </div>
        </div>
      </div>

      {/* Last Data Refresh Time */}
      <div className="bg-white p-4 rounded-2xl flex items-center gap-3.5 border border-slate-200/90 shadow-card">
        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Last Data Refresh</div>
          <div className="text-sm font-bold text-slate-800">
            {formatDateTime(lastRefreshTime || new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
};
