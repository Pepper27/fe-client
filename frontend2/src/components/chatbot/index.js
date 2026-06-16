import React, { useEffect, useRef, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import { RiCustomerService2Line } from "react-icons/ri";
import { api } from "../../utils/api";
import "./index.scss";

const WELCOME = {
  role: "assistant",
  content:
    "Xin chào, em là Bảo Anh — trợ lý của KIM BẢO JEWELRY ✨ Anh/chị đang tìm charm, vòng tay hay một món quà đặc biệt ạ?",
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const payload = nextMessages.filter((m) => m.role !== "system");
      const res = await api.chat(payload);
      const reply =
        (res && res.reply) ||
        "Xin lỗi, hiện tại em chưa thể trả lời. Anh/chị vui lòng thử lại sau nhé.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Xin lỗi, trợ lý đang gặp sự cố kết nối. Anh/chị vui lòng thử lại sau ít phút ạ.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Trợ lý trang sức">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">
                <RiCustomerService2Line />
              </span>
              <div className="chat-header-text">
                <strong>Trợ lý KIM BẢO</strong>
                <span className="chat-status">Trực tuyến · phản hồi ngay</span>
              </div>
            </div>
            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
            >
              <IoClose />
            </button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg--assistant">
                <div className="chat-bubble chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder="Nhập tin nhắn của bạn..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              type="button"
              className="chat-send"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Gửi"
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`chat-fab ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng trợ lý" : "Mở trợ lý tư vấn"}
      >
        {open ? <IoClose /> : <RiCustomerService2Line />}
      </button>
    </div>
  );
};

export default ChatWidget;
