import { SMART_CITIES } from "./smartCities";

/**
 * Daftar nama desa/kelurahan di Kecamatan Surade, diambil dari
 * smartCities.js (satu sumber data) supaya nama-nama desa selalu
 * konsisten di seluruh aplikasi: dropdown lokasi di Home, form
 * Tambah Bisnis (user & admin), dan filter kategori.
 */
export const DESA_LIST = SMART_CITIES.map((c) => c.name);