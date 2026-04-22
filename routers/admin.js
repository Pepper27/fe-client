const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/ProductController');
const CategoryController = require('../controllers/CategoryController');

// Product routes
router.post('/products', ProductController.createProduct);
router.put('/products/:id', ProductController.updateProduct);
router.get('/products/:id', ProductController.getProductById);
router.delete('/products/:id', ProductController.deleteProduct);

// Product variant routes
router.post('/products/:productId/variants', ProductController.addVariant);
router.put('/products/:productId/variants/:variantId', ProductController.updateVariant);
router.delete('/products/:productId/variants/:variantId', ProductController.deleteVariant);
router.get('/products/:productId/deleted-variants', ProductController.getDeletedVariants);
router.post('/products/:productId/variants/:variantId/restore', ProductController.restoreVariant);

// Category routes
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.get('/categories/:id', CategoryController.getCategoryById);
router.delete('/categories/:id', CategoryController.deleteCategory);

// Additional admin routes
router.get('/stats', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Category = require('../models/Category');

    const [totalProducts, activeProducts, totalCategories, activeCategories] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ deleted: false }),
      Category.countDocuments(),
      Category.countDocuments({ deleted: false })
    ]);

    // Get low stock variants
    const lowStockProducts = await Product.find({
      deleted: false,
      'variants.stock': { $lt: 10, $gt: 0 }
    })
    .select('name variants.stock')
    .limit(10);

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      deleted: false,
      'variants.stock': 0
    })
    .select('name variants.stock')
    .limit(10);

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        totalCategories,
        activeCategories
      },
      lowStockProducts: lowStockProducts.length,
      outOfStockProducts: outOfStockProducts.length,
      lowStockDetails: lowStockProducts,
      outOfStockDetails: outOfStockProducts
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

module.exports = router;