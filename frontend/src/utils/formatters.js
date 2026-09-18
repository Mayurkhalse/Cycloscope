export const formatWindSpeed = (knots) => {
  if (!knots && knots !== 0) return 'N/A';
  const kmh = Math.round(knots * 1.852);
  return `${knots} kts (${kmh} km/h)`;
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Depression':
    case 'D':
      return { label: 'Depression', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'Deep Depression':
    case 'DD':
      return { label: 'Deep Depression', bg: 'bg-teal-50 text-teal-700 border-teal-200', text: 'text-teal-700', border: 'border-teal-300' };
    case 'Cyclonic Storm':
    case 'CS':
      return { label: 'Cyclonic Storm', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', border: 'border-amber-300' };
    case 'Severe Cyclonic Storm':
    case 'SCS':
      return { label: 'Severe Cyclonic Storm', bg: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-700', border: 'border-orange-300' };
    case 'Very Severe Cyclonic Storm':
    case 'VSCS':
      return { label: 'Very Severe Cyclonic Storm', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', border: 'border-rose-300' };
    case 'Extremely Severe Cyclonic Storm':
    case 'ESCS':
      return { label: 'Extremely Severe CS', bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', border: 'border-purple-300' };
    case 'Super Cyclonic Storm':
    case 'SuCS':
      return { label: 'Super Cyclonic Storm', bg: 'bg-red-100 text-red-800 border-red-300', text: 'text-red-800', border: 'border-red-400' };
    default:
      return { label: category || 'System', bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', border: 'border-slate-300' };
  }
};

export const getRiskLevelBadge = (level) => {
  switch (level?.toLowerCase()) {
    case 'low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'moderate':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'high':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' };
    case 'severe':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', dot: 'bg-rose-600' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
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
