import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import businessIllustration from "../assets/business-illustration.svg";
import api from "../utils/api";
import { Eye, EyeOff, AlertCircle, ArrowLeft, UserPlus } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi form
    if (!formData.name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!formData.password) {
      setError("Password wajib diisi.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Format email tidak valid.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      // Redirect ke halaman verifikasi OTP
      navigate("/verify-otp", {
        state: {
          email: formData.email.trim().toLowerCase(),
          purpose: "register",
          fromRegister: true,
          emailSent: response?.email_sent !== false,
          debugOtpCode: response?.debug_otp_code || null,
        },
      });
    } catch (err) {
      // PENTING: api.js melempar { status, data } langsung, bukan gaya
      // Axios { response: { data } } — err.response selalu undefined
      // sebelumnya, jadi pesan error asli dari backend (mis. "email
      // sudah terdaftar") nggak pernah kebaca, cuma pesan generik.
      const errorMessage = 
        err?.data?.errors?.email?.[0] ||
        err?.data?.errors?.name?.[0] ||
        err?.data?.errors?.password?.[0] ||
        err?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat mendaftar.";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          {/* Left: Brand illustration */}
          <div className="login-visual">
            <img
              src={businessIllustration}
              alt="Surade.co.id — Temukan toko yang kamu cari"
              className="login-visual__image"
            />
          </div>

          {/* Right: Register Card */}
          <div className="login-card">
            <form className="login-form" onSubmit={handleRegister} noValidate>
              <div className="login-header">
                <UserPlus size={24} className="login-header__icon" />
                <h2 className="login-header__title">Buat Akun Baru</h2>
                <p className="login-header__subtitle">
                  Daftar untuk mulai mempromosikan bisnis Anda
                </p>
              </div>

              {error && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
                  {error}
                </div>
              )}

              {/* Nama Lengkap */}
              <input
                type="text"
                name="name"
                className={`login-input ${error ? "login-input--error" : ""}`}
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                className={`login-input ${error ? "login-input--error" : ""}`}
                placeholder="Alamat Email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
              />

              {/* Password */}
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`login-input ${error ? "login-input--error" : ""}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Konfirmasi Password */}
              <div className="login-password-wrapper">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="password_confirmation"
                  className={`login-input ${error ? "login-input--error" : ""}`}
                  placeholder="Konfirmasi Password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  tabIndex={-1}
                  aria-label={showPasswordConfirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                disabled={loading}
              >
                {loading && <span className="login-spinner" />}
                {loading ? "Memproses..." : "Daftar"}
              </button>

              {/* Terms */}
              <p className="login-terms">
                Dengan mendaftar, Anda menyetujui{" "}
                <Link to="/terms">Syarat & Ketentuan</Link> dan{" "}
                <Link to="/terms">Kebijakan Privasi</Link> kami.
              </p>

              {/* Divider */}
              <div className="login-divider">
                <span className="login-divider__line" />
                <span className="login-divider__text">atau</span>
                <span className="login-divider__line" />
              </div>

              {/* Login Link */}
              <div className="login-switch">
                Sudah punya akun?{" "}
                <Link to="/login" className="login-switch__link">
                  Masuk di sini
                </Link>
              </div>

              {/* Back to Website */}
              <Link to="/" className="login-back-btn">
                <ArrowLeft size={18} />
                Kembali ke Website
              </Link>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}