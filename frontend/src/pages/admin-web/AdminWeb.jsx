import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  Megaphone,
  Crown,
  Ticket,
  FileText,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  LogOut,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  Download,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  AlertTriangle,
  Ban,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Book,
  Menu,
  X as CloseIcon,
  Filter,
  ChevronDown,
  Calendar,
  CreditCard,
  Shield,
  Star,
  MessageSquare,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  Zap,
  Target,
  Layers,
  PieChart,
  Activity,
} from "lucide-react";
import api from "../../services/api";

// ── Badge & Style Helper Maps ──
const getBadgeClass = (status) => {
  const base = "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold whitespace-nowrap";
  const map = {
    admin: "bg-[#dbeafe] text-[#1d4ed8]",
    user: "bg-[#f1f5f9] text-[#64748b]",
    active: "bg-[#dcfce7] text-[#16a34a]",
    inactive: "bg-[#fee2e2] text-[#dc2626]",
    success: "bg-[#dcfce7] text-[#16a34a]",
    warning: "bg-[#fef3c7] text-[#d97706]",
    pending: "bg-[#fef3c7] text-[#d97706]",
    approved: "bg-[#dcfce7] text-[#16a34a]",
    rejected: "bg-[#fee2e2] text-[#dc2626]",
    expired: "bg-[#f1f5f9] text-[#64748b]",
    completed: "bg-[#dbeafe] text-[#1d4ed8]",
    paid: "bg-[#dcfce7] text-[#16a34a]",
    unpaid: "bg-[#fee2e2] text-[#dc2626]",
    premium: "bg-gradient-to-br from-[#007570] to-[#00b3ab] text-white",
    gray: "bg-[#f1f5f9] text-[#64748b]",
  };
  return `${base} ${map[status] || map.gray}`;
};

const getAdStatusBadgeClass = (status) => {
  const base = "inline-flex items-center gap-[4px] px-[9px] py-[3.5px] rounded-[7px] text-[11.5px] font-semibold whitespace-nowrap border";
  switch (status) {
    case 'pending':
      return `${base} bg-[#fef3c7] text-[#d97706] border-[#fcd34d]`;
    case 'approved':
    case 'active':
      return `${base} bg-[#dcfce7] text-[#16a34a] border-[#86efac]`;
    case 'rejected':
      return `${base} bg-[#fee2e2] text-[#dc2626] border-[#fca5a5]`;
    case 'inactive':
      return `${base} bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]`;
    case 'expired':
      return `${base} bg-[#ffedd5] text-[#c2410c] border-[#fdba74]`;
    default:
      return `${base} bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]`;
  }
};

const getAdStatusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'approved':
    case 'active':
      return 'Aktif';
    case 'rejected':
      return 'Ditolak';
    case 'inactive':
      return 'Nonaktif';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

