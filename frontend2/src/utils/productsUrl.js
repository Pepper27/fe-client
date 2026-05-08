// Utility to build canonical product listing URLs using `filters` JSON query param
export function buildProductsUrl({ categorySlug, q, filters, type, material, color, size, collection, min, max } = {}) {
  const params = {};
  if (categorySlug) params.categorySlug = String(categorySlug);
  if (q) params.q = String(q);

  // Short human-friendly params
  if (type) params.type = String(type);
  if (material) params.material = String(material);
  if (color) params.color = String(color);
  if (size) params.size = String(size);
  if (collection) params.collection = String(collection);
  if (min !== undefined && min !== null) params.min = String(min);
  if (max !== undefined && max !== null) params.max = String(max);

  // Legacy filters JSON (kept for compatibility)
  if (filters && Object.keys(filters).length) {
    try {
      params.filters = JSON.stringify(filters);
    } catch (e) {
      // ignore invalid filters
    }
  }

  const qs = new URLSearchParams(params).toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

// Map ad-hoc query object (e.g. { price_gte, price_lte, material, collection })
// into canonical filters shape used by ProductsPage/Sidebar.
export function mapQueryToFilters(query = {}) {
  const filters = {};

  // price range
  const pg = query.price_gte || query.price_min || query.priceGte || query.min;
  const pl = query.price_lte || query.price_max || query.priceLte || query.max;
  if (pg !== undefined || pl !== undefined) {
    filters.price = {
      min: pg ? Number(pg) : 0,
      max: pl ? Number(pl) : Number.MAX_SAFE_INTEGER,
    };
  }

  // Helper: split comma-separated values into array (trim, ignore empty)
  const splitCSV = (v) => {
    if (!v && v !== 0) return [];
    return String(v).split(',').map(s => s.trim()).filter(Boolean);
  };

  // type -> categories (short param)
  if (query.type) {
    const arr = splitCSV(query.type);
    if (arr.length) filters.categories = arr;
  }

  // material -> materials array (multi-valued)
  if (query.material) {
    const arr = splitCSV(query.material);
    if (arr.length) filters.materials = arr;
  }

  // collection -> collections array (multi-valued)
  if (query.collection) {
    const arr = splitCSV(query.collection);
    if (arr.length) filters.collections = arr;
  }

  // theme, size, color (multi-valued supported)
  if (query.theme) {
    const arr = splitCSV(query.theme);
    if (arr.length) filters.themes = arr;
  }
  if (query.size) {
    const arr = splitCSV(query.size);
    if (arr.length) filters.sizes = arr;
  }
  if (query.color) {
    const arr = splitCSV(query.color);
    if (arr.length) filters.colors = arr;
  }

  return filters;
}

export default buildProductsUrl;
