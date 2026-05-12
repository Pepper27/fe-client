import React, { useEffect, useState } from "react";
import { CiSearch, CiShoppingCart } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { TfiLocationPin } from "react-icons/tfi";
import { MdMenu } from "react-icons/md";
import { RiSparkling2Line } from "react-icons/ri";
import { RiFileList2Line } from "react-icons/ri";
import "./index.scss";
import "../cartBadge.scss";
import { Link } from "react-router-dom";
import { api } from "../../../utils/api";
import { getWishlist, subscribeWishlist } from "../../../utils/wishlist";

export const HeaderTop = ({ handleSearch, handleDelete, onOpenMenu }) => {
  const [me, setMe] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      return Array.isArray(getWishlist()) ? getWishlist().length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      // Prefer legacy cookie auth (has register/logout/forgot).
      // If BE later switches header UI to v1 bearer, we can flip this.
      api
        .authMe()
        .then((res) => {
          if (cancelled) return;
          setMe(res?.data || null);
        })
        .catch(() => {
          if (cancelled) return;
          setMe(null);
        });
    };

    refresh();
    const onAuthChanged = () => refresh();
    window.addEventListener("auth:changed", onAuthChanged);
    // listen to cart changes to update badge
    const onCartChanged = async (evt) => {
      try {
        // If emitter provided immediate count, use it to avoid an extra request
        const provided = evt && evt.detail && typeof evt.detail.count === 'number' ? evt.detail.count : null;
        if (typeof provided === 'number') {
          setCartCount(provided);
          try { window.sessionStorage.setItem('cart:cachedCount', String(provided)); } catch {}
          return;
        }
        const res = await api.getCart();
        const cart = res?.data || null;
        const qty = (cart?.products || []).reduce((s, p) => s + (Number(p.quantity) || 0), 0) + (cart?.bundles || []).reduce((s, b) => s + (Number(b.quantity) || 0), 0);
        setCartCount(qty);
        try { window.sessionStorage.setItem('cart:cachedCount', String(qty)); } catch {}
      } catch {
        setCartCount(0);
      }
    };
    // call once to populate initial badge
    try {
      const hasBuyNow = typeof window !== 'undefined' && window.sessionStorage && window.sessionStorage.getItem('checkout:buyNow');
      if (hasBuyNow) {
        try {
          const cached = window.sessionStorage.getItem('cart:cachedCount');
          if (cached !== null) setCartCount(Number(cached));
        } catch {}
      } else {
        onCartChanged();
      }
    } catch {
      onCartChanged();
    }
    window.addEventListener('cart:changed', onCartChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener('cart:changed', onCartChanged);
    };
  }, []);

  const [cartCount, setCartCount] = useState(() => {
    try {
      const cached = typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage.getItem('cart:cachedCount') : null;
      return cached !== null ? Number(cached) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    // subscribe to wishlist updates and keep badge count in sync
    const unsub = subscribeWishlist((items) => {
      try {
        setWishlistCount(Array.isArray(items) ? items.length : 0);
      } catch {
        setWishlistCount(0);
      }
    });
    return unsub;
  }, []);

  const onLogout = async () => {
    try {
      await api.authLogout();
    } finally {
      setMe(null);
      window.dispatchEvent(new Event("auth:changed"));
    }
  };

  return (
    <div className="header-top">
      <div className="container">
        <div className="top-content">
          {/* --- MOBILE BUTTONS --- */}
          <div className="mobile-toggle">
            <button className="btn-mobile" onClick={onOpenMenu}>
              <MdMenu />
            </button>
            <button className="btn-mobile mobile-search-btn">
              <CiSearch />
            </button>
          </div>

          <Link to="/">
            <img src="/client/image/logo.jpg" alt="logo" className="logo" />
          </Link>

          <div className="right-group">
            {/* SEARCH DESKTOP (Ẩn trên mobile) */}
            <div className="search-wrapper desktop-only">
              <input
                data-search
                type="text"
                onChange={handleSearch}
                placeholder="Mày cần tìm gì?"
              />
              <button icon-search>
                <CiSearch />
              </button>
              <button icon-delete className="hidden" onClick={handleDelete}>
                <IoCloseOutline />
              </button>
            </div>

            <div className="icon-actions">
              {/* <button className="icon-btn heart-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </button> */}
              <Link to="/wishlist" className="icon-btn heart-btn" aria-label="Yêu thích">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                </svg>
                {wishlistCount > 0 ? (
                  <span className="wishlist-badge" aria-hidden="true">{wishlistCount}</span>
                ) : null}
              </Link>
              <Link
                to="/design"
                className="icon-btn"
                aria-label="Design của bạn"
              >
                <RiSparkling2Line />
              </Link>
              <Link
                to="/orders"
                className="icon-btn"
                aria-label="Trạng thái đơn hàng"
              >
                <RiFileList2Line />
              </Link>
              <button className="icon-btn desktop-only">
                <TfiLocationPin />
              </button>
              <div className="icon-btn has-popover">
                <Link
                  to="/authen"
                  className="account-icon-link"
                  aria-label="Đăng nhập tài khoản"
                >
                  <BsPerson />
                </Link>
                <div className="popover-box">
                  {me ? (
                    <>
                      <div
                        style={{
                          width: "80%",
                          margin: "14px auto 10px",
                          fontWeight: 800,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        Xin chào, {me.fullName || me.email}
                      </div>
                      <button
                        type="button"
                        onClick={onLogout}
                        style={{
                          width: "80%",
                          background: "#000",
                          color: "#fff",
                          padding: "13px 0",
                          fontWeight: 700,
                          fontSize: 14,
                          margin: "0 auto 14px",
                          border: "none",
                          letterSpacing: 1,
                          display: "block",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        ĐĂNG XUẤT
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/authen"
                        style={{
                          width: "80%",
                          background: "#000",
                          color: "#fff",
                          padding: "13px 0",
                          fontWeight: 700,
                          fontSize: 14,
                          margin: "14px auto 14px",
                          border: "none",
                          letterSpacing: 1,
                          display: "block",
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        ĐĂNG NHẬP
                      </Link>
                      <Link
                        to="/authen?tab=register"
                        style={{
                          width: "80%",
                          background: "#000",
                          color: "#fff",
                          padding: "13px 0",
                          fontWeight: 700,
                          fontSize: 14,
                          margin: "0 auto 14px",
                          border: "none",
                          letterSpacing: 1,
                          display: "block",
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        ĐĂNG KÝ
                      </Link>
                    </>
                  )}
                  <img
                    src="/client/image/wow.png"
                    alt="member"
                    style={{
                      width: "100%",
                      marginBottom: 18,
                      display: "block",
                    }}
                  />
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      color: "#222",
                      lineHeight: 1.3,
                      margin: "14px auto 14px",
                      fontWeight: 600,
                    }}
                  >
                    Đăng ký thành viên PANDORA ngay
                    <br />
                    để tận hưởng ưu đãi độc quyền online.
                  </div>
                </div>
              </div>
              <Link to="/cart" className="icon-btn" aria-label="Giỏ hàng">
                <CiShoppingCart />
                {cartCount > 0 ? <span className="cart-badge" aria-hidden>{cartCount}</span> : null}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
