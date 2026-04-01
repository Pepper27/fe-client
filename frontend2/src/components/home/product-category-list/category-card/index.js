import "./index.scss";

export const CategoryCard = ({ image, name }) => {
    return (
        <div className="category-card-container">
            <img
                src={image}
                alt="Sản phẩm mới"
                className="category-card-image"
            />
            <span className="category-card-text">{name}</span>
        </div>
    );
}
