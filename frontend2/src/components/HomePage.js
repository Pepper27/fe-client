import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Chào mừng đến với Charm Jewelry</h1>
          <p>Khám phá bộ sưu tập trang sức độc đáo của chúng tôi</p>
          <Link to="/san-pham" className="cta-button">
            Xem sản phẩm
          </Link>
        </div>
      </section>
      
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