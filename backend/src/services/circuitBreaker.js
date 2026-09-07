const CircuitBreaker = require('opossum');
const logger = require('../utils/logger');

const breakerOptions = {
  timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS) || 5000, // Timeout after 5s
  errorThresholdPercentage: 50, // When 50% of requests fail, trip breaker
  resetTimeout: 30000, // Stay open for 30s before half-open retry
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10,
};

function createBreaker(fn, name = 'ML_Service') {
  const breaker = new CircuitBreaker(fn, breakerOptions);

  breaker.on('open', () => {
    logger.warn(`[CircuitBreaker: ${name}] OPEN — All ML requests will route directly to Fallback layer.`);
  });

  breaker.on('halfOpen', () => {
    logger.info(`[CircuitBreaker: ${name}] HALF-OPEN — Probing ML Service with next request.`);
  });

  breaker.on('close', () => {
    logger.info(`[CircuitBreaker: ${name}] CLOSED — ML Service recovered and healthy.`);
  });

  breaker.on('fallback', (result) => {
    logger.info(`[CircuitBreaker: ${name}] Fallback triggered.`);
  });

  return breaker;
}

module.exports = { createBreaker, breakerOptions };
