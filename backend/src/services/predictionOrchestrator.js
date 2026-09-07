const mlClient = require('./mlClient');
const fallbackService = require('./fallbackService');
const { createBreaker } = require('./circuitBreaker');
const Cyclone = require('../models/Cyclone');
const TrackPoint = require('../models/TrackPoint');
const PredictionResult = require('../models/PredictionResult');
const logger = require('../utils/logger');

// Breaker instances wrapping ML calls
const updateCycloneBreaker = createBreaker(
  (cycloneId, lat, lon) => mlClient.updateCyclone(cycloneId, lat, lon),
  'UpdateCyclone'
);
const scanRegionsBreaker = createBreaker(() => mlClient.scanRegions(), 'ScanRegions');

function classifyFailure(err) {
  if (err.response) {
    if (err.response.status >= 500) {
      return 'model-failure';
    }
    if (err.response.status === 404 || err.response.status === 422) {
      return 'ingestion-failure';
    }
    return 'model-failure';
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    return 'ingestion-failure';
  }
  return 'model-failure';
}

async function savePredictionResult(cycloneId, data) {
  try {
    const predictionDoc = await PredictionResult.create({
      cycloneId,
      requestedAt: data.requestedAt || new Date(),
      source: data.source || 'ml-model',
      modelVersion: data.modelVersion || null,
      detection: data.detection || { present: true, confidence: 0.9 },
      intensity: data.intensity,
      trackForecast: data.trackForecast || [],
      cyclogenesisProbability48h: data.cyclogenesisProbability48h || null,
      fallbackReason: data.fallbackReason || null,
    });

    // Update or insert predicted TrackPoints
    if (Array.isArray(data.trackForecast) && data.trackForecast.length > 0) {
      const forecastPoints = data.trackForecast.map((pt) => ({
        cycloneId,
        timestamp: new Date(Date.now() + (pt.leadTimeHours || 0) * 3600 * 1000),
        type: 'predicted',
        leadTimeHours: pt.leadTimeHours,
        lat: pt.lat,
        lon: pt.lon,
        windSpeedKmh: pt.windSpeedKmh,
        pressureHpa: pt.pressureHpa || null,
        uncertaintyRadiusKm: pt.uncertaintyRadiusKm || 40,
        confidence: pt.confidence || 0.75,
      }));

      // Remove existing predicted track points for this cyclone and write fresh forecast
      await TrackPoint.deleteMany({ cycloneId, type: 'predicted' });
      await TrackPoint.insertMany(forecastPoints);
    }

    // Update cyclone status & category if new intensity prediction is available
    if (data.intensity) {
      await Cyclone.findOneAndUpdate(
        { cycloneId },
        {
          currentCategory: data.intensity.category,
          currentWindSpeedKmh: data.intensity.windSpeedKmh,
          lastUpdated: new Date(),
        }
      );
    }

    return predictionDoc;
  } catch (err) {
    logger.error(`Error saving prediction result for ${cycloneId}:`, err);
    throw err;
  }
}

async function scanForNewSystems() {
  logger.info('[PredictionOrchestrator] Scanning oceanic basins for disturbances...');
  let scanResults;
  try {
    const res = await scanRegionsBreaker.fire();
    scanResults = res.data || res;
  } catch (err) {
    const reason = classifyFailure(err);
    logger.warn(`Region scan failed (${reason}), routing to fallback: ${err.message}`);
    scanResults = await fallbackService.estimateRegionScan(reason);
  }

  const detectedSystems = [];
  if (Array.isArray(scanResults)) {
    for (const result of scanResults) {
      if (result.present && result.confidence > 0.7) {
        logger.info(`Disturbance detected in ${result.region} with confidence ${result.confidence}`);
        const generatedId = `IO_${new Date().getFullYear()}_${Date.now().toString().slice(-4)}`;
        const updated = await Cyclone.findOneAndUpdate(
          { basin: result.region, status: 'active' },
          {
            $setOnInsert: {
              cycloneId: generatedId,
              name: `Invest-${result.region.slice(0, 3)}`,
              season: new Date().getFullYear(),
              currentCategory: 'Depression',
            },
            status: 'active',
            currentLocation: result.estimatedCenter || { lat: 14.0, lon: 88.0 },
            source: result.source || 'live-feed',
            lastUpdated: new Date(),
          },
          { upsert: true, new: true }
        );
        detectedSystems.push(updated);
      }
    }
  }
  return detectedSystems;
}

async function updateActiveSystem(cycloneId, lastKnownLocation) {
  logger.info(`[PredictionOrchestrator] Updating active cyclone ${cycloneId}...`);
  let result;
  const lat = lastKnownLocation?.lat || 15.0;
  const lon = lastKnownLocation?.lon || 88.0;

  try {
    const res = await updateCycloneBreaker.fire(cycloneId, lat, lon);
    result = res.data || res;
  } catch (err) {
    const reason = classifyFailure(err);
    logger.warn(`ML update failed for ${cycloneId} (${reason}), triggering Climatology Fallback: ${err.message}`);
    result = await fallbackService.estimate(cycloneId, reason);
  }

  return savePredictionResult(cycloneId, result);
}

module.exports = {
  scanForNewSystems,
  updateActiveSystem,
  savePredictionResult,
  classifyFailure,
};
