import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { InlineSpinner } from "../components/LoadingScreen";
import { getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
import api from "../services/api";
import {
  Search,
  MapPin,
  Bookmark,
  Eye,
  Tag,
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  ChevronDown,
  X,
  ListFilter,
  Building2,
  Landmark,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  ClipboardList,
  HeartPulse,
  Users,
} from "lucide-react";
import heroImg from "../assets/category_hero_illustration.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Category.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icon for Vite/webpack bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const HERO_IMAGE = heroImg;

/* ── Categories loaded dynamically from API ── */

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "store": return <Store size={24} strokeWidth={1.7} />;
    case "coffee": return <Coffee size={24} strokeWidth={1.7} />;
    case "smartphone": return <Smartphone size={24} strokeWidth={1.7} />;
    case "shirt": return <Shirt size={24} strokeWidth={1.7} />;
    case "wrench": return <Wrench size={24} strokeWidth={1.7} />;
    case "map-pin": return <MapPin size={24} strokeWidth={1.7} />;
    case "building": return <Building2 size={24} strokeWidth={1.7} />;
    case "landmark": return <Landmark size={24} strokeWidth={1.7} />;
    case "info": return <Info size={24} strokeWidth={1.7} />;
    case "clipboard": return <ClipboardList size={24} strokeWidth={1.7} />;
    case "heart": return <HeartPulse size={24} strokeWidth={1.7} />;
    case "users": return <Users size={24} strokeWidth={1.7} />;
    default: return <Store size={24} strokeWidth={1.7} />;
  }
};

/* ── Hero floating category cards configuration (9 categories in 2 rows) ── */
const HERO_CARD_ITEMS = [
  // Row 1 (4 items)
  [
    { id: "bisnis", label: "Bisnis & Market", icon: <Store size={26} strokeWidth={1.8} />, color: "#2563eb", bg: "#eff6ff" },
    { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={26} strokeWidth={1.8} />, color: "#4f46e5", bg: "#eef2ff" },
    { id: "fashion", label: "Fashion", icon: <Shirt size={26} strokeWidth={1.8} />, color: "#059669", bg: "#ecfdf5" },
    { id: "fasilitas", label: "Fasilitas", icon: <Building2 size={26} strokeWidth={1.8} />, color: "#0284c7", bg: "#f0f9ff" },
  ],
  // Row 2 (5 items)
  [
    { id: "informasi-umum", label: "Informasi Umum", icon: <Info size={26} strokeWidth={1.8} />, color: "#0891b2", bg: "#ecfeff" },
    { id: "servis", label: "Jasa & Servis", icon: <Wrench size={26} strokeWidth={1.8} />, color: "#d97706", bg: "#fffbeb" },
    { id: "kategori-test", label: "Kategori Test", icon: <ClipboardList size={26} strokeWidth={1.8} />, color: "#7c3aed", bg: "#f5f3ff" },
    { id: "kesehatan", label: "Kesehatan", icon: <HeartPulse size={26} strokeWidth={1.8} />, color: "#e11d48", bg: "#fff1f2" },
    { id: "komunitas", label: "Komunitas", icon: <Users size={26} strokeWidth={1.8} />, color: "#9333ea", bg: "#faf5ff" },
  ]
];

// Helper to get coordinates for a business
const getCoords = (business) => {
  if (business.lat && business.lng) {
    return [business.lat, business.lng];
  }
  const cityKey = business.location.replace(/^(Kota|Kabupaten)\s*/, "");
  const cityMap = {
    "Jakarta": [-6.200000, 106.816666],
    "Bandung": [-6.914744, 107.609810],
    "Surabaya": [-7.257471, 112.752088],
    "Bogor": [-6.597268, 106.806977],
    "Bekasi": [-6.245913, 106.970156],
    "Depok": [-6.402484, 106.794243],
    "Semua": [-2.548926, 118.014863]
  };
  return cityMap[cityKey] || [-2.5, 118];
};

