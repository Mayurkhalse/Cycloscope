const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate workstation operator by credentials or preset role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               role: { type: string }
 *     responses:
 *       200:
 *         description: Operator authenticated successfully
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/operators:
 *   get:
 *     summary: List pre-configured operational personas and capabilities
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Available operator profiles
 */
router.get('/operators', authController.getOperators);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retrieve currently active operator profile
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current operator details
 */
router.get('/me', authController.getProfile);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Terminate session and lock workstation
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Workstation locked
 */
router.post('/logout', authController.logout);

module.exports = router;
