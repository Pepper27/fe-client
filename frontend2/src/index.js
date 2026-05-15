import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Toaster } from "react-hot-toast";
import { Header } from "./components/header";
import { BannerImage } from "./components/banner";
import { Home } from "./pages/home";
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
import ZaloPayReturn from "./pages/zalopay-return";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import TestAPICall from "./components/TestAPICall";
import SimpleAPITest from "./components/SimpleAPITest";
import BestSellersPage from "./pages/product-bestseller/BestSellersPage";
import BlogDetailPage from "./pages/blog-detail";

// Load runtime config (public/config.json) so the API base can be injected at deploy time
async function loadRuntimeConfig() {
  try {
    // Decide API base:
    // - If FE is served from the backend origin, same-origin is correct.
    // - If FE is served from CRA dev server (3000), default to the backend dev port.
    // Backend in this repo defaults to 3861 (see Backend-charm/index.js).
    if (process.env.REACT_APP_API_BASE) {
      window.__API_BASE = process.env.REACT_APP_API_BASE;
    } else if (process.env.NODE_ENV === "development") {
      window.__API_BASE =
        window.location.port === "3866"
          ? "http://localhost:3861"
          : window.location.origin;
    }

    // In production, you can still try to load from config.json
    if (process.env.NODE_ENV !== "development") {
      try {
        const res = await fetch("/config.json", { cache: "no-store" });
        if (!res.ok) return;
        const cfg = await res.json();
        if (cfg && cfg.REACT_APP_API_BASE) {
          window.__API_BASE = cfg.REACT_APP_API_BASE;
        }
      } catch (e) {
        // ignore — fallback to the hardcoded URL will be used
        console.warn("Failed to load config.json, using fallback URL");
      }
    }
  } catch (e) {
    // ignore — fallback to env/default will be used
    console.warn("Error in loadRuntimeConfig:", e);
  }
}

function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <div className="main-content">
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
            <Route
              path="/products/collections/:collectionSlug"
              element={<Products />}
            />
            <Route
              path="/products/best-sellers"
              element={<BestSellersPage />}
            />
            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
            <Route
              path="/product/:slug"
              element={<ProductDetailPageWrapper />}
            />
            <Route path="/collections/:slug" element={<CollectionRedirect />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/authen" element={<Authentication />} />
            <Route path="/design" element={<DesignList />} />
            <Route path="/design/mix" element={<DesignBuilder />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/zalopay/return" element={<ZaloPayReturn />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route
              path="/orders/detail/:orderCode"
              element={<OrderDetailPage />}
            />
            <Route path="/admin/tao-san-pham" element={<ProductCreatePage />} />
            <Route path="/test-api" element={<TestAPICall />} />
            <Route path="/simple-test" element={<SimpleAPITest />} />
          </Routes>
        </div>
        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 2147483647 }}
          toastOptions={{
            duration: 3000,
            success: { duration: 2800 },
            error: { duration: 3600 },
          }}
        />
        <Footer />
      </div>
    </BrowserRouter>,
  );
}

function ProductDetailPageWrapper() {
  const { slug } = useParams();
  return <ProductDetailPage params={{ slug }} />;
}

function CollectionRedirect() {
  const { slug } = useParams();
  return (
    <Navigate
      to={`/products/collections/${encodeURIComponent(String(slug || "").trim())}`}
      replace
    />
  );
}

// Load config then bootstrap the app
(async function bootstrap() {
  await loadRuntimeConfig();
  renderApp();
  reportWebVitals();
})();
