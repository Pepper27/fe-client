// pages/collection-products/index.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../utils/api";
import { ProductCard } from "../../components/product-card";

export const CollectionProducts = () => {
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // First get the collection info by fetching collections and finding the matching one
        const collectionsRes = await api.getCollections();
        const allCollections = collectionsRes?.data || [];
        const foundCollection = allCollections.find(
          (c) => c.slug === slug || c._id === slug || String(c._id) === slug,
        );

        if (foundCollection) {
          setCollection(foundCollection);

          // Then get products for this collection using our new API endpoint
          const productsRes = await api.getProductsByCollection({
            collectionId: foundCollection._id || foundCollection.id || slug,
            page: 1,
            limit: 100,
            includeFilters: false,
          });

          setProducts(productsRes?.data || []);
        } else {
          // Collection not found
          setCollection(null);
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
        setCollection(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  return (
    <section className="container">
      {loading ? (
        <div className="collection-page">
          <h1>Đang tải...</h1>
        </div>
      ) : !collection ? (
        <div className="collection-page">
          <h1>Không tìm thấy bộ sưu tập</h1>
          <p>Bộ sưu tập bạn đang tìm không tồn tại.</p>
        </div>
      ) : (
        <div className="collection-page">
          <h1>{collection.name}</h1>
          {collection.description && (
            <p className="collection-description">{collection.description}</p>
          )}

          <div className="product-grid">
            {products.length === 0 ? (
              <p className="no-products">
                Hiện chưa có sản phẩm trong bộ sưu tập này.
              </p>
            ) : (
              products.map((item) => {
                const firstVariant = item?.variants?.[0];

                return (
                  <ProductCard
                    key={item._id}
                    id={String(item._id)}
                    slug={item.slug}
                    name={item.name}
                    price={firstVariant?.price || 0}
                    images={firstVariant?.images?.[0] || ""}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </section>
  );
};
