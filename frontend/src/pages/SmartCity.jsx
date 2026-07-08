import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
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

const SMART_CITIES = [
  { 
    id: 1, 
    name: "Aceh", 
    bisnis: 142, 
    population: "5.2 Juta",
    area: "5,677 km²",
    governor: "Muzakir Manaf",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=600&fit=crop",
    description: "Provinsi Aceh adalah provinsi paling barat Indonesia yang kaya akan budaya dan sejarah. Program Smart City di Aceh berfokus pada pengembangan ekonomi digital dan pariwisata berbasis teknologi.",
    highlights: [
      "Sistem e-Government terintegrasi",
      "Digitalisasi pasar tradisional",
      "Smart tourism untuk wisata religius",
      "Pengembangan UMKM berbasis teknologi"
    ]
  },
  { 
    id: 2, 
    name: "Bali", 
    bisnis: 385, 
    population: "4.3 Juta",
    area: "5,780 km²",
    governor: "Wayan Koster",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop",
    description: "Bali adalah destinasi wisata dunia yang menerapkan konsep Smart City untuk meningkatkan pengalaman wisata dan keberlanjutan ekonomi lokal.",
    highlights: [
      "Bali Smart Island Program",
      "Sistem manajemen lalu lintas cerdas",
      "Digitalisasi industri pariwisata",
      "Platform UMKM Bali Digital"
    ]
  },
  { 
    id: 3, 
    name: "Bogor", 
    bisnis: 273, 
    population: "5.4 Juta",
    area: "6,284 km²",
    governor: "Budi Santoso",
    img: "https://images.unsplash.com/photo-1568802088984-38109b53e40c?w=1200&h=600&fit=crop",
    description: "Kota Bogor sebagai kota penyangga Jakarta mengembangkan Smart City untuk mengatasi tantangan urbanisasi dan meningkatkan kualitas hidup warganya.",
    highlights: [
      "Smart transportation system",
      "Digitalisasi layanan publik",
      "Pengelolaan sampah cerdas",
      "Smart agriculture dan UMKM"
    ]
  },
  { 
    id: 4, 
    name: "Jakarta", 
    bisnis: 1240, 
    population: "10.6 Juta",
    area: "661 km²",
    governor: "Heru Budi Hartono",
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&h=600&fit=crop",
    description: "DKI Jakarta sebagai ibu kota Indonesia adalah pioneer Smart City dengan implementasi teknologi canggih dalam berbagai aspek kehidupan urban.",
    highlights: [
      "Jakarta Smart City terintegrasi",
      "Sistem transportasi cerdas",
      "E-Government terdepan",
      "Platform ekonomi digital terbesar"
    ]
  },
  { 
    id: 5, 
    name: "Jambi", 
    bisnis: 89, 
    population: "3.5 Juta",
    area: "50,058 km²",
    governor: "Al Haris",
    img: "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1200&h=600&fit=crop",
    description: "Provinsi Jambi mengembangkan Smart City dengan fokus pada pengelolaan sumber daya alam berkelanjutan dan digitalisasi layanan publik.",
    highlights: [
      "Smart environmental monitoring",
      "Digitalisasi pertanian dan perkebunan",
      "E-Government terintegrasi",
      "Pengembangan ekonomi digital"
    ]
  },
  { 
    id: 6, 
    name: "Kep. Mentawai", 
    bisnis: 34, 
    population: "83 Ribu",
    area: "6,011 km²",
    governor: "Yudas Sabaggalet",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    description: "Kepulauan Mentawai mengembangkan Smart Village untuk meningkatkan konektivitas dan ekonomi masyarakat lokal dengan tetap menjaga kearifan lokal.",
    highlights: [
      "Smart Village untuk pulau terpencil",
      "Digitalisasi wisata bahari",
      "Konektivitas internet satelit",
      "Pemberdayaan UMKM lokal"
    ]
  },
  { 
    id: 7, 
    name: "Magelang", 
    bisnis: 198, 
    population: "1.3 Juta",
    area: "1,062 km²",
    governor: "Zaenal Arifin",
    img: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&h=600&fit=crop",
    description: "Kota Magelang mengembangkan Smart City dengan fokus pada pariwisata berbasis teknologi dan digitalisasi UMKM lokal.",
    highlights: [
      "Smart tourism Borobudur",
      "Digitalisasi UMKM lokal",
      "Sistem manajemen lalu lintas",
      "Layanan publik digital"
    ]
  },
  { 
    id: 8, 
    name: "Medan", 
    bisnis: 467, 
    population: "2.4 Juta",
    area: "265 km²",
    governor: "Bobby Nasution",
    img: "https://images.unsplash.com/photo-1572285870954-7b08e56f4c58?w=1200&h=600&fit=crop",
    description: "Kota Medan sebagai kota terbesar di Sumatera menerapkan Smart City untuk meningkatkan efisiensi layanan publik dan ekonomi digital.",
    highlights: [
      "Medan Smart City terintegrasi",
      "Digitalisasi pasar tradisional",
      "Sistem transportasi cerdas",
      "Platform UMKM Medan Digital"
    ]
  },
  { 
    id: 9, 
    name: "Papua Barat", 
    bisnis: 56, 
    population: "1.1 Juta",
    area: "115,242 km²",
    governor: "Paulus Waterpauw",
    img: "https://images.unsplash.com/photo-1591109078846-8f53bab16c37?w=1200&h=600&fit=crop",
    description: "Provinsi Papua Barat mengembangkan Smart Village untuk meningkatkan akses layanan publik dan ekonomi masyarakat di daerah terpencil.",
    highlights: [
      "Smart Village untuk daerah terpencil",
      "Digitalisasi layanan kesehatan",
      "Konektivitas internet daerah",
      "Pemberdayaan ekonomi lokal"
    ]
  },
  { 
    id: 10, 
    name: "Sulawesi Tengah", 
    bisnis: 112, 
    population: "2.9 Juta",
    area: "68,033 km²",
    governor: "Rusdy Mastura",
    img: "https://images.unsplash.com/photo-1527153818091-1a9638521e2a?w=1200&h=600&fit=crop",
    description: "Provinsi Sulawesi Tengah mengembangkan Smart City dengan fokus pada pengelolaan sumber daya alam dan digitalisasi layanan publik.",
    highlights: [
      "Smart environmental monitoring",
      "Digitalisasi pertanian",
      "E-Government terintegrasi",
      "Pengembangan ekonomi digital"
    ]
  },
  { 
    id: 11, 
    name: "Sumatera Utara", 
    bisnis: 321, 
    population: "14.8 Juta",
    area: "72,981 km²",
    governor: "Edy Rahmayadi",
    img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&h=600&fit=crop",
    description: "Provinsi Sumatera Utara mengembangkan Smart City untuk meningkatkan efisiensi layanan publik dan pertumbuhan ekonomi digital.",
    highlights: [
      "Smart City terintegrasi",
      "Digitalisasi industri dan perdagangan",
      "Sistem transportasi cerdas",
      "Platform UMKM digital"
    ]
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundCity = SMART_CITIES.find((c) => c.id === parseInt(id));
    setCity(foundCity);
  }, [id]);

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
                  <Link key={business.id} to={`/business/${business.id}`} className="sc-business-card">
                    <div className="sc-business-card__img-wrap">
                      <img src={business.img} alt={business.name} className="sc-business-card__img" />
                      <div className="sc-business-card__overlay">
                        <span className={`sc-business-card__status ${business.status === "Buka Sekarang" ? "open" : "closed"}`}>
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
