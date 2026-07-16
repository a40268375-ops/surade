import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, MapPin, Store, ArrowRight } from "lucide-react";
import { findLocationCoords, DEFAULT_LOCATION } from "../data/idLocations";
import "./BusinessMap.css";

/**
 * Peta interaktif daftar bisnis.
 *
 * PENTING: tiap BISNIS tampil sebagai pin-nya SENDIRI-SENDIRI di peta
 * (bukan cuma 1 pin per kota). Karena database bisnis cuma menyimpan
 * alamat sebagai teks (bukan lat/lng asli), posisi tiap pin dihitung
 * dari koordinat kota/kabupaten (idLocations.js) lalu digeser sedikit
 * secara acak (tapi konsisten per id bisnis, lihat `jitterFor`) supaya
 * bisnis-bisnis di kota yang sama tidak numpuk persis di titik yang sama
 * dan tetap bisa diklik satu-satu.
 *
 * Klik pin bisnis → muncul kartu kecil (popup panel) berisi nama,
 * kategori, alamat bisnis itu, dan tombol "Lihat Detail" yang membawa
 * ke halaman /business/:id.
 */
export default function BusinessMap({ businesses = [] }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  useEffect(() => {
    if (leafletReady) return;
    const t = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(t);
      }
    }, 150);
    return () => clearInterval(t);
  }, [leafletReady]);

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
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    const L = window.L;
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
      marker.on("click", () => setSelectedBusiness(biz));
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
      <div ref={mapContainerRef} className="biz-map__canvas">
        {!leafletReady && (
          <div className="biz-map__loading">Memuat peta…</div>
        )}
      </div>

      {selectedBusiness && (
        <div className="biz-map__panel biz-map__panel--single">
          <button
            type="button"
            className="biz-map__panel-close biz-map__panel-close--float"
            onClick={() => setSelectedBusiness(null)}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>

          <div className="biz-map__single-icon">
            <Store size={20} />
          </div>
          <p className="biz-map__single-name">{selectedBusiness.name}</p>
          <p className="biz-map__single-category">{selectedBusiness.category}</p>
          <p className="biz-map__single-loc">
            <MapPin size={13} />
            {selectedBusiness.location}
          </p>

          <Link to={`/business/${selectedBusiness.id}`} className="biz-map__single-cta">
            Lihat Detail
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
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