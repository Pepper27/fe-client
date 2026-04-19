import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlinePencil } from "react-icons/hi2";
import {
  isInWishlist,
  subscribeWishlist,
  toggleWishlistItem,
  toggleWishlistItemApi,
} from "../../utils/wishlist";
import "./index.scss";

export const ProductCard = ({ id, slug, name, price, images, isSquare }) => {
  const productPayload = useMemo(
    // Persist slug in wishlist so detail pages can navigate by slug.
    () => ({
      id: String(id),
      slug: slug ? String(slug) : undefined,
      name,
      price,
      images,
    }),
    [id, slug, images, name, price],
  );
  const [liked, setLiked] = useState(() => isInWishlist(productPayload.id));
  const navigate = useNavigate();

  useEffect(() => {
    setLiked(isInWishlist(productPayload.id));
  }, [productPayload.id]);

  useEffect(() => {
    return subscribeWishlist((items) => {
      const active = items.some(
        (item) => String(item.id) === productPayload.id,
      );
      setLiked(active);
    });
  }, [productPayload.id]);

  return (
    <button
      type="button"
      className="product-item-link"
      onClick={() =>
        navigate(`/product/${encodeURIComponent(String(slug || id))}`)
      }
    >
      <div className={`product-item-container ${isSquare ? 'is-square' : ''}`}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Try server wishlist (cookie auth) and fallback to local.
            toggleWishlistItemApi(productPayload)
              .then((nextLiked) => setLiked(!!nextLiked))
              .catch(() => {
                const nextLiked = toggleWishlistItem(productPayload);
                setLiked(nextLiked);
              });
          }}
          className={`like-button ${liked ? "liked" : "unliked"}`}
          aria-pressed={liked}
          aria-label={liked ? "Bỏ thích sản phẩm" : "Thêm vào wishlist"}
        >
          <svg
            viewBox="0 0 24 24"
            className="heart-icon"
            role="img"
            aria-hidden="true"
            fill={liked ? "currentColor" : "none"}
            stroke={liked ? "none" : "currentColor"}
            strokeWidth="2"
          >
            <title>
              {liked ? "Đã thêm vào wishlist" : "Thêm vào wishlist"}
            </title>
            <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
          </svg>
        </button>

        {/* IMAGE */}
        <div className="image-wrapper">
          <img src={images} alt={name} className="product-image" />
          <button
            className="quick-view-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Quick view ->", id);
            }}
            aria-label={`Xem nhanh ${name}`}
          >
            <span className="quick-view-text">Xem ngay</span>
          </button>
        </div>

        {/* INFO */}
        <div className="customization-tag">
          <HiOutlinePencil />
          <span className="message-tag">khắc thông điệp</span>
        </div>
        <p className="product-name-card">{name}</p>
        <p className="product-price">{price}</p>
      </div>
    </button>
  );
};
