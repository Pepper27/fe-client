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
import { formatPrice } from "../../utils/format";

const resolveImageSrc = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = resolveImageSrc(item);
      if (nested) return nested;
    }
    return "";
  }
  if (typeof value === "object") {
    return resolveImageSrc(
      value.url || value.secure_url || value.src || value.path || value.image || value.thumbnail,
    );
  }
  return "";
};

export const ProductCard = ({ id, slug, name, price, images, isSquare, canEngrave }) => {
  const imageSrc = useMemo(() => resolveImageSrc(images), [images]);
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
    <div
      className="product-item-link"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${encodeURIComponent(String(slug || id))}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/product/${encodeURIComponent(String(slug || id))}`);
        }
      }}
    >
      <div className={`product-item-container ${isSquare ? 'is-square' : ''}`}>
        {/* IMAGE */}
        <div className="image-wrapper">
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
          {imageSrc ? <img src={imageSrc} alt={name} className="product-image" /> : null}
        </div>

        {/* INFO */}
        {canEngrave ? (
          <div className="customization-tag">
            <HiOutlinePencil />
            <span className="message-tag">khắc thông điệp</span>
          </div>
        ) : null}
        <p className="product-name-card">{name}</p>
        <p className="product-price">{formatPrice(price)}</p>
      </div>
    </div>
  );
};
