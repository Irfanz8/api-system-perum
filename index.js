const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
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
    endpoints: {
      keuangan: '/api/keuangan',
      properti: '/api/properti',
      persediaan: '/api/persediaan',
      penjualan: '/api/penjualan'
    }
  });
});

// Import routes
const keuanganRoutes = require('./src/routes/keuangan');
const propertiRoutes = require('./src/routes/properti');
const persediaanRoutes = require('./src/routes/persediaan');
const penjualanRoutes = require('./src/routes/penjualan');

// Use routes
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
app.use('*', (req, res) => {
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