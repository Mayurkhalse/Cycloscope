import React, { useState } from 'react';
import { MapContainer, TileLayer, LayersControl, LayerGroup } from 'react-leaflet';
import { SystemMarker } from './SystemMarker';
import { TrackLayer } from './TrackLayer';
import { UncertaintyCone } from './UncertaintyCone';
import { CyclogenesisHeatmap } from './CyclogenesisHeatmap';
import { useUIStore } from '../../store/uiStore';
import { Layers, Globe } from 'lucide-react';

// Single global world boundaries to allow full world view while preventing infinite tile replication
export const GLOBAL_MAP_BOUNDS = [
  [-85.0, -180.0],
  [85.0, 180.0],
];

// Authenticated CARTO Basemap configurations
export const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_3yvr_1_e12447f6b247bf7f03ac2e2c';
export const CARTO_VOYAGER_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}&api_key=${CARTO_API_KEY}`;
export const CARTO_POSITRON_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}&api_key=${CARTO_API_KEY}`;
export const CARTO_DARK_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}&api_key=${CARTO_API_KEY}`;
export const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const MapView = ({
  cyclones = [],
  selectedCyclone = null,
  predictionData = null,
  cyclogenesisDisturbances = [],
  className = 'h-[500px] w-full rounded-2xl overflow-hidden shadow-card border border-slate-200/90',
}) => {
  const { mapViewport } = useUIStore();
  const [activeTileType, setActiveTileType] = useState('carto'); // 'carto' | 'osm' | 'topo' | 'ocean'

  // Crisp, high-clarity watermark-free tile providers with high-contrast ocean/land separation
  const tileProviders = {
    carto: {
      url: CARTO_VOYAGER_URL,
      attribution: CARTO_ATTRIBUTION,
      name: 'CARTO Voyager',
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: 'OpenStreetMap Light',
    },
    topo: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      name: 'Esri Topographic',
    },
    ocean: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; GEBCO, NOAA, National Geographic',
      name: 'Ocean Bathymetry',
    },
  };

  const currentTile = tileProviders[activeTileType] || tileProviders.carto;

  return (
    <div className={`relative ${className} bg-slate-100`}>
      {/* Tile Switcher Control Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 border border-slate-200/90 rounded-xl p-1 shadow-card backdrop-blur-md">
        <button
          onClick={() => {
            const types = ['carto', 'osm', 'topo', 'ocean'];
            const nextIdx = (types.indexOf(activeTileType) + 1) % types.length;
            setActiveTileType(types[nextIdx]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-ocean-700 hover:bg-slate-100 transition"
          title="Toggle Tile Style"
        >
          <Layers className="w-3.5 h-3.5 text-ocean-600" />
          <span>{currentTile.name}</span>
        </button>
      </div>

      {/* Region Indicator Pill */}
      <div className="absolute top-3 left-14 z-[1000] hidden sm:flex items-center gap-1.5 bg-white/90 border border-slate-200/90 px-3 py-1 rounded-lg shadow-sm text-[11px] font-medium text-slate-600 backdrop-blur-sm pointer-events-none">
        <Globe className="w-3.5 h-3.5 text-ocean-600" />
        <span>North Indian Ocean & Global Synoptic View</span>
      </div>

      <MapContainer
        center={mapViewport.center}
        zoom={mapViewport.zoom}
        minZoom={2}
        maxZoom={12}
        maxBounds={GLOBAL_MAP_BOUNDS}
        maxBoundsViscosity={0.9}
        worldCopyJump={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          key={currentTile.name}
          url={currentTile.url}
          attribution={currentTile.attribution}
          subdomains="abcd"
          noWrap={true}
          bounds={GLOBAL_MAP_BOUNDS}
          maxZoom={19}
        />

        <LayersControl position="bottomleft">
          {/* Active Storm Markers Layer */}
          <LayersControl.Overlay checked name="Active Systems">
            <LayerGroup>
              {cyclones.map((cyclone) => (
                <SystemMarker
                  key={cyclone.id}
                  cyclone={cyclone}
                  isSelected={selectedCyclone?.id === cyclone.id}
                />
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Selected Storm Track & Uncertainty Cone Layer */}
          <LayersControl.Overlay checked name="Forecast Track & Uncertainty Cone">
            <LayerGroup>
              {selectedCyclone && (
                <>
                  <UncertaintyCone predictedTrack={predictionData?.predictedTrack || selectedCyclone.predictedTrack} />
                  <TrackLayer
                    historicalTrack={selectedCyclone.historicalTrack}
                    predictedTrack={predictionData?.predictedTrack || selectedCyclone.predictedTrack}
                  />
                </>
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Cyclogenesis Formation Heatmap Layer */}
          {cyclogenesisDisturbances.length > 0 && (
            <LayersControl.Overlay checked name="48h Cyclogenesis Heatmap">
              <LayerGroup>
                <CyclogenesisHeatmap disturbances={cyclogenesisDisturbances} />
              </LayerGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
};
