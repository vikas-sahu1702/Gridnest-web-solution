const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters'],
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters'],
  },
  logo: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  primaryColor: {
    type: String,
    default: '#d4af37',
  },
  secondaryColor: {
    type: String,
    default: '#1a1a2e',
  },
  accentColor: {
    type: String,
    default: '#e8c547',
  },
  fontHeading: {
    type: String,
    default: 'Playfair Display',
  },
  fontBody: {
    type: String,
    default: 'Inter',
  },
  contactInfo: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { type: String, default: '' },
    mapUrl: { type: String, default: '' },
  },
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: '' },
  }],
  currency: {
    type: String,
    default: 'INR',
  },
  currencySymbol: {
    type: String,
    default: '₹',
  },
  language: {
    type: String,
    default: 'en',
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  bookingEmail: {
    type: String,
    default: '',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Setting', settingSchema);
