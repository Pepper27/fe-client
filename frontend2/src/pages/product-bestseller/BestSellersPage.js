import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProductCard } from "../../components/product-card";
import Sidebar from "../../components/sidebar";
import { api } from "../../utils/api";
import "./bestseller.scss"; 

function BestSellersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSort, setActiveSort] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({});
  const location = useLocation();

  const fetchBestSellers = async (currentPage, isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await api.getBestSellers({
        page: currentPage,
        limit: 24,
      });

      const productsData = res?.data || [];
      const totalPages = res?.meta?.totalPages || 1;

      if (isLoadMore) {
        setItems((prev) => [...prev, ...productsData]);
      } else {
        setItems(productsData);
        // Lưu filter nếu backend có trả về gợi ý filter cho hàng bán chạy
        if (res?.filters) setAvailableFilters(res.filters);
      }

      setHasMore(currentPage < totalPages);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Khởi tạo dữ liệu
  useEffect(() => {
    setPage(1);
    fetchBestSellers(1);
  }, [location.search]);

  // Xử lý Client-side Filtering & Sorting (tương tự ProductsPage)
  useEffect(() => {
    let next = Array.isArray(items) ? items.slice() : [];

    // Sorting logic
    if (activeSort?.value) {
      switch (activeSort.value) {
        case "price-asc":
          next.sort((a, b) => (a.priceMin || 0) - (b.priceMin || 0));
          break;
        case "price-desc":
          next.sort((a, b) => (b.priceMin || 0) - (a.priceMin || 0));
          break;
        default:
          break;
      }
    }
    setFilteredItems(next);
  }, [items, activeFilters, activeSort]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBestSellers(nextPage, true);
  };

  const handleFiltersChange = useCallback((filters) => setActiveFilters(filters || {}), []);
  const handleSortChange = useCallback((sort) => setActiveSort(sort || null), []);

  return (
    <div className="products-page best-sellers-page">
      <div className="products-banner">
        <img src="/client/image/vongtay.jpg" alt="Best Sellers" className="w-full h-full object-cover" />
        <div className="banner-overlay">
            <h1>SẢN PHẨM BÁN CHẠY</h1>
            <p>Những thiết kế được yêu thích nhất xu hướng 2026</p>
        </div>
      </div>

      <div className="container products-inner">
        <nav className="products-breadcrumb">
          <Link className="products-breadcrumb__link" to="/">Trang chủ</Link>
          <span className="products-breadcrumb__sep">›</span>
          <span className="products-breadcrumb__current">Bán chạy nhất</span>
        </nav>

        <div className="products-layout">
          <aside className="sidebar">
            <Sidebar
              availableFilters={availableFilters}
              onFiltersChange={handleFiltersChange}
              onSortChange={handleSortChange}
              hideCategoryFilter={true} // Ẩn lọc danh mục nếu không cần thiết
            />
          </aside>

          <main className="products-content">
            {loading && page === 1 ? (
              <div className="loading-initial">Đang tìm sản phẩm hot...</div>
            ) : (
              <div className="products-grid">
                {filteredItems.map((p) => (
                  <ProductCard
                    key={p._id}
                    id={p._id}
                    slug={p.slug}
                    name={p.name}
                    price={p.priceMin || (p.variants?.[0]?.price) || 0}
                    images={p.thumbnail || p.variants?.[0]?.images?.[0] || ""}
                    isSquare={true} // Thường best seller nên để đồng nhất layout
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="load-more-container">
                <button onClick={handleLoadMore} disabled={loadingMore} className="load-more-button">
                  {loadingMore ? "Đang tải..." : "Xem thêm sản phẩm"}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default BestSellersPage;