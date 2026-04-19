// http://localhost:3000/client/product/product-list
import { useState, useEffect } from "react";
import "./index.scss";
import { api } from "../../utils/api";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";

const sortOptions = [
  { label: "Sản phẩm nổi bật", value: "featured" },
  { label: "Giá: Thấp đến Cao", value: "price-asc" },
  { label: "Giá: Cao đến Thấp", value: "price-desc" },
  { label: "Sản phẩm mới nhất", value: "newest" },
];

// Default filter sections & options used as fallback when category metadata is absent
const DEFAULT_VISIBLE_FILTERS = [
  "category",
  "material",
  "color",
  "theme",
  "size",
  "price",
];

const DEFAULT_FILTER_OPTIONS = {
  material: ["Mạ vàng 14k", "Bạc", "Twotone"],
  color: [
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
  ],
  size: [
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
  ],
  category: [
    "Vòng tay",
    "Nhẫn",
    "Charm",
    "Mặt dây chuyền",
    "Khác",
    "Dây chuyền",
    "Hoa tai",
  ],
  theme: ["Biểu tượng", "Gia đình và bạn bè", "Thiên nhiên và vũ trụ", "Tình yêu"],
  price: [
    "Dưới 1.000.000đ",
    "1.000.001đ - 2.500.000đ",
    "2.500.001đ - 5.000.000đ",
    "5.000.001đ - 7.000.000đ",
    "Trên 7.000.001đ",
  ],
};

const colors = DEFAULT_FILTER_OPTIONS.color;
const sizes = DEFAULT_FILTER_OPTIONS.size;

