const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  parent: {
    type: String,
    default: '',
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  position: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug if not provided
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

// Virtual for child categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: 'slug',
  foreignField: 'parent'
});

// Virtual for parent category
categorySchema.virtual('parentCategory', {
  ref: 'Category',
  localField: 'parent',
  foreignField: 'slug',
  justOne: true
});

// Static method to find root categories (no parent)
categorySchema.statics.findRoot = function() {
  return this.find({
    $or: [
      { parent: '' },
      { parent: null },
      { parent: { $exists: false } }
    ],
    deleted: false
  });
};

// Static method to find active categories
categorySchema.statics.findActive = function(query = {}) {
  return this.find({ ...query, deleted: false });
};

module.exports = mongoose.model('Category', categorySchema);