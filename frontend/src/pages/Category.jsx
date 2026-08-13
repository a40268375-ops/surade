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

/* ── Category tabs ── */
const INITIAL_CATEGORIES = [
  { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "bisnis", label: "Bisnis & Market", icon: <Store size={26} strokeWidth={1.7} /> },
  { id: "cafe", label: "Cafe & Restaurant", icon: <Coffee size={26} strokeWidth={1.7} /> },
  { id: "elektronik", label: "Elektronik & Gadget", icon: <Smartphone size={26} strokeWidth={1.7} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={26} strokeWidth={1.7} /> },
  { id: "servis", label: "Servis & Tukang", icon: <Wrench size={26} strokeWidth={1.7} /> },
  { id: "wisata", label: "Wisata", icon: <MapPin size={26} strokeWidth={1.7} /> },
];

const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "store": return <Store size={26} strokeWidth={1.7} />;
    case "coffee": return <Coffee size={26} strokeWidth={1.7} />;
    case "smartphone": return <Smartphone size={26} strokeWidth={1.7} />;
    case "shirt": return <Shirt size={26} strokeWidth={1.7} />;
    case "wrench": return <Wrench size={26} strokeWidth={1.7} />;
    case "map-pin": return <MapPin size={26} strokeWidth={1.7} />;
    case "building": return <Building2 size={26} strokeWidth={1.7} />;
    case "landmark": return <Landmark size={26} strokeWidth={1.7} />;
    default: return <Store size={26} strokeWidth={1.7} />;
  }
};

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

  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [bisnisData, setBisnisData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      const fetchCategories = fetch(`${import.meta.env.VITE_API_URL}/categories`)
        .then(res => res.json())
        .then(catData => {
          if (Array.isArray(catData)) {
            const mappedCategories = [
              { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
              ...catData.map(c => ({
                id: c.slug,
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
              lng: b.lng
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

  const filteredBisnis = activeCategory === "all"
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
          <img className="category-hero__bg" src={HERO_IMAGE} alt="Hero background" />
          <div className="category-hero__overlay" />
          <div className="category-hero__content">
            <div className="category-hero__breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <span>Kategori</span>
              <span>/</span>
              <span>{currentCategory?.label || "Semua"}</span>
            </div>
            <h1 className="category-hero__title">{currentCategory?.label || "Semua Kategori"}</h1>
            <p className="category-hero__subtitle">
              Temukan bisnis terbaik di kategori {currentCategory?.label?.toLowerCase() || "semua kategori"}
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
      </section>

      {/* CATEGORY TABS */}
      <section className="category-tabs-section">
        <div className="category-tabs-inner">
          <div className="reko-tabs">
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
