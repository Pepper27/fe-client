// Price formatting helpers
export function formatPrice(value) {
  const n = Number(value) || 0;
  // Use Vietnamese locale number formatting (dot as thousand separator)
  // Do not include currency symbol here to keep control over placement.
  const formatted = new Intl.NumberFormat('vi-VN').format(n);
  return `${formatted}₫`;
}

export default formatPrice;
