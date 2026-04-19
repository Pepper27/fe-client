import { useEffect, useState } from "react";
import { ProductCard } from "../../components/product-card";
import {
  getWishlist,
  setWishlist,
  subscribeWishlist,
  syncWishlistFromServer,
} from "../../utils/wishlist";
import "./index.scss";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState(() => getWishlist());
  const [serverItems, setServerItems] = useState(null);

  useEffect(() => {
    return subscribeWishlist((items) => {
      setWishlistItems(items);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    syncWishlistFromServer()
      .then((mapped) => {
        if (cancelled) return;
        // Keep rendering logic intact but also update local wishlist store.
        setWishlist(mapped);
        setServerItems(
          mapped.map((it) => ({
            productId: it.id,
            variantCode: "",
            product: {
              name: it.name,
              slug: it.slug,
              image: it.images,
              price: it.price,
            },
          })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        // Not logged in or endpoint unavailable: fallback to local wishlist.
        setServerItems(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const effective = Array.isArray(serverItems)
    ? serverItems.map((it) => ({
        id: it?.productId,
        slug: it?.product?.slug,
        name: it?.product?.name,
        price: it?.product?.price ?? 0,
        images: it?.product?.image || "",
      }))
    : wishlistItems;

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
