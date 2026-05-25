// http://localhost:3000/client/product/product-list
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  "collection",
  "size",
  "price",
];

const DEFAULT_FILTER_OPTIONS = {
  material: ["Mạ vàng 14k", "Mạ vàng hồng 14k", "Bạc"],
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
    {
      name: "Nhiều màu",
      gradient: "linear-gradient(45deg, black, yellow, green, purple)",
    },
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
  theme: [
    "Biểu tượng",
    "Gia đình và bạn bè",
    "Thiên nhiên và vũ trụ",
    "Tình yêu",
  ],
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

export default function Sidebar({
  category: categoryProp,
  availableFilters,
  onFiltersChange,
  onSortChange,
}) {
  const COLOR_NAME_MAP = {
    do: "#e74c3c",
    red: "#e74c3c",
    vang: "#f3d29a",
    yellow: "#f3d29a",
    gold: "#f3d29a",
    hong: "#ff9db5",
    pink: "#ff9db5",
    bac: "#d6d6d6",
    silver: "#d6d6d6",
    trang: "#ffffff",
    white: "#ffffff",
    den: "#000000",
    black: "#000000",
    xanh: "#3498db",
    blue: "#3498db",
    xanhbien: "#3498db",
    tim: "#9b59b6",
    purple: "#9b59b6",
    cam: "#f39c12",
    orange: "#f39c12",
    xanhluc: "#27ae60",
    xanhla: "#27ae60",
    green: "#27ae60",
    nau: "#8b4513",
    brown: "#8b4513",
    xam: "#808080",
    gray: "#808080",
    vanghong: "#eec1ad",
    rosegold: "#eec1ad",
  };

  const normalizeColorNameKey = (s) => {
    if (!s) return "";
    return String(s)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      // Vietnamese special letter
      .replace(/đ/g, "d")
      // keep letters/numbers only for loose matching
      .replace(/[^a-z0-9]+/g, "");
  };

  const normalizeCssColor = (v) => {
    if (!v) return "";
    const s = String(v).trim();
    // API sometimes returns hex without leading '#'
    if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s}`;
    return s;
  };

  const getColorFill = (color) => {
    if (!color) return "";
    // When options are plain strings (eg. "Đỏ"), treat as name-only.
    if (typeof color === "string") {
      const key = normalizeColorNameKey(color);
      if (!key) return "";
      if (COLOR_NAME_MAP[key]) return COLOR_NAME_MAP[key];
      for (const [k, v] of Object.entries(COLOR_NAME_MAP)) {
        if (key.includes(k)) return v;
      }
      return "";
    }
    if (color.gradient) return String(color.gradient);
    // Be defensive about API field names
    const raw =
      color.code ||
      color.hex ||
      color.hexCode ||
      color.color ||
      color.colorCode ||
      color.value;
    const direct = normalizeCssColor(raw);
    if (direct) return direct;

    // Fallback: if API only returns name/label, map common names to colors.
    const name = color.name || color.label || "";
    const key = normalizeColorNameKey(name);
    if (!key) return "";

    // Exact match first
    if (COLOR_NAME_MAP[key]) return COLOR_NAME_MAP[key];

    // Contains match (eg. "xanh bien", "vang hong")
    for (const [k, v] of Object.entries(COLOR_NAME_MAP)) {
      if (key.includes(k)) return v;
    }
    return "";
  };
  const navigate = useNavigate();
  const location = useLocation();
  // Sidebar UI state: use maps so adding/removing sections is easy
  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    DEFAULT_VISIBLE_FILTERS.forEach((k) => (init[k] = true));
    return init;
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [selectedFilters, setSelectedFilters] = useState(() => {
    // Initialize filters from URL parameters
    try {
      const qs = new URLSearchParams(window.location.search || "");
      const filtersParam = qs.get("filters");
      if (filtersParam) {
        const parsed = JSON.parse(filtersParam);
        const normalized = {};

        // Normalize backend format to frontend format
        if (parsed.categories) {
          normalized.category = parsed.categories.map(String);
        }
        if (parsed.materials) {
          normalized.material = parsed.materials.map(String);
        }
        if (parsed.colors) {
          normalized.color = parsed.colors.map(String);
        }
        if (parsed.sizes) {
          normalized.size = parsed.sizes.map(String);
        }
        if (parsed.themes) {
          normalized.theme = parsed.themes.map(String);
        }
        if (parsed.collections) {
          normalized.collection = parsed.collections.map(String);
        }
        if (parsed.price) {
          // Convert price object back to label
          const { min, max } = parsed.price;
          let priceLabel = "";

          if (min === 0) {
            priceLabel = `Dưới ${max.toLocaleString("vi-VN")}đ`;
          } else if (max === Number.MAX_SAFE_INTEGER) {
            priceLabel = `Trên ${min.toLocaleString("vi-VN")}đ`;
          } else {
            priceLabel = `${min.toLocaleString("vi-VN")}đ - ${max.toLocaleString("vi-VN")}đ`;
          }

          normalized.price = [priceLabel];
        }

        return normalized;
      }
    } catch (e) {
      // Ignore URL parse errors
    }
    return {};
  });
  const [attrOptions, setAttrOptions] = useState({
    materials: availableFilters?.materials || [],
    colors: availableFilters?.colors || [],
    sizes: availableFilters?.sizes || [],
    themes: availableFilters?.themes || [],
    collections: availableFilters?.collections || [],
    categories: availableFilters?.categories || [],
  });

  // Sync selectedFilters with URL so sidebar reflects current search params
  useEffect(() => {
    try {
      const qs = new URLSearchParams(location.search || "");
      const filtersParam = qs.get("filters");
      if (filtersParam) {
        const parsed = JSON.parse(filtersParam);
        const normalized = {};

        if (parsed.categories)
          normalized.category = parsed.categories.map(String);
        if (parsed.materials)
          normalized.material = parsed.materials.map(String);
        if (parsed.colors) normalized.color = parsed.colors.map(String);
        if (parsed.sizes) normalized.size = parsed.sizes.map(String);
        if (parsed.themes) normalized.theme = parsed.themes.map(String);
        if (parsed.collections)
          normalized.collection = parsed.collections.map(String);
        if (parsed.price) {
          const { min, max } = parsed.price;
          let priceLabel = "";
          if (min === 0)
            priceLabel = `Dưới ${Number(max).toLocaleString("vi-VN")}đ`;
          else if (max === Number.MAX_SAFE_INTEGER)
            priceLabel = `Trên ${Number(min).toLocaleString("vi-VN")}đ`;
          else
            priceLabel = `${Number(min).toLocaleString("vi-VN")}đ - ${Number(max).toLocaleString("vi-VN")}đ`;
          normalized.price = [priceLabel];
        }
        setSelectedFilters(normalized);
        return;
      }

      // No legacy filters JSON — parse short params
      const short = Object.fromEntries(qs.entries());
      const newSel = {};
      if (short.type) {
        // If URL has both type and categorySlug and they are the same, treat it as
        // navigation (parent category listing) instead of an explicit category filter.
        const tp = String(short.type || "")
          .trim()
          .toLowerCase();
        const cs = String(short.categorySlug || "")
          .trim()
          .toLowerCase();
        if (!cs || tp !== cs) {
          newSel.category = String(short.type)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      if (short.material)
        newSel.material = String(short.material)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (short.color)
        newSel.color = String(short.color)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (short.size)
        newSel.size = String(short.size)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (short.collection)
        newSel.collection = String(short.collection)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      if (short.min || short.max) {
        const min = Number(short.min || 0),
          max = short.max ? Number(short.max) : Number.MAX_SAFE_INTEGER;
        if (min === 0) newSel.price = [`Dưới ${max.toLocaleString("vi-VN")}đ`];
        else if (max === Number.MAX_SAFE_INTEGER)
          newSel.price = [`Trên ${min.toLocaleString("vi-VN")}đ`];
        else
          newSel.price = [
            `${min.toLocaleString("vi-VN")}đ - ${max.toLocaleString("vi-VN")}đ`,
          ];
      }
      setSelectedFilters(newSel);
    } catch (e) {
      // ignore parse errors
    }
  }, [location.search]);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Utility: produce a slug-like string from a label (ASCII-only, lowercased)
  const toSlug = (s) => {
    if (!s && s !== 0) return "";
    try {
      return (
        String(s)
          .normalize("NFD")
          // remove diacritics
          .replace(/\p{Diacritic}/gu, "")
          // remove invalid chars
          .replace(/[^\w\s-]/g, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
      );
    } catch (e) {
      return String(s).trim().toLowerCase().replace(/\s+/g, "-");
    }
  };

  const toggleOption = (filterKey, value) => {
    setSelectedFilters((prev) => {
      if (filterKey === "category") {
        const current = Array.isArray(prev[filterKey]) ? prev[filterKey] : [];
        const isSame =
          current.length === 1 && String(current[0]) === String(value);
        return { ...prev, [filterKey]: isSame ? [] : [value] };
      }
      const cur = new Set(prev[filterKey] || []);
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      return { ...prev, [filterKey]: Array.from(cur) };
    });
  };

  const handleSortSelect = (option) => {
    setSelectedSort(option);
    setSortOpen(false);
  };

  // Update attrOptions when availableFilters prop changes
  useEffect(() => {
    if (availableFilters) {
      // Normalize lists so each option is an object { _id, name }
        const normalizeList = (list) => {
          if (!Array.isArray(list)) return [];
          return list
            .map((item) => {
              if (item === null || item === undefined) return null;
              if (typeof item === "string") return { _id: item, name: item };
              // item may already be an object; ensure it has _id and name
              const id = item._id ?? item.id ?? item.value ?? item.name ?? null;
              const name = item.name ?? item.title ?? String(id);
              const slug =
                item.slug != null && String(item.slug).trim()
                  ? String(item.slug).trim()
                  : null;
              // Keep original fields (eg. color.code/gradient) for UI rendering.
              return slug
                ? { ...item, _id: id, name, slug }
                : { ...item, _id: id, name };
            })
            .filter(Boolean);
        };

      const attrData = {
        materials: normalizeList(availableFilters.materials),
        colors: normalizeList(availableFilters.colors),
        sizes: normalizeList(availableFilters.sizes),
        themes: normalizeList(availableFilters.themes),
        collections: normalizeList(availableFilters.collections),
        categories: normalizeList(availableFilters.categories),
      };

      // Annotate each normalized option with a `count` value taken from availableFilters
      // Match by _id first, then by name (case-insensitive). If no matching source is
      // available, default count to 0 so the UI can display an explicit 0.
      const findCountInRaw = (rawList, normItem) => {
        if (!Array.isArray(rawList) || !normItem) return null;
        const sv = String(normItem._id ?? normItem.name ?? "").trim();

        // Try to find by id-like fields
        const byId = rawList.find(
          (it) =>
            it &&
            (String(it._id) === sv ||
              String(it.id) === sv ||
              String(it.value) === sv),
        );
        if (byId && typeof byId.count === "number") return byId.count;

        // Try to find by name (case-insensitive)
        const byName = rawList.find((it) => {
          if (!it) return false;
          if (typeof it === "string")
            return (
              String(it).trim().toLowerCase() ===
              String(normItem.name || "")
                .trim()
                .toLowerCase()
            );
          const name = it.name ?? it.title ?? "";
          return (
            String(name).trim().toLowerCase() ===
            String(normItem.name || "")
              .trim()
              .toLowerCase()
          );
        });
        if (byName && typeof byName.count === "number") return byName.count;

        // No explicit count available
        return null;
      };

      Object.keys(attrData).forEach((k) => {
        const rawKey = k; // same key names from availableFilters
        const rawList = availableFilters[rawKey];
        attrData[k] = (attrData[k] || []).map((item) => ({
          ...item,
          count: findCountInRaw(rawList, item),
        }));
      });
      setAttrOptions(attrData);
    }
  }, [availableFilters]);

  // debounce timer for applying filters to URL / parent
  const debounceRef = useRef(null);

  // notify parent about filters/sort changes (map to backend shape and sync to URL)
  useEffect(() => {
    if (typeof onFiltersChange !== "function") return;

    (async () => {
      // Find category slug for selected categories (sync helper)
      const findCategorySlug = (categoryId) => {
        const category = (attrOptions.categories || []).find(
          (cat) => String(cat._id) === String(categoryId),
        );
        return category ? category.slug : null;
      };

      // Map selectedFilters (which currently hold labels or ids) to backend shape.
      const mapToBackend = async () => {
        const out = {};
        let derivedCategorySlug = null;

        const mapArray = async (key) => {
          const vals = selectedFilters[key] || [];
          if (!vals || !vals.length) return undefined;
          let listKey;
          if (key === "material") listKey = "materials";
          else if (key === "theme") listKey = "themes";
          else if (key === "collection") listKey = "collections";
          else if (key === "category") listKey = "categories";
          else listKey = `${key}s`;
          const list = attrOptions[listKey] || [];

          // If category list is empty, attempt to fetch global categories as a fallback
          let globalCats = Array.isArray(window._allCategories)
            ? window._allCategories
            : [];
          if (
            key === "category" &&
            (!Array.isArray(list) || list.length === 0) &&
            (!Array.isArray(globalCats) || globalCats.length === 0)
          ) {
            try {
              const res = await api.getCategories({ root: 0 });
              globalCats = Array.isArray(res?.data) ? res.data : [];
              if (globalCats.length) window._allCategories = globalCats;
            } catch (e) {
              // ignore fetch errors
            }
          }

          const results = await Promise.all(
            vals.map(async (v) => {
              // Try to find in normalized attrOptions first (match by id or name)
              const found = (list || []).find(
                (it) =>
                  String(it._id) === String(v) ||
                  String(it.name || it || "")
                    .trim()
                    .toLowerCase() ===
                  String(v || "")
                    .trim()
                    .toLowerCase(),
              );
              if (found) {
                if (key === "category" && found.slug)
                  derivedCategorySlug = derivedCategorySlug || found.slug;
                return String(found._id || found.id || found.name);
              }

              // Try global categories (from window._allCategories)
              if (
                key === "category" &&
                Array.isArray(globalCats) &&
                globalCats.length
              ) {
                const globalFound = globalCats.find(
                  (c) =>
                    String(c._id) === String(v) ||
                    String(c.name || "")
                      .trim()
                      .toLowerCase() ===
                    String(v || "")
                      .trim()
                      .toLowerCase() ||
                    String(c.slug || "")
                      .trim()
                      .toLowerCase() ===
                    String(v || "")
                      .trim()
                      .toLowerCase(),
                );
                if (globalFound) {
                  derivedCategorySlug =
                    derivedCategorySlug || globalFound.slug || null;
                  return String(
                    globalFound._id ||
                    globalFound.slug ||
                    globalFound.name ||
                    v,
                  );
                }
              }

              // Otherwise return raw value (fallback)
              return String(v);
            }),
          );

          return results;
        };

        const mat = await mapArray("material");
        if (mat) out.materials = mat;
        const col = await mapArray("color");
        if (col) out.colors = col;
        const sz = await mapArray("size");
        if (sz) out.sizes = sz;
        const th = await mapArray("theme");
        if (th) out.themes = th;
        const coll = await mapArray("collection");
        if (coll) out.collections = coll;
        const cat = await mapArray("category");
        if (cat) out.categories = cat;

        if (
          Array.isArray(selectedFilters.price) &&
          selectedFilters.price.length
        ) {
          const label = selectedFilters.price[0];
          if (label.indexOf("Dưới") === 0) {
            const n = Number(label.replace(/[^0-9]/g, "")) || 0;
            out.price = { min: 0, max: n };
          } else if (label.indexOf("Trên") === 0) {
            const n = Number(label.replace(/[^0-9]/g, "")) || 0;
            out.price = { min: n, max: Number.MAX_SAFE_INTEGER };
          } else {
            const parts = label
              .split("-")
              .map((s) => Number(String(s).replace(/[^0-9]/g, "")));
            if (parts.length === 2)
              out.price = { min: parts[0], max: parts[1] };
          }
        }

        if (
          !out.categorySlug &&
          typeof derivedCategorySlug === "string" &&
          derivedCategorySlug
        ) {
          out.categorySlug = derivedCategorySlug;
        }

        return out;
      };

      const backendFilters = await mapToBackend();

      // Keep both categories and categorySlug for backend compatibility
      if (
        Array.isArray(selectedFilters.category) &&
        selectedFilters.category.length > 0
      ) {
        const categoryId = selectedFilters.category[0]; // Get first selected category
        let foundCat = null;
        // Try attrOptions first (by id, slug or name)
        if (Array.isArray(attrOptions.categories)) {
          foundCat = (attrOptions.categories || []).find(
            (cat) =>
              String(cat._id) === String(categoryId) ||
              String(cat.slug || "")
                .trim()
                .toLowerCase() ===
              String(categoryId || "")
                .trim()
                .toLowerCase() ||
              String(cat.name || "")
                .trim()
                .toLowerCase() ===
              String(categoryId || "")
                .trim()
                .toLowerCase(),
          );
        }
        // Fallback to global category list
        if (
          !foundCat &&
          typeof window !== "undefined" &&
          Array.isArray(window._allCategories)
        ) {
          foundCat = window._allCategories.find(
            (c) =>
              String(c._id) === String(categoryId) ||
              String(c.slug || "")
                .trim()
                .toLowerCase() ===
              String(categoryId || "")
                .trim()
                .toLowerCase() ||
              String(c.name || "")
                .trim()
                .toLowerCase() ===
              String(categoryId || "")
                .trim()
                .toLowerCase(),
          );
        }
        if (foundCat && foundCat.slug) {
          backendFilters.categorySlug = foundCat.slug;
        }
      }

      // Avoid calling parent if filters did not change (prevent infinite loops)
      try {
        Sidebar._lastFilters = JSON.stringify(backendFilters || {});
      } catch (e) {
        // ignore
      }

      if (typeof onFiltersChange === "function") {
        const payloadForParent = { ...backendFilters };
        if (
          Array.isArray(selectedFilters.price) &&
          selectedFilters.price.length
        ) {
          payloadForParent.price = selectedFilters.price;
        } else {
          delete payloadForParent.price;
        }
        onFiltersChange(payloadForParent);
      }

      try {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          try {
            // Build short query params (type, material, color, size, collection, min, max)
            const shortParams = new URLSearchParams();

            // type (category): prefer slug form for user-facing short param
            const catVals =
              backendFilters && Array.isArray(backendFilters.categories)
                ? backendFilters.categories
                : undefined;
            let typeCandidate = null;
            if (
              Array.isArray(selectedFilters.category) &&
              selectedFilters.category.length
            ) {
              const sel = selectedFilters.category[0];
              // Try to find category in attrOptions by id/name/slug
              const byAttr = (attrOptions.categories || []).find(
                (c) =>
                  String(c._id) === String(sel) ||
                  String(c.name || "")
                    .trim()
                    .toLowerCase() ===
                  String(sel || "")
                    .trim()
                    .toLowerCase() ||
                  String(c.slug || "")
                    .trim()
                    .toLowerCase() ===
                  String(sel || "")
                    .trim()
                    .toLowerCase(),
              );
              if (byAttr)
                typeCandidate =
                  byAttr.slug || toSlug(byAttr.name) || String(sel);
              else if (catVals && catVals.length) {
                const v = String(catVals[0]);
                const byAttr2 = (attrOptions.categories || []).find(
                  (c) =>
                    String(c._id) === v ||
                    String(c.slug || "")
                      .trim()
                      .toLowerCase() === v.trim().toLowerCase() ||
                    String(c.name || "")
                      .trim()
                      .toLowerCase() === v.trim().toLowerCase(),
                );
                if (byAttr2) typeCandidate = byAttr2.slug || String(v);
                else typeCandidate = toSlug(v);
              } else {
                typeCandidate = toSlug(sel);
              }
            } else if (backendFilters && backendFilters.categorySlug) {
              // fallback: use slug as type if nothing else
              typeCandidate = backendFilters.categorySlug;
            }
            if (typeCandidate) {
              // Ensure we don't write a raw backend id into `type`. If it looks
              // like an object id (hex-like) try to convert to a slug-like
              // short identifier using any available name/slug. Otherwise
              // fallback to toSlug() of the candidate.
              const asStr = String(typeCandidate);
              const looksLikeId = /^[0-9a-fA-F]{8,24}$/.test(asStr);
              let outType = asStr;
              if (looksLikeId) {
                // Try to find corresponding category in global list
                if (
                  typeof window !== "undefined" &&
                  Array.isArray(window._allCategories)
                ) {
                  const found = window._allCategories.find(
                    (c) => String(c._id) === asStr || String(c.slug) === asStr,
                  );
                  if (found && found.slug) outType = found.slug;
                  else outType = toSlug(asStr);
                } else {
                  outType = toSlug(asStr);
                }
              }
              shortParams.set("type", String(outType));
            }

            // If facet lists lack slug / ids mismatch, still persist Loại SP in URL
            if (!shortParams.has("type")) {
              if (backendFilters?.categorySlug) {
                shortParams.set("type", String(backendFilters.categorySlug));
              } else if (
                Array.isArray(selectedFilters.category) &&
                selectedFilters.category.length
              ) {
                const sel = selectedFilters.category[0];
                const globals =
                  typeof window !== "undefined" &&
                    Array.isArray(window._allCategories)
                    ? window._allCategories
                    : [];
                const hit = globals.find(
                  (c) =>
                    String(c._id) === String(sel) ||
                    String((c.slug || "").trim().toLowerCase()) ===
                    String(sel).trim().toLowerCase() ||
                    String((c.name || "").trim().toLowerCase()) ===
                    String(sel).trim().toLowerCase(),
                );
                if (hit?.slug) shortParams.set("type", String(hit.slug));
                else if (hit?.name) shortParams.set("type", toSlug(hit.name));
                else shortParams.set("type", toSlug(sel));
              }
            }

            const writeCSV = (key, paramName) => {
              const arr = selectedFilters[key] || [];
              if (Array.isArray(arr) && arr.length)
                shortParams.set(paramName, arr.join(","));
            };
            writeCSV("material", "material");
            writeCSV("color", "color");
            writeCSV("size", "size");
            writeCSV("collection", "collection");

            if (backendFilters && backendFilters.price) {
              if (
                backendFilters.price.min !== undefined &&
                backendFilters.price.min !== null
              )
                shortParams.set("min", String(backendFilters.price.min));
              if (
                backendFilters.price.max !== undefined &&
                backendFilters.price.max !== null &&
                backendFilters.price.max !== Number.MAX_SAFE_INTEGER
              )
                shortParams.set("max", String(backendFilters.price.max));
            }

            let categorySlugCandidate = null;
            if (backendFilters && backendFilters.categorySlug) {
              categorySlugCandidate = backendFilters.categorySlug;
            } else if (
              typeCandidate &&
              typeof window !== "undefined" &&
              Array.isArray(window._allCategories)
            ) {
              const byGlobal = window._allCategories.find(
                (c) =>
                  String(c.name || "")
                    .trim()
                    .toLowerCase() ===
                  String(typeCandidate || "")
                    .trim()
                    .toLowerCase() ||
                  String(c.slug || "")
                    .trim()
                    .toLowerCase() ===
                  String(typeCandidate || "")
                    .trim()
                    .toLowerCase(),
              );
              if (byGlobal && byGlobal.slug)
                categorySlugCandidate = byGlobal.slug;
            }
            if (categorySlugCandidate)
              shortParams.set("categorySlug", categorySlugCandidate);

            // Preserve unrelated existing params
            const existing = new URLSearchParams(window.location.search || "");
            // Preserve unrelated existing params. Note: do NOT strip existing
            // categorySlug here — otherwise a header navigation that sets only
            // categorySlug will be removed by Sidebar when no filters are
            // selected. Keep categorySlug so short URLs from the header/menu
            // remain stable.
            existing.forEach((v, k) => {
              if (
                k === "filters" ||
                k === "type" ||
                k === "material" ||
                k === "color" ||
                k === "size" ||
                k === "collection" ||
                k === "min" ||
                k === "max"
              )
                return;
              shortParams.set(k, v);
            });

            const qsBuilt = shortParams.toString();
            const newSearch = qsBuilt ? `?${qsBuilt}` : "";
            // Replace URL whenever we built any query, or the address bar had no query yet.
            const shouldReplace =
              Boolean(qsBuilt) || window.location.search === "";
            if (shouldReplace) {
              const sx = window.scrollX || 0;
              const sy = window.scrollY || 0;
              try {
                navigate(`${window.location.pathname}${newSearch}`, {
                  replace: true,
                });
              } catch (e) {
                window.history.replaceState(
                  {},
                  "",
                  `${window.location.pathname}${newSearch}`,
                );
              }
              window.scrollTo(sx, sy);
            }
          } catch (e) {
            /* ignore */
          }
        }, 200);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedFilters, attrOptions, onFiltersChange, navigate]);

  useEffect(() => {
    if (typeof onSortChange === "function") onSortChange(selectedSort);
  }, [selectedSort, onSortChange]);
  return (
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
          <MdKeyboardArrowRight
            className={`sort-icon ${sortOpen ? "rotate" : ""}`}
          />
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
        const visible =
          Array.isArray(categoryProp?.visibleFilters) &&
            categoryProp.visibleFilters.length
            ? categoryProp.visibleFilters
            : DEFAULT_VISIBLE_FILTERS;

        const getOptions = (key) => {
          // Determine candidate keys in availableFilters: support both singular and plural keys
          const pluralKey =
            key === "category"
              ? "categories"
              : key === "material"
                ? "materials"
                : `${key}s`;
          const candidates = [];
          if (availableFilters) {
            if (availableFilters[key]) candidates.push(availableFilters[key]);
            if (availableFilters[pluralKey])
              candidates.push(availableFilters[pluralKey]);
          }

          // Prefer facet lists only when non-empty; otherwise fall through so category.children /
          // defaults still render when API sends categories: [] or omits counts.
          if (availableFilters) {
            if (Object.prototype.hasOwnProperty.call(availableFilters, key)) {
              const v = availableFilters[key];
              if (Array.isArray(v) && v.length) return v;
            }
            if (
              Object.prototype.hasOwnProperty.call(availableFilters, pluralKey)
            ) {
              const v = availableFilters[pluralKey];
              if (Array.isArray(v) && v.length) return v;
            }
          }

          // Next, check category-specific filterOptions
          const fromCategory = categoryProp?.filterOptions?.[key];
          if (Array.isArray(fromCategory) && fromCategory.length)
            return fromCategory;

          // Fallback to default options
          switch (key) {
            case "material":
              return DEFAULT_FILTER_OPTIONS.material || [];
            case "color":
              return DEFAULT_FILTER_OPTIONS.color || [];
            case "size":
              return DEFAULT_FILTER_OPTIONS.size || [];
            case "theme":
              return DEFAULT_FILTER_OPTIONS.theme || [];
            case "collection":
              return DEFAULT_FILTER_OPTIONS.collection || [];
            case "category":
              return DEFAULT_FILTER_OPTIONS.category || [];
            case "price":
              return DEFAULT_FILTER_OPTIONS.price || [];
            default:
              return DEFAULT_FILTER_OPTIONS[key] || [];
          }
        };

        const isSelected = (key, value) => {
          const arr = selectedFilters[key] || [];
          const v = String(value);
          if (arr.includes(v) || arr.includes(value)) return true;
          if (key !== "category") return false;

          // Category can be represented by id OR slug OR name (short URL params).
          // Try to resolve the category object by id/slug/name and check equivalents.
          const pool = [
            ...(Array.isArray(attrOptions.categories)
              ? attrOptions.categories
              : []),
            ...(typeof window !== "undefined" &&
              Array.isArray(window._allCategories)
              ? window._allCategories
              : []),
          ];

          const lowered = v.trim().toLowerCase();
          const found = pool.find((c) => {
            if (!c) return false;
            const id = String(c._id || c.id || "");
            const slug = String(c.slug || "")
              .trim()
              .toLowerCase();
            const name = String(c.name || "")
              .trim()
              .toLowerCase();
            return id === v || slug === lowered || name === lowered;
          });

          const candidates = new Set([v, lowered]);
          if (found) {
            if (found._id) candidates.add(String(found._id));
            if (found.id) candidates.add(String(found.id));
            if (found.slug) candidates.add(String(found.slug));
            if (found.name) {
              candidates.add(String(found.name));
              candidates.add(toSlug(found.name));
            }
          }

          for (const sel of arr) {
            const s = String(sel);
            if (candidates.has(s) || candidates.has(s.trim().toLowerCase()))
              return true;
          }
          return false;
        };

        // Calculate product count for a filter option. Prefer the normalized
        // attrOptions (which we annotated with counts) when available. If not
        // present, fall back to availableFilters raw data. If neither exists,
        // return null for unknown (e.g., price ranges).
        const getOptionCount = (key, value) => {
          // Price ranges or unknown keys
          if (key === "price") return null;

          // Try to find in normalized attrOptions
          const listKey =
            key === "material"
              ? "materials"
              : key === "collection"
                ? "collections"
                : key === "category"
                  ? "categories"
                  : `${key}s`;
          const normList = attrOptions[listKey];
          if (Array.isArray(normList) && normList.length) {
            const found = normList.find(
              (it) =>
                String(it._id) === String(value) ||
                String(it.name || "")
                  .trim()
                  .toLowerCase() === String(value).trim().toLowerCase(),
            );
            if (found) {
              // If count is explicitly numeric, return it. If count is present but not numeric
              // (null/undefined), treat as unknown (null) so UI doesn't show (0).
              return typeof found.count === "number" ? found.count : null;
            }
          }

          // Fall back to availableFilters raw lists (older behavior)
          if (!availableFilters) return 1; // optimistic default to enable selection while loading

          const findOption = (filterArray, searchValue) => {
            if (!filterArray) return null;
            const sv = String(searchValue || "").trim();
            let option = filterArray.find(
              (item) =>
                String(item._id || item.id || item.value || item).toString() ===
                sv,
            );
            if (!option) {
              option = filterArray.find(
                (item) =>
                  String(item.name || item.title || item || "")
                    .trim()
                    .toLowerCase() === sv.toLowerCase(),
              );
            }
            return option || null;
          };

          switch (key) {
            case "material":
              if (availableFilters?.materials) {
                const materialOption = findOption(
                  availableFilters.materials,
                  value,
                );
                return materialOption &&
                  typeof materialOption.count === "number"
                  ? materialOption.count
                  : null;
              }
              return null;
            case "color":
              if (availableFilters?.colors) {
                const colorOption = findOption(availableFilters.colors, value);
                return colorOption && typeof colorOption.count === "number"
                  ? colorOption.count
                  : null;
              }
              return null;
            case "size":
              if (availableFilters?.sizes) {
                const sizeOption = findOption(availableFilters.sizes, value);
                return sizeOption && typeof sizeOption.count === "number"
                  ? sizeOption.count
                  : null;
              }
              return null;
            // case "theme":
            //   if (availableFilters?.themes) {
            //     const themeOption = findOption(availableFilters.themes, value);
            //     return themeOption && typeof themeOption.count === "number"
            //       ? themeOption.count
            //       : null;
            //   }
            //   return null;
            case "collection":
              if (availableFilters?.collections) {
                const collectionOption = findOption(
                  availableFilters.collections,
                  value,
                );
                return collectionOption &&
                  typeof collectionOption.count === "number"
                  ? collectionOption.count
                  : null;
              }
              return null;
            case "category":
              if (availableFilters?.categories) {
                const categoryOption = findOption(
                  availableFilters.categories,
                  value,
                );
                return categoryOption &&
                  typeof categoryOption.count === "number"
                  ? categoryOption.count
                  : null;
              }
              return null;
            default:
              return null;
          }
        };

        const renderSection = (key) => {
          const opts = getOptions(key);
          const open = openSections[key] !== false; // default true
          switch (key) {
            case "category":
            case "material":
            case "collection":
            // case "theme":
            case "classification":
            case "price":
              return (
                <div className="filter-section" key={key}>
                  <div
                    className="filter-section__header"
                    onClick={() => toggleSection(key)}
                  >
                    {/* <h3 className="filter-section__title">
                      {key === "material"
                        ? "Chất liệu"
                        : key === "price"
                          ? "Mức giá"
                          : key === "category"
                            ? "Loại sản phẩm"
                            : key === "theme"
                              ? "Chủ đề"
                              : key === "collection"
                                ? "Bộ sưu tập"
                                : "Phân loại"}
                    </h3> */}
                    <h3 className="filter-section__title">
                      {key === "material"
                        ? "Chất liệu"
                        : key === "price"
                          ? "Mức giá"
                          : key === "category"
                            ? "Loại sản phẩm"
                            : key === "collection"
                              ? "Bộ sưu tập"
                              : null} 
                    </h3>

                    <span className="filter-section__toggle">
                      {open ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {open && (
                    <div className="filter-section__body">
                      {(opts || []).map((label) => {
                        // label may be object { _id, name } or string
                        let value, display;

                        if (key === "price") {
                          display =
                            label &&
                              typeof label === "object" &&
                              label.label != null
                              ? String(label.label)
                              : String(label);
                          value = display;
                        } else {
                          // Standard handling for other filter types
                          value =
                            label && (label._id || label.id)
                              ? String(label._id || label.id)
                              : String(label);
                          display =
                            label && (label.name || label.title)
                              ? label.name || label.title
                              : String(label);
                        }

                        const count = getOptionCount(key, value);
                        const isDisabled =
                          typeof count === "number" &&
                          count === 0 &&
                          key !== "collection" &&
                          key !== "category";

                        return (
                          <label
                            className={`filter-checkbox ${isDisabled ? "disabled" : ""}`}
                            key={value}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected(key, value)}
                              onChange={() => toggleOption(key, value)}
                              disabled={isDisabled}
                            />
                            <span>{display}</span>
                            {/* hide per-option counts (use total results header instead) */}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            case "color":
              return (
                <div className="filter-section" key={key}>
                  <div
                    className="filter-section__header"
                    onClick={() => toggleSection(key)}
                  >
                    <h3 className="filter-section__title">Màu sắc</h3>
                    <span className="filter-section__toggle">
                      {open ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {open && (
                    <div className="filter-section__body color-list">
                      {(opts || []).map((color) => {
                        const value =
                          color && (color._id || color.id)
                            ? String(color._id || color.id)
                            : String(color.name || color);
                        const name = color.name || color;
                        const selected = isSelected(key, value);
                        const count = getOptionCount(key, value);

                        return (
                          <button
                            type="button"
                            className={`color-option ${count === 0 ? "disabled" : ""}`}
                            key={value}
                            onClick={() => toggleOption(key, value)}
                            disabled={
                              typeof count === "number" ? count === 0 : false
                            }
                          >
                            <span
                              className={`color-swatch ${selected ? "is-selected" : ""}`}
                            >
                              <span
                                className="color-swatch__fill"
                                style={{
                                  background: getColorFill(color),
                                }}
                              />
                            </span>
                            <div className="color-info">
                              <span>{name}</span>
                              {/* hide per-option counts */}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            case "size":
              return (
                <div className="filter-section" key={key}>
                  <div
                    className="filter-section__header"
                    onClick={() => toggleSection(key)}
                  >
                    <h3 className="filter-section__title">Size</h3>
                    <span className="filter-section__toggle">
                      {open ? <FaMinus /> : <FaPlus />}
                    </span>
                  </div>
                  {open && (
                    <div className="filter-section__body size-grid">
                      {(opts || []).map((s) => {
                        const value =
                          s && (s._id || s.id)
                            ? String(s._id || s.id)
                            : String(s.name || s);
                        const name = s.name || s;
                        const selected = isSelected(key, value);
                        const count = getOptionCount(key, value);

                        return (
                          <button
                            type="button"
                            key={value}
                            className={`size-pill ${selected ? "is-selected" : ""} ${count === 0 ? "disabled" : ""}`}
                            onClick={() => toggleOption(key, value)}
                            disabled={
                              typeof count === "number" ? count === 0 : false
                            }
                          >
                            {name}
                            {/* hide per-option counts */}
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
  );
}
