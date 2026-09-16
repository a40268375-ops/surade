import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  BookOpen,
  Home,
  UserPlus,
  LogIn,
  LayoutDashboard,
  Building2,
  Store,
  Crown,
  Megaphone,
  HelpCircle,
  Phone,
  Search,
  MapPin,
  X,
  ZoomIn,
  Gift,
  Compass,
  Newspaper,
  Layers,
  Sparkles,
  Package,
  MessageSquare,
  Star,
  Bookmark,
  User,
  CheckCircle,
  TrendingUp,
  CreditCard,
  Share2
} from "lucide-react";
import "./Panduan.css";

// 22 Screenshots Unik & Tangkapan Layar Asli (Tanpa Foto Berulang/Duplikat)
import imgHomeHero from "../assets/panduan/panduan_home_hero.png";
import imgHomeCategories from "../assets/panduan/panduan_home_categories.png";
import imgHomeFeatured from "../assets/panduan/panduan_home_featured.png";
import imgCategoryFilter from "../assets/panduan/panduan_category_filter.png";
import imgBizDetail from "../assets/panduan/panduan_biz_detail.png";
import imgRegisterClean from "../assets/panduan/panduan_register_clean.png";
import imgOtpModal from "../assets/panduan/panduan_otp_modal.png";
import imgLoginClean from "../assets/panduan/panduan_login_clean.png";
import imgAddBiz from "../assets/panduan/panduan_add_business.png";
import imgBizEdit from "../assets/panduan/panduan_bisnis.png";
import imgSmartCity from "../assets/panduan/panduan_smart_city.png";
import imgHubungiCs from "../assets/panduan/panduan_hubungi_cs.png";

// Real Dashboard Feature Screenshots
import imgDashOverview from "../assets/panduan/panduan_dash_overview.png";
import imgDashBisnis from "../assets/panduan/panduan_dash_bisnis.png";
import imgDashProduk from "../assets/panduan/panduan_dash_produk.png";
import imgDashPremium from "../assets/panduan/panduan_dash_premium.png";
import imgDashBayar from "../assets/panduan/panduan_dash_bayar.png";
import imgDashInbox from "../assets/panduan/panduan_dash_inbox.png";
import imgDashIklan from "../assets/panduan/panduan_dash_iklan.png";
import imgDashReferral from "../assets/panduan/panduan_dash_referral.png";
import imgDashUlasan from "../assets/panduan/panduan_dash_ulasan.png";
import imgDashSimpan from "../assets/panduan/panduan_dash_simpan.png";
import imgDashBlog from "../assets/panduan/panduan_dash_blog.png";
import imgDashProfil from "../assets/panduan/panduan_dash_profil.png";

