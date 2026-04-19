import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";

const currencyVND = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("vi-VN") + "₫";
};

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

export default function OrderDetailPage() {
  const params = useParams();
  const orderCode = String(params.orderCode || "").trim();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!orderCode) return;
    setLoading(true);
    api
      .v1ClientOrderByCode(orderCode)
      .then((res) => {
        if (cancelled) return;
        setOrder(res?.data || null);
      })
      .catch((e) => {
        if (cancelled) return;
        setToast({
          type: "error",
          message: e?.message || "Tải chi tiết thất bại",
        });
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
    return cart;
  }, [order]);

  const steps = useMemo(() => {
    const k = statusKey(order?.status);
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
  }, [order?.status]);

  return (
    <div className="orders-page">
      <div className="container orders-mobileContainer">
        <div className="orders-mobileTop">
          <Link className="orders-back" to="/orders">
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
                {statusLabel(order.status)}
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
                  key={String(it?.variantId || idx)}
                  className="orders-orderItem"
                >
                  <div className="orders-itemThumb">
                    {it?.image ? (
                      <img src={it.image} alt={it?.name || "product"} />
                    ) : (
                      <div className="orders-thumbFallback" />
                    )}
                  </div>
                  <div className="orders-itemInfo">
                    <div className="orders-itemName">
                      {it?.name || "Sản phẩm"}
                    </div>
                  </div>
                  <div className="orders-itemRight">
                    <div className="orders-itemQty">x{it?.quantity || 1}</div>
                    <div className="orders-itemPrice">
                      {currencyVND(it?.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="orders-orderTotal">
              Tổng số tiền: <strong>{currencyVND(order.totalPrice)}</strong>
            </div>
          </div>
        ) : (
          <div className="orders-empty">Không tìm thấy đơn</div>
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
