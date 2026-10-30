import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import SuradeLoader from "../components/SuradeLoader";
import api from "../services/api";
import { requireAuth } from "../utils/authCheck";
import { getStorageUrl } from "../utils/constants";
import { SMART_CITIES, SMART_CITY_IMAGE_BY_SLUG } from "../data/smartVillageData";
import { getBusinessOpenStatus } from "../utils/businessHours";
import { getSubcategoryIcon } from "../utils/subcategoryIcons";
import BusinessCardSkeleton from "../components/BusinessCardSkeleton";
import GooglePagination from "../components/GooglePagination";
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
  Eye,
  Crown,
  CircleDollarSign,
  ThumbsUp,
  TrendingUp,
  Diamond,
} from "lucide-react";
import "./Category.css";
import "./Home.css";

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
  "kelurahan-surade": [-7.3444, 106.5866],
  "desa-jagamukti": [-7.3520, 106.5790],
  "desa-citanglar": [-7.3610, 106.5700],
  "desa-wanasari": [-7.3380, 106.5950],
  "desa-sirnasari": [-7.3290, 106.6020],
  "desa-kadaleman": [-7.3200, 106.5880],
  "desa-gunungsungging": [-7.3670, 106.6050],
  "desa-cipeundeuy": [-7.3480, 106.6120],
  "desa-pasiripis": [-7.3560, 106.5620],
  "desa-buniwangi": [-7.3350, 106.5680],
  "desa-sukatani": [-7.3250, 106.5760],
  "desa-kademangan": [-7.3150, 106.5990],
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
  { id: "all", label: "Semua Rentang Harga", min: null, max: null, desc: "" },
  { id: "under_20k", label: "Rp 0 - Rp 20.000", min: 0, max: 20000, desc: "Murah Banget", icon: CircleDollarSign },
  { id: "20k_75k", label: "Rp 20.000 - Rp 75.000", min: 20000, max: 75000, desc: "Terjangkau", icon: ThumbsUp },
  { id: "75k_300k", label: "Rp 75.000 - Rp 300.000", min: 75000, max: 300000, desc: "Sedang", icon: TrendingUp },
  { id: "300k_1m", label: "Rp 300.000 - Rp 1.000.000", min: 300000, max: 1000000, desc: "Premium", icon: Star },
  { id: "above_1m", label: "> Rp 1.000.000", min: 1000000, max: null, desc: "Eksklusif", icon: Diamond },
];

const getPriceTierLabel = (price) => {
  if (!price || price <= 0) return null;
  if (price <= 20000) return { label: "Murah", color: "#059669", bg: "#d1fae5" };
  if (price <= 75000) return { label: "Terjangkau", color: "#0891b2", bg: "#cffafe" };
  if (price <= 300000) return { label: "Sedang", color: "#d97706", bg: "#fef3c7" };
  if (price <= 1000000) return { label: "Premium", color: "#7c3aed", bg: "#ede9fe" };
  return { label: "Eksklusif", color: "#b91c1c", bg: "#fee2e2" };
};

const SORT_OPTIONS = [
  { id: "relevance", label: "Paling Relevan" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "views", label: "Paling Populer" },
];

