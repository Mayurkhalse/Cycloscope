import React, { useState } from 'react';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { Filter, Search, Eye, CheckSquare, Square, Layers, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GLOBAL_MAP_BOUNDS, CARTO_VOYAGER_URL, CARTO_ATTRIBUTION } from '../components/map/MapView';

export const HistoricalExplorer = () => {
  const [basin, setBasin] = useState('All');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedStormId, setSelectedStormId] = useState('IO_2019_01');
  const [compareStormIds, setCompareStormIds] = useState(['IO_2019_01', 'IO_2020_01']);
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

  const selectedStorm = storms.find((s) => s.id === selectedStormId || s.id === 'fani-2019') || storms[0];
  const stormsToDisplayOnMap = compareMode
    ? storms.filter((s) => compareStormIds.includes(s.id))
    : selectedStorm ? [selectedStorm] : [];

  const stormColors = ['#0284c7', '#e11d48', '#d97706'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-ocean-600" />
            <span>Historical Cyclone Explorer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Browse, filter, and compare historic storm trajectories in the North Indian Ocean (2015 - 2026).
          </p>
        </div>

        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border transition shadow-xs ${
            compareMode
              ? 'bg-ocean-600 text-white border-ocean-600 shadow-md shadow-ocean-600/20'
              : 'bg-white text-ocean-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{compareMode ? 'Exit Compare Mode' : 'Enable Storm Compare Mode'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by storm name or year..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ocean-500 focus:bg-white"
          />
        </div>

        {/* Basin Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={basin}
            onChange={(e) => setBasin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-ocean-500 focus:bg-white"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-ocean-500 focus:bg-white"
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
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Main Table + Map Combo View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Table View */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Historical Storm Registry</h3>
            {compareMode && (
              <span className="text-xs text-ocean-700 font-bold">Select up to 3 storms to overlay</span>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner label="Loading historical record..." />
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    {compareMode && <th className="p-3">Compare</th>}
                    <th className="p-3">Storm</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Basin</th>
                    <th className="p-3">Peak Cat</th>
                    <th className="p-3">Max Wind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {storms.map((storm) => {
                    const isSelected = selectedStormId === storm.id;
                    const isChecked = compareStormIds.includes(storm.id);

                    return (
                      <tr
                        key={storm.id}
                        onClick={() => setSelectedStormId(storm.id)}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          isSelected && !compareMode ? 'bg-ocean-50/80 font-bold text-ocean-950' : ''
                        }`}
                      >
                        {compareMode && (
                          <td className="p-3" onClick={(e) => { e.stopPropagation(); toggleCompareStorm(storm.id); }}>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-ocean-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </td>
                        )}
                        <td className="p-3 font-extrabold text-slate-900">{storm.name}</td>
                        <td className="p-3 font-mono text-slate-600">{storm.year}</td>
                        <td className="p-3">{storm.basin}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-800">
                            {storm.peakCategory}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-ocean-800">{storm.maxWindSpeedKmh} km/h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Map View with full world view limits */}
        <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-card relative bg-slate-100">
          <MapContainer
            center={[15.0, 78.0]}
            zoom={4.5}
            minZoom={2}
            maxZoom={12}
            maxBounds={GLOBAL_MAP_BOUNDS}
            maxBoundsViscosity={0.9}
            worldCopyJump={false}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              url={CARTO_VOYAGER_URL}
              attribution={CARTO_ATTRIBUTION}
              subdomains="abcd"
              maxZoom={19}
              noWrap={true}
              bounds={GLOBAL_MAP_BOUNDS}
            />

            {stormsToDisplayOnMap.map((storm, sIdx) => {
              const color = stormColors[sIdx % stormColors.length];
              const positions = storm.track.map((pt) => [pt.lat, pt.lon]);

              return (
                <React.Fragment key={storm.id}>
                  <Polyline positions={positions} pathOptions={{ color, weight: 4, opacity: 0.95 }} />
                  {storm.track.map((pt, pIdx) => (
                    <CircleMarker key={pIdx} center={[pt.lat, pt.lon]} radius={5} pathOptions={{ fillColor: color, fillOpacity: 1, color: '#ffffff', weight: 2 }}>
                      <Tooltip sticky>
                        <div className="text-xs font-semibold p-1">
                          <strong>Cyclone {storm.name} ({storm.year})</strong>
                          <div className="text-slate-500">{pt.timestamp}</div>
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
