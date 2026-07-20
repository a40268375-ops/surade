import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logoImg from "../assets/logo.png";
import {
  Eye,
  EyeOff,
  AlertCircle,
  X,
  UserPlus,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

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
        setError(data?.message || "Email atau kata sandi salah. Silakan coba lagi.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userAuthChanged"));

      navigate("/admin-user");
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Register handler ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const gmailOnlyRegex = /^[^\s@]+@gmail\.com$/i;

    if (!regFirstName.trim() || !regLastName.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!regEmail.trim() || !gmailOnlyRegex.test(regEmail.trim())) {
      setError("Email harus menggunakan Gmail (contoh: nama@gmail.com).");
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }

    if (!regPasswordConfirmation || regPassword !== regPasswordConfirmation) {
      setError("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: `${regFirstName} ${regLastName}`.trim(),
          email: regEmail.trim(),
          password: regPassword,
          password_confirmation: regPasswordConfirmation,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Gagal mendaftar. Silakan coba lagi.");
        return;
      }

      // Automatically login and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("userAuthChanged"));

      alert("Pendaftaran berhasil! Verifikasi email dikirim ke Gmail Anda.");
      
      setShowRegister(false);
      setRegFirstName("");
      setRegLastName("");
      setRegEmail("");
      setRegPassword("");
      setRegPasswordConfirmation("");
      setRegGender("");

      navigate("/admin-user");
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
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
              <strong>Info.co.id</strong> membantu Anda menemukan informasi
              bisnis, toko, dan layanan terpercaya di seluruh Indonesia.
            </p>
          </div>

          {/* ── Right: Login Card ── */}
          <div className="login-card">
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
                placeholder="Email"
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
                <a href="#">Lupa kata sandi?</a>
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
            <Link to="/terms">Syarat & Ketentuan</Link>
            <Link to="/vision-mission">Visi & Misi</Link>
            <Link to="/partnership-career">Karir</Link>
            <a href="#">Privasi</a>
            <a href="#">Cookie</a>
            <a href="#">Bantuan</a>
          </div>
          <p className="login-footer__copy">
            &copy; 2024 Info.co.id. All rights reserved.
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
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
              />

              <input
                id="reg-password"
                type="password"
                className="login-input"
                placeholder="Kata sandi baru"
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
                Dengan mengklik Daftar, Anda menyetujui{" "}
                <Link to="/terms">Ketentuan</Link>,{" "}
                <a href="#">Kebijakan Privasi</a>, dan{" "}
                <a href="#">Kebijakan Cookie</a> kami.
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
