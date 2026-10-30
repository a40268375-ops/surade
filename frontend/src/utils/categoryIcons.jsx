import {
  Building2,
  Store,
  Camera,
  Wrench,
  Fuel,
  Car,
  GraduationCap,
  Heart,
  Smartphone,
  Shirt,
  Music,
  Users,
  Info,
  Coffee,
  MapPin,
  Home,
  Briefcase,
  ShoppingBag,
  Scissors,
  Utensils,
  Bed,
  CreditCard,
  Hammer,
  Sparkles,
  PhoneCall,
  ShieldAlert,
  Trophy,
  Leaf,
  Video,
  Flame,
  Zap,
} from "lucide-react";

const defaultIconSize = 24;
const defaultStrokeWidth = 1.5;

const ICON_REGISTRY = {
  Building2, Store, Camera, Wrench, Fuel, Car, GraduationCap, Heart,
  Smartphone, Shirt, Music, Users, Info, Coffee, MapPin, Home, Briefcase,
  ShoppingBag, Scissors, Utensils, Bed, CreditCard, Hammer, Sparkles,
  PhoneCall, ShieldAlert, Trophy, Leaf, Video, Flame, Zap,
};

export function iconForCategory(name = "", options = {}) {
  const { size = defaultIconSize, strokeWidth = defaultStrokeWidth, iconKey } = options;

  if (iconKey && ICON_REGISTRY[iconKey]) {
    const ExplicitIcon = ICON_REGISTRY[iconKey];
    return <ExplicitIcon size={size} strokeWidth={strokeWidth} />;
  }

  const n = name.toLowerCase();

  if (n.includes("darurat") || n.includes("nomor") || n.includes("panggilan penting") || n.includes("ambulans") || n.includes("polisi"))
    return <PhoneCall size={size} strokeWidth={strokeWidth} />;
  if (n.includes("pertanian") || n.includes("peternakan") || n.includes("kebun") || n.includes("tani") || n.includes("ternak"))
    return <Leaf size={size} strokeWidth={strokeWidth} />;
  if (n.includes("olahraga") || n.includes("sport") || n.includes("fitness") || n.includes("senam") || n.includes("lapangan"))
    return <Trophy size={size} strokeWidth={strokeWidth} />;
  if (n.includes("multimedia") || n.includes("video") || n.includes("foto") || n.includes("kamera") || n.includes("drone"))
    return <Video size={size} strokeWidth={strokeWidth} />;
  if (n.includes("perkantoran") || n.includes("kantor") || n.includes("office"))
    return <Building2 size={size} strokeWidth={strokeWidth} />;
  if (n.includes("bisnis") || n.includes("market") || n.includes("toko") || n.includes("pertokoan"))
    return <Store size={size} strokeWidth={strokeWidth} />;
  if (n.includes("wisata") || n.includes("rekreasi") || n.includes("hiburan") || n.includes("pantai") || n.includes("curug"))
    return <MapPin size={size} strokeWidth={strokeWidth} />;
  if (n.includes("servis") || n.includes("jasa") || n.includes("service") || n.includes("bengkel"))
    return <Wrench size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fasilitas") || n.includes("facility"))
    return <Fuel size={size} strokeWidth={strokeWidth} />;
  if (n.includes("otomotif") || n.includes("motor") || n.includes("mobil"))
    return <Car size={size} strokeWidth={strokeWidth} />;
  if (n.includes("pendidikan") || n.includes("sekolah") || n.includes("kursus") || n.includes("bimbel") || n.includes("les"))
    return <GraduationCap size={size} strokeWidth={strokeWidth} />;
  if (n.includes("kesehatan") || n.includes("dokter") || n.includes("bidan") || n.includes("pijat") || n.includes("ruqyah"))
    return <Heart size={size} strokeWidth={strokeWidth} />;
  if (n.includes("gadget") || n.includes("elektronik") || n.includes("hp") || n.includes("laptop") || n.includes("cctv"))
    return <Smartphone size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fashion") || n.includes("pakaian") || n.includes("baju") || n.includes("jahit") || n.includes("mua"))
    return <Shirt size={size} strokeWidth={strokeWidth} />;
  if (n.includes("musik") || n.includes("music") || n.includes("band") || n.includes("studio") || n.includes("sound"))
    return <Music size={size} strokeWidth={strokeWidth} />;
  if (n.includes("komunitas") || n.includes("community") || n.includes("warga") || n.includes("taruna"))
    return <Users size={size} strokeWidth={strokeWidth} />;
  if (n.includes("informasi") || n.includes("info") || n.includes("umum") || n.includes("information"))
    return <Info size={size} strokeWidth={strokeWidth} />;
  if (n.includes("cafe") || n.includes("kuliner") || n.includes("restaurant") || n.includes("makanan") || n.includes("kopi") || n.includes("warteg"))
    return <Coffee size={size} strokeWidth={strokeWidth} />;
  if (n.includes("properti") || n.includes("rumah") || n.includes("kost") || n.includes("kontrakan") || n.includes("bangunan"))
    return <Home size={size} strokeWidth={strokeWidth} />;
  if (n.includes("agen") || n.includes("asuransi") || n.includes("konsultan") || n.includes("consultant"))
    return <Briefcase size={size} strokeWidth={strokeWidth} />;
  if (n.includes("apotek") || n.includes("retail") || n.includes("sembako"))
    return <ShoppingBag size={size} strokeWidth={strokeWidth} />;
  if (n.includes("salon") || n.includes("barbershop") || n.includes("kecantikan"))
    return <Scissors size={size} strokeWidth={strokeWidth} />;
  if (n.includes("hotel") || n.includes("penginapan") || n.includes("villa") || n.includes("homestay"))
    return <Bed size={size} strokeWidth={strokeWidth} />;
  if (n.includes("keuangan") || n.includes("bank") || n.includes("finance"))
    return <CreditCard size={size} strokeWidth={strokeWidth} />;
  if (n.includes("konstruksi") || n.includes("tukang") || n.includes("las"))
    return <Hammer size={size} strokeWidth={strokeWidth} />;
  if (n.includes("spa") || n.includes("massage") || n.includes("wellness"))
    return <Sparkles size={size} strokeWidth={strokeWidth} />;

  return <Store size={size} strokeWidth={strokeWidth} />;
}

