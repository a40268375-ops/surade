import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  MousePointer2,
  Globe,
  Heart,
  Zap,
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import "./About.css";

export default function About() {
  const pageLoading = usePageLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="about-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero__bg" />
        <div className="about-hero__overlay" />
        <div className="about-hero__content">
          <div className="about-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Tentang Kami</span>
          </div>
          <h1 className="about-hero__title">Tentang Surade.co.id</h1>
          <p className="about-hero__subtitle">
            Platform informasi terlengkap untuk mendukung Smart City dan Smart Village di Indonesia
          </p>
        </div>
      </section>

      {/* WHY Surade.co.id SECTION */}
      <section className="about-why">
        <div className="about-why__inner">
          <h2 className="about-why__title">Mengapa Surade.co.id?</h2>
          <p className="about-why__subtitle">
            Surade.co.id adalah pilihan tepat untuk kebutuhan informasi dan branding usaha Anda
          </p>

          <div className="about-features">
            {/* Feature 1 */}
            <div className="about-feature-card">
              <div className="about-feature-card__icon">
                <MousePointer2 size={48} />
              </div>
              <h3 className="about-feature-card__title">One Click Service</h3>
              <p className="about-feature-card__text">
                Memudahkan pencarian dan meningkatkan branding usaha Anda dengan jangkauan yang sangat luas hanya dengan satu kali klik. Langsung menemukan informasi dan lokasi yang dicari. Dimana saja, kapan saja kemudahan di tangan Anda.
              </p>
              <button className="about-feature-card__button">
                <Zap size={16} />
                <span>Hanya Satu Kali Klik</span>
              </button>
            </div>

            {/* Feature 2 */}
            <div className="about-feature-card">
              <div className="about-feature-card__icon">
                <Globe size={48} />
              </div>
              <h3 className="about-feature-card__title">Smart City & Village</h3>
              <p className="about-feature-card__text">
                Setiap usaha/kegiatan Anda akan memiliki website secara virtual (dapat menambahkan dan mengedit informasi). Surade.co.id menjadi wadah untuk daerah berkarya dan berdaya saing menuju Smart City dan Smart Village.
              </p>
              <button className="about-feature-card__button">
                <Users size={16} />
                <span>Membangun Smart City</span>
              </button>
            </div>

            {/* Feature 3 */}
            <div className="about-feature-card">
              <div className="about-feature-card__icon">
                <Heart size={48} />
              </div>
              <h3 className="about-feature-card__title">Donasi Sosial</h3>
              <p className="about-feature-card__text">
                Bersama menyisihkan donasi setiap adanya pemasangan info di Surade.co.id sebagai kontribusi kami untuk membangun daerah Smart City dan Smart Village lebih baik. Donasi diarahkan untuk kesehatan, pendidikan, kemiskinan, keagamaan, lingkungan hidup dan sosial lainnya.
              </p>
              <button className="about-feature-card__button">
                <Heart size={16} />
                <span>Kita Berdonasi</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KEY BENEFITS SECTION */}
      <section className="about-benefits">
        <div className="about-benefits__inner">
          <h2 className="about-benefits__title">Keunggulan Kami</h2>
          <div className="about-benefits-grid">
            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <MapPin size={24} />
              </div>
              <h4 className="about-benefit-item__title">Info Terlengkap</h4>
              <p className="about-benefit-item__text">
                Data dan informasi yang komprehensif dari berbagai sektor usaha dan layanan
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Users size={24} />
              </div>
              <h4 className="about-benefit-item__title">Berbagi Event</h4>
              <p className="about-benefit-item__text">
                Update event, aktivitas, dan perkembangan informasi kegiatan pemerintahan, sekolah, komunitas, dan pameran
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Globe size={24} />
              </div>
              <h4 className="about-benefit-item__title">Jangkauan Mudah</h4>
              <p className="about-benefit-item__text">
                Akses informasi detil, kontak person, nomor handphone, dan akses lokasi berbasis peta
              </p>
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
