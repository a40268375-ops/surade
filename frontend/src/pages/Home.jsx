import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/home/HeroSection";
import PremiumAdsSection from "../components/home/PremiumAdsSection";
import StandardAdsSection from "../components/home/StandardAdsSection";
import BlogEventsSection from "../components/home/BlogEventsSection";
import InfiniteScroller from "../components/home/InfiniteScroller";
import useScrollReveal from "../hooks/useScrollReveal";
import logoImg from "../assets/logo-surade.png";
import umkmMarketImg from "../assets/umkm-market.jpg";
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
import GooglePagination from "../components/GooglePagination";
import { getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
import { getBusinessOpenStatus, getScheduleForDay, getTodayName } from "../utils/businessHours";
import useRepeatReveal from "../hooks/useRepeatReveal";
import api from "../services/api";
import {
  Sparkles,
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
  ArrowUpRight,
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

/* ── Price tier label helper ── */
const getPriceTierLabel = (price) => {
  if (!price || price <= 0) return null;
  if (price <= 20000) return { label: "Murah", color: "#059669", bg: "#d1fae5" };
  if (price <= 75000) return { label: "Terjangkau", color: "#0891b2", bg: "#cffafe" };
  if (price <= 300000) return { label: "Sedang", color: "#d97706", bg: "#fef3c7" };
  if (price <= 1000000) return { label: "Premium", color: "#7c3aed", bg: "#ede9fe" };
  return { label: "Eksklusif", color: "#b91c1c", bg: "#fee2e2" };
};

/* ── Categories loaded dynamically from API ── */

/* ── How it works steps ── */
const QUICK_STEPS = [
  { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
  { num: "2", title: "Tambahkan UMKM", desc: "Hingga skala terkecil UMKM." },
  { num: "3", title: "Temukan UMKM Secara Kategori", desc: "Hubungi pelaku usaha." },
];

/* ── Key Features data ── */
const FEATURES_DATA = [
  {
    id: 1,
    badge: "01",
    title: "Pencarian Akurat",
    text: "Memudahkan pencarian pelaku usaha dan UMKM dengan pencarian yang akurat",
    icon: <MapPin size={26} strokeWidth={2.2} />,
  },
  {
    id: 2,
    badge: "02",
    title: "Hanya Satu Kali Klik",
    text: "Hanya dengan satu kali klik 'One Click Service' langsung terhubung dengan Whatsapp pelaku usaha",
    icon: <Pointer size={26} strokeWidth={2.2} />,
  },
  {
    id: 3,
    badge: "03",
    title: "Cepat dan Mudah",
    text: "Mudah didaftarkan hanya melalui whatsapp, cepat dalam penayangan iklan usaha",
    icon: <Rocket size={26} strokeWidth={2.2} />,
  },
  {
    id: 4,
    badge: "04",
    title: "Kontak Langsung",
    text: "Anda dapat menghubungi dan mendatangi pelaku usaha secara langsung tanpa perantara",
    icon: <BookOpen size={26} strokeWidth={2.2} />,
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
    id: 1,
    avatar: diniImg,
    name: "Dini Hawariw",
    role: "Ibu Rumah Tangga",
    text: "Sebagai ibu rumah tangga, saya terbantu banget waktu cari baby sitter dan les privat matematika buat anak. Di Surade.com infonya lengkap, jelas, dan bisa langsung chat WhatsApp orangnya.",
  },
  {
    id: 2,
    avatar: farhanImg,
    name: "Farhan M",
    role: "Pemilik UMKM",
    text: "Sebagai pemilik UMKM, saya merasa terbantu karena usaha saya bisa lebih mudah ditemukan oleh orang yang sedang mencari produk atau layanan kuliner di daerah sekitar.",
  },
  {
    id: 3,
    avatar: sriImg,
    name: "Sri Budiati",
    role: "Ibu Rumah Tangga",
    text: "Waktu pindahan rumah kemarin, saya lagi butuh jasa angkut barang dan mobil pick up di Surade. Lewat Surade.com langsung dapat kontak jasa angkut terdekat, orangnya ramah dan tarifnya jujur.",
  },
  {
    id: 4,
    avatar: yogaImg,
    name: "Yoga Hepta G",
    role: "Pekerja Kantoran",
    text: "AC kantor saya pernah tiba-tiba rusak saat jam kerja. Saya coba cari teknisi AC panggilan di Surade.com dan jadi lebih mudah menemukan jasa yang bisa datang langsung ke kantor.",
  },
  {
    id: 5,
    avatar: rajaImg,
    name: "M. Raja Fakhri",
    role: "Karyawan Perusahaan",
    text: "Ban motor saya pecah saat berangkat kerja, saya langsung cari bengkel dan tambal ban panggilan di Surade.com. Ternyata sangat mudah menemukan layanan yang siap datang ke lokasi.",
  },
  {
    id: 6,
    avatar: naufalImg,
    name: "Naufal Handoko",
    role: "Pelaku Usaha Jasa",
    text: "Alhamdulillah setelah mendaftarkan jasa servis elektronik dan pompa air di Surade.com, orderan panggilan dari warga sekitar makin ramai. Komunikasi via WhatsApp bikin pelanggan lebih percaya.",
  },
  {
    id: 7,
    avatar: husnulImg,
    name: "Husnul Hotimah",
    role: "Ibu Rumah Tangga",
    text: "Lagi butuh catering dadakan dan aneka kue basah untuk acara syukuran arisan keluarga, cari UMKM di Surade.com langsung ketemu yang pas, makanannya enak dan diantar tepat waktu.",
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

const getCategoryTheme = () => {
  // Unified, elegant Surade Green / Emerald palette (no rainbow colors)
  return {
    bg: "rgba(0, 117, 112, 0.07)",
    color: "#007570",
    border: "rgba(0, 117, 112, 0.15)",
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

  // Bersihkan cache bisnis lama agar urutan 100% konsisten langsung dari backend tanpa flicker
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("cached_home_businesses");
      sessionStorage.removeItem("cached_home_ads_obj");
      sessionStorage.removeItem("cached_home_blogs");
    } catch (e) { }
  }

  const cachedBisnis = [];
  const cachedAds = getInitialCache("cached_home_ads_obj", null);
  const cachedBlogs = getInitialCache("cached_home_blogs", []);
  const cachedCitiesRaw = getInitialCache("cached_smart_cities", []);
  const cachedCities = cachedCitiesRaw.length > 0 ? cachedCitiesRaw : SMART_CITIES;
  const cachedRawCats = getInitialCache("cached_public_categories_raw_v3", []);

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
  const [selectedVillageId, setSelectedVillageId] = useState(null);
  const [flashingVillageId, setFlashingVillageId] = useState(null);

  const handleVillageCardClick = (e, city) => {
    e.preventDefault();
    setSelectedVillageId(city.id);
    setFlashingVillageId(city.id);
    const targetUrl = `/smart-city/${city.slug || city.id}`;
    setTimeout(() => {
      navigate(targetUrl);
    }, 200);
  };
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.removeItem("cached_public_categories_raw");
    } catch (_) {}

    const fetchData = async () => {
      // 1. Try Ultra-Fast Single /home-summary Endpoint
      try {
        const summaryRes = await fetch(`${import.meta.env.VITE_API_URL}/home-summary`);
        if (summaryRes.ok) {
          const summary = await summaryRes.json();

          // Categories
          if (Array.isArray(summary.categories) && summary.categories.length > 0) {
            try {
              sessionStorage.setItem("cached_public_categories_raw_v3", JSON.stringify(summary.categories));
            } catch (e) { }
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
            } catch (e) { }
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
            } catch (e) { }
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

              return {
                id: b.id,
                name: b.name,
                category: categoryName,
                subCategory: subCategoryName,
                categoryColor: b.category?.icon === "store" ? "#007570" : b.category?.icon === "coffee" ? "#0ea5e9" : "#f59e0b",
                tags: (() => {
                  let raw = b.tags;
                  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = raw.split(",").map(t => t.trim()).filter(Boolean); } }
                  if (Array.isArray(raw) && raw.length > 0) {
                    const cityLower = (b.city || "").toLowerCase();
                    const filtered = raw.map(t => typeof t === "object" ? (t?.name || String(t)) : String(t))
                      .filter(t => t && t.toLowerCase() !== cityLower && !t.toLowerCase().startsWith("desa/") && !t.toLowerCase().startsWith("kelurahan"));
                    return filtered;
                  }
                  return [];
                })(),
                location: b.city ? (b.province ? `${b.city}, ${b.province}` : b.city) : (b.address || "Indonesia"),
                address: b.address || b.city || "Indonesia",
                city: b.city || "Indonesia",
                province: b.province || "",
                views: b.views || 0,
                rating: b.rating || "0.0",
                rating_count: b.rating_count || 0,
                status: openStatus.label,
                img: getStorageUrl(b.banner || b.logo) || "/images/businesses/pasar.jpg",
                open: openStatus.open,
                opening_hours: hoursText,
                featured: b.featured,
                description: b.description,
                avg_price: b.products_avg_price ? Number(b.products_avg_price) : 0,
                min_price: b.products_min_price ? Number(b.products_min_price) : 0,
                max_price: b.products_max_price ? Number(b.products_max_price) : 0,
                products_count: Number(b.products_count || 0),
                is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
                is_verified: Boolean(b.is_verified),
              };
            });
            // Urutkan: Usaha Premium TERBARU paling depan, usaha FREE di belakang
            const sortedBiz = [...mappedBiz].sort((a, b) => {
              const aPrem = Boolean(a.is_premium || a.featured) ? 1 : 0;
              const bPrem = Boolean(b.is_premium || b.featured) ? 1 : 0;
              if (aPrem !== bPrem) return bPrem - aPrem;
              return Number(b.id || 0) - Number(a.id || 0);
            });
            setBisnisData(sortedBiz);
            setTemukanData(sortedBiz);
          }

          // Advertisements
          if (Array.isArray(summary.advertisements) && summary.advertisements.length > 0) {
            const mappedAds = summary.advertisements.map(ad => ({
              id: ad.id,
              business_id: ad.business_id || ad.businessId,
              businessId: ad.business_id || ad.businessId,
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

            const premium = mappedAds.filter(a => a.package_type === "premium" || a.package_type === "hero");
            const standard = mappedAds.filter(a => a.package_type === "standard" || a.package_type === "ticker");

            // Jika tidak ada iklan sama sekali, set array kosong untuk trigger placeholder
            // Jangan fallback ke ads jenis lain karena akan membingungkan
            setPremiumAds(premium);
            setStandardAds(standard);
            setAdsData(mappedAds);
            setLoadingAds(false);

            try {
              sessionStorage.setItem("cached_home_ads_obj", JSON.stringify({
                premium: premium,
                standard: standard,
                all: mappedAds,
              }));
            } catch (e) { }
          } else {
            // Jika backend tidak mengirim data advertisements sama sekali atau array kosong
            console.log('⚠️ No advertisements data from backend - showing placeholders');
            setPremiumAds([]);
            setStandardAds([]);
            setAdsData([]);
            setLoadingAds(false);

            // Clear cache untuk memastikan tidak ada dummy data tertinggal
            try {
              sessionStorage.removeItem("cached_home_ads_obj");
            } catch (e) { }
          }

          // Blogs & Events
          if (Array.isArray(summary.blogs)) {
            const mappedBlogs = summary.blogs.map(b => {
              const isEvent = b.type === "event";
              const startDate = b.event_date ? new Date(b.event_date) : (b.published_at ? new Date(b.published_at) : null);
              const endDate = b.event_end_date ? new Date(b.event_end_date) : null;

              let formattedDate = "Terbaru";
              if (isEvent && startDate && !isNaN(startDate.getTime())) {
                const sStr = startDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                if (endDate && !isNaN(endDate.getTime()) && endDate.getTime() !== startDate.getTime()) {
                  const eStr = endDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                  formattedDate = `${sStr} – ${eStr}`;
                } else {
                  formattedDate = sStr;
                }
              } else if (b.published_at) {
                const pDate = new Date(b.published_at);
                if (!isNaN(pDate.getTime())) {
                  formattedDate = pDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                }
              }

              let rawExcerpt = b.excerpt || (b.content ? b.content.replace(/<[^>]+>/g, '') : "");
              if (rawExcerpt.length > 120) {
                rawExcerpt = rawExcerpt.substring(0, 120).trim() + "...";
              }

              return {
                ...b,
                id: b.id,
                slug: b.slug,
                title: b.title,
                category: b.blog_category || b.category?.name || (isEvent ? "Event" : "Berita & Artikel"),
                blog_category: b.blog_category || b.category,
                excerpt: rawExcerpt || "Platform direktori lokal Surade.com menjadi jembatan bagi ratusan pelaku usaha mikro untuk memperluas jangkauan pasar, promosi...",
                event_location: b.event_location || null,
                author: b.user?.name || b.author || "Admin Surade",
                user: b.user,
                date: formattedDate,
                event_date: b.event_date,
                published_at: b.published_at,
                created_at: b.created_at,
                raw_event_date: b.event_date,
                raw_published_at: b.published_at,
                thumbnail: b.thumbnail,
                img: getStorageUrl(b.thumbnail) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
                type: b.type || "blog",
              };
            });

            // Urutkan identik dengan halaman dalam /blog:
            // 1. Event aktif yang mendekati hari-H (event_date ASC: 8 Nov -> 20 Nov -> 5 Des)
            // 2. Info baru di paling depan, info lama ke bawah (published_at DESC)
            // 3. Event yang sudah lewat tanggalnya ditaruh di paling bawah (event_date DESC)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const sortedBlogs = [...mappedBlogs].sort((a, b) => {
              const aIsEvent = a.type === "event";
              const bIsEvent = b.type === "event";

              const aEvtDate = a.raw_event_date || a.event_date ? new Date(a.raw_event_date || a.event_date) : null;
              const bEvtDate = b.raw_event_date || b.event_date ? new Date(b.raw_event_date || b.event_date) : null;

              const aIsActiveEvent = aIsEvent && aEvtDate && aEvtDate >= today;
              const bIsActiveEvent = bIsEvent && bEvtDate && bEvtDate >= today;

              const aIsPastEvent = aIsEvent && aEvtDate && aEvtDate < today;
              const bIsPastEvent = bIsEvent && bEvtDate && bEvtDate < today;

              const getTier = (isAct, isPst) => {
                if (isAct) return 1;
                if (!isPst) return 2; // info/blog
                return 3; // event lewat
              };

              const aTier = getTier(aIsActiveEvent, aIsPastEvent);
              const bTier = getTier(bIsActiveEvent, bIsPastEvent);

              if (aTier !== bTier) {
                return aTier - bTier;
              }

              if (aTier === 1) {
                // Event aktif: mendekati hari-H di paling atas (ASC)
                return (aEvtDate?.getTime() || 0) - (bEvtDate?.getTime() || 0);
              }

              if (aTier === 2) {
                // Info/blog: terbaru di atas (DESC)
                const aTime = new Date(a.published_at || a.created_at || a.raw_published_at || 0).getTime();
                const bTime = new Date(b.published_at || b.created_at || b.raw_published_at || 0).getTime();
                return bTime - aTime;
              }

              // Event lewat: di paling bawah (DESC)
              return (bEvtDate?.getTime() || 0) - (aEvtDate?.getTime() || 0);
            });

            setBlogsData(sortedBlogs);
            try {
              sessionStorage.setItem("cached_home_blogs", JSON.stringify(sortedBlogs));
            } catch (e) { }
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
                category: b.category?.parent ? b.category.parent.name : (b.category?.name || "Umum"),
                subCategory: b.category?.parent ? b.category.name : null,
                categoryColor: "#007570",
                tags: Array.isArray(b.tags) ? b.tags : [b.name],
                location: b.city || "Indonesia",
                address: b.address || "Indonesia",
                city: b.city || "Indonesia",
                province: b.province || "",
                views: b.views || 0,
                status: openStatus.label,
                img: getStorageUrl(b.banner || b.logo) || "/images/businesses/pasar.jpg",
                open: openStatus.open,
                featured: b.featured,
                description: b.description,
                is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
              };
            });
            const sorted = [...mapped].sort((a, b) => {
              const aPrem = Boolean(a.is_premium || a.featured) ? 1 : 0;
              const bPrem = Boolean(b.is_premium || b.featured) ? 1 : 0;
              if (aPrem !== bPrem) return bPrem - aPrem;
              return Number(b.id || 0) - Number(a.id || 0);
            });
            setBisnisData(sorted);
            setTemukanData(sorted);
          }
        }).catch(err => console.error(err));

      await Promise.allSettled([fetchCategories, fetchBusinesses]);
      setLoadingData(false);
      setLoadingAds(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.title = "Surade.com - Direktori Usaha Perorangan dan UMKM di Surade";
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    setSearchHistory(history);
    window.scrollTo(0, 0);
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
  });

  // Filter TEMUKAN_DATA based on search (keeps exact server array order, 100% fixed & immutable)
  const filteredTemukanData = useMemo(() => {
    return temukanData.filter((b) => {
      const matchesSearch = !searchKeyword ||
        b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        b.location.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesSearch;
    });
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
    } catch (e) { }

    if (token) {
      try {
        const [resBiz, resBlog] = await Promise.allSettled([
          api.get("/my-favorites"),
          api.get("/my-blog-favorites")
        ]);

        if (resBiz.status === "fulfilled" && resBiz.value.data) {
          const bizData = resBiz.value.data?.data || resBiz.value.data || [];
          const bizArr = Array.isArray(bizData) ? bizData : (bizData?.data || []);
          bizArr.forEach(fav => {
            const bId = fav.business_id || fav.business?.id || fav.id;
            if (bId) bizSavedMap[bId] = true;
          });
        }

        if (resBlog.status === "fulfilled" && resBlog.value.data) {
          const blogData = resBlog.value.data?.data || resBlog.value.data || [];
          const blogArr = Array.isArray(blogData) ? blogData : (blogData?.data || []);
          blogArr.forEach(fav => {
            const bId = fav.blog_id || fav.blog?.id || fav.id;
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
  const [businessCurrentPage, setBusinessCurrentPage] = useState(() => {
    try {
      const savedPage = sessionStorage.getItem("home_business_page");
      return savedPage ? Number(savedPage) : 1;
    } catch (e) {
      return 1;
    }
  });

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

  // Auto-slide completely disabled - section remains 100% static until user clicks pagination
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    try {
      sessionStorage.setItem("home_business_page", String(newPage));
    } catch (e) { }
    transitionToPage(newPage, direction);
  };

  // ── Subtle Scroll Reveal Animation Hook ──
  useScrollReveal([categories, smartCitiesData, filteredTemukanData, testimonialsData, blogsData]);

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

      {/* ── 3. KATEGORI SECTION (2-Row Auto-Scrolling Marquee matching Gambar 2) ── */}
      {/* ── 3. KATEGORI SECTION (Dual-Direction Opposing Marquee) ── */}
      <section className="category-section reveal-on-scroll">
        <div className="category-inner">
          {(() => {
            const rawCats = categories.filter((cat) => cat.id !== "all");
            const items = [...rawCats];
            // Split items into 2 rows for balanced opposing movements
            const row1 = items.filter((_, idx) => idx % 2 === 0);
            const row2 = items.filter((_, idx) => idx % 2 !== 0);

            // Card renderer
            const renderCard = (cat, key) => {
              const theme = getCategoryTheme();
              return (
                <Link
                  key={key}
                  to={`/category/${cat.id}`}
                  className="home-cat-card-modern group"
                  aria-label={cat.label}
                >
                  <div
                    className="home-cat-card-modern__icon-box"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.color,
                      borderColor: theme.border,
                    }}
                  >
                    <span className="home-cat-card-modern__icon">
                      {cat.icon}
                    </span>
                  </div>
                  <span className="home-cat-card-modern__label">{cat.label}</span>
                </Link>
              );
            };

            return (
              <div className="home-cat-dual-marquee">
                {/* ── Row 1: Moving Right-to-Left (Kanan ke Kiri) & Bisa Digeser Bebas Tanpa Batas ── */}
                <InfiniteScroller
                  direction="left"
                  speed={1.0}
                  gap={18}
                  className="home-cat-row-wrapper"
                >
                  {row1.map((cat, idx) => renderCard(cat, `r1-${cat.id}-${idx}`))}
                </InfiniteScroller>

                {/* ── Row 2: Moving Left-to-Right (Kiri ke Kanan) & Bisa Digeser Bebas Tanpa Batas ── */}
                <InfiniteScroller
                  direction="right"
                  speed={1.0}
                  gap={18}
                  className="home-cat-row-wrapper"
                >
                  {row2.map((cat, idx) => renderCard(cat, `r2-${cat.id}-${idx}`))}
                </InfiniteScroller>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── SMART CITY SECTION (CLEAN 3D DESIGN) ── */}
      <section className="py-16 bg-[#f8fafc] text-slate-800 border-t border-slate-200/80 reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 reveal-on-scroll">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-2.5">
              Smart Village
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-normal leading-relaxed">
              Surade.com Mendorong Percepatan Program Pemerintah Smart Village
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 reveal-stagger">
            {smartCitiesData.length > 0 ? (
              smartCitiesData.map((city) => {
                const displayName = /^(Kota|Kabupaten|Kab\.|DKI|Provinsi|Desa|Kelurahan)/i.test(city.name?.trim() || "")
                  ? city.name?.trim()
                  : `Desa ${city.name?.trim() || ""}`;
                const totalBisnis = Number(city.bisnis || 0);
                const isSelected = selectedVillageId === city.id;

                return (
                  <Link
                    key={city.id}
                    to={`/smart-city/${city.slug || city.id}`}
                    onClick={(e) => handleVillageCardClick(e, city)}
                    className={`group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/50 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] reveal-card ${
                      flashingVillageId === city.id ? "is-flashing" : ""
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Landscape Village Image */}
                    <img
                      src={getVillageImage(city)}
                      alt={displayName}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Clean Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-300" />

                    {/* Kilatan Cahaya (Light Flash) on Press / Click */}
                    <div className="smart-card-kilatan-overlay" />
                    <div className="smart-card-kilatan-burst" />

                    {/* Centered Content: Title & Business Count Revealed on Press / Hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-center z-10 flex flex-col items-center justify-end">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide transition-all duration-300 transform group-hover:-translate-y-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                        {displayName}
                      </h3>

                      {/* Bisnis terdaftar keluar pas di pencet atau di-hover dengan tampilan 3D bersih tanpa kotak & tanpa tanda > */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                          isSelected
                            ? "max-h-14 opacity-100 translate-y-0 mt-2"
                            : "max-h-0 opacity-0 translate-y-2 group-hover:max-h-14 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2"
                        }`}
                      >
                        <div className="smart-village-3d-text-container">
                          <span className="smart-village-3d-num-text">
                            {totalBisnis > 0 ? totalBisnis : 12}
                          </span>
                          <span className="smart-village-3d-label-text">
                            bisnis terdaftar
                          </span>
                        </div>
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

      {/* ── WAVE DIVIDER: Foto Sawah & Lanskap Surade Premium ── */}
      <section className="sawah-wave-divider" aria-label="Jelajahi Potensi Surade">
        <div className="sawah-wave-divider__img" />
        <div className="sawah-wave-divider__dim" />
        <div className="sawah-wave-divider__glow" />

        {/* Top Smooth Wave Edge */}
        <div className="sawah-wave-edge sawah-wave-edge--top">
          <svg className="sawah-wave-edge__loop" viewBox="0 0 2400 120" preserveAspectRatio="none">
            <path d="M0,40 C300,85 600,10 900,50 C1200,85 1500,20 1800,60 C2100,95 2250,30 2400,50 L2400,0 L0,0 Z" />
          </svg>
        </div>

        {/* Bottom Smooth Wave Edge */}
        <div className="sawah-wave-edge sawah-wave-edge--bottom">
          <svg className="sawah-wave-edge__loop" viewBox="0 0 2400 120" preserveAspectRatio="none">
            <path d="M0,40 C300,85 600,10 900,50 C1200,85 1500,20 1800,60 C2100,95 2250,30 2400,50 L2400,0 L0,0 Z" />
          </svg>
        </div>

        {/* Content Box */}
        <div
          ref={sawahTextRef}
          className={`sawah-wave-divider__text repeat-reveal repeat-reveal--up ${sawahTextRevealed ? "is-revealed" : ""}`}
        >
          <span className="sawah-wave-divider__eyebrow">JELAJAHI SURADE</span>

          <h2 className="sawah-wave-divider__heading">
            Temukan apa yang Anda cari <br className="sawah-wave-divider__br" />
            di sekitar <span className="sawah-wave-divider__accent">Surade</span>, di sini.
          </h2>

          <div className="sawah-wave-divider__underline" />
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
              <img
                className="quick-img"
                src={umkmMarketImg}
                alt="Pasar UMKM Surade – Pelaku Usaha Lokal"
                loading="lazy"
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
                <div className={`temukan-grid ${slideAnim.phase === "active"
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
                      onClick={() => {
                        try {
                          sessionStorage.setItem("home_scroll_pos", String(window.scrollY));
                          sessionStorage.setItem("home_business_page", String(safeBusinessCurrentPage));
                        } catch (e) { }
                      }}
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
                        {/* Tags - only show if real non-location tags exist */}
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
              </div>

              {/* ── Responsive Business Pagination Controls (Google Style Gooooooogle) ── */}
              {totalBusinessPages > 1 && (
                <div className="category-pagination temukan-pagination-wrap reveal-on-scroll">
                  <div className="category-pagination__info">
                    Menampilkan <strong>{businessStartIndex + 1}</strong>–<strong>{Math.min(businessStartIndex + BUSINESSES_PER_PAGE, totalBusinesses)}</strong> dari <strong>{totalBusinesses}</strong> usaha
                  </div>

                  <GooglePagination
                    currentPage={safeBusinessCurrentPage}
                    totalPages={totalBusinessPages}
                    onPageChange={handleBusinessPageChange}
                    prevLabel="Sebelumnya"
                    nextLabel="Berikutnya"
                  />
                </div>
              )}

              {/* Lihat Semua Usaha Button */}
              <div className="temukan-more-wrap reveal-on-scroll">
                <Link to="/category/all" className="temukan-more-btn">
                  <span>Lihat Semua Usaha</span>
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
              Pengalaman dan cerita nyata dari mereka yang telah tumbuh dan berkembang bersama Surade.com
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
                <span className="feat-card__badge">{feat.badge}</span>
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

      {/* ── BERBAGAI ACARA DAN BERITA SECTION (AUTO-SLIDER) ── */}
      <BlogEventsSection
        blogsData={blogsData}
        savedBlogs={savedBlogs}
        toggleSave={toggleSave}
      />

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}