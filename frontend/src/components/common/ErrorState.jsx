import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Failed to load data', message = 'Please check backend connectivity or try again.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-card max-w-md mx-auto">
      <div className="p-3 bg-rose-50 rounded-full text-rose-600 mb-3 border border-rose-200">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-ocean-600/20"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
