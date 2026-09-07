const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');

/**
 * @openapi
 * /predictions/{cycloneId}/refresh:
 *   post:
 *     summary: Trigger a fresh inference call to ML service with fallback applied
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: cycloneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Newly calculated prediction result
 */
router.post('/:cycloneId/refresh', predictionController.refreshPrediction);

/**
 * @openapi
 * /predictions/{cycloneId}/latest:
 *   get:
 *     summary: Retrieve the latest stored prediction for a cyclone
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: cycloneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Latest prediction result
 *       404:
 *         description: No prediction found
 */
router.get('/:cycloneId/latest', predictionController.getLatestPrediction);

/**
 * @openapi
 * /predictions/{cycloneId}/history:
 *   get:
 *     summary: Retrieve historical predictions for a cyclone
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: cycloneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of previous predictions
 */
router.get('/:cycloneId/history', predictionController.getPredictionHistory);

module.exports = router;
