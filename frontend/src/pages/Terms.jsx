import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
import {
  FileText,
  Shield,
  User,
  AlertCircle,
  Lock,
  ShoppingBag,
  Gavel,
  BookOpen,
  Mail,
  Phone,
  Sparkles,
  ChevronRight,
  Scale,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  ArrowUp
} from "lucide-react";
import "./Terms.css";

const TOC_SECTIONS = [
  { id: "ketentuan-umum", number: "1", label: "Ketentuan Umum", icon: BookOpen },
  { id: "media-informasi", number: "2", label: "Media Informasi", icon: FileText },
  { id: "pengguna", number: "3", label: "Aturan Pengguna", icon: User },
  { id: "jual-barang", number: "4", label: "Pemasangan Usaha", icon: ShoppingBag },
  { id: "transaksi", number: "5", label: "Ketentuan Transaksi", icon: Shield },
  { id: "barang-terlarang", number: "6", label: "Barang Terlarang", icon: AlertCircle },
  { id: "privasi", number: "7", label: "Kebijakan Privasi", icon: Lock },
  { id: "sanksi", number: "8", label: "Sanksi & Pelanggaran", icon: ShieldAlert },
  { id: "tanggung-jawab", number: "9", label: "Batasan Tanggung Jawab", icon: Scale },
  { id: "hukum", number: "10", label: "Hukum & Sengketa", icon: Gavel },
  { id: "kontak", number: "11", label: "Hubungi Kami", icon: Mail },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState("ketentuan-umum");
  const isClickingRef = useRef(false);
  const sidebarNavRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Syarat & Ketentuan - Surade.com";
  }, []);

  // Auto-scroll active item into view inside sidebar container & mobile pill bar
  useEffect(() => {
    if (sidebarNavRef.current) {
      const activeEl = sidebarNavRef.current.querySelector(".terms-nav-link.active");
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    }
    if (mobileNavRef.current) {
      const activePill = mobileNavRef.current.querySelector(".terms-mobile-pill.active");
      if (activePill) {
        activePill.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: "smooth",
        });
      }
    }
  }, [activeSection]);

  // Smooth scrollspy to track active section accurately
  useEffect(() => {
    const handleScroll = () => {
      if (isClickingRef.current) return;

      const headerOffset = 130;
      const scrollPosition = window.scrollY + headerOffset;

      for (let i = TOC_SECTIONS.length - 1; i >= 0; i--) {
        const sectionId = TOC_SECTIONS[i].id;
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    setActiveSection(id);
    isClickingRef.current = true;

    const navbarOffset = 90;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navbarOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    // Update URL hash without jump
    window.history.replaceState(null, "", `#${id}`);

    setTimeout(() => {
      isClickingRef.current = false;
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="terms-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH COASTAL BACKGROUND & WAVE DIVIDER */}
      <header className="terms-hero">
        <div
          className="terms-hero__bg"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="terms-hero__overlay" />
        <div className="terms-hero__glow" />

        <div className="terms-hero__content">
          <div className="terms-hero__badge">
            <Sparkles size={14} className="terms-hero__badge-icon" />
            <span>Ketentuan &amp; Regulasi Resmi</span>
          </div>

          <div className="terms-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Syarat &amp; Ketentuan</span>
          </div>

          <h1 className="terms-hero__title">
            Syarat &amp; <span>Ketentuan</span>
          </h1>

          <p className="terms-hero__subtitle">
            Panduan dan ketentuan resmi penggunaan seluruh layanan, fitur direktori, dan platform digital Surade.com
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER */}
        <div className="terms-hero__wave">
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
      </header>

      {/* MOBILE HORIZONTAL PILL NAV */}
      <div className="terms-mobile-nav">
        <div className="terms-mobile-nav__scroller" ref={mobileNavRef}>
          {TOC_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`terms-mobile-pill ${activeSection === sec.id ? "active" : ""}`}
              onClick={(e) => scrollToSection(e, sec.id)}
            >
              <span className="terms-pill-num">{sec.number}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="terms-content">
        <div className="terms-layout">
          {/* DESKTOP STICKY SIDEBAR TABLE OF CONTENTS */}
          <aside className="terms-sidebar-wrapper">
            <div className="terms-sidebar">
              <div className="terms-sidebar__header">
                <div className="terms-sidebar__icon-badge">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="terms-sidebar__heading">Daftar Isi</h3>
                  <p className="terms-sidebar__subheading">11 Poin Regulasi Platform</p>
                </div>
              </div>

              <nav className="terms-nav-list" ref={sidebarNavRef} aria-label="Daftar Isi Regulasi">
                {TOC_SECTIONS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`terms-nav-link ${isActive ? "active" : ""}`}
                      onClick={(e) => scrollToSection(e, item.id)}
                    >
                      <div className="terms-nav-link__icon">
                        <Icon size={16} />
                      </div>
                      <span className="terms-nav-link__text">
                        {item.number}. {item.label}
                      </span>
                      {isActive && <ChevronRight size={14} className="terms-nav-link__arrow" />}
                    </a>
                  );
                })}
              </nav>

              <div className="terms-sidebar__footer">
                <div className="terms-sidebar__footer-badge">
                  <CheckCircle2 size={15} />
                  <span>Update Terbaru: Agt 2026</span>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLES */}
          <article className="terms-main">
            {/* 1. Ketentuan Umum */}
            <section id="ketentuan-umum" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <BookOpen size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 01</span>
                  <h2 className="terms-card__title">1. Ketentuan Umum</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>
                  Selamat datang di <strong>Surade.com</strong>. Syarat dan Ketentuan Penggunaan ini mengatur akses serta penggunaan Anda terhadap situs web, aplikasi, direktori bisnis, layanan iklan, dan seluruh fitur yang kami sediakan.
                </p>
                <div className="terms-callout terms-callout--emerald">
                  <div className="terms-callout__icon">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <strong>Persetujuan Pengguna:</strong> Dengan mendaftar, mengakses, atau menggunakan platform Surade.com, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh Syarat dan Ketentuan ini serta Kebijakan Privasi kami.
                  </div>
                </div>
                <p>
                  Surade.com berfungsi sebagai sarana media direktori informasi untuk mempromosikan kegiatan, tempat, dan bisnis lokal di seluruh wilayah Kecamatan Surade dan sekitarnya guna mendukung ekosistem Smart City dan Smart Village yang aman, transparan, dan berdaya saing.
                </p>
              </div>
            </section>

            {/* 2. Media Informasi */}
            <section id="media-informasi" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <FileText size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 02</span>
                  <h2 className="terms-card__title">2. Media Informasi &amp; Direktori</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <ol className="terms-list-numbered">
                  <li>Surade.com merupakan platform media direktori informasi digital untuk menyampaikan info kegiatan, tempat wisata, kuliner, jasa, dan profil bisnis di wilayah Kecamatan Surade.</li>
                  <li>Pada direktori produk dan bisnis, Surade.com bukan merupakan pemilik atau penjual langsung, melainkan media informasi yang memfasilitasi etalase digital bagi para pelaku usaha lokal.</li>
                  <li>Segala bentuk biaya tambahan, pajak, perizinan, dan kesepakatan transaksi jual beli menjadi tanggung jawab pihak penjual dan pembeli sesuai peraturan perundang-undangan di Republik Indonesia.</li>
                  <li>Barang, jasa, dan informasi yang dipasang wajib merupakan konten yang legal dan tidak tercantum pada daftar "Barang Terlarang".</li>
                  <li>Surade.com memiliki kewenangan penuh untuk memoderasi, menyunting, membatasi, atau menonaktifkan akun dan konten yang terindikasi melanggar Aturan Penggunaan tanpa pemberitahuan sebelumnya.</li>
                  <li>Aturan Penggunaan Surade.com dapat diperbarui sewaktu-waktu. Perubahan akan berlaku seketika setelah dipublikasikan pada halaman ini.</li>
                </ol>
              </div>
            </section>

            {/* 3. Pengguna */}
            <section id="pengguna" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <User size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 03</span>
                  <h2 className="terms-card__title">3. Aturan &amp; Kewajiban Pengguna</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <ol className="terms-list-numbered">
                  <li>Pengguna wajib memberikan data yang akurat, lengkap, dan benar saat melakukan pendaftaran akun serta verifikasi email.</li>
                  <li>Pengguna bertanggung jawab penuh atas keamanan akun, kata sandi, dan setiap aktivitas yang terjadi dalam akun miliknya.</li>
                  <li>Pengguna dilarang keras mempublikasikan konten yang mengandung unsur fitnah, kebencian SARA, pornografi, penipuan, pelanggaran hak cipta, atau merugikan pihak manapun.</li>
                  <li>Pengguna dilarang mengirimkan pesan spam, melakukan scraping data tanpa izin, atau merusak infrastruktur keamanan sistem Surade.com.</li>
                  <li>Pengguna wajib menghormati privasi dan hak-hak pengguna lain serta dilarang menyebarluaskan data pribadi pihak lain tanpa persetujuan resmi.</li>
                  <li>Pengguna dilarang memperjualbelikan atau memindahtangankan akun Surade.com kepada pihak lain tanpa persetujuan tertulis dari manajemen Surade.com.</li>
                </ol>
              </div>
            </section>

            {/* 4. Jual Barang / Bisnis */}
            <section id="jual-barang" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 04</span>
                  <h2 className="terms-card__title">4. Pemasangan Usaha &amp; Jual Barang</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <ol className="terms-list-numbered">
                  <li>Pemilik bisnis bertanggung jawab penuh atas keabsahan legalitas, hak paten/merek, izin edar (BPOM/PIRT/NIB bila ada), dan kebenaran deskripsi profil usahanya.</li>
                  <li>Setiap profil usaha wajib ditempatkan pada kategori dan lokasi wilayah desa/kelurahan yang tepat di wilayah Kecamatan Surade.</li>
                  <li>Dilarang membuat postingan duplikat (multiple posting) untuk barang atau bisnis yang sama secara berulang-ulang yang dapat mengganggu kenyamanan direktori.</li>
                  <li>Pemilik usaha wajib memperbarui informasi jam operasional, ketersediaan produk/jasa, dan nomor kontak WhatsApp yang aktif.</li>
                  <li>Dilarang mencantumkan transaksi fiktif, ulasan palsu, atau testimoni manipulatif demi keuntungan pribadi.</li>
                </ol>
              </div>
            </section>

            {/* 5. Transaksi */}
            <section id="transaksi" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <Shield size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 05</span>
                  <h2 className="terms-card__title">5. Ketentuan Transaksi &amp; Pembayaran</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <ol className="terms-list-numbered">
                  <li>Transaksi langsung antar pengguna dan pelaku usaha berlangsung melalui komunikasi mandiri (WhatsApp/Telepon/Tatap Muka). Pengguna diimbau selalu berhati-hati dan memeriksa keaslian barang sebelum melakukan pembayaran.</li>
                  <li>Untuk pembayaran paket iklan berbayar, banner promosi, atau fitur premium Surade.com, pembayaran hanya dilakukan melalui saluran resmi (QRIS / Rekening Resmi) yang tertera pada platform Surade.com.</li>
                  <li>Surade.com berhak membekukan layanan dan berkoordinasi dengan pihak berwenang jika ditemukan indikasi tindak penipuan atau pencucian uang.</li>
                </ol>
              </div>
            </section>

            {/* 6. Barang Terlarang */}
            <section id="barang-terlarang" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon terms-card__icon--danger">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span className="terms-card__tag terms-card__tag--danger">Larangan Mutlak</span>
                  <h2 className="terms-card__title">6. Barang &amp; Konten Terlarang</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>Berikut adalah barang, jasa, dan konten yang <strong>DILARANG KERAS</strong> didaftarkan atau dipromosikan di Surade.com:</p>
                <div className="terms-prohibited-grid">
                  <div className="terms-prohibited-item">
                    <span className="terms-prohibited-bullet">✕</span>
                    <span>Narkotika, psikotropika, obat-obatan tanpa resep dokter, dan zat adiktif ilegal.</span>
                  </div>
                  <div className="terms-prohibited-item">
                    <span className="terms-prohibited-bullet">✕</span>
                    <span>Senjata api, bahan peledak, senjata tajam ilegal, dan amunisi.</span>
                  </div>
                  <div className="terms-prohibited-item">
                    <span className="terms-prohibited-bullet">✕</span>
                    <span>Materi pornografi, eksploitasi seksual, atau konten yang melanggar norma kesusilaan.</span>
                  </div>
                  <div className="terms-prohibited-item">
                    <span className="terms-prohibited-bullet">✕</span>
                    <span>Barang curian, selundupan, atau barang bajakan yang melanggar Hak Kekayaan Intelektual (HAKI).</span>
                  </div>
                  <div className="terms-prohibited-item">
                    <span className="terms-prohibited-bullet">✕</span>
                    <span>Skema piramida/cepat kaya ilegal, judi online, atau praktik penipuan digital lainnya.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Kebijakan Privasi */}
            <section id="privasi" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <Lock size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 07</span>
                  <h2 className="terms-card__title">7. Kebijakan Privasi &amp; Keamanan Data</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>
                  Kami berkomitmen melindungi privasi data pribadi Anda sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) yang berlaku di Indonesia:
                </p>
                <ol className="terms-list-numbered">
                  <li>Informasi yang kami kumpulkan (seperti nama, email, nomor kontak, foto profil) digunakan semata-mata untuk verifikasi akun, operasional direktori, dan komunikasi penting.</li>
                  <li>Data login dilindungi dengan standar protokol keamanan modern guna mencegah akses yang tidak sah.</li>
                  <li>Kami tidak akan menjual atau menyewakan data pribadi pengguna kepada pihak ketiga manapun untuk kepentingan komersial tanpa persetujuan Anda.</li>
                </ol>
              </div>
            </section>

            {/* 8. Sanksi */}
            <section id="sanksi" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon terms-card__icon--warning">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <span className="terms-card__tag terms-card__tag--warning">Tindakan Disipliner</span>
                  <h2 className="terms-card__title">8. Sanksi &amp; Penegakan Aturan</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>Pelanggaran terhadap Syarat &amp; Ketentuan ini dapat dikenakan sanksi bertahap sebagai berikut:</p>
                <ol className="terms-list-numbered">
                  <li>Pemberian peringatan tertulis dan penurunan konten (take down) yang melanggar dari platform.</li>
                  <li>Penangguhan sementara (suspension) atau penutupan permanen terhadap akun pengguna terkait.</li>
                  <li>Pelaporan kepada aparat penegak hukum yang berwenang (Kepolisian RI / Kominfo) sesuai UU ITE jika terbukti terdapat unsur tindak pidana kejahatan siber, pemerasan, fitnah, atau penipuan.</li>
                </ol>
              </div>
            </section>

            {/* 9. Tanggung Jawab */}
            <section id="tanggung-jawab" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <Scale size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 09</span>
                  <h2 className="terms-card__title">9. Batasan Tanggung Jawab</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <ol className="terms-list-numbered">
                  <li>Surade.com tidak bertanggung jawab atas segala kerugian materiil maupun immateriil yang timbul akibat transaksi langsung antara pengguna di luar pengawasan sistem resmi.</li>
                  <li>Surade.com tidak bertanggung jawab atas akurasi data pihak ketiga, tautan eksternal, atau kegagalan koneksi akibat kendala jaringan internet penyedia layanan pengguna.</li>
                </ol>
              </div>
            </section>

            {/* 10. Hukum */}
            <section id="hukum" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <Gavel size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Pasal 10</span>
                  <h2 className="terms-card__title">10. Hukum yang Berlaku &amp; Musyawarah</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>
                  Syarat &amp; Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diutamakan penyelesaiannya melalui musyawarah untuk mufakat secara kekeluargaan terlebih dahulu sebelum menempuh jalur hukum di Pengadilan Negeri yang berwenang.
                </p>
              </div>
            </section>

            {/* 11. Kontak */}
            <section id="kontak" className="terms-card">
              <div className="terms-card__header">
                <div className="terms-card__icon">
                  <Mail size={24} />
                </div>
                <div>
                  <span className="terms-card__tag">Bantuan Resmi</span>
                  <h2 className="terms-card__title">11. Hubungi Kami &amp; Layanan Pengaduan</h2>
                </div>
              </div>
              <div className="terms-card__body">
                <p>
                  Jika Anda memiliki pertanyaan, klarifikasi mengenai Syarat &amp; Ketentuan ini, atau ingin melaporkan indikasi pelanggaran aturan pada platform Surade.com, silakan hubungi saluran resmi kami:
                </p>

                <div className="terms-contact-grid">
                  <div className="terms-contact-card">
                    <div className="terms-contact-icon terms-contact-icon--whatsapp">
                      <WhatsAppIcon size={22} />
                    </div>
                    <div className="terms-contact-details">
                      <span className="terms-contact-label">WhatsApp Bantuan</span>
                      <a
                        href="https://wa.me/628111919711"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="terms-contact-link"
                      >
                        +62 811-1919-711
                      </a>
                    </div>
                  </div>

                  <div className="terms-contact-card">
                    <div className="terms-contact-icon">
                      <Phone size={20} />
                    </div>
                    <div className="terms-contact-details">
                      <span className="terms-contact-label">Call Center</span>
                      <a href="tel:08071001500" className="terms-contact-link">
                        0807 - 100 - 1500
                      </a>
                    </div>
                  </div>

                  <div className="terms-contact-card">
                    <div className="terms-contact-icon">
                      <Mail size={20} />
                    </div>
                    <div className="terms-contact-details">
                      <span className="terms-contact-label">Email Dukungan</span>
                      <a href="mailto:support@surade.com" className="terms-contact-link">
                        support@surade.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Terms Bottom Bar */}
            <div className="terms-footer-bar">
              <div className="terms-footer-info">
                <p>Dokumen Regulasi Resmi Surade.com</p>
                <span>Terakhir diperbarui: 21 Agustus 2026</span>
              </div>
              <Link to="/faq" className="terms-footer-faq-btn">
                <HelpCircle size={17} />
                <span>Lihat Pertanyaan Umum (FAQ)</span>
              </Link>
            </div>
          </article>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}