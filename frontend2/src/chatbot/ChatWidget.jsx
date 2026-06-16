import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { RiSparkling2Line } from "react-icons/ri";
import { IoCloseOutline, IoSend } from "react-icons/io5";
import { api } from "../utils/api";
import { useChatContext } from "./ChatContext";
import "./chatbot.css";

const STORAGE_KEY = "chatbot:conversation";
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

const QUICK_REPLY_MESSAGE_MAP = [
  {
    match: ["tu van qua tang cho nu"],
    message:
      "Gợi ý 3 sản phẩm trang sức phù hợp làm quà tặng cho nữ, nêu rõ tên sản phẩm và giá.",
  },
  {
    match: ["goi y mix charm nhe nhang"],
    message:
      "Gợi ý 1 set mix charm nhẹ nhàng gồm vòng tay và charm phù hợp, nêu rõ tên sản phẩm và giá.",
  },
  {
    match: ["huong dan chon size vong"],
    message:
      "Hướng dẫn chọn size vòng tay phù hợp, giải thích ngắn gọn cách đo cổ tay và size nên chọn.",
  },
  {
    match: ["vong tay bac"],
    message:
      "Gợi ý vài sản phẩm vòng tay chất liệu bạc, chỉ trả lời sản phẩm thuộc danh mục vòng tay.",
  },
  {
    match: ["nhan bac"],
    message:
      "Gợi ý vài sản phẩm nhẫn chất liệu bạc, chỉ trả lời sản phẩm thuộc danh mục nhẫn.",
  },
  {
    match: ["day chuyen bac"],
    message:
      "Gợi ý vài sản phẩm dây chuyền chất liệu bạc, chỉ trả lời sản phẩm thuộc danh mục dây chuyền.",
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

const expandQuickReplyMessage = (reply) => {
  const normalizedReply = normalizeText(reply);
  const mapped = QUICK_REPLY_MESSAGE_MAP.find((entry) =>
    entry.match.some((keyword) => normalizedReply.includes(normalizeText(keyword))),
  );
  if (mapped) return mapped.message;

  const intent = detectProductIntent(reply);
  if (intent.category || intent.material) {
    const parts = [];
    if (intent.category?.displayLabel) parts.push(intent.category.displayLabel);
    if (intent.material?.displayLabel) parts.push(`chất liệu ${intent.material.displayLabel}`);
    return `Gợi ý vài sản phẩm ${parts.join(" ")}, chỉ trả lời đúng danh mục người dùng đang hỏi.`.trim();
  }

  return reply;
};

const formatPriceText = (product) => {
  if (product?.priceText) return String(product.priceText).trim();

  const priceMin = Number(product?.priceMin);
  const priceMax = Number(product?.priceMax);
  if (Number.isFinite(priceMin) && Number.isFinite(priceMax) && priceMin > 0) {
    return priceMin === priceMax
      ? `${priceMin.toLocaleString("vi-VN")}đ`
      : `${priceMin.toLocaleString("vi-VN")}đ - ${priceMax.toLocaleString("vi-VN")}đ`;
  }

  const variantPrices = Array.isArray(product?.variants)
    ? product.variants
        .map((variant) => Number(variant?.price))
        .filter((price) => Number.isFinite(price) && price > 0)
    : [];
  if (!variantPrices.length) return "";

  const minPrice = Math.min(...variantPrices);
  const maxPrice = Math.max(...variantPrices);
  return minPrice === maxPrice
    ? `${minPrice.toLocaleString("vi-VN")}đ`
    : `${minPrice.toLocaleString("vi-VN")}đ - ${maxPrice.toLocaleString("vi-VN")}đ`;
};

const getProductImage = (product) => {
  if (product?.image) return product.image;
  if (product?.thumbnail) return product.thumbnail;
  if (Array.isArray(product?.images) && product.images[0]) return product.images[0];
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  for (const variant of variants) {
    if (Array.isArray(variant?.images) && variant.images[0]) return variant.images[0];
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

const scoreProductForMessage = (product, message, intent) => {
  const haystack = getIntentAwareHaystack(product);
  if (!haystack) return -1;
  if (!productMatchesIntent(product, intent)) return -1;

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

const buildRecommendationAnswer = (intent, products) => {
  const labelParts = [];
  if (intent?.category?.displayLabel) labelParts.push(intent.category.displayLabel);
  if (intent?.material?.displayLabel) labelParts.push(`chất liệu ${intent.material.displayLabel}`);
  const subject = labelParts.length ? labelParts.join(" ") : "sản phẩm phù hợp";

  if (!products.length) {
    return `Mình chưa thấy mẫu ${subject} thật sự phù hợp để gợi ý ngay. Bạn có thể cho mình thêm tầm giá hoặc kiểu dáng để mình lọc sát hơn.`;
  }

  const lines = products.slice(0, 3).map((product, index) => {
    const priceText = product?.priceText ? ` - ${product.priceText}` : "";
    return `${index + 1}. ${product.name}${priceText}`;
  });

  return [`Mình gợi ý vài mẫu ${subject} phù hợp với nhu cầu của bạn:`, ...lines].join("\n");
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

const searchFullCatalogProducts = async (message, intent, limit = 8) => {
  const products = await getFullCatalogProducts();
  return products
    .map((product) => ({
      product,
      score: scoreProductForMessage(product, message, intent),
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
    const matchedProducts = await searchFullCatalogProducts(message, intent, 6);

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

const fetchIntentMatchedProducts = async (message, intent) => {
  if (!intent?.category && !intent?.material) return [];

  try {
    const catalogMatches = await searchFullCatalogProducts(message, intent, 8);
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
      const matched = products.filter((product) => productMatchesIntent(product, intent));
      if (matched.length) return matched.map(normalizeProductCard);
    } catch {
      // Ignore rescue lookup failures and keep original assistant reply.
    }
  }

  return [];
};

const enhanceAssistantPayload = async (message, payload) => {
  const intent = detectProductIntent(message);
  const initialProducts = Array.isArray(payload?.recommendedProducts)
    ? payload.recommendedProducts.map(normalizeProductCard)
    : [];

  if (!intent.category && !intent.material) {
    return {
      answer: String(payload?.answer || "").trim(),
      quickReplies: Array.isArray(payload?.quickReplies) ? payload.quickReplies : [],
      recommendedProducts: initialProducts.slice(0, 4),
    };
  }

  const matchingProducts = initialProducts.filter((product) => productMatchesIntent(product, intent));
  const needsRescue = initialProducts.length > 0 && matchingProducts.length === 0;
  const shouldFetchFallback =
    initialProducts.length === 0 ||
    needsRescue ||
    matchingProducts.length < Math.min(2, initialProducts.length);
  const fallbackProducts =
    shouldFetchFallback
      ? await fetchIntentMatchedProducts(message, intent)
      : [];
  const finalProducts = mergeProducts(matchingProducts, fallbackProducts).slice(0, 4);
  const shouldOverrideAnswer =
    shouldFetchFallback &&
    (initialProducts.length === 0 ||
      needsRescue ||
      finalProducts.length > matchingProducts.length);

  return {
    answer: shouldOverrideAnswer
      ? buildRecommendationAnswer(intent, finalProducts)
      : String(payload?.answer || "").trim(),
    quickReplies: Array.isArray(payload?.quickReplies) ? payload.quickReplies : [],
    recommendedProducts: finalProducts,
  };
};

const defaultAssistantMessage = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý AI của Kim Bảo. Mình có thể tư vấn sản phẩm, mix charm, khắc chữ, thanh toán và theo dõi đơn hàng cho bạn.",
  quickReplies: [
    "Vòng tay bạc",
    "Gợi ý mix charm nhẹ nhàng",
    "Hướng dẫn chọn size vòng",
  ],
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

const summarizePageContext = (routeContext, pageContext) => ({
  pageType: routeContext?.pageType,
  route: {
    pathname: routeContext?.pathname || "",
    search: routeContext?.search || "",
  },
  activePageContext: pageContext || {},
  activePageType: pageContext?.pageType || routeContext?.pageType,
  ignorePageRestriction: true,
  catalogScope: "global",
});

export function ChatWidget() {
  const { routeContext, pageContext } = useChatContext();
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

  const baseRequestContext = useMemo(
    () => summarizePageContext(routeContext, pageContext),
    [routeContext, pageContext],
  );

  const sendMessage = async (messageText) => {
    const content = String(messageText || "").trim();
    if (!content || submitting) return;
    const requestMessage = expandQuickReplyMessage(content);
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
      const catalogContext = await buildCatalogContext(requestMessage);
      const res = await api.chatbotMessage({
        message: requestMessage,
        history,
        context: {
          ...baseRequestContext,
          catalogContext,
        },
      });
      const data = await enhanceAssistantPayload(requestMessage, res?.data || {});
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

  const latestAssistant = [...messages].reverse().find((item) => item.role === "assistant");

  return createPortal(
    <div className="chatbot-root" aria-live="polite">
      {open ? (
        <section className="chatbot-panel">
          <header className="chatbot-header">
            <div>
              <div className="chatbot-title">Trợ lý AI Kim Bảo</div>
              <div className="chatbot-subtitle">Tư vấn sản phẩm, mix charm và hỗ trợ mua hàng</div>
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

          {latestAssistant?.quickReplies?.length ? (
            <div className="chatbot-quickReplies">
              {latestAssistant.quickReplies.map((reply) => (
                <button key={reply} type="button" onClick={() => sendMessage(reply)}>
                  {reply}
                </button>
              ))}
            </div>
          ) : null}

          <form className="chatbot-form" onSubmit={onSubmit}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Hỏi về sản phẩm, size, mix charm, khắc chữ, đơn hàng..."
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
