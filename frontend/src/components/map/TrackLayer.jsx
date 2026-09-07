import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { formatDateTime } from '../../utils/formatters';

export const TrackLayer = ({ historicalTrack = [], predictedTrack = [] }) => {
  // Convert tracks to [lat, lon] tuples for Polyline
  const historicalPositions = historicalTrack.map((pt) => [pt.lat, pt.lon]);
  
  // Connect latest historical point to prediction track
  const lastHist = historicalTrack[historicalTrack.length - 1];
  const predictedPositions = lastHist
    ? [[lastHist.lat, lastHist.lon], ...predictedTrack.map((pt) => [pt.lat, pt.lon])]
    : predictedTrack.map((pt) => [pt.lat, pt.lon]);

  return (
    <>
      {/* Historical Track Line (Solid Cyan) */}
      {historicalPositions.length > 0 && (
        <Polyline
          positions={historicalPositions}
          pathOptions={{
            color: '#38bdf8',
            weight: 3,
            opacity: 0.9,
          }}
        />
      )}

      {/* Historical Track Points */}
      {historicalTrack.map((pt, idx) => (
        <CircleMarker
          key={`hist-${idx}`}
          center={[pt.lat, pt.lon]}
          radius={4}
          pathOptions={{
            fillColor: '#38bdf8',
            fillOpacity: 1,
            color: '#0f172a',
            weight: 1.5,
          }}
        >
          <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
            <div className="text-xs">
              <strong>Historical Point</strong>
              <div>{pt.category || 'Observed'} ({pt.windSpeedKmh} km/h)</div>
              <div className="text-[10px] text-slate-400">{formatDateTime(pt.timestamp)}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Predicted Track Line (Dashed Crimson) */}
      {predictedPositions.length > 0 && (
        <Polyline
          positions={predictedPositions}
          pathOptions={{
            color: '#f43f5e',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.95,
          }}
        />
      )}

      {/* Predicted Forecast Points */}
      {predictedTrack.map((pt, idx) => (
        <CircleMarker
          key={`pred-${idx}`}
          center={[pt.lat, pt.lon]}
          radius={5}
          pathOptions={{
            fillColor: '#f43f5e',
            fillOpacity: 0.9,
            color: '#ffffff',
            weight: 2,
          }}
        >
          <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
            <div className="text-xs p-1">
              <div className="font-bold text-rose-400">+{pt.forecastHour}h Forecast</div>
              <div>Category: {pt.category}</div>
              <div>Est. Wind: ~{pt.windSpeedKmh} km/h</div>
              <div className="text-[10px] text-slate-300">Confidence: {pt.confidence}%</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
};
