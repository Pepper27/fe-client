const AUTH_SYNC_KEY = "auth:sync:event";
const AUTH_SYNC_CHANNEL = "auth:sync";
const AUTH_SYNC_TAB_ID_KEY = "auth:sync:tabId";

const getTabId = () => {
  try {
    const existing = window.sessionStorage.getItem(AUTH_SYNC_TAB_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(AUTH_SYNC_TAB_ID_KEY, next);
    return next;
  } catch {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

const getChannel = () => {
  try {
    if (typeof BroadcastChannel === "undefined") return null;
    return new BroadcastChannel(AUTH_SYNC_CHANNEL);
  } catch {
    return null;
  }
};

export const publishAuthSync = (payload = {}) => {
  if (typeof window === "undefined") return;
  const event = {
    type: String(payload.type || "session_changed"),
    userId: payload.userId ? String(payload.userId) : "",
    at: Date.now(),
    senderId: getTabId(),
  };

  try {
    window.localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify(event));
  } catch {}

  const channel = getChannel();
  if (!channel) return;
  try {
    channel.postMessage(event);
  } catch {}
  try {
    channel.close();
  } catch {}
};

export const subscribeAuthSync = (callback) => {
  if (typeof window === "undefined") return () => {};
  const currentTabId = getTabId();

  const handleEvent = (event) => {
    const payload = event && typeof event === "object" ? event : null;
    if (!payload || payload.senderId === currentTabId) return;
    callback(payload);
  };

  const onStorage = (event) => {
    if (event.key !== AUTH_SYNC_KEY || !event.newValue) return;
    try {
      handleEvent(JSON.parse(event.newValue));
    } catch {}
  };

  window.addEventListener("storage", onStorage);

  const channel = getChannel();
  if (channel) {
    channel.onmessage = (message) => handleEvent(message?.data || null);
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
  };
};
