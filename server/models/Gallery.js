const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  image: {
    type: String,
    required: [true, 'Gallery image is required'],
  },
  thumbnail: {
    type: String,
  },
  alt: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    trim: true,
    default: 'uncategorized',
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
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

gallerySchema.index({ category: 1, sortOrder: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
