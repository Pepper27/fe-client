import React, { useEffect, useMemo, useState, useRef } from "react";
// import { Swiper, SwiperSlide } from 'swiper/react';
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
// import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { api } from "../../utils/api";
import { syncCartBadge } from "../../utils/cart-count";
// import Breadcrumb from '@/components/Breadcrumb';
import "./index.scss"; // Import file SCSS đẹp chuẩn
import "./product-detail-engrave.css";
import { InformationDetail } from "./info";
import { formatPrice } from "../../utils/format";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EngravingModal from "../../components/engraving/EngravingModal";

export default function ProductDetailPage() {
  const { slug: paramSlug } = useParams();
  const slug = paramSlug || "";
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quantityText, setQuantityText] = useState("1");

  const uiQty = useMemo(() => {
    if (quantityText === "") return quantity;
    const n = Math.floor(Number(quantityText));
    return Number.isFinite(n) && n > 0 ? n : quantity;
  }, [quantityText, quantity]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingBuyNow, setAddingBuyNow] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [collectionNames, setCollectionNames] = useState([]);

  const [engraveOpen, setEngraveOpen] = useState(false);
  const [engraving, setEngraving] = useState(null);

  // Optional override preview image to show inside engraving modal when opened
  const [engravePreviewImage, setEngravePreviewImage] = useState(null);
  const resetEngravingDraft = () => {
    setEngraving(null);
    setEngravePreviewImage(null);
  };
  const normalizeEngravingText = (value) => String(value?.text || value || "").trim();
  const hasEngravingData = (value) =>
    Boolean(
      normalizeEngravingText(value) ||
        value?.previewImage ||
        value?.previewImageSmall ||
        value?.previewImageLarge,
    );
  const getCartProductLines = ({ cart, productId, variantId }) => {
    const wantProductId = String(productId || "");
    const wantVariantId = String(variantId || "");
    return (Array.isArray(cart?.products) ? cart.products : []).filter(
      (line) =>
        String(line?.productId || "") === wantProductId &&
        String(line?.variantId || "") === wantVariantId,
    );
  };
  const resolveCartProductLineId = ({
    beforeCart,
    afterCart,
    productId,
    variantId,
    addedQty,
    engraving: engravingPayload,
    fallbackLineId,
  }) => {
    const beforeLines = getCartProductLines({ cart: beforeCart, productId, variantId });
    const afterLines = getCartProductLines({ cart: afterCart, productId, variantId });
    if (!afterLines.length) return fallbackLineId || null;

    const beforeById = new Map(
      beforeLines.map((line) => [String(line?._id || line?.id || ""), line]),
    );
    const wantEngraving = hasEngravingData(engravingPayload);
    const wantText = normalizeEngravingText(engravingPayload);

    const ranked = afterLines
      .map((line) => {
        const id = String(line?._id || line?.id || "");
        const beforeLine = beforeById.get(id);
        const qtyDelta =
          (Number(line?.quantity) || 0) - (Number(beforeLine?.quantity) || 0);
        const lineHasEngraving = hasEngravingData(line?.engraving);
        const lineText = normalizeEngravingText(line?.engraving);

        let score = 0;
        if (wantEngraving) {
          if (lineHasEngraving) score += 20;
          if (wantText && lineText === wantText) score += 20;
        } else if (!lineHasEngraving) {
          score += 20;
        }
        if (id && !beforeById.has(id)) score += 10;
        if (qtyDelta >= (Number(addedQty) || 0) && qtyDelta > 0) score += 6;
        else if (qtyDelta > 0) score += 3;
        if (fallbackLineId && id === String(fallbackLineId)) score += 1;

        return { id, score };
      })
      .sort((a, b) => b.score - a.score);

    return ranked[0]?.id || fallbackLineId || null;
  };

  // product.description is stored as HTML from the admin editor
  const descriptionHtml = useMemo(() => {
    const raw = product?.description;
    return typeof raw === "string" ? raw : "";
  }, [product?.description]);

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

  // Track recently viewed (guest + logged in)
  useEffect(() => {
    const productId = product?._id;
    if (!productId) return;
    (async () => {
      try {
        await api.trackRecentlyViewed({ productId: String(productId) });
      } catch {
        // ignore tracking errors
      }
    })();
  }, [product?._id]);

  // Resolve collection names for detail/spec section.
  // Backend may return collections as populated objects OR as ids.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cols = Array.isArray(product?.collections)
        ? product.collections
        : [];

      // 1) Populated objects
      const populatedNames = cols
        .map((c) =>
          c && typeof c === "object"
            ? c.name || c.title || c.displayName || ""
            : "",
        )
        .filter(Boolean);
      if (populatedNames.length) {
        setCollectionNames(populatedNames);
        return;
      }

      // 2) ids -> lookup from collections list
      const ids = cols
        .map((c) => (c && typeof c === "object" ? c._id || c.id : c))
        .filter(Boolean)
        .map((v) => String(v));
      if (!ids.length) {
        const single = product?.collection;
        const singleName =
          (single && typeof single === "object" ? single.name : null) ||
          (typeof single === "string" ? single : null);
        setCollectionNames(singleName ? [singleName] : []);
        return;
      }

      try {
        if (
          !Array.isArray(window._allCollections) ||
          !window._allCollections.length
        ) {
          const res = await api.getCollections();
          window._allCollections = Array.isArray(res?.data) ? res.data : [];
        }
        if (cancelled) return;
        const all = Array.isArray(window._allCollections)
          ? window._allCollections
          : [];
        const names = ids
          .map((id) => all.find((c) => String(c?._id || c?.id || "") === id))
          .map((c) => c?.name)
          .filter(Boolean);
        setCollectionNames(names);
      } catch {
        if (!cancelled) setCollectionNames([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product?.collections, product?.collection]);

  // derive variants and attribute lists from product data
  // Memoize variants so it is stable for useMemo/useEffect dependencies
  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );

  // Whether product exposes sizes either via product.sizes or via variant size fields.
  // We sanitize product.sizes to ignore empty/invalid entries like "" or "0".
  const hasVariantSizes = useMemo(() => {
    // check explicit product.sizes first
    if (Array.isArray(product?.sizes) && product.sizes.length) {
      const cleaned = product.sizes
        .map((s) => String(s || "").trim())
        .filter((s) => s !== "" && s !== "0");
      if (cleaned.length) return true;
    }
    // fallback to variants
    return variants.some((v) => Boolean(v?.size || v?.sizeCm || v?.sizeLabel));
  }, [variants, product?.sizes]);

  // Whether admin explicitly configured sizes on the product (preferred source).
  const productHasExplicitSizes = useMemo(() => {
    if (!Array.isArray(product?.sizes)) return false;
    const cleaned = product.sizes
      .map((s) => String(s || "").trim())
      .filter((s) => s !== "" && s !== "0");
    return cleaned.length > 0;
  }, [product?.sizes]);

  // Only show size selector when admin explicitly provided sizes and product is not a charm.
  const showSizeSection = productHasExplicitSizes && !isCharmCategory;

  // Charms don't use size on PDP
  const isCharmCategory = useMemo(() => {
    const catSlug = String(product?.category?.slug || "").toLowerCase();
    const catName = String(product?.category?.name || "").toLowerCase();
    return catSlug.includes("charm") || catName.includes("charm");
  }, [product?.category?.slug, product?.category?.name]);

  const effectiveHasVariantSizes = hasVariantSizes && !isCharmCategory;

  // Whether this product supports engraving (available on product object)
  // Be defensive: backend/older endpoints may expose engraving in different shapes.
  const canEngrave = useMemo(() => {
    if (!product) return false;
    // common shape: product.engraving = { enabled: true }
    if (product.engraving && typeof product.engraving === "object") {
      return !!product.engraving.enabled;
    }
    // sometimes engraving may be a boolean flag directly
    if (typeof product.engraving === "boolean") return product.engraving;
    // legacy or alternative keys
    if (product.engravingEnabled !== undefined)
      return !!product.engravingEnabled;
    if (product.isEngravable !== undefined) return !!product.isEngravable;
    return false;
  }, [product]);

  // Helper function to get material color
  const getMaterialColor = (label) => {
    const lowerLabel = label.toLowerCase();

    if (
      lowerLabel.includes("vàng hồng") ||
      lowerLabel.includes("vang hong") ||
      lowerLabel.includes("rose gold")
    ) {
      return "#eec1ad";
    }

    // Gold materials
    if (
      lowerLabel.includes("vàng") ||
      lowerLabel.includes("gold") ||
      lowerLabel.includes("yellow")
    ) {
      return "#f3d29a";
    }

    // Silver materials
    if (lowerLabel.includes("bạc") || lowerLabel.includes("silver")) {
      return "#d6d6d6";
    }
    // Default color
    return "#eee";
  };

  // unicode-safe id normalizer
  const normalizeId = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      // Vietnamese special letter
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const materials = useMemo(() => {
    if (Array.isArray(product?.materials) && product.materials.length) {
      return product.materials.map((m) => {
        if (typeof m === "string") {
          const label = m;
          const id = String(label)
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const color = getMaterialColor(label);
          return { id, label, color };
        }
        const label = m.label || m.name || "";
        const id =
          m.id ||
          String(label)
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        return { id, label, color: m.color || getMaterialColor(label) };
      });
    }
    const found = [];
    for (const v of variants) {
      const mat =
        v?.material ||
        v?.materialLabel ||
        (Array.isArray(v?.materials) ? v.materials[0] : null) ||
        null;
      if (mat && typeof mat === "string" && !found.includes(mat))
        found.push(mat);
    }
    return found.map((label) => {
      const id = String(label)
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      return { id, label, color: getMaterialColor(label) };
    });
  }, [product, variants]);

  const sizes = useMemo(() => {
    if (Array.isArray(product?.sizes) && product.sizes.length)
      // filter out empty or invalid size entries (e.g. "0") to avoid showing bogus sizes
      return product.sizes.map((s) => String(s || "").trim()).filter((s) => s !== "" && s !== "0");
    const found = [];
    for (const v of variants) {
      // Only treat explicit size fields as sizes. Do NOT use v.label here —
      // variants often use label for non-size human names which creates bogus sizes like "0".
      const s = v?.size || v?.sizeCm || v?.sizeLabel || null;
      if (s && !found.includes(s)) found.push(s);
    }
    // Don't invent default sizes. If none are found, return empty so
    // the UI can hide size selector when appropriate.
    return found.length ? found : [];
  }, [product, variants]);

  // compute total available quantity per size (for disabling / strike-through)
  const sizeQtyMap = useMemo(() => {
    const map = {};
    for (const v of variants) {
      // Keep key derivation consistent with sizes: only use explicit size fields
      const s = String(
        v?.size || v?.sizeCm || v?.sizeLabel || "",
      ).trim();
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
      const variantMat = String(
        v?.material ||
          v?.materialLabel ||
          (Array.isArray(v?.materials) ? v.materials[0] : "") ||
          "",
      );
      const variantMatId = variantMat
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return variantMatId === String(selectedMaterial);
    });

    // 2. Lấy danh sách màu từ các variant đã lọc
    for (const v of relevantVariants) {
      const color = v?.color || null;
      if (color && !found.includes(color)) found.push(color);
    }

    // 3. Mapping màu sắc với bảng màu đầy đủ hơn
    return found.map((label) => {
      const id = normalizeId(label);

      const colorMap = {
        do: "#e74c3c", // Màu đỏ
        vang: "#f3d29a", // Màu vàng
        hong: "#ff9db5", // Màu hồng
        bac: "#d6d6d6", // Màu bạc
        trang: "#ffffff", // Màu trắng
        den: "#000000", // Màu đen
        xanh: "#3498db", // Màu xanh
        tim: "#9b59b6", // Màu tím
        cam: "#f39c12", // Màu cam
        xanhla: "#27ae60", // Màu xanh lá
        nau: "#8b4513", // Màu nâu
        xam: "#808080", // Màu xám
        vanghong: "#eec1ad", // Màu vàng hồng (rose gold)
        rosegold: "#eec1ad", // Rose gold
        white: "#ffffff", // White (English)
        black: "#000000", // Black (English)
        red: "#e74c3c", // Red (English)
        blue: "#3498db", // Blue (English)
        green: "#27ae60", // Green (English)
        pink: "#ff9db5", // Pink (English)
        purple: "#9b59b6", // Purple (English)
        orange: "#f39c12", // Orange (English)
        yellow: "#f3d29a", // Yellow (English)
        silver: "#d6d6d6", // Silver (English)
        gold: "#f3d29a", // Gold (English)
        gray: "#808080", // Gray (English)
        brown: "#8b4513", // Brown (English)
      };

      let displayColor = "#eee"; // Màu mặc định nếu không khớp
      const keyLabel = String(label)
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "");

      // Duyệt qua map để tìm màu khớp
      for (const [key, value] of Object.entries(colorMap)) {
        if (keyLabel.includes(String(key))) {
          displayColor = value;
          break;
        }
      }

      return { id, label, color: displayColor };
    });
  }, [product, variants, selectedMaterial]); // Thêm selectedMaterial vào dependency
  const disabledSizes = product?.disabledSizes || [];
  // Track whether we've applied initial defaults for the currently loaded product.
  const defaultsAppliedRef = useRef(false);

  // Apply initial defaults once when a product loads (or product._id changes).
  // Avoid depending on selectedSize/selectedColor so we don't create update loops.
  useEffect(() => {
    if (!product) {
      defaultsAppliedRef.current = false;
      return;
    }

    // Only apply once per product load
    if (defaultsAppliedRef.current) return;

    // default material
    if (!selectedMaterial && materials.length) setSelectedMaterial(materials[0].id);

    // Auto-select a size only when admin explicitly configured sizes for this product.
    if (productHasExplicitSizes && sizes.length) setSelectedSize(String(sizes[0]));

    // If the product is a charm category, ensure no size is selected
    if (isCharmCategory) setSelectedSize(null);

    // derive default color id from variants for the selected material (or first variant)
    if (!selectedColor) {
      const relevant = variants.filter((v) => {
        if (!selectedMaterial) return true;
        const vm = String(
          v?.material ||
            v?.materialLabel ||
            (Array.isArray(v?.materials) ? v.materials[0] : "") ||
            "",
        );
        return normalizeId(vm) === String(selectedMaterial);
      });
      const availableIds = relevant
        .map((v) =>
          normalizeId(
            v?.color ||
              v?.colorLabel ||
              (Array.isArray(v?.colors) ? v.colors[0] : "") ||
              "",
          ),
        )
        .filter(Boolean);
      if (availableIds.length) setSelectedColor(availableIds[0]);
    }

    // Mark defaults applied so we don't re-run this for the same product.
    defaultsAppliedRef.current = true;
  }, [product?._id, materials.length, variants.length, sizes.length, effectiveHasVariantSizes, isCharmCategory, canEngrave, selectedMaterial, selectedColor]);

  // NOTE: Do not clear selectedSize when canEngrave changes — keep default selection
  // consistent across products so behavior matches non-engraving items.

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    // try exact match on normalized material id, size, and color
    const byExact = variants.find((v) => {
      const variantMat = String(
        v?.material ||
          v?.materialLabel ||
          (Array.isArray(v?.materials) ? v.materials[0] : "") ||
          "",
      );
      const variantMatId = variantMat
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const variantSize =
        (v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "") + "";
      const variantColor = String(v?.color || "");
      const variantColorId = variantColor
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const matchesMat = selectedMaterial
        ? variantMatId === String(selectedMaterial)
        : true;
      const matchesSize = selectedSize
        ? String(variantSize) === String(selectedSize)
        : true;
      const matchesColor =
        selectedColor && colors.length
          ? variantColorId === String(selectedColor)
          : true;
      return matchesMat && matchesSize && matchesColor;
    });
    if (byExact) return byExact;

    // fallback: match material and color (exact id)
    if (selectedMaterial && selectedColor && colors.length) {
      const byMatColor = variants.find((v) => {
        const vm = String(
          v?.material ||
            v?.materialLabel ||
            (Array.isArray(v?.materials) ? v.materials[0] : "") ||
            "",
        );
        const vid = vm
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const vc = String(v?.color || "");
        const vidColor = vc
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return (
          vid === String(selectedMaterial) && vidColor === String(selectedColor)
        );
      });
      if (byMatColor) return byMatColor;
    }

    // fallback: match material only (exact id)
    if (selectedMaterial) {
      const byMat = variants.find((v) => {
        const vm = String(
          v?.material ||
            v?.materialLabel ||
            (Array.isArray(v?.materials) ? v.materials[0] : "") ||
            "",
        );
        const vid = vm
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return vid === String(selectedMaterial);
      });
      if (byMat) return byMat;
    }

    // fallback: match size only (only when variants support sizes)
    if (hasVariantSizes && selectedSize) {
      const bySize = variants.find(
        (v) =>
          String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "") ===
          String(selectedSize),
      );
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
    if (Array.isArray(selectedVariant?.images) && selectedVariant.images.length)
      return selectedVariant.images;
    if (Array.isArray(variants[0]?.images) && variants[0].images.length)
      return variants[0].images;
    return [];
  }, [selectedVariant, variants]);

  const price = useMemo(
    () => selectedVariant?.price ?? variants[0]?.price ?? 0,
    [selectedVariant, variants],
  );

  const totalQuantity = useMemo(() => {
    if (typeof selectedVariant?.quantity === "number")
      return selectedVariant.quantity;
    return variants.reduce((s, v) => s + (Number(v?.quantity) || 0), 0);
  }, [selectedVariant, variants]);

  const maxQty = useMemo(() => {
    if (typeof selectedVariant?.quantity === "number")
      return Math.max(0, selectedVariant.quantity);
    if (typeof totalQuantity === "number") return Math.max(0, totalQuantity);
    return 0;
  }, [selectedVariant?.quantity, totalQuantity]);

  const isSoldOut = (Number(maxQty) || 0) <= 0;

  useEffect(() => {
    // Keep quantity within stock bounds when variant changes.
    setQuantity((q) => {
      const n = Math.floor(Number(q) || 1);
      const safe = n < 1 ? 1 : n;
      const next = maxQty > 0 ? Math.min(safe, maxQty) : 1;
      setQuantityText(String(next));
      return next;
    });
  }, [selectedVariant?._id, maxQty]);

  const commitQuantityText = (raw) => {
    const n = Math.floor(Number(raw) || 1);
    const safe = n < 1 ? 1 : n;
    const next = maxQty > 0 ? Math.min(safe, maxQty) : safe;
    setQuantity(next);
    setQuantityText(String(next));
    return next;
  };

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
  const addSingleProductToCart = async ({
    buyNow = false,
    quantity: qtyArg,
    engraving: engravingArg,
  } = {}) => {
    // selectedVariant expected to be resolved
    if (!selectedVariant) {
      toast.error("Vui lòng chọn biến thể sản phẩm");
      return null;
    }

    if (isSoldOut) {
      toast.error("Sản phẩm đã hết hàng");
      return null;
    }

    const qty = Math.max(1, Math.floor(Number(qtyArg) || 1));

    // Decide whether to send as a "bracelet" bundle or as items-only (charms)
    const slugLower = String(slug || "").toLowerCase();
    const isCharm =
      slugLower.includes("charm") ||
      (product?.category?.slug &&
        String(product.category.slug).toLowerCase().includes("charm"));

    // Recompute selected variant now to ensure we send the correct variantId for product-level adds
    const findSelectedVariantNow = () => {
      if (!variants || !variants.length) return null;
      // try exact match on material, size and color
      const byExact = variants.find((v) => {
        const variantMat = String(
          v?.material ||
            v?.materialLabel ||
            (Array.isArray(v?.materials) ? v.materials[0] : "") ||
            "",
        );
        const variantMatId = variantMat
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const variantSize =
          (v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "") + "";
        const variantColor = String(v?.color || "");
        const variantColorId = variantColor
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const matchesMat = selectedMaterial
          ? variantMatId === String(selectedMaterial)
          : true;
        const matchesSize = selectedSize
          ? String(variantSize) === String(selectedSize)
          : true;
        const matchesColor =
          selectedColor && colors.length
            ? variantColorId === String(selectedColor)
            : true;
        return matchesMat && matchesSize && matchesColor;
      });
      if (byExact) return byExact;

      // fallback: match material and color (exact id)
      if (selectedMaterial && selectedColor && colors.length) {
        const byMatColor = variants.find((v) => {
          const vm = String(
            v?.material ||
              v?.materialLabel ||
              (Array.isArray(v?.materials) ? v.materials[0] : "") ||
              "",
          );
          const vid = vm
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const vc = String(v?.color || "");
          const vidColor = vc
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return (
            vid === String(selectedMaterial) &&
            vidColor === String(selectedColor)
          );
        });
        if (byMatColor) return byMatColor;
      }

      // fallback: match material only (exact id)
      if (selectedMaterial) {
        const byMat = variants.find((v) => {
          const vm = String(
            v?.material ||
              v?.materialLabel ||
              (Array.isArray(v?.materials) ? v.materials[0] : "") ||
              "",
          );
          const vid = vm
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return vid === String(selectedMaterial);
        });
        if (byMat) return byMat;
      }

      // fallback: match size only (only when variants support sizes)
      if (hasVariantSizes && selectedSize) {
        const bySize = variants.find(
          (v) =>
            String(v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "") ===
            String(selectedSize),
        );
        if (bySize) return bySize;
      }

      return variants[0];
    };

    const selectedNow = findSelectedVariantNow();

    // Guard against over-adding beyond stock when cart already has some quantity.
    // Applies to both product lines and bundle-based adds.
    const enforceStockWithCart = async ({
      variantIdentifier,
      charmVariantCode,
    }) => {
      if (!(maxQty > 0)) return { ok: true, qty };
      try {
        const cartRes = await api.getCart();
        const cart = cartRes?.data || null;
        const products = Array.isArray(cart?.products) ? cart.products : [];
        const bundles = Array.isArray(cart?.bundles) ? cart.bundles : [];

        const productId = String(product?._id || "");
        if (!productId) return { ok: true, qty };

        const variantKeys = [variantIdentifier, charmVariantCode]
          .concat([
            selectedNow?._id,
            selectedNow?.id,
            selectedNow?.variantCode,
            selectedNow?.code,
            selectedVariant?._id,
            selectedVariant?.id,
            selectedVariant?.variantCode,
            selectedVariant?.code,
          ])
          .filter((v) => v !== null && v !== undefined)
          .map((v) => String(v));

        const matchVariant = (v) => {
          const s = v === null || v === undefined ? "" : String(v);
          if (!s) return false;
          return variantKeys.includes(s);
        };

        let inCartQty = 0;

        // legacy product lines
        for (const pl of products) {
          if (String(pl?.productId || "") !== productId) continue;
          // If we can match variant, do so; otherwise count by productId.
          const plVar = pl?.variantId;
          if (variantKeys.length && plVar != null && !matchVariant(plVar))
            continue;
          inCartQty += Number(pl?.quantity) || 0;
        }

        // bundles: a bundle can contain the same product multiple times (multiple slots)
        // so we count occurrences * bundle.quantity
        for (const b of bundles) {
          const bQty = Number(b?.quantity) || 0;
          if (!bQty) continue;

          const bBraceletPid = b?.bracelet?.productId;
          if (bBraceletPid && String(bBraceletPid) === productId) {
            const bBraceletVar =
              b?.bracelet?.variantCode || b?.bracelet?.variantId || null;
            if (
              variantKeys.length &&
              bBraceletVar != null &&
              !matchVariant(bBraceletVar)
            ) {
              // different variant bracelet
            } else {
              // bracelet appears once per bundle
              inCartQty += 1 * bQty;
            }
          }

          const items = Array.isArray(b?.items) ? b.items : [];
          let occ = 0;
          for (const it of items) {
            if (String(it?.charmProductId || "") !== productId) continue;
            const itVar =
              it?.charmVariantCode || it?.variantCode || it?.variantId || null;
            if (variantKeys.length && itVar != null && !matchVariant(itVar))
              continue;
            occ += 1;
          }
          if (occ) inCartQty += occ * bQty;
        }

        const remaining = Math.max(0, maxQty - inCartQty);
        if (remaining <= 0) {
          toast.error(
            `Trong giỏ đã có ${inCartQty} sản phẩm, kho chỉ còn ${maxQty}`,
          );
          return { ok: false, qty: 0 };
        }
        if (qty > remaining) {
          toast.error(
            `Trong giỏ đã có ${inCartQty} sản phẩm, bạn chỉ có thể thêm tối đa ${remaining}`,
          );
          return { ok: true, qty: remaining };
        }
        return { ok: true, qty };
      } catch {
        // If cart fetch fails, fall back to backend validation.
        return { ok: true, qty };
      }
    };

    const payload = isCharm
      ? {
          bracelet: null,
          items: [
            {
              slotIndex: 0,
              charmProductId: product._id,
              charmVariantCode:
                selectedNow?.code ||
                selectedNow?.variantCode ||
                selectedVariant?.code ||
                selectedVariant?.variantCode ||
                "",
            },
          ],
        }
      : {
          bracelet: {
            productId: product._id,
            variantCode:
              selectedNow?.code ||
              selectedNow?.variantCode ||
              selectedVariant?.code ||
              selectedVariant?.variantCode ||
              "",
            sizeCm: selectedSize,
          },
          items: [],
        };

    const fetchCartSafe = async () => {
      try {
        const cartRes = await api.getCart();
        return cartRes?.data || null;
      } catch {
        return null;
      }
    };

    const notifyCartChanged = async (cartOverride = null) => {
      const cart = cartOverride || (await fetchCartSafe());
      try {
        syncCartBadge(cart);
        return cart;
      } catch (e) {
        try {
          window.dispatchEvent(new Event("cart:changed"));
        } catch {}
        return cart;
      }
    };

    try {
      // Prefer adding a normal product line so Checkout can render product details.
      // Fall back to bundle flow if backend rejects product-line adds for this item.
      let res = null;
      try {
        // For product-line adds, backend expects a concrete variant id in most setups.
        // Avoid falling back to codes for buyNow because it breaks exact matching in cart.
        const variantIdentifier =
          selectedNow?._id ||
          selectedVariant?._id ||
          selectedNow?.id ||
          selectedVariant?.id ||
          null;
        if (!variantIdentifier) {
          toast.error("Không xác định được biến thể để mua ngay");
          return null;
        }

        const guarded = await enforceStockWithCart({ variantIdentifier });
        if (!guarded.ok) return null;
        const engravingToSend = engravingArg || engraving || undefined;

        const cartBeforeAdd = await fetchCartSafe();
        const prodRes = await api.addProductToCart({
          productId: product._id,
          variantId: variantIdentifier,
          quantity: guarded.qty,
          buyNow,
          engraving: engravingToSend,
        });
        const cartAfterAdd = await fetchCartSafe();
        if (!buyNow) await notifyCartChanged(cartAfterAdd);

        // Try to extract returned product line id from multiple possible shapes.
        // IMPORTANT: Do NOT treat cart._id as a product line id.
        let lineId = prodRes?.data?.lineId || prodRes?.lineId || null;
        if (!lineId) {
          const cartLike =
            (prodRes && prodRes.data && Array.isArray(prodRes.data.products)
              ? prodRes.data
              : null) ||
            (prodRes && Array.isArray(prodRes.products) ? prodRes : null) ||
            (prodRes &&
            prodRes.data &&
            prodRes.data.cart &&
            Array.isArray(prodRes.data.cart.products)
              ? prodRes.data.cart
              : null) ||
            (prodRes && prodRes.cart && Array.isArray(prodRes.cart.products)
              ? prodRes.cart
              : null) ||
            null;

          const lines = cartLike?.products || [];
          const wantProductId = String(product?._id || "");
          const wantVariantId = String(variantIdentifier || "");

          // Prefer exact match productId+variantId.
          // For buyNow, do NOT fall back to productId-only because it can select a different line with a different quantity.
          const exact =
            wantProductId && wantVariantId
              ? (lines || []).find(
                  (p) =>
                    String(p?.productId) === wantProductId &&
                    String(p?.variantId) === wantVariantId,
                )
              : null;
          const byProduct =
            !buyNow && wantProductId
              ? (lines || []).find(
                  (p) => String(p?.productId) === wantProductId,
                )
              : null;
          const foundLine = exact || byProduct || null;
          lineId = foundLine?._id || foundLine?.id || null;
        }
        lineId =
          resolveCartProductLineId({
            beforeCart: cartBeforeAdd,
            afterCart: cartAfterAdd,
            productId: product?._id,
            variantId: variantIdentifier,
            addedQty: guarded.qty,
            engraving: engravingToSend,
            fallbackLineId: lineId,
          }) || lineId;

        // If engraving contained a client-generated previewImage (data URL), ensure backend stores it
        try {
          const engravingSent = engravingToSend || engraving || undefined;
          if (lineId && engravingSent && engravingSent.previewImage) {
            // patch the product line to include engraving previewImage so subsequent GET /cart returns it
            try {
              await api.patchProduct(lineId, { engraving: engravingSent });
            } catch (e) {
              // ignore patch failures; backend may already persist engraving or disallow patches
            }
          }
        } catch (e) {}

        if (buyNow && lineId) {
          try {
            sessionStorage.setItem(
              "checkout:productLineIds",
              JSON.stringify({
                productLineIds: [String(lineId)],
                at: Date.now(),
              }),
            );
            // Mark this as a buy-now session so Checkout can cleanup on exit.
            sessionStorage.setItem(
              "checkout:buyNow",
              JSON.stringify({
                kind: "product",
                lineId: String(lineId),
                at: Date.now(),
              }),
            );
            // Ensure bundles are not accidentally selected.
            sessionStorage.setItem(
              "checkout:bundleIds",
              JSON.stringify({ bundleIds: [], at: Date.now() }),
            );
          } catch (e) {}
          toast.success("Đã thêm và chuyển tới thanh toán");
          return {
            type: "product",
            id: String(lineId),
            productId: String(product?._id || ""),
            variantId: String(variantIdentifier),
          };
        }

        toast.success(
          buyNow
            ? "Đã thêm giỏ hàng — vui lòng hoàn tất thanh toán trên trang giỏ hàng"
            : `Đã thêm giỏ hàng thành công!`,
        );
        return {
          type: "product",
          id: lineId,
          productId: String(product?._id || ""),
          variantId: String(variantIdentifier),
        };
      } catch (eProd) {
        // eslint-disable-next-line no-console
        console.warn(
          "addProductToCart failed, falling back to addBundleToCart",
          eProd?.message || eProd,
        );
      }

      // proceed to try bundle path (either because isCharm or product-level add failed)
      const charmVariantCode =
        selectedNow?.code ||
        selectedNow?.variantCode ||
        selectedVariant?.code ||
        selectedVariant?.variantCode ||
        "";

      const guardedBundleQty = await enforceStockWithCart({
        variantIdentifier: selectedNow?._id || selectedNow?.id || null,
        charmVariantCode,
      });
      if (!guardedBundleQty.ok) return null;

      res = await api.addBundleToCart(payload);
      // proceed without debug logs
      if (!res || !res.valid) {
        // Prefer structured errors from backend if available
        const backendError =
          (res &&
            res.errors &&
            res.errors.length &&
            res.errors[0] &&
            (res.errors[0].message || res.errors[0].msg)) ||
          (res && res.data && res.data.message) ||
          res?.message;
        // Auto-retry: if backend complains about missing bracelet.typeCode, try sending as an item (charm)
        const errMsg = String(backendError || "");
        if (
          errMsg.toLowerCase().includes("unable to infer bracelet typecode") ||
          errMsg.toLowerCase().includes("infer bracelet typecode")
        ) {
          // build charm-style payload and retry once
          const charmPayload = {
            bracelet: null,
            items: [
              {
                slotIndex: 0,
                charmProductId: product._id,
                charmVariantCode:
                  selectedVariant.code ||
                  selectedVariant.variantCode ||
                  selectedVariant.code ||
                  "",
                offsetN: { x: 0, y: 0 },
              },
            ],
          };
          // retry charm payload (no debug log)
          const res2 = await api.addBundleToCart(charmPayload);
          // no debug log
          if (res2 && res2.valid) {
            const bundleId2 = res2?.data?.bundleId || res2?.data?._id || null;
            if (bundleId2 && guardedBundleQty.qty > 1) {
              try {
                await api.patchBundle(bundleId2, {
                  quantity: guardedBundleQty.qty,
                });
              } catch {
                // ignore quantity patch failures
              }
            }
            toast.success(
              buyNow
                ? "Đã thêm và chuyển tới thanh toán"
                : "Đã thêm giỏ hàng thành công!",
            );
            // notify header and other listeners that cart changed
            if (!buyNow) await notifyCartChanged();
            return { type: "bundle", id: bundleId2 };
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
              const variantMat = String(
                v?.material ||
                  v?.materialLabel ||
                  (Array.isArray(v?.materials) ? v.materials[0] : "") ||
                  "",
              );
              const variantMatId = variantMat
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              const variantSize =
                (v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "") + "";
              const variantColor = String(v?.color || "");
              const variantColorId = variantColor
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              const matchesMat = selectedMaterial
                ? variantMatId === String(selectedMaterial)
                : true;
              const matchesSize = selectedSize
                ? String(variantSize) === String(selectedSize)
                : true;
              const matchesColor =
                selectedColor && colors.length
                  ? variantColorId === String(selectedColor)
                  : true;
              return matchesMat && matchesSize && matchesColor;
            });
            if (byExact) return byExact;

            // fallback matchers (mat+color, mat, size, first)
            if (selectedMaterial && selectedColor && colors.length) {
              const byMatColor = variants.find((v) => {
                const vm = String(
                  v?.material ||
                    v?.materialLabel ||
                    (Array.isArray(v?.materials) ? v.materials[0] : "") ||
                    "",
                );
                const vid = vm
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                const vc = String(v?.color || "");
                const vidColor = vc
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                return (
                  vid === String(selectedMaterial) &&
                  vidColor === String(selectedColor)
                );
              });
              if (byMatColor) return byMatColor;
            }
            if (selectedMaterial) {
              const byMat = variants.find((v) => {
                const vm = String(
                  v?.material ||
                    v?.materialLabel ||
                    (Array.isArray(v?.materials) ? v.materials[0] : "") ||
                    "",
                );
                const vid = vm
                  .normalize("NFD")
                  .replace(/\p{Diacritic}/gu, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "");
                return vid === String(selectedMaterial);
              });
              if (byMat) return byMat;
            }
            if (selectedSize) {
              const bySize = variants.find(
                (v) =>
                  String(
                    v?.size || v?.sizeCm || v?.sizeLabel || v?.label || "",
                  ) === String(selectedSize),
              );
              if (bySize) return bySize;
            }
            return variants[0];
          };

          const selectedNow = findSelectedVariantNow();
          const variantIdentifier =
            selectedNow?._id ||
            selectedNow?.id ||
            selectedNow?.variantCode ||
            selectedNow?.code ||
            selectedVariant?._id ||
            selectedVariant?.id ||
            selectedVariant?.variantCode ||
            selectedVariant?.code ||
            null;

          // fallback attempt
          // call addProductToCart; this API returns the updated cart and lineId on success
           const engravingToSend = engravingArg || engraving || undefined;
           const cartBeforeAdd = await fetchCartSafe();
           const prodRes = await api.addProductToCart({
              productId: product._id,
              variantId: variantIdentifier,
              quantity: guardedBundleQty.qty,
              buyNow,
              engraving: engravingToSend,
            });
          const cartAfterAdd = await fetchCartSafe();
          if (!buyNow) await notifyCartChanged(cartAfterAdd);

          // Try to extract returned line id from multiple possible shapes
          const lineId =
            prodRes?.data?.lineId ||
            prodRes?.data?._id ||
            prodRes?.lineId ||
            null;
          const resolvedLineId =
            resolveCartProductLineId({
              beforeCart: cartBeforeAdd,
              afterCart: cartAfterAdd,
              productId: product?._id,
              variantId: variantIdentifier,
              addedQty: guardedBundleQty.qty,
              engraving: engravingToSend,
              fallbackLineId: lineId,
            }) || lineId;

          // Ensure engraving preview stored server-side when possible
          try {
            if (
              resolvedLineId &&
              engravingToSend &&
              engravingToSend.previewImage
            ) {
              try {
                await api.patchProduct(resolvedLineId, { engraving: engravingToSend });
              } catch (e) {
                // ignore patch failures
              }
            }
          } catch (e) {}

          // (debug logs removed)

          // If buyNow requested and we have a lineId, persist it for checkout and navigate
          if (buyNow && resolvedLineId) {
            try {
              sessionStorage.setItem(
                "checkout:productLineIds",
                JSON.stringify({
                  productLineIds: [String(resolvedLineId)],
                  at: Date.now(),
                }),
              );
            } catch (e) {
              // ignore sessionStorage errors
            }
            toast.success("Đã thêm và chuyển tới thanh toán");
            return { type: "product", id: String(resolvedLineId) };
          }

          // Non-buyNow: show success toast and return product line info for callers if needed
          toast.success(
            buyNow
              ? "Đã thêm giỏ hàng — vui lòng hoàn tất thanh toán trên trang giỏ hàng"
              : `Đã thêm giỏ hàng (variant: ${variantIdentifier}${resolvedLineId ? `, line:${resolvedLineId}` : ""})`,
          );
          return { type: "product", id: resolvedLineId };
        } catch (eProd) {
          // If fallback failed as well, show combined error info
          // eslint-disable-next-line no-console
          console.error("Fallback addProductToCart failed", eProd);
          const msg =
            backendError || eProd?.message || "Thêm vào giỏ hàng thất bại";
          try {
            // eslint-disable-next-line no-alert
            alert(
              "Add to cart failed:\n" +
                JSON.stringify(res || eProd || {}, null, 2),
            );
          } catch (e) {
            // ignore
          }
          toast.error(msg);
          return null;
        }
      }
      const bundleId = res?.data?.bundleId || res?.data?._id || null;
      if (bundleId && guardedBundleQty.qty > 1) {
        try {
          await api.patchBundle(bundleId, { quantity: guardedBundleQty.qty });
        } catch {
          // ignore quantity patch failures
        }
      }
      toast.success(
        buyNow
          ? "Đã thêm và chuyển tới thanh toán"
          : "Đã thêm giỏ hàng thành công!",
      );
      // Ensure cart UI updates immediately after adding a bundle
      if (!buyNow) await notifyCartChanged();
      return { type: "bundle", id: bundleId };
    } catch (e) {
      // Debug: log error
      // eslint-disable-next-line no-console
      console.error("addSingleProductToCart error", e);
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

          {/* <div className="product-rating">
>>>>>>> 40ecb53be07e3bab8a6ef6e753991fb56314c11f
            <div className="stars" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="star">
                  ★
                </span>
              ))}
            </div>
            <div className="rating-meta">(1 ĐÁNH GIÁ)</div>

          </div> */}


          {/* MATERIALS */}
          <div className="option-section">
            <h3 className="option-label">
              {!canEngrave && colors.length > 0
                ? `Chất liệu: ${materials.find((m) => m.id === selectedMaterial)?.label || (materials[0] && materials[0].label) || ""} - Màu: ${colors.find((c) => c.id === selectedColor)?.label || (colors[0] && colors[0].label) || ""}`
                : `Chất liệu: ${materials.find((m) => m.id === selectedMaterial)?.label || (materials[0] && materials[0].label) || ""}`}
            </h3>
            <div className="material-list">
              {materials.map((m) => (
                <button
                  key={m.id}
                  className={`material-swatch ${selectedMaterial === m.id ? "selected" : ""}`}
                  onClick={() => setSelectedMaterial(m.id)}
                  style={{ background: m.color }}
                  aria-label={m.label}
                ></button>
              ))}
            </div>
          </div>

          {/* COLORS - Only show if colors exist */}
          {!canEngrave && colors.length > 0 && (
            <div className="option-section">
              <h3 className="option-label">Màu sắc</h3>
              <div className="color-list">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    className={`color-swatch ${selectedColor === c.id ? "selected" : ""}`}
                    onClick={() => setSelectedColor(c.id)}
                    style={{ background: c.color }}
                    aria-label={c.label}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* CHỌN SIZE - only show when admin provided explicit sizes */}
          {showSizeSection && (
            <div className="option-section">
              <h2 className="option-label">Chọn kích thước</h2>
              <div className="size-list sizes-square">
                {sizes.map((size) => {
                  const qty = sizeQtyMap[size] || 0;
                  const disabled =
                    qty <= 0 || disabledSizes.includes(String(size));
                  return (
                    <button
                      key={size}
                      onClick={() => !disabled && setSelectedSize(size)}
                      className={`size-btn ${selectedSize === size ? "active" : ""} ${disabled ? "disabled strike" : ""}`}
                      disabled={disabled}
                      title={disabled ? "Hết hàng" : `Còn ${qty} sản phẩm`}
                    >
                      {disabled ? (
                        <span style={{ textDecoration: "line-through" }}>
                          {size}
                        </span>
                      ) : (
                        size
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUANTITY */}
          <div className="qty-row">
            <div className="qty-label">Số lượng</div>
            <div className="qty-control">
              <button
                type="button"
                className="qty-btn"
                onClick={() =>
                  commitQuantityText(
                    String(Math.max(1, (Number(uiQty) || 1) - 1)),
                  )
                }
                disabled={uiQty <= 1}
                aria-label="Giảm số lượng"
              >
                -
              </button>
              <input
                className="qty-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantityText}
                onChange={(e) => {
                  const raw = e.target.value;
                  // allow empty while editing, and digits only
                  if (raw === "") {
                    setQuantityText("");
                    return;
                  }
                  if (!/^\d+$/.test(raw)) return;
                  if (maxQty > 0) {
                    const nextN = Number(raw);
                    // Disallow typing beyond available stock.
                    if (Number.isFinite(nextN) && nextN > maxQty) {
                      toast.error("Số lượng vượt quá kho!", {
                        id: "quantity-over-stock",
                      });
                      return;
                    }
                  }
                  setQuantityText(raw);
                }}
                onBlur={() => commitQuantityText(quantityText)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    try {
                      e.currentTarget.blur();
                    } catch {}
                  }
                }}
                aria-label="Số lượng"
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() =>
                  commitQuantityText(
                    String(
                      maxQty > 0
                        ? Math.min((Number(uiQty) || 1) + 1, maxQty)
                        : (Number(uiQty) || 1) + 1,
                    ),
                  )
                }
                disabled={maxQty > 0 ? uiQty >= maxQty : false}
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>

          {/* STOCK NOTICE (use variant / total quantity) */}
          {typeof totalQuantity === "number" && (
            <div className="stock-note">
              {totalQuantity === 1 ? (
                <span className="stock-low">Chỉ còn 1 sản phẩm</span>
              ) : totalQuantity > 0 ? (
                <span>{`Còn ${totalQuantity} sản phẩm`}</span>
              ) : (
                <span className="stock-out">Hết hàng</span>
              )}
            </div>
          )}

          {/* For engravable products we will render special action buttons below */}

          <EngravingModal
            open={engraveOpen}

            onClose={() => {
              setEngraveOpen(false);
              // clear any temporary preview override when modal closes
              setEngravePreviewImage(null);
            }}

          onSave={(val) => {
              setEngraving(val);
              setEngraveOpen(false);
            }}
            // receive immediate preview URL when modal generates/uploads a thumbnail
            onPreviewAvailable={(val) => {
              try {
                // ensure engraving state includes any preview URL produced by the modal
                setEngraving(val);
              } catch (e) {}
            }}
            onConfirmAdd={async (payload) => {
              // payload is engraving object { text, fontId, fontSizePx, suggestionAccepted }
              try {
                setEngraveOpen(false);
                setAddingCart(true);
                const q = commitQuantityText(quantityText);
                // pass engraving to addSingleProductToCart via api call branch
                const res = await addSingleProductToCart({ buyNow: false, quantity: q, engraving: payload });
                if (res) resetEngravingDraft();
                // If backend didn't persist previewImage onto cart, keep a client-side map so cart UI can show it immediately
                try {
                  if (res && res.id && payload && payload.previewImage) {
                    const key = 'engraving_preview_map';
                    let map = {};
                    try {
                      const raw = localStorage.getItem(key);
                      map = raw ? JSON.parse(raw) : {};
                    } catch (e) {
                      map = {};
                    }
                    try {
                      map[String(res.id)] = String(payload.previewImage);
                      localStorage.setItem(key, JSON.stringify(map));
                    } catch (e) {}
                    try {
                      window.dispatchEvent(new Event('cart:changed'));
                    } catch {}
                  }
                } catch (e) {}
              } finally {
                setAddingCart(false);
              }
            }}

            // If we set an override preview (when user clicked the CTA), prefer it.
            previewImage={
              engravePreviewImage ||

              String(product?.engraving?.previewImage || "").trim() ||
              (selectedVariant?.images && selectedVariant.images[0]) ||
              null
            }
            productImageUrl={
              (selectedVariant?.images && selectedVariant.images[0]) ||
              (product?.images && product.images[0]) ||
              null
            }
            // Prefer explicit areas returned by API (product.engraving.areas)
            // If areas exist, use the first area as the engraving box; otherwise fall back
            // to the legacy single "box" property.
            box={
              (Array.isArray(product?.engraving?.areas) && product.engraving.areas[0]) ||
              product?.engraving?.box ||
              null
            }
            // Allow modal to know if admin enabled free placement
            allowFreePlacement={Boolean(product?.engraving?.allowFreePlacement)}
            autoDetected={product?.engraving?._autoDetected || null}
            allowedFonts={product?.engraving?.fonts || null}
            initial={engraving}
          />

          {/* NHÓM NÚT MUA HÀNG */}
          {canEngrave ? (
            <div className="engrave-action-buttons">
              {product?.engraving?._autoDetected &&
                product.engraving._autoDetected.detected && (
                  <span className="badge badge-suggestion">
                    Gợi ý vùng khắc có sẵn
                  </span>
                )}
              <button
                type="button"
                className="engrave-cta"
                onClick={() => {
                  // When customer opens engraving modal via this CTA, prefer showing the
                  // second product image (images[1]) as the preview for engraving
                  // if available. Fallback to first image or null.
                  try {
                    const pref = images && images.length > 1 ? images[1] : (images && images[0]) || null;
                    setEngravePreviewImage(pref);
                  } catch (e) {
                    setEngravePreviewImage((images && images[0]) || null);
                  }
                  setEngraveOpen(true);
                }}
                disabled={isSoldOut}
              >
                KHẮC THÔNG ĐIỆP CỦA BẠN
              </button>
              <button
                className="engrave-add-to-cart"
                aria-disabled={isSoldOut || addingCart}
                disabled={isSoldOut || addingCart}
                onClick={async (ev) => {
                  try {
                    ev.stopPropagation();
                  } catch {}
                  if (isSoldOut) return;
                  if (addingCart) return;
                  try {
                    setAddingCart(true);
                    const q = commitQuantityText(quantityText);
                    await addSingleProductToCart({
                      buyNow: false,
                      quantity: q,
                    });
                  } finally {
                    setAddingCart(false);
                  }
                }}
              >
                THÊM VÀO GIỎ
              </button>
            </div>
          ) : (
            <div className="action-buttons">
              <button
                className="btn btn-buy"
                aria-disabled={isSoldOut || addingBuyNow}
                disabled={isSoldOut || addingBuyNow}
                onClick={async () => {
                  // MUA NGAY: create a temporary checkout line and go straight to checkout
                  if (isSoldOut) return;
                  try {
                    setAddingBuyNow(true);
                    const q = commitQuantityText(quantityText);
                    const result = await addSingleProductToCart({
                      buyNow: true,
                      quantity: q,
                    });
                    // result may be { type: 'bundle'|'product', id } or null
                    if (result && result.type === "bundle" && result.id) {
                      try {
                        sessionStorage.setItem(
                          "checkout:bundleIds",
                          JSON.stringify({
                            bundleIds: [String(result.id)],
                            at: Date.now(),
                          }),
                        );
                      } catch {}
                      window.location.href = "/checkout";
                    } else if (result && result.type === "product") {
                      // Prefer checkout with explicit productLineIds
                      if (result.id) {
                        window.location.href = "/checkout";
                        return;
                      }

                      // Defensive: if backend didn't return lineId, fetch cart and infer the line.
                      try {
                        const cartRes = await api.getCart();
                        const lines = cartRes?.data?.products || [];
                        const wantProductId = String(
                          result.productId || product?._id || "",
                        );
                        const wantVariantId = String(
                          result.variantId ||
                            selectedVariant?._id ||
                            selectedVariant?.id ||
                            "",
                        );

                        // For buy now, require exact match when possible to avoid picking another line with higher quantity.
                        const exact =
                          wantProductId && wantVariantId
                            ? (lines || []).find(
                                (p) =>
                                  String(p?.productId) === wantProductId &&
                                  String(p?.variantId) === wantVariantId,
                              )
                            : null;

                        const found = exact || null;
                        const lineId = found?._id || found?.id || null;
                        if (lineId) {
                          try {
                            sessionStorage.setItem(
                              "checkout:productLineIds",
                              JSON.stringify({
                                productLineIds: [String(lineId)],
                                at: Date.now(),
                              }),
                            );
                          } catch {}
                          window.location.href = "/checkout";
                          return;
                        }
                      } catch (e) {
                        // ignore
                      }

                      toast.error("Không thể chuyển thẳng đến trang thanh toán");
                    } else {
                      toast.error("Không thể chuyển thẳng đến trang thanh toán");
                    }
                  } catch (e) {
                    // error handled in addSingleProductToCart
                  } finally {
                    setAddingBuyNow(false);
                  }
                }}
              >
                MUA NGAY
              </button>
              <button
                className="btn btn-cart"
                aria-disabled={isSoldOut || addingCart}
                disabled={isSoldOut || addingCart}
                tabIndex={0}
                style={{ pointerEvents: "auto", zIndex: 10 }}
                onMouseDown={() => {
                  // mousedown
                }}
                onMouseUp={() => {
                  // mouseup
                }}
                onClick={async (ev) => {
                  // click
                  // Prevent clicks from being swallowed by parent handlers
                  try {
                    ev.stopPropagation();
                  } catch (e) {}
                  if (isSoldOut) return;
                  if (addingCart) return;
                  try {
                    setAddingCart(true);
                    const q = commitQuantityText(quantityText);
                    await addSingleProductToCart({
                      buyNow: false,
                      quantity: q,
                    });
                  } finally {
                    setAddingCart(false);
                  }
                }}
              >
                THÊM GIỎ HÀNG
              </button>
            </div>
          )}

          {/* CHI TIẾT SẢN PHẨM */}
          <div className="product-description">
            <h2 className="description-title">Chi tiết sản phẩm</h2>
            <div className="description-text">
              <div
                className="bold"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
            <ul className="spec-list">
              <li>
                <span className="label">Bộ sưu tập:</span>{" "}
                {(() => {
                  const cols = Array.isArray(product?.collections)
                    ? product.collections
                    : [];
                  const directNames = cols
                    .map((c) =>
                      c && typeof c === "object" ? c.name || "" : "",
                    )
                    .filter(Boolean);
                  if (directNames.length) return directNames.join(", ");

                  if (collectionNames && collectionNames.length)
                    return collectionNames.join(", ");

                  const single = product?.collection;
                  const singleName =
                    (single && typeof single === "object"
                      ? single.name
                      : null) || (typeof single === "string" ? single : null);
                  return singleName || "-";
                })()}
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
                {materials.find((m) => m.id === selectedMaterial)?.label ||
                  (materials[0] && materials[0].label) ||
                  "-"}
              </li>
              <li>
                <span className="label">Màu sắc:</span>{" "}
                {colors && colors.length
                  ? colors.find((c) => c.id === selectedColor)?.label ||
                    colors[0].label
                  : "Không màu"}
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
