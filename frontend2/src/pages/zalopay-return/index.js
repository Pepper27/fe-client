import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

export default function ZaloPayReturn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const qs = new URLSearchParams(window.location.search || '');
        const appTransId = qs.get('app_trans_id') || qs.get('appTransId') || '';
        const orderCode = qs.get('orderCode') || '';

        const res = await api.zalopayConfirm({ appTransId, orderCode });
        if (res && res.data && res.data.payStatus === 'paid') {
          // Successful - clear session keys and notify opener (if any), then go to order detail
          try { sessionStorage.removeItem('checkout:buyNow'); sessionStorage.removeItem('checkout:productLineIds'); } catch {}
          try {
            // attempt to fetch cart and emit count for immediate header update
            const cartRes = await api.getCart();
            const cart = cartRes?.data || null;
            const qty = (cart?.products || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0) + (cart?.bundles || []).reduce((s, b) => s + (Number(b.quantity) || 0), 0);
            try { window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: qty } })); } catch (e) { try { window.dispatchEvent(new Event('cart:changed')); } catch {} }
          } catch (e) { try { window.dispatchEvent(new Event('cart:changed')); } catch {} }

          const finalOrderCode = encodeURIComponent(res.data.orderCode || orderCode);
          // Persist a storage flag so other tabs can detect payment completion.
          try {
            localStorage.setItem('ZALOPAY_PAID', String(res.data.orderCode || orderCode));
          } catch (e) {}
          // If opened from orders list (window.opener), notify it so it can refresh
          try {
            if (window.opener && typeof window.opener.postMessage === 'function') {
              // restrict origin to same origin for safety
              const origin = window.location.origin || '*';
              window.opener.postMessage({ type: 'ZALOPAY_PAID', orderCode: res.data.orderCode || orderCode }, origin);
              // close the payment tab/window — user returns to original tab
              try { window.close(); return; } catch {}
            }
          } catch (e) {
            // ignore messaging errors
          }

          // Fallback: navigate this window to order detail
          navigate(`/orders/detail/${finalOrderCode}`);
          return;
        }

        setError('Thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.');
      } catch (err) {
        setError(err?.message || 'Lỗi khi xác nhận thanh toán');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      {loading ? <div>Đang xác nhận thanh toán...</div> : null}
      {error ? (
        <div>
          <div style={{ color: 'red' }}>{error}</div>
          <div>
            <button onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
