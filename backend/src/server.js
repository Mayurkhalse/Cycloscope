require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { startScheduler, stopScheduler } = require('./services/predictionScheduler');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  // 1. Establish MongoDB connection
  await connectDB();

  // 2. Start Prediction Cron Scheduler (synoptic cadence)
  startScheduler();

  // 3. Start Express server
  const server = app.listen(PORT, () => {
    logger.info(`====================================================`);
    logger.info(` Cycloscope Backend running on port ${PORT}`);
    logger.info(` API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(` Health check:      http://localhost:${PORT}/api/system/health`);
    logger.info(` ML status:         http://localhost:${PORT}/api/system/ml-status`);
    logger.info(`====================================================`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    logger.info(`${signal} signal received: closing HTTP server and stopping scheduler...`);
    stopScheduler();
    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to bootstrap Cycloscope server:', err);
  process.exit(1);
});
