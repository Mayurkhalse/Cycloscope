const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import route handlers
const cycloneRoutes = require('./routes/cyclone.routes');
const predictionRoutes = require('./routes/prediction.routes');
const cyclogenesisRoutes = require('./routes/cyclogenesis.routes');
const chatRoutes = require('./routes/chat.routes');
const systemRoutes = require('./routes/system.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security & utility middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Cycloscope API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Apply global rate limiter to /api
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cyclones', cycloneRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/cyclogenesis', cyclogenesisRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/system', systemRoutes);

// Root redirect to docs
app.get('/', (req, res) => {
  res.json({
    service: 'Cycloscope Backend Orchestrator',
    documentation: '/api-docs',
    health: '/api/system/health',
    version: '1.0.0',
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
