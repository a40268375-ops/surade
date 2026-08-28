import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import logoImg from "../assets/logo.png";
import {
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Clock,
  Lock,
  Check,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();

  // ── Step: "email" | "otp" | "reset" | "success" ──
  const [step, setStep] = useState("email");

  // ── Shared state ──
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // ── OTP state ──
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);
  const expiryRef = useRef(null);

  // ── Reset password state ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // ── Cleanup timers ──
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, []);

  // ── Start cooldown timer ──
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

  // ── Start OTP expiry countdown ──
  const startExpiryCountdown = () => {
    setOtpExpiry(300); // 5 minutes
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

  // ── Format seconds to MM:SS ──
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Password validation rules ──
  const passwordRules = [
    { label: "Minimal 8 karakter", test: (p) => p.length >= 8 },
    { label: "Mengandung huruf besar", test: (p) => /[A-Z]/.test(p) },
    { label: "Mengandung huruf kecil", test: (p) => /[a-z]/.test(p) },
    { label: "Mengandung angka", test: (p) => /[0-9]/.test(p) },
  ];

  // ════════════════════════════════════════
  // STEP 1: Send OTP to email
  // ════════════════════════════════════════
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Masukkan alamat email Anda.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setError(data?.message || "Terlalu banyak permintaan. Silakan tunggu.");
        return;
      }

      if (!res.ok && res.status !== 200) {
        setError(data?.message || "Terjadi kesalahan. Silakan coba lagi.");
        return;
      }

      // Store masked email for display
      setMaskedEmail(data?.masked_email || maskEmailLocal(email.trim()));

      // Move to OTP step
      setStep("otp");
      startCooldown(60);
      startExpiryCountdown();

      // Focus first OTP input
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════
  // STEP 2: Verify OTP
  // ════════════════════════════════════════
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError("");

    const otpCode = otpDigits.join("");
    if (otpCode.length !== 6) {
      setOtpError("Masukkan 6 digit kode OTP.");
      return;
    }

    if (otpExpiry <= 0) {
      setOtpError("Kode OTP sudah kadaluarsa. Silakan minta kode baru.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setOtpError(data?.message || "Kode OTP tidak valid.");
        return;
      }

      // Store reset token and move to password reset step
      setResetToken(data.reset_token);
      setStep("reset");

      // Cleanup OTP timer
      if (expiryRef.current) clearInterval(expiryRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    } catch (err) {
      setOtpError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError("");

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 0) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < paste.length && i < 6; i++) {
      newDigits[i] = paste[i];
    }
    setOtpDigits(newDigits);

    // Focus the next empty or last input
    const nextEmpty = newDigits.findIndex((d) => d === "");
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    otpRefs.current[focusIdx]?.focus();

    // Auto-submit if all 6 digits pasted
    if (newDigits.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtp(), 200);
    }
  };

  // ── Resend OTP ──
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setOtpError("");
    setOtpDigits(["", "", "", "", "", ""]);

    try {
      const res = await fetch(`${API_URL}/resend-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        setOtpError(data?.message || "Tunggu sebelum meminta kode baru.");
        return;
      }

      if (!res.ok) {
        setOtpError(data?.message || "Gagal mengirim ulang kode.");
        return;
      }

      startCooldown(60);
      startExpiryCountdown();

      // Focus first OTP input
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setOtpError("Gagal menghubungi server.");
    }
  };

  // ════════════════════════════════════════
  // STEP 3: Reset password
  // ════════════════════════════════════════
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword) {
      setResetError("Masukkan password baru.");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Konfirmasi password tidak sama.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          reset_token: resetToken,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResetError(data?.message || "Gagal mengubah password. Silakan coba lagi.");
        return;
      }

      // Success!
      setStep("success");
    } catch (err) {
      setResetError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Local email masking fallback ──
  const maskEmailLocal = (email) => {
    const parts = email.split("@");
    const name = parts[0];
    const domain = parts[1] || "email.com";
    if (name.length <= 2) return name[0] + "***@" + domain;
    return name[0] + "*".repeat(name.length - 2) + name[name.length - 1] + "@" + domain;
  };

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="fp-page">
      <main className="fp-main">
        <div className="fp-container">
          {/* ── Left: Branding ── */}
          <div className="fp-branding">
            <Link to="/">
              <img src={logoImg} alt="Info.co.id" className="fp-branding__logo" />
            </Link>
            <h1 className="fp-branding__tagline">
              {step === "success"
                ? "Password berhasil diubah. Silakan login kembali."
                : (
                  <>
                    Lupa password? Tenang, kami bantu <strong>reset password</strong> Anda dengan aman.
                  </>
                )}
            </h1>
          </div>

          {/* ── Right: Card ── */}
          <div className="fp-card">

            {/* ═══ STEP: EMAIL ═══ */}
            {step === "email" && (
              <>
                <div className="fp-card__icon">
                  <Mail size={28} />
                </div>
                <h2 className="fp-card__title">Lupa Kata Sandi?</h2>
                <p className="fp-card__subtitle">
                  Masukkan email yang terdaftar. Kami akan mengirim kode verifikasi untuk reset password.
                </p>

                <form className="fp-form" onSubmit={handleSendOtp} noValidate>
                  {error && (
                    <div className="fp-error">
                      <AlertCircle size={16} className="fp-error__icon" />
                      {error}
                    </div>
                  )}

                  <input
                    id="fp-email"
                    type="email"
                    className={`fp-input ${error ? "fp-input--error" : ""}`}
                    placeholder="Alamat email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    autoFocus
                  />

                  <button
                    id="fp-send-otp"
                    type="submit"
                    className={`fp-btn ${loading ? "fp-btn--loading" : ""}`}
                    disabled={loading}
                  >
                    {loading && <span className="fp-spinner" />}
                    {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                  </button>

                  <div className="fp-divider">
                    <span className="fp-divider__line" />
                  </div>

                  <div className="fp-back">
                    <Link to="/login">
                      <ArrowLeft size={16} />
                      Kembali ke Login
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* ═══ STEP: OTP VERIFICATION ═══ */}
            {step === "otp" && (
              <>
                <div className="fp-card__icon">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="fp-card__title">Verifikasi Kode</h2>
                <p className="fp-card__subtitle">
                  Kode verifikasi telah dikirim ke{" "}
                  <strong>{maskedEmail}</strong>. Masukkan 6 digit kode tersebut.
                </p>

                <form className="fp-form" onSubmit={handleVerifyOtp} noValidate>
                  {otpError && (
                    <div className="fp-error">
                      <AlertCircle size={16} className="fp-error__icon" />
                      {otpError}
                    </div>
                  )}

                  {/* 6-digit OTP inputs */}
                  <div className="fp-otp-group" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`fp-otp-input ${digit ? "fp-otp-input--filled" : ""}`}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {/* Countdown timer */}
                  <div className={`fp-timer ${otpExpiry <= 0 ? "fp-timer--expired" : ""}`}>
                    <Clock size={14} />
                    {otpExpiry > 0
                      ? `Kode berlaku ${formatTime(otpExpiry)}`
                      : "Kode sudah kadaluarsa"}
                  </div>

                  <button
                    id="fp-verify-otp"
                    type="submit"
                    className={`fp-btn ${otpLoading ? "fp-btn--loading" : ""}`}
                    disabled={otpLoading || otpExpiry <= 0}
                  >
                    {otpLoading && <span className="fp-spinner" />}
                    {otpLoading ? "Memverifikasi..." : "Verifikasi"}
                  </button>

                  {/* Resend */}
                  <button
                    id="fp-resend"
                    type="button"
                    className="fp-resend-btn"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                  >
                    <RefreshCw size={14} />
                    {resendCooldown > 0
                      ? `Kirim ulang (${resendCooldown}s)`
                      : "Kirim Ulang Kode"}
                  </button>

                  <div className="fp-back">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtpDigits(["", "", "", "", "", ""]);
                        setOtpError("");
                        if (expiryRef.current) clearInterval(expiryRef.current);
                        if (cooldownRef.current) clearInterval(cooldownRef.current);
                      }}
                    >
                      <ArrowLeft size={16} />
                      Kembali
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ═══ STEP: RESET PASSWORD ═══ */}
            {step === "reset" && (
              <>
                <div className="fp-card__icon">
                  <KeyRound size={28} />
                </div>
                <h2 className="fp-card__title">Buat Password Baru</h2>
                <p className="fp-card__subtitle">
                  Buat password baru untuk akun <strong>{maskedEmail}</strong>
                </p>

                <form className="fp-form" onSubmit={handleResetPassword} noValidate>
                  {resetError && (
                    <div className="fp-error">
                      <AlertCircle size={16} className="fp-error__icon" />
                      {resetError}
                    </div>
                  )}

                  {/* New password */}
                  <div className="fp-password-wrapper">
                    <input
                      id="fp-new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="fp-input"
                      placeholder="Password baru"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setResetError("");
                      }}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="fp-password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                      aria-label={showNewPassword ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {newPassword.length > 0 && (
                    <ul className="fp-requirements">
                      {passwordRules.map((rule, i) => {
                        const met = rule.test(newPassword);
                        return (
                          <li
                            key={i}
                            className={`fp-requirement ${met ? "fp-requirement--met" : "fp-requirement--unmet"}`}
                          >
                            {met ? <Check size={12} /> : <X size={12} />}
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Confirm password */}
                  <div className="fp-password-wrapper">
                    <input
                      id="fp-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className={`fp-input ${confirmPassword && newPassword !== confirmPassword ? "fp-input--error" : ""}`}
                      placeholder="Konfirmasi password baru"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setResetError("");
                      }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="fp-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Password mismatch warning */}
                  {confirmPassword && newPassword !== confirmPassword && (
                    <div className="fp-error" style={{ padding: "8px 12px" }}>
                      <AlertCircle size={14} className="fp-error__icon" />
                      Konfirmasi password tidak sama.
                    </div>
                  )}

                  <button
                    id="fp-reset-password"
                    type="submit"
                    className={`fp-btn ${resetLoading ? "fp-btn--loading" : ""}`}
                    disabled={resetLoading}
                  >
                    {resetLoading && <span className="fp-spinner" />}
                    <Lock size={18} />
                    {resetLoading ? "Memproses..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

            {/* ═══ STEP: SUCCESS ═══ */}
            {step === "success" && (
              <div className="fp-success-card">
                <div className="fp-success-card__icon">
                  <CheckCircle size={36} />
                </div>
                <h2 className="fp-success-card__title">Password Berhasil Diubah!</h2>
                <p className="fp-success-card__text">
                  Password Anda telah berhasil direset. Silakan login menggunakan password baru Anda.
                </p>
                <button
                  id="fp-go-login"
                  className="fp-btn"
                  onClick={() => navigate("/login?reset=success")}
                  style={{ marginTop: 0 }}
                >
                  Masuk ke Akun
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="fp-footer">
        <div className="fp-footer__inner">
          <div className="fp-footer__links">
            <Link to="/about">Tentang</Link>
            <Link to="/contact">Hubungi Kami</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/terms">Syarat &amp; Ketentuan</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/vision-mission">Visi &amp; Misi</Link>
            <Link to="/partnership-career">Karir</Link>
          </div>
          <p className="fp-footer__copy">
            &copy; 2026 Info.co.id. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
