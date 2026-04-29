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

  // Use setWishlist which enforces filtering and dispatches the update event.
  setWishlist(next);

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
    // If the API request fails (e.g. user not logged in or network error),
    // keep the optimistic local change so anonymous users still see their
    // wishlist persisted locally. We will attempt to merge local -> server on
    // next login.
    // Log the error for debugging but do not revert.
    // console.warn('wishlist API failed, keeping local state', err);
    return optimisticLiked;
  }
};

// Merge local wishlist into server-side wishlist for the logged-in user.
// This adds any locally-saved items that are missing on the server.
export const mergeLocalToServer = async () => {
  try {
    const local = getWishlist();
    if (!Array.isArray(local) || !local.length) return [];
    const res = await api.wishlistList().catch(() => null);
    const serverRows = Array.isArray(res?.data) ? res.data : [];
    const serverIds = new Set(serverRows.map((r) => String(r?.productId || "")));
    const toAdd = local.filter((it) => it && it.id && !serverIds.has(String(it.id)));
    for (const item of toAdd) {
      try {
        await api.wishlistAdd({ productId: String(item.id), variantCode: "" });
      } catch (e) {
        // ignore per-item failures
      }
    }
    // Return updated server list (best-effort)
    const refreshed = await api.wishlistList().catch(() => null);
    const rows = Array.isArray(refreshed?.data) ? refreshed.data : [];
    return rows;
  } catch (e) {
    return [];
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
