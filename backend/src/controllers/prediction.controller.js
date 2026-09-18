const Cyclone = require('../models/Cyclone');
const PredictionResult = require('../models/PredictionResult');
const { updateActiveSystem } = require('../services/predictionOrchestrator');

/**
 * POST /api/predictions/:cycloneId/refresh
 * Trigger a new inference call to ML layer (with fallback logic applied)
 */
async function refreshPrediction(req, res, next) {
  try {
    const { cycloneId } = req.params;
    const cyclone = await Cyclone.findOne({ cycloneId });

    if (!cyclone) {
      return res.status(404).json({
        success: false,
        error: { message: `Cyclone '${cycloneId}' not found.` },
      });
    }

    const prediction = await updateActiveSystem(cycloneId, cyclone.currentLocation);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/predictions/:cycloneId/latest
 * Get latest stored prediction
 */
async function getLatestPrediction(req, res, next) {
  try {
    const { cycloneId } = req.params;
    const prediction = await PredictionResult.findOne({ cycloneId }).sort({ requestedAt: -1 });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: { message: `No predictions found for cyclone '${cycloneId}'.` },
      });
    }

    res.json({
      success: true,
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/predictions/:cycloneId/history
 * Prediction history for that system (for accuracy and lead-time tracking)
 */
async function getPredictionHistory(req, res, next) {
  try {
    const { cycloneId } = req.params;
    const { limit = 20 } = req.query;

    const history = await PredictionResult.find({ cycloneId })
      .sort({ requestedAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

const TrackPoint = require('../models/TrackPoint');

/**
 * GET /api/predictions/:cycloneId/track
 * Direct endpoint for fetching observed and predicted trajectory points
 */
async function getPredictionTrack(req, res, next) {
  try {
    const { cycloneId } = req.params;
    const trackPoints = await TrackPoint.find({ cycloneId }).sort({ timestamp: 1 });
    const latestPrediction = await PredictionResult.findOne({ cycloneId }).sort({ requestedAt: -1 });

    const historicalTrack = trackPoints.filter((pt) => pt.type === 'observed').map((pt) => ({
      lat: pt.lat,
      lon: pt.lon,
      timestamp: pt.timestamp,
      windSpeedKmh: pt.windSpeedKmh,
      category: pt.windSpeedKmh >= 120 ? 'VSCS' : pt.windSpeedKmh >= 88 ? 'SCS' : pt.windSpeedKmh >= 62 ? 'CS' : 'Depression',
    }));

    const predictedTrack = trackPoints.filter((pt) => pt.type === 'predicted').map((pt) => ({
      lat: pt.lat,
      lon: pt.lon,
      forecastHour: pt.leadTimeHours || 6,
      leadTimeHours: pt.leadTimeHours || 6,
      windSpeedKmh: pt.windSpeedKmh,
      uncertaintyRadiusKm: pt.uncertaintyRadiusKm || 40,
      confidence: Math.round((pt.confidence || 0.75) * 100),
      category: pt.windSpeedKmh >= 120 ? 'VSCS' : pt.windSpeedKmh >= 88 ? 'SCS' : pt.windSpeedKmh >= 62 ? 'CS' : 'Depression',
    }));

    res.json({
      success: true,
      data: {
        cycloneId,
        historicalTrack,
        predictedTrack,
        source: latestPrediction?.source || 'ml-model',
        confidenceScore: latestPrediction?.detection?.confidence ? Math.round(latestPrediction.detection.confidence * 100) : 88,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  refreshPrediction,
  getLatestPrediction,
  getPredictionHistory,
  getPredictionTrack,
};
