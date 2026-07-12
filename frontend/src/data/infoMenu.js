function toSlug(label) {
  return label
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const INFO_MENU = [
  {
    label: "Perkantoran",
    slug: "perkantoran",
    children: [
      "Kantor Pemerintah",
      "Lembaga",
      "Bank & ATM",
      "Finance",
      "Kantor Pos",
      "Konsultan",
      "Kontraktor",
      "Notaris",
      "Koperasi",
      "Asuransi",
      "Media Berita",
      "Media Televisi",
    ],
  },
  {
    label: "Bisnis & Market",
    slug: "bisnis-market",
    children: [
      "Cafe & Restaurant",
      "Furniture",
      "Makanan & Minuman",
      "Minimarket",
      "Pasar",
      "Pertokoan",
      "Peternakan",
      "Printing",
      "Produk",
      "Produk Lain",
      "Properti",
      "Super Market",
      "Warung",
    ],
  },
  {
    label: "Rekreasi & Hiburan",
    slug: "rekreasi-hiburan",
    children: [
      "Film",
      "Guide",
      "Hotel",
      "Karaoke",
      "Organ Tunggal",
      "Penginapan",
      "Photography",
      "Travel Agent",
      "Wisata",
    ],
  },
  {
    label: "Jasa & Servis",
    slug: "jasa-servis",
    children: [
      "Ahli Professional",
      "Baby Sister",
      "Event Organizer",
      "Guru Privat",
      "Jasa Pengiriman",
      "Pembantu RT",
      "Pengiriman TKI",
      "Pijat & Bekam",
      "Servis & Tukang",
      "Wedding Organizer",
    ],
  },
  {
    label: "Fasilitas",
    slug: "fasilitas",
    children: ["Pom Bensin", "Sarana Ibadah", "Terminal"],
  },
  {
    label: "Otomotif",
    slug: "otomotif",
    children: [
      "Aksesoris Kendaraan",
      "Cuci Kendaraan",
      "Mobil",
      "Motor",
      "Perbaikan & Servis",
      "Rental",
      "Spare Part",
    ],
  },
  {
    label: "Pendidikan",
    slug: "pendidikan",
    children: ["Kampus", "Kebudayaan", "Kursus", "Perpustakaan", "Sekolah", "Yayasan"],
  },
  {
    label: "Kesehatan",
    slug: "kesehatan",
    children: [
      "Apotik",
      "Bidan",
      "Dokter Hewan",
      "Dokter Praktek",
      "Kecantikan",
      "Klinik",
      "Massage & Spa",
      "Petshop",
      "Puskesmas",
      "Rumah Sakit",
      "Sport Center",
      "Terapi",
    ],
  },
  {
    label: "Elektronik & Gadget",
    slug: "elektronik-gadget",
    children: ["Cctv", "Handphone", "Home Elektronik", "Komputer", "Listrik"],
  },
  {
    label: "Fashion",
    slug: "fashion",
    children: ["Barbershop", "Butik", "Distro", "Factory Outlet", "Perhiasan", "Salon"],
  },
  {
    label: "Musik",
    slug: "musik",
    children: [
      "Band",
      "Engineer Music",
      "Event Musik",
      "Event Organizer Musik",
      "Jual Beli Alat Musik",
      "Kursus Private",
      "Lembaga Kursus",
      "Studio Musik",
      "Studio Recording",
      "Toko Musik",
    ],
  },
  {
    label: "Komunitas",
    slug: "komunitas",
    children: ["Gamer", "Otomotif", "Pecinta Alam", "Sepeda"],
  },
  {
    label: "Informasi Umum",
    slug: "informasi-umum",
    children: [
      "Berita & Event",
      "Info Tol",
      "Lowongan Kerja",
      "Pencari Kerja",
      "Surveyor",
      "Titik Evakuasi",
    ],
  },
].map((item) => ({
  ...item,
  children: item.children.map((child) => ({
    label: child,
    slug: toSlug(child),
  })),
}));
