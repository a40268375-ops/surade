import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";
import logoImg from "../assets/logo-surade.png";
import {
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Mail,
  Lock,
  Store,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
  User,
  Home,
} from "lucide-react";

export default function Login({ initialRegister = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  /* ── Login form state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Register modal state ── */
  const [showRegister, setShowRegister] = useState(() => {
    return initialRegister || searchParams.get("register") === "true" || !!searchParams.get("ref");
  });
  const [referralCode, setReferralCode] = useState(() => {
    return searchParams.get("ref") || localStorage.getItem("applied_referral_code") || "";
  });
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirmation, setRegPasswordConfirmation] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  /* ── OTP Step state ── */
  // "form" | "otp" | "success"
  const [regStep, setRegStep] = useState("form");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDevCode, setOtpDevCode] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  const getEmailProviderInfo = (emailStr) => {
    if (!emailStr) return { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" };
    const domain = emailStr.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail")) {
      return { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" };
    } else if (domain.includes("yahoo")) {
      return { name: "Yahoo", url: "https://mail.yahoo.com/" };
    } else if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live") || domain.includes("msn")) {
      return { name: "Outlook", url: "https://outlook.live.com/mail/0/inbox" };
    } else if (domain.includes("icloud")) {
      return { name: "iCloud", url: "https://www.icloud.com/mail" };
    } else if (domain) {
      return { name: domain, url: `https://${domain}` };
    }
    return { name: "Email", url: "https://mail.google.com/mail/u/0/#inbox" };
  };

  useEffect(() => {
    if (refCode) {
      localStorage.setItem("applied_referral_code", refCode);
      setReferralCode(refCode);
      setShowRegister(true);
    } else if (initialRegister || searchParams.get("register") === "true") {
      setShowRegister(true);
    }
  }, [initialRegister, searchParams, refCode]);

  /* ── Cooldown timer ── */
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Login handler ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email atau Username dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let errorMsg = "Email/Username atau kata sandi salah. Silakan coba lagi.";
        if (data?.errors) {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
            errorMsg = data.errors[firstKey][0];
          } else if (typeof data.errors === "string") {
            errorMsg = data.errors;
          }
        } else if (data?.message) {
          errorMsg = data.message;
        }
        setError(errorMsg);
        return;
      }

      // Clear ALL stale auth/cache data before saving new session
      const keysToRemove = Object.keys(localStorage).filter(
        (k) =>
          k.startsWith("admin_cache_") ||
          k.startsWith("cached_saved_") ||
          k.startsWith("saved_")
      );
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("displayName");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userAuthChanged"));

      const role = data.user?.role;
      const redirectParam = searchParams.get("redirect");
      const defaultRedirect = role === "admin" ? "/admin/dashboard" : "/dashboard";
      const redirectUrl = redirectParam || defaultRedirect;
      navigate(redirectUrl);
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1: Send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setRegError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regFirstName.trim() || !regLastName.trim()) {
      setRegError("Nama wajib diisi.");
      return;
    }
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      setRegError("Format email tidak valid (contoh: nama@email.com).");
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setRegError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (!regPasswordConfirmation || regPassword !== regPasswordConfirmation) {
      setRegError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }
    if (!regGender) {
      setRegError("Jenis kelamin wajib dipilih.");
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `${regFirstName} ${regLastName}`.trim(),
          email: regEmail.trim(),
          password: regPassword,
          password_confirmation: regPasswordConfirmation,
          gender: regGender,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setRegError(data?.message || "Gagal mengirim kode OTP ke email. Silakan periksa koneksi atau coba lagi.");
        return;
      }

      // Move to OTP step
      setRegStep("otp");
      setOtpError("");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpDevCode(data?.dev_otp || null);
      startCooldown(60);

      // Auto-focus first input after render
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch {
      setRegError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setRegLoading(false);
    }
  };

  /* ── OTP digit input handlers ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError("");
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    setTimeout(() => {
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs.current[focusIdx]?.focus();
    }, 10);
  };

  /* ── Step 2: Verify OTP & Register ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP.");
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: `${regFirstName} ${regLastName}`.trim(),
          email: regEmail.trim(),
          password: regPassword,
          password_confirmation: regPasswordConfirmation,
          gender: regGender,
          otp: otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOtpError(data?.message || "Kode OTP tidak valid atau sudah kadaluarsa.");
        return;
      }

      // Registration successful — clear stale data, save new session
      const keysToRemove = Object.keys(localStorage).filter(
        (k) =>
          k.startsWith("admin_cache_") ||
          k.startsWith("cached_saved_") ||
          k.startsWith("saved_")
      );
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("displayName");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userAuthChanged"));

      setRegStep("success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch {
      setOtpError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: regEmail.trim(),
          name: `${regFirstName} ${regLastName}`.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOtpError(data?.message || "Gagal mengirim ulang OTP ke email.");
        return;
      }
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpDevCode(data?.dev_otp || null);
      startCooldown(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch {
      setOtpError("Terjadi kesalahan koneksi.");
    }
  };

  const closeRegisterModal = () => {
    setShowRegister(false);
    setRegStep("form");
    setRegFirstName("");
    setRegLastName("");
    setRegEmail("");
    setRegPassword("");
    setRegPasswordConfirmation("");
    setRegGender("");
    setRegError("");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError("");
    setOtpDevCode(null);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(0);
  };

  return (
    <div className="login-page login-page--split">
      {/* ── Mobile Top Bar ── */}
      <header className="login-mobile-topbar">
        <Link to="/" className="login-mobile-logo-wrap">
          <span className="login-mobile-brand-name">
            Surade<span>.co.id</span>
          </span>
        </Link>
        <Link to="/" className="login-mobile-home-btn">
          <Home size={15} />
          <span>Beranda</span>
        </Link>
      </header>

      {/* ── Main Content ── */}
      <main className="login-main login-main--split">
        <div className="login-container login-container--split">

          {/* ── Left: Branding, panel solid hijau dengan pola gelombang tipis ── */}
          <div className="login-branding login-branding--split">
            <div className="login-branding__wavepattern" aria-hidden="true" />

            <div className="login-branding__boat-track" aria-hidden="true">
              <svg className="login-branding__boat" viewBox="0 0 90 60">
                {/* Gelembung kecil dari mulut ikan */}
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--1" cx="78" cy="18" r="3" fill="#ffffff" fillOpacity="0.85" />
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--2" cx="83" cy="10" r="2" fill="#ffffff" fillOpacity="0.7" />
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--3" cx="75" cy="6" r="1.4" fill="#ffffff" fillOpacity="0.6" />

                {/* Badan ikan */}
                <path d="M8 32 C8 20 26 12 42 16 C54 19 62 26 70 26 C66 30 66 34 70 38 C62 38 54 45 42 48 C26 52 8 44 8 32 Z"
                      fill="#ffffff" fillOpacity="0.95" />
                {/* Ekor */}
                <path d="M8 32 L0 20 L4 32 L0 44 Z" fill="#a7f3d0" fillOpacity="0.9" />
                {/* Sirip atas */}
                <path d="M34 17 L38 6 L46 18 Z" fill="#a7f3d0" fillOpacity="0.85" />
                {/* Mata */}
                <circle cx="58" cy="27" r="3.2" fill="#0b6b45" />
                <circle cx="59" cy="26" r="1.1" fill="#ffffff" />
              </svg>
            </div>

            <div className="login-branding__top">
              <div className="login-branding__header-row">
                <span className="login-branding__brand-name--dark">
                  Surade<span>.co.id</span>
                </span>
              </div>

              <h1 className="login-branding__heading login-branding__heading--dark">
                Masukkan bisnismu ke<br />
                Surade,<br />
                jangkau lebih banyak<br />
                pelanggan.
              </h1>
              <p className="login-branding__subtext login-branding__subtext--dark">
                Surade membantu bisnis Anda ditemukan, dipercaya, dan berkembang bersama masyarakat di 12 desa Kecamatan Surade.
              </p>

              <ul className="login-branding__points">
                <li>
                  <CheckCircle size={18} />
                  <span>Kelola profil dan informasi bisnis Anda</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Tampilkan produk dan layanan ke pelanggan</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Jangkau lebih banyak warga di 12 desa Surade</span>
                </li>
              </ul>
            </div>

            <p className="login-branding__copy">&copy; 2026 Surade.co.id — All rights reserved.</p>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="login-card login-card--split">
            {/* Logo dipindahkan di atas masuk (ditengah) dengan teksnya */}
            <div className="login-card__header-logo">
              <img src={logoImg} alt="Surade.co.id" className="login-card__logo" />
              <span className="login-card__brand-name">
                Surade<span>.co.id</span>
              </span>
            </div>

            <h2 className="login-card__title">Masuk</h2>
            <p className="login-card__subtitle">Masuk untuk melanjutkan ke akun Anda</p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              {/* Password reset success notification */}
              {searchParams.get("reset") === "success" && !error && (
                <div className="login-error" style={{ background: "#e6f9f0", borderColor: "#b2f0d1", color: "#007a54" }}>
                  <CheckCircle size={18} className="login-error__icon" />
                  Password berhasil diubah. Silakan login dengan password baru.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
                  {error}
                </div>
              )}

              {/* Email or Username */}
              <div className="login-field-group">
                <label htmlFor="login-email" className="login-field-label">EMAIL ATAU USERNAME</label>
                <div className="login-input-wrapper">
                  <input
                    id="login-email"
                    type="text"
                    className={`login-input login-input--plain ${error ? "login-input--error" : ""}`}
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field-group">
                <label htmlFor="login-password" className="login-field-label">KATA SANDI</label>
                <div className="login-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className={`login-input login-input--plain ${error ? "login-input--error" : ""}`}
                    placeholder="Kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="login-forgot login-forgot--right">
                <Link to="/forgot-password">Lupa kata sandi?</Link>
              </div>

              {/* Login Button */}
              <button
                id="login-submit"
                type="submit"
                className={`login-btn login-btn--split ${loading ? "login-btn--loading" : ""}`}
                disabled={loading}
              >
                {loading && <span className="login-spinner" />}
                {loading ? "Memproses..." : "Masuk"}
              </button>

              {/* Kembali ke Website — tombol outline, seperti desain referensi */}
              <Link
                to="/"
                className="login-create-btn login-create-btn--outline"
                style={{ textDecoration: "none" }}
              >
                <ArrowLeft size={18} />
                Kembali
              </Link>
            </form>

            {/* Link ke pendaftaran */}
            <p className="login-info" style={{ textAlign: "center", marginTop: 20 }}>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#0f6e46",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* ── Register Modal ── */}
      {showRegister && (
        <div className="login-modal-overlay" onClick={closeRegisterModal}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>

            {/* ═══════════════════════════════════ STEP: FORM ═══════════════════════════════════ */}
            {regStep === "form" && (
              <>
                <div className="login-modal__header">
                  <div>
                    <h2 className="login-modal__title">Daftar Akun</h2>
                    <p className="login-modal__subtitle">Cepat dan mudah, hanya perlu beberapa langkah.</p>
                  </div>
                  <button
                    className="login-modal__close"
                    onClick={closeRegisterModal}
                    aria-label="Tutup"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="login-modal__divider" />

                <form className="login-modal__body" onSubmit={handleSendOtp} noValidate>
                  {referralCode && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      borderRadius: "8px",
                      color: "#065f46",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      marginBottom: "6px"
                    }}>
                      <CheckCircle size={16} className="text-emerald-600" />
                      <span>Kode Referral aktif: <strong>{referralCode}</strong></span>
                    </div>
                  )}

                  {regError && (
                    <div className="login-error" style={{ marginBottom: 12 }}>
                      <AlertCircle size={16} className="login-error__icon" />
                      {regError}
                    </div>
                  )}

                  <div className="login-modal__row">
                    <input
                      id="reg-first-name"
                      type="text"
                      className="login-input"
                      placeholder="Nama depan"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                    />
                    <input
                      id="reg-last-name"
                      type="text"
                      className="login-input"
                      placeholder="Nama belakang"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                    />
                  </div>

                  <input
                    id="reg-email"
                    type="email"
                    className="login-input"
                    placeholder="Alamat Email Aktif (untuk terima OTP)"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                  />

                  <input
                    id="reg-password"
                    type="password"
                    className="login-input"
                    placeholder="Kata sandi baru (min. 8 karakter)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                  />

                  <input
                    id="reg-password-confirmation"
                    type="password"
                    className="login-input"
                    placeholder="Konfirmasi kata sandi"
                    value={regPasswordConfirmation}
                    onChange={(e) => setRegPasswordConfirmation(e.target.value)}
                    autoComplete="new-password"
                  />

                  <span className="login-label">Jenis Kelamin</span>
                  <div className="login-gender-group">
                    <label className="login-gender-option">
                      Perempuan
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={regGender === "female"}
                        onChange={(e) => setRegGender(e.target.value)}
                      />
                    </label>
                    <label className="login-gender-option">
                      Laki-laki
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={regGender === "male"}
                        onChange={(e) => setRegGender(e.target.value)}
                      />
                    </label>
                  </div>

                  <p className="login-modal__terms">
                    Dengan mengklik tombol daftar, Anda menyetujui{" "}
                    <Link to="/terms">Ketentuan Layanan</Link> dan{" "}
                    <a href="#">Kebijakan Privasi</a> Surade.co.id.
                  </p>

                  <button
                    id="reg-submit"
                    type="submit"
                    className="login-register-btn"
                    disabled={regLoading}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {regLoading ? (
                      <><span className="login-spinner" /> Mengirim OTP ke Email...</>
                    ) : (
                      <><Mail size={16} /> Daftar &amp; Kirim OTP ke Email</>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ═══════════════════════════════════ STEP: OTP ═══════════════════════════════════ */}
            {regStep === "otp" && (
              <>
                <div className="login-modal__header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => { setRegStep("form"); setOtpError(""); }}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", color: "#64748b" }}
                      aria-label="Kembali"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="login-modal__title">Verifikasi Email</h2>
                      <p className="login-modal__subtitle">Masukkan 6 digit kode OTP yang dikirim ke email Anda.</p>
                    </div>
                  </div>
                  <button
                    className="login-modal__close"
                    onClick={closeRegisterModal}
                    aria-label="Tutup"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="login-modal__divider" />

                <form className="login-modal__body" onSubmit={handleVerifyOtp} noValidate>
                  {/* Dynamic Inbox Button matching email provider */}
                  {(() => {
                    const provider = getEmailProviderInfo(regEmail);
                    return (
                      <div style={{
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        borderRadius: 12,
                        padding: "14px 16px",
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Mail size={18} style={{ color: "#0284c7", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#0369a1" }}>
                            Kode OTP dikirim ke <strong>{regEmail}</strong>
                          </span>
                        </div>
                        <a
                          href={provider.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            background: "#0284c7",
                            color: "#ffffff",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                            boxShadow: "0 2px 4px rgba(2,132,199,0.2)",
                            transition: "background 0.2s",
                          }}
                        >
                          Buka {provider.name} Inbox ↗
                        </a>
                      </div>
                    );
                  })()}



                  {/* OTP Error */}
                  {otpError && (
                    <div className="login-error" style={{ marginBottom: 16 }}>
                      <AlertCircle size={16} className="login-error__icon" />
                      {otpError}
                    </div>
                  )}

                  {/* OTP Digit Inputs */}
                  <div style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                    marginBottom: 24,
                  }}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        id={`otp-digit-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        style={{
                          width: 48,
                          height: 60,
                          textAlign: "center",
                          fontSize: 24,
                          fontWeight: 700,
                          borderRadius: 10,
                          border: digit ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                          background: digit ? "#eff6ff" : "#f8fafc",
                          color: "#1a1a2e",
                          outline: "none",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        aria-label={`Digit OTP ke-${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Resend */}
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    {resendCooldown > 0 ? (
                      <p style={{ fontSize: 13, color: "#94a3b8" }}>
                        Kirim ulang dalam <strong style={{ color: "#64748b" }}>{resendCooldown}s</strong>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <RefreshCw size={14} /> Kirim Ulang Kode
                      </button>
                    )}
                  </div>

                  <button
                    id="otp-submit"
                    type="submit"
                    className="login-register-btn"
                    disabled={otpLoading || otpDigits.join("").length !== 6}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {otpLoading ? (
                      <><span className="login-spinner" /> Memverifikasi...</>
                    ) : (
                      "Verifikasi & Daftar"
                    )}
                  </button>

                  <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 12 }}>
                    Kode berlaku selama <strong>10 menit</strong>. Periksa folder Spam jika belum masuk.
                  </p>
                </form>
              </>
            )}

            {/* ═══════════════════════════════════ STEP: SUCCESS ═══════════════════════════════════ */}
            {regStep === "success" && (
              <div className="login-modal__body" style={{ textAlign: "center", padding: "40px 32px" }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                }}>
                  <CheckCircle size={36} color="#fff" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>
                  Pendaftaran Berhasil! 🎉
                </h2>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                  Akun Anda telah berhasil dibuat dan email telah terverifikasi.
                  <br />
                  Mengalihkan ke dashboard...
                </p>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 1s infinite" }} />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}