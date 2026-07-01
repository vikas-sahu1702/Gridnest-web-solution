const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price must be positive'],
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price must be positive'],
  },
  currency: {
    type: String,
    default: 'INR',
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
  }],
  amenities: [{
    name: { type: String, required: true },
    icon: { type: String, default: '' },
  }],
  capacity: {
    type: Number,
    default: 2,
  },
  size: {
    type: String,
    default: '',
  },
  bedType: {
    type: String,
    enum: ['single', 'double', 'queen', 'king', 'twin', 'suite', ''],
    default: '',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  features: [String],
  policies: {
    checkIn: { type: String, default: '2:00 PM' },
    checkOut: { type: String, default: '12:00 PM' },
    cancellation: { type: String, default: '' },
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

roomSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
