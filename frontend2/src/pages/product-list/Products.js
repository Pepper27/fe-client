import React from 'react';
import { products } from '../../data/product';
import { ProductCard } from '../../components/product-card';
import Breadcrumb from '../../components/breadcumb';
import Sidebar from '../../components/sidebar';
import './products.scss';

export default function Products() {
  return (
    <div className="products-page">
      {/* Banner */}
      <div className="products-banner">
        <img src="/client/image/vongtay.jpg" alt="Banner" className="w-full h-full object-cover" />
      </div>
      <div className="container products-inner">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Breadcrumb />
        </div>
        {/* Layout */}
        <div className="products-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <Sidebar />
          </aside>
          {/* Product List */}
          <main className="products-content">
            <div className="products-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  images={p.variants?.[0]?.images?.[0] || p.images?.[0]}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
