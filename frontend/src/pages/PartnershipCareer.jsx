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
  MessageCircle,
  ArrowRight,
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
          <div className="pc-hero__badge">Kolaborasi &amp; Peluang</div>
          <h1 className="pc-hero__title">Kerjasama &amp; Karir</h1>
          <p className="pc-hero__subtitle">
            Bergabung bersama Surade.co.id untuk memajukan potensi UMKM dan ekosistem digital 12 desa di Kecamatan Surade
          </p>
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section className="pc-section pc-section--partnership">
        <div className="pc-section__inner">
          <div className="pc-section__header">
            <div className="pc-section__icon">
              <Handshake size={44} />
            </div>
            <div>
              <h2 className="pc-section__title">Kemitraan &amp; Kerjasama</h2>
              <p className="pc-section__subtitle">Peluang kolaborasi bersama portal resmi Surade.co.id</p>
            </div>
          </div>
          <p className="pc-section__intro">
            Surade.co.id terbuka untuk kerjasama dengan berbagai pihak — asosiasi UMKM, media, pelaku industri kreatif, dan instansi pemerintah — untuk memperluas jangkauan promosi serta memberikan dampak ekonomi nyata bagi masyarakat Kecamatan Surade.
          </p>

          <div className="pc-cards">
            <div className="pc-card">
              <div className="pc-card__icon">
                <Globe size={30} />
              </div>
              <h3 className="pc-card__title">Kerjasama Media</h3>
              <p className="pc-card__text">
                Kolaborasi publikasi informasi, peliputan event lokal, dan penyebaran berita kegiatan UMKM di Kecamatan Surade.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Users size={30} />
              </div>
              <h3 className="pc-card__title">Kerjasama UMKM &amp; Komunitas</h3>
              <p className="pc-card__text">
                Pendampingan digitalisasi produk lokal, promosi terintegrasi, dan katalog usaha bagi pengrajin, kuliner, dan petani lokal.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Target size={30} />
              </div>
              <h3 className="pc-card__title">Kerjasama Pemerintah &amp; Desa</h3>
              <p className="pc-card__text">
                Bermitra dengan aparatur pemerintah kecamatan dan 12 pemerintah desa dalam mewujudkan smart village dan transparansi potensi lokal.
              </p>
            </div>

            <div className="pc-card">
              <div className="pc-card__icon">
                <Zap size={30} />
              </div>
              <h3 className="pc-card__title">Kerjasama Teknologi &amp; Sponsor</h3>
              <p className="pc-card__text">
                Integrasi teknologi pembayaran, logistik lokal, dan penempatan banner sponsor promosi pada platform digital Surade.co.id.
              </p>
            </div>
          </div>

          {/* Contact Box Modern UI */}
          <div className="pc-contact-box">
            <div className="pc-contact-box__badge">Hubungi Kami</div>
            <h3 className="pc-contact-box__title">Tertarik Berkolaborasi dengan Surade.co.id?</h3>
            <p className="pc-contact-box__text">
              Tim kemitraan kami siap berdiskusi mengenai peluang sinergi, periklanan, dan program digitalisasi desa.
            </p>
            <div className="pc-contact-box__actions">
              <a href="mailto:admin@surade.co.id" className="pc-contact-btn pc-contact-btn--email">
                <Mail size={18} />
                <span>admin@surade.co.id</span>
              </a>
              <a href="https://wa.me/628111919711" target="_blank" rel="noopener noreferrer" className="pc-contact-btn pc-contact-btn--whatsapp">
                <MessageCircle size={18} />
                <span>WhatsApp: +62 811-1919-711</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER SECTION */}
      <section className="pc-section pc-section--career">
        <div className="pc-section__inner">
          <div className="pc-section__header">
            <div className="pc-section__icon">
              <Briefcase size={44} />
            </div>
            <div>
              <h2 className="pc-section__title">Karir &amp; Talenta</h2>
              <p className="pc-section__subtitle">Kembangkan potensi Anda bersama tim pengembang Surade.co.id</p>
            </div>
          </div>
          <p className="pc-section__intro">
            Bergabunglah dengan tim Surade.co.id dan berkontribusi langsung dalam membangun ekosistem teknologi yang memberdayakan masyarakat dan UMKM di Surade.
          </p>

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
                  Lingkungan kerja yang suportif, saling berbagi pengetahuan, dan memberi ruang bagi kreativitas Anda.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Target size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Dampak Sosial Nyata</h4>
                <p className="pc-benefit-item__text">
                  Setiap fitur yang Anda bangun berdampak langsung pada penghasilan pedagang dan UMKM di Surade.
                </p>
              </div>

              <div className="pc-benefit-item">
                <div className="pc-benefit-item__icon">
                  <Globe size={24} />
                </div>
                <h4 className="pc-benefit-item__title">Fleksibilitas Kerja</h4>
                <p className="pc-benefit-item__text">
                  Dukungan kerja hybrid dan remote yang memberi keseimbangan antara produktivitas dan kenyamanan.
                </p>
              </div>
            </div>
          </div>

          <div className="pc-openings">
            <h3 className="pc-openings__title">Posisi Tersedia</h3>
            <div className="pc-openings-list">
              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Frontend Developer (React / Vite)</h4>
                  <p className="pc-opening-item__location">Surade / Remote • Full Time</p>
                </div>
                <a href="mailto:karir@surade.co.id?subject=Lamaran%20Frontend%20Developer" className="pc-opening-item__button">
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Backend Developer (Laravel &amp; API)</h4>
                  <p className="pc-opening-item__location">Surade / Remote • Full Time</p>
                </div>
                <a href="mailto:karir@surade.co.id?subject=Lamaran%20Backend%20Developer" className="pc-opening-item__button">
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">UI/UX Designer</h4>
                  <p className="pc-opening-item__location">Remote • Full Time</p>
                </div>
                <a href="mailto:karir@surade.co.id?subject=Lamaran%20UI%2FUX%20Designer" className="pc-opening-item__button">
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Digital Marketing &amp; Field Community</h4>
                  <p className="pc-opening-item__location">Surade, Sukabumi • Full Time</p>
                </div>
                <a href="mailto:karir@surade.co.id?subject=Lamaran%20Digital%20Marketing" className="pc-opening-item__button">
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="pc-opening-item">
                <div className="pc-opening-item__content">
                  <h4 className="pc-opening-item__title">Content Writer &amp; Media Kreatif</h4>
                  <p className="pc-opening-item__location">Remote / Surade • Part Time</p>
                </div>
                <a href="mailto:karir@surade.co.id?subject=Lamaran%20Content%20Writer" className="pc-opening-item__button">
                  <span>Lamar Sekarang</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className="pc-contact-box pc-contact-box--career">
            <div className="pc-contact-box__badge">Kirim Portofolio</div>
            <h3 className="pc-contact-box__title">Tidak Menemukan Posisi yang Cocok?</h3>
            <p className="pc-contact-box__text">
              Kami selalu mencari talenta bersemangat! Kirimkan CV dan ringkasan portofolio Anda ke tim rekrutmen kami.
            </p>
            <div className="pc-contact-box__actions">
              <a href="mailto:karir@surade.co.id" className="pc-contact-btn pc-contact-btn--email">
                <Mail size={18} />
                <span>karir@surade.co.id</span>
              </a>
              <a href="https://wa.me/628111919711" target="_blank" rel="noopener noreferrer" className="pc-contact-btn pc-contact-btn--whatsapp">
                <MessageCircle size={18} />
                <span>WhatsApp: +62 811-1919-711</span>
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