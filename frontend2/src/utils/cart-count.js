export const countCartLines = (cart) => {
  const productCount = Array.isArray(cart?.products) ? cart.products.length : 0;
  const bundleCount = Array.isArray(cart?.bundles) ? cart.bundles.length : 0;
  return productCount + bundleCount;
};

export const cacheCartCount = (count) => {
  try {
    window.sessionStorage.setItem(
      "cart:cachedCount",
      String(Math.max(0, Number(count) || 0)),
    );
  } catch {}
};

export const dispatchCartChanged = (count) => {
  const safeCount = Math.max(0, Number(count) || 0);
  cacheCartCount(safeCount);
  try {
    window.dispatchEvent(
      new CustomEvent("cart:changed", { detail: { count: safeCount } }),
    );
  } catch {
    try {
      window.dispatchEvent(new Event("cart:changed"));
    } catch {}
  }
};

export const syncCartBadge = (cart) => {
  const count = countCartLines(cart);
  dispatchCartChanged(count);
  return count;
};
