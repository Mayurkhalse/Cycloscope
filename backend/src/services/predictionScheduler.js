const cron = require('node-cron');
const Cyclone = require('../models/Cyclone');
const { scanForNewSystems, updateActiveSystem } = require('./predictionOrchestrator');
const logger = require('../utils/logger');

// Runs at 00:00, 06:00, 12:00, 18:00 UTC daily by default
const DEFAULT_SCHEDULE = '0 0,6,12,18 * * *';
const SCHEDULE = process.env.PREDICTION_CRON_SCHEDULE || DEFAULT_SCHEDULE;

let scheduledTask = null;

function startScheduler() {
  if (scheduledTask) {
    logger.warn('Prediction scheduler is already running');
    return;
  }

  logger.info(`Starting Prediction Scheduler on synoptic cadence: "${SCHEDULE}" (UTC)`);

  scheduledTask = cron.schedule(
    SCHEDULE,
    async () => {
      logger.info('=== [Synoptic Cadence] Starting scheduled prediction run ===');

      // 1. Scan fixed oceanic regions for brand-new disturbances
      try {
        await scanForNewSystems();
      } catch (err) {
        logger.error('Scheduled region scan encountered an error:', err);
      }

      // 2. Update every active system
      try {
        const activeSystems = await Cyclone.find({ status: 'active' });
        logger.info(`Found ${activeSystems.length} active cyclone(s) to refresh.`);

        for (const system of activeSystems) {
          try {
            await updateActiveSystem(system.cycloneId, system.currentLocation);
          } catch (err) {
            logger.error(`Scheduled update failed for ${system.cycloneId}:`, err);
          }
        }
        logger.info(`=== [Synoptic Cadence] Scheduled run complete: ${activeSystems.length} active systems processed ===`);
      } catch (err) {
        logger.error('Failed to query active systems for scheduled run:', err);
      }
    },
    {
      timezone: 'UTC',
    }
  );
}

function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    logger.info('Prediction scheduler stopped');
  }
}

module.exports = { startScheduler, stopScheduler };
