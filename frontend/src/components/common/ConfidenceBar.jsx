import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const ConfidenceBar = ({ confidenceScore = 0, label = 'AI Model Confidence', size = 'md' }) => {
  const score = Math.max(0, Math.min(100, confidenceScore));

  let colorClass = 'bg-emerald-500';
  let textClass = 'text-emerald-700';
  let badgeText = 'High';

  if (score < 60) {
    colorClass = 'bg-rose-500';
    textClass = 'text-rose-700';
    badgeText = 'Low';
  } else if (score < 80) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
    badgeText = 'Moderate';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
          {score >= 70 ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          )}
          {label}
        </span>
        <span className={`font-bold ${textClass}`}>
          {score}% ({badgeText})
        </span>
      </div>
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass} border border-slate-200/80`}>
        <div
          className={`${colorClass} ${heightClass} rounded-full transition-all duration-500 shadow-sm`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
