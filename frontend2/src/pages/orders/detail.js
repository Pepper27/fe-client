import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";
import { formatPrice } from "../../utils/format";
import { getOrderDisplayStatus } from "../../utils/order-status";
import { useTransition } from "react";
import toast from "react-hot-toast";

const statusKey = (s) => {
  const v = String(s || "");
  if (
    v === "pending" ||
    v === "confirmed" ||
    v === "shipping" ||
    v === "delivered" ||
    v === "cancelled"
  )
    return v;
  return "unknown";
};

const statusLabel = (s) => {
  const v = String(s || "");
  if (v === "pending") return "Chờ xác nhận";
  if (v === "confirmed") return "Chờ lấy hàng";
  if (v === "shipping") return "Đang giao";
  if (v === "delivered") return "Đã giao";
  if (v === "cancelled") return "Đã huỷ";
  return v || "-";
};

const classifyLine = (line) => {
  if (!line) return "Mặc định";
  const size = line?.size || line?.sizeText || line?.sizeCm || null;
  const material = line?.material || null;
  const color = line?.color || null;
  const parts = [size, material, color]
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : "Mặc định";
};

export default function OrderDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const orderCode = String(params.orderCode || "").trim();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [guestView, setGuestView] = useState(false);

  const guestEmail =
    String(location.state?.guestEmail || "") ||
    (() => {
      try {
        return String(sessionStorage.getItem("orders:guestEmail") || "");
      } catch {
        return "";
      }
    })();

  const canCancel = (order) => {
    if (!order) return false;
    return ["pending", "confirmed"].includes(getOrderDisplayStatus(order));
  };

  const handleCancel = async () => {
    if (!order) return;
    if (guestView) return;
    if (!window.confirm("Sau khi huỷ bạn không thể khôi phục đơn hàng. Bạn có chắc muốn huỷ?")) return;
    startTransition(async () => {
      try {
        const res = await api.v1ClientCancelOrder(order.orderCode, { reason: "Khách huỷ (frontend)" });
        setOrder(res?.data || null);
        toast.success("Huỷ đơn hàng thành công!");
        navigate("/orders?tab=cancelled", { replace: true });
      } catch (e) {
        if (e?.status === 409) {
          // Conflict - reload latest snapshot
          try {
            const fresh = await api.v1ClientOrderByCode(order.orderCode);
            setOrder(fresh?.data || null);
          } catch (err) {
            // ignore
          }
          toast.error("Đơn hàng đã thay đổi trạng thái, vui lòng kiểm tra lại.");
        } else {
          toast.error(e?.message || "Huỷ đơn hàng thất bại!");
        }
      }
    });
  };

  useEffect(() => {
    let cancelled = false;
    if (!orderCode) return;
    setLoading(true);
    api
      .v1ClientOrderByCode(orderCode)
      .then((res) => {
        if (cancelled) return;
        setGuestView(false);
        setOrder(res?.data || null);
      })
      .catch(async (e) => {
        if (cancelled) return;
        // If not logged in, fall back to public order detail.
        if (e?.status === 401 || e?.status === 403) {
          try {
            const pub = await api.getOrderByCode(orderCode);
            if (cancelled) return;
            setGuestView(true);
            setOrder(pub?.data || null);
            return;
          } catch (err) {
            if (cancelled) return;
            toast.error(err?.message || "Tải chi tiết thất bại");
            setOrder(null);
            return;
          }
        }
        toast.error(e?.message || "Tải chi tiết thất bại");
        setOrder(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  const lines = useMemo(() => {
    const cart = Array.isArray(order?.cart) ? order.cart : [];
    // Group identical lines so repeated charms don't render as repetitive rows.
    // Include engraving in the grouping key so customized lines never merge incorrectly.
    const engravingKey = (line) => {
      const e = line?.engraving;
      if (!e || typeof e !== "object") return "";
      const t = String(e.text || "").trim();
      const f = String(e.fontId || "").trim();
      return t ? `${t}|${f}` : "";
    };

    const map = new Map();
    for (const it of cart) {
      if (!it) continue;
      const qty = Math.max(1, Math.floor(Number(it?.quantity) || 1));
      const key = [
        it?.productId || "",
        it?.variantId || it?.variantCode || "",
        it?.name || "",
        classifyLine(it),
        String(Number(it?.price) || 0),
        engravingKey(it),
      ]
        .map((x) => String(x))
        .join("|");

      const prev = map.get(key);
      if (prev) {
        prev.quantity = (Number(prev.quantity) || 1) + qty;
      } else {
        map.set(key, { ...it, quantity: qty, __groupKey: key });
      }
    }
    return Array.from(map.values());
  }, [order]);

  const steps = useMemo(() => {
    const k = statusKey(getOrderDisplayStatus(order));
    return {
      pending:
        k === "pending" ||
        k === "confirmed" ||
        k === "shipping" ||
        k === "delivered",
      confirmed: k === "confirmed" || k === "shipping" || k === "delivered",
      shipping: k === "shipping" || k === "delivered",
      delivered: k === "delivered",
    };
  }, [order]);

  return (
    <div className="orders-page">
      <div className="container orders-mobileContainer">
        <div className="orders-mobileTop">
          <Link
            className="orders-back"
            to={
              guestEmail && String(guestEmail).trim()
                ? `/orders?email=${encodeURIComponent(String(guestEmail).trim())}`
                : "/orders"
            }
          >
            ←
          </Link>
          <div className="orders-mobileTitle">Chi tiết đơn</div>
          <div className="orders-mobileActions" />
        </div>

        {loading ? (
          <div className="orders-empty">Đang tải...</div>
        ) : order ? (
          <div className="orders-detailCard">
            <div className="orders-detailHead">
              <div>
                <div className="orders-detailCode">{order.orderCode}</div>
                <div className="orders-detailMeta">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="orders-orderStatus">
                {statusLabel(getOrderDisplayStatus(order))}
              </div>
            </div>

            <div className="orders-progress" aria-label="Tiến trình đơn hàng">
              <div
                className={"orders-step " + (steps.pending ? "is-done" : "")}
              >
                Chờ xác nhận
              </div>
              <div
                className={"orders-step " + (steps.confirmed ? "is-done" : "")}
              >
                Chờ lấy hàng
              </div>
              <div
                className={"orders-step " + (steps.shipping ? "is-done" : "")}
              >
                Đang giao
              </div>
              <div
                className={"orders-step " + (steps.delivered ? "is-done" : "")}
              >
                Đã giao
              </div>
            </div>

            <div className="orders-divider" />

            <div className="orders-lines">
              {lines.map((it, idx) => (
                <div
                  key={String(it?.__groupKey || it?.variantId || idx)}
                  className="orders-orderItem"
                >
                    <div className="orders-itemThumb">
                      {(() => {
                        const img = (it?.images && it.images[0]) || it?.image || null;
                        return img ? (
                          <img src={img} alt={it?.name || "product"} />
                        ) : (
                          <div className="orders-thumbFallback" />
                        );
                      })()}
                    </div>
                  <div className="orders-itemInfo">
                    <div className="orders-itemName">
                      {it?.name || "Sản phẩm"}
                    </div>
                    <div className="orders-itemMeta">
                      Phân loại: {classifyLine(it)}
                    </div>
                    {(function(){
                      const engraving = it?.engraving || null;
                      let preview = engraving && (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) ? (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) : null;
                      if (!preview) {
                        try {
                          const key = 'engraving_preview_map';
                          const raw = localStorage.getItem(key);
                          const map = raw ? JSON.parse(raw) : {};
                          preview = map && map[String(it._id)];
                        } catch (e) { preview = null; }
                      }
                      if (engraving || preview) {
                        return (
                          <div className="orders-itemMeta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontWeight: 700 }}>Khắc:</div>
                            <div>{String(engraving?.text || '')}</div>
                            {preview ? (
                              <img src={preview} alt={`Preview khắc`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} />
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="orders-itemRight">
                    <div className="orders-itemQty">x{it?.quantity || 1}</div>
                    <div className="orders-itemPrice">
                      {formatPrice(it?.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

              <div className="orders-orderTotal">
                Tổng số tiền: <strong>{formatPrice(order.totalPrice)}</strong>
              </div>
              <div className="mt-3">
                {canCancel(order) && !guestView ? (
                  <button
                    type="button"
                    className="orders-btn orders-btnPrimary"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    {isPending ? "Đang huỷ..." : "Huỷ đơn"}
                  </button>
                ) : null}
              </div>
          </div>
        ) : (
          <div className="orders-empty">Không tìm thấy đơn</div>
        )}

      </div>
    </div>
  );
}
