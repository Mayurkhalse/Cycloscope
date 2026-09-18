import React from 'react';
import { getRiskLevelBadge } from '../../utils/formatters';

export const RiskBadge = ({ riskLevel = 'Moderate', size = 'md' }) => {
  const style = getRiskLevelBadge(riskLevel);
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border ${px} ${style.bg} ${style.text} ${style.border} shadow-xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {riskLevel} Risk
    </span>
  );
};
