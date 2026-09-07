const mongoose = require('mongoose');

const trackPointSchema = new mongoose.Schema(
  {
    cycloneId: {
      type: String,
      required: true,
      index: true,
      ref: 'Cyclone',
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['observed', 'predicted'],
      index: true,
    },
    leadTimeHours: {
      type: Number,
      default: null, // null for observed; 6/12/24/48 for predicted
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    windSpeedKmh: {
      type: Number,
      required: true,
    },
    pressureHpa: {
      type: Number,
      default: null,
    },
    uncertaintyRadiusKm: {
      type: Number,
      default: 0, // drives uncertainty cone on frontend
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0,
    },
  },
  { timestamps: true }
);

trackPointSchema.index({ cycloneId: 1, timestamp: 1, type: 1 });

module.exports = mongoose.model('TrackPoint', trackPointSchema);
