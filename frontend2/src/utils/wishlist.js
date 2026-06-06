import { api } from "./api";

const LEGACY_WISHLIST_KEY = "wishlist_products";
const GUEST_WISHLIST_KEY = "wishlist:guest";
const USER_WISHLIST_KEY_PREFIX = "wishlist:user:";
const ACTIVE_WISHLIST_USER_KEY = "wishlist:activeUserId";
const WISHLIST_UPDATED_EVENT = "wishlist:updated";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
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

const normalizeItems = (items) => {
  const rows = Array.isArray(items) ? items : [];
  return rows.map(normalizeItem).filter(Boolean);
};

const readKey = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = safeParse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id) : [];
  } catch {
    return [];
  }
};

const writeKey = (key, items) => {
  const next = normalizeItems(items);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
};

const userWishlistKey = (userId) => `${USER_WISHLIST_KEY_PREFIX}${String(userId || "").trim()}`;

const migrateLegacyGuestWishlist = () => {
  try {
    const hasGuest = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (hasGuest !== null) return;
    const legacy = localStorage.getItem(LEGACY_WISHLIST_KEY);
    if (!legacy) return;
    localStorage.setItem(GUEST_WISHLIST_KEY, legacy);
    localStorage.removeItem(LEGACY_WISHLIST_KEY);
  } catch {}
};

const dispatchWishlistUpdated = (items) => {
  try {
    window.dispatchEvent(
      new CustomEvent(WISHLIST_UPDATED_EVENT, { detail: normalizeItems(items) }),
    );
  } catch {}
};

export const getActiveWishlistUserId = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_WISHLIST_USER_KEY);
    const normalized = String(raw || "").trim();
    return normalized || null;
  } catch {
    return null;
  }
};

export const setActiveWishlistUser = (userId) => {
  try {
    const normalized = String(userId || "").trim();
    if (!normalized) {
      localStorage.removeItem(ACTIVE_WISHLIST_USER_KEY);
      dispatchWishlistUpdated(getGuestWishlist());
      return null;
    }
    localStorage.setItem(ACTIVE_WISHLIST_USER_KEY, normalized);
    dispatchWishlistUpdated(getWishlist({ userId: normalized }));
    return normalized;
  } catch {
    return null;
  }
};

export const clearActiveWishlistUser = () => {
  try {
    localStorage.removeItem(ACTIVE_WISHLIST_USER_KEY);
  } catch {}
  dispatchWishlistUpdated(getGuestWishlist());
};

export const getGuestWishlist = () => {
  migrateLegacyGuestWishlist();
  return readKey(GUEST_WISHLIST_KEY);
};

export const setGuestWishlist = (items) => {
  migrateLegacyGuestWishlist();
  const next = writeKey(GUEST_WISHLIST_KEY, items);
  if (!getActiveWishlistUserId()) {
    dispatchWishlistUpdated(next);
  }
  return next;
};

export const clearGuestWishlist = () => {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {}
  if (!getActiveWishlistUserId()) {
    dispatchWishlistUpdated([]);
  }
};

export const getUserWishlist = (userId) => {
  const normalized = String(userId || "").trim();
  if (!normalized) return [];
  return readKey(userWishlistKey(normalized));
};

export const setUserWishlist = (userId, items) => {
  const normalized = String(userId || "").trim();
  if (!normalized) return [];
  const next = writeKey(userWishlistKey(normalized), items);
  if (getActiveWishlistUserId() === normalized) {
    dispatchWishlistUpdated(next);
  }
  return next;
};

export const getWishlist = ({ userId } = {}) => {
  migrateLegacyGuestWishlist();
  const scopedUserId = String(userId || getActiveWishlistUserId() || "").trim();
  return scopedUserId ? getUserWishlist(scopedUserId) : getGuestWishlist();
};

export const setWishlist = (items, { userId } = {}) => {
  const scopedUserId = String(userId || getActiveWishlistUserId() || "").trim();
  return scopedUserId ? setUserWishlist(scopedUserId, items) : setGuestWishlist(items);
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

  setWishlist(next);
  return !exists;
};

const mapServerWishlist = (rows) =>
  (Array.isArray(rows) ? rows : [])
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

export const syncWishlistFromServer = async (userId = getActiveWishlistUserId()) => {
  const res = await api.wishlistList();
  const mapped = mapServerWishlist(res?.data || []);
  const scopedUserId = String(userId || getActiveWishlistUserId() || "").trim();
  if (scopedUserId) {
    setUserWishlist(scopedUserId, mapped);
  } else {
    setWishlist(mapped);
  }
  return mapped;
};

export const toggleWishlistItemApi = async (product) => {
  const normalized = normalizeItem(product);
  if (!normalized) return false;

  const before = getWishlist();
  const existed = before.some((it) => String(it.id) === normalized.id);
  const optimisticLiked = toggleWishlistItem(normalized);

  try {
    if (existed) {
      await api.wishlistRemove({ productId: normalized.id, variantCode: "" });
      return false;
    }
    await api.wishlistAdd({ productId: normalized.id, variantCode: "" });
    return true;
  } catch {
    return optimisticLiked;
  }
};

export const mergeGuestWishlistToServer = async () => {
  try {
    const guestItems = getGuestWishlist();
    if (!guestItems.length) {
      return syncWishlistFromServer();
    }

    const res = await api.wishlistList().catch(() => null);
    const serverRows = Array.isArray(res?.data) ? res.data : [];
    const serverIds = new Set(serverRows.map((r) => String(r?.productId || "")));
    const toAdd = guestItems.filter(
      (item) => item && item.id && !serverIds.has(String(item.id)),
    );

    for (const item of toAdd) {
      await api.wishlistAdd({ productId: String(item.id), variantCode: "" });
    }

    clearGuestWishlist();
    return syncWishlistFromServer();
  } catch {
    return [];
  }
};

export const subscribeWishlist = (callback) => {
  const customHandler = (event) => {
    callback(event.detail || getWishlist());
  };

  const storageHandler = (event) => {
    if (
      event.key === GUEST_WISHLIST_KEY ||
      event.key === ACTIVE_WISHLIST_USER_KEY ||
      event.key === LEGACY_WISHLIST_KEY ||
      String(event.key || "").startsWith(USER_WISHLIST_KEY_PREFIX)
    ) {
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

// Legacy alias kept for compatibility with older imports.
export const mergeLocalToServer = mergeGuestWishlistToServer;
