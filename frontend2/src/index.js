import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Header } from "./components/header";
import { BannerImage } from "./components/banner";
import { Home } from "./components/home";
import { Footer } from "./components/footer";
import Products from "./pages/product-list/Products";
import ProductDetailPage from "./pages/product-detail";
import Wishlist from "./pages/wishlist";
import Authentication from "./pages/authen";
import DesignBuilder from "./pages/design";
import DesignList from "./pages/design-list";
import Cart from "./pages/Cart";
import OrdersPage from "./pages/orders";
import OrderDetailPage from "./pages/orders/detail";
import CheckoutPage from "./pages/checkout";

// Load runtime config (public/config.json) so the API base can be injected at deploy time
async function loadRuntimeConfig() {
  try {
    const res = await fetch('/config.json', { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = await res.json();
    if (cfg && cfg.REACT_APP_API_BASE) {
      // expose to window so other modules (api.js) can read it at runtime
      window.__API_BASE = cfg.REACT_APP_API_BASE;
    }
  } catch (e) {
    // ignore — fallback to env/default will be used
  }
}

function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <BannerImage />
              <Home />
            </>
          }
        />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetailPageWrapper />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/authen" element={<Authentication />} />
        <Route path="/design" element={<DesignList />} />
        <Route path="/design/mix" element={<DesignBuilder />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/detail/:orderCode" element={<OrderDetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>,
  );
}

function ProductDetailPageWrapper() {
  const { slug } = useParams();
  return <ProductDetailPage params={{ slug }} />;
}

// Load config then bootstrap the app
(async function bootstrap() {
  await loadRuntimeConfig();
  renderApp();
  reportWebVitals();
})();
