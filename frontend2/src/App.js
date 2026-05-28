import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProductsPage from "./pages/product-list/Products";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import CollectionProducts from "./pages/collection";
import ProductDetailPage from "./pages/product-detail";
import { DeliveryPaymentPolicy, WarrantyPolicy, PrivacyPolicy, TermsOfService } from "./pages/policies";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham" element={<ProductsPage />} />
          <Route path="/collections/:slug" element={<CollectionProducts />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/admin/tao-san-pham" element={<ProductCreatePage />} />
          <Route path="/chinh-sach-nhan-hang" element={<DeliveryPaymentPolicy />} />
          <Route path="/chinh-sach-bao-hanh" element={<WarrantyPolicy />} />
          <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
          <Route path="/dieu-khoan-dich-vu" element={<TermsOfService />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
