const mongoose = require('mongoose');

const cycloneSchema = new mongoose.Schema(
  {
    cycloneId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // e.g. "IO_2026_03"
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    basin: {
      type: String,
      required: true,
      enum: ['Bay of Bengal', 'Arabian Sea'],
      index: true,
    },
    season: {
      type: Number,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'dissipated', 'historical'],
      default: 'active',
      index: true,
    },
    currentCategory: {
      type: String,
      required: true,
      default: 'Depression',
    },
    currentWindSpeedKmh: {
      type: Number,
      default: 0,
    },
    currentPressureHpa: {
      type: Number,
      default: 1000,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    currentLocation: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    source: {
      type: String,
      enum: ['IBTrACS', 'live-feed', 'simulated'],
      default: 'live-feed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cyclone', cycloneSchema);
