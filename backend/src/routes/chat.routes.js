const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { chatLimiter } = require('../middleware/rateLimiter');

/**
 * @openapi
 * /chat/{sessionId}/message:
 *   post:
 *     summary: Send a message to the RAG meteorological chatbot
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grounded assistant response with source IDs
 */
router.post('/:sessionId/message', chatLimiter, chatController.sendMessage);

/**
 * @openapi
 * /chat/{sessionId}/history:
 *   get:
 *     summary: Retrieve chat history for a session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full conversation history
 */
router.get('/:sessionId/history', chatController.getChatHistory);

/**
 * @openapi
 * /chat/{sessionId}:
 *   delete:
 *     summary: Clear/delete a chat session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session deleted confirmation
 */
router.delete('/:sessionId', chatController.clearChatSession);

module.exports = router;
