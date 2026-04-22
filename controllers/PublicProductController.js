const Product = require('../../models/Product');
const Category = require('../../models/Category');

class PublicProductController {
  // Get products with filtering and pagination
  static async getProducts(req, res) {
    try {
      // Parse query parameters
      const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        category,
        minPrice,
        maxPrice,
        materials,
        sizes,
        colors,
        search,
        featured,
        inStock
      } = req.query;

      // Build filter conditions
      const filter = { deleted: false };

      // Category filter (include subcategories)
      if (category) {
        const categoryIds = [];
        
        // Add the main category
        const mainCategory = await Category.findOne({ 
          slug: category, 
          deleted: false 
        });
        
        if (mainCategory) {
          categoryIds.push(mainCategory._id);
          
          // Find all subcategories recursively
          const findSubCategories = async (parentId) => {
            const children = await Category.find({
              parent: parentId,
              deleted: false
            });
            
            for (const child of children) {
              categoryIds.push(child._id);
              await findSubCategories(child.slug);
            }
          };
          
          await findSubCategories(mainCategory.slug);
        }
        
        if (categoryIds.length > 0) {
          filter.category = { $in: categoryIds };
        }
      }

      // Price range filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // Material filter
      if (materials) {
        const materialArray = materials.split(',').map(m => m.trim());
        filter.materials = { $in: materialArray };
      }

      // Size filter
      if (sizes) {
        const sizeArray = sizes.split(',').map(s => s.trim());
        filter.sizes = { $in: sizeArray };
      }

      // Color filter
      if (colors) {
        const colorArray = colors.split(',').map(c => c.trim());
        filter.colors = { $in: colorArray };
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      // Featured filter
      if (featured !== undefined) {
        filter.featured = featured === 'true' || featured === '1';
      }

      // Stock filter
      if (inStock !== undefined) {
        if (inStock === 'true' || inStock === '1') {
          filter['variants.stock'] = { $gt: 0 };
        }
      }

      // Sort configuration
      const sortConfig = {};
      const validSortFields = ['createdAt', 'name', 'price', 'featured'];
      const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
      const sortOrder = order === 'asc' ? 1 : -1;
      
      sortConfig[sortField] = sortOrder;

      // Calculate skip for pagination
      const skip = (Number(page) - 1) * Number(limit);

      // Execute query with aggregation for proper variant filtering
      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            // Calculate minimum price from variants
            minVariantPrice: { $min: '$variants.price' },
            // Calculate total stock
            totalStock: { $sum: '$variants.stock' },
            // Count active variants
            activeVariantCount: {
              $size: {
                $filter: {
                  input: '$variants',
                  as: 'variant',
                  cond: { $ne: ['$$variant.status', 'deleted'] }
                }
              }
            }
          }
        },
        {
          $facet: {
            products: [
              { $sort: sortConfig },
              { $skip: skip },
              { $limit: Number(limit) },
              {
                $lookup: {
                  from: 'categories',
                  localField: 'category',
                  foreignField: '_id',
                  as: 'category'
                }
              },
              {
                $unwind: {
                  path: '$category',
                  preserveNullAndEmptyArrays: true
                }
              }
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ];

      const result = await Product.aggregate(pipeline);
      
      const products = result[0].products;
      const totalCount = result[0].totalCount[0]?.count || 0;

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / Number(limit));
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // Get available filters
      const filters = await PublicProductController.getAvailableFilters(filter);

      return res.status(200).json({
        data: products,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNext,
          hasPrev,
          limit: Number(limit)
        },
        filters
      });

    } catch (error) {
      console.error('Error getting products:', error);
      return res.status(500).json({
        message: 'Failed to get products',
        error: error.message
      });
    }
  }

  // Get available filters for products
  static async getAvailableFilters(baseFilter = {}) {
    try {
      const filter = { ...baseFilter, deleted: false };

      // Get unique materials
      const materials = await Product.distinct('materials', filter);
      
      // Get unique sizes
      const sizes = await Product.distinct('sizes', filter);
      
      // Get unique colors
      const colors = await Product.distinct('colors', filter);
      
      // Get price range
      const priceRange = await Product.aggregate([
        { $match: filter },
        { $unwind: '$variants' },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$variants.price' },
            maxPrice: { $max: '$variants.price' }
          }
        }
      ]);

      const minPrice = priceRange[0]?.minPrice || 0;
      const maxPrice = priceRange[0]?.maxPrice || 0;

      // Get categories with product counts
      const categories = await Category.aggregate([
        { $match: { deleted: false } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $project: {
            name: 1,
            slug: 1,
            parent: 1,
            productCount: {
              $size: {
                $filter: {
                  input: '$products',
                  as: 'product',
                  cond: { $ne: ['$$product.deleted', true] }
                }
              }
            }
          }
        },
        {
          $match: {
            productCount: { $gt: 0 }
          }
        },
        {
          $sort: { productCount: -1, name: 1 }
        }
      ]);

      return {
        materials: materials.filter(m => m).sort(),
        sizes: sizes.filter(s => s).sort(),
        colors: colors.filter(c => c).sort(),
        priceRange: {
          min: Math.floor(minPrice),
          max: Math.ceil(maxPrice)
        },
        categories
      };
    } catch (error) {
      console.error('Error getting available filters:', error);
      return {
        materials: [],
        sizes: [],
        colors: [],
        priceRange: { min: 0, max: 0 },
        categories: []
      };
    }
  }

  // Get featured products
  static async getFeaturedProducts(req, res) {
    try {
      const { limit = 12 } = req.query;

      const products = await Product.find({
        deleted: false,
        featured: true,
        'variants.stock': { $gt: 0 }
      })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

      return res.status(200).json({
        data: products
      });
    } catch (error) {
      console.error('Error getting featured products:', error);
      return res.status(500).json({
        message: 'Failed to get featured products',
        error: error.message
      });
    }
  }

  // Get related products
  static async getRelatedProducts(req, res) {
    try {
      const { productId } = req.params;
      const { limit = 6 } = req.query;

      // Get the main product
      const mainProduct = await Product.findById(productId)
        .populate('category', 'name slug _id');

      if (!mainProduct) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }

      // Find related products based on:
      // 1. Same category
      // 2. Similar materials/sizes/colors
      // 3. Same price range

      const relatedProducts = await Product.find({
        deleted: false,
        _id: { $ne: productId },
        $or: [
          { category: mainProduct.category._id },
          { materials: { $in: mainProduct.materials } },
          { sizes: { $in: mainProduct.sizes } },
          { colors: { $in: mainProduct.colors } }
        ]
      })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

      return res.status(200).json({
        data: relatedProducts
      });
    } catch (error) {
      console.error('Error getting related products:', error);
      return res.status(500).json({
        message: 'Failed to get related products',
        error: error.message
      });
    }
  }
}

module.exports = PublicProductController;