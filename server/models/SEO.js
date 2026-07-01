const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  page: {
    type: String,
    required: [true, 'Page identifier is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    trim: true,
    maxlength: [70, 'SEO title should not exceed 70 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description should not exceed 160 characters'],
  },
  keywords: [String],
  ogTitle: {
    type: String,
    trim: true,
    maxlength: [70, 'OG title should not exceed 70 characters'],
  },
  ogDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'OG description should not exceed 200 characters'],
  },
  ogImage: {
    type: String,
    default: '',
  },
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'app', 'player'],
    default: 'summary_large_image',
  },
  canonical: {
    type: String,
    trim: true,
    default: '',
  },
  robots: {
    type: String,
    default: 'index, follow',
  },
  structuredData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SEO', seoSchema);
