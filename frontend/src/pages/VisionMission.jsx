import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import {
  Target,
  Eye,
  ShieldCheck,
  Users,
  Globe,
  Zap,
  Sparkles,
  Compass,
  CheckCircle2,
  Lock,
  HeartHandshake
} from "lucide-react";
import "./VisionMission.css";

export default function VisionMission() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Visi & Misi - Surade.com";
  }, []);

  return (
    <div className="vision-mission-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH COASTAL BACKGROUND & WAVE DIVIDER */}
      <section className="vm-hero">
        <div 
          className="vm-hero__bg"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="vm-hero__overlay" />
        <div className="vm-hero__glow" />

        <div className="vm-hero__content">
          <div className="vm-hero__badge">
            <Sparkles size={14} className="vm-hero__badge-icon" />
            <span>Arah &amp; Komitmen Surade.com</span>
          </div>

          <div className="vm-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Visi &amp; Misi</span>
          </div>

          <h1 className="vm-hero__title">
            Visi &amp; <span>Misi</span>
          </h1>

          <p className="vm-hero__subtitle">
            Mendorong kemandirian ekonomi UMKM dan kemajuan digital di 12 Desa &amp; Kelurahan Kecamatan Surade
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER (GELOMBANG) */}
        <div className="vm-hero__wave">
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

      {/* VISION SECTION */}
      <section className="vm-section vm-section--vision">
        <div className="vm-container">
          <div className="vm-vision-card">
            <div className="vm-section-tag">
              <Eye size={16} />
              <span>PANDANGAN KE DEPAN</span>
            </div>

            <div className="vm-vision-icon">
              <Eye size={40} />
            </div>

            <h2 className="vm-vision-title">Visi Kami</h2>

            <div className="vm-vision-quote">
              <p className="vm-vision-text">
                &ldquo;Menjadi portal UMKM yang menghubungkan pelaku UMKM dan jasa di 12 desa/kelurahan.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="vm-section vm-section--mission">
        <div className="vm-container">
          <div className="vm-section-header">
            <div className="vm-section-tag">
              <Target size={16} />
              <span>LANGKAH STRATEGIS</span>
            </div>
            <h2 className="vm-section__title">Misi Kami</h2>
            <p className="vm-section__subtitle">
              Dedikasi dan aksi nyata Surade.com dalam mendukung kemajuan pelaku UMKM dan kemudahan masyarakat
            </p>
          </div>

          <div className="vm-mission-grid">
            {/* Mission Item 1 */}
            <div className="vm-mission-card">
              <div className="vm-mission-card__header">
                <div className="vm-mission-card__icon">
                  <Globe size={26} />
                </div>
                <div className="vm-mission-card__num">01</div>
              </div>
              <h4 className="vm-mission-card__title">Terhubung dengan 12 Desa/Kelurahan di Surade</h4>
              <p className="vm-mission-card__text">
                Menyediakan wadah UMKM dan jasa, serta akses direktori informasi terpadu untuk seluruh desa dan kelurahan di Surade.
              </p>
            </div>

            {/* Mission Item 2 */}
            <div className="vm-mission-card">
              <div className="vm-mission-card__header">
                <div className="vm-mission-card__icon">
                  <Users size={26} />
                </div>
                <div className="vm-mission-card__num">02</div>
              </div>
              <h4 className="vm-mission-card__title">Pemberdayaan UMKM Lokal</h4>
              <p className="vm-mission-card__text">
                Mendampingi pelaku UMKM dan jasa lokal agar memiliki profil bisnis digital yang interaktif, etalase katalog produk, dan akses pasar yang lebih luas.
              </p>
            </div>

            {/* Mission Item 3 */}
            <div className="vm-mission-card">
              <div className="vm-mission-card__header">
                <div className="vm-mission-card__icon">
                  <Zap size={26} />
                </div>
                <div className="vm-mission-card__num">03</div>
              </div>
              <h4 className="vm-mission-card__title">Kemudahan Akses Digital</h4>
              <p className="vm-mission-card__text">
                Mengembangkan platform yang cepat, ringan, dan ramah pengguna smartphone (One Click Service) untuk seluruh lapisan masyarakat.
              </p>
            </div>

            {/* Mission Item 4 */}
            <div className="vm-mission-card">
              <div className="vm-mission-card__header">
                <div className="vm-mission-card__icon">
                  <ShieldCheck size={26} />
                </div>
                <div className="vm-mission-card__num">04</div>
              </div>
              <h4 className="vm-mission-card__title">Informasi Valid &amp; Terverifikasi</h4>
              <p className="vm-mission-card__text">
                Menyajikan informasi pelaku UMKM, lokasi, dan kontak yang terhubung langsung dengan UMKM, serta terverifikasi demi keamanan transaksi pengguna Surade.com.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="vm-values">
        <div className="vm-container">
          <div className="vm-section-header">
            <div className="vm-section-tag">
              <Compass size={16} />
              <span>PRINSIP KERJA</span>
            </div>
            <h2 className="vm-values__title">Nilai-Nilai Kami</h2>
            <p className="vm-section__subtitle">
              Prinsip dan integritas yang memandu setiap langkah kami dalam melayani masyarakat Surade
            </p>
          </div>

          <div className="vm-values-grid">
            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Users size={28} />
              </div>
              <h4 className="vm-value-card__title">Kolaborasi</h4>
              <p className="vm-value-card__text">
                Bekerja sama erat dengan para pelaku UMKM, pemerintah desa, dan masyarakat demi kemajuan bersama
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Zap size={28} />
              </div>
              <h4 className="vm-value-card__title">Inovasi</h4>
              <p className="vm-value-card__text">
                Terus menghadirkan teknologi dan kemudahan fitur digital yang relevan dan praktis digunakan
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Lock size={28} />
              </div>
              <h4 className="vm-value-card__title">Integritas</h4>
              <p className="vm-value-card__text">
                Menjunjung tinggi keaslian data, kejujuran, serta keamanan dalam setiap transaksi dan informasi
              </p>
            </div>

            <div className="vm-value-card">
              <div className="vm-value-card__icon">
                <Globe size={28} />
              </div>
              <h4 className="vm-value-card__title">Inklusif</h4>
              <p className="vm-value-card__text">
                Melayani seluruh pelaku usaha dari skala mikro terkecil hingga menengah di seluruh desa tanpa terkecuali
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
