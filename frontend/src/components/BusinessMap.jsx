import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { findLocationCoords, DEFAULT_LOCATION } from "../data/idLocations";
import "./BusinessMap.css";

/**
 * Peta interaktif daftar bisnis.
 *
 * PERBAIKAN PENTING: sebelumnya Leaflet & plugin cluster-nya dimuat lewat
 * tag <script> terpisah dari CDN (unpkg.com) di index.html, dan komponen
 * ini menunggu (polling `window.L`) sampai keduanya selesai diunduh dari
 * internet sebelum peta bisa muncul - makanya selalu ada jeda "Memuat
 * peta…" di awal. Padahal `leaflet` sudah ada juga sebagai dependency npm
 * yang malah tidak dipakai. Sekarang Leaflet & plugin cluster di-import
 * langsung (ikut ter-bundle bersama kode JS lainnya, bukan request
 * jaringan terpisah), jadi peta langsung siap begitu komponennya render -
 * tidak perlu nunggu apa pun lagi.
 *
 * PENTING: tiap BISNIS tampil sebagai pin-nya SENDIRI-SENDIRI di peta
 * (bukan cuma 1 pin per kota). Karena database bisnis cuma menyimpan
 * alamat sebagai teks (bukan lat/lng asli), posisi tiap pin dihitung
 * dari koordinat kota/kabupaten (idLocations.js) lalu digeser sedikit
 * secara acak (tapi konsisten per id bisnis, lihat `jitterFor`) supaya
 * bisnis-bisnis di kota yang sama tidak numpuk persis di titik yang sama
 * dan tetap bisa diklik satu-satu.
 *
 * Klik pin bisnis → muncul KARTU POPUP yang nempel tepat di atas pin
 * (gaya Google Maps: foto, nama, rating/kategori, status buka-tutup),
 * pakai popup bawaan Leaflet (bukan panel React manual) supaya posisi &
 * "ekor" panahnya otomatis ngikutin lokasi pin.
 */
export default function BusinessMap({ businesses = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const points = businesses.map((b) => {
    const match = findLocationCoords(b.location || "") || DEFAULT_LOCATION;
    const [dLat, dLng] = jitterFor(b.id);
    return {
      ...b,
      lat: match.lat + dLat,
      lng: match.lng + dLng,
      areaLabel: match.key === "lainnya" ? "Lokasi lainnya" : titleCase(match.key),
    };
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dibungkus try/catch supaya kalau ada apa pun yang gagal di dalam sini,
    // tidak nyangkut di tengah dan mencegah cleanup jalan (yang bisa bikin
    // "Map container is already initialized" kalau effect ini sempat
    // jalan dua kali, mis. React StrictMode di development).
    let map;
    try {
      map = L.map(mapContainerRef.current, {
        center: [-2.5, 118],
        zoom: 5,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      markersLayerRef.current =
        typeof L.markerClusterGroup === "function"
          ? L.markerClusterGroup({
              maxClusterRadius: 50,
              spiderfyOnMaxZoom: true,
              showCoverageOnHover: false,
              iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                return L.divIcon({
                  html: `<div class="biz-map-cluster">${count}</div>`,
                  className: "biz-map-cluster-wrap",
                  iconSize: [40, 40],
                });
              },
            }).addTo(map)
          : L.layerGroup().addTo(map);

      mapRef.current = map;
    } catch (err) {
      console.error("Gagal membuat peta bisnis:", err);
      if (map) map.remove();
      return;
    }

    // Leaflet ngukur lebar/tinggi container-nya cuma SEKALI pas map ini
    // dibuat. Kalau container-nya berubah ukuran belakangan (misalnya
    // pindah halaman pagination, kartu-nya beda jumlah/tinggi, dsb),
    // Leaflet nggak otomatis tau -> peta jadi keliatan aneh/kepotong.
    // invalidateSize() maksa Leaflet ngukur ulang.
    const invalidate = () => mapRef.current && mapRef.current.invalidateSize();

    // Sesaat setelah mount (nunggu CSS/grid selesai dihitung browser)
    const t1 = setTimeout(invalidate, 0);
    const t2 = setTimeout(invalidate, 300);

    // Terus dipantau juga: kalau container-nya berubah ukuran kapan pun
    // (resize window, konten sekitar berubah, dll), peta ikut nyesuain.
    const resizeObserver = new ResizeObserver(() => invalidate());
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    points.forEach((biz) => {
      const icon = L.divIcon({
        className: "biz-map-pin",
        html: `
          <div class="biz-map-pin__wrap">
            <div class="biz-map-pin__pin">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" stroke-width="2">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 40],
      });

      const marker = L.marker([biz.lat, biz.lng], { icon });

      marker.bindPopup(buildPopupHtml(biz), {
        className: "biz-map-popup",
        closeButton: true,
        maxWidth: 260,
        minWidth: 240,
        offset: [0, -34], // biar popup muncul persis di atas ujung pin
      });

      marker.addTo(markersLayerRef.current);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds.pad(0.3), { maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses]);

  return (
    <div className="biz-map">
      <div ref={mapContainerRef} className="biz-map__canvas" />
    </div>
  );
}

/**
 * Bangun HTML kartu popup ala Google Maps: baris foto (1-2 gambar),
 * nama bisnis, baris rating/kategori, lalu status jam buka.
 * Ini string HTML biasa (bukan JSX) karena Leaflet popup butuh HTML mentah.
 */
function buildPopupHtml(biz) {
  const photos = [biz.img, ...(biz.images || [])].filter(Boolean).slice(0, 2);

  const photosHtml = photos.length === 0
    ? ""
    : photos.length === 1
      ? `<div class="biz-map-popup__photos biz-map-popup__photos--one">
           <img src="${escapeAttr(photos[0])}" alt="${escapeAttr(biz.name)}" />
         </div>`
      : `<div class="biz-map-popup__photos">
           ${photos.map((src) => `<img src="${escapeAttr(src)}" alt="${escapeAttr(biz.name)}" />`).join("")}
         </div>`;

  // Baris rating cuma tampil kalau memang ada data rating asli (belum ada
  // sistem review, jadi ini akan otomatis muncul begitu field rating diisi
  // dari backend). Kalau belum ada, tampilkan kategori saja.
  const metaHtml = biz.rating
    ? `<p class="biz-map-popup__meta">
         <span class="biz-map-popup__rating">${biz.rating.toFixed(1).replace(".", ",")} ★</span>
         ${biz.reviewCount ? `(${biz.reviewCount})` : ""} · ${escapeHtml(biz.category)}
       </p>`
    : `<p class="biz-map-popup__meta biz-map-popup__meta--category">${escapeHtml(biz.category)}</p>`;

  const statusHtml = `
    <p class="biz-map-popup__status">
      <span class="${biz.status === "Buka Sekarang" ? "is-open" : "is-closed"}">${escapeHtml(biz.status)}</span>
      ${biz.hours ? ` · ${escapeHtml(biz.hours)}` : ""}
    </p>`;

  return `
    <div class="biz-map-popup__card">
      ${photosHtml}
      <div class="biz-map-popup__body">
        <p class="biz-map-popup__name">${escapeHtml(biz.name)}</p>
        ${metaHtml}
        ${statusHtml}
        <a class="biz-map-popup__cta" href="/business/${biz.id}">Lihat Detail →</a>
      </div>
    </div>
  `;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str = "") {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function jitterFor(id) {
  const seed = String(id)
    .split("")
    .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 0.01 + ((seed % 10) / 10) * 0.02; // ~1km - ~3km
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}