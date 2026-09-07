export const formatWindSpeed = (knots) => {
  if (!knots && knots !== 0) return 'N/A';
  const kmh = Math.round(knots * 1.852);
  return `${knots} knots (${kmh} km/h)`;
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Depression':
    case 'D':
      return { label: 'Depression', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40' };
    case 'Deep Depression':
    case 'DD':
      return { label: 'Deep Depression', bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/40' };
    case 'Cyclonic Storm':
    case 'CS':
      return { label: 'Cyclonic Storm', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' };
    case 'Severe Cyclonic Storm':
    case 'SCS':
      return { label: 'Severe Cyclonic Storm', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' };
    case 'Very Severe Cyclonic Storm':
    case 'VSCS':
      return { label: 'Very Severe Cyclonic Storm', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/40' };
    case 'Extremely Severe Cyclonic Storm':
    case 'ESCS':
      return { label: 'Extremely Severe CS', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' };
    case 'Super Cyclonic Storm':
    case 'SuCS':
      return { label: 'Super Cyclonic Storm', bg: 'bg-red-600/30', text: 'text-red-300', border: 'border-red-500/60' };
    default:
      return { label: category || 'System', bg: 'bg-slate-700/30', text: 'text-slate-300', border: 'border-slate-600' };
  }
};

export const getRiskLevelBadge = (level) => {
  switch (level?.toLowerCase()) {
    case 'low':
      return { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-500/50', dot: 'bg-emerald-400' };
    case 'moderate':
      return { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-500/50', dot: 'bg-amber-400' };
    case 'high':
      return { bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-500/50', dot: 'bg-orange-400' };
    case 'severe':
      return { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-500/50', dot: 'bg-rose-400' };
    default:
      return { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-700', dot: 'bg-slate-500' };
  }
};

export const formatCoordinates = (lat, lon) => {
  if (lat === undefined || lon === undefined) return 'N/A';
  const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lonStr}`;
};

export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
};
