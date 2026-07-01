const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'About title is required'],
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
    required: [true, 'About description is required'],
    trim: true,
  },
  mission: {
    type: String,
    trim: true,
  },
  vision: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  image2: {
    type: String,
    default: '',
  },
  stats: [{
    label: { type: String, required: true },
    value: { type: String, required: true },
    suffix: { type: String, default: '' },
    icon: { type: String, default: '' },
  }],
  features: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('About', aboutSchema);
