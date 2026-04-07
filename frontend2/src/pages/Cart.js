import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import "./Cart.scss";

const currencyVND = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("vi-VN") + "₫";
};

const findVariantByCode = (product, code) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (!code) return variants[0] || null;
  return variants.find((v) => String(v?.code) === String(code)) || variants[0] || null;
};

const firstImage = (product, variantCode) => {
  const v = findVariantByCode(product, variantCode);
  const img = v?.images?.[0] || null;
  return typeof img === "string" && img.trim() ? img : null;
};

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [charms, setCharms] = useState([]);
  const [loadingCharms, setLoadingCharms] = useState(false);

  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(true);
  const [openBundle, setOpenBundle] = useState({});

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res?.data || null);
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

  const removeBundle = async (bundleId) => {
    try {
      await api.deleteBundle(bundleId);
      await refresh();
    } catch (e) {
      setToast({ type: "error", message: e.message || "Delete failed" });
    }
  };

  const bundles = cart?.bundles || [];

  const charmById = useMemo(() => {
    const m = new Map();
    for (const p of charms || []) m.set(String(p?._id), p);
    return m;
  }, [charms]);

  const selectedIds = bundles.filter((b) => selected[b.bundleId] !== false).map((b) => b.bundleId);
  const selectedCount = selectedIds.length;
  const total = bundles
    .filter((b) => selected[b.bundleId] !== false)
    .reduce((sum, b) => sum + (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1), 0);

  useEffect(() => {
    // Preserve selections on refresh; default new bundles to selected.
    setSelected((prev) => {
      const next = {};
      for (const b of bundles) {
        const id = b.bundleId;
        next[id] = prev[id] !== false;
      }
      const nextAll = bundles.length ? bundles.every((b) => next[b.bundleId] !== false) : false;
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
      const nextAll = bundles.length ? bundles.every((b) => next[b.bundleId] !== false) : false;
      setSelectAll(nextAll);
      return next;
    });
  };

  return (
    <div className="cart2-page">
      <div className="container">
        <h1 className="cart2-title">Giỏ hàng</h1>

        <div className="cart2-shell">
          <div className="cart2-left">
            <label className="cart2-checkRow">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              Chọn tất cả
            </label>

            <div className="cart2-card">
              <div className="cart2-sectionHead">
                <div className="cart2-sectionTitle">Design của bạn</div>
                <button type="button" className="cart2-caret" onClick={refresh} title="Tải lại">
                  <span />
                </button>
              </div>

              <div className="cart2-content">
                {loading ? (
                  <div className="cart2-empty">Đang tải...</div>
                ) : bundles.length ? (
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
                        b?.bracelet?.variantCode ? String(b.bracelet.variantCode) : null,
                      ]
                        .filter(Boolean)
                        .join(" · ");

                      const firstItem = items[0] || null;
                      const firstCharm = firstItem ? charmById.get(String(firstItem?.charmProductId)) : null;
                      const thumbUrl = firstCharm ? firstImage(firstCharm, firstItem?.charmVariantCode) : null;

                      return (
                        <div key={id} className="cart2-bundle">
                          <div className="cart2-bundleTop">
                            <input type="checkbox" checked={checked} onChange={() => toggleBundle(id)} />
                            <div>
                              <div className="cart2-bundleName">
                                Bundle
                                <span style={{ fontWeight: 800, fontSize: 13, color: "rgba(11, 18, 32, 0.55)" }}>
                                  {braceletLabel || "-"}
                                </span>
                              </div>
                              <div className="cart2-bundleMeta">
                                Sử dụng slot: {items.length} / {b?.rulesSnapshot?.slotCount ?? "-"}
                              </div>
                            </div>
                            <div className="cart2-bundlePrice">
                              {currencyVND((Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1))}
                            </div>
                          </div>

                          <div className="cart2-bundleBody">
                            <div className="cart2-thumb">
                              {thumbUrl ? (
                                <img src={thumbUrl} alt="Design" loading="lazy" />
                              ) : (
                                <div>DESIGN</div>
                              )}
                            </div>
                            <div>
                              <div className="cart2-infoTitle">
                                Vòng tay {braceletLabel || b?.bracelet?.typeCode || ""}
                              </div>
                              <div className="cart2-infoSub">
                                {items.length ? (
                                  <>
                                    {shown.map((it) => {
                                      const p = charmById.get(String(it?.charmProductId));
                                      const v = findVariantByCode(p, it?.charmVariantCode);
                                      const name = p?.name || "Charm";
                                      const price = Number(v?.price) || 0;
                                      const vCode = it?.charmVariantCode ? String(it.charmVariantCode) : "";
                                      return (
                                        <div key={it.slotIndex} className="cart2-itemRow">
                                          <div className="cart2-itemLeft">
                                            <span className="cart2-dot">•</span>
                                            <span className="cart2-itemText" title={name}>
                                              Slot {it.slotIndex}: {name}
                                              {vCode ? ` (${vCode})` : ""}
                                            </span>
                                          </div>
                                          <div className="cart2-itemPrice">{currencyVND(price)}</div>
                                        </div>
                                      );
                                    })}
                                    {items.length > shown.length ? (
                                      <div style={{ marginTop: 4 }}>+{items.length - shown.length} item khác</div>
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
                                  onClick={() => setOpenBundle((p) => ({ ...p, [id]: !open }))}
                                >
                                  {open ? "Ẩn bớt charm" : "Hiển thị tất cả charm"}
                                </button>
                              ) : null}

                              {b?.priceSnapshot ? (
                                <div className="cart2-itemsHint">
                                  Vòng: {currencyVND(b?.priceSnapshot?.braceletPrice)} | Charms: {currencyVND(b?.priceSnapshot?.charmsPrice)}
                                  {loadingCharms ? "" : ""}
                                </div>
                              ) : null}

                              <div className="cart2-actions">
                                <div className="cart2-stepper" aria-label="Số lượng">
                                  <button
                                    type="button"
                                    onClick={() => patchQty(id, Math.max((b.quantity || 1) - 1, 1))}
                                    disabled={(b.quantity || 1) <= 1}
                                  >
                                    -
                                  </button>
                                  <div>{b.quantity || 1}</div>
                                  <button type="button" onClick={() => patchQty(id, (b.quantity || 1) + 1)}>
                                    +
                                  </button>
                                </div>
                                <button type="button" className="cart2-remove" onClick={() => removeBundle(id)}>
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
                    Giỏ hàng đang trống. Vào <a className="font-semibold underline" href="/design">Mix Charm</a> để tạo 1 thiết kế.
                  </div>
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
                  <strong>{currencyVND(total)}</strong>
                </div>
                <div className="cart2-row">
                  <div>Vận chuyển</div>
                  <strong>Miễn phí</strong>
                </div>
                <div className="cart2-divider" />
                <div className="cart2-total">
                  <div>Tổng</div>
                  <div>{currencyVND(total)}</div>
                </div>
                <button type="button" className="cart2-pay" disabled={!selectedCount}>
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast ? (
        <div
          className={"cart2-toast " + (toast.type === "error" ? "cart2-toastError" : "cart2-toastSuccess")}
          role="status"
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
