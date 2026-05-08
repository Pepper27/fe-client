import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";
import { formatPrice } from "../../utils/format";

const statusLabel = (s) => {
  const v = String(s || "");
  if (v === "pending") return "Chờ xác nhận";
  if (v === "confirmed") return "Chờ lấy hàng";
  if (v === "shipping") return "Đang giao";
  if (v === "delivered") return "Đã giao";
  if (v === "cancelled") return "Đã huỷ";
  return v || "-";
};

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [guestEmail, setGuestEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const initialTabFromQuery = useMemo(() => {
    const qs = new URLSearchParams(location.search || "");
    const t = String(qs.get("tab") || "").trim();
    if (
      t === "pending" ||
      t === "confirmed" ||
      t === "shipping" ||
      t === "delivered" ||
      t === "cancelled"
    ) {
      return t;
    }
    return "pending";
  }, [location.search]);

  // Load profile via v1 bearer; if not logged in, show guest email flow.
  useEffect(() => {
    let cancelled = false;
    api
      .v1AuthMe()
      .then((res) => {
        if (cancelled) return;
        const me = res?.data;
        if (!me) return;
        setMe(me);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    setTab(initialTabFromQuery);
  }, [initialTabFromQuery]);

  const fetchCounts = async () => {
    try {
      const res = await api.v1ClientOrdersStats();
      setCounts((p) => ({ ...p, ...(res?.data || {}) }));
    } catch {
      // ignore
    }
  };

  const fetchOrders = async (nextTab) => {
    const s = String(nextTab || tab);
    setLoading(true);
    try {
      const res = await api.v1ClientOrdersList({
        status: s,
        page: 1,
        limit: 50,
      });
      setOrders(res?.data || []);
    } catch (e) {
      setOrders([]);
      setToast({ type: "error", message: e?.message || "Tải đơn thất bại" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!me) return;
    fetchCounts();
    fetchOrders(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, tab]);

  const sendGuestEmail = async () => {
    const email = String(guestEmail || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      setToast({ type: "error", message: "Nhập email hợp lệ" });
      return;
    }
    setSendingEmail(true);
    try {
      const res = await api.emailOrders({ email });
      setToast({ type: "success", message: res?.message || "Đã gửi email" });
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Gửi email thất bại" });
    } finally {
      setSendingEmail(false);
    }
  };

  const setActiveTab = (t) => {
    const next = String(t || "pending");
    setTab(next);
    const qs = new URLSearchParams(location.search || "");
    qs.set("tab", next);
    navigate(
      { pathname: "/orders", search: `?${qs.toString()}` },
      { replace: true },
    );
  };

  const orderLinesSummary = (order) => {
    const cart = Array.isArray(order?.cart) ? order.cart : [];
    const totalQty = cart.reduce(
      (sum, it) => sum + (Number(it?.quantity) || 0),
      0,
    );
    const label = totalQty === 1 ? "1 sản phẩm" : `${totalQty} sản phẩm`;
    return { totalQty, label };
  };

  const firstLine = (order) => {
    const cart = Array.isArray(order?.cart) ? order.cart : [];
    return cart[0] || null;
  };

  return (
    <div className="orders-page">
      <div className="container orders-mobileContainer">
        <div className="orders-mobileTop">
          <div className="orders-mobileTitle">Trạng thái đơn hàng</div>
          <div className="orders-mobileActions" />
        </div>

        {me ? (
          <>
            <div
              className="orders-mobileTabs"
              role="tablist"
              aria-label="Trạng thái"
            >
              <button
                type="button"
                className={
                  "orders-mobileTab " + (tab === "pending" ? "is-active" : "")
                }
                onClick={() => setActiveTab("pending")}
              >
                Chờ xác nhận
                {counts.pending ? (
                  <span className="orders-badge">
                    {counts.pending > 99 ? "99+" : counts.pending}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={
                  "orders-mobileTab " + (tab === "confirmed" ? "is-active" : "")
                }
                onClick={() => setActiveTab("confirmed")}
              >
                Chờ lấy hàng
                {counts.confirmed ? (
                  <span className="orders-badge">
                    {counts.confirmed > 99 ? "99+" : counts.confirmed}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={
                  "orders-mobileTab " + (tab === "shipping" ? "is-active" : "")
                }
                onClick={() => setActiveTab("shipping")}
              >
                Đang giao
                {counts.shipping ? (
                  <span className="orders-badge">
                    {counts.shipping > 99 ? "99+" : counts.shipping}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className={
                  "orders-mobileTab " + (tab === "delivered" ? "is-active" : "")
                }
                onClick={() => setActiveTab("delivered")}
              >
                Đã giao
              </button>
              <button
                type="button"
                className={
                  "orders-mobileTab " + (tab === "cancelled" ? "is-active" : "")
                }
                onClick={() => setActiveTab("cancelled")}
              >
                Đã huỷ
              </button>
            </div>

            <div
              className="orders-mobileList"
              aria-busy={loading ? "true" : "false"}
            >
              {orders?.length ? (
                orders.map((o) => {
                  const line = firstLine(o);
                  const summary = orderLinesSummary(o);
                  return (
                    <div key={o.orderCode} className="orders-orderCard">
                      <div className="orders-orderCardHead">
                        <div className="orders-shopName">Mix Charm</div>
                        <div className="orders-orderStatus">
                          {statusLabel(o.status)}
                        </div>
                      </div>

                      <div className="orders-orderItem">
                        <div className="orders-itemThumb">
                          {line?.image ? (
                            <img
                              src={line.image}
                              alt={line?.name || "product"}
                            />
                          ) : (
                            <div className="orders-thumbFallback" />
                          )}
                        </div>
                        <div className="orders-itemInfo">
                          <div className="orders-itemName">
                            {line?.name || "Sản phẩm"}
                          </div>
                          <div className="orders-itemMeta">
                            {(() => {
                              const size = line?.size || line?.sizeText || line?.sizeCm || null;
                              const material = line?.material || null;
                              const color = line?.color || null;
                              const parts = [size, material, color].filter(Boolean);
                              return parts.length ? parts.join(' · ') : (line?.variantId ? `SKU ${String(line.variantId).slice(-6)}` : "");
                            })()}
                          </div>
                        </div>
                        <div className="orders-itemRight">
                          <div className="orders-itemQty">
                            x{line?.quantity || 1}
                          </div>
                          <div className="orders-itemPrice">
                            {formatPrice(line?.price)}
                          </div>
                        </div>
                      </div>

                      <div className="orders-orderTotal">
                        Tổng số tiền ({summary.label}):{" "}
                        <strong>{formatPrice(o.totalPrice)}</strong>
                      </div>

                      <div className="orders-orderActions">
                          <button
                            type="button"
                            className="orders-btn"
                            onClick={() =>
                              navigate(
                                `/orders/detail/${encodeURIComponent(o.orderCode)}`,
                              )
                            }
                          >
                            Xem chi tiết
                          </button>
                          {(["pending", "confirmed"].includes(o.status)) ? (
                            <button
                              type="button"
                              className="orders-btn orders-btnSecondary"
                              onClick={async () => {
                                if (!window.confirm("Sau khi huỷ bạn không thể khôi phục đơn hàng. Bạn có chắc muốn huỷ?")) return;
                                try {
                                  const res = await api.v1ClientCancelOrder(o.orderCode, { reason: "Khách huỷ (list)" });
                                  // Update list snapshot
                                  setOrders((prev) => prev.map((p) => (p._id === res?.data?._id ? res.data : p)));
                                  setToast({ type: "success", message: "Huỷ đơn thành công" });
                                } catch (e) {
                                  if (e?.status === 409) {
                                    setToast({ type: "error", message: "Đơn hàng đã thay đổi trạng thái, vui lòng kiểm tra chi tiết." });
                                  } else {
                                    setToast({ type: "error", message: e?.message || "Huỷ đơn thất bại" });
                                  }
                                }
                              }}
                            >
                              Huỷ
                            </button>
                          ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="orders-empty">
                  {loading ? "Đang tải..." : "Chưa có đơn ở trạng thái này"}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="orders-guestCard">
            <div className="orders-guestTitle">Tra cứu đơn hàng</div>
            <div className="orders-guestSub">
              Nhập email để hệ thống gửi danh sách đơn hàng và trạng thái về cho
              bạn.
            </div>
            <div className="orders-guestForm">
              <input
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="email@example.com"
                inputMode="email"
              />
              <button
                type="button"
                className="orders-btn orders-btnPrimary"
                onClick={sendGuestEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Đang gửi..." : "Gửi email"}
              </button>
            </div>
          </div>
        )}

        {toast ? (
          <div
            className={
              "orders-toast " +
              (toast.type === "error"
                ? "orders-toastError"
                : "orders-toastSuccess")
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
