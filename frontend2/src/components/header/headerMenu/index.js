import React, { useMemo, useRef, useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./index.scss";
import { api } from "../../../utils/api";

const safeStr = (v) => String(v ?? "").trim();
const isBlank = (v) => !safeStr(v);

export const HeaderMenu = ({ isOpen, onClose }) => {
  const [openSub, setOpenSub] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const hoverTimeout = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api
      // root=0 => return all categories so we can build parent/child menu.
      .getCategories({ root: 0 })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setAllCategories(list);
      })
      .catch(() => {
        if (cancelled) return;
        setAllCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { roots, childrenByParent } = useMemo(() => {
  const list = Array.isArray(allCategories) ? allCategories : [];

  const byParent = {};
  for (const c of list) {
    const parent = safeStr(c?.parent);
    if (isBlank(parent)) continue;
    if (!byParent[parent]) byParent[parent] = [];
    byParent[parent].push(c);
  }
  const rootLevel0 = list.filter(
    (c) => isBlank(c?.parent)
  );

  const rootIds = rootLevel0.map((c) => String(c._id));
  const rootLevel1 = list.filter((c) =>
    rootIds.includes(safeStr(c?.parent))
  );
  const sortFn = (a, b) => {
    const pa = Number(a?.position ?? 0);
    const pb = Number(b?.position ?? 0);
    if (pa !== pb) return pa - pb;
    return safeStr(a?.name).localeCompare(safeStr(b?.name));
  };

  const level0Sorted = rootLevel0.slice().sort(sortFn);
  const level1Sorted = rootLevel1.slice().sort(sortFn);

  const rootCats = [...level0Sorted, ...level1Sorted];

  for (const k of Object.keys(byParent)) {
    byParent[k].sort((a, b) => {
      const pa = Number(a?.position ?? 0);
      const pb = Number(b?.position ?? 0);
      if (pa !== pb) return pa - pb;
      return safeStr(a?.name).localeCompare(safeStr(b?.name));
    });
  }

    return { roots: rootCats, childrenByParent: byParent };
    
  }, [allCategories]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpenSub(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openWithDelay = (title) => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenSub(title), 120);
  };

  const closeWithDelay = () => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpenSub(null), 160);
  };

  // Mobile click toggle is currently not wired in markup.
  // Keeping old handler commented-out to avoid dead code warnings.
  const priceRanges = [
    {
      label: "Dưới 2,5 triệu",
      query: { price_lte: 2500000 },
    },
    {
      label: "Từ 2,5 - 5 triệu",
      query: { price_gte: 2500000, price_lte: 5000000 },
    },
    {
      label: "Từ 5 - 7 triệu",
      query: { price_gte: 5000000, price_lte: 7000000 },
    },
    {
      label: "Trên 7 triệu",
      query: { price_gte: 7000000 },
    },
  ];
  const materials = [
    {
      label: "Bạc",
      query: { material:"bac" },
    },
    {
      label: "Mạ vàng 14k",
      query: { material:"ma-vang" },
    },
    {
      label: "Vàng hồng 14k",
      query: { material:"vang-hong" },
    },
   
  ];

  return (
    <>
      <div
        className={`menu-overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      ></div>

      <nav ref={menuRef} className={`header-menu ${isOpen ? "is-open" : ""}`}
        onMouseLeave={closeWithDelay}
        >
        <div className="container">
          <ul className="menu-list">
            {roots.map((item) => (
              <li
                key={item?._id}
                className={`menu-item has-dropdown ${openSub === item?._id ? "submenu-open" : ""}`}
                onMouseEnter={() => openWithDelay(item?._id)}
                // onMouseLeave={() => closeWithDelay()}
              >
                <div className="menu-top">
                  <Link
                    to={`/products?categorySlug=${encodeURIComponent(safeStr(item?.slug))}`}
                    className="menu-link"
                  >
                    {item?.name}
                  </Link>
                  <FaAngleDown className="icon-down" />
                </div>
              </li>
            ))}

          </ul>
          {/* Shared submenu: fixed position below header, updates content based on `openSub` */}
          {(() => {
            const active =
              roots.find((m) => String(m?._id) === String(openSub)) || null;
            const children = active
              ? childrenByParent[String(active._id)] || []
              : [];
            return (
              <div
                id={`shared-submenu`}
                className={`dropdown-container shared ${openSub ? "open" : ""}`}
                role="region"
                aria-hidden={!openSub}
              >
                <div className="dropdown-box content-center">
                  {active ? (
                    <>
                      <div className="dropdown-col">
                        <span className="dropdown-title">DANH MỤC</span>
                        <ul className="submenu">
                          <li>
                            <Link
                              to={`/products?categorySlug=${encodeURIComponent(safeStr(active?.slug))}`}
                            >
                              Xem tất cả
                            </Link>
                          </li>
                          {children.map((c) => (
                            <li key={c._id}>
                              <Link
                                to={`/products?categorySlug=${encodeURIComponent(safeStr(c?.slug))}`}
                              >
                                {c?.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {active?.collections?.length > 0 && (
                        <div className="dropdown-col">
                          <span className="dropdown-title">Theo chủ đề</span>
                          <ul className="submenu">
                            {(active.collections || []).map((col) => {
                              const params = new URLSearchParams({
                                categorySlug: safeStr(active?.slug),
                                collection: safeStr(col?.slug),
                              }).toString();

                              return (
                                <li key={col._id}>
                                  <Link to={`/products?${params}`}>
                                    {col?.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      <div className="dropdown-col">
                        <span className="dropdown-title">Chất liệu</span>
                        <ul className="submenu">
                          {materials.map((item, index) => {
                            const params = new URLSearchParams({
                              categorySlug: safeStr(active?.slug),
                              ...item.query,
                            }).toString();

                            return (
                              <li key={index}>
                                <Link to={`/products?${params}`}>
                                  {item.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="dropdown-col">
                        <span className="dropdown-title">THEO MỨC GIÁ</span>
                        <ul className="submenu">
                          {priceRanges.map((item, index) => {
                            const params = new URLSearchParams({
                              categorySlug: safeStr(active?.slug),
                              ...item.query,
                            }).toString();

                            return (
                              <li key={index}>
                                <Link to={`/products?${params}`}>
                                  {item.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </>
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
