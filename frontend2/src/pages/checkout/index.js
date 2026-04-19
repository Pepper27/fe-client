import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";

const currencyVND = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("vi-VN") + "₫";
};

const readCheckoutBundleIds = () => {
  try {
    const raw = sessionStorage.getItem("checkout:bundleIds");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.bundleIds)
      ? parsed.bundleIds.map(String)
      : [];
    return ids.filter(Boolean);
  } catch {
    return [];
  }
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const [bundleIds, setBundleIds] = useState(() => readCheckoutBundleIds());

  // Addresses are client-only for now.
  const [addresses, setAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem("checkout:addresses");
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      return localStorage.getItem("checkout:selectedAddressId") || "";
    } catch {
      return "";
    }
  });
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });
  const [method, setMethod] = useState("cash");

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCart(res?.data || null);
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Failed to load cart" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If user directly enters /checkout without bundleIds, fallback to all cart bundles.
    if (!bundleIds.length && (cart?.bundles || []).length) {
      setBundleIds((cart.bundles || []).map((b) => String(b.bundleId)));
    }
  }, [bundleIds.length, cart?.bundles]);

  const selectedBundles = useMemo(() => {
    const bundles = cart?.bundles || [];
    const set = new Set(bundleIds.map(String));
    return (bundles || []).filter((b) => set.has(String(b.bundleId)));
  }, [cart?.bundles, bundleIds]);

  const total = useMemo(() => {
    return (selectedBundles || []).reduce(
      (sum, b) =>
        sum +
        (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1),
      0,
    );
  }, [selectedBundles]);

  const selectedCount = selectedBundles.length;

  const selectedAddress = useMemo(() => {
    return (
      (addresses || []).find(
        (a) => String(a.id) === String(selectedAddressId),
      ) || null
    );
  }, [addresses, selectedAddressId]);

  const persistAddresses = (next) => {
    setAddresses(next);
    try {
      localStorage.setItem("checkout:addresses", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveSelectedAddressId = (id) => {
    setSelectedAddressId(id);
    try {
      localStorage.setItem("checkout:selectedAddressId", String(id || ""));
    } catch {
      // ignore
    }
  };

  const addNewAddress = () => {
    const fullName = String(newAddress.fullName || "").trim();
    const phone = String(newAddress.phone || "").trim();
    const address = String(newAddress.address || "").trim();
    const email = String(newAddress.email || "").trim();
    if (!fullName || !phone || !address) {
      setToast({
        type: "error",
        message: "Vui lòng nhập Họ tên, SĐT và Địa chỉ",
      });
      return;
    }
    const id = `addr_${Date.now()}`;
    const next = [
      { id, fullName, phone, address, email },
      ...(addresses || []),
    ];
    persistAddresses(next);
    saveSelectedAddressId(id);
    setNewAddress({ fullName: "", phone: "", address: "", email: "" });
  };

  const placeOrder = async () => {
    if (!selectedCount) {
      setToast({ type: "error", message: "Bạn chưa chọn design nào" });
      return;
    }
    if (!selectedAddress) {
      setToast({ type: "error", message: "Vui lòng chọn địa chỉ giao hàng" });
      return;
    }
    setPlacing(true);
    try {
      const res = await api.checkoutBundles({
        bundleIds: selectedBundles.map((b) => String(b.bundleId)),
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        email: selectedAddress.email,
        method,
      });
      const code = res?.data?.orderCode;
      try {
        sessionStorage.removeItem("checkout:bundleIds");
      } catch {
        // ignore
      }
      if (code) {
        navigate(`/orders?code=${encodeURIComponent(code)}`);
      } else {
        navigate("/orders");
      }
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Đặt hàng thất bại" });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-head">
          <button
            type="button"
            className="checkout-back"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </button>
          <h1 className="checkout-title">Đặt hàng</h1>
        </div>

        <div className="checkout-shell">
          <div className="checkout-left">
            <div className="checkout-card">
              <div className="checkout-cardTitle">Địa chỉ giao hàng</div>

              {addresses.length ? (
                <div className="checkout-addressList">
                  {addresses.map((a) => (
                    <label key={a.id} className="checkout-addressRow">
                      <input
                        type="radio"
                        checked={String(selectedAddressId) === String(a.id)}
                        onChange={() => saveSelectedAddressId(a.id)}
                      />
                      <div className="checkout-addressText">
                        <div className="checkout-addressName">
                          {a.fullName} · {a.phone}
                        </div>
                        <div className="checkout-addressAddr">{a.address}</div>
                        {a.email ? (
                          <div className="checkout-addressEmail">{a.email}</div>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="checkout-empty">
                  Chưa có địa chỉ. Tạo mới bên dưới.
                </div>
              )}

              <div className="checkout-divider" />

              <div className="checkout-subTitle">Tạo địa chỉ mới</div>
              <div className="checkout-form">
                <label>
                  <span>Họ tên *</span>
                  <input
                    value={newAddress.fullName}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, fullName: e.target.value }))
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </label>
                <label>
                  <span>Số điện thoại *</span>
                  <input
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="09xxxxxxxx"
                  />
                </label>
                <label className="checkout-formFull">
                  <span>Địa chỉ *</span>
                  <input
                    value={newAddress.address}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Số nhà, phường/xã, quận/huyện, tỉnh/thành"
                  />
                </label>
                <label className="checkout-formFull">
                  <span>Email</span>
                  <input
                    value={newAddress.email}
                    onChange={(e) =>
                      setNewAddress((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </label>
                <button
                  type="button"
                  className="checkout-addAddr"
                  onClick={addNewAddress}
                >
                  Thêm địa chỉ
                </button>
              </div>
            </div>

            <div className="checkout-card" style={{ marginTop: 14 }}>
              <div className="checkout-cardTitle">Phương thức thanh toán</div>
              <div className="checkout-payMethods">
                <label>
                  <input
                    type="radio"
                    checked={method === "cash"}
                    onChange={() => setMethod("cash")}
                  />
                  COD
                </label>
                <label>
                  <input
                    type="radio"
                    checked={method === "zalopay"}
                    onChange={() => setMethod("zalopay")}
                  />
                  ZaloPay
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="checkout-card">
              <div className="checkout-cardTitle">Đơn hàng chi tiết</div>

              {loading ? (
                <div className="checkout-empty">Đang tải...</div>
              ) : selectedBundles.length ? (
                <div className="checkout-lines">
                  {selectedBundles.map((b) => (
                    <div key={b.bundleId} className="checkout-line">
                      <div>
                        <div className="checkout-lineTitle">Design</div>
                        <div className="checkout-lineMeta">
                          {b?.bracelet?.typeCode || ""}
                          {b?.bracelet?.sizeCm
                            ? ` · ${b.bracelet.sizeCm}cm`
                            : ""}
                          {b?.items?.length
                            ? ` · ${b.items.length} charms`
                            : ""}
                        </div>
                        <div className="checkout-lineQty">
                          x{b.quantity || 1}
                        </div>
                      </div>
                      <div className="checkout-linePrice">
                        {currencyVND(
                          (Number(b?.priceSnapshot?.total) || 0) *
                            (Number(b?.quantity) || 1),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="checkout-empty">
                  Không có design nào được chọn
                </div>
              )}

              <div className="checkout-divider" />

              <div className="checkout-summary">
                <div className="checkout-row">
                  <div>Số design:</div>
                  <strong>{selectedCount}</strong>
                </div>
                <div className="checkout-row">
                  <div>Tạm tính</div>
                  <strong>{currencyVND(total)}</strong>
                </div>
                <div className="checkout-row">
                  <div>Vận chuyển</div>
                  <strong>Miễn phí</strong>
                </div>
                <div className="checkout-total">
                  <div>Tổng</div>
                  <div>{currencyVND(total)}</div>
                </div>
              </div>

              <button
                type="button"
                className="checkout-place"
                disabled={placing || !selectedCount}
                onClick={placeOrder}
              >
                {placing ? "Đang đặt hàng..." : "Đặt hàng"}
              </button>

              <a className="checkout-track" href="/orders">
                Trạng thái đơn hàng
              </a>
            </div>
          </div>
        </div>

        {toast ? (
          <div
            className={
              "checkout-toast " +
              (toast.type === "error"
                ? "checkout-toastError"
                : "checkout-toastSuccess")
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
