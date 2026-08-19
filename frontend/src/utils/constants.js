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
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:")) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/i, "");
  const cleanPath = path.replace(/^\/?storage\//, "");
  return `${baseUrl}/storage/${cleanPath}`;
};
