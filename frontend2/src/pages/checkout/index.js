import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../utils/api";
import { syncCartBadge } from "../../utils/cart-count";
import { isAuthBlockedInTab } from "../../utils/auth-tab";
import "./index.scss";
import { formatPrice } from "../../utils/format";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from "react-hot-toast";

// Fix for default marker icons when using webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helpers to resolve variant/product metadata for friendly display
const findVariant = (product, identifier) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!identifier) return variants[0] || null;
  const idLike = /^[a-f0-9]{24}$/i.test(String(identifier));
  if (idLike) {
    return (
      variants.find((v) => String(v?._id || v?.id) === String(identifier)) ||
      variants.find((v) => String(v?.code) === String(identifier) || String(v?.variantCode) === String(identifier)) ||
      variants[0] ||
      null
    );
  }
  return (
    variants.find((v) => String(v?.code) === String(identifier) || String(v?.variantCode) === String(identifier)) ||
    variants.find((v) => String(v?._id || v?.id) === String(identifier)) ||
    variants[0] ||
    null
  );
};

const firstImage = (product, variantIdentifier) => {
  const v = findVariant(product, variantIdentifier);
  const img = v?.images?.[0] || null;
  return typeof img === "string" && img.trim() ? img : null;
};

const normAttr = (v) => {
  if (v == null) return null;
  if (typeof v === "number") return v > 0 ? String(v) : null;
  if (typeof v === "object") {
    const name = v?.name;
    if (name == null) return null;
    const s = String(name).trim();
    return s ? s : null;
  }
  const s = String(v).trim();
  if (!s || s === "0") return null;
  return s;
};

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAddressStorageScope = (me) => {
  const userKey =
    me?._id || me?.id || me?.email || me?.phone || me?.username || null;
  return userKey ? `user:${String(userKey).trim().toLowerCase()}` : "guest";
};

const readCheckoutBundleIds = () => {
  try {
    const raw = sessionStorage.getItem("checkout:bundleIds");
    if (raw === null) return null; // key not present
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.bundleIds) ? parsed.bundleIds.map(String) : [];
    return ids.filter(Boolean);
  } catch {
    return null;
  }
};

const readCheckoutProductLineIds = () => {
  try {
    const raw = sessionStorage.getItem("checkout:productLineIds");
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.productLineIds) ? parsed.productLineIds.map(String) : [];
    return ids.filter(Boolean);
  } catch {
    return null;
  }
};

