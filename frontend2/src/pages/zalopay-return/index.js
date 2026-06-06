import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { syncCartBadge as syncCartBadgeCount } from '../../utils/cart-count';
import toast from 'react-hot-toast';

const getOldWebsiteUrl = () => {
  try {
    const stored = localStorage.getItem('OLD_WEBSITE_URL');
    if (stored) return stored;
  } catch {}
  return 'http://localhost:3000';
};

export default function ZaloPayReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let cancelled = false;
    let countdownInterval = null;

    const confirmPayment = async () => {
      try {
        const key = 'zalopay-return:reloaded';
        const current = `${window.location.pathname}${window.location.search}`;
        const last = sessionStorage.getItem(key);
        
        if (last === current) {
          sessionStorage.removeItem(key);
          setLoading(false);
          return;
        }
        
        sessionStorage.setItem(key, current);
        window.location.reload();
        return;
      } catch (err) {
        console.error('Reload check error:', err);
      }

      try {
        const appTransId = searchParams.get('app_trans_id');
        const orderCode = searchParams.get('orderCode');

        if (!appTransId && !orderCode) {
          setError('Không tìm thấy thông tin thanh toán');
          setLoading(false);
          return;
        }

        // Call backend to confirm payment with ZaloPay
        const confirmRes = await api.zalopayConfirm({
          appTransId: appTransId || '',
          orderCode: orderCode || '',
        });

        if (cancelled) return;

        if (confirmRes?.data) {
          const updatedOrder = confirmRes.data;
          setOrderData(updatedOrder);
          toast.success('Thanh toán thành công!');
          
          // Store updated order in sessionStorage for orders page to use immediately
          try {
            sessionStorage.setItem('zalopay:confirmedOrder', JSON.stringify(updatedOrder));
          } catch (e) {
            console.error('Error storing confirmed order:', e);
          }
          
          // Update cart badge and notify old website
          try {
            const cartRes = await api.getCart();
            if (!cancelled) {
              const count = syncCartBadgeCount(cartRes?.data || null);
              
              // Store updated count in localStorage for old website to pick up
              try {
                localStorage.setItem('cart:cachedCount', String(Math.max(0, Number(count) || 0)));
                sessionStorage.setItem('zalopay:paymentComplete', 'true');
              } catch (e) {
                console.error('Storage error:', e);
              }
            }
          } catch (cartErr) {
            console.error('Cart update error:', cartErr);
          }

          // Auto redirect to old website after 3 seconds
          setLoading(false);
          setCountdown(3);
          countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                const oldWebUrl = getOldWebsiteUrl();
                // Redirect to confirmed tab with order code to show the paid order
                window.location.href = `${oldWebUrl}/orders?code=${encodeURIComponent(updatedOrder?.orderCode || '')}&tab=confirmed`;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError('Không thể xác nhận thanh toán');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Payment confirmation error:', err);
          setError(err?.message || 'Lỗi khi xác nhận thanh toán');
          toast.error(err?.message || 'Xác nhận thanh toán thất bại');
          setLoading(false);
        }
      }
    };

    confirmPayment();
    return () => {
      cancelled = true;
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>Đang xác nhận thanh toán...</div>
      </div>
    );
  }


  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ color: 'green' }}>✓ Thanh toán ZaloPay đã hoàn tất</h2>
      </div>
  
      <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.href = `${getOldWebsiteUrl()}/orders?code=${encodeURIComponent(orderData?.orderCode || '')}&tab=pending`}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Xem đơn hàng 
        </button>
        <button 
          onClick={() => window.location.href = getOldWebsiteUrl()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
