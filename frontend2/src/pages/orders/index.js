import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";
import { formatPrice } from "../../utils/format";
import {
  getOrderDisplayStatus,
  isOrderPaid,
} from "../../utils/order-status";
import { isAuthBlockedInTab } from "../../utils/auth-tab";
import toast from "react-hot-toast";

const statusLabel = (s) => {
  const v = String(s || "");
  if (v === "pending") return "Chờ xác nhận";
  if (v === "confirmed") return "Chờ lấy hàng";
  if (v === "shipping") return "Đang giao";
  if (v === "delivered") return "Đã giao";
  if (v === "cancelled") return "Đã huỷ";
  return v || "-";
};

const sortOrders = (list, status) => {
  if (status !== "cancelled") return list;
  return [...list].sort((a, b) => {
    const ta =
      (a?.cancelledAt && Date.parse(a.cancelledAt)) ||
      (a?.updatedAt && Date.parse(a.updatedAt)) ||
      (a?.createdAt && Date.parse(a.createdAt)) ||
      0;
    const tb =
      (b?.cancelledAt && Date.parse(b.cancelledAt)) ||
      (b?.updatedAt && Date.parse(b.updatedAt)) ||
      (b?.createdAt && Date.parse(b.createdAt)) ||
      0;
    return tb - ta;
  });
};