const guideSections = [
  {
    id: "beranda-pencarian",
    icon: <Home size={22} className="text-[#059669]" />,
    number: "1",
    roleBadge: "Eksplorasi Publik",
    title: "1. Beranda & Pencarian Usaha UMKM",
    subtitle: "Cara menemukan produk, tempat kuliner, bengkel, toko, dan penyedia jasa di seluruh Kecamatan Surade dengan cepat dan akurat.",
    steps: [
      {
        img: imgHomeHero,
        title: "Langkah 1: Akses Beranda & Bilah Pencarian Cepat",
        desc: "Ketik nama usaha, produk, atau kata kunci (contoh: 'Kopi', 'Bengkel', 'Sembako') pada kolom pencarian utama beranda untuk mencari seketika."
      },
      {
        img: imgHomeFeatured,
        title: "Langkah 2: Telusuri Rekomendasi UMKM Unggulan",
        desc: "Gulir ke bawah untuk menemukan deretan UMKM terverifikasi yang sedang populer dengan rating tinggi dan penawaran terbaik di wilayah Surade."
      }
    ],
    callout: "💡 **Tips Pengunjung:** Bilah pencarian mendukung pencarian berdasarkan nama pemilik toko, kategori produk, hingga nama gang atau jalan utama di Surade."
  },
  {
    id: "kategori-desa",
    icon: <Layers size={22} className="text-[#059669]" />,
    number: "2",
    roleBadge: "Direktori & Wilayah",
    title: "2. Kategori Usaha & Filter 12 Desa",
    subtitle: "Jelajahi direktori usaha berdasarkan 10 sektor kategori dan persempit wilayah ke desa/kelurahan Anda.",
    steps: [
      {
        img: imgHomeCategories,
        title: "Langkah 1: Pilih dari 10 Kotak Kategori Utama",
        desc: "Klik salah satu ikon kategori (Kuliner, Retail, Otomotif, Jasa, Kesehatan, Fashion, Pertanian, Wisata & Budaya, dll) untuk melihat semua listing terkait."
      },
      {
        img: imgCategoryFilter,
        title: "Langkah 2: Saring Berdasarkan Desa / Kelurahan",
        desc: "Gunakan filter wilayah desa (Kelurahan Surade, Buniwangi, Cipeundeuy, Citanglar, Kadaleman, Sukatani, dll) agar mendapatkan hasil yang paling dekat dengan lokasi Anda."
      }
    ]
  },
  {
    id: "detail-kontak",
    icon: <Store size={22} className="text-[#059669]" />,
    number: "3",
    roleBadge: "Interaksi & Pesanan",
    title: "3. Detail Toko, Peta Lokasi & Chat WhatsApp",
    subtitle: "Melihat profil lengkap usaha, mengecek status buka/tutup, dan bertransaksi langsung dengan pemilik toko tanpa perantara.",
    steps: [
      {
        img: imgBizDetail,
        title: "Langkah 1: Buka Profil Usaha & Hubungi via WhatsApp",
        desc: "Klik kartu usaha untuk melihat deskripsi, daftar harga/menu, titik lokasi Google Maps, dan klik tombol hijau 'Chat WhatsApp' untuk langsung memesan ke pemilik usaha."
      }
    ],
    callout: "📱 **Langsung Terhubung:** Semua kontak WhatsApp terverifikasi langsung terhubung ke nomor pemilik toko tanpa potongan komisi pihak ketiga."
  },
  {
    id: "pendaftaran-otp",
    icon: <UserPlus size={22} className="text-[#059669]" />,
    number: "4",
    roleBadge: "Pendaftaran Akun",
    title: "4. Pendaftaran Akun & Verifikasi Kode OTP",
    subtitle: "Panduan membuat akun resmi Surade.co.id dan memverifikasi email Anda dengan kode OTP 6-digit demi keamanan data.",
    steps: [
      {
        img: imgRegisterClean,
        title: "Langkah 1: Isi Formulir Pendaftaran Akun",
        desc: "Buka halaman pendaftaran, masukkan nama lengkap, alamat email aktif Anda, dan buat kata sandi yang aman minimal 8 karakter."
      },
      {
        img: imgOtpModal,
        title: "Langkah 2: Masukkan Kode OTP 6-Digit dari Email",
        desc: "Cek pesan masuk di inbox email Anda dari pengirim resmi Surade.co.id, salin kode OTP 6-digit, lalu masukkan ke jendela verifikasi."
      }
    ],
    callout: "🔒 **Keamanan Akun:** Kode OTP aktif selama 10 menit. Jangan pernah memberikan kode OTP ini kepada orang lain untuk mencegah penyalahgunaan."
  },
  {
    id: "login-pengantar",
    icon: <LogIn size={22} className="text-[#059669]" />,
    number: "5",
    roleBadge: "Akses Akun",
    title: "5. Masuk Akun (Login) & Pengantar Dashboard",
    subtitle: "Cara masuk ke akun pengguna dan membuka pintu ke seluruh fitur pengelolaan toko & usaha.",
    steps: [
      {
        img: imgLoginClean,
        title: "Langkah 1: Masuk dengan Email & Kata Sandi",
        desc: "Ketikkan email dan kata sandi yang sudah didaftarkan pada formulir login, lalu klik tombol 'Masuk ke Akun' untuk mengakses dashboard."
      }
    ]
  },
  {
    id: "dashboard-overview",
    icon: <TrendingUp size={22} className="text-[#059669]" />,
    number: "6",
    roleBadge: "Fitur Dashboard",
    title: "6. Dashboard Overview & Analitik Pengunjung",
    subtitle: "Pusat statistik real-time penayangan toko, grafik kunjungan mingguan, dan notifikasi aktivitas terbaru.",
    steps: [
      {
        img: imgDashOverview,
        title: "Langkah 1: Pantau Ringkasan Statistik Views & Aktivitas",
        desc: "Pada halaman utama Dashboard, Anda dapat melihat total views toko, jumlah ulasan, grafik kunjungan portal mingguan, serta banner penawaran upgrade Centang Emas."
      }
    ],
    callout: "📊 **Analitik Toko:** Grafik kunjungan diperbarui secara otomatis untuk membantu Anda memantau efektivitas promosi toko Anda."
  },
  {
    id: "tambah-kelola-bisnis",
    icon: <LayoutDashboard size={22} className="text-[#059669]" />,
    number: "7",
    roleBadge: "Fitur Dashboard",
    title: "7. Pendaftaran & Kelola Tempat Usaha (Bisnis Saya)",
    subtitle: "Cara menambah tempat usaha baru ke direktori dan memantau status persetujuan toko Anda.",
    steps: [
      {
        img: imgAddBiz,
        title: "Langkah 1: Isi Formulir Usaha Baru & Pin Lokasi Peta",
        desc: "Klik tombol '+ Tambah Bisnis', lengkapi nama toko, kategori, nomor WhatsApp aktif, deskripsi layanan, serta geser pin peta lokasi desa Anda."
      },
      {
        img: imgDashBisnis,
        title: "Langkah 2: Pantau & Kelola Listing Usaha di Tab 'Bisnis'",
        desc: "Buka tab 'Bisnis' di dashboard untuk melihat seluruh tempat usaha yang Anda miliki, status verifikasi (Aktif/Menunggu), serta tombol cepat edit dan upgrade."
      }
    ]
  },
  {
    id: "jam-operasional",
    icon: <Store size={22} className="text-[#059669]" />,
    number: "8",
    roleBadge: "Fitur Dashboard",
    title: "8. Jam Operasional & Edit Profil Toko",
    subtitle: "Menyesuaikan jam buka-tutup toko harian agar status operasional tampil otomatis di halaman utama.",
    steps: [
      {
        img: imgBizEdit,
        title: "Langkah 1: Atur Jadwal Buka-Tutup & Katalog Toko",
        desc: "Klik tombol Edit pada toko Anda untuk menentukan jam buka harian (misal: 08.00 - 21.00 WIB) dan memperbarui foto profil atau alamat lokasi."
      }
    ]
  },
  {
    id: "katalog-produk",
    icon: <Package size={22} className="text-[#059669]" />,
    number: "9",
    roleBadge: "Fitur Dashboard",
    title: "9. Manajemen Katalog Produk & Jasa Usaha",
    subtitle: "Memasukkan menu makanan, barang dagangan, atau daftar harga jasa ke halaman toko Anda.",
    steps: [
      {
        img: imgDashProduk,
        title: "Langkah 1: Kelola Daftar Produk di Tab 'Produk'",
        desc: "Buka tab 'Produk' di dashboard, klik '+ Tambah Produk', pilih toko Anda, unggah foto barang/makanan, atur harga dan deskripsi penawaran."
      }
    ],
    callout: "📦 **Katalog Menarik:** Toko yang melengkapi daftar produk dengan foto jernih dan harga terbukti 3x lebih banyak dihubungi pelanggan!"
  },
  {
    id: "upgrade-premium",
    icon: <Crown size={22} className="text-[#059669]" />,
    number: "10",
    roleBadge: "Fitur Dashboard",
    title: "10. Upgrade Bisnis ke Centang Emas (Paket Premium)",
    subtitle: "Tata cara lengkap menaikkan status toko ke Centang Emas resmi, posisi teratas hasil pencarian, dan peta rute Google Maps.",
    steps: [
      {
        img: imgDashPremium,
        title: "Langkah 1: Pilih Usaha & Durasi Paket Berlangganan",
        desc: "Buka tab 'Premium' di dashboard (atau klik tombol emas 'Upgrade' pada toko Anda). Pilih profil usaha, tentukan durasi paket (Bulanan / Tahunan), dan masukkan kupon diskon."
      },
      {
        img: imgDashBayar,
        title: "Langkah 2: Transfer Pembayaran & Unggah Struk Bukti",
        desc: "Pilih metode transfer (Bank Transfer / QRIS / E-Wallet), lakukan transfer sesuai tagihan, lalu unggah foto struk bukti transfer. Admin akan segera meninjau dan badge Centang Emas aktif!"
      }
    ],
    callout: "⭐ **Keunggulan Centang Emas:**\n1. **Badge Terverifikasi Resmi:** Meningkatkan kepercayaan pembeli hingga 98%.\n2. **Posisi Pertama:** Toko Anda otomatis berada di urutan teratas hasil pencarian desa & kategori.\n3. **Navigasi Rute Maps:** Pelanggan luar daerah dapat langsung membuka titik rute ke lokasi Anda."
  },
  {
    id: "inbox-chat",
    icon: <MessageSquare size={22} className="text-[#059669]" />,
    number: "11",
    roleBadge: "Fitur Dashboard",
    title: "11. Inbox Chat Direct Pelanggan",
    subtitle: "Fitur kirim dan terima pesan interaktif secara langsung dari pengunjung website tanpa perlu aplikasi tambahan.",
    steps: [
      {
        img: imgDashInbox,
        title: "Langkah 1: Balas Pesan Masuk di Tab 'Inbox'",
        desc: "Buka tab 'Inbox' di dashboard untuk melihat daftar percakapan dengan calon pembeli, membalas pertanyaan produk, dan mengirim balasan cepat."
      }
    ]
  },
  {
    id: "iklan-banner",
    icon: <Megaphone size={22} className="text-[#059669]" />,
    number: "12",
    roleBadge: "Fitur Dashboard",
    title: "12. Pemasangan Banner Iklan Promosi",
    subtitle: "Menayangkan banner iklan produk unggulan Anda pada posisi paling strategis di halaman utama Surade.co.id.",
    steps: [
      {
        img: imgDashIklan,
        title: "Langkah 1: Unggah Banner Promo & Cek Statistik Klik",
        desc: "Buka tab 'Iklan' di dashboard, klik '+ Pasang Iklan', unggah gambar banner promo, tentukan tautan WhatsApp/toko, dan pantau jumlah tayangan serta klik pengunjung secara real-time."
      }
    ]
  },
  {
    id: "referral-komisi",
    icon: <Gift size={22} className="text-[#059669]" />,
    number: "13",
    roleBadge: "Fitur Dashboard",
    title: "13. Program Referral & Saldo Komisi Mitra",
    subtitle: "Raih pendapatan pasif dengan membagikan kode referral unik kepada sesama pelaku UMKM di Surade.",
    steps: [
      {
        img: imgDashReferral,
        title: "Langkah 1: Salin Kode Referral & Pencairan Saldo",
        desc: "Buka tab 'Referral' di dashboard untuk menyalin link undangan unik Anda. Setiap ada rekan yang mendaftar & berlangganan paket, Anda mendapatkan saldo komisi yang dapat ditarik ke rekening bank."
      }
    ],
    callout: "💰 **Pendapatan Tambahan:** Komisi dihitung otomatis dan transparan, dapat ditarik kapan saja ke semua rekening bank lokal maupun dompet digital e-wallet."
  },
  {
    id: "ulasan-simpan",
    icon: <Star size={22} className="text-[#059669]" />,
    number: "14",
    roleBadge: "Fitur Dashboard",
    title: "14. Kelola Ulasan Pelanggan & Koleksi Simpan",
    subtitle: "Memantau rating ulasan pembeli dan menyimpan daftar toko favorit Anda.",
    steps: [
      {
        img: imgDashUlasan,
        title: "Langkah 1: Kelola Ulasan & Rating Bintang di Tab 'Ulasan'",
        desc: "Lihat ulasan dan tanggapan bintang yang diberikan oleh pembeli pada tempat usaha Anda di tab 'Ulasan'."
      },
      {
        img: imgDashSimpan,
        title: "Langkah 2: Akses Daftar Simpanan di Tab 'Simpan'",
        desc: "Buka tab 'Simpan' untuk melihat daftar toko dan artikel blog yang pernah Anda bookmark agar mudah diakses kembali kapan saja."
      }
    ]
  },
  {
    id: "blog-smartcity-cs",
    icon: <Building2 size={22} className="text-[#059669]" />,
    number: "15",
    roleBadge: "Pengaturan & Bantuan",
    title: "15. Blog Event, Smart City 12 Desa & Bantuan CS",
    subtitle: "Pengelolaan postingan artikel blog, profil 12 desa, pengaturan akun pengguna, dan layanan bantuan CS.",
    steps: [
      {
        img: imgDashBlog,
        title: "Langkah 1: Tulis Artikel & Agenda di Tab 'Blog & Event'",
        desc: "Buka tab 'Blog & Event' di dashboard untuk mempublikasikan kabar promo toko, berita UMKM, atau informasi event daerah."
      },
      {
        img: imgSmartCity,
        title: "Langkah 2: Jelajahi Peta & Potensi 12 Desa Smart City",
        desc: "Akses menu Smart City untuk melihat peta wilayah, batas desa, serta potensi produk unggulan di 12 desa/kelurahan Kecamatan Surade."
      },
      {
        img: imgDashProfil,
        title: "Langkah 3: Pengaturan Profil Pengguna & Kata Sandi",
        desc: "Buka tab 'Profil' untuk memperbarui foto avatar Anda, nama tampilan, nomor telepon WhatsApp, dan memperbarui kata sandi akun."
      },
      {
        img: imgHubungiCs,
        title: "Langkah 4: Hubungi Layanan Bantuan CS 24/7",
        desc: "Jika Anda membutuhkan bantuan teknis pendaftaran toko atau paket premium, hubungi tim CS via form kontak atau WhatsApp resmi 24 jam."
      }
    ]
  }
];

