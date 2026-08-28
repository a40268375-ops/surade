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
      <Footer />
    </div>
  );
}
