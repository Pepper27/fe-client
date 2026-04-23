import "./index.scss";
import { useNavigate } from "react-router-dom";
import { buildProductsUrl } from "../../../../utils/productsUrl"

export const CategoryCard = ({ image, name, slug }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="category-card-container"
      onClick={() => {
        if (!slug) return;
        // Use canonical products URL builder so ProductsPage receives `filters` JSON
        navigate(buildProductsUrl({ categorySlug: String(slug) }));
      }}
    >
      <img
        src={image}
        alt={name || "Danh mục"}
        className="category-card-image"
      />
      <span className="category-card-text">{name}</span>
    </button>
  );
};
