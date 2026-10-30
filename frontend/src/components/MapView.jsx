import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Eye, Clock, Plus, Minus, Crosshair } from 'lucide-react';
import { getScheduleForDay, isOpenNow } from '../utils/businessHours';
import { getStorageUrl } from '../utils/constants';
import './MapView.css';

// Zero-network-request inline SVG markers (Prevents browser Tracking Prevention warnings)
const createSvgMarkerIcon = (color = '#007570') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
    <path fill="${color}" stroke="#FFFFFF" stroke-width="1.8" d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"/>
    <circle cx="12" cy="12" r="4.5" fill="#FFFFFF"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: `<div style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3)); display: flex; align-items: center; justify-content: center;">${svg}</div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -40]
  });
};

// Green marker icon for general businesses
const greenIcon = createSvgMarkerIcon('#007570');

// Teal/Cyan marker for single business detail
const tealIcon = createSvgMarkerIcon('#0284c7');

// Custom on-map zoom in / zoom out & recenter controls
function MapCustomControls({ validBusinesses }) {
  const map = useMap();

  const handleZoomIn = (e) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    map.zoomOut();
  };

  const handleRecenter = (e) => {
    e.stopPropagation();
    if (validBusinesses.length === 1) {
      map.setView([parseFloat(validBusinesses[0].latitude), parseFloat(validBusinesses[0].longitude)], 15);
    } else if (validBusinesses.length > 1) {
      const bounds = L.latLngBounds(
        validBusinesses.map((b) => [parseFloat(b.latitude), parseFloat(b.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView([-7.3444, 106.5866], 13);
    }
  };

  return (
    <div className="custom-map-controls">
      <button
        type="button"
        className="map-control-btn"
        onClick={handleZoomIn}
        aria-label="Perbesar Peta"
        title="Perbesar Peta (+)"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="map-control-btn"
        onClick={handleZoomOut}
        aria-label="Perkecil Peta"
        title="Perkecil Peta (-)"
      >
        <Minus size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        className="map-control-btn map-control-btn--center"
        onClick={handleRecenter}
        aria-label="Pusatkan Peta"
        title="Pusatkan Peta ke Lokasi Usaha"
      >
        <Crosshair size={16} strokeWidth={2.2} />
      </button>
    </div>
  );
}

// Component untuk auto-fit bounds ketika businesses berubah tanpa spamming tile requests
function FitBounds({ businesses }) {
  const map = useMap();
  const prevBizKey = useRef('');

  useEffect(() => {
    if (!map || !map._loaded) return;

    const validBusinesses = (businesses || []).filter(
      (b) => b.latitude && b.longitude && !isNaN(parseFloat(b.latitude)) && !isNaN(parseFloat(b.longitude))
    );

    const currentBizKey = validBusinesses
      .map((b) => `${b.id || b.slug}-${b.latitude}-${b.longitude}`)
      .join('|');

    // Mencegah perulangan fitBounds & tile request jika data bisnis sama
    if (currentBizKey === prevBizKey.current) return;
    prevBizKey.current = currentBizKey;

    if (validBusinesses.length === 1) {
      map.setView([parseFloat(validBusinesses[0].latitude), parseFloat(validBusinesses[0].longitude)], 15);
    } else if (validBusinesses.length > 1) {
      const bounds = L.latLngBounds(
        validBusinesses.map((b) => [parseFloat(b.latitude), parseFloat(b.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [businesses, map]);

  // Handle invalidateSize sekali saat mount secara terisolasi tanpa memicu loop tile
  useEffect(() => {
    if (!map || !map._loaded) return;
    const timer = setTimeout(() => {
      try {
        if (map && map._loaded) {
          map.invalidateSize();
        }
      } catch (err) {
        console.warn('Map invalidateSize error:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

/**
 * MapView Component
 * Props:
 * - businesses: array of business objects with latitude, longitude
 * - height: map height (default: '400px')
 * - showOpenInMaps: show "Open in Maps" button (default: false)
 * - singleBusiness: single business object for detail view
 */
export default function MapView({ 
  businesses = [], 
  height = '400px', 
  showOpenInMaps = false,
  singleBusiness = null 
}) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // If singleBusiness provided, use it; otherwise use businesses array
  const businessesToShow = singleBusiness ? [singleBusiness] : businesses;
  
  // Filter businesses with valid coordinates
  const validBusinesses = businessesToShow.filter(
    b => b.latitude && b.longitude && 
         !isNaN(parseFloat(b.latitude)) && 
         !isNaN(parseFloat(b.longitude))
  );
  
  if (validBusinesses.length === 0) {
    return (
      <div className="map-view-empty" style={{ height }}>
        <MapPin size={48} />
        <p>Tidak ada data lokasi yang tersedia</p>
      </div>
    );
  }
  
  // Default center: first business or Surade center
  const defaultCenter = validBusinesses.length > 0 
    ? [parseFloat(validBusinesses[0].latitude), parseFloat(validBusinesses[0].longitude)]
    : [-7.3444, 106.5866]; // Surade, Sukabumi
  
  const handleBusinessClick = (business) => {
    navigate(`/business/${business.slug || business.id}`);
  };
  
  const handleOpenInMaps = (business) => {
    const villageName = business.village?.name || (typeof business.village === 'string' ? business.village : '');
    const formattedVillage = villageName
      ? (villageName.toLowerCase().startsWith('desa') || villageName.toLowerCase().startsWith('kelurahan')
          ? villageName
          : `Desa ${villageName}`)
      : null;

    const addressParts = [
      business.name,
      business.address,
      formattedVillage,
      "Kecamatan Surade",
      "Kabupaten Sukabumi",
      "Jawa Barat"
    ].filter(Boolean);

    const fullQuery = addressParts.join(", ");

    // Open Google Maps Directions (origin defaults to user's current GPS location)
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullQuery)}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };
  
  // Helper to get image URL
  const getImageUrl = (business) => {
    if (business.img) return business.img;
    return getStorageUrl(business.banner || business.logo) || "/images/businesses/pasar.jpg";
  };
  
  return (
    <div className="map-view-container" style={{ height: height || '100%', minHeight: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', flex: 1, borderRadius: '12px', zIndex: 1 }}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        boxZoom={true}
        zoomControl={false}
        tap={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={['a', 'b', 'c']}
          maxZoom={19}
        />
        
        <FitBounds businesses={validBusinesses} />

        <ClusteredMapView 
          validBusinesses={validBusinesses}
          singleBusiness={singleBusiness}
          handleBusinessClick={handleBusinessClick}
          handleOpenInMaps={handleOpenInMaps}
          getImageUrl={getImageUrl}
        />

        <MapCustomControls validBusinesses={validBusinesses} />
      </MapContainer>
      
      {showOpenInMaps && singleBusiness && (
        <button
          type="button"
          className="map-open-in-maps-btn"
          onClick={() => handleOpenInMaps(singleBusiness)}
        >
          <Navigation size={18} />
          <span>Open in Maps</span>
        </button>
      )}
    </div>
  );
}

function clusterPoints(points, map, zoom) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) {
    return [{
      items: points,
      centroidLat: parseFloat(points[0].latitude),
      centroidLng: parseFloat(points[0].longitude),
    }];
  }

  // Dynamic pixel radius:
  // At district zoom (zoom <= 12), merge nearby items into single cluster (e.g. 6)
  // At village / street zoom (zoom >= 15), separate out into individual pins
  const clusterRadiusPx = zoom <= 10 ? 90 : zoom <= 12 ? 70 : zoom <= 13 ? 55 : 40;
  const clusters = [];

  points.forEach((p) => {
    const lat = parseFloat(p.latitude);
    const lng = parseFloat(p.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    let bestCluster = null;
    let bestDist = Infinity;

    if (map && typeof map.project === 'function') {
      const pPoint = map.project([lat, lng], zoom);
      for (const c of clusters) {
        const cPoint = map.project([c.centroidLat, c.centroidLng], zoom);
        const dist = pPoint.distanceTo(cPoint);
        if (dist < clusterRadiusPx && dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
    } else {
      const clusterDistDeg = zoom <= 12 ? 0.08 : 0.015;
      for (const c of clusters) {
        const dist = Math.hypot(lat - c.centroidLat, lng - c.centroidLng);
        if (dist < clusterDistDeg && dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
    }

    if (bestCluster) {
      bestCluster.items.push(p);
      bestCluster.centroidLat =
        bestCluster.items.reduce((s, m) => s + parseFloat(m.latitude), 0) / bestCluster.items.length;
      bestCluster.centroidLng =
        bestCluster.items.reduce((s, m) => s + parseFloat(m.longitude), 0) / bestCluster.items.length;
    } else {
      clusters.push({
        items: [p],
        centroidLat: lat,
        centroidLng: lng,
      });
    }
  });

  return clusters;
}

function spreadOverlappingPoints(items) {
  if (items.length <= 1) return items;
  const spread = items.map((it) => ({
    ...it,
    lat: parseFloat(it.latitude),
    lng: parseFloat(it.longitude),
  }));

  const MIN_DIST = 0.0015; // ~150m offset for close markers
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < spread.length; i++) {
      for (let j = i + 1; j < spread.length; j++) {
        const dLat = spread[j].lat - spread[i].lat;
        const dLng = spread[j].lng - spread[i].lng;
        const dist = Math.hypot(dLat, dLng) || 0.00005;
        if (dist < MIN_DIST) {
          const push = (MIN_DIST - dist) / 2;
          const uy = dLat / dist;
          const ux = dLng / dist;
          spread[i].lat -= uy * push;
          spread[i].lng -= ux * push;
          spread[j].lat += uy * push;
          spread[j].lng += ux * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return spread;
}

const createClusterIcon = (count) => {
  return L.divIcon({
    html: `<div class="custom-leaflet-cluster-badge">${count}</div>`,
    className: 'custom-leaflet-cluster-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

function ClusteredMapView({ validBusinesses, singleBusiness, handleBusinessClick, handleOpenInMaps, getImageUrl }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
    moveend: () => setZoom(map.getZoom()),
  });

  const clusters = useMemo(
    () => clusterPoints(validBusinesses, map, zoom),
    [validBusinesses, map, zoom]
  );

  return clusters.map((cluster, cIdx) => {
    const isExpanded = cluster.items.length === 1 || zoom >= 15;

    if (isExpanded) {
      const items = cluster.items.length > 1 ? spreadOverlappingPoints(cluster.items) : cluster.items;
      return items.map((business) => {
        const position = [business.lat || parseFloat(business.latitude), business.lng || parseFloat(business.longitude)];
        const markerIcon = singleBusiness ? tealIcon : greenIcon;

        return (
          <Marker key={`marker-${business.id || business.slug}-${business.lat || business.latitude}`} position={position} icon={markerIcon}>
            <Popup className="map-popup" maxWidth={260}>
              <div className="map-popup-content">
                <div className="map-popup-image">
                  <img src={getImageUrl(business)} alt={business.name} />
                </div>
                <div className="map-popup-body">
                  <h3 className="map-popup-title">{business.name}</h3>
                  {business.category && (
                    <div className="map-popup-category">
                      <span className="map-popup-badge">
                        {typeof business.category === 'object' ? business.category.name : business.category}
                      </span>
                    </div>
                  )}
                  {(() => {
                    const todaySchedule = business.opening_days ? getScheduleForDay(business.opening_days) : null;
                    const calculatedIsOpen = business.opening_days ? isOpenNow(business.opening_days) : null;

                    let hoursStr = "";
                    if (todaySchedule && todaySchedule.open && todaySchedule.close) {
                      if (todaySchedule.open === "00:00" && (todaySchedule.close === "23:59" || todaySchedule.close === "24:00" || todaySchedule.close === "00:00")) {
                        hoursStr = "24 Jam";
                      } else {
                        hoursStr = `${todaySchedule.open} - ${todaySchedule.close}`;
                      }
                    } else if (business.operating_hours || business.opening_hours || business.hours) {
                      hoursStr = business.operating_hours || business.opening_hours || business.hours;
                    } else if (business.open_time && business.close_time) {
                      hoursStr = `${business.open_time} - ${business.close_time}`;
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
                      if (business.is_open_now != null) return Boolean(business.is_open_now);
                      if (business.open !== undefined) return Boolean(business.open);
                      return true;
                    })();

                    const displayHours = hoursStr || (isOpen ? "Buka Hari Ini" : "Tutup Hari Ini");

                    return (
                      <div className="map-popup-hours">
                        <Clock size={11} className={isOpen ? "text-emerald-600 shrink-0" : "text-rose-500 shrink-0"} />
                        <span className={`map-popup-status-pill ${isOpen ? "map-popup-status-pill--open" : "map-popup-status-pill--closed"}`}>
                          {isOpen ? "Buka Sekarang" : "Tutup"}
                        </span>
                        <span className="map-popup-hours-text">
                          {displayHours}
                        </span>
                      </div>
                    );
                  })()}
                  {business.address && (
                    <p className="map-popup-address">
                      <MapPin size={12} />
                      <span>{business.address}</span>
                    </p>
                  )}
                  {business.views !== undefined && (
                    <p className="map-popup-views">
                      <Eye size={12} />
                      <span>{business.views} kunjungan</span>
                    </p>
                  )}
                </div>
                <div className="map-popup-actions">
                  <button 
                    type="button"
                    className="map-popup-btn map-popup-btn--primary"
                    onClick={() => handleBusinessClick(business)}
                  >
                    Lihat Detail
                  </button>
                  <button 
                    type="button"
                    className="map-popup-btn map-popup-btn--secondary"
                    onClick={() => handleOpenInMaps(business)}
                  >
                    <Navigation size={12} />
                    Navigasi
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      });
    }

    return (
      <Marker
        key={`cluster-${cIdx}-${cluster.items.length}-${zoom}`}
        position={[cluster.centroidLat, cluster.centroidLng]}
        icon={createClusterIcon(cluster.items.length)}
        eventHandlers={{
          click: () => {
            const bounds = L.latLngBounds(
              cluster.items.map((it) => [parseFloat(it.latitude), parseFloat(it.longitude)])
            );
            if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
              map.setView(bounds.getCenter(), Math.min(map.getMaxZoom(), Math.max(15, map.getZoom() + 3)));
            } else {
              map.fitBounds(bounds.pad(0.35), { maxZoom: 16 });
            }
          },
        }}
      />
    );
  });
}
