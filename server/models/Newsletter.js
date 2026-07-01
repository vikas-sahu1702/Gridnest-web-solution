const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    honeypot: { type: String, default: '' },
    ipAddress: { type: String },
    status: {
      type: String,
      enum: ['active', 'unsubscribed', 'bounced'],
      default: 'active',
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

newsletterSchema.index({ status: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
