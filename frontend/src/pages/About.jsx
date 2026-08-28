import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import logoImg from "../assets/logo.png";
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
          <h1 className="about-hero__title">Tentang Info.co.id</h1>
          <p className="about-hero__subtitle">
            Platform informasi terlengkap untuk mendukung Smart City dan Smart Village di Indonesia
          </p>
        </div>
      </section>

      {/* WHY INFO.CO.ID SECTION */}
      <section className="about-why">
        <div className="about-why__inner">
          <h2 className="about-why__title">Mengapa Info.co.id?</h2>
          <p className="about-why__subtitle">
            Info.co.id adalah pilihan tepat untuk kebutuhan informasi dan branding usaha Anda
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
                Setiap usaha/kegiatan Anda akan memiliki website secara virtual (dapat menambahkan dan mengedit informasi). Info.co.id menjadi wadah untuk daerah berkarya dan berdaya saing menuju Smart City dan Smart Village.
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
                Bersama menyisihkan donasi setiap adanya pemasangan info di info.co.id sebagai kontribusi kami untuk membangun daerah Smart City dan Smart Village lebih baik. Donasi diarahkan untuk kesehatan, pendidikan, kemiskinan, keagamaan, lingkungan hidup dan sosial lainnya.
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
      <Footer />
    </div>
  );
}
