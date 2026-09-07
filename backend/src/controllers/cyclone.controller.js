const Cyclone = require('../models/Cyclone');
const TrackPoint = require('../models/TrackPoint');
const PredictionResult = require('../models/PredictionResult');

/**
 * GET /api/cyclones/active
 * List currently active systems
 */
async function getActiveCyclones(req, res, next) {
  try {
    const cyclones = await Cyclone.find({ status: 'active' }).sort({ lastUpdated: -1 });
    res.json({
      success: true,
      count: cyclones.length,
      data: cyclones,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cyclones/:cycloneId
 * Full detail for one system including observed and predicted track points
 */
async function getCycloneById(req, res, next) {
  try {
    const { cycloneId } = req.params;
    const cyclone = await Cyclone.findOne({ cycloneId });

    if (!cyclone) {
      return res.status(404).json({
        success: false,
        error: { message: `Cyclone with ID '${cycloneId}' not found.` },
      });
    }

    const trackPoints = await TrackPoint.find({ cycloneId }).sort({ timestamp: 1 });
    const latestPrediction = await PredictionResult.findOne({ cycloneId }).sort({ requestedAt: -1 });

    res.json({
      success: true,
      data: {
        ...cyclone.toObject(),
        observedTrack: trackPoints.filter((pt) => pt.type === 'observed'),
        predictedTrack: trackPoints.filter((pt) => pt.type === 'predicted'),
        latestPrediction,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cyclones/historical
 * Query historical storms (filters: year/season, basin, category)
 */
async function getHistoricalCyclones(req, res, next) {
  try {
    const { season, basin, category, limit = 50, page = 1 } = req.query;
    const filter = { status: { $in: ['historical', 'dissipated'] } };

    if (season) filter.season = Number(season);
    if (basin) filter.basin = basin;
    if (category) filter.currentCategory = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [cyclones, total] = await Promise.all([
      Cyclone.find(filter).sort({ season: -1, lastUpdated: -1 }).skip(skip).limit(Number(limit)),
      Cyclone.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: cyclones.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: cyclones,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActiveCyclones,
  getCycloneById,
  getHistoricalCyclones,
};
