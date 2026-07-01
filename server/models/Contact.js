const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10}$/,
        'Please provide a valid 10-digit phone number',
      ],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    service: {
      type: String,
      required: [true, 'Please select a service'],
      enum: {
        values: [
          'hotel',
          'restaurant',
          'corporate',
          'seo',
          'maintenance',
          'template',
          'other',
        ],
        message: 'Please select a valid service option',
      },
    },
    message: {
      type: String,
      required: [true, 'Project details are required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    templateSource: {
      type: String,
      trim: true,
      default: '',
    },
    honeypot: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

module.exports = mongoose.model('Contact', contactSchema);
