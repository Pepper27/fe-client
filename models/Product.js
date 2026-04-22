const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  material: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  materials: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  colors: [{
    type: String,
    trim: true
  }],
  variants: [variantSchema],
  deletedVariants: [variantSchema],
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
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

// Virtual for product variants count
productSchema.virtual('activeVariants').get(function() {
  return this.variants.filter(variant => variant.status !== 'deleted').length;
});

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
  }
  next();
});

// Method to add variant
productSchema.methods.addVariant = function(variantData) {
  // Check if variant with same SKU already exists (including deleted variants)
  const existingVariant = this.variants.find(v => v.sku === variantData.sku) ||
                          this.deletedVariants.find(v => v.sku === variantData.sku);
  
  if (existingVariant) {
    throw new Error(`Variant with SKU ${variantData.sku} already exists`);
  }
  
  this.variants.push(variantData);
  
  // Update root-level attributes if not already present
  if (variantData.material && !this.materials.includes(variantData.material)) {
    this.materials.push(variantData.material);
  }
  if (variantData.size && !this.sizes.includes(variantData.size)) {
    this.sizes.push(variantData.size);
  }
  if (variantData.color && !this.colors.includes(variantData.color)) {
    this.colors.push(variantData.color);
  }
  
  return this.save();
};

// Method to update variant
productSchema.methods.updateVariant = function(variantId, variantData) {
  const variant = this.variants.id(variantId);
  if (!variant) {
    throw new Error('Variant not found');
  }
  
  // If SKU is being changed, check if new SKU already exists
  if (variantData.sku && variantData.sku !== variant.sku) {
    const existingVariant = this.variants.find(v => v.sku === variantData.sku && v._id.toString() !== variantId) ||
                            this.deletedVariants.find(v => v.sku === variantData.sku);
    
    if (existingVariant) {
      throw new Error(`Variant with SKU ${variantData.sku} already exists`);
    }
  }
  
  Object.assign(variant, variantData);
  
  // Update root-level attributes if needed
  if (variantData.material && !this.materials.includes(variantData.material)) {
    this.materials.push(variantData.material);
  }
  if (variantData.size && !this.sizes.includes(variantData.size)) {
    this.sizes.push(variantData.size);
  }
  if (variantData.color && !this.colors.includes(variantData.color)) {
    this.colors.push(variantData.color);
  }
  
  return this.save();
};

// Method to delete variant (move to deletedVariants array)
productSchema.methods.deleteVariant = function(variantId) {
  const variantIndex = this.variants.findIndex(v => v._id.toString() === variantId);
  if (variantIndex === -1) {
    throw new Error('Variant not found');
  }
  
  const deletedVariant = this.variants.splice(variantIndex, 1)[0];
  deletedVariant.status = 'deleted';
  deletedVariant.deletedAt = new Date();
  
  this.deletedVariants.push(deletedVariant);
  
  return this.save();
};

// Method to restore deleted variant
productSchema.methods.restoreVariant = function(variantId) {
  const deletedVariantIndex = this.deletedVariants.findIndex(v => v._id.toString() === variantId);
  if (deletedVariantIndex === -1) {
    throw new Error('Deleted variant not found');
  }
  
  const restoredVariant = this.deletedVariants.splice(deletedVariantIndex, 1)[0];
  restoredVariant.status = 'active';
  delete restoredVariant.deletedAt;
  
  this.variants.push(restoredVariant);
  
  return this.save();
};

// Static method to find active products
productSchema.statics.findActive = function(query = {}) {
  return this.find({ ...query, deleted: false });
};

module.exports = mongoose.model('Product', productSchema);