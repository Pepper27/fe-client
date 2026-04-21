import React, { useEffect, useMemo, useState } from "react";
// import { Swiper, SwiperSlide } from 'swiper/react';
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
// import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { api } from "../../utils/api";
// import Breadcrumb from '@/components/Breadcrumb';
import "./index.scss"; // Import file SCSS đẹp chuẩn
import { InformationDetail } from "./info";
import { formatPrice } from "../../utils/format";

// keep previous signature expecting props.params (used in original project)
export default function ProductDetailPage({ params }) {
  const slug = params?.slug || "";
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        let found = null;
        try {
          const res = await api.getProductBySlug(slug);
          found = res?.data || null;
        } catch (err) {
          // Some callers navigate by id when slug is missing.
          // If so, fall back to v1 product-by-id.
          if (err?.status === 404 || err?.status === 400) {
            found = await api.getProductByIdPublic(slug);
          } else {
            throw err;
          }
        }
        if (cancelled) return;
        setProduct(found);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // derive variants and attribute lists from product data
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const materials = useMemo(() => {
    if (Array.isArray(product?.materials) && product.materials.length) {
      return product.materials.map((m) => {
        if (typeof m === 'string') {
          const id = String(m).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const label = m;
          const color = label.toLowerCase().includes('vàng') ? '#f3d29a' : label.toLowerCase().includes('bạc') ? '#d6d6d6' : '#eee';
          return { id, label, color };
        }
        return { id: m.id || String(m.label || m.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: m.label || m.name || '', color: m.color || '#eee' };
      });
    }
    const found = [];
    for (const v of variants) {
      const mat = v?.material || v?.materialLabel || null;
      if (mat && typeof mat === 'string' && !found.includes(mat)) found.push(mat);
    }
    return found.map((label) => ({ id: String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, color: label.toLowerCase().includes('vàng') ? '#f3d29a' : label.toLowerCase().includes('bạc') ? '#d6d6d6' : '#eee' }));
  }, [product, variants]);

  const sizes = useMemo(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length) return product.sizes;
    const found = [];
    for (const v of variants) {
      const s = v?.size || v?.sizeCm || v?.sizeLabel || v?.label || null;
      if (s && !found.includes(s)) found.push(s);
    }
    return found.length ? found : ['16', '17', '18', '19'];
  }, [product, variants]);

  const disabledSizes = product?.disabledSizes || [];

  // defaults when product loads
  useEffect(() => {
    if (!product) return;
    if (!selectedMaterial && materials.length) setSelectedMaterial(materials[0].id);
    if (!selectedSize && sizes.length) setSelectedSize(String(sizes[0]));
  }, [product, materials, sizes]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    const byMatch = variants.find((v) => {
      const mat = (v?.material || v?.materialLabel || '') + '';
      const size = (v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') + '';
      const matchesMat = selectedMaterial ? mat.toLowerCase().includes(String(selectedMaterial).replace(/-/g, '')) : true;
      const matchesSize = selectedSize ? String(size) === String(selectedSize) : true;
      return matchesMat && matchesSize;
    });
    return byMatch || variants[0];
  }, [variants, selectedMaterial, selectedSize]);

  const images = useMemo(() => {
    if (Array.isArray(selectedVariant?.images) && selectedVariant.images.length) return selectedVariant.images;
    if (Array.isArray(variants[0]?.images) && variants[0].images.length) return variants[0].images;
    return [];
  }, [selectedVariant, variants]);

  const price = useMemo(() => selectedVariant?.price ?? variants[0]?.price ?? 0, [selectedVariant, variants]);

  const totalQuantity = useMemo(() => {
    if (typeof selectedVariant?.quantity === 'number') return selectedVariant.quantity;
    return variants.reduce((s, v) => s + (Number(v?.quantity) || 0), 0);
  }, [selectedVariant, variants]);

  if (loading) {
    return (
      <div className="product-page-container container">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return <div className="error-message">Sản phẩm không tồn tại</div>;
  }

  return (
    <div className="product-page-container container">
      <div className="breadcrumb-wrapper">{/* <Breadcrumb /> */}</div>

      <div className="product-layout">
        {/* BÊN TRÁI: DANH SÁCH ẢNH (Grid) */}
        <div className="product-gallery">
          {images.slice(0, 4).map((img, idx) => (
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
          <p className="product-price">{formatPrice(price)}</p>

          {/* RATING */}
          <div className="product-rating">
            <div className="stars" aria-hidden>
              {[1,2,3,4,5].map((n)=> (
                <span key={n} className="star">★</span>
              ))}
            </div>
            <div className="rating-meta">(1 ĐÁNH GIÁ)</div>
          </div>

          {/* MATERIALS */}
          <div className="option-section">
            <h3 className="option-label">Chất liệu: <span style={{fontWeight:700, marginLeft:8}}>{materials.find(m=>m.id===selectedMaterial)?.label || materials[0].label}</span></h3>
            <div className="material-list">
              {materials.map((m)=> (
                <button key={m.id} className={`material-swatch ${selectedMaterial===m.id? 'selected':''}`} onClick={()=>setSelectedMaterial(m.id)} style={{background: m.color}} aria-label={m.label}></button>
              ))}
            </div>
          </div>

          {/* CHỌN SIZE */}
          <div className="option-section">
            <h2 className="option-label">Chọn kích thước</h2>
            <div className="size-list sizes-square">
              {sizes.map((size) => {
                const disabled = disabledSizes.includes(String(size));
                return (
                  <button
                    key={size}
                    onClick={() => !disabled && setSelectedSize(size)}
                    className={`size-btn ${selectedSize === size ? "active" : ""} ${disabled? 'disabled':''}`}
                    disabled={disabled}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STOCK NOTICE (use variant / total quantity) */}
          {typeof totalQuantity === 'number' && (
            <div className="stock-note">
              {totalQuantity === 1 ? (
                <span className="stock-low">Chỉ còn 1 sản phẩm</span>
              ) : (
                <span>{totalQuantity > 0 ? `Còn ${totalQuantity} sản phẩm` : 'Hết hàng'}</span>
              )}
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
              <li>
                <span className="label">Mã sản phẩm:</span>{" "}
                {product.slug || product._id}
              </li>
              <li>
                <span className="label">Phân loại:</span>{" "}
                {typeof product?.category === "object"
                  ? product?.category?.name || product?.category?.slug || ""
                  : String(product?.category || "")}
              </li>
            </ul>
          </div>

          {/* COMPONENT THÔNG TIN THÊM (Đã tách từ trước) */}
          <InformationDetail />
        </div>
      </div>
    </div>
  );
}
