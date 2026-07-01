const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  role: {
    type: String,
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: [true, 'Testimonial content is required'],
    trim: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters'],
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5,
  },
  roomType: {
    type: String,
    trim: true,
    default: '',
  },
  stayDate: {
    type: String,
    trim: true,
    default: '',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

testimonialSchema.index({ isFeatured: -1, sortOrder: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
