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

export const isInWishlist = (id) => {
  const stringId = String(id);
  return getWishlist().some((item) => String(item.id) === stringId);
};

export const toggleWishlistItem = (product) => {
  const current = getWishlist();
  const productId = String(product.id);
  const exists = current.some((item) => String(item.id) === productId);

  const next = exists
    ? current.filter((item) => String(item.id) !== productId)
    : [...current, { ...product, id: productId }];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(WISHLIST_UPDATED_EVENT, { detail: next }));

  return !exists;
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
