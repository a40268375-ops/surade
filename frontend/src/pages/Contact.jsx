import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import contactBg from "../assets/contact-hero.jpg";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
import api from "../services/api";
import {
  Mail,
  Phone,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  Headphones,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Building2,
  ArrowRight
} from "lucide-react";
import CaptchaInput from "../components/CaptchaInput";
import "./Contact.css";

const SUBJECT_OPTIONS = [
  "Pendaftaran UMKM / Profil Usaha",
  "Kerjasama & Kemitraan Bisnis",
  "Pemasangan Banner / Paket Iklan",
  "Kendala Akun & Verifikasi OTP",
  "Laporan Informasi / Konten",
  "Pertanyaan Umum Lainnya",
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Pendaftaran UMKM / Profil Usaha",
    message: "",
  });
  const [userCaptcha, setUserCaptcha] = useState("");
  const captchaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Hubungi Kami - Surade.com";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Mohon lengkapi Nama, Email, dan Pesan Anda.");
      return;
    }

    if (!userCaptcha) {
      setError("Silakan selesaikan verifikasi keamanan (CAPTCHA) terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim() || "Pertanyaan Umum",
        message: formData.message.trim(),
        captcha_token: userCaptcha,
        recaptcha_token: userCaptcha,
        "g-recaptcha-response": userCaptcha,
      });

      if (response.data && (response.data.success || response.status === 200)) {
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "Pendaftaran UMKM / Profil Usaha",
          message: "",
        });
        setUserCaptcha("");
        if (captchaRef.current?.reset) captchaRef.current.reset();
        setSuccess(true);
      } else {
        setError(response.data?.message || "Terjadi kendala saat mengirim pesan. Silakan coba lagi.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal mengirim pesan. Silakan periksa koneksi internet Anda atau hubungi kami via WhatsApp.";
      setError(errorMsg);
      setUserCaptcha("");
      if (captchaRef.current?.reset) captchaRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH USER UPLOADED BACKGROUND & WAVE DIVIDER */}
      <header className="contact-hero">
        <div
          className="contact-hero__bg"
          style={{ backgroundImage: `url(${contactBg})` }}
        />
        <div className="contact-hero__overlay" />
        <div className="contact-hero__glow" />

        <div className="contact-hero__content">
          <div className="contact-hero__badge">
            <Sparkles size={14} className="contact-hero__badge-icon" />
            <span>Pusat Layanan &amp; Informasi</span>
          </div>

          <div className="contact-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Hubungi Kami</span>
          </div>

          <h1 className="contact-hero__title">
            Hubungi <span>Kami</span>
          </h1>

          <p className="contact-hero__subtitle">
            Punya pertanyaan seputar direktori, ingin bermitra, atau butuh bantuan pendaftaran UMKM? Tim Surade.com siap membantu Anda dengan senang hati.
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER (GELOMBANG) */}
        <div className="contact-hero__wave">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#f8fafc"
            />
          </svg>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="contact-main">
        <div className="contact-container">

          {/* 3 TOP CONTACT METHOD CARDS */}
          <section className="contact-channels-section">
            <div className="contact-section-header">
              <div className="contact-header-badge">
                <Headphones size={15} />
                <span>Saluran Komunikasi Cepat</span>
              </div>
              <h2 className="contact-section-title">Pilih Cara Tercepat Terhubung</h2>
              <p className="contact-section-subtitle">
                Kami menyediakan berbagai kemudahan akses saluran resmi agar pertanyaan dan kebutuhan Anda segera terjawab.
              </p>
            </div>

            <div className="contact-cards-grid">
              {/* WHATSAPP CARD (FEATURED) */}
              <div className="contact-card contact-card--whatsapp">
                <div className="contact-card__badge">Respon Tercepat</div>
                <div className="contact-card__icon-wrap contact-card__icon-wrap--wa">
                  <WhatsAppIcon size={38} />
                </div>
                <h3 className="contact-card__title">Chat WhatsApp Resmi</h3>
                <p className="contact-card__value">+62 811-1919-711</p>
                <p className="contact-card__desc">
                  Konsultasi instan dengan customer service kami untuk bantuan cepat dan panduan pendaftaran.
                </p>
                <a
                  href="https://wa.me/628111919711?text=Halo%20Admin%20Surade.com,%20saya%20ingin%20bertanya%20seputar%20layanan%20Surade.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-card__btn contact-card__btn--wa"
                >
                  <WhatsAppIcon size={18} />
                  <span>Chat WhatsApp Sekarang</span>
                </a>
              </div>

              {/* EMAIL SUPPORT */}
              <div className="contact-card">
                <div className="contact-card__icon-wrap">
                  <Mail size={34} />
                </div>
                <h3 className="contact-card__title">Email Dukungan</h3>
                <p className="contact-card__value">admin@surade.com</p>
                <p className="contact-card__desc">
                  Kirimkan pertanyaan resmi, proposal kerjasama, penawaran sponsorship, atau berkas legalitas.
                </p>
                <a
                  href="mailto:admin@surade.com"
                  className="contact-card__btn contact-card__btn--outline"
                >
                  <Mail size={16} />
                  <span>Kirim Email</span>
                </a>
              </div>

              {/* CALL CENTER */}
              <div className="contact-card">
                <div className="contact-card__icon-wrap">
                  <Phone size={34} />
                </div>
                <h3 className="contact-card__title">Layanan Telepon</h3>
                <p className="contact-card__value">0807 - 100 - 1500</p>
                <p className="contact-card__desc">
                  Hotline telepon untuk pengaduan layanan pelanggan dan verifikasi direktori bisnis.
                </p>
                <a
                  href="tel:08071001500"
                  className="contact-card__btn contact-card__btn--outline"
                >
                  <Phone size={16} />
                  <span>Hubungi Hotline</span>
                </a>
              </div>
            </div>
          </section>

          {/* TWO COLUMN SECTION: FORM & SIDEBAR INFO */}
          <section className="contact-split-section">
            {/* LEFT: FORM WRAPPER */}
            <div className="contact-form-box">
              <div className="contact-form-header">
                <div className="contact-form-badge">
                  <MessageSquare size={16} />
                  <span>Formulir Pesan</span>
                </div>
                <h2 className="contact-form-title">Tinggalkan Pesan</h2>
                <p className="contact-form-desc">
                  Isi formulir berikut dan tim kami akan merespon melalui email atau WhatsApp Anda dalam 1x24 jam.
                </p>
              </div>

              {/* ALERT SUCCESS */}
              {success && (
                <div className="contact-notification contact-notification--success">
                  <div className="contact-notification__icon">
                    <CheckCircle size={22} />
                  </div>
                  <div className="contact-notification__text">
                    <strong>Pesan Anda Berhasil Terkirim!</strong>
                    <p>Terima kasih telah menghubungi kami. Tim kami akan segera meninjau dan membalas pesan Anda.</p>
                  </div>
                </div>
              )}

              {/* ALERT ERROR */}
              {error && (
                <div className="contact-notification contact-notification--error">
                  <div className="contact-notification__icon">
                    <AlertCircle size={22} />
                  </div>
                  <div className="contact-notification__text">
                    <strong>Gagal Mengirim Pesan</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form-inner">
                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label htmlFor="name" className="contact-label">
                      Nama Lengkap <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      className="contact-input"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="email" className="contact-label">
                      Alamat Email <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className="contact-input"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-input-group">
                    <label htmlFor="phone" className="contact-label">
                      Nomor Telepon / WhatsApp <span className="opt">(Opsional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="081234567890"
                      className="contact-input"
                      disabled={loading}
                    />
                  </div>

                  <div className="contact-input-group">
                    <label htmlFor="subject" className="contact-label">
                      Kategori / Subjek <span className="req">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="contact-input contact-select"
                      disabled={loading}
                    >
                      {SUBJECT_OPTIONS.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="contact-input-group">
                  <label htmlFor="message" className="contact-label">
                    Isi Pesan <span className="req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tuliskan detail pertanyaan, usulan, atau kebutuhan bantuan Anda secara lengkap..."
                    className="contact-input contact-textarea"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Google reCAPTCHA v2 Checkbox */}
                <CaptchaInput
                  ref={captchaRef}
                  id="contact-captcha"
                  label="Verifikasi Keamanan"
                  value={userCaptcha}
                  onChange={setUserCaptcha}
                />

                <div className="contact-form-action">
                  <button
                    type="submit"
                    className="contact-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="contact-spin" />
                        <span>Mengirimkan Pesan...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Kirim Pesan Sekarang</span>
                      </>
                    )}
                  </button>

                  <p className="contact-privacy-note">
                    Data Anda aman dan tidak akan disebarluaskan sesuai Kebijakan Privasi kami.
                  </p>
                </div>
              </form>
            </div>

            {/* RIGHT: SIDEBAR INFO & OFFICE DETAILS */}
            <div className="contact-sidebar">

              {/* FAQ TEASER CARD */}
              <div className="contact-side-card contact-side-card--faq">
                <div className="contact-side-card__header">
                  <div className="contact-side-card__icon contact-side-card__icon--teal">
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <h3 className="contact-side-card__title">Pusat Bantuan &amp; FAQ</h3>
                    <p className="contact-side-card__sub">Jawaban Cepat &amp; Praktis</p>
                  </div>
                </div>
                <div className="contact-side-card__body">
                  <p className="contact-faq-teaser-text">
                    Mencari panduan verifikasi OTP, pendaftaran etalase UMKM, atau kebijakan iklan? Kunjungi halaman FAQ kami.
                  </p>
                  <Link to="/faq" className="contact-faq-link-btn">
                    <span>Buka Halaman FAQ</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* SMART VILLAGE COLLABORATION CALLOUT */}
              <div className="contact-side-card contact-side-card--collab">
                <div className="contact-side-card__header">
                  <div className="contact-side-card__icon contact-side-card__icon--emerald">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="contact-side-card__title">Integrasi 12 Desa</h3>
                    <p className="contact-side-card__sub">Kolaborasi Smart Village</p>
                  </div>
                </div>
                <p className="contact-collab-text">
                  Aparatur desa atau pengelola BUMDes se-Kecamatan Surade dapat menghubungi kami untuk sinkronisasi data produk unggulan dan potensi wisata desa.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
