import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { getStorageUrl } from "../utils/constants";
import {
  ChevronDown,
  MapPin,
  Building2,
  Users,
  TrendingUp,
  Star,
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Compass,
  Eye,
  SlidersHorizontal,
  Info
} from "lucide-react";
import "./SmartCity.css";

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "store": return <Store size={18} />;
    case "coffee": return <Coffee size={18} />;
    case "smartphone": return <Smartphone size={18} />;
    case "shirt": return <Shirt size={18} />;
    case "wrench": return <Wrench size={18} />;
    default: return <Store size={18} />;
  }
};

export default function SmartCity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [smartCities, setSmartCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCitySlug, setSelectedCitySlug] = useState(id || "jakarta");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch all 8 Smart Cities
  useEffect(() => {
    const fetchSmartCities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/smart-cities`);
        if (!res.ok) throw new Error("Failed to fetch smart cities");
        const data = await res.json();
        const citiesData = data?.data || data || [];
        if (Array.isArray(citiesData)) {
          setSmartCities(citiesData);
          
          // Find city by param id (could be integer ID or slug)
          let current = citiesData.find((c) => String(c.id) === String(id) || c.slug === id);
          if (!current && citiesData.length > 0) {
            current = citiesData[0];
          }
          setCity(current || null);
          if (current) setSelectedCitySlug(current.slug);
        }
      } catch (err) {
        console.error("Error fetching smart cities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartCities();
  }, [id]);

  // Fetch Categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (Array.isArray(list)) {
          const mapped = [
            { id: "all", label: "Semua Kategori", icon: <Store size={18} /> },
            ...list.map((c) => ({
              id: c.slug,
              label: c.name,
              icon: getCategoryIcon(c.icon),
            })),
          ];
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch businesses for the current city
  useEffect(() => {
    if (!city) return;
    const fetchCityBusinesses = async () => {
      setLoadingBusinesses(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/businesses?location=${city.slug}&all=true`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBusinesses(list);
      } catch (err) {
        console.error("Error fetching city businesses:", err);
        setBusinesses([]);
      } finally {
        setLoadingBusinesses(false);
      }
    };

    fetchCityBusinesses();
  }, [city]);

  // Handle city selector click
  const handleSelectCity = (c) => {
    setCity(c);
    setSelectedCitySlug(c.slug);
    navigate(`/smart-city/${c.id}`);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const categoryName = (b.category?.name || b.category || "").toLowerCase();
    const matchesCategory = selectedCategory === "all" || categoryName.includes(selectedCategory.toLowerCase());
    
    const matchesSearch = !searchQuery ||
      (b.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.city || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="sc-page-loader">
        <Navbar />
        <div className="sc-spinner-container">
          <div className="sc-spinner" />
          <p>Memuat Data Smart City...</p>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="sc-page">
        <Navbar />
        <div className="sc-not-found">
          <Info size={48} className="sc-not-found__icon" />
          <h2>Kota Tidak Ditemukan</h2>
          <p>Kota yang Anda cari tidak tersedia dalam program Smart City &amp; Village.</p>
          <Link to="/" className="sc-btn sc-btn--primary">
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sc-page">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="sc-hero">
        <div className="sc-hero__bg">
          <img src={city.image || city.img} alt={city.name} className="sc-hero__img" />
          <div className="sc-hero__overlay" />
        </div>

        <div className="sc-hero__container">
          <div className="sc-hero__breadcrumb">
            <Link to="/">Beranda</Link>
            <ArrowRight size={14} />
            <span className="active">Smart City &amp; Village</span>
            <ArrowRight size={14} />
            <span className="current">{city.name}</span>
          </div>

          <div className="sc-hero__header">
            <div className="sc-hero__badge">
              <Sparkles size={14} />
              <span>Program Resmi Pemerintah</span>
            </div>
            <h1 className="sc-hero__title">
              Smart City <span>{city.name}</span>
            </h1>
            <p className="sc-hero__desc">{city.description}</p>
          </div>

          {/* Key Stats Counter */}
          <div className="sc-hero__stats">
            <div className="sc-stat-card">
              <div className="sc-stat-card__icon sc-stat-card__icon--teal">
                <Building2 size={24} />
              </div>
              <div className="sc-stat-card__info">
                <span className="sc-stat-card__num">{businesses.length > 0 ? businesses.length : (city.bisnis || 0)}</span>
                <span className="sc-stat-card__label">Bisnis &amp; UMKM Terdaftar</span>
              </div>
            </div>

            <div className="sc-stat-card">
              <div className="sc-stat-card__icon sc-stat-card__icon--blue">
                <Users size={24} />
              </div>
              <div className="sc-stat-card__info">
                <span className="sc-stat-card__num">{city.population || "1 Juta+"}</span>
                <span className="sc-stat-card__label">Jumlah Penduduk</span>
              </div>
            </div>

            <div className="sc-stat-card">
              <div className="sc-stat-card__icon sc-stat-card__icon--amber">
                <Compass size={24} />
              </div>
              <div className="sc-stat-card__info">
                <span className="sc-stat-card__num">{city.area || "500 km²"}</span>
                <span className="sc-stat-card__label">Luas Wilayah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITY QUICK SELECTOR (8 CITIES) ── */}
      <section className="sc-cities-selector">
        <div className="sc-container">
          <div className="sc-section-header">
            <div className="sc-section-header__title">
              <MapPin size={22} className="text-teal" />
              <h2>Jelajahi 8 Smart City &amp; Village Indonesia</h2>
            </div>
            <p>Pilih daerah untuk melihat direktori bisnis, layanan publik, dan program digital unggulan.</p>
          </div>

          <div className="sc-city-grid">
            {smartCities.map((c) => {
              const isSelected = String(c.id) === String(city.id) || c.slug === city.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`sc-city-card ${isSelected ? "sc-city-card--active" : ""}`}
                  onClick={() => handleSelectCity(c)}
                >
                  <div className="sc-city-card__thumb">
                    <img src={c.image || c.img} alt={c.name} />
                    <div className="sc-city-card__badge">{c.bisnis || 0} Bisnis</div>
                  </div>
                  <div className="sc-city-card__info">
                    <h3>{c.name}</h3>
                    <span className="sc-city-card__type">
                      {c.type === "smart_village" ? "Smart Village" : "Smart City"}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="sc-city-card__check" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT (HIGHLIGHTS & BUSINESS DIRECTORY) ── */}
      <main className="sc-main">
        <div className="sc-container">
          
          {/* Program Highlights */}
          {city.highlights && city.highlights.length > 0 && (
            <div className="sc-highlights-section">
              <div className="sc-section-header">
                <div className="sc-section-header__title">
                  <TrendingUp size={22} className="text-teal" />
                  <h2>Program Unggulan {city.name}</h2>
                </div>
              </div>

              <div className="sc-highlights-grid">
                {city.highlights.map((item, idx) => (
                  <div key={idx} className="sc-highlight-item">
                    <div className="sc-highlight-item__num">{idx + 1}</div>
                    <div className="sc-highlight-item__content">
                      <p>{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="sc-toolbar">
            <div className="sc-search-bar">
              <Search size={20} className="sc-search-bar__icon" />
              <input
                type="text"
                placeholder={`Cari bisnis atau UMKM di ${city.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="sc-search-bar__clear" onClick={() => setSearchQuery("")}>
                  &times;
                </button>
              )}
            </div>

            <div className="sc-category-pills">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`sc-cat-pill ${selectedCategory === cat.id ? "sc-cat-pill--active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Grid Listing */}
          <div className="sc-business-container">
            <div className="sc-business-header">
              <h3>
                Daftar Bisnis Terverifikasi di {city.name}
              </h3>
              <span className="sc-count-badge">{filteredBusinesses.length} Bisnis Ditemukan</span>
            </div>

            {loadingBusinesses ? (
              <div className="sc-loading-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="sc-skeleton-card" />
                ))}
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <div className="sc-grid">
                {filteredBusinesses.map((b) => {
                  const imgUrl = getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop";
                  const categoryName = typeof b.category === "object" ? b.category?.name : b.category || "Umum";
                  const rating = b.rating || b.average_rating || 5.0;

                  return (
                    <Link key={b.id} to={`/business/${b.id}`} className="sc-biz-card">
                      <div className="sc-biz-card__cover">
                        <img src={imgUrl} alt={b.name} loading="lazy" />
                        <span className="sc-biz-card__badge">Buka</span>
                        {b.is_verified && (
                          <div className="sc-biz-card__verified" title="Bisnis Terverifikasi">
                            <CheckCircle2 size={14} /> Terverifikasi
                          </div>
                        )}
                      </div>

                      <div className="sc-biz-card__content">
                        <div className="sc-biz-card__cat">{categoryName}</div>
                        <h4 className="sc-biz-card__name">{b.name}</h4>
                        <p className="sc-biz-card__desc">
                          {b.description ? (b.description.length > 90 ? `${b.description.substring(0, 90)}...` : b.description) : "Informasi bisnis resmi terdaftar di direktori Smart City."}
                        </p>

                        <div className="sc-biz-card__footer">
                          <div className="sc-biz-card__meta">
                            <MapPin size={14} className="text-teal" />
                            <span>{b.city || city.name}</span>
                          </div>
                          <div className="sc-biz-card__rating">
                            <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                            <span>{rating}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="sc-empty">
                <Search size={48} className="sc-empty__icon" />
                <h4>Belum Ada Bisnis Terdaftar</h4>
                <p>Belum ada bisnis yang sesuai dengan pencarian di {city.name}.</p>
                <button
                  type="button"
                  className="sc-btn sc-btn--secondary"
                  onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── FOOTER CTA ── */}
      <footer className="sc-footer-cta">
        <div className="sc-container">
          <div className="sc-footer-cta__box">
            <div className="sc-footer-cta__text">
              <h3>Punya Usaha di {city.name}?</h3>
              <p>Daftarkan bisnis Anda secara gratis dan tingkatkan visibilitas di program Smart City &amp; Village Indonesia.</p>
            </div>
            <Link to="/login" className="sc-btn sc-btn--accent">
              Daftarkan Bisnis Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
