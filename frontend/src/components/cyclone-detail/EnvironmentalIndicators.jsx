import React from 'react';
import { Thermometer, Wind, CloudRain, Zap } from 'lucide-react';

export const EnvironmentalIndicators = ({ environmental = {} }) => {
  const { seaSurfaceTemp = 29.5, verticalWindShear = 10, oceanHeatContent = 80, estimatedRainfallRate = '40 - 60 mm/hr' } = environmental;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-3">
      <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <span>Environmental Drivers</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Sea Surface Temp (SST) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-500" />
            <span>Sea Surface Temp</span>
          </div>
          <div className="text-base font-black text-slate-900">{seaSurfaceTemp} °C</div>
          <div className="text-[11px] text-emerald-700 font-bold">Warm (&gt; 28°C threshold)</div>
        </div>

        {/* Vertical Wind Shear */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <Wind className="w-3.5 h-3.5 text-ocean-600" />
            <span>Wind Shear</span>
          </div>
          <div className="text-base font-black text-slate-900">{verticalWindShear} knots</div>
          <div className="text-[11px] text-emerald-700 font-bold">Low Shear (Favorable)</div>
        </div>

        {/* Estimated Rainfall Rate */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Rainfall Rate</span>
          </div>
          <div className="text-base font-black text-slate-900">{estimatedRainfallRate}</div>
          <div className="text-[11px] text-amber-700 font-bold">Heavy Core Precipitation</div>
        </div>
      </div>
    </div>
  );
};
