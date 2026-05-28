import React, { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "./Cart.scss";
import { formatPrice } from "../utils/format";
import toast from "react-hot-toast";

// Find variant by identifier: prefer _id (or id), fallback to code/variantCode
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

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const stockCleanupRef = useRef(false);

  const [charms, setCharms] = useState([]);
  const [loadingCharms, setLoadingCharms] = useState(false);

  const [selected, setSelected] = useState({});
  // Do not default to select-all on page load; user must choose selections explicitly
  const [selectAll, setSelectAll] = useState(false);
  const [openBundle, setOpenBundle] = useState({});
  const [productMetaMap, setProductMetaMap] = useState(new Map());

  const getProductForId = (productId) => {
    const pid = productId ? String(productId) : "";
    if (!pid) return null;
    return productMetaMap.get(pid) || charmById.get(pid) || null;
  };

  const canonVariantKey = (productObj, variantIdentifier) => {
    if (!productObj) return variantIdentifier == null ? "" : String(variantIdentifier);
    const v = findVariant(productObj, variantIdentifier);
    return String(v?._id || v?.id || v?.variantCode || v?.code || variantIdentifier || "");
  };

  const getStockQty = (productObj, variantIdentifier) => {
    const v = productObj ? findVariant(productObj, variantIdentifier) : null;
    return typeof v?.quantity === "number" ? v.quantity : null;
  };

  const countInCart = ({ productId, variantIdentifier, excludeLineId, excludeBundleId } = {}) => {
    const pid = productId ? String(productId) : "";
    if (!pid) return 0;
    const productObj = getProductForId(pid);
    const wantKey = variantIdentifier == null ? "" : canonVariantKey(productObj, variantIdentifier);

    const matchesVariant = (val) => {
      if (!wantKey) return true;
      if (val == null) return false;
      const key = canonVariantKey(productObj, val);
      return key === wantKey;
    };

    let total = 0;

    const productsNow = Array.isArray(cart?.products) ? cart.products : [];
    for (const pl of productsNow) {
      if (excludeLineId && String(pl?._id) === String(excludeLineId)) continue;
      if (String(pl?.productId || "") !== pid) continue;
      if (!matchesVariant(pl?.variantId)) continue;
      total += Number(pl?.quantity) || 0;
    }

    const bundlesNow = Array.isArray(cart?.bundles) ? cart.bundles : [];
    for (const b of bundlesNow) {
      if (excludeBundleId && String(b?.bundleId) === String(excludeBundleId)) continue;
      const bQty = Number(b?.quantity) || 0;
      if (!bQty) continue;

      // bracelet counts once per bundle
      if (String(b?.bracelet?.productId || "") === pid) {
        const brVar = b?.bracelet?.variantCode || b?.bracelet?.variantId || null;
        if (matchesVariant(brVar)) total += 1 * bQty;
      }

      // items can contain the same product multiple times (multiple slots)
      const items = Array.isArray(b?.items) ? b.items : [];
      let occ = 0;
      for (const it of items) {
        if (String(it?.charmProductId || "") !== pid) continue;
        const itVar = it?.charmVariantCode || it?.variantCode || it?.variantId || null;
        if (!matchesVariant(itVar)) continue;
        occ += 1;
      }
      if (occ) total += occ * bQty;
    }

    return total;
  };

  const getMaxForProductLine = (pl) => {
    const pid = pl?.productId ? String(pl.productId) : "";
    if (!pid) return null;
    const productObj = getProductForId(pid);
    const stock = getStockQty(productObj, String(pl?.variantId || ""));
    if (stock == null) return null;
    const usedOther = countInCart({
      productId: pid,
      variantIdentifier: String(pl?.variantId || ""),
      excludeLineId: pl?._id,
    });
    return Math.max(0, stock - usedOther);
  };

  const getMaxForBundle = (bundle) => {
    if (!bundle) return null;
    const constraints = [];
    const bundleId = bundle?.bundleId;

    // bracelet
    const brPid = bundle?.bracelet?.productId ? String(bundle.bracelet.productId) : null;
    if (brPid) {
      const brMeta = getProductForId(brPid);
      const brVar = bundle?.bracelet?.variantCode || bundle?.bracelet?.variantId || null;
      const stock = getStockQty(brMeta, brVar);
      if (stock != null) {
        const usedOther = countInCart({
          productId: brPid,
          variantIdentifier: brVar,
          excludeBundleId: bundleId,
        });
        const remaining = Math.max(0, stock - usedOther);
        constraints.push(Math.floor(remaining / 1));
      }
    }

    // charms
    const items = Array.isArray(bundle?.items) ? bundle.items : [];
    const occByKey = new Map();
    for (const it of items) {
      const pid = it?.charmProductId ? String(it.charmProductId) : null;
      if (!pid) continue;
      const vid = it?.charmVariantCode || it?.variantCode || it?.variantId || null;
      const vKey = vid == null ? "" : String(vid);
      const key = `${pid}::${vKey}`;
      occByKey.set(key, (occByKey.get(key) || 0) + 1);
    }
    for (const [key, occ] of occByKey.entries()) {
      const [pid, vKey] = key.split("::");
      const p = getProductForId(pid);
      const stock = getStockQty(p, vKey);
      if (stock == null || occ <= 0) continue;
      const usedOther = countInCart({
        productId: pid,
        variantIdentifier: vKey,
        excludeBundleId: bundleId,
      });
      const remaining = Math.max(0, stock - usedOther);
      constraints.push(Math.floor(remaining / occ));
    }

    if (!constraints.length) return null;
    const min = Math.min(...constraints);
    return Number.isFinite(min) ? Math.max(0, min) : null;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      // set cart from server; but keep existing selections where possible to avoid UI jumps
      setCart((prev) => {
        const next = res?.data || null;
        if (!next) return next;
        // preserve previous selection state keys where same bundle/product ids exist
        try {
          if (prev && prev.bundles && next.bundles) {
            // nothing to mutate here; selection state is separate
          }
        } catch (e) {}
        return next;
      });
      const products = res?.data?.products || [];
      const bundles = res?.data?.bundles || [];
      // collect productIds referenced by legacy product lines and bracelet productIds from bundles
      const ids = Array.from(
        new Set([
          ...products.map((p) => String(p.productId)),
          ...bundles.map((b) => String(b?.bracelet?.productId || '')),
          ...bundles.flatMap((b) => (Array.isArray(b?.items) ? b.items.map((it) => String(it?.charmProductId || '')) : [])),
        ].filter(Boolean)),
      );
      if (ids.length) {
        const ps = await Promise.all(ids.map((id) => api.getProductByIdPublic(id).catch(() => null)));
        const map = new Map();
        for (let i = 0; i < ids.length; i++) if (ps[i]) map.set(String(ids[i]), ps[i]);
        setProductMetaMap(map);
      } else {
        setProductMetaMap(new Map());
      }
    } catch (e) {
      toast.error(e.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Listen for external cart changes and refresh local cart state without a full page reload.
    let timeout = null;
    const onCartChanged = () => {
      // debounce multiple events
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        try {
          const res = await api.getCart();
          setCart(res?.data || null);
        } catch (e) {
          // ignore
        }
      }, 250);
    };
    window.addEventListener('cart:changed', onCartChanged);
    return () => {
      window.removeEventListener('cart:changed', onCartChanged);
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingCharms(true);
    api
      .getCharms()
      .then((res) => {
        if (cancelled) return;
        setCharms(res?.data || []);
      })
      .catch(() => {
        // Cart still works without charm metadata.
      })
      .finally(() => {
        if (!cancelled) setLoadingCharms(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const patchQty = async (bundleId, quantity) => {
    const bundlesNow = cart?.bundles || [];
    const bundle = bundlesNow.find((b) => String(b?.bundleId) === String(bundleId)) || null;
    const max = getMaxForBundle(bundle);
    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const nextQty = max != null ? Math.min(safeQty, max) : safeQty;
    if (max != null && safeQty > max) {
      toast.error(`Số lượng tối đa theo tồn kho là ${max}`);
    }

    // Optimistic update: update local state immediately, call API in background
    const prev = cart;
    try {
      setCart((c) => {
        if (!c) return c;
        const next = { ...c, bundles: (c.bundles || []).map((b) => (String(b.bundleId) === String(bundleId) ? { ...b, quantity: nextQty } : b)) };
        return next;
      });
      await api.patchBundle(bundleId, { quantity: nextQty });
      // no full refresh to avoid full page/network churn
    } catch (e) {
      // revert
      setCart(prev);
      toast.error(e.message || "Update failed");
    }
  };

  // Update quantity for legacy product line
  const patchProductQty = async (lineId, quantity) => {
    const productsNow = cart?.products || [];
    const pl = productsNow.find((p) => String(p?._id) === String(lineId)) || null;
    const max = pl ? getMaxForProductLine(pl) : null;

    const safeQty = Math.max(1, Math.floor(Number(quantity) || 1));
    const nextQty = max != null ? Math.min(safeQty, Math.max(0, max)) : safeQty;
    if (max != null && safeQty > max) {
      toast.error(`Số lượng tối đa theo tồn kho là ${max}`);
    }

    const prev = cart;
    try {
      setCart((c) => {
        if (!c) return c;
        const next = { ...c, products: (c.products || []).map((p) => (String(p._id) === String(lineId) ? { ...p, quantity: nextQty } : p)) };
        return next;
      });
      await api.patchProduct(lineId, { quantity: nextQty });
      toast.success("Cập nhật giỏ hàng thành công");
    } catch (e) {
      setCart(prev);
      toast.error(e.message || "Update failed");
    }
  };

  const removeBundle = async (bundleId) => {
    const prev = cart;
    try {
      setCart((c) => {
        if (!c) return c;
        const next = { ...c, bundles: (c.bundles || []).filter((b) => String(b.bundleId) !== String(bundleId)) };
        return next;
      });
      await api.deleteBundle(bundleId);
    } catch (e) {
      setCart(prev);
      toast.error(e.message || "Delete failed");
    }
  };

  const removeProductLine = async (lineId) => {
    const prev = cart;
    try {
      setCart((c) => {
        if (!c) return c;
        const next = { ...c, products: (c.products || []).filter((p) => String(p._id) !== String(lineId)) };
        return next;
      });
      await api.deleteProduct(lineId);
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
    } catch (e) {
      setCart(prev);
      toast.error(e.message || "Delete failed");
    }
  };

  const bundles = cart?.bundles || [];
  // legacy product lines
  const products = cart?.products || [];
  const charmById = useMemo(() => {
    const m = new Map();
    for (const p of charms || []) m.set(String(p?._id), p);
    return m;
  }, [charms]);

  // Auto-remove out-of-stock items from cart (when we can determine stock = 0)
  useEffect(() => {
    if (!cart) return;
    if (stockCleanupRef.current) return;

    const productsNow = Array.isArray(cart?.products) ? cart.products : [];
    const bundlesNow = Array.isArray(cart?.bundles) ? cart.bundles : [];

    const isKnownOut = (productObj, variantIdentifier) => {
      const stock = getStockQty(productObj, variantIdentifier);
      return typeof stock === "number" && stock <= 0;
    };

    const toRemoveProductLines = [];
    for (const pl of productsNow) {
      const pid = pl?.productId ? String(pl.productId) : "";
      if (!pid) continue;
      const productObj = getProductForId(pid);
      if (!productObj) continue;
      const vid = pl?.variantId || pl?.variantCode || null;
      if (isKnownOut(productObj, vid)) toRemoveProductLines.push(String(pl._id));
    }

    const toRemoveBundles = [];
    for (const b of bundlesNow) {
      const bundleId = b?.bundleId ? String(b.bundleId) : "";
      if (!bundleId) continue;

      const brPid = b?.bracelet?.productId ? String(b.bracelet.productId) : "";
      const brObj = brPid ? getProductForId(brPid) : null;
      const brVar = b?.bracelet?.variantCode || b?.bracelet?.variantId || null;
      if (brObj && isKnownOut(brObj, brVar)) {
        toRemoveBundles.push(bundleId);
        continue;
      }

      const items = Array.isArray(b?.items) ? b.items : [];
      let anyOut = false;
      for (const it of items) {
        const pid = it?.charmProductId ? String(it.charmProductId) : "";
        if (!pid) continue;
        const pObj = getProductForId(pid);
        if (!pObj) continue;
        const vId = it?.charmVariantCode || it?.variantCode || it?.variantId || null;
        if (isKnownOut(pObj, vId)) {
          anyOut = true;
          break;
        }
      }
      if (anyOut) toRemoveBundles.push(bundleId);
    }

    if (!toRemoveProductLines.length && !toRemoveBundles.length) return;

    stockCleanupRef.current = true;
    (async () => {
      let removed = 0;
      // Optimistically update UI first
      setCart((c) => {
        if (!c) return c;
        const next = {
          ...c,
          products: (c.products || []).filter(
            (p) => !toRemoveProductLines.includes(String(p._id)),
          ),
          bundles: (c.bundles || []).filter(
            (b) => !toRemoveBundles.includes(String(b.bundleId)),
          ),
        };
        return next;
      });

      // Remove from server
      for (const id of toRemoveProductLines) {
        try {
          await api.deleteProduct(id);
          removed += 1;
        } catch {
          // ignore
        }
      }
      for (const id of toRemoveBundles) {
        try {
          await api.deleteBundle(id);
          removed += 1;
        } catch {
          // ignore
        }
      }

      if (removed) toast.error("Một số sản phẩm đã hết hàng và được xoá khỏi giỏ");
      try {
        window.dispatchEvent(new Event("cart:changed"));
      } catch {}
    })().finally(() => {
      stockCleanupRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, productMetaMap, charmById]);

  // Heuristic to filter out internal product/variant codes from display labels
  const isLikelyCode = (s) => {
    if (!s || typeof s !== 'string') return false;
    // common patterns: contains double-hyphen, starts with SP-, or long uppercase-with-dashes codes
    if (s.includes('--')) return true;
    if (/^SP-/i.test(s)) return true;
    if (/^[A-Z0-9-]{6,}$/.test(s)) return true;
    return false;
  };

  // Build selected ids (support both bundles and legacy products)
  const selectedBundleIds = bundles.filter((b) => selected[`b:${b.bundleId}`] !== false).map((b) => b.bundleId);
  const selectedProductLineIds = products.filter((p) => selected[`p:${p._id}`] !== false).map((p) => p._id);
  const selectedCount = selectedBundleIds.length + selectedProductLineIds.length;

  const total = bundles
    .filter((b) => selected[`b:${b.bundleId}`] !== false)
    .reduce((sum, b) => sum + (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1), 0)
    + products.filter((p) => selected[`p:${p._id}`] !== false).reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);

  // grandTotal should reflect only the selected items (total already sums selected bundles + selected products)
  const grandTotal = total;

  useEffect(() => {
    // Preserve selections on refresh; default new bundles/products to selected.
    setSelected((prev) => {
      const next = {};
      for (const b of bundles) {
        const key = `b:${b.bundleId}`;
        // preserve explicit previous choice if present; otherwise default to not selected
        next[key] = Object.prototype.hasOwnProperty.call(prev, key) ? prev[key] !== false : false;
      }
      for (const p of products) {
        const key = `p:${p._id}`;
        next[key] = Object.prototype.hasOwnProperty.call(prev, key) ? prev[key] !== false : false;
      }
      const allKeys = [...bundles.map(b => `b:${b.bundleId}`), ...products.map(p => `p:${p._id}`)];
      const nextAll = allKeys.length ? allKeys.every((k) => next[k] !== false) : false;
      setSelectAll(nextAll);
      return next;
    });

    // Default bundles to collapsed on load.
    setOpenBundle((prev) => {
      const next = { ...prev };
      for (const b of bundles) {
        const id = b.bundleId;
        if (typeof next[id] === "undefined") next[id] = false;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.guestId, bundles.length, products.length]);

  const toggleSelectAll = () => {
    const nextAll = !selectAll;
    setSelectAll(nextAll);
    const next = {};
    for (const b of bundles) next[`b:${b.bundleId}`] = nextAll;
    for (const p of products) next[`p:${p._id}`] = nextAll;
    setSelected(next);
  };

  const toggleBundle = (bundleId) => {
    setSelected((prev) => {
      const key = `b:${bundleId}`;
      const nextChecked = !(prev[key] !== false);
      const next = { ...prev, [key]: nextChecked };
      const allKeys = [...bundles.map(b => `b:${b.bundleId}`), ...products.map(p => `p:${p._id}`)];
      const nextAll = allKeys.length ? allKeys.every((k) => next[k] !== false) : false;
      setSelectAll(nextAll);
      return next;
    });
  };

  const toggleProductLine = (lineId) => {
    setSelected((prev) => {
      const key = `p:${lineId}`;
      const nextChecked = !(prev[key] !== false);
      const next = { ...prev, [key]: nextChecked };
      const allKeys = [...bundles.map(b => `b:${b.bundleId}`), ...products.map(p => `p:${p._id}`)];
      const nextAll = allKeys.length ? allKeys.every((k) => next[k] !== false) : false;
      setSelectAll(nextAll);
      return next;
    });
  };

  const goCheckout = () => {
    if (!selectedCount) return;
    // recompute selection at click time to ensure latest state
    const selBundleIds = (bundles || []).filter((b) => selected[`b:${b.bundleId}`] !== false).map((b) => String(b.bundleId));
    const selProductLineIds = (products || []).filter((p) => selected[`p:${p._id}`] !== false).map((p) => String(p._id));
    try {
      sessionStorage.setItem(
        "checkout:bundleIds",
        JSON.stringify({ bundleIds: selBundleIds, at: Date.now() }),
      );
      sessionStorage.setItem(
        "checkout:productLineIds",
        JSON.stringify({ productLineIds: selProductLineIds, at: Date.now() }),
      );
    } catch {
      // ignore
    }
    // pass selected ids via navigation state as well to avoid any sessionStorage race
    try {
      navigate('/checkout', { state: { bundleIds: selBundleIds, productLineIds: selProductLineIds } });
    } catch (e) {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart2-page">
      <div className="container">
        <h1 className="cart2-title">Giỏ hàng</h1>

        <div className="cart2-shell">
          <div className="cart2-left">
            <label className="cart2-checkRow">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
              Chọn tất cả
            </label>

            <div className="cart2-card">
              <div className="cart2-sectionHead">
                {/* <div className="cart2-sectionTitle">Thiết kế của bạn</div>
                <button
                  type="button"
                  className="cart2-caret"
                  onClick={refresh}
                  title="Tải lại"
                >
                  <span />
                </button> */}
              </div>

              <div className="cart2-content">
                {loading ? (
                  <div className="cart2-empty">Đang tải...</div>
                ) : (
                  <>
                    {/* Render legacy product lines first */}
                    {products && products.length ? (
                      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                        <div style={{ fontWeight: 700 }}>Sản phẩm</div>
                        {products.map((pl) => {
                           const meta = productMetaMap.get(String(pl.productId)) || null;
                           const variant = meta ? findVariant(meta, String(pl.variantId || '')) : null;
                           const title = meta?.name || 'Sản phẩm';
                            const material = normAttr(variant?.material || variant?.materialLabel || (meta?.materials && meta.materials[0]) || meta?.material?.name || null);
                            const color = normAttr(variant?.color || variant?.colorLabel || null);
                            const sizeText = normAttr(variant?.size || variant?.sizeCm || variant?.sizeLabel || null);
                            const inlineAttrs = [sizeText, material, color].filter(Boolean).join(' · ');
                           const prodChecked = selected[`p:${pl._id}`] !== false;
                           const img = (() => {
                             if (!meta) return null;
                             // 1) try variant image by variantId (preferred)
                             const byVariant = firstImage(meta, String(pl.variantId || ''));
                             if (byVariant) return byVariant;
                             // 2) fallback to first variant's first image
                             const firstVariantImg = (meta?.variants && meta.variants[0] && meta.variants[0].images && meta.variants[0].images[0]) || null;
                             if (firstVariantImg) return firstVariantImg;
                             // 3) fallback to product-level images (if present)
                             const productImg = (meta?.images && meta.images[0]) || null;
                             return productImg;
                           })();
                            // derive human-friendly variant label (size)
                            const variantSize = variant?.size || variant?.sizeCm || variant?.sizeLabel || variant?.label || null;
                            const categoryLabel = (meta?.category && (meta.category.name || meta.category.slug)) || '';
                            const maxLineQty = getMaxForProductLine(pl);
                            const disablePlus = maxLineQty != null ? (pl.quantity || 1) >= maxLineQty : false;
                            // Try to resolve an engraving preview to show in the thumb:
                            let previewFromMap = null;
                            try {
                              const key = 'engraving_preview_map';
                              const raw = localStorage.getItem(key);
                              const map = raw ? JSON.parse(raw) : {};
                              previewFromMap = map && map[String(pl._id)];
                            } catch (e) { previewFromMap = null; }

                            const engravingPreview = pl?.engraving && (pl.engraving.previewImageSmall || pl.engraving.previewImage || pl.engraving.previewImageLarge) ? (pl.engraving.previewImageSmall || pl.engraving.previewImage || pl.engraving.previewImageLarge) : null;

                            const displayThumb = previewFromMap || engravingPreview || img;

                            return (
                              <div key={pl._id} className="cart2-bundle" style={{ padding: '16px', borderRadius: 12, background: '#fbfdff', border: '1px solid #e6eef6' }}>
                               <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                 <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" checked={prodChecked} onChange={() => toggleProductLine(pl._id)} style={{ width: 18, height: 18, marginRight: 12 }} />
                                </div>
                                 <div style={{ width: 84, height: 84, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' }}>
                                  {displayThumb ? <img src={displayThumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ fontSize: 12 }}>HÌNH</div>}
                                 </div>
                         <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 900, fontSize: 20 }}>{title}</div>
                            {inlineAttrs ? <div style={{ color: '#333', marginTop: 6 }}>{inlineAttrs}</div> : null}
                            {(function(){
                              // attempt to read client-side fallback map
                              try {
                                const key = 'engraving_preview_map';
                                const raw = localStorage.getItem(key);
                                const map = raw ? JSON.parse(raw) : {};
                                const preview = map && map[String(pl._id)];
                                if (preview) {
                                  // render a shallow engraving-like UI even if server didn't persist engraving
                                  return (
                                    <div style={{ color: '#374151', marginTop: 6, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div>Khắc:</div>
                                        <div style={{ fontWeight: 800 }}>{String(pl?.engraving?.text || '')}</div>
                                      </div>
                                      <img src={preview} alt={`Preview khắc`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} />
                                    </div>
                                  );
                                }
                              } catch (e) {}
                              return pl?.engraving ? (
                                <div style={{ color: '#374151', marginTop: 6, fontWeight: 700 }}>
                                  Khắc: {String(pl.engraving.text)}
                                </div>
                              ) : null;
                            })()}
                            <div style={{ color: '#666', fontSize: 14, marginTop: 6 }}>{categoryLabel}</div>
                                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                         <button type="button" onClick={() => patchProductQty(pl._id, Math.max((pl.quantity || 1) - 1, 1))} disabled={(pl.quantity || 1) <= 1}>-</button>
                                         <div style={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}>{pl.quantity || 1}</div>
                                         <button type="button" onClick={() => patchProductQty(pl._id, (pl.quantity || 1) + 1)} disabled={disablePlus}>+</button>
                                       </div>
                                     </div>
                                    <div style={{ textAlign: 'right', minWidth: 160 }}>
                                       <div style={{ fontWeight: 900, fontSize: 18 }}>{formatPrice(Number(pl.price) || 0)}</div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <button type="button" className="cart2-remove" onClick={() => removeProductLine(pl._id)}>Xóa</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {bundles.length ? (
                      <div style={{ display: "grid", gap: 12 }}>
                        {bundles.map((b) => {
                           const id = b.bundleId;
                           const checked = selected[`b:${id}`] !== false;
                          const open = openBundle[id] === true;
                          const items = Array.isArray(b?.items) ? b.items : [];
                          const shown = open ? items : items.slice(0, 2);

                           // Prefer human-friendly label/name, show size but do NOT show internal variant/product codes
                           // prefer label/typeName; if those look like internal codes, skip them
                           let braceletName = b?.bracelet?.label || b?.bracelet?.typeName || b?.bracelet?.typeCode;
                           if (isLikelyCode(braceletName)) {
                             // fallback: try typeName without code, or leave empty
                             braceletName = b?.bracelet?.typeName || b?.bracelet?.label || '';
                             if (isLikelyCode(braceletName)) braceletName = '';
                           }
                           const braceletLabel = [
                             braceletName,
                             b?.bracelet?.sizeCm ? `${b.bracelet.sizeCm}cm` : null,
                           ]
                             .filter(Boolean)
                             .join(" · ");

                          const firstItem = items[0] || null;
                          const firstCharm = firstItem
                            ? charmById.get(String(firstItem?.charmProductId))
                            : null;
                           const thumbUrl = firstCharm
                             ? firstImage(firstCharm, firstItem?.charmVariantCode) || (firstCharm?.variants && firstCharm.variants[0] && firstCharm.variants[0].images && firstCharm.variants[0].images[0]) || null
                             : null;

                           const maxBundleQty = getMaxForBundle(b);
                           const disableBundlePlus = maxBundleQty != null ? (b.quantity || 1) >= maxBundleQty : false;
                           return (
                             <div key={id} className="cart2-bundle">
                              <div className="cart2-bundleTop">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleBundle(id)}
                                />
                                <div>
                                  <div className="cart2-bundleName">
                                    Thiết kế
                                    <span
                                      style={{
                                        fontWeight: 800,
                                        fontSize: 13,
                                        color: "rgba(11, 18, 32, 0.55)",
                                      }}
                                    >
                                      {(() => {
                                        const braceletMeta = productMetaMap.get(String(b?.bracelet?.productId || '')) || null;
                                        if (braceletMeta?.name) return braceletMeta.name;
                                        return braceletLabel || "-";
                                      })()}
                                    </span>
                                  </div>
                                  {/* bundleMeta moved next to price for cleaner layout */}
                                </div>
                                <div className="cart2-bundlePrice">
                                  <div style={{ fontWeight: 900 }}>{formatPrice(Number(b?.priceSnapshot?.total) || 0)}</div>
                                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>Sử dụng slot: {items.length} / {b?.rulesSnapshot?.slotCount ?? '-'}</div>
                                </div>
                              </div>

                              <div className="cart2-bundleBody">
                                <div className="cart2-thumb">
                                  {thumbUrl ? (
                                    <img
                                      src={thumbUrl}
                                      alt="Design"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div>DESIGN</div>
                                  )}
                                </div>
                                <div>
                                  <div className="cart2-infoTitle">
                                    {/* Prefer product meta name for bracelet when available */}
                                    {(() => {
                                      const braceletMeta = productMetaMap.get(String(b?.bracelet?.productId || '')) || null;
                                      const nameFromMeta = braceletMeta?.name || null;
                                      const sizePart = b?.bracelet?.sizeCm ? ` · ${b.bracelet.sizeCm}cm` : '';
                                      if (nameFromMeta) return `${nameFromMeta}${sizePart}`;
                                      return `Vòng tay ${braceletLabel || ''}`;
                                    })()}
                                  </div>
                                  <div className="cart2-infoSub">
                                    {items.length ? (
                                      <>
                                        {shown.map((it) => {
                                          const p = charmById.get(
                                            String(it?.charmProductId),
                                          );
                                       const v = findVariant(
                                         p,
                                         it?.charmVariantCode,
                                       );
                                          const name = p?.name || "Charm";
                                      const price = Number(v?.price) || 0;
                                       const material = normAttr(v?.material || v?.materialLabel || (p?.materials && p.materials[0]) || p?.material?.name || null);
                                       const color = normAttr(v?.color || v?.colorLabel || null);
                                       const sizeText = normAttr(v?.size || v?.sizeCm || v?.sizeLabel || null);
                                       const inline = [sizeText, material, color].filter(Boolean).join(' · ');
                                          const vCode = it?.charmVariantCode
                                            ? String(it.charmVariantCode)
                                            : "";
                                           return (
                                             <div
                                               key={it.slotIndex}
                                               className="cart2-itemRow"
                                               style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                             >
                                               <div className="cart2-itemLeft">
                                                 <span className="cart2-dot">•</span>
                                                 <span className="cart2-itemText" title={name}>
                                                   Slot {it.slotIndex}: {name}
                                                 </span>
                                               </div>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, justifyContent: 'flex-end' }}>
                                                 <div style={{ fontWeight: 700 }}>{formatPrice(price)}</div>
                                                 {inline ? (
                                                   <div style={{ fontSize: 13, color: '#6B7280' }}>{inline}</div>
                                                 ) : null}
                                               </div>
                                             </div>
                                           );
                                        })}
                                         {items.length > shown.length ? (
                                           <div style={{ marginTop: 8, color: '#374151', fontWeight: 600 }}>
                                             +{items.length - shown.length} item khác
                                           </div>
                                         ) : null}
                                      </>
                                    ) : (
                                      "Chưa có charm"
                                    )}
                                  </div>

                                  {items.length > 2 ? (
                                    <button
                                      type="button"
                                      className="cart2-showAll"
                                      onClick={() =>
                                        setOpenBundle((p) => ({
                                          ...p,
                                          [id]: !open,
                                        }))
                                      }
                                    >
                                      {open
                                        ? "Ẩn bớt charm"
                                        : "Hiển thị tất cả charm"}
                                    </button>
                                  ) : null}

                                  {b?.priceSnapshot ? (
                                    <div className="cart2-itemsHint">
                                      Vòng:{" "}
                                      {formatPrice(b?.priceSnapshot?.braceletPrice)}{" "}
                                      | Charms:{" "}
                                      {formatPrice(b?.priceSnapshot?.charmsPrice)}
                                      {loadingCharms ? "" : ""}
                                    </div>
                                  ) : null}

                                  <div className="cart2-actions">
                                    <div
                                      className="cart2-stepper"
                                      aria-label="Số lượng"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          patchQty(
                                            id,
                                            Math.max((b.quantity || 1) - 1, 1),
                                          )
                                        }
                                        disabled={(b.quantity || 1) <= 1}
                                      >
                                        -
                                      </button>
                                      <div>{b.quantity || 1}</div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          patchQty(id, (b.quantity || 1) + 1)
                                        }
                                        disabled={disableBundlePlus}
                                      >
                                        +
                                      </button>
                                    </div>
                                    <button
                                      type="button"
                                      className="cart2-remove"
                                      onClick={() => removeBundle(id)}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    ) : (
                      <div className="cart2-empty">
                        Giỏ hàng đang trống. Vào {" "}
                        <a className="font-semibold underline" href="/design/mix">
                          Mix Charm
                        </a>{" "}
                        để tạo 1 thiết kế.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="cart2-right">
            <div className="cart2-card cart2-summary">
              <div className="cart2-summaryBody">
                <div className="cart2-summaryTitle">Tóm tắt đơn hàng</div>
                <div className="cart2-row">
                  {/* <div>Số design đã chọn:</div>
                  <strong>{selectedCount}</strong> */}
                </div>
                <div className="cart2-row">
                  <div>Tạm tính</div>
                  <strong>{formatPrice(grandTotal)}</strong>
                </div>
                <div className="cart2-row">
                  <div>Vận chuyển</div>
                  <strong>Miễn phí</strong>
                </div>
                <div className="cart2-divider" />
                <div className="cart2-total">
                  <div>Tổng</div>
                  <div>{formatPrice(grandTotal)}</div>
                </div>
                <button
                  type="button"
                  className="cart2-pay"
                  disabled={!selectedCount}
                  onClick={goCheckout}
                >
                  Mua hàng
                </button>
                <a
                  href="/orders"
                  style={{
                    marginTop: 12,
                    display: "inline-block",
                    fontSize: 13,
                    textDecoration: "underline",
                  }}
                >
                  Theo dõi đơn hàng
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
