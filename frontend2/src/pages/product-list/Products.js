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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
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

        // If a categorySlug is present, pass it directly to the API
        // The backend will handle category resolution and filtering
        let productsData = [];
        try {
          // Fetch first page only with limit 24
          const res = await api.getProducts({
            page: 1,
            limit: 24,
            q,
            categorySlug: categorySlug,
            filters: filtersParam,
            includeFilters: true,
          });
          productsData = res?.data || [];
          const total = res?.meta?.total || 0;
          const filtersData = res?.filters || {};
          // Normalize backend filter keys to the shape Sidebar expects
          const normalizedFilters = {
            ...filtersData,
            price: filtersData.price_ranges || filtersData.price || [],
            // Sidebar expects availableFilters.* keys: materials, colors, sizes, themes, collections, categories
          };
          
          // Debug - log values
          console.log('First load:', {
            productsLength: productsData.length,
            total: total,
            hasMore: productsData.length === 24 && productsData.length < total,
            filters: filtersData
          });
          
          // Store filters data for sidebar (backend already provides counts)
          console.log('Setting availableFilters:', {
            materials: normalizedFilters.materials?.length || 0,
            colors: normalizedFilters.colors?.length || 0,
            sizes: normalizedFilters.sizes?.length || 0,
            priceRanges: normalizedFilters.price?.length || 0,
          });
          console.log('Full filters data from backend:', normalizedFilters);
          setAvailableFilters(normalizedFilters);
          
          // Set hasMore to check if there are more products to load
          const totalPages = res?.meta?.totalPages || 1;
          setHasMore(productsData.length === 24 && page < totalPages);
        } catch (err) {
          console.error('Error fetching products:', err);
          // Fallback to getting bracelets and charms if products endpoint fails
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          productsData = [...(braceletsRes?.data || []), ...(charmsRes?.data || [])];
          setHasMore(false); // No more products if fallback is used
        }
        if (cancelled) return;
        // Debug: Log product structure
        console.log('Loaded products:', productsData.slice(0, 2).map(p => ({
          id: p._id,
          name: p.name,
          category: p.category,
          type: p.type
        })));
        
        setItems(productsData);
        setFilteredItems(productsData);

        // Fetch category info for banner and hierarchical filtering
        let allCats = [];
        if (categorySlug) {
          try {
            const catRes = await api.getCategories({ root: 0 });
            allCats = Array.isArray(catRes?.data) ? catRes.data : [];
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
        
        // Store all categories for hierarchical filtering
        window._allCategories = allCats;
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

  // Reset page and hasMore when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [location.search]);

  // Update filteredItems when items, filters or sort change
  useEffect(() => {
    let next = Array.isArray(items) ? items.slice() : [];

    // Apply filters from Sidebar (category, material, color, size, price, theme)
    const f = activeFilters || {};
    const matchesFilters = (p) => {
      // Category filtering logic with hierarchical support
      if (Array.isArray(f.categories) && f.categories.length > 0) {
        const prodCatId = p.category?._id || p.category || null;
        
        if (!prodCatId) {
          // Product has no category, exclude it
          return false;
        }
        
        // Check if product category matches any selected category or their children
        const allCats = window._allCategories || [];
        const isProductInSelectedCategory = f.categories.some(selectedCatId => {
          const selectedCatIdStr = String(selectedCatId);
          const prodCatIdStr = String(prodCatId);
          
          // Direct match
          if (selectedCatIdStr === prodCatIdStr) {
            return true;
          }
          
          // Check if selected category is parent of product category
          const isParent = allCats.some(cat => {
            if (String(cat._id) === prodCatIdStr) {
              const parentIds = [cat.parent, cat.parentId, cat.parent_id, cat.parentIdString];
              return parentIds.some(pid => pid && String(pid) === selectedCatIdStr);
            }
            return false;
          });
          
          return isParent;
        });
        
        if (!isProductInSelectedCategory) {
          return false;
        }
      }
      // material, theme, size, color: match if product has the attribute
      const checkAttribute = (attrKey, backendKey) => {
        const values = f[backendKey] || f[attrKey];
        if (!Array.isArray(values) || !values.length) return true;
        
        // Check product attributes
        const productValues = [];
        
        // Try to get from product attributes
        if (p[attrKey]) {
          if (p[attrKey]._id) productValues.push(String(p[attrKey]._id));
          if (p[attrKey].name) productValues.push(String(p[attrKey].name));
        }
        
        // Try to get from tags as fallback
        if (Array.isArray(p.tags)) {
          p.tags.forEach(tag => {
            if (typeof tag === 'string') productValues.push(String(tag));
          });
        }
        
        return values.some(val => {
          const sval = String(val).trim().toLowerCase();
          return productValues.some(pv => pv.toLowerCase().includes(sval));
        });
      };
      
      if (!checkAttribute("material", "materials")) return false;
      if (!checkAttribute("theme", "themes")) return false;
      if (!checkAttribute("size", "sizes")) return false;
      if (!checkAttribute("color", "colors")) return false;

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

    const beforeFilter = next.length;
      
      // Debug each product filtering
      const filterResults = next.map(p => {
        const result = matchesFilters(p);
        return {
          name: p.name,
          included: result
        };
      });
      
      next = next.filter(matchesFilters);
      const afterFilter = next.length;
      
      // Debug: Log filter results and first few products
      console.log(`Filter results: ${beforeFilter} -> ${afterFilter} products`);
      console.log("First 5 products filter results:", filterResults.slice(0, 5));

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
    console.log('Filters changed:', filters);
    setActiveFilters(filters || {});
  }, []);

  const handleSortChange = useCallback((sort) => {
    setActiveSort(sort || null);
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams(location.search || "");
      const q = qs.get("q") || "";
      const categorySlug = qs.get("categorySlug") || "";
      let filtersParam = undefined;
      try {
        const raw = qs.get('filters');
        if (raw) filtersParam = JSON.parse(raw);
      } catch (e) {
        filtersParam = undefined;
      }

      const res = await api.getProducts({
        page: nextPage,
        limit: 24,
        q,
        categorySlug,
        filters: filtersParam,
        includeFilters: true,
      });

      const newItems = res?.data || [];
      setItems(prev => [...prev, ...newItems]);  // Append new items
      setPage(nextPage);
      
      // Update hasMore - kiểm tra nếu có còn page tiếp theo không
      const totalPages = res?.meta?.totalPages || 1;
      
      // Debug - log values
      console.log('Load more:', {
        currentPage: nextPage,
        newItemsLength: newItems.length,
        totalPages: totalPages,
        hasMore: nextPage < totalPages
      });
      
      setHasMore(nextPage < totalPages);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  };

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
            <Sidebar 
  category={category} 
  availableFilters={availableFilters}
  onFiltersChange={handleFiltersChange} 
  onSortChange={handleSortChange} 
/>
          </aside>
          {/* Product List */}
          <main className="products-content">
            <div className="products-grid">
                {loading && page === 1 ? (
                 <div className="loading-initial">Đang tải sản phẩm...</div>
               ) : (
                  filteredItems.map((p) => {
                   const variants = p?.variants || [];
                   const firstVariant = variants[0] || null;
                   const image = (firstVariant?.images || [])[0] || "";
                   // Use lowest variant price as representative price
                   const prices = variants.map(v => Number(v?.price || 0)).filter(n => Number.isFinite(n));
                   const price = prices.length ? Math.min(...prices) : 0;
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
              
              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="load-more-container">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="load-more-button"
                  >
                    {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                  </button>
                </div>
              )}

              {!hasMore && filteredItems.length > 0 && (
                <div className="no-more-products">
                  <p>Đã hiển thị tất cả {filteredItems.length} sản phẩm</p>
                </div>
              )}

              {loadingMore && (
                <div className="loading-more">
                  <div className="spinner"></div>
                  <p>Đang tải thêm sản phẩm...</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
