import { useParams, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import { InlineSpinner } from "../components/LoadingScreen";
import { BusinessGridSkeleton } from "../components/BusinessCardSkeleton";
import GooglePagination from "../components/GooglePagination";
import { getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
import api from "../services/api";
import { getBusinessOpenStatus, getScheduleForDay, getTodayName } from "../utils/businessHours";
import { getSubcategoryIcon } from "../utils/subcategoryIcons";
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
  Check,
  Car,
  Music,
  GraduationCap,
  Bed,
  Fuel,
  Home,
  Camera,
  Wallet,
  Scissors,
  Leaf,
  Award,
  Crown,
  Star,
  Package,
  Utensils,
  Palette,
  ShoppingBag,
  CircleDollarSign,
  ThumbsUp,
  TrendingUp,
  Diamond,
} from "lucide-react";
import heroImg from "../assets/category_hero_illustration.png";
import "./Category.css";
import "./Home.css";

const HERO_IMAGE = heroImg;

/* ── Price Range Options ── */
const PRICE_RANGES = [
  { id: "all", label: "Semua Rentang Harga", shortLabel: "Semua Harga", min: null, max: null, desc: "" },
  { id: "0-20k", label: "Rp 0 - Rp 20.000", shortLabel: "< 20rb", min: 0, max: 20000, desc: "Murah Banget", icon: CircleDollarSign },
  { id: "20k-75k", label: "Rp 20.000 - Rp 75.000", shortLabel: "20rb - 75rb", min: 20000, max: 75000, desc: "Terjangkau", icon: ThumbsUp },
  { id: "75k-300k", label: "Rp 75.000 - Rp 300.000", shortLabel: "75rb - 300rb", min: 75000, max: 300000, desc: "Sedang", icon: TrendingUp },
  { id: "300k-1m", label: "Rp 300.000 - Rp 1.000.000", shortLabel: "300rb - 1jt", min: 300000, max: 1000000, desc: "Premium", icon: Star },
  { id: "1m+", label: "> Rp 1.000.000", shortLabel: "> 1 Juta", min: 1000000, max: Infinity, desc: "Eksklusif", icon: Diamond },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Paling Relevan" },
  { id: "price_asc", label: "Harga Terendah" },
  { id: "price_desc", label: "Harga Tertinggi" },
  { id: "views", label: "Paling Populer" },
];

const getPriceTierLabel = (price) => {
  const p = Number(price || 0);
  if (p <= 0) return null;
  if (p <= 20000) return { label: "Murah", color: "#059669", bg: "#d1fae5" };
  if (p <= 75000) return { label: "Terjangkau", color: "#0891b2", bg: "#cffafe" };
  if (p <= 300000) return { label: "Sedang", color: "#d97706", bg: "#fef3c7" };
  if (p <= 1000000) return { label: "Premium", color: "#7c3aed", bg: "#ede9fe" };
  return { label: "Eksklusif", color: "#b91c1c", bg: "#fee2e2" };
};

/* ── Categories loaded dynamically from API ── */

const getCategoryIcon = (iconName, label = "") => {
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
    case "car": return <Car size={24} strokeWidth={1.7} />;
    case "music": return <Music size={24} strokeWidth={1.7} />;
    case "graduation": return <GraduationCap size={24} strokeWidth={1.7} />;
    case "bed": return <Bed size={24} strokeWidth={1.7} />;
    case "fuel": return <Fuel size={24} strokeWidth={1.7} />;
    case "home": return <Home size={24} strokeWidth={1.7} />;
    case "camera": return <Camera size={24} strokeWidth={1.7} />;
    case "wallet": return <Wallet size={24} strokeWidth={1.7} />;
    case "scissors": return <Scissors size={24} strokeWidth={1.7} />;
    case "leaf": return <Leaf size={24} strokeWidth={1.7} />;
    default: return getCategoryIconByLabel(label);
  }
};

/* Kalau field `icon` dari data belum diisi/cocok, tebak ikon dari kata
   kunci di label kategori supaya tiap kategori tetap tampil beda,
   bukan ikon toko yang sama semua. */
