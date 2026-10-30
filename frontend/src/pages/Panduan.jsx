// Updated Cara Penggunaan - Surade.com (v2.1)
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import coastBg from "../assets/surade-coast.jpg";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
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
  X,
  ZoomIn,
  Gift,
  Layers,
  Sparkles,
  Package,
  MessageSquare,
  Star,
  CheckCircle,
  TrendingUp,
  Phone,
  ArrowRight,
  ChevronRight,
  ArrowUp,
  Coins,
  UserCheck,
  Heart,
  MessageCircle,
  Smartphone
} from "lucide-react";
import "./Panduan.css";

import coinImg from "../assets/surade-coin.png";
import imgCoinTabBalance from "../assets/panduan/panduan_m4_step2_coinbalance.png";
import imgCoinTabBuyModal from "../assets/panduan/panduan_m4_step4_buycoin.png";

// Dedicated Authentic Step-by-Step Screenshots for Modules
import imgM1Step1 from "../assets/panduan/panduan_m1_step1_search.png";
import imgM1Step2 from "../assets/panduan/panduan_m1_step2_quickcats.png";
import imgM1Step3 from "../assets/panduan/panduan_m1_step3_featured.png";

import imgM2Step1 from "../assets/panduan/panduan_m2_step1_catgrid.png";
import imgM2Step2 from "../assets/panduan/panduan_m2_step2_villagedropdown.png";
import imgM2Step3 from "../assets/panduan/panduan_m2_step3_sorting.png";

import imgM3Step1 from "../assets/panduan/panduan_m3_step1_header.png";
import imgM3Step2 from "../assets/panduan/panduan_m3_step2_products.png";
import imgM3Step3 from "../assets/panduan/panduan_m3_step3_whatsapp.png";
import imgM3Step4 from "../assets/panduan/panduan_m3_step4_maps.png";

import imgM4Step1 from "../assets/panduan/panduan_m4_step1_registerform.png";
import imgM4Step2 from "../assets/panduan/panduan_m4_step2_passwordterms.png";
import imgM4Step3 from "../assets/panduan/panduan_m4_step3_emailotp.png";
import imgM4Step4 from "../assets/panduan/panduan_m4_step4_verified.png";

import imgM5Step1 from "../assets/panduan/panduan_m5_step1_login.png";
import imgM5Step2 from "../assets/panduan/panduan_m5_step2_forgotpass.png";
import imgM5Step3 from "../assets/panduan/panduan_m5_step3_dashnav.png";

import imgM6Step1 from "../assets/panduan/panduan_m6_step1_metrics.png";
import imgM6Step2 from "../assets/panduan/panduan_m6_step2_chart.png";
import imgM6Step3 from "../assets/panduan/panduan_m6_step3_banner.png";

import imgM7Step1 from "../assets/panduan/panduan_m7_step1_bizlist.png";
import imgM7Step2 from "../assets/panduan/panduan_m7_step2_form.png";
import imgM7Step3 from "../assets/panduan/panduan_m7_step3_mappin.png";
import imgM7Step4 from "../assets/panduan/panduan_m7_step4_activelist.png";

import imgM8Step1 from "../assets/panduan/panduan_m8_step1_editbtn.png";
import imgM8Step2 from "../assets/panduan/panduan_m8_step2_schedule.png";
import imgM8Step3 from "../assets/panduan/panduan_m8_step3_closeddays.png";
import imgM8Step4 from "../assets/panduan/panduan_m8_step4_statusbadge.png";

import imgM9Step1 from "../assets/panduan/panduan_m9_step1_prodtab.png";
import imgM9Step2 from "../assets/panduan/panduan_m9_step2_photo.png";
import imgM9Step3 from "../assets/panduan/panduan_m9_step3_priceform.png";
import imgM9Step4 from "../assets/panduan/panduan_m9_step4_prodlist.png";

import imgM10Step1 from "../assets/panduan/panduan_m10_step1_plans.png";
import imgM10Step2 from "../assets/panduan/panduan_m10_step2_coupon.png";
import imgM10Step3 from "../assets/panduan/panduan_m10_step3_qris.png";
import imgM10Step4 from "../assets/panduan/panduan_m10_step4_goldbadge.png";

import imgM11Step1 from "../assets/panduan/panduan_m11_step1_chatlist.png";
import imgM11Step2 from "../assets/panduan/panduan_m11_step2_chatview.png";
import imgM11Step3 from "../assets/panduan/panduan_m11_step3_replybox.png";

import imgM12Step1 from "../assets/panduan/panduan_m12_step1_adstab.png";
import imgM12Step2 from "../assets/panduan/panduan_m12_step2_slots.png";
import imgM12Step3 from "../assets/panduan/panduan_m12_step3_upload.png";
import imgM12Step4 from "../assets/panduan/panduan_m12_step4_stats.png";

import imgM13Step1 from "../assets/panduan/panduan_m13_step1_reflink.png";
import imgM13Step2 from "../assets/panduan/panduan_m13_step2_qrcode.png";
import imgM13Step3 from "../assets/panduan/panduan_m13_step3_balance.png";
import imgM13Step4 from "../assets/panduan/panduan_m13_step4_withdraw.png";

import imgM14Step1 from "../assets/panduan/panduan_m14_step1_reviews.png";
import imgM14Step2 from "../assets/panduan/panduan_m14_step2_reply.png";
import imgM14Step3 from "../assets/panduan/panduan_m14_step3_saved.png";

import imgM15Step1 from "../assets/panduan/panduan_m15_step1_blog.png";
import imgM15Step2 from "../assets/panduan/panduan_m15_step2_smartcity.png";
import imgM15Step3 from "../assets/panduan/panduan_m15_step3_profile.png";
import imgM15Step4 from "../assets/panduan/panduan_m15_step4_cs.png";

import waAvatarImg from "../assets/wa-cs-avatar.jpg";

import imgM16Step2 from "../assets/panduan/panduan_m16_step2_navbar.png";
import imgM16Step3 from "../assets/panduan/panduan_m16_step3_contact.png";
import imgM16Step4 from "../assets/panduan/panduan_m16_step4_form.png";

