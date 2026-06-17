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

const canCancelOrder = (order) => {
  if (!order) return false;
   if (
    String(order?.method || "").trim().toLowerCase() === "zalopay" &&
    isOrderPaid(order)
  ) {
    return false;
  }
  // Chỉ cho hủy khi trạng thái hiển thị thực tế là pending (chưa thanh toán / chưa xác nhận)
  return getOrderDisplayStatus(order) === "pending";
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

  const [counts, setCounts] = useState({
    pending: 0,
    confirmed: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Restore guest lookup session
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
    } catch {}
  }, [me]);

  // Refresh guest orders if stale
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
      return () => {
        cancelled = true;
      };
  }, [me, location.search]);

  const initialTabFromQuery = useMemo(() => {
    const qs = new URLSearchParams(location.search || "");
    const t = String(qs.get("tab") || "").trim();
    if (["pending", "confirmed", "shipping", "delivered", "cancelled"].includes(t)) {
      return t;
    }
    return "pending";
  }, [location.search]);

  // Load profile / Auth check
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
        
        // Đếm số lượng đơn thực tế đã thanh toán thành công (confirmed) nằm trong cục pending từ server
        const paidPendingCount = pendingList.filter(
          (order) => isOrderPaid(order) || getOrderDisplayStatus(order) === "confirmed"
        ).length;

        if (paidPendingCount > 0) {
          nextCounts.pending = Math.max(0, Number(nextCounts.pending) - paidPendingCount);
          nextCounts.confirmed = Math.max(0, Number(nextCounts.confirmed) + paidPendingCount);
        }
      } catch {}

      setCounts((p) => ({ ...p, ...nextCounts }));
    } catch {}
  };

  const fetchOrders = async (nextTab) => {
    const s = String(nextTab || tab);
    setLoading(true);
    try {
      if (me && (s === "pending" || s === "confirmed")) {
        const [primaryRes, pendingRes] = await Promise.all([
          api.v1ClientOrdersList({ status: s, page: 1, limit: 50 }),
          api.v1ClientOrdersList({ status: "pending", page: 1, limit: 200 }),
        ]);

        const primaryList = Array.isArray(primaryRes?.data) ? primaryRes.data : [];
        const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];

        // Tab CHỜ XÁC NHẬN: Chỉ hiển thị các đơn CHƯA THANH TOÁN (hoặc thanh toán thất bại/hủy)
        if (s === "pending") {
          const filteredPending = primaryList.filter(
            (order) => !isOrderPaid(order) && getOrderDisplayStatus(order) === "pending"
          );
          setOrders(sortOrders(filteredPending, s));
          return;
        }

        // Tab CHỜ LẤY HÀNG: Gom các đơn đã thanh toán thành công (confirmed)
        const merged = [...primaryList];
        const seen = new Set(merged.map((order) => String(order?.orderCode || "")).filter(Boolean));

        for (const order of pendingList) {
          const orderCode = String(order?.orderCode || "");
          if (!orderCode || seen.has(orderCode)) continue;
          
          // Nếu đơn hàng từ cổng ZaloPay báo đã thanh toán thành công -> chuyển sang tab confirmed
          if (isOrderPaid(order) || getOrderDisplayStatus(order) === "confirmed") {
            merged.push(order);
            seen.add(orderCode);
          }
        }

        setOrders(sortOrders(merged, s));
        return;
      }

      const res = await api.v1ClientOrdersList({ status: s, page: 1, limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(sortOrders(list, s));
    } catch (e) {
      setOrders([]);
      toast.error(e?.message || "Tải đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Effect fetch chính theo Tab & User state
  useEffect(() => {
    if (!me) return;
    
    const qs = new URLSearchParams(location.search || "");
    const code = String(qs.get("code") || "").trim();
    
    const loadOrdersWithConfirmedOrder = async () => {
      let confirmedOrder = null;
      if (code) {
        try {
          const orderRes = await api.v1ClientOrderByCode(code);
          confirmedOrder = orderRes?.data || null;
        } catch (e) {
          console.error('Error fetching confirmed order by code:', e);
        }
      }
      
      setLoading(true);
      try {
        const s = String(tab);
        if (me && (s === "pending" || s === "confirmed")) {
          const [primaryRes, pendingRes] = await Promise.all([
            api.v1ClientOrdersList({ status: s, page: 1, limit: 50 }),
            api.v1ClientOrdersList({ status: "pending", page: 1, limit: 200 }),
          ]);

          const primaryList = Array.isArray(primaryRes?.data) ? primaryRes.data : [];
          const pendingList = Array.isArray(pendingRes?.data) ? pendingRes.data : [];

          if (s === "pending") {
            const filtered = primaryList.filter(
              (order) => !isOrderPaid(order) && getOrderDisplayStatus(order) === "pending"
            );
            setOrders(sortOrders(filtered, s));
            return;
          }

          const merged = [...primaryList];
          const seen = new Set(merged.map((order) => String(order?.orderCode || "")).filter(Boolean));

          if (confirmedOrder && String(confirmedOrder?.orderCode || "")) {
            const confCode = String(confirmedOrder.orderCode);
            // Chỉ đưa vào danh sách Confirmed nếu đơn đó thực sự đã thanh toán thành công
            if (!seen.has(confCode) && (isOrderPaid(confirmedOrder) || getOrderDisplayStatus(confirmedOrder) === "confirmed")) {
              merged.unshift(confirmedOrder);
              seen.add(confCode);
            }
          }

          for (const order of pendingList) {
            const orderCode = String(order?.orderCode || "");
            if (!orderCode || seen.has(orderCode)) continue;
            if (isOrderPaid(order) || getOrderDisplayStatus(order) === "confirmed") {
              merged.push(order);
              seen.add(orderCode);
            }
          }

          setOrders(sortOrders(merged, s));
          return;
        }

        const res = await api.v1ClientOrdersList({ status: s, page: 1, limit: 50 });
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
  }, [me, tab]);

  useEffect(() => {
    if (!orders || !orders.length) return undefined;
    if (tab !== "pending") return undefined;

    const watchList = orders
      .filter((o) => String(o.method || "").toLowerCase() === "zalopay")
      .filter((o) => !isOrderPaid(o))
      .map((o) => String(o.orderCode || ""))
      .filter(Boolean);
      
    if (!watchList.length) return undefined;

    const POLL_INTERVAL = 2000;
    const TIMEOUT_MS = Number(process.env.REACT_APP_POLL_TIMEOUT_MS || 2 * 60 * 1000); 
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
              // TRƯỜNG HỢP 1: Thanh toán thành công (isOrderPaid === true)
              if (isOrderPaid(latest) || getOrderDisplayStatus(latest) === "confirmed") {
                toast.success(`Đơn hàng #${code} đã thanh toán thành công!`);
                const cartEvent = new CustomEvent("cart:forceRefresh", { detail: { count: 0 } });
                window.dispatchEvent(cartEvent);
                fetchCounts();
                clearInterval(id);
                setActiveTab("confirmed"); 
                return;
              }
              
           if (getOrderDisplayStatus(latest) === "cancelled") {
              toast.error(`Đơn hàng #${code} đã bị huỷ hoặc thanh toán lỗi.`);
              fetchCounts();
              fetchOrders("pending"); 
              clearInterval(id);
              
              return;
            }
            }
          } catch (e) {

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
}, [orders, me, tab]);

  const cancelFromList = async (orderCode) => {
    const code = String(orderCode || "").trim();
    if (!code) return;
    const targetOrder = (orders || []).find(
      (item) => String(item?.orderCode || "").trim() === code,
    );
    if (!canCancelOrder(targetOrder)) {
      toast.error("Đơn hàng này không thể huỷ ở trạng thái hiện tại");
      return;
    }
    if (!window.confirm("Sau khi huỷ bạn không thể khôi phục đơn hàng. Bạn có chắc muốn huỷ?")) return;
    try {
      await api.v1ClientCancelOrder(code, { reason: "Khách huỷ (list)" });
      toast.success("Huỷ đơn hàng thành công!");
      setActiveTab("cancelled");
    } catch (e) {
      if (e?.status === 409) {
        toast.error("Đơn hàng đã thay đổi trạng thái, vui lòng kiểm tra chi tiết.");
      } else {
        toast.error(e?.message || "Huỷ đơn hàng thất bại");
      }
    }
  };

  const sendGuestEmail = async () => {
    const email = String(guestEmail || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Nhập email hợp lệ");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await api.emailOrders({ email });
      if (Array.isArray(res?.data)) {
        setOrders(res.data);
        try {
          sessionStorage.setItem("orders:guestOrders", JSON.stringify(res.data));
        } catch {}
      }
      try {
        sessionStorage.setItem("orders:guestEmail", email);
      } catch {}
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
    navigate({ pathname: "/orders", search: `?${qs.toString()}` }, { replace: true });
  };

  const orderLinesSummary = (order) => {
    const cart = Array.isArray(order?.cart) ? order.cart : [];
    const totalQty = cart.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0);
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
    // Đơn hàng CHƯA ĐƯỢC thanh toán thành công mới hiển thị nút bấm
    if (isOrderPaid(o)) return false;

    const PAYMENT_WINDOW_MS = Number(process.env.REACT_APP_PAYMENT_WINDOW_MS || 2 * 60 * 60 * 1000);
    const expRaw = o?.payment?.expiresAt || null;
    const exp = expRaw ? new Date(expRaw) : new Date(Date.parse(o.createdAt || Date.now()) + PAYMENT_WINDOW_MS);
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
            <div className="orders-mobileTabs" role="tablist" aria-label="Trạng thái">
              <button type="button" className={"orders-mobileTab " + (tab === "pending" ? "is-active" : "")} onClick={() => setActiveTab("pending")}>
                Chờ xác nhận
                {counts.pending ? <span className="orders-badge">{counts.pending > 99 ? "99+" : counts.pending}</span> : null}
              </button>
              <button type="button" className={"orders-mobileTab " + (tab === "confirmed" ? "is-active" : "")} onClick={() => setActiveTab("confirmed")}>
                Chờ lấy hàng
                {counts.confirmed ? <span className="orders-badge">{counts.confirmed > 99 ? "99+" : counts.confirmed}</span> : null}
              </button>
              <button type="button" className={"orders-mobileTab " + (tab === "shipping" ? "is-active" : "")} onClick={() => setActiveTab("shipping")}>
                Đang giao
                {counts.shipping ? <span className="orders-badge">{counts.shipping > 99 ? "99+" : counts.shipping}</span> : null}
              </button>
              <button type="button" className={"orders-mobileTab " + (tab === "delivered" ? "is-active" : "")} onClick={() => setActiveTab("delivered")}>
                Đã giao
              </button>
              <button type="button" className={"orders-mobileTab " + (tab === "cancelled" ? "is-active" : "")} onClick={() => setActiveTab("cancelled")}>
                Đã huỷ
              </button>
            </div>

            <div className="orders-mobileList" aria-busy={loading ? "true" : "false"}>
              {orders?.length ? (
                orders.map((o) => {
                  const line = firstLine(o);
                  const summary = orderLinesSummary(o);
                  return (
                    <div key={o.orderCode} className="orders-orderCard">
                      <div className="orders-orderCardHead">
                        {/* <div className="orders-shopName">Mix Charm</div> */}
                        <div className="orders-orderStatus">
                          {statusLabel(isOrderPaid(o) ? "confirmed" : getOrderDisplayStatus(o))}
                        </div>
                      </div>

                      <div className="orders-orderItem">
                        <div className="orders-itemThumb">
                          {(() => {
                            const img = (line?.images && line.images[0]) || line?.image || null;
                            return img ? <img src={img} alt={line?.name || "product"} /> : <div className="orders-thumbFallback" />;
                          })()}
                        </div>
                        <div className="orders-itemInfo">
                          <div className="orders-itemName">{line?.name || "Sản phẩm"}</div>
                          <div className="orders-itemMeta">Phân loại: {classifyLine(line)}</div>
                        </div>
                        <div className="orders-itemRight">
                          <div className="orders-itemQty">x{line?.quantity || 1}</div>
                          <div className="orders-itemPrice">{formatPrice(line?.price)}</div>
                        </div>
                      </div>

                      <div className="orders-orderTotal">
                        Tổng số tiền ({summary.label}): <strong>{formatPrice(o.totalPrice)}</strong>
                      </div>

                      <div className="orders-orderActions">
                        {isZaloPending(o) ? (
                          <button type="button" className="orders-btn orders-btnPrimary" onClick={() => handlePayNow(o)}>
                            Thanh toán ngay
                          </button>
                        ) : null}
                        <button type="button" className="orders-btn" onClick={() => navigate(`/orders/detail/${encodeURIComponent(o.orderCode)}`, { state: { guestEmail: String(guestEmail || "").trim().toLowerCase() } })}>
                          Xem chi tiết
                        </button>
                        {canCancelOrder(o) ? (
                          <button type="button" className="orders-btn orders-btnSecondary" onClick={() => cancelFromList(o.orderCode)}>
                            Huỷ
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="orders-empty">{loading ? "Đang tải..." : "Chưa có đơn ở trạng thái này"}</div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Khối giao diện dành cho Khách vãng lai (Guest) */}
            <div className="orders-guestCard">
              <div className="orders-guestTitle">Tra cứu đơn hàng</div>
              <div className="orders-guestSub">Nhập email để hệ thống gửi danh sách đơn hàng và trạng thái về cho bạn.</div>
              <div className="orders-guestForm">
                <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@example.com" inputMode="email" />
                <button type="button" className="orders-btn orders-btnPrimary" onClick={sendGuestEmail} disabled={sendingEmail}>
                  {sendingEmail ? "Đang gửi..." : "Gửi email"}
                </button>
              </div>
            </div>

            <div className="orders-mobileList" style={{ marginTop: 12 }}>
              {orders?.length ? (
                orders.map((o) => (
                  <div key={o.orderCode} className="orders-orderCard">
                    <div className="orders-orderCardHead">
                      <div className="orders-orderStatus">
                        {statusLabel(isOrderPaid(o) ? "confirmed" : getOrderDisplayStatus(o))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div className="orders-itemThumb" style={{ flex: "0 0 auto" }}>
                        {o?.cart?.[0]?.image ? <img src={o.cart[0].image} alt={o?.cart?.[0]?.name || "product"} /> : <div className="orders-thumbFallback" />}
                      </div>

                      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={o?.cart?.[0]?.name || ""}>
                          {o?.cart?.[0]?.name || "Sản phẩm"}
                        </div>
                        <div style={{ color: "#666", marginTop: 4 }}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleString("vi-VN") : "-"}
                        </div>
                        <div style={{ color: "#666", marginTop: 4 }}>Phân loại: {classifyLine(o?.cart?.[0])}</div>
                        
                        {(() => {
                          const pl = o?.cart?.[0];
                          if (!pl) return null;
                          const engraving = pl.engraving || null;
                          let preview = engraving && (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) ? (engraving.previewImageSmall || engraving.previewImage || engraving.previewImageLarge) : null;
                          if (!preview) {
                            try {
                              const raw = localStorage.getItem('engraving_preview_map');
                              const map = raw ? JSON.parse(raw) : {};
                              preview = map && map[String(pl._id)];
                            } catch { preview = null; }
                          }
                          if (engraving || preview) {
                            return (
                              <div style={{ color: "#666", marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ fontWeight: 700 }}>Khắc:</div>
                                <div>{String(engraving?.text || '')}</div>
                                {preview ? <img src={preview} alt={`Preview khắc`} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }} /> : null}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 10, marginTop: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Tổng tiền: {formatPrice(o.totalPrice)}</div>
                        {isZaloPending(o) ? (
                          <button type="button" className="orders-btn orders-btnPrimary" onClick={() => handlePayNow(o)}>
                            Thanh toán ngay
                          </button>
                        ) : null}
                        <button type="button" className="orders-btn" onClick={() => navigate(`/orders/detail/${encodeURIComponent(o.orderCode)}`)}>
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