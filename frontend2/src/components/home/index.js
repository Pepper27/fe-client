import { Categories } from "./product-category-list"
import { ProductSignature } from "./product-signature"
import "./index.scss";
import { Navigation } from "swiper/modules";
import { products } from "../../data/product";
import { ProductCard } from "../product-card";
import { Swiper, SwiperSlide } from 'swiper/react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { COMMITMENTS_DATA } from "../../data/commitment";

export const Home = () => {
  const discoveryItems = [
    { id: 1, title: "MÙA HÈ RỰC RỠ", image: "../client/image/khampha.jpg" },
    { id: 2, title: "MÙA HÈ RỰC RỠ", image: "../client/image/khampha.jpg" },
    { id: 3, title: "MÙA HÈ RỰC RỠ", image: "../client/image/khampha.jpg" },
    { id: 4, title: "MÙA HÈ RỰC RỠ", image: "../client/image/khampha.jpg" },
  ];
  return (
    < >
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
            nextEl: ".custom-next"
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
          {products.map((item) => (
            <SwiperSlide key={item.id}>
              <ProductCard
                id={String(item.id)}
                name={item.name}
                price={item.price}
                images={item.variants?.[0]?.images?.[0] || item.images}
              />
            </SwiperSlide>
          ))}

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
            <h2 className="promo-title">
              CHẠM YÊU THƯƠNG - KHẮC CẢM XÚC
            </h2>
            <p className="promo-description">
              Hãy để Pandora cùng bạn khắc ghi từng khoảnh khắc mùa hè với những thiết kế trang sức đầy cảm hứng – từ ánh vàng rực rỡ như nắng sớm đến những viên đá xanh biển như làn sóng vỗ về.
            </p>
            <p className="promo-description">
              Mỗi charm, mỗi vòng tay là một mảnh ghép kể nên câu chuyện cá nhân, để bạn đeo cả mùa hè trên cổ tay, và mang theo cảm xúc đi suốt hành trình...
            </p>
            <button className="promo-button">
              <span>KHÁM PHÁ NGAY</span>
            </button>
          </div>
        </div>
      </section>
      <section className="container discovery-wrapper">
        <span className="discovery-bg-text" data-aos="fade-up" data-aos-delay="200">
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
          {discoveryItems.map((item, index) => (
            <div
              key={item.id}
              className="discovery-item"
              data-aos="fade-up"
              data-aos-delay={200 * (index + 1)}
            >
              <div className="image-box">
                <img src={item.image} alt={item.title} />
              </div>
              <span className="item-title">{item.title}</span>
              <div className="mt-button">
                <button className="btn-link">MUA NGAY</button>
              </div>
            </div>
          ))}
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
  )
}