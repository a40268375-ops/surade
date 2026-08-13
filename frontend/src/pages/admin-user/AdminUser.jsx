import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Mail,
  Users,
  Bookmark,
  Star,
  Search,
  Menu,
  LogOut,
  Bell,
  Plus,
  Trash2,
  Edit,
  Eye,
  MapPin,
  TrendingUp,
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Camera,
  Upload,
  ImageIcon,
  Crown,
  Check,
  Shield,
  BarChart,
  Headphones,
  MessageSquare,
  Phone,
  Video,
  Package,
  Share2,
  Megaphone,
  Target,
  CreditCard,
  ShieldCheck,
  Copy,
} from "lucide-react";

import logoImg from "../../assets/logo.png";

import api from "../../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../../utils/constants";


export default function AdminUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [blogEventTab, setBlogEventTab] = useState("blog"); // Sub-tab for blog/event combined view

  // Get user from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  // Username state – initialize from user.username
  const [displayName, setDisplayName] = useState(user?.username || user?.name || "");
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  // Profile photo states
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || DEFAULT_AVATAR);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Banner states – initialize from user data
  const [profileBanner, setProfileBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(user?.banner || DEFAULT_BANNER);
  const [showBannerOptions, setShowBannerOptions] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Profile data states - initialized from user state (from database via API)
  const [profileData, setProfileData] = useState(() => {
    return {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      role: user?.role || "User",
      bio: user?.bio || "",
      avatar: user?.avatar ? getStorageUrl(user.avatar) : DEFAULT_AVATAR,
      banner: user?.banner ? getStorageUrl(user.banner) : DEFAULT_BANNER,
    };
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [profileValidationErrors, setProfileValidationErrors] = useState({});
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);
  const [removeBannerFlag, setRemoveBannerFlag] = useState(false);

  const [businesses, setBusinesses] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_my_businesses");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loadingBusinesses, setLoadingBusinesses] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_my_businesses");
      return cached && JSON.parse(cached).length > 0 ? false : true;
    } catch (e) {
      return true;
    }
  });
  const [selectedBusinessForProducts, setSelectedBusinessForProducts] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", description: "" });
  const [editPriceDisplay, setEditPriceDisplay] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [filterTab, setFilterTab] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [advertisements, setAdvertisements] = useState([]);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(false);
  const [selectedBusinessForAd, setSelectedBusinessForAd] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [adNotes, setAdNotes] = useState('');
  const [submittingAd, setSubmittingAd] = useState(false);
  const [adPackages, setAdPackages] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponInfo, setAppliedCouponInfo] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [editingAd, setEditingAd] = useState(null);
  const [editAdForm, setEditAdForm] = useState({ package_name: 'basic', notes: '' });
  const [updatingAd, setUpdatingAd] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Transfer Bank BCA');
  const [adPaymentProofFile, setAdPaymentProofFile] = useState(null);
  const [adPaymentProofPreview, setAdPaymentProofPreview] = useState(null);
  const [payModalAd, setPayModalAd] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  const getPaymentNumber = (method) => {
    if (!method) return '8830-1234-5678';
    if (method.includes('DANA')) return '0812-3456-7890';
    if (method.includes('GoPay')) return '0812-3456-7890';
    if (method.includes('OVO')) return '0812-3456-7890';
    if (method.includes('Mandiri')) return '137-00-1234567-8';
    if (method.includes('BRI')) return '0012-01-000123-53-0';
    return '8830-1234-5678';
  };

  const getSelectedPackagePrice = () => {
    if (!selectedPackage) return 0;
    const found = adPackages.find(p => p.name === selectedPackage || p.id === selectedPackage);
    if (found && found.price) return Number(found.price);
    if (selectedPackage.toLowerCase().includes('basic')) return 50000;
    if (selectedPackage.toLowerCase().includes('standard')) return 150000;
    if (selectedPackage.toLowerCase().includes('premium')) return 350000;
    return 100000;
  };

  const getFinalPrice = () => {
    const base = getSelectedPackagePrice();
    if (appliedCouponInfo && appliedCouponInfo.discount_amount) {
      return Math.max(0, base - Number(appliedCouponInfo.discount_amount));
    }
    return base;
  };

  // States for Bisnis page UI (Search, Filter, Pagination, Error)
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState("Semua");
  const [businessStatusFilter, setBusinessStatusFilter] = useState("Semua");
  const [businessCurrentPage, setBusinessCurrentPage] = useState(1);
  const [businessItemsPerPage] = useState(6);
  const [businessFetchError, setBusinessFetchError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsBusinessFilter, setReviewsBusinessFilter] = useState("all");
  const [resellers, setResellers] = useState([]);
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_saved_items");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [savedBizPage, setSavedBizPage] = useState(1);
  const [savedBlogPage, setSavedBlogPage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // States for Premium Plans from API (AdminWeb sync)
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [loadingPremiumPlans, setLoadingPremiumPlans] = useState(false);
  const [selectedUpgradeBusiness, setSelectedUpgradeBusiness] = useState("");

  // Modal states for Dashboard details
  const [showChartDetailModal, setShowChartDetailModal] = useState(false);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);

  // Analytics detail modal states
  const [analyticsPeriod, setAnalyticsPeriod] = useState("weekly");
  const [analyticsDate, setAnalyticsDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [analyticsMonth, setAnalyticsMonth] = useState(() => new Date().getMonth() + 1);
  const [analyticsYear, setAnalyticsYear] = useState(() => new Date().getFullYear());
  const [analyticsStatsData, setAnalyticsStatsData] = useState(null);
  const [loadingAnalyticsStats, setLoadingAnalyticsStats] = useState(false);

  const fetchAnalyticsStats = async (period = analyticsPeriod, date = analyticsDate, month = analyticsMonth, year = analyticsYear) => {
    try {
      setLoadingAnalyticsStats(true);
      const res = await api.get("/user/analytics-stats", {
        params: { period, date, month, year }
      });
      const data = res.data?.data || res.data;
      if (data) {
        setAnalyticsStatsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics stats:", err);
    } finally {
      setLoadingAnalyticsStats(false);
    }
  };

  useEffect(() => {
    if (showChartDetailModal) {
      fetchAnalyticsStats(analyticsPeriod, analyticsDate, analyticsMonth, analyticsYear);
    }
  }, [showChartDetailModal, analyticsPeriod, analyticsDate, analyticsMonth, analyticsYear]);

  // States for user dashboard statistics from database
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get("/user/dashboard-stats");
      const data = res.data?.data || res.data;
      if (data) {
        setUserStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch user dashboard stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("Semua");

  // Dynamic Recent Activities based on real User content (Businesses, Blogs, Events, Reviews)
  const recentActivitiesList = useMemo(() => {
    const list = [];

    // Businesses
    (businesses || []).forEach((b) => {
      const rawTime = b.created_at || b.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 1800000;
      list.push({
        id: `biz-${b.id}`,
        type: "business",
        typeName: "Bisnis",
        title: `Bisnis "${b.name}" terdaftar`,
        subText: `Kategori: ${b.category}${b.subCategory ? " › " + b.subCategory : ""} • ${b.city || "Indonesia"}`,
        dateStr: b.date || "Baru saja",
        timestamp: ts,
        icon: Briefcase,
        colorClass: "bg-[#eff6ff] text-[#3b82f6]",
        link: `/business/${b.id}`
      });
    });

    // Blogs
    (blogs || []).forEach((b) => {
      const rawTime = b.created_at || b.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 3600000;
      list.push({
        id: `blog-${b.id}`,
        type: "blog",
        typeName: "Blog",
        title: `Artikel "${b.title}" dipublikasikan`,
        subText: `Kategori: ${b.category} • Penulis: ${b.author || "Admin"}`,
        dateStr: b.date || "Baru saja",
        timestamp: ts,
        icon: FileText,
        colorClass: "bg-[#f3e8ff] text-[#7e22ce]",
        link: `/blog/${b.id}`
      });
    });

    // Events
    (events || []).forEach((e) => {
      const rawTime = e.created_at || e.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 5400000;
      list.push({
        id: `event-${e.id}`,
        type: "event",
        typeName: "Event",
        title: `Event "${e.title}" ditambahkan`,
        subText: `Tanggal Event: ${e.date || "Mendatang"}`,
        dateStr: e.date || "Baru saja",
        timestamp: ts,
        icon: Calendar,
        colorClass: "bg-[#f0fdf4] text-[#10b981]",
        link: `/blog/${e.id}`
      });
    });

    // Reviews
    (reviews || []).forEach((r) => {
      const rawTime = r.created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 7200000;
      list.push({
        id: `rev-${r.id}`,
        type: "review",
        typeName: "Ulasan",
        title: `Ulasan ${r.rating}★ dari ${r.user || "Pelanggan"}`,
        subText: `"${r.text}" untuk ${r.target}`,
        dateStr: r.date || "Baru saja",
        timestamp: ts,
        icon: Star,
        colorClass: "bg-[#fef9c3] text-[#ca8a04]",
        tab: "ulasan"
      });
    });

    // Fallback default activities if user has no data yet
    if (list.length === 0) {
      list.push(
        {
          id: "sys-init-1",
          type: "business",
          typeName: "Bisnis",
          title: "Bisnis sampel terdaftar",
          subText: "Kategori: Kuliner • Jakarta",
          dateStr: "Baru saja",
          timestamp: Date.now() - 1000,
          icon: Briefcase,
          colorClass: "bg-[#eff6ff] text-[#3b82f6]"
        },
        {
          id: "sys-init-2",
          type: "blog",
          typeName: "Blog",
          title: "Selamat datang di Portal Info.co.id",
          subText: "Kelola artikel dan event dari panel ini",
          dateStr: "Hari ini",
          timestamp: Date.now() - 5000,
          icon: FileText,
          colorClass: "bg-[#f3e8ff] text-[#7e22ce]"
        }
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [businesses, blogs, events, reviews]);

  // Dynamic Weekly Chart Data calculated directly from actual database view records
  const weeklyChartStats = useMemo(() => {
    const days = [
      { key: 1, day: "Sen", fullDay: "Senin" },
      { key: 2, day: "Sel", fullDay: "Selasa" },
      { key: 3, day: "Rab", fullDay: "Rabu" },
      { key: 4, day: "Kam", fullDay: "Kamis" },
      { key: 5, day: "Jum", fullDay: "Jumat" },
      { key: 6, day: "Sab", fullDay: "Sabtu" },
      { key: 0, day: "Min", fullDay: "Minggu" },
    ];

    const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    [...(businesses || []), ...(blogs || []), ...(events || [])].forEach(item => {
      if (item.created_at) {
        const d = new Date(item.created_at).getDay();
        dayCounts[d] = (dayCounts[d] || 0) + 1;
      }
    });

    const backendWeeklyData = userStats?.weekly_chart_data || [];

    const chartData = days.map((d) => {
      const found = backendWeeklyData.find((item) => item.day === d.day || item.key === d.key);
      const visits = found ? Number(found.visits || 0) : 0;
      const activityCount = dayCounts[d.key] || 0;
      return {
        ...d,
        visits,
        itemCount: activityCount
      };
    });

    const maxVisits = Math.max(...chartData.map(d => d.visits), 1);
    const totalVisits = userStats?.total_views ?? chartData.reduce((acc, curr) => acc + curr.visits, 0);
    const avgVisits = Math.round(totalVisits / 7);
    const busiestDay = [...chartData].sort((a, b) => b.visits - a.visits)[0];

    return {
      chartData: chartData.map(d => ({
        ...d,
        heightPercentage: maxVisits > 0 && d.visits > 0 ? `${Math.round((d.visits / maxVisits) * 100)}%` : "0%"
      })),
      totalVisits,
      avgVisits,
      busiestDay,
      maxVisits
    };
  }, [businesses, blogs, events, userStats]);

  // Fetch active Premium Plans from API (Created/updated by AdminWeb)
  useEffect(() => {
    const fetchPremiumPlans = async () => {
      setLoadingPremiumPlans(true);
      try {
        const res = await api.get('/plans');
        const data = res.data?.data || res.data || [];
        const activePlans = (Array.isArray(data) ? data : []).filter(p => p.is_active !== false && p.is_active !== 0);
        setPremiumPlans(activePlans);
      } catch (err) {
        console.error("Failed to fetch premium plans:", err);
      } finally {
        setLoadingPremiumPlans(false);
      }
    };
    fetchPremiumPlans();
  }, []);

  useEffect(() => {
    if (activeTab === "premium") {
      const fetchPremiumPlans = async () => {
        try {
          const res = await api.get('/plans');
          const data = res.data?.data || res.data || [];
          const activePlans = (Array.isArray(data) ? data : []).filter(p => p.is_active !== false && p.is_active !== 0);
          setPremiumPlans(activePlans);
        } catch (err) {
          console.error("Failed to fetch premium plans on tab switch:", err);
        }
      };
      fetchPremiumPlans();
    }
  }, [activeTab]);

  // Fetch businesses from API (only user's own businesses)
  const fetchBusinesses = async () => {
    setLoadingBusinesses(true);
    setBusinessFetchError(null);
    try {
      console.log("Fetching businesses...");
      const res = await api.get("/my-businesses");
      console.log("Businesses API response:", res.data);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      console.log("Businesses list:", list);
      if (Array.isArray(list)) {
        const mapped = list.map(b => {
          // Extract main category and subcategory
          const mainCategory = b.category?.parent || b.category;
          const subCategory = b.category?.parent ? b.category : null;
          const categoryName = mainCategory?.name || b.category?.name || "Umum";
          const subCategoryName = subCategory?.name || null;
          const imageUrl = b.logo ? getStorageUrl(b.logo) : (b.image ? getStorageUrl(b.image) : (b.thumbnail ? getStorageUrl(b.thumbnail) : null));

          return {
            id: b.id,
            name: b.name,
            category: categoryName,
            subCategory: subCategoryName,
            city: b.city || b.address || "Indonesia",
            owner: b.user?.name || b.owner?.name || b.author || displayName || profileData?.name || "Saya",
            status: b.status || "active",
            image: imageUrl,
            created_at: b.created_at,
            date: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-",
            products: b.products || [],
            raw: b
          };
        });
        console.log("Mapped businesses:", mapped);
        setBusinesses(mapped);
        try {
          localStorage.setItem("cached_my_businesses", JSON.stringify(mapped));
        } catch (e) {}
      } else {
        console.warn("Businesses data is not an array:", data);
        setBusinesses([]);
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      setBusinessFetchError("Gagal memuat data bisnis. Silakan periksa koneksi atau coba beberapa saat lagi.");
      setBusinesses([]);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  // Fetch businesses on mount
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Fetch advertisements from API
  const fetchAdvertisements = async () => {
    setLoadingAdvertisements(true);
    try {
      const res = await api.get("/my-advertisements");
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAdvertisements(list);
    } catch (err) {
      console.error("Failed to fetch advertisements:", err);
      setAdvertisements([]);
    } finally {
      setLoadingAdvertisements(false);
    }
  };

  // Fetch ad packages from API
  const fetchAdPackages = async () => {
    try {
      const res = await api.get('/ad-packages');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) setAdPackages(data);
    } catch (err) {
      console.error('Failed to fetch ad packages:', err);
    }
  };

  // Fetch saved items (business favorites & blog/event favorites) from API
  const fetchSavedItems = async () => {
    try {
      const [resBiz, resBlog] = await Promise.all([
        api.get("/my-favorites"),
        api.get("/my-blog-favorites")
      ]);

      const bizData = resBiz.data?.data || resBiz.data || [];
      const bizList = Array.isArray(bizData) ? bizData : (bizData?.data || []);

      const mappedBiz = (Array.isArray(bizList) ? bizList : [])
        .map(fav => {
          const b = fav.business || fav;
          if (!b || !b.id) return null;
          const mainCategory = b.category?.parent || b.category;
          const subCategory = b.category?.parent ? b.category : null;
          const categoryName = mainCategory?.name || b.category?.name || "Umum";
          const subCategoryName = subCategory?.name || null;
          return {
            id: b.id,
            favoriteId: fav.id,
            itemType: "business",
            type: "Bisnis",
            title: b.name || "Bisnis",
            name: b.name || "Bisnis",
            category: categoryName,
            subCategory: subCategoryName,
            city: b.city || b.address || "Indonesia",
            owner: b.user?.name || b.owner?.name || "Pemilik Usaha",
            image: b.logo ? getStorageUrl(b.logo) : (b.image ? getStorageUrl(b.image) : (b.banner ? getStorageUrl(b.banner) : null)),
            date: fav.created_at ? new Date(fav.created_at).toLocaleDateString("id-ID") : "Tersimpan",
            raw: b
          };
        })
        .filter(Boolean);

      const blogData = resBlog.data?.data || resBlog.data || [];
      const blogList = Array.isArray(blogData) ? blogData : (blogData?.data || []);

      const mappedBlogs = (Array.isArray(blogList) ? blogList : [])
        .map(fav => {
          const b = fav.blog || fav;
          if (!b || !b.id) return null;
          const isEvent = b.type === "event" || (b.blog_category && b.blog_category.toLowerCase().includes("event"));
          return {
            id: b.id,
            blogId: b.id,
            favoriteId: fav.id,
            itemType: isEvent ? "event" : "blog",
            type: isEvent ? "Event" : "Blog",
            title: b.title || "Artikel",
            category: b.blog_category || "Umum",
            author: b.user?.name || b.author || "Admin",
            location: b.event_location || "Indonesia",
            eventDate: b.event_date ? new Date(b.event_date).toLocaleDateString("id-ID") : null,
            image: b.thumbnail ? getStorageUrl(b.thumbnail) : null,
            date: fav.created_at ? new Date(fav.created_at).toLocaleDateString("id-ID") : "Tersimpan",
            raw: b
          };
        })
        .filter(Boolean);

      const combined = [...mappedBiz, ...mappedBlogs];
      setSavedItems(combined);
      try {
        localStorage.setItem("cached_saved_items", JSON.stringify(combined));
      } catch (e) {}
    } catch (err) {
      console.error("Failed to fetch saved items:", err);
    }
  };

  const handleDeleteSavedItem = async (item) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${item.title || item.name}" dari daftar simpan?`)) return;
    try {
      if (item.itemType === "business") {
        await api.delete(`/favorites/${item.id}`);
        let localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
        localStorage.setItem("saved_business_ids", JSON.stringify(localBiz.filter(id => String(id) !== String(item.id))));
      } else {
        await api.delete(`/blog-favorites/${item.blogId || item.id}`);
        let localBlogs = JSON.parse(localStorage.getItem("saved_blog_ids") || "[]");
        localStorage.setItem("saved_blog_ids", JSON.stringify(localBlogs.filter(id => String(id) !== String(item.id))));
      }
      setSavedItems(prev => {
        const updated = prev.filter(i => !(i.id === item.id && i.itemType === item.itemType));
        try {
          localStorage.setItem("cached_saved_items", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to delete favorite:", err);
      setSavedItems(prev => prev.filter(i => !(i.id === item.id && i.itemType === item.itemType)));
    }
  };

  // Fetch advertisements, ad packages, saved items, and user stats on mount
  useEffect(() => {
    fetchAdvertisements();
    fetchAdPackages();
    fetchSavedItems();
    fetchUserStats();
    window.addEventListener("bookmarkChanged", fetchSavedItems);
    return () => {
      window.removeEventListener("bookmarkChanged", fetchSavedItems);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "simpan") {
      fetchSavedItems();
    } else if (activeTab === "dashboard") {
      fetchUserStats();
    }
  }, [activeTab]);

  // Submit advertisement request
  const handleAdSubmit = async () => {
    if (!selectedBusinessForAd || !selectedPackage) {
      alert('Pilih bisnis dan paket terlebih dahulu');
      return;
    }

    setSubmittingAd(true);
    try {
      const formData = new FormData();
      formData.append('business_id', selectedBusinessForAd);
      formData.append('package_name', selectedPackage);
      if (selectedPaymentMethod) formData.append('payment_method', selectedPaymentMethod);
      if (adNotes) formData.append('notes', adNotes);

      const coupon = appliedCouponInfo ? appliedCouponInfo.code : couponCodeInput.trim();
      if (coupon) formData.append('coupon_code', coupon);

      if (adPaymentProofFile) {
        formData.append('payment_proof', adPaymentProofFile);
      }

      await api.post('/advertisements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Iklan berhasil diajukan! ' + (adPaymentProofFile ? 'Bukti pembayaran telah dikirim dan menunggu konfirmasi admin.' : 'Silakan lakukan pembayaran.'));
      setSelectedBusinessForAd(null);
      setSelectedPackage(null);
      setAdNotes('');
      setCouponCodeInput('');
      setAppliedCouponInfo(null);
      setCouponMsg('');
      setSelectedPaymentMethod('Transfer Bank BCA');
      setAdPaymentProofFile(null);
      setAdPaymentProofPreview(null);
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to submit advertisement:', err);
      alert(err.response?.data?.message || 'Gagal mengajukan iklan. Silakan coba lagi.');
    } finally {
      setSubmittingAd(false);
    }
  };

  // Submit advertisement payment modal
  const handleAdPaymentSubmit = async () => {
    if (!payModalAd) return;

    setSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('payment_method', selectedPaymentMethod);
      if (adPaymentProofFile) {
        formData.append('payment_proof', adPaymentProofFile);
      }

      await api.post(`/advertisements/${payModalAd.id}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.');
      setPayModalAd(null);
      setAdPaymentProofFile(null);
      setAdPaymentProofPreview(null);
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to process payment:', err);
      alert(err.response?.data?.message || 'Gagal mengirim pembayaran.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Handle advertisement payment
  const handleAdPayment = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin melakukan pembayaran?')) return;

    try {
      await api.put(`/advertisements/${adId}/pay`);
      alert('Pembayaran berhasil! Iklan menunggu persetujuan admin.');
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to process payment:', err);
      alert('Gagal melakukan pembayaran. Silakan coba lagi.');
    }
  };

  // Handle advertisement cancellation
  const handleAdCancel = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan iklan ini?')) return;

    try {
      await api.delete(`/advertisements/${adId}`);
      alert('Iklan berhasil dibatalkan.');
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to cancel advertisement:', err);
      alert('Gagal membatalkan iklan. Silakan coba lagi.');
    }
  };

  // Validate coupon code for user advertisement
  const handleValidateUserCoupon = async () => {
    if (!couponCodeInput.trim() || !selectedPackage) {
      setCouponMsg('Pilih paket iklan dan masukkan kode kupon terlebih dahulu.');
      return;
    }
    setValidatingCoupon(true);
    setCouponMsg('');
    const basePrice = getSelectedPackagePrice();

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCodeInput.trim(),
        product_type: 'ads',
        amount: basePrice
      });
      const data = res.data?.data || res.data;
      setAppliedCouponInfo(data);
      setCouponMsg('Kupon berhasil diterapkan!');
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      setAppliedCouponInfo(null);
      setCouponMsg(err.response?.data?.message || 'Kode kupon tidak valid atau telah kedaluwarsa.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Open edit advertisement modal
  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setEditAdForm({
      package_name: ad.package_name || 'basic',
      notes: ad.notes || ''
    });
  };

  // Close edit advertisement modal
  const handleCloseEditAdModal = () => {
    setEditingAd(null);
    setEditAdForm({ package_name: 'basic', notes: '' });
  };

  // Submit edit advertisement
  const handleUpdateAd = async (e) => {
    e.preventDefault();
    if (!editingAd) return;
    setUpdatingAd(true);
    try {
      await api.put(`/advertisements/${editingAd.id}`, editAdForm);
      alert('Iklan berhasil diperbarui!');
      handleCloseEditAdModal();
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to update advertisement:', err);
      alert(err.response?.data?.message || 'Gagal memperbarui iklan.');
    } finally {
      setUpdatingAd(false);
    }
  };

  // Fetch user profile from backend API (GET /user/profile)
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api.get("/user/profile");
      const userData = res.data?.data || res.data;
      if (userData) {
        const avatarUrl = userData.avatar ? getStorageUrl(userData.avatar) : DEFAULT_AVATAR;
        const bannerUrl = userData.banner ? getStorageUrl(userData.banner) : DEFAULT_BANNER;
        setProfileData({
          name: userData.name || "",
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          role: userData.role || "User",
          bio: userData.bio || "",
          avatar: avatarUrl,
          banner: bannerUrl,
        });
        setPhotoPreview(avatarUrl);
        setBannerPreview(bannerUrl);
        setDisplayName(userData.username || userData.name || "");
        setUser(userData);
        localStorage.setItem("user", JSON.stringify({ ...userData, avatar: avatarUrl, banner: bannerUrl }));
      }
    } catch (err) {
      console.error("Failed to fetch profile from API:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch profile on initial mount and whenever profile tab becomes active
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "profile") {
      fetchUserProfile();
    }
  }, [activeTab]);

  // Fetch blogs from API (only user's own blogs)
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoadingBlogs(true);
      try {
        const res = await api.get("/my-blogs");
        const blogResponse = res.data?.data || res.data;
        const list = Array.isArray(blogResponse) ? blogResponse : (blogResponse?.data || []);
        if (Array.isArray(list)) {
          const mapped = list.map(b => ({
            id: b.id,
            title: b.title,
            category: b.blog_category || "Umum",
            author: b.user?.name || b.author || "Admin",
            date: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID") : "-",
            status: b.status === "published" ? "published" : "draft",
            thumbnail: b.thumbnail ? getStorageUrl(b.thumbnail) : null
          }));
          setBlogs(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  // Fetch events from API (blogs with type=event)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await api.get("/my-blogs?type=event");
        const evResponse = res.data?.data || res.data;
        const list = Array.isArray(evResponse) ? evResponse : (evResponse?.data || []);
        if (Array.isArray(list)) {
          const mapped = list.map(e => ({
            id: e.id,
            title: e.title,
            date: e.event_date || (e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "-"),
            location: e.event_location || "Indonesia",
            category: e.blog_category || "Umum",
            author: e.user?.name || e.author || "Admin",
            status: e.status === "published" ? "upcoming" : "past",
            thumbnail: e.thumbnail ? getStorageUrl(e.thumbnail) : null
          }));
          setEvents(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  // Fetch my ratings from API
  const fetchMyRatings = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get('/my-ratings');
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      const mapped = list.map(r => ({
        id: r.id,
        rating: r.rating,
        review: r.review || '',
        business_id: r.business_id,
        businessName: r.business?.name || 'Bisnis tidak diketahui',
        businessLogo: r.business?.logo_url
          ? r.business.logo_url
          : (r.business?.logo ? getStorageUrl(r.business.logo) : null),
        businessSlug: r.business?.slug || '',
        created_at: r.created_at,
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '-',
      }));
      setReviews(mapped);
      setReviewsCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchMyRatings();
  }, []);

  useEffect(() => {
    if (activeTab === 'ulasan') {
      fetchMyRatings();
    }
  }, [activeTab]);

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Yakin ingin menghapus ulasan ini?')) return;
    setDeletingReviewId(reviewId);
    try {
      await api.delete(`/ratings/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Gagal menghapus ulasan.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Open edit review modal
  const handleOpenEditReview = (rev) => {
    setEditingReview(rev);
    setEditReviewForm({ rating: rev.rating, review: rev.review || '' });
  };

  // Save edited review
  const handleSaveEditReview = async () => {
    if (!editingReview) return;
    setSavingReview(true);
    try {
      const res = await api.put(`/ratings/${editingReview.id}`, {
        rating: editReviewForm.rating,
        review: editReviewForm.review,
      });
      const updated = res.data?.data || res.data;
      setReviews(prev =>
        prev.map(r =>
          r.id === editingReview.id
            ? { ...r, rating: editReviewForm.rating, review: editReviewForm.review }
            : r
        )
      );
      setEditingReview(null);
    } catch (err) {
      console.error('Failed to update review:', err);
      alert('Gagal menyimpan ulasan.');
    } finally {
      setSavingReview(false);
    }
  };

  // Fetch produk ketika selectedBusinessForProducts berubah
  useEffect(() => {
    if (!selectedBusinessForProducts) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get(`/businesses/${selectedBusinessForProducts}/products`);
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : (data?.data || []);
        setProducts(list);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedBusinessForProducts]);

  // Buka modal edit produk
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: String(product.price || ""),
      description: product.description || "",
    });
    const numericPrice = String(product.price || "").replace(/\D/g, "");
    setEditPriceDisplay(
      numericPrice ? "Rp " + parseInt(numericPrice, 10).toLocaleString("id-ID") : ""
    );
  };

  // Tutup modal edit
  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditForm({ name: "", price: "", description: "" });
    setEditPriceDisplay("");
  };

  // Handle perubahan field di form edit
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numeric = value.replace(/\D/g, "");
      setEditForm(prev => ({ ...prev, price: numeric }));
      setEditPriceDisplay(
        numeric ? "Rp " + parseInt(numeric, 10).toLocaleString("id-ID") : ""
      );
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Simpan perubahan produk
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("price", editForm.price);
      formData.append("description", editForm.description);
      formData.append("_method", "PUT");
      const res = await api.post(`/products/${editingProduct.id}`, formData);
      const updated = res.data?.data || res.data;
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
      handleCloseEditModal();
      alert("Produk berhasil diperbarui!");
    } catch (err) {
      console.error("Failed to update product:", err);
      alert(err.response?.data?.message || "Gagal memperbarui produk.");
    } finally {
      setSavingProduct(false);
    }
  };

  // Hapus produk
  const handleDeleteProduct = async (productId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(err.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bisnis ini?")) {
      return;
    }
    try {
      await api.delete(`/businesses/${id}`);
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err) {
      console.error("Failed to delete business:", err);
      alert("Gagal menghapus bisnis.");
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus blog ini?")) {
      return;
    }
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Gagal menghapus blog.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      return;
    }
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Gagal menghapus event.");
    }
  };



  // Handle logout action
  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      try {
        // Invalidate token on the backend (Sanctum)
        await api.post('/logout');
      } catch (_) {
        // Proceed with local cleanup even if API call fails
      } finally {
        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("displayName");
        // Clear user-specific cache keys
        ["cached_saved_businesses", "cached_saved_blogs", "saved_businesses_ids", "saved_blogs_ids"]
          .forEach((k) => localStorage.removeItem(k));
        window.dispatchEvent(new Event("userAuthChanged"));
        navigate("/login");
      }
    }
  };

  // Handle message select
  const selectMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.unread) {
      setMessages(messages.map((m) => (m.id === msg.id ? { ...m, unread: false } : m)));
    }
  };

  // Handle profile form save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUploadingProfile(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileValidationErrors({});

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", profileData.name || "");
      formData.append("username", profileData.username || "");
      formData.append("email", profileData.email || "");
      formData.append("phone", profileData.phone || "");
      formData.append("location", profileData.location || "");
      formData.append("bio", profileData.bio || "");

      if (profilePhoto) {
        formData.append("avatar", profilePhoto);
      } else if (removeAvatarFlag) {
        formData.append("remove_avatar", "true");
      }

      if (profileBanner) {
        formData.append("banner", profileBanner);
      } else if (removeBannerFlag) {
        formData.append("remove_banner", "true");
      }

      const res = await api.post("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = res.data?.data || res.data?.user || res.data;
      const successMsg = res.data?.message || "Profil berhasil diperbarui!";
      setProfileSuccessMsg(successMsg);

      let newAvatar = photoPreview;
      let newBanner = bannerPreview;

      if (updatedUser) {
        if (updatedUser.avatar) {
          newAvatar = getStorageUrl(updatedUser.avatar);
        } else if (removeAvatarFlag) {
          newAvatar = DEFAULT_AVATAR;
        }

        if (updatedUser.banner) {
          newBanner = getStorageUrl(updatedUser.banner);
        } else if (removeBannerFlag) {
          newBanner = DEFAULT_BANNER;
        }

        const updatedUserObj = {
          ...user,
          ...updatedUser,
          avatar: newAvatar,
          banner: newBanner,
          name: profileData.name,
          username: profileData.username,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
        };

        setUser(updatedUserObj);
        localStorage.setItem("user", JSON.stringify(updatedUserObj));
        window.dispatchEvent(new Event("userAuthChanged"));

        setProfileData({
          name: updatedUser.name || profileData.name,
          username: updatedUser.username || profileData.username,
          email: updatedUser.email || profileData.email,
          phone: updatedUser.phone || profileData.phone,
          location: updatedUser.location || profileData.location,
          bio: updatedUser.bio || profileData.bio,
          role: updatedUser.role || profileData.role,
          avatar: newAvatar,
          banner: newBanner,
        });

        setPhotoPreview(newAvatar);
        setBannerPreview(newBanner);
        setProfilePhoto(null);
        setProfileBanner(null);
        setRemoveAvatarFlag(false);
        setRemoveBannerFlag(false);
        setDisplayName(updatedUser.username || updatedUser.name || profileData.name);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setProfileValidationErrors(err.response.data.errors);
        setProfileErrorMsg("Terdapat kesalahan isian form. Harap periksa pesan error di bawah input.");
      } else {
        setProfileErrorMsg(err.response?.data?.message || "Gagal memperbarui profil. Silakan coba lagi.");
      }
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setProfilePhoto(file);
    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);
    setRemoveAvatarFlag(false);
    setShowPhotoOptions(false);
    setShowPhotoModal(false);

    try {
      setIsUploadingProfile(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("avatar", file);

      const res = await api.post("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data || res.data?.user || res.data;
      if (updatedUser && updatedUser.avatar) {
        const savedAvatar = getStorageUrl(updatedUser.avatar);
        setPhotoPreview(savedAvatar);
        setProfileData((prev) => ({ ...prev, avatar: savedAvatar }));
        const newObj = { ...user, ...updatedUser, avatar: savedAvatar };
        setUser(newObj);
        localStorage.setItem("user", JSON.stringify(newObj));
        window.dispatchEvent(new Event("userAuthChanged"));
        setProfileSuccessMsg("Foto profil berhasil disimpan!");
      }
    } catch (err) {
      console.error("Auto save photo failed:", err);
      setProfileErrorMsg(err.response?.data?.message || "Gagal menyimpan foto profil.");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleRemovePhoto = async () => {
    setProfilePhoto(null);
    setPhotoPreview(DEFAULT_AVATAR);
    setRemoveAvatarFlag(true);
    setShowPhotoOptions(false);
    setShowPhotoModal(false);

    try {
      setIsUploadingProfile(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("remove_avatar", "true");

      const res = await api.post("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data || res.data?.user || res.data;
      setPhotoPreview(DEFAULT_AVATAR);
      setProfileData((prev) => ({ ...prev, avatar: DEFAULT_AVATAR }));
      const newObj = { ...user, avatar: DEFAULT_AVATAR };
      setUser(newObj);
      localStorage.setItem("user", JSON.stringify(newObj));
      window.dispatchEvent(new Event("userAuthChanged"));
      setProfileSuccessMsg("Foto profil berhasil dihapus!");
    } catch (err) {
      console.error("Remove photo failed:", err);
      setProfileErrorMsg(err.response?.data?.message || "Gagal menghapus foto profil.");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const startCamera = async () => {
    setShowPhotoModal(false);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan pada browser Anda.");
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        handlePhotoUpload(file);
      }
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  // Banner handlers
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setProfileBanner(file);
    const localPreview = URL.createObjectURL(file);
    setBannerPreview(localPreview);
    setRemoveBannerFlag(false);
    setShowBannerOptions(false);

    try {
      setIsUploadingBanner(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("banner", file);

      const res = await api.post("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data || res.data?.user || res.data;
      if (updatedUser && updatedUser.banner) {
        const savedBanner = getStorageUrl(updatedUser.banner);
        setBannerPreview(savedBanner);
        setProfileData((prev) => ({ ...prev, banner: savedBanner }));
        const newObj = { ...user, ...updatedUser, banner: savedBanner };
        setUser(newObj);
        localStorage.setItem("user", JSON.stringify(newObj));
        window.dispatchEvent(new Event("userAuthChanged"));
        setProfileSuccessMsg("Banner profil berhasil disimpan!");
      }
    } catch (err) {
      console.error("Auto save banner failed:", err);
      setProfileErrorMsg(err.response?.data?.message || "Gagal menyimpan banner profil.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    setProfileBanner(null);
    setBannerPreview(DEFAULT_BANNER);
    setRemoveBannerFlag(true);
    setShowBannerOptions(false);

    try {
      setIsUploadingBanner(true);
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("remove_banner", "true");

      const res = await api.post("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data || res.data?.user || res.data;
      setBannerPreview(DEFAULT_BANNER);
      setProfileData((prev) => ({ ...prev, banner: DEFAULT_BANNER }));
      const newObj = { ...user, banner: DEFAULT_BANNER };
      setUser(newObj);
      localStorage.setItem("user", JSON.stringify(newObj));
      window.dispatchEvent(new Event("userAuthChanged"));
      setProfileSuccessMsg("Banner profil berhasil dihapus!");
    } catch (err) {
      console.error("Remove banner failed:", err);
      setProfileErrorMsg(err.response?.data?.message || "Gagal menghapus banner profil.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle username save
  const handleSaveUsername = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    localStorage.setItem("displayName", trimmed);
    setEditingUsername(false);
  };

  // Open username edit mode
  const handleEditUsername = () => {
    setUsernameInput(displayName);
    setEditingUsername(true);
  };

  // Header Title mapping
  const getPageInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return { title: "Admin User Dashboard", desc: "Ikhtisar statistik dan aktivitas portal Anda saat ini" };
      case "bisnis":
        return { title: "Manajemen Bisnis", desc: "Kelola daftar bisnis, verifikasi, dan status tayang" };
      case "blog-event":
        return { title: "Manajemen Blog & Event", desc: "Kelola artikel blog dan acara dalam satu halaman" };
      case "inbox":
        return { title: "Kotak Masuk Pesan", desc: "Lihat dan balas pesan keluhan atau pertanyaan pengguna" };
      case "reseller":
        return { title: "Direktori Reseller", desc: "Kelola kemitraan dan agen reseller wilayah portal" };
      case "premium":
        return { title: "Premium", desc: "Upgrade ke akun premium untuk fitur lebih" };
      case "iklan":
        return { title: "Iklan", desc: "Pasang iklan untuk promosi bisnis Anda" };
      case "produk":
        return { title: "Manajemen Produk", desc: "Kelola produk untuk bisnis Anda" };
      case "simpan":
        return { title: "Bookmark Tersimpan", desc: "Daftar konten bisnis dan event penting yang ditandai" };
      case "ulasan":
        return { title: "Ulasan Pelanggan", desc: "Pantau umpan balik konsumen dan ulasan rating bintang" };
      case "profile":
        return { title: "Pengaturan Profil", desc: "Ubah data diri dan kredensial administrator Anda" };
      default:
        return { title: "Panel Admin User", desc: "Halaman administrator portal Info.co.id" };
    }
  };

  const pageInfo = getPageInfo();

  // Sidebar Menu list configured based on request
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "bisnis", name: "Bisnis", icon: Briefcase },
    { id: "blog-event", name: "Blog & Event", icon: FileText },
    { id: "inbox", name: "Inbox", icon: Mail },
    { id: "reseller", name: "Reseller", icon: Users },
    { id: "premium", name: "Premium", icon: Crown },
    { id: "iklan", name: "Iklan", icon: Megaphone },
    { id: "produk", name: "Produk", icon: Package },
    { id: "simpan", name: "Simpan", icon: Bookmark },
    { id: "ulasan", name: "Ulasan", icon: Star }
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-['Poppins',sans-serif] text-[#0f172a]">
      {/* ── Collapsible Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen ${isCollapsed ? "w-[68px]" : "w-[240px]"} bg-[#050a16] flex flex-col z-[200] transition-[width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-[rgba(255,255,255,0.07)]`}>
        <div className="flex items-center justify-between p-[18px_14px_14px] border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div className="flex items-center gap-[10px] overflow-hidden flex-1 min-w-0">
            {/* branding info.co.id */}
            <img src={logoImg} alt="Info.co.id" className="h-[28px] w-auto shrink-0" />
            <span className={`text-[15px] font-bold text-white whitespace-nowrap transition-all duration-[280ms] ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : ""}`}>Info.co.id</span>
          </div>
          <div className="shrink-0 w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[rgba(255,255,255,0.80)] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(255,255,255,0.08)] hover:text-white" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu size={22} />
          </div>
        </div>

        {/* Search Box */}
        <div className={`flex items-center gap-[8px] my-[12px] mx-[10px] py-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] rounded-[8px] transition-all duration-[280ms] shrink-0 overflow-hidden focus-within:bg-[rgba(255,255,255,0.10)] ${isCollapsed ? "px-[8px] justify-center" : "px-[12px]"}`}>
          <Search className="text-[rgba(255,255,255,0.40)] shrink-0" size={18} />
          <input
            type="text"
            className={`flex-1 border-none outline-none bg-transparent text-[rgba(255,255,255,0.80)] font-['Poppins',sans-serif] text-[13px] min-w-0 placeholder:text-[rgba(255,255,255,0.40)] transition-all duration-[280ms] ${isCollapsed ? "w-0 opacity-0 pointer-events-none" : ""}`}
            placeholder={isCollapsed ? "" : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Items */}
        <ul className="list-none flex-1 overflow-y-auto overflow-x-hidden px-[8px] py-[4px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="group relative mb-[2px]">
                <div className={`flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] cursor-pointer transition-all duration-[280ms] whitespace-nowrap ${isActive ? "bg-[#007570] text-white font-semibold shadow-[0_2px_8px_rgba(0,117,112,0.4)]" : "text-[rgba(255,255,255,0.80)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white"}`} onClick={() => setActiveTab(item.id)}>
                  <Icon className="shrink-0" size={20} />
                  <span className={`text-[13.5px] font-medium whitespace-nowrap transition-all duration-[280ms] overflow-hidden ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : ""}`}>{item.name}</span>
                </div>
                <span className={`absolute left-[76px] top-1/2 -translate-y-1/2 bg-[#1e293b] text-white text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 ${isCollapsed ? "group-hover:opacity-100" : ""} transition-opacity duration-150 z-[300] before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-[#1e293b]`}>{item.name}</span>
              </li>
            );
          })}
        </ul>

        {/* Back to Website Button */}
        <div className="p-[8px_8px_4px] shrink-0">
          <Link to="/" className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] bg-[rgba(0,117,112,0.15)] border border-[rgba(0,117,112,0.30)] text-[#5eead4] text-[13px] font-medium font-['Poppins',sans-serif] overflow-hidden whitespace-nowrap transition-all duration-[280ms] hover:bg-[rgba(0,117,112,0.30)] hover:text-white hover:border-[rgba(0,117,112,0.55)]" title="Kembali ke Website">
            <Home size={18} className="shrink-0" />
            <span className={`transition-all duration-[280ms] overflow-hidden whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : ""}`}>Kembali ke Website</span>
          </Link>
        </div>

        {/* Profile Footer Section */}
        <div className="flex items-center justify-between p-[12px_10px] border-t border-[rgba(255,255,255,0.07)] gap-[8px] shrink-0 overflow-hidden">
          <div className="flex items-center gap-[10px] flex-1 min-w-0 rounded-[8px] p-[4px_6px] transition-all duration-[280ms] hover:bg-[rgba(255,255,255,0.07)] cursor-pointer" onClick={() => setActiveTab("profile")}>
            <img src={profileData.avatar} alt="Profile" className="w-[36px] h-[36px] rounded-full object-cover shrink-0 border-2 border-[rgba(0,117,112,0.5)]" />
            <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-[280ms] ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : ""}`}>
              <span className="text-[12.5px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">{displayName}</span>
              <span className="text-[11px] text-[rgba(255,255,255,0.40)] whitespace-nowrap">{profileData.role}</span>
            </div>
          </div>
          <div className="shrink-0 w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[rgba(255,255,255,0.40)] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(239,68,68,0.15)] hover:text-[#f87171]" onClick={handleLogout} title="Keluar Panel Admin User">
            <LogOut size={18} />
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-[280ms] ${isCollapsed ? "ml-[68px]" : "ml-[240px]"}`}>
        <header className="sticky top-0 z-[100] flex items-center justify-between px-[28px] h-[60px] bg-white/85 backdrop-blur-md border-b border-[#e2e8f0] gap-[16px]">
          <div>
            <h1 className="text-[17px] font-bold text-[#0f172a] leading-[1.2]">{pageInfo.title}</h1>
            <p className="text-[12px] text-[#64748b] mt-[1px]">{pageInfo.desc}</p>
          </div>
          <div className="flex items-center gap-[14px] shrink-0">
            <div className="flex items-center gap-[8px] p-[6px_12px_6px_6px] rounded-full bg-[#f1f5f9] text-[13px] text-[#64748b] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(0,117,112,0.12)]" onClick={() => setActiveTab("profile")}>
              <img
                src={profileData.avatar}
                alt="user avatar"
                className="w-[24px] h-[24px] rounded-full object-cover"
              />
              <span>
                Halo, <strong>{displayName}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Active Page View Container */}
        <section className="flex-1 p-[24px_28px] max-md:p-[16px] overflow-y-auto">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[16px] mb-[20px]">
                <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[280ms] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] cursor-pointer" onClick={() => setActiveTab("bisnis")}>
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#64748b] uppercase tracking-[0.06em] mb-[6px]">Total Bisnis</h3>
                    <div className="text-[30px] font-bold text-[#0f172a] leading-none mb-[8px]">{userStats ? userStats.total_businesses : businesses.length}</div>
                    <div className="flex items-center gap-[4px] text-[12px] font-medium text-[#10b981]">
                      <TrendingUp size={14} /> <span>{userStats ? `${userStats.total_business_views} views` : "Bisnis Terdaftar"}</span>
                    </div>
                  </div>
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#eff6ff] text-[#3b82f6]">
                    <Briefcase size={22} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[280ms] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] cursor-pointer" onClick={() => setActiveTab("blog-event")}>
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#64748b] uppercase tracking-[0.06em] mb-[6px]">Total Event / Blog</h3>
                    <div className="text-[30px] font-bold text-[#0f172a] leading-none mb-[8px]">{userStats ? (userStats.total_events + userStats.total_blogs) : events.length}</div>
                    <div className="flex items-center gap-[4px] text-[12px] font-medium text-[#10b981]">
                      <TrendingUp size={14} /> <span>{userStats ? `${userStats.total_blog_views} views` : "Blog & Event"}</span>
                    </div>
                  </div>
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#f0fdf4] text-[#10b981]">
                    <Calendar size={22} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[280ms] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] cursor-pointer" onClick={() => setActiveTab("ulasan")}>
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#64748b] uppercase tracking-[0.06em] mb-[6px]">Total Ulasan</h3>
                    <div className="text-[30px] font-bold text-[#0f172a] leading-none mb-[8px]">{userStats ? userStats.total_reviews : reviews.length}</div>
                    <div className="flex items-center gap-[4px] text-[12px] font-medium text-[#10b981]">
                      <TrendingUp size={14} /> <span>Ulasan Usaha</span>
                    </div>
                  </div>
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#fef9c3] text-[#ca8a04]">
                    <Star size={22} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[20px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[280ms] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] cursor-pointer" onClick={() => setShowChartDetailModal(true)}>
                  <div>
                    <h3 className="text-[11.5px] font-medium text-[#64748b] uppercase tracking-[0.06em] mb-[6px]">Total Views Konten</h3>
                    <div className="text-[30px] font-bold text-[#0f172a] leading-none mb-[8px]">{userStats ? userStats.total_views.toLocaleString("id-ID") : 0}</div>
                    <div className="flex items-center gap-[4px] text-[12px] font-medium text-[#10b981]">
                      <TrendingUp size={14} /> <span>Bisnis & Blog</span>
                    </div>
                  </div>
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center shrink-0 bg-[#f0fdfa] text-[#007570]">
                    <Eye size={22} />
                  </div>
                </div>
              </div>

              {/* Graphical & Activity Panels */}
              <div className="grid grid-cols-[1.6fr_1fr] max-md:grid-cols-1 gap-[16px]">
                {/* 1. KUNJUNGAN PORTAL MINGGUAN CHART PANEL */}
                <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-[22px] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-[18px]">
                    <div>
                      <h2 className="text-[15px] font-semibold text-[#0f172a]">Kunjungan Portal Mingguan</h2>
                      <p className="text-[11.5px] text-[#64748b] mt-[2px]">Estimasi statistik kunjungan & interaksi pengunjung minggu ini</p>
                    </div>
                    <button
                      onClick={() => setShowChartDetailModal(true)}
                      className="text-[12.5px] font-medium text-[#007570] cursor-pointer px-[10px] py-[4px] rounded-[6px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa]"
                    >
                      Lihat Detail
                    </button>
                  </div>

                  <div className="flex items-end gap-[10px] h-[160px] pt-[10px]">
                    {weeklyChartStats.chartData.map((d) => (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-[6px] h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-[6px] bg-[#0f172a] text-white text-[10.5px] font-medium px-[8px] py-[3px] rounded-[4px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-sm">
                          {d.visits.toLocaleString('id-ID')} kunjungan
                        </div>
                        <div
                          className="w-full bg-gradient-to-b from-[#007570] to-[#00a8a2] rounded-t-[5px] min-h-[6px] transition-all duration-[280ms] group-hover:opacity-85"
                          style={{ height: d.heightPercentage }}
                        ></div>
                        <span className="text-[11px] text-[#64748b] font-medium group-hover:text-[#007570] transition-colors">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. AKTIVITAS TERBARU PANEL */}
                <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-[22px] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-[18px]">
                    <div>
                      <h2 className="text-[15px] font-semibold text-[#0f172a]">Aktivitas Terbaru</h2>
                      <p className="text-[11.5px] text-[#64748b] mt-[2px]">Aktivitas konten usaha, blog & event terkini</p>
                    </div>
                    <button
                      onClick={() => setShowAllActivitiesModal(true)}
                      className="text-[12.5px] font-medium text-[#007570] cursor-pointer px-[10px] py-[4px] rounded-[6px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa]"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="flex flex-col gap-[14px]">
                    {recentActivitiesList.slice(0, 4).map((act) => {
                      const IconComp = act.icon;
                      return (
                        <div
                          key={act.id}
                          className="flex gap-[12px] items-start p-[6px_8px] rounded-[8px] transition-colors hover:bg-[#f8fafc] cursor-pointer"
                          onClick={() => {
                            if (act.link) navigate(act.link);
                            else if (act.tab) setActiveTab(act.tab);
                          }}
                        >
                          <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 ${act.colorClass}`}>
                            <IconComp size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] leading-[1.45] text-[#0f172a] truncate">
                              {act.title}
                            </div>
                            <div className="text-[11.5px] text-[#64748b] mt-[2px] truncate">{act.subText} • <span className="font-semibold text-[#007570]">{act.dateStr}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BISNIS VIEW */}
          {activeTab === "bisnis" && (
            <div className="flex flex-col gap-[20px] w-full max-w-full">
              {/* Header Banner */}
              <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-[24px_28px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
                <div className="space-y-[4px] z-10">
                  <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight flex items-center gap-[10px]">
                    <Briefcase className="text-[#5eead4]" size={24} />
                    Kelola Bisnis Saya
                  </h2>
                  <p className="text-[13px] text-slate-300 max-w-[640px] font-normal leading-relaxed">
                    Daftar seluruh profil bisnis dan usaha yang Anda miliki di portal Info.co.id. Atur informasi, kategori, dan produk usaha Anda di sini.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/add-business")}
                  className="w-full md:w-auto h-[42px] inline-flex items-center justify-center gap-[8px] bg-[#007570] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-[20px] rounded-[11px] font-bold text-[13px] transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Tambah Bisnis</span>
                </button>
              </div>

              {/* Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
                {/* Total Businesses */}
                <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eff6ff] flex items-center justify-center shrink-0">
                    <Briefcase size={20} className="text-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-[22px] font-bold text-[#0f172a] leading-none">{businesses.length}</div>
                    <div className="text-[11.5px] text-[#64748b] mt-[3px]">Total Bisnis</div>
                  </div>
                </div>

                {/* Total Products */}
                <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <Package size={20} className="text-[#16a34a]" />
                  </div>
                  <div>
                    <div className="text-[22px] font-bold text-[#0f172a] leading-none">
                      {businesses.reduce((sum, b) => sum + (b.products?.length || 0), 0)}
                    </div>
                    <div className="text-[11.5px] text-[#64748b] mt-[3px]">Total Produk Usaha</div>
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-[#fef9c3] flex items-center justify-center shrink-0">
                    <CheckCircle size={20} className="text-[#ca8a04]" />
                  </div>
                  <div>
                    <div className="text-[22px] font-bold text-[#0f172a] leading-none flex items-center gap-[8px]">
                      <span>{businesses.filter(b => b.status === "active" || b.status === "Aktif").length}</span>
                      <span className="text-[11px] font-normal text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-[7px] py-[1px] rounded-full">
                        Aktif
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#64748b] mt-[3px]">
                      {businesses.filter(b => b.status === "pending" || b.status === "Menunggu").length > 0
                        ? `${businesses.filter(b => b.status === "pending" || b.status === "Menunggu").length} Menunggu Verifikasi`
                        : "Semua Terverifikasi"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Table Container Card */}
              <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm p-[20px] flex flex-col gap-[16px]">
                {/* Controls Bar: Search, Category & Status Filter */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-[12px] flex-wrap">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full min-w-[240px]">
                    <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
                    <input
                      type="text"
                      placeholder="Cari nama bisnis, kota, atau pemilik..."
                      value={businessSearch}
                      onChange={(e) => {
                        setBusinessSearch(e.target.value);
                        setBusinessCurrentPage(1);
                      }}
                      className="w-full h-[40px] pl-[40px] pr-[34px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[13px] text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#007570] transition-all"
                    />
                    {businessSearch && (
                      <button
                        onClick={() => { setBusinessSearch(""); setBusinessCurrentPage(1); }}
                        className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filters Group */}
                  <div className="flex items-center gap-[10px] w-full md:w-auto shrink-0 flex-wrap">
                    {/* Category Filter */}
                    <div className="relative w-full sm:w-[170px]">
                      <select
                        value={businessCategoryFilter}
                        onChange={(e) => {
                          setBusinessCategoryFilter(e.target.value);
                          setBusinessCurrentPage(1);
                        }}
                        className="w-full appearance-none h-[40px] px-[12px] pr-[30px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[12.5px] font-semibold text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#007570] cursor-pointer"
                      >
                        <option value="Semua">Semua Kategori</option>
                        {[...new Set(businesses.map(b => b.category).filter(Boolean))].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronRight size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#94a3b8] rotate-90 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full sm:w-[150px]">
                      <select
                        value={businessStatusFilter}
                        onChange={(e) => {
                          setBusinessStatusFilter(e.target.value);
                          setBusinessCurrentPage(1);
                        }}
                        className="w-full appearance-none h-[40px] px-[12px] pr-[30px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[12.5px] font-semibold text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#007570] cursor-pointer"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="pending">Menunggu</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#94a3b8] rotate-90 pointer-events-none" />
                    </div>

                    {/* Reset Button */}
                    {(businessSearch || businessCategoryFilter !== "Semua" || businessStatusFilter !== "Semua") && (
                      <button
                        onClick={() => {
                          setBusinessSearch("");
                          setBusinessCategoryFilter("Semua");
                          setBusinessStatusFilter("Semua");
                          setBusinessCurrentPage(1);
                        }}
                        className="h-[40px] px-[12px] flex items-center gap-[5px] text-[12px] font-semibold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-[10px] transition-colors cursor-pointer"
                      >
                        <X size={13} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {loadingBusinesses ? (
                  <div className="flex flex-col items-center justify-center py-[60px] gap-[10px] text-[#64748b]">
                    <Loader2 className="animate-spin text-[#007570]" size={32} />
                    <p className="text-[13px] font-medium">Memuat data bisnis...</p>
                  </div>
                ) : businessFetchError ? (
                  /* Error State */
                  <div className="flex flex-col items-center justify-center py-[48px] px-[16px] bg-[#fef2f2] border border-[#fca5a5] rounded-[12px] text-center space-y-[12px]">
                    <AlertTriangle className="text-[#ef4444]" size={36} />
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0f172a]">Gagal Memuat Data</h4>
                      <p className="text-[12.5px] text-[#64748b] mt-[2px] max-w-[400px]">{businessFetchError}</p>
                    </div>
                    <button
                      onClick={fetchBusinesses}
                      className="px-[16px] py-[8px] bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-[10px] font-bold text-[12.5px] transition-colors cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (() => {
                  // Filter logic
                  const filteredBusinesses = businesses.filter((b) => {
                    // Category filter
                    if (businessCategoryFilter !== "Semua" && b.category !== businessCategoryFilter) {
                      return false;
                    }
                    // Status filter
                    if (businessStatusFilter !== "Semua") {
                      const st = (b.status || "").toLowerCase();
                      if (businessStatusFilter === "active" && st !== "active" && st !== "aktif") return false;
                      if (businessStatusFilter === "pending" && st !== "pending" && st !== "menunggu") return false;
                      if (businessStatusFilter === "inactive" && st !== "inactive" && st !== "nonaktif") return false;
                    }
                    // Search query filter
                    if (businessSearch.trim()) {
                      const q = businessSearch.toLowerCase().trim();
                      const matchName = b.name?.toLowerCase().includes(q);
                      const matchOwner = b.owner?.toLowerCase().includes(q);
                      const matchCategory = b.category?.toLowerCase().includes(q);
                      const matchCity = b.city?.toLowerCase().includes(q);
                      return matchName || matchOwner || matchCategory || matchCity;
                    }
                    return true;
                  });

                  // Pagination slicing
                  const totalItems = filteredBusinesses.length;
                  const totalPages = Math.ceil(totalItems / businessItemsPerPage) || 1;
                  const safePage = Math.min(Math.max(1, businessCurrentPage), totalPages);
                  const startIndex = (safePage - 1) * businessItemsPerPage;
                  const endIndex = Math.min(startIndex + businessItemsPerPage, totalItems);
                  const currentItems = filteredBusinesses.slice(startIndex, endIndex);

                  return totalItems > 0 ? (
                    <div className="flex flex-col gap-[14px]">
                      {/* Table Area */}
                      <div className="overflow-x-auto border border-[#e2e8f0] rounded-[12px] shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[46px]">Foto</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Bisnis & Kategori</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Lokasi</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center">Produk</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center">Status</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Tanggal</th>
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {currentItems.map((biz) => {
                              const isActive = biz.status === "active" || biz.status === "Aktif";
                              const isPending = biz.status === "pending" || biz.status === "Menunggu";

                              return (
                                <tr key={biz.id} className="hover:bg-[#f8fafc] transition-colors">
                                  {/* Thumbnail Foto */}
                                  <td className="px-[14px] py-[12px]">
                                    <div className="w-[40px] h-[40px] rounded-[10px] overflow-hidden bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                                      {biz.image ? (
                                        <img
                                          src={biz.image}
                                          alt={biz.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                            if (e.currentTarget.nextElementSibling) {
                                              e.currentTarget.nextElementSibling.style.display = "flex";
                                            }
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className="w-full h-full flex items-center justify-center text-[#94a3b8] bg-[#f1f5f9]"
                                        style={{ display: biz.image ? "none" : "flex" }}
                                      >
                                        <Briefcase size={18} />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Nama Bisnis & Kategori */}
                                  <td className="px-[14px] py-[12px]">
                                    <div className="font-bold text-[13px] text-[#0f172a] truncate max-w-[240px]" title={biz.name}>
                                      {biz.name}
                                    </div>
                                    <div className="flex items-center gap-[6px] mt-[3px] flex-wrap">
                                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-[11px] font-semibold bg-[#f1f5f9] text-[#475569]">
                                        {biz.category}
                                      </span>
                                      {biz.subCategory && (
                                        <span className="text-[11px] text-[#94a3b8] truncate max-w-[140px]">
                                          · {biz.subCategory}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Lokasi */}
                                  <td className="px-[14px] py-[12px]">
                                    <span className="text-[12.5px] text-[#475569] flex items-center gap-[4px] truncate max-w-[150px]">
                                      <MapPin size={13} className="text-[#94a3b8] shrink-0" />
                                      {biz.city}
                                    </span>
                                  </td>

                                  {/* Produk */}
                                  <td className="px-[14px] py-[12px] text-center">
                                    <span className="inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-full text-[11.5px] font-bold bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1]">
                                      <Package size={12} />
                                      {biz.products?.length || 0} Item
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-[14px] py-[12px] text-center whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-[11px] font-bold ${
                                        isActive
                                          ? "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]"
                                          : isPending
                                          ? "bg-[#fefce8] text-[#a16207] border border-[#fef08a]"
                                          : "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]"
                                      }`}
                                    >
                                      <span
                                        className={`w-[6px] h-[6px] rounded-full ${
                                          isActive ? "bg-[#16a34a]" : isPending ? "bg-[#ca8a04]" : "bg-[#dc2626]"
                                        }`}
                                      />
                                      {isActive ? "Aktif" : isPending ? "Menunggu" : "Nonaktif"}
                                    </span>
                                  </td>

                                  {/* Tanggal */}
                                  <td className="px-[14px] py-[12px] text-[12px] text-[#64748b] whitespace-nowrap">
                                    {biz.date}
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="px-[14px] py-[12px] text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-[6px]">
                                      {/* View */}
                                      <button
                                        onClick={() => navigate(`/business/${biz.raw?.slug || biz.id}`)}
                                        className="w-[32px] h-[32px] rounded-[8px] bg-[#eff6ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Lihat Halaman Bisnis"
                                      >
                                        <Eye size={15} />
                                      </button>
                                      {/* Edit */}
                                      <button
                                        onClick={() => navigate(`/add-business/${biz.id}`)}
                                        className="w-[32px] h-[32px] rounded-[8px] bg-[#fefce8] text-[#ca8a04] hover:bg-[#ca8a04] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Edit Profil Bisnis"
                                      >
                                        <Edit size={15} />
                                      </button>
                                      {/* Manage Products */}
                                      <button
                                        onClick={() => navigate(`/add-product/${biz.id}`)}
                                        className="w-[32px] h-[32px] rounded-[8px] bg-[#f0fdfa] text-[#007570] hover:bg-[#007570] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Kelola Produk Bisnis"
                                      >
                                        <Package size={15} />
                                      </button>
                                      {/* Delete */}
                                      <button
                                        onClick={() => handleDeleteBusiness(biz.id)}
                                        className="w-[32px] h-[32px] rounded-[8px] bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Hapus Bisnis"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-[10px] pt-[8px] border-t border-[#f1f5f9]">
                        <span className="text-[12px] text-[#64748b]">
                          Menampilkan <span className="font-semibold text-[#0f172a]">{startIndex + 1}</span>–
                          <span className="font-semibold text-[#0f172a]">{endIndex}</span> dari{" "}
                          <span className="font-bold text-[#007570]">{totalItems}</span> bisnis
                        </span>

                        <div className="flex items-center gap-[5px]">
                          <button
                            onClick={() => setBusinessCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={15} />
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce((acc, p, i, arr) => {
                              if (i > 0 && arr[i - 1] !== p - 1) acc.push("...");
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((page, idx) =>
                              page === "..." ? (
                                <span key={`dots-${idx}`} className="w-[30px] h-[30px] flex items-center justify-center text-[12px] text-[#94a3b8]">…</span>
                              ) : (
                                <button
                                  key={page}
                                  onClick={() => setBusinessCurrentPage(page)}
                                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[7px] text-[12.5px] font-medium transition-colors cursor-pointer ${
                                    page === safePage
                                      ? "bg-[#007570] text-white"
                                      : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]"
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            )}

                          <button
                            onClick={() => setBusinessCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages || totalPages === 0}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors cursor-pointer"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="bg-[#fafafa] border border-dashed border-[#cbd5e1] rounded-[12px] py-[48px] px-[16px] flex flex-col items-center justify-center text-center space-y-[12px]">
                      <div className="w-[56px] h-[56px] rounded-full bg-[#f0fdfa] text-[#007570] flex items-center justify-center border border-[#ccfbf1]">
                        <Briefcase size={26} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#0f172a]">Belum Ada Bisnis</h3>
                        <p className="text-[12.5px] text-[#64748b] mt-[4px] max-w-[340px] leading-relaxed">
                          {businessSearch || businessCategoryFilter !== "Semua" || businessStatusFilter !== "Semua"
                            ? "Tidak ada bisnis yang cocok dengan kata kunci atau filter yang Anda pilih."
                            : "Anda belum mendaftarkan profil bisnis di portal Info.co.id."}
                        </p>
                      </div>
                      {businessSearch || businessCategoryFilter !== "Semua" || businessStatusFilter !== "Semua" ? (
                        <button
                          onClick={() => {
                            setBusinessSearch("");
                            setBusinessCategoryFilter("Semua");
                            setBusinessStatusFilter("Semua");
                            setBusinessCurrentPage(1);
                          }}
                          className="px-[16px] py-[8px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] rounded-[9px] font-semibold text-[12.5px] transition-colors cursor-pointer"
                        >
                          Reset Pencarian & Filter
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate("/add-business")}
                          className="inline-flex items-center gap-[6px] px-[18px] py-[9px] bg-[#007570] hover:bg-[#005f5b] text-white rounded-[10px] font-bold text-[12.5px] transition-colors cursor-pointer shadow-sm"
                        >
                          <Plus size={16} />
                          <span>Tambah Bisnis Pertama</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


          {/* 3. BLOG & EVENT COMBINED VIEW */}
          {activeTab === "blog-event" && (
            <div className="space-y-6 w-full max-w-full">
              {/* 1. COMPACT HERO BANNER CARD */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-emerald-50/40 border border-slate-200/70 p-6 md:p-7 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="z-10 max-w-xl space-y-1">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Blog & Event Saya
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-normal">
                    Kelola, pantau, dan bagikan cerita serta acara terbaik Anda untuk audiens yang lebih luas.
                  </p>
                </div>

                {/* Hero Banner Background Image / Illustration */}
                <div className="w-full md:w-[320px] h-28 md:h-24 rounded-xl overflow-hidden shrink-0 relative shadow-2xs border border-slate-200/50">
                  <img
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=300&fit=crop"
                    alt="Blog & Event Banner"
                    className="w-full h-full object-cover object-right"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-100/50 to-transparent md:block hidden" />
                </div>
              </div>

              {/* 2. MAIN CONTENT CARD (SEARCH, BUTTON, TABS, TABLE & PAGINATION) */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-6 w-full">
                {/* SEARCH BAR & BUAT BLOG BARU BUTTON IN ONE FULL-WIDTH ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  {/* Search input - fills all remaining space */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari artikel blog..."
                      value={blogSearch}
                      onChange={(e) => {
                        setBlogSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Buat Blog Baru Button - exact h-11 height matching search bar */}
                  <button
                    onClick={() => navigate("/add-blog?type=blog")}
                    className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 bg-[#007570] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-6 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Buat Blog Baru</span>
                  </button>
                </div>

                {/* FILTER TABS */}
                <div className="flex items-center gap-6 border-b border-slate-100 pb-0 overflow-x-auto text-xs sm:text-sm font-semibold">
                  {["Semua", "Blog", "Event", "Terbit", "Draft"].map((tab) => {
                    const isActive = filterTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setFilterTab(tab);
                          setCurrentPage(1);
                        }}
                        className={`transition-all whitespace-nowrap pb-3 -mb-[2px] cursor-pointer ${
                          isActive
                            ? "text-[#007570] border-b-2 border-[#007570] font-bold"
                            : "text-slate-400 hover:text-slate-700 font-medium border-b-2 border-transparent"
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                {/* DATA TABLE */}
                {loadingBlogs || loadingEvents ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="animate-spin text-[#007570]" size={40} />
                  </div>
                ) : (() => {
                  // Combined list of blogs + events
                  const combinedList = [
                    ...blogs.map((b) => ({ ...b, itemType: "blog" })),
                    ...events.map((e) => ({ ...e, itemType: "event" })),
                  ];

                  // Filter based on tab and search keyword
                  const filtered = combinedList.filter((item) => {
                    // Tab filter
                    if (filterTab === "Blog" && item.itemType !== "blog") return false;
                    if (filterTab === "Event" && item.itemType !== "event") return false;
                    if (filterTab === "Terbit" && item.status !== "published" && item.status !== "upcoming") return false;
                    if (filterTab === "Draft" && item.status !== "draft" && item.status !== "past") return false;

                    // Search filter
                    if (blogSearch) {
                      const q = blogSearch.toLowerCase();
                      const matchesTitle = item.title?.toLowerCase().includes(q);
                      const matchesCategory = item.category?.toLowerCase().includes(q);
                      const matchesAuthor = item.author?.toLowerCase().includes(q);
                      return matchesTitle || matchesCategory || matchesAuthor;
                    }
                    return true;
                  });

                  const totalItems = filtered.length;
                  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const currentData = filtered.slice(startIndex, startIndex + itemsPerPage);

                  // Helper for Category Badges matching mockup pastel colors
                  const getCategoryBadgeClass = (categoryName) => {
                    const cat = (categoryName || "").toLowerCase();
                    if (cat.includes("kuliner") || cat.includes("food")) return "bg-[#e6f4ea] text-[#137333]";
                    if (cat.includes("event") || cat.includes("acara")) return "bg-[#f3e8ff] text-[#7e22ce]";
                    if (cat.includes("tekno") || cat.includes("gadget")) return "bg-[#e0f2fe] text-[#0369a1]";
                    if (cat.includes("fashion") || cat.includes("style")) return "bg-[#fce7f3] text-[#be185d]";
                    if (cat.includes("pendidikan") || cat.includes("edu")) return "bg-[#e0f7fa] text-[#00838f]";
                    return "bg-[#e6f4ea] text-[#137333]";
                  };

                  return totalItems > 0 ? (
                    <div className="space-y-4 w-full">
                      <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full text-left border-collapse min-w-[768px]">
                            <thead>
                              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="py-3.5 px-4 w-14 text-center font-bold">NO</th>
                                <th className="py-3.5 px-4 w-28 font-bold">COVER</th>
                                <th className="py-3.5 px-4 font-bold text-slate-500">JUDUL</th>
                                <th className="py-3.5 px-4 w-36 font-bold">KATEGORI</th>
                                <th className="py-3.5 px-4 w-36 font-bold">PENULIS</th>
                                <th className="py-3.5 px-4 w-32 font-bold">TANGGAL</th>
                                <th className="py-3.5 px-4 w-28 font-bold">STATUS</th>
                                <th className="py-3.5 px-4 w-32 text-center font-bold">AKSI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentData.map((item, idx) => {
                                const rowNumber = startIndex + idx + 1;
                                const isPublished = item.status === "published" || item.status === "upcoming";

                                return (
                                  <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-50/60 transition-colors">
                                    {/* NO */}
                                    <td className="py-4 px-4 text-center text-xs font-bold text-slate-400 align-middle">
                                      {rowNumber}
                                    </td>

                                    {/* COVER */}
                                    <td className="py-4 px-4 align-middle">
                                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs flex items-center justify-center shrink-0">
                                        {item.thumbnail ? (
                                          <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.style.display = "none";
                                              if (e.currentTarget.nextElementSibling) {
                                                e.currentTarget.nextElementSibling.style.display = "flex";
                                              }
                                            }}
                                          />
                                        ) : null}
                                        <div
                                          className="w-full h-full items-center justify-center text-slate-400 bg-slate-50"
                                          style={{ display: item.thumbnail ? "none" : "flex" }}
                                        >
                                          {item.itemType === "event" ? <Calendar size={18} /> : <FileText size={18} />}
                                        </div>
                                      </div>
                                    </td>

                                    {/* JUDUL */}
                                    <td className="py-4 px-4 align-middle">
                                      <span
                                        className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug cursor-pointer hover:text-[#007570] transition-colors"
                                        onClick={() => navigate(`/blog/${item.id}`)}
                                        title={item.title}
                                      >
                                        {item.title}
                                      </span>
                                    </td>

                                    {/* KATEGORI */}
                                    <td className="py-4 px-4 align-middle">
                                      <span
                                        className={`px-3 py-1 rounded-md text-xs font-bold inline-block whitespace-nowrap ${getCategoryBadgeClass(
                                          item.category
                                        )}`}
                                      >
                                        {item.category}
                                      </span>
                                    </td>

                                    {/* PENULIS */}
                                    <td className="py-4 px-4 align-middle">
                                      <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
                                        {item.author || "satria nice"}
                                      </span>
                                    </td>

                                    {/* TANGGAL */}
                                    <td className="py-4 px-4 align-middle">
                                      <span className="text-xs sm:text-sm font-medium text-slate-400 whitespace-nowrap">
                                        {item.date}
                                      </span>
                                    </td>

                                    {/* STATUS */}
                                    <td className="py-4 px-4 align-middle">
                                      <span
                                        className={`px-3 py-1 rounded-md text-xs font-bold inline-block whitespace-nowrap ${
                                          isPublished
                                            ? "bg-[#e6f4ea] text-[#137333]"
                                            : "bg-[#fef7e0] text-[#b06000]"
                                        }`}
                                      >
                                        {isPublished ? "Terbit" : "Draft"}
                                      </span>
                                    </td>

                                    {/* AKSI */}
                                    <td className="py-4 px-4 align-middle">
                                      <div className="flex items-center justify-center gap-2">
                                        {/* View Button */}
                                        <button
                                          onClick={() => navigate(`/blog/${item.id}`)}
                                          title="Lihat"
                                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                          <Eye size={16} />
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                          onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                          title="Edit"
                                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                          <Edit size={16} />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                          onClick={() =>
                                            item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                          }
                                          title="Hapus"
                                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* PAGINATION FOOTER */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <div>
                          Menampilkan {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} dari {totalItems} data
                        </div>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1.5">
                          {/* Previous */}
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {/* Page Buttons */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                            const isCurrent = pageNum === currentPage;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-[#007570] text-white shadow-2xs"
                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          {/* Next */}
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>

                        {/* Items per page selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:border-[#007570] cursor-pointer"
                          >
                            <option value={5}>5 / halaman</option>
                            <option value={10}>10 / halaman</option>
                            <option value={25}>25 / halaman</option>
                            <option value={50}>50 / halaman</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400 space-y-3">
                      <Search className="mx-auto text-slate-300" size={40} />
                      <p className="text-xs font-medium text-slate-500">Tidak ada data artikel blog atau event yang ditemukan.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 4. INBOX VIEW */}
          {activeTab === "inbox" && (
            <div className="grid grid-cols-[300px_1fr] max-md:grid-cols-1 gap-[16px] h-[calc(100vh-160px)] max-md:h-auto">
              {/* Inbox List */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] flex flex-col overflow-hidden">
                <div className="p-[16px_18px] border-b border-[#e2e8f0]">
                  <h2 className="text-[15px] font-bold text-[#0f172a]">Kotak Masuk ({messages.filter((m) => m.unread).length})</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-[14px_16px] cursor-pointer border-b border-[#f1f5f9] transition-all duration-[280ms] hover:bg-[#f8fafc] ${selectedMessage?.id === msg.id ? "bg-[#f0fdfa]" : ""} ${msg.unread ? "border-l-[3px] border-l-[#007570]" : ""}`}
                      onClick={() => selectMessage(msg)}
                    >
                      <div className="flex justify-between items-center mb-[4px]">
                        <span className="text-[13px] font-semibold text-[#0f172a]">{msg.sender}</span>
                        <span className="text-[11px] text-[#64748b]">{msg.time}</span>
                      </div>
                      <div className="text-[12.5px] font-medium text-[#0f172a] mb-[3px]">{msg.subject}</div>
                      <div className="text-[11.5px] text-[#64748b] whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]">{msg.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inbox Details */}
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] flex flex-col overflow-hidden">
                {selectedMessage ? (
                  <>
                    <div className="p-[18px_22px] border-b border-[#e2e8f0]">
                      <div className="text-[16px] font-bold text-[#0f172a] mb-[12px]">{selectedMessage.subject}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[36px] h-[36px] rounded-full bg-[rgba(0,117,112,0.12)] text-[#007570] flex items-center justify-center text-[14px] font-bold">{selectedMessage.sender.charAt(0)}</div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#0f172a]">{selectedMessage.sender}</div>
                            <div className="text-[12px] text-[#64748b]">{selectedMessage.email}</div>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#64748b]">{selectedMessage.time}</div>
                      </div>
                    </div>
                    <div className="flex-1 p-[22px] text-[13.5px] leading-[1.7] text-[#0f172a] overflow-y-auto">
                      {selectedMessage.body.split("\n").map((para, i) => (
                        <p key={i} className="mb-[12px]">
                          {para}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-[10px] p-[14px_22px] border-t border-[#e2e8f0]">
                      <input type="text" className="flex-1 px-[14px] py-[9px] border border-[#e2e8f0] rounded-[8px] font-['Poppins',sans-serif] text-[13px] outline-none transition-all duration-[280ms] focus:border-[#007570]" placeholder={`Tulis balasan untuk ${selectedMessage.sender}...`} />
                      <button className="inline-flex items-center justify-center gap-[6px] px-[18px] py-[9px] rounded-[8px] bg-[#007570] text-white border-0 font-['Poppins',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-[280ms] hover:bg-[#005a58]">Kirim Balasan</button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-[12px] text-[#cbd5e1] p-[40px] text-center">
                    <Mail size={48} className="opacity-50 text-[#64748b]" />
                    <p className="text-[13px] text-[#64748b]">Pilih pesan dari menu kiri untuk membaca detail isi email.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. RESELLER VIEW */}
          {activeTab === "reseller" && (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-[12px] mb-[25px]">
                <div className="flex items-center gap-[8px] px-[14px] py-[8px] border border-[#e2e8f0] rounded-[8px] bg-white min-w-[260px] flex-1">
                  <Search size={18} className="text-[#64748b] shrink-0" />
                  <input type="text" className="border-none outline-none font-['Poppins',sans-serif] text-[13px] text-[#0f172a] bg-transparent flex-1 placeholder:text-[#94a3b8]" placeholder="Cari nama reseller atau wilayah..." />
                </div>
                <button className="inline-flex items-center justify-center gap-[6px] px-[18px] py-[9px] rounded-[8px] bg-[#007570] text-white border-0 font-['Poppins',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-[280ms] hover:bg-[#005a58]">
                  <Plus size={16} /> Tambah Reseller
                </button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px]">
                {resellers.map((reseller) => (
                  <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[22px_18px] text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-[280ms] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]" key={reseller.id}>
                    <img src={reseller.avatar} alt={reseller.name} className="w-[68px] h-[68px] rounded-full object-cover mb-[12px] border-[3px] border-[#f0fdfa] mx-auto" />
                    <div className="text-[14px] font-semibold text-[#0f172a] mb-[4px]">{reseller.name}</div>
                    <div className="flex items-center justify-center gap-[4px] text-[12px] text-[#64748b] mb-[14px]">
                      <MapPin size={14} className="text-[#94a3b8]" />
                      <span>{reseller.region}</span>
                    </div>
                    <div className="flex justify-center gap-[20px] mb-[16px]">
                      <div className="flex flex-col items-center gap-[2px]">
                        <span className="text-[15px] font-bold text-[#0f172a]">{reseller.sales}</span>
                        <span className="text-[11px] text-[#64748b]">Penjualan</span>
                      </div>
                      <div className="flex flex-col items-center gap-[2px]">
                        <span className="text-[15px] font-bold text-[#0f172a]">★ {reseller.rating}</span>
                        <span className="text-[11px] text-[#64748b]">Rating</span>
                      </div>
                    </div>
                    <button className="w-full inline-flex items-center justify-center gap-[6px] px-[16px] py-[9px] rounded-[8px] bg-transparent text-[#64748b] border border-[#e2e8f0] font-['Poppins',sans-serif] text-[13px] font-medium cursor-pointer transition-all duration-[280ms] hover:bg-[#f8fafc] hover:text-[#0f172a]">
                      Hubungi Agen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SIMPAN (BOOKMARKS) VIEW */}
          {activeTab === "simpan" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 z-10">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
                    <Bookmark className="text-[#5eead4]" size={24} />
                    Bookmark Tersimpan
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal">
                    Daftar bisnis, artikel blog, dan event yang Anda simpan dari portal Info.co.id.
                  </p>
                </div>
              </div>

              {/* Main Container Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-8">
                {(() => {
                  const savedBusinessesList = (savedItems || []).filter(item => item.itemType === "business" || item.type === "Bisnis");
                  const savedBlogsAndEventsList = (savedItems || []).filter(item => item.itemType === "blog" || item.itemType === "event" || item.type === "Blog" || item.type === "Event");

                  const perPage = 4;
                  const totalBizPages = Math.max(1, Math.ceil(savedBusinessesList.length / perPage));
                  const currentBizPage = Math.min(savedBizPage, totalBizPages);
                  const paginatedBizList = savedBusinessesList.slice((currentBizPage - 1) * perPage, currentBizPage * perPage);

                  const totalBlogPages = Math.max(1, Math.ceil(savedBlogsAndEventsList.length / perPage));
                  const currentBlogPage = Math.min(savedBlogPage, totalBlogPages);
                  const paginatedBlogList = savedBlogsAndEventsList.slice((currentBlogPage - 1) * perPage, currentBlogPage * perPage);

                  return (
                    <>
                      {/* ── 1. BUSINESS SECTION (TOP) ── */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#007570]" />
                            Business
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#007570] border border-teal-100">
                            {savedBusinessesList.length} Bisnis
                          </span>
                        </div>

                        {savedBusinessesList.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paginatedBizList.map((item) => (
                                <div
                                  key={`biz-saved-${item.id}`}
                                  className="group bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-teal-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-start gap-3.5 relative"
                                >
                                  {/* Image/Logo */}
                                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "flex"; }}
                                      />
                                    ) : null}
                                    <div className="w-full h-full items-center justify-center text-slate-400 bg-slate-100" style={{ display: item.image ? "none" : "flex" }}>
                                      <Briefcase size={22} />
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <h4 className="text-sm font-bold text-slate-900 truncate hover:text-[#007570] cursor-pointer transition-colors" onClick={() => navigate(`/business/${item.id}`)} title={item.title}>
                                        {item.title}
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-50 text-[#007570] border border-teal-100 shrink-0">
                                        Business
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                                      <span className="font-semibold text-slate-700">{item.category}</span>
                                      {item.subCategory && <span>› {item.subCategory}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium pt-1">
                                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                                        <MapPin size={12} className="shrink-0" />
                                        {item.city}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} className="shrink-0" />
                                        {item.date}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-col gap-1 shrink-0 ml-1">
                                    <button
                                      onClick={() => navigate(`/business/${item.id}`)}
                                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      title="Lihat Detail Business"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSavedItem(item)}
                                      className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      title="Hapus Bookmark"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Business Pagination Controls */}
                            {totalBizPages > 1 && (
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">
                                  Menampilkan {((currentBizPage - 1) * perPage) + 1} - {Math.min(currentBizPage * perPage, savedBusinessesList.length)} dari {savedBusinessesList.length} bisnis
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSavedBizPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentBizPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                  <span className="text-xs font-bold text-slate-700 px-2">
                                    {currentBizPage} / {totalBizPages}
                                  </span>
                                  <button
                                    onClick={() => setSavedBizPage(prev => Math.min(totalBizPages, prev + 1))}
                                    disabled={currentBizPage === totalBizPages}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2.5 bg-slate-50/60 border border-slate-200/80 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007570] flex items-center justify-center">
                              <Briefcase size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Belum ada business yang disimpan.</h4>
                              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                                Simpan bisnis favorit Anda di halaman utama atau halaman direktori untuk melihatnya di sini.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ── 2. BLOG & EVENT SECTION (BOTTOM) ── */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-purple-600" />
                            Blog & Event
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            {savedBlogsAndEventsList.length} Item
                          </span>
                        </div>

                        {savedBlogsAndEventsList.length > 0 ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {paginatedBlogList.map((item) => {
                                const isEvent = item.itemType === "event" || item.type === "Event";
                                return (
                                  <div
                                    key={`blog-saved-${item.id}`}
                                    className="group bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-start gap-3.5 relative"
                                  >
                                    {/* Thumbnail */}
                                    <div className="w-20 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                      {item.image ? (
                                        <img
                                          src={item.image}
                                          alt={item.title}
                                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                          onError={(e) => { e.currentTarget.style.display = "none"; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "flex"; }}
                                        />
                                      ) : null}
                                      <div className="w-full h-full items-center justify-center text-slate-400 bg-slate-100" style={{ display: item.image ? "none" : "flex" }}>
                                        {isEvent ? <Calendar size={22} /> : <FileText size={22} />}
                                      </div>
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <h4
                                          className="text-sm font-bold text-slate-900 truncate hover:text-[#007570] cursor-pointer transition-colors"
                                          onClick={() => navigate(`/blog/${item.blogId || item.id}`)}
                                          title={item.title}
                                        >
                                          {item.title}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${
                                          isEvent
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            : "bg-purple-50 text-purple-700 border border-purple-100"
                                        }`}>
                                          {isEvent ? "Event" : "Blog"}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                        {isEvent ? (
                                          <>
                                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                                              <Calendar size={12} className="text-emerald-600" />
                                              {item.eventDate || item.date}
                                            </span>
                                            {item.location && <span>• {item.location}</span>}
                                          </>
                                        ) : (
                                          <>
                                            <span className="font-semibold text-slate-700">{item.category}</span>
                                            <span>• {item.author}</span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1 pt-1">
                                        <Clock size={12} className="shrink-0" />
                                        {item.date}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-1 shrink-0 ml-1">
                                      <button
                                        onClick={() => navigate(`/blog/${item.blogId || item.id}`)}
                                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Lihat Artikel/Event"
                                      >
                                        <Eye size={15} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSavedItem(item)}
                                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Hapus Bookmark"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Blog & Event Pagination Controls */}
                            {totalBlogPages > 1 && (
                              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-500 font-medium">
                                  Menampilkan {((currentBlogPage - 1) * perPage) + 1} - {Math.min(currentBlogPage * perPage, savedBlogsAndEventsList.length)} dari {savedBlogsAndEventsList.length} item
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSavedBlogPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentBlogPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                  <span className="text-xs font-bold text-slate-700 px-2">
                                    {currentBlogPage} / {totalBlogPages}
                                  </span>
                                  <button
                                    onClick={() => setSavedBlogPage(prev => Math.min(totalBlogPages, prev + 1))}
                                    disabled={currentBlogPage === totalBlogPages}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                  >
                                    <ChevronRight size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-2.5 bg-slate-50/60 border border-slate-200/80 rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Belum ada blog atau event yang disimpan.</h4>
                              <p className="text-xs text-slate-500 mt-0.5 max-w-sm">
                                Tandai artikel blog atau acara event favorit Anda untuk menyimpannya di sini.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
            {/* 7. ULASAN VIEW */}
          {activeTab === "ulasan" && (() => {
            const REVIEWS_PER_PAGE = 8;

            // Build unique business list from reviews for filter dropdown
            const bizMap = {};
            reviews.forEach(r => {
              if (!bizMap[r.business_id]) {
                bizMap[r.business_id] = { id: r.business_id, name: r.businessName, logo: r.businessLogo, slug: r.businessSlug };
              }
            });
            const uniqueBusinesses = Object.values(bizMap);

            // Filter + sort newest first
            const filtered = (reviewsBusinessFilter === "all" ? reviews : reviews.filter(r => String(r.business_id) === reviewsBusinessFilter))
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Stats for selected filter
            const filteredAvg = filtered.length > 0
              ? (filtered.reduce((s, r) => s + (r.rating || 0), 0) / filtered.length).toFixed(1)
              : "0.0";

            const totalPages = Math.ceil(filtered.length / REVIEWS_PER_PAGE);
            const safePage = Math.min(reviewsCurrentPage, Math.max(1, totalPages));
            const pageStart = (safePage - 1) * REVIEWS_PER_PAGE;
            const pageEnd = pageStart + REVIEWS_PER_PAGE;
            const pageRows = filtered.slice(pageStart, pageEnd);

            // Star renderer helper
            const renderStars = (n) => Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} className={i < n ? "text-[#f59e0b]" : "text-[#d1d5db]"} fill={i < n ? "currentColor" : "none"} />
            ));

            return (
              <div className="flex flex-col gap-[18px]">
                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-3 gap-[14px]">
                  {/* Total all reviews */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef9c3] flex items-center justify-center shrink-0">
                      <Star size={18} className="text-[#ca8a04]" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-[#0f172a] leading-none">{reviews.length}</div>
                      <div className="text-[11px] text-[#64748b] mt-[2px]">Total Ulasan</div>
                    </div>
                  </div>
                  {/* Avg rating (filtered) */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#f0fdf4] flex items-center justify-center shrink-0">
                      <Star size={18} className="text-[#16a34a]" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-[#0f172a] leading-none flex items-baseline gap-[4px]">
                        {filteredAvg}
                        <span className="text-[11px] font-normal text-[#94a3b8]">/ 5</span>
                      </div>
                      <div className="text-[11px] text-[#64748b] mt-[2px]">
                        {reviewsBusinessFilter === "all" ? "Rata-rata Semua" : "Rata-rata Filter"}
                      </div>
                    </div>
                  </div>
                  {/* Unique businesses */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#eff6ff] flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-[#3b82f6]" />
                    </div>
                    <div>
                      <div className="text-[20px] font-bold text-[#0f172a] leading-none">{uniqueBusinesses.length}</div>
                      <div className="text-[11px] text-[#64748b] mt-[2px]">Bisnis Diulas</div>
                    </div>
                  </div>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[14px_18px] flex items-center gap-[12px] shadow-sm flex-wrap">
                  <div className="flex items-center gap-[7px] text-[12.5px] font-semibold text-[#374151] shrink-0">
                    <Search size={14} className="text-[#007570]" />
                    Filter Bisnis:
                  </div>
                  <div className="relative flex-1 min-w-[200px]">
                    <select
                      value={reviewsBusinessFilter}
                      onChange={e => { setReviewsBusinessFilter(e.target.value); setReviewsCurrentPage(1); }}
                      className="w-full appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-[9px] px-[12px] py-[7px] pr-[32px] text-[12.5px] text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#007570] cursor-pointer"
                    >
                      <option value="all">Semua Bisnis ({reviews.length} ulasan)</option>
                      {uniqueBusinesses.map(b => {
                        const bizReviews = reviews.filter(r => r.business_id === b.id);
                        const bizAvg = bizReviews.length > 0
                          ? (bizReviews.reduce((s, r) => s + r.rating, 0) / bizReviews.length).toFixed(1)
                          : "0.0";
                        return (
                          <option key={b.id} value={String(b.id)}>
                            {b.name} — {bizReviews.length} ulasan · ★ {bizAvg}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronRight size={14} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#94a3b8] rotate-90 pointer-events-none" />
                  </div>
                  {reviewsBusinessFilter !== "all" && (
                    <button
                      onClick={() => { setReviewsBusinessFilter("all"); setReviewsCurrentPage(1); }}
                      className="flex items-center gap-[5px] px-[10px] py-[6px] text-[11.5px] font-medium text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-[8px] transition-colors shrink-0"
                    >
                      <X size={12} /> Reset
                    </button>
                  )}
                  <span className="text-[11.5px] text-[#94a3b8] shrink-0">{filtered.length} ulasan ditemukan</span>
                </div>

                {/* ── Table ── */}
                {loadingReviews ? (
                  <div className="flex flex-col items-center justify-center py-[50px] gap-[10px] bg-white border border-[#e2e8f0] rounded-[13px]">
                    <Loader2 size={28} className="text-[#007570] animate-spin" />
                    <span className="text-[13px] text-[#64748b]">Memuat ulasan...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-[48px_24px] flex flex-col items-center justify-center text-center">
                    <div className="w-[60px] h-[60px] rounded-full bg-[#fef9c3] flex items-center justify-center mb-[14px]">
                      <Star size={26} className="text-[#ca8a04]" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#0f172a] mb-[5px]">
                      {reviewsBusinessFilter !== "all" ? "Tidak ada ulasan untuk bisnis ini" : "Belum Ada Ulasan"}
                    </h3>
                    <p className="text-[12.5px] text-[#64748b] max-w-[300px] leading-[1.6]">
                      {reviewsBusinessFilter !== "all"
                        ? "Coba pilih bisnis lain atau reset filter."
                        : "Belum ada ulasan yang diterima. Bagikan link bisnis ke pelanggan!"}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#e2e8f0] rounded-[13px] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                            <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[28px]">#</th>
                            <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Usaha</th>
                            <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[110px]">Rating</th>
                            <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Ulasan</th>
                            <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[110px]">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.map((rev, idx) => (
                            <tr key={rev.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors last:border-b-0">
                              {/* No */}
                              <td className="px-[14px] py-[12px] text-[12px] text-[#94a3b8] font-medium">
                                {pageStart + idx + 1}
                              </td>
                              {/* Bisnis */}
                              <td className="px-[14px] py-[12px]">
                                <div className="flex items-center gap-[10px]">
                                  {rev.businessLogo ? (
                                    <img src={rev.businessLogo} alt={rev.businessName} className="w-[34px] h-[34px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0" />
                                  ) : (
                                    <div className="w-[34px] h-[34px] rounded-[8px] bg-gradient-to-br from-[#007570] to-[#00a89e] flex items-center justify-center shrink-0">
                                      <Briefcase size={15} className="text-white" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-[12.5px] font-semibold text-[#0f172a] leading-tight">{rev.businessName}</div>
                                    {rev.businessSlug && (
                                      <Link to={`/business/${rev.businessSlug}`} className="text-[11px] text-[#007570] hover:underline flex items-center gap-[3px] mt-[1px]">
                                        <Eye size={10} /> Lihat
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {/* Rating */}
                              <td className="px-[14px] py-[12px]">
                                <div className="flex items-center gap-[3px]">
                                  {renderStars(rev.rating)}
                                  <span className="text-[11.5px] font-semibold text-[#374151] ml-[5px]">{rev.rating}</span>
                                </div>
                              </td>
                              {/* Ulasan */}
                              <td className="px-[14px] py-[12px] max-w-[320px]">
                                {rev.review ? (
                                  <span className="text-[12.5px] text-[#334155] leading-[1.55]" title={rev.review}>
                                    {rev.review.length > 100 ? rev.review.slice(0, 100) + "…" : rev.review}
                                  </span>
                                ) : (
                                  <span className="text-[12px] text-[#94a3b8] italic">—</span>
                                )}
                              </td>
                              {/* Tanggal */}
                              <td className="px-[14px] py-[12px]">
                                <span className="text-[12px] text-[#64748b] whitespace-nowrap">{rev.date}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Pagination inside card ── */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-[14px] py-[10px] border-t border-[#f1f5f9] bg-[#fafafa]">
                        <span className="text-[12px] text-[#64748b]">
                          {pageStart + 1}–{Math.min(pageEnd, filtered.length)} dari {filtered.length} ulasan
                        </span>
                        <div className="flex items-center gap-[5px]">
                          <button
                            disabled={safePage === 1}
                            onClick={() => setReviewsCurrentPage(p => p - 1)}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors"
                          >
                            <ChevronLeft size={15} />
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce((acc, p, i, arr) => {
                              if (i > 0 && arr[i - 1] !== p - 1) acc.push("...");
                              acc.push(p);
                              return acc;
                            }, [])
                            .map((p, i) =>
                              p === "..." ? (
                                <span key={`dot-${i}`} className="w-[30px] h-[30px] flex items-center justify-center text-[12px] text-[#94a3b8]">…</span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setReviewsCurrentPage(p)}
                                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[7px] text-[12.5px] font-medium transition-colors ${
                                    p === safePage ? "bg-[#007570] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]"
                                  }`}
                                >
                                  {p}
                                </button>
                              )
                            )}
                          <button
                            disabled={safePage === totalPages}
                            onClick={() => setReviewsCurrentPage(p => p + 1)}
                            className="w-[30px] h-[30px] flex items-center justify-center rounded-[7px] border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] disabled:opacity-35 transition-colors"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}


          {/* 8. PREMIUM VIEW */}
          {activeTab === "premium" && (
            <div className="flex flex-col gap-[24px] max-w-[1000px] mx-auto w-full">
              {/* Header Banner */}
              <div className="flex items-center gap-[16px] bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm">
                <Crown size={32} className="text-[#f59e0b] shrink-0" />
                <div>
                  <h2 className="text-[18px] font-bold text-[#0f172a]">Upgrade Usaha ke Premium</h2>
                  <p className="text-[13px] text-[#64748b]">Tingkatkan visibilitas dan nikmati fitur eksklusif untuk setiap usaha Anda</p>
                </div>
              </div>

              {/* Business Selector Card (Per Usaha) */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-sm flex flex-col gap-[8px]">
                <label className="text-[12px] font-bold text-[#0f172a] uppercase tracking-[0.4px]">
                  Pilih Usaha Yang Ingin Di-Upgrade *
                </label>
                {businesses && businesses.length > 0 ? (
                  <select
                    value={selectedUpgradeBusiness || (businesses[0]?.id || "")}
                    onChange={(e) => setSelectedUpgradeBusiness(e.target.value)}
                    className="w-full px-[14px] py-[10px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[13.5px] font-semibold text-[#0f172a] outline-none focus:border-[#007570] transition-all cursor-pointer"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.category || "Usaha"}) — {b.city || "Lokasi"} {b.is_premium ? "⭐ [Sudah Premium]" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-[12px_16px] bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-[12.5px] font-medium rounded-[10px]">
                    Anda belum memiliki usaha terdaftar. Silakan daftarkan usaha terlebih dahulu pada menu Bisnis sebelum melakukan upgrade.
                  </div>
                )}
              </div>

              {/* Dynamic Premium Plans Grid */}
              {loadingPremiumPlans ? (
                <div className="flex flex-col items-center justify-center py-[48px] gap-[12px] text-[#64748b]">
                  <Loader2 size={36} className="animate-spin text-[#007570]" />
                  <p className="text-[13px] font-medium">Memuat paket premium terbaru...</p>
                </div>
              ) : premiumPlans.length > 0 ? (
                <div className={`grid grid-cols-1 ${premiumPlans.length === 1 ? 'max-w-[480px] mx-auto w-full' : premiumPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-[20px]`}>
                  {premiumPlans.map((plan) => {
                    const isFree = Number(plan.price) === 0;
                    const isPopular = plan.priority_listing || plan.name.toLowerCase().includes("premium");
                    const formattedDuration = plan.formatted_duration || (
                      plan.duration_value
                        ? `${plan.duration_value} ${plan.duration_unit === 'day' || plan.duration_unit === 'hari' ? 'Hari' : plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`
                        : "1 Bulan"
                    );

                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-[16px] p-[28px] flex flex-col justify-between shadow-sm relative border-2 ${
                          isPopular ? "border-[#007570] shadow-md" : "border-[#e2e8f0]"
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-[12px] right-[24px] bg-[#007570] text-white text-[11px] font-bold px-[12px] py-[3px] rounded-full uppercase tracking-wider">
                            POPULER
                          </div>
                        )}
                        <div>
                          <h3 className="text-[18px] font-bold text-[#0f172a]">{plan.name}</h3>
                          <div className="text-[28px] font-extrabold text-[#007570] mt-[8px]">
                            {isFree ? "Rp 0" : `Rp ${Number(plan.price).toLocaleString("id-ID")}`}
                          </div>
                          <div className="text-[12px] text-[#64748b]">{isFree ? "selamanya" : `/ ${formattedDuration}`}</div>
                          {plan.description && (
                            <p className="text-[12px] text-[#64748b] mt-[4px] italic">{plan.description}</p>
                          )}

                          <ul className="flex flex-col gap-[10px] my-[24px] pt-[16px] border-t border-[#f1f5f9]">
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.can_add_map ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.can_add_map ? "" : "line-through text-[#94a3b8]"}>Integrasi Google Maps</span>
                            </li>
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.can_add_gallery ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.can_add_gallery ? "" : "line-through text-[#94a3b8]"}>Galeri Foto Profil</span>
                            </li>
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.can_add_video ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.can_add_video ? "" : "line-through text-[#94a3b8]"}>Embed Video Profil</span>
                            </li>
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.can_add_products !== false ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.can_add_products !== false ? "" : "line-through text-[#94a3b8]"}>Katalog Produk Usaha</span>
                            </li>
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.can_chat !== false ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.can_chat !== false ? "" : "line-through text-[#94a3b8]"}>Akses Chat & Kontak Direct</span>
                            </li>
                            <li className="flex items-center gap-[10px] text-[13px] text-[#0f172a]">
                              {plan.priority_listing ? <Check size={16} className="text-[#10b981] shrink-0" /> : <X size={16} className="text-[#ef4444] shrink-0" />}
                              <span className={plan.priority_listing ? "" : "line-through text-[#94a3b8]"}>Pencarian Prioritas & Badge Premium</span>
                            </li>
                          </ul>
                        </div>

                        {isFree ? (
                          <button className="w-full py-[12px] rounded-[10px] bg-[#f1f5f9] text-[#94a3b8] font-semibold text-[14px] cursor-not-allowed border-0" disabled>
                            Paket Dasar Saat Ini
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              const targetBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                              if (!targetBizId) {
                                alert("Silakan daftarkan atau pilih bisnis Anda terlebih dahulu.");
                                return;
                              }
                              const bizObj = businesses.find(b => String(b.id) === String(targetBizId));
                              try {
                                const res = await api.post('/subscriptions', {
                                  business_id: targetBizId,
                                  plan_id: plan.id,
                                });
                                alert(res.data?.message || `Usaha "${bizObj?.name}" berhasil di-upgrade ke paket ${plan.name}!`);
                                fetchBusinesses();
                              } catch (err) {
                                console.error("Subscription error:", err);
                                alert(err.response?.data?.message || "Gagal melakukan upgrade. Silakan coba lagi.");
                              }
                            }}
                            className="w-full py-[12px] rounded-[10px] bg-[#007570] text-white font-semibold text-[14px] cursor-pointer border-0 transition-all hover:bg-[#005a58] hover:shadow-md"
                          >
                            Upgrade {plan.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[40px] text-center shadow-sm flex flex-col items-center gap-[12px]">
                  <Crown size={40} className="text-[#94a3b8]" />
                  <div className="text-[14px] font-bold text-[#0f172a]">Belum Ada Paket Premium Aktif</div>
                  <p className="text-[12.5px] text-[#64748b] max-w-[360px]">
                    Saat ini belum ada paket premium yang diaktifkan oleh admin. Silakan periksa kembali nanti.
                  </p>
                </div>
              )}

              {/* Keuntungan Premium Info */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[28px] shadow-sm">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Keuntungan Memiliki Paket Premium</h3>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[20px] mt-[18px]">
                  <div className="flex items-start gap-[14px]">
                    <MessageSquare size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Chat via Inbox</h4>
                      <p className="text-[12.5px] text-[#64748b]">Komunikasi langsung dengan pelanggan melalui inbox</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <Phone size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">WhatsApp & Email</h4>
                      <p className="text-[12.5px] text-[#64748b]">Tampilkan kontak WA dan email untuk bisnis Anda</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <ImageIcon size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Galeri Foto</h4>
                      <p className="text-[12.5px] text-[#64748b]">Upload galeri foto untuk menampilkan produk</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <Video size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Link Video</h4>
                      <p className="text-[12.5px] text-[#64748b]">Embed video untuk promosi bisnis Anda</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. IKLAN VIEW */}
          {activeTab === "iklan" && (
            <div className="flex flex-col gap-[24px] max-w-[1000px] mx-auto">
              <div className="flex items-center gap-[16px] bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm">
                <Megaphone size={32} className="text-[#007570] shrink-0" />
                <div>
                  <h2 className="text-[18px] font-bold text-[#0f172a]">Pasang Iklan</h2>
                  <p className="text-[13px] text-[#64748b]">Promosikan bisnis Anda ke ribuan pengunjung</p>
                </div>
              </div>

              {/* Advertisement Submission Form */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[28px] shadow-sm flex flex-col gap-[20px]">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Ajukan Iklan Baru</h3>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[18px]">
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[13px] font-semibold text-[#334155]">Pilih Bisnis</label>
                    <select 
                      value={selectedBusinessForAd || ''} 
                      onChange={(e) => setSelectedBusinessForAd(e.target.value)}
                      className="w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
                    >
                      <option value="">-- Pilih Bisnis --</option>
                      {businesses.map(biz => (
                        <option key={biz.id} value={biz.id}>{biz.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[13px] font-semibold text-[#334155]">Pilih Paket</label>
                    <select 
                      value={selectedPackage || ''} 
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
                    >
                      <option value="">-- Pilih Paket --</option>
                      {adPackages.length > 0 ? (
                        adPackages.map(pkg => (
                          <option key={pkg.id} value={pkg.name}>
                            {pkg.name} - Rp {Number(pkg.price)?.toLocaleString('id-ID')} ({pkg.formatted_duration || `${pkg.duration_value} ${pkg.duration_unit}`})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Basic Iklan">Basic Iklan - Rp 50.000 (7 hari)</option>
                          <option value="Standard Iklan">Standard Iklan - Rp 150.000 (30 hari)</option>
                          <option value="Premium Iklan">Premium Iklan - Rp 350.000 (90 hari)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="col-span-2 flex flex-col gap-[6px]">
                    <label className="text-[13px] font-semibold text-[#334155]">Kode Kupon (Opsional)</label>
                    <div className="flex gap-[8px]">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Contoh: IKLAN20"
                        className="flex-1 uppercase px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none focus:border-[#007570]"
                      />
                      <button
                        type="button"
                        className="px-[16px] py-[11px] rounded-[10px] bg-transparent text-[#64748b] border border-[#e2e8f0] font-semibold text-[13px] cursor-pointer hover:bg-[#f8fafc] disabled:opacity-50"
                        onClick={handleValidateUserCoupon}
                        disabled={validatingCoupon || !couponCodeInput}
                      >
                        {validatingCoupon ? 'Memeriksa...' : 'Gunakan'}
                      </button>
                    </div>
                    {couponMsg && (
                      <p className={`text-[12px] mt-[4px] font-semibold ${appliedCouponInfo ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                        {couponMsg}
                      </p>
                    )}
                    {appliedCouponInfo && (
                      <div className="mt-[8px] p-[10px] rounded-[8px] bg-[#f0fdfa] border border-[#5eead4] text-[13px] flex flex-col gap-[4px]">
                        <div className="flex justify-between text-[#64748b]">
                          <span>Harga Normal:</span>
                          <span>Rp {appliedCouponInfo.original_amount?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-[#16a34a] font-bold">
                          <span>Diskon Kupon ({appliedCouponInfo.code}):</span>
                          <span>-Rp {appliedCouponInfo.discount_amount?.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-[#0f172a] font-bold border-t border-[#cbd5e1] pt-[4px] mt-[4px]">
                          <span>Total Pembayaran:</span>
                          <span>Rp {appliedCouponInfo.final_amount?.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rich Payment Methods Cards Selection */}
                  <div className="col-span-2 flex flex-col gap-[16px] border-t border-[#e2e8f0] pt-[18px] mt-[6px]">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0f172a] flex items-center gap-[8px]">
                        <CreditCard size={18} className="text-[#007570]" />
                        Pilihan Metode Pembayaran
                      </h4>
                      <p className="text-[12.5px] text-[#64748b] mt-[2px]">Pilih metode pembayaran yang Anda inginkan.</p>
                    </div>

                    {/* E-WALLET */}
                    <div className="flex flex-col gap-[8px]">
                      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">E-WALLET</span>
                      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[12px]">
                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'DANA' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('DANA')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#008ce5] text-white font-extrabold text-[11px] rounded-[6px]">DANA</span>
                            <span className="text-[13px] font-semibold text-[#0f172a]">DANA</span>
                          </div>
                          {selectedPaymentMethod === 'DANA' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>

                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'GoPay' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('GoPay')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#00a5cf] text-white font-extrabold text-[11px] rounded-[6px]">GoPay</span>
                            <span className="text-[13px] font-semibold text-[#0f172a]">GoPay</span>
                          </div>
                          {selectedPaymentMethod === 'GoPay' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>

                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'OVO' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('OVO')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#4c2a86] text-white font-extrabold text-[11px] rounded-[6px]">OVO</span>
                            <span className="text-[13px] font-semibold text-[#0f172a]">OVO</span>
                          </div>
                          {selectedPaymentMethod === 'OVO' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* VIRTUAL ACCOUNT / TRANSFER BANK */}
                    <div className="flex flex-col gap-[8px] mt-[4px]">
                      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#94a3b8]">VIRTUAL ACCOUNT / TRANSFER BANK</span>
                      <div className="grid grid-cols-3 max-md:grid-cols-1 gap-[12px]">
                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'BCA Virtual Account' || selectedPaymentMethod === 'Transfer Bank BCA' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('BCA Virtual Account')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#005caa] text-white font-extrabold text-[11px] rounded-[6px]">BCA</span>
                            <span className="text-[12.5px] font-semibold text-[#0f172a]">BCA Virtual Account</span>
                          </div>
                          {selectedPaymentMethod === 'BCA Virtual Account' || selectedPaymentMethod === 'Transfer Bank BCA' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>

                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'Mandiri Virtual Account' || selectedPaymentMethod === 'Transfer Bank Mandiri' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('Mandiri Virtual Account')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#003865] text-white font-extrabold text-[11px] rounded-[6px]">Mandiri</span>
                            <span className="text-[12.5px] font-semibold text-[#0f172a]">Mandiri Virtual Account</span>
                          </div>
                          {selectedPaymentMethod === 'Mandiri Virtual Account' || selectedPaymentMethod === 'Transfer Bank Mandiri' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>

                        <div 
                          className={`p-[12px_14px] rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${selectedPaymentMethod === 'BRI Virtual Account' || selectedPaymentMethod === 'Transfer Bank BRI' ? 'border-[#007570] bg-[#f0fdfa] shadow-[0_2px_8px_rgba(0,117,112,0.1)]' : 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'}`}
                          onClick={() => setSelectedPaymentMethod('BRI Virtual Account')}
                        >
                          <div className="flex items-center gap-[10px]">
                            <span className="px-[8px] py-[3px] bg-[#00529c] text-white font-extrabold text-[11px] rounded-[6px]">BRI</span>
                            <span className="text-[12.5px] font-semibold text-[#0f172a]">BRI Virtual Account</span>
                          </div>
                          {selectedPaymentMethod === 'BRI Virtual Account' || selectedPaymentMethod === 'Transfer Bank BRI' ? (
                            <CheckCircle size={18} className="text-[#007570]" />
                          ) : (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-[#cbd5e1]" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instruction Box */}
                    <div className="mt-[4px] p-[16px] rounded-[14px] bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-[10px]">
                      <div className="flex items-center gap-[8px] text-[#007570]">
                        <ShieldCheck size={18} />
                        <h5 className="text-[14px] font-bold text-[#0f172a]">
                          Instruksi Pembayaran {selectedPaymentMethod}
                        </h5>
                      </div>
                      <p className="text-[12.5px] text-[#64748b] -mt-[4px]">
                        Silakan lakukan transfer sebesar total tagihan ke rekening / Virtual Account berikut:
                      </p>

                      <div className="bg-white p-[14px] rounded-[12px] border border-[#cbd5e1] flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-[10px]">
                        <div className="flex flex-col gap-[2px]">
                          <span className="text-[12px] text-[#64748b]">Nomor Rekening / Virtual Account</span>
                          <span className="text-[18px] font-extrabold text-[#0f172a] tracking-[0.5px]">
                            {getPaymentNumber(selectedPaymentMethod)}
                          </span>
                          <span className="text-[12px] text-[#64748b]">a.n Info.co.id</span>
                        </div>
                        <button
                          type="button"
                          className="flex items-center gap-[6px] px-[16px] py-[8px] bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] rounded-[8px] text-[12.5px] font-semibold cursor-pointer hover:bg-[#e2e8f0] transition-all"
                          onClick={() => {
                            navigator.clipboard.writeText(getPaymentNumber(selectedPaymentMethod));
                            setCopyToast(true);
                            setTimeout(() => setCopyToast(false), 2000);
                          }}
                        >
                          <Copy size={14} />
                          {copyToast ? 'Tersalin!' : 'Salin No'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[13px] font-semibold text-[#334155]">Upload Bukti Pembayaran (Opsional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAdPaymentProofFile(file);
                          setAdPaymentProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-[13px] text-[#475569] file:mr-[12px] file:py-[8px] file:px-[14px] file:rounded-[8px] file:border-0 file:text-[12.5px] file:font-semibold file:bg-[#f1f5f9] file:text-[#007570] hover:file:bg-[#e2e8f0] cursor-pointer"
                    />
                    {adPaymentProofPreview && (
                      <div className="relative mt-[6px] w-[100px] h-[100px] rounded-[8px] overflow-hidden border border-[#cbd5e1]">
                        <img src={adPaymentProofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-[4px] right-[4px] bg-[#dc2626] text-white rounded-full p-[2px] cursor-pointer border-0"
                          onClick={() => {
                            setAdPaymentProofFile(null);
                            setAdPaymentProofPreview(null);
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rincian Total Keseluruhan Pembayaran */}
                  <div className="col-span-2 bg-[#f8fafc] border border-[#cbd5e1] rounded-[16px] p-[20px] flex flex-col gap-[12px] shadow-sm mt-[6px]">
                    <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-[10px]">
                      <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-[6px]">
                        <FileText size={18} className="text-[#007570]" />
                        Rincian Total Keseluruhan Pembayaran
                      </span>
                      {appliedCouponInfo && (
                        <span className="px-[10px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-full text-[11px] font-bold">
                          KUPON TERPASANG: {appliedCouponInfo.code}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-[6px] text-[13px]">
                      <div className="flex justify-between text-[#64748b]">
                        <span>Harga Paket ({selectedPackage || 'Belum Dipilih'}):</span>
                        <span className="font-semibold text-[#0f172a]">
                          Rp {getSelectedPackagePrice()?.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {appliedCouponInfo && (
                        <div className="flex justify-between text-[#16a34a] font-semibold">
                          <span>Diskon Kupon ({appliedCouponInfo.code}):</span>
                          <span>-Rp {Number(appliedCouponInfo.discount_amount)?.toLocaleString('id-ID')}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[15px] font-extrabold text-[#007570] border-t border-[#cbd5e1] pt-[10px] mt-[4px]">
                        <span>Total Keseluruhan Yang Harus Dibayar:</span>
                        <span className="text-[20px] text-[#007570]">
                          Rp {getFinalPrice()?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  className="inline-flex items-center justify-center gap-[6px] px-[24px] py-[12px] rounded-[10px] bg-[#007570] text-white font-semibold text-[14px] cursor-pointer hover:bg-[#005a58] disabled:opacity-50 border-0 self-start" 
                  onClick={handleAdSubmit}
                  disabled={submittingAd}
                >
                  {submittingAd ? 'Mengajukan...' : 'Ajukan Iklan'}
                </button>
              </div>

              {/* Existing Advertisements */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[28px] shadow-sm flex flex-col gap-[20px]">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Iklan Saya</h3>
                {loadingAdvertisements ? (
                  <div className="flex flex-col items-center justify-center p-[40px] gap-[12px] text-[#64748b]">
                    <Loader2 size={32} className="animate-spin text-[#007570]" />
                    <p className="text-[13px]">Memuat iklan...</p>
                  </div>
                ) : advertisements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-[40px] gap-[12px] text-[#94a3b8]">
                    <Megaphone size={48} className="opacity-50" />
                    <p className="text-[13px]">Belum ada iklan yang diajukan</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-[14px]">
                    {advertisements.map(ad => (
                      <div key={ad.id} className="border border-[#e2e8f0] rounded-[12px] p-[20px] flex flex-col gap-[14px] bg-[#fafbff]">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-[15px] font-semibold text-[#0f172a]">{ad.business?.name || 'Bisnis'}</h4>
                            <div className="flex gap-[6px] mt-[4px]">
                              <span className={`inline-block px-[10px] py-[2px] rounded-full text-[11px] font-semibold ${ad.status === 'active' || ad.status === 'approved' ? 'bg-[#dcfce7] text-[#16a34a]' : ad.status === 'pending' ? 'bg-[#fef9c3] text-[#ca8a04]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>{ad.status}</span>
                              <span className={`inline-block px-[10px] py-[2px] rounded-full text-[11px] font-semibold ${ad.payment_status === 'paid' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#dc2626]'}`}>{ad.payment_status}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[12px] font-medium text-[#64748b]">{ad.package_name}</span>
                            <span className="text-[15px] font-bold text-[#007570]">Rp {ad.price?.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex flex-wrap gap-[16px] text-[12.5px] text-[#64748b]">
                            <div className="flex items-center gap-[4px]">
                              <span>Durasi:</span>
                              <span className="font-semibold text-[#0f172a]">{ad.duration_days} hari</span>
                            </div>
                            {ad.start_date && (
                              <div className="flex items-center gap-[4px]">
                                <span>Mulai:</span>
                                <span className="font-semibold text-[#0f172a]">{new Date(ad.start_date).toLocaleDateString('id-ID')}</span>
                              </div>
                            )}
                            {ad.end_date && (
                              <div className="flex items-center gap-[4px]">
                                <span>Selesai:</span>
                                <span className="font-semibold text-[#0f172a]">{new Date(ad.end_date).toLocaleDateString('id-ID')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-[16px] text-[12.5px] text-[#64748b] border-t border-[#f1f5f9] pt-[10px]">
                          <div className="flex items-center gap-[4px]">
                            <span>Pembayaran:</span>
                            <span className="font-semibold text-[#0f172a]">{ad.payment_method || 'Transfer Bank'}</span>
                          </div>
                          {ad.discount_amount > 0 && (
                            <div className="flex items-center gap-[4px] text-[#16a34a]">
                              <span>Hemat Kupon:</span>
                              <span className="font-bold">-Rp {Number(ad.discount_amount)?.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          {ad.payment_proof && (
                            <div className="flex items-center gap-[6px]">
                              <span>Bukti Transfer:</span>
                              <button
                                type="button"
                                className="text-[#007570] font-semibold underline bg-transparent border-0 cursor-pointer text-[12.5px]"
                                onClick={() => window.open(ad.payment_proof, '_blank')}
                              >
                                Lihat Bukti
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-[8px] flex-wrap">
                          {ad.payment_status === 'unpaid' && (
                            <button 
                              className="px-[16px] py-[8px] rounded-[8px] bg-[#007570] text-white font-semibold text-[13px] cursor-pointer hover:bg-[#005a58] border-0 flex items-center gap-[4px]"
                              onClick={() => {
                                setPayModalAd(ad);
                                setAdPaymentProofFile(null);
                                setAdPaymentProofPreview(null);
                              }}
                            >
                              <CheckCircle size={14} />
                              Bayar / Upload Bukti
                            </button>
                          )}
                          {ad.status === 'pending' && (
                            <button
                              className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#334155] font-semibold text-[13px] cursor-pointer hover:bg-[#e2e8f0] border-0 flex items-center gap-[4px]"
                              onClick={() => handleEditAd(ad)}
                            >
                              <Edit size={14} />
                              Edit Iklan
                            </button>
                          )}
                          {ad.status === 'pending' && (
                            <button 
                              className="px-[16px] py-[8px] rounded-[8px] bg-[#fee2e2] text-[#dc2626] font-semibold text-[13px] cursor-pointer hover:bg-[#dc2626] hover:text-white border-0 flex items-center gap-[4px]"
                              onClick={() => handleAdCancel(ad.id)}
                            >
                              <Trash2 size={14} />
                              Batalkan / Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[28px] shadow-sm">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Keuntungan Beriklan</h3>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[20px] mt-[18px]">
                  <div className="flex items-start gap-[14px]">
                    <Eye size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Visibilitas Tinggi</h4>
                      <p className="text-[12.5px] text-[#64748b]">Bisnis Anda tampil di halaman utama dengan posisi strategis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <Target size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Target Tepat</h4>
                      <p className="text-[12.5px] text-[#64748b]">Menjangkau audiens yang relevan dengan bisnis Anda</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <TrendingUp size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Traffic Meningkat</h4>
                      <p className="text-[12.5px] text-[#64748b]">Tingkatkan kunjungan dan potensi konversi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <BarChart size={24} className="text-[#007570] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Laporan Detail</h4>
                      <p className="text-[12.5px] text-[#64748b]">Pantau performa iklan dengan statistik lengkap</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment & Upload Proof Modal */}
              {payModalAd && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4" onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}>
                  <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 my-8 text-left relative" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-[14px]">
                      <h3 className="text-[16px] font-bold text-[#0f172a]">Pembayaran Iklan</h3>
                      <button 
                        onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}
                        className="bg-transparent border-0 cursor-pointer text-[#64748b] hover:text-[#0f172a]"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="bg-[#f8fafc] rounded-[10px] p-[14px] flex flex-col gap-[6px] border border-[#e2e8f0] text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Bisnis:</span>
                        <span className="font-semibold text-[#0f172a]">{payModalAd.business?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Paket:</span>
                        <span className="font-semibold text-[#0f172a]">{payModalAd.package_name}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[14px] text-[#007570] border-t border-[#e2e8f0] pt-[6px] mt-[4px]">
                        <span>Total Tagihan:</span>
                        <span>Rp {Number(payModalAd.price)?.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[10px]">
                      <label className="text-[13px] font-semibold text-[#334155]">Pilih Metode Pembayaran</label>
                      <div className="grid grid-cols-2 gap-[8px]">
                        <div 
                          className={`p-[10px_12px] rounded-[10px] border cursor-pointer flex items-center justify-between text-[12px] ${selectedPaymentMethod === 'DANA' ? 'border-[#007570] bg-[#f0fdfa]' : 'border-[#e2e8f0]'}`}
                          onClick={() => setSelectedPaymentMethod('DANA')}
                        >
                          <span className="font-semibold text-[#0f172a]">DANA</span>
                          {selectedPaymentMethod === 'DANA' && <CheckCircle size={14} className="text-[#007570]" />}
                        </div>
                        <div 
                          className={`p-[10px_12px] rounded-[10px] border cursor-pointer flex items-center justify-between text-[12px] ${selectedPaymentMethod === 'GoPay' ? 'border-[#007570] bg-[#f0fdfa]' : 'border-[#e2e8f0]'}`}
                          onClick={() => setSelectedPaymentMethod('GoPay')}
                        >
                          <span className="font-semibold text-[#0f172a]">GoPay</span>
                          {selectedPaymentMethod === 'GoPay' && <CheckCircle size={14} className="text-[#007570]" />}
                        </div>
                        <div 
                          className={`p-[10px_12px] rounded-[10px] border cursor-pointer flex items-center justify-between text-[12px] ${selectedPaymentMethod === 'BCA Virtual Account' ? 'border-[#007570] bg-[#f0fdfa]' : 'border-[#e2e8f0]'}`}
                          onClick={() => setSelectedPaymentMethod('BCA Virtual Account')}
                        >
                          <span className="font-semibold text-[#0f172a]">BCA Virtual Account</span>
                          {selectedPaymentMethod === 'BCA Virtual Account' && <CheckCircle size={14} className="text-[#007570]" />}
                        </div>
                        <div 
                          className={`p-[10px_12px] rounded-[10px] border cursor-pointer flex items-center justify-between text-[12px] ${selectedPaymentMethod === 'Mandiri Virtual Account' ? 'border-[#007570] bg-[#f0fdfa]' : 'border-[#e2e8f0]'}`}
                          onClick={() => setSelectedPaymentMethod('Mandiri Virtual Account')}
                        >
                          <span className="font-semibold text-[#0f172a]">Mandiri Virtual Account</span>
                          {selectedPaymentMethod === 'Mandiri Virtual Account' && <CheckCircle size={14} className="text-[#007570]" />}
                        </div>
                      </div>

                      <div className="p-[12px] rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] text-[12px] flex flex-col gap-[4px] mt-[4px]">
                        <span className="text-[#64748b]">Transfer ke {selectedPaymentMethod}:</span>
                        <div className="flex justify-between items-center font-bold text-[#0f172a]">
                          <span>{getPaymentNumber(selectedPaymentMethod)} (a.n Info.co.id)</span>
                          <button
                            type="button"
                            className="px-[8px] py-[3px] bg-[#f1f5f9] text-[#007570] border border-[#cbd5e1] rounded text-[11px] cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(getPaymentNumber(selectedPaymentMethod));
                              setCopyToast(true);
                              setTimeout(() => setCopyToast(false), 2000);
                            }}
                          >
                            {copyToast ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[13px] font-semibold text-[#334155]">Upload Bukti Pembayaran</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setAdPaymentProofFile(file);
                            setAdPaymentProofPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="w-full text-[13px] text-[#475569] file:mr-[12px] file:py-[8px] file:px-[14px] file:rounded-[8px] file:border-0 file:text-[12.5px] file:font-semibold file:bg-[#f1f5f9] file:text-[#007570] hover:file:bg-[#e2e8f0] cursor-pointer"
                      />
                      {adPaymentProofPreview && (
                        <div className="relative mt-[6px] w-[120px] h-[120px] rounded-[8px] overflow-hidden border border-[#cbd5e1]">
                          <img src={adPaymentProofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-[10px] pt-[10px] border-t border-[#e2e8f0]">
                      <button
                        className="px-[16px] py-[10px] rounded-[10px] bg-[#f1f5f9] text-[#475569] font-semibold text-[13px] border-0 cursor-pointer hover:bg-[#e2e8f0]"
                        onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}
                      >
                        Batal
                      </button>
                      <button
                        className="px-[20px] py-[10px] rounded-[10px] bg-[#007570] text-white font-semibold text-[13px] border-0 cursor-pointer hover:bg-[#005a58] disabled:opacity-50"
                        onClick={handleAdPaymentSubmit}
                        disabled={submittingPayment}
                      >
                        {submittingPayment ? 'Mengirim...' : 'Kirim Pembayaran'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Advertisement Modal */}
          {editingAd && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto" onClick={handleCloseEditAdModal}>
              <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 my-8 text-left" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit size={18} className="text-[#007570]" />
                    Edit Iklan ({editingAd.business?.name})
                  </h3>
                  <button onClick={handleCloseEditAdModal} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateAd} className="space-y-4">
                  {editingAd.payment_status === 'unpaid' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">Ubah Paket Iklan</label>
                      <select
                        value={editAdForm.package_name}
                        onChange={(e) => setEditAdForm(prev => ({ ...prev, package_name: e.target.value }))}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570]"
                      >
                        <option value="basic">Basic - Rp 50.000 (7 hari)</option>
                        <option value="standard">Standard - Rp 150.000 (30 hari)</option>
                        <option value="premium">Premium - Rp 350.000 (90 hari)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">Catatan untuk Admin</label>
                    <textarea
                      rows={3}
                      value={editAdForm.notes}
                      onChange={(e) => setEditAdForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Catatan atau permintaan khusus iklan..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCloseEditAdModal}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={updatingAd}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {updatingAd ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 10. PRODUK VIEW */}
          {activeTab === "produk" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 z-10">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
                    <Package className="text-[#5eead4]" size={24} />
                    Manajemen Produk
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal">
                    Kelola daftar produk dan jasa untuk bisnis Anda. Atur nama, harga, dan deskripsi produk agar menarik minat calon pembeli.
                  </p>
                </div>
              </div>

              {/* Main Container Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                {/* Business Selector Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                    <Briefcase size={16} className="text-[#007570]" />
                    Pilih Bisnis:
                  </label>
                  <select
                    value={selectedBusinessForProducts || ""}
                    onChange={(e) => setSelectedBusinessForProducts(e.target.value)}
                    className="w-full sm:flex-1 h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Pilih Bisnis --</option>
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedBusinessForProducts ? (
                  <>
                    {/* Controls Bar: Search & Add Product Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder="Cari nama produk..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                        />
                      </div>
                      <button
                        className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 bg-[#007570] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => navigate(`/add-product/${selectedBusinessForProducts}`)}
                        disabled={!selectedBusinessForProducts}
                      >
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Tambah Produk</span>
                      </button>
                    </div>

                    {/* Loading State */}
                    {loadingProducts ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-[#007570]" size={42} />
                        <p className="text-xs font-semibold text-slate-500">Memuat data produk...</p>
                      </div>
                    ) : products && products.length > 0 ? (
                      (() => {
                        const filtered = products.filter(p =>
                          !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
                        );
                        return filtered.length > 0 ? (
                          <div className="space-y-4">
                            {/* Product Summary Header */}
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                              <span>Menampilkan <strong className="text-slate-900 font-bold">{filtered.length}</strong> produk</span>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                              {filtered.map((product) => (
                                <div
                                  key={product.id}
                                  className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                >
                                  {/* Image Container */}
                                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                                    <img
                                      src={product.image ? getStorageUrl(product.image) : "https://via.placeholder.com/200"}
                                      alt={product.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/200"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  </div>

                                  {/* Content */}
                                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#007570] transition-colors" title={product.name}>
                                        {product.name}
                                      </h4>
                                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                                        {product.description || "-"}
                                      </p>
                                    </div>

                                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Harga</span>
                                        <p className="text-sm font-black text-[#007570]">
                                          {product.price != null
                                            ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                                            : "-"}
                                        </p>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          title="Edit Produk"
                                          onClick={() => handleEditProduct(product)}
                                        >
                                          <Edit size={15} />
                                        </button>
                                        <button
                                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          title="Hapus Produk"
                                          onClick={() => handleDeleteProduct(product.id)}
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                              <Search size={28} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Produk Tidak Ditemukan</h4>
                              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                Tidak ada produk yang cocok dengan kata kunci "{productSearch}".
                              </p>
                            </div>
                            <button
                              onClick={() => setProductSearch("")}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Reset Pencarian
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#007570] flex items-center justify-center">
                          <Package size={32} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Belum Ada Produk</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Bisnis ini belum memiliki produk terdaftar di katalog.
                          </p>
                        </div>
                        <button
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007570] hover:bg-[#005f5b] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                          onClick={() => navigate(`/add-product/${selectedBusinessForProducts}`)}
                        >
                          <Plus size={16} />
                          <span>Tambah Produk Pertama</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Briefcase size={32} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Pilih Bisnis Terlebih Dahulu</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Silakan pilih salah satu bisnis pada dropdown di atas untuk mengelola katalog produknya.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11. PROFILE VIEW */}
          {activeTab === "profile" && (
            <div className="w-full max-w-[900px] mx-auto">
              {loadingProfile ? (
                <div className="flex flex-col items-center justify-center p-[80px_20px] gap-[16px] text-[#64748b] text-[14px] font-medium">
                  <Loader2 size={36} className="animate-spin text-[#007570]" />
                  <p>Memuat data profil...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-[24px]">
                  {/* Banner & Avatar Header Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-visible relative">
                    {/* Banner Image / Gradient Container */}
                    <div className="relative w-full h-[200px] max-md:h-[160px] max-sm:h-[130px] rounded-t-2xl bg-gradient-to-r from-[#007570] via-[#00a8a2] to-[#0f766e] overflow-hidden">
                      {bannerPreview ? (
                        <img
                          src={bannerPreview}
                          alt="Banner Profil"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex flex-col items-center justify-center text-white/70 gap-2 text-sm font-medium"
                        style={{ display: bannerPreview ? "none" : "flex" }}
                      >
                        <ImageIcon size={32} />
                        <span>Belum Ada Banner</span>
                      </div>

                      {/* Banner Action Button (Direct File Trigger) */}
                      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white border border-white/30 text-xs font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-900/90 hover:border-white/60 hover:-translate-y-0.5 shadow-sm"
                          onClick={() => document.getElementById("admin-banner-input").click()}
                          title="Ubah Banner"
                        >
                          <Camera size={15} />
                          <span>Ubah Banner</span>
                        </button>
                        {bannerPreview && bannerPreview !== DEFAULT_BANNER && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 backdrop-blur-md text-white border border-rose-400/40 text-xs font-semibold cursor-pointer transition-all hover:bg-rose-700 shadow-sm"
                            onClick={handleRemoveBanner}
                            title="Hapus Banner"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <input
                          id="admin-banner-input"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          hidden
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleBannerUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Avatar & User Details Row */}
                    <div className="flex items-end gap-6 max-md:gap-4 max-sm:flex-col max-sm:items-start px-7 max-md:px-5 pb-6 max-md:pb-5 -mt-12 max-md:-mt-10 relative z-10">
                      {/* Avatar Thumbnail */}
                      <div className="relative shrink-0 group">
                        <img
                          src={photoPreview || DEFAULT_AVATAR}
                          alt="Avatar"
                          className="w-[115px] h-[115px] max-md:w-[95px] max-md:h-[95px] rounded-full object-cover border-4 border-white shadow-md bg-white"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                        {/* Trigger Photo Modal */}
                        <button
                          type="button"
                          className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#007570] text-white border-2 border-white flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md hover:bg-[#005a58] hover:scale-105 active:scale-95"
                          onClick={() => setShowPhotoModal(true)}
                          title="Ganti Foto Profil"
                        >
                          <Camera size={16} />
                        </button>
                        <input
                          id="admin-photo-input"
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          hidden
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handlePhotoUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </div>

                      {/* User Info & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-3 w-full mb-1">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl max-md:text-lg font-extrabold text-slate-900 leading-tight">
                            {profileData.name || "Nama Pengguna"}
                          </h2>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              @{profileData.username || "username"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-[#007570] border border-teal-100">
                              {profileData.role || "User"}
                            </span>
                          </div>
                        </div>

                        {/* Quick Photo Upload & Delete Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-[#007570] hover:bg-[#007570] hover:text-white border border-teal-200/80 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                            onClick={() => setShowPhotoModal(true)}
                          >
                            <Camera size={14} />
                            <span>Ganti Foto</span>
                          </button>
                          {photoPreview && photoPreview !== DEFAULT_AVATAR && (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200/80 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              onClick={handleRemovePhoto}
                              title="Hapus Foto"
                            >
                              <Trash2 size={14} />
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Form Card */}
                  <div className="bg-white rounded-[16px] border border-[#e2e8f0] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-[28px] max-md:p-[20px]">
                    <div className="mb-[24px] pb-[16px] border-b border-[#e2e8f0]">
                      <h3 className="text-[17px] font-bold text-[#0f172a] mb-[4px]">Edit Profil & Informasi Diri</h3>
                      <p className="text-[13px] text-[#64748b]">Perbarui data informasi akun dan kontak Anda secara berkala</p>
                    </div>

                    {/* Backend Success/Error Alerts */}
                    {profileSuccessMsg && (
                      <div className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[10px] text-[13.5px] font-medium mb-[20px] bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                        <CheckCircle size={18} />
                        <span>{profileSuccessMsg}</span>
                        <button type="button" className="ml-auto bg-none border-none text-current cursor-pointer opacity-70 flex items-center hover:opacity-100" onClick={() => setProfileSuccessMsg("")}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {profileErrorMsg && (
                      <div className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[10px] text-[13.5px] font-medium mb-[20px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b]">
                        <AlertTriangle size={18} />
                        <span>{profileErrorMsg}</span>
                        <button type="button" className="ml-auto bg-none border-none text-current cursor-pointer opacity-70 flex items-center hover:opacity-100" onClick={() => setProfileErrorMsg("")}>
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-[24px]">
                      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[20px]">
                        {/* Nama Lengkap */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-name" className="text-[13px] font-semibold text-[#334155]">
                            Nama Lengkap <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="text"
                            id="profile-name"
                            value={profileData.name}
                            onChange={(e) => {
                              setProfileData({ ...profileData, name: e.target.value });
                              if (profileValidationErrors.name) {
                                setProfileValidationErrors({ ...profileValidationErrors, name: null });
                              }
                            }}
                            placeholder="Masukkan nama lengkap"
                            className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.name ? "border-[#ef4444]" : ""}`}
                            required
                          />
                          {profileValidationErrors.name && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.name[0]}</span>
                          )}
                        </div>

                        {/* Username */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-username" className="text-[13px] font-semibold text-[#334155]">
                            Username <span className="text-[#ef4444]">*</span>
                          </label>
                          <div className="flex items-center relative">
                            <span className="absolute left-[14px] text-[14px] font-semibold text-[#64748b] pointer-events-none">@</span>
                            <input
                              type="text"
                              id="profile-username"
                              value={profileData.username}
                              onChange={(e) => {
                                setProfileData({ ...profileData, username: e.target.value.replace(/^@/, "") });
                                if (profileValidationErrors.username) {
                                  setProfileValidationErrors({ ...profileValidationErrors, username: null });
                                }
                              }}
                              placeholder="username"
                              className={`w-full pl-[30px] pr-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.username ? "border-[#ef4444]" : ""}`}
                              required
                            />
                          </div>
                          {profileValidationErrors.username && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.username[0]}</span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-email" className="text-[13px] font-semibold text-[#334155]">
                            Email <span className="text-[#ef4444]">*</span>
                          </label>
                          <input
                            type="email"
                            id="profile-email"
                            value={profileData.email}
                            onChange={(e) => {
                              setProfileData({ ...profileData, email: e.target.value });
                              if (profileValidationErrors.email) {
                                setProfileValidationErrors({ ...profileValidationErrors, email: null });
                              }
                            }}
                            placeholder="email@example.com"
                            className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.email ? "border-[#ef4444]" : ""}`}
                            required
                          />
                          {profileValidationErrors.email && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.email[0]}</span>
                          )}
                        </div>

                        {/* No. Handphone */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-phone" className="text-[13px] font-semibold text-[#334155]">No. Handphone / WA</label>
                          <input
                            type="text"
                            id="profile-phone"
                            value={profileData.phone}
                            onChange={(e) => {
                              setProfileData({ ...profileData, phone: e.target.value });
                              if (profileValidationErrors.phone) {
                                setProfileValidationErrors({ ...profileValidationErrors, phone: null });
                              }
                            }}
                            placeholder="08123456789"
                            className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.phone ? "border-[#ef4444]" : ""}`}
                          />
                          {profileValidationErrors.phone && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.phone[0]}</span>
                          )}
                        </div>

                        {/* Lokasi */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-location" className="text-[13px] font-semibold text-[#334155]">Lokasi / Kota</label>
                          <input
                            type="text"
                            id="profile-location"
                            value={profileData.location}
                            onChange={(e) => {
                              setProfileData({ ...profileData, location: e.target.value });
                              if (profileValidationErrors.location) {
                                setProfileValidationErrors({ ...profileValidationErrors, location: null });
                              }
                            }}
                            placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
                            className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.location ? "border-[#ef4444]" : ""}`}
                          />
                          {profileValidationErrors.location && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.location[0]}</span>
                          )}
                        </div>

                        {/* Role (Read Only) */}
                        <div className="flex flex-col gap-[6px]">
                          <label htmlFor="profile-role" className="text-[13px] font-semibold text-[#334155]">Peran / Role</label>
                          <input
                            type="text"
                            id="profile-role"
                            value={profileData.role}
                            disabled
                            readOnly
                            className="w-full px-[14px] py-[11px] border border-[#e2e8f0] rounded-[10px] text-[13.5px] text-[#64748b] bg-[#f8fafc] cursor-not-allowed outline-none"
                          />
                        </div>

                        {/* Bio / Tentang Saya */}
                        <div className="col-span-full flex flex-col gap-[6px]">
                          <label htmlFor="profile-bio" className="text-[13px] font-semibold text-[#334155]">Tentang Saya (Bio)</label>
                          <textarea
                            id="profile-bio"
                            value={profileData.bio}
                            onChange={(e) => {
                              setProfileData({ ...profileData, bio: e.target.value });
                              if (profileValidationErrors.bio) {
                                setProfileValidationErrors({ ...profileValidationErrors, bio: null });
                              }
                            }}
                            placeholder="Tulis ringkasan singkat mengenai profil Anda..."
                            rows={4}
                            className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] resize-y min-h-[100px] leading-[1.5] ${profileValidationErrors.bio ? "border-[#ef4444]" : ""}`}
                          />
                          {profileValidationErrors.bio && (
                            <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.bio[0]}</span>
                          )}
                        </div>
                      </div>

                      {/* Form Action Footer */}
                      <div className="flex justify-end pt-[16px] border-t border-[#e2e8f0]">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-[8px] px-[28px] py-[12px] bg-[#007570] text-white border-none rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_14px_rgba(0,117,112,0.25)] hover:enabled:bg-[#005a58] hover:enabled:shadow-[0_6px_18px_rgba(0,117,112,0.35)] hover:enabled:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
                          disabled={isUploadingProfile}
                        >
                          {isUploadingProfile ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              <span>Simpan Perubahan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── MODAL EDIT PRODUK ── */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseEditModal}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={18} className="text-[#007570]" />
                Edit Produk
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Nama produk"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Harga <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="price"
                  value={editPriceDisplay}
                  onChange={handleEditFormChange}
                  inputMode="numeric"
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Contoh: Rp 25.000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs resize-y"
                  placeholder="Deskripsi produk"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct || !editForm.name || !editForm.price}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProduct ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL KUNJUNGAN PORTAL ── */}
      {showChartDetailModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-3 sm:p-5"
          onClick={() => setShowChartDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart size={20} className="text-[#007570]" />
                  Detail Statistik Kunjungan Portal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian data pengunjung, grafik interaktif, dan estimasi persentase per periode
                </p>
              </div>
              <button
                onClick={() => setShowChartDetailModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* Period Filter Tabs & Controls */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs w-full sm:w-auto overflow-x-auto">
                    {[
                      { key: "daily", label: "Harian" },
                      { key: "weekly", label: "Mingguan" },
                      { key: "monthly", label: "Bulanan" },
                      { key: "yearly", label: "Tahunan" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setAnalyticsPeriod(tab.key)}
                        className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                          analyticsPeriod === tab.key
                            ? "bg-[#007570] text-white shadow-2xs font-bold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Date / Period Nav Controls */}
                  <div className="flex items-center gap-2 flex-wrap text-xs font-medium w-full sm:w-auto">
                    {analyticsPeriod === "daily" && (
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                        <Calendar size={14} className="text-[#007570]" />
                        <span className="text-slate-500">Tanggal:</span>
                        <input
                          type="date"
                          value={analyticsDate}
                          onChange={(e) => setAnalyticsDate(e.target.value)}
                          className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                        />
                      </div>
                    )}

                    {analyticsPeriod === "weekly" && (
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(analyticsDate);
                            d.setDate(d.getDate() - 7);
                            setAnalyticsDate(d.toISOString().split("T")[0]);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 font-bold"
                          title="Minggu Sebelumnya"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="font-semibold text-slate-800 px-1">
                          {analyticsStatsData?.period_label || "Minggu Berjalan"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(analyticsDate);
                            d.setDate(d.getDate() + 7);
                            setAnalyticsDate(d.toISOString().split("T")[0]);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 font-bold"
                          title="Minggu Berikutnya"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    {analyticsPeriod === "monthly" && (
                      <div className="flex items-center gap-2">
                        <select
                          value={analyticsMonth}
                          onChange={(e) => setAnalyticsMonth(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                        >
                          {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, idx) => (
                            <option key={idx + 1} value={idx + 1}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={analyticsYear}
                          onChange={(e) => setAnalyticsYear(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                        >
                          {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {analyticsPeriod === "yearly" && (
                      <select
                        value={analyticsYear}
                        onChange={(e) => setAnalyticsYear(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                      >
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Loader or Content */}
              {loadingAnalyticsStats ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-[#007570]" />
                  <span className="text-xs font-semibold text-slate-600">Memuat data statistik...</span>
                </div>
              ) : (
                <>
                  {/* Metric Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      <span className="text-xs font-semibold text-slate-500 block">Total Kunjungan ({analyticsPeriod})</span>
                      <span className="text-2xl font-black text-slate-900 block mt-1">
                        {(analyticsStatsData?.total_visits || 0).toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                        <TrendingUp size={12} /> Data Aktual
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      <span className="text-xs font-semibold text-slate-500 block">{analyticsStatsData?.avg_label || "Rata-Rata"}</span>
                      <span className="text-2xl font-black text-[#007570] block mt-1">
                        {(analyticsStatsData?.avg_visits || 0).toLocaleString("id-ID")}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-1">Estimasi Rata-Rata</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      <span className="text-xs font-semibold text-slate-500 block">{analyticsStatsData?.peak_label || "Puncak Tersibuk"}</span>
                      <span className="text-xl font-black text-amber-600 block mt-1 truncate">
                        {analyticsStatsData?.peak_unit || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block mt-1">
                        {(analyticsStatsData?.peak_visits || 0).toLocaleString("id-ID")} kunjungan
                      </span>
                    </div>
                  </div>

                  {/* Graph Visual Breakdown */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        GRAFIK PERBANDINGAN KUNJUNGAN ({analyticsPeriod.toUpperCase()})
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {analyticsStatsData?.period_label}
                      </span>
                    </div>

                    {(!analyticsStatsData?.chart_data || analyticsStatsData.chart_data.length === 0 || analyticsStatsData.total_visits === 0) ? (
                      <div className="py-10 text-center text-slate-400 text-xs">
                        Belum ada data kunjungan pada periode ini.
                      </div>
                    ) : (
                      <div className="flex items-end gap-2 sm:gap-3 h-44 pt-4 overflow-x-auto">
                        {analyticsStatsData.chart_data.map((d, i) => (
                          <div key={i} className="flex-1 min-w-[24px] flex flex-col items-center gap-2 h-full justify-end group relative">
                            <div className="absolute bottom-full mb-1 bg-white text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {d.fullLabel}: {d.visits.toLocaleString("id-ID")} kunjungan ({d.percentage})
                            </div>
                            <div
                              className="w-full max-w-[32px] bg-gradient-to-t from-[#007570] to-[#5eead4] rounded-t-md min-h-[4px] transition-all group-hover:brightness-125"
                              style={{ height: d.heightPercentage }}
                            ></div>
                            <span className="text-[10px] sm:text-[11px] text-slate-300 font-semibold truncate max-w-full">{d.unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Table Breakdown */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">PERIODE / WAKTU</th>
                            <th className="py-3 px-4">ESTIMASI KUNJUNGAN</th>
                            <th className="py-3 px-4">PERSENTASE</th>
                            <th className="py-3 px-4 text-right">KONTEN DITAMBAHKAN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!analyticsStatsData?.chart_data || analyticsStatsData.chart_data.length === 0) ? (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">
                                Belum ada data kunjungan pada periode ini.
                              </td>
                            </tr>
                          ) : (
                            analyticsStatsData.chart_data.map((d, i) => (
                              <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900">{d.fullLabel || d.unit}</td>
                                <td className="py-3 px-4 font-semibold text-[#007570]">{d.visits.toLocaleString("id-ID")} kunjungan</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 sm:w-28 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                                      <div className="bg-[#007570] h-full rounded-full transition-all" style={{ width: d.heightPercentage }}></div>
                                    </div>
                                    <span className="font-medium text-slate-600">{d.percentage}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-700">{d.itemCount || 0} item</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowChartDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL SEMUA AKTIVITAS TERBARU ── */}
      {showAllActivitiesModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAllActivitiesModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-3xl shadow-2xl border border-slate-200 space-y-6 my-8 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={20} className="text-[#007570]" />
                  Semua Aktivitas Terbaru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar riwayat aktivitas pendaftaran usaha, artikel blog, event, dan ulasan pengguna
                </p>
              </div>
              <button
                onClick={() => setShowAllActivitiesModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Controls: Search & Category Filter Tabs */}
            <div className="space-y-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari aktivitas berdasarkan judul atau kategori..."
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570]"
                />
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                {["Semua", "Bisnis", "Blog", "Event", "Ulasan"].map((tab) => {
                  const isActive = activityTypeFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActivityTypeFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? "bg-[#007570] text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activity List Scroller */}
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const filtered = recentActivitiesList.filter((act) => {
                  // Filter by type
                  if (activityTypeFilter === "Bisnis" && act.type !== "business") return false;
                  if (activityTypeFilter === "Blog" && act.type !== "blog") return false;
                  if (activityTypeFilter === "Event" && act.type !== "event") return false;
                  if (activityTypeFilter === "Ulasan" && act.type !== "review") return false;

                  // Filter by search query
                  if (activitySearchQuery) {
                    const q = activitySearchQuery.toLowerCase();
                    const matchTitle = act.title.toLowerCase().includes(q);
                    const matchSub = act.subText.toLowerCase().includes(q);
                    return matchTitle || matchSub;
                  }
                  return true;
                });

                return filtered.length > 0 ? (
                  filtered.map((act) => {
                    const IconComp = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100/70 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.colorClass}`}>
                            <IconComp size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{act.title}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                                {act.typeName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{act.subText}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{act.dateStr}</span>
                          {(act.link || act.tab) && (
                            <button
                              onClick={() => {
                                setShowAllActivitiesModal(false);
                                if (act.link) navigate(act.link);
                                else if (act.tab) setActiveTab(act.tab);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#007570] hover:bg-[#007570] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              Lihat
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <Search className="mx-auto text-slate-300" size={36} />
                    <p className="text-xs font-medium text-slate-500">Tidak ada aktivitas yang ditemukan.</p>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAllActivitiesModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PILIHAN FOTO PROFIL ── */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-[#007570]" />
                Opsi Foto Profil
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/60 hover:border-teal-300 text-slate-800 font-semibold text-xs transition-all cursor-pointer text-left"
                onClick={() => {
                  setShowPhotoModal(false);
                  document.getElementById("admin-photo-input").click();
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-[#007570] flex items-center justify-center shrink-0">
                  <Upload size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Upload Berkas Gambar</div>
                  <div className="text-[11px] text-slate-500 font-normal">Pilih foto dari HP / Komputer Anda</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-teal-50/60 hover:border-teal-300 text-slate-800 font-semibold text-xs transition-all cursor-pointer text-left"
                onClick={startCamera}
              >
                <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-[#007570] flex items-center justify-center shrink-0">
                  <Camera size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Foto Langsung dari Kamera</div>
                  <div className="text-[11px] text-slate-500 font-normal">Gunakan webcam / kamera perangkat secara live</div>
                </div>
              </button>

              {photoPreview && photoPreview !== DEFAULT_AVATAR && (
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-rose-200/80 bg-rose-50/40 hover:bg-rose-100/60 text-rose-700 font-semibold text-xs transition-all cursor-pointer text-left"
                  onClick={handleRemovePhoto}
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-rose-800">Hapus Foto Profil</div>
                    <div className="text-[11px] text-rose-600 font-normal">Kembalikan foto profil ke standar</div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LIVE WEBCAM VIEWFINDER ── */}
      {showCameraModal && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4"
          onClick={stopCamera}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera size={18} className="text-[#007570]" />
                Kamera Profil Live
              </h3>
              <button
                onClick={stopCamera}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                LIVE
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={capturePhotoFromCamera}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-md cursor-pointer active:scale-95"
              >
                <Camera size={16} />
                <span>Jepret Foto Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

