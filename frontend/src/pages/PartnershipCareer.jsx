import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import {
  Handshake,
  Briefcase,
  Users,
  Target,
  Zap,
  Globe,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  Compass,
  CheckCircle2,
  Send
} from "lucide-react";
import "./PartnershipCareer.css";

// Official WhatsApp Logo SVG Component
function WhatsAppLogo({ size = 20, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function PartnershipCareer() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Kemitraan & Karir - Surade.com";
  }, []);

  return (
    <div className="partnership-career-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH COASTAL BACKGROUND & WAVE DIVIDER */}
      <section className="pc-hero">
        <div
          className="pc-hero__bg"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="pc-hero__overlay" />
        <div className="pc-hero__glow" />

        <div className="pc-hero__content">
          <div className="pc-hero__badge">
            <Sparkles size={14} className="pc-hero__badge-icon" />
            <span>Kolaborasi &amp; Peluang Karir</span>
          </div>

          <div className="pc-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Kerjasama &amp; Karir</span>
          </div>

          <h1 className="pc-hero__title">
            Kerjasama &amp; <span>Karir</span>
          </h1>

          <p className="pc-hero__subtitle">
            Bergabung bersama Surade.com untuk memajukan potensi UMKM dan ekosistem digital 12 desa di Kecamatan Surade
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER (GELOMBANG) */}
        <div className="pc-hero__wave">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section className="pc-section pc-section--partnership">
        <div className="pc-container">
          <div className="pc-section__header-block">
            <div className="pc-section-tag">
              <Handshake size={16} />
              <span>KOLABORASI STRATEGIS</span>
            </div>
            <h2 className="pc-section__title">Kemitraan &amp; Kerjasama</h2>
            <p className="pc-section__subtitle">
              Peluang kolaborasi terbuka bersama portal digital resmi Surade.com
            </p>
            <p className="pc-section__intro">
              Surade.com terbuka untuk kerjasama dengan berbagai pihak — asosiasi UMKM, media, pelaku industri kreatif, dan instansi pemerintah — guna memperluas jangkauan promosi serta memberikan dampak ekonomi nyata bagi masyarakat di Surade.
            </p>
          </div>

          <div className="pc-cards">
            {/* Card 1 */}
            <div className="pc-card">
              <div className="pc-card__icon">
                <Globe size={28} />
              </div>
              <h3 className="pc-card__title">Kerjasama Media</h3>
              <p className="pc-card__text">
                Kolaborasi publikasi informasi, peliputan event lokal, press release, dan penyebaran berita kegiatan UMKM se-Kecamatan Surade.
              </p>
            </div>

            {/* Card 2 */}
            <div className="pc-card">
              <div className="pc-card__icon">
                <Users size={28} />
              </div>
              <h3 className="pc-card__title">Kerjasama UMKM &amp; Komunitas</h3>
              <p className="pc-card__text">
                Pendampingan digitalisasi produk lokal, promosi terintegrasi, serta pembuatan etalase profil usaha bagi pengrajin, kuliner, dan petani.
              </p>
            </div>

            {/* Card 3 */}
            <div className="pc-card">
              <div className="pc-card__icon">
                <Building2 size={28} />
              </div>
              <h3 className="pc-card__title">Kerjasama Pemerintah &amp; Desa</h3>
              <p className="pc-card__text">
                Bermitra dengan aparatur pemerintah kecamatan dan 12 pemerintah desa dalam mewujudkan smart village dan transparansi potensi lokal.
              </p>
            </div>

            {/* Card 4 */}
            <div className="pc-card">
              <div className="pc-card__icon">
                <Zap size={28} />
              </div>
              <h3 className="pc-card__title">Kerjasama Teknologi &amp; Sponsor</h3>
              <p className="pc-card__text">
                Integrasi teknologi pembayaran, logistik lokal, periklanan digital, dan penempatan banner sponsor promosi pada platform Surade.com.
              </p>
            </div>
          </div>

          {/* Contact Box Modern UI with Official WhatsApp Logo */}
          <div className="pc-contact-box">
            <div className="pc-contact-box__badge">Hubungi Tim Kemitraan</div>
            <h3 className="pc-contact-box__title">Tertarik Berkolaborasi dengan Surade.com?</h3>
            <p className="pc-contact-box__text">
              Tim kemitraan kami siap berdiskusi mengenai peluang sinergi, pemasangan promosi, dan program digitalisasi UMKM.
            </p>
            <div className="pc-contact-box__actions">
              <a
                href="mailto:admin@surade.com"
                className="pc-contact-btn pc-contact-btn--email"
              >
                <Mail size={18} />
                <span>admin@surade.com</span>
              </a>
              <a
                href="https://wa.me/628111919711"
                target="_blank"
                rel="noopener noreferrer"
                className="pc-contact-btn pc-contact-btn--whatsapp"
              >
                <WhatsAppLogo size={20} className="pc-whatsapp-svg" />
                <span>WhatsApp: +62 811-1919-711</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER SECTION */}
      <section className="pc-section pc-section--career">
        <div className="pc-container">
          <div className="pc-section__header-block">
            <div className="pc-section-tag">
              <Briefcase size={16} />
              <span>PELUANG KARIR</span>
            </div>
            <h2 className="pc-section__title">Karir &amp; Talenta</h2>
            <p className="pc-section__subtitle">
              Kembangkan potensi Anda bersama tim pengembang Surade.com
            </p>
            <p className="pc-section__intro">
              Bergabunglah bersama tim Surade.com dan berkontribusi langsung dalam membangun ekosistem teknologi yang memberdayakan masyarakat dan UMKM di Surade.
            </p>
          </div>

          {/* Why Join */}
          <div className="pc-benefits">
            <h3 className="pc-benefits__title">Kenapa Bergabung dengan Kami?</h3>
            <div className="pc-benefits-grid">
              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Zap size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Inovasi Teknologi</h4>
                <p className="pc-benefit-item__text">
                  Bekerja dengan stack modern (React, Laravel, Tailwind) dan solusi direktori digital yang terus berkembang.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Users size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Kultur Kolaboratif</h4>
                <p className="pc-benefit-item__text">
                  Lingkungan kerja yang suportif, saling berbagi pengetahuan, dan memberi ruang luas bagi kreativitas Anda.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Target size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Dampak Sosial Nyata</h4>
                <p className="pc-benefit-item__text">
                  Setiap baris kode dan fitur yang Anda bangun berdampak langsung pada penghasilan pedagang dan UMKM lokal.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Globe size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Fleksibilitas Kerja</h4>
                <p className="pc-benefit-item__text">
                  Dukungan kerja hybrid dan remote yang memberi keseimbangan optimal antara produktivitas dan kenyamanan.
                </p>
              </div>
            </div>
          </div>

          {/* Job Openings */}
          <div className="pc-openings">
            <h3 className="pc-openings__title">Posisi Tersedia</h3>
            <div className="pc-openings-list">
              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Frontend Developer (React / Vite)</h4>
                  <p className="pc-opening-item__location">Surade / Remote • Full Time</p>
                </div>
                <a
                  href="mailto:karir@surade.com?subject=Lamaran%20Frontend%20Developer"
                  className="pc-opening-item__button"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Backend Developer (Laravel &amp; REST API)</h4>
                  <p className="pc-opening-item__location">Surade / Remote • Full Time</p>
                </div>
                <a
                  href="mailto:karir@surade.com?subject=Lamaran%20Backend%20Developer"
                  className="pc-opening-item__button"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">UI/UX Designer</h4>
                  <p className="pc-opening-item__location">Remote • Full Time</p>
                </div>
                <a
                  href="mailto:karir@surade.com?subject=Lamaran%20UI%2FUX%20Designer"
                  className="pc-opening-item__button"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Digital Marketing &amp; Field Community</h4>
                  <p className="pc-opening-item__location">Surade, Sukabumi • Full Time</p>
                </div>
                <a
                  href="mailto:karir@surade.com?subject=Lamaran%20Digital%20Marketing"
                  className="pc-opening-item__button"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={15} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Content Writer &amp; Media Kreatif</h4>
                  <p className="pc-opening-item__location">Remote / Surade • Part Time</p>
                </div>
                <a
                  href="mailto:karir@surade.com?subject=Lamaran%20Content%20Writer"
                  className="pc-opening-item__button"
                >
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* Career Contact Box */}
          <div className="pc-contact-box pc-contact-box--career">
            <div className="pc-contact-box__badge">Kirim Portofolio</div>
            <h3 className="pc-contact-box__title">Tidak Menemukan Posisi yang Cocok?</h3>
            <p className="pc-contact-box__text">
              Kami selalu mencari talenta bersemangat! Kirimkan CV dan portofolio Anda langsung ke tim rekrutmen kami.
            </p>
            <div className="pc-contact-box__actions">
              <a
                href="https://wa.me/628111919711"
                target="_blank"
                rel="noopener noreferrer"
                className="pc-contact-btn pc-contact-btn--whatsapp"
              >
                <WhatsAppLogo size={20} className="pc-whatsapp-svg" />
                <span>Hubungi via WhatsApp: +62 811-1919-711</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}