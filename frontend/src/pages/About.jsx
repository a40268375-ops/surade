import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import {
  MousePointer2,
  Globe,
  Users,
  MapPin,
  Zap,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass
} from "lucide-react";
import "./About.css";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Tentang Kami - Surade.com";
  }, []);

  return (
    <div className="about-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH REAL COASTAL BACKGROUND & WAVE DIVIDER */}
      <section className="about-hero">
        <div 
          className="about-hero__bg" 
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="about-hero__overlay" />
        <div className="about-hero__glow" />

        <div className="about-hero__content">
          <div className="about-hero__badge">
            <Sparkles size={14} className="about-hero__badge-icon" />
            <span>Direktori Resmi Kecamatan Surade</span>
          </div>

          <div className="about-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Tentang Kami</span>
          </div>

          <h1 className="about-hero__title">
            Tentang <span>Surade.com</span>
          </h1>

          <p className="about-hero__subtitle">
            Portal Digital Resmi &amp; Direktori UMKM Terpadu Kecamatan Surade, Kabupaten Sukabumi
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER (GELOMBANG) */}
        <div className="about-hero__wave">
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
      </section>

      {/* WHY SURADE.COM SECTION */}
      <section className="about-why">
        <div className="about-why__inner">
          <div className="about-section-header">
            <div className="about-section-tag">
              <Compass size={16} />
              <span>KONTRIBUSI NYATA</span>
            </div>
            <h2 className="about-why__title">Mengapa Surade.com?</h2>
            <p className="about-why__subtitle">
              Surade.com hadir sebagai wadah digital resmi yang menghubungkan pelaku UMKM lokal dengan masyarakat di 12 desa dan kelurahan se-Kecamatan Surade
            </p>
          </div>

          <div className="about-features">
            {/* Feature 1: One Click Service */}
            <div className="about-feature-card">
              <div className="about-feature-card__top">
                <div className="about-feature-card__icon">
                  <MousePointer2 size={32} />
                </div>
                <h3 className="about-feature-card__title">One Click Service</h3>
                <p className="about-feature-card__text">
                  Memudahkan masyarakat menemukan kontak pelaku UMKM dan jasa di Surade hanya dengan satu kali klik. Langsung terhubung via WhatsApp dan navigasi peta lokasi.
                </p>
              </div>
              <Link to="/directory" className="about-feature-card__button">
                <Zap size={16} />
                <span>Hanya Satu Kali Klik</span>
              </Link>
            </div>

            {/* Feature 2: Digitalisasi Desa & UMKM */}
            <div className="about-feature-card">
              <div className="about-feature-card__top">
                <div className="about-feature-card__icon">
                  <Globe size={32} />
                </div>
                <h3 className="about-feature-card__title">Digitalisasi Desa &amp; UMKM</h3>
                <p className="about-feature-card__text">
                  Setiap pelaku UMKM dan jasa memiliki etalase profile yang interaktif, katalog produk, jam operasional, dan lain-lainnya. Surade.com berkontribusi membangun pertumbuhan ekonomi UMKM Surade di era digital.
                </p>
              </div>
              <Link to="/smart-city" className="about-feature-card__button">
                <Users size={16} />
                <span>Membangun Surade Digital</span>
              </Link>
            </div>

            {/* Feature 3: Dukungan Pelaku UMKM (Replaced from Image 1) */}
            <div className="about-feature-card">
              <div className="about-feature-card__top">
                <div className="about-feature-card__icon">
                  <Users size={32} />
                </div>
                <h3 className="about-feature-card__title">Dukungan Pelaku UMKM</h3>
                <p className="about-feature-card__text">
                  Membantu terhubung langsung dengan para pelaku usaha dan UMKM hingga skala terkecil di Surade. Memberikan wadah promosi yang mudah dan terjangkau agar usaha mikro dapat semakin berkembang serta menjangkau pelanggan baru.
                </p>
              </div>
              <Link to="/register" className="about-feature-card__button">
                <Users size={16} />
                <span>Terhubung dengan UMKM</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KEY BENEFITS SECTION */}
      <section className="about-benefits">
        <div className="about-benefits__inner">
          <div className="about-section-header">
            <div className="about-section-tag">
              <ShieldCheck size={16} />
              <span>NILAI UTAMA KAMI</span>
            </div>
            <h2 className="about-benefits__title">Keunggulan Kami</h2>
          </div>

          <div className="about-benefits-grid">
            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <MapPin size={26} />
              </div>
              <h4 className="about-benefit-item__title">Info Direktori Terlengkap</h4>
              <p className="about-benefit-item__text">
                Data terlengkap UMKM di daerah Surade mulai dari UMKM dan jasa hingga skala terkecil
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Calendar size={26} />
              </div>
              <h4 className="about-benefit-item__title">Info Event &amp; Komunitas</h4>
              <p className="about-benefit-item__text">
                Update agenda event desa, bazar UMKM, festival budaya, dan kegiatan sosial warga se-Kecamatan Surade
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Globe size={26} />
              </div>
              <h4 className="about-benefit-item__title">Akses Cepat &amp; Mudah</h4>
              <p className="about-benefit-item__text">
                Informasi detail nomor WhatsApp resmi, alamat lengkap, dan panduan rute Google Maps langsung di smartphone Anda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}