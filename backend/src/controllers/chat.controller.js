const ChatSession = require('../models/ChatSession');
const ragService = require('../services/ragService');

/**
 * POST /api/chat/:sessionId/message
 * Send a user message and get a grounded response
 */
async function sendMessage(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'A non-empty string "message" field is required in the request body.' },
      });
    }

    const response = await ragService.handleChatMessage(sessionId, message.trim());

    res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/:sessionId/history
 * Retrieve conversation history for a session
 */
async function getChatHistory(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: `Chat session '${sessionId}' not found.` },
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/:sessionId
 * Clear a session
 */
async function clearChatSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const result = await ChatSession.findOneAndDelete({ sessionId });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: `Chat session '${sessionId}' not found.` },
      });
    }

    res.json({
      success: true,
      message: `Chat session '${sessionId}' deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatSession,
};
