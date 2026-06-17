import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { RiSparkling2Line } from "react-icons/ri";
import { IoCloseOutline, IoSend } from "react-icons/io5";
import { api, getApiBase } from "../utils/api";
import "./chatbot.css";

const STORAGE_KEY = "chatbot:conversation:v2";
let chatbotCategoryCatalogPromise = null;
let chatbotFullCatalogPromise = null;
const CHATBOT_CATALOG_PAGE_SIZE = 100;
const CHATBOT_CATALOG_PAGE_LIMIT = 50;

const CATEGORY_INTENTS = [
  {
    key: "bracelet",
    label: "vong tay",
    displayLabel: "vòng tay",
    aliases: ["vong tay", "lac tay", "bracelet"],
    fallbackSlug: "vong-tay",
  },
  {
    key: "charm",
    label: "charm",
    displayLabel: "charm",
    aliases: ["charm", "hat charm", "treo charm"],
    fallbackSlug: "charm",
  },
  {
    key: "ring",
    label: "nhan",
    displayLabel: "nhẫn",
    aliases: ["nhan", "ring"],
    fallbackSlug: "nhan",
  },
  {
    key: "necklace",
    label: "day chuyen",
    displayLabel: "dây chuyền",
    aliases: ["day chuyen", "day co", "necklace"],
    fallbackSlug: "day-chuyen",
  },
  {
    key: "earrings",
    label: "hoa tai",
    displayLabel: "hoa tai",
    aliases: ["hoa tai", "khuyen tai", "bong tai", "earring"],
    fallbackSlug: "hoa-tai",
  },
];

const MATERIAL_INTENTS = [
  {
    key: "silver",
    label: "bac",
    displayLabel: "bạc",
    aliases: ["bac", "silver", "sterling silver", "chất liệu bạc"],
  },
  {
    key: "rose-gold",
    label: "vang hong",
    displayLabel: "vàng hồng",
    aliases: ["vang hong", "rose gold", "mạ vàng hồng", "ma vang hong"],
  },
  {
    key: "gold",
    label: "vang",
    displayLabel: "vàng",
    aliases: ["vang", "gold", "ma vang"],
  },
];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getNormalizedVariantPrices = (product) => {
  const prices = Array.isArray(product?.variants)
    ? product.variants
        .map((variant) => Number(variant?.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((left, right) => left - right)
    : [];
  if (prices.length < 2) return prices;

  const baseline = prices[Math.floor((prices.length - 1) / 2)] || prices[0];
  if (!Number.isFinite(baseline) || baseline <= 0) return prices;

  const filtered = prices.filter((price) => price <= baseline * 3);
  return filtered.length ? filtered : prices;
};

const formatPriceText = (product) => {
  if (product?.priceText) return String(product.priceText).trim();

  const priceMin = Number(product?.priceMin);
  const priceMax = Number(product?.priceMax);
  const variantPrices = getNormalizedVariantPrices(product);
  if (
    Number.isFinite(priceMin) &&
    Number.isFinite(priceMax) &&
    priceMin > 0 &&
    (!variantPrices.length || priceMax <= Math.max(...variantPrices))
  ) {
    return priceMin === priceMax
      ? `${priceMin.toLocaleString("vi-VN")}đ`
      : `${priceMin.toLocaleString("vi-VN")}đ - ${priceMax.toLocaleString("vi-VN")}đ`;
  }

  if (!variantPrices.length) return "";

  const minPrice = Math.min(...variantPrices);
  const maxPrice = Math.max(...variantPrices);
  return minPrice === maxPrice
    ? `${minPrice.toLocaleString("vi-VN")}đ`
    : `${minPrice.toLocaleString("vi-VN")}đ - ${maxPrice.toLocaleString("vi-VN")}đ`;
};

const resolveImageCandidate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = resolveImageCandidate(item);
      if (nested) return nested;
    }
    return "";
  }
  if (typeof value === "object") {
    const nested =
      resolveImageCandidate(value.url) ||
      resolveImageCandidate(value.secure_url) ||
      resolveImageCandidate(value.src) ||
      resolveImageCandidate(value.path) ||
      resolveImageCandidate(value.image) ||
      resolveImageCandidate(value.featured_image) ||
      resolveImageCandidate(value.thumbnail) ||
      resolveImageCandidate(value.images);
    return typeof nested === "string" ? nested.trim() : "";
  }
  return "";
};

