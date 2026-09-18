import L from 'leaflet';

// Generate Leaflet SVG div icon based on storm category with crisp drop shadow on light maps
export const createCycloneIcon = (category, isSelected = false) => {
  let color = '#0284c7'; // Sky / Blue default
  let pulseClass = '';

  if (category === 'VSCS' || category === 'ESCS' || category === 'SuCS' || category === 'Severe') {
    color = '#e11d48'; // Rose / Crimson
    pulseClass = 'cyclone-marker-pulse';
  } else if (category === 'SCS' || category === 'High') {
    color = '#ea580c'; // Orange
  } else if (category === 'CS' || category === 'Moderate') {
    color = '#d97706'; // Amber
  } else {
    color = '#059669'; // Emerald
  }

  const borderStyle = isSelected ? 'ring-4 ring-ocean-500 scale-125' : 'hover:scale-110';

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 transition-transform ${borderStyle}">
      <div class="absolute w-8 h-8 rounded-full opacity-35 ${pulseClass}" style="background-color: ${color}"></div>
      <div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg" style="background-color: ${color}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-white animate-spin" style="animation-duration: 6s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-cyclone-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

/**
 * Calculates a polygon representing the forecast uncertainty cone.
 * Accepts predicted track points: [{ lat, lon, forecastHour, uncertaintyRadiusKm }]
 * Returns array of [lat, lon] coordinates forming a closed polygon.
 */
export const calculateUncertaintyConePolygon = (predictedTrack = []) => {
  if (!predictedTrack || predictedTrack.length < 2) return [];

  const leftBoundary = [];
  const rightBoundary = [];

  for (let i = 0; i < predictedTrack.length; i++) {
    const pt = predictedTrack[i];
    const prevPt = predictedTrack[Math.max(0, i - 1)];
    const nextPt = predictedTrack[Math.min(predictedTrack.length - 1, i + 1)];

    // Calculate heading angle in radians
    const dLat = nextPt.lat - prevPt.lat;
    const dLon = nextPt.lon - prevPt.lon;
    const heading = Math.atan2(dLon, dLat);

    // Convert km to approximate lat/lon delta (1 deg lat ≈ 111 km)
    const radiusKm = pt.uncertaintyRadiusKm || (i + 1) * 25;
    const latOffset = (radiusKm / 111) * Math.cos(heading + Math.PI / 2);
    const lonOffset = (radiusKm / (111 * Math.cos((pt.lat * Math.PI) / 180))) * Math.sin(heading + Math.PI / 2);

    leftBoundary.push([pt.lat + latOffset, pt.lon + lonOffset]);
    rightBoundary.push([pt.lat - latOffset, pt.lon - lonOffset]);
  }

  // Closed polygon loop: left boundary forward, right boundary reversed
  return [...leftBoundary, ...rightBoundary.reverse()];
};
