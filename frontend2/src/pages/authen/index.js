import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { api } from "../../utils/api";
import { syncWishlistFromServer } from "../../utils/wishlist";
import "./index.scss";
import toast from "react-hot-toast";

export default function Authentication() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const activeTab =
    searchParams.get("tab") === "register" ? "register" : "login";

  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthday: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState("email"); // email | reset
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  const heading = useMemo(
    () =>
      activeTab === "register" ? "TẠO TÀI KHOẢN CỦA TÔI" : "TÀI KHOẢN CỦA TÔI",
    [activeTab],
  );

  useEffect(() => {
    let cancelled = false;
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
    return () => {
      cancelled = true;
    };
  }, []);

  const showError = (err, fallback) => {
    toast.error(err?.message || fallback || "Có lỗi xảy ra");
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const email = String(loginForm.email || "").trim();
    const password = String(loginForm.password || "");
    if (!email) return toast.error("Vui lòng nhập email");
    if (!password) return toast.error("Vui lòng nhập mật khẩu");

    setBusy(true);
    try {
      await api.authLogin({ email, password });
      const resMe = await api.authMe();
      setMe(resMe?.data || null);
      // Merge local wishlist into server wishlist (preserve local items saved before login)
      try {
        const local = (await import("../../utils/wishlist")).getWishlist();
        // fetch server list
        const serverRes = await api.wishlistList().catch(() => null);
        const serverRows = Array.isArray(serverRes?.data) ? serverRes.data : [];
        const serverIds = new Set(serverRows.map((r) => String(r?.productId || "")));
        const toAdd = (local || []).filter((it) => it && it.id && !serverIds.has(String(it.id)));
        for (const item of toAdd) {
          try {
            await api.wishlistAdd({ productId: String(item.id), variantCode: "" });
          } catch (e) {
            // ignore per-item failures
          }
        }
        // Refresh local wishlist from server
        try {
          await syncWishlistFromServer();
        } catch {
          // ignore
        }
      } catch (e) {
        // ignore merge errors
      }
      toast.success("Đăng nhập thành công");
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/", { replace: true });
    } catch (err) {
      showError(err, "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  };

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const fullName = String(registerForm.fullName || "").trim();
    const email = String(registerForm.email || "").trim();
    const phone = String(registerForm.phone || "").trim();
    const password = String(registerForm.password || "");
    const confirmPassword = String(registerForm.confirmPassword || "");

    if (!fullName) return toast.error("Vui lòng nhập họ và tên");
    if (!email) return toast.error("Vui lòng nhập email");
    if (!password) return toast.error("Vui lòng nhập mật khẩu");
    if (password.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");
    if (password !== confirmPassword)
      return toast.error("Xác nhận mật khẩu không khớp");

    setBusy(true);
    try {
      await api.authRegister({ fullName, email, password, phone });
      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/authen", { replace: true });
    } catch (err) {
      showError(err, "Đăng ký thất bại");
    } finally {
      setBusy(false);
    }
  };

  const openForgot = () => {
    setIsForgotOpen(true);
    setForgotStep("email");
    setForgotOtp("");
    setForgotNewPassword("");
  };

  const onForgotSendOtp = async () => {
    if (busy) return;
    const email = String(forgotEmail || "").trim();
    if (!email) return toast.error("Vui lòng nhập email");

    setBusy(true);
    try {
      await api.authForgotPassword({ email });
      toast.success("Đã gửi OTP. Vui lòng kiểm tra email.");
      setForgotStep("reset");
    } catch (err) {
      showError(err, "Gửi OTP thất bại");
    } finally {
      setBusy(false);
    }
  };

  const onForgotReset = async () => {
    if (busy) return;
    const email = String(forgotEmail || "").trim();
    const otp = String(forgotOtp || "").trim();
    const newPassword = String(forgotNewPassword || "");
    if (!email) return toast.error("Vui lòng nhập email");
    if (!otp) return toast.error("Vui lòng nhập OTP");
    if (!newPassword) return toast.error("Vui lòng nhập mật khẩu mới");
    if (newPassword.length < 6) return toast.error("Mật khẩu tối thiểu 6 ký tự");

    setBusy(true);
    try {
      await api.authResetPassword({ email, otp, newPassword });
      toast.success("Đổi mật khẩu thành công. Bạn có thể đăng nhập.");
      setIsForgotOpen(false);
    } catch (err) {
      showError(err, "Đổi mật khẩu thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell container">
        <h1 className="auth-title">{heading}</h1>
        <p className="auth-subtitle">
          {activeTab === "register"
            ? "Đăng ký ngay để nhận các ưu đãi độc quyền từ Pandora"
            : "Đăng nhập ngay để nhận các ưu đãi độc quyền từ Pandora"}
        </p>

        {me ? (
          <div className="auth-me" role="status">
            <div className="auth-meText">
              Xin chào, <b>{me.fullName || me.email}</b>
            </div>
            <div className="auth-meHint">
              Bạn đã đăng nhập. Vào trang chủ hoặc giỏ hàng để tiếp tục.
            </div>
          </div>
        ) : null}


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
            <form className="auth-form" onSubmit={onLoginSubmit}>
              <input
                type="email"
                placeholder="Email *"
                aria-label="Email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, email: e.target.value }))
                }
                autoComplete="email"
              />
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu *"
                  aria-label="Mật khẩu"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, password: e.target.value }))
                  }
                  autoComplete="current-password"
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
                <button type="button" onClick={openForgot}>
                  Quên mật khẩu?
                </button>
              </div>
              <button type="submit" className="primary-action" disabled={busy}>
                {busy ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
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
            <form className="auth-form" onSubmit={onRegisterSubmit}>
              <input
                type="text"
                placeholder="Họ và tên *"
                aria-label="Họ và tên"
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, fullName: e.target.value }))
                }
                autoComplete="name"
              />
              <input
                type="email"
                placeholder="Email *"
                aria-label="Email"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, email: e.target.value }))
                }
                autoComplete="email"
              />
              <input
                type="tel"
                placeholder="Số điện thoại *"
                aria-label="Số điện thoại"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, phone: e.target.value }))
                }
                autoComplete="tel"
              />
              <input
                type="date"
                placeholder="Ngày/tháng/năm"
                aria-label="Ngày sinh"
                value={registerForm.birthday}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, birthday: e.target.value }))
                }
              />
              <div className="password-row">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu *"
                  aria-label="Mật khẩu"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm((p) => ({ ...p, password: e.target.value }))
                  }
                  autoComplete="new-password"
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
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? "Ẩn mật khẩu xác nhận"
                      : "Hiện mật khẩu xác nhận"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </button>
              </div>
              <button type="submit" className="primary-action" disabled={busy}>
                {busy ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ"}
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
        <div
          className="forgot-modal-overlay"
          onClick={() => setIsForgotOpen(false)}
        >
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
              Vui lòng nhập địa chỉ email đã đăng ký của bạn để nhận email thông
              báo khôi phục mật khẩu từ chúng tôi.
            </p>

            <input
              type="email"
              placeholder="Email"
              aria-label="Email khôi phục"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              autoComplete="email"
            />

            {forgotStep === "reset" ? (
              <>
                <input
                  type="text"
                  placeholder="OTP"
                  aria-label="OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  aria-label="Mật khẩu mới"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </>
            ) : null}


            <button
              type="button"
              className="forgot-modal-submit"
              onClick={forgotStep === "email" ? onForgotSendOtp : onForgotReset}
              disabled={busy}
            >
              {busy
                ? "ĐANG XỬ LÝ..."
                : forgotStep === "email"
                  ? "GỬI OTP"
                  : "ĐỔI MẬT KHẨU"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
