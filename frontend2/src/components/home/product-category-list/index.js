import React, { useEffect, useState } from "react";
import { CATEGORIES_DATA } from "../../../data/category";
import { CategoryCard } from "./category-card";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.scss";
import { api } from "../../../utils/api";

export const Categories = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
    AOS.refresh();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getCategories({ root: 1 });
        if (cancelled) return;
        const cats = Array.isArray(res?.data) ? res.data : [];
        setItems(
          cats.map((c) => ({
            id: c?._id || c?.id,
            name: c?.name || "",
            slug: c?.slug || "",
            image: c?.avatar || "/client/image/new.png",
          })),
        );
      } catch (e) {
        if (cancelled) return;
        // BE may not have /api/public/categories yet.
        console.warn("Category API failed, fallback to static data", e);
        setItems(CATEGORIES_DATA);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="container">
      <div className="categories-wrapper">
        <div data-aos="fade-up" className="categories-grid">
          {items
            .filter((it) => String(it?.name || "").trim().toLowerCase() !== "trang sức")
            .map((item, i) => (
              <div key={item.id || i} data-aos="fade-up" data-aos-delay={i * 200}>
                <CategoryCard image={item.image} name={item.name} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
