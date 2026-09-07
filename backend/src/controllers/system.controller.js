const mongoose = require('mongoose');
const mlClient = require('../services/mlClient');

/**
 * GET /api/system/health
 * Backend + DB health status
 */
async function getSystemHealth(req, res) {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1 || process.env.NODE_ENV !== 'production';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'cycloscope-backend',
    status: isHealthy ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
    memory: process.memoryUsage(),
  });
}

/**
 * GET /api/system/ml-status
 * Check whether live ML service or fallback layer is active
 */
async function getMLStatus(req, res) {
  let mlHealth = null;
  let isMLAvailable = false;
  let mode = 'live';

  if (process.env.ML_MOCK_MODE === 'true') {
    mode = 'mock';
    isMLAvailable = true;
    mlHealth = { status: 'mock-active' };
  } else {
    try {
      mlHealth = await mlClient.checkHealth();
      isMLAvailable = true;
    } catch (err) {
      isMLAvailable = false;
      mode = 'fallback';
    }
  }

  res.json({
    success: true,
    mlService: {
      status: isMLAvailable ? 'online' : 'unreachable',
      mode, // 'live' | 'mock' | 'fallback'
      url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
      details: mlHealth,
    },
    activeFallbackReason: isMLAvailable ? null : 'ML service not reachable or timed out',
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  getSystemHealth,
  getMLStatus,
};
