import kelurahanSuradeImg from "../assets/smart-city/kelurahan-surade.jpg";
import jagamuktiImg from "../assets/smart-city/jagamukti.webp";
import citanglarImg from "../assets/smart-city/citanglar.webp";
import wanasariImg from "../assets/smart-city/wanasari.jpeg";
import sirnasariImg from "../assets/smart-city/sirnasari.jpg";
import kadalemanImg from "../assets/smart-city/kadaleman.webp";
import gunungsunggingImg from "../assets/smart-city/gunungsungging.webp";
import cipeundeuyImg from "../assets/smart-city/cipeundeuy.webp";
import pasiripisImg from "../assets/smart-city/pasiripis.jpg";
import buniwangiImg from "../assets/smart-city/buniwangi.webp";
import sukataniImg from "../assets/smart-city/sukatani.jpg";
import kademanganImg from "../assets/smart-city/kademangan.jpg";

/* 12 Desa/Kelurahan Kecamatan Surade beserta foto aslinya.
   Dipakai bersama oleh grid Smart Village di Home.jsx dan halaman
   detail per-desa di SmartCity.jsx, supaya fotonya SELALU sama &
   benar — tidak tergantung field `image`/`img` dari API backend
   yang kadang kosong/salah untuk sebagian desa. */
export const SMART_CITIES = [
  { id: 1, slug: "kelurahan-surade", name: "Kelurahan Surade", bisnis: 0, img: kelurahanSuradeImg, description: "Pusat pemerintahan dan ekonomi Kecamatan Surade." },
  { id: 2, slug: "desa-jagamukti", name: "Desa Jagamukti", bisnis: 0, img: jagamuktiImg, description: "Desa dengan potensi UMKM dan pertanian." },
  { id: 3, slug: "desa-citanglar", name: "Desa Citanglar", bisnis: 0, img: citanglarImg, description: "Desa pesisir dengan potensi wisata dan perikanan." },
  { id: 4, slug: "desa-wanasari", name: "Desa Wanasari", bisnis: 0, img: wanasariImg, description: "Desa agraris dengan hasil bumi unggulan." },
  { id: 5, slug: "desa-sirnasari", name: "Desa Sirnasari", bisnis: 0, img: sirnasariImg, description: "Desa dengan sentra UMKM rumahan yang berkembang." },
  { id: 6, slug: "desa-kadaleman", name: "Desa Kadaleman", bisnis: 0, img: kadalemanImg, description: "Desa dengan potensi peternakan dan perkebunan." },
  { id: 7, slug: "desa-gunungsungging", name: "Desa Gunungsungging", bisnis: 0, img: gunungsunggingImg, description: "Desa dataran tinggi dengan potensi agrowisata." },
  { id: 8, slug: "desa-cipeundeuy", name: "Desa Cipeundeuy", bisnis: 0, img: cipeundeuyImg, description: "Desa dengan aktivitas pertanian dan UMKM lokal." },
  { id: 9, slug: "desa-pasiripis", name: "Desa Pasiripis", bisnis: 0, img: pasiripisImg, description: "Desa dengan potensi perikanan dan kerajinan." },
  { id: 10, slug: "desa-buniwangi", name: "Desa Buniwangi", bisnis: 0, img: buniwangiImg, description: "Desa dengan sentra usaha kuliner dan dagang." },
  { id: 11, slug: "desa-sukatani", name: "Desa Sukatani", bisnis: 0, img: sukataniImg, description: "Desa dengan potensi pertanian dan perkebunan rakyat." },
  { id: 12, slug: "desa-kademangan", name: "Desa Kademangan", bisnis: 0, img: kademanganImg, description: "Desa dengan pertumbuhan UMKM yang aktif." },
];

/* Lookup cepat: slug -> foto asli */
export const SMART_CITY_IMAGE_BY_SLUG = SMART_CITIES.reduce((acc, city) => {
  acc[city.slug] = city.img;
  return acc;
}, {});

export default SMART_CITIES;