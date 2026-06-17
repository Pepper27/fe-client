import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../../../components/product-card/index";
import { api } from "../../../utils/api";
import "./index.scss";

const getSoldCount = (item) => {
  const totalSold = Number(item?.totalSold);
  if (Number.isFinite(totalSold) && totalSold > 0) return totalSold;

  const variantSold = Array.isArray(item?.variants)
    ? item.variants.reduce((sum, variant) => sum + Math.max(0, Number(variant?.sold) || 0), 0)
    : 0;
  return variantSold;
};

const sortBestSellers = (items) =>
  [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const soldDiff = getSoldCount(right) - getSoldCount(left);
    if (soldDiff !== 0) return soldDiff;
    return (Number(right?.priceMin) || 0) - (Number(left?.priceMin) || 0);
  });

export const ProductSignature = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate(); 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Prefer v1 unified product catalog. Fallback to legacy lists.
        let merged = [];
        try {
          const v1 = await api.getBestSellers({ page: 1, limit: 4 });
          merged = sortBestSellers(v1?.data || []);
        } catch {
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          merged = sortBestSellers([...(braceletsRes?.data || []), ...(charmsRes?.data || [])]);
        }
        if (cancelled) return;
        setItems(merged.slice(0, 4));
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const handleWatchNow = () => {
    navigate("/products/best-sellers"); 
  };
  return (
    <section className="product-signature-wrapper">
      <div className="container">
        <div className="signature-title-box">Sản Phẩm Bán Chạy</div>
        <div className="product-grid-layout">
          {items.map((item) => {
            const image = item.thumbnail?.[0] || item.variants?.[0]?.images?.[0] || "";
            const price = item.priceMin ?? item.variants?.[0]?.price ?? 0;
            return (
              <ProductCard
                key={item._id}
                id={item._id}
                slug={item.slug}
                name={item.name}
                price={price}
                images={image}
              />
            );
          })}
        </div>
       <div className="btnWatch">
         
          <button className="btn" onClick={handleWatchNow}>XEM NGAY</button>
        </div>
      </div>
    </section>
  );
};