const getCategoryIconByLabel = (label) => {
  const l = (label || "").toLowerCase();
  if (l.includes("semua")) return <Store size={24} strokeWidth={1.7} />;
  if (l.includes("kantor")) return <Building2 size={24} strokeWidth={1.7} />;
  if (l.includes("bisnis") || l.includes("market") || l.includes("retail") || l.includes("belanja")) return <Store size={24} strokeWidth={1.7} />;
  if (l.includes("rekreasi") || l.includes("hiburan")) return <Camera size={24} strokeWidth={1.7} />;
  if (l.includes("jasa") || l.includes("servis")) return <Wrench size={24} strokeWidth={1.7} />;
  if (l.includes("fasilitas")) return <Fuel size={24} strokeWidth={1.7} />;
  if (l.includes("otomotif")) return <Car size={24} strokeWidth={1.7} />;
  if (l.includes("pendidikan")) return <GraduationCap size={24} strokeWidth={1.7} />;
  if (l.includes("kecantikan")) return <HeartPulse size={24} strokeWidth={1.7} />;
  if (l.includes("kesehatan")) return <HeartPulse size={24} strokeWidth={1.7} />;
  if (l.includes("elektronik") || l.includes("gadget")) return <Smartphone size={24} strokeWidth={1.7} />;
  if (l.includes("fashion")) return <Shirt size={24} strokeWidth={1.7} />;
  if (l.includes("musik")) return <Music size={24} strokeWidth={1.7} />;
  if (l.includes("komunitas")) return <Users size={24} strokeWidth={1.7} />;
  if (l.includes("informasi")) return <Info size={24} strokeWidth={1.7} />;
  if (l.includes("hotel") || l.includes("penginapan")) return <Bed size={24} strokeWidth={1.7} />;
  if (l.includes("keuangan") || l.includes("asuransi")) return <Wallet size={24} strokeWidth={1.7} />;
  if (l.includes("makanan") || l.includes("minuman") || l.includes("kuliner")) return <Coffee size={24} strokeWidth={1.7} />;
  if (l.includes("properti") || l.includes("konstruksi") || l.includes("bangunan") || l.includes("material")) return <Home size={24} strokeWidth={1.7} />;
  if (l.includes("salon") || l.includes("kecantikan") && !l.includes("kesehatan")) return <Scissors size={24} strokeWidth={1.7} />;
  if (l.includes("pertanian") || l.includes("peternakan") || l.includes("kebun")) return <Leaf size={24} strokeWidth={1.7} />;
  return <Store size={24} strokeWidth={1.7} />;
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
  "Kelurahan Surade",
  "Desa Jagamukti",
  "Desa Citanglar",
  "Desa Wanasari",
  "Desa Sirnasari",
  "Desa Kadaleman",
  "Desa Gunungsungging",
  "Desa Cipeundeuy",
  "Desa Pasiripis",
  "Desa Buniwangi",
  "Desa Sukatani",
  "Desa Kademangan",
];