const readCheckoutBuyNow = () => {
  try {
    const raw = sessionStorage.getItem('checkout:buyNow');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.kind !== 'product') return null;
    const lineId = parsed.lineId ? String(parsed.lineId) : '';
    if (!lineId) return null;
    return { kind: 'product', lineId, at: parsed.at || Date.now() };
  } catch {
    return null;
  }
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});
  const [me, setMe] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);

  const buyNowRef = React.useRef(null);
  const placedRef = React.useRef(false);
  // When redirecting to external payment provider, set this flag so unmount
  // cleanup does not delete the temporary buyNow line.
  const paymentInProgressRef = React.useRef(false);
  const paymentWindowRef = React.useRef(null);
  const paymentReloadArmedRef = React.useRef(false);
  const paymentBundleIdsRef = React.useRef([]);
  const paymentProductLineIdsRef = React.useRef([]);

  const validateAddress = () => {
    const newErrors = {};

    if (!newAddress.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!newAddress.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(newAddress.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!newAddress.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (
      newAddress.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAddress.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    buyNowRef.current = readCheckoutBuyNow();
  }, []);

  useEffect(() => {
    const armReload = () => {
      if (!paymentInProgressRef.current) return;
      paymentReloadArmedRef.current = true;
    };

    const reloadForFreshData = () => {
      if (!paymentInProgressRef.current || !paymentReloadArmedRef.current) {
        return;
      }
      paymentInProgressRef.current = false;
      paymentReloadArmedRef.current = false;
      try {
        sessionStorage.setItem(
          "cart:afterZalopay",
          JSON.stringify({
            bundleIds: (paymentBundleIdsRef.current || []).map(String),
            productLineIds: (paymentProductLineIdsRef.current || []).map(String),
            at: Date.now(),
          }),
        );
      } catch {}
      window.location.href = "/cart";
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        armReload();
        return;
      }
      if (document.visibilityState === "visible") {
        reloadForFreshData();
      }
    };

    const onBlur = () => armReload();
    const onFocus = () => reloadForFreshData();

    const pollId = window.setInterval(() => {
      try {
        const w = paymentWindowRef.current;
        if (!w || w.closed !== true) return;
        paymentWindowRef.current = null;
        reloadForFreshData();
      } catch {
        // ignore cross-window access errors
      }
    }, 1000);

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(pollId);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Cleanup abandoned buy-now line when leaving checkout.
  useEffect(() => {
    const cleanup = async () => {
      // If user has placed order, or is in the middle of external payment,
      // avoid deleting buyNow line here.
      if (placedRef.current || paymentInProgressRef.current) return;
      const bn = buyNowRef.current;
      if (!bn || bn.kind !== 'product' || !bn.lineId) return;
      try {
        await api.deleteProduct(bn.lineId);
      } catch {
        // ignore
      }
      try {
        sessionStorage.removeItem('checkout:buyNow');
        sessionStorage.removeItem('checkout:productLineIds');
      } catch {
        // ignore
      }
      try { await notifyCartChanged(); } catch { }
    };

    return () => {
      // best-effort async cleanup
      cleanup();
    };
  }, []);

  const [bundleIds, setBundleIds] = useState(() => {
    // priority: react-router location.state -> sessionStorage -> empty
    try {
      const fromNav = location && location.state && location.state.bundleIds ? location.state.bundleIds : null;
      if (fromNav && fromNav.length) return fromNav.map(String);
    } catch { }
    return readCheckoutBundleIds() || [];
  });
  const [productLineIds, setProductLineIds] = useState(() => {
    try {
      const fromNav = location && location.state && location.state.productLineIds ? location.state.productLineIds : null;
      if (fromNav && fromNav.length) return fromNav.map(String);
    } catch { }
    return readCheckoutProductLineIds() || [];
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });
  const [editAddressId, setEditAddressId] = useState(null);
  const [method, setMethod] = useState("cash");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [searchResults, setSearchResults] = useState([]);
  const searchAbortRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const addressStorageScope = useMemo(() => getAddressStorageScope(me), [me]);
  const addressesStorageKey = useMemo(
    () => `checkout:addresses:${addressStorageScope}`,
    [addressStorageScope],
  );
  const selectedAddressStorageKey = useMemo(
    () => `checkout:selectedAddressId:${addressStorageScope}`,
    [addressStorageScope],
  );

  useEffect(() => {
    let cancelled = false;

    const refreshMe = () => {
      if (isAuthBlockedInTab()) {
        setMe(null);
        setAuthResolved(true);
        return;
      }
      api
        .authMe()
        .then((res) => {
          if (cancelled) return;
          setMe(res?.data || null);
          setAuthResolved(true);
        })
        .catch(() => {
          if (cancelled) return;
          setMe(null);
          setAuthResolved(true);
        });
    };

    refreshMe();
    window.addEventListener("auth:changed", refreshMe);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", refreshMe);
    };
  }, []);

  useEffect(() => {
    if (!authResolved) return;
    try {
      const raw = localStorage.getItem(addressesStorageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      setAddresses(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAddresses([]);
    }

    try {
      setSelectedAddressId(localStorage.getItem(selectedAddressStorageKey) || "");
    } catch {
      setSelectedAddressId("");
    }
  }, [addressesStorageKey, authResolved, selectedAddressStorageKey]);

  // Nominatim search for address suggestions (OpenStreetMap)
  const searchAddress = async (q) => {
    if (!q || !q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`;
      const res = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'vi' } });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === 'AbortError') return;
      // ignore other errors
    } finally {
      searchAbortRef.current = null;
    }
  };

  const pickSearchResult = (r) => {
    if (!r) return;
    const formatted = r.display_name || r.displayName || '';
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    setNewAddress((p) => ({ ...p, address: formatted, lat, lng }));
    setMapCenter({ lat, lng });
    setMapZoom(15);
    setSearchResults([]);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res?.data || null);
    } catch (e) {
      if (e?.status === 401) {
        setCart({ products: [], bundles: [] });
      } else {
        toast.error(e?.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const notifyCartChanged = async () => {
    try {
      const res = await api.getCart();
      syncCartBadge(res?.data || null);
      return;
    } catch (e) {
      try { window.dispatchEvent(new Event('cart:changed')); } catch {}
    }
  };

  // product metadata map for friendly labels (productId -> product doc)
  const [productMetaMap, setProductMetaMap] = useState(new Map());

  // fetch product meta for items present in cart (products + bundle bracelet + bundle charms)
  useEffect(() => {
    let cancelled = false;
    const loadMeta = async () => {
      try {
        const ids = [];
        for (const p of cart?.products || []) {
          if (p?.productId) ids.push(String(p.productId));
        }
        for (const b of cart?.bundles || []) {
          if (b?.bracelet?.productId) ids.push(String(b.bracelet.productId));
          for (const it of b?.items || []) {
            if (it?.charmProductId) ids.push(String(it.charmProductId));
          }
        }
        const unique = Array.from(new Set(ids.filter(Boolean)));
        if (!unique.length) {
          setProductMetaMap(new Map());
          return;
        }
        const ps = await Promise.all(unique.map((id) => api.getProductByIdPublic(id).catch(() => null)));
        if (cancelled) return;
        const m = new Map();
        for (let i = 0; i < unique.length; i++) if (ps[i]) m.set(String(unique[i]), ps[i]);
        setProductMetaMap(m);
      } catch (e) {
        // ignore
      }
    };
    loadMeta();
    return () => { cancelled = true; };
  }, [cart?.products, cart?.bundles]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Resolve selection priority carefully to avoid accidentally selecting all bundles
    // Priority: explicit location.state (even empty array) -> sessionStorage (if key present) -> fallback select-all only when user directly entered /checkout (no nav/state/storage)
    const navBundles = (location && location.state && Array.isArray(location.state.bundleIds)) ? location.state.bundleIds.map(String) : null;
    const navProducts = (location && location.state && Array.isArray(location.state.productLineIds)) ? location.state.productLineIds.map(String) : null;
    const storedBundles = readCheckoutBundleIds(); // returns array or null
    const storedProducts = readCheckoutProductLineIds();

    // debug
    // eslint-disable-next-line no-console
    console.debug('[checkout] navBundles=%o navProducts=%o storedBundles=%o storedProducts=%o cartBundles=%o cartProducts=%o', navBundles, navProducts, storedBundles, storedProducts, cart?.bundles || [], cart?.products || []);

    // BUNDLES
    if (Array.isArray(navBundles)) {
      // explicit navigation provided bundleIds (possibly empty) -> respect it
      setBundleIds(navBundles);
      try { sessionStorage.setItem('checkout:bundleIds', JSON.stringify({ bundleIds: navBundles, at: Date.now() })); } catch { }
    } else if (Array.isArray(storedBundles)) {
      // sessionStorage contained the key (even empty array) -> respect it
      setBundleIds(storedBundles);
    } else {
      // storedBundles === null (key absent)
      // Only fallback to select-all when user directly landed on /checkout (no nav state and no stored keys)
      const cameFromNav = Boolean(location && location.state);
      if (!cameFromNav && (cart?.bundles || []).length) {
        setBundleIds((cart.bundles || []).map((b) => String(b.bundleId)));
      } else {
        // do not auto-select bundles in mixed scenarios (e.g. productLine selected but no bundle key)
        setBundleIds([]);
      }
    }

    // PRODUCTS
    if (Array.isArray(navProducts)) {
      setProductLineIds(navProducts);
      try { sessionStorage.setItem('checkout:productLineIds', JSON.stringify({ productLineIds: navProducts, at: Date.now() })); } catch { }
    } else if (Array.isArray(storedProducts)) {
      // If stored ids don't match any current product line, attempt a safe recovery.
      // This happens if older code accidentally stored cart._id instead of product line _id.
      try {
        const cartProductIds = (cart?.products || []).map((p) => String(p?._id)).filter(Boolean);
        const stored = storedProducts.map(String);
        const matchesAny = stored.some((id) => cartProductIds.includes(String(id)));
        const isProbablyCartId = stored.length === 1 && String(cart?._id || '') && String(stored[0]) === String(cart._id);
        if (!matchesAny && isProbablyCartId && cartProductIds.length) {
          setProductLineIds(cartProductIds);
        } else {
          setProductLineIds(stored);
        }
      } catch {
        setProductLineIds(storedProducts);
      }
    } else {
      const cameFromNav = Boolean(location && location.state);
      if (!cameFromNav && (cart?.products || []).length) {
        setProductLineIds((cart.products || []).map((p) => String(p._id)));
      } else {
        setProductLineIds([]);
      }
    }
    // run when cart or navigation state changes
  }, [cart?.bundles, cart?.products, location && location.state]);

  const selectedBundles = useMemo(() => {
    const bundles = cart?.bundles || [];
    const set = new Set((bundleIds || []).map(String));
    return (bundles || []).filter((b) => set.has(String(b.bundleId)));
  }, [cart?.bundles, bundleIds]);

  const total = useMemo(() => {
    const bundlesTotal = (selectedBundles || []).reduce(
      (sum, b) =>
        sum +
        (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1),
      0,
    );

    // include product lines
    const products = cart?.products || [];
    const selectedProducts = products.filter((p) => (productLineIds || []).includes(String(p._id)));
    const productsTotal = selectedProducts.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    return bundlesTotal + productsTotal;
  }, [selectedBundles, productLineIds, cart?.products]);

  const selectedCount = selectedBundles.length + (productLineIds || []).length;

  useEffect(() => {
    paymentBundleIdsRef.current = (bundleIds || []).map(String);
    paymentProductLineIdsRef.current = (productLineIds || []).map(String);
  }, [bundleIds, productLineIds]);

  const selectedAddress = useMemo(() => {
    return (
      (addresses || []).find(
        (a) => String(a.id) === String(selectedAddressId),
      ) || null
    );
  }, [addresses, selectedAddressId]);

  const persistAddresses = (next) => {
    setAddresses(next);
    try {
      localStorage.setItem(addressesStorageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveSelectedAddressId = (id) => {
    setSelectedAddressId(id);
    try {
      localStorage.setItem(selectedAddressStorageKey, String(id || ""));
    } catch {
      // ignore
    }
  };

  // const addNewAddress = () => {
  //   const fullName = String(newAddress.fullName || "").trim();
  //   const phone = String(newAddress.phone || "").trim();
  //   const address = String(newAddress.address || "").trim();
  //   const email = String(newAddress.email || "").trim();
  //   if (!fullName || !phone || !address) {
  //     setToast({
  //       type: "error",
  //       message: "Vui lòng nhập Họ tên, SĐT và Địa chỉ",
  //     });
  //     return;
  //   }
  //   // If editing an existing address, update it in place
  //   if (editAddressId) {
  //     const next = (addresses || []).map((a) =>
  //       String(a.id) === String(editAddressId)
  //         ? { ...a, fullName, phone, address, email }
  //         : a,
  //     );
  //     persistAddresses(next);
  //     saveSelectedAddressId(editAddressId);
  //     setEditAddressId(null);
  //     setNewAddress({ fullName: "", phone: "", address: "", email: "" });
  //     return;
  //   }

  //   const id = `addr_${Date.now()}`;
  //   const next = [{ id, fullName, phone, address, email }, ...(addresses || [])];
  //   persistAddresses(next);
  //   saveSelectedAddressId(id);
  //   setNewAddress({ fullName: "", phone: "", address: "", email: "" });
  // };
  const addNewAddress = () => {
    const fullName = String(newAddress.fullName || "").trim();
    const phone = String(newAddress.phone || "").trim();
    const address = String(newAddress.address || "").trim();
    const email = String(newAddress.email || "").trim();

    const newErrors = {};

    // validate fullname
    if (!fullName) {
      newErrors.fullName = "Vui lòng nhập họ tên!";
    }

    // validate phone
    if (!phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ!";
    }

    // validate address
    if (!address) {
      newErrors.address = "Vui lòng nhập địa chỉ!";
    }

    // validate email
    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Email không hợp lệ!";
    }

    // nếu có lỗi -> stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // clear lỗi
    setErrors({});

    // If editing an existing address, update it in place
    if (editAddressId) {
    const next = (addresses || []).map((a) =>
        String(a.id) === String(editAddressId)
          ? { ...a, fullName, phone, address, email, lat: newAddress.lat, lng: newAddress.lng }
          : a
      );

      persistAddresses(next);
      saveSelectedAddressId(editAddressId);

      setEditAddressId(null);

      setNewAddress({
        fullName: "",
        phone: "",
        address: "",
        email: "",
      });

      return;
    }

    // create new
    const id = `addr_${Date.now()}`;

    const next = [
      { id, fullName, phone, address, email, lat: newAddress.lat, lng: newAddress.lng },
      ...(addresses || []),
    ];

    persistAddresses(next);

    saveSelectedAddressId(id);

    setNewAddress({
      fullName: "",
      phone: "",
      address: "",
      email: "",
    });
  };

  const deleteAddress = (id) => {
    if (!id) return;
    // simple confirm to avoid accidental deletion
    if (!window.confirm('Xóa địa chỉ này?')) return;
    const next = (addresses || []).filter((a) => String(a.id) !== String(id));
    persistAddresses(next);
    // if deleted address was selected, clear selection or pick first
    if (String(selectedAddressId) === String(id)) {
      if (next.length) saveSelectedAddressId(next[0].id);
      else saveSelectedAddressId("");
    }
    // cancel edit if we were editing this address
    if (String(editAddressId) === String(id)) {
      setEditAddressId(null);
      setNewAddress({ fullName: "", phone: "", address: "", email: "" });
    }
  };

  const startEditAddress = (a) => {
    if (!a) return;
    setEditAddressId(a.id);
    setNewAddress({ fullName: a.fullName || "", phone: a.phone || "", address: a.address || "", email: a.email || "" });
    // ensure the address being edited becomes the selected address
    saveSelectedAddressId(a.id);
  };

  const cancelEdit = () => {
    setEditAddressId(null);
    setNewAddress({ fullName: "", phone: "", address: "", email: "" });
  };

  const placeOrder = async () => {
    if (!selectedCount) {
      toast.error("Bạn chưa chọn thiết kế nào");
      return;
    }
    if (!selectedAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    const orderEmail = String(selectedAddress.email || "")
      .trim()
      .toLowerCase();
    if (!orderEmail) {
      toast.error("Vui lòng nhập email để nhận thông tin đơn hàng");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    const buildStockErrorMessage = (err) => {
      const rawMessage = String(err?.message || err?.data?.message || "").trim();
      const isStockError = /hết hàng|out of stock|không đủ hàng|insufficient stock|sold out/i.test(rawMessage);
      if (!isStockError) return rawMessage || "Đặt hàng thất bại";

      const candidates = [];

      for (const lineId of productLineIds || []) {
        const line = (cart?.products || []).find((p) => String(p?._id) === String(lineId));
        if (!line) continue;
        const prodMeta = productMetaMap.get(String(line?.productId || "")) || null;
        const displayName = prodMeta?.name || line?.name || line?.productName || "Sản phẩm";
        const keys = [
          line?._id,
          line?.variantId,
          line?.variantCode,
          line?.productId,
          line?.sku,
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        candidates.push({ name: displayName, keys });
      }

      for (const bundle of selectedBundles || []) {
        const braceletMeta = productMetaMap.get(String(bundle?.bracelet?.productId || "")) || null;
        const braceletName =
          braceletMeta?.name ||
          bundle?.bracelet?.label ||
          bundle?.bracelet?.typeName ||
          bundle?.bracelet?.typeCode ||
          "Vòng tay";
        const braceletKeys = [
          bundle?.bundleId,
          bundle?.bracelet?.variantId,
          bundle?.bracelet?.variantCode,
          bundle?.bracelet?.productId,
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean);
        candidates.push({ name: braceletName, keys: braceletKeys });

        for (const item of bundle?.items || []) {
          const charmMeta = productMetaMap.get(String(item?.charmProductId || "")) || null;
          const charmName = charmMeta?.name || item?.name || "Charm";
          const charmKeys = [
            item?._id,
            item?.charmVariantId,
            item?.charmVariantCode,
            item?.variantCode,
            item?.charmProductId,
          ]
            .map((value) => String(value || "").trim())
            .filter(Boolean);
          candidates.push({ name: charmName, keys: charmKeys });
        }
      }

      for (const candidate of candidates) {
        if (!candidate?.keys?.length) continue;
        const matched = candidate.keys.some((key) => {
          if (!key) return false;
          return new RegExp(`(^|[^A-Za-z0-9])${escapeRegex(key)}([^A-Za-z0-9]|$)`, "i").test(rawMessage);
        });
        if (matched) {
          return `Sản phẩm ${candidate.name} đã hết hàng!`;
        }
      }

      if (candidates.length === 1) {
        return `Sản phẩm ${candidates[0].name} đã hết hàng!`;
      }

      return "Một hoặc nhiều sản phẩm trong đơn hàng đã hết hàng. Vui lòng kiểm tra lại giỏ hàng.";
    };

    setPlacing(true);
    try {
      const res = await api.checkoutBundles({
        bundleIds: selectedBundles.map((b) => String(b.bundleId)),
        productLineIds: productLineIds && productLineIds.length ? productLineIds.map(String) : [],
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        email: orderEmail,
        method,
      });
      // If Zalopay flow was used, BE returns zalopay.orderUrl for redirect.
      if (method === 'zalopay' && res && res.zalopay && res.zalopay.orderUrl) {
        try {
          paymentInProgressRef.current = true;

          paymentReloadArmedRef.current = false;
          const nextWindow = window.open(res.zalopay.orderUrl, "_blank");
          if (!nextWindow) {
            paymentInProgressRef.current = false;
            toast.error("Trình duyệt đã chặn tab thanh toán mới");
            return;
          }
          paymentWindowRef.current = nextWindow;
          toast.success("Đã mở tab ZaloPay mới. Quay lại tab này để cập nhật dữ liệu.");
          return;

        } catch (err) {
          paymentInProgressRef.current = false;
          paymentWindowRef.current = null;
          toast.error("Không thể mở tab thanh toán ZaloPay");
          return;
        }
      }
      const code = res?.data?.orderCode;
      placedRef.current = true;
      try {
        sessionStorage.removeItem("checkout:bundleIds");
        sessionStorage.removeItem("checkout:productLineIds");
        sessionStorage.removeItem('checkout:buyNow');
      } catch {
        // ignore
      }
          try { await notifyCartChanged(); } catch { }
      if (code) {
        toast.success("Đặt hàng thành công");
        navigate(`/orders?code=${encodeURIComponent(code)}`);
      } else {
        toast.success("Đặt hàng thành công");
        navigate("/orders");
      }
    } catch (e) {
      toast.error(buildStockErrorMessage(e));

      // If this was a buy-now session, cleanup the temporary line so cart remains unchanged.
      try {
        const bn = buyNowRef.current;
        if (bn && bn.kind === 'product' && bn.lineId) {
          await api.deleteProduct(bn.lineId);
          buyNowRef.current = null;
          try {
            sessionStorage.removeItem('checkout:buyNow');
            sessionStorage.removeItem('checkout:productLineIds');
          } catch { }
          try { await notifyCartChanged(); } catch { }
          // Return user to cart (traditional behavior on failed checkout)
          navigate('/cart');
        }
      } catch {
        // ignore
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-head">
          <button
            type="button"
            className="checkout-back"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </button>
          <h1 className="checkout-title">Đặt hàng</h1>
        </div>

        <div className="checkout-shell">
          <div className="checkout-left">
            <div className="checkout-card">
              <div className="checkout-cardTitle">Địa chỉ giao hàng</div>

              {addresses.length ? (
                <div className="checkout-addressList">
                  {addresses.map((a) => (
                    <div key={a.id} className="checkout-addressRow">
                      <label>
                        <input
                          type="radio"
                          checked={String(selectedAddressId) === String(a.id)}
                          onChange={() => saveSelectedAddressId(a.id)}
                        />
                      </label>
                      <div className="checkout-addressText">
                        <div className="checkout-addressName">
                          {a.fullName} · {a.phone}
                        </div>
                        <div className="checkout-addressAddr">{a.address}</div>
                        {a.email ? (
                          <div className="checkout-addressEmail">{a.email}</div>
                        ) : null}
                      </div>
                      <div className="checkout-addressActions">
                        <button type="button" className="btn-link" onClick={() => startEditAddress(a)}>Sửa</button>
                        <button type="button" className="btn-link danger" onClick={() => deleteAddress(a.id)}>Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="checkout-empty">
                  Chưa có địa chỉ. Tạo mới bên dưới.
                </div>
              )}

              <div className="checkout-divider" />

              <div className="checkout-subTitle">Tạo địa chỉ mới</div>
              {/* <div className="checkout-form">
                <label>
                  <span>Họ tên *</span>
                  <input
                    value={newAddress.fullName}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, fullName: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label>
                  <span>Số điện thoại *</span>
                  <input
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="09xxxxxxxx"
                  />
                </label>
                <label className="checkout-formFull">
                  <span>Địa chỉ *</span>
                  <input
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Số nhà, phường/xã, quận/huyện, tỉnh/thành"
                  />
                </label>
                <label className="checkout-formFull">
                  <span>Email</span>
                  <input
                    value={newAddress.email}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </label>
                 <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                   <button
                     type="button"
                     className="checkout-addAddr"
                     onClick={addNewAddress}
                   >
                     {editAddressId ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
                   </button>
                   {editAddressId ? (
                     <button type="button" className="checkout-cancel" onClick={cancelEdit}>
                       Hủy
                     </button>
                   ) : null}
                 </div>
              </div> */}
              <div className="checkout-form">
                <label>
                  <span>Họ tên *</span>

                  <input
                    value={newAddress.fullName}
                    onChange={(e) => {
                      setNewAddress((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        fullName: "",
                      }));
                    }}
                    className={errors.fullName ? "input-error" : ""}
                    placeholder="Nguyễn Văn A"
                  />

                  {errors.fullName && (
                    <div className="field-error">
                      {errors.fullName}
                    </div>
                  )}
                </label>

                <label>
                  <span>Số điện thoại *</span>

                  <input
                    value={newAddress.phone}
                    onChange={(e) => {
                      setNewAddress((p) => ({
                        ...p,
                        phone: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        phone: "",
                      }));
                    }}
                    className={errors.phone ? "input-error" : ""}
                    placeholder="09xxxxxxxx"
                  />

                  {errors.phone && (
                    <div className="field-error">
                      {errors.phone}
                    </div>
                  )}
                </label>

                <label className="checkout-formFull">
                  <span>Địa chỉ *</span>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      value={newAddress.address}
                      onChange={(e) => {
                        const v = e.target.value;
                        setNewAddress((p) => ({ ...p, address: v }));
                        setErrors((prev) => ({ ...prev, address: "" }));
                        // debounce search
                        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                        searchDebounceRef.current = setTimeout(() => {
                          searchAddress(v);
                        }, 300);
                      }}
                      className={errors.address ? "input-error" : ""}
                      placeholder="Nhập địa chỉ hoặc chọn gợi ý"
                    />

                    {searchResults && searchResults.length ? (
                      <div className="autocomplete-list">
                        {searchResults.map((r) => (
                          <div key={r.place_id || r.osm_id} className="autocomplete-item" onClick={() => pickSearchResult(r)}>
                            {r.display_name}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {errors.address && (
                    <div className="field-error">{errors.address}</div>
                  )}

                  {/* Map preview */}
                  {mapCenter ? (
                    <div className="checkout-mapPreview">
                      <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: 160, borderRadius: 8 }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={mapCenter} />
                      </MapContainer>
                    </div>
                  ) : null}
                </label>

                <label className="checkout-formFull">
                  <span>Email</span>

                  <input
                    value={newAddress.email}
                    onChange={(e) => {
                      setNewAddress((p) => ({
                        ...p,
                        email: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }}
                    className={errors.email ? "input-error" : ""}
                    placeholder="email@example.com"
                  />

                  {errors.email && (
                    <div className="field-error">
                      {errors.email}
                    </div>
                  )}
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    className="checkout-addAddr"
                    onClick={addNewAddress}
                  >
                    {editAddressId
                      ? "Lưu thay đổi"
                      : "Thêm địa chỉ"}
                  </button>

                  {editAddressId ? (
                    <button
                      type="button"
                      className="checkout-cancel"
                      onClick={cancelEdit}
                    >
                      Hủy
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="checkout-card" style={{ marginTop: 14 }}>
              <div className="checkout-cardTitle">Phương thức thanh toán</div>
              <div className="checkout-payMethods">
                <label>
                  <input
                    type="radio"
                    checked={method === "cash"}
                    onChange={() => setMethod("cash")}
                  />
                  COD
                </label>
                <label>
                  <input
                    type="radio"
                    checked={method === "zalopay"}
                    onChange={() => setMethod("zalopay")}
                  />
                  ZaloPay
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="checkout-card">
              <div className="checkout-cardTitle">Đơn hàng chi tiết</div>

              {loading ? (
                <div className="checkout-empty">Đang tải...</div>
              ) : selectedBundles.length || (productLineIds && productLineIds.length) ? (
                <div className="checkout-lines">
                  {selectedBundles.map((b) => (
                    <div key={b.bundleId} className="checkout-line">
                      <div>
                        <div className="checkout-lineTitle">Thiết kế</div>

                        {(() => {
                          const braceletMeta = productMetaMap.get(String(b?.bracelet?.productId || "")) || null;
                          const braceletName =
                            braceletMeta?.name ||
                            b?.bracelet?.label ||
                            b?.bracelet?.typeName ||
                            b?.bracelet?.typeCode ||
                            "Vòng tay";
                          const sizePart = b?.bracelet?.sizeCm ? `${b.bracelet.sizeCm}cm` : "";

                          // Group charms by (productId + variantCode) so UI shows quantities.
                          const items = Array.isArray(b?.items) ? b.items : [];
                          const grouped = new Map();
                          for (const it of items) {
                            const pid = String(it?.charmProductId || "");
                            const vcode = String(it?.charmVariantCode || "");
                            const key = `${pid}::${vcode}`;
                            if (!grouped.has(key)) grouped.set(key, { pid, vcode, qty: 0 });
                            grouped.get(key).qty += 1;
                          }
                          const charmLines = Array.from(grouped.values());

                          return (
                            <div className="checkout-designMeta">
                              <div className="checkout-lineMeta">
                                Vòng: {braceletName}
                                {sizePart ? ` · ${sizePart}` : ""}
                              </div>

                              {charmLines.length ? (
                                <div className="checkout-designList">
                                  {charmLines.map((x) => {
                                    const charmMeta = productMetaMap.get(String(x.pid)) || null;
                                    const name = charmMeta?.name || "Charm";
                                    return (
                                      <div key={`${x.pid}::${x.vcode}`} className="checkout-designItem" title={name}>
                                        {name}
                                        <span className="checkout-designQty">x{x.qty}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="checkout-lineMeta">Không có charm</div>
                              )}
                            </div>
                          );
                        })()}

                        <div className="checkout-lineQty">
                          x{b.quantity || 1}
                        </div>
                      </div>
                      <div className="checkout-linePrice">
                        {formatPrice(
                          (Number(b?.priceSnapshot?.total) || 0) *
                          (Number(b?.quantity) || 1),
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Render selected product lines */}
                  {(productLineIds || []).map((lineId) => {
                    const pl = (cart?.products || []).find((p) => String(p._id) === String(lineId));
                    if (!pl) return null;

                    // Friendly display: prefer product meta name and show classification (size · material · color)
                    const prodMeta = productMetaMap.get(String(pl.productId)) || null;
                    const displayName = prodMeta?.name || pl?.name || pl?.productName || "Sản phẩm";
                    // try to resolve variant details from prodMeta if available
                    const variant = prodMeta ? findVariant(prodMeta, pl?.variantId || pl?.variantCode || '') : null;
                    const size = normAttr(pl?.size ?? variant?.size ?? variant?.sizeCm ?? null);
                    const material = normAttr(pl?.material ?? variant?.material ?? null);
                    const color = normAttr(pl?.color ?? variant?.color ?? null);
                    const classification = [size, material, color].filter(Boolean).join(' · ');

                    return (
                      <div key={String(lineId)} className="checkout-line">
                        <div>
                          <div className="checkout-lineTitle">Sản phẩm</div>
                          <div className="checkout-lineMeta">{displayName}{classification ? ` · ${classification}` : ''}</div>
                          {pl?.engraving?.text ? (
                            <div className="checkout-lineMeta">Khắc: {String(pl.engraving.text)}</div>
                          ) : null}
                          <div className="checkout-lineQty">x{pl.quantity || 1}</div>
                        </div>
                        <div className="checkout-linePrice">{formatPrice((Number(pl.price) || 0) * (Number(pl.quantity) || 1))}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="checkout-empty">
                  Không có thiết kế nào được chọn
                </div>
              )}

              <div className="checkout-divider" />

              <div className="checkout-summary">
                {/* <div className="checkout-row">
                  <div>Số thiết kế:</div>
                  <strong>{selectedCount}</strong>
                </div> */}
                <div className="checkout-row">
                  <div>Tạm tính</div>
                  <strong>{formatPrice(total)}</strong>
                </div>
                <div className="checkout-row">
                  <div>Vận chuyển</div>
                  <strong>Miễn phí</strong>
                </div>
                <div className="checkout-total">
                  <div>Tổng</div>
                  <div>{formatPrice(total)}</div>
                </div>
              </div>

              <button
                type="button"
                className="checkout-place"
                disabled={placing || !selectedCount}
                onClick={placeOrder}
              >
                {placing ? "Đang đặt hàng..." : "Đặt hàng"}
              </button>

              <a className="checkout-track" href="/orders">
                Trạng thái đơn hàng
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
