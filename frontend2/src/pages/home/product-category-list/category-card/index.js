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
        // Use canonical products URL builder with short `type` slug so URLs
        // remain human-friendly (no backend _id). Keep categorySlug for
        // backend accuracy.
        navigate(buildProductsUrl({ categorySlug: String(slug), type: String(slug) }));
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
