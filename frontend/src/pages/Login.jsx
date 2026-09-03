import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";
import logoImg from "../assets/logo.png";
import {
  Eye,
  EyeOff,
  AlertCircle,
  X,
  UserPlus,
  Mail,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /* ── Login form state ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Register modal state ── */
  const [showRegister, setShowRegister] = useState(false);
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
  const [resendCooldown, setResendCooldown] = useState(0); // seconds
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

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
        setRegError(data?.message || "Gagal mengirim kode OTP. Silakan coba lagi.");
        return;
      }

      // Move to OTP step
      setRegStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError("");
      startCooldown(60);

      // Auto-focus first input after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
        setOtpError(data?.message || "Gagal mengirim ulang OTP.");
        return;
      }
      setOtpDigits(["", "", "", "", "", ""]);
      startCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setResendCooldown(0);
  };

  return (
    <div className="login-page">
      {/* ── Main Content ── */}
      <main className="login-main">
        <div className="login-container">

          {/* ── Left: Branding ── */}
          <div className="login-branding">
            <img
              src={logoImg}
              alt="Info.co.id"
              className="login-branding__logo"
            />
            <p className="login-branding__tagline">
              <strong>Info.co.id</strong> Membantu anda meningkatkan dan mempromosikan usaha bisnis anda di seluruh indonesia
            </p>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="login-card">
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
              <input
                id="login-email"
                type="text"
                className={`login-input ${error ? "login-input--error" : ""}`}
                placeholder="Email atau Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />

              {/* Password */}
              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={`login-input ${error ? "login-input--error" : ""}`}
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

              {/* Login Button */}
              <button
                id="login-submit"
                type="submit"
                className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                disabled={loading}
              >
                {loading && <span className="login-spinner" />}
                {loading ? "Memproses..." : "Masuk"}
              </button>

              {/* Forgot Password */}
              <div className="login-forgot">
                <Link to="/forgot-password">Lupa kata sandi?</Link>
              </div>

              {/* Divider */}
              <div className="login-divider">
                <span className="login-divider__line" />
                <span className="login-divider__text">atau</span>
                <span className="login-divider__line" />
              </div>

              {/* Create Account */}
              <button
                id="login-create-account"
                type="button"
                className="login-create-btn"
                onClick={() => setShowRegister(true)}
              >
                <UserPlus size={18} />
                Buat Akun Baru
              </button>
            </form>

            {/* Info text */}
            <p className="login-info">
              <Link to="/">Buat Halaman</Link> untuk selebritis, merek, atau bisnis Anda.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="login-footer">
        <div className="login-footer__inner">
          <div className="login-footer__links">
            <Link to="/about">Tentang</Link>
            <Link to="/contact">Hubungi Kami</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/terms">Syarat &amp; Ketentuan</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/vision-mission">Visi &amp; Misi</Link>
            <Link to="/partnership-career">Karir</Link>
          </div>
          <p className="login-footer__copy">
            &copy; 2026 Info.co.id. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Register Modal ── */}
      {showRegister && (
        <div className="login-modal-overlay" onClick={closeRegisterModal}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>

            {/* ═══════════════════════════════════ STEP: FORM ═══════════════════════════════════ */}
            {regStep === "form" && (
              <>
                <div className="login-modal__header">
                  <div>
                    <h2 className="login-modal__title">Daftar</h2>
                    <p className="login-modal__subtitle">Cepat dan mudah.</p>
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
                    placeholder="Alamat Email (contoh@gmail.com)"
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
                    Dengan mengklik Lanjutkan, Anda menyetujui{" "}
                    <Link to="/terms">Ketentuan</Link>,{" "}
                    <a href="#">Kebijakan Privasi</a>, dan{" "}
                    <a href="#">Kebijakan Cookie</a> kami.
                  </p>

                  <button
                    id="reg-submit"
                    type="submit"
                    className="login-register-btn"
                    disabled={regLoading}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {regLoading ? (
                      <><span className="login-spinner" /> Mengirim OTP...</>
                    ) : (
                      <><Mail size={16} /> Lanjutkan &amp; Kirim OTP</>
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
                      <p className="login-modal__subtitle">Masukkan kode OTP yang dikirim ke Gmail.</p>
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
                  {/* Email hint */}
                  <div style={{
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <Mail size={16} style={{ color: "#0284c7", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#0369a1" }}>
                      Kode dikirim ke <strong>{regEmail}</strong>
                    </span>
                  </div>

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
                      "Verifikasi &amp; Daftar"
                    )}
                  </button>

                  <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 12 }}>
                    Kode berlaku selama <strong>10 menit</strong>. Periksa folder Spam jika tidak ada.
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
