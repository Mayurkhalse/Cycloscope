const express = require('express');
const router = express.Router();
const cycloneController = require('../controllers/cyclone.controller');
const validateRequest = require('../middleware/validateRequest');
const { z } = require('zod');

const historicalQuerySchema = z.object({
  season: z.string().regex(/^\d{4}$/, 'Season must be a 4-digit year').optional(),
  basin: z.enum(['Bay of Bengal', 'Arabian Sea']).optional(),
  category: z.string().optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  page: z.string().regex(/^\d+$/).optional(),
});

/**
 * @openapi
 * /cyclones/active:
 *   get:
 *     summary: List currently active tropical cyclone systems
 *     tags: [Cyclones]
 *     responses:
 *       200:
 *         description: List of active cyclones
 */
router.get('/active', cycloneController.getActiveCyclones);

/**
 * @openapi
 * /cyclones/historical:
 *   get:
 *     summary: Query historical cyclone records
 *     tags: [Cyclones]
 *     parameters:
 *       - in: query
 *         name: season
 *         schema: { type: integer }
 *       - in: query
 *         name: basin
 *         schema: { type: string, enum: [Bay of Bengal, Arabian Sea] }
 *     responses:
 *       200:
 *         description: Paginated historical cyclone list
 */
router.get(
  '/historical',
  validateRequest({ query: historicalQuerySchema }),
  cycloneController.getHistoricalCyclones
);

/**
 * @openapi
 * /cyclones/{cycloneId}:
 *   get:
 *     summary: Get full detail for one cyclone system
 *     tags: [Cyclones]
 *     parameters:
 *       - in: path
 *         name: cycloneId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cyclone details, tracks, and latest prediction
 *       404:
 *         description: Cyclone not found
 */
router.get('/:cycloneId', cycloneController.getCycloneById);

module.exports = router;
