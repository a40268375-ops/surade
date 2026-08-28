import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { requireAuth } from "../utils/authCheck";
import { getStorageUrl } from "../utils/constants";
import {
  MapPin,
  Building2,
  Users,
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  Search,
  CheckCircle2,
  Star,
  Loader2,
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ListFilter,
  Check,
  Tag,
  Bookmark,
} from "lucide-react";
import "./Category.css";

// Fix default Leaflet icon for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to recenter Leaflet map when city changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

const getCategoryIcon = (iconName, label = "") => {
  const lower = (iconName || label || "").toLowerCase();
  if (lower.includes("coffee") || lower.includes("cafe") || lower.includes("kuliner") || lower.includes("restaurant")) {
    return <Coffee size={18} />;
  }
  if (lower.includes("smartphone") || lower.includes("elektronik") || lower.includes("gadget")) {
    return <Smartphone size={18} />;
  }
  if (lower.includes("shirt") || lower.includes("fashion") || lower.includes("pakaian")) {
    return <Shirt size={18} />;
  }
  if (lower.includes("wrench") || lower.includes("servis") || lower.includes("tukang") || lower.includes("jasa") || lower.includes("otomotif")) {
    return <Wrench size={18} />;
  }
  if (lower.includes("building") || lower.includes("fasilitas") || lower.includes("hotel") || lower.includes("perkantoran")) {
    return <Building2 size={18} />;
  }
  return <Store size={18} />;
};

const CITY_COORDS = {
  surade: [-7.3444, 106.5866],
  sukabumi: [-6.9277, 106.9300],
  jakarta: [-6.2088, 106.8456],
  bogor: [-6.5971, 106.8060],
  bandung: [-6.9175, 107.6191],
  surabaya: [-7.2575, 112.7521],
  bali: [-8.4095, 115.1889],
  depok: [-6.4025, 106.7942],
  tangerang: [-6.1783, 106.6319],
  aceh: [5.5483, 95.3238],
};

const getCityCoords = (cityObj) => {
  if (cityObj?.lat && cityObj?.lng) return [parseFloat(cityObj.lat), parseFloat(cityObj.lng)];
  if (cityObj?.slug && CITY_COORDS[cityObj.slug.toLowerCase()]) return CITY_COORDS[cityObj.slug.toLowerCase()];
  if (cityObj?.name) {
    const key = Object.keys(CITY_COORDS).find((k) => cityObj.name.toLowerCase().includes(k));
    if (key) return CITY_COORDS[key];
  }
  return [-6.5971, 106.8060];
};

const getBusinessCoords = (b, fallbackCenter, index = 0) => {
  if (b.latitude && b.longitude) return [parseFloat(b.latitude), parseFloat(b.longitude)];
  if (b.lat && b.lng) return [parseFloat(b.lat), parseFloat(b.lng)];
  const offsetLat = ((index % 5) - 2) * 0.008;
  const offsetLng = ((Math.floor(index / 5) % 5) - 2) * 0.008;
  return [fallbackCenter[0] + offsetLat, fallbackCenter[1] + offsetLng];
};

const DEFAULT_CATEGORIES = [
  { id: "all", label: "Semua", icon: <Store size={18} /> },
  { id: "bisnis-market", label: "Bisnis & Market", icon: <Store size={18} /> },
  { id: "cafe-restaurant", label: "Cafe & Restaurant", icon: <Coffee size={18} /> },
  { id: "elektronik-gadget", label: "Elektronik & Gadget", icon: <Smartphone size={18} /> },
  { id: "fashion", label: "Fashion", icon: <Shirt size={18} /> },
  { id: "servis-tukang", label: "Servis & Tukang", icon: <Wrench size={18} /> },
];

