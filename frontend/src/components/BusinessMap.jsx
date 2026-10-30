import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { findLocationCoords, DEFAULT_LOCATION } from "../data/idLocations";
import { getScheduleForDay, isOpenNow } from "../utils/businessHours";
import "./BusinessMap.css";

// Di zoom berapa pin-pin yang berdekatan mulai "dipecah" jadi satu-satu.
const CLUSTER_ZOOM_THRESHOLD = 12;

// Jarak (dalam derajat, ~1 derajat ≈ 111km) - dua bisnis dianggap
// "berdekatan" dan digabung jadi 1 bulatan angka kalau jaraknya di bawah
// ini. ~0.012 derajat ≈ 1.3km.
const CLUSTER_DISTANCE = 0.012;

// Jarak minimal antar pin biar nggak numpuk pas sudah "dipecah" satu-satu.
const MIN_PIN_DISTANCE = 0.0035; // ~350-400m

/**
 * Peta interaktif daftar bisnis (dipakai di halaman Kategori & Smart City -
 * pakai react-leaflet, lihat riwayat perbaikan sebelumnya kenapa cara ini
 * yang dipilih).
 *
 * `fallbackCenter`/`fallbackZoom` (opsional): dipakai halaman Smart City
 * supaya peta desa langsung fokus ke desa itu dari awal (bukan zoom ke
 * seluruh Indonesia dulu), termasuk pas bisnisnya masih 0 di desa itu.
 */
export default function BusinessMap({ businesses = [], fallbackCenter = null, fallbackZoom = 14 }) {
  const rawPoints = useMemo(() => resolvePoints(businesses), [businesses]);
  const clusters = useMemo(() => clusterByDistance(rawPoints), [rawPoints]);

  return (
    <div className="biz-map">
      <MapContainer
        center={fallbackCenter || [-2.5, 118]}
        zoom={fallbackCenter ? fallbackZoom : 5}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        zoomControl={true}
        className="biz-map__canvas"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          subdomains={['a', 'b', 'c']}
          maxZoom={19}
        />
        <InvalidateOnResize />
        <FitBounds points={rawPoints} fallbackCenter={fallbackCenter} fallbackZoom={fallbackZoom} />
        <ClusteredMarkers clusters={clusters} />
      </MapContainer>
    </div>
  );
}

/**
 * Untuk tiap bisnis, tentukan titik koordinatnya:
 * 1) Kalau sudah punya latitude/longitude ASLI (diisi pemilik usaha) →
 *    pakai itu apa adanya, akurat.
 * 2) Kalau belum → perkiraan dari nama desa/kota di alamat, digeser
 *    sedikit (konsisten per id bisnis) supaya bisnis lain yang alamatnya
 *    kebetulan sama teksnya tidak numpuk persis di 1 titik.
 */
function resolvePoints(businesses) {
  return businesses.map((b) => {
    const hasRealCoords =
      typeof b.latitude === "number" && !Number.isNaN(b.latitude) &&
      typeof b.longitude === "number" && !Number.isNaN(b.longitude);

    if (hasRealCoords) {
      return { ...b, lat: b.latitude, lng: b.longitude, isExactLocation: true };
    }

    const match = findLocationCoords(b.location || "") || DEFAULT_LOCATION;
    const [dLat, dLng] = jitterFor(b.id);
    return {
      ...b,
      lat: match.lat + dLat,
      lng: match.lng + dLng,
      isExactLocation: false,
    };
  });
}

/**
 * Kelompokkan titik yang berdekatan jadi 1 cluster.
 *
 * PERBAIKAN: sebelumnya pakai cara "greedy" yang bisa bikin cluster
 * "berantai" kepanjangan - titik A dekat B, B dekat C, tapi A & C
 * sebenarnya sudah lumayan jauh, akhirnya A-B-C dipaksa jadi 1 bulatan
 * angka yang mewakili area yang kelewat luas. Sekarang tiap titik
 * dicocokkan ke TITIK TENGAH (centroid) cluster terdekat yang sudah ada
 * (bukan ke anggota mana pun di dalamnya), dan centroid itu dihitung
 * ulang tiap kali ada anggota baru masuk - jadi cluster nggak "melar"
 * jauh dari pusatnya, dan area yang beneran terpisah akan tetap
 * ditampilkan sebagai 2 bulatan angka terpisah, bukan digabung jadi 1.
 */