/* ── Cities list ── */
const CITIES = [
  "Semua",
  "Aceh",
  "Bali",
  "Bogor",
  "Depok",
  "Jakarta",
  "Jambi",
  "Kep. Mentawai",
  "Magelang",
  "Medan",
  "Bekasi",
];


export default function Category() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get("q") || "";
  const queryLocation = searchParams.get("location") || "";

  const [activeCategory, setActiveCategory] = useState(categoryId || "all");
  const [saved, setSaved] = useState({});
  const [searchKeyword, setSearchKeyword] = useState(queryQ);
  const [selectedCity, setSelectedCity] = useState(queryLocation || "Semua");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [categories, setCategories] = useState([{ id: "all", label: "Semua", icon: <Store size={24} strokeWidth={1.7} /> }]);
  const [bisnisData, setBisnisData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      try {
        sessionStorage.removeItem("cached_public_categories");
      } catch (e) {}

      const cachedCategories = sessionStorage.getItem("cached_public_categories_raw");
      if (cachedCategories) {
        try {
          const rawList = JSON.parse(cachedCategories);
          if (Array.isArray(rawList) && rawList.length > 0) {
            const cleanList = rawList.filter(c => (c.slug !== "all" && c.slug !== "semua" && c.name?.toLowerCase() !== "semua"));
            setCategories([
              { id: "all", label: "Semua", icon: <Store size={24} strokeWidth={1.7} /> },
              ...cleanList.map(c => ({
                id: c.slug || String(c.id),
                label: c.name,
                icon: getCategoryIcon(c.icon)
              }))
            ]);
          }
        } catch (e) {}
      }

      const fetchCategories = fetch(`${import.meta.env.VITE_API_URL}/categories`)
        .then(res => res.json())
        .then(catData => {
          const list = Array.isArray(catData) ? catData : (Array.isArray(catData?.data) ? catData.data : []);
          if (list.length > 0) {
            try {
              sessionStorage.setItem("cached_public_categories_raw", JSON.stringify(list));
            } catch (e) {}
            const cleanList = list.filter(c => (c.slug !== "all" && c.slug !== "semua" && c.name?.toLowerCase() !== "semua"));
            const mappedCategories = [
              { id: "all", label: "Semua", icon: <Store size={24} strokeWidth={1.7} /> },
              ...cleanList.map(c => ({
                id: c.slug || String(c.id),
                label: c.name,
                icon: getCategoryIcon(c.icon)
              }))
            ];
            setCategories(mappedCategories);
          }
        }).catch(err => console.error("Failed to fetch categories:", err));

      const fetchBusinesses = fetch(`${import.meta.env.VITE_API_URL}/businesses?all=true`)
        .then(res => res.json())
        .then(bizJson => {
          const bizData = bizJson?.data || bizJson || [];
          if (Array.isArray(bizData)) {
            const mapped = bizData.map(b => ({
              id: b.id,
              name: b.name,
              category: b.category?.name || "Umum",
              categorySlug: b.category?.slug || "umum",
              tags: [b.name],
              location: b.city || "Indonesia",
              views: b.views || 0,
              status: "Buka Sekarang",
              img: getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
              lat: b.lat,
              lng: b.lng,
              is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
            }));
            setBisnisData(mapped);
          }
        }).catch(err => console.error("Failed to fetch businesses:", err));

      await Promise.allSettled([fetchCategories, fetchBusinesses]);
      setLoadingData(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (categoryId) {
      setActiveCategory(categoryId);
    }
  }, [categoryId]);

  useEffect(() => {
    setSearchKeyword(queryQ);
    setSelectedCity(queryLocation || "Semua");
  }, [queryQ, queryLocation]);

  // Outside-click detection for city dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBisnis = (!activeCategory || activeCategory === "all" || activeCategory === "semua")
    ? bisnisData
    : bisnisData.filter((b) => {
        if (!b) return false;
        const currentCat = categories.find((c) => c.id === activeCategory);
        const catLabel = currentCat?.label || activeCategory;
        const bSlug = (b.categorySlug || "").toLowerCase();
        const bName = (b.category || "").toLowerCase();
        const targetId = activeCategory.toLowerCase();
        const targetLabel = catLabel.toLowerCase();

        return (
          bSlug === targetId ||
          bName === targetLabel ||
          bName.includes(targetId) ||
          bName.includes(targetLabel.split(" ")[0])
        );
      });

  const searchFilteredBisnis = filteredBisnis.filter((b) => {
    // City filter
    const matchesCity = !selectedCity || selectedCity === "Semua" ||
      b.location.toLowerCase().includes(selectedCity.toLowerCase());

    // Keyword filter
    const matchesKeyword = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());

    return matchesCity && matchesKeyword;
  });

  const [searchHistoryCategory, setSearchHistoryCategory] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("search_history_category") || "[]");
    setSearchHistoryCategory(history);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchKeyword(val);
    // Update URL param
    setSearchParams((prev) => {
      if (val) {
        prev.set("q", val);
      } else {
        prev.delete("q");
      }
      return prev;
    });
    // Update history (max 2 entries)
    if (val.trim()) {
      const newEntry = { keyword: val.trim(), category: activeCategory };
      const updated = [newEntry, ...searchHistoryCategory.filter(h => h.keyword.toLowerCase() !== val.trim().toLowerCase())].slice(0, 2);
      localStorage.setItem("search_history_category", JSON.stringify(updated));
      setSearchHistoryCategory(updated);
    }
  };

  const fetchUserFavoritesCategory = async () => {
    const token = localStorage.getItem("token");
    const bizSavedMap = {};
    try {
      const localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
      (Array.isArray(localBiz) ? localBiz : []).forEach(id => { bizSavedMap[id] = true; });
    } catch (e) {}

    if (token) {
      try {
        const res = await api.get("/my-favorites");
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : (data?.data || []);
        list.forEach(fav => {
          const bId = fav.business_id || fav.business?.id;
          if (bId) bizSavedMap[bId] = true;
        });
      } catch (err) {
        console.error("Failed to fetch favorites in Category:", err);
      }
    }
    setSaved(bizSavedMap);
  };

  useEffect(() => {
    fetchUserFavoritesCategory();
    window.addEventListener("bookmarkChanged", fetchUserFavoritesCategory);
    return () => window.removeEventListener("bookmarkChanged", fetchUserFavoritesCategory);
  }, []);

  const toggleSave = async (id) => {
    if (!id) return;
    if (!requireAuth()) return;
    const isCurrentlySaved = !!saved[id];

    setSaved((prev) => ({ ...prev, [id]: !isCurrentlySaved }));

    let localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
    if (isCurrentlySaved) {
      localBiz = localBiz.filter(item => String(item) !== String(id));
    } else {
      if (!localBiz.includes(id)) localBiz.push(id);
    }
    localStorage.setItem("saved_business_ids", JSON.stringify(localBiz));
    window.dispatchEvent(new Event("bookmarkChanged"));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        if (isCurrentlySaved) {
          await api.delete(`/favorites/${id}`);
        } else {
          await api.post(`/favorites/${id}`);
        }
      } catch (err) {
        console.error("Failed to toggle favorite in Category:", err);
      }
    }
  };

  const currentCategory = categories.find((c) => c.id === activeCategory);

  return (
    <div className="category-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="category-hero">
        {/* Abstract Background Decorative Elements */}
        <div className="category-hero__decorations" aria-hidden="true">
          <svg className="hero-bg-waves" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,288L60,272C120,256,240,224,360,224C480,224,600,256,720,250.7C840,245,960,203,1080,192C1200,181,1320,203,1380,213.3L1440,224L1440,480L1380,480C1320,480,1200,480,1080,480C960,480,840,480,720,480C600,480,480,480,360,480C240,480,120,480,60,480L0,480Z" fill="url(#wave-grad)" fillOpacity="0.35"/>
            <path d="M0,160 C320,300 420,100 800,220 C1180,340 1300,180 1440,240" stroke="rgba(0, 117, 112, 0.12)" strokeWidth="2.5" fill="none" />
            <path d="M0,220 C250,140 500,320 900,180 C1200,80 1350,260 1440,200" stroke="rgba(0, 117, 112, 0.08)" strokeWidth="1.5" fill="none" />
            <defs>
              <linearGradient id="wave-grad" x1="720" y1="192" x2="720" y2="480" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007570" stopOpacity="0.08"/>
                <stop offset="1" stopColor="#007570" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="hero-bg-circle hero-bg-circle--1" />
          <div className="hero-bg-circle hero-bg-circle--2" />
          {/* Botanical Leaf Accent */}
          <svg className="hero-bg-leaf" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M80 300C80 300 150 200 130 120C110 40 40 10 10 0C10 0 20 90 50 160C80 230 80 300 80 300Z" fill="rgba(16, 185, 129, 0.12)"/>
            <path d="M80 300C80 300 20 220 30 140C40 60 110 20 140 10C140 10 120 100 90 170C60 240 80 300 80 300Z" fill="rgba(0, 117, 112, 0.09)"/>
          </svg>
        </div>

        <div className="category-hero__inner">
          {/* Left Column */}
          <div className="category-hero__left">
            <div className="category-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/category/all">Kategori</Link>
              <span>/</span>
              <span>{currentCategory?.label || "Semua"}</span>
            </div>
            <h1 className="category-hero__title">
              {currentCategory?.label || "Semua"}
              <span className="category-hero__title-line"></span>
            </h1>
            <p className="category-hero__subtitle">
              Temukan bisnis terbaik di kategori {currentCategory?.label?.toLowerCase() || "semua"}
            </p>

            {/* Search Bar with City Filter */}
            <div className="category-search-container">
              <div className="category-search">
                <Search size={18} className="category-search__icon" />
                <input
                  type="text"
                  placeholder="Cari bisnis..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  className="category-search__input"
                />
              </div>
              <div className="category-city-filter" ref={cityDropdownRef}>
                <button
                  type="button"
                  className="category-city-btn"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                >
                  <MapPin size={18} />
                  <span>{selectedCity}</span>
                  <ChevronDown size={18} className={`category-city-caret ${cityDropdownOpen ? "open" : ""}`} />
                </button>
                {cityDropdownOpen && (
                  <div className="category-city-dropdown">
                    <div className="category-city-list">
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className={`category-city-option ${selectedCity === city ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedCity(city);
                            setCityDropdownOpen(false);
                          }}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 9 Interactive Floating Category Cards */}
          <div className="category-hero__right">
            <div className="hero-cat-cards-container">
              {/* Row 1 (4 items) */}
              <div className="hero-cat-cards-row hero-cat-cards-row--top">
                {HERO_CARD_ITEMS[0].map((item) => (
                  <Link
                    key={item.id}
                    to={`/category/${item.id}?${searchParams.toString()}`}
                    className={`hero-cat-card${activeCategory === item.id ? " active" : ""}`}
                  >
                    <div className="hero-cat-card__icon-box" style={{ color: item.color, background: item.bg }}>
                      {item.icon}
                    </div>
                    <span className="hero-cat-card__label">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Row 2 (5 items) */}
              <div className="hero-cat-cards-row hero-cat-cards-row--bottom">
                {HERO_CARD_ITEMS[1].map((item) => (
                  <Link
                    key={item.id}
                    to={`/category/${item.id}?${searchParams.toString()}`}
                    className={`hero-cat-card${activeCategory === item.id ? " active" : ""}`}
                  >
                    <div className="hero-cat-card__icon-box" style={{ color: item.color, background: item.bg }}>
                      {item.icon}
                    </div>
                    <span className="hero-cat-card__label">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS CAROUSEL */}
      <section className="category-tabs-section">
        <div className="category-tabs-inner">
          <button
            type="button"
            className="category-tabs-nav category-tabs-nav--prev"
            onClick={() => scrollTabs("left")}
            aria-label="Previous categories"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="reko-tabs" ref={tabsRef}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}?${searchParams.toString()}`}
                className={`reko-tab reko-tab--link${activeCategory === cat.id ? " active" : ""}`}
              >
                <span className="reko-tab__icon">{cat.icon}</span>
                <span className="reko-tab__label">{cat.label}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="category-tabs-nav category-tabs-nav--next"
            onClick={() => scrollTabs("right")}
            aria-label="Next categories"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* BUSINESS CARDS */}
      <section className="category-business-section">
        <div className="category-business-inner">
          <div className="category-business__header">
            <h2 className="category-business__title">
              {searchFilteredBisnis.length} Bisnis Ditemukan
            </h2>
            <div className="category-business__filters">
              <button className="btn-filter-outline" onClick={() => {
                 setSearchKeyword("");
                 setSelectedCity("Semua");
                 setSearchParams((prev) => { prev.delete("q"); prev.delete("location"); return prev; });
               }}>
                <X size={14} /> Reset filter
              </button>
              <button className="btn-filter-outline">
                <ListFilter size={14} /> Paling Relevan <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="category-business-split">
            <div className="category-business-left">
              {loadingData ? (
                <InlineSpinner text="Memuat data bisnis..." />
              ) : searchFilteredBisnis.length > 0 ? (
                <div className="reko-grid">
              {searchFilteredBisnis.map((bisnis) => (
                <Link key={bisnis.id} to={`/business/${bisnis.id}`} className="biz-card biz-card--link">
                  {/* Image */}
                  <div className="biz-card__img-wrap">
                    <img src={bisnis.img} alt={bisnis.name} className="biz-card__img" loading="lazy" />
                    {bisnis.is_premium && (
                      <div className="biz-card__verified-badge" title="Bisnis Terpercaya - Pengguna Premium">
                        <BadgeCheck size={14} className="biz-card__verified-icon" />
                        <span>Terpercaya</span>
                      </div>
                    )}
                    <div className="biz-card__img-overlay">
                      <button
                        type="button"
                        className={`biz-card__save${saved[bisnis.id] ? " saved" : ""}`}
                        onClick={(e) => { e.preventDefault(); toggleSave(bisnis.id); }}
                        aria-label="Simpan"
                      >
                        <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                        <span>Simpan</span>
                      </button>
                      <span className="biz-card__views">
                        <Eye size={13} />
                        <span>{bisnis.views}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="biz-card__body">
                    <h3 className="biz-card__name">{bisnis.name}</h3>
                    <p className="biz-card__category">{bisnis.category}</p>
                    <div className="biz-card__tags">
                      {bisnis.tags.map((tag) => (
                        <span key={tag} className="biz-card__tag">
                          <Tag size={11} />
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="biz-card__footer">
                      <span className="biz-card__location">
                        <MapPin size={12} />
                        {bisnis.location}
                      </span>
                      <span className="biz-card__cta">{bisnis.status} →</span>
                    </div>
                  </div>
                </Link>
              ))}
                </div>
              ) : (
                <div className="category-empty">
                  <p>Tidak ada bisnis ditemukan untuk kategori ini.</p>
                  <Link to="/" className="category-empty__link">Kembali ke Home</Link>
                </div>
              )}
            </div>

            {/* MAP LAYOUT */}
            <div className="category-business-right">
              <MapContainer
                center={[-6.200000, 106.816666]}
                zoom={10}
                style={{ height: "100%", width: "100%", borderRadius: "16px" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {searchFilteredBisnis.map((bisnis) => (
                  <Marker key={bisnis.id} position={getCoords(bisnis)}>
                    <Popup>
                      <strong>{bisnis.name}</strong><br />
                      {bisnis.location}<br />
                      <span style={{ color: bisnis.status === "Buka Sekarang" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                        {bisnis.status}
                      </span>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
