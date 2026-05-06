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
      if (products.length) {
        const ids = Array.from(new Set(products.map((p) => String(p.productId))));
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

  const charmById = useMemo(() => {
    const m = new Map();
    for (const p of charms || []) m.set(String(p?._id), p);
    return m;
  }, [charms]);

  const selectedIds = bundles
    .filter((b) => selected[b.bundleId] !== false)
    .map((b) => b.bundleId);
  const selectedCount = selectedIds.length;
  const total = bundles
    .filter((b) => selected[b.bundleId] !== false)
    .reduce(
      (sum, b) =>
        sum +
        (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1),
      0,
    );

  // include legacy product lines in total
  const products = cart?.products || [];
  const productsTotal = (products || []).reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
  const grandTotal = total + productsTotal;

  useEffect(() => {
    // Preserve selections on refresh; default new bundles to selected.
    setSelected((prev) => {
      const next = {};
      for (const b of bundles) {
        const id = b.bundleId;
        next[id] = prev[id] !== false;
      }
      const nextAll = bundles.length
        ? bundles.every((b) => next[b.bundleId] !== false)
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
  }, [cart?.guestId, bundles.length]);

  const toggleSelectAll = () => {
    const nextAll = !selectAll;
    setSelectAll(nextAll);
    const next = {};
    for (const b of bundles) next[b.bundleId] = nextAll;
    setSelected(next);
  };

  const toggleBundle = (bundleId) => {
    setSelected((prev) => {
      const nextChecked = !(prev[bundleId] !== false);
      const next = { ...prev, [bundleId]: nextChecked };
      const nextAll = bundles.length
        ? bundles.every((b) => next[b.bundleId] !== false)
        : false;
      setSelectAll(nextAll);
      return next;
    });
  };

  const goCheckout = () => {
    if (!selectedCount) return;
    try {
      sessionStorage.setItem(
        "checkout:bundleIds",
        JSON.stringify({ bundleIds: selectedIds, at: Date.now() }),
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
                          const img = firstImage(meta, variant?.code || variant?._id || '');
                          // derive human-friendly variant label (size/code)
                          const variantSize = variant?.size || variant?.sizeCm || variant?.sizeLabel || variant?.label || null;
                          const variantCode = variant?.code || variant?.variantCode || String(pl.variantId || '');
                          return (
                            <div key={pl._id} className="cart2-bundle" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fbfdff', border: '1px solid #e6eef6' }}>
                              <div style={{ width: 88, height: 88, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                                {img ? <img src={img} alt={title} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <div style={{ fontSize: 12 }}>HÌNH</div>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
                                <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>{meta?.code || meta?._id || ''} {variantSize ? `· Size: ${variantSize}` : ''} {variantCode ? `· ${variantCode}` : ''}</div>
                                <div style={{ marginTop: 10 }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <button type="button" onClick={() => patchProductQty(pl._id, Math.max((pl.quantity || 1) - 1, 1))} disabled={(pl.quantity || 1) <= 1}>-</button>
                                    <div style={{ minWidth: 28, textAlign: 'center' }}>{pl.quantity || 1}</div>
                                    <button type="button" onClick={() => patchProductQty(pl._id, (pl.quantity || 1) + 1)}>+</button>
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', minWidth: 140 }}>
                                <div style={{ fontWeight: 800, fontSize: 16 }}>{formatPrice((Number(pl.price) || 0) * (Number(pl.quantity) || 1))}</div>
                                <div style={{ marginTop: 8 }}>
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
                          const checked = selected[id] !== false;
                          const open = openBundle[id] === true;
                          const items = Array.isArray(b?.items) ? b.items : [];
                          const shown = open ? items : items.slice(0, 2);

                          const braceletLabel = [
                            b?.bracelet?.typeCode,
                            b?.bracelet?.sizeCm ? `${b.bracelet.sizeCm}cm` : null,
                            b?.bracelet?.variantCode
                              ? String(b.bracelet.variantCode)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ");

                          const firstItem = items[0] || null;
                          const firstCharm = firstItem
                            ? charmById.get(String(firstItem?.charmProductId))
                            : null;
                          const thumbUrl = firstCharm
                            ? firstImage(firstCharm, firstItem?.charmVariantCode)
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
                                      {braceletLabel || "-"}
                                    </span>
                                  </div>
                                  <div className="cart2-bundleMeta">
                                    Sử dụng slot: {items.length} /{" "}
                                    {b?.rulesSnapshot?.slotCount ?? "-"}
                                  </div>
                                </div>
                                <div className="cart2-bundlePrice">
                                  {formatPrice(
                                    (Number(b?.priceSnapshot?.total) || 0) *
                                    (Number(b?.quantity) || 1),
                                  )}
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
                                    Vòng tay{" "}
                                    {braceletLabel || b?.bracelet?.typeCode || ""}
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
                                          const vCode = it?.charmVariantCode
                                            ? String(it.charmVariantCode)
                                            : "";
                                          return (
                                            <div
                                              key={it.slotIndex}
                                              className="cart2-itemRow"
                                            >
                                              <div className="cart2-itemLeft">
                                                <span className="cart2-dot">•</span>
                                                <span
                                                  className="cart2-itemText"
                                                  title={name}
                                                >
                                                  Slot {it.slotIndex}: {name}
                                                  {vCode ? ` (${vCode})` : ""}
                                                </span>
                                              </div>
                                              <div className="cart2-itemPrice">
                                                {formatPrice(price)}
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {items.length > shown.length ? (
                                          <div style={{ marginTop: 4 }}>
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
