const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema(
  {
    cycloneId: {
      type: String,
      required: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'VERY HIGH', 'CRITICAL', 'WARNING'],
      default: 'MODERATE',
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    predictionSource: {
      type: String,
      enum: ['ml-model', 'fallback-climatology'],
      required: true,
    },
    fallbackReason: {
      type: String,
      enum: ['ingestion-failure', 'model-failure', null],
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertLog', alertLogSchema);
