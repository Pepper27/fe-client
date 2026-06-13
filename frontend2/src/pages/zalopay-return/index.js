import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [countdown, setCountdown] = useState(3);
  useEffect(() => {
    let cancelled = false;
    let countdownInterval = null;

    const confirmPayment = async () => {
   
      const statusParam = searchParams.get('status'); 
      const appTransId = searchParams.get('apptransid');
      const orderCode = searchParams.get('orderCode');

      if (statusParam === 'cancel' || statusParam === 'user_cancelled') {
        setIsCanceled(true);
        setLoading(false);
        return;
      }

      if (!appTransId && !orderCode) {
        setError('Bạn đã hủy thanh toán.');
        setLoading(false);
        return;
      }

    
      try {
        const key = 'zalopay-return:reloaded';
        const current = `${window.location.pathname}${window.location.search}`;
        const last = sessionStorage.getItem(key);
        
        if (last !== current) {
          sessionStorage.setItem(key, current);
          window.location.reload();
          return; 
        }
        
        sessionStorage.removeItem(key);
      } catch (err) {
        console.error('Reload check error:', err);
      }
      try {
        const confirmRes = await api.zalopayConfirm({
          appTransId: appTransId || '',
          orderCode: orderCode || '',
        });

        if (cancelled) return;
        if (confirmRes?.data && confirmRes?.success !== false) {
          const updatedOrder = confirmRes.data;
          setOrderData(updatedOrder);
          toast.success('Thanh toán thành công!');
          
          try {
            sessionStorage.setItem('zalopay:confirmedOrder', JSON.stringify(updatedOrder));
          } catch (e) {
            console.error('Error storing confirmed order:', e);
          }
          try {
            const cartRes = await api.getCart();
            if (!cancelled) {
              const count = syncCartBadgeCount(cartRes?.data || null);
              localStorage.setItem('cart:cachedCount', String(Math.max(0, Number(count) || 0)));
              sessionStorage.setItem('zalopay:paymentComplete', 'true');
            }
          } catch (cartErr) {
            console.error('Cart update error:', cartErr);
          }
          setLoading(false);
          setCountdown(3);
          countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                const oldWebUrl = getOldWebsiteUrl();
                window.location.href = `${oldWebUrl}/orders?code=${encodeURIComponent(updatedOrder?.orderCode || '')}&tab=confirmed`;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

        } else {
          const currentOrder = confirmRes?.data;
          if (confirmRes?.isZaloCanceled || confirmRes?.message?.includes('cancel')) {
            setIsCanceled(true); 
          } else {
            setError(confirmRes?.message || 'Giao dịch không hợp lệ hoặc đã thất bại.');
          }
          if (currentOrder?.orderCode) {
            searchParams.set('orderCode', currentOrder.orderCode);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Payment confirmation error:', err);
          if (err?.response?.data?.message?.includes('cancel') || err?.status === 'cancel') {
            setIsCanceled(true);
          } else {
            setError(err?.message || 'Lỗi hệ thống khi xác thực thanh toán.');
            toast.error(err?.message || 'Xác nhận thanh toán thất bại');
          }
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
      <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: '18px' }}>
        <div className="spinner" style={{ marginBottom: 12 }}>⏳</div>
        <div>Đang xác nhận kết quả thanh toán từ ZaloPay...</div>
      </div>
    );
  }

  const oldWebUrl = getOldWebsiteUrl();
  const currentOrderCode = orderData?.orderCode || searchParams.get('orderCode') || '';

  if (isCanceled) {
    return (
      <div style={{ padding: 24, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#ffc107', fontSize: '48px', margin: 0 }}>⚠️</h2>
          <h3 style={{ color: '#856404', marginTop: 10 }}>Bạn đã hủy thanh toán đơn hàng</h3>
          <p style={{ color: '#666' }}>Giao dịch đã được hủy theo yêu cầu. Bạn có thể thử thanh toán lại hoặc kiểm tra giỏ hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button 
            onClick={() => window.location.href = `${oldWebUrl}/orders?code=${encodeURIComponent(currentOrderCode)}&tab=pending`}
            style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Thử thanh toán lại
          </button>
          <button 
            onClick={() => window.location.href = `${oldWebUrl}/cart`}
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Quay lại Giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#dc3545', fontSize: '48px', margin: 0 }}>❌</h2>
          <h3 style={{ color: '#dc3545', marginTop: 10 }}>Thanh toán thất bại</h3>
          <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: 4, fontSize: '14px' }}>
            {error}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button 
            onClick={() => window.location.href = `${oldWebUrl}/orders?code=${encodeURIComponent(currentOrderCode)}&tab=pending`}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Kiểm tra đơn hàng
          </button>
          <button 
            onClick={() => window.location.href = oldWebUrl}
            style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Quay về Trang chủ
          </button>
        </div>
      </div>
    );
  }

  // 4. Trạng thái THANH TOÁN THÀNH CÔNG
  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#28a745', fontSize: '48px', margin: 0 }}>✓</h2>
        <h3 style={{ color: '#28a745', marginTop: 10 }}>Thanh toán ZaloPay thành công</h3>
        <p style={{ color: '#666' }}>Hệ thống sẽ tự động chuyển hướng sau <strong>{countdown}</strong> giây...</p>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.href = `${oldWebUrl}/orders?code=${encodeURIComponent(currentOrderCode)}&tab=confirmed`}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '16px' }}
        >
          Xem đơn hàng ngay
        </button>
        <button 
          onClick={() => window.location.href = oldWebUrl}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '16px' }}
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}