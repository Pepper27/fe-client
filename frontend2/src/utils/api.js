// Determine API base at request-time so runtime-injected window.__API_BASE
// (set by index.js after fetching /config.json) is honored even when
// modules import this file before bootstrap runs.
export function getApiBase() {
  if (typeof window !== "undefined" && window.__API_BASE)
    return window.__API_BASE;
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE
  )
    return process.env.REACT_APP_API_BASE;

  // For development, use the hardcoded URL
  // In production, this should be set via environment variable or config.json
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "http://localhost:3000";
}

// Prefer v1 endpoints for new work.
const V1_PUBLIC = "/api/v1/public";
const V1_CLIENT = "/api/v1/client";

const request = async (path, options = {}) => {
  // Add cache-busting parameter to GET requests
  let finalPath = path;
  if (!options.method || options.method === "GET") {
    const timestamp = Date.now().toString();
    if (path.includes("?")) {
      finalPath = `${path}&_=${timestamp}`;
    } else {
      finalPath = `${path}?_=${timestamp}`;
    }
  }

  const res = await fetch(`${getApiBase()}${finalPath}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = (data && data.message) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

const readClientToken = () => {
  try {
    const t = localStorage.getItem("clientAccessToken");
    return t && String(t).trim() ? String(t).trim() : null;
  } catch {
    return null;
  }
};

export const api = {
  getCategories: ({ root } = {}) => {
    const qs = new URLSearchParams();
    // root=1 -> only top-level categories
    if (root !== undefined) qs.set("root", String(root));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`${V1_PUBLIC}/categories${suffix}`);
  },
  getBestSellers: ({ page, limit, categorySlug, _ } = {}) => {
    const qs = new URLSearchParams();

    if (page !== undefined) qs.set("page", String(page));
    if (limit !== undefined) qs.set("limit", String(limit));
    if (categorySlug) qs.set("categorySlug", String(categorySlug));
    if (_) qs.set("_", String(_));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";

    return request(`${V1_PUBLIC}/products/best-sellers${suffix}`);
  },
  getProducts: ({
    page,
    limit,
    q,
    categorySlug,
    filters,
    includeFilters = true,
    _,
  } = {}) => {
    const qs = new URLSearchParams();
    if (page !== undefined) qs.set("page", String(page));
    if (limit !== undefined) qs.set("limit", String(limit));
    if (q) qs.set("q", String(q));
    if (categorySlug) qs.set("categorySlug", String(categorySlug));
    if (filters !== undefined) {
      try {
        qs.set("filters", JSON.stringify(filters));
      } catch (e) {
        // ignore invalid filters
      }
    }
    if (includeFilters) qs.set("includeFilters", "true");
    if (_) qs.set("_", String(_)); // Cache-busting parameter
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`${V1_PUBLIC}/products${suffix}`);
  },
  getProductsByCollection: ({
    collectionId,
    page,
    limit,
    q,
    categorySlug,
    filters,
    includeFilters = true,
    _,
  } = {}) => {
    const qs = new URLSearchParams();
    if (page !== undefined) qs.set("page", String(page));
    if (limit !== undefined) qs.set("limit", String(limit));
    if (q) qs.set("q", String(q));
    if (categorySlug) qs.set("categorySlug", String(categorySlug));
    if (filters !== undefined) {
      try {
        qs.set("filters", JSON.stringify(filters));
      } catch (e) {
        // ignore invalid filters
      }
    }
    if (includeFilters) qs.set("includeFilters", "true");
    if (_) qs.set("_", String(_)); // Cache-busting parameter
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(
      `${V1_PUBLIC}/products/collection/${encodeURIComponent(String(collectionId || "").trim())}${suffix}`,
    );
  },
  getProductBySlug: (slug) =>
    request(
      `${V1_PUBLIC}/products/slug/${encodeURIComponent(String(slug || "").trim())}`,
    ),
  getProductById: (id) =>
    request(
      `${V1_PUBLIC}/products/${encodeURIComponent(String(id || "").trim())}`,
    ),
  // Attribute lists used for filters in the sidebar
  getMaterials: () => request(`${V1_PUBLIC}/materials`),
  getColors: () => request(`${V1_PUBLIC}/colors`),
  getSizes: () => request(`${V1_PUBLIC}/sizes`),
  getThemes: () => request(`${V1_PUBLIC}/themes`),
  getCollections: ({ limit } = {}) => {
    const qs = new URLSearchParams();
    if (limit !== undefined) qs.set("limit", String(limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`${V1_PUBLIC}/collections${suffix}`);
  },
  getBracelets: ({ typeCode, sizeCm, _ } = {}) => {
    const qs = new URLSearchParams();
    if (typeCode) qs.set("typeCode", typeCode);
    if (sizeCm) qs.set("sizeCm", String(sizeCm));
    if (_) qs.set("_", String(_)); // Cache-busting parameter
    return request(`/api/public/bracelets?${qs.toString()}`);
  },
  getCharms: ({ kind, _ } = {}) => {
    const qs = new URLSearchParams();
    if (kind) qs.set("kind", kind);
    if (_) qs.set("_", String(_)); // Cache-busting parameter
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`/api/public/charms${suffix}`);
  },

  // Use v1 product detail instead of stitching public lists.
  getProductByIdPublic: async (id) => {
    const safeId = String(id || "").trim();
    if (!safeId) return null;
    const res = await api.getProductById(safeId);
    return res?.data || null;
  },
  validateMix: ({ bracelet, items }) =>
    request(`/api/public/mix/validate`, {
      method: "POST",
      body: JSON.stringify({ bracelet, items }),
    }),
  getCart: () => request(`/api/public/cart`),
  addBundleToCart: ({ bracelet, items }) =>
    request(`/api/public/cart/bundles`, {
      method: "POST",
      body: JSON.stringify({ bracelet, items }),
    }),
  // Add a non-bundle product to cart (legacy products[])
  addProductToCart: ({ productId, variantId, quantity, buyNow } = {}) =>
    request(`/api/public/cart/products`, {
      method: "POST",
      body: JSON.stringify({
        productId,
        variantId,
        quantity,
        buyNow: buyNow === true,
      }),
    }),
  patchBundle: (bundleId, patch) =>
    request(`/api/public/cart/bundles/${encodeURIComponent(bundleId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteBundle: (bundleId) =>
    request(`/api/public/cart/bundles/${encodeURIComponent(bundleId)}`, {
      method: "DELETE",
    }),
  // Product-level cart operations
  patchProduct: (lineId, patch) =>
    request(`/api/public/cart/products/${encodeURIComponent(lineId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteProduct: (lineId) =>
    request(`/api/public/cart/products/${encodeURIComponent(lineId)}`, {
      method: "DELETE",
    }),

  // Bundle-centric checkout + order tracking
  checkoutBundles: ({
    bundleIds,
    productLineIds,
    phone,
    fullName,
    address,
    email,
    method,
  }) =>
    request(`/api/public/checkout`, {
      method: "POST",
      body: JSON.stringify({
        bundleIds,
        productLineIds,
        phone,
        fullName,
        address,
        email,
        method,
        // signal to BE that FE expects zalopay create flow
        zalopayFlow: true,
      }),
    }).then((res) => {
      // Defensive: older backend versions returned HTTP 200 with { valid:false }.
      const orderCode = res?.data?.orderCode;
      if (!orderCode) {
        const err = new Error(res?.message || "Đặt hàng thất bại");
        err.data = res;
        throw err;
      }
      return res;
    }),
  lookupOrders: ({ phone, email }) => {
    const qs = new URLSearchParams();
    if (phone) qs.set("phone", String(phone));
    if (email) qs.set("email", String(email));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`/api/public/orders/lookup${suffix}`);
  },
  zalopayConfirm: ({ appTransId, orderCode }) =>
    request(`/api/public/zalopay/confirm`, {
      method: "POST",
      body: JSON.stringify({ appTransId, orderCode }),
    }),
  getOrderByCode: (orderCode) =>
    request(
      `/api/public/orders/${encodeURIComponent(String(orderCode || "").trim())}`,
    ),
  emailOrders: ({ email }) =>
    request(`/api/public/orders/email`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Client auth (cookie-based)
  authRegister: ({ fullName, email, password, phone }) =>
    request(`/api/public/auth/register`, {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, phone }),
    }),
  authLogin: ({ email, password }) =>
    request(`/api/public/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((res) => {
      // Persist token for v1 bearer endpoints if BE returns it.
      const token = res?.token;
      if (token) {
        try {
          localStorage.setItem("clientAccessToken", String(token));
        } catch {
          // ignore
        }
      }
      return res;
    }),
  authMe: () => request(`/api/public/auth/me`),
  authLogout: () =>
    request(`/api/public/auth/logout`, {
      method: "POST",
    }).finally(() => {
      try {
        localStorage.removeItem("clientAccessToken");
      } catch {
        // ignore
      }
    }),
  authForgotPassword: ({ email }) =>
    request(`/api/public/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  authResetPassword: ({ email, otp, newPassword }) =>
    request(`/api/public/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  // v1 bearer auth (token stored in localStorage)
  v1AuthLogin: ({ email, password }) =>
    request(`${V1_PUBLIC}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).then((res) => {
      const token = res?.data?.accessToken;
      if (token) {
        try {
          localStorage.setItem("clientAccessToken", String(token));
        } catch {
          // ignore
        }
      }
      return res;
    }),
  v1AuthMe: () => {
    const token = readClientToken();
    return request(`${V1_PUBLIC}/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // v1 client orders (requires bearer)
  v1ClientOrdersStats: () => {
    const token = readClientToken();
    return request(`${V1_CLIENT}/orders/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  v1ClientOrdersList: ({ status, page, limit } = {}) => {
    const token = readClientToken();
    const qs = new URLSearchParams();
    if (status) qs.set("status", String(status));
    if (page !== undefined) qs.set("page", String(page));
    if (limit !== undefined) qs.set("limit", String(limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(`${V1_CLIENT}/orders${suffix}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  v1ClientOrderByCode: (orderCode) => {
    const token = readClientToken();
    return request(
      `${V1_CLIENT}/orders/${encodeURIComponent(String(orderCode || "").trim())}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
  },
  // Cancel order (client)
  v1ClientCancelOrder: (orderCode, { reason } = {}) => {
    const token = readClientToken();
    return request(
      `${V1_CLIENT}/orders/${encodeURIComponent(String(orderCode || "").trim())}/cancel`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ reason }),
      },
    );
  },

  // Wishlist (requires legacy cookie auth currently)
  wishlistList: () => request(`/api/public/wishlist`),
  wishlistAdd: ({ productId, variantCode }) =>
    request(`/api/public/wishlist`, {
      method: "POST",
      body: JSON.stringify({ productId, variantCode }),
    }),
  wishlistRemove: ({ productId, variantCode }) => {
    const qs = new URLSearchParams();
    if (variantCode) qs.set("variantCode", String(variantCode));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request(
      `/api/public/wishlist/${encodeURIComponent(String(productId))}${suffix}`,
      { method: "DELETE" },
    );
  },
};