const guideSections = [
  {
    id: "beranda-pencarian",
    icon: Home,
    number: "1",
    roleBadge: "Eksplorasi Publik",
    title: "1. Beranda Utama & Pencarian Pintar (Smart Search)",
    subtitle: "Panduan lengkap menemukan profil usaha, toko, kuliner, bengkel, dan aneka penyedia jasa terverifikasi di seluruh Kecamatan Surade.",
    actionLink: { to: "/", label: "Buka Halaman Beranda", icon: Home },
    description: "Halaman Beranda Surade.com dirancang dengan sistem pencarian pintar real-time untuk memudahkan masyarakat lokal dan wisatawan menemukan produk, toko, dan layanan jasa sehari-hari dalam satu kali klik tanpa perlu memuat ulang halaman.",
    steps: [
      {
        img: imgM1Step1,
        title: "Langkah 1: Gunakan Bilah Pencarian & Dropdown Kategori di Hero Beranda",
        desc: "Ketik kata kunci kebutuhan Anda atau klik kolom pencarian utama untuk memilih kategori bisnis langsung dari dropdown 'Cari Berdasarkan Kategori' (seperti Jasa, Kuliner, Retail, Kesehatan, Pendidikan, Otomotif, Properti, Teknologi, Hiburan)."
      },
      {
        img: imgM1Step2,
        title: "Langkah 2: Navigasi Menu Informasi & Sub-Kategori Bisnis",
        desc: "Arahkan kursor atau ketuk menu 'Informasi' pada bilah navigasi atas (Navbar) untuk membuka daftar lengkap Kategori Bisnis & Jasa beserta Sub-Kategori spesifik (seperti Laundry, Salon, Cuci Motor/Mobil, Bengkel, Tukang Bangunan, dll)."
      },
      {
        img: imgM1Step3,
        title: "Langkah 3: Eksplorasi Bagian 'Usaha Populer di Surade'",
        desc: "Gulir ke bawah pada beranda untuk melihat daftar rekomendasi Usaha Populer di Surade yang memiliki rating tinggi, status terverifikasi, label mitra, serta informasi lokasi desa secara lengkap."
      }
    ],
    highlights: [
      "Pencarian instan berbasis kata kunci toko, produk, komoditas, dan wilayah desa.",
      "Menampilkan label status toko (Buka Sekarang / Tutup) secara real-time.",
      "Akses cepat ke etalase toko berlabel Centang Emas (Verified Merchant).",
      "Responsif dan sangat ringan diakses dari komputer maupun smartphone."
    ],
    callout: "💡 <strong>Tips Pencarian Efektif:</strong> Anda dapat mengetikkan kata kunci spesifik seperti <em>'kue ulang tahun'</em>, <em>'catering prasmanan'</em>, atau <em>'tambal ban 24 jam'</em> untuk menemukan UMKM terdekat di sekitar tempat tinggal Anda."
  },
  {
    id: "kategori-desa",
    icon: Layers,
    number: "2",
    roleBadge: "Direktori & Wilayah",
    title: "2. 9 Kategori Bisnis & Jasa serta Filter 12 Desa/Kelurahan",
    subtitle: "Cara menelusuri direktori bisnis berdasarkan 9 sektor industri utama dan menyaring lokasi spesifik di 12 desa/kelurahan Kecamatan Surade.",
    actionLink: { to: "/category/all", label: "Jelajahi Direktori 9 Kategori", icon: Layers },
    description: "Surade.com mengelompokkan unit usaha lokal ke dalam 9 sektor industri utama serta membaginya ke dalam 12 wilayah administratif desa untuk memudahkan pembeli menemukan produk dan jasa terdekat.",
    steps: [
      {
        img: imgM2Step1,
        title: "Langkah 1: Pilih dari 9 Kategori Bisnis & Jasa Utama",
        desc: "Di halaman direktori, pilih salah satu kategori utama: (1) Jasa, (2) Kuliner, (3) Retail, (4) Kesehatan, (5) Pendidikan, (6) Otomotif, (7) Properti, (8) Teknologi, atau (9) Hiburan."
      },
      {
        img: imgM2Step2,
        title: "Langkah 2: Terapkan Filter Berdasarkan 12 Desa/Kelurahan",
        desc: "Buka dropdown 'Lokasi Desa' untuk menyaring wilayah: Kelurahan Surade, Desa Buniwangi, Cipeundeuy, Citanglar, Kadaleman, Sukatani, Pasiripis, Gunungbatu, Jagamukti, Kertajaya, Sirnasari, atau Wanasari."
      },
      {
        img: imgM2Step3,
        title: "Langkah 3: Atur Opsi Pengurutan (Sort Order)",
        desc: "Gunakan tombol pengurutan untuk menyaring daftar UMKM berdasarkan 'Rating Tertinggi', 'Terbaru', 'Nama A-Z', atau 'Nama Z-A'."
      }
    ],
    highlights: [
      "9 kategori utama lengkap dengan subkategori spesifik.",
      "Filter presisi 12 desa/kelurahan se-Kecamatan Surade.",
      "Opsi pengurutan rating bintang dan tanggal pendaftaran.",
      "Menampilkan jumlah total bisnis aktif di setiap kategori."
    ],
    callout: "📍 <strong>Navigasi Wilayah:</strong> Memilih filter desa yang sama dengan lokasi Anda akan menghemat biaya pengiriman dan memudahkan belanja langsung."
  },
  {
    id: "detail-kontak",
    icon: Phone,
    number: "3",
    roleBadge: "Interaksi WhatsApp & Transaksi",
    title: "3. Cara Mengakses WhatsApp Penjual (Gratis untuk Usaha Premium & 5 Surade Poin untuk Usaha Free)",
    subtitle: "Panduan mengakses nomor WhatsApp resmi toko: gratis untuk usaha berstatus Premium (Centang Emas), dan cara membuka kontak usaha Free dengan 5 Surade Poin.",
    actionLink: { to: "/category/all", label: "Cari Profil Toko & UMKM", icon: Store },
    description: "Setiap tempat usaha di Surade.co.id terhubung langsung dengan nomor WhatsApp pemiliknya. Untuk usaha berstatus Premium, pengunjung bisa mengakses nomor WhatsApp 100% gratis dan langsung tanpa memotong Surade Poin. Untuk usaha berstatus Free, akses nomor WhatsApp membutuhkan 5 Surade Poin, dan nomor yang sudah dibuka tersimpan permanen di akun Anda.",
    steps: [
      {
        img: imgM3Step1,
        title: "Langkah 1: Buka Halaman Profil Toko atau Detail Produk",
        desc: "Pilih toko atau produk yang ingin Anda tuju. Periksa status operasional toko (Buka atau Tutup), lencana status (Premium atau Free), lokasi desa, katalog barang dagangan, serta jam operasional."
      },
      {
        img: imgM3Step3,
        title: "Langkah 2: Klik Tombol “WhatsApp”",
        desc: "Di menu profil usaha, klik tombol WhatsApp (seperti yang ditandai panah dan kotak merah). Jika usaha berstatus Premium (Centang Emas atau Iklan Premium), chat WhatsApp langsung terbuka secara 100% gratis tanpa memotong poin. Jika usaha berstatus Free, akan muncul jendela konfirmasi untuk membuka kontak dengan 5 Surade Poin atau transfer bank."
      },
      {
        img: imgM3Step2,
        title: "Langkah 3: Konfirmasi Penggunaan 5 Surade Poin atau Transfer Bank untuk Usaha Free",
        desc: "Khusus usaha Free, Anda dapat membuka kontak langsung menggunakan 5 Surade Poin atau bisa juga menggunakan metode pembayaran Transfer Bank / QRIS. Setelah konfirmasi, muncul jendela sukses “Akses WhatsApp Berhasil Dibuka!” dan tombol berubah menjadi “Lanjut ke WhatsApp”. Nomor kontak yang sudah dibuka tersimpan permanen di akun Anda, jadi Anda tidak perlu membayar lagi di kemudian hari."
      },
      {
        img: imgM3Step4,
        title: "Langkah 4: Chat Langsung dengan Pesan Otomatis",
        desc: "Aplikasi WhatsApp akan terbuka otomatis dengan template pesan ramah yang memuat nama toko dan kebutuhan Anda."
      }
    ],
    highlights: [
      "Akses WhatsApp gratis dan langsung untuk semua usaha berstatus Premium.",
      "Akses WhatsApp usaha Free membutuhkan 5 Surade Poin, dan nomornya tersimpan permanen.",
      "Transaksi 100% langsung antara pembeli dan penjual, tanpa komisi perantara.",
      "Pesan pembuka otomatis memudahkan Anda menanyakan stok, harga, atau layanan antar."
    ],
    callout: "📱 <strong>Akses Mudah & Transparan:</strong> Tempat usaha Premium memberikan akses WhatsApp gratis dan langsung untuk pengunjung, sedangkan kontak usaha Free bisa dibuka dengan mudah menggunakan bonus poin harian Anda."
  },
  {
    id: "surade-poin-koin",
    icon: Coins,
    number: "4",
    roleBadge: "Sistem Reward & Surade Coin",
    title: "4. Sistem Surade Coin & Koin Reward (Dapatkan Koin Gratis, Cek Saldo & Buka Fitur)",
    subtitle: "Panduan lengkap mengumpulkan koin gratis harian, bonus pendaftaran dan referral, mengecek saldo koin di dashboard, dan cara menggunakan koin di platform.",
    actionLink: { to: "/dashboard/surade-coin", label: "Cek Saldo Surade Coin", icon: Coins, gold: true },
    description: "Surade Coin adalah sistem koin loyalti interaktif yang diberikan gratis kepada pengguna aktif Surade.co.id. Koin dipakai untuk membuka nomor kontak WhatsApp usaha berstatus Free dan menikmati penawaran promo menarik.",
    steps: [
      {
        img: imgCoinTabBalance,
        title: "Langkah 1: Buka Tab “Surade Coin” di Dashboard untuk Cek Saldo & Mutasi",
        desc: "Masuk ke Dashboard akun Anda dan pilih menu Surade Coin (atau klik badge saldo poin di pojok kanan atas). Di sini Anda dapat memantau saldo koin aktif, riwayat koin masuk dan keluar, serta tombol Klaim Koin Harian yang bisa diambil setiap 24 jam sekali."
      },
      {
        img: imgCoinTabBuyModal,
        title: "Langkah 2: Beli Paket Poin Tambahan Instan via QRIS / Transfer Bank",
        desc: "Jika Anda butuh saldo poin lebih banyak untuk membuka banyak kontak usaha dan layanan promosi lainnya, Anda bisa membeli paket poin dengan klik tombol '+ Beli Poin' lalu selesaikan pembayaran instan lewat QRIS atau transfer bank di tab Surade Coin."
      }
    ],
    highlights: [
      "Klaim koin gratis harian (Daily Streak) setiap hari di dashboard akun.",
      "Dapatkan bonus koin instan saat mendaftar akun baru dan mengundang rekan lewat kode referral.",
      "Gunakan koin untuk membuka akses kontak WhatsApp usaha Free dengan aman dan permanen.",
      "Riwayat transaksi koin tercatat transparan di tabel mutasi saldo dompet."
    ],
    callout: `<img src="${coinImg}" alt="Surade Coin" class="panduan-coin-callout-icon" /> <strong>Ayo Top Up Sekarang:</strong> Segera isi ulang saldo koin Surade Anda dengan mudah melalui pembayaran instan QRIS atau transfer bank untuk membuka banyak kontak usaha dan menikmati layanan promosi lainnya!`
  },
  {
    id: "pendaftaran-otp",
    icon: UserPlus,
    number: "5",
    roleBadge: "Pendaftaran Akun",
    title: "5. Pendaftaran Akun Baru (Register) & Verifikasi Keamanan OTP 6-Digit",
    subtitle: "Panduan langkah demi langkah membuat akun resmi Surade.com dan verifikasi kode keamanan OTP 6-digit via email.",
    actionLink: { to: "/register", label: "Daftar Akun Baru Sekarang", icon: UserPlus, primary: true },
    description: "Mendaftarkan akun di Surade.com memberikan hak akses penuh untuk mempublikasikan tempat usaha, mengunggah katalog produk tanpa batas, mengumpulkan ulasan pelanggan, memasang iklan, dan mengakses seluruh modul dashboard penjual.",
    steps: [
      {
        img: imgM4Step1,
        title: "Langkah 1: Akses Menu 'Daftar' & Isi Formulir Identitas",
        desc: "Klik tombol 'Daftar' di pojok kanan atas navbar. Masukkan Nama Lengkap sesuai identitas Anda, Alamat Email aktif (Gmail/Yahoo) yang dapat menerima pesan, dan pilih Jenis Kelamin (Laki-laki / Perempuan)."
      },
      {
        img: imgM4Step2,
        title: "Langkah 2: Buat Kata Sandi yang Kuat & Konfirmasi",
        desc: "Buat Kata Sandi yang aman minimal 8 karakter (kombinasi huruf besar, huruf kecil, dan angka), lalu ketik ulang di kolom Konfirmasi Kata Sandi. Centang persetujuan Syarat & Ketentuan, kemudian klik tombol hijau 'Daftar Sekarang'."
      },
      {
        img: imgM4Step3,
        title: "Langkah 3: Buka Inbox Email & Salin Kode OTP 6-Digit",
        desc: "Buka aplikasi Gmail atau email Anda. Temukan pesan masuk dari 'Surade.com - Verifikasi Akun'. Di dalam email tersebut tertera 6 digit kode angka unik OTP (contoh: 849201)."
      },
      {
        img: imgM4Step4,
        title: "Langkah 4: Masukkan Kode OTP & Konfirmasi Aktivasi",
        desc: "Ketik 6 digit angka OTP pada jendela popup verifikasi di layar, lalu klik tombol 'Verifikasi Akun'. Setelah terverifikasi, akun Anda langsung aktif dan siap digunakan untuk mengelola bisnis."
      }
    ],
    highlights: [
      "Pendaftaran akun 100% GRATIS selamanya tanpa pungutan biaya.",
      "Perlindungan verifikasi OTP email melindungi akun dari bot dan spam.",
      "Tersedia tombol 'Kirim Ulang Kode' jika email belum tiba setelah 60 detik.",
      "Masa aktif kode OTP berlaku selama 10 menit untuk keamanan maksimal."
    ],
    callout: "🔒 <strong>Penting:</strong> Jangan pernah membagikan kode OTP kepada siapa pun termasuk pihak yang mengatasnamakan admin Surade.com demi menjaga kerahasiaan akun Anda."
  },
  {
    id: "login-pengantar",
    icon: LogIn,
    number: "6",
    roleBadge: "Akses Akun",
    title: "6. Masuk Akun (Login), Reset Sandi & Pengantar Dashboard Penjual",
    subtitle: "Cara login aman ke akun Surade.com, pemulihan lupa kata sandi, dan mengenal tata letak navigasi portal manajemen usaha.",
    actionLink: { to: "/login", label: "Masuk ke Akun (Login)", icon: LogIn, primary: true },
    description: "Setelah akun Anda aktif terverifikasi, Anda dapat melakukan login kapan saja dari berbagai perangkat (komputer desktop, laptop, tablet, maupun smartphone) untuk mengelola operasional bisnis Anda.",
    steps: [
      {
        img: imgM5Step1,
        title: "Langkah 1: Masukkan Alamat Email & Kata Sandi Terdaftar",
        desc: "Buka halaman '/login' atau klik tombol 'Masuk' di navbar. Masukkan alamat email dan kata sandi yang Anda buat saat pendaftaran, lalu klik tombol hijau 'Masuk ke Akun'."
      },
      {
        img: imgM5Step2,
        title: "Langkah 2: Gunakan Fitur 'Lupa Kata Sandi' Jika Mengalami Kendala",
        desc: "Jika Anda lupa password, klik tautan 'Lupa kata sandi?' di bawah kolom input. Masukkan email terdaftar Anda, lalu ikuti panduan pengaturan ulang kata sandi baru melalui kode OTP email."
      },
      {
        img: imgM5Step3,
        title: "Langkah 3: Masuk ke Ruang Dashboard Penjual",
        desc: "Setelah berhasil login, Anda akan otomatis dialihkan ke Dashboard Penjual. Di sisi samping (sidebar) terdapat menu lengkap: Overview, Bisnis, Produk, Premium, Iklan, Inbox, Referral, Ulasan, Simpan, Blog, Surade Coin, dan Profil."
      }
    ],
    highlights: [
      "Sesi login tersimpan aman dengan enkripsi token JWT modern.",
      "Fitur Lupa Password otomatis dengan verifikasi instan via email.",
      "Bilah navigasi samping yang memudahkan berpindah antar modul pengelolaan usaha."
    ]
  },
  {
    id: "dashboard-overview",
    icon: TrendingUp,
    number: "7",
    roleBadge: "Fitur Dashboard",
    title: "7. Dashboard Overview, Metrik Statistik & Analitik Kunjungan Real-Time",
    subtitle: "Pusat pemantauan statistik penayangan toko, grafik pengunjung harian/mingguan, notifikasi pesan baru, dan ringkasan performa usaha Anda.",
    actionLink: { to: "/dashboard", label: "Buka Dashboard Saya", icon: LayoutDashboard },
    description: "Dashboard Penjual menyediakan data analitik komprehensif agar pelaku UMKM dapat memahami performa penayangan etalase bisnis mereka secara real-time dan mengambil keputusan pemasaran yang tepat.",
    steps: [
      {
        img: imgM6Step1,
        title: "Langkah 1: Pantau 4 Kartu Metrik Statistik Utama",
        desc: "Pada bagian atas halaman Dashboard Overview, perhatikan 4 kartu ringkasan: (1) Total Views Toko (jumlah penayangan profil Anda oleh pengunjung), (2) Total Tempat Usaha Aktif, (3) Total Katalog Produk yang diunggah, dan (4) Rata-rata Rating Bintang dari ulasan pembeli."
      },
      {
        img: imgM6Step2,
        title: "Langkah 2: Analisis Grafik Tren Kunjungan Harian & Mingguan",
        desc: "Periksa grafik visual batang dan garis interaktif di bagian tengah dashboard. Grafik ini menunjukkan dinamika lonjakan pengunjung pada hari-hari tertentu sehingga Anda tahu kapan promosi paling ramai dikunjungi."
      },
      {
        img: imgM6Step3,
        title: "Langkah 3: Tanggapi Banner Status & Penawaran Fitur",
        desc: "Di bagian atas dashboard terdapat banner informatif yang mengingatkan status verifikasi bisnis Anda, tawaran peningkatan ke Centang Emas, serta ringkasan aktivitas terbaru."
      }
    ],
    highlights: [
      "4 kartu indikator performa utama dengan kalkulasi data real-time.",
      "Grafik visual tren kunjungan harian dan mingguan yang interaktif.",
      "Notifikasi langsung saat ada pesan masuk atau ulasan baru dari pembeli.",
      "Akses cepat ke tombol '+ Tambah Bisnis' dan '+ Tambah Produk'."
    ],
    callout: "📊 <strong>Analitik Bisnis:</strong> Memantau kenaikan traffic penayangan toko membantu Anda mengukur efektivitas postingan produk baru dan promosi di media sosial."
  },
  {
    id: "tambah-kelola-bisnis",
    icon: Building2,
    number: "8",
    roleBadge: "Fitur Dashboard",
    title: "8. Pendaftaran Tempat Usaha Baru (+ Tambah Bisnis) & Penentuan Titik Koordinat Peta",
    subtitle: "Tata cara lengkap mendaftarkan unit usaha, toko fisik, bengkel, warung kuliner, atau jasa rumahan baru ke dalam direktori resmi beserta pin peta GPS.",
    actionLink: { to: "/dashboard/bisnis", label: "Tambah & Kelola Usaha", icon: Building2, primary: true },
    description: "Satu akun terdaftar di Surade.com dapat memiliki dan mengelola lebih dari satu tempat usaha (misalnya: Anda memiliki toko sembako sekaligus penyewaan tenda atau bengkel motor).",
    steps: [
      {
        img: imgM7Step1,
        title: "Langkah 1: Buka Tab 'Bisnis' & Klik Tombol '+ Tambah Bisnis'",
        desc: "Di dashboard, klik tab 'Bisnis' pada menu navigasi samping, kemudian klik tombol hijau '+ Tambah Bisnis' di pojok kanan atas untuk membuka formulir pendaftaran tempat usaha baru."
      },
      {
        img: imgM7Step2,
        title: "Langkah 2: Lengkapi Data Profil & Kontak Tempat Usaha",
        desc: "Isi kolom: Nama Tempat Usaha, pilih Kategori Sektor dan Subkategori yang relevan, pilih Wilayah Desa/Kelurahan (12 Desa di Surade), masukkan Nomor WhatsApp yang aktif menerima pesanan (format: 08xx / 628xx), Alamat Jalan Lengkap, dan Deskripsi Menarik tentang keunggulan usaha Anda."
      },
      {
        img: imgM7Step3,
        title: "Langkah 3: Tentukan Titik Pin Google Maps & Unggah Foto Utama",
        desc: "Geser penanda pin pada peta interaktif ke lokasi fisik toko Anda agar pembeli dapat menemukan rute GPS yang akurat. Unggah foto tampak depan tempat usaha atau banner logo terbaik Anda (format JPG/PNG)."
      },
      {
        img: imgM7Step4,
        title: "Langkah 4: Simpan Data Usaha & Pantau Listing di Tab Bisnis",
        desc: "Klik tombol 'Simpan Bisnis'. Tempat usaha Anda akan langsung terdaftar di sistem dengan status 'Aktif' dan kartu usaha Anda akan muncul di tab Bisnis lengkap dengan tombol 'Edit', 'Atur Jam Buka', dan 'Hapus'."
      }
    ],
    highlights: [
      "Dukungan multi-bisnis (kelola banyak usaha dalam 1 akun).",
      "Penentuan koordinat lintang & bujur otomatis terintegrasi Google Maps.",
      "Formulir profil lengkap dengan nomor WhatsApp, deskripsi, dan foto utama.",
      "Listing langsung aktif dan dapat dicari oleh seluruh pengguna portal."
    ]
  },
  {
    id: "jam-operasional",
    icon: Store,
    number: "9",
    roleBadge: "Fitur Dashboard",
    title: "9. Pengaturan Jam Operasional Mingguan & Status Buka-Tutup Otomatis",
    subtitle: "Menyesuaikan jam kerja harian agar status 'Buka Sekarang' atau 'Tutup' tampil secara akurat di etalase publik.",
    actionLink: { to: "/dashboard/bisnis", label: "Atur Jam Operasional", icon: Store },
    description: "Fitur Jam Operasional membantu calon pembeli mengetahui secara pasti apakah toko Anda sedang melayani pesanan saat ini, sehingga mencegah kekecewaan pelanggan yang datang saat toko sedang tutup.",
    steps: [
      {
        img: imgM8Step1,
        title: "Langkah 1: Buka Formulir Edit Usaha & Masuk ke Bagian 'Jam Operasional'",
        desc: "Pada tab 'Bisnis' di dashboard, klik tombol 'Edit' pada kartu usaha yang ingin Anda atur jadwalnya, lalu gulir ke bagian formulir Jam Operasional Mingguan."
      },
      {
        img: imgM8Step2,
        title: "Langkah 2: Tentukan Jam Buka & Jam Tutup dari Senin hingga Minggu",
        desc: "Masukkan waktu mulai buka (contoh: 08:00) dan waktu selesai tutup (contoh: 21:00) untuk setiap hari kerja dari Senin sampai Minggu sesuai dengan rutinitas operasional toko Anda."
      },
      {
        img: imgM8Step3,
        title: "Langkah 3: Tetapkan Hari Libur / Tutup Toko",
        desc: "Jika toko Anda libur pada hari tertentu (misalnya hari Minggu atau hari Jumat), centang opsi 'Tutup' pada baris hari tersebut agar calon pembeli mengetahui toko sedang istirahat."
      },
      {
        img: imgM8Step4,
        title: "Langkah 4: Simpan Jadwal & Sistem Otomatis Mengupdate Status",
        desc: "Klik tombol 'Simpan Perubahan'. Sistem Surade.com akan secara otomatis menghitung waktu lokal WIB dan menampilkan badge hijau 'Buka Sekarang' atau badge merah 'Tutup' di halaman publik profil toko Anda."
      }
    ],
    highlights: [
      "Pengaturan fleksibel untuk setiap hari (Senin s/d Minggu).",
      "Kalkulasi otomatis real-time berdasarkan waktu lokal Indonesia (WIB).",
      "Mencegah komplain pembeli yang datang di luar jam layanan.",
      "Dapat diperbarui sewaktu-waktu saat ada jadwal khusus libur hari raya."
    ]
  },
  {
    id: "katalog-produk",
    icon: Package,
    number: "10",
    roleBadge: "Fitur Dashboard",
    title: "10. Manajemen Katalog Produk, Menu Makanan & Daftar Harga Jasa",
    subtitle: "Menambahkan daftar barang dagangan, menu kuliner, atau paket tarif jasa dengan foto jernih dan harga transparan.",
    actionLink: { to: "/dashboard/produk", label: "Kelola Katalog Produk", icon: Package },
    description: "Katalog produk yang lengkap dan berfoto menarik memudahkan calon pembeli memilih produk yang mereka inginkan sebelum mengklik tombol WhatsApp untuk memesan.",
    steps: [
      {
        img: imgM9Step1,
        title: "Langkah 1: Buka Tab 'Produk' & Klik Tombol '+ Tambah Produk'",
        desc: "Klik menu 'Produk' pada bilah samping dashboard Anda, kemudian tekan tombol hijau '+ Tambah Produk' untuk membuka formulir penambahan barang atau menu baru."
      },
      {
        img: imgM9Step2,
        title: "Langkah 2: Pilih Tempat Usaha & Unggah Foto Produk Berkualitas",
        desc: "Pilih unit bisnis mana yang menjual barang ini, lalu unggah file foto produk yang terang, bersih, dan jelas agar calon pembeli tertarik melihat etalase Anda."
      },
      {
        img: imgM9Step3,
        title: "Langkah 3: Isi Nama Barang, Kategori, Harga (Rp), & Deskripsi",
        desc: "Masukkan Nama Produk (misal: 'Kopi Robusta Asli Surade 250g'), pilih Kategori, ketikkan Harga Satuan dalam Rupiah (contoh: 35000), dan tulis deskripsi singkat mengenai bahan, ukuran, atau keunggulan produk."
      },
      {
        img: imgM9Step4,
        title: "Langkah 4: Kelola Daftar Produk, Ubah Harga, atau Hapus Item",
        desc: "Seluruh produk yang tersimpan akan tampil dalam tabel dan kartu di tab Produk. Anda dapat mengklik tombol 'Edit' untuk merubah harga saat ada diskon atau menghapus item yang sudah tidak dijual."
      }
    ],
    highlights: [
      "Unggah foto produk resolusi tinggi dengan kompresi otomatis cepat.",
      "Format harga Rupiah rapi dan otomatis.",
      "Katalog langsung terhubung dan tampil di halaman detail profil toko.",
      "Jumlah produk tidak dibatasi untuk mendukung seluruh lini dagangan Anda."
    ],
    callout: "📦 <strong>Fakta Penjualan:</strong> Profil toko yang mengunggah lebih dari 5 foto produk di katalognya mendapatkan tingkat interaksi chat WhatsApp 300% lebih tinggi dibandingkan toko tanpa katalog!"
  },
  {
    id: "upgrade-premium",
    icon: Crown,
    number: "11",
    roleBadge: "Fitur Dashboard",
    title: "11. Upgrade Bisnis ke Centang Emas Resmi & Pembayaran QRIS / Transfer",
    subtitle: "Panduan mengaktifkan lencana verifikasi Centang Emas, prioritas urutan teratas pencarian, tombol peta GPS, dan keistimewaan eksklusif.",
    actionLink: { to: "/dashboard/premium", label: "Lihat Paket Centang Emas", icon: Crown, gold: true },
    description: "Paket Centang Emas adalah program keanggotaan premium resmi Surade.com yang dirancang khusus untuk mendongkrak visibilitas, reputasi, dan omzet pelaku usaha lokal ke peringkat tertinggi.",
    steps: [
      {
        img: imgM10Step1,
        title: "Langkah 1: Buka Tab 'Premium' & Pilih Tempat Usaha Anda",
        desc: "Akses tab 'Premium' di dashboard atau buka halaman '/pricing'. Pilih nama unit bisnis yang ingin Anda tingkatkan statusnya ke Centang Emas Resmi."
      },
      {
        img: imgM10Step2,
        title: "Langkah 2: Tentukan Durasi Paket (Bulanan / Tahunan) & Masukkan Kupon",
        desc: "Pilih paket durasi yang diinginkan: Paket 1 Bulan atau Paket 1 Tahun (lebih hemat dengan diskon spesial). Masukkan kode kupon promo jika Anda memilikinya untuk mendapatkan potongan harga tambahan."
      },
      {
        img: imgM10Step3,
        title: "Langkah 3: Lakukan Pembayaran Instan via QRIS / Transfer Bank",
        desc: "Sistem akan menerbitkan invoice rincian tagihan beserta barcode QRIS resmi dan nomor rekening perbankan. Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau dompet digital (GoPay, OVO, DANA, ShopeePay) untuk scan QRIS."
      },
      {
        img: imgM10Step4,
        title: "Langkah 4: Unggah Bukti Transfer & Nikmati Lencana Centang Emas",
        desc: "Unggah foto/tangkapan layar struk pembayaran Anda. Tim admin akan melakukan verifikasi instan dan lencana Centang Emas (Verified Merchant) langsung aktif bersinar di profil toko serta posisi pencarian Anda diprioritaskan di urutan paling atas."
      }
    ],
    highlights: [
      "Lencana Centang Emas Resmi (Verified Merchant) di seluruh portal.",
      "Posisi toko dijamin tampil paling atas di hasil pencarian desa & kategori.",
      "Bebas dari penayangan iklan banner kompetitor di halaman profil Anda.",
      "Aktivasi tombol navigasi rute Google Maps langsung ke tempat usaha."
    ],
    callout: "⭐ <strong>Garansi Kepercayaan:</strong> Profil usaha bercentang emas mendapatkan tingkat kepercayaan pembeli lokal dan luar daerah hingga 98%, karena telah lolos verifikasi data resmi."
  },
  {
    id: "inbox-chat",
    icon: MessageSquare,
    number: "12",
    roleBadge: "Fitur Dashboard",
    title: "12. Inbox Pesan Masuk (Direct Chat) & Komunikasi Pelanggan Interaktif",
    subtitle: "Menerima dan membalas pesan pertanyaan produk dari calon pembeli langsung di dalam website tanpa biaya pulsa SMS.",
    actionLink: { to: "/dashboard/inbox", label: "Buka Pesan Masuk (Inbox)", icon: MessageSquare },
    description: "Fitur Inbox memungkinkan pengunjung website yang sedang berselancar di desktop atau smartphone mengirimkan pesan pertanyaan mengenai produk, stok, atau layanan langsung kepada pemilik toko.",
    steps: [
      {
        img: imgM11Step1,
        title: "Langkah 1: Pantau Notifikasi Pesan Masuk di Tab 'Pesan'",
        desc: "Buka tab 'Pesan' pada sidebar dashboard Anda. Jika ada pesan baru dari calon pembeli, akan muncul indikator lencana angka notifikasi yang menandakan pesan belum dibaca."
      },
      {
        img: imgM11Step2,
        title: "Langkah 2: Buka Percakapan & Baca Rincian Pertanyaan",
        desc: "Klik salah satu percakapan pada daftar inbox untuk melihat nama pengirim, alamat email/nomor kontak mereka, waktu pengiriman pesan, serta subjek pertanyaan produk yang diajukan."
      },
      {
        img: imgM11Step3,
        title: "Langkah 3: Ketik & Kirim Balasan Cepat ke Pelanggan",
        desc: "Gunakan kolom balasan di bagian bawah untuk mengetikkan jawaban informatif mengenai ketersediaan stok, harga grosir, atau waktu pengiriman, lalu klik tombol 'Kirim Pesan'."
      }
    ],
    highlights: [
      "Pusat notifikasi pesan terintegrasi di dalam dashboard.",
      "Riwayat percakapan tersimpan rapi berdasarkan kontak pelanggan.",
      "Dapat diakses 24 jam penuh dari komputer maupun smartphone.",
      "Mendukung komunikasi dua arah yang profesional."
    ]
  },
  {
    id: "iklan-banner",
    icon: Megaphone,
    number: "13",
    roleBadge: "Fitur Dashboard",
    title: "13. Pemasangan Iklan Promosi (Premium Hero Banner & Standard Ticker)",
    subtitle: "Panduan memasang iklan promosi bisnis di posisi strategis beranda portal, mulai dari pemilihan paket, metode pembayaran, hingga tayang aktif.",
    actionLink: { to: "/dashboard/iklan", label: "Pasang Iklan Promosi", icon: Megaphone },
    description: "Layanan Advertising Surade.com memberikan eksposur promosi maksimal kepada calon pelanggan melalui paket Premium Hero Carousel di posisi teratas dan Standard Running Ticker dengan biaya terjangkau.",
    steps: [
      {
        img: imgM12Step1,
        title: "Langkah 1: Masuk ke Tab 'Iklan' & Klik Tombol '+ Pasang Iklan Baru'",
        desc: "Buka menu 'Iklan' pada dashboard untuk melihat ringkasan status iklan (Total Iklan, Iklan Aktif, Menunggu Bayar, Menunggu Approval), lalu tekan tombol hijau '+ Pasang Iklan Baru'."
      },
      {
        img: imgM12Step2,
        title: "Langkah 2: Pilih Paket & Penempatan Iklan (Placement)",
        desc: "Pilih opsi paket iklan yang diinginkan: Standard Ticker (Rp 5.000 / 30 Hari) untuk teks berjalan/kartu di section bawah, atau Premium Hero Banner (Rp 10.000 / 30 Hari) untuk banner besar di posisi teratas (Top Hero Carousel). Lalu klik 'Lanjutkan ke Preview & Pembayaran'."
      },
      {
        img: imgM12Step3,
        title: "Langkah 3: Pilih Metode Pembayaran (Bank, E-Wallet, atau QRIS)",
        desc: "Pilih metode pembayaran yang mudah dan aman, tersedia Transfer Bank Resmi (Mandiri, BNI, BCA, Maybank, BJB), E-Wallet (OVO), atau QRIS Instan untuk semua e-wallet dan mobile banking."
      },
      {
        img: imgM12Step4,
        title: "Langkah 4: Iklan Aktif & Tayang di Beranda Utama Surade.com",
        desc: "Setelah pembayaran terkonfirmasi, iklan bisnis Anda akan langsung tayang secara profesional di section Premium Hero Carousel (banner atas) dan running slider Usaha Pilihan pada halaman beranda utama."
      }
    ],
    highlights: [
      "Pilihan paket fleksibel: Premium Hero Banner (Rp 10.000) dan Standard Ticker (Rp 5.000).",
      "Eksposur masif langsung di halaman depan (Home) portal Surade.com.",
      "Mendukung berbagai opsi pembayaran: Bank Transfer, E-Wallet, dan QRIS.",
      "Status masa tayang 30 hari terpantau otomatis di dashboard periklanan."
    ]
  },
  {
    id: "referral-komisi",
    icon: Gift,
    number: "14",
    roleBadge: "Fitur Dashboard",
    title: "14. Program Kemitraan Referral, Bagi Hasil & Penarikan Saldo Komisi",
    subtitle: "Cara mendapatkan penghasilan pasif dengan mengajak rekan UMKM mendaftar dan berlangganan paket Centang Emas.",
    actionLink: { to: "/dashboard/referral", label: "Cek Program Referral & Saldo", icon: Gift },
    description: "Program Referral Surade.com adalah wadah kemitraan bagi siapa saja (pelaku usaha, pemuda desa, karang taruna, maupun kreator konten) untuk memperoleh bagi hasil komisi tunai yang transparan.",
    steps: [
      {
        img: imgM13Step1,
        title: "Langkah 1: Buka Tab 'Referral' & Salin Tautan Undangan Unik",
        desc: "Buka menu 'Referral' di dashboard. Di sana Anda akan menemukan Kode Referral unik dan Tautan URL Undangan khusus milik akun Anda. Klik tombol 'Salin Link'."
      },
      {
        img: imgM13Step2,
        title: "Langkah 2: Bagikan Link Referral ke Komunitas UMKM & Media Sosial",
        desc: "Bagikan link tersebut ke grup WhatsApp keluarga, komunitas pedagang pasar, rekan pengusaha, Instagram, atau status WhatsApp Anda untuk mengajak mereka bergabung di Surade.com."
      },
      {
        img: imgM13Step3,
        title: "Langkah 3: Pantau Akumulasi Bonus Komisi di Mutasi Saldo",
        desc: "Setiap ada pelaku usaha yang mendaftar melalui link Anda dan melakukan upgrade ke paket Centang Emas, komisi bagi hasil akan otomatis ditambahkan ke saldo dompet akun Anda secara instan."
      },
      {
        img: imgM13Step4,
        title: "Langkah 4: Ajukan Penarikan Saldo (Withdraw) ke Rekening / E-Wallet",
        desc: "Jika saldo komisi Anda sudah mencukupi batas minimum penarikan, klik tombol 'Tarik Saldo', masukkan nomor rekening bank lokal (BCA, BRI, Mandiri, BNI) atau nomor e-wallet (DANA, OVO, GoPay) untuk dicairkan dalam 1x24 jam kerja."
      }
    ],
    highlights: [
      "Bagi hasil komisi transparan langsung tercatat di mutasi saldo.",
      "Pencairan dana komisi cepat diproses dalam waktu 1x24 jam kerja.",
      "Tabel riwayat komisi dan daftar mitra UMKM binaan terpantau lengkap.",
      "Tanpa modal awal, dapat dijalankan oleh siapa saja."
    ]
  },
  {
    id: "ulasan-rating",
    icon: Star,
    number: "15",
    roleBadge: "Eksplorasi & Ulasan",
    title: "15. Cara Menggunakan Ulasan (Memberikan Rating & Testimoni Toko)",
    subtitle: "Panduan lengkap cara memberikan penilaian bintang 1-5 dan menuliskan ulasan testimoni jujur pada profil tempat usaha di Surade.com.",
    actionLink: { to: "/category/all", label: "Cari Profil Toko untuk Diulas", icon: Star },
    description: "Fitur Ulasan memudahkan pelanggan memberikan rating bintang dan pengalaman nyata setelah bertransaksi di unit usaha lokal, sekaligus membantu pembeli lain menemukan toko terbaik.",
    steps: [
      {
        img: imgM14Step1,
        title: "Langkah 1: Buka Halaman Profil Toko yang Ingin Diulas",
        desc: "Cari dan buka halaman profil toko, warung kuliner, atau penyedia jasa yang telah Anda beli produknya atau gunakan layanannya melalui fitur pencarian beranda atau direktori kategori."
      },
      {
        img: imgM14Step2,
        title: "Langkah 2: Pilih Rating Bintang 1 Sampai 5 Sesuai Kepuasan",
        desc: "Gulir ke bagian 'Ulasan' pada profil toko, lalu pilih jumlah bintang (1 hingga 5 bintang) yang mencerminkan kualitas barang, keramahan penjual, dan kepuasan pelayanan."
      },
      {
        img: imgM14Step3,
        title: "Langkah 3: Tulis Komentar Testimoni Pengalaman & Klik 'Kirim Ulasan'",
        desc: "Tuliskan pengalaman berbelanja Anda secara jelas dan bermanfaat, kemudian klik tombol 'Kirim Ulasan'. Testimoni Anda akan langsung tercatat dan membantu pembeli lain."
      }
    ],
    highlights: [
      "Penilaian bintang 1 sampai 5 terverifikasi dari pengguna.",
      "Membantu masyarakat menemukan rekomendasi toko dan jasa terbaik.",
      "Memberikan apresiasi dan masukan langsung kepada pelaku UMKM lokal."
    ]
  },
  {
    id: "blog-event",
    icon: Building2,
    number: "16",
    roleBadge: "Publikasi & Promosi",
    title: "16. Cara Menambahkan & Mempublikasikan Info serta Event Usaha",
    subtitle: "Panduan membuat artikel berita kegiatan usaha, tips edukasi produk, serta mempublikasikan agenda event promo bazar di Surade.com.",
    actionLink: { to: "/dashboard/blog-event", label: "Kelola Info & Event", icon: Building2 },
    description: "Fitur Info & Event memungkinkan pemilik usaha mempublikasikan artikel edukatif, berita kegiatan toko, maupun jadwal event promo guna meningkatkan interaksi dan eksposur pelanggan.",
    steps: [
      {
        img: imgM15Step1,
        title: "Langkah 1: Buka Tab 'Info & Event' & Pilih Jenis Layanan Publikasi",
        desc: "Masuk ke dashboard akun Anda, buka menu 'Info & Event' pada sidebar. Pilih antara opsi Publikasi Artikel Info (Rp 10.000 / posting aktif 1 tahun) atau Publikasi Agenda Event (Rp 15.000 / posting aktif 1 tahun), lalu klik '+ Buat Info Baru' atau '+ Buat Event Baru'."
      },
      {
        img: imgM15Step2,
        title: "Langkah 2: Isi Judul, Kategori, Ringkasan Singkat & Konten Utama",
        desc: "Masukkan Judul Info/Event, tentukan Kategori yang sesuai, pilih status Draft atau Publikasi, tulis Ringkasan Singkat (Excerpt) pemikat pembaca, dan ketikkan Konten Utama secara lengkap pada kolom editor."
      },
      {
        img: imgM15Step3,
        title: "Langkah 3: Unggah Foto Sampul Utama (Thumbnail) & Galeri Media",
        desc: "Unggah file Thumbnail foto sampul utama (format JPG, PNG, WEBP maks 4MB) dan tambahkan hingga 5 foto galeri dokumentasi pendukung agar artikel atau event Anda tampil lebih menarik."
      },
      {
        img: imgM15Step4,
        title: "Langkah 4: Tentukan Jadwal Tanggal Acara & Lanjut ke Pembayaran",
        desc: "Atur tanggal mulai dan tanggal berakhir kegiatan (khusus event), lalu klik tombol hijau 'Lanjut ke Pembayaran' untuk menyelesaikan transaksi dan mempublikasikan konten Anda langsung ke portal Surade.com."
      }
    ],
    highlights: [
      "Meningkatkan visibilitas merek dan SEO toko di mesin pencarian Google.",
      "Opsi publikasi terjangkau: Blog (Rp 10.000) dan Agenda Event (Rp 15.000) aktif 1 tahun.",
      "Editor teks lengkap dilengkapi dukungan upload thumbnail dan galeri foto.",
      "Jadwal tanggal dan lokasi acara terpampang jelas untuk seluruh pengunjung."
    ],
    callout: "📢 <strong>Tips Publikasi:</strong> Sertakan foto dokumentasi yang jernih dan nomor kontak WhatsApp pada artikel event Anda agar calon pengunjung dapat langsung bertanya detail acara."
  },
  {
    id: "hubungi-admin",
    icon: Phone,
    number: "17",
    roleBadge: "Bantuan & Kontak",
    title: "17. Pusat Bantuan, Hubungi Kami & Layanan Customer Care 24 Jam",
    subtitle: "Panduan lengkap cara menghubungi tim support dan admin resmi Surade.com melalui WhatsApp, formulir pesan online, atau konsultasi pendaftaran.",
    actionLink: { to: "/contact", label: "Buka Halaman Hubungi Kami", icon: Phone, primary: true },
    description: "Tim Customer Care Surade.com siap membantu pelaku UMKM, pemilik toko, dan masyarakat umum dalam pengoperasian portal, pendaftaran toko, kendala akun, hingga konsultasi promosi secara responsif.",
    steps: [
      {
        img: imgM16Step2,
        title: "Langkah 1: Klik Menu 'Hubungi Kami' di Bilah Navigasi Atas",
        desc: "Temukan dan klik menu 'Hubungi Kami' yang terletak di bilah navigasi atas (Navbar) Surade.com. Menu ini selalu tersedia dan mudah diakses dari halaman mana pun di portal."
      },
      {
        img: imgM16Step3,
        title: "Langkah 2: Klik Tombol WhatsApp untuk Chat Langsung dengan Admin",
        desc: "Di halaman Hubungi Kami, klik tombol 'Mulai Chat WhatsApp' pada popup yang muncul atau klik ikon CS di pojok kanan bawah. Anda akan terhubung langsung dengan tim admin melalui WhatsApp resmi (+62 811-1919-711) secara real-time."
      },
      {
        img: imgM16Step4,
        title: "Langkah 3: Isi Formulir 'Tinggalkan Pesan' untuk Pertanyaan Tertulis",
        desc: "Gulir ke bagian 'Formulir Pesan' pada halaman Hubungi Kami. Lengkapi isian Nama Lengkap, Alamat Email, Nomor Telepon/WhatsApp, pilih Kategori/Subjek, tulis isi pesan detail Anda, lalu klik tombol 'Kirim Pesan Sekarang'."
      },
      {
        img: waAvatarImg,
        title: "Langkah 4: Dapatkan Solusi Cepat & Pendampingan dari Tim Support",
        desc: "Tim admin support kami akan segera menindaklanjuti pesan Anda dan memberikan bantuan langkah demi langkah hingga tempat usaha Anda berhasil tayang atau kendala terselesaikan."
      }
    ],
    highlights: [
      "Layanan Customer Care responsif via WhatsApp resmi dan email.",
      "Pendampingan pendaftaran profil usaha gratis bagi pelaku UMKM pemula.",
      "Formulir bantuan online terintegrasi langsung dengan tim teknis.",
      "Siap melayani 24 jam untuk kemajuan ekonomi digital Kecamatan Surade."
    ],
    callout: "💬 <strong>Pendampingan UMKM:</strong> Jika Anda mengalami kesulitan mendaftarkan usaha Anda secara mandiri, tim admin Surade.com siap membantu menginputkan data bisnis Anda hingga tayang online!"
  }
];