export default function Sidebar({ category: categoryProp, onFiltersChange, onSortChange }) {
  // Sidebar UI state: use maps so adding/removing sections is easy
  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    DEFAULT_VISIBLE_FILTERS.forEach((k) => (init[k] = true));
    return init;
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [attrOptions, setAttrOptions] = useState({ materials: [], colors: [], sizes: [], themes: [], collections: [] });

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleOption = (filterKey, value) => {
    setSelectedFilters((prev) => {
      const cur = new Set(prev[filterKey] || []);
      if (cur.has(value)) cur.delete(value); else cur.add(value);
      return { ...prev, [filterKey]: Array.from(cur) };
    });
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setSortOpen(false);
  };

  // Load attribute options from server on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [matRes, colorRes, sizeRes, themeRes, collRes] = await Promise.all([
          api.getMaterials().catch(() => ({ data: [] })),
          api.getColors().catch(() => ({ data: [] })),
          api.getSizes().catch(() => ({ data: [] })),
          api.getThemes().catch(() => ({ data: [] })),
          api.getCollections().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setAttrOptions({
          materials: Array.isArray(matRes?.data) ? matRes.data : [],
          colors: Array.isArray(colorRes?.data) ? colorRes.data : [],
          sizes: Array.isArray(sizeRes?.data) ? sizeRes.data : [],
          themes: Array.isArray(themeRes?.data) ? themeRes.data : [],
          collections: Array.isArray(collRes?.data) ? collRes.data : [],
        });
      } catch (e) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // notify parent about filters/sort changes (map to backend shape and sync to URL)
  useEffect(() => {
    if (typeof onFiltersChange !== "function") return;

    // Map selectedFilters (which currently hold labels or ids) to backend shape.
    const mapToBackend = () => {
      const out = {};
      const mapArray = (key) => {
        const vals = selectedFilters[key] || [];
        if (!vals || !vals.length) return undefined;
        const list = attrOptions[key === 'material' ? 'materials' : key === 'collection' ? 'collections' : `${key}s`] || [];
        return vals.map((v) => {
          const found = list.find((it) => String(it._id) === String(v) || String(it.name || it).toLowerCase() === String(v).toLowerCase());
          return found ? String(found._id || found.id) : String(v);
        });
      };

      const mat = mapArray('material'); if (mat) out.materials = mat;
      const col = mapArray('color'); if (col) out.colors = col;
      const sz = mapArray('size'); if (sz) out.sizes = sz;
      const th = mapArray('theme'); if (th) out.themes = th;
      const coll = mapArray('collection'); if (coll) out.collections = coll;

      if (Array.isArray(selectedFilters.price) && selectedFilters.price.length) {
        const label = selectedFilters.price[0];
        if (label.indexOf("Dưới") === 0) {
          const n = Number(label.replace(/[^0-9]/g, "")) || 0;
          out.price = { min: 0, max: n };
        } else if (label.indexOf("Trên") === 0) {
          const n = Number(label.replace(/[^0-9]/g, "")) || 0;
          out.price = { min: n, max: Number.MAX_SAFE_INTEGER };
        } else {
          const parts = label.split("-").map((s) => Number(String(s).replace(/[^0-9]/g, "")));
          if (parts.length === 2) out.price = { min: parts[0], max: parts[1] };
        }
      }

      return out;
    };

    const backendFilters = mapToBackend();

    // Avoid calling parent if filters did not change (prevent infinite loops)
    try {
      const serialized = JSON.stringify(backendFilters || {});
      // store last serialized filters in a ref so it persists across renders
      if (!Sidebar._lastFilters) Sidebar._lastFilters = serialized;
      if (Sidebar._lastFilters === serialized) {
        // still same, but ensure URL is consistent — only replace when it differs
        try {
          const qs = new URLSearchParams(window.location.search || "");
          if (backendFilters && Object.keys(backendFilters).length) qs.set('filters', serialized);
          else qs.delete('filters');
          const newSearch = qs.toString() ? `?${qs.toString()}` : '';
          if (newSearch !== window.location.search) window.history.replaceState({}, '', `${window.location.pathname}${newSearch}`);
        } catch (e) {
          // ignore URL errors
        }
        return; // nothing changed
      }

      // Update the stored serialized filters and proceed
      Sidebar._lastFilters = serialized;
    } catch (e) {
      // fallback: continue
    }

    // Sync to URL but only when it changes
    try {
      const qs = new URLSearchParams(window.location.search || "");
      if (backendFilters && Object.keys(backendFilters).length) {
        qs.set('filters', JSON.stringify(backendFilters));
      } else {
        qs.delete('filters');
      }
      const newSearch = qs.toString() ? `?${qs.toString()}` : '';
      if (newSearch !== window.location.search) window.history.replaceState({}, '', `${window.location.pathname}${newSearch}`);
    } catch (e) {
      // ignore
    }

    onFiltersChange(backendFilters);
  }, [selectedFilters, attrOptions, onFiltersChange]);

  useEffect(() => {
    if (typeof onSortChange === "function") onSortChange(selectedSort);
  }, [selectedSort, onSortChange]);

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
              {/* Render filter sections based on category metadata or defaults */}
              {(() => {
                const visible = Array.isArray(categoryProp?.visibleFilters) && categoryProp.visibleFilters.length
                  ? categoryProp.visibleFilters
                  : DEFAULT_VISIBLE_FILTERS;

                const getOptions = (key) => {
                  const fromCategory = categoryProp?.filterOptions?.[key];
                  if (Array.isArray(fromCategory)) return fromCategory;
                  // If we have server-provided attribute lists, use them for accurate ids/names
                  switch (key) {
                    case 'material': return attrOptions.materials.length ? attrOptions.materials : (DEFAULT_FILTER_OPTIONS.material || []);
                    case 'color': return attrOptions.colors.length ? attrOptions.colors : (DEFAULT_FILTER_OPTIONS.color || []);
                    case 'size': return attrOptions.sizes.length ? attrOptions.sizes : (DEFAULT_FILTER_OPTIONS.size || []);
                    case 'theme': return attrOptions.themes.length ? attrOptions.themes : (DEFAULT_FILTER_OPTIONS.theme || []);
                    case 'collection': return attrOptions.collections.length ? attrOptions.collections : (DEFAULT_FILTER_OPTIONS.collection || []);
                    default: return DEFAULT_FILTER_OPTIONS[key] || [];
                  }
                };

                const isSelected = (key, value) => (selectedFilters[key] || []).includes(value);

                const renderSection = (key) => {
                  const opts = getOptions(key);
                  const open = openSections[key] !== false; // default true
                  switch (key) {
                    case 'category':
                    case 'material':
                    case 'collection':
                    case 'theme':
                    case 'classification':
                    case 'price':
                      return (
                        <div className="filter-section" key={key}>
                          <div className="filter-section__header" onClick={() => toggleSection(key)}>
                            <h3 className="filter-section__title">{key === 'material' ? 'Chất liệu' : key === 'price' ? 'Mức giá' : key === 'category' ? 'Loại sản phẩm' : key === 'theme' ? 'Chủ đề' : key === 'collection' ? 'Bộ sưu tập' : 'Phân loại'}</h3>
                            <span className="filter-section__toggle">{open ? <FaMinus /> : <FaPlus />}</span>
                          </div>
                          {open && (
                            <div className="filter-section__body">
                              {(opts || []).map((label) => {
                                // label may be object { _id, name } or string
                                const value = (label && (label._id || label.id)) ? String(label._id || label.id) : String(label);
                                const display = (label && (label.name || label.title)) ? (label.name || label.title) : String(label);
                                return (
                                  <label className="filter-checkbox" key={value}>
                                    <input type="checkbox" checked={isSelected(key, value)} onChange={() => toggleOption(key, value)} />
                                    <span>{display}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    case 'color':
                      return (
                        <div className="filter-section" key={key}>
                          <div className="filter-section__header" onClick={() => toggleSection(key)}>
                            <h3 className="filter-section__title">Màu sắc</h3>
                            <span className="filter-section__toggle">{open ? <FaMinus /> : <FaPlus />}</span>
                          </div>
                          {open && (
                            <div className="filter-section__body color-list">
                              {(opts || []).map((color) => {
                                const value = (color && (color._id || color.id)) ? String(color._id || color.id) : String(color.name || color);
                                const name = color.name || color;
                                const selected = isSelected(key, value);
                                return (
                                  <button type="button" className="color-option" key={value} onClick={() => toggleOption(key, value)}>
                                    <span className={`color-swatch ${selected ? 'is-selected' : ''}`}>
                                      <span className="color-swatch__fill" style={{ background: color.gradient ? color.gradient : color.code }} />
                                    </span>
                                    <span>{name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    case 'size':
                      return (
                        <div className="filter-section" key={key}>
                          <div className="filter-section__header" onClick={() => toggleSection(key)}>
                            <h3 className="filter-section__title">Size</h3>
                            <span className="filter-section__toggle">{open ? <FaMinus /> : <FaPlus />}</span>
                          </div>
                          {open && (
                            <div className="filter-section__body size-grid">
                              {(opts || []).map((s) => {
                                const value = (s && (s._id || s.id)) ? String(s._id || s.id) : String(s.name || s);
                                const name = s.name || s;
                                const selected = isSelected(key, value);
                                return (
                                  <button type="button" key={value} className={`size-pill ${selected ? 'is-selected' : ''}`} onClick={() => toggleOption(key, value)}>
                                    {name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    default:
                      return null;
                  }
                };

                return visible.map((k) => renderSection(k));
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
