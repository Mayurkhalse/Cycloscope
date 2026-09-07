const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

/**
 * @openapi
 * /system/health:
 *   get:
 *     summary: Check system, process, and database health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System operational
 *       503:
 *         description: System degraded
 */
router.get('/health', systemController.getSystemHealth);

/**
 * @openapi
 * /system/ml-status:
 *   get:
 *     summary: Check ML service status and whether fallback layer is engaged
 *     tags: [System]
 *     responses:
 *       200:
 *         description: ML connection status report
 */
router.get('/ml-status', systemController.getMLStatus);

module.exports = router;
