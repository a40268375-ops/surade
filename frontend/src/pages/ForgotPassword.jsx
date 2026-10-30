import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo-surade.png";
import "./Login.css";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Clock,
  Check,
  X,
  Mail,
} from "lucide-react";

const API_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
  ? "http://127.0.0.1:8000/api"
  : (import.meta.env.VITE_API_URL || "https://surade.com/api");

const passwordRules = [
  { label: "Minimal 8 karakter", test: (p) => p.length >= 8 },
  { label: "Mengandung huruf kapital (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Mengandung angka (0-9)", test: (p) => /[0-9]/.test(p) },
];

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");


  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);
  const expiryRef = useRef(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    document.title = "Lupa Kata Sandi - Surade.com";
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (expiryRef.current) clearInterval(expiryRef.current);
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

  const startExpiryCountdown = () => {
    setOtpExpiry(300);
    if (expiryRef.current) clearInterval(expiryRef.current);
    expiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          clearInterval(expiryRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const maskEmailLocal = (emailStr) => {
    const parts = emailStr.split("@");
    const name = parts[0];
    const domain = parts[1] || "email.com";
    if (name.length <= 2) return name[0] + "***@" + domain;
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1] + "@" + domain;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    const inputVal = email.trim();
    if (!inputVal) { setError("Masukkan alamat email atau username Anda."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: inputVal }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) { setError(data?.message || "Terlalu banyak percobaan. Coba lagi nanti."); return; }
      if (!res.ok) {
        const errorMsg = data?.errors?.email?.[0] || data?.message || "Email tidak ditemukan dalam sistem kami.";
        setError(errorMsg);
        return;
      }
      if (data.email) setEmail(data.email);
      setMaskedEmail(data.masked_email || maskEmailLocal(data.email || inputVal));
      setStep("otp");
      startCooldown(60);
      startExpiryCountdown();
      setTimeout(() => { if (otpRefs.current[0]) otpRefs.current[0].focus(); }, 100);
    } catch { setError("Gagal menghubungi server. Periksa koneksi internet Anda."); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError("");
    const code = otpDigits.join("");
    if (code.length !== 6) { setOtpError("Masukkan 6 digit kode verifikasi."); return; }
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.errors?.code?.[0] || data?.message || "Kode OTP tidak valid.";
        setOtpError(msg);
        return;
      }
      setResetToken(data.reset_token || data.token);
      setStep("reset");
      if (expiryRef.current) clearInterval(expiryRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    } catch { setOtpError("Gagal menghubungi server."); }
    finally { setOtpLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste.length) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < paste.length && i < 6; i++) newDigits[i] = paste[i];
    setOtpDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => d === "");
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    otpRefs.current[focusIdx]?.focus();
    if (newDigits.every((d) => d !== "")) setTimeout(() => handleVerifyOtp(), 200);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError("");
    setOtpDigits(["", "", "", "", "", ""]);
    try {
      const res = await fetch(`${API_URL}/resend-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setOtpError(data?.message || "Gagal mengirim ulang kode."); return; }
      startCooldown(60);
      startExpiryCountdown();
      setTimeout(() => { if (otpRefs.current[0]) otpRefs.current[0].focus(); }, 100);
    } catch { setOtpError("Gagal menghubungi server."); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    if (!newPassword) return setResetError("Masukkan password baru.");
    if (newPassword.length < 8) return setResetError("Password minimal 8 karakter.");
    if (newPassword !== confirmPassword) return setResetError("Konfirmasi password tidak sama.");
    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reset_token: resetToken,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.errors ? Object.values(data.errors).flat().join(" ") : (data?.message || "Gagal mengubah password.");
        return setResetError(msg);
      }
      setStep("success");
    } catch { setResetError("Gagal menghubungi server."); }
    finally { setResetLoading(false); }
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
                Lupa kata sandi?<br />
                Tenang, kami bantu<br />
                reset dengan aman.
              </h1>
              <p className="login-branding__subtext login-branding__subtext--dark">
                Surade membantu bisnis Anda ditemukan, dipercaya, dan berkembang bersama masyarakat di 12 desa Kecamatan Surade.
              </p>

              <ul className="login-branding__points">
                <li>
                  <CheckCircle size={18} />
                  <span>Verifikasi aman via email terdaftar</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Kode OTP instan &amp; berbatas waktu</span>
                </li>
                <li>
                  <CheckCircle size={18} />
                  <span>Pulihkan akses akun Anda dalam 2 menit</span>
                </li>
              </ul>
            </div>

            <p className="login-branding__copy">&copy; 2026 Surade.com — All rights reserved.</p>
          </div>

          {/* ═══════ RIGHT CARD ═══════ */}
          <div className="login-card login-card--split" style={{ overflowY: "auto", maxHeight: "100vh" }}>
            <div className="login-card__content" style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
              <div className="login-card__header-logo">
                <img src={logoImg} alt="Surade.com" className="login-card__logo" />
                <span className="login-card__brand-name">
                  Surade<span>.com</span>
                </span>
              </div>

              {step === "email" && (
                <>
                  <h2 className="login-card__title">Lupa Kata Sandi?</h2>
                  <p className="login-card__subtitle">Masukkan email yang terdaftar untuk menerima kode verifikasi OTP</p>

                  <form className="login-form" onSubmit={handleSendOtp} noValidate>
                    {error && (
                      <div className="login-error">
                        <AlertCircle size={18} className="login-error__icon" />
                        {error}
                      </div>
                    )}

                    <div className="login-field-group">
                      <label htmlFor="fp-em" className="login-field-label">ALAMAT EMAIL</label>
                      <input
                        id="fp-em"
                        type="email"
                        className="login-input"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={loading}
                      style={{
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                    </button>

                    <Link to="/login" style={{ textDecoration: "none" }}>
                      <button type="button" className="login-create-btn login-create-btn--outline" style={{ marginTop: 8, width: "100%" }}>
                        <ArrowLeft size={16} /> Kembali ke Login
                      </button>
                    </Link>
                  </form>
                </>
              )}

              {step === "otp" && (
                <>
                  <h2 className="login-card__title">Verifikasi Kode OTP</h2>
                  <p className="login-card__subtitle">Kode telah dikirim ke <strong>{maskedEmail}</strong></p>

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
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={i === 0 ? handleOtpPaste : undefined}
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

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "0.82rem", color: otpExpiry <= 0 ? "#ef4444" : "#64748b", marginBottom: 12 }}>
                      <Clock size={14} />
                      {otpExpiry > 0 ? `Kode berlaku ${formatTime(otpExpiry)}` : "Kode sudah kadaluarsa"}
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={otpLoading || otpExpiry <= 0}
                      style={{
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {otpLoading ? "Memverifikasi..." : "Verifikasi OTP"}
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

                    <button type="button" className="login-create-btn login-create-btn--outline" onClick={() => setStep("email")} style={{ marginTop: 12, width: "100%" }}>
                      <ArrowLeft size={16} /> Kembali
                    </button>
                  </form>
                </>
              )}

              {step === "reset" && (
                <>
                  <h2 className="login-card__title">Buat Kata Sandi Baru</h2>
                  <p className="login-card__subtitle">Buat kata sandi baru untuk akun <strong>{maskedEmail}</strong></p>

                  <form className="login-form" onSubmit={handleResetPassword} noValidate>
                    {resetError && (
                      <div className="login-error">
                        <AlertCircle size={18} className="login-error__icon" />
                        {resetError}
                      </div>
                    )}

                    <div className="login-field-group">
                      <label htmlFor="fp-np" className="login-field-label">KATA SANDI BARU</label>
                      <div className="login-password-wrapper">
                        <input
                          id="fp-np"
                          type={showNewPassword ? "text" : "password"}
                          className="login-input"
                          placeholder="Kata sandi baru (min. 8 karakter)"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setResetError(""); }}
                          autoFocus
                        />
                        <button type="button" className="login-password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {newPassword.length > 0 && (
                      <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: "0.78rem" }}>
                        {passwordRules.map((rule, i) => {
                          const met = rule.test(newPassword);
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: met ? "#059669" : "#94a3b8", marginTop: 2 }}>
                              {met ? <Check size={12} /> : <X size={12} />}
                              {rule.label}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="login-field-group">
                      <label htmlFor="fp-cp" className="login-field-label">KONFIRMASI KATA SANDI BARU</label>
                      <div className="login-password-wrapper">
                        <input
                          id="fp-cp"
                          type={showConfirmPassword ? "text" : "password"}
                          className="login-input"
                          placeholder="Ulangi kata sandi baru"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setResetError(""); }}
                        />
                        <button type="button" className="login-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={resetLoading}
                      style={{
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "#fff",
                        border: "none",
                        padding: "12px",
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      {resetLoading ? "Memproses..." : "Reset Kata Sandi"}
                    </button>
                  </form>
                </>
              )}

              {step === "success" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                    <CheckCircle size={36} />
                  </div>
                  <h2 className="login-card__title" style={{ textAlign: "center" }}>Kata Sandi Berhasil Diubah!</h2>
                  <p className="login-card__subtitle" style={{ textAlign: "center", marginTop: 8 }}>
                    Password Anda telah berhasil direset. Silakan login dengan kata sandi baru Anda.
                  </p>
                  <button
                    className="login-submit-btn"
                    onClick={() => navigate("/login?reset=success")}
                    style={{
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      marginTop: 20,
                    }}
                  >
                    Masuk ke Akun
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}