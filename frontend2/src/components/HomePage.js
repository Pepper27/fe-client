import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import './HomePage.css';

const HomePage = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${api.getApiBase ? api.getApiBase() : 'http://localhost:3866'}/api/v1/admin/account/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        setLoginError('');
        alert('Đăng nhập admin thành công!');
        // Redirect to admin dashboard or reload
        window.location.href = '/admin/tao-san-pham';
      } else {
        setLoginError(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Không thể kết nối đến server');
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Chào mừng đến với Charm Jewelry</h1>
          <p>Khám phá bộ sưu tập trang sức độc đáo của chúng tôi</p>
          <div className="button-group">
            <Link to="/san-pham" className="cta-button">
              Xem sản phẩm
            </Link>
            <button 
              onClick={() => setShowAdminLogin(!showAdminLogin)} 
              className="admin-button"
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {showAdminLogin && (
        <div className="admin-login-modal">
          <div className="admin-login-form">
            <h3>Admin Login</h3>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <div className="form-actions">
                <button type="submit">Đăng nhập</button>
                <button type="button" onClick={() => setShowAdminLogin(false)}>
                  Đóng
                </button>
              </div>
            </form>
            <div className="admin-info">
              <p><strong>Default credentials:</strong></p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>
          </div>
        </div>
      )}
      
      <section className="featured-products">
        <div className="container">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <p className="section-description">
            Logic "Xem thêm" hiện đang được implement tại file:<br />
            <strong>/Users/macbookpro/mern-jewelry/frontend2/src/pages/product-list/Products.js</strong>
          </p>
          <div className="info-box">
            <h3>Chi tiết logic "Xem thêm":</h3>
            <ul>
              <li><strong>File:</strong> Products.js</li>
              <li><strong>State quản lý:</strong> page, hasMore, loadingMore</li>
              <li><strong>Function chính:</strong> handleLoadMore()</li>
              <li><strong>API call:</strong> api.getProducts({ page, limit: 24 })</li>
              <li><strong>Reset khi filter thay đổi:</strong> useEffect reset page về 1</li>
              <li><strong>UI:</strong> Button "Xem thêm" trong products-grid</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Cách hoạt động</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Fetch 24 sản phẩm</h3>
              <p>Load trang sản phẩm lần đầu, chỉ fetch 24 sản phẩm đầu tiên</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Hiển thị button "Xem thêm"</h3>
              <p>Nếu còn sản phẩm, hiển thị button "Xem thêm" ở cuối danh sách</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Load thêm khi click</h3>
              <p>Khi user click "Xem thêm", gọi API lấy thêm 24 sản phẩm tiếp theo</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;