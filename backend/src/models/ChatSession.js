const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system'],
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  retrievedContextIds: {
    type: [String],
    default: [], // Pinecone doc IDs used for grounding
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Cyclone Advisory Chat',
    },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatSession', chatSessionSchema);
