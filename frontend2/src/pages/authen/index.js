import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import "./index.scss";

export default function Authentication() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const activeTab = searchParams.get("tab") === "register" ? "register" : "login";

  const heading = useMemo(
    () => (activeTab === "register" ? "TẠO TÀI KHOẢN CỦA TÔI" : "TÀI KHOẢN CỦA TÔI"),
    [activeTab]
  );

  return (
    <div className="auth-page">
      <div className="auth-shell container">
        <h1 className="auth-title">{heading}</h1>
        <p className="auth-subtitle">
          {activeTab === "register"
            ? "Đăng ký ngay để nhận các ưu đãi độc quyền từ Pandora"
            : "Đăng nhập ngay để nhận các ưu đãi độc quyền từ Pandora"}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Tài khoản">
          <Link
            to="/authen"
            role="tab"
            aria-selected={activeTab === "login"}
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
          >
            ĐĂNG NHẬP
          </Link>
          <Link
            to="/authen?tab=register"
            role="tab"
            aria-selected={activeTab === "register"}
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
          >
            ĐĂNG KÝ
          </Link>
        </div>

        <div className="auth-card">
          {activeTab === "login" ? (
            <form className="auth-form">
              <input type="email" placeholder="Email *" aria-label="Email" />
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu *"
                  aria-label="Mật khẩu"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </div>
              <div className="forgot-row">
                <button type="button" onClick={() => setIsForgotOpen(true)}>
                  Quên mật khẩu?
                </button>
              </div>
              <button type="submit" className="primary-action">
                ĐĂNG NHẬP
              </button>
              <div className="divider-text">Hoặc</div>
              <button type="button" className="social-btn google-btn">
                <FaGoogle className="social-icon" aria-hidden="true" />
                ĐĂNG NHẬP GOOGLE
              </button>
              <button type="button" className="social-btn facebook-btn">
                <FaFacebookF className="social-icon" aria-hidden="true" />
                ĐĂNG NHẬP FACEBOOK
              </button>
            </form>
          ) : (
            <form className="auth-form">
              <input type="text" placeholder="Họ và tên *" aria-label="Họ và tên" />
              <input type="email" placeholder="Email *" aria-label="Email" />
              <input type="number" placeholder="Số điện thoại *" aria-label="Số điện thoại" />
              <input type="date" placeholder="Ngày/tháng/năm" aria-label="Ngày sinh" />
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu *"
                  aria-label="Mật khẩu"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </div>
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Xác nhận mật khẩu *"
                  aria-label="Xác nhận mật khẩu"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </div>
              <button type="submit" className="primary-action">
                ĐĂNG KÝ
              </button>
              <div className="divider-text">Hoặc</div>
              <button type="button" className="social-btn google-btn">
                <FaGoogle className="social-icon" aria-hidden="true" />
                ĐĂNG KÝ GOOGLE
              </button>
              <button type="button" className="social-btn facebook-btn">
                <FaFacebookF className="social-icon" aria-hidden="true" />
                ĐĂNG KÝ FACEBOOK
              </button>
            </form>
          )}
        </div>
      </div>

      {isForgotOpen ? (
        <div className="forgot-modal-overlay" onClick={() => setIsForgotOpen(false)}>
          <div
            className="forgot-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quên mật khẩu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="forgot-modal-header">
              <h2>QUÊN MẬT KHẨU</h2>
              <button
                type="button"
                className="forgot-modal-close"
                aria-label="Đóng popup quên mật khẩu"
                onClick={() => setIsForgotOpen(false)}
              >
                <IoCloseOutline />
              </button>
            </div>

            <p className="forgot-modal-text">
              Vui lòng nhập địa chỉ email đã đăng ký của bạn để nhận email thông báo khôi phục mật
              khẩu từ chúng tôi.
            </p>

            <input type="email" placeholder="Email" aria-label="Email khôi phục" />

            <button type="button" className="forgot-modal-submit">
              KHÔI PHỤC
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}