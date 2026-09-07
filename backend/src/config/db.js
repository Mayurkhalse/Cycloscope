const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Prevent Mongoose from buffering queries indefinitely when disconnected in dev
mongoose.set('bufferTimeoutMS', 3000);

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cycloscope';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('Running in disconnected MongoDB mode for local development/testing');
    }
    return null;
  }
}

module.exports = { connectDB };
