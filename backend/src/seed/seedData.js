require('dotenv').config();
const mongoose = require('mongoose');
const Cyclone = require('../models/Cyclone');
const TrackPoint = require('../models/TrackPoint');
const PredictionResult = require('../models/PredictionResult');
const ClimatologyProfile = require('../models/ClimatologyProfile');
const logger = require('../utils/logger');

// Climatology baseline profiles for each month for North Indian Ocean basins
const CLIMATOLOGY_DATA = [
  // Bay of Bengal (Months 1-12)
  ...Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    // Post-monsoon (Oct-Dec) and pre-monsoon (Apr-May) are peak activity
    const isPeak = [4, 5, 10, 11, 12].includes(month);
    return {
      basin: 'Bay of Bengal',
      month,
      avgWindSpeedKmh: isPeak ? 95 : 65,
      avgPressureHpa: isPeak ? 984 : 996,
      avgTrackBearingDeg: month >= 10 ? 305 : 325, // Post-monsoon tracks west/north-west
      avgTrackSpeedKmh: isPeak ? 16 : 12,
      sampleSize: isPeak ? 75 : 30,
    };
  }),
  // Arabian Sea (Months 1-12)
  ...Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const isPeak = [5, 6, 10, 11].includes(month);
    return {
      basin: 'Arabian Sea',
      month,
      avgWindSpeedKmh: isPeak ? 85 : 60,
      avgPressureHpa: isPeak ? 988 : 998,
      avgTrackBearingDeg: 300, // WNW towards Gujarat/Oman
      avgTrackSpeedKmh: isPeak ? 14 : 11,
      sampleSize: isPeak ? 45 : 20,
    };
  }),
];

const SEED_CYCLONES = [
  {
    cycloneId: 'IO_2026_03',
    name: 'Remal',
    basin: 'Bay of Bengal',
    season: 2026,
    status: 'active',
    currentCategory: 'Severe Cyclonic Storm',
    currentWindSpeedKmh: 115,
    currentPressureHpa: 980,
    lastUpdated: new Date(),
    currentLocation: { lat: 18.5, lon: 88.8 },
    source: 'live-feed',
  },
  {
    cycloneId: 'IO_2026_01',
    name: 'Asna',
    basin: 'Arabian Sea',
    season: 2026,
    status: 'dissipated',
    currentCategory: 'Deep Depression',
    currentWindSpeedKmh: 65,
    currentPressureHpa: 994,
    lastUpdated: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    currentLocation: { lat: 23.2, lon: 67.5 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2023_02',
    name: 'Biparjoy',
    basin: 'Arabian Sea',
    season: 2023,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 165,
    currentPressureHpa: 954,
    lastUpdated: new Date('2023-06-15T18:00:00Z'),
    currentLocation: { lat: 23.2, lon: 68.6 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2020_01',
    name: 'Amphan',
    basin: 'Bay of Bengal',
    season: 2020,
    status: 'historical',
    currentCategory: 'Super Cyclonic Storm',
    currentWindSpeedKmh: 240,
    currentPressureHpa: 920,
    lastUpdated: new Date('2020-05-20T12:00:00Z'),
    currentLocation: { lat: 21.7, lon: 88.3 },
    source: 'IBTrACS',
  },
];

const SEED_TRACKS = [
  // Remal Observed points
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() - 18 * 3600 * 1000),
    type: 'observed',
    leadTimeHours: null,
    lat: 15.2,
    lon: 88.0,
    windSpeedKmh: 80,
    pressureHpa: 992,
    uncertaintyRadiusKm: 0,
    confidence: 1.0,
  },
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000),
    type: 'observed',
    leadTimeHours: null,
    lat: 16.4,
    lon: 88.3,
    windSpeedKmh: 95,
    pressureHpa: 986,
    uncertaintyRadiusKm: 0,
    confidence: 1.0,
  },
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000),
    type: 'observed',
    leadTimeHours: null,
    lat: 17.6,
    lon: 88.6,
    windSpeedKmh: 105,
    pressureHpa: 982,
    uncertaintyRadiusKm: 0,
    confidence: 1.0,
  },
  // Remal Predicted Forecast points
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() + 6 * 3600 * 1000),
    type: 'predicted',
    leadTimeHours: 6,
    lat: 19.4,
    lon: 89.0,
    windSpeedKmh: 120,
    pressureHpa: 976,
    uncertaintyRadiusKm: 35,
    confidence: 0.85,
  },
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() + 12 * 3600 * 1000),
    type: 'predicted',
    leadTimeHours: 12,
    lat: 20.6,
    lon: 89.2,
    windSpeedKmh: 125,
    pressureHpa: 972,
    uncertaintyRadiusKm: 65,
    confidence: 0.76,
  },
  {
    cycloneId: 'IO_2026_03',
    timestamp: new Date(Date.now() + 24 * 3600 * 1000),
    type: 'predicted',
    leadTimeHours: 24,
    lat: 22.1,
    lon: 89.4,
    windSpeedKmh: 110,
    pressureHpa: 980,
    uncertaintyRadiusKm: 115,
    confidence: 0.62,
  },
];

const SEED_PREDICTIONS = [
  {
    cycloneId: 'IO_2026_03',
    requestedAt: new Date(),
    source: 'ml-model',
    modelVersion: 'intensity-v1.2',
    detection: { present: true, confidence: 0.96 },
    intensity: {
      category: 'Severe Cyclonic Storm',
      windSpeedKmh: 115,
      confidence: 0.84,
    },
    trackForecast: [
      { leadTimeHours: 6, lat: 19.4, lon: 89.0, windSpeedKmh: 120, pressureHpa: 976, uncertaintyRadiusKm: 35, confidence: 0.85 },
      { leadTimeHours: 12, lat: 20.6, lon: 89.2, windSpeedKmh: 125, pressureHpa: 972, uncertaintyRadiusKm: 65, confidence: 0.76 },
      { leadTimeHours: 24, lat: 22.1, lon: 89.4, windSpeedKmh: 110, pressureHpa: 980, uncertaintyRadiusKm: 115, confidence: 0.62 },
    ],
    cyclogenesisProbability48h: null,
    fallbackReason: null,
  },
];

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cycloscope';
  try {
    logger.info(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    logger.info('Populating ClimatologyProfiles...');
    await ClimatologyProfile.deleteMany({});
    await ClimatologyProfile.insertMany(CLIMATOLOGY_DATA);

    logger.info('Seeding Cyclones...');
    for (const cyclone of SEED_CYCLONES) {
      await Cyclone.findOneAndUpdate({ cycloneId: cyclone.cycloneId }, cyclone, { upsert: true });
    }

    logger.info('Seeding TrackPoints...');
    await TrackPoint.deleteMany({ cycloneId: 'IO_2026_03' });
    await TrackPoint.insertMany(SEED_TRACKS);

    logger.info('Seeding PredictionResults...');
    await PredictionResult.deleteMany({ cycloneId: 'IO_2026_03' });
    await PredictionResult.insertMany(SEED_PREDICTIONS);

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
