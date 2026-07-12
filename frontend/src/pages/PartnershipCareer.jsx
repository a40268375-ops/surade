import { Link } from "react-router-dom";
import { useEffect } from "react";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  ChevronDown,
  Plus,
  Handshake,
  Briefcase,
  Users,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import "./PartnershipCareer.css";

export default function PartnershipCareer() {
  const pageLoading = usePageLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="partnership-career-page">
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
      <section className="pc-hero">
        <div className="pc-hero__bg" />
        <div className="pc-hero__overlay" />
        <div className="pc-hero__content">
          <h1 className="pc-hero__title">Kerjasama & Karir</h1>
          <p className="pc-hero__subtitle">
            Bergabung bersama kami untuk membangun masa depan digital Indonesia
          </p>
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section className="pc-section pc-section--partnership">
        <div className="pc-section__inner">
          <div className="pc-section__header">
            <div className="pc-section__icon">
              <Handshake size={48} />
            </div>
            <h2 className="pc-section__title">Kerjasama</h2>
          </div>
          <p className="pc-section__intro">
            Surade.co.id terbuka untuk kerjasamaan dengan berbagai pihak untuk memperluas jangkauan dan memberikan dampak positif bagi masyarakat Indonesia.
          </p>

          <div className="pc-cards">
            <div className="pc-card">
              <div className="pc-card__icon">
                <Globe size={32} />
              </div>
              <h3 className="pc-card__title">Kerjasama Media</h3>
              <p className="pc-card__text">
                Kolaborasi dengan media partner untuk penyebaran informasi yang lebih luas dan efektif.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Users size={32} />
              </div>
              <h3 className="pc-card__title">Kerjasama UMKM</h3>
              <p className="pc-card__text">
                Mendukung pengembangan usaha mikro, kecil, dan menengah melalui platform digital kami.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Target size={32} />
              </div>
              <h3 className="pc-card__title">Kerjasama Pemerintah</h3>
              <p className="pc-card__text">
                Bermitra dengan instansi pemerintah untuk mendukung program Smart City dan Smart Village.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Zap size={32} />
              </div>
              <h3 className="pc-card__title">Kerjasama Teknologi</h3>
              <p className="pc-card__text">
                Kolaborasi dengan perusahaan teknologi untuk inovasi dan pengembangan platform.
              </p>
            </div>
          </div>

          <div className="pc-contact-box">
            <h3 className="pc-contact-box__title">Tertarik Berkerjasama?</h3>
            <p className="pc-contact-box__text">
              Hubungi kami untuk diskusi lebih lanjut mengenai peluang kerjasama.
            </p>
            <div className="pc-contact-box__info">
              <p><Mail size={18} /> <a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></p>
              <p><Phone size={18} /> +62 811 15 20 900</p>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER SECTION */}
      <section className="pc-section pc-section--career">
        <div className="pc-section__inner">
          <div className="pc-section__header">
            <div className="pc-section__icon">
              <Briefcase size={48} />
            </div>
            <h2 className="pc-section__title">Karir</h2>
          </div>
          <p className="pc-section__intro">
            Bergabunglah dengan tim Surade.co.id dan berkontribusi dalam membangun ekosistem digital Indonesia yang lebih baik.
          </p>

          <div className="pc-benefits">
            <h3 className="pc-benefits__title">Kenapa Bergabung dengan Kami?</h3>
            <div className="pc-benefits-grid">
              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Zap size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Lingkungan Dinamis</h4>
                <p className="pc-benefit-item__text">
                  Bekerja di lingkungan yang inovatif dan selalu berkembang dengan teknologi terbaru.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Users size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Tim Solid</h4>
                <p className="pc-benefit-item__text">
                  Bergabung dengan tim profesional yang kolaboratif dan mendukung pertumbuhan satu sama lain.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Target size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Dampak Nyata</h4>
                <p className="pc-benefit-item__text">
                  Berkontribusi langsung dalam membangun Smart City dan Smart Village di Indonesia.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Globe size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Pengembangan Diri</h4>
                <p className="pc-benefit-item__text">
                  Kesempatan belajar dan berkembang melalui training dan program pengembangan karyawan.
                </p>
              </div>
            </div>
          </div>

          <div className="pc-openings">
            <h3 className="pc-openings__title">Posisi Tersedia</h3>
            <div className="pc-openings-list">
              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Frontend Developer</h4>
                  <p className="pc-opening-item__location">Jakarta • Full Time</p>
                </div>
                <button className="pc-opening-item__button">Lamar</button>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Backend Developer</h4>
                  <p className="pc-opening-item__location">Jakarta • Full Time</p>
                </div>
                <button className="pc-opening-item__button">Lamar</button>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">UI/UX Designer</h4>
                  <p className="pc-opening-item__location">Remote • Full Time</p>
                </div>
                <button className="pc-opening-item__button">Lamar</button>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Digital Marketing</h4>
                  <p className="pc-opening-item__location">Jakarta • Full Time</p>
                </div>
                <button className="pc-opening-item__button">Lamar</button>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Content Writer</h4>
                  <p className="pc-opening-item__location">Remote • Part Time</p>
                </div>
                <button className="pc-opening-item__button">Lamar</button>
              </div>
            </div>
          </div>

          <div className="pc-contact-box">
            <h3 className="pc-contact-box__title">Tidak Menemukan Posisi yang Cocok?</h3>
            <p className="pc-contact-box__text">
              Kirimkan CV dan portofolio Anda, kami akan menghubungi jika ada posisi yang sesuai.
            </p>
            <div className="pc-contact-box__info">
              <p><Mail size={18} /> <a href="mailto:hr@Surade.co.id">hr@Surade.co.id</a></p>
              <p><Phone size={18} /> +62 811 15 20 900</p>
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
