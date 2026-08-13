import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Store, MapPin, Star, Users, Building2, ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import "./LocationDetail.css";

export default function LocationDetail() {
  const { slug } = useParams();
  const [location, setLocation] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLocationData();
  }, [slug]);

  const fetchLocationData = async () => {
    setLoading(true);
    try {
      const fetchLoc = fetch(`${import.meta.env.VITE_API_URL}/locations/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Location not found');
          return res.json();
        })
        .then(locData => {
          setLocation(locData.data || locData);
        });

      const fetchBiz = fetch(`${import.meta.env.VITE_API_URL}/businesses?location=${slug}`)
        .then(res => res.json())
        .then(bizData => {
          const businessesList = bizData?.data || bizData || [];
          setBusinesses(Array.isArray(businessesList) ? businessesList : []);
        });

      await Promise.allSettled([fetchLoc, fetchBiz]);
    } catch (err) {
      console.error("Failed to fetch location data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="location-detail-page">
        <Navbar />
        <div className="location-detail__loading">
          <Loader2 size={32} className="spin" />
          <p>Memuat data lokasi...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-detail-page">
        <Navbar />
        <div className="location-detail__error">
          <p>Lokasi tidak ditemukan.</p>
          <Link to="/" className="btn-primary">
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const stats = {
    businessCount: businesses.length,
    umkmCount: businesses.filter(b => b.is_umkm).length,
    categoryCount: [...new Set(businesses.map(b => b.category?.name).filter(Boolean))].length,
    avgRating: businesses.length > 0 
      ? businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / businesses.length 
      : 0
  };

  return (
    <div className="location-detail-page">
      <Navbar />
      
      {/* Header */}
      <header className="location-detail__header">
        <div className="location-detail__header-bg">
          <img src={location.image} alt={location.name} className="location-detail__header-img" />
          <div className="location-detail__header-overlay" />
        </div>
        <div className="location-detail__header-content">
          <Link to="/" className="location-detail__back">
            <ArrowLeft size={20} />
            Kembali
          </Link>
          <h1 className="location-detail__title">{location.name}</h1>
          <p className="location-detail__subtitle">
            {location.type === 'smart_city' ? 'Smart City' : 'Smart Village'}
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="location-detail__stats">
        <div className="location-detail__stats-inner">
          <div className="location-detail__stat-card">
            <Building2 size={32} />
            <div>
              <p className="location-detail__stat-value">{stats.businessCount}</p>
              <p className="location-detail__stat-label">Bisnis</p>
            </div>
          </div>
          <div className="location-detail__stat-card">
            <Store size={32} />
            <div>
              <p className="location-detail__stat-value">{stats.umkmCount}</p>
              <p className="location-detail__stat-label">UMKM</p>
            </div>
          </div>
          <div className="location-detail__stat-card">
            <Users size={32} />
            <div>
              <p className="location-detail__stat-value">{stats.categoryCount}</p>
              <p className="location-detail__stat-label">Kategori</p>
            </div>
          </div>
          <div className="location-detail__stat-card">
            <Star size={32} />
            <div>
              <p className="location-detail__stat-value">{stats.avgRating.toFixed(1)}</p>
              <p className="location-detail__stat-label">Rating Rata-rata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="location-detail__description">
        <div className="location-detail__description-inner">
          <h2>Tentang {location.name}</h2>
          <p>{location.description || 'Tidak ada deskripsi tersedia.'}</p>
          {location.highlights && location.highlights.length > 0 && (
            <div className="location-detail__highlights">
              <h3>Highlight</h3>
              <ul>
                {location.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Businesses */}
      <section className="location-detail__businesses">
        <div className="location-detail__businesses-inner">
          <h2>Bisnis di {location.name}</h2>
          {businesses.length > 0 ? (
            <div className="location-detail__business-grid">
              {businesses.map((business) => (
                <Link 
                  key={business.id} 
                  to={`/business/${business.id}`}
                  className="location-detail__business-card"
                >
                  <div className="location-detail__business-img-wrap">
                    <img 
                      src={business.logo || business.banner || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop"} 
                      alt={business.name} 
                      className="location-detail__business-img" 
                    />
                  </div>
                  <div className="location-detail__business-content">
                    <h3>{business.name}</h3>
                    <p className="location-detail__business-category">
                      {business.category?.name || 'Umum'}
                    </p>
                    <p className="location-detail__business-location">
                      <MapPin size={14} />
                      {business.city || location.name}
                    </p>
                    {business.rating && (
                      <p className="location-detail__business-rating">
                        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                        {business.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="location-detail__empty">
              <Store size={48} />
              <p>Belum ada bisnis terdaftar di {location.name}</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="location-detail__footer">
        <p>&copy; {new Date().getFullYear()} Info.co.id - Smart City & Smart Village Directory</p>
      </footer>
    </div>
  );
}
