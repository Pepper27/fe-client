const express = require('express');
const router = express.Router();

const PublicProductController = require('../controllers/PublicProductController');
const CategoryController = require('../controllers/CategoryController');

// Product routes
router.get('/products', PublicProductController.getProducts);
router.get('/products/featured', PublicProductController.getFeaturedProducts);
router.get('/products/:slug', PublicProductController.getProductBySlug);
router.get('/products/:productId/related', PublicProductController.getRelatedProducts);

// Category routes
router.get('/categories', CategoryController.getCategories);
router.get('/categories/tree', CategoryController.getCategoryTree);
router.get('/categories/:slug', CategoryController.getCategoryBySlug);

// Get available filters
router.get('/filters', async (req, res) => {
  try {
    const PublicProductController = require('../controllers/PublicProductController');
    const filters = await PublicProductController.getAvailableFilters();
    return res.json({ filters });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to get filters',
      error: error.message
    });
  }
});

module.exports = router;