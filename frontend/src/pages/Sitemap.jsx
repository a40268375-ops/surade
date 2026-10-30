import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import sitemapHeroBg from "../assets/sitemap-hero-bg.jpg";
import {
  Compass,
  Home,
  Store,
  MapPin,
  Newspaper,
  Sparkles,
  Shield,
  Search,
  ChevronRight,
  ArrowUp,
  Map,
  X,
  Layers,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe,
  Tag,
  Briefcase,
} from "lucide-react";
import "./Sitemap.css";

const SITEMAP_SECTIONS = [
  {
    id: "utama",
    title: "Navigasi & Informasi Utama",
    description: "Halaman umum panduan, profil perusahaan, dan pusat bantuan platform",
    icon: Compass,
    badgeColor: "emerald",
    links: [
      { name: "Beranda Utama", path: "/", desc: "Halaman beranda portal direktori bisnis & UMKM Surade", tag: "Utama" },
      { name: "Tentang Kami", path: "/about", desc: "Sejarah, visi pemuda, dan profil platform Surade.com" },
      { name: "Visi & Misi", path: "/vision-mission", desc: "Arah strategis dan komitmen pemberdayaan ekonomi lokal" },
      { name: "Kontak Kami", path: "/contact", desc: "Hubungi tim operasional, alamat kantor, dan formulir pesan" },
      { name: "Panduan Penggunaan", path: "/panduan", desc: "Panduan bergambar lengkap pendaftaran & pengelolaan bisnis", tag: "Penting" },
      { name: "Pusat Bantuan & FAQ", path: "/faq", desc: "Jawaban atas pertanyaan yang sering diajukan seputar platform" },
    ],
  },
  {
    id: "kategori",
    title: "Kategori Direktori Bisnis & UMKM",
    description: "Jelajahi ratusan peluang usaha lokal berdasarkan bidang industri",
    icon: Store,
    badgeColor: "amber",
    links: [
      { name: "Semua Kategori Usaha", path: "/category/all", desc: "Katalog menyeluruh seluruh UMKM di Kecamatan Surade", tag: "Katalog" },
      { name: "Kuliner & Makanan", path: "/category/kuliner", desc: "Warung makan, kedai kopi, oleh-oleh khas, dan jajanan pasar", tag: "Populer" },
      { name: "Jasa & Layanan", path: "/category/jasa", desc: "Tukang servis, kontraktor, fotografer, tata rias, dan profesional" },
      { name: "Toko & Belanja", path: "/category/belanja", desc: "Minimarket, toko kelontong, fashion, dan kebutuhan harian" },
      { name: "Otomotif & Bengkel", path: "/category/otomotif", desc: "Bengkel motor/mobil, cuci kendaraan, sparepart, dan aksesoris" },
      { name: "Wisata & Rekreasi", path: "/category/wisata", desc: "Pantai, curug, agrowisata, homestay, dan spot rekreasi", tag: "Favorit" },
      { name: "Pertanian & Perikanan", path: "/category/pertanian", desc: "Hasil tani unggulan, tambak, pakan ternak, dan bibit" },
      { name: "Properti & Hunian", path: "/category/properti", desc: "Sewa kost, kontrakan, ruko, dan tanah komersial" },
      { name: "Kesehatan & Apotek", path: "/category/kesehatan", desc: "Klinik, apotek berizin, dokter praktek, dan toko obat" },
      { name: "Pendidikan & Kursus", path: "/category/pendidikan", desc: "Bimbingan belajar, kursus komputer, les privat, & sertifikasi" },
    ],
  },
  {
    id: "desa",
    title: "12 Desa & Kelurahan (Smart City)",
    description: "Pemetaan profil UMKM berbasis desa dan kelurahan di Kecamatan Surade",
    icon: MapPin,
    badgeColor: "sky",
    links: [
      { name: "Kelurahan Surade", path: "/smart-city/kelurahan-surade", desc: "Pusat pemerintahan dan perekonomian perkotaan", tag: "Ibukota" },
      { name: "Desa Jagamukti", path: "/smart-city/jagamukti", desc: "Kawasan sentra pertanian, kerajinan lokal, dan perdagangan" },
      { name: "Desa Kadaleman", path: "/smart-city/kadaleman", desc: "Potensi agribisnis dan perikanan air tawar terpadu" },
      { name: "Desa Gunungsungging", path: "/smart-city/gunungsungging", desc: "Wisata alam perbukitan dan pertanian organik" },
      { name: "Desa Sukatani", path: "/smart-city/sukatani", desc: "Komoditas padi unggulan, sayuran, dan perkebunan rakyat" },
      { name: "Desa Sirnasari", path: "/smart-city/sirnasari", desc: "Sentra kerajinan anyaman bambu & produk olahan rumahan" },
      { name: "Desa Cipeundeuy", path: "/smart-city/cipeundeuy", desc: "Kawasan agraris penghasil gula aren kelapa alami" },
      { name: "Desa Kademangan", path: "/smart-city/kademangan", desc: "Pusat pasar tradisional dan perdagangan logistik" },
      { name: "Desa Buniwangi", path: "/smart-city/buniwangi", desc: "Gerbang utama jalur wisata Geopark Sukabumi Selatan", tag: "Wisata" },
      { name: "Desa Pasiripis", path: "/smart-city/pasiripis", desc: "Kawasan pesisir pantai, perahu nelayan, & sentra ikan laut" },
      { name: "Desa Citanglar", path: "/smart-city/citanglar", desc: "Pertanian lahan basah dan jalur lintas penghubung" },
      { name: "Desa Wanasari", path: "/smart-city/wanasari", desc: "Agrowisata alam dan perkebunan kelapa hibrida" },
    ],
  },
  {
    id: "berita",
    title: "Portal Berita, Artikel & Agenda",
    description: "Publikasi terkini seputar inovasi, liputan UMKM, dan kegiatan warga",
    icon: Newspaper,
    badgeColor: "purple",
    links: [
      { name: "Semua Berita & Artikel", path: "/blog", desc: "Kumpulan artikel edukasi bisnis, liputan, dan tips wirausaha", tag: "Update" },
      { name: "Agenda & Event Komunitas", path: "/blog?type=event", desc: "Kalender festival UMKM, bazar rakyat, dan agenda warga" },
      { name: "Pemberitahuan Resmi", path: "/informasi-surade", desc: "Pengumuman dan informasi layanan publik resmi daerah" },
    ],
  },
  {
    id: "mitra",
    title: "Layanan Mitra & Solusi Bisnis",
    description: "Fasilitas digitalisasi untuk mengembangkan bisnis Anda ke pasar digital",
    icon: Sparkles,
    badgeColor: "rose",
    links: [
      { name: "Pasang Usaha Baru", path: "/add-business", desc: "Daftarkan toko, bengkel, atau jasa Anda 100% online", tag: "Gratis" },
      { name: "Paket Premium & Promosi", path: "/pricing", desc: "Dapatkan badge terverifikasi dan prioritas ranking pencarian", tag: "Gold" },
      { name: "Pembuatan Website Bisnis", path: "/premium-website", desc: "Jasa pembuatan website profesional instan siap pakai" },
      { name: "Program Kemitraan & Karir", path: "/partnership-career", desc: "Peluang komisi referral mitra dan kontributor daerah" },
      { name: "Dashboard Pengguna & Inbox", path: "/dashboard", desc: "Panel pengelolaan profil, live chat WhatsApp, dan statistik", tag: "Mitra" },
    ],
  },
  {
    id: "legal",
    title: "Regulasi, Keamanan & Akun",
    description: "Perlindungan privasi, kepatuhan hukum transaksi, dan akses akun",
    icon: Shield,
    badgeColor: "indigo",
    links: [
      { name: "Kebijakan Privasi Data", path: "/privacy", desc: "Standar perlindungan data pribadi dan enkripsi keamanan akun", tag: "Privasi" },
      { name: "Syarat & Ketentuan Layanan", path: "/terms", desc: "Aturan hukum penggunaan platform dan etika komunitas", tag: "Hukum" },
      { name: "Masuk Akun Pengguna", path: "/login", desc: "Akses masuk cepat & aman ke dashboard bisnis Anda" },
      { name: "Daftar Akun Baru", path: "/register", desc: "Registrasi tanpa biaya untuk pengusaha lokal & pengunjung" },
      { name: "Lupa Kata Sandi", path: "/forgot-password", desc: "Pemulihan kata sandi melalui verifikasi kode OTP email" },
    ],
  },
];

