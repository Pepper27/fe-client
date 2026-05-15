import { Categories } from "./product-category-list";
import { ProductSignature } from "./product-signature";
import "./index.scss";
import { Navigation } from "swiper/modules";
import { ProductCard } from "../../components/product-card";
import { Swiper, SwiperSlide } from "swiper/react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../utils/api";

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [promoCollection, setPromoCollection] = useState(null);

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

        // Recently viewed (guest + logged in)
        try {
          const rv = await api.getRecentlyViewed({ limit: 20 });
          if (cancelled) return;
          setRecentlyViewed(Array.isArray(rv?.data) ? rv.data : []);
        } catch {
          if (cancelled) return;
          setRecentlyViewed([]);
        }

        // Blogs for discovery slider
        try {
          const b = await api.getBlogs({ page: 1, limit: 12 });
          if (cancelled) return;
          setBlogs(Array.isArray(b?.data) ? b.data : []);
        } catch {
          if (cancelled) return;
          setBlogs([]);
        }

        // Promo: newest collection that contains a video
        try {
          const resPromo = await api.getCollections({
            limit: 1,
            hasVideo: true,
          });
          if (cancelled) return;
          const promo =
            Array.isArray(resPromo?.data) && resPromo.data.length
              ? resPromo.data[0]
              : null;
          setPromoCollection(promo);
        } catch (e) {
          if (cancelled) return;
          setPromoCollection(null);
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
          {promoCollection?.video ? (
            <video
              className="promo-video"
              src={promoCollection.video}
              poster={
                promoCollection.poster || promoCollection.avatar || undefined
              }
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <video
              className="promo-video"
              src="../client/image/vid.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          <div className="promo-content">
            <h2 className="promo-title">
              {promoCollection?.name || "CHẠM YÊU THƯƠNG - KHẮC CẢM XÚC"}
            </h2>
            {promoCollection?.description ? (
              <div
                className="promo-description"
                dangerouslySetInnerHTML={{
                  __html: String(promoCollection.description),
                }}
              />
            ) : (
              <>
                <p className="promo-description">
                  Hãy để Pandora cùng bạn khắc ghi từng khoảnh khắc mùa hè với
                  những thiết kế trang sức đầy cảm hứng – từ ánh vàng rực rỡ như
                  nắng sớm đến những viên đá xanh biển như làn sóng vỗ về.
                </p>
                <p className="promo-description">
                  Mỗi charm, mỗi vòng tay là một mảnh ghép kể nên câu chuyện cá
                  nhân, để bạn đeo cả mùa hè trên cổ tay, và mang theo cảm xúc
                  đi suốt hành trình...
                </p>
              </>
            )}
            {promoCollection?.slug ? (
              <Link
                className="promo-button"
                to={`/products/collections/${encodeURIComponent(String(promoCollection.slug))}`}
              >
                <span>KHÁM PHÁ NGAY</span>
              </Link>
            ) : (
              <button className="promo-button" type="button">
                <span>KHÁM PHÁ NGAY</span>
              </button>
            )}
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
        {/* <img
          src="../client/image/logo.jpg"
          className="discovery-logo"
          alt="Logo Discovery"
          data-aos="fade-up"
          data-aos-delay="400"
        /> */}
        <h1 
          className="discovery-logoname"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          KIM BẢO JEWELRY
        </h1>
        {/* Bài viết (kéo ngang như mục đã xem) */}
        <div className="discovery-grid">
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".custom-prev-blog",
              nextEl: ".custom-next-blog",
            }}
            slidesPerView={4}
            spaceBetween={10}
            slidesPerGroup={1}
            speed={600}
            grabCursor={true}
            className="discoverySwiper"
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 12 },
              640: { slidesPerView: 2.2, spaceBetween: 12 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4 },
            }}
          >
            {(blogs || []).map((item, index) => {
              const key = item._id || item.id || index;
              const title = item.name || item.title || "";
              const rawImage = item.avatar || null;
              const image =
                typeof rawImage === "string" && rawImage.trim()
                  ? rawImage
                  : "../client/image/khampha.jpg";
              const slug = item.slug || item._id || "";
              return (
                <SwiperSlide key={key}>
                  <div
                    className="discovery-item"
                    data-aos="fade-up"
                    data-aos-delay={200 * (index + 1)}
                  >
                    <div className="image-box">
                      <Link
                        to={`/blogs/${encodeURIComponent(String(slug))}`}
                        aria-label={title}
                      >
                        <img src={image} alt={title} />
                      </Link>
                    </div>
                    <Link
                      className="item-title"
                      to={`/blogs/${encodeURIComponent(String(slug))}`}
                    >
                      {title}
                    </Link>
                    <div className="mt-button">
                      <Link
                        className="btn-link"
                        to={`/blogs/${encodeURIComponent(String(slug))}`}
                      >
                        ĐỌC NGAY
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}

            <button className="custom-prev-blog swiper-btn">
              <AiOutlineLeft />
            </button>
            <button className="custom-next-blog swiper-btn">
              <AiOutlineRight />
            </button>
          </Swiper>
        </div>
      </section>

      {recentlyViewed.length ? (
        <div className="container product-slider-wrapper">
          <div>
            <span className="slider-title">đã xem gần đây</span>
          </div>

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: ".custom-prev-recent",
              nextEl: ".custom-next-recent",
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
            {recentlyViewed.map((it) => {
              const p = it?.product || {};
              return (
                <SwiperSlide key={String(it?._id || it?.productId)}>
                  <ProductCard
                    id={String(it?.productId)}
                    slug={p.slug}
                    name={p.name}
                    price={p.price ?? 0}
                    images={p.image || ""}
                  />
                </SwiperSlide>
              );
            })}

            <button className="custom-prev-recent swiper-btn">
              <AiOutlineLeft />
            </button>

            <button className="custom-next-recent swiper-btn">
              <AiOutlineRight />
            </button>
          </Swiper>
        </div>
      ) : null}
    </>
  );
};
