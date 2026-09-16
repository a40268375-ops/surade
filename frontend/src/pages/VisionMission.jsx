import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="vision-mission-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="vm-hero">
        <div className="vm-hero__bg" />
        <div className="vm-hero__overlay" />
        <div className="vm-hero__content">
          <h1 className="vm-hero__title">Visi &amp; Misi</h1>
          <p className="vm-hero__subtitle">
            Mendorong kemandirian ekonomi UMKM dan kemajuan digital di 12 Desa Kecamatan Surade
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
            Menjadi portal digital terdepan di Kecamatan Surade yang menghubungkan masyarakat, wisatawan, dan pelaku usaha lokal di 12 desa/kelurahan, serta mendorong kemandirian ekonomi daerah melalui integrasi teknologi informasi yang mudah, inklusif, dan berkelanjutan.
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
                <h4 className="vm-mission-item__title">Integrasi 12 Desa</h4>
                <p className="vm-mission-item__text">
                  Menyediakan direktori dan akses informasi terpadu untuk seluruh desa dan kelurahan di Kecamatan Surade tanpa terkecuali.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Users size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Pemberdayaan UMKM Lokal</h4>
                <p className="vm-mission-item__text">
                  Mendampingi pedagang, pengrajin, dan pelaku jasa lokal agar memiliki profil bisnis digital, katalog produk, dan akses pasar yang lebih luas.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Zap size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Kemudahan Akses Digital</h4>
                <p className="vm-mission-item__text">
                  Mengembangkan platform yang cepat, ringan, dan ramah pengguna smartphone (One Click Service) untuk seluruh lapisan masyarakat.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Heart size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Dampak Sosial &amp; Komunitas</h4>
                <p className="vm-mission-item__text">
                  Membangun kepedulian sosial yang saling menguatkan antarwarga Surade melalui dukungan kegiatan kemasyarakatan dan kepedulian sosial.
                </p>
              </div>
            </div>

            <div className="vm-mission-item">
              <div className="vm-mission-item__icon">
                <Award size={24} />
              </div>
              <div className="vm-mission-item__content">
                <h4 className="vm-mission-item__title">Informasi Valid &amp; Terpercaya</h4>
                <p className="vm-mission-item__text">
                  Menyajikan data usaha, lokasi, dan kontak yang terverifikasi demi keamanan bertransaksi warga dan para pengunjung.
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
      <Footer />
    </div>
  );
}
