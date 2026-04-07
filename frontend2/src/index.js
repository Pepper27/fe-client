import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Header } from './components/header';
import { BannerImage } from './components/banner';
import { Home } from './components/home';
import { Footer } from './components/footer';
import Products from './pages/product-list/Products';
import ProductDetailPage from './pages/product-detail';
import Wishlist from './pages/wishlist';
import Authentication from './pages/authen';
import DesignBuilder from './pages/design';
import DesignList from './pages/design-list';
import Cart from './pages/Cart';

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
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/authen" element={<Authentication />} />
      <Route path="/design" element={<DesignList />} />
      <Route path="/design/mix" element={<DesignBuilder />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
    <Footer />
  </BrowserRouter>
);

function ProductDetailPageWrapper() {
  const { id } = useParams();
  return <ProductDetailPage params={{ id }} />;
}

reportWebVitals();
