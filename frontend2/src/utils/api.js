const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3899";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
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

export const api = {
  getBracelets: ({ typeCode, sizeCm }) => {
    const qs = new URLSearchParams();
    if (typeCode) qs.set("typeCode", typeCode);
    if (sizeCm) qs.set("sizeCm", String(sizeCm));
    return request(`/api/public/bracelets?${qs.toString()}`);
  },
  getCharms: ({ kind }) => {
    const qs = new URLSearchParams();
    if (kind) qs.set("kind", kind);
    return request(`/api/public/charms?${qs.toString()}`);
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
  patchBundle: (bundleId, patch) =>
    request(`/api/public/cart/bundles/${encodeURIComponent(bundleId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteBundle: (bundleId) =>
    request(`/api/public/cart/bundles/${encodeURIComponent(bundleId)}`, {
      method: "DELETE",
    }),
};
