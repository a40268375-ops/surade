import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logoImg from "../assets/logo.png";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageCircle,
} from "lucide-react";
import "./Contact.css";

export default function Contact() {
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
    alert("Pesan Anda telah terkirim! Tim kami akan segera menghubungi Anda.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
            {/* Call Center */}
            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <Phone size={28} />
              </div>
              <h3 className="contact-info-card__title">Call Center</h3>
              <p className="contact-info-card__text">
                <a href="tel:08071001500" className="contact-info-card__link">
                  0807 - 100 - 1500
                </a>
              </p>
              <p className="contact-info-card__subtext">Layanan Pelanggan Resmi</p>
            </div>

            {/* WhatsApp */}
            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <MessageCircle size={28} />
              </div>
              <h3 className="contact-info-card__title">WhatsApp</h3>
              <p className="contact-info-card__text">
                <a
                  href="https://wa.me/628111919711"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-card__link"
                >
                  +62 811-1919-711
                </a>
              </p>
              <p className="contact-info-card__subtext">Chat Cepat &amp; Responsif</p>
            </div>

            {/* Email */}
            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <Mail size={28} />
              </div>
              <h3 className="contact-info-card__title">Email</h3>
              <p className="contact-info-card__text">
                <a href="mailto:support@info.co.id" className="contact-info-card__link">
                  support@info.co.id
                </a>
              </p>
              <p className="contact-info-card__subtext">Bantuan &amp; Kerjasama</p>
            </div>

            {/* Alamat */}
            <div className="contact-info-card">
              <div className="contact-info-card__icon">
                <MapPin size={28} />
              </div>
              <h3 className="contact-info-card__title">Alamat Kantor</h3>
              <p className="contact-info-card__text leading-relaxed">
                Jl. Saturnus No.13 Blk. F, RT.2/RW.5, Ciherang, Kec. Dramaga, Kabupaten Bogor, Jawa Barat 16680
              </p>
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
                  src="https://maps.google.com/maps?q=Jl.+Saturnus+No.13+Blk.+F,+RT.2/RW.5,+Ciherang,+Kec.+Dramaga,+Kabupaten+Bogor,+Jawa+Barat+16680&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Kantor Info.co.id - Ciherang, Dramaga, Bogor"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
