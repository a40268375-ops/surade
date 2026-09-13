import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  MessageCircle,
  Mail,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import "./FAQ.css";

const FAQ_DATA = [
  // ── Umum & Platform ──
  {
    id: "gen-1",
    category: "general",
    categoryLabel: "Umum",
    question: "Apa itu Surade.co.id?",
    answer:
      "Surade.co.id adalah portal informasi digital terlengkap di Indonesia yang menghubungkan masyarakat, pelaku usaha (UMKM hingga perusahaan besar), dan instansi pemerintahan. Platform ini dirancang untuk mewujudkan konsep Smart City dan Smart Village di seluruh pelosok Indonesia dengan kemudahan akses informasi dalam 'One Click Service'.",
  },
  {
    id: "gen-2",
    category: "general",
    categoryLabel: "Umum",
    question: "Apakah menggunakan Surade.co.id gratis?",
    answer:
      "Ya! Menjelajah informasi, mencari direktori bisnis, membaca artikel blog, dan mendaftar akun pengguna di Surade.co.id sepenuhnya GRATIS. Kami juga menyediakan paket promosi dan iklan berbayar (Premium) bagi pemilik bisnis yang ingin meningkatkan visibilitas dan jangkauan usahanya ke tingkat yang lebih tinggi.",
  },
  {
    id: "gen-3",
    category: "general",
    categoryLabel: "Umum",
    question: "Apa yang dimaksud dengan Smart City & Smart Village di Surade.co.id?",
    answer:
      "Smart City & Smart Village di Surade.co.id adalah inisiatif digitalisasi daerah di mana setiap kota, kabupaten, dan desa memiliki etalase virtual khusus. Di dalamnya tercakup direktori bisnis lokal, tempat wisata, layanan publik, berita kegiatan, dan potensi daerah yang terintegrasi secara digital sehingga mudah ditemukan oleh wisatawan, investor, maupun warga setempat.",
  },
  {
    id: "gen-4",
    category: "general",
    categoryLabel: "Umum",
    question: "Bagaimana cara mencari bisnis atau informasi di Surade.co.id?",
    answer:
      "Anda dapat menggunakan kolom pencarian utama di halaman beranda dengan memasukkan kata kunci (nama tempat/usaha, kategori) dan memilih lokasi kota/kabupaten. Anda juga bisa menelusuri kategori yang tersedia pada menu navigasi Informasi.",
  },

  // ── Akun & Keamanan ──
  {
    id: "acc-1",
    category: "account",
    categoryLabel: "Akun & Keamanan",
    question: "Bagaimana cara membuat akun baru di Surade.co.id?",
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
    question: "Apakah data pribadi saya aman di Surade.co.id?",
    answer:
      "Kami menjaga kerahasiaan data pribadi pengguna sesuai standar enkripsi modern dan kebijakan privasi yang ketat. Kata sandi dienkripsi dengan algoritma bcrypt tingkat tinggi, dan kami tidak akan pernah membagikan informasi sensitif Anda ke pihak ketiga tanpa izin Anda.",
  },

  // ── Pemasangan Bisnis & Usaha ──
  {
    id: "biz-1",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Bagaimana cara mendaftarkan profil usaha/bisnis saya?",
    answer:
      "Masuk ke akun Surade.co.id Anda, lalu klik tombol '+ Tambah Usaha' di navigasi atas. Isi informasi usaha Anda seperti nama bisnis, kategori & subkategori, alamat lengkap, nomor telepon/WhatsApp, jam operasional, tautan media sosial, serta upload foto galeri dan produk usaha Anda.",
  },
  {
    id: "biz-2",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Berapa lama proses verifikasi bisnis setelah didaftarkan?",
    answer:
      "Profil bisnis yang Anda daftarkan akan langsung tampil di direktori. Tim moderator Surade.co.id akan melakukan peninjauan kualitas data dalam waktu 1x24 jam untuk memastikan kesesuaian kategori dan kelengkapan informasi.",
  },
  {
    id: "biz-3",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Dapatkah saya mengedit atau memperbarui informasi usaha saya nanti?",
    answer:
      "Tentu saja! Anda bisa membuka 'Dashboard Saya' kapan saja, memilih profil usaha yang ingin diubah, lalu memperbarui jam operasional, foto produk, nomor kontak, maupun deskripsi promosi terbaru Anda secara real-time.",
  },
  {
    id: "biz-4",
    category: "business",
    categoryLabel: "Pemasangan Usaha",
    question: "Apa keuntungan memiliki profil usaha di Surade.co.id?",
    answer:
      "Bisnis Anda akan mendapatkan halaman profil virtual mandiri yang terindeks di mesin pencari (Google), memiliki tautan langsung ke WhatsApp, rute Google Maps, katalog produk, ulasan pelanggan, serta berpotensi tampil di rekomendasi bisnis kota setempat.",
  },

  // ── Iklan & Promosi ──
  {
    id: "ads-1",
    category: "ads",
    categoryLabel: "Iklan & Promosi",
    question: "Bagaimana cara memasang iklan banner atau promosi berbayar?",
    answer:
      "Surade.co.id menyediakan berbagai paket iklan strategis seperti Banner Hero Utama, Banner Sidebar, Iklan Rekomendasi Unggulan, dan Iklan Pop-up. Anda dapat memilih paket iklan melalui menu Dashboard atau menghubungi tim pemasaran kami melalui halaman Hubungi Kami.",
  },
  {
    id: "ads-2",
    category: "ads",
    categoryLabel: "Iklan & Promosi",
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami mendukung pembayaran melalui Transfer Bank Virtual Account (BCA, Mandiri, BNI, BRI), QRIS (GoPay, OVO, DANA, ShopeePay, LinkAja), dan Kartu Debit/Kredit dengan konfirmasi otomatis instan.",
  },

  // ── Jual Beli & Transaksi ──
  {
    id: "trade-1",
    category: "trade",
    categoryLabel: "Jual Beli",
    question: "Apakah Surade.co.id menjual barang secara langsung?",
    answer:
      "Tidak. Surade.co.id bertindak sebagai media informasi dan perantara etalase digital. Transaksi jual beli produk/layanan dilakukan secara langsung antara pembeli dan penjual (pemilik usaha) melalui kontak resmi yang tercantum.",
  },
  {
    id: "trade-2",
    category: "trade",
    categoryLabel: "Jual Beli",
    question: "Barang apa saja yang dilarang dipasang di Surade.co.id?",
    answer:
      "Barang yang dilarang mencakup narkotika, senjata api/tajam ilegal, obat-obatan tanpa izin BPOM, barang selundupan/curian, materi pornografi, dan barang/jasa lain yang melanggar hukum perundang-undangan Republik Indonesia. Selengkapnya dapat dilihat pada halaman Syarat & Ketentuan.",
  },

  // ── Donasi & Sosial ──
  {
    id: "soc-1",
    category: "social",
    categoryLabel: "Donasi & Sosial",
    question: "Bagaimana mekanisme program Donasi Sosial di Surade.co.id?",
    answer:
      "Dari setiap pendapatan pemasangan iklan dan layanan berbayar di Surade.co.id, kami menyisihkan sebagian dana untuk program tanggung jawab sosial. Dana tersebut dialokasikan untuk pembangunan desa, fasilitas pendidikan anak, bantuan kesehatan warga prasejahtera, dan pelestarian lingkungan hidup.",
  },
];

