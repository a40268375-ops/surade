const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export function getTodayIndex() {
  const jsToday = new Date().getDay();
  return jsToday === 0 ? 6 : jsToday - 1;
}

export function computeOpenStatus(business) {
  if (!business) return { isOpen: false, label: "Tutup Sekarang" };

  if (Object.prototype.hasOwnProperty.call(business, "is_open_now")) {
    return {
      isOpen: !!business.is_open_now,
      label: business.is_open_now ? "Buka Sekarang" : "Tutup Sekarang",
    };
  }

  const hours = business.operating_hours || business.hours;
  const closedDays = business.closedDays || business.closed_days || [];
  const todayName = DAY_NAMES[getTodayIndex()];

  if (closedDays.includes(todayName)) {
    return { isOpen: false, label: "Tutup Sekarang" };
  }

  if (!hours) {
    return { isOpen: false, label: "Tutup Sekarang" };
  }

  if (/24\s*(jam|hours?)/i.test(hours)) {
    return { isOpen: true, label: "Buka Sekarang" };
  }

  const match = hours.match(/(\d{1,2})[.:](\d{2})\s*[-–—]\s*(\d{1,2})[.:](\d{2})/)
    || hours.match(/(\d{1,2})\s*[-–—]\s*(\d{1,2})/);

  if (!match) {
    return { isOpen: false, label: "Tutup Sekarang" };
  }

  const openH = Number(match[1]);
  const openM = match[2] !== undefined ? Number(match[2]) : 0;
  const closeH = Number(match[3] ?? match[2]);
  const closeM = match[4] !== undefined ? Number(match[4]) : 0;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  let isOpen;
  if (closeMinutes <= openMinutes) {
    isOpen = nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  } else {
    isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }

  return { isOpen, label: isOpen ? "Buka Sekarang" : "Tutup Sekarang" };
}

export function buildWeeklySchedule(business) {
  const closedDays = business?.closedDays || business?.closed_days || [];
  const todayIndex = getTodayIndex();
  const hours = business?.operating_hours || business?.hours || "08.00 - 17.00";

  return DAY_NAMES.map((day, idx) => {
    const closed = closedDays.includes(day);
    return {
      day,
      hours: closed ? "Tutup" : hours,
      closed,
      isToday: idx === todayIndex,
    };
  });
}

export const PRICE_TIERS = {
  1: { symbol: "$", label: "Murah" },
  2: { symbol: "$$", label: "Sedang" },
  3: { symbol: "$$$", label: "Mahal" },
};

export function getPriceTier(category = 2) {
  return PRICE_TIERS[category] || PRICE_TIERS[2];
}
