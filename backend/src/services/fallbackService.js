const Cyclone = require('../models/Cyclone');
const ClimatologyProfile = require('../models/ClimatologyProfile');
const AlertLog = require('../models/AlertLog');
const logger = require('../utils/logger');

// Default climatological baseline profiles for Bay of Bengal and Arabian Sea if DB record is missing
const DEFAULT_CLIMATOLOGY = {
  'Bay of Bengal': {
    avgWindSpeedKmh: 85,
    avgPressureHpa: 988,
    avgTrackBearingDeg: 315, // NW movement
    avgTrackSpeedKmh: 14,
  },
  'Arabian Sea': {
    avgWindSpeedKmh: 75,
    avgPressureHpa: 992,
    avgTrackBearingDeg: 300, // WNW movement
    avgTrackSpeedKmh: 12,
  },
};

function calculateProjectedPoint(startLat, startLon, bearingDeg, speedKmh, leadTimeHours) {
  const distanceKm = speedKmh * leadTimeHours;
  const bearingRad = (bearingDeg * Math.PI) / 180;
  const latRad = (startLat * Math.PI) / 180;

  const deltaLat = (distanceKm * Math.cos(bearingRad)) / 111.0;
  const deltaLon = (distanceKm * Math.sin(bearingRad)) / (111.0 * Math.cos(latRad || 0.001));

  return {
    lat: Number((startLat + deltaLat).toFixed(2)),
    lon: Number((startLon + deltaLon).toFixed(2)),
  };
}

async function estimate(cycloneId, reason = 'model-failure') {
  logger.warn(`[FallbackService] Generating climatological fallback prediction for ${cycloneId} (Reason: ${reason})`);

  const cyclone = await Cyclone.findOne({ cycloneId });
  const basin = cyclone?.basin || 'Bay of Bengal';
  const currentMonth = new Date().getMonth() + 1;

  let profile = await ClimatologyProfile.findOne({ basin, month: currentMonth });
  if (!profile) {
    profile = DEFAULT_CLIMATOLOGY[basin] || DEFAULT_CLIMATOLOGY['Bay of Bengal'];
  }

  const startLat = cyclone?.currentLocation?.lat || 14.0;
  const startLon = cyclone?.currentLocation?.lon || 88.0;
  const currentWind = cyclone?.currentWindSpeedKmh || profile.avgWindSpeedKmh;
  const currentCategory = cyclone?.currentCategory || 'Cyclonic Storm';

  const leadTimes = [6, 12, 24, 48];
  const trackForecast = leadTimes.map((hours) => {
    const coords = calculateProjectedPoint(
      startLat,
      startLon,
      profile.avgTrackBearingDeg,
      profile.avgTrackSpeedKmh,
      hours
    );

    // Climatology decay factor over time
    const decay = Math.max(0.7, 1 - hours * 0.005);
    return {
      leadTimeHours: hours,
      lat: coords.lat,
      lon: coords.lon,
      windSpeedKmh: Math.round(currentWind * decay),
      pressureHpa: profile.avgPressureHpa + Math.round(hours * 0.2),
      uncertaintyRadiusKm: 50 + hours * 6, // Widen uncertainty cone for fallback
      confidence: Number(Math.max(0.2, 0.55 - hours * 0.006).toFixed(2)),
    };
  });

  const prediction = {
    cycloneId,
    requestedAt: new Date(),
    source: 'fallback-climatology',
    modelVersion: null,
    detection: {
      present: true,
      confidence: 0.5,
    },
    intensity: {
      category: currentCategory,
      windSpeedKmh: currentWind,
      confidence: 0.45,
    },
    trackForecast,
    cyclogenesisProbability48h: null,
    fallbackReason: reason,
  };

  // Audit safety log
  try {
    await AlertLog.create({
      cycloneId,
      riskLevel: currentWind > 100 ? 'HIGH' : 'MODERATE',
      triggeredAt: new Date(),
      predictionSource: 'fallback-climatology',
      fallbackReason: reason,
      notes: `Climatology fallback invoked due to ${reason}. Profile applied: ${basin} (Month: ${currentMonth}).`,
    });
  } catch (logErr) {
    logger.error('Failed to save AlertLog audit record:', logErr);
  }

  return prediction;
}

async function estimateRegionScan(reason = 'ingestion-failure') {
  logger.warn(`[FallbackService] Generating fallback scan for candidate regions (Reason: ${reason})`);
  return [
    {
      region: 'Bay of Bengal',
      present: false,
      confidence: 0.2,
      estimatedCenter: { lat: 14.5, lon: 87.5 },
      source: 'fallback-climatology',
    },
    {
      region: 'Arabian Sea',
      present: false,
      confidence: 0.15,
      estimatedCenter: { lat: 13.0, lon: 65.0 },
      source: 'fallback-climatology',
    },
  ];
}

module.exports = {
  estimate,
  estimateRegionScan,
  calculateProjectedPoint,
};
