import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/home/HeroSection";
import PremiumAdsSection from "../components/home/PremiumAdsSection";
import StandardAdsSection from "../components/home/StandardAdsSection";
import useScrollReveal from "../hooks/useScrollReveal";
import logoImg from "../assets/logo-surade.png";
import irmanImg from "../assets/team/irman.jpg";
import sriImg from "../assets/team/sri.jpg";
import rajaImg from "../assets/team/raja.jpg";
import farhanImg from "../assets/team/farhan.jpg";
import yogaImg from "../assets/team/yoga.jpg";
import naufalImg from "../assets/team/naufal.jpg";
import husnulImg from "../assets/team/husnul.jpg";
import diniImg from "../assets/team/dini.jpg";

/* ── Foto asli Smart Village (menggantikan placeholder picsum.photos) ── */
import { SMART_CITIES, SMART_CITY_IMAGE_BY_SLUG } from "../data/smartVillageData";
import { getBusinesses } from "../services/businessService";
import { InlineSpinner } from "../components/LoadingScreen";
import { BusinessGridSkeleton } from "../components/BusinessCardSkeleton";
import TypewriterText from "../components/TypewriterText";
import TestimonialsColumn from "../components/TestimonialsColumn";
import { getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
import { getBusinessOpenStatus } from "../utils/businessHours";
import useRepeatReveal from "../hooks/useRepeatReveal";
import api from "../services/api";
import {
  Store,
  Coffee,
  Smartphone,
  Shirt,
  Wrench,
  MapPin,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Eye,
  Star,
  Tag,
  Pointer,
  Megaphone,
  Rocket,
  BookOpen,
  User,
  Calendar,
  Building2,
  Landmark,
  BadgeCheck,
  ArrowRight,
  Heart,
  GraduationCap,
  Camera,
  Scissors,
  Leaf,
  Car,
  Crown,
  Utensils,
  Palette,
  HeartPulse,
  ShoppingBag,
  Package,
  Bed,
} from "lucide-react";

/* Helper to get contextual icons for every subcategory */
const getSubcategoryIcon = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("kayu") || n.includes("mebel")) return <Wrench size={13} className="text-amber-600 shrink-0" />;
  if (n.includes("pertanian") || n.includes("tani") || n.includes("kebun")) return <Leaf size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("kerajinan") || n.includes("anyaman") || n.includes("tikar") || n.includes("bambu")) return <Palette size={13} className="text-purple-600 shrink-0" />;
  if (n.includes("roti") || n.includes("bakery") || n.includes("kue")) return <Utensils size={13} className="text-amber-500 shrink-0" />;
  if (n.includes("warung") || n.includes("makan") || n.includes("kuliner") || n.includes("seblak") || n.includes("resto")) return <Utensils size={13} className="text-orange-500 shrink-0" />;
  if (n.includes("apotek") || n.includes("obat") || n.includes("dokter") || n.includes("sehat") || n.includes("klinik")) return <HeartPulse size={13} className="text-rose-500 shrink-0" />;
  if (n.includes("bengkel") || n.includes("motor") || n.includes("mobil") || n.includes("otomotif")) return <Car size={13} className="text-blue-600 shrink-0" />;
  if (n.includes("baju") || n.includes("busana") || n.includes("fashion") || n.includes("muslim")) return <Shirt size={13} className="text-indigo-600 shrink-0" />;
  if (n.includes("minimarket") || n.includes("yomart") || n.includes("sembako") || n.includes("retail")) return <ShoppingBag size={13} className="text-emerald-600 shrink-0" />;
  if (n.includes("cat") || n.includes("bangunan") || n.includes("properti")) return <Building2 size={13} className="text-cyan-600 shrink-0" />;
  if (n.includes("wisata") || n.includes("penginapan") || n.includes("hotel") || n.includes("pantai")) return <Bed size={13} className="text-teal-600 shrink-0" />;
  if (n.includes("olahan") || n.includes("gula") || n.includes("ikan") || n.includes("madu") || n.includes("keripik") || n.includes("opak")) return <Package size={13} className="text-amber-700 shrink-0" />;
  if (n.includes("elektronik") || n.includes("komputer") || n.includes("hp")) return <Smartphone size={13} className="text-blue-500 shrink-0" />;
  return <Tag size={13} className="text-[#007570] shrink-0" />;
};

/* ── Categories loaded dynamically from API ── */

