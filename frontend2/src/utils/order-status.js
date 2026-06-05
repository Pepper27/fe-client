const normalizeValue = (value) => String(value || "").trim().toLowerCase();
const LOCAL_PAID_ORDERS_KEY = "zalopay:paidOrders";

const readLocalPaidOrders = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PAID_ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((v) => String(v || "").trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const hasLocalPaidOrder = (orderCode) => {
  const code = String(orderCode || "").trim();
  if (!code) return false;
  return readLocalPaidOrders().includes(code);
};

export const markOrderPaidLocally = (orderCode) => {
  const code = String(orderCode || "").trim();
  if (!code) return;

  const next = Array.from(new Set([...readLocalPaidOrders(), code]));
  try {
    localStorage.setItem(LOCAL_PAID_ORDERS_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
};

export const getOrderPayStatus = (order) => {
  if (!order || typeof order !== "object") return "";

  const candidates = [
    order.payStatus,
    order.paymentStatus,
    order?.payment?.status,
    order?.payment?.payStatus,
    order?.payment?.paymentStatus,
    order?.financial_status,
  ];

  for (const value of candidates) {
    const normalized = normalizeValue(value);
    if (normalized) return normalized;
  }

  return "";
};

export const isOrderPaid = (order) => {
  if (getOrderPayStatus(order) === "paid") return true;
  return hasLocalPaidOrder(order?.orderCode);
};

export const getOrderDisplayStatus = (order) => {
  const status = normalizeValue(order?.status);
  if (status === "pending" && isOrderPaid(order)) return "confirmed";
  return status;
};
