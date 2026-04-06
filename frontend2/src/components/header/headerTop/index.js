import React from 'react';
import { CiSearch, CiShoppingCart } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { TfiLocationPin } from "react-icons/tfi";
import { MdMenu } from "react-icons/md";
import { RiSparkling2Line } from "react-icons/ri";
import "./index.scss";
import { Link } from 'react-router-dom';

export const HeaderTop = ({ handleSearch, handleDelete, onOpenMenu }) => {
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

          <img src="/client/image/logo.jpg" alt="logo" className="logo" />

          <div className="right-group">
            {/* SEARCH DESKTOP (Ẩn trên mobile) */}
            <div className="search-wrapper desktop-only">
              <input
                data-search
                type="text"
                onChange={handleSearch}
                placeholder="Mày cần tìm gì?"
              />
              <button icon-search><CiSearch /></button>
              <button icon-delete className="hidden" onClick={handleDelete}><IoCloseOutline /></button>
            </div>

            <div className="icon-actions">
              {/* <button className="icon-btn heart-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </button> */}
              <Link to="/wishlist" className="icon-btn heart-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </Link>
              <Link to="/design" className="icon-btn" aria-label="Mix charm">
                <RiSparkling2Line />
              </Link>
              <button className="icon-btn desktop-only"><TfiLocationPin /></button>
              <div className="icon-btn has-popover">
                <Link to="/authen" className="account-icon-link" aria-label="Đăng nhập tài khoản">
                  <BsPerson />
                </Link>
                <div className="popover-box">
                  <Link to="/authen" style={{ width: "80%", background: "#000", color: "#fff", padding: "13px 0", fontWeight: 700, fontSize: 14, margin: "14px auto 14px", border: "none", letterSpacing: 1, display: "block", textAlign: "center", textDecoration: "none" }}>ĐĂNG NHẬP</Link>
                  <Link to="/authen?tab=register" style={{ width: "80%", background: "#000", color: "#fff", padding: "13px 0", fontWeight: 700, fontSize: 14, margin: "0 auto 14px", border: "none", letterSpacing: 1, display: "block", textAlign: "center", textDecoration: "none" }}>ĐĂNG KÝ</Link>
                  <img src="/client/image/wow.png" alt="member" style={{ width: "100%", marginBottom: 18, display: "block" }} />
                  <div style={{ textAlign: "center", fontSize: 13, color: "#222", lineHeight: 1.3, margin: "14px auto 14px", fontWeight: 600 }}>
                    Đăng ký thành viên PANDORA ngay<br />
                    để tận hưởng ưu đãi độc quyền online.
                  </div>
                </div>
              </div>
              <Link to="/cart" className="icon-btn" aria-label="Giỏ hàng">
                <CiShoppingCart />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
