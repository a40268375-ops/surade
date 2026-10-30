import kelurahanSuradeImg from "../assets/desa/kelurahan-surade.jpg";
import jagamuktiImg from "../assets/desa/jagamukti.webp";
import citanglarImg from "../assets/desa/citanglar.webp";
import wanasariImg from "../assets/desa/wanasari.jpeg";
import sirnasariImg from "../assets/desa/sirnasari.jpg";
import kadalemanImg from "../assets/desa/kadaleman.webp";
import gunungsunggingImg from "../assets/desa/gunungsungging.webp";
import cipeundeuyImg from "../assets/desa/cipeundeuy.webp";
import pasiripisImg from "../assets/desa/pasiripis.jpg";
import buniwangiImg from "../assets/desa/buniwangi.webp";
import sukataniImg from "../assets/desa/sukatani.jpg";
import kademanganImg from "../assets/desa/kademangan.jpg";

/* 12 Desa/Kelurahan Kecamatan Surade beserta foto aslinya.
   Dipakai bersama oleh grid Smart Village di Home.jsx dan halaman
   detail per-desa di SmartCity.jsx, supaya fotonya SELALU sama &
   benar — tidak tergantung field `image`/`img` dari API backend
   yang kadang kosong/salah untuk sebagian desa. */
export const SMART_CITIES = [
  { id: 1, slug: "kelurahan-surade", name: "Kelurahan Surade", bisnis: 21, img: kelurahanSuradeImg, description: "Pusat pemerintahan dan ekonomi Kecamatan Surade." },
  { id: 2, slug: "desa-jagamukti", name: "Desa Jagamukti", bisnis: 12, img: jagamuktiImg, description: "Desa dengan potensi UMKM dan pertanian." },
  { id: 3, slug: "desa-citanglar", name: "Desa Citanglar", bisnis: 13, img: citanglarImg, description: "Desa pesisir dengan potensi wisata dan perikanan." },
  { id: 4, slug: "desa-wanasari", name: "Desa Wanasari", bisnis: 12, img: wanasariImg, description: "Desa agraris dengan hasil bumi unggulan." },
  { id: 5, slug: "desa-sirnasari", name: "Desa Sirnasari", bisnis: 12, img: sirnasariImg, description: "Desa dengan sentra UMKM rumahan yang berkembang." },
  { id: 6, slug: "desa-kadaleman", name: "Desa Kadaleman", bisnis: 12, img: kadalemanImg, description: "Desa dengan potensi peternakan dan perkebunan." },
  { id: 7, slug: "desa-gunungsungging", name: "Desa Gunungsungging", bisnis: 12, img: gunungsunggingImg, description: "Desa dataran tinggi dengan potensi agrowisata." },
  { id: 8, slug: "desa-cipeundeuy", name: "Desa Cipeundeuy", bisnis: 12, img: cipeundeuyImg, description: "Desa dengan aktivitas pertanian dan UMKM lokal." },
  { id: 9, slug: "desa-pasiripis", name: "Desa Pasiripis", bisnis: 12, img: pasiripisImg, description: "Desa dengan potensi perikanan dan kerajinan." },
  { id: 10, slug: "desa-buniwangi", name: "Desa Buniwangi", bisnis: 12, img: buniwangiImg, description: "Desa dengan sentra usaha kuliner dan dagang." },
  { id: 11, slug: "desa-sukatani", name: "Desa Sukatani", bisnis: 12, img: sukataniImg, description: "Desa dengan potensi pertanian dan perkebunan rakyat." },
  { id: 12, slug: "desa-kademangan", name: "Desa Kademangan", bisnis: 12, img: kademanganImg, description: "Desa dengan pertumbuhan UMKM yang aktif." },
];

/* Lookup cepat: slug -> foto asli */
export const SMART_CITY_IMAGE_BY_SLUG = SMART_CITIES.reduce((acc, city) => {
  acc[city.slug] = city.img;
  return acc;
}, {});

export default SMART_CITIES;