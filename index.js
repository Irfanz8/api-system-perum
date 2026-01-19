const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/utils/swagger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure Helmet untuk Swagger UI compatibility
app.use(helmet({
  contentSecurityPolicy: false, // Disable untuk Swagger UI
  crossOriginEmbedderPolicy: false
}));

// Configure CORS untuk allow semua origin (untuk Swagger UI)
app.use(cors({
  origin: '*', // Allow semua origin untuk Swagger UI
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(morgan('combined'));

// JSON parser with better error handling
app.use(express.json({ 
  limit: '10mb',
  strict: false // Allow non-strict JSON
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistem Pengelolaan Perumahan',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      keuangan: '/api/keuangan',
      properti: '/api/properti',
      persediaan: '/api/persediaan',
      penjualan: '/api/penjualan'
    }
  });
});

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const keuanganRoutes = require('./src/routes/keuangan');
const propertiRoutes = require('./src/routes/properti');
const persediaanRoutes = require('./src/routes/persediaan');
const penjualanRoutes = require('./src/routes/penjualan');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/properti', propertiRoutes);
app.use('/api/persediaan', persediaanRoutes);
app.use('/api/penjualan', penjualanRoutes);

// Swagger documentation
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Sistem Pengelolaan Perumahan',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError || (err.status === 400 && 'body' in err)) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON syntax. Please check your JSON format.',
      hint: 'Common issues: missing closing quotes (e.g., "email": "value,), unescaped special characters, or malformed JSON structure.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  // Handle other errors
  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;