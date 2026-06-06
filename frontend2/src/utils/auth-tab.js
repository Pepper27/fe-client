const AUTH_TAB_BLOCK_KEY = "auth:tab:blocked";

export const getBlockedAuthState = () => {
  try {
    const raw = window.sessionStorage.getItem(AUTH_TAB_BLOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      reason: String(parsed?.reason || "session_changed"),
      at: Number(parsed?.at) || Date.now(),
    };
  } catch {
    return null;
  }
};

export const isAuthBlockedInTab = () => !!getBlockedAuthState();

export const blockAuthInTab = (reason = "session_changed") => {
  try {
    window.sessionStorage.setItem(
      AUTH_TAB_BLOCK_KEY,
      JSON.stringify({ reason: String(reason || "session_changed"), at: Date.now() }),
    );
  } catch {}
};

export const clearAuthBlockInTab = () => {
  try {
    window.sessionStorage.removeItem(AUTH_TAB_BLOCK_KEY);
  } catch {}
};
