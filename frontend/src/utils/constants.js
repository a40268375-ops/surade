// Default avatar - gray person icon as SVG data URL
export const DEFAULT_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ccircle cx='100' cy='70' r='30' fill='%239ca3af'/%3E%3Cpath d='M100 110c-35 0-60 25-60 55v15h120v-15c0-30-25-55-60-55z' fill='%239ca3af'/%3E%3C/svg%3E`;

// Default banner - empty string
export const DEFAULT_BANNER = "";

/**
 * Konversi path relatif storage (e.g. "business/logo/xxx.jpg")
 * menjadi full URL yang bisa diakses browser.
 * Jika path sudah berupa URL lengkap (http/https), dikembalikan apa adanya.
 */
export const getStorageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (path.startsWith("/images/") || path.startsWith("/assets/")) {
    return path;
  }
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/i, "");
  const cleanPath = path.replace(/^\/?storage\//, "");
  return `${baseUrl}/storage/${cleanPath}`;
};

export const OFFICIAL_ACCOUNT_HOLDER = "Triwala Mitra Bestari";

export const OFFICIAL_BANK_ACCOUNTS = [
  { id: "Mandiri", name: "Bank Mandiri", accountNumber: "133-0011-409-331", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#003d79] text-white" },
  { id: "BNI", name: "Bank BNI", accountNumber: "0973607008", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#f15a24] text-white" },
  { id: "BCA", name: "Bank BCA", accountNumber: "0954152045", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#00529c] text-white" },
  { id: "Maybank", name: "Maybank", accountNumber: "2097000009", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#ffc800] text-black" },
  { id: "BJB", name: "Bank BJB", accountNumber: "0119213282001", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#0072bc] text-white" },
];

export const OFFICIAL_EWALLET_ACCOUNTS = [
  { id: "OVO", name: "OVO", accountNumber: "0811-1919-711", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#4c2a86] text-white", isReady: true },
  { id: "DANA", name: "DANA", accountNumber: "XXX", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#008cff] text-white", isReady: false },
  { id: "GoPay", name: "GoPay", accountNumber: "XXX", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#00a5cf] text-white", isReady: false },
  { id: "ShopeePay", name: "ShopeePay", accountNumber: "XXX", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#ee4d2d] text-white", isReady: false },
];

export const OFFICIAL_PAYMENT_METHODS = [
  {
    category: "Transfer Bank / Rekening Resmi",
    items: OFFICIAL_BANK_ACCOUNTS,
  },
  {
    category: "E-Wallet (Dompet Digital)",
    items: OFFICIAL_EWALLET_ACCOUNTS,
  },
];
