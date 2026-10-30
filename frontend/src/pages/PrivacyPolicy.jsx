import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import {
  ShieldCheck,
  Lock,
  Eye,
  Cookie,
  FileText,
  UserCheck,
  Sparkles,
  ChevronRight,
  Printer,
  Share2,
  ArrowUp,
  CheckCircle2,
  Mail,
  Check,
  Copy,
  PhoneCall,
} from "lucide-react";
import "./PrivacyPolicy.css";

const tocItems = [
  { id: "pendahuluan", label: "1. Pendahuluan", icon: ShieldCheck },
  { id: "pengumpulan", label: "2. Pengumpulan Data", icon: FileText },
  { id: "enkripsi", label: "3. Enkripsi & Keamanan", icon: Lock },
  { id: "cookie", label: "4. Aturan Sesi & Cookie", icon: Cookie },
  { id: "penggunaan", label: "5. Penggunaan Informasi", icon: Eye },
  { id: "hak-pengguna", label: "6. Hak Pengguna", icon: UserCheck },
  { id: "kontak", label: "7. Kontak Tim Privasi", icon: Mail },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("pendahuluan");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const isClickingRef = useRef(false);
  const sidebarNavRef = useRef(null);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  useEffect(() => {
    document.title = "Kebijakan Privasi - Surade.com";
    window.scrollTo(0, 0);
  }, []);

  // Auto-scroll active item into view inside sidebar container
  useEffect(() => {
    if (sidebarNavRef.current) {
      const activeEl = sidebarNavRef.current.querySelector(".privacy-sidebar__link--active");
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [activeSection]);

  // Scroll Progress & Accurate ScrollSpy Detector
  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      if (isClickingRef.current) return;

      // Scroll Spy for TOC active state
      const headerOffset = 140;
      const scrollPosition = window.scrollY + headerOffset;

      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    setActiveSection(id);
    isClickingRef.current = true;

    const targetY = el.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: targetY, behavior: "smooth" });

    window.history.replaceState(null, "", `#${id}`);

    setTimeout(() => {
      isClickingRef.current = false;
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: "Kebijakan Privasi - Surade.com",
      text: "Kebijakan Privasi dan Keamanan Data Surade.com",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // User cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Tautan Kebijakan Privasi telah disalin!");
      } catch (e) {}
    }
  };

  return (
    <div className="privacy-page">
      <Navbar forceSolid={false} />

      {/* Reading Progress Bar Sticky Header */}
      <div className="privacy-progress-bar-container">
        <div
          className="privacy-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="privacy-main">
        {/* ═════════ HERO BANNER ═════════ */}
        <section className="privacy-hero">
          <div
            className="privacy-hero__bg"
            style={{ backgroundImage: `url(${coastBg})` }}
          />
          <div className="privacy-hero__overlay" />
          <div className="privacy-hero__glow" />

          <div className="privacy-hero__inner">
            <div className="privacy-hero__badge">
              <ShieldCheck size={14} className="privacy-hero__badge-icon" />
              <span>Privasi &amp; Perlindungan Data</span>
            </div>

            <div className="privacy-hero__breadcrumb">
              <Link to="/">Beranda</Link>
              <span className="separator">/</span>
              <span>Kebijakan Privasi</span>
            </div>

            <h1 className="privacy-hero__title">
              Kebijakan <span>Privasi</span>
            </h1>

            <p className="privacy-hero__subtitle">
              Komitmen penuh <strong>Surade.com</strong> dalam menjaga kerahasiaan data pribadi, keamanan akun, enkripsi kata sandi, serta perlindungan informasi pengguna.
            </p>

            <div className="privacy-hero__meta-actions">
              <div className="privacy-hero__meta-left">
                <span className="privacy-meta-tag">
                  <Sparkles size={14} /> Terakhir Diperbarui: 19 September 2026
                </span>
              </div>

              <div className="privacy-hero__actions">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="privacy-action-btn"
                  title="Cetak atau Simpan PDF"
                >
                  <Printer size={15} /> Cetak
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="privacy-action-btn"
                  title="Bagikan Halaman Ini"
                >
                  <Share2 size={15} /> Bagikan
                </button>
              </div>
            </div>
          </div>

          {/* ORGANIC WAVE DIVIDER */}
          <div className="privacy-hero__wave">
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

        {/* ═════════ BODY SECTION ═════════ */}
        <section className="privacy-body">
          <div className="privacy-container">

            {/* Sidebar Navigation Desktop & Horizontal Mobile Scroll Chips */}
            <aside className="privacy-sidebar">
              <div className="privacy-sidebar__card">
                <div className="privacy-sidebar__header">
                  <h3 className="privacy-sidebar__title">Daftar Isi Privasi</h3>
                  <span className="privacy-sidebar__count">{tocItems.length} Topik</span>
                </div>
                <nav className="privacy-sidebar__nav" ref={sidebarNavRef}>
                  {tocItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => scrollToSection(e, item.id)}
                        className={`privacy-sidebar__link ${isActive ? "privacy-sidebar__link--active" : ""}`}
                      >
                        <div className="privacy-sidebar__link-icon">
                          <Icon size={16} />
                        </div>
                        <span className="privacy-sidebar__link-text">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="privacy-sidebar__chevron" />}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Article Content */}
            <article className="privacy-article">

              {/* 1. Pendahuluan */}
              <section id="pendahuluan" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">01</div>
                  <h2>Pendahuluan</h2>
                </div>
                <p>
                  Di <strong>Surade.com</strong>, kami menempatkan privasi dan perlindungan data pribadi pengguna sebagai prioritas tertinggi. Kebijakan Privasi ini menerangkan tata cara kami dalam mengumpulkan, mengelola, menyimpan, serta melindungi informasi pribadi Anda secara aman saat mengakses layanan direktori UMKM dan portal informasi publik Kecamatan Surade.
                </p>
                <p>
                  Dengan mendaftar, mengakses, atau menggunakan platform kami, Anda menyatakan menyetujui praktik pengelolaan data yang tercantum dalam dokumen ini.
                </p>
              </section>

              {/* 2. Pengumpulan Data */}
              <section id="pengumpulan" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">02</div>
                  <h2>Pengumpulan Data</h2>
                </div>
                <p>
                  Kami hanya mengumpulkan data yang diperlukan untuk mendukung fungsi operasional akun dan keberadaan bisnis Anda di direktori publik:
                </p>
                <div className="privacy-grid">
                  <div className="privacy-grid__item">
                    <div className="privacy-icon-box"><Eye size={20} /></div>
                    <h4>Informasi Akun Pengguna</h4>
                    <p>Nama depan &amp; belakang, alamat email aktif untuk verifikasi OTP, jenis kelamin, dan foto profil.</p>
                  </div>
                  <div className="privacy-grid__item">
                    <div className="privacy-icon-box"><FileText size={20} /></div>
                    <h4>Informasi Usaha / UMKM</h4>
                    <p>Nama bisnis, deskripsi layanan, kategori usaha, nomor kontak publik, dan alamat desa usaha.</p>
                  </div>
                </div>
              </section>

              {/* 3. Enkripsi & Keamanan */}
              <section id="enkripsi" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">03</div>
                  <h2>Enkripsi Kata Sandi &amp; Keamanan</h2>
                </div>
                <div className="privacy-callout privacy-callout--green">
                  <Lock size={24} className="privacy-callout__icon" />
                  <div>
                    <h4>Algoritma Kriptografi Bcrypt Modern</h4>
                    <p>
                      Seluruh kata sandi pengguna <strong>dienkripsi secara otomatis menggunakan algoritma hashing Bcrypt</strong> yang kuat. Kata sandi Anda tidak pernah disimpan dalam bentuk teks biasa (plain text), sehingga tidak dapat dibaca oleh siapapun termasuk tim internal kami.
                    </p>
                  </div>
                </div>
                <ul className="privacy-list">
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Autentikasi dua langkah menggunakan kode OTP 6 digit yang berbatas waktu.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Lalu lintas data terlindungi enkripsi HTTPS SSL/TLS 256-bit standar industri.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Proteksi anti bot otomatis dan verifikasi CAPTCHA visual canvas &amp; matematika.</span>
                  </li>
                </ul>
              </section>

              {/* 4. Aturan Sesi & Cookie */}
              <section id="cookie" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">04</div>
                  <h2>Aturan Sesi &amp; Cookie</h2>
                </div>
                <div className="privacy-callout privacy-callout--blue">
                  <Cookie size={24} className="privacy-callout__icon" />
                  <div>
                    <h4>Session Guard &amp; Bebas Flicker Login</h4>
                    <p>
                      Pengguna yang sudah memiliki sesi aktif akan dikenali oleh sistem secara otomatis (<em>Session Guard</em>), sehingga langsung masuk ke Dashboard tanpa pengulangan form login.
                    </p>
                  </div>
                </div>
                <p>
                  Cookie esensial digunakan hanya untuk mempertahankan status autentikasi yang aman dan kenyamanan navigasi Anda di platform.
                </p>
              </section>

              {/* 5. Penggunaan Informasi */}
              <section id="penggunaan" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">05</div>
                  <h2>Penggunaan Informasi</h2>
                </div>
                <p>Informasi yang kami kumpulkan dimanfaatkan terbatas untuk:</p>
                <ul className="privacy-list">
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Menampilkan profil usaha Anda di portal direktori UMKM Surade.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Mengirimkan kode OTP verifikasi pendaftaran &amp; tautan reset password.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-list__icon" />
                    <span>Kami <strong>tidak pernah menjual atau membagikan data pribadi Anda</strong> ke pihak ketiga tanpa izin.</span>
                  </li>
                </ul>
              </section>

              {/* 6. Hak Pengguna */}
              <section id="hak-pengguna" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">06</div>
                  <h2>Hak Pengguna</h2>
                </div>
                <p>
                  Anda memiliki hak penuh untuk memperbarui data profil Anda kapan saja, mengganti password, atau mengajukan permohonan penutupan akun &amp; penghapusan data permanen melalui tim dukungan pelanggan kami.
                </p>
                <div className="privacy-rights-card">
                  <div className="privacy-rights-card__icon">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h4>Pembaruan &amp; Penghapusan Data</h4>
                    <p>
                      Jika Anda ingin menghapus seluruh data usaha atau menutup akun pengguna, tim support kami akan memproses permohonan Anda dalam 1x24 jam kerja.
                    </p>
                  </div>
                </div>
              </section>

              {/* 7. Kontak Tim Privasi */}
              <section id="kontak" className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__num">07</div>
                  <h2>Kontak Tim Privasi</h2>
                </div>
                <p>
                  Apabila Anda memiliki pertanyaan, kendala privasi, atau laporan keamanan data, silakan hubungi tim kami melalui kontak di bawah ini:
                </p>
                <div className="privacy-contact-box">
                  <div className="privacy-contact-item">
                    <Mail size={20} className="privacy-contact-icon" />
                    <div className="privacy-contact-info">
                      <strong>Email Tim Privasi:</strong>
                      <span className="privacy-contact-val">privacy@surade.com</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail("privacy@surade.com")}
                      className="privacy-copy-btn"
                      title="Salin Email"
                    >
                      {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                      {copiedEmail ? "Tersalin" : "Salin"}
                    </button>
                  </div>

                  <div className="privacy-contact-item">
                    <PhoneCall size={20} className="privacy-contact-icon" />
                    <div className="privacy-contact-info">
                      <strong>WhatsApp Support:</strong>
                      <span className="privacy-contact-val">+62 811-1919-711</span>
                    </div>
                    <a
                      href="https://wa.me/628111919711"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="privacy-wa-btn"
                    >
                      Hubungi WA
                    </a>
                  </div>
                </div>
              </section>

            </article>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
