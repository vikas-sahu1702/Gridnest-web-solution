const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Hero title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  backgroundImage: {
    type: String,
    default: '',
  },
  backgroundVideo: {
    type: String,
    default: '',
  },
  overlay: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)',
  },
  ctaText: {
    type: String,
    trim: true,
    default: 'Book Now',
  },
  ctaLink: {
    type: String,
    trim: true,
    default: '#rooms',
  },
  secondaryCtaText: {
    type: String,
    trim: true,
    default: '',
  },
  secondaryCtaLink: {
    type: String,
    trim: true,
    default: '',
  },
  badge: {
    type: String,
    trim: true,
    default: '',
  },
  features: [{
    icon: { type: String, default: '' },
    text: { type: String, default: '' },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hero', heroSchema);
