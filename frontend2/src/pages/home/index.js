import { Categories } from "./product-category-list";
import { ProductSignature } from "./product-signature";
import "./index.scss";
import { Navigation } from "swiper/modules";
import { ProductCard } from "../../components/product-card";
import { Swiper, SwiperSlide } from "swiper/react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { COMMITMENTS_DATA } from "../../data/commitment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Prefer v1 unified product catalog. Fallback to legacy lists.
        let merged = [];
        try {
          const v1 = await api.getProducts({ page: 1, limit: 40 });
          merged = v1?.data || [];
        } catch {
          const [braceletsRes, charmsRes] = await Promise.all([
            api.getBracelets({}),
            api.getCharms({}),
          ]);
          merged = [...(braceletsRes?.data || []), ...(charmsRes?.data || [])];
        }
        if (cancelled) return;
        setProducts(merged);

        // Always fetch collections from backend so ordering by createdAt is correct.
        try {
          const res = await api.getCollections({ limit: 4 });
          if (cancelled) return;
          const items = res?.data && Array.isArray(res.data) ? res.data : [];
          setCollections(items);
        } catch (e) {
          if (cancelled) return;
          console.error("Failed to load collections", e);
          setCollections([]);
        }
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ProductSignature />
      <Categories />
      {/* video */}
      <section className="container">
        <div className="video-section-wrapper">
          <div className="video-responsive-wrapper">
            <iframe
              className="video-iframe"
              src="https://www.youtube.com/embed/Tu1wDS_4vek?autoplay=1&mute=1&loop=1&playlist=Tu1wDS_4vek"
              title="Unlock your love with a Valentine's Day gift from Pandora"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
      {/* Pandora gợi ý */}
      <div className="container product-slider-wrapper">
        <div>
          <span className="slider-title">pandora gợi ý</span>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".custom-prev",
            nextEl: ".custom-next",
          }}
          slidesPerView={5}
          spaceBetween={5}
          slidesPerGroup={1}
          speed={600}
          grabCursor={true}
          className="pandoraSwiper"
          breakpoints={{
            320: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
        >
          {products.map((item) => {
            const firstVariant = (item?.variants || [])[0] || null;
            const image = (firstVariant?.images || [])[0] || "";
            const price = firstVariant?.price ?? 0;
            return (
              <SwiperSlide key={item._id}>
                <ProductCard
                  id={String(item._id)}
                  slug={item.slug}
                  name={item.name}
                  price={price}
                  images={image}
                />
              </SwiperSlide>
            );
          })}

          {/* NÚT ĐIỀU HƯỚNG */}
          <button className="custom-prev swiper-btn">
            <AiOutlineLeft />
          </button>

          <button className="custom-next swiper-btn">
            <AiOutlineRight />
          </button>
        </Swiper>
      </div>
      <section className="container">
        <div className="collection-promo-wrapper">
          <video
            className="promo-video"
            src="../client/image/vid.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="promo-content">
            <h2 className="promo-title">CHẠM YÊU THƯƠNG - KHẮC CẢM XÚC</h2>
            <p className="promo-description">
              Hãy để Pandora cùng bạn khắc ghi từng khoảnh khắc mùa hè với những
              thiết kế trang sức đầy cảm hứng – từ ánh vàng rực rỡ như nắng sớm
              đến những viên đá xanh biển như làn sóng vỗ về.
            </p>
            <p className="promo-description">
              Mỗi charm, mỗi vòng tay là một mảnh ghép kể nên câu chuyện cá
              nhân, để bạn đeo cả mùa hè trên cổ tay, và mang theo cảm xúc đi
              suốt hành trình...
            </p>
            <button className="promo-button">
              <span>KHÁM PHÁ NGAY</span>
            </button>
          </div>
        </div>
      </section>
      <section className="container discovery-wrapper">
        <span
          className="discovery-bg-text"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          KHÁM PHÁ
        </span>
        <img
          src="../client/image/logo.jpg"
          className="discovery-logo"
          alt="Logo Discovery"
          data-aos="fade-up"
          data-aos-delay="400"
        />
        {/* Grid 4 sản phẩm */}
        <div className="discovery-grid">
          {(collections || []).slice(0, 4).map((item, index) => {
            const key = item._id || item.id || index;
            const title = item.title || item.name || item.displayName || "";
            // Prefer array `images` field, then common string fields.
            let rawImage = null;
            if (Array.isArray(item.images) && item.images.length)
              rawImage = item.images[0];
            if (!rawImage)
              rawImage =
                item.avatar ||
                item.image ||
                item.coverImage ||
                item.banner ||
                item.thumbnail ||
                null;

            // Resolve URL: if absolute or root-relative use directly, otherwise fallback to provided string or placeholder
            const image =
              typeof rawImage === "string" && rawImage.trim()
                ? rawImage.match(/^https?:\/\//) || rawImage.startsWith("/")
                  ? rawImage
                  : rawImage
                : "../client/image/khampha.jpg";
            const slug = item.slug || item._id || "";
            return (
              <div
                key={key}
                className="discovery-item"
                data-aos="fade-up"
                data-aos-delay={200 * (index + 1)}
              >
                <div className="image-box">
                  <Link
                    to={`/products/collections/${encodeURIComponent(String(slug))}`}
                    aria-label={title}
                  >
                    <img src={image} alt={title} />
                  </Link>
                </div>
                <Link
                  className="item-title"
                  to={`/products/collections/${encodeURIComponent(String(slug))}`}
                >
                  {title}
                </Link>
                <div className="mt-button">
                  <Link
                    className="btn-link"
                    to={`/products/collections/${encodeURIComponent(String(slug))}`}
                  >
                    MUA NGAY
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="container commit-wrapper">
        {COMMITMENTS_DATA.map((item) => (
          <div key={item.id} className="commit-item">
            <div className="icon-box">
              <img src={item.icon} alt={item.title} />
            </div>
            <div className="commit-title">{item.title}</div>
            <div className="commit-desc">{item.description}</div>
          </div>
        ))}
      </section>
    </>
  );
};
