import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import logoImg from "../../assets/logo-surade.png";
import MobileBottomNav from "../../components/MobileBottomNav";
import SuradeCoinIcon from "../../components/SuradeCoinIcon";
import WhatsAppIcon from "../../components/icons/WhatsAppIcon";
import AdminCoinTab from "./tabs/AdminCoinTab";
import AdminNomorPentingTab from "./tabs/AdminNomorPentingTab";
import SuradeLoader from "../../components/SuradeLoader";
import {
  PhoneCall,
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  Info,
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
  Home,
  Search,
  LogOut,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  BadgeCheck,
  DollarSign,
  Download,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  AlertTriangle,
  Ban,
  RefreshCw,
  RotateCcw,
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
  ShieldCheck,
  Package,
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
  CheckCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  Sparkles,
  Loader2,
  Store,
  Gift,
  Image as ImageIcon,
  Upload,
  Coins,
  Sliders,
  QrCode,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import { getUserPresence, OnlineIndicator } from "../../utils/userPresence";
import {
  DEFAULT_AVATAR,
  getStorageUrl,
  OFFICIAL_ACCOUNT_HOLDER,
  OFFICIAL_BANK_ACCOUNTS,
  OFFICIAL_EWALLET_ACCOUNTS,
  OFFICIAL_QRIS_ACCOUNT,
} from "../../utils/constants";

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
    case 'needs_revision':
      return `${base} bg-[#fef3c7] text-[#b45309] border-[#fcd34d]`;
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
    case 'needs_revision':
      return '⚠️ Perlu Perbaikan';
    case 'inactive':
      return 'Nonaktif';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

// ── Modern Interactive Bar Chart Component ──
const MiniBarChart = ({ data = [], color = "#007570", height = 150, labels = [], unit = "Item", yearLabel = "" }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const max = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <span>Total {yearLabel ? (yearLabel.includes("Tahun") ? yearLabel : `Tahun ${yearLabel}`) : new Date().getFullYear()}:</span>
          <span className="px-2 py-0.5 rounded-full text-white text-[11px] font-extrabold" style={{ backgroundColor: color }}>
            {total.toLocaleString('id-ID')} {unit}
          </span>
        </div>
        <div className="text-[11px] font-semibold text-slate-400">
          {hoveredIdx !== null ? (
            <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md transition-all">
              {labels[hoveredIdx] || ''}: {data[hoveredIdx] || 0} {unit}
            </span>
          ) : (
            <span>Arahkan kursor untuk detail</span>
          )}
        </div>
      </div>

      <div className="relative w-full pt-3 pb-1">
        {/* Horizontal gridlines */}
        <div className="absolute inset-x-0 top-3 bottom-7 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
          <div className="border-b border-dashed border-slate-200 w-full" />
        </div>

        {/* Bars Container */}
        <div className="flex items-end gap-1.5 sm:gap-2 relative z-10" style={{ height: `${height}px` }}>
          {data.map((val, i) => {
            const pct = max > 0 ? (val / max) * 100 : 0;
            const barHeightPct = val > 0 ? Math.max(pct, 10) : 0;
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none">
                    {labels[i]}: {val} {unit}
                  </div>
                )}

                {/* Track background */}
                <div className="w-full max-w-[24px] h-[calc(100%-22px)] bg-slate-100/90 rounded-t-md flex flex-col justify-end overflow-hidden p-0.5 transition-colors group-hover:bg-slate-200/80">
                  {/* Filled bar */}
                  <div
                    className="w-full rounded-t-[4px] transition-all duration-500 ease-out"
                    style={{
                      height: `${barHeightPct}%`,
                      background: val > 0
                        ? `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`
                        : "transparent",
                      boxShadow: isHovered && val > 0 ? `0 0 10px ${color}66` : "none",
                    }}
                  />
                </div>

                {/* Month label */}
                <span className={`text-[10px] mt-1 font-bold transition-colors block text-center ${isHovered ? "text-slate-900 scale-105" : val > 0 ? "text-slate-700" : "text-slate-400"
                  }`}>
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Navigation items with Categories / Sections ──
const NAV_SECTIONS = [
  {
    category: "HOME",
    items: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.7} /> },
      { id: "coins", label: "Poin", icon: <SuradeCoinIcon size={30} /> },
    ],
  },
  {
    category: "MANAJEMEN BISNIS & PRODUK",
    items: [
      { id: "users", label: "Kelola User", icon: <Users size={20} strokeWidth={1.7} /> },
      { id: "businesses", label: "Kelola Usaha", icon: <Building2 size={20} strokeWidth={1.7} /> },
      { id: "claims", label: "Klaim Usaha", icon: <ShieldAlert size={20} strokeWidth={1.7} /> },
      { id: "products", label: "Verifikasi Produk", icon: <Package size={20} strokeWidth={1.7} /> },
      { id: "navbar-info", label: "Kelola Kategori", icon: <Tag size={20} strokeWidth={1.7} /> },
      { id: "important-numbers", label: "Nomor Penting", icon: <PhoneCall size={20} strokeWidth={1.7} /> },
    ],
  },
  {
    category: "PROMOSI & TRANSAKSI",
    items: [
      { id: "ads", label: "Kelola Iklan", icon: <Megaphone size={20} strokeWidth={1.7} /> },
      { id: "premium", label: "Paket Premium", icon: <Crown size={20} strokeWidth={1.7} /> },
      { id: "coupons", label: "Kupon Diskon", icon: <Ticket size={20} strokeWidth={1.7} /> },
      { id: "referrals", label: "Kelola Referral", icon: <Share2 size={20} strokeWidth={1.7} /> },
      { id: "blogs", label: "Info & Event", icon: <FileText size={20} strokeWidth={1.7} /> },
      { id: "whatsapp", label: "Kelola WhatsApp", icon: <WhatsAppIcon size={19} className="text-emerald-400" /> },
      { id: "chat", label: "Kelola Chat", icon: <MessageSquare size={19} className="text-teal-400" /> },
    ],
  },
  {
    category: "SISTEM & LAPORAN",
    items: [
      { id: "reports", label: "Laporan Report", icon: <AlertTriangle size={20} strokeWidth={1.7} /> },
      { id: "payment-settings", label: "Kelola Pembayaran", icon: <CreditCard size={20} strokeWidth={1.7} /> },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

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
  } catch (e) { }
};

// Helper for resolving business photo with priority (distinct logo first, then image, banner, media)
const getBusinessTablePhoto = (biz) => {
  if (!biz) return "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";

  const name = (biz.name || "").toLowerCase();
  const bizId = Number(biz.id);

  // 1. Prioritize distinct custom & official brand logos
  if (bizId === 138 || name.includes("bibit tanaman")) return "/logos/biz_138_bibit.svg";
  if (bizId === 139 || name.includes("cuci steam") || name.includes("steam motor")) return "/logos/biz_139_steam.svg";
  if (bizId === 140 || name.includes("penjahit pakaian") || name.includes("permak busana")) return "/logos/biz_140_jahit.svg";

  if (name.includes("bri") || name.includes("rakyat indonesia")) return "/logos/bri.svg";
  if (name.includes("bsi") || name.includes("syariah indonesia")) return "/logos/bsi.svg";
  if (name.includes("bjb")) return "/logos/bjb.png";
  if (name.includes("pegadaian")) return "/logos/pegadaian.svg";
  if (name.includes("mandiri")) return "/logos/mandiri.png";
  if (name.includes("bca")) return "/logos/bca.png";
  if (name.includes("bni")) return "/logos/bni.png";

  const rawPath =
    biz.logo ||
    biz.logo_url ||
    biz.image ||
    biz.img ||
    biz.thumbnail ||
    biz.banner ||
    (Array.isArray(biz.banners) && biz.banners[0]) ||
    (Array.isArray(biz.gallery) && biz.gallery[0]) ||
    (biz.media && biz.media.length > 0 ? (biz.media[0].file_path || biz.media[0].url) : null) ||
    (biz.raw && (biz.raw.logo || biz.raw.logo_url || biz.raw.image || biz.raw.img || biz.raw.thumbnail || biz.raw.banner || (biz.raw.media && biz.raw.media.length > 0 ? (biz.raw.media[0].file_path || biz.raw.media[0].url) : null)));

  if (rawPath) {
    return getStorageUrl(rawPath);
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(biz.name || "Bisnis")}`;
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
    if (path.includes("/admin/referrals") || path.includes("/referrals")) return "referrals";
    if (
      path.includes("/admin/content_pricing") ||
      path.includes("/admin/content-pricing") ||
      path.includes("/admin/content_packages") ||
      path.includes("/admin/packages") ||
      path.includes("/packages")
    ) {
      return "blogs";
    }
    const last = path.split("/").filter(Boolean).pop();
    if (last && NAV_ITEMS.some((i) => i.id === last)) {
      return last;
    }
    return "dashboard";
  };

  const activeTab = getActiveTabFromUrl();

  useEffect(() => {
    const adminTabTitles = {
      dashboard: "Admin Panel - Ringkasan",
      businesses: "Admin Panel - Kelola Usaha",
      claims: "Admin Panel - Klaim Usaha",
      blogs: "Admin Panel - Berita & Event",
      categories: "Admin Panel - Kategori",
      users: "Admin Panel - Pengguna",
      referrals: "Admin Panel - Referral & Komisi",
      coupons: "Admin Panel - Kupon Diskon",
      reports: "Admin Panel - Laporan",
      settings: "Admin Panel - Pengaturan Web",
      whatsapp: "Admin Panel - Kelola WhatsApp",
      chat: "Admin Panel - Kelola Chat",
    };
    const titleText = adminTabTitles[activeTab] || "Admin Panel";
    document.title = `${titleText} - Surade.com`;
  }, [activeTab]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setActiveTab = (tabId) => {
    setMobileSidebarOpen(false);
    navigate(`/admin/${tabId}`);
  };

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [coupons, setCoupons] = useState(() => getAdminCache("coupons", []));
  const [couponPage, setCouponPage] = useState(1);
  const couponsPerPage = 10;
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

  // ── Admin Add Business Form State ──
  const [addBusinessForm, setAddBusinessForm] = useState({
    user_id: "",
    name: "",
    category_id: "",
    description: "",
    address: "",
    phone: "",
    whatsapp: "",
    city: "",
    province: "",
    status: "approved",
  });
  const [addBusinessLoading, setAddBusinessLoading] = useState(false);

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

  // ── Navbar Category States ──
  const [navbarCategoryForm, setNavbarCategoryForm] = useState({
    name: "",
    slug: "",
    icon: "",
    icon_file: null,
    icon_preview: null,
    remove_icon: 0,
    parent_id: "",
    order: 0,
    is_active: true,
  });
  const [navbarCategorySearchQuery, setNavbarCategorySearchQuery] = useState("");
  const [navbarCategoryStatusFilter, setNavbarCategoryStatusFilter] = useState("");

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
  // ── Settings States ──
  const [settings, setSettings] = useState({
    general: {},
    contact: {},
    social: {},
    seo: {},
  });
  const [settingsForm, setSettingsForm] = useState({
    site_name: "",
    site_logo: null,
    site_banner: null,
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    social_instagram: "",
    social_facebook: "",
    social_website: "",
    seo_meta_title: "",
    seo_meta_description: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Official Bank & Payment Management States ──
  const getInitialPaymentMethods = () => {
    try {
      const cached = localStorage.getItem("official_payment_methods_custom");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [
      ...OFFICIAL_BANK_ACCOUNTS.map(b => ({ ...b, category: "bank", isActive: true })),
      ...OFFICIAL_EWALLET_ACCOUNTS.map(e => ({ ...e, category: "ewallet", isActive: true })),
      { ...OFFICIAL_QRIS_ACCOUNT, category: "qris", isActive: true },
    ];
  };

  const [paymentMethodsList, setPaymentMethodsList] = useState(getInitialPaymentMethods);
  const [paymentOfficialHolder, setPaymentOfficialHolder] = useState(() => {
    return localStorage.getItem("official_account_holder") || OFFICIAL_ACCOUNT_HOLDER || "Triwala Mitra Bestari";
  });
  const [paymentRulesForm, setPaymentRulesForm] = useState(() => {
    try {
      const cached = localStorage.getItem("platform_payment_rules");
      return cached ? JSON.parse(cached) : {
        bank_transfer_enabled: true,
        bank_transfer_min_amount: 10000,
        qris_enabled: true,
        points_enabled: true,
        point_exchange_rate_idr: 1000,
        points_allowed_types: "both",
      };
    } catch {
      return {
        bank_transfer_enabled: true,
        bank_transfer_min_amount: 10000,
        qris_enabled: true,
        points_enabled: true,
        point_exchange_rate_idr: 1000,
        points_allowed_types: "both",
      };
    }
  });
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPaymentForm, setNewPaymentForm] = useState({
    id: "",
    name: "",
    accountNumber: "",
    accountName: "Triwala Mitra Bestari",
    category: "bank",
    badgeColor: "bg-[#007570] text-white",
    logoUrl: "",
    isActive: true,
  });
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("all");
  const [waLogSearch, setWaLogSearch] = useState("");
  const [waLogStatusFilter, setWaLogStatusFilter] = useState("all");

  // ── WhatsApp Payment Wall States ──
  const [waAdminSettings, setWaAdminSettings] = useState({
    enabled: true,
    amount: 2000,
    bank_name: "Bank Mandiri",
    account_number: "133-0011-409-331",
    account_holder: "Triwala Mitra Bestari",
    instruction: "Akses kontak langsung WhatsApp penjual dikenakan biaya administrasi resmi untuk keamanan dan pencegahan spam.",
    qris_image: null,
  });
  const [waAdminSettingsForm, setWaAdminSettingsForm] = useState({ ...waAdminSettings });
  const [waLogs, setWaLogs] = useState([]);
  const [waLogStats, setWaLogStats] = useState({ total_access: 0, total_revenue: 0, today_access: 0 });
  const [waLogPage, setWaLogPage] = useState(1);
  const [waLogPagination, setWaLogPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [waRevenuePeriod, setWaRevenuePeriod] = useState("all");
  const [showEditWaTarifModal, setShowEditWaTarifModal] = useState(false);
  const [selectedWaProofUrl, setSelectedWaProofUrl] = useState(null);
  const [activeWaProofDetailView, setActiveWaProofDetailView] = useState(null);
  const [savingWaSettings, setSavingWaSettings] = useState(false);
  const [loadingWaLogs, setLoadingWaLogs] = useState(false);
  const [waQrisFile, setWaQrisFile] = useState(null);

  const [adPackageForm, setAdPackageForm] = useState({
    name: "",
    placement_type: "standard",
    description: "",
    price: 50000,
    duration_value: 30,
    duration_unit: "day",
    priority: 0,
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
    totalBlogPackages: 0,
    totalEventPackages: 0,
    activeContentSubscriptions: 0,
    totalBlogSales: 0,
    totalEventSales: 0,
    totalContentRevenue: 0,
    userGrowth: [],
    businessGrowth: [],
    totalProducts: 0,
    pendingProducts: 0,
  }));
  const [recentActivities, setRecentActivities] = useState(() => getAdminCache("activities", []));
  const [selectedChartYear, setSelectedChartYear] = useState("2026");
  const selectedChartYearRef = useRef("2026");
  useEffect(() => {
    selectedChartYearRef.current = selectedChartYear;
  }, [selectedChartYear]);
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 10;

  // Product management & verification states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCounts, setProductCounts] = useState({ all: 0, pending: 0, needs_revision: 0, approved: 0, rejected: 0 });
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 10;
  const [rejectProductModal, setRejectProductModal] = useState({ open: false, product: null, reason: "" });
  const [viewProductModal, setViewProductModal] = useState({ open: false, product: null });
  const [coinStats, setCoinStats] = useState({ pending_purchases_count: 0, pending_withdrawals_count: 0 });
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimRejectModal, setClaimRejectModal] = useState({ open: false, claim: null, reason: "" });
  const [claimApproveModal, setClaimApproveModal] = useState({ open: false, claim: null });
  const [claimProofModal, setClaimProofModal] = useState({ open: false, url: "", title: "" });
  const [claimsStatusFilter, setClaimsStatusFilter] = useState("");

  const fetchCoinStats = async () => {
    try {
      const res = await api.get('/admin/coins/stats');
      if (res.data?.success && res.data.stats) {
        setCoinStats(res.data.stats);
      }
    } catch (err) {
      console.error("Gagal mengambil stats koin admin:", err);
    }
  };

  const fetchClaims = async (statusFilter = "") => {
    setClaimsLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await api.get(`/admin/business-claims${params}`);
      setClaims(res.data?.data?.data || res.data?.data || []);
      setPendingClaimsCount(res.data?.pending_count ?? 0);
    } catch (err) {
      console.error("Gagal mengambil data klaim:", err);
    } finally {
      setClaimsLoading(false);
    }
  };

  const fetchPendingClaimsCount = async () => {
    try {
      const res = await api.get('/admin/business-claims/pending-count');
      setPendingClaimsCount(res.data?.pending_count ?? 0);
    } catch (err) { }
  };

  useEffect(() => {
    fetchCoinStats();
    fetchPendingClaimsCount();
    const handleAdminCoinsUpdated = () => fetchCoinStats();
    window.addEventListener("admin-coins-updated", handleAdminCoinsUpdated);
    return () => window.removeEventListener("admin-coins-updated", handleAdminCoinsUpdated);
  }, []);

  useEffect(() => {
    if (activeTab === "claims") {
      fetchClaims(claimsStatusFilter);
    }
  }, [activeTab, claimsStatusFilter]);

  const [users, setUsers] = useState(() => getAdminCache("users", []));
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  const [businesses, setBusinesses] = useState(() => getAdminCache("businesses", []));
  const [businessPage, setBusinessPage] = useState(1);
  const businessesPerPage = 10;
  const [businessStatusFilter, setBusinessStatusFilter] = useState("all");
  const [categories, setCategories] = useState(() => getAdminCache("categories", []));
  const [navbarCategories, setNavbarCategories] = useState(() => getAdminCache("navbar_categories", []));
  const [payments, setPayments] = useState(() => getAdminCache("payments", []));
  const [blogs, setBlogs] = useState(() => getAdminCache("blogs", []));
  const [contentPackages, setContentPackages] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const handleDirectRejectPayment = async (payment) => {
    const paymentId = payment.payment_id || payment.id;
    if (!window.confirm(`Yakin ingin menolak pembayaran ini? Status akan menjadi Ditolak.`)) return;
    try {
      await api.put(`/admin/payments/${paymentId}/reject`, {
        mode: "reject",
        rejection_reason: "Pembayaran ditolak oleh admin.",
      });
      alert("Pembayaran telah ditolak.");
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak pembayaran:", err);
      alert(err.response?.data?.message || "Gagal menolak pembayaran.");
    }
  };

  const handleOpenRejectModal = (type, item) => {
    if (type === "business") {
      handleDirectRejectBusiness(item);
    } else if (type === "payment") {
      handleDirectRejectPayment(item);
    } else if (type === "advertisement" || type === "ad") {
      handleDirectRejectAd(item);
    } else if (type === "product") {
      handleDirectRejectProduct(item);
    } else if (type === "whatsapp" || type === "whatsapp_log") {
      handleOpenRevisionModal("whatsapp", item);
    } else {
      handleDirectRejectBlog(item);
    }
  };

  const [rejectMode, setRejectMode] = useState("revision"); // "revision" | "reject"

  const handleOpenRevisionModal = (typeOrItem, maybeItem) => {
    let type = "business";
    let item = typeOrItem;
    if (typeof typeOrItem === "string") {
      type = typeOrItem;
      item = maybeItem;
    }
    setRejectMode("revision");
    setRejectReason("");
    setModal({
      show: true,
      type: "rejectItem",
      data: { type, item, isRevision: true },
    });
  };

  const handleDirectRejectBlog = async (blog) => {
    if (!window.confirm(`Yakin ingin menolak "${blog.title}"? Status akan menjadi Ditolak.`)) return;
    try {
      await api.put(`/admin/blogs/${blog.id}/reject`, {
        mode: "reject",
        rejection_reason: "Konten tidak memenuhi kriteria publikasi.",
      });
      alert(`Konten "${blog.title}" telah ditolak.`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak blog:", err);
      alert(err.response?.data?.message || "Gagal menolak konten.");
    }
  };

  const handleDirectRejectProduct = async (product) => {
    if (!window.confirm(`Yakin ingin menolak produk "${product.name}"? Produk akan berstatus Ditolak.`)) return;
    try {
      await api.put(`/admin/products/${product.id}/reject`, {
        mode: "reject",
        rejection_reason: "Produk tidak memenuhi syarat & ketentuan publikasi platform.",
      });
      toast.success(`Produk "${product.name}" telah ditolak.`);
      fetchProducts();
    } catch (err) {
      console.error("Gagal menolak produk:", err);
      toast.error(err.response?.data?.message || "Gagal menolak produk.");
    }
  };

  const handleDirectRejectAd = async (ad) => {
    if (!window.confirm(`Yakin ingin menolak iklan "${ad.name || ad.package_name || "ini"}"? Status iklan akan menjadi Ditolak.`)) return;
    try {
      await api.put(`/admin/advertisements/${ad.id}/reject`, {
        mode: "reject",
        rejection_reason: "Pengajuan iklan ditolak oleh admin.",
      });
      alert(`Iklan "${ad.name || ad.package_name || ""}" telah ditolak.`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak iklan:", err);
      alert(err.response?.data?.message || "Gagal menolak iklan.");
    }
  };

  const handleDirectRejectBusiness = async (business) => {
    if (!window.confirm(`Yakin ingin menolak bisnis "${business.name}"? Status bisnis akan menjadi Ditolak.`)) {
      return;
    }
    try {
      await api.post(`/admin/businesses/${business.id}/reject`, {
        mode: "reject",
        reason: "Bisnis ditolak oleh admin.",
        rejection_reason: "Bisnis ditolak oleh admin.",
      });
      alert(`Bisnis "${business.name}" telah ditolak.`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak bisnis:", err);
      alert(err.response?.data?.message || "Gagal menolak bisnis.");
    }
  };

  const handleToggleAdPackage = async (business) => {
    try {
      const isCurrentlyActive = business.ad_info?.status === "active" || business.has_active_ad;
      const promptText = isCurrentlyActive
        ? `Nonaktifkan Paket Iklan untuk usaha "${business.name}"?`
        : `Aktifkan Paket Iklan (30 Hari) untuk usaha "${business.name}"?`;

      if (!window.confirm(promptText)) return;

      const res = await api.post(`/admin/businesses/${business.id}/toggle-ad`, { duration_days: 30 });
      alert(res.data?.message || `Status Paket Iklan untuk "${business.name}" berhasil diperbarui.`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status iklan:", err);
      alert(err.response?.data?.message || "Gagal mengubah status paket iklan.");
    }
  };

  const handleConfirmRejectItem = async (e) => {
    if (e) e.preventDefault();
    if (!rejectReason || !rejectReason.trim()) {
      alert("Alasan penolakan / revisi wajib diisi.");
      return;
    }
    setRejectSubmitting(true);
    try {
      const type = modal.data?.type;
      const item = modal.data?.item;
      const isRevision = modal.data?.isRevision || rejectMode === "revision";
      const currentMode = isRevision ? "revision" : "reject";
      let endpoint = "";
      let isPut = false;

      if (type === "business") {
        endpoint = `/admin/businesses/${item.id}/reject`;
      } else if (type === "payment") {
        endpoint = `/admin/payments/${item.payment_id || item.id}/reject`;
        isPut = true;
      } else if (type === "advertisement" || type === "ad") {
        endpoint = `/admin/advertisements/${item.id}/reject`;
        isPut = true;
      } else if (type === "whatsapp" || type === "whatsapp_log") {
        endpoint = `/admin/whatsapp-logs/${item.id}/reject`;
        isPut = true;
      } else {
        endpoint = `/admin/blogs/${item.id}/reject`;
        isPut = true;
      }

      const payload = {
        notes: rejectReason.trim(),
        rejection_reason: rejectReason.trim(),
        reason: rejectReason.trim(),
        mode: currentMode,
      };

      let resData = null;
      if (isPut) {
        const res = await api.put(endpoint, payload);
        resData = res.data;
      } else {
        const res = await api.post(endpoint, payload);
        resData = res.data;
      }

      if (type === "whatsapp" || type === "whatsapp_log") {
        alert("Transaksi akses WhatsApp telah ditolak. Alasan penolakan telah dicatat ke riwayat.");
        const waLink = resData?.notify_whatsapp_link;
        if (waLink && window.confirm("Buka WhatsApp sekarang untuk kirim notifikasi ke customer (minta perbaiki/upload ulang)?")) {
          window.open(waLink, "_blank");
        }
        closeModal();
        fetchWaLogs(waLogPage);
        return;
      }

      alert(
        currentMode === "revision"
          ? "Permintaan perbaikan / revisi berhasil dikirim ke user."
          : (type === "business"
            ? "Bisnis berhasil ditolak secara permanen."
            : type === "payment"
              ? "Pembayaran paket Premium berhasil ditolak secara permanen."
              : (type === "advertisement" || type === "ad")
                ? "Pengajuan iklan berhasil ditolak secara permanen."
                : "Konten berhasil ditolak secara permanen.")
      );
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal memproses penolakan/perbaikan:", err);
      alert(err.response?.data?.message || "Gagal memproses permintaan.");
    } finally {
      setRejectSubmitting(false);
    }
  };
  const [blogMainTab, setBlogMainTab] = useState("content"); // "content" | "pricing" | "transactions"
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
  const [adPage, setAdPage] = useState(1);
  const adsPerPage = 10;
  const [notifications, setNotifications] = useState(() => getAdminCache("notifications", []));
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Premium Package & Subscription States ──
  const [subscriptions, setSubscriptions] = useState(() => getAdminCache("subscriptions", []));
  const [plans, setPlans] = useState(() => {
    const cached = getAdminCache("plans", []);
    // Bersihkan data statis lama jika masih ada 'Free' yang sudah dihapus dari server
    if (Array.isArray(cached) && cached.some(p => p.id === 1 && p.name === "Free")) {
      return cached.filter(p => !(p.id === 1 && p.name === "Free"));
    }
    return cached;
  });


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

  // ── Referral Management States ──
  const [referralSubTab, setReferralSubTab] = useState("codes");
  const [referralStats, setReferralStats] = useState({
    total_codes: 0,
    active_codes: 0,
    inactive_codes: 0,
    suspended_codes: 0,
    total_transactions: 0,
    successful_referrals: 0,
    pending_transactions: 0,
    approved_transactions: 0,
    rejected_transactions: 0,
    total_discount: 0,
    total_commission: 0,
    pending_commission: 0,
    approved_commission: 0,
    paid_commission: 0,
    rejected_commission: 0,
  });

  const [referralCodes, setReferralCodes] = useState([]);
  const [referralCodesPage, setReferralCodesPage] = useState(1);
  const [referralCodesTotalPages, setReferralCodesTotalPages] = useState(1);
  const [referralCodesTotalItems, setReferralCodesTotalItems] = useState(0);
  const [referralCodesSearch, setReferralCodesSearch] = useState("");
  const [referralCodesStatus, setReferralCodesStatus] = useState("");
  const [loadingReferralCodes, setLoadingReferralCodes] = useState(false);

  const [referralTransactions, setReferralTransactions] = useState([]);
  const [referralTrxPage, setReferralTrxPage] = useState(1);
  const [referralTrxTotalPages, setReferralTrxTotalPages] = useState(1);
  const [referralTrxTotalItems, setReferralTrxTotalItems] = useState(0);
  const [referralTrxSearch, setReferralTrxSearch] = useState("");
  const [referralTrxStatus, setReferralTrxStatus] = useState("");
  const [referralTrxPaymentStatus, setReferralTrxPaymentStatus] = useState("");
  const [loadingReferralTrx, setLoadingReferralTrx] = useState(false);

  const [referralCommissions, setReferralCommissions] = useState([]);
  const [referralComPage, setReferralComPage] = useState(1);
  const [referralComTotalPages, setReferralComTotalPages] = useState(1);
  const [referralComTotalItems, setReferralComTotalItems] = useState(0);
  const [referralComSearch, setReferralComSearch] = useState("");
  const [referralComPayoutStatus, setReferralComPayoutStatus] = useState("");
  const [loadingReferralCom, setLoadingReferralCom] = useState(false);

  const [referralSettings, setReferralSettings] = useState({
    referral_enabled: true,
    referral_discount_amount: 5000,
    referral_commission_amount: 10000,
    referral_discount_percentage: 0,
    referral_commission_percentage: 0,
    referral_approval_required: true,
    referral_code_format: "NAME_RANDOM",
  });
  const [loadingReferralSettings, setLoadingReferralSettings] = useState(false);
  const [savingReferralSettings, setSavingReferralSettings] = useState(false);

  // Referral Modal Inputs
  const [selectedReferralItem, setSelectedReferralItem] = useState(null);
  const [editReferralCodeInput, setEditReferralCodeInput] = useState("");
  const [referralReasonInput, setReferralReasonInput] = useState("");
  const [referralAdjustAmountInput, setReferralAdjustAmountInput] = useState("");
  const [referralAdjustReasonInput, setReferralAdjustReasonInput] = useState("");

  // Referral Withdrawals
  const [referralWithdrawals, setReferralWithdrawals] = useState([]);
  const [referralWdPage, setReferralWdPage] = useState(1);
  const [referralWdTotalPages, setReferralWdTotalPages] = useState(1);
  const [referralWdTotalItems, setReferralWdTotalItems] = useState(0);
  const [referralWdSearch, setReferralWdSearch] = useState("");
  const [referralWdStatus, setReferralWdStatus] = useState("");
  const [loadingReferralWd, setLoadingReferralWd] = useState(false);
  const [userViewSubTab, setUserViewSubTab] = useState("users"); // "users" | "withdrawals"
  const [selectedWithdrawalItem, setSelectedWithdrawalItem] = useState(null);
  const [rejectWithdrawalReason, setRejectWithdrawalReason] = useState("");
  const [referralApproveModalOpen, setReferralApproveModalOpen] = useState(false);
  const [selectedReferralWdItem, setSelectedReferralWdItem] = useState(null);
  const [referralWdProofFile, setReferralWdProofFile] = useState(null);
  const [referralWdProofPreview, setReferralWdProofPreview] = useState(null);
  const [referralWdApproveNotes, setReferralWdApproveNotes] = useState("");
  const [submittingReferralWdApprove, setSubmittingReferralWdApprove] = useState(false);
  const [previewReferralProofUrl, setPreviewReferralProofUrl] = useState(null);

  // ── Info & Event Pay-Per-Post Pricing & Transactions ──
  const [contentPricingSubTab, setContentPricingSubTab] = useState("pricing"); // "pricing" | "transactions"
  const [contentPricing, setContentPricing] = useState({
    blog: {
      name: "Publikasi Info (Artikel & Berita)",
      description: "Biaya yang dibayarkan oleh pengguna untuk menerbitkan artikel info promosi di platform Surade.com.",
      price: 10000,
      duration_value: 1,
      duration_unit: "month",
      formatted_duration: "1 Bulan (30 Hari)",
      is_active: true,
    },
    event: {
      name: "Publikasi Event (Agenda Acara)",
      description: "Biaya yang dibayarkan oleh pengguna untuk menerbitkan agenda acara / event di platform Surade.com.",
      price: 15000,
      duration_value: 1,
      duration_unit: "month",
      formatted_duration: "1 Bulan (30 Hari)",
      is_active: true,
    },
  });
  const [editingPricingType, setEditingPricingType] = useState("blog");
  const [pricingEditForm, setPricingEditForm] = useState({
    name: "Publikasi Info (Artikel & Berita)",
    description: "Biaya yang dibayarkan oleh pengguna untuk menerbitkan artikel info promosi di platform Surade.com.",
    price: 10000,
    duration_value: 1,
    duration_unit: "month",
    is_active: true,
  });
  const [savingPricing, setSavingPricing] = useState(false);

  const [contentTransactions, setContentTransactions] = useState([]);
  const [loadingContentTransactions, setLoadingContentTransactions] = useState(false);
  const [contentTxPage, setContentTxPage] = useState(1);
  const [contentTxTotalPages, setContentTxTotalPages] = useState(1);
  const [contentTxTotalItems, setContentTxTotalItems] = useState(0);
  const [contentTxSearch, setContentTxSearch] = useState("");
  const [contentTxTypeFilter, setContentTxTypeFilter] = useState("all");
  const [contentTxStatusFilter, setContentTxStatusFilter] = useState("all");
  const [selectedContentTx, setSelectedContentTx] = useState(null);
  const [contentTxRejectReason, setContentTxRejectReason] = useState("");

  const fetchContentPricing = async () => {
    try {
      const res = await api.get("/admin/content-pricing");
      const list = res.data?.data || [];
      const blogPricing = list.find((p) => p.type === "blog") || {
        name: "Publikasi Info (Artikel & Berita)",
        description: "Biaya yang dibayarkan oleh pengguna untuk menerbitkan artikel info promosi di platform Surade.com.",
        price: 10000,
        duration_value: 1,
        duration_unit: "month",
        formatted_duration: "1 Bulan (30 Hari)",
        is_active: true,
      };
      const eventPricing = list.find((p) => p.type === "event") || {
        name: "Publikasi Event (Agenda Acara)",
        description: "Biaya yang dibayarkan oleh pengguna untuk menerbitkan agenda acara / event di platform Surade.com.",
        price: 15000,
        duration_value: 1,
        duration_unit: "month",
        formatted_duration: "1 Bulan (30 Hari)",
        is_active: true,
      };
      setContentPricing({
        blog: blogPricing,
        event: eventPricing,
      });
    } catch (err) {
      console.error("Failed to fetch content pricing:", err);
    }
  };

  const fetchContentTransactions = async (page = 1) => {
    setLoadingContentTransactions(true);
    try {
      const params = {
        page,
        per_page: 15,
        type: contentTxTypeFilter !== "all" ? contentTxTypeFilter : undefined,
        status: contentTxStatusFilter !== "all" ? contentTxStatusFilter : undefined,
        search: contentTxSearch || undefined,
      };
      const res = await api.get("/admin/content-transactions", { params });
      const paginated = res.data?.data || {};
      setContentTransactions(paginated.data || []);
      setContentTxPage(paginated.current_page || 1);
      setContentTxTotalPages(paginated.last_page || 1);
      setContentTxTotalItems(paginated.total || 0);
    } catch (err) {
      console.error("Failed to fetch content transactions:", err);
    } finally {
      setLoadingContentTransactions(false);
    }
  };

  const handleSavePricing = async (e) => {
    if (e) e.preventDefault();
    setSavingPricing(true);
    try {
      await api.put(`/admin/content-pricing/${editingPricingType}`, {
        name: pricingEditForm.name,
        description: pricingEditForm.description,
        price: Number(pricingEditForm.price),
        duration_value: Number(pricingEditForm.duration_value || 1),
        duration_unit: pricingEditForm.duration_unit || "month",
        is_active: Boolean(pricingEditForm.is_active),
      });
      alert(`Biaya publikasi ${editingPricingType === "event" ? "Event" : "Info"} berhasil diperbarui.`);
      setModal({ show: false, type: "", data: null });
      fetchContentPricing();
      fetchNotificationsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan tarif.");
    } finally {
      setSavingPricing(false);
    }
  };

  const handleApproveContentTx = async (tx) => {
    if (!confirm(`Konfirmasi setujui pembayaran transaksi ${tx.transaction_code}? Konten ${tx.content_type === "event" ? "Event" : "Blog"} akan otomatis berstatus Published.`)) {
      return;
    }
    try {
      await api.put(`/admin/content-transactions/${tx.id}/approve`);
      alert("Pembayaran berhasil disetujui & konten telah dipublikasikan!");
      fetchContentTransactions(contentTxPage);
      fetchNotificationsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui transaksi.");
    }
  };

  const handleRejectContentTx = async (e) => {
    if (e) e.preventDefault();
    if (!selectedContentTx) return;
    try {
      await api.put(`/admin/content-transactions/${selectedContentTx.id}/reject`, {
        notes: contentTxRejectReason,
      });
      alert("Transaksi berhasil ditolak.");
      setModal({ show: false, type: "", data: null });
      fetchContentTransactions(contentTxPage);
      fetchNotificationsAndStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak transaksi.");
    }
  };

  // ── WhatsApp Management Functions ──
  // ── Payment & WhatsApp Management Functions ──
  const fetchWaSettings = async () => {
    try {
      // 1. Fetch Payment Methods List & Platform Rules
      try {
        const payRes = await api.get("/admin/payment-methods");
        const payData = payRes.data?.data;
        if (payData?.methods && Array.isArray(payData.methods) && payData.methods.length > 0) {
          setPaymentMethodsList(payData.methods);
          localStorage.setItem("official_payment_methods_custom", JSON.stringify(payData.methods));
        }
        if (payData?.official_account_holder) {
          setPaymentOfficialHolder(payData.official_account_holder);
          localStorage.setItem("official_account_holder", payData.official_account_holder);
        }
        if (payData?.rules) {
          setPaymentRulesForm({
            bank_transfer_enabled: payData.rules.bank_transfer_enabled !== false,
            bank_transfer_min_amount: payData.rules.bank_transfer_min_amount || 10000,
            qris_enabled: payData.rules.qris_enabled !== false,
            points_enabled: payData.rules.points_enabled !== false,
            point_exchange_rate_idr: payData.rules.point_exchange_rate_idr || 1000,
            points_allowed_types: payData.rules.points_allowed_types || "both",
          });
          localStorage.setItem("platform_payment_rules", JSON.stringify(payData.rules));
        }
      } catch (err) {
        console.warn("Using local payment methods cache:", err);
      }

      // 2. Fetch WhatsApp Fee Settings
      const res = await api.get("/admin/whatsapp-settings");
      const data = res.data?.data;
      if (data) {
        setWaAdminSettings(data);
        setWaAdminSettingsForm({
          enabled: data.enabled,
          amount: data.amount,
          bank_name: data.bank_name || "Bank Mandiri",
          account_number: !data.account_number || data.account_number === "0123456789" || data.account_number === "XXX" ? "133-0011-409-331" : data.account_number,
          account_holder: !data.account_holder || data.account_holder === "Official Surade.com" ? "Triwala Mitra Bestari" : data.account_holder,
          instruction: data.instruction,
          selected_bank: data.selected_bank || "Mandiri",
        });
      }
    } catch (err) {
      console.error("Failed to fetch payment / WA settings:", err);
    }
  };

  const saveWaSettings = async () => {
    setSavingWaSettings(true);
    try {
      // 1. Save payment methods and platform rules to backend
      try {
        const payRes = await api.post("/admin/payment-methods", {
          methods: paymentMethodsList,
          official_account_holder: paymentOfficialHolder,
          bank_transfer_enabled: paymentRulesForm.bank_transfer_enabled,
          bank_transfer_min_amount: Number(paymentRulesForm.bank_transfer_min_amount || 10000),
          qris_enabled: paymentRulesForm.qris_enabled,
          points_enabled: paymentRulesForm.points_enabled,
          point_exchange_rate_idr: Number(paymentRulesForm.point_exchange_rate_idr || 1000),
          points_allowed_types: paymentRulesForm.points_allowed_types || "both",
        });
        if (payRes.data?.data?.methods) {
          setPaymentMethodsList(payRes.data.data.methods);
        }
        if (payRes.data?.data?.rules) {
          setPaymentRulesForm(payRes.data.data.rules);
          localStorage.setItem("platform_payment_rules", JSON.stringify(payRes.data.data.rules));
        }
      } catch (err) {
        console.warn("Payment methods save to API:", err);
      }
      localStorage.setItem("official_payment_methods_custom", JSON.stringify(paymentMethodsList));
      localStorage.setItem("official_account_holder", paymentOfficialHolder);
      localStorage.setItem("platform_payment_rules", JSON.stringify(paymentRulesForm));

      // 2. Save WhatsApp fee settings and QRIS image
      const formData = new FormData();
      formData.append("enabled", waAdminSettingsForm.enabled ? "1" : "0");
      formData.append("amount", waAdminSettingsForm.amount);
      formData.append("bank_name", waAdminSettingsForm.bank_name);
      formData.append("account_number", waAdminSettingsForm.account_number);
      formData.append("account_holder", waAdminSettingsForm.account_holder || paymentOfficialHolder);
      formData.append("instruction", waAdminSettingsForm.instruction);
      if (waQrisFile) {
        formData.append("qris_image", waQrisFile);
      }
      const res = await api.post("/admin/whatsapp-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data?.data;
      if (data) {
        setWaAdminSettings(data);
      }
      alert("Pengaturan sistem pembayaran, batas nominal transfer, QRIS, Poin & WhatsApp berhasil disimpan!");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan pengaturan pembayaran.");
    } finally {
      setSavingWaSettings(false);
    }
  };

  // Auto-sync payment methods to Backend API and Local Storage
  const savePaymentMethodsToApi = async (updatedList, holder = paymentOfficialHolder) => {
    try {
      localStorage.setItem("official_payment_methods_custom", JSON.stringify(updatedList));
      localStorage.setItem("official_account_holder", holder);
      localStorage.setItem("platform_payment_rules", JSON.stringify(paymentRulesForm));
      await api.post("/admin/payment-methods", {
        methods: updatedList,
        official_account_holder: holder,
        bank_transfer_enabled: paymentRulesForm.bank_transfer_enabled,
        bank_transfer_min_amount: Number(paymentRulesForm.bank_transfer_min_amount || 10000),
        qris_enabled: paymentRulesForm.qris_enabled,
        points_enabled: paymentRulesForm.points_enabled,
        point_exchange_rate_idr: Number(paymentRulesForm.point_exchange_rate_idr || 1000),
        points_allowed_types: paymentRulesForm.points_allowed_types || "both",
      });
    } catch (err) {
      console.warn("Auto-sync payment methods to API:", err);
    }
  };

  // Toggle Aktif / Nonaktif Payment Method
  const togglePaymentMethodActive = (index) => {
    setPaymentMethodsList(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      }
      savePaymentMethodsToApi(updated);
      return updated;
    });
  };

  // Save Edit Payment Method
  const handleSaveEditPaymentMethod = (updatedItem) => {
    setPaymentMethodsList(prev => {
      const updated = prev.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem } : item);
      savePaymentMethodsToApi(updated);
      return updated;
    });
    setEditingPaymentMethod(null);
  };

  // Add New Custom Payment Method
  const handleAddNewPaymentMethod = () => {
    if (!newPaymentForm.name || !newPaymentForm.accountNumber) {
      alert("Nama Bank / E-Wallet dan Nomor Rekening wajib diisi!");
      return;
    }
    const newId = newPaymentForm.name.replace(/\s+/g, "_").toLowerCase() + "_" + Date.now();
    const newItem = {
      ...newPaymentForm,
      id: newId,
      logo: newPaymentForm.category === "ewallet" ? "/logos/dana.png" : newPaymentForm.category === "qris" ? "/logos/qris.png" : "/logos/mandiri.png",
      logoText: newPaymentForm.name,
      isActive: true,
    };
    setPaymentMethodsList(prev => {
      const updated = [...prev, newItem];
      savePaymentMethodsToApi(updated);
      return updated;
    });
    setShowAddPaymentModal(false);
    setNewPaymentForm({
      id: "",
      name: "",
      accountNumber: "",
      accountName: paymentOfficialHolder || "Triwala Mitra Bestari",
      category: "bank",
      badgeColor: "bg-[#007570] text-white",
      logoUrl: "",
      isActive: true,
    });
  };

  // Delete Custom Payment Method
  const handleDeletePaymentMethod = (id) => {
    if (!window.confirm("Hapus metode pembayaran ini?")) return;
    setPaymentMethodsList(prev => {
      const updated = prev.filter(item => item.id !== id);
      savePaymentMethodsToApi(updated);
      return updated;
    });
  };

  const fetchWaLogs = async (page = 1) => {
    setLoadingWaLogs(true);
    try {
      const res = await api.get("/admin/whatsapp-logs", { params: { page } });
      const data = res.data?.data;
      if (data) {
        setWaLogs(data.logs || []);
        setWaLogPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
        setWaLogStats(data.stats || { total_access: 0, total_revenue: 0, today_access: 0 });
        setWaLogPage(page);
      }
    } catch (err) {
      console.error("Failed to fetch WA logs:", err);
    } finally {
      setLoadingWaLogs(false);
    }
  };

  const approveWaLog = async (logId) => {
    if (!window.confirm("Setujui pembayaran & buka akses WhatsApp ini?")) return;
    try {
      const res = await api.put(`/admin/whatsapp-logs/${logId}/approve`);
      alert("Akses WhatsApp berhasil disetujui!");
      const waLink = res.data?.notify_whatsapp_link;
      if (waLink && window.confirm("Buka WhatsApp sekarang untuk kirim notifikasi ke customer?")) {
        window.open(waLink, "_blank");
      }
      fetchWaLogs(waLogPage);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui akses.");
    }
  };

  const rejectWaLog = (logOrId) => {
    const logItem = typeof logOrId === "object" ? logOrId : (filteredWaLogs.find((l) => l.id === logOrId) || { id: logOrId });
    handleOpenRevisionModal("whatsapp", logItem);
  };

  const deleteWaLog = async (logId) => {
    if (!window.confirm("Hapus riwayat akses WhatsApp ini secara permanen? Aksi ini tidak bisa dibatalkan.")) return;
    try {
      await api.delete(`/admin/whatsapp-logs/${logId}`);
      fetchWaLogs(waLogPage);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus riwayat.");
    }
  };

  // ── Chat QRIS Access Management States & Handlers ──
  const [chatLogs, setChatLogs] = useState([]);
  const [chatLogStats, setChatLogStats] = useState({
    total_access: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    total_revenue: 0,
    today_revenue: 0,
    this_month_revenue: 0,
    this_week_revenue: 0,
  });
  const [loadingChatLogs, setLoadingChatLogs] = useState(false);
  const [chatLogPage, setChatLogPage] = useState(1);
  const [chatLogPagination, setChatLogPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [chatLogSearch, setChatLogSearch] = useState("");
  const [chatLogStatusFilter, setChatLogStatusFilter] = useState("all");
  const [chatRevenuePeriod, setChatRevenuePeriod] = useState("all");

  // ── Chat Access Pricing / Tarif Settings ──
  const [chatAdminSettings, setChatAdminSettings] = useState({
    enabled: true,
    amount: 4000,
    points: 4,
    bank_name: "BCA / QRIS",
    instruction: "Akses kirim pesan chat ke penjual dikenakan biaya administrasi resmi.",
  });
  const [chatAdminSettingsForm, setChatAdminSettingsForm] = useState({
    enabled: true,
    amount: 4000,
    points: 4,
    bank_name: "BCA / QRIS",
    instruction: "Akses kirim pesan chat ke penjual dikenakan biaya administrasi resmi.",
  });
  const [loadingChatSettings, setLoadingChatSettings] = useState(false);
  const [savingChatSettings, setSavingChatSettings] = useState(false);
  const [showEditChatTarifModal, setShowEditChatTarifModal] = useState(false);

  const fetchChatSettings = async () => {
    setLoadingChatSettings(true);
    try {
      const res = await api.get("/chat-settings");
      if (res.data?.data) {
        setChatAdminSettings(res.data.data);
        setChatAdminSettingsForm(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chat settings:", err);
    } finally {
      setLoadingChatSettings(false);
    }
  };

  const handleSaveChatSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingChatSettings(true);
    try {
      const res = await api.post("/chat-settings", chatAdminSettingsForm);
      if (res.data?.data) {
        setChatAdminSettings(res.data.data);
        setChatAdminSettingsForm(res.data.data);
      }
      alert(res.data?.message || "Pengaturan tarif akses chat berhasil disimpan!");
      setShowEditChatTarifModal(false);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan tarif chat.");
    } finally {
      setSavingChatSettings(false);
    }
  };

  const fetchChatLogs = async (page = 1) => {
    setLoadingChatLogs(true);
    try {
      const res = await api.get(`/chat-logs?page=${page}`);
      const data = res.data?.data;
      if (data) {
        setChatLogs(data.logs || []);
        setChatLogPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
        setChatLogStats(data.stats || { total_access: 0, total_revenue: 0, today_revenue: 0 });
        setChatLogPage(page);
      }
    } catch (err) {
      console.error("Failed to fetch chat logs:", err);
    } finally {
      setLoadingChatLogs(false);
    }
  };

  const approveChatLog = async (logId) => {
    if (!window.confirm("Setujui pembayaran QRIS ini? Akses chat akan dibuka dan Poin Gold akan masuk ke pemilik usaha.")) return;
    try {
      const res = await api.post(`/chat-logs/${logId}/approve`);
      alert(res.data?.message || "Akses chat berhasil disetujui! Poin Gold telah dikreditkan ke pemilik usaha.");
      fetchChatLogs(chatLogPage);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui akses chat.");
    }
  };

  const rejectChatLog = (log) => {
    const defaultReason = "Bukti transfer QRIS tidak sesuai atau tidak valid.";
    const reason = window.prompt("Masukkan alasan penolakan pembayaran akses chat:", defaultReason);
    if (reason === null) return;
    handleConfirmRejectChatLog(log.id, reason);
  };

  const handleConfirmRejectChatLog = async (logId, reason) => {
    try {
      const res = await api.post(`/chat-logs/${logId}/reject`, { reason });
      alert("Permohonan akses chat berhasil ditolak.");
      fetchChatLogs(chatLogPage);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak akses chat.");
    }
  };

  const deleteChatLog = async (logId) => {
    if (!window.confirm("Hapus riwayat akses chat ini secara permanen?")) return;
    try {
      await api.delete(`/chat-logs/${logId}`);
      fetchChatLogs(chatLogPage);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus riwayat chat.");
    }
  };

  // ── Modal state ──
  const [modal, setModal] = useState({ show: false, type: "", data: null });

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const u = (parsed && parsed.data && (parsed.data.role || parsed.data.email)) ? parsed.data : parsed;
          setUser(u);
          const role = (u?.role || "").toLowerCase();
          if (role !== "admin" && role !== "super_admin") {
            // Verify with server in case role was updated to admin in database
            api.get('/user').then((res) => {
              const serverUser = (res?.data?.data && res.data.data.role)
                ? res.data.data
                : (res?.data?.role ? res.data : (res?.role ? res : res?.data));
              const serverRole = (serverUser?.role || "").toLowerCase();
              if (serverRole === "admin" || serverRole === "super_admin") {
                localStorage.setItem("user", JSON.stringify(serverUser));
                setUser(serverUser);
                window.dispatchEvent(new Event("userAuthChanged"));
                fetchAllData();
              } else {
                navigate("/dashboard", { replace: true });
              }
            }).catch(() => {
              navigate("/dashboard", { replace: true });
            });
            return false;
          }
        } catch { }
      } else {
        navigate("/login", { replace: true });
        return false;
      }
      return true;
    };

    // Force clear stale cache on mount
    const clearStaleCache = () => {
      try {
        const keys = Object.keys(localStorage);
        const adminKeys = keys.filter(k => k.startsWith('cached_admin_') || k.startsWith('admin_cache_'));
        adminKeys.forEach(key => localStorage.removeItem(key));
        // console.log('[AdminWeb Mount] Cleared', adminKeys.length, 'cache entries');
      } catch (e) {
        console.warn('[AdminWeb Mount] Cache clear failed:', e);
      }
    };

    clearStaleCache();
    const isAdmin = loadUser();
    if (isAdmin) {
      fetchAllData();
    }

    // Auto polling notifications and stats every 30 seconds only if admin
    const interval = setInterval(() => {
      const u = localStorage.getItem("user");
      try {
        if (JSON.parse(u)?.role === "admin") {
          fetchNotificationsAndStats();
        }
      } catch (_) { }
    }, 30000);

    // Listen for user auth changes
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      clearInterval(interval);
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "coins") {
      fetchCoinStats();
    }
    if (activeTab === "laporan" || activeTab === "report" || activeTab === "reports") {
      api.get('/admin/reports').then(res => {
        const repData = res.data || {};
        if (repData.reports) setReportsList(repData.reports);
        if (repData.stats) setReportStats(repData.stats);
      }).catch(err => console.error("Failed reports fetch on tab switch:", err));
    }
    if (activeTab === "referrals") {
      fetchReferralStats();
      fetchReferralWithdrawals(referralWdPage || 1);
      if (referralSubTab === "codes") fetchReferralCodes(referralCodesPage || 1);
      else if (referralSubTab === "transactions") fetchReferralTransactions(referralTrxPage || 1);
      else if (referralSubTab === "commissions") fetchReferralCommissions(referralComPage || 1);
      else if (referralSubTab === "withdrawals") fetchReferralWithdrawals(referralWdPage || 1);
      else if (referralSubTab === "settings") fetchReferralSettings();
    }
    if (activeTab === "content_pricing" || activeTab === "content_packages" || activeTab === "packages") {
      fetchContentPricing();
      if (contentPricingSubTab === "transactions") {
        fetchContentTransactions(contentTxPage || 1);
      }
    }
    if (activeTab === "whatsapp" || activeTab === "payment-settings") {
      fetchWaSettings();
      fetchWaLogs(1);
    }
    if (activeTab === "chat") {
      fetchChatLogs(1);
      fetchChatSettings();
    }
    if (activeTab === "products") {
      fetchProducts();
    }
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, referralSubTab, productStatusFilter]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      const usersData = res.data?.data || res.data || [];
      const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
      if (usersList.length > 0) {
        const mappedUsers = usersList.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.is_active === false || u.status === 'inactive' ? 'inactive' : 'active',
          phone: u.phone || '-',
          joined: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-',
          businesses: Array.isArray(u.businesses) ? u.businesses : [],
          businesses_count: u.businesses_count !== undefined && u.businesses_count !== null
            ? Number(u.businesses_count)
            : (Array.isArray(u.businesses) ? u.businesses.length : 0),
          avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'User')}`,
          is_online: u.is_online,
          last_seen_at: u.last_seen_at
        }));
        setUsers(mappedUsers);
        setAdminCache("users", mappedUsers);
      }
    } catch (err) {
      console.warn("Silent users refresh:", err);
    }
  }, []);

  // Polling kehadiran user setiap 10 detik saat admin sedang melihat tab 'users'
  useEffect(() => {
    if (activeTab !== "users") return;
    const interval = setInterval(() => {
      fetchUsers();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, fetchUsers]);

  const handleChartYearChange = async (year) => {
    setSelectedChartYear(year);
    try {
      const res = await api.get(`/admin/stats?year=${year}`);
      const statsData = res.data || {};
      setStats((prev) => ({
        ...prev,
        userGrowth: statsData.userGrowth || [],
        businessGrowth: statsData.businessGrowth || [],
      }));
    } catch (err) {
      console.error("Gagal mengambil data statistik tahun:", err);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await api.get(`/admin/products?status=${productStatusFilter}&search=${encodeURIComponent(productSearch)}`);
      const pData = res.data || {};
      setProducts(pData.products || []);
      if (pData.counts) setProductCounts(pData.counts);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleApproveProduct = async (product) => {
    if (!window.confirm(`Setujui dan verifikasi produk "${product.name}"?`)) return;
    try {
      await api.put(`/admin/products/${product.id}/approve`);
      toast.success(`Produk "${product.name}" berhasil diverifikasi.`);
      fetchProducts();
      setStats((prev) => ({
        ...prev,
        pendingProducts: Math.max(0, (prev.pendingProducts || 1) - 1),
      }));
    } catch (err) {
      console.error("Gagal menyetujui produk:", err);
      toast.error(err.response?.data?.message || "Gagal menyetujui produk.");
    }
  };

  const handleConfirmRejectProduct = async () => {
    if (!rejectProductModal.product) return;
    try {
      const mode = rejectProductModal.mode || "reject";
      await api.put(`/admin/products/${rejectProductModal.product.id}/reject`, {
        mode,
        rejection_reason: rejectProductModal.reason || (mode === "revision" ? "Perlu perbaikan informasi / foto produk." : "Produk tidak memenuhi syarat & ketentuan publikasi platform."),
      });
      toast.success(mode === "revision" ? `Permintaan perbaikan untuk "${rejectProductModal.product.name}" telah dikirim ke pemilik usaha.` : `Produk "${rejectProductModal.product.name}" telah ditolak.`);
      setRejectProductModal({ open: false, product: null, reason: "", mode: "reject" });
      fetchProducts();
      setStats((prev) => ({
        ...prev,
        pendingProducts: Math.max(0, (prev.pendingProducts || 1) - 1),
      }));
    } catch (err) {
      console.error("Gagal memproses produk:", err);
      toast.error(err.response?.data?.message || "Gagal memproses produk.");
    }
  };

  const handleToggleProductActive = async (product) => {
    try {
      const res = await api.put(`/admin/products/${product.id}/toggle-status`);
      toast.success(res.data?.message || "Status produk berhasil diubah.");
      fetchProducts();
    } catch (err) {
      console.error("Gagal mengubah status produk:", err);
      toast.error("Gagal mengubah status aktif produk.");
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}" secara permanen?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success(`Produk "${product.name}" berhasil dihapus.`);
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
      fetchProducts();
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
      toast.error(err?.data?.message || err?.message || "Gagal menghapus produk.");
    }
  };

  const fetchNotificationsAndStats = async () => {
    try {
      const [statsRes, notifRes] = await Promise.allSettled([
        api.get(`/admin/stats?year=${selectedChartYearRef.current}`),
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
          blogRevenue: statsData.blogRevenue || 0,
          eventRevenue: statsData.eventRevenue || 0,
          totalBlogTransactions: statsData.totalBlogTransactions || 0,
          totalEventTransactions: statsData.totalEventTransactions || 0,
          pendingContentPayments: statsData.pendingContentPayments || 0,
          totalContentRevenue: statsData.totalContentRevenue || ((statsData.blogRevenue || 0) + (statsData.eventRevenue || 0)),
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
      fetchCoinStats();
      fetchProducts();
      fetchReferralStats();
    } catch (err) {
      console.error("Failed to poll notifications & stats:", err);
    }
  };

  const fetchAllData = async () => {
    // Force clear ALL cache for fresh data
    try {
      const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('cached_admin_') || k.startsWith('admin_cache_'));
      cacheKeys.forEach(key => localStorage.removeItem(key));
      // console.log('[AdminWeb] Cleared cache:', cacheKeys.length, 'items');
    } catch (e) {
      console.warn('[AdminWeb] Failed to clear cache:', e);
    }

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
            blogRevenue: statsData.blogRevenue || 0,
            eventRevenue: statsData.eventRevenue || 0,
            totalBlogTransactions: statsData.totalBlogTransactions || 0,
            totalEventTransactions: statsData.totalEventTransactions || 0,
            pendingContentPayments: statsData.pendingContentPayments || 0,
            totalContentRevenue: statsData.totalContentRevenue || ((statsData.blogRevenue || 0) + (statsData.eventRevenue || 0)),
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
            status: u.is_active === false || u.status === 'inactive' ? 'inactive' : 'active',
            phone: u.phone || '-',
            joined: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-',
            businesses: Array.isArray(u.businesses) ? u.businesses : [],
            businesses_count: u.businesses_count !== undefined && u.businesses_count !== null
              ? Number(u.businesses_count)
              : (Array.isArray(u.businesses) ? u.businesses.length : 0),
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'User')}`,
            is_online: u.is_online,
            last_seen_at: u.last_seen_at
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

        api.get('/admin/navbar-categories').then(res => {
          const navbarData = res.data?.data || res.data || [];
          const list = Array.isArray(navbarData) ? navbarData : (navbarData?.data || []);
          setNavbarCategories(list);
          setAdminCache("navbar_categories", list);
        }).catch(err => console.error("Failed navbar categories fetch:", err)),

        api.get('/admin/blogs').then(res => {
          const blogsData = res.data?.data || res.data || [];
          const list = Array.isArray(blogsData) ? blogsData : (blogsData?.data || []);
          setBlogs(list);
          setAdminCache("blogs", list);
        }).catch(err => console.error("Failed blogs fetch:", err)),

        api.get('/admin/packages').then(res => {
          const pkgData = res.data?.data || res.data || [];
          const list = Array.isArray(pkgData) ? pkgData : [];
          setContentPackages(list);
          setAdminCache("content_packages", list);
        }).catch(err => console.error("Failed packages fetch:", err)),

        api.get('/admin/package-transactions').then(res => {
          const txData = res.data?.data || res.data || [];
          const list = Array.isArray(txData) ? txData : (txData?.data || []);
          setContentTransactions(list);
          setContentTxTotalItems(res.data?.total || list.length);
        }).catch(err => console.error("Failed package-transactions fetch:", err)),

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

        api.get('/admin/coupons', { bypassCache: true }).then(res => {
          // api.get() returns data directly (not wrapped in .data)
          // Backend returns plain array for this endpoint
          const list = Array.isArray(res) ? res : (res?.data || res?.coupons || []);
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
          if (Array.isArray(plansData)) {
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

        api.get('/admin/settings').then(res => {
          const settingsData = res.data || {};
          setSettings(settingsData);
          setAdminCache("settings", settingsData);
          // Populate form with current values
          setSettingsForm({
            site_name: settingsData.general?.site_name || "",
            site_logo: null,
            site_banner: null,
            contact_email: settingsData.contact?.contact_email || "",
            contact_phone: settingsData.contact?.contact_phone || "",
            contact_address: settingsData.contact?.contact_address || "",
            social_instagram: settingsData.social?.social_instagram || "",
            social_facebook: settingsData.social?.social_facebook || "",
            social_website: settingsData.social?.social_website || "",
            seo_meta_title: settingsData.seo?.seo_meta_title || "",
            seo_meta_description: settingsData.seo?.seo_meta_description || "",
          });
        }).catch(err => console.error("Failed settings fetch:", err)),
      ];

      const results = await Promise.allSettled(fetchers);
      const isForbidden = results.some(
        (r) => r.status === "rejected" && r.reason?.response?.status === 403
      );
      if (isForbidden) {
        console.warn("[AdminWeb] Secondary endpoint returned 403, keeping admin session intact.");
      }
      fetchProducts();
      fetchCoinStats();
      fetchReferralStats();
      fetchReferralWithdrawals(1);
      fetchWaLogs();
      fetchChatLogs();
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };


  // ── Package & Subscription Handlers ──
  const handleSavePackage = async () => {
    try {
      // Ubah checkbox (can_add_map, dst) jadi objek `features` yang
      // sebenarnya dibaca & disimpan backend. Sebelumnya field-field
      // checkbox ini dikirim mentah dan tidak pernah tersimpan.
      const features = {
        "Lokasi Peta Penuh": Boolean(packageForm.can_add_map),
        "Galeri Foto Profil": Boolean(packageForm.can_add_gallery),
        "Fitur Katalog Produk": Boolean(packageForm.can_add_products),
        "Akses Chat & WA Direct": Boolean(packageForm.can_chat),
        "Prioritas & Badge Premium": Boolean(packageForm.priority_listing),
      };

      // Backend menyimpan durasi dalam jumlah hari (duration_days),
      // sedangkan form ini memakai duration_value + duration_unit.
      const durationDays = packageForm.duration_unit === "year"
        ? Number(packageForm.duration_value || 1) * 365
        : packageForm.duration_unit === "day"
          ? Number(packageForm.duration_value || 1)
          : Number(packageForm.duration_value || 1) * 30; // default: bulan

      const payload = {
        name: packageForm.name,
        description: packageForm.description,
        price: Number(packageForm.price || 0),
        duration_days: durationDays,
        features,
        is_active: Boolean(packageForm.is_active),
      };

      if (modal.type === "editPackage" && modal.data?.id) {
        await api.put(`/admin/plans/${modal.data.id}`, payload);
        alert("Paket berhasil diupdate!");
      } else {
        await api.post(`/admin/plans`, payload);
        alert("Paket berhasil ditambahkan!");
      }

      // Re-fetch plans to ensure UI is synced
      const res = await api.get('/admin/plans');
      const plansData = res.data?.data || res.data || [];
      if (Array.isArray(plansData)) {
        setPlans(plansData);
        setAdminCache("plans", plansData);
      }

      closeModal();
    } catch (err) {
      console.error("Save package error:", err);
      alert(err.response?.data?.message || "Gagal menyimpan paket. Silakan coba lagi.");
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await api.delete(`/admin/plans/${id}`);
      setPlans((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setAdminCache("plans", next);
        return next;
      });
      alert("Paket berhasil dihapus!");
    } catch (err) {
      console.error("Delete package error:", err);
      setPlans((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setAdminCache("plans", next);
        return next;
      });
      alert("Paket telah dihapus.");
    }
    closeModal();
  };

  // (Content Pricing & Transactions Handlers are managed above)

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
      const payload = {
        ...couponForm,
        code: String(couponForm.code || "").trim().toUpperCase(),
        discount_value: Number(couponForm.discount_value) || 0,
        minimum_amount: couponForm.minimum_amount !== "" && couponForm.minimum_amount != null ? Number(couponForm.minimum_amount) : 0,
        maximum_discount: couponForm.maximum_discount !== "" && couponForm.maximum_discount != null ? Number(couponForm.maximum_discount) : null,
        usage_limit: couponForm.usage_limit !== "" && couponForm.usage_limit != null ? Number(couponForm.usage_limit) : null,
        starts_at: couponForm.starts_at || null,
        expires_at: couponForm.expires_at || null,
      };

      let resData;
      if (modal.type === "editCoupon" && modal.data?.id) {
        resData = await api.put(`/admin/coupons/${modal.data.id}`, payload);
      } else {
        resData = await api.post("/admin/coupons", payload);
      }

      const savedCoupon = resData?.data || (modal.data?.id ? { ...modal.data, ...payload } : payload);

      if (modal.type === "editCoupon" && modal.data?.id) {
        setCoupons(prev => {
          const updated = prev.map(c => String(c.id) === String(modal.data.id) ? { ...c, ...savedCoupon } : c);
          setAdminCache("coupons", updated);
          return updated;
        });
      } else {
        setCoupons(prev => {
          const updated = [savedCoupon, ...prev];
          setAdminCache("coupons", updated);
          return updated;
        });
      }

      closeModal();

      // Refetch from server in background to get synchronized state
      api.get('/admin/coupons', { bypassCache: true }).then(res => {
        const list = Array.isArray(res) ? res : (res?.data || res?.coupons || []);
        if (Array.isArray(list) && list.length > 0) {
          setCoupons(list);
          setAdminCache("coupons", list);
        }
      }).catch(() => { });
    } catch (err) {
      const errMsg = err?.data?.message
        || (err?.data?.errors ? Object.values(err.data.errors).flat().join("\n") : null)
        || err?.message
        || "Gagal menyimpan kupon.";
      alert(errMsg);
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
      // Update local state immediately for instant feedback
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setAdminCache("coupons", null);
    } catch (err) {
      alert(err?.data?.message || err?.message || "Gagal menghapus kupon.");
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

  const handleClearNotificationsHistory = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua riwayat notifikasi?")) {
      return;
    }
    try {
      await api.delete('/admin/notifications/clear');
    } catch (err) {
      console.warn("Failed to clear notifications on backend:", err);
    }
    setNotifications([]);
    setUnreadNotificationsCount(0);
    localStorage.removeItem("admin_cache_notifications");
    setAdminCache("notifications", []);
    toast.success("Riwayat notifikasi berhasil dibersihkan!");
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

  const handleSaveAdminBusiness = async (e) => {
    if (e) e.preventDefault();
    if (!addBusinessForm.user_id) {
      alert("Pilih user pemilik usaha terlebih dahulu.");
      return;
    }
    if (!addBusinessForm.name.trim()) {
      alert("Nama usaha wajib diisi.");
      return;
    }
    setAddBusinessLoading(true);
    try {
      const res = await api.post('/admin/businesses', addBusinessForm);
      if (res.data?.success) {
        alert(res.data.message || "Usaha berhasil ditambahkan!");
        closeModal();
        fetchAllData();
      } else {
        alert(res.data?.message || "Gagal menambahkan usaha.");
      }
    } catch (err) {
      console.error("Gagal tambah usaha:", err);
      alert(err.response?.data?.message || "Gagal menambahkan usaha. Periksa kembali data yang diisi.");
    } finally {
      setAddBusinessLoading(false);
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
    } else if (type === "addBusiness") {
      setAddBusinessForm({
        user_id: "",
        name: "",
        category_id: "",
        description: "",
        address: "",
        phone: "",
        whatsapp: "",
        city: "",
        province: "",
        status: "approved",
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
    } else if (type === "addNavbarCategory") {
      setNavbarCategoryForm({
        name: "",
        slug: "",
        icon: "",
        icon_file: null,
        icon_preview: null,
        remove_icon: 0,
        parent_id: "",
        order: 0,
        is_active: true,
      });
    } else if (type === "editNavbarCategory" && data) {
      const isImg = data.icon && (data.icon.startsWith("http") || data.icon.includes("/") || /\.(png|jpe?g|svg|webp|gif)$/i.test(data.icon));
      setNavbarCategoryForm({
        name: data.name || "",
        slug: data.slug || "",
        icon: isImg ? "" : (data.icon || ""),
        icon_file: null,
        icon_preview: isImg ? (data.icon_url || getStorageUrl(data.icon)) : null,
        remove_icon: 0,
        parent_id: data.parent_id || "",
        order: data.order || 0,
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
        discount_value: data.discount_value != null && data.discount_value !== "" ? Math.round(parseFloat(data.discount_value)) : "",
        applies_to: data.applies_to || "all",
        minimum_amount: data.minimum_amount != null && data.minimum_amount !== "" ? Math.round(parseFloat(data.minimum_amount)) : "",
        maximum_discount: data.maximum_discount != null && data.maximum_discount !== "" ? Math.round(parseFloat(data.maximum_discount)) : "",
        usage_limit: data.usage_limit ?? "",
        starts_at: data.starts_at ? data.starts_at.substring(0, 10) : "",
        expires_at: data.expires_at ? data.expires_at.substring(0, 10) : "",
        is_active: data.is_active ?? true,
      });
    } else if (type === "addAdPackage") {
      setAdPackageForm({
        name: "",
        placement_type: "standard",
        description: "",
        price: 50000,
        duration_value: 30,
        duration_unit: "day",
        priority: 0,
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
        placement_type: data.placement_type || (/premium/i.test(data.name || "") ? "premium" : "standard"),
        description: data.description || "",
        price: data.price || 0,
        duration_value: data.duration_value || 30,
        duration_unit: data.duration_unit || "day",
        priority: data.priority || 0,
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
    setActiveWaProofDetailView(null);
    setModal({ show: false, type: "", data: null });
  };

  // ── Advertisement handlers ──
  const handleApproveAd = async (adId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui iklan ini? Iklan akan otomatis aktif dan masa tayang dihitung mulai hari ini.')) return;

    try {
      await api.put(`/admin/advertisements/${adId}/approve`);
      alert('Iklan berhasil disetujui & diaktifkan!');
      fetchAllData();
    } catch (err) {
      console.error('Failed to approve advertisement:', err);
      alert('Gagal menyetujui iklan');
    }
  };

  const handleRejectAd = (adOrId) => {
    let adObj = null;
    if (typeof adOrId === 'object' && adOrId !== null) {
      adObj = adOrId;
    } else {
      adObj = advertisements.find(a => a.id === adOrId) || { id: adOrId };
    }
    handleDirectRejectAd(adObj);
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
  const handleOpenBusinessDetail = async (business) => {
    setModal({
      show: true,
      type: "viewBusinessDetail",
      data: business,
    });

    try {
      const res = await api.get(`/businesses/${business.id}`);
      if (res.data) {
        setModal((prev) => {
          if (prev.show && prev.type === "viewBusinessDetail" && prev.data?.id === business.id) {
            return {
              ...prev,
              data: {
                ...prev.data,
                ...res.data,
                subscription: res.data.latest_subscription || res.data.latestSubscription || res.data.subscription || prev.data?.subscription,
                payment: res.data.latest_subscription?.payment || res.data.latestSubscription?.payment || res.data.payment || prev.data?.payment,
              },
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn("Could not fetch latest business detail:", err);
    }
  };

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

  const handleToggleBusinessVerification = async (businessId, currentStatus) => {
    const action = currentStatus ? 'membatalkan verifikasi' : 'memverifikasi';
    if (!confirm(`Apakah Anda yakin ingin ${action} bisnis ini?`)) return;

    try {
      const response = await api.put(`/admin/businesses/${businessId}/toggle-verification`);
      alert(response.data.message || 'Status verifikasi berhasil diubah');
      fetchAllData();
    } catch (err) {
      console.error('Failed to toggle verification:', err);
      alert(err.response?.data?.message || 'Gagal mengubah status verifikasi');
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
    if (!confirm('Apakah Anda yakin ingin menghapus usaha ini secara permanen?')) return;

    try {
      // Optimistic UI update - remove immediately from list
      setBusinesses(prev => prev.filter(b => b.id !== businessId));

      // Delete from server
      await api.delete(`/admin/businesses/${businessId}`);

      // Clear cache
      try {
        localStorage.removeItem("cached_admin_businesses");
      } catch (e) { }

      // Show success toast
      alert('✓ Usaha berhasil dihapus!');

      // Refresh data in background (optional, for sync)
      fetchAllData();
    } catch (err) {
      console.error('Failed to delete business:', err);
      alert(err.response?.data?.message || 'Gagal menghapus usaha.');
      // Revert optimistic update on error
      fetchAllData();
    }
  };

  // Generic handler untuk delete/reject dari modal confirmation
  const handleSaveModal = async () => {
    if (modal.type.includes("delete") || modal.type.includes("reject")) {
      // Jika ada item yang spesifik di modal.data
      if (modal.data?.id) {
        const itemId = modal.data.id;
        const itemType = modal.type.replace("delete", "").replace("reject", "").toLowerCase();

        try {
          if (modal.type.includes("delete")) {
            // Handle delete untuk berbagai tipe
            if (modal.type === "deleteBusiness") {
              await handleDeleteBusiness(itemId);
              return;
            } else if (modal.type === "deleteCategory") {
              await api.delete(`/admin/categories/${itemId}`);
              toast.success('Kategori berhasil dihapus');
            } else if (modal.type === "deleteUser") {
              await api.delete(`/admin/users/${itemId}`);
              toast.success('User berhasil dihapus');
            } else if (modal.type === "deleteAd" || modal.type === "deleteAdvertisement") {
              await handleDeleteAd(itemId);
              return;
            } else if (modal.type === "deleteAdPackage") {
              await handleDeleteAdPackage(itemId);
              return;
            } else {
              // Generic delete
              await api.delete(`/admin/${itemType}s/${itemId}`);
              toast.success('Data berhasil dihapus');
            }
          } else if (modal.type.includes("reject")) {
            // Untuk reject, redirect ke reject modal yang sudah ada
            closeModal();
            handleOpenRejectModal(itemType, modal.data);
            return;
          }

          closeModal();
          fetchAllData();
        } catch (err) {
          console.error('Failed to process modal action:', err);
          alert(err.response?.data?.message || 'Gagal memproses aksi');
        }
      }
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

  // ── Navbar Category Handlers ──
  const handleSaveNavbarCategory = async () => {
    if (!navbarCategoryForm.name) {
      alert("Nama kategori informasi wajib diisi.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", navbarCategoryForm.name);
      if (navbarCategoryForm.slug) formData.append("slug", navbarCategoryForm.slug);
      if (navbarCategoryForm.icon) formData.append("icon", navbarCategoryForm.icon);
      if (navbarCategoryForm.parent_id) {
        formData.append("parent_id", navbarCategoryForm.parent_id);
      }
      formData.append("order", navbarCategoryForm.order || 0);
      formData.append("is_active", navbarCategoryForm.is_active ? "1" : "0");
      if (navbarCategoryForm.icon_file) {
        formData.append("icon_image", navbarCategoryForm.icon_file);
      }
      if (navbarCategoryForm.remove_icon) {
        formData.append("remove_icon", "1");
      }

      if (modal.type === "addNavbarCategory") {
        await api.post('/admin/navbar-categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Kategori informasi berhasil ditambahkan.');
      } else if (modal.type === "editNavbarCategory" && modal.data?.id) {
        formData.append('_method', 'PUT');
        await api.post(`/admin/navbar-categories/${modal.data.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Kategori informasi berhasil diperbarui.');
      }

      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menyimpan kategori informasi:", err);
      alert(err.response?.data?.message || 'Gagal menyimpan kategori informasi.');
    }
  };

  const handleDeleteNavbarCategory = async (categoryId) => {
    try {
      await api.delete(`/admin/navbar-categories/${categoryId}`);
      alert('Kategori informasi berhasil dihapus.');
      closeModal();
      fetchAllData();
    } catch (err) {
      console.error("Gagal menghapus kategori informasi:", err);
      alert(err.response?.data?.message || 'Gagal menghapus kategori informasi.');
    }
  };

  const handleToggleNavbarCategoryStatus = async (category) => {
    try {
      await api.put(`/admin/navbar-categories/${category.id}/toggle-status`);
      fetchAllData();
    } catch (err) {
      console.error("Gagal mengubah status kategori informasi:", err);
      alert(err.response?.data?.message || 'Gagal mengubah status kategori informasi.');
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
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
      closeModal();
      fetchAllData();
    } catch (err) {
      if (err.response?.status === 404) {
        setBlogs((prev) => prev.filter((b) => b.id !== blogId));
        closeModal();
        fetchAllData();
        alert("Konten berhasil dihapus dari daftar.");
        return;
      }
      console.error("Gagal menghapus blog/event:", err);
      alert(err.response?.data?.message || "Gagal menghapus konten.");
    }
  };

  const handleOpenBlogDetail = (blog) => {
    // Open instantly with zero delay if transaction data is already in memory
    const hasTx = !!(blog.latest_transaction || blog.latestTransaction || blog.payment_proof);
    setModal({
      show: true,
      type: "viewBlogDetail",
      data: blog,
      loadingDetail: !hasTx,
    });

    // Background silent refresh to guarantee freshest data without blocking UI
    api.get(`/blogs/${blog.id}`)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data) {
          setModal((prev) => {
            if (prev.type === "viewBlogDetail" && prev.data?.id === blog.id) {
              return {
                ...prev,
                data: {
                  ...blog,
                  ...data,
                  latest_transaction: data.latest_transaction || data.latestTransaction || blog.latest_transaction || blog.latestTransaction,
                  latestTransaction: data.latest_transaction || data.latestTransaction || blog.latest_transaction || blog.latestTransaction,
                },
                loadingDetail: false,
              };
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.error("Gagal background update detail blog:", err);
      })
      .finally(() => {
        setModal((prev) => ({ ...prev, loadingDetail: false }));
      });
  };

  const handleApproveBlog = async (blogId) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui dan mempublikasikan konten ini?")) return;

    try {
      await api.put(`/admin/blogs/${blogId}/approve`);
      toast.success("Konten berhasil disetujui dan dipublikasikan.");
      fetchAllData();
      if (modal?.show && modal?.type === "viewBlogDetail") {
        closeModal();
      }
    } catch (err) {
      console.error("Gagal menyetujui blog/event:", err);
      toast.error(err.response?.data?.message || "Gagal menyetujui konten.");
    }
  };

  const handleUnapproveBlog = async (blogId) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan persetujuan konten ini? Konten akan ditarik dari publikasi dan kembali berstatus Menunggu Verifikasi.")) return;

    try {
      await api.put(`/admin/blogs/${blogId}/unapprove`);
      toast.success("Persetujuan konten berhasil dibatalkan.");
      fetchAllData();
      if (modal?.show && modal?.type === "viewBlogDetail") {
        closeModal();
      }
    } catch (err) {
      console.error("Gagal membatalkan persetujuan blog/event:", err);
      toast.error(err.response?.data?.message || "Gagal membatalkan persetujuan konten.");
    }
  };

  const handleRejectBlog = async (blogId) => {
    if (!window.confirm("Apakah Anda yakin ingin menolak konten ini?")) return;

    try {
      await api.put(`/admin/blogs/${blogId}/reject`);
      toast.success("Konten berhasil ditolak.");
      fetchAllData();
    } catch (err) {
      console.error("Gagal menolak blog/event:", err);
      toast.error(err.response?.data?.message || "Gagal menolak konten.");
    }
  };

  // ── Settings Handlers ──
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const formData = new FormData();

      // Add text fields
      if (settingsForm.site_name) formData.append('site_name', settingsForm.site_name);
      if (settingsForm.contact_email) formData.append('contact_email', settingsForm.contact_email);
      if (settingsForm.contact_phone) formData.append('contact_phone', settingsForm.contact_phone);
      if (settingsForm.contact_address) formData.append('contact_address', settingsForm.contact_address);
      if (settingsForm.social_instagram) formData.append('social_instagram', settingsForm.social_instagram);
      if (settingsForm.social_facebook) formData.append('social_facebook', settingsForm.social_facebook);
      if (settingsForm.social_website) formData.append('social_website', settingsForm.social_website);
      if (settingsForm.seo_meta_title) formData.append('seo_meta_title', settingsForm.seo_meta_title);
      if (settingsForm.seo_meta_description) formData.append('seo_meta_description', settingsForm.seo_meta_description);

      // Add files if selected
      if (settingsForm.site_logo instanceof File) {
        formData.append('site_logo', settingsForm.site_logo);
      }
      if (settingsForm.site_banner instanceof File) {
        formData.append('site_banner', settingsForm.site_banner);
      }

      await api.post('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Pengaturan berhasil disimpan!');

      // Re-fetch settings
      const res = await api.get('/admin/settings');
      const settingsData = res.data || {};
      setSettings(settingsData);
      setAdminCache("settings", settingsData);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSavingSettings(false);
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

  // ── Referral Handlers ──
  const fetchReferralStats = async () => {
    try {
      const res = await api.get('/admin/referrals/stats');
      if (res.data?.data) {
        setReferralStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
    }
  };

  const fetchReferralCodes = async (page = 1) => {
    setLoadingReferralCodes(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: referralCodesSearch,
        status: referralCodesStatus,
      };
      const res = await api.get('/admin/referrals/codes', { params });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setReferralCodes(list);
      setReferralCodesPage(res.data?.current_page || page);
      setReferralCodesTotalPages(res.data?.last_page || 1);
      setReferralCodesTotalItems(res.data?.total || list.length);
    } catch (err) {
      console.error("Failed to fetch referral codes:", err);
    } finally {
      setLoadingReferralCodes(false);
    }
  };

  const fetchReferralTransactions = async (page = 1) => {
    setLoadingReferralTrx(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: referralTrxSearch,
        referral_status: referralTrxStatus,
        payment_status: referralTrxPaymentStatus,
      };
      const res = await api.get('/admin/referrals/transactions', { params });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setReferralTransactions(list);
      setReferralTrxPage(res.data?.current_page || page);
      setReferralTrxTotalPages(res.data?.last_page || 1);
      setReferralTrxTotalItems(res.data?.total || list.length);
    } catch (err) {
      console.error("Failed to fetch referral transactions:", err);
    } finally {
      setLoadingReferralTrx(false);
    }
  };

  const fetchReferralCommissions = async (page = 1) => {
    setLoadingReferralCom(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: referralComSearch,
        payout_status: referralComPayoutStatus,
      };
      const res = await api.get('/admin/referrals/commissions', { params });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setReferralCommissions(list);
      setReferralComPage(res.data?.current_page || page);
      setReferralComTotalPages(res.data?.last_page || 1);
      setReferralComTotalItems(res.data?.total || list.length);
    } catch (err) {
      console.error("Failed to fetch referral commissions:", err);
    } finally {
      setLoadingReferralCom(false);
    }
  };

  const fetchReferralWithdrawals = async (page = 1) => {
    setLoadingReferralWd(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: referralWdSearch,
        status: referralWdStatus,
      };
      const res = await api.get('/admin/referrals/withdrawals', { params });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setReferralWithdrawals(list);
      setReferralWdPage(res.data?.current_page || page);
      setReferralWdTotalPages(res.data?.last_page || 1);
      setReferralWdTotalItems(res.data?.total || list.length);
    } catch (err) {
      console.error("Failed to fetch referral withdrawals:", err);
    } finally {
      setLoadingReferralWd(false);
    }
  };

  const handleOpenApproveReferralWd = (w) => {
    setSelectedReferralWdItem(w);
    setReferralWdProofFile(null);
    setReferralWdProofPreview(null);
    const bankName = w.bank || w.bank_name || "Bank/E-Wallet";
    const accNumber = w.account_number || "-";
    const accName = w.account_holder || w.account_name || w.name || w.user?.name || "Pengguna";
    const amountStr = Number(w.amount || 0).toLocaleString("id-ID");
    setReferralWdApproveNotes(`Transfer komisi referral Rp ${amountStr} ke rekening ${bankName} (${accNumber}) a.n. ${accName} telah berhasil diproses.`);
    setReferralApproveModalOpen(true);
  };

  const handleConfirmApproveReferralWd = async (e) => {
    e.preventDefault();
    if (!selectedReferralWdItem) return;
    setSubmittingReferralWdApprove(true);
    try {
      const formData = new FormData();
      formData.append("notes", referralWdApproveNotes.trim());
      if (referralWdProofFile) {
        formData.append("transfer_proof", referralWdProofFile);
      }
      await api.post(`/admin/referrals/withdrawals/${selectedReferralWdItem.id}/paid`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Permohonan penarikan komisi referral berhasil disetujui & ditandai Lunas!");
      setReferralApproveModalOpen(false);
      setSelectedReferralWdItem(null);
      setReferralWdProofFile(null);
      setReferralWdProofPreview(null);
      fetchReferralWithdrawals(referralWdPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui penarikan.");
    } finally {
      setSubmittingReferralWdApprove(false);
    }
  };

  const handleApproveWithdrawal = async (w) => {
    handleOpenApproveReferralWd(w);
  };

  const handleRejectWithdrawal = async (e) => {
    e.preventDefault();
    if (!selectedWithdrawalItem) return;
    if (!rejectWithdrawalReason.trim()) {
      alert("Harap masukkan atau pilih alasan penolakan.");
      return;
    }
    try {
      await api.post(`/admin/referrals/withdrawals/${selectedWithdrawalItem.id}/reject`, {
        reason: rejectWithdrawalReason.trim(),
      });
      alert("Permohonan penarikan berhasil ditolak.");
      closeModal();
      fetchReferralWithdrawals(referralWdPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak penarikan.");
    }
  };

  const handleMarkWithdrawalPaid = async (w) => {
    handleOpenApproveReferralWd(w);
  };

  const fetchReferralSettings = async () => {
    setLoadingReferralSettings(true);
    try {
      const res = await api.get('/admin/referrals/settings');
      if (res.data?.data) {
        setReferralSettings(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch referral settings:", err);
    } finally {
      setLoadingReferralSettings(false);
    }
  };

  const handleEditReferralCode = (item) => {
    setSelectedReferralItem(item);
    setEditReferralCodeInput(item.referral_code || "");
    setModal({ show: true, type: "editReferralCode", data: item });
  };

  const handleSaveReferralCode = async (e) => {
    e.preventDefault();
    if (!selectedReferralItem) return;
    try {
      await api.put(`/admin/referrals/codes/${selectedReferralItem.id}`, {
        referral_code: editReferralCodeInput,
      });
      alert("Kode referral berhasil diperbarui!");
      closeModal();
      fetchReferralCodes(referralCodesPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui kode referral.");
    }
  };

  const handleToggleReferralStatus = async (item, newStatus) => {
    try {
      await api.patch(`/admin/referrals/codes/${item.id}/status`, { status: newStatus });
      alert(`Status kode referral ${item.referral_code} berhasil diubah menjadi ${newStatus}.`);
      fetchReferralCodes(referralCodesPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah status kode referral.");
    }
  };

  const handleGenerateReferralCode = async (item) => {
    if (!confirm(`Generate kode referral baru secara otomatis untuk user "${item.name}"?`)) return;
    try {
      const res = await api.post(`/admin/referrals/codes/${item.id}/generate`);
      alert(res.data?.message || "Kode referral baru berhasil di-generate!");
      fetchReferralCodes(referralCodesPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal meng-generate kode referral.");
    }
  };

  const handleApproveReferralTrx = async (trx) => {
    try {
      await api.post(`/admin/referrals/transactions/${trx.id}/approve`);
      alert("Transaksi referral berhasil disetujui!");
      closeModal();
      fetchReferralTransactions(referralTrxPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui transaksi referral.");
    }
  };

  const handleRejectReferralTrx = async (e) => {
    e.preventDefault();
    if (!selectedReferralItem) return;
    if (!referralReasonInput.trim()) {
      alert("Harap masukkan alasan penolakan transaksi.");
      return;
    }
    try {
      await api.post(`/admin/referrals/transactions/${selectedReferralItem.id}/reject`, {
        reason: referralReasonInput,
      });
      alert("Transaksi referral berhasil ditolak.");
      closeModal();
      fetchReferralTransactions(referralTrxPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak transaksi referral.");
    }
  };

  const handleApproveCommission = async (com) => {
    try {
      await api.post(`/admin/referrals/commissions/${com.id}/approve`);
      alert("Komisi referral berhasil disetujui!");
      closeModal();
      fetchReferralCommissions(referralComPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui komisi referral.");
    }
  };

  const handleRejectCommission = async (e) => {
    e.preventDefault();
    if (!selectedReferralItem) return;
    if (!referralReasonInput.trim()) {
      alert("Harap masukkan alasan penolakan komisi.");
      return;
    }
    try {
      await api.post(`/admin/referrals/commissions/${selectedReferralItem.id}/reject`, {
        reason: referralReasonInput,
      });
      alert("Komisi referral berhasil ditolak.");
      closeModal();
      fetchReferralCommissions(referralComPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak komisi referral.");
    }
  };

  const handleMarkCommissionPaid = async (com) => {
    try {
      await api.post(`/admin/referrals/commissions/${com.id}/paid`);
      alert("Komisi referral berhasil ditandai sebagai Lunas (Paid)!");
      closeModal();
      fetchReferralCommissions(referralComPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menandai komisi lunas.");
    }
  };

  const handleAdjustCommission = async (e) => {
    e.preventDefault();
    if (!selectedReferralItem) return;
    if (referralAdjustAmountInput === "" || Number(referralAdjustAmountInput) < 0) {
      alert("Nominal komisi penyesuaian tidak valid.");
      return;
    }
    if (!referralAdjustReasonInput.trim()) {
      alert("Harap masukkan alasan penyesuaian nominal komisi.");
      return;
    }
    try {
      await api.post(`/admin/referrals/commissions/${selectedReferralItem.id}/adjust`, {
        adjusted_amount: Number(referralAdjustAmountInput),
        reason: referralAdjustReasonInput,
      });
      alert("Nominal komisi berhasil disesuaikan!");
      closeModal();
      fetchReferralCommissions(referralComPage);
      fetchReferralStats();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyesuaikan nominal komisi.");
    }
  };

  const handleSaveReferralSettings = async (e) => {
    e.preventDefault();
    setSavingReferralSettings(true);
    try {
      await api.put('/admin/referrals/settings', referralSettings);
      alert("Pengaturan sistem referral berhasil disimpan!");
      fetchReferralSettings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan pengaturan referral.");
    } finally {
      setSavingReferralSettings(false);
    }
  };

  // ── Helper Pagination Komponen Cerdas (Maksimal 5 Halaman Ditampilkan) ──
  const renderAdminPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-[6px]">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, typeof p === "function" ? p(currentPage) : currentPage - 1))}
          disabled={currentPage === 1}
          className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Prev
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-slate-400 font-bold text-xs select-none">...</span>}
          </>
        )}

        {pages.map((pg) => (
          <button
            key={pg}
            type="button"
            onClick={() => setPage(pg)}
            className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${currentPage === pg
                ? "bg-[#007570] text-white border-[#007570]"
                : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
              }`}
          >
            {pg}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-slate-400 font-bold text-xs select-none">...</span>}
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className="min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, typeof p === "function" ? p(currentPage) : currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  // ── Render functions for each section ──
  const renderDashboard = () => {
    const safeActivities = Array.isArray(recentActivities) ? recentActivities : [];
    const sortedActivities = [...safeActivities].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    );
    const totalActivityPages = Math.ceil(sortedActivities.length / activitiesPerPage) || 1;
    const currentActivityPage = Math.min(Math.max(1, activityPage), totalActivityPages);
    const startIndex = (currentActivityPage - 1) * activitiesPerPage;
    const displayedActivities = sortedActivities.slice(startIndex, startIndex + activitiesPerPage);

    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const activeDashboardBlogs = safeBlogs.filter((b) => {
      const st = (b?.status || "").toLowerCase();
      return st !== "draft" && st !== "waiting_payment";
    });
    const totalBlogsCount = activeDashboardBlogs.filter((b) => b?.type !== "event").length;
    const totalEventsCount = activeDashboardBlogs.filter((b) => b?.type === "event").length;
    const totalContentCount = activeDashboardBlogs.length || (stats?.totalBlogPackages || 0) + (stats?.totalEventPackages || 0) || 0;
    const totalCombinedRevenue = Number(stats?.monthlyRevenue || 0) + Number(stats?.totalContentRevenue || 0);

    const safeBusinesses = Array.isArray(businesses) ? businesses : [];
    const safePayments = Array.isArray(payments) ? payments : [];
    const safeProducts = Array.isArray(products) ? products : [];
    const safeWaLogs = Array.isArray(waLogs) ? waLogs : [];

    return (
      <div className="mb-[28px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] mb-[18px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
          Dashboard Overview
        </h2>

        {/* ════ 3D STATS CARDS ROW ════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
          {/* Card 1: Total User */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-teal-500/40 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">Total User</span>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-[#007570] flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
                <Users size={18} />
              </span>
            </div>
            <div>
              <span className="text-[24px] font-black text-slate-900 block leading-tight">
                {stats.totalUsers || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp size={12} strokeWidth={2.5} /> +12% aktif
              </span>
            </div>
          </div>

          {/* Card 2: Total Bisnis */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-sky-500/40 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">Total Bisnis</span>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 text-[#0ea5e9] flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
                <Building2 size={18} />
              </span>
            </div>
            <div>
              <span className="text-[24px] font-black text-slate-900 block leading-tight">
                {stats.totalBusinesses || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp size={12} strokeWidth={2.5} /> +8% terdaftar
              </span>
            </div>
          </div>

          {/* Card 3: Total Blog & Event */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-indigo-500/40 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">Blog &amp; Event</span>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-[#6366f1] flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
                <FileText size={18} />
              </span>
            </div>
            <div>
              <span className="text-[24px] font-black text-slate-900 block leading-tight">
                {totalContentCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-1 whitespace-normal leading-snug">
                {totalBlogsCount} Blog · {totalEventsCount} Event
              </span>
            </div>
          </div>

          {/* Card 4: Bisnis Premium */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-pink-500/40 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">Bisnis Premium</span>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 text-[#ec4899] flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
                <Crown size={18} />
              </span>
            </div>
            <div>
              <span className="text-[24px] font-black text-slate-900 block leading-tight">
                {stats.totalPremium || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp size={12} strokeWidth={2.5} /> +20% upgrade
              </span>
            </div>
          </div>

          {/* Card 5: Total Pendapatan */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-emerald-500/40 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between cursor-pointer group max-sm:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em]">Total Pendapatan</span>
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-[#10b981] flex items-center justify-center shadow-md border border-white group-hover:scale-110 transition-transform">
                <DollarSign size={18} />
              </span>
            </div>
            <div>
              <span className="text-[18px] sm:text-[22px] font-black text-[#007570] block leading-tight break-words" title={`Rp ${Number(totalCombinedRevenue).toLocaleString("id-ID")}`}>
                Rp {Number(totalCombinedRevenue).toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-1 whitespace-normal leading-snug">
                Total omset semua layanan
              </span>
            </div>
          </div>
        </div>

        {/* ── KARTU VERIFIKASI (3D ACTION CARDS WIDGET) ── */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3 pl-3 relative flex items-center gap-2 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-amber-500 before:rounded-full">
            Kartu Verifikasi Membutuhkan Tindakan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card Verifikasi 1: Bisnis Baru */}
            <div
              onClick={() => {
                setActiveTab("businesses");
                setBusinessStatusFilter("pending");
              }}
              className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-200/90 border-b-4 border-b-amber-500/50 shadow-[0_8px_20px_rgba(245,158,11,0.12)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Verifikasi Usaha Baru</span>
                <span className="text-[20px] font-black text-amber-950 block leading-snug">
                  {stats?.pendingBusinesses ?? safeBusinesses.filter(b => b?.status === "pending" || b?.status === "waiting_verification" || b?.status === "menunggu").length} Usaha Pending
                </span>
                <span className="text-[11px] text-amber-700 font-bold block mt-1 group-hover:underline">Klik untuk verifikasi data &amp; lokasi &rarr;</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 shrink-0 border border-amber-300 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldCheck size={26} />
              </div>
            </div>

            {/* Card Verifikasi 2: Pembayaran Paket & Akses WA */}
            <div
              onClick={() => {
                setActiveTab("whatsapp");
                setWaLogStatusFilter("pending");
              }}
              className="bg-gradient-to-r from-blue-50 via-indigo-100/60 to-sky-50 border border-blue-200/90 border-b-4 border-b-blue-500/50 shadow-[0_8px_20px_rgba(59,130,246,0.12)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">Verifikasi Pembayaran</span>
                <span className="text-[20px] font-black text-blue-950 block leading-snug">
                  {(stats?.pendingPayments ?? safePayments.filter(p => p?.status === "pending" || p?.status === "menunggu").length) + safeWaLogs.filter(w => w?.status === "pending" || w?.status === "menunggu").length} Pembayaran Pending
                </span>
                <span className="text-[11px] text-blue-700 font-bold block mt-1 group-hover:underline">Klik untuk verifikasi bukti transfer &rarr;</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-600 shrink-0 border border-blue-300 shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard size={26} />
              </div>
            </div>

            {/* Card Verifikasi 3: Produk */}
            <div
              onClick={() => {
                setActiveTab("products");
                setProductStatusFilter("pending");
              }}
              className="bg-gradient-to-r from-purple-50 via-pink-100/60 to-rose-50 border border-purple-200/90 border-b-4 border-b-purple-500/50 shadow-[0_8px_20px_rgba(168,85,247,0.12)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">Verifikasi Produk</span>
                <span className="text-[20px] font-black text-purple-950 block leading-snug">
                  {stats?.pendingProducts ?? safeProducts.filter(p => p?.status === "pending" || p?.status === "menunggu").length} Produk Pending
                </span>
                <span className="text-[11px] text-purple-700 font-bold block mt-1 group-hover:underline">Klik untuk verifikasi produk &rarr;</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 shrink-0 border border-purple-300 shadow-sm group-hover:scale-110 transition-transform">
                <Package size={26} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Chart 1: User Growth */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] border border-slate-200/90 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 pl-3 relative flex items-center gap-2 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-[#007570] before:rounded-full">
                Grafik Pendaftaran User
              </h3>
              <select
                value={selectedChartYear}
                onChange={(e) => handleChartYearChange(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer outline-none hover:border-[#007570] shadow-xs"
              >
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
                <option value="all">Semua Tahun</option>
              </select>
            </div>
            <MiniBarChart
              data={stats.userGrowth && stats.userGrowth.length === 12 ? stats.userGrowth : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
              color="#007570"
              height={145}
              unit="User"
              yearLabel={selectedChartYear === "all" ? "Semua Tahun" : selectedChartYear}
              labels={['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']}
            />
          </div>

          {/* Chart 2: Business Growth */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] border border-slate-200/90 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 pl-3 relative flex items-center gap-2 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-[#0ea5e9] before:rounded-full">
                Grafik Bisnis Baru
              </h3>
              <select
                value={selectedChartYear}
                onChange={(e) => handleChartYearChange(e.target.value)}
                className="px-[10px] py-[4px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-[12px] font-bold text-[#0f172a] cursor-pointer outline-none hover:border-[#0ea5e9]"
              >
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
                <option value="all">Semua Tahun</option>
              </select>
            </div>
            <MiniBarChart
              data={stats.businessGrowth && stats.businessGrowth.length === 12 ? stats.businessGrowth : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
              color="#0ea5e9"
              height={145}
              unit="Bisnis"
              yearLabel={selectedChartYear === "all" ? "Semua Tahun" : selectedChartYear}
              labels={['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']}
            />
          </div>
        </div>

        {/* Recent Activity Section with Pagination */}
        <div className="bg-white rounded-[14px] p-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <div className="flex items-center justify-between mb-[16px] flex-wrap gap-[8px]">
            <h3 className="text-[15px] font-bold text-[#0f172a] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">
              Aktivitas Terbaru
            </h3>
            <span className="text-[12px] font-bold text-[#007570] bg-teal-50 px-[10px] py-[3px] rounded-full border border-teal-200">
              Total: {sortedActivities.length} Aktivitas
            </span>
          </div>

          <div className="flex flex-col gap-[8px]">
            {displayedActivities.length === 0 ? (
              <p className="text-[13px] text-[#64748b] p-[24px] text-center font-medium">
                Belum ada aktivitas terbaru.
              </p>
            ) : (
              displayedActivities.map((act, index) => (
                <div
                  key={act.id || index}
                  className="flex items-center gap-[12px] px-[14px] py-[11px] rounded-[10px] transition-all duration-200 border border-slate-100 hover:bg-[#f0fdfa] hover:border-[rgba(0,117,112,0.2)]"
                >
                  <div
                    className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0 ${act.type?.includes("approved") || act.type?.includes("success")
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : act.type?.includes("rejected") || act.type?.includes("suspended")
                          ? "bg-[#fee2e2] text-[#dc2626]"
                          : act.type?.includes("user")
                            ? "bg-[#dbeafe] text-[#1d4ed8]"
                            : "bg-[#fef3c7] text-[#d97706]"
                      }`}
                  >
                    {act.type?.includes("approved") || act.type?.includes("success") ? (
                      <Check size={18} strokeWidth={2.2} />
                    ) : act.type?.includes("rejected") || act.type?.includes("suspended") ? (
                      <X size={18} strokeWidth={2.2} />
                    ) : act.type?.includes("user") ? (
                      <User size={18} strokeWidth={2.2} />
                    ) : (
                      <Clock size={18} strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#0f172a] font-semibold block truncate">
                      {act.description || act.title}
                    </span>
                    <span className="text-[11px] text-[#94a3b8] font-medium mt-[1px] block">
                      {act.created_at
                        ? new Date(act.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                        : "-"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Activity Pagination Controls */}
          {sortedActivities.length > activitiesPerPage && (
            <div className="flex items-center justify-between pt-[16px] mt-[16px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px]">
              <span className="text-[#64748b] font-medium">
                Menampilkan {startIndex + 1} - {Math.min(startIndex + activitiesPerPage, sortedActivities.length)} dari {sortedActivities.length} aktivitas
              </span>
              {renderAdminPagination(currentActivityPage, totalActivityPages, setActivityPage)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render Referral Withdrawals Table (Used in Kelola User & Kelola Referral) ──
  const renderWithdrawalsTable = () => {
    return (
      <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Filter & Search */}
        <div className="p-[16px] border-b border-[#e2e8f0] flex flex-wrap gap-[10px] items-center justify-between bg-[#fafbfc]">
          <div className="flex items-center gap-[10px] flex-1 min-w-[240px] max-md:w-full">
            <div className="flex items-center gap-[8px] flex-1 bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[8px]">
              <Search size={16} className="text-[#64748b] shrink-0" />
              <input
                type="text"
                placeholder="Cari nama pemohon, email, bank, nomor rekening..."
                value={referralWdSearch}
                onChange={(e) => setReferralWdSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchReferralWithdrawals(1); }}
                className="flex-1 border-0 outline-none text-[13px] text-[#0f172a]"
              />
              {referralWdSearch && (
                <button onClick={() => { setReferralWdSearch(""); fetchReferralWithdrawals(1); }} className="text-[#94a3b8] hover:text-[#0f172a] border-0 bg-transparent cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => fetchReferralWithdrawals(1)}
              className="px-[14px] py-[8px] rounded-[8px] bg-[#007570] text-white text-[13px] font-semibold cursor-pointer border-0 hover:bg-[#005a58]"
            >
              Cari
            </button>
          </div>

          <div className="flex items-center gap-[10px] max-md:w-full">
            <select
              value={referralWdStatus}
              onChange={(e) => {
                setReferralWdStatus(e.target.value);
                setTimeout(() => fetchReferralWithdrawals(1), 50);
              }}
              className="px-[12px] py-[8px] bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] cursor-pointer outline-none focus:border-[#007570]"
            >
              <option value="">Semua Status Penarikan</option>
              <option value="pending">Menunggu Verifikasi (Pending)</option>
              <option value="approved">Disetujui (Siap Kirim)</option>
              <option value="paid">Lunas (Dana Ditransfer)</option>
              <option value="rejected">Ditolak (Rejected)</option>
            </select>
            <button
              onClick={() => fetchReferralWithdrawals(referralWdPage)}
              className="p-[8px] rounded-[8px] bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#64748b] text-[11px] uppercase tracking-wider border-b border-[#e2e8f0]">
                <th className="p-[12px_14px] font-bold">ID &amp; Waktu</th>
                <th className="p-[12px_14px] font-bold">Pemohon Penarikan</th>
                <th className="p-[12px_14px] font-bold">Rekening / E-Wallet Tujuan</th>
                <th className="p-[12px_14px] font-bold text-right">Nominal Saldo</th>
                <th className="p-[12px_14px] font-bold text-center">Status</th>
                <th className="p-[12px_14px] font-bold text-center">Aksi / Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {loadingReferralWd ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    <SuradeLoader variant="section" size="sm" text="Memuat daftar permohonan penarikan saldo" minHeight="160px" />
                  </td>
                </tr>
              ) : referralWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-[36px] text-center text-[#64748b]">
                    <Wallet size={36} className="mx-auto mb-[8px] text-[#cbd5e1]" />
                    <p className="font-semibold text-[#0f172a]">Belum ada permohonan penarikan saldo</p>
                    <p className="text-[12px] text-[#64748b] mt-[2px]">
                      Ketika pengguna mengajukan penarikan tunai saldo referral mereka, data permohonan akan masuk ke tabel ini untuk diverifikasi admin.
                    </p>
                  </td>
                </tr>
              ) : (
                referralWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="p-[12px_14px]">
                      <span className="font-mono text-[11.5px] font-bold text-[#007570] block">
                        {w.code || ('#WD-' + w.id)}
                      </span>
                      <span className="text-[10.5px] text-[#64748b] block mt-[1px]">{w.date || w.created_at}</span>
                    </td>
                    <td className="p-[12px_14px]">
                      <div className="font-bold text-[#0f172a]">{w.user?.name || w.name || "Pengguna"}</div>
                      <div className="text-[11px] text-[#64748b]">{w.user?.email || w.email || "-"}</div>
                      <div className="text-[10.5px] text-[#475569] mt-[1px]">
                        Ref: <span className="font-mono font-semibold text-[#007570]">{w.user?.referral_code || w.referral_code || "-"}</span>
                      </div>
                    </td>
                    <td className="p-[12px_14px]">
                      {w.bank === "QRIS" || w.qris_image ? (
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10.5px] font-extrabold border border-purple-200">
                            <QrCode size={12} className="text-purple-600" />
                            <span>QRIS (Scan &amp; Bayar)</span>
                          </div>
                          <div className="text-[12px] font-bold text-slate-900 mt-1">
                            {w.account_holder || w.account_name}
                          </div>
                          {w.qris_image ? (
                            <button
                              type="button"
                              onClick={() => setPreviewReferralProofUrl(w.qris_image)}
                              className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10.5px] font-bold cursor-pointer transition-all shadow-xs"
                              title="Klik untuk memindai dan melihat QRIS pemohon"
                            >
                              <QrCode size={12} />
                              <span>Scan / Lihat QRIS</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-600 italic block mt-0.5">QRIS (Tanpa Foto)</span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-[#0f172a] flex items-center gap-1.5">
                            <CreditCard size={14} className="text-[#007570]" />
                            <span>{w.bank || w.bank_name}</span>
                          </div>
                          <div className="font-mono text-[12px] font-semibold text-slate-800 mt-0.5">
                            {w.account_number}
                          </div>
                          <div className="text-[11px] text-[#64748b]">
                            an <strong>{w.account_holder || w.account_name}</strong>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-[12px_14px] text-right">
                      <div className="font-black text-slate-900 text-[14px]">
                        Rp {Math.round(w.amount || 0).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="p-[12px_14px] text-center">
                      <div className="flex flex-col items-center gap-[3px]">
                        <span
                          className={`inline-flex items-center px-[8px] py-[2px] rounded-full text-[10.5px] font-bold ${w.status === "paid"
                              ? "bg-[#dcfce7] text-[#16a34a] border border-emerald-200"
                              : w.status === "approved"
                                ? "bg-[#dbeafe] text-[#1d4ed8] border border-blue-200"
                                : w.status === "rejected"
                                  ? "bg-[#fee2e2] text-[#dc2626] border border-rose-200"
                                  : "bg-[#fef3c7] text-[#d97706] border border-amber-200"
                            }`}
                        >
                          {w.status === "paid"
                            ? "Lunas (Ditransfer)"
                            : w.status === "approved"
                              ? "Disetujui"
                              : w.status === "rejected"
                                ? "Ditolak"
                                : "Menunggu Approval"}
                        </span>
                        {w.status === "rejected" && (w.rejection_reason || w.admin_note) && (
                          <span
                            className="text-[10px] text-rose-600 max-w-[150px] truncate cursor-help block mt-0.5"
                            title={`Alasan Penolakan: ${w.rejection_reason || w.admin_note}`}
                          >
                            ⚠️ {w.rejection_reason || w.admin_note}
                          </span>
                        )}
                        {w.status === "paid" && w.processed_at && (
                          <span className="text-[10px] text-[#64748b]">Cair: {w.processed_at}</span>
                        )}
                        {w.transfer_proof && (
                          <button
                            type="button"
                            onClick={() => setPreviewReferralProofUrl(w.transfer_proof)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-bold cursor-pointer transition-all mt-1"
                            title="Lihat Bukti Transfer Admin"
                          >
                            <Eye size={11} />
                            <span>Lihat Bukti Transfer</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-[12px_14px] text-center">
                      <div className="flex items-center justify-center gap-[5px]">
                        {w.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleOpenApproveReferralWd(w)}
                              className="p-[6px_10px] rounded-[6px] bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0] text-[11px] font-bold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Setujui Penarikan & Upload Bukti Transfer"
                            >
                              <Check size={13} />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawalItem(w);
                                setRejectWithdrawalReason("");
                                setModal({ show: true, type: "rejectReferralWithdrawal", data: w });
                              }}
                              className="p-[6px_10px] rounded-[6px] bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] text-[11px] font-bold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Tolak Penarikan Saldo"
                            >
                              <X size={13} />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <>
                            <button
                              onClick={() => handleOpenApproveReferralWd(w)}
                              className="p-[6px_10px] rounded-[6px] bg-[#007570] text-white hover:bg-[#005a58] text-[11px] font-bold flex items-center gap-[3px] border-0 cursor-pointer transition-all shadow-sm"
                              title="Tandai Sudah Ditransfer ke Rekening User & Upload Bukti"
                            >
                              <DollarSign size={13} />
                              <span>Tandai Lunas</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawalItem(w);
                                setRejectWithdrawalReason("");
                                setModal({ show: true, type: "rejectReferralWithdrawal", data: w });
                              }}
                              className="p-[6px_10px] rounded-[6px] bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] text-[11px] font-bold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Tolak Penarikan"
                            >
                              <X size={13} />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}
                        {w.status === "paid" && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 justify-center">
                              <CheckCircle2 size={14} /> Selesai
                            </span>
                            {w.transfer_proof && (
                              <button
                                type="button"
                                onClick={() => setPreviewReferralProofUrl(w.transfer_proof)}
                                className="p-[4px_8px] rounded-md bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                title="Lihat Bukti Transfer"
                              >
                                <Eye size={11} />
                                <span>Bukti</span>
                              </button>
                            )}
                          </div>
                        )}
                        {w.status === "rejected" && (
                          <button
                            onClick={() => {
                              setSelectedWithdrawalItem(w);
                              alert(`Alasan Penolakan:\n"${w.rejection_reason || w.admin_note || 'Tidak ada alasan khusus.'}"`);
                            }}
                            className="p-[5px_8px] rounded-[6px] bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold border-0 cursor-pointer"
                            title="Lihat Alasan Penolakan"
                          >
                            <Eye size={12} />
                            <span>Alasan</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {referralWdTotalPages > 1 && (
          <div className="p-[12px_16px] border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-[#64748b] flex-wrap gap-[10px] bg-[#fafafa]">
            <div>
              Menampilkan halaman <strong>{referralWdPage}</strong> dari <strong>{referralWdTotalPages}</strong> (Total {referralWdTotalItems} pengajuan penarikan)
            </div>
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                disabled={referralWdPage <= 1}
                onClick={() => fetchReferralWithdrawals(referralWdPage - 1)}
                className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: referralWdTotalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => fetchReferralWithdrawals(pg)}
                  className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${referralWdPage === pg
                      ? "bg-[#007570] text-white border-[#007570]"
                      : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                    }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                disabled={referralWdPage >= referralWdTotalPages}
                onClick={() => fetchReferralWithdrawals(referralWdPage + 1)}
                className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ── MODAL APPROVE & UPLOAD BUKTI TRANSFER PENARIKAN REFERRAL ── */}
        {referralApproveModalOpen && selectedReferralWdItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl border border-emerald-200 space-y-4 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={22} />
                  <h4 className="font-extrabold text-slate-900 text-sm">Konfirmasi Transfer Komisi Referral</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setReferralApproveModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Penerima Komisi:</span>
                  <span className="font-bold text-slate-900">{selectedReferralWdItem.name || selectedReferralWdItem.user?.name || "Pengguna"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Nominal Komisi:</span>
                  <span className="font-black text-emerald-700 text-sm">
                    Rp {Number(selectedReferralWdItem.amount || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                {selectedReferralWdItem.bank === "QRIS" || selectedReferralWdItem.qris_image ? (
                  <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 block text-[11px] font-semibold">Metode Pencairan:</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold flex items-center gap-1 border border-purple-200">
                        <QrCode size={11} className="text-purple-600" />
                        QRIS SCAN
                      </span>
                    </div>
                    <div className="text-slate-700 font-semibold text-xs">
                      Nama Merchant / Pemilik: <strong className="text-slate-900">{selectedReferralWdItem.account_holder || selectedReferralWdItem.account_name}</strong>
                    </div>

                    {selectedReferralWdItem.qris_image ? (
                      <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 text-center space-y-2">
                        <div className="text-[11px] font-bold text-purple-900 flex items-center justify-center gap-1.5">
                          <QrCode size={14} className="text-purple-700" />
                          <span>Pindai QRIS ini lewat M-Banking / E-Wallet Anda:</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-purple-200 inline-block shadow-sm">
                          <img
                            src={selectedReferralWdItem.qris_image}
                            alt="QRIS Pemohon"
                            className="max-h-48 w-auto object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setPreviewReferralProofUrl(selectedReferralWdItem.qris_image)}
                            title="Klik untuk memperbesar QRIS"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewReferralProofUrl(selectedReferralWdItem.qris_image)}
                            className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                          >
                            Perbesar Gambar QRIS
                          </button>
                          <span className="text-slate-300">•</span>
                          <a
                            href={selectedReferralWdItem.qris_image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline"
                          >
                            Buka di Tab Baru
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 italic">Pengguna tidak melampirkan berkas gambar QRIS.</p>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="text-slate-500 block text-[11px]">Rekening / E-Wallet Tujuan:</span>
                    <div className="font-bold text-slate-900">
                      {selectedReferralWdItem.bank || selectedReferralWdItem.bank_name} - {selectedReferralWdItem.account_number}
                    </div>
                    <div className="text-slate-700 font-semibold">
                      a.n. {selectedReferralWdItem.account_holder || selectedReferralWdItem.account_name}
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfirmApproveReferralWd} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catatan / Keterangan Transfer Admin</label>
                  <textarea
                    rows={2}
                    required
                    value={referralWdApproveNotes}
                    onChange={(e) => setReferralWdApproveNotes(e.target.value)}
                    placeholder="Masukkan nomor referensi transfer bank atau catatan verifikasi..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Upload Foto Bukti Transfer (Screenshot Struk / Bukti Kirim Bank / E-Wallet)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center hover:border-emerald-500 transition-colors bg-slate-50/50">
                    {referralWdProofPreview ? (
                      <div className="relative group max-w-[200px] mx-auto">
                        <img
                          src={referralWdProofPreview}
                          alt="Preview Bukti"
                          className="w-full max-h-36 object-contain rounded-xl border border-slate-200 shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setReferralWdProofFile(null);
                            setReferralWdProofPreview(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                          title="Hapus foto"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-2">
                        <Upload size={22} className="mx-auto text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-emerald-700 block">Pilih Gambar Bukti Transfer</span>
                        <span className="text-[10.5px] text-slate-400 block mt-0.5">JPG, PNG, WEBP (Maks 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReferralWdProofFile(file);
                              setReferralWdProofPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReferralApproveModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReferralWdApprove}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReferralWdApprove ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    <span>Tandai Selesai Ditransfer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL PREVIEW BUKTI TRANSFER REFERRAL (FULLSCREEN POPUP) ── */}
        {previewReferralProofUrl && (
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
            onClick={() => setPreviewReferralProofUrl(null)}
          >
            <div
              className="bg-white rounded-3xl p-5 max-w-2xl w-full shadow-2xl relative border border-slate-200 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {previewReferralProofUrl?.includes("qris") ? "Foto / Barcode QRIS Pemohon Penarikan" : "Foto Bukti Transfer Pencairan Komisi"}
                    </h4>
                    <p className="text-[10.5px] text-slate-400">
                      {previewReferralProofUrl?.includes("qris") ? "Scan QRIS ini langsung menggunakan kamera aplikasi M-Banking / E-Wallet Anda" : "Bukti resmi transfer dana komisi ke rekening / e-wallet pengguna"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReferralProofUrl(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[68vh] overflow-auto flex items-center justify-center bg-slate-900/5 rounded-2xl p-2 min-h-[260px] border border-slate-200">
                <img
                  src={previewReferralProofUrl}
                  alt="Bukti Transfer Komisi Referral"
                  className="max-h-[62vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/600x400/007570/ffffff?text=Bukti+Transfer+Tersimpan";
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Klik di luar popup untuk menutup</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewReferralProofUrl(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Tutup
                  </button>
                  <a
                    href={previewReferralProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Buka Tab Baru ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = users.filter((u) => {
      const matchSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = !userRoleFilter || u.role === userRoleFilter;
      const matchStatus = !userStatusFilter || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });

    const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
    const currentUserPage = Math.min(Math.max(1, userPage), totalUserPages);
    const startIndex = (currentUserPage - 1) * usersPerPage;
    const displayedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

    const pendingWithdrawalCount = referralWithdrawals.filter((w) => w.status === "pending").length;

    return (
      <div className="mb-[28px]">
        <div className="flex items-center justify-between mb-[16px] flex-wrap gap-3">
          <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
            Kelola User &amp; Penarikan Komisi Referral
          </h2>
          {userViewSubTab === "users" && (
            <button
              className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]"
              onClick={() => handleModal("addUser")}
            >
              <Plus size={18} strokeWidth={2} />
              <span>Tambah User</span>
            </button>
          )}
        </div>

        {/* Sub-tab Switch: Daftar User vs Permohonan Penarikan Komisi */}
        <div className="flex items-center gap-[8px] mb-[18px] p-[5px] bg-slate-100 rounded-[12px] w-fit border border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setUserViewSubTab("users")}
            className={`px-[16px] py-[8px] rounded-[9px] text-[12.5px] font-bold transition-all border-0 cursor-pointer flex items-center gap-[7px] ${userViewSubTab === "users"
                ? "bg-white text-[#007570] shadow-sm font-extrabold"
                : "bg-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <Users size={15} />
            <span>Daftar User</span>
            <span className="px-[6px] py-[1px] rounded-full text-[10.5px] bg-slate-200 text-slate-700 font-bold">
              {filteredUsers.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserViewSubTab("withdrawals");
              fetchReferralWithdrawals(1);
            }}
            className={`px-[16px] py-[8px] rounded-[9px] text-[12.5px] font-bold transition-all border-0 cursor-pointer flex items-center gap-[7px] ${userViewSubTab === "withdrawals"
                ? "bg-[#007570] text-white shadow-sm font-extrabold"
                : "bg-transparent text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <Wallet size={15} />
            <span>Permohonan Penarikan Komisi</span>
            {pendingWithdrawalCount > 0 ? (
              <span className="px-[7px] py-[1.5px] rounded-full text-[10.5px] font-extrabold bg-amber-400 text-amber-950 animate-pulse">
                {pendingWithdrawalCount} Menunggu
              </span>
            ) : null}
          </button>
        </div>

        {userViewSubTab === "withdrawals" ? (
          renderWithdrawalsTable()
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-[10px] mb-[16px]">
              <div className="flex-1 min-w-[200px] flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[9px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
                <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama atau email user..."
                  className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
              >
                <option value="">Semua Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => {
                  setUserStatusFilter(e.target.value);
                  setUserPage(1);
                }}
                className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>

            <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden">
              <div className="overflow-x-auto">
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
                    {displayedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-[36px]">
                          <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                            <User size={48} strokeWidth={1} className="opacity-40" />
                            <p className="text-[14px] text-[#64748b] font-medium">Belum ada data user yang sesuai.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((user) => {
                        const presence = getUserPresence(user);
                        return (
                          <tr key={user.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                            <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div
                                className="flex items-center gap-[10px] cursor-pointer group"
                                onClick={() => {
                                  const userBizList = (Array.isArray(user.businesses) && user.businesses.length > 0)
                                    ? user.businesses
                                    : businesses.filter((b) => b.user_id === user.id || b.user?.id === user.id);
                                  const count = user.businesses_count !== undefined && user.businesses_count !== null
                                    ? Math.max(Number(user.businesses_count), userBizList.length)
                                    : userBizList.length;
                                  handleModal("viewUserDetail", { ...user, businessesList: userBizList, businessesCount: count });
                                }}
                              >
                                <div className="relative shrink-0">
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-[34px] h-[34px] rounded-[9px] object-cover border border-[#e2e8f0]"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`;
                                    }}
                                  />
                                  <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${presence.isOnline ? "bg-emerald-500" : "bg-slate-300"
                                      }`}
                                    title={presence.isOnline ? "Sedang Online" : "Sedang Offline"}
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="group-hover:text-[#007570] group-hover:underline font-semibold leading-tight">{user.name}</span>
                                  <span className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${presence.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                    <span className={`text-[10.5px] font-semibold leading-none ${presence.isOnline ? "text-emerald-700" : "text-slate-400"}`}>
                                      {presence.label}
                                    </span>
                                  </span>
                                </div>
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
                            <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              {(() => {
                                const userBizList = (Array.isArray(user.businesses) && user.businesses.length > 0)
                                  ? user.businesses
                                  : businesses.filter((b) => b.user_id === user.id || b.user?.id === user.id);
                                const count = user.businesses_count !== undefined && user.businesses_count !== null
                                  ? Math.max(Number(user.businesses_count), userBizList.length)
                                  : userBizList.length;

                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleModal("viewUserDetail", { ...user, businessesList: userBizList, businessesCount: count })}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold transition-all duration-150 cursor-pointer border ${count > 0
                                        ? "bg-teal-50 text-[#007570] border-teal-200 hover:bg-teal-100 hover:border-[#007570]"
                                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                      }`}
                                    title={count > 0 ? "Klik untuk melihat detail bisnis user ini" : "User belum memiliki bisnis"}
                                  >
                                    <Store size={13} className={count > 0 ? "text-[#007570]" : "text-slate-400"} />
                                    <span>{count}</span>
                                  </button>
                                );
                              })()}
                            </td>
                            <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">{user.joined}</td>
                            <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div className="flex items-center gap-[5px]">
                                <button
                                  className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]"
                                  onClick={() => {
                                    const userBizList = (Array.isArray(user.businesses) && user.businesses.length > 0)
                                      ? user.businesses
                                      : businesses.filter((b) => b.user_id === user.id || b.user?.id === user.id);
                                    const count = user.businesses_count !== undefined && user.businesses_count !== null
                                      ? Math.max(Number(user.businesses_count), userBizList.length)
                                      : userBizList.length;
                                    handleModal("viewUserDetail", { ...user, businessesList: userBizList, businessesCount: count });
                                  }}
                                  title="Lihat Detail"
                                >
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Pagination Controls */}
              {filteredUsers.length > usersPerPage && (
                <div className="flex items-center justify-between p-[14px_18px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px] bg-[#fafafa]">
                  <span className="text-[#64748b] font-medium">
                    Menampilkan {startIndex + 1} - {Math.min(startIndex + usersPerPage, filteredUsers.length)} dari {filteredUsers.length} user
                  </span>
                  {renderAdminPagination(currentUserPage, totalUserPages, setUserPage)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderBusinesses = () => {
    const filteredBusinesses = businesses.filter((b) => {
      const query = searchQuery.toLowerCase();
      const nameMatch = b.name?.toLowerCase().includes(query);
      const catMatch = typeof b.category === "string" ? b.category.toLowerCase().includes(query) : b.category?.name?.toLowerCase().includes(query);
      const ownerMatch = b.user?.name?.toLowerCase().includes(query) || b.owner?.toLowerCase().includes(query);

      const isPremExpired = Boolean(b.premium_expires_at && new Date(b.premium_expires_at) <= new Date());
      const isPrem = !isPremExpired && (b.premium_info?.status === "active" || b.is_premium);

      const bStatus = (b.status || "").toLowerCase();
      const bSub = b.subscriptions?.[0] || b.latest_subscription || (Array.isArray(subscriptions) ? subscriptions.find(s => s.business_id === b.id) : null);
      const bSubNeedsRevision = Boolean(bSub && (bSub.status === "needs_revision" || bSub.payment?.status === "needs_revision"));
      const bSubPending = Boolean(bSub && bSub.status === "pending" && (Number(bSub.plan?.price) > 0 || bSub.plan_id || bSub.payment?.status === "pending"));

      const statusMatch = businessStatusFilter === "all" || !businessStatusFilter
        ? true
        : businessStatusFilter === "premium"
          ? isPrem
          : businessStatusFilter === "non_premium"
            ? !isPrem
            : businessStatusFilter === "approved"
              ? (bStatus === "approved" || bStatus === "published" || bStatus === "active") && !bSubPending && !bSubNeedsRevision
              : businessStatusFilter === "pending"
                ? (bStatus === "pending" || bStatus === "menunggu" || bStatus === "needs_revision" || bSubPending || bSubNeedsRevision || Boolean(b.has_pending_subscription) || Boolean(b.has_revision_subscription))
                : businessStatusFilter === "rejected"
                  ? (bStatus === "rejected" || bStatus === "ditolak")
                  : bStatus === businessStatusFilter;

      return (!searchQuery || nameMatch || catMatch || ownerMatch) && statusMatch;
    });

    // Urutkan: Yang butuh verifikasi / pending / revisi tampil paling depan, lalu yang terbaru
    const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
      const aSub = a.subscriptions?.[0] || a.latest_subscription || (Array.isArray(subscriptions) ? subscriptions.find(s => s.business_id === a.id) : null);
      const bSub = b.subscriptions?.[0] || b.latest_subscription || (Array.isArray(subscriptions) ? subscriptions.find(s => s.business_id === b.id) : null);

      const isAPendingOrRev = a.status === "pending" || a.status === "menunggu" || a.status === "needs_revision" || Boolean(a.has_pending_subscription) || Boolean(a.has_revision_subscription) || (aSub && (aSub.status === "pending" || aSub.status === "needs_revision" || aSub.payment?.status === "pending" || aSub.payment?.status === "needs_revision"));
      const isBPendingOrRev = b.status === "pending" || b.status === "menunggu" || b.status === "needs_revision" || Boolean(b.has_pending_subscription) || Boolean(b.has_revision_subscription) || (bSub && (bSub.status === "pending" || bSub.status === "needs_revision" || bSub.payment?.status === "pending" || bSub.payment?.status === "needs_revision"));

      if (isAPendingOrRev && !isBPendingOrRev) return -1;
      if (!isAPendingOrRev && isBPendingOrRev) return 1;

      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const totalBusinessPages = Math.ceil(sortedBusinesses.length / businessesPerPage) || 1;
    const currentBusinessPage = Math.min(Math.max(1, businessPage), totalBusinessPages);
    const startIndex = (currentBusinessPage - 1) * businessesPerPage;
    const displayedBusinesses = sortedBusinesses.slice(startIndex, startIndex + businessesPerPage);

    const filterTabs = [
      { id: 'all', label: 'Semua' },
      { id: 'pending', label: 'Pending / Revisi' },
      { id: 'approved', label: 'Disetujui' },
      { id: 'rejected', label: 'Ditolak' },
      { id: 'premium', label: 'Premium' },
      { id: 'non_premium', label: 'Non Premium' },
    ];

    return (
      <div className="mb-[28px]">
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
            Kelola Usaha
          </h2>
          <button
            className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.25)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]"
            onClick={() => navigate("/admin/add-business?admin=true")}
          >
            <Plus size={18} strokeWidth={2} />
            <span>Tambah Usaha</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">
          <div className="flex items-center gap-[6px] bg-[#f1f5f9] p-[4px] rounded-[10px] flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setBusinessStatusFilter(tab.id);
                  setBusinessPage(1);
                }}
                className={`px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer border-0 ${businessStatusFilter === tab.id
                    ? 'bg-[#007570] text-white shadow-xs'
                    : 'text-[#64748b] bg-transparent hover:text-[#0f172a]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[220px] flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[8px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
            <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
            <input
              type="text"
              placeholder="Cari nama bisnis, kategori, atau pemilik..."
              className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setBusinessPage(1);
              }}
            />
          </div>
        </div>

        {/* Optimized Business Table (No forced horizontal scrolling) */}
        <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
                <tr>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Bisnis &amp; Kategori</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Pemilik</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Status Usaha</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Paket Premium</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Paket Iklan</th>
                  <th className="px-[14px] py-[12px] text-center text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] w-[135px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayedBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-[36px]">
                      <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                        <Building2 size={48} strokeWidth={1} className="opacity-40" />
                        <p className="text-[14px] text-[#64748b] font-medium">Belum ada data bisnis yang sesuai.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedBusinesses.map((business) => {
                    const isPremExpired = Boolean(business.premium_expires_at && new Date(business.premium_expires_at) <= new Date());
                    const isPrem = !isPremExpired && (business.premium_info?.status === "active" || business.is_premium);
                    const isAdExpired = Boolean(business.ad_info?.end_date && new Date(business.ad_info.end_date) <= new Date());
                    const isAd = !isAdExpired && (business.ad_info?.status === "active" || business.has_active_ad);
                    const sub = business.subscriptions?.[0] || business.latest_subscription || (Array.isArray(subscriptions) ? subscriptions.find(s => s.business_id === business.id) : null);

                    const isSubNeedsRevision = Boolean(sub && (sub.status === "needs_revision" || sub.payment?.status === "needs_revision"));
                    const isSubPending = Boolean(!isSubNeedsRevision && sub && sub.status === "pending" && (Number(sub.plan?.price) > 0 || sub.plan_id || sub.payment?.status === "pending"));
                    const isSubRejected = Boolean(!isSubNeedsRevision && !isSubPending && sub && (sub.status === "cancelled" || sub.status === "rejected" || sub.payment?.status === "rejected") && (sub.payment || Number(sub.plan?.price) > 0));

                    const hasRevisionPrem = !isPrem && (
                      Boolean(business.has_revision_subscription) || isSubNeedsRevision
                    );
                    const hasPendingPrem = !isPrem && !hasRevisionPrem && (
                      Boolean(business.has_pending_subscription) || isSubPending
                    );
                    const hasRejectedPrem = !isPrem && !hasRevisionPrem && !hasPendingPrem && (
                      Boolean(business.has_rejected_subscription) || isSubRejected
                    );

                    const isPendingBiz = business.status === "pending" || business.status === "menunggu";
                    const isRevisionBiz = business.status === "needs_revision";
                    const isRejectedBiz = business.status === "rejected" || business.status === "ditolak";

                    return (
                      <tr key={business.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                        {/* Bisnis & Kategori */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={getBusinessTablePhoto(business)}
                              alt={business.name}
                              className="w-[38px] h-[38px] rounded-[10px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-[#0f172a] block truncate max-w-[200px]">
                                {business.name}
                              </span>
                              <span className="text-[11px] text-[#64748b] font-medium block truncate">
                                {business.category?.name || (typeof business.category === "string" ? business.category : "-")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Pemilik */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12.5px] text-[#334155] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <span className="block truncate max-w-[140px]">
                            {business.user?.name || business.owner || "Unknown"}
                          </span>
                        </td>

                        {/* Status Usaha */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <span className={
                            isRevisionBiz
                              ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#fef3c7] text-[#d97706] border border-amber-300"
                              : hasRevisionPrem
                                ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#fef3c7] text-[#d97706] border border-amber-300"
                                : hasPendingPrem
                                  ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                                  : isPendingBiz
                                    ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#fef3c7] text-[#d97706] border border-amber-300"
                                    : isRejectedBiz
                                      ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#fee2e2] text-[#dc2626] border border-rose-200"
                                      : hasRejectedPrem
                                        ? "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-rose-200"
                                        : "inline-flex items-center gap-[4px] px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-bold bg-[#dcfce7] text-[#16a34a]"
                          }>
                            {isRevisionBiz
                              ? "Perlu Revisi"
                              : hasRevisionPrem
                                ? "Revisi"
                                : hasPendingPrem
                                  ? "Verifikasi Upgrade"
                                  : isPendingBiz
                                    ? "Pending"
                                    : isRejectedBiz
                                      ? "Ditolak"
                                      : hasRejectedPrem
                                        ? "Disetujui (Upgrade Ditolak)"
                                        : "Disetujui"}
                          </span>
                        </td>

                        {/* Premium Info */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <div>
                            <span className={
                              isPrem
                                ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-gradient-to-br from-[#007570] to-[#00b3ab] text-white shadow-2xs"
                                : hasRevisionPrem
                                  ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#fef3c7] text-[#b45309] border border-amber-300"
                                  : hasPendingPrem
                                    ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#eff6ff] text-[#2563eb] border border-blue-300"
                                    : hasRejectedPrem
                                      ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#fee2e2] text-[#dc2626] border border-rose-300"
                                      : business.premium_info?.status === "expired"
                                        ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#ffedd5] text-[#c2410c] border border-[#fdba74]"
                                        : "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#f1f5f9] text-[#64748b]"
                            }>
                              {(isPrem || hasPendingPrem) && <Crown size={12} strokeWidth={2} />}
                              {hasRevisionPrem && <AlertTriangle size={12} strokeWidth={2} />}
                              {hasRejectedPrem && <X size={12} strokeWidth={2} />}
                              {isPrem ? "Aktif" : (hasRevisionPrem ? "Perbaikan Bayar" : (hasPendingPrem ? "Menunggu Verifikasi" : (hasRejectedPrem ? "Upgrade Ditolak" : (business.premium_info?.label || "Tidak Aktif"))))}
                            </span>
                            {isPrem && business.premium_info?.expired_at && (
                              <span className="text-[10px] text-[#64748b] block mt-[1px]">
                                Exp: {business.premium_info.expired_at}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Iklan Info */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleAdPackage(business)}
                              className={
                                isAd
                                  ? "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#fef3c7] text-[#b45309] border border-amber-300 cursor-pointer hover:opacity-80 transition-all"
                                  : "inline-flex items-center gap-[3px] px-[8px] py-[2px] rounded-[6px] text-[11px] font-bold bg-[#f1f5f9] text-[#64748b] border border-slate-200 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all"
                              }
                              title={isAd ? "Klik untuk Nonaktifkan / Ubah Status Iklan" : "Klik untuk Aktifkan Paket Iklan (30 Hari)"}
                            >
                              {isAd && <Megaphone size={12} strokeWidth={2} />}
                              {business.ad_info?.label || (isAd ? "Aktif" : "Tidak Aktif")}
                            </button>
                            {isAd && business.ad_info?.expired_at && (
                              <span className="text-[10px] text-[#64748b] block mt-[1px]">
                                Exp: {business.ad_info.expired_at}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Aksi */}
                        <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                          <div className="flex items-center justify-center gap-[4px]">
                            {/* 1. Preview Detail */}
                            <button
                              className="w-[28px] h-[28px] bg-[#f0fdfa] text-[#007570] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white"
                              onClick={() => handleOpenBusinessDetail(business)}
                              title="Lihat Detail & Validasi"
                            >
                              <Eye size={15} strokeWidth={2} />
                            </button>

                            {/* 2. Setujui (Approve) - Muncul jika pending pendaftaran baru ATAU pending upgrade */}
                            {(isPendingBiz || isRevisionBiz || hasPendingPrem || hasRevisionPrem) && !isRejectedBiz && (
                              <button
                                className="w-[28px] h-[28px] bg-[#dcfce7] text-[#16a34a] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#16a34a] hover:text-white"
                                onClick={() => handleApproveBusiness(business.id)}
                                title="Setujui Bisnis / Upgrade"
                              >
                                <Check size={15} strokeWidth={2} />
                              </button>
                            )}

                            {/* 3. Minta Perbaikan (Revisi) - Muncul jika pending atau perlu revisi */}
                            {(isPendingBiz || isRevisionBiz || hasPendingPrem || hasRevisionPrem) && !isRejectedBiz && (
                              <button
                                className="w-[28px] h-[28px] bg-[#fef3c7] text-[#b45309] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#f59e0b] hover:text-white"
                                onClick={() => handleOpenRevisionModal(business)}
                                title="Minta Perbaikan / Revisi Data / Bukti Bayar"
                              >
                                <AlertTriangle size={14} strokeWidth={2} />
                              </button>
                            )}

                            {/* 4. Tolak Bisnis (Direct Reject) - Muncul jika pending pendaftaran baru ATAU pending upgrade */}
                            {(isPendingBiz || isRevisionBiz || hasPendingPrem || hasRevisionPrem) && !isRejectedBiz && (
                              <button
                                className="w-[28px] h-[28px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white"
                                onClick={() => handleDirectRejectBusiness(business)}
                                title="Tolak Bisnis / Upgrade"
                              >
                                <X size={15} strokeWidth={2} />
                              </button>
                            )}

                            {/* 5. Hapus */}
                            <button
                              className="w-[28px] h-[28px] bg-[#fef2f2] text-[#dc2626] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white"
                              onClick={() => handleDeleteBusiness(business.id)}
                              title="Hapus"
                            >
                              <Trash2 size={15} strokeWidth={2} />
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

          {/* Business Pagination Controls */}
          {filteredBusinesses.length > businessesPerPage && (
            <div className="flex items-center justify-between p-[14px_18px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px] bg-[#fafafa]">
              <span className="text-[#64748b] font-medium">
                Menampilkan {startIndex + 1} - {Math.min(startIndex + businessesPerPage, filteredBusinesses.length)} dari {filteredBusinesses.length} bisnis
              </span>
              {renderAdminPagination(currentBusinessPage, totalBusinessPages, setBusinessPage)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    const filteredProducts = products.filter((p) => {
      if (!productSearch) return true;
      const q = productSearch.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.business?.name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const isAPendingOrRev = a.status === "pending" || a.status === "menunggu" || a.status === "waiting_verification" || a.status === "waiting_approval" || a.status === "needs_revision" || a.status === "revision";
      const isBPendingOrRev = b.status === "pending" || b.status === "menunggu" || b.status === "waiting_verification" || b.status === "waiting_approval" || b.status === "needs_revision" || b.status === "revision";

      if (isAPendingOrRev && !isBPendingOrRev) return -1;
      if (!isAPendingOrRev && isBPendingOrRev) return 1;

      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const totalProductPages = Math.ceil(sortedProducts.length / productsPerPage) || 1;
    const currentProductPage = Math.min(Math.max(1, productPage), totalProductPages);
    const paginatedProducts = sortedProducts.slice(
      (currentProductPage - 1) * productsPerPage,
      currentProductPage * productsPerPage
    );

    return (
      <div className="mb-[28px]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-[16px] mb-[20px]">
          <div>
            <h2 className="text-[20px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[22px] before:bg-[#007570] before:rounded-[2px]">
              Verifikasi & Kelola Produk
            </h2>
            <p className="text-[13px] text-[#64748b] mt-[3px]">
              Tinjau produk yang didaftarkan oleh pelaku usaha, verifikasi kelayakan, atau nonaktifkan produk.
            </p>
          </div>
          <button
            onClick={fetchProducts}
            disabled={productsLoading}
            className="inline-flex items-center gap-[7px] px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer transition-all shadow-sm"
          >
            <RefreshCw size={15} className={productsLoading ? "animate-spin text-[#007570]" : "text-[#64748b]"} />
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[14px] mb-[20px]">
          <div className="bg-white p-[16px] rounded-[12px] border border-[#e2e8f0] shadow-sm flex items-center gap-[14px]">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#f1f5f9] flex items-center justify-center text-[#334155] shrink-0">
              <Package size={22} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#64748b]">Total Produk</div>
              <div className="text-[20px] font-bold text-[#0f172a]">{productCounts.all || 0}</div>
            </div>
          </div>

          <div className="bg-white p-[16px] rounded-[12px] border border-[#fef3c7] shadow-sm flex items-center gap-[14px] relative overflow-hidden">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#fffbeb] flex items-center justify-center text-[#d97706] shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#b45309]">Menunggu</div>
              <div className="text-[20px] font-bold text-[#b45309]">{productCounts.pending || 0}</div>
            </div>
            {productCounts.pending > 0 && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#b45309] animate-pulse">
                Review
              </span>
            )}
          </div>

          <div className="bg-white p-[16px] rounded-[12px] border border-[#ffedd5] shadow-sm flex items-center gap-[14px] relative overflow-hidden">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#fff7ed] flex items-center justify-center text-[#ea580c] shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#c2410c]">Perlu Perbaikan</div>
              <div className="text-[20px] font-bold text-[#c2410c]">{productCounts.needs_revision || 0}</div>
            </div>
          </div>

          <div className="bg-white p-[16px] rounded-[12px] border border-[#d1fae5] shadow-sm flex items-center gap-[14px]">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#ecfdf5] flex items-center justify-center text-[#059669] shrink-0">
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#047857]">Disetujui</div>
              <div className="text-[20px] font-bold text-[#047857]">{productCounts.approved || 0}</div>
            </div>
          </div>

          <div className="bg-white p-[16px] rounded-[12px] border border-[#ffe4e6] shadow-sm flex items-center gap-[14px]">
            <div className="w-[44px] h-[44px] rounded-[10px] bg-[#fff1f2] flex items-center justify-center text-[#e11d48] shrink-0">
              <XCircle size={22} />
            </div>
            <div>
              <div className="text-[12px] font-medium text-[#be123c]">Ditolak</div>
              <div className="text-[20px] font-bold text-[#be123c]">{productCounts.rejected || 0}</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white p-[16px] rounded-[12px] border border-[#e2e8f0] shadow-sm mb-[16px]">
          <div className="flex flex-wrap items-center justify-between gap-[12px]">
            {/* Status Tabs */}
            <div className="flex items-center gap-[6px] overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "Semua", count: productCounts.all },
                { id: "pending", label: "Menunggu Verifikasi", count: productCounts.pending, badgeColor: "bg-[#fef3c7] text-[#b45309]" },
                { id: "needs_revision", label: "Perlu Perbaikan", count: productCounts.needs_revision, badgeColor: "bg-[#ffedd5] text-[#c2410c]" },
                { id: "approved", label: "Disetujui", count: productCounts.approved, badgeColor: "bg-[#d1fae5] text-[#065f46]" },
                { id: "rejected", label: "Ditolak", count: productCounts.rejected, badgeColor: "bg-[#ffe4e6] text-[#9f1239]" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setProductStatusFilter(tab.id);
                    setProductPage(1);
                  }}
                  className={`flex items-center gap-[6px] px-[14px] py-[8px] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap ${productStatusFilter === tab.id
                      ? "bg-[#007570] text-white shadow-sm font-semibold"
                      : "bg-[#f8fafc] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                    }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-[6px] py-[1px] rounded-full text-[11px] font-bold ${productStatusFilter === tab.id
                        ? "bg-[rgba(255,255,255,0.25)] text-white"
                        : tab.badgeColor || "bg-[#e2e8f0] text-[#475569]"
                      }`}
                  >
                    {tab.count || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-[8px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] px-[12px] py-[7px] w-full sm:w-[280px] focus-within:border-[#007570] focus-within:bg-white transition-all">
              <Search size={16} className="text-[#94a3b8] shrink-0" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
                placeholder="Cari nama produk / usaha..."
                className="w-full bg-transparent border-0 outline-none text-[13px] text-[#0f172a] placeholder:text-[#94a3b8]"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch("")}
                  className="text-[#94a3b8] hover:text-[#0f172a] text-[12px] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[12px] font-semibold text-[#64748b]">
                  <th className="p-[14px_16px]">No</th>
                  <th className="p-[14px_16px]">Produk</th>
                  <th className="p-[14px_16px]">Usaha / Toko</th>
                  <th className="p-[14px_16px]">Status Verifikasi</th>
                  <th className="p-[14px_16px]">Status Tayang</th>
                  <th className="p-[14px_16px]">Aksi Verifikasi & Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                {productsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center">
                      <SuradeLoader variant="section" size="sm" text="Memuat data produk" minHeight="160px" />
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-[48px] text-center text-[#64748b]">
                      <Package size={36} className="mx-auto mb-[10px] text-[#cbd5e1]" />
                      <p className="font-medium text-[#334155]">Tidak ada produk ditemukan</p>
                      <p className="text-[12px] text-[#94a3b8] mt-1">
                        {productSearch
                          ? "Coba ubah kata kunci pencarian Anda."
                          : "Belum ada produk dengan status yang dipilih."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product, idx) => {
                    const rowNumber = (currentProductPage - 1) * productsPerPage + idx + 1;
                    const imgUrl = product.image_url || product.image || (product.images && product.images[0]) || null;
                    const status = product.status || "approved";

                    return (
                      <tr key={product.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-[14px_16px] text-[#64748b] font-medium">{rowNumber}</td>
                        <td className="p-[14px_16px]">
                          <div className="flex items-center gap-[12px]">
                            {imgUrl ? (
                              <img
                                src={getStorageUrl(imgUrl)}
                                alt={product.name}
                                className="w-[48px] h-[48px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0 bg-[#f8fafc]"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/100x100?text=Produk";
                                }}
                              />
                            ) : (
                              <div className="w-[48px] h-[48px] rounded-[8px] bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] shrink-0">
                                <Package size={20} />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-[#007570] bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                                  #{product.id}
                                </span>
                                <span className="font-semibold text-[#0f172a] line-clamp-1">{product.name}</span>
                              </div>
                              <div className="text-[12px] font-bold text-[#007570] mt-[2px]">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  maximumFractionDigits: 0,
                                }).format(product.price || 0)}
                              </div>
                              {product.category?.name && (
                                <span className="inline-block mt-[3px] text-[10.5px] px-[6px] py-[1px] rounded bg-[#f1f5f9] text-[#64748b] font-medium">
                                  {product.category.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-[14px_16px]">
                          <div className="font-medium text-[#0f172a]">{product.business?.name || "–"}</div>
                          <div className="text-[12px] text-[#64748b] mt-[2px]">
                            {product.business?.user?.name || product.business?.phone || "–"}
                          </div>
                        </td>
                        <td className="p-[14px_16px]">
                          {(status === "pending" || status === "waiting_approval") && (
                            <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11.5px] font-semibold bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                              <Clock size={12} />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                          {(status === "needs_revision" || status === "revision") && (
                            <div>
                              <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11.5px] font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]">
                                <AlertTriangle size={12} />
                                <span>Perlu Perbaikan</span>
                              </span>
                              {product.rejection_reason && (
                                <div className="text-[11px] text-[#ea580c] mt-[4px] italic max-w-[200px] line-clamp-2" title={product.rejection_reason}>
                                  Alasan: {product.rejection_reason}
                                </div>
                              )}
                            </div>
                          )}
                          {status === "approved" && (
                            <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11.5px] font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                              <CheckCircle size={12} />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {status === "rejected" && (
                            <div>
                              <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[11.5px] font-semibold bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]">
                                <XCircle size={12} />
                                <span>Ditolak Permanen</span>
                              </span>
                              {product.rejection_reason && (
                                <div className="text-[11px] text-[#e11d48] mt-[4px] italic max-w-[200px] line-clamp-2" title={product.rejection_reason}>
                                  Alasan: {product.rejection_reason}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-[14px_16px]">
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(product)}
                            className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors border ${product.is_active !== false && product.is_active !== 0
                                ? "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0] hover:bg-[#dcfce7]"
                                : "bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] hover:bg-[#e2e8f0]"
                              }`}
                            title="Klik untuk ubah status aktif di web"
                          >
                            {product.is_active !== false && product.is_active !== 0 ? (
                              <>
                                <Eye size={12} />
                                <span>Aktif</span>
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                <span>Nonaktif</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-[14px_16px]">
                          <div className="flex items-center gap-[8px]">
                            <button
                              type="button"
                              onClick={() => setViewProductModal({ open: true, product })}
                              className="inline-flex items-center gap-[4px] px-[8px] py-[6px] rounded-[6px] bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1] text-[12px] font-bold hover:bg-[#007570] hover:text-white transition-all cursor-pointer"
                              title="Lihat Detail Produk Lengkap"
                            >
                              <Eye size={13} />
                              <span>Detail</span>
                            </button>
                            {status !== "approved" && status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleApproveProduct(product)}
                                className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[6px] bg-[#007570] text-white text-[12px] font-semibold hover:bg-[#005a58] transition-colors cursor-pointer shadow-sm"
                                title="Setujui Produk"
                              >
                                <Check size={13} strokeWidth={2.5} />
                                <span>Setujui</span>
                              </button>
                            )}
                            {status !== "approved" && status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => setRejectProductModal({ open: true, product, reason: "", mode: "revision" })}
                                className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[6px] bg-[#fef3c7] text-[#b45309] border border-[#fde68a] text-[12px] font-semibold hover:bg-[#fde68a] transition-colors cursor-pointer"
                                title="Minta Perbaikan / Revisi Produk"
                              >
                                <AlertTriangle size={13} strokeWidth={2.5} />
                                <span>Perbaikan</span>
                              </button>
                            )}
                            {status !== "approved" && status !== "rejected" && (
                              <button
                                type="button"
                                onClick={() => handleDirectRejectProduct(product)}
                                className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[6px] bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3] text-[12px] font-semibold hover:bg-[#ffe4e6] transition-colors cursor-pointer"
                                title="Tolak Produk"
                              >
                                <X size={13} strokeWidth={2.5} />
                                <span>Tolak</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              className="p-[6px] rounded-[6px] text-[#94a3b8] hover:text-[#e11d48] hover:bg-[#fff1f2] transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 size={15} />
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

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between p-[14px_16px] border-t border-[#e2e8f0] bg-[#f8fafc] text-[12px] text-[#64748b] flex-wrap gap-[10px]">
              <div>
                Halaman <span className="font-semibold text-[#0f172a]">{currentProductPage}</span> dari{" "}
                <span className="font-semibold text-[#0f172a]">{totalProductPages}</span> ({filteredProducts.length} produk)
              </div>
              {renderAdminPagination(currentProductPage, totalProductPages, setProductPage)}
            </div>
          )}
        </div>

        {/* Rejection / Revision Modal for Products */}
        {rejectProductModal.open && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[rgba(15,23,42,0.6)] backdrop-blur-xs">
            <div className="bg-white rounded-[14px] shadow-2xl max-w-md w-full overflow-hidden border border-[#e2e8f0] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-[18px_20px] border-b border-[#e2e8f0] flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center ${rejectProductModal.mode === "revision" ? "bg-[#fef3c7] text-[#b45309]" : "bg-[#fff1f2] text-[#e11d48]"}`}>
                    {rejectProductModal.mode === "revision" ? <AlertTriangle size={18} /> : <XCircle size={18} />}
                  </div>
                  <h3 className="font-bold text-[15px] text-[#0f172a]">
                    {rejectProductModal.mode === "revision" ? "Minta Perbaikan / Revisi Produk" : "Tolak Verifikasi Produk"}
                  </h3>
                </div>
                <button
                  onClick={() => setRejectProductModal({ open: false, product: null, reason: "", mode: "reject" })}
                  className="text-[#94a3b8] hover:text-[#0f172a] p-1 rounded-md cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-[20px] space-y-3">
                <p className="text-[13px] text-[#64748b]">
                  {rejectProductModal.mode === "revision" ? "Masukkan catatan perbaikan untuk produk " : "Berikan alasan penolakan untuk produk "}
                  <span className="font-bold text-[#0f172a]">"{rejectProductModal.product?.name}"</span>:
                </p>

                {/* Preset Reasons */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Pilih Alasan Cepat:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(rejectProductModal.mode === "revision"
                      ? [
                        "Foto produk kurang jelas / buram",
                        "Deskripsi produk kurang lengkap",
                        "Harga atau variasi tidak wajar",
                        "Informasi kontak / WhatsApp salah",
                      ]
                      : [
                        "Produk melanggar syarat & ketentuan platform",
                        "Data / foto produk terindikasi palsu",
                        "Produk terlarang atau berbahaya",
                        "Duplikasi produk yang sudah ada",
                      ]
                    ).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRejectProductModal((prev) => ({ ...prev, reason: preset }))}
                        className={`text-[11.5px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${rejectProductModal.reason === preset
                            ? "bg-[#007570] text-white border-[#007570]"
                            : "bg-[#f8fafc] text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9]"
                          }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={rejectProductModal.reason}
                  onChange={(e) => setRejectProductModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder={rejectProductModal.mode === "revision" ? "Tuliskan rincian bagian produk yang perlu diperbaiki oleh pemilik usaha..." : "Tuliskan alasan penolakan produk secara detail..."}
                  className="w-full p-[12px] border border-[#cbd5e1] rounded-[10px] text-[13px] text-[#0f172a] outline-none focus:border-[#007570] focus:ring-2 focus:ring-[#e6f4ea] resize-none"
                />
              </div>
              <div className="p-[14px_20px] bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setRejectProductModal({ open: false, product: null, reason: "", mode: "reject" })}
                  className="px-[14px] py-[8px] rounded-[8px] text-[13px] font-semibold text-[#64748b] hover:bg-[#e2e8f0] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectProduct}
                  className={`px-[16px] py-[8px] rounded-[8px] text-[13px] font-semibold text-white transition-colors cursor-pointer shadow-sm ${rejectProductModal.mode === "revision"
                      ? "bg-[#d97706] hover:bg-[#b45309]"
                      : "bg-[#e11d48] hover:bg-[#be123c]"
                    }`}
                >
                  {rejectProductModal.mode === "revision" ? "Kirim Perbaikan" : "Konfirmasi Tolak"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
                        <div className="w-[28px] h-[28px] rounded-[7px] bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1] flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-2xs">
                          {(() => {
                            const name = (category.name || "").trim();
                            const words = name.split(/\s+/);
                            if (words.length >= 2 && words[0] && words[1]) {
                              return (words[0][0] + words[1][0]).toUpperCase();
                            }
                            return name.substring(0, 2).toUpperCase();
                          })()}
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

  const renderNavbarCategories = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px]">
        <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">Kelola Kategori</h2>
        <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]" onClick={() => handleModal("addNavbarCategory")}>
          <Plus size={18} strokeWidth={2} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-[10px] mb-[16px]">
        <div className="flex-1 min-w-[200px] flex items-center gap-[10px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] px-[14px] py-[9px] transition-all duration-220 focus-within:border-[#007570] focus-within:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]">
          <Search size={18} strokeWidth={2} className="text-[#007570] shrink-0" />
          <input
            type="text"
            placeholder="Cari kategori informasi atau slug..."
            className="flex-1 border-0 outline-none font-['Poppins','Inter',sans-serif] text-[13.5px] text-[#0f172a] bg-transparent placeholder:text-[#94a3b8]"
            value={navbarCategorySearchQuery}
            onChange={(e) => setNavbarCategorySearchQuery(e.target.value)}
          />
        </div>
        <select
          value={navbarCategoryStatusFilter}
          onChange={(e) => setNavbarCategoryStatusFilter(e.target.value)}
          className="px-[14px] py-[9px] bg-white border-[1.5px] border-[#e2e8f0] rounded-[10px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium outline-none focus:border-[#007570]"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
            <tr>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Nama Kategori</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Slug</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Parent</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Urutan</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Status</th>
              <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {navbarCategories.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-[36px]">
                  <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                    <Info size={48} strokeWidth={1} className="opacity-40" />
                    <p className="text-[14px] text-[#64748b] font-medium">Belum ada data kategori informasi.</p>
                  </div>
                </td>
              </tr>
            ) : (
              navbarCategories
                .filter((cat) => {
                  const query = navbarCategorySearchQuery.toLowerCase();
                  const matchSearch =
                    !navbarCategorySearchQuery ||
                    cat.name?.toLowerCase().includes(query) ||
                    cat.slug?.toLowerCase().includes(query);
                  const matchStatus =
                    !navbarCategoryStatusFilter ||
                    (navbarCategoryStatusFilter === "active" ? cat.is_active !== false : cat.is_active === false);
                  return matchSearch && matchStatus;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((category) => (
                  <tr key={category.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[30px] h-[30px] rounded-[8px] bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1] flex items-center justify-center font-extrabold text-[12px] shrink-0 shadow-2xs overflow-hidden">
                          {(() => {
                            const isImg = category.icon && (category.icon.startsWith("http") || category.icon.includes("/") || /\.(png|jpe?g|svg|webp|gif)$/i.test(category.icon));
                            if (isImg) {
                              return <img src={category.icon_url || getStorageUrl(category.icon)} alt="" className="w-full h-full object-contain p-0.5" />;
                            }
                            if (category.icon) {
                              return <span className="text-[14px]">{category.icon}</span>;
                            }
                            const name = (category.name || "").trim();
                            const words = name.split(/\s+/);
                            if (words.length >= 2 && words[0] && words[1]) {
                              return (words[0][0] + words[1][0]).toUpperCase();
                            }
                            return name.substring(0, 2).toUpperCase();
                          })()}
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
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-semibold align-middle [tr:last-child_&]:border-b-0">
                      {category.order || 0}
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <button
                        type="button"
                        className={`${getBadgeClass(category.is_active !== false ? "active" : "inactive")} cursor-pointer hover:opacity-80 border-0 bg-transparent p-0`}
                        onClick={() => handleToggleNavbarCategoryStatus(category)}
                        title="Klik untuk mengubah status (Aktif/Nonaktif)"
                      >
                        {category.is_active !== false ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                      <div className="flex items-center gap-[5px]">
                        <button className="w-[30px] h-[30px] bg-[#f1f5f9] border-0 rounded-[7px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,117,112,0.2)]" onClick={() => handleModal("editNavbarCategory", category)} title="Edit">
                          <Edit size={16} strokeWidth={2} />
                        </button>
                        <button className="w-[30px] h-[30px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[7px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white" onClick={() => handleModal("deleteNavbarCategory", category)} title="Hapus">
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

  const renderAds = () => {
    const computedAdsStats = {
      totalOrders: advertisements.length,
      pending: advertisements.filter((ad) => {
        const st = ad.computed_status || ad.status;
        return st === "pending" || st === "waiting_approval" || ad.payment_status === "pending";
      }).length,
      active: advertisements.filter((ad) => {
        const st = ad.computed_status || ad.status;
        return st === "active" || st === "approved";
      }).length,
      completed: advertisements.filter((ad) => {
        const st = ad.computed_status || ad.status;
        return st === "expired" || st === "completed";
      }).length,
      rejected: advertisements.filter((ad) => {
        const st = ad.computed_status || ad.status;
        return st === "rejected" || st === "cancelled";
      }).length,
      totalRevenue: advertisements.reduce((acc, ad) => {
        const st = ad.computed_status || ad.status;
        if (ad.payment_status === "paid" || st === "active" || st === "approved" || st === "expired" || st === "completed") {
          return acc + Number(ad.price || 0);
        }
        return acc;
      }, 0),
    };

    return (
      <div className="mb-[28px] space-y-5">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0b3330] via-[#005a56] to-[#007570] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#5eead4] text-xs font-bold border border-white/10">
              <Megaphone size={14} />
              <span>Manajemen Monetisasi & Iklan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Kelola Kampanye Iklan
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-2xl leading-relaxed">
              Pantau pengajuan iklan mitra bisnis, verifikasi pembayaran multi-struk, kelola masa tayang penempatan hero & banner, serta analisis pendapatan iklan platform.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={fetchAllData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 backdrop-blur-xs"
              title="Segarkan Data"
            >
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl border border-white/10 backdrop-blur-xs">
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-['Poppins','Inter',sans-serif] text-xs font-bold cursor-pointer transition-all ${adsTab === "orders"
                    ? "bg-white text-[#007570] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                onClick={() => setAdsTab("orders")}
              >
                <Megaphone size={14} strokeWidth={2.2} />
                <span>Pesanan Iklan</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${adsTab === "orders" ? "bg-teal-50 text-[#007570]" : "bg-white/20 text-white"
                  }`}>
                  {computedAdsStats.totalOrders}
                </span>
              </button>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-['Poppins','Inter',sans-serif] text-xs font-bold cursor-pointer transition-all ${adsTab === "packages"
                    ? "bg-white text-[#007570] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                onClick={() => setAdsTab("packages")}
              >
                <Crown size={14} strokeWidth={2.2} />
                <span>Daftar Paket</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${adsTab === "packages" ? "bg-teal-50 text-[#007570]" : "bg-white/20 text-white"
                  }`}>
                  {adPackages.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 6 Metric KPI Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Order</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007570] to-[#00a8a0] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Megaphone size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 block tracking-tight">{computedAdsStats.totalOrders}</span>
              <span className="inline-block mt-1 text-[10.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                Semua Pengajuan
              </span>
            </div>
          </div>

          {/* Menunggu Persetujuan */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-amber-200/90 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Menunggu Review</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Clock size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-amber-700 block tracking-tight">{computedAdsStats.pending}</span>
              <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {computedAdsStats.pending > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                Butuh Approval
              </span>
            </div>
          </div>

          {/* Iklan Aktif */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-emerald-200/90 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Iklan Aktif</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Sparkles size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-emerald-700 block tracking-tight">{computedAdsStats.active}</span>
              <span className="inline-flex items-center gap-1 mt-1 text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live di Web
              </span>
            </div>
          </div>

          {/* Iklan Selesai */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Iklan Selesai</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <CheckCircle2 size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-800 block tracking-tight">{computedAdsStats.completed}</span>
              <span className="inline-block mt-1 text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Masa Habis
              </span>
            </div>
          </div>

          {/* Iklan Ditolak */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-rose-200/80 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Iklan Ditolak</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <XCircle size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-rose-700 block tracking-tight">{computedAdsStats.rejected}</span>
              <span className="inline-block mt-1 text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Dibatalkan / Tolak
              </span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-teal-200/90 flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Total Pendapatan</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Wallet size={17} strokeWidth={2.2} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-black text-[#007570] block truncate tracking-tight">
                Rp {computedAdsStats.totalRevenue.toLocaleString("id-ID")}
              </span>
              <span className="inline-block mt-1 text-[10.5px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Omset Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Orders Tab View */}
        {adsTab === "orders" && (() => {
          const filteredAds = advertisements.filter((ad) => {
            const q = (adsFilters.search || "").toLowerCase();
            const matchSearch =
              !q ||
              ad.business?.name?.toLowerCase().includes(q) ||
              ad.user?.name?.toLowerCase().includes(q) ||
              ad.user?.email?.toLowerCase().includes(q) ||
              ad.package_name?.toLowerCase().includes(q);

            const statusVal = (ad.computed_status || ad.status || "").toLowerCase();
            const matchStatus = !adsFilters.status || statusVal === adsFilters.status.toLowerCase();

            const pkgVal = (ad.package_name || "").toLowerCase();
            const matchPkg = !adsFilters.package || pkgVal.includes(adsFilters.package.toLowerCase());

            const payVal = (ad.payment_status || "").toLowerCase();
            const matchPay = !adsFilters.payment || payVal === adsFilters.payment.toLowerCase();

            let matchDate = true;
            if (adsFilters.dateFrom) {
              matchDate = matchDate && new Date(ad.created_at) >= new Date(adsFilters.dateFrom);
            }
            if (adsFilters.dateTo) {
              const dTo = new Date(adsFilters.dateTo);
              dTo.setHours(23, 59, 59, 999);
              matchDate = matchDate && new Date(ad.created_at) <= dTo;
            }

            return matchSearch && matchStatus && matchPkg && matchPay && matchDate;
          });

          const sortedAds = [...filteredAds].sort((a, b) => {
            const stA = (a.computed_status || a.status || "").toLowerCase();
            const stB = (b.computed_status || b.status || "").toLowerCase();
            const isAPendingOrRev = stA === "pending" || stA === "menunggu" || stA === "waiting_approval" || stA === "waiting_verification" || stA === "needs_revision" || a.payment_status === "pending";
            const isBPendingOrRev = stB === "pending" || stB === "menunggu" || stB === "waiting_approval" || stB === "waiting_verification" || stB === "needs_revision" || b.payment_status === "pending";

            if (isAPendingOrRev && !isBPendingOrRev) return -1;
            if (!isAPendingOrRev && isBPendingOrRev) return 1;

            const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
            const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
            if (dateB !== dateA) return dateB - dateA;
            return Number(b.id) - Number(a.id);
          });

          const totalAdPages = Math.ceil(sortedAds.length / adsPerPage) || 1;
          const currentAdPage = Math.min(Math.max(1, adPage), totalAdPages);
          const startIndex = (currentAdPage - 1) * adsPerPage;
          const displayedAds = sortedAds.slice(startIndex, startIndex + adsPerPage);

          return (
            <>
              {/* Filter Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Search input */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 transition-all focus-within:border-[#007570] focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari nama bisnis, email pengaju, atau paket iklan..."
                      value={adsFilters.search}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, search: e.target.value });
                        setAdPage(1);
                      }}
                      className="flex-1 border-0 outline-none bg-transparent text-xs text-slate-800 placeholder:text-slate-400"
                    />
                    {adsFilters.search && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdsFilters({ ...adsFilters, search: "" });
                          setAdPage(1);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer border-0 bg-transparent p-0"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <select
                      value={adsFilters.status}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, status: e.target.value });
                        setAdPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-[#007570] focus:bg-white transition-all min-w-[130px]"
                    >
                      <option value="">Semua Status</option>
                      <option value="pending">⏳ Pending Review</option>
                      <option value="needs_revision">🟡 Perlu Perbaikan</option>
                      <option value="approved">🟢 Aktif Tayang</option>
                      <option value="rejected">🔴 Ditolak</option>
                      <option value="expired">⚪ Kedaluwarsa</option>
                    </select>

                    <select
                      value={adsFilters.package}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, package: e.target.value });
                        setAdPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-[#007570] focus:bg-white transition-all min-w-[130px]"
                    >
                      <option value="">Semua Paket</option>
                      <option value="basic">Basic Iklan</option>
                      <option value="premium">Premium Ads</option>
                      <option value="standard">Standard Ads</option>
                      <option value="enterprise">Enterprise</option>
                    </select>

                    <select
                      value={adsFilters.payment}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, payment: e.target.value });
                        setAdPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer outline-none focus:border-[#007570] focus:bg-white transition-all min-w-[140px]"
                    >
                      <option value="">Semua Pembayaran</option>
                      <option value="paid">✓ Lunas</option>
                      <option value="pending">⏳ Menunggu Approval</option>
                      <option value="unpaid">✕ Belum Bayar</option>
                    </select>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 shrink-0"
                      onClick={() => {
                        setAdsFilters({ search: "", status: "", package: "", payment: "", dateFrom: "", dateTo: "" });
                        setAdPage(1);
                      }}
                      title="Reset Semua Filter"
                    >
                      <RefreshCw size={13} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Date range row */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Rentang Tanggal Pengajuan:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="date"
                      value={adsFilters.dateFrom}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, dateFrom: e.target.value });
                        setAdPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#007570] focus:outline-none text-xs text-slate-700"
                    />
                    <span>s/d</span>
                    <input
                      type="date"
                      value={adsFilters.dateTo}
                      onChange={(e) => {
                        setAdsFilters({ ...adsFilters, dateTo: e.target.value });
                        setAdPage(1);
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#007570] focus:outline-none text-xs text-slate-700"
                    />
                  </div>
                  {(adsFilters.search || adsFilters.status || adsFilters.package || adsFilters.payment || adsFilters.dateFrom || adsFilters.dateTo) && (
                    <span className="ml-auto text-xs font-bold text-[#007570] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Ditemukan {filteredAds.length} data
                    </span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
                      <tr>
                        <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Bisnis &amp; Pemilik</th>
                        <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Paket &amp; Biaya</th>
                        <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Status Iklan</th>
                        <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Status Pembayaran</th>
                        <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Tanggal Pengajuan</th>
                        <th className="px-[14px] py-[12px] text-center text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] w-[140px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAds.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center p-[32px]">
                            <div className="flex flex-col items-center justify-center p-[48px_24px] gap-[14px] text-[#94a3b8] text-center">
                              <Megaphone size={64} strokeWidth={1} className="opacity-[0.35]" />
                              <p className="text-[14px] text-[#64748b] font-medium">Belum ada pengajuan iklan yang sesuai.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedAds.map((ad) => (
                          <tr key={ad.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                            {/* Bisnis & Pemilik */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div className="flex items-center gap-[10px]">
                                <img
                                  src={getBusinessTablePhoto(ad.business)}
                                  alt={ad.business?.name}
                                  className="w-[36px] h-[36px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";
                                  }}
                                />
                                <div className="min-w-0">
                                  <span className="font-bold text-[#0f172a] block truncate max-w-[190px]">
                                    {ad.business?.name || "-"}
                                  </span>
                                  <span className="text-[11px] text-[#64748b] block truncate max-w-[190px]">
                                    {ad.user?.name || "-"} {ad.user?.email ? `• ${ad.user.email}` : ""}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Paket & Biaya */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12.5px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div>
                                <span className="inline-flex items-center px-[8px] py-[2px] bg-[rgba(0,117,112,0.1)] text-[#007570] rounded-[6px] text-[11px] font-bold">
                                  {ad.package_name || "Iklan Standard"}
                                </span>
                                <div className="flex items-center gap-[6px] mt-[2px] flex-wrap">
                                  {((ad.original_price && Number(ad.original_price) > Number(ad.price)) || (ad.discount_amount && Number(ad.discount_amount) > 0)) ? (
                                    <>
                                      <span className="text-[10.5px] text-[#94a3b8] line-through">
                                        Rp {Number(ad.original_price || (Number(ad.price || 0) + Number(ad.discount_amount || 0))).toLocaleString('id-ID')}
                                      </span>
                                      <span className="font-extrabold text-[#059669] text-[12px]">
                                        Rp {Number(ad.price || 0).toLocaleString('id-ID')}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-[#0f172a] text-[12px]">
                                      Rp {Number(ad.price || 0).toLocaleString('id-ID')}
                                    </span>
                                  )}
                                  {ad.duration && (
                                    <span className="text-[10.5px] text-[#64748b]">({ad.duration})</span>
                                  )}
                                </div>
                                {(ad.coupon_code || ad.coupon?.code || ad.used_referral_code || ad.referral_code || (ad.discount_amount && Number(ad.discount_amount) > 0) || (ad.original_price && Number(ad.original_price) > Number(ad.price))) && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold border border-emerald-300">
                                      🏷️ {ad.coupon_code || ad.coupon?.code || ad.used_referral_code || ad.referral_code || "KUPON"}
                                      {(ad.discount_amount && Number(ad.discount_amount) > 0) ? ` (-Rp ${Number(ad.discount_amount).toLocaleString('id-ID')})` : (ad.original_price && Number(ad.original_price) > Number(ad.price) ? ` (-Rp ${(Number(ad.original_price) - Number(ad.price)).toLocaleString('id-ID')})` : '')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status Iklan */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div>
                                <button
                                  type="button"
                                  className={`${getAdStatusBadgeClass(ad.computed_status || ad.status)} cursor-pointer hover:opacity-80 border-0 bg-transparent p-0`}
                                  onClick={() => handleToggleAdStatus(ad.id)}
                                  title="Klik untuk mengubah status iklan (Aktif/Nonaktif)"
                                >
                                  {getAdStatusLabel(ad.computed_status || ad.status)}
                                </button>
                                {ad.expired_at && (
                                  <span className="text-[10px] text-[#64748b] block mt-[2px]">
                                    Exp: {new Date(ad.expired_at).toLocaleDateString('id-ID')}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Status Pembayaran */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <span className={getBadgeClass(ad.payment_status)}>
                                {ad.payment_status === 'paid' ? 'Lunas' : ad.payment_status === 'pending' ? 'Menunggu Approval' : ad.payment_status === 'unpaid' ? 'Belum Bayar' : ad.payment_status || '-'}
                              </span>
                            </td>

                            {/* Tanggal Pengajuan */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[12px] text-[#475569] font-medium align-middle [tr:last-child_&]:border-b-0 whitespace-nowrap">
                              {ad.created_at ? new Date(ad.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                            </td>

                            {/* Aksi */}
                            <td className="px-[14px] py-[10px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] font-medium align-middle [tr:last-child_&]:border-b-0">
                              <div className="flex items-center justify-center gap-[4px]">
                                <button
                                  type="button"
                                  className="w-[28px] h-[28px] bg-[#f1f5f9] text-[#0f172a] border-0 rounded-[6px] cursor-pointer transition-all flex items-center justify-center hover:bg-[#007570] hover:text-white"
                                  onClick={() => handleModal("viewAdDetail", ad)}
                                  title="Lihat Detail Iklan"
                                >
                                  <Eye size={14} strokeWidth={2} />
                                </button>
                                {/* Setujui button: untuk pending dan needs_revision */}
                                {(ad.status === "pending" || ad.status === "needs_revision" || ad.computed_status === "waiting_approval" || ad.computed_status === "pending") && ad.status !== "rejected" && ad.status !== "cancelled" && ad.status !== "expired" && ad.status !== "inactive" && ad.status !== "approved" && ad.status !== "active" && (
                                  <button
                                    type="button"
                                    className="w-[28px] h-[28px] bg-[#dcfce7] text-[#16a34a] border-0 rounded-[6px] cursor-pointer transition-all flex items-center justify-center hover:bg-[#16a34a] hover:text-white"
                                    onClick={() => handleApproveAd(ad.id)}
                                    title="Terima / Setujui Iklan"
                                  >
                                    <Check size={14} strokeWidth={2} />
                                  </button>
                                )}
                                {/* Perbaikan button: untuk pending dan needs_revision */}
                                {(ad.status === "pending" || ad.status === "needs_revision") && (
                                  <button
                                    type="button"
                                    className="w-[28px] h-[28px] bg-[#fef3c7] text-[#b45309] border-0 rounded-[6px] cursor-pointer transition-all flex items-center justify-center hover:bg-[#b45309] hover:text-white"
                                    onClick={() => handleOpenRevisionModal("advertisement", ad)}
                                    title="Minta Perbaikan (Revisi Bukti)"
                                  >
                                    <AlertTriangle size={14} strokeWidth={2} />
                                  </button>
                                )}
                                {/* Tolak button: untuk pending dan needs_revision */}
                                {ad.status !== "approved" && ad.status !== "active" && ad.status !== "rejected" && ad.status !== "cancelled" && ad.status !== "inactive" && ad.status !== "expired" && (
                                  <button
                                    type="button"
                                    className="w-[28px] h-[28px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[6px] cursor-pointer transition-all flex items-center justify-center hover:bg-[#dc2626] hover:text-white"
                                    onClick={() => {
                                      setRejectMode("reject");
                                      handleRejectAd(ad);
                                    }}
                                    title="Tolak Iklan (Permanen)"
                                  >
                                    <X size={14} strokeWidth={2} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="w-[28px] h-[28px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[6px] cursor-pointer transition-all flex items-center justify-center hover:bg-[#dc2626] hover:text-white"
                                  onClick={() => handleModal("deleteAd", ad)}
                                  title="Hapus Iklan"
                                >
                                  <Trash2 size={14} strokeWidth={2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ad Pagination Controls */}
                {filteredAds.length > adsPerPage && (
                  <div className="flex items-center justify-between p-[14px_18px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px] bg-[#fafafa]">
                    <span className="text-[#64748b] font-medium">
                      Menampilkan {startIndex + 1} - {Math.min(startIndex + adsPerPage, filteredAds.length)} dari {filteredAds.length} pesanan iklan
                    </span>
                    {renderAdminPagination(currentAdPage, totalAdPages, setAdPage)}
                  </div>
                )}
              </div>
            </>
          );
        })()}

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
  };



  // ── Kelola Blog & Event View ──
  const renderBlogs = () => {
    // Filter out unsubmitted drafts & unpaid initial steps from Admin View completely
    const safeBlogs = Array.isArray(blogs) ? blogs : [];
    const activeBlogs = safeBlogs.filter((b) => {
      const st = (b?.status || "").toLowerCase();
      return st !== "draft" && st !== "waiting_payment";
    });

    const totalBlogsCount = activeBlogs.filter((b) => b?.type !== "event").length;
    const totalEventsCount = activeBlogs.filter((b) => b?.type === "event").length;
    const pendingCount = activeBlogs.filter((b) => b?.status === "pending").length;
    const approvedCount = activeBlogs.filter((b) => b?.status === "approved" || b?.status === "published").length;
    const totalViews = activeBlogs.reduce((sum, b) => sum + Number(b?.views || 0), 0);

    const categoriesList = Array.from(
      new Set(activeBlogs.map((b) => b?.blog_category || b?.category?.name).filter(Boolean))
    );

    const filteredBlogs = activeBlogs.filter((item) => {
      if (!item) return false;
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

    const sortedBlogs = [...filteredBlogs].sort((a, b) => {
      const stA = (a?.status || "").toLowerCase();
      const stB = (b?.status || "").toLowerCase();
      const isAPendingOrRev = stA === "pending" || stA === "menunggu" || stA === "waiting_verification" || stA === "needs_revision" || stA === "revision";
      const isBPendingOrRev = stB === "pending" || stB === "menunggu" || stB === "waiting_verification" || stB === "needs_revision" || stB === "revision";

      if (isAPendingOrRev && !isBPendingOrRev) return -1;
      if (!isAPendingOrRev && isBPendingOrRev) return 1;

      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const perPage = 10;
    const totalPages = Math.ceil(sortedBlogs.length / perPage) || 1;
    const currentBlogPage = Math.min(Math.max(1, blogPage), totalPages);
    const paginatedBlogs = sortedBlogs.slice((currentBlogPage - 1) * perPage, currentBlogPage * perPage);

    // Filtered transactions for the transactions tab
    const safeContentTx = Array.isArray(contentTransactions) ? contentTransactions : [];
    const filteredTransactions = safeContentTx.filter((tx) => {
      if (!tx) return false;
      if (contentTxTypeFilter !== "all" && tx.content_type !== contentTxTypeFilter && tx.type !== contentTxTypeFilter) {
        return false;
      }
      if (contentTxStatusFilter !== "all" && tx.payment_status !== contentTxStatusFilter) {
        return false;
      }
      if (contentTxSearch) {
        const q = contentTxSearch.toLowerCase();
        const code = (tx.transaction_code || "").toLowerCase();
        const userName = (tx.user?.name || "").toLowerCase();
        const userEmail = (tx.user?.email || "").toLowerCase();
        const blogTitle = (tx.blog?.title || "").toLowerCase();
        return code.includes(q) || userName.includes(q) || userEmail.includes(q) || blogTitle.includes(q);
      }
      return true;
    }).sort((a, b) => {
      const isAPending = a?.payment_status === "pending" || a?.payment_status === "waiting_verification" || a?.payment_status === "needs_revision";
      const isBPending = b?.payment_status === "pending" || b?.payment_status === "waiting_verification" || b?.payment_status === "needs_revision";
      if (isAPending && !isBPending) return -1;
      if (!isAPending && isBPending) return 1;
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const pendingTxCount = safeContentTx.filter((t) => t?.payment_status === "pending").length;

    return (
      <div className="flex flex-col gap-[20px] mb-[28px]">
        {/* Header & Description */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[14px] bg-white p-[20px_24px] rounded-[16px] border border-[#e2e8f0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-black text-[#0f172a] tracking-tight">
                Info & Event
              </h2>
              <span className="bg-teal-100 text-[#007570] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Kelola Konten & Tarif
              </span>
            </div>
            <p className="text-[12.5px] text-[#64748b] mt-[3px]">
              Kelola publikasi artikel info, agenda event, tarif posting (Pay-Per-Post), serta verifikasi pembayaran pengguna secara terpadu.
            </p>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={() => {
                fetchAllData();
                fetchContentPricing();
                if (blogMainTab === "transactions") {
                  fetchContentTransactions(contentTxPage || 1);
                }
              }}
              className="inline-flex items-center gap-[6px] px-[14px] py-[9px] rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[12.5px] font-bold hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw size={14} className={loadingContentTransactions ? "animate-spin" : ""} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Primary Sub-Tab Switcher for Info & Event */}
        <div className="flex items-center gap-[8px] bg-[#f1f5f9] p-[5px] rounded-[12px] w-fit flex-wrap">
          <button
            onClick={() => setBlogMainTab("content")}
            className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${blogMainTab === "content"
                ? "bg-white text-[#007570] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <FileText size={16} />
            <span>Daftar Info &amp; Event ({activeBlogs.length})</span>
          </button>
          <button
            onClick={() => {
              setBlogMainTab("pricing");
              fetchContentPricing();
            }}
            className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${blogMainTab === "pricing"
                ? "bg-white text-[#007570] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <DollarSign size={16} />
            <span>Biaya Publikasi (Tarif)</span>
          </button>
          <button
            onClick={() => {
              setBlogMainTab("transactions");
              fetchContentTransactions(1);
            }}
            className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${blogMainTab === "transactions"
                ? "bg-white text-[#007570] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <CreditCard size={16} />
            <span>Transaksi &amp; Pembayaran</span>
            {(stats.pendingContentPayments > 0 || pendingTxCount > 0) && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full">
                {stats.pendingContentPayments || pendingTxCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Subtab 1: Daftar Konten ── */}
        {blogMainTab === "content" && (
          <div className="flex flex-col gap-[20px]">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-[14px]">
              <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Total Publikasi</span>
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-[#f0fdfa] text-[#007570] flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                </div>
                <span className="text-[22px] font-bold text-[#0f172a]">{activeBlogs.length}</span>
                <span className="text-[11px] text-[#64748b]">Keseluruhan publikasi</span>
              </div>

              <div className="bg-white rounded-[14px] p-[16px] border border-[#e2e8f0] shadow-sm flex flex-col gap-[8px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-[#64748b] uppercase tracking-wider">Artikel &amp; Info</span>
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
                    className={`px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${blogTab === "all"
                        ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        : "text-[#64748b] hover:text-[#0f172a]"
                      }`}
                  >
                    Semua Konten ({activeBlogs.length})
                  </button>
                  <button
                    onClick={() => { setBlogTab("blog"); setBlogPage(1); }}
                    className={`flex items-center gap-[6px] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${blogTab === "blog"
                        ? "bg-white text-[#007570] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                        : "text-[#64748b] hover:text-[#0f172a]"
                      }`}
                  >
                    <FileText size={15} />
                    <span>Artikel & Blog ({totalBlogsCount})</span>
                  </button>
                  <button
                    onClick={() => { setBlogTab("event"); setBlogPage(1); }}
                    className={`flex items-center gap-[6px] px-[16px] py-[7px] rounded-[8px] text-[13px] font-semibold transition-all ${blogTab === "event"
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
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                      <th className="px-[14px] py-[11px]">Judul &amp; Konten</th>
                      <th className="px-[14px] py-[11px]">Penulis &amp; Kategori</th>
                      <th className="px-[14px] py-[11px]">Waktu &amp; Views</th>
                      <th className="px-[14px] py-[11px]">Status</th>
                      <th className="px-[14px] py-[11px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-[12.5px] text-[#0f172a]">
                    {paginatedBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-[16px] py-[40px] text-center text-[#94a3b8] text-[13px]">
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
                            <td className="px-[14px] py-[10px]">
                              <div className="flex items-center gap-[10px]">
                                <img
                                  src={getStorageUrl(row.thumbnail || row.img || row.image) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop"}
                                  alt={row.title}
                                  className="w-[42px] h-[42px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop";
                                  }}
                                />
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-[5px] flex-wrap">
                                    <span className="font-mono text-[9.5px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                                      #{row.id}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-[5px] py-[1px] rounded-[4px] uppercase ${isEvent
                                          ? "bg-[#f3e8ff] text-[#7e22ce]"
                                          : "bg-[#e0f2fe] text-[#0369a1]"
                                        }`}
                                    >
                                      {isEvent ? "Event" : "Info"}
                                    </span>
                                    {(row.coupon_code || (row.discount_amount && Number(row.discount_amount) > 0)) && (
                                      <span className="text-[9.5px] font-bold px-[5px] py-[1px] rounded-[4px] bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                                        <Tag size={9} />
                                        <span>{row.coupon_code || "Kupon"}</span>
                                      </span>
                                    )}
                                    <span className="font-bold text-[#0f172a] truncate max-w-[240px]">
                                      {row.title}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-[#64748b] truncate max-w-[260px] mt-[1px]">
                                    {row.excerpt || row.description || "Tidak ada deskripsi singkat."}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Penulis & Kategori */}
                            <td className="px-[14px] py-[10px]">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#0f172a]">
                                  {row.user?.name || row.author || "Admin"}
                                </span>
                                <span className="inline-flex items-center px-[6px] py-[1.5px] bg-[#f1f5f9] text-[#475569] rounded-[4px] text-[10.5px] font-semibold w-fit mt-[2px]">
                                  {row.blog_category || row.category?.name || "Umum"}
                                </span>
                              </div>
                            </td>

                            {/* Detail Waktu & Views */}
                            <td className="px-[14px] py-[10px]">
                              <div className="flex flex-col text-[11.5px] text-[#64748b]">
                                {isEvent ? (
                                  <>
                                    <span className="font-medium text-[#7e22ce] flex items-center gap-[3px]">
                                      <Calendar size={12} /> {row.event_date ? new Date(row.event_date).toLocaleDateString("id-ID") : "Tanggal TBD"}
                                    </span>
                                    <span className="truncate max-w-[140px]">📍 {row.event_location || "Lokasi TBD"}</span>
                                  </>
                                ) : (
                                  <span>📅 {row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-"}</span>
                                )}
                                <span className="text-[11px] font-semibold text-[#64748b] mt-[1px]">
                                  👁️ {Number(row.views || 0).toLocaleString("id-ID")} views
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-[14px] py-[10px]">
                              {row.status === "published" || row.status === "approved" ? (
                                <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#15803d]">
                                  Disetujui
                                </span>
                              ) : row.status === "needs_revision" || row.status === "revision" ? (
                                <div>
                                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[11px] font-bold bg-[#fef3c7] text-[#b45309]">
                                    Perlu Perbaikan
                                  </span>
                                  {row.rejection_reason && (
                                    <div className="text-[10.5px] text-[#d97706] italic mt-[2px] truncate max-w-[160px]" title={row.rejection_reason}>
                                      Alasan: {row.rejection_reason}
                                    </div>
                                  )}
                                </div>
                              ) : row.status === "rejected" ? (
                                <div>
                                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[11px] font-bold bg-[#fee2e2] text-[#b91c1c]">
                                    Ditolak
                                  </span>
                                  {row.rejection_reason && (
                                    <div className="text-[10.5px] text-[#dc2626] italic mt-[2px] truncate max-w-[160px]" title={row.rejection_reason}>
                                      Alasan: {row.rejection_reason}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[11px] font-bold bg-[#f1f5f9] text-[#475569]">
                                  {row.status === "pending" ? "Menunggu" : (row.status || "Draft")}
                                </span>
                              )}
                            </td>

                            {/* Aksi */}
                            <td className="px-[14px] py-[10px] text-right">
                              <div className="flex items-center justify-end gap-[4px]">
                                {row.status !== "approved" && row.status !== "published" && row.status !== "rejected" && (
                                  <button
                                    onClick={() => handleApproveBlog(row.id)}
                                    className="px-[7px] py-[3.5px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold hover:bg-[#16a34a] hover:text-white transition-all flex items-center gap-[2px]"
                                    title="Setujui (Approve)"
                                  >
                                    <Check size={12} /> Setujui
                                  </button>
                                )}
                                {row.status !== "approved" && row.status !== "published" && row.status !== "rejected" && (
                                  <button
                                    onClick={() => handleOpenRevisionModal("blog", row)}
                                    className="px-[7px] py-[3.5px] bg-[#fef3c7] text-[#b45309] rounded-[6px] text-[11px] font-bold hover:bg-[#f59e0b] hover:text-white transition-all flex items-center gap-[2px] cursor-pointer"
                                    title="Minta Perbaikan Konten"
                                  >
                                    <AlertTriangle size={12} /> Perbaikan
                                  </button>
                                )}
                                {row.status !== "approved" && row.status !== "published" && row.status !== "rejected" && (
                                  <button
                                    onClick={() => handleDirectRejectBlog(row)}
                                    className="px-[7px] py-[3.5px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11px] font-bold hover:bg-[#dc2626] hover:text-white transition-all flex items-center gap-[2px]"
                                    title="Tolak (Reject)"
                                  >
                                    <X size={12} /> Tolak
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    const identifier = row.slug || row.id;
                                    window.open(`/blog/${identifier}`, '_blank');
                                  }}
                                  className="p-[5px] bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7] rounded-[6px] transition-colors cursor-pointer"
                                  title={`Lihat Halaman ${row.type === 'event' ? 'Event' : 'Artikel'} Langsung`}
                                >
                                  <ExternalLink size={13} />
                                </button>

                                <button
                                  onClick={() => handleOpenBlogDetail(row)}
                                  className="p-[5px] bg-[#f0fdfa] text-[#007570] hover:bg-[#ccfbf1] rounded-[6px] transition-colors cursor-pointer"
                                  title="Lihat Detail Konten & Bukti Transaksi"
                                >
                                  <Eye size={13} />
                                </button>

                                <button
                                  onClick={() => setModal({ show: true, type: "deleteBlog", data: row })}
                                  className="p-[5px] bg-[#fef2f2] text-[#dc2626] rounded-[6px] hover:bg-[#fee2e2]"
                                  title="Hapus Blog / Event"
                                >
                                  <Trash2 size={13} />
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
              {filteredBlogs.length > perPage && (
                <div className="flex items-center justify-between pt-[14px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px]">
                  <span className="text-[#64748b] font-medium">
                    Menampilkan {(blogPage - 1) * perPage + 1} - {Math.min(blogPage * perPage, filteredBlogs.length)} dari {filteredBlogs.length} konten
                  </span>
                  {renderAdminPagination(blogPage, totalPages, setBlogPage)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Subtab 2: Atur Biaya Publikasi (Pricing) ── */}
        {blogMainTab === "pricing" && (
          <div className="flex flex-col gap-[20px]">
            {/* Info Notice */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 text-xs text-slate-700 flex items-start gap-3">
              <Shield size={20} className="text-[#007570] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Mekanisme Tarif Publikasi Info &amp; Event</strong>
                <p className="leading-relaxed">
                  Atur tarif publikasi artikel liputan bisnis serta agenda event festival. Anda dapat menentukan nominal biaya (Rp), durasi masa aktif posting, serta deskripsi ketentuan sesuai kebutuhan platform.
                </p>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Fee Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007570] border border-teal-200 flex items-center justify-center font-bold">
                      <FileText size={24} />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${contentPricing.blog?.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${contentPricing.blog?.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {contentPricing.blog?.is_active ? "Tarif Aktif" : "Nonaktif (Gratis)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kategori Publikasi
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {contentPricing.blog?.name || "Biaya Publikasi Info (Artikel & Berita)"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {contentPricing.blog?.description || "Biaya yang dibayarkan oleh pengguna untuk menerbitkan artikel info atau liputan berita usaha di platform Surade.com."}
                    </p>
                  </div>

                  {/* Price & Duration Box */}
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Biaya per 1x Posting:</span>
                      <span className="text-[11px] font-bold text-teal-700 mt-0.5 block">
                        Masa Aktif: {contentPricing.blog?.formatted_duration || "1 Bulan (30 Hari)"}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[#007570]">
                      Rp {Number(contentPricing.blog?.price || 10000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Terakhir diperbarui sistem</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPricingType("blog");
                      setPricingEditForm({
                        name: contentPricing.blog?.name || "Publikasi Info (Artikel & Berita)",
                        description: contentPricing.blog?.description || "Biaya yang dibayarkan oleh pengguna untuk menerbitkan artikel info promosi di platform Surade.com.",
                        price: Number(contentPricing.blog?.price || 10000),
                        duration_value: Number(contentPricing.blog?.duration_value || 1),
                        duration_unit: contentPricing.blog?.duration_unit || "month",
                        is_active: Boolean(contentPricing.blog?.is_active),
                      });
                      setModal({ show: true, type: "editContentPricing", data: { type: "blog" } });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Biaya Info</span>
                  </button>
                </div>
              </div>

              {/* Event Fee Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                      <Calendar size={24} />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${contentPricing.event?.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${contentPricing.event?.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {contentPricing.event?.is_active ? "Tarif Aktif" : "Nonaktif (Gratis)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kategori Publikasi
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {contentPricing.event?.name || "Biaya Publikasi Event (Agenda Acara)"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {contentPricing.event?.description || "Biaya yang dibayarkan oleh pengguna untuk menerbitkan agenda acara / event festival di platform Surade.com."}
                    </p>
                  </div>

                  {/* Price & Duration Box */}
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Biaya per 1x Posting:</span>
                      <span className="text-[11px] font-bold text-purple-700 mt-0.5 block">
                        Masa Aktif: {contentPricing.event?.formatted_duration || "1 Bulan (30 Hari)"}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-purple-700">
                      Rp {Number(contentPricing.event?.price || 15000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Terakhir diperbarui sistem</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPricingType("event");
                      setPricingEditForm({
                        name: contentPricing.event?.name || "Publikasi Event (Agenda Acara)",
                        description: contentPricing.event?.description || "Biaya yang dibayarkan oleh pengguna untuk menerbitkan agenda acara / event di platform Surade.com.",
                        price: Number(contentPricing.event?.price || 15000),
                        duration_value: Number(contentPricing.event?.duration_value || 1),
                        duration_unit: contentPricing.event?.duration_unit || "month",
                        is_active: Boolean(contentPricing.event?.is_active),
                      });
                      setModal({ show: true, type: "editContentPricing", data: { type: "event" } });
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Biaya Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Subtab 3: Transaksi & Pembayaran Pay-Per-Post ── */}
        {blogMainTab === "transactions" && (
          <div className="flex flex-col gap-[16px]">
            {/* Stats Overview Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pendapatan Blog</span>
                <span className="text-base font-black text-[#007570] mt-1 block">
                  Rp {Number(stats.blogRevenue || 0).toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.totalBlogTransactions || 0} posting lunas</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pendapatan Event</span>
                <span className="text-base font-black text-purple-700 mt-1 block">
                  Rp {Number(stats.eventRevenue || 0).toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.totalEventTransactions || 0} event lunas</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Omset</span>
                <span className="text-base font-black text-slate-900 mt-1 block">
                  Rp {Number(stats.totalContentRevenue || ((stats.blogRevenue || 0) + (stats.eventRevenue || 0))).toLocaleString("id-ID")}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Publikasi Konten</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
                <span className="text-base font-black text-blue-700 mt-1 block">
                  {(stats.totalBlogTransactions || 0) + (stats.totalEventTransactions || 0)}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">Semua waktu</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/40 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Perlu Konfirmasi</span>
                <span className="text-base font-black text-amber-800 mt-1 block">
                  {stats.pendingContentPayments || 0}
                </span>
                <span className="text-[11px] text-amber-600 mt-0.5 block">Transaksi pending</span>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {[
                { id: "pending", label: "Menunggu Konfirmasi", count: contentTransactions.filter((t) => t.payment_status === "pending").length, badgeCls: "bg-amber-100 text-amber-800 border-amber-300" },
                { id: "paid", label: "Selesai (Lunas)", count: contentTransactions.filter((t) => t.payment_status === "paid").length, badgeCls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                { id: "failed", label: "Ditolak", count: contentTransactions.filter((t) => t.payment_status === "failed").length, badgeCls: "bg-rose-100 text-rose-800 border-rose-300" },
                { id: "all", label: "Semua Riwayat", count: contentTransactions.length, badgeCls: "bg-slate-100 text-slate-700 border-slate-200" },
              ].map((tab) => {
                const isActive = contentTxStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setContentTxStatusFilter(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${isActive
                        ? "bg-[#007570] text-white border-[#007570] shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${isActive ? "bg-white/20 text-white border-white/30" : tab.badgeCls}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-[16px_20px] rounded-[16px] border border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-[12px] shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode transaksi, pembeli, email, atau judul posting..."
                  value={contentTxSearch}
                  onChange={(e) => setContentTxSearch(e.target.value)}
                  className="w-full pl-[38px] pr-[14px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#007570] focus:ring-1 focus:ring-[#007570]"
                />
              </div>

              <div className="flex items-center gap-[10px] w-full md:w-auto overflow-x-auto">
                <select
                  value={contentTxTypeFilter}
                  onChange={(e) => setContentTxTypeFilter(e.target.value)}
                  className="px-[12px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[12.5px] font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#007570] cursor-pointer"
                >
                  <option value="all">Semua Tipe Konten</option>
                  <option value="blog">Posting Blog</option>
                  <option value="event">Posting Event</option>
                </select>

                <select
                  value={contentTxStatusFilter}
                  onChange={(e) => setContentTxStatusFilter(e.target.value)}
                  className="px-[12px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[12.5px] font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#007570] cursor-pointer"
                >
                  <option value="all">Semua Status Bayar</option>
                  <option value="pending">Menunggu (Pending)</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="failed">Ditolak (Failed)</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[16px] border border-[#e2e8f0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-black text-[#64748b] uppercase tracking-wider">
                      <th className="p-[14px_18px]">Transaksi</th>
                      <th className="p-[14px_16px]">Pembeli</th>
                      <th className="p-[14px_16px]">Konten Terkait</th>
                      <th className="p-[14px_16px]">Total Bayar</th>
                      <th className="p-[14px_16px] text-center">Bukti Bayar</th>
                      <th className="p-[14px_16px] text-center">Status</th>
                      <th className="p-[14px_18px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-[12.5px]">
                    {loadingContentTransactions ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center">
                          <SuradeLoader variant="section" size="sm" text="Memuat daftar transaksi" minHeight="160px" />
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-[60px] text-center text-slate-400">
                          <CreditCard size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-slate-700">Tidak ada data transaksi</p>
                          <p className="text-[11.5px]">Tidak ada transaksi pay-per-post yang cocok dengan filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isBlog = tx.content_type === "blog";
                        const proofUrl = tx.payment_proof ? getStorageUrl(tx.payment_proof) : null;
                        const isPaid = tx.payment_status === "paid";
                        const isPending = tx.payment_status === "pending";

                        return (
                          <tr key={tx.id} className="hover:bg-[#f8fafc] transition-colors">
                            {/* Transaksi Code & Date */}
                            <td className="p-[14px_18px]">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-[#0f172a] text-[13px]">
                                  {tx.transaction_code}
                                </span>
                                <span className="text-[11px] text-[#94a3b8]">
                                  {tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : "-"}
                                </span>
                                {tx.notes && (
                                  <span className="text-[10.5px] text-rose-500 font-medium mt-0.5 truncate max-w-[180px]" title={tx.notes}>
                                    Catatan: {tx.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Pembeli */}
                            <td className="p-[14px_16px]">
                              <div className="flex items-center gap-2">
                                <img
                                  src={tx.user?.profile_picture ? getStorageUrl(tx.user.profile_picture) : DEFAULT_AVATAR}
                                  alt={tx.user?.name || "User"}
                                  className="w-[28px] h-[28px] rounded-full object-cover border border-[#e2e8f0]"
                                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#0f172a] text-[12.5px] leading-tight">
                                    {tx.user?.name || "Pengguna"}
                                  </span>
                                  <span className="text-[11px] text-[#64748b]">
                                    {tx.user?.email || "-"}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Konten Terkait */}
                            <td className="p-[14px_16px]">
                              <div className="flex flex-col max-w-[240px]">
                                <span className="font-bold text-[#0f172a] truncate" title={tx.blog?.title || "-"}>
                                  {tx.blog?.title || "-"}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isBlog ? "bg-teal-50 text-[#007570]" : "bg-purple-50 text-purple-700"
                                    }`}>
                                    {isBlog ? "Blog" : "Event"}
                                  </span>
                                  {tx.blog?.blog_category && (
                                    <span className="text-[11px] text-slate-400">
                                      • {tx.blog.blog_category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Total Bayar */}
                            <td className="p-[14px_16px]">
                              <div className="flex flex-col">
                                <span className="font-black text-[#0f172a] text-[13px]">
                                  Rp {Number(tx.amount || 0).toLocaleString("id-ID")}
                                </span>
                                <span className="text-[10.5px] text-[#64748b] uppercase">
                                  {tx.payment_method || "Transfer Bank"}
                                </span>
                              </div>
                            </td>

                            {/* Bukti Bayar */}
                            <td className="p-[14px_16px] text-center">
                              {proofUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setModal({ show: true, type: "viewImage", data: { image: proofUrl, title: `Bukti Bayar: ${tx.transaction_code}` } })}
                                  className="relative group inline-block rounded-lg overflow-hidden border border-slate-200 hover:border-[#007570] transition-all cursor-pointer"
                                  title="Lihat Bukti Transfer"
                                >
                                  <img src={proofUrl} alt="Bukti" className="w-10 h-10 object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Tidak Ada</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-[14px_16px] text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-bold ${isPaid
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isPending
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"}`} />
                                {isPaid ? "Lunas" : isPending ? "Menunggu" : "Ditolak"}
                              </span>
                            </td>

                            {/* Aksi */}
                            <td className="p-[14px_18px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApproveContentTx(tx)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                      title="Setujui Pembayaran & Publish Konten"
                                    >
                                      <Check size={14} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedContentTx(tx);
                                        setContentTxRejectReason("");
                                        setModal({ show: true, type: "rejectContentTx", data: tx });
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                      title="Tolak Pembayaran"
                                    >
                                      <CloseIcon size={14} strokeWidth={2.5} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setModal({ show: true, type: "viewContentTxDetail", data: tx })}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                                  title="Rincian Lengkap"
                                >
                                  <Eye size={14} />
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

              {/* Transactions Pagination */}
              {contentTxTotalPages > 1 && (
                <div className="flex items-center justify-between p-[14px_20px] border-t border-[#e2e8f0] bg-[#f8fafc]">
                  <span className="text-[12px] text-[#64748b]">
                    Halaman {contentTxPage} dari {contentTxTotalPages} (Total {contentTxTotalItems} transaksi)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={contentTxPage <= 1}
                      onClick={() => fetchContentTransactions(contentTxPage - 1)}
                      className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white text-[12px] font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={contentTxPage >= contentTxTotalPages}
                      onClick={() => fetchContentTransactions(contentTxPage + 1)}
                      className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white text-[12px] font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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

    const sortedReports = [...filteredReports].sort((a, b) => {
      const isAPendingOrProc = a.status === "baru" || a.status === "pending" || a.status === "diproses" || a.status === "investigating";
      const isBPendingOrProc = b.status === "baru" || b.status === "pending" || b.status === "diproses" || b.status === "investigating";

      if (isAPendingOrProc && !isBPendingOrProc) return -1;
      if (!isAPendingOrProc && isBPendingOrProc) return 1;

      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const perPage = 10;
    const totalPages = Math.ceil(sortedReports.length / perPage) || 1;
    const currentReportPage = Math.min(Math.max(1, reportPage), totalPages);
    const paginatedReports = sortedReports.slice((currentReportPage - 1) * perPage, currentReportPage * perPage);

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
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${reportTypeTab === "all" ? "bg-white text-[#007570] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
              >
                Semua Report ({reportsList.length})
              </button>
              <button
                onClick={() => { setReportTypeTab("business"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${reportTypeTab === "business" ? "bg-white text-[#007570] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
              >
                🏬 Usaha ({bizReportCount})
              </button>
              <button
                onClick={() => { setReportTypeTab("blog"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${reportTypeTab === "blog" ? "bg-white text-[#1d4ed8] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
              >
                📝 Blog ({blogReportCount})
              </button>
              <button
                onClick={() => { setReportTypeTab("event"); setReportPage(1); }}
                className={`px-[14px] py-[6px] rounded-[8px] text-[12.5px] font-semibold transition-all ${reportTypeTab === "event" ? "bg-white text-[#7e22ce] shadow-sm" : "text-[#64748b] hover:text-[#0f172a]"
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
                  <th className="px-[14px] py-[11px]">ID &amp; Pelapor</th>
                  <th className="px-[14px] py-[11px]">Konten yang Dilaporkan</th>
                  <th className="px-[14px] py-[11px]">Alasan Pengaduan</th>
                  <th className="px-[14px] py-[11px]">Tanggal &amp; Status</th>
                  <th className="px-[14px] py-[11px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[12.5px] text-[#0f172a]">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-[16px] py-[36px] text-center text-[#94a3b8]">
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
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#007570] font-mono text-[11px]">
                              #REP-{String(row.id).padStart(3, "0")}
                            </span>
                            <span className="font-bold text-[#0f172a] mt-[1px]">
                              {row.reporter_name}
                            </span>
                            <span className="text-[10.5px] text-[#64748b]">{row.reporter_email}</span>
                          </div>
                        </td>

                        {/* Jenis & Konten */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={getStorageUrl(row.content_image) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&h=80&fit=crop"}
                              alt={row.content_name}
                              className="w-[36px] h-[36px] rounded-[6px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=80&h=80&fit=crop";
                              }}
                            />
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-[5px]">
                                <span className={`text-[9.5px] font-bold px-[5px] py-[1px] rounded-[4px] uppercase w-fit ${typeBadge}`}>
                                  {isBiz ? "Usaha" : isBlog ? "Blog" : "Event"}
                                </span>
                                <span className="font-bold text-[#0f172a] truncate max-w-[180px]">
                                  {row.content_name}
                                </span>
                              </div>
                              <span className="text-[10.5px] text-[#64748b] mt-[1px] truncate max-w-[200px]">
                                Pemilik: <span className="font-medium text-[#475569]">{row.content_owner}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Alasan Report */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#dc2626]">{row.reason}</span>
                            {row.description && (
                              <span className="text-[10.5px] text-[#64748b] truncate max-w-[220px] mt-[1px]">
                                {row.description}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tanggal & Status */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col gap-[3px]">
                            <span className={`inline-flex items-center px-[7px] py-[1.5px] rounded-[5px] text-[10.5px] font-bold uppercase w-fit ${statusBadge}`}>
                              {row.status}
                            </span>
                            <span className="text-[11px] text-[#64748b] whitespace-nowrap">
                              📅 {row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-"}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-[14px] py-[10px] text-right">
                          <div className="flex items-center justify-end gap-[4px]">
                            <button
                              onClick={() => setModal({ show: true, type: "viewReportDetail", data: row })}
                              className="px-[7px] py-[3.5px] bg-[#f1f5f9] text-[#007570] rounded-[6px] text-[11px] font-bold hover:bg-[#007570] hover:text-white transition-all"
                            >
                              Detail
                            </button>

                            {row.status === "baru" && (
                              <button
                                onClick={() => handleUpdateReportStatus(row.id, "diproses")}
                                className="px-[7px] py-[3.5px] bg-[#e0f2fe] text-[#0284c7] rounded-[6px] text-[11px] font-bold hover:bg-[#0284c7] hover:text-white transition-all"
                              >
                                Proses
                              </button>
                            )}

                            {row.status !== "selesai" && (
                              <button
                                onClick={() => setModal({ show: true, type: "deleteReportedContent", data: row })}
                                className="px-[7px] py-[3.5px] bg-[#fee2e2] text-[#dc2626] rounded-[6px] text-[11px] font-bold hover:bg-[#dc2626] hover:text-white transition-all"
                                title="Hapus Konten yang Melanggar"
                              >
                                Hapus
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
          {filteredReports.length > perPage && (
            <div className="flex items-center justify-between pt-[14px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px]">
              <span className="text-[#64748b] font-medium">
                Menampilkan {(reportPage - 1) * perPage + 1} - {Math.min(reportPage * perPage, filteredReports.length)} dari {filteredReports.length} report
              </span>
              {renderAdminPagination(reportPage, totalPages, setReportPage)}
            </div>
          )}
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
            <input
              type="text"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.site_name}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, site_name: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Logo</label>
            {settings.general?.site_logo && (
              <div className="mb-[8px]">
                <img
                  src={getStorageUrl(settings.general.site_logo)}
                  alt="Current Logo"
                  className="h-[60px] object-contain rounded-[6px] border border-[#e2e8f0]"
                />
              </div>
            )}
            <input
              type="file"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              accept="image/*"
              onChange={(e) => setSettingsForm(prev => ({ ...prev, site_logo: e.target.files[0] }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Banner</label>
            {settings.general?.site_banner && (
              <div className="mb-[8px]">
                <img
                  src={getStorageUrl(settings.general.site_banner)}
                  alt="Current Banner"
                  className="h-[80px] w-full object-cover rounded-[6px] border border-[#e2e8f0]"
                />
              </div>
            )}
            <input
              type="file"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              accept="image/*"
              onChange={(e) => setSettingsForm(prev => ({ ...prev, site_banner: e.target.files[0] }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Kontak</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Email</label>
            <input
              type="email"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.contact_email}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, contact_email: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Telepon</label>
            <input
              type="tel"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.contact_phone}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, contact_phone: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Alamat</label>
            <textarea
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] resize-y min-h-[70px]"
              value={settingsForm.contact_address}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, contact_address: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">Media Sosial</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Instagram</label>
            <input
              type="url"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.social_instagram}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, social_instagram: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Facebook</label>
            <input
              type="url"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.social_facebook}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, social_facebook: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">            <Globe size={16} strokeWidth={2} /> Website</label>
            <input
              type="url"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.social_website}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, social_website: e.target.value }))}
            />
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
          <h3 className="text-[14px] font-bold text-[#0f172a] mb-[14px] pl-[12px] relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[14px] before:bg-[#007570] before:rounded-[2px]">SEO Dasar</h3>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Meta Title</label>
            <input
              type="text"
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]"
              value={settingsForm.seo_meta_title}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, seo_meta_title: e.target.value }))}
            />
          </div>
          <div className="mb-[14px]">
            <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Meta Description</label>
            <textarea
              className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] resize-y min-h-[70px]"
              value={settingsForm.seo_meta_description}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, seo_meta_description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      </div>

      <button
        className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSaveSettings}
        disabled={savingSettings}
      >
        {savingSettings ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <Check size={16} />
            <span>Simpan Perubahan</span>
          </>
        )}
      </button>
    </div>
  );

  const renderCoupons = () => {
    const filteredCoupons = coupons.filter((c) => {
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
    });

    const totalCouponPages = Math.ceil(filteredCoupons.length / couponsPerPage) || 1;
    const currentCouponPage = Math.min(Math.max(1, couponPage), totalCouponPages);
    const startIndex = (currentCouponPage - 1) * couponsPerPage;
    const displayedCoupons = filteredCoupons.slice(startIndex, startIndex + couponsPerPage);

    return (
      <div className="mb-[28px]">
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
            Kelola Kupon Diskon
          </h2>
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
                onChange={(e) => {
                  setCouponFilters({ ...couponFilters, search: e.target.value });
                  setCouponPage(1);
                }}
                className="flex-1 border-0 outline-none bg-transparent font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a]"
              />
            </div>
            <select
              value={couponFilters.status}
              onChange={(e) => {
                setCouponFilters({ ...couponFilters, status: e.target.value });
                setCouponPage(1);
              }}
              className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <select
              value={couponFilters.appliesTo}
              onChange={(e) => {
                setCouponFilters({ ...couponFilters, appliesTo: e.target.value });
                setCouponPage(1);
              }}
              className="px-[12px] py-[7px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] cursor-pointer min-w-[130px] max-md:w-full outline-none focus:border-[#007570]"
            >
              <option value="">Semua Peruntukan</option>
              <option value="premium">Paket Premium</option>
              <option value="ads">Paket Iklan</option>
              <option value="all">Semua Paket</option>
            </select>
          </div>
        </div>

        {/* Coupons Table (Optimized Layout) */}
        <div className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-br from-[#007570] to-[#009e98]">
                <tr>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Kode &amp; Deskripsi</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Diskon &amp; Min Belanja</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Peruntukan</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Penggunaan</th>
                  <th className="px-[14px] py-[12px] text-left text-[11px] font-bold text-white/90 uppercase tracking-[0.5px]">Masa Berlaku &amp; Status</th>
                  <th className="px-[14px] py-[12px] text-center text-[11px] font-bold text-white/90 uppercase tracking-[0.5px] w-[120px]">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayedCoupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-[36px]">
                      <div className="flex flex-col items-center justify-center p-[24px] gap-[12px] text-[#94a3b8]">
                        <Ticket size={48} strokeWidth={1} className="opacity-40" />
                        <p className="text-[14px] text-[#64748b] font-medium">Belum ada kupon diskon yang cocok.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedCoupons.map((coupon) => (
                    <tr key={coupon.id} className="transition-colors duration-150 hover:bg-[#f8fafc]">
                      {/* Kode & Deskripsi */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] align-middle [tr:last-child_&]:border-b-0">
                        <div>
                          <span className="inline-flex items-center gap-[6px] px-[8px] py-[3px] bg-[#f0fdfa] text-[#007570] border border-[rgba(0,117,112,0.25)] rounded-[6px] font-mono font-bold tracking-[0.5px] text-[12px]">
                            {coupon.code}
                          </span>
                          <span className="text-[11.5px] text-[#64748b] block mt-[3px] truncate max-w-[220px]">
                            {coupon.name || coupon.description || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Diskon & Min Belanja */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] align-middle [tr:last-child_&]:border-b-0">
                        <div>
                          <span className="font-extrabold text-[#007570]">
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}%`
                              : `Rp ${Math.round(parseFloat(coupon.discount_value || 0)).toLocaleString("id-ID")}`}
                          </span>
                          <span className="text-[11px] text-[#64748b] block mt-[1px]">
                            {parseFloat(coupon.minimum_amount) > 0 ? `Min: Rp ${Math.round(parseFloat(coupon.minimum_amount)).toLocaleString("id-ID")}` : "Tanpa minimal"}
                            {parseFloat(coupon.maximum_discount) > 0 ? ` • Maks: Rp ${Math.round(parseFloat(coupon.maximum_discount)).toLocaleString("id-ID")}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Peruntukan */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[12px] align-middle [tr:last-child_&]:border-b-0">
                        <span className={`inline-flex items-center px-[8px] py-[2.5px] rounded-[6px] text-[11px] font-semibold ${coupon.applies_to === "premium"
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

                      {/* Penggunaan */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[12px] font-semibold text-[#475569] align-middle [tr:last-child_&]:border-b-0">
                        <span>
                          {coupon.used_count ?? 0} / {coupon.usage_limit ? coupon.usage_limit : "∞"}
                        </span>
                      </td>

                      {/* Masa Berlaku & Status */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[12px] align-middle [tr:last-child_&]:border-b-0">
                        <div className="flex items-center gap-[6px] flex-wrap">
                          <span className={getBadgeClass(coupon.is_active ? "active" : "inactive")}>
                            {coupon.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                          <span className="text-[11px] text-[#64748b]">
                            {coupon.expires_at ? `s/d ${new Date(coupon.expires_at).toLocaleDateString("id-ID")}` : "Selamanya"}
                          </span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="px-[14px] py-[11px] border-b border-[#f1f5f9] text-[13px] text-[#0f172a] align-middle [tr:last-child_&]:border-b-0">
                        <div className="flex items-center justify-center gap-[4px]">
                          <button
                            className="w-[28px] h-[28px] bg-[#f1f5f9] border-0 rounded-[6px] cursor-pointer text-[#64748b] transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#007570] hover:text-white"
                            onClick={() => handleModal("editCoupon", coupon)}
                            title="Edit Kupon"
                          >
                            <Edit size={14} strokeWidth={2} />
                          </button>
                          <button
                            className={`w-[28px] h-[28px] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 ${coupon.is_active
                                ? "bg-[#fef3c7] text-[#d97706] hover:bg-[#d97706] hover:text-white"
                                : "bg-[#dcfce7] text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                              }`}
                            onClick={() => handleToggleCouponStatus(coupon.id)}
                            title={coupon.is_active ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <RefreshCw size={14} strokeWidth={2} />
                          </button>
                          <button
                            className="w-[28px] h-[28px] bg-[#fee2e2] text-[#dc2626] border-0 rounded-[6px] cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 hover:bg-[#dc2626] hover:text-white"
                            onClick={() => handleModal("deleteCoupon", coupon)}
                            title="Hapus Kupon"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Coupon Pagination Controls */}
          {filteredCoupons.length > couponsPerPage && (
            <div className="flex items-center justify-between p-[14px_18px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px] bg-[#fafafa]">
              <span className="text-[#64748b] font-medium">
                Menampilkan {startIndex + 1} - {Math.min(startIndex + couponsPerPage, filteredCoupons.length)} dari {filteredCoupons.length} kupon
              </span>
              <div className="flex items-center gap-[6px]">
                <button
                  type="button"
                  onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
                  disabled={currentCouponPage === 1}
                  className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalCouponPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCouponPage(pg)}
                    className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${currentCouponPage === pg
                        ? "bg-[#007570] text-white border-[#007570]"
                        : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                      }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCouponPage((p) => Math.min(totalCouponPages, p + 1))}
                  disabled={currentCouponPage === totalCouponPages}
                  className="px-[10px] py-[5px] rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#0f172a] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // â”€â”€ Kelola Klaim Usaha Handlers & View â”€â”€
  const handleStartReviewClaim = async (claimId) => {
    try {
      await api.post(`/admin/business-claims/${claimId}/start-review`);
      toast.success("Status klaim diperbarui menjadi Sedang Ditinjau.");
      fetchClaims(claimsStatusFilter);
      fetchPendingClaimsCount();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal memperbarui status klaim.");
    }
  };

  const handleConfirmApproveClaim = async () => {
    if (!claimApproveModal.claim) return;
    try {
      const res = await api.post(`/admin/business-claims/${claimApproveModal.claim.id}/approve`);
      toast.success(res.data?.message || "Klaim disetujui! Kepemilikan telah berhasil dialihkan.");
      setClaimApproveModal({ open: false, claim: null });
      fetchClaims(claimsStatusFilter);
      fetchPendingClaimsCount();
      fetchAllData();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal menyetujui klaim.");
    }
  };

  const handleConfirmRejectClaim = async () => {
    if (!claimRejectModal.claim || !claimRejectModal.reason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    try {
      const res = await api.post(`/admin/business-claims/${claimRejectModal.claim.id}/reject`, {
        rejection_reason: claimRejectModal.reason.trim(),
      });
      toast.success(res.data?.message || "Klaim berhasil ditolak.");
      setClaimRejectModal({ open: false, claim: null, reason: "" });
      fetchClaims(claimsStatusFilter);
      fetchPendingClaimsCount();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Gagal menolak klaim.");
    }
  };

  const renderClaims = () => (
    <div className="mb-[28px] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-[#007570]" size={24} />
              Kelola Klaim Usaha
            </h2>
            {pendingClaimsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                {pendingClaimsCount} Menunggu
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Tinjau pengajuan klaim kepemilikan usaha, periksa bukti dari pengaju, hubungi pihak terkait, dan alihkan kepemilikan secara aman.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchClaims(claimsStatusFilter);
              fetchPendingClaimsCount();
            }}
            disabled={claimsLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={claimsLoading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "", label: "Semua Klaim" },
          { id: "pending", label: "Menunggu Verifikasi" },
          { id: "under_review", label: "Sedang Ditinjau" },
          { id: "approved", label: "Disetujui" },
          { id: "rejected", label: "Ditolak" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setClaimsStatusFilter(tab.id);
              fetchClaims(tab.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${claimsStatusFilter === tab.id
                ? "bg-[#007570] text-white border-[#007570] shadow-2xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {claimsLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-[#007570] mb-3" />
          <p className="text-xs font-bold text-slate-500">Memuat data pengajuan klaim...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <ShieldAlert size={48} className="mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-800 mb-1">Belum Ada Pengajuan Klaim</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {claimsStatusFilter ? "Tidak ada pengajuan klaim dengan status ini." : "Belum ada pengajuan klaim kepemilikan usaha yang dikirimkan oleh pengguna."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const biz = claim.business;
            const claimant = claim.user;
            const curOwner = claim.current_owner || biz?.user;
            const statusConfig = {
              pending: { label: "Menunggu Verifikasi", bg: "bg-amber-50 text-amber-800 border-amber-200" },
              under_review: { label: "Sedang Ditinjau", bg: "bg-blue-50 text-blue-800 border-blue-200" },
              approved: { label: "Disetujui (Kepemilikan Dialihkan)", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
              rejected: { label: "Ditolak", bg: "bg-rose-50 text-rose-800 border-rose-200" },
            }[claim.status] || { label: claim.status, bg: "bg-slate-50 text-slate-800 border-slate-200" };

            return (
              <div key={claim.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4">
                {/* Header Row: Business & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                      <Store size={22} className="text-[#007570]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/business/${claim.business_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-extrabold text-slate-900 hover:text-[#007570] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{biz?.name || "Usaha #" + claim.business_id}</span>
                          <ExternalLink size={13} className="text-slate-400" />
                        </Link>
                        {biz?.category && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {typeof biz.category === "string" ? biz.category : biz.category.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Diajukan pada: {new Date(claim.created_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${statusConfig.bg}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Comparison Grid: Current Owner vs Claimant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Current Owner */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Pemilik Saat Ini (Terdaftar)
                    </span>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={curOwner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${curOwner?.name || "Owner"}`}
                        alt={curOwner?.name || "Owner"}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{curOwner?.name || "Tidak ada pemilik akun"}</p>
                        <p className="text-[11px] text-slate-500 truncate">{curOwner?.email || "-"}</p>
                      </div>
                      {curOwner?.phone && (
                        <a
                          href={`https://wa.me/${curOwner.phone.replace(/^0/, "62")}?text=${encodeURIComponent(`Halo ${curOwner.name}, kami dari Admin Surade.com ingin mengonfirmasi terkait klaim kepemilikan usaha ${biz?.name || ""}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200 no-underline shrink-0"
                          title="Hubungi via WhatsApp"
                        >
                          <WhatsAppIcon size={13} className="text-emerald-600" />
                          <span>Hubungi</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Claimant */}
                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 space-y-2">
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                      Pengaju Klaim (Calon Pemilik)
                    </span>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={claimant?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${claimant?.name || "User"}`}
                        alt={claimant?.name || "User"}
                        className="w-9 h-9 rounded-full object-cover border border-sky-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{claimant?.name || "User #" + claim.user_id}</p>
                        <p className="text-[11px] text-slate-500 truncate">{claimant?.email || "-"}</p>
                      </div>
                      {(() => {
                        const rawPhone = claimant?.phone || (claim.description ? claim.description.replace(/[-\s]/g, '').match(/(?:(?:\+?62)|0)8[0-9]{8,12}/)?.[0] : null);
                        if (!rawPhone) return null;
                        const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '62');
                        return (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Halo ${claimant?.name || 'Bapak/Ibu'}, kami dari Admin Surade.com ingin memverifikasi pengajuan klaim Anda untuk tempat usaha "${biz?.name || ''}".`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200 no-underline shrink-0 shadow-2xs"
                            title={`Hubungi via WhatsApp (${rawPhone})`}
                          >
                            <WhatsAppIcon size={13} className="text-emerald-600" />
                            <span>Hubungi WA</span>
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Reason & Description Box */}
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Alasan Klaim:</span>
                    <p className="text-xs font-bold text-slate-800">{claim.reason}</p>
                  </div>
                  {claim.description && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Keterangan Tambahan:</span>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{claim.description}</p>
                    </div>
                  )}
                  {(() => {
                    const proofs = claim.proof_file_list || (claim.proof_file ? (typeof claim.proof_file === "string" && claim.proof_file.startsWith("[") ? JSON.parse(claim.proof_file) : [claim.proof_file]) : []);
                    if (!proofs || proofs.length === 0) return null;
                    return (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                          Bukti Pendukung ({proofs.length} berkas):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {proofs.map((pFile, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setClaimProofModal({ open: true, url: getStorageUrl(pFile), title: `Bukti #${pIdx + 1}: ${biz?.name || ""}` })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs"
                            >
                              <Eye size={13} />
                              <span>Lihat Bukti {proofs.length > 1 ? `#${pIdx + 1}` : "Lampiran"}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Rejection reason box if rejected */}
                {claim.status === "rejected" && claim.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <span className="font-bold block mb-0.5">Alasan Penolakan:</span>
                    <p className="whitespace-pre-wrap">{claim.rejection_reason}</p>
                  </div>
                )}

                {/* Resolved Info if approved/rejected */}
                {claim.resolved_at && (
                  <p className="text-[11px] text-slate-400 italic">
                    Diproses pada: {new Date(claim.resolved_at).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                    {claim.admin && ` oleh ${claim.admin.name}`}
                  </p>
                )}

                {/* Action Buttons for Admin */}
                {(claim.status === "pending" || claim.status === "under_review") && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    {claim.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleStartReviewClaim(claim.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Search size={14} />
                        <span>Mulai Verifikasi</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setClaimRejectModal({ open: true, claim, reason: "" })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <X size={14} />
                      <span>Tolak Klaim</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimApproveModal({ open: true, claim })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs border-0"
                    >
                      <Check size={14} />
                      <span>Setujui & Alihkan Kepemilikan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="mb-[28px]">
      <div className="flex items-center justify-between mb-[18px] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={15} />
            <span>Dashboard</span>
          </button>
          <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
            Notifikasi Admin
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadNotificationsCount > 0 && (
            <button
              className="inline-flex items-center gap-[6px] px-[12px] py-[6.5px] rounded-[8px] border border-[#e2e8f0] bg-white text-[#007570] font-semibold text-[12px] cursor-pointer hover:bg-[#f0fdfa] transition-colors"
              onClick={handleMarkAllNotificationsRead}
            >
              <Check size={14} />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              className="inline-flex items-center gap-[6px] px-[12px] py-[6.5px] rounded-[8px] border border-rose-200 bg-rose-50 text-rose-600 font-semibold text-[12px] cursor-pointer hover:bg-rose-100 transition-colors"
              onClick={handleClearNotificationsHistory}
            >
              <Trash2 size={14} />
              <span>Hapus Riwayat</span>
            </button>
          )}
        </div>
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
              onClick={() => {
                if (!notif.is_read) handleMarkNotificationRead(notif.id);
                if (notif.source_type === 'business_claim' || notif.type?.includes('claim') || String(notif.title).toLowerCase().includes('klaim')) {
                  setActiveTab('claims');
                } else if (notif.source_type === 'business' || notif.type?.includes('business')) {
                  setActiveTab('businesses');
                } else if (notif.source_type === 'product' || notif.type?.includes('product')) {
                  setActiveTab('products');
                }
              }}
              className={`flex items-center gap-[12px] p-[14px] rounded-[12px] border transition-all duration-220 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] cursor-pointer ${!notif.is_read ? 'bg-[#f0fdfa] border-[rgba(0,117,112,0.25)]' : 'bg-white border-[#e2e8f0]'
                }`}
            >
              <div className={`w-[46px] h-[46px] rounded-[12px] flex items-center justify-center shrink-0 ${notif.source_type === 'business_claim' || notif.type?.includes('claim') ? 'bg-[#f3e8ff] text-[#9333ea]' :
                  notif.type?.includes('approved') || notif.type?.includes('success') ? 'bg-[#dcfce7] text-[#16a34a]' :
                    notif.type?.includes('rejected') || notif.type?.includes('suspended') ? 'bg-[#fee2e2] text-[#dc2626]' :
                      notif.type?.includes('user') ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#fef3c7] text-[#d97706]'
                }`}>
                {notif.source_type === 'business_claim' || notif.type?.includes('claim') ? <ShieldAlert size={20} strokeWidth={2} /> :
                  notif.type?.includes('approved') || notif.type?.includes('success') ? <Check size={18} strokeWidth={2} /> :
                    notif.type?.includes('rejected') || notif.type?.includes('suspended') ? <X size={18} strokeWidth={2} /> :
                      notif.type?.includes('user') ? <User size={18} strokeWidth={2} /> : <Clock size={18} strokeWidth={2} />}
              </div>
              <div className="flex-1">
                <span className="text-[13px] font-bold text-[#0f172a] block mb-[3px]">{notif.title}</span>
                <span className="text-[12px] text-[#64748b] font-medium block mb-[3px]">{notif.description || notif.message}</span>
                <span className="text-[11px] text-[#94a3b8] font-medium">{notif.created_at ? new Date(notif.created_at).toLocaleString('id-ID') : '-'}</span>
              </div>
              {!notif.is_read && (
                <button
                  className="bg-[#007570] text-white border-0 px-[14px] py-[7px] rounded-[7px] text-[12px] font-semibold cursor-pointer transition-all duration-200 shrink-0 hover:bg-[#005a58]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkNotificationRead(notif.id);
                  }}
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
        const p = payments.find((pay) => pay.subscription_id === sub.id || pay.id === sub.payment_id) || sub.payment;
        return {
          id: sub.id,
          user: sub.user || { name: "User #" + sub.user_id, email: "-" },
          business: b || sub.business || { name: "Usaha #" + (sub.business_id || "-"), category: { name: "Umum" } },
          plan: sub.plan || plans.find((pl) => pl.id === sub.plan_id) || { name: "Premium 1", price: 50000 },
          starts_at: sub.starts_at,
          ends_at: sub.ends_at,
          status: sub.status || "active",
          payment_status: p?.status || (sub.status === "active" ? "paid" : sub.status === "rejected" ? "failed" : "pending"),
          payment_id: p?.id,
          payment_method: p?.method || "Transfer Bank",
          proof: p?.proof,
          proof_url: p?.proof_url || (p?.proof ? getStorageUrl(p.proof) : null),
          rejection_reason: sub.rejection_reason || p?.rejection_reason,
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

    const sortedTableData = [...filteredTableData].sort((a, b) => {
      const isAPendingOrRev = a.status === "pending" || a.status === "menunggu" || a.status === "needs_revision" || a.payment_status === "pending" || a.payment_status === "needs_revision";
      const isBPendingOrRev = b.status === "pending" || b.status === "menunggu" || b.status === "needs_revision" || b.payment_status === "pending" || b.payment_status === "needs_revision";

      if (isAPendingOrRev && !isBPendingOrRev) return -1;
      if (!isAPendingOrRev && isBPendingOrRev) return 1;

      const dateA = new Date(a.starts_at || a.created_at || 0).getTime();
      const dateB = new Date(b.starts_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return Number(b.id) - Number(a.id);
    });

    const perPage = 10;
    const totalPages = Math.ceil(sortedTableData.length / perPage) || 1;
    const currentPremiumPage = Math.min(Math.max(1, premiumPage), totalPages);
    const paginatedData = sortedTableData.slice((currentPremiumPage - 1) * perPage, currentPremiumPage * perPage);

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
              const formattedDuration = plan.formatted_duration || (() => {
                const days = Number(plan.duration_days);
                if (days >= 365 && days % 365 === 0) return `${days / 365} Tahun`;
                if (days >= 30 && days % 30 === 0) return `${days / 30} Bulan`;
                if (days > 0) return `${days} Hari`;
                if (plan.duration_value) {
                  return `${plan.duration_value} ${plan.duration_unit === 'day' || plan.duration_unit === 'hari' ? 'Hari' : plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`;
                }
                return "1 Bulan";
              })();

              return (
                <div
                  key={plan.id}
                  className={`relative bg-[#f8fafc] rounded-[14px] p-[18px] border transition-all duration-200 flex flex-col justify-between gap-[16px] ${plan.name.toLowerCase().includes("premium")
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

                    {/* Features list - dibaca langsung dari plan.features (bukan field statis) */}
                    <div className="flex flex-col gap-[8px] text-[12.5px] font-medium text-[#475569]">
                      {Object.entries(plan.features || {}).map(([featureName, enabled]) => (
                        <div key={featureName} className="flex items-center gap-[8px]">
                          {enabled ? <Check size={15} className="text-[#007570] shrink-0" /> : <X size={15} className="text-[#94a3b8] shrink-0" />}
                          <span className={enabled ? "" : "line-through text-[#94a3b8]"}>{featureName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-[10px] pt-[8px]">
                    <div className="text-[11.5px] font-semibold text-[#64748b] bg-white px-[10px] py-[4px] rounded-[6px] border border-[#e2e8f0] w-fit">
                      👥 Dipakai oleh {usageCount} usaha
                    </div>

                    <div className="flex items-center gap-[8px]">
                      <button
                        onClick={() => {
                          const f = plan.features || {};
                          let durVal = plan.duration_value;
                          let durUnit = plan.duration_unit;
                          if (!durVal || !durUnit) {
                            const days = Number(plan.duration_days) || 30;
                            if (days >= 365 && days % 365 === 0) {
                              durVal = days / 365;
                              durUnit = "year";
                            } else if (days >= 30 && days % 30 === 0) {
                              durVal = days / 30;
                              durUnit = "month";
                            } else {
                              durVal = days;
                              durUnit = "day";
                            }
                          }
                          setPackageForm({
                            name: plan.name,
                            description: plan.description || "",
                            price: Math.round(Number(plan.price || 0)),
                            duration_value: durVal,
                            duration_unit: durUnit,
                            can_add_map: Boolean(f["Lokasi Peta Penuh"]),
                            can_add_gallery: Boolean(f["Galeri Foto Profil"]),
                            can_add_products: Boolean(f["Fitur Katalog Produk"]),
                            can_chat: Boolean(f["Akses Chat & WA Direct"]),
                            priority_listing: Boolean(f["Prioritas & Badge Premium"]),
                            is_active: Boolean(plan.is_active),
                          });
                          setModal({ show: true, type: "editPackage", data: plan });
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-[6px] px-[12px] py-[7px] bg-white border border-[#cbd5e1] text-[#334155] rounded-[8px] text-[12px] font-semibold hover:bg-[#f1f5f9] transition-all"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleTogglePackageStatus(plan.id)}
                        className={`inline-flex items-center justify-center px-[10px] py-[7px] border rounded-[8px] text-[12px] font-semibold transition-all ${plan.is_active
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
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                  <th className="px-[14px] py-[11px]">User &amp; Bisnis</th>
                  <th className="px-[14px] py-[11px]">Paket Premium</th>
                  <th className="px-[14px] py-[11px]">Masa Langganan</th>
                  <th className="px-[14px] py-[11px]">Status &amp; Pembayaran</th>
                  <th className="px-[14px] py-[11px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[12.5px] text-[#0f172a]">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-[16px] py-[40px] text-center text-[#94a3b8] text-[13px]">
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
                        {/* User & Bisnis */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={getBusinessTablePhoto(row.business)}
                              alt={row.business?.name || row.user?.name}
                              className="w-[36px] h-[36px] rounded-[8px] object-cover border border-[#e2e8f0] shrink-0 bg-slate-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[#0f172a] truncate">{row.user?.name || "User"}</span>
                              <span className="text-[11px] text-[#64748b] truncate">{row.user?.email || "-"}</span>
                              <span className="text-[11px] font-semibold text-[#007570] mt-[2px] truncate">
                                🏬 {row.business?.name || "Semua Usaha"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Paket & Biaya */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col gap-[2px]">
                            <span className="font-bold text-[#0f172a] flex items-center gap-[5px]">
                              <Crown size={14} className="text-[#d97706]" />
                              {row.plan?.name || "Premium"}
                            </span>
                            {/* Show final_price (actual paid) not plan base price */}
                            {(() => {
                              const basePx = Number(row.plan?.price || 0);
                              const finalPx = Number(row.final_price ?? row.price ?? basePx);
                              const hasDiscount = finalPx < basePx;
                              const hasReferral = Boolean(row.referral_code);
                              const hasCoupon = Boolean(row.coupon_code);
                              return (
                                <>
                                  <span className="text-[11.5px] font-extrabold text-[#007570]">
                                    {finalPx === 0 ? "Gratis" : `Rp ${finalPx.toLocaleString("id-ID")}`}
                                    {hasDiscount && basePx > 0 && (
                                      <span className="ml-1 line-through text-slate-400 font-normal text-[10px]">
                                        {`Rp ${basePx.toLocaleString("id-ID")}`}
                                      </span>
                                    )}
                                  </span>
                                  <div className="flex flex-wrap gap-[3px] mt-[1px]">
                                    {hasReferral && (
                                      <span className="text-[10px] font-bold px-[5px] py-[1px] rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        🔗 Ref: {row.referral_code}
                                      </span>
                                    )}
                                    {hasCoupon && (
                                      <span className="text-[10px] font-bold px-[5px] py-[1px] rounded bg-blue-100 text-blue-700 border border-blue-200">
                                        🎟 {row.coupon_code}
                                      </span>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>

                        {/* Masa Langganan */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col text-[11.5px]">
                            <span className="text-[#0f172a] font-medium">
                              📅 {row.starts_at ? new Date(row.starts_at).toLocaleDateString("id-ID") : "-"} s/d {row.ends_at ? new Date(row.ends_at).toLocaleDateString("id-ID") : "-"}
                            </span>
                            {daysLeft !== null && (
                              <span
                                className={`text-[10px] font-bold mt-[2px] w-fit px-[6px] py-[1px] rounded ${daysLeft > 7
                                    ? "bg-[#dcfce7] text-[#16a34a]"
                                    : daysLeft > 0
                                      ? "bg-[#fef3c7] text-[#d97706]"
                                      : "bg-[#fee2e2] text-[#dc2626]"
                                  }`}
                              >
                                {daysLeft > 0 ? `Sisa ${daysLeft} hari` : "Expired"}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status & Pembayaran */}
                        <td className="px-[14px] py-[10px]">
                          <div className="flex flex-col gap-[4px]">
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10.5px] text-[#64748b]">Langganan:</span>
                              <span className={getBadgeClass(row.status)}>
                                {row.status === "active" ? "Aktif" : row.status === "pending" ? "Menunggu" : row.status === "expired" ? "Expired" : "Ditolak"}
                              </span>
                            </div>
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[10.5px] text-[#64748b]">Bayar:</span>
                              {(() => {
                                // Derive payment status from multiple sources
                                const payStatus = row.payment?.status || row.payment_status;
                                const subStatus = row.status;
                                // If subscription is active/paid, payment is lunas
                                const isLunas = payStatus === "paid" || payStatus === "approved" || subStatus === "active" || subStatus === "paid";
                                const isPending = !isLunas && (payStatus === "pending" || subStatus === "pending");
                                const label = isLunas ? "Lunas" : isPending ? "Menunggu" : "Gagal";
                                const statusKey = isLunas ? "paid" : isPending ? "pending" : "failed";
                                return <span className={getBadgeClass(statusKey)}>{label}</span>;
                              })()}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-[14px] py-[10px] text-right">
                          <div className="flex items-center justify-end gap-[4px]">
                            {/* Tombol Lihat Detail & Bukti */}
                            <button
                              onClick={() => handleOpenPaymentDetail(row)}
                              className="p-[6px] bg-[#f0fdfa] text-[#007570] hover:bg-[#ccfbf1] rounded-[6px] transition-colors cursor-pointer"
                              title="Lihat Detail & Bukti Pembayaran"
                            >
                              <Eye size={14} />
                            </button>

                            {row.payment_status === "pending" && (row.payment_id || row.id) && (
                              <>
                                <button
                                  onClick={() => handleApprovePayment(row.payment_id || row.id)}
                                  className="px-[8px] py-[4px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold hover:bg-[#bbf7d0]"
                                  title="Setujui Pembayaran"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleOpenRevisionModal("payment", row)}
                                  className="px-[8px] py-[4px] bg-[#fef3c7] text-[#b45309] rounded-[6px] text-[11px] font-bold hover:bg-[#fde68a]"
                                  title="Minta Perbaikan Bukti Pembayaran"
                                >
                                  Perbaikan
                                </button>
                                <button
                                  onClick={() => handleDirectRejectPayment(row)}
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
          {filteredTableData.length > perPage && (
            <div className="flex items-center justify-between pt-[14px] border-t border-[#f1f5f9] text-[12px] flex-wrap gap-[10px]">
              <span className="text-[#64748b] font-medium">
                Menampilkan {(premiumPage - 1) * perPage + 1} - {Math.min(premiumPage * perPage, filteredTableData.length)} dari {filteredTableData.length} data
              </span>
              {renderAdminPagination(premiumPage, totalPages, setPremiumPage)}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Render Referrals Section ──
  const renderReferrals = () => {
    return (
      <div className="mb-[28px]">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-[20px] flex-wrap gap-[12px]">
          <div>
            <h2 className="text-[18px] font-bold text-[#0f172a] relative pl-[14px] before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-[#007570] before:rounded-[2px]">
              Pusat Kontrol &amp; Manajemen Referral
            </h2>
            <p className="text-[12px] text-[#64748b] mt-[2px] pl-[14px]">
              Pusat pengelolaan referral user, validasi transaksi paket premium, persetujuan komisi, dan pengaturan program referral
            </p>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              onClick={() => {
                fetchReferralStats();
                if (referralSubTab === "codes") fetchReferralCodes(referralCodesPage);
                else if (referralSubTab === "transactions") fetchReferralTransactions(referralTrxPage);
                else if (referralSubTab === "commissions") fetchReferralCommissions(referralComPage);
                else if (referralSubTab === "settings") fetchReferralSettings();
              }}
              className="px-[14px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] text-[12.5px] font-semibold flex items-center gap-[6px] shadow-sm cursor-pointer transition-all"
            >
              <RefreshCw size={15} />
              <span>Muat Ulang</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-md:grid-cols-2 max-sm:grid-cols-1 gap-[14px] mb-[24px]">
          {/* Card 1: Total Referral Codes */}
          <div className="group relative bg-white rounded-[14px] p-[18px] flex items-center gap-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
            <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#007570] to-[#00b3ab]">
              <Ticket size={22} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{referralStats.total_codes}</span>
              <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Kode Referral</span>
              <span className="text-[11px] text-[#10b981] font-medium mt-[1px] block">
                {referralStats.active_codes} Aktif • {referralStats.suspended_codes} Suspend
              </span>
            </div>
          </div>

          {/* Card 2: Total User Referral */}
          <div className="group relative bg-white rounded-[14px] p-[18px] flex items-center gap-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
            <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]">
              <Users size={22} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{referralStats.total_users}</span>
              <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Pemilik Referral</span>
              <span className="text-[11px] text-[#64748b] font-medium mt-[1px] block">
                Pengguna terdaftar
              </span>
            </div>
          </div>

          {/* Card 3: Transaksi Referral */}
          <div className="group relative bg-white rounded-[14px] p-[18px] flex items-center gap-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
            <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]">
              <FileText size={22} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[22px] font-extrabold text-[#0f172a] block leading-[1.2]">{referralStats.total_transactions}</span>
              <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Transaksi Referral</span>
              <span className="text-[11px] text-[#d97706] font-medium mt-[1px] block">
                {referralStats.pending_transactions} Menunggu Approval
              </span>
            </div>
          </div>

          {/* Card 4: Total Komisi */}
          <div className="group relative bg-white rounded-[14px] p-[18px] flex items-center gap-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#e2e8f0]">
            <div className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#10b981] to-[#34d399]">
              <DollarSign size={22} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[20px] font-extrabold text-[#0f172a] block leading-[1.2]">
                Rp {Math.round(referralStats.total_commission).toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.5px] block mt-[2px]">Total Komisi Referral</span>
              <span className="text-[11px] text-[#16a34a] font-medium mt-[1px] block">
                Rp {Math.round(referralStats.paid_commission).toLocaleString("id-ID")} Lunas
              </span>
            </div>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="bg-white rounded-[14px] p-[6px] mb-[20px] border border-[#e2e8f0] shadow-sm flex items-center gap-[6px] overflow-x-auto">
          {[
            { id: "codes", label: "Daftar Kode Referral", icon: Ticket, count: referralStats.total_codes },
            { id: "transactions", label: "Transaksi Referral", icon: FileText, count: referralStats.total_transactions, badge: referralStats.pending_transactions > 0 ? `${referralStats.pending_transactions} Pending` : null },
            { id: "commissions", label: "Manajemen Komisi", icon: DollarSign, count: null },
            { id: "withdrawals", label: "Penarikan Saldo Komisi", icon: Wallet, count: referralWithdrawals.filter((w) => w.status === "pending").length || null, badge: referralWithdrawals.filter((w) => w.status === "pending").length > 0 ? `${referralWithdrawals.filter((w) => w.status === "pending").length} Menunggu` : null },
            { id: "settings", label: "Pengaturan Sistem", icon: Settings, count: null },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = referralSubTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => {
                  setReferralSubTab(tabItem.id);
                  if (tabItem.id === "codes") fetchReferralCodes(1);
                  else if (tabItem.id === "transactions") fetchReferralTransactions(1);
                  else if (tabItem.id === "commissions") fetchReferralCommissions(1);
                  else if (tabItem.id === "withdrawals") fetchReferralWithdrawals(1);
                  else if (tabItem.id === "settings") fetchReferralSettings();
                }}
                className={`flex items-center gap-[8px] px-[16px] py-[10px] rounded-[10px] text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer border-0 ${isActive
                    ? "bg-[#007570] text-white shadow-sm"
                    : "bg-transparent text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                  }`}
              >
                <Icon size={16} />
                <span>{tabItem.label}</span>
                {tabItem.count !== null && (
                  <span className={`px-[7px] py-[2px] rounded-full text-[11px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                    {tabItem.count}
                  </span>
                )}
                {tabItem.badge && (
                  <span className="px-[8px] py-[2px] rounded-full text-[10.5px] font-extrabold bg-[#fef3c7] text-[#b45309] border border-[#fde68a]">
                    {tabItem.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subtab 1: Referral Codes View */}
        {referralSubTab === "codes" && (
          <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm overflow-hidden">
            {/* Filter & Search */}
            <div className="p-[16px] border-b border-[#e2e8f0] flex flex-wrap gap-[10px] items-center justify-between bg-[#fafbfc]">
              <div className="flex items-center gap-[10px] flex-1 min-w-[240px] max-md:w-full">
                <div className="flex items-center gap-[8px] flex-1 bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[8px]">
                  <Search size={16} className="text-[#64748b] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari user, email, atau kode referral..."
                    value={referralCodesSearch}
                    onChange={(e) => setReferralCodesSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchReferralCodes(1); }}
                    className="flex-1 border-0 outline-none text-[13px] text-[#0f172a]"
                  />
                  {referralCodesSearch && (
                    <button onClick={() => { setReferralCodesSearch(""); fetchReferralCodes(1); }} className="text-[#94a3b8] hover:text-[#0f172a] border-0 bg-transparent cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => fetchReferralCodes(1)}
                  className="px-[14px] py-[8px] rounded-[8px] bg-[#007570] text-white text-[13px] font-semibold cursor-pointer border-0 hover:bg-[#005a58]"
                >
                  Cari
                </button>
              </div>

              <div className="flex items-center gap-[10px] max-md:w-full">
                <select
                  value={referralCodesStatus}
                  onChange={(e) => {
                    setReferralCodesStatus(e.target.value);
                    setTimeout(() => fetchReferralCodes(1), 50);
                  }}
                  className="px-[12px] py-[8px] bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] cursor-pointer outline-none focus:border-[#007570]"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif (Active)</option>
                  <option value="inactive">Nonaktif (Inactive)</option>
                  <option value="suspended">Ditangguhkan (Suspended)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] text-[11px] uppercase tracking-wider border-b border-[#e2e8f0]">
                    <th className="p-[12px_14px] font-bold">User / Pemilik</th>
                    <th className="p-[12px_14px] font-bold">Kode Referral</th>
                    <th className="p-[12px_14px] font-bold">Penggunaan &amp; Trx</th>
                    <th className="p-[12px_14px] font-bold text-right">Komisi &amp; Status</th>
                    <th className="p-[12px_14px] font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {loadingReferralCodes ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        <SuradeLoader variant="section" size="sm" text="Memuat daftar kode referral" minHeight="160px" />
                      </td>
                    </tr>
                  ) : referralCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-[36px] text-center text-[#64748b]">
                        <Ticket size={36} className="mx-auto mb-[8px] text-[#cbd5e1]" />
                        <p className="font-semibold text-[#0f172a]">Belum ada kode referral yang cocok</p>
                        <p className="text-[12px] text-[#64748b] mt-[2px]">Coba ubah kata kunci pencarian atau filter status</p>
                      </td>
                    </tr>
                  ) : (
                    referralCodes.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-[12px_14px]">
                          <div className="flex items-center gap-[10px]">
                            <img
                              src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=007570&color=fff`}
                              alt={item.name}
                              className="w-[32px] h-[32px] rounded-full object-cover border border-[#e2e8f0]"
                            />
                            <div>
                              <div className="font-bold text-[#0f172a]">{item.name}</div>
                              <div className="text-[11px] text-[#64748b]">{item.email}</div>
                              <div className="text-[10px] text-[#94a3b8] mt-[1px]">Daftar: {item.created_at}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-[12px_14px]">
                          {(() => {
                            const formattedCode = item.referral_code ? item.referral_code.replace(/^INFO-/i, 'SURADE-') : '';
                            return (
                              <div className="flex items-center gap-[5px]">
                                <span className="font-mono font-bold px-[8px] py-[2.5px] rounded-[6px] bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1] text-[11.5px]">
                                  {formattedCode}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(formattedCode);
                                    alert(`Kode ${formattedCode} berhasil disalin!`);
                                  }}
                                  className="p-[3px] rounded text-[#94a3b8] hover:text-[#007570] hover:bg-[#f1f5f9] border-0 bg-transparent cursor-pointer"
                                  title="Salin Kode"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-[12px_14px]">
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-[6px] py-[1.5px] rounded-full bg-[#eff6ff] text-[#1d4ed8] font-bold text-[11px] w-fit">
                              {item.total_uses}x Dipakai
                            </span>
                            <span className="text-[11.5px] text-[#0f172a] font-semibold mt-[2px]">
                              Trx: Rp {Math.round(item.total_transactions).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </td>
                        <td className="p-[12px_14px] text-right">
                          <div className="flex flex-col items-end">
                            <div className="font-bold text-[#16a34a] text-[13px]">
                              Rp {Math.round(item.earned_commission).toLocaleString("id-ID")}
                            </div>
                            <span
                              className={`inline-flex items-center px-[7px] py-[1.5px] rounded-full text-[10.5px] font-bold mt-[2px] ${item.status === "active"
                                  ? "bg-[#dcfce7] text-[#16a34a]"
                                  : item.status === "suspended"
                                    ? "bg-[#fee2e2] text-[#dc2626]"
                                    : "bg-[#f1f5f9] text-[#64748b]"
                                }`}
                            >
                              {item.status === "active" ? "Aktif" : item.status === "suspended" ? "Suspended" : "Nonaktif"}
                            </span>
                          </div>
                        </td>
                        <td className="p-[12px_14px] text-center">
                          <div className="flex items-center justify-center gap-[4px]">
                            <button
                              onClick={() => handleEditReferralCode(item)}
                              className="p-[5px_8px] rounded-[6px] bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] text-[11px] font-semibold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Edit Kode"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleGenerateReferralCode(item)}
                              className="p-[5px_8px] rounded-[6px] bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] text-[11px] font-semibold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Generate Ulang Kode"
                            >
                              <RefreshCw size={12} />
                              <span>Regen</span>
                            </button>
                            <select
                              value={item.status}
                              onChange={(e) => handleToggleReferralStatus(item, e.target.value)}
                              className="p-[3px_5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[10.5px] font-semibold text-[#0f172a] cursor-pointer outline-none"
                            >
                              <option value="active">Aktif</option>
                              <option value="inactive">Nonaktif</option>
                              <option value="suspended">Suspend</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {referralCodesTotalPages > 1 && (
              <div className="p-[12px_16px] border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-[#64748b] flex-wrap gap-[10px] bg-[#fafafa]">
                <div>
                  Menampilkan halaman <strong>{referralCodesPage}</strong> dari <strong>{referralCodesTotalPages}</strong> (Total {referralCodesTotalItems} user)
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    disabled={referralCodesPage <= 1}
                    onClick={() => fetchReferralCodes(referralCodesPage - 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: referralCodesTotalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => fetchReferralCodes(pg)}
                      className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${referralCodesPage === pg
                          ? "bg-[#007570] text-white border-[#007570]"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={referralCodesPage >= referralCodesTotalPages}
                    onClick={() => fetchReferralCodes(referralCodesPage + 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtab 2: Referral Transactions View */}
        {referralSubTab === "transactions" && (
          <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm overflow-hidden">
            {/* Filter & Search */}
            <div className="p-[16px] border-b border-[#e2e8f0] flex flex-wrap gap-[10px] items-center justify-between bg-[#fafbfc]">
              <div className="flex items-center gap-[10px] flex-1 min-w-[240px] max-md:w-full">
                <div className="flex items-center gap-[8px] flex-1 bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[8px]">
                  <Search size={16} className="text-[#64748b] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari pembeli, pemilik, kode referral, no transaksi..."
                    value={referralTrxSearch}
                    onChange={(e) => setReferralTrxSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchReferralTransactions(1); }}
                    className="flex-1 border-0 outline-none text-[13px] text-[#0f172a]"
                  />
                  {referralTrxSearch && (
                    <button onClick={() => { setReferralTrxSearch(""); fetchReferralTransactions(1); }} className="text-[#94a3b8] hover:text-[#0f172a] border-0 bg-transparent cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => fetchReferralTransactions(1)}
                  className="px-[14px] py-[8px] rounded-[8px] bg-[#007570] text-white text-[13px] font-semibold cursor-pointer border-0 hover:bg-[#005a58]"
                >
                  Cari
                </button>
              </div>

              <div className="flex items-center gap-[10px] flex-wrap max-md:w-full">
                <select
                  value={referralTrxStatus}
                  onChange={(e) => {
                    setReferralTrxStatus(e.target.value);
                    setTimeout(() => fetchReferralTransactions(1), 50);
                  }}
                  className="px-[12px] py-[8px] bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] cursor-pointer outline-none focus:border-[#007570]"
                >
                  <option value="">Semua Status Referral</option>
                  <option value="pending">Menunggu Approval (Pending)</option>
                  <option value="approved">Disetujui (Approved)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>

                <select
                  value={referralTrxPaymentStatus}
                  onChange={(e) => {
                    setReferralTrxPaymentStatus(e.target.value);
                    setTimeout(() => fetchReferralTransactions(1), 50);
                  }}
                  className="px-[12px] py-[8px] bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] cursor-pointer outline-none focus:border-[#007570]"
                >
                  <option value="">Semua Status Bayar</option>
                  <option value="paid">Sudah Dibayar (Paid)</option>
                  <option value="pending">Menunggu Pembayaran</option>
                  <option value="failed">Gagal / Ditolak</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] text-[11px] uppercase tracking-wider border-b border-[#e2e8f0]">
                    <th className="p-[12px_14px] font-bold">ID &amp; Tanggal</th>
                    <th className="p-[12px_14px] font-bold">Pembeli &amp; Usaha</th>
                    <th className="p-[12px_14px] font-bold">Pemilik Referral</th>
                    <th className="p-[12px_14px] font-bold text-right">Rincian Biaya &amp; Komisi</th>
                    <th className="p-[12px_14px] font-bold text-center">Status</th>
                    <th className="p-[12px_14px] font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {loadingReferralTrx ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <SuradeLoader variant="section" size="sm" text="Memuat daftar transaksi referral" minHeight="160px" />
                      </td>
                    </tr>
                  ) : referralTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-[36px] text-center text-[#64748b]">
                        <FileText size={36} className="mx-auto mb-[8px] text-[#cbd5e1]" />
                        <p className="font-semibold text-[#0f172a]">Belum ada transaksi referral</p>
                        <p className="text-[12px] text-[#64748b] mt-[2px]">Transaksi pembelian paket Premium dengan kode referral akan muncul di sini</p>
                      </td>
                    </tr>
                  ) : (
                    referralTransactions.map((trx) => (
                      <tr key={trx.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-[12px_14px]">
                          <span className="font-mono text-[11.5px] font-bold text-[#007570] block">
                            {trx.transaction_code || `TRX-REF-${String(trx.id).padStart(5, '0')}`}
                          </span>
                          <span className="text-[10.5px] text-[#64748b] block mt-[1px]">{trx.created_at || '-'}</span>
                        </td>
                        <td className="p-[12px_14px]">
                          <div className="font-bold text-[#0f172a]">{trx.buyer?.name || trx.buyer_name || trx.referred_name || 'Pembeli'}</div>
                          <div className="text-[11px] text-[#64748b]">{trx.package_name || 'Paket Premium'} • {trx.business_name || 'Usaha Surade'}</div>
                        </td>
                        <td className="p-[12px_14px]">
                          <div className="font-semibold text-[#0f172a]">{trx.referrer?.name || trx.user_name || 'Mitra Referral'}</div>
                          <span className="font-mono text-[10.5px] text-[#007570] font-bold bg-[#f0fdfa] px-[6px] py-[1px] rounded border border-[#ccfbf1]">
                            {trx.referral_code || '-'}
                          </span>
                        </td>
                        <td className="p-[12px_14px] text-right">
                          <div className="font-extrabold text-[#0f172a]">
                            Rp {Math.round(Number(trx.final_price ?? trx.transaction_amount) || 0).toLocaleString("id-ID")}
                          </div>
                          <div className="text-[10.5px] text-[#16a34a] font-bold mt-[1px]">
                            Komisi: Rp {Math.round(Number(trx.commission_amount ?? trx.commission) || 0).toLocaleString("id-ID")}
                          </div>
                          {(Number(trx.discount_amount ?? trx.discount_given) || 0) > 0 && (
                            <div className="text-[10px] text-[#dc2626]">
                              Diskon: -Rp {Math.round(Number(trx.discount_amount ?? trx.discount_given) || 0).toLocaleString("id-ID")}
                            </div>
                          )}
                        </td>
                        <td className="p-[12px_14px] text-center">
                          <div className="flex flex-col items-center gap-[3px]">
                            <span
                              className={`inline-flex items-center px-[7px] py-[1.5px] rounded-full text-[10.5px] font-bold ${trx.payment_status === "paid" || trx.payment_status === "approved" || trx.status === "completed"
                                  ? "bg-[#dcfce7] text-[#16a34a]"
                                  : trx.payment_status === "failed" || trx.status === "cancelled" || trx.status === "rejected"
                                    ? "bg-[#fee2e2] text-[#dc2626]"
                                    : "bg-[#fef3c7] text-[#d97706]"
                                }`}
                            >
                              Bayar: {trx.payment_status === "paid" || trx.payment_status === "approved" || trx.status === "completed" ? "Lunas" : trx.payment_status === "failed" || trx.status === "cancelled" ? "Gagal" : "Pending"}
                            </span>
                            <span
                              className={`inline-flex items-center px-[7px] py-[1.5px] rounded-full text-[10.5px] font-bold ${trx.referral_status === "approved" || trx.referral_status === "paid" || trx.status === "completed"
                                  ? "bg-[#dcfce7] text-[#16a34a]"
                                  : trx.referral_status === "rejected" || trx.status === "cancelled"
                                    ? "bg-[#fee2e2] text-[#dc2626]"
                                    : "bg-[#fef3c7] text-[#d97706]"
                                }`}
                            >
                              Ref: {trx.referral_status === "approved" || trx.status === "completed" ? "Disetujui" : trx.referral_status === "rejected" || trx.status === "cancelled" ? "Ditolak" : trx.referral_status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </div>
                        </td>
                        <td className="p-[12px_14px] text-center">
                          <div className="flex items-center justify-center gap-[4px]">
                            {(trx.referral_status === "pending" || trx.status === "pending") && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedReferralItem(trx);
                                    setModal({ show: true, type: "confirmApproveReferralTrx", data: trx });
                                  }}
                                  className="p-[5px_8px] rounded-[6px] bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0] text-[11px] font-bold flex items-center gap-[2px] border-0 cursor-pointer transition-all"
                                  title="Setujui Referral"
                                >
                                  <Check size={12} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReferralItem(trx);
                                    setReferralReasonInput("");
                                    setModal({ show: true, type: "rejectReferralTrx", data: trx });
                                  }}
                                  className="p-[5px_8px] rounded-[6px] bg-[#fee2e2] text-[#dc2626] hover:bg-[#fecaca] text-[11px] font-bold flex items-center gap-[2px] border-0 cursor-pointer transition-all"
                                  title="Tolak Referral"
                                >
                                  <X size={12} />
                                  <span>Tolak</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedReferralItem(trx);
                                setModal({ show: true, type: "viewReferralDetail", data: trx });
                              }}
                              className="p-[5px_8px] rounded-[6px] bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] text-[11px] font-semibold flex items-center gap-[3px] border-0 cursor-pointer transition-all"
                              title="Lihat Detail & Timeline"
                            >
                              <Eye size={12} />
                              <span>Detail</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {referralTrxTotalPages > 1 && (
              <div className="p-[12px_16px] border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-[#64748b] flex-wrap gap-[10px] bg-[#fafafa]">
                <div>
                  Menampilkan halaman <strong>{referralTrxPage}</strong> dari <strong>{referralTrxTotalPages}</strong> (Total {referralTrxTotalItems} transaksi)
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    disabled={referralTrxPage <= 1}
                    onClick={() => fetchReferralTransactions(referralTrxPage - 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: referralTrxTotalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => fetchReferralTransactions(pg)}
                      className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${referralTrxPage === pg
                          ? "bg-[#007570] text-white border-[#007570]"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={referralTrxPage >= referralTrxTotalPages}
                    onClick={() => fetchReferralTransactions(referralTrxPage + 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtab 3: Commissions View */}
        {referralSubTab === "commissions" && (
          <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm overflow-hidden">
            {/* Filter & Search */}
            <div className="p-[16px] border-b border-[#e2e8f0] flex flex-wrap gap-[10px] items-center justify-between bg-[#fafbfc]">
              <div className="flex items-center gap-[10px] flex-1 min-w-[240px] max-md:w-full">
                <div className="flex items-center gap-[8px] flex-1 bg-white border border-[#e2e8f0] rounded-[8px] px-[12px] py-[8px]">
                  <Search size={16} className="text-[#64748b] shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari pemilik komisi, pembeli, kode referral..."
                    value={referralComSearch}
                    onChange={(e) => setReferralComSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchReferralCommissions(1); }}
                    className="flex-1 border-0 outline-none text-[13px] text-[#0f172a]"
                  />
                  {referralComSearch && (
                    <button onClick={() => { setReferralComSearch(""); fetchReferralCommissions(1); }} className="text-[#94a3b8] hover:text-[#0f172a] border-0 bg-transparent cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => fetchReferralCommissions(1)}
                  className="px-[14px] py-[8px] rounded-[8px] bg-[#007570] text-white text-[13px] font-semibold cursor-pointer border-0 hover:bg-[#005a58]"
                >
                  Cari
                </button>
              </div>

              <div className="flex items-center gap-[10px] max-md:w-full">
                <select
                  value={referralComPayoutStatus}
                  onChange={(e) => {
                    setReferralComPayoutStatus(e.target.value);
                    setTimeout(() => fetchReferralCommissions(1), 50);
                  }}
                  className="px-[12px] py-[8px] bg-white border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] cursor-pointer outline-none focus:border-[#007570]"
                >
                  <option value="">Semua Status Komisi</option>
                  <option value="pending">Menunggu (Pending)</option>
                  <option value="approved">Disetujui (Siap Cair)</option>
                  <option value="paid">Lunas (Sudah Dibayarkan)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] text-[11px] uppercase tracking-wider border-b border-[#e2e8f0]">
                    <th className="p-[12px_14px] font-bold">ID &amp; Waktu</th>
                    <th className="p-[12px_14px] font-bold">Penerima &amp; Pembeli</th>
                    <th className="p-[12px_14px] font-bold text-right">Harga &amp; Komisi (Rp 10.000)</th>
                    <th className="p-[12px_14px] font-bold text-center">Status Pencairan</th>
                    <th className="p-[12px_14px] font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {loadingReferralCom ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        <SuradeLoader variant="section" size="sm" text="Memuat data komisi referral" minHeight="160px" />
                      </td>
                    </tr>
                  ) : referralCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-[36px] text-center text-[#64748b]">
                        <DollarSign size={36} className="mx-auto mb-[8px] text-[#cbd5e1]" />
                        <p className="font-semibold text-[#0f172a]">Belum ada komisi referral</p>
                        <p className="text-[12px] text-[#64748b] mt-[2px]">Data komisi dari transaksi referral akan tercatat di tabel ini</p>
                      </td>
                    </tr>
                  ) : (
                    referralCommissions.map((com) => (
                      <tr key={com.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-[12px_14px]">
                          <span className="font-mono text-[11.5px] font-bold text-[#007570] block">
                            {com.transaction_code || `TRX-REF-${String(com.id).padStart(5, '0')}`}
                          </span>
                          <span className="text-[10.5px] text-[#64748b] block mt-[1px]">{com.created_at || '-'}</span>
                        </td>
                        <td className="p-[12px_14px]">
                          <div className="font-bold text-[#0f172a]">{com.referrer?.name || com.user_name || 'Mitra Referral'}</div>
                          <div className="text-[11px] text-[#64748b]">{com.referrer?.email || com.user_email || '-'}</div>
                          <div className="text-[10.5px] text-[#475569] mt-[2px]">
                            Pembeli: <span className="font-semibold">{com.buyer_name || com.referred_name || 'Pembeli'}</span>
                          </div>
                        </td>
                        <td className="p-[12px_14px] text-right">
                          <div className="font-extrabold text-[#16a34a] text-[13.5px]">
                            Rp {Math.round(Number(com.commission_amount ?? com.commission) || 0).toLocaleString("id-ID")}
                          </div>
                          <div className="text-[11px] text-[#64748b]">
                            Final Trx: Rp {Math.round(Number(com.final_price ?? com.transaction_amount) || 0).toLocaleString("id-ID")}
                          </div>
                          {com.adjusted_amount !== null && (
                            <span className="text-[9.5px] text-[#d97706] font-semibold block mt-[1px]" title={`Disesuaikan oleh ${com.adjusted_by}: ${com.adjustment_reason}`}>
                              ✏️ Di-adjust Admin
                            </span>
                          )}
                        </td>
                        <td className="p-[12px_14px] text-center">
                          <div className="flex flex-col items-center gap-[2px]">
                            <span
                              className={`inline-flex items-center px-[7px] py-[1.5px] rounded-full text-[10.5px] font-bold ${com.payout_status === "paid"
                                  ? "bg-[#dcfce7] text-[#16a34a]"
                                  : com.payout_status === "approved"
                                    ? "bg-[#dbeafe] text-[#1d4ed8]"
                                    : com.payout_status === "rejected"
                                      ? "bg-[#fee2e2] text-[#dc2626]"
                                      : "bg-[#fef3c7] text-[#d97706]"
                                }`}
                            >
                              {com.payout_status === "paid" ? "Lunas" : com.payout_status === "approved" ? "Disetujui" : com.payout_status === "rejected" ? "Ditolak" : "Pending"}
                            </span>
                            {com.paid_at && (
                              <span className="text-[10px] text-[#64748b]">Cair: {com.paid_at}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-[12px_14px] text-center">
                          <div className="flex items-center justify-center gap-[4px]">
                            {com.payout_status !== "paid" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedReferralItem(com);
                                    setModal({ show: true, type: "confirmMarkPaidReferralCom", data: com });
                                  }}
                                  className="p-[5px_8px] rounded-[6px] bg-[#dcfce7] text-[#16a34a] hover:bg-[#bbf7d0] text-[11px] font-bold flex items-center gap-[2px] border-0 cursor-pointer transition-all"
                                  title="Tandai Sudah Dibayarkan"
                                >
                                  <DollarSign size={12} />
                                  <span>Bayar</span>
                                </button>
                                {com.payout_status !== "approved" && (
                                  <button
                                    onClick={() => {
                                      setSelectedReferralItem(com);
                                      setModal({ show: true, type: "confirmApproveReferralCom", data: com });
                                    }}
                                    className="p-[5px_8px] rounded-[6px] bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe] text-[11px] font-semibold border-0 cursor-pointer"
                                    title="Approve Komisi"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}
                              </>
                            )}
                            <button
                              onClick={() => {
                                setSelectedReferralItem(com);
                                setReferralAdjustAmountInput(String(com.commission_amount));
                                setReferralAdjustReasonInput(com.adjustment_reason || "");
                                setModal({ show: true, type: "adjustReferralCom", data: com });
                              }}
                              className="p-[5px_8px] rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] text-[11px] font-semibold flex items-center gap-[2px] cursor-pointer"
                              title="Adjustment Komisi"
                            >
                              <Edit size={12} />
                              <span>Adjust</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {referralComTotalPages > 1 && (
              <div className="p-[12px_16px] border-t border-[#e2e8f0] flex items-center justify-between text-[12px] text-[#64748b] flex-wrap gap-[10px] bg-[#fafafa]">
                <div>
                  Menampilkan halaman <strong>{referralComPage}</strong> dari <strong>{referralComTotalPages}</strong> (Total {referralComTotalItems} item komisi)
                </div>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    disabled={referralComPage <= 1}
                    onClick={() => fetchReferralCommissions(referralComPage - 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: referralComTotalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => fetchReferralCommissions(pg)}
                      className={`min-w-[28px] h-[28px] px-1 rounded-[6px] text-[12px] font-bold transition-colors cursor-pointer border ${referralComPage === pg
                          ? "bg-[#007570] text-white border-[#007570]"
                          : "bg-white text-[#64748b] border-[#e2e8f0] hover:bg-[#f8fafc]"
                        }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={referralComPage >= referralComTotalPages}
                    onClick={() => fetchReferralCommissions(referralComPage + 1)}
                    className="px-[10px] py-[5px] rounded-[6px] bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] font-bold text-[12px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subtab: Referral Withdrawals View */}
        {referralSubTab === "withdrawals" && renderWithdrawalsTable()}

        {/* Subtab 4: Referral Settings View */}
        {referralSubTab === "settings" && (
          <div className="bg-white rounded-[14px] border border-[#e2e8f0] shadow-sm p-[24px] max-w-[800px]">
            <div className="mb-[20px] pb-[16px] border-b border-[#e2e8f0]">
              <h3 className="text-[16px] font-bold text-[#0f172a]">Pengaturan Sistem Referral</h3>
              <p className="text-[12.5px] text-[#64748b] mt-[2px]">
                Konfigurasi persentase diskon, komisi, serta aturan approval program referral
              </p>
            </div>

            {loadingReferralSettings ? (
              <div className="p-6 text-center">
                <SuradeLoader variant="section" size="sm" text="Memuat pengaturan referral" minHeight="160px" />
              </div>
            ) : (
              <form onSubmit={handleSaveReferralSettings} className="flex flex-col gap-[20px]">
                {/* 1. Status Fitur */}
                <div className="flex items-center justify-between p-[16px] rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0f172a]">Status Program Referral</h4>
                    <p className="text-[12px] text-[#64748b] mt-[1px]">
                      Aktifkan atau nonaktifkan penggunaan kode referral pada checkout paket Premium
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={referralSettings.referral_enabled}
                      onChange={(e) => setReferralSettings({ ...referralSettings, referral_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-[44px] h-[24px] bg-[#cbd5e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#cbd5e1] after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>

                {/* 2. Persentase Diskon Pembeli */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div className="p-[16px] rounded-[12px] border border-[#e2e8f0] bg-white">
                    <label className="block text-[12.5px] font-bold text-[#0f172a] mb-[4px]">
                      Potongan Diskon Pengguna Referral (Rp) *
                    </label>
                    <p className="text-[11.5px] text-[#64748b] mb-[10px]">
                      Nominal potongan rupiah bagi pengguna saat membeli Paket Premium dengan kode referral (Default: Rp 5.000)
                    </p>
                    <div className="relative">
                      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 font-bold text-[#64748b]">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={referralSettings.referral_discount_amount || 5000}
                        onChange={(e) => setReferralSettings({ ...referralSettings, referral_discount_amount: Number(e.target.value) })}
                        className="w-full pl-[40px] pr-[14px] py-[10px] rounded-[8px] border border-[#e2e8f0] text-[14px] font-bold text-[#0f172a] outline-none focus:border-[#007570]"
                      />
                    </div>
                  </div>

                  {/* 3. Komisi Pemilik Referral (Rp) */}
                  <div className="p-[16px] rounded-[12px] border border-[#e2e8f0] bg-white">
                    <label className="block text-[12.5px] font-bold text-[#0f172a] mb-[4px]">
                      Komisi Pemilik Kode Referral (Rp) *
                    </label>
                    <p className="text-[11.5px] text-[#64748b] mb-[10px]">
                      Nominal komisi tunai tetap yang didapatkan pemilik kode referral dari setiap transaksi (Default: Rp 10.000)
                    </p>
                    <div className="relative">
                      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 font-bold text-[#64748b]">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        value={referralSettings.referral_commission_amount || 10000}
                        onChange={(e) => setReferralSettings({ ...referralSettings, referral_commission_amount: Number(e.target.value) })}
                        className="w-full pl-[40px] pr-[14px] py-[10px] rounded-[8px] border border-[#e2e8f0] text-[14px] font-bold text-[#0f172a] outline-none focus:border-[#007570]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Wajib Approval Manual */}
                <div className="flex items-center justify-between p-[16px] rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0f172a]">Wajib Approval Admin untuk Transaksi</h4>
                    <p className="text-[12px] text-[#64748b] mt-[1px]">
                      Setiap transaksi referral masuk status Pending dan memerlukan approval admin sebelum komisi dicairkan
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={referralSettings.referral_approval_required}
                      onChange={(e) => setReferralSettings({ ...referralSettings, referral_approval_required: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-[44px] h-[24px] bg-[#cbd5e1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#cbd5e1] after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-[10px]">
                  <button
                    type="submit"
                    disabled={savingReferralSettings}
                    className="px-[24px] py-[12px] rounded-[10px] bg-[#007570] text-white font-bold text-[13.5px] cursor-pointer border-0 shadow-md hover:bg-[#005a58] transition-all disabled:opacity-50 flex items-center gap-[8px]"
                  >
                    {savingReferralSettings && <RefreshCw size={16} className="animate-spin" />}
                    <span>{savingReferralSettings ? "Menyimpan..." : "Simpan Pengaturan Referral"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── 9. Content Pricing & Transactions (Blog & Event) View ──
  const renderContentPricing = () => {
    const filteredTransactions = contentTransactions.filter((tx) => {
      if (contentTxTypeFilter !== "all" && tx.content_type !== contentTxTypeFilter && tx.type !== contentTxTypeFilter) {
        return false;
      }
      if (contentTxStatusFilter !== "all" && tx.payment_status !== contentTxStatusFilter) {
        return false;
      }
      if (contentTxSearch) {
        const q = contentTxSearch.toLowerCase();
        const code = (tx.transaction_code || "").toLowerCase();
        const userName = (tx.user?.name || "").toLowerCase();
        const userEmail = (tx.user?.email || "").toLowerCase();
        const blogTitle = (tx.blog?.title || "").toLowerCase();
        return code.includes(q) || userName.includes(q) || userEmail.includes(q) || blogTitle.includes(q);
      }
      return true;
    });

    return (
      <div className="flex flex-col gap-[20px]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[14px] bg-white p-[20px_24px] rounded-[16px] border border-[#e2e8f0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-black text-[#0f172a] tracking-tight">
                Tarif & Transaksi Blog/Event
              </h2>
              <span className="bg-teal-100 text-[#007570] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Pay Per Post
              </span>
            </div>
            <p className="text-[12.5px] text-[#64748b] mt-[3px]">
              Atur tarif biaya upload per postingan untuk Blog dan Event, serta kelola dan verifikasi pembayaran pengguna.
            </p>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={() => {
                fetchContentPricing();
                if (contentPricingSubTab === "transactions") {
                  fetchContentTransactions(contentTxPage);
                }
              }}
              className="inline-flex items-center gap-[6px] px-[14px] py-[9px] rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[12.5px] font-bold hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw size={14} className={loadingContentTransactions ? "animate-spin" : ""} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* Stats Overview Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pendapatan Blog</span>
            <span className="text-base font-black text-[#007570] mt-1 block">
              Rp {Number(stats.blogRevenue || 0).toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.totalBlogTransactions || 0} posting lunas</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pendapatan Event</span>
            <span className="text-base font-black text-purple-700 mt-1 block">
              Rp {Number(stats.eventRevenue || 0).toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">{stats.totalEventTransactions || 0} event lunas</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Omset</span>
            <span className="text-base font-black text-slate-900 mt-1 block">
              Rp {Number(stats.totalContentRevenue || ((stats.blogRevenue || 0) + (stats.eventRevenue || 0))).toLocaleString("id-ID")}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Publikasi Konten</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
            <span className="text-base font-black text-blue-700 mt-1 block">
              {(stats.totalBlogTransactions || 0) + (stats.totalEventTransactions || 0)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Semua waktu</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/40 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Perlu Konfirmasi</span>
            <span className="text-base font-black text-amber-800 mt-1 block">
              {stats.pendingContentPayments || 0}
            </span>
            <span className="text-[11px] text-amber-600 mt-0.5 block">Transaksi pending</span>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-[8px] bg-[#f1f5f9] p-[5px] rounded-[12px] w-fit">
          <button
            onClick={() => setContentPricingSubTab("pricing")}
            className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${contentPricingSubTab === "pricing"
                ? "bg-white text-[#007570] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <DollarSign size={16} />
            <span>Atur Tarif Upload (Pricing)</span>
          </button>
          <button
            onClick={() => {
              setContentPricingSubTab("transactions");
              fetchContentTransactions(1);
            }}
            className={`flex items-center gap-[7px] px-[16px] py-[8px] rounded-[9px] text-[13px] font-bold transition-all cursor-pointer ${contentPricingSubTab === "transactions"
                ? "bg-white text-[#007570] shadow-xs"
                : "text-[#64748b] hover:text-[#0f172a]"
              }`}
          >
            <CreditCard size={16} />
            <span>Transaksi & Pembayaran</span>
            {contentTransactions.some((t) => t.payment_status === "pending") && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>

        {/* ── Subtab 1: Atur Tarif Upload ── */}
        {contentPricingSubTab === "pricing" && (
          <div className="flex flex-col gap-[20px]">
            {/* Info Notice */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200/80 text-xs text-slate-700 flex items-start gap-3">
              <Shield size={20} className="text-[#007570] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Mekanisme Tarif Pay-Per-Post Dinamis</strong>
                <p className="leading-relaxed">
                  Tarif di bawah ini menentukan biaya yang dikenakan kepada Business Owner setiap kali mereka membuat dan mempublikasikan 1 Blog atau 1 Event. Nominal ini disimpan secara historis ke setiap transaksi, sehingga perubahan harga di masa mendatang tidak akan memengaruhi transaksi yang telah tercatat sebelumnya.
                </p>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blog Upload Fee Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#007570] border border-teal-200 flex items-center justify-center font-bold">
                      <FileText size={24} />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${contentPricing.blog_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${contentPricing.blog_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {contentPricing.blog_active ? "Tarif Aktif" : "Nonaktif (Gratis)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kategori Publikasi
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      Tarif Upload Blog (Pay-Per-Post)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Biaya yang dibayarkan oleh pengguna untuk menerbitkan 1 artikel blog promosi di platform Surade.com.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-500">Biaya per 1x Posting:</span>
                    <span className="text-2xl font-black text-[#007570]">
                      Rp {Number(contentPricing.blog || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Terakhir diperbarui sistem</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPricingType("blog");
                      setPricingEditForm({
                        price: contentPricing.blog,
                        is_active: contentPricing.blog_active,
                      });
                      setModal({ show: true, type: "editContentPricing", data: { type: "blog", price: contentPricing.blog, is_active: contentPricing.blog_active } });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Tarif Blog</span>
                  </button>
                </div>
              </div>

              {/* Event Upload Fee Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                      <Calendar size={24} />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${contentPricing.event_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${contentPricing.event_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {contentPricing.event_active ? "Tarif Aktif" : "Nonaktif (Gratis)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kategori Publikasi
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      Tarif Upload Event (Pay-Per-Post)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Biaya yang dibayarkan oleh pengguna untuk menerbitkan 1 agenda acara / event di platform Surade.com.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-500">Biaya per 1x Posting:</span>
                    <span className="text-2xl font-black text-purple-700">
                      Rp {Number(contentPricing.event || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Terakhir diperbarui sistem</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPricingType("event");
                      setPricingEditForm({
                        price: contentPricing.event,
                        is_active: contentPricing.event_active,
                      });
                      setModal({ show: true, type: "editContentPricing", data: { type: "event", price: contentPricing.event, is_active: contentPricing.event_active } });
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit size={14} />
                    <span>Edit Tarif Event</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Subtab 2: Transaksi Pay-Per-Post ── */}
        {contentPricingSubTab === "transactions" && (
          <div className="flex flex-col gap-[16px]">
            {/* Filters Bar */}
            <div className="bg-white p-[16px_20px] rounded-[16px] border border-[#e2e8f0] flex flex-col md:flex-row items-center justify-between gap-[12px] shadow-xs">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kode transaksi, pembeli, email, atau judul posting..."
                  value={contentTxSearch}
                  onChange={(e) => setContentTxSearch(e.target.value)}
                  className="w-full pl-[38px] pr-[14px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#007570] focus:ring-1 focus:ring-[#007570]"
                />
              </div>

              <div className="flex items-center gap-[10px] w-full md:w-auto overflow-x-auto">
                <select
                  value={contentTxTypeFilter}
                  onChange={(e) => setContentTxTypeFilter(e.target.value)}
                  className="px-[12px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[12.5px] font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#007570] cursor-pointer"
                >
                  <option value="all">Semua Tipe Konten</option>
                  <option value="blog">Posting Blog</option>
                  <option value="event">Posting Event</option>
                </select>

                <select
                  value={contentTxStatusFilter}
                  onChange={(e) => setContentTxStatusFilter(e.target.value)}
                  className="px-[12px] py-[9px] rounded-[10px] border border-[#e2e8f0] text-[12.5px] font-semibold text-[#0f172a] bg-white focus:outline-none focus:border-[#007570] cursor-pointer"
                >
                  <option value="all">Semua Status Bayar</option>
                  <option value="pending">Menunggu (Pending)</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="failed">Ditolak (Failed)</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-[16px] border border-[#e2e8f0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-black text-[#64748b] uppercase tracking-wider">
                      <th className="p-[14px_18px]">Transaksi</th>
                      <th className="p-[14px_16px]">Pembeli</th>
                      <th className="p-[14px_16px]">Konten Terkait</th>
                      <th className="p-[14px_16px]">Total Bayar</th>
                      <th className="p-[14px_16px] text-center">Bukti Bayar</th>
                      <th className="p-[14px_16px] text-center">Status</th>
                      <th className="p-[14px_18px] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-[12.5px]">
                    {loadingContentTransactions ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center">
                          <SuradeLoader variant="section" size="sm" text="Memuat daftar transaksi" minHeight="160px" />
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-[60px] text-center text-slate-400">
                          <CreditCard size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-slate-700">Tidak ada data transaksi</p>
                          <p className="text-[11.5px]">Tidak ada transaksi pay-per-post yang cocok dengan filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const isBlog = tx.content_type === "blog";
                        const proofUrl = tx.payment_proof ? getStorageUrl(tx.payment_proof) : null;
                        const isPaid = tx.payment_status === "paid";
                        const isPending = tx.payment_status === "pending";
                        const isFailed = tx.payment_status === "failed";

                        return (
                          <tr key={tx.id} className="hover:bg-[#f8fafc] transition-colors">
                            {/* Transaksi Code & Date */}
                            <td className="p-[14px_18px]">
                              <div className="flex flex-col">
                                <span className="font-mono font-bold text-[#0f172a] text-[13px]">
                                  {tx.transaction_code}
                                </span>
                                <span className="text-[11px] text-[#94a3b8]">
                                  {tx.created_at ? new Date(tx.created_at).toLocaleString("id-ID") : "-"}
                                </span>
                                {tx.notes && (
                                  <span className="text-[10.5px] text-rose-500 font-medium mt-0.5 truncate max-w-[180px]" title={tx.notes}>
                                    Catatan: {tx.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Pembeli */}
                            <td className="p-[14px_16px]">
                              <div className="flex items-center gap-2">
                                <img
                                  src={tx.user?.avatar ? getStorageUrl(tx.user.avatar) : `https://api.dicebear.com/7.x/initials/svg?seed=${tx.user?.name || 'User'}`}
                                  alt={tx.user?.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-[#0f172a] truncate">{tx.user?.name || "Pengguna"}</span>
                                  <span className="text-[11px] text-[#64748b] truncate">{tx.user?.email || "-"}</span>
                                </div>
                              </div>
                            </td>

                            {/* Konten Terkait */}
                            <td className="p-[14px_16px]">
                              <div className="flex flex-col gap-1 items-start max-w-[220px]">
                                <span
                                  className={`inline-flex items-center gap-1 px-[7px] py-[1px] rounded text-[10px] font-black uppercase tracking-wider ${isBlog
                                      ? "bg-teal-50 text-[#007570] border border-teal-100"
                                      : "bg-purple-50 text-purple-700 border border-purple-100"
                                    }`}
                                >
                                  {isBlog ? <FileText size={10} /> : <Calendar size={10} />}
                                  {isBlog ? "Blog" : "Event"}
                                </span>
                                <span
                                  className="font-bold text-[#0f172a] truncate block hover:text-[#007570] cursor-pointer"
                                  title={tx.blog?.title || `Konten ID #${tx.content_id}`}
                                  onClick={() => tx.content_id && window.open(`/blog/${tx.content_id}`, "_blank")}
                                >
                                  {tx.blog?.title || `Konten #${tx.content_id}`}
                                </span>
                              </div>
                            </td>

                            {/* Nominal */}
                            <td className="p-[14px_16px]">
                              <div className="flex flex-col">
                                <span className="font-black text-[#0f172a] text-[13.5px]">
                                  Rp {Number(tx.amount || 0).toLocaleString("id-ID")}
                                </span>
                                {tx.discount_amount > 0 && (
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    Diskon: -Rp {Number(tx.discount_amount).toLocaleString("id-ID")}
                                    {tx.referral_code ? ` (Ref: ${tx.referral_code})` : (tx.coupon?.code ? ` (Kupon: ${tx.coupon.code})` : "")}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Bukti Bayar */}
                            <td className="p-[14px_16px] text-center">
                              {proofUrl ? (
                                <button
                                  onClick={() => setModal({ show: true, type: "viewContentProof", data: { url: proofUrl, tx } })}
                                  className="group relative inline-block rounded-lg overflow-hidden border border-slate-200 shadow-2xs hover:border-[#007570] transition-all cursor-pointer"
                                  title="Lihat Bukti Transfer"
                                >
                                  <img src={proofUrl} alt="Bukti" className="w-10 h-10 object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Tidak Ada</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-[14px_16px] text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-bold ${isPaid
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isPending
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"}`} />
                                {isPaid ? "Lunas" : isPending ? "Menunggu" : "Ditolak"}
                              </span>
                            </td>

                            {/* Aksi */}
                            <td className="p-[14px_18px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      onClick={() => handleApproveContentTx(tx)}
                                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                      title="Setujui Pembayaran & Publish Konten"
                                    >
                                      <Check size={14} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedContentTx(tx);
                                        setContentTxRejectReason("");
                                        setModal({ show: true, type: "rejectContentTx", data: tx });
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                      title="Tolak Pembayaran"
                                    >
                                      <CloseIcon size={14} strokeWidth={2.5} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setModal({ show: true, type: "viewContentTxDetail", data: tx })}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                                  title="Rincian Lengkap"
                                >
                                  <Eye size={14} />
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
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Payment & Bank Accounts Management Section (Kelola Pembayaran) ──
  const renderPaymentSettings = () => {
    const filteredPaymentMethods = paymentMethodsList.filter(item => {
      if (paymentCategoryFilter === "all") return true;
      if (paymentCategoryFilter === "bank") return item.category === "bank";
      if (paymentCategoryFilter === "ewallet") return item.category === "ewallet";
      if (paymentCategoryFilter === "qris") return item.category === "qris" || item.isQRIS;
      return true;
    });

    return (
      <div className="space-y-8 mb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-[#007570]">
                <CreditCard size={22} strokeWidth={2} />
              </span>
              <h2 className="text-xl font-bold text-[#0f172a]">
                Kelola Pembayaran &amp; Rekening Bank (Seluruh Fitur Website)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-10">
              Kelola nomor rekening resmi Bank, E-Wallet, dan QRIS yang terhubung secara otomatis ke seluruh modal transaksi di platform (Akses Kontak WA, Fitur Bisnis, Premium, Blog &amp; Event, Iklan).
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowAddPaymentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#007570] font-bold text-xs transition-all border border-teal-200 cursor-pointer shadow-2xs"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Rekening / E-Wallet</span>
            </button>
            <button
              type="button"
              onClick={saveWaSettings}
              disabled={savingWaSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-all border-0 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {savingWaSettings ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
              <span>{savingWaSettings ? "Menyimpan..." : "Simpan Pengaturan Rekening"}</span>
            </button>
          </div>
        </div>

        {/* ── SECTION 0: ATURAN METODE PEMBAYARAN PLATFORM (TRANSFER BANK, QRIS & POIN) ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 via-slate-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-100 text-[#007570]">
                  <Sliders size={18} />
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Aturan Metode Pembayaran Terpusat (Sistem Transaksi Platform)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Aturan di bawah ini berlaku otomatis dan konsisten di seluruh modul pembayaran website (Premium Usaha, Iklan Banner, Publikasi Info &amp; Event, serta Akses Kontak WhatsApp).
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Sinkronisasi Otomatis Aktif
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Aturan Transfer Bank */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                      <CreditCard size={18} />
                    </span>
                    <span className="text-sm font-bold text-slate-800">Transfer Bank</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentRulesForm.bank_transfer_enabled}
                      onChange={(e) => setPaymentRulesForm(p => ({ ...p, bank_transfer_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Metode transfer manual ke nomor rekening bank resmi (Mandiri, BNI, BCA, BJB, Maybank).
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Batas Minimal Nominal Transfer Bank (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={paymentRulesForm.bank_transfer_min_amount}
                      onChange={(e) => setPaymentRulesForm(p => ({ ...p, bank_transfer_min_amount: Math.max(0, Number(e.target.value)) }))}
                      className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007570]/30"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <strong>Aturan Berlaku:</strong> Jika total pembayaran akhir <strong>di bawah Rp {Number(paymentRulesForm.bank_transfer_min_amount || 10000).toLocaleString("id-ID")}</strong>, metode Transfer Bank otomatis disembunyikan dan hanya menampilkan QRIS serta Poin.
              </div>
            </div>

            {/* Card 2: Aturan QRIS */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-teal-100 text-[#007570]">
                      <QrCode size={18} />
                    </span>
                    <span className="text-sm font-bold text-slate-800">QRIS Instan</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentRulesForm.qris_enabled}
                      onChange={(e) => setPaymentRulesForm(p => ({ ...p, qris_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Mendukung seluruh Mobile Banking (BCA, Mandiri, BRI, BNI) dan E-Wallet (Dana, OVO, GoPay, ShopeePay).
                </p>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Jangkauan Nominal:</span>
                  <span className="text-xs text-emerald-700 font-semibold block">
                    ✓ Aktif untuk semua nominal (Termasuk transaksi di bawah Rp 10.000)
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200/80 text-[11px] text-teal-900 leading-relaxed">
                <strong>Status QRIS:</strong> {paymentRulesForm.qris_enabled ? "Aktif & Ditampilkan kepada seluruh pengguna." : "Dinonaktifkan oleh Admin (Tidak tampil)."}
              </div>
            </div>

            {/* Card 3: Aturan Poin (Silver & Gold) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                      <Coins size={18} />
                    </span>
                    <span className="text-sm font-bold text-slate-800">Poin Platform (Silver/Gold)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentRulesForm.points_enabled}
                      onChange={(e) => setPaymentRulesForm(p => ({ ...p, points_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Pembayaran instan langsung terbit otomatis tanpa menunggu persetujuan admin manual.
                </p>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nilai Tukar 1 Poin (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="100"
                        step="100"
                        value={paymentRulesForm.point_exchange_rate_idr}
                        onChange={(e) => setPaymentRulesForm(p => ({ ...p, point_exchange_rate_idr: Math.max(1, Number(e.target.value)) }))}
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007570]/30"
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Jenis Poin yang Diterima
                    </label>
                    <select
                      value={paymentRulesForm.points_allowed_types}
                      onChange={(e) => setPaymentRulesForm(p => ({ ...p, points_allowed_types: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007570]/30"
                    >
                      <option value="both">Silver &amp; Gold Poin (Direkomendasikan)</option>
                      <option value="gold_only">Gold Poin Saja</option>
                      <option value="silver_only">Silver Poin Saja</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <strong>Status Poin:</strong> {paymentRulesForm.points_enabled ? `Aktif (1 Poin = Rp ${Number(paymentRulesForm.point_exchange_rate_idr || 1000).toLocaleString("id-ID")})` : "Dinonaktifkan oleh Admin (Sembunyikan opsi Poin)."}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 1: DAFTAR REKENING BANK & E-WALLET RESMI ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-base font-bold text-slate-800">Daftar Rekening Bank &amp; E-Wallet Resmi Website</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua rekening yang berstatus aktif di bawah ini otomatis tampil pada pemilih metode pembayaran website.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentCategoryFilter === "all" ? "bg-white text-[#007570] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Semua ({paymentMethodsList.length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentCategoryFilter("bank")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentCategoryFilter === "bank" ? "bg-white text-[#007570] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Bank ({paymentMethodsList.filter(p => p.category === "bank").length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentCategoryFilter("ewallet")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentCategoryFilter === "ewallet" ? "bg-white text-[#007570] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                E-Wallet ({paymentMethodsList.filter(p => p.category === "ewallet").length})
              </button>
              <button
                type="button"
                onClick={() => setPaymentCategoryFilter("qris")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${paymentCategoryFilter === "qris" ? "bg-white text-[#007570] shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                QRIS ({paymentMethodsList.filter(p => p.category === "qris" || p.isQRIS).length})
              </button>
            </div>
          </div>

          {/* Global Official Account Holder Info */}
          <div className="px-6 py-4 bg-emerald-50/60 border-b border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Shield size={16} />
              </span>
              <div>
                <span className="text-xs font-bold text-emerald-900 block">Nama Pemilik Resmi Platform (Atas Nama):</span>
                <span className="text-xs text-emerald-700">Nama rekening acuan resmi yang ditampilkan kepada seluruh pengguna</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={paymentOfficialHolder}
                onChange={(e) => setPaymentOfficialHolder(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-56 shadow-2xs"
                placeholder="Triwala Mitra Bestari"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPaymentMethods.map((method, idx) => {
              const realIndex = paymentMethodsList.findIndex(m => m.id === method.id);
              return (
                <div
                  key={method.id || idx}
                  className={`p-4 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${method.isActive !== false
                      ? "bg-white border-slate-200 hover:border-teal-400 hover:shadow-md"
                      : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                          {method.logoUrl ? (
                            <img
                              src={method.logoUrl}
                              alt={method.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-base">{method.logo || "🏦"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 truncate">{method.name}</h4>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            {method.category === "ewallet" ? "E-Wallet" : method.category === "qris" ? "QRIS Code" : "Transfer Bank"}
                          </span>
                        </div>
                      </div>

                      {/* Status Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => togglePaymentMethodActive(realIndex)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${method.isActive !== false ? "bg-[#007570]" : "bg-slate-300"
                          }`}
                        title={method.isActive !== false ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${method.isActive !== false ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                      </button>
                    </div>

                    {/* Account Details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">No. Rekening / HP:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-800 select-all">{method.accountNumber || "xxxx"}</span>
                          {method.accountNumber && method.accountNumber !== "Scan QR Code" && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(method.accountNumber);
                                alert(`Nomor ${method.name} berhasil disalin!`);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title="Salin Nomor"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Atas Nama:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]" title={method.accountName || paymentOfficialHolder}>
                          {method.accountName || paymentOfficialHolder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${method.isActive !== false ? "text-emerald-600" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${method.isActive !== false ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                      {method.isActive !== false ? "Aktif di Website" : "Nonaktif"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingPaymentMethod(method)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      {String(method.id).includes("_") && (
                        <button
                          type="button"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                          title="Hapus Metode Pembayaran"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: QRIS CODE MANAGEMENT CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#007570]">
              <Zap size={18} />
            </span>
            <h3 className="text-sm font-bold text-slate-800">Pengaturan Gambar QRIS Resmi Platform</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            QRIS ini ditampilkan pada checkout ketika pembeli/pelaku usaha memilih metode pembayaran QRIS Instan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200">
              {waAdminSettings.qris_image ? (
                <div className="text-center space-y-2">
                  <img
                    src={waAdminSettings.qris_image}
                    alt="QRIS Resmi"
                    className="w-48 h-48 object-contain rounded-lg border border-slate-200 bg-white p-2 shadow-xs mx-auto"
                  />
                  <span className="text-xs font-bold text-emerald-600 block">✓ Gambar QRIS Resmi Aktif</span>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <img src="/logos/qris.png" alt="QRIS" className="w-28 h-auto mx-auto opacity-70" />
                  <p className="text-xs text-slate-500 font-medium">QRIS Standar Sistem Aktif</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Unggah / Ganti Gambar QRIS Baru (PNG/JPG):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWaQrisFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#007570] hover:file:bg-teal-100 cursor-pointer"
                />
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Tips QRIS:</strong> Pastikan QRIS yang diunggah berupa QR Dinamis/Statis resmi atas nama platform ({paymentOfficialHolder}) dengan kontras tajam agar mudah dipindai oleh semua aplikasi m-Banking dan E-Wallet.
              </div>
              <button
                type="button"
                onClick={saveWaSettings}
                disabled={savingWaSettings}
                className="px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                {savingWaSettings ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Simpan Gambar QRIS</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── MODAL: EDIT PAYMENT METHOD ── */}
        {editingPaymentMethod && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold text-slate-800">Edit Metode Pembayaran</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPaymentMethod(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    value={editingPaymentMethod.name}
                    onChange={(e) => setEditingPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#007570]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    value={editingPaymentMethod.accountNumber}
                    onChange={(e) => setEditingPaymentMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#007570]"
                    placeholder="Contoh: 133-0011-409-331"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Rekening (Atas Nama)</label>
                  <input
                    type="text"
                    value={editingPaymentMethod.accountName || paymentOfficialHolder}
                    onChange={(e) => setEditingPaymentMethod(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#007570]"
                    placeholder="Triwala Mitra Bestari"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Status Pembayaran Aktif:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPaymentMethod.isActive !== false}
                      onChange={(e) => setEditingPaymentMethod(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#007570]"></div>
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPaymentMethod(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEditPaymentMethod(editingPaymentMethod)}
                  className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: TAMBAH REKENING / E-WALLET BARU ── */}
        {showAddPaymentModal && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Plus size={18} className="text-[#007570]" />
                  <h3 className="text-sm font-bold text-slate-800">Tambah Rekening / E-Wallet Baru</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPaymentForm(prev => ({ ...prev, category: "bank" }))}
                      className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${newPaymentForm.category === "bank" ? "bg-teal-50 border-[#007570] text-[#007570]" : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      🏦 Rekening Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPaymentForm(prev => ({ ...prev, category: "ewallet" }))}
                      className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${newPaymentForm.category === "ewallet" ? "bg-teal-50 border-[#007570] text-[#007570]" : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      💜 E-Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPaymentForm(prev => ({ ...prev, category: "qris" }))}
                      className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${newPaymentForm.category === "qris" ? "bg-teal-50 border-[#007570] text-[#007570]" : "bg-white border-slate-200 text-slate-600"
                        }`}
                    >
                      📱 QRIS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank / Metode Pembayaran</label>
                  <input
                    type="text"
                    value={newPaymentForm.name}
                    onChange={(e) => setNewPaymentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#007570]"
                    placeholder="Contoh: Bank BRI / Bank Jago / ShopeePay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    value={newPaymentForm.accountNumber}
                    onChange={(e) => setNewPaymentForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#007570]"
                    placeholder="Contoh: 0123-456-789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Rekening (Atas Nama)</label>
                  <input
                    type="text"
                    value={newPaymentForm.accountName}
                    onChange={(e) => setNewPaymentForm(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#007570]"
                    placeholder="Triwala Mitra Bestari"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddNewPaymentMethod}
                  className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  + Tambahkan Rekening
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── WhatsApp Access & Payment Wall Management Section ──
  const renderWhatsApp = () => {
    const filteredWaLogs = waLogs.filter(log => {
      const q = waLogSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (log.customer_name && log.customer_name.toLowerCase().includes(q)) ||
        (log.user_name && log.user_name.toLowerCase().includes(q)) ||
        (log.user_email && log.user_email.toLowerCase().includes(q)) ||
        (log.customer_phone && log.customer_phone.toLowerCase().includes(q)) ||
        (log.business_name && log.business_name.toLowerCase().includes(q)) ||
        (log.payment_method && log.payment_method.toLowerCase().includes(q));

      const matchStatus = waLogStatusFilter === "all" ||
        (waLogStatusFilter === "pending" && log.status === "pending") ||
        (waLogStatusFilter === "approved" && (log.status === "completed" || log.status === "approved")) ||
        (waLogStatusFilter === "rejected" && log.status === "rejected");

      return matchSearch && matchStatus;
    });

    // Calculate revenue based on selected period
    let displayedRevenue = Number(waLogStats.total_revenue || 0);
    let periodLabel = "Semua Periode";
    if (waRevenuePeriod === "today") {
      displayedRevenue = Number(waLogStats.today_revenue || 0);
      periodLabel = "Hari Ini";
    } else if (waRevenuePeriod === "week") {
      displayedRevenue = Number(waLogStats.this_week_revenue || 0);
      periodLabel = "Minggu Ini";
    } else if (waRevenuePeriod === "month") {
      displayedRevenue = Number(waLogStats.this_month_revenue || 0);
      periodLabel = "Bulan Ini";
    }

    const currentTarifAmount = Number(waAdminSettings.amount || 5000);

    return (
      <div className="space-y-6 mb-12 animate-fade-in">
        {/* Page Title / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <WhatsAppIcon size={24} className="text-emerald-600" />
                <span>Kelola WhatsApp</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verifikasi bukti pembayaran, pantau log transaksi akses kontak WhatsApp, dan atur tarif serta instruksi WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setWaAdminSettingsForm({ ...waAdminSettings });
                setShowEditWaTarifModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200/90 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <DollarSign size={15} className="text-emerald-600" />
              <span>Edit Harga Akses (Rp {currentTarifAmount.toLocaleString("id-ID")})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                fetchWaSettings();
                fetchWaLogs(waLogPage);
              }}
              disabled={loadingWaLogs}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={loadingWaLogs ? "animate-spin text-teal-600" : ""} />
            </button>
          </div>
        </div>

        {/* ── TOP HERO SECTION (2-Column Grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Hero: Total Pendapatan Card */}
          <div className="lg:col-span-8 rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-5 sm:p-6 shadow-lg border border-emerald-800/40 relative overflow-hidden flex flex-col justify-between min-h-[170px]">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

            {/* Top row */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                    Total Pendapatan Akses WhatsApp
                  </h3>
                  <p className="text-[11px] text-emerald-200/80 font-normal mt-0.5">
                    Akumulasi pembayaran resmi terkonfirmasi
                  </p>
                </div>
              </div>

              {/* Time Period Filter Pills */}
              <div className="flex items-center bg-black/30 backdrop-blur-xs p-1 rounded-xl border border-emerald-500/20 self-start sm:self-auto text-xs font-semibold">
                {[
                  { id: "today", label: "Hari Ini" },
                  { id: "week", label: "Minggu Ini" },
                  { id: "month", label: "Bulan Ini" },
                  { id: "all", label: "Semua" },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setWaRevenuePeriod(p.id)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${waRevenuePeriod === p.id
                        ? "bg-white text-slate-900 font-bold shadow-xs"
                        : "text-emerald-100/70 hover:text-white"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom row: Large Revenue Display & Sub badges */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
              <div>
                <span className="text-[11px] font-medium text-emerald-200 block mb-0.5">
                  Pendapatan ({periodLabel}):
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Rp {displayedRevenue.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-black/25 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
                  Hari Ini: <strong className="text-white">Rp {(waLogStats.today_revenue || 0).toLocaleString("id-ID")}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-black/25 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
                  Bulan Ini: <strong className="text-white">Rp {(waLogStats.this_month_revenue || 0).toLocaleString("id-ID")}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Card: Tarif Akses WhatsApp */}
          <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <CreditCard size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Tarif Akses WhatsApp
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Tarif Aktif" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                Rp {currentTarifAmount.toLocaleString("id-ID")}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Biaya per 1x buka kontak untuk semua pengunjung.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWaAdminSettingsForm({ ...waAdminSettings });
                setShowEditWaTarifModal(true);
              }}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-98"
            >
              <Settings size={13} />
              <span>Ubah Tarif Pembayaran</span>
            </button>
          </div>
        </div>

        {/* ── 4 STAT SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Request */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Request</span>
              <MessageSquare size={15} className="text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {waLogStats.total_requests || waLogStats.total_access || waLogs.length || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Permintaan masuk</div>
            </div>
          </div>

          {/* 2. Menunggu */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Menunggu</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">
                {waLogStats.pending_count ?? waLogs.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Butuh verifikasi</div>
            </div>
          </div>

          {/* 3. Disetujui */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui</span>
              <CheckCircle2 size={15} className="text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {waLogStats.approved_count ?? waLogs.filter(l => l.status === 'completed' || l.status === 'approved').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Akses diberikan</div>
            </div>
          </div>

          {/* 4. Ditolak */}
          <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Ditolak</span>
              <XCircle size={15} className="text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600">
                {waLogStats.rejected_count ?? waLogs.filter(l => l.status === 'rejected').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Bukti ditolak</div>
            </div>
          </div>
        </div>

        {/* ── TABLE CARD & FILTER TABS ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 self-start md:self-auto">
              {[
                { id: "all", label: "Semua" },
                { id: "pending", label: "Menunggu" },
                { id: "approved", label: "Disetujui" },
                { id: "rejected", label: "Ditolak" },
              ].map(tabItem => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setWaLogStatusFilter(tabItem.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${waLogStatusFilter === tabItem.id
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* Search & Transaction Count */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
              <div className="relative flex-1 md:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={waLogSearch}
                  onChange={(e) => setWaLogSearch(e.target.value)}
                  placeholder="Cari customer / bisnis..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <span className="text-xs text-slate-400 font-medium shrink-0">
                Menampilkan <strong>{filteredWaLogs.length}</strong> transaksi
              </span>
            </div>
          </div>

          {/* Table Container */}
          {loadingWaLogs ? (
            <SuradeLoader variant="section" size="sm" text="Memuat log transaksi WhatsApp" minHeight="180px" />
          ) : filteredWaLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 p-4">
              <MessageSquare size={36} strokeWidth={1.5} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Tidak ada transaksi yang cocok</p>
              <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau tab filter status.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 w-[18%]">User</th>
                    <th className="py-3 px-3 w-[18%]">Bisnis Tujuan</th>
                    <th className="py-3 px-3 w-[10%]">Nominal</th>
                    <th className="py-3 px-3 w-[12%]">Kupon / Referral</th>
                    <th className="py-3 px-3 w-[14%]">Metode &amp; Bukti</th>
                    <th className="py-3 px-3 w-[9%]">Tanggal</th>
                    <th className="py-3 px-3 w-[9%]">Status</th>
                    <th className="py-3 px-4 text-right w-[10%]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredWaLogs.map((log) => {
                    const isPending = log.status === "pending";
                    const isApproved = log.status === "completed" || log.status === "approved";
                    const isRejected = log.status === "rejected";
                    const feeFormatted = Number(log.fee_amount || 0).toLocaleString("id-ID");
                    const dateFormatted = log.created_at
                      ? new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                      : "-";

                    const userName = log.user?.name || log.user_name || log.customer_name || "User Demo";
                    const userEmail = log.user?.email || log.user_email || log.customer_phone || "customer@surade.com";
                    const rawUserAvatar = log.user?.avatar || log.user_avatar;
                    const userAvatar = rawUserAvatar ? getStorageUrl(rawUserAvatar) : null;

                    const bizName = log.business?.name || log.business_name || "Bisnis Tujuan";
                    const bizCategory = log.business_category_name || log.business?.category?.name || "Umum";
                    const rawBizImage = log.business_image || log.business?.logo || log.business?.banner;
                    const bizImage = rawBizImage ? getStorageUrl(rawBizImage) : null;

                    const rawProof = log.proof_image || log.payment_proof || log.proof_url;
                    const proofUrl = rawProof ? getStorageUrl(rawProof) : null;

                    const userPresence = getUserPresence({
                      ...log.user,
                      id: log.user?.id || log.user_id,
                      name: userName,
                      email: userEmail,
                      is_online: log.user?.is_online,
                      last_seen_at: log.user?.last_seen_at,
                      status: 'active',
                    });

                    return (
                      <tr key={`wa-admin-row-${log.id}`} className="hover:bg-slate-50/70 transition-colors">
                        {/* USER */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              {userAvatar ? (
                                <img
                                  src={userAvatar}
                                  alt={userName}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${userPresence.isOnline ? "bg-emerald-500" : "bg-slate-300"
                                  }`}
                                title={userPresence.isOnline ? "Online" : "Offline"}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                                <span className="truncate">{userName}</span>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${userPresence.isOnline ? "bg-emerald-500" : "bg-slate-300"}`} />
                              </div>
                              <div className="text-[10.5px] text-slate-400 font-mono truncate">
                                {userEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* BISNIS TUJUAN */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {bizImage ? (
                              <img
                                src={bizImage}
                                alt={bizName}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200/80 shrink-0 bg-slate-100"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs shrink-0">
                                {bizName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {bizName}
                              </div>
                              <div className="text-[10.5px] text-slate-400 truncate">
                                {bizCategory}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* NOMINAL & DISKON KUPON */}
                        <td className="py-3 px-3 whitespace-nowrap text-xs">
                          <div className="font-bold text-slate-900">
                            Rp {feeFormatted}
                          </div>
                          {Number(log.discount_amount || 0) > 0 && (
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="line-through text-slate-400">
                                Rp {Number((Number(log.fee_amount || 0) + Number(log.discount_amount || 0))).toLocaleString("id-ID")}
                              </span>
                              <span>(Hemat Rp {Number(log.discount_amount).toLocaleString("id-ID")})</span>
                            </div>
                          )}
                        </td>

                        {/* KODE KUPON / REFERRAL */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {log.coupon_code ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-bold">
                                <Gift size={11} className="text-purple-600" />
                                <span>{log.coupon_code}</span>
                              </span>
                              {Number(log.discount_amount || 0) > 0 && (
                                <span className="block text-[10px] text-purple-600 font-medium">
                                  Diskon Rp {Number(log.discount_amount).toLocaleString("id-ID")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">-</span>
                          )}
                        </td>

                        {/* METODE & BUKTI */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium whitespace-nowrap">
                              {log.payment_method || "Transfer Bank"}
                            </span>
                            {proofUrl ? (
                              <button
                                type="button"
                                onClick={() => setSelectedWaProofUrl(proofUrl)}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[10.5px] font-bold cursor-pointer transition-all shrink-0"
                                title="Lihat Bukti Foto"
                              >
                                <Eye size={11} />
                                <span>Bukti</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic shrink-0">Tanpa Bukti</span>
                            )}
                          </div>
                        </td>

                        {/* TANGGAL */}
                        <td className="py-3 px-3 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Menunggu</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300" title={log.rejection_reason || "Ditolak"}>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Ditolak</span>
                            </span>
                          )}
                        </td>

                        {/* AKSI VERIFIKASI */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Detail */}
                            <button
                              type="button"
                              onClick={() => setModal({ show: true, type: "viewWaLogDetail", data: log })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold text-[11px] cursor-pointer transition-all shadow-2xs shrink-0"
                              title="Lihat Detail Transaksi & Bukti"
                            >
                              <Eye size={12} />
                              <span>Detail</span>
                            </button>

                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveWaLog(log.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs shrink-0"
                                  title="Setujui Pembayaran"
                                >
                                  <Check size={12} strokeWidth={2.5} />
                                  <span>Setuju</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectWaLog(log)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs shrink-0"
                                  title="Tolak Pembayaran"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                  <span>Tolak</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => deleteWaLog(log.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 font-semibold text-[11px] cursor-pointer transition-all shrink-0"
                                title="Hapus Riwayat"
                              >
                                <Trash2 size={11} />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {waLogPagination.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs flex-wrap gap-2">
              <span className="text-slate-500">
                Total: <strong>{waLogPagination.total}</strong> log transaksi
              </span>
              {renderAdminPagination(waLogPagination.current_page, waLogPagination.last_page, (pg) => fetchWaLogs(pg))}
            </div>
          )}
        </div>

        {/* ── MODAL: EDIT TARIF PEMBAYARAN WHATSAPP ── */}
        {showEditWaTarifModal && (
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md my-auto overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 to-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">Edit Tarif Akses WhatsApp</h3>
                    <p className="text-[11px] text-slate-500">Atur harga nominal dan rekening penerima pembayaran</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditWaTarifModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
                {/* Switch Aktif / Nonaktif */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-slate-800 block">Status Pembayaran Akses Kontak:</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">Jika dinonaktifkan, tombol WhatsApp langsung terbuka bebas tanpa verifikasi.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={waAdminSettingsForm.enabled}
                      onChange={(e) => setWaAdminSettingsForm(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Input Nominal Tarif */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tarif Biaya Akses Kontak (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={waAdminSettingsForm.amount}
                      onChange={(e) => setWaAdminSettingsForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                      placeholder="5000"
                      min="0"
                    />
                  </div>
                </div>

                {/* Select Rekening */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Rekening Penerima Default</label>
                  <select
                    value={waAdminSettingsForm.bank_name}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const match = paymentMethodsList.find(m => m.name === selectedName);
                      setWaAdminSettingsForm(prev => ({
                        ...prev,
                        bank_name: selectedName,
                        account_number: match?.accountNumber || prev.account_number,
                        account_holder: match?.accountName || paymentOfficialHolder,
                      }));
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {paymentMethodsList.filter(m => m.isActive !== false).map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Textarea Instruksi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Teks Instruksi Pembayaran Customer</label>
                  <textarea
                    value={waAdminSettingsForm.instruction}
                    onChange={(e) => setWaAdminSettingsForm(prev => ({ ...prev, instruction: e.target.value }))}
                    rows={2}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600 resize-none"
                    placeholder="Instruksi pembayaran yang tampil pada dialog user..."
                  />
                </div>
              </div>

              <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditWaTarifModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await saveWaSettings();
                    setShowEditWaTarifModal(false);
                  }}
                  disabled={savingWaSettings}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingWaSettings ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Simpan Tarif</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: PREVIEW BUKTI PEMBAYARAN STRUK / FOTO ── */}
        {selectedWaProofUrl && (
          <div
            className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center overflow-hidden"
            onClick={() => setSelectedWaProofUrl(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Eye size={15} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Bukti Pembayaran / Struk Transfer</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWaProofUrl(null)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Image Container */}
              <div className="p-4 bg-slate-900 flex items-center justify-center flex-1 min-h-0 overflow-hidden">
                <img
                  src={selectedWaProofUrl}
                  alt="Bukti Transfer"
                  className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-lg border border-white/10"
                />
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">Bukti Pembayaran / Struk</span>
                <button
                  type="button"
                  onClick={() => setSelectedWaProofUrl(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Chat Access QRIS Management Section ──
  const [selectedChatProofUrl, setSelectedChatProofUrl] = useState(null);

  const renderChatManagement = () => {
    const filteredChatLogs = chatLogs.filter(log => {
      const q = chatLogSearch.toLowerCase().trim();
      const matchSearch = !q ||
        (log.customer_name && log.customer_name.toLowerCase().includes(q)) ||
        (log.user_name && log.user_name.toLowerCase().includes(q)) ||
        (log.user_email && log.user_email.toLowerCase().includes(q)) ||
        (log.customer_phone && log.customer_phone.toLowerCase().includes(q)) ||
        (log.business_name && log.business_name.toLowerCase().includes(q)) ||
        (log.payment_method && log.payment_method.toLowerCase().includes(q)) ||
        (log.transaction_code && log.transaction_code.toLowerCase().includes(q));

      const matchStatus = chatLogStatusFilter === "all" ||
        (chatLogStatusFilter === "pending" && log.status === "pending") ||
        (chatLogStatusFilter === "approved" && (log.status === "completed" || log.status === "approved")) ||
        (chatLogStatusFilter === "rejected" && log.status === "rejected");

      return matchSearch && matchStatus;
    });

    return (
      <div className="space-y-6 mb-12 animate-fade-in">
        {/* Page Title / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <MessageSquare size={24} className="text-emerald-600" />
                <span>Kelola Chat</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verifikasi bukti pembayaran QRIS akses chat, pantau log transaksi pesan pelanggan, dan teruskan Poin Gold ke pelaku usaha.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => {
                setChatAdminSettingsForm({ ...chatAdminSettings });
                setShowEditChatTarifModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer border-0"
              title="Atur Harga & Tarif Akses Chat"
            >
              <Settings size={15} />
              <span>Atur Tarif Chat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                fetchChatLogs(chatLogPage);
                fetchChatSettings();
              }}
              disabled={loadingChatLogs || loadingChatSettings}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={(loadingChatLogs || loadingChatSettings) ? "animate-spin text-emerald-600" : ""} />
            </button>
          </div>
        </div>

        {/* ── BANNER INFO TARIF CHAT AKTIF (Tema Emerald Mewah Gambar 4) ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] p-5 sm:p-6 text-white shadow-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
              <Coins size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">Tarif Akses Chat Pelanggan ke Penjual</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${chatAdminSettings.enabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  }`}>
                  {chatAdminSettings.enabled ? "Aktif (Berbayar)" : "Nonaktif (Gratis)"}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Pengaturan harga resmi akses kirim pesan yang dikenakan kepada pembeli sebelum chat dibuka ke penjual.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 sm:gap-4 flex-wrap bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0 shadow-inner">
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Biaya QRIS</span>
              <span className="text-base sm:text-lg font-black text-amber-300">
                Rp {Number(chatAdminSettings.amount || 0).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="w-px h-8 bg-white/15"></div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Biaya Poin</span>
              <span className="text-base sm:text-lg font-black text-emerald-300">
                {chatAdminSettings.points || 0} Poin
              </span>
            </div>
            <div className="w-px h-8 bg-white/15"></div>
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-semibold">Tujuan Rekening</span>
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                {chatAdminSettings.bank_name || "BCA / QRIS"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setChatAdminSettingsForm({ ...chatAdminSettings });
                setShowEditChatTarifModal(true);
              }}
              className="ml-auto md:ml-2 px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 border-0 hover:scale-[1.02]"
            >
              Ubah Harga
            </button>
          </div>
        </div>

        {/* ── 3D STATS CARDS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Total Akses Chat */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Permohonan</span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <MessageSquare size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {chatLogStats.total_access || 0}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">Akses Chat Masuk</span>
          </div>

          {/* Card 2: Menunggu Verifikasi */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-amber-500 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Menunggu Verif</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 leading-tight">
              {chatLogStats.pending_count || 0}
            </div>
            <span className="text-[11px] text-amber-600/80 font-bold block mt-1">Perlu Verifikasi</span>
          </div>

          {/* Card 3: Disetujui */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-emerald-500 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 leading-tight">
              {chatLogStats.approved_count || 0}
            </div>
            <span className="text-[11px] text-emerald-600/80 font-medium block mt-1">Akses Terbuka</span>
          </div>

          {/* Card 4: Ditolak */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-rose-500 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Ditolak</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 leading-tight">
              {chatLogStats.rejected_count || 0}
            </div>
            <span className="text-[11px] text-rose-600/80 font-medium block mt-1">Bukti Tidak Valid</span>
          </div>

          {/* Card 5: Total Omset QRIS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 border-b-4 border-b-emerald-600 shadow-xs hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-800 leading-tight">
              Rp {Number(chatLogStats.total_revenue || 0).toLocaleString("id-ID")}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">Omset QRIS Chat</span>
          </div>
        </div>

        {/* ── FILTER & TABEL LOGS TRANSAKSI CHAT ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pemohon, toko, email, atau no. telepon..."
                value={chatLogSearch}
                onChange={(e) => setChatLogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70 text-xs">
                <button
                  type="button"
                  onClick={() => setChatLogStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${chatLogStatusFilter === "all" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setChatLogStatusFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${chatLogStatusFilter === "pending" ? "bg-amber-500 text-white shadow-2xs" : "text-amber-800 hover:text-amber-900"
                    }`}
                >
                  <span>Menunggu</span>
                  {chatLogStats.pending_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">
                      {chatLogStats.pending_count}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setChatLogStatusFilter("approved")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${chatLogStatusFilter === "approved" ? "bg-emerald-600 text-white shadow-2xs" : "text-emerald-800 hover:text-emerald-900"
                    }`}
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  onClick={() => setChatLogStatusFilter("rejected")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${chatLogStatusFilter === "rejected" ? "bg-rose-600 text-white shadow-2xs" : "text-rose-800 hover:text-rose-900"
                    }`}
                >
                  Ditolak
                </button>
              </div>
            </div>
          </div>

          {/* Table List */}
          {loadingChatLogs ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={24} className="animate-spin text-teal-600" />
              <span className="text-xs font-semibold">Memuat log transaksi chat...</span>
            </div>
          ) : filteredChatLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageSquare size={36} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Belum Ada Transaksi Akses Chat</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua permohonan pembayaran QRIS chat akan ditampilkan di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Kode Transaksi</th>
                    <th className="py-3 px-3">Pelanggan</th>
                    <th className="py-3 px-3">Toko Tujuan</th>
                    <th className="py-3 px-3">Biaya & Metode</th>
                    <th className="py-3 px-3">Bukti QRIS</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredChatLogs.map((log) => {
                    const isPending = log.status === "pending";
                    const isApproved = log.status === "completed" || log.status === "approved";
                    const isRejected = log.status === "rejected";
                    const proofImg = log.proof_url || (log.proof_image ? getStorageUrl(log.proof_image) : null);
                    const dateFormatted = log.created_at ? new Date(log.created_at).toLocaleString("id-ID", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    }) : "-";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* KODE TRANSAKSI */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {log.transaction_code || `CHAT-${log.id}`}
                          </span>
                        </td>

                        {/* PELANGGAN */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 min-w-[160px]">
                            <img
                              src={log.user_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${log.user_name || 'Customer'}`}
                              alt={log.user_name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate leading-tight">
                                {log.user_name || log.customer_name || "Pelanggan"}
                              </span>
                              <span className="text-[10.5px] text-slate-400 block truncate font-mono">
                                {log.user_email || log.customer_phone || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* TOKO TUJUAN */}
                        <td className="py-3 px-3">
                          <div className="min-w-[140px]">
                            <span className="font-bold text-slate-900 block truncate leading-tight">
                              {log.business?.name || log.business_name || "Nama Toko"}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              📍 {log.business_category_name || "Umum"}
                            </span>
                          </div>
                        </td>

                        {/* BIAYA & METODE */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-black text-teal-700 block">
                            Rp {Number(log.fee_amount || 4000).toLocaleString("id-ID")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            {log.payment_method || "QRIS Instant"}
                          </span>
                        </td>

                        {/* BUKTI TRANSFER */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {proofImg ? (
                            <button
                              type="button"
                              onClick={() => setSelectedChatProofUrl(proofImg)}
                              className="group relative inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-800 text-[11px] font-bold cursor-pointer transition-all"
                            >
                              <img
                                src={proofImg}
                                alt="Struk"
                                className="w-5 h-5 rounded object-cover border border-slate-300"
                              />
                              <span>Lihat Struk</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Tanpa Bukti</span>
                          )}
                        </td>

                        {/* TANGGAL */}
                        <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500 font-medium">
                          {dateFormatted}
                        </td>

                        {/* STATUS */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Menunggu</span>
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Disetujui</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300" title={log.rejection_reason || "Ditolak"}>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Ditolak</span>
                            </span>
                          )}
                        </td>

                        {/* AKSI */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Tombol Detail */}
                            <button
                              type="button"
                              onClick={() => setModal({ show: true, type: "viewChatLogDetail", data: log })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold text-[11px] cursor-pointer transition-all shadow-2xs"
                              title="Lihat Detail Transaksi & Bukti"
                            >
                              <Eye size={12} />
                              <span>Detail</span>
                            </button>

                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => approveChatLog(log.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs"
                                  title="Setujui Pembayaran QRIS Chat"
                                >
                                  <Check size={12} strokeWidth={2.5} />
                                  <span>Setuju</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => rejectChatLog(log)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer transition-all shadow-xs"
                                  title="Tolak Pembayaran"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                  <span>Tolak</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => deleteChatLog(log.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 font-semibold text-[11px] cursor-pointer transition-all"
                                title="Hapus Riwayat"
                              >
                                <Trash2 size={11} />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {chatLogPagination.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs flex-wrap gap-2">
              <span className="text-slate-500">
                Total: <strong>{chatLogPagination.total}</strong> log transaksi chat
              </span>
              {renderAdminPagination(chatLogPagination.current_page, chatLogPagination.last_page, (pg) => fetchChatLogs(pg))}
            </div>
          )}
        </div>

        {/* ── MODAL PREVIEW FOTO STRUK QRIS CHAT ── */}
        {selectedChatProofUrl && (
          <div
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
            onClick={() => setSelectedChatProofUrl(null)}
          >
            <div
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Pratinjau Bukti Pembayaran QRIS Chat</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedChatProofUrl(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-slate-900 flex items-center justify-center flex-1 min-h-0 overflow-hidden">
                <img
                  src={selectedChatProofUrl}
                  alt="Bukti Transfer QRIS"
                  className="max-h-[60vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-lg border border-white/10"
                />
              </div>

              <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Struk Transfer QRIS Resmi</span>
                <button
                  type="button"
                  onClick={() => setSelectedChatProofUrl(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL PENGATURAN / EDIT TARIF CHAT ── */}
        {showEditChatTarifModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[600] p-4 animate-fade-in"
            onClick={() => setShowEditChatTarifModal(false)}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden text-left my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 px-6 py-5 text-white relative">
                <button
                  type="button"
                  onClick={() => setShowEditChatTarifModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer border-0 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Atur Tarif Akses Chat</h3>
                    <p className="text-xs text-teal-200/80 mt-0.5">
                      Kelola nominal biaya QRIS dan jumlah poin untuk akses pesan chat
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveChatSettings} className="p-6 space-y-4 overflow-y-auto">
                {/* Status Aktif / Nonaktif Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">Status Pembayaran Chat</label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Jika dinonaktifkan, seluruh pengguna dapat chat penjual secara gratis tanpa bayar/poin.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(chatAdminSettingsForm.enabled)}
                      onChange={(e) => setChatAdminSettingsForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {/* Biaya Nominal QRIS */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tarif QRIS (Rupiah) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      required
                      value={chatAdminSettingsForm.amount}
                      onChange={(e) => setChatAdminSettingsForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                      placeholder="Contoh: 4000"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Format pratinjau:</span>
                    <strong className="text-teal-700 font-bold">
                      Rp {Number(chatAdminSettingsForm.amount || 0).toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>

                {/* Biaya Poin (Silver / Gold) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Biaya Poin untuk Buka Chat <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      required
                      value={chatAdminSettingsForm.points}
                      onChange={(e) => setChatAdminSettingsForm((prev) => ({ ...prev, points: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                      placeholder="Contoh: 4"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Poin</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pengguna dapat memilih membayar menggunakan {chatAdminSettingsForm.points || 0} Poin Silver atau {chatAdminSettingsForm.points || 0} Poin Gold.
                  </p>
                </div>

                {/* Tujuan Rekening / QRIS Bank Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Akun Rekening / Tujuan QRIS
                  </label>
                  <input
                    type="text"
                    value={chatAdminSettingsForm.bank_name || ""}
                    onChange={(e) => setChatAdminSettingsForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Contoh: BCA / QRIS"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ditampilkan sebagai identitas rekening penerima pembayaran pada instruksi QRIS.
                  </p>
                </div>

                {/* Instruksi Pembayaran */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan / Instruksi Pembayaran Chat
                  </label>
                  <textarea
                    rows={3}
                    value={chatAdminSettingsForm.instruction || ""}
                    onChange={(e) => setChatAdminSettingsForm((prev) => ({ ...prev, instruction: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="Contoh: Akses kirim pesan chat ke penjual dikenakan biaya administrasi resmi."
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditChatTarifModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors border-0"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingChatSettings}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-xs cursor-pointer shadow-md shadow-teal-700/20 flex items-center gap-2 border-0 disabled:opacity-50"
                  >
                    {savingChatSettings ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>Simpan Tarif Chat</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Modal Component ──
  const renderModal = () => {
    if (!modal.show) return null;

    const isReferralModal = modal.type?.includes("Referral") || modal.type?.includes("referral");
    const isDetailModal = modal.type === "viewReferralDetail" || modal.type === "viewReportDetail" || modal.type === "viewAdDetail" || modal.type === "viewWaLogDetail" || modal.type === "viewChatLogDetail" || modal.type === "addBusiness";

    return (
      <div className="fixed inset-0 bg-black/55 backdrop-blur-[6px] flex items-center justify-center z-[500] p-[24px] animate-fade-in" onClick={closeModal}>
        <div className={`bg-white rounded-[16px] w-full ${modal.type === "addBusiness" ? 'max-w-[760px]' : (isDetailModal ? 'max-w-[640px]' : 'max-w-[540px]')} shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-slide-up max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-[20px] py-[18px] border-b border-[#e2e8f0]">
            <h3 className="text-[15px] font-bold text-[#0f172a]">
              {modal.type === "addUser" && "Tambah User"}
              {modal.type === "editUser" && "Edit User"}
              {modal.type === "deleteUser" && "Hapus User"}
              {modal.type === "addBusiness" && "Tambah Usaha"}
              {modal.type === "editBusiness" && "Edit Usaha"}
              {modal.type === "viewBusinessDetail" && "Detail Usaha & Bukti Transaksi"}
              {modal.type === "deleteBusiness" && "Hapus Usaha"}
              {modal.type === "addCategory" && "Tambah Kategori"}
              {modal.type === "editCategory" && "Edit Kategori"}
              {modal.type === "deleteCategory" && "Hapus Kategori"}
              {modal.type === "viewBlogDetail" && "Detail Konten & Bukti Pembayaran"}
              {modal.type === "viewPaymentDetail" && "Detail Langganan & Bukti Pembayaran Premium"}
              {modal.type === "viewWaLogDetail" && "Detail Transaksi Akses WhatsApp & Bukti Pembayaran"}
              {modal.type === "viewChatLogDetail" && "Detail Transaksi Akses Chat QRIS & Bukti Pembayaran"}
              {modal.type === "rejectItem" && (
                modal.data?.isRevision || rejectMode === "revision"
                  ? (modal.data?.type === "business" ? "Minta Perbaikan Usaha / Bukti Pembayaran" : modal.data?.type === "payment" ? "Minta Perbaikan Bukti Pembayaran" : (modal.data?.type === "advertisement" || modal.data?.type === "ad") ? "Minta Perbaikan Materi Iklan" : (modal.data?.type === "whatsapp" || modal.data?.type === "whatsapp_log") ? "Minta Perbaikan Bukti Transfer WhatsApp" : "Minta Perbaikan Konten")
                  : (modal.data?.type === "business" ? "Tolak Usaha" : modal.data?.type === "payment" ? "Tolak Pembayaran Premium" : (modal.data?.type === "advertisement" || modal.data?.type === "ad") ? "Tolak Pengajuan Iklan" : (modal.data?.type === "whatsapp" || modal.data?.type === "whatsapp_log") ? "Tolak Akses WhatsApp" : "Tolak Publikasi Blog / Event")
              )}
              {modal.type === "editBlog" && "Edit Artikel"}
              {modal.type === "deleteBlog" && "Hapus Artikel"}
              {modal.type === "approvePayment" && "Approve Pembayaran"}
              {modal.type === "rejectPayment" && "Tolak Pembayaran"}
              {modal.type === "downloadReport" && "Download Laporan"}
              {modal.type === "viewAdDetail" && "Detail & Pengelolaan Iklan"}
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
              {modal.type === "editReferralCode" && "Edit Kode Referral User"}
              {modal.type === "viewReferralDetail" && "Detail Transaksi & Timeline Referral"}
              {modal.type === "rejectReferralTrx" && "Tolak Transaksi Referral"}
              {modal.type === "rejectReferralCom" && "Tolak Komisi Referral"}
              {modal.type === "adjustReferralCom" && "Penyesuaian (Adjustment) Komisi"}
              {modal.type === "confirmApproveReferralTrx" && "Konfirmasi Setujui Transaksi Referral"}
              {modal.type === "confirmApproveReferralCom" && "Konfirmasi Setujui Komisi"}
              {modal.type === "confirmMarkPaidReferralCom" && "Konfirmasi Pembayaran Komisi"}
              {modal.type === "editContentPricing" && (editingPricingType === "event" ? "Edit Biaya Publikasi Event" : "Edit Biaya Publikasi Info")}
              {modal.type === "rejectContentTx" && "Tolak Transaksi Pembayaran"}
              {modal.type === "viewContentTxDetail" && "Detail Transaksi Pay-Per-Post"}
              {modal.type === "viewContentProof" && "Bukti Pembayaran Transaksi"}
            </h3>
            <button className="bg-[#f1f5f9] border-0 text-[#64748b] cursor-pointer p-[7px] rounded-[8px] transition-all duration-200 flex hover:bg-[#fee2e2] hover:text-[#dc2626]" onClick={closeModal}>
              <CloseIcon size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="p-[20px]">
            {modal.type === "addBusiness" ? (
              <form onSubmit={handleSaveAdminBusiness} className="flex flex-col gap-[16px]">
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-[12px] rounded-[10px] text-[12.5px] text-[#166534] flex items-center gap-[8px]">
                  <span>💡</span>
                  <span>Form Tambah Usaha untuk User. Bisnis yang dibuat otomatis terhubung ke akun user yang dipilih dan langsung aktif di sistem.</span>
                </div>

                {/* Pilih Pemilik Akun User */}
                <div className="bg-[#f8fafc] p-[14px] rounded-[12px] border border-[#e2e8f0]">
                  <label className="block text-[12px] font-bold text-[#007570] mb-[6px] uppercase tracking-[0.4px]">
                    👤 Pilih User Pemilik Usaha *
                  </label>
                  <select
                    required
                    value={addBusinessForm.user_id}
                    onChange={(e) => setAddBusinessForm({ ...addBusinessForm, user_id: e.target.value })}
                    className="w-full px-[12px] py-[10px] border-[1.5px] border-[#cbd5e1] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-semibold bg-white focus:outline-none focus:border-[#007570]"
                  >
                    <option value="">-- Pilih Akun User Terdaftar --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) - {u.role || 'user'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#64748b] mt-[4px]">
                    Usaha yang dibuat di sini akan langsung masuk dan dapat dikelola di dashboard akun user ini.
                  </p>
                </div>

                {/* Informasi Data Bisnis (Sesuai Step 2 Tambah Usaha) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Nama Usaha / Bisnis *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Warung Barokah Surade"
                      value={addBusinessForm.name}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, name: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Kategori Usaha *
                    </label>
                    <select
                      value={addBusinessForm.category_id}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, category_id: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Nomor WhatsApp Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={addBusinessForm.whatsapp}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, whatsapp: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={addBusinessForm.phone}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, phone: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Kota / Kecamatan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Surade, Sukabumi"
                      value={addBusinessForm.city}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, city: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Status Verifikasi Usaha
                    </label>
                    <select
                      value={addBusinessForm.status}
                      onChange={(e) => setAddBusinessForm({ ...addBusinessForm, status: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-semibold bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="approved">Disetujui (Aktif Langsung)</option>
                      <option value="pending">Pending (Menunggu Verifikasi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                    Alamat Lengkap Usaha
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Jl. Raya Surade No. 12, RT 02/05, Surade..."
                    value={addBusinessForm.address}
                    onChange={(e) => setAddBusinessForm({ ...addBusinessForm, address: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                    Deskripsi Usaha
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan mengenai produk atau layanan yang ditawarkan..."
                    value={addBusinessForm.description}
                    onChange={(e) => setAddBusinessForm({ ...addBusinessForm, description: e.target.value })}
                    className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] font-medium bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                  />
                </div>
              </form>
            ) : modal.type === "addUser" || modal.type === "editUser" ? (
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
              (() => {
                const userBizList = modal.data.businessesList ||
                  (Array.isArray(modal.data.businesses) && modal.data.businesses.length > 0 ? modal.data.businesses : []) ||
                  businesses.filter((b) => b.user_id === modal.data.id || b.user?.id === modal.data.id);
                const bizCount = modal.data.businessesCount ?? (modal.data.businesses_count !== undefined && modal.data.businesses_count !== null ? Number(modal.data.businesses_count) : userBizList.length);

                return (
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex items-center gap-[14px]">
                      <img
                        src={modal.data.avatar}
                        alt={modal.data.name}
                        className="w-[56px] h-[56px] rounded-full object-cover border border-[#e2e8f0]"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(modal.data.name || "User")}`;
                        }}
                      />
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
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Jumlah Bisnis:</span>
                        <span className="font-bold text-[#007570] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          {bizCount} Bisnis
                        </span>
                      </div>
                      <div className="flex justify-between"><span className="text-[#64748b]">Tanggal Bergabung:</span><span className="font-semibold">{modal.data.joined || '-'}</span></div>
                    </div>

                    {/* Daftar Bisnis Milik User */}
                    <div className="border-t border-[#e2e8f0] pt-[12px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-[#0f172a] uppercase tracking-wider">
                          Daftar Bisnis ({userBizList.length})
                        </span>
                      </div>
                      {userBizList.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
                          Pengguna ini belum memiliki bisnis yang terdaftar di sistem.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {userBizList.map((biz) => {
                            const fullBiz = businesses.find((b) => b.id === biz.id) || biz;
                            return (
                              <div key={biz.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={getBusinessTablePhoto(fullBiz)}
                                    alt={biz.name}
                                    className="w-8 h-8 rounded-lg object-cover border border-[#e2e8f0] shrink-0 bg-white shadow-2xs"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(biz.name || "Bisnis")}`;
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[12.5px] font-bold text-[#0f172a] truncate">{biz.name}</p>
                                    <p className="text-[11px] text-[#64748b] truncate">{biz.category?.name || biz.category || biz.city || "Bisnis UMKM"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase ${biz.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                      biz.status === "pending" ? "bg-amber-100 text-amber-700" :
                                        "bg-rose-100 text-rose-700"
                                    }`}>
                                    {biz.status === "approved" ? "Aktif" : (biz.status === "pending" ? "Pending" : biz.status)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBusinessDetail(fullBiz)}
                                    className="p-1 rounded-md text-slate-500 hover:text-[#007570] hover:bg-slate-200 transition-colors cursor-pointer"
                                    title="Lihat Detail Bisnis"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
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
                  <div className="grid grid-cols-2 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tipe Diskon *</label>
                      <select
                        value={couponForm.discount_type}
                        onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value, discount_value: "" })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nilai Diskon *</label>
                      {couponForm.discount_type === "percentage" ? (
                        <div className="relative">
                          <input
                            type="number" required min="0" max="100"
                            placeholder="Contoh: 50"
                            value={couponForm.discount_value}
                            onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                            className="w-full pl-[12px] pr-[32px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-semibold transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                          />
                          <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#64748b] pointer-events-none">%</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#007570] pointer-events-none">Rp</span>
                          <input
                            type="text" required inputMode="numeric"
                            placeholder="Contoh: 5.000"
                            value={couponForm.discount_value !== "" && couponForm.discount_value != null ? Math.round(parseFloat(String(couponForm.discount_value))).toLocaleString("id-ID") : ""}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                              setCouponForm({ ...couponForm, discount_value: raw === "" ? "" : Number(raw) });
                            }}
                            className="w-full pl-[32px] pr-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-semibold transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                          />
                        </div>
                      )}
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
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Min. Transaksi</label>
                      <div className="relative">
                        <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#007570] pointer-events-none">Rp</span>
                        <input
                          type="text" inputMode="numeric"
                          placeholder="Tanpa minimum"
                          value={couponForm.minimum_amount !== "" && couponForm.minimum_amount != null ? Math.round(parseFloat(String(couponForm.minimum_amount))).toLocaleString("id-ID") : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                            setCouponForm({ ...couponForm, minimum_amount: raw === "" ? "" : Number(raw) });
                          }}
                          className="w-full pl-[32px] pr-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Maks Diskon</label>
                      <div className="relative">
                        <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#007570] pointer-events-none">Rp</span>
                        <input
                          type="text" inputMode="numeric"
                          placeholder="Opsional"
                          value={couponForm.maximum_discount !== "" && couponForm.maximum_discount != null ? Math.round(parseFloat(String(couponForm.maximum_discount))).toLocaleString("id-ID") : ""}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
                            setCouponForm({ ...couponForm, maximum_discount: raw === "" ? "" : Number(raw) });
                          }}
                          className="w-full pl-[32px] pr-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                        />
                      </div>
                    </div>
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
                      className={`flex-1 py-[8px] rounded-[8px] text-[13px] font-semibold border transition-all ${blogForm.type !== "event"
                          ? "bg-[#007570] text-white border-[#007570]"
                          : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
                        }`}
                    >
                      📝 Artikel & Blog
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogForm({ ...blogForm, type: "event" })}
                      className={`flex-1 py-[8px] rounded-[8px] text-[13px] font-semibold border transition-all ${blogForm.type === "event"
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
                  <span className={`px-[8px] py-[3px] rounded-[6px] text-[11px] font-bold uppercase ${modal.data.status === "baru" ? "bg-[#fef3c7] text-[#d97706]" :
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
                      src={getStorageUrl(modal.data.content_image) || "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop"}
                      alt={modal.data.content_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=100&h=100&fit=crop";
                      }}
                      className="w-[60px] h-[60px] rounded-[8px] object-cover border border-[#cbd5e1] shrink-0 bg-slate-100"
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
              (() => {
                const adOrigPrice = Number(
                  modal.data.original_price ||
                  modal.data.package_price ||
                  modal.data.ad_package?.price ||
                  modal.data.adPackage?.price ||
                  (modal.data.price && modal.data.discount_amount ? Number(modal.data.price) + Number(modal.data.discount_amount) : 0)
                );
                const adFinalPrice = Number(modal.data.price || 0);
                const adDiscAmt = Number(
                  modal.data.discount_amount ||
                  modal.data.discount ||
                  (adOrigPrice > adFinalPrice ? adOrigPrice - adFinalPrice : 0)
                );
                const adCouponCode =
                  modal.data.coupon_code ||
                  modal.data.coupon?.code ||
                  modal.data.used_referral_code ||
                  modal.data.referral_code ||
                  (adDiscAmt > 0 ? (modal.data.coupon_id ? `KUPON #${modal.data.coupon_id}` : "KUPON DISKON") : null);
                const adHasDiscount = adDiscAmt > 0 || (adOrigPrice > 0 && adOrigPrice > adFinalPrice) || Boolean(adCouponCode);

                return (
                  <div className="flex flex-col gap-[16px] text-left">
                    {/* Informasi Bisnis */}
                    <div className="flex flex-col gap-[10px] bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-[12px] font-bold text-[#007570] uppercase tracking-[0.5px]">Informasi Bisnis</h4>
                      <div className="flex gap-[14px] items-start">
                        <img
                          src={getStorageUrl(modal.data.business?.logo || modal.data.business?.banner) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80"}
                          alt={modal.data.business?.name}
                          className="w-[56px] h-[56px] rounded-[10px] object-cover border border-[#e2e8f0] shrink-0 bg-white"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 text-xs">
                          <div>
                            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nama Bisnis</p>
                            <p className="text-[13px] text-[#0f172a] font-bold">{modal.data.business?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Pemilik</p>
                            <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.user?.name || modal.data.business?.user?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Email</p>
                            <p className="text-[12px] text-[#475569]">{modal.data.user?.email || modal.data.business?.user?.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nomor HP</p>
                            <p className="text-[12px] text-[#475569]">{modal.data.user?.phone || modal.data.business?.user?.phone || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Paket */}
                    <div className="flex flex-col gap-[10px] bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-[12px] font-bold text-[#007570] uppercase tracking-[0.5px]">Informasi Paket & Durasi</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Nama Paket</p>
                          <p className="text-[13px] text-[#0f172a] font-bold">{modal.data.package_name || modal.data.ad_package?.name || modal.data.adPackage?.name || 'Paket Iklan'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Harga Paket</p>
                          {adOrigPrice > adFinalPrice ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-[11px] text-slate-400 line-through">Rp {adOrigPrice.toLocaleString('id-ID')}</span>
                              <span className="text-[13px] text-[#007570] font-extrabold">Rp {adFinalPrice.toLocaleString('id-ID')}</span>
                            </div>
                          ) : (
                            <p className="text-[13px] text-[#007570] font-extrabold">Rp {adFinalPrice.toLocaleString('id-ID')}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Durasi Tayang</p>
                          <p className="text-[13px] text-[#0f172a] font-bold">
                            {modal.data.duration_days ? `${modal.data.duration_days} Hari` : (modal.data.duration || '30 Hari')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px] mb-1">Fitur Penempatan</p>
                        <div className="flex flex-wrap gap-[6px]">
                          <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold">✓ Banner Homepage</span>
                          <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold">✓ Prioritas Pencarian</span>
                          <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold">✓ Highlight Listing</span>
                          <span className="inline-flex items-center px-[8px] py-[3px] bg-[#dcfce7] text-[#16a34a] rounded-[6px] text-[11px] font-bold">✓ Badge Sponsored</span>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Pembayaran & Bukti Transfer */}
                    <div className="flex flex-col gap-[10px] bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-[12px] font-bold text-[#007570] uppercase tracking-[0.5px]">Informasi Pembayaran & Bukti Transfer</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Metode Pembayaran</p>
                          <p className="text-[13px] text-[#0f172a] font-semibold">{modal.data.payment_method || 'Transfer Bank BCA'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Total Nominal</p>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[13px] text-[#007570] font-extrabold">Rp {adFinalPrice.toLocaleString('id-ID')}</span>
                            {adOrigPrice > adFinalPrice && (
                              <span className="text-[11px] text-slate-400 line-through">(Asli: Rp {adOrigPrice.toLocaleString('id-ID')})</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Tanggal Pengajuan</p>
                          <p className="text-[12.5px] text-[#0f172a] font-medium">
                            {modal.data.created_at
                              ? new Date(modal.data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748b] font-semibold uppercase tracking-[0.4px]">Tanggal Pembayaran</p>
                          <p className="text-[12.5px] text-[#0f172a] font-medium">
                            {modal.data.paid_at
                              ? new Date(modal.data.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : modal.data.payment_proof
                                ? (modal.data.payment_status === 'paid' ? 'Lunas' : 'Menunggu Konfirmasi Admin')
                                : 'Belum Ada Pembayaran'}
                          </p>
                        </div>
                      </div>

                      {/* Info Kupon / Referral jika digunakan */}
                      {adHasDiscount && (
                        <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-xs">
                              <span>🎁</span> KODE KUPON DISKON
                            </span>
                            <span className="font-mono bg-white px-3 py-1 rounded-lg border border-emerald-300 text-emerald-900 font-extrabold text-[12.5px] tracking-wider shadow-2xs">
                              {adCouponCode || "KUPON DISKON"}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-emerald-100/90 border border-emerald-300 rounded-lg text-emerald-900 font-black text-xs">
                            {adOrigPrice > adFinalPrice && (
                              <span className="line-through text-slate-400 font-normal mr-2">
                                Rp {adOrigPrice.toLocaleString('id-ID')}
                              </span>
                            )}
                            Diskon: -Rp {adDiscAmt.toLocaleString('id-ID')}
                          </div>
                        </div>
                      )}

                      {/* Bukti Transfer Photo Preview (Mendukung Multi Bukti) */}
                      <div className="pt-2 border-t border-slate-200">
                        {(() => {
                          const proofList = modal.data.payment_proof_list && Array.isArray(modal.data.payment_proof_list) && modal.data.payment_proof_list.length > 0
                            ? modal.data.payment_proof_list
                            : (modal.data.payment_proof
                              ? (typeof modal.data.payment_proof === 'string' && modal.data.payment_proof.startsWith('[')
                                ? (() => { try { return JSON.parse(modal.data.payment_proof); } catch (e) { return [modal.data.payment_proof]; } })()
                                : [modal.data.payment_proof])
                              : []);

                          return (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] text-[#64748b] font-bold uppercase tracking-[0.4px]">
                                  Foto Struk / Bukti Transfer ({proofList.length} Foto):
                                </p>
                                {proofList.length > 1 && (
                                  <span className="text-[10.5px] font-bold text-[#007570] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                                    Multi-Pembayaran / Pelunasan
                                  </span>
                                )}
                              </div>

                              {proofList.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {proofList.map((proofPath, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                                      <div
                                        className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group shrink-0"
                                        onClick={() => window.open(getStorageUrl(proofPath), '_blank')}
                                        title="Klik untuk membuka ukuran penuh"
                                      >
                                        <img
                                          src={getStorageUrl(proofPath)}
                                          alt={`Bukti Transfer ${idx + 1}`}
                                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80";
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                          Buka ↗
                                        </div>
                                      </div>
                                      <div className="min-w-0 flex-1 text-xs">
                                        <span className="font-bold text-slate-800 block text-[11.5px]">
                                          Bukti #{idx + 1}
                                        </span>
                                        <button
                                          type="button"
                                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#007570] hover:underline cursor-pointer"
                                          onClick={() => window.open(getStorageUrl(proofPath), '_blank')}
                                        >
                                          <Eye size={12} />
                                          Lihat Penuh ↗
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                                  Belum ada bukti transfer yang diunggah oleh pengguna.
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Status & Quick Action Buttons inside modal */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                      {modal.data.status !== "active" && modal.data.status !== "approved" && modal.data.status !== "rejected" && modal.data.status !== "cancelled" && modal.data.status !== "expired" && (
                        <>
                          <button
                            type="button"
                            className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-[10px] text-[12px] font-bold cursor-pointer transition-all shadow-sm"
                            onClick={() => {
                              const adItem = modal.data;
                              closeModal();
                              handleOpenRevisionModal("advertisement", adItem);
                            }}
                          >
                            <AlertTriangle size={14} strokeWidth={2.5} />
                            Minta Perbaikan
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-rose-600 hover:bg-rose-700 text-white border-0 rounded-[10px] text-[12px] font-bold cursor-pointer transition-all shadow-sm"
                            onClick={() => {
                              const adItem = modal.data;
                              closeModal();
                              handleDirectRejectAd(adItem);
                            }}
                          >
                            <X size={14} strokeWidth={2.5} />
                            Tolak Iklan
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-[#16a34a] hover:bg-[#15803d] text-white border-0 rounded-[10px] text-[12px] font-bold cursor-pointer transition-all shadow-sm"
                            onClick={() => {
                              const adId = modal.data.id;
                              closeModal();
                              handleApproveAd(adId);
                            }}
                          >
                            <Check size={14} strokeWidth={2.5} />
                            Setujui & Aktifkan Iklan
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()) : (modal.type.includes("delete") || modal.type.includes("reject")) && modal.type !== "rejectItem" && modal.type !== "rejectContentTx" && modal.type !== "rejectReferralTrx" && modal.type !== "rejectReferralCom" && modal.type !== "rejectReferralWithdrawal" ? (
                <div className="space-y-4 text-center py-2">
                  <p className="text-sm font-medium text-slate-700">Apakah Anda yakin ingin menghapus/menolak item ini?</p>
                  <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveModal}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ya, Lanjutkan
                    </button>
                  </div>
                </div>
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
              ) : modal.type === "addNavbarCategory" || modal.type === "editNavbarCategory" ? (
                <form className="flex flex-col gap-[14px]" onSubmit={(e) => { e.preventDefault(); handleSaveNavbarCategory(); }}>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Kategori Informasi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Berita Terkini"
                      value={navbarCategoryForm.name}
                      onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, name: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Slug (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: berita-terkini (otomatis jika dikosongkan)"
                      value={navbarCategoryForm.slug}
                      onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, slug: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>
                  {/* Upload Gambar Icon */}
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Gambar Icon Kategori (Upload Gambar)
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[10px]">
                      {navbarCategoryForm.icon_preview ? (
                        <div className="relative w-12 h-12 rounded-lg bg-white border border-[#e2e8f0] p-1 flex items-center justify-center shrink-0 shadow-2xs group">
                          <img
                            src={navbarCategoryForm.icon_preview}
                            alt="Icon Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setNavbarCategoryForm(prev => ({ ...prev, icon_file: null, icon_preview: null, remove_icon: 1 }))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors shadow-xs"
                            title="Hapus Gambar Icon"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#f1f5f9] border border-dashed border-[#cbd5e1] flex items-center justify-center text-[#94a3b8] shrink-0">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cbd5e1] hover:border-[#007570] text-[#0f172a] hover:text-[#007570] rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs">
                          <Upload size={14} />
                          <span>{navbarCategoryForm.icon_preview ? "Ganti Gambar Icon" : "Upload Gambar Icon (PNG/SVG/JPG/WEBP)"}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert("Ukuran gambar maksimal 5MB");
                                  return;
                                }
                                const previewUrl = URL.createObjectURL(file);
                                setNavbarCategoryForm(prev => ({
                                  ...prev,
                                  icon_file: file,
                                  icon_preview: previewUrl,
                                  remove_icon: 0,
                                }));
                              }
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-[#64748b] mt-1">
                          Disarankan gambar transparan format PNG/SVG persegi (cth: 64x64 px). Jika diisi, icon gambar ini yang akan diprioritaskan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Icon Emoji (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 📰, 🎉, 📢"
                        value={navbarCategoryForm.icon}
                        onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, icon: e.target.value })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Urutan (Order)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={navbarCategoryForm.order}
                        onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Kategori Induk (Parent)</label>
                    <select
                      value={navbarCategoryForm.parent_id}
                      onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, parent_id: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    >
                      <option value="">-- Tanpa Parent (Kategori Utama) --</option>
                      {navbarCategories
                        .filter((c) => (!modal.data || c.id !== modal.data.id) && !c.parent_id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-[8px] mt-[4px]">
                    <input
                      type="checkbox"
                      id="navbar_cat_is_active"
                      checked={navbarCategoryForm.is_active}
                      onChange={(e) => setNavbarCategoryForm({ ...navbarCategoryForm, is_active: e.target.checked })}
                      className="w-[16px] h-[16px] accent-[#007570] cursor-pointer"
                    />
                    <label htmlFor="navbar_cat_is_active" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Aktifkan Kategori Ini
                    </label>
                  </div>
                </form>
              ) : modal.type === "deleteNavbarCategory" ? (
                <p className="text-[14px] text-[#0f172a]">
                  Apakah Anda yakin ingin menghapus kategori informasi <strong>{modal.data?.name}</strong>?
                </p>
              ) : modal.type === "addAdPackage" || modal.type === "editAdPackage" ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveAdPackage(); }} className="flex flex-col gap-[14px]">
                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama Paket Iklan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Paket Premium Ads"
                        value={adPackageForm.name}
                        onChange={(e) => setAdPackageForm({ ...adPackageForm, name: e.target.value })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Tipe Penempatan (Placement) *</label>
                      <select
                        value={adPackageForm.placement_type || "standard"}
                        onChange={(e) => setAdPackageForm({ ...adPackageForm, placement_type: e.target.value })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      >
                        <option value="standard">Standard Ads (Continuous Running Ticker)</option>
                        <option value="premium">Premium Ads (Large Hero Visual Carousel)</option>
                      </select>
                    </div>
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
                      <div className="relative">
                        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#64748b] select-none">
                          Rp
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="0"
                          value={
                            packageForm.price === 0 || packageForm.price === "" || packageForm.price === undefined
                              ? ""
                              : Number(packageForm.price).toLocaleString("id-ID")
                          }
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            setPackageForm({
                              ...packageForm,
                              price: digitsOnly === "" ? 0 : parseInt(digitsOnly, 10),
                            });
                          }}
                          className="w-full pl-[36px] pr-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-semibold transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                        />
                      </div>
                      <div className="text-[11px] text-[#64748b] font-medium mt-[4px]">
                        {Number(packageForm.price) === 0 ? "Gratis (Rp 0)" : `Nominal: Rp ${Number(packageForm.price || 0).toLocaleString("id-ID")}`}
                      </div>
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
              ) : modal.type === "editReferralCode" ? (
                <form onSubmit={handleSaveReferralCode} className="flex flex-col gap-[16px]">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">User Pemilik</label>
                    <div className="px-[14px] py-[10px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] font-semibold text-[#0f172a]">
                      {modal.data?.name} ({modal.data?.email})
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Kode Referral Baru *</label>
                    <input
                      type="text"
                      required
                      value={editReferralCodeInput}
                      onChange={(e) => setEditReferralCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="Contoh: SATRIA10"
                      className="w-full px-[14px] py-[10px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-mono text-[14px] font-bold text-[#007570] outline-none focus:border-[#007570]"
                    />
                    <p className="text-[11.5px] text-[#64748b] mt-[4px]">
                      Hanya gunakan huruf kapital dan angka tanpa spasi (3-25 karakter).
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" className="px-[18px] py-[8px] rounded-[8px] bg-[#007570] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#005a58]">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              ) : modal.type === "viewReferralDetail" ? (
                <div className="flex flex-col gap-[18px]">
                  {/* Header Information */}
                  <div className="flex items-center justify-between p-[14px] bg-[#f0fdfa] rounded-[10px] border border-[#ccfbf1]">
                    <div>
                      <span className="text-[11px] text-[#007570] font-bold uppercase tracking-wider block">Nomor Transaksi</span>
                      <span className="font-mono text-[14px] font-extrabold text-[#007570]">{modal.data?.transaction_code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#64748b] block">{modal.data?.created_at}</span>
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#16a34a] mt-[2px]">
                        {modal.data?.payment_status === "paid" ? "Sudah Dibayar" : modal.data?.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Buyer & Referrer Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                    <div className="p-[14px] bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-wider block mb-[6px]">Pembeli &amp; Paket</span>
                      <div className="font-bold text-[#0f172a] text-[13.5px]">{modal.data?.buyer?.name}</div>
                      <div className="text-[12px] text-[#64748b]">{modal.data?.buyer?.email}</div>
                      <div className="text-[12px] text-[#007570] font-semibold mt-[4px]">
                        Paket: {modal.data?.package_name} ({modal.data?.business_name})
                      </div>
                    </div>

                    <div className="p-[14px] bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                      <span className="text-[11px] text-[#64748b] font-bold uppercase tracking-wider block mb-[6px]">Pemilik Referral</span>
                      <div className="font-bold text-[#0f172a] text-[13.5px]">{modal.data?.referrer?.name}</div>
                      <div className="text-[12px] text-[#64748b]">{modal.data?.referrer?.email} • {modal.data?.referrer?.phone || "-"}</div>
                      <div className="mt-[4px]">
                        <span className="font-mono text-[11.5px] font-bold text-[#007570] bg-white px-[6px] py-[1px] rounded border border-[#ccfbf1]">
                          Kode: {modal.data?.referral_code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-[14px] bg-white rounded-[10px] border border-[#e2e8f0] flex flex-col gap-[8px]">
                    <div className="flex justify-between text-[12.5px] text-[#64748b]">
                      <span>Harga Paket Normal</span>
                      <span className="font-semibold text-[#0f172a]">
                        Rp {Math.round(modal.data?.original_price > 0 ? modal.data?.original_price : ((modal.data?.final_price || 0) + (modal.data?.discount_amount || 5000))).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-[12.5px] text-[#dc2626]">
                      <span>Diskon Referral (Potongan Rp 5.000)</span>
                      <span className="font-semibold">- Rp {Math.round(modal.data?.discount_amount || 5000).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-[13.5px] font-bold text-[#0f172a] pt-[6px] border-t border-[#e2e8f0]">
                      <span>Harga Final Dibayar</span>
                      <span>Rp {Math.round(modal.data?.final_price > 0 ? modal.data?.final_price : Math.max(0, (modal.data?.original_price || 0) - (modal.data?.discount_amount || 5000))).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-[13px] font-bold text-[#16a34a] pt-[6px] border-t border-dashed border-[#e2e8f0]">
                      <span>Komisi Pemilik Referral (Rp 10.000)</span>
                      <span>Rp {Math.round(modal.data?.commission_amount || 10000).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* Visual 4-Step Timeline */}
                  <div className="p-[16px] bg-[#fafbfc] rounded-[10px] border border-[#e2e8f0]">
                    <span className="text-[11.5px] text-[#64748b] font-bold uppercase tracking-wider block mb-[14px]">Timeline &amp; Status Transaksi</span>
                    <div className="flex flex-col gap-[14px]">
                      <div className="flex items-start gap-[12px]">
                        <div className="w-[24px] h-[24px] rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px] font-bold shrink-0">✓</div>
                        <div>
                          <div className="font-bold text-[#0f172a] text-[12.5px]">Kode Referral Digunakan</div>
                          <div className="text-[11.5px] text-[#64748b]">Pembeli memasukkan kode {modal.data?.referral_code} pada saat checkout</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-[12px]">
                        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${modal.data?.payment_status === 'paid' ? 'bg-[#10b981] text-white' : 'bg-[#f59e0b] text-white'}`}>
                          {modal.data?.payment_status === 'paid' ? '✓' : '2'}
                        </div>
                        <div>
                          <div className="font-bold text-[#0f172a] text-[12.5px]">Pembayaran Pembeli</div>
                          <div className="text-[11.5px] text-[#64748b]">Status pembayaran: <strong className="capitalize">{modal.data?.payment_status}</strong></div>
                        </div>
                      </div>

                      <div className="flex items-start gap-[12px]">
                        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${modal.data?.referral_status === 'approved' ? 'bg-[#10b981] text-white' : modal.data?.referral_status === 'rejected' ? 'bg-[#ef4444] text-white' : 'bg-[#f59e0b] text-white'}`}>
                          {modal.data?.referral_status === 'approved' ? '✓' : modal.data?.referral_status === 'rejected' ? '✕' : '3'}
                        </div>
                        <div>
                          <div className="font-bold text-[#0f172a] text-[12.5px]">Verifikasi Referral &amp; Approval Admin</div>
                          <div className="text-[11.5px] text-[#64748b]">Status verifikasi: <strong className="capitalize">{modal.data?.referral_status}</strong></div>
                          {modal.data?.rejection_reason && (
                            <div className="text-[11.5px] text-[#dc2626] font-medium mt-[2px]">Alasan penolakan: {modal.data.rejection_reason}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-[12px]">
                        <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${modal.data?.payout_status === 'paid' ? 'bg-[#10b981] text-white' : 'bg-[#94a3b8] text-white'}`}>
                          {modal.data?.payout_status === 'paid' ? '✓' : '4'}
                        </div>
                        <div>
                          <div className="font-bold text-[#0f172a] text-[12.5px]">Pencairan Komisi Pemilik</div>
                          <div className="text-[11.5px] text-[#64748b]">Status komisi: <strong className="capitalize">{modal.data?.payout_status || 'Pending'}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-[8px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[18px] py-[8px] rounded-[8px] bg-[#007570] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#005a58]">
                      Tutup
                    </button>
                  </div>
                </div>
              ) : modal.type === "rejectReferralTrx" ? (
                <form onSubmit={handleRejectReferralTrx} className="flex flex-col gap-[16px]">
                  <p className="text-[13px] text-[#0f172a]">
                    Anda akan menolak transaksi referral <strong>{modal.data?.transaction_code}</strong>.
                  </p>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Alasan Penolakan *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan alasan mengapa transaksi referral ini ditolak..."
                      value={referralReasonInput}
                      onChange={(e) => setReferralReasonInput(e.target.value)}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" className="px-[18px] py-[8px] rounded-[8px] bg-[#dc2626] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#b91c1c]">
                      Tolak Transaksi
                    </button>
                  </div>
                </form>
              ) : modal.type === "rejectReferralCom" ? (
                <form onSubmit={handleRejectCommission} className="flex flex-col gap-[16px]">
                  <p className="text-[13px] text-[#0f172a]">
                    Anda akan menolak pencairan komisi untuk <strong>{modal.data?.referrer?.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Alasan Penolakan *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan alasan mengapa komisi ini ditolak..."
                      value={referralReasonInput}
                      onChange={(e) => setReferralReasonInput(e.target.value)}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" className="px-[18px] py-[8px] rounded-[8px] bg-[#dc2626] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#b91c1c]">
                      Tolak Komisi
                    </button>
                  </div>
                </form>
              ) : modal.type === "rejectReferralWithdrawal" && modal.data ? (
                <form onSubmit={handleRejectWithdrawal} className="flex flex-col gap-[16px]">
                  <div className="p-[14px] bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748b] uppercase font-bold tracking-wider">
                        Permohonan Penarikan Komisi
                      </span>
                      <span className="font-mono text-[12px] font-bold text-[#007570]">
                        {modal.data.code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-bold text-[#0f172a] text-[13.5px]">
                          {modal.data.user?.name} ({modal.data.user?.email})
                        </div>
                        <div className="text-[12px] text-[#475569] mt-0.5">
                          Rekening: <strong>{modal.data.bank_name}</strong> - <span className="font-mono font-semibold">{modal.data.account_number}</span> (an {modal.data.account_holder})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Nominal Penarikan:</span>
                        <span className="text-base font-black text-rose-600">
                          Rp {modal.data.amount?.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pemilihan Alasan Cepat Formal */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Pilih Alasan Penolakan Cepat (Bahasa Formal):
                    </label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {[
                        "Antrean pemrosesan penarikan dana saat ini sedang mengalami lonjakan antrean. Silakan ajukan kembali permohonan penarikan Anda dalam beberapa saat ke depan.",
                        "Informasi nomor rekening atau nama pemilik rekening tujuan tidak valid atau tidak sesuai dengan data profil terdaftar.",
                        "Layanan transfer ke bank atau e-wallet tujuan sedang dalam pemeliharaan sistem (maintenance) sementara.",
                        "Akumulasi saldo komisi yang memenuhi syarat belum mencukupi batas minimum penarikan yang ditentukan.",
                        "Terdapat indikasi transaksi referral yang belum terverifikasi atau memerlukan peninjauan lebih lanjut oleh tim audit.",
                        "Lainnya (Tulis alasan penolakan secara manual)",
                      ].map((preset, idx) => {
                        const isOther = preset.startsWith("Lainnya");
                        const isSelected = isOther
                          ? (![
                            "Antrean pemrosesan penarikan dana saat ini sedang mengalami lonjakan antrean. Silakan ajukan kembali permohonan penarikan Anda dalam beberapa saat ke depan.",
                            "Informasi nomor rekening atau nama pemilik rekening tujuan tidak valid atau tidak sesuai dengan data profil terdaftar.",
                            "Layanan transfer ke bank atau e-wallet tujuan sedang dalam pemeliharaan sistem (maintenance) sementara.",
                            "Akumulasi saldo komisi yang memenuhi syarat belum mencukupi batas minimum penarikan yang ditentukan.",
                            "Terdapat indikasi transaksi referral yang belum terverifikasi atau memerlukan peninjauan lebih lanjut oleh tim audit.",
                          ].includes(rejectWithdrawalReason) && rejectWithdrawalReason.length > 0)
                          : rejectWithdrawalReason.startsWith(preset.substring(0, 30));

                        return (
                          <label
                            key={idx}
                            onClick={() => {
                              if (isOther) {
                                setRejectWithdrawalReason("");
                              } else {
                                setRejectWithdrawalReason(preset);
                              }
                            }}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${isSelected
                                ? "bg-rose-50/70 border-rose-300 text-rose-900 font-semibold"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            <input
                              type="radio"
                              name="reject_wd_reason_option"
                              checked={isSelected}
                              onChange={() => { }}
                              className="mt-0.5 text-rose-600 focus:ring-rose-500 shrink-0"
                            />
                            <span className="leading-snug">{preset}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea Alasan Penolakan */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Catatan Alasan Penolakan (Bisa diedit manual) *</span>
                      <span className="text-[10.5px] text-slate-400 font-normal">Wajib diisi</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectWithdrawalReason}
                      onChange={(e) => setRejectWithdrawalReason(e.target.value)}
                      placeholder="Pilih opsi otomatis di atas atau ketik manual alasan spesifik penolakan..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11.5px] text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Status permohonan akan berubah menjadi <strong>Ditolak</strong>. Saldo komisi akan dikembalikan ke saldo komisi user dan catatan ini akan ditampilkan langsung di dashboard pengguna.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-[18px] py-[8px] rounded-[8px] bg-[#dc2626] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#b91c1c] shadow-sm"
                    >
                      Tolak Penarikan
                    </button>
                  </div>
                </form>
              ) : modal.type === "adjustReferralCom" ? (
                <form onSubmit={handleAdjustCommission} className="flex flex-col gap-[16px]">
                  <div className="p-[12px] bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0]">
                    <span className="text-[11px] text-[#64748b] uppercase font-bold tracking-wider block">Penerima Komisi</span>
                    <div className="font-bold text-[#0f172a]">{modal.data?.referrer?.name} ({modal.data?.transaction_code})</div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nominal Komisi Baru (Rp) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={referralAdjustAmountInput}
                      onChange={(e) => setReferralAdjustAmountInput(e.target.value)}
                      className="w-full px-[14px] py-[10px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-bold text-[14px] text-[#0f172a] outline-none focus:border-[#007570]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Alasan Penyesuaian *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Contoh: Penyesuaian pembulatan / promo khusus admin..."
                      value={referralAdjustReasonInput}
                      onChange={(e) => setReferralAdjustReasonInput(e.target.value)}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] outline-none focus:border-[#007570]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" className="px-[18px] py-[8px] rounded-[8px] bg-[#007570] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#005a58]">
                      Simpan Penyesuaian
                    </button>
                  </div>
                </form>
              ) : modal.type === "confirmApproveReferralTrx" ? (
                <div className="flex flex-col gap-[16px]">
                  <p className="text-[13px] text-[#0f172a]">
                    Apakah Anda yakin ingin menyetujui transaksi referral <strong>{modal.data?.transaction_code}</strong>?
                  </p>
                  <div className="p-[12px] bg-[#f0fdfa] rounded-[8px] border border-[#ccfbf1] text-[12px] text-[#007570]">
                    Status transaksi referral akan diubah menjadi <strong>Approved</strong> dan komisi pemilik sebesar <strong>Rp {Math.round(modal.data?.commission_amount || 0).toLocaleString("id-ID")}</strong> siap untuk dicairkan.
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="button" onClick={() => handleApproveReferralTrx(modal.data)} className="px-[18px] py-[8px] rounded-[8px] bg-[#16a34a] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#15803d]">
                      Ya, Setujui
                    </button>
                  </div>
                </div>
              ) : modal.type === "confirmApproveReferralCom" ? (
                <div className="flex flex-col gap-[16px]">
                  <p className="text-[13px] text-[#0f172a]">
                    Apakah Anda yakin ingin menyetujui komisi referral sebesar <strong>Rp {Math.round(modal.data?.commission_amount || 0).toLocaleString("id-ID")}</strong> untuk <strong>{modal.data?.referrer?.name}</strong>?
                  </p>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="button" onClick={() => handleApproveCommission(modal.data)} className="px-[18px] py-[8px] rounded-[8px] bg-[#2563eb] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#1d4ed8]">
                      Ya, Setujui Komisi
                    </button>
                  </div>
                </div>
              ) : modal.type === "confirmMarkPaidReferralCom" ? (
                <div className="flex flex-col gap-[16px]">
                  <p className="text-[13px] text-[#0f172a]">
                    Tandai bahwa komisi sebesar <strong>Rp {Math.round(modal.data?.commission_amount || 0).toLocaleString("id-ID")}</strong> sudah berhasil dibayarkan / ditransfer kepada <strong>{modal.data?.referrer?.name}</strong>?
                  </p>
                  <div className="p-[12px] bg-[#dcfce7] rounded-[8px] border border-[#bbf7d0] text-[12px] text-[#16a34a]">
                    Status pencairan komisi akan berubah menjadi <strong>Lunas (Paid)</strong> beserta stempel waktu pembayaran.
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="button" onClick={() => handleMarkCommissionPaid(modal.data)} className="px-[18px] py-[8px] rounded-[8px] bg-[#16a34a] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#15803d]">
                      Tandai Lunas
                    </button>
                  </div>
                </div>
              ) : modal.type === "rejectContentTx" ? (
                <form onSubmit={handleRejectContentTx} className="flex flex-col gap-[16px]">
                  <p className="text-[13.5px] text-[#0f172a]">
                    Anda akan menolak pembayaran transaksi <strong>{modal.data?.transaction_code}</strong> milik <strong>{modal.data?.user?.name}</strong>.
                  </p>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Alasan Penolakan / Catatan Admin *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Bukti transfer tidak jelas / nominal tidak sesuai / mutasi bank belum masuk..."
                      value={contentTxRejectReason}
                      onChange={(e) => setContentTxRejectReason(e.target.value)}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-[10px] pt-[12px] border-t border-[#e2e8f0]">
                    <button type="button" onClick={closeModal} className="px-[16px] py-[8px] rounded-[8px] bg-[#f1f5f9] text-[#64748b] font-semibold text-[13px] border-0 cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" className="px-[18px] py-[8px] rounded-[8px] bg-[#dc2626] text-white font-bold text-[13px] border-0 cursor-pointer hover:bg-[#b91c1c]">
                      Tolak Pembayaran
                    </button>
                  </div>
                </form>
              ) : modal.type === "viewContentTxDetail" ? (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Kode Transaksi</span>
                      <span className="font-bold text-slate-900 font-mono">{modal.data?.transaction_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Tanggal Transaksi</span>
                      <span className="font-bold text-slate-900">
                        {modal.data?.created_at ? new Date(modal.data.created_at).toLocaleString("id-ID") : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Pembeli</span>
                      <span className="font-bold text-slate-900">{modal.data?.user?.name} ({modal.data?.user?.email})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Konten Terkait</span>
                      <span className="font-bold text-slate-900">
                        [{modal.data?.content_type === "event" ? "Event" : "Blog"}] {modal.data?.blog?.title || `ID #${modal.data?.content_id}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Upload Normal</span>
                      <span>Rp {Number(modal.data?.original_amount || modal.data?.amount || 0).toLocaleString("id-ID")}</span>
                    </div>
                    {modal.data?.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Potongan Diskon {modal.data?.referral_code ? `(Referral: ${modal.data.referral_code})` : (modal.data?.coupon?.code ? `(Kupon: ${modal.data.coupon.code})` : "")}</span>
                        <span>- Rp {Number(modal.data.discount_amount).toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Pembayaran</span>
                      <span className="text-[#007570]">Rp {Number(modal.data?.amount || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {modal.data?.payment_proof && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">Bukti Transfer:</span>
                      <img
                        src={getStorageUrl(modal.data.payment_proof)}
                        alt="Bukti Transfer"
                        className="max-h-56 rounded-xl border border-slate-200 object-contain mx-auto bg-slate-900/5 p-1"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                    {modal.data?.payment_status === "pending" && (
                      <button
                        type="button"
                        onClick={() => {
                          closeModal();
                          handleApproveContentTx(modal.data);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Setujui & Terbitkan Sekarang
                      </button>
                    )}
                  </div>
                </div>
              ) : modal.type === "viewBusinessDetail" ? (
                <div className="space-y-4 text-left">
                  {/* Header Profile Ringkas Bisnis */}
                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center">
                      <img
                        src={getBusinessTablePhoto(modal.data)}
                        alt={modal.data?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#007570]/10 text-[#007570] uppercase tracking-wider">
                          {typeof modal.data?.category === "string" ? modal.data.category : modal.data?.category?.name || "Bisnis / UMKM"}
                        </span>
                        {modal.data?.is_premium ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Crown size={12} /> Bisnis Premium
                          </span>
                        ) : (modal.data?.subscription?.plan || modal.data?.subscriptions?.[0]?.plan) ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Crown size={12} className="text-amber-700" />
                            Paket {modal.data?.subscription?.plan?.name || modal.data?.subscriptions?.[0]?.plan?.name} (Menunggu Verifikasi)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                            Paket Reguler
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${modal.data?.status === "approved" || modal.data?.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : modal.data?.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                          {modal.data?.status === "approved" || modal.data?.status === "published" ? "Aktif" : modal.data?.status === "rejected" ? "Ditolak" : "Pending"}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {modal.data?.name || "Nama Bisnis"}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={13} className="text-[#007570] shrink-0" />
                        <span>{modal.data?.address || modal.data?.city || "Indonesia"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Grid Informasi Kontak & Pemilik */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pemilik Bisnis</span>
                      <p className="font-bold text-slate-800">{modal.data?.user?.name || modal.data?.owner || "-"}</p>
                      <p className="text-slate-500">{modal.data?.user?.email || modal.data?.email || "-"}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kontak / Telepon</span>
                      <p className="font-bold text-slate-800">{modal.data?.phone || modal.data?.whatsapp || "-"}</p>
                      <p className="text-slate-500">{modal.data?.website || "Tidak ada website"}</p>
                    </div>
                  </div>

                  {/* Deskripsi Singkat */}
                  {modal.data?.description && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi Usaha</span>
                      {/<[a-z][\s\S]*>/i.test(modal.data.description) ? (
                        <div
                          className="text-slate-700 leading-relaxed max-h-36 overflow-y-auto pr-1 prose prose-sm max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: modal.data.description }}
                        />
                      ) : (
                        <p className="text-slate-700 leading-relaxed max-h-24 overflow-y-auto pr-1 whitespace-pre-wrap">{modal.data.description}</p>
                      )}
                    </div>
                  )}

                  {/* Bukti Transaksi / Pembayaran */}
                  {(() => {
                    const sub = modal.data?.subscription || modal.data?.subscriptions?.[0] || modal.data?.latest_subscription || modal.data?.latestSubscription || (modal.data?.subscriptions && modal.data?.subscriptions.find(s => s.payment?.proof || s.status === 'pending'));
                    const pay = modal.data?.payment || sub?.payment || modal.data?.payments?.[0] || (modal.data?.subscriptions && modal.data.subscriptions.find(s => s.payment)?.payment);
                    const rawProof = pay?.proof || sub?.payment?.proof || sub?.proof || sub?.proof_path || modal.data?.proof_document || modal.data?.proof || modal.data?.payment_proof || (modal.data?.subscriptions && modal.data.subscriptions.find(s => s.payment?.proof)?.payment?.proof);
                    const proofUrl = modal.data?.proof_url || sub?.proof_url || pay?.proof_url || (rawProof ? getStorageUrl(rawProof) : null);
                    // Check whether this business actually has a paid / premium transaction
                    const isPremiumBiz = Boolean(
                      modal.data?.is_premium ||
                      (modal.data?.package && modal.data.package !== 'free' && modal.data.package !== 'reguler') ||
                      (modal.data?.premium_plan && !modal.data.premium_plan.toLowerCase().includes('free'))
                    );
                    const hasPaidSub = Boolean(
                      sub && (
                        Number(sub.final_price || sub.price || sub.amount) > 0 ||
                        (sub.plan && !String(sub.plan?.name || sub.plan).toLowerCase().includes('free'))
                      )
                    );
                    const hasPaidPay = Boolean(
                      pay && (Number(pay.amount) > 0 || pay.proof)
                    );
                    const hasProof = Boolean(proofUrl || rawProof);
                    const hasTxInfo = isPremiumBiz || hasPaidSub || hasPaidPay || hasProof;

                    // Jika bisnis Free / Reguler (tanpa transaksi berbayar atau bukti transfer), jangan tampilkan status transaksi sama sekali!
                    if (!hasTxInfo) {
                      return null;
                    }

                    const planName = typeof sub?.plan === "object" ? (sub?.plan?.name || "Paket Premium") : (typeof sub?.plan === "string" ? sub?.plan : (modal.data?.premium_plan || "Paket Premium"));
                    const totalAmount = Number(sub?.final_price || sub?.amount || pay?.amount || sub?.price || 0);
                    const isPaid = (pay?.status === "paid" || pay?.status === "approved" || sub?.status === "active" || modal.data?.is_premium) && pay?.status !== "pending" && sub?.status !== "pending";
                    const isFailed = pay?.status === "failed" || pay?.status === "rejected" || sub?.status === "rejected" || modal.data?.status === "rejected";
                    const refCode = sub?.referral_code || pay?.referral_code || sub?.coupon_code || pay?.coupon_code || modal.data?.used_referral_code || modal.data?.used_coupon_code;
                    const discountAmt = Number(sub?.discount_amount || pay?.discount_amount || sub?.discount || 0);

                    // Deteksi apakah pembayaran menggunakan Poin Surade
                    const rawMethod = String(sub?.payment_method || pay?.payment_method || modal.data?.payment_method || "").toLowerCase();
                    const isPaidWithPoin = rawMethod.includes("poin") || rawMethod.includes("coin") || String(sub?.plan || modal.data?.premium_plan || "").toLowerCase().includes("poin");
                    let paymentMethod = "Transfer Bank / QRIS";
                    if (isPaidWithPoin) {
                      paymentMethod = sub?.payment_method || pay?.payment_method || "Poin Surade";
                      if (!paymentMethod.toLowerCase().includes("poin")) {
                        paymentMethod = "Poin Surade";
                      }
                    } else if (pay?.payment_method && pay.payment_method.toLowerCase() === "qris") {
                      paymentMethod = "QRIS";
                    } else if (pay?.payment_method && pay.payment_method.toLowerCase() === "manual") {
                      paymentMethod = "Transfer Manual / QRIS";
                    } else if (pay?.payment_method || sub?.payment_method) {
                      paymentMethod = pay?.payment_method || sub?.payment_method;
                    }
                    const poinAmount = isPaidWithPoin ? Math.round(totalAmount / 1000) : 0;

                    return (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-[#007570]" />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Status Transaksi &amp; Bukti Pembayaran
                            </span>
                          </div>
                          {hasTxInfo && (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-[#007570] text-white">
                              {planName}
                            </span>
                          )}
                        </div>

                        {hasTxInfo ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400 block">Total Tagihan:</span>
                                <span className="font-extrabold text-[#007570] flex items-center gap-1.5 flex-wrap">
                                  <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                                  {isPaidWithPoin && poinAmount > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      <SuradeCoinIcon size={14} />
                                      <span>{poinAmount} Poin</span>
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block">Metode Pembayaran:</span>
                                {isPaidWithPoin ? (
                                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs mt-0.5 shadow-2xs">
                                    <SuradeCoinIcon size={16} />
                                    <span>{paymentMethod}</span>
                                  </span>
                                ) : (
                                  <span className="font-bold text-slate-700">
                                    {paymentMethod}
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 block">Status Pembayaran:</span>
                                <span className={`font-bold ${isPaid
                                    ? "text-emerald-600"
                                    : isFailed
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }`}>
                                  {isPaid ? "Lunas / Disetujui" : isFailed ? "Ditolak / Gagal" : "Menunggu Verifikasi"}
                                </span>
                              </div>
                            </div>

                            {Boolean((refCode && String(refCode).trim() !== "") || discountAmt > 0) && (
                              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <span>🎁</span> Kode Referral
                                  </span>
                                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-extrabold">
                                    {refCode || "REFERRAL"}
                                  </span>
                                </div>
                                {discountAmt > 0 ? (
                                  <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                                    Diskon: -Rp {discountAmt.toLocaleString("id-ID")}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                                    ✓ Menggunakan Kode Referral (Potongan Diskon Berhasil)
                                  </span>
                                )}
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>Foto Bukti Pembayaran</span>
                                {proofUrl && (
                                  <a
                                    href={proofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-[#007570] hover:underline"
                                  >
                                    Buka Ukuran Penuh ↗
                                  </a>
                                )}
                              </label>
                              {proofUrl ? (
                                <div className="rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center p-1 max-h-[260px]">
                                  <img
                                    src={proofUrl}
                                    alt="Bukti Transfer"
                                    className="max-h-[240px] w-auto object-contain rounded-lg"
                                  />
                                </div>
                              ) : isPaidWithPoin ? (
                                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <SuradeCoinIcon size={26} />
                                  </div>
                                  <div className="space-y-0.5 text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                      <span>Dibayar Menggunakan Poin Surade</span>
                                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-extrabold uppercase tracking-wide">
                                        Aktivasi Otomatis
                                      </span>
                                    </div>
                                    <p className="text-emerald-700 leading-relaxed text-[11px]">
                                      Transaksi ini lunas dipotong langsung dari saldo <b>Poin Surade</b> pemilik usaha (Aktivasi Otomatis Instan). Tidak memerlukan transfer bank manual ataupun upload bukti transfer.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center bg-white border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                                  Belum ada foto bukti transfer yang diunggah.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-slate-400 shrink-0" />
                            <span>Usaha terdaftar pada paket Reguler / Free (Tidak memerlukan bukti transfer).</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Rejection Note if exists */}
                  {modal.data?.rejection_reason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      <span className="font-bold block mb-0.5">Alasan Penolakan Terakhir:</span>
                      {modal.data.rejection_reason}
                    </div>
                  )}

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>

                    {/* Tombol Lihat Bisnis - redirect ke halaman detail bisnis */}
                    <button
                      type="button"
                      onClick={() => {
                        if (modal.data?.id) {
                          // Gunakan slug jika ada, fallback ke id
                          const identifier = modal.data?.slug || modal.data?.id;
                          window.open(`/business/${identifier}`, '_blank');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M10 14L21 3M21 10v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                      <span>Lihat Bisnis</span>
                    </button>

                    {(() => {
                      const biz = modal.data;
                      const isPendingBiz = biz?.status === "pending" || (!biz?.is_verified && biz?.status !== "approved" && biz?.status !== "rejected");
                      const isRevisionBiz = biz?.status === "needs_revision";
                      const sub = biz?.subscription || biz?.subscriptions?.[0] || biz?.latest_subscription;
                      const isPendingSub = sub?.status === "pending";
                      const isRevisionSub = sub?.status === "needs_revision";
                      const canTakeAction = isPendingBiz || isRevisionBiz || isPendingSub || isRevisionSub;

                      if (!canTakeAction || biz?.status === "rejected") return null;

                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              handleOpenRevisionModal(biz);
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <AlertTriangle size={14} strokeWidth={2.5} />
                            <span>Minta Perbaikan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              handleDirectRejectBusiness(biz);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <X size={14} strokeWidth={2.5} />
                            <span>Tolak {isPendingSub || isRevisionSub ? "Upgrade" : "Bisnis"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              handleApproveBusiness(biz.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} strokeWidth={2.5} />
                            <span>Setujui {isPendingSub ? "Upgrade" : "Bisnis"}</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : modal.type === "viewBlogDetail" ? (
                <div className="space-y-4 text-left">
                  {/* Top Header Card */}
                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center">
                      {modal.data?.thumbnail ? (
                        <img
                          src={getStorageUrl(modal.data.thumbnail)}
                          alt={modal.data?.title}
                          loading="eager"
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="text-slate-400">
                          {modal.data?.type === "event" ? <Calendar size={28} /> : <FileText size={28} />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${modal.data?.type === "event" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-800"
                          }`}>
                          {modal.data?.type === "event" ? "Acara / Event" : "Artikel / Blog"}
                        </span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {modal.data?.blog_category || modal.data?.category?.name || "Umum"}
                        </span>
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${modal.data?.status === "published" || modal.data?.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : modal.data?.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                          {modal.data?.status === "published" || modal.data?.status === "approved"
                            ? "Published"
                            : modal.data?.status === "pending"
                              ? "Menunggu Verifikasi"
                              : "Ditolak / Revisi"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {modal.data?.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span>Penulis: <strong>{modal.data?.user?.name || modal.data?.author || "User"}</strong></span>
                        <span>•</span>
                        <span>Dibuat: {modal.data?.created_at ? new Date(modal.data.created_at).toLocaleDateString("id-ID") : "-"}</span>
                        {modal.data?.type === "event" && modal.data?.event_date && (
                          <>
                            <span>•</span>
                            <span className="text-purple-700 font-semibold">Tgl Event: {new Date(modal.data.event_date).toLocaleDateString("id-ID")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Note if Rejected */}
                  {modal.data?.status === "rejected" && modal.data?.rejection_reason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-rose-900">
                        <AlertCircle size={14} className="text-rose-600" /> Catatan Penolakan Sebelumnya:
                      </span>
                      <p className="pl-4 leading-relaxed">{modal.data.rejection_reason}</p>
                    </div>
                  )}

                  {/* Ringkasan & Konten Preview */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ringkasan & Cuplikan Konten
                    </h5>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                      {modal.data?.excerpt && (
                        <p className="font-medium text-slate-900 border-b border-slate-200/80 pb-2">
                          <strong>Ringkasan:</strong> {modal.data.excerpt}
                        </p>
                      )}
                      <div className="max-h-32 overflow-y-auto pr-1 text-slate-600 text-[11.5px] leading-relaxed">
                        {modal.data?.content || "Tidak ada konten."}
                      </div>
                    </div>
                  </div>

                  {/* Bukti Transaksi & Pembayaran User */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between flex-wrap gap-1.5">
                      <span>Informasi Transaksi & Bukti Pembayaran</span>
                      <span className="font-mono text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-bold flex items-center gap-1 shadow-2xs">
                        <span className="text-[10px] text-teal-600 font-normal">KODE:</span>
                        {modal.data?.latest_transaction?.transaction_code ||
                          modal.data?.latestTransaction?.transaction_code ||
                          (modal.data?.id ? `CTX-${new Date(modal.data?.created_at || Date.now()).getFullYear()}${(new Date(modal.data?.created_at || Date.now()).getMonth() + 1).toString().padStart(2, '0')}${new Date(modal.data?.created_at || Date.now()).getDate().toString().padStart(2, '0')}-${String(modal.data.id).padStart(4, '0')}` : "CTX-VERIF")}
                      </span>
                    </h5>

                    {modal.loadingDetail ? (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <SuradeLoader variant="section" size="sm" text="Memuat data transaksi & bukti transfer" minHeight="120px" />
                      </div>
                    ) : (() => {
                      const tx = modal.data?.latest_transaction || modal.data?.latestTransaction || modal.data?.transaction;
                      const rawProof = tx?.payment_proof || modal.data?.payment_proof;
                      const proofUrl = rawProof ? getStorageUrl(rawProof) : null;
                      const paymentMethod = tx?.payment_method || modal.data?.payment_method || "Transfer Bank";
                      const paymentStatus = tx?.payment_status || (modal.data?.status === "published" || modal.data?.status === "approved" ? "paid" : modal.data?.status === "pending" ? "pending" : "failed");

                      // Price & Coupon calculations
                      const originalPrice = Number(modal.data?.original_price || (tx?.discount_amount > 0 ? (Number(tx.amount) + Number(tx.discount_amount)) : (modal.data?.type === "event" ? 15000 : 10000)));
                      const discountAmount = Number(tx?.discount_amount || modal.data?.discount_amount || 0);
                      const finalAmount = tx?.amount != null
                        ? Number(tx.amount)
                        : (modal.data?.final_price != null ? Number(modal.data.final_price) : Math.max(0, originalPrice - discountAmount));
                      const couponCode = modal.data?.coupon_code || tx?.coupon?.code || (discountAmount > 0 ? (tx?.coupon_id ? `ID #${tx.coupon_id}` : "Kupon Aktif") : null);

                      if (tx || proofUrl || modal.data?.payment_proof || modal.data?.payment_method) {
                        return (
                          <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-200/70 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-white/70 p-3 rounded-xl border border-teal-100">
                              <div>
                                <span className="text-slate-400 block text-[10.5px]">Metode Bayar</span>
                                <span className="font-bold text-slate-800">{paymentMethod}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10.5px]">Kupon / Diskon</span>
                                {discountAmount > 0 || couponCode ? (
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10.5px] mt-0.5">
                                    <Tag size={10} />
                                    <span>{couponCode || "Kupon"} (-Rp {discountAmount.toLocaleString("id-ID")})</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-medium">Tanpa Kupon</span>
                                )}
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10.5px]">Total Pembayaran</span>
                                <div className="flex items-baseline gap-1.5 flex-wrap">
                                  <span className="font-black text-sm text-[#007570]">
                                    Rp {finalAmount.toLocaleString("id-ID")}
                                  </span>
                                  {discountAmount > 0 && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      Rp {originalPrice.toLocaleString("id-ID")}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10.5px]">Status Transaksi</span>
                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] inline-block ${paymentStatus === "paid" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                    paymentStatus === "pending" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                                  }`}>
                                  {paymentStatus === "paid" ? "Lunas" : paymentStatus === "pending" ? "Menunggu Verifikasi" : "Gagal/Ditolak"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10.5px]">Waktu Bayar</span>
                                <span className="font-medium text-slate-700">
                                  {tx?.created_at ? new Date(tx.created_at).toLocaleDateString("id-ID") : (modal.data?.updated_at ? new Date(modal.data.updated_at).toLocaleDateString("id-ID") : "-")}
                                </span>
                              </div>
                            </div>

                            {/* Bukti Foto Transfer */}
                            {proofUrl ? (
                              <div className="pt-2 border-t border-teal-100">
                                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                                  Foto Struk / Bukti Pembayaran:
                                </span>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                  <a
                                    href={proofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative block w-40 h-28 rounded-xl overflow-hidden border-2 border-teal-300 shadow-sm hover:border-[#007570] transition-colors shrink-0 bg-white"
                                    title="Klik untuk membuka ukuran penuh"
                                  >
                                    <img
                                      src={proofUrl}
                                      alt="Bukti Transfer"
                                      loading="eager"
                                      decoding="async"
                                      className="w-full h-full object-contain p-1 bg-slate-50"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-opacity">
                                      Buka Foto ↗
                                    </div>
                                  </a>
                                  <div className="text-xs text-slate-600 space-y-1">
                                    <p className="font-bold text-slate-800">Bukti pembayaran telah diunggah oleh user.</p>
                                    <p className="text-[11px] text-slate-500">
                                      Klik pada foto struk di samping untuk melihat bukti transfer berukuran penuh.
                                    </p>
                                    <a
                                      href={proofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007570] hover:underline mt-1"
                                    >
                                      <ExternalLink size={12} /> Buka Struk di Tab Baru
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-white/80 rounded-xl border border-teal-100 text-xs text-slate-500">
                                Belum ada file bukti pembayaran yang diunggah.
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                          Konten ini diterbitkan langsung oleh admin atau belum memiliki catatan transaksi berbayar.
                        </div>
                      );
                    })()}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>

                    {/* Tombol Lihat Artikel/Event - redirect ke halaman detail artikel langsung */}
                    <button
                      type="button"
                      onClick={() => {
                        if (modal.data?.id) {
                          const identifier = modal.data?.slug || modal.data?.id;
                          window.open(`/blog/${identifier}`, '_blank');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                      title={`Lihat Halaman ${modal.data?.type === "event" ? "Event" : "Artikel"} Langsung`}
                    >
                      <ExternalLink size={14} />
                      <span>Lihat {modal.data?.type === "event" ? "Event" : "Artikel"}</span>
                    </button>
                    {modal.data?.status !== "published" && modal.data?.status !== "approved" && modal.data?.status !== "rejected" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const blogData = modal.data;
                            closeModal();
                            handleOpenRevisionModal("blog", blogData);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <AlertTriangle size={14} strokeWidth={2.5} />
                          <span>Minta Perbaikan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const blogData = modal.data;
                            closeModal();
                            handleDirectRejectBlog(blogData);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <X size={14} strokeWidth={2.5} />
                          <span>Tolak Konten</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleApproveBlog(modal.data.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Setujui & Publikasikan</span>
                        </button>
                      </>
                    )}

                    {(modal.data?.status === "published" || modal.data?.status === "approved") && (
                      <button
                        type="button"
                        onClick={() => handleUnapproveBlog(modal.data.id)}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Batalkan Persetujuan Konten ini"
                      >
                        <RotateCcw size={14} strokeWidth={2.5} />
                        <span>Batalkan Persetujuan</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : modal.type === "viewPaymentDetail" ? (
                <div className="space-y-4 text-left">
                  {/* Details Header Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Usaha / Bisnis</span>
                        <h4 className="text-sm font-black text-slate-900">{modal.data?.business?.name || "Usaha"}</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Crown size={13} /> {modal.data?.plan?.name || "Paket Premium"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block">Pemilik / User</span>
                        <span className="font-semibold text-slate-800">{modal.data?.user?.name || "-"}</span>
                        <span className="text-[11px] text-slate-500 block">{modal.data?.user?.email || "-"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Tagihan &amp; Metode</span>
                        <span className="font-extrabold text-[#007570]">
                          Rp {Number(modal.data?.plan?.price || modal.data?.amount || 0).toLocaleString("id-ID")}
                        </span>
                        <span className="text-[11px] text-slate-600 block">{modal.data?.payment_method || modal.data?.method || "Transfer Bank"}</span>
                      </div>
                    </div>
                    {modal.data?.rejection_reason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                        <span className="font-bold block mb-0.5">Alasan Penolakan:</span>
                        {modal.data.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Bukti Pembayaran Preview */}
                  {(() => {
                    const paymentProofUrl = modal.data?.proof_url || (modal.data?.proof ? getStorageUrl(modal.data.proof) : null);
                    const isPoinSub = Boolean(
                      String(modal.data?.payment_method || modal.data?.method || modal.data?.plan?.name || modal.data?.plan || "").toLowerCase().includes("poin") ||
                      String(modal.data?.payment_method || modal.data?.method || "").toLowerCase().includes("coin")
                    );
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Foto Bukti Pembayaran / Struk Transfer</span>
                          {paymentProofUrl && (
                            <a
                              href={paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-[#007570] hover:underline"
                            >
                              Buka Ukuran Penuh ↗
                            </a>
                          )}
                        </label>
                        {paymentProofUrl ? (
                          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center p-1 max-h-[320px]">
                            <img
                              src={paymentProofUrl}
                              alt="Bukti Transfer"
                              className="max-h-[300px] w-auto object-contain rounded-xl"
                            />
                          </div>
                        ) : isPoinSub ? (
                          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                              <SuradeCoinIcon size={30} />
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                <span className="text-sm">Pembayaran via Poin Surade</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-extrabold uppercase tracking-wide">
                                  Terverifikasi Otomatis
                                </span>
                              </div>
                              <p className="text-emerald-700 leading-relaxed text-xs">
                                Langganan paket ini telah dibayar lunas menggunakan saldo <b>Poin Surade</b>. Sistem telah mengaktifkannya secara instan tanpa perlu upload struk transfer manual.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                            Belum ada foto bukti transfer yang diunggah.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                    {modal.data?.payment_status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            closeModal();
                            handleOpenRevisionModal("payment", modal.data);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <AlertTriangle size={14} strokeWidth={2.5} />
                          <span>Minta Perbaikan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeModal();
                            handleDirectRejectPayment(modal.data);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <X size={14} strokeWidth={2.5} />
                          <span>Tolak Pembayaran</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeModal();
                            handleApprovePayment(modal.data?.payment_id || modal.data?.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={14} strokeWidth={2.5} />
                          <span>Setujui Pembayaran</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : modal.type === "viewWaLogDetail" ? (
                <div className="space-y-4 text-left">
                  {/* Details Header Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Bisnis / UMKM Tujuan</span>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {modal.data?.business?.name || modal.data?.business_name || "Bisnis Tujuan"}
                        </h4>
                        <span className="text-[11px] text-slate-500 block">
                          Kategori: {modal.data?.business_category_name || modal.data?.business?.category?.name || "Umum"}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        {modal.data?.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={12} /> Menunggu Verifikasi
                          </span>
                        )}
                        {(modal.data?.status === "completed" || modal.data?.status === "approved") && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Disetujui
                          </span>
                        )}
                        {modal.data?.status === "rejected" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertTriangle size={12} /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10.5px] uppercase">Pemohon / Customer</span>
                        <span className="font-bold text-slate-800 block text-sm">{modal.data?.user?.name || modal.data?.user_name || modal.data?.customer_name || "User Demo"}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{modal.data?.user?.email || modal.data?.user_email || "customer@surade.com"}</span>
                        <span className="text-[11px] text-slate-600 block mt-0.5">
                          WA/HP: <strong>{modal.data?.user?.phone || modal.data?.user_phone || modal.data?.customer_phone || "-"}</strong>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10.5px] uppercase">Rincian Pembayaran</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-black text-emerald-600 text-base">
                            Rp {Number(modal.data?.fee_amount || 0).toLocaleString("id-ID")}
                          </span>
                          {Number(modal.data?.discount_amount || 0) > 0 && (
                            <span className="line-through text-slate-400 text-xs">
                              Rp {Number(Number(modal.data?.fee_amount || 0) + Number(modal.data?.discount_amount || 0)).toLocaleString("id-ID")}
                            </span>
                          )}
                          {modal.data?.coupon_code && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              Kupon: {modal.data.coupon_code}
                            </span>
                          )}
                        </div>
                        {Number(modal.data?.discount_amount || 0) > 0 && (
                          <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                            Potongan Kupon: -Rp {Number(modal.data?.discount_amount || 0).toLocaleString("id-ID")}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-600 block mt-0.5">
                          Metode: <strong>{modal.data?.payment_method || "Transfer Bank / QRIS"}</strong>
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Kode: {modal.data?.transaction_code || `WA-${modal.data?.id}`}
                        </span>
                      </div>
                    </div>

                    {modal.data?.rejection_reason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                        <span className="font-bold block mb-0.5 flex items-center gap-1">
                          <AlertTriangle size={13} className="text-rose-600" />
                          Alasan Penolakan Saat Ini:
                        </span>
                        {modal.data.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Bukti Pembayaran (Bisa Toggle antara Bukti Terkini dan Riwayat Bukti Lama) */}
                  {(() => {
                    const currentProofUrl = modal.data?.proof_url || getStorageUrl(modal.data?.proof_image);
                    const displayProofImg = activeWaProofDetailView?.url || currentProofUrl;

                    return (
                      <div>
                        {/* Notice jika sedang melihat foto arsip lama */}
                        {activeWaProofDetailView && (
                          <div className="flex items-center justify-between bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl mb-2 text-xs text-amber-900 shadow-2xs">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Clock size={13} className="text-amber-600" />
                              <span>Menampilkan: {activeWaProofDetailView.title} (Ditolak: {activeWaProofDetailView.date})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveWaProofDetailView(null)}
                              className="text-teal-700 hover:text-teal-900 font-extrabold text-[11px] underline cursor-pointer"
                            >
                              🔄 Tampilkan Bukti Terkini
                            </button>
                          </div>
                        )}

                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>
                            {activeWaProofDetailView ? `Foto ${activeWaProofDetailView.title}` : "Foto Bukti Transfer Terkini (Aktif)"}
                          </span>
                          {displayProofImg && (
                            <a
                              href={displayProofImg}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-teal-600 hover:underline"
                            >
                              Buka Ukuran Penuh ↗
                            </a>
                          )}
                        </label>
                        {displayProofImg ? (
                          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center p-1 max-h-[300px]">
                            <img
                              src={displayProofImg}
                              alt="Bukti Transfer"
                              className="max-h-[280px] w-auto object-contain rounded-xl cursor-pointer"
                              onClick={() => window.open(displayProofImg, "_blank")}
                              title="Klik untuk membuka ukuran penuh"
                            />
                          </div>
                        ) : (
                          <div className="p-6 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                            Belum ada foto bukti transfer yang diunggah.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Riwayat Bukti Transfer & Penolakan Sebelumnya */}
                  {modal.data?.proof_history && modal.data.proof_history.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-600" />
                        <span>Riwayat Bukti Transfer Sebelumnya ({modal.data.proof_history.length})</span>
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {modal.data.proof_history.map((hist, hIdx) => {
                          const histImg = hist.proof_url || (hist.proof_image ? getStorageUrl(hist.proof_image) : null);
                          const histDate = hist.rejected_at ? new Date(hist.rejected_at).toLocaleString("id-ID", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          }) : "-";
                          const isCurrentlySelected = activeWaProofDetailView?.url === histImg;

                          return (
                            <div
                              key={hIdx}
                              className={`p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all ${isCurrentlySelected
                                  ? "bg-amber-100/90 border-2 border-amber-400 shadow-2xs"
                                  : "bg-amber-50/70 border border-amber-200 hover:border-amber-300"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {histImg && (
                                  <img
                                    src={histImg}
                                    alt="Bukti Lama"
                                    onClick={() => {
                                      setActiveWaProofDetailView({
                                        url: histImg,
                                        title: `Bukti Lama #${hIdx + 1}`,
                                        date: histDate,
                                        reason: hist.rejection_reason,
                                      });
                                    }}
                                    className="w-12 h-12 rounded-lg object-cover border border-amber-300 bg-slate-100 shrink-0 cursor-pointer hover:opacity-80"
                                    title="Klik untuk tampilkan di atas"
                                  />
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-amber-900 block text-[11.5px]">
                                    Bukti #{hIdx + 1} • Ditolak: {histDate}
                                  </span>
                                  <span className="text-amber-800 text-[11px] block italic truncate">
                                    "{hist.rejection_reason || 'Bukti pembayaran tidak valid'}"
                                  </span>
                                </div>
                              </div>
                              {histImg && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isCurrentlySelected) {
                                      setActiveWaProofDetailView(null);
                                    } else {
                                      setActiveWaProofDetailView({
                                        url: histImg,
                                        title: `Bukti Lama #${hIdx + 1}`,
                                        date: histDate,
                                        reason: hist.rejection_reason,
                                      });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold shrink-0 cursor-pointer transition-colors ${isCurrentlySelected
                                      ? "bg-amber-600 text-white hover:bg-amber-700"
                                      : "bg-amber-200/80 hover:bg-amber-300 text-amber-900"
                                    }`}
                                >
                                  {isCurrentlySelected ? "Menampilkan" : "Lihat"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2 flex-wrap">
                    <div>
                      {modal.data?.user?.phone || modal.data?.user_phone || modal.data?.customer_phone ? (
                        <a
                          href={`https://wa.me/${String(modal.data?.user?.phone || modal.data?.user_phone || modal.data?.customer_phone).replace(/\D/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition-colors"
                        >
                          <MessageSquare size={13} />
                          <span>Chat Customer</span>
                        </a>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                      {modal.data?.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              handleOpenRevisionModal("whatsapp", modal.data);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <X size={14} strokeWidth={2.5} />
                            <span>Tolak Pembayaran</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              approveWaLog(modal.data?.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} strokeWidth={2.5} />
                            <span>Setujui Akses</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : modal.type === "viewChatLogDetail" ? (
                <div className="space-y-4 text-left">
                  {/* Details Header Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Bisnis / UMKM Tujuan Chat</span>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {modal.data?.business?.name || modal.data?.business_name || "Bisnis Tujuan"}
                        </h4>
                        <span className="text-[11px] text-slate-500 block">
                          Kategori: {modal.data?.business_category_name || modal.data?.business?.category?.name || "Umum"}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        {modal.data?.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={12} /> Menunggu Verifikasi
                          </span>
                        )}
                        {(modal.data?.status === "completed" || modal.data?.status === "approved") && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Disetujui
                          </span>
                        )}
                        {modal.data?.status === "rejected" && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                            <AlertTriangle size={12} /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10.5px] uppercase">Pemohon / Pengirim Pesan</span>
                        <span className="font-bold text-slate-800 block text-sm">{modal.data?.user?.name || modal.data?.user_name || modal.data?.customer_name || "User Demo"}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{modal.data?.user?.email || modal.data?.user_email || "customer@surade.com"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10.5px] uppercase">Nominal & Metode Bayar</span>
                        <span className="font-black text-[#007570] block text-sm">
                          Rp {Number(modal.data?.fee_amount || 4000).toLocaleString("id-ID")}
                        </span>
                        <span className="text-[11px] text-slate-600 block">{modal.data?.payment_method || "QRIS Instant"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11.5px] text-slate-500">
                      <span>Kode Transaksi: <strong className="font-mono text-slate-700">{modal.data?.transaction_code || ("CHAT-" + (modal.data?.id || "LOG"))}</strong></span>
                      <span>Waktu: {modal.data?.created_at ? new Date(modal.data.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</span>
                    </div>

                    {modal.data?.rejection_reason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                        <span className="font-bold block mb-0.5">Alasan Penolakan:</span>
                        {modal.data.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Foto Struk Transfer QRIS */}
                  {(() => {
                    const proofImg = modal.data?.proof_url || (modal.data?.proof_image ? getStorageUrl(modal.data.proof_image) : null);
                    return (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Foto Bukti Pembayaran QRIS Chat</span>
                          {proofImg && (
                            <a
                              href={proofImg}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-[#007570] hover:underline"
                            >
                              Buka Ukuran Penuh ↗
                            </a>
                          )}
                        </label>
                        {proofImg ? (
                          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 flex items-center justify-center p-2 max-h-[300px]">
                            <img
                              src={proofImg}
                              alt="Bukti QRIS Chat"
                              className="max-h-[280px] w-auto object-contain rounded-xl"
                            />
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                            Tidak ada foto bukti transfer yang diunggah.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 gap-2 flex-wrap">
                    <div>
                      {modal.data?.user?.phone || modal.data?.user_phone || modal.data?.customer_phone ? (
                        <a
                          href={`https://wa.me/${String(modal.data?.user?.phone || modal.data?.user_phone || modal.data?.customer_phone).replace(/\D/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition-colors"
                        >
                          <MessageSquare size={13} />
                          <span>Hubungi Pengirim</span>
                        </a>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                      {modal.data?.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              rejectChatLog(modal.data);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <X size={14} strokeWidth={2.5} />
                            <span>Tolak Pembayaran</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              closeModal();
                              approveChatLog(modal.data?.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={14} strokeWidth={2.5} />
                            <span>Setujui Akses Chat</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : modal.type === "rejectItem" ? (
                <form onSubmit={handleConfirmRejectItem} className="space-y-4 text-left">
                  {/* Target Item Card */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                        {modal.data?.type === "business"
                          ? "Bisnis / UMKM"
                          : modal.data?.type === "payment"
                            ? "Pembayaran Premium"
                            : (modal.data?.type === "advertisement" || modal.data?.type === "ad")
                              ? "Pengajuan Iklan"
                              : (modal.data?.type === "whatsapp" || modal.data?.type === "whatsapp_log")
                                ? "Akses WhatsApp"
                                : (modal.data?.item?.type === "event" ? "Event / Acara" : "Blog / Artikel")}
                      </span>
                      <span className="font-bold text-slate-900 truncate">
                        {modal.data?.item?.business?.name || modal.data?.item?.business_name || modal.data?.item?.title || modal.data?.item?.package_name || modal.data?.item?.name || `ID #${modal.data?.item?.id}`}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Pemohon: <strong>{modal.data?.item?.user?.name || modal.data?.item?.customer_name || modal.data?.item?.author || modal.data?.item?.owner || "User"}</strong>
                    </p>
                  </div>

                  {/* Pemilihan Alasan Otomatis */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {modal.data?.isRevision || rejectMode === "revision" ? "Pilih Alasan Perbaikan Cepat:" : "Pilih Alasan Penolakan Cepat:"}
                    </label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {(modal.data?.type === "payment"
                        ? [
                          "Bukti transfer / pembayaran tidak valid atau tidak terbaca.",
                          "Nominal transfer yang dikirim tidak sesuai dengan total tagihan paket.",
                          "Foto bukti pembayaran buram, terpotong, atau diragukan keasliannya.",
                          "Informasi nomor rekening pengirim / mutasi rekening tidak ditemukan.",
                          "Data profil usaha belum lengkap atau belum memenuhi syarat paket Premium.",
                          "Lainnya (Ketik alasan secara manual)",
                        ]
                        : modal.data?.type === "business"
                          ? [
                            "Data profil usaha / UMKM kurang lengkap (alamat, kontak, atau deskripsi).",
                            "Foto logo / banner usaha buram, tidak pantas, atau melanggar hak cipta.",
                            "Kategori bisnis yang dipilih tidak sesuai dengan jenis usaha.",
                            "Lokasi bisnis tidak valid atau fiktif.",
                            "Lainnya (Ketik alasan secara manual)",
                          ]
                          : (modal.data?.type === "advertisement" || modal.data?.type === "ad")
                            ? [
                              "Bukti transfer / pembayaran iklan tidak valid atau tidak terbaca.",
                              "Nominal transfer yang dikirim tidak sesuai dengan total biaya paket iklan.",
                              "Foto banner / logo usaha buram, terpotong, atau tidak memenuhi standar resolusi iklan.",
                              "Materi atau nama bisnis mengandung konten yang dilarang / tidak sesuai ketentuan.",
                              "Informasi nomor rekening pengirim / mutasi transaksi tidak ditemukan.",
                              "Lainnya (Ketik alasan secara manual)",
                            ]
                            : (modal.data?.type === "whatsapp" || modal.data?.type === "whatsapp_log")
                              ? [
                                "Bukti transfer / struk pembayaran tidak jelas, terpotong, atau tidak terbaca.",
                                "Nominal transfer yang dikirim tidak sesuai dengan biaya tarif akses WhatsApp.",
                                "Foto bukti pembayaran buram atau diragukan keasliannya.",
                                "Rekening atau QRIS tujuan transfer tidak sesuai dengan rekening resmi Surade.",
                                "Mutasi atau catatan transfer dari rekening pengirim tidak ditemukan.",
                                "Lainnya (Ketik alasan secara manual)",
                              ]
                              : [
                                "Blog / Konten kurang memenuhi syarat atau kurang lengkap.",
                                "Foto yang digunakan terlalu vulgar atau tidak pantas.",
                                "Foto / Cover melanggar hak cipta atau gambar buram.",
                                "Bukti transfer / pembayaran tidak valid atau tidak terbaca.",
                                "Kategori konten yang dipilih tidak sesuai dengan topik isi.",
                                "Informasi tanggal atau lokasi acara tidak valid/fiktif.",
                                "Lainnya (Ketik alasan secara manual)",
                              ]
                      ).map((preset, idx) => {
                        const isOther = preset.startsWith("Lainnya");
                        const isSelected = isOther ? (![
                          "Bukti transfer / pembayaran tidak valid atau tidak terbaca.",
                          "Nominal transfer yang dikirim tidak sesuai dengan total tagihan paket.",
                          "Foto bukti pembayaran buram, terpotong, atau diragukan keasliannya.",
                          "Informasi nomor rekening pengirim / mutasi rekening tidak ditemukan.",
                          "Data profil usaha belum lengkap atau belum memenuhi syarat paket Premium.",
                          "Data profil usaha / UMKM kurang lengkap (alamat, kontak, atau deskripsi).",
                          "Foto logo / banner usaha buram, tidak pantas, atau melanggar hak cipta.",
                          "Kategori bisnis yang dipilih tidak sesuai dengan jenis usaha.",
                          "Lokasi bisnis tidak valid atau fiktif.",
                          "Bukti transfer / pembayaran iklan tidak valid atau tidak terbaca.",
                          "Nominal transfer yang dikirim tidak sesuai dengan total biaya paket iklan.",
                          "Foto banner / logo usaha buram, terpotong, atau tidak memenuhi standar resolusi iklan.",
                          "Materi atau nama bisnis mengandung konten yang dilarang / tidak sesuai ketentuan.",
                          "Informasi nomor rekening pengirim / mutasi transaksi tidak ditemukan.",
                          "Bukti transfer / struk pembayaran tidak jelas, terpotong, atau tidak terbaca.",
                          "Nominal transfer yang dikirim tidak sesuai dengan biaya tarif akses WhatsApp.",
                          "Rekening atau QRIS tujuan transfer tidak sesuai dengan rekening resmi Surade.",
                          "Mutasi atau catatan transfer dari rekening pengirim tidak ditemukan.",
                          "Blog / Konten kurang memenuhi syarat atau kurang lengkap.",
                          "Foto yang digunakan terlalu vulgar atau tidak pantas.",
                          "Foto / Cover melanggar hak cipta atau gambar buram.",
                          "Kategori konten yang dipilih tidak sesuai dengan topik isi.",
                          "Informasi tanggal atau lokasi acara tidak valid/fiktif.",
                        ].includes(rejectReason) && rejectReason.length > 0) : rejectReason.startsWith(preset.replace(/\.$/, ""));

                        return (
                          <label
                            key={idx}
                            onClick={() => {
                              if (isOther) {
                                setRejectReason("");
                              } else {
                                setRejectReason(preset);
                              }
                            }}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${isSelected
                                ? "bg-rose-50/70 border-rose-300 text-rose-900 font-semibold"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                          >
                            <input
                              type="radio"
                              name="reject_reason_option"
                              checked={isSelected}
                              onChange={() => { }}
                              className="mt-0.5 text-rose-600 focus:ring-rose-500 shrink-0"
                            />
                            <span className="leading-snug">{preset}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pengisian Alasan Manual / Kustomisasi */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Catatan Alasan Penolakan (Bisa diedit manual) *</span>
                      <span className="text-[10.5px] text-slate-400 font-normal">Wajib diisi</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Pilih opsi otomatis di atas atau ketik manual alasan spesifik penolakan..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
                    />
                  </div>

                  <div className={`p-3 rounded-xl border text-[11.5px] flex items-start gap-2 ${rejectMode === "revision" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}>
                    <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${rejectMode === "revision" ? "text-amber-600" : "text-rose-600"}`} />
                    <p className="leading-relaxed">
                      {rejectMode === "revision" ? (
                        <>Status akan berubah menjadi <strong>Perlu Perbaikan (Revisi)</strong> pada dashboard user beserta catatan ini. User dapat memperbaiki data / bukti transfer <strong>tanpa harus bayar lagi</strong>.</>
                      ) : (
                        <>Status akan berubah menjadi <strong>Ditolak Permanen</strong>. User tidak dapat mengedit atau mengajukan ulang usaha ini lagi.</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={rejectSubmitting || !rejectReason.trim()}
                      className={`px-5 py-2 rounded-xl disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 ${rejectMode === "revision" ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700"
                        }`}
                    >
                      {rejectSubmitting ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          {rejectMode === "revision" ? <AlertTriangle size={14} /> : <X size={14} strokeWidth={2.5} />}
                          <span>{rejectMode === "revision" ? "Kirim Permintaan Perbaikan" : "Kirim Penolakan Permanen"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : modal.type === "viewContentProof" ? (
                <div className="space-y-4 text-center">
                  <img
                    src={modal.data?.url}
                    alt="Bukti Transfer"
                    className="max-h-[65vh] w-auto mx-auto rounded-xl shadow-md border border-slate-200 object-contain"
                  />
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="font-mono font-bold text-slate-700">
                      {modal.data?.tx?.transaction_code} - Rp {Number(modal.data?.tx?.amount || 0).toLocaleString("id-ID")}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                      >
                        Tutup
                      </button>
                      {modal.data?.tx?.payment_status === "pending" && (
                        <button
                          type="button"
                          onClick={() => {
                            closeModal();
                            handleApproveContentTx(modal.data.tx);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Setujui Transaksi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : modal.type === "editContentPricing" ? (
                <form onSubmit={handleSavePricing} className="flex flex-col gap-[14px]">
                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                        Nama Paket Publikasi *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Publikasi Info Bulanan (30 Hari)"
                        value={pricingEditForm.name || ""}
                        onChange={(e) => setPricingEditForm({ ...pricingEditForm, name: e.target.value })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                        Kategori Publikasi *
                      </label>
                      <select
                        value={editingPricingType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setEditingPricingType(newType);
                          const targetData = contentPricing[newType] || {};
                          setPricingEditForm({
                            name: targetData.name || (newType === "event" ? "Publikasi Event (Agenda Acara)" : "Publikasi Info (Artikel & Berita)"),
                            description: targetData.description || "",
                            price: Number(targetData.price || (newType === "event" ? 15000 : 10000)),
                            duration_value: Number(targetData.duration_value || 1),
                            duration_unit: targetData.duration_unit || "month",
                            is_active: Boolean(targetData.is_active ?? true),
                          });
                        }}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      >
                        <option value="blog">Info (Artikel Promosi &amp; Berita Usaha)</option>
                        <option value="event">Event (Agenda Acara &amp; Festival)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[10px]">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                        Harga (Rp) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={pricingEditForm.price}
                        onChange={(e) => setPricingEditForm({ ...pricingEditForm, price: Number(e.target.value) })}
                        className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                        Durasi Paket *
                      </label>
                      <div className="flex items-center gap-[6px]">
                        <input
                          type="number"
                          required
                          min="1"
                          value={pricingEditForm.duration_value || 1}
                          onChange={(e) => setPricingEditForm({ ...pricingEditForm, duration_value: Math.max(1, Number(e.target.value)) })}
                          className="w-[70px] px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                        />
                        <select
                          value={pricingEditForm.duration_unit || "month"}
                          onChange={(e) => setPricingEditForm({ ...pricingEditForm, duration_unit: e.target.value })}
                          className="flex-1 px-[10px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                        >
                          <option value="month">Bulan</option>
                          <option value="day">Hari</option>
                          <option value="week">Minggu</option>
                          <option value="year">Tahun</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tuliskan deskripsi ringkas ketentuan paket publikasi ini..."
                      value={pricingEditForm.description || ""}
                      onChange={(e) => setPricingEditForm({ ...pricingEditForm, description: e.target.value })}
                      className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white"
                    />
                  </div>

                  {/* Status Active Checkbox */}
                  <div className="flex items-center gap-[8px] p-[10px_12px] bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0]">
                    <input
                      type="checkbox"
                      id="content_pricing_is_active_toggle"
                      checked={Boolean(pricingEditForm.is_active)}
                      onChange={(e) => setPricingEditForm({ ...pricingEditForm, is_active: e.target.checked })}
                      className="w-[16px] h-[16px] text-[#007570] rounded cursor-pointer"
                    />
                    <label htmlFor="content_pricing_is_active_toggle" className="text-[13px] text-[#0f172a] font-medium cursor-pointer">
                      Aktifkan Tarif Publikasi Ini (Jika dinonaktifkan, user dapat posting gratis)
                    </label>
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={savingPricing}
                      className="px-5 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {savingPricing ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={2.5} />
                          <span>Simpan Tarif</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
              <div className="mb-[14px]">
                <label className="flex items-center gap-[6px] text-[12px] font-semibold text-[#64748b] mb-[6px] uppercase tracking-[0.4px]">Nama</label>
                <input type="text" className="w-full px-[12px] py-[9px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] text-[#0f172a] font-medium transition-all duration-200 bg-[#f8fafc] focus:outline-none focus:border-[#007570] focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)]" defaultValue={modal.data?.name || ""} />
              </div>
            )}
          </div>
          {!isReferralModal && modal.type !== "editContentPricing" && modal.type !== "rejectContentTx" && modal.type !== "viewContentTxDetail" && modal.type !== "viewContentProof" && modal.type !== "viewBlogDetail" && modal.type !== "viewPaymentDetail" && modal.type !== "viewBusinessDetail" && modal.type !== "viewAdDetail" && modal.type !== "rejectItem" && (
            <div className="flex justify-end gap-[10px] px-[20px] py-[16px] border-t border-[#e2e8f0]">
              {modal.type === "viewUserDetail" ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-[7px] px-[18px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58]"
                  onClick={closeModal}
                >
                  Tutup
                </button>
              ) : (
                <>
                  <button className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border bg-[#f1f5f9] text-[#0f172a] border-[#e2e8f0] hover:bg-[#e2e8f0] hover:-translate-y-[1px]" onClick={closeModal}>
                    Batal
                  </button>
                  <button
                    className="inline-flex items-center gap-[7px] px-[16px] py-[8px] rounded-[8px] font-['Poppins','Inter',sans-serif] text-[13px] font-semibold cursor-pointer transition-all duration-220 border-0 bg-[#007570] text-white shadow-[0_2px_8px_rgba(0,117,112,0.2)] hover:bg-[#005a58] hover:-translate-y-[1px] hover:shadow-[0_4px_14px_rgba(0,117,112,0.25)]"
                    onClick={() => {
                      if (modal.type === "addBusiness") {
                        handleSaveAdminBusiness();
                      } else if (modal.type === "addUser" || modal.type === "editUser") {
                        handleSaveUser();
                      } else if (modal.type === "deleteUser" && modal.data?.id) {
                        handleDeleteUser(modal.data.id);
                      } else if (modal.type === "addCategory" || modal.type === "editCategory") {
                        handleSaveCategory();
                      } else if (modal.type === "deleteCategory" && modal.data?.id) {
                        handleDeleteCategory(modal.data.id);
                      } else if (modal.type === "addNavbarCategory" || modal.type === "editNavbarCategory") {
                        handleSaveNavbarCategory();
                      } else if (modal.type === "deleteNavbarCategory" && modal.data?.id) {
                        handleDeleteNavbarCategory(modal.data.id);
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
                      } else if (modal.type === "addContentPackage" || modal.type === "editContentPackage") {
                        handleSaveContentPackage();
                      } else if (modal.type === "deleteContentPackage" && modal.data?.id) {
                        handleDeleteContentPackage(modal.data.id);
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Dynamic navigation sections with reactive notification badges ──
  const navSections = useMemo(() => {
    // Helper notifikasi belum dibaca per kategori
    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    const unreadNotifFor = (keywords = []) => {
      return safeNotifs.filter((n) => {
        if (n.is_read) return false;
        const typeStr = String(n.type || "").toLowerCase();
        const sourceStr = String(n.source_type || "").toLowerCase();
        const titleStr = String(n.title || "").toLowerCase();
        const msgStr = String(n.message || "").toLowerCase();
        return keywords.some(
          (kw) =>
            typeStr.includes(kw) ||
            sourceStr.includes(kw) ||
            titleStr.includes(kw) ||
            msgStr.includes(kw)
        );
      }).length;
    };

    // 1. Pending Poin: Top Up pending + Tarik Gold pending + Notifikasi belum dibaca
    const pendingCoins = (Number(coinStats?.pending_purchases_count) || 0) + (Number(coinStats?.pending_withdrawals_count) || 0);
    const coinsBadge = Math.max(pendingCoins, unreadNotifFor(["coin", "poin", "gold"]));

    // 2. Pending Kelola Usaha: Bisnis pending verifikasi / revisi / langganan pending
    const safeBiz = Array.isArray(businesses) ? businesses : [];
    const pendingBusinesses = stats?.pendingBusinesses !== undefined && stats?.pendingBusinesses !== null
      ? Number(stats.pendingBusinesses)
      : safeBiz.filter((b) => {
        const s = b?.status;
        return s === "pending" || s === "waiting_verification" || s === "menunggu" || s === "needs_revision" || Boolean(b?.has_pending_subscription);
      }).length;
    const businessesBadge = Math.max(pendingBusinesses, unreadNotifFor(["business", "bisnis", "usaha"]));

    // 3. Pending Verifikasi Produk: Produk berstatus pending
    const pendingProducts = Number(productCounts?.pending || 0);
    const productsBadge = Math.max(pendingProducts, unreadNotifFor(["product", "produk"]));

    // 4. Pending Iklan: Iklan pending / belum dibayar
    const safeAds = Array.isArray(advertisements) ? advertisements : [];
    const pendingAds = safeAds.filter((a) => a?.status === "pending" || a?.payment_status === "pending").length;
    const adsBadge = Math.max(pendingAds, unreadNotifFor(["ad", "iklan", "advertisement"]));

    // 5. Pending Referral: Penarikan komisi menunggu persetujuan / transaksi baru
    const safeRefWd = Array.isArray(referralWithdrawals) ? referralWithdrawals : [];
    const pendingReferrals = safeRefWd.filter((w) => w?.status === "pending").length || (Number(referralStats?.pending_transactions) || 0);
    const referralsBadge = Math.max(pendingReferrals, unreadNotifFor(["referral", "commission", "komisi"]));

    // 6. Pending Info & Event / Blogs: Transaksi konten berstatus pending
    const pendingBlogs = Number(stats?.pendingContentPayments || 0);
    const blogsBadge = Math.max(pendingBlogs, unreadNotifFor(["blog", "event", "berita", "content"]));

    // 7. Pending Laporan Report: Laporan baru
    const pendingReports = Number(reportStats?.baru || 0);
    const reportsBadge = Math.max(pendingReports, unreadNotifFor(["report", "laporan"]));

    // 8. Pending Klaim Usaha
    const claimsBadge = Math.max(Number(pendingClaimsCount) || 0, unreadNotifFor(["claim", "klaim"]));

    // 9. Pending Paket Premium / Subscriptions
    const safeSubs = Array.isArray(subscriptions) ? subscriptions : [];
    const pendingSubs = safeSubs.filter((s) => s?.status === "pending" || s?.payment_status === "pending").length;
    const premiumBadge = Math.max(pendingSubs, unreadNotifFor(["premium", "subscription", "langganan"]));

    // 10. WhatsApp & Chat
    const whatsappBadge = unreadNotifFor(["whatsapp", "wa"]);
    const chatBadge = unreadNotifFor(["chat", "qris"]);

    const badgeMap = {
      coins: coinsBadge,
      businesses: businessesBadge,
      products: productsBadge,
      ads: adsBadge,
      referrals: referralsBadge,
      blogs: blogsBadge,
      reports: reportsBadge,
      claims: claimsBadge,
      premium: premiumBadge,
      whatsapp: whatsappBadge,
      chat: chatBadge,
    };

    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        badge: badgeMap[item.id] || 0,
      })),
    }));
  }, [
    coinStats,
    businesses,
    stats,
    productCounts,
    advertisements,
    referralWithdrawals,
    referralStats,
    reportStats,
    subscriptions,
    notifications,
    pendingClaimsCount,
  ]);

  const totalSidebarBadges = useMemo(() => {
    return navSections.reduce(
      (acc, s) => acc + s.items.reduce((sAcc, i) => sAcc + (Number(i.badge) || 0), 0),
      0
    );
  }, [navSections]);

  if (loading) {
    return (
      <SuradeLoader
        variant="screen"
        brandTitle="Admin Surade.com"
        text="Memuat panel administrasi..."
        subtext="Menyiapkan data direktori, statistik, dan konfigurasi sistem"
        showBrand
        showProgress
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-['Poppins','Inter','Segoe_UI',sans-serif] text-[#0f172a] relative">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[290] md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Collapsible 3D Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen ${sidebarCollapsed ? "w-[72px]" : "w-[248px]"} bg-gradient-to-b from-[#0b6b45] via-[#095838] to-[#07422a] flex flex-col z-[300] transition-all duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-white/10 shadow-[8px_0_30px_rgba(0,0,0,0.25)] max-md:w-[268px] ${mobileSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}>
        {/* Header / Brand with Glass Glow */}
        <div className="flex items-center justify-between p-[16px_14px_14px] border-b border-white/10 shrink-0 min-h-[62px] bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-[10px] overflow-hidden flex-1 min-w-0">
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <img src={logoImg} alt="Surade.com" className="h-[28px] w-auto shrink-0 drop-shadow-md" />
            )}
            <div className={`flex flex-col gap-[3px] min-w-0 transition-all duration-[280ms] ${sidebarCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 overflow-hidden" : ""}`}>
              <span className="text-[15px] font-black text-white whitespace-nowrap leading-none tracking-tight drop-shadow-xs">Surade.com</span>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-[#6ee7b7] text-[0.62rem] px-[8px] py-[2px] rounded-full font-black uppercase tracking-wider whitespace-nowrap w-fit shadow-[0_0_10px_rgba(16,185,129,0.25)]">Admin Web</span>
            </div>
          </div>
          {/* Toggle button */}
          <button
            type="button"
            className="shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-xl text-emerald-300 cursor-pointer transition-all duration-200 bg-white/5 border border-white/10 hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95 shadow-xs"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileSidebarOpen(false);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            title={sidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* 3D Frosted Search Box */}
        <div className={`flex items-center gap-[8px] my-[10px] mx-[10px] py-[8px] bg-white/8 border border-white/12 rounded-xl transition-all duration-200 shrink-0 overflow-hidden focus-within:bg-white/15 focus-within:border-emerald-400/50 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.2)] ${sidebarCollapsed && !mobileSidebarOpen ? "px-[8px] justify-center" : "px-[12px]"}`}>
          <Search className="text-white/50 shrink-0" size={17} />
          <input
            type="text"
            className={`flex-1 border-none outline-none bg-transparent text-white font-['Poppins',sans-serif] text-[12.5px] min-w-0 placeholder:text-white/40 transition-all duration-200 ${sidebarCollapsed && !mobileSidebarOpen ? "w-0 opacity-0 pointer-events-none" : ""}`}
            placeholder={sidebarCollapsed && !mobileSidebarOpen ? "" : "Cari menu admin..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 3D Navigation */}
        <nav className="list-none flex-1 overflow-y-auto overflow-x-hidden px-[8px] py-[4px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-[4px] select-none">
          {navSections.map((section, sIdx) => {
            const filteredItems = section.items.filter(
              (item) => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.category || sIdx} className="flex flex-col gap-[3px] mb-1">
                {/* Category Header */}
                <div className={`px-[10px] pt-[8px] pb-[3px] text-[10px] font-black uppercase tracking-[1.3px] text-emerald-300/60 select-none transition-all duration-200 overflow-hidden whitespace-nowrap flex items-center gap-1.5 ${sidebarCollapsed && !mobileSidebarOpen ? "opacity-0 h-0 p-0 pointer-events-none" : ""}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 inline-block shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span>{section.category}</span>
                </div>

                {filteredItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const hasBadge = Number(item.badge || 0) > 0;
                  return (
                    <button
                      key={item.id}
                      className={`group relative flex items-center gap-[12px] px-[12px] py-[9.5px] rounded-xl border-0 text-[13px] tracking-tight whitespace-nowrap w-full text-left font-['Poppins','Inter',sans-serif] cursor-pointer select-none transition-all duration-200 ${isActive
                          ? "bg-white text-[#064e3b] font-black shadow-[0_6px_18px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.9)] scale-[1.02] translate-x-1"
                          : "bg-transparent text-white/85 hover:bg-white/12 hover:text-white hover:translate-x-1.5 hover:shadow-xs border border-transparent hover:border-white/10"
                        }`}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 768) setMobileSidebarOpen(false);
                      }}
                      title={sidebarCollapsed ? `${item.label}${hasBadge ? ` (${item.badge} pending)` : ""}` : undefined}
                    >
                      <span className={`shrink-0 select-none transition-transform duration-200 ${isActive ? "text-[#059669] scale-110 drop-shadow-xs" : "group-hover:scale-110"}`}>{item.icon}</span>
                      <span className={`select-none transition-all duration-200 overflow-hidden whitespace-nowrap ${isActive ? "font-black text-[#064e3b]" : "font-medium"} ${sidebarCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>{item.label}</span>
                      {hasBadge && (!sidebarCollapsed || mobileSidebarOpen) && (
                        <span className={`ml-auto px-2 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-white text-[11px] font-black shadow-[0_2px_8px_rgba(244,63,94,0.45)] ring-2 ${isActive ? "ring-rose-200 bg-rose-500" : "ring-emerald-950/40 bg-rose-500"} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      {hasBadge && sidebarCollapsed && !mobileSidebarOpen && (
                        <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 ${isActive ? "border-white" : "border-[#095838]"} shadow-xs animate-pulse`} />
                      )}
                      <span className={`absolute left-[78px] top-1/2 -translate-y-1/2 bg-[#07422a] text-white text-[12px] font-bold px-[12px] py-[6px] rounded-xl whitespace-nowrap pointer-events-none opacity-0 select-none border border-emerald-500/30 shadow-xl ${sidebarCollapsed && !mobileSidebarOpen ? "group-hover:opacity-100 group-hover:translate-x-1" : ""} transition-all duration-150 z-[300] before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#07422a]`}>
                        {item.label}{hasBadge ? ` (${item.badge})` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* 3D Floating "Kembali ke Website" Button */}
        <div className="p-[4px_8px_4px] shrink-0 select-none">
          <Link
            to="/"
            className="flex items-center gap-[10px] px-[12px] py-[9.5px] rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-400/30 text-white text-[12.5px] font-bold font-['Poppins',sans-serif] overflow-hidden whitespace-nowrap select-none transition-all duration-200 hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] group"
            title="Kembali ke Website"
          >
            <Home size={18} className="shrink-0 select-none text-emerald-300 group-hover:scale-110 group-hover:text-white transition-all" />
            <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap select-none ${sidebarCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>
              Kembali ke Website
            </span>
          </Link>
        </div>

        {/* 3D Profile Glass Footer Section */}
        <div className="flex items-center justify-between p-[12px_10px] border-t border-white/10 gap-[8px] shrink-0 overflow-hidden bg-black/15 backdrop-blur-sm">
          <div className="flex items-center gap-[10px] flex-1 min-w-0 rounded-xl p-[5px_6px] transition-all duration-200 hover:bg-white/10 cursor-pointer group">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || "Admin"}
                className="w-[36px] h-[36px] rounded-full object-cover shrink-0 border-2 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#042419]" />
            </div>
            <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${sidebarCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>
              <span className="text-[12.5px] font-black text-white whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-emerald-300 transition-colors">{user?.name || "Admin"}</span>
              <span className="text-[10.5px] text-white/50 whitespace-nowrap font-medium">Administrator</span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-xl text-white/40 cursor-pointer transition-all duration-200 bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/40 hover:scale-105 active:scale-95 shadow-xs"
            onClick={handleLogout}
            title="Keluar Panel Admin"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className={`flex-1 min-h-screen min-w-0 max-w-full flex flex-col transition-all duration-[280ms] overflow-x-hidden ${sidebarCollapsed ? "md:ml-[68px]" : "md:ml-[240px]"} ml-0 pb-8`}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-[100] flex items-center justify-between px-[16px] sm:px-[20px] h-[60px] bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] gap-[8px] shrink-0">
          {/* Left Side: Hamburger Button (Gambar 3) + Mobile Greeting Pill / Desktop Page Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Hamburger Button for Mobile Drawer */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              className="relative md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-emerald-800 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs border border-slate-200/80"
              aria-label="Buka menu navigasi"
              title="Menu Navigasi"
            >
              <Menu size={19} strokeWidth={2} />
              {totalSidebarBadges > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {totalSidebarBadges > 99 ? "99+" : totalSidebarBadges}
                </span>
              )}
            </button>

            {/* Mobile-only Greeting Pill */}
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-slate-200/80 text-[12px] text-slate-700 font-medium transition-all active:scale-95 cursor-pointer max-w-[150px] shrink-0"
              title={`Halo, ${user?.name || "Admin"}`}
            >
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || "Admin"}
                className="w-[22px] h-[22px] rounded-full object-cover shrink-0 border border-emerald-600/30"
              />
              <span className="truncate">
                Halo, <strong className="font-bold text-slate-900">{user?.name || "Admin"}</strong>
              </span>
            </button>

            {/* Desktop Page Title */}
            <div className="hidden md:flex items-center gap-2.5">
              <h1 className="text-[16px] font-bold text-[#0f172a] whitespace-nowrap overflow-hidden text-ellipsis">
                {NAV_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard"}
              </h1>
              {(() => {
                const currentNavItem = navSections.flatMap((s) => s.items).find((i) => i.id === activeTab);
                if (currentNavItem && Number(currentNavItem.badge || 0) > 0) {
                  return (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200">
                      {currentNavItem.badge} Menunggu
                    </span>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          <div className="flex items-center gap-[8px] sm:gap-[12px] shrink-0">
            <button
              className="relative w-[34px] h-[34px] sm:w-[36px] sm:h-[36px] flex items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] cursor-pointer border-0 transition-[background,color] duration-[280ms] hover:bg-[rgba(0,117,112,0.12)] hover:text-[#007570]"
              onClick={() => setActiveTab("notifications")}
              title="Notifikasi"
            >
              <Bell size={18} strokeWidth={1.7} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-[2px] -right-[2px] bg-[#ef4444] text-white text-[0.62rem] font-bold min-w-[17px] h-[17px] rounded-full flex items-center justify-center border-2 border-white px-[2px]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <div className="hidden md:flex items-center gap-[8px] px-[10px] py-[4px] bg-[#f8fafc] border border-[#e2e8f0] rounded-full transition-all duration-250">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || "Admin"}
                className="w-[26px] h-[26px] rounded-full object-cover border border-[rgba(0,117,112,0.25)] shrink-0"
              />
              <span className="font-semibold text-[13px] text-[#0f172a] truncate max-w-[130px]">Halo, <strong className="font-bold">{user?.name || "Admin"}</strong></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-[24px_28px] max-md:p-[14px] flex-1">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "coins" && <AdminCoinTab />}
          {activeTab === "users" && renderUsers()}
          {activeTab === "businesses" && renderBusinesses()}
          {activeTab === "claims" && renderClaims()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "navbar-info" && renderNavbarCategories()}
          {activeTab === "important-numbers" && <AdminNomorPentingTab />}
          {activeTab === "ads" && renderAds()}
          {activeTab === "premium" && renderPremium()}
          {activeTab === "coupons" && renderCoupons()}
          {activeTab === "referrals" && renderReferrals()}
          {activeTab === "blogs" && renderBlogs()}
          {(activeTab === "content_pricing" || activeTab === "content_packages") && renderBlogs()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "notifications" && renderNotifications()}
          {activeTab === "payment-settings" && renderPaymentSettings()}
          {activeTab === "whatsapp" && renderWhatsApp()}
          {activeTab === "chat" && renderChatManagement()}
        </div>
      </main>

      {/* Modal */}
      {typeof renderModal === "function" && renderModal()}

      {/* ── MODAL DETAIL PRODUK ── */}
      {viewProductModal.open && viewProductModal.product && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-['Poppins',sans-serif]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#007570] text-white">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">
                    {viewProductModal.product.name}
                  </h3>
                  <span className="text-xs text-slate-300">Detail Produk Etalase & Info Penjual</span>
                </div>
              </div>
              <button
                onClick={() => setViewProductModal({ open: false, product: null })}
                className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-left text-slate-800">
              {/* Product Image & Key Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="md:col-span-1">
                  {viewProductModal.product.image || viewProductModal.product.image_url ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 shadow-inner">
                      {/* Blurred backdrop to fill widescreen space smoothly */}
                      <img
                        src={getStorageUrl(viewProductModal.product.image_url || viewProductModal.product.image)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                      />
                      {/* Foreground crisp un-stretched image */}
                      <img
                        src={getStorageUrl(viewProductModal.product.image_url || viewProductModal.product.image)}
                        alt={viewProductModal.product.name}
                        className="relative z-10 max-h-full max-w-full object-contain p-1.5 transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/300x300?text=Foto+Produk";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <Package size={40} />
                      <span className="text-xs font-semibold mt-1">Tanpa Foto</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        ID: #{viewProductModal.product.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${viewProductModal.product.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : viewProductModal.product.status === "needs_revision"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : viewProductModal.product.status === "pending"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                      >
                        {viewProductModal.product.status === "approved"
                          ? "✓ Disetujui / Verified"
                          : viewProductModal.product.status === "needs_revision"
                            ? "⚠️ Perlu Perbaikan (Revisi)"
                            : viewProductModal.product.status === "pending"
                              ? "⏳ Menunggu Verifikasi"
                              : "✗ Ditolak"}
                      </span>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${viewProductModal.product.is_active !== false && viewProductModal.product.is_active !== 0
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                      >
                        {viewProductModal.product.is_active !== false && viewProductModal.product.is_active !== 0
                          ? "Aktif di Web"
                          : "Nonaktif"}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {viewProductModal.product.name}
                    </h4>
                    <div className="text-xl font-extrabold text-[#007570] mt-1">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(viewProductModal.product.price || 0)}
                    </div>
                  </div>

                  {viewProductModal.product.rejection_reason && (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed ${viewProductModal.product.status === "needs_revision"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}>
                      <div className="font-bold flex items-center gap-1.5 mb-0.5">
                        <AlertTriangle size={13} />
                        <span>{viewProductModal.product.status === "needs_revision" ? "Catatan Perbaikan dari Admin:" : "Alasan Penolakan:"}</span>
                      </div>
                      <p className="italic">{viewProductModal.product.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business & Owner Info */}
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-3">
                <div className="text-xs font-bold text-[#007570] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={14} />
                  <span>Informasi Toko / Pemilik Usaha</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nama Tempat Usaha</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {viewProductModal.product.business?.name || "–"}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      📍 {viewProductModal.product.business?.city || "Kab. Sukabumi"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Nama Pemilik / Reseller</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {viewProductModal.product.business?.user?.name || "–"}
                    </span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      📧 {viewProductModal.product.business?.user?.email || "–"}
                    </span>
                  </div>
                </div>

                {/* Contact WA Button */}
                {(viewProductModal.product.business?.user?.phone || viewProductModal.product.business?.phone) && (
                  <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-600 font-medium">
                      No. WhatsApp: <strong>{viewProductModal.product.business?.user?.phone || viewProductModal.product.business?.phone}</strong>
                    </span>
                    <a
                      href={`https://wa.me/${(viewProductModal.product.business?.user?.phone || viewProductModal.product.business?.phone || "").replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(`Halo, mengenai produk "${viewProductModal.product.name}"...`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      <MessageSquare size={13} />
                      <span>Hubungi via WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Deskripsi Produk Lengkap
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed min-h-[80px] whitespace-pre-line">
                  {viewProductModal.product.description || "Tidak ada deskripsi detail untuk produk ini."}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setViewProductModal({ open: false, product: null })}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {viewProductModal.product.status !== "approved" && viewProductModal.product.status !== "rejected" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const p = viewProductModal.product;
                        setViewProductModal({ open: false, product: null });
                        setRejectProductModal({ open: true, product: p, reason: "", mode: "revision" });
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <AlertTriangle size={14} strokeWidth={2.5} />
                      <span>Minta Perbaikan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = viewProductModal.product;
                        setViewProductModal({ open: false, product: null });
                        handleDirectRejectProduct(p);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <X size={14} strokeWidth={2.5} />
                      <span>Tolak Produk</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const p = viewProductModal.product;
                        setViewProductModal({ open: false, product: null });
                        handleApproveProduct(p);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Check size={14} strokeWidth={2.5} />
                      <span>Setujui Produk</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI SETUJUI KLAIM ── */}
      {claimApproveModal.open && claimApproveModal.claim && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Poppins',sans-serif]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Setujui Klaim & Alihkan Kepemilikan?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kepemilikan usaha <strong className="text-slate-800">{claimApproveModal.claim.business?.name}</strong> akan dialihkan dari pemilik saat ini ke <strong className="text-slate-800">{claimApproveModal.claim.user?.name}</strong>.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
              ⚠️ Pengalihan ini akan otomatis memberikan hak kelola penuh usaha kepada pengaju. Tindakan ini dicatat dalam riwayat kepemilikan.
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClaimApproveModal({ open: false, claim: null })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproveClaim}
                className="flex-1 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white text-xs font-bold cursor-pointer border-0"
              >
                Ya, Setujui & Alihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TOLAK KLAIM ── */}
      {claimRejectModal.open && claimRejectModal.claim && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Poppins',sans-serif]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Tolak Pengajuan Klaim</h3>
              <p className="text-xs text-slate-500">
                Pengaju klaim untuk usaha <strong className="text-slate-800">{claimRejectModal.claim.business?.name}</strong> akan menerima pemberitahuan alasan penolakan ini.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={claimRejectModal.reason}
                onChange={(e) => setClaimRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Contoh: Bukti pendukung tidak valid atau nama di identitas tidak sesuai..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClaimRejectModal({ open: false, claim: null, reason: "" })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectClaim}
                disabled={!claimRejectModal.reason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 border-0"
              >
                Tolak Klaim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LIHAT BUKTI PENDUKUNG ── */}
      {claimProofModal.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-['Poppins',sans-serif]" onClick={() => setClaimProofModal({ open: false, url: "", title: "" })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm font-bold truncate">{claimProofModal.title || "Bukti Pendukung"}</span>
              <button
                type="button"
                onClick={() => setClaimProofModal({ open: false, url: "", title: "" })}
                className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[300px]">
              {claimProofModal.url && claimProofModal.url.toLowerCase().endsWith(".pdf") ? (
                <iframe src={claimProofModal.url} title="Bukti Dokumen" className="w-full h-[500px] border-0 rounded-lg" />
              ) : (
                <img src={claimProofModal.url} alt="Bukti Lampiran" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
              )}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <a
                href={claimProofModal.url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] text-white text-xs font-bold hover:bg-[#005a58] no-underline"
              >
                <Download size={14} />
                <span>Buka / Unduh File Asli</span>
              </a>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}



