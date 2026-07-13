import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logoImg from "../assets/logo.png";
import codingIllustration from "../assets/coding-illustration.svg";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  Eye,
  EyeOff,
  AlertCircle,
  X,
  UserPlus,
  Home,
  ArrowLeft,
} from "lucide-react";

export default function Login() {
  const pageLoading = usePageLoading();
  const navigate = useNavigate();
  const { login, register } = useAuth();

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
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regError, setRegError] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  /* ── Login handler ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.data?.message || err?.message || "Email atau kata sandi salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Register handler ── */
  const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    if (!regFirstName.trim() || !regEmail.trim() || !regPassword.trim() || !regConfirmPassword.trim()) {
      setRegError("Harap isi seluruh kolom wajib.");
      return;
    }

    if (!GMAIL_REGEX.test(regEmail.trim())) {
      setRegError("Pendaftaran hanya bisa menggunakan alamat email Gmail (contoh: nama@gmail.com).");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Konfirmasi kata sandi tidak sama. Silakan periksa kembali.");
      return;
    }

    try {
      const fullName = `${regFirstName} ${regLastName}`.trim();
      await register(fullName, regEmail.trim(), regPassword);
      alert("Pendaftaran berhasil!");
      setShowRegister(false);
      navigate("/dashboard");
    } catch (err) {
      setRegError(
        err?.data?.errors?.email?.[0] ||
        err?.message ||
        "Gagal melakukan registrasi."
      );
    }
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="login-page">
      {/* ── Main Content ── */}
      <main className="login-main">
        <div className="login-container">

          {/* ── Left: Image panel with embedded text ── */}
          <div className="login-visual">
            <img
              src={codingIllustration}
              alt="Ilustrasi coding dengan logo Surade.co.id"
              className="login-visual__image"
            />
            <div className="login-visual__overlay">
              <img
                src={logoImg}
                alt="Surade.co.id"
                className="login-visual__logo"
              />
              <p className="login-visual__tagline">
                <strong>Surade.co.id</strong> membantu Anda menemukan informasi
                bisnis, toko, dan layanan terpercaya di seluruh Indonesia.
              </p>
            </div>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="login-card">
            {/* Back to Website Button */}
            <button
              type="button"
              className="login-back-btn"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={18} />
              <span>Kembali ke Website</span>
            </button>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              {/* Error */}
              {error && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
                  {error}
                </div>
              )}

              {/* Email */}
              <input
                id="login-email"
                type="email"
                className={`login-input ${error ? "login-input--error" : ""}`}
                placeholder="Email atau nomor telepon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                <Link to="/contact">Lupa kata sandi?</Link>
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
              <button
                type="button"
                className="login-info__link"
                onClick={() => setShowRegister(true)}
              >
                Buat Halaman
              </button>{" "}
              untuk selebritis, merek, atau bisnis Anda.
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
            <Link to="/terms">Syarat & Ketentuan</Link>
            <Link to="/vision-mission">Visi & Misi</Link>
            <Link to="/partnership-career">Karir</Link>
            <Link to="/contact">Bantuan</Link>
          </div>
          <p className="login-footer__copy">
            &copy; 2024 Surade.co.id. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Register Modal ── */}
      {showRegister && (
        <div className="login-modal-overlay" onClick={() => setShowRegister(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="login-modal__header">
              <div>
                <h2 className="login-modal__title">Daftar</h2>
                <p className="login-modal__subtitle">Cepat dan mudah.</p>
              </div>
              <button
                className="login-modal__close"
                onClick={() => setShowRegister(false)}
                aria-label="Tutup"
              >
                <X size={24} />
              </button>
            </div>

            <div className="login-modal__divider" />

            {/* Body */}
            <form className="login-modal__body" onSubmit={handleRegister} noValidate>
              {regError && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
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
                placeholder="Email Gmail (contoh: nama@gmail.com)"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="login-field-hint">Pendaftaran hanya menerima alamat @gmail.com</p>

              <div className="login-password-wrapper">
                <input
                  id="reg-password"
                  type={showRegPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Kata sandi baru"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  tabIndex={-1}
                  aria-label={showRegPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="reg-password-confirm"
                  type={showRegConfirmPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="Verifikasi kata sandi"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showRegConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showRegConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

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
                Dengan mengklik Daftar, Anda menyetujui{" "}
                <Link to="/terms">Ketentuan</Link>,{" "}
                <Link to="/terms">Kebijakan Privasi</Link>, dan{" "}
                <Link to="/terms">Kebijakan Cookie</Link> kami.
              </p>

              <button
                id="reg-submit"
                type="submit"
                className="login-register-btn"
              >
                Daftar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
