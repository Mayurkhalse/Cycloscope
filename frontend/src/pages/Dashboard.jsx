import React from 'react';
import { useActiveSystems } from '../hooks/useActiveSystems';
import { useCyclogenesisWatch } from '../hooks/useHistoricalData';
import { useUIStore } from '../store/uiStore';
import { MapView } from '../components/map/MapView';
import { ActiveSystemsList } from '../components/dashboard/ActiveSystemsList';
import { StatsStrip } from '../components/dashboard/StatsStrip';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export const Dashboard = () => {
  const { systems, isLoading, isError, systemStatus, refetch } = useActiveSystems();
  const { disturbances } = useCyclogenesisWatch();
  const { selectedCycloneId, setSelectedCycloneId } = useUIStore();

  const selectedCyclone = systems.find((s) => s.id === selectedCycloneId) || systems[0];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <LoadingSpinner label="Fetching active North Indian Ocean satellite tracking data..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Quick Stats Strip */}
      <StatsStrip cyclones={systems} lastRefreshTime={systemStatus?.lastScanTime} />

      {/* Main Interactive Map + Active Systems Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Full-width Map View (2 Cols on Desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Live Synoptic Map</span>
              <span className="text-xs font-normal text-slate-400">North Indian Ocean (Bay of Bengal & Arabian Sea)</span>
            </h2>
            {selectedCyclone && (
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-cyan-400 font-mono border border-slate-700">
                Selected: {selectedCyclone.name} ({selectedCyclone.category})
              </span>
            )}
          </div>

          <MapView
            cyclones={systems}
            selectedCyclone={selectedCyclone}
            cyclogenesisDisturbances={disturbances}
            className="h-[550px] w-full rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
          />
        </div>

        {/* Right Panel: Active Systems List */}
        <div className="h-[585px]">
          <ActiveSystemsList
            cyclones={systems}
            selectedCycloneId={selectedCyclone?.id}
            onSelectCyclone={setSelectedCycloneId}
          />
        </div>
      </div>
    </div>
  );
};
