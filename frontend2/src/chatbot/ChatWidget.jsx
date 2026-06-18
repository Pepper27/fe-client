import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { RiCustomerService2Line } from "react-icons/ri";
import { IoCloseOutline, IoSend } from "react-icons/io5";
import { api, getApiBase, hasClientToken } from "../utils/api";
import { useChatContext } from "./ChatContext";
import "./chatbot.css";

const STORAGE_KEY = "chatbot:conversation:v2";

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
    return (
      resolveImageCandidate(value.url) ||
      resolveImageCandidate(value.secure_url) ||
      resolveImageCandidate(value.src) ||
      resolveImageCandidate(value.path) ||
      resolveImageCandidate(value.image) ||
      resolveImageCandidate(value.featured_image) ||
      resolveImageCandidate(value.thumbnail) ||
      resolveImageCandidate(value.images)
    );
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

const normalizeProductCard = (product) => ({
  ...product,
  id: product?._id || product?.id,
  slug: String(product?.slug || "").trim(),
  name: String(product?.name || "").trim(),
  image: toAbsoluteImageUrl(
    product?.image || product?.thumbnail || product?.images,
  ),
  priceText: String(product?.priceText || "").trim(),
});

const defaultAssistantMessage = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý AI của Kim Bảo. Bạn có thể hỏi mình về sản phẩm, so sánh mẫu, chọn size, mix charm, đơn hàng hoặc thanh toán.",
  quickReplies: [],
  recommendedProducts: [],
};

const normalizeStoredMessages = (value) => {
  if (!Array.isArray(value) || !value.length) return [defaultAssistantMessage];
  const messages = value
    .map((item) => ({
      role: item?.role === "user" ? "user" : "assistant",
      content: String(item?.content || "").trim(),
      quickReplies: Array.isArray(item?.quickReplies)
        ? item.quickReplies
            .map((entry) => String(entry || "").trim())
            .filter(Boolean)
            .slice(0, 4)
        : [],
      recommendedProducts: Array.isArray(item?.recommendedProducts)
        ? item.recommendedProducts.map(normalizeProductCard).slice(0, 6)
        : [],
    }))
    .filter((item) => item.content);
  return messages.length ? messages : [defaultAssistantMessage];
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

const buildRequestContext = ({ routeContext, pageContext }) => ({
  scope: "global",
  ignorePageRestriction: true,
  catalogScope: "global",
  pageType: routeContext?.pageType || "general",
  route: {
    pathname: routeContext?.pathname || "",
    search: routeContext?.search || "",
  },
  activePageContext:
    pageContext && typeof pageContext === "object" ? pageContext : {},
  user: {
    isLoggedIn: hasClientToken(),
  },
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

  const baseRequestContext = useMemo(
    () => buildRequestContext({ routeContext, pageContext }),
    [pageContext, routeContext],
  );

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
      const res = await api.chatbotMessage({
        message: content,
        history,
        context: baseRequestContext,
      });
      const data = res?.data || {};
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: String(
            data?.answer || "Mình chưa thể trả lời câu hỏi này ngay lúc này.",
          ).trim(),
          quickReplies: Array.isArray(data?.quickReplies)
            ? data.quickReplies
                .map((entry) => String(entry || "").trim())
                .filter(Boolean)
                .slice(0, 4)
            : [],
          recommendedProducts: Array.isArray(data?.recommendedProducts)
            ? data.recommendedProducts
                .map(normalizeProductCard)
                .filter((product) => product?.name)
                .slice(0, 6)
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
              <div className="chatbot-subtitle">
                Gợi ý sản phẩm, so sánh, size, mix charm, đơn hàng & thanh toán
              </div>
            </div>
            <div className="chatbot-headerActions">
              <button
                type="button"
                className="chatbot-headerBtn"
                onClick={clearConversation}
              >
                Làm mới
              </button>
              <button
                type="button"
                className="chatbot-iconBtn"
                onClick={() => setOpen(false)}
                aria-label="Đóng chatbot"
              >
                <IoCloseOutline />
              </button>
            </div>
          </header>

          <div className="chatbot-messages" ref={listRef}>
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`chatbot-message is-${item.role}`}
              >
                <div className="chatbot-messageBody">
                  <div className="chatbot-bubble">{item.content}</div>
                  {item.role === "assistant" &&
                  Array.isArray(item.quickReplies) &&
                  item.quickReplies.length ? (
                    <div className="chatbot-quickReplies">
                      {item.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          className="chatbot-quickReply"
                          onClick={() => sendMessage(reply)}
                          disabled={submitting}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.role === "assistant" &&
                  Array.isArray(item.recommendedProducts) &&
                  item.recommendedProducts.length ? (
                    <div className="chatbot-recommendations">
                      {item.recommendedProducts.map((product) => (
                        <Link
                          key={product?.id || product?.slug || product?.name}
                          className="chatbot-productCard"
                          to={
                            product?.slug
                              ? `/product/${encodeURIComponent(String(product.slug))}`
                              : "/products"
                          }
                          onClick={() => setOpen(false)}
                        >
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={product?.name || "Sản phẩm"}
                            />
                          ) : (
                            <div className="chatbot-productFallback" />
                          )}
                          <div className="chatbot-productName">
                            {product?.name}
                          </div>
                          <div className="chatbot-productPrice">
                            {product?.priceText || "Xem chi tiết"}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {submitting ? (
              <div className="chatbot-message is-assistant">
                <div className="chatbot-bubble is-loading">
                  AI đang suy nghĩ...
                </div>
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
            <button
              type="submit"
              disabled={submitting || !String(input || "").trim()}
              aria-label="Gửi tin nhắn"
            >
              <IoSend />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="chatbot-launcher"
        onClick={() => setOpen((prev) => !prev)}
      >
        <RiCustomerService2Line />
        {/* <span>Hỏi AI Kim Bảo</span> */}
      </button>
    </div>,
    document.body,
  );
}
