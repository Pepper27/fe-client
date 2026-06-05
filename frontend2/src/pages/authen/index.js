import { useEffect, useMemo, useRef, useState } from "react";
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

  const googleTokenClientRef = useRef(null);
  const fbReadyRef = useRef(false);

  const loadScriptOnce = (src, id) => {
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") return resolve(false);
      if (id && document.getElementById(id)) return resolve(true);
      const existing = Array.from(document.getElementsByTagName("script")).find(
        (s) => s && s.src === src,
      );
      if (existing) return resolve(true);

      const script = document.createElement("script");
      if (id) script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Không tải được script: ${src}`));
      document.head.appendChild(script);
    });
  };

  const afterAuthSuccess = async () => {
    const resMe = await api.authMe();
    setMe(resMe?.data || null);

    // Merge local wishlist into server wishlist (preserve local items saved before login)
    try {
      const local = (await import("../../utils/wishlist")).getWishlist();
      const serverRes = await api.wishlistList().catch(() => null);
      const serverRows = Array.isArray(serverRes?.data) ? serverRes.data : [];
      const serverIds = new Set(
        serverRows.map((r) => String(r?.productId || "")),
      );
      const toAdd = (local || []).filter(
        (it) => it && it.id && !serverIds.has(String(it.id)),
      );
      for (const item of toAdd) {
        try {
          await api.wishlistAdd({
            productId: String(item.id),
            variantCode: "",
          });
        } catch {
          // ignore per-item failures
        }
      }
      try {
        await syncWishlistFromServer();
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }

    window.dispatchEvent(new Event("auth:changed"));
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      loadScriptOnce("https://accounts.google.com/gsi/client", "google-gsi")
        .then(() => {
          if (!window.google?.accounts?.oauth2?.initTokenClient) return;
          if (googleTokenClientRef.current) return;
          googleTokenClientRef.current =
            window.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: "openid email profile",
              callback: () => {},
            });
        })
        .catch(() => {
          // ignore; button will show error on click
        });
    }

    const fbAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
    if (fbAppId) {
      // Facebook SDK requires fbAsyncInit before script load.
      window.fbAsyncInit = function () {
        try {
          window.FB.init({
            appId: fbAppId,
            cookie: true,
            xfbml: false,
            version: "v20.0",
          });
          fbReadyRef.current = true;
        } catch {
          fbReadyRef.current = false;
        }
      };

      loadScriptOnce(
        "https://connect.facebook.net/en_US/sdk.js",
        "facebook-sdk",
      ).catch(() => {
        // ignore; button will show error on click
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heading = useMemo(
    () =>
      activeTab === "register" ? "TẠO TÀI KHOẢN CỦA TÔI" : "TÀI KHOẢN CỦA TÔI",
    [activeTab],
  );

  useEffect(() => {
    let cancelled = false;

    const refreshMe = () => {
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

    refreshMe();
    const onAuthChanged = () => refreshMe();
    window.addEventListener("auth:changed", onAuthChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:changed", onAuthChanged);
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
      toast.success("Đăng nhập thành công");
      await afterAuthSuccess();
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
    const birthday = String(registerForm.birthday || "").trim();
    const password = String(registerForm.password || "");
    const confirmPassword = String(registerForm.confirmPassword || "");

    const emailLower = email.toLowerCase();
    const phoneDigits = phone.replace(/[^0-9+]/g, "");

    if (!fullName || fullName.length < 2)
      return toast.error("Vui lòng nhập họ và tên");
    if (!email) return toast.error("Vui lòng nhập email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower))
      return toast.error("Email không hợp lệ");
    if (!phone) return toast.error("Vui lòng nhập số điện thoại");
    if (!/^(\+?84|0)\d{8,10}$/.test(phoneDigits))
      return toast.error("Số điện thoại không hợp lệ");
    if (birthday) {
      const today = new Date().toISOString().slice(0, 10);
      if (birthday > today) return toast.error("Ngày sinh không hợp lệ");
    }
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
    if (newPassword.length < 6)
      return toast.error("Mật khẩu tối thiểu 6 ký tự");

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

  const onGoogleLogin = async () => {
    if (busy) return;
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!googleClientId) return toast.error("Thiếu REACT_APP_GOOGLE_CLIENT_ID");

    setBusy(true);
    try {
      await loadScriptOnce(
        "https://accounts.google.com/gsi/client",
        "google-gsi",
      );
      if (!window.google?.accounts?.oauth2?.initTokenClient)
        throw new Error("Google SDK chưa sẵn sàng");

      const tokenClient =
        googleTokenClientRef.current ||
        window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: () => {},
        });
      googleTokenClientRef.current = tokenClient;

      const accessToken = await new Promise((resolve, reject) => {
        tokenClient.callback = (resp) => {
          const token = resp && resp.access_token;
          if (!token) return reject(new Error("Không lấy được token Google"));
          resolve(token);
        };
        try {
          tokenClient.requestAccessToken({ prompt: "consent" });
        } catch (e) {
          reject(e);
        }
      });

      await api.authOauthGoogle({ accessToken });
      toast.success("Đăng nhập Google thành công");
      await afterAuthSuccess();
    } catch (err) {
      showError(err, "Đăng nhập Google thất bại");
    } finally {
      setBusy(false);
    }
  };

  const onFacebookLogin = async () => {
    if (busy) return;
    const fbAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
    if (!fbAppId) return toast.error("Thiếu REACT_APP_FACEBOOK_APP_ID");

    setBusy(true);
    try {
      await loadScriptOnce(
        "https://connect.facebook.net/en_US/sdk.js",
        "facebook-sdk",
      );
      if (!window.FB) throw new Error("Facebook SDK chưa sẵn sàng");
      if (!fbReadyRef.current) {
        try {
          window.FB.init({
            appId: fbAppId,
            cookie: true,
            xfbml: false,
            version: "v20.0",
          });
          fbReadyRef.current = true;
        } catch {
          // ignore
        }
      }

      const accessToken = await new Promise((resolve, reject) => {
        window.FB.login(
          (response) => {
            const token = response?.authResponse?.accessToken;
            if (!token) {
              return reject(new Error("Bạn đã hủy đăng nhập Facebook"));
            }
            resolve(token);
          },
          { scope: "email,public_profile" },
        );
      });

      await api.authOauthFacebook({ accessToken });
      toast.success("Đăng nhập Facebook thành công");
      await afterAuthSuccess();
    } catch (err) {
      showError(err, "Đăng nhập Facebook thất bại");
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
            ? "Đăng ký ngay để nhận các ưu đãi độc quyền từ Kim Bảo"
            : "Đăng nhập ngay để nhận các ưu đãi độc quyền từ Kim Bảo"}
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
              <button
                type="button"
                className="social-btn google-btn"
                onClick={onGoogleLogin}
                disabled={busy}
              >
                <FaGoogle className="social-icon" aria-hidden="true" />
                ĐĂNG NHẬP GOOGLE
              </button>
              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={onFacebookLogin}
                disabled={busy}
              >
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
                max={new Date().toISOString().slice(0, 10)}
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
              <button
                type="button"
                className="social-btn google-btn"
                onClick={onGoogleLogin}
                disabled={busy}
              >
                <FaGoogle className="social-icon" aria-hidden="true" />
                ĐĂNG KÝ GOOGLE
              </button>
              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={onFacebookLogin}
                disabled={busy}
              >
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
