// Utility to build canonical product listing URLs using `filters` JSON query param
export function buildProductsUrl({ categorySlug, q, filters } = {}) {
  const params = {};
  if (categorySlug) params.categorySlug = String(categorySlug);
  if (q) params.q = String(q);
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
  const pg = query.price_gte || query.price_min || query.priceGte;
  const pl = query.price_lte || query.price_max || query.priceLte;
  if (pg || pl) {
    filters.price = {
      min: pg ? Number(pg) : 0,
      max: pl ? Number(pl) : undefined,
    };
  }

  // material -> materials array
  if (query.material) filters.materials = [String(query.material)];

  // collection -> collections array
  if (query.collection) filters.collections = [String(query.collection)];

  // other single params that Sidebar uses: theme, size, color
  if (query.theme) filters.themes = [String(query.theme)];
  if (query.size) filters.sizes = [String(query.size)];
  if (query.color) filters.colors = [String(query.color)];

  return filters;
}

export default buildProductsUrl;
