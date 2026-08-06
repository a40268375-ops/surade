import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logoImg from "../assets/logo.png";
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
  Filter,
  ArrowRight,
} from "lucide-react";
import "./Home.css";
import "./SmartCity.css";

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "store": return <Store size={20} />;
    case "coffee": return <Coffee size={20} />;
    case "smartphone": return <Smartphone size={20} />;
    case "shirt": return <Shirt size={20} />;
    case "wrench": return <Wrench size={20} />;
    default: return <Store size={20} />;
  }
};

function Navbar() {
  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Info.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <Link to="/" className="home-nav__link">Home</Link>
          <a href="#" className="home-nav__link home-nav__link--dropdown">
            <span>Informasi</span>
            <ChevronDown size={15} className="home-nav__caret" />
          </a>
          <Link to="/blog" className="home-nav__link">Blog</Link>
          <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
          <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
          <button type="button" className="home-nav__button">
            <ChevronDown size={15} /><span>Add Bisnis</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function SmartCity() {
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [smartCities, setSmartCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const cityDropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch smart cities from API
  useEffect(() => {
    const fetchSmartCities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/smart-cities`);
        if (!res.ok) {
          console.warn("Smart cities endpoint returned:", res.status);
          setSmartCities([]);
          return;
        }
        const data = await res.json();
        const citiesData = data?.data || data || [];
        if (Array.isArray(citiesData)) {
          setSmartCities(citiesData);
          // Find current city by id
          const foundCity = citiesData.find((c) => c.id === parseInt(id));
          setCity(foundCity);
          setSelectedCity(foundCity?.name || null);
        }
      } catch (err) {
        console.error("Failed to fetch smart cities:", err);
        setSmartCities([]);
      }
    };
    fetchSmartCities();
  }, [id]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mappedCategories = [
            { id: "all", label: "Semua", icon: <Store size={20} /> },
            ...data.map(c => ({
              id: c.slug,
              label: c.name,
              icon: getCategoryIcon(c.icon)
            }))
          ];
          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoadingBusinesses(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/businesses`);
        const data = await res.json();
        const businessesData = data?.data || data || [];
        const list = Array.isArray(businessesData) ? businessesData : (businessesData?.data || []);
        setBusinesses(list);
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
        setBusinesses([]);
      } finally {
        setLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, []);

  if (!city) {
    return (
      <div className="smart-city-page">
        <Navbar />
        <div className="smart-city__not-found">
          <h2>Kota tidak ditemukan</h2>
          <Link to="/" className="smart-city__back-link">Kembali ke Home</Link>
        </div>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter((business) => {
    const matchesCategory = selectedCategory === "all" || 
                         (business.category?.name || "").toLowerCase().includes(selectedCategory) ||
                         (business.category || "").toLowerCase().includes(selectedCategory);
    const matchesSearch = !searchQuery || 
                         (business.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (business.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (business.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || 
                       (business.city || "").toLowerCase().includes(selectedCity.toLowerCase()) ||
                       (business.location || "").toLowerCase().includes(selectedCity.toLowerCase());
    return matchesCategory && matchesSearch && matchesCity;
  });

  return (
    <div className="smart-city-page">
      <Navbar />

      {/* Hero Section */}
      <section className="sc-hero">
        <div className="sc-hero__bg">
          <img src={city.img} alt={city.name} className="sc-hero__img" />
          <div className="sc-hero__overlay" />
        </div>
        <div className="sc-hero__content">
          <div className="sc-hero__inner">
            <Link to="/" className="sc-hero__breadcrumb">
              <span>Home</span>
              <ArrowRight size={16} />
              <span>Smart City</span>
              <ArrowRight size={16} />
              <span>{city.name}</span>
            </Link>
            <h1 className="sc-hero__title">{city.name} Smart City</h1>
            <p className="sc-hero__subtitle">{city.description}</p>
            
            <div className="sc-hero__stats">
              <div className="sc-hero__stat">
                <Building2 size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  <span className="sc-hero__stat-value">{city.bisnis.toLocaleString()}</span>
                  <span className="sc-hero__stat-label">Bisnis Terdaftar</span>
                </div>
              </div>
              <div className="sc-hero__stat">
                <Users size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  <span className="sc-hero__stat-value">{city.population}</span>
                  <span className="sc-hero__stat-label">Penduduk</span>
                </div>
              </div>
              <div className="sc-hero__stat">
                <MapPin size={24} className="sc-hero__stat-icon" />
                <div className="sc-hero__stat-content">
                  <span className="sc-hero__stat-value">{city.area}</span>
                  <span className="sc-hero__stat-label">Luas Wilayah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="sc-content">
        <div className="sc-content__inner">
          {/* Highlights */}
          <div className="sc-highlights">
            <h2 className="sc-section__title">Program Unggulan</h2>
            <div className="sc-highlights__grid">
              {city.highlights.map((highlight, index) => (
                <div key={index} className="sc-highlight-card">
                  <TrendingUp size={20} className="sc-highlight-card__icon" />
                  <span className="sc-highlight-card__text">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="sc-filter-bar">
            <div className="sc-search-container">
              <div className="sc-search-box">
                <Search size={18} className="sc-search-box__icon" />
                <input
                  type="text"
                  placeholder="Cari bisnis..."
                  className="sc-search-box__input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="sc-city-filter" ref={cityDropdownRef}>
                <button
                  className="sc-city-btn"
                  onClick={() => setCityDropdownOpen((v) => !v)}
                >
                  <MapPin size={16} />
                  <span>{selectedCity}</span>
                  <ChevronDown size={14} className={`sc-city-caret${cityDropdownOpen ? " open" : ""}`} />
                </button>
                {cityDropdownOpen && (
                  <div className="sc-city-dropdown">
                    <div className="sc-city-list">
                      {smartCities.map((c) => (
                        <button
                          key={c.id}
                          className={`sc-city-option${selectedCity === c.name ? " selected" : ""}`}
                          onClick={() => {
                            setSelectedCity(c.name);
                            setCityDropdownOpen(false);
                          }}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sc-category-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`sc-category-tab ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Grid */}
          <div className="sc-business-section">
            <h2 className="sc-section__title">
              Bisnis di {city.name}
              <span className="sc-section__count">({filteredBusinesses.length})</span>
            </h2>
            {loadingBusinesses ? (
              <div className="sc-loading-state">
                <p>Memuat bisnis...</p>
              </div>
            ) : (
              <div className="sc-business-grid">
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((business) => {
                    const img = business.img || business.logo || business.banner || business.gallery?.[0]?.url || "";
                    const categoryName = typeof business.category === "string" 
                      ? business.category 
                      : business.category?.name || business.category_name || "-";
                    const rating = business.rating ?? business.average_rating ?? 0;
                    const reviews = business.reviews ?? business.total_rating ?? 0;
                    const location = business.city || business.location || "-";
                    const isOpen = business.is_open ?? business.open ?? true;
                    
                    return (
                      <Link key={business.id} to={`/business/${business.id}`} className="sc-business-card">
                        <div className="sc-business-card__img-wrap">
                          {img ? (
                            <img src={img} alt={business.name} className="sc-business-card__img" />
                          ) : (
                            <div className="sc-business-card__img-placeholder">No Image</div>
                          )}
                          <div className="sc-business-card__overlay">
                            <span className={`sc-business-card__status ${isOpen ? "open" : "closed"}`}>
                              {isOpen ? "Buka Sekarang" : "Tutup"}
                            </span>
                          </div>
                        </div>
                        <div className="sc-business-card__body">
                          <h3 className="sc-business-card__name">{business.name}</h3>
                          <p className="sc-business-card__category">{categoryName}</p>
                          <div className="sc-business-card__meta">
                            <div className="sc-business-card__rating">
                              <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                              <span>{rating}</span>
                              <span className="sc-business-card__reviews">({reviews})</span>
                            </div>
                            <div className="sc-business-card__location">
                              <MapPin size={14} />
                              <span>{location}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="sc-empty-state">
                    <Search size={48} className="sc-empty-state__icon" />
                    <h3 className="sc-empty-state__title">Tidak ada bisnis ditemukan</h3>
                    <p className="sc-empty-state__text">Coba ubah kata kunci pencarian atau filter kategori</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
