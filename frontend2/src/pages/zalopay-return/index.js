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
          // Successful - clear session keys and go to order detail
          try { sessionStorage.removeItem('checkout:buyNow'); sessionStorage.removeItem('checkout:productLineIds'); } catch {}
          try { window.dispatchEvent(new Event('cart:changed')); } catch {}
          navigate(`/orders/detail/${encodeURIComponent(res.data.orderCode || orderCode)}`);
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
