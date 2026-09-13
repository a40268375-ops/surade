import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="partnership-career-page">
      {/* NAVBAR */}
      <Navbar />

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
              <p><Mail size={18} /> <a href="mailto:admin@info.co.id">admin@info.co.id</a></p>
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
              <p><Mail size={18} /> <a href="mailto:hr@info.co.id">hr@info.co.id</a></p>
              <p><Phone size={18} /> +62 811 15 20 900</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}