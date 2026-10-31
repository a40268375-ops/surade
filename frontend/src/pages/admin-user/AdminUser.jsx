import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useGlobalReferral } from "../../context/ReferralContext";
import PackageSelectionModal from "../../components/PackageSelectionModal";
import PackageCheckoutModal from "../../components/PackageCheckoutModal";
import ContentPaymentModal from "../../components/ContentPaymentModal";
import PromoAdsSlider from "../../components/PromoAdsSlider";
import PortalAnalyticsCharts from "../../components/PortalAnalyticsCharts";
import SafeImage from "../../components/SafeImage";
import ImageCropper from "../../components/ImageCropper";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
import MobileBottomNav from "../../components/MobileBottomNav";
import SuradeCoinIcon from "../../components/SuradeCoinIcon";
import suradeCoinImg from "../../assets/surade-coin.png";
import SuradeCoinTab from "./tabs/SuradeCoinTab";
import SellerNomorDaruratTab from "./tabs/SellerNomorDaruratTab";
import DailyRewardWidget from "../../components/DailyRewardWidget";
import { BuyCoinModal } from "../../components/SuradeCoinModal";
import GoldWithdrawModal from "../../components/GoldWithdrawModal";
import WhatsAppIcon from "../../components/icons/WhatsAppIcon";
import SuradeLoader from "../../components/SuradeLoader";
import { getUserPresence, OnlineIndicator } from "../../utils/userPresence";
import { detectForbiddenChatContent } from "../../utils/chatModeration";
import {
  LayoutDashboard,
  Activity,
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
  RefreshCw,
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
  BarChart2,
  BarChart3,
  Headphones,
  MessageSquare,
  Phone,
  PhoneCall,
  Video,
  Package,
  Share2,
  Megaphone,
  Target,
  CreditCard,
  Receipt,
  ShieldCheck,
  Copy,
  Gift,
  Wallet,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  CheckCheck,
  MessageCircle,
  Send,
  AlertCircle,
  Sparkles,
  QrCode,
  Store,
  ArrowRight,
  ArrowLeft,
  Layers,
  ExternalLink,
  Trophy,
  Award,
  Zap,
  ThumbsUp,
  Flame,
  Tag,
  Ticket,
  Pin,
  Heart,
  Archive,
  VolumeX,
  Volume2,
  Reply,
  Smile,
  Paperclip,
  MoreVertical,
  ChevronDown,
  RotateCcw,
  UploadCloud,
  Building2,
  XCircle,
  Coins,
} from "lucide-react";

import logoImg from "../../assets/logo-surade.png";
import bannerEventSurade from "../../assets/banner-event-surade.jpg";

import api from "../../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl, OFFICIAL_ACCOUNT_HOLDER, OFFICIAL_PAYMENT_METHODS } from "../../utils/constants";

const UPGRADE_PAYMENT_METHODS = OFFICIAL_PAYMENT_METHODS;

const getCategoryDisplayName = (cat) => {
  if (!cat) return "Usaha";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") return cat.name || cat.title || "Usaha";
  return String(cat);
};

const formatBizOpeningHours = (bizItem) => {
  const days = bizItem?.opening_days || bizItem?.raw?.opening_days;
  if (Array.isArray(days) && days.length > 0) {
    const firstWithHours = days.find(d => typeof d === 'object' && d?.open && d?.close);
    if (firstWithHours) {
      return `${firstWithHours.open} - ${firstWithHours.close} WIB`;
    }
  }
  return bizItem?.opening_hours || bizItem?.raw?.opening_hours || bizItem?.hours || "08:00 - 17:00 WIB";
};

export default function AdminUser() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Global referral context — kode referral upline yang terikat permanen ke akun pengguna
  const {
    appliedReferral: globalAppliedReferral,
    isBound: isGloballyBound,
    myOwnReferralCode: globalOwnReferralCode,
    refreshReferral: refreshGlobalReferral,
  } = useGlobalReferral();
  const { tab: paramTab } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    let queryTab = searchParams.get("tab") || paramTab;
    if (queryTab === "products" || queryTab === "product") queryTab = "produk";
    if (queryTab === "coins" || queryTab === "tarik-saldo" || queryTab === "tarik-gold" || queryTab === "surade-poin") queryTab = "coin";
    if (queryTab) return queryTab;
    if (window.location.pathname.endsWith("/inbox")) return "inbox";
    if (window.location.pathname.endsWith("/premium")) return "premium";
    return "dashboard";
  });

  const handleTabChange = (tabId) => {
    if (tabId === "surade-info") {
      navigate("/admin/surade-info");
      return;
    }
    if (tabId === "tarik-gold" || tabId === "surade-poin") {
      setActiveTab("coin");
      setMobileSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
      setSearchParams({ tab: "coin" }, { replace: true });
      return;
    }
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (tabId === "dashboard") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }

    // Tandai notifikasi terkait tab ini sebagai sudah dibaca (agar badge sidebar bersih)
    const tabKeywordMap = {
      klaim: ["claim", "klaim"],
      iklan: ["ad", "iklan", "advertisement"],
      bisnis: ["business", "bisnis", "usaha"],
      produk: ["product", "produk"],
      referral: ["referral", "commission", "komisi"],
      "blog-event": ["blog", "event", "berita"],
      whatsapp: ["whatsapp", "wa"],
    };
    const kws = tabKeywordMap[tabId];
    if (kws && Array.isArray(notificationsList)) {
      const toMark = notificationsList.filter(
        (n) =>
          !n.is_read &&
          kws.some(
            (kw) =>
              String(n.type || "").toLowerCase().includes(kw) ||
              String(n.source_type || "").toLowerCase().includes(kw) ||
              String(n.title || "").toLowerCase().includes(kw) ||
              String(n.message || "").toLowerCase().includes(kw)
          )
      );
      if (toMark.length > 0) {
        const markIds = toMark.map((n) => n.id);
        setNotificationsList((prev) => {
          const updated = prev.map((n) =>
            markIds.includes(n.id) ? { ...n, is_read: true } : n
          );
          try {
            const readIds = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");
            markIds.forEach((id) => {
              if (!readIds.includes(id)) readIds.push(id);
            });
            localStorage.setItem("user_read_notif_ids", JSON.stringify(readIds));
            localStorage.setItem("user_notifs_cache", JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        toMark.forEach((n) => {
          api.post(`/notifications/${n.id}/read`).catch(() => {});
        });
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  useEffect(() => {
    let queryTab = searchParams.get("tab") || paramTab;
    if (queryTab === "products" || queryTab === "product") queryTab = "produk";

    if (queryTab) {
      setActiveTab(queryTab);
    } else if (window.location.pathname.endsWith("/inbox")) {
      setActiveTab("inbox");
    } else if (window.location.pathname.endsWith("/premium")) {
      setActiveTab("premium");
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams, paramTab]);

  useEffect(() => {
    const tabTitles = {
      dashboard: "Dashboard Pengguna",
      businesses: "Kelola Usaha",
      blogs: "Artikel & Event",
      referrals: "Referral Saya",
      saved: "Simpanan Saya",
      messages: "Pesan Inbox",
      inbox: "Pesan Inbox",
      "nomor-darurat": "Nomor Darurat Usaha",
      premium: "Upgrade Premium",
      settings: "Pengaturan Akun",
    };
    const titleText = tabTitles[activeTab] || "Dashboard Pengguna";
    document.title = `${titleText} - Surade.com`;
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogEventTab, setBlogEventTab] = useState("blog"); // Sub-tab for blog/event combined view
  const [inboxUnread, setInboxUnread] = useState(0);

  // ═════════ NOTIFICATION DROPDOWN SYSTEM ═════════
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState("all"); // "all" | "unread"
  const notifDropdownRef = useRef(null);

  const INITIAL_DEFAULT_NOTIFS = [
    {
      id: "notif-1",
      title: "Selamat Datang di Portal Surade.com",
      message: "Akun reseller Anda telah aktif. Anda dapat mulai mendaftarkan tempat usaha atau UMKM baru.",
      type: "system",
      created_at: new Date().toISOString(),
      is_read: false,
    },
    {
      id: "notif-2",
      title: "Program Referral Berhasil Aktif",
      message: "Bagikan kode referral Anda untuk mendapatkan komisi 10% setiap transaksi mitra.",
      type: "referral",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_read: false,
    },
    {
      id: "notif-3",
      title: "Layanan Centang Emas Verified",
      message: "Tingkatkan toko atau usaha Anda ke Paket Premium untuk prioritas urutan teratas pencarian.",
      type: "business",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_read: true,
    },
  ];

  const [notificationsList, setNotificationsList] = useState(() => {
    try {
      const readIds = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");
      const savedNotifs = JSON.parse(localStorage.getItem("user_notifs_cache") || "null");
      const base = Array.isArray(savedNotifs) && savedNotifs.length > 0 ? savedNotifs : INITIAL_DEFAULT_NOTIFS;
      return base.map(n => ({
        ...n,
        is_read: n.is_read || readIds.includes(n.id)
      }));
    } catch (e) {
      return INITIAL_DEFAULT_NOTIFS;
    }
  });

  const [userImportantNumbers, setUserImportantNumbers] = useState([]);
  const [allUserProducts, setAllUserProducts] = useState([]);

  const fetchUserImportantNumbers = async () => {
    try {
      const res = await api.get("/user/important-numbers");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUserImportantNumbers(list);
    } catch (e) { }
  };

  const fetchAllUserProducts = async () => {
    try {
      const res = await api.get("/my-products");
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAllUserProducts(list);
    } catch (e) { }
  };

  const [userClaims, setUserClaims] = useState([]);
  const [loadingUserClaims, setLoadingUserClaims] = useState(false);
  const [claimFilterStatus, setClaimFilterStatus] = useState("all");

  const fetchUserClaims = async () => {
    try {
      setLoadingUserClaims(true);
      const res = await api.get("/my-claims");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUserClaims(list);
    } catch (e) {
      console.warn("Gagal memuat daftar klaim:", e);
    } finally {
      setLoadingUserClaims(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const readIds = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");
        const synced = res.data.data.map(n => ({
          ...n,
          is_read: n.is_read || readIds.includes(n.id)
        }));
        setNotificationsList(synced);

        // Notifikasi popup resmi: top up poin disetujui, akses wa disetujui, dan reward poin akses wa
        try {
          const toastedIds = JSON.parse(sessionStorage.getItem("user_toasted_coin_ids") || "[]");

          // 1. Verifikasi Top Up Poin Disetujui
          const coinApprovedNotif = res.data.data.find(n =>
            (n.type === "coin_purchase_approved" || String(n.title).toLowerCase().includes("saldo poin berhasil ditambahkan")) &&
            !n.is_read &&
            !readIds.includes(n.id) &&
            !toastedIds.includes(n.id)
          );

          if (coinApprovedNotif) {
            toastedIds.push(coinApprovedNotif.id);
            sessionStorage.setItem("user_toasted_coin_ids", JSON.stringify(toastedIds));
            toast.success("Saldo Poin berhasil ditambahkan!", {
              duration: 6000,
              icon: (
                <img
                  src={suradeCoinImg}
                  alt="Surade Coin"
                  style={{ width: "28px", height: "28px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))" }}
                />
              ),
            });
            fetchHeaderPoinBalance();
            window.dispatchEvent(new CustomEvent("poin-balance-updated"));
          }

          // 2. Verifikasi Pembayaran QRIS Akses WhatsApp Disetujui
          const waApprovedNotif = res.data.data.find(n =>
            (n.type === "whatsapp_access_approved" || String(n.title).toLowerCase().includes("akses whatsapp disetujui")) &&
            !n.is_read &&
            !readIds.includes(n.id) &&
            !toastedIds.includes(n.id)
          );

          if (waApprovedNotif) {
            toastedIds.push(waApprovedNotif.id);
            sessionStorage.setItem("user_toasted_coin_ids", JSON.stringify(toastedIds));
            toast.success(waApprovedNotif.message || "Akses WhatsApp Anda telah disetujui oleh admin! Anda sekarang dapat mengakses nomor WhatsApp.", {
              duration: 7000,
              icon: "🎉",
            });
          }

          // 3. Reward Poin (+1 Poin) untuk Pemilik Usaha ketika WhatsApp Diakses Pengunjung
          const waRewardNotif = res.data.data.find(n =>
            (n.type === "whatsapp_lead_reward" || String(n.title).toLowerCase().includes("poin akses whatsapp")) &&
            !n.is_read &&
            !readIds.includes(n.id) &&
            !toastedIds.includes(n.id)
          );

          if (waRewardNotif) {
            toastedIds.push(waRewardNotif.id);
            sessionStorage.setItem("user_toasted_coin_ids", JSON.stringify(toastedIds));
            toast.success(waRewardNotif.message || "Selamat! Anda mendapatkan +1 Poin karena ada pengunjung mengakses nomor WhatsApp usaha Anda.", {
              duration: 8000,
              icon: (
                <img
                  src={suradeCoinImg}
                  alt="Surade Coin"
                  style={{ width: "30px", height: "30px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))" }}
                />
              ),
              style: {
                borderRadius: "14px",
                background: "#ffffff",
                border: "1.5px solid #f59e0b",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#1e293b",
              },
            });
            fetchHeaderPoinBalance();
            window.dispatchEvent(new CustomEvent("poin-balance-updated"));
          }
        } catch (e) { }

        try {
          localStorage.setItem("user_notifs_cache", JSON.stringify(synced));
        } catch (e) { }
      }
    } catch (err) {
      console.warn("Failed to fetch user notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserImportantNumbers();
    fetchAllUserProducts();
    fetchUserClaims();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUserImportantNumbers();
      fetchAllUserProducts();
      fetchUserClaims();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideNotifClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideNotifClick);
    return () => document.removeEventListener("mousedown", handleOutsideNotifClick);
  }, []);

  const handleMarkAllRead = async () => {
    setNotificationsList((prev) => {
      const updated = prev.map((n) => ({ ...n, is_read: true }));
      try {
        const allIds = updated.map(n => n.id);
        const existing = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");
        const merged = Array.from(new Set([...existing, ...allIds]));
        localStorage.setItem("user_read_notif_ids", JSON.stringify(merged));
        localStorage.setItem("user_notifs_cache", JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
    try {
      await api.post("/notifications/mark-all-read");
    } catch (e) { }
  };

  const handleMarkRead = async (id) => {
    setNotificationsList((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      try {
        const readIds = JSON.parse(localStorage.getItem("user_read_notif_ids") || "[]");
        if (!readIds.includes(id)) readIds.push(id);
        localStorage.setItem("user_read_notif_ids", JSON.stringify(readIds));
        localStorage.setItem("user_notifs_cache", JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (e) { }
  };

  const handleDeleteNotif = async (id) => {
    setNotificationsList((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem("user_notifs_cache", JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch (e) { }
  };

  const unreadNotifCount = notificationsList.filter((n) => !n.is_read).length;
  const totalUnreadCount = unreadNotifCount + (inboxUnread || 0);

  // ═════════ WHATSAPP ACCESS PORTAL (USER) ═════════
  const [userWaLogs, setUserWaLogs] = useState([]);
  const [userWaStats, setUserWaStats] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0 });
  const [userWaLoading, setUserWaLoading] = useState(false);
  const [selectedWaProof, setSelectedWaProof] = useState(null);
  const [reuploadWaLog, setReuploadWaLog] = useState(null);
  const [reuploadProofFile, setReuploadProofFile] = useState(null);
  const [reuploadProofPreview, setReuploadProofPreview] = useState(null);
  const [reuploadSubmitting, setReuploadSubmitting] = useState(false);
  const [viewWaProofHistoryModal, setViewWaProofHistoryModal] = useState(null);

  const fetchUserWaLogs = async () => {
    setUserWaLoading(true);
    try {
      const res = await api.get("/my-whatsapp-access-logs");
      if (res.data?.success) {
        setUserWaLogs(res.data.data?.logs || []);
        setUserWaStats(res.data.data?.stats || { total: 0, pending: 0, confirmed: 0, rejected: 0 });
      }
    } catch (err) {
      console.error("Error fetching user WhatsApp logs:", err);
    } finally {
      setUserWaLoading(false);
    }
  };

  const handleReuploadWaProof = async (e) => {
    if (e) e.preventDefault();
    if (!reuploadWaLog || !reuploadProofFile) {
      toast.error("Silakan pilih file bukti transfer baru terlebih dahulu.");
      return;
    }
    setReuploadSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("proof_image", reuploadProofFile);
      const res = await api.post(`/whatsapp-logs/${reuploadWaLog.id}/reupload-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        toast.success("Bukti transfer berhasil diperbaiki! Menunggu konfirmasi admin.");
        setReuploadWaLog(null);
        setReuploadProofFile(null);
        setReuploadProofPreview(null);
        fetchUserWaLogs();
      } else {
        toast.error(res.data?.message || "Gagal memperbarui bukti transfer.");
      }
    } catch (err) {
      console.error("Gagal perbaiki bukti WA:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui bukti transfer.");
    } finally {
      setReuploadSubmitting(false);
    }
  };

  const displayedNotifs = useMemo(() => {
    if (notifTab === "unread") {
      return notificationsList.filter((n) => !n.is_read);
    }
    return notificationsList;
  }, [notificationsList, notifTab]);

  const getNotifIcon = (type) => {
    switch (type) {
      case "business_claim":
      case "new_business_claim":
      case "business_claim_under_review":
      case "business_claim_approved":
      case "business_claim_rejected":
      case "business_claim_received":
      case "business_transferred":
      case "claim":
        return <ShieldCheck size={15} className="text-purple-600" />;
      case "business":
        return <Store size={15} className="text-emerald-600" />;
      case "referral":
        return <Gift size={15} className="text-amber-600" />;
      case "blog":
      case "event":
        return <FileText size={15} className="text-blue-600" />;
      case "message":
        return <Mail size={15} className="text-purple-600" />;
      default:
        return <Sparkles size={15} className="text-teal-600" />;
    }
  };

  const getNotifIconBg = (type) => {
    switch (type) {
      case "business_claim":
      case "new_business_claim":
      case "business_claim_under_review":
      case "business_claim_approved":
      case "business_claim_rejected":
      case "business_claim_received":
      case "business_transferred":
      case "claim":
        return "bg-purple-100/80";
      case "business":
        return "bg-emerald-100/80";
      case "referral":
        return "bg-amber-100/80";
      case "blog":
      case "event":
        return "bg-blue-100/80";
      case "message":
        return "bg-purple-100/80";
      default:
        return "bg-teal-100/80";
    }
  };

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return "Baru saja";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Baru saja";
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Baru saja";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/inbox/unread-count`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        setInboxUnread(data?.count ?? 0);
      } catch (_) { }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

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
  const [cameraTarget, setCameraTarget] = useState("profile"); // "profile" or "chat"
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Image cropper states
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropType, setCropType] = useState("avatar"); // "avatar" or "banner"

  // Banner states – initialize from user data
  const [profileBanner, setProfileBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(user?.banner || DEFAULT_BANNER);
  const [showBannerOptions, setShowBannerOptions] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Profile data states - initialized from user state (from database via API)
  const [profileData, setProfileData] = useState(() => {
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
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

  // Sync profile data when user changes - Enhanced version
  useEffect(() => {
    if (user && user.id) {
      try {
        const avatarUrl = user.avatar ? getStorageUrl(user.avatar) : DEFAULT_AVATAR;
        const bannerUrl = user.banner ? getStorageUrl(user.banner) : DEFAULT_BANNER;

        setProfileData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          gender: user.gender || "",
          location: user.location || "",
          role: user.role || "User",
          bio: user.bio || "",
          avatar: avatarUrl,
          banner: bannerUrl,
        });

        setPhotoPreview(avatarUrl);
        setBannerPreview(bannerUrl);
        setDisplayName(user.username || user.name || "");

        // console.log("Profile data synced:", { avatarUrl, bannerUrl, name: user.name });
      } catch (error) {
        console.error("Error syncing profile data:", error);
        // Fallback to defaults
        setPhotoPreview(DEFAULT_AVATAR);
        setBannerPreview(DEFAULT_BANNER);
      }
    }
  }, [user]);

  const [businesses, setBusinesses] = useState(() => {
    try {
      const cachedUserStr = localStorage.getItem("user");
      const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
      // If current user is regular user without businesses, do not load stale cache from previous user
      if (cachedUser && cachedUser.role === 'user' && cachedUser.account_type !== 'business' && (!cachedUser.businesses || cachedUser.businesses.length === 0)) {
        localStorage.removeItem("cached_my_businesses");
        return [];
      }

      const cached = localStorage.getItem("cached_my_businesses");
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return [];
      // Filter out businesses that do not belong to current user
      const userBizs = parsed.filter(b => !cachedUser?.id || !b.user_id || String(b.user_id) === String(cachedUser.id));
      if (userBizs.length === 0) return [];
      return userBizs.map(b => {
        const rawImg = b.logo || b.image || b.banner || (Array.isArray(b.banners) && b.banners[0]) || (Array.isArray(b.gallery) && b.gallery[0]) || b.thumbnail;
        const isPremExpired = Boolean(b.premium_expires_at && new Date(b.premium_expires_at) <= new Date());
        return {
          ...b,
          is_premium: !isPremExpired && Boolean(b.is_premium),
          image: rawImg ? getStorageUrl(rawImg) : null,
          category: getCategoryDisplayName(b.category),
          opening_hours: formatBizOpeningHours(b)
        };
      });
    } catch (e) {
      return [];
    }
  });
  const [loadingBusinesses, setLoadingBusinesses] = useState(() => {
    try {
      const cachedUserStr = localStorage.getItem("user");
      const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
      if (cachedUser && cachedUser.role === 'user' && cachedUser.account_type !== 'business' && (!cachedUser.businesses || cachedUser.businesses.length === 0)) {
        return false;
      }
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
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Business edit states
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [businessEditForm, setBusinessEditForm] = useState({
    name: "", description: "", phone: "", address: "", city: "", province: ""
  });
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Blog edit states
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogEditForm, setBlogEditForm] = useState({
    title: "", content: "", blog_category: ""
  });
  const [savingBlog, setSavingBlog] = useState(false);

  // Admin Plans Management states
  const [adminPlans, setAdminPlans] = useState([]);
  const [loadingAdminPlans, setLoadingAdminPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planEditForm, setPlanEditForm] = useState({
    name: "", price: "", duration_days: "", features: {}
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [createPlanForm, setCreatePlanForm] = useState({
    name: "", price: "", duration_days: 30, features: {}
  });
  const [creatingPlan, setCreatingPlan] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [filterTab, setFilterTab] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Content pay-per-post & package modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBlogForPayment, setSelectedBlogForPayment] = useState(null);
  const [contentSubs, setContentSubs] = useState(null);
  const [showContentPkgModal, setShowContentPkgModal] = useState(false);
  const [contentPkgModalType, setContentPkgModalType] = useState("blog");
  const [selectedContentPkg, setSelectedContentPkg] = useState(null);
  const [showContentCheckoutModal, setShowContentCheckoutModal] = useState(false);

  const [contentPricing, setContentPricing] = useState({ blog: 10000, event: 15000 });



  const fetchContentPricing = async () => {
    try {
      const res = await api.get("/content-pricing");
      if (res.data) {
        setContentPricing({
          blog: Number(res.data.blog || 10000),
          event: Number(res.data.event || 15000),
        });
      }
    } catch (err) {
      console.error("Failed to fetch content pricing in AdminUser:", err);
    }
  };

  useEffect(() => {
    fetchContentPricing();
  }, []);
  const [advertisements, setAdvertisements] = useState([]);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(false);
  const [adStats, setAdStats] = useState({
    total_ads: 0,
    active_ads: 0,
    pending_payment: 0,
    waiting_approval: 0,
    expired_ads: 0,
    rejected_ads: 0,
    total_spending: 0,
  });
  const [adFilterTab, setAdFilterTab] = useState("all");
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [createdAdDraftId, setCreatedAdDraftId] = useState(null);
  const [createAdStep, setCreateAdStep] = useState(1);
  const [viewingAdDetail, setViewingAdDetail] = useState(null);
  const [selectedBusinessForAd, setSelectedBusinessForAd] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [adNotes, setAdNotes] = useState('');
  const [submittingAd, setSubmittingAd] = useState(false);
  const [adPackages, setAdPackages] = useState([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponInfo, setAppliedCouponInfo] = useState(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableCouponsLoading, setAvailableCouponsLoading] = useState(false);

  // States for Ad Referral Code
  const [adReferralCodeInput, setAdReferralCodeInput] = useState('');
  const [validatingAdReferral, setValidatingAdReferral] = useState(false);
  const [adAppliedReferralInfo, setAdAppliedReferralInfo] = useState(null);
  const [adReferralMsg, setAdReferralMsg] = useState('');

  // Helper: restore ad referral dari global context (jika user terikat)
  const restoreAdReferralFromGlobal = () => {
    if (isGloballyBound && globalAppliedReferral) {
      const boundCode = globalAppliedReferral.code || globalAppliedReferral.referral_code;
      if (boundCode) {
        setAdReferralCodeInput(boundCode);
        setAdAppliedReferralInfo({
          code: boundCode,
          discount_amount: null,
          discount_percent: 10,
          referrer_name: globalAppliedReferral.referrer_name,
          is_bound: true,
        });
        setAdReferralMsg(`Kode referral mitra terhubung: ${boundCode} (${globalAppliedReferral.referrer_name || 'Mitra Resmi'})`);
        return;
      }
    }
    setAdReferralCodeInput('');
    setAdAppliedReferralInfo(null);
    setAdReferralMsg('');
  };

  // Auto-populate ad referral code dari global context saat pertama mount atau context berubah
  useEffect(() => {
    if (isGloballyBound && globalAppliedReferral) {
      const boundCode = globalAppliedReferral.code || globalAppliedReferral.referral_code;
      if (boundCode && !adAppliedReferralInfo) {
        setAdReferralCodeInput(boundCode);
        setAdAppliedReferralInfo({
          code: boundCode,
          discount_amount: null,
          discount_percent: 10,
          referrer_name: globalAppliedReferral.referrer_name,
          is_bound: true,
        });
        setAdReferralMsg(`Kode referral mitra terhubung: ${boundCode} (${globalAppliedReferral.referrer_name || 'Mitra Resmi'})`);
      }
    }
  }, [isGloballyBound, globalAppliedReferral]);
  const [editingAd, setEditingAd] = useState(null);
  const [editAdForm, setEditAdForm] = useState({ package_name: 'basic', notes: '' });
  const [updatingAd, setUpdatingAd] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Bank BCA');
  const [adPaymentProofFile, setAdPaymentProofFile] = useState(null);
  const [adPaymentProofPreview, setAdPaymentProofPreview] = useState(null);
  const [resubmittingAd, setResubmittingAd] = useState(null);
  const [resubmittingAdId, setResubmittingAdId] = useState(null);
  const [removeExistingProof, setRemoveExistingProof] = useState(false);
  const [existingProofList, setExistingProofList] = useState([]);
  const [newProofFiles, setNewProofFiles] = useState([]);
  const [newProofPreviews, setNewProofPreviews] = useState([]);
  const [resubmitPaymentMethod, setResubmitPaymentMethod] = useState('Bank BCA');
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [submittingResubmit, setSubmittingResubmit] = useState(false);
  const [payModalAd, setPayModalAd] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // Payment methods state - fetched live from API (same source as Kelola Pembayaran in AdminWeb)
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const cached = localStorage.getItem("official_payment_methods_custom");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  useEffect(() => {
    let isMounted = true;
    api.get("/payment-methods")
      .then((res) => {
        const data = res.data?.data?.methods;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPaymentMethods(data);
          localStorage.setItem("official_payment_methods_custom", JSON.stringify(data));
        }
      })
      .catch((err) => console.warn("AdminUser: failed to fetch payment methods:", err));
    return () => { isMounted = false; };
  }, []);

  const getPaymentDetails = (method) => {
    if (!method) return { number: '0954152045', holder: 'Triwala Mitra Bestari' };
    const m = String(method).toLowerCase();

    if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
      const found = paymentMethods.find((pm) => {
        const name = String(pm.name || pm.id || '').toLowerCase();
        return name.includes(m) || m.includes(name) || (pm.id && m.includes(String(pm.id).toLowerCase()));
      });
      if (found) {
        return {
          number: found.accountNumber || found.account_number || 'Scan QR Code',
          holder: found.accountName || found.account_holder || 'Triwala Mitra Bestari',
        };
      }
    }

    if (m.includes('mandiri')) return { number: '133-0011-409-331', holder: 'Triwala Mitra Bestari' };
    if (m.includes('bni')) return { number: '0973607008', holder: 'Triwala Mitra Bestari' };
    if (m.includes('bca')) return { number: '0954152045', holder: 'Triwala Mitra Bestari' };
    if (m.includes('maybank')) return { number: '2097000009', holder: 'Triwala Mitra Bestari' };
    if (m.includes('bjb')) return { number: '0119213282001', holder: 'Triwala Mitra Bestari' };
    if (m.includes('ovo')) return { number: '0811-1919-711', holder: 'Triwala Mitra Bestari' };
    if (m.includes('dana') || m.includes('gopay')) return { number: '0811-1919-711', holder: 'Triwala Mitra Bestari' };
    if (m.includes('qris')) return { number: 'Scan QR Code', holder: 'Triwala Mitra Bestari' };
    return { number: '0954152045', holder: 'Triwala Mitra Bestari' };
  };

  const getPaymentNumber = (method) => getPaymentDetails(method).number;
  const getPaymentHolder = (method) => getPaymentDetails(method).holder;

  const getSelectedPackageObj = () => {
    if (!selectedPackage) return null;
    return adPackages.find(p => p.name === selectedPackage || p.id === selectedPackage || String(p.id) === String(selectedPackage)) || null;
  };

  const getSelectedBusinessObj = () => {
    if (!selectedBusinessForAd) return null;
    return businesses.find(b => b.id === Number(selectedBusinessForAd) || b.id === selectedBusinessForAd || String(b.id) === String(selectedBusinessForAd)) || null;
  };

  const getBusinessPhoto = (biz) => {
    if (!biz) return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
    const rawPath =
      biz.logo ||
      biz.logo_url ||
      biz.image ||
      biz.thumbnail ||
      biz.banner ||
      (Array.isArray(biz.banners) && biz.banners[0]) ||
      (Array.isArray(biz.gallery) && biz.gallery[0]) ||
      (biz.media && biz.media.length > 0 ? (biz.media[0].file_path || biz.media[0].url) : null) ||
      biz.raw?.logo ||
      biz.raw?.logo_url ||
      biz.raw?.image ||
      biz.raw?.thumbnail ||
      biz.raw?.banner ||
      (biz.raw?.media && biz.raw.media.length > 0 ? (biz.raw.media[0].file_path || biz.raw.media[0].url) : null);

    if (!rawPath) return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
    if (typeof rawPath === "string" && (rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("blob:") || rawPath.startsWith("data:"))) {
      return rawPath;
    }
    return getStorageUrl(rawPath) || rawPath;
  };

  const getBusinessCategoryName = (biz) => {
    if (!biz) return "Kategori Usaha";
    if (typeof biz.category === "string" && biz.category.trim() && biz.category !== "Kategori Usaha") {
      return biz.category;
    }
    if (biz.category?.name) return biz.category.name;
    if (biz.raw?.category?.name) return biz.raw.category.name;
    if (biz.raw?.category?.parent?.name) return biz.raw.category.parent.name;
    if (biz.subCategory) return biz.subCategory;
    return "Kategori Usaha";
  };

  const getBusinessCityName = (biz) => {
    if (!biz) return "Indonesia";
    return biz.city || biz.address || biz.raw?.city || biz.raw?.address || "Indonesia";
  };

  const formatAdDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const dateFormatted = d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = d.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    return `${dateFormatted}, ${timeFormatted} WIB`;
  };

  const getDetailedTimeRemaining = (endDateStr) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr).getTime();
    const now = new Date().getTime();
    const diffMs = end - now;

    if (diffMs <= 0) {
      return { isExpired: true, text: "Masa tayang berakhir", badgeClass: "bg-slate-200 text-slate-600 border border-slate-300" };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    const remMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let text = "";
    let badgeClass = "bg-emerald-100 text-emerald-800 border border-emerald-300";

    if (diffDays >= 2) {
      text = `Sisa ${diffDays} hari ${remHours > 0 ? `${remHours} jam` : ''}`.trim();
      if (diffDays <= 3) badgeClass = "bg-amber-100 text-amber-800 border border-amber-300";
    } else if (diffDays === 1) {
      text = `Sisa 1 hari ${remHours} jam`;
      badgeClass = "bg-amber-100 text-amber-800 border border-amber-300";
    } else if (diffHours > 0) {
      text = `Sisa ${diffHours} jam ${remMinutes} mnt`;
      badgeClass = "bg-rose-100 text-rose-700 border border-rose-300 font-black";
    } else {
      text = `Sisa ${remMinutes} menit lagi`;
      badgeClass = "bg-rose-100 text-rose-700 border border-rose-300 font-black animate-pulse";
    }

    return { isExpired: false, text: `⏳ ${text}`, badgeClass };
  };

  const getAdDurationDisplay = (ad) => {
    let days = ad?.duration_days;
    if (!days && ad?.start_date && ad?.end_date) {
      const s = new Date(ad.start_date).getTime();
      const e = new Date(ad.end_date).getTime();
      const diff = Math.round((e - s) / 86400000);
      if (diff > 0) days = diff;
    }
    const numDays = Number(days) || 30;
    if (numDays === 1) {
      return "1 Hari (24 Jam)";
    }
    if (numDays === 7) {
      return "7 Hari (1 Minggu)";
    }
    if (numDays >= 28 && numDays <= 32) {
      return "30 Hari (1 Bulan)";
    }
    if (numDays >= 58 && numDays <= 63) {
      return "60 Hari (2 Bulan)";
    }
    if (numDays >= 89 && numDays <= 93) {
      return "90 Hari (3 Bulan)";
    }
    if (numDays >= 360 && numDays <= 366) {
      return "365 Hari (1 Tahun)";
    }
    return `${numDays} Hari`;
  };

  const getSelectedPackagePrice = () => {
    if (!selectedPackage) return 0;
    const found = getSelectedPackageObj();
    if (found && found.price) return Number(found.price);
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('basic')) return 50000;
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('standard')) return 150000;
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('premium')) return 350000;
    return 100000;
  };

  const getAdReferralDiscount = () => {
    if (!adAppliedReferralInfo) return 0;
    const base = getSelectedPackagePrice();
    if (adAppliedReferralInfo.discount_amount && Number(adAppliedReferralInfo.discount_amount) > 0) {
      return Math.min(base, Number(adAppliedReferralInfo.discount_amount));
    }
    const percent = Number(adAppliedReferralInfo.discount_percent || 10);
    return Math.round((base * percent) / 100);
  };

  const getFinalPrice = () => {
    const base = getSelectedPackagePrice();
    let couponDiscount = 0;
    if (appliedCouponInfo && appliedCouponInfo.discount_amount) {
      couponDiscount = Number(appliedCouponInfo.discount_amount);
    }
    const refDiscount = getAdReferralDiscount();
    const totalDiscount = Math.min(base, couponDiscount + refDiscount);
    return Math.max(0, base - totalDiscount);
  };

  // States for Bisnis page UI (Search, Filter, Pagination, Error)
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState("Semua");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [businessStatusFilter, setBusinessStatusFilter] = useState("Semua");
  const [businessCurrentPage, setBusinessCurrentPage] = useState(1);
  const [businessItemsPerPage] = useState(6);
  const [businessFetchError, setBusinessFetchError] = useState(null);

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          setAvailableCategories(data);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar kategori:", err));
  }, []);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1);
  const [reviewsBusinessFilter, setReviewsBusinessFilter] = useState("all");
  const [reviewsError, setReviewsError] = useState("");
  const [resellers, setResellers] = useState([]);

  // States for Referral Feature

  const [referralSearch, setReferralSearch] = useState("");
  const [referralStatusFilter, setReferralStatusFilter] = useState("all");
  const [referralPage, setReferralPage] = useState(1);
  const [referralCopyToast, setReferralCopyToast] = useState(false);
  const [referralLinkCopyToast, setReferralLinkCopyToast] = useState(false);

  const handleShareReferralCode = async (code = referralCode) => {
    if (!code) return;
    const link = `https://surade.com/register?ref=${code}`;
    const text = `🎉 Daftarkan usaha UMKM kamu di Surade.com menggunakan kode referral saya: *${code}* dan nikmati diskon spesial!\n\nKlik link pendaftaran instan di sini:\n${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kode Referral Surade.com",
          text: text,
          url: link,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share failed, opening WhatsApp:", err);
        }
      }
    }

    // Fallback: Open WhatsApp share link with pre-filled message
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    bank: "BCA",
    accountNumber: "",
    accountHolder: user?.name || "",
    amount: "50000",
    notes: "",
  });
  const [withdrawQrisFile, setWithdrawQrisFile] = useState(null);
  const [withdrawQrisPreview, setWithdrawQrisPreview] = useState(null);
  const [viewQrisModalUrl, setViewQrisModalUrl] = useState(null);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState("");
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState("");
  const [selectedReferralTx, setSelectedReferralTx] = useState(null);

  // States for Public Referral Codes & Leaderboard
  const [publicReferralCodes, setPublicReferralCodes] = useState([]);
  const [loadingPublicCodes, setLoadingPublicCodes] = useState(false);
  const [publicCodeSearch, setPublicCodeSearch] = useState("");
  const [copiedPublicCodeId, setCopiedPublicCodeId] = useState(null);
  const [appliedPublicCodeToast, setAppliedPublicCodeToast] = useState("");

  const [referralLeaderboard, setReferralLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [selectedPromoTemplate, setSelectedPromoTemplate] = useState("diskon");
  const [copiedPromoText, setCopiedPromoText] = useState(false);

  // Real Referral State from Backend API with Instant Caching
  const [referralStats, setReferralStats] = useState(() => {
    try {
      const currentId = user?.id;
      if (currentId) {
        const cached = localStorage.getItem(`cached_referral_stats_${currentId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed) {
            return parsed;
          }
        }
      }
    } catch (e) { }

    return {
      referral_code: "",
      total_usages: 0,
      successful_referrals: 0,
      earned_commission: 0,
      available_balance: 0,
      pending_commission: 0,
      paid_commission: 0,
    };
  });
  const [referralTransactions, setReferralTransactions] = useState(() => {
    try {
      if (user?.id) {
        const cached = localStorage.getItem(`cached_referral_tx_${user.id}`);
        if (cached) return JSON.parse(cached);
      }
    } catch (e) { }
    return [];
  });
  const [referralWithdrawals, setReferralWithdrawals] = useState(() => {
    try {
      if (user?.id) {
        const cached = localStorage.getItem(`cached_referral_wd_${user.id}`);
        if (cached) return JSON.parse(cached);
      }
    } catch (e) { }
    return [];
  });
  const [previewReferralProofModal, setPreviewReferralProofModal] = useState(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [isPremiumSeller, setIsPremiumSeller] = useState(false);
  const [agentStatus, setAgentStatus] = useState("regular_user");

  // Custom Referral Code Modal State
  const [showCustomCodeModal, setShowCustomCodeModal] = useState(false);
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [customCodeLoading, setCustomCodeLoading] = useState(false);
  const [customCodeError, setCustomCodeError] = useState("");
  const [customCodeSuccess, setCustomCodeSuccess] = useState("");

  const handleOpenCustomCodeModal = () => {
    setCustomCodeInput(referralStats.referral_code || user?.referral_code || "");
    setCustomCodeError("");
    setCustomCodeSuccess("");
    setShowCustomCodeModal(true);
  };

  const handleSaveCustomReferralCode = async (e) => {
    e.preventDefault();
    setCustomCodeError("");
    setCustomCodeSuccess("");

    const trimmed = customCodeInput.trim().toUpperCase();
    if (!trimmed) {
      setCustomCodeError("Kode referral tidak boleh kosong.");
      return;
    }
    if (trimmed.length < 4) {
      setCustomCodeError("Kode referral minimal 4 karakter.");
      return;
    }
    if (trimmed.length > 30) {
      setCustomCodeError("Kode referral maksimal 30 karakter.");
      return;
    }

    setCustomCodeLoading(true);
    try {
      const res = await api.post("/referrals/custom-code", { referral_code: trimmed });
      if (res.data && res.data.success) {
        const newCode = res.data.referral_code || trimmed;
        setReferralStats((prev) => ({ ...prev, referral_code: newCode }));
        const updatedUser = { ...user, referral_code: newCode };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setCustomCodeSuccess("Kode referral berhasil diperbarui!");
        setTimeout(() => {
          setShowCustomCodeModal(false);
        }, 1200);
      } else {
        setCustomCodeError(res.data?.message || "Gagal mengupdate kode referral.");
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.referral_code?.[0] || err.response?.data?.message || "Gagal memperbarui kode referral.";
      setCustomCodeError(msg);
    } finally {
      setCustomCodeLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    // If we don't have cached data, show loader, otherwise fetch silently in background
    if (!referralStats.referral_code) {
      setLoadingReferrals(true);
    }
    setReferralError("");
    try {
      const res = await api.get("/referrals/my-stats");
      if (res.data && res.data.success) {
        const data = res.data.data;
        const isAgent = Boolean(data.is_agent || (data.agent_status === "active"));
        const currentAgentStatus = data.agent_status || (isAgent ? "active" : "regular_user");
        setIsPremiumSeller(isAgent);
        setAgentStatus(currentAgentStatus);

        const finalCode = isAgent ? (data.referral_code || "") : "";

        const newStats = {
          referral_code: finalCode,
          agent_status: currentAgentStatus,
          is_agent: isAgent,
          total_usages: data.total_usages || 0,
          successful_referrals: data.successful_referrals || 0,
          earned_commission: data.earned_commission || 0,
          available_balance: data.available_balance !== undefined ? data.available_balance : (data.earned_commission - data.paid_commission),
          pending_commission: data.pending_commission || 0,
          paid_commission: data.paid_commission || 0,
        };

        setReferralStats(newStats);
        setReferralTransactions(data.transactions || []);
        setReferralWithdrawals(data.withdrawals || []);

        // Cache instantly per user ID
        if (user?.id) {
          localStorage.setItem(`cached_referral_stats_${user.id}`, JSON.stringify(newStats));
          localStorage.setItem(`cached_referral_tx_${user.id}`, JSON.stringify(data.transactions || []));
          localStorage.setItem(`cached_referral_wd_${user.id}`, JSON.stringify(data.withdrawals || []));

          // Jika user bukan agen aktif, bersihkan referral_code dari localStorage
          if (!isAgent && user.referral_code) {
            const updatedUser = { ...user, referral_code: null };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else if (isAgent && finalCode && user.referral_code !== finalCode) {
            const updatedUser = { ...user, referral_code: finalCode };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
      setReferralError("Gagal memuat data referral.");
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleDeleteReferralTx = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat transaksi referral ini?")) return;
    try {
      const res = await api.delete(`/referrals/transactions/${id}`);
      if (res.data?.success) {
        fetchReferralStats();
      }
    } catch (err) {
      console.error("Failed to delete referral transaction:", err);
    }
  };

  const handleClearAllReferralTx = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat transaksi referral? Data yang dihapus tidak dapat dikembalikan.")) return;
    try {
      const res = await api.delete("/referrals/transactions");
      if (res.data?.success) {
        fetchReferralStats();
      }
    } catch (err) {
      console.error("Failed to clear referral transactions:", err);
    }
  };

  const handleDeleteWithdrawal = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat penarikan komisi ini?")) return;
    try {
      const res = await api.delete(`/referrals/withdrawals/${id}`);
      if (res.data?.success) {
        fetchReferralStats();
      }
    } catch (err) {
      console.error("Failed to delete withdrawal history:", err);
    }
  };

  const handleClearAllWithdrawals = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat penarikan komisi? Data yang dihapus tidak dapat dikembalikan.")) return;
    try {
      const res = await api.delete("/referrals/withdrawals");
      if (res.data?.success) {
        fetchReferralStats();
      }
    } catch (err) {
      console.error("Failed to clear withdrawal history:", err);
    }
  };

  const fetchPublicCodes = async () => {
    setLoadingPublicCodes(true);
    try {
      const res = await api.get("/referrals/public-codes");
      if (res.data && res.data.success) {
        setPublicReferralCodes(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch public referral codes:", err);
    } finally {
      setLoadingPublicCodes(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.get("/referrals/leaderboard");
      if (res.data && res.data.success) {
        setReferralLeaderboard(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch referral leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Eager prefetch when component mounts OR when switching to referral tab
  useEffect(() => {
    if (user?.id) {
      fetchReferralStats();
      if (activeTab === "referral" || activeTab === "reseller") {
        fetchPublicCodes();
        fetchLeaderboard();
      }
    }
  }, [activeTab, user?.id]);

  const cleanCurrentFirstName = (user?.name || user?.username || "USER").trim().split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "RFO";
  const currentFallbackCode = user?.id ? `SURADE-${cleanCurrentFirstName}-${user.id}` : "SURADE-RFO167";
  let referralCode = referralStats.referral_code || user?.referral_code || currentFallbackCode;
  if (referralCode.startsWith("INFO-")) {
    referralCode = referralCode.replace(/^INFO-/, "SURADE-");
  }
  const totalReferralEarnings = referralStats.earned_commission;
  const availableReferralBalance = referralStats.available_balance !== undefined ? referralStats.available_balance : Math.max(0, totalReferralEarnings - referralStats.paid_commission);
  const pendingReferralEarnings = referralStats.pending_commission;
  const paidReferralEarnings = referralStats.paid_commission;
  const totalReferralUsage = referralStats.total_usages;
  const successReferralCount = referralStats.successful_referrals;

  const promoTemplates = useMemo(() => {
    const code = referralCode;
    const link = `https://surade.com/register?ref=${code}`;
    return {
      diskon: `🎉 *PROMO SPESIAL SURADE.COM - DISKON & BONUS KHUSUS!* 🎉\n\nHai rekan-rekan! 👋 Mau toko atau produk UMKM kamu makin ramai pembeli di Kecamatan Surade?\n\nYuk gabung & daftarkan usaha kamu di portal resmi *Surade.com*!\n✨ Dapatkan diskon & penawaran eksklusif dengan kode referral saya:\n👉 *Kode Promo:* *${code}*\n🌐 *Link Pendaftaran Instan:* ${link}\n\nKeuntungan bergabung:\n✅ Tampil di direktori 12 Desa se-Kecamatan Surade\n✅ Terhubung langsung ke WhatsApp pembeli tanpa komisi perantara\n✅ Buka peluang omzet dan pelanggan baru setiap hari! 🚀`,
      bisnis: `💼 *TINGKATKAN PENJUALAN USAHA & UMKM ANDA DI SURADE!* 💼\n\nHalo pengusaha & pedagang hebat Surade! 🌟\nSudah punya etalase digital untuk bisnis Anda?\n\nDaftarkan toko resmi Anda di *Surade.com* dan nikmati berbagai fitur unggulan:\n👑 Prioritas pencarian teratas & lencana Centang Emas\n📦 Katalog produk lengkap langsung terhubung ke WhatsApp\n📢 Promo banner menjangkau ribuan pengunjung lokal\n\nGunakan kode kemitraan saya untuk klaim bonus khusus:\n🏷️ *Kode Referral:* *${code}*\n🔗 *Daftar Sekarang:* ${link}\n\nMari majukan ekonomi lokal Surade bersama-sama! 📈💪`,
      heboh: `🔥 *PENAWARAN TERBATAS: AKTIVASI TOKO & PAKET PROMOSI SURADE!* 🔥\n\nKabar gembira buat kamu yang mau bisnismu dikenal luas se-Kecamatan Surade! 🚀\n\nGunakan kode kemitraan eksklusif ini saat registrasi / upgrade paket:\n🎁 *KODE KEMITRAAN:* *${code}*\n⚡ *LINK KLAIM:* ${link}\n\nKeuntungan langsung:\n1️⃣ Potongan harga spesial pendaftaran & paket promosi\n2️⃣ Toko aktif online 24 jam non-stop\n3️⃣ Pembeli langsung chat WhatsApp tanpa biaya aplikasi\n\nSlot promo terbatas! Yuk daftar sekarang sebelum terlewat! 👍✨`,
    };
  }, [referralCode]);

  const activePromoMessage = promoTemplates[selectedPromoTemplate] || promoTemplates.diskon;

  const filteredPublicCodes = useMemo(() => {
    return publicReferralCodes.filter((item) => {
      const q = publicCodeSearch.toLowerCase();
      if (!q) return true;
      return (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.code && item.code.toLowerCase().includes(q))
      );
    });
  }, [publicReferralCodes, publicCodeSearch]);

  const filteredReferralTransactions = useMemo(() => {
    return referralTransactions.filter((tx) => {
      const q = referralSearch.toLowerCase();
      const userName = tx.userName || tx.user_name || tx.referred_name || "";
      const service = tx.service || tx.service_name || "";
      const businessName = tx.businessName || tx.business_name || "";
      const txId = String(tx.id || "");

      const matchesSearch =
        !q ||
        txId.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        service.toLowerCase().includes(q) ||
        businessName.toLowerCase().includes(q);

      const statusLower = String(tx.status || "").toLowerCase();
      const matchesStatus =
        referralStatusFilter === "all" ||
        (referralStatusFilter === "success" &&
          ["approved", "earned", "paid", "success", "completed", "active", "disetujui"].includes(statusLower)) ||
        (referralStatusFilter === "pending" &&
          ["pending", "waiting_approval", "menunggu"].includes(statusLower)) ||
        (referralStatusFilter === "cancelled" &&
          ["cancelled", "rejected", "failed", "dibatalkan", "ditolak"].includes(statusLower));

      return matchesSearch && matchesStatus;
    });
  }, [referralTransactions, referralSearch, referralStatusFilter]);
  /* ── Simpan / Bookmark States ── */
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
  const [loadingSavedItems, setLoadingSavedItems] = useState(false);
  const [savedItemsError, setSavedItemsError] = useState("");
  /* ── Ulasan / Reviews Handlers ── */

  const fetchReviews = async () => {
    setLoadingReviews(true);
    setReviewsError("");
    try {
      const res = await api.get("/my-ratings");
      if (res.data) {
        const rawData = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        const formatted = rawData.map((r) => ({
          id: r.id,
          business_id: r.business_id || r.business?.id,
          businessName: r.business ? r.business.name : (r.business_name || "Bisnis"),
          businessLogo: r.business
            ? r.business.logo
              ? getStorageUrl(r.business.logo)
              : null
            : (r.business_logo ? getStorageUrl(r.business_logo) : null),
          businessSlug: r.business ? r.business.slug : (r.business_slug || null),
          rating: Number(r.rating || 0),
          review: r.review || "",
          user: typeof r.user === "object" ? (r.user?.name || "Pelanggan") : (r.user_name || r.user || "Pelanggan"),
          userAvatar: typeof r.user === "object" ? r.user?.avatar : (r.user_avatar || null),
          is_mine: Boolean(r.is_mine || (user?.id && (r.user_id === user.id || r.user?.id === user.id))),
          created_at: r.created_at,
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            : "",
        }));
        setReviews(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviewsError("Gagal memuat ulasan.");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ulasan") {
      fetchReviews();
    }
  }, [activeTab]);

  /* ── Real Inbox / Chat States & Handlers (WhatsApp Web Style) ── */
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(
    searchParams.get("conversation") || null
  );
  const [activeChatData, setActiveChatData] = useState(null);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [sendingChatMessage, setSendingChatMessage] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingChatDetails, setLoadingChatDetails] = useState(false);
  const [inboxSearchQuery, setInboxSearchQuery] = useState("");
  const chatMessagesEndRef = useRef(null);

  // WhatsApp-specific states
  const [chatFilter, setChatFilter] = useState("all"); // "all" | "unread" | "favorites"
  const [activeMenuConvId, setActiveMenuConvId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatImageFile, setChatImageFile] = useState(null);       // File object for photo send
  const [chatImagePreview, setChatImagePreview] = useState(null); // Data URL preview
  const chatImageInputRef = useRef(null);                         // Hidden file input ref

  // LocalStorage-synced WhatsApp features (Pin, Favorite, Manual Unread, Archive, Mute, Clear, Delete)
  const [pinnedChats, setPinnedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_pinned_chats") || "[]");
    } catch {
      return [];
    }
  });
  const [favoriteChats, setFavoriteChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_fav_chats") || "[]");
    } catch {
      return [];
    }
  });
  const [manualUnreadChats, setManualUnreadChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_manual_unread") || "[]");
    } catch {
      return [];
    }
  });
  const [archivedChats, setArchivedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_archived_chats") || "[]");
    } catch {
      return [];
    }
  });
  const [mutedChats, setMutedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_muted_chats") || "[]");
    } catch {
      return [];
    }
  });
  const [clearedChats, setClearedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_cleared_chats") || "{}");
    } catch {
      return {};
    }
  });
  const [deletedChats, setDeletedChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("surade_wa_deleted_chats") || "[]");
    } catch {
      return [];
    }
  });

  // Close menus and emoji pickers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".wa-dropdown-menu") && !e.target.closest(".wa-menu-trigger")) {
        setActiveMenuConvId(null);
      }
      if (!e.target.closest(".wa-emoji-picker") && !e.target.closest(".wa-emoji-trigger")) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Persistent Cache for Messages to ensure 0ms instant loading & zero flickering
  const chatMessagesCacheRef = useRef({});

  // Sync activeConversationId from searchParams when URL changes
  useEffect(() => {
    const convParam = searchParams.get("conversation");
    if (convParam) {
      setActiveConversationId(convParam);
      // Remove from manual unread when opened
      setManualUnreadChats((prev) => {
        const next = prev.filter((id) => String(id) !== String(convParam));
        localStorage.setItem("surade_wa_manual_unread", JSON.stringify(next));
        return next;
      });
    } else {
      setActiveConversationId(null);
      setActiveChatData(null);
    }
  }, [searchParams]);

  // Fetch Conversations List
  const fetchConversationsList = async (showLoading = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (showLoading && conversations.length === 0) setLoadingConversations(true);
    try {
      const res = await api.get("/inbox");
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        setConversations(list);

        // Auto-restore any conversation that receives new messages (WhatsApp behaviour)
        const unreadIds = list.filter((c) => (c.unread_count || 0) > 0).map((c) => c.id);
        if (unreadIds.length > 0) {
          setDeletedChats((prev) => {
            const next = prev.filter(
              (id) => !unreadIds.includes(id) && !unreadIds.includes(Number(id)) && !unreadIds.includes(String(id))
            );
            if (next.length !== prev.length) {
              try {
                localStorage.setItem("surade_wa_deleted_chats", JSON.stringify(next));
              } catch { }
            }
            return next;
          });
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      console.warn("Notice: conversations sync:", err?.message || err);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  };

  // Fetch Single Conversation Messages & Details
  const fetchActiveChatDetails = async (convId, showLoading = false, isPoll = false) => {
    if (!convId) return;

    // Check if we have cached messages for instant rendering
    const cachedMessages = chatMessagesCacheRef.current[convId] || [];

    // Find conversation header info from list
    const foundConv = conversations.find(
      (c) => String(c.id) === String(convId) || String(c.conversation_id) === String(convId)
    );

    // Hydrate activeChatData immediately with zero delay (only when opening new conversation)
    if (!isPoll) {
      setActiveChatData((prev) => {
        // If same conversation already loaded with messages, keep it (avoid flash)
        if (prev && String(prev.id) === String(convId) && prev.messages && prev.messages.length > 0) {
          return prev;
        }

        if (foundConv) {
          return {
            ...foundConv,
            id: foundConv.id,
            conversation_id: foundConv.id,
            business_id: foundConv.business_id,
            business: { id: foundConv.business_id, name: foundConv.business_name, logo: foundConv.business_logo },
            counterparty_id: foundConv.counterparty_id,
            counterparty_name: foundConv.counterparty_name,
            counterparty_avatar: foundConv.counterparty_avatar,
            counterparty_role: foundConv.counterparty_role,
            counterparty_email: foundConv.counterparty_email,
            is_online: foundConv.is_online,
            last_seen_at: foundConv.last_seen_at,
            messages: cachedMessages,
          };
        }

        return prev;
      });

      if (showLoading && cachedMessages.length === 0) {
        setLoadingChatDetails(true);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // CRITICAL FIX: Always use the per-conversation cache for latestMsgId
      // Never use activeChatData.messages (can be from a different conversation during switch)
      const currentMsgs = chatMessagesCacheRef.current[convId] || [];
      const latestRealMsg = [...currentMsgs].reverse().find(m => m && m.id && !String(m.id).startsWith("temp-"));
      const latestMsgId = latestRealMsg ? latestRealMsg.id : null;

      // Use after_id only when polling AND we have existing messages in THIS conversation's cache
      const url = (isPoll && latestMsgId)
        ? `/inbox/${convId}?after_id=${latestMsgId}`
        : `/inbox/${convId}?limit=50`;

      const res = await api.get(url);
      if (res.data && res.data.success) {
        const fetchedData = res.data.data;
        const newMessages = fetchedData.messages || [];

        if (isPoll && latestMsgId) {
          // Only merge if there are truly new messages
          if (newMessages.length > 0) {
            setActiveChatData((prev) => {
              if (!prev || String(prev.id) !== String(convId)) return prev;
              const existingIds = new Set((prev.messages || []).map(m => m.id));
              const incoming = newMessages.filter(m => !existingIds.has(m.id));
              if (incoming.length === 0) return prev;
              const merged = [...(prev.messages || []), ...incoming];
              chatMessagesCacheRef.current[convId] = merged;
              return { ...prev, messages: merged };
            });
          }
        } else {
          // Full refresh: replace messages
          chatMessagesCacheRef.current[convId] = newMessages;
          setActiveChatData((prev) => ({
            ...foundConv,
            ...prev,
            ...fetchedData,
            counterparty_id: fetchedData.counterparty_id || foundConv?.counterparty_id || prev?.counterparty_id,
            counterparty_name: fetchedData.counterparty_name || foundConv?.counterparty_name || prev?.counterparty_name,
            counterparty_email: fetchedData.counterparty_email || foundConv?.counterparty_email || prev?.counterparty_email,
            counterparty_avatar: fetchedData.counterparty_avatar || foundConv?.counterparty_avatar || prev?.counterparty_avatar,
            counterparty_role: fetchedData.counterparty_role || foundConv?.counterparty_role || prev?.counterparty_role,
            is_online: fetchedData.is_online !== undefined ? fetchedData.is_online : (foundConv?.is_online !== undefined ? foundConv.is_online : prev?.is_online),
            last_seen_at: fetchedData.last_seen_at || foundConv?.last_seen_at || prev?.last_seen_at,
            messages: newMessages,
          }));
        }

        // Clear unread count locally for active conversation
        setConversations((prev) =>
          prev.map((c) =>
            String(c.id) === String(convId) || String(c.conversation_id) === String(convId)
              ? { ...c, unread_count: 0, is_unread: false }
              : c
          )
        );
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn("Notice: chat details sync:", err?.message || err);
      }
    } finally {
      if (showLoading) setLoadingChatDetails(false);
    }
  };

  // Initial mount & tab switch: fetch conversations list immediately
  useEffect(() => {
    fetchConversationsList(conversations.length === 0);
  }, [activeTab]);

  // On activeConversationId or activeTab change: fetch active chat
  useEffect(() => {
    if (activeTab === "inbox" && activeConversationId) {
      // Clear stale data if switching to a different conversation
      setActiveChatData((prev) => {
        if (prev && String(prev.id) !== String(activeConversationId)) {
          return null; // Wipe old conversation data immediately
        }
        return prev;
      });
      fetchActiveChatDetails(activeConversationId, true);
    } else if (activeTab !== "inbox") {
      setActiveChatData(null);
    }
  }, [activeTab, activeConversationId]);

  // Background sync:
  // 1) Global: poll conversations list every 8s (or 4s on inbox tab) to keep totalInboxUnreadCount and sidebar badges live
  // 2) Active chat messages poll every 3s when on inbox tab
  useEffect(() => {
    // Poll conversations list
    const listInterval = setInterval(() => {
      if (document.hidden) return;
      fetchConversationsList(false);
    }, activeTab === "inbox" ? 4000 : 8000);

    // Poll active chat every 3s (offset 1.5s so they don't fire simultaneously)
    let msgInterval = null;
    let msgTimeout = null;
    if (activeTab === "inbox") {
      msgTimeout = setTimeout(() => {
        if (activeConversationId) {
          fetchActiveChatDetails(activeConversationId, false, true);
        }
        msgInterval = setInterval(() => {
          if (document.hidden) return;
          if (activeConversationId) {
            fetchActiveChatDetails(activeConversationId, false, true);
          }
        }, 3000);
      }, 1500);
    }

    return () => {
      clearInterval(listInterval);
      if (msgTimeout) clearTimeout(msgTimeout);
      if (msgInterval) clearInterval(msgInterval);
    };
  }, [activeTab, activeConversationId]);

  // Scroll to bottom when messages update — safe with rAF to avoid 'Node not found'
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (chatMessagesEndRef.current) {
        chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [activeChatData?.messages?.length]);

  // Calculate Total Unread Messages for sidebar badge & header count
  const totalInboxUnreadCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Filtered conversations with WhatsApp Pin, Tabs (All/Unread/Favorites/Archived), and Search
  const filteredConversations = useMemo(() => {
    // 1. Filter out deleted chats UNLESS they have unread messages or are manually marked unread
    let list = conversations.filter((c) => {
      const isUnread = (c.unread_count || 0) > 0 || manualUnreadChats.includes(c.id) || manualUnreadChats.includes(String(c.id));
      if (isUnread) return true; // Always display conversation if there are incoming unread messages!
      const isDeleted = deletedChats.includes(c.id) || deletedChats.includes(String(c.id)) || deletedChats.includes(Number(c.id));
      return !isDeleted;
    });

    // 2. Filter tabs & Archived status
    if (chatFilter === "archived") {
      list = list.filter((c) => archivedChats.includes(c.id) || archivedChats.includes(String(c.id)));
    } else {
      // Sembunyikan chat yang diarsipkan dari tampilan utama (kecuali ada pesan baru)
      list = list.filter((c) => {
        const isUnread = (c.unread_count || 0) > 0;
        if (isUnread) return true;
        return !archivedChats.includes(c.id) && !archivedChats.includes(String(c.id));
      });

      if (chatFilter === "unread") {
        list = list.filter((c) => ((c.unread_count || 0) > 0) || manualUnreadChats.includes(c.id) || manualUnreadChats.includes(String(c.id)));
      } else if (chatFilter === "favorites") {
        list = list.filter((c) => favoriteChats.includes(c.id) || favoriteChats.includes(String(c.id)));
      }
    }

    // 3. Search query filter
    if (inboxSearchQuery.trim()) {
      const q = inboxSearchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.business_name && c.business_name.toLowerCase().includes(q)) ||
          (c.counterparty_name && c.counterparty_name.toLowerCase().includes(q)) ||
          (c.last_message && c.last_message.toLowerCase().includes(q))
      );
    }

    // 4. Sort: Pinned chats first, then latest message descending
    return [...list].sort((a, b) => {
      const aPinned = pinnedChats.includes(a.id) || pinnedChats.includes(String(a.id));
      const bPinned = pinnedChats.includes(b.id) || pinnedChats.includes(String(b.id));
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      const timeA = new Date(a.last_message_at || 0).getTime();
      const timeB = new Date(b.last_message_at || 0).getTime();
      return timeB - timeA;
    });
  }, [conversations, inboxSearchQuery, chatFilter, pinnedChats, favoriteChats, manualUnreadChats, deletedChats, archivedChats]);

  // WhatsApp Context Menu Handlers
  const togglePinChat = (convId, e) => {
    if (e) e.stopPropagation();
    const isPinned = pinnedChats.includes(convId);
    const next = isPinned ? pinnedChats.filter((id) => id !== convId) : [convId, ...pinnedChats];
    try {
      localStorage.setItem("surade_wa_pinned_chats", JSON.stringify(next));
    } catch { }
    setPinnedChats(next);
    toast.success(isPinned ? "Sematan chat dilepas" : "Chat berhasil disematkan");
    setActiveMenuConvId(null);
  };

  const toggleFavoriteChat = (convId, e) => {
    if (e) e.stopPropagation();
    const isFav = favoriteChats.includes(convId);
    const next = isFav ? favoriteChats.filter((id) => id !== convId) : [...favoriteChats, convId];
    try {
      localStorage.setItem("surade_wa_fav_chats", JSON.stringify(next));
    } catch { }
    setFavoriteChats(next);
    toast.success(isFav ? "Dihapus dari favorit" : "Ditambahkan ke favorit");
    setActiveMenuConvId(null);
  };

  const toggleManualUnread = (convId, e) => {
    if (e) e.stopPropagation();
    const isUnread = manualUnreadChats.includes(convId);
    const next = isUnread ? manualUnreadChats.filter((id) => id !== convId) : [...manualUnreadChats, convId];
    try {
      localStorage.setItem("surade_wa_manual_unread", JSON.stringify(next));
    } catch { }
    setManualUnreadChats(next);
    toast.success(isUnread ? "Ditandai sudah dibaca" : "Ditandai belum dibaca");
    setActiveMenuConvId(null);
  };

  const toggleArchiveChat = (convId, e) => {
    if (e) e.stopPropagation();
    const isArchived = archivedChats.includes(convId);
    const next = isArchived ? archivedChats.filter((id) => id !== convId) : [...archivedChats, convId];
    try {
      localStorage.setItem("surade_wa_archived_chats", JSON.stringify(next));
    } catch { }
    setArchivedChats(next);
    toast.success(isArchived ? "Obrolan dikeluarkan dari arsip" : "Obrolan berhasil diarsipkan");
    setActiveMenuConvId(null);
  };

  const toggleMuteChat = (convId, e) => {
    if (e) e.stopPropagation();
    const isMuted = mutedChats.includes(convId);
    const next = isMuted ? mutedChats.filter((id) => id !== convId) : [...mutedChats, convId];
    try {
      localStorage.setItem("surade_wa_muted_chats", JSON.stringify(next));
    } catch { }
    setMutedChats(next);
    toast.success(isMuted ? "Notifikasi dibunyikan" : "Notifikasi dibisukan");
    setActiveMenuConvId(null);
  };

  const clearChatHistory = (convId, e) => {
    if (e) e.stopPropagation();
    const now = new Date().toISOString();
    const next = { ...clearedChats, [convId]: now };
    try {
      localStorage.setItem("surade_wa_cleared_chats", JSON.stringify(next));
    } catch { }
    setClearedChats(next);
    if (String(activeConversationId) === String(convId)) {
      setActiveChatData((prev) => (prev ? { ...prev, messages: [] } : prev));
      if (chatMessagesCacheRef.current[convId]) {
        chatMessagesCacheRef.current[convId] = [];
      }
    }
    toast.success("Riwayat obrolan dibersihkan");
    setActiveMenuConvId(null);
  };

  const deleteConversation = (convId, e) => {
    if (e) e.stopPropagation();
    const next = [...new Set([...deletedChats, convId])];
    try {
      localStorage.setItem("surade_wa_deleted_chats", JSON.stringify(next));
    } catch { }
    setDeletedChats(next);
    if (String(activeConversationId) === String(convId)) {
      setActiveConversationId(null);
      setActiveChatData(null);
      navigate("/dashboard?tab=inbox", { replace: true });
    }
    toast.success("Obrolan berhasil dihapus");
    setActiveMenuConvId(null);
  };

  // WhatsApp Message Checkmarks (c1 = 1 abu, c2 = 2 abu, dibaca = 2 biru #53bdeb)
  const renderMessageTicks = (msg, isMine) => {
    if (!isMine) return null;

    // c1: sending / pending
    if (msg.status === "sending" || String(msg.id).startsWith("temp-")) {
      return (
        <span title="c1 - Terkirim ke server" className="inline-flex items-center text-slate-400">
          <Check size={14} className="stroke-[2.5]" />
        </span>
      );
    }

    // Dibaca: read by recipient (centang dua biru)
    if (msg.is_read || msg.read_at || msg.status === "read") {
      return (
        <span title="Dibaca oleh penerima" className="inline-flex items-center text-[#53bdeb]">
          <CheckCheck size={15} className="stroke-[2.5]" />
        </span>
      );
    }

    // c2: delivered to recipient device (centang dua abu-abu)
    return (
      <span title="c2 - Diterima penerima" className="inline-flex items-center text-slate-400">
        <CheckCheck size={15} className="stroke-[2.5]" />
      </span>
    );
  };

  // Parse Reply from message if formatted as [Balas Sender: "Snippet"]
  const parseReplyInMessage = (text) => {
    if (!text) return { replySender: null, replyText: null, bodyText: "" };
    const match = text.match(/^\[(?:Balas|Membalas)\s+([^:]+):\s*"([^"]*)"\]\n?([\s\S]*)$/);
    if (match) {
      return {
        replySender: match[1],
        replyText: match[2],
        bodyText: match[3],
      };
    }
    return { replySender: null, replyText: null, bodyText: text };
  };

  // WhatsApp Date Badges for grouping
  const getMessageDateBadge = (dateString) => {
    if (!dateString) return "HARI INI";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "HARI INI";
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return "HARI INI";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return "KEMARIN";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).toUpperCase();
  };

  // Active messages considering cleared chat cutoffs
  const activeConversationMessages = useMemo(() => {
    if (!activeChatData?.messages) return [];
    const clearCutoff = clearedChats[activeConversationId];
    if (!clearCutoff) return activeChatData.messages;
    const cutoffTime = new Date(clearCutoff).getTime();
    return activeChatData.messages.filter((m) => new Date(m.created_at).getTime() > cutoffTime);
  }, [activeChatData?.messages, activeConversationId, clearedChats]);

  const formatChatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Kemarin " + date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to detect forbidden links, social media, phone numbers, and disguised contacts
  const containsDisguisedPhoneNumberOrWA = (text) => {
    return detectForbiddenChatContent(text);
  };

  // True Optimistic UI Message Sender (Text & Emoji with quote reply support)
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    const hasText = chatMessageInput.trim().length > 0;
    if (!hasText || !activeConversationId || sendingChatMessage) return;

    if (detectForbiddenChatContent(chatMessageInput)) {
      toast.error(
        "Pesan tidak dapat dikirim karena mengandung link atau kontak media sosial.",
        { duration: 5000, id: "chat-forbidden-blocked" }
      );
      return;
    }

    let messageText = chatMessageInput.trim();
    if (replyingTo && messageText) {
      messageText = `[Balas ${replyingTo.senderName}: "${replyingTo.text.slice(0, 60)}${replyingTo.text.length > 60 ? "..." : ""}"]\n${messageText}`;
    }

    const tempId = "temp-" + Date.now();
    setChatMessageInput("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setSendingChatMessage(true);

    const optimisticMessage = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: user.id,
      sender_name: user.name || user.username || "Saya",
      message: messageText,
      image_url: null,
      message_type: "text",
      status: "sending",
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        name: user.name || user.username || "Saya",
        avatar: user.avatar,
      },
    };

    // 1. Instantly append to state & cache (0ms delay)
    setActiveChatData((prev) => {
      if (!prev) return prev;
      const updatedMessages = [...(prev.messages || []), optimisticMessage];
      chatMessagesCacheRef.current[activeConversationId] = updatedMessages;
      return { ...prev, messages: updatedMessages };
    });

    // 2. Instantly update conversation preview locally
    setConversations((prev) =>
      prev.map((c) =>
        String(c.id) === String(activeConversationId) || String(c.conversation_id) === String(activeConversationId)
          ? { ...c, last_message: messageText, last_message_at: new Date().toISOString() }
          : c
      )
    );

    // 3. Asynchronously post message to backend
    try {
      const res = await api.post(`/inbox/${activeConversationId}/messages`, { message: messageText });

      if (res.data && res.data.success) {
        const savedMessage = { ...res.data.data, status: "sent" };
        setActiveChatData((prev) => {
          if (!prev) return prev;
          const updatedMessages = (prev.messages || []).map((m) =>
            m.id === tempId ? savedMessage : m
          );
          chatMessagesCacheRef.current[activeConversationId] = updatedMessages;
          return { ...prev, messages: updatedMessages };
        });
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
      const serverErr =
        err.response?.data?.message ||
        "Pesan tidak dapat dikirim karena mengandung link atau kontak media sosial.";
      toast.error(serverErr, { duration: 5000, id: "chat-send-error" });
      setActiveChatData((prev) => {
        if (!prev) return prev;
        const updatedMessages = (prev.messages || []).map((m) =>
          m.id === tempId ? { ...m, status: "failed" } : m
        );
        chatMessagesCacheRef.current[activeConversationId] = updatedMessages;
        return { ...prev, messages: updatedMessages };
      });
    } finally {
      setSendingChatMessage(false);
    }
  };

  // Handle selecting image from file input
  const handleChatImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      return;
    }
    setChatImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setChatImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected
    if (chatImageInputRef.current) chatImageInputRef.current.value = "";
  };

  // Cancel selected image
  const cancelChatImage = () => {
    setChatImageFile(null);
    setChatImagePreview(null);
  };

  // States for Premium Upgrade Wizard (similar to AddBusiness flow)
  const [premiumPlans, setPremiumPlans] = useState([]);
  const [loadingPremiumPlans, setLoadingPremiumPlans] = useState(false);
  const [premiumStep, setPremiumStep] = useState(1); // 1: Pilih Bisnis & Paket, 2: Ringkasan & Kupon/Referral, 3: Metode Bayar, 4: Upload Bukti & Konfirmasi, 5: Sukses
  const [selectedUpgradeBusiness, setSelectedUpgradeBusiness] = useState("");
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);

  // Coupon
  const [upgradeCouponInput, setUpgradeCouponInput] = useState("");
  const [upgradeCouponLoading, setUpgradeCouponLoading] = useState(false);
  const [upgradeCouponError, setUpgradeCouponError] = useState("");
  const [upgradeCouponSuccessMsg, setUpgradeCouponSuccessMsg] = useState("");
  const [appliedUpgradeCoupon, setAppliedUpgradeCoupon] = useState(null);

  // Referral (5% discount)
  const [upgradeReferralInput, setUpgradeReferralInput] = useState("");
  const [upgradeReferralLoading, setUpgradeReferralLoading] = useState(false);
  const [upgradeReferralError, setUpgradeReferralError] = useState("");
  const [upgradeReferralSuccessMsg, setUpgradeReferralSuccessMsg] = useState("");
  const [appliedUpgradeReferral, setAppliedUpgradeReferral] = useState(null);

  // Payment method & Proof
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState("DANA");
  const [upgradeProofFile, setUpgradeProofFile] = useState(null);
  const [upgradeProofPreview, setUpgradeProofPreview] = useState(null);
  const [existingUpgradeProof, setExistingUpgradeProof] = useState(null);
  const [isUpgradeResubmit, setIsUpgradeResubmit] = useState(false);
  const [upgradeRejectionReason, setUpgradeRejectionReason] = useState("");
  const [copiedUpgradeAccount, setCopiedUpgradeAccount] = useState(false);
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");
  const [upgradeSuccessData, setUpgradeSuccessData] = useState(null);
  const upgradeProofInputRef = useRef(null);

  // Coupon application logic for Upgrade
  const handleApplyUpgradeCoupon = async () => {
    if (!upgradeCouponInput.trim()) {
      setUpgradeCouponError("Masukkan kode kupon terlebih dahulu.");
      return;
    }
    setUpgradeCouponLoading(true);
    setUpgradeCouponError("");
    setUpgradeCouponSuccessMsg("");
    const planPrice = Number(selectedUpgradePlan?.price || 0);
    try {
      const res = await api.post("/coupons/validate", {
        code: upgradeCouponInput.trim(),
        product_type: "premium",
        amount: planPrice,
        user_id: user?.id,
      });
      if (res.data?.valid) {
        setAppliedUpgradeCoupon(res.data);
        setUpgradeCouponSuccessMsg(res.data.message || "Kupon berhasil diterapkan!");
      } else {
        setAppliedUpgradeCoupon(null);
        setUpgradeCouponError(res.data?.message || "Kode kupon tidak valid atau sudah tidak berlaku.");
      }
    } catch (e) {
      setAppliedUpgradeCoupon(null);
      setUpgradeCouponError(e?.response?.data?.message || "Kode kupon tidak valid atau sudah tidak berlaku.");
    } finally {
      setUpgradeCouponLoading(false);
    }
  };

  const handleRemoveUpgradeCoupon = () => {
    setAppliedUpgradeCoupon(null);
    setUpgradeCouponInput("");
    setUpgradeCouponSuccessMsg("");
    setUpgradeCouponError("");
  };

  // Referral application logic for Upgrade (Premium Only - 5% discount)
  const handleApplyUpgradeReferral = async () => {
    if (!upgradeReferralInput.trim()) {
      setUpgradeReferralError("Masukkan kode referral terlebih dahulu.");
      return;
    }
    setUpgradeReferralLoading(true);
    setUpgradeReferralError("");
    setUpgradeReferralSuccessMsg("");
    const planPrice = Number(selectedUpgradePlan?.price || 0);
    try {
      const res = await api.post("/referrals/validate", {
        code: upgradeReferralInput.trim(),
        product_type: "premium",
        amount: planPrice,
      });
      if (res.data?.valid) {
        setAppliedUpgradeReferral(res.data);
        setUpgradeReferralSuccessMsg(res.data.message || "Kode referral valid! Diskon 10% berhasil diterapkan.");
      } else {
        setAppliedUpgradeReferral(null);
        setUpgradeReferralError(res.data?.message || "Kode referral tidak valid.");
      }
    } catch (e) {
      setAppliedUpgradeReferral(null);
      setUpgradeReferralError(e?.response?.data?.message || "Kode referral hanya berlaku untuk pembelian paket Premium.");
    } finally {
      setUpgradeReferralLoading(false);
    }
  };

  const handleRemoveUpgradeReferral = () => {
    setAppliedUpgradeReferral(null);
    setUpgradeReferralInput("");
    setUpgradeReferralSuccessMsg("");
    setUpgradeReferralError("");
  };

  // Calculate Upgrade prices
  const calculateUpgradePrice = () => {
    const basePrice = Number(selectedUpgradePlan?.price || 0);
    let couponDiscount = 0;
    if (appliedUpgradeCoupon) {
      if (appliedUpgradeCoupon.discount_amount != null) {
        couponDiscount = Number(appliedUpgradeCoupon.discount_amount);
      } else if (appliedUpgradeCoupon.discount_type === 'percentage') {
        couponDiscount = (basePrice * Number(appliedUpgradeCoupon.discount_value)) / 100;
      } else if (appliedUpgradeCoupon.discount_value) {
        couponDiscount = Number(appliedUpgradeCoupon.discount_value);
      }
    }

    let referralDiscount = 0;
    if (appliedUpgradeReferral) {
      if (appliedUpgradeReferral.discount_amount != null) {
        referralDiscount = Number(appliedUpgradeReferral.discount_amount);
      } else {
        referralDiscount = Math.round(basePrice * 0.05);
      }
    }

    const finalPrice = Math.max(0, basePrice - couponDiscount - referralDiscount);
    return {
      basePrice,
      couponDiscount,
      referralDiscount,
      finalPrice
    };
  };

  const handleUpgradeProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUpgradeError("Ukuran file bukti pembayaran maksimal 5MB.");
        return;
      }
      setUpgradeProofFile(file);
      setUpgradeProofPreview(URL.createObjectURL(file));
      setUpgradeError("");
    }
  };

  const handleRemoveUpgradeProof = () => {
    setUpgradeProofFile(null);
    if (upgradeProofPreview) URL.revokeObjectURL(upgradeProofPreview);
    setUpgradeProofPreview(null);
  };

  // Submit Upgrade to Premium
  const handleSubmitUpgrade = async () => {
    const targetBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
    if (!targetBizId) {
      setUpgradeError("Silakan pilih usaha yang ingin di-upgrade terlebih dahulu.");
      return;
    }
    if (!selectedUpgradePlan) {
      setUpgradeError("Silakan pilih paket premium terlebih dahulu.");
      return;
    }

    const isMidtrans = String(upgradePaymentMethod || "").toLowerCase().includes("midtrans");

    if (!isUpgradeResubmit && !upgradeProofFile && !isMidtrans) {
      setUpgradeError("Wajib mengunggah bukti pembayaran sebelum mengirim permohonan.");
      return;
    }

    setSubmittingUpgrade(true);
    setUpgradeError("");

    if (isMidtrans && !isUpgradeResubmit) {
      try {
        const calculatePrice = calculateUpgradePrice();
        const res = await api.post("/payment/midtrans/create", {
          business_id: targetBizId,
          plan: selectedUpgradePlan.id || selectedUpgradePlan.name,
          plan_id: selectedUpgradePlan.id,
          referral_code: appliedUpgradeReferral?.referral_code || "",
          coupon_code: appliedUpgradeCoupon?.code || "",
          discount: calculatePrice.discountAmount,
          amount: calculatePrice.finalPrice
        });

        const resData = res.data?.data || res.data;

        if (resData?.snap_token) {
          const triggerSnapPay = (token) => {
            if (!window.snap) return false;
            window.snap.pay(token, {
              onSuccess: async function (result) {
                // console.log("Midtrans payment success:", result);
                try {
                  await api.post("/payment/midtrans/finish", {
                    order_id: result?.order_id || resData.order_id,
                    subscription_id: resData.subscription_id,
                    transaction_status: result?.transaction_status || "settlement"
                  });
                } catch (e) { }
                alert("Pembayaran Berhasil! Paket Premium Anda telah aktif.");
                fetchBusinesses();
                setPremiumStep(5);
              },
              onPending: function (result) {
                alert("Pembayaran sedang diproses. Silakan bayar melalui QRIS / Bank di Midtrans Snap.");
              },
              onError: function (result) {
                setUpgradeError("Pembayaran Gagal via Midtrans. Silakan coba lagi.");
              },
              onClose: function () {
                // console.log("Midtrans popup closed");
              }
            });
            return true;
          };

          if (window.snap) {
            triggerSnapPay(resData.snap_token);
          } else {
            const clientKey = resData.client_key || import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "Mid-client-rOpZcxkOmIfQUXfR";
            const isProd = resData.is_production !== undefined ? resData.is_production : !clientKey.startsWith("SB-");
            const snapJsUrl = isProd ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";

            const script = document.createElement("script");
            script.src = snapJsUrl;
            script.setAttribute("data-client-key", clientKey);
            script.onload = () => triggerSnapPay(resData.snap_token);
            document.head.appendChild(script);
          }
          setSubmittingUpgrade(false);
          return;
        } else {
          setUpgradeError(resData?.message || "Gagal mendapatkan token Midtrans.");
        }
      } catch (err) {
        console.error("Midtrans upgrade error:", err);
        setUpgradeError(err.response?.data?.message || "Gagal membuka pembayaran Midtrans.");
      } finally {
        setSubmittingUpgrade(false);
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append("business_id", targetBizId);
      formData.append("plan_id", selectedUpgradePlan.id);
      if (isUpgradeResubmit) {
        formData.append("resubmit", "1");
      }
      if (appliedUpgradeCoupon?.code && !isUpgradeResubmit) {
        formData.append("coupon_code", appliedUpgradeCoupon.code);
      }
      if (appliedUpgradeReferral?.referral_code && !isUpgradeResubmit) {
        formData.append("referral_code", appliedUpgradeReferral.referral_code);
      }
      formData.append("payment_method", isUpgradeResubmit ? "Revisi Bukti Pembayaran" : upgradePaymentMethod);
      if (upgradeProofFile) {
        formData.append("proof", upgradeProofFile);
      }

      const res = await api.post("/subscriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const bizObj = businesses.find(b => String(b.id) === String(targetBizId));
      setUpgradeSuccessData({
        businessName: bizObj?.name || "Usaha Anda",
        planName: selectedUpgradePlan.name,
        finalPrice: isUpgradeResubmit ? 0 : calculateUpgradePrice().finalPrice,
        paymentMethod: isUpgradeResubmit ? "Revisi Bukti Pembayaran" : upgradePaymentMethod,
        submittedAt: new Date().toLocaleString("id-ID"),
        message: res.data?.message || (isUpgradeResubmit ? "Revisi bukti pembayaran premium berhasil diajukan ulang!" : "Permohonan upgrade premium berhasil diajukan!")
      });
      setPremiumStep(5);
      setIsUpgradeResubmit(false);
      fetchBusinesses();
    } catch (err) {
      console.error("Failed to submit upgrade:", err);
      setUpgradeError(err.response?.data?.message || "Gagal mengajukan upgrade. Silakan periksa kembali file bukti transfer Anda.");
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  const handleResetUpgrade = () => {
    setPremiumStep(1);
    setIsUpgradeResubmit(false);
    setExistingUpgradeProof(null);
    setUpgradeRejectionReason("");
    setSelectedUpgradePlan(null);
    setUpgradeCouponInput("");
    setAppliedUpgradeCoupon(null);
    setUpgradeCouponSuccessMsg("");
    setUpgradeCouponError("");
    setUpgradeReferralInput("");
    setAppliedUpgradeReferral(null);
    setUpgradeReferralSuccessMsg("");
    setUpgradeReferralError("");
    setUpgradeProofFile(null);
    if (upgradeProofPreview) URL.revokeObjectURL(upgradeProofPreview);
    setUpgradeProofPreview(null);
    setUpgradeError("");
    setUpgradeSuccessData(null);
  };

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

  // States for user dashboard statistics & Poin balance from database
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [scoinBalance, setPoinBalance] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Number(u?.scoin_balance || u?.coins || 0);
    } catch {
      return 0;
    }
  });
  const [silverBalance, setSilverBalance] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Number(u?.silver_balance || 0);
    } catch {
      return 0;
    }
  });
  const [goldBalance, setGoldBalance] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return Number(u?.gold_balance || 0);
    } catch {
      return 0;
    }
  });

  const [showGoldWithdrawModal, setShowGoldWithdrawModal] = useState(false);

  const fetchHeaderPoinBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await api.get("/coins/balance");
      if (res.data) {
        if (res.data.balance !== undefined) setPoinBalance(Number(res.data.balance) || 0);
        if (res.data.silver_balance !== undefined) setSilverBalance(Number(res.data.silver_balance) || 0);
        if (res.data.gold_balance !== undefined) setGoldBalance(Number(res.data.gold_balance) || 0);
      }
    } catch (err) {
      if (user?.scoin_balance !== undefined || user?.coins !== undefined) {
        setPoinBalance(Number(user.scoin_balance || user.coins || 0));
      }
    }
  };

  useEffect(() => {
    fetchHeaderPoinBalance();

    const handlePoinUpdate = (e) => {
      if (e?.detail) {
        if (e.detail.balance !== undefined) setPoinBalance(Number(e.detail.balance) || 0);
        if (e.detail.silver_balance !== undefined) setSilverBalance(Number(e.detail.silver_balance) || 0);
        if (e.detail.gold_balance !== undefined) setGoldBalance(Number(e.detail.gold_balance) || 0);
      }
      fetchHeaderPoinBalance();
    };

    window.addEventListener("poin-balance-updated", handlePoinUpdate);
    return () => window.removeEventListener("poin-balance-updated", handlePoinUpdate);
  }, []);

  useEffect(() => {
    if (user?.scoin_balance !== undefined || user?.coins !== undefined) {
      setPoinBalance(Number(user.scoin_balance || user.coins || 0));
    }
    if (user?.silver_balance !== undefined) setSilverBalance(Number(user.silver_balance) || 0);
    if (user?.gold_balance !== undefined) setGoldBalance(Number(user.gold_balance) || 0);
  }, [user]);

  // Cek jika URL memiliki query parameter untuk penarikan gold langsung dari mana saja
  useEffect(() => {
    const qWithdraw = searchParams.get("withdraw");
    const qTab = searchParams.get("tab");
    if (qWithdraw === "gold" || qWithdraw === "tunai") {
      setShowGoldWithdrawModal(true);
    }
  }, [searchParams]);

  const [showBuyCoinModal, setShowBuyCoinModal] = useState(false);

  // Direct instant upgrade using Poin
  const handleDirectUpgradeWithPoin = async (plan) => {
    const targetBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
    if (!targetBizId) {
      toast.error("Silakan pilih usaha yang ingin di-upgrade terlebih dahulu.");
      return;
    }

    const durationDays = Number(plan?.duration_days || (plan?.duration_value ? plan.duration_value * 30 : 30));
    const isYear = durationDays >= 300 || plan?.name?.toLowerCase().includes("tahun") || plan?.name?.toLowerCase().includes("yearly");
    const isQuarter = durationDays >= 75 || plan?.name?.toLowerCase().includes("90") || plan?.name?.toLowerCase().includes("3 bulan");
    const serviceCode = isYear ? "business_premium_365" : isQuarter ? "business_premium_90" : "business_premium_30";

    const basePlanPrice = Number(plan?.price || 0);
    const couponDiscount = appliedUpgradeCoupon ? Number(appliedUpgradeCoupon.discount_amount || appliedUpgradeCoupon.discount || 0) : 0;
    const refDiscount = appliedUpgradeReferral ? Number(appliedUpgradeReferral.discount_amount || appliedUpgradeReferral.discount || 0) : 0;
    const finalPrice = Math.max(0, basePlanPrice - (couponDiscount + refDiscount));

    const fallbackCost = isYear ? 250 : isQuarter ? 90 : 35;
    const baseCost = basePlanPrice > 0 ? Math.max(1, Math.round(basePlanPrice / 1000)) : fallbackCost;
    const coinCost = (couponDiscount > 0 || refDiscount > 0)
      ? Math.max(0, Math.round(finalPrice / 1000))
      : baseCost;

    if (scoinBalance !== null && scoinBalance < coinCost) {
      setShowBuyCoinModal(true);
      toast.error(`Saldo Poin Anda (${scoinBalance || 0} Poin) tidak cukup. Butuh ${coinCost} Poin.`);
      return;
    }

    setSubmittingUpgrade(true);
    try {
      const res = await api.post("/coins/pay-service", {
        service_code: serviceCode,
        plan_id: plan?.id,
        business_id: targetBizId,
        referral_code: appliedUpgradeReferral?.code || appliedUpgradeReferral?.referral_code || null,
        coupon_code: appliedUpgradeCoupon?.code || null,
      });

      if (res.data?.success) {
        toast.success(`Selamat! Usaha Anda berhasil di-upgrade ke Premium (${coinCost} Poin) secara instan!`);
        fetchHeaderPoinBalance();
        await fetchBusinesses();
      } else {
        toast.error(res.data?.message || "Gagal melakukan upgrade dengan Poin.");
      }
    } catch (err) {
      console.error("Failed to upgrade with coin:", err);
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat upgrade dengan Poin.");
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  // Direct instant ad creation / payment using 25 Poin
  const handleAdSubmitWithPoin = async () => {
    if (submittingAd) return;
    if (!selectedBusinessForAd) {
      toast.error("Pilih usaha yang ingin diiklankan terlebih dahulu.");
      return;
    }
    const pkgObj = getSelectedPackageObj();
    const basePrice = pkgObj?.price ? Number(pkgObj.price) : (typeof getSelectedPackagePrice === 'function' ? getSelectedPackagePrice() : 25000);
    const couponDiscount = appliedCouponInfo ? Number(appliedCouponInfo.discount_amount || 0) : 0;
    const refDiscount = getAdReferralDiscount();
    const totalDiscount = Math.min(basePrice, couponDiscount + refDiscount);
    const finalPrice = Math.max(0, basePrice - totalDiscount);
    const adCoinCost = Math.max(0, Math.round(finalPrice / 1000));

    if (scoinBalance !== null && scoinBalance < adCoinCost) {
      setShowBuyCoinModal(true);
      toast.error(`Saldo Poin Anda (${scoinBalance || 0} Poin) tidak cukup. Butuh ${adCoinCost} Poin untuk pasang iklan.`);
      return;
    }

    setSubmittingAd(true);
    try {
      let adId = createdAdDraftId;
      if (!adId) {
        const formData = new FormData();
        formData.append("business_id", selectedBusinessForAd);
        const selBizForAd = getSelectedBusinessObj();
        if (selBizForAd?.name) {
          formData.append("name", selBizForAd.name);
        }
        if (pkgObj && pkgObj.id) {
          formData.append("ad_package_id", pkgObj.id);
          formData.append("package_name", pkgObj.name);
          if (pkgObj.duration_days) {
            formData.append("duration_days", pkgObj.duration_days);
          }
        } else {
          formData.append("package_name", typeof selectedPackage === "string" ? selectedPackage : "Standard Iklan");
        }
        formData.append("price", finalPrice);
        formData.append("original_price", basePrice);
        if (appliedCouponInfo) {
          formData.append("coupon_code", appliedCouponInfo.code);
          formData.append("discount_amount", discount);
        }
        if (adAppliedReferralInfo && adAppliedReferralInfo.code) {
          formData.append("referral_code", adAppliedReferralInfo.code);
        }
        formData.append("payment_method", `Poin Surade (${adCoinCost} Poin)`);
        if (adNotes) formData.append("notes", adNotes);

        const res = await api.post("/advertisements", formData);
        adId = res.data?.advertisement?.id || res.data?.data?.id || res.data?.id;
      }

      if (!adId) {
        toast.error("Gagal membuat pengajuan iklan.");
        setSubmittingAd(false);
        return;
      }

      const coinRes = await api.post("/coins/pay-service", {
        service_code: "ad_package_banner",
        advertisement_id: adId,
        coupon_code: appliedCouponInfo?.code || null,
        referral_code: adAppliedReferralInfo?.code || null,
      });

      if (coinRes.data?.success) {
        toast.success(`Iklan berhasil diaktifkan secara instan menggunakan ${adCoinCost} Poin!`);
        fetchHeaderPoinBalance();
        setShowCreateAdModal(false);
        setCreatedAdDraftId(null);
        setCreateAdStep(1);
        setSelectedBusinessForAd(null);
        setSelectedPackage(null);
        setAdNotes("");
        setCouponCodeInput("");
        setAppliedCouponInfo(null);
        setCouponMsg("");
        restoreAdReferralFromGlobal();
        setAdPaymentProofFile(null);
        setAdPaymentProofPreview(null);
        await fetchAdvertisements();
      } else {
        toast.error(coinRes.data?.message || "Gagal melakukan pembayaran iklan dengan Poin.");
      }
    } catch (err) {
      console.error("Poin ad submit error:", err);
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran iklan dengan Poin.");
    } finally {
      setSubmittingAd(false);
    }
  };

  // Direct instant payment with dynamic Poin for rejected / unpaid ad
  const handlePayResubmitWithPoin = async (adId, requiredCost = 25) => {
    if (!adId) return;
    if (scoinBalance !== null && scoinBalance < requiredCost) {
      setShowBuyCoinModal(true);
      toast.error(`Saldo Poin Anda (${scoinBalance || 0} Poin) tidak cukup. Butuh ${requiredCost} Poin.`);
      return;
    }

    try {
      const res = await api.post("/coins/pay-service", {
        service_code: "ad_package_banner",
        advertisement_id: adId,
      });

      if (res.data?.success) {
        toast.success(`Iklan berhasil diaktifkan kembali secara instan dengan ${requiredCost} Poin!`);
        fetchHeaderPoinBalance();
        setResubmittingAd(null);
        await fetchAdvertisements();
      } else {
        toast.error(res.data?.message || "Gagal membayar iklan dengan Poin.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membayar dengan Poin.");
    }
  };

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

  // Helper to format activity dates cleanly (avoiding raw ISO timestamp strings)
  const formatActivityDate = (raw) => {
    if (!raw) return "Hari ini";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return String(raw);
    }
  };

  // Dynamic Recent Activities based on real User content (Businesses, Blogs, Events, Reviews)
  // Only shows completed/approved/published activities so unfinished/pending items are excluded
  const recentActivitiesList = useMemo(() => {
    const list = [];

    // Businesses (Hanya usaha yang sudah beres / aktif terverifikasi)
    (businesses || []).forEach((b) => {
      const isApproved = b.status === "approved" || b.status === "active" || b.is_active;
      if (!isApproved) return;

      const rawTime = b.created_at || b.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 1800000;

      list.push({
        id: `biz-${b.id}`,
        type: "business",
        typeName: "Usaha",
        title: `Usaha "${b.name}" aktif terverifikasi`,
        subText: `Kategori: ${b.category || "Usaha"}${b.subCategory ? " › " + b.subCategory : ""} • Status: Aktif`,
        dateStr: formatActivityDate(rawTime || b.date),
        timestamp: ts,
        icon: Briefcase,
        colorClass: "bg-[#eff6ff] text-[#3b82f6]",
        link: `/business/${b.id}`
      });
    });

    // Blogs (Hanya artikel yang sudah disetujui / dipublikasikan)
    (blogs || []).forEach((b) => {
      const isPublished = b.status === "published" || b.status === "approved" || b.is_published;
      if (!isPublished) return;

      const rawTime = b.created_at || b.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 3600000;

      list.push({
        id: `blog-${b.id}`,
        type: "blog",
        typeName: "Blog",
        title: `Artikel "${b.title}" dipublikasikan`,
        subText: `Kategori: ${b.category || "Umum"} • Status: Published`,
        dateStr: formatActivityDate(rawTime || b.date),
        timestamp: ts,
        icon: FileText,
        colorClass: "bg-[#f3e8ff] text-[#7e22ce]",
        link: `/blog/${b.id}`
      });
    });

    // Events (Hanya event yang sudah disetujui / dipublikasikan)
    (events || []).forEach((e) => {
      const isPublished = e.status === "published" || e.status === "approved" || e.is_published;
      if (!isPublished) return;

      const rawTime = e.created_at || e.raw_created_at;
      const ts = rawTime ? new Date(rawTime).getTime() : Date.now() - 5400000;

      list.push({
        id: `event-${e.id}`,
        type: "event",
        typeName: "Event",
        title: `Event "${e.title}" dipublikasikan`,
        subText: `Tanggal: ${formatActivityDate(e.date || rawTime)} • Status: Published`,
        dateStr: formatActivityDate(rawTime || e.date),
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
        dateStr: formatActivityDate(rawTime || r.date),
        timestamp: ts,
        icon: Star,
        colorClass: "bg-[#fef9c3] text-[#ca8a04]",
        tab: "ulasan"
      });
    });

    // Fallback default activities if user has no completed data yet
    if (list.length === 0) {
      list.push(
        {
          id: "sys-init-1",
          type: "business",
          typeName: "Bisnis",
          title: "Belum Ada Aktivitas Usaha",
          subText: "Mulai daftarkan usaha Anda menggunakan tombol 'Buat Usaha'",
          dateStr: "Hari ini",
          timestamp: Date.now() - 1000,
          icon: Briefcase,
          colorClass: "bg-emerald-50 text-emerald-600"
        },
        {
          id: "sys-init-2",
          type: "blog",
          typeName: "Portal",
          title: "Selamat datang di Surade.com",
          subText: "Pantau perkembangan kunjungan & ulasan usaha Anda di sini",
          dateStr: "Hari ini",
          timestamp: Date.now() - 5000,
          icon: FileText,
          colorClass: "bg-teal-50 text-teal-600"
        }
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [businesses, blogs, events, reviews]);

  // Dynamic Weekly Chart Data (Senin s/d Minggu) calculated directly for user's own businesses
  const weeklyChartStats = useMemo(() => {
    const daysOrder = [
      { key: 1, day: "Sen", fullDay: "Senin" },
      { key: 2, day: "Sel", fullDay: "Selasa" },
      { key: 3, day: "Rab", fullDay: "Rabu" },
      { key: 4, day: "Kam", fullDay: "Kamis" },
      { key: 5, day: "Jum", fullDay: "Jumat" },
      { key: 6, day: "Sab", fullDay: "Sabtu" },
      { key: 0, day: "Min", fullDay: "Minggu" },
    ];

    const backendWeeklyData = userStats?.weekly_chart_data || [];
    const totalBizViews = Number(userStats?.total_business_views ?? (businesses || []).reduce((acc, b) => acc + Number(b.raw?.views || b.views || 0), 0));

    // Cek apakah data dari backend sudah memiliki visits > 0
    const hasBackendVisits = backendWeeklyData.some(item => Number(item.visits || 0) > 0);

    const chartData = daysOrder.map((d, index) => {
      const found = backendWeeklyData.find((item) => item.key === d.key || item.day === d.day);
      let visits = found ? Number(found.visits || 0) : 0;

      // Distribusi proporsional jika total views bisnis ada tapi log harian masih 0
      if (!hasBackendVisits && totalBizViews > 0) {
        const weights = [0.08, 0.52, 0.18, 0.10, 0.06, 0.04, 0.02];
        visits = Math.max(Math.round((totalBizViews % 600 + 60) * weights[index]), 1);
      }

      return {
        ...d,
        fullDate: found?.full_date || d.fullDay,
        label: found?.label || d.day,
        isToday: found ? Boolean(found.is_today) : (new Date().getDay() === d.key),
        visits
      };
    });

    const maxVisits = Math.max(...chartData.map(d => d.visits), 1);
    const totalVisits = chartData.reduce((acc, curr) => acc + curr.visits, 0);
    const avgVisits = Math.round(totalVisits / 7);
    const busiestDay = [...chartData].sort((a, b) => b.visits - a.visits)[0];

    return {
      chartData: chartData.map(d => ({
        ...d,
        heightPercentage: maxVisits > 0 && d.visits > 0 ? `${Math.max(Math.round((d.visits / maxVisits) * 100), 10)}%` : "6%"
      })),
      totalVisits: totalBizViews > 0 ? totalBizViews : totalVisits,
      avgVisits,
      busiestDay,
      maxVisits
    };
  }, [userStats, businesses]);

  // Backward compatibility alias for monthlyChartStats
  const monthlyChartStats = weeklyChartStats;

  // Fetch active Premium Plans from API (Created/updated by AdminWeb)
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

  // Fetch businesses from API (only user's own businesses)
  const fetchBusinesses = async () => {
    // Force clear cache
    try {
      localStorage.removeItem("cached_my_businesses");
      // console.log('[AdminUser] Cleared businesses cache');
    } catch (e) { }

    setLoadingBusinesses(true);
    setBusinessFetchError(null);
    try {
      // console.log("Fetching businesses...");
      // Add timestamp to bypass cache
      const res = await api.get(`/my-businesses?_t=${Date.now()}`);
      // console.log("Businesses API response:", res.data);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      // console.log("Businesses list:", list);
      if (Array.isArray(list)) {
        const mapped = list.map(b => {
          // Extract main category and subcategory
          const mainCategory = b.category?.parent || b.category;
          const subCategory = b.category?.parent ? b.category : null;
          const categoryName = mainCategory?.name || b.category?.name || "Umum";
          const subCategoryName = subCategory?.name || null;
          const rawImg = b.logo || b.image || b.banner || (Array.isArray(b.banners) && b.banners[0]) || (Array.isArray(b.gallery) && b.gallery[0]) || b.thumbnail;
          const imageUrl = rawImg ? getStorageUrl(rawImg) : null;

          return {
            id: b.id,
            name: b.name,
            category: categoryName,
            subCategory: subCategoryName,
            city: b.city || b.address || "Indonesia",
            rating: Number(b.rating || b.average_rating || 0),
            reviews_count: Number(b.reviews_count || b.ratings_count || (Array.isArray(b.reviews) ? b.reviews.length : 0) || 0),
            owner: b.user?.name || b.owner?.name || b.author || displayName || profileData?.name || "Saya",
            status: b.status || "active",
            is_premium: !Boolean(
              (b.premium_expires_at && new Date(b.premium_expires_at) <= new Date()) ||
              (b.raw?.premium_expires_at && new Date(b.raw.premium_expires_at) <= new Date())
            ) && Boolean(b.is_premium),
            premium_expires_at: b.premium_expires_at || b.raw?.premium_expires_at || null,
            rejection_reason: b.rejection_reason,
            subscriptions: b.subscriptions || [],
            image: imageUrl,
            created_at: b.created_at,
            date: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-",
            products: b.products || [],
            opening_hours: formatBizOpeningHours(b),
            opening_days: b.opening_days || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
            raw: b
          };
        });
        // console.log("Mapped businesses:", mapped);
        setBusinesses(mapped);
        if (mapped.length > 0) {
          setSelectedBusinessForProducts((prev) => {
            if (prev && mapped.some(b => String(b.id) === String(prev))) return prev;
            return mapped[0].id;
          });
        }
        try {
          localStorage.setItem("cached_my_businesses", JSON.stringify(mapped));
        } catch (e) { }
      } else {
        console.warn("Businesses data is not an array:", data);
        setBusinesses([]);
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      setBusinessFetchError("Gagal memuat data usaha. Silakan periksa koneksi atau coba beberapa saat lagi.");
      setBusinesses([]);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  // Fetch advertisements from API (with fallback to public active website ads)
  const fetchAdvertisements = async () => {
    setLoadingAdvertisements(true);
    try {
      let res = await api.get("/my-advertisements");
      let data = res.data?.data || res.data || [];
      let list = Array.isArray(data) ? data : (data?.data || []);


      setAdvertisements(list);
      setAdStats({
        total_ads: list.length,
        active_ads: list.filter(a => (a.computed_status || a.status) === 'active' || (a.computed_status || a.status) === 'approved').length,
        pending_payment: list.filter(a => (a.computed_status || a.payment_status) === 'pending_payment' || a.payment_status === 'unpaid').length,
        waiting_approval: list.filter(a => (a.computed_status || a.payment_status) === 'waiting_approval' || (a.payment_status === 'pending' && a.status === 'pending')).length,
        expired_ads: list.filter(a => (a.computed_status || a.status) === 'expired').length,
        rejected_ads: list.filter(a => (a.computed_status || a.status) === 'rejected').length,
        total_spending: list.filter(a => a.payment_status === 'paid' || a.status === 'approved').reduce((acc, curr) => acc + Number(curr.price || 0), 0)
      });
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

  // Fetch available public coupons for advertising
  const fetchAvailableCoupons = async () => {
    setAvailableCouponsLoading(true);
    try {
      const res = await api.get('/coupons/public-codes');
      const list = res.data?.data || res.data || [];
      const filtered = Array.isArray(list)
        ? list.filter(c => !c.applies_to || c.applies_to === 'all' || c.applies_to === 'ads')
        : [];
      setAvailableCoupons(filtered);
    } catch (err) {
      console.error('Failed to fetch public coupons:', err);
    } finally {
      setAvailableCouponsLoading(false);
    }
  };

  // Fetch saved items (business favorites & blog/event favorites) from API
  const fetchSavedItems = async () => {
    setLoadingSavedItems(true);
    setSavedItemsError("");
    try {
      const [resBiz, resBlog] = await Promise.allSettled([
        api.get("/my-favorites"),
        api.get("/my-blog-favorites")
      ]);

      let mappedBiz = [];
      if (resBiz.status === "fulfilled" && resBiz.value.data) {
        const bizData = resBiz.value.data?.data || resBiz.value.data || [];
        const bizList = Array.isArray(bizData) ? bizData : (bizData?.data || []);
        mappedBiz = (Array.isArray(bizList) ? bizList : [])
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
      }

      let mappedBlogs = [];
      if (resBlog.status === "fulfilled" && resBlog.value.data) {
        const blogData = resBlog.value.data?.data || resBlog.value.data || [];
        const blogList = Array.isArray(blogData) ? blogData : (blogData?.data || []);
        mappedBlogs = (Array.isArray(blogList) ? blogList : [])
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
      }

      const combined = [...mappedBiz, ...mappedBlogs];
      setSavedItems(combined);
      try {
        localStorage.setItem("cached_saved_items", JSON.stringify(combined));
      } catch (e) { }
    } catch (err) {
      console.error("Failed to fetch saved items:", err);
      setSavedItemsError("Gagal memuat bookmark tersimpan.");
    } finally {
      setLoadingSavedItems(false);
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
        } catch (e) { }
        return updated;
      });
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to delete favorite:", err);
      setSavedItems(prev => prev.filter(i => !(i.id === item.id && i.itemType === item.itemType)));
    }
  };

  // Fetch blogs from API (only user's own blogs)
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
          status: b.status || "draft",
          rejection_reason: b.rejection_reason || null,
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

  // Fetch events from API (blogs with type=event)
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
          status: e.status || "draft",
          rejection_reason: e.rejection_reason || null,
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
        businessName: r.business?.name || r.business_name || 'Bisnis tidak diketahui',
        businessLogo: r.business?.logo_url
          ? r.business.logo_url
          : (r.business?.logo ? getStorageUrl(r.business.logo) : (r.business_logo ? getStorageUrl(r.business_logo) : null)),
        businessSlug: r.business?.slug || r.business_slug || '',
        user: typeof r.user === "object" ? (r.user?.name || "Pelanggan") : (r.user_name || r.user || "Pelanggan"),
        userAvatar: typeof r.user === "object" ? r.user?.avatar : (r.user_avatar || null),
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

  // Lazy Tab-based Data Loader (Prevents 7 parallel API requests on mount)
  useEffect(() => {
    // Clear stale non-essential caches on mount while preserving critical seller/business data
    try {
      const keys = Object.keys(localStorage);
      const userKeys = keys.filter(k => k.startsWith('cached_my_') && k !== 'cached_my_businesses');
      userKeys.forEach(key => localStorage.removeItem(key));
    } catch (e) { }

    const loadTabData = async () => {
      try {
        // Ensure businesses are loaded so seller status is immediately known
        if (businesses.length === 0) {
          fetchBusinesses();
        }

        if (activeTab === "dashboard") {
          await fetchUserStats();
          await fetchBusinesses();
          await fetchBlogs();
          await fetchEvents();
          await fetchMyRatings();
        } else if (activeTab === "coin") {
          await fetchBusinesses();
        } else if (activeTab === "bisnis") {
          await fetchBusinesses();
        } else if (activeTab === "paket-premium") {
          await fetchAdminPlans();
        } else if (activeTab === "iklan") {
          await fetchAdvertisements();
          await fetchAdPackages();
          await fetchBusinesses();
          await fetchAvailableCoupons();
        } else if (activeTab === "blog-event") {
          await fetchBlogs();
          await fetchEvents();
        } else if (activeTab === "simpan") {
          await fetchSavedItems();
        } else if (activeTab === "inbox") {
          await fetchConversationsList(conversations.length === 0);
        } else if (activeTab === "premium") {
          await fetchPremiumPlans();
          await fetchBusinesses();
        } else if (activeTab === "produk") {
          await fetchBusinesses();
        } else if (activeTab === "ulasan") {
          await fetchMyRatings();
        } else if (activeTab === "whatsapp") {
          await fetchUserWaLogs();
        } else if (activeTab === "klaim") {
          await fetchUserClaims();
        } else if (activeTab === "referral" || activeTab === "reseller") {
          await fetchReferralStats();
        }
      } catch (e) {
        console.warn("Tab data load partial failure:", e);
      }
    };
    loadTabData();
  }, [activeTab]);

  // Listen to bookmark changes globally
  useEffect(() => {
    const handleBookmarkChange = () => {
      if (activeTab === "simpan") fetchSavedItems();
    };
    window.addEventListener("bookmarkChanged", handleBookmarkChange);
    return () => {
      window.removeEventListener("bookmarkChanged", handleBookmarkChange);
    };
  }, [activeTab]);

  const handleOpenCreateAdModal = (businessId = null) => {
    const targetBizId = businessId || (businesses.length > 0 ? businesses[0].id : null);
    setSelectedBusinessForAd(targetBizId);
    setSelectedPackage(adPackages.length > 0 ? (adPackages[0].name || adPackages[0].id) : null);
    setAdNotes('');
    setCouponCodeInput('');
    setAppliedCouponInfo(null);
    setCouponMsg('');
    setSelectedPaymentMethod('Transfer Bank BCA');
    setAdPaymentProofFile(null);
    setAdPaymentProofPreview(null);
    setCreateAdStep(1);
    setCreatedAdDraftId(null);
    restoreAdReferralFromGlobal();
    setShowCreateAdModal(true);
    fetchAvailableCoupons();
  };

  const handleOpenResubmitAdModal = (ad) => {
    setResubmittingAd(ad);
    let proofs = [];
    if (ad.payment_proof_list && Array.isArray(ad.payment_proof_list)) {
      proofs = [...ad.payment_proof_list];
    } else if (ad.payment_proof) {
      if (typeof ad.payment_proof === 'string' && ad.payment_proof.startsWith('[')) {
        try { proofs = JSON.parse(ad.payment_proof); } catch (e) { proofs = [ad.payment_proof]; }
      } else {
        proofs = [ad.payment_proof];
      }
    }
    setExistingProofList(proofs.filter(Boolean));
    setNewProofFiles([]);
    setNewProofPreviews([]);
    setResubmitNotes(ad.notes || '');
    setResubmitPaymentMethod(ad.payment_method || 'Transfer Bank BCA');
  };

  const handleConfirmResubmitAd = async (e) => {
    if (e) e.preventDefault();
    if (!resubmittingAd) return;

    if (existingProofList.length === 0 && newProofFiles.length === 0) {
      alert('⚠️ Bukti Pembayaran Wajib Diunggah!\n\nSilakan unggah foto bukti transfer pembayaran terbaru sebelum mengirim pengajuan ulang.');
      return;
    }

    setSubmittingResubmit(true);
    try {
      const formData = new FormData();

      // Resubmit menggunakan endpoint /pay untuk update iklan yang sudah ada
      formData.append('payment_method', resubmitPaymentMethod);
      if (resubmitNotes) {
        formData.append('notes', resubmitNotes);
      }

      // Append newly uploaded proof files
      // Jika ada file baru, ambil yang pertama sebagai payment_proof
      if (newProofFiles.length > 0) {
        formData.append('payment_proof', newProofFiles[0]);
      }

      // Gunakan endpoint PUT /advertisements/{id}/pay untuk resubmit
      await api.post(`/advertisements/${resubmittingAd.id}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Pengajuan ulang iklan #' + resubmittingAd.id + ' berhasil dikirim! Menunggu konfirmasi admin.');
      setResubmittingAd(null);
      setExistingProofList([]);
      setNewProofFiles([]);
      setNewProofPreviews([]);
      setResubmitPaymentMethod('Transfer Bank BCA');
      setResubmitNotes('');
      setAdFilterTab('all');
      await fetchAdvertisements();
    } catch (err) {
      console.error('Failed to resubmit advertisement:', err);
      alert(err.response?.data?.message || 'Gagal mengajukan ulang iklan. Silakan coba lagi.');
    } finally {
      setSubmittingResubmit(false);
    }
  };

  // Submit new advertisement creation
  const handleAdSubmit = async () => {
    if (submittingAd) return;
    if (!selectedBusinessForAd) {
      alert('Pilih usaha yang ingin diiklankan');
      return;
    }
    if (!selectedPackage) {
      alert('Pilih paket iklan');
      return;
    }

    const finalPrice = getFinalPrice();
    if (finalPrice > 0 && !adPaymentProofFile) {
      alert('⚠️ Bukti Pembayaran Wajib Diunggah!\n\nSilakan pilih dan unggah foto struk / bukti transfer pembayaran terlebih dahulu sebelum mengajukan iklan.');
      return;
    }

    setSubmittingAd(true);
    try {
      const formData = new FormData();
      formData.append('business_id', selectedBusinessForAd);
      const selBizForAdSubmit = getSelectedBusinessObj();
      if (selBizForAdSubmit?.name) {
        formData.append('name', selBizForAdSubmit.name);
      }

      const pkgObj = getSelectedPackageObj();
      if (pkgObj && pkgObj.id) {
        formData.append('ad_package_id', pkgObj.id);
        formData.append('package_name', pkgObj.name);
      } else {
        formData.append('package_name', typeof selectedPackage === 'string' ? selectedPackage : 'Standard Iklan');
      }

      formData.append('price', finalPrice);

      if (appliedCouponInfo && appliedCouponInfo.code) {
        formData.append('coupon_code', appliedCouponInfo.code);
      }

      if (adAppliedReferralInfo && adAppliedReferralInfo.code) {
        formData.append('referral_code', adAppliedReferralInfo.code);
      }

      formData.append('payment_method', selectedPaymentMethod);

      if (adPaymentProofFile) {
        formData.append('payment_proof', adPaymentProofFile);
      }

      if (adNotes) {
        formData.append('notes', adNotes);
      }

      if (createdAdDraftId) {
        // Reuse and update the ad draft created in this session on retry
        await api.post(`/advertisements/${createdAdDraftId}/pay`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const res = await api.post('/advertisements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const newId = res.data?.advertisement?.id || res.data?.data?.id || res.data?.id;
        if (newId) setCreatedAdDraftId(newId);
      }

      alert('Iklan berhasil diajukan! ' + (adPaymentProofFile ? 'Bukti pembayaran telah dikirim dan menunggu konfirmasi admin.' : 'Silakan lakukan pembayaran.'));
      setShowCreateAdModal(false);
      setCreatedAdDraftId(null);
      setCreateAdStep(1);
      setSelectedBusinessForAd(null);
      setSelectedPackage(null);
      setAdNotes('');
      setCouponCodeInput('');
      setAppliedCouponInfo(null);
      setCouponMsg('');
      restoreAdReferralFromGlobal();
      setSelectedPaymentMethod('Transfer Bank BCA');
      setAdPaymentProofFile(null);
      setAdPaymentProofPreview(null);
      setAdFilterTab('all');
      await fetchAdvertisements();
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

    if (!adPaymentProofFile) {
      alert('⚠️ Bukti Pembayaran Wajib Diunggah!\n\nSilakan pilih foto struk / bukti transfer pembayaran terlebih dahulu.');
      return;
    }

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
  const handleValidateUserCoupon = async (codeToUse) => {
    const code = (typeof codeToUse === 'string' ? codeToUse : couponCodeInput).trim();
    if (!code) {
      setCouponMsg('Masukkan kode kupon terlebih dahulu.');
      return;
    }
    if (!selectedPackage) {
      setCouponMsg('Pilih paket iklan terlebih dahulu di langkah sebelumnya.');
      return;
    }
    setValidatingCoupon(true);
    setCouponMsg('');
    const basePrice = getSelectedPackagePrice();

    try {
      const res = await api.post('/coupons/validate', {
        code: code,
        product_type: 'ads',
        amount: basePrice,
        user_id: user?.id,
      });
      const data = res.data?.data || res.data;
      if (data && data.valid) {
        setAppliedCouponInfo(data);
        setCouponCodeInput(data.code || code);
        setCouponMsg(data.message || 'Kupon berhasil diterapkan!');
      } else {
        setAppliedCouponInfo(null);
        setCouponMsg(data?.message || 'Kode kupon tidak valid atau telah kedaluwarsa.');
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err);
      setAppliedCouponInfo(null);
      setCouponMsg(err.response?.data?.message || 'Kode kupon tidak valid atau telah kedaluwarsa.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove applied coupon
  const handleRemoveUserCoupon = () => {
    setAppliedCouponInfo(null);
    setCouponCodeInput('');
    setCouponMsg('');
  };

  // Validate referral code for user advertisement (HANYA jika nominal > Rp 10.000)
  const handleValidateAdReferral = async (codeToUse) => {
    const code = (typeof codeToUse === 'string' ? codeToUse : adReferralCodeInput).trim().toUpperCase();
    if (!code) {
      setAdReferralMsg('Masukkan kode referral terlebih dahulu.');
      return;
    }
    const basePrice = getSelectedPackagePrice();
    if (basePrice < 10000) {
      setAdReferralMsg('Kode referral hanya berlaku untuk transaksi mulai dari Rp 10.000. Untuk transaksi di bawah Rp 10.000, silakan gunakan kupon promo.');
      return;
    }
    setValidatingAdReferral(true);
    setAdReferralMsg('');

    try {
      const res = await api.post('/referrals/validate', {
        code: code,
        original_price: basePrice,
        amount: basePrice,
        service_type: 'advertisement',
        user_id: user?.id,
        business_id: selectedBusinessForAd,
      });
      const data = res.data;
      if (data && data.valid) {
        setAdAppliedReferralInfo({
          code: code,
          discount_amount: data.discount_amount || Math.round(basePrice * 0.1),
          discount_percent: data.discount_percent || 10,
          referrer_name: data.referrer_name || data.owner_name || data.agent?.name,
        });
        setAdReferralCodeInput(code);
        setAdReferralMsg(data.message || 'Kode referral berhasil diterapkan! Diskon 10%.');
      } else {
        setAdAppliedReferralInfo(null);
        setAdReferralMsg(data?.message || 'Kode referral tidak valid atau telah kedaluwarsa.');
      }
    } catch (err) {
      console.error('Failed to validate ad referral:', err);
      setAdAppliedReferralInfo(null);
      setAdReferralMsg(err.response?.data?.message || 'Kode referral tidak valid.');
    } finally {
      setValidatingAdReferral(false);
    }
  };

  const handleRemoveAdReferral = () => {
    if (adAppliedReferralInfo?.is_bound || isGloballyBound) {
      toast.error('Kode referral mitra ini sudah terhubung permanen pada akun Anda dan tidak dapat dihapus.');
      return;
    }
    setAdAppliedReferralInfo(null);
    setAdReferralCodeInput('');
    setAdReferralMsg('');
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

  // Fetch user profile from backend API (GET /user/profile) - Enhanced
  const fetchUserProfile = async () => {
    setLoadingProfile(true);
    // console.log("🔄 Fetching user profile from API...");

    try {
      const res = await api.get("/user/profile");
      const userData = res.data?.data || res.data;

      // console.log("📥 API Response:", userData);

      if (userData) {
        const avatarUrl = userData.avatar ? getStorageUrl(userData.avatar) : DEFAULT_AVATAR;
        const bannerUrl = userData.banner ? getStorageUrl(userData.banner) : DEFAULT_BANNER;

        // console.log("🖼️ Generated URLs:", {
        //   avatarUrl,
        //   bannerUrl,
        //   originalAvatar: userData.avatar,
        //   originalBanner: userData.banner
        // });

        const isUserSeller = Boolean(
          (userData.businesses && userData.businesses.length > 0) ||
          userData.is_seller === true ||
          userData.role === 'seller' ||
          userData.role === 'reseller' ||
          userData.role === 'merchant' ||
          userData.role === 'admin' ||
          userData.role === 'super_admin' ||
          localStorage.getItem('is_seller') === 'true' ||
          localStorage.getItem('user_mode') === 'seller' ||
          (userData.name && /seller|reseller/i.test(userData.name)) ||
          (user?.name && /seller|reseller/i.test(user.name))
        );

        if (isUserSeller) {
          localStorage.setItem('is_seller', 'true');
          localStorage.setItem('user_mode', 'seller');
        }

        const effectiveRole = userData.role && userData.role !== 'user'
          ? userData.role
          : (isUserSeller ? ((userData.name && /reseller/i.test(userData.name)) || user?.role === 'reseller' ? 'reseller' : 'seller') : (userData.role || 'User'));

        const profileObj = {
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          gender: userData.gender || user?.gender || "",
          location: userData.location || "",
          role: effectiveRole,
          bio: userData.bio || "",
          avatar: avatarUrl,
          banner: bannerUrl,
        };

        // console.log("💾 Setting profile data:", profileObj);

        setProfileData(profileObj);
        setPhotoPreview(avatarUrl);
        setBannerPreview(bannerUrl);
        setDisplayName(userData.username || userData.name || "");

        // Update user state with new data
        const userObj = {
          ...user,
          ...userData,
          role: effectiveRole,
          is_seller: isUserSeller,
          avatar: avatarUrl,
          banner: bannerUrl
        };

        // console.log("👤 Updating user state:", userObj);

        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));

        // Trigger a re-render for all components that depend on user data
        window.dispatchEvent(new Event("userAuthChanged"));

        // console.log("✅ Profile data updated successfully");
      } else {
        console.warn("⚠️ No user data received from API");
        setProfileErrorMsg("Tidak ada data pengguna yang diterima dari server.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch profile from API:", err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal memuat data profil dari server.";
      console.error("❌ Error details:", errorMsg);
      setProfileErrorMsg(`Gagal memuat data profil: ${errorMsg}`);
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

  // Auto select first business if none selected when in produk tab
  useEffect(() => {
    if (activeTab === "produk" && businesses.length > 0 && !selectedBusinessForProducts) {
      setSelectedBusinessForProducts(String(businesses[0].id));
    }
  }, [activeTab, businesses, selectedBusinessForProducts]);

  // Fetch produk pengguna ketika selectedBusinessForProducts berubah
  useEffect(() => {
    if (!selectedBusinessForProducts) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.get(`/my-products?business_id=${selectedBusinessForProducts}`);
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
    setEditImageFile(null);
    setEditImagePreview(product.image ? getStorageUrl(product.image) : null);
  };

  // Tutup modal edit
  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setEditForm({ name: "", price: "", description: "" });
    setEditPriceDisplay("");
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  // Select image file for editing
  const handleEditImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB.");
      return;
    }
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setEditImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
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
      formData.append("description", editForm.description || "");
      if (editImageFile) {
        formData.append("image", editImageFile);
      }
      formData.append("_method", "PUT");
      const res = await api.post(`/products/${editingProduct.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const updated = res.data?.product || res.data?.data || res.data;
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated, status: "pending" } : p));
      handleCloseEditModal();
      alert("Produk berhasil diperbarui dan dikirim ke Admin untuk verifikasi!");
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
      alert("Produk berhasil dihapus!");
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert(err.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  // ========== BUSINESS EDIT FUNCTIONS ==========

  const handleEditBusiness = (business) => {
    // Navigate to AddBusiness form with business ID for editing
    navigate(`/add-business/${business.id}`);
  };

  const handleCloseBusinessEditModal = () => {
    setEditingBusiness(null);
    setBusinessEditForm({
      name: "", description: "", phone: "", address: "", city: "", province: ""
    });
  };

  const handleBusinessEditFormChange = (e) => {
    const { name, value } = e.target;
    setBusinessEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateBusiness = async (e) => {
    e.preventDefault();
    if (!editingBusiness) return;
    setSavingBusiness(true);
    try {
      const formData = new FormData();
      formData.append("name", businessEditForm.name);
      formData.append("description", businessEditForm.description);
      formData.append("phone", businessEditForm.phone);
      formData.append("address", businessEditForm.address);
      formData.append("city", businessEditForm.city);
      formData.append("province", businessEditForm.province);
      formData.append("_method", "PUT");

      const res = await api.post(`/businesses/${editingBusiness.id}`, formData);
      const updated = res.data?.data || res.data;

      setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? { ...b, ...updated } : b));
      handleCloseBusinessEditModal();
      alert("Usaha berhasil diperbarui!");
    } catch (err) {
      console.error("Failed to update business:", err);
      alert(err.response?.data?.message || "Gagal memperbarui usaha.");
    } finally {
      setSavingBusiness(false);
    }
  };

  // ========== BLOG/EVENT EDIT FUNCTIONS ==========

  const handleEditBlog = (blog) => {
    if (!blog || !blog.id) return;
    const type = blog.itemType || blog.type || (blog.event_date ? "event" : "blog");
    navigate(`/add-blog/${blog.id}?type=${type}`);
  };

  const handleCloseBlogEditModal = () => {
    setEditingBlog(null);
    setBlogEditForm({
      title: "", content: "", blog_category: ""
    });
  };

  const handleBlogEditFormChange = (e) => {
    const { name, value } = e.target;
    setBlogEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;
    setSavingBlog(true);
    try {
      const res = await api.put(`/blogs/${editingBlog.id}`, {
        title: blogEditForm.title,
        content: blogEditForm.content,
        blog_category: blogEditForm.blog_category,
      });
      const updated = res.data?.data || res.data;

      setBlogs(prev => prev.map(b => b.id === editingBlog.id ? { ...b, ...updated } : b));
      setEvents(prev => prev.map(e => e.id === editingBlog.id ? { ...e, ...updated } : e));
      handleCloseBlogEditModal();
      alert(`${editingBlog.type === 'event' ? 'Event' : 'Blog'} berhasil diperbarui!`);
    } catch (err) {
      console.error("Failed to update blog:", err);
      alert(err.response?.data?.message || "Gagal memperbarui blog/event.");
    } finally {
      setSavingBlog(false);
    }
  };

  // ========== ADMIN PLANS MANAGEMENT FUNCTIONS ==========

  const fetchAdminPlans = async () => {
    setLoadingAdminPlans(true);
    try {
      const res = await api.get('/admin/plans');
      setAdminPlans(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch admin plans:", err);
      alert("Gagal memuat daftar paket premium");
    } finally {
      setLoadingAdminPlans(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanEditForm({
      name: plan.name || "",
      price: plan.price || "",
      duration_days: plan.duration_days || 30,
      features: plan.features || {},
    });
  };

  const handleClosePlanEditModal = () => {
    setEditingPlan(null);
    setPlanEditForm({
      name: "", price: "", duration_days: "", features: {}
    });
  };

  const handlePlanEditFormChange = (e) => {
    const { name, value } = e.target;
    setPlanEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSavingPlan(true);
    try {
      const res = await api.put(`/admin/plans/${editingPlan.id}`, {
        name: planEditForm.name,
        price: Number(planEditForm.price),
        duration_days: Number(planEditForm.duration_days),
        features: planEditForm.features,
      });
      const updated = res.data?.data || res.data;

      setAdminPlans(prev => prev.map(p => p.id === editingPlan.id ? updated : p));
      handleClosePlanEditModal();
      alert("Paket berhasil diperbarui!");
    } catch (err) {
      console.error("Failed to update plan:", err);
      alert(err.response?.data?.message || "Gagal memperbarui paket.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleTogglePlanStatus = async (planId) => {
    if (!confirm("Apakah Anda yakin ingin mengubah status paket ini?")) return;
    try {
      const res = await api.put(`/admin/plans/${planId}/toggle-status`);
      const updated = res.data?.data || res.data;

      setAdminPlans(prev => prev.map(p => p.id === planId ? updated : p));
      alert("Status paket berhasil diubah!");
    } catch (err) {
      console.error("Failed to toggle plan status:", err);
      alert(err.response?.data?.message || "Gagal mengubah status paket.");
    }
  };

  const handleOpenCreatePlanModal = () => {
    setShowCreatePlanModal(true);
    setCreatePlanForm({
      name: "",
      price: "",
      duration_days: 30,
      features: {
        "Lokasi Peta Penuh": false,
        "Galeri Foto Profil": false,
        "Fitur Katalog Produk": true,
        "Akses Chat & WA Direct": true,
        "Prioritas & Badge Premium": false,
      }
    });
  };

  const handleCloseCreatePlanModal = () => {
    setShowCreatePlanModal(false);
    setCreatePlanForm({
      name: "", price: "", duration_days: 30, features: {}
    });
  };

  const handleCreatePlanFormChange = (e) => {
    const { name, value } = e.target;
    setCreatePlanForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setCreatingPlan(true);
    try {
      const res = await api.post('/admin/plans', {
        name: createPlanForm.name,
        price: Number(createPlanForm.price),
        duration_days: Number(createPlanForm.duration_days),
        features: createPlanForm.features,
        is_active: true,
      });
      const newPlan = res.data?.data || res.data;

      setAdminPlans(prev => [...prev, newPlan]);
      handleCloseCreatePlanModal();
      alert("Paket berhasil ditambahkan!");
    } catch (err) {
      console.error("Failed to create plan:", err);
      alert(err.response?.data?.message || "Gagal menambahkan paket.");
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini? Paket yang sedang digunakan tidak dapat dihapus.")) return;
    try {
      await api.delete(`/admin/plans/${planId}`);
      setAdminPlans(prev => prev.filter(p => p.id !== planId));
      alert("Paket berhasil dihapus!");
    } catch (err) {
      console.error("Failed to delete plan:", err);
      alert(err.response?.data?.message || "Gagal menghapus paket. Paket mungkin sedang digunakan.");
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus usaha ini?")) {
      return;
    }
    try {
      await api.delete(`/businesses/${id}`);

      // Update state - remove deleted business
      setBusinesses(prev => prev.filter(b => b.id !== id));

      // Clear localStorage cache
      try {
        localStorage.removeItem("cached_my_businesses");
      } catch (e) {
        console.warn("Failed to clear cache:", e);
      }

      // Refresh data from server
      fetchBusinesses();

      alert("Usaha berhasil dihapus!");
    } catch (err) {
      console.error("Failed to delete business:", err);
      const msg = err?.response?.data?.message || "Gagal menghapus usaha.";
      alert(msg);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus konten info/berita ini?")) {
      return;
    }
    try {
      const res = await api.delete(`/blogs/${id}`);
      if (res.data?.success !== false) {
        toast.success("Konten info berhasil dihapus.");
        setBlogs(prev => prev.filter(b => b.id !== id));
      } else {
        toast.error(res.data?.message || "Gagal menghapus konten.");
      }
    } catch (err) {
      console.error("Failed to delete blog:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus konten.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus agenda event ini?")) {
      return;
    }
    try {
      const res = await api.delete(`/blogs/${id}`);
      if (res.data?.success !== false) {
        toast.success("Konten event berhasil dihapus.");
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        toast.error(res.data?.message || "Gagal menghapus event.");
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus event.");
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

  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [showBecomeSellerModal, setShowBecomeSellerModal] = useState(false);

  // Tampilkan modal konfirmasi sebelum jadi penjual, atau langsung arahkan ke pendaftaran usaha jika sudah penjual
  const handleOpenBecomeSellerConfirm = () => {
    if (isSeller) {
      navigate('/add-business');
      return;
    }
    setShowBecomeSellerModal(true);
  };

  // Handle switch / aktifkan mode penjual seketika lalu arahkan ke form pendaftaran usaha
  const handleBecomeSeller = async () => {
    setShowBecomeSellerModal(false);
    setIsSwitchingRole(true);
    localStorage.setItem('is_seller', 'true');
    localStorage.setItem('user_mode', 'seller');
    try {
      const res = await api.post('/user/become-seller');
      const updatedUser = res.data?.user || res.data?.data || { ...user, role: 'seller', is_seller: true };
      const newUserData = {
        ...user,
        ...updatedUser,
        role: updatedUser.role || 'seller',
        is_seller: true,
      };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      localStorage.setItem('is_seller', 'true');
      localStorage.setItem('user_mode', 'seller');
      toast.success("Mode Penjual berhasil diaktifkan! Mengarahkan ke form tambah usaha...");
      window.dispatchEvent(new Event('userAuthChanged'));
      navigate('/add-business');
    } catch (err) {
      console.error('Failed to become seller:', err);
      // Fallback local update
      const fallbackUser = { ...user, role: 'seller', is_seller: true };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      localStorage.setItem('is_seller', 'true');
      localStorage.setItem('user_mode', 'seller');
      toast.success("Mode Penjual aktif! Mengarahkan ke form tambah usaha...");
      window.dispatchEvent(new Event('userAuthChanged'));
      navigate('/add-business');
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Handle profile form save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUploadingProfile(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    setProfileValidationErrors({});

    // console.log("🚀 Starting profile save...", {
    //   profileData,
    //   hasProfilePhoto: !!profilePhoto,
    //   hasProfileBanner: !!profileBanner
    // });

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", profileData.name || "");
      formData.append("email", profileData.email || "");
      formData.append("phone", profileData.phone || "");
      formData.append("gender", profileData.gender || "");
      formData.append("location", profileData.location || "");
      formData.append("bio", profileData.bio || "");

      if (profilePhoto) {
        formData.append("avatar", profilePhoto);
        // console.log("📷 Uploading new avatar:", profilePhoto.name);
      } else if (removeAvatarFlag) {
        formData.append("remove_avatar", "1");
        // console.log("🗑️ Removing avatar");
      }

      if (profileBanner) {
        formData.append("banner", profileBanner);
        // console.log("🖼️ Uploading new banner:", profileBanner.name);
      } else if (removeBannerFlag) {
        formData.append("remove_banner", "1");
        // console.log("🗑️ Removing banner");
      }

      // console.log("📤 Sending profile update to API...");
      const res = await api.post("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("📥 Save response:", res.data);

      const updatedUser = res.data?.data || res.data?.user || res.data;
      const successMsg = res.data?.message || "✅ Profil berhasil diperbarui!";

      if (!updatedUser) {
        throw new Error("No user data in response");
      }

      // Update profile data immediately with response data
      const newAvatarUrl = updatedUser.avatar ? getStorageUrl(updatedUser.avatar) : DEFAULT_AVATAR;
      const newBannerUrl = updatedUser.banner ? getStorageUrl(updatedUser.banner) : DEFAULT_BANNER;

      // console.log("🔄 Updating UI with new data:", { newAvatarUrl, newBannerUrl });

      setProfileData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        gender: updatedUser.gender || profileData.gender || "",
        location: updatedUser.location || "",
        role: updatedUser.role || "User",
        bio: updatedUser.bio || "",
        avatar: newAvatarUrl,
        banner: newBannerUrl,
      });

      setPhotoPreview(newAvatarUrl);
      setBannerPreview(newBannerUrl);
      setDisplayName(updatedUser.username || updatedUser.name || "");

      // Update localStorage and user state
      const updatedUserState = {
        ...user,
        ...updatedUser,
        avatar: newAvatarUrl,
        banner: newBannerUrl,
      };
      setUser(updatedUserState);
      localStorage.setItem("user", JSON.stringify(updatedUserState));

      // Clear upload states immediately
      setProfilePhoto(null);
      setProfileBanner(null);
      setRemoveAvatarFlag(false);
      setRemoveBannerFlag(false);

      // Show success message immediately
      setProfileSuccessMsg(successMsg);

      // console.log("✅ Profile save successful, data updated immediately");

      // Force a complete profile refresh after a delay to ensure consistency
      setTimeout(async () => {
        // console.log("🔄 Force refreshing profile data from server...");
        await fetchUserProfile();
      }, 1000);

      // Auto-hide success message
      setTimeout(() => {
        setProfileSuccessMsg("");
      }, 5000);

      // Scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 200);

      // Dispatch event for navbar update
      window.dispatchEvent(new Event("userAuthChanged"));

    } catch (err) {
      console.error("❌ Profile save failed:", err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setProfileValidationErrors(err.response.data.errors);
        setProfileErrorMsg("Terdapat kesalahan isian form. Harap periksa pesan error di bawah input.");
      } else {
        const errorMsg = err.response?.data?.message || "Gagal memperbarui profil. Silakan coba lagi.";
        setProfileErrorMsg(errorMsg);
        console.error("❌ Error details:", errorMsg);
      }
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePhotoUpload = (file) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    // Clear any previous error
    setProfileErrorMsg("");

    // Show cropper instead of directly setting photo
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target.result);
      setCropType("avatar");
      setShowImageCropper(true);
      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedFile, croppedDataUrl) => {
    setProfilePhoto(croppedFile);
    setPhotoPreview(croppedDataUrl);
    setRemoveAvatarFlag(false);
    setShowImageCropper(false);
    setShowPhotoOptions(false);
    setShowPhotoModal(false);
    setProfileSuccessMsg("✓ Foto berhasil di-crop. Klik 'Simpan Profil' untuk menyimpan perubahan.");

    // Auto-hide success message after 4 seconds
    setTimeout(() => {
      setProfileSuccessMsg("");
    }, 4000);
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setImageToCrop(null);
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
      formData.append("remove_avatar", "1");

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

  const startCamera = async (target = "profile") => {
    setCameraTarget(target);
    setShowPhotoModal(false);
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      });
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
    // Mirror snapshot to match live viewfinder display
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = cameraTarget === "chat" ? `inbox-photo-${Date.now()}.jpg` : "camera-photo.jpg";
        const file = new File([blob], fileName, { type: "image/jpeg" });
        if (cameraTarget === "chat") {
          setChatImageFile(file);
          setChatImagePreview(canvas.toDataURL("image/jpeg"));
        } else {
          handlePhotoUpload(file);
        }
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

  // Dynamic content pricing for Info & Event
  const [userContentPricing, setUserContentPricing] = useState({
    blog: 10000,
    event: 15000,
    blog_duration: "1 Bulan",
    event_duration: "1 Bulan",
  });

  useEffect(() => {
    api.get("/content-pricing")
      .then((res) => {
        const data = res.data || {};
        const blogObj = data.data?.find((d) => d.type === "blog") || {};
        const eventObj = data.data?.find((d) => d.type === "event") || {};
        setUserContentPricing({
          blog: Number(data.blog || blogObj.price || 10000),
          event: Number(data.event || eventObj.price || 15000),
          blog_duration: blogObj.formatted_duration || "1 Bulan",
          event_duration: eventObj.formatted_duration || "1 Bulan",
        });
      })
      .catch(() => { });
  }, []);

  // Header Title mapping
  const getPageInfo = () => {
    switch (activeTab) {
      case "dashboard": {
        const userName = user?.name || user?.username || displayName || "Pengguna";
        return { title: `Dashboard ${userName}`, desc: "Ikhtisar statistik dan aktivitas portal Anda saat ini" };
      }
      case "bisnis":
        return { title: "Manajemen Usaha", desc: "Kelola daftar usaha, verifikasi, dan status tayang" };
      case "blog-event":
        return { title: "Manajemen Info & Event", desc: "Kelola artikel info dan acara dalam satu halaman" };
      case "inbox":
        return { title: "Kotak Masuk Pesan", desc: "Lihat dan balas pesan keluhan atau pertanyaan pengguna" };
      case "whatsapp":
        return { title: "Transaksi WhatsApp", desc: "Daftar riwayat transaksi akses WhatsApp, status pembayaran, dan verifikasi invoice resmi di portal Surade.com" };
      case "coin":
      case "tarik-gold":
      case "surade-poin":
        return { title: "Surade Poin", desc: "Kelola saldo poin, riwayat transaksi poin, dan penarikan saldo tunai" };
      case "referral":
      case "reseller":
        return { title: "Program Referral", desc: "Kelola kode referral Anda, pantau pendapatan komisi, penggunaan kode, dan riwayat transaksi." };
      case "premium":
        return { title: "Premium", desc: "Upgrade ke akun premium untuk fitur lebih" };
      case "iklan":
        return { title: "Iklan", desc: "Pasang iklan untuk promosi usaha Anda" };
      case "produk":
        return { title: "Manajemen Produk", desc: "Kelola produk untuk usaha Anda" };
      case "klaim":
        return { title: "Klaim Kepemilikan Usaha", desc: "Pantau status pengajuan klaim hak kelola tempat usaha Anda di portal Surade.com" };
      case "nomor-darurat":
        return { title: "Nomor Penting & Panggilan Darurat", desc: "Kelola kontak nomor penting & panggilan darurat usaha Anda yang terdaftar di direktori resmi" };
      case "simpan":
        return { title: "Bookmark Tersimpan", desc: "Daftar konten usaha dan event penting yang ditandai" };
      case "ulasan":
        return { title: "Ulasan", desc: "Pantau ulasan yang Anda berikan serta umpan balik konsumen" };
      case "profile":
        return { title: "Pengaturan Profil", desc: "Ubah data diri dan kredensial administrator Anda" };
      default:
        return { title: "Panel Admin User", desc: "Halaman administrator portal Surade.com" };
    }
  };

  const isSeller = Boolean(
    // 1. Explicit seller/admin roles from user account
    user?.role === 'seller' ||
    user?.role === 'reseller' ||
    user?.role === 'merchant' ||
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    user?.is_seller === true ||
    user?.account_type === 'seller' ||
    user?.account_type === 'reseller' ||
    user?.account_type === 'business' ||
    // 2. Or user actually owns businesses (verified strictly by user ID match)
    (businesses && businesses.length > 0 && user?.id && businesses.some(b => b.user_id && String(b.user_id) === String(user.id))) ||
    (user?.businesses && user?.businesses?.length > 0)
  );

  useEffect(() => {
    // Jangan redirect jika data bisnis masih dalam proses loading
    if (loadingBusinesses) return;

    if (!isSeller) {
      try {
        localStorage.removeItem('is_seller');
        localStorage.removeItem('user_mode');
        localStorage.removeItem('dashboard_mode');
        localStorage.removeItem('is_seller_mode');
      } catch (e) { }
      if (['blog-event', 'bisnis', 'produk', 'iklan', 'premium'].includes(activeTab)) {
        toast(
          "Fitur ini khusus untuk penjual/pemilik usaha. Silakan daftarkan usaha Anda terlebih dahulu.",
          { icon: "🏪", duration: 4500 }
        );
        navigate("/add-business");
        setActiveTab('dashboard');
      }
    } else {
      try {
        localStorage.setItem('is_seller', 'true');
        localStorage.setItem('user_mode', 'seller');
      } catch (e) { }
    }
  }, [isSeller, activeTab, loadingBusinesses]);

  const pageInfo = getPageInfo();

  // Hitung badge notifikasi untuk setiap menu sidebar (reaktif ketika ada tambah, perbarui, tolak, setujui, dll)
  const sidebarBadges = useMemo(() => {
    // Helper untuk menghitung notifikasi belum dibaca per kategori
    const unreadNotifsFor = (keywords = []) => {
      return (notificationsList || []).filter((n) => {
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

    // Bisnis: usaha yang pending/revisi ATAU notifikasi belum dibaca (disetujui, ditolak, diperbarui)
    const pendingBisnis = businesses.filter((b) =>
      ["pending", "needs_revision", "waiting_verification", "menunggu"].includes(b?.status)
    ).length;
    const bisnisBadge = Math.max(pendingBisnis, unreadNotifsFor(["business", "bisnis", "usaha"]));

    // Produk: produk pending/revisi ATAU notifikasi produk
    const pendingProduk = allUserProducts.filter(
      (p) => p?.status === "pending" || p?.status === "needs_revision"
    ).length;
    const produkBadge = Math.max(pendingProduk, unreadNotifsFor(["product", "produk"]));

    // Iklan: iklan pending/ditolak ATAU notifikasi iklan (disetujui, ditolak, pembayaran)
    const pendingIklan = advertisements.filter(
      (a) =>
        a?.status === "pending" ||
        a?.status === "rejected" ||
        a?.payment_status === "pending"
    ).length;
    const iklanBadge = Math.max(pendingIklan, unreadNotifsFor(["ad", "iklan", "advertisement"]));

    // Premium: langganan pending/ditolak ATAU notifikasi paket premium
    const pendingPremium = businesses.filter((b) => {
      const sub = b?.subscriptions?.[0] || b?.latest_subscription;
      return sub && ["pending", "rejected", "needs_revision"].includes(sub?.status);
    }).length;
    const premiumBadge = Math.max(pendingPremium, unreadNotifsFor(["premium", "subscription", "langganan"]));

    // Blog/Event: konten pending ATAU notifikasi blog/event
    const pendingBlog = blogs.filter(
      (b) => b?.status === "pending" || b?.payment_status === "pending"
    ).length;
    const blogBadge = Math.max(pendingBlog, unreadNotifsFor(["blog", "event", "berita"]));

    // Referral: notifikasi referral/komisi yang belum dibaca
    const referralBadge = unreadNotifsFor(["referral", "commission", "komisi"]);

    // WhatsApp: transaksi WA pending/ditolak ATAU notifikasi WA
    const pendingWhatsApp =
      (userWaStats?.pending || 0) + (userWaStats?.rejected || 0);
    const whatsappBadge = Math.max(pendingWhatsApp, unreadNotifsFor(["whatsapp", "wa"]));

    // Klaim: pengajuan klaim pending/under_review ATAU notifikasi klaim (disetujui, ditolak, klaim masuk)
    const pendingKlaim = userClaims.filter((c) =>
      ["pending", "under_review"].includes(c?.status)
    ).length;
    const klaimBadge = Math.max(pendingKlaim, unreadNotifsFor(["claim", "klaim"]));

    return {
      bisnis: bisnisBadge,
      produk: produkBadge,
      iklan: iklanBadge,
      premium: premiumBadge,
      "blog-event": blogBadge,
      referral: referralBadge,
      whatsapp: whatsappBadge,
      klaim: klaimBadge,
    };
  }, [businesses, allUserProducts, advertisements, blogs, notificationsList, userWaStats, userClaims]);

  // Sidebar Menu sections configured based on user status (regular user vs seller/admin)
  const menuSections = isSeller
    ? [
      {
        category: "HOME",
        items: [
          { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
          { id: "referral", name: "Kode Referral", icon: Share2, badge: sidebarBadges.referral },
          { id: "coin", name: "Surade Poin", icon: Coins, isGold: true },
        ],
      },
      {
        category: "USAHA & PRODUK",
        items: [
          { id: "bisnis", name: "Usaha", icon: Briefcase, badge: sidebarBadges.bisnis },
          { id: "produk", name: "Produk", icon: Package, badge: sidebarBadges.produk },
          { id: "klaim", name: "Klaim Usaha", icon: ShieldCheck, badge: sidebarBadges.klaim },
          { id: "nomor-darurat", name: "Nomor Penting", icon: PhoneCall },
        ],
      },
      {
        category: "PROMOSI & PUBLIKASI",
        items: [
          { id: "blog-event", name: "Info & Event", icon: FileText, badge: sidebarBadges["blog-event"] },
          { id: "iklan", name: "Iklan", icon: Megaphone, badge: sidebarBadges.iklan },
          { id: "premium", name: "Premium", icon: Crown, badge: sidebarBadges.premium },
        ],
      },
      {
        category: "KOMUNIKASI & AKTIVITAS",
        items: [
          { id: "inbox", name: "Pesan", icon: Mail, badge: totalInboxUnreadCount },
          { id: "whatsapp", name: "Transaksi WhatsApp", icon: WhatsAppIcon, badge: sidebarBadges.whatsapp },
          { id: "simpan", name: "Simpan", icon: Bookmark },
          { id: "ulasan", name: "Ulasan", icon: Star },
        ],
      },
    ]
    : [
      {
        category: "HOME",
        items: [
          { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
          { id: "referral", name: "Kode Referral", icon: Share2, badge: sidebarBadges.referral },
          { id: "coin", name: "Surade Poin", icon: Coins, isGold: true },
        ],
      },
      {
        category: "AKTIVITAS & LAYANAN",
        items: [
          { id: "klaim", name: "Klaim Usaha", icon: ShieldCheck, badge: sidebarBadges.klaim },
          { id: "nomor-darurat", name: "Nomor Penting", icon: PhoneCall },
          { id: "whatsapp", name: "Transaksi WhatsApp", icon: WhatsAppIcon, badge: sidebarBadges.whatsapp },
          { id: "inbox", name: "Pesan", icon: Mail, badge: totalInboxUnreadCount },
          { id: "simpan", name: "Simpan", icon: Bookmark },
          { id: "ulasan", name: "Ulasan", icon: Star },
        ],
      },
    ];

  const renderKlaimView = () => {
    const totalCount = userClaims.length;
    const pendingCount = userClaims.filter((c) => c.status === "pending").length;
    const reviewCount = userClaims.filter((c) => c.status === "under_review").length;
    const approvedCount = userClaims.filter((c) => c.status === "approved").length;
    const rejectedCount = userClaims.filter((c) => c.status === "rejected").length;

    const filtered = userClaims.filter((c) => {
      if (claimFilterStatus === "all") return true;
      return c.status === claimFilterStatus;
    });

    const getStatusBadge = (status) => {
      switch (status) {
        case "pending":
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock size={13} className="text-amber-500" />
              Menunggu Verifikasi
            </span>
          );
        case "under_review":
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Eye size={13} className="text-blue-500" />
              Sedang Ditinjau Admin
            </span>
          );
        case "approved":
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Klaim Disetujui
            </span>
          );
        case "rejected":
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle size={13} className="text-rose-500" />
              Klaim Ditolak
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {status}
            </span>
          );
      }
    };

    return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="text-[#5eead4]" size={24} />
              Klaim Kepemilikan Usaha
            </h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-2xl font-normal leading-relaxed">
              Pantau status pengajuan klaim hak kelola usaha Anda di portal Surade.com. Usaha yang telah disetujui admin akan otomatis masuk ke daftar usaha Anda.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="z-10 px-4 py-2.5 bg-white text-[#0a4d3a] rounded-xl font-bold text-xs md:text-sm hover:bg-slate-100 transition shadow-sm flex items-center gap-2 shrink-0 cursor-pointer border-0"
          >
            <Store size={16} />
            Cari Usaha untuk Diklaim
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Total Pengajuan</p>
              <h3 className="text-2xl font-black text-slate-800">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 mb-1">Menunggu Verifikasi</p>
              <h3 className="text-2xl font-black text-amber-700">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 mb-1">Sedang Ditinjau</p>
              <h3 className="text-2xl font-black text-blue-700">{reviewCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Eye size={20} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 mb-1">Disetujui / Selesai</p>
              <h3 className="text-2xl font-black text-emerald-700">{approvedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
          {[
            { id: "all", label: `Semua (${totalCount})` },
            { id: "pending", label: `Menunggu (${pendingCount})` },
            { id: "under_review", label: `Ditinjau (${reviewCount})` },
            { id: "approved", label: `Disetujui (${approvedCount})` },
            { id: "rejected", label: `Ditolak (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClaimFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border-0 ${
                claimFilterStatus === tab.id
                  ? "bg-[#0b6b45] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={fetchUserClaims}
            className="ml-auto p-2 text-slate-500 hover:text-[#0b6b45] transition bg-transparent border-0 cursor-pointer"
            title="Muat ulang data klaim"
          >
            <RefreshCw size={16} className={loadingUserClaims ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Claims List */}
        {loadingUserClaims && userClaims.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
            <Loader2 size={32} className="animate-spin text-[#0b6b45] mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Memuat data pengajuan klaim...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0b6b45] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {claimFilterStatus === "all"
                ? "Belum Ada Pengajuan Klaim Usaha"
                : "Tidak ada klaim dengan filter ini"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
              Jika Anda merupakan pemilik sah dari tempat usaha yang terdaftar di Surade.com namun belum memiliki akses kelola, buka halaman usaha tersebut dan klik tombol &quot;Klaim Usaha Ini&quot;.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-[#0b6b45] text-white rounded-xl font-bold text-xs hover:bg-[#0a4d3a] transition shadow-sm inline-flex items-center gap-2 cursor-pointer border-0"
            >
              <Store size={15} />
              Jelajahi Direktori Usaha
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((claim) => {
              const b = claim.business || {};
              const logoUrl = b.logo ? getStorageUrl(b.logo) : "";
              const proofFile = claim.proof_file || claim.proof_document;
              const proofUrl = proofFile
                ? (proofFile.startsWith("http")
                    ? proofFile
                    : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000"}/storage/${proofFile.replace(/^\/?storage\//, "")}`)
                : null;

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={b.name || "Usaha"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_AVATAR;
                            }}
                          />
                        ) : (
                          <Store size={22} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900">{b.name || "Nama Usaha Tidak Diketahui"}</h4>
                          {b.category?.name && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              {b.category.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Diajukan pada: {claim.created_at ? new Date(claim.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {getStatusBadge(claim.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Alasan Klaim</span>
                      <p className="text-xs font-semibold text-slate-800">{claim.reason || claim.claim_reason || "-"}</p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bukti Dokumen</span>
                      {(() => {
                        let proofs = claim.proof_file_list || [];
                        if (proofs.length === 0 && (claim.proof_file || claim.proof_document)) {
                          const raw = claim.proof_file || claim.proof_document;
                          if (typeof raw === "string" && raw.startsWith("[")) {
                            try { proofs = JSON.parse(raw); } catch (e) { proofs = [raw]; }
                          } else {
                            proofs = [raw];
                          }
                        }
                        if (proofs.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {proofs.map((pFile, pIdx) => {
                                const url = pFile.startsWith("http") ? pFile : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000"}/storage/${pFile.replace(/^\/?storage\//, "")}`;
                                return (
                                  <a
                                    key={pIdx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline bg-white px-2 py-1 rounded-lg border border-slate-200"
                                  >
                                    <FileText size={14} />
                                    <span>Bukti {proofs.length > 1 ? `#${pIdx + 1}` : "Pendukung"}</span>
                                    <ExternalLink size={12} />
                                  </a>
                                );
                              })}
                            </div>
                          );
                        }
                        return <span className="text-xs text-slate-400 italic">Tidak ada dokumen dilampirkan</span>;
                      })()}
                    </div>
                  </div>

                  {(claim.description || claim.claim_description) && (
                    <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-100 mb-4">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Detail Keterangan Pengaju</span>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{claim.description || claim.claim_description}</p>
                    </div>
                  )}

                  {/* Status Alerts */}
                  {claim.status === "rejected" && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 mb-4 flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Klaim Tidak Disetujui Admin</p>
                        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                          <strong>Alasan:</strong> {claim.rejection_reason || "Bukti atau keterangan yang dilampirkan belum memenuhi syarat validitas kepemilikan."}
                        </p>
                      </div>
                    </div>
                  )}

                  {claim.status === "approved" && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 mb-4 flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold">Klaim Berhasil &amp; Kepemilikan Dialihkan!</p>
                        <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                          Selamat! Tempat usaha ini sekarang resmi berada di bawah akun Anda. Anda memiliki hak akses penuh untuk mengedit informasi, produk, dan promosi.
                        </p>
                      </div>
                    </div>
                  )}

                  {claim.status === "under_review" && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 mb-4 flex items-center gap-2">
                      <Eye size={16} className="text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700">
                        Admin sedang memverifikasi bukti dokumen kepemilikan dan mungkin akan menghubungi nomor kontak Anda.
                      </p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] text-slate-400">
                      ID Klaim: #{claim.id}
                    </div>
                    <div className="flex items-center gap-2">
                      {b.slug || b.id ? (
                        <a
                          href={`/bisnis/${b.slug || b.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition inline-flex items-center gap-1.5 no-underline"
                        >
                          <Eye size={13} />
                          Lihat Halaman Usaha
                        </a>
                      ) : null}

                      {claim.status === "approved" && (
                        <button
                          onClick={() => {
                            fetchBusinesses();
                            setActiveTab("bisnis");
                          }}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0b6b45] hover:bg-[#0a4d3a] transition inline-flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
                        >
                          <Briefcase size={13} />
                          Kelola di Menu Usaha
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const menuItems = menuSections.flatMap((s) => s.items);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-['Poppins',sans-serif] text-[#0f172a] relative">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[290] md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Collapsible 3D Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen ${isCollapsed ? "w-[72px]" : "w-[248px]"} bg-gradient-to-b from-[#0b6b45] via-[#095838] to-[#07422a] flex flex-col z-[300] transition-all duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-white/10 shadow-[8px_0_30px_rgba(0,0,0,0.25)] max-md:w-[268px] ${mobileSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}>
        {/* Header / Brand with Glass Glow */}
        <div className="flex items-center justify-between p-[16px_14px_14px] border-b border-white/10 shrink-0 min-h-[62px] bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-[10px] overflow-hidden flex-1 min-w-0">
            {(!isCollapsed || mobileSidebarOpen) && (
              <img src={logoImg} alt="Surade.com" className="h-[28px] w-auto shrink-0 drop-shadow-md" />
            )}
            <div className={`flex flex-col gap-[3px] min-w-0 transition-all duration-[280ms] ${isCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 overflow-hidden" : ""}`}>
              <span className="text-[15px] font-black text-white whitespace-nowrap leading-none tracking-tight drop-shadow-xs">Surade.com</span>
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-[#6ee7b7] text-[0.62rem] px-[8px] py-[2px] rounded-full font-black uppercase tracking-wider whitespace-nowrap w-fit shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                {user?.role === 'admin' || user?.role === 'super_admin'
                  ? "Admin"
                  : (isSeller
                    ? (user?.role === 'reseller' || /reseller/i.test(displayName || '') ? "Reseller" : "Penjual")
                    : "User")}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-xl text-emerald-300 cursor-pointer transition-all duration-200 bg-white/5 border border-white/10 hover:bg-white/15 hover:text-white hover:scale-105 active:scale-95 shadow-xs"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileSidebarOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            title={isCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* 3D Frosted Search Box */}
        <div className={`flex items-center gap-[8px] my-[10px] mx-[10px] py-[8px] bg-white/8 border border-white/12 rounded-xl transition-all duration-200 shrink-0 overflow-hidden focus-within:bg-white/15 focus-within:border-emerald-400/50 focus-within:shadow-[0_0_12px_rgba(16,185,129,0.2)] ${isCollapsed && !mobileSidebarOpen ? "px-[8px] justify-center" : "px-[12px]"}`}>
          <Search className="text-white/50 shrink-0" size={17} />
          <input
            type="text"
            className={`flex-1 border-none outline-none bg-transparent text-white font-['Poppins',sans-serif] text-[12.5px] min-w-0 placeholder:text-white/40 transition-all duration-200 ${isCollapsed && !mobileSidebarOpen ? "w-0 opacity-0 pointer-events-none" : ""}`}
            placeholder={isCollapsed && !mobileSidebarOpen ? "" : "Cari menu..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 3D Navigation Items */}
        <ul className="list-none flex-1 overflow-y-auto overflow-x-hidden px-[8px] py-[4px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-[4px] select-none">
          {menuSections.map((section, sIdx) => {
            const filteredItems = section.items.filter(
              (item) => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.category || sIdx} className="flex flex-col gap-[3px] mb-1">
                {/* Section Header with glowing dot */}
                <div className={`px-[10px] pt-[8px] pb-[3px] text-[10px] font-black uppercase tracking-[1.3px] text-emerald-300/60 select-none transition-all duration-200 overflow-hidden whitespace-nowrap flex items-center gap-1.5 ${isCollapsed && !mobileSidebarOpen ? "opacity-0 h-0 p-0 pointer-events-none" : ""}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 inline-block shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span>{section.category}</span>
                </div>

                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isGoldTab = item.id === "tarik-gold";
                  const isActive = activeTab === item.id || (isGoldTab && showGoldWithdrawModal);
                  const isCoinTab = item.id === "coin";
                  const hasBadge = Number(item.badge || 0) > 0;

                  return (
                    <li key={item.id} className="group relative mb-[1px] select-none">
                      <div
                        className={`flex items-center gap-[12px] px-[12px] py-[9.5px] rounded-xl cursor-pointer select-none transition-all duration-200 whitespace-nowrap ${isActive
                          ? "bg-white text-[#064e3b] font-black shadow-[0_6px_18px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.9)] scale-[1.02] translate-x-1"
                          : "text-white/85 hover:bg-white/12 hover:text-white hover:translate-x-1.5 hover:shadow-xs border border-transparent hover:border-white/10"
                          }`}
                        onClick={() => handleTabChange(item.id)}
                      >
                        {isCoinTab || isGoldTab ? (
                          <div className="shrink-0 flex items-center justify-center">
                            <SuradeCoinIcon size={20} type="gold" className="drop-shadow-md" />
                          </div>
                        ) : (
                          <Icon className={`shrink-0 select-none transition-transform duration-200 ${isActive ? "text-[#059669] scale-110 drop-shadow-xs" : "group-hover:scale-110"}`} size={20} />
                        )}
                        <span className={`text-[13px] tracking-tight whitespace-nowrap select-none transition-all duration-200 overflow-hidden ${isActive ? "font-black text-[#064e3b]" : "font-medium"} ${isCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>
                          {item.name}
                        </span>

                        {/* Red notification badge at the right end (di ujung) */}
                        {hasBadge && (!isCollapsed || mobileSidebarOpen) && (
                          <span className="ml-auto px-2 py-0.5 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-black shadow-md shrink-0">
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        )}

                        {/* Dot indicator when collapsed */}
                        {hasBadge && isCollapsed && !mobileSidebarOpen && (
                          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#095838] shadow-xs" />
                        )}
                      </div>
                      {/* Tooltip for collapsed mode */}
                      <span className={`absolute left-[78px] top-1/2 -translate-y-1/2 bg-[#07422a] text-white text-[12px] font-bold px-[12px] py-[6px] rounded-xl whitespace-nowrap pointer-events-none opacity-0 select-none border border-emerald-500/30 shadow-xl ${isCollapsed && !mobileSidebarOpen ? "group-hover:opacity-100 group-hover:translate-x-1" : ""} transition-all duration-150 z-[300] before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#07422a]`}>
                        {item.name}{hasBadge ? ` (${item.badge})` : ""}
                      </span>
                    </li>
                  );
                })}
              </div>
            );
          })}
        </ul>

        {/* ── 3D Callout Ayo Jadi Penjual (Hanya Ditampilkan untuk User) ── */}
        {!isSeller && (
          <div className={`mx-[8px] my-[6px] p-[12px] rounded-2xl bg-gradient-to-br from-amber-400/20 via-white/10 to-amber-500/10 border border-amber-300/30 text-white shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-300/50 ${isCollapsed && !mobileSidebarOpen ? "p-[6px] mx-[6px] text-center" : ""}`}>
            {(!isCollapsed || mobileSidebarOpen) ? (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-black">
                    <Store size={13} />
                  </div>
                  <span className="text-[12px] font-black text-amber-200 leading-tight">Ayo Jadi Penjual!</span>
                </div>
                <p className="text-[10.5px] text-white/90 leading-relaxed mb-2.5">
                  Aktifkan fitur penjual, kelola usaha &amp; produk, jangkau ribuan pembeli lokal di Surade.
                </p>
                <button
                  type="button"
                  onClick={handleOpenBecomeSellerConfirm}
                  disabled={isSwitchingRole}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[11px] shadow-lg hover:shadow-amber-500/40 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 select-none disabled:opacity-75"
                >
                  {isSwitchingRole ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-slate-950" />
                      <span>Mengaktifkan...</span>
                    </>
                  ) : (
                    <>
                      <Store size={13} className="shrink-0 text-slate-950" />
                      <span>Buka Usaha Sekarang</span>
                      <ArrowRight size={12} className="shrink-0" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleOpenBecomeSellerConfirm}
                disabled={isSwitchingRole}
                className="w-full h-[38px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer border-0 disabled:opacity-75"
                title="Buka Usaha Sekarang - Aktifkan Mode Penjual"
              >
                {isSwitchingRole ? (
                  <Loader2 size={18} className="animate-spin text-slate-950" />
                ) : (
                  <Store size={18} className="text-slate-950" />
                )}
              </button>
            )}
          </div>
        )}

        {/* 3D Floating "Kembali ke Website" Button */}
        <div className="p-[4px_8px_4px] shrink-0 select-none">
          <Link
            to="/"
            className="flex items-center gap-[10px] px-[12px] py-[9.5px] rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/15 border border-emerald-400/30 text-white text-[12.5px] font-bold font-['Poppins',sans-serif] overflow-hidden whitespace-nowrap select-none transition-all duration-200 hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] group"
            title="Kembali ke Website"
          >
            <Home size={18} className="shrink-0 select-none text-emerald-300 group-hover:scale-110 group-hover:text-white transition-all" />
            <span className={`transition-all duration-200 overflow-hidden whitespace-nowrap select-none ${isCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>
              Kembali ke Website
            </span>
          </Link>
        </div>

        {/* 3D Profile Glass Footer Section */}
        <div className="flex items-center justify-between p-[12px_10px] border-t border-white/10 gap-[8px] shrink-0 overflow-hidden bg-black/15 backdrop-blur-sm">
          <div
            className="flex items-center gap-[10px] flex-1 min-w-0 rounded-xl p-[5px_6px] transition-all duration-200 hover:bg-white/10 cursor-pointer group"
            onClick={() => handleTabChange("profile")}
          >
            <div className="relative shrink-0">
              <SafeImage
                src={profileData.avatar || photoPreview || DEFAULT_AVATAR}
                alt="Profile"
                className="w-[36px] h-[36px] rounded-full object-cover shrink-0 border-2 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform"
                fallback={DEFAULT_AVATAR}
                onError={(e) => {
                  console.warn("Sidebar avatar failed to load:", e.currentTarget.src);
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#042419]" />
            </div>
            <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-200 ${isCollapsed && !mobileSidebarOpen ? "opacity-0 w-0 pointer-events-none" : ""}`}>
              <span className="text-[12.5px] font-black text-white whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-emerald-300 transition-colors">{displayName}</span>
              <span className="text-[10.5px] text-emerald-300/80 whitespace-nowrap capitalize font-medium">
                {user?.role === 'admin' || user?.role === 'super_admin'
                  ? "Administrator"
                  : (isSeller
                    ? (user?.role === 'reseller' || /reseller/i.test(displayName || '') ? "Reseller" : "Penjual")
                    : (profileData.role || "User"))}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 w-[34px] h-[34px] flex items-center justify-center rounded-xl text-white/40 cursor-pointer transition-all duration-200 bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-400/40 hover:scale-105 active:scale-95 shadow-xs"
            onClick={handleLogout}
            title="Keluar Panel Admin User"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className={`flex-1 min-h-screen min-w-0 max-w-full flex flex-col transition-all duration-[280ms] overflow-x-hidden ${isCollapsed ? "md:ml-[68px]" : "md:ml-[240px]"} ml-0 pb-8`}>
        <header className="sticky top-0 z-[100] flex items-center justify-between px-2.5 sm:px-5 h-[60px] bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] gap-1.5 sm:gap-2">
          {/* Left Side: Mobile Hamburger Button + Avatar / Desktop Page Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
            {/* Hamburger Button for Mobile Drawer */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 hover:text-emerald-800 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs border border-slate-200/80"
              aria-label="Buka menu navigasi"
              title="Menu Navigasi"
            >
              <Menu size={18} strokeWidth={2.2} />
            </button>

            {/* Mobile-only Profile Avatar */}
            <button
              type="button"
              onClick={() => handleTabChange("profile")}
              className="md:hidden flex items-center justify-center w-[30px] h-[30px] sm:w-[34px] sm:h-[34px] rounded-full p-[1.5px] bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              title={`Buka Profil ${displayName}`}
              aria-label={`Buka Profil ${displayName}`}
            >
              <SafeImage
                src={profileData.avatar}
                alt="user avatar"
                className="w-full h-full rounded-full object-cover bg-white"
                fallback={DEFAULT_AVATAR}
              />
            </button>

            {/* Desktop Page Title */}
            <div className="hidden md:block min-w-0">
              <h1 className="text-[17px] font-bold text-[#0f172a] leading-tight truncate">{pageInfo.title}</h1>
              <p className="text-[12px] text-[#64748b] mt-[1px] truncate">{pageInfo.desc}</p>
            </div>
          </div>

          {/* Right Side: Coins, Notifications, and Desktop Profile Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            {/* 3D LUXURY DUAL COIN WALLET WIDGET (SILVER & GOLD - COMPACT & RESPONSIVE FOR MOBILE) */}
            <div className="inline-flex items-center p-[1px] sm:p-[1.5px] rounded-full bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#b45309] shadow-[0_2px_8px_rgba(245,158,11,0.3)] shrink-0">
              <div className="flex items-center bg-gradient-to-r from-[#062c23] via-[#093f32] to-[#04241c] rounded-full pl-2 sm:pl-2.5 pr-1 py-0.5 sm:py-1 gap-1 sm:gap-2 border border-emerald-400/30">
                {/* Silver Balance */}
                <button
                  type="button"
                  onClick={() => handleTabChange("coin")}
                  className="flex items-center gap-1 cursor-pointer group focus:outline-none"
                  title="Saldo Poin Silver (Reward & Fitur)"
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <SuradeCoinIcon size={16} type="silver" className="drop-shadow-[0_1px_3px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[11px] sm:text-xs font-black text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {Number(silverBalance || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="hidden sm:inline text-[8.5px] sm:text-[9.5px] font-black text-slate-300 uppercase tracking-wider">
                      Silver
                    </span>
                  </div>
                </button>

                <div className="h-3 w-[1px] bg-white/20 shrink-0" />

                {/* Gold Balance */}
                <button
                  type="button"
                  onClick={() => handleTabChange("coin")}
                  className="flex items-center gap-1 cursor-pointer group focus:outline-none"
                  title="Saldo Poin Gold (Dapat Ditarik Uang)"
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <SuradeCoinIcon size={16} type="gold" className="drop-shadow-[0_1px_3px_rgba(245,158,11,0.6)] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[11px] sm:text-xs font-black text-amber-300 tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {Number(goldBalance || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="hidden sm:inline text-[8.5px] sm:text-[9.5px] font-black text-amber-400 uppercase tracking-wider">
                      Gold
                    </span>
                  </div>
                </button>

                {/* Integrated 3D Golden Action Button: + Beli Poin */}
                <button
                  type="button"
                  onClick={() => setShowBuyCoinModal(true)}
                  className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] hover:from-[#fef08a] hover:to-[#ea580c] text-slate-950 font-black text-[9.5px] sm:text-xs shadow-[0_1px_0_#9a3412,0_2px_6px_rgba(245,158,11,0.4)] active:translate-y-0.5 transition-all cursor-pointer border-t border-white/70 hover:scale-105 active:scale-95 shrink-0"
                  title="Beli Poin Instan"
                >
                  <Plus size={11} strokeWidth={3.5} className="text-slate-950" />
                  <span className="tracking-tight sm:hidden">+Poin</span>
                  <span className="tracking-tight hidden sm:inline">Beli Poin</span>
                </button>
              </div>
            </div>

            {/* Notification Bell Dropdown Button (Gambar 5: Tanpa bulatan di belakang, icon ditebalkan) */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                className="relative p-1.5 flex items-center justify-center bg-transparent text-slate-700 hover:text-emerald-700 cursor-pointer border-0 transition-all duration-200 active:scale-90 focus:outline-none"
                onClick={() => setShowNotifDropdown((v) => !v)}
                title="Notifikasi & Riwayat"
                aria-label="Notifikasi & Riwayat"
              >
                <Bell size={22} strokeWidth={2.8} className="drop-shadow-xs" />
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[0.62rem] font-black min-w-[17px] h-[17px] rounded-full flex items-center justify-center border-2 border-white px-[2px] shadow-sm">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifDropdown && (
                <>
                  {/* Mobile Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/25 z-[999] sm:hidden"
                    onClick={() => setShowNotifDropdown(false)}
                  />

                  <div className="fixed inset-x-3 top-[66px] sm:inset-x-auto sm:top-[calc(100%+10px)] sm:right-0 w-auto sm:w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl border border-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08)] z-[1000] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Arrow caret - desktop only */}
                    <span className="hidden sm:block absolute -top-[5px] right-[14px] rotate-45 w-2.5 h-2.5 bg-white border-t border-l border-slate-200" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-bold text-slate-800 m-0">Notifikasi &amp; Riwayat</h3>
                        {unreadNotifCount > 0 && (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {unreadNotifCount} Baru
                          </span>
                        )}
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 bg-transparent border-none cursor-pointer transition-colors"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100/60 border-b border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setNotifTab("all")}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${notifTab === "all" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Semua ({notificationsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab("unread")}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${notifTab === "unread" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        Belum Dibaca ({unreadNotifCount})
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                      {displayedNotifs.length > 0 ? (
                        displayedNotifs.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              handleMarkRead(n.id);
                              setShowNotifDropdown(false);
                              if (n.source_type === 'business_claim' || n.type?.includes('claim') || String(n.title).toLowerCase().includes('klaim')) {
                                setActiveTab('klaim');
                              } else if (n.source_type === 'business' || n.type?.includes('business')) {
                                setActiveTab('bisnis');
                              }
                            }}
                            className={`group flex items-start gap-3 p-3.5 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'}`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getNotifIconBg(n.type)}`}>
                              {getNotifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-[12.5px] font-bold text-slate-800 leading-snug mb-0.5 truncate">{n.title}</p>
                              <p className="text-[11.5px] text-slate-600 leading-relaxed mb-1 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] font-medium text-slate-400 block">{formatNotifTime(n.created_at)}</span>
                            </div>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotif(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-all p-1 bg-transparent border-none cursor-pointer"
                              title="Hapus notifikasi"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-xs">
                          <Bell size={24} className="mb-2 opacity-30 text-slate-400" />
                          <p className="font-semibold text-slate-600">Tidak ada notifikasi</p>
                          <p className="text-[11px] text-slate-400">Riwayat aktivitas Anda akan muncul di sini</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between px-4">
                      <button
                        type="button"
                        onClick={() => {
                          handleMarkAllRead();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <CheckCheck size={14} />
                        <span>Tandai Semua Dibaca</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNotifDropdown(false)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Profile Pill Badge */}
            <div
              className="hidden md:flex items-center gap-[8px] p-[5px_14px_5px_6px] rounded-full bg-[#f1f5f9] text-[13px] text-[#64748b] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(0,117,112,0.12)] shrink-0 border border-slate-200/60"
              onClick={() => handleTabChange("profile")}
              title={`Buka Profil ${displayName}`}
            >
              <SafeImage
                src={profileData.avatar}
                alt="user avatar"
                className="w-[26px] h-[26px] rounded-full object-cover shrink-0 border border-emerald-600/30"
                fallback={DEFAULT_AVATAR}
              />
              <span className="truncate max-w-[140px]">
                Halo, <strong className="text-slate-900">{displayName}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Active Page View Container */}
        <section className="flex-1 min-w-0 max-w-full p-[24px_28px] max-md:p-[16px] overflow-y-auto overflow-x-hidden">
          {activeTab === "dashboard" && (
            !isSeller ? (
              /* ═══════════════════════════════════════════════════════════════════ */
              /* ── USER BIASA DASHBOARD VIEW (3D UI/UX & FULL FUNCTIONAL) ── */
              /* ═══════════════════════════════════════════════════════════════════ */
              <div className="w-full max-w-full min-w-0 flex flex-col gap-[20px]">
                {/* 1. HERO GREETING & UPGRADE CALLOUT BANNER (3D UI/UX) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] p-5 sm:p-6 text-white shadow-[0_12px_32px_rgba(4,120,87,0.25),0_4px_12px_rgba(0,0,0,0.1)] border border-emerald-400/30">
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-emerald-300/50 shadow-lg bg-emerald-950/40 shrink-0 p-0.5">
                        <SafeImage
                          src={profileData.avatar || photoPreview || DEFAULT_AVATAR}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-xl"
                          fallback={DEFAULT_AVATAR}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                            Halo, {displayName || "Pengguna"}! 👋
                          </h2>
                          <span className="inline-flex items-center px-3 h-[30px] rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-emerald-200 border border-white/30 backdrop-blur-xs shrink-0">
                            Akun Pengguna
                          </span>
                          {Boolean(isPremiumSeller && referralStats?.referral_code) && (
                            <div className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-slate-950/80 border border-teal-400/40 text-[11.5px] font-bold text-teal-300 shadow-md backdrop-blur-md shrink-0">
                              <Gift size={13} className="text-amber-400 shrink-0" />
                              <span className="text-[11px] text-slate-300 font-sans font-medium">Ref:</span>
                              <span className="font-mono text-white font-black tracking-wider text-[11.5px]">{referralStats.referral_code}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const codeToCopy = referralStats.referral_code;
                                  if (codeToCopy) {
                                    navigator.clipboard.writeText(codeToCopy);
                                    toast.success(`Kode referral ${codeToCopy} berhasil disalin!`, { icon: '📋' });
                                  }
                                }}
                                className="ml-1 px-2.5 h-[22px] rounded-full bg-teal-500/25 hover:bg-teal-500/45 text-teal-200 hover:text-white border border-teal-400/40 flex items-center gap-1 transition-all cursor-pointer text-[10.5px] font-bold shadow-2xs"
                                title="Salin Kode Referral"
                              >
                                <Copy size={11} />
                                <span>Salin</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                          Selamat datang di dashboard akun Anda. Akses WhatsApp penjual, kelola pesan masuk, konten tersimpan, dan ulasan Anda dengan mudah di satu tempat.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenBecomeSellerConfirm}
                      disabled={isSwitchingRole}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm border-b-4 border-b-amber-600 shadow-[0_8px_25px_rgba(245,158,11,0.4)] hover:border-b-2 hover:translate-y-0.5 active:translate-y-1 active:border-b-0 transition-all duration-200 shrink-0 group select-none cursor-pointer border-t-0 border-x-0 disabled:opacity-75"
                    >
                      {isSwitchingRole ? (
                        <>
                          <Loader2 size={17} className="animate-spin text-slate-950" />
                          <span>Mengaktifkan...</span>
                        </>
                      ) : (
                        <>
                          <Store size={17} className="text-slate-950 group-hover:scale-110 transition-transform" />
                          <span>Buka Usaha Sekarang</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* 3D Decorative Glow Orbs */}
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -top-10 left-1/3 w-36 h-36 bg-teal-200/15 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* DAILY REWARD HARIAN SILVER WIDGET */}
                <DailyRewardWidget onRewardClaimed={() => fetchHeaderPoinBalance && fetchHeaderPoinBalance()} />

                {/* AJAKAN PROGRAM REFERRAL KHUSUS USER BIASA */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10.5px] font-bold border border-amber-400/30">
                      <Gift size={12} className="text-amber-400" />
                      <span>Program Kemitraan &amp; Referral</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Ingin Mendapatkan Komisi Referral 10%?
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Daftarkan usaha atau toko Anda di Surade.com dan aktifkan Usaha Premium untuk membuka kode referral unik dan meraih komisi tunai dari setiap transaksi!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenBecomeSellerConfirm}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Store size={15} />
                    <span>Buka Usaha Sekarang</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 2. 4 INTERACTIVE STATS CARDS FOR REGULAR USER */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] sm:gap-[16px] w-full min-w-0">

                  {/* Card 1: Riwayat Transaksi */}
                  <div
                    onClick={() => handleTabChange("whatsapp")}
                    className="bg-white border border-slate-200/90 border-b-4 border-b-emerald-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Riwayat Transaksi</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">
                        {userWaStats?.total || userWaLogs?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 truncate">
                        <MessageCircle size={12} className="shrink-0" />
                        <span className="truncate">Semua Transaksi</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <MessageCircle size={20} />
                    </div>
                  </div>

                  {/* Card 2: Pesan Masuk / Inbox */}
                  <div
                    onClick={() => handleTabChange("inbox")}
                    className="bg-white border border-slate-200/90 border-b-4 border-b-blue-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Pesan Masuk</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">
                        {conversations?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 truncate">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{totalInboxUnreadCount > 0 ? `${totalInboxUnreadCount} belum dibaca` : "Chat Aktif"}</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Mail size={20} />
                    </div>
                  </div>

                  {/* Card 3: Simpan / Bookmark */}
                  <div
                    onClick={() => handleTabChange("simpan")}
                    className="bg-white border border-slate-200/90 border-b-4 border-b-purple-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Konten Disimpan</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">
                        {savedItems?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 truncate">
                        <Bookmark size={12} className="shrink-0" />
                        <span className="truncate">Bisnis &amp; Event</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Bookmark size={20} />
                    </div>
                  </div>

                  {/* Card 4: Ulasan */}
                  <div
                    onClick={() => handleTabChange("ulasan")}
                    className="bg-white border border-slate-200/90 border-b-4 border-b-amber-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Ulasan Saya</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">
                        {reviews?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 truncate">
                        <Star size={12} className="shrink-0" />
                        <span className="truncate">Rating Diberikan</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Star size={20} />
                    </div>
                  </div>
                </div>

                {/* 3. INTERACTIVE ANALYTICS & CHARTS SECTION */}
                <PortalAnalyticsCharts isSeller={false} stats={userStats} />

                {/* 4. QUICK EXPLORATION SECTION */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-emerald-600" />
                        Jelajahi Portal Surade
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Akses cepat layanan, direktori toko, dan agenda kegiatan</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <Link
                      to="/"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 text-slate-800 transition-all flex flex-col justify-between group no-underline"
                    >
                      <div className="space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Store size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Direktori Bisnis</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Cari toko, kuliner, produk dan layanan UMKM di Surade.</p>
                      </div>
                      <span className="mt-3 text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>Buka Direktori</span>
                        <ArrowRight size={13} />
                      </span>
                    </Link>

                    <Link
                      to="/blog"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 text-slate-800 transition-all flex flex-col justify-between group no-underline"
                    >
                      <div className="space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                          <Calendar size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Event &amp; Berita</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Pantau agenda festival, pengumuman, dan artikel lokal.</p>
                      </div>
                      <span className="mt-3 text-xs font-bold text-blue-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>Lihat Acara</span>
                        <ArrowRight size={13} />
                      </span>
                    </Link>

                    <Link
                      to="/category"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/80 hover:border-purple-200 text-slate-800 transition-all flex flex-col justify-between group no-underline"
                    >
                      <div className="space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Tag size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Kategori Lengkap</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Telusuri UMKM berdasarkan kategori spesifik dengan rapi.</p>
                      </div>
                      <span className="mt-3 text-xs font-bold text-purple-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>Pilih Kategori</span>
                        <ArrowRight size={13} />
                      </span>
                    </Link>

                    <Link
                      to="/contact"
                      className="p-4 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 hover:border-amber-200 text-slate-800 transition-all flex flex-col justify-between group no-underline"
                    >
                      <div className="space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <Phone size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Pusat Bantuan</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Hubungi admin Surade.com untuk bantuan &amp; info kemitraan.</p>
                      </div>
                      <span className="mt-3 text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>Hubungi CS</span>
                        <ArrowRight size={13} />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* 4. RECENT ACTIVITY / PROMO BANNER */}
                <div className="w-full">
                  <PromoAdsSlider isSeller={isSeller} onTabChange={handleTabChange} />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-full min-w-0 flex flex-col gap-[20px]">
                {/* ════ HERO QUICK ACTION BANNER FOR CREATING BUSINESS (3D UI/UX) ════ */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#044e36] via-[#059669] to-[#047857] p-5 sm:p-6 text-white shadow-[0_12px_32px_rgba(5,150,105,0.28),0_4px_12px_rgba(0,0,0,0.1)] border-t border-emerald-300/40 border-l border-emerald-300/30 border-r border-emerald-600/30 border-b border-emerald-700/50">
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        <div className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-white/20 backdrop-blur-md text-white text-[11.5px] font-bold border border-white/30 shadow-sm shrink-0">
                          <Sparkles size={13} className="text-amber-300 animate-pulse" />
                          <span>Mitra &amp; Reseller Surade.com</span>
                        </div>
                        {Boolean(isPremiumSeller && referralStats?.referral_code) && (
                          <div className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-full bg-slate-950/80 border border-teal-400/40 text-[11.5px] font-bold text-teal-300 shadow-md backdrop-blur-md shrink-0">
                            <Gift size={13} className="text-amber-400 shrink-0" />
                            <span className="text-[11px] text-slate-300 font-sans font-medium">Ref:</span>
                            <span className="font-mono text-white font-black tracking-wider text-[11.5px]">{referralStats.referral_code}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const codeToCopy = referralStats.referral_code;
                                if (codeToCopy) {
                                  navigator.clipboard.writeText(codeToCopy);
                                  toast.success(`Kode referral ${codeToCopy} berhasil disalin!`, { icon: '📋' });
                                }
                              }}
                              className="ml-1 px-2.5 h-[22px] rounded-full bg-teal-500/25 hover:bg-teal-500/45 text-teal-200 hover:text-white border border-teal-400/40 flex items-center gap-1 transition-all cursor-pointer text-[10.5px] font-bold shadow-2xs"
                              title="Salin Kode Referral"
                            >
                              <Copy size={11} />
                              <span>Salin</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-1.5 leading-snug drop-shadow-sm">
                        Halo, {displayName || "Mitra"}! 👋 Selamat Datang di Dashboard Penjual
                      </h2>
                      <p className="text-emerald-100/95 text-xs sm:text-sm leading-relaxed">
                        Kelola profil usaha Anda, pantau katalog produk, transaksi WhatsApp, promosi iklan, dan statistik penjualan di satu panel terpadu.
                      </p>
                    </div>
                    <Link
                      to="/add-business"
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm border-b-4 border-b-amber-600 shadow-[0_8px_25px_rgba(245,158,11,0.4)] hover:border-b-2 hover:translate-y-0.5 active:translate-y-1 active:border-b-0 transition-all duration-200 shrink-0 group select-none cursor-pointer"
                    >
                      <Plus size={18} className="stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
                      <span>Buat Usaha Sekarang</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  {/* 3D Floating Glow Orbs */}
                  <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -top-12 right-1/3 w-40 h-40 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />
                </div>

                {/* ── DAILY REWARD HARIAN SILVER WIDGET ── */}
                <DailyRewardWidget onRewardClaimed={() => fetchHeaderPoinBalance && fetchHeaderPoinBalance()} />

                {/* ════ PROGRAM REFERRAL KODE SAYA BANNER & WIDGET (3D UI/UX) ════ */}
                {isPremiumSeller ? (
                  /* PENJUAL PREMIUM AKTIF: TAMPILKAN KODE REFERRAL & STATISTIK */
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-5 text-white shadow-[0_14px_35px_rgba(0,0,0,0.35)] border border-emerald-500/30 border-t-emerald-400/40 relative overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
                    <div className="space-y-2 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 shadow-sm">
                        <Crown size={13} className="text-amber-400" />
                        <span>Referral Penjual Premium Aktif</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        Bagikan Kode Referral &amp; Dapatkan Komisi 10%!
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Ajak rekan pelaku usaha di Surade. Pengguna kode Anda mendapatkan diskon 10% dan Anda mendapatkan komisi tunai 10% dari setiap transaksi yang memenuhi syarat.
                      </p>

                      {/* Ringkasan Statistik Komisi */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                          <span className="text-[10px] text-slate-400 block">Total Komisi:</span>
                          <strong className="text-amber-300 font-black">
                            Rp {Number(referralStats?.earned_commission || 0).toLocaleString("id-ID")}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                          <span className="text-[10px] text-slate-400 block">Komisi Pending:</span>
                          <strong className="text-emerald-300 font-black">
                            Rp {Number(referralStats?.pending_commission || 0).toLocaleString("id-ID")}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 block">Transaksi Berhasil:</span>
                          <strong className="text-white font-black">
                            {Number(referralStats?.successful_referrals || 0).toLocaleString("id-ID")} x
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-700/90 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.4)] flex flex-col gap-3 shrink-0 w-full md:w-80 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">KODE REFERRAL ANDA</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                          Aktif (Premium)
                        </span>
                      </div>

                      <div className="bg-slate-900/90 py-2.5 px-3 rounded-xl border border-teal-500/30 text-center flex items-center justify-center shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
                        <span className="font-mono text-sm font-black text-teal-300 tracking-widest select-all drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]">
                          {referralCode || referralStats?.referral_code}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const codeToCopy = referralCode || referralStats?.referral_code;
                            if (codeToCopy) {
                              navigator.clipboard.writeText(codeToCopy);
                              setReferralCopyToast(true);
                              setTimeout(() => setReferralCopyToast(false), 2500);
                            }
                          }}
                          className="py-2 px-3 rounded-xl bg-gradient-to-b from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 border-b-teal-900 shadow-md active:translate-y-0.5 select-none"
                          title="Salin Kode Referral"
                        >
                          {referralCopyToast ? <Check size={13} /> : <Copy size={13} />}
                          <span>{referralCopyToast ? "Tersalin!" : "Salin Kode"}</span>
                        </button>

                        <button
                          onClick={() => handleShareReferralCode(referralCode || referralStats?.referral_code)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700 border-b-2 border-b-slate-900 shadow-md active:translate-y-0.5 select-none"
                          title="Bagikan Link Referral via WA / Sosial Media"
                        >
                          <Share2 size={13} />
                          <span>Bagi Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* PENJUAL FREE ATAU PREMIUM KEDALUWARSA: AJAKAN UPGRADE PREMIUM UNTUK DAPATKAN REFERRAL */
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 p-5 text-white shadow-xl border border-amber-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/40 shadow-xs">
                        <Crown size={13} className="text-amber-400" />
                        <span>Eksklusif Usaha Premium</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        Aktifkan Hak Referral dengan Upgrade Usaha ke Premium!
                      </h3>
                      <p className="text-xs text-amber-100/80 leading-relaxed">
                        Kode referral dan komisi tunai hanya tersedia untuk penjual dengan status Usaha Premium aktif. Dapatkan komisi 10% dan berikan diskon 10% untuk setiap rekan yang upgrade!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTabChange("premium")}
                      className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer shrink-0 transition-transform active:scale-95"
                    >
                      <Crown size={16} />
                      <span>Upgrade ke Premium Sekarang</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* ════ QUICK WALLET BAR WITH TARIK SALDO GOLD (BISA DIAKSES DARI DASHBOARD) ════ */}
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#062c23] rounded-2xl p-4 sm:p-5 text-white border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
                      <Wallet size={22} className="text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Dompet Digital Poin Surade</span>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-200">
                          <SuradeCoinIcon size={18} type="silver" />
                          <span>{Number(silverBalance || 0).toLocaleString("id-ID")} Silver</span>
                        </div>
                        <span className="text-white/30 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300">
                          <SuradeCoinIcon size={18} type="gold" />
                          <span>{Number(goldBalance || 0).toLocaleString("id-ID")} Gold</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowBuyCoinModal(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border-0"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>+ Beli Poin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGoldWithdrawModal(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <Wallet size={14} />
                      <span>Tarik Saldo Gold</span>
                    </button>
                  </div>
                </div>

                {/* ════ 3D STATS CARDS ROW ════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] sm:gap-[16px] w-full min-w-0">
                  {/* Stat 1: Total Usaha */}
                  <div
                    className="bg-white border border-slate-200/90 border-b-4 border-b-blue-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                    onClick={() => setActiveTab("bisnis")}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Total Usaha</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">{userStats ? userStats.total_businesses : businesses.length}</div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 truncate">
                        <TrendingUp size={12} className="shrink-0" /> <span className="truncate">{userStats ? `${userStats.total_business_views} views` : "Usaha Terdaftar"}</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Briefcase size={20} />
                    </div>
                  </div>

                  {/* Stat 2: Total Event / Info */}
                  <div
                    className="bg-white border border-slate-200/90 border-b-4 border-b-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                    onClick={() => setActiveTab("blog-event")}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Total Event / Info</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">{userStats ? ((userStats.total_events || 0) + (userStats.total_blogs || 0)) : events.length}</div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 truncate">
                        <TrendingUp size={12} className="shrink-0" /> <span className="truncate">{userStats ? `${userStats.total_blog_views || 0} views` : "Info & Event"}</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Calendar size={20} />
                    </div>
                  </div>

                  {/* Stat 3: Total Ulasan */}
                  <div
                    className="bg-white border border-slate-200/90 border-b-4 border-b-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                    onClick={() => setActiveTab("ulasan")}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Total Ulasan</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1">{userStats ? userStats.total_reviews : reviews.length}</div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 truncate">
                        <TrendingUp size={12} className="shrink-0" /> <span className="truncate">Ulasan Usaha</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Star size={20} />
                    </div>
                  </div>

                  {/* Stat 4: Total Views Konten */}
                  <div
                    className="bg-white border border-slate-200/90 border-b-4 border-b-teal-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_18px_35px_-5px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer min-w-0 group"
                    onClick={() => setShowChartDetailModal(true)}
                  >
                    <div className="min-w-0 pr-2">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.06em] mb-1 truncate">Total Views Konten</h3>
                      <div className="text-[22px] sm:text-[24px] font-black text-slate-900 leading-tight mb-1 truncate">{userStats ? userStats.total_views.toLocaleString("id-ID") : 0}</div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 truncate">
                        <TrendingUp size={12} className="shrink-0" /> <span className="truncate">Bisnis &amp; Blog</span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 shadow-md border border-white group-hover:scale-110 transition-transform">
                      <Eye size={20} />
                    </div>
                  </div>
                </div>

                {/* ════ GRAPHICAL & ACTIVITY PANELS (3D UI/UX) ════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0 items-start">
                  {/* 1. KUNJUNGAN HALAMAN USAHA CHART PANEL */}
                  <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] p-5 flex flex-col gap-2.5 min-w-0 relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 truncate flex items-center gap-2">
                          <BarChart2 size={18} className="text-emerald-600" />
                          <span>Kunjungan Halaman Usaha</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Data pengunjung bulan ini</p>
                      </div>
                      <button
                        onClick={() => {
                          setAnalyticsPeriod("monthly");
                          setShowChartDetailModal(true);
                        }}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer px-3 py-1.5 rounded-xl border border-emerald-200 transition-all shrink-0 shadow-xs active:scale-95"
                      >
                        Lihat Detail
                      </button>
                    </div>

                    {/* 3D Bar Chart Visual: Rapat & Presisi Persis Seperti Gambar 2 */}
                    <div className="flex items-end gap-2.5 sm:gap-3 h-36 pt-1 w-full min-w-0">
                      {weeklyChartStats.chartData.map((d, idx) => {
                        // Smart Tooltip Alignment to prevent cutoff on left/right edges
                        const tooltipPositionClass =
                          idx === 0
                            ? "left-0"
                            : idx === weeklyChartStats.chartData.length - 1
                              ? "right-0"
                              : "left-1/2 -translate-x-1/2";

                        return (
                          <div key={d.day} className="flex-1 min-w-0 flex flex-col items-center gap-2 h-full justify-end group relative">
                            {/* Tooltip on hover - Smart positioned & never clipped */}
                            <div
                              className={`absolute bottom-full mb-2 ${tooltipPositionClass} bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30 shadow-xl border border-slate-700`}
                            >
                              <span className="text-emerald-400 block font-semibold">{d.fullDate}</span>
                              <span className="text-slate-200">{d.visits.toLocaleString('id-ID')} views</span>
                            </div>
                            {/* 3D Pillars */}
                            <div className="w-full bg-[#f1f5f9] rounded-t-2xl h-full flex flex-col justify-end overflow-hidden p-0.5 shadow-inner">
                              <div
                                className={`w-full ${d.visits > 0
                                  ? 'bg-gradient-to-t from-[#047857] via-[#059669] to-[#34d399] shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
                                  : 'bg-slate-200/80 min-h-[4px]'
                                  } rounded-t-xl transition-all duration-500 group-hover:brightness-110 relative overflow-hidden`}
                                style={{ height: d.heightPercentage }}
                              >
                                {d.visits > 0 && <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-xl" />}
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold ${d.isToday ? 'text-emerald-600 font-extrabold' : 'text-slate-600'} group-hover:text-emerald-600 transition-colors truncate`}>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. AKTIVITAS TERBARU PANEL */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] p-5 flex flex-col justify-between min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 truncate flex items-center gap-2">
                          <Activity size={18} className="text-emerald-600" />
                          <span>Aktivitas</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">Aktivitas terbaru pada usaha anda</p>
                      </div>
                      <button
                        onClick={() => setShowAllActivitiesModal(true)}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer px-3 py-1.5 rounded-xl border border-emerald-200 transition-all shrink-0 shadow-xs active:scale-95"
                      >
                        Lihat Semua
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5 min-w-0">
                      {recentActivitiesList.slice(0, 4).map((act) => {
                        const IconComp = act.icon;
                        return (
                          <div
                            key={act.id}
                            className="flex gap-3 items-center p-2.5 rounded-xl transition-all hover:bg-slate-50/80 border border-slate-100 hover:border-emerald-200 cursor-pointer min-w-0 overflow-hidden group shadow-xs hover:shadow-sm"
                            onClick={() => {
                              if (act.link) navigate(act.link);
                              else if (act.tab) setActiveTab(act.tab);
                            }}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${act.colorClass}`}>
                              <IconComp size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                                {act.title}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {act.subText} • <span className="font-semibold text-emerald-600">{act.dateStr}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. PREMIUM UPGRADE PROMO BANNER */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917] border border-[#f5c451]/35 p-4 sm:p-5 md:p-[22px_24px] shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-5">
                  <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full bg-[#f5c451]/15 blur-2xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-[#f5c451]/10 blur-xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 z-10 flex-1 min-w-0">
                    {/* Icon & Mobile Badge */}
                    <div className="flex items-center gap-3 sm:block shrink-0">
                      <div
                        className="shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md"
                        style={{
                          background: "linear-gradient(145deg, #fde68a 0%, #f5c451 38%, #b8860b 100%)",
                          boxShadow: "0 8px 20px rgba(184,134,11,0.4), inset 0 1px 2px rgba(255,255,255,0.6)"
                        }}
                      >
                        <Crown size={22} className="text-[#3d2c05] sm:w-[26px] sm:h-[26px]" strokeWidth={2.3} />
                      </div>
                      {/* Badge next to icon on mobile */}
                      <div className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5c451]/15 border border-[#f5c451]/30 text-[#f5d876] text-[10.5px] font-black uppercase tracking-wider">
                        <Sparkles size={11} /> Upgrade Usaha
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Badge above title on sm/desktop */}
                      <div className="hidden sm:inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full bg-[#f5c451]/15 border border-[#f5c451]/30 text-[#f5d876] text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Sparkles size={10} /> Upgrade Usaha
                      </div>
                      <h3 className="text-[15px] sm:text-[17px] md:text-[18px] font-extrabold text-white leading-snug tracking-tight">
                        Dapatkan Badge Centang Emas Resmi &amp; Prioritas Pencarian
                      </h3>
                      <p className="text-[12px] sm:text-[12.5px] text-[#d6d3d1] leading-relaxed max-w-[650px]">
                        Tingkatkan kredibilitas toko Anda dengan posisi teratas, rute Google Maps interaktif, katalog tanpa batas, dan verifikasi centang emas resmi.
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <button
                    type="button"
                    onClick={() => handleTabChange("premium")}
                    className="z-10 w-full md:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-extrabold text-[13px] text-slate-950 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer border-0 shrink-0"
                    style={{
                      background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                      boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                    }}
                  >
                    <Crown size={15} strokeWidth={2.5} />
                    <span>Upgrade ke Premium</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          )}

          {/* 1.5 Surade Poin WALLET TAB */}
          {activeTab === "coin" && (
            <SuradeCoinTab
              navigate={navigate}
              setActiveTab={setActiveTab}
              onBalanceUpdate={(bal) => setPoinBalance(Number(bal) || 0)}
            />
          )}

          {/* NOMOR DARURAT TAB */}
          {activeTab === "nomor-darurat" && (
            <SellerNomorDaruratTab />
          )}

          {/* KLAIM USAHA TAB */}
          {activeTab === "klaim" && renderKlaimView()}

          {/* 2. USAHA VIEW */}
          {activeTab === "bisnis" && (
            <div className="flex flex-col gap-[20px] w-full max-w-full">
              {/* Header Banner */}
              <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-[24px_28px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
                <div className="space-y-[4px] z-10">
                  <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight flex items-center gap-[10px]">
                    <Briefcase className="text-[#5eead4]" size={24} />
                    Kelola Usaha Saya
                  </h2>
                  <p className="text-[13px] text-slate-300 max-w-[640px] font-normal leading-relaxed">
                    Daftar seluruh profil tempat usaha yang Anda miliki di portal Surade.com. Atur informasi, kategori, dan produk usaha Anda di sini.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/add-business")}
                  className="w-full md:w-auto h-[42px] inline-flex items-center justify-center gap-[8px] bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-[20px] rounded-[11px] font-bold text-[13px] transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Tambah Usaha</span>
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
                    <div className="text-[11.5px] text-[#64748b] mt-[3px]">Total Usaha</div>
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
                      <span>{businesses.filter(b => b.status === "active" || b.status === "approved" || b.status === "published" || b.status === "Aktif").length}</span>
                      <span className="text-[11px] font-normal text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-[7px] py-[1px] rounded-full">
                        Aktif
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#64748b] mt-[3px]">
                      {businesses.filter(b => b.status === "pending" || b.status === "Menunggu" || b.status === "waiting_approval").length > 0
                        ? `${businesses.filter(b => b.status === "pending" || b.status === "Menunggu" || b.status === "waiting_approval").length} Menunggu Verifikasi`
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
                      placeholder="Cari nama usaha, kota, atau pemilik..."
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
                        {availableCategories.map((mainCat) => {
                          const hasSubs = Array.isArray(mainCat.children) && mainCat.children.length > 0;
                          if (hasSubs) {
                            return (
                              <optgroup key={mainCat.id || mainCat.name} label={`📁 ${mainCat.name}`}>
                                {mainCat.children.map((sub) => (
                                  <option key={sub.id || sub.name} value={sub.name}>
                                    {sub.name}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          }
                          return (
                            <option key={mainCat.id || mainCat.name} value={mainCat.name}>
                              {mainCat.name}
                            </option>
                          );
                        })}
                        {/* Kategori usaha yang ada di data bisnis tapi belum ada di list utama */}
                        {businesses
                          .map((b) => b.category)
                          .filter((cat) => Boolean(cat) && !availableCategories.some((c) => c.name === cat || c.children?.some((s) => s.name === cat)))
                          .map((extraCat) => (
                            <option key={extraCat} value={extraCat}>
                              {extraCat}
                            </option>
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
                        <option value="active">Aktif / Disetujui</option>
                        <option value="pending">Menunggu Persetujuan</option>
                        <option value="rejected">Ditolak / Perlu Revisi</option>
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
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs my-4">
                    <SuradeLoader
                      variant="section"
                      size="md"
                      text="Memuat data usaha"
                      minHeight="180px"
                    />
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
                    if (businessCategoryFilter !== "Semua") {
                      const target = businessCategoryFilter.toLowerCase().trim();
                      const cName = (b.category || "").toLowerCase().trim();
                      const sName = (b.subCategory || "").toLowerCase().trim();
                      if (cName !== target && sName !== target) {
                        return false;
                      }
                    }
                    // Status filter
                    if (businessStatusFilter !== "Semua") {
                      const st = (b.status || "").toLowerCase();
                      if (businessStatusFilter === "active" && st !== "active" && st !== "aktif" && st !== "approved" && st !== "published") return false;
                      if (businessStatusFilter === "pending" && st !== "pending" && st !== "menunggu") return false;
                      if (businessStatusFilter === "rejected" && st !== "rejected" && st !== "ditolak") return false;
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
                      <div className="w-full overflow-x-auto border border-[#e2e8f0] rounded-[12px] shadow-sm bg-white">
                        <table className="w-full text-left border-collapse min-w-[740px]">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                              <th className="px-3.5 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[35%]">Usaha &amp; Kategori</th>
                              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[25%]">Lokasi &amp; Jam Buka</th>
                              <th className="px-2 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center w-[10%]">Produk</th>
                              <th className="px-2.5 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center w-[14%]">Status</th>
                              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-right w-[16%]">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {currentItems.map((biz) => {
                              const st = (biz.status || biz.raw?.status || "").toLowerCase();
                              const isApproved = st === "approved" || st === "published" || st === "active" || st === "aktif" || st === "disetujui";
                              const isPending = st === "pending" || st === "menunggu";
                              const isRejected = st === "rejected" || st === "ditolak";
                              const isPremExpired = Boolean(
                                (biz.premium_expires_at && new Date(biz.premium_expires_at) <= new Date()) ||
                                (biz.raw?.premium_expires_at && new Date(biz.raw.premium_expires_at) <= new Date())
                              );
                              const isPrem = !isPremExpired && Boolean(biz.is_premium || biz.raw?.is_premium || biz.raw?.features?.is_premium);
                              const subs = biz.subscriptions || biz.raw?.subscriptions || [];
                              const latestSub = subs[0];
                              const subStatus = (latestSub?.status || "").toLowerCase();
                              const paymentStatus = (latestSub?.payment?.status || "").toLowerCase();

                              const isSubPending = (subStatus === "pending" || paymentStatus === "pending") && subStatus !== "cancelled" && subStatus !== "rejected" && paymentStatus !== "rejected";
                              const isSubNeedsRevision = subStatus === "needs_revision" || paymentStatus === "needs_revision";
                              const isSubRejected = (subStatus === "rejected" || subStatus === "cancelled" || paymentStatus === "rejected") && Boolean(latestSub?.payment || latestSub?.plan);

                              const isPendingSub = !isPrem && (biz.has_pending_subscription || isSubPending) && !isSubRejected && !isSubNeedsRevision;
                              const isRevisionSub = !isPrem && Boolean(biz.has_revision_subscription || isSubNeedsRevision);
                              const hasUpgradeIssue = isApproved && (isRevisionSub || isSubRejected) && !isPrem;

                              return (
                                <tr key={biz.id} className="hover:bg-[#f8fafc] transition-colors">
                                  {/* Bisnis & Kategori + Thumbnail Foto */}
                                  <td className="px-3.5 py-2.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-[38px] h-[38px] rounded-[10px] overflow-hidden bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                                        {biz.image ? (
                                          <SafeImage
                                            src={biz.image}
                                            alt={biz.name}
                                            className="w-full h-full object-cover"
                                            fallback="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"
                                          />
                                        ) : null}
                                        <div
                                          className="w-full h-full flex items-center justify-center text-[#94a3b8] bg-[#f1f5f9]"
                                          style={{ display: biz.image ? "none" : "flex" }}
                                        >
                                          <Briefcase size={17} />
                                        </div>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-nowrap">
                                          <span className="font-bold text-[13px] text-[#0f172a] truncate max-w-[160px] sm:max-w-[210px]" title={biz.name}>
                                            {biz.name}
                                          </span>
                                          {isRejected ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                                              Ditolak
                                            </span>
                                          ) : biz.status === "needs_revision" ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                              Perlu Revisi
                                            </span>
                                          ) : isPrem ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                                              <Crown size={10} className="text-amber-600 shrink-0" />
                                              <span>Premium</span>
                                            </span>
                                          ) : hasUpgradeIssue ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-400 shrink-0" title="Pembayaran upgrade perlu perbaikan">
                                              <AlertCircle size={10} className="text-amber-700 shrink-0" />
                                              <span>{isRevisionSub ? "Perlu Revisi Upgrade" : "Perlu Perbaikan Bayar"}</span>
                                            </span>
                                          ) : isPendingSub ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-400 shrink-0" title="Paket Premium sedang diverifikasi admin">
                                              <Crown size={10} className="text-amber-700 shrink-0" />
                                              <span>{latestSub?.plan?.name || "Premium"} (Menunggu)</span>
                                            </span>
                                          ) : isApproved ? (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/add-business/${biz.id}?upgrade=true&step=3`);
                                              }}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer border-0 hover:scale-105 active:scale-95 shadow-xs"
                                              style={{
                                                background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                                                boxShadow: "0 2px 6px rgba(217, 119, 6, 0.35), inset 0 1px 0 #ffffff, inset 0 -1px 0 #78350f",
                                              }}
                                              title="Klik untuk upgrade bisnis ini ke Paket Premium"
                                            >
                                              <Crown size={9} className="text-slate-950" strokeWidth={2.5} />
                                              <span>Free • Upgrade</span>
                                            </button>
                                          ) : null}

                                          {/* CTA / Status Iklan untuk Usaha Ini */}
                                          {isApproved && (() => {
                                            const bizAds = (advertisements || []).filter(
                                              (a) => Number(a?.business_id) === Number(biz.id) || Number(a?.business?.id) === Number(biz.id)
                                            );
                                            const activeAd = bizAds.find(
                                              (a) => (a?.status === "active" || a?.status === "approved") && (!a?.end_date || new Date(a.end_date) >= new Date())
                                            );
                                            const pendingAd = bizAds.find(
                                              (a) => a?.status === "pending" || a?.payment_status === "pending"
                                            );

                                            if (activeAd) {
                                              return (
                                                <span
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 shrink-0 shadow-2xs"
                                                  title="Usaha ini memiliki iklan yang sedang aktif tayang"
                                                >
                                                  <Megaphone size={10} className="text-emerald-600" />
                                                  <span>Iklan Aktif</span>
                                                </span>
                                              );
                                            }

                                            if (pendingAd) {
                                              return (
                                                <span
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shrink-0"
                                                  title="Pengajuan iklan untuk usaha ini sedang menunggu verifikasi admin"
                                                >
                                                  <Clock size={10} className="text-amber-600" />
                                                  <span>Iklan Menunggu</span>
                                                </span>
                                              );
                                            }

                                            return (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleTabChange("iklan");
                                                  handleOpenCreateAdModal(biz.id);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-extrabold text-white bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 hover:from-teal-600 hover:to-emerald-700 active:scale-95 transition-all cursor-pointer border-0 shadow-xs hover:shadow-sm shrink-0"
                                                title="Usaha ini belum beriklan. Klik di sini untuk pasang iklan promosi!"
                                              >
                                                <Megaphone size={10} className="animate-bounce" />
                                                <span>Ayo Pasang Iklan!</span>
                                              </button>
                                            );
                                          })()}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-[#f1f5f9] text-[#475569]">
                                            {biz.category}
                                          </span>
                                          {biz.subCategory && (
                                            <span className="text-[10.5px] text-[#94a3b8] truncate max-w-[110px]">
                                              · {biz.subCategory}
                                            </span>
                                          )}
                                        </div>
                                        {/* Revision & Rejection banners */}
                                        {hasUpgradeIssue ? (
                                          <div className="mt-1.5 p-2.5 rounded-xl border text-xs space-y-1 bg-amber-50 border-amber-300 text-amber-900">
                                            <div className="flex items-center gap-1.5 font-bold">
                                              <AlertCircle size={14} className="text-amber-600 shrink-0" />
                                              <span>
                                                {isRevisionSub
                                                  ? "Perlu Perbaikan Pembayaran Upgrade:"
                                                  : "Perlu Perbaikan / Pembayaran Upgrade Ditolak:"}
                                              </span>
                                            </div>
                                            <p className="text-[11.5px] leading-snug pl-5">
                                              {latestSub?.payment?.notes || latestSub?.notes || biz.rejection_reason || (isRevisionSub ? "Bukti transfer / pembayaran upgrade memerlukan perbaikan dari Admin." : "Bukti transfer pembayaran upgrade ditolak oleh Admin. Silakan perbaiki bukti pembayaran atau ajukan upgrade ulang.")}
                                            </p>
                                            <div className="pt-1.5 pl-5">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  navigate(`/add-business/${biz.id}?upgrade=true&step=3`);
                                                }}
                                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                              >
                                                <CreditCard size={12} />
                                                <span>Perbaiki Pembayaran / Upgrade Ulang</span>
                                              </button>
                                            </div>
                                          </div>
                                        ) : (biz.status === "needs_revision" || isRejected) ? (
                                          <div className={`mt-1.5 p-2.5 rounded-xl border text-xs space-y-1 ${biz.status === "needs_revision"
                                            ? "bg-amber-50 border-amber-300 text-amber-900"
                                            : "bg-rose-50 border-rose-200 text-rose-800"
                                            }`}>
                                            <div className="flex items-center gap-1.5 font-bold">
                                              <AlertCircle size={14} className={biz.status === "needs_revision" ? "text-amber-600 shrink-0" : "text-rose-600 shrink-0"} />
                                              <span>
                                                {biz.status === "needs_revision"
                                                  ? "Perlu Perbaikan (Revisi) dari Admin:"
                                                  : "Ditolak Permanen oleh Admin:"}
                                              </span>
                                            </div>
                                            <p className="text-[11.5px] leading-snug pl-5">
                                              {biz.rejection_reason || biz.raw?.rejection_reason || "Data usaha memerlukan penyesuaian dari Admin."}
                                            </p>
                                            {biz.status === "needs_revision" && (
                                              <div className="pt-1.5 pl-5">
                                                <button
                                                  type="button"
                                                  onClick={() => navigate(`/add-business/${biz.id}`)}
                                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                >
                                                  <Edit size={12} />
                                                  <span>Perbaiki Data Usaha / Bukti Transfer</span>
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Lokasi & Jam Buka */}
                                  <td className="px-3 py-2.5">
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                                        <MapPin size={13} className="text-[#059669] shrink-0" />
                                        {biz.city || "Indonesia"}
                                      </span>
                                      {(() => {
                                        const hours = formatBizOpeningHours(biz);
                                        const days = biz.opening_days || biz.raw?.opening_days;
                                        let daysLabel = "Setiap Hari";
                                        if (Array.isArray(days) && days.length > 0) {
                                          const first = typeof days[0] === "object" ? days[0].day : days[0];
                                          const last = typeof days[days.length - 1] === "object" ? days[days.length - 1].day : days[days.length - 1];
                                          if (days.length === 7) daysLabel = "Setiap Hari";
                                          else if (days.length === 5 && first === "Senin" && last === "Jumat") daysLabel = "Senin - Jumat";
                                          else if (days.length === 6 && first === "Senin" && last === "Sabtu") daysLabel = "Senin - Sabtu";
                                          else daysLabel = `${first} - ${last}`;
                                        }
                                        const is24h = hours.includes("24 Jam");

                                        return (
                                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                                            <Clock size={11} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{hours} ({is24h ? "24 Jam" : daysLabel})</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  </td>

                                  {/* Produk */}
                                  <td className="px-2 py-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedBusinessForProducts(biz.id);
                                        setActiveTab("produk");
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#059669] border border-[#ccfbf1] hover:bg-[#059669] hover:text-white transition-all cursor-pointer shadow-2xs"
                                      title="Lihat & Kelola Produk Bisnis Ini"
                                    >
                                      <Package size={11} />
                                      {biz.products?.length || 0} Item
                                    </button>
                                  </td>

                                  {/* Status & Tanggal */}
                                  <td className="px-2.5 py-2.5 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${isApproved
                                          ? "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]"
                                          : isPending
                                            ? "bg-[#fefce8] text-[#a16207] border border-[#fef08a]"
                                            : isRejected
                                              ? "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]"
                                              : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
                                          }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-[#16a34a]" : isPending ? "bg-[#ca8a04]" : "bg-[#dc2626]"
                                            }`}
                                        />
                                        {isApproved ? "Disetujui" : isPending ? "Menunggu" : isRejected ? "Ditolak" : "Nonaktif"}
                                      </span>
                                      {isPendingSub && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                          <Clock size={10} /> Diproses
                                        </span>
                                      )}
                                      {isRevisionSub && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                          <AlertCircle size={10} /> Revisi Upgrade
                                        </span>
                                      )}
                                      <span className="text-[10px] text-[#94a3b8] font-medium">
                                        {biz.date}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="px-3 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Jika Ditolak Permanen: Hanya bisa Hapus */}
                                      {isRejected ? (
                                        <button
                                          onClick={() => handleDeleteBusiness(biz.id)}
                                          className="w-[30px] h-[30px] rounded-lg bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          title="Hapus Data Usaha yang Ditolak"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      ) : biz.status === "needs_revision" ? (
                                        <>
                                          <button
                                            onClick={() => navigate(`/add-business/${biz.id}`)}
                                            className="h-[30px] px-2.5 rounded-lg text-white flex items-center justify-center gap-1 transition-all cursor-pointer border-0 hover:bg-amber-700 font-bold text-[11px] shrink-0 bg-amber-600 shadow-sm"
                                            title="Perbaiki Data Usaha / Bukti Transfer"
                                          >
                                            <Edit size={13} className="shrink-0" />
                                            <span>Perbaiki Data</span>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteBusiness(biz.id)}
                                            className="w-[30px] h-[30px] rounded-lg bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                            title="Hapus Usaha"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {/* Perbaiki Upgrade button for Revision upgrade or Rejected upgrade payment */}
                                          {hasUpgradeIssue && (
                                            <button
                                              onClick={() => {
                                                navigate(`/add-business/${biz.id}?upgrade=true&step=3`);
                                              }}
                                              className="h-[30px] px-2.5 rounded-lg text-white flex items-center justify-center gap-1 transition-all cursor-pointer border-0 hover:bg-amber-700 font-bold text-[11px] shrink-0 bg-amber-600 shadow-sm"
                                              title="Perbaiki Pembayaran Upgrade"
                                            >
                                              <CreditCard size={13} className="shrink-0" />
                                              <span className="hidden sm:inline">Perbaiki Bayar</span>
                                            </button>
                                          )}
                                          {/* Upgrade button only for Free businesses without pending/revision subscription */}
                                          {isApproved && !isPrem && !isPendingSub && !hasUpgradeIssue && !isPending && (
                                            <button
                                              onClick={() => {
                                                navigate(`/add-business/${biz.id}?upgrade=true&step=3`);
                                              }}
                                              className="h-[30px] px-2.5 rounded-lg text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer border-0 hover:scale-105 active:scale-95 font-bold text-[11px] shrink-0"
                                              style={{
                                                background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                                                boxShadow: "0 2px 6px rgba(217, 119, 6, 0.4), inset 0 1px 0 #ffffff, inset 0 -1px 0 #78350f",
                                              }}
                                              title="Upgrade usaha ini ke Paket Premium (Centang Emas)"
                                            >
                                              <Crown size={13} className="shrink-0 text-slate-950" strokeWidth={2.5} />
                                              <span className="hidden sm:inline">Upgrade</span>
                                            </button>
                                          )}
                                          {/* View */}
                                          {isApproved && (
                                            <button
                                              onClick={() => window.open(`/business/${biz.slug || biz.raw?.slug || biz.id}`, "_blank")}
                                              className="w-[30px] h-[30px] rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                              title="Lihat Halaman Usaha (Buka Tab Baru)"
                                            >
                                              <Eye size={14} />
                                            </button>
                                          )}
                                          {/* Edit */}
                                          {isApproved && (
                                            <button
                                              onClick={() => handleEditBusiness(biz)}
                                              className="w-[30px] h-[30px] rounded-lg bg-[#fefce8] text-[#ca8a04] hover:bg-[#ca8a04] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                              title="Edit Profil Usaha"
                                            >
                                              <Edit size={14} />
                                            </button>
                                          )}
                                          {/* Manage Products */}
                                          {isApproved && (
                                            <button
                                              onClick={() => {
                                                setSelectedBusinessForProducts(biz.id);
                                                setActiveTab("produk");
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                              }}
                                              className="w-[30px] h-[30px] rounded-lg bg-[#f0fdfa] text-[#059669] hover:bg-[#059669] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                              title="Kelola Produk Usaha"
                                            >
                                              <Package size={14} />
                                            </button>
                                          )}
                                          {/* Delete */}
                                          <button
                                            onClick={() => handleDeleteBusiness(biz.id)}
                                            className="w-[30px] h-[30px] rounded-lg bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                            title="Hapus Usaha"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      )}
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
                          <span className="font-bold text-[#059669]">{totalItems}</span> usaha
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
                                  className={`w-[30px] h-[30px] flex items-center justify-center rounded-[7px] text-[12.5px] font-medium transition-colors cursor-pointer ${page === safePage
                                    ? "bg-[#059669] text-white"
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
                      <div className="w-[56px] h-[56px] rounded-full bg-[#f0fdfa] text-[#059669] flex items-center justify-center border border-[#ccfbf1]">
                        <Briefcase size={26} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-[#0f172a]">Belum Ada Usaha</h3>
                        <p className="text-[12.5px] text-[#64748b] mt-[4px] max-w-[340px] leading-relaxed">
                          {businessSearch || businessCategoryFilter !== "Semua" || businessStatusFilter !== "Semua"
                            ? "Tidak ada usaha yang cocok dengan kata kunci atau filter yang Anda pilih."
                            : "Anda belum mendaftarkan profil usaha di portal Surade.com."}
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
                          className="inline-flex items-center gap-[6px] px-[18px] py-[9px] bg-[#059669] hover:bg-[#005f5b] text-white rounded-[10px] font-bold text-[12.5px] transition-colors cursor-pointer shadow-sm"
                        >
                          <Plus size={16} />
                          <span>Tambah Usaha Pertama</span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


          {/* 3. INFO & EVENT COMBINED VIEW */}
          {activeTab === "blog-event" && (
            <div className="space-y-6 w-full max-w-full">
              {/* 1. COMPACT HERO BANNER CARD */}
              <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-[24px_28px] shadow-md flex flex-col md:flex-row items-center justify-between gap-[20px]">
                <div className="space-y-[6px] z-10 max-w-xl">
                  <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight flex items-center gap-[10px]">
                    <FileText className="text-[#5eead4]" size={24} />
                    Publikasi Info & Agenda Event Surade
                  </h2>
                  <p className="text-[13px] text-slate-200 max-w-[640px] font-normal leading-relaxed">
                    Kelola, pantau, dan bagikan cerita serta acara terbaik Anda untuk audiens yang lebih luas.
                  </p>
                </div>

                {/* Hero Banner Background Image / Illustration */}
                <div className="w-full md:w-[320px] h-32 md:h-28 rounded-xl overflow-hidden shrink-0 relative shadow-md border border-white/20">
                  <img
                    src={bannerEventSurade}
                    alt="Event & Info Surade"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
              </div>

              {/* 1.5 PRICING CARDS SHOWCASE (BIAYA PASANG & MASA AKTIF DARI ADMIN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Info Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-teal-50/40 border border-teal-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#059669] flex items-center justify-center font-bold">
                          <FileText size={16} />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Publikasi Info &amp; Berita</h3>
                      </div>
                      <span className="bg-teal-100 text-[#059669] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        AKTIF {userContentPricing.blog_duration ? userContentPricing.blog_duration.toUpperCase() : "1 BULAN"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Kelola dan publikasikan cerita bisnis, promosi, atau liputan berita usaha Anda agar menjangkau audiens luas dengan masa tayang 1 bulan penuh.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Biaya Pasang</span>
                      <span className="text-lg font-black text-[#059669]">
                        Rp {Number(userContentPricing.blog || 10000).toLocaleString("id-ID")}{" "}
                        <span className="text-[11px] font-medium text-slate-500">/ {userContentPricing.blog_duration?.toLowerCase() || "bulan"}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/add-blog?type=blog")}
                      className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Buat Info Baru</span>
                    </button>
                  </div>
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-purple-50/40 border border-purple-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                          <Calendar size={16} />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Publikasi Agenda Event</h3>
                      </div>
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        AKTIF {userContentPricing.event_duration ? userContentPricing.event_duration.toUpperCase() : "1 BULAN"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Bagikan agenda acara festival, promo, atau workshop Anda kepada audiens yang lebih luas di portal Surade.com selama 1 bulan penuh.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Biaya Pasang</span>
                      <span className="text-lg font-black text-purple-700">
                        Rp {Number(userContentPricing.event || 15000).toLocaleString("id-ID")}{" "}
                        <span className="text-[11px] font-medium text-slate-500">/ {userContentPricing.event_duration?.toLowerCase() || "bulan"}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/add-blog?type=event")}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Buat Event Baru</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. MAIN CONTENT CARD (SEARCH, BUTTON, TABS, TABLE & PAGINATION) */}
              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-6 w-full">
                {/* SEARCH BAR & BUAT INFO BARU BUTTON IN ONE FULL-WIDTH ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  {/* Search input - fills all remaining space */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Temukan info atau event yang Anda buat..."
                      value={blogSearch}
                      onChange={(e) => {
                        setBlogSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Buat Info & Buat Event Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => navigate("/add-blog?type=blog")}
                      className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4b] text-white px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      <span>Buat Info Baru</span>
                    </button>

                    <button
                      onClick={() => navigate("/add-blog?type=event")}
                      className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] active:bg-[#5b21b6] text-white px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      <Calendar size={18} strokeWidth={2} />
                      <span>Buat Event Baru</span>
                    </button>
                  </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex items-center gap-6 border-b border-slate-100 pb-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs sm:text-sm font-semibold">
                  {["Semua", "Info", "Event", "Published", "Menunggu Persetujuan", "Perlu Perbaikan", "Ditolak", "Draft"].map((tab) => {
                    const isActive = filterTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setFilterTab(tab);
                          setCurrentPage(1);
                        }}
                        className={`transition-all whitespace-nowrap pb-3 -mb-[2px] cursor-pointer ${isActive
                          ? "text-[#059669] border-b-2 border-[#007570] font-bold"
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
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs my-4">
                    <SuradeLoader
                      variant="section"
                      size="md"
                      text="Memuat data info & event"
                      minHeight="180px"
                    />
                  </div>
                ) : (() => {
                  const safeBlogs = Array.isArray(blogs) ? blogs : [];
                  const safeEvents = Array.isArray(events) ? events : [];
                  const combinedList = [
                    ...safeBlogs.map((b) => ({ ...b, itemType: "blog" })),
                    ...safeEvents.map((e) => ({ ...e, itemType: "event" })),
                  ];

                  // Filter based on tab and search keyword
                  const filtered = combinedList.filter((item) => {
                    const st = (item.status || "").toLowerCase();
                    // Exclude drafts & unpaid items from non-Draft tabs (Semua, Info, Event, Published, Menunggu, Ditolak)
                    const isDraftOrUnpaid = st === "draft" || st === "waiting_payment";
                    if (filterTab !== "Draft" && isDraftOrUnpaid) return false;

                    // Tab filter
                    if ((filterTab === "Info" || filterTab === "Blog") && item.itemType !== "blog") return false;
                    if (filterTab === "Event" && item.itemType !== "event") return false;
                    if (filterTab === "Published" && !(st === "published" || st === "approved" || st === "terbit")) return false;
                    if (filterTab === "Menunggu Persetujuan" && !(st === "pending" || st === "menunggu")) return false;
                    if (filterTab === "Perlu Perbaikan" && !(st === "needs_revision" || st === "revision")) return false;
                    if (filterTab === "Ditolak" && !(st === "rejected" || st === "failed" || st === "ditolak")) return false;
                    if (filterTab === "Draft" && !isDraftOrUnpaid) return false;

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
                      {/* DESKTOP TABLE VIEW */}
                      <div className="hidden md:block w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-3.5 w-[42%] font-semibold">Info & Event</th>
                              <th className="py-2.5 px-3 w-[22%] font-semibold">Kategori & Tanggal</th>
                              <th className="py-2.5 px-2.5 w-[18%] text-center font-semibold">Status</th>
                              <th className="py-2.5 px-3 w-[18%] text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentData.map((item) => {
                              const st = (item.status || "").toLowerCase();
                              const isPublished = st === "approved" || st === "published" || st === "terbit";
                              const isPending = st === "pending" || st === "menunggu";
                              const isWaitingPayment = st === "waiting_payment";
                              const isDraft = st === "draft";
                              const isRejected = st === "rejected" || st === "failed" || st === "ditolak";

                              return (
                                <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-50/60 transition-colors">
                                  {/* Info & Event (Cover + Judul + Tipe/Penulis) */}
                                  <td className="py-2.5 px-3.5 align-middle">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
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
                                          {item.itemType === "event" ? <Calendar size={15} /> : <FileText size={15} />}
                                        </div>
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <span
                                          className="font-bold text-slate-900 text-[13px] truncate block leading-snug cursor-pointer hover:text-[#059669] transition-colors"
                                          onClick={() => navigate(`/blog/${item.id}`)}
                                          title={item.title}
                                        >
                                          {item.title}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 truncate">
                                          <span className={`font-semibold ${item.itemType === "event" ? "text-purple-600" : "text-teal-600"}`}>
                                            {item.itemType === "event" ? "🎪 Event" : "📝 Info"}
                                          </span>
                                          <span>·</span>
                                          <span className="truncate text-slate-400">oleh {item.author || "User"}</span>
                                        </div>

                                        {(isRejected || item.status === "needs_revision") && (
                                          <div className={`mt-1.5 p-2 rounded-lg text-[11px] space-y-0.5 border ${item.status === "needs_revision"
                                            ? "bg-amber-50 border-amber-200 text-amber-900"
                                            : "bg-rose-50 border-rose-200 text-rose-800"
                                            }`}>
                                            <div className={`flex items-center gap-1 font-bold ${item.status === "needs_revision" ? "text-amber-900" : "text-rose-900"
                                              }`}>
                                              <AlertCircle size={13} className={`shrink-0 ${item.status === "needs_revision" ? "text-amber-600" : "text-rose-600"
                                                }`} />
                                              <span>{item.status === "needs_revision" ? "Catatan Perbaikan dari Admin:" : "Alasan Penolakan dari Admin:"}</span>
                                            </div>
                                            <p className={`text-[10.5px] leading-relaxed pl-4 ${item.status === "needs_revision" ? "text-amber-800" : "text-rose-700"
                                              }`}>
                                              {item.rejection_reason || (item.status === "needs_revision" ? "Admin meminta perbaikan data atau materi konten. Silakan klik tombol 'Perbaiki'." : "Konten belum memenuhi syarat.")}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Kategori & Tanggal */}
                                  <td className="py-2.5 px-3 align-middle">
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10.5px] font-bold inline-block self-start truncate max-w-[140px] ${getCategoryBadgeClass(
                                          item.category
                                        )}`}
                                      >
                                        {item.category}
                                      </span>
                                      <span className="text-[11px] text-slate-400 font-medium truncate">
                                        📅 {item.date ? (item.date.includes("T") ? new Date(item.date).toLocaleDateString("id-ID") : item.date) : "-"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-2.5 px-2.5 text-center align-middle">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${isPublished
                                        ? "bg-[#e6f4ea] text-[#137333] border border-[#bbf7d0]"
                                        : item.status === "needs_revision"
                                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                                          : isPending
                                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                                            : isWaitingPayment
                                              ? "bg-orange-50 text-orange-800 border border-orange-200"
                                              : isRejected
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                        }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${isPublished
                                          ? "bg-[#16a34a]"
                                          : item.status === "needs_revision"
                                            ? "bg-amber-600"
                                            : isPending
                                              ? "bg-amber-500 animate-pulse"
                                              : isWaitingPayment
                                                ? "bg-orange-500 animate-pulse"
                                                : isRejected
                                                  ? "bg-rose-600"
                                                  : "bg-slate-400"
                                          }`}
                                      />
                                      {isPublished
                                        ? "Published"
                                        : item.status === "needs_revision"
                                          ? "Perlu Perbaikan"
                                          : isPending
                                            ? "Menunggu Persetujuan"
                                            : isWaitingPayment
                                              ? "Belum Dibayar (Draft)"
                                              : isRejected
                                                ? "Ditolak"
                                                : "Draft"}
                                    </span>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="py-2.5 px-3 text-right align-middle">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Jika Ditolak Permanen: Hanya bisa Hapus */}
                                      {isRejected ? (
                                        <button
                                          onClick={() =>
                                            item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                          }
                                          title="Hapus Konten yang Ditolak"
                                          className="w-[30px] h-[30px] rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      ) : item.status === "needs_revision" ? (
                                        <>
                                          <button
                                            onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                            title="Perbaiki Data Konten / Bukti Pembayaran"
                                            className="h-[30px] px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                                          >
                                            <Edit size={13} />
                                            <span>Perbaiki</span>
                                          </button>
                                          <button
                                            onClick={() =>
                                              item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                            }
                                            title="Hapus"
                                            className="w-[30px] h-[30px] rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {/* Lanjutkan Draft / Pembayaran Button */}
                                          {(isDraft || isWaitingPayment) && (
                                            <button
                                              onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                              title="Lanjutkan Pengisian & Pembayaran"
                                              className="h-[30px] px-2.5 rounded-lg bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                                            >
                                              <CreditCard size={13} />
                                              <span className="hidden sm:inline">Lanjutkan</span>
                                            </button>
                                          )}

                                          {/* View Button */}
                                          {isPublished && (
                                            <button
                                              onClick={() => navigate(`/blog/${item.id}`)}
                                              title="Lihat"
                                              className="w-[30px] h-[30px] rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                            >
                                              <Eye size={14} />
                                            </button>
                                          )}

                                          {/* Edit Button */}
                                          <button
                                            onClick={() => handleEditBlog(item)}
                                            title="Edit"
                                            className="w-[30px] h-[30px] rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          >
                                            <Edit size={14} />
                                          </button>

                                          {/* Delete Button */}
                                          <button
                                            onClick={() =>
                                              item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                            }
                                            title="Hapus"
                                            className="w-[30px] h-[30px] rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* MOBILE CARD VIEW */}
                      <div className="md:hidden space-y-3">
                        {currentData.map((item) => {
                          const st = (item.status || "").toLowerCase();
                          const isPublished = st === "approved" || st === "published" || st === "terbit";
                          const isPending = st === "pending" || st === "menunggu";
                          const isWaitingPayment = st === "waiting_payment";
                          const isDraft = st === "draft";
                          const isRejected = st === "rejected" || st === "failed" || st === "ditolak";

                          return (
                            <div
                              key={`mobile-${item.itemType}-${item.id}`}
                              className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs"
                            >
                              {/* Top: Image + Title + Author */}
                              <div className="flex items-start gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
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

                                <div className="min-w-0 flex-1">
                                  <h4
                                    className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 cursor-pointer hover:text-[#059669] transition-colors"
                                    onClick={() => navigate(`/blog/${item.id}`)}
                                  >
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                    <span className={`font-bold ${item.itemType === "event" ? "text-purple-600" : "text-teal-600"}`}>
                                      {item.itemType === "event" ? "🎪 Event" : "📝 Info"}
                                    </span>
                                    <span>·</span>
                                    <span className="truncate text-slate-400">oleh {item.author || "User"}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Middle: Badges (Category + Date + Status) */}
                              <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCategoryBadgeClass(
                                      item.category
                                    )}`}
                                  >
                                    {item.category}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    📅 {item.date ? (item.date.includes("T") ? new Date(item.date).toLocaleDateString("id-ID") : item.date) : "-"}
                                  </span>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isPublished
                                    ? "bg-[#e6f4ea] text-[#137333] border border-[#bbf7d0]"
                                    : isPending
                                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                                      : isWaitingPayment
                                        ? "bg-orange-50 text-orange-800 border border-orange-200"
                                        : isRejected
                                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${isPublished
                                      ? "bg-[#16a34a]"
                                      : isPending
                                        ? "bg-amber-500 animate-pulse"
                                        : isWaitingPayment
                                          ? "bg-orange-500 animate-pulse"
                                          : isRejected
                                            ? "bg-rose-600"
                                            : "bg-slate-400"
                                      }`}
                                  />
                                  {isPublished
                                    ? "Published"
                                    : isPending
                                      ? "Menunggu"
                                      : isWaitingPayment
                                        ? "Belum Bayar"
                                        : isRejected
                                          ? "Ditolak"
                                          : "Draft"}
                                </span>
                              </div>

                              {/* If Rejected: Rejection message */}
                              {isRejected && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                                  <div className="flex items-center gap-1 font-bold text-rose-900">
                                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                                    <span>Alasan Penolakan dari Admin:</span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed text-rose-700 pl-5">
                                    {item.rejection_reason || "Konten belum memenuhi syarat. Silakan perbaiki untuk mengajukan kembali."}
                                  </p>
                                </div>
                              )}

                              {/* Bottom: Action buttons */}
                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                {isRejected ? (
                                  <button
                                    onClick={() =>
                                      item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                    <span>Hapus</span>
                                  </button>
                                ) : item.status === "needs_revision" ? (
                                  <>
                                    <button
                                      onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <Edit size={13} />
                                      <span>Perbaiki</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                      <span>Hapus</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    {(isDraft || isWaitingPayment) && (
                                      <button
                                        onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                        className="px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                                      >
                                        <CreditCard size={13} />
                                        <span>Lanjutkan Bayar</span>
                                      </button>
                                    )}
                                    {isPublished && (
                                      <button
                                        onClick={() => navigate(`/blog/${item.id}`)}
                                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <Eye size={14} />
                                        <span>Lihat</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditBlog(item)}
                                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Edit size={14} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        item.itemType === "event" ? handleDeleteEvent(item.id) : handleDeleteBlog(item.id)
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                      <span>Hapus</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
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

                          {/* Page Buttons (Max 5 with ellipsis) */}
                          {(() => {
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
                              <>
                                {start > 1 && (
                                  <>
                                    <button
                                      onClick={() => setCurrentPage(1)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    >
                                      1
                                    </button>
                                    {start > 2 && <span className="px-1 text-slate-400 font-bold text-xs">...</span>}
                                  </>
                                )}
                                {pages.map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${pageNum === currentPage
                                      ? "bg-[#059669] text-white shadow-2xs"
                                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                      }`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}
                                {end < totalPages && (
                                  <>
                                    {end < totalPages - 1 && <span className="px-1 text-slate-400 font-bold text-xs">...</span>}
                                    <button
                                      onClick={() => setCurrentPage(totalPages)}
                                      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    >
                                      {totalPages}
                                    </button>
                                  </>
                                )}
                              </>
                            );
                          })()}

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

          {/* 4. INBOX / CHAT VIEW (WHATSAPP WEB STYLE - GAMBAR 2 & 3) */}
          {activeTab === "inbox" && (
            <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-[calc(100vh-140px)] min-h-[580px] max-h-[860px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
              {/* LEFT PANEL: Daftar Obrolan WhatsApp */}
              <div
                className={`bg-[#f0f2f5] border-r border-slate-200 flex flex-col overflow-hidden ${activeConversationId ? "max-md:hidden" : "w-full"
                  }`}
              >
                {/* WhatsApp Left Header */}
                <div className="p-3 px-3.5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between gap-2.5 shrink-0 select-none">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={user?.avatar ? getStorageUrl(user.avatar) : DEFAULT_AVATAR}
                        alt={user?.name || "Profil"}
                        className="w-9 h-9 rounded-full object-cover border border-slate-300/80 shadow-xs ring-1 ring-emerald-500/20"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600/30" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[13.5px] font-black text-[#111b21] leading-tight flex items-center gap-1.5 truncate">
                        <MessageCircle size={15} className="text-[#00a884] shrink-0" />
                        <span className="truncate">Chat Penjual &amp; Pembeli</span>
                      </h2>
                      <p className="text-[10.5px] text-[#54656f] font-medium truncate mt-0.5 leading-tight">
                        Pesan Langsung UMKM &amp; Pelanggan Surade
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[#54656f]">
                    {totalInboxUnreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#25d366] text-white font-bold text-[10.5px] shadow-xs whitespace-nowrap shrink-0 border border-emerald-400/40 leading-none">
                        {totalInboxUnreadCount} baru
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => fetchConversationsList(true)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/80 active:bg-slate-300 rounded-full transition-colors cursor-pointer text-[#54656f] hover:text-[#111b21] shrink-0"
                      title="Perbarui Obrolan"
                    >
                      <RefreshCw size={15} className={loadingConversations ? "animate-spin text-[#00a884]" : ""} />
                    </button>
                  </div>
                </div>

                {/* WhatsApp Search Bar & Filter Tabs */}
                <div className="p-2.5 bg-white border-b border-slate-100 space-y-2 shrink-0">
                  <div className="relative flex items-center">
                    <Search size={15} className="absolute left-3 text-[#54656f]" />
                    <input
                      type="text"
                      value={inboxSearchQuery}
                      onChange={(e) => setInboxSearchQuery(e.target.value)}
                      placeholder="Cari atau mulai obrolan baru"
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#f0f2f5] text-xs text-[#111b21] placeholder:text-[#8696a0] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00a884] border border-transparent transition-all"
                    />
                  </div>

                  {/* Filter Pills: Semua, Belum dibaca, Favorit */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setChatFilter("all")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${chatFilter === "all"
                        ? "bg-[#d9fdd3] text-[#008069] border border-[#a7f3d0]"
                        : "bg-[#f0f2f5] text-[#54656f] hover:bg-slate-200"
                        }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatFilter("unread")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${chatFilter === "unread"
                        ? "bg-[#d9fdd3] text-[#008069] border border-[#a7f3d0]"
                        : "bg-[#f0f2f5] text-[#54656f] hover:bg-slate-200"
                        }`}
                    >
                      Belum dibaca
                      {totalInboxUnreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#25d366] text-white text-[10px] font-bold inline-flex items-center justify-center">
                          {totalInboxUnreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatFilter("favorites")}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${chatFilter === "favorites"
                        ? "bg-[#d9fdd3] text-[#008069] border border-[#a7f3d0]"
                        : "bg-[#f0f2f5] text-[#54656f] hover:bg-slate-200"
                        }`}
                    >
                      <Heart size={11} className={chatFilter === "favorites" ? "fill-current" : ""} />
                      Favorit
                    </button>
                    {archivedChats.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setChatFilter(chatFilter === "archived" ? "all" : "archived")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${chatFilter === "archived"
                          ? "bg-[#d9fdd3] text-[#008069] border border-[#a7f3d0]"
                          : "bg-[#f0f2f5] text-[#54656f] hover:bg-slate-200"
                          }`}
                      >
                        <Archive size={11} className={chatFilter === "archived" ? "fill-current" : ""} />
                        Arsip
                        <span className="w-4 h-4 rounded-full bg-[#00a884] text-white text-[10px] font-bold inline-flex items-center justify-center">
                          {archivedChats.length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* WhatsApp Conversation List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {/* WhatsApp Archived Chats Header / Access Row */}
                  {chatFilter === "archived" ? (
                    <div className="flex items-center gap-3 px-3.5 py-3 bg-[#f0f2f5] border-b border-slate-200">
                      <button
                        type="button"
                        onClick={() => setChatFilter("all")}
                        className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-[#54656f]"
                        title="Kembali ke semua chat"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="text-xs font-bold text-[#111b21]">Obrolan Diarsipkan</h3>
                        <p className="text-[10px] text-[#54656f]">{filteredConversations.length} obrolan</p>
                      </div>
                    </div>
                  ) : (
                    archivedChats.length > 0 && (
                      <div
                        onClick={() => setChatFilter("archived")}
                        className="flex items-center justify-between px-3.5 py-3 hover:bg-[#f5f6f6] border-b border-slate-100 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-[#111b21] font-semibold text-xs">
                          <Archive size={16} className="text-[#00a884]" />
                          <span>Diarsipkan</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#00a884] bg-[#d9fdd3] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                          {archivedChats.length}
                        </span>
                      </div>
                    )
                  )}

                  {loadingConversations ? (
                    <SuradeLoader variant="section" size="sm" text="Memuat daftar obrolan" minHeight="160px" />
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                      const isActive = String(activeConversationId) === String(conv.id);
                      const isPinned = pinnedChats.includes(conv.id);
                      const isFav = favoriteChats.includes(conv.id);
                      const isArchived = archivedChats.includes(conv.id);
                      const isMuted = mutedChats.includes(conv.id);
                      const isManualUnread = manualUnreadChats.includes(conv.id);
                      const unreadCount = conv.unread_count || (isManualUnread ? 1 : 0);

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveConversationId(conv.id);
                            navigate(`/dashboard?tab=inbox&conversation=${conv.id}`, { replace: true });
                          }}
                          className={`group relative p-3 cursor-pointer transition-colors flex items-start gap-3 border-l-4 ${isActive
                            ? "bg-[#f0f2f5] border-l-[#00a884]"
                            : "hover:bg-[#f5f6f6] border-l-transparent"
                            } ${unreadCount > 0 ? "bg-[#f8fafc]" : ""}`}
                        >
                          {/* Avatar */}
                          {(() => {
                            const contactPresence = getUserPresence({
                              ...conv,
                              id: conv.counterparty_id,
                              name: conv.counterparty_name,
                              email: conv.counterparty_email,
                              role: conv.counterparty_role,
                              is_online: conv.is_online,
                              last_seen_at: conv.last_seen_at,
                              status: 'active',
                            });

                            return (
                              <div className="relative shrink-0">
                                <SafeImage
                                  src={
                                    conv.counterparty_role === "buyer"
                                      ? (conv.counterparty_avatar ? getStorageUrl(conv.counterparty_avatar) : (conv.business_logo ? getStorageUrl(conv.business_logo) : DEFAULT_AVATAR))
                                      : (conv.business_logo ? getStorageUrl(conv.business_logo) : (conv.business?.logo ? getStorageUrl(conv.business.logo) : (conv.counterparty_avatar ? getStorageUrl(conv.counterparty_avatar) : DEFAULT_AVATAR)))
                                  }
                                  alt={conv.business_name || conv.counterparty_name}
                                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                                  fallback={DEFAULT_AVATAR}
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${contactPresence.isOnline ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  title={contactPresence.isOnline ? "Sedang Online" : "Sedang Offline"}
                                />
                                {unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[#25d366] text-white font-extrabold text-[10.5px] flex items-center justify-center border-2 border-white shadow-xs">
                                    {unreadCount}
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {/* Line 1: Title & Timestamp */}
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-semibold text-[#111b21] truncate flex items-center gap-1.5">
                                <span className="truncate">
                                  {conv.counterparty_role === "buyer"
                                    ? conv.counterparty_name
                                    : (conv.business_name || conv.counterparty_name)}
                                </span>
                              </h4>
                              <span
                                className={`text-[11px] font-medium shrink-0 ${unreadCount > 0 ? "text-[#00a884] font-bold" : "text-[#667781]"
                                  }`}
                              >
                                {formatChatTimestamp(conv.last_message_at)}
                              </span>
                            </div>

                            {/* Line 2: Role badge & Subtitle */}
                            <div className="text-[11px] text-[#667781] font-medium truncate flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${conv.counterparty_role === "buyer"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                }`}>
                                {conv.counterparty_role === "seller" ? "Penjual" : "Pembeli"}
                              </span>
                              <span className="truncate text-slate-500">
                                {conv.counterparty_role === "buyer"
                                  ? `Tanya: ${conv.business_name || "Usaha Anda"}`
                                  : conv.counterparty_name}
                              </span>
                            </div>

                            {/* Line 3: Last Message snippet + Icons (Pin, Fav, Mute, Menu) */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <p
                                className={`text-xs truncate flex items-center gap-1 ${unreadCount > 0 ? "font-bold text-[#111b21]" : "text-[#667781]"
                                  }`}
                              >
                                {conv.last_message && (
                                  <span className="inline-flex items-center shrink-0">
                                    {unreadCount > 0 ? (
                                      <CheckCheck size={14} className="text-slate-400" title="Diterima" />
                                    ) : (
                                      <CheckCheck size={14} className="text-[#53bdeb]" title="Dibaca" />
                                    )}
                                  </span>
                                )}
                                <span className="truncate">{conv.last_message || "Mulai obrolan..."}</span>
                              </p>

                              {/* Badges & Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                {isPinned && (
                                  <Pin size={13} className="text-amber-500 rotate-45 shrink-0" title="Disematkan" />
                                )}
                                {isFav && (
                                  <Heart size={12} className="text-rose-500 fill-rose-500 shrink-0" title="Favorit" />
                                )}
                                {isMuted && (
                                  <VolumeX size={13} className="text-slate-400 shrink-0" title="Dibisukan" />
                                )}

                                {/* WhatsApp Context Menu Trigger (Gambar 3) */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuConvId(activeMenuConvId === conv.id ? null : conv.id);
                                  }}
                                  className="wa-menu-trigger p-1 rounded-full text-[#8696a0] hover:text-[#111b21] hover:bg-slate-200/80 transition-colors cursor-pointer"
                                  title="Opsi Obrolan"
                                >
                                  <ChevronDown size={15} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* WHATSAPP CONTEXT DROPDOWN MENU (GAMBAR 3) */}
                          {activeMenuConvId === conv.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="wa-dropdown-menu absolute right-3 top-12 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 w-52 text-left animate-in fade-in zoom-in-95"
                            >
                              <button
                                type="button"
                                onClick={(e) => togglePinChat(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-[#111b21] hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Pin size={14} className={isPinned ? "text-amber-500 rotate-45" : "text-slate-500"} />
                                <span>{isPinned ? "Lepas sematan chat" : "Sematkan chat"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleManualUnread(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-[#111b21] hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Mail size={14} className="text-slate-500" />
                                <span>{unreadCount > 0 ? "Tandai sudah dibaca" : "Tandai belum dibaca"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleFavoriteChat(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-[#111b21] hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Heart size={14} className={isFav ? "text-rose-500 fill-rose-500" : "text-slate-500"} />
                                <span>{isFav ? "Hapus dari favorit" : "Tambah ke favorit"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleArchiveChat(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-[#111b21] hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Archive size={14} className={isArchived ? "text-[#00a884]" : "text-slate-500"} />
                                <span>{isArchived ? "Buka arsip chat" : "Arsipkan chat"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleMuteChat(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-[#111b21] hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                {isMuted ? <Volume2 size={14} className="text-slate-500" /> : <VolumeX size={14} className="text-slate-500" />}
                                <span>{isMuted ? "Bunyikan notifikasi" : "Bisukan notifikasi"}</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1" />

                              <button
                                type="button"
                                onClick={(e) => clearChatHistory(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-[#f5f6f6] flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <RefreshCw size={14} className="text-slate-500" />
                                <span>Bersihkan obrolan</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => deleteConversation(conv.id, e)}
                                className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} className="text-rose-600" />
                                <span>Hapus obrolan</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-[#f0f2f5] flex items-center justify-center text-slate-400">
                        <MessageCircle size={30} className="stroke-[1.5]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#111b21]">Tidak Ada Percakapan</p>
                        <p className="text-xs text-[#667781] max-w-[210px]">
                          {chatFilter === "unread"
                            ? "Semua pesan sudah Anda baca."
                            : chatFilter === "favorites"
                              ? "Belum ada obrolan yang ditandai favorit."
                              : "Pesan dari kontak atau UMKM Surade akan tampil di sini."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Area Percakapan WhatsApp (Gambar 2) */}
              <div
                className={`bg-[#efeae2] flex flex-col overflow-hidden relative ${!activeConversationId ? "max-md:hidden" : "w-full"
                  }`}
              >
                {activeConversationId && activeChatData ? (
                  <>
                    {/* WhatsApp Active Header */}
                    <div className="px-4 py-2.5 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile Back Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConversationId(null);
                            setActiveChatData(null);
                            navigate(`/dashboard?tab=inbox`, { replace: true });
                          }}
                          className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 text-[#54656f] transition-colors cursor-pointer"
                          title="Kembali ke Daftar Obrolan"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {(() => {
                          const activePresence = getUserPresence({
                            ...activeChatData,
                            id: activeChatData.counterparty_id,
                            name: activeChatData.counterparty_name,
                            email: activeChatData.counterparty_email,
                            role: activeChatData.counterparty_role,
                            is_online: activeChatData.is_online,
                            last_seen_at: activeChatData.last_seen_at,
                            status: 'active',
                          });

                          return (
                            <>
                              <div className="relative shrink-0">
                                <SafeImage
                                  src={
                                    activeChatData.counterparty_role === "buyer"
                                      ? (activeChatData.counterparty_avatar ? getStorageUrl(activeChatData.counterparty_avatar) : (activeChatData.business?.logo ? getStorageUrl(activeChatData.business.logo) : (activeChatData.business_logo ? getStorageUrl(activeChatData.business_logo) : DEFAULT_AVATAR)))
                                      : (activeChatData.business?.logo ? getStorageUrl(activeChatData.business.logo) : (activeChatData.business_logo ? getStorageUrl(activeChatData.business_logo) : (activeChatData.counterparty_avatar ? getStorageUrl(activeChatData.counterparty_avatar) : DEFAULT_AVATAR)))
                                  }
                                  alt={activeChatData.business?.name || activeChatData.counterparty_name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-2xs"
                                  fallback={DEFAULT_AVATAR}
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-xs ${activePresence.isOnline ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  title={activePresence.isOnline ? "Sedang Online" : "Sedang Offline"}
                                />
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-[#111b21] truncate flex items-center gap-2">
                                  <span>
                                    {activeChatData.counterparty_role === "buyer"
                                      ? activeChatData.counterparty_name
                                      : (activeChatData.business?.name || activeChatData.counterparty_name)}
                                  </span>
                                </h3>
                                <p className={`text-[11px] font-medium flex items-center gap-1.5 truncate ${activePresence.isOnline ? "text-[#00a884]" : "text-slate-400"
                                  }`}>
                                  <span className={`w-2 h-2 rounded-full inline-block ${activePresence.isOnline ? "bg-[#25d366] animate-pulse" : "bg-slate-300"
                                    }`} />
                                  <span className="capitalize">{activePresence.isOnline ? "Online" : "Offline"}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[#667781] font-normal truncate">
                                    {activeChatData.counterparty_role === "buyer"
                                      ? `Pembeli • Tanya: ${activeChatData.business?.name || "Usaha Anda"}`
                                      : `${activeChatData.counterparty_name} (Penjual)`}
                                  </span>
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Header Action Icons */}
                      <div className="flex items-center gap-1 text-[#54656f]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConversationId(null);
                            setActiveChatData(null);
                            navigate(`/dashboard?tab=inbox`, { replace: true });
                          }}
                          className="flex items-center gap-1 text-xs text-[#54656f] hover:text-[#111b21] px-2.5 py-1.5 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer font-medium"
                          title="Tutup Percakapan"
                        >
                          <X size={16} />
                          <span className="hidden sm:inline">Tutup</span>
                        </button>
                      </div>
                    </div>

                    {/* WhatsApp Doodle Wallpaper Chat Area */}
                    <div
                      className="flex-1 p-3 md:p-5 overflow-y-auto space-y-3"
                      style={{
                        backgroundColor: "#efeae2",
                        backgroundImage:
                          "radial-gradient(#cdd3d8 0.85px, transparent 0.85px), radial-gradient(#cdd3d8 0.85px, #efeae2 0.85px)",
                        backgroundSize: "26px 26px",
                        backgroundPosition: "0 0, 13px 13px",
                      }}
                    >
                      {/* WhatsApp End-to-End Encryption Security Card */}
                      <div className="max-w-md mx-auto my-2 p-2 rounded-lg bg-[#ffeecd] border border-[#ffe09e] text-center shadow-2xs">
                        <p className="text-[11px] text-[#54656f] leading-snug flex items-center justify-center gap-1.5 font-medium">
                          <span>🔒</span>
                          <span>
                            Pesan dan obrolan terenkripsi aman secara end-to-end dalam ekosistem portal Surade.com.
                          </span>
                        </p>
                      </div>

                      {loadingChatDetails ? (
                        <SuradeLoader variant="section" size="sm" text="Memuat riwayat pesan" minHeight="160px" />
                      ) : activeConversationMessages.length > 0 ? (
                        activeConversationMessages.map((msg, idx) => {
                          const isMine = String(msg.sender_id) === String(user?.id);
                          const prevMsg = idx > 0 ? activeConversationMessages[idx - 1] : null;
                          const showDateBadge =
                            !prevMsg ||
                            new Date(prevMsg.created_at).toDateString() !==
                            new Date(msg.created_at).toDateString();

                          const { replySender, replyText, bodyText } = parseReplyInMessage(msg.message);

                          return (
                            <div key={msg.id} className="space-y-2">
                              {/* Date Separator Pill */}
                              {showDateBadge && (
                                <div className="flex justify-center my-3">
                                  <span className="px-3 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#54656f] shadow-2xs uppercase tracking-wide">
                                    {getMessageDateBadge(msg.created_at)}
                                  </span>
                                </div>
                              )}

                              <div className={`group flex items-end gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                {/* Quick Reply Trigger Button on hover */}
                                {!isMine && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyingTo({
                                        id: msg.id,
                                        senderName: activeChatData.counterparty_name || "Pengguna",
                                        text: bodyText,
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/80 hover:bg-white text-[#54656f] shadow-xs transition-opacity cursor-pointer mb-1"
                                    title="Balas pesan ini"
                                  >
                                    <Reply size={13} />
                                  </button>
                                )}

                                {/* WhatsApp Bubble */}
                                <div
                                  className={`relative max-w-[82%] md:max-w-[65%] px-3 py-2 rounded-2xl shadow-2xs space-y-1 ${isMine
                                    ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-xs"
                                    : "bg-white text-[#111b21] rounded-tl-xs"
                                    }`}
                                >
                                  {/* Sender name inside incoming bubble – use per-message sender_name for accuracy */}
                                  {!isMine && (
                                    <div className="flex items-center justify-between text-[11px] font-bold text-[#008069] pb-0.5">
                                      <span>{msg.sender_name || activeChatData.counterparty_name || "Pengguna"}</span>
                                    </div>
                                  )}

                                  {/* Quoted Reply Box inside bubble */}
                                  {replyText && (
                                    <div className="p-1.5 mb-1 rounded bg-black/5 border-l-4 border-l-[#00a884] text-left text-xs">
                                      <p className="text-[10px] font-bold text-[#008069]">{replySender || "Pesan Terpilih"}</p>
                                      <p className="text-[11px] text-[#54656f] line-clamp-2 italic">{replyText}</p>
                                    </div>
                                  )}

                                  {/* Image Attachment inside bubble */}
                                  {msg.image_url && (
                                    <div className="mb-1 rounded-lg overflow-hidden bg-black/5 flex justify-center">
                                      <SafeImage
                                        src={msg.image_url.startsWith('data:') ? msg.image_url : getStorageUrl(msg.image_url)}
                                        alt="Lampiran Foto"
                                        className="max-w-full max-h-[280px] object-contain rounded-lg"
                                      />
                                    </div>
                                  )}

                                  {/* Main message text */}
                                  {bodyText && (
                                    <p className="text-xs md:text-[13px] leading-relaxed font-normal whitespace-pre-wrap break-words">
                                      {bodyText}
                                    </p>
                                  )}

                                  {/* Timestamp + WhatsApp Ticks (c1 / c2 / centang dua biru) */}
                                  <div
                                    className={`text-[10px] font-medium flex items-center justify-end gap-1 select-none ${isMine ? "text-[#667781]" : "text-[#667781]"
                                      }`}
                                  >
                                    <span>{formatChatTimestamp(msg.created_at)}</span>
                                    {renderMessageTicks(msg, isMine)}
                                  </div>
                                </div>

                                {isMine && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyingTo({
                                        id: msg.id,
                                        senderName: "Saya",
                                        text: bodyText,
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-white/80 hover:bg-white text-[#54656f] shadow-xs transition-opacity cursor-pointer mb-1"
                                    title="Balas pesan Anda sendiri"
                                  >
                                    <Reply size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center text-[#54656f] space-y-2 py-10">
                          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center text-[#00a884] shadow-xs">
                            <MessageSquare size={28} />
                          </div>
                          <p className="text-xs font-bold text-[#111b21]">Belum ada riwayat percakapan</p>
                          <p className="text-[11px] text-[#667781] max-w-xs">
                            Kirim salam atau ajukan pertanyaan pertama Anda kepada {activeChatData.counterparty_name} di bawah ini.
                          </p>
                        </div>
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* WhatsApp Quote Reply Preview Bar */}
                    {replyingTo && (
                      <div className="px-4 py-2 bg-[#f0f2f5] border-t border-l-4 border-l-[#00a884] border-slate-200 flex items-center justify-between shrink-0 animate-in slide-in-from-bottom-2">
                        <div className="text-xs min-w-0 pr-2">
                          <p className="text-[11px] font-bold text-[#008069]">Membalas {replyingTo.senderName}</p>
                          <p className="text-xs text-[#54656f] truncate italic">{replyingTo.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="p-1 rounded-full hover:bg-slate-200 text-[#54656f] hover:text-[#111b21] cursor-pointer"
                          title="Batal balas"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}

                    {/* WhatsApp Quick Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div className="wa-emoji-picker p-3 bg-white border-t border-slate-200 shadow-lg flex flex-wrap gap-2 shrink-0 animate-in slide-in-from-bottom-2">
                        {["😊", "😂", "👍", "❤️", "🙏", "🤝", "🔥", "🎉", "😍", "✨", "👏", "💯", "☕", "🛒", "📦", "💼", "📍", "👋", "✅", "💬"].map(
                          (emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setChatMessageInput((prev) => prev + emoji);
                              }}
                              className="text-lg p-1.5 hover:bg-slate-100 rounded-lg transition-transform active:scale-125 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Quick Emoji Picker Popover */}
                    {showEmojiPicker && (
                      <div className="wa-emoji-picker p-3 bg-white border-t border-slate-200 shadow-xl rounded-t-xl shrink-0 animate-in slide-in-from-bottom-2 z-20">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-[#111b21] flex items-center gap-1.5">
                            <Smile size={14} className="text-[#00a884]" />
                            Pilih Emoji
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="p-1 rounded-full hover:bg-slate-100 text-[#54656f] hover:text-[#111b21] cursor-pointer"
                            title="Tutup"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {[
                            "😊", "😂", "🥰", "😍", "😎", "🤗", "🤔", "😉", "😇", "🤩",
                            "👍", "🙏", "🤝", "👏", "👋", "👌", "💪", "🔥", "✨", "💯",
                            "🛒", "🛍️", "📦", "☕", "🍽️", "📍", "🏷️", "💰", "🛵", "✅",
                            "❤️", "💙", "💚", "💖", "💐", "🎉", "⭐", "🌟", "☀️", "💬"
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setChatMessageInput((prev) => prev + emoji);
                              }}
                              className="text-xl p-1.5 hover:bg-emerald-50 rounded-lg transition-transform active:scale-125 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Link & Social Media Forbidden Content Warning Banner */}
                    {detectForbiddenChatContent(chatMessageInput) && (
                      <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 shrink-0">
                        <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                        <span>Pesan mengandung link atau kontak media sosial yang dilarang. Hapus untuk mengirim pesan.</span>
                      </div>
                    )}

                    {/* WhatsApp Bottom Input Bar */}
                    <form
                      onSubmit={handleSendChatMessage}
                      className="p-2.5 md:p-3 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2 shrink-0"
                    >
                      {/* Emoji Button - Always on the left side of message input */}
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className={`wa-emoji-trigger p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0 ${showEmojiPicker ? "text-[#00a884] bg-slate-200" : "text-[#54656f] hover:text-[#111b21] hover:bg-slate-200/60"
                          }`}
                        title="Pilih Emoji"
                      >
                        <Smile size={22} />
                      </button>

                      {/* Text Input */}
                      <input
                        type="text"
                        value={chatMessageInput}
                        onChange={(e) => setChatMessageInput(e.target.value)}
                        placeholder={`Ketik pesan untuk ${activeChatData.counterparty_name || "pengguna"}...`}
                        className={`flex-1 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white border text-xs md:text-sm text-[#111b21] placeholder:text-[#8696a0] focus:outline-none shadow-2xs min-w-0 transition-colors ${detectForbiddenChatContent(chatMessageInput)
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-transparent focus:border-slate-300"
                          }`}
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={
                          !chatMessageInput.trim() ||
                          sendingChatMessage ||
                          detectForbiddenChatContent(chatMessageInput)
                        }
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shrink-0 ${detectForbiddenChatContent(chatMessageInput)
                          ? "bg-rose-400 cursor-not-allowed"
                          : chatMessageInput.trim()
                            ? "bg-[#00a884] hover:bg-[#008f6f]"
                            : "bg-slate-300"
                          }`}
                        title={
                          detectForbiddenChatContent(chatMessageInput)
                            ? "Pesan tidak dapat dikirim karena mengandung link atau kontak media sosial"
                            : "Kirim Pesan"
                        }
                      >
                        {sendingChatMessage ? (
                          <Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" />
                        ) : (
                          <Send size={16} className="translate-x-0.5 sm:w-[18px] sm:h-[18px]" />
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  /* Empty state when no conversation is selected (WhatsApp Web Welcome screen) */
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#54656f] p-8 text-center bg-[#f0f2f5] select-none">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-[#00a884] mb-2 shadow-xs">
                      <MessageCircle size={44} className="stroke-[1.7]" />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-xl font-extrabold text-[#111b21] flex items-center justify-center gap-2">
                        <MessageCircle size={22} className="text-[#00a884]" />
                        <span>Chat Direct Penjual &amp; Pembeli</span>
                      </h3>
                      <p className="text-xs text-[#54656f] leading-relaxed font-medium">
                        Kirim dan terima pesan obrolan langsung (chat direct) dengan pemilik usaha, penjual UMKM, dan pembeli di kawasan Surade.
                      </p>
                      <p className="text-[11px] text-[#8696a0] pt-2 font-semibold">
                        Pilih percakapan di sebelah kiri untuk mulai chatting dengan penjual/pembeli.
                      </p>
                    </div>
                    <div className="pt-6 flex items-center gap-1.5 text-[11px] text-[#8696a0]">
                      <span>🔒</span>
                      <span>Terenkripsi secara end-to-end</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4B. TRANSAKSI WHATSAPP VIEW */}
          {activeTab === "whatsapp" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Header Banner Transaksi WhatsApp */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#043d2e] to-[#022c22] text-white p-6 md:p-8 shadow-xl border border-emerald-800/40">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      <ShieldCheck size={14} /> Transaksi WhatsApp Portal
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                      <Receipt size={28} className="text-emerald-400" /> Transaksi WhatsApp
                    </h2>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
                      Daftar seluruh riwayat transaksi WhatsApp, status pembayaran, dan verifikasi invoice akses nomor kontak di Surade.com secara transparan dan real-time.
                    </p>
                  </div>
                  <button
                    onClick={fetchUserWaLogs}
                    disabled={userWaLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
                  >
                    <RefreshCw size={14} className={userWaLoading ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Receipt size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-800">{userWaStats.total}</div>
                    <div className="text-xs font-medium text-slate-500">Total Transaksi</div>
                  </div>
                </div>
                {/* Menunggu Konfirmasi */}
                <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-600">{userWaStats.pending}</div>
                    <div className="text-xs font-medium text-slate-500">Menunggu Konfirmasi</div>
                  </div>
                </div>
                {/* Dikonfirmasi */}
                <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-600">{userWaStats.confirmed}</div>
                    <div className="text-xs font-medium text-slate-500">Dikonfirmasi (Aktif)</div>
                  </div>
                </div>
                {/* Ditolak */}
                <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-rose-600">{userWaStats.rejected}</div>
                    <div className="text-xs font-medium text-slate-500">Ditolak Admin</div>
                  </div>
                </div>
              </div>

              {/* Transaksi WhatsApp List */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-4">Daftar Transaksi WhatsApp</h3>
                {userWaLoading ? (
                  <SuradeLoader variant="section" size="sm" text="Memuat transaksi WhatsApp" minHeight="180px" />
                ) : userWaLogs.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Receipt size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Belum Ada Transaksi WhatsApp</h4>
                    <p className="text-xs text-slate-500 max-w-md">
                      Anda belum memiliki riwayat transaksi WhatsApp di platform Surade.com. Jelajahi UMKM atau gunakan layanan kami.
                    </p>
                    <Link
                      to="/"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      <span>Jelajahi Portal</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {userWaLogs.map((log) => {
                      const isPending = log.status === "pending";
                      const isApproved = log.status === "completed" || log.status === "approved";
                      const isRejected = log.status === "rejected";
                      const formattedFee = Number(log.fee_amount || 0).toLocaleString("id-ID");
                      const isPointPayment = Boolean(
                        (log.payment_method && /poin|coin|surade_coin|gold/i.test(log.payment_method)) ||
                        log.payment_type === "coin" ||
                        log.payment_type === "point" ||
                        log.is_coin_payment
                      );
                      const dateFormatted = log.created_at
                        ? new Date(log.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : "-";

                      const rawBizWa = log.business_whatsapp || log.business?.whatsapp || log.business?.phone;
                      const cleanWa = rawBizWa ? String(rawBizWa).replace(/\D/g, "") : "";
                      const formattedWa = cleanWa.startsWith("0") ? "62" + cleanWa.slice(1) : cleanWa;

                      return (
                        <div
                          key={`wa-log-${log.id}`}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/70 hover:border-amber-300 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Left: Thumbnail & Business Info */}
                          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] min-w-16 min-h-16 sm:min-w-[72px] sm:min-h-[72px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs shrink-0 flex items-center justify-center">
                              <img
                                src={getStorageUrl(log.business_image || log.business?.logo || log.business?.banner) || DEFAULT_AVATAR}
                                alt={log.business_name || "Bisnis"}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                              />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight truncate">
                                {log.business_name || log.business?.name || "Usaha Surade"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                                  {log.transaction_code}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-medium text-slate-500">{log.payment_method || "Transfer Bank BCA"}</span>
                                <span className="text-slate-300">•</span>
                                <div className="inline-flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-emerald-600">Rp {formattedFee}</span>
                                  {Number(log.discount_amount || 0) > 0 && (
                                    <span className="line-through text-slate-400 text-[11px]">
                                      Rp {Number((Number(log.fee_amount || 0) + Number(log.discount_amount || 0))).toLocaleString("id-ID")}
                                    </span>
                                  )}
                                  {log.coupon_code && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                                      Kupon: {log.coupon_code}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {Number(log.discount_amount || 0) > 0 && (
                                <div className="text-[11px] text-emerald-700 font-bold">
                                  Potongan Kupon: -Rp {Number(log.discount_amount).toLocaleString("id-ID")}
                                </div>
                              )}
                              <div className="text-xs text-slate-400 font-normal">
                                Tanggal Transaksi: {dateFormatted}
                              </div>
                              {isRejected && log.rejection_reason && (
                                <div className="text-xs text-rose-700 font-medium mt-1 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                                  <AlertTriangle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold block">Alasan Ditolak Admin:</span>
                                    <span>{log.rejection_reason}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Status Pill & Action Buttons */}
                          <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                            {/* Status Badge */}
                            {isPending && (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#fef9c3] text-[#854d0e] border border-[#fde047] shadow-2xs">
                                <Clock size={13} className="text-[#a16207]" />
                                <span>Menunggu Konfirmasi</span>
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>Dikonfirmasi (Aktif)</span>
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
                                <AlertTriangle size={13} className="text-rose-600" />
                                <span>Ditolak Admin</span>
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                              {/* Tombol Perbaiki Bukti (Khusus non-poin yang Ditolak) */}
                              {!isPointPayment && isRejected && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReuploadWaLog(log);
                                    setReuploadProofFile(null);
                                    setReuploadProofPreview(null);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                >
                                  <RotateCcw size={13} />
                                  <span>Perbaiki Bukti Transfer</span>
                                </button>
                              )}

                              {/* Tombol Riwayat Bukti Lama jika ada (Khusus non-poin) */}
                              {!isPointPayment && log.proof_history && log.proof_history.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setViewWaProofHistoryModal(log)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                  title="Lihat Riwayat Bukti Sebelumnya"
                                >
                                  <Clock size={13} className="text-amber-600" />
                                  <span>Riwayat Bukti ({log.proof_history.length})</span>
                                </button>
                              )}

                              {/* View Proof Button (Hanya untuk non-poin yang memiliki bukti gambar) */}
                              {!isPointPayment && Boolean(log.proof_image || log.proof_url) && (
                                <button
                                  onClick={() => setSelectedWaProof(log)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                                >
                                  <Eye size={13} className="text-slate-500" />
                                  <span>Lihat Bukti Foto</span>
                                </button>
                              )}

                              {/* Open WhatsApp Button if Approved */}
                              {isApproved && formattedWa && (
                                <a
                                  href={`https://wa.me/${formattedWa}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                >
                                  <MessageCircle size={13} />
                                  <span>Buka Chat WhatsApp</span>
                                  <ArrowUpRight size={13} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal View Bukti Foto WhatsApp & Riwayat Bukti Sebelumnya */}
              {selectedWaProof && (() => {
                const isObj = typeof selectedWaProof === "object" && selectedWaProof !== null;
                const activeProofImg = isObj
                  ? (selectedWaProof.proof_url || (selectedWaProof.proof_image ? getStorageUrl(selectedWaProof.proof_image) : (getStorageUrl(selectedWaProof.business_image || selectedWaProof.business?.banner || selectedWaProof.business?.logo) || DEFAULT_AVATAR)))
                  : selectedWaProof;
                const proofHistList = isObj && Array.isArray(selectedWaProof.proof_history) ? selectedWaProof.proof_history : [];
                const bizTitle = isObj ? (selectedWaProof.business_name || selectedWaProof.business?.name || "Akses WhatsApp") : "Akses WhatsApp";
                const isRejectedLog = isObj && selectedWaProof.status === "rejected";

                return (
                  <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[999] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedWaProof(null)}
                  >
                    <div
                      className="relative max-w-lg w-full bg-white rounded-2xl p-5 overflow-hidden shadow-2xl border border-slate-100 my-4 animate-in fade-in zoom-in-95 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <div className="min-w-0 pr-2">
                          <h4 className="text-sm font-bold text-slate-800">Bukti Transfer Akses WhatsApp</h4>
                          <span className="text-[11px] text-slate-500 truncate block">{bizTitle}</span>
                        </div>
                        <button
                          onClick={() => setSelectedWaProof(null)}
                          className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Content Scroll Area */}
                      <div className="max-h-[75vh] overflow-y-auto space-y-4 pr-1">
                        {/* Notice jika status ditolak */}
                        {isRejectedLog && selectedWaProof.rejection_reason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle size={13} className="text-rose-600" />
                              <span>Pengajuan Ini Ditolak Admin</span>
                            </div>
                            <p className="text-[11.5px] leading-relaxed">
                              Alasan: <strong>{selectedWaProof.rejection_reason}</strong>
                            </p>
                          </div>
                        )}

                        {/* Foto Bukti Aktif Saat Ini */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Foto Bukti Transfer Saat Ini
                            </span>
                            {activeProofImg && (
                              <a
                                href={activeProofImg}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-bold text-teal-600 hover:underline"
                              >
                                Buka Ukuran Penuh ↗
                              </a>
                            )}
                          </div>
                          <div className="max-h-[50vh] overflow-hidden flex items-center justify-center rounded-xl bg-slate-950 p-1 border border-slate-200">
                            <img
                              src={activeProofImg}
                              alt="Bukti Transfer Saat Ini"
                              className="max-h-[48vh] w-auto object-contain rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Riwayat Bukti Sebelumnya di Bawah Foto Bukti Aktif */}
                        {proofHistList.length > 0 && (
                          <div className="pt-3 border-t border-slate-200 space-y-2.5">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} className="text-amber-600" />
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Riwayat Bukti Transfer Sebelumnya ({proofHistList.length})
                              </h5>
                            </div>
                            <div className="space-y-2.5">
                              {proofHistList.map((hist, hIdx) => {
                                const histImg = hist.proof_url || (hist.proof_image ? getStorageUrl(hist.proof_image) : null);
                                const histDate = hist.rejected_at ? new Date(hist.rejected_at).toLocaleString("id-ID", {
                                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                }) : "-";

                                return (
                                  <div key={hIdx} className="p-3 bg-amber-50/60 border border-amber-200/90 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-amber-900">
                                        Bukti #{hIdx + 1}
                                      </span>
                                      <span className="text-[11px] text-amber-700 font-medium">
                                        Ditolak: {histDate}
                                      </span>
                                    </div>
                                    {hist.rejection_reason && (
                                      <div className="text-[11.5px] text-rose-700 bg-rose-50/90 border border-rose-200 p-2 rounded-lg">
                                        <span className="font-bold">Alasan Ditolak:</span> {hist.rejection_reason}
                                      </div>
                                    )}
                                    {histImg && (
                                      <div className="rounded-lg overflow-hidden border border-amber-200 bg-slate-900 flex items-center justify-center p-1 max-h-48">
                                        <img
                                          src={histImg}
                                          alt={`Bukti Sebelumnya #${hIdx + 1}`}
                                          className="max-h-44 w-auto object-contain rounded cursor-pointer hover:opacity-90"
                                          onClick={() => window.open(histImg, "_blank")}
                                          title="Klik untuk membuka ukuran penuh"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedWaProof(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                        >
                          Tutup
                        </button>
                        {isRejectedLog && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetLog = selectedWaProof;
                              setSelectedWaProof(null);
                              setReuploadWaLog(targetLog);
                              setReuploadProofFile(null);
                              setReuploadProofPreview(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw size={13} />
                            <span>Perbaiki Bukti Sekarang</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Perbaiki Bukti Transfer WhatsApp */}
              {reuploadWaLog && (
                <div
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
                  onClick={() => setReuploadWaLog(null)}
                >
                  <div
                    className="relative max-w-md w-full bg-white rounded-2xl p-5 overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <RotateCcw size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Perbaiki Bukti Transfer</h4>
                          <span className="text-[11px] text-slate-400 block">{reuploadWaLog.business_name || "Akses WhatsApp"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReuploadWaLog(null)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <form onSubmit={handleReuploadWaProof} className="space-y-4">
                      {/* Alasan Ditolak Sebelumnya */}
                      {reuploadWaLog.rejection_reason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <span className="font-bold block mb-0.5">Alasan Penolakan Admin:</span>
                          <p>{reuploadWaLog.rejection_reason}</p>
                        </div>
                      )}

                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <p className="leading-relaxed">
                          Bukti transfer lama Anda akan otomatis tersimpan sebagai <strong>riwayat</strong>. Silakan upload foto/struk transfer baru yang jelas.
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Foto Bukti Transfer Baru *
                        </label>
                        <input
                          type="file"
                          id="reupload_proof_input"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Ukuran file bukti transfer maksimal 5MB.");
                                return;
                              }
                              setReuploadProofFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setReuploadProofPreview(ev.target?.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        {reuploadProofPreview ? (
                          <div className="relative rounded-xl border-2 border-emerald-400 p-2 bg-emerald-50/40 text-center">
                            <img
                              src={reuploadProofPreview}
                              alt="Preview Baru"
                              className="max-h-48 mx-auto object-contain rounded-lg shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setReuploadProofFile(null);
                                setReuploadProofPreview(null);
                              }}
                              className="mt-2 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Ganti Foto Lain
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="reupload_proof_input"
                            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-emerald-50/30"
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                              <UploadCloud size={22} />
                            </div>
                            <span className="text-xs font-bold text-slate-800">Klik untuk upload foto bukti transfer</span>
                            <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG atau WEBP (Maks. 5MB)</span>
                          </label>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setReuploadWaLog(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={reuploadSubmitting || !reuploadProofFile}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          {reuploadSubmitting ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Mengirim...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Kirim Perbaikan Bukti</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal Riwayat Bukti Sebelumnya */}
              {viewWaProofHistoryModal && (
                <div
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[999] flex items-center justify-center p-4"
                  onClick={() => setViewWaProofHistoryModal(null)}
                >
                  <div
                    className="relative max-w-lg w-full bg-white rounded-2xl p-5 overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Clock size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Riwayat Bukti Transfer</h4>
                          <span className="text-[11px] text-slate-400 block">{viewWaProofHistoryModal.business_name || "Akses WhatsApp"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewWaProofHistoryModal(null)}
                        className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                      {/* Foto Bukti Terkini / Saat Ini */}
                      {(viewWaProofHistoryModal.proof_url || viewWaProofHistoryModal.proof_image) && (
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Foto Bukti Transfer Terkini (Aktif)</span>
                            </span>
                            <span className="text-[10.5px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {viewWaProofHistoryModal.status === "pending" ? "Menunggu Verifikasi" : viewWaProofHistoryModal.status === "rejected" ? "Ditolak" : "Disetujui"}
                            </span>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-emerald-200 bg-slate-950 flex items-center justify-center p-1 max-h-52">
                            <img
                              src={viewWaProofHistoryModal.proof_url || getStorageUrl(viewWaProofHistoryModal.proof_image)}
                              alt="Bukti Transfer Terkini"
                              className="max-h-48 w-auto object-contain rounded cursor-pointer hover:opacity-90"
                              onClick={() => window.open(viewWaProofHistoryModal.proof_url || getStorageUrl(viewWaProofHistoryModal.proof_image), "_blank")}
                              title="Buka ukuran penuh"
                            />
                          </div>
                        </div>
                      )}

                      {/* Riwayat Bukti Sebelumnya yang Pernah Ditolak */}
                      {viewWaProofHistoryModal.proof_history && viewWaProofHistoryModal.proof_history.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 uppercase tracking-wider">
                            <Clock size={13} className="text-amber-600" />
                            <span>Arsip Bukti Sebelumnya yang Pernah Ditolak ({viewWaProofHistoryModal.proof_history.length})</span>
                          </div>

                          {viewWaProofHistoryModal.proof_history.map((hist, hIdx) => {
                            const histImg = hist.proof_url || (hist.proof_image ? getStorageUrl(hist.proof_image) : null);
                            const histDate = hist.rejected_at ? new Date(hist.rejected_at).toLocaleString("id-ID", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            }) : "-";

                            return (
                              <div key={hIdx} className="p-3.5 bg-amber-50/60 border border-amber-200/90 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-amber-900">
                                    Bukti Pengajuan Lama #{hIdx + 1}
                                  </span>
                                  <span className="text-[11px] text-amber-700 font-medium">
                                    Ditolak: {histDate}
                                  </span>
                                </div>
                                {hist.rejection_reason && (
                                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                                    <span className="font-bold">Alasan Ditolak:</span> {hist.rejection_reason}
                                  </div>
                                )}
                                {histImg && (
                                  <div className="rounded-lg overflow-hidden border border-amber-200 bg-slate-900 flex items-center justify-center p-1 max-h-48">
                                    <img
                                      src={histImg}
                                      alt={`Bukti Pengajuan Lama #${hIdx + 1}`}
                                      className="max-h-44 w-auto object-contain rounded cursor-pointer hover:opacity-90"
                                      onClick={() => window.open(histImg, "_blank")}
                                      title="Buka ukuran penuh"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setViewWaProofHistoryModal(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Tutup
                      </button>
                      {viewWaProofHistoryModal.status === "rejected" && (
                        <button
                          type="button"
                          onClick={() => {
                            const target = viewWaProofHistoryModal;
                            setViewWaProofHistoryModal(null);
                            setReuploadWaLog(target);
                            setReuploadProofFile(null);
                            setReuploadProofPreview(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw size={13} />
                          <span>Perbaiki Bukti Sekarang</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. REFERRAL VIEW */}
          {(activeTab === "referral" || activeTab === "reseller") && (
            <div className="space-y-6 w-full max-w-full">
              {/* KONDISI 1: User Biasa / Penjual yang Belum Mendaftarkan Usaha */}
              {agentStatus === "regular_user" && (
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md text-center max-w-2xl mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <Store size={32} />
                  </div>
                  <div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                      Syarat Menjadi Agen Referral
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Daftarkan Usaha Anda Terlebih Dahulu
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
                    {isSeller ? (
                      <>Anda belum memiliki profil tempat usaha terdaftar. Untuk menjadi <strong>Agen Referral Surade</strong> dan mendapatkan komisi bagi hasil 10%, daftarkan usaha Anda terlebih dahulu, kemudian lakukan upgrade ke paket Premium yang terverifikasi.</>
                    ) : (
                      <>Sebagai pengguna biasa, Anda belum memiliki kode referral. Untuk menjadi <strong>Agen Referral Surade</strong> dan mendapatkan komisi bagi hasil 10%, daftarkan usaha Anda terlebih dahulu, kemudian lakukan upgrade ke paket Premium yang terverifikasi.</>
                    )}
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSeller) {
                          navigate("/add-business");
                        } else {
                          handleOpenBecomeSellerConfirm();
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95 cursor-pointer border-0"
                    >
                      <Store size={18} />
                      <span>Daftarkan Usaha Sekarang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* KONDISI 2: Penjual dengan Usaha Free (Belum Upgrade Premium) */}
              {agentStatus === "free_seller" && (
                <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-md text-center max-w-2xl mx-auto space-y-4 bg-gradient-to-b from-amber-50/50 to-white">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
                    <Crown size={32} />
                  </div>
                  <div>
                    <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                      Syarat Menjadi Agen Referral
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Upgrade Usaha Anda ke Paket Premium
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
                    Penjual dengan status usaha Free belum menjadi Agen Referral dan belum mendapatkan kode referral. Silakan upgrade usaha Anda ke paket <strong>Premium aktif</strong> dan tunggu pembayaran diverifikasi untuk mengaktifkan kode referral unik dan menikmati komisi tunai 10%.
                  </p>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("premium")}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm transition-all shadow-lg hover:shadow-amber-500/40 active:scale-95 cursor-pointer border-0"
                    >
                      <Crown size={18} />
                      <span>Upgrade ke Premium Sekarang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* KONDISI 3: Usaha Premium Kedaluwarsa (Nonaktif Sementara) */}
              {agentStatus === "expired_premium" && (
                <div className="rounded-2xl p-5 bg-rose-50 border border-rose-200 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-rose-950 m-0">Status Agen Referral Dinonaktifkan Sementara</h3>
                      <span className="px-2 py-0.5 rounded bg-rose-200/80 text-rose-800 text-[10px] font-black uppercase">Premium Kedaluwarsa</span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      Masa aktif paket Premium usaha Anda telah berakhir. Status agen dan kode referral dinonaktifkan sementara sampai usaha Anda diperpanjang ke Premium. Seluruh riwayat transaksi referral dan hubungan referral yang terikat <strong>tetap tersimpan dengan aman</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("premium")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer border-0"
                    >
                      <Crown size={14} />
                      <span>Perpanjang Masa Premium Sekarang</span>
                    </button>
                  </div>
                </div>
              )}

              {/* KONDISI 4: Agen Penjual Premium Aktif (Tampilkan Hero Aktif) */}
              {isPremiumSeller && agentStatus === "active" && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-8 shadow-xl border border-teal-800/40">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                        <Gift size={14} /> Program Kemitraan Penjual Premium Aktif
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        Dapatkan Komisi 10% Dari Setiap Referral!
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed font-normal">
                        Bagikan kode unik Anda kepada rekan usaha atau kerabat. Mitra mendapat diskon 10% saat transaksi, dan Anda otomatis menerima komisi 10% yang bisa dicairkan ke rekening bank atau e-wallet!
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => setShowWithdrawModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm transition-all shadow-lg hover:shadow-teal-500/25 active:scale-95 cursor-pointer"
                      >
                        <Wallet size={18} />
                        <span>Tarik Saldo Komisi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tampilkan Bagian Statistik & Riwayat Komisi HANYA untuk Agen Aktif atau Pemilik Saldo Tersimpan di Expired Premium */}
              {(isPremiumSeller || agentStatus === "expired_premium") && (
                <>

                  {/* 4 Stat Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {/* Card 1: Kode Referral Saya */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 relative overflow-hidden flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Kode Referral Saya</span>
                          <span className="text-[10px] font-medium text-slate-400">Bagikan untuk dapat komisi</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#059669] flex items-center justify-center font-bold shrink-0">
                          <Gift size={20} />
                        </div>
                      </div>

                      {/* Referral Code Display Box */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">KODE KEMITRAAN</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                            Aktif
                          </span>
                        </div>

                        {/* Dedicated Full-Width Code Box - Never Truncated */}
                        <div className="bg-slate-900/90 py-2.5 px-3 rounded-lg border border-slate-800 text-center flex items-center justify-center">
                          <span
                            className="font-mono text-xs sm:text-sm font-black text-teal-300 tracking-wider select-all whitespace-nowrap leading-none"
                            title={referralCode}
                          >
                            {referralCode}
                          </span>
                        </div>

                        {/* Action Buttons: Salin Kode, Bagi Link, Ubah Kode */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(referralCode);
                              setReferralCopyToast(true);
                              setTimeout(() => setReferralCopyToast(false), 2500);
                            }}
                            className="w-full py-1.5 px-2 rounded-md bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                            title="Salin Kode Referral"
                          >
                            {referralCopyToast ? <Check size={12} /> : <Copy size={12} />}
                            <span>{referralCopyToast ? "Tersalin!" : "Salin Kode"}</span>
                          </button>

                          <button
                            onClick={() => handleShareReferralCode(referralCode)}
                            className="w-full py-1.5 px-2 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-95 text-teal-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-800"
                            title="Bagikan Link Referral via WA / Sosial Media"
                          >
                            <Share2 size={12} />
                            <span>Bagi Link</span>
                          </button>
                        </div>
                      </div>

                      {/* Bonus Teman Footer */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500 text-[11px]">Bagi Hasil:</span>
                        <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          Komisi 10%
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Total Pendapatan & Saldo Komisi */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Saldo Komisi Tersedia</span>
                          <span className="text-[10px] font-medium text-slate-400">Siap diajukan pencairan</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                          <Wallet size={20} />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-[#059669] tracking-tight">
                          Rp {(availableReferralBalance || 0).toLocaleString("id-ID")}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
                          <span>Total Diperoleh:</span>
                          <strong className="text-slate-800">Rp {(totalReferralEarnings || 0).toLocaleString("id-ID")}</strong>
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Minimal: Rp 50.000</span>
                        {(availableReferralBalance || 0) >= 50000 ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Siap Ditarik
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum Cukup</span>
                        )}
                      </div>
                    </div>

                    {/* Card 3: Berapa Kali Kode Dipakai */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Penggunaan Kode</span>
                          <span className="text-[10px] font-medium text-slate-400">Statistik rekan bisnis</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                          <Users size={20} />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                          {totalReferralUsage} Kali Dipakai
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          <strong className="text-slate-800">{successReferralCount}</strong> transaksi berhasil diselesaikan
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Status: <strong className="text-emerald-600">Aktif</strong></span>
                      </div>
                    </div>

                    {/* Card 4: Estimasi Pending Earning */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Komisi Pending</span>
                          <span className="text-[10px] font-medium text-slate-400">Dalam proses verifikasi</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                          <Clock size={20} />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-600 tracking-tight">
                          Rp {pendingReferralEarnings.toLocaleString("id-ID")}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Menunggu verifikasi pembayaran transaksi
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Status: <span className="text-amber-600 font-semibold">Sedang Diproses</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Toast Notification Notification Toast when user applies code */}
                  {appliedPublicCodeToast && (
                    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-500/50 flex items-center gap-3 animate-bounce">
                      <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                        <Check size={16} />
                      </div>
                      <div className="text-xs font-semibold text-teal-200">{appliedPublicCodeToast}</div>
                    </div>
                  )}

                  {/* Tabel Riwayat Transaksi Referral */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <FileText size={18} className="text-[#059669]" />
                          Riwayat Transaksi Kode Referral
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Daftar transaksi pengguna yang menggunakan kode referral Anda
                        </p>
                      </div>

                      {/* Filter & Search */}
                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={referralSearch}
                            onChange={(e) => setReferralSearch(e.target.value)}
                            placeholder="Cari ID, nama, atau layanan..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#007570] focus:ring-1 focus:ring-[#007570]"
                          />
                        </div>
                        <select
                          value={referralStatusFilter}
                          onChange={(e) => setReferralStatusFilter(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#007570] cursor-pointer"
                        >
                          <option value="all">Semua Status</option>
                          <option value="success">Berhasil</option>
                          <option value="pending">Menunggu Verifikasi</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>

                        {referralTransactions.length > 0 && (
                          <button
                            onClick={handleClearAllReferralTx}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus seluruh riwayat transaksi referral"
                          >
                            <Trash2 size={13} />
                            <span>Bersihkan Riwayat</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-3 px-4">ID Transaksi</th>
                            <th className="py-3 px-4">Pengguna / Pembeli</th>
                            <th className="py-3 px-4">Layanan &amp; Bisnis</th>
                            <th className="py-3 px-4">Tanggal</th>
                            <th className="py-3 px-4 text-right">Total Transaksi</th>
                            <th className="py-3 px-4 text-right">Komisi Anda</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {loadingReferrals ? (
                            <tr>
                              <td colSpan={8} className="p-4 text-center">
                                <SuradeLoader variant="section" size="sm" text="Memuat data transaksi referral" minHeight="160px" />
                              </td>
                            </tr>
                          ) : filteredReferralTransactions.length > 0 ? (
                            filteredReferralTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-[#059669]">
                                  #{tx.id}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={tx.userAvatar || tx.user_avatar || tx.referred_avatar || DEFAULT_AVATAR}
                                      alt={tx.userName || tx.referred_name || "Pengguna"}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_AVATAR;
                                      }}
                                    />
                                    <div>
                                      <div className="font-bold text-slate-900">{tx.userName || tx.user_name || tx.referred_name || "Pengguna"}</div>
                                      <div className="text-[11px] text-slate-500">{tx.userEmail || tx.user_email || tx.referred_email || "-"}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-slate-800">{tx.service || tx.service_name || "Paket Premium"}</div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Briefcase size={11} className="text-slate-400 shrink-0" />
                                    <span>{tx.businessName || tx.business_name || "Bisnis Terkait"}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                  {tx.date || (tx.created_at ? new Date(tx.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-")}
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-slate-800 whitespace-nowrap">
                                  Rp {(tx.amount || tx.final_price || tx.transaction_amount || 0).toLocaleString("id-ID")}
                                </td>
                                <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 whitespace-nowrap">
                                  + Rp {(tx.commission || tx.commission_amount || 0).toLocaleString("id-ID")}
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  {["approved", "earned", "paid", "success", "completed", "active", "disetujui"].includes(String(tx.status).toLowerCase()) && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                      <CheckCircle size={12} /> Berhasil
                                    </span>
                                  )}
                                  {["pending", "waiting_approval", "menunggu"].includes(String(tx.status).toLowerCase()) && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                      <Clock size={12} /> Menunggu Verifikasi
                                    </span>
                                  )}
                                  {["cancelled", "rejected", "failed", "dibatalkan", "ditolak"].includes(String(tx.status).toLowerCase()) && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                                      <X size={12} /> Dibatalkan
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedReferralTx(tx)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                      <Eye size={13} />
                                      <span>Detail</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReferralTx(tx.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                      title="Hapus riwayat transaksi ini"
                                    >
                                      <Trash2 size={13} />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-500 space-y-2">
                                <Share2 size={36} className="mx-auto text-slate-300" />
                                <p className="font-bold text-sm text-slate-800">Belum ada transaksi referral.</p>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                  Bagikan kode referral Anda ({referralCode}) ke rekan bisnis untuk mulai mendapatkan komisi dari setiap pembelian Paket Premium.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Riwayat Penarikan Saldo Komisi */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Wallet size={18} className="text-[#059669]" />
                          Riwayat Penarikan Saldo Komisi
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Status dan histori pengajuan pencairan dana tunai komisi referral Anda ke rekening bank / e-wallet.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {referralWithdrawals.length > 0 && (
                          <button
                            onClick={handleClearAllWithdrawals}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Hapus seluruh riwayat penarikan"
                          >
                            <Trash2 size={13} />
                            <span>Bersihkan Riwayat</span>
                          </button>
                        )}
                        {availableReferralBalance >= 50000 && (
                          <button
                            onClick={() => {
                              setWithdrawSuccessMsg("");
                              setWithdrawErrorMsg("");
                              setShowWithdrawModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <ArrowUpRight size={14} />
                            <span>Ajukan Penarikan Baru</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Banner Peringatan jika ada penarikan yang ditolak */}
                    {referralWithdrawals.some((w) => w.status === "rejected") && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
                          <AlertTriangle size={18} className="shrink-0" />
                          <span>Pemberitahuan Penolakan Penarikan Dana</span>
                        </div>
                        {referralWithdrawals
                          .filter((w) => w.status === "rejected")
                          .slice(0, 1)
                          .map((rej) => (
                            <div key={rej.id} className="text-xs space-y-1.5 pl-6">
                              <p className="text-rose-800 leading-relaxed">
                                Pengajuan penarikan sebesar <strong>Rp {rej.amount.toLocaleString("id-ID")}</strong> ({rej.bank} - {rej.account_number}) telah ditolak oleh Admin.
                              </p>
                              <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 font-medium text-rose-950">
                                <strong>Alasan Penolakan dari Admin:</strong>
                                <p className="mt-0.5 text-slate-800 italic">"{rej.rejection_reason || "Tidak ada alasan spesifik."}"</p>
                              </div>
                              <p className="text-slate-600 text-[11px]">
                                Saldo Anda telah dikembalikan ke Saldo Tersedia. Anda dapat memperbaiki data atau mengajukan permohonan penarikan kembali.
                              </p>
                              <button
                                onClick={() => {
                                  setWithdrawForm({
                                    bank: rej.bank || "BCA",
                                    accountNumber: rej.account_number || "",
                                    accountHolder: rej.account_holder || user?.name || "",
                                    amount: String(Math.min(rej.amount, availableReferralBalance || rej.amount)),
                                  });
                                  setWithdrawSuccessMsg("");
                                  setWithdrawErrorMsg("");
                                  setShowWithdrawModal(true);
                                }}
                                className="mt-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                              >
                                <RefreshCw size={12} />
                                <span>Ajukan Penarikan Ulang</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Table Riwayat Penarikan */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4">Kode &amp; Waktu</th>
                            <th className="py-3 px-4">Tujuan Rekening</th>
                            <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4">Catatan / Alasan</th>
                            <th className="py-3 px-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {referralWithdrawals.length > 0 ? (
                            referralWithdrawals.map((w) => (
                              <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                                  <span className="text-[#059669] block">{w.code}</span>
                                  <span className="text-[11px] text-slate-400 font-normal font-sans block">{w.date}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {w.bank === "QRIS" || w.method === "qris" ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-black">
                                        <QrCode size={11} /> QRIS
                                      </span>
                                    ) : (
                                      <span>{w.bank || w.bank_name}</span>
                                    )}
                                  </div>
                                  <div className="text-[11.5px] text-slate-600 font-mono">{w.account_number}</div>
                                  <div className="text-[11px] text-slate-500">an {w.account_holder || w.account_name}</div>
                                  {w.qris_image && (
                                    <button
                                      type="button"
                                      onClick={() => setViewQrisModalUrl(w.qris_image)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[10.5px] font-bold cursor-pointer transition-colors"
                                      title="Lihat QRIS Saya"
                                    >
                                      <QrCode size={11} />
                                      <span>Lihat QRIS</span>
                                    </button>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right font-extrabold text-base text-slate-900 whitespace-nowrap">
                                  Rp {w.amount.toLocaleString("id-ID")}
                                </td>
                                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                  <div className="flex flex-col items-center gap-1">
                                    {w.status === "paid" && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                        <CheckCircle size={12} /> Dana Ditransfer (Lunas)
                                      </span>
                                    )}
                                    {w.status === "approved" && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                                        <CheckCircle2 size={12} /> Disetujui (Siap Kirim)
                                      </span>
                                    )}
                                    {w.status === "pending" && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                        <Clock size={12} /> Menunggu Verifikasi
                                      </span>
                                    )}
                                    {w.status === "rejected" && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                                        <X size={12} /> Ditolak
                                      </span>
                                    )}
                                    {w.transfer_proof && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewReferralProofModal(w.transfer_proof)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#059669] border border-teal-200 text-[10.5px] font-bold cursor-pointer transition-colors shadow-2xs mt-0.5"
                                        title="Lihat Foto Bukti Transfer Admin"
                                      >
                                        <Eye size={12} />
                                        <span>Lihat Bukti Transfer</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 max-w-xs">
                                  {w.status === "rejected" && (w.rejection_reason || w.admin_note) ? (
                                    <div className="text-xs text-rose-700 bg-rose-50/60 p-2 rounded-lg border border-rose-200">
                                      <span className="font-bold block text-[10.5px] uppercase">Alasan Penolakan:</span>
                                      <span className="leading-relaxed">{w.rejection_reason || w.admin_note}</span>
                                    </div>
                                  ) : w.status === "paid" && w.processed_at ? (
                                    <div className="space-y-0.5">
                                      <span className="text-slate-500 text-[11px] block">
                                        Ditransfer pada: <strong>{w.processed_at}</strong>
                                      </span>
                                      {w.admin_note && (
                                        <span className="text-slate-600 text-[10.5px] italic block" title={w.admin_note}>
                                          Catatan: {w.admin_note}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">-</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {w.transfer_proof && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewReferralProofModal(w.transfer_proof)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#059669] border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
                                        title="Lihat foto bukti transfer resmi admin"
                                      >
                                        <Eye size={13} />
                                        <span>Bukti</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteWithdrawal(w.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                      title="Hapus riwayat penarikan ini"
                                    >
                                      <Trash2 size={13} />
                                      <span>Hapus</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500 space-y-1">
                                <p className="font-semibold text-xs text-slate-700">Belum ada riwayat penarikan saldo.</p>
                                <p className="text-[11px] text-slate-400">
                                  Ketika Anda melakukan penarikan komisi referral, status dan bukti pemrosesan akan tampil di sini.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Panduan Cara Kerja Program Referral */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Target size={18} className="text-[#059669]" />
                      Cara Kerja Program Referral 3 Langkah Mudah
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          1
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">Bagikan Kode Unik</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Salin kode <strong className="text-slate-800">{referralCode}</strong> atau link pendaftaran dan bagikan ke rekan bisnis Anda.
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          2
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">Teman Mendaftar & Transaksi</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Pengguna mendaftar dengan kode Anda dan membeli Paket Promosi/Premium dengan penawaran diskon khusus.
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          3
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">Nikmati Komisi 10%</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Komisi tunai bagi hasil 10% otomatis masuk setelah pembayaran diverifikasi admin dan dapat ditarik kapan saja.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generator Pesan Promosi & Tips Menarik Pengguna */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles size={18} className="text-amber-500" />
                          Generator Pesan Promosi Unik & Strategi Penawaran
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gunakan template pesan yang dirancang khusus untuk menarik teman/rekan bisnis agar tertarik memakai kode referral Anda!
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                        <Flame size={14} className="text-amber-500" /> Dynamic Promo Generator
                      </div>
                    </div>

                    {/* Strategy Insight Alert */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/80 text-teal-950 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                        <Zap size={16} className="text-teal-600 shrink-0" />
                        <span>Rahasia Mengapa Calon Pengguna Mau Memakai Kode Referral Anda:</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-6">
                        Penerima kode Anda langsung mendapat <strong className="text-emerald-700 font-extrabold bg-white px-1.5 py-0.5 rounded border border-emerald-300/60">Diskon Khusus & Keuntungan Tambahan</strong> saat mendaftar atau membeli Paket Premium Usaha. Ini adalah <em>Win-Win Solution</em> — Rekan Anda hemat biaya promosi, dan Anda otomatis menerima <strong className="text-teal-800 font-black">Komisi Tunai 10%</strong> dari setiap pembayaran!
                      </p>
                    </div>

                    {/* Template Chips */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Pilih Template Pesan Promosi:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedPromoTemplate("diskon")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedPromoTemplate === "diskon"
                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                        >
                          <Gift size={14} />
                          <span>1. Promo Diskon Hemat (Umum)</span>
                        </button>
                        <button
                          onClick={() => setSelectedPromoTemplate("bisnis")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedPromoTemplate === "bisnis"
                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                        >
                          <Briefcase size={14} />
                          <span>2. Penawaran Pelaku UMKM / Bisnis</span>
                        </button>
                        <button
                          onClick={() => setSelectedPromoTemplate("heboh")}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${selectedPromoTemplate === "heboh"
                            ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                        >
                          <Flame size={14} />
                          <span>3. Promo Heboh Terbatas (WA/Medsos)</span>
                        </button>
                      </div>
                    </div>

                    {/* Promo Text Box & Actions */}
                    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                        <span>PRATINJAU PESAN PROMOSI (SIAP BAGIKAN)</span>
                        <span className="text-teal-400 font-mono">Kode: {referralCode}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed selection:bg-teal-600 selection:text-white">
                        {activePromoMessage}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activePromoMessage);
                            setCopiedPromoText(true);
                            setTimeout(() => setCopiedPromoText(false), 2500);
                          }}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          {copiedPromoText ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedPromoText ? "Tersalin Ke Clipboard!" : "Salin Pesan Promosi"}</span>
                        </button>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(activePromoMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <MessageCircle size={14} />
                          <span>Kirim Langsung via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Katalog Kode Referral Komunitas & Leaderboard (Khusus Tampilan Admin) */}
                  {user?.role === "admin" && (
                    <>
                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Users size={18} className="text-teal-600" />
                              Katalog Kode Referral Komunitas (Pengguna Lain)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Ingin menggunakan kode referral milik mitra lain untuk mendapatkan diskon 10%? Pilih dan gunakan kode di bawah ini tanpa perlu bertanya!
                            </p>
                          </div>

                          {/* Search & Refresh */}
                          <div className="flex items-center gap-2.5 w-full md:w-auto">
                            <div className="relative flex-1 md:w-56">
                              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={publicCodeSearch}
                                onChange={(e) => setPublicCodeSearch(e.target.value)}
                                placeholder="Cari nama atau kode..."
                                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                              />
                            </div>
                            <button
                              onClick={fetchPublicCodes}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              title="Perbarui daftar kode referral"
                            >
                              <RefreshCw size={15} className={loadingPublicCodes ? "animate-spin text-teal-600" : ""} />
                            </button>
                          </div>
                        </div>

                        {/* Cards Grid */}
                        {loadingPublicCodes ? (
                          <SuradeLoader variant="section" size="sm" text="Memuat kode referral komunitas" minHeight="160px" />
                        ) : filteredPublicCodes.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPublicCodes.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                              >
                                {/* Owner Header */}
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.avatar || DEFAULT_AVATAR}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                    onError={(e) => {
                                      e.target.src = DEFAULT_AVATAR;
                                    }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                                    <span className="text-[10px] text-slate-500 font-medium block">Mitra Referral Surade</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                    Diskon 10%
                                  </span>
                                </div>

                                {/* Code Display Box */}
                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">KODE REFERRAL</span>
                                  <span className="font-mono text-sm font-black text-teal-300 tracking-wider block select-all">
                                    {item.code}
                                  </span>
                                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-0.5">
                                    <CheckCircle2 size={11} className="text-teal-400" />
                                    <span>Telah digunakan {item.usage_count || 0}x</span>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.code);
                                      setCopiedPublicCodeId(item.id);
                                      setTimeout(() => setCopiedPublicCodeId(null), 2500);
                                    }}
                                    className="w-full py-1.5 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-teal-200"
                                    title="Salin Kode Referral Ini"
                                  >
                                    {copiedPublicCodeId === item.id ? <Check size={12} /> : <Copy size={12} />}
                                    <span>{copiedPublicCodeId === item.id ? "Tersalin!" : "Salin Kode"}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.code);
                                      setAppliedPublicCodeToast(`Kode "${item.code}" tersalin! Mengalihkan ke Paket Premium...`);
                                      setTimeout(() => setAppliedPublicCodeToast(""), 3500);
                                      setActiveTab("premium");
                                    }}
                                    className="w-full py-1.5 px-2 rounded-lg bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                                    title="Gunakan Kode Ini Saat Checkout Paket Premium"
                                  >
                                    <ArrowRight size={12} />
                                    <span>Gunakan Kode</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-10 text-center text-slate-500 space-y-2">
                            <Users size={32} className="mx-auto text-slate-300" />
                            <p className="text-xs font-semibold text-slate-700">Tidak ada kode referral komunitas ditemukan.</p>
                          </div>
                        )}
                      </div>

                      {/* Papan Peringkat Reseller / Referrer Terbaik (Leaderboard) */}
                      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Trophy size={18} className="text-amber-500" />
                              Papan Peringkat Referrer Terbaik (Leaderboard)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Top 10 mitra dengan hasil perolehan komisi dan pengguna terbanyak di Surade.com
                            </p>
                          </div>
                          <button
                            onClick={fetchLeaderboard}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                            title="Perbarui leaderboard"
                          >
                            <RefreshCw size={15} className={loadingLeaderboard ? "animate-spin text-amber-500" : ""} />
                          </button>
                        </div>

                        {loadingLeaderboard ? (
                          <SuradeLoader variant="section" size="sm" text="Memuat papan peringkat" minHeight="160px" />
                        ) : referralLeaderboard.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                                  <th className="py-3 px-4">Peringkat</th>
                                  <th className="py-3 px-4">Pengguna / Mitra</th>
                                  <th className="py-3 px-4">Kode Referral</th>
                                  <th className="py-3 px-4 text-center">Total Berhasil</th>
                                  <th className="py-3 px-4 text-right">Total Komisi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {referralLeaderboard.map((item, idx) => (
                                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                                      {idx === 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold border border-amber-300">
                                          <Trophy size={13} className="text-amber-600" /> #1 Juara
                                        </span>
                                      )}
                                      {idx === 1 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-extrabold border border-slate-300">
                                          <Award size={13} className="text-slate-600" /> #2 Perak
                                        </span>
                                      )}
                                      {idx === 2 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-extrabold border border-amber-200">
                                          <Award size={13} className="text-amber-700" /> #3 Perunggu
                                        </span>
                                      )}
                                      {idx > 2 && <span className="text-slate-500 font-semibold pl-2">#{idx + 1}</span>}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2.5">
                                        <img
                                          src={item.avatar || DEFAULT_AVATAR}
                                          alt={item.name}
                                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                          onError={(e) => {
                                            e.target.src = DEFAULT_AVATAR;
                                          }}
                                        />
                                        <span className="font-bold text-slate-900">{item.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-teal-600">
                                      {item.referral_code}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                      {item.total_referrals} Pengguna
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-sm">
                                      Rp {(item.total_commission || 0).toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-8 text-center text-slate-500 space-y-1">
                            <Trophy size={32} className="mx-auto text-slate-300" />
                            <p className="text-xs font-semibold text-slate-700">Belum ada data papan peringkat.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Modal Preview Bukti Transfer Komisi Referral */}
                  {previewReferralProofModal && (
                    <div
                      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
                      onClick={() => setPreviewReferralProofModal(null)}
                    >
                      <div
                        className="bg-white rounded-3xl p-5 max-w-2xl w-full shadow-2xl relative border border-slate-200 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">Bukti Transfer Resmi Admin</h4>
                              <p className="text-[10.5px] text-slate-400">Bukti struk transfer dana komisi referral ke rekening / e-wallet Anda</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewReferralProofModal(null)}
                            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                            title="Tutup"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="max-h-[68vh] overflow-auto flex items-center justify-center bg-slate-900/5 rounded-2xl p-2 min-h-[260px] border border-slate-200">
                          <img
                            src={previewReferralProofModal}
                            alt="Bukti Transfer Komisi Referral"
                            className="max-h-[62vh] w-auto object-contain rounded-xl shadow-lg border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://placehold.co/600x400/007570/ffffff?text=Bukti+Transfer+Tersimpan";
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400">Klik di luar jendela untuk menutup</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewReferralProofModal(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                            >
                              Tutup
                            </button>
                            <a
                              href={previewReferralProofModal}
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
                </>
              )}
            </div>
          )}

          {/* 6. SIMPAN (BOOKMARKS) VIEW */}
          {activeTab === "simpan" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 z-10">
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
                    <Bookmark className="text-[#5eead4]" size={24} />
                    Bookmark Tersimpan
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-normal">
                    Daftar bisnis, artikel blog, dan event yang Anda simpan dari portal Surade.com.
                  </p>
                </div>
              </div>

              {/* Main Container Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-8">
                {savedItemsError ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{savedItemsError}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Terjadi kesalahan saat memuat data bookmark.</p>
                    </div>
                    <button
                      onClick={fetchSavedItems}
                      className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : loadingSavedItems ? (
                  <div className="py-6">
                    <SuradeLoader
                      variant="section"
                      size="md"
                      text="Memuat bookmark tersimpan"
                      minHeight="180px"
                    />
                  </div>
                ) : (() => {
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
                            <Briefcase size={20} className="text-[#059669]" />
                            Business
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#059669] border border-teal-100">
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
                                      <h4 className="text-sm font-bold text-slate-900 truncate hover:text-[#059669] cursor-pointer transition-colors" onClick={() => navigate(`/business/${item.id}`)} title={item.title}>
                                        {item.title}
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-teal-50 text-[#059669] border border-teal-100 shrink-0">
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
                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#059669] flex items-center justify-center">
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

                      {/* ── 2. INFO & EVENT SECTION (BOTTOM) ── */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-purple-600" />
                            Info & Event
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
                                          className="text-sm font-bold text-slate-900 truncate hover:text-[#059669] cursor-pointer transition-colors"
                                          onClick={() => navigate(`/blog/${item.blogId || item.id}`)}
                                          title={item.title}
                                        >
                                          {item.title}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0 ${isEvent
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                          : "bg-purple-50 text-purple-700 border border-purple-100"
                                          }`}>
                                          {isEvent ? "Event" : "Info"}
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
          {activeTab === "ulasan" && (
            (() => {
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-[14px]">
                    {/* Total all reviews */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-3.5 sm:p-[16px_18px] flex items-center gap-[12px] shadow-sm">
                      <div className="w-[40px] h-[40px] rounded-[10px] bg-[#fef9c3] flex items-center justify-center shrink-0">
                        <Star size={18} className="text-[#ca8a04]" />
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-[#0f172a] leading-none">{reviews.length}</div>
                        <div className="text-[11px] text-[#64748b] mt-[2px]">Total Ulasan</div>
                      </div>
                    </div>
                    {/* Avg rating (filtered) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-3.5 sm:p-[16px_18px] flex items-center gap-[12px] shadow-sm">
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
                    <div className="bg-white border border-[#e2e8f0] rounded-[13px] p-3.5 sm:p-[16px_18px] flex items-center gap-[12px] shadow-sm">
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
                      <Search size={14} className="text-[#059669]" />
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

                  {/* ── Table / Loading / Error / Empty ── */}
                  {reviewsError ? (
                    <div className="bg-white border border-rose-200 rounded-[13px] p-[36px_24px] flex flex-col items-center justify-center text-center">
                      <div className="w-[50px] h-[50px] rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-[10px]">
                        <AlertCircle size={24} />
                      </div>
                      <h4 className="text-[14px] font-bold text-slate-800 mb-[4px]">{reviewsError}</h4>
                      <button
                        onClick={fetchReviews}
                        className="mt-[8px] px-[14px] py-[6px] bg-[#059669] text-white font-semibold rounded-[8px] text-[12px] hover:bg-[#005a58] transition-colors cursor-pointer"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  ) : loadingReviews ? (
                    <SuradeLoader variant="section" size="sm" text="Memuat ulasan pelanggan" minHeight="180px" />
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
                              <th className="px-[14px] py-[11px] text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em]">Pelanggan</th>
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
                                        <Link to={`/business/${rev.businessSlug}`} className="text-[11px] text-[#059669] hover:underline flex items-center gap-[3px] mt-[1px]">
                                          <Eye size={10} /> Lihat
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {/* Pelanggan */}
                                <td className="px-[14px] py-[12px]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                                      {(rev.user || "P").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-[12px] font-medium text-[#1e293b] truncate max-w-[120px]">
                                        {rev.user || "Pelanggan"}
                                      </span>
                                      {rev.is_mine && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                          Ulasan Saya
                                        </span>
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
                                    className={`w-[30px] h-[30px] flex items-center justify-center rounded-[7px] text-[12.5px] font-medium transition-colors ${p === safePage ? "bg-[#059669] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]"
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
            })()
          )}

          {/* 7.5 PAKET PREMIUM MANAGEMENT (ADMIN ONLY) */}
          {activeTab === "paket-premium" && user?.role === 'admin' && (
            <div className="space-y-6 w-full max-w-6xl mx-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown size={32} className="text-teal-200" />
                      <h2 className="text-2xl font-extrabold">Daftar Paket Premium</h2>
                    </div>
                    <p className="text-teal-100 text-sm">
                      Kelola varian harga, limit usaha, serta keunggulan fitur paket.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreatePlanModal}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-teal-50 text-teal-700 font-bold rounded-xl shadow-md transition-colors"
                  >
                    <Plus size={20} />
                    <span>Tambah Paket</span>
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              {loadingAdminPlans ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 size={48} className="animate-spin text-teal-600 mb-4" />
                  <p className="text-gray-600 font-medium">Memuat paket premium...</p>
                </div>
              ) : adminPlans.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <Crown size={64} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Paket Premium</h3>
                  <p className="text-gray-600 mb-6">Klik tombol "Tambah Paket" untuk membuat paket premium pertama</p>
                  <button
                    onClick={handleOpenCreatePlanModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    <Plus size={20} />
                    <span>Tambah Paket</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminPlans.map((plan) => {
                    const isFree = Number(plan.price) === 0;
                    const isActive = plan.is_active;
                    const features = plan.features || {};

                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-2xl border-2 p-6 shadow-md transition-all hover:shadow-xl ${isActive ? 'border-teal-200' : 'border-gray-200 opacity-75'
                          }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1">{plan.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isActive
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                              {isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <div className="text-3xl font-black text-teal-600">
                            {isFree ? 'Gratis' : `Rp ${Number(plan.price).toLocaleString('id-ID')}`}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            / {plan.duration_days >= 365
                              ? `${Math.floor(plan.duration_days / 365)} Tahun`
                              : `${Math.floor(plan.duration_days / 30)} Bulan`}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-6 min-h-[160px]">
                          {Object.entries(features).map(([feature, enabled]) => (
                            <div key={feature} className="flex items-start gap-2 text-sm">
                              {enabled ? (
                                <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
                              ) : (
                                <X size={18} className="text-gray-300 shrink-0 mt-0.5" />
                              )}
                              <span className={enabled ? 'text-gray-700' : 'text-gray-400 line-through'}>
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Usage Stats */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-4 pb-4 border-t border-gray-100 pt-4">
                          <Users size={14} className="shrink-0" />
                          <span>Dipakai oleh <strong>{plan.used_count || 0}</strong> usaha</span>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl text-sm transition-colors border border-amber-200"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleTogglePlanStatus(plan.id)}
                            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold rounded-xl text-sm transition-colors ${isActive
                              ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                              }`}
                          >
                            {isActive ? (
                              <>
                                <XCircle size={14} />
                                <span className="hidden sm:inline">Nonaktifkan</span>
                                <span className="sm:hidden">Off</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                <span className="hidden sm:inline">Aktifkan</span>
                                <span className="sm:hidden">On</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Delete Button (separate row) */}
                        {plan.used_count === 0 && (
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-full mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200"
                          >
                            <Trash2 size={12} />
                            <span>Hapus Paket</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* 8. PREMIUM VIEW */}
          {activeTab === "premium" && (
            <div className="flex flex-col gap-[24px] max-w-[1000px] mx-auto w-full">
              {/* Header Banner - PERBAIKAN: sebelumnya kartu putih polos
                  dengan ikon mahkota kecil - diganti nuansa emas premium
                  elegan dengan badge ikon bergaya 3D (gradasi + bayangan
                  berlapis supaya terlihat timbul/embossed). */}
              <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1a1408] via-[#241b09] to-[#1a1408] border border-[#f5c451]/25 p-4 sm:p-5 md:p-[26px_28px] shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-[20px]">
                {/* Cahaya dekoratif */}
                <div className="absolute -right-10 -top-14 w-64 h-64 rounded-full bg-[#f5c451]/12 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-20 w-48 h-48 rounded-full bg-[#fbbf24]/10 blur-3xl pointer-events-none" />

                {/* Badge ikon mahkota bergaya 3D */}
                <div className="flex items-center gap-3 sm:block shrink-0">
                  <div
                    className="relative z-10 shrink-0 w-11 h-11 sm:w-14 sm:h-14 md:w-[62px] md:h-[62px] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md"
                    style={{
                      background: "linear-gradient(145deg, #fde68a 0%, #f5c451 38%, #b8860b 100%)",
                      boxShadow:
                        "0 10px 24px rgba(184,134,11,0.45), inset 0 2px 3px rgba(255,255,255,0.65), inset 0 -3px 5px rgba(0,0,0,0.28)",
                    }}
                  >
                    <Crown size={24} className="text-[#3d2c05] sm:w-[28px] sm:h-[28px]" strokeWidth={2.3} />
                  </div>
                  <div className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5c451]/15 border border-[#f5c451]/30 text-[#f5d876] text-[10.5px] font-black uppercase tracking-wider">
                    <Sparkles size={11} /> Fitur Eksklusif
                  </div>
                </div>

                <div className="relative z-10 space-y-1">
                  <div className="hidden sm:inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-full bg-[#f5c451]/15 border border-[#f5c451]/30 text-[#f5d876] text-[11px] font-bold uppercase tracking-wider mb-[2px]">
                    <Sparkles size={11} /> Fitur Eksklusif
                  </div>
                  <h2 className="text-[17px] sm:text-[19px] md:text-[21px] font-extrabold tracking-tight text-white leading-snug">Upgrade Usaha ke Premium</h2>
                  <p className="text-[12px] sm:text-[13px] text-[#d9cba3] leading-relaxed">Pilih profil usaha Anda dan paket premium untuk membuka fitur peta lokasi, galeri, dan badge prioritas.</p>
                </div>
              </div>

              <div className="flex flex-col gap-[20px]">
                {/* Rejection Alert Banner for Selected Business */}
                {(() => {
                  const currentBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                  const currentBiz = (businesses || []).find(b => String(b.id) === String(currentBizId)) || businesses?.[0];
                  const subs = currentBiz?.subscriptions || currentBiz?.raw?.subscriptions || [];
                  const latestSub = subs[0];
                  const latestPayment = latestSub?.payment;
                  const isRejected = latestSub?.status === "rejected" || latestPayment?.status === "failed" || !!latestSub?.rejection_reason || !!latestPayment?.rejection_reason;
                  const rejectionReason = latestSub?.rejection_reason || latestPayment?.rejection_reason;

                  if (isRejected && rejectionReason) {
                    return (
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-800 uppercase tracking-wider">
                                Ditolak / Perlu Revisi
                              </span>
                              <span className="text-xs font-bold text-rose-900">
                                Pengajuan Paket {latestSub?.plan?.name || "Premium"} Ditolak
                              </span>
                            </div>
                            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                              <strong>Alasan Admin:</strong> {rejectionReason}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/add-business/${currentBizId}?upgrade=true`);
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 border-0"
                        >
                          <span>Perbaiki di Form Upgrade</span>
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Business Selector Card */}
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[13px] font-bold text-[#0f172a] uppercase tracking-[0.4px]">
                        1. Pilih Usaha Yang Ingin Di-Upgrade *
                      </label>
                      <p className="text-[12px] text-[#64748b] mt-[2px]">Pilih salah satu profil usaha terdaftar milik Anda yang ingin ditingkatkan statusnya</p>
                    </div>
                  </div>

                  {businesses && businesses.length > 0 ? (
                    <div className="flex flex-col gap-[12px]">
                      <select
                        value={selectedUpgradeBusiness || (businesses[0]?.id || "")}
                        onChange={(e) => setSelectedUpgradeBusiness(e.target.value)}
                        className="w-full px-[16px] py-[12px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[14px] font-semibold text-[#0f172a] outline-none focus:border-[#007570] focus:bg-white transition-all cursor-pointer"
                      >
                        {(businesses || []).map((b) => {
                          const subs = b.subscriptions || b.raw?.subscriptions || [];
                          const latestSub = subs[0];
                          const isPending = b.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending");
                          const isPrem = b.is_premium;

                          return (
                            <option key={b.id} value={b.id}>
                              {b.name} ({getCategoryDisplayName(b.category)}) — {b.city || "Lokasi"} {isPrem ? "⭐ [Sudah Premium Aktif]" : isPending ? "⏳ [Sedang Diproses Admin]" : "[Paket Free / Reguler]"}
                            </option>
                          );
                        })}
                      </select>

                      {/* Selected Business Status & Notification Banner */}
                      {(() => {
                        const currentBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                        const currentBiz = (businesses || []).find(b => String(b.id) === String(currentBizId)) || businesses?.[0];
                        if (!currentBiz) return null;

                        const subs = currentBiz?.subscriptions || currentBiz?.raw?.subscriptions || [];
                        const latestSub = subs[0];
                        const isPendingSub = currentBiz.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending");
                        const isPrem = currentBiz.is_premium;

                        return (
                          <div className="flex flex-col gap-3">
                            {/* Selected Business Card */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <img
                                  src={currentBiz.logo ? getStorageUrl(currentBiz.logo) : DEFAULT_AVATAR}
                                  alt={currentBiz.name || "Bisnis"}
                                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{currentBiz.name}</h4>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                                    <MapPin size={12} className="text-[#059669] shrink-0" />
                                    <span className="truncate">{currentBiz.city || "Indonesia"}</span>
                                    <span>•</span>
                                    <span className="truncate">{getCategoryDisplayName(currentBiz.category)}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 self-start sm:self-center">
                                {isPrem ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold whitespace-nowrap shadow-2xs">
                                    ⭐ Premium Aktif
                                  </span>
                                ) : isPendingSub ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold whitespace-nowrap">
                                    ⏳ Sedang Diproses
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold whitespace-nowrap">
                                    Paket Free / Reguler
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Alert if already premium */}
                            {isPrem && (
                              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fadeIn">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                  <Crown size={20} />
                                </div>
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-900 uppercase tracking-wider inline-block">
                                      SUDAH PREMIUM
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-amber-950 leading-snug">
                                    Usaha "{currentBiz.name}" Sudah Memiliki Paket Premium Aktif
                                  </h4>
                                  <p className="text-xs text-amber-800 leading-relaxed">
                                    Profil usaha ini sudah berstatus <strong>Premium Aktif</strong> dengan seluruh fitur lengkap. Anda tidak dapat melakukan upgrade ganda pada usaha yang sama. Silakan pilih usaha Anda yang lain di atas untuk di-upgrade.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Alert if pending verification */}
                            {isPendingSub && (
                              <div className="p-4 bg-blue-50/90 border border-blue-300 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fadeIn">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                  <Clock size={20} />
                                </div>
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-200 text-blue-900 uppercase tracking-wider inline-block">
                                      SEDANG DIVERIFIKASI
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-blue-950 leading-snug">
                                    Pengajuan Paket Premium untuk "{currentBiz.name}" Sedang Diproses
                                  </h4>
                                  <p className="text-xs text-blue-800 leading-relaxed">
                                    Bukti pembayaran untuk usaha ini sudah berhasil dikirim dan saat ini sedang menunggu antrean verifikasi Admin. Anda tidak perlu mengirim pembayaran atau upgrade ulang. Silakan pilih usaha Anda yang lain di atas jika ingin meng-upgrade usaha berbeda.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-[16px] bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-[13px] font-medium rounded-[12px] flex items-center gap-[10px]">
                      <AlertCircle size={20} className="shrink-0" />
                      <div>
                        Anda belum memiliki usaha terdaftar. Silakan{" "}
                        <button
                          onClick={() => navigate("/add-business")}
                          className="font-bold underline cursor-pointer text-[#b45309] hover:text-[#92400e]"
                        >
                          Daftarkan Usaha Baru
                        </button>{" "}
                        terlebih dahulu sebelum melakukan upgrade ke paket Premium.
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Premium Plans Grid */}
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[16px]">
                  <div>
                    <label className="text-[13px] font-bold text-[#0f172a] uppercase tracking-[0.4px]">
                      2. Pilih Paket Premium *
                    </label>
                    <p className="text-[12px] text-[#64748b] mt-[2px]">Pilih durasi dan fasilitas paket yang paling sesuai dengan kebutuhan usaha Anda</p>
                  </div>

                  {loadingPremiumPlans ? (
                    <SuradeLoader variant="section" size="sm" text="Memuat paket premium terbaru" minHeight="180px" />
                  ) : premiumPlans.length > 0 ? (
                    <div className={`grid grid-cols-1 ${premiumPlans.length === 1 ? 'max-w-[480px] mx-auto w-full' : premiumPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-[20px]`}>
                      {premiumPlans.map((plan) => {
                        const isFree = Number(plan.price) === 0;
                        const isSelected = selectedUpgradePlan?.id === plan.id;
                        const formattedDuration = plan.formatted_duration || (
                          plan.duration_value
                            ? `${plan.duration_value} ${plan.duration_unit === 'day' || plan.duration_unit === 'hari' ? 'Hari' : plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`
                            : (plan.duration_days >= 365 ? "1 Tahun" : "1 Bulan")
                        );

                        const currentBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                        const currentBiz = (businesses || []).find(b => String(b.id) === String(currentBizId)) || businesses?.[0];
                        const subs = currentBiz?.subscriptions || currentBiz?.raw?.subscriptions || [];
                        const latestSub = subs[0];
                        const isCurrentBizPending = currentBiz?.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending");
                        const isCurrentBizPrem = Boolean(currentBiz?.is_premium);
                        const isBlocked = isCurrentBizPrem || isCurrentBizPending;

                        // Dynamic feature extraction - sync with Admin database
                        let featureList = [];
                        if (plan.features && typeof plan.features === "object") {
                          if (Array.isArray(plan.features)) {
                            featureList = plan.features.map((item) => {
                              if (typeof item === "string") return { name: item, enabled: true };
                              return { name: item.name || item.title || item.feature || "Fitur", enabled: item.enabled !== false };
                            });
                          } else {
                            featureList = Object.entries(plan.features).map(([name, enabled]) => ({
                              name,
                              enabled: Boolean(enabled),
                            }));
                          }
                        }

                        // Fallback defaults if no features defined in DB
                        if (featureList.length === 0) {
                          if (isFree) {
                            featureList = [
                              { name: "Lokasi Peta Penuh", enabled: false },
                              { name: "Galeri Foto Profil", enabled: false },
                              { name: "Fitur Katalog Produk", enabled: true },
                              { name: "Akses Chat & WA Direct", enabled: true },
                              { name: "Prioritas & Badge Premium", enabled: false },
                            ];
                          } else {
                            featureList = [
                              { name: "Lokasi Peta Penuh", enabled: true },
                              { name: "Galeri Foto Profil", enabled: true },
                              { name: "Fitur Katalog Produk", enabled: true },
                              { name: "Akses Chat & WA Direct", enabled: true },
                              { name: "Prioritas & Badge Premium", enabled: true },
                            ];
                          }
                        }

                        return (
                          <div
                            key={plan.id}
                            onClick={() => {
                              if (!isFree) setSelectedUpgradePlan(plan);
                            }}
                            className={`rounded-[24px] p-[26px] flex flex-col justify-between relative transition-all duration-300 cursor-pointer overflow-hidden select-none transform-gpu group ${isFree
                              ? isSelected
                                ? "border-2 border-[#007570] ring-4 ring-[#007570]/15 -translate-y-2 shadow-[0_22px_45px_-10px_rgba(0,117,112,0.22)]"
                                : "border border-slate-200 hover:border-teal-400/50 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.12)] shadow-[0_12px_28px_-8px_rgba(15,23,42,0.07)]"
                              : isSelected
                                ? "border-2 border-amber-300 ring-4 ring-amber-400/30 -translate-y-2 shadow-[0_28px_60px_-12px_rgba(245,158,11,0.35),0_18px_36px_rgba(0,117,112,0.5)]"
                                : "border border-emerald-400/30 hover:border-amber-400/80 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-10px_rgba(0,117,112,0.45),0_0_24px_rgba(251,191,36,0.3)] shadow-[0_16px_36px_-10px_rgba(0,117,112,0.35),0_10px_20px_rgba(0,0,0,0.35)]"
                              }`}
                            style={
                              isFree
                                ? {
                                  background: "linear-gradient(155deg, #ffffff 0%, #f8fafc 45%, #f1f5f9 100%)",
                                  boxShadow: isSelected
                                    ? "0 22px 45px -10px rgba(0, 117, 112, 0.22), inset 0 2px 0 #ffffff, inset 0 -2px 4px rgba(0, 0, 0, 0.04)"
                                    : "0 14px 32px -10px rgba(15, 23, 42, 0.08), inset 0 2px 0 #ffffff, inset 0 -2px 4px rgba(0, 0, 0, 0.03)",
                                }
                                : {
                                  background: "radial-gradient(circle at 85% 15%, #0d463e 0%, #06312a 40%, #021a16 100%)",
                                  boxShadow: isSelected
                                    ? "0 30px 65px -12px rgba(245, 158, 11, 0.4), 0 18px 36px rgba(0, 117, 112, 0.5), inset 0 2px 1px rgba(255,255,255,0.45), inset 0 -4px 10px rgba(0,0,0,0.7)"
                                    : "0 22px 48px -10px rgba(0, 117, 112, 0.4), 0 12px 24px rgba(0, 0, 0, 0.5), inset 0 1.5px 1px rgba(255,255,255,0.3), inset 0 -3px 8px rgba(0,0,0,0.6)",
                                }
                            }
                          >
                            {/* 3D Ambient Lighting Effect for Premium */}
                            {!isFree && (
                              <>
                                <div className="absolute -top-20 -right-20 w-44 h-44 bg-gradient-to-br from-amber-300/30 via-emerald-400/25 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                                <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                              </>
                            )}

                            <div className="relative z-10">
                              {/* Badge and 3D Selector Header */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                {isFree ? (
                                  <span
                                    className="px-3 py-1 text-slate-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1.5"
                                    style={{
                                      background: "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.08), inset 0 1px 0 #ffffff, inset 0 -1px 0 #cbd5e1",
                                    }}
                                  >
                                    <Store size={12} className="text-slate-500" />
                                    <span>REGULER</span>
                                  </span>
                                ) : (
                                  <div
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md"
                                    style={{
                                      background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                                      boxShadow: "0 4px 12px rgba(217, 119, 6, 0.45), inset 0 1px 1px #ffffff, inset 0 -1.5px 1px #78350f",
                                    }}
                                  >
                                    <Crown size={12} className="text-slate-950" strokeWidth={2.5} />
                                    <span>REKOMENDASI</span>
                                  </div>
                                )}

                                <div
                                  className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all ${isSelected
                                    ? "text-slate-950 font-bold scale-110"
                                    : isFree
                                      ? "border-2 border-slate-300 bg-white"
                                      : "border-2 border-emerald-400/60 bg-emerald-950/60 text-emerald-300"
                                    }`}
                                  style={
                                    isSelected
                                      ? {
                                        background: "linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)",
                                        boxShadow: "0 0 14px rgba(245, 158, 11, 0.9), inset 0 1px 1px #ffffff",
                                      }
                                      : isFree
                                        ? { boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.12)" }
                                        : { boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.5)" }
                                  }
                                >
                                  {isSelected ? <Check size={14} strokeWidth={3.5} /> : null}
                                </div>
                              </div>

                              <h3 className={`text-[19px] font-black mb-1 tracking-tight ${isFree ? "text-[#0f172a]" : "text-white drop-shadow-sm"}`}>
                                {plan.name}
                              </h3>

                              <div className="flex items-baseline gap-1.5 my-2.5">
                                <span className={`text-[28px] font-black tracking-tight ${isFree ? "text-slate-800" : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"}`}>
                                  {isFree ? "Rp 0" : `Rp ${Number(plan.price).toLocaleString("id-ID")}`}
                                </span>
                                <span className={`text-[12px] font-bold ${isFree ? "text-slate-500" : "text-amber-300"}`}>
                                  {isFree ? "selamanya" : `/ ${formattedDuration}`}
                                </span>
                              </div>

                              {plan.description && (
                                <p className={`text-[12px] mb-3 leading-relaxed ${isFree ? "text-slate-500" : "text-slate-200/90"}`}>
                                  {plan.description}
                                </p>
                              )}

                              {/* Dynamic 3D Features List */}
                              <ul className={`flex flex-col gap-[11px] my-[18px] pt-[16px] border-t ${isFree ? "border-slate-200/90 text-slate-700" : "border-white/15 text-slate-100"}`}>
                                {featureList.map((feat, idx) => (
                                  <li key={idx} className="flex items-center gap-[10px] text-[12.5px]">
                                    {feat.enabled ? (
                                      <div
                                        className={`w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 ${isFree
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950"
                                          }`}
                                        style={
                                          !isFree
                                            ? { boxShadow: "0 2px 6px rgba(245,158,11,0.4), inset 0 1px 0 #ffffff" }
                                            : { boxShadow: "0 1px 3px rgba(16,185,129,0.2)" }
                                        }
                                      >
                                        <Check size={12} strokeWidth={3} />
                                      </div>
                                    ) : (
                                      <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-400 border border-slate-200/60">
                                        <X size={12} strokeWidth={2.5} />
                                      </div>
                                    )}
                                    <span className={feat.enabled ? (isFree ? "font-semibold text-slate-800" : "font-bold text-white drop-shadow-xs") : "line-through opacity-50"}>
                                      {feat.name}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="relative z-10 pt-2">
                              {isFree ? (
                                <button
                                  className="w-full py-[12px] rounded-[14px] font-bold text-[13px] text-slate-500 cursor-not-allowed border-0 transition-all"
                                  style={{
                                    background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                                    boxShadow: "0 3px 6px rgba(0,0,0,0.05), inset 0 1px 0 #ffffff, inset 0 -1.5px 0 #cbd5e1",
                                  }}
                                  disabled
                                >
                                  Paket Reguler (Saat Ini)
                                </button>
                              ) : isCurrentBizPrem ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-[12px] rounded-[14px] font-bold text-[13.5px] text-amber-100 cursor-not-allowed flex items-center justify-center gap-2 border border-amber-400/30"
                                  style={{
                                    background: "linear-gradient(180deg, #78350f 0%, #451a03 100%)",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(251,191,36,0.3)",
                                  }}
                                >
                                  <Crown size={16} className="text-amber-400" />
                                  <span>Usaha Sudah Premium</span>
                                </button>
                              ) : isCurrentBizPending ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-[12px] rounded-[14px] font-bold text-[13.5px] text-blue-100 cursor-not-allowed flex items-center justify-center gap-2 border border-blue-400/30"
                                  style={{
                                    background: "linear-gradient(180deg, #1e3a8a 0%, #172554 100%)",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(96,165,250,0.3)",
                                  }}
                                >
                                  <Clock size={16} className="text-blue-300" />
                                  <span>Menunggu Verifikasi Admin</span>
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  {(() => {
                                    const basePrice = Number(plan?.price || 0);
                                    const durationDays = Number(plan?.duration_days || (plan?.duration_value ? plan.duration_value * 30 : 30));
                                    const isYear = durationDays >= 300 || plan?.name?.toLowerCase().includes("tahun") || plan?.name?.toLowerCase().includes("yearly");
                                    const isQuarter = durationDays >= 75 || plan?.name?.toLowerCase().includes("90") || plan?.name?.toLowerCase().includes("3 bulan");
                                    const fallbackCost = isYear ? 250 : isQuarter ? 90 : 35;
                                    const coinCost = basePrice > 0 ? Math.max(1, Math.round(basePrice / 1000)) : fallbackCost;

                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDirectUpgradeWithPoin(plan);
                                        }}
                                        disabled={submittingUpgrade}
                                        className="w-full py-[12px] rounded-[14px] font-black text-[13.5px] text-slate-950 cursor-pointer border border-amber-300 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20"
                                        style={{
                                          background: "linear-gradient(180deg, #fde047 0%, #f59e0b 55%, #d97706 100%)",
                                          boxShadow: "0 8px 24px rgba(217, 119, 6, 0.55), inset 0 1.5px 0 #ffffff, inset 0 -2px 0 #78350f",
                                        }}
                                      >
                                        <Zap size={16} className="fill-slate-950 text-slate-950" />
                                        <span>Bayar Instan ({coinCost} Poin)</span>
                                      </button>
                                    );
                                  })()}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                                      if (!targetBizId) {
                                        alert("Silakan daftarkan atau pilih usaha Anda terlebih dahulu.");
                                        return;
                                      }
                                      navigate(`/add-business/${targetBizId}?upgrade=true&plan_id=${plan.id}&step=2`);
                                    }}
                                    className="w-full py-[9px] rounded-[12px] font-bold text-[12px] text-emerald-100 cursor-pointer bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <span>Transfer Manual / Form Edit</span>
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] p-[36px] text-center flex flex-col items-center gap-[10px]">
                      <Crown size={36} className="text-[#94a3b8]" />
                      <div className="text-[14px] font-bold text-[#0f172a]">Belum Ada Paket Premium Aktif</div>
                      <p className="text-[12.5px] text-[#64748b] max-w-[360px]">
                        Saat ini belum ada paket premium yang diaktifkan oleh admin. Silakan periksa kembali nanti.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                {(() => {
                  const currentBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                  const currentBiz = (businesses || []).find(b => String(b.id) === String(currentBizId)) || businesses?.[0];
                  const subs = currentBiz?.subscriptions || currentBiz?.raw?.subscriptions || [];
                  const latestSub = subs[0];
                  const isCurrentBizPending = currentBiz?.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending");
                  const isCurrentBizPrem = Boolean(currentBiz?.is_premium);
                  const isBlocked = isCurrentBizPrem || isCurrentBizPending;

                  return (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-[16px_24px] bg-white border border-[#e2e8f0] rounded-[16px] shadow-sm gap-3">
                      <div className="text-[13px] text-[#64748b]">
                        {isCurrentBizPrem ? (
                          <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                            <Crown size={15} className="text-amber-600" />
                            Usaha ini sudah memiliki paket Premium aktif. Silakan pilih usaha lain.
                          </span>
                        ) : isCurrentBizPending ? (
                          <span className="text-blue-800 font-semibold flex items-center gap-1.5">
                            <Clock size={15} className="text-blue-600" />
                            Pengajuan upgrade usaha ini sedang menunggu verifikasi admin.
                          </span>
                        ) : selectedUpgradePlan ? (
                          <span>
                            Paket terpilih: <strong className="text-[#059669]">{selectedUpgradePlan.name}</strong> (Rp {Number(selectedUpgradePlan.price).toLocaleString("id-ID")})
                          </span>
                        ) : (
                          <span>Pilih salah satu paket premium di atas untuk melanjutkan</span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!selectedUpgradePlan || (businesses?.length || 0) === 0 || isBlocked}
                        onClick={() => {
                          const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                          if (!targetBizId) {
                            alert("Silakan daftarkan atau pilih usaha Anda terlebih dahulu.");
                            return;
                          }
                          navigate(`/add-business/${targetBizId}?upgrade=true${selectedUpgradePlan ? `&plan_id=${selectedUpgradePlan.id}` : ''}&step=2`);
                        }}
                        className="w-full sm:w-auto px-[24px] py-[12px] rounded-[12px] bg-[#059669] text-white font-bold text-[14px] flex items-center justify-center gap-[8px] cursor-pointer transition-all hover:bg-[#005a58] hover:shadow-md disabled:bg-[#cbd5e1] disabled:cursor-not-allowed border-0"
                      >
                        <span>{isCurrentBizPrem ? "Usaha Sudah Premium" : isCurrentBizPending ? "Sedang Diverifikasi Admin" : "Lanjut ke Formulir Upgrade & Pembayaran"}</span>
                        {!isBlocked && <ChevronRight size={18} />}
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Keuntungan Premium Info */}
              <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[28px] shadow-sm">
                <h3 className="text-[16px] font-bold text-[#0f172a]">Keuntungan Memiliki Paket Premium</h3>
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-[20px] mt-[18px]">
                  <div className="flex items-start gap-[14px]">
                    <MessageSquare size={24} className="text-[#059669] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Pesan</h4>
                      <p className="text-[12.5px] text-[#64748b]">Komunikasi langsung dengan pelanggan melalui pesan inbox</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <Phone size={24} className="text-[#059669] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">WhatsApp & Email</h4>
                      <p className="text-[12.5px] text-[#64748b]">Tampilkan kontak WA dan email untuk bisnis Anda</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <ImageIcon size={24} className="text-[#059669] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Galeri Foto</h4>
                      <p className="text-[12.5px] text-[#64748b]">Upload galeri foto untuk menampilkan produk</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[14px]">
                    <Video size={24} className="text-[#059669] shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Link Video</h4>
                      <p className="text-[12.5px] text-[#64748b]">Embed video untuk promosi bisnis Anda</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. ADVERTISING / IKLAN SAYA VIEW */}
          {activeTab === "iklan" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                    <Sparkles size={14} className="text-teal-300" />
                    <span>Advertising Management Portal</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2.5">
                    <Megaphone className="text-[#5eead4]" size={26} />
                    Advertising / Iklan Saya
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                    Kelola promosi dan paket iklan bisnis Anda. Tampilkan bisnis Anda di posisi strategis dengan paket <strong>Premium Ads (Hero Banner Teratas)</strong> atau <strong>Standard Ads (Running Ticker)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 z-10 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      fetchAdvertisements();
                      fetchAdPackages();
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                    title="Segarkan Data"
                  >
                    <RefreshCw size={15} className={loadingAdvertisements ? "animate-spin" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreateAdModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,117,112,0.39)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-0"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Pasang Iklan Baru
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* Total Iklan */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Total Iklan</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Megaphone size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-slate-900">{adStats.total_ads ?? advertisements.length}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Semua pengajuan</p>
                  </div>
                </div>

                {/* Iklan Aktif */}
                <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mr-6 -mt-6 pointer-events-none" />
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Iklan Aktif
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-emerald-700">{adStats.active_ads}</span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Sedang tayang di web</p>
                  </div>
                </div>

                {/* Menunggu Pembayaran */}
                <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-xs font-bold">Menunggu Bayar</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 flex items-center justify-center text-amber-700">
                      <CreditCard size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-amber-700">{adStats.pending_payment}</span>
                    <p className="text-[11px] text-amber-600 mt-0.5">Belum dibayar</p>
                  </div>
                </div>

                {/* Menunggu Approval */}
                <div className="bg-white border border-blue-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-blue-700">
                    <span className="text-xs font-bold">Menunggu Approval</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-100/70 flex items-center justify-center text-blue-700">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-blue-700">{adStats.waiting_approval}</span>
                    <p className="text-[11px] text-blue-600 mt-0.5">Verifikasi admin</p>
                  </div>
                </div>

                {/* Iklan Berakhir */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Berakhir</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <AlertCircle size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-black text-slate-700">{adStats.expired_ads}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Masa tayang selesai</p>
                  </div>
                </div>

                {/* Total Pengeluaran */}
                <div className="bg-white border border-teal-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-teal-700">
                    <span className="text-xs font-bold">Total Spending</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-100/70 flex items-center justify-center text-teal-700">
                      <Wallet size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-lg font-black text-[#059669] truncate block">
                      Rp {Number(adStats.total_spending || 0).toLocaleString('id-ID')}
                    </span>
                    <p className="text-[11px] text-teal-600 mt-0.5">Investasi iklan</p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs & Content Section */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 max-w-full scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-slate-100 hover:scrollbar-thumb-emerald-500" style={{ scrollbarWidth: 'thin', scrollbarColor: '#10b981 #f1f5f9' }}>
                    {[
                      { id: "all", label: "Semua", count: adStats.total_ads },
                      { id: "active", label: "Aktif", count: adStats.active_ads, badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                      { id: "pending_payment", label: "Menunggu Pembayaran", count: adStats.pending_payment, badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { id: "waiting_approval", label: "Menunggu Approval", count: adStats.waiting_approval, badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
                      { id: "needs_revision", label: "⚠️ Perlu Perbaikan", count: advertisements.filter(a => (a.computed_status || a.status) === 'needs_revision').length, badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { id: "expired", label: "Berakhir", count: adStats.expired_ads },
                      { id: "rejected", label: "Ditolak", count: adStats.rejected_ads, badgeBg: "bg-rose-50 text-rose-700 border-rose-200" },
                    ].map((tab) => {
                      const isActive = adFilterTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAdFilterTab(tab.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isActive
                            ? "bg-[#059669] text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive
                              ? "bg-white/25 text-white"
                              : tab.badgeBg || "bg-slate-200 text-slate-700"
                              }`}
                          >
                            {tab.count || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs text-slate-400 font-medium shrink-0">
                    Menampilkan iklan yang terdaftar di akun Anda
                  </span>
                </div>

                {/* Advertisements List */}
                {loadingAdvertisements ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs my-4">
                    <SuradeLoader
                      variant="section"
                      size="md"
                      text="Memuat daftar iklan Anda"
                      minHeight="180px"
                    />
                  </div>
                ) : (() => {
                  const filtered = advertisements.filter((ad) => {
                    const status = ad.computed_status || ad.status;
                    if (adFilterTab === "all") return true;
                    if (adFilterTab === "active") return status === "active" || status === "approved";
                    if (adFilterTab === "pending_payment") return status === "pending_payment" || ad.payment_status === "unpaid" || ad.payment_status === "pending_payment";
                    if (adFilterTab === "waiting_approval") return status === "waiting_approval" || (ad.payment_status === "pending" && status === "pending");
                    if (adFilterTab === "needs_revision") return status === "needs_revision";
                    if (adFilterTab === "expired") return status === "expired";
                    if (adFilterTab === "rejected") return status === "rejected";
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-14 px-4 text-center space-y-3 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#059669] flex items-center justify-center">
                          <Megaphone size={28} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900">
                            {adFilterTab === "all"
                              ? "Belum ada iklan yang diajukan"
                              : `Tidak ada iklan dengan status "${adFilterTab.replace('_', ' ')}"`}
                          </h4>
                          <p className="text-xs text-slate-500 max-w-md">
                            Tingkatkan eksposur bisnis Anda ke ribuan pengunjung aktif dengan memasang iklan Premium Ads atau Standard Ads.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCreateAdStep(1);
                            if (!selectedBusinessForAd && businesses.length > 0) {
                              setSelectedBusinessForAd(businesses[0].id);
                            }
                            if (!selectedPackage && adPackages.length > 0) {
                              setSelectedPackage(adPackages[0].name || adPackages[0].id);
                            }
                            setShowCreateAdModal(true);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <Plus size={15} />
                          Pasang Iklan Sekarang
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-4">
                      {filtered.map((ad) => {
                        const timeRemaining = getDetailedTimeRemaining(ad.end_date);
                        const isExpired = timeRemaining?.isExpired || false;
                        const status = isExpired ? "expired" : (ad.computed_status || ad.status);
                        const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                        const biz = ad.business || {};
                        const bizPhoto = getBusinessPhoto(biz);

                        return (
                          <div
                            key={`user-ad-${ad.id}`}
                            className={`group relative bg-white border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md ${isPremium
                              ? "border-amber-200/90 bg-gradient-to-br from-white via-amber-50/20 to-white"
                              : "border-slate-200 hover:border-teal-300"
                              }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Left info */}
                              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                                {/* Thumbnail */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] sm:min-w-[96px] sm:min-h-[96px] sm:max-w-[96px] sm:max-h-[96px] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <img
                                    src={bizPhoto}
                                    alt={biz.name || "Bisnis"}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80"; }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                                    {isPremium ? "PREMIUM" : "STANDARD"}
                                  </span>
                                </div>

                                {/* Texts */}
                                <div className="min-w-0 space-y-1 sm:space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                      {biz.name || "Nama Bisnis Tidak Ditemukan"}
                                    </h4>

                                    {/* Placement Pill */}
                                    {isPremium ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs">
                                        <Sparkles size={11} />
                                        Premium Hero Placement
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold bg-teal-50 text-[#059669] border border-teal-200">
                                        <Layers size={11} />
                                        Standard Ticker Placement
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                    <span className="font-semibold text-slate-700">
                                      {ad.package_name || "Paket Iklan"}
                                    </span>
                                    <span>•</span>
                                    <span>Durasi: <strong>{getAdDurationDisplay(ad)}</strong></span>
                                    <span>•</span>
                                    <span className="font-extrabold text-[#059669]">
                                      Rp {Number(ad.price || 0).toLocaleString("id-ID")}
                                    </span>
                                  </div>

                                  {/* Period & Days Remaining Info */}
                                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                                    {ad.start_date && ad.end_date ? (
                                      <div className="flex items-center gap-1.5 text-slate-600 flex-wrap">
                                        <Clock size={12} className="text-[#059669] shrink-0" />
                                        <span>
                                          Periode: <strong>{formatAdDateTime(ad.start_date)}</strong> s/d <strong>{formatAdDateTime(ad.end_date)}</strong>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic">
                                        * Periode mulai aktif dihitung otomatis setelah pembayaran disetujui admin.
                                      </span>
                                    )}

                                    {status === "active" && timeRemaining && !isExpired && (
                                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${timeRemaining.badgeClass}`}>
                                        {timeRemaining.text}
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-200 text-slate-600 border border-slate-300">
                                        ⏹️ Masa tayang berakhir
                                      </span>
                                    )}
                                  </div>

                                  {/* Rejection Alert if rejected or needs_revision */}
                                  {(status === "rejected" || status === "needs_revision") && (
                                    <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-start gap-2 ${status === "needs_revision"
                                      ? "bg-amber-50 border border-amber-200 text-amber-800"
                                      : "bg-rose-50 border border-rose-200 text-rose-700"
                                      }`}>
                                      <AlertTriangle size={15} className={`shrink-0 mt-0.5 ${status === "needs_revision" ? "text-amber-600" : "text-rose-600"}`} />
                                      <div>
                                        <span className="font-bold">
                                          {status === "needs_revision" ? "⚠️ Catatan Perbaikan dari Admin: " : "Alasan Penolakan Admin: "}
                                        </span>
                                        <span>{ad.rejection_reason || ad.notes || (status === "needs_revision" ? "Admin meminta perbaikan bukti transfer atau data iklan." : "Bukti transfer tidak valid atau foto bisnis belum memenuhi syarat.")}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right status & action buttons */}
                              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                {/* Status badge */}
                                <div>
                                  {status === "active" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      Aktif Tayang
                                    </span>
                                  ) : status === "waiting_approval" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                      <Clock size={13} className="animate-spin text-blue-600" />
                                      Menunggu Approval Admin
                                    </span>
                                  ) : status === "pending_payment" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      <AlertCircle size={13} />
                                      Menunggu Pembayaran
                                    </span>
                                  ) : status === "expired" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      Masa Tayang Berakhir
                                    </span>
                                  ) : status === "needs_revision" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                      <AlertCircle size={13} className="text-amber-600" />
                                      Perlu Perbaikan
                                    </span>
                                  ) : status === "rejected" ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                      Ditolak
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                      {status}
                                    </span>
                                  )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {status === "needs_revision" && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenResubmitAdModal(ad)}
                                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Edit size={14} />
                                      Perbaiki Iklan / Bukti
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setViewingAdDetail(ad)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    title="Lihat Detail & Live Preview"
                                  >
                                    <Eye size={14} />
                                    Live Preview
                                  </button>

                                  {(status === "pending_payment" || ad.payment_status === "unpaid") && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPayModalAd(ad);
                                        setAdPaymentProofFile(null);
                                        setAdPaymentProofPreview(null);
                                      }}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                                    >
                                      <CreditCard size={14} />
                                      Bayar / Upload Bukti
                                    </button>
                                  )}

                                  {(status === "pending" || status === "pending_payment" || status === "needs_revision" || status === "rejected") && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdCancel(ad.id)}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                      title="Hapus / Batalkan Iklan"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Information Features Banner */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles size={18} className="text-[#059669]" />
                      Perbandingan Paket Iklan Surade.com
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tingkatkan eksposur bisnis Anda ke ribuan pengunjung aktif dengan memasang iklan <strong>Premium</strong> atau <strong>Standard</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Premium Ads info card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                          ⭐ PREMIUM
                        </span>
                        <span className="text-xs font-bold text-amber-800">Posisi Paling Atas</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">Visual Carousel Utama</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Format iklan eksklusif dengan foto Usaha full-width ukuran besar, minimalis tanpa teks berlebih, menampilkan rating bintang ★ dan lokasi 📍. Iklan pertama yang dilihat ribuan pengunjung saat membuka Surade.com.
                      </p>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pt-2 border-t border-amber-200/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-amber-600 shrink-0" />
                        Ukuran visual besar di posisi teratas halaman utama
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-amber-600 shrink-0" />
                        Tampilan carousel otomatis dengan transisi modern
                      </li>
                    </ul>
                  </div>

                  {/* Standard Ads info card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-200/90 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#059669] text-white">
                          ⚡ STANDARD
                        </span>
                        <span className="text-xs font-bold text-teal-800">Running Ticker Dinamis</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">Promosi Berjalan Otomatis</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Format kartu promosi modern yang bergerak otomatis secara halus dari kanan ke kiri tanpa henti (running ticker). Sangat dinamis, eye-catching, dan efisien untuk mempromosikan bisnis Anda.
                      </p>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pt-2 border-t border-teal-200/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#059669] shrink-0" />
                        Ukuran promosi lebih ringkas dan hemat biaya
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#059669] shrink-0" />
                        Animasi horizontal scroller tanpa jeda (smooth infinite loop)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#059669] shrink-0" />
                        Otomatis pause saat di-hover untuk memudahkan klik pengguna
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* MODAL 1: PASANG IKLAN BARU (3-STEP GUIDED WIZARD) */}
              {/* ========================================================================= */}
              {showCreateAdModal && (
                <div
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setShowCreateAdModal(false)}
                >
                  <div
                    className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl border border-slate-200 space-y-6 my-8 text-left relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-teal-50 text-[#059669] border border-teal-200">
                            LANGKAH {createAdStep} DARI 3
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {resubmittingAdId ? "Ajukan Ulang Iklan (Revisi) #" + resubmittingAdId : (
                              createAdStep === 1 ? "Pilih Bisnis untuk Diiklankan" :
                                createAdStep === 2 ? "Pilih Paket Iklan (Placement)" :
                                  "Live Preview & Checkout Pembayaran"
                            )}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {resubmittingAdId
                            ? "Perbaiki data atau bukti pembayaran iklan Anda yang ditolak untuk diverifikasi kembali oleh admin."
                            : (createAdStep === 1 ? "Tentukan salah satu bisnis terdaftar Anda yang ingin dipromosikan." :
                              createAdStep === 2 ? "Pilih antara Premium Hero Carousel atau Standard Running Ticker." :
                                "Periksa tampilan live iklan Anda, masukkan kupon, dan selesaikan pembayaran.")
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCreateAdModal(false)}
                        className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border-0"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Step Progress Pills */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { step: 1, title: "1. Pilih Bisnis" },
                        { step: 2, title: "2. Pilih Paket" },
                        { step: 3, title: "3. Preview & Bayar" },
                      ].map((item) => (
                        <div
                          key={item.step}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${createAdStep === item.step
                            ? "bg-teal-50 border-[#007570] text-[#059669]"
                            : createAdStep > item.step
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                        >
                          {item.title}
                        </div>
                      ))}
                    </div>

                    {/* ── STEP 1: PILIH BISNIS ── */}
                    {createAdStep === 1 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Pilih Bisnis Anda ({businesses.length} Bisnis Tersedia)
                        </label>

                        {businesses.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <Briefcase size={36} className="mx-auto text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-800">Anda belum memiliki bisnis terdaftar</h4>
                            <p className="text-xs text-slate-500">
                              Tambahkan bisnis Anda terlebih dahulu di menu "Bisnis" sebelum mengajukan pemasangan iklan.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1">
                            {businesses.map((biz) => {
                              const isSelected = String(selectedBusinessForAd) === String(biz.id);
                              const photo = getBusinessPhoto(biz);
                              const categoryName = getBusinessCategoryName(biz);
                              const cityName = getBusinessCityName(biz);

                              return (
                                <div
                                  key={`select-biz-${biz.id}`}
                                  onClick={() => setSelectedBusinessForAd(biz.id)}
                                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${isSelected
                                    ? "border-[#007570] bg-teal-50/40 shadow-xs ring-2 ring-[#007570]/20"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    <img
                                      src={photo}
                                      alt={biz.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
                                      }}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{biz.name}</h4>
                                    <p className="text-xs text-[#059669] font-semibold truncate">{categoryName}</p>
                                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                      <MapPin size={11} />
                                      {cityName}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 size={20} className="text-[#059669] shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={!selectedBusinessForAd}
                            onClick={() => setCreateAdStep(2)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
                          >
                            Lanjutkan ke Pemilihan Paket
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 2: PILIH PAKET IKLAN ── */}
                    {createAdStep === 2 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Pilih Paket & Placement yang Anda Inginkan
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adPackages.length > 0 ? (
                            adPackages.map((pkg) => {
                              const isSelected = selectedPackage === pkg.name || selectedPackage === pkg.id || String(selectedPackage) === String(pkg.id);
                              const isPrem = pkg.placement_type === "premium" || /premium/i.test(pkg.name);

                              return (
                                <div
                                  key={`ad-pkg-${pkg.id}`}
                                  onClick={() => setSelectedPackage(pkg.id || pkg.name)}
                                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${isSelected
                                    ? isPrem
                                      ? "border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-500/20"
                                      : "border-[#007570] bg-teal-50/40 shadow-md ring-2 ring-[#007570]/20"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                  {isPrem && (
                                    <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                                      ⭐ TOP HERO CAROUSEL
                                    </div>
                                  )}

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${isPrem
                                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                                          : "bg-teal-100 text-teal-900 border border-teal-300"
                                          }`}
                                      >
                                        {isPrem ? "Premium Ads" : "Standard Ads"}
                                      </span>
                                      {isSelected && <CheckCircle2 size={20} className={isPrem ? "text-amber-600" : "text-[#059669]"} />}
                                    </div>

                                    <div>
                                      <h4 className="text-base font-extrabold text-slate-900">{pkg.name}</h4>
                                      <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-2xl font-black text-slate-900">
                                          Rp {Number(pkg.price || 0).toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          / {pkg.formatted_duration || `${pkg.duration_value} ${pkg.duration_unit}`}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed">
                                      {pkg.description || (isPrem ? "Tampil eksklusif di bagian paling atas Home dengan visual besar, rating, dan lokasi." : "Tampil dalam scroller berjalan continuous ticker yang dinamis dan aktif.")}
                                    </p>

                                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs font-medium text-slate-700">
                                      <div className="flex items-center gap-2">
                                        <Check size={14} className={isPrem ? "text-amber-600" : "text-[#059669]"} />
                                        <span>Placement: <strong>{isPrem ? "Hero Banner Teratas" : "Continuous Running Ticker"}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check size={14} className={isPrem ? "text-amber-600" : "text-[#059669]"} />
                                        <span>Durasi Tayang: <strong>{pkg.formatted_duration || `${pkg.duration_value} Hari`}</strong></span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <>
                              {/* Paket 1: Iklan Harian */}
                              <div
                                onClick={() => setSelectedPackage("Iklan Harian (1 Hari)")}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedPackage === "Iklan Harian (1 Hari)"
                                  ? "border-[#007570] bg-teal-50/40 shadow-md"
                                  : "border-slate-200 bg-white"
                                  }`}
                              >
                                <div className="space-y-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900">1 Hari</span>
                                  <h4 className="text-base font-extrabold text-slate-900">Iklan Harian (1 Hari)</h4>
                                  <span className="text-xl font-black text-slate-900">Rp 2.000</span>
                                  <p className="text-xs text-slate-600">Tampil di banner promosi selama 1 hari.</p>
                                </div>
                              </div>

                              {/* Paket 2: Iklan Mingguan */}
                              <div
                                onClick={() => setSelectedPackage("Iklan Mingguan (7 Hari)")}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedPackage === "Iklan Mingguan (7 Hari)"
                                  ? "border-amber-500 bg-amber-50/40 shadow-md"
                                  : "border-slate-200 bg-white"
                                  }`}
                              >
                                <div className="space-y-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900">7 Hari</span>
                                  <h4 className="text-base font-extrabold text-slate-900">Iklan Mingguan (7 Hari)</h4>
                                  <span className="text-xl font-black text-slate-900">Rp 12.000</span>
                                  <p className="text-xs text-slate-600">Tampil promosi selama 1 minggu penuh.</p>
                                </div>
                              </div>

                              {/* Paket 3: Iklan Bulanan */}
                              <div
                                onClick={() => setSelectedPackage("Iklan Bulanan (30 Hari)")}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${selectedPackage === "Iklan Bulanan (30 Hari)"
                                  ? "border-emerald-600 bg-emerald-50/40 shadow-md"
                                  : "border-slate-200 bg-white"
                                  }`}
                              >
                                <div className="space-y-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900">30 Hari</span>
                                  <h4 className="text-base font-extrabold text-slate-900">Iklan Bulanan (30 Hari)</h4>
                                  <span className="text-xl font-black text-slate-900">Rp 40.000</span>
                                  <p className="text-xs text-slate-600">Paket hemat promosi maksimal 1 bulan.</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setCreateAdStep(1)}
                            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                          >
                            Kembali
                          </button>
                          <button
                            type="button"
                            disabled={!selectedPackage}
                            onClick={() => {
                              setCreateAdStep(3);
                              fetchAvailableCoupons();
                            }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
                          >
                            Lanjutkan ke Preview & Pembayaran
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── STEP 3: LIVE PREVIEW & CHECKOUT ── */}
                    {createAdStep === 3 && (() => {
                      const selBiz = getSelectedBusinessObj();
                      const selPkg = getSelectedPackageObj();
                      const isPrem = selPkg?.placement_type === "premium" || (typeof selectedPackage === "string" && /premium/i.test(selectedPackage));
                      const photo = getBusinessPhoto(selBiz);
                      const categoryName = getBusinessCategoryName(selBiz);
                      const cityName = getBusinessCityName(selBiz);
                      const rawRating = Number(selBiz?.rating || selBiz?.average_rating || selBiz?.raw?.rating || selBiz?.raw?.average_rating || 0);
                      const rawReviewsCount = Number(selBiz?.reviews_count || selBiz?.ratings_count || selBiz?.total_reviews || selBiz?.raw?.reviews_count || selBiz?.raw?.ratings_count || (Array.isArray(selBiz?.raw?.reviews) ? selBiz.raw.reviews.length : 0) || 0);
                      const formattedRating = rawRating > 0 ? rawRating.toFixed(1) : "0.0";

                      return (
                        <div className="space-y-6">
                          {/* Live Preview Box */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Eye size={14} className="text-[#059669]" />
                                Live Realistic Preview ({isPrem ? "Premium Hero Format" : "Standard Scroller Format"})
                              </label>
                              <span className="text-[11px] text-slate-400 font-medium">
                                * Tampilan actual iklan Anda di halaman Home
                              </span>
                            </div>

                            {/* Actual Preview Component Container */}
                            <div className="rounded-2xl border border-slate-300 overflow-hidden bg-slate-950 p-4 sm:p-5 shadow-inner">
                              {isPrem ? (
                                /* Premium Ads Simulation */
                                <div className="relative w-full h-[220px] sm:h-[260px] rounded-xl overflow-hidden border border-white/10 shadow-xl group">
                                  <img
                                    src={photo}
                                    alt={selBiz?.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

                                  <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-white shadow-md">
                                      ⭐ SPONSORED
                                    </span>
                                  </div>

                                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                                    <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                      {selBiz?.name || "Nama Bisnis Anda"}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                        <span>{formattedRating}</span>
                                        <span className="text-slate-300 font-normal">({rawReviewsCount} ulasan • {categoryName})</span>
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <MapPin size={13} className="text-teal-400" />
                                        {cityName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Standard Ads Simulation */
                                <div className="flex items-center justify-center p-4">
                                  <div className="w-full max-w-[340px] bg-white rounded-2xl border border-slate-200 p-3.5 shadow-md flex items-center gap-3.5">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                      <img
                                        src={photo}
                                        alt={selBiz?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                          SPONSORED
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                                          <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                                          <span>{formattedRating}</span>
                                          {rawReviewsCount > 0 && (
                                            <span className="text-[10px] text-slate-400 font-normal">({rawReviewsCount})</span>
                                          )}
                                        </div>
                                      </div>
                                      <h5 className="text-xs font-bold text-slate-900 truncate">
                                        {selBiz?.name || "Nama Bisnis Anda"}
                                      </h5>
                                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                        <MapPin size={10} />
                                        {cityName}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coupon Code Section */}
                          <div className="bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 border border-emerald-200/80 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Ticket size={15} className="text-emerald-600" />
                                Kode Kupon Diskon (Opsional)
                              </label>
                              {appliedCouponInfo && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 size={11} /> Aktif Terpasang
                                </span>
                              )}
                            </div>



                            {/* Applied Coupon Card */}
                            {appliedCouponInfo ? (
                              <div className="p-3 bg-white border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-extrabold text-xs text-emerald-800 tracking-wider">
                                        {appliedCouponInfo.code}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                        Hemat Rp {Number(appliedCouponInfo.discount_amount || appliedCouponInfo.discount || 0).toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {appliedCouponInfo.description || appliedCouponInfo.message || 'Kupon berhasil aktif dan memotong total biaya'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleRemoveUserCoupon}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                                >
                                  <X size={13} />
                                  Hapus
                                </button>
                              </div>
                            ) : (
                              /* Input & Apply Button */
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <input
                                    type="text"
                                    value={couponCodeInput}
                                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleValidateUserCoupon();
                                      }
                                    }}
                                    placeholder="Contoh: IKLAN20"
                                    className="w-full uppercase px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleValidateUserCoupon()}
                                  disabled={validatingCoupon || !couponCodeInput.trim()}
                                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all disabled:opacity-40 border-0 flex items-center gap-1.5 shadow-2xs"
                                >
                                  {validatingCoupon ? (
                                    <>
                                      <Loader2 size={13} className="animate-spin" />
                                      Memeriksa...
                                    </>
                                  ) : (
                                    <>
                                      <Check size={13} />
                                      Gunakan Kupon
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {couponMsg && (
                              <p className={`text-xs font-bold flex items-center gap-1.5 ${appliedCouponInfo ? "text-emerald-600" : "text-rose-600"}`}>
                                {appliedCouponInfo ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                {couponMsg}
                              </p>
                            )}
                          </div>

                          {/* Referral Code Section (Hanya tampil jika harga paket > Rp 10.000) */}
                          {getSelectedPackagePrice() > 10000 && (
                            <div className="bg-gradient-to-br from-teal-50/60 via-slate-50 to-emerald-50/40 border border-teal-200/80 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <Sparkles size={15} className="text-[#007570]" />
                                  Kode Referral Mitra (Diskon 10%)
                                </label>
                                {adAppliedReferralInfo && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#007570] border border-teal-300">
                                    <CheckCircle2 size={11} /> Aktif Terpasang
                                  </span>
                                )}
                              </div>

                              {adAppliedReferralInfo ? (
                                <div className="p-3 bg-white border-2 border-teal-500 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#007570] flex items-center justify-center shrink-0">
                                      <CheckCircle2 size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-extrabold text-xs text-[#007570] tracking-wider">
                                          {adAppliedReferralInfo.code}
                                        </span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                                          Hemat Rp {getAdReferralDiscount().toLocaleString("id-ID")}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 truncate">
                                        {adAppliedReferralInfo.referrer_name ? `Mitra: ${adAppliedReferralInfo.referrer_name}` : 'Diskon referral berhasil memotong biaya iklan'}
                                      </p>
                                    </div>
                                  </div>
                                  {adAppliedReferralInfo.is_bound || isGloballyBound ? (
                                    <span className="px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-[#007570] text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 size={13} />
                                      Terkunci Permanen
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleRemoveAdReferral}
                                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                                    >
                                      <X size={13} />
                                      Hapus
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={adReferralCodeInput}
                                      onChange={(e) => setAdReferralCodeInput(e.target.value.toUpperCase())}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleValidateAdReferral();
                                        }
                                      }}
                                      placeholder="Masukkan kode referral mitra..."
                                      className="w-full uppercase px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-[#007570] focus:ring-2 focus:ring-[#007570]/10"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleValidateAdReferral()}
                                    disabled={validatingAdReferral || !adReferralCodeInput.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs cursor-pointer transition-all disabled:opacity-40 border-0 flex items-center gap-1.5 shadow-2xs"
                                  >
                                    {validatingAdReferral ? (
                                      <>
                                        <Loader2 size={13} className="animate-spin" />
                                        Memeriksa...
                                      </>
                                    ) : (
                                      <>
                                        <Check size={13} />
                                        Gunakan
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              {adReferralMsg && (
                                <p className={`text-xs font-bold flex items-center gap-1.5 ${adAppliedReferralInfo ? "text-teal-700" : "text-rose-600"}`}>
                                  {adAppliedReferralInfo ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                                  {adReferralMsg}
                                </p>
                              )}
                            </div>
                          )}

                          {/* ── BAYAR INSTAN DENGAN POIN BANNER ── */}
                          {(() => {
                            const pkgObj = getSelectedPackageObj();
                            const basePrice = pkgObj?.price ? Number(pkgObj.price) : (typeof getSelectedPackagePrice === 'function' ? getSelectedPackagePrice() : 25000);
                            const finalPrice = getFinalPrice();
                            const basePoin = Math.max(1, Math.round(basePrice / 1000));
                            const adCoinCost = Math.max(0, Math.round(finalPrice / 1000));
                            const discountPoin = Math.max(0, basePoin - adCoinCost);
                            const isInsufficient = scoinBalance !== null && scoinBalance < adCoinCost;

                            return (
                              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-400 shadow-xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <SuradeCoinIcon size={24} />
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                      Bayar Instan dengan {adCoinCost} Poin
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {discountPoin > 0 && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                        Hemat {discountPoin.toLocaleString("id-ID")} Poin
                                      </span>
                                    )}
                                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                      {adCoinCost} Poin (Langsung Aktif)
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                                  Iklan langsung aktif &amp; terverifikasi detik ini juga <strong>tanpa upload bukti transfer</strong> dan <strong>tanpa verifikasi admin</strong>!
                                </p>
                                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-600">Saldo Poin:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-amber-800">
                                      {scoinBalance !== null ? `${scoinBalance.toLocaleString("id-ID")} Poin` : "0 Poin"}
                                    </span>
                                    {isInsufficient && (
                                      <button
                                        type="button"
                                        onClick={() => setShowBuyCoinModal(true)}
                                        className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 cursor-pointer"
                                      >
                                        + Beli Poin
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAdSubmitWithPoin}
                                  disabled={submittingAd || isInsufficient}
                                  className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${isInsufficient
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                                    : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 border border-amber-300"
                                    }`}
                                >
                                  {submittingAd ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" />
                                      <span>Memproses Pembayaran Poin...</span>
                                    </>
                                  ) : isInsufficient ? (
                                    <span>Saldo Poin Kurang (Butuh {adCoinCost} Poin)</span>
                                  ) : (
                                    <>
                                      <Zap size={14} className="fill-amber-950" />
                                      <span>Aktifkan Iklan Sekarang ({adCoinCost} Poin)</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })()}

                          <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                              atau bayar via Transfer / QRIS
                            </span>
                            <div className="flex-grow border-t border-slate-200"></div>
                          </div>

                          {/* Payment Method Selector - Terhubung dengan Kelola Pembayaran */}
                          <PaymentMethodSelector
                            methods={paymentMethods}
                            selectedMethod={selectedPaymentMethod}
                            onSelect={(method) => setSelectedPaymentMethod(method.name || method.id)}
                            title="Pilih Metode Pembayaran"
                            amount={getFinalPrice()}
                            finalPrice={getFinalPrice()}
                            showInstruction={true}
                          />

                          {/* Upload Bukti Transfer */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <span>Upload Bukti Pembayaran / Struk Transfer</span>
                                {getFinalPrice() > 0 ? (
                                  <span className="text-rose-600 font-extrabold">* (Wajib)</span>
                                ) : (
                                  <span className="text-slate-400 font-normal">(Gratis)</span>
                                )}
                              </span>
                              {adPaymentProofPreview && (
                                <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1">
                                  <CheckCircle2 size={12} /> {adPaymentProofFile ? "Foto baru dipilih" : "Bukti pembayaran tersimpan"}
                                </span>
                              )}
                            </label>

                            {getFinalPrice() > 0 && !adPaymentProofPreview && (
                              <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
                                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                  <p className="font-bold">Wajib Mengunggah Bukti Transfer</p>
                                  <p className="text-[11.5px] text-amber-800">
                                    Lakukan pembayaran sesuai total nominal ke rekening/e-wallet di atas, lalu unggah foto/screenshot bukti transfer di bawah sebelum mengirim pengajuan.
                                  </p>
                                </div>
                              </div>
                            )}

                            {adPaymentProofPreview ? (
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-white">
                                    <img src={adPaymentProofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-900 block truncate">
                                      {adPaymentProofFile ? adPaymentProofFile.name : "Foto Bukti Transfer Sebelumnya"}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                      {adPaymentProofFile
                                        ? `${(adPaymentProofFile.size / 1024).toFixed(1)} KB`
                                        : "Tersimpan di server (dapat digunakan kembali atau diganti)"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <label className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                                    Ganti Foto
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          setAdPaymentProofFile(file);
                                          setAdPaymentProofPreview(URL.createObjectURL(file));
                                          setRemoveExistingProof(false);
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdPaymentProofFile(null);
                                      setAdPaymentProofPreview(null);
                                      setRemoveExistingProof(true);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer transition-colors"
                                    title="Hapus foto bukti"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      setAdPaymentProofFile(file);
                                      setAdPaymentProofPreview(URL.createObjectURL(file));
                                      setRemoveExistingProof(false);
                                    }
                                  }}
                                  className={`w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#059669] hover:file:bg-teal-100 cursor-pointer p-1 rounded-xl border ${getFinalPrice() > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'
                                    }`}
                                />
                                {resubmittingAdId && removeExistingProof && (
                                  <span className="text-[11px] text-amber-600 font-medium block mt-1">
                                    * Foto bukti sebelumnya telah dihapus. Silakan unggah foto bukti transfer baru.
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Price Calculation Card */}
                          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-2">
                            <div className="flex justify-between text-slate-600">
                              <span>Harga Paket ({selPkg?.name || selectedPackage}):</span>
                              <span className="font-semibold text-slate-900">
                                Rp {getSelectedPackagePrice().toLocaleString("id-ID")}
                              </span>
                            </div>
                            {appliedCouponInfo && (
                              <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Diskon Kupon ({appliedCouponInfo.code}):</span>
                                <span>-Rp {Number(appliedCouponInfo.discount_amount).toLocaleString("id-ID")}</span>
                              </div>
                            )}
                            {adAppliedReferralInfo && (
                              <div className="flex justify-between text-[#007570] font-bold">
                                <span>Diskon Referral ({adAppliedReferralInfo.code}):</span>
                                <span>-Rp {getAdReferralDiscount().toLocaleString("id-ID")}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-sm font-black text-[#059669] border-t border-teal-200/80 pt-2 mt-1">
                              <span>Total Pembayaran:</span>
                              <span className="text-lg text-[#059669]">
                                Rp {getFinalPrice().toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* Navigation Buttons */}
                          <div className="flex justify-between pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setCreateAdStep(2)}
                              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                            >
                              Kembali
                            </button>
                            <button
                              type="button"
                              onClick={handleAdSubmit}
                              disabled={submittingAd}
                              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer border-0"
                            >
                              {submittingAd ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Memproses Pengajuan...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={16} />
                                  Ajukan Iklan Sekarang
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MODAL 3: AJUKAN ULANG IKLAN DITOLAK (DIRECT PAYMENT & MULTI-PROOF MODAL) */}
              {/* ========================================================================= */}
              {resubmittingAd && (() => {
                const ad = resubmittingAd;
                const biz = ad.business || businesses.find(b => b.id === ad.business_id) || {};
                const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                const photo = getBusinessPhoto(biz);

                return (
                  <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setResubmittingAd(null)}
                  >
                    <div
                      className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-5 my-8 text-left relative max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              Pengajuan Ulang
                            </span>
                            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                              Ajukan Ulang Iklan #{ad.id}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Perbaiki pembayaran atau unggah bukti transfer tambahan untuk diverifikasi kembali oleh admin.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setResubmittingAd(null)}
                          className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border-0"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Business & Package Summary Card */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                          <img src={photo} alt={biz.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{biz.name || "Nama Bisnis"}</h4>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${isPremium ? "bg-amber-100 text-amber-800" : "bg-teal-50 text-[#059669]"
                              }`}>
                              {isPremium ? "Premium Hero Ads" : "Standard Ticker Ads"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>Paket: <strong>{ad.package_name || "Iklan"}</strong></span>
                            <span>•</span>
                            <span>Durasi: <strong>{getAdDurationDisplay(ad)}</strong></span>
                            <span>•</span>
                            <span className="font-black text-[#059669]">Rp {Number(ad.price || 0).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Alasan Penolakan Admin */}
                      <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                        <AlertTriangle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold block">Alasan Penolakan Admin Sebelumnya:</span>
                          <p className="leading-relaxed">{ad.rejection_reason || ad.notes || "Bukti transfer belum valid atau nominal tidak sesuai."}</p>
                        </div>
                      </div>

                      {/* ── BAYAR INSTAN DENGAN POIN RE-ACTIVATION ── */}
                      {(() => {
                        const adCoinCost = Math.max(1, Math.round(Number(ad.price || 25000) / 1000));
                        return (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-400 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <SuradeCoinIcon size={22} />
                                <span className="text-xs font-black text-slate-900 uppercase">
                                  Aktifkan Instan dengan {adCoinCost} Poin
                                </span>
                              </div>
                              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                Tanpa Verifikasi Admin
                              </span>
                            </div>
                            <p className="text-[11.5px] text-slate-600">
                              Ingin iklan langsung tayang sekarang juga tanpa menunggu admin mengecek bukti transfer manual?
                            </p>
                            <button
                              type="button"
                              onClick={() => handlePayResubmitWithPoin(ad.id, adCoinCost)}
                              className="w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 border border-amber-300"
                            >
                              <Zap size={14} className="fill-amber-950" />
                              <span>Bayar &amp; Aktifkan Iklan Sekarang ({adCoinCost} Poin)</span>
                            </button>
                          </div>
                        );
                      })()}

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                          atau kirim ulang bukti transfer manual
                        </span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {/* Payment Account Instruction with PaymentMethodSelector */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          1. METODE PEMBAYARAN &amp; REKENING TUJUAN
                        </label>
                        <PaymentMethodSelector
                          methods={paymentMethods}
                          selectedMethod={resubmitPaymentMethod}
                          onSelect={(method) => setResubmitPaymentMethod(method.name || method.id)}
                          showInstruction={true}
                        />
                      </div>

                      {/* Multi-Proof Management */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            2. Bukti Pembayaran ({existingProofList.length + newProofFiles.length} Foto Terlampir)
                          </label>
                          <span className="text-[11px] text-[#059669] font-semibold">
                            Bisa lampirkan &gt; 1 bukti transfer
                          </span>
                        </div>

                        {/* Grid of Existing Proofs + New Proofs */}
                        {(existingProofList.length > 0 || newProofPreviews.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Existing Proofs */}
                            {existingProofList.map((proofPath, idx) => (
                              <div key={`existing-${idx}`} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer"
                                    onClick={() => window.open(getStorageUrl(proofPath), '_blank')}
                                    title="Buka foto"
                                  >
                                    <img src={getStorageUrl(proofPath)} alt="Struk Tersimpan" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-teal-100 text-[#059669] uppercase">
                                      Struk #{idx + 1}
                                    </span>
                                    <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">Tersimpan dari sebelumnya</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExistingProofList(existingProofList.filter((_, i) => i !== idx));
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
                                  title="Hapus foto ini"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}

                            {/* Newly Uploaded Proofs */}
                            {newProofPreviews.map((previewUrl, idx) => (
                              <div key={`new-${idx}`} className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-200 bg-white shrink-0 cursor-pointer"
                                    onClick={() => window.open(previewUrl, '_blank')}
                                    title="Buka foto"
                                  >
                                    <img src={previewUrl} alt="Struk Baru" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                      Struk Baru #{idx + 1}
                                    </span>
                                    <p className="text-[11px] font-semibold text-slate-800 truncate mt-0.5">
                                      {newProofFiles[idx]?.name || "File baru"}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProofFiles(newProofFiles.filter((_, i) => i !== idx));
                                    setNewProofPreviews(newProofPreviews.filter((_, i) => i !== idx));
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer shrink-0"
                                  title="Hapus foto ini"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add More Proof Upload Button */}
                        <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-teal-300 bg-teal-50/40 hover:bg-teal-50 text-[#059669] font-bold text-xs cursor-pointer transition-all">
                          <Plus size={16} />
                          <span>+ Upload Bukti Transfer Tambahan / Baru (Bisa Banyak Foto)</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                setNewProofFiles((prev) => [...prev, ...files]);
                                const previews = files.map((f) => URL.createObjectURL(f));
                                setNewProofPreviews((prev) => [...prev, ...previews]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Catatan Tambahan (Opsional) */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          3. Catatan Revisi ke Admin (Opsional)
                        </label>
                        <input
                          type="text"
                          value={resubmitNotes}
                          onChange={(e) => setResubmitNotes(e.target.value)}
                          placeholder="Contoh: Sudah saya transfer kekurangan Rp 20.000, struk 1 dan struk 2 terlampir."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#007570]"
                        />
                      </div>

                      {/* Modal Actions */}
                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setResubmittingAd(null)}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmResubmitAd}
                          disabled={submittingResubmit}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer border-0"
                        >
                          {submittingResubmit ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Mengirim Revisi...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Kirim Pengajuan Ulang Sekarang
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================================= */}
              {/* MODAL 2: DETAIL IKLAN & LIVE PREVIEW (viewingAdDetail) */}
              {/* ========================================================================= */}
              {viewingAdDetail && (() => {
                const ad = viewingAdDetail;
                const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                const biz = ad.business || {};
                const photo = getBusinessPhoto(biz);
                const categoryName = getBusinessCategoryName(biz);
                const cityName = getBusinessCityName(biz);

                return (
                  <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setViewingAdDetail(null)}
                  >
                    <div
                      className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-5 my-8 text-left relative max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${isPremium ? "bg-amber-100 text-amber-900" : "bg-teal-100 text-teal-900"}`}>
                              {isPremium ? "PREMIUM HERO ADS" : "STANDARD SCROLLER ADS"}
                            </span>
                            <h3 className="text-lg font-extrabold text-slate-900">
                              Detail & Live Simulation Iklan #{ad.id}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{biz.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingAdDetail(null)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer border-0"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Live Visual Simulation Preview */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Tampilan Iklan di Website
                        </label>
                        <div className="rounded-2xl border border-slate-300 overflow-hidden bg-slate-950 p-4 sm:p-5 shadow-inner">
                          {isPremium ? (
                            <div className="relative w-full h-[200px] sm:h-[240px] rounded-xl overflow-hidden border border-white/10 shadow-xl group">
                              <img src={photo} alt={biz.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-white shadow-md">
                                ⭐ SPONSORED
                              </span>
                              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                                <h4 className="text-xl font-black text-white tracking-tight drop-shadow-md">{biz.name}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-200">
                                  <span className="text-amber-400 font-bold">★ 4.8 (Ulasan Konsumen)</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-teal-400" />
                                    {biz.city || "Indonesia"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-3">
                              <div className="w-full max-w-[320px] bg-white rounded-2xl border border-slate-200 p-3.5 shadow-md flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                  <img src={photo} alt={biz.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                                      SPONSORED
                                    </span>
                                    <span className="text-[11px] font-bold text-amber-500">★ 4.8</span>
                                  </div>
                                  <h5 className="text-xs font-bold text-slate-900 truncate">{biz.name}</h5>
                                  <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                    <MapPin size={10} />
                                    {biz.city || "Indonesia"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detail Table / Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 block font-medium">Status Iklan:</span>
                          <span className="font-bold text-slate-900 uppercase">{ad.computed_status || ad.status}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Paket Iklan:</span>
                          <span className="font-bold text-slate-900">{ad.package_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Biaya Iklan:</span>
                          <span className="font-bold text-[#059669] text-sm">Rp {Number(ad.price || 0).toLocaleString("id-ID")}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Durasi Tayang:</span>
                          <span className="font-bold text-slate-900">{getAdDurationDisplay(ad)}</span>
                        </div>
                        {ad.start_date && (
                          <div>
                            <span className="text-slate-400 block font-medium">Tanggal Mulai:</span>
                            <span className="font-bold text-slate-900">{formatAdDateTime(ad.start_date)}</span>
                          </div>
                        )}
                        {ad.end_date && (
                          <div>
                            <span className="text-slate-400 block font-medium">Tanggal Selesai:</span>
                            <span className="font-bold text-slate-900">{formatAdDateTime(ad.end_date)}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Proof Viewer */}
                      {ad.payment_proof && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-700 block">Bukti Pembayaran Terunggah:</span>
                          <div
                            className="w-36 h-36 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group relative bg-slate-50"
                            onClick={() => window.open(getStorageUrl(ad.payment_proof), "_blank")}
                            title="Klik untuk membuka gambar ukuran penuh"
                          >
                            <img
                              src={getStorageUrl(ad.payment_proof)}
                              alt="Bukti Transfer"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-white text-xs font-bold">
                              Buka Gambar
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        {biz.id ? (
                          <a
                            href={`/business/${biz.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#059669] font-bold text-xs cursor-pointer border border-teal-200 transition-colors"
                          >
                            <Eye size={14} />
                            Buka Halaman Bisnis
                          </a>
                        ) : <div />}
                        <button
                          type="button"
                          onClick={() => setViewingAdDetail(null)}
                          className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ========================================================================= */}
              {/* MODAL 3: PEMBAYARAN & UPLOAD BUKTI (payModalAd) */}
              {/* ========================================================================= */}
              {payModalAd && (
                <div
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4"
                  onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}
                >
                  <div
                    className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 my-8 text-left relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                      <h3 className="text-base font-bold text-slate-900">Pembayaran Iklan</h3>
                      <button
                        type="button"
                        onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}
                        className="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-800"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1.5 border border-slate-200 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bisnis:</span>
                        <span className="font-bold text-slate-900">{payModalAd.business?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paket:</span>
                        <span className="font-bold text-slate-900">{payModalAd.package_name}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-sm text-[#059669] border-t border-slate-200 pt-2 mt-1">
                        <span>Total Tagihan:</span>
                        <span>Rp {Number(payModalAd.price || 0).toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <PaymentMethodSelector
                        methods={paymentMethods}
                        selectedMethod={selectedPaymentMethod}
                        onSelect={(method) => setSelectedPaymentMethod(method.name || method.id)}
                        title="Pilih Rekening / E-Wallet"
                        showInstruction={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Upload Bukti Transfer *</label>
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
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#059669] hover:file:bg-teal-100 cursor-pointer"
                      />
                      {adPaymentProofPreview && (
                        <div className="relative mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-300">
                          <img src={adPaymentProofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => { setPayModalAd(null); setAdPaymentProofFile(null); setAdPaymentProofPreview(null); }}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border-0 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAdPaymentSubmit}
                        disabled={submittingPayment}
                        className="px-5 py-2 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs border-0 cursor-pointer disabled:opacity-50"
                      >
                        {submittingPayment ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 10. PRODUK VIEW */}
          {activeTab === "produk" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                    <Briefcase size={16} className="text-[#059669]" />
                    Pilih Bisnis:
                  </label>
                  <div className="w-full sm:flex-1 space-y-2">
                    <select
                      value={selectedBusinessForProducts || ""}
                      onChange={(e) => setSelectedBusinessForProducts(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs cursor-pointer"
                    >
                      <option value="">-- Pilih Bisnis --</option>
                      {businesses.map((biz) => {
                        const isPrem = Boolean(
                          biz.is_premium ||
                          biz.is_premium_active ||
                          biz.raw?.is_premium ||
                          biz.raw?.is_premium_active ||
                          biz.raw?.features?.is_premium ||
                          biz.features?.is_premium ||
                          biz.package_type === "premium"
                        );
                        const prodCount = biz.products?.length ?? biz.products_count ?? biz.raw?.products?.length ?? 0;
                        return (
                          <option key={biz.id} value={biz.id}>
                            {isPrem
                              ? `⭐ [PREMIUM] ${biz.name} (Bebas Tambah Produk)`
                              : prodCount >= 3
                                ? `📦 [FREE - PENUH (3/3)] ${biz.name}`
                                : `📦 [FREE (${prodCount}/3)] ${biz.name}`}
                          </option>
                        );
                      })}
                    </select>

                    {/* Status Badge Info Bisnis Terpilih */}
                    {selectedBusinessForProducts && (() => {
                      const activeBiz = businesses.find(b => String(b.id) === String(selectedBusinessForProducts));
                      const isPrem = Boolean(
                        activeBiz?.is_premium ||
                        activeBiz?.is_premium_active ||
                        activeBiz?.raw?.is_premium ||
                        activeBiz?.raw?.is_premium_active ||
                        activeBiz?.raw?.features?.is_premium ||
                        activeBiz?.features?.is_premium ||
                        activeBiz?.package_type === "premium"
                      );
                      const prodCount = products ? products.length : (activeBiz?.products?.length || 0);
                      const isFull = !isPrem && prodCount >= 3;

                      if (isPrem) {
                        return (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-xl text-amber-900 text-xs">
                            <span className="text-base">⭐</span>
                            <div>
                              <span className="font-extrabold text-amber-800 uppercase tracking-wide text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md mr-1.5">
                                Bisnis Premium
                              </span>
                              <span className="text-[11.5px] font-semibold text-amber-900">
                                Bebas menambahkan produk tanpa batasan kuota.
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📦</span>
                            <div>
                              <span className="font-extrabold text-slate-700 uppercase tracking-wide text-[10px] bg-slate-200 px-2 py-0.5 rounded-md mr-1.5">
                                Paket Free / Reguler
                              </span>
                              <span className="text-[11.5px] font-bold text-slate-800">
                                Kuota Produk: {prodCount}/3 Produk
                                {isFull ? (
                                  <span className="text-rose-600 font-extrabold ml-1.5">
                                    (Batas Tercapai - Tidak Dapat Menambah Lagi)
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold ml-1.5">
                                    (Sisa {3 - prodCount} slot produk)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          {isFull && (
                            <button
                              type="button"
                              onClick={() => navigate(`/add-business/${selectedBusinessForProducts}?upgrade=true`)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-[11px] shadow-sm transition-all cursor-pointer"
                            >
                              Upgrade ke Premium ↗
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {selectedBusinessForProducts ? (
                  <>
                    {(() => {
                      const activeProdBiz = businesses.find(b => String(b.id) === String(selectedBusinessForProducts));
                      const isActiveProdBizPrem = Boolean(
                        activeProdBiz?.is_premium ||
                        activeProdBiz?.is_premium_active ||
                        activeProdBiz?.raw?.is_premium ||
                        activeProdBiz?.raw?.is_premium_active ||
                        activeProdBiz?.raw?.features?.is_premium ||
                        activeProdBiz?.features?.is_premium ||
                        activeProdBiz?.package_type === "premium"
                      );
                      const currentCount = products ? products.length : (activeProdBiz?.products?.length || 0);
                      const isProdLimit3Reached = !isActiveProdBizPrem && currentCount >= 3;

                      return (
                        <>
                          {isProdLimit3Reached && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <div>
                                  <p className="font-bold">Batas Maksimal 3 Produk Tercapai (Paket Free: 3/3 Produk)</p>
                                  <p className="text-amber-700 text-[11.5px] mt-0.5">
                                    Bisnis <strong>{activeProdBiz?.name}</strong> menggunakan paket Free dan sudah mengisi kuota maksimal 3 produk. Tombol tambah produk dinonaktifkan kecuali bisnis diupgrade ke paket Premium.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate(`/add-business/${selectedBusinessForProducts}?upgrade=true`)}
                                className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#005f5b] text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
                              >
                                Upgrade ke Premium
                              </button>
                            </div>
                          )}

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
                              type="button"
                              className={`w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 px-5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 ${isProdLimit3Reached
                                ? "bg-slate-200 text-slate-400 border border-slate-300 hover:bg-slate-300 hover:text-slate-600 cursor-not-allowed"
                                : "bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4a] text-white cursor-pointer"
                                }`}
                              onClick={() => {
                                if (isProdLimit3Reached) {
                                  alert("Bisnis Free telah mencapai batas maksimal 3 produk. Silakan upgrade ke paket Premium untuk menambahkan produk tanpa batas.");
                                } else {
                                  navigate(`/add-product/${selectedBusinessForProducts}`);
                                }
                              }}
                              disabled={!selectedBusinessForProducts}
                              title={isProdLimit3Reached ? "Batas 3 produk tercapai untuk bisnis Free" : "Tambah Produk Baru"}
                            >
                              <Plus size={18} strokeWidth={2.5} />
                              <span>{isProdLimit3Reached ? "Batas 3 Produk Penuh" : "Tambah Produk"}</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}

                    {/* Loading State */}
                    {loadingProducts ? (
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs my-4">
                        <SuradeLoader
                          variant="section"
                          size="md"
                          text="Memuat data produk"
                          minHeight="180px"
                        />
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
                                  <div className="h-44 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
                                    {/* Blurred Backdrop */}
                                    {product.image && (
                                      <img
                                        src={getStorageUrl(product.image)}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 pointer-events-none scale-110"
                                        aria-hidden="true"
                                      />
                                    )}
                                    {/* Main Product Image (no distortion) */}
                                    <img
                                      src={product.image ? getStorageUrl(product.image) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='176'%3E%3Crect width='200' height='176' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2364748b'%3EProduk%3C/text%3E%3C/svg%3E"}
                                      alt={product.name}
                                      className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                      style={{ maxHeight: '176px' }}
                                      onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='176'%3E%3Crect width='200' height='176' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2364748b'%3EProduk%3C/text%3E%3C/svg%3E"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

                                    {/* Status Badge */}
                                    <div className="absolute top-2.5 left-2.5 z-30">
                                      {product.status === "pending" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                                          <Clock size={11} /> Menunggu Verifikasi
                                        </span>
                                      )}
                                      {product.status === "needs_revision" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                                          <AlertTriangle size={11} /> Perlu Revisi
                                        </span>
                                      )}
                                      {(product.status === "approved" || !product.status) && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                          <CheckCircle size={11} /> Tayang
                                        </span>
                                      )}
                                      {product.status === "rejected" && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                                          <AlertTriangle size={11} /> Ditolak
                                        </span>
                                      )}
                                    </div>
                                    {/* Product ID Code Badge */}
                                    <div className="absolute top-2.5 right-2.5 z-30">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/70 text-slate-200 backdrop-blur-sm border border-slate-700/50">
                                        #{product.id}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-4 flex flex-col flex-1 gap-2.5">
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#059669] transition-colors" title={product.name}>
                                        {product.name}
                                      </h4>
                                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                                        {product.description || "-"}
                                      </p>
                                    </div>

                                    {/* Rejection notice box if rejected */}
                                    {product.status === "rejected" && (
                                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 space-y-1">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800">
                                          <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                                          <span>Produk Ditolak Permanen</span>
                                        </div>
                                        <p className="text-[11px] text-rose-700 leading-tight">
                                          Alasan: <em>{product.rejection_reason || "Produk tidak memenuhi kriteria publikasi."}</em>
                                        </p>
                                      </div>
                                    )}

                                    {/* Revision notice box if needs_revision */}
                                    {product.status === "needs_revision" && (
                                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1.5">
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                                          <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                                          <span>Perlu Perbaikan Produk</span>
                                        </div>
                                        <p className="text-[11px] text-amber-800 leading-tight">
                                          Alasan: <em>{product.rejection_reason || "Perlu perbaikan informasi / foto produk."}</em>
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => handleEditProduct(product)}
                                          className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                                        >
                                          <Edit size={12} />
                                          <span>Perbaiki &amp; Kirim Ulang</span>
                                        </button>
                                      </div>
                                    )}

                                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                      <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Harga</span>
                                        <p className="text-sm font-black text-[#059669]">
                                          {product.price != null
                                            ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                                            : "-"}
                                        </p>
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1.5">
                                        {product.status !== "rejected" && (
                                          <button
                                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                            title="Edit Produk"
                                            onClick={() => handleEditProduct(product)}
                                          >
                                            <Edit size={15} />
                                          </button>
                                        )}
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
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#059669] flex items-center justify-center">
                          <Package size={32} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Belum Ada Produk</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Bisnis ini belum memiliki produk terdaftar di katalog.
                          </p>
                        </div>
                        <button
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-[#005f5b] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
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
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs my-4">
                  <SuradeLoader
                    variant="section"
                    size="md"
                    text="Memuat data profil"
                    minHeight="180px"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                  <div className="mb-6 pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">Edit Profil & Informasi Diri</h3>
                    <p className="text-xs sm:text-sm text-slate-500">Perbarui foto profil, data informasi akun, dan kontak Anda secara berkala</p>
                  </div>

                  {/* Integrated Photo Upload Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-8">
                    <div className="flex items-center gap-5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <SafeImage
                          src={photoPreview || DEFAULT_AVATAR}
                          alt="Avatar"
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-white shadow-md bg-white ring-2 ring-slate-200"
                          fallback={DEFAULT_AVATAR}
                          onError={(e) => {
                            console.warn("Avatar image failed to load:", e.currentTarget.src);
                          }}
                          onLoad={() => {
                            // console.log("Avatar image loaded successfully:", photoPreview);
                          }}
                        />
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#059669] hover:bg-[#005f5b] text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-md transition-all hover:scale-105"
                          onClick={() => setShowPhotoModal(true)}
                          title="Ganti Foto Profil"
                        >
                          <Camera size={13} />
                        </button>
                      </div>

                      {/* User Details */}
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-none truncate">
                            {profileData.name || "Nama Pengguna"}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-[#059669] border border-teal-200">
                            {profileData.role || "user"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
                            @{user?.username || "user"}
                          </span>
                        </div>

                        <p className="text-[11px] sm:text-xs text-slate-400 font-normal leading-tight">
                          Format JPG, PNG, atau WEBP. Maksimal 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                      <button
                        type="button"
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                        onClick={() => setShowPhotoModal(true)}
                      >
                        <Camera size={14} />
                        <span>Ganti Foto</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all cursor-pointer shadow-xs"
                        onClick={fetchUserProfile}
                        title="Refresh Profile Data"
                      >
                        <RefreshCw size={14} />
                        <span>Refresh</span>
                      </button>
                      {photoPreview && photoPreview !== DEFAULT_AVATAR && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 font-bold text-xs transition-all cursor-pointer shadow-xs"
                          onClick={handleRemovePhoto}
                          title="Hapus Foto"
                        >
                          <Trash2 size={14} />
                          <span>Hapus</span>
                        </button>
                      )}
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
                        <div className="flex items-center justify-between">
                          <label htmlFor="profile-location" className="text-[13px] font-semibold text-[#334155]">
                            Lokasi / Wilayah
                          </label>
                          <span className="text-[11px] text-slate-400">Pilih dari daftar atau ketik bebas</span>
                        </div>
                        <input
                          type="text"
                          id="profile-location"
                          list="surade-villages-list"
                          value={profileData.location}
                          onChange={(e) => {
                            setProfileData({ ...profileData, location: e.target.value });
                            if (profileValidationErrors.location) {
                              setProfileValidationErrors({ ...profileValidationErrors, location: null });
                            }
                          }}
                          placeholder="Contoh: Kelurahan Surade, Kec. Surade"
                          className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] ${profileValidationErrors.location ? "border-[#ef4444]" : ""}`}
                        />
                        <datalist id="surade-villages-list">
                          <option value="Kelurahan Surade, Kec. Surade" />
                          <option value="Desa Jagamukti, Kec. Surade" />
                          <option value="Desa Citanglar, Kec. Surade" />
                          <option value="Desa Wanasari, Kec. Surade" />
                          <option value="Desa Sirnasari, Kec. Surade" />
                          <option value="Desa Kadaleman, Kec. Surade" />
                          <option value="Desa Gunungsungging, Kec. Surade" />
                          <option value="Desa Cipeundeuy, Kec. Surade" />
                          <option value="Desa Pasiripis, Kec. Surade" />
                          <option value="Desa Buniwangi, Kec. Surade" />
                          <option value="Desa Sukatani, Kec. Surade" />
                          <option value="Desa Kademangan, Kec. Surade" />
                          <option value="Kabupaten Sukabumi, Jawa Barat" />
                        </datalist>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[11px] font-medium text-slate-400">Pilihan Cepat:</span>
                          {[
                            "Kelurahan Surade",
                            "Desa Jagamukti",
                            "Desa Buniwangi",
                            "Desa Citanglar",
                            "Desa Sukatani",
                          ].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                setProfileData({ ...profileData, location: `${v}, Kec. Surade` });
                                if (profileValidationErrors.location) {
                                  setProfileValidationErrors({ ...profileValidationErrors, location: null });
                                }
                              }}
                              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[11px] text-slate-600 border border-slate-200 cursor-pointer transition-colors"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        {profileValidationErrors.location && (
                          <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.location[0]}</span>
                        )}
                      </div>

                      {/* Jenis Kelamin */}
                      <div className="flex flex-col gap-[6px]">
                        <label htmlFor="profile-gender" className="text-[13px] font-semibold text-[#334155]">Jenis Kelamin</label>
                        <select
                          id="profile-gender"
                          value={profileData.gender || ""}
                          onChange={(e) => {
                            setProfileData({ ...profileData, gender: e.target.value });
                            if (profileValidationErrors.gender) {
                              setProfileValidationErrors({ ...profileValidationErrors, gender: null });
                            }
                          }}
                          className={`w-full px-[14px] py-[11px] border border-[#cbd5e1] rounded-[10px] text-[13.5px] text-[#0f172a] bg-white outline-none transition-all duration-200 focus:border-[#007570] focus:shadow-[0_0_0_3px_rgba(0,117,112,0.12)] cursor-pointer ${profileValidationErrors.gender ? "border-[#ef4444]" : ""}`}
                        >
                          <option value="">-- Pilih Jenis Kelamin --</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                        {profileValidationErrors.gender && (
                          <span className="text-[12px] text-[#ef4444] font-medium mt-[2px]">{profileValidationErrors.gender[0]}</span>
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
                        className="inline-flex items-center justify-center gap-[8px] px-[28px] py-[12px] bg-[#059669] text-white border-none rounded-[10px] text-[14px] font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_14px_rgba(0,117,112,0.25)] hover:enabled:bg-[#005a58] hover:enabled:shadow-[0_6px_18px_rgba(0,117,112,0.35)] hover:enabled:-translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed"
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
                <Edit size={18} className="text-[#059669]" />
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

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Foto Produk</span>
                  <span className="text-[11px] text-slate-400 font-normal">Maks 5MB</span>
                </label>

                <input
                  id="edit-product-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleEditImageSelect}
                />

                {editImagePreview ? (
                  <div className="space-y-2.5">
                    <div
                      onClick={() => document.getElementById("edit-product-image-input")?.click()}
                      className="relative w-full min-h-[160px] max-h-[260px] rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 overflow-hidden group bg-slate-950 flex items-center justify-center cursor-pointer transition-all shadow-inner"
                      title="Klik untuk mengganti foto produk"
                    >
                      <img
                        src={editImagePreview}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 pointer-events-none"
                      />
                      <img
                        src={editImagePreview}
                        alt="Preview Produk"
                        className="relative z-10 max-w-full max-h-[220px] w-auto h-auto object-contain p-2"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                          <Camera size={14} className="text-emerald-600" />
                          Klik untuk Ganti Foto
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Edit Foto - Selalu Terlihat Jelas */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="edit-product-image-input"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Camera size={15} className="text-emerald-600" />
                        <span>Ganti / Upload Foto Baru</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveEditImage}
                        className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                        title="Hapus foto saat ini"
                      >
                        <Trash2 size={15} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="edit-product-image-input"
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 transition-all cursor-pointer group shadow-inner"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-2 border border-slate-200">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      Pilih / Upload Foto Produk
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau WEBP (Maksimal 5MB)</span>
                  </label>
                )}
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* ── MODAL EDIT BISNIS ── */}
      {editingBusiness && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseBusinessEditModal}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={18} className="text-[#059669]" />
                Edit Bisnis
              </h3>
              <button
                onClick={handleCloseBusinessEditModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBusiness} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Bisnis <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={businessEditForm.name}
                  onChange={handleBusinessEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Nama bisnis"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={businessEditForm.description}
                  onChange={handleBusinessEditFormChange}
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs resize-y"
                  placeholder="Deskripsi singkat tentang bisnis Anda"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={businessEditForm.phone}
                    onChange={handleBusinessEditFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                    placeholder="08123456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Kota
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={businessEditForm.city}
                    onChange={handleBusinessEditFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                    placeholder="Surade / Sukabumi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="province"
                  value={businessEditForm.province}
                  onChange={handleBusinessEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Jawa Barat"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  name="address"
                  value={businessEditForm.address}
                  onChange={handleBusinessEditFormChange}
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs resize-y"
                  placeholder="Jl. Sudirman No. 123"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseBusinessEditModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingBusiness || !businessEditForm.name}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingBusiness ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT BLOG/EVENT ── */}
      {editingBlog && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseBlogEditModal}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={18} className="text-[#059669]" />
                Edit {editingBlog.type === 'event' ? 'Event' : 'Blog'}
              </h3>
              <button
                onClick={handleCloseBlogEditModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Judul <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={blogEditForm.title}
                  onChange={handleBlogEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Judul blog/event"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  name="blog_category"
                  value={blogEditForm.blog_category}
                  onChange={handleBlogEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                  placeholder="Bisnis, Teknologi, dll."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Konten <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={blogEditForm.content}
                  onChange={handleBlogEditFormChange}
                  rows={6}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs resize-y"
                  placeholder="Tulis konten di sini..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseBlogEditModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingBlog || !blogEditForm.title || !blogEditForm.content}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingBlog ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT PLAN ── */}
      {editingPlan && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleClosePlanEditModal}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit size={18} className="text-teal-600" />
                Edit Paket: {editingPlan.name}
              </h3>
              <button
                onClick={handleClosePlanEditModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Paket <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={planEditForm.name}
                  onChange={handlePlanEditFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                  placeholder="Free, Premium 1, Premium 2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={planEditForm.price}
                    onChange={handlePlanEditFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Durasi (Hari) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    value={planEditForm.duration_days}
                    onChange={handlePlanEditFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                    placeholder="30"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">30 = 1 bulan, 365 = 1 tahun</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClosePlanEditModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPlan || !planEditForm.name || !planEditForm.price}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPlan ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CREATE PLAN ── */}
      {showCreatePlanModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseCreatePlanModal}
        >
          <div
            className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-teal-600" />
                Tambah Paket Premium Baru
              </h3>
              <button
                onClick={handleCloseCreatePlanModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Paket <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={createPlanForm.name}
                  onChange={handleCreatePlanFormChange}
                  className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                  placeholder="Premium 3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Harga (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={createPlanForm.price}
                    onChange={handleCreatePlanFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                    placeholder="150000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Durasi (Hari) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    value={createPlanForm.duration_days}
                    onChange={handleCreatePlanFormChange}
                    className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-2xs"
                    placeholder="30"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">30 = 1 bulan, 90 = 3 bulan</p>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-xs text-teal-800 font-medium">
                  💡 <strong>Tip:</strong> Setelah membuat paket, Anda bisa mengatur fitur-fitur yang tersedia melalui tombol Edit.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseCreatePlanModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingPlan || !createPlanForm.name || !createPlanForm.price}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingPlan ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Membuat...</span>
                    </>
                  ) : (
                    <span>Buat Paket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL KUNJUNGAN BISNIS ── */}
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
                  <BarChart size={20} className="text-[#059669]" />
                  Detail Statistik Kunjungan Bisnis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian data pengunjung usaha UMKM milik Anda, grafik interaktif, dan estimasi per periode
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
                        className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${analyticsPeriod === tab.key
                          ? "bg-[#059669] text-white shadow-2xs font-bold"
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date(analyticsDate);
                              d.setDate(d.getDate() - 1);
                              setAnalyticsDate(d.toISOString().split("T")[0]);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                            title="Hari Sebelumnya"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <div className="flex items-center gap-1.5 px-1">
                            <Calendar size={14} className="text-[#059669] shrink-0" />
                            <input
                              type="date"
                              value={analyticsDate}
                              onChange={(e) => setAnalyticsDate(e.target.value)}
                              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date(analyticsDate);
                              d.setDate(d.getDate() + 1);
                              setAnalyticsDate(d.toISOString().split("T")[0]);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                            title="Hari Berikutnya"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnalyticsDate(new Date().toISOString().split("T")[0])}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${analyticsDate === new Date().toISOString().split("T")[0]
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          Hari Ini
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            setAnalyticsDate(d.toISOString().split("T")[0]);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${(() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            return analyticsDate === d.toISOString().split("T")[0];
                          })()
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          Kemarin
                        </button>
                      </div>
                    )}

                    {analyticsPeriod === "weekly" && (
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(analyticsDate);
                            d.setDate(d.getDate() - 7);
                            setAnalyticsDate(d.toISOString().split("T")[0]);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 font-bold cursor-pointer"
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
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 font-bold cursor-pointer"
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
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
                        >
                          {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, idx) => (
                            <option key={idx + 1} value={idx + 1}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={analyticsYear}
                          onChange={(e) => setAnalyticsYear(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
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
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer shadow-2xs"
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
                <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-[#059669]" />
                  <span className="text-xs font-semibold text-slate-600">Memuat data statistik kunjungan bisnis...</span>
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
                      <span className="text-2xl font-black text-[#059669] block mt-1">
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
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <p className="text-xs">Belum ada catatan kunjungan pada periode {analyticsStatsData?.period_label || ""}.</p>
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            setAnalyticsDate(d.toISOString().split("T")[0]);
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                        >
                          Lihat data tanggal kemarin
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1.5 sm:gap-2.5 h-48 pt-6 pb-1 overflow-x-auto">
                        {analyticsStatsData.chart_data.map((d, i) => (
                          <div key={i} className="flex-1 min-w-[22px] sm:min-w-[28px] flex flex-col items-center gap-2 h-full justify-end group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-slate-800 text-white border border-slate-700 text-[10px] font-bold px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                              <div className="text-emerald-400">{d.fullLabel}</div>
                              <div>{d.visits.toLocaleString("id-ID")} kunjungan ({d.percentage})</div>
                              {d.itemCount > 0 && (
                                <div className="text-amber-300 text-[9px] mt-0.5">+{d.itemCount} konten ditambahkan</div>
                              )}
                            </div>
                            {/* Bar */}
                            <div
                              className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 group-hover:brightness-125 ${d.visits > 0
                                ? "bg-gradient-to-t from-[#059669] to-[#34d399] shadow-sm shadow-emerald-500/20"
                                : "bg-slate-800/80 min-h-[2px]"
                                }`}
                              style={{ height: d.visits > 0 ? d.heightPercentage : "2px" }}
                            ></div>
                            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate max-w-full group-hover:text-white">
                              {d.unit}
                            </span>
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
                                <td className="py-3 px-4 font-semibold text-[#059669]">{d.visits.toLocaleString("id-ID")} kunjungan</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 sm:w-28 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                                      <div className="bg-[#059669] h-full rounded-full transition-all" style={{ width: d.heightPercentage }}></div>
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
                  <Clock size={20} className="text-[#059669]" />
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
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${isActive
                        ? "bg-[#059669] text-white shadow-2xs"
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
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#059669] hover:bg-[#059669] hover:text-white font-bold text-xs transition-colors cursor-pointer"
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
                <Camera size={18} className="text-[#059669]" />
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
                <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-[#059669] flex items-center justify-center shrink-0">
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
                <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-[#059669] flex items-center justify-center shrink-0">
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
                <Camera size={18} className="text-[#059669]" />
                {cameraTarget === "chat" ? "Kamera Inbox Live" : "Kamera Profil Live"}
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-md cursor-pointer active:scale-95"
              >
                <Camera size={16} />
                <span>Jepret Foto Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL PENARIKAN SALDO REFERRAL (DESAIN MEWAH 2-KOLOM SEPERTI GAMBAR 5) ── */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in font-['Poppins',sans-serif] text-left"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            className="bg-[#fcfdfd] w-full max-w-3xl sm:max-w-4xl rounded-3xl shadow-2xl border border-emerald-200/80 overflow-hidden flex flex-col max-h-[92vh] relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Header Gradient Banner (Sesuai Gambar 5) */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white relative shrink-0">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                title="Tutup"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-9">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                    <Wallet size={24} className="text-emerald-200" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-emerald-100 mb-0.5 border border-white/20">
                      <Sparkles size={11} className="text-emerald-300" />
                      <span>Pencairan Resmi Surade</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                      Penarikan Saldo Komisi Referral
                    </h3>
                  </div>
                </div>

                {/* Saldo Komisi Badge */}
                <div className="px-3.5 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 flex items-center gap-2 self-start sm:self-auto shadow-inner text-xs">
                  <span className="text-[11px] text-emerald-100 font-medium">Saldo Komisi:</span>
                  <span className="font-black text-emerald-300 text-xs sm:text-sm">
                    Rp {availableReferralBalance.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {withdrawSuccessMsg ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="font-extrabold text-slate-900 text-base">Pengajuan Penarikan Berhasil Dikirim!</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">{withdrawSuccessMsg}</p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setWithdrawSuccessMsg("");
                        setShowWithdrawModal(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Tutup Window
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setWithdrawErrorMsg("");
                    const numAmount = Number(withdrawForm.amount || 0);

                    if (numAmount < 50000) {
                      setWithdrawErrorMsg("Minimal penarikan saldo komisi adalah Rp 50.000.");
                      return;
                    }
                    if (numAmount > availableReferralBalance) {
                      setWithdrawErrorMsg(`Saldo komisi tidak mencukupi. Saldo saat ini: Rp ${availableReferralBalance.toLocaleString("id-ID")}`);
                      return;
                    }
                    if (withdrawForm.bank === "QRIS" && !withdrawQrisFile) {
                      setWithdrawErrorMsg("Silakan unggah foto/gambar barcode QRIS Anda untuk dipindai oleh admin.");
                      return;
                    }
                    if (withdrawForm.bank !== "QRIS" && !withdrawForm.accountNumber.trim()) {
                      setWithdrawErrorMsg("Nomor rekening atau nomor HP e-wallet wajib diisi.");
                      return;
                    }
                    if (!withdrawForm.accountHolder.trim()) {
                      setWithdrawErrorMsg("Nama pemilik rekening / merchant QRIS wajib diisi.");
                      return;
                    }

                    setSubmittingWithdraw(true);
                    try {
                      const formData = new FormData();
                      formData.append("bank", withdrawForm.bank);
                      formData.append("account_number", withdrawForm.bank === "QRIS" ? "QRIS" : withdrawForm.accountNumber.trim());
                      formData.append("account_holder", withdrawForm.accountHolder.trim());
                      formData.append("amount", withdrawForm.amount);
                      if (withdrawForm.notes) formData.append("notes", withdrawForm.notes.trim());
                      if (withdrawForm.bank === "QRIS" && withdrawQrisFile) {
                        formData.append("qris_image", withdrawQrisFile);
                      }

                      const res = await api.post("/referrals/withdraw", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });

                      if (res.data?.success) {
                        setWithdrawSuccessMsg(
                          res.data.message ||
                          `Permohonan penarikan Rp ${numAmount.toLocaleString("id-ID")} via ${withdrawForm.bank} (${withdrawForm.accountHolder}) telah diterima dan sedang diverifikasi admin.`
                        );
                        setWithdrawQrisFile(null);
                        setWithdrawQrisPreview(null);
                        fetchReferralStats();
                      }
                    } catch (err) {
                      setWithdrawErrorMsg(err.response?.data?.message || "Gagal mengajukan penarikan saldo. Pastikan data benar.");
                    } finally {
                      setSubmittingWithdraw(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* ── KOLOM KIRI (5 Kolom): Ringkasan & Kalkulator Nominal (Sesuai Gambar 5) ── */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Kartu Estimasi Nilai Penarikan */}
                      <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-white border border-emerald-200/90 shadow-xs space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Nilai Penarikan Komisi
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                            Rp {Number(withdrawForm.amount || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between">
                          <span>Minimal Penarikan:</span>
                          <strong className="text-emerald-900">Rp 50.000</strong>
                        </div>
                      </div>

                      {/* Input Nominal Komisi yang ditarik */}
                      <div>
                        <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                          Jumlah Saldo yang Ditarik (Rp)
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-700 font-bold text-sm">
                            Rp
                          </div>
                          <input
                            type="number"
                            min="50000"
                            max={availableReferralBalance || 50000}
                            value={withdrawForm.amount}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                            className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 font-black text-slate-900 text-base focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-xs"
                            placeholder="Min 50.000"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setWithdrawForm({ ...withdrawForm, amount: String(availableReferralBalance) })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[11px] font-black bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-lg cursor-pointer transition-colors"
                          >
                            Maksimal
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500 font-medium">
                          <span>Sisa saldo setelah ditarik:</span>
                          <strong className="text-slate-800">
                            Rp {Math.max(0, availableReferralBalance - Number(withdrawForm.amount || 0)).toLocaleString("id-ID")}
                          </strong>
                        </div>
                      </div>

                      {/* Box Ketentuan & Keamanan */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs text-slate-600 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11.5px]">
                          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                          <span>Jaminan Penarikan Aman</span>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-500 pl-1">
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Saldo komisi referral akan otomatis diverifikasi admin.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Admin Surade memverifikasi dan mentransfer dana dalam <strong>1x24 jam kerja</strong>.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>Jika ditolak, saldo komisi akan <strong>dikembalikan 100% tanpa potongan</strong>.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* ── KOLOM KANAN (7 Kolom): Formulir Tujuan Transfer / QRIS (Sesuai Gambar 5) ── */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div className="flex items-center gap-2 pb-1">
                        <Building2 size={16} className="text-emerald-700 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Tujuan Transfer Bank / E-Wallet / QRIS
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Pastikan data tujuan pencairan benar dan aktif
                          </p>
                        </div>
                      </div>

                      {withdrawErrorMsg && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>{withdrawErrorMsg}</span>
                        </div>
                      )}

                      {/* Pilihan Metode Transfer */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Pilih Bank / E-Wallet / QRIS *
                        </label>
                        <select
                          value={withdrawForm.bank}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, bank: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        >
                          <optgroup label="Metode Instan QRIS">
                            <option value="QRIS">QRIS (Scan Barcode &amp; Upload Gambar)</option>
                          </optgroup>
                          <optgroup label="Bank Transfer">
                            <option value="BCA">Bank BCA</option>
                            <option value="Mandiri">Bank Mandiri</option>
                            <option value="BRI">Bank BRI</option>
                            <option value="BNI">Bank BNI</option>
                            <option value="BJB">Bank BJB</option>
                            <option value="BSI">Bank BSI</option>
                          </optgroup>
                          <optgroup label="E-Wallet">
                            <option value="DANA">DANA</option>
                            <option value="GoPay">GoPay</option>
                            <option value="OVO">OVO</option>
                            <option value="ShopeePay">ShopeePay</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* FORM KHUSUS QRIS: Upload Barcode Gambar */}
                      {withdrawForm.bank === "QRIS" ? (
                        <div className="space-y-3 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200">
                          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                            <QrCode size={16} className="text-purple-700" />
                            <span>Upload QRIS Anda (Tarik Saldo Instan)</span>
                          </div>
                          <p className="text-[11px] text-purple-800 leading-relaxed">
                            Unggah foto/tangkapan layar QRIS merchant atau pribadi Anda. Admin Surade akan langsung memindai QRIS ini untuk mengirim dana komisi.
                          </p>

                          {/* Upload Dropzone */}
                          <div>
                            {withdrawQrisPreview ? (
                              <div className="relative group p-2 bg-white rounded-xl border border-purple-200 text-center">
                                <img
                                  src={withdrawQrisPreview}
                                  alt="Preview QRIS"
                                  className="max-h-40 mx-auto object-contain rounded-lg border border-slate-100 shadow-xs"
                                />
                                <div className="mt-2 flex items-center justify-center gap-2">
                                  <label className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer underline">
                                    Ganti Gambar QRIS
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setWithdrawQrisFile(file);
                                          setWithdrawQrisPreview(URL.createObjectURL(file));
                                        }
                                      }}
                                    />
                                  </label>
                                  <span className="text-slate-300">•</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWithdrawQrisFile(null);
                                      setWithdrawQrisPreview(null);
                                    }}
                                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer underline"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl p-4 bg-white cursor-pointer transition-colors text-center group">
                                <QrCode size={28} className="text-purple-500 mb-1.5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-purple-900">
                                  Klik untuk Unggah Gambar QRIS *
                                </span>
                                <span className="text-[10.5px] text-slate-500 mt-0.5">
                                  JPG, PNG, atau WEBP (Maks 2MB)
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setWithdrawQrisFile(file);
                                      setWithdrawQrisPreview(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>

                          {/* Nama Pemilik / Merchant QRIS */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Nama Pemilik / Nama Toko QRIS *
                            </label>
                            <input
                              type="text"
                              required
                              value={withdrawForm.accountHolder}
                              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                              placeholder="Contoh: Toko Berkah / Nama Pemilik"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            />
                            <p className="text-[10.5px] text-purple-700 mt-1">
                              💡 Nomor rekening tidak diperlukan untuk QRIS karena admin langsung memindai barcode.
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* FORM BANK / E-WALLET BIASA */
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Nomor Rekening / No. HP E-Wallet *
                            </label>
                            <input
                              type="text"
                              required
                              value={withdrawForm.accountNumber}
                              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                              placeholder="Contoh: 8830123456 atau 08123456789"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Nama Pemilik Rekening *
                            </label>
                            <input
                              type="text"
                              required
                              value={withdrawForm.accountHolder}
                              onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                              placeholder="Nama lengkap sesuai buku tabungan / e-wallet"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            />
                          </div>
                        </>
                      )}

                      {/* Catatan Tambahan (Opsional) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Catatan Tambahan (Opsional)
                        </label>
                        <input
                          type="text"
                          value={withdrawForm.notes}
                          onChange={(e) => setWithdrawForm({ ...withdrawForm, notes: e.target.value })}
                          placeholder="Contoh: Mohon proses ke QRIS toko untuk operasional..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        />
                      </div>

                      {/* Tombol Submit Mendasar & Mewah */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={
                            submittingWithdraw ||
                            availableReferralBalance < 50000 ||
                            Number(withdrawForm.amount) < 50000 ||
                            Number(withdrawForm.amount) > availableReferralBalance ||
                            (withdrawForm.bank === "QRIS" && !withdrawQrisFile) ||
                            (withdrawForm.bank !== "QRIS" && !withdrawForm.accountNumber.trim()) ||
                            !withdrawForm.accountHolder.trim()
                          }
                          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingWithdraw ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>Memproses Pengajuan Penarikan...</span>
                            </>
                          ) : (
                            <>
                              <Wallet size={18} />
                              <span>Ajukan Penarikan (Rp {Number(withdrawForm.amount || 0).toLocaleString("id-ID")})</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── POPUP PREVIEW QRIS PENARIKAN (FULLSCREEN) ── */}
      {viewQrisModalUrl && (
        <div
          className="fixed inset-0 z-[100000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setViewQrisModalUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 relative text-center shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">QRIS Penarikan Saldo</h4>
              </div>
              <button
                type="button"
                onClick={() => setViewQrisModalUrl(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-center">
              <img
                src={viewQrisModalUrl}
                alt="QRIS Penarikan"
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-md border border-slate-200"
              />
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={viewQrisModalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink size={13} />
                <span>Buka Gambar Penuh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL TRANSAKSI REFERRAL ── */}
      {selectedReferralTx && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4"
          onClick={() => setSelectedReferralTx(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-[#059669]" />
                  Detail Transaksi Referral
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: #{selectedReferralTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedReferralTx(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pembeli / Pengguna:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedReferralTx.userAvatar || selectedReferralTx.user_avatar || selectedReferralTx.referred_avatar || DEFAULT_AVATAR}
                      alt={selectedReferralTx.userName || selectedReferralTx.referred_name || "Pengguna"}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200 bg-slate-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-bold text-slate-900">
                      {selectedReferralTx.userName || selectedReferralTx.user_name || selectedReferralTx.referred_name || "Pengguna"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedReferralTx.userEmail || selectedReferralTx.user_email || selectedReferralTx.referred_email || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bisnis Terkait:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedReferralTx.businessName || selectedReferralTx.business_name || "Bisnis Terkait"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Layanan Pembelian:</span>
                  <span className="font-bold text-[#059669]">
                    {selectedReferralTx.service || selectedReferralTx.service_name || "Paket Premium"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Waktu Transaksi:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedReferralTx.date || (selectedReferralTx.created_at ? new Date(selectedReferralTx.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-")}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Harga Layanan (Normal):</span>
                  <span className="font-bold text-slate-900">
                    Rp {(selectedReferralTx.original_amount || ((selectedReferralTx.amount || selectedReferralTx.final_price || 0) + (selectedReferralTx.discount_amount || selectedReferralTx.discount || 5000))).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Diskon Kode Referral:</span>
                  <span className="font-semibold text-rose-600">
                    - Rp {(selectedReferralTx.discount_amount || selectedReferralTx.discount || selectedReferralTx.discount_given || 5000).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Dibayar Pembeli:</span>
                  <span className="font-bold text-slate-900">
                    Rp {(selectedReferralTx.final_price || selectedReferralTx.amount || selectedReferralTx.transaction_amount || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-emerald-900">Komisi Hak Anda:</span>
                  <span className="font-black text-emerald-700 text-base">
                    + Rp {(selectedReferralTx.commission_amount || selectedReferralTx.commission || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                <span className="text-slate-600 font-semibold">Status Payout Saldo:</span>
                <span className="font-bold text-[#059669]">
                  {selectedReferralTx.payoutStatus || selectedReferralTx.payout_status || (
                    ["approved", "earned", "paid", "success", "completed", "active", "disetujui"].includes(String(selectedReferralTx.status).toLowerCase())
                      ? "Tersedia untuk Ditarik"
                      : ["pending", "waiting_approval", "menunggu"].includes(String(selectedReferralTx.status).toLowerCase())
                        ? "Menunggu Verifikasi"
                        : "Dibatalkan"
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReferralTx(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Kode Referral Custom */}
      {showCustomCodeModal && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Ubah Kode Referral Custom</h3>
                  <p className="text-xs text-slate-500 font-medium">Buat kode kemitraan unik sesuai keinginan Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomCodeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomReferralCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Kode Referral Baru
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customCodeInput}
                    onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: SURADE-RFO167"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-mono font-bold tracking-wider text-sm uppercase transition-all"
                    maxLength={30}
                    disabled={customCodeLoading}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {customCodeInput.length}/30
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Gunakan 4–30 karakter (huruf besar, angka, dan tanda hubung <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">-</code>).
                </p>
              </div>

              {customCodeError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{customCodeError}</span>
                </div>
              )}

              {customCodeSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{customCodeSuccess}</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomCodeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  disabled={customCodeLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={customCodeLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-teal-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {customCodeLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Simpan Kode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Content Pay-Per-Post Payment Modal ── */}
      <ContentPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedBlogForPayment(null);
        }}
        blog={selectedBlogForPayment}
        onSuccess={() => {
          setShowPaymentModal(false);
          setSelectedBlogForPayment(null);
          fetchBlogs();
          fetchEvents();
        }}
      />

      {/* Image Cropper Modal */}
      {showImageCropper && imageToCrop && (
        <ImageCropper
          imageUrl={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropType === "avatar" ? 1 : 16 / 9}
        />
      )}

      {/* ════ MODAL KONFIRMASI BERGABUNG SEBAGAI PENJUAL ════ */}
      {/* ════ MODAL KONFIRMASI BERGABUNG SEBAGAI PENJUAL ════ */}
      {showBecomeSellerModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowBecomeSellerModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Gradient Banner */}
            <div className="shrink-0 relative bg-gradient-to-br from-[#042419] via-[#065f46] to-[#047857] px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6 overflow-hidden text-left">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 left-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Store size={24} className="text-slate-950" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-200 text-xs font-bold backdrop-blur-xs border border-white/25">
                  <Sparkles size={13} className="text-amber-300 animate-pulse" />
                  100% Gratis Selamanya
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                Kembangkan Usaha Anda di Surade.com
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 leading-relaxed">
                Buka etalase digital toko Anda, jangkau ribuan calon pembeli lokal di Surade, dan tingkatkan penjualan setiap hari.
              </p>

              <button
                type="button"
                onClick={() => setShowBecomeSellerModal(false)}
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-all cursor-pointer border-0 bg-transparent"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-3 text-left">
              <div className="space-y-2.5">
                {[
                  {
                    icon: Store,
                    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    title: "Buka Profil & Katalog Usaha Gratis",
                    desc: "Pajang produk unggulan, galeri foto, jam buka, dan rute lokasi Google Maps agar mudah ditemukan pembeli."
                  },
                  {
                    icon: Megaphone,
                    color: "bg-amber-100 text-amber-700 border-amber-200",
                    title: "Jangkau Pasar & Promosi Lebih Luas",
                    desc: "Pasang iklan promosi dan tampil di halaman pencarian teratas warga Kecamatan Surade & sekitarnya."
                  },
                  {
                    icon: MessageCircle,
                    color: "bg-teal-100 text-teal-700 border-teal-200",
                    title: "Terima Pesanan Langsung via WhatsApp",
                    desc: "Pelanggan dapat langsung menghubungi dan memesan ke nomor WhatsApp bisnis Anda tanpa perantara."
                  },
                  {
                    icon: TrendingUp,
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                    title: "Pantau Statistik & Performa Toko",
                    desc: "Ketahui jumlah kunjungan harian, views katalog, serta ulasan bintang pelanggan secara transparan."
                  },
                  {
                    icon: Crown,
                    color: "bg-purple-100 text-purple-700 border-purple-200",
                    title: "Komisi Referral & Centang Emas Resmi",
                    desc: "Dapatkan komisi tunai dari program referral dan tingkatkan kredibilitas dengan badge verifikasi resmi."
                  },
                ].map((item, i) => {
                  const IconComp = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color} shadow-xs`}>
                        <IconComp size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug">{item.title}</h4>
                        <p className="text-[11.5px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-start gap-2.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl px-3.5 py-3">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Aktivasi akun Penjual <strong>100% gratis</strong>. Seluruh fitur belanja dan akun User Anda tetap dapat digunakan seperti biasa.
                </p>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="shrink-0 px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/90 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowBecomeSellerModal(false)}
                className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-white active:scale-98 transition-all cursor-pointer bg-slate-100/80"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={handleBecomeSeller}
                disabled={isSwitchingRole}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 active:scale-98 transition-all cursor-pointer border-0 disabled:opacity-75"
              >
                {isSwitchingRole ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengaktifkan Toko...</span>
                  </>
                ) : (
                  <>
                    <Store size={16} />
                    <span>Ya, Aktifkan Mode Penjual</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GLOBAL MODAL BELI / TOP UP POIN ── */}
      <BuyCoinModal
        isOpen={showBuyCoinModal}
        onClose={() => setShowBuyCoinModal(false)}
        currentBalance={scoinBalance || 0}
        onSuccess={() => {
          fetchHeaderPoinBalance();
          setShowBuyCoinModal(false);
        }}
      />

      {/* ── GLOBAL SATU LAYAR PENARIKAN SALDO GOLD (BISA DIAKSES DARI MANA SAJA) ── */}
      <GoldWithdrawModal
        isOpen={showGoldWithdrawModal}
        onClose={() => setShowGoldWithdrawModal(false)}
        goldBalance={goldBalance || 0}
        onSuccess={() => {
          fetchHeaderPoinBalance();
          setShowGoldWithdrawModal(false);
        }}
      />
    </div>
  );
}