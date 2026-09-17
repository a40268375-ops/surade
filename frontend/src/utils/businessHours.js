// Utility untuk menentukan status "Buka Sekarang" / "Tutup Sekarang" sebuah
// bisnis berdasarkan jadwal (business.opening_days), bukan nilai hardcode.

export function getTodayName() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  if (!today) return "Senin";
  const clean = today.replace(/[^a-zA-Z]/g, "").trim();
  const lower = clean.toLowerCase();

  const map = {
    senin: "Senin",
    selasa: "Selasa",
    rabu: "Rabu",
    kamis: "Kamis",
    jumat: "Jumat",
    sabtu: "Sabtu",
    minggu: "Minggu",
  };

  return map[lower] || "Senin";
}

const DAYS_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function parseMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Mencari entri jadwal operasional untuk hari tertentu (`targetDayName`).
 * Mendukung format:
 * - { day: "Senin", open: "08:00", close: "17:00" }
 * - { day: "Senin - Minggu", open: "10:00", close: "23:00" }
 * - { day: "Senin - Sabtu", open: "08:00", close: "17:30" }
 * - { day: "Setiap Hari (24 Jam)", open: "00:00", close: "23:59" }
 */
export function getScheduleForDay(openingDays, targetDayName) {
  if (!openingDays) return null;

  let daysArray = openingDays;
  if (typeof openingDays === "string") {
    try {
      daysArray = JSON.parse(openingDays);
    } catch (e) {
      return null;
    }
  }

  if (!Array.isArray(daysArray) || daysArray.length === 0) {
    return null;
  }

  const targetClean = (targetDayName || getTodayName()).trim();
  const targetLower = targetClean.toLowerCase();
  const targetIndex = DAYS_ORDER.findIndex((d) => d.toLowerCase() === targetLower);

  for (const entry of daysArray) {
    if (!entry || !entry.day) continue;
    const dayStr = String(entry.day).trim();
    const dayLower = dayStr.toLowerCase();

    // 1. Setiap Hari / 24 Jam
    if (
      dayLower.includes("setiap hari") ||
      dayLower.includes("24 jam") ||
      dayLower.includes("24jam") ||
      dayLower.includes("24-jam") ||
      dayLower.includes("seluruh hari") ||
      dayLower.includes("sepanjang hari")
    ) {
      return entry;
    }

    // 2. Sama persis (misal "Senin")
    if (dayLower === targetLower) {
      return entry;
    }

    // 3. Rentang hari (misal "Senin - Minggu", "Senin - Sabtu", "Senin s.d. Jumat")
    const rangeMatch = dayStr.split(/[-–—]|s\.d\.|s\/d|hingga|sampai|to/i);
    if (rangeMatch.length === 2) {
      const startStr = rangeMatch[0].trim().toLowerCase();
      const endStr = rangeMatch[1].trim().toLowerCase();

      const startIndex = DAYS_ORDER.findIndex((d) => startStr.includes(d.toLowerCase()));
      const endIndex = DAYS_ORDER.findIndex((d) => endStr.includes(d.toLowerCase()));

      if (startIndex !== -1 && endIndex !== -1 && targetIndex !== -1) {
        if (startIndex <= endIndex) {
          if (targetIndex >= startIndex && targetIndex <= endIndex) {
            return entry;
          }
        } else {
          // Wrap around (misal Jumat - Selasa)
          if (targetIndex >= startIndex || targetIndex <= endIndex) {
            return entry;
          }
        }
      }
    }

    // 4. Komma terpisah (misal "Senin, Selasa, Kamis")
    if (dayLower.includes(targetLower)) {
      return entry;
    }
  }

  return null;
}

/**
 * Mengembalikan:
 * - true  -> sedang buka sekarang
 * - false -> sedang tutup sekarang (hari ini libur, atau di luar jam buka)
 * - null  -> tidak bisa ditentukan (bisnis belum mengisi jadwal sama sekali)
 */
export function isOpenNow(openingDays) {
  if (!openingDays) return null;

  let daysArray = openingDays;
  if (typeof openingDays === "string") {
    try {
      daysArray = JSON.parse(openingDays);
    } catch (e) {
      return null;
    }
  }

  if (!Array.isArray(daysArray) || daysArray.length === 0) {
    return null;
  }

  const todayName = getTodayName();
  const todayEntry = getScheduleForDay(daysArray, todayName);

  if (!todayEntry) return false; // Ada jadwal terisi, tapi hari ini tidak buka

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMin = parseMinutes(todayEntry.open);
  const closeMin = parseMinutes(todayEntry.close);

  if (openMin === null || closeMin === null) return true; // Jika jam tidak valid, anggap buka

  // Handle 24 jam (00:00 - 23:59 atau 00:00 - 24:00)
  if (openMin === 0 && (closeMin >= 1439 || closeMin === 0)) {
    return true;
  }

  if (closeMin >= openMin) {
    return currentMinutes >= openMin && currentMinutes <= closeMin;
  } else {
    // Overlap lewat tengah malam (misal 18:00 s.d. 02:00)
    return currentMinutes >= openMin || currentMinutes <= closeMin;
  }
}

/**
 * Helper siap-pakai untuk kartu bisnis (Home.jsx, Category.jsx, dll):
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