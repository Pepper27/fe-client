import React, { useState, useRef, useEffect } from 'react';
import { FaAngleDown } from "react-icons/fa6";
import "./index.scss";

// data structure for menus with sample children and promo image paths
const MENU_DATA = [
  { title: 'BỘ SƯU TẬP MỚI', children: ['Sản phẩm mới nhất', 'Bộ sưu tập mùa'], image: '/client/image/ads.jpg' },
  { title: 'VÒNG TAY', children: ['Vòng tay bạc', 'Vòng tay vàng', 'Vòng charm'], image: '/client/image/vongtay.jpg' },
  { title: 'CHARMS', children: ['Charm đính đá', 'Charm ký tự', 'Charm limited'], image: '/client/image/charm.png' },
  { title: 'DÂY CHUYỀN', children: ['Dây chuyền bạc', 'Dây chuyền vàng'], image: '/client/image/nhan.png' },
  { title: 'HOA TAI', children: ['Hoa tai đơn', 'Hoa tai bộ'], image: '/client/image/new.png' },
  { title: 'NHẪN', children: ['Nhẫn trơn', 'Nhẫn đá'], image: '/client/image/nhan.png' },
  { title: 'THEO CHỦ ĐỀ', children: ['Valentine', 'Tình yêu', 'Bữa tiệc'], image: '/client/image/goiy.png' },
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const HeaderMenu = ({ isOpen, onClose }) => {
  const [openSub, setOpenSub] = useState(null);
  const hoverTimeout = useRef(null);
  const menuRef = useRef(null);

  // close on escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenSub(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openWithDelay = (title) => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenSub(title), 120);
  };

  const closeWithDelay = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenSub(null), 160);
  };

  const handleToggleSub = (e, name) => {
    // mobile: toggle on click
    if (window.innerWidth <= 768) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setOpenSub(openSub === name ? null : name);
    }
  };

  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

      <nav ref={menuRef} className={`header-menu ${isOpen ? 'is-open' : ''}`}>
        <div className="container">
          <ul className="menu-list">
            {MENU_DATA.map((item) => (
              <li
                key={item.title}
                className={`menu-item has-dropdown ${openSub === item.title ? 'submenu-open' : ''}`}
                onMouseEnter={() => openWithDelay(item.title)}
                onMouseLeave={() => closeWithDelay()}
              >
                <div className="menu-top">
                  <a href={`/category/${slugify(item.title)}`} className="menu-link">{item.title}</a>
                  <FaAngleDown className="icon-down" />
                  {/* <button
                    type="button"
                    className="menu-toggle"
                    aria-expanded={openSub === item.title}
                    aria-controls={`submenu-${slugify(item.title)}`}
                    onClick={(e) => handleToggleSub(e, item.title)}
                  >
                    <FaAngleDown className="icon-down" />
                  </button> */}
                </div>

                {/* per-item dropdown removed — using shared submenu below */}
              </li>
            ))}
          </ul>
          {/* Shared submenu: fixed position below header, updates content based on `openSub` */}
          {(() => {
            const active = MENU_DATA.find((m) => m.title === openSub) || null;
            return (
              <div
                id={`shared-submenu`}
                className={`dropdown-container shared ${openSub ? 'open' : ''}`}
                role="region"
                aria-hidden={!openSub}
              >
                <div className="dropdown-box content-center">
                  {active ? (
                    active.children && (
                      <>
                        {/** render children in columns (split roughly) **/}
                        <div className="dropdown-col">
                          <span className="dropdown-title">PHÂN LOẠI</span>
                          <ul className="submenu">
                            {active.children.map((c, i) => (
                              <li key={i}><a href="#">{c}</a></li>
                            ))}
                          </ul>
                        </div>
                        {/* placeholder additional columns - can be populated from API later */}
                        <div className="dropdown-col">
                          <span className="dropdown-title">THEO CHỦ ĐỀ</span>
                          <ul className="submenu">
                            <li><a href="#">Mẫu 1</a></li>
                            <li><a href="#">Mẫu 2</a></li>
                            <li><a href="#">Mẫu 3</a></li>
                          </ul>
                        </div>
                        <div className="dropdown-col">
                          <span className="dropdown-title">THEO MỨC GIÁ</span>
                          <ul className="submenu">
                            <li><a href="#">Dưới 1 triệu</a></li>
                            <li><a href="#">1-2 triệu</a></li>
                            <li><a href="#">Trên 2 triệu</a></li>
                          </ul>
                        </div>
                      </>
                    )
                  ) : null}
                </div>
              </div>
            );
          })()}
        </div>
      </nav>
    </>
  );
};
