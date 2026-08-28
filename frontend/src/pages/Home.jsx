import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Category.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/home/HeroSection";
import PremiumAdsSection from "../components/home/PremiumAdsSection";
import StandardAdsSection from "../components/home/StandardAdsSection";
import useScrollReveal from "../hooks/useScrollReveal";
import logoImg from "../assets/logo.png";
import { getBusinesses } from "../services/businessService";
import { InlineSpinner } from "../components/LoadingScreen";
import { getStorageUrl } from "../utils/constants";
import { requireAuth } from "../utils/authCheck";
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
} from "lucide-react";

/* ── Categories loaded dynamically from API ── */

/* ── How it works steps ── */
const QUICK_STEPS = [
  { num: "1", title: "Ketik Kata Kunci", desc: "Pemilihan kata kunci akan mempercepat dalam pencarian." },
  { num: "2", title: "Ketik Lokasi", desc: "Anda dapat menemukan lokasi secara mudah dengan mengetik daerah yang Anda cari." },
  { num: "3", title: "Temukan Pencarian", desc: "Penuhi semua keperluan dan kebutuhan Anda." },
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

/* ── Smart Cities data (Loaded dynamically from API) ── */
const SMART_CITIES = [];

/* ── Testimonials data ── */
const TESTIMONIALS_DATA = [
  {
    id: 1,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Nindi Afrilia",
    role: "Marketing Executive",
    text: "Dengan adanya Info.co.id, masyarakat jadi lebih mudah menemukan berbagai informasi dan layanan yang ada di daerah mereka.",
  },
  {
    id: 2,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Putri Indah Lestari",
    role: "Research and Development",
    text: "Info.co.id membantu menyajikan informasi daerah dalam satu platform yang lebih mudah diakses dan dipahami oleh semua kalangan.",
  },
  {
    id: 3,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    name: "Algi Triana",
    role: "UI/UX Designer",
    text: "Platform ini punya potensi besar untuk membuat informasi lokal lebih mudah ditemukan. Tampilannya pun cukup bersih dan nyaman dipakai.",
  },
  {
    id: 4,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    name: "Fajar Septiawan",
    role: "Business Development",
    text: "Info.co.id jadi salah satu platform yang membantu menghubungkan masyarakat dengan berbagai informasi dan potensi bisnis di daerahnya.",
  },
  {
    id: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Risa Permata",
    role: "Digital Development",
    text: "Saya senang ada platform seperti ini. Digitalisasi informasi daerah itu penting banget, terutama untuk mendukung program Smart Village.",
  },
  {
    id: 6,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    name: "Bagas Nugroho",
    role: "Web Developer",
    text: "Dari sisi teknis, Info.co.id sudah cukup solid. Integrasi data bisnis lokal dengan sistem pencariannya terasa responsif dan mudah digunakan.",
  },
  {
    id: 7,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    name: "Laras Diningrum",
    role: "Project Manager",
    text: "Koordinasi antar tim dalam pengembangan platform ini cukup terstruktur. Roadmap-nya jelas dan fokus pada kebutuhan pengguna di daerah.",
  },
  {
    id: 8,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face",
    name: "Dito Firmansyah",
    role: "Product Team",
    text: "Info.co.id membantu UMKM di daerah untuk lebih mudah ditemukan. Ini langkah nyata menuju ekosistem digital yang lebih merata di Indonesia.",
  },
];


const getCategoryIcon = (iconName) => {
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
    default:
      return <Store size={26} strokeWidth={1.7} />;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedKota, setSelectedKota] = useState("Semua");
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedBiz, setSavedBiz] = useState({});
  const [savedBlogs, setSavedBlogs] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> }]);
  const [bisnisData, setBisnisData] = useState([]);
  const [temukanData, setTemukanData] = useState([]);
  const [premiumAds, setPremiumAds] = useState([]);
  const [standardAds, setStandardAds] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [blogsData, setBlogsData] = useState([]);
  const [testimonialsData, setTestimonialsData] = useState(TESTIMONIALS_DATA);
  const [smartCitiesData, setSmartCitiesData] = useState([]);
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Categories with Client Cache
      try {
        sessionStorage.removeItem("cached_public_categories");
      } catch (e) {}

      const cachedCategories = sessionStorage.getItem("cached_public_categories_raw");
      if (cachedCategories) {
        try {
          const rawList = JSON.parse(cachedCategories);
          if (Array.isArray(rawList) && rawList.length > 0) {
            setCategories([
              { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
              ...rawList.map(c => ({
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
            const mappedCategories = [
              { id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> },
              ...list.map(c => ({
                id: c.slug || String(c.id),
                label: c.name,
                icon: getCategoryIcon(c.icon)
              }))
            ];
            setCategories(mappedCategories);
          }
        }).catch(err => console.error("Failed to fetch categories:", err));

      // 2. Smart Cities with Client Cache
      const cachedSmartCities = sessionStorage.getItem("cached_smart_cities");
      if (cachedSmartCities) {
        try {
          setSmartCitiesData(JSON.parse(cachedSmartCities));
        } catch (e) {}
      }

      const fetchSmartCities = fetch(`${import.meta.env.VITE_API_URL}/smart-cities`)
        .then(res => res.json())
        .then(scJson => {
          const scData = scJson?.data || scJson || [];
          if (Array.isArray(scData)) {
            const mappedSc = scData.map(c => ({
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
          }
        }).catch(err => console.error("Failed to fetch smart cities:", err));

      // 3. Featured & Latest Businesses for Home (up to 24 businesses for 4 pages)
      const fetchBusinesses = fetch(`${import.meta.env.VITE_API_URL}/businesses?limit=24`)
        .then(res => res.json())
        .then(bizJson => {
          const bizData = bizJson?.data || bizJson || [];
          if (Array.isArray(bizData)) {
            const mapped = bizData.map(b => {
              const mainCategory = b.category?.parent || b.category;
              const subCategory = b.category?.parent ? b.category : null;
              const categoryName = mainCategory?.name || b.category?.name || "Umum";
              const subCategoryName = subCategory?.name || null;

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
                status: "Buka Sekarang",
                img: getStorageUrl(b.logo || b.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
                open: true,
                featured: b.featured,
                description: b.description,
                is_premium: Boolean(b.is_premium || b.premium_info?.status === "active" || b.user?.role === "premium" || b.user?.is_premium),
              };
            });
            setBisnisData(mapped);
            setTemukanData(mapped);
          }
        }).catch(err => console.error("Failed to fetch businesses:", err));

      const fetchAds = fetch(`${import.meta.env.VITE_API_URL}/advertisements`)
        .then(res => res.json())
        .then(adsJson => {
          const rawList = adsJson?.data || adsJson || [];
          if (Array.isArray(rawList) && rawList.length > 0) {
            const mappedAds = rawList.map(ad => {
              const biz = ad.business || {};
              const pkgType = ad.package_type || (ad.price >= 250000 || (ad.package_name && /premium|utama|slider|unggulan/i.test(ad.package_name)) ? "premium" : "standard");
              const ratingVal = ad.rating || (biz.ratings_avg_rating ? Number(biz.ratings_avg_rating).toFixed(1) : "4.8");
              const ratingCount = ad.rating_count || biz.ratings_count || 0;
              const locationStr = ad.location || (ad.city ? (ad.province ? `${ad.city}, ${ad.province}` : ad.city) : (biz.city ? (biz.province ? `${biz.city}, ${biz.province}` : biz.city) : "Indonesia"));

              return {
                id: ad.id,
                businessId: ad.business_id || biz.id,
                name: ad.name || biz.name || "Bisnis Pilihan",
                package_type: pkgType,
                rating: ratingVal,
                rating_count: ratingCount,
                city: ad.city || biz.city || "Indonesia",
                province: ad.province || biz.province || "",
                location: locationStr,
                image: ad.image || ad.banner || ad.logo || biz.banner || biz.logo,
                banner: ad.banner || biz.banner,
                logo: ad.logo || biz.logo,
              };
            });

            const premium = mappedAds.filter(a => a.package_type === "premium");
            const standard = mappedAds.filter(a => a.package_type === "standard");

            if (premium.length > 0 && standard.length > 0) {
              setPremiumAds(premium);
              setStandardAds(standard);
            } else if (premium.length > 0) {
              setPremiumAds(premium.slice(0, 4));
              setStandardAds(premium.length > 4 ? premium.slice(4) : premium);
            } else {
              setPremiumAds(standard.slice(0, 3));
              setStandardAds(standard);
            }
            setAdsData(mappedAds);
          }
        })
        .catch(err => console.error("Failed to fetch advertisements:", err))
        .finally(() => setLoadingAds(false));

      const fetchBlogs = fetch(`${import.meta.env.VITE_API_URL}/blogs?status=published&all=true`)
        .then(res => res.json())
        .then(blogsJson => {
          const list = Array.isArray(blogsJson) ? blogsJson : (blogsJson?.data || []);
          if (Array.isArray(list)) {
            const mappedBlogs = list.map(b => ({
              id: b.id,
              slug: b.slug,
              title: b.title,
              category: b.blog_category || b.category?.name || b.category || (b.type === "event" ? "Event" : "Artikel"),
              author: b.user?.name || "Admin Info.co.id",
              date: b.published_at
                ? new Date(b.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : (b.created_at
                    ? new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "Terbaru"),
              thumbnail: b.thumbnail,
              img: getStorageUrl(b.thumbnail) || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
              type: b.type || "blog",
            }));
            setBlogsData(mappedBlogs);
          }
        }).catch(err => console.error("Failed to fetch blogs:", err));

      // Primary data for hero & business grid
      await Promise.allSettled([fetchCategories, fetchBusinesses, fetchSmartCities]);
      setLoadingData(false);

      // Non-blocking secondary data
      Promise.allSettled([fetchAds, fetchBlogs]);
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

  // Filter TEMUKAN_DATA based on search and sort Premium first
  const filteredTemukanData = temukanData.filter((b) => {
    const matchesSearch = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    if (a.is_premium && !b.is_premium) return -1;
    if (!a.is_premium && b.is_premium) return 1;
    return (b.id || 0) - (a.id || 0);
  });

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
          {/* Category tabs */}
          <div className="reko-tabs" ref={categoryScrollRef}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="reko-tab reko-tab--link"
              >
                <span className="reko-tab__icon">{cat.icon}</span>
                <span className="reko-tab__label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART CITY SECTION ── */}
      <section className="py-16 bg-[#f8fafc] text-slate-800 border-t border-slate-200/80 reveal-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 reveal-on-scroll">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-2.5">
              Smart City &amp; Smart Village
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 font-normal leading-relaxed">
              Info.Co.Id Mendorong Percepatan Program Pemerintah Smart City &amp; Smart Village
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 reveal-stagger">
            {smartCitiesData.length > 0 ? (
              smartCitiesData.map((city) => {
                const displayName = /^(Kota|Kabupaten|Kab\.|DKI|Provinsi)/i.test(city.name?.trim() || "")
                  ? city.name?.trim()
                  : `Kota ${city.name?.trim() || ""}`;
                const totalBisnis = Number(city.bisnis || 0);

                return (
                  <Link
                    key={city.id}
                    to={`/smart-city/${city.slug || city.id}`}
                    className="group relative block aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-slate-900 reveal-card"
                  >
                    <img
                      src={city.img || city.image}
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

      {/* ── CEPAT PENCARIAN SECTION ── */}
      <section className="quick-section reveal-on-scroll">
        <div className="quick-inner">
          <div className="quick-text reveal-from-left">
            <h2 className="quick-title">Cepat dan Memudahkan Pencarian</h2>
            <p className="quick-subtitle">Mudah Menemukan Pelaku Usaha Skala Terkecil</p>
            <div className="quick-steps">
              {QUICK_STEPS.map((step) => (
                <div key={step.num} className="quick-step">
                  <div className="quick-step__num">{step.num}-</div>
                  <div>
                    <p className="quick-step__title">{step.title}</p>
                    <p className="quick-step__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="quick-img-wrap reveal-from-right">
            <img
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=500&fit=crop"
              alt="Ilustrasi pencarian bisnis"
              className="quick-img"
            />
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
            <h2 className="temukan-title">Temukan Tempat Baru</h2>
            <p className="temukan-subtitle">
              Temukan Dihalaman Kami Untuk Dapat Membantu Dalam Menemukan Pelaku Usaha Hingga Skala Terkecil
            </p>
          </div>

          {loadingData ? (
            <InlineSpinner text="Memuat data bisnis..." />
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
                    <Link key={bisnis.id} to={`/business/${bisnis.id}`} className="biz-card biz-card--link">
                      {/* Image */}
                      <div className="biz-card__img-wrap">
                        <img src={bisnis.img} alt={bisnis.name} className="biz-card__img" loading="lazy" />
                        {bisnis.is_premium && (
                          <div className="biz-card__verified-badge" title="Bisnis Terverifikasi - Pengguna Premium">
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
                            <span>Pratinjau</span>
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="biz-card__body">
                        <h3 className="biz-card__name">{bisnis.name}</h3>
                        <div className="biz-card__categories">
                          <p className="biz-card__category">
                            <span className="biz-card__cat-dot" style={{ background: bisnis.categoryColor }} />
                            {bisnis.category}
                          </p>
                          {bisnis.subCategory && (
                            <p className="biz-card__category biz-card__category--sub">
                              <span className="biz-card__cat-separator">›</span>
                              {bisnis.subCategory}
                            </p>
                          )}
                        </div>
                        <div className="biz-card__tags">
                          {bisnis.tags.map((tag) => (
                            <span key={tag} className="biz-card__tag">
                              <Tag size={11} />{tag}
                            </span>
                          ))}
                        </div>
                        <div className="biz-card__footer">
                          <span className="biz-card__location">
                            <MapPin size={12} />{bisnis.location}
                          </span>
                          <span className={`biz-card__cta${bisnis.open ? "" : " closed"}`}>
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
          <h2 className="testi-title reveal-on-scroll">Apa Yang Mereka Katakan</h2>

          <div className="testi-grid reveal-stagger">
            {testimonialsData.length > 0 ? (
              testimonialsData.map((testi) => (
              <div key={testi.id} className="testi-card reveal-card">
                <div className="testi-card__avatar-wrap">
                  <img src={testi.avatar} alt={testi.name} className="testi-card__avatar" loading="lazy" />
                </div>
                <div className="testi-card__content">
                  <h3 className="testi-card__name">{testi.name}</h3>
                  <div className="testi-card__role-container">
                    <div className="testi-card__role-line" />
                    <span className="testi-card__role">{testi.role}</span>
                  </div>
                  <p className="testi-card__text">{testi.text}</p>
                </div>
              </div>
            ))
            ) : (
              <div className="testi-empty">
                <p>Belum ada testimoni. Jadilah yang pertama memberikan testimoni!</p>
              </div>
            )}
          </div>
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

      {/* ── BERBAGI PENGALAMAN SECTION ── */}
      <section className="blog-section reveal-on-scroll" id="blog-section">
        <div className="blog-inner">
          <div className="text-center reveal-on-scroll">
            <h2 className="blog-title">Berbagi Pengalaman Mereka</h2>
            <p className="blog-subtitle">Bagikan Pengalaman Dan Info Anda Di Info.co.id.</p>
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
                      <span className="blog-badge-tag blog-badge-tag--event">Event</span>
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
                        <Calendar size={13} />
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