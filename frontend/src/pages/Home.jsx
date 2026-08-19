import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";
import HeroSection from "../components/home/HeroSection";
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
  const [saved, setSaved] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "Semua", icon: <Store size={26} strokeWidth={1.7} /> }]);
  const [bisnisData, setBisnisData] = useState([]);
  const [temukanData, setTemukanData] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [blogsData, setBlogsData] = useState([]);
  const [testimonialsData, setTestimonialsData] = useState(TESTIMONIALS_DATA);
  const [smartCitiesData, setSmartCitiesData] = useState([]);

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

      // 3. Featured & Latest Businesses with limit=6
      const fetchBusinesses = fetch(`${import.meta.env.VITE_API_URL}/businesses?limit=6`)
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
                tags: [b.name],
                location: b.city || "Indonesia",
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
          const adsData = adsJson?.data || adsJson || [];
          if (Array.isArray(adsData)) {
            const mappedAds = adsData.map(ad => ({
              id: ad.id,
              businessId: ad.business?.id,
              img: getStorageUrl(ad.business?.logo || ad.business?.banner) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop",
              name: ad.business?.name || "Bisnis",
              desc: ad.business?.description || "Portal Bisnis Terpercaya",
              packageName: ad.package_name,
              price: ad.price
            }));
            setAdsData(mappedAds);
          }
        })
        .catch(err => console.error("Failed to fetch advertisements:", err))
        .finally(() => setLoadingAds(false));

      const fetchBlogs = fetch(`${import.meta.env.VITE_API_URL}/blogs?limit=6`)
        .then(res => res.json())
        .then(blogsJson => {
          const blogsData = blogsJson?.data || blogsJson || [];
          if (Array.isArray(blogsData)) {
            setBlogsData(blogsData);
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
    const interval = setInterval(() => {
      if (adsData.length > 0) {
        setCurrentAdIndex((prev) => (prev + 1) % adsData.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [adsData]);

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

  // Combine all filters
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

  // Filter TEMUKAN_DATA based on search
  const filteredTemukanData = temukanData.filter((b) => {
    const matchesSearch = !searchKeyword ||
      b.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      b.tags.some(tag => tag.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      b.location.toLowerCase().includes(searchKeyword.toLowerCase());
    
    return matchesSearch;
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
        const [resBiz, resBlog] = await Promise.all([
          api.get("/my-favorites"),
          api.get("/my-blog-favorites")
        ]);
        const bizData = resBiz.data?.data || resBiz.data || [];
        const bizArr = Array.isArray(bizData) ? bizData : (bizData?.data || []);
        bizArr.forEach(fav => {
          const bId = fav.business_id || fav.business?.id;
          if (bId) bizSavedMap[bId] = true;
        });

        const blogData = resBlog.data?.data || resBlog.data || [];
        const blogArr = Array.isArray(blogData) ? blogData : (blogData?.data || []);
        blogArr.forEach(fav => {
          const bId = fav.blog_id || fav.blog?.id;
          if (bId) blogSavedMap[bId] = true;
        });
      } catch (err) {
        console.error("Failed to fetch favorites in Home:", err);
      }
    }

    setSaved({ ...bizSavedMap, ...blogSavedMap });
  };

  useEffect(() => {
    fetchUserSavedState();
    window.addEventListener("bookmarkChanged", fetchUserSavedState);
    return () => window.removeEventListener("bookmarkChanged", fetchUserSavedState);
  }, []);

  const toggleSave = async (id, isBlog = false, itemName = "") => {
    if (!id) return;
    if (!requireAuth()) return;

    const isCurrentlySaved = !!saved[id];

    setSaved((prev) => ({ ...prev, [id]: !isCurrentlySaved }));

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
      alert(`${isBlog ? "Artikel/Event" : "Bisnis"}${itemName ? ` "${itemName}"` : ""} dihapus dari bookmark.`);
    } else {
      alert(`${isBlog ? "Artikel/Event" : "Bisnis"}${itemName ? ` "${itemName}"` : ""} berhasil disimpan ke bookmark!`);
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

      {/* ── TERBARU / IKLAN SECTION ── */}
      <section className="reko-section">
        <div className="reko-inner min-h-[340px] flex flex-col justify-start">
          <h2 className="reko-title">Iklan Unggulan &amp; Bisnis Pilihan</h2>

          {/* Skeleton Loading State */}
          {loadingAds ? (
            <div className="w-full px-2 sm:px-12 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {[1, 2, 3].map((n) => (
                  <div
                    key={`ad-skeleton-${n}`}
                    className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden animate-pulse flex flex-col h-[260px]"
                  >
                    <div className="w-full h-[180px] bg-slate-200/80 relative">
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-300/80" />
                    </div>
                    <div className="p-4 space-y-2 flex-1 bg-white">
                      <div className="h-4 bg-slate-300/80 rounded-md w-3/4" />
                      <div className="h-3.5 bg-slate-200/80 rounded-md w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : adsData.length > 0 ? (
            /* Active Ads carousel */
            <div className="ads-carousel">
              <button
                className="ads-carousel__nav ads-carousel__nav--prev"
                onClick={() => setCurrentAdIndex((prev) => Math.max(0, prev - 1))}
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div className="ads-carousel__track" style={{ transform: `translateX(-${currentAdIndex * 33.33}%)` }}>
                {[...adsData, ...adsData].map((ad, index) => (
                  <Link key={`${ad.id}-${index}`} to={`/business/${ad.businessId}`} className="ad-card">
                    <div className="ad-card__img-wrap">
                      <img src={ad.img} alt={ad.name} className="ad-card__img" loading="lazy" />
                      <div className="ad-card__img-overlay">
                        <button
                          type="button"
                          className={`ad-card__save${(saved[ad.businessId] || saved[ad.id]) ? " saved" : ""}`}
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            const targetBizId = ad.businessId || ad.id;
                            toggleSave(targetBizId, false, ad.name); 
                          }}
                          aria-label="Simpan"
                        >
                          <Bookmark size={13} fill={(saved[ad.businessId] || saved[ad.id]) ? "currentColor" : "none"} />
                          <span>{(saved[ad.businessId] || saved[ad.id]) ? "Tersimpan" : "Simpan"}</span>
                        </button>
                        <span className="ad-card__views">
                          <Eye size={13} />
                          <span>Pratinjau</span>
                        </span>
                      </div>
                    </div>
                    <div className="ad-card__body">
                      <h3 className="ad-card__name">{ad.name}</h3>
                      <p className="ad-card__category">{ad.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                className="ads-carousel__nav ads-carousel__nav--next"
                onClick={() => setCurrentAdIndex((prev) => Math.min(adsData.length - 3, prev + 1))}
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="ads-empty-state min-h-[220px] flex flex-col items-center justify-center">
              <Megaphone size={48} style={{ opacity: 0.5 }} />
              <p>Belum ada bisnis yang sedang beriklan</p>
            </div>
          )}
        </div>
      </section>

      {/* ── KATEGORI SECTION ── */}
      <section className="category-section">
        <div className="category-inner">
          {/* Category tabs */}
          <div className="reko-tabs">
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

      {/* ── KATEGORI SECTION ── */}
      <section className="smart-section">
        <div className="smart-inner">
          <h2 className="smart-title">Smart City &amp; Smart Village</h2>
          <p className="smart-subtitle">Info.Co.Id Mendorong Percepatan Program Pemerintah Smart City &amp; Smart Village</p>

          <div className="smart-grid">
            {smartCitiesData.length > 0 ? (
              smartCitiesData.map((city) => (
              <Link 
                key={city.id} 
                to={`/location/${city.slug}`}
                className="smart-card-link"
              >
                <div className="smart-card">
                  <img src={city.img} alt={city.name} className="smart-card__img" loading="lazy" />
                  <div className="smart-card__content">
                    <h3 className="smart-card__name">{city.name}</h3>
                    <p className="smart-card__count">{city.bisnis.toLocaleString("id-ID")} bisnis terdaftar</p>
                  </div>
                </div>
              </Link>
            ))
            ) : (
              <div className="smart-empty">
                <p>Belum ada data smart city.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CEPAT PENCARIAN SECTION ── */}
      <section className="quick-section">
        <div className="quick-inner">
          <div className="quick-text">
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
          <div className="quick-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&h=500&fit=crop"
              alt="Ilustrasi pencarian bisnis"
              className="quick-img"
            />
          </div>
        </div>
      </section>

      {/* ── TEMUKAN TEMPAT BARU SECTION ── */}
      <section className="temukan-section">
        <div className="temukan-inner">
          <h2 className="temukan-title">Temukan Tempat Baru</h2>
          <p className="temukan-subtitle">
            Temukan Dihalaman Kami Untuk Dapat Membantu Dalam Menemukan Pelaku Usaha Hingga Skala Terkecil
          </p>

          {loadingData ? (
            <InlineSpinner text="Memuat data bisnis..." />
          ) : (
            <>
              <div className="temukan-grid">
                {filteredTemukanData.slice(0, 6).map((bisnis) => (
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
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(bisnis.id, false, bisnis.name); }}
                          aria-label="Simpan"
                        >
                          <Bookmark size={13} fill={saved[bisnis.id] ? "currentColor" : "none"} />
                          <span>{saved[bisnis.id] ? "Tersimpan" : "Simpan"}</span>
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

              {/* Lihat Semua Bisnis Button */}
              <div className="temukan-more-wrap">
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
      <section className="testi-section">
        <div className="testi-inner">
          <h2 className="testi-title">Apa Yang Mereka Katakan</h2>

          <div className="testi-grid">
            {testimonialsData.length > 0 ? (
              testimonialsData.map((testi) => (
              <div key={testi.id} className="testi-card">
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
      <section className="features-section">
        <div className="features-inner">
          <div className="features-grid">
            {FEATURES_DATA.map((feat) => (
              <div key={feat.id} className="feat-card">
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
      <section className="blog-section">
        <div className="blog-inner">
          <h2 className="blog-title">Berbagi Pengalaman Mereka</h2>
          <p className="blog-subtitle">Bagikan Pengalaman Dan Info Anda Di Info.co.id.</p>

          <div className="blog-grid">
            {blogsData.length > 0 ? (
              blogsData.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="blog-card blog-card--link">
                <div className="blog-card__img-wrap" style={{ position: "relative" }}>
                  <img src={post.img || getStorageUrl(post.thumbnail)} alt={post.title} className="blog-card__img" loading="lazy" />
                  <button
                    type="button"
                    className={`biz-card__save${saved[post.id] ? " saved" : ""}`}
                    style={{ position: "absolute", top: "10px", right: "10px", zIndex: 5 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(post.id, true); }}
                    aria-label="Simpan Blog/Event"
                  >
                    <Bookmark size={13} fill={saved[post.id] ? "currentColor" : "none"} />
                    <span>Simpan</span>
                  </button>
                </div>
                <div className="blog-card__body">
                  <p className="blog-card__category">{post.category}</p>
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
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Info.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                info.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Info.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            {/* Col 2 - Bantuan */}
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@info.co.id">support@info.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2024 Info.co.id. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#">Privasi</a>
              <Link to="/terms">Syarat &amp; Ketentuan</Link>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}