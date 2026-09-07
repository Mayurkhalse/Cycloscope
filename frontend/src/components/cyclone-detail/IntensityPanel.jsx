import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Wind, Gauge, ShieldCheck } from 'lucide-react';
import { getCategoryBadgeStyle } from '../../utils/formatters';

export const IntensityPanel = ({ cyclone, predictionTrack = [] }) => {
  if (!cyclone) return null;

  const categoryStyle = getCategoryBadgeStyle(cyclone.category);

  // Build combined chart dataset (historical + forecast)
  const historicalData = (cyclone.historicalTrack || []).map((pt) => ({
    time: new Date(pt.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    historicalWind: pt.windSpeedKmh,
    predictedWind: null,
  }));

  const forecastData = (predictionTrack || cyclone.predictedTrack || []).map((pt) => ({
    time: `+${pt.forecastHour}h`,
    historicalWind: null,
    predictedWind: pt.windSpeedKmh,
  }));

  const chartData = [...historicalData, ...forecastData];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>Intensity & Wind Speed Forecast</span>
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
          {cyclone.categoryFullName || cyclone.category}
        </span>
      </div>

      {/* Wind Speed Estimate Range Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1">Estimated Wind Speed Range</div>
          <div className="text-lg font-extrabold text-cyan-300">
            {cyclone.windSpeedRangeKmh || `${cyclone.maxWindSpeedKmh - 10} - ${cyclone.maxWindSpeedKmh + 10} km/h`}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Range bounds include uncertainty margin</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium mb-1">Min Central Pressure</div>
          <div className="text-lg font-extrabold text-slate-100 flex items-center gap-1.5 font-mono">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>{cyclone.minCentralPressure} hPa</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Dvorak T-number: T4.5 / 5.0</div>
        </div>
      </div>

      {/* Recharts Wind Speed Graph */}
      <div className="pt-2">
        <div className="text-xs text-slate-400 font-medium mb-3 flex items-center justify-between">
          <span>Wind Speed Evolution Curve (km/h)</span>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Observed
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Predicted
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 10', 'dataMax + 20']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="historicalWind" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#histGrad)" name="Observed (km/h)" />
              <Area type="monotone" dataKey="predictedWind" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#predGrad)" name="Forecast (km/h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
