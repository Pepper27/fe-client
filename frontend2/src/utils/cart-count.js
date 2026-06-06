const readBuyNowLineId = () => {
  try {
    const raw = window.sessionStorage.getItem("checkout:buyNow");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    if (parsed?.kind !== "product") return "";
    return String(parsed?.lineId || "").trim();
  } catch {
    return "";
  }
};

export const countCartLines = (cart) => {
  const buyNowLineId = readBuyNowLineId();
  const productCount = Array.isArray(cart?.products)
    ? cart.products.filter(
        (line) => String(line?._id || line?.id || "") !== buyNowLineId,
      ).length
    : 0;
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
