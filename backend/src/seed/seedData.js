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
  // Active Cyclones (2026)
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
    cycloneId: 'IO_2026_02',
    name: 'Tej',
    basin: 'Arabian Sea',
    season: 2026,
    status: 'active',
    currentCategory: 'Very Severe Cyclonic Storm',
    currentWindSpeedKmh: 155,
    currentPressureHpa: 978,
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
    currentLocation: { lat: 14.8, lon: 56.4 },
    source: 'live-feed',
  },
  {
    cycloneId: 'IO_2026_01',
    name: 'Asna',
    basin: 'Arabian Sea',
    season: 2026,
    status: 'active',
    currentCategory: 'Deep Depression',
    currentWindSpeedKmh: 65,
    currentPressureHpa: 994,
    lastUpdated: new Date(Date.now() - 25 * 60 * 1000),
    currentLocation: { lat: 23.2, lon: 67.5 },
    source: 'live-feed',
  },
  {
    cycloneId: 'IO_2026_04',
    name: 'Dana',
    basin: 'Bay of Bengal',
    season: 2026,
    status: 'active',
    currentCategory: 'Cyclonic Storm',
    currentWindSpeedKmh: 85,
    currentPressureHpa: 988,
    lastUpdated: new Date(Date.now() - 40 * 60 * 1000),
    currentLocation: { lat: 16.2, lon: 89.1 },
    source: 'live-feed',
  },

  // Historical Cyclones (from IBTrACS NIO Best-Track Archive)
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
    cycloneId: 'IO_2023_01',
    name: 'Mocha',
    basin: 'Bay of Bengal',
    season: 2023,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 215,
    currentPressureHpa: 938,
    lastUpdated: new Date('2023-05-14T12:00:00Z'),
    currentLocation: { lat: 20.1, lon: 92.8 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2021_01',
    name: 'Tauktae',
    basin: 'Arabian Sea',
    season: 2021,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 220,
    currentPressureHpa: 950,
    lastUpdated: new Date('2021-05-17T18:00:00Z'),
    currentLocation: { lat: 20.8, lon: 71.1 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2020_01',
    name: 'Amphan',
    basin: 'Bay of Bengal',
    season: 2020,
    status: 'historical',
    currentCategory: 'Super Cyclonic Storm',
    currentWindSpeedKmh: 260,
    currentPressureHpa: 920,
    lastUpdated: new Date('2020-05-20T12:00:00Z'),
    currentLocation: { lat: 21.7, lon: 88.3 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2019_01',
    name: 'Fani',
    basin: 'Bay of Bengal',
    season: 2019,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 215,
    currentPressureHpa: 932,
    lastUpdated: new Date('2019-05-03T06:00:00Z'),
    currentLocation: { lat: 19.8, lon: 85.8 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2016_01',
    name: 'Vardah',
    basin: 'Bay of Bengal',
    season: 2016,
    status: 'historical',
    currentCategory: 'Very Severe Cyclonic Storm',
    currentWindSpeedKmh: 130,
    currentPressureHpa: 975,
    lastUpdated: new Date('2016-12-12T12:00:00Z'),
    currentLocation: { lat: 13.1, lon: 80.3 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2014_01',
    name: 'Hudhud',
    basin: 'Bay of Bengal',
    season: 2014,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 185,
    currentPressureHpa: 960,
    lastUpdated: new Date('2014-10-12T06:00:00Z'),
    currentLocation: { lat: 17.7, lon: 83.3 },
    source: 'IBTrACS',
  },
  {
    cycloneId: 'IO_2013_01',
    name: 'Phailin',
    basin: 'Bay of Bengal',
    season: 2013,
    status: 'historical',
    currentCategory: 'Extremely Severe Cyclonic Storm',
    currentWindSpeedKmh: 215,
    currentPressureHpa: 940,
    lastUpdated: new Date('2013-10-12T15:00:00Z'),
    currentLocation: { lat: 19.3, lon: 84.9 },
    source: 'IBTrACS',
  },
];

const SEED_TRACKS = [
  // Remal (IO_2026_03) Observed points
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() - 18 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 15.2, lon: 88.0, windSpeedKmh: 80, pressureHpa: 992, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() - 12 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 16.4, lon: 88.3, windSpeedKmh: 95, pressureHpa: 986, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() - 6 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 17.6, lon: 88.6, windSpeedKmh: 105, pressureHpa: 982, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(), type: 'observed', leadTimeHours: null, lat: 18.5, lon: 88.8, windSpeedKmh: 115, pressureHpa: 980, uncertaintyRadiusKm: 0, confidence: 1.0 },
  // Remal Predicted Forecast points
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() + 6 * 3600 * 1000), type: 'predicted', leadTimeHours: 6, lat: 19.4, lon: 89.0, windSpeedKmh: 120, pressureHpa: 976, uncertaintyRadiusKm: 35, confidence: 0.88 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() + 12 * 3600 * 1000), type: 'predicted', leadTimeHours: 12, lat: 20.6, lon: 89.2, windSpeedKmh: 125, pressureHpa: 972, uncertaintyRadiusKm: 65, confidence: 0.78 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() + 24 * 3600 * 1000), type: 'predicted', leadTimeHours: 24, lat: 22.1, lon: 89.4, windSpeedKmh: 110, pressureHpa: 980, uncertaintyRadiusKm: 115, confidence: 0.65 },
  { cycloneId: 'IO_2026_03', timestamp: new Date(Date.now() + 48 * 3600 * 1000), type: 'predicted', leadTimeHours: 48, lat: 24.2, lon: 89.8, windSpeedKmh: 65, pressureHpa: 994, uncertaintyRadiusKm: 180, confidence: 0.45 },

  // Tej (IO_2026_02) Observed & Predicted
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() - 18 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 12.4, lon: 59.8, windSpeedKmh: 110, pressureHpa: 988, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() - 12 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 13.5, lon: 58.2, windSpeedKmh: 135, pressureHpa: 982, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() - 6 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 14.2, lon: 57.1, windSpeedKmh: 145, pressureHpa: 980, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(), type: 'observed', leadTimeHours: null, lat: 14.8, lon: 56.4, windSpeedKmh: 155, pressureHpa: 978, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() + 6 * 3600 * 1000), type: 'predicted', leadTimeHours: 6, lat: 15.4, lon: 55.2, windSpeedKmh: 165, pressureHpa: 974, uncertaintyRadiusKm: 30, confidence: 0.90 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() + 12 * 3600 * 1000), type: 'predicted', leadTimeHours: 12, lat: 16.1, lon: 54.0, windSpeedKmh: 175, pressureHpa: 970, uncertaintyRadiusKm: 55, confidence: 0.82 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() + 24 * 3600 * 1000), type: 'predicted', leadTimeHours: 24, lat: 16.9, lon: 53.1, windSpeedKmh: 160, pressureHpa: 976, uncertaintyRadiusKm: 95, confidence: 0.70 },
  { cycloneId: 'IO_2026_02', timestamp: new Date(Date.now() + 48 * 3600 * 1000), type: 'predicted', leadTimeHours: 48, lat: 18.2, lon: 52.0, windSpeedKmh: 95, pressureHpa: 990, uncertaintyRadiusKm: 165, confidence: 0.48 },

  // Asna (IO_2026_01) Observed & Predicted
  { cycloneId: 'IO_2026_01', timestamp: new Date(Date.now() - 12 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 22.8, lon: 68.2, windSpeedKmh: 55, pressureHpa: 998, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_01', timestamp: new Date(), type: 'observed', leadTimeHours: null, lat: 23.2, lon: 67.5, windSpeedKmh: 65, pressureHpa: 994, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_01', timestamp: new Date(Date.now() + 6 * 3600 * 1000), type: 'predicted', leadTimeHours: 6, lat: 23.5, lon: 66.8, windSpeedKmh: 70, pressureHpa: 992, uncertaintyRadiusKm: 35, confidence: 0.80 },
  { cycloneId: 'IO_2026_01', timestamp: new Date(Date.now() + 12 * 3600 * 1000), type: 'predicted', leadTimeHours: 12, lat: 23.7, lon: 65.9, windSpeedKmh: 75, pressureHpa: 990, uncertaintyRadiusKm: 60, confidence: 0.72 },

  // Dana (IO_2026_04) Observed & Predicted
  { cycloneId: 'IO_2026_04', timestamp: new Date(Date.now() - 12 * 3600 * 1000), type: 'observed', leadTimeHours: null, lat: 14.8, lon: 89.8, windSpeedKmh: 65, pressureHpa: 994, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_04', timestamp: new Date(), type: 'observed', leadTimeHours: null, lat: 16.2, lon: 89.1, windSpeedKmh: 85, pressureHpa: 988, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2026_04', timestamp: new Date(Date.now() + 6 * 3600 * 1000), type: 'predicted', leadTimeHours: 6, lat: 17.5, lon: 88.3, windSpeedKmh: 95, pressureHpa: 984, uncertaintyRadiusKm: 35, confidence: 0.84 },
  { cycloneId: 'IO_2026_04', timestamp: new Date(Date.now() + 12 * 3600 * 1000), type: 'predicted', leadTimeHours: 12, lat: 18.9, lon: 87.4, windSpeedKmh: 105, pressureHpa: 980, uncertaintyRadiusKm: 65, confidence: 0.75 },

  // Historical Storm Tracks (Fani, Amphan, Biparjoy, Tauktae)
  { cycloneId: 'IO_2019_01', timestamp: new Date('2019-04-26T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 5.2, lon: 88.5, windSpeedKmh: 55, pressureHpa: 1000, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2019_01', timestamp: new Date('2019-04-28T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 8.4, lon: 86.9, windSpeedKmh: 105, pressureHpa: 986, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2019_01', timestamp: new Date('2019-04-30T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 12.0, lon: 84.2, windSpeedKmh: 165, pressureHpa: 960, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2019_01', timestamp: new Date('2019-05-02T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 16.5, lon: 84.8, windSpeedKmh: 215, pressureHpa: 932, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2019_01', timestamp: new Date('2019-05-03T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 19.8, lon: 85.8, windSpeedKmh: 205, pressureHpa: 938, uncertaintyRadiusKm: 0, confidence: 1.0 },

  { cycloneId: 'IO_2020_01', timestamp: new Date('2020-05-16T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 10.4, lon: 86.2, windSpeedKmh: 65, pressureHpa: 994, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2020_01', timestamp: new Date('2020-05-17T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 13.5, lon: 86.4, windSpeedKmh: 140, pressureHpa: 975, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2020_01', timestamp: new Date('2020-05-18T06:00:00Z'), type: 'observed', leadTimeHours: null, lat: 17.2, lon: 86.9, windSpeedKmh: 260, pressureHpa: 920, uncertaintyRadiusKm: 0, confidence: 1.0 },
  { cycloneId: 'IO_2020_01', timestamp: new Date('2020-05-20T12:00:00Z'), type: 'observed', leadTimeHours: null, lat: 21.7, lon: 88.3, windSpeedKmh: 155, pressureHpa: 960, uncertaintyRadiusKm: 0, confidence: 1.0 },
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
      confidence: 0.88,
    },
    trackForecast: [
      { leadTimeHours: 6, lat: 19.4, lon: 89.0, windSpeedKmh: 120, pressureHpa: 976, uncertaintyRadiusKm: 35, confidence: 0.88 },
      { leadTimeHours: 12, lat: 20.6, lon: 89.2, windSpeedKmh: 125, pressureHpa: 972, uncertaintyRadiusKm: 65, confidence: 0.78 },
      { leadTimeHours: 24, lat: 22.1, lon: 89.4, windSpeedKmh: 110, pressureHpa: 980, uncertaintyRadiusKm: 115, confidence: 0.65 },
      { leadTimeHours: 48, lat: 24.2, lon: 89.8, windSpeedKmh: 65, pressureHpa: 994, uncertaintyRadiusKm: 180, confidence: 0.45 },
    ],
    cyclogenesisProbability48h: null,
    fallbackReason: null,
  },
  {
    cycloneId: 'IO_2026_02',
    requestedAt: new Date(),
    source: 'ml-model',
    modelVersion: 'intensity-v1.2',
    detection: { present: true, confidence: 0.94 },
    intensity: {
      category: 'Very Severe Cyclonic Storm',
      windSpeedKmh: 155,
      confidence: 0.90,
    },
    trackForecast: [
      { leadTimeHours: 6, lat: 15.4, lon: 55.2, windSpeedKmh: 165, pressureHpa: 974, uncertaintyRadiusKm: 30, confidence: 0.90 },
      { leadTimeHours: 12, lat: 16.1, lon: 54.0, windSpeedKmh: 175, pressureHpa: 970, uncertaintyRadiusKm: 55, confidence: 0.82 },
      { leadTimeHours: 24, lat: 16.9, lon: 53.1, windSpeedKmh: 160, pressureHpa: 976, uncertaintyRadiusKm: 95, confidence: 0.70 },
      { leadTimeHours: 48, lat: 18.2, lon: 52.0, windSpeedKmh: 95, pressureHpa: 990, uncertaintyRadiusKm: 165, confidence: 0.48 },
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
    await Cyclone.deleteMany({});
    for (const cyclone of SEED_CYCLONES) {
      await Cyclone.findOneAndUpdate({ cycloneId: cyclone.cycloneId }, cyclone, { upsert: true });
    }

    logger.info('Seeding TrackPoints...');
    await TrackPoint.deleteMany({});
    await TrackPoint.insertMany(SEED_TRACKS);

    logger.info('Seeding PredictionResults...');
    await PredictionResult.deleteMany({});
    await PredictionResult.insertMany(SEED_PREDICTIONS);

    logger.info(`Database seeding completed successfully! Populated ${SEED_CYCLONES.length} cyclones, ${SEED_TRACKS.length} track fixes, and climatology profiles.`);
    process.exit(0);
  } catch (err) {
    logger.error('Error during database seeding:', err);
    process.exit(1);
  }
}

seedDatabase();