const CATEGORIES = [
  { key: "all", label: "Semua Topik", icon: Sparkles },
  { key: "general", label: "Umum & Platform", icon: HelpCircle },
  { key: "account", label: "Akun & Keamanan", icon: ShieldCheck },
  { key: "business", label: "Pemasangan Usaha", icon: Building2 },
  { key: "ads", label: "Iklan & Promosi", icon: Tag },
  { key: "trade", label: "Jual Beli", icon: CreditCard },
  { key: "social", label: "Donasi & Sosial", icon: Heart },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter FAQ items by category and search term
  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.categoryLabel.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

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

      {/* HERO SECTION */}
      <section className="faq-hero">
        <div className="faq-hero__bg" />
        <div className="faq-hero__overlay" />
        <div className="faq-hero__content">
          <div className="faq-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>FAQ &amp; Bantuan</span>
          </div>
          <h1 className="faq-hero__title">Pertanyaan yang Sering Diajukan</h1>
          <p className="faq-hero__subtitle">
            Pusat bantuan dan jawaban lengkap seputar penggunaan layanan, pendaftaran bisnis, akun, dan fitur di Surade.co.id
          </p>

          {/* SEARCH BAR */}
          <div className="faq-search-wrap">
            <Search className="faq-search-icon" size={20} />
            <input
              type="text"
              className="faq-search-input"
              placeholder="Cari topik atau pertanyaan (contoh: cara daftar, iklan, OTP)..."
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
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main className="faq-container">
        {/* STATS HIGHLIGHT */}
        <div className="faq-stats">
          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <Building2 size={24} />
            </div>
            <div>
              <div className="faq-stat-number">500+ Kota &amp; Desa</div>
              <div className="faq-stat-label">Terhubung dalam Smart City</div>
            </div>
          </div>

          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="faq-stat-number">100% Terverifikasi</div>
              <div className="faq-stat-label">Data &amp; Direktori Resmi</div>
            </div>
          </div>

          <div className="faq-stat-card">
            <div className="faq-stat-icon">
              <MessageCircle size={24} />
            </div>
            <div>
              <div className="faq-stat-number">24/7 Bantuan</div>
              <div className="faq-stat-label">Dukungan Pengguna &amp; Mitra</div>
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

        {/* SUPPORT CTA BOX */}
        <div className="faq-support-card">
          <div className="faq-support-info">
            <h3>Masih Punya Pertanyaan Lain?</h3>
            <p>
              Tim Customer Support Surade.co.id siap membantu Anda menjawab pertanyaan mengenai pendaftaran akun, kemitraan, periklanan, atau fitur lainnya.
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
              className="faq-support-btn faq-support-btn--secondary"
            >
              <MessageCircle size={16} />
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