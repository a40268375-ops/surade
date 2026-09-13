// Utility untuk menentukan status "Buka Sekarang" / "Tutup Sekarang" sebuah
// bisnis berdasarkan jadwal (business.opening_days), bukan nilai hardcode.
//
// Bentuk data opening_days (dikirim dari form AddBusiness.jsx & disimpan di
// kolom "opening_days" tabel businesses):
// [
//   { day: "Senin", open: "08:00", close: "17:00" },
//   { day: "Selasa", open: "08:00", close: "17:00" },
//   ...
// ]
// Hari yang TIDAK ada di array dianggap tutup di hari itu.

export function getTodayName() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  return today;
}

function parseMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Mengembalikan:
 * - true  -> sedang buka sekarang
 * - false -> sedang tutup sekarang (hari ini libur, atau di luar jam buka)
 * - null  -> tidak bisa ditentukan (bisnis belum mengisi jadwal sama sekali)
 */
export function isOpenNow(openingDays) {
  if (!openingDays || !Array.isArray(openingDays) || openingDays.length === 0) {
    return null;
  }

  const todayName = getTodayName();
  const todayEntry = openingDays.find((d) => d.day === todayName);
  if (!todayEntry) return false; // ada jadwal, tapi hari ini tidak termasuk hari buka

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMin = parseMinutes(todayEntry.open);
  const closeMin = parseMinutes(todayEntry.close);
  if (openMin === null || closeMin === null) return null;

  return currentMinutes >= openMin && currentMinutes <= closeMin;
}

/**
 * Helper siap-pakai untuk kartu bisnis (Home.jsx, Category.jsx, dll):
 * mengembalikan { open, label } supaya tidak perlu hardcode "Buka Sekarang".
 *
 * - Kalau jadwal belum diisi (null), bisnis tetap ditampilkan sebagai "Buka"
 *   (fallback netral) supaya bisnis lama yang belum sempat isi jadwal tidak
 *   tiba-tiba terlihat tutup terus, tapi begitu jadwalnya diisi, status ini
 *   otomatis mengikuti jadwal asli.
 */
export function getBusinessOpenStatus(openingDays) {
  const open = isOpenNow(openingDays);
  if (open === null) {
    return { open: true, label: "Buka Sekarang" };
  }
  return {
    open,
    label: open ? "Buka Sekarang" : "Tutup Sekarang",
  };
}