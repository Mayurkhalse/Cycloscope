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
    mode: {
      type: String,
      enum: ['live', 'replay', 'historical_replay', 'fallback'],
      default: 'live',
    },
    modelVersion: {
      type: String,
      default: null, // null if fallback
    },
    modelVersions: {
      intensity: { type: String, default: 'v0.1' },
      track: { type: String, default: 'v0.1-LSTM' },
      cyclogenesis: { type: String, default: 'v0.1-RF' },
    },
    dataProvenance: {
      satellite: { type: mongoose.Schema.Types.Mixed, default: {} },
      environment: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    detection: {
      present: { type: Boolean, default: true },
      confidence: { type: Number, min: 0, max: 1, default: 1.0 },
    },
    intensity: {
      category: { type: String, required: true },
      windSpeedKmh: { type: Number, required: true },
      confidence: { type: Number, min: 0, max: 1, default: 0.8 },
      uncertaintyIntervalKmh: [{ type: Number }],
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
      default: null,
    },
  },
  { timestamps: true }
);

predictionResultSchema.index({ cycloneId: 1, requestedAt: -1 });

module.exports = mongoose.model('PredictionResult', predictionResultSchema);
