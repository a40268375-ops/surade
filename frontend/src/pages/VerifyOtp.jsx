import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import businessIllustration from "../assets/business-illustration.svg";
import api from "../utils/api";
import { AlertCircle, CheckCircle2, Mail, Timer, RefreshCw } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const [canResend, setCanResend] = useState(false);

  // Ambil data dari state navigation
  const email = location.state?.email || "";
  const purpose = location.state?.purpose || "register";
  const fromRegister = location.state?.fromRegister || false;
  const [emailSent, setEmailSent] = useState(location.state?.emailSent !== false);
  const [debugOtpCode, setDebugOtpCode] = useState(location.state?.debugOtpCode || null);

  // Set title
  useEffect(() => {
    document.title = "Verifikasi OTP - Surade.com";
  }, []);

  // Redirect jika tidak ada email
  useEffect(() => {
    if (!email) {
      navigate(purpose === "register" ? "/register" : "/forgot-password");
    }
  }, [email, navigate, purpose]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format waktu
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Hanya angka
    if (value.length <= 6) {
      setOtpCode(value);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpCode.trim()) {
      setError("Kode OTP wajib diisi.");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Kode OTP harus 6 digit.");
      return;
    }

    setLoading(true);
    try {
      if (purpose === "register") {
        // Verifikasi OTP registrasi
        const response = await api.post("/verify-otp", {
          email: email,
          otp_code: otpCode,
        });

        // api.post() mengembalikan body JSON langsung, bukan { data: ... }
        // gaya Axios — sebelumnya response.data selalu undefined, jadi
        // token/user nggak pernah kesimpan dan redirect ke dashboard
        // gagal diam-diam.
        if (response.access_token) {
          localStorage.setItem("token", response.access_token);
          setAuth({
            user: response.user,
            token: response.access_token,
          });
        }

        navigate("/dashboard", {
          state: { message: "Email berhasil diverifikasi!" }
        });
      } else {
        // Untuk reset password, redirect ke halaman yang sesuai
        navigate("/reset-password", {
          state: {
            email: email,
            otpCode: otpCode,
          }
        });
      }
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Kode OTP tidak valid atau sudah kadaluarsa."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setResendLoading(true);
    
    try {
      const endpoint = purpose === "register"
        ? "/resend-otp"
        : "/resend-reset-otp";

      const res = await api.post(endpoint, { email: email });
      setEmailSent(true);

      // Always check for debug OTP code in development
      if (res?.debug_otp_code) {
        setDebugOtpCode(res.debug_otp_code);
      }

      // Reset timer
      setTimeLeft(300);
      setCanResend(false);
      setOtpCode("");

      alert("Kode OTP baru telah dikirim ke email Anda.");
    } catch (err) {
      setEmailSent(false);
      if (err?.data?.debug_otp_code) {
        setDebugOtpCode(err.data.debug_otp_code);
      }
      setError(
        err?.data?.message ||
        err?.message ||
        "Gagal mengirim ulang kode OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return purpose === "register" 
      ? "Verifikasi Email Anda"
      : "Verifikasi Kode Reset";
  };

  const getDescription = () => {
    return purpose === "register"
      ? "Kami telah mengirimkan kode verifikasi 6 digit ke email Anda. Masukkan kode tersebut untuk mengaktifkan akun."
      : "Masukkan kode verifikasi 6 digit yang telah dikirim ke email Anda untuk melanjutkan reset password.";
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          {/* Left: Brand illustration */}
          <div className="login-visual">
            <img
              src={businessIllustration}
              alt="Surade.com — Temukan toko yang kamu cari"
              className="login-visual__image"
            />
          </div>

          {/* Right: OTP Verification Card */}
          <div className="login-card">
            <form className="login-form" onSubmit={handleVerifyOtp} noValidate>
              <div className="login-header">
                <Mail size={24} className="login-header__icon" />
                <h2 className="login-header__title">{getTitle()}</h2>
                <p className="login-header__subtitle">
                  {getDescription()}
                </p>
              </div>

              {/* Email info */}
              <div className="verify-email-info">
                <strong>Email:</strong> {email}
              </div>

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

              {!emailSent && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
                  Email verifikasi gagal dikirim. Silakan periksa kembali alamat email Anda atau coba tombol 'Kirim ulang kode' di bawah.
                </div>
              )}

              {error && (
                <div className="login-error">
                  <AlertCircle size={18} className="login-error__icon" />
                  {error}
                </div>
              )}

              {/* OTP Input */}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`login-input otp-input ${error ? "login-input--error" : ""}`}
                placeholder="000000"
                value={otpCode}
                onChange={handleOtpChange}
                style={{ 
                  letterSpacing: "8px", 
                  textAlign: "center", 
                  fontWeight: "bold",
                  fontSize: "18px"
                }}
                autoComplete="one-time-code"
              />

              {/* Timer */}
              <div className="otp-timer">
                <Timer size={16} />
                <span>
                  {timeLeft > 0 
                    ? `Kode berlaku selama ${formatTime(timeLeft)}`
                    : "Kode OTP sudah kadaluarsa"
                  }
                </span>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                className={`login-btn ${loading ? "login-btn--loading" : ""}`}
                disabled={loading || otpCode.length !== 6}
              >
                {loading && <span className="login-spinner" />}
                {loading ? "Memverifikasi..." : "Verifikasi Kode"}
              </button>

              {/* Resend OTP */}
              <div className="resend-otp">
                <p>Tidak menerima kode?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || resendLoading}
                  className={`resend-btn ${!canResend ? "resend-btn--disabled" : ""}`}
                >
                  {resendLoading && <span className="login-spinner" />}
                  <RefreshCw size={16} />
                  {resendLoading ? "Mengirim..." : "Kirim Ulang Kode"}
                </button>
              </div>

              {/* Back Link */}
              <div className="login-back-link">
                <button
                  type="button"
                  onClick={() => navigate(purpose === "register" ? "/register" : "/forgot-password")}
                  className="login-back-btn"
                >
                  Ganti Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}