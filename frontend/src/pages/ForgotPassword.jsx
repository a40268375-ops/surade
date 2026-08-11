import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import businessIllustration from "../assets/business-illustration.svg";
import api from "../utils/api";
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // step: 1 = masukkan email, 2 = masukkan kode, 3 = kata sandi baru, 4 = selesai
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  /* ── STEP 1: kirim kode ke email ── */
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await api.post("forgot-password", { email: email.trim() });
      setStep(2);
    } catch (err) {
      setError(
        err?.data?.errors?.email?.[0] ||
        err?.data?.message ||
        err?.message ||
        "Gagal mengirim kode verifikasi."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2: verifikasi kode ── */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Kode verifikasi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await api.post("verify-reset-code", { email: email.trim(), code: code.trim() });
      setStep(3);
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Kode verifikasi salah atau sudah kedaluwarsa."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3: set kata sandi baru ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim() || !passwordConfirm.trim()) {
      setError("Kata sandi baru wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }

    setLoading(true);
    try {
      await api.post("reset-password", {
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      setStep(4);
    } catch (err) {
      setError(
        err?.data?.errors?.password?.[0] ||
        err?.data?.message ||
        err?.message ||
        "Gagal mereset kata sandi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);
    try {
      await api.post("forgot-password", { email: email.trim() });
      setError("");
      alert("Kode verifikasi baru sudah dikirim ke email kamu.");
    } catch (err) {
      setError(err?.data?.message || err?.message || "Gagal mengirim ulang kode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          {/* ── Left: Brand illustration ── */}
          <div className="login-visual">
            <img
              src={businessIllustration}
              alt="Surade.co.id — Temukan toko yang kamu cari"
              className="login-visual__image"
            />
          </div>

          {/* ── Right: Forgot Password Card ── */}
          <div className="login-card">
            {/* STEP 1 — Masukkan Email */}
            {step === 1 && (
              <form className="login-form" onSubmit={handleSendCode} noValidate>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
                  Lupa Kata Sandi?
                </h2>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
                  Masukkan email akun kamu. Kami akan mengirimkan kode verifikasi 6 digit untuk reset kata sandi.
                </p>

                {error && (
                  <div className="login-error">
                    <AlertCircle size={18} className="login-error__icon" />
                    {error}
                  </div>
                )}

                <input
                  type="email"
                  className={`login-input ${error ? "login-input--error" : ""}`}
                  placeholder="Email akun kamu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <button
                  type="submit"
                  className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                  disabled={loading}
                >
                  {loading && <span className="login-spinner" />}
                  {loading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                </button>

                <Link to="/login" className="login-back-btn">
                  <ArrowLeft size={18} />
                  Kembali ke Login
                </Link>
              </form>
            )}

            {/* STEP 2 — Masukkan Kode */}
            {step === 2 && (
              <form className="login-form" onSubmit={handleVerifyCode} noValidate>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
                  Masukkan Kode Verifikasi
                </h2>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
                  Kode 6 digit sudah dikirim ke <strong>{email}</strong>. Kode berlaku selama 15 menit.
                </p>

                {error && (
                  <div className="login-error">
                    <AlertCircle size={18} className="login-error__icon" />
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className={`login-input ${error ? "login-input--error" : ""}`}
                  placeholder="Kode 6 digit"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  style={{ letterSpacing: 6, textAlign: "center", fontWeight: 600 }}
                />

                <button
                  type="submit"
                  className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                  disabled={loading}
                >
                  {loading && <span className="login-spinner" />}
                  {loading ? "Memverifikasi..." : "Verifikasi Kode"}
                </button>

                <div className="login-forgot">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{ background: "none", border: "none", color: "#0f766e", cursor: "pointer", fontWeight: 600 }}
                  >
                    Kirim ulang kode
                  </button>
                </div>

                <button
                  type="button"
                  className="login-back-btn"
                  onClick={() => { setStep(1); setCode(""); setError(""); }}
                >
                  <ArrowLeft size={18} />
                  Ganti Email
                </button>
              </form>
            )}

            {/* STEP 3 — Kata Sandi Baru */}
            {step === 3 && (
              <form className="login-form" onSubmit={handleResetPassword} noValidate>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
                  Buat Kata Sandi Baru
                </h2>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
                  Kode terverifikasi. Masukkan kata sandi baru untuk akun kamu.
                </p>

                {error && (
                  <div className="login-error">
                    <AlertCircle size={18} className="login-error__icon" />
                    {error}
                  </div>
                )}

                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`login-input ${error ? "login-input--error" : ""}`}
                    placeholder="Kata sandi baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="login-password-wrapper">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    className={`login-input ${error ? "login-input--error" : ""}`}
                    placeholder="Konfirmasi kata sandi baru"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                  disabled={loading}
                >
                  {loading && <span className="login-spinner" />}
                  {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                </button>
              </form>
            )}

            {/* STEP 4 — Selesai */}
            {step === 4 && (
              <div className="login-form" style={{ textAlign: "center" }}>
                <CheckCircle2 size={48} color="#0f766e" style={{ margin: "0 auto 12px" }} />
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#111827" }}>
                  Kata Sandi Berhasil Direset
                </h2>
                <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6b7280" }}>
                  Silakan login menggunakan kata sandi baru kamu.
                </p>
                <button className="login-btn" onClick={() => navigate("/login")}>
                  Ke Halaman Login
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}