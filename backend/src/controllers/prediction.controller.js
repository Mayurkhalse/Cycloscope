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

module.exports = {
  refreshPrediction,
  getLatestPrediction,
  getPredictionHistory,
};