/* ── How it works steps ── */
const QUICK_STEPS = [
  { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
  { num: "2", title: "Temutambahkan UMKM", desc: "Hingga skala terkecil UMKM." },
  { num: "3", title: "Temukan UMKM Secara Kategori", desc: "Hubungi pelaku usaha." },
];

/* ── Key Features data ── */
const FEATURES_DATA = [
  {
    id: 1,
    title: "Pencarian Akurat",
    text: "Memudahkan pencarian pelaku usaha dan UMKM dengan pencarian yang akurat",
    icon: <MapPin size={24} />,
  },
  {
    id: 2,
    title: "Hanya Satu Kali Klik",
    text: "Hanya dengan satu kali klik 'One Click Service' langsung terhubung dengan Whatsapp pelaku usaha",
    icon: <Pointer size={24} />,
  },
  {
    id: 3,
    title: "Cepat dan Mudah",
    text: "Mudah didaftarkan hanya melalui whatsapp, cepat dalam penayangan iklan usaha",
    icon: <Rocket size={24} />,
  },
  {
    id: 4,
    title: "Kontak Langsung",
    text: "Anda dapat menghubungi dan mendatangi pelaku usaha secara langsung tanpa perantara",
    icon: <BookOpen size={24} />,
  },
];

/* SMART_CITIES & SMART_CITY_IMAGE_BY_SLUG sekarang diimpor dari
   ../data/smartVillageData agar sama persis dengan yang dipakai
   halaman detail per-desa (SmartCity.jsx). */

function getVillageImage(city) {
  return SMART_CITY_IMAGE_BY_SLUG[city.slug] || city.img || city.image;
}

/* ── Testimonials data ── */
const TESTIMONIALS_DATA = [
  {
    id: 2,
    avatar: sriImg,
    name: "Sri Budiati",
    text: "Surade.co.id membantu menyajikan informasi daerah dalam satu platform yang lebih mudah diakses dan dipahami oleh semua kalangan.",
  },
  {
    id: 3,
    avatar: rajaImg,
    name: "M. Raja Fakhri",
    text: "Platform ini punya potensi besar untuk membuat informasi lokal lebih mudah ditemukan. Tampilannya pun cukup bersih dan nyaman dipakai.",
  },
  {
    id: 4,
    avatar: farhanImg,
    name: "Farhan M",
    text: "Surade.co.id jadi salah satu platform yang membantu menghubungkan masyarakat dengan berbagai informasi dan potensi bisnis di daerahnya.",
  },
  {
    id: 5,
    avatar: yogaImg,
    name: "Yoga Hepta G",
    text: "Saya senang ada platform seperti ini. Digitalisasi informasi daerah itu penting banget, terutama untuk mendukung program Smart Village.",
  },
  {
    id: 6,
    avatar: naufalImg,
    name: "Naufal Handoko",
    text: "Dari sisi teknis, Surade.co.id sudah cukup solid. Integrasi data bisnis lokal dengan sistem pencariannya terasa responsif dan mudah digunakan.",
  },
  {
    id: 7,
    avatar: husnulImg,
    name: "Husnul Hotimah",
    text: "Koordinasi antar tim dalam pengembangan platform ini cukup terstruktur. Roadmap-nya jelas dan fokus pada kebutuhan pengguna di daerah.",
  },
  {
    id: 8,
    avatar: diniImg,
    name: "Dini Hawariw",
    text: "Surade.co.id membantu UMKM di daerah untuk lebih mudah ditemukan. Ini langkah nyata menuju ekosistem digital yang lebih merata di Indonesia.",
  },
];


const getCategoryIcon = (iconName, label = "") => {
  switch (iconName) {
    case "store":
      return <Store size={26} strokeWidth={1.7} />;
    case "coffee":
      return <Coffee size={26} strokeWidth={1.7} />;
    case "smartphone":
      return <Smartphone size={26} strokeWidth={1.7} />;
    case "shirt":
      return <Shirt size={26} strokeWidth={1.7} />;
    case "wrench":
      return <Wrench size={26} strokeWidth={1.7} />;
    case "map-pin":
      return <MapPin size={26} strokeWidth={1.7} />;
    case "building":
      return <Building2 size={26} strokeWidth={1.7} />;
    case "landmark":
      return <Landmark size={26} strokeWidth={1.7} />;
    case "heart":
      return <Heart size={26} strokeWidth={1.7} />;
    case "graduation":
      return <GraduationCap size={26} strokeWidth={1.7} />;
    case "camera":
      return <Camera size={26} strokeWidth={1.7} />;
    case "scissors":
      return <Scissors size={26} strokeWidth={1.7} />;
    case "leaf":
      return <Leaf size={26} strokeWidth={1.7} />;
    case "car":
      return <Car size={26} strokeWidth={1.7} />;
    default:
      // Field "icon" dari database kosong / tidak cocok dengan salah satu
      // di atas -> tebak ikonnya dari NAMA kategori, supaya kategori yang
      // namanya sudah ada (Hiburan, Jasa, Kesehatan, dst) tetap dapat ikon
      // yang beda-beda, tidak semuanya jatuh ke ikon toko generik.
      return getCategoryIconByLabel(label);
  }
};

const getCategoryIconByLabel = (label) => {
  const l = (label || "").toLowerCase();
  if (l.includes("hiburan") || l.includes("rekreasi") || l.includes("wisata")) return <Camera size={26} strokeWidth={1.7} />;
  if (l.includes("jasa") || l.includes("servis") || l.includes("bengkel")) return <Wrench size={26} strokeWidth={1.7} />;
  if (l.includes("kesehatan") || l.includes("klinik")) return <Heart size={26} strokeWidth={1.7} />;
  if (l.includes("kuliner") || l.includes("restoran") || l.includes("makanan") || l.includes("minuman")) return <Coffee size={26} strokeWidth={1.7} />;
  if (l.includes("otomotif") || l.includes("spare part") || l.includes("bengkel")) return <Car size={26} strokeWidth={1.7} />;
  if (l.includes("pendidikan") || l.includes("sekolah")) return <GraduationCap size={26} strokeWidth={1.7} />;
  if (l.includes("properti") || l.includes("bangunan") || l.includes("material") || l.includes("konstruksi")) return <Building2 size={26} strokeWidth={1.7} />;
  if (l.includes("teknologi") || l.includes("elektronik") || l.includes("gadget")) return <Smartphone size={26} strokeWidth={1.7} />;
  if (l.includes("fashion") || l.includes("konveksi")) return <Shirt size={26} strokeWidth={1.7} />;
  if (l.includes("salon") || l.includes("kecantikan") || l.includes("potong")) return <Scissors size={26} strokeWidth={1.7} />;
  if (l.includes("pertanian") || l.includes("peternakan") || l.includes("kebun")) return <Leaf size={26} strokeWidth={1.7} />;
  if (l.includes("retail") || l.includes("warung") || l.includes("sembako") || l.includes("umkm")) return <Store size={26} strokeWidth={1.7} />;
  return <Store size={26} strokeWidth={1.7} />;
};

const getCategoryTheme = (label) => {
  return { 
    bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", 
    color: "#047857", 
    border: "#a7f3d0" 
  };
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedKota, setSelectedKota] = useState("Semua");
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedBiz, setSavedBiz] = useState({});
  // Helper to read initial cache safely
  const getInitialCache = (key, fallback) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Bersihkan cache iklan lama jika masih berisi iklan mockup
  if (typeof window !== "undefined") {
    try {
      const adCache = sessionStorage.getItem("cached_home_ads_obj");
      if (adCache && (adCache.includes("JOTUN") || adCache.includes("Hero Banner"))) {
        sessionStorage.removeItem("cached_home_ads_obj");
        sessionStorage.removeItem("cached_home_businesses");
      }
    } catch (e) {}
  }

  const cachedBisnis = getInitialCache("cached_home_businesses", []);
  const cachedAds = getInitialCache("cached_home_ads_obj", null);
  const cachedBlogs = getInitialCache("cached_home_blogs", []);
  const cachedCitiesRaw = getInitialCache("cached_smart_cities", []);
  const cachedCities = cachedCitiesRaw.length > 0 ? cachedCitiesRaw : SMART_CITIES;
  const cachedRawCats = getInitialCache("cached_public_categories_raw", []);

  const [savedBlogs, setSavedBlogs] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(
    Array.isArray(cachedRawCats) && cachedRawCats.length > 0
      ? [
          { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
          ...cachedRawCats.map(c => ({ id: c.slug || String(c.id), label: c.name, icon: getCategoryIcon(c.icon, c.name) }))
        ]
      : [{ id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> }]
  );
  const [bisnisData, setBisnisData] = useState(cachedBisnis);
  const [temukanData, setTemukanData] = useState(cachedBisnis);
  const [premiumAds, setPremiumAds] = useState(cachedAds?.premium || []);
  const [standardAds, setStandardAds] = useState(cachedAds?.standard || []);
  const [adsData, setAdsData] = useState(cachedAds?.all || []);
  const [loadingAds, setLoadingAds] = useState(!cachedAds);
  const [loadingData, setLoadingData] = useState(cachedBisnis.length === 0);
  const [blogsData, setBlogsData] = useState(cachedBlogs);
  const [testimonialsData, setTestimonialsData] = useState(TESTIMONIALS_DATA);
  const [smartCitiesData, setSmartCitiesData] = useState(cachedCities);
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Try Ultra-Fast Single /home-summary Endpoint
      try {
        const summaryRes = await fetch(`${import.meta.env.VITE_API_URL}/home-summary`);
        if (summaryRes.ok) {
          const summary = await summaryRes.json();

          // Categories
          if (Array.isArray(summary.categories) && summary.categories.length > 0) {
            try {
              sessionStorage.setItem("cached_public_categories_raw", JSON.stringify(summary.categories));
            } catch (e) {}
            setCategories([
              { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
              ...summary.categories.map(c => ({
                id: c.slug || String(c.id),
                label: c.name,
                icon: getCategoryIcon(c.icon, c.name)
              }))
            ]);
          } else {
            try {
              const catRes = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
              if (catRes.ok) {
                const catData = await catRes.json();
                const list = Array.isArray(catData) ? catData : (Array.isArray(catData?.data) ? catData.data : []);
                if (list.length > 0) {
                  setCategories([
                    { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
                    ...list.map(c => ({ id: c.slug || String(c.id), label: c.name, icon: getCategoryIcon(c.icon, c.name) }))
                  ]);
                }
              }
            } catch (e) {}
          }

          // Smart Village (12 Desa/Kelurahan Kecamatan Surade)
          if (Array.isArray(summary.smart_cities) && summary.smart_cities.length > 0) {
            const mappedSc = summary.smart_cities.map(c => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              img: c.image || c.img,
              bisnis: c.bisnis || 0,
              description: c.description
            }));
            setSmartCitiesData(mappedSc);
            try {
              sessionStorage.setItem("cached_smart_cities", JSON.stringify(mappedSc));
            } catch (e) {}
          } else {
            // Backend belum mengirim data desa — pakai 12 desa default agar seksi tetap tampil lengkap
            setSmartCitiesData(SMART_CITIES);
          }

          // Businesses
          if (Array.isArray(summary.businesses)) {
            const mappedBiz = summary.businesses.map(b => {
              const mainCategory = b.category?.parent || b.category;
              const subCategory = b.category?.parent ? b.category : null;
              const categoryName = mainCategory?.name || b.category?.name || "Umum";
              const subCategoryName = subCategory?.name || null;
              const openStatus = getBusinessOpenStatus(b.opening_days);

              return {
                id: b.id,
                name: b.name,
                category: categoryName,
                subCategory: subCategoryName,
                categoryColor: b.category?.icon === "store" ? "#007570" : b.category?.icon === "coffee" ? "#0ea5e9" : "#f59e0b",
                tags: Array.isArray(b.tags) && b.tags.length > 0 ? b.tags : [b.name],
                location: b.city ? (b.province ? `${b.city}, ${b.province}` : b.city) : (b.address || "Indonesia"),
                address: b.address || b.city || "Indonesia",
                city: b.city || "Indonesia",
                province: b.province || "",
                views: b.views || 0,
                rating: b.rating || "0.0",
                rating_count: b.rating_count || 0,
                status: openStatus.label,
                img: getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
                open: openStatus.open,
                featured: b.featured,
                description: b.description,
                is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
                is_verified: Boolean(b.is_verified),
              };
            });
            setBisnisData(mappedBiz);
            setTemukanData(mappedBiz);
            try {
              sessionStorage.setItem("cached_home_businesses", JSON.stringify(mappedBiz));
            } catch (e) {}
          }

          // Advertisements
          if (Array.isArray(summary.advertisements) && summary.advertisements.length > 0) {
            const mappedAds = summary.advertisements.map(ad => ({
              id: ad.id,
              businessId: ad.business_id,
              name: ad.name || "Bisnis Pilihan",
              package_type: ad.package_type || "standard",
              rating: ad.rating || "0.0",
              rating_count: ad.rating_count || 0,
              city: ad.city || "Indonesia",
              province: ad.province || "",
              location: ad.location || "Indonesia",
              image: getStorageUrl(ad.image || ad.banner || ad.logo),
              banner: getStorageUrl(ad.banner),
              logo: getStorageUrl(ad.logo),
            }));

            console.log('📣 Advertisements loaded:', mappedAds.length, 'total');
            console.log('📦 Package types:', mappedAds.map(a => a.package_type));

            const premium = mappedAds.filter(a => a.package_type === "premium" || a.package_type === "hero");
            const standard = mappedAds.filter(a => a.package_type === "standard" || a.package_type === "ticker");

            console.log('🎯 Premium/Hero ads:', premium.length);
            console.log('🎫 Standard/Ticker ads:', standard.length);

            setPremiumAds(premium.length > 0 ? premium : standard.slice(0, 4));
            setStandardAds(standard.length > 0 ? standard : premium);
            setAdsData(mappedAds);
            setLoadingAds(false);

            try {
              sessionStorage.setItem("cached_home_ads_obj", JSON.stringify({
                premium: premium.length > 0 ? premium : standard.slice(0, 4),
                standard: standard.length > 0 ? standard : premium,
                all: mappedAds,
              }));
            } catch (e) {}
          }

          // Blogs & Events
          if (Array.isArray(summary.blogs)) {
            const mappedBlogs = summary.blogs.map(b => {
              const isEvent = b.type === "event";
              const startDate = b.event_date ? new Date(b.event_date) : (b.published_at ? new Date(b.published_at) : null);
              const endDate = b.event_end_date ? new Date(b.event_end_date) : null;
              
              let eventDateRange = null;
              let eventDateBadge = null;
              if (isEvent && startDate) {
                const sStr = startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                if (endDate) {
                  const eStr = endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
                  eventDateRange = `${sStr} - ${eStr}`;
                  eventDateBadge = `${startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
                } else {
                  eventDateRange = sStr;
                  eventDateBadge = sStr;
                }
              }

              const pubDate = b.published_at
                ? new Date(b.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "Terbaru";

              return {
                id: b.id,
                slug: b.slug,
                title: b.title,
                category: b.blog_category || b.category?.name || (isEvent ? "Event" : "Artikel"),
                author: b.user?.name || "Admin Surade.co.id",
                date: isEvent ? (eventDateRange || pubDate) : pubDate,
                eventDateBadge: isEvent ? eventDateBadge : null,
                thumbnail: b.thumbnail,
                img: getStorageUrl(b.thumbnail) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
                type: b.type || "blog",
              };
            });
            setBlogsData(mappedBlogs);
            try {
              sessionStorage.setItem("cached_home_blogs", JSON.stringify(mappedBlogs));
            } catch (e) {}
          }

          setLoadingData(false);
          setLoadingAds(false); // FIX: sebelumnya cuma di-set false kalau ada iklan,
          // jadi kalau array iklan kosong, section iklan nyangkut loading selamanya
          return;
        }
      } catch (err) {
        console.warn("Fast home-summary fallback:", err);
      }

      // Fallback: Individual requests
      const fetchCategories = fetch(`${import.meta.env.VITE_API_URL}/categories`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
        .then(catData => {
          const list = Array.isArray(catData) ? catData : (Array.isArray(catData?.data) ? catData.data : []);
          if (list.length > 0) {
            setCategories([
              { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
              ...list.map(c => ({ id: c.slug || String(c.id), label: c.name, icon: getCategoryIcon(c.icon, c.name) }))
            ]);
          }
        }).catch(err => console.error(err));

      const fetchBusinesses = fetch(`${import.meta.env.VITE_API_URL}/businesses?limit=24`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
        .then(bizJson => {
          const bizData = bizJson?.data || bizJson || [];
          if (Array.isArray(bizData)) {
            const mapped = bizData.map(b => {
              const openStatus = getBusinessOpenStatus(b.opening_days);
              return {
                id: b.id,
                name: b.name,
                category: b.category?.name || "Umum",
                subCategory: null,
                categoryColor: "#007570",
                tags: Array.isArray(b.tags) ? b.tags : [b.name],
                location: b.city || "Indonesia",
                address: b.address || "Indonesia",
                city: b.city || "Indonesia",
                province: b.province || "",
                views: b.views || 0,
                status: openStatus.label,
                img: getStorageUrl(b.logo || b.banner),
                open: openStatus.open,
                featured: b.featured,
                description: b.description,
                is_premium: Boolean(b.is_premium),
              };
            });
            setBisnisData(mapped);
            setTemukanData(mapped);
          }
        }).catch(err => console.error(err));

      await Promise.allSettled([fetchCategories, fetchBusinesses]);
      setLoadingData(false);
      setLoadingAds(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollLeft = 0;
    }
  }, [categories]);

  const filteredBisnis = activeCategory === "all"
    ? bisnisData
    : bisnisData.filter((b) =>
      b.category.toLowerCase().includes(
        categories.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
      )
    );

  const cityFilteredBisnis = selectedCity
    ? bisnisData.filter((b) => b.location.includes(selectedCity))
    : bisnisData;

  const searchFilteredBisnis = searchKeyword
    ? bisnisData.filter((b) =>
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : bisnisData;

  // Combine all filters and sort Premium first
  const finalFilteredBisnis = bisnisData.filter((b) => {
    const matchesCategory = activeCategory === "all" ||
      b.category.toLowerCase().includes(
        categories.find((c) => c.id === activeCategory)?.label.split(" ")[0].toLowerCase() ?? ""
      );
    const matchesCity = !selectedCity || b.location.includes(selectedCity);
    const matchesSearch = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesCategory && matchesCity && matchesSearch;
  }).sort((a, b) => {
    if (a.is_premium && !b.is_premium) return -1;
    if (!a.is_premium && b.is_premium) return 1;
    return (b.id || 0) - (a.id || 0);
  });

  // Filter TEMUKAN_DATA based on search and organize Free vs Premium
  const filteredTemukanData = useMemo(() => {
    const filtered = temukanData.filter((b) => {
      const matchesSearch = !searchKeyword ||
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesSearch;
    });

    if (searchKeyword.trim()) {
      return [...filtered].sort((a, b) => {
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        return (b.id || 0) - (a.id || 0);
      });
    }

    // Default view: 3 Premium (row 1) + 3 Free (row 2) per page so contrast is clearly visible
    const prem = filtered.filter(b => b.is_premium).sort((a, b) => (b.id || 0) - (a.id || 0));
    const free = filtered.filter(b => !b.is_premium).sort((a, b) => (b.id || 0) - (a.id || 0));

    const result = [];
    const totalPages = Math.ceil((prem.length + free.length) / 6) || 1;
    for (let p = 0; p < totalPages; p++) {
      const pPrem = prem.slice(p * 3, (p + 1) * 3);
      const pFree = p === totalPages - 1 ? free.slice(p * 3) : free.slice(p * 3, (p + 1) * 3);
      result.push(...pPrem, ...pFree);
    }
    return result;
  }, [temukanData, searchKeyword]);

  const fetchUserSavedState = async () => {
    const token = localStorage.getItem("token");
    const bizSavedMap = {};
    const blogSavedMap = {};

    try {
      const localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
      (Array.isArray(localBiz) ? localBiz : []).forEach(id => { bizSavedMap[id] = true; });

      const localBlogs = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
      (Array.isArray(localBlogs) ? localBlogs : []).forEach(id => { blogSavedMap[id] = true; });
    } catch (e) {}

    // PERBAIKAN: endpoint /my-favorites & /my-blog-favorites di backend
    // dibatasi cuma buat role "user" (Route::middleware('role:user')) -
    // dulu di sini dipanggil untuk SEMUA akun yang login termasuk admin,
    // jadi kalau yang login admin, 2 request ini selalu gagal 403 (bikin
    // console penuh error tiap buka halaman ini). Sekarang dilewati kalau
    // bukan role "user".
    let isRegularUser = false;
    try {
      isRegularUser = JSON.parse(localStorage.getItem("user") || "null")?.role === "user";
    } catch (e) {}

    if (token && isRegularUser) {
      try {
        const [resBiz, resBlog] = await Promise.allSettled([
          api.get("/my-favorites"),
          api.get("/my-blog-favorites")
        ]);

        if (resBiz.status === "fulfilled" && resBiz.value.data) {
          const bizData = resBiz.value.data?.data || resBiz.value.data || [];
          const bizArr = Array.isArray(bizData) ? bizData : (bizData?.data || []);
          bizArr.forEach(fav => {
            const bId = fav.business_id || fav.business?.id;
            if (bId) bizSavedMap[bId] = true;
          });
        }

        if (resBlog.status === "fulfilled" && resBlog.value.data) {
          const blogData = resBlog.value.data?.data || resBlog.value.data || [];
          const blogArr = Array.isArray(blogData) ? blogData : (blogData?.data || []);
          blogArr.forEach(fav => {
            const bId = fav.blog_id || fav.blog?.id;
            if (bId) blogSavedMap[bId] = true;
          });
        }
      } catch (err) {
        console.error("Failed to fetch favorites in Home:", err);
      }
    }

    setSavedBiz(bizSavedMap);
    setSavedBlogs(blogSavedMap);
  };

  useEffect(() => {
    fetchUserSavedState();
    window.addEventListener("bookmarkChanged", fetchUserSavedState);
    return () => window.removeEventListener("bookmarkChanged", fetchUserSavedState);
  }, []);

  const toggleSave = async (id, isBlog = false, itemName = "") => {
    if (!id) return;
    if (!requireAuth()) return;

    const isCurrentlySaved = isBlog ? !!savedBlogs[id] : !!savedBiz[id];

    if (isBlog) {
      setSavedBlogs((prev) => ({ ...prev, [id]: !isCurrentlySaved }));
    } else {
      setSavedBiz((prev) => ({ ...prev, [id]: !isCurrentlySaved }));
    }

    const storageKey = isBlog ? "saved_blog_ids" : "saved_business_ids";
    let localItems = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (isCurrentlySaved) {
      localItems = localItems.filter(item => String(item) !== String(id));
    } else {
      if (!localItems.includes(id)) localItems.push(id);
    }
    localStorage.setItem(storageKey, JSON.stringify(localItems));

    // Clear stale AdminUser cache so fresh bookmarks load immediately
    localStorage.removeItem("cached_saved_items");
    window.dispatchEvent(new Event("bookmarkChanged"));

    if (isCurrentlySaved) {
      alert(`${isBlog ? "Blog/Event" : "Bisnis"}${itemName ? ` "${itemName}"` : ""} berhasil dihapus dari bookmark.`);
    } else {
      alert(`${isBlog ? "Blog/Event" : "Bisnis"}${itemName ? ` "${itemName}"` : ""} berhasil disimpan ke bookmark!`);
    }

    try {
      const endpoint = isBlog ? `/blog-favorites/${id}` : `/favorites/${id}`;
      if (isCurrentlySaved) {
        await api.delete(endpoint);
      } else {
        await api.post(endpoint);
      }
    } catch (err) {
      console.error("Failed to toggle favorite API:", err);
    }
  };

  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      const newHistoryItem = { keyword: searchKeyword.trim(), category: selectedSearchCategory };
      const updatedHistory = [
        newHistoryItem,
        ...searchHistory.filter(h => h.keyword.toLowerCase() !== searchKeyword.trim().toLowerCase())
      ].slice(0, 2);
      localStorage.setItem("search_history", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
    navigate(`/category/${selectedSearchCategory}?q=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(selectedKota)}`);
  };

  // ── Temukan Bisnis Pagination & Auto-Slide Setup (6 items per page, max 4 pages) ──
  const [businessCurrentPage, setBusinessCurrentPage] = useState(1);
  const [slideAnim, setSlideAnim] = useState({ phase: "active", direction: "next" });
  const [isBizHovered, setIsBizHovered] = useState(false);
  const isTransitioningRef = useRef(false);
  const timerRef = useRef(null);

  const BUSINESSES_PER_PAGE = 6;
  const MAX_HOME_BUSINESS_PAGES = 4;
  const totalBusinesses = filteredTemukanData.length;
  const totalBusinessPages = Math.min(MAX_HOME_BUSINESS_PAGES, Math.ceil(totalBusinesses / BUSINESSES_PER_PAGE)) || 1;
  const safeBusinessCurrentPage = Math.min(Math.max(1, businessCurrentPage), totalBusinessPages);
  const businessStartIndex = (safeBusinessCurrentPage - 1) * BUSINESSES_PER_PAGE;
  const paginatedBusinesses = filteredTemukanData.slice(businessStartIndex, businessStartIndex + BUSINESSES_PER_PAGE);

  // Transition function for ultra-smooth directional sliding
  const transitionToPage = useCallback((newPage, direction = "next") => {
    if (isTransitioningRef.current || newPage === safeBusinessCurrentPage) return;
    isTransitioningRef.current = true;

    // 1. Exit phase (slide out towards direction)
    setSlideAnim({ phase: "exiting", direction });

    setTimeout(() => {
      // 2. Change page & position entering offscreen
      setBusinessCurrentPage(newPage);
      setSlideAnim({ phase: "entering", direction });

      // 3. Trigger active slide in animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          setSlideAnim({ phase: "active", direction });
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 360);
        }, 30);
      });
    }, 280);
  }, [safeBusinessCurrentPage]);

  // Robust auto-slide interval (slides every 5 seconds, auto-recovers, never permanently pauses)
  useEffect(() => {
    if (totalBusinessPages <= 1) return;

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isBizHovered && !isTransitioningRef.current) {
          setBusinessCurrentPage((curr) => {
            const next = curr >= totalBusinessPages ? 1 : curr + 1;
            transitionToPage(next, "next");
            return curr;
          });
        }
      }, 5000);
    };

    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBizHovered, totalBusinessPages, transitionToPage]);

  const businessPageNumbers = useMemo(() => {
    const pages = [];
    if (totalBusinessPages <= 5) {
      for (let i = 1; i <= totalBusinessPages; i++) pages.push(i);
    } else {
      if (safeBusinessCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalBusinessPages);
      } else if (safeBusinessCurrentPage >= totalBusinessPages - 2) {
        pages.push(1, "...", totalBusinessPages - 3, totalBusinessPages - 2, totalBusinessPages - 1, totalBusinessPages);
      } else {
        pages.push(1, "...", safeBusinessCurrentPage - 1, safeBusinessCurrentPage, safeBusinessCurrentPage + 1, "...", totalBusinessPages);
      }
    }
    return pages;
  }, [totalBusinessPages, safeBusinessCurrentPage]);

  const handleBusinessPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalBusinessPages || newPage === safeBusinessCurrentPage) return;
    const direction = newPage > safeBusinessCurrentPage ? "next" : "prev";
    transitionToPage(newPage, direction);
  };

  // ── Home Blogs Display (Latest 6 items) ──
  const homeBlogs = blogsData.slice(0, 6);

  // ── Subtle Scroll Reveal Animation Hook ──
  useScrollReveal([categories, smartCitiesData, filteredTemukanData, testimonialsData, homeBlogs]);

  // Animasi berulang untuk section "Cepat dan Memudahkan Pencarian":
  // teks & gambar akan muncul lagi tiap kali di-scroll lewat (naik/turun).
  const [quickTextRef, quickTextRevealed] = useRepeatReveal();
  const [quickImgRef, quickImgRevealed] = useRepeatReveal();
  // Animasi teks berulang di banner foto sawah (muncul tiap dilewati, naik/turun)
  const [sawahTextRef, sawahTextRevealed] = useRepeatReveal();

  return (
    <div className="home-page">
      {/* ── NAVBAR ── */}
      <Navbar />

      {/* ── HERO BANNER ── */}
      <HeroSection
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        selectedSearchCategory={selectedSearchCategory}
        setSelectedSearchCategory={setSelectedSearchCategory}
        selectedKota={selectedKota}
        setSelectedKota={setSelectedKota}
        searchHistory={searchHistory}
        categories={categories}
        handleSearchSubmit={handleSearchSubmit}
      />

      {/* ── 1. PREMIUM ADS (HERO VISUAL CAROUSEL) ── */}
      <PremiumAdsSection ads={premiumAds} loading={loadingAds} />

      {/* ── 2. STANDARD ADS (CONTINUOUS INFINITE TICKER) ── */}
      <StandardAdsSection ads={standardAds} loading={loadingAds} />

      {/* ── 3. KATEGORI SECTION ── */}
      <section className="category-section reveal-on-scroll">
        <div className="category-inner">
          <div className="home-cat-grid" ref={categoryScrollRef}>
            {(() => {
              const rawCats = categories.filter((cat) => cat.id !== "all");
              const items = [...rawCats];
              // Pastikan jumlah kartu genap 10 agar grid 5x2 terisi sempurna tanpa ada yang bolong!
              if (items.length % 5 !== 0) {
                items.push({
                  id: "wisata",
                  label: "Wisata & Budaya",
                  icon: <Landmark size={26} strokeWidth={1.7} />
                });
              }
              return items.map((cat) => {
                const theme = getCategoryTheme(cat.label || cat.id);
                return (
                  <Link key={cat.id} to={`/category/${cat.id}`} className="home-cat-card">
                    <span 
                      className="home-cat-card__icon" 
                      style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}
                    >
                      {cat.icon}
                    </span>
                    <span className="home-cat-card__label">{cat.label}</span>
                    <span className="home-cat-card__cta" style={{ color: theme.color }}>
                      Jelajahi &rarr;
                    </span>
                  </Link>
                );
              });
            })()}
          </div>
        </div>
      </section>

      {/* ── SMART CITY SECTION ── */}
      <section className="py-16 bg-[#f8fafc] text-slate-800 border-t border-slate-200/80 reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 reveal-on-scroll">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-2.5">
              Smart Village
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-normal leading-relaxed">
              Surade.co.id Mendorong Percepatan Program Pemerintah Smart Village
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 reveal-stagger">
            {smartCitiesData.length > 0 ? (
              smartCitiesData.map((city) => {
                const displayName = /^(Kota|Kabupaten|Kab\.|DKI|Provinsi|Desa|Kelurahan)/i.test(city.name?.trim() || "")
                  ? city.name?.trim()
                  : `Desa ${city.name?.trim() || ""}`;
                const totalBisnis = Number(city.bisnis || 0);

                return (
                  <Link
                    key={city.id}
                    to={`/smart-city/${city.slug || city.id}`}
                    className="group relative block aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-slate-900 reveal-card"
                  >
                    <img
                      src={getVillageImage(city)}
                      alt={city.name}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300" />
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-center z-10 flex flex-col items-center justify-end">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide transition-all duration-300 transform group-hover:-translate-y-0.5 drop-shadow-md">
                        {city.name}
                      </h3>
                      
                      {/* Slide up from bottom on hover (Clean text without overlay pill) */}
                      <div className="max-h-0 opacity-0 overflow-hidden transform translate-y-2 group-hover:max-h-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                        <p className="text-xs text-slate-200 mt-1 font-medium drop-shadow-md whitespace-nowrap">
                          <span className="text-[#00c48c] font-bold">{totalBisnis}</span> bisnis terdaftar
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <p>Belum ada data smart city.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── WAVE DIVIDER: Foto Sawah dengan tepi bergelombang beranimasi ── */}
      <section className="sawah-wave-divider" aria-hidden="false">
        <div className="sawah-wave-divider__img" />
        <div className="sawah-wave-divider__dim" />

        <div className="sawah-wave-edge sawah-wave-edge--top">
          <svg className="sawah-wave-edge__loop" viewBox="0 0 2400 200" preserveAspectRatio="none">
            <path d="M0,90 C150,150 300,30 600,90 C900,150 1050,30 1200,90 C1350,150 1500,30 1800,90 C2100,150 2250,30 2400,90 L2400,0 L0,0 Z" />
          </svg>
        </div>

        <div className="sawah-wave-edge sawah-wave-edge--bottom">
          <svg className="sawah-wave-edge__loop" viewBox="0 0 2400 200" preserveAspectRatio="none">
            <path d="M0,90 C150,150 300,30 600,90 C900,150 1050,30 1200,90 C1350,150 1500,30 1800,90 C2100,150 2250,30 2400,90 L2400,0 L0,0 Z" />
          </svg>
        </div>

        <div
          ref={sawahTextRef}
          className={`sawah-wave-divider__text repeat-reveal repeat-reveal--up ${sawahTextRevealed ? "is-revealed" : ""}`}
        >
          <span className="sawah-wave-divider__eyebrow">Jelajahi Surade</span>
          <h2 className="sawah-wave-divider__heading">
            Temukan apa yang Anda cari<br className="sawah-wave-divider__br" /> di sekitar <span className="sawah-wave-divider__accent">Surade</span>, di sini.
          </h2>
          <span className="sawah-wave-divider__underline" aria-hidden="true" />
        </div>
      </section>

      {/* ── CEPAT PENCARIAN SECTION ── */}
      <section className="quick-section reveal-on-scroll">
        <div className="quick-inner">
          <div
            ref={quickTextRef}
            className={`quick-text repeat-reveal repeat-reveal--left ${quickTextRevealed ? "is-revealed" : ""}`}
          >
            <span className="quick-eyebrow">CARA KERJA</span>
            <h2 className="quick-title">
              <TypewriterText text="Cepat dan Memudahkan Pencarian" as="span" repeat />
            </h2>
            <p className="quick-subtitle">Mudah Menemukan Pelaku Usaha Skala Terkecil</p>
            <div className="quick-steps">
              {QUICK_STEPS.map((step) => (
                <div key={step.num} className="quick-step">
                  <div className="quick-step__num">{step.num}</div>
                  <div>
                    <p className="quick-step__title">{step.title}</p>
                    <p className="quick-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            ref={quickImgRef}
            className={`quick-img-wrap repeat-reveal repeat-reveal--right ${quickImgRevealed ? "is-revealed" : ""}`}
          >
            <div className="quick-img-frame">
              <video
                className="quick-img"
                src="/videos/surade-aerial.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="quick-img-glow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TEMUKAN TEMPAT BARU SECTION ── */}
      <section
        className="temukan-section reveal-on-scroll"
        id="temukan-section"
      >
        <div className="temukan-inner">
          <div className="text-center reveal-on-scroll">
            <h2 className="temukan-title">Usaha Populer di Surade</h2>
            <p className="temukan-subtitle">
              Temukan Dihalaman Kami Untuk Dapat Membantu Dalam Menemukan Pelaku Usaha Hingga Skala Terkecil
            </p>
          </div>

          {loadingData ? (
            <BusinessGridSkeleton count={6} />
          ) : (
            <>
              {/* Carousel Slider Wrapper */}
              <div 
                className="temukan-slider-wrapper"
                onMouseEnter={() => setIsBizHovered(true)}
                onMouseLeave={() => setIsBizHovered(false)}
                onTouchStart={() => setIsBizHovered(true)}
                onTouchEnd={() => { setTimeout(() => setIsBizHovered(false), 2500); }}
              >
                <div className={`temukan-grid ${
                  slideAnim.phase === "active"
                    ? "temukan-grid--active"
                    : slideAnim.phase === "exiting"
                    ? `temukan-grid--exiting-${slideAnim.direction}`
                    : `temukan-grid--entering-${slideAnim.direction}`
                }`}>
                  {paginatedBusinesses.map((bisnis) => (
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
                            e.currentTarget.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=350&fit=crop&q=80";
                          }}
                        />
                        {bisnis.is_premium && (
                          <div className="biz-card__verified-badge biz-card__verified-badge--premium" title="Bisnis Terverifikasi - Mitra Resmi">
                            <BadgeCheck size={14} className="biz-card__verified-icon" />
                            <span>Terverifikasi</span>
                          </div>
                        )}
                        <div className="biz-card__img-overlay">
                          <button
                            type="button"
                            className={`biz-card__save${savedBiz[bisnis.id] ? " saved" : ""}`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(bisnis.id, false, bisnis.name); }}
                            aria-label="Simpan"
                          >
                            <Bookmark size={13} fill={savedBiz[bisnis.id] ? "currentColor" : "none"} />
                            <span>{savedBiz[bisnis.id] ? "Tersimpan" : "Simpan"}</span>
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
                            <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor }} />
                            {bisnis.category}
                          </p>
                          {bisnis.subCategory && (
                            <p className={`biz-card__category biz-card__category--sub flex items-center gap-1 font-semibold ${bisnis.is_premium ? "text-[#007570] bg-[#f0faf8] px-2 py-0.5 rounded-md border border-[#ccebe8]" : "text-slate-600"}`}>
                              <span className="shrink-0 flex items-center">{getSubcategoryIcon(bisnis.subCategory)}</span>
                              <span>{bisnis.subCategory}</span>
                            </p>
                          )}
                        </div>
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
              </div>

              {/* ── Responsive Business Pagination Controls (Max 6 per page) ── */}
              {totalBusinessPages > 1 && (
                <div className="category-pagination temukan-pagination-wrap reveal-on-scroll">
                  <div className="category-pagination__info">
                    Menampilkan <strong>{businessStartIndex + 1}</strong>–<strong>{Math.min(businessStartIndex + BUSINESSES_PER_PAGE, totalBusinesses)}</strong> dari <strong>{totalBusinesses}</strong> bisnis
                  </div>

                  <div className="category-pagination__controls">
                    {/* Prev Button */}
                    <button
                      type="button"
                      className="category-pagination__nav-btn"
                      onClick={() => handleBusinessPageChange(safeBusinessCurrentPage - 1)}
                      disabled={safeBusinessCurrentPage === 1}
                      aria-label="Halaman Sebelumnya"
                    >
                      <ChevronLeft size={16} />
                      <span className="category-pagination__nav-label">Sebelumnya</span>
                    </button>

                    {/* Numbered Pages */}
                    <div className="category-pagination__pages">
                      {businessPageNumbers.map((page, idx) =>
                        page === "..." ? (
                          <span key={`biz-dots-${idx}`} className="category-pagination__dots">
                            …
                          </span>
                        ) : (
                          <button
                            key={`biz-page-${page}`}
                            type="button"
                            className={`category-pagination__page-btn ${safeBusinessCurrentPage === page ? "active" : ""}`}
                            onClick={() => handleBusinessPageChange(page)}
                            aria-label={`Ke halaman ${page}`}
                            aria-current={safeBusinessCurrentPage === page ? "page" : undefined}
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
                      onClick={() => handleBusinessPageChange(safeBusinessCurrentPage + 1)}
                      disabled={safeBusinessCurrentPage === totalBusinessPages}
                      aria-label="Halaman Selanjutnya"
                    >
                      <span className="category-pagination__nav-label">Selanjutnya</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Lihat Semua Bisnis Button */}
              <div className="temukan-more-wrap reveal-on-scroll">
                <Link to="/category/all" className="temukan-more-btn">
                  <span>Lihat Semua Bisnis</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section className="testi-section reveal-on-scroll">
        <div className="testi-inner">
          <div className="testi-header reveal-on-scroll">
            <h2 className="testi-title">Apa Yang Mereka Katakan</h2>
            <p className="testi-subtitle">
              Pengalaman dan cerita nyata dari mereka yang telah tumbuh dan berkembang bersama Surade.co.id
            </p>
          </div>

          {testimonialsData.length > 0 ? (
            <div className="flex justify-center gap-6 mt-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn
                testimonials={testimonialsData.filter((_, i) => i % 3 === 0)}
                duration={15}
              />
              <TestimonialsColumn
                testimonials={testimonialsData.filter((_, i) => i % 3 === 1)}
                duration={19}
                className="hidden md:block"
              />
              <TestimonialsColumn
                testimonials={testimonialsData.filter((_, i) => i % 3 === 2)}
                duration={17}
                className="hidden lg:block"
              />
            </div>
          ) : (
            <div className="testi-empty">
              <p>Belum ada testimoni. Jadilah yang pertama memberikan testimoni!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── KEY FEATURES SECTION ── */}
      <section className="features-section reveal-on-scroll">
        <div className="features-inner">
          <div className="features-grid reveal-stagger">
            {FEATURES_DATA.map((feat) => (
              <div key={feat.id} className="feat-card reveal-card">
                <div className="feat-card__icon-wrap">
                  {feat.icon}
                </div>
                <h3 className="feat-card__title">{feat.title}</h3>
                <p className="feat-card__text">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BERBAGAI ACARA DAN BERITA SECTION ── */}
      <section className="blog-section reveal-on-scroll" id="blog-section">
        <div className="blog-inner">
          <div className="text-center reveal-on-scroll">
            <h2 className="blog-title">Berbagai Acara Dan Berita</h2>
            <p className="blog-subtitle">Bagikan kegiatan dan berita Anda di surade.co.id</p>
          </div>

          <div className="blog-grid reveal-stagger">
            {homeBlogs.length > 0 ? (
              homeBlogs.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="blog-card blog-card--link reveal-card">
                  <div className="blog-card__img-wrap" style={{ position: "relative" }}>
                    <img src={post.img || getStorageUrl(post.thumbnail)} alt={post.title} className="blog-card__img" loading="lazy" />
                    <button
                      type="button"
                      className={`biz-card__save${savedBlogs[post.id] ? " saved" : ""}`}
                      style={{ position: "absolute", top: "10px", right: "10px", zIndex: 5 }}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(post.id, true, post.title); }}
                      aria-label="Simpan Blog/Event"
                    >
                      <Bookmark size={13} fill={savedBlogs[post.id] ? "currentColor" : "none"} />
                      <span>Simpan</span>
                    </button>
                    {post.type === "event" ? (
                      <>
                        <span className="blog-badge-tag blog-badge-tag--event">Event</span>
                        {post.eventDateBadge && (
                          <span
                            className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[11px] font-extrabold shadow-md flex items-center gap-1.5 z-10"
                            title="Tanggal Pelaksanaan Event"
                          >
                            <Calendar size={12} className="text-amber-400" />
                            <span>{post.eventDateBadge}</span>
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="blog-badge-tag blog-badge-tag--blog">Blog</span>
                    )}
                  </div>
                  <div className="blog-card__body">
                    <h3 className="blog-card__title">{post.title}</h3>
                    <div className="blog-card__footer">
                      <span className="blog-card__meta">
                        <User size={13} />
                        <span>{post.author}</span>
                      </span>
                      <span className="blog-card__meta">
                        <Calendar size={13} className={post.type === "event" ? "text-amber-500" : ""} />
                        <span>{post.date}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="blog-empty">
                <p>Belum ada artikel blog.</p>
              </div>
            )}
          </div>

          {/* ── Bottom See All Button ── */}
          <div className="blog-bottom-action reveal-on-scroll">
            <Link to="/blog" className="blog-see-all-cta">
              <span>Lihat Semua Blog & Event</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}