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
  if (!path || path === "null" || path === "undefined") return "";

  // Handle authentic curated blog and event images directly from local static assets
  if (typeof path === "string" && (path.includes("blogs/real_images/") || path.includes("real_blogs/"))) {
    const filename = path.split("/").pop();
    return `/images/real_blogs/${filename}`;
  }
  
  if (typeof path === "string" && (path.includes("ulastempat.com") || path.includes("lokasiterdekat.com"))) {
    return "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80";
  }

  // Determine base API / storage host
  let baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/i, "");
  if (!baseUrl) {
    if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      baseUrl = "http://127.0.0.1:8000";
    } else {
      baseUrl = "https://surade.com";
    }
  }

  // If path contains production domain (surade.com / surade.co.id) but running locally, rewrite to baseUrl
  if (typeof path === "string" && (path.includes("surade.com/storage") || path.includes("surade.co.id/storage"))) {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isLocal) {
      return path.replace(/^https?:\/\/(www\.)?surade\.(com|co\.id)/i, baseUrl);
    }
  }

  // If already a complete URL or data URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  // If it's a local asset path, return as-is  
  if (
    path.startsWith("/images/") || path.startsWith("images/") ||
    path.startsWith("/assets/") || path.startsWith("assets/") ||
    path.startsWith("/public/") || path.startsWith("public/") ||
    path.startsWith("/logos/") || path.startsWith("logos/")
  ) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  
  // Build full storage URL
  const cleanPath = path.replace(/^\/?storage\//, "").replace(/^\/+/, "");
  
  // Ensure we have a valid path
  if (!cleanPath) return "";
  
  const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  if (isLocalHost) {
    return `/storage/${cleanPath}`;
  }

  return `${baseUrl}/storage/${cleanPath}`;
};

// Alternative function with error handling for local use
export const getStorageUrlSafe = (path) => {
  try {
    return getStorageUrl(path);
  } catch (error) {
    console.warn("Error generating storage URL:", error, path);
    return "";
  }
};

// Default business image for broken/missing business images
export const DEFAULT_BUSINESS_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f3f4f6'/%3E%3Crect x='50' y='50' width='300' height='150' rx='8' fill='%23e5e7eb'/%3E%3Cpath d='M120 120h160v10H120zM120 140h120v8H120zM120 156h80v8H120z' fill='%23d1d5db'/%3E%3Ccircle cx='350' cy='200' r='15' fill='%23d1d5db'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23929ba1' font-family='Arial, sans-serif' font-size='14'%3EBisnis%3C/text%3E%3C/svg%3E`;

// Function to get business image with fallback
export const getBusinessImageUrl = (business) => {
  if (!business) return DEFAULT_BUSINESS_IMAGE;
  
  // Try logo first, then banner, then images array, then fallback
  const possibleImages = [
    business.logo,
    business.banner,
    business.image,
    ...(Array.isArray(business.images) ? business.images : [])
  ].filter(Boolean);
  
  if (possibleImages.length > 0) {
    return getStorageUrl(possibleImages[0]);
  }
  
  return DEFAULT_BUSINESS_IMAGE;
};

export const OFFICIAL_ACCOUNT_HOLDER = "Triwala Mitra Bestari";

export const OFFICIAL_BANK_ACCOUNTS = [
  { id: "Mandiri", name: "Bank Mandiri", accountNumber: "133-0011-409-331", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#003d79] text-white", logoUrl: "/logos/mandiri.png", logo: "🏦", logoText: "Mandiri" },
  { id: "BNI", name: "Bank BNI", accountNumber: "0973607008", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#f15a24] text-white", logoUrl: "/logos/bni.png", logo: "🏦", logoText: "BNI" },
  { id: "BCA", name: "Bank BCA", accountNumber: "0954152045", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#00529c] text-white", logoUrl: "/logos/bca.png", logo: "🏦", logoText: "BCA" },
  { id: "Maybank", name: "Maybank", accountNumber: "2097000009", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#ffc800] text-black", logoUrl: "/logos/maybank.png", logo: "🏦", logoText: "Maybank" },
  { id: "BJB", name: "Bank BJB", accountNumber: "0119213282001", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#0072bc] text-white", logoUrl: "/logos/bjb.png", logo: "🏦", logoText: "BJB" },
];

export const OFFICIAL_EWALLET_ACCOUNTS = [
  { id: "OVO", name: "OVO", accountNumber: "0811-1919-711", accountName: OFFICIAL_ACCOUNT_HOLDER, badgeColor: "bg-[#4c2a86] text-white", logoUrl: "/logos/ovo.png", logo: "💜", logoText: "OVO", isReady: true },
  { id: "DANA", name: "DANA", accountNumber: "xxxx", accountName: "xxxx", badgeColor: "bg-[#008cff] text-white", logoUrl: "/logos/dana.png", logo: "💙", logoText: "DANA", isReady: false },
  { id: "GoPay", name: "GoPay", accountNumber: "xxxx", accountName: "xxxx", badgeColor: "bg-[#00a5cf] text-white", logoUrl: "/logos/gopay.png", logo: "💳", logoText: "GoPay", isReady: false },
];

export const OFFICIAL_QRIS_ACCOUNT = {
  id: "QRIS",
  name: "QRIS (Semua E-Wallet & Bank)",
  accountNumber: "Scan QR Code",
  accountName: OFFICIAL_ACCOUNT_HOLDER,
  badgeColor: "bg-[#007570] text-white",
  logoUrl: "/logos/qris.png",
  isQRIS: true,
  isReady: true,
};

export const OFFICIAL_MIDTRANS_ACCOUNT = {
  id: "Midtrans",
  name: "Midtrans (Pembayaran Otomatis Snap / QRIS / VA)",
  accountNumber: "Pembayaran Instant & Otomatis",
  accountName: "Midtrans Payment Gateway",
  badgeColor: "bg-[#007570] text-white",
  logoUrl: "/logos/midtrans.png",
  logo: "⚡",
  isMidtrans: true,
  isReady: true,
};

export const OFFICIAL_PAYMENT_METHODS = [
  {
    category: "Payment Gateway (Otomatis & Instant)",
    items: [OFFICIAL_MIDTRANS_ACCOUNT],
  },
  {
    category: "Transfer Bank / Rekening Resmi",
    items: OFFICIAL_BANK_ACCOUNTS,
  },
  {
    category: "E-Wallet",
    items: OFFICIAL_EWALLET_ACCOUNTS,
  },
  {
    category: "QRIS",
    items: [OFFICIAL_QRIS_ACCOUNT],
  },
];

export const formatPaymentNumber = (accNum) => {
  if (!accNum || accNum === "0123456789" || accNum === "XXX" || accNum.toLowerCase().includes("belum")) {
    return "xxxx";
  }
  return accNum;
};

export const formatPaymentHolder = (holder) => {
  if (!holder || holder === "0123456789" || holder === "Official Surade.com" || holder.toLowerCase().includes("belum")) {
    return "xxxx";
  }
  return holder;
};

