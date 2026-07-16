/* ─────────────────────────────────────────────
   Pencocokan nama lokasi/alamat (teks bebas) ke koordinat lat/lng
   perkiraan, dipakai oleh BusinessMap.jsx untuk menaruh pin di peta
   selama data bisnis di database belum punya latitude/longitude asli.

   Titik pusat 12 desa/kelurahan di bawah adalah TITIK PERKIRAAN di
   sekitar Kecamatan Surade, Kabupaten Sukabumi (bukan GPS presisi per
   kantor desa) — cukup akurat untuk menyebar pin di peta, tapi silakan
   sesuaikan lagi kalau sudah punya koordinat resmi tiap desa.

   `findLocationCoords(text)` mencocokkan berdasarkan potongan teks
   (case-insensitive) di alamat/lokasi bisnis, key yang lebih spesifik
   dicek lebih dulu supaya "Desa Sukatani, Kec. Surade" match ke
   "sukatani" dulu, bukan ke "surade" secara umum.
───────────────────────────────────────────── */

export const DEFAULT_LOCATION = { key: "lainnya", lat: -7.2489, lng: 106.4956 };

const LOCATIONS = {
  // ── Kelurahan/Desa di Kecamatan Surade (pusat: Kelurahan Surade) ──
  surade: { lat: -7.2489, lng: 106.4956 },
  pasiripis: { lat: -7.2825, lng: 106.4530 },
  buniwangi: { lat: -7.2250, lng: 106.5190 },
  cipeundeuy: { lat: -7.2360, lng: 106.4700 },
  gunungsungging: { lat: -7.2100, lng: 106.4850 },
  citanglar: { lat: -7.2650, lng: 106.5320 },
  jagamukti: { lat: -7.2050, lng: 106.5300 },
  kadaleman: { lat: -7.2700, lng: 106.4780 },
  wanasari: { lat: -7.1950, lng: 106.4600 },
  sirnasari: { lat: -7.2400, lng: 106.5450 },
  sukatani: { lat: -7.1850, lng: 106.5050 },
  kademangan: { lat: -7.2550, lng: 106.4400 },

  // ── Kabupaten/kota umum lain (fallback untuk data contoh/lama) ──
  "kabupaten bogor": { lat: -6.5950, lng: 106.8166 },
  "kota bogor": { lat: -6.5971, lng: 106.8060 },
  bogor: { lat: -6.5971, lng: 106.8060 },
  jakarta: { lat: -6.2088, lng: 106.8456 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  depok: { lat: -6.4025, lng: 106.7942 },
  bekasi: { lat: -6.2383, lng: 107.0018 },
  sukabumi: { lat: -6.9200, lng: 106.9270 },
  ciawi: { lat: -6.6700, lng: 106.8460 },
  babakan: { lat: -6.6620, lng: 106.8390 },
};

// Urutkan key dari yang PALING PANJANG dulu supaya pencocokan lebih
// spesifik menang duluan (mis. "kabupaten bogor" dicek sebelum "bogor").
const SORTED_KEYS = Object.keys(LOCATIONS).sort((a, b) => b.length - a.length);

export function findLocationCoords(text) {
  if (!text) return null;
  const normalized = text.toLowerCase();

  for (const key of SORTED_KEYS) {
    if (normalized.includes(key)) {
      return { key, ...LOCATIONS[key] };
    }
  }

  return null;
}