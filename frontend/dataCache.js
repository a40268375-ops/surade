// Cache sederhana di memori (bertahan selama tab browser belum di-refresh
// total) supaya kategori & bisnis yang sudah pernah diambil dari API tidak
// perlu di-fetch ulang tiap pindah halaman (Home <-> Category). Ini yang
// bikin tab kategori bisa langsung tampil tanpa jeda kosong saat pindah
// antar halaman - fetch pertama tetap butuh waktu, tapi yang berikutnya
// instan karena sudah ada datanya.
const cache = {
  categories: null,
  businesses: null,
};

export function getCachedCategories() {
  return cache.categories;
}

export function setCachedCategories(data) {
  cache.categories = data;
}

export function getCachedBusinesses() {
  return cache.businesses;
}

export function setCachedBusinesses(data) {
  cache.businesses = data;
}