const toAbsoluteImageUrl = (value) => {
  const image = resolveImageCandidate(value);
  if (!image) return "";
  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(image)) return image;
  if (image.startsWith("/")) return `${getApiBase()}${image}`;
  return `${getApiBase()}/${image.replace(/^\.\//, "")}`;
};

const getProductImage = (product) => {
  if (product?.image) return toAbsoluteImageUrl(product.image);
  if (product?.thumbnail) {
    const thumbnail = Array.isArray(product.thumbnail) ? product.thumbnail[0] : product.thumbnail;
    return toAbsoluteImageUrl(thumbnail);
  }
  if (Array.isArray(product?.images) && product.images[0]) return toAbsoluteImageUrl(product.images[0]);
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  for (const variant of variants) {
    if (Array.isArray(variant?.images) && variant.images[0]) return toAbsoluteImageUrl(variant.images[0]);
  }
  return "";
};

const normalizeProductCard = (product) => ({
  ...product,
  id: product?._id || product?.id,
  slug: product?.slug || "",
  name: String(product?.name || "").trim(),
  image: getProductImage(product),
  priceText: formatPriceText(product),
});

const tokenizeSearchText = (value) =>
  normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const detectIntentValue = (message, intents) => {
  const normalizedMessage = normalizeText(message);
  return intents.find((intent) =>
    intent.aliases.some((alias) => normalizedMessage.includes(normalizeText(alias))),
  );
};

const detectProductIntent = (message) => ({
  category: detectIntentValue(message, CATEGORY_INTENTS) || null,
  material: detectIntentValue(message, MATERIAL_INTENTS) || null,
});

const parseBudgetValue = (rawNumber, unit) => {
  const numeric = Number(String(rawNumber || "").replace(/,/g, "."));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  if (unit === "k" || unit === "nghin" || unit === "ngan") return Math.round(numeric * 1000);
  if (unit === "tr" || unit === "trieu" || unit === "cu") return Math.round(numeric * 1000000);
  if (unit === "ty" || unit === "ti") return Math.round(numeric * 1000000000);
  return Math.round(numeric);
};

const detectBudgetConstraint = (message) => {
  const text = normalizeText(message);
  if (!text) return null;

  const rangeMatch = text.match(/(?:tu|tren)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|ty|ti|cu)?\s*(?:den|toi)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|ty|ti|cu)?/i);
  if (rangeMatch) {
    const min = parseBudgetValue(rangeMatch[1], rangeMatch[2]);
    const max = parseBudgetValue(rangeMatch[3], rangeMatch[4] || rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  const underMatch = text.match(/(?:duoi|nho hon|it hon|khong qua|toi da)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|ty|ti|cu)?/i);
  if (underMatch) {
    const max = parseBudgetValue(underMatch[1], underMatch[2]);
    if (Number.isFinite(max)) return { min: null, max };
  }

  const overMatch = text.match(/(?:tren|hon|tu)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|ty|ti|cu)?/i);
  if (overMatch) {
    const min = parseBudgetValue(overMatch[1], overMatch[2]);
    if (Number.isFinite(min)) return { min, max: null };
  }

  return null;
};

const getComparableProductPrice = (product) => {
  const variantPrices = getNormalizedVariantPrices(product);
  if (!variantPrices.length) return null;
  return Math.min(...variantPrices);
};

const productMatchesBudget = (product, budget) => {
  if (!budget?.min && !budget?.max) return true;
  const price = getComparableProductPrice(product);
  if (!Number.isFinite(price) || price <= 0) return false;
  if (Number.isFinite(budget?.min) && price < budget.min) return false;
  if (Number.isFinite(budget?.max) && price > budget.max) return false;
  return true;
};

const getIntentAwareHaystack = (product) => {
  const tokens = [product?.name, product?.slug, product?.category?.name, product?.category?.slug];

  if (Array.isArray(product?.materials)) {
    for (const material of product.materials) {
      if (typeof material === "string") tokens.push(material);
      else tokens.push(material?.label, material?.name);
    }
  }

  if (Array.isArray(product?.variants)) {
    for (const variant of product.variants) {
      tokens.push(variant?.material, variant?.materialLabel);
      if (Array.isArray(variant?.materials)) tokens.push(...variant.materials);
    }
  }

  return normalizeText(tokens.filter(Boolean).join(" "));
};

