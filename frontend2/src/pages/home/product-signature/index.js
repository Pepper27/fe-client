import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../../../components/product-card/index";
import { api } from "../../../utils/api";
import "./index.scss";

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
          merged = v1?.data || [];
        } catch {
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          merged = [...(braceletsRes?.data || []), ...(charmsRes?.data || [])];
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
            const firstVariant = (item?.variants || [])[0] || null;
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
