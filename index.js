const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/utils/swagger');
const generateSwaggerUIHTML = require('./src/utils/swagger-ui-html');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Swagger documentation - harus didefinisikan sebelum routes lain
// Check if running on Vercel (serverless)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

if (isVercel) {
  // Use custom HTML with CDN for Vercel compatibility
  // Handle Swagger UI static files requests first (more specific route)
  app.get('/api-docs/*', (req, res) => {
    // Redirect static file requests to CDN
    const file = req.path.replace('/api-docs/', '');
    if (file.includes('.css') || file.includes('.js') || file.includes('.png') || file.includes('.ico')) {
      res.redirect(`https://unpkg.com/swagger-ui-dist@5.10.3/${file}`);
    } else {
      res.redirect('/api-docs');
    }
  });
  
  // Main Swagger UI page
  app.get('/api-docs', (req, res) => {
    try {
      const html = generateSwaggerUIHTML(swaggerSpec);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error generating Swagger UI:', error);
      res.status(500).send('Error loading API documentation');
    }
  });
} else {
  // Use standard Swagger UI for local development
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
}

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/keuangan', keuanganRoutes);
app.use('/api/properti', propertiRoutes);
app.use('/api/persediaan', persediaanRoutes);
app.use('/api/penjualan', penjualanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
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

// Listen hanya jika run langsung (development/local)
// Vercel akan handle serverless function sendiri
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export untuk Vercel serverless function
module.exports = app;