export default function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("pending");
  const [guestEmail, setGuestEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Restore guest lookup session so back-navigation doesn't wipe results.
  useEffect(() => {
    if (me) return;
    try {
      const qs = new URLSearchParams(location.search || "");
      const emailFromQuery = String(qs.get("email") || "").trim();
      const savedEmail = String(sessionStorage.getItem("orders:guestEmail") || "").trim();
      const nextEmail = emailFromQuery || savedEmail;
      if (nextEmail && !guestEmail) setGuestEmail(nextEmail);

      const raw = sessionStorage.getItem("orders:guestOrders");
      if (raw && (!orders || !orders.length)) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setOrders(parsed);
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // If guest has email in URL but only stale orders cached, refresh from API.
  useEffect(() => {
    if (me) return;
    const qs = new URLSearchParams(location.search || "");
    const email = String(qs.get("email") || "").trim().toLowerCase();
    if (!email) return;
    const first = orders?.[0]?.cart?.[0];
    const hasMeta =
      (first?.material && String(first.material).trim()) ||
      (first?.color && String(first.color).trim()) ||
      (first?.size && String(first.size).trim());
    if (orders?.length && hasMeta) return;

    let cancelled = false;
    api
      .emailOrders({ email })
      .then((res) => {
        if (cancelled) return;
        if (Array.isArray(res?.data)) {
          setOrders(res.data);
          try {
            sessionStorage.setItem("orders:guestOrders", JSON.stringify(res.data));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, location.search]);
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

    const refreshMe = () => {
      if (isAuthBlockedInTab()) {
        setMe(null);
        return;
      }
      api
        .v1AuthMe()
        .then((res) => {
          if (cancelled) return;
          setMe(res?.data || null);
        })
        .catch(() => {
          if (cancelled) return;
          // If token missing/expired after logout, switch to guest mode.
          setMe(null);
        });
    };

    refreshMe();
    const onAuthChanged = () => refreshMe();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuthChanged);
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
      const nextCounts = { ...(res?.data || {}) };

      try {
        const pendingRes = await api.v1ClientOrdersList({
          status: "pending",
          page: 1,
          limit: 200,
        });
        const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];
        const paidPendingCount = pendingList.filter(
          (order) => getOrderDisplayStatus(order) === "confirmed",
        ).length;

        if (paidPendingCount > 0) {
          nextCounts.pending = Math.max(0, Number(nextCounts.pending) - paidPendingCount);
          nextCounts.confirmed = Math.max(0, Number(nextCounts.confirmed) + paidPendingCount);
        }
      } catch {
        // keep server counts when pending list cannot be adjusted
      }

      setCounts((p) => ({ ...p, ...nextCounts }));
    } catch {
      // ignore
    }
  };

  const fetchOrders = async (nextTab) => {
    const s = String(nextTab || tab);
    setLoading(true);
    try {
      if (me && (s === "pending" || s === "confirmed")) {
        const [primaryRes, pendingRes] = await Promise.all([
          api.v1ClientOrdersList({
            status: s,
            page: 1,
            limit: 50,
          }),
          api.v1ClientOrdersList({
            status: "pending",
            page: 1,
            limit: 200,
          }),
        ]);

        const primaryList = Array.isArray(primaryRes?.data) ? primaryRes.data : [];
        const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];

        if (s === "pending") {
          setOrders(
            sortOrders(
              primaryList.filter(
                (order) => getOrderDisplayStatus(order) === "pending",
              ),
              s,
            ),
          );
          return;
        }

        const merged = [...primaryList];
        const seen = new Set(
          merged.map((order) => String(order?.orderCode || "")).filter(Boolean),
        );

        for (const order of pendingList) {
          const orderCode = String(order?.orderCode || "");
          if (!orderCode || seen.has(orderCode)) continue;
          if (getOrderDisplayStatus(order) !== "confirmed") continue;
          merged.push(order);
          seen.add(orderCode);
        }

        setOrders(sortOrders(merged, s));
        return;
      }

      const res = await api.v1ClientOrdersList({
        status: s,
        page: 1,
        limit: 50,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(sortOrders(list, s));
    } catch (e) {
      setOrders([]);
      toast.error(e?.message || "Tải đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!me) return;
    
    const qs = new URLSearchParams(location.search || "");
    const code = String(qs.get("code") || "").trim();
    
    const loadOrdersWithConfirmedOrder = async () => {
      let confirmedOrder = null;
      
      // If coming from zalopay payment with code param, fetch that specific order first
      if (code) {
        try {
          const orderRes = await api.v1ClientOrderByCode(code);
          confirmedOrder = orderRes?.data || null;
        } catch (e) {
          console.error('Error fetching confirmed order by code:', e);
        }
      }
      
      // Now fetch the standard list
      setLoading(true);
      try {
        const s = String(tab);
        if (me && (s === "pending" || s === "confirmed")) {
          const [primaryRes, pendingRes] = await Promise.all([
            api.v1ClientOrdersList({
              status: s,
              page: 1,
              limit: 50,
            }),
            api.v1ClientOrdersList({
              status: "pending",
              page: 1,
              limit: 200,
            }),
          ]);

          const primaryList = Array.isArray(primaryRes?.data) ? primaryRes.data : [];
          const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];

          if (s === "pending") {
            const filtered = primaryList.filter(
              (order) => getOrderDisplayStatus(order) === "pending",
            );
            setOrders(sortOrders(filtered, s));
            return;
          }

          const merged = [...primaryList];
          const seen = new Set(
            merged.map((order) => String(order?.orderCode || "")).filter(Boolean),
          );

          // Add confirmed order at the top if we have one
          if (confirmedOrder && String(confirmedOrder?.orderCode || "")) {
            const confCode = String(confirmedOrder.orderCode);
            if (!seen.has(confCode)) {
              merged.unshift(confirmedOrder);
              seen.add(confCode);
            }
          }

          for (const order of pendingList) {
            const orderCode = String(order?.orderCode || "");
            if (!orderCode || seen.has(orderCode)) continue;
            if (getOrderDisplayStatus(order) !== "confirmed") continue;
            merged.push(order);
            seen.add(orderCode);
          }

          setOrders(sortOrders(merged, s));
          return;
        }

        const res = await api.v1ClientOrdersList({
          status: s,
          page: 1,
          limit: 50,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setOrders(sortOrders(list, s));
      } catch (e) {
        setOrders([]);
        toast.error(e?.message || "Tải đơn thất bại");
      } finally {
        setLoading(false);
      }
    };
    
    loadOrdersWithConfirmedOrder();
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, tab]);

  // Watch pending Zalopay orders in the current list and poll their status
  useEffect(() => {
    if (!orders || !orders.length) return undefined;
    const watchList = orders
      .filter((o) => String(o.method || "").toLowerCase() === "zalopay")
      .filter((o) => !isOrderPaid(o))
      .map((o) => String(o.orderCode || ""))
      .filter(Boolean);
    if (!watchList.length) return undefined;

    const POLL_INTERVAL = 2000;
    const TIMEOUT_MS = Number(process.env.REACT_APP_POLL_TIMEOUT_MS || 2 * 60 * 1000); // 2m
    const start = Date.now();
    const id = setInterval(async () => {
      try {
        for (const code of watchList) {
          try {
            let latest = null;
            try {
              const confirmRes = await api.zalopayConfirm({ orderCode: code });
              latest = confirmRes?.data || null;
            } catch {
              const res = me
                ? await api.v1ClientOrderByCode(code)
                : await api.getOrderByCode(code);
              latest = res?.data || null;
            }
            if (latest) {
              // If updated to paid or status changed, refresh whole list to keep ordering
              if (isOrderPaid(latest) || getOrderDisplayStatus(latest) !== "pending") {
                const cartEvent = new CustomEvent("cart:forceRefresh", { detail: { count: 0 } });
                window.dispatchEvent(cartEvent);
                fetchCounts();
                fetchOrders(tab);
                clearInterval(id);
                setActiveTab("confirmed");
                return;
              }
            }
          } catch (e) {
            // ignore per-order errors
          }
        }
        if (Date.now() - start > TIMEOUT_MS) {
          clearInterval(id);
        }
      } catch (e) {
        // swallow
      }
    }, POLL_INTERVAL);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, me, tab]);


  const cancelFromList = async (orderCode) => {
    const code = String(orderCode || "").trim();
    if (!code) return;
    if (
      !window.confirm(
        "Sau khi huỷ bạn không thể khôi phục đơn hàng. Bạn có chắc muốn huỷ?",
      )
    )
      return;
    try {
      await api.v1ClientCancelOrder(code, { reason: "Khách huỷ (list)" });
      toast.success("Huỷ đơn thành công");
      // Jump to cancelled tab; effect will refresh counts + list.
      setActiveTab("cancelled");
    } catch (e) {
      if (e?.status === 409) {
        toast.error(
          "Đơn hàng đã thay đổi trạng thái, vui lòng kiểm tra chi tiết.",
        );
      } else {
        toast.error(e?.message || "Huỷ đơn thất bại");
      }
    }
  };

  const sendGuestEmail = async () => {
    const email = String(guestEmail || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Nhập email hợp lệ");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await api.emailOrders({ email });
      // If backend returns an order snapshot, show it immediately.
      if (Array.isArray(res?.data)) {
        setOrders(res.data);
        try {
          sessionStorage.setItem("orders:guestOrders", JSON.stringify(res.data));
        } catch {}
      }
      try {
        sessionStorage.setItem("orders:guestEmail", email);
      } catch {}
      // Persist email in URL so refresh/back keeps context.
      try {
        const qs = new URLSearchParams(location.search || "");
        qs.set("email", email);
        navigate({ pathname: "/orders", search: `?${qs.toString()}` }, { replace: true });
      } catch {}
      toast.success(res?.message || "Đã gửi email");
    } catch (e) {
      toast.error(e?.message || "Gửi email thất bại");
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

  const classifyLine = (line) => {
    if (!line) return "Mặc định";
    const size = line?.size || line?.sizeText || line?.sizeCm || null;
    const material = line?.material || null;
    const color = line?.color || null;
    const parts = [size, material, color].filter(Boolean);
    return parts.length ? parts.join(" · ") : "Mặc định";
  };


  const isZaloPending = (o) => {
    if (!o) return false;
    if (getOrderDisplayStatus(o) === "cancelled") return false;
    if (String(o.method || "").toLowerCase() !== "zalopay") return false;
    if (isOrderPaid(o)) return false;
    // Prefer explicit expiresAt, else fallback to createdAt + 2 hours for legacy orders
    const PAYMENT_WINDOW_MS = Number(process.env.REACT_APP_PAYMENT_WINDOW_MS || 2 * 60 * 60 * 1000);
    const expRaw = o?.payment?.expiresAt || null;
    const exp = expRaw ? new Date(expRaw) : new Date(Date.parse(o.createdAt || Date.now()) + PAYMENT_WINDOW_MS);
    // Also ensure we have an orderUrl to open
    const hasUrl = Boolean(o?.payment?.orderUrl);
    return hasUrl && exp && exp.getTime() > Date.now();
  };

  const handlePayNow = (o) => {
    try {
      const url = o?.payment?.orderUrl;
      if (!url) {
        toast.error("Đường dẫn thanh toán không khả dụng");
        return;
      }
      window.open(url, "_blank");
    } catch (e) {
      toast.error("Không thể mở trang thanh toán");
    }
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
                          {statusLabel(getOrderDisplayStatus(o))}
                        </div>
                      </div>

                      <div className="orders-orderItem">
                        <div className="orders-itemThumb">
                          {(() => {
                            // Prefer product's first image if included in order line, otherwise use line.image
                            const img = (line?.images && line.images[0]) || line?.image || null;
                            return img ? (
                              <img src={img} alt={line?.name || "product"} />
                            ) : (
                              <div className="orders-thumbFallback" />
                            );
                          })()}
                        </div>
                        <div className="orders-itemInfo">
                          <div className="orders-itemName">
                            {line?.name || "Sản phẩm"}
                          </div>
                          <div className="orders-itemMeta">
                            Phân loại: {classifyLine(line)}
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

                      {isZaloPending(o) ? (
                        <button
                          type="button"
                          className="orders-btn orders-btnPrimary"
                          onClick={() => handlePayNow(o)}
                        >
                          Thanh toán ngay
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="orders-btn"
                        onClick={() =>
                          navigate(
                            `/orders/detail/${encodeURIComponent(o.orderCode)}`,
                            { state: { guestEmail: String(guestEmail || "").trim().toLowerCase() } },
                          )
                        }
                      >
                        Xem chi tiết
                      </button>
                        {["pending", "confirmed"].includes(getOrderDisplayStatus(o)) ? (
                          <button
                            type="button"
                            className="orders-btn orders-btnSecondary"
                            onClick={() => cancelFromList(o.orderCode)}
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
          <>
            <div className="orders-guestCard">
              <div className="orders-guestTitle">Tra cứu đơn hàng</div>
              <div className="orders-guestSub">
                Nhập email để hệ thống gửi danh sách đơn hàng và trạng thái về
                cho bạn.
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

            <div className="orders-mobileList" style={{ marginTop: 12 }}>
              {orders?.length ? (
                orders.map((o) => (
                  <div key={o.orderCode} className="orders-orderCard">
                    <div className="orders-orderCardHead">

                      <div className="orders-orderStatus">{statusLabel(getOrderDisplayStatus(o))}</div>

                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div className="orders-itemThumb" style={{ flex: "0 0 auto" }}>
                        {o?.cart?.[0]?.image ? (
                          <img
                            src={o.cart[0].image}
                            alt={o?.cart?.[0]?.name || "product"}
                          />
                        ) : (
                          <div className="orders-thumbFallback" />
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={o?.cart?.[0]?.name || ""}
                        >
                          {o?.cart?.[0]?.name || "Sản phẩm"}
                        </div>
                        <div style={{ color: "#666", marginTop: 4 }}>
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleString("vi-VN")
                            : "-"}
                        </div>
                        <div style={{ color: "#666", marginTop: 4 }}>
                          Phân loại: {classifyLine(o?.cart?.[0])}
                        </div>
                        {(function(){
                          const pl = o?.cart?.[0];
                          if (!pl) return null;
                           const engraving = pl.engraving || null;
                           let preview = engraving && (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) ? (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) : null;
                          if (!preview) {
                            try {
                              const key = 'engraving_preview_map';
                              const raw = localStorage.getItem(key);
                              const map = raw ? JSON.parse(raw) : {};
                              preview = map && map[String(pl._id)];
                            } catch (e) {
                              preview = null;
                            }
                          }
                          if (engraving || preview) {
                            return (
                              <div style={{ color: "#666", marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ fontWeight: 700 }}>Khắc:</div>
                                <div>{String(engraving?.text || '')}</div>
                                {preview ? (
                                  <img src={preview} alt={`Preview khắc`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} />
                                ) : null}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                          Tổng tiền: {formatPrice(o.totalPrice)}
                        </div>

                        {isZaloPending(o) ? (
                          <button
                            type="button"
                            className="orders-btn orders-btnPrimary"
                            onClick={() => handlePayNow(o)}
                          >
                            Thanh toán ngay
                          </button>
                        ) : null}

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
                      </div>
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
