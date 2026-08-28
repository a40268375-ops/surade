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
} from "lucide-react";

const defaultIconSize = 24;
const defaultStrokeWidth = 1.5;

// Semua icon yang bisa dipilih admin lewat form "Kelola Kategori" (field
// `icon` di database, mis. "Store", "Utensils"). Dipetakan ke komponen
// Lucide yang sesuai supaya pilihan admin BENAR-BENAR dipakai di
// tampilan publik, bukan cuma tersimpan tanpa efek.
const ICON_REGISTRY = {
  Building2, Store, Camera, Wrench, Fuel, Car, GraduationCap, Heart,
  Smartphone, Shirt, Music, Users, Info, Coffee, MapPin, Home, Briefcase,
  ShoppingBag, Scissors, Utensils, Bed, CreditCard, Hammer, Sparkles,
};

export function iconForCategory(name = "", options = {}) {
  const { size = defaultIconSize, strokeWidth = defaultStrokeWidth, iconKey } = options;

  // Prioritas 1: icon yang eksplisit dipilih admin di form kategori.
  if (iconKey && ICON_REGISTRY[iconKey]) {
    const ExplicitIcon = ICON_REGISTRY[iconKey];
    return <ExplicitIcon size={size} strokeWidth={strokeWidth} />;
  }

  const n = name.toLowerCase();

  if (n.includes("perkantoran") || n.includes("kantor") || n.includes("office"))
    return <Building2 size={size} strokeWidth={strokeWidth} />;
  if (n.includes("bisnis") || n.includes("market") || n.includes("toko") || n.includes("pertokoan"))
    return <Store size={size} strokeWidth={strokeWidth} />;
  if (n.includes("wisata") || n.includes("rekreasi") || n.includes("hiburan") || n.includes("entertainment"))
    return <Camera size={size} strokeWidth={strokeWidth} />;
  if (n.includes("servis") || n.includes("jasa") || n.includes("service"))
    return <Wrench size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fasilitas") || n.includes("facility"))
    return <Fuel size={size} strokeWidth={strokeWidth} />;
  if (n.includes("otomotif") || n.includes("motor") || n.includes("mobil") || n.includes("bengkel"))
    return <Car size={size} strokeWidth={strokeWidth} />;
  if (n.includes("pendidikan") || n.includes("sekolah") || n.includes("universitas") || n.includes("education"))
    return <GraduationCap size={size} strokeWidth={strokeWidth} />;
  if (n.includes("kesehatan") || n.includes("rumah sakit") || n.includes("klinik") || n.includes("health"))
    return <Heart size={size} strokeWidth={strokeWidth} />;
  if (n.includes("gadget") || n.includes("elektronik") || n.includes("hp") || n.includes("handphone"))
    return <Smartphone size={size} strokeWidth={strokeWidth} />;
  if (n.includes("fashion") || n.includes("pakaian") || n.includes("baju"))
    return <Shirt size={size} strokeWidth={strokeWidth} />;
  if (n.includes("musik") || n.includes("music") || n.includes("band") || n.includes("studio"))
    return <Music size={size} strokeWidth={strokeWidth} />;
  if (n.includes("komunitas") || n.includes("community") || n.includes("grup"))
    return <Users size={size} strokeWidth={strokeWidth} />;
  if (n.includes("informasi") || n.includes("info") || n.includes("umum") || n.includes("information"))
    return <Info size={size} strokeWidth={strokeWidth} />;
  if (n.includes("cafe") || n.includes("kuliner") || n.includes("restaurant") || n.includes("makanan"))
    return <Coffee size={size} strokeWidth={strokeWidth} />;
  if (n.includes("properti") || n.includes("rumah") || n.includes("apartemen") || n.includes("property"))
    return <Home size={size} strokeWidth={strokeWidth} />;
  if (n.includes("agen") || n.includes("asuransi") || n.includes("konsultan") || n.includes("consultant"))
    return <Briefcase size={size} strokeWidth={strokeWidth} />;
  if (n.includes("apotek") || n.includes("arsitekt") || n.includes("atm"))
    return <ShoppingBag size={size} strokeWidth={strokeWidth} />;
  if (n.includes("salon") || n.includes("barbershop") || n.includes("kecantikan"))
    return <Scissors size={size} strokeWidth={strokeWidth} />;
  if (n.includes("hotel") || n.includes("penginapan") || n.includes("lodge"))
    return <Bed size={size} strokeWidth={strokeWidth} />;
  if (n.includes("keuangan") || n.includes("bank") || n.includes("finance"))
    return <CreditCard size={size} strokeWidth={strokeWidth} />;
  if (n.includes("konstruksi") || n.includes("bangunan") || n.includes("construction"))
    return <Hammer size={size} strokeWidth={strokeWidth} />;
  if (n.includes("spa") || n.includes("massage") || n.includes("wellness"))
    return <Sparkles size={size} strokeWidth={strokeWidth} />;

  return <Store size={size} strokeWidth={strokeWidth} />;
}

