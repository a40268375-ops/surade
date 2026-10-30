import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  User,
  Store,
  Sparkles,
} from "lucide-react";
import logoImg from "../assets/logo-surade.png";
import CaptchaInput from "../components/CaptchaInput";
import "./Login.css";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Daftar Akun - Surade.com";
  }, []);

  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState(
    () => searchParams.get("ref") || localStorage.getItem("applied_referral_code") || ""
  );
  const [accountType, setAccountType] = useState("personal");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  /* ── Google reCAPTCHA v2 State ── */
  const [userCaptcha, setUserCaptcha] = useState("");
  const captchaRef = useRef(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (sec = 60) => {
    setResendCooldown(sec);
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

  const getApiUrl = () => {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return "http://127.0.0.1:8000/api";
    }
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl.replace("localhost", "127.0.0.1");
    return "https://surade.com/api";
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) return setFormError("Nama lengkap wajib diisi.");
    if (!emailRegex.test(email.trim())) return setFormError("Format email tidak valid (contoh: nama@email.com).");
    if (!password) return setFormError("Kata sandi wajib diisi.");
    if (password.length < 8) return setFormError("Kata sandi minimal 8 karakter.");
    if (password !== passwordConfirm) return setFormError("Konfirmasi kata sandi tidak sesuai.");
    
    // Google reCAPTCHA v2 validation
    if (!userCaptcha) {
      return setFormError("Silakan selesaikan verifikasi keamanan (CAPTCHA) terlebih dahulu.");
    }

    setFormLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirm,
          ...(referralCode ? { referral_code: referralCode } : {}),
          captcha_token: userCaptcha,
          recaptcha_token: userCaptcha,
          "g-recaptcha-response": userCaptcha,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.errors ? Object.values(data.errors).flat().join(" ") : (data?.message || "Gagal mengirim kode OTP. Coba lagi.");
        setFormError(msg);
        setUserCaptcha("");
        if (captchaRef.current?.reset) captchaRef.current.reset();
        return;
      }
      setStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err) {
      console.error("Send OTP error:", err);
      setFormError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otpDigits]; next[idx] = val;
    setOtpDigits(next); setOtpError("");
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    setTimeout(() => otpRefs.current[Math.min(pasted.length, 5)]?.focus(), 10);
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError("");
    const otp = otpDigits.join("");
    if (otp.length !== 6) return setOtpError("Masukkan 6 digit kode OTP.");
    setOtpLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Pengguna",
          email: email.trim(),
          password,
          password_confirmation: passwordConfirm || password,
          account_type: accountType,
          otp,
          ...(referralCode ? { referral_code: referralCode } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data?.errors ? Object.values(data.errors).flat().join(" ") : (data?.message || "Kode OTP tidak valid atau sudah kedaluwarsa. Silakan klik Kirim Ulang.");
        setOtpError(errorMsg);
        return;
      }
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.startsWith("admin_cache_") || k.startsWith("cached_saved_") || k.startsWith("saved_")
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem("displayName");
      if (accountType === "personal" || data.user?.account_type === "personal") {
        localStorage.removeItem("is_seller");
        localStorage.removeItem("user_mode");
        localStorage.removeItem("dashboard_mode");
        localStorage.removeItem("is_seller_mode");
        localStorage.removeItem("cached_my_businesses");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userAuthChanged"));
      setStep("success");
      
      const targetRoute = "/dashboard";
      setTimeout(() => navigate(targetRoute), 2200);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setOtpError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setOtpError(data?.message || "Gagal kirim ulang OTP."); return; }
      setOtpDigits(["", "", "", "", "", ""]);
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setOtpError("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <div className="login-page login-page--split">
      <main className="login-main login-main--split">
        <div className="login-container login-container--split">

          {/* ═══════ LEFT BRANDING ═══════ */}
          <div className="login-branding login-branding--split login-branding--dark">
            <div className="login-branding__wavepattern" aria-hidden="true" />

            <div className="login-branding__boat-track" aria-hidden="true">
              <svg className="login-branding__boat" viewBox="0 0 90 60">
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--1" cx="78" cy="18" r="3" fill="#ffffff" fillOpacity="0.85" />
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--2" cx="83" cy="10" r="2" fill="#ffffff" fillOpacity="0.7" />
                <circle className="login-branding__fish-bubble login-branding__fish-bubble--3" cx="75" cy="6" r="1.4" fill="#ffffff" fillOpacity="0.6" />

                <path d="M8 32 C8 20 26 12 42 16 C54 19 62 26 70 26 C66 30 66 34 70 38 C62 38 54 45 42 48 C26 52 8 44 8 32 Z"
                      fill="#ffffff" fillOpacity="0.95" />
                <path d="M8 32 L0 20 L4 32 L0 44 Z" fill="#a7f3d0" fillOpacity="0.9" />
                <path d="M34 17 L38 6 L46 18 Z" fill="#a7f3d0" fillOpacity="0.85" />
                <circle cx="58" cy="27" r="3.2" fill="#0b6b45" />
                <circle cx="59" cy="26" r="1.1" fill="#ffffff" />
              </svg>
            </div>

            <div className="login-branding__top">
              <div className="login-branding__header-row">
                <span className="login-branding__brand-name--dark">
                  Surade<span>.com</span>
                </span>
              </div>

              <h1 className="login-branding__heading login-branding__heading--dark">
                Bergabung &amp;<br />
                kembangkan bisnismu<br />
                di Surade.
              </h1>
              <p className="login-branding__subtext login-branding__subtext--dark">
                Daftar akun gratis sekarang untuk mempublikasikan profil bisnis Anda dan menjangkau ribuan calon pelanggan lokal.
              </p>

              <ul className="login-branding__points">
                <li>
                  <CheckCircle size={18} />
                  <span>Pendaftaran akun 100% gratis &amp; mudah</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Terhubung langsung dengan direktori UMKM Surade</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Verifikasi cepat via email &amp; OTP otomatis</span>
                </li>
              </ul>
            </div>

            <p className="login-branding__copy">&copy; 2026 Surade.com — All rights reserved.</p>
          </div>

          {/* ═══════ RIGHT FORM CARD ═══════ */}
          <div
            className="login-card login-card--split"
            style={{
              height: "100vh",
              overflowY: "auto",
              padding: "24px 32px 36px 32px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <div className="login-card__content" style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
              <div className="login-card__header-logo" style={{ marginBottom: 14, paddingBottom: 8 }}>
                <img src={logoImg} alt="Surade.com" className="login-card__logo" style={{ height: 40 }} />
                <span className="login-card__brand-name" style={{ fontSize: "1.3rem" }}>
                  Surade<span>.com</span>
                </span>
              </div>

              {step === "form" && (
                <>
                  <h2 className="login-card__title" style={{ fontSize: "1.35rem", marginBottom: 2 }}>Buat Akun Baru</h2>
                  <p className="login-card__subtitle" style={{ fontSize: "0.82rem", marginBottom: 12 }}>Cepat dan mudah, hanya perlu beberapa langkah</p>

                  {referralCode && (
                    <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 12px", borderRadius: 8, fontSize: "0.8rem", color: "#065f46", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle size={14} />
                      Kode Referral aktif: <strong>{referralCode}</strong>
                    </div>
                  )}

                  <form className="login-form" onSubmit={handleSendOtp} noValidate style={{ gap: 10 }}>
                    {formError && (
                      <div className="login-error" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                        <AlertCircle size={16} className="login-error__icon" />
                        {formError}
                      </div>
                    )}

                    <div className="login-field-group">
                      <label htmlFor="reg-name" className="login-field-label" style={{ fontSize: "0.72rem", marginBottom: 3 }}>NAMA</label>
                      <input id="reg-name" type="text" className="login-input" placeholder="Nama" value={name} onChange={e => setName(e.target.value)} style={{ padding: "10px 12px" }} />
                    </div>

                    <div className="login-field-group">
                      <label htmlFor="reg-em" className="login-field-label" style={{ fontSize: "0.72rem", marginBottom: 3 }}>ALAMAT EMAIL</label>
                      <input id="reg-em" type="email" className="login-input" placeholder="nama@email.com (untuk OTP)" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "10px 12px" }} />
                    </div>

                    <div className="login-field-group">
                      <label htmlFor="reg-pwd" className="login-field-label" style={{ fontSize: "0.72rem", marginBottom: 3 }}>KATA SANDI</label>
                      <div className="login-password-wrapper">
                        <input id="reg-pwd" type={showPassword ? "text" : "password"} className="login-input" placeholder="Kata sandi baru (min. 8 karakter)" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "10px 12px" }} />
                        <button type="button" className="login-password-toggle" onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="login-field-group">
                      <label htmlFor="reg-cpwd" className="login-field-label" style={{ fontSize: "0.72rem", marginBottom: 3 }}>KONFIRMASI KATA SANDI</label>
                      <div className="login-password-wrapper">
                        <input id="reg-cpwd" type={showPasswordConfirm ? "text" : "password"} className="login-input" placeholder="Ulangi kata sandi" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} style={{ padding: "10px 12px" }} />
                        <button type="button" className="login-password-toggle" onClick={() => setShowPasswordConfirm(p => !p)}>
                          {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* PILIHAN TIPE AKUN: USER BIASA vs BISNIS / USAHA */}
                    <div className="login-field-group">
                      <label className="login-field-label" style={{ fontSize: "0.72rem", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>DAFTAR SEBAGAI</span>
                        <span style={{ fontSize: "0.68rem", color: "#059669", fontWeight: 600 }}>Pilih salah satu</span>
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setAccountType("personal")}
                          style={{
                            padding: "12px 10px",
                            borderRadius: 10,
                            border: accountType === "personal" ? "2px solid #059669" : "1.5px solid #e2e8f0",
                            background: accountType === "personal" ? "#ecfdf5" : "#ffffff",
                            color: accountType === "personal" ? "#065f46" : "#334155",
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            position: "relative",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: accountType === "personal" ? "0 4px 12px rgba(5, 150, 105, 0.12)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                background: accountType === "personal" ? "#059669" : "#f1f5f9",
                                color: accountType === "personal" ? "#ffffff" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                                <User size={15} />
                              </span>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>User</span>
                            </div>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: accountType === "personal" ? "5px solid #059669" : "2px solid #cbd5e1",
                                background: "#ffffff",
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.68rem", color: accountType === "personal" ? "#047857" : "#64748b", lineHeight: 1.25, marginTop: 2 }}>
                            Akses direktori, simpan & ulasan
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAccountType("business")}
                          style={{
                            padding: "12px 10px",
                            borderRadius: 10,
                            border: accountType === "business" ? "2px solid #059669" : "1.5px solid #e2e8f0",
                            background: accountType === "business" ? "#ecfdf5" : "#ffffff",
                            color: accountType === "business" ? "#065f46" : "#334155",
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            position: "relative",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: accountType === "business" ? "0 4px 12px rgba(5, 150, 105, 0.12)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                background: accountType === "business" ? "#059669" : "#f1f5f9",
                                color: accountType === "business" ? "#ffffff" : "#64748b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                                <Store size={15} />
                              </span>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Usaha</span>
                            </div>
                            <span
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: accountType === "business" ? "5px solid #059669" : "2px solid #cbd5e1",
                                background: "#ffffff",
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.68rem", color: accountType === "business" ? "#047857" : "#64748b", lineHeight: 1.25, marginTop: 2 }}>
                            Daftarkan toko, produk & promosi
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Google reCAPTCHA v2 Checkbox */}
                    <div style={{ margin: "6px 0 10px 0" }}>
                      <CaptchaInput
                        ref={captchaRef}
                        id="reg-captcha"
                        label="Verifikasi Keamanan"
                        value={userCaptcha}
                        onChange={setUserCaptcha}
                      />
                    </div>

                    {/* CHECKBOX SYARAT & KETENTUAN */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "6px 0 10px 0" }}>
                      <input
                        id="reg-terms-check"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#059669",
                          marginTop: 2,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <label htmlFor="reg-terms-check" style={{ fontSize: "0.78rem", color: "#334155", lineHeight: 1.35, cursor: "pointer" }}>
                        Saya membaca dan menyetujui{" "}
                        <Link to="/terms" target="_blank" style={{ color: "#059669", fontWeight: 700, textDecoration: "underline" }}>
                          Ketentuan Layanan
                        </Link>{" "}
                        dan{" "}
                        <Link to="/privacy" target="_blank" style={{ color: "#059669", fontWeight: 700, textDecoration: "underline" }}>
                          Kebijakan Privasi
                        </Link>{" "}
                        Surade.com.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={formLoading}
                      style={{
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "11px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        width: "100%",
                      }}
                    >
                      {formLoading ? "Mengirim OTP..." : "Daftar & Kirim OTP ke Email"}
                    </button>

                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <button type="button" className="login-create-btn login-create-btn--outline" style={{ marginTop: 6, width: "100%", padding: "10px" }}>
                        <ArrowLeft size={16} /> Kembali ke Login
                      </button>
                    </Link>

                    <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748b", marginTop: 8 }}>
                      Sudah punya akun?{" "}
                      <Link to="/login" style={{ color: "#059669", fontWeight: 700, textDecoration: "underline" }}>
                        Masuk di sini
                      </Link>
                    </p>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <h2 className="login-card__title">Verifikasi Email</h2>
                  <p className="login-card__subtitle">Masukkan 6 digit kode OTP yang dikirim ke <strong>{email}</strong></p>

                  {/* Info Box Cek Kotak Masuk & Spam */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                      border: "1px solid #a7f3d0",
                      borderRadius: 10,
                      padding: "11px 14px",
                      margin: "12px 0 14px 0",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      textAlign: "left",
                    }}
                  >
                    <Mail size={18} style={{ color: "#059669", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: "0.8rem", color: "#065f46", lineHeight: 1.45 }}>
                      <strong>Penting:</strong> Periksa folder <strong>Kotak Masuk (Inbox)</strong> email Anda. Jika belum muncul dalam beberapa detik, pastikan untuk mengecek folder <strong>Spam / Junk / Promosi</strong>.
                    </div>
                  </div>

                  <form className="login-form" onSubmit={handleVerifyOtp} noValidate>
                    {otpError && (
                      <div className="login-error">
                        <AlertCircle size={18} className="login-error__icon" />
                        {otpError}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => (otpRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          style={{
                            width: 42,
                            height: 48,
                            textAlign: "center",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            borderRadius: 8,
                            border: digit ? "2px solid #059669" : "1px solid #cbd5e1",
                            background: digit ? "#ecfdf5" : "#fff",
                            color: "#0f172a",
                          }}
                        />
                      ))}
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={otpLoading || otpDigits.join("").length !== 6} style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", width: "100%" }}>
                      {otpLoading ? "Memverifikasi..." : "Verifikasi & Daftar"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: 12 }}>
                      {resendCooldown > 0 ? (
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Kirim ulang dalam <strong>{resendCooldown}s</strong></span>
                      ) : (
                        <button type="button" onClick={handleResendOtp} style={{ background: "none", border: "none", color: "#059669", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <RefreshCw size={14} /> Kirim Ulang Kode
                        </button>
                      )}
                    </div>

                    <button type="button" className="login-create-btn login-create-btn--outline" onClick={() => setStep("form")} style={{ marginTop: 12, width: "100%" }}>
                      <ArrowLeft size={16} /> Kembali ke Form
                    </button>
                  </form>
                </>
              )}

              {step === "success" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                    <CheckCircle size={36} />
                  </div>
                  <h2 className="login-card__title" style={{ textAlign: "center" }}>Pendaftaran Berhasil!</h2>
                  <p className="login-card__subtitle" style={{ textAlign: "center", marginTop: 8 }}>
                    Akun Anda telah berhasil dibuat dan email terverifikasi.<br />
                    Mengalihkan ke dashboard...
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}