import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "./Cart.scss";
import { formatPrice } from "../utils/format";

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

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [charms, setCharms] = useState([]);
  const [loadingCharms, setLoadingCharms] = useState(false);

  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const [openBundle, setOpenBundle] = useState({});
  const [productMetaMap, setProductMetaMap] = useState(new Map());

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res?.data || null);
      const products = res?.data?.products || [];
      const bundles = res?.data?.bundles || [];
      // collect productIds referenced by legacy product lines and bracelet productIds from bundles
      const ids = Array.from(
        new Set([
          ...products.map((p) => String(p.productId)),
          ...bundles.map((b) => String(b?.bracelet?.productId || '')),
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
      setToast({ type: "error", message: e.message || "Failed to load cart" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
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
    try {
      await api.patchBundle(bundleId, { quantity });
      await refresh();
    } catch (e) {
      setToast({ type: "error", message: e.message || "Update failed" });
    }
  };

  // Update quantity for legacy product line
  const patchProductQty = async (lineId, quantity) => {
    try {
      await api.patchProduct(lineId, { quantity });
      await refresh();
      setToast({ type: 'success', message: 'Cập nhật giỏ hàng thành công' });
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Update failed' });
    }
  };

  const removeBundle = async (bundleId) => {
    try {
      await api.deleteBundle(bundleId);
      await refresh();
    } catch (e) {
      setToast({ type: "error", message: e.message || "Delete failed" });
    }
  };

  const removeProductLine = async (lineId) => {
    try {
      await api.deleteProduct(lineId);
      await refresh();
      setToast({ type: 'success', message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Delete failed' });
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
        next[key] = prev[key] !== false;
      }
      for (const p of products) {
        const key = `p:${p._id}`;
        next[key] = prev[key] !== false;
      }
      const nextAll = (bundles.length + products.length)
        ? [...bundles.map(b => `b:${b.bundleId}`), ...products.map(p => `p:${p._id}`)].every((k) => next[k] !== false)
        : false;
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
    try {
      sessionStorage.setItem(
        "checkout:bundleIds",
        JSON.stringify({ bundleIds: selectedBundleIds, at: Date.now() }),
      );
      sessionStorage.setItem(
        "checkout:productLineIds",
        JSON.stringify({ productLineIds: selectedProductLineIds, at: Date.now() }),
      );
    } catch {
      // ignore
    }
    navigate("/checkout");
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
                <div className="cart2-sectionTitle">Design của bạn</div>
                <button
                  type="button"
                  className="cart2-caret"
                  onClick={refresh}
                  title="Tải lại"
                >
                  <span />
                </button>
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
                           const material = variant?.material || variant?.materialLabel || (meta?.materials && meta.materials[0]) || meta?.material?.name || null;
                           const color = variant?.color || variant?.colorLabel || null;
                           const sizeText = variant?.size || variant?.sizeCm || variant?.sizeLabel || null;
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
                          return (
                            <div key={pl._id} className="cart2-bundle" style={{ padding: '16px', borderRadius: 12, background: '#fbfdff', border: '1px solid #e6eef6' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <input type="checkbox" checked={prodChecked} onChange={() => toggleProductLine(pl._id)} style={{ width: 18, height: 18, marginRight: 12 }} />
                                </div>
                                <div style={{ width: 84, height: 84, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden' }}>
                                  {img ? <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ fontSize: 12 }}>HÌNH</div>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 900, fontSize: 20 }}>{title}</div>
                                  {inlineAttrs ? <div style={{ color: '#333', marginTop: 6 }}>{inlineAttrs}</div> : null}
                                  <div style={{ color: '#666', fontSize: 14, marginTop: 6 }}>{categoryLabel}</div>
                                  <div style={{ marginTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        <button type="button" onClick={() => patchProductQty(pl._id, Math.max((pl.quantity || 1) - 1, 1))} disabled={(pl.quantity || 1) <= 1}>-</button>
                                        <div style={{ minWidth: 36, textAlign: 'center', fontWeight: 700 }}>{pl.quantity || 1}</div>
                                        <button type="button" onClick={() => patchProductQty(pl._id, (pl.quantity || 1) + 1)}>+</button>
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 160 }}>
                                      <div style={{ fontWeight: 900, fontSize: 18 }}>{formatPrice((Number(pl.price) || 0) * (Number(pl.quantity) || 1))}</div>
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
                                    Bundle
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
                                  <div style={{ fontWeight: 900 }}>{formatPrice((Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1))}</div>
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
                                      const material = v?.material || v?.materialLabel || (p?.materials && p.materials[0]) || p?.material?.name || null;
                                      const color = v?.color || v?.colorLabel || null;
                                      const sizeText = v?.size || v?.sizeCm || v?.sizeLabel || null;
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
                  <div>Số design đã chọn:</div>
                  <strong>{selectedCount}</strong>
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

        {toast ? (
          <div
            className={
              "cart2-toast " +
              (toast.type === "error" ? "cart2-toastError" : "cart2-toastSuccess")
            }
            role="status"
            onClick={() => setToast(null)}
          >
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
