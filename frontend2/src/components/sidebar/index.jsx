// http://localhost:3000/client/product/product-list
import { useState } from "react";
import "./index.scss";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";

const sortOptions = [
  { label: "Sản phẩm nổi bật", value: "featured" },
  { label: "Giá: Thấp đến Cao", value: "price-asc" },
  { label: "Giá: Cao đến Thấp", value: "price-desc" },
  { label: "Sản phẩm mới nhất", value: "newest" },
];

const colors = [
  { name: "Đen", code: "#000000" },
  { name: "Không màu", code: "#FFFFFF", border: true },
  { name: "Vàng", code: "#FFFF00" },
  { name: "Hồng", code: "#FF007F" },
  { name: "Nâu", code: "#A52A2A" },
  { name: "Tím", code: "#800080" },
  { name: "Xanh", code: "#007BFF" },
  { name: "Bạc", code: "#C0C0C0" },
  { name: "Xanh lá cây", code: "#008000" },
  { name: "Đỏ", code: "#B22222" },
  { name: "Nhiều màu", gradient: "linear-gradient(45deg, black, yellow, green, purple)" },
];
const sizes = [
  { name: "one size", value: "one-size" },
  { name: "16", value: "16" },
  { name: "17", value: "17" },
  { name: "18", value: "18" },
  { name: "19", value: "19" },
  { name: "21", value: "21" },
  { name: "23", value: "23" },
  { name: "45", value: "45" },
  { name: "48", value: "48" },
  { name: "50", value: "50" },
  { name: "52", value: "52" },
  { name: "54", value: "54" },
  { name: "56", value: "56" },
  { name: "60", value: "60" },
];

export default function ProductListPage() {
  const [openCategory, setOpenCategory] = useState(true);
  const [openMaterial, setOpenMaterial] = useState(true);
  const [openTheme, setOpenTheme] = useState(false);
  const [openPrice, setOpenPrice] = useState(true);
  const [openColor, setOpenColor] = useState(true);
  const [openSize, setOpenSize] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const toggleColor = (name) => {
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleSize = (name) => {
    setSelectedSizes((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setSortOpen(false);
  };
  return (
    <>
      {/* <div className="container mx-auto">
        <Breadcrumb />
      </div> */}
      <div className="container mx-auto mt-[60px]">
        <div className="flex flex-col lg:flex-row gap-[30px]">
          <div className="w-full lg:w-[25%]">
            <div className="sidebar-panel">
              <div className={`sort-box ${sortOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="sort-trigger"
                  onClick={() => setSortOpen(!sortOpen)}
                >
                  <div className="content">
                    <p className="sort-label">Sắp xếp</p>
                    <p className="sort-value">{selectedSort.label}</p>
                  </div>
                  <MdKeyboardArrowRight className={`sort-icon ${sortOpen ? "rotate" : ""}`} />
                </button>
                {sortOpen && (
                  <ul className="sort-menu">
                    {sortOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          className={`sort-option ${selectedSort.value === option.value ? "active" : ""}`}
                          onClick={() => handleSortSelect(option)}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* category */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenCategory(!openCategory)}
                >
                  <h3 className="filter-section__title">Loại sản phẩm</h3>
                  <span className="filter-section__toggle">
                    {openCategory ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openCategory && (
                  <div className="filter-section__body">
                    {[
                      "Vòng tay",
                      "Nhẫn",
                      "Charm",
                      "Mặt dây chuyền",
                      "Khác",
                      "Dây chuyền",
                      "Hoa tai",
                    ].map((label) => (
                      <label className="filter-checkbox" key={label}>
                        <input type="checkbox" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Material */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenMaterial(!openMaterial)}
                >
                  <h3 className="filter-section__title">Chất liệu</h3>
                  <span className="filter-section__toggle">
                    {openMaterial ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openMaterial && (
                  <div className="filter-section__body">
                    {[
                      "Mạ vàng 14k",
                      "Bạc",
                      "Twotone",
                    ].map((label) => (
                      <label className="filter-checkbox" key={label}>
                        <input type="checkbox" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Color */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenColor(!openColor)}
                >
                  <h3 className="filter-section__title">Màu sắc</h3>
                  <span className="filter-section__toggle">
                    {openColor ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openColor && (
                  <div className="filter-section__body color-list">
                    {colors.map((color) => (
                      <button
                        type="button"
                        className="color-option"
                        key={color.name}
                        onClick={() => toggleColor(color.name)}
                      >
                        <span
                          className={`color-swatch ${
                            selectedColors.includes(color.name) ? "is-selected" : ""
                          }`}
                        >
                          <span
                            className="color-swatch__fill"
                            style={{
                              background: color.gradient ? color.gradient : color.code,
                            }}
                          />
                        </span>
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Theme */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenTheme(!openTheme)}
                >
                  <h3 className="filter-section__title">Chủ đề</h3>
                  <span className="filter-section__toggle">
                    {openTheme ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openTheme && (
                  <div className="filter-section__body">
                    {[
                      "Biểu tượng",
                      "Gia đình và bạn bè",
                      "Thiên nhiên và vũ trụ",
                      "Tình yêu",
                    ].map((label) => (
                      <label className="filter-checkbox" key={label}>
                        <input type="checkbox" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* End-Theme */}
              {/* Size */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenSize(!openSize)}
                >
                  <h3 className="filter-section__title">Size</h3>
                  <span className="filter-section__toggle">
                    {openSize ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openSize && (
                  <div className="filter-section__body size-grid">
                    {sizes.map((size) => (
                      <button
                        type="button"
                        key={size.name}
                        className={`size-pill ${
                          selectedSizes.includes(size.name) ? "is-selected" : ""
                        }`}
                        onClick={() => toggleSize(size.name)}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* End-Size */}
              {/* Price */}
              <div className="filter-section">
                <div
                  className="filter-section__header"
                  onClick={() => setOpenPrice(!openPrice)}
                >
                  <h3 className="filter-section__title">Mức giá</h3>
                  <span className="filter-section__toggle">
                    {openPrice ? <FaMinus /> : <FaPlus />}
                  </span>
                </div>
                {openPrice && (
                  <div className="filter-section__body">
                    {[
                      "Dưới 1.000.000đ",
                      "1.000.001đ - 2.500.000đ",
                      "2.500.001đ - 5.000.000đ",
                      "5.000.001đ - 7.000.000đ",
                      "Trên 7.000.001đ",
                    ].map((label) => (
                      <label className="filter-checkbox" key={label}>
                        <input type="checkbox" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* End-Price */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