export const largeIconSize = 26;
export const largeStrokeWidth = 1.7;

export const DEFAULT_CATEGORY_TABS = [
  { id: "all", label: "Semua", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "perkantoran", label: "Perkantoran", icon: <Building2 size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "bisnis-market", label: "Bisnis & Market", icon: <Store size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "rekreasi-hiburan", label: "Rekreasi & Hiburan", icon: <Camera size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "jasa-servis", label: "Jasa & Servis", icon: <Wrench size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "fasilitas", label: "Fasilitas", icon: <Fuel size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "otomotif", label: "Otomotif", icon: <Car size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "pendidikan", label: "Pendidikan", icon: <GraduationCap size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "kesehatan", label: "Kesehatan", icon: <Heart size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "elektronik-gadget", label: "Elektronik & Gadget", icon: <Smartphone size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "musik", label: "Musik", icon: <Music size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "komunitas", label: "Komunitas", icon: <Users size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
  { id: "informasi-umum", label: "Informasi Umum", icon: <Info size={largeIconSize} strokeWidth={largeStrokeWidth} /> },
];

<<<<<<< HEAD
// PERHATIAN: konstanta CATEGORY_SUBCATEGORIES yang dulu ada di sini SUDAH
// DIHAPUS. Isinya hardcode dan TIDAK PERNAH SAMA dengan subkategori asli di
// database (mis. "perkantoran" di sini cuma berisi 4 subkategori dummy,
// padahal kategori asli "Perkantoran" di database - lihat
// CategorySeeder.php - punya 12 subkategori yang berbeda sama sekali).
// Untungnya konstanta ini tidak pernah di-import di file lain, jadi aman
// dihapus. Subkategori yang benar SELALU harus diambil dari API
// GET /categories/tree (lihat Navbar.jsx) atau GET /categories lalu
// difilter parent_id, JANGAN pernah hardcode ulang di file manapun.
=======
// Subcategories for each main category
export const CATEGORY_SUBCATEGORIES = {
  "perkantoran": ["Kantor Pemerintahan", "Kantor Swasta", "Coworking Space", "Ruang Usaha"],
  "bisnis-market": ["Toko Kelontong", "Minimarket", "Supermarket", "Pasar Tradisional", "Toko Grosir"],
  "rekreasi-hiburan": ["Wisata Alam", "Taman Hiburan", "Bioskop", "Karaoke", "Game Center"],
  "jasa-servis": ["Servis Elektronik", "Servis AC", "Laundry", "Cuci Sepatu", "Jasa Perbaikan"],
  "fasilitas": ["ATM", "Bank", "Kantor Pos", "Pusat Pelayanan", "Fasilitas Umum"],
  "otomotif": ["Bengkel Motor", "Bengkel Mobil", "Toko Ban", "Stasiun Pengisian Bahan Bakar", "Showroom"],
  "pendidikan": ["TK/PAUD", "SD", "SMP", "SMA", "Universitas", "Lembaga Kursus"],
  "kesehatan": ["Rumah Sakit", "Klinik", "Puskesmas", "Apotek", "Praktik Dokter"],
  "elektronik-gadget": ["Toko HP", "Toko Laptop", "Aksesoris HP", "Service Center", "Toko Komputer"],
  "fashion": ["Toko Pakaian", "Toko Sepatu", "Toko Tas", "Salon", "Barbershop"],
  "musik": ["Toko Alat Musik", "Studio Musik", "Kursus Musik", "Jasa Sound System"],
  "komunitas": ["Komunitas Olahraga", "Komunitas Seni", "Komunitas Hobi", "Organisasi Sosial"],
  "informasi-umum": ["Info Wilayah", "Info Acara", "Info Layanan Publik", "Berita Lokal"],
  "properti": ["Rumah", "Apartemen", "Tanah", "Ruko", "Kos-kosan"],
};
>>>>>>> 43511c35c312291308bc3e9f249d166401282bda
