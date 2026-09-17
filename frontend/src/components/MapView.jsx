import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Eye } from 'lucide-react';
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

// Component untuk auto-fit bounds ketika businesses berubah
function FitBounds({ businesses }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !map._loaded) return;
    
    // Invalidate size untuk memastikan map render dengan benar
    setTimeout(() => {
      try {
        if (map && map._loaded) {
          map.invalidateSize();
        }
      } catch (err) {
        console.warn('Map invalidateSize error:', err);
      }
    }, 100);
    
    if (businesses && businesses.length > 0) {
      const validBusinesses = businesses.filter(b => b.latitude && b.longitude);
      
      if (validBusinesses.length === 1) {
        // Single marker: center on it
        map.setView([validBusinesses[0].latitude, validBusinesses[0].longitude], 15);
      } else if (validBusinesses.length > 1) {
        // Multiple markers: fit bounds
        const bounds = L.latLngBounds(
          validBusinesses.map(b => [b.latitude, b.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [businesses, map]);
  
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
    const lat = business.latitude;
    const lng = business.longitude;
    const name = encodeURIComponent(business.name);
    
    // Open Google Maps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };
  
  // Helper to get image URL
  const getImageUrl = (business) => {
    if (business.img) return business.img;
    if (business.logo) {
      const logo = business.logo;
      if (logo.startsWith('http')) return logo;
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/i, '') || '';
      return `${baseUrl}/storage/${logo}`;
    }
    if (business.banner) {
      const banner = business.banner;
      if (banner.startsWith('http')) return banner;
      const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/i, '') || '';
      return `${baseUrl}/storage/${banner}`;
    }
    return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop';
  };
  
  return (
    <div className="map-view-container" style={{ height, position: 'relative' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '12px', zIndex: 1 }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <FitBounds businesses={validBusinesses} />
        
        {validBusinesses.map((business) => {
          const position = [parseFloat(business.latitude), parseFloat(business.longitude)];
          const markerIcon = singleBusiness ? tealIcon : greenIcon;
          
          return (
            <Marker 
              key={business.id} 
              position={position}
              icon={markerIcon}
            >
              <Popup className="map-popup" maxWidth={280}>
                <div className="map-popup-content">
                  {/* Business Image */}
                  <div className="map-popup-image">
                    <img src={getImageUrl(business)} alt={business.name} />
                  </div>
                  
                  <h3 className="map-popup-title">{business.name}</h3>
                  
                  {business.category && (
                    <p className="map-popup-category">
                      <span className="map-popup-badge">
                        {typeof business.category === 'object' ? business.category.name : business.category}
                      </span>
                    </p>
                  )}
                  
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
        })}
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
