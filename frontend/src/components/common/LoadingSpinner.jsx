import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ label = 'Loading cyclone data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-600 gap-3">
      <Loader2 className="w-8 h-8 text-ocean-600 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};
