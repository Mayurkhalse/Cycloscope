import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { calculateUncertaintyConePolygon } from '../../utils/mapHelpers';

export const UncertaintyCone = ({ predictedTrack = [] }) => {
  const polygonPositions = calculateUncertaintyConePolygon(predictedTrack);

  if (!polygonPositions || polygonPositions.length === 0) return null;

  return (
    <Polygon
      positions={polygonPositions}
      pathOptions={{
        fillColor: '#f43f5e',
        fillOpacity: 0.18,
        color: '#f43f5e',
        weight: 1,
        dashArray: '4, 4',
        opacity: 0.6,
      }}
    >
      <Tooltip sticky opacity={0.9}>
        <div className="text-xs text-rose-200">
          <strong>Forecast Uncertainty Cone</strong>
          <p className="text-[10px] text-slate-300">Tighter near-term bounds, widening up to ±180 km at +48h.</p>
        </div>
      </Tooltip>
    </Polygon>
  );
};
