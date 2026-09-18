const mlClient = require('../services/mlClient');
const logger = require('../utils/logger');

/**
 * GET /api/cyclogenesis/watch
 * List candidate disturbances with dynamically calculated 48h formation probability
 */
async function getCyclogenesisWatch(req, res, next) {
  try {
    const candidateRegions = [
      {
        id: 'dist-bob-01',
        name: 'Low Pressure Area (BoB East)',
        region: 'bay_of_bengal',
        basinName: 'Bay of Bengal',
        currentLat: 11.5,
        currentLon: 86.0,
        environmentalConditions: {
          seaSurfaceTempC: 30.2,
          verticalWindShearKts: 8.5,
          midTroposphericHumidityPct: 78,
        },
        estimatedDevelopmentTime: '24 - 36 hours',
        potentialCategory: 'Depression',
      },
      {
        id: 'dist-as-02',
        name: 'Trough Axis (South Arabian Sea)',
        region: 'arabian_sea',
        basinName: 'Arabian Sea',
        currentLat: 14.8,
        currentLon: 68.2,
        environmentalConditions: {
          seaSurfaceTempC: 29.1,
          verticalWindShearKts: 13.5,
          midTroposphericHumidityPct: 62,
        },
        estimatedDevelopmentTime: '48 - 72 hours',
        potentialCategory: 'Low Pressure Area',
      },
    ];

    const disturbances = await Promise.all(
      candidateRegions.map(async (cand) => {
        let prob = 0.65;
        let risk = 'HIGH';
        let dominantFactor = 'Warm Sea Surface Temperature & Low Vertical Wind Shear';

        try {
          const mlRes = await mlClient.predictCyclogenesis(cand.region, {
            sea_surface_temp_c: cand.environmentalConditions.seaSurfaceTempC,
            vertical_wind_shear_knots: cand.environmentalConditions.verticalWindShearKts,
            mid_troposphere_rh: cand.environmentalConditions.midTroposphericHumidityPct,
          });
          const mlData = mlRes.data || mlRes;
          prob = mlData.probability_48h ?? prob;
          risk = mlData.genesis_risk_level ?? risk;
          dominantFactor = mlData.dominant_factor ?? dominantFactor;
        } catch (mlErr) {
          logger.debug(`ML cyclogenesis calculation fallback for ${cand.name}: ${mlErr.message}`);
        }

        const pct = Math.round(prob * 100);
        return {
          id: cand.id,
          name: cand.name,
          region: cand.region === 'bay_of_bengal' ? 'Bay of Bengal (South-Central)' : 'Arabian Sea (East-Central)',
          basin: cand.basinName,
          currentLat: cand.currentLat,
          currentLon: cand.currentLon,
          coordinates: { lat: cand.currentLat, lon: cand.currentLon },
          environmentalConditions: cand.environmentalConditions,
          formationProbability48h: pct,
          probability48h: prob,
          riskRating: risk === 'HIGH' ? 'High' : risk === 'MODERATE' ? 'Moderate' : 'Low',
          riskLevel: risk,
          potentialCategory: cand.potentialCategory,
          status: pct >= 50 ? 'investigating' : 'monitoring',
          reasons: [
            `SST: ${cand.environmentalConditions.seaSurfaceTempC} °C (${cand.environmentalConditions.seaSurfaceTempC >= 28 ? 'Favorable > 28°C' : 'Marginal'})`,
            `Vertical Wind Shear: ${cand.environmentalConditions.verticalWindShearKts} kts (${cand.environmentalConditions.verticalWindShearKts <= 12 ? 'Low/Favorable' : 'Moderate'})`,
            dominantFactor,
          ],
          estimatedDevelopmentTime: cand.estimatedDevelopmentTime,
          projectedCategory: cand.potentialCategory,
        };
      })
    );

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      disturbances,
      data: disturbances,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCyclogenesisWatch,
};

