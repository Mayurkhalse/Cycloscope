const axios = require('axios');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT_MS = Number(process.env.ML_SERVICE_TIMEOUT_MS) || 5000;
const ML_MOCK_MODE = process.env.ML_MOCK_MODE === 'true';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function checkHealth() {
  if (ML_MOCK_MODE) {
    return { status: 'ok', mock: true, timestamp: new Date().toISOString() };
  }
  const response = await client.get('/health');
  return response.data;
}

async function scanRegions() {
  if (ML_MOCK_MODE) {
    logger.info('[ML Mock Mode] Generating mock scan-regions response');
    return {
      data: [
        {
          region: 'Bay of Bengal',
          present: true,
          confidence: 0.88,
          estimatedCenter: { lat: 15.5, lon: 88.3 },
          source: 'simulated-ml',
        },
        {
          region: 'Arabian Sea',
          present: false,
          confidence: 0.15,
          estimatedCenter: { lat: 14.0, lon: 66.0 },
          source: 'simulated-ml',
        },
      ],
    };
  }
  return client.post('/live/scan-regions', {});
}

async function updateCyclone(cycloneId, lastKnownLat, lastKnownLon) {
  if (ML_MOCK_MODE) {
    logger.info(`[ML Mock Mode] Generating mock update-cyclone response for ${cycloneId}`);
    return {
      data: {
        cycloneId,
        source: 'ml-model',
        modelVersion: 'intensity-v1.2',
        detection: { present: true, confidence: 0.94 },
        intensity: { category: 'Severe Cyclonic Storm', windSpeedKmh: 115, confidence: 0.82 },
        trackForecast: [
          { leadTimeHours: 6, lat: lastKnownLat + 0.3, lon: lastKnownLon - 0.2, windSpeedKmh: 118, pressureHpa: 978, uncertaintyRadiusKm: 35, confidence: 0.8 },
          { leadTimeHours: 12, lat: lastKnownLat + 0.7, lon: lastKnownLon - 0.4, windSpeedKmh: 122, pressureHpa: 974, uncertaintyRadiusKm: 60, confidence: 0.72 },
          { leadTimeHours: 24, lat: lastKnownLat + 1.5, lon: lastKnownLon - 0.9, windSpeedKmh: 110, pressureHpa: 982, uncertaintyRadiusKm: 110, confidence: 0.58 },
          { leadTimeHours: 48, lat: lastKnownLat + 3.0, lon: lastKnownLon - 1.8, windSpeedKmh: 85, pressureHpa: 994, uncertaintyRadiusKm: 180, confidence: 0.42 },
        ],
        cyclogenesisProbability48h: null,
      },
    };
  }
  return client.post(`/live/update-cyclone/${cycloneId}`, {
    lastKnownLat,
    lastKnownLon,
  });
}

async function predictIntensity(cycloneId, imageBase64, channel = 'IR') {
  return client.post('/predict/intensity', {
    cyclone_id: cycloneId,
    image_base64: imageBase64,
    channel,
  });
}

async function predictCyclogenesis(region, features = {}) {
  return client.post('/predict/cyclogenesis', {
    region,
    features,
  });
}

async function getSatelliteFrame(cycloneId, params = {}) {
  const url = `/live/satellite-frame/${cycloneId}`;
  return client.get(url, {
    params,
    responseType: 'arraybuffer',
  });
}

module.exports = {
  checkHealth,
  scanRegions,
  updateCyclone,
  predictIntensity,
  predictCyclogenesis,
  getSatelliteFrame,
};
