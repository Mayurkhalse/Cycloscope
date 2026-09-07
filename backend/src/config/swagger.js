const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cycloscope Backend API',
      version: '1.0.0',
      description: 'API documentation for Cycloscope Decision-Support Backend orchestrating MongoDB, ML layer, Fallbacks, and RAG Chatbot.',
      contact: {
        name: 'Cycloscope Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Cyclone: {
          type: 'object',
          properties: {
            cycloneId: { type: 'string', example: 'IO_2026_03' },
            name: { type: 'string', example: 'Remal' },
            basin: { type: 'string', enum: ['Bay of Bengal', 'Arabian Sea'], example: 'Bay of Bengal' },
            season: { type: 'number', example: 2026 },
            status: { type: 'string', enum: ['active', 'dissipated', 'historical'], example: 'active' },
            currentCategory: { type: 'string', example: 'Severe Cyclonic Storm' },
            currentWindSpeedKmh: { type: 'number', example: 115 },
            currentPressureHpa: { type: 'number', example: 980 },
            lastUpdated: { type: 'string', format: 'date-time' },
            currentLocation: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 15.2 },
                lon: { type: 'number', example: 88.1 },
              },
            },
            source: { type: 'string', example: 'live-feed' },
          },
        },
        TrackPoint: {
          type: 'object',
          properties: {
            cycloneId: { type: 'string', example: 'IO_2026_03' },
            timestamp: { type: 'string', format: 'date-time' },
            type: { type: 'string', enum: ['observed', 'predicted'], example: 'predicted' },
            leadTimeHours: { type: 'number', nullable: true, example: 6 },
            lat: { type: 'number', example: 15.2 },
            lon: { type: 'number', example: 88.1 },
            windSpeedKmh: { type: 'number', example: 118 },
            pressureHpa: { type: 'number', example: 978 },
            uncertaintyRadiusKm: { type: 'number', example: 40 },
            confidence: { type: 'number', example: 0.78 },
          },
        },
        PredictionResult: {
          type: 'object',
          properties: {
            cycloneId: { type: 'string', example: 'IO_2026_03' },
            requestedAt: { type: 'string', format: 'date-time' },
            source: { type: 'string', enum: ['ml-model', 'fallback-climatology'], example: 'ml-model' },
            modelVersion: { type: 'string', nullable: true, example: 'intensity-v1.2' },
            detection: {
              type: 'object',
              properties: {
                present: { type: 'boolean', example: true },
                confidence: { type: 'number', example: 0.94 },
              },
            },
            intensity: {
              type: 'object',
              properties: {
                category: { type: 'string', example: 'Severe Cyclonic Storm' },
                windSpeedKmh: { type: 'number', example: 115 },
                confidence: { type: 'number', example: 0.81 },
              },
            },
            trackForecast: {
              type: 'array',
              items: { $ref: '#/components/schemas/TrackPoint' },
            },
            cyclogenesisProbability48h: { type: 'number', nullable: true, example: 0.25 },
            fallbackReason: { type: 'string', nullable: true, enum: ['ingestion-failure', 'model-failure', null] },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
