import { useEffect, useState } from "react";
import { ProductCard } from "../../components/product-card";
import { getWishlist, subscribeWishlist, syncWishlistFromServer } from "../../utils/wishlist";
import "./index.scss";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState(() => getWishlist());

  useEffect(() => {
    return subscribeWishlist((items) => {
      setWishlistItems(items);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Attempt to load server wishlist (if logged in) and copy it into local store.
    // We don't keep a separate serverItems state; local store (getWishlist())
    // is the single source of truth for rendering.
    syncWishlistFromServer().catch(() => {
      if (cancelled) return;
      // Not logged in or endpoint unavailable: do nothing, keep local wishlist.
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const effective = wishlistItems;

  return (
    <div className="container wishlist-page">
      {effective.length === 0 ? (
        <p className="wishlist-empty">Bạn chưa thêm sản phẩm yêu thích nào.</p>
      ) : (
        <div className="products-grid">
          {effective.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              name={item.name}
              price={item.price}
              images={item.images}
            />
          ))}
        </div>
      )}
    </div>
  );
}
