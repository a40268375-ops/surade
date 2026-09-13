import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Eye } from 'lucide-react';
import './MapView.css';

// Fix untuk marker icon default Leaflet yang hilang di Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker icon (untuk semua bisnis)
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Teal/Cyan marker for single business detail (lebih cerah)
const tealIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
