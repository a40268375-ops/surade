/* ─────────────────────────────────────────────
   SUMBER DATA TUNGGAL untuk Smart City & Smart Village.
   Home.jsx dan SmartCity.jsx SAMA-SAMA mengambil data dari
   file ini, jadi `id` selalu konsisten dan /smart-city/:id
   akan selalu membuka kota/desa yang benar.

   CATATAN UPDATE: seluruh data sudah diganti dari kota/provinsi
   umum menjadi 12 desa/kelurahan di Kecamatan Surade, Kabupaten
   Sukabumi, Jawa Barat. Data populasi berdasarkan BPS Kabupaten
   Sukabumi (2021-2024). Data "bisnis", "area" per desa, dan
   nama kepala desa bersifat placeholder karena data resmi
   per-desa tidak tersedia publik — silakan sesuaikan sendiri.

   PERBAIKAN: sebelumnya semua foto pakai stok foto acak dari
   Unsplash (bukan foto desa yang sebenarnya). Sekarang diganti
   pakai foto asli tiap desa yang dikirim langsung - disimpan di
   src/assets/desa/ dan di-import di bawah supaya ikut ke-bundle
   Vite (bukan link luar lagi, jadi tidak akan pernah mati/hilang).
───────────────────────────────────────────── */

import imgKelurahanSurade from "../assets/desa/kelurahan-surade.jpg";
import imgPasiripis from "../assets/desa/pasiripis.jpg";
import imgBuniwangi from "../assets/desa/buniwangi.webp";
import imgCipeundeuy from "../assets/desa/cipeundeuy.webp";
import imgGunungsungging from "../assets/desa/gunungsungging.webp";
import imgCitanglar from "../assets/desa/citanglar.webp";
import imgJagamukti from "../assets/desa/jagamukti.webp";
import imgKadaleman from "../assets/desa/kadaleman.webp";
import imgWanasari from "../assets/desa/wanasari.jpeg";
import imgSirnasari from "../assets/desa/sirnasari.jpg";
import imgSukatani from "../assets/desa/sukatani.jpg";
import imgKademangan from "../assets/desa/kademangan.jpg";

