import React, { useEffect, useState } from "react";
import { api } from "../utils/api";

const currencyVND = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString("vi-VN") + "₫";
};

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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
  const total = bundles.reduce((sum, b) => sum + (Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1), 0);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Giỏ hàng</h1>
        <button
          type="button"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
          onClick={refresh}
        >
          Tải lại
        </button>
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-gray-600">Đang tải...</div>
      ) : bundles.length ? (
        <div className="mt-4 grid grid-cols-1 gap-4" style={{ gridTemplateColumns: "1fr 360px" }}>
          <div className="space-y-3">
            {bundles.map((b) => (
              <div key={b.bundleId} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      Bundle: {b?.bracelet?.typeCode} size {b?.bracelet?.sizeCm}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{b.bundleId}</div>
                    <div className="mt-3 text-sm text-gray-800">
                      <div className="font-semibold">Items ({b?.items?.length || 0})</div>
                      <div className="mt-1 text-xs text-gray-600">
                        Slot count: {b?.rulesSnapshot?.slotCount ?? "-"} | Recommended: {b?.rulesSnapshot?.recommendedCharms ?? "-"}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600 hover:underline"
                    onClick={() => removeBundle(b.bundleId)}
                  >
                    Xóa
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                      onClick={() => patchQty(b.bundleId, Math.max((b.quantity || 1) - 1, 1))}
                    >
                      -
                    </button>
                    <div className="min-w-10 text-center text-sm font-semibold">{b.quantity || 1}</div>
                    <button
                      type="button"
                      className="h-9 w-9 rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                      onClick={() => patchQty(b.bundleId, (b.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-semibold">
                    {currencyVND((Number(b?.priceSnapshot?.total) || 0) * (Number(b?.quantity) || 1))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ height: "fit-content" }}>
            <div className="text-sm font-semibold">Tổng</div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="text-sm text-gray-700">Tạm tính</div>
              <div className="text-sm font-semibold">{currencyVND(total)}</div>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Checkout (coming soon)
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Giỏ hàng đang trống. Vào <a className="font-semibold underline" href="/design">Mix Charm</a> để tạo 1 thiết kế.
        </div>
      )}

      {toast ? (
        <div
          className={
            "fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg " +
            (toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white")
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
