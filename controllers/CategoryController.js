const Category = require('../../models/Category');

class CategoryController {
  // Get all active categories
  static async getCategories(req, res) {
    try {
      const onlyRoot = String(req.query.root || "1").trim() !== "0";
      const includeChildren = String(req.query.includeChildren || "0").trim() === "1";

      const find = { deleted: false };
      if (onlyRoot) {
        // `parent` is stored as string in this codebase; root is commonly empty.
        find.$or = [{ parent: "" }, { parent: null }, { parent: { $exists: false } }];
      }

      let query = Category.find(find)
        .select("name slug avatar parent position")
        .sort({ position: 1, createdAt: -1 });

      if (includeChildren) {
        query = query.populate('children', 'name slug avatar parent position');
      }

      const categories = await query.lean();

      return res.status(200).json({ 
        data: categories || [] 
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Server error", 
        error: error.message 
      });
    }
  }

  // Get category by ID
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ 
        _id: id, 
        deleted: false 
      }).populate('children', 'name slug avatar parent position');

      if (!category) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      return res.json({
        category
      });
    } catch (error) {
      console.error('Error getting category:', error);
      return res.status(500).json({
        message: 'Failed to get category',
        error: error.message
      });
    }
  }

  // Get category by slug
  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const category = await Category.findOne({ 
        slug, 
        deleted: false 
      }).populate('children', 'name slug avatar parent position');

      if (!category) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      return res.json({
        category
      });
    } catch (error) {
      console.error('Error getting category by slug:', error);
      return res.status(500).json({
        message: 'Failed to get category',
        error: error.message
      });
    }
  }

  // Create category
  static async createCategory(req, res) {
    try {
      const {
        name,
        description,
        parent,
        avatar,
        position,
        status
      } = req.body;

      // Check if parent exists if provided
      if (parent) {
        const parentCategory = await Category.findOne({
          slug: parent,
          deleted: false
        });

        if (!parentCategory) {
          return res.status(400).json({
            message: 'Parent category not found'
          });
        }
      }

      const category = new Category({
        name,
        description,
        parent: parent || '',
        avatar,
        position: position || 0,
        status: status || 'active'
      });

      await category.save();

      return res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        message: 'Failed to create category',
        error: error.message
      });
    }
  }

  // Update category
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        parent,
        avatar,
        position,
        status
      } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      // Check if parent exists if provided and different from current
      if (parent && parent !== category.parent) {
        const parentCategory = await Category.findOne({
          slug: parent,
          deleted: false,
          _id: { $ne: id } // Prevent self-reference
        });

        if (!parentCategory) {
          return res.status(400).json({
            message: 'Parent category not found'
          });
        }

        // Prevent circular reference
        if (parentCategory._id.toString() === id) {
          return res.status(400).json({
            message: 'Cannot set category as its own parent'
          });
        }
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (parent !== undefined) updateData.parent = parent;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (position !== undefined) updateData.position = position;
      if (status !== undefined) updateData.status = status;

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({
        message: 'Failed to update category',
        error: error.message
      });
    }
  }

  // Delete category (soft delete)
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      // Check if category has children
      const childrenCount = await Category.countDocuments({
        parent: category.slug,
        deleted: false
      });

      if (childrenCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete category with child categories',
          childrenCount
        });
      }

      // Check if category has products
      const Product = require('../../models/Product');
      const productCount = await Product.countDocuments({
        category: id,
        deleted: false
      });

      if (productCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete category with associated products',
          productCount
        });
      }

      // Soft delete
      category.deleted = true;
      category.deletedAt = new Date();
      await category.save();

      return res.json({
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        message: 'Failed to delete category',
        error: error.message
      });
    }
  }

  // Get category tree
  static async getCategoryTree(req, res) {
    try {
      // Get all root categories with their children
      const rootCategories = await Category.findRoot()
        .populate({
          path: 'children',
          populate: {
            path: 'children',
            populate: {
              path: 'children'
            }
          }
        })
        .sort({ position: 1, createdAt: -1 });

      return res.json({
        tree: rootCategories
      });
    } catch (error) {
      console.error('Error getting category tree:', error);
      return res.status(500).json({
        message: 'Failed to get category tree',
        error: error.message
      });
    }
  }
}

module.exports = CategoryController;