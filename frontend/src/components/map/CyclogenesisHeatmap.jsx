import React from 'react';
import { Circle, Tooltip } from 'react-leaflet';

export const CyclogenesisHeatmap = ({ disturbances = [] }) => {
  return (
    <>
      {disturbances.map((dist) => {
        const radiusMeters = dist.formationProbability48h * 1500;
        let color = '#38bdf8';
        if (dist.formationProbability48h > 70) color = '#f43f5e';
        else if (dist.formationProbability48h > 40) color = '#f59e0b';

        return (
          <Circle
            key={dist.id}
            center={[dist.currentLat, dist.currentLon]}
            radius={radiusMeters}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.25,
              color: color,
              weight: 1.5,
              dashArray: '3, 3',
            }}
          >
            <Tooltip direction="top" opacity={0.95}>
              <div className="text-xs p-1">
                <strong className="text-cyan-300">{dist.name}</strong>
                <div>48h Formation Prob: <strong>{dist.formationProbability48h}%</strong></div>
                <div className="text-[10px] text-slate-300">Target: {dist.projectedCategory}</div>
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
};
