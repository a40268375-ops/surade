/* ─────────────────────────────────────────────
   SUMBER DATA TUNGGAL untuk Smart City & Smart Village.
   PENTING: sebelumnya data ini didefinisikan terpisah di
   Home.jsx dan SmartCity.jsx dengan isi yang tidak sinkron
   (mis. Yogyakarta ada di Home.jsx tapi tidak ada di
   SmartCity.jsx). Akibatnya klik satu kota bisa nyasar ke
   kota lain atau ke halaman "tidak ditemukan" yang salah.

   Sekarang Home.jsx dan SmartCity.jsx SAMA-SAMA mengambil
   data dari file ini, jadi `id` selalu konsisten dan
   /smart-city/:id akan selalu membuka kota yang benar.
───────────────────────────────────────────── */

export const SMART_CITIES = [
  {
    id: 1,
    name: "Aceh",
    bisnis: 142,
    population: "5.2 Juta",
    area: "5,677 km²",
    governor: "Muzakir Manaf",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=600&fit=crop",
    description: "Provinsi Aceh adalah provinsi paling barat Indonesia yang kaya akan budaya dan sejarah. Program Smart City di Aceh berfokus pada pengembangan ekonomi digital dan pariwisata berbasis teknologi.",
    highlights: [
      "Sistem e-Government terintegrasi",
      "Digitalisasi pasar tradisional",
      "Smart tourism untuk wisata religius",
      "Pengembangan UMKM berbasis teknologi"
    ]
  },
  {
    id: 2,
    name: "Bali",
    bisnis: 385,
    population: "4.3 Juta",
    area: "5,780 km²",
    governor: "Wayan Koster",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop",
    description: "Bali adalah destinasi wisata dunia yang menerapkan konsep Smart City untuk meningkatkan pengalaman wisata dan keberlanjutan ekonomi lokal.",
    highlights: [
      "Bali Smart Island Program",
      "Sistem manajemen lalu lintas cerdas",
      "Digitalisasi industri pariwisata",
      "Platform UMKM Bali Digital"
    ]
  },
  {
    id: 3,
    name: "Bogor",
    bisnis: 273,
    population: "5.4 Juta",
    area: "6,284 km²",
    governor: "Budi Santoso",
    img: "https://images.unsplash.com/photo-1568802088984-38109b53e40c?w=1200&h=600&fit=crop",
    description: "Kota Bogor sebagai kota penyangga Jakarta mengembangkan Smart City untuk mengatasi tantangan urbanisasi dan meningkatkan kualitas hidup warganya.",
    highlights: [
      "Smart transportation system",
      "Digitalisasi layanan publik",
      "Pengelolaan sampah cerdas",
      "Smart agriculture dan UMKM"
    ]
  },
  {
    id: 4,
    name: "Jakarta",
    bisnis: 1240,
    population: "10.6 Juta",
    area: "661 km²",
    governor: "Heru Budi Hartono",
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&h=600&fit=crop",
    description: "DKI Jakarta sebagai ibu kota Indonesia adalah pioneer Smart City dengan implementasi teknologi canggih dalam berbagai aspek kehidupan urban.",
    highlights: [
      "Jakarta Smart City terintegrasi",
      "Sistem transportasi cerdas",
      "E-Government terdepan",
      "Platform ekonomi digital terbesar"
    ]
  },
  {
    id: 5,
    name: "Jambi",
    bisnis: 89,
    population: "3.5 Juta",
    area: "50,058 km²",
    governor: "Al Haris",
    img: "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1200&h=600&fit=crop",
    description: "Provinsi Jambi mengembangkan Smart City dengan fokus pada pengelolaan sumber daya alam berkelanjutan dan digitalisasi layanan publik.",
    highlights: [
      "Smart environmental monitoring",
      "Digitalisasi pertanian dan perkebunan",
      "E-Government terintegrasi",
      "Pengembangan ekonomi digital"
    ]
  },
  {
    id: 6,
    name: "Kep. Mentawai",
    bisnis: 34,
    population: "83 Ribu",
    area: "6,011 km²",
    governor: "Yudas Sabaggalet",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    description: "Kepulauan Mentawai mengembangkan Smart Village untuk meningkatkan konektivitas dan ekonomi masyarakat lokal dengan tetap menjaga kearifan lokal.",
    highlights: [
      "Smart Village untuk pulau terpencil",
      "Digitalisasi wisata bahari",
      "Konektivitas internet satelit",
      "Pemberdayaan UMKM lokal"
    ]
  },
  {
    id: 7,
    name: "Magelang",
    bisnis: 198,
    population: "1.3 Juta",
    area: "1,062 km²",
    governor: "Zaenal Arifin",
    img: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&h=600&fit=crop",
    description: "Kota Magelang mengembangkan Smart City dengan fokus pada pariwisata berbasis teknologi dan digitalisasi UMKM lokal.",
    highlights: [
      "Smart tourism Borobudur",
      "Digitalisasi UMKM lokal",
      "Sistem manajemen lalu lintas",
      "Layanan publik digital"
    ]
  },
  {
    id: 8,
    name: "Medan",
    bisnis: 467,
    population: "2.4 Juta",
    area: "265 km²",
    governor: "Bobby Nasution",
    img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=1200&h=600&fit=crop",
    description: "Kota Medan sebagai kota terbesar di Sumatera menerapkan Smart City untuk meningkatkan efisiensi layanan publik dan ekonomi digital.",
    highlights: [
      "Medan Smart City terintegrasi",
      "Digitalisasi pasar tradisional",
      "Sistem transportasi cerdas",
      "Platform UMKM Medan Digital"
    ]
  },
  {
    id: 9,
    name: "Papua Barat",
    bisnis: 56,
    population: "1.1 Juta",
    area: "115,242 km²",
    governor: "Paulus Waterpauw",
    img: "https://images.unsplash.com/photo-1591109078846-8f53bab16c37?w=1200&h=600&fit=crop",
    description: "Provinsi Papua Barat mengembangkan Smart Village untuk meningkatkan akses layanan publik dan ekonomi masyarakat di daerah terpencil.",
    highlights: [
      "Smart Village untuk daerah terpencil",
      "Digitalisasi layanan kesehatan",
      "Konektivitas internet daerah",
      "Pemberdayaan ekonomi lokal"
    ]
  },
  {
    id: 10,
    name: "Sulawesi Tengah",
    bisnis: 112,
    population: "2.9 Juta",
    area: "68,033 km²",
    governor: "Rusdy Mastura",
    img: "https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=1200&h=600&fit=crop",
    description: "Provinsi Sulawesi Tengah mengembangkan Smart City dengan fokus pada pengelolaan sumber daya alam dan digitalisasi layanan publik.",
    highlights: [
      "Smart environmental monitoring",
      "Digitalisasi pertanian",
      "E-Government terintegrasi",
      "Pengembangan ekonomi digital"
    ]
  },
  {
    id: 11,
    name: "Sumatera Utara",
    bisnis: 321,
    population: "14.8 Juta",
    area: "72,981 km²",
    governor: "Edy Rahmayadi",
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&h=600&fit=crop",
    description: "Provinsi Sumatera Utara mengembangkan Smart City untuk meningkatkan efisiensi layanan publik dan pertumbuhan ekonomi digital.",
    highlights: [
      "Smart City terintegrasi",
      "Digitalisasi industri dan perdagangan",
      "Sistem transportasi cerdas",
      "Platform UMKM digital"
    ]
  },
  {
    id: 12,
    name: "Yogyakarta",
    bisnis: 524,
    population: "3.7 Juta",
    area: "3,133 km²",
    governor: "Sri Sultan Hamengkubuwono X",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    description: "Daerah Istimewa Yogyakarta mengembangkan Smart City dengan fokus pada pariwisata budaya, pendidikan, dan digitalisasi UMKM berbasis kearifan lokal.",
    highlights: [
      "Smart tourism kawasan Malioboro & Keraton",
      "Digitalisasi UMKM dan ekonomi kreatif",
      "Ekosistem pendidikan berbasis teknologi",
      "Layanan publik terintegrasi Jogja Smart Service"
    ]
  },
];