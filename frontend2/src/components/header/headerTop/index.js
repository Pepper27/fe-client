import React, { useEffect, useState, useRef } from "react";
import Autosuggest from "react-autosuggest";
import { useNavigate } from "react-router-dom";
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
import { formatPrice } from "../../../utils/format";
import {
  clearActiveWishlistUser,
  getWishlist,
  setActiveWishlistUser,
  subscribeWishlist,
} from "../../../utils/wishlist";
import { cacheCartCount, countCartLines } from "../../../utils/cart-count";
import { publishAuthSync } from "../../../utils/auth-sync";
import { clearAuthBlockInTab, isAuthBlockedInTab } from "../../../utils/auth-tab";

export const HeaderTop = ({ handleSearch, handleDelete, onOpenMenu }) => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      return Array.isArray(getWishlist()) ? getWishlist().length : 0;
    } catch {
      return 0;
    }
  });

  const [cartCount, setCartCount] = useState(() => {
    try {
      const cached = typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage.getItem('cart:cachedCount') : null;
      return cached !== null ? Number(cached) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let cancelled = false;

    const refreshCartCount = async () => {
      try {
        const res = await api.getCart();
        if (cancelled) return;
        const nextCount = countCartLines(res?.data || null);
        setCartCount(nextCount);
        cacheCartCount(nextCount);
      } catch {
        if (cancelled) return;
      }
    };

    const refresh = () => {
      if (isAuthBlockedInTab()) {
        setMe(null);
        clearActiveWishlistUser();
        return;
      }
      api
        .authMe()
        .then((res) => {
          if (cancelled) return;
          const nextMe = res?.data || null;
          setMe(nextMe);
          const nextUserId = nextMe?.id || nextMe?._id || "";
          if (nextUserId) setActiveWishlistUser(nextUserId);
          else clearActiveWishlistUser();
        })
        .catch(() => {
          if (cancelled) return;
          setMe(null);
          clearActiveWishlistUser();
        });
    };

    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get('refresh') === '1' || urlParams.get('tab') === 'confirmed';

    refresh();
    if (shouldRefresh) {
      refreshCartCount();
    }

    const onAuthChanged = () => {
      refresh();
      refreshCartCount();
    };
    window.addEventListener("auth:changed", onAuthChanged);


    const onCartChanged = (evt) => {
      const provided = evt?.detail?.count;
      if (typeof provided === "number" && Number.isFinite(provided)) {
        setCartCount(Math.max(0, provided));
        cacheCartCount(provided);
        return;
      }
      refreshCartCount();
    };
    window.addEventListener('cart:changed', onCartChanged);


    const onCartForceRefresh = (evt) => {
      const customCount = evt?.detail?.count !== undefined ? evt.detail.count : 0;
      setCartCount(customCount);
      cacheCartCount(customCount);

      refreshCartCount();
    };
    window.addEventListener('cart:forceRefresh', onCartForceRefresh);
    window.addEventListener('storage', refreshCartCount); 


    refreshCartCount();

    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuthChanged);
      window.removeEventListener('cart:changed', onCartChanged);

      window.removeEventListener('cart:forceRefresh', onCartForceRefresh);
      window.removeEventListener('storage', refreshCartCount);
    };
  }, []);


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

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef(null);

  const fetchSuggestions = async (q) => {
    if (!q || String(q).trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.getProducts({ q: String(q).trim(), limit: 6 });
      const items = (res?.data && Array.isArray(res.data)) ? res.data : [];
      const total = (res?.meta && Number(res.meta.total)) ? Number(res.meta.total) : items.length;
      const max = 6;
      const out = items.slice(0, max);
      if (!out.length) {
        setSuggestions([{ __empty: true }]);
        return;
      }
      if (total > out.length) out.push({ __more: true, total });
      setSuggestions(out);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  const onSuggestionsClearRequested = () => setSuggestions([]);

  const getSuggestionValue = (s) => s?.name || s?.slug || "";

  // Ensure loading state is cleared when suggestions are removed
  const onSuggestionsClearRequestedEnhanced = () => {
    setSuggestions([]);
    setSearchLoading(false);
  };

  const renderSuggestion = (s) => (
    s.__empty ? (
      <div className="search-suggestion search-empty">Không có kết quả tìm kiếm phù hợp!</div>
    ) : s.__more ? (
      <div className="search-suggestion search-more">Xem thêm {s.total} sản phẩm</div>
    ) : (
      <div className="search-suggestion">
        <div className="ss-left" style={{ minWidth: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {s?.variants?.[0]?.images?.[0] ? (
            <img
              src={s.variants[0].images[0]}
              alt={s.name || ""}
              style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6 }}
            />
          ) : (
            <div className="ss-noimg" style={{ width: 96, height: 96, background: '#f3f4f6', borderRadius: 6 }} />
          )}
        </div>
        <div className="ss-right">
          <div className="ss-name">{s.name}</div>
          <div className="ss-price">{formatPrice(Number(s?.variants?.[0]?.price) || 0)}</div>
        </div>
      </div>
    )
  );

  const onSuggestionSelected = (event, { suggestion }) => {
    // navigate to product detail or to product list for "see more"
    if (suggestion.__empty) return;
    if (suggestion.__more) {
      navigate(`/products?q=${encodeURIComponent(String(query || "").trim())}`);
      return;
    }
    if (suggestion?.slug) {
      navigate(`/product/${suggestion.slug}`);
    } else if (suggestion?._id) {
      navigate(`/product/id/${suggestion._id}`);
    }
  };

  const onLogout = async () => {
    try {
      clearAuthBlockInTab();
      clearActiveWishlistUser();
      await api.authLogout();
      publishAuthSync({ type: "logout" });
    } finally {
      setMe(null);
      window.dispatchEvent(new Event("auth:changed"));
      // Force navigation away from any protected/old state after logout.
      window.location.href = "http://localhost:3866/authen";
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
            <button className="btn-mobile mobile-search-btn" onClick={() => setShowMobileSearch(true)}>
              <CiSearch />
            </button>
          </div>

          <Link to="/">
            <img src="/client/image/logo.png" alt="logo" className="logo" />
            {/* <h1 >KIM BẢO JEWELRY</h1> */}
          </Link>

          <div className="right-group">
            {/* SEARCH DESKTOP (Ẩn trên mobile) */}
            <div className="search-wrapper desktop-only">
              <Autosuggest
                suggestions={suggestions}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequestedEnhanced}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                onSuggestionSelected={onSuggestionSelected}
                inputProps={{
                  value: query,
                  onChange: (_e, { newValue }) => {
                    setQuery(newValue);
                    if (typeof handleSearch === "function") handleSearch(newValue);
                  },

                  placeholder: "Bạn cần tìm gì?",
                  'data-search': true,
                }}
              />
              <button icon-search>
                <CiSearch />
              </button>
              <button icon-delete className={query ? "" : "hidden"} onClick={() => { setQuery(''); setSuggestions([]); if (typeof handleDelete === 'function') handleDelete(); }}>
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
                aria-label="Thiết kế của bạn"
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

        {/* MOBILE SEARCH MODAL */}
        {showMobileSearch && (
          <div className="mobile-search-modal">
            <div className="mobile-search-overlay" onClick={() => setShowMobileSearch(false)}></div>
            <div className="mobile-search-container">
              <div className="mobile-search-header">
                <h3>Tìm kiếm sản phẩm</h3>
                <button className="close-btn" onClick={() => setShowMobileSearch(false)}>
                  <IoCloseOutline />
                </button>
              </div>
              <div className="mobile-search-input-wrapper">
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequestedEnhanced}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  onSuggestionSelected={(event, { suggestion }) => {
                    if (suggestion.__more) {
                      navigate(`/products?q=${encodeURIComponent(String(query || "").trim())}`);
                      setShowMobileSearch(false);
                      return;
                    }
                    if (suggestion?.slug) {
                      navigate(`/product/${suggestion.slug}`);
                    } else if (suggestion?._id) {
                      navigate(`/product/id/${suggestion._id}`);
                    }
                    setShowMobileSearch(false);
                  }}
                  inputProps={{
                    value: query,
                    onChange: (_e, { newValue }) => {
                      setQuery(newValue);
                      if (typeof handleSearch === "function") handleSearch(newValue);
                    },
                    placeholder: "Tìm kiếm sản phẩm...",
                    'data-search': true,
                    className: "mobile-search-input",
                  }}
                />
                <button 
                  className="mobile-search-clear" 
                  onClick={() => { 
                    setQuery(''); 
                    setSuggestions([]); 
                    if (typeof handleDelete === 'function') handleDelete(); 
                  }}
                >
                  <IoCloseOutline />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
