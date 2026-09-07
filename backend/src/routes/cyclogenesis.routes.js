const express = require('express');
const router = express.Router();
const cyclogenesisController = require('../controllers/cyclogenesis.controller');

/**
 * @openapi
 * /cyclogenesis/watch:
 *   get:
 *     summary: List candidate oceanic disturbances with 48h cyclogenesis probability
 *     tags: [Cyclogenesis]
 *     responses:
 *       200:
 *         description: List of candidate disturbances
 */
router.get('/watch', cyclogenesisController.getCyclogenesisWatch);

module.exports = router;