export default function SmartCity() {
  const { id, slug } = useParams();
  const cityKey = id || slug || "kecamatan surade";

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

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const listTopRef = useRef(null);
  const [gridHeight, setGridHeight] = useState(null);

  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  useEffect(() => {
    if (city?.name) {
      document.title = `${city.name} - Smart Village Surade - Surade.com`;
    } else {
      document.title = "Smart Village Surade - Surade.com";
    }
  }, [city?.name]);

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
          const bId = fav.business_id || fav.business?.id || fav.id;
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

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [categories]);

  useEffect(() => {
    if (tabsRef.current && selectedCategory) {
      setTimeout(() => {
        const activeEl = tabsRef.current?.querySelector(".reko-tab.active");
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
        checkScroll();
      }, 100);
    }
  }, [selectedCategory, categories]);

  const isAllSurade = !id && !slug;

  // Fetch Smart Village by id/slug
  useEffect(() => {
    const fetchSmartCityData = async () => {
      try {
        if (isAllSurade) {
          setCity({
            id: "all",
            slug: "all",
            name: "Kecamatan Surade",
            type: "smart_village",
            description: "Pusat UMKM Terpadu & Ekosistem Digital 12 Desa/Kelurahan se-Kecamatan Surade.",
            image: SMART_CITY_IMAGE_BY_SLUG["kelurahan-surade"] || "/images/businesses/pasar.jpg",
            img: SMART_CITY_IMAGE_BY_SLUG["kelurahan-surade"] || "/images/businesses/pasar.jpg",
            population: 85200,
            area: 119.5,
            bisnis: 153,
          });
          setLoading(false);
          return;
        }

        // Fetch from /home-summary instead
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home-summary`);
        if (!res.ok) throw new Error("Failed to fetch smart cities");
        const data = await res.json();
        const citiesData = data?.smart_cities || [];
        
        if (Array.isArray(citiesData)) {
          let current = citiesData.find(
            (c) =>
              String(c.id) === String(cityKey) ||
              c.slug === cityKey ||
              c.slug === String(cityKey).toLowerCase() ||
              c.name?.toLowerCase().includes(String(cityKey).toLowerCase())
          );

          if (!current) {
            const localMatch = SMART_CITIES.find(
              (c) =>
                String(c.id) === String(cityKey) ||
                c.slug === cityKey ||
                c.slug === String(cityKey).toLowerCase() ||
                c.name?.toLowerCase().includes(String(cityKey).toLowerCase())
            );

            if (localMatch) {
              current = { ...localMatch, type: "smart_village" };
            } else {
              const cityName = cityKey ? (cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace(/-/g, " ")) : "Kelurahan Surade";
              current = {
                id: cityKey || "kelurahan-surade",
                slug: cityKey || "kelurahan-surade",
                name: cityName.includes("Desa") || cityName.includes("Kelurahan") ? cityName : `Desa ${cityName}`,
                type: "smart_village",
                description:
                  "Desa/Kelurahan dengan potensi UMKM dan ekonomi lokal yang terintegrasi dalam program Smart Village.",
                image: "https://picsum.photos/seed/surade-default/800/600",
                img: "https://picsum.photos/seed/surade-default/800/600",
                population: 0,
                area: 0,
                bisnis: 12,
              };
            }
          }

          // Selalu pakai foto asli lokal berdasarkan slug (kalau tersedia)
          const realPhoto = SMART_CITY_IMAGE_BY_SLUG[current.slug];
          if (realPhoto) {
            current = { ...current, image: realPhoto, img: realPhoto };
          }

          setCity(current);
        }
      } catch (err) {
        console.error("Error fetching smart cities:", err);
        const fallbackVillage = SMART_CITIES.find(
          (c) =>
            String(c.id) === String(cityKey) ||
            c.slug === cityKey ||
            c.slug === String(cityKey).toLowerCase()
        ) || {
          id: cityKey || "kelurahan-surade",
          slug: cityKey || "kelurahan-surade",
          name: "Kelurahan Surade",
          type: "smart_village",
          description: "Pusat pemerintahan dan ekonomi Kecamatan Surade.",
          image: SMART_CITY_IMAGE_BY_SLUG["kelurahan-surade"],
          img: SMART_CITY_IMAGE_BY_SLUG["kelurahan-surade"],
          population: 0,
          area: 0,
          bisnis: 21,
        };
        setCity(fallbackVillage);
      } finally {
        setLoading(false);
      }
    };

    fetchSmartCityData();
  }, [cityKey, isAllSurade]);

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
              children: c.children || [],
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
        // Gunakan nama city yang EXACT sama dengan database
        // city.name sudah dalam format "Kelurahan Surade", "Desa Jagamukti", dll
        const locationParam = city.name;
        const isAll = isAllSurade || city.id === "all" || city.slug === "all";
        const endpoint = isAll
          ? `${import.meta.env.VITE_API_URL}/businesses?all=true`
          : `${import.meta.env.VITE_API_URL}/businesses?location=${encodeURIComponent(locationParam)}&all=true`;
        
        console.log('Fetching businesses for location:', isAll ? 'ALL SURADE' : locationParam);
        const res = await fetch(endpoint);
        const data = await res.json();
        
        const list = Array.isArray(data) ? data : (data?.data || []);
        const defaultCoords = getCityCoords(city);

        const mapped = list.map((b, idx) => {
          const avgPrice = b.products_avg_price ? Number(b.products_avg_price) : 0;
          const minPrice = b.products_min_price ? Number(b.products_min_price) : 0;
          const maxPrice = b.products_max_price ? Number(b.products_max_price) : 0;
          const productsCount = Number(b.products_count || 0);

          const mainCategory = b.category?.parent || b.category;
          const subCategory = b.category?.parent ? b.category : null;
          const categoryName = mainCategory?.name || b.category?.name || "Umum";
          const subCategoryName = subCategory?.name || (b.sub_category?.name || null);
          const openStatus = getBusinessOpenStatus(b.opening_days);

          let bTags = [];
          if (Array.isArray(b.tags) && b.tags.length > 0) {
            bTags = b.tags;
          } else if (typeof b.tags === "string") {
            try {
              const p = JSON.parse(b.tags);
              if (Array.isArray(p)) bTags = p;
            } catch {
              bTags = b.tags.split(",").map((t) => t.trim()).filter(Boolean);
            }
          }
          // Filter out city/location noise tags
          const bCityLower = (b.city || "").toLowerCase();
          bTags = bTags.map(t => typeof t === "object" ? (t?.name || String(t)) : String(t))
            .filter(t => t && t.toLowerCase() !== bCityLower && !t.toLowerCase().startsWith("desa/") && !t.toLowerCase().startsWith("kelurahan"));

          const [fallbackLat, fallbackLng] = getBusinessCoords(b, defaultCoords, idx);
          const rawLat = b.latitude || b.lat;
          const rawLng = b.longitude || b.lng;
          const finalLat = rawLat && !isNaN(parseFloat(rawLat)) ? parseFloat(rawLat) : fallbackLat;
          const finalLng = rawLng && !isNaN(parseFloat(rawLng)) ? parseFloat(rawLng) : fallbackLng;

          return {
            ...b,
            name: b.name,
            category: categoryName,
            subCategory: subCategoryName,
            categoryColor: b.category?.icon === "store" ? "#007570" : b.category?.icon === "coffee" ? "#0ea5e9" : "#f59e0b",
            tags: bTags,
            location: b.city ? (b.province ? `${b.city}, ${b.province}` : b.city) : (b.address || "Indonesia"),
            address: b.address || b.city || "Kecamatan Surade",
            views: b.views || 0,
            rating: b.rating || b.average_rating || "0.0",
            rating_count: b.rating_count || 0,
            status: openStatus.label,
            open: openStatus.open,
            img: getStorageUrl(b.banner || b.logo) || "/images/businesses/pasar.jpg",
            lat: finalLat,
            lng: finalLng,
            latitude: finalLat,
            longitude: finalLng,
            is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
            is_verified: Boolean(b.is_verified),
            avg_price: avgPrice,
            min_price: minPrice,
            max_price: maxPrice,
            products_count: productsCount,
          };
        });
        
        console.log('Filtered businesses count:', mapped.length);
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
      const parentName = (b.category?.parent?.name || "").toLowerCase();
      const parentSlug = (b.category?.parent?.slug || "").toLowerCase();
      
      const currentCat = categories.find((c) => c.id === selectedCategory);
      const isChildMatch = currentCat?.children?.some(child => 
        (child.slug || "").toLowerCase() === categorySlug || 
        (child.name || "").toLowerCase() === categoryName
      );

      const matchesCategory =
        selectedCategory === "all" ||
        categoryName.includes(selectedCategory.toLowerCase()) ||
        categorySlug === selectedCategory.toLowerCase() ||
        parentName.includes(selectedCategory.toLowerCase()) ||
        parentSlug === selectedCategory.toLowerCase() ||
        isChildMatch;

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

  useEffect(() => {
    if (!listTopRef.current) return;
    const updateHeight = () => {
      if (listTopRef.current) {
        const h = Math.round(listTopRef.current.getBoundingClientRect().height);
        if (h > 0) {
          setGridHeight((prev) => (prev === h ? prev : h));
        }
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(listTopRef.current);
    return () => observer.disconnect();
  }, [paginatedBusinesses, loadingBusinesses]);

  const cityCenterCoords = getCityCoords(city);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <SuradeLoader
            variant="section"
            text="Memuat Data Smart Village"
            subtext="Menyiapkan data potensi, layanan publik, dan direktori UMKM desa di Surade"
            showBrand
          />
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
          <p className="text-slate-500 text-sm mb-6">Desa yang Anda cari tidak tersedia dalam program Smart Village.</p>
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
            <span className="text-white/90">Smart Village</span>
            <span className="text-white/70">&rarr;</span>
            <span className="text-white font-medium">{city.name}</span>
          </nav>

          {/* Title: [Nama Desa] Smart Village */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {city.name.split(/(Surade)/gi).map((part, i) =>
              part.toLowerCase() === "surade" ? (
                <span key={i} className="text-[#34d399]">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}{" "}
            <span className="text-[#38bdf8]">
              Smart Village
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
                  {city.population ? city.population.toLocaleString('id-ID') : '0'} Jiwa
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
                  {city.area ? `${city.area} km²` : '0 km²'}
                </div>
                <div className="text-xs text-slate-300 font-normal mt-0.5">Luas Wilayah</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY HORIZONTAL PILLS (Matching Category.jsx Modern UI/UX) ── */}
      <section className="category-tabs-section">
        <div className="category-tabs-inner">
          <div className="category-tabs-wrapper">
            {canScrollLeft && (
              <button
                type="button"
                className="category-scroll-arrow category-scroll-arrow--left"
                onClick={() => scrollTabs("left")}
                aria-label="Geser Kiri"
                title="Geser Kategori ke Kiri"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
            )}

            <div className="reko-tabs" ref={tabsRef}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    className={`reko-tab reko-tab--link${isActive ? " active" : ""}`}
                  >
                    <span className="reko-tab__icon-wrap">
                      <span className="reko-tab__icon">{cat.icon}</span>
                    </span>
                    <span className="reko-tab__label">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {canScrollRight && (
              <button
                type="button"
                className="category-scroll-arrow category-scroll-arrow--right"
                onClick={() => scrollTabs("right")}
                aria-label="Geser Kanan"
                title="Geser Kategori ke Kanan"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── MAIN BUSINESS DIRECTORY & MAP SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#059669] border border-teal-200">
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#059669] border border-teal-200">
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
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#059669] border border-teal-200">
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
                className="w-full h-10 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all"
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
                    ? "bg-teal-50 border-[#059669] text-[#059669] font-bold shadow-sm"
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
                            ? "bg-teal-50 text-[#059669] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => {
                          setSelectedPriceRange(range.id);
                          setPriceDropdownOpen(false);
                        }}
                      >
                        <div>
                          <div>{range.label}</div>
                          {range.desc && (
                            <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                              {range.icon && <range.icon size={12} className="text-slate-400" />}
                              {range.desc}
                            </div>
                          )}
                        </div>
                        {selectedPriceRange === range.id && <Check size={14} className="text-[#059669]" />}
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
                            ? "bg-teal-50 text-[#059669] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                        onClick={() => {
                          setSortOption(opt.id);
                          setSortDropdownOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {sortOption === opt.id && <Check size={14} className="text-[#059669]" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Split Layout (Cards & Map - exact match to Category page) */}
        <div className="category-business-split">
          {/* Left Column: Business Cards & Pagination */}
          <div className="category-business-left" ref={listTopRef}>
            {loadingBusinesses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <BusinessCardSkeleton key={`sc-skel-${n}`} />
                ))}
              </div>
            ) : filteredBusinesses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {paginatedBusinesses.map((bisnis) => (
                    <Link
                      key={bisnis.id}
                      to={`/business/${bisnis.slug || bisnis.id}`}
                      className={`biz-card biz-card--link ${bisnis.is_premium ? "biz-card--premium" : "biz-card--free"}`}
                    >
                      {/* Image */}
                      <div className="biz-card__img-wrap">
                        <img 
                          src={bisnis.img} 
                          alt={bisnis.name} 
                          className="biz-card__img" 
                          loading="lazy" 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/businesses/pasar.jpg";
                          }}
                        />
                        {/* Verified badge (Rosette icon only matching Image 3) */}
                        {Boolean(bisnis.is_premium) && (
                          <div className="biz-card__verified-badge" title="Bisnis Terverifikasi - Mitra Resmi">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 1L9.27 3.47L5.64 3.78L4.69 7.31L1.77 9.5L2.83 13L1.77 16.5L4.69 18.69L5.64 22.22L9.27 22.53L12 25L14.73 22.53L18.36 22.22L19.31 18.69L22.23 16.5L21.17 13L22.23 9.5L19.31 7.31L18.36 3.78L14.73 3.47L12 1Z" fill="#10B981" />
                              <path d="M10.2 14.8L7.4 12L6 13.4L10.2 17.6L18 9.8L16.6 8.4L10.2 14.8Z" fill="white" />
                            </svg>
                          </div>
                        )}
                        <div className="biz-card__img-overlay">
                          <button
                            type="button"
                            className={`biz-card__save${saved[bisnis.id] ? " saved" : ""}`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(bisnis.id, bisnis.name); }}
                            aria-label="Simpan"
                          >
                            <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                            <span>{saved[bisnis.id] ? "Tersimpan" : "Simpan"}</span>
                          </button>
                          <span className="biz-card__views">
                            <Eye size={13} />
                            <span>{bisnis.views || 0}</span>
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="biz-card__body">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`biz-card__name flex-1 ${bisnis.is_premium ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>{bisnis.name}</h3>
                          {bisnis.is_premium && (
                            <span className="biz-card__vip-pill" title="Mitra Terverifikasi">
                              <Crown size={11} className="fill-amber-400 text-amber-500" />
                              <span>Mitra</span>
                            </span>
                          )}
                        </div>
                        <div className="biz-card__categories">
                          <p className="biz-card__category">
                            <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor || "#007570" }} />
                            {bisnis.category}
                          </p>
                          {bisnis.subCategory && (
                            <p className={`biz-card__category biz-card__category--sub flex items-center gap-1 font-semibold ${bisnis.is_premium ? "text-[#007570] bg-[#f0faf8] px-2 py-0.5 rounded-md border border-[#ccebe8]" : "text-slate-600"}`}>
                              <span className="shrink-0 flex items-center">{getSubcategoryIcon(bisnis.subCategory)}</span>
                              <span>{bisnis.subCategory}</span>
                            </p>
                          )}
                        </div>
                        {/* Price Tag - only show if price data exists, show min-max range with tier */}
                        {(bisnis.min_price > 0 || bisnis.avg_price > 0) && (() => {
                          const tier = getPriceTierLabel(bisnis.min_price || bisnis.avg_price);
                          return (
                            <div className="flex items-center gap-1.5 flex-wrap my-1.5">
                              <div className="biz-card__price-tag flex items-center gap-1.5 text-[12px] font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200/90 w-fit">
                                <Tag size={12} className="text-emerald-600 shrink-0" />
                                <span>
                                  {bisnis.min_price > 0 && bisnis.max_price > 0 && bisnis.min_price !== bisnis.max_price
                                    ? `Rp ${Number(bisnis.min_price).toLocaleString("id-ID")} - Rp ${Number(bisnis.max_price).toLocaleString("id-ID")}`
                                    : `Rp ${Number(bisnis.min_price || bisnis.avg_price).toLocaleString("id-ID")}`}
                                </span>
                              </div>
                              {tier && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                  style={{ color: tier.color, background: tier.bg, borderColor: tier.color + "40" }}>
                                  {tier.label}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        {/* Tags - only show if real tags exist */}
                        {bisnis.tags && bisnis.tags.length > 0 && (
                        <div className="biz-card__tags">
                          {bisnis.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="biz-card__tag">
                              <Tag size={11} />{tag}
                            </span>
                          ))}
                          {bisnis.tags.length > 3 && (
                            <span
                              className="biz-card__tag biz-card__tag--more text-[#007570] font-bold bg-teal-50 border border-teal-200 cursor-pointer"
                              title={`Semua tag: ${bisnis.tags.join(', ')}`}
                            >
                              +{bisnis.tags.length - 3} lainnya
                            </span>
                          )}
                        </div>
                        )}
                        <div className="biz-card__footer">
                          <span className="biz-card__rating">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{Number(bisnis.rating || 0).toFixed(1)}</span>
                            {bisnis.rating_count > 0 && <span className="text-slate-400">({bisnis.rating_count})</span>}
                          </span>
                          <span className="biz-card__location">
                            <MapPin size={12} />{bisnis.location}
                          </span>
                          <span className={`biz-card__cta${bisnis.open ? "" : " closed"}${bisnis.is_premium ? " biz-card__cta--premium" : ""}`}>
                            {bisnis.open ? "Buka Sekarang →" : "Tutup Sekarang!"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* ── Responsive Pagination Controls (Google Style Gooooooogle) ── */}
                {totalPages > 1 && (
                  <div className="category-pagination">
                    <div className="category-pagination__info">
                      Menampilkan <strong>{startIndex + 1}</strong>–<strong>{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</strong> dari <strong>{totalItems}</strong> usaha
                    </div>

                    <GooglePagination
                      currentPage={safeCurrentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      prevLabel="Sebelumnya"
                      nextLabel="Berikutnya"
                    />
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

          {/* Right Column: Interactive Map (matches Category page) */}
          <div 
            className="category-business-right"
            style={{
              height: gridHeight ? `${gridHeight}px` : '100%',
              minHeight: gridHeight ? `${gridHeight}px` : '450px',
              maxHeight: gridHeight ? `${gridHeight}px` : 'none'
            }}
          >
            <MapView 
              businesses={paginatedBusinesses} 
              height={gridHeight ? `${gridHeight}px` : '100%'}
            />
          </div>
        </div>
      </section>
    </div>
  );
}