const scoreProductForMessage = (product, message, intent, budget) => {
  const haystack = getIntentAwareHaystack(product);
  if (!haystack) return -1;
  if (!productMatchesIntent(product, intent)) return -1;
  if (!productMatchesBudget(product, budget)) return -1;

  let score = 0;
  const tokens = tokenizeSearchText(message);
  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length > 4 ? 4 : 2;
  }

  if (intent?.category?.aliases.some((alias) => haystack.includes(normalizeText(alias)))) {
    score += 8;
  }

  if (intent?.material?.aliases.some((alias) => haystack.includes(normalizeText(alias)))) {
    score += 6;
  }

  const normalizedName = normalizeText(product?.name);
  if (tokens.some((token) => normalizedName.includes(token))) score += 3;
  if (budget && productMatchesBudget(product, budget)) score += 4;
  return score;
};

const productMatchesIntent = (product, intent) => {
  if (!intent?.category && !intent?.material) return true;

  const haystack = getIntentAwareHaystack(product);
  if (!haystack) return false;

  if (
    intent?.category &&
    !intent.category.aliases.some((alias) => haystack.includes(normalizeText(alias)))
  ) {
    return false;
  }

  if (
    intent?.material &&
    !intent.material.aliases.some((alias) => haystack.includes(normalizeText(alias)))
  ) {
    return false;
  }

  return true;
};

const buildRecommendationAnswer = (intent, products, budget) => {
  const labelParts = [];
  if (intent?.category?.displayLabel) labelParts.push(intent.category.displayLabel);
  if (intent?.material?.displayLabel) labelParts.push(`chất liệu ${intent.material.displayLabel}`);
  const subject = labelParts.length ? labelParts.join(" ") : "sản phẩm phù hợp";
  const budgetLabel = Number.isFinite(budget?.max)
    ? ` dưới ${Math.round(budget.max / 1000000).toLocaleString("vi-VN")} triệu`
    : Number.isFinite(budget?.min)
      ? ` từ ${Math.round(budget.min / 1000000).toLocaleString("vi-VN")} triệu`
      : "";

  if (!products.length) {
    return `Mình chưa thấy mẫu ${subject}${budgetLabel} thật sự phù hợp để gợi ý ngay. Bạn có thể cho mình thêm kiểu dáng để mình lọc sát hơn.`;
  }

  const lines = products.slice(0, 3).map((product, index) => {
    const priceText = product?.priceText ? ` - ${product.priceText}` : "";
    return `${index + 1}. ${product.name}${priceText}`;
  });

  return [`Mình gợi ý vài mẫu ${subject}${budgetLabel} phù hợp với nhu cầu của bạn:`, ...lines].join("\n");
};

const mergeProducts = (...groups) => {
  const deduped = new Map();
  for (const group of groups) {
    for (const product of group || []) {
      const normalized = normalizeProductCard(product);
      const key = normalized?.id || normalized?.slug || normalized?.name;
      if (!key || deduped.has(key)) continue;
      deduped.set(key, normalized);
    }
  }
  return Array.from(deduped.values());
};

const hydrateProductCards = async (products) => {
  const items = Array.isArray(products) ? products.map(normalizeProductCard) : [];
  if (!items.length) return [];
  if (items.every((product) => product?.image && product?.priceText)) return items;

  try {
    const catalog = await getFullCatalogProducts();
    return items.map((product) => {
      if (product?.image && product?.priceText) return product;
      const match = catalog.find((candidate) => {
        if (!candidate) return false;
        if (product?.id && candidate?.id && String(candidate.id) === String(product.id)) return true;
        if (product?.slug && candidate?.slug && String(candidate.slug) === String(product.slug)) return true;
        return normalizeText(candidate?.name) === normalizeText(product?.name);
      });
      return match ? { ...match, ...product, image: product?.image || match.image, priceText: product?.priceText || match.priceText } : product;
    });
  } catch {
    return items;
  }
};

