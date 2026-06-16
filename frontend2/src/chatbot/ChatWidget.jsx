import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { RiSparkling2Line } from "react-icons/ri";
import { IoCloseOutline, IoSend } from "react-icons/io5";
import { api } from "../utils/api";
import { useChatContext } from "./ChatContext";
import "./chatbot.css";

const STORAGE_KEY = "chatbot:conversation";

const defaultAssistantMessage = {
  role: "assistant",
  content:
    "Xin chào, mình là trợ lý AI của Kim Bảo. Mình có thể tư vấn sản phẩm, mix charm, khắc chữ, thanh toán và theo dõi đơn hàng cho bạn.",
  quickReplies: [
    "Tư vấn quà tặng cho nữ",
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
  pageType: pageContext?.pageType || routeContext?.pageType,
  route: {
    pathname: routeContext?.pathname || "",
    search: routeContext?.search || "",
  },
  ...pageContext,
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

  const requestContext = useMemo(
    () => summarizePageContext(routeContext, pageContext),
    [routeContext, pageContext],
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
        context: requestContext,
      });
      const data = res?.data || {};
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