function clusterByDistance(points) {
  const clusters = [];

  points.forEach((p) => {
    let best = null;
    let bestDist = Infinity;
    for (const c of clusters) {
      const d = Math.hypot(p.lat - c.centroidLat, p.lng - c.centroidLng);
      if (d < CLUSTER_DISTANCE && d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    if (best) {
      best.members.push(p);
      best.centroidLat = best.members.reduce((s, m) => s + m.lat, 0) / best.members.length;
      best.centroidLng = best.members.reduce((s, m) => s + m.lng, 0) / best.members.length;
    } else {
      clusters.push({ members: [p], centroidLat: p.lat, centroidLng: p.lng });
    }
  });

  return clusters.map((c) => ({
    key: c.members.map((m) => m.id).join("-"),
    centroidLat: c.centroidLat,
    centroidLng: c.centroidLng,
    items: spreadIfOverlapping(c.members),
  }));
}

/**
 * Kalau di dalam 1 cluster masih ada 2 pin yang jaraknya kurang dari
 * MIN_PIN_DISTANCE (numpuk/nyaris numpuk), dorong menjauh SECUKUPNYA
 * saja - bukan diatur ulang total ke pola tertentu - supaya tetap
 * kelihatan sesuai lokasi asli tapi tetap bisa diklik satu-satu.
 */
function spreadIfOverlapping(items) {
  if (items.length <= 1) return items;
  const spread = items.map((it) => ({ ...it }));

  for (let pass = 0; pass < 6; pass++) {
    let movedAny = false;
    for (let i = 0; i < spread.length; i++) {
      for (let j = i + 1; j < spread.length; j++) {
        const a = spread[i];
        const b = spread[j];
        const dLat = b.lat - a.lat;
        const dLng = b.lng - a.lng;
        const dist = Math.hypot(dLat, dLng) || 0.0001;
        if (dist < MIN_PIN_DISTANCE) {
          const push = (MIN_PIN_DISTANCE - dist) / 2;
          const uy = dLat / dist;
          const ux = dLng / dist;
          a.lat -= uy * push;
          a.lng -= ux * push;
          b.lat += uy * push;
          b.lng += ux * push;
          movedAny = true;
        }
      }
    }
    if (!movedAny) break;
  }
  return spread;
}

/** Ukur ulang peta tiap kali ukuran boks pembungkusnya berubah. */
function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const invalidate = () => map.invalidateSize();
    const t1 = setTimeout(invalidate, 0);
    const t2 = setTimeout(invalidate, 300);
    const resizeObserver = new ResizeObserver(invalidate);
    resizeObserver.observe(container);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
    };
  }, [map]);
  return null;
}

/**
 * Zoom & geser peta otomatis supaya semua pin bisnis kelihatan sekaligus.
 * Kalau bisnisnya masih 0 (mis. desa yang belum ada usaha terdaftar di
 * Smart City) tapi ada fallbackCenter, peta tetap fokus ke situ - bukan
 * balik ke posisi default seluruh Indonesia.
 */
function FitBounds({ points, fallbackCenter, fallbackZoom }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds.pad(0.3), { maxZoom: 12 });
    } else if (fallbackCenter) {
      map.setView(fallbackCenter, fallbackZoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, map]);
  return null;
}

/**
 * Tiap cluster: tampilkan sebagai SATU bulatan angka (kalau anggotanya
 * lebih dari 1 & peta masih di-zoom jauh), atau pecah jadi pin
 * satu-satu (kalau anggotanya cuma 1, ATAU peta sudah cukup dekat).
 */
function ClusteredMarkers({ clusters }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  return clusters.map((cluster) => {
    const isExpanded = cluster.items.length === 1 || zoom >= CLUSTER_ZOOM_THRESHOLD;

    if (isExpanded) {
      return cluster.items.map((biz) => (
        <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={pinIcon()}>
          <Popup className="biz-map-popup" maxWidth={260} minWidth={240}>
            <PopupCard biz={biz} />
          </Popup>
        </Marker>
      ));
    }

    return (
      <Marker
        key={`cluster-${cluster.key}`}
        position={[cluster.centroidLat, cluster.centroidLng]}
        icon={clusterIcon(cluster.items.length)}
        eventHandlers={{
          click: () => {
            // Klik bulatan angka -> zoom & geser peta pas ke area
            // kelompok itu, otomatis "memecah" jadi pin satu-satu -
            // lebih gampang dilihat & diklik satu-satu.
            const bounds = L.latLngBounds(cluster.items.map((it) => [it.lat, it.lng]));
            map.fitBounds(bounds.pad(0.8), { maxZoom: CLUSTER_ZOOM_THRESHOLD + 2 });
          },
        }}
      />
    );
  });
}