export default function Panduan() {
  const isLoggedIn = !!localStorage.getItem("token");
  const [activeSection, setActiveSection] = useState(guideSections[0].id);
  const [lightbox, setLightbox] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const isClickingRef = useRef(false);
  const sidebarNavRef = useRef(null);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Cara Penggunaan - Surade.com";
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

  // Isolated auto-scroll for sidebar & mobile pill without moving window
  useEffect(() => {
    if (sidebarNavRef.current) {
      const container = sidebarNavRef.current.closest(".panduan-sidebar");
      const activeEl = sidebarNavRef.current.querySelector(".panduan-nav-link.active");
      if (container && activeEl) {
        const cTop = container.scrollTop;
        const cHeight = container.clientHeight;
        const elTop = activeEl.offsetTop - container.offsetTop;
        const elHeight = activeEl.offsetHeight;

        if (elTop < cTop) {
          container.scrollTop = Math.max(0, elTop - 12);
        } else if (elTop + elHeight > cTop + cHeight) {
          container.scrollTop = elTop + elHeight - cHeight + 12;
        }
      }
    }
    if (mobileNavRef.current) {
      const activePill = mobileNavRef.current.querySelector(".panduan-mobile-pill.active");
      if (activePill && mobileNavRef.current) {
        const pLeft = activePill.offsetLeft;
        const pWidth = activePill.offsetWidth;
        const cWidth = mobileNavRef.current.offsetWidth;
        mobileNavRef.current.scrollTo({
          left: pLeft - cWidth / 2 + pWidth / 2,
          behavior: "smooth"
        });
      }
    }
  }, [activeSection]);

  // Robust scrollspy to track active section accurately
  useEffect(() => {
    const handleScroll = () => {
      if (isClickingRef.current) return;

      // Bottom of page check -> activate last section
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140;
      if (isAtBottom) {
        setActiveSection(guideSections[guideSections.length - 1].id);
        return;
      }

      // Check which section is currently active
      const threshold = 180;
      let activeId = guideSections[0].id;

      for (let i = 0; i < guideSections.length; i++) {
        const sectionId = guideSections[i].id;
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= threshold) {
            activeId = sectionId;
          }
        }
      }

      setActiveSection(activeId);
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

    window.history.replaceState(null, "", `#${id}`);

    setTimeout(() => {
      isClickingRef.current = false;
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="panduan-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION WITH COASTAL BACKGROUND & WAVE DIVIDER */}
      <header className="panduan-hero">
        <div
          className="panduan-hero__bg"
          style={{ backgroundImage: `url(${coastBg})` }}
        />
        <div className="panduan-hero__overlay" />
        <div className="panduan-hero__glow" />

        <div className="panduan-hero__content">
          <div className="panduan-hero__badge">
            <Sparkles size={14} className="panduan-hero__badge-icon" />
            <span>Pusat Tutorial &amp; Dokumentasi Resmi</span>
          </div>

          <div className="panduan-hero__breadcrumb">
            <Link to="/">Beranda</Link>
            <span className="separator">/</span>
            <span>Cara Penggunaan</span>
          </div>

          <h1 className="panduan-hero__title">
            Cara <span>Penggunaan</span>
          </h1>

          <p className="panduan-hero__subtitle">
            Tutorial lengkap dan tata cara penggunaan dari Halaman Utama, Pendaftaran Akun, hingga Seluruh Fitur Pengelolaan Usaha &amp; Modul Dashboard Surade.com
          </p>
        </div>

        {/* ORGANIC WAVE DIVIDER */}
        <div className="panduan-hero__wave">
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

      {/* MOBILE HORIZONTAL PILL SCROLLER */}
      <div className="panduan-mobile-nav">
        <div className="panduan-mobile-nav__scroller" ref={mobileNavRef}>
          {guideSections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`panduan-mobile-pill ${activeSection === sec.id ? "active" : ""}`}
              onClick={(e) => scrollToSection(e, sec.id)}
            >
              <span className="panduan-pill-num">{sec.number}</span>
              <span>{sec.title.replace(/^\d+\.\s*/, "").split("&")[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="panduan-content">
        <div className="panduan-layout">
          {/* DESKTOP STICKY SIDEBAR */}
          <aside className="panduan-sidebar-wrapper">
            <div className="panduan-sidebar">
              <div className="panduan-sidebar__header">
                <div className="panduan-sidebar__icon-badge">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="panduan-sidebar__heading">Daftar Isi Panduan</h3>
                  <p className="panduan-sidebar__subheading">17 Modul Panduan &amp; Fitur Portal</p>
                </div>
              </div>

              <nav className="panduan-nav-list" ref={sidebarNavRef} aria-label="Daftar Isi Panduan">
                {guideSections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`panduan-nav-link ${isActive ? "active" : ""}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                    >
                      <div className="panduan-nav-link__icon">
                        <Icon size={16} />
                      </div>
                      <span className="panduan-nav-link__text">
                        {sec.number}. {sec.title.replace(/^\d+\.\s*/, "")}
                      </span>
                      {isActive && <ChevronRight size={14} className="panduan-nav-link__arrow" />}
                    </a>
                  );
                })}
              </nav>

              <div className="panduan-sidebar-support">
                <div className="panduan-support-title">Perlu Bantuan Admin?</div>
                <p className="panduan-support-desc">Tim support Surade.com siap membantu via WhatsApp 24 jam.</p>
                <a
                  href="https://wa.me/628111919711?text=Halo%20Admin%20Surade.com,%20saya%20butuh%20panduan%20penggunaan%20website..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panduan-support-btn"
                >
                  <WhatsAppIcon size={16} />
                  <span>Chat WhatsApp Admin</span>
                </a>
              </div>
            </div>
          </aside>

          {/* MAIN ARTICLES */}
          <article className="panduan-main">
            {guideSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <section key={sec.id} id={sec.id} className="panduan-card">
                  {/* Card Header */}
                  <div className="panduan-card__header">
                    <div className="panduan-card__icon">
                      <Icon size={24} />
                    </div>
                    <div className="panduan-card__header-info">
                      <div className="panduan-card__badges">
                        <span className="panduan-card__num-badge">Modul {sec.number}</span>
                        <span className="panduan-card__role-pill">{sec.roleBadge}</span>
                      </div>
                      <h2 className="panduan-card__title">{sec.title}</h2>
                    </div>
                  </div>

                  <p className="panduan-card__subtitle">{sec.subtitle}</p>

                  {/* DIRECT ACTION BUTTON TO RELEVANT PAGE */}
                  {sec.actionLink && (() => {
                    const isDashboardRoute = sec.actionLink.to.startsWith("/dashboard");
                    const dest = isDashboardRoute && !isLoggedIn ? "/login" : sec.actionLink.to;
                    return (
                      <div className="panduan-card__action-row">
                        <Link
                          to={dest}
                          className={`panduan-action-btn ${
                            sec.actionLink.primary
                              ? "panduan-action-btn--primary"
                              : sec.actionLink.gold
                              ? "panduan-action-btn--gold"
                              : ""
                          }`}
                        >
                          <sec.actionLink.icon size={16} />
                          <span>{sec.actionLink.label}</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    );
                  })()}

                  {/* Section Description */}
                  {sec.description && (
                    <p className="panduan-card__desc-text">{sec.description}</p>
                  )}

                  {/* Highlights Checklist */}
                  {sec.highlights && sec.highlights.length > 0 && (
                    <div className="panduan-highlights-box">
                      <h4 className="panduan-highlights-title">
                        <CheckCircle size={16} className="text-[#007570]" />
                        <span>Poin Penting Modul Ini:</span>
                      </h4>
                      <ul className="panduan-highlights-list">
                        {sec.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Steps Grid with Real High-Res Screenshots */}
                  <div className={`panduan-steps-grid ${sec.steps.length === 1 ? "single-card" : ""}`}>
                    {sec.steps.map((step, sIdx) => (
                      <div key={sIdx} className="panduan-step-card">
                        <div
                          className="panduan-step-card__img-wrap"
                          onClick={() => setLightbox(step)}
                          title="Klik untuk memperbesar gambar"
                        >
                          <img
                            src={step.img}
                            alt={step.title}
                            className="panduan-step-card__img"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="panduan-step-card__zoom-hint">
                            <ZoomIn size={18} />
                            <span>Perbesar Tangkapan Layar Asli</span>
                          </div>
                        </div>
                        <div className="panduan-step-card__content">
                          <h3 className="panduan-step-card__title">{step.title}</h3>
                          <p className="panduan-step-card__desc">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Callout Tips */}
                  {sec.callout && (
                    <div
                      className="panduan-callout"
                      dangerouslySetInnerHTML={{ __html: sec.callout }}
                    />
                  )}
                </section>
              );
            })}
          </article>
        </div>
      </main>

      {/* CLOSING / OUTRO SECTION */}
      <section className="panduan-outro">
        {/* GARIS-GARIS BERGELOMBANG ANIMASI */}
        <div className="panduan-outro__lines" aria-hidden="true">
          <svg className="panduan-lines-svg" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path className="panduan-line panduan-line--1" d="M-100,60 Q100,20 300,60 Q500,100 700,60 Q900,20 1100,60 Q1300,100 1540,60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <path className="panduan-line panduan-line--2" d="M-100,110 Q100,70 300,110 Q500,150 700,110 Q900,70 1100,110 Q1300,150 1540,110" fill="none" stroke="rgba(110,231,183,0.12)" strokeWidth="1.5" />
            <path className="panduan-line panduan-line--3" d="M-100,160 Q100,120 300,160 Q500,200 700,160 Q900,120 1100,160 Q1300,200 1540,160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <path className="panduan-line panduan-line--4" d="M-100,210 Q100,170 300,210 Q500,250 700,210 Q900,170 1100,210 Q1300,250 1540,210" fill="none" stroke="rgba(110,231,183,0.1)" strokeWidth="1.5" />
            <path className="panduan-line panduan-line--5" d="M-100,260 Q100,220 300,260 Q500,300 700,260 Q900,220 1100,260 Q1300,300 1540,260" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <path className="panduan-line panduan-line--6" d="M-100,310 Q100,270 300,310 Q500,350 700,310 Q900,270 1100,310 Q1300,350 1540,310" fill="none" stroke="rgba(110,231,183,0.08)" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="panduan-outro__inner">
          <div className="panduan-outro__badge">
            <CheckCircle size={16} />
            <span>Panduan Selesai Dibaca</span>
          </div>
          <h2 className="panduan-outro__title">
            Terima Kasih Telah Membaca <span>Panduan Surade.com</span> 🎉
          </h2>
          <p className="panduan-outro__desc">
            Anda telah menyelesaikan seluruh <strong>18 Modul Panduan</strong> penggunaan portal Surade.com.
            Sekarang saatnya memulai perjalanan bisnis digital Anda — daftarkan usaha, tampilkan produk, dan jangkau ribuan pembeli lokal se-Kecamatan Surade.
          </p>

          <div className="panduan-outro__stats">
            <div className="panduan-outro__stat">
              <span className="panduan-outro__stat-num">18</span>
              <span className="panduan-outro__stat-label">Modul Panduan</span>
            </div>
            <div className="panduan-outro__stat">
              <span className="panduan-outro__stat-num">12</span>
              <span className="panduan-outro__stat-label">Desa/Kelurahan</span>
            </div>
            <div className="panduan-outro__stat">
              <span className="panduan-outro__stat-num">24/7</span>
              <span className="panduan-outro__stat-label">Layanan Admin</span>
            </div>
            <div className="panduan-outro__stat">
              <span className="panduan-outro__stat-num">100%</span>
              <span className="panduan-outro__stat-label">Gratis Daftar</span>
            </div>
          </div>

          <div className="panduan-outro__cta-row">
            <Link
              to={isLoggedIn ? "/dashboard/bisnis" : "/login"}
              className="panduan-outro__btn panduan-outro__btn--primary"
            >
              {isLoggedIn ? <LayoutDashboard size={18} /> : <UserPlus size={18} />}
              <span>{isLoggedIn ? "Buka Dashboard Bisnis" : "Daftarkan Usaha Sekarang"}</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/628111919711?text=Halo%20Admin%20Surade.com,%20saya%20sudah%20baca%20panduan%20dan%20ingin%20daftar..."
              target="_blank"
              rel="noopener noreferrer"
              className="panduan-outro__btn panduan-outro__btn--secondary"
            >
              <WhatsAppIcon size={18} />
              <span>Konsultasi via WhatsApp</span>
            </a>
          </div>

          <p className="panduan-outro__note">
            💡 Masih ada pertanyaan? Tim admin Surade.com siap membantu Anda 24 jam melalui WhatsApp resmi.
          </p>
        </div>
      </section>

      {/* LIGHTBOX MODAL FOR SCREENSHOTS */}
      {lightbox && (
        <div
          className="panduan-lightbox-backdrop"
          onClick={() => {
            setLightbox(null);
            setZoomScale(1);
          }}
        >
          <div
            className="panduan-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="panduan-lightbox-close"
              onClick={() => {
                setLightbox(null);
                setZoomScale(1);
              }}
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
            <div className="panduan-lightbox-img-box">
              <img
                src={lightbox.img}
                alt={lightbox.title}
                className="panduan-lightbox-img"
                style={{ transform: `scale(${zoomScale})` }}
                decoding="async"
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
