import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";
import "../../components/banner/index.scss";

export const BannerImage = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Newest collections first (backend sorts by createdAt desc).
        const res = await api.getCollections({ limit: 6 });
        if (cancelled) return;
        const items = Array.isArray(res?.data) ? res.data : [];
        setCollections(items);
      } catch (e) {
        if (cancelled) return;
        // Keep banner usable even if API fails.
        setCollections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackImages = [
    { id: "fb-1", image: "/image/README.jpg" },
    { id: "fb-2", image: "/image/banner1.jpg" },
    { id: "fb-3", image: "/image/banner2.jpg" },
    { id: "fb-4", image: "/image/README.jpg" },
  ];

  const slides =
    collections && collections.length
      ? collections.map((c) => ({
          id: String(c._id || c.id || c.slug || ""),
          title: c.name || c.title || "Collection",
          slug: c.slug || String(c._id || ""),
          image: c.avatar || "/image/banner1.jpg",
        }))
      : fallbackImages.map((x) => ({ ...x, title: "Banner", slug: null }));
  return (
    <>
      <Swiper
        spaceBetween={30}
        effect={"fade"}
        navigation={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        className="mySwiper"
      >
        {slides.map((item) => {
          const img = (
            <img src={item.image} alt={item.title} className="image" />
          );

          return (
            <SwiperSlide key={item.id}>
              {item.slug ? (
                <Link
                  to={`/products/collections/${encodeURIComponent(String(item.slug))}?banner=${encodeURIComponent(String(item.image))}&title=${encodeURIComponent(String(item.title))}`}
                  aria-label={item.title}
                >
                  {img}
                </Link>
              ) : (
                img
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};
