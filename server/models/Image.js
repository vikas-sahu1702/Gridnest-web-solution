const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  publicId: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    trim: true,
    default: '',
  },
  caption: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    trim: true,
    default: 'general',
  },
  section: {
    type: String,
    trim: true,
    default: '',
  },
  width: {
    type: Number,
    default: 0,
  },
  height: {
    type: Number,
    default: 0,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  format: {
    type: String,
    default: '',
  },
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

imageSchema.index({ category: 1, section: 1 });
imageSchema.index({ tags: 1 });

module.exports = mongoose.model('Image', imageSchema);
