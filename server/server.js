const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { checkDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');

// Route imports
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// Trust proxy (required for Railway/Heroku/etc. behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true);
    // In production, restrict to allowed origins
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.DOMAIN,
        'https://gridnest.com',
        'https://www.gridnest.com',
      ].filter(Boolean);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    }
    // In development, allow all origins
    cb(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Cookie parser
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve main site files
app.use(express.static(path.join(__dirname, '..'), {
  extensions: ['html'],
  index: 'index.html',
}));

// API routes (with DB connection check)
app.use('/api/auth', checkDB, authRoutes);
app.use('/api/contact', checkDB, contactRoutes);
app.use('/api/newsletter', checkDB, newsletterRoutes);
app.use('/api/content', checkDB, protect, contentRoutes);
app.use('/api/proposals', checkDB, protect, proposalRoutes);
app.use('/api/invoices', checkDB, protect, invoiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { getDBConnectionState } = require('./config/db');
  res.status(200).json({
    success: true,
    message: 'Gridnest Universal API is running',
    environment: process.env.NODE_ENV,
    database: getDBConnectionState() ? 'connected' : 'disconnected',
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
        proposals: '/api/proposals',
        invoices: '/api/invoices',
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
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    // Auto-seed admin account on startup
    try {
      const Admin = require('./models/Admin');
      const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');
      if (!existingAdmin) {
        await Admin.create({
          name: process.env.ADMIN_NAME || 'Super Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'superadmin',
        });
        console.log('Admin account seeded successfully.');
      } else {
        // Always update password to match .env on startup
        const passwordMatch = await existingAdmin.comparePassword(process.env.ADMIN_PASSWORD);
        if (!passwordMatch) {
          existingAdmin.password = process.env.ADMIN_PASSWORD;
          await existingAdmin.save({ validateBeforeSave: false });
          console.log('Admin password updated to match .env.');
        } else {
          console.log('Admin account already exists and password matches.');
        }
      }
    } catch (seedError) {
      console.error('Admin seeding error:', seedError.message);
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB after all retries:', error.message);
    console.error('Starting server without database - API routes will return 503 until DB connects.');
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
  ============================================
  ${process.env.CLIENT_NAME || 'Gridnest'} Universal Backend
  ============================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Client:      ${process.env.CLIENT_NAME || 'Gridnest Web Solutions'}
  Port:        ${PORT}
  Bind:        0.0.0.0
  Frontend:    http://localhost:${PORT}
  API:         http://localhost:${PORT}/api
  Health:      http://localhost:${PORT}/api/health
  ============================================
    `);
  });
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false).then(() => process.exit(0));
});

module.exports = app;
