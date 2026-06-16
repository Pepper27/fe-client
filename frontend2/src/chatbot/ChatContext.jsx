import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const ChatContext = createContext(null);

const inferPageType = (pathname) => {
  const path = String(pathname || "").toLowerCase();
  if (path.startsWith("/product/")) return "product-detail";
  if (path.startsWith("/products")) return "product-list";
  if (path.startsWith("/cart")) return "cart";
  if (path.startsWith("/checkout")) return "checkout";
  if (path.startsWith("/orders/detail/")) return "order-detail";
  if (path.startsWith("/orders")) return "orders";
  if (path.startsWith("/wishlist")) return "wishlist";
  if (path.startsWith("/design/mix")) return "design-builder";
  if (path.startsWith("/design")) return "design-list";
  if (path.startsWith("/authen")) return "auth";
  return path === "/" ? "home" : "general";
};

export function ChatProvider({ children }) {
  const location = useLocation();
  const [pageContext, setPageContext] = useState({});

  useEffect(() => {
    setPageContext({});
  }, [location.pathname, location.search]);

  const value = useMemo(
    () => ({
      pageContext,
      setPageContext,
      routeContext: {
        pathname: location.pathname,
        search: location.search,
        pageType: inferPageType(location.pathname),
      },
    }),
    [location.pathname, location.search, pageContext],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}

export function useChatPageContext(value) {
  const { setPageContext } = useChatContext();
  useEffect(() => {
    setPageContext(value || {});
    return () => {
      setPageContext({});
    };
  }, [setPageContext, value]);
}
