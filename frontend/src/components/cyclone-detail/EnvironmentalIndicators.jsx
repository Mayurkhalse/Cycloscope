import React from 'react';
import { Thermometer, Wind, CloudRain, Zap } from 'lucide-react';

export const EnvironmentalIndicators = ({ environmental = {} }) => {
  const { seaSurfaceTemp = 29.5, verticalWindShear = 10, oceanHeatContent = 80, estimatedRainfallRate = '40 - 60 mm/hr' } = environmental;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
      <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        <span>Environmental Drivers</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Sea Surface Temp (SST) */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <span>Sea Surface Temp</span>
          </div>
          <div className="text-base font-bold text-slate-100">{seaSurfaceTemp} °C</div>
          <div className="text-[10px] text-emerald-400 font-medium">Warm (&gt; 28°C threshold)</div>
        </div>

        {/* Vertical Wind Shear */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wind Shear</span>
          </div>
          <div className="text-base font-bold text-slate-100">{verticalWindShear} knots</div>
          <div className="text-[10px] text-emerald-400 font-medium">Low Shear (Favorable)</div>
        </div>

        {/* Estimated Rainfall Rate */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rainfall Rate</span>
          </div>
          <div className="text-base font-bold text-slate-100">{estimatedRainfallRate}</div>
          <div className="text-[10px] text-amber-400 font-medium">Heavy Core Precipitation</div>
        </div>
      </div>
    </div>
  );
};