export const SMART_CITIES = [
  {
    id: 1,
    name: "Kelurahan Surade",
    bisnis: 96,
    population: "10.141 Jiwa",
    area: "Pusat Kec. Surade",
    governor: "Lurah Surade",
    img: imgKelurahanSurade,
    description: "Kelurahan Surade adalah pusat pemerintahan Kecamatan Surade sekaligus pusat aktivitas warga, ditandai dengan Bunderan/Tugu Surade. Program Smart Village di sini fokus pada digitalisasi layanan publik dan pusat perdagangan kecamatan.",
    highlights: [
      "Pusat layanan publik kecamatan digital",
      "Digitalisasi pasar dan pertokoan lokal",
      "Ikon Bunderan Tugu Surade",
      "Pemberdayaan UMKM pusat kota kecamatan"
    ]
  },
  {
    id: 2,
    name: "Desa Pasiripis",
    bisnis: 61,
    population: "6.782 Jiwa",
    area: "Pesisir Selatan Surade",
    governor: "Kepala Desa Pasiripis",
    img: imgPasiripis,
    description: "Desa Pasiripis merupakan desa berpenduduk terbanyak di Kecamatan Surade, dengan garis pantai berpasir putih seperti Pantai Karangtrisna, Minajaya, dan Karanggantungan. Fokus Smart Village di sini adalah pariwisata pantai dan perikanan.",
    highlights: [
      "Smart tourism pantai Karangtrisna & Minajaya",
      "Digitalisasi hasil perikanan nelayan lokal",
      "Konservasi kawasan pesisir",
      "Pengembangan UMKM olahan laut"
    ]
  },
  {
    id: 3,
    name: "Desa Buniwangi",
    bisnis: 48,
    population: "5.952 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Buniwangi",
    img: imgBuniwangi,
    description: "Desa Buniwangi merupakan salah satu desa dengan penduduk terbesar kedua di Kecamatan Surade, dengan mayoritas warga bermata pencaharian sebagai petani. Smart Village di desa ini mengedepankan digitalisasi pertanian dan koperasi desa.",
    highlights: [
      "Digitalisasi hasil pertanian dan perkebunan",
      "Koperasi dan UMKM desa berbasis digital",
      "Layanan administrasi desa online",
      "Program irigasi dan pertanian cerdas"
    ]
  },
  {
    id: 4,
    name: "Desa Cipeundeuy",
    bisnis: 22,
    population: "6.550 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Cipeundeuy",
    img: imgCipeundeuy,
    description: "Desa Cipeundeuy adalah desa agraris di Kecamatan Surade yang mengandalkan sektor pertanian dan perkebunan sebagai penggerak ekonomi warganya. Smart Village berfokus pada pemberdayaan petani dan digitalisasi UMKM rumahan.",
    highlights: [
      "Pemberdayaan kelompok tani lokal",
      "Digitalisasi UMKM rumahan",
      "Layanan publik desa terintegrasi",
      "Edukasi digital untuk warga desa"
    ]
  },
  {
    id: 5,
    name: "Desa Gunungsungging",
    bisnis: 27,
    population: "5.911 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Gunungsungging",
    img: imgGunungsungging,
    description: "Desa Gunungsungging berada di kawasan perbukitan Kecamatan Surade dengan potensi perkebunan yang cukup besar. Program Smart Village di desa ini menyasar digitalisasi hasil kebun dan konektivitas internet desa.",
    highlights: [
      "Digitalisasi hasil perkebunan",
      "Perluasan akses internet desa",
      "Pengembangan wisata alam perbukitan",
      "Pemberdayaan ekonomi warga lokal"
    ]
  },
  {
    id: 6,
    name: "Desa Citanglar",
    bisnis: 30,
    population: "6.820 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Citanglar",
    img: imgCitanglar,
    description: "Desa Citanglar mengembangkan Smart Village dengan menitikberatkan pada peningkatan konektivitas dan pemberdayaan ekonomi warga melalui digitalisasi layanan desa.",
    highlights: [
      "Peningkatan konektivitas internet desa",
      "Digitalisasi layanan administrasi warga",
      "Pemberdayaan UMKM lokal",
      "Program pertanian berkelanjutan"
    ]
  },
  {
    id: 7,
    name: "Desa Jagamukti",
    bisnis: 26,
    population: "6.008 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Jagamukti",
    img: imgJagamukti,
    description: "Desa Jagamukti mengembangkan Smart Village dengan fokus pada digitalisasi pertanian dan penguatan UMKM lokal warga desa.",
    highlights: [
      "Digitalisasi UMKM lokal",
      "Program pertanian dan perkebunan cerdas",
      "Layanan publik desa digital",
      "Pemberdayaan pemuda desa"
    ]
  },
  {
    id: 8,
    name: "Desa Kadaleman",
    bisnis: 24,
    population: "5.520 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Kadaleman",
    img: imgKadaleman,
    description: "Desa Kadaleman menerapkan konsep Smart Village untuk meningkatkan efisiensi layanan publik desa dan mendorong ekonomi digital warganya.",
    highlights: [
      "Smart Village terintegrasi",
      "Digitalisasi layanan publik desa",
      "Pemberdayaan UMKM warga",
      "Program literasi digital desa"
    ]
  },
  {
    id: 9,
    name: "Desa Wanasari",
    bisnis: 21,
    population: "5.256 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Wanasari",
    img: imgWanasari,
    description: "Desa Wanasari mengembangkan Smart Village untuk meningkatkan akses layanan publik dan ekonomi masyarakat, dengan sejumlah pondok pesantren sebagai pusat pendidikan agama warganya.",
    highlights: [
      "Digitalisasi layanan pendidikan & pesantren",
      "Konektivitas internet desa",
      "Pemberdayaan ekonomi lokal",
      "Layanan kesehatan desa digital"
    ]
  },
  {
    id: 10,
    name: "Desa Sirnasari",
    bisnis: 29,
    population: "6.393 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Sirnasari",
    img: imgSirnasari,
    description: "Desa Sirnasari mengembangkan Smart Village dengan fokus pada pengelolaan sumber daya alam dan digitalisasi layanan publik bagi warganya.",
    highlights: [
      "Smart environmental monitoring desa",
      "Digitalisasi pertanian",
      "Layanan publik desa terintegrasi",
      "Pengembangan ekonomi digital warga"
    ]
  },
  {
    id: 11,
    name: "Desa Sukatani",
    bisnis: 18,
    population: "4.260 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Sukatani",
    img: imgSukatani,
    description: "Desa Sukatani adalah desa dengan jumlah penduduk paling sedikit di Kecamatan Surade, dengan potensi pertanian dan perkebunan sebagai andalan warga. Smart Village di desa ini mendorong digitalisasi UMKM dan pertanian.",
    highlights: [
      "Digitalisasi industri rumahan dan UMKM",
      "Program pertanian cerdas",
      "Layanan administrasi desa online",
      "Pemberdayaan ekonomi warga"
    ]
  },
  {
    id: 12,
    name: "Desa Kademangan",
    bisnis: 20,
    population: "4.588 Jiwa",
    area: "Kec. Surade",
    governor: "Kepala Desa Kademangan",
    img: imgKademangan,
    description: "Desa Kademangan mengembangkan Smart Village dengan fokus pada pariwisata berbasis kearifan lokal dan digitalisasi UMKM warga desa.",
    highlights: [
      "Digitalisasi UMKM lokal",
      "Pengembangan wisata desa",
      "Layanan publik terintegrasi",
      "Edukasi digital untuk warga"
    ]
  },
];