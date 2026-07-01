const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
  roomName: {
    type: String,
    trim: true,
    default: '',
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
  },
  adults: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 adult required'],
  },
  children: {
    type: Number,
    default: 0,
    min: [0, 'Children cannot be negative'],
  },
  rooms: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 room required'],
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid',
  },
  source: {
    type: String,
    trim: true,
    default: 'website',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
