import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

export const TrendIndicator = ({
  trend = 'steady',
  trendDescription = null,
  trendConfidence = 85,
  currentWind = null,
  predictionTrack = null,
}) => {
  // If predictionTrack exists, calculate dynamic delta between now and +12h/+24h
  let deltaWind = 0;
  if (predictionTrack && predictionTrack.length > 0 && currentWind) {
    const pt12 = predictionTrack.find((p) => (p.leadTimeHours || p.forecastHour) === 12) || predictionTrack[0];
    if (pt12 && pt12.windSpeedKmh) {
      deltaWind = Math.round(pt12.windSpeedKmh - currentWind);
    }
  }

  const normalizedTrend = (trend || 'steady').toLowerCase();
  const isRapidIntensification =
    normalizedTrend === 'rapid_intensification' || deltaWind >= 18;
  const isStrengthening =
    normalizedTrend === 'strengthening' || (deltaWind >= 5 && !isRapidIntensification);
  const isWeakening =
    normalizedTrend === 'weakening' || normalizedTrend === 'rapid_weakening' || deltaWind <= -6;

  let icon = <Minus className="w-5 h-5 text-sky-600" />;
  let colorClass = 'text-sky-950 bg-sky-50/90 border-sky-200';
  let titleText = 'Steady Intensity Trend';
  let defaultSubtitle = 'Near-constant intensity (±5 km/h) maintained under balanced atmospheric conditions';

  if (isRapidIntensification) {
    icon = <Zap className="w-5 h-5 text-rose-600 animate-pulse" />;
    colorClass = 'text-rose-950 bg-rose-50/90 border-rose-300';
    titleText = 'Rapid Intensification Alert';
    defaultSubtitle = `Expected wind speed surge +15 to +25 km/h over next 12h fueled by high ocean heat`;
  } else if (isStrengthening) {
    icon = <TrendingUp className="w-5 h-5 text-amber-600" />;
    colorClass = 'text-amber-950 bg-amber-50/90 border-amber-200';
    titleText = 'Gradual Strengthening Trend';
    defaultSubtitle = `Projected wind increase +8 to +15 km/h over next 12h under favorable low shear`;
  } else if (isWeakening) {
    icon = <TrendingDown className="w-5 h-5 text-emerald-600" />;
    colorClass = 'text-emerald-950 bg-emerald-50/90 border-emerald-200';
    titleText = 'Gradual Weakening Trend';
    defaultSubtitle = `Expected friction/shear decay (-10 to -20 km/h) as storm approaches coastline`;
  }

  const finalSubtitle = trendDescription || defaultSubtitle;
  const finalConfidence = Math.min(99, Math.max(60, Number(trendConfidence) || 85));

  return (
    <div className={`p-4 rounded-2xl border ${colorClass} flex flex-wrap items-center justify-between gap-3 shadow-card`}>
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/60">{icon}</div>
        <div>
          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span>{titleText}</span>
            {deltaWind !== 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  deltaWind > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {deltaWind > 0 ? `+${deltaWind}` : deltaWind} km/h (12h)
              </span>
            )}
          </div>
          <div className="text-xs text-slate-600 font-medium mt-0.5">
            {finalSubtitle}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs font-bold flex items-center justify-end gap-1 text-ocean-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{finalConfidence}% CI</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">Confidence Interval</div>
      </div>
    </div>
  );
};
