import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProductsPage from "./pages/product-list/Products";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import CollectionProducts from "./pages/collection";
import ProductDetailPage from "./pages/product-detail";
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
