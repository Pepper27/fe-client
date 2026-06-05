import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ZaloPayReturn() {
  const navigate = useNavigate();

  React.useEffect(() => {
    try {
      const key = 'zalopay-return:reloaded';
      const current = `${window.location.pathname}${window.location.search}`;
      const last = sessionStorage.getItem(key);
      if (last === current) {
        sessionStorage.removeItem(key);
        return;
      }
      sessionStorage.setItem(key, current);
      window.location.reload();
    } catch {}
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const syncCartBadge = async () => {
      try {
        const key = 'zalopay-return:reloaded';
        const current = `${window.location.pathname}${window.location.search}`;
        if (sessionStorage.getItem(key) === current) return;

        const res = await api.getCart();
        if (cancelled) return;
        const cart = res?.data || null;
        const count =
          (Array.isArray(cart?.products) ? cart.products.length : 0) +
          (Array.isArray(cart?.bundles) ? cart.bundles.length : 0);
        try {
          sessionStorage.setItem('cart:cachedCount', String(count));
        } catch {}
        try {
          window.dispatchEvent(
            new CustomEvent('cart:changed', { detail: { count } }),
          );
        } catch {
          try {
            window.dispatchEvent(new Event('cart:changed'));
          } catch {}
        }
      } catch {}
    };

    syncCartBadge();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div>Thanh toán ZaloPay đã hoàn tất.</div>
      <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/orders')}>Xem đơn hàng</button>
        <button onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
      </div>
    </div>
  );
}
