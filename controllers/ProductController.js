const Product = require('../../models/Product');
const Category = require('../../models/Category');

class ProductController {
  // Create a new product with variants
  static async createProduct(req, res) {
    try {
      const {
        name,
        description,
        category,
        variants,
        tags,
        featured
      } = req.body;

      // Validate required fields
      if (!name || !category || !variants || !variants.length) {
        return res.status(400).json({
          message: 'Name, category, and at least one variant are required'
        });
      }

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          message: 'Category not found'
        });
      }

      // Extract unique materials, sizes, and colors from variants
      const materials = [...new Set(variants.map(v => v.material))];
      const sizes = [...new Set(variants.map(v => v.size))];
      const colors = [...new Set(variants.map(v => v.color))];

      // Check for duplicate SKUs within the variants
      const skuSet = new Set();
      const duplicateSkus = [];
      
      variants.forEach(variant => {
        if (skuSet.has(variant.sku)) {
          duplicateSkus.push(variant.sku);
        }
        skuSet.add(variant.sku);
      });

      if (duplicateSkus.length > 0) {
        return res.status(400).json({
          message: 'Duplicate SKUs found',
          duplicateSkus
        });
      }

      // Check if any SKU already exists in the database
      const existingSkus = await Product.find({
        $or: [
          { 'variants.sku': { $in: variants.map(v => v.sku) } },
          { 'deletedVariants.sku': { $in: variants.map(v => v.sku) } }
        ]
      }).select('name variants.sku deletedVariants.sku');

      if (existingSkus.length > 0) {
        const conflictingSkus = [];
        existingSkus.forEach(product => {
          product.variants.forEach(v => {
            if (variants.find(nv => nv.sku === v.sku)) {
              conflictingSkus.push({
                sku: v.sku,
                product: product.name
              });
            }
          });
          product.deletedVariants.forEach(v => {
            if (variants.find(nv => nv.sku === v.sku)) {
              conflictingSkus.push({
                sku: v.sku,
                product: product.name,
                deleted: true
              });
            }
          });
        });

        return res.status(400).json({
          message: 'Some SKUs already exist in other products',
          conflictingSkus
        });
      }

      // Create the product
      const product = new Product({
        name,
        description,
        category,
        materials,
        sizes,
        colors,
        variants,
        tags: tags || [],
        featured: featured || false
      });

      await product.save();

      // Populate category information
      await product.populate('category', 'name slug');

      return res.status(201).json({
        message: 'Product created successfully',
        product
      });

    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        message: 'Failed to create product',
        error: error.message
      });
    }
  }

  // Update a product and its variants
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        category,
        variants,
        tags,
        featured,
        status
      } = req.body;

      // Find the product
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Check if category exists if provided
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(400).json({
            message: 'Category not found'
          });
        }
      }

      // Store current variants and deleted variants for comparison
      const currentVariantIds = product.variants.map(v => v._id.toString());
      const currentVariantSkus = product.variants.map(v => v.sku);
      const deletedVariantSkus = product.deletedVariants.map(v => v.sku);

      // Prepare update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (featured !== undefined) updateData.featured = featured;
      if (status !== undefined) updateData.status = status;

      // Handle variants if provided
      if (variants !== undefined && Array.isArray(variants)) {
        // Extract unique materials, sizes, and colors from variants
        updateData.materials = [...new Set(variants.map(v => v.material))];
        updateData.sizes = [...new Set(variants.map(v => v.size))];
        updateData.colors = [...new Set(variants.map(v => v.color))];

        // Check for duplicate SKUs within the new variants
        const skuSet = new Set();
        const duplicateSkus = [];
        
        variants.forEach(variant => {
          if (skuSet.has(variant.sku)) {
            duplicateSkus.push(variant.sku);
          }
          skuSet.add(variant.sku);
        });

        if (duplicateSkus.length > 0) {
          return res.status(400).json({
            message: 'Duplicate SKUs found in update variants',
            duplicateSkus
          });
        }

        // Check if any SKU conflicts with existing ones (including deleted variants)
        const conflictingSkus = [];
        
        variants.forEach(variant => {
          // Check against current variants (excluding the one being updated)
          if (variant._id) {
            const currentVariant = product.variants.id(variant._id);
            if (currentVariant && currentVariant.sku !== variant.sku) {
              // SKU is being changed
              if (currentVariantSkus.includes(variant.sku) || deletedVariantSkus.includes(variant.sku)) {
                conflictingSkus.push({
                  sku: variant.sku,
                  action: 'SKU change conflict'
                });
              }
            }
          } else {
            // New variant
            if (currentVariantSkus.includes(variant.sku) || deletedVariantSkus.includes(variant.sku)) {
              conflictingSkus.push({
                sku: variant.sku,
                action: 'New variant conflict'
              });
            }
          }
        });

        // Check against other products in the database
        const otherProductsSkus = await Product.find({
          _id: { $ne: id },
          $or: [
            { 'variants.sku': { $in: variants.map(v => v.sku) } },
            { 'deletedVariants.sku': { $in: variants.map(v => v.sku) } }
          ]
        }).select('name variants.sku deletedVariants.sku');

        otherProductsSkus.forEach(otherProduct => {
          variants.forEach(variant => {
            const skuConflict = otherProduct.variants.find(v => v.sku === variant.sku) ||
                              otherProduct.deletedVariants.find(v => v.sku === variant.sku);
            if (skuConflict) {
              conflictingSkus.push({
                sku: variant.sku,
                product: otherProduct.name,
                existing: true
              });
            }
          });
        });

        if (conflictingSkus.length > 0) {
          return res.status(400).json({
            message: 'SKU conflicts detected',
            conflictingSkus
          });
        }

        // Process variants
        const newVariants = [];
        const variantIdsToDelete = [];
        const deletedVariants = [...product.deletedVariants];

        variants.forEach(variant => {
          if (variant._id) {
            // Update existing variant
            const existingVariant = product.variants.id(variant._id);
            if (existingVariant) {
              Object.assign(existingVariant, variant);
              newVariants.push(existingVariant);
              // Remove from current variant IDs (to identify deleted ones)
              const index = currentVariantIds.indexOf(variant._id.toString());
              if (index > -1) {
                currentVariantIds.splice(index, 1);
              }
            }
          } else {
            // Add new variant
            newVariants.push(variant);
          }
        });

        // Any remaining currentVariantIds are deleted variants
        currentVariantIds.forEach(variantId => {
          const deletedVariant = product.variants.id(variantId);
          if (deletedVariant) {
            deletedVariant.status = 'deleted';
            deletedVariant.deletedAt = new Date();
            deletedVariants.push(deletedVariant.toObject());
          }
        });

        updateData.variants = newVariants;
        updateData.deletedVariants = deletedVariants;
      }

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('category', 'name slug');

      return res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({
        message: 'Failed to update product',
        error: error.message
      });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
        .populate('category', 'name slug')
        .lean();

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json({
        product
      });

    } catch (error) {
      console.error('Error getting product:', error);
      return res.status(500).json({
        message: 'Failed to get product',
        error: error.message
      });
    }
  }

  // Get product by slug
  static async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug, deleted: false })
        .populate('category', 'name slug')
        .lean();

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json({
        product
      });

    } catch (error) {
      console.error('Error getting product by slug:', error);
      return res.status(500).json({
        message: 'Failed to get product',
        error: error.message
      });
    }
  }

  // Add variant to product
  static async addVariant(req, res) {
    try {
      const { productId } = req.params;
      const variantData = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Check if SKU already exists
      const existingVariant = product.variants.find(v => v.sku === variantData.sku) ||
                              product.deletedVariants.find(v => v.sku === variantData.sku);
      
      if (existingVariant) {
        return res.status(400).json({
          message: `Variant with SKU ${variantData.sku} already exists`,
          existing: true
        });
      }

      // Check if SKU exists in other products
      const otherProduct = await Product.findOne({
        _id: { $ne: productId },
        $or: [
          { 'variants.sku': variantData.sku },
          { 'deletedVariants.sku': variantData.sku }
        ]
      });

      if (otherProduct) {
        return res.status(400).json({
          message: `Variant with SKU ${variantData.sku} exists in another product`,
          existingProduct: otherProduct.name
        });
      }

      await product.addVariant(variantData);

      const updatedProduct = await Product.findById(productId)
        .populate('category', 'name slug');

      return res.json({
        message: 'Variant added successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error adding variant:', error);
      return res.status(500).json({
        message: 'Failed to add variant',
        error: error.message
      });
    }
  }

  // Update variant
  static async updateVariant(req, res) {
    try {
      const { productId, variantId } = req.params;
      const variantData = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      await product.updateVariant(variantId, variantData);

      const updatedProduct = await Product.findById(productId)
        .populate('category', 'name slug');

      return res.json({
        message: 'Variant updated successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error updating variant:', error);
      return res.status(500).json({
        message: 'Failed to update variant',
        error: error.message
      });
    }
  }

  // Delete variant (move to deletedVariants)
  static async deleteVariant(req, res) {
    try {
      const { productId, variantId } = req.params;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      await product.deleteVariant(variantId);

      const updatedProduct = await Product.findById(productId)
        .populate('category', 'name slug');

      return res.json({
        message: 'Variant deleted successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error deleting variant:', error);
      return res.status(500).json({
        message: 'Failed to delete variant',
        error: error.message
      });
    }
  }

  // Restore deleted variant
  static async restoreVariant(req, res) {
    try {
      const { productId, variantId } = req.params;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      await product.restoreVariant(variantId);

      const updatedProduct = await Product.findById(productId)
        .populate('category', 'name slug');

      return res.json({
        message: 'Variant restored successfully',
        product: updatedProduct
      });

    } catch (error) {
      console.error('Error restoring variant:', error);
      return res.status(500).json({
        message: 'Failed to restore variant',
        error: error.message
      });
    }
  }

  // Get deleted variants for a product
  static async getDeletedVariants(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId)
        .select('deletedVariants')
        .lean();

      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      return res.json({
        deletedVariants: product.deletedVariants
      });

    } catch (error) {
      console.error('Error getting deleted variants:', error);
      return res.status(500).json({
        message: 'Failed to get deleted variants',
        error: error.message
      });
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Soft delete
      product.deleted = true;
      product.deletedAt = new Date();
      await product.save();

      return res.json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({
        message: 'Failed to delete product',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;