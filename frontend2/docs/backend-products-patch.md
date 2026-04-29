Title: Patch for Products List Handler (Express + Mongoose)

Purpose
-------
This patch shows a recommended, maintainable implementation for the products list endpoint that
handles these cases robustly:

- Accepts `categorySlug` query param and resolves it to category id(s) (including children)
- Accepts `filters` JSON query param and honors `filters.categories` (array of ids)
- Supports material/size/color filters that match either root product attributes or variant attributes
- Uses pagination and returns meta

Apply this code to your backend controller that serves GET /api/v1/public/products. Adapt names
and model fields to match your codebase (Product, Category models, etc.).

Example implementation (Express + Mongoose)
------------------------------------------
// controllers/productsController.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

function safeParseFilters(raw) {
  try {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

async function listProducts(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 60);
    const q = (req.query.q || '').trim();
    const categorySlug = (req.query.categorySlug || '').trim();
    const rawFilters = req.query.filters;
    const filters = safeParseFilters(rawFilters);

    const mongoQuery = {};

    // text search / q
    if (q) {
      // adjust to your text index strategy
      mongoQuery['$text'] = { $search: q };
    }

    // Resolve categorySlug -> category id + child ids
    let resolvedCategoryIds = null;
    if (categorySlug) {
      const rootCat = await Category.findOne({ slug: categorySlug }).lean();
      if (rootCat) {
        // include children one level deep (adjust if you store deeper trees)
        const children = await Category.find({ parent: String(rootCat._id) }).select('_id').lean();
        const childIds = (children || []).map((c) => String(c._id));
        resolvedCategoryIds = [String(rootCat._id), ...childIds];
      }
    }

    // If filters.categories provided, use it (it is authoritative)
    if (Array.isArray(filters.categories) && filters.categories.length) {
      mongoQuery['category._id'] = { $in: filters.categories.map(String) };
    } else if (resolvedCategoryIds) {
      mongoQuery['category._id'] = { $in: resolvedCategoryIds };
    }

    // Material filter: check root-level array or variants
    if (Array.isArray(filters.materials) && filters.materials.length) {
      const vals = filters.materials.map(String);
      // Match either product.materials or variants.material
      mongoQuery['$or'] = mongoQuery['$or'] || [];
      mongoQuery['$or'].push({ materials: { $in: vals } }, { 'variants.material': { $in: vals } });
    }

    // Size, color, themes - similar approach
    if (Array.isArray(filters.sizes) && filters.sizes.length) {
      const vals = filters.sizes.map(String);
      mongoQuery['$or'] = mongoQuery['$or'] || [];
      mongoQuery['$or'].push({ sizes: { $in: vals } }, { 'variants.size': { $in: vals } });
    }

    if (Array.isArray(filters.colors) && filters.colors.length) {
      const vals = filters.colors.map(String);
      mongoQuery['$or'] = mongoQuery['$or'] || [];
      mongoQuery['$or'].push({ colors: { $in: vals } }, { 'variants.color': { $in: vals } });
    }

    // Price range against variants.price
    if (filters.price && (filters.price.min !== undefined || filters.price.max !== undefined)) {
      const min = Number(filters.price.min || 0);
      const max = Number(filters.price.max || Number.MAX_SAFE_INTEGER);
      // matches any variant with price in range
      mongoQuery['variants.price'] = { $elemMatch: { $gte: min, $lte: max } };
    }

    // Finally execute the query with pagination
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Product.find(mongoQuery).skip(skip).limit(limit).lean(),
      Product.countDocuments(mongoQuery),
    ]);

    return res.json({ data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('listProducts error', err);
    return res.status(500).json({ error: 'internal_error', message: err.message });
  }
}

module.exports = { listProducts };

Notes
-----
- Adjust the field names to match how your Product model stores category (some schemas store category as an object, others store as categoryId).
- If your category tree is deeper, replace the simple children lookup with a recursive/aggregation query to collect all descendant ids.
- Add appropriate indexes: text index for search, index on category._id, variants.price if needed.

Apply
-----
1) Put this controller in your backend (controllers/productsController.js or similar).
2) Wire the route: router.get('/api/v1/public/products', productsController.listProducts)
3) Restart your backend and test with the same curl commands used earlier.
