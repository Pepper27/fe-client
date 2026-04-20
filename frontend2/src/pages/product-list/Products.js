import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProductCard } from "../../components/product-card";
import Sidebar from "../../components/sidebar";
import { api } from "../../utils/api";
import "./products.scss";

function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams(location.search || "");
        const q = qs.get("q") || "";
        const categorySlug = qs.get("categorySlug") || "";
        // Parse filters param (JSON) if present
        let filtersParam = undefined;
        try {
          const raw = qs.get('filters');
          if (raw) filtersParam = JSON.parse(raw);
        } catch (e) {
          filtersParam = undefined;
        }

        // Fetch products
        let merged = [];
        try {
          const v1 = await api.getProducts({
            page: 1,
            limit: 60,
            q,
            categorySlug,
            filters: filtersParam,
          });
          merged = v1?.data || [];
        } catch (err) {
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          merged = [...(braceletsRes?.data || []), ...(charmsRes?.data || [])];
        }
        if (cancelled) return;
        setItems(merged);
        setFilteredItems(merged);

        // Fetch category info for banner
        if (categorySlug) {
          try {
            const catRes = await api.getCategories({ root: 0 });
            const allCats = Array.isArray(catRes?.data) ? catRes.data : [];
            // Find category by slug
            let found = allCats.find((c) => c.slug === categorySlug);
            if (found) {
              // Determine whether this is a leaf category (no children). If it's a leaf,
              // show only this category in the sidebar "Loại sản phẩm" filter.
              const hasChild = allCats.some((c) => {
                const parentIds = [c.parent, c.parentId, c.parent_id, c.parentIdString];
                return parentIds.some((pid) => pid !== undefined && String(pid) === String(found._id));
              });
              if (!hasChild) {
                found = { ...found, filterOptions: { ...(found.filterOptions || {}), category: [found.name] } };
              }
            }
            setCategory(found || null);
          } catch {
            setCategory(null);
          }
        } else {
          setCategory(null);
        }
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setItems([]);
        setCategory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.search]);

  // Update filteredItems when items, filters or sort change
  useEffect(() => {
    let next = Array.isArray(items) ? items.slice() : [];

    // Apply filters from Sidebar (category, material, color, size, price, theme)
    const f = activeFilters || {};
    const matchesFilters = (p) => {
      // category filter (product.category or product.type)
      if (Array.isArray(f.category) && f.category.length) {
        const cat = p.category || p.type || "";
        if (!f.category.includes(cat)) return false;
      }
      // material, theme, size, color: match if product.tags contains the value
      const tags = Array.isArray(p.tags) ? p.tags.map(String) : [];
      const checkTagKey = (key) => {
        if (!Array.isArray(f[key]) || !f[key].length) return true;
        return f[key].some((val) => tags.some((t) => String(t).toLowerCase().includes(String(val).toLowerCase())));
      };
      if (!checkTagKey("material")) return false;
      if (!checkTagKey("theme")) return false;
      if (!checkTagKey("size")) return false;
      if (!checkTagKey("color")) return false;

      // price: simple range parsing based on the labels used in sidebar
      if (Array.isArray(f.price) && f.price.length) {
        const price = Number((p.variants && p.variants[0] && p.variants[0].price) || 0);
        const ok = f.price.some((label) => {
          if (label.indexOf("Dưới") === 0) {
            const n = Number(label.replace(/[^0-9]/g, "")) || 0;
            return price <= n;
          }
          if (label.indexOf("Trên") === 0) {
            const n = Number(label.replace(/[^0-9]/g, "")) || 0;
            return price >= n;
          }
          // range like 1.000.001đ - 2.500.000đ
          const parts = label.split("-").map((s) => Number(String(s).replace(/[^0-9]/g, "")));
          if (parts.length === 2) {
            const [min, max] = parts;
            return price >= min && price <= max;
          }
          return true;
        });
        if (!ok) return false;
      }

      return true;
    };

    next = next.filter(matchesFilters);

    // Apply sort
    if (activeSort && activeSort.value) {
      switch (activeSort.value) {
        case 'price-asc':
          next.sort((a, b) => ((a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0)));
          break;
        case 'price-desc':
          next.sort((a, b) => ((b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0)));
          break;
        case 'newest':
          next.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        default:
          break;
      }
    }

    setFilteredItems(next);
  }, [items, activeFilters, activeSort]);

  const handleFiltersChange = useCallback((filters) => {
    setActiveFilters(filters || {});
  }, []);

  const handleSortChange = useCallback((sort) => {
    setActiveSort(sort || null);
  }, []);

  // Determine banner image
  const bannerUrl =
    category?.banner || category?.avatar || "/client/image/vongtay.jpg";

  return (
    <div className="products-page">
      {/* Banner */}
      <div className="products-banner">
        {category ? (
          <>
            {typeof category.banner === "string" && category.banner.trim() ? (
              category.banner.match(/^https?:\/\//) ||
              category.banner.startsWith("/") ? (
                <img
                  src={category.banner}
                  alt={category.name || "Banner"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="products-banner-string">{category.banner}</div>
              )
            ) : (
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}
            {/* {category.name && (
              <div className="products-banner-title">{category.name}</div>
            )} */}
          </>
        ) : (
          <img
            src={bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="container products-inner">
        {/* Breadcrumb */}
        <nav className="products-breadcrumb" aria-label="breadcrumb">
          <Link className="products-breadcrumb__link" to="/">
            Trang chủ
          </Link>
          <span className="products-breadcrumb__sep">›</span>
          <span className="products-breadcrumb__current">
            {category?.name || "Sản phẩm"}
          </span>
        </nav>
        {/* Layout */}
        <div className="products-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <Sidebar category={category} onFiltersChange={handleFiltersChange} onSortChange={handleSortChange} />
          </aside>
          {/* Product List */}
          <main className="products-content">
            <div className="products-grid">
                {loading ? (
                 <div>Đang tải sản phẩm...</div>
               ) : (
                  filteredItems.map((p) => {
                  const firstVariant = (p?.variants || [])[0] || null;
                  const image = (firstVariant?.images || [])[0] || "";
                  const price = firstVariant?.price ?? 0;
                  // Determine whether product cards on this page should be square.
                  const catName = category?.name || "";
                  const slug = (category && category.slug) || "";
                  const shouldSquare = /nhấ?n|nhẫn|charm/i.test(catName) || /nhan|charm/i.test(slug);
                  return (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      slug={p.slug}
                      name={p.name}
                      price={price}
                      images={image}
                      isSquare={shouldSquare}
                    />
                  );
                 })
               )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
