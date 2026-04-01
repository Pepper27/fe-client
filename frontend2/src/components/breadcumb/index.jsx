import { Link, useLocation } from "react-router-dom";

const labelMap = {
  "": "Trang chủ",
  "product": "Sản phẩm",
  "product-list": "Vòng tay",
  "tennis-bracelets": "Vòng tennis",
  "charms": "Charms",
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = labelMap[seg] || seg.replace("-", " ");

    const isLast = idx === segments.length - 1;

    return (
      <span key={href} style={{ display: "flex", alignItems: "center" }}>
        {!isLast ? (
          <Link to={href} style={{ color: "#2563eb", textDecoration: "none" }}>
            {label}
          </Link>
        ) : (
          <span style={{ color: "#4b5563", fontWeight: 500 }}>{label}</span>
        )}

        {!isLast && <span style={{ margin: "0 8px" }}>{">"}</span>}
      </span>
    );
  });

  return (
    <nav style={{ fontSize: "14px", color: "#374151", display: "flex" }}>
      <Link to="/" style={{ color: "#2563eb", textDecoration: "none" }}>
        {labelMap[""]}
      </Link>

      {segments.length > 0 && <span style={{ margin: "0 8px" }}>{">"}</span>}

      {crumbs}
    </nav>
  );
}