import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const ConfidenceBar = ({ confidenceScore = 0, label = 'AI Model Confidence', size = 'md' }) => {
  const score = Math.max(0, Math.min(100, confidenceScore));

  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-400';
  let badgeText = 'High';

  if (score < 60) {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-400';
    badgeText = 'Low';
  } else if (score < 80) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-400';
    badgeText = 'Moderate';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          {score >= 70 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          {label}
        </span>
        <span className={`font-semibold ${textClass}`}>
          {score}% ({badgeText})
        </span>
      </div>
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heightClass} border border-slate-700/60`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-500 shadow-sm`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
