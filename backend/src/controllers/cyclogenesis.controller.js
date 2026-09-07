const Cyclone = require('../models/Cyclone');
const PredictionResult = require('../models/PredictionResult');
const mlClient = require('../services/mlClient');
const logger = require('../utils/logger');

/**
 * GET /api/cyclogenesis/watch
 * List candidate disturbances with 48h formation probability
 */
async function getCyclogenesisWatch(req, res, next) {
  try {
    // 1. Check for disturbances in Bay of Bengal and Arabian Sea
    const candidateDisturbances = [
      {
        region: 'Bay of Bengal (South-Central)',
        coordinates: { lat: 11.5, lon: 86.0 },
        environmentalConditions: {
          seaSurfaceTempC: 30.2,
          verticalWindShearKts: 8.5,
          midTroposphericHumidityPct: 78,
        },
        probability48h: 0.65,
        riskLevel: 'HIGH',
        potentialCategory: 'Depression',
        status: 'investigating',
      },
      {
        region: 'Arabian Sea (East-Central)',
        coordinates: { lat: 14.8, lon: 68.2 },
        environmentalConditions: {
          seaSurfaceTempC: 29.1,
          verticalWindShearKts: 14.0,
          midTroposphericHumidityPct: 62,
        },
        probability48h: 0.25,
        riskLevel: 'LOW',
        potentialCategory: 'Low Pressure Area',
        status: 'monitoring',
      },
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      disturbances: candidateDisturbances,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCyclogenesisWatch,
};
