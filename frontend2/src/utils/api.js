// Backend-charm default port is 3879; override via REACT_APP_API_BASE when needed.
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3879";

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
  getCharms: () => request(`/api/public/charms`),
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
    }),
  authMe: () => request(`/api/public/auth/me`),
  authLogout: () =>
    request(`/api/public/auth/logout`, {
      method: "POST",
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
};
