import React, { useState } from 'react';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { Filter, Search, Eye, CheckSquare, Square, Layers, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const HistoricalExplorer = () => {
  const [basin, setBasin] = useState('All');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedStormId, setSelectedStormId] = useState('fani-2019');
  const [compareStormIds, setCompareStormIds] = useState(['fani-2019', 'amphan-2020']);
  const [compareMode, setCompareMode] = useState(false);

  const { storms, isLoading } = useHistoricalData({ basin, category, query });

  const toggleCompareStorm = (id) => {
    if (compareStormIds.includes(id)) {
      setCompareStormIds(compareStormIds.filter((item) => item !== id));
    } else {
      if (compareStormIds.length < 3) {
        setCompareStormIds([...compareStormIds, id]);
      }
    }
  };

  const selectedStorm = storms.find((s) => s.id === selectedStormId) || storms[0];
  const stormsToDisplayOnMap = compareMode
    ? storms.filter((s) => compareStormIds.includes(s.id))
    : selectedStorm ? [selectedStorm] : [];

  const stormColors = ['#38bdf8', '#f43f5e', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-6 h-6 text-cyan-400" />
            <span>Historical Cyclone Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and compare historic storm trajectories in the North Indian Ocean (2015 - 2026).
          </p>
        </div>

        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
            compareMode
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 text-cyan-400 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{compareMode ? 'Exit Compare Mode' : 'Enable Storm Compare Mode'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by storm name or year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Basin Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={basin}
            onChange={(e) => setBasin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Basins</option>
            <option value="Bay of Bengal">Bay of Bengal</option>
            <option value="Arabian Sea">Arabian Sea</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Peak Categories</option>
            <option value="SuCS">Super Cyclonic Storm (SuCS)</option>
            <option value="ESCS">Extremely Severe CS (ESCS)</option>
            <option value="VSCS">Very Severe CS (VSCS)</option>
            <option value="SCS">Severe CS (SCS)</option>
          </select>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            setBasin('All');
            setCategory('All');
            setQuery('');
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Main Table + Map Combo View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Table View */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100">Historical Storm Registry</h3>
            {compareMode && (
              <span className="text-xs text-cyan-400 font-medium">Select up to 3 storms to overlay</span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading historical record..." />
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 uppercase tracking-wider text-[10px]">
                  <tr>
                    {compareMode && <th className="p-3">Compare</th>}
                    <th className="p-3">Storm</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Basin</th>
                    <th className="p-3">Peak Cat</th>
                    <th className="p-3">Max Wind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {storms.map((storm) => {
                    const isSelected = selectedStormId === storm.id;
                    const isChecked = compareStormIds.includes(storm.id);

                    return (
                      <tr
                        key={storm.id}
                        onClick={() => setSelectedStormId(storm.id)}
                        className={`cursor-pointer transition hover:bg-slate-800/60 ${
                          isSelected && !compareMode ? 'bg-slate-800/90 font-semibold text-white' : ''
                        }`}
                      >
                        {compareMode && (
                          <td className="p-3" onClick={(e) => { e.stopPropagation(); toggleCompareStorm(storm.id); }}>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </td>
                        )}
                        <td className="p-3 font-bold text-slate-100">{storm.name}</td>
                        <td className="p-3 font-mono">{storm.year}</td>
                        <td className="p-3">{storm.basin}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-cyan-300">
                            {storm.peakCategory}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-cyan-300">{storm.maxWindSpeedKmh} km/h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <MapContainer
            center={[15.0, 78.0]}
            zoom={5}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="CARTO Dark Tiles"
            />

            {stormsToDisplayOnMap.map((storm, sIdx) => {
              const color = stormColors[sIdx % stormColors.length];
              const positions = storm.track.map((pt) => [pt.lat, pt.lon]);

              return (
                <React.Fragment key={storm.id}>
                  <Polyline positions={positions} pathOptions={{ color, weight: 4, opacity: 0.9 }} />
                  {storm.track.map((pt, pIdx) => (
                    <CircleMarker key={pIdx} center={[pt.lat, pt.lon]} radius={5} pathOptions={{ fillColor: color, fillColorOpacity: 1, color: '#ffffff', weight: 1.5 }}>
                      <Tooltip sticky>
                        <div className="text-xs">
                          <strong>Cyclone {storm.name} ({storm.year})</strong>
                          <div>{pt.timestamp}</div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
