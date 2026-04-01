import React, { useState } from 'react';
import { HeaderTop } from "./headerTop";
import { HeaderMenu } from "./headerMenu";

export const Header = () => {
  // Tạo trạng thái đóng mở menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="main-header">
      {/* Truyền hàm mở menu vào HeaderTop */}
      <HeaderTop onOpenMenu={toggleMenu} />
      
      {/* Truyền trạng thái và hàm đóng vào HeaderMenu */}
      <HeaderMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </header>
  );
};