const fetchAllCatalogProducts = async () => {
  const collected = [];
  let page = 1;
  let expectedTotal = null;

  while (page <= CHATBOT_CATALOG_PAGE_LIMIT) {
    const res = await api.getProducts({
      page,
      limit: CHATBOT_CATALOG_PAGE_SIZE,
      includeFilters: false,
    });

    const pageItems = Array.isArray(res?.data) ? res.data : [];
    const normalizedItems = pageItems.map(normalizeProductCard);
    collected.push(...normalizedItems);

    const total = Number(res?.meta?.total);
    if (Number.isFinite(total) && total >= 0) expectedTotal = total;

    if (!pageItems.length) break;
    if (expectedTotal !== null && collected.length >= expectedTotal) break;
    if (pageItems.length < CHATBOT_CATALOG_PAGE_SIZE) break;
    page += 1;
  }

  return mergeProducts(collected);
};

const getFullCatalogProducts = async () => {
  if (!chatbotFullCatalogPromise) {
    chatbotFullCatalogPromise = fetchAllCatalogProducts().catch((error) => {
      chatbotFullCatalogPromise = null;
      throw error;
    });
  }

  return chatbotFullCatalogPromise;
};

const searchFullCatalogProducts = async (message, intent, budget, limit = 8) => {
  const products = await getFullCatalogProducts();
  return products
    .map((product) => ({
      product,
      score: scoreProductForMessage(product, message, intent, budget),
    }))
    .filter((entry) => entry.score >= 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const buildCatalogContext = async (message) => {
  try {
    const [categories, products] = await Promise.all([
      getChatbotCategories(),
      getFullCatalogProducts(),
    ]);
    const intent = detectProductIntent(message);
    const budget = detectBudgetConstraint(message);
    const matchedProducts = await searchFullCatalogProducts(message, intent, budget, 6);

    return {
      scope: "global-catalog",
      totalProducts: products.length,
      categories: categories.slice(0, 50).map((category) => ({
        id: category?._id,
        slug: category?.slug,
        name: category?.name,
      })),
      matchedProducts: matchedProducts.map((product) => ({
        id: product?.id || product?._id,
        slug: product?.slug,
        name: product?.name,
        categoryName: product?.category?.name || "",
        categorySlug: product?.category?.slug || "",
        materials: Array.isArray(product?.materials)
          ? product.materials.map((material) =>
              typeof material === "string" ? material : material?.label || material?.name || "",
            )
          : [],
        priceText: product?.priceText || "",
      })),
    };
  } catch {
    return {
      scope: "global-catalog",
      totalProducts: 0,
      categories: [],
      matchedProducts: [],
    };
  }
};

const getChatbotCategories = async () => {
  if (typeof window !== "undefined" && Array.isArray(window._allCategories) && window._allCategories.length) {
    return window._allCategories;
  }

  if (!chatbotCategoryCatalogPromise) {
    chatbotCategoryCatalogPromise = api
      .getCategories({ root: 0 })
      .then((res) => {
        const categories = Array.isArray(res?.data) ? res.data : [];
        if (typeof window !== "undefined") window._allCategories = categories;
        return categories;
      })
      .catch(() => []);
  }

  return chatbotCategoryCatalogPromise;
};

const resolveCategorySlug = async (intentCategory) => {
  if (!intentCategory) return "";

  const categories = await getChatbotCategories();
  const match = categories.find((category) => {
    const slug = normalizeText(category?.slug);
    const name = normalizeText(category?.name);
    return intentCategory.aliases.some((alias) => {
      const normalizedAlias = normalizeText(alias);
      return slug === normalizedAlias || name === normalizedAlias || slug.includes(normalizedAlias) || name.includes(normalizedAlias);
    });
  });

  return match?.slug || intentCategory.fallbackSlug || "";
};

const fetchIntentMatchedProducts = async (message, intent, budget) => {
  if (!intent?.category && !intent?.material) return [];

  try {
    const catalogMatches = await searchFullCatalogProducts(message, intent, budget, 8);
    if (catalogMatches.length) return catalogMatches.map(normalizeProductCard);
  } catch {
    // Ignore cache lookup failures and continue with direct API search.
  }

  const categorySlug = await resolveCategorySlug(intent?.category);
  const attempts = [
    { page: 1, limit: 8, q: message, categorySlug, includeFilters: false },
  ];

  if (categorySlug) {
    attempts.push({ page: 1, limit: 8, categorySlug, includeFilters: false });
  }

  for (const params of attempts) {
    try {
      const res = await api.getProducts(params);
      const products = Array.isArray(res?.data) ? res.data : [];
      const matched = products.filter((product) => productMatchesIntent(product, intent) && productMatchesBudget(product, budget));
      if (matched.length) return matched.map(normalizeProductCard);
    } catch {
      // Ignore rescue lookup failures and keep original assistant reply.
    }
  }

  return [];
};

const isCompareRequest = (message, payload) => {
  if (String(payload?.intent || "").trim() === "product_compare") return true;
  const text = String(message || "").trim();
  return normalizeText(text).includes("so sanh");
};

const shouldShowRecommendedProducts = (message, payload) => {
  if (isCompareRequest(message, payload)) return true;
  const intent = detectProductIntent(message);
  return Boolean(intent.category || intent.material);
};

const enhanceAssistantPayload = async (message, payload) => {
  if (isCompareRequest(message, payload)) {
    const products = Array.isArray(payload?.recommendedProducts)
      ? (await hydrateProductCards(payload.recommendedProducts)).slice(0, 2)
      : [];
    return {
      answer: String(payload?.answer || "").trim(),
      quickReplies: Array.isArray(payload?.quickReplies) ? payload.quickReplies : [],
      recommendedProducts: products,
    };
  }

  const intent = detectProductIntent(message);
  const budget = detectBudgetConstraint(message);
  const initialProducts = Array.isArray(payload?.recommendedProducts)
    ? (await hydrateProductCards(payload.recommendedProducts)).filter((product) => productMatchesBudget(product, budget))
    : [];

  if (!shouldShowRecommendedProducts(message, payload)) {
    return {
      answer: String(payload?.answer || "").trim(),
      quickReplies: Array.isArray(payload?.quickReplies) ? payload.quickReplies : [],
      recommendedProducts: [],
    };
  }

  const matchingProducts = initialProducts.filter((product) => productMatchesIntent(product, intent));
  const needsRescue = initialProducts.length > 0 && matchingProducts.length === 0;
  const shouldFetchFallback =
    initialProducts.length === 0 ||
    needsRescue ||
    matchingProducts.length < Math.min(2, initialProducts.length);
  const fallbackProducts = shouldFetchFallback ? await fetchIntentMatchedProducts(message, intent, budget) : [];
  const finalProducts = mergeProducts(matchingProducts, fallbackProducts).slice(0, 4);
  const shouldOverrideAnswer =
    shouldFetchFallback &&
    (initialProducts.length === 0 ||
      needsRescue ||
      finalProducts.length > matchingProducts.length);

  return {
    answer: shouldOverrideAnswer
      ? buildRecommendationAnswer(intent, finalProducts, budget)
      : String(payload?.answer || "").trim(),
    quickReplies: Array.isArray(payload?.quickReplies) ? payload.quickReplies : [],
    recommendedProducts: finalProducts,
  };
};

const defaultAssistantMessage = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý AI của Kim Bảo. Bạn có thể hỏi mình bất cứ điều gì — tìm sản phẩm, so sánh mẫu, tư vấn size, gợi ý mix charm, tra cứu đơn hàng hay hướng dẫn thanh toán — dù đang ở trang nào trên website.",
  quickReplies: [],
  recommendedProducts: [],
};

const normalizeStoredMessages = (value) => {
  if (!Array.isArray(value) || !value.length) return [defaultAssistantMessage];
  return value
    .map((item) => ({
      role: item?.role === "user" ? "user" : "assistant",
      content: String(item?.content || "").trim(),
      quickReplies: Array.isArray(item?.quickReplies)
        ? item.quickReplies.map((entry) => String(entry || "").trim()).filter(Boolean).slice(0, 4)
        : [],
      recommendedProducts: Array.isArray(item?.recommendedProducts)
        ? item.recommendedProducts.slice(0, 4)
        : [],
    }))
    .filter((item) => item.content);
};

const readStoredMessages = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [defaultAssistantMessage];
    return normalizeStoredMessages(JSON.parse(raw));
  } catch {
    return [defaultAssistantMessage];
  }
};