export default function Panduan() {
  const [activeSection, setActiveSection] = useState(guideSections[0].id);
  const [lightbox, setLightbox] = useState(null); // { img, title, desc }
  const [zoomScale, setZoomScale] = useState(1);
  const sectionRefs = useRef({});

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.title = "Panduan Penggunaan Platform & Fitur Dashboard — Surade.co.id";
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setZoomScale(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="terms-page panduan-page-custom">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero__bg" />
        <div className="terms-hero__overlay" />
        <div className="terms-hero__content">
          <div className="terms-hero__breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="separator">/</span>
            <span>Panduan Penggunaan &amp; Dashboard</span>
          </div>
          <h1 className="terms-hero__title">Panduan Penggunaan &amp; Fitur Dashboard</h1>
          <p className="terms-hero__subtitle">
            Tata cara lengkap dari Halaman Utama, Pendaftaran Akun, hingga Seluruh Fitur Pengelolaan Usaha &amp; Modul Dashboard Surade.co.id
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="terms-content">
        <div className="terms-layout">
          {/* STICKY SIDEBAR (DAFTAR ISI 1, 2, 3...) */}
          <aside className="terms-sidebar">
            <div className="terms-sidebar__title">
              <Compass size={18} className="text-[#059669]" />
              <span>Daftar Isi Panduan</span>
            </div>
            <nav className="terms-nav-list">
              {guideSections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className={`terms-nav-link ${activeSection === sec.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(sec.id);
                    const el = document.getElementById(sec.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="panduan-nav-num">{sec.number}.</span>
                  <span>{sec.title.replace(/^\d+\.\s*/, "")}</span>
                </a>
              ))}
            </nav>

            <div className="panduan-sidebar-support">
              <div className="panduan-support-title">Perlu Bantuan CS?</div>
              <p className="panduan-support-desc">Tim kami siap membantu Anda 24/7 via WhatsApp.</p>
              <a
                href="https://wa.me/628111919711?text=Halo%20Admin%20Surade.co.id,%20saya%20butuh%20panduan..."
                target="_blank"
                rel="noopener noreferrer"
                className="panduan-support-btn"
              >
                <Phone size={14} />
                <span>Chat Admin WhatsApp</span>
              </a>
            </div>
          </aside>

          {/* MAIN PANDUAN ARTICLES */}
          <article className="terms-main">
            {guideSections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="terms-section panduan-article-section"
                ref={(el) => (sectionRefs.current[sec.id] = el)}
              >
                {/* Section Header */}
                <div className="terms-section__header">
                  <div className="terms-section__icon">
                    {sec.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="panduan-sec-badge">{sec.number}</span>
                      <span className="panduan-role-pill">{sec.roleBadge}</span>
                    </div>
                    <h2 className="terms-section__title">{sec.title}</h2>
                  </div>
                </div>

                <div className="terms-section__text">
                  <p className="panduan-sec-subtitle">{sec.subtitle}</p>

                  {/* Step Cards Grid with Distinct Screenshots */}
                  <div className={`panduan-steps-grid ${sec.steps.length === 1 ? "single-card" : ""}`}>
                    {sec.steps.map((step, sIdx) => (
                      <div key={sIdx} className="panduan-step-card">
                        <div className="panduan-step-card__img-wrap" onClick={() => setLightbox(step)}>
                          <img src={step.img} alt={step.title} className="panduan-step-card__img" loading="lazy" />
                          <div className="panduan-step-card__zoom-hint">
                            <ZoomIn size={16} />
                            <span>Klik untuk memperbesar foto</span>
                          </div>
                        </div>
                        <div className="panduan-step-card__content">
                          <h3 className="panduan-step-card__title">{step.title}</h3>
                          <p className="panduan-step-card__desc">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Optional Callout Note */}
                  {sec.callout && (
                    <div
                      className="terms-callout panduan-callout"
                      dangerouslySetInnerHTML={{ __html: sec.callout }}
                    />
                  )}
                </div>
              </section>
            ))}
          </article>
        </div>
      </main>

      {/* LIGHTBOX MODAL FOR SCREENSHOTS */}
      {lightbox && (
        <div className="panduan-lightbox-backdrop" onClick={() => { setLightbox(null); setZoomScale(1); }}>
          <div className="panduan-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="panduan-lightbox-close"
              onClick={() => { setLightbox(null); setZoomScale(1); }}
              aria-label="Tutup"
            >
              <X size={22} />
            </button>
            <div className="panduan-lightbox-img-box">
              <img
                src={lightbox.img}
                alt={lightbox.title}
                className="panduan-lightbox-img"
                style={{ transform: `scale(${zoomScale})` }}
              />
            </div>
            <div className="panduan-lightbox-caption">
              <h4>{lightbox.title}</h4>
              <p>{lightbox.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
