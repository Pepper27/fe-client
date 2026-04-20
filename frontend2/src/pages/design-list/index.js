import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";
import { formatPrice } from "../../utils/format";

export default function DesignList() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res?.data || null);
    } catch (e) {
      setToast({ type: "error", message: e.message || "Failed to load designs" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bundles = useMemo(() => cart?.bundles || [], [cart]);

  const stats = useMemo(() => {
    const total = bundles.reduce(
      (sum, b) => sum + (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1),
      0
    );
    const count = bundles.length;
    return { total, count };
  }, [bundles]);

  const onEdit = (b) => {
    // Persist a lightweight snapshot for the builder to load.
    // This avoids needing a new backend endpoint right now.
    try {
      const payload = {
        version: 1,
        source: "cartBundle",
        savedAt: Date.now(),
        bundleId: b?.bundleId,
        bracelet: b?.bracelet || null,
        items: Array.isArray(b?.items) ? b.items : [],
      };
      localStorage.setItem("mixcharm:edit", JSON.stringify(payload));
    } catch {
      // ignore; still navigate
    }
    navigate("/design/mix?mode=edit");
  };

  return (
    <div className="container designlist-page">
      <div className="designlist-top">
        <div>
          <h1 className="designlist-title">Design của bạn</h1>
          <div className="designlist-sub">
            {loading ? "Đang tải..." : stats.count ? `${stats.count} design · Tổng ${formatPrice(stats.total)}` : "Chưa có design"}
          </div>
        </div>

        <Link to="/design/mix" className="designlist-create" aria-label="Tạo design">
          Tạo design
        </Link>
      </div>

      <div className="designlist-shell">
        {loading ? (
          <div className="designlist-empty">Đang tải...</div>
        ) : bundles.length ? (
          <div className="designlist-grid" role="list">
            {bundles.map((b) => {
              const id = b?.bundleId;
              const braceletLabel = [
                b?.bracelet?.typeCode,
                b?.bracelet?.sizeCm ? `${b.bracelet.sizeCm}cm` : null,
                b?.bracelet?.variantCode ? String(b.bracelet.variantCode) : null,
              ]
                .filter(Boolean)
                .join(" · ");

              const used = Array.isArray(b?.items) ? b.items.length : 0;
              const slotCount = b?.rulesSnapshot?.slotCount;

              return (
                <div key={id} className="designlist-card" role="listitem">
                  <div className="designlist-cardTop">
                    <div className="designlist-name">Bundle</div>
                    <div className="designlist-price">
                       {formatPrice((Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1))}
                    </div>
                  </div>

                  <div className="designlist-meta">
                    <div className="designlist-chip">{braceletLabel || "-"}</div>
                    <div className="designlist-chip">
                      Slot: {used}
                      {typeof slotCount === "number" ? ` / ${slotCount}` : ""}
                    </div>
                    <div className="designlist-chip">SL: {b?.quantity || 1}</div>
                  </div>

                  {Array.isArray(b?.items) && b.items.length ? (
                    <div className="designlist-items">
                      {b.items.slice(0, 4).map((it) => (
                        <div key={it.slotIndex} className="designlist-item">
                          Slot {it.slotIndex}
                        </div>
                      ))}
                      {b.items.length > 4 ? <div className="designlist-item">+{b.items.length - 4}</div> : null}
                    </div>
                  ) : (
                    <div className="designlist-items designlist-itemsEmpty">Chưa có charm</div>
                  )}

                  <div className="designlist-actions">
                    <button type="button" className="designlist-btn" onClick={() => onEdit(b)}>
                      Sửa design
                    </button>
                    <button type="button" className="designlist-btn designlist-btnGhost" onClick={refresh}>
                      Tải lại
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="designlist-empty">
            Chưa có design nào trong giỏ. Vào <Link to="/design/mix">Mix Charm</Link> để tạo design.
          </div>
        )}
      </div>

      {toast ? (
        <div
          className={
            "designlist-toast " + (toast.type === "error" ? "designlist-toastError" : "designlist-toastSuccess")
          }
          role="status"
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
