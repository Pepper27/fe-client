import { products } from "../../../data/product";
import { ProductCard } from "../../../components/product-card/index";
import "./index.scss";

export const ProductSignature = () => {
    return (
        <section className="product-signature-wrapper">
            <div className="container">
                <div className="signature-title-box">
                    Sản Phẩm Bán Chạy
                </div>
                <div className="product-grid-layout">
                    {products.slice(0, 4).map((item) => (
                        <ProductCard
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            images={item.variants[0].images[0]}
                        />
                    ))}
                </div>
                <div className="btnWatch">
                    <button className="btn">XEM NGAY</button>
                </div>
            </div>
        </section>
    );
};