export default function Category() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get("q") || searchParams.get("search") || searchParams.get("keyword") || "";
  const queryLocation = searchParams.get("location") || "";

  const [activeCategory, setActiveCategory] = useState(categoryId || "all");
  const querySub = searchParams.get("sub") || "";
  const [activeSubcategory, setActiveSubcategory] = useState(querySub);
  const [saved, setSaved] = useState({});
  const [searchKeyword, setSearchKeyword] = useState(queryQ);
  const [selectedCity, setSelectedCity] = useState(queryLocation || "Semua");
  const [kotaSearch, setKotaSearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  const filteredCities = useMemo(() => {
    if (!kotaSearch.trim()) return CITIES;
    const q = kotaSearch.toLowerCase();
    return CITIES.filter((city) => city.toLowerCase().includes(q));
  }, [kotaSearch]);

  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);
  const priceDropdownRef = useRef(null);

  const [sortOption, setSortOption] = useState("relevance");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

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

  const [categories, setCategories] = useState([{ id: "all", label: "Semua", icon: <Store size={24} strokeWidth={1.7} /> }]);
  const [bisnisData, setBisnisData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      try {
        sessionStorage.removeItem("cached_public_categories");
        sessionStorage.removeItem("cached_public_categories_raw");
      } catch (e) {}

      const cachedCategories = sessionStorage.getItem("cached_public_categories_raw_v3");
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
                icon: getCategoryIcon(c.icon, c.name),
                children: c.children || [] // Include children
              }))
            ]);
          }
        } catch (e) {}
      }

      const fetchCategories = fetch(`${import.meta.env.VITE_API_URL}/categories`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
        .then(catData => {
          const list = Array.isArray(catData) ? catData : (Array.isArray(catData?.data) ? catData.data : []);
          if (list.length > 0) {
            try {
              sessionStorage.setItem("cached_public_categories_raw_v3", JSON.stringify(list));
            } catch (e) {}
            const cleanList = list.filter(c => (c.slug !== "all" && c.slug !== "semua" && c.name?.toLowerCase() !== "semua"));
            const mappedCategories = [
              { id: "all", label: "Semua", icon: <Store size={24} strokeWidth={1.7} /> },
              ...cleanList.map(c => ({
                id: c.slug || String(c.id),
                label: c.name,
                icon: getCategoryIcon(c.icon, c.name),
                children: c.children || [] // Include children for subcategories
              }))
            ];
            setCategories(mappedCategories);
          }
        }).catch(err => console.error("Failed to fetch categories:", err));

      const fetchBusinesses = fetch(`${import.meta.env.VITE_API_URL}/businesses?all=true`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
        .then(bizJson => {
          const bizData = bizJson?.data || bizJson || [];
          if (Array.isArray(bizData)) {
            const mapped = bizData.map(b => {
              const avgPrice = b.products_avg_price ? Number(b.products_avg_price) : 0;
              const minPrice = b.products_min_price ? Number(b.products_min_price) : 0;
              const maxPrice = b.products_max_price ? Number(b.products_max_price) : 0;
              const productsCount = Number(b.products_count || 0);

              const mainCategory = b.category?.parent || b.category;
              const subCategory = b.category?.parent ? b.category : null;
              const categoryName = mainCategory?.name || b.category?.name || "Umum";
              const subCategoryName = subCategory?.name || (b.sub_category?.name || null);
              const openStatus = getBusinessOpenStatus(b.opening_days);
              const todaySchedule = getScheduleForDay(b.opening_days, getTodayName());
              let hoursText = b.opening_hours || b.hours || "";
              if (!hoursText && todaySchedule && todaySchedule.open && todaySchedule.close) {
                hoursText = `${todaySchedule.open} - ${todaySchedule.close}`;
              }
              if (!hoursText && b.open_time && b.close_time) {
                hoursText = `${b.open_time} - ${b.close_time}`;
              }
              if (!hoursText) {
                hoursText = "09:00 - 21:00";
              }

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
              // Filter out city/location noise tags seeded as tags
              const cityLower = (b.city || "").toLowerCase();
              bTags = bTags.map(t => typeof t === "object" ? (t?.name || String(t)) : String(t))
                .filter(t => t && t.toLowerCase() !== cityLower && !t.toLowerCase().startsWith("desa/") && !t.toLowerCase().startsWith("kelurahan"));
              // Do NOT add fallback tags — only real tags will be shown

              return {
                id: b.id,
                name: b.name,
                category: categoryName,
                subCategory: subCategoryName,
                categoryColor: b.category?.icon === "store" ? "#007570" : b.category?.icon === "coffee" ? "#0ea5e9" : "#f59e0b",
                categorySlug: b.category?.slug || "umum",
                parentCategorySlug: b.category?.parent?.slug || null,
                parentCategoryName: b.category?.parent?.name || null,
                tags: bTags,
                location: b.city ? (b.province ? `${b.city}, ${b.province}` : b.city) : (b.address || "Indonesia"),
                views: b.views || 0,
                rating: b.rating || b.average_rating || "0.0",
                rating_count: b.rating_count || 0,
                status: openStatus.label,
                open: openStatus.open,
                opening_hours: hoursText,
                img: getStorageUrl(b.banner || b.logo) || "/images/businesses/pasar.jpg",
                lat: b.lat || b.latitude,
                lng: b.lng || b.longitude,
                latitude: b.latitude || b.lat,
                longitude: b.longitude || b.lng,
                address: b.address,
                is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
                is_verified: Boolean(b.is_verified),
                avg_price: avgPrice,
                min_price: minPrice,
                max_price: maxPrice,
                products_count: productsCount,
              };
            });
            setBisnisData(mapped);
          }
        }).catch(err => console.error("Failed to fetch businesses:", err));

      await Promise.allSettled([fetchCategories, fetchBusinesses]);
      setLoadingData(false);
    };
    fetchData();
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

  // Auto-scroll active category tab into view
  useEffect(() => {
    if (tabsRef.current && activeCategory) {
      setTimeout(() => {
        const activeEl = tabsRef.current?.querySelector(".reko-tab.active");
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
        checkScroll();
      }, 100);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!categoryId) return;

    // Check if categoryId is a subcategory belonging to a parent category
    let matchedParent = null;
    let matchedChild = null;

    for (const cat of categories) {
      if (cat.id === categoryId || (cat.id && cat.id.toLowerCase() === categoryId.toLowerCase())) {
        matchedParent = cat;
        break;
      }
      if (cat.children && Array.isArray(cat.children)) {
        const found = cat.children.find(ch => 
          ch.slug === categoryId || 
          String(ch.id) === categoryId || 
          (ch.slug && ch.slug.toLowerCase() === categoryId.toLowerCase()) ||
          (ch.name && ch.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === categoryId.toLowerCase())
        );
        if (found) {
          matchedParent = cat;
          matchedChild = found;
          break;
        }
      }
    }

    if (matchedChild && matchedParent) {
      setActiveCategory(matchedParent.id);
      setActiveSubcategory(matchedChild.name);
    } else if (matchedParent) {
      setActiveCategory(matchedParent.id);
      setActiveSubcategory(querySub || "");
    } else {
      setActiveCategory(categoryId);
      setActiveSubcategory(querySub || "");
    }
  }, [categoryId, categories, querySub]);

  useEffect(() => {
    setSearchKeyword(queryQ);
    setSelectedCity(queryLocation || "Semua");
  }, [queryQ, queryLocation]);

  useEffect(() => {
    const currentCat = categories.find((c) => c.id === activeCategory);
    const catLabel = currentCat?.label || (activeCategory !== "all" ? activeCategory : "Kategori Usaha");
    document.title = `${catLabel} - Surade.com`;
  }, [activeCategory, categories]);

  // Outside-click detection for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
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

  const filteredBisnis = (!activeCategory || activeCategory === "all" || activeCategory === "semua")
    ? bisnisData
    : bisnisData.filter((b) => {
        if (!b) return false;
        const currentCat = categories.find((c) => c.id === activeCategory);
        const catLabel = currentCat?.label || activeCategory;
        const bSlug = (b.categorySlug || "").toLowerCase();
        const bName = (b.category || "").toLowerCase();
        const parentSlug = (b.parentCategorySlug || "").toLowerCase();
        const parentName = (b.parentCategoryName || "").toLowerCase();
        const targetId = activeCategory.toLowerCase();
        const targetLabel = catLabel.toLowerCase();

        const isChildMatch = currentCat?.children?.some(child => 
          (child.slug || "").toLowerCase() === bSlug || 
          (child.name || "").toLowerCase() === bName
        );

        return (
          bSlug === targetId ||
          bName === targetLabel ||
          parentSlug === targetId ||
          parentName === targetLabel ||
          bName.includes(targetId) ||
          bName.includes(targetLabel.split(" ")[0]) ||
          isChildMatch
        );
      });

  const searchFilteredBisnis = filteredBisnis.filter((b) => {
    // City filter
    const matchesCity = !selectedCity || selectedCity === "Semua" ||
      b.location.toLowerCase().includes(selectedCity.toLowerCase());

    // Sub kategori filter (misal: "Apotek", "Klinik Umum" di bawah Kesehatan, "Sedot WC" di bawah Jasa)
    const matchesSubcategory = !activeSubcategory ||
      (b.subCategory || "").toLowerCase() === activeSubcategory.toLowerCase() ||
      (b.categorySlug || "").toLowerCase() === activeSubcategory.toLowerCase() ||
      (b.category || "").toLowerCase() === activeSubcategory.toLowerCase() ||
      (b.subCategory && (
        b.subCategory.toLowerCase().includes(activeSubcategory.toLowerCase()) ||
        activeSubcategory.toLowerCase().includes(b.subCategory.toLowerCase())
      ));

    // Keyword filter
    const matchesKeyword = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());

    // Price range filter based on business's average product price
    let matchesPrice = true;
    if (selectedPriceRange && selectedPriceRange !== "all") {
      const range = PRICE_RANGES.find(r => r.id === selectedPriceRange);
      if (range) {
        // Use min_price if available, fall back to avg_price
        const price = b.min_price > 0 ? b.min_price : (b.avg_price || 0);
        if (b.products_count === 0 && price === 0) {
          matchesPrice = false;
        } else {
          const isAboveMin = range.min === null || price >= range.min;
          const isBelowMax = range.max === null || range.max === Infinity || price <= range.max;
          matchesPrice = isAboveMin && isBelowMax;
        }
      }
    }

    return matchesCity && matchesSubcategory && matchesKeyword && matchesPrice;
  }).sort((a, b) => {
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
    // Default / latest (stable numeric/string compare)
    const numA = Number(a.id);
    const numB = Number(b.id);
    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
    return String(b.id || "").localeCompare(String(a.id || ""));
  });

  // ── Pagination Setup (6 items per page) ──
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever search, category, city, price, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSubcategory, selectedCity, searchKeyword, selectedPriceRange, sortOption]);

  const totalItems = searchFilteredBisnis.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBisnis = searchFilteredBisnis.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
  }, [paginatedBisnis, loadingData]);

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
          const bId = fav.business_id || fav.business?.id || fav.id;
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

  const toggleSave = async (id, isPromo = false, itemName = "") => {
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
    localStorage.removeItem("cached_saved_items");
    window.dispatchEvent(new Event("bookmarkChanged"));

    if (isCurrentlySaved) {
      alert(`${itemName ? `"${itemName}"` : "Bisnis"} berhasil dihapus dari bookmark.`);
    } else {
      alert(`${itemName ? `"${itemName}"` : "Bisnis"} berhasil disimpan ke bookmark!`);
    }

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
          {/* Left Column: Breadcrumb, Title, Subtitle, Search Bar */}
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

            {/* Unified Search Bar (Matching Home Page Style) */}
            <form
              className="category-unified-search"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchParams((prev) => {
                  if (searchKeyword.trim()) {
                    prev.set("q", searchKeyword.trim());
                  } else {
                    prev.delete("q");
                  }
                  if (selectedCity && selectedCity !== "Semua") {
                    prev.set("location", selectedCity);
                  } else {
                    prev.delete("location");
                  }
                  return prev;
                });
              }}
            >
              {/* Keyword Group */}
              <div className="category-search__group category-search__group--keyword">
                <span className="category-search__label">Kata Kunci :</span>
                <input
                  type="text"
                  placeholder="Cari nama bisnis, produk, dll..."
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  className="category-search__input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>

              {/* Vertical Divider */}
              <div className="category-search__divider" />

              {/* Location Dropdown Group */}
              <div className="category-search__group category-search__group--location" ref={cityDropdownRef}>
                <span className="category-search__label">Lokasi</span>
                <button
                  type="button"
                  className="category-search__city-btn"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                >
                  <span className="category-search__city-text">{selectedCity}</span>
                  <ChevronDown size={16} className={`category-search__caret ${cityDropdownOpen ? "open" : ""}`} />
                </button>

                {cityDropdownOpen && (
                  <div className="category-city-dropdown" role="listbox">
                    <div className="category-city-search-box">
                      <Search size={14} className="category-city-search-icon" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Cari desa..."
                        value={kotaSearch}
                        onChange={(e) => setKotaSearch(e.target.value)}
                        className="category-city-search-input"
                      />
                    </div>
                    <ul className="category-city-list">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <li
                            key={city}
                            role="option"
                            aria-selected={city === selectedCity}
                            className={`category-city-option ${selectedCity === city ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedCity(city);
                              setCityDropdownOpen(false);
                              setKotaSearch("");
                              setSearchParams((prev) => {
                                if (city && city !== "Semua") {
                                  prev.set("location", city);
                                } else {
                                  prev.delete("location");
                                }
                                return prev;
                              });
                            }}
                          >
                            {city}
                          </li>
                        ))
                      ) : (
                        <li className="category-city-empty">Desa tidak ditemukan</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Search Submit Button */}
              <button type="submit" className="category-search__button" title="Cari Bisnis">
                <Search size={18} />
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Right Column: ikon-ikon melayang, menyatu langsung dengan
              background hero (tanpa kotak/bingkai foto) */}
          <div className="category-hero__right">
            <div className="hero-floating-icons" aria-hidden="true">
              {/* Ikon kategori aktif — otomatis ikut berubah sesuai kategori yang dibuka */}
              <div className="hero-icon-badge hero-icon-badge--top-right">
                {currentCategory?.icon || <Wrench size={22} strokeWidth={2} />}
              </div>

              {/* Ikon lokasi */}
              <div className="hero-icon-badge hero-icon-badge--mid-left hero-icon-badge--outline">
                <MapPin size={20} strokeWidth={2} />
              </div>

              {/* Ikon toko/bisnis */}
              <div className="hero-icon-badge hero-icon-badge--bottom-right hero-icon-badge--filled">
                <Store size={22} strokeWidth={2} />
              </div>

              {/* Kartu info singkat */}
              <div className="hero-info-card">
                <span className="hero-info-card__icon">
                  <Award size={20} strokeWidth={2} />
                </span>
                <p className="hero-info-card__text">
                  Berbagai pilihan usaha<br />terpercaya di Surade
                </p>
              </div>

              {/* Titik-titik dekoratif kecil, biar makin hidup */}
              <span className="hero-dot hero-dot--1" />
              <span className="hero-dot hero-dot--2" />
              <span className="hero-dot hero-dot--3" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY HORIZONTAL PILLS */}
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
                const isActive = activeCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}?${searchParams.toString()}`}
                    className={`reko-tab reko-tab--link${isActive ? " active" : ""}`}
                  >
                    <span className="reko-tab__icon-wrap">
                      <span className="reko-tab__icon">{cat.icon}</span>
                    </span>
                    <span className="reko-tab__label">{cat.label}</span>
                  </Link>
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

      {/* PERBAIKAN: fitur "Sub Kategori" (kartu-kartu kecil di bawah tab
          kategori, mis. "Klinik Umum / Apotek / Praktek Dokter" di bawah
          kategori "Kesehatan") dihapus atas permintaan - subkategori
          sekarang tidak ditampilkan di halaman ini sama sekali. */}

      {/* BUSINESS CARDS */}
      <section className="category-business-section">
        <div className="category-business-inner">
          <div className="category-business__header">
            <div className="category-business__title-wrap">
              <h2 className="category-business__title">
                {searchFilteredBisnis.length} Bisnis Ditemukan
              </h2>
              {(selectedPriceRange !== "all" || (selectedCity && selectedCity !== "Semua") || searchKeyword || activeSubcategory) && (
                <div className="category-active-filters-badges">
                  {activeSubcategory && (
                    <span className="filter-badge">
                      <Store size={11} /> {currentCategory?.children?.find(c => (c.slug || String(c.id)).toLowerCase() === activeSubcategory.toLowerCase())?.name || activeSubcategory}
                      <button type="button" onClick={() => {
                        setActiveSubcategory("");
                        setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete("sub"); return p; });
                      }} title="Hapus filter sub kategori"><X size={11} /></button>
                    </span>
                  )}
                  {selectedPriceRange !== "all" && (
                    <span className="filter-badge">
                      <Tag size={11} /> {PRICE_RANGES.find(r => r.id === selectedPriceRange)?.label}
                      <button type="button" onClick={() => setSelectedPriceRange("all")} title="Hapus filter harga"><X size={11} /></button>
                    </span>
                  )}
                  {selectedCity && selectedCity !== "Semua" && (
                    <span className="filter-badge">
                      <MapPin size={11} /> {selectedCity}
                      <button type="button" onClick={() => {
                        setSelectedCity("Semua");
                        setSearchParams(prev => { prev.delete("location"); return prev; });
                      }} title="Hapus filter desa"><X size={11} /></button>
                    </span>
                  )}
                  {searchKeyword && (
                    <span className="filter-badge">
                      <Search size={11} /> &quot;{searchKeyword}&quot;
                      <button type="button" onClick={() => {
                        setSearchKeyword("");
                        setSearchParams(prev => { prev.delete("q"); return prev; });
                      }} title="Hapus kata kunci"><X size={11} /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="category-business__filters">
              {/* Reset Filter Button */}
              <button
                className="btn-filter-outline"
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedCity("Semua");
                  setSelectedPriceRange("all");
                  setSortOption("relevance");
                  setSearchParams((prev) => { prev.delete("q"); prev.delete("location"); return prev; });
                }}
              >
                <X size={14} /> Reset filter
              </button>

              {/* Price Range Filter Dropdown */}
              <div className="filter-dropdown-wrap" ref={priceDropdownRef}>
                <button
                  type="button"
                  className={`btn-filter-outline ${selectedPriceRange !== "all" ? "active-filter" : ""}`}
                  onClick={() => setPriceDropdownOpen(!priceDropdownOpen)}
                >
                  <Tag size={14} className={selectedPriceRange !== "all" ? "text-[#007570]" : ""} />
                  <span>
                    {selectedPriceRange === "all"
                      ? "Filter Harga"
                      : PRICE_RANGES.find(r => r.id === selectedPriceRange)?.shortLabel || "Filter Harga"}
                  </span>
                  <ChevronDown size={14} className={`dropdown-caret ${priceDropdownOpen ? "open" : ""}`} />
                </button>

                {priceDropdownOpen && (
                  <div className="filter-dropdown-menu filter-dropdown-menu--price" role="menu">
                    <div className="filter-dropdown-header">
                      <span className="filter-dropdown-title">Rentang Harga Produk</span>
                    </div>
                    <ul className="filter-dropdown-list">
                      {PRICE_RANGES.map((range) => (
                        <li
                          key={range.id}
                          className={`filter-dropdown-item ${selectedPriceRange === range.id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedPriceRange(range.id);
                            setPriceDropdownOpen(false);
                          }}
                        >
                          <div className="filter-item-info">
                            <span className="filter-item-label">{range.label}</span>
                            {range.desc && (
                              <span className="filter-item-desc" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {range.icon && <range.icon size={12} className="filter-item-icon" />}
                                {range.desc}
                              </span>
                            )}
                          </div>
                          {selectedPriceRange === range.id && <Check size={15} className="filter-item-check" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="filter-dropdown-wrap" ref={sortDropdownRef}>
                <button
                  type="button"
                  className="btn-filter-outline"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                >
                  <ListFilter size={14} />
                  <span>{SORT_OPTIONS.find(s => s.id === sortOption)?.label || "Paling Relevan"}</span>
                  <ChevronDown size={14} className={`dropdown-caret ${sortDropdownOpen ? "open" : ""}`} />
                </button>

                {sortDropdownOpen && (
                  <div className="filter-dropdown-menu filter-dropdown-menu--sort" role="menu">
                    <ul className="filter-dropdown-list">
                      {SORT_OPTIONS.map((opt) => (
                        <li
                          key={opt.id}
                          className={`filter-dropdown-item ${sortOption === opt.id ? "selected" : ""}`}
                          onClick={() => {
                            setSortOption(opt.id);
                            setSortDropdownOpen(false);
                          }}
                        >
                          <span className="filter-item-label">{opt.label}</span>
                          {sortOption === opt.id && <Check size={15} className="filter-item-check" />}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="category-business-split">
            <div className="category-business-left" ref={listTopRef}>
              {loadingData ? (
                <BusinessGridSkeleton count={9} />
              ) : searchFilteredBisnis.length > 0 ? (
                <>
                  <div className="reko-grid">
                    {paginatedBisnis.map((bisnis) => (
                      <Link
                        key={bisnis.id}
                        to={`/business/${bisnis.id}`}
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
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(bisnis.id, false, bisnis.name); }}
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
                          {/* Price Tag - only show if price data exists, show min-max range */}
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

                          {/* Tags - only show if tags exist */}
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
                            <span className="biz-card__location" title={bisnis.location}>
                              <MapPin size={12} />{(bisnis.location || "Surade").split(",")[0].trim()}
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
                  {!loadingData && searchFilteredBisnis.length > 0 && totalPages > 1 && (
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
                <div className="category-empty">
                  <p>Tidak ada bisnis ditemukan untuk kategori ini.</p>
                  <Link to="/" className="category-empty__link">Kembali ke Home</Link>
                </div>
              )}
            </div>

            {/* MAP LAYOUT */}
            <div 
              className="category-business-right"
              style={{
                height: gridHeight ? `${gridHeight}px` : '100%',
                minHeight: gridHeight ? `${gridHeight}px` : '450px',
                maxHeight: gridHeight ? `${gridHeight}px` : 'none'
              }}
            >
              <MapView 
                businesses={paginatedBisnis}
                height={gridHeight ? `${gridHeight}px` : '100%'}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}