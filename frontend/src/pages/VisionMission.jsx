import { Link } from "react-router-dom";
import { useEffect } from "react";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  ChevronDown,
  Plus,
  Target,
  Eye,
  Award,
  Users,
  Globe,
  Zap,
  Heart,
} from "lucide-react";
import "./VisionMission.css";

export default function VisionMission() {
  const pageLoading = usePageLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="vision-mission-page">
      {/* NAVBAR */}
      <header className="home-header">
        <div className="home-header__inner">
          <Link to="/" className="home-logo">
            <img src={logoImg} alt="Surade.co.id" className="home-logo__img" />
          </Link>
          <nav className="home-nav">
            <Link to="/" className="home-nav__link">Home</Link>
            <a href="#" className="home-nav__link home-nav__link--dropdown">
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </a>
            <Link to="/blog" className="home-nav__link">Blog</Link>
            <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
            <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
            <button type="button" className="home-nav__button">
              <Plus size={15} /><span>Add Bisnis</span>
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="vm-hero">
        <div className="vm-hero__bg" />
        <div className="vm-hero__overlay" />
        <div className="vm-hero__content">
          <h1 className="vm-hero__title">Visi & Misi</h1>
          <p className="vm-hero__subtitle">
            Membangun masa depan digital Indonesia yang lebih baik
          </p>
        </div>
      </section>

      {/* VISION SECTION */}
      <section className="vm-section vm-section--vision">
        <div className="vm-section__inner">
          <div className="vm-section__icon">
            <Eye size={64} />
          </div>
          <h2 className="vm-section__title">Visi Kami</h2>
          <p className="vm-section__text">
            Menjadi platform informasi digital terdepan di Indonesia yang menghubungkan masyarakat dengan berbagai layanan dan usaha, serta mendukung terwujudnya Smart City dan Smart Village di seluruh Indonesia melalui inovasi teknologi dan kolaborasi yang berkelanjutan.
          </p>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="vm-section vm-section--mission">
        <div className="vm-section__inner">
          <div className="vm-section__icon">
            <Target size={64} />
          </div>
          <h2 className="vm-section__title">Misi Kami</h2>
          <div className="vm-mission-list">
            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Globe size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Jangkauan Luas</h4>
                <p className="vm-mission-item__text">
                  Menyediakan akses informasi yang komprehensif dan mudah diakses bagi seluruh masyarakat Indonesia, dari perkotaan hingga pedesaan.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Users size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Pemberdayaan UMKM</h4>
                <p className="vm-mission-item__text">
                  Mendukung pengembangan usaha mikro, kecil, dan menengah melalui platform digital yang terjangkau dan efektif.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Zap size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Inovasi Teknologi</h4>
                <p className="vm-mission-item__text">
                  Terus berinovasi dalam pengembangan teknologi untuk memberikan pengalaman pengguna yang terbaik dan relevan dengan kebutuhan zaman.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Heart size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Kontribusi Sosial</h4>
                <p className="vm-mission-item__text">
                  Berkontribusi dalam pembangunan sosial melalui program donasi yang mendukung pendidikan, kesehatan, dan lingkungan.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Award size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Kualitas Terpercaya</h4>
                <p className="vm-mission-item__text">
                  Menyajikan informasi yang akurat, terpercaya, dan berkualitas dari berbagai sumber resmi di seluruh Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="vm-values">
        <div className="vm-values__inner">
          <h2 className="vm-values__title">Nilai-Nilai Kami</h2>
          <div className="vm-values-grid">
            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Users size={32} />
              </div>
              <h4 className="vm-value-card__title">Kolaborasi</h4>
              <p className="vm-value-card__text">
                Bekerja sama dengan berbagai pihak untuk mencapai tujuan bersama
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Zap size={32} />
              </div>
              <h4 className="vm-value-card__title">Inovasi</h4>
              <p className="vm-value-card__text">
                Selalu mencari cara baru dan lebih baik untuk melayani pengguna
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Heart size={32} />
              </div>
              <h4 className="vm-value-card__title">Integritas</h4>
              <p className="vm-value-card__text">
                Menjunjung tinggi kejujuran dan transparansi dalam setiap aspek
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Globe size={32} />
              </div>
              <h4 className="vm-value-card__title">Inklusif</h4>
              <p className="vm-value-card__text">
                Melayani semua lapisan masyarakat tanpa diskriminasi
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
          </div>
        </div>
      </footer>
    </div>
  );
}
