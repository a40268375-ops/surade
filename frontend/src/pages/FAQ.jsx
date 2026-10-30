import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
import {
  Search,
  ChevronDown,
  X,
  HelpCircle,
  ShieldCheck,
  Building2,
  Tag,
  CreditCard,
  Heart,
  Mail,
  Sparkles,
  CheckCircle,
  Compass,
  Zap,
  Globe,
  Users
} from "lucide-react";
import "./FAQ.css";

const FAQ_DATA = [
  // ── Umum & Platform ──
  {
    id: "gen-1",
    category: "general",
    categoryLabel: "Umum",
    question: "Apa itu Surade.com?",
    answer:
      "Surade.com adalah portal informasi dan direktori digital resmi yang menghubungkan masyarakat, pelaku UMKM, dan instansi di Kecamatan Surade, Kabupaten Sukabumi. Platform ini dirancang untuk mewujudkan digitalisasi desa di seluruh wilayah Kecamatan Surade dengan kemudahan akses informasi dalam 'One Click Service'.",
  },
  {
    id: "gen-2",
    category: "general",
    categoryLabel: "Umum",
    question: "Apakah menggunakan Surade.com gratis?",
    answer:
      "Ya! Menjelajah informasi, mencari direktori bisnis, membaca artikel blog, dan mendaftar akun pengguna di Surade.com sepenuhnya GRATIS. Kami juga menyediakan paket promosi dan iklan berbayar (Premium) bagi pemilik bisnis yang ingin meningkatkan visibilitas dan jangkauan usahanya ke tingkat yang lebih tinggi.",
  },
  {
    id: "gen-3",
    category: "general",
    categoryLabel: "Umum",
    question: "Apa yang dimaksud dengan Digitalisasi Desa di Surade.com?",
    answer:
      "Digitalisasi Desa di Surade.com adalah inisiatif digital di mana setiap desa dan kelurahan di wilayah Kecamatan Surade memiliki etalase virtual khusus. Di dalamnya tercakup direktori bisnis lokal, tempat wisata, layanan publik, berita kegiatan, dan potensi desa yang terintegrasi secara digital sehingga mudah ditemukan oleh wisatawan maupun warga setempat.",
  },
  {
    id: "gen-4",
    category: "general",
    categoryLabel: "Umum",
    question: "Bagaimana cara mencari bisnis atau informasi di Surade.com?",
    answer:
      "Anda dapat menggunakan kolom pencarian utama di halaman beranda dengan memasukkan kata kunci (nama tempat/usaha, kategori) atau memilih wilayah desa di Kecamatan Surade. Anda juga bisa menelusuri kategori yang tersedia pada menu navigasi Informasi.",
  },

  // ── Akun & Keamanan ──
  {
    id: "acc-1",
    category: "account",
    categoryLabel: "Akun & Keamanan",
    question: "Bagaimana cara membuat akun baru di Surade.com?",
    answer:
      "Klik tombol 'Login' di pojok kanan atas, lalu pilih 'Buat Akun Baru'. Masukkan nama lengkap, alamat email aktif, kata sandi, dan jenis kelamin. Sistem akan mengirimkan 6 digit kode OTP ke email Anda untuk verifikasi instan. Setelah OTP dimasukkan dengan benar, akun Anda langsung aktif!",
  },
  {
    id: "acc-2",
    category: "account",
    categoryLabel: "Akun & Keamanan",
    question: "Mengapa saya tidak menerima kode verifikasi OTP di email?",
    answer:
      "Pastikan alamat email yang Anda masukkan sudah benar dan aktif. Periksa juga folder 'Spam', 'Junk', atau 'Promosi' di inbox Gmail/email Anda. Jika setelah 60 detik kode belum masuk, Anda dapat mengklik tombol 'Kirim Ulang Kode'.",
  },
  {
    id: "acc-3",
    category: "account",
    categoryLabel: "Akun & Keamanan",
    question: "Bagaimana jika saya lupa kata sandi akun?",
    answer:
      "Di halaman Login, klik 'Lupa kata sandi?'. Masukkan alamat email Anda yang terdaftar, dan kami akan mengirimkan kode OTP reset password ke email Anda. Masukkan kode tersebut dan buat kata sandi baru yang aman (minimal 8 karakter).",
  },
  {
    id: "acc-4",
    category: "account",
    categoryLabel: "Akun & Keamanan",
    question: "Apakah data pribadi saya aman di Surade.com?",
    answer:
      "Kami menjaga kerahasiaan data pribadi pengguna sesuai standar enkripsi modern dan kebijakan privasi yang ketat, dan kami tidak akan pernah membagikan informasi sensitif Anda ke pihak ketiga tanpa izin Anda.",
  },

  // ── Pemasangan Bisnis & Usaha ──
  {
    id: "biz-1",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Bagaimana cara mendaftarkan profil usaha/bisnis saya?",
    answer:
      "Masuk ke akun Surade.com Anda, lalu klik tombol '+ Tambah Usaha' di navigasi atas. Isi informasi usaha Anda seperti nama bisnis, kategori & subkategori, alamat lengkap, nomor telepon/WhatsApp, jam operasional, tautan media sosial, serta upload foto galeri dan produk usaha Anda.",
  },
  {
    id: "biz-2",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Berapa lama proses verifikasi profil usaha saya?",
    answer:
      "Tim admin Surade.com memverifikasi setiap pendaftaran usaha baru secara manual untuk memastikan keaslian data. Proses ini biasanya memakan waktu 1x24 jam pada hari kerja. Anda akan menerima notifikasi status persetujuan langsung di akun Anda.",
  },
  {
    id: "biz-3",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Apakah saya bisa mengubah informasi usaha setelah disetujui?",
    answer:
      "Tentu saja. Anda dapat masuk ke Dashboard Admin User kapan saja untuk memperbarui jam operasional, alamat, nomor WhatsApp, foto produk, daftar menu/harga, atau informasi lainnya secara berkala.",
  },
  {
    id: "biz-4",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Apakah satu akun bisa mendaftarkan lebih dari satu usaha?",
    answer:
      "Ya, satu akun terdaftar dapat mendaftarkan beberapa cabang atau unit usaha berbeda di wilayah Kecamatan Surade melalui dashboard pengguna.",
  },

  // ── Paket Iklan & Promosi ──
  {
    id: "ads-1",
    category: "promo",
    categoryLabel: "Iklan & Promosi",
    question: "Apa keuntungan berlangganan Paket Usaha Premium di Surade.com?",
    answer:
      "Dengan Paket Premium, profil usaha Anda akan tampil di posisi teratas halaman pencarian dan beranda (Badge Unggulan), bebas dari iklan kompetitor, mendapatkan fitur katalog produk tanpa batas, akses analitik statistik pengunjung, serta promosi terjadwal di media sosial resmi Surade.com.",
  },
  {
    id: "ads-2",
    category: "promo",
    categoryLabel: "Iklan & Promosi",
    question: "Bagaimana cara memasang Banner Iklan di website?",
    answer:
      "Anda dapat memilih slot banner (Header Beranda, Sidebar Direktori, atau Halaman Kategori) melalui menu Paket Iklan di dashboard atau menghubungi tim marketing kami via WhatsApp untuk penawaran khusus.",
  },
  {
    id: "ads-3",
    category: "promo",
    categoryLabel: "Iklan & Promosi",
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung pembayaran otomatis instan via QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay), Transfer Bank Virtual Account, dan transfer rekening resmi.",
  },

  // ── Smart Village & Kebijakan ──
  {
    id: "sv-1",
    category: "policy",
    categoryLabel: "Kebijakan & Komunitas",
    question: "Apa peran Surade.com dalam pemberdayaan desa?",
    answer:
      "Surade.com bermitra dengan komunitas lokal dan aparatur 12 desa se-Kecamatan Surade untuk memfasilitasi transformasi digital, mendukung pelatihan UMKM, mempublikasikan agenda pariwisata lokal, dan mendorong pertumbuhan ekonomi yang inklusif.",
  },
  {
    id: "sv-2",
    category: "policy",
    categoryLabel: "Kebijakan & Komunitas",
    question: "Produk atau jasa apa saja yang dilarang didaftarkan?",
    answer:
      "Barang yang dilarang mencakup narkotika, senjata api/tajam ilegal, obat-obatan tanpa izin BPOM, barang selundupan/curian, materi pornografi, dan barang/jasa lain yang melanggar hukum perundang-undangan Republik Indonesia. Selengkapnya dapat dilihat pada halaman Syarat & Ketentuan.",
  },
  {
    id: "sv-3",
    category: "policy",
    categoryLabel: "Kebijakan & Komunitas",
    question: "Bagaimana cara melaporkan informasi atau toko yang melanggar?",
    answer:
      "Setiap halaman profil usaha memiliki tombol 'Laporkan Penyalahgunaan'. Anda juga dapat menghubungi tim CS kami dengan menyertakan bukti screenshot dan tautan profil yang bersangkutan untuk segera kami tindaklanjuti.",
  },
];

