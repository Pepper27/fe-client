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
  const [selectedColor, setSelectedColor] = useState(null);

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

  // Helper function to get material color
  const getMaterialColor = (label) => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('vàng hồng') || lowerLabel.includes('vang hong') || lowerLabel.includes('rose gold')) {
      return '#eec1ad';
    }

    // Gold materials
    if (lowerLabel.includes('vàng') || lowerLabel.includes('gold') || lowerLabel.includes('yellow')) {
      return '#f3d29a';
    }

    // Silver materials
    if (lowerLabel.includes('bạc') || lowerLabel.includes('silver')) {
      return '#d6d6d6';
    }
    // Default color
    return '#eee';
  };

  // unicode-safe id normalizer
  const normalizeId = (s) => String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const materials = useMemo(() => {
    if (Array.isArray(product?.materials) && product.materials.length) {
      return product.materials.map((m) => {
        if (typeof m === 'string') {
          const label = m;
          const id = String(label)
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          const color = getMaterialColor(label);
          return { id, label, color };
        }
        const label = m.label || m.name || '';
        const id = m.id || String(label)
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return { id, label, color: m.color || getMaterialColor(label) };
      });
    }
    const found = [];
    for (const v of variants) {
      const mat = v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : null) || null;
      if (mat && typeof mat === 'string' && !found.includes(mat)) found.push(mat);
    }
    return found.map((label) => {
      const id = String(label)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return { id, label, color: getMaterialColor(label) };
    });
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

  // const colors = useMemo(() => {
  //   const found = [];
  //   for (const v of variants) {
  //     const color = v?.color || null;
  //     if (color && !found.includes(color)) found.push(color);
  //   }

  //   if (found.length === 0) {
  //     const materialColors = materials.map(m => m.label);
  //     return materialColors.filter((color, index, self) => self.indexOf(color) === index);
  //   }

  //   return found.map((label) => {
  //     const id = String(label)
  //       .normalize('NFD')
  //       .replace(/\p{Diacritic}/gu, '')
  //       .toLowerCase()
  //       .replace(/[^a-z0-9]+/g, '-')
  //       .replace(/^-+|-+$/g, '');

  //     // Bảng màu mapping trực tiếp với giá trị KHÔNG DẤU từ API
  //     const colorMap = {
  //       'do': '#e74c3c',    // Màu đỏ
  //       'vang': '#f3d29a',  // Màu vàng
  //       'hong': '#ff9db5',  // Màu hồng
  //       'bac': '#d6d6d6',   // Màu bạc
  //       'trang': '#ffffff', // Màu trắng
  //       'den': '#000000',   // Màu đen
  //       'xanh': '#3498db',  // Màu xanh
  //       'tim': '#9b59b6',   // Màu tím
  //     };

  //     const lowerLabel = label.toLowerCase();
  //     let displayColor = '#eee'; // Màu mặc định nếu không khớp

  //     // Duyệt qua map để tìm màu khớp
  //     for (const [key, value] of Object.entries(colorMap)) {
  //       if (lowerLabel.includes(key)) {
  //         displayColor = value;
  //         break;
  //       }
  //     }

  //     return { id, label, color: displayColor };
  //   });
  // }, [product, variants, materials]);

  const colors = useMemo(() => {
    if (!selectedMaterial) return [];

    const found = [];
    // 1. Chỉ lọc những variant có chất liệu trùng với selectedMaterial
    const relevantVariants = variants.filter((v) => {
      const variantMat = String(v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : '') || '');
      const variantMatId = variantMat
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return variantMatId === String(selectedMaterial);
    });

    // 2. Lấy danh sách màu từ các variant đã lọc
    for (const v of relevantVariants) {
      const color = v?.color || null;
      if (color && !found.includes(color)) found.push(color);
    }

    // 3. Mapping màu sắc với bảng màu đầy đủ hơn
    return found.map((label) => {
      const id = String(label)
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const colorMap = {
        'do': '#e74c3c',        // Màu đỏ
        'vang': '#f3d29a',      // Màu vàng
        'hong': '#ff9db5',      // Màu hồng
        'bac': '#d6d6d6',       // Màu bạc
        'trang': '#ffffff',     // Màu trắng
        'den': '#000000',       // Màu đen
        'xanh': '#3498db',      // Màu xanh
        'tim': '#9b59b6',       // Màu tím
        'cam': '#f39c12',       // Màu cam
        'xanhlá': '#27ae60',    // Màu xanh lá
        'nau': '#8b4513',       // Màu nâu
        'xám': '#808080',       // Màu xám
        'vànghồng': '#eec1ad',  // Màu vàng hồng (rose gold)
        'rosegold': '#eec1ad',  // Rose gold
        'white': '#ffffff',     // White (English)
        'black': '#000000',     // Black (English)
        'red': '#e74c3c',       // Red (English)
        'blue': '#3498db',      // Blue (English)
        'green': '#27ae60',     // Green (English)
        'pink': '#ff9db5',      // Pink (English)
        'purple': '#9b59b6',    // Purple (English)
        'orange': '#f39c12',    // Orange (English)
        'yellow': '#f3d29a',    // Yellow (English)
        'silver': '#d6d6d6',    // Silver (English)
        'gold': '#f3d29a',      // Gold (English)
        'gray': '#808080',      // Gray (English)
        'brown': '#8b4513',     // Brown (English)
      };

      let displayColor = '#eee'; // Màu mặc định nếu không khớp
      const lowerLabel = label.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      
      // Duyệt qua map để tìm màu khớp
      for (const [key, value] of Object.entries(colorMap)) {
        if (lowerLabel.includes(key)) {
          displayColor = value;
          break;
        }
      }

      return { id, label, color: displayColor };
    });
  }, [product, variants, selectedMaterial]); // Thêm selectedMaterial vào dependency
  const disabledSizes = product?.disabledSizes || [];

  // defaults when product loads
  useEffect(() => {
    if (!product) return;
    if (!selectedMaterial && materials.length) setSelectedMaterial(materials[0].id);
    if (!selectedSize && sizes.length) setSelectedSize(String(sizes[0]));

    // derive default color id (slug) from variants for the selected material (or first variant)
    if (!selectedColor) {
      const relevant = variants.filter((v) => {
        if (!selectedMaterial) return true;
        const vm = String(v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : '') || '');
        return normalizeId(vm) === String(selectedMaterial);
      });
      const availableIds = relevant.map((v) => normalizeId(v?.color || v?.colorLabel || (Array.isArray(v?.colors) ? v.colors[0] : '') || '')).filter(Boolean);
      if (availableIds.length) setSelectedColor(availableIds[0]);
    }

    if (colors.length > 0) {
      const isSelectedColorValid = colors.some(c => c.id === selectedColor);
      if (!isSelectedColorValid) {
        setSelectedColor(colors[0].id); // auto-select first color of the material
      }
    }
  }, [product, materials, colors, selectedMaterial, selectedColor, sizes, variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    // try exact match on normalized material id, size, and color
    const byExact = variants.find((v) => {
      const variantMat = String(v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : '') || '');
      const variantMatId = variantMat
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const variantSize = (v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') + '';
      const variantColor = String(v?.color || '');
      const variantColorId = variantColor
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const matchesMat = selectedMaterial ? variantMatId === String(selectedMaterial) : true;
      const matchesSize = selectedSize ? String(variantSize) === String(selectedSize) : true;
      const matchesColor = selectedColor && colors.length ? variantColorId === String(selectedColor) : true;
      return matchesMat && matchesSize && matchesColor;
    });
    if (byExact) return byExact;

    // fallback: match material and color (exact id)
    if (selectedMaterial && selectedColor && colors.length) {
      const byMatColor = variants.find((v) => {
        const vm = String(v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : '') || '');
        const vid = vm
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const vc = String(v?.color || '');
        const vidColor = vc
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return vid === String(selectedMaterial) && vidColor === String(selectedColor);
      });
      if (byMatColor) return byMatColor;
    }

    // fallback: match material only (exact id)
    if (selectedMaterial) {
      const byMat = variants.find((v) => {
        const vm = String(v?.material || v?.materialLabel || (Array.isArray(v?.materials) ? v.materials[0] : '') || '');
        const vid = vm
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        return vid === String(selectedMaterial);
      });
      if (byMat) return byMat;
    }

    // fallback: match size only
    if (selectedSize) {
      const bySize = variants.find((v) => String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') === String(selectedSize));
      if (bySize) return bySize;
    }

    return variants[0];
  }, [variants, selectedMaterial, selectedSize, selectedColor, colors]);

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
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="star">★</span>
              ))}
            </div>
            <div className="rating-meta">(1 ĐÁNH GIÁ)</div>
          </div>

          {/* MATERIALS */}
          <div className="option-section">
            <h3 className="option-label">
              {colors.length > 0
                ? `Chất liệu: ${materials.find(m => m.id === selectedMaterial)?.label || (materials[0] && materials[0].label) || ''} - Màu: ${colors.find(c => c.id === selectedColor)?.label || (colors[0] && colors[0].label) || ''}`
                : `Chất liệu: ${materials.find(m => m.id === selectedMaterial)?.label || (materials[0] && materials[0].label) || ''}`
              }
            </h3>
            <div className="material-list">
              {materials.map((m) => (
                <button key={m.id} className={`material-swatch ${selectedMaterial === m.id ? 'selected' : ''}`} onClick={() => setSelectedMaterial(m.id)} style={{ background: m.color }} aria-label={m.label}></button>
              ))}
            </div>
          </div>

          {/* COLORS - Only show if colors exist */}
          {colors.length > 0 && (
            <div className="option-section">
              <h3 className="option-label">Màu sắc</h3>
              <div className="color-list">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    className={`color-swatch ${selectedColor === c.id ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(c.id)}
                    style={{ background: c.color }}
                    aria-label={c.label}
                  ></button>
                ))}
              </div>
            </div>
          )}

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
                    className={`size-btn ${selectedSize === size ? "active" : ""} ${disabled ? 'disabled' : ''}`}
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
              <p className="bold">{product.description}</p> 
            </p>
            <ul className="spec-list">
              <li>
                <span className="label">Mã sản phẩm:</span>{" "}
                {product._id}
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
