import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { createCycloneIcon } from '../../utils/mapHelpers';
import { formatWindSpeed, formatDateTime, getCategoryBadgeStyle } from '../../utils/formatters';
import { ChevronRight } from 'lucide-react';

export const SystemMarker = ({ cyclone, isSelected }) => {
  const navigate = useNavigate();

  if (!cyclone || !cyclone.currentLat || !cyclone.currentLon) return null;

  const icon = createCycloneIcon(cyclone.category, isSelected);
  const badgeStyle = getCategoryBadgeStyle(cyclone.category);

  return (
    <Marker
      position={[cyclone.currentLat, cyclone.currentLon]}
      icon={icon}
      eventHandlers={{
        click: () => {
          navigate(`/cyclone/${cyclone.id}`);
        },
      }}
    >
      <Popup closeButton={false} className="custom-leaflet-popup">
        <div className="p-1 min-w-[200px]">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-700/80">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>Cyclone {cyclone.name}</span>
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {cyclone.category}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Wind Speed:</span>
              <span className="font-semibold text-cyan-300">{formatWindSpeed(cyclone.maxWindSpeedKnots)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pressure:</span>
              <span className="font-mono text-slate-200">{cyclone.minCentralPressure} hPa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Movement:</span>
              <span className="font-medium text-slate-200">{cyclone.movementDirection} at {cyclone.movementSpeedKmh} km/h</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Updated:</span>
              <span>{formatDateTime(cyclone.lastUpdated)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/cyclone/${cyclone.id}`)}
            className="w-full mt-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition shadow-md shadow-cyan-500/20"
          >
            <span>View Full Detail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Popup>
    </Marker>
  );
};
