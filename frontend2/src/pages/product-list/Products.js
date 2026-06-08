import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ProductCard } from "../../components/product-card";
import Sidebar from "../../components/sidebar";
import { api } from "../../utils/api";
import { mapQueryToFilters } from "../../utils/productsUrl";
import "./products.scss";

const PAGE_SIZE = 25;

function ProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [collectionMeta, setCollectionMeta] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const location = useLocation();
  const { collectionSlug } = useParams();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams(location.search || "");
        const q = qs.get("q") || "";
        const bannerFromQuery = qs.get("banner") || "";
        const titleFromQuery = qs.get("title") || "";
        // Prefer explicit categorySlug param
        let categorySlug = qs.get("categorySlug") || "";
        // Parse filters param (JSON) if present; otherwise parse short params
        let filtersParam = undefined;
        try {
          const raw = qs.get("filters");
          if (raw) {
            filtersParam = JSON.parse(raw);
          } else {
            // Build object from short query params
            const shortObj = Object.fromEntries(qs.entries());
            filtersParam = mapQueryToFilters(shortObj);

            // If the URL redundantly sets type=<categorySlug> (common for header links),
            // don't force an exact category-id filter. Let backend handle parent
            // categorySlug filtering (incl. child categories) so the listing isn't empty.
            try {
              const cs = String(qs.get("categorySlug") || "")
                .trim()
                .toLowerCase();
              const tp = String(qs.get("type") || "")
                .trim()
                .toLowerCase();
              if (
                cs &&
                tp &&
                cs === tp &&
                filtersParam &&
                Array.isArray(filtersParam.categories)
              ) {
                delete filtersParam.categories;
              }
            } catch {
              // ignore
            }

            // Resolve short category slugs/names into backend category ids and
            // prefer setting categorySlug to the selected child slug when user
            // selected a particular type (e.g., type=day-chuyen while current
            // page categorySlug is the parent 'trang-suc'). This ensures the
            // backend receives a precise categorySlug and category ids in
            // filters.categories so server-side filtering works correctly.
            try {
              if (
                filtersParam &&
                Array.isArray(filtersParam.categories) &&
                filtersParam.categories.length
              ) {
                // Ensure we have a global category list to resolve against
                if (
                  !Array.isArray(window._allCategories) ||
                  !window._allCategories.length
                ) {
                  const catRes = await api.getCategories({ root: 0 });
                  window._allCategories = Array.isArray(catRes?.data)
                    ? catRes.data
                    : [];
                }

                const allCats = Array.isArray(window._allCategories)
                  ? window._allCategories
                  : [];
                const resolved = [];
                let childSlug = null;
                for (const v of filtersParam.categories) {
                  const sv = String(v || "")
                    .trim()
                    .toLowerCase();
                  const found = allCats.find(
                    (c) =>
                      String(c.slug || "")
                        .trim()
                        .toLowerCase() === sv ||
                      String(c.name || "")
                        .trim()
                        .toLowerCase() === sv ||
                      String(c._id || "").trim() === sv,
                  );
                  if (found) {
                    resolved.push(String(found._id));
                    childSlug = childSlug || found.slug || null;
                  } else {
                    resolved.push(v);
                  }
                }
                filtersParam.categories = resolved;
                if (childSlug) {
                  // prefer child slug for accurate backend filtering
                  categorySlug = childSlug;
                }
              }
            } catch (e) {
              // ignore resolution errors and continue with original filtersParam
            }
          }
        } catch (e) {
          filtersParam = undefined;
        }

        // If we don't have explicit categorySlug but short param `type` exists, try to resolve it
        if (!categorySlug) {
          const shortType = qs.get("type");
          if (
            shortType &&
            typeof window !== "undefined" &&
            Array.isArray(window._allCategories)
          ) {
            const found = window._allCategories.find(
              (c) =>
                String(c.slug || "")
                  .trim()
                  .toLowerCase() ===
                  String(shortType || "")
                    .trim()
                    .toLowerCase() ||
                String(c.name || "")
                  .trim()
                  .toLowerCase() ===
                  String(shortType || "")
                    .trim()
                    .toLowerCase(),
            );
            if (found) categorySlug = found.slug || "";
          }
        }

        // If a categorySlug is present, pass it directly to the API
        // The backend will handle category resolution and filtering
        let productsData = [];
        try {
          // Fetch first page only with limit 24
          const res = collectionSlug
            ? await api.getProductsByCollection({
                collectionId: collectionSlug,
                page: 1,
                limit: PAGE_SIZE,
                q,
                categorySlug: categorySlug,
                filters: filtersParam,
                includeFilters: true,
              })
            : await api.getProducts({
                page: 1,
                limit: PAGE_SIZE,
                q,
                categorySlug: categorySlug,
                filters: filtersParam,
                includeFilters: true,
              });
          productsData = res?.data || [];
          const total = res?.meta?.total || 0;
          setTotalResults(total);
          const filtersData = res?.filters || {};
          // Normalize backend filter keys to the shape Sidebar expects
          const normalizedFilters = {
            ...filtersData,
            price: filtersData.price_ranges || filtersData.price || [],
            // Sidebar expects availableFilters.* keys: materials, colors, sizes, themes, collections, categories
          };

          // Debug - log values

          // Store filters data for sidebar (backend already provides counts)
          setAvailableFilters(normalizedFilters);

          // Set hasMore based on server paging (avoid depending on client-side filtering)
          const totalPages = res?.meta?.totalPages || 1;
          setHasMore(1 < totalPages);
        } catch (err) {
          console.error("Error fetching products:", err);
          // Fallback to getting bracelets and charms if products endpoint fails
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          productsData = [
            ...(braceletsRes?.data || []),
            ...(charmsRes?.data || []),
          ];
          setTotalResults(productsData.length);
          setHasMore(false); // No more products if fallback is used
        }
        if (cancelled) return;
        // Debug: Log product structure
        setItems(productsData);
        setFilteredItems(productsData);

        // If we're on a collection listing route, fetch its metadata so we can
        // render the correct banner/title (and not the default products banner).
        if (collectionSlug) {
          try {
            // If banner/title is explicitly passed (from banner click), use it.
            if (bannerFromQuery || titleFromQuery) {
              setCollectionMeta({
                name: titleFromQuery || null,
                avatar: bannerFromQuery || null,
                poster: bannerFromQuery || null,
                slug: collectionSlug,
              });
            } else {
              const colRes = await api.getCollections();
              const cols = Array.isArray(colRes?.data) ? colRes.data : [];
              const foundCol = cols.find(
                (c) =>
                  String(c?.slug || "") === String(collectionSlug) ||
                  String(c?._id || "") === String(collectionSlug),
              );
              setCollectionMeta(foundCol || { slug: collectionSlug });
            }
          } catch {
            setCollectionMeta({ slug: collectionSlug });
          }
        } else {
          setCollectionMeta(null);
        }

        // Fetch category info for banner and hierarchical filtering
        let allCats = [];
        if (categorySlug) {
          try {
            const catRes = await api.getCategories({ root: 0 });
            allCats = Array.isArray(catRes?.data) ? catRes.data : [];
            // Find category by slug
            let found = allCats.find((c) => c.slug === categorySlug);
            if (found) {
              // Find children of the current category
              const children = allCats.filter((c) => {
                const parents = [
                  c.parent,
                  c.parentId,
                  c.parent_id,
                  c.parentIdString,
                ];
                return parents.some(
                  (pid) =>
                    pid !== undefined && String(pid) === String(found._id),
                );
              });

              if (children.length) {
                // If current category has children, show those children in the
                // "Loại sản phẩm" filter (parent view -> its direct children).
                found = {
                  ...found,
                  filterOptions: {
                    ...(found.filterOptions || {}),
                    category: children.map((c) => c.name),
                  },
                };
              } else {
                // Leaf category: per UX B, show siblings (other children of the same parent)
                const parentId =
                  found.parent ||
                  found.parentId ||
                  found.parent_id ||
                  found.parentIdString ||
                  null;
                if (parentId) {
                  const siblings = allCats.filter((c) => {
                    const parents = [
                      c.parent,
                      c.parentId,
                      c.parent_id,
                      c.parentIdString,
                    ];
                    return parents.some(
                      (pid) =>
                        pid !== undefined && String(pid) === String(parentId),
                    );
                  });
                  if (siblings.length) {
                    found = {
                      ...found,
                      filterOptions: {
                        ...(found.filterOptions || {}),
                        category: siblings.map((c) => c.name),
                      },
                    };
                  } else {
                    // fallback: show itself
                    found = {
                      ...found,
                      filterOptions: {
                        ...(found.filterOptions || {}),
                        category: [found.name],
                      },
                    };
                  }
                } else {
                  // No parent info: fallback to showing itself
                  found = {
                    ...found,
                    filterOptions: {
                      ...(found.filterOptions || {}),
                      category: [found.name],
                    },
                  };
                }
              }
            }
            setCategory(found || null);
          } catch {
            setCategory(null);
          }
        } else {
          setCategory(null);
        }

        // Store all categories for hierarchical filtering so Sidebar can resolve
        // category names -> slugs/ids when necessary. Keep defensive check.
        if (Array.isArray(allCats)) window._allCategories = allCats;
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setItems([]);
        setCategory(null);
        setTotalResults(0);
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

    // If URL contains server-side filters, the backend returned already-filtered rows.
    // In that case skip client-side filtering which can produce empty results or
    // mismatch with server-side paging/sorting.
    try {
      const qs = new URLSearchParams(location.search || "");
      // We support both:
      // 1) canonical JSON param: filters={...}
      // 2) short params: type/material/color/size/collection/min/max/theme/inStock/priceRanges
      // The fetch effect already passes these as server-side filters, so do NOT
      // re-filter on the client.
      const shortKeys = [
        "type",
        "material",
        "color",
        "size",
        "collection",
        "min",
        "max",
        "theme",
        "inStock",
        "priceRanges",
      ];
      const hasServerFilters =
        Boolean(qs.get("filters")) || shortKeys.some((k) => qs.has(k));
      if (hasServerFilters) {
        let out = Array.isArray(items) ? items.slice() : [];
        // Still allow client-side sorting UI on top of server-filtered results.
        if (activeSort && activeSort.value) {
          switch (activeSort.value) {
            case "price-asc":
              out.sort(
                (a, b) =>
                  (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0),
              );
              break;
            case "price-desc":
              out.sort(
                (a, b) =>
                  (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0),
              );
              break;
            case "newest":
              out.sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
              );
              break;
            default:
              break;
          }
        }
        setFilteredItems(out);
        return;
      }
    } catch (e) {
      // ignore and proceed with client-side filtering
    }

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
        const isProductInSelectedCategory = f.categories.some(
          (selectedCatId) => {
            const selectedCatIdStr = String(selectedCatId);
            const prodCatIdStr = String(prodCatId);

            // Direct match
            if (selectedCatIdStr === prodCatIdStr) {
              return true;
            }

            // Check if selected category is parent of product category
            const isParent = allCats.some((cat) => {
              if (String(cat._id) === prodCatIdStr) {
                const parentIds = [
                  cat.parent,
                  cat.parentId,
                  cat.parent_id,
                  cat.parentIdString,
                ];
                return parentIds.some(
                  (pid) => pid && String(pid) === selectedCatIdStr,
                );
              }
              return false;
            });

            return isParent;
          },
        );

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
          p.tags.forEach((tag) => {
            if (typeof tag === "string") productValues.push(String(tag));
          });
        }

        return values.some((val) => {
          const sval = String(val).trim().toLowerCase();
          return productValues.some((pv) => pv.toLowerCase().includes(sval));
        });
      };

      if (!checkAttribute("material", "materials")) return false;
      if (!checkAttribute("theme", "themes")) return false;
      if (!checkAttribute("size", "sizes")) return false;
      if (!checkAttribute("color", "colors")) return false;

      // price: simple range parsing based on the labels used in sidebar
      if (Array.isArray(f.price) && f.price.length) {
        const price = Number(
          (p.variants && p.variants[0] && p.variants[0].price) || 0,
        );
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
          const parts = label
            .split("-")
            .map((s) => Number(String(s).replace(/[^0-9]/g, "")));
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
    const filterResults = next.map((p) => {
      const result = matchesFilters(p);
      return {
        name: p.name,
        included: result,
      };
    });

    next = next.filter(matchesFilters);
    const afterFilter = next.length;

    // Debug: Log filter results and first few products
    // Apply sort
    if (activeSort && activeSort.value) {
      switch (activeSort.value) {
        case "price-asc":
          next.sort(
            (a, b) =>
              (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0),
          );
          break;
        case "price-desc":
          next.sort(
            (a, b) =>
              (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0),
          );
          break;
        case "newest":
          next.sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
          );
          break;
        default:
          break;
      }
    }

    setFilteredItems(next);
    // When client-side filtering is used, total reflects filtered list size.
    setTotalResults(next.length);
  }, [items, activeFilters, activeSort, location.search]);

  const handleFiltersChange = useCallback((filters) => {
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
      let categorySlug = qs.get("categorySlug") || "";
      let filtersParam = undefined;
      try {
        const raw = qs.get("filters");
        if (raw) {
          filtersParam = JSON.parse(raw);
        } else {
          const shortObj = Object.fromEntries(qs.entries());
          filtersParam = mapQueryToFilters(shortObj);

          // Same guard as initial fetch: when type equals categorySlug, don't force
          // categories filter (it can empty the list).
          try {
            const cs = String(qs.get("categorySlug") || "")
              .trim()
              .toLowerCase();
            const tp = String(qs.get("type") || "")
              .trim()
              .toLowerCase();
            if (
              cs &&
              tp &&
              cs === tp &&
              filtersParam &&
              Array.isArray(filtersParam.categories)
            ) {
              delete filtersParam.categories;
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        filtersParam = undefined;
      }
      if (!categorySlug) {
        const shortType = qs.get("type");
        if (
          shortType &&
          typeof window !== "undefined" &&
          Array.isArray(window._allCategories)
        ) {
          const found = window._allCategories.find(
            (c) =>
              String(c.slug || "")
                .trim()
                .toLowerCase() ===
                String(shortType || "")
                  .trim()
                  .toLowerCase() ||
              String(c.name || "")
                .trim()
                .toLowerCase() ===
                String(shortType || "")
                  .trim()
                  .toLowerCase(),
          );
          if (found) categorySlug = found.slug || "";
        }
      }

      const res = await api.getProducts({
        page: nextPage,
        limit: PAGE_SIZE,
        q,
        categorySlug,
        filters: filtersParam,
        includeFilters: true,
      });

      const newItems = res?.data || [];
      setItems((prev) => [...prev, ...newItems]); // Append new items
      setPage(nextPage);

      // Update hasMore - kiểm tra nếu có còn page tiếp theo không
      const totalPages = res?.meta?.totalPages || 1;

      // Debug - log values

      setHasMore(nextPage < totalPages);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Determine banner image
  const qsNow = new URLSearchParams(location.search || "");
  const bannerOverride = qsNow.get("banner") || "";
  const bannerUrl =
    bannerOverride ||
    category?.banner ||
    category?.avatar ||
    collectionMeta?.avatar ||
    collectionMeta?.poster ||
    "/client/image/vongtay.jpg";

  const pageTitle =
    category?.name ||
    qsNow.get("title") ||
    "" ||
    collectionMeta?.name ||
    "Sản phẩm";

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
          <span className="products-breadcrumb__current">{pageTitle}</span>
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
            <div className="products-results-count" aria-live="polite">
              {Number(totalResults) || 0} kết quả
            </div>
            <div className="products-grid">
              {loading && page === 1 ? (
                <div className="loading-initial">Đang tải sản phẩm...</div>
              ) : (
                <>
                  {filteredItems.length === 0 ? (
                    <div className="products-empty">Không có kết quả tìm kiếm phù hợp!</div>
                  ) : null}
                  {/* Log dữ liệu (đã bọc trong Fragment) */}
                  {/* Map danh sách sản phẩm */}
                  {filteredItems.map((p) => {
                    const variants = p?.variants || [];
                    const firstVariant = variants[0] || null;
                    const image = (firstVariant?.images || [])[0] || "";

                    // Tính giá thấp nhất
                    const prices = variants
                      .map((v) => Number(v?.price || 0))
                      .filter((n) => Number.isFinite(n));
                    const price = prices.length ? Math.min(...prices) : 0;

                    // Xác định hình dạng card
                    const catName = category?.name || "";
                    const slug = (category && category.slug) || "";
                    const shouldSquare =
                      /nhấ?n|nhẫn|charm/i.test(catName) ||
                      /nhan|charm/i.test(slug);

                    return (
                      <ProductCard
                        key={p._id}
                        id={p._id}
                        slug={p.slug}
                        name={p.name}
                        price={price}
                        images={image}
                        isSquare={shouldSquare}
                        canEngrave={!!p?.engraving?.enabled}
                      />
                    );
                  })}
                </>
              )}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="load-more-container">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="load-more-button"
                  >
                    {loadingMore ? "Đang tải..." : "Xem thêm"}
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
