import { useEffect, useState } from "react";
import { ProductCard } from "../../components/product-card";
import { getWishlist, subscribeWishlist } from "../../utils/wishlist";
import "./index.scss";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState(() => getWishlist());

  useEffect(() => {
    return subscribeWishlist((items) => {
      setWishlistItems(items);
    });
  }, []);

  return (
    <div className="container wishlist-page">
      {wishlistItems.length === 0 ? (
        <p className="wishlist-empty">Bạn chưa thêm sản phẩm yêu thích nào.</p>
      ) : (
        <div className="products-grid">
          {wishlistItems.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
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