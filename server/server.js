const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');

// Route imports
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.DOMAIN || 'https://gridnest.com']
  : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Cookie parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve template uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'templates', 'uploads')));

// Serve template dist files (assets first so they're found)
const templateDist = path.join(__dirname, '..', 'templates', 'luxury-hotel', 'dist');
app.use(express.static(templateDist));

// Serve main Gridnest site files
app.use(express.static(path.join(__dirname, '..'), {
  extensions: ['html'],
  index: 'Final Index.html',
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/content', protect, contentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Gridnest Universal API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API root - show available endpoints
app.get('/api', (req, res) => {
  const { CLIENT_NAME } = process.env;
  res.status(200).json({
    success: true,
    message: `${CLIENT_NAME || 'Gridnest'} Universal API`,
    version: '2.0.0',
    client: CLIENT_NAME || 'Gridnest Web Solutions',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      newsletter: '/api/newsletter',
      uploads: '/api/content/upload',
      content: {
        hero: '/api/content/heroes',
        about: '/api/content/abouts',
        rooms: '/api/content/rooms',
        gallery: '/api/content/gallery',
        testimonials: '/api/content/testimonials',
        blogs: '/api/content/blogs',
        bookings: '/api/content/bookings',
        settings: '/api/content/settings',
        seo: '/api/content/seo',
        images: '/api/content/images',
        footer: '/api/content/footers',
        navigation: '/api/content/navigation',
      },
    },
  });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  const templatePath = path.join(__dirname, '..', 'templates', 'luxury-hotel', 'dist', 'index.html');
  if (fs.existsSync(templatePath)) {
    return res.sendFile(templatePath);
  }
  res.sendFile(path.join(__dirname, '..', 'Final Index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ============================================
  ${process.env.CLIENT_NAME || 'Gridnest'} Universal Backend
  ============================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Client:      ${process.env.CLIENT_NAME || 'Gridnest Web Solutions'}
  Port:        ${PORT}
  Frontend:    http://localhost:${PORT}
  API:         http://localhost:${PORT}/api
  Health:      http://localhost:${PORT}/api/health
  ============================================
  `);
});

module.exports = app;