const CATEGORIES = [
  { key: "all", label: "Semua", icon: HelpCircle },
  { key: "general", label: "Umum & Platform", icon: Globe },
  { key: "account", label: "Akun & Keamanan", icon: ShieldCheck },
  { key: "business", label: "Pemasangan Usaha", icon: Building2 },
  { key: "promo", label: "Iklan & Promosi", icon: Tag },
  { key: "policy", label: "Kebijakan & Desa", icon: Heart },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({ "gen-1": true });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pusat Bantuan & FAQ - Surade.com";
  }, []);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCat = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Auto expand matching FAQ items when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const openState = {};
      filteredFaqs.forEach((faq) => {
        openState[faq.id] = true;
      });
      setOpenItems(openState);
    }
  }, [searchQuery, activeCategory]);

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="faq-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH COASTAL BACKGROUND & WAVE DIVIDER */}
      <header className="faq-hero">
        <div
          className="faq-hero__bg"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="faq-hero__overlay" />
        <div className="faq-hero__glow" />

        <div className="faq-hero__content">
          <div className="faq-hero__badge">
            <Sparkles size={14} className="faq-hero__badge-icon" />
            <span>Pusat Bantuan &amp; FAQ</span>
          </div>

          <div className="faq-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Pusat Bantuan</span>
          </div>

          <h1 className="faq-hero__title">
            Pertanyaan yang <span>Sering Diajukan</span>
          </h1>

          <p className="faq-hero__subtitle">
            Temukan jawaban lengkap dan panduan praktis seputar penggunaan direktori, pendaftaran akun, dan fitur bisnis di Surade.com
          </p>

          {/* SEARCH BAR */}
          <div className="faq-search-wrap">
            <Search className="faq-search-icon" size={20} />
            <input
              type="text"
              className="faq-search-input"
              placeholder="Cari pertanyaan... (contoh: cara daftar, verifikasi, iklan)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* QUICK SEARCH SUGGESTIONS */}
          <div className="faq-quick-tags">
            <span className="faq-quick-tags-label">Pencarian Populer:</span>
            {["Cara Daftar", "Verifikasi Akun", "Pasang Iklan", "Digitalisasi Desa", "Ganti Password"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="faq-quick-tag-chip"
                onClick={() => {
                  setSearchQuery(tag);
                  setActiveCategory("all");
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ORGANIC WAVE DIVIDER (GELOMBANG) */}
        <div className="faq-hero__wave">
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

      {/* MAIN CONTENT AREA */}
      <main className="faq-container">
        {/* QUICK STATS */}
        <div className="faq-stats">
          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <Building2 size={24} />
            </div>
            <div>
              <div className="faq-stat-number">12 Desa</div>
              <div className="faq-stat-label">Terintegrasi Se-Kecamatan</div>
            </div>
          </div>

          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <Zap size={24} />
            </div>
            <div>
              <div className="faq-stat-number">One Click</div>
              <div className="faq-stat-label">Akses WhatsApp &amp; Maps Instan</div>
            </div>
          </div>

          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="faq-stat-number">100% Valid</div>
              <div className="faq-stat-label">Verifikasi Data UMKM Resmi</div>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="faq-categories">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`faq-cat-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE SEARCH RESULT INFO */}
        {searchQuery.trim() && (
          <div className="faq-search-results-info">
            <span>
              Menampilkan <strong>{filteredFaqs.length}</strong> pertanyaan untuk "<strong>{searchQuery}</strong>"
            </span>
            <button
              type="button"
              className="faq-search-reset-link"
              onClick={() => setSearchQuery("")}
            >
              Hapus Filter
            </button>
          </div>
        )}

        {/* ACCORDION LIST */}
        {filteredFaqs.length > 0 ? (
          <div className="faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div key={faq.id} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-left">
                      <span className="faq-badge">{faq.categoryLabel}</span>
                      <span className="faq-question-text">{faq.question}</span>
                    </div>
                    <div className="faq-chevron">
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="faq-empty">
            <div className="faq-empty-icon">
              <Search size={32} />
            </div>
            <h3 className="faq-empty-title">Pertanyaan tidak ditemukan</h3>
            <p className="faq-empty-desc">
              Kami tidak dapat menemukan hasil untuk kata kunci "{searchQuery}". Coba kata kunci lain atau hubungi tim bantuan kami.
            </p>
            <button
              type="button"
              className="faq-empty-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Reset Pencarian
            </button>
          </div>
        )}

        {/* SUPPORT CTA BOX WITH AUTHENTIC WHATSAPP LOGO */}
        <div className="faq-support-card">
          <div className="faq-support-info">
            <h3>Masih Punya Pertanyaan Lain?</h3>
            <p>
              Tim Customer Support Surade.com siap membantu Anda menjawab pertanyaan mengenai pendaftaran akun, kemitraan, periklanan, atau fitur lainnya.
            </p>
          </div>
          <div className="faq-support-actions">
            <Link to="/contact" className="faq-support-btn faq-support-btn--primary">
              <Mail size={16} />
              <span>Hubungi Kami</span>
            </Link>
            <a
              href="https://wa.me/628111919711"
              target="_blank"
              rel="noopener noreferrer"
              className="faq-support-btn faq-support-btn--whatsapp"
            >
              <WhatsAppIcon size={18} />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}