import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logoImg from "../assets/logo-surade.png";
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            Portal Digital Resmi &amp; Direktori UMKM Terpadu Kecamatan Surade, Kabupaten Sukabumi
          </p>
        </div>
      </section>

      {/* WHY SURADE.CO.ID SECTION */}
      <section className="about-why">
        <div className="about-why__inner">
          <h2 className="about-why__title">Mengapa Surade.co.id?</h2>
          <p className="about-why__subtitle">
            Surade.co.id hadir sebagai wadah digital resmi yang menghubungkan pelaku UMKM lokal dengan masyarakat di 12 desa dan kelurahan se-Kecamatan Surade
          </p>

          <div className="about-features">
            {/* Feature 1 */}
            <div className="about-feature-card">
              <div className="about-feature-card__icon">
                <MousePointer2 size={48} />
              </div>
              <h3 className="about-feature-card__title">One Click Service</h3>
              <p className="about-feature-card__text">
                Memudahkan masyarakat menemukan kontak pedagang, bengkel, kuliner, dan aneka jasa di Surade hanya dengan satu kali klik. Langsung terhubung via WhatsApp dan navigasi peta lokasi.
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
              <h3 className="about-feature-card__title">Digitalisasi Desa &amp; UMKM</h3>
              <p className="about-feature-card__text">
                Setiap usaha lokal memiliki etalase profil virtual interaktif lengkap dengan katalog produk, jam operasional, dan ulasan. Surade.co.id mendorong kemandirian ekonomi desa di era digital.
              </p>
              <button className="about-feature-card__button">
                <Users size={16} />
                <span>Membangun Surade Digital</span>
              </button>
            </div>

            {/* Feature 3 */}
            <div className="about-feature-card">
              <div className="about-feature-card__icon">
                <Heart size={48} />
              </div>
              <h3 className="about-feature-card__title">Dukungan Sosial &amp; Komunitas</h3>
              <p className="about-feature-card__text">
                Bersama menyisihkan kontribusi dari setiap pemasangan promosi di Surade.co.id untuk mendukung program sosial, kemajuan UMKM, pendidikan, dan kegiatan kemasyarakatan di Kecamatan Surade.
              </p>
              <button className="about-feature-card__button">
                <Heart size={16} />
                <span>Peduli Komunitas</span>
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
              <h4 className="about-benefit-item__title">Info Direktori Terlengkap</h4>
              <p className="about-benefit-item__text">
                Data komprehensif mulai dari warung kuliner, kerajinan, agribisnis, jasa, hingga destinasi wisata di Surade
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Users size={24} />
              </div>
              <h4 className="about-benefit-item__title">Info Event &amp; Komunitas</h4>
              <p className="about-benefit-item__text">
                Update agenda event desa, bazar UMKM, festival budaya, dan kegiatan sosial warga se-Kecamatan Surade
              </p>
            </div>

            <div className="about-benefit-item">
              <div className="about-benefit-item__icon">
                <Globe size={24} />
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