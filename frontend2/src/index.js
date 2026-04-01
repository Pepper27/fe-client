import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Header } from './components/header';
import { BannerImage } from './components/banner';
import { Home } from './components/home';
import { Footer } from './components/footer';
import Products from './pages/Products';
import ProductDetailPage from './components/product-detail';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Header />
    <Routes>
      <Route path="/" element={
        <>
          <BannerImage />
          <Home />
        </>
      } />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetailPageWrapper />} />
    </Routes>
    <Footer />
  </BrowserRouter>
);

function ProductDetailPageWrapper() {
  const { id } = useParams();
  return <ProductDetailPage params={{ id }} />;
}

reportWebVitals();
