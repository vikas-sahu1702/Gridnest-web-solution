const mongoose = require('mongoose');

const footerColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  links: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
  }],
}, { _id: false });

const footerSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  columns: [footerColumnSchema],
  socialLinks: [{
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: '' },
  }],
  bottomText: {
    type: String,
    trim: true,
    default: '',
  },
  copyright: {
    type: String,
    trim: true,
    default: '',
  },
  showNewsletter: {
    type: Boolean,
    default: false,
  },
  newsletterTitle: {
    type: String,
    trim: true,
    default: 'Subscribe to our newsletter',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Footer', footerSchema);
