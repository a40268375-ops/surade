import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Mail, 
  Phone, 
  Send, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  Headphones
} from "lucide-react";
import "./Contact.css";

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 28, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.name || !formData.email || !formData.message) {
      setError("Nama, email, dan pesan wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSuccess(true);
        
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero__bg" />
        <div className="contact-hero__overlay" />
        <div className="contact-hero__content">
          <div className="contact-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Hubungi Kami</span>
          </div>
          <h1 className="contact-hero__title">Hubungi Kami</h1>
          <p className="contact-hero__subtitle">
            Punya pertanyaan atau saran? Tim kami siap membantu Anda 24/7
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main">
        <div className="contact-container">
          
          {/* Contact Info Cards */}
          <div className="contact-info-section">
            <div className="contact-info-header">
              <Headphones size={28} className="contact-info-header__icon" />
              <h2 className="contact-info-header__title">Cara Menghubungi Kami</h2>
              <p className="contact-info-header__subtitle">
                Pilih metode komunikasi yang paling nyaman untuk Anda
              </p>
            </div>

            <div className="contact-info-grid">
              <div className="contact-info-card">
                <div className="contact-info-card__icon">
                  <Mail size={28} />
                </div>
                <h3 className="contact-info-card__title">Email Support</h3>
                <p className="contact-info-card__text">support@surade.co.id</p>
                <p className="contact-info-card__desc">Kirim email kapan saja, kami balas dalam 1x24 jam</p>
                <a href="mailto:support@surade.co.id" className="contact-info-card__button">
                  <Mail size={16} />
                  <span>Kirim Email</span>
                </a>
              </div>

              <div className="contact-info-card contact-info-card--featured">
                <div className="contact-info-card__badge">Paling Cepat</div>
                <div className="contact-info-card__icon">
                  <WhatsAppIcon size={32} />
                </div>
                <h3 className="contact-info-card__title">WhatsApp</h3>
                <p className="contact-info-card__text">+62 811-1919-711</p>
                <p className="contact-info-card__desc">Chat langsung dengan tim support kami</p>
                <a 
                  href="https://wa.me/628111919711" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-info-card__button contact-info-card__button--primary"
                >
                  <WhatsAppIcon size={16} />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-card__icon">
                  <Phone size={28} />
                </div>
                <h3 className="contact-info-card__title">Call Center</h3>
                <p className="contact-info-card__text">0807 - 100 - 1500</p>
                <p className="contact-info-card__desc">Layanan telepon tersedia 24/7</p>
                <a href="tel:08071001500" className="contact-info-card__button">
                  <Phone size={16} />
                  <span>Hubungi Sekarang</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <div className="contact-form-header">
              <Send size={28} className="contact-form-header__icon" />
              <h2 className="contact-form__title">Kirim Pesan</h2>
              <p className="contact-form__subtitle">
                Atau isi formulir di bawah ini dan kami akan menghubungi Anda sesegera mungkin
              </p>
            </div>

            {success && (
              <div className="contact-alert contact-alert--success">
                <CheckCircle size={20} />
                <span>Pesan berhasil dikirim! Kami akan segera menghubungi Anda.</span>
              </div>
            )}

            {error && (
              <div className="contact-alert contact-alert--error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form__row">
                <div className="contact-form__group">
                  <label htmlFor="name" className="contact-form__label">
                    Nama Lengkap <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="contact-form__input"
                    placeholder="Masukkan nama lengkap Anda"
                    disabled={loading}
                  />
                </div>

                <div className="contact-form__group">
                  <label htmlFor="email" className="contact-form__label">
                    Alamat Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="contact-form__input"
                    placeholder="nama@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="contact-form__group">
                <label htmlFor="subject" className="contact-form__label">
                  Subjek Pesan
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="contact-form__input"
                  placeholder="Tentang apa pesan Anda?"
                  disabled={loading}
                />
              </div>

              <div className="contact-form__group">
                <label htmlFor="message" className="contact-form__label">
                  Pesan Anda <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="contact-form__textarea"
                  placeholder="Tulis pesan Anda di sini..."
                  rows="6"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="contact-form__submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mengirim Pesan...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
