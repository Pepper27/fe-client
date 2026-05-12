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
import toast from "react-hot-toast";

// keep previous signature expecting props.params (used in original project)
export default function ProductDetailPage({ params }) {
  const slug = params?.slug || "";
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingBuyNow, setAddingBuyNow] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

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
  // Memoize variants so it is stable for useMemo/useEffect dependencies
  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product?.variants]);

  // Whether any variant actually exposes a size attribute
  const hasVariantSizes = useMemo(() => {
    return variants.some((v) => Boolean(v?.size || v?.sizeCm || v?.sizeLabel || v?.label));
  }, [variants]);

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

  // compute total available quantity per size (for disabling / strike-through)
  const sizeQtyMap = useMemo(() => {
    const map = {};
    for (const v of variants) {
      const s = String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '').trim();
      if (!s) continue;
      map[s] = (map[s] || 0) + (Number(v?.quantity) || 0);
    }
    return map;
  }, [variants]);

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
    // Only default-select a size when variants actually support sizes
    if (hasVariantSizes && !selectedSize && sizes.length) setSelectedSize(String(sizes[0]));

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
  }, [product, materials, colors, selectedMaterial, selectedColor, sizes, variants, selectedSize]);

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

    // fallback: match size only (only when variants support sizes)
    if (hasVariantSizes && selectedSize) {
      const bySize = variants.find((v) => String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') === String(selectedSize));
      if (bySize) return bySize;
    }

    return variants[0];
  }, [variants, selectedMaterial, selectedSize, selectedColor, colors]);

  // remove debug logging after QA

  useEffect(() => {
    // no-op capture listener removed
    return () => {};
  }, []);

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

  // Helper: build minimal bundle and call api.addBundleToCart
  const addSingleProductToCart = async ({ buyNow = false } = {}) => {
    // selectedVariant expected to be resolved
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể sản phẩm");
      return null;
    }

    // Decide whether to send as a "bracelet" bundle or as items-only (charms)
    const slugLower = String(slug || '').toLowerCase();
    const isCharm = slugLower.includes('charm') || (product?.category?.slug && String(product.category.slug).toLowerCase().includes('charm'));

    // Recompute selected variant now to ensure we send the correct variantId for product-level adds
    const findSelectedVariantNow = () => {
      if (!variants || !variants.length) return null;
      // try exact match on material, size and color
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

      // fallback: match size only (only when variants support sizes)
      if (hasVariantSizes && selectedSize) {
        const bySize = variants.find((v) => String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') === String(selectedSize));
        if (bySize) return bySize;
      }

      return variants[0];
    };

    const selectedNow = findSelectedVariantNow();

    const payload = isCharm
      ? {
          bracelet: null,
          items: [
            {
              slotIndex: 0,
              charmProductId: product._id,
              charmVariantCode: selectedNow?.code || selectedNow?.variantCode || selectedVariant?.code || selectedVariant?.variantCode || '',
            },
          ],
        }
      : {
          bracelet: { productId: product._id, variantCode: selectedNow?.code || selectedNow?.variantCode || selectedVariant?.code || selectedVariant?.variantCode || '', sizeCm: selectedSize },
          items: [],
        };

    const notifyCartChanged = async () => {
      try {
        const cartRes = await api.getCart();
        const cart = cartRes?.data || null;
        const qty = (cart?.products || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0) + (cart?.bundles || []).reduce((s, b) => s + (Number(b.quantity) || 0), 0);
        try { window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: qty } })); } catch (e) { try { window.dispatchEvent(new Event('cart:changed')); } catch {} }
        return;
      } catch (e) {
        try { window.dispatchEvent(new Event('cart:changed')); } catch {}
      }
    };

    try {
      // Prefer adding a normal product line so Checkout can render product details.
      // Fall back to bundle flow if backend rejects product-line adds for this item.
      let res = null;
      try {
        // For product-line adds, backend expects a concrete variant id in most setups.
        // Avoid falling back to codes for buyNow because it breaks exact matching in cart.
        const variantIdentifier = selectedNow?._id || selectedVariant?._id || selectedNow?.id || selectedVariant?.id || null;
        if (!variantIdentifier) {
          toast.error("Không xác định được biến thể để mua ngay");
          return null;
        }
        const prodRes = await api.addProductToCart({ productId: product._id, variantId: variantIdentifier, quantity: 1, buyNow });
        if (!buyNow) await notifyCartChanged();

        // Try to extract returned product line id from multiple possible shapes.
        // IMPORTANT: Do NOT treat cart._id as a product line id.
        let lineId = prodRes?.data?.lineId || prodRes?.lineId || null;
        if (!lineId) {
          const cartLike =
            (prodRes && prodRes.data && Array.isArray(prodRes.data.products) ? prodRes.data : null) ||
            (prodRes && Array.isArray(prodRes.products) ? prodRes : null) ||
            (prodRes && prodRes.data && prodRes.data.cart && Array.isArray(prodRes.data.cart.products) ? prodRes.data.cart : null) ||
            (prodRes && prodRes.cart && Array.isArray(prodRes.cart.products) ? prodRes.cart : null) ||
            null;

          const lines = cartLike?.products || [];
          const wantProductId = String(product?._id || '');
          const wantVariantId = String(variantIdentifier || '');

          // Prefer exact match productId+variantId.
          // For buyNow, do NOT fall back to productId-only because it can select a different line with a different quantity.
          const exact = wantProductId && wantVariantId
            ? (lines || []).find((p) => String(p?.productId) === wantProductId && String(p?.variantId) === wantVariantId)
            : null;
          const byProduct = (!buyNow && wantProductId)
            ? (lines || []).find((p) => String(p?.productId) === wantProductId)
            : null;
          const foundLine = exact || byProduct || null;
          lineId = foundLine?._id || foundLine?.id || null;
        }

        if (buyNow && lineId) {
          try {
            sessionStorage.setItem(
              'checkout:productLineIds',
              JSON.stringify({ productLineIds: [String(lineId)], at: Date.now() }),
            );
            // Mark this as a buy-now session so Checkout can cleanup on exit.
            sessionStorage.setItem(
              'checkout:buyNow',
              JSON.stringify({ kind: 'product', lineId: String(lineId), at: Date.now() }),
            );
            // Ensure bundles are not accidentally selected.
            sessionStorage.setItem(
              'checkout:bundleIds',
              JSON.stringify({ bundleIds: [], at: Date.now() }),
            );
          } catch (e) {}
          toast.success("Đã thêm và chuyển tới thanh toán");
          return { type: 'product', id: String(lineId), productId: String(product?._id || ''), variantId: String(variantIdentifier) };
        }

        toast.success(
          buyNow
            ? "Đã thêm giỏ hàng — vui lòng hoàn tất thanh toán trên trang giỏ hàng"
            : `Đã thêm giỏ hàng thành công!`,
        );
        return { type: 'product', id: lineId, productId: String(product?._id || ''), variantId: String(variantIdentifier) };
      } catch (eProd) {
        // eslint-disable-next-line no-console
        console.warn('addProductToCart failed, falling back to addBundleToCart', eProd?.message || eProd);
      }

      // proceed to try bundle path (either because isCharm or product-level add failed)
      res = await api.addBundleToCart(payload);
      // proceed without debug logs
      if (!res || !res.valid) {
        // Prefer structured errors from backend if available
        const backendError = (res && res.errors && res.errors.length && res.errors[0] && (res.errors[0].message || res.errors[0].msg))
          || (res && res.data && res.data.message)
          || res?.message;
        // Auto-retry: if backend complains about missing bracelet.typeCode, try sending as an item (charm)
        const errMsg = String(backendError || '');
        if (errMsg.toLowerCase().includes('unable to infer bracelet typecode') || errMsg.toLowerCase().includes('infer bracelet typecode')) {
          // build charm-style payload and retry once
          const charmPayload = {
            bracelet: null,
            items: [
              {
                slotIndex: 0,
                charmProductId: product._id,
                charmVariantCode: selectedVariant.code || selectedVariant.variantCode || selectedVariant.code || '',
                offsetN: { x: 0, y: 0 },
              },
            ],
          };
          // retry charm payload (no debug log)
          const res2 = await api.addBundleToCart(charmPayload);
          // no debug log
            if (res2 && res2.valid) {
            const bundleId2 = res2?.data?.bundleId || res2?.data?._id || null;
            toast.success(buyNow ? "Đã thêm và chuyển tới thanh toán" : "Đã thêm giỏ hàng thành công!");
            // notify header and other listeners that cart changed
            if (!buyNow) await notifyCartChanged();
            return { type: 'bundle', id: bundleId2 };
          }
          // replace res with res2 for further handling
          res = res2;
        }

        // FALLBACK: try legacy product add API (adds to cart.products) so non-bundle products can be added
        try {
          // Recompute selected variant at time of add to avoid any stale/closure issues.
          const findSelectedVariantNow = () => {
            if (!variants || !variants.length) return null;
            // try exact match on material, size and color
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

            // fallback matchers (mat+color, mat, size, first)
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
            if (selectedSize) {
              const bySize = variants.find((v) => String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || '') === String(selectedSize));
              if (bySize) return bySize;
            }
            return variants[0];
          };

          const selectedNow = findSelectedVariantNow();
          const variantIdentifier = selectedNow?._id || selectedNow?.id || selectedNow?.variantCode || selectedNow?.code || selectedVariant?._id || selectedVariant?.id || selectedVariant?.variantCode || selectedVariant?.code || null;

          // fallback attempt
          // call addProductToCart; this API returns the updated cart and lineId on success
          const prodRes = await api.addProductToCart({ productId: product._id, variantId: variantIdentifier, quantity: 1 });
          if (!buyNow) await notifyCartChanged();

          // Try to extract returned line id from multiple possible shapes
          const lineId = prodRes?.data?.lineId || prodRes?.data?._id || prodRes?.lineId || null;

          // (debug logs removed)

          // If buyNow requested and we have a lineId, persist it for checkout and navigate
          if (buyNow && lineId) {
            try {
              sessionStorage.setItem(
                'checkout:productLineIds',
                JSON.stringify({ productLineIds: [String(lineId)], at: Date.now() }),
              );
            } catch (e) {
              // ignore sessionStorage errors
            }
            toast.success("Đã thêm và chuyển tới thanh toán");
            return { type: 'product', id: String(lineId) };
          }

          // Non-buyNow: show success toast and return product line info for callers if needed
          toast.success(
            buyNow
              ? "Đã thêm giỏ hàng — vui lòng hoàn tất thanh toán trên trang giỏ hàng"
              : `Đã thêm giỏ hàng (variant: ${variantIdentifier}${lineId ? `, line:${lineId}` : ""})`
          );
          return { type: 'product', id: lineId };
        } catch (eProd) {
          // If fallback failed as well, show combined error info
          // eslint-disable-next-line no-console
          console.error('Fallback addProductToCart failed', eProd);
          const msg = backendError || eProd?.message || 'Thêm vào giỏ hàng thất bại';
          try {
            // eslint-disable-next-line no-alert
            alert('Add to cart failed:\n' + JSON.stringify(res || eProd || {}, null, 2));
          } catch (e) {
            // ignore
          }
          toast.error(msg);
          return null;
        }
      }
      const bundleId = res?.data?.bundleId || res?.data?._id || null;
      toast.success(buyNow ? "Đã thêm và chuyển tới thanh toán" : "Đã thêm giỏ hàng thành công!");
      // Ensure cart UI updates immediately after adding a bundle
      if (!buyNow) await notifyCartChanged();
      return { type: 'bundle', id: bundleId };
    } catch (e) {
      // Debug: log error
      // eslint-disable-next-line no-console
      console.error('addSingleProductToCart error', e);
      toast.error(e.message || "Lỗi khi thêm giỏ hàng");
      return null;
    }
  };

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

           {/* CHỌN SIZE - only show when variants expose sizes */}
          {hasVariantSizes && (
            <div className="option-section">
              <h2 className="option-label">Chọn kích thước</h2>
              <div className="size-list sizes-square">
                {sizes.map((size) => {
                  const qty = sizeQtyMap[size] || 0;
                  const disabled = qty <= 0 || disabledSizes.includes(String(size));
                  return (
                    <button
                      key={size}
                      onClick={() => !disabled && setSelectedSize(size)}
                      className={`size-btn ${selectedSize === size ? "active" : ""} ${disabled ? 'disabled strike' : ''}`}
                      disabled={disabled}
                      title={disabled ? 'Hết hàng' : `Còn ${qty} sản phẩm`}
                    >
                      {disabled ? <span style={{ textDecoration: 'line-through' }}>{size}</span> : size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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
             <button className="btn btn-buy" aria-disabled={addingBuyNow} onClick={async () => {
               // MUA NGAY: add to cart then navigate to checkout
               try {
                 setAddingBuyNow(true);
                 const result = await addSingleProductToCart({ buyNow: true });
                 // result may be { type: 'bundle'|'product', id } or null
                 if (result && result.type === 'bundle' && result.id) {
                  try {
                    sessionStorage.setItem(
                      'checkout:bundleIds',
                      JSON.stringify({ bundleIds: [String(result.id)], at: Date.now() }),
                    );
                  } catch {}
                  window.location.href = '/checkout';
                 } else if (result && result.type === 'product') {
                   // Prefer checkout with explicit productLineIds
                   if (result.id) {
                     window.location.href = '/checkout';
                     return;
                   }

                   // Defensive: if backend didn't return lineId, fetch cart and infer the line.
                   try {
                     const cartRes = await api.getCart();
                     const lines = cartRes?.data?.products || [];
                     const wantProductId = String(result.productId || product?._id || '');
                     const wantVariantId = String(result.variantId || selectedVariant?._id || selectedVariant?.id || '');

                     // For buy now, require exact match when possible to avoid picking another line with higher quantity.
                     const exact = wantProductId && wantVariantId
                       ? (lines || []).find((p) => String(p?.productId) === wantProductId && String(p?.variantId) === wantVariantId)
                       : null;

                     const found = exact || null;
                     const lineId = found?._id || found?.id || null;
                     if (lineId) {
                       try {
                         sessionStorage.setItem(
                           'checkout:productLineIds',
                           JSON.stringify({ productLineIds: [String(lineId)], at: Date.now() }),
                         );
                       } catch {}
                       window.location.href = '/checkout';
                       return;
                     }
                   } catch (e) {
                     // ignore
                   }

                   // Fallback: navigate to cart
                   window.location.href = '/cart';
                 } else {
                   // fallback: navigate to cart
                   window.location.href = '/cart';
                 }
               } catch (e) {
                 // error handled in addSingleProductToCart
               } finally {
                 setAddingBuyNow(false);
               }
             }}>MUA NGAY</button>
            <button
              className="btn btn-cart"
              aria-disabled={addingCart}
              tabIndex={0}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              onMouseDown={() => {
               // mousedown
              }}
              onMouseUp={() => {
               // mouseup
              }}
              onClick={async (ev) => {
                // click
                // Prevent clicks from being swallowed by parent handlers
                try { ev.stopPropagation(); } catch (e) {}
                if (addingCart) return;
                try {
                  setAddingCart(true);
                  await addSingleProductToCart({ buyNow: false });
                } finally {
                  setAddingCart(false);
                }
              }}
            >THÊM GIỎ HÀNG</button>
          </div>

          {/* CHI TIẾT SẢN PHẨM */}
          <div className="product-description">
            <h2 className="description-title">Chi tiết sản phẩm</h2>
            <div className="description-text">
              <div className="bold">{product.description}</div>
            </div>
            <ul className="spec-list">
              <li>
                <span className="label">Bộ sưu tập:</span>{" "}
                {Array.isArray(product?.collections) && product.collections.length
                  ? product.collections[0].name
                  : product?.collection?.name || product?.collection || "-"}
              </li>
              <li>
                <span className="label">Mã sản phẩm:</span>{" "}
                {product?.code || product?.sku || product?._id}
              </li>
              <li>
                <span className="label">Phân loại sản phẩm:</span>{" "}
                {typeof product?.category === "object"
                  ? product?.category?.name || product?.category?.slug || ""
                  : String(product?.category || "")}
              </li>
              <li>
                <span className="label">Chất liệu:</span>{" "}
                {materials.find(m => m.id === selectedMaterial)?.label || (materials[0] && materials[0].label) || "-"}
              </li>
              <li>
                <span className="label">Màu sắc:</span>{" "}
                {colors && colors.length ? (colors.find(c => c.id === selectedColor)?.label || colors[0].label) : "Không màu"}
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
