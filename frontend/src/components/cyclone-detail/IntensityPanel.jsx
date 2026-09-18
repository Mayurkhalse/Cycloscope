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
    time: `+${pt.forecastHour ?? pt.leadTimeHours ?? 6}h`,
    historicalWind: null,
    predictedWind: pt.windSpeedKmh,
  }));

  const chartData = [...historicalData, ...forecastData];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Wind className="w-4 h-4 text-ocean-600" />
          <span>Intensity & Wind Speed Forecast</span>
        </h3>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${categoryStyle.bg}`}>
          {cyclone.categoryFullName || cyclone.category}
        </span>
      </div>

      {/* Wind Speed Estimate Range Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-ocean-50/60 p-3.5 rounded-xl border border-ocean-100">
          <div className="text-xs text-slate-600 font-semibold mb-1">Estimated Wind Speed Range</div>
          <div className="text-xl font-black text-ocean-900">
            {cyclone.windSpeedRangeKmh || `${cyclone.maxWindSpeedKmh - 10} - ${cyclone.maxWindSpeedKmh + 10} km/h`}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Includes uncertainty bounds</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="text-xs text-slate-600 font-semibold mb-1">Min Central Pressure</div>
          <div className="text-xl font-black text-slate-900 flex items-center gap-1.5 font-mono">
            <Gauge className="w-4 h-4 text-amber-600" />
            <span>{cyclone.minCentralPressure} hPa</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Dvorak Estimate: T4.5 / 5.0</div>
        </div>
      </div>

      {/* Recharts Wind Speed Graph */}
      <div className="pt-2">
        <div className="text-xs text-slate-600 font-semibold mb-3 flex items-center justify-between">
          <span>Wind Speed Evolution Curve (km/h)</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-ocean-700">
              <span className="w-2.5 h-2.5 rounded-full bg-ocean-600" /> Observed
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Forecast
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontWeight={500} />
              <YAxis stroke="#64748b" fontSize={11} fontWeight={500} domain={['dataMin - 10', 'dataMax + 20']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontWeight: '600'
                }}
              />
              <Area type="monotone" dataKey="historicalWind" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#histGrad)" name="Observed (km/h)" />
              <Area type="monotone" dataKey="predictedWind" stroke="#e11d48" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#predGrad)" name="Forecast (km/h)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
