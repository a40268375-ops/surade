import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  MapPin,
  Phone,
  Mail,
  Send,
} from "lucide-react";
import "./Contact.css";

export default function Contact() {
  const pageLoading = usePageLoading();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Pesan Anda telah terkirim!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="contact-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
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
            Kami siap membantu Anda. Hubungi kami untuk pertanyaan, kerjasama, atau informasi lebih lanjut.
          </p>
        </div>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-content">
        <div className="contact-content__inner">
          {/* Contact Info Cards */}
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <Phone size={28} />
              </div>
              <h3 className="contact-info-card__title">Telepon</h3>
              <p className="contact-info-card__text">(021) 1234 5678</p>
              <p className="contact-info-card__text">0807 100 1500</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <Mail size={28} />
              </div>
              <h3 className="contact-info-card__title">Email</h3>
              <p className="contact-info-card__text">info@Surade.co.id</p>
              <p className="contact-info-card__text">support@Surade.co.id</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <MapPin size={28} />
              </div>
              <h3 className="contact-info-card__title">Alamat</h3>
              <p className="contact-info-card__text">Jl. Contoh No. 123</p>
              <p className="contact-info-card__text">Jakarta, Indonesia</p>
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="contact-main">
            {/* Form */}
            <div className="contact-form-section">
              <h2 className="contact-form-section__title">Kirim Pesan</h2>
              <p className="contact-form-section__subtitle">
                Isi formulir di bawah ini dan kami akan segera merespon pesan Anda.
              </p>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form__row">
                  <div className="contact-form__group">
                    <label htmlFor="name" className="contact-form__label">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="contact-form__input"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="contact-form__group">
                    <label htmlFor="email" className="contact-form__label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="contact-form__input"
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                </div>

                <div className="contact-form__group">
                  <label htmlFor="subject" className="contact-form__label">
                    Subjek
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="contact-form__input"
                    placeholder="Masukkan subjek pesan"
                    required
                  />
                </div>

                <div className="contact-form__group">
                  <label htmlFor="message" className="contact-form__label">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-form__textarea"
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                    required
                  />
                </div>

                <button type="submit" className="contact-form__button">
                  <Send size={18} />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="contact-map-section">
              <h2 className="contact-map-section__title">Lokasi Kami</h2>
              <div className="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.24097831853!2d106.759478!3d-6.2297465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%2C%20Special%20Capital%20Region%20of%20Jakarta!5e0!3m2!1sen!2sid!4v1650000000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Surade.co.id"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Surade.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            {/* Col 2 - Bantuan */}
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2024 Surade.co.id. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Privasi</a>
              <Link to="/terms">Syarat &amp; Ketentuan</Link>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
