const mongoose = require('mongoose');

const climatologyProfileSchema = new mongoose.Schema(
  {
    basin: {
      type: String,
      required: true,
      enum: ['Bay of Bengal', 'Arabian Sea'],
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    avgWindSpeedKmh: {
      type: Number,
      required: true,
    },
    avgPressureHpa: {
      type: Number,
      required: true,
    },
    avgTrackBearingDeg: {
      type: Number,
      required: true, // typical direction of movement (e.g., 315° NW)
    },
    avgTrackSpeedKmh: {
      type: Number,
      required: true, // typical speed of translation (e.g., 15 km/h)
    },
    sampleSize: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

climatologyProfileSchema.index({ basin: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('ClimatologyProfile', climatologyProfileSchema);
