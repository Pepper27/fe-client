import { api } from "./api";

const WISHLIST_KEY = "wishlist_products";
const WISHLIST_UPDATED_EVENT = "wishlist:updated";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

export const getWishlist = () => {
  const raw = localStorage.getItem(WISHLIST_KEY);
  const parsed = safeParse(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item) => item && item.id);
};

export const setWishlist = (items) => {
  const next = Array.isArray(items) ? items.filter((it) => it && it.id) : [];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(WISHLIST_UPDATED_EVENT, { detail: next }),
  );
  return next;
};

const normalizeItem = (product) => {
  if (!product) return null;
  const id = String(product.id ?? product._id ?? "").trim();
  if (!id) return null;
  return {
    id,
    slug: product.slug ? String(product.slug) : undefined,
    name: product.name ?? "",
    price: product.price ?? 0,
    images: product.images ?? "",
  };
};

export const isInWishlist = (id) => {
  const stringId = String(id);
  return getWishlist().some((item) => String(item.id) === stringId);
};

export const toggleWishlistItem = (product) => {
  const current = getWishlist();
  const normalized = normalizeItem(product);
  if (!normalized) return false;
  const productId = String(normalized.id);
  const exists = current.some((item) => String(item.id) === productId);

  const next = exists
    ? current.filter((item) => String(item.id) !== productId)
    : [...current, { ...normalized, id: productId }];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(WISHLIST_UPDATED_EVENT, { detail: next }),
  );

  return !exists;
};

// Prefer server wishlist when logged in (cookie-based). Falls back to local-only.
export const syncWishlistFromServer = async () => {
  const res = await api.wishlistList();
  const rows = Array.isArray(res?.data) ? res.data : [];
  const mapped = rows
    .map((it) => {
      const id = String(it?.productId || "").trim();
      if (!id) return null;
      return {
        id,
        slug: it?.product?.slug ? String(it.product.slug) : undefined,
        name: it?.product?.name || "",
        price: it?.product?.price ?? 0,
        images: it?.product?.image || "",
      };
    })
    .filter(Boolean);
  setWishlist(mapped);
  return mapped;
};

export const toggleWishlistItemApi = async (product) => {
  const normalized = normalizeItem(product);
  if (!normalized) return false;

  const before = getWishlist();
  const existed = before.some((it) => String(it.id) === normalized.id);

  // Optimistic local update.
  const optimisticLiked = toggleWishlistItem(normalized);

  try {
    if (existed) {
      await api.wishlistRemove({ productId: normalized.id, variantCode: "" });
      return false;
    }
    await api.wishlistAdd({ productId: normalized.id, variantCode: "" });
    return true;
  } catch (err) {
    // Not logged in or request failed: revert and keep local-only behavior.
    setWishlist(before);
    return optimisticLiked;
  }
};

export const subscribeWishlist = (callback) => {
  const customHandler = (event) => {
    callback(event.detail || getWishlist());
  };

  const storageHandler = (event) => {
    if (event.key === WISHLIST_KEY) {
      callback(getWishlist());
    }
  };

  window.addEventListener(WISHLIST_UPDATED_EVENT, customHandler);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(WISHLIST_UPDATED_EVENT, customHandler);
    window.removeEventListener("storage", storageHandler);
  };
};
