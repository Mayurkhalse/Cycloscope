import React, { useState } from 'react';
import { MapContainer, TileLayer, LayersControl, LayerGroup } from 'react-leaflet';
import { SystemMarker } from './SystemMarker';
import { TrackLayer } from './TrackLayer';
import { UncertaintyCone } from './UncertaintyCone';
import { CyclogenesisHeatmap } from './CyclogenesisHeatmap';
import { useUIStore } from '../../store/uiStore';
import { Layers } from 'lucide-react';

const MAP_TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MapView = ({
  cyclones = [],
  selectedCyclone = null,
  predictionData = null,
  cyclogenesisDisturbances = [],
  className = 'h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800',
  showAllTracks = false,
}) => {
  const { mapViewport } = useUIStore();
  const [activeTileProvider, setActiveTileProvider] = useState('dark');

  // Alternate dark tile provider for atmospheric UI aesthetic
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const tileUrl = activeTileProvider === 'dark' ? darkTileUrl : MAP_TILE_URL;
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className={`relative ${className}`}>
      {/* Map Control Toolbar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg p-1.5 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setActiveTileProvider(activeTileProvider === 'dark' ? 'standard' : 'dark')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{activeTileProvider === 'dark' ? 'Dark Map' : 'Standard Tiles'}</span>
        </button>
      </div>

      <MapContainer
        center={mapViewport.center}
        zoom={mapViewport.zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={18} />

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