export default function Sitemap() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    document.title = "Peta Situs (Sitemap) - Surade.com";
    window.scrollTo(0, 0);
  }, []);

  // Filter sections and links based on search & category pill
  const filteredSections = SITEMAP_SECTIONS.map((section) => {
    if (activeCategory !== "all" && section.id !== activeCategory) {
      return null;
    }

    if (!searchTerm.trim()) return section;

    const term = searchTerm.toLowerCase();
    const matchesSection =
      section.title.toLowerCase().includes(term) ||
      section.description.toLowerCase().includes(term);

    const matchingLinks = section.links.filter(
      (link) =>
        link.name.toLowerCase().includes(term) ||
        link.path.toLowerCase().includes(term) ||
        link.desc.toLowerCase().includes(term) ||
        (link.tag && link.tag.toLowerCase().includes(term))
    );

    if (matchesSection) return section;
    return matchingLinks.length > 0 ? { ...section, links: matchingLinks } : null;
  }).filter(Boolean);

  const totalLinksCount = SITEMAP_SECTIONS.reduce((acc, sec) => acc + sec.links.length, 0);
  const totalVisibleLinks = filteredSections.reduce((acc, s) => acc + s.links.length, 0);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setActiveCategory(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 95;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sitemap-page">
      <Navbar />

      {/* HERO SECTION MATCHING TERMS/PRIVACY DESIGN WITH IMAGE 3 BACKGROUND */}
      <header className="sitemap-hero">
        <div
          className="sitemap-hero__bg"
          style={{ backgroundImage: `url(${sitemapHeroBg})` }}
        />
        <div className="sitemap-hero__overlay" />
        <div className="sitemap-hero__glow" />

        <div className="sitemap-hero__content">
          <div className="sitemap-hero__badge">
            <Sparkles size={14} className="sitemap-hero__badge-icon" />
            <span>Peta Navigasi Lengkap</span>
          </div>

          <div className="sitemap-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Peta Situs</span>
          </div>

          <h1 className="sitemap-hero__title">
            Peta <span>Situs (Sitemap)</span>
          </h1>

          <p className="sitemap-hero__subtitle">
            Akses cepat dan terstruktur ke seluruh halaman direktori UMKM, 12 desa, artikel berita, dan layanan resmi platform <strong>Surade.com</strong>
          </p>

          {/* Quick Glassmorphic Live Search Bar */}
          <div className="sitemap-search-wrap">
            <Search size={18} className="sitemap-search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik nama halaman, kategori usaha, atau nama desa..."
              className="sitemap-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="sitemap-search-clear"
                title="Hapus pencarian"
              >
                <X size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* STATS METRIC BAR */}
      <section className="sitemap-stats-section">
        <div className="sitemap-stats-container">
          <div className="sitemap-stat-card">
            <div className="sitemap-stat-icon sitemap-stat-icon--emerald">
              <Compass size={20} />
            </div>
            <div className="sitemap-stat-info">
              <span className="sitemap-stat-num">{totalLinksCount}+</span>
              <span className="sitemap-stat-label">Halaman &amp; Rute Aktif</span>
            </div>
          </div>

          <div className="sitemap-stat-card">
            <div className="sitemap-stat-icon sitemap-stat-icon--amber">
              <Store size={20} />
            </div>
            <div className="sitemap-stat-info">
              <span className="sitemap-stat-num">10</span>
              <span className="sitemap-stat-label">Sektor Industri UMKM</span>
            </div>
          </div>

          <div className="sitemap-stat-card">
            <div className="sitemap-stat-icon sitemap-stat-icon--sky">
              <MapPin size={20} />
            </div>
            <div className="sitemap-stat-info">
              <span className="sitemap-stat-num">12</span>
              <span className="sitemap-stat-label">Desa Smart City</span>
            </div>
          </div>

          <div className="sitemap-stat-card">
            <div className="sitemap-stat-icon sitemap-stat-icon--indigo">
              <CheckCircle2 size={20} />
            </div>
            <div className="sitemap-stat-info">
              <span className="sitemap-stat-num">100%</span>
              <span className="sitemap-stat-label">Terverifikasi &amp; Terhubung</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SITEMAP CONTENT */}
      <main className="sitemap-main">
        {/* QUICK CATEGORY PILLS BAR */}
        <div className="sitemap-pills-bar">
          <div className="sitemap-pills-header">
            <span className="sitemap-pills-label">
              <Layers size={15} />
              Filter Bagian:
            </span>
          </div>

          <div className="sitemap-pills-list">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`sitemap-pill ${activeCategory === "all" ? "active" : ""}`}
            >
              Semua ({totalLinksCount})
            </button>
            {SITEMAP_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={(e) => scrollToSection(e, sec.id)}
                className={`sitemap-pill ${activeCategory === sec.id ? "active" : ""}`}
              >
                {sec.title.split("(")[0].trim()} ({sec.links.length})
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY SEARCH INFO */}
        <div className="sitemap-summary-bar">
          <div className="sitemap-summary-info">
            <span>
              Menampilkan <strong>{totalVisibleLinks}</strong> dari total <strong>{totalLinksCount}</strong> halaman
              {searchTerm && <span> untuk kata kunci &ldquo;<em>{searchTerm}</em>&rdquo;</span>}
            </span>
          </div>
          <div className="sitemap-summary-actions">
            {(searchTerm || activeCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="sitemap-reset-filter-btn"
              >
                Tampilkan Semua
              </button>
            )}
            <span className="sitemap-summary-date">Status: Live 2026</span>
          </div>
        </div>

        {/* DIRECTORY GRID SECTIONS */}
        <div className="sitemap-grid">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id} className={`sitemap-card sitemap-card--${section.badgeColor}`}>
                  <div className="sitemap-card__header">
                    <div className="sitemap-card__header-left">
                      <div className="sitemap-card__icon-wrap">
                        <Icon size={22} className="sitemap-card__icon" />
                      </div>
                      <div>
                        <h2 className="sitemap-card__title">{section.title}</h2>
                        <p className="sitemap-card__desc">{section.description}</p>
                      </div>
                    </div>
                    <span className="sitemap-card__badge-count">
                      {section.links.length} Tautan
                    </span>
                  </div>

                  <ul className="sitemap-card__links">
                    {section.links.map((link, idx) => (
                      <li key={idx} className="sitemap-link-item">
                        <Link to={link.path} className="sitemap-link">
                          <div className="sitemap-link__left">
                            <div className="sitemap-link__bullet-wrapper">
                              <span className="sitemap-link__bullet" />
                            </div>
                            <div className="sitemap-link__text">
                              <div className="sitemap-link__title-row">
                                <span className="sitemap-link__name">{link.name}</span>
                                {link.tag && (
                                  <span className={`sitemap-link__tag sitemap-link__tag--${link.tag.toLowerCase()}`}>
                                    {link.tag}
                                  </span>
                                )}
                              </div>
                              <span className="sitemap-link__desc">{link.desc}</span>
                            </div>
                          </div>
                          <div className="sitemap-link__right">
                            <code className="sitemap-link__url">{link.path}</code>
                            <div className="sitemap-link__chevron-box">
                              <ChevronRight size={14} className="sitemap-link__chevron" />
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <div className="sitemap-empty">
              <div className="sitemap-empty__icon-box">
                <Search size={36} className="sitemap-empty__icon" />
              </div>
              <h3 className="sitemap-empty__title">Tidak ada halaman yang cocok dengan &ldquo;{searchTerm}&rdquo;</h3>
              <p className="sitemap-empty__desc">
                Coba gunakan kata kunci yang lebih umum seperti &ldquo;kuliner&rdquo;, &ldquo;desa&rdquo;, &ldquo;jasa&rdquo;, atau &ldquo;privasi&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="sitemap-empty__btn"
              >
                Reset Pencarian &amp; Tampilkan Semua
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
