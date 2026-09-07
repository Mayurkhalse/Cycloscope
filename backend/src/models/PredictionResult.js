const mongoose = require('mongoose');

const predictionResultSchema = new mongoose.Schema(
  {
    cycloneId: {
      type: String,
      required: true,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      required: true,
      enum: ['ml-model', 'fallback-climatology'],
      default: 'ml-model',
    },
    modelVersion: {
      type: String,
      default: null, // null if fallback
    },
    detection: {
      present: { type: Boolean, default: true },
      confidence: { type: Number, min: 0, max: 1, default: 1.0 },
    },
    intensity: {
      category: { type: String, required: true },
      windSpeedKmh: { type: Number, required: true },
      confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    },
    trackForecast: [
      {
        leadTimeHours: { type: Number, required: true },
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        windSpeedKmh: { type: Number, required: true },
        pressureHpa: { type: Number, default: null },
        uncertaintyRadiusKm: { type: Number, default: 40 },
        confidence: { type: Number, min: 0, max: 1, default: 0.75 },
      },
    ],
    cyclogenesisProbability48h: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    fallbackReason: {
      type: String,
      enum: ['ingestion-failure', 'model-failure', null],
      default: null,
    },
  },
  { timestamps: true }
);

predictionResultSchema.index({ cycloneId: 1, requestedAt: -1 });

module.exports = mongoose.model('PredictionResult', predictionResultSchema);
