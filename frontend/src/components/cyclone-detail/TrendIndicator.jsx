import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';

export const TrendIndicator = ({ trend = 'strengthening', trendConfidence = 85 }) => {
  const isStrengthening = trend === 'strengthening';
  const isWeakening = trend === 'weakening';

  let icon = <Minus className="w-5 h-5 text-amber-400" />;
  let colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  let titleText = 'Steady Intensity Trend';

  if (isStrengthening) {
    icon = <TrendingUp className="w-5 h-5 text-rose-400 animate-bounce" />;
    colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    titleText = 'Rapid Intensification Risk';
  } else if (isWeakening) {
    icon = <TrendingDown className="w-5 h-5 text-emerald-400" />;
    colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    titleText = 'Gradual Weakening Trend';
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClass} flex items-center justify-between`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/10">{icon}</div>
        <div>
          <div className="font-bold text-sm text-slate-100">{titleText}</div>
          <div className="text-xs text-slate-400">
            {isStrengthening ? 'Expected wind speed increase +15 to +25 km/h over next 12h' : 'Expected friction/shear decay'}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs font-semibold flex items-center justify-end gap-1 text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{trendConfidence}% CI</span>
        </div>
        <div className="text-[10px] text-slate-400">Confidence Interval</div>
      </div>
    </div>
  );
};
