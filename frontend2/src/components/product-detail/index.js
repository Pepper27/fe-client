import React, { useState } from "react";
// import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
// import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { products } from "../../data/product";
// import Breadcrumb from '@/components/Breadcrumb';
import "./index.scss"; // Import file SCSS đẹp chuẩn
import { InformationDetail } from "./info";

// keep previous signature expecting props.params (used in original project)
export default function ProductDetailPage({ params }) {
  const id = params?.id || "1";
  const [selectedSize, setSelectedSize] = useState(null);
  
  const product = products.find((p) => p.id === id);

  if (!product) {
    return <div className="error-message">Sản phẩm không tồn tại</div>;
  }

  return (
    <div className="product-page-container container">
      <div className="breadcrumb-wrapper">
        {/* <Breadcrumb /> */}
      </div>

      <div className="product-layout">
        {/* BÊN TRÁI: DANH SÁCH ẢNH (Grid) */}
        <div className="product-gallery">
          {product.variants[0]?.images.slice(0, 4).map((img, idx) => (
            <div key={idx} className="gallery-item">
              <img
                src={img}
                alt={`${product.name} ${idx}`}
                className="product-img"
              />
            </div>
          ))}
        </div>

        {/* BÊN PHẢI: THÔNG TIN SẢN PHẨM */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{product.price}</p>

          {/* CHỌN SIZE */}
          {product.sizes && (
            <div className="option-section">
              <h2 className="option-label">Chọn size</h2>
              <div className="size-list">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? "active" : ""}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NHÓM NÚT MUA HÀNG */}
          <div className="action-buttons">
            <button className="btn btn-buy">MUA NGAY</button>
            <button className="btn btn-cart">THÊM GIỎ HÀNG</button>
          </div>

          {/* CHI TIẾT SẢN PHẨM */}
          <div className="product-description">
            <h2 className="description-title">Chi tiết sản phẩm</h2>
            <p className="description-text">
              <span className="bold">{product.name}</span> {product.description}
            </p>
            <ul className="spec-list">
              <li><span className="label">Bộ sưu tập:</span> {product.details.collection}</li>
              <li><span className="label">Mã sản phẩm:</span> {product.details.code}</li>
              <li><span className="label">Phân loại:</span> {product.details.category}</li>
              <li><span className="label">Chất liệu:</span> {product.details.material}</li>
              <li><span className="label">Màu sắc:</span> {product.details.color}</li>
            </ul>
          </div>

          {/* COMPONENT THÔNG TIN THÊM (Đã tách từ trước) */}
          <InformationDetail />
        </div>
      </div>
    </div>
  );
}