const PRICE_RANGES = [
  { id: "all", label: "Semua Rentang Harga", min: null, max: null },
  { id: "under_50k", label: "Rp 0 - Rp 50.000", min: 0, max: 50000, desc: "Ekonomis & Terjangkau" },
  { id: "50k_150k", label: "Rp 50.000 - Rp 150.000", min: 50000, max: 150000, desc: "Menengah" },
  { id: "150k_500k", label: "Rp 150.000 - Rp 500.000", min: 150000, max: 500000, desc: "Standar" },
  { id: "500k_1m", label: "Rp 500.000 - Rp 1.000.000", min: 500000, max: 1000000, desc: "Premium" },
  { id: "above_1m", label: "> Rp 1.000.000", min: 1000000, max: null, desc: "Eksklusif & High-End" },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Paling Relevan" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "views", label: "Paling Populer" },
];

export default function SmartCity() {
  const { id, slug } = useParams();
  const cityKey = id || slug || "bogor";

  const [city, setCity] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  // Price & Sort States
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Pagination (4 per page)
  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);

  const priceDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const [saved, setSaved] = useState({});

  const fetchUserSavedState = async () => {
    const token = localStorage.getItem("token");
    const bizSavedMap = {};

    try {
      const localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
      (Array.isArray(localBiz) ? localBiz : []).forEach(id => { bizSavedMap[id] = true; });
    } catch (e) {}

    if (token) {
      try {
        const resBiz = await api.get("/my-favorites");
        const bizData = resBiz.data?.data || resBiz.data || [];
        const bizArr = Array.isArray(bizData) ? bizData : (bizData?.data || []);
        bizArr.forEach(fav => {
          const bId = fav.business_id || fav.business?.id;
          if (bId) bizSavedMap[bId] = true;
        });
      } catch (err) {
        console.error("Failed to fetch favorites in SmartCity:", err);
      }
    }

    setSaved(bizSavedMap);
  };

  useEffect(() => {
    fetchUserSavedState();
    window.addEventListener("bookmarkChanged", fetchUserSavedState);
    return () => window.removeEventListener("bookmarkChanged", fetchUserSavedState);
  }, []);

  const toggleSave = async (id, itemName = "") => {
    if (!id) return;
    if (!requireAuth()) return;

    const isCurrentlySaved = !!saved[id];
    setSaved((prev) => ({ ...prev, [id]: !isCurrentlySaved }));

    let localItems = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
    if (isCurrentlySaved) {
      localItems = localItems.filter(item => String(item) !== String(id));
    } else {
      if (!localItems.includes(id)) localItems.push(id);
    }
    localStorage.setItem("saved_business_ids", JSON.stringify(localItems));
    localStorage.removeItem("cached_saved_items");
    window.dispatchEvent(new Event("bookmarkChanged"));

    if (isCurrentlySaved) {
      alert(`${itemName ? `"${itemName}"` : "Bisnis"} berhasil dihapus dari bookmark.`);
    } else {
      alert(`${itemName ? `"${itemName}"` : "Bisnis"} berhasil disimpan ke bookmark!`);
    }

    try {
      if (isCurrentlySaved) {
        await api.delete(`/favorites/${id}`);
      } else {
        await api.post(`/favorites/${id}`);
      }
    } catch (err) {
      console.error("Failed to toggle favorite API in SmartCity:", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cityKey]);

  // Outside click listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(e.target)) {
        setPriceDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Smart City by id/slug
  useEffect(() => {
    const fetchSmartCityData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/smart-cities`);
        if (!res.ok) throw new Error("Failed to fetch smart cities");
        const data = await res.json();
        const citiesData = data?.data || data || [];
        if (Array.isArray(citiesData)) {
          let current = citiesData.find(
            (c) =>
              String(c.id) === String(cityKey) ||
              c.slug === cityKey ||
              c.slug === String(cityKey).toLowerCase() ||
              c.name?.toLowerCase().includes(String(cityKey).toLowerCase())
          );

          if (!current) {
            const cityName = cityKey ? (cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace(/-/g, " ")) : "Bogor";
            current = {
              id: cityKey || "bogor",
              slug: cityKey || "bogor",
              name: cityName.includes("Kota") ? cityName : `Kota ${cityName}`,
              type: "smart_city",
              description:
                "Pusat aktivitas bisnis, kuliner, dan teknologi terdepan yang mendukung pertumbuhan ekonomi digital dan UMKM terintegrasi.",
              image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop",
              img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop",
              population: "1.043.000 Jiwa",
              area: "118,50 km²",
              bisnis: 0,
            };
          }
          setCity(current);
        }
      } catch (err) {
        console.error("Error fetching smart cities:", err);
        setCity({
          id: cityKey || "bogor",
          slug: cityKey || "bogor",
          name: "Kota Bogor",
          type: "smart_city",
          description:
            "Pusat aktivitas bisnis, kuliner, dan teknologi terdepan yang mendukung pertumbuhan ekonomi digital dan UMKM terintegrasi.",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop",
          img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop",
          population: "1.043.000 Jiwa",
          area: "118,50 km²",
          bisnis: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSmartCityData();
  }, [cityKey]);

  // Fetch Categories from API or fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          const cleanList = list.filter(c => (c.slug !== "all" && c.slug !== "semua" && c.name?.toLowerCase() !== "semua"));
          const mapped = [
            { id: "all", label: "Semua", icon: <Store size={18} /> },
            ...cleanList.map((c) => ({
              id: c.slug || String(c.id),
              label: c.name,
              icon: getCategoryIcon(c.icon, c.name),
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

  // Fetch businesses for current city with price aggregation
  useEffect(() => {
    if (!city) return;
    const fetchCityBusinesses = async () => {
      setLoadingBusinesses(true);
      try {
        const cityName = (city.name || "").replace(/^(Kelurahan|Desa|Kota|Kabupaten)\s*/i, "").trim();
        const queryParam = cityName || city.slug;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/businesses?location=${encodeURIComponent(queryParam)}&all=true`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        const mapped = list.map((b) => {
          const avgPrice = b.products_avg_price ? Number(b.products_avg_price) : 0;
          const minPrice = b.products_min_price ? Number(b.products_min_price) : 0;
          const maxPrice = b.products_max_price ? Number(b.products_max_price) : 0;
          const productsCount = Number(b.products_count || 0);

          return {
            ...b,
            avg_price: avgPrice,
            min_price: minPrice,
            max_price: maxPrice,
            products_count: productsCount,
          };
        });
        setBusinesses(mapped);
      } catch (err) {
        console.error("Error fetching city businesses:", err);
        setBusinesses([]);
      } finally {
        setLoadingBusinesses(false);
      }
    };

    fetchCityBusinesses();
  }, [city]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedPriceRange, sortOption]);

  // Filter & Sort Logic
  const filteredBusinesses = businesses
    .filter((b) => {
      const categoryName = (b.category?.name || b.category || "").toLowerCase();
      const categorySlug = (b.category?.slug || "").toLowerCase();
      const matchesCategory =
        selectedCategory === "all" ||
        categoryName.includes(selectedCategory.toLowerCase()) ||
        categorySlug === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        (b.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.city || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Price Range Filter
      let matchesPrice = true;
      if (selectedPriceRange && selectedPriceRange !== "all") {
        const range = PRICE_RANGES.find((r) => r.id === selectedPriceRange);
        if (range) {
          const price = b.avg_price || 0;
          if (b.products_count === 0 && price === 0) {
            matchesPrice = false;
          } else {
            const isAboveMin = range.min === null || price >= range.min;
            const isBelowMax = range.max === null || price <= range.max;
            matchesPrice = isAboveMin && isBelowMax;
          }
        }
      }

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      // 1. PRIMARY: Premium tier first (all Premium businesses come before Free businesses)
      if (a.is_premium && !b.is_premium) return -1;
      if (!a.is_premium && b.is_premium) return 1;

      // 2. SECONDARY: Sorting within the same tier
      if (sortOption === "price_asc") {
        return (a.avg_price || 0) - (b.avg_price || 0);
      }
      if (sortOption === "price_desc") {
        return (b.avg_price || 0) - (a.avg_price || 0);
      }
      if (sortOption === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      // Default / latest
      return (b.id || 0) - (a.id || 0);
    });

  // Pagination Calculation
  const totalItems = filteredBusinesses.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const pageNumbers = useMemo(() => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (safeCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cityCenterCoords = getCityCoords(city);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
          <Loader2 className="w-10 h-10 text-[#00b074] animate-spin" />
          <p className="text-slate-600 font-medium text-sm">Memuat Data Smart City...</p>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Kota Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">Kota yang Anda cari tidak tersedia dalam program Smart City &amp; Village.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00b074] text-white text-sm font-semibold hover:bg-[#009663] transition-colors">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative min-h-[520px] md:min-h-[560px] flex flex-col justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src={city.image || city.img || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop"}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-slate-950/50" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-12 flex flex-col items-center text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-white/90 font-normal mb-5 flex-wrap justify-center">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-white/70">&rarr;</span>
            <span className="text-white/90">Smart City</span>
            <span className="text-white/70">&rarr;</span>
            <span className="text-white font-medium">{city.name}</span>
          </nav>

          {/* Title: [Nama Kota] Smart City */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {city.name}{" "}
            <span className="text-[#38bdf8]">
              {city.type === "smart_village" ? "Smart Village" : "Smart City"}
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="max-w-3xl text-xs sm:text-sm md:text-[15px] text-white/90 leading-relaxed mb-8 font-normal">
            {city.description ||
              "Pusat aktivitas bisnis, kuliner, dan inovasi terdepan yang mendukung pertumbuhan ekonomi digital dan UMKM terintegrasi."}
          </p>

          {/* 3 Statistic Cards */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-4xl mx-auto">
            {/* Card 1: Bisnis Terdaftar */}
            <div className="bg-[#0f1f2e]/75 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 text-left shadow-xl min-w-[210px] flex-1 max-w-[280px]">
              <div className="text-[#00c48c] shrink-0">
                <Store size={26} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {businesses.length > 0 ? businesses.length : (city.bisnis || 0)}
                </div>
                <div className="text-xs text-slate-300 font-normal mt-0.5">Bisnis Terdaftar</div>
              </div>
            </div>

            {/* Card 2: Penduduk */}
            <div className="bg-[#0f1f2e]/75 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 text-left shadow-xl min-w-[210px] flex-1 max-w-[280px]">
              <div className="text-[#00c48c] shrink-0">
                <Users size={26} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {city.population || "1.043.000 Jiwa"}
                </div>
                <div className="text-xs text-slate-300 font-normal mt-0.5">Penduduk</div>
              </div>
            </div>

            {/* Card 3: Luas Wilayah */}
            <div className="bg-[#0f1f2e]/75 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4 text-left shadow-xl min-w-[210px] flex-1 max-w-[280px]">
              <div className="text-[#00c48c] shrink-0">
                <MapPin size={26} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                  {city.area || "118,50 km²"}
                </div>
                <div className="text-xs text-slate-300 font-normal mt-0.5">Luas Wilayah</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER BAR ── */}
      <section className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;

              const renderLabel = () => {
                if (cat.label === "Semua") return <span>Semua</span>;
                if (cat.label.includes(" & ")) {
                  const parts = cat.label.split(" & ");
                  return (
                    <div className="flex flex-col text-left leading-tight">
                      <span>{parts[0]} &amp;</span>
                      <span>{parts[1]}</span>
                    </div>
                  );
                }
                const words = cat.label.split(" ");
                if (words.length === 2) {
                  return (
                    <div className="flex flex-col text-left leading-tight">
                      <span>{words[0]}</span>
                      <span>{words[1]}</span>
                    </div>
                  );
                }
                return <span>{cat.label}</span>;
              };

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm ${
                    isActive
                      ? "bg-[#007570] text-white font-bold text-sm"
                      : "bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>
                    {cat.icon}
                  </span>
                  {renderLabel()}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MAIN BUSINESS DIRECTORY & MAP SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14" ref={listTopRef}>
        {/* Section Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bisnis di {city.name}{" "}
              <span className="text-slate-400 font-normal">
                ({filteredBusinesses.length})
              </span>
            </h2>

            {/* Active Filter Badges */}
            {(selectedPriceRange !== "all" || selectedCategory !== "all" || searchQuery) && (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Filter Aktif:</span>
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#007570] border border-teal-200">
                    Kategori: {categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-rose-600 cursor-pointer"
                      title="Hapus filter kategori"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedPriceRange !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#007570] border border-teal-200">
                    Harga: {PRICE_RANGES.find((p) => p.id === selectedPriceRange)?.label}
                    <button
                      type="button"
                      onClick={() => setSelectedPriceRange("all")}
                      className="hover:text-rose-600 cursor-pointer"
                      title="Hapus filter harga"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#007570] border border-teal-200">
                    Kata Kunci: "{searchQuery}"
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-rose-600 cursor-pointer"
                      title="Hapus kata kunci"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Cari bisnis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Reset Button */}
            {(selectedPriceRange !== "all" || selectedCategory !== "all" || searchQuery || sortOption !== "relevance") && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPriceRange("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setSortOption("relevance");
                }}
                className="h-10 px-3.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <X size={13} />
                <span>Reset</span>
              </button>
            )}

            {/* Price Range Dropdown */}
            <div className="relative shrink-0" ref={priceDropdownRef}>
              <button
                type="button"
                className={`h-10 px-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                  selectedPriceRange !== "all"
                    ? "bg-teal-50 border-[#007570] text-[#007570] font-bold shadow-sm"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
              >
                <span>
                  {selectedPriceRange !== "all"
                    ? PRICE_RANGES.find((p) => p.id === selectedPriceRange)?.label
                    : "Filter Harga"}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${priceDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {priceDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100">
                    Rentang Harga Produk
                  </div>
                  <ul className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
                    {PRICE_RANGES.map((range) => (
                      <li
                        key={range.id}
                        className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          selectedPriceRange === range.id
                            ? "bg-teal-50 text-[#007570] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => {
                          setSelectedPriceRange(range.id);
                          setPriceDropdownOpen(false);
                        }}
                      >
                        <div>
                          <div>{range.label}</div>
                          {range.desc && <div className="text-[10px] text-slate-400 font-normal">{range.desc}</div>}
                        </div>
                        {selectedPriceRange === range.id && <Check size={14} className="text-[#007570]" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0" ref={sortDropdownRef}>
              <button
                type="button"
                className="h-10 px-3.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 flex items-center gap-2 transition-all cursor-pointer"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                <ListFilter size={14} className="text-slate-500" />
                <span>{SORT_OPTIONS.find((s) => s.id === sortOption)?.label || "Paling Relevan"}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <ul className="py-1 space-y-0.5">
                    {SORT_OPTIONS.map((opt) => (
                      <li
                        key={opt.id}
                        className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          sortOption === opt.id
                            ? "bg-teal-50 text-[#007570] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => {
                          setSortOption(opt.id);
                          setSortDropdownOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {sortOption === opt.id && <Check size={14} className="text-[#007570]" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Grid (Cards & Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          {/* Left Column: Business Cards & Pagination */}
          <div>
            {loadingBusinesses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse h-64 flex flex-col justify-between">
                    <div className="h-32 bg-slate-200 rounded-xl mb-3" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {paginatedBusinesses.map((b, index) => {
                    const imgUrl = getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=400&fit=crop";
                    const categoryName = typeof b.category === "object" ? b.category?.name : (b.category || "Umum");
                    const rating = b.rating || b.average_rating || 5.0;
                    const isPremium = Boolean(b.is_premium || b.features?.is_premium);

                    return (
                      <Link
                        key={b.id || index}
                        to={`/business/${b.slug || b.id}`}
                        className="group bg-white border border-slate-200/80 hover:border-[#007570]/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative"
                      >
                        {/* Image Cover */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={imgUrl}
                            alt={b.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#007570] text-white shadow-xs">
                            Buka
                          </span>

                          {/* Verified Badge */}
                          {isPremium && (
                            <div
                              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#059669] to-[#047857] text-white flex items-center gap-1 shadow-sm"
                              title="Bisnis Terverifikasi - Pengguna Premium"
                            >
                              <BadgeCheck size={13} className="text-white" />
                              <span>Terverifikasi</span>
                            </div>
                          )}

                          {/* Bookmark Save Button */}
                          <button
                            type="button"
                            className={`biz-card__save${saved[b.id] ? " saved" : ""}`}
                            style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 10 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSave(b.id, b.name);
                            }}
                            aria-label="Simpan Bisnis"
                          >
                            <Bookmark size={13} fill={saved[b.id] ? "currentColor" : "none"} />
                            <span>Simpan</span>
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-xs font-semibold text-[#007570] uppercase tracking-wider mb-1">
                            {categoryName}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#007570] transition-colors line-clamp-1 mb-1.5">
                            {b.name}
                          </h4>

                          {/* Average Product Price Badge */}
                          {b.avg_price > 0 && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-[#007570] text-xs font-bold border border-teal-100">
                                Rp {Math.round(b.avg_price).toLocaleString("id-ID")}{" "}
                                <span className="text-[10px] font-normal text-slate-500">(rata-rata)</span>
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                            {b.description || "Informasi bisnis resmi terdaftar di direktori Smart City."}
                          </p>

                          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                              <MapPin size={13} className="text-[#007570] shrink-0" />
                              <span className="truncate">{b.city || city.name}</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-amber-500 shrink-0">
                              <Star size={13} fill="currentColor" />
                              <span>{rating}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* ── Responsive Pagination Controls ── */}
                {totalPages > 1 && (
                  <div className="category-pagination">
                    <div className="category-pagination__info">
                      Menampilkan <strong>{startIndex + 1}</strong>–<strong>{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> dari <strong>{totalItems}</strong> bisnis
                    </div>

                    <div className="category-pagination__controls">
                      {/* Prev Button */}
                      <button
                        type="button"
                        className="category-pagination__nav-btn"
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        aria-label="Halaman Sebelumnya"
                      >
                        <ChevronLeft size={16} />
                        <span className="category-pagination__nav-label">Sebelumnya</span>
                      </button>

                      {/* Numbered Pages */}
                      <div className="category-pagination__pages">
                        {pageNumbers.map((page, idx) =>
                          page === "..." ? (
                            <span key={`dots-${idx}`} className="category-pagination__dots">
                              …
                            </span>
                          ) : (
                            <button
                              key={`page-${page}`}
                              type="button"
                              className={`category-pagination__page-btn ${
                                page === safeCurrentPage ? "active" : ""
                              }`}
                              onClick={() => handlePageChange(page)}
                              aria-label={`Ke Halaman ${page}`}
                              aria-current={page === safeCurrentPage ? "page" : undefined}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        className="category-pagination__nav-btn"
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        aria-label="Halaman Selanjutnya"
                      >
                        <span className="category-pagination__nav-label">Selanjutnya</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                <Search size={48} className="text-slate-300 stroke-[1.5] mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tidak ada bisnis ditemukan</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Coba ubah kata kunci pencarian, filter kategori, atau rentang harga yang dipilih.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Leaflet Map */}
          <div className="sticky top-24 w-full h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <MapContainer
              center={cityCenterCoords}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={cityCenterCoords} />
              {filteredBusinesses.map((b, idx) => {
                const pos = getBusinessCoords(b, cityCenterCoords, idx);
                return (
                  <Marker key={b.id || idx} position={pos}>
                    <Popup>
                      <div className="p-1 text-slate-800">
                        <strong className="text-sm font-bold block mb-1">{b.name}</strong>
                        <p className="text-xs text-slate-500 mb-2">{b.city || city.name}</p>
                        <Link
                          to={`/business/${b.slug || b.id}`}
                          className="inline-block text-xs font-semibold text-[#007570] hover:underline"
                        >
                          Lihat Detail &rarr;
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
