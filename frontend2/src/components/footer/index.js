import React from 'react';
import { FaLocationDot, FaYoutube, FaFacebookF, FaPhoneFlip } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { SiZalo } from "react-icons/si";
import './index.scss';

export const Footer = () => {
    const FOOTER_LINKS = [
        { text: "Nhận hàng - Thanh toán", path: "/" },
        { text: "Chính sách bảo hành", path: "/" },
        { text: "Chính sách bảo mật", path: "/" },
        { text: "Điều khoản dịch vụ", path: "/" },
    ];

    const CONTACT_INFO = {
        address: "Khương Đình - Thanh Xuân - Hà Nội",
        phone: "0914913491",
        email: "contact@petcare.com.vn"
    };
    return (
        <footer className="footer-main">
            <div className="container">
                {/* Newsletter Section */}
                <div className="newsletter-box">
                    <div className="newsletter-text">
                        Đăng ký ngay để không bỏ lỡ các <br /> Chương trình - Mã giảm giá của Pet Care
                    </div>
                    <div className="newsletter-form">
                        <input type="email" placeholder="Nhập email của bạn..." />
                        <button>Đăng ký ngay</button>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="footer-grid">
                    <div className="footer-column">
                        <h4>Liên hệ pet care</h4>
                        <div className="content-list">
                            <span><FaLocationDot /> {CONTACT_INFO.address}</span>
                            <span><FaPhoneFlip /> Hotline: {CONTACT_INFO.phone}</span>
                            <span><MdEmail /> {CONTACT_INFO.email}</span>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>SƠ LƯỢC VỀ PET Care</h4>
                        <p className="description">
                            Pet Care là trại nhân giống cung cấp thú cảnh lớn tại Việt Nam...
                        </p>
                    </div>

                    <div className="footer-column">
                        <h4>Chính sách mua hàng</h4>
                        <nav className="content-list">
                            {FOOTER_LINKS.map((link, index) => (
                                <a key={index} href={link.path}>{link.text}</a>
                            ))}
                        </nav>
                    </div>

                    <div className="footer-column">
                        <h4>Kết nối - Thanh toán</h4>
                        <div className="social-icons">
                            <div className="icon-circle youtube"><FaYoutube /></div>
                            <div className="icon-circle fb"><FaFacebookF /></div>
                            <div className="icon-circle zalo"><SiZalo /></div>
                        </div>
                        <div className="payment-methods">
                            <img src="/client/image/icon-visa.svg" alt="visa" />
                            {/* Thêm các icon khác tương tự */}
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="footer-bottom">
                    <span>Copyright 2025 @ PetCare</span>
                    <div className="bottom-links">
                        <a href="/">Điều khoản dịch vụ</a>
                        <a href="/">Chính sách bảo mật</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};