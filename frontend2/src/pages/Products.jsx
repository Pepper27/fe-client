import React, { useState } from "react";
import { FaCheck, FaMinus, FaPlus } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";

import Breadcrumb from "../components/Breadcrumb";
import { ProductItem } from "../components/product/ProductItem";
import { products } from "../data/products";

const colors = [
  { name: "Đen", code: "#000000" },
  { name: "Không màu", code: "#FFFFFF" },
  { name: "Vàng", code: "#FFFF00" },
  { name: "Hồng", code: "#FF007F" },
];

const sizes = [
  { name: "16" },
  { name: "17" },
  { name: "18" },
];

export default function ProductPage() {
  const [openCategory, setOpenCategory] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openSize, setOpenSize] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggle = (name) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((i) => i !== name)
        : [...prev, name]
    );
  };

  return (
    <div>
      {/* Banner */}
      <div className="relative flex bg-gray-300">
        <div className="absolute pl-[120px] py-[140px] w-[520px]">
          <span className="text-[30px]">Vòng tay</span>
        </div>
        <img
          src="/client/image/vongtay.jpg"
          alt="banner"
          className="w-full"
        />
      </div>

      <div className="container mx-auto">
        <Breadcrumb />
      </div>

      <div className="container mx-auto mt-10 flex gap-5">
        {/* FILTER */}
        <div className="w-1/4">
          {/* Category */}
          <div>
            <div onClick={() => setOpenCategory(!openCategory)}>
              Loại sản phẩm {openCategory ? <FaMinus /> : <FaPlus />}
            </div>
            {openCategory && <div>Vòng tay</div>}
          </div>

          {/* Color */}
          <div>
            <div onClick={() => setOpenColor(!openColor)}>
              Màu sắc {openColor ? <FaMinus /> : <FaPlus />}
            </div>

            {openColor &&
              colors.map((c) => (
                <div key={c.name} onClick={() => toggle(c.name)}>
                  {c.name} {selected.includes(c.name) && <FaCheck />}
                </div>
              ))}
          </div>

          {/* Size */}
          <div>
            <div onClick={() => setOpenSize(!openSize)}>
              Size {openSize ? <FaMinus /> : <FaPlus />}
            </div>

            {openSize &&
              sizes.map((s) => (
                <div key={s.name} onClick={() => toggle(s.name)}>
                  {s.name}
                </div>
              ))}
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="w-3/4 grid grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductItem
              key={p.id}
              id={p.id}
              name={p.name}
              price={p.price}
              images={p.variants?.[0]?.images?.[0]}
            />
          ))}
        </div>
      </div>

      {/* SLIDER */}
      <div className="container mx-auto mt-10">
        <Swiper
          slidesPerView={4}
          spaceBetween={10}
          navigation
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
        >
          {products.slice(0, 4).map((p) => (
            <SwiperSlide key={p.id}>
              <ProductItem
                id={p.id}
                name={p.name}
                price={p.price}
                images={p.variants?.[0]?.images?.[0]}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}