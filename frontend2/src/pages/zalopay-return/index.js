import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { syncCartBadge as syncCartBadgeCount } from '../../utils/cart-count';

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

    const syncBadge = async () => {
      try {
        const key = 'zalopay-return:reloaded';
        const current = `${window.location.pathname}${window.location.search}`;
        if (sessionStorage.getItem(key) === current) return;

        const res = await api.getCart();
        if (cancelled) return;
        syncCartBadgeCount(res?.data || null);
      } catch {}
    };

    syncBadge();
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
