const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters'],
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  image: {
    type: String,
    default: '',
  },
  author: {
    name: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  tags: [String],
  category: {
    type: String,
    trim: true,
    default: 'uncategorized',
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  readTime: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

blogSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
