const mongoose = require('mongoose');

const navItemSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Navigation label is required'],
    trim: true,
  },
  link: {
    type: String,
    required: [true, 'Navigation link is required'],
    trim: true,
  },
  isExternal: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  children: [{
    label: { type: String, required: true },
    link: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
    description: { type: String, default: '' },
  }],
}, { _id: false });

const navigationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Navigation name is required'],
    trim: true,
    default: 'main-menu',
  },
  items: [navItemSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Navigation', navigationSchema);
