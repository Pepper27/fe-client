import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../utils/api";
import "./index.scss";
import { formatPrice } from "../../utils/format";

const readCheckoutBundleIds = () => {
  try {
    const raw = sessionStorage.getItem("checkout:bundleIds");
    if (raw === null) return null; // key not present
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.bundleIds) ? parsed.bundleIds.map(String) : [];
    return ids.filter(Boolean);
  } catch {
    return null;
  }
};

const readCheckoutProductLineIds = () => {
  try {
    const raw = sessionStorage.getItem("checkout:productLineIds");
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed?.productLineIds) ? parsed.productLineIds.map(String) : [];
    return ids.filter(Boolean);
  } catch {
    return null;
  }
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const [bundleIds, setBundleIds] = useState(() => {
    // priority: react-router location.state -> sessionStorage -> empty
    try {
      const fromNav = location && location.state && location.state.bundleIds ? location.state.bundleIds : null;
      if (fromNav && fromNav.length) return fromNav.map(String);
    } catch {}
    return readCheckoutBundleIds();
  });
  const [productLineIds, setProductLineIds] = useState(() => {
    try {
      const fromNav = location && location.state && location.state.productLineIds ? location.state.productLineIds : null;
      if (fromNav && fromNav.length) return fromNav.map(String);
    } catch {}
    return readCheckoutProductLineIds();
  });

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
    // Resolve selection priority carefully to avoid accidentally selecting all bundles
    // Priority: explicit location.state (even empty array) -> sessionStorage (if key present) -> fallback select-all only when user directly entered /checkout (no nav/state/storage)
    const navBundles = (location && location.state && Array.isArray(location.state.bundleIds)) ? location.state.bundleIds.map(String) : null;
    const navProducts = (location && location.state && Array.isArray(location.state.productLineIds)) ? location.state.productLineIds.map(String) : null;
    const storedBundles = readCheckoutBundleIds(); // returns array or null
    const storedProducts = readCheckoutProductLineIds();

    // debug
    // eslint-disable-next-line no-console
    console.debug('[checkout] navBundles=%o navProducts=%o storedBundles=%o storedProducts=%o cartBundles=%o cartProducts=%o', navBundles, navProducts, storedBundles, storedProducts, cart?.bundles || [], cart?.products || []);

    // BUNDLES
    if (Array.isArray(navBundles)) {
      // explicit navigation provided bundleIds (possibly empty) -> respect it
      setBundleIds(navBundles);
      try { sessionStorage.setItem('checkout:bundleIds', JSON.stringify({ bundleIds: navBundles, at: Date.now() })); } catch {}
    } else if (Array.isArray(storedBundles)) {
      // sessionStorage contained the key (even empty array) -> respect it
      setBundleIds(storedBundles);
    } else {
      // storedBundles === null (key absent)
      // Only fallback to select-all when user directly landed on /checkout (no nav state and no stored keys)
      const cameFromNav = Boolean(location && location.state);
      if (!cameFromNav && (cart?.bundles || []).length) {
        setBundleIds((cart.bundles || []).map((b) => String(b.bundleId)));
      } else {
        // do not auto-select bundles in mixed scenarios (e.g. productLine selected but no bundle key)
        setBundleIds([]);
      }
    }

    // PRODUCTS
    if (Array.isArray(navProducts)) {
      setProductLineIds(navProducts);
      try { sessionStorage.setItem('checkout:productLineIds', JSON.stringify({ productLineIds: navProducts, at: Date.now() })); } catch {}
    } else if (Array.isArray(storedProducts)) {
      setProductLineIds(storedProducts);
    } else {
      const cameFromNav = Boolean(location && location.state);
      if (!cameFromNav && (cart?.products || []).length) {
        setProductLineIds((cart.products || []).map((p) => String(p._id)));
      } else {
        setProductLineIds([]);
      }
    }
  // run when cart or navigation state changes
  }, [cart?.bundles, cart?.products, location && location.state]);

  const selectedBundles = useMemo(() => {
    const bundles = cart?.bundles || [];
    const set = new Set(bundleIds.map(String));
    return (bundles || []).filter((b) => set.has(String(b.bundleId)));
  }, [cart?.bundles, bundleIds]);

  const total = useMemo(() => {
    const bundlesTotal = (selectedBundles || []).reduce(
      (sum, b) =>
        sum +
        (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1),
      0,
    );

    // include product lines
    const products = cart?.products || [];
    const selectedProducts = products.filter((p) => productLineIds && productLineIds.includes(String(p._id)));
    const productsTotal = selectedProducts.reduce((s, p) => s + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);
    return bundlesTotal + productsTotal;
  }, [selectedBundles, productLineIds, cart?.products]);

  const selectedCount = selectedBundles.length + (productLineIds ? productLineIds.length : 0);

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
        productLineIds: productLineIds && productLineIds.length ? productLineIds.map(String) : [],
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        email: selectedAddress.email,
        method,
      });
      const code = res?.data?.orderCode;
      try {
        sessionStorage.removeItem("checkout:bundleIds");
        sessionStorage.removeItem("checkout:productLineIds");
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
              ) : selectedBundles.length || (productLineIds && productLineIds.length) ? (
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
                        {formatPrice(
                          (Number(b?.priceSnapshot?.total) || 0) *
                            (Number(b?.quantity) || 1),
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Render selected product lines */}
                  {(productLineIds || []).map((lineId) => {
                    const pl = (cart?.products || []).find((p) => String(p._id) === String(lineId));
                    if (!pl) return null;
                    return (
                      <div key={String(lineId)} className="checkout-line">
                        <div>
                          <div className="checkout-lineTitle">Sản phẩm</div>
                          <div className="checkout-lineMeta">{pl?.variantId || ''}</div>
                          <div className="checkout-lineQty">x{pl.quantity || 1}</div>
                        </div>
                        <div className="checkout-linePrice">{formatPrice((Number(pl.price) || 0) * (Number(pl.quantity) || 1))}</div>
                      </div>
                    );
                  })}
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
                  <strong>{formatPrice(total)}</strong>
                </div>
                <div className="checkout-row">
                  <div>Vận chuyển</div>
                  <strong>Miễn phí</strong>
                </div>
                <div className="checkout-total">
                  <div>Tổng</div>
                  <div>{formatPrice(total)}</div>
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