const buildRequestContext = () => ({
  scope: "global",
  ignorePageRestriction: true,
  catalogScope: "global",
});

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => readStoredMessages());
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, submitting]);

  useEffect(() => {
    getChatbotCategories().catch(() => {});
    getFullCatalogProducts().catch(() => {});
  }, []);

  const baseRequestContext = useMemo(() => buildRequestContext(), []);

  const sendMessage = async (messageText) => {
    const content = String(messageText || "").trim();
    if (!content || submitting) return;
    const nextUserMessage = { role: "user", content };
    const history = messages.slice(-8).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setOpen(true);
    setError("");
    setSubmitting(true);
    setMessages((prev) => [...prev, nextUserMessage]);
    setInput("");

    try {
      const catalogContext = await buildCatalogContext(content);
      const res = await api.chatbotMessage({
        message: content,
        history,
        context: {
          ...baseRequestContext,
          catalogContext,
        },
      });
      const data = await enhanceAssistantPayload(content, res?.data || {});
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: String(data?.answer || "Mình chưa thể trả lời câu hỏi này ngay lúc này.").trim(),
          quickReplies: Array.isArray(data?.quickReplies) ? data.quickReplies : [],
          recommendedProducts: Array.isArray(data?.recommendedProducts)
            ? data.recommendedProducts
            : [],
        },
      ]);
    } catch (err) {
      setError(err?.message || "Chatbot đang bận, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const clearConversation = () => {
    setMessages([defaultAssistantMessage]);
    setError("");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return createPortal(
    <div className="chatbot-root" aria-live="polite">
      {open ? (
        <section className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <div className="chatbot-title">Trợ lý AI Kim Bảo</div>
              <div className="chatbot-subtitle">Gợi ý sản phẩm, so sánh, size, mix charm, đơn hàng & thanh toán</div>
            </div>
            <div className="chatbot-headerActions">
              <button type="button" className="chatbot-headerBtn" onClick={clearConversation}>
                Làm mới
              </button>
              <button type="button" className="chatbot-iconBtn" onClick={() => setOpen(false)} aria-label="Đóng chatbot">
                <IoCloseOutline />
              </button>
            </div>
          </header>

          <div className="chatbot-messages" ref={listRef}>
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`chatbot-message is-${item.role}`}>
                <div className="chatbot-messageBody">
                  <div className="chatbot-bubble">{item.content}</div>
                  {item.role === "assistant" && Array.isArray(item.recommendedProducts) && item.recommendedProducts.length ? (
                    <div className="chatbot-recommendations">
                      {item.recommendedProducts.map((product) => (
                        <Link
                          key={product?.id || product?.slug || product?.name}
                          className="chatbot-productCard"
                          to={product?.slug ? `/product/${encodeURIComponent(String(product.slug))}` : "/products"}
                          onClick={() => setOpen(false)}
                        >
                          {product?.image ? <img src={product.image} alt={product?.name || "Sản phẩm"} /> : <div className="chatbot-productFallback" />}
                          <div className="chatbot-productName">{product?.name}</div>
                          <div className="chatbot-productPrice">{product?.priceText || "Xem chi tiết"}</div>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {submitting ? (
              <div className="chatbot-message is-assistant">
                <div className="chatbot-bubble is-loading">AI đang suy nghĩ...</div>
              </div>
            ) : null}
          </div>

          {error ? <div className="chatbot-error">{error}</div> : null}

          <form className="chatbot-form" onSubmit={onSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Hỏi về sản phẩm, so sánh, size, mix charm, đơn hàng, thanh toán..."
            />
            <button type="submit" disabled={submitting || !String(input || "").trim()} aria-label="Gửi tin nhắn">
              <IoSend />
            </button>
          </form>
        </section>
      ) : null}

      <button type="button" className="chatbot-launcher" onClick={() => setOpen((prev) => !prev)}>
        <RiSparkling2Line />
        <span>Hỏi AI Kim Bảo</span>
      </button>
    </div>,
    document.body,
  );
}