// ── Mini Bar Chart Component ──
const MiniBarChart = ({ data = [], color = "#007570", height = 140, labels = [] }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[8px]" style={{ height: `${height}px` }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex items-end justify-center flex-col gap-[4px]">
          <div
            className="w-full max-w-[28px] rounded-t-[5px] transition-[height] duration-400 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] cursor-pointer hover:brightness-110"
            style={{
              height: `${(val / max) * 100}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
            }}
          />
          {labels[i] && <span className="text-[10px] text-[#64748b] text-center font-medium">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
};

// ── Navigation items ──
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.7} /> },
  { id: "users", label: "Kelola User", icon: <Users size={20} strokeWidth={1.7} /> },
  { id: "businesses", label: "Kelola Bisnis", icon: <Building2 size={20} strokeWidth={1.7} /> },
  { id: "categories", label: "Kelola Kategori", icon: <Tag size={20} strokeWidth={1.7} /> },
  { id: "ads", label: "Kelola Iklan", icon: <Megaphone size={20} strokeWidth={1.7} /> },
  { id: "premium", label: "Paket Premium", icon: <Crown size={20} strokeWidth={1.7} /> },
  { id: "coupons", label: "Kupon Diskon", icon: <Ticket size={20} strokeWidth={1.7} /> },
  { id: "blogs", label: "Blog & Event", icon: <FileText size={20} strokeWidth={1.7} /> },
  { id: "reports", label: "Laporan Report", icon: <AlertTriangle size={20} strokeWidth={1.7} /> },
  { id: "settings", label: "Pengaturan", icon: <Settings size={20} strokeWidth={1.7} /> },
];

// Helper for fast localStorage caching in AdminWeb
const getAdminCache = (key, fallback) => {
  try {
    const cached = localStorage.getItem(`admin_cache_${key}`);
    return cached ? JSON.parse(cached) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setAdminCache = (key, data) => {
  try {
    localStorage.setItem(`admin_cache_${key}`, JSON.stringify(data));
  } catch (e) {}
};

export default function AdminWeb() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab } = useParams();

  // Derive active tab from current URL location (Source of Truth)
  const getActiveTabFromUrl = () => {
    if (tab) return tab;
    const path = location.pathname;
    if (path.includes("/admin/coupons") || path.includes("/coupons")) return "coupons";
    const last = path.split("/").filter(Boolean).pop();
    if (last && NAV_ITEMS.some((i) => i.id === last)) {
      return last;
    }
    return "dashboard";
  };

  const activeTab = getActiveTabFromUrl();

  const setActiveTab = (tabId) => {
    navigate(`/admin/${tabId}`);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Coupon States ──
  const [coupons, setCoupons] = useState(() => getAdminCache("coupons", []));
  const [couponFilters, setCouponFilters] = useState({
    search: "",
    status: "",
    appliesTo: "",
  });
  const [couponForm, setCouponForm] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    applies_to: "all",
    minimum_amount: "",
    maximum_discount: "",
    usage_limit: "",
    starts_at: "",
    expires_at: "",
    is_active: true,
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    status: "active",
    password: "",
  });
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  // ── Category States ──
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "",
    parent_id: "",
    is_active: true,
  });
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [categoryStatusFilter, setCategoryStatusFilter] = useState("");

  const generateCouponCode = () => {
    const prefixes = ["PROMO", "DISCOUNT", "PREMIUM", "IKLAN", "INFO"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCouponForm((prev) => ({ ...prev, code: `${prefix}${randomStr}` }));
  };

  // ── Ads-specific states ──
  const [adsTab, setAdsTab] = useState("orders"); // "orders" or "packages"
  const [adsFilters, setAdsFilters] = useState({
    search: "",
    status: "",
    package: "",
    payment: "",
    dateFrom: "",
    dateTo: "",
  });
  const [adsStats, setAdsStats] = useState({
    totalOrders: 0,
    pending: 0,
    active: 0,
    completed: 0,
    rejected: 0,
    totalRevenue: 0,
  });
  const [packages, setPackages] = useState([]);
  const [adPackages, setAdPackages] = useState(() => getAdminCache("ad_packages", []));
  const [adPackageForm, setAdPackageForm] = useState({
    name: "",
    description: "",
    price: 50000,
    duration_value: 30,
    duration_unit: "day",
    features: {
      advertisement_page: true,
      search_priority: false,
      premium_badge: false,
    },
    is_active: true,
  });
  const [editAdForm, setEditAdForm] = useState({
    package_name: "Basic",
    status: "pending",
    payment_status: "unpaid",
    notes: "",
    price: 0,
    start_date: "",
    end_date: "",
  });
  const [showActionMenu, setShowActionMenu] = useState(null);

  // ── Data states ──
  const [stats, setStats] = useState(() => getAdminCache("stats", {
    totalUsers: 0,
    totalBusinesses: 0,
    totalCategories: 0,
    totalActiveAds: 0,
    totalPremium: 0,
    monthlyRevenue: 0,
    userGrowth: [],
    businessGrowth: [],
  }));
  const [recentActivities, setRecentActivities] = useState(() => getAdminCache("activities", []));
  const [users, setUsers] = useState(() => getAdminCache("users", []));
  const [businesses, setBusinesses] = useState(() => getAdminCache("businesses", []));
  const [categories, setCategories] = useState(() => getAdminCache("categories", []));
  const [payments, setPayments] = useState(() => getAdminCache("payments", []));
  const [blogs, setBlogs] = useState(() => getAdminCache("blogs", []));
  const [blogTab, setBlogTab] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("");
  const [blogPage, setBlogPage] = useState(1);
  const [blogForm, setBlogForm] = useState({
    title: "",
    type: "blog",
    blog_category: "Kuliner",
    excerpt: "",
    content: "",
    thumbnail: "",
    event_date: "",
    event_location: "",
    status: "approved",
  });
  // ── Report States ──
  const [reportsList, setReportsList] = useState(() => getAdminCache("reports_list", []));
  const [reportStats, setReportStats] = useState(() => getAdminCache("report_stats", {
    total: 0,
    baru: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
    businessCount: 0,
    blogCount: 0,
    eventCount: 0,
  }));
  const [reportTypeTab, setReportTypeTab] = useState("all");
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [reportPage, setReportPage] = useState(1);
  const [advertisements, setAdvertisements] = useState(() => getAdminCache("ads", []));
  const [notifications, setNotifications] = useState(() => getAdminCache("notifications", []));
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem("admin_cache_stats");
    } catch (e) {
      return true;
    }
  });

  // ── Premium Package & Subscription States ──
  const [subscriptions, setSubscriptions] = useState(() => getAdminCache("subscriptions", []));
  const [plans, setPlans] = useState(() => getAdminCache("plans", [
    {
      id: 1,
      name: "Free",
      price: 0,
      business_limit: 2,
      can_add_map: false,
      can_add_gallery: false,
      can_add_video: false,
      priority_listing: false,
      is_active: true,
    },
    {
      id: 2,
      name: "Premium 1",
      price: 50000,
      business_limit: 5,
      can_add_map: true,
      can_add_gallery: true,
      can_add_video: false,
      priority_listing: false,
      is_active: true,
    },
    {
      id: 3,
      name: "Premium 2",
      price: 100000,
      business_limit: 999,
      can_add_map: true,
      can_add_gallery: true,
      can_add_video: true,
      priority_listing: true,
      is_active: true,
    },
  ]));

  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    price: 50000,
    duration_value: 1,
    duration_unit: "month",
    can_add_map: true,
    can_add_gallery: true,
    can_add_video: false,
    can_add_products: true,
    can_chat: true,
    priority_listing: false,
    is_active: true,
  });
  const [premiumSearch, setPremiumSearch] = useState("");
  const [premiumStatusFilter, setPremiumStatusFilter] = useState("");
  const [premiumPlanFilter, setPremiumPlanFilter] = useState("");
  const [premiumPage, setPremiumPage] = useState(1);

  // ── Modal state ──
  const [modal, setModal] = useState({ show: false, type: "", data: null });

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { }
      }
    };

    loadUser();
    fetchAllData();

    // Auto polling notifications and stats every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationsAndStats();
    }, 30000);

    // Listen for user auth changes
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      clearInterval(interval);
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "laporan" || activeTab === "report") {
      api.get('/admin/reports').then(res => {
        const repData = res.data || {};
        if (repData.reports) setReportsList(repData.reports);
        if (repData.stats) setReportStats(repData.stats);
      }).catch(err => console.error("Failed reports fetch on tab switch:", err));
    }
  }, [activeTab]);

  const fetchNotificationsAndStats = async () => {
    try {
      const [statsRes, notifRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/notifications'),
      ]);

      if (statsRes.status === 'fulfilled') {
        const statsData = statsRes.value.data || {};
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalBusinesses: statsData.totalBusinesses || 0,
          totalCategories: statsData.totalCategories || 0,
          totalActiveAds: statsData.totalActiveAds || 0,
          totalPremium: statsData.totalPremium || 0,
          monthlyRevenue: statsData.monthlyRevenue || 0,
          userGrowth: statsData.userGrowth || [],
          businessGrowth: statsData.businessGrowth || [],
        });
        if (statsData.recentActivities) {
          setRecentActivities(statsData.recentActivities);
        }
      }

      if (notifRes.status === 'fulfilled') {
        const notifData = notifRes.value.data || {};
        const notifList = Array.isArray(notifData.notifications)
          ? notifData.notifications
          : (Array.isArray(notifData) ? notifData : []);
        setNotifications(notifList);
        setUnreadNotificationsCount(notifData.unreadCount ?? notifData.unread_count ?? notifList.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to poll notifications & stats:", err);
    }
  };

  const fetchAllData = async () => {
    // Only show full loading screen if we have no cached stats at all
    const hasCache = !!localStorage.getItem("admin_cache_stats");
    if (!hasCache) {
      setLoading(true);
    }

    try {
      const fetchers = [
        api.get('/admin/stats').then(res => {
          const statsData = res.data || {};
          const mappedStats = {
            totalUsers: statsData.totalUsers || 0,
            totalBusinesses: statsData.totalBusinesses || 0,
            totalCategories: statsData.totalCategories || 0,
            totalActiveAds: statsData.totalActiveAds || 0,
            totalPremium: statsData.totalPremium || 0,
            monthlyRevenue: statsData.monthlyRevenue || 0,
            userGrowth: statsData.userGrowth || [],
            businessGrowth: statsData.businessGrowth || [],
          };
          setStats(mappedStats);
          setAdminCache("stats", mappedStats);
          if (statsData.recentActivities) {
            setRecentActivities(statsData.recentActivities);
            setAdminCache("activities", statsData.recentActivities);
          }
          setLoading(false);
        }).catch(err => console.error("Failed stats fetch:", err)),

        api.get('/admin/users').then(res => {
          const usersData = res.data?.data || res.data || [];
          const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
          const mappedUsers = usersList.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status || 'active',
            phone: u.phone || '-',
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-',
            businesses: u.businesses_count || 0,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}`
          }));
          setUsers(mappedUsers);
          setAdminCache("users", mappedUsers);
          setLoading(false);
        }).catch(err => console.error("Failed users fetch:", err)),

        api.get('/admin/businesses').then(res => {
          const businessesData = res.data?.data || res.data || [];
          const list = Array.isArray(businessesData) ? businessesData : (businessesData?.data || []);
          setBusinesses(list);
          setAdminCache("businesses", list);
        }).catch(err => console.error("Failed businesses fetch:", err)),

        api.get('/admin/categories').then(res => {
          const categoriesData = res.data?.data || res.data || [];
          const list = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
          setCategories(list);
          setAdminCache("categories", list);
        }).catch(err => console.error("Failed categories fetch:", err)),

        api.get('/admin/blogs').then(res => {
          const blogsData = res.data?.data || res.data || [];
          const list = Array.isArray(blogsData) ? blogsData : (blogsData?.data || []);
          setBlogs(list);
          setAdminCache("blogs", list);
        }).catch(err => console.error("Failed blogs fetch:", err)),

        api.get('/admin/advertisements').then(res => {
          const adsData = res.data?.data || res.data || [];
          const list = Array.isArray(adsData) ? adsData : (adsData?.data || []);
          setAdvertisements(list);
          setAdminCache("ads", list);
        }).catch(err => console.error("Failed ads fetch:", err)),

        api.get('/admin/payments').then(res => {
          const paymentsData = res.data?.data || res.data || [];
          const list = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || []);
          setPayments(list);
          setAdminCache("payments", list);
        }).catch(err => console.error("Failed payments fetch:", err)),

        api.get('/admin/notifications').then(res => {
          const notifData = res.data || {};
          const notifList = Array.isArray(notifData.notifications)
            ? notifData.notifications
            : (Array.isArray(notifData) ? notifData : []);
          setNotifications(notifList);
          setAdminCache("notifications", notifList);
          setUnreadNotificationsCount(notifData.unreadCount ?? notifData.unread_count ?? notifList.filter(n => !n.is_read).length);
        }).catch(err => console.error("Failed notifications fetch:", err)),

        api.get('/admin/coupons').then(res => {
          const couponsData = res.data?.data || res.data || [];
          const list = Array.isArray(couponsData) ? couponsData : (couponsData?.data || []);
          setCoupons(list);
          setAdminCache("coupons", list);
        }).catch(err => console.error("Failed coupons fetch:", err)),

        api.get('/admin/subscriptions').then(res => {
          const subsData = res.data?.data || res.data || [];
          const list = Array.isArray(subsData) ? subsData : (subsData?.data || []);
          setSubscriptions(list);
          setAdminCache("subscriptions", list);
        }).catch(err => console.error("Failed subscriptions fetch:", err)),

        api.get('/admin/reports').then(res => {
          const repData = res.data || {};
          if (repData.reports) {
            setReportsList(repData.reports);
            setAdminCache("reports_list", repData.reports);
          }
          if (repData.stats) {
            setReportStats(repData.stats);
            setAdminCache("report_stats", repData.stats);
          }
        }).catch(err => console.error("Failed reports fetch:", err)),

        api.get('/admin/plans').then(res => {
          const plansData = res.data?.data || res.data || [];
          if (Array.isArray(plansData) && plansData.length > 0) {
            setPlans(plansData);
            setAdminCache("plans", plansData);
          }
        }).catch(err => console.error("Failed plans fetch:", err)),

        api.get('/admin/ad-packages').then(res => {
          const adPkgData = res.data?.data || res.data || [];
          if (Array.isArray(adPkgData)) {
            setAdPackages(adPkgData);
            setAdminCache("ad_packages", adPkgData);
          }
        }).catch(err => console.error("Failed ad packages fetch:", err)),
      ];

      await Promise.allSettled(fetchers);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };


  // ── Package & Subscription Handlers ──
  const handleSavePackage = async () => {
    try {
      if (modal.type === "editPackage" && modal.data?.id) {
        await api.put(`/admin/plans/${modal.data.id}`, packageForm);
      } else {
        await api.post(`/admin/plans`, packageForm);
      }
      const res = await api.get('/admin/plans');
      const plansData = res.data?.data || res.data || [];
      if (Array.isArray(plansData) && plansData.length > 0) setPlans(plansData);
    } catch (err) {
      console.error("Save package error:", err);
      if (modal.type === "editPackage" && modal.data?.id) {
        setPlans((prev) => prev.map((p) => (p.id === modal.data.id ? { ...p, ...packageForm } : p)));
      } else {
        setPlans((prev) => [...prev, { id: Date.now(), ...packageForm }]);
      }
    }
    closeModal();
  };

  const handleDeletePackage = async (id) => {
    try {
      await api.delete(`/admin/plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete package error:", err);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
    closeModal();
  };

  const handleTogglePackageStatus = async (id) => {
    try {
      await api.put(`/admin/plans/${id}/toggle-status`);
      const res = await api.get('/admin/plans');
      const plansData = res.data?.data || res.data || [];
      if (Array.isArray(plansData) && plansData.length > 0) setPlans(plansData);
    } catch (err) {
      console.error("Toggle package status error:", err);
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  const handleUpdateSubscriptionStatus = async (subId, status, expiresAt) => {
    try {
      await api.put(`/admin/subscriptions/${subId}`, {
        status: status,
        expires_at: expiresAt,
      });
      fetchAllData();
    } catch (e) {
      console.error("Update subscription error:", e);
      alert("Gagal mengupdate subscription.");
    }
  };

  const handleSaveCoupon = async (e) => {
    if (e) e.preventDefault();
    try {
      if (modal.type === "editCoupon" && modal.data?.id) {
        await api.put(`/admin/coupons/${modal.data.id}`, couponForm);
      } else {
        await api.post("/admin/coupons", couponForm);
      }
      closeModal();
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan kupon.");
    }
  };

  const handleToggleCouponStatus = async (id) => {
    try {
      await api.put(`/admin/coupons/${id}/toggle-status`);
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      closeModal();
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus kupon.");
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/admin/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotificationsCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleLogout = async () => {
    try {
      // Invalidate token on the backend (Sanctum)
      await api.post('/logout');
    } catch (_) {
      // Proceed with local cleanup even if API call fails
    } finally {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clear all admin cache keys so next login starts fresh
      Object.keys(localStorage)
        .filter((k) => k.startsWith("admin_cache_"))
        .forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new Event("userAuthChanged"));
      navigate("/login");
    }
  };

  const handleSaveUser = async (e) => {
    if (e) e.preventDefault();
    try {
      if (modal.type === "addUser") {
        await api.post('/admin/users', userForm);
        alert('User berhasil ditambahkan.');
      } else if (modal.type === "editUser" && modal.data?.id) {
        await api.put(`/admin/users/${modal.data.id}`, userForm);
        alert('User berhasil diperbarui.');
      }
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menyimpan user:", err);
      alert(err.response?.data?.message || 'Gagal menyimpan user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User berhasil dihapus.');
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menghapus user:", err);
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}/toggle-status`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status user:", err);
      alert(err.response?.data?.message || 'Gagal mengubah status user.');
    }
  };

  const handleModal = (type, data = null) => {
    if (type === "addUser") {
      setUserForm({
        name: "",
        email: "",
        role: "user",
        phone: "",
        status: "active",
        password: "",
      });
    } else if (type === "editUser" && data) {
      setUserForm({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "user",
        phone: data.phone || "",
        status: data.status || "active",
        password: "",
      });
    } else if (type === "addCategory") {
      setCategoryForm({
        name: "",
        slug: "",
        icon: "",
        parent_id: "",
        is_active: true,
      });
    } else if (type === "editCategory" && data) {
      setCategoryForm({
        name: data.name || "",
        slug: data.slug || "",
        icon: data.icon || "",
        parent_id: data.parent_id || "",
        is_active: data.is_active ?? true,
      });
    } else if (type === "addCoupon") {
      setCouponForm({
        code: "",
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        applies_to: "all",
        minimum_amount: "",
        maximum_discount: "",
        usage_limit: "",
        starts_at: "",
        expires_at: "",
        is_active: true,
      });
    } else if (type === "editCoupon" && data) {
      setCouponForm({
        code: data.code || "",
        name: data.name || "",
        description: data.description || "",
        discount_type: data.discount_type || "percentage",
        discount_value: data.discount_value || "",
        applies_to: data.applies_to || "all",
        minimum_amount: data.minimum_amount || "",
        maximum_discount: data.maximum_discount || "",
        usage_limit: data.usage_limit || "",
        starts_at: data.starts_at ? data.starts_at.substring(0, 10) : "",
        expires_at: data.expires_at ? data.expires_at.substring(0, 10) : "",
        is_active: data.is_active ?? true,
      });
    } else if (type === "addAdPackage") {
      setAdPackageForm({
        name: "",
        description: "",
        price: 50000,
        duration_value: 30,
        duration_unit: "day",
        features: {
          advertisement_page: true,
          search_priority: false,
          premium_badge: false,
        },
        is_active: true,
      });
    } else if (type === "editAdPackage" && data) {
      setAdPackageForm({
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        duration_value: data.duration_value || 30,
        duration_unit: data.duration_unit || "day",
        features: {
          advertisement_page: data.features?.advertisement_page ?? true,
          search_priority: data.features?.search_priority ?? false,
          premium_badge: data.features?.premium_badge ?? false,
        },
        is_active: data.is_active ?? true,
      });
    } else if (type === "editAd" && data) {
      setEditAdForm({
        package_name: data.package_name || "Basic",
        status: data.status || "pending",
        payment_status: data.payment_status || "unpaid",
        notes: data.notes || "",
        price: data.price || 0,
        start_date: data.start_date ? String(data.start_date).substring(0, 10) : "",
        end_date: data.end_date ? String(data.end_date).substring(0, 10) : "",
      });
    }
    setModal({ show: true, type, data });
  };

  const closeModal = () => {
    setModal({ show: false, type: "", data: null });
  };

  // ── Advertisement handlers ──
  const handleApproveAd = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui iklan ini?')) return;

    try {
      await api.put(`/admin/advertisements/${adId}/approve`);
      alert('Iklan berhasil disetujui');
      fetchAllData();
    } catch (err) {
      console.error('Failed to approve advertisement:', err);
      alert('Gagal menyetujui iklan');
    }
  };

  const handleRejectAd = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin menolak iklan ini?')) return;

    try {
      await api.put(`/admin/advertisements/${adId}/reject`);
      alert('Iklan berhasil ditolak');
      fetchAllData();
    } catch (err) {
      console.error('Failed to reject advertisement:', err);
      alert('Gagal menolak iklan');
    }
  };

  const handleExpireAd = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin mengakhiri masa tayang iklan ini?')) return;

    try {
      await api.put(`/admin/advertisements/${adId}/expire`);
      alert('Masa tayang iklan diakhiri');
      fetchAllData();
    } catch (err) {
      console.error('Failed to expire advertisement:', err);
      alert('Gagal mengakhiri iklan');
    }
  };

  const handleToggleAdStatus = async (adId) => {
    try {
      await api.put(`/admin/advertisements/${adId}/toggle-status`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status iklan:", err);
      alert(err.response?.data?.message || 'Gagal mengubah status iklan.');
    }
  };

  // ── Ad Package Handlers ──
  const handleSaveAdPackage = async () => {
    try {
      if (modal.type === "editAdPackage" && modal.data?.id) {
        await api.put(`/admin/ad-packages/${modal.data.id}`, adPackageForm);
      } else {
        await api.post(`/admin/ad-packages`, adPackageForm);
      }
      const res = await api.get('/admin/ad-packages');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) setAdPackages(data);
      alert('Paket iklan berhasil disimpan!');
    } catch (err) {
      console.error("Save ad package error:", err);
      alert(err.response?.data?.message || 'Gagal menyimpan paket iklan');
    }
    closeModal();
  };

  const handleDeleteAdPackage = async (id) => {
    try {
      await api.delete(`/admin/ad-packages/${id}`);
      setAdPackages((prev) => prev.filter((p) => p.id !== id));
      alert('Paket iklan berhasil dihapus!');
    } catch (err) {
      console.error("Delete ad package error:", err);
      alert(err.response?.data?.message || 'Gagal menghapus paket iklan');
    }
    closeModal();
  };

  const handleSaveEditAd = async () => {
    if (!modal.data?.id) return;
    try {
      await api.put(`/admin/advertisements/${modal.data.id}`, editAdForm);
      alert('Detail iklan berhasil diperbarui!');
      fetchAllData();
    } catch (err) {
      console.error("Update ad error:", err);
      alert(err.response?.data?.message || 'Gagal memperbarui detail iklan');
    }
    closeModal();
  };

  const handleDeleteAd = async (id) => {
    try {
      await api.delete(`/admin/advertisements/${id}`);
      setAdvertisements((prev) => prev.filter((a) => a.id !== id));
      alert('Iklan berhasil dihapus!');
    } catch (err) {
      console.error("Delete ad error:", err);
      alert(err.response?.data?.message || 'Gagal menghapus iklan');
    }
    closeModal();
  };

  // ── Business handlers ──
  const handleApproveBusiness = async (businessId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui bisnis ini?')) return;

    try {
      await api.put(`/admin/businesses/${businessId}/approve`);
      alert('Bisnis berhasil disetujui');
      fetchAllData();
    } catch (err) {
      console.error('Failed to approve business:', err);
      alert('Gagal menyetujui bisnis');
    }
  };

  const handleSuspendBusiness = async (businessId) => {
    if (!confirm('Apakah Anda yakin ingin menangguhkan bisnis ini?')) return;

    try {
      await api.put(`/admin/businesses/${businessId}/suspend`);
      alert('Bisnis berhasil ditangguhkan.');
      fetchAllData();
    } catch (err) {
      console.error('Failed to suspend business:', err);
      alert(err.response?.data?.message || 'Gagal menangguhkan bisnis.');
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus bisnis ini secara permanen?')) return;

    try {
      await api.delete(`/admin/businesses/${businessId}`);
      alert('Bisnis berhasil dihapus.');
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete business:', err);
      alert(err.response?.data?.message || 'Gagal menghapus bisnis.');
    }
  };

  // ── Category Handlers ──
  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    try {
      const payload = {
        name: categoryForm.name,
        slug: categoryForm.slug || undefined,
        icon: categoryForm.icon || undefined,
        parent_id: categoryForm.parent_id || null,
        is_active: categoryForm.is_active,
      };

      if (modal.type === "addCategory") {
        await api.post('/admin/categories', payload);
        alert('Kategori berhasil ditambahkan.');
      } else if (modal.type === "editCategory" && modal.data?.id) {
        await api.put(`/admin/categories/${modal.data.id}`, payload);
        alert('Kategori berhasil diperbarui.');
      }

      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menyimpan kategori:", err);
      alert(err.response?.data?.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/admin/categories/${categoryId}`);
      alert('Kategori berhasil dihapus.');
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
      alert(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  };

  const handleToggleCategoryStatus = async (category) => {
    try {
      await api.put(`/admin/categories/${category.id}/toggle-status`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status kategori:", err);
      alert(err.response?.data?.message || 'Gagal mengubah status kategori.');
    }
  };

  // ── Blog handlers ──
  // ── Payment handlers ──
  const handleApprovePayment = async (paymentId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) return;

    try {
      await api.put(`/admin/payments/${paymentId}/approve`);
      alert('Pembayaran berhasil disetujui');
      fetchAllData();
    } catch (err) {
      console.error('Failed to approve payment:', err);
      alert('Gagal menyetujui pembayaran');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!confirm('Apakah Anda yakin ingin menolak pembayaran ini?')) return;

    try {
      await api.put(`/admin/payments/${paymentId}/reject`);
      alert('Pembayaran berhasil ditolak');
      fetchAllData();
    } catch (err) {
      console.error('Failed to reject payment:', err);
      alert('Gagal menolak pembayaran');
    }
  };

  // ── Blog & Event Handlers ──
  const handleSaveBlog = async () => {
    if (!blogForm.title) {
      alert("Judul artikel/event wajib diisi.");
      return;
    }

    try {
      const payload = {
        title: blogForm.title,
        type: blogForm.type || "blog",
        blog_category: blogForm.blog_category || "Umum",
        excerpt: blogForm.excerpt || "",
        content: blogForm.content || "",
        thumbnail: blogForm.thumbnail || undefined,
        event_date: blogForm.type === "event" ? blogForm.event_date || null : null,
        event_location: blogForm.type === "event" ? blogForm.event_location || null : null,
        status: blogForm.status || "approved",
      };

      if (modal.type === "addBlog") {
        await api.post("/blogs", payload);
        alert("Konten berhasil ditambahkan.");
      } else if (modal.type === "editBlog" && modal.data?.id) {
        await api.put(`/blogs/${modal.data.id}`, payload);
        alert("Konten berhasil diperbarui.");
      }

      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menyimpan blog/event:", err);
      alert(err.response?.data?.message || "Gagal menyimpan data.");
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await api.delete(`/admin/blogs/${blogId}`);
      alert("Konten berhasil dihapus.");
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menghapus blog/event:", err);
      alert(err.response?.data?.message || "Gagal menghapus konten.");
    }
  };

  const handleApproveBlog = async (blogId) => {
    try {
      await api.put(`/admin/blogs/${blogId}/approve`);
      alert("Konten berhasil disetujui.");
      fetchAllData();
    } catch (err) {
      console.error("Gagal menyetujui blog/event:", err);
      alert(err.response?.data?.message || "Gagal menyetujui konten.");
    }
  };

  const handleRejectBlog = async (blogId) => {
    try {
      await api.put(`/admin/blogs/${blogId}/reject`);
      alert("Konten berhasil ditolak.");
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak blog/event:", err);
      alert(err.response?.data?.message || "Gagal menolak konten.");
    }
  };

  // ── Report Handlers ──
  const handleUpdateReportStatus = async (reportId, newStatus, notes = "") => {
    try {
      await api.put(`/admin/reports/${reportId}/status`, {
        status: newStatus,
        admin_notes: notes,
      });
      alert(`Status report berhasil diubah menjadi '${newStatus}'.`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status report:", err);
      alert(err.response?.data?.message || "Gagal mengubah status report.");
    }
  };

  const handleDeleteReportedContent = async (reportId, notes = "") => {
    try {
      await api.delete(`/admin/reports/${reportId}/content`, {
        data: { admin_notes: notes }
      });
      alert("Konten yang dilaporkan berhasil dihapus dan status report diubah menjadi Selesai.");
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menghapus konten report:", err);
      alert(err.response?.data?.message || "Gagal menghapus konten yang dilaporkan.");
    }
  };

  // ── Render functions for each section ──
  const renderDashboard = () => (
    <div className="mb-[28px]">
      <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] mb-[18px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px] mb-[20px]">
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#007570] to-[#00b3ab]">
            <Users size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{stats.totalUsers}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total User</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+12%</span>
          </div>
        </div>

        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8]">
            <Building2 size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{stats.totalBusinesses}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Bisnis</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+8%</span>
          </div>
        </div>

        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]">
            <Tag size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{stats.totalCategories}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Kategori</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+5%</span>
          </div>
        </div>

        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]">
            <Megaphone size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{stats.totalActiveAds}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Iklan Aktif</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+15%</span>
          </div>
        </div>

        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#ec4899] to-[#f472b6]">
            <Crown size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{stats.totalPremium}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Bisnis Premium</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+20%</span>
          </div>
        </div>

        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#10b981] to-[#34d399]">
            <DollarSign size={24} strokeWidth={1.7} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">Rp {(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Pendapatan Bulan Ini</span>
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-bold px-[8px] py-[4px] rounded-[8px] shrink-0 bg-[#dcfce7] text-[#16a34a]">
            <TrendingUp size={16} strokeWidth={2} />
            <span>+25%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] max-md:grid-cols-1 gap-[14px] mb-[20px]">
        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 hover:shadow-[0_4px_20px_rgba(0,117,112,0.1)]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Grafik Pendaftaran User</h3>
          <MiniBarChart
            data={stats.userGrowth && stats.userGrowth.length > 0 ? stats.userGrowth : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
            color="#007570"
            height={140}
            labels={['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']}
          />
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 hover:shadow-[0_4px_20px_rgba(0,117,112,0.1)]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Grafik Bisnis Baru</h3>
          <MiniBarChart
            data={stats.businessGrowth && stats.businessGrowth.length > 0 ? stats.businessGrowth : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
            color="#0ea5e9"
            height={140}
            labels={['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
        <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Aktivitas Terbaru</h3>
        <div className="flex flex-col gap-[10px]">
          {recentActivities.length === 0 ? (
            <p className="text-[13px] text-[#64748b] p-[12px] text-center font-medium">Belum ada aktivitas terbaru.</p>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] transition-all duration-220 border border-transparent hover:bg-[#f0fdfa] hover:border-[rgba(0,117,112,0.15)]">
                <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 ${
                  act.type?.includes('approved') || act.type?.includes('success') ? 'bg-[#dcfce7] text-[#16a34a]' :
                  act.type?.includes('rejected') || act.type?.includes('suspended') ? 'bg-[#fee2e2] text-[#dc2626]' :
                  act.type?.includes('user') ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#fef3c7] text-[#d97706]'
                }`}>
                  {act.type?.includes('approved') || act.type?.includes('success') ? <Check size={18} strokeWidth={2} /> :
                   act.type?.includes('rejected') || act.type?.includes('suspended') ? <X size={18} strokeWidth={2} /> :
                   act.type?.includes('user') ? <User size={18} strokeWidth={2} /> : <Clock size={18} strokeWidth={2} />}
                </div>
                <div className="flex-1">
                  <span className="text-[13px] text-[#0f172a] font-medium block">{act.description || act.title}</span>
                  <span className="text-[11px] text-[#94a3b8] font-medium mt-[1px] block">{act.created_at ? new Date(act.created_at).toLocaleString('id-ID') : '-'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola User</h2>
        <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]" onClick={() => handleModal("addUser")}>
          <Plus size={18} strokeWidth={2} />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] mb-[16px]">
        <div className="flex-1 min-w-[200px] flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[9px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
          <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
          <input
            type="text"
            placeholder="Cari nama atau email user..."
            className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
        >
          <option value="">Semua Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={userStatusFilter}
          onChange={(e) => setUserStatusFilter(e.target.value)}
          className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
            <tr>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">User</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Email</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Role</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Bisnis</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Tanggal Gabung</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-[36px]">
                  <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                    <User size={48} strokeWidth={1} className="opacity-40" />
                    <p className="text-[14px] text-[#64748b] font-medium">Belum ada data user.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users
                .filter((u) => {
                  const matchSearch =
                    !searchQuery ||
                    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchRole = !userRoleFilter || u.role === userRoleFilter;
                  const matchStatus = !userStatusFilter || u.status === userStatusFilter;
                  return matchSearch && matchRole && matchStatus;
                })
                .map((user) => (
                  <tr key={user.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div
                        className="flex items-center gap-[10px] cursor-pointer group"
                        onClick={() => handleModal("viewUserDetail", user)}
                      >
                        <img src={user.avatar} alt={user.name} className="w-[32px] h-[32px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0" />
                        <span className="group-hover:text-[#007570] group-hover:underline font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{user.email}</td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={getBadgeClass(user.role)}>{user.role}</span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <button
                        type="button"
                        className={`${getBadgeClass(user.status)} cursor-pointer hover:opacity-80 border-0 bg-transparent p-0`}
                        onClick={() => handleToggleUserStatus(user)}
                        title="Klik untuk mengubah status (Aktif/Nonaktif)"
                      >
                        {user.status === "active" ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{user.businesses_count ?? 0}</td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{user.joined}</td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[5px]">
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("viewUserDetail", user)} title="Lihat Detail">
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("editUser", user)} title="Edit">
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button className="w-[30px] h-[30px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("deleteUser", user)} title="Hapus">
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola Bisnis</h2>
        <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]" onClick={() => handleModal("addBusiness")}>
          <Plus size={18} strokeWidth={2} />
          <span>Tambah Bisnis</span>
        </button>
      </div>

      <div className="flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[9px] mb-[16px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
        <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
        <input
          type="text"
          placeholder="Cari bisnis..."
          className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[850px]">
          <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
            <tr>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Bisnis</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Kategori</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Pemilik</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status Usaha</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Premium</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Expired Premium</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Iklan</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Expired Iklan</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {businesses.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-[36px]">
                  <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                    <Building2 size={48} strokeWidth={1} className="opacity-40" />
                    <p className="text-[14px] text-[#64748b] font-medium">Belum ada data bisnis.</p>
                  </div>
                </td>
              </tr>
            ) : (
              businesses
                .filter((b) => {
                  const query = searchQuery.toLowerCase();
                  const nameMatch = b.name?.toLowerCase().includes(query);
                  const catMatch = typeof b.category === "string" ? b.category.toLowerCase().includes(query) : b.category?.name?.toLowerCase().includes(query);
                  const ownerMatch = b.user?.name?.toLowerCase().includes(query) || b.owner?.toLowerCase().includes(query);
                  return !searchQuery || nameMatch || catMatch || ownerMatch;
                })
                .map((business) => (
                  <tr key={business.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[10px]">
                        <img
                          src={business.logo_url || business.img || business.logo || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80"}
                          alt={business.name}
                          className="w-[36px] h-[36px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="font-semibold text-[#0f172a]">{business.name}</span>
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {business.category?.name || (typeof business.category === "string" ? business.category : "-")}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {business.user?.name || business.owner || "Unknown"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={
                        business.status === "published" || business.status === "active"
                          ? "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#dcfce7] text-[#16a34a]"
                          : business.status === "pending"
                          ? "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#fef3c7] text-[#d97706]"
                          : business.status === "suspended" || business.status === "rejected"
                          ? "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#fee2e2] text-[#dc2626]"
                          : "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#f1f5f9] text-[#64748b]"
                      }>
                        {business.status === "published" || business.status === "active"
                          ? "Aktif"
                          : business.status === "pending"
                          ? "Pending"
                          : business.status === "suspended"
                          ? "Suspended"
                          : business.status === "rejected"
                          ? "Ditolak"
                          : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={
                        business.premium_info?.status === "active" || business.is_premium
                          ? "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-gradient-to-br from-[#007570] to-[#00b3ab] text-white shadow-[0_2px_6px_rgba(0,117,112,0.2)]"
                          : business.premium_info?.status === "expired"
                          ? "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]"
                          : "inline-flex items-center gap-[4px] px-[9px] py-[3px] rounded-[7px] text-[11.5px] font-semibold bg-[#f1f5f9] text-[#64748b]"
                      }>
                        {(business.premium_info?.status === "active" || business.is_premium) && (
                          <Crown size={13} strokeWidth={2} className="shrink-0" />
                        )}
                        {business.premium_info?.label || (business.is_premium ? "Aktif" : "Tidak Aktif")}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#475569] font-medium align-middle [tr:last-child_&]:border-b-0 whitespace-nowrap">
                      {business.premium_info?.expired_at || "-"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={getAdStatusBadgeClass(business.ad_info?.status || "inactive")}>
                        {business.ad_info?.label || "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#475569] font-medium align-middle [tr:last-child_&]:border-b-0 whitespace-nowrap">
                      {business.ad_info?.expired_at || "-"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[5px]">
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("viewBusiness", business)} title="Lihat Detail">
                          <Eye size={16} strokeWidth={2} />
                        </button>
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("editBusiness", business)} title="Edit">
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        {business.status !== "published" && (
                          <button className="w-[30px] h-[30px] bg-[#dcfce7] text-[#16a34a] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#16a34a] hover:text-white" onClick={() => handleApproveBusiness(business.id)} title="Setujui (Approve)">
                            <Check size={16} strokeWidth={2} />
                          </button>
                        )}
                        {business.status === "published" && (
                          <button className="w-[30px] h-[30px] bg-[#fef3c7] text-[#d97706] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#d97706] hover:text-white" onClick={() => handleSuspendBusiness(business.id)} title="Tangguhkan (Suspend)">
                            <Ban size={16} strokeWidth={2} />
                          </button>
                        )}
                        <button className="w-[30px] h-[30px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white" onClick={() => handleDeleteBusiness(business.id)} title="Hapus">
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola Kategori</h2>
        <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]" onClick={() => handleModal("addCategory")}>
          <Plus size={18} strokeWidth={2} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] mb-[16px]">
        <div className="flex-1 min-w-[200px] flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[9px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
          <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
          <input
            type="text"
            placeholder="Cari kategori atau slug..."
            className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
          />
        </div>
        <select
          value={categoryStatusFilter}
          onChange={(e) => setCategoryStatusFilter(e.target.value)}
          className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
            <tr>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Nama Kategori</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Slug</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Kategori Induk (Parent)</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Jumlah Bisnis</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-[36px]">
                  <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                    <Layers size={48} strokeWidth={1} className="opacity-40" />
                    <p className="text-[14px] text-[#64748b] font-medium">Belum ada data kategori.</p>
                  </div>
                </td>
              </tr>
            ) : (
              categories
                .filter((cat) => {
                  const query = categorySearchQuery.toLowerCase();
                  const matchSearch =
                    !categorySearchQuery ||
                    cat.name?.toLowerCase().includes(query) ||
                    cat.slug?.toLowerCase().includes(query);
                  const matchStatus =
                    !categoryStatusFilter ||
                    (categoryStatusFilter === "active" ? cat.is_active !== false : cat.is_active === false);
                  return matchSearch && matchStatus;
                })
                .map((category) => (
                  <tr key={category.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[28px] h-[28px] rounded-[7px] bg-[rgba(0,117,112,0.1)] text-[#007570] flex items-center justify-center font-bold text-[12px] shrink-0">
                          {category.icon ? category.icon.substring(0, 2).toUpperCase() : category.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#0f172a]">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#64748b] font-mono align-middle [tr:last-child_&]:border-b-0">
                      {category.slug}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {category.parent?.name || "-"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <button
                        type="button"
                        className={`${getBadgeClass(category.is_active !== false ? "active" : "inactive")} cursor-pointer hover:opacity-80 border-0 bg-transparent p-0`}
                        onClick={() => handleToggleCategoryStatus(category)}
                        title="Klik untuk mengubah status (Aktif/Nonaktif)"
                      >
                        {category.is_active !== false ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-semibold align-middle [tr:last-child_&]:border-b-0">
                      {category.businesses_count ?? businesses.filter((b) => b.category_id === category.id || b.category?.id === category.id || b.category === category.name).length} Business
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[5px]">
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("editCategory", category)} title="Edit">
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button className="w-[30px] h-[30px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white" onClick={() => handleModal("deleteCategory", category)} title="Hapus">
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAds = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola Iklan</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px] mb-[20px]">
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#007570] to-[#00b3ab]">
            <Megaphone size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Order</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{adsStats.totalOrders}</p>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]">
            <Clock size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Menunggu Persetujuan</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{adsStats.pending}</p>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#10b981] to-[#34d399]">
            <Check size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Iklan Aktif</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{adsStats.active}</p>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#06b6d4] to-[#22d3ee]">
            <Activity size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Iklan Selesai</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{adsStats.completed}</p>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#ef4444] to-[#f87171]">
            <X size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Iklan Ditolak</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{adsStats.rejected}</p>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] transition-all duration-250 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(0,117,112,0.1)] after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#007570] after:opacity-0 after:transition-opacity after:duration-250 hover:after:opacity-100">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#ec4899] to-[#f472b6]">
            <DollarSign size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Pendapatan</p>
            <p className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">Rp {adsStats.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[4px] mb-[16px] bg-[#f1f5f9] p-[4px] rounded-[10px] w-fit max-md:overflow-x-auto max-md:w-full">
        <button
          className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] border-0 font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${adsTab === "orders" ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "bg-transparent text-[#64748b] hover:text-[#0f172a]"}`}
          onClick={() => setAdsTab("orders")}
        >
          <Megaphone size={18} strokeWidth={1.7} />
          <span>Pesanan Iklan</span>
        </button>
        <button
          className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] border-0 font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap ${adsTab === "packages" ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "bg-transparent text-[#64748b] hover:text-[#0f172a]"}`}
          onClick={() => setAdsTab("packages")}
        >
          <Crown size={18} strokeWidth={1.7} />
          <span>Daftar Paket</span>
        </button>
      </div>

      {/* Orders Tab */}
      {adsTab === "orders" && (
        <>
          {/* Filter Section */}
          <div className="bg-white rounded-[12px] px-[16px] py-[14px] mb-[16px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="flex flex-wrap gap-[10px] items-center max-md:flex-col">
              <div className="flex items-center gap-[8px] flex-1 min-w-[180px] max-md:min-w-0 max-md:w-full bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] px-[12px] py-[7px] transition-all duration-200 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
                <Search size={16} className="text-[#64748b] shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama bisnis / pemilik..."
                  value={adsFilters.search}
                  onChange={(e) => setAdsFilters({ ...adsFilters, search: e.target.value })}
                  className="flex-1 border-0 outline-none bg-transparent font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a]"
                />
              </div>
              <select
                value={adsFilters.status}
                onChange={(e) => setAdsFilters({ ...adsFilters, status: e.target.value })}
                className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer transition-all duration-200 min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="expired">Kedaluwarsa</option>
              </select>
              <select
                value={adsFilters.package}
                onChange={(e) => setAdsFilters({ ...adsFilters, package: e.target.value })}
                className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer transition-all duration-200 min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
              >
                <option value="">Semua Paket</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={adsFilters.payment}
                onChange={(e) => setAdsFilters({ ...adsFilters, payment: e.target.value })}
                className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer transition-all duration-200 min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
              >
                <option value="">Semua Pembayaran</option>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Bayar</option>
              </select>
              <input
                type="date"
                value={adsFilters.dateFrom}
                onChange={(e) => setAdsFilters({ ...adsFilters, dateFrom: e.target.value })}
                className="flex-none min-w-[130px] max-md:w-full px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] focus:border-[#007570] focus:outline-none"
              />
              <input
                type="date"
                value={adsFilters.dateTo}
                onChange={(e) => setAdsFilters({ ...adsFilters, dateTo: e.target.value })}
                className="flex-none min-w-[130px] max-md:w-full px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] focus:border-[#007570] focus:outline-none"
              />
              <button className="flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] border-0 font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap bg-[#007570] text-white hover:bg-[#005a58]">
                <Filter size={16} strokeWidth={1.7} />
                Filter
              </button>
              <button
                className="flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0] hover:bg-[#e2e8f0]"
                onClick={() => setAdsFilters({ search: "", status: "", package: "", payment: "", dateFrom: "", dateTo: "" })}
              >
                <RefreshCw size={16} strokeWidth={1.7} />
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
                <tr>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Bisnis</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Pemilik</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Email</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Paket</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Harga</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Pembayaran</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Bukti</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Tanggal</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Periode</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Expired</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center p-[32px]">
                      <div className="flex flex-col items-center justify-center p-[48px_24px] gap-[14px] text-[#94a3b8] text-center">
                        <Megaphone size={64} strokeWidth={1} className="opacity-[0.35]" />
                        <p className="text-[14px] text-[#64748b] font-medium">Belum ada pengajuan iklan.</p>
                        <button className="inline-flex items-center gap-[6px] px-[18px] py-[9px] bg-[#007570] text-white border-0 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#005a58]">
                          Lihat Paket Iklan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  advertisements.map((ad) => (
                    <tr key={ad.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                        <div className="flex items-center gap-[10px]">
                          <img
                            src={ad.business?.logo || "https://via.placeholder.com/40"}
                            alt={ad.business?.name}
                            className="w-[32px] h-[32px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0"
                          />
                          <span>{ad.business?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{ad.user?.name || '-'}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{ad.user?.email || '-'}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                        <span className="inline-flex items-center px-[8px] py-[3px] bg-[rgba(0,117,112,0.12)] text-[#007570] rounded-[6px] text-[12px] font-semibold">
                          {ad.package_name}
                        </span>
                      </td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">Rp {ad.price?.toLocaleString('id-ID')}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                        <button
                          type="button"
                          className={`${getAdStatusBadgeClass(ad.computed_status || ad.status)} cursor-pointer hover:opacity-80 border-0 bg-transparent p-0`}
                          onClick={() => handleToggleAdStatus(ad.id)}
                          title="Klik untuk mengubah status iklan (Aktif/Nonaktif)"
                        >
                          {getAdStatusLabel(ad.computed_status || ad.status)}
                        </button>
                      </td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                        <span className={getBadgeClass(ad.payment_status)}>
                          {ad.payment_status === 'paid' ? 'Lunas' : ad.payment_status === 'unpaid' ? 'Belum Bayar' : ad.payment_status}
                        </span>
                      </td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                        {ad.payment_proof ? (
                          <button
                            className="inline-flex items-center gap-[4px] px-[10px] py-[4px] bg-[rgba(0,117,112,0.12)] text-[#007570] border-0 rounded-[6px] text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#007570] hover:text-white"
                            onClick={() => window.open(ad.payment_proof, '_blank')}
                          >
                            <Eye size={14} strokeWidth={2} />
                            Lihat
                          </button>
                        ) : (
                          <span className="text-[#94a3b8]">-</span>
                        )}
                      </td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{ad.created_at ? new Date(ad.created_at).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{ad.duration || '-'}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{ad.expired_at ? new Date(ad.expired_at).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0 whitespace-nowrap">
                        <div className="flex items-center gap-[6px]">
                          <button
                            type="button"
                            className="px-[10px] py-[5px] bg-[#f1f5f9] text-[#0f172a] border-0 rounded-[7px] cursor-pointer transition-all flex items-center gap-[4px] text-[12px] font-semibold hover:bg-[#007570] hover:text-white"
                            onClick={() => handleModal("viewAdDetail", ad)}
                            title="Lihat Detail Iklan"
                          >
                            <Eye size={14} strokeWidth={2} />
                            Detail
                          </button>
                          <button
                            type="button"
                            className="px-[10px] py-[5px] bg-[#dcfce7] text-[#16a34a] border-0 rounded-[7px] cursor-pointer transition-all flex items-center gap-[4px] text-[12px] font-semibold hover:bg-[#16a34a] hover:text-white"
                            onClick={() => handleApproveAd(ad.id)}
                            title="Terima / Setujui Iklan"
                          >
                            <Check size={14} strokeWidth={2} />
                            Terima
                          </button>
                          <button
                            type="button"
                            className="px-[10px] py-[5px] bg-[#fef3c7] text-[#d97706] border-0 rounded-[7px] cursor-pointer transition-all flex items-center gap-[4px] text-[12px] font-semibold hover:bg-[#d97706] hover:text-white"
                            onClick={() => handleRejectAd(ad.id)}
                            title="Tolak Iklan"
                          >
                            <X size={14} strokeWidth={2} />
                            Tolak
                          </button>
                          <button
                            type="button"
                            className="px-[10px] py-[5px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all flex items-center gap-[4px] text-[12px] font-semibold hover:bg-[#dc2626] hover:text-white"
                            onClick={() => handleModal("deleteAd", ad)}
                            title="Hapus Iklan"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Packages Tab */}
      {adsTab === "packages" && (
        <div className="flex flex-col gap-[16px]">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-bold text-[#0f172a]">Daftar Paket Iklan</h3>
            <button
              className="inline-flex items-center gap-[6px] px-[18px] py-[9px] bg-[#007570] text-white border-0 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#005a58]"
              onClick={() => handleModal("addAdPackage", null)}
            >
              <Plus size={16} strokeWidth={2} />
              Tambah Paket
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[16px]">
            {adPackages.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-[48px_24px] gap-[14px] text-[#94a3b8] text-center min-h-[300px] bg-white rounded-[14px] border border-[#e2e8f0]">
                <Crown size={64} strokeWidth={1} className="opacity-[0.35]" />
                <p className="text-[14px] text-[#64748b] font-medium">Belum ada paket iklan.</p>
                <button
                  className="inline-flex items-center gap-[6px] px-[18px] py-[9px] bg-[#007570] text-white border-0 rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#005a58]"
                  onClick={() => handleModal("addAdPackage", null)}
                >
                  <Plus size={16} strokeWidth={2} />
                  Tambah Paket
                </button>
              </div>
            ) : (
              adPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-[14px] overflow-hidden border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col">
                  <div className="bg-gradient-to-br from-[#007570] to-[#00b3ab] p-[20px_16px] text-center text-white">
                    <div className="mb-[8px] opacity-90 flex justify-center">
                      <Megaphone size={32} strokeWidth={2} />
                    </div>
                    <h3 className="text-[16px] font-bold mb-[4px]">{pkg.name}</h3>
                    <p className="text-[18px] font-extrabold">Rp {Number(pkg.price)?.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-[14px_16px] flex flex-col gap-[8px] flex-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#64748b] font-medium">Durasi</span>
                      <span className="text-[#0f172a] font-semibold">{pkg.formatted_duration || `${pkg.duration_value} ${pkg.duration_unit}`}</span>
                    </div>
                    <div className="flex flex-col gap-[4px] pt-[6px] border-t border-[#f1f5f9]">
                      <span className="text-[#64748b] text-[12px] font-semibold uppercase tracking-[0.4px]">Fitur Paket:</span>
                      <div className="flex flex-col gap-[4px]">
                        <span className={`text-[12.5px] font-medium flex items-center gap-[6px] ${pkg.features?.advertisement_page ? 'text-[#16a34a]' : 'text-[#94a3b8] line-through'}`}>
                          {pkg.features?.advertisement_page ? '✓' : '✕'} Halaman Iklan
                        </span>
                        <span className={`text-[12.5px] font-medium flex items-center gap-[6px] ${pkg.features?.search_priority ? 'text-[#16a34a]' : 'text-[#94a3b8] line-through'}`}>
                          {pkg.features?.search_priority ? '✓' : '✕'} Prioritas Hasil Pencarian
                        </span>
                        <span className={`text-[12.5px] font-medium flex items-center gap-[6px] ${pkg.features?.premium_badge ? 'text-[#16a34a]' : 'text-[#94a3b8] line-through'}`}>
                          {pkg.features?.premium_badge ? '✓' : '✕'} Badge Premium
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-[8px] p-[12px_16px] border-t border-[#e2e8f0] bg-[#fafbff]">
                    <button
                      className="flex-1 flex items-center justify-center gap-[6px] p-[8px] rounded-[8px] border-0 font-['Poppins','Inter',sans-serif] text-[12px] font-semibold cursor-pointer transition-all duration-200 bg-[rgba(0,117,112,0.12)] text-[#007570] hover:bg-[#007570] hover:text-white"
                      onClick={() => handleModal("editAdPackage", pkg)}
                    >
                      <Edit size={16} strokeWidth={2} />
                      Edit
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-[6px] p-[8px] rounded-[8px] border-0 font-['Poppins','Inter',sans-serif] text-[12px] font-semibold cursor-pointer transition-all duration-200 bg-[#fee2e2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                      onClick={() => handleModal("deleteAdPackage", pkg)}
                    >
                      <Trash2 size={16} strokeWidth={2} />
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );



  // ── Kelola Blog & Event View ──
  const renderBlogs = () => {
    const totalBlogsCount = blogs.filter((b) => b.type !== "event").length;
    const totalEventsCount = blogs.filter((b) => b.type === "event").length;
    const pendingCount = blogs.filter((b) => b.status === "pending").length;
    const approvedCount = blogs.filter((b) => b.status === "approved" || b.status === "published").length;
    const totalViews = blogs.reduce((sum, b) => sum + Number(b.views || 0), 0);

    const categoriesList = Array.from(
      new Set(blogs.map((b) => b.blog_category || b.category?.name).filter(Boolean))
    );

    const filteredBlogs = blogs.filter((item) => {
      // Sub-tab filter (all, blog, event)
      if (blogTab === "blog" && item.type === "event") return false;
      if (blogTab === "event" && item.type !== "event") return false;

      // Search
      const searchMatch =
        !blogSearch ||
        item.title?.toLowerCase().includes(blogSearch.toLowerCase()) ||
        item.author?.toLowerCase().includes(blogSearch.toLowerCase()) ||
        item.user?.name?.toLowerCase().includes(blogSearch.toLowerCase()) ||
        item.excerpt?.toLowerCase().includes(blogSearch.toLowerCase());

      // Status
      const statusMatch =
        !blogStatusFilter ||
        (blogStatusFilter === "approved"
          ? item.status === "approved" || item.status === "published"
          : item.status === blogStatusFilter);

      // Category
      const catMatch =
        !blogCategoryFilter ||
        (item.blog_category || item.category?.name) === blogCategoryFilter;

      return searchMatch && statusMatch && catMatch;
    });

    const perPage = 10;
    const totalPages = Math.ceil(filteredBlogs.length / perPage) || 1;
    const paginatedBlogs = filteredBlogs.slice((blogPage - 1) * perPage, blogPage * perPage);

    return (
      <div className="flex flex-col gap-[24px] mb-[28px]">
        {/* Header & Description */}
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3.5px] before:h-[22px] before:bg-[#007570] before:rounded-[2px]">
            Blog & Event
          </h2>
          <p className="text-[13px] text-[#64748b] pl-[14px]">
            Kelola publikasi artikel blog, berita, serta agenda event/acara dari pengguna dan admin secara terpusat.
          </p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-[14px]">
          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Total Konten</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f0fdfa] text-[#007570] flex items-center justify-center">
                <FileText size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{blogs.length}</span>
            <span className="text-[11px] text-[#64748b]">Keseluruhan publikasi</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Artikel & Blog</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center">
                <FileText size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{totalBlogsCount}</span>
            <span className="text-[11px] text-[#64748b]">Artikel & berita</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Acara & Event</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{totalEventsCount}</span>
            <span className="text-[11px] text-[#64748b]">Agenda & festival</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Persetujuan</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#d97706]">{pendingCount}</span>
            <span className="text-[11px] text-[#64748b]">Menunggu dikonfirmasi</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Total Views</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <Eye size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#16a34a]">{totalViews.toLocaleString("id-ID")}</span>
            <span className="text-[11px] text-[#64748b]">Total akumulasi pembaca</span>
          </div>
        </div>

        {/* ── Sub-Tab Separator & Action Bar ── */}
        <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-[20px] shadow-sm flex flex-col gap-[16px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[14px]">
            {/* Pemisah Sub-Tab Blog vs Event */}
            <div className="flex items-center gap-[6px] bg-[#f1f5f9] p-[4px] rounded-[10px] w-fit">
              <button
                onClick={() => { setBlogTab("all"); setBlogPage(1); }}
                className={`px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${
                  blogTab === "all"
                    ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                Semua Konten ({blogs.length})
              </button>
              <button
                onClick={() => { setBlogTab("blog"); setBlogPage(1); }}
                className={`flex items-center gap-[6px] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${
                  blogTab === "blog"
                    ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <FileText size={15} />
                <span>Artikel & Blog ({totalBlogsCount})</span>
              </button>
              <button
                onClick={() => { setBlogTab("event"); setBlogPage(1); }}
                className={`flex items-center gap-[6px] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${
                  blogTab === "event"
                    ? "bg-white text-[#7e22ce] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                <Calendar size={15} />
                <span>Acara & Event ({totalEventsCount})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setBlogForm({
                  title: "",
                  type: blogTab === "event" ? "event" : "blog",
                  blog_category: "Kuliner",
                  excerpt: "",
                  content: "",
                  thumbnail: "",
                  event_date: "",
                  event_location: "",
                  status: "approved",
                });
                setModal({ show: true, type: "addBlog", data: null });
              }}
              className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-[#007570] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#005a58] transition-all shadow-[0_2px_8px_rgba(0,117,112,0.25)]"
            >
              <Plus size={16} />
              <span>{blogTab === "event" ? "Tambah Event Baru" : "Tambah Artikel/Event"}</span>
            </button>
          </div>

          {/* Search & Filters Controls */}
          <div className="flex items-center flex-wrap gap-[10px]">
            <div className="relative min-w-[220px] flex-1">
              <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Cari judul, penulis, deskripsi..."
                value={blogSearch}
                onChange={(e) => {
                  setBlogSearch(e.target.value);
                  setBlogPage(1);
                }}
                className="w-full pl-[36px] pr-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570] focus:bg-white transition-all"
              />
            </div>

            <select
              value={blogStatusFilter}
              onChange={(e) => {
                setBlogStatusFilter(e.target.value);
                setBlogPage(1);
              }}
              className="px-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570]"
            >
              <option value="">Semua Status</option>
              <option value="approved">Disetujui / Published</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="rejected">Ditolak</option>
            </select>

            {categoriesList.length > 0 && (
              <select
                value={blogCategoryFilter}
                onChange={(e) => {
                  setBlogCategoryFilter(e.target.value);
                  setBlogPage(1);
                }}
                className="px-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570]"
              >
                <option value="">Semua Kategori</option>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-[#e2e8f0] rounded-[12px]">
            <table className="w-full text-left border-collapse font-['Poppins',sans-serif]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11.5px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="px-[16px] py-[12px]">Judul & Konten</th>
                  <th className="px-[16px] py-[12px]">Penulis / Bisnis</th>
                  <th className="px-[16px] py-[12px]">Kategori</th>
                  <th className="px-[16px] py-[12px]">Detail & Waktu</th>
                  <th className="px-[16px] py-[12px]">Status</th>
                  <th className="px-[16px] py-[12px]">Pembaca</th>
                  <th className="px-[16px] py-[12px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#0f172a]">
                {paginatedBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-[16px] py-[40px] text-center text-[#94a3b8] text-[13px]">
                      <div className="flex flex-col items-center gap-[8px]">
                        <FileText size={32} className="text-[#cbd5e1]" />
                        <span>Tidak ada data blog/event yang cocok.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBlogs.map((row) => {
                    const isEvent = row.type === "event";
                    return (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        {/* Judul & Thumbnail */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex items-center gap-[12px]">
                            <img
                              src={row.thumbnail || row.img || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop"}
                              alt={row.title}
                              className="w-[44px] h-[44px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-[6px]">
                                <span
                                  className={`text-[10.5px] font-bold px-[6px] py-[1.5px] rounded-[5px] uppercase ${
                                    isEvent
                                      ? "bg-[#f3e8ff] text-[#7e22ce]"
                                      : "bg-[#e0f2fe] text-[#0369a1]"
                                  }`}
                                >
                                  {isEvent ? "Event" : "Blog"}
                                </span>
                                <span className="font-bold text-[#0f172a] truncate max-w-[260px]">
                                  {row.title}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#64748b] truncate max-w-[280px] mt-[2px]">
                                {row.excerpt || row.description || "Tidak ada deskripsi singkat."}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Penulis / Bisnis */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#0f172a]">
                              {row.user?.name || row.author || "Admin"}
                            </span>
                            <span className="text-[11px] text-[#64748b]">
                              {row.business?.name || row.user?.email || "Admin Portal"}
                            </span>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="px-[16px] py-[12px]">
                          <span className="inline-flex items-center px-[8px] py-[3px] bg-[#f1f5f9] text-[#475569] rounded-[6px] text-[11.5px] font-semibold">
                            {row.blog_category || row.category?.name || "Umum"}
                          </span>
                        </td>

                        {/* Detail Waktu / Lokasi */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex flex-col text-[11.5px] text-[#64748b]">
                            {isEvent ? (
                              <>
                                <span className="font-medium text-[#7e22ce] flex items-center gap-[4px]">
                                  <Calendar size={13} /> {row.event_date ? new Date(row.event_date).toLocaleDateString("id-ID") : "Tanggal TBD"}
                                </span>
                                <span>📍 {row.event_location || "Lokasi TBD"}</span>
                              </>
                            ) : (
                              <span>📅 {row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-"}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-[16px] py-[12px]">
                          <span className={getBadgeClass(row.status === "published" ? "approved" : row.status)}>
                            {row.status === "published" || row.status === "approved"
                              ? "Disetujui"
                              : row.status === "pending"
                              ? "Menunggu"
                              : "Ditolak"}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-[16px] py-[12px]">
                          <span className="text-[12px] font-semibold text-[#64748b]">
                            👁️ {Number(row.views || 0).toLocaleString("id-ID")}
                          </span>
                        </td>

                        {/* Aksi */}
                        <td className="px-[16px] py-[12px] text-right">
                          <div className="flex items-center justify-end gap-[6px]">
                            {row.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveBlog(row.id)}
                                  className="px-[8px] py-[4px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold hover:bg-[#bbf7d0]"
                                  title="Setujui Publikasi"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectBlog(row.id)}
                                  className="px-[8px] py-[4px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11px] font-bold hover:bg-[#fca5a5]"
                                  title="Tolak Publikasi"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setBlogForm({
                                  title: row.title || "",
                                  type: row.type || "blog",
                                  blog_category: row.blog_category || row.category?.name || "Kuliner",
                                  excerpt: row.excerpt || "",
                                  content: row.content || "",
                                  thumbnail: row.thumbnail || row.img || "",
                                  event_date: row.event_date ? row.event_date.split("T")[0] : "",
                                  event_location: row.event_location || "",
                                  status: row.status || "approved",
                                });
                                setModal({ show: true, type: "editBlog", data: row });
                              }}
                              className="p-[6px] bg-[#f1f5f9] text-[#475569] rounded-[6px] hover:bg-[#e2e8f0]"
                              title="Edit Blog / Event"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              onClick={() => setModal({ show: true, type: "deleteBlog", data: row })}
                              className="p-[6px] bg-[#fef2f2] text-[#dc2626] rounded-[6px] hover:bg-[#fee2e2]"
                              title="Hapus Blog / Event"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between text-[12.5px] text-[#64748b]">
            <span>Menampilkan {paginatedBlogs.length} dari {filteredBlogs.length} konten</span>
            <div className="flex items-center gap-[6px]">
              <button
                disabled={blogPage <= 1}
                onClick={() => setBlogPage((p) => p - 1)}
                className="px-[12px] py-[6px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Sebelumnya
              </button>
              <span className="font-bold text-[#0f172a] px-[8px]">
                {blogPage} / {totalPages}
              </span>
              <button
                disabled={blogPage >= totalPages}
                onClick={() => setBlogPage((p) => p + 1)}
                className="px-[12px] py-[6px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Laporan Report Management View ──
  const renderReports = () => {
    const totalReports = reportStats.total || reportsList.length;
    const baruCount = reportStats.baru || reportsList.filter((r) => r.status === "baru").length;
    const diprosesCount = reportStats.diproses || reportsList.filter((r) => r.status === "diproses").length;
    const selesaiCount = reportStats.selesai || reportsList.filter((r) => r.status === "selesai").length;
    const ditolakCount = reportStats.ditolak || reportsList.filter((r) => r.status === "ditolak").length;
    const bizReportCount = reportStats.businessCount || reportsList.filter((r) => r.reportable_type === "business").length;
    const blogReportCount = reportStats.blogCount || reportsList.filter((r) => r.reportable_type === "blog").length;
    const eventReportCount = reportStats.eventCount || reportsList.filter((r) => r.reportable_type === "event").length;

    const filteredReports = reportsList.filter((item) => {
      // Type Sub-Tab
      if (reportTypeTab !== "all" && item.reportable_type !== reportTypeTab) return false;

      // Search
      const searchMatch =
        !reportSearch ||
        item.reporter_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
        item.content_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
        item.content_owner?.toLowerCase().includes(reportSearch.toLowerCase()) ||
        item.reason?.toLowerCase().includes(reportSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(reportSearch.toLowerCase());

      // Status
      const statusMatch = !reportStatusFilter || item.status === reportStatusFilter;

      return searchMatch && statusMatch;
    });

    const perPage = 10;
    const totalPages = Math.ceil(filteredReports.length / perPage) || 1;
    const paginatedReports = filteredReports.slice((reportPage - 1) * perPage, reportPage * perPage);

    return (
      <div className="flex flex-col gap-[24px] mb-[28px]">
        {/* Header */}
        <div className="flex flex-col gap-[4px]">
          <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3.5px] before:h-[22px] before:bg-[#007570] before:rounded-[2px]">
            Laporan Report Pelanggaran
          </h2>
          <p className="text-[13px] text-[#64748b] pl-[14px]">
            Kelola dan tindak lanjuti laporan pengaduan dari pengguna mengenai pelanggaran konten Usaha, Blog, atau Event.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-[12px]">
          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#64748b] uppercase">Total Report</span>
            <span className="text-[20px] font-bold text-[#0f172a]">{totalReports}</span>
            <span className="text-[10.5px] text-[#64748b]">Semua laporan</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#d97706] uppercase">Report Baru</span>
            <span className="text-[20px] font-bold text-[#d97706]">{baruCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Belum diproses</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#0284c7] uppercase">Sedang Diproses</span>
            <span className="text-[20px] font-bold text-[#0284c7]">{diprosesCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Dalam pengawasan</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#16a34a] uppercase">Selesai</span>
            <span className="text-[20px] font-bold text-[#16a34a]">{selesaiCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Telah ditindak</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#007570] uppercase">Report Usaha</span>
            <span className="text-[20px] font-bold text-[#007570]">{bizReportCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Pelanggaran bisnis</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#1d4ed8] uppercase">Report Blog</span>
            <span className="text-[20px] font-bold text-[#1d4ed8]">{blogReportCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Pelanggaran artikel</span>
          </div>

          <div className="bg-white rounded-[14px] p-[14px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[6px]">
            <span className="text-[11px] font-semibold text-[#7e22ce] uppercase">Report Event</span>
            <span className="text-[20px] font-bold text-[#7e22ce]">{eventReportCount}</span>
            <span className="text-[10.5px] text-[#64748b]">Pelanggaran event</span>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-[20px] shadow-sm flex flex-col gap-[16px]">
          {/* Sub-Tab Filter Tipe Konten */}
          <div className="flex items-center justify-between flex-wrap gap-[12px]">
            <div className="flex items-center gap-[6px] bg-[#f1f5f9] p-[4px] rounded-[10px]">
              <button
                onClick={() => { setReportTypeTab("all"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${
                  reportTypeTab === "all" ? "bg-white text-[#007570] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                Semua Report ({reportsList.length})
              </button>
              <button
                onClick={() => { setReportTypeTab("business"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${
                  reportTypeTab === "business" ? "bg-white text-[#007570] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                🏬 Usaha ({bizReportCount})
              </button>
              <button
                onClick={() => { setReportTypeTab("blog"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${
                  reportTypeTab === "blog" ? "bg-white text-[#1d4ed8] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                📝 Blog ({blogReportCount})
              </button>
              <button
                onClick={() => { setReportTypeTab("event"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${
                  reportTypeTab === "event" ? "bg-white text-[#7e22ce] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                📅 Event ({eventReportCount})
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-[10px] flex-1 max-w-[400px]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Cari pelapor, judul konten, alasan..."
                  value={reportSearch}
                  onChange={(e) => { setReportSearch(e.target.value); setReportPage(1); }}
                  className="w-full pl-[34px] pr-[12px] py-[7px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12px] font-medium text-[#0f172a] outline-none focus:border-[#007570] focus:bg-white transition-all"
                />
              </div>

              <select
                value={reportStatusFilter}
                onChange={(e) => { setReportStatusFilter(e.target.value); setReportPage(1); }}
                className="px-[10px] py-[7px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12px] font-medium text-[#0f172a] outline-none focus:border-[#007570]"
              >
                <option value="">Semua Status</option>
                <option value="baru">Baru</option>
                <option value="diproses">Sedang Diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-[#e2e8f0] rounded-[12px]">
            <table className="w-full text-left border-collapse font-['Poppins',sans-serif]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="px-[14px] py-[10px]">ID & Pelapor</th>
                  <th className="px-[14px] py-[10px]">Jenis & Konten</th>
                  <th className="px-[14px] py-[10px]">Pemilik Konten</th>
                  <th className="px-[14px] py-[10px]">Alasan Report</th>
                  <th className="px-[14px] py-[10px]">Tanggal</th>
                  <th className="px-[14px] py-[10px]">Status</th>
                  <th className="px-[14px] py-[10px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[12.5px] text-[#0f172a]">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-[16px] py-[36px] text-center text-[#94a3b8]">
                      <div className="flex flex-col items-center gap-[6px]">
                        <AlertTriangle size={28} className="text-[#cbd5e1]" />
                        <span>Belum ada laporan pengaduan yang sesuai.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((row) => {
                    const isBiz = row.reportable_type === "business";
                    const isBlog = row.reportable_type === "blog";
                    const isEvent = row.reportable_type === "event";

                    const typeBadge = isBiz
                      ? "bg-[#e0f2fe] text-[#0369a1]"
                      : isBlog
                      ? "bg-[#dbeafe] text-[#1d4ed8]"
                      : "bg-[#f3e8ff] text-[#7e22ce]";

                    const statusBadge =
                      row.status === "baru"
                        ? "bg-[#fef3c7] text-[#d97706]"
                        : row.status === "diproses"
                        ? "bg-[#e0f2fe] text-[#0284c7]"
                        : row.status === "selesai"
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#fee2e2] text-[#dc2626]";

                    return (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        {/* ID & Pelapor */}
                        <td className="px-[14px] py-[11px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#007570] font-mono text-[11.5px]">
                              #REP-{String(row.id).padStart(3, "0")}
                            </span>
                            <span className="font-semibold text-[#0f172a] mt-[1px]">
                              {row.reporter_name}
                            </span>
                            <span className="text-[10.5px] text-[#64748b]">{row.reporter_email}</span>
                          </div>
                        </td>

                        {/* Jenis & Konten */}
                        <td className="px-[14px] py-[11px]">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={row.content_image || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&h=80&fit=crop"}
                              alt={row.content_name}
                              className="w-[36px] h-[36px] rounded-[6px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className={`text-[10px] font-bold px-[5px] py-[1px] rounded-[4px] uppercase w-fit ${typeBadge}`}>
                                {isBiz ? "Usaha" : isBlog ? "Blog" : "Event"}
                              </span>
                              <span className="font-bold text-[#0f172a] truncate max-w-[200px] mt-[2px]">
                                {row.content_name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Pemilik Konten */}
                        <td className="px-[14px] py-[11px]">
                          <span className="font-medium text-[#475569]">{row.content_owner}</span>
                        </td>

                        {/* Alasan Report */}
                        <td className="px-[14px] py-[11px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#dc2626]">{row.reason}</span>
                            {row.description && (
                              <span className="text-[10.5px] text-[#64748b] truncate max-w-[220px]">
                                {row.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tanggal */}
                        <td className="px-[14px] py-[11px]">
                          <span className="text-[11.5px] text-[#64748b] whitespace-nowrap">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-[14px] py-[11px]">
                          <span className={`inline-flex items-center px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold uppercase ${statusBadge}`}>
                            {row.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-[14px] py-[11px] text-right">
                          <div className="flex items-center justify-end gap-[6px]">
                            <button
                              onClick={() => setModal({ show: true, type: "viewReportDetail", data: row })}
                              className="px-[8px] py-[4px] bg-[#f1f5f9] text-[#007570] rounded-[6px] text-[11px] font-bold hover:bg-[#007570] hover:text-white transition-all"
                            >
                              Detail
                            </button>

                            {row.status === "baru" && (
                              <button
                                onClick={() => handleUpdateReportStatus(row.id, "diproses")}
                                className="px-[8px] py-[4px] bg-[#e0f2fe] text-[#0284c7] rounded-[6px] text-[11px] font-bold hover:bg-[#0284c7] hover:text-white transition-all"
                              >
                                Proses
                              </button>
                            )}

                            {row.status !== "selesai" && (
                              <button
                                onClick={() => setModal({ show: true, type: "deleteReportedContent", data: row })}
                                className="px-[8px] py-[4px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11px] font-bold hover:bg-[#dc2626] hover:text-white transition-all"
                                title="Hapus Konten yang Melanggar"
                              >
                                Hapus Konten
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between text-[12px] text-[#64748b]">
            <span>Menampilkan {paginatedReports.length} dari {filteredReports.length} report</span>
            <div className="flex items-center gap-[6px]">
              <button
                disabled={reportPage <= 1}
                onClick={() => setReportPage((p) => p - 1)}
                className="px-[12px] py-[5px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Sebelumnya
              </button>
              <span className="font-bold text-[#0f172a] px-[6px]">
                {reportPage} / {totalPages}
              </span>
              <button
                disabled={reportPage >= totalPages}
                onClick={() => setReportPage((p) => p + 1)}
                className="px-[12px] py-[5px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="mb-[28px]">
      <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] mb-[18px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Pengaturan Website</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[14px] mb-[18px]">
        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Informasi Website</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Website</label>
            <input type="text" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="Info.co.id" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Logo</label>
            <input type="file" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" accept="image/*" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Banner</label>
            <input type="file" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" accept="image/*" multiple />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Kontak</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Email</label>
            <input type="email" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="info@info.co.id" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Telepon</label>
            <input type="tel" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="+62 21 1234 5678" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Alamat</label>
            <textarea className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] resize-y min-h-[70px]" defaultValue="Jakarta, Indonesia" rows={3} />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Media Sosial</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Instagram</label>
            <input type="url" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="https://instagram.com/info.co.id" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Facebook</label>
            <input type="url" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="https://facebook.com/info.co.id" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Website</label>
            <input type="url" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="https://info.co.id" />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">SEO Dasar</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Meta Title</label>
            <input type="text" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="Info.co.id - Semua Ada Disini" />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Meta Description</label>
            <textarea className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] resize-y min-h-[70px]" defaultValue="Platform informasi bisnis terlengkap di Indonesia" rows={3} />
          </div>
        </div>
      </div>

      <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]">Simpan Perubahan</button>
    </div>
  );

  const renderCoupons = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola Kupon Diskon</h2>
        <button
          className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]"
          onClick={() => handleModal("addCoupon")}
        >
          <Plus size={18} strokeWidth={2} />
          <span>Tambah Kupon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px] mb-[20px]">
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#007570] to-[#00b3ab]">
            <Ticket size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{coupons.length}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Kupon</span>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#10b981] to-[#34d399]">
            <Check size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{coupons.filter(c => c.is_active).length}</span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Kupon Aktif</span>
          </div>
        </div>
        <div className="group relative bg-white rounded-[14px] p-[20px_18px] flex items-center gap-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]">
            <RefreshCw size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">
              {coupons.reduce((acc, curr) => acc + (curr.used_count || 0), 0)}
            </span>
            <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Penggunaan</span>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-[12px] px-[16px] py-[14px] mb-[16px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap gap-[10px] items-center max-md:flex-col">
          <div className="flex items-center gap-[8px] flex-1 min-w-[180px] max-md:min-w-0 max-md:w-full bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] px-[12px] py-[7px]">
            <Search size={16} className="text-[#64748b] shrink-0" />
            <input
              type="text"
              placeholder="Cari kode kupon / deskripsi..."
              value={couponFilters.search}
              onChange={(e) => setCouponFilters({ ...couponFilters, search: e.target.value })}
              className="flex-1 border-0 outline-none bg-transparent font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a]"
            />
          </div>
          <select
            value={couponFilters.status}
            onChange={(e) => setCouponFilters({ ...couponFilters, status: e.target.value })}
            className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select
            value={couponFilters.appliesTo}
            onChange={(e) => setCouponFilters({ ...couponFilters, appliesTo: e.target.value })}
            className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
          >
            <option value="">Semua Peruntukan</option>
            <option value="premium">Paket Premium</option>
            <option value="ads">Paket Iklan</option>
            <option value="all">Semua Paket</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[850px]">
          <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
            <tr>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Kode Kupon</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Nama / Deskripsi</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Diskon</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Berlaku Untuk</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Min Transaksi</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Penggunaan</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Masa Berlaku</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center p-[36px]">
                  <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                    <Ticket size={48} strokeWidth={1} className="opacity-40" />
                    <p className="text-[14px] text-[#64748b] font-medium">Belum ada kupon diskon.</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons
                .filter((c) => {
                  const matchSearch =
                    !couponFilters.search ||
                    c.code?.toLowerCase().includes(couponFilters.search.toLowerCase()) ||
                    c.name?.toLowerCase().includes(couponFilters.search.toLowerCase());
                  const matchStatus =
                    !couponFilters.status ||
                    (couponFilters.status === "active" ? c.is_active : !c.is_active);
                  const matchApplies =
                    !couponFilters.appliesTo || c.applies_to === couponFilters.appliesTo;
                  return matchSearch && matchStatus && matchApplies;
                })
                .map((coupon) => (
                  <tr key={coupon.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-bold align-middle [tr:last-child_&]:border-b-0">
                      <span className="inline-flex items-center gap-[6px] px-[9px] py-[4px] bg-[#f0fdfa] text-[#007570] border border-[rgba(0,117,112,0.25)] rounded-[6px] font-mono tracking-[0.5px]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {coupon.name || coupon.description || "-"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-semibold align-middle [tr:last-child_&]:border-b-0">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `Rp ${coupon.discount_value?.toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={`inline-flex items-center px-[8px] py-[3px] rounded-[6px] text-[11.5px] font-semibold ${
                        coupon.applies_to === "premium"
                          ? "bg-[#f3e8ff] text-[#7e22ce]"
                          : coupon.applies_to === "ads"
                          ? "bg-[#e0f2fe] text-[#0369a1]"
                          : "bg-[#e6f4ea] text-[#137333]"
                      }`}>
                        {coupon.applies_to === "premium"
                          ? "Paket Premium"
                          : coupon.applies_to === "ads"
                          ? "Paket Iklan"
                          : "Semua Paket"}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {coupon.minimum_amount > 0
                        ? `Rp ${coupon.minimum_amount?.toLocaleString("id-ID")}`
                        : "-"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {coupon.used_count ?? 0} / {coupon.usage_limit ? coupon.usage_limit : "∞"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[12px] text-[#64748b] font-medium align-middle [tr:last-child_&]:border-b-0">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString("id-ID")
                        : "Selamanya"}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <span className={getBadgeClass(coupon.is_active ? "active" : "inactive")}>
                        {coupon.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[5px]">
                        <button
                          className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white"
                          onClick={() => handleModal("editCoupon", coupon)}
                          title="Edit"
                        >
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button
                          className={`w-[30px] h-[30px] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 ${
                            coupon.is_active
                              ? "bg-[#fef3c7] text-[#d97706] hover:bg-[#d97706] hover:text-white"
                              : "bg-[#dcfce7] text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                          }`}
                          onClick={() => handleToggleCouponStatus(coupon.id)}
                          title={coupon.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <RefreshCw size={16} strokeWidth={2} />
                        </button>
                        <button
                          className="w-[30px] h-[30px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white"
                          onClick={() => handleModal("deleteCoupon", coupon)}
                          title="Hapus"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Notifikasi Admin</h2>
        {unreadNotificationsCount > 0 && (
          <button
            className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] border border-[#e2e8f0] bg-white text-[#007570] font-semibold text-[12px] cursor-pointer hover:bg-[#f0fdfa]"
            onClick={handleMarkAllNotificationsRead}
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[10px]">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[14px] p-[36px] text-center border border-[#e2e8f0] text-[#94a3b8]">
            <Bell size={48} strokeWidth={1} className="mx-auto mb-[12px] opacity-40" />
            <p className="text-[14px] font-medium text-[#64748b]">Belum ada notifikasi aktivitas terbaru.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center gap-[12px] p-[14px] rounded-[12px] border transition-all duration-220 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
                !notif.is_read ? 'bg-[#f0fdfa] border-[rgba(0,117,112,0.25)]' : 'bg-white border-[#e2e8f0]'
              }`}
            >
              <div className={`w-[46px] h-[46px] rounded-[12px] flex items-center justify-center shrink-0 ${
                notif.type?.includes('approved') || notif.type?.includes('success') ? 'bg-[#dcfce7] text-[#16a34a]' :
                notif.type?.includes('rejected') || notif.type?.includes('suspended') ? 'bg-[#fee2e2] text-[#dc2626]' :
                notif.type?.includes('user') ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#fef3c7] text-[#d97706]'
              }`}>
                {notif.type?.includes('approved') || notif.type?.includes('success') ? <Check size={18} strokeWidth={2} /> :
                 notif.type?.includes('rejected') || notif.type?.includes('suspended') ? <X size={18} strokeWidth={2} /> :
                 notif.type?.includes('user') ? <User size={18} strokeWidth={2} /> : <Clock size={18} strokeWidth={2} />}
              </div>
              <div className="flex-1">
                <span className="text-[13px] font-bold text-[#0f172a] block mb-[3px]">{notif.title}</span>
                <span className="text-[12px] text-[#64748b] font-medium block mb-[3px]">{notif.description}</span>
                <span className="text-[11px] text-[#94a3b8] font-medium">{notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID') : '-'}</span>
              </div>
              {!notif.is_read && (
              <button
                  className="bg-[#007570] text-white border-0 px-[14px] py-[7px] rounded-[7px] text-[12px] font-semibold cursor-pointer transition-all duration-200 shrink-0 hover:bg-[#005a58]"
                  onClick={() => handleMarkNotificationRead(notif.id)}
                >
                  Dibaca
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── Paket Premium Management View ──
  const renderPremium = () => {
    const premiumBusinesses = businesses.filter((b) => b.is_premium);

    const totalPlans = plans.length;
    const totalPremiumUsers = subscriptions.length > 0
      ? new Set(subscriptions.map((s) => s.user_id || s.user?.id)).size
      : new Set(premiumBusinesses.map((b) => b.user_id)).size;
    const totalPremiumBusinesses = premiumBusinesses.length;

    const activeSubs = subscriptions.filter((s) => s.status === "active");
    const totalActive = activeSubs.length || totalPremiumBusinesses;

    const expiredSubs = subscriptions.filter((s) => s.status === "expired" || s.status === "cancelled");
    const totalExpired = expiredSubs.length;

    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = subscriptions.filter((s) => {
      if (s.status !== "active" || !s.ends_at) return false;
      const end = new Date(s.ends_at);
      return end >= now && end <= sevenDays;
    }).length;

    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const tableData = subscriptions.length > 0
      ? subscriptions.map((sub) => {
          const b = businesses.find((biz) => biz.id === sub.business_id || biz.user_id === sub.user_id);
          const p = payments.find((pay) => pay.subscription_id === sub.id || pay.id === sub.payment_id);
          return {
            id: sub.id,
            user: sub.user || { name: "User #" + sub.user_id, email: "-" },
            business: b || sub.business || { name: "Usaha #" + (sub.business_id || "-"), category: { name: "Umum" } },
            plan: sub.plan || plans.find((pl) => pl.id === sub.plan_id) || { name: "Premium 1", price: 50000 },
            starts_at: sub.starts_at,
            ends_at: sub.ends_at,
            status: sub.status || "active",
            payment_status: p?.status || (sub.status === "active" ? "paid" : "pending"),
            payment_id: p?.id,
          };
        })
      : premiumBusinesses.map((b) => {
          return {
            id: b.id,
            user: b.user || { name: b.user_name || "Pemilik Bisnis", email: "-" },
            business: b,
            plan: plans.find((pl) => pl.id === 2) || { name: "Premium 1", price: 50000 },
            starts_at: b.created_at,
            ends_at: null,
            status: "active",
            payment_status: "paid",
            payment_id: null,
          };
        });

    const filteredTableData = tableData.filter((item) => {
      const matchSearch =
        !premiumSearch ||
        item.user?.name?.toLowerCase().includes(premiumSearch.toLowerCase()) ||
        item.business?.name?.toLowerCase().includes(premiumSearch.toLowerCase()) ||
        item.plan?.name?.toLowerCase().includes(premiumSearch.toLowerCase());

      const matchStatus =
        !premiumStatusFilter || item.status === premiumStatusFilter;

      const matchPlan =
        !premiumPlanFilter ||
        item.plan?.name?.toLowerCase().includes(premiumPlanFilter.toLowerCase());

      return matchSearch && matchStatus && matchPlan;
    });

    const perPage = 10;
    const totalPages = Math.ceil(filteredTableData.length / perPage) || 1;
    const paginatedData = filteredTableData.slice((premiumPage - 1) * perPage, premiumPage * perPage);

    return (
      <div className="flex flex-col gap-[24px]">
        {/* ── Header & Summary Stats Cards ── */}
        <div className="flex flex-col gap-[6px]">
          <h2 className="text-[20px] font-bold text-[#0f172a] tracking-tight">Manajemen Paket Premium</h2>
          <p className="text-[13px] text-[#64748b]">Kelola varian paket, status langganan pengguna/usaha, serta laporan pendapatan paket premium.</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-[14px]">
          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Total Paket</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f0fdfa] text-[#007570] flex items-center justify-center">
                <Crown size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{totalPlans}</span>
            <span className="text-[11px] text-[#64748b]">Varian paket tersedia</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">User Premium</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{totalPremiumUsers}</span>
            <span className="text-[11px] text-[#64748b]">Pengguna terdaftar</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Usaha Premium</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f0fdfa] text-[#007570] flex items-center justify-center">
                <Building2 size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#0f172a]">{totalPremiumBusinesses}</span>
            <span className="text-[11px] text-[#64748b]">Usaha berbadge premium</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Premium Aktif</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#16a34a]">{totalActive}</span>
            <span className="text-[11px] text-[#64748b]">Langganan berjalan</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Akan Berakhir</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#fef3c7] text-[#d97706] flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>
            <span className="text-[22px] font-bold text-[#d97706]">{expiringSoon}</span>
            <span className="text-[11px] text-[#64748b]">Habis &le; 7 hari</span>
          </div>

          <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Total Pendapatan</span>
              <div className="w-[34px] h-[34px] rounded-[10px] bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <span className="text-[20px] font-bold text-[#0f172a]">
              Rp {totalRevenue > 0 ? totalRevenue.toLocaleString("id-ID") : "0"}
            </span>
            <span className="text-[11px] text-[#64748b]">Akumulasi pembayaran</span>
          </div>
        </div>

        {/* ── Kelola Paket Premium (Cards Section) ── */}
        <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-[20px] shadow-sm flex flex-col gap-[18px]">
          <div className="flex items-center justify-between flex-wrap gap-[12px]">
            <div className="flex items-center gap-[10px]">
              <Crown className="text-[#007570]" size={22} />
              <div>
                <h3 className="text-[16px] font-bold text-[#0f172a]">Daftar Paket Premium</h3>
                <p className="text-[12px] text-[#64748b]">Kelola varian harga, limit usaha, serta keunggulan fitur paket.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setPackageForm({
                  name: "",
                  description: "",
                  price: 50000,
                  duration_value: 1,
                  duration_unit: "month",
                  can_add_map: true,
                  can_add_gallery: true,
                  can_add_video: false,
                  can_add_products: true,
                  can_chat: true,
                  priority_listing: false,
                  is_active: true,
                });
                setModal({ show: true, type: "addPackage", data: null });
              }}
              className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-[#007570] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#005a58] transition-all shadow-[0_2px_8px_rgba(0,117,112,0.25)]"
            >
              <Plus size={16} />
              <span>Tambah Paket</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {plans.map((plan) => {
              const usageCount = plan.active_subscriptions_count ?? subscriptions.filter((s) => s.plan_id === plan.id || s.plan?.id === plan.id).length;
              const formattedDuration = plan.formatted_duration || (
                plan.duration_value
                  ? `${plan.duration_value} ${plan.duration_unit === 'day' || plan.duration_unit === 'hari' ? 'Hari' : plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`
                  : "1 Bulan"
              );

              return (
                <div
                  key={plan.id}
                  className={`relative bg-[#f8fafc] rounded-[14px] p-[18px] border transition-all duration-200 flex flex-col justify-between gap-[16px] ${
                    plan.name.toLowerCase().includes("premium")
                      ? "border-[#007570]/30 shadow-[0_4px_16px_rgba(0,117,112,0.06)]"
                      : "border-[#e2e8f0]"
                  }`}
                >
                  <div className="flex flex-col gap-[12px]">
                    <div className="flex items-start justify-between gap-[10px]">
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0f172a]">{plan.name}</h4>
                        <p className="text-[20px] font-extrabold text-[#007570] mt-[2px]">
                          {plan.price === 0 ? "Gratis" : `Rp ${Number(plan.price).toLocaleString("id-ID")}`}
                          <span className="text-[12px] font-medium text-[#64748b]"> / {formattedDuration}</span>
                        </p>
                        {plan.description && (
                          <p className="text-[12px] text-[#64748b] mt-[4px] italic">{plan.description}</p>
                        )}
                      </div>
                      <span className={getBadgeClass(plan.is_active ? "active" : "inactive")}>
                        {plan.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="h-[1px] bg-[#e2e8f0]" />

                    {/* Features list */}
                    <div className="flex flex-col gap-[8px] text-[12.5px] font-medium text-[#475569]">
                      <div className="flex items-center gap-[8px]">
                        {plan.can_add_map ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.can_add_map ? "" : "line-through text-[#94a3b8]"}>Lokasi Peta Penuh</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        {plan.can_add_gallery ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.can_add_gallery ? "" : "line-through text-[#94a3b8]"}>Galeri Foto Profil</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        {plan.can_add_video ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.can_add_video ? "" : "line-through text-[#94a3b8]"}>Sematkan Video Profil</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        {plan.can_add_products !== false ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.can_add_products !== false ? "" : "line-through text-[#94a3b8]"}>Fitur Katalog Produk</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        {plan.can_chat !== false ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.can_chat !== false ? "" : "line-through text-[#94a3b8]"}>Akses Chat & WA Direct</span>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        {plan.priority_listing ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                        <span className={plan.priority_listing ? "" : "line-through text-[#94a3b8]"}>Prioritas & Badge Premium</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[10px] pt-[8px]">
                    <div className="text-[11.5px] font-semibold text-[#64748b] bg-white px-[10px] py-[4px] rounded-[6px] border border-[#e2e8f0] w-fit">
                      👥 Dipakai oleh {usageCount} usaha
                    </div>

                    <div className="flex items-center gap-[8px]">
                      <button
                        onClick={() => {
                          setPackageForm({
                            name: plan.name,
                            description: plan.description || "",
                            price: plan.price,
                            duration_value: plan.duration_value || 1,
                            duration_unit: plan.duration_unit || "month",
                            can_add_map: plan.can_add_map,
                            can_add_gallery: plan.can_add_gallery,
                            can_add_video: plan.can_add_video,
                            can_add_products: plan.can_add_products !== false,
                            can_chat: plan.can_chat !== false,
                            priority_listing: plan.priority_listing,
                            is_active: plan.is_active,
                          });
                          setModal({ show: true, type: "editPackage", data: plan });
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-[6px] px-[12px] py-[7px] bg-white border border-[#cbd5e1] text-[#334155] rounded-[8px] text-[12px] font-semibold hover:bg-[#f1f5f9] transition-all"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleTogglePackageStatus(plan.id)}
                        className={`inline-flex items-center justify-center px-[10px] py-[7px] border rounded-[8px] text-[12px] font-semibold transition-all ${
                          plan.is_active
                            ? "bg-[#fff7ed] border-[#fdba74] text-[#c2410c] hover:bg-[#ffedd5]"
                            : "bg-[#f0fdf4] border-[#86efac] text-[#16a34a] hover:bg-[#dcfce7]"
                        }`}
                        title={plan.is_active ? "Nonaktifkan Paket" : "Aktifkan Paket"}
                      >
                        {plan.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        onClick={() => setModal({ show: true, type: "deletePackage", data: plan })}
                        className="inline-flex items-center justify-center p-[7px] bg-[#fef2f2] border border-[#fca5a5] text-[#dc2626] rounded-[8px] hover:bg-[#fee2e2] transition-all"
                        title="Hapus Paket"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Kelola User/Usaha Langganan & Table Laporan ── */}
        <div className="bg-white rounded-[16px] border border-[#e2e8f0] p-[20px] shadow-sm flex flex-col gap-[16px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[14px]">
            <div>
              <h3 className="text-[16px] font-bold text-[#0f172a]">Daftar Pengguna & Usaha Paket Premium</h3>
              <p className="text-[12px] text-[#64748b]">Kelola status masa aktif, rincian langganan, serta status pembayaran premium.</p>
            </div>

            {/* Controls: Search & Filters */}
            <div className="flex items-center flex-wrap gap-[10px]">
              <div className="relative min-w-[200px]">
                <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="Cari user, usaha, paket..."
                  value={premiumSearch}
                  onChange={(e) => {
                    setPremiumSearch(e.target.value);
                    setPremiumPage(1);
                  }}
                  className="w-full pl-[36px] pr-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570] focus:bg-white transition-all"
                />
              </div>

              <select
                value={premiumStatusFilter}
                onChange={(e) => {
                  setPremiumStatusFilter(e.target.value);
                  setPremiumPage(1);
                }}
                className="px-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570]"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={premiumPlanFilter}
                onChange={(e) => {
                  setPremiumPlanFilter(e.target.value);
                  setPremiumPage(1);
                }}
                className="px-[12px] py-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[12.5px] font-medium text-[#0f172a] outline-none focus:border-[#007570]"
              >
                <option value="">Semua Paket</option>
                {plans.map((pl) => (
                  <option key={pl.id} value={pl.name}>{pl.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-[#e2e8f0] rounded-[12px]">
            <table className="w-full text-left border-collapse font-['Poppins',sans-serif]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11.5px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="px-[16px] py-[12px]">User / Pemilik</th>
                  <th className="px-[16px] py-[12px]">Usaha / Bisnis</th>
                  <th className="px-[16px] py-[12px]">Paket Premium</th>
                  <th className="px-[16px] py-[12px]">Periode Langganan</th>
                  <th className="px-[16px] py-[12px]">Status Sub</th>
                  <th className="px-[16px] py-[12px]">Pembayaran</th>
                  <th className="px-[16px] py-[12px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[13px] text-[#0f172a]">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-[16px] py-[40px] text-center text-[#94a3b8] text-[13px]">
                      <div className="flex flex-col items-center gap-[8px]">
                        <Crown size={32} className="text-[#cbd5e1]" />
                        <span>Tidak ada data penggunaan paket premium yang cocok.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => {
                    const daysLeft = row.ends_at
                      ? Math.ceil((new Date(row.ends_at) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;

                    return (
                      <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                        {/* User */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={row.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${row.user?.name || "U"}`}
                              alt={row.user?.name}
                              className="w-[32px] h-[32px] rounded-full object-cover border border-[#e2e8f0] shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-[#0f172a] truncate">{row.user?.name || "User"}</span>
                              <span className="text-[11px] text-[#64748b] truncate">{row.user?.email || "-"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Business */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#007570]">{row.business?.name || "Semua Usaha"}</span>
                            <span className="text-[11px] text-[#64748b]">
                              {row.business?.category?.name || "Kategori Umum"}
                            </span>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0f172a]">{row.plan?.name || "Premium"}</span>
                            <span className="text-[11px] text-[#64748b]">
                              {row.plan?.price === 0 ? "Gratis" : `Rp ${Number(row.plan?.price || 0).toLocaleString("id-ID")}`}
                            </span>
                          </div>
                        </td>

                        {/* Periode */}
                        <td className="px-[16px] py-[12px]">
                          <div className="flex flex-col text-[12px]">
                            <span>Mulai: {row.starts_at ? new Date(row.starts_at).toLocaleDateString("id-ID") : "-"}</span>
                            <span className="text-[#64748b]">
                              Akhir: {row.ends_at ? new Date(row.ends_at).toLocaleDateString("id-ID") : "-"}
                            </span>
                            {daysLeft !== null && (
                              <span
                                className={`text-[10.5px] font-bold mt-[2px] ${
                                  daysLeft > 7 ? "text-[#16a34a]" : daysLeft > 0 ? "text-[#d97706]" : "text-[#dc2626]"
                                }`}
                              >
                                {daysLeft > 0 ? `Sisa ${daysLeft} hari` : "Sudah Berakhir"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Subscription */}
                        <td className="px-[16px] py-[12px]">
                          <span className={getBadgeClass(row.status)}>
                            {row.status === "active"
                              ? "Aktif"
                              : row.status === "pending"
                              ? "Menunggu"
                              : row.status === "expired"
                              ? "Expired"
                              : "Ditolak"}
                          </span>
                        </td>

                        {/* Status Payment */}
                        <td className="px-[16px] py-[12px]">
                          <span className={getBadgeClass(row.payment_status)}>
                            {row.payment_status === "paid"
                              ? "Lunas"
                              : row.payment_status === "pending"
                              ? "Menunggu Bayar"
                              : "Gagal/Ditolak"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-[16px] py-[12px] text-right">
                          <div className="flex items-center justify-end gap-[6px]">
                            {row.payment_status === "pending" && row.payment_id && (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(row.payment_id)}
                                  className="px-[8px] py-[4px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold hover:bg-[#bbf7d0]"
                                  title="Setujui Pembayaran"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(row.payment_id)}
                                  className="px-[8px] py-[4px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11px] font-bold hover:bg-[#fca5a5]"
                                  title="Tolak Pembayaran"
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setModal({
                                  show: true,
                                  type: "editSubscription",
                                  data: row,
                                });
                              }}
                              className="p-[6px] bg-[#f1f5f9] text-[#475569] rounded-[6px] hover:bg-[#e2e8f0]"
                              title="Edit Status Subscription"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between text-[12.5px] text-[#64748b]">
            <span>Menampilkan {paginatedData.length} dari {filteredTableData.length} data</span>
            <div className="flex items-center gap-[6px]">
              <button
                disabled={premiumPage <= 1}
                onClick={() => setPremiumPage((p) => p - 1)}
                className="px-[12px] py-[6px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Sebelumnya
              </button>
              <span className="font-bold text-[#0f172a] px-[8px]">
                {premiumPage} / {totalPages}
              </span>
              <button
                disabled={premiumPage >= totalPages}
                onClick={() => setPremiumPage((p) => p + 1)}
                className="px-[12px] py-[6px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] font-semibold text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e2e8f0]"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Modal Component ──
  const renderModal = () => {
    if (!modal.show) return null;

    return (
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[6px] flex items-center justify-center z-[500] p-[24px] animate-fade-in" onClick={closeModal}>
        <div className="bg-white rounded-[16px] w-full max-w-[540px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-[20px] py-[18px] border-b border-[#e2e8f0]">
            <h3 className="text-[15px] font-bold text-[#0f172a]">
              {modal.type === "addUser" && "Tambah User"}
              {modal.type === "editUser" && "Edit User"}
              {modal.type === "deleteUser" && "Hapus User"}
              {modal.type === "addBusiness" && "Tambah Bisnis"}
              {modal.type === "editBusiness" && "Edit Bisnis"}
              {modal.type === "deleteBusiness" && "Hapus Bisnis"}
              {modal.type === "addCategory" && "Tambah Kategori"}
              {modal.type === "editCategory" && "Edit Kategori"}
              {modal.type === "deleteCategory" && "Hapus Kategori"}
              {modal.type === "addBlog" && "Tambah Artikel"}
              {modal.type === "editBlog" && "Edit Artikel"}
              {modal.type === "deleteBlog" && "Hapus Artikel"}
              {modal.type === "approvePayment" && "Approve Pembayaran"}
              {modal.type === "rejectPayment" && "Tolak Pembayaran"}
              {modal.type === "downloadReport" && "Download Laporan"}
              {modal.type === "viewAdDetail" && "Detail Iklan"}
              {modal.type === "editAd" && "Edit Detail Iklan"}
              {modal.type === "deleteAd" && "Hapus Iklan"}
              {modal.type === "addAdPackage" && "Tambah Paket Iklan"}
              {modal.type === "editAdPackage" && "Edit Paket Iklan"}
              {modal.type === "deleteAdPackage" && "Hapus Paket Iklan"}
              {modal.type === "addCoupon" && "Tambah Kupon Diskon"}
              {modal.type === "editCoupon" && "Edit Kupon Diskon"}
              {modal.type === "deleteCoupon" && "Hapus Kupon Diskon"}
              {modal.type === "viewReportDetail" && "Detail Laporan Report"}
              {modal.type === "deleteReportedContent" && "Konfirmasi Hapus Konten yang Dilaporkan"}
            </h3>
            <button className="bg-[#f1f5f9] border-0 text-[#64748b] cursor-pointer p-[7px] rounded-[8px] transition-all duration-200 flex hover:bg-[#fee2e2] hover:text-[#dc2626]" onClick={closeModal}>
              <CloseIcon size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="p-[20px]">
            {modal.type === "addUser" || modal.type === "editUser" ? (
              <form onSubmit={handleSaveUser} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama user..."
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Role *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Status *</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nomor Telepon</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                    {modal.type === "addUser" ? "Password *" : "Password Baru (Opsional)"}
                  </label>
                  <input
                    type="password"
                    required={modal.type === "addUser"}
                    placeholder={modal.type === "addUser" ? "Minimal 6 karakter" : "Biarkan kosong jika tidak diubah"}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
              </form>
            ) : modal.type === "deleteUser" ? (
              <p className="text-[14px] text-[#0f172a]">Apakah Anda yakin ingin menghapus user <strong>{modal.data?.name}</strong> ({modal.data?.email})?</p>
            ) : modal.type === "viewUserDetail" && modal.data ? (
              <div className="flex flex-col gap-[14px]">
                <div className="flex items-center gap-[14px]">
                  <img src={modal.data.avatar} alt={modal.data.name} className="w-[56px] h-[56px] rounded-full object-cover border border-[#e2e8f0]" />
                  <div>
                    <h4 className="text-[15px] font-bold text-[#0f172a]">{modal.data.name}</h4>
                    <p className="text-[13px] text-[#64748b]">{modal.data.email}</p>
                    <div className="flex gap-[6px] mt-[4px]">
                      <span className={getBadgeClass(modal.data.role)}>{modal.data.role}</span>
                      <span className={getBadgeClass(modal.data.status)}>{modal.data.status === "active" ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#e2e8f0] pt-[12px] flex flex-col gap-[6px] text-[13px]">
                  <div className="flex justify-between"><span className="text-[#64748b]">Telepon:</span><span className="font-semibold">{modal.data.phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Jumlah Bisnis:</span><span className="font-semibold">{modal.data.businesses_count || 0}</span></div>
                  <div className="flex justify-between"><span className="text-[#64748b]">Tanggal Bergabung:</span><span className="font-semibold">{modal.data.joined || '-'}</span></div>
                </div>
              </div>
            ) : modal.type === "addCoupon" || modal.type === "editCoupon" ? (
              <form onSubmit={handleSaveCoupon} className="flex flex-col gap-[14px]">
                <div>
                  <label className="flex items-center justify-between text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                    <span>Kode Kupon *</span>
                    <button
                      type="button"
                      className="text-[#007570] text-[11px] font-bold underline cursor-pointer bg-transparent border-0"
                      onClick={generateCouponCode}
                    >
                      ⚡ Auto Generate
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PROMO50"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-semibold transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white tracking-[0.5px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama / Deskripsi Kupon</label>
                  <input
                    type="text"
                    placeholder="Contoh: Diskon Promo Kemerdekaan 50%"
                    value={couponForm.name}
                    onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tipe Diskon *</label>
                    <select
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal Tetap (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nilai Diskon *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder={couponForm.discount_type === "percentage" ? "50" : "50000"}
                      value={couponForm.discount_value}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Berlaku Untuk *</label>
                    <select
                      value={couponForm.applies_to}
                      onChange={(e) => setCouponForm({ ...couponForm, applies_to: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="all">Semua Paket</option>
                      <option value="premium">Paket Premium</option>
                      <option value="ads">Paket Iklan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Minimum Transaksi (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={couponForm.minimum_amount}
                      onChange={(e) => setCouponForm({ ...couponForm, minimum_amount: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Maks Diskon (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Opsional"
                      value={couponForm.maximum_discount}
                      onChange={(e) => setCouponForm({ ...couponForm, maximum_discount: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Batas Total Pakai</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Tak Terbatas"
                      value={couponForm.usage_limit}
                      onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={couponForm.starts_at}
                      onChange={(e) => setCouponForm({ ...couponForm, starts_at: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tanggal Berakhir</label>
                    <input
                      type="date"
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={couponForm.is_active}
                    onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                    Aktifkan Kupon Ini
                  </label>
                </div>
              </form>
            ) : modal.type === "deleteCoupon" ? (
              <p className="text-[14px] text-[#0f172a]">Apakah Anda yakin ingin menghapus kupon <strong>{modal.data?.code}</strong>?</p>
            ) : modal.type === "addBlog" || modal.type === "editBlog" ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveBlog(); }} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tipe Konten *</label>
                  <div className="flex items-center gap-[10px]">
                    <button
                      type="button"
                      onClick={() => setBlogForm({ ...blogForm, type: "blog" })}
                      className={`flex-1 py-[8px] rounded-[8px] text-[13px] font-semibold border transition-all ${
                        blogForm.type !== "event"
                          ? "bg-[#007570] text-white border-[#007570]"
                          : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
                      }`}
                    >
                      📝 Artikel & Blog
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogForm({ ...blogForm, type: "event" })}
                      className={`flex-1 py-[8px] rounded-[8px] text-[13px] font-semibold border transition-all ${
                        blogForm.type === "event"
                          ? "bg-[#7e22ce] text-white border-[#7e22ce]"
                          : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
                      }`}
                    >
                      📅 Acara & Event
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Judul *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan judul artikel atau nama event..."
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Kategori *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kuliner, Bisnis, Festival"
                      value={blogForm.blog_category}
                      onChange={(e) => setBlogForm({ ...blogForm, blog_category: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Status Publikasi *</label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="approved">Disetujui / Published</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </div>
                </div>

                {blogForm.type === "event" && (
                  <div className="grid grid-cols-2 gap-[10px] bg-[#f3e8ff]/40 p-[12px] rounded-[10px] border border-[#f3e8ff]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#7e22ce] mb-[6px] uppercase tracking-[0.4px]">Tanggal Event *</label>
                      <input
                        type="date"
                        value={blogForm.event_date}
                        onChange={(e) => setBlogForm({ ...blogForm, event_date: e.target.value })}
                        className="w-full px-[12px] py-[8px] border border-[#cbd5e1] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-white focus:outline-none focus:border-[#7e22ce]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#7e22ce] mb-[6px] uppercase tracking-[0.4px]">Lokasi Event *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bogor Rainfield"
                        value={blogForm.event_location}
                        onChange={(e) => setBlogForm({ ...blogForm, event_location: e.target.value })}
                        className="w-full px-[12px] py-[8px] border border-[#cbd5e1] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-white focus:outline-none focus:border-[#7e22ce]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Gambar Thumbnail URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={blogForm.thumbnail}
                    onChange={(e) => setBlogForm({ ...blogForm, thumbnail: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Ringkasan / Excerpt</label>
                  <textarea
                    rows={2}
                    placeholder="Ringkasan singkat konten..."
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Isi Konten Lengkap</label>
                  <textarea
                    rows={4}
                    placeholder="Isi penjelasan artikel atau deskripsi event..."
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-medium text-[13px] text-[#0f172a] bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
              </form>
            ) : modal.type === "deleteBlog" ? (
              <p className="text-[14px] text-[#0f172a]">
                Apakah Anda yakin ingin menghapus konten <strong>{modal.data?.title}</strong>?
              </p>
            ) : modal.type === "viewReportDetail" && modal.data ? (
              <div className="flex flex-col gap-[16px]">
                {/* Pelapor & Header */}
                <div className="flex items-center justify-between bg-[#f8fafc] p-[12px] rounded-[10px] border border-[#e2e8f0]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#007570] font-mono">
                      #REP-{String(modal.data.id).padStart(3, "0")}
                    </span>
                    <span className="text-[13px] font-bold text-[#0f172a]">
                      Pelapor: {modal.data.reporter_name} ({modal.data.reporter_email})
                    </span>
                  </div>
                  <span className={`px-[8px] py-[3px] rounded-[6px] text-[11px] font-bold uppercase ${
                    modal.data.status === "baru" ? "bg-[#fef3c7] text-[#d97706]" :
                    modal.data.status === "diproses" ? "bg-[#e0f2fe] text-[#0284c7]" :
                    modal.data.status === "selesai" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fee2e2] text-[#dc2626]"
                  }`}>
                    {modal.data.status}
                  </span>
                </div>

                {/* Detail Alasan & Deskripsi Pelanggaran */}
                <div className="flex flex-col gap-[6px]">
                  <span className="text-[11px] font-bold text-[#dc2626] uppercase tracking-wider">Alasan Report</span>
                  <p className="text-[13px] font-bold text-[#0f172a]">{modal.data.reason}</p>
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mt-[4px]">Deskripsi Pengaduan</span>
                  <p className="text-[12.5px] text-[#475569] bg-[#f1f5f9] p-[10px] rounded-[8px] border border-[#e2e8f0]">
                    {modal.data.description || "Pelapor tidak memberikan deskripsi tambahan."}
                  </p>
                </div>

                {/* Preview Konten yang dilaporkan */}
                <div className="flex flex-col gap-[8px] border-t border-[#e2e8f0] pt-[12px]">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Preview Konten yang Dilaporkan</span>
                  <div className="flex gap-[12px] bg-slate-50 p-[12px] rounded-[10px] border border-[#e2e8f0] items-start">
                    <img
                      src={modal.data.content_image || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop"}
                      alt={modal.data.content_name}
                      className="w-[60px] h-[60px] rounded-[8px] object-cover border border-[#cbd5e1] shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase text-[#0369a1] bg-[#e0f2fe] px-[6px] py-[1.5px] rounded-[4px] w-fit">
                        {modal.data.reportable_type}
                      </span>
                      <span className="text-[13.5px] font-bold text-[#0f172a] truncate mt-[2px]">
                        {modal.data.content_name}
                      </span>
                      <span className="text-[11.5px] text-[#64748b]">
                        Pemilik: {modal.data.content_owner}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Status */}
                <div className="flex items-center gap-[8px] border-t border-[#e2e8f0] pt-[12px]">
                  <span className="text-[12px] font-bold text-[#64748b]">Ubah Status:</span>
                  <button
                    onClick={() => { handleUpdateReportStatus(modal.data.id, "diproses"); closeModal(); }}
                    className="px-[10px] py-[5px] bg-[#e0f2fe] text-[#0284c7] rounded-[6px] text-[11.5px] font-bold hover:bg-[#0284c7] hover:text-white"
                  >
                    Diproses
                  </button>
                  <button
                    onClick={() => { handleUpdateReportStatus(modal.data.id, "selesai"); closeModal(); }}
                    className="px-[10px] py-[5px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11.5px] font-bold hover:bg-[#16a34a] hover:text-white"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => { handleUpdateReportStatus(modal.data.id, "ditolak"); closeModal(); }}
                    className="px-[10px] py-[5px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11.5px] font-bold hover:bg-[#dc2626] hover:text-white"
                  >
                    Tolak Report
                  </button>
                </div>
              </div>
            ) : modal.type === "deleteReportedContent" && modal.data ? (
              <div className="flex flex-col gap-[12px]">
                <p className="text-[13.5px] text-[#0f172a]">
                  Apakah Anda yakin ingin <strong>menghapus konten</strong> ini secara permanen dari platform?
                </p>
                <div className="bg-[#fef2f2] p-[12px] rounded-[10px] border border-[#fca5a5] flex flex-col gap-[4px] text-[12.5px] text-[#991b1b]">
                  <span className="font-bold">Informasi Konten:</span>
                  <span>• Nama: <strong>{modal.data.content_name}</strong></span>
                  <span>• Jenis: <strong>{modal.data.reportable_type}</strong></span>
                  <span>• Alasan Report: <strong>{modal.data.reason}</strong></span>
                </div>
                <p className="text-[12px] text-[#64748b]">
                  Tindakan ini akan menghapus konten dari basis data dan otomatis menandai report ini sebagai <strong>Selesai</strong>.
                </p>
              </div>
            ) : modal.type === "viewAdDetail" && modal.data ? (
              <div className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[10px]">
                  <h4 className="text-[13px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Informasi Bisnis</h4>
                  <div className="flex gap-[14px] items-start">
                    <img
                      src={modal.data.business?.logo || "https://via.placeholder.com/60"}
                      alt={modal.data.business?.name}
                      className="w-[56px] h-[56px] rounded-[10px] object-cover border border-[#e2e8f0] shrink-0"
                    />
                    <div className="flex flex-col gap-[4px]">
                      <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nama Bisnis</p>
                      <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.business?.name || '-'}</p>
                      <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Pemilik</p>
                      <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.user?.name || '-'}</p>
                      <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Email</p>
                      <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.user?.email || '-'}</p>
                      <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nomor HP</p>
                      <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.user?.phone || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="h-[1px] bg-[#e2e8f0]" />
                <div className="flex flex-col gap-[10px]">
                  <h4 className="text-[13px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Informasi Paket</h4>
                  <div className="flex flex-col gap-[4px]">
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nama Paket</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.package_name || '-'}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Harga</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">Rp {modal.data.price?.toLocaleString('id-ID') || 0}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Durasi</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.duration || '-'}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Fitur Paket</p>
                    <div className="flex flex-wrap gap-[6px] mt-[4px]">
                      <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[12px] font-medium">✓ Banner Homepage</span>
                      <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[12px] font-medium">✓ Prioritas Pencarian</span>
                      <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[12px] font-medium">✓ Highlight Listing</span>
                      <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[12px] font-medium">✓ Badge Premium</span>
                    </div>
                  </div>
                </div>
                <div className="h-[1px] bg-[#e2e8f0]" />
                <div className="flex flex-col gap-[10px]">
                  <h4 className="text-[13px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Informasi Pembayaran</h4>
                  <div className="flex flex-col gap-[4px]">
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Metode Pembayaran</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.payment_method || 'Transfer Bank'}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nominal</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">Rp {modal.data.price?.toLocaleString('id-ID') || 0}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Tanggal Bayar</p>
                    <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.paid_at ? new Date(modal.data.paid_at).toLocaleDateString('id-ID') : '-'}</p>
                    <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Bukti Transfer</p>
                    {modal.data.payment_proof ? (
                      <button
                        className="inline-flex items-center gap-[6px] px-[12px] py-[6px] bg-[rgba(0,117,112,0.12)] text-[#007570] border-0 rounded-[7px] text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#007570] hover:text-white"
                        onClick={() => window.open(modal.data.payment_proof, '_blank')}
                      >
                        <Eye size={14} strokeWidth={2} />
                        Lihat Bukti
                      </button>
                    ) : (
                      <p className="text-[13px] text-[#0f172a] font-semibold">-</p>
                    )}
                  </div>
                </div>
              </div>
            ) : modal.type.includes("delete") || modal.type.includes("reject") ? (
              <p>Apakah Anda yakin ingin menghapus/menolak item ini?</p>
            ) : modal.type === "approvePayment" ? (
              <p>Apakah Anda yakin ingin menyetujui pembayaran ini?</p>
            ) : modal.type === "downloadReport" ? (
              <p>Pilih format laporan yang ingin diunduh:</p>
            ) : modal.type === "extendAd" ? (
              <div className="mb-[14px]">
                <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Durasi Perpanjangan (hari)</label>
                <input type="number" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue="30" min="1" />
              </div>
            ) : modal.type === "addCategory" || modal.type === "editCategory" ? (
              <form className="flex flex-col gap-[14px]" onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }}>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Kategori *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kuliner"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Slug (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: kuliner (otomatis jika dikosongkan)"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Icon (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: store, utenso, car"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Kategori Induk (Parent)</label>
                    <select
                      value={categoryForm.parent_id}
                      onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="">-- Tanpa Parent (Kategori Utama) --</option>
                      {categories
                        .filter((c) => !modal.data || c.id !== modal.data.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <input
                    type="checkbox"
                    id="cat_is_active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                  />
                  <label htmlFor="cat_is_active" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                    Aktifkan Kategori Ini
                  </label>
                </div>
              </form>
            ) : modal.type === "deleteCategory" ? (
              <p className="text-[14px] text-[#0f172a]">
                Apakah Anda yakin ingin menghapus kategori <strong>{modal.data?.name}</strong>?
              </p>
            ) : modal.type === "addAdPackage" || modal.type === "editAdPackage" ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveAdPackage(); }} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Paket Iklan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Iklan Bisnis Utama"
                    value={adPackageForm.name}
                    onChange={(e) => setAdPackageForm({ ...adPackageForm, name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Harga (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={adPackageForm.price}
                      onChange={(e) => setAdPackageForm({ ...adPackageForm, price: Number(e.target.value) })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Durasi Paket *</label>
                    <div className="flex items-center gap-[6px]">
                      <input
                        type="number"
                        required
                        min="1"
                        value={adPackageForm.duration_value}
                        onChange={(e) => setAdPackageForm({ ...adPackageForm, duration_value: Math.max(1, Number(e.target.value)) })}
                        className="w-[70px] px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                      <select
                        value={adPackageForm.duration_unit}
                        onChange={(e) => setAdPackageForm({ ...adPackageForm, duration_unit: e.target.value })}
                        className="flex-1 px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      >
                        <option value="day">Hari</option>
                        <option value="month">Bulan</option>
                        <option value="year">Tahun</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Deskripsi (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsi singkat paket iklan ini..."
                    value={adPackageForm.description || ""}
                    onChange={(e) => setAdPackageForm({ ...adPackageForm, description: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-[10px] mt-[4px] bg-[#f8fafc] p-[14px] rounded-[10px] border border-[#e2e8f0]">
                  <span className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.4px]">Fitur Paket Iklan</span>
                  
                  <div className="flex items-center gap-[10px]">
                    <input
                      type="checkbox"
                      id="ad_feat_page"
                      checked={adPackageForm.features?.advertisement_page ?? true}
                      onChange={(e) => setAdPackageForm({
                        ...adPackageForm,
                        features: { ...adPackageForm.features, advertisement_page: e.target.checked }
                      })}
                      className="w-[18px] h-[18px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="ad_feat_page" className="text-[13px] text-[#0f172a] font-semibold cursor-pointer">
                      Halaman Iklan
                    </label>
                  </div>

                  <div className="flex items-center gap-[10px]">
                    <input
                      type="checkbox"
                      id="ad_feat_search"
                      checked={adPackageForm.features?.search_priority ?? false}
                      onChange={(e) => setAdPackageForm({
                        ...adPackageForm,
                        features: { ...adPackageForm.features, search_priority: e.target.checked }
                      })}
                      className="w-[18px] h-[18px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="ad_feat_search" className="text-[13px] text-[#0f172a] font-semibold cursor-pointer">
                      Prioritas Hasil Pencarian
                    </label>
                  </div>

                  <div className="flex items-center gap-[10px]">
                    <input
                      type="checkbox"
                      id="ad_feat_badge"
                      checked={adPackageForm.features?.premium_badge ?? false}
                      onChange={(e) => setAdPackageForm({
                        ...adPackageForm,
                        features: { ...adPackageForm.features, premium_badge: e.target.checked }
                      })}
                      className="w-[18px] h-[18px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="ad_feat_badge" className="text-[13px] text-[#0f172a] font-semibold cursor-pointer">
                      Badge Premium
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-[8px] mt-[2px]">
                  <input
                    type="checkbox"
                    id="ad_pkg_is_active"
                    checked={adPackageForm.is_active}
                    onChange={(e) => setAdPackageForm({ ...adPackageForm, is_active: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                  />
                  <label htmlFor="ad_pkg_is_active" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                    Aktifkan Paket Ini untuk Pendaftaran
                  </label>
                </div>
              </form>
            ) : modal.type === "deleteAdPackage" ? (
              <p className="text-[14px] text-[#0f172a]">
                Apakah Anda yakin ingin menghapus paket iklan <strong>{modal.data?.name}</strong>?
              </p>
            ) : modal.type === "editAd" ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEditAd(); }} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Paket Iklan</label>
                  <input
                    type="text"
                    value={editAdForm.package_name}
                    onChange={(e) => setEditAdForm({ ...editAdForm, package_name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Status Iklan</label>
                    <select
                      value={editAdForm.status}
                      onChange={(e) => setEditAdForm({ ...editAdForm, status: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved / Active</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Status Pembayaran</label>
                    <select
                      value={editAdForm.payment_status}
                      onChange={(e) => setEditAdForm({ ...editAdForm, payment_status: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="unpaid">Belum Bayar (Unpaid)</option>
                      <option value="pending">Pending Verifikasi</option>
                      <option value="paid">Lunas (Paid)</option>
                      <option value="failed">Gagal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Harga (Rp)</label>
                    <input
                      type="number"
                      value={editAdForm.price}
                      onChange={(e) => setEditAdForm({ ...editAdForm, price: Number(e.target.value) })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={editAdForm.start_date}
                      onChange={(e) => setEditAdForm({ ...editAdForm, start_date: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Catatan Admin / Feedback</label>
                  <textarea
                    rows={2}
                    placeholder="Catatan untuk pengaju iklan..."
                    value={editAdForm.notes}
                    onChange={(e) => setEditAdForm({ ...editAdForm, notes: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
              </form>
            ) : modal.type === "deleteAd" ? (
              <p className="text-[14px] text-[#0f172a]">
                Apakah Anda yakin ingin menghapus iklan untuk bisnis <strong>{modal.data?.business?.name}</strong>?
              </p>
            ) : modal.type === "addPackage" || modal.type === "editPackage" ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSavePackage(); }} className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Paket Premium *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Premium Business"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Harga (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Durasi Paket *</label>
                    <div className="flex items-center gap-[6px]">
                      <input
                        type="number"
                        required
                        min="1"
                        value={packageForm.duration_value}
                        onChange={(e) => setPackageForm({ ...packageForm, duration_value: Math.max(1, Number(e.target.value)) })}
                        className="w-[70px] px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                      <select
                        value={packageForm.duration_unit}
                        onChange={(e) => setPackageForm({ ...packageForm, duration_unit: e.target.value })}
                        className="flex-1 px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      >
                        <option value="day">Hari</option>
                        <option value="month">Bulan</option>
                        <option value="year">Tahun</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Deskripsi (Opsional)</label>
                  <textarea
                    rows={2}
                    placeholder="Deskripsi singkat paket premium ini..."
                    value={packageForm.description || ""}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-[8px] mt-[4px] bg-[#f8fafc] p-[12px] rounded-[10px] border border-[#e2e8f0]">
                  <span className="text-[12px] font-bold text-[#64748b] uppercase tracking-[0.4px]">Keunggulan & Fitur Paket</span>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_map"
                      checked={packageForm.can_add_map}
                      onChange={(e) => setPackageForm({ ...packageForm, can_add_map: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_map" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Akses Peta Lokasi Penuh
                    </label>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_gallery"
                      checked={packageForm.can_add_gallery}
                      onChange={(e) => setPackageForm({ ...packageForm, can_add_gallery: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_gallery" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Upload Galeri Foto Profil
                    </label>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_video"
                      checked={packageForm.can_add_video}
                      onChange={(e) => setPackageForm({ ...packageForm, can_add_video: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_video" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Sematkan Video Profil
                    </label>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_products"
                      checked={packageForm.can_add_products}
                      onChange={(e) => setPackageForm({ ...packageForm, can_add_products: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_products" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Fitur Katalog Produk Usaha
                    </label>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_chat"
                      checked={packageForm.can_chat}
                      onChange={(e) => setPackageForm({ ...packageForm, can_chat: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_chat" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Akses Chat & Kontak Direct
                    </label>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <input
                      type="checkbox"
                      id="pkg_priority"
                      checked={packageForm.priority_listing}
                      onChange={(e) => setPackageForm({ ...packageForm, priority_listing: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="pkg_priority" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Prioritas Hasil Pencarian & Badge Premium
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-[8px] mt-[2px]">
                  <input
                    type="checkbox"
                    id="pkg_is_active"
                    checked={packageForm.is_active}
                    onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                  />
                  <label htmlFor="pkg_is_active" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                    Aktifkan Paket Ini untuk Pendaftaran
                  </label>
                </div>
              </form>
            ) : modal.type === "deletePackage" ? (
              <p className="text-[14px] text-[#0f172a]">
                Apakah Anda yakin ingin menghapus paket premium <strong>{modal.data?.name}</strong>?
              </p>
            ) : modal.type === "editSubscription" && modal.data ? (
              <div className="flex flex-col gap-[14px]">
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Status Subscription</label>
                  <select
                    value={modal.data.status || "active"}
                    onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, status: e.target.value } }))}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={modal.data.ends_at ? String(modal.data.ends_at).split('T')[0] : ""}
                    onChange={(e) => setModal((prev) => ({ ...prev, data: { ...prev.data, ends_at: e.target.value } }))}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-[14px]">
                <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama</label>
                <input type="text" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue={modal.data?.name || ""} />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-[10px] px-[20px] py-[16px] border-t border-[#e2e8f0]">
            <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border bg-[#f1f5f9] text-[#0f172a] border-[#e2e8f0] hover:bg-[#e2e8f0] hover:-translate-y-[1px]" onClick={closeModal}>
              Batal
            </button>
            <button
              className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]"
              onClick={() => {
                if (modal.type === "addUser" || modal.type === "editUser") {
                  handleSaveUser();
                } else if (modal.type === "deleteUser" && modal.data?.id) {
                  handleDeleteUser(modal.data.id);
                } else if (modal.type === "addCategory" || modal.type === "editCategory") {
                  handleSaveCategory();
                } else if (modal.type === "deleteCategory" && modal.data?.id) {
                  handleDeleteCategory(modal.data.id);
                } else if (modal.type === "addCoupon" || modal.type === "editCoupon") {
                  handleSaveCoupon();
                } else if (modal.type === "deleteCoupon" && modal.data?.id) {
                  handleDeleteCoupon(modal.data.id);
                } else if (modal.type === "addBlog" || modal.type === "editBlog") {
                  handleSaveBlog();
                } else if (modal.type === "deleteBlog" && modal.data?.id) {
                  handleDeleteBlog(modal.data.id);
                } else if (modal.type === "deleteReportedContent" && modal.data?.id) {
                  handleDeleteReportedContent(modal.data.id);
                } else if (modal.type === "addPackage" || modal.type === "editPackage") {
                  handleSavePackage();
                } else if (modal.type === "deletePackage" && modal.data?.id) {
                  handleDeletePackage(modal.data.id);
                } else if (modal.type === "addAdPackage" || modal.type === "editAdPackage") {
                  handleSaveAdPackage();
                } else if (modal.type === "deleteAdPackage" && modal.data?.id) {
                  handleDeleteAdPackage(modal.data.id);
                } else if (modal.type === "editAd" && modal.data?.id) {
                  handleSaveEditAd();
                } else if (modal.type === "deleteAd" && modal.data?.id) {
                  handleDeleteAd(modal.data.id);
                } else if (modal.type === "editSubscription" && modal.data?.id) {
                  handleUpdateSubscriptionStatus(modal.data.id, modal.data.status, modal.data.ends_at);
                  closeModal();
                } else {
                  closeModal();
                }
              }}
            >
              {modal.type.includes("delete") || modal.type.includes("reject") ? "Hapus/Tolak" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f6fa] gap-[14px] font-['Poppins','Inter',sans-serif] text-[#64748b] text-[14px]">
        <RefreshCw className="text-[#007570] animate-spin" />
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-['Poppins','Inter','Segoe_UI',sans-serif] text-[#0f172a]">
      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen ${sidebarCollapsed ? "w-[68px]" : "w-[240px] max-lg:w-[68px]"} bg-[#050a16] flex flex-col z-[200] transition-[width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-[rgba(255,255,255,0.07)]`}>
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-[18px_14px_14px] border-b border-[rgba(255,255,255,0.07)] shrink-0 min-h-[60px]">
          <div className="flex items-center gap-[10px] overflow-hidden flex-1 min-w-0">
            <span className={`text-[15px] font-bold text-white whitespace-nowrap transition-[opacity,width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "max-lg:opacity-0 max-lg:w-0 max-lg:overflow-hidden"}`}>Info.co.id</span>
            <span className={`bg-[rgba(0,117,112,0.4)] border border-[rgba(0,179,171,0.3)] text-[#5eead4] text-[0.65rem] px-[7px] py-[2px] rounded-[6px] font-bold whitespace-nowrap shrink-0 transition-[opacity,width,padding] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? "opacity-0 w-0 overflow-hidden p-0" : "max-lg:opacity-0 max-lg:w-0 max-lg:overflow-hidden max-lg:p-0"}`}>Admin</span>
          </div>
          {/* Toggle button */}
          <button
            className="shrink-0 w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[rgba(255,255,255,0.80)] cursor-pointer transition-[background,color] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] bg-transparent border-0 relative z-10 hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          >
            {sidebarCollapsed
              ? <ChevronRight size={18} strokeWidth={2} />
              : <ChevronLeft size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="list-none flex-1 overflow-y-auto overflow-x-hidden p-[8px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-[2px]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`group relative flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] border-0 text-[13.5px] font-medium whitespace-nowrap w-full text-left font-['Poppins','Inter','Segoe_UI',sans-serif] cursor-pointer transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-[#007570] text-white font-semibold shadow-[0_2px_8px_rgba(0,117,112,0.4)]"
                  : "bg-transparent text-[rgba(255,255,255,0.75)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              }`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`transition-[opacity,width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 pointer-events-none" : "max-lg:opacity-0 max-lg:w-0 max-lg:pointer-events-none"}`}>{item.label}</span>
              <span className={`absolute left-[calc(68px+8px)] top-1/2 -translate-y-1/2 bg-[#1e293b] text-white text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 ${sidebarCollapsed ? "group-hover:opacity-100" : "max-lg:group-hover:opacity-100"} transition-opacity duration-150 z-[300] before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-[#1e293b]`}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-[8px_8px_12px] border-t border-[rgba(255,255,255,0.07)] shrink-0">
          <button
            className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] border-0 bg-transparent text-[rgba(255,255,255,0.40)] cursor-pointer transition-[background,color] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] w-full text-left font-['Poppins','Inter','Segoe_UI',sans-serif] text-[13.5px] font-medium whitespace-nowrap hover:bg-[rgba(239,68,68,0.15)] hover:text-[#f87171]"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Keluar" : undefined}
          >
            <LogOut size={18} strokeWidth={2} className="shrink-0" />
            <span className={`transition-[opacity,width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${sidebarCollapsed ? "opacity-0 w-0 pointer-events-none" : "max-lg:opacity-0 max-lg:w-0 max-lg:pointer-events-none"}`}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className={`${sidebarCollapsed ? "ml-[68px]" : "ml-[240px] max-lg:ml-[68px]"} flex-1 min-h-screen flex flex-col transition-[margin-left] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] min-w-0`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-[100] flex items-center justify-between px-[28px] max-md:px-[16px] h-[60px] bg-white border-b border-[#e2e8f0] gap-[16px] shrink-0">
          <div className="flex items-center gap-[14px] min-w-0">
            <Link to="/" className="flex items-center gap-[8px] px-[14px] py-[7px] bg-[#f0fdfa] border border-[rgba(0,117,112,0.25)] rounded-[8px] text-[#007570] font-semibold text-[0.82rem] no-underline transition-all duration-250 ease-in-out whitespace-nowrap shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,117,112,0.2)]">
              <ArrowLeft size={16} strokeWidth={2} />
              <span className="max-md:hidden">Kembali ke Website</span>
            </Link>
            <h1 className="text-[16px] font-bold text-[#0f172a] whitespace-nowrap overflow-hidden text-ellipsis">
              {NAV_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-[14px] shrink-0">
            <button
              className="relative w-[36px] h-[36px] flex items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] cursor-pointer border-0 transition-[background,color] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:bg-[rgba(0,117,112,0.12)] hover:text-[#007570]"
              onClick={() => setActiveTab("notifications")}
              title="Notifikasi"
            >
              <Bell size={18} strokeWidth={1.7} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] bg-[#ef4444] text-white text-[0.62rem] font-bold min-w-[18px] h-[18px] rounded-[9px] flex items-center justify-center border-2 border-white px-[3px]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-[8px] px-[12px] py-[5px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] transition-all duration-250 cursor-default hover:border-[rgba(0,117,112,0.25)] hover:shadow-[0_2px_8px_rgba(0,117,112,0.08)]">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || "Admin"}
                className="w-[28px] h-[28px] rounded-full object-cover border-2 border-[rgba(0,117,112,0.25)] shrink-0"
              />
              <span className="font-semibold text-[13px] text-[#0f172a] max-sm:hidden">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-[24px_28px] max-md:p-[16px] flex-1">
          {activeTab === "dashboard"     && renderDashboard()}
          {activeTab === "users"         && renderUsers()}
          {activeTab === "businesses"    && renderBusinesses()}
          {activeTab === "categories"    && renderCategories()}
          {activeTab === "ads"           && renderAds()}
          {activeTab === "premium"       && renderPremium()}
          {activeTab === "coupons"       && renderCoupons()}
          {activeTab === "blogs"         && renderBlogs()}
          {activeTab === "reports"       && renderReports()}
          {activeTab === "settings"      && renderSettings()}
          {activeTab === "notifications" && renderNotifications()}
        </div>
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
