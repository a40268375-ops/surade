import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import { SMART_CITIES } from "../data/smartCities";
import {
  MapPin,
  Building2,
  Users,
  Star,
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  Search,
  ArrowRight,
} from "lucide-react";
import "./SmartCity.css";

/* ── Data kota Smart City diimpor dari src/data/smartCities.js
   supaya selalu sinkron dengan kartu kota di Home.jsx ── */

const CATEGORIES = [
  { id: "all", label: "Semua", icon: <Store size={20} /> },
  { id: "bisnis", label: "Bisnis & Market", icon: <Store size={20} /> },
  { id: "cafe", label: "Cafe & Restaurant", icon: <Coffee size={20} /> },
  { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={20} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={20} /> },
  { id: "servis", label: "Servis & Tukang", icon: <Wrench size={20} /> },
];

const MOCK_BUSINESSES = [
  {
    id: 1,
    name: "Toko Elektronik Jaya",
    category: "Elektronik & Gadget",
    location: "Jakarta Pusat",
    rating: 4.5,
    reviews: 128,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Warung Makan Sederhana",
    category: "Cafe & Restaurant",
    location: "Jakarta Selatan",
    rating: 4.3,
    reviews: 89,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Salon & Spa Cantik",
    category: "Fashion",
    location: "Jakarta Barat",
    rating: 4.7,
    reviews: 156,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Bengkel Motor Makmur",
    category: "Servis & Tukang",
    location: "Jakarta Timur",
    rating: 4.4,
    reviews: 67,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    name: "Amel Irwanto Cake",
    category: "Bisnis & Market",
    location: "Jakarta Utara",
    rating: 4.6,
    reviews: 92,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    name: "Coffee House Premium",
    category: "Cafe & Restaurant",
    location: "Jakarta Selatan",
    rating: 4.8,
    reviews: 234,
    status: "Buka Sekarang",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop",
  },
];

export default function SmartCity() {
  const pageLoading = usePageLoading();
  const { id } = useParams();
  const [city, setCity] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundCity = SMART_CITIES.find((c) => c.id === parseInt(id));
    setCity(foundCity);
  }, [id]);

  if (pageLoading) {
    return <Loading />;
  }

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

  const filteredBusinesses = MOCK_BUSINESSES.filter((business) => {
    const matchesCategory = selectedCategory === "all" || business.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = business.name.toLowerCase().includes(searchQuery) || 
                         business.location.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
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
                  <span className="sc-hero__stat-value">{city.bisnis.toLocaleString("id-ID")}</span>
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
          {/* Search & Filter */}
          <div className="sc-filter-bar">
            <div className="sc-search-box">
              <Search size={18} className="sc-search-box__icon" />
              <input
                type="text"
                placeholder="Cari bisnis atau lokasi..."
                className="sc-search-box__input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sc-category-tabs">
              {CATEGORIES.map((cat) => (
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

            <div className="sc-business-grid">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <Link
                    key={business.id}
                    to={`/business/${business.id}`}
                    className="sc-business-card"
                  >
                    <div className="sc-business-card__img-wrap">
                      <img
                        src={business.img}
                        alt={business.name}
                        className="sc-business-card__img"
                      />
                      <div className="sc-business-card__overlay">
                        <span
                          className={`sc-business-card__status ${business.status === "Buka Sekarang" ? "open" : "closed"}`}
                        >
                          {business.status}
                        </span>
                      </div>
                    </div>
                    <div className="sc-business-card__body">
                      <h3 className="sc-business-card__name">{business.name}</h3>
                      <p className="sc-business-card__category">{business.category}</p>
                      <div className="sc-business-card__meta">
                        <div className="sc-business-card__rating">
                          <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                          <span>{business.rating}</span>
                          <span className="sc-business-card__reviews">({business.reviews})</span>
                        </div>
                        <div className="sc-business-card__location">
                          <MapPin size={14} />
                          <span>{business.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="sc-empty-state">
                  <Search size={48} className="sc-empty-state__icon" />
                  <h3 className="sc-empty-state__title">Tidak ada bisnis ditemukan</h3>
                  <p className="sc-empty-state__text">Coba ubah kata kunci pencarian atau filter kategori</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}