export const largeIconSize = 26;
export const largeStrokeWidth = 1.7;

export const DEFAULT_CATEGORY_TABS = [
  { id: "all", label: "Semua", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "jasa", label: "Jasa", icon: <Wrench size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "servis", label: "Servis", icon: <Wrench size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "otomotif", label: "Otomotif", icon: <Car size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "kesehatan", label: "Kesehatan", icon: <Heart size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "properti", label: "Properti", icon: <Building2 size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "musik", label: "Musik & Seni", icon: <Music size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "olahraga", label: "Olahraga", icon: <Trophy size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "elektronik", label: "Elektronik", icon: <Smartphone size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "multimedia", label: "Multimedia", icon: <Video size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "kuliner", label: "Kuliner", icon: <Coffee size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "pendidikan", label: "Pendidikan", icon: <GraduationCap size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "pertanian", label: "Pertanian & Ternak", icon: <Leaf size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "hiburan", label: "Wisata & Destinasi", icon: <MapPin size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "komunitas", label: "Komunitas", icon: <Users size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "retail", label: "Retail & Belanja", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
];

export const CATEGORY_SUBCATEGORIES = {
  "jasa": [
    "Asisten Rumah Tangga",
    "Sedot WC",
    "Pindahan Rumah",
    "Tukang Bangunan",
    "Potong Rumput",
    "Sumur Bor",
    "Badut & Sulap",
    "Perbaikan Rumah Bocor",
    "Wedding Organizer",
    "Pindahan Kost & Toko",
    "Satpam & Security",
    "Pengasuh Lansia",
    "Renovasi Bangunan",
    "Notaris & PPAT",
    "Bantuan Hukum",
    "Bersih Halaman",
    "Pengurusan Izin Usaha",
    "Sewa Kamera & Drone",
    "Pengasuh Anak",
    "Cuci Kasur & Sofa",
    "Basmi Rayap & Hama",
    "Jasa Angkut Barang",
    "Sanggar Rias",
    "Poles Lantai",
    "Kuras Toren Air",
    "Pengawal Pribadi",
    "Plafon Gypsum & PVC",
    "Tebang Pohon",
    "Duplikat Kunci",
    "Bantuan Hukum & Advokat",
    "Bengkel Las",
    "Bengkel Bubut",
    "Tukang Kayu",
    "Tukang Listrik",
    "Tukang Ledeng",
    "Laundry Kiloan",
    "Angkut Barang",
    "Salon & Barbershop",
    "Gali Sumur Manual",
    "Poles Kaca",
    "Kolam Terpal & Bioflok",
  ],
  "servis": [
    "Servis AC",
    "Servis Kulkas",
    "Perbaikan Saluran Air",
    "Servis Kulkas & Freezer",
    "Servis Mesin Cuci",
    "Servis Listrik & MCB",
    "Servis Kelistrikan Rumah",
    "Servis Pompa Air",
    "Servis Kompor Gas",
    "Servis TV & Elektronik",
    "Servis Dispenser & Magic Com",
    "Servis Dinamo Mesin",
    "Servis Genset",
    "Servis Sound System",
    "Servis Mesin Rumput",
    "Servis Mesin Steam",
    "Servis Microwave & Oven",
    "Servis Kipas Angin",
  ],
  "otomotif": [
    "Bengkel Mobil",
    "Bengkel Mobil Panggilan",
    "Bengkel Motor",
    "Bengkel Motor Panggilan",
    "Audio & Variasi Mobil",
    "Jahit Jok Mobil & Motor",
    "Cat Body Repair Mobil & Motor",
    "Poles, Auto Detailing & Coating",
    "Cuci Helm & Sepatu",
    "Cuci Motor & Mobil",
    "Rental Motor",
    "Rental Mobil",
    "Rental Truk & Pick Up",
    "Servis Radiator",
    "Knalpot Motor & Mobil",
    "Toko Ban & Velg",
    "Shockbreaker & Kaki Kaki",
    "Dinamo & Aki Kendaraan",
    "Restorasi Motor Lawas",
    "Servis Knalpot",
    "Toko Aki Panggilan",
    "Toko Ban",
    "Tambal Ban",
    "Toko Aki",
    "Toko Oli",
  ],
  "kesehatan": [
    "Praktek Dokter Umum",
    "Praktek Dokter Spesialis",
    "Bidan & Persalinan",
    "Mantri & Sunat Modern",
    "Pijat Urut Tradisional",
    "Toko Obat Herbal",
    "Jamu Tradisional",
    "Ruqyah / Rukiah",
    "Terapi Bekam",
    "Home Care",
    "Apotek 24 Jam",
    "Fisioterapi",
    "Pijat Refleksi",
    "Praktek Dokter Gigi",
    "Pengobatan Patah Tulang",
    "Laboratorium Darah",
    "Klinik Kesehatan",
    "Puskesmas",
    "Rumah Sakit",
    "Klinik Umum",
    "Apotek",
    "Toko Obat",
    "Praktek Dokter",
    "Terapi Lintah",
  ],
  "properti": [
    "Virtual Office",
    "Kost Karyawan & Mahasiswa",
    "Sewa Ruko & Kios",
    "Sewa Kantor & Coworking",
    "Sewa Apartemen",
    "Sewa Ruang Pertemuan",
    "Interior & Kitchen Set",
    "Sewa Ruang Rapat",
    "Kusen Kayu & Aluminium",
    "Mebel Kayu",
    "Pagar Besi & Tralis",
    "Kusen & Pintu Alumunium",
    "Toko Kasur & Spring Bed",
    "Homestay",
    "Villa & Resort",
    "Pengaspalan Jalan",
    "Tukang Taman & Rumput",
    "Saluran Air & Drainase",
    "Kolam Koi & Air Mancur",
    "Pembuatan Kolam Renang",
    "Kanopi Baja Ringan",
    "Toko Material Bangunan",
    "Tanah Kavling Dijual",
    "Rumah Dijual / Sewa",
    "Ruko & Kios Dijual",
    "Toko Bangunan",
    "Wallpaper & Vinyl Lantai",
    "Rolling Door & Folding Gate",
    "Perbaikan Genteng Bocor",
    "Toko Keramik & Granit",
    "Duplikat Kunci & Brankas",
    "Toko Cat Bangunan",
    "Jual Tanah Kavling",
    "Jual Ruko & Kios",
    "Pasang Wallpaper & Vinyl",
    "Pasang Rolling Door",
    "Toko Furniture",
    "Agen Properti",
    "Kontraktor Bangunan",
    "Arsitek",
    "Desain Interior",
  ],
  "musik": [
    "Guru Les Musik Privat",
    "Servis Alat Musik",
    "Rental Alat Musik",
    "Organ Tunggal",
    "Studio Musik & Recording",
    "Biduan Panggilan",
    "Band Akustik & Wedding",
    "Alat Musik Tradisional",
    "Rebana Hadroh & Marawis",
    "Sanggar Seni Tari",
    "MC Acara & Pernikahan",
    "Sewa Kostum Adat & Kebaya",
    "Pengrajin Kendang Jaipong",
    "Pembuatan Lagu & Jingle",
  ],
  "olahraga": [
    "Sewa Lapangan Futsal",
    "Sewa Lapangan Badminton",
    "Pelatih Sepak Bola & SSB",
    "Pelatih Bela Diri & Silat",
    "Sewa Alat Olahraga",
    "Sablon & Konveksi Jersey",
    "Kursus Renang",
    "Guru Privat Renang",
    "Instruktur Fitness",
    "Instruktur Senam & Zumba",
    "Instruktur Yoga",
    "Servis Sepeda",
    "Sewa Perlengkapan Camping",
    "Pajat Tebing",
    "Toko Alat Pancing",
    "Pemandu Gowes & Trail",
  ],
  "elektronik": [
    "Pasang & Servis CCTV",
    "Servis Komputer & Laptop",
    "Servis Printer",
    "Servis Kamera & Lensa",
    "Toko Komputer & Laptop",
    "Toko HP & Aksesoris",
    "Toko Elektronik Rumah Tangga",
    "Pasang WiFi & Jaringan",
    "Recovery Data Harddisk",
    "Running Text LED Display",
    "Servis HP",
    "Toko HP",
    "Toko Elektronik",
  ],
  "fashion": [
    "Tukang Jahit Pakaian",
    "Konveksi Seragam",
    "Make Up Artist (MUA)",
    "Salon Kecantikan",
    "Barbershop Pria",
    "Bordir & Sablon Kaos",
    "Toko Busana Muslim",
    "Toko Sepatu",
    "Toko Tas",
    "Henna Art Pengantin",
  ],
  "multimedia": [
    "Video Dokumentasi Acara",
    "Fotografer Acara",
    "Video Iklan & Promosi",
    "Live Streaming Acara",
    "Desain Grafis",
    "Cetak Foto & Frame",
    "Pembuatan Website",
    "Undangan Digital",
  ],
  "kuliner": [
    "Warung Tegal (Warteg)",
    "Angkringan",
    "Warkop & Kedai Kopi",
    "Warung Kopi",
    "Cafe & Resto",
    "Toko Buah Segar",
    "Jajanan Pasar Tradisional",
    "Rumah Makan",
    "Warung Makan",
    "Restoran Seafood",
    "Seafood",
    "Katering Nasi Kotak",
    "Rumah Makan Padang",
    "Toko Roti",
    "Ayam & Bebek Geprek",
    "Ikan Olahan",
    "Sentra Oleh-oleh",
    "Produk Olahan",
    "Katering & Prasmanan",
    "Catering",
    "Warung Bakso & Mie Ayam",
    "Frozen Food",
  ],
  "pendidikan": [
    "Fotocopy & Pengetikan",
    "Bimbingan Belajar (Bimbel)",
    "Les Privat",
    "Kursus Bahasa Asing",
    "Kursus Mengemudi",
    "Kursus Komputer",
    "Kursus Menjahit",
    "Lembaga Pelatihan Kerja",
    "Toko Buku & Alat Tulis",
    "Sekolah & Pesantren",
    "Lembaga Pelatihan Kerja (LPK)",
  ],
  "pertanian": [
    "Tanaman Hias & Pot Bunga",
    "Parsel Buah & Buket Bunga",
    "Bibit Tanaman Buah",
    "Hewan Kurban & Aqiqah",
    "Madu Murni",
    "Susu Murni Sapi & Kambing",
    "Pupuk & Obat Pertanian",
    "Benih Ikan Air Tawar",
    "Pakan Ternak & Pelet",
    "Toko Ikan Hias & Akuarium",
    "Pembuat Gula Aren",
    "Distributor Telur Ayam",
    "Pengepul Hasil Bumi",
    "Peternakan Sapi",
  ],
  "hiburan": [
    "Sewa Jet Ski",
    "Pemandu Wisata",
    "Sewa Alat Diving & Snorkling",
    "Wisata Agro Petik Buah",
    "Wisata Sejarah / Museum",
    "Kolam Renang Waterboom",
    "Sewa Perahu / Speed Boat",
  ],
  "komunitas": [
    "Komunitas Lari & Gowes",
    "Komunitas Seni Tradisional",
    "Komunitas Relawan Bencana",
    "Relawan Sosial & Kemanusiaan",
    "Komunitas Motor & Mobil",
    "Karang Taruna Pemuda",
    "Komunitas UMKM Naik Kelas",
    "Forum UMKM Surade",
    "Komunitas Pecinta Alam",
    "Komunitas Fotografer",
  ],
  "retail": [
    "Toko Sembako / Grosir",
    "Warung Kelontong",
    "Kerajinan Anyaman Bambu",
    "Toko Perlengkapan Bayi",
    "Toko Mainan Anak",
    "Toko Jam Tangan",
    "Toko Perabot Dapur",
    "Toko Plastik & Kemasan",
    "Toko Pakaian",
    "Butik Fashion",
    "Kerajinan Tangan",
    "Peternakan Ayam",
    "Toko Aksesoris",
    "Toko Tas",
    "Peternakan Kambing",
  ],
};

export function getCompleteNavbarCategories() {
  return DEFAULT_CATEGORY_TABS
    .filter(t => t.id !== "all")
    .map((tab, idx) => {
      const subNames = CATEGORY_SUBCATEGORIES[tab.id] || [];
      return {
        id: tab.id,
        name: tab.label,
        slug: tab.id,
        order: idx + 1,
        children: subNames.map((name, sIdx) => ({
          id: `${tab.id}-${sIdx + 1}`,
          name: name,
          slug: `${tab.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
          order: sIdx + 1
        }))
      };
    });
}