function pinIcon() {
  return L.divIcon({
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
}

function clusterIcon(count) {
  return L.divIcon({
    html: `<div class="biz-map-cluster">${count}</div>`,
    className: "biz-map-cluster-wrap",
    iconSize: [40, 40],
  });
}

/**
 * Isi kartu popup ala Google Maps: baris foto (1-2 gambar), nama bisnis,
 * baris rating/kategori, ALAMAT (baru ditambahkan), lalu status jam buka.
 */
function PopupCard({ biz }) {
  const photos = [biz.img, ...(biz.images || [])].filter(Boolean).slice(0, 2);
  const addressText = biz.address || biz.location || "";

  const todaySchedule = biz.opening_days ? getScheduleForDay(biz.opening_days) : null;
  const calculatedIsOpen = biz.opening_days ? isOpenNow(biz.opening_days) : null;

  let hoursStr = "";
  if (todaySchedule && todaySchedule.open && todaySchedule.close) {
    if (todaySchedule.open === "00:00" && (todaySchedule.close === "23:59" || todaySchedule.close === "24:00" || todaySchedule.close === "00:00")) {
      hoursStr = "24 Jam";
    } else {
      hoursStr = `${todaySchedule.open} - ${todaySchedule.close}`;
    }
  } else if (biz.operating_hours || biz.opening_hours || biz.hours) {
    hoursStr = biz.operating_hours || biz.opening_hours || biz.hours;
  } else if (biz.open_time && biz.close_time) {
    hoursStr = `${biz.open_time} - ${biz.close_time}`;
  }
  
  const isOpen = (() => {
    if (calculatedIsOpen !== null) return calculatedIsOpen;
    if (hoursStr) {
      if (/24\s*(jam|hours?)/i.test(hoursStr)) return true;
      const match = String(hoursStr).match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/);
      if (match) {
        const openMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        const closeMin = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
        const now = new Date();
        const curMin = now.getHours() * 60 + now.getMinutes();
        if (closeMin >= openMin) return curMin >= openMin && curMin <= closeMin;
        return curMin >= openMin || curMin <= closeMin;
      }
    }
    if (biz.is_open_now != null) return Boolean(biz.is_open_now);
    if (biz.status === "Buka Sekarang") return true;
    if (biz.status === "Tutup") return false;
    return true;
  })();

  const statusLabel = isOpen ? "Buka Sekarang" : "Tutup";
  const displayHours = hoursStr || (isOpen ? "Buka Hari Ini" : "Tutup Hari Ini");

  return (
    <div className="biz-map-popup__card">
      {photos.length > 0 && (
        <div
          className={`biz-map-popup__photos${photos.length === 1 ? " biz-map-popup__photos--one" : ""}`}
        >
          {photos.map((src) => (
            <img key={src} src={src} alt={biz.name} />
          ))}
        </div>
      )}
      <div className="biz-map-popup__body">
        <p className="biz-map-popup__name">{biz.name}</p>
        {biz.rating ? (
          <p className="biz-map-popup__meta">
            <span className="biz-map-popup__rating">
              {biz.rating.toFixed(1).replace(".", ",")} ★
            </span>{" "}
            {biz.reviewCount ? `(${biz.reviewCount})` : ""} · {biz.category}
          </p>
        ) : (
          <p className="biz-map-popup__meta biz-map-popup__meta--category">{biz.category}</p>
        )}
        {addressText && (
          <p className="biz-map-popup__address">{addressText}</p>
        )}
        <p className="biz-map-popup__status">
          <span className={isOpen ? "is-open" : "is-closed"}>
            {statusLabel}
          </span>
          {displayHours ? ` · ${displayHours}` : ""}
        </p>
        <a className="biz-map-popup__cta" href={`/business/${biz.id}`}>
          Lihat Detail →
        </a>
      </div>
    </div>
  );
}

function jitterFor(id) {
  const seed = String(id)
    .split("")
    .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 0.001 + ((seed % 10) / 10) * 0.0025; // ~150m - ~400m
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}