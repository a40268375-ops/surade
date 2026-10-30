import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import ProductCoverflowCarousel from "../components/ProductCoverflowCarousel";
import PromoAdsSlider from "../components/PromoAdsSlider";
import { InlineSpinner } from "../components/LoadingScreen";
import SuradeLoader from "../components/SuradeLoader";
import api from "../services/api";
import { getStorageUrl, DEFAULT_AVATAR, OFFICIAL_BANK_ACCOUNTS, OFFICIAL_EWALLET_ACCOUNTS, OFFICIAL_ACCOUNT_HOLDER } from "../utils/constants";
import { requireAuth, isUserLoggedIn } from "../utils/authCheck";
import { isOpenNow, getTodayName, getScheduleForDay } from "../utils/businessHours";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
import SuradeCoinIcon from "../components/SuradeCoinIcon";
import { BuyCoinModal } from "../components/SuradeCoinModal";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import toast from "react-hot-toast";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Share2,
  Bookmark,
  MessageCircle,
  Send,
  DollarSign,
  Clock,
  X,
  Building2,
  CreditCard,
  ArrowRight,
  Package,
  User,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Flag,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  ExternalLink,
  Compass,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Store,
  Copy,
  Upload,
  UploadCloud,
  Camera,
  Check,
  Tag,
  Ticket,
  Award,
  Trophy,
  Maximize2,
  Minimize2,
  Eye,
  Navigation,
  Zap,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "../components/BusinessMap.css";

function BusinessMapPopupCard({ business, onNavigate }) {
  const coverImage = business.banner 
    ? getStorageUrl(business.banner)
    : business.logo 
      ? getStorageUrl(business.logo)
      : (business.images && business.images.length > 0)
        ? (typeof business.images[0] === 'string' ? getStorageUrl(business.images[0]) : getStorageUrl(business.images[0]?.image_path || business.images[0]?.url))
        : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80";

  const categoryName = business.category?.name || business.category || "Usaha";
  
  // Calculate Open/Closed Status and Operating Hours dynamically
  const todaySchedule = business.opening_days ? getScheduleForDay(business.opening_days) : null;
  const calculatedIsOpen = business.opening_days ? isOpenNow(business.opening_days) : null;

  let hoursText = "";
  if (todaySchedule && todaySchedule.open && todaySchedule.close) {
    if (todaySchedule.open === "00:00" && (todaySchedule.close === "23:59" || todaySchedule.close === "24:00" || todaySchedule.close === "00:00")) {
      hoursText = "24 Jam";
    } else {
      hoursText = `${todaySchedule.open} - ${todaySchedule.close}`;
    }
  } else if (business.operating_hours || business.opening_hours || business.hours) {
    hoursText = business.operating_hours || business.opening_hours || business.hours;
  } else if (business.open_time && business.close_time) {
    hoursText = `${business.open_time} - ${business.close_time}`;
  }

  const isOpen = (() => {
    if (calculatedIsOpen !== null) return calculatedIsOpen;
    if (hoursText) {
      if (/24\s*(jam|hours?)/i.test(hoursText)) return true;
      const match = String(hoursText).match(/(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})/);
      if (match) {
        const openMin = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
        const closeMin = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
        const now = new Date();
        const curMin = now.getHours() * 60 + now.getMinutes();
        if (closeMin >= openMin) return curMin >= openMin && curMin <= closeMin;
        return curMin >= openMin || curMin <= closeMin;
      }
    }
    if (business.is_open_now != null) return Boolean(business.is_open_now);
    if (business.open !== undefined) return Boolean(business.open);
    return true;
  })();

  const displayHours = hoursText || (isOpen ? "Buka Hari Ini" : "Tutup Hari Ini");
  const addressText = business.address || `${business.village ? `Desa ${business.village}, ` : ""}Kecamatan Surade`;
  const viewCount = business.views || 0;

  return (
    <div className="w-[270px] sm:w-[280px] bg-white rounded-2xl overflow-hidden shadow-2xl font-sans text-left border border-slate-100">
      {/* Top Banner Photo */}
      <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
        <img
          src={coverImage}
          alt={business.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Body */}
      <div className="p-3.5 space-y-2">
        {/* Title */}
        <h4 className="font-extrabold text-[15px] leading-tight text-slate-900 line-clamp-2">
          {business.name}
        </h4>

        {/* Category Pill */}
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200/80">
            {categoryName}
          </span>
        </div>

        {/* Open Status & Operating Hours */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Clock size={13} className={isOpen ? "text-emerald-600 shrink-0" : "text-rose-500 shrink-0"} />
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
            isOpen ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}>
            {isOpen ? "Buka Sekarang" : "Tutup"}
          </span>
          <span className="text-slate-600 text-xs font-medium">{displayHours}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600">
          <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed text-slate-600">{addressText}</span>
        </div>

        {/* Visitors Count */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Eye size={13} className="text-slate-400 shrink-0" />
          <span>{viewCount.toLocaleString("id-ID")} kunjungan</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="w-full py-2 px-2.5 rounded-xl bg-[#008374] hover:bg-[#006e62] text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer border-0 shadow-xs"
          >
            Lihat Detail
          </button>
          <button
            type="button"
            onClick={onNavigate}
            className="w-full py-2 px-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
          >
            <Navigation size={12} className="text-slate-600" />
            <span>Navigasi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const t1 = setTimeout(() => { map.invalidateSize(); }, 150);
    const t2 = setTimeout(() => { map.invalidateSize(); }, 450);

    const mapDiv = map.getContainer();
    const parent = mapDiv?.parentElement;
    if (!parent) return () => { clearTimeout(t1); clearTimeout(t2); };

    let rafId = null;
    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (map && map._container) {
          map.invalidateSize();
        }
      });
    });

    observer.observe(parent);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./Home.css";
import "./BusinessDetail.css";

// Fix Leaflet default icon for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});


function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [priceCategory, setPriceCategory] = useState(2);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isHoursExpanded, setIsHoursExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 6;
  const [hasActiveAd, setHasActiveAd] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [openReplyId, setOpenReplyId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [submittingReplyId, setSubmittingReplyId] = useState(null);
  const [reactingId, setReactingId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductPopup, setShowProductPopup] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [allReviewsPage, setAllReviewsPage] = useState(1);
  const reviewsPerPage = 5;
  const [copiedToast, setCopiedToast] = useState(false);

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Informasi Palsu / Penipuan");
  const [reportDescription, setReportDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  // Gallery Modal & Image Preview States
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState("photo");
  const [startingChat, setStartingChat] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // WhatsApp Payment Wall States
  const [showWaPaymentModal, setShowWaPaymentModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [waSettings, setWaSettings] = useState(null);
  const [waSettingsLoading, setWaSettingsLoading] = useState(false);
  const [waPendingAction, setWaPendingAction] = useState(null); // 'direct' | 'product'
  const [waPendingProduct, setWaPendingProduct] = useState(null);
  const [waPaymentConfirmed, setWaPaymentConfirmed] = useState(false);
  const [waLogId, setWaLogId] = useState(null); // store log ID for status polling
  const waPollingRef = useRef(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("BCA");
  const [waProofFile, setWaProofFile] = useState(null);
  const [waProofPreview, setWaProofPreview] = useState(null);
  const [waRejectionReason, setWaRejectionReason] = useState(null);
  const [waSubmittingLog, setWaSubmittingLog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponInfo, setAppliedCouponInfo] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableCouponsLoading, setAvailableCouponsLoading] = useState(false);

  // Surade Coin State for instant WhatsApp and Chat unlocking
  const [poinBalance, setPoinBalance] = useState(null);
  const [silverBalance, setSilverBalance] = useState(0);
  const [goldBalance, setGoldBalance] = useState(0);
  const [selectedWaCoinType, setSelectedWaCoinType] = useState("silver");
  const [showBuyCoinModal, setShowBuyCoinModal] = useState(false);
  const [buyCoinModalInitialType, setBuyCoinModalInitialType] = useState("silver");
  const [unlockedWhatsAppBiz, setUnlockedWhatsAppBiz] = useState({});
  const [waUnlockSuccess, setWaUnlockSuccess] = useState(null);
  const [hasContactedWa, setHasContactedWa] = useState(false);

  // WhatsApp Referral States (Aturan Bonus 1 Gold untuk Pemilik Referral)
  const [waReferralCode, setWaReferralCode] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.applied_referral?.code || u?.applied_referral?.referral_code || localStorage.getItem("applied_referral_code") || "";
    } catch {
      return "";
    }
  });
  const [waAppliedReferral, setWaAppliedReferral] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.applied_referral || null;
    } catch {
      return null;
    }
  });
  const [waReferralLoading, setWaReferralLoading] = useState(false);
  const [waReferralError, setWaReferralError] = useState("");

  const handleApplyWaReferral = async (targetCode = null) => {
    const code = (typeof targetCode === "string" ? targetCode : waReferralCode).trim().toUpperCase();
    if (!code) return;
    setWaReferralLoading(true);
    setWaReferralError("");
    try {
      const res = await api.post("/referrals/validate", {
        code,
        service_type: "whatsapp",
        amount: 10000,
      });
      if (res.data?.success && (res.data?.referral || res.data?.data)) {
        const refData = res.data.referral || res.data.data;
        setWaAppliedReferral(refData);
        setWaReferralCode(refData.code || refData.referral_code || code);
        toast.success(res.data.message || `Kode referral ${code} berhasil dipasang!`);
      } else {
        setWaReferralError(res.data?.message || "Kode referral tidak valid.");
        toast.error(res.data?.message || "Kode referral tidak valid.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Kode referral tidak valid atau sedang nonaktif.";
      setWaReferralError(msg);
      toast.error(msg);
    } finally {
      setWaReferralLoading(false);
    }
  };

  // Business Claim State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showClaimAuthModal, setShowClaimAuthModal] = useState(false);
  const [showClaimSellerModal, setShowClaimSellerModal] = useState(false);
  const [activatingSeller, setActivatingSeller] = useState(false);
  const [claimReason, setClaimReason] = useState("");
  const [claimDescription, setClaimDescription] = useState("");
  const [claimProofFiles, setClaimProofFiles] = useState([]); // multiple files
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [existingClaim, setExistingClaim] = useState(null);
  const [checkingClaim, setCheckingClaim] = useState(false);

  // Chat Unlock State & Pricing from Admin
  const [showChatUnlockModal, setShowChatUnlockModal] = useState(false);
  const [selectedChatCoinType, setSelectedChatCoinType] = useState("silver");
  const [chatSubmittingLog, setChatSubmittingLog] = useState(false);
  const [unlockedChatBiz, setUnlockedChatBiz] = useState({});
  const [chatPaymentTab, setChatPaymentTab] = useState("points"); // "points" | "qris"
  const [chatProofFile, setChatProofFile] = useState(null);
  const [chatProofPreview, setChatProofPreview] = useState(null);
  const [chatQrisPending, setChatQrisPending] = useState(false);
  const [chatQrisRejectionReason, setChatQrisRejectionReason] = useState(null);
  const [chatSettings, setChatSettings] = useState({
    enabled: true,
    amount: 4000,
    points: 4,
    bank_name: "BCA / QRIS",
    instruction: "Akses kirim pesan chat ke penjual dikenakan biaya administrasi resmi.",
  });

  const fetchChatSettings = async () => {
    try {
      const res = await api.get("/chat-settings");
      if (res.data?.data) {
        setChatSettings(res.data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch chat settings:", e);
    }
  };

  const fetchPoinBalance = async () => {
    try {
      const res = await api.get("/coins/balance");
      if (res.data?.success) {
        setPoinBalance(Number(res.data.balance || 0));
        setSilverBalance(Number(res.data.silver_balance || 0));
        setGoldBalance(Number(res.data.gold_balance || 0));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPoinBalance();
  }, []);

  const getStorageUrlLocal = (path) => {
    if (!path) return "";
    return getStorageUrl(path);
  };

  const isPremiumBusiness = Boolean(
    business?.is_premium ||
    business?.is_verified ||
    business?.features?.is_premium ||
    business?.premium_info?.status === "active"
  );

  // Build hero banner list (Free: Max 2, Premium: Max 4)
  const bannerImages = useMemo(() => {
    if (!business) return [];
    const list = [];

    const addUrl = (p) => {
      if (!p) return;
      const url = getStorageUrlLocal(p);
      if (url && !list.includes(url)) list.push(url);
    };

    // 1. Main banner
    if (business.banner) addUrl(business.banner);

    // 2. Banners array
    if (Array.isArray(business.banners)) {
      business.banners.forEach((b) => {
        if (typeof b === "string") addUrl(b);
        else if (b?.file_path) addUrl(b.file_path);
        else if (b?.url) addUrl(b.url);
      });
    }

    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1600&auto=format&fit=crop&q=80");
    }

    // Free maks. 2 banner, Premium maks. 4 banner
    return isPremiumBusiness ? list.slice(0, 4) : list.slice(0, 2);
  }, [business, isPremiumBusiness]);

  useEffect(() => {
    if (business?.name) {
      document.title = `${business.name} - Surade.com`;
    } else {
      document.title = "Detail Usaha - Surade.com";
    }
  }, [business?.name]);

  const displayTags = useMemo(() => {
    let raw = business?.tags;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    
    let processedTags = [];
    if (Array.isArray(raw) && raw.length > 0) {
      processedTags = raw
        .map((t) => (typeof t === "object" ? (t?.name || t?.title || String(t)) : String(t)))
        .filter((t) => Boolean(t) && !t.toLowerCase().includes("kelurahan surade"));
    }

    // Add price tier tag if available
    const price = business?.min_price || business?.avg_price;
    if (price && price > 0) {
      if (price <= 20000) processedTags.push("Murah");
      else if (price <= 75000) processedTags.push("Terjangkau");
      else if (price <= 300000) processedTags.push("Sedang");
      else if (price <= 1000000) processedTags.push("Premium");
      else processedTags.push("Eksklusif");
    }

    // Filter duplicates
    return [...new Set(processedTags)];
  }, [business?.tags, business?.min_price, business?.avg_price]);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isOwner = Boolean(
    currentUser?.id &&
    business &&
    (Number(currentUser.id) === Number(business.user_id) ||
     Number(currentUser.id) === Number(business.userId) ||
     Number(currentUser.id) === Number(business.user?.id) ||
     (currentUser.email && business.user?.email && currentUser.email.toLowerCase() === business.user.email.toLowerCase()))
  );

  // Build gallery image list (Free: Max 3, Premium: Max 10)
  const galleryImages = useMemo(() => {
    if (!business) return [];
    const list = [];

    const addUrl = (p) => {
      if (!p) return;
      const url = getStorageUrlLocal(p);
      if (url && !list.includes(url)) list.push(url);
    };

    // Gallery array (strings or objects)
    if (Array.isArray(business.gallery)) {
      business.gallery.forEach((g) => {
        if (typeof g === "string") addUrl(g);
        else if (g?.file_path) addUrl(g.file_path);
        else if (g?.url) addUrl(g.url);
      });
    }

    // Media relation (from backend)
    if (Array.isArray(business.media)) {
      business.media.forEach((m) => {
        if (m.type !== "video" && m.file_path) addUrl(m.file_path);
      });
    }

    // Free maks. 3 foto galeri, Premium hingga 10 foto galeri
    return isPremiumBusiness ? list.slice(0, 10) : list.slice(0, 3);
  }, [business, isPremiumBusiness]);

  const galleryVideos = useMemo(() => {
    if (!business) return [];
    const list = [];
    
    // 1. Array of media from backend
    const allMedia = Array.isArray(business.media) ? business.media : (Array.isArray(business.gallery) ? business.gallery : []);
    
    // Collect all videos
    allMedia.forEach((m) => {
      if (m.type === "video") {
        const raw = m.url || m.file_path;
        if (raw) {
          const isUrl = raw.startsWith("http://") || raw.startsWith("https://");
          const fullUrl = isUrl ? raw : getStorageUrlLocal(raw);
          const embedUrl = getYouTubeEmbedUrl(fullUrl);
          list.push({ url: fullUrl, embedUrl });
        }
      }
    });

    // 2. Main business.video (if any, as fallback or additional)
    if (business.video) {
      const isUrl = business.video.startsWith("http://") || business.video.startsWith("https://");
      const fullUrl = isUrl ? business.video : getStorageUrlLocal(business.video);
      const embedUrl = getYouTubeEmbedUrl(fullUrl);
      
      // avoid duplicate
      const exists = list.some(v => v.url === fullUrl);
      if (!exists) {
        list.unshift({ url: fullUrl, embedUrl });
      }
    }

    return list.slice(0, 1);
  }, [business]);

  // Premium: tampilkan semua produk di carousel. Non-premium: dibatasi 3 saja.
  const displayedProducts = isPremiumBusiness ? products : products.slice(0, 3);

  // Product pagination
  const totalProductPages = Math.ceil(products.length / productsPerPage) || 1;
  const currentProductPage = Math.min(Math.max(1, productPage), totalProductPages);
  const currentProducts = products.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu lalu`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} bulan lalu`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} tahun lalu`;
  };

  const renderUserAvatar = (reviewUser) => {
    const avatarPath = reviewUser?.avatar || reviewUser?.photo;
    const avatarUrl = avatarPath ? getStorageUrlLocal(avatarPath) : null;
    const name = reviewUser?.name || "Pengguna";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = "flex";
            }
          }}
        />
      );
    }

    const bgColors = [
      "bg-teal-100 text-[#007570] border-teal-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
    ];
    let charSum = 0;
    for (let i = 0; i < name.length; i++) charSum += name.charCodeAt(i);
    const colorClass = bgColors[charSum % bgColors.length];

    return (
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}>
        {initials || "U"}
      </div>
    );
  };

  // Fetch Business Data
  useEffect(() => {
    window.scrollTo(0, 0);
    setShowPhone(false);
    setCurrentHeroSlide(0);

    const fetchBusiness = async () => {
      setIsLoading(true);
      try {
        // Track view in real-time
        api.post(`/analytics/track`, { business_id: id, path: `/business/${id}` }).catch(() => {});
        api.post(`/businesses/${id}/view`).catch(() => {});

        const res = await api.get(`/businesses/${id}`);
        const data = res.data?.data || res.data;
        if (data && data.id) {
          setBusiness(data);
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          let localBizIds = [];
          try {
            localBizIds = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
          } catch (e) {}

          const isFavApi = user && data.favorites && data.favorites.some(f => f.user_id === user.id);
          const isFavLocal = localBizIds.includes(data.id) || localBizIds.includes(String(data.id));

          if (isFavApi || isFavLocal) {
            setSaved(true);
          }
        } else {
          setError("Bisnis tidak ditemukan.");
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
        setError("Gagal memuat data bisnis. Silakan coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  // Automatic hero slideshow
  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!business || !business.id) return;
      setLoadingProducts(true);
      try {
        const res = await api.get(`/businesses/${business.id}/products`);
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
  }, [business?.id]);

  // Check active advertisement status
  useEffect(() => {
    if (!business) return;
    const hasAd = Boolean(
      business.has_active_ad ||
      business.is_advertised ||
      business.placement_type === 'premium' ||
      (Array.isArray(business.advertisements) && business.advertisements.some(ad => (ad.status === 'approved' || ad.status === 'active') && ad.payment_status === 'paid'))
    );
    setHasActiveAd(hasAd);
  }, [business]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!business || !business.id) return;
      setLoadingReviews(true);
      try {
        const res = await api.get(`/businesses/${business.id}/ratings`);
        const raw = res.data?.data || res.data || [];
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setReviews(list);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [business?.id]);

  // Cek apakah user sudah mengakses WhatsApp bisnis ini (syarat ulasan)
  useEffect(() => {
    const checkWaStatus = async () => {
      if (!business?.id || !isUserLoggedIn()) return;
      try {
        const res = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
        const data = res.data?.data;
        if (data?.has_contacted_wa || data?.is_admin || data?.is_owner) {
          setHasContactedWa(true);
        } else {
          setHasContactedWa(false);
        }
        if (data?.has_access) {
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
        }
      } catch (e) {
        // ignore
      }
    };
    checkWaStatus();
  }, [business?.id]);

  // Keyboard navigation for image preview & gallery modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (previewImageIndex !== null) {
          setPreviewImageIndex(null);
        } else if (showGalleryModal) {
          setShowGalleryModal(false);
        }
      } else if (previewImageIndex !== null && galleryImages.length > 1) {
        if (e.key === "ArrowLeft") {
          setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
        } else if (e.key === "ArrowRight") {
          setPreviewImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImageIndex, showGalleryModal, galleryImages.length]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: business?.name || "Surade.com", url });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  // Check for existing claim when business loads
  useEffect(() => {
    if (!business || !currentUser) return;
    if (isOwner) return; // owner cannot claim their own business
    setCheckingClaim(true);
    api.get(`/businesses/${business.id}/my-claim-check`)
      .then(res => { setExistingClaim(res.data?.claim || null); })
      .catch(() => {})
      .finally(() => setCheckingClaim(false));
  }, [business?.id, currentUser?.id]);

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimReason.trim()) {
      toast.error('Alasan klaim wajib dipilih.');
      return;
    }
    if (!claimDescription.trim()) {
      toast.error('Wajib mengisi detail keterangan dan nomor WhatsApp / telepon aktif!');
      return;
    }
    const digitsOnly = claimDescription.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      toast.error('Wajib mencantumkan nomor WhatsApp atau nomor telepon aktif (minimal 8-13 digit) agar Admin dapat menghubungi Anda!');
      return;
    }
    setSubmittingClaim(true);
    try {
      const fd = new FormData();
      fd.append('reason', claimReason.trim());
      fd.append('description', claimDescription.trim());
      claimProofFiles.forEach((f) => fd.append('proof_files[]', f));
      const res = await api.post(`/businesses/${business.id}/claims`, fd);
      setExistingClaim(res.data?.claim || { status: 'pending' });
      setShowClaimModal(false);
      setClaimReason(''); setClaimDescription(''); setClaimProofFiles([]);
      toast.success('Klaim berhasil diajukan! Admin akan segera menghubungi kontak Anda untuk proses verifikasi.');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Gagal mengajukan klaim.';
      toast.error(msg);
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleClaimButtonClick = () => {
    if (!currentUser) {
      setShowClaimAuthModal(true);
      return;
    }
    const role = (currentUser.role || "").toLowerCase();
    if (role === "user" || !role) {
      setShowClaimSellerModal(true);
      return;
    }
    setShowClaimModal(true);
  };

  const handleActivateSeller = async () => {
    setActivatingSeller(true);
    try {
      await api.post("/user/become-seller");
      toast.success("Akun Anda berhasil aktif sebagai Penjual!");
      const updatedUser = { ...currentUser, role: "seller" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowClaimSellerModal(false);
      setShowClaimModal(true);
    } catch (err) {
      toast.error("Gagal mengaktifkan akun penjual. Silakan coba lagi.");
    } finally {
      setActivatingSeller(false);
    }
  };

  const handleToggleSave = async () => {
    if (!requireAuth()) return;
    if (isSaving || !business) return;
    setIsSaving(true);
    
    const isCurrentlySaved = saved;
    setSaved(!isCurrentlySaved);

    let localBiz = JSON.parse(localStorage.getItem("saved_business_ids") || "[]");
    if (isCurrentlySaved) {
      localBiz = localBiz.filter(id => String(id) !== String(business.id));
    } else {
      if (!localBiz.includes(business.id)) localBiz.push(business.id);
    }
    localStorage.setItem("saved_business_ids", JSON.stringify(localBiz));
    localStorage.removeItem("cached_saved_items");

    try {
      if (isCurrentlySaved) {
        await api.delete(`/favorites/${business.id}`);
        toast.success("Usaha dihapus dari simpanan.");
      } else {
        await api.post(`/favorites/${business.id}`);
        toast.success("Usaha berhasil disimpan!");
      }
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setSaved(isCurrentlySaved);
      toast.error("Terjadi kesalahan saat menyimpan usaha.");
    } finally {
      setIsSaving(false);
    }
  };

  const proceedOpenConversation = async () => {
    setStartingChat(true);
    try {
      const res = await api.post(`/businesses/${business.id}/conversation`);
      if (res.data && (res.data.conversation_id || res.data.id)) {
        const convId = res.data.conversation_id || res.data.id;
        navigate(`/dashboard?tab=inbox&conversation=${convId}`);
      } else {
        toast.error(res.data?.message || "Gagal membuka percakapan.");
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(err.response?.data?.message || "Terjadi kesalahan saat membuat percakapan.");
    } finally {
      setStartingChat(false);
    }
  };

  const handleChatWithSeller = async () => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk mengirim pesan.", {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#0f172a",
          color: "#fff",
          fontSize: "14px",
        },
      });
      navigate(`/login?redirect=/business/${business.id}`);
      return;
    }

    if (business && business.user_id && currentUser?.id === business.user_id) {
      toast("Anda adalah pemilik bisnis ini.", { icon: "ℹ️" });
      return;
    }

    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

    // Jika admin menonaktifkan biaya chat, chat bisa langsung dibuka gratis
    if (chatSettings.enabled === false) {
      proceedOpenConversation();
      return;
    }

    // Akses chat berbayar (Poin Silver/Gold atau QRIS) berlaku untuk SEMUA usaha (Free maupun Premium).
    // Pemilik usaha sendiri dan Admin tidak perlu bayar.
    if (isOwner || isAdmin || unlockedChatBiz[business?.id]) {
      proceedOpenConversation();
      return;
    }

    // Periksa status akses chat dari database & segarkan pengaturan harga
    setStartingChat(true);
    fetchChatSettings();
    try {
      const statusRes = await api.get(`/chat-access/status?business_id=${business.id}`);
      if (statusRes.data?.has_access) {
        setUnlockedChatBiz((prev) => ({ ...prev, [business.id]: true }));
        proceedOpenConversation();
        return;
      }
      if (statusRes.data?.qris_status === "pending") {
        setChatQrisPending(true);
        setChatPaymentTab("qris");
      } else if (statusRes.data?.qris_status === "rejected") {
        setChatQrisPending(false);
        setChatQrisRejectionReason(statusRes.data?.rejection_reason || "Bukti transfer tidak sesuai.");
        setChatPaymentTab("qris");
      } else {
        setChatQrisPending(false);
        setChatQrisRejectionReason(null);
      }
      // Belum ada akses -> Buka modal unlock chat (Poin atau QRIS)
      setShowChatUnlockModal(true);
    } catch (err) {
      proceedOpenConversation();
    } finally {
      setStartingChat(false);
    }
  };

  const handlePayWithCoinForChat = async () => {
    if (!business?.id) return;
    if (chatSubmittingLog) return;
    setChatSubmittingLog(true);
    try {
      const res = await api.post("/chat-access/unlock-points", {
        business_id: business.id,
        coin_type: selectedChatCoinType,
      });

      if (res.data?.success) {
        setUnlockedChatBiz((prev) => ({ ...prev, [business.id]: true }));
        fetchPoinBalance();
        setShowChatUnlockModal(false);
        toast.success(res.data?.message || "Akses chat berhasil dibuka!");
        proceedOpenConversation();
      } else {
        toast.error(res.data?.message || "Gagal membuka akses chat.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Saldo Poin tidak mencukupi untuk membuka chat.";
      toast.error(msg);
    } finally {
      setChatSubmittingLog(false);
    }
  };

  const handleChatQrisConfirm = async () => {
    if (!chatProofFile) {
      toast.error("Wajib mengunggah foto bukti pembayaran QRIS terlebih dahulu!");
      return;
    }
    if (!business?.id) return;
    setChatSubmittingLog(true);
    try {
      const formData = new FormData();
      formData.append("business_id", business.id);
      formData.append("fee_amount", chatSettings.amount || 4000);
      formData.append("payment_method", chatSettings.bank_name ? `QRIS (${chatSettings.bank_name})` : "QRIS (Semua E-Wallet & Bank)");
      formData.append("proof_image", chatProofFile);

      const res = await api.post("/chat-access/request-qris", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success(res.data?.message || "Bukti transfer QRIS chat berhasil dikirim! Menunggu verifikasi admin.");
        setChatQrisPending(true);
        setChatQrisRejectionReason(null);
        setChatProofFile(null);
        setChatProofPreview(null);
      } else {
        toast.error(res.data?.message || "Gagal mengirim bukti transfer.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim bukti transfer QRIS.");
    } finally {
      setChatSubmittingLog(false);
    }
  };

  // Helper function to open direct WhatsApp chat
  const openDirectWa = () => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk mengakses WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }
    const phone = String(rawPhone).replace(/\D/g, "");
    const formattedPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;

    // Catat log akses WhatsApp untuk pengguna yang login
    if (isUserLoggedIn() && business?.id) {
      api.post("/whatsapp-click", { business_id: business.id })
        .then(() => {
          setHasContactedWa(true);
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
        })
        .catch(() => {});
    }

    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  // Helper function to open product specific WhatsApp chat
  const openProductWa = (prod) => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk memesan via WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }
    const cleanPhone = String(rawPhone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const priceFormatted = prod?.price != null ? `(Rp ${Number(prod.price).toLocaleString("id-ID")})` : "";
    const msg = encodeURIComponent(
      `Halo ${business.name}, saya ingin memesan/menanyakan produk "${prod?.name || 'ini'}" ${priceFormatted} yang saya lihat di Surade.com. Apakah produk ini masih tersedia?`
    );

    // Catat log akses WhatsApp untuk pengguna yang login
    if (isUserLoggedIn() && business?.id) {
      api.post("/whatsapp-click", { business_id: business.id })
        .then(() => {
          setHasContactedWa(true);
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
        })
        .catch(() => {});
    }

    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  const handleWhatsApp = async () => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk menghubungi via WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }

    // Pemilik usaha sendiri dan Admin tidak perlu bayar akses WhatsApp.
    // Usaha Free maupun Premium tetap berbayar 10 Poin (Silver/Gold) bagi pengunjung.
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

    if (isOwner || isAdmin || (business?.id && unlockedWhatsAppBiz[business.id])) {
      openDirectWa();
      return;
    }

    if (waSettingsLoading) return;
    setWaSettingsLoading(true);
    try {
      // Cek dulu: kalau user sudah pernah unlock (poin) atau disetujui admin untuk bisnis INI,
      // langsung buka WhatsApp tanpa minta bayar lagi.
      try {
        const statusRes = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
        if (statusRes?.data?.data?.has_access) {
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
          openDirectWa();
          return;
        }
        if (statusRes?.data?.data?.status === "rejected") {
          setWaRejectionReason(statusRes.data.data.rejection_reason || "Bukti transfer sebelumnya tidak sesuai.");
        } else {
          setWaRejectionReason(null);
        }
      } catch (e) {
        // lanjut ke pengecekan fee normal kalau gagal cek status
      }

      const res = await api.get("/whatsapp-settings");
      const data = res.data?.data;
      if (data?.enabled && data?.amount > 0) {
        setWaSettings(data);
        if (data?.bank_name) {
          setSelectedPaymentMethod(data.bank_name);
        }
        setWaPendingAction("direct");
        setWaPendingProduct(null);
        setWaPaymentConfirmed(false);
        setShowWaPaymentModal(true);
      } else {
        openDirectWa();
      }
    } catch (err) {
      openDirectWa();
    } finally {
      setWaSettingsLoading(false);
    }
  };

  const handleProductWhatsApp = async (prod) => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk memesan via WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    const rawPhone = business?.whatsapp || business?.phone;
    if (!rawPhone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }

    // Pemilik usaha sendiri dan Admin tidak perlu bayar akses WhatsApp.
    // Usaha Free maupun Premium tetap berbayar 10 Poin (Silver/Gold) bagi pengunjung.
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

    if (isOwner || isAdmin || (business?.id && unlockedWhatsAppBiz[business.id])) {
      openProductWa(prod);
      return;
    }

    if (waSettingsLoading) return;
    // Cek status izin akses WhatsApp bisnis ini untuk user saat ini
    setWaSettingsLoading(true);
    try {
      try {
        const statusRes = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
        if (statusRes?.data?.data?.has_access) {
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
          // Akses sudah disetujui / aktif: langsung buka WhatsApp produk tanpa bayar lagi!
          openProductWa(prod);
          return;
        }
        if (statusRes?.data?.data?.status === "rejected") {
          setWaRejectionReason(statusRes.data.data.rejection_reason || "Bukti transfer sebelumnya tidak sesuai.");
        } else {
          setWaRejectionReason(null);
        }
      } catch (e) {
        // Abaikan error status dan lanjut ke pengecekan fee normal
      }

      // Fetch WA payment settings and show modal if fee enabled
      const res = await api.get("/whatsapp-settings");
      const data = res.data?.data;
      if (data?.enabled && data?.amount > 0) {
        setWaSettings(data);
        if (data?.bank_name) {
          setSelectedPaymentMethod(data.bank_name);
        }
        setWaPendingAction("product");
        setWaPendingProduct(prod);
        setWaPaymentConfirmed(false);
        setShowWaPaymentModal(true);
      } else {
        openProductWa(prod);
      }
    } catch (err) {
      openProductWa(prod);
    } finally {
      setWaSettingsLoading(false);
    }
  };
const handleWaPaymentConfirm = async () => {
    // Validasi WAJIB Bukti Pembayaran
    if (!waProofFile) {
      toast.error("Wajib mengunggah foto bukti pembayaran terlebih dahulu sebelum mengirim!");
      return;
    }

    setWaSubmittingLog(true);
    try {
      const formData = new FormData();
      if (business?.id) formData.append("business_id", business.id);
      if (business?.name) formData.append("business_name", business.name);
      const finalAmount = Number(waSettings?.amount || 5000);
      formData.append("fee_amount", finalAmount);
      formData.append("discount_amount", 0);
      formData.append("payment_method", "QRIS (Semua E-Wallet & Bank)");

      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed?.id) formData.append("user_id", parsed.id);
          if (parsed?.name) formData.append("customer_name", parsed.name);
          if (parsed?.phone || parsed?.email) formData.append("customer_phone", parsed.phone || parsed.email);
        }
      } catch (e) {}

      if (waProofFile) {
        formData.append("proof_image", waProofFile);
      }

      const res = await api.post("/whatsapp-access-log", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Store log ID for later status checking
      if (res?.data?.id) {
        setWaLogId(res.data.id);
      }

      // Close modal and show pending confirmation UI
      setShowWaPaymentModal(false);
      setWaProofFile(null);
      setWaProofPreview(null);
      toast.success("Bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.");
      // Start polling status
      setWaPaymentConfirmed(true);
    } catch (e) {
      console.error("Error logging WA access:", e);
      toast.error(e?.response?.data?.message || "Gagal mengirim bukti pembayaran. Coba lagi.");
    } finally {
      setWaSubmittingLog(false);
    }
  };

  const handlePayWithCoinForWhatsApp = async () => {
    if (!business?.id) return;
    if (!isUserLoggedIn()) {
      requireAuth(navigate, location.pathname, "Login terlebih dahulu untuk membuka akses WhatsApp menggunakan Poin.");
      return;
    }

    if (waSubmittingLog) return;
    setWaSubmittingLog(true);
    try {
      const refCodeToSend = waAppliedReferral?.code || waAppliedReferral?.referral_code || waReferralCode.trim().toUpperCase() || null;
      const res = await api.post("/coins/unlock-whatsapp", {
        business_id: business.id,
        coin_type: selectedWaCoinType || "silver",
        referral_code: refCodeToSend,
      });

      if (res.data?.success) {
        setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
        fetchPoinBalance();
        setWaUnlockSuccess({
          businessName: business.name,
          phone: business.whatsapp || business.phone,
          prod: waPendingProduct,
          isProduct: waPendingAction === "product",
          message: res.data.message || "Akses nomor WhatsApp berhasil dibuka dengan Poin!"
        });
        toast.success(res.data.message || "Akses nomor WhatsApp berhasil dibuka!");
      } else {
        toast.error(res.data?.message || "Gagal membuka WhatsApp.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Saldo Poin Anda tidak mencukupi atau terjadi kesalahan.";
      toast.error(msg);
    } finally {
      setWaSubmittingLog(false);
    }
  };




  const handleDirections = () => {
    if (!business) return;

    const villageName = business.village?.name || (typeof business.village === "string" ? business.village : "");
    const formattedVillage = villageName
      ? (villageName.toLowerCase().startsWith("desa") || villageName.toLowerCase().startsWith("kelurahan")
          ? villageName
          : `Desa ${villageName}`)
      : null;

    const addressParts = [
      business.name,
      business.address,
      formattedVillage,
      "Kecamatan Surade",
      "Kabupaten Sukabumi",
      "Jawa Barat"
    ].filter(Boolean);

    const fullQuery = addressParts.join(", ");

    // Google Maps dir endpoint automatically uses user's current GPS location as origin
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullQuery)}&travelmode=driving`;
    window.open(mapsUrl, "_blank");
  };

  // Listen event global saat admin menyetujui akses WhatsApp
  useEffect(() => {
    const handleWaApproved = (e) => {
      const notifData = e.detail?.data || e.detail;
      const targetBizId = notifData?.business_id;
      if (!targetBizId || String(targetBizId) === String(business?.id)) {
        if (business?.id) {
          setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
        }
        setHasContactedWa(true);
        setWaPaymentConfirmed(false);
      }
    };

    window.addEventListener("whatsapp-access-approved", handleWaApproved);
    return () => window.removeEventListener("whatsapp-access-approved", handleWaApproved);
  }, [business?.id]);

  // Polling effect for WhatsApp access verification
  useEffect(() => {
    if (!waPaymentConfirmed || !waLogId || !business) return;
    if (waPollingRef.current) clearInterval(waPollingRef.current);
    waPollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
        const data = res.data?.data;
        if (data?.status && data.status !== "pending") {
          clearInterval(waPollingRef.current);
          waPollingRef.current = null;
          setWaPaymentConfirmed(false);
          if (data.status === "completed" || data.status === "approved") {
            setUnlockedWhatsAppBiz((prev) => ({ ...prev, [business.id]: true }));
            setHasContactedWa(true);
            toast.success("Admin menyetujui pembayaran QRIS. Membuka chat WhatsApp...", {
              duration: 5000,
              icon: "🎉",
            });
            const rawPhone = business.whatsapp || business.phone || "";
            const phone = String(rawPhone).replace(/\D/g, "");
            const formattedPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
            if (formattedPhone) {
              window.open(`https://wa.me/${formattedPhone}`, "_blank");
            }
          } else if (data.status === "rejected") {
            const reason = data.rejection_reason || "Bukti pembayaran tidak sesuai atau tidak valid.";
            toast.error(`Akses WhatsApp ditolak: ${reason}`);
          }
        }
      } catch (e) {
        console.error("Error checking WA access status:", e);
      }
    }, 4000);
    return () => {
      if (waPollingRef.current) clearInterval(waPollingRef.current);
    };
  }, [waPaymentConfirmed, waLogId, business]);

  // Polling effect for Chat access QRIS verification
  useEffect(() => {
    if (!chatQrisPending || !business?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/chat-access/status?business_id=${business.id}`);
        if (res.data?.has_access) {
          clearInterval(interval);
          setChatQrisPending(false);
          setUnlockedChatBiz((prev) => ({ ...prev, [business.id]: true }));
          setShowChatUnlockModal(false);
          toast.success("Admin menyetujui pembayaran QRIS Chat! Membuka percakapan...", {
            duration: 5000,
            icon: "🎉",
          });
          proceedOpenConversation();
        } else if (res.data?.qris_status === "rejected") {
          clearInterval(interval);
          setChatQrisPending(false);
          setChatQrisRejectionReason(res.data?.rejection_reason || "Bukti transfer tidak sesuai.");
          toast.error("Bukti transfer QRIS Chat ditolak admin. Silakan periksa alasan dan unggah ulang.");
        }
      } catch (e) {
        console.error("Error polling chat access status:", e);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [chatQrisPending, business?.id]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;

    if (!reportReason) {
      toast.error("Silakan pilih alasan laporan.");
      return;
    }
    if (!reportDescription.trim()) {
      toast.error("Silakan isi keterangan detail laporan.");
      return;
    }

    setSubmittingReport(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      await api.post("/reports", {
        reportable_type: "business",
        reportable_id: business.id,
        reason: reportReason,
        description: reportDescription.trim(),
        reporter_name: user?.name || reporterName.trim() || "Pengunjung",
        reporter_email: user?.email || reporterEmail.trim() || null,
      });

      toast.success("Laporan Anda berhasil dikirim ke tim admin.");
      setShowReportModal(false);
      setReportReason("Informasi Palsu / Penipuan");
      setReportDescription("");
    } catch (err) {
      console.error("Gagal mengirim laporan:", err);
      toast.error(err.response?.data?.message || "Gagal mengirim laporan.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleProductClick = (product) => {
    if (product?.id) {
      navigate(`/product/${product.id}`);
    }
  };

  const closeProductPopup = () => {
    setShowProductPopup(false);
    setSelectedProduct(null);
  };

  const handleStarClick = (rating) => {
    if (!requireAuth()) return;
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmitReview = async () => {
    if (!requireAuth()) return;

    if (isOwner) {
      toast.error("Pemilik bisnis tidak dapat memberikan ulasan untuk bisnis miliknya sendiri.");
      return;
    }

    // Pengecekan akses WhatsApp (kecuali admin/super_admin)
    const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
    if (!hasContactedWa && !isAdmin) {
      toast.error("Anda harus mengakses WhatsApp / klik kontak WhatsApp usaha ini terlebih dahulu sebelum dapat memberikan ulasan.");
      const waBox = document.getElementById("wa-requirement-box");
      if (waBox) {
        waBox.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    if (!userRating || !reviewComment.trim()) {
      toast.error("Silakan berikan bintang dan tulis ulasan Anda.");
      return;
    }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !token) {
        toast.error("Silakan login terlebih dahulu untuk memberikan ulasan.");
        setSubmittingReview(false);
        return;
      }

      const res = await api.post(`/businesses/${business.id}/ratings`, {
        rating: userRating,
        review: reviewComment.trim(),
      });

      const newReview = res.data?.data || res.data;

      try {
        const ratingsRes = await api.get(`/businesses/${business.id}/ratings`);
        const raw = ratingsRes.data?.data || ratingsRes.data || [];
        const list = Array.isArray(raw) ? raw : (raw?.data || []);
        setReviews(list);
      } catch {
        setReviews(prev => [newReview, ...prev]);
      }

      setUserRating(0);
      setReviewComment("");
      toast.success("Ulasan Anda berhasil dipublikasikan!");

      try {
        const bizRes = await api.get(`/businesses/${id}`);
        const bizData = bizRes.data?.data || bizRes.data;
        if (bizData && bizData.id) {
          setBusiness(bizData);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh business data:", refreshErr);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(err.response?.data?.message || "Gagal mengirim ulasan.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const handleEditMyReview = (rev) => {
    setUserRating(rev.rating || 5);
    setReviewComment(rev.review || "");
    const el = document.getElementById("reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) return;
    setDeletingReviewId(reviewId);
    try {
      await api.delete(`/ratings/${reviewId}`);
      toast.success("Ulasan berhasil dihapus.");
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setUserRating(0);
      setReviewComment("");
      try {
        const bizRes = await api.get(`/businesses/${id}`);
        const bizData = bizRes.data?.data || bizRes.data;
        if (bizData && bizData.id) {
          setBusiness(bizData);
        }
      } catch (refreshErr) {
        console.error("Failed to refresh business data:", refreshErr);
      }
    } catch (err) {
      console.error("Gagal menghapus ulasan:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus ulasan.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleReact = async (ratingId, type) => {
    if (!requireAuth()) return;
    if (reactingId) return;

    setReactingId(ratingId);
    try {
      const res = await api.post(`/ratings/${ratingId}/react`, { type });
      const { likes_count, dislikes_count, my_reaction } = res.data;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === ratingId
            ? { ...r, likes_count, dislikes_count, my_reaction }
            : r
        )
      );
    } catch (err) {
      console.error("Failed to react to review:", err);
      toast.error(err.response?.data?.message || "Gagal memproses reaksi.");
    } finally {
      setReactingId(null);
    }
  };

  const handleSubmitReply = async (ratingId) => {
    if (!requireAuth()) return;
    const text = (replyTexts[ratingId] || "").trim();
    if (!text) {
      toast.error("Tulis balasan terlebih dahulu.");
      return;
    }

    setSubmittingReplyId(ratingId);
    try {
      const res = await api.post(`/ratings/${ratingId}/replies`, { reply: text });
      const newReply = res.data?.data;
      setReviews((prev) =>
        prev.map((r) =>
          r.id === ratingId
            ? { ...r, replies: [...(r.replies || []), newReply] }
            : r
        )
      );
      setReplyTexts((prev) => ({ ...prev, [ratingId]: "" }));
      setOpenReplyId(null);
      toast.success("Balasan terkirim.");
    } catch (err) {
      console.error("Failed to submit reply:", err);
      toast.error(err.response?.data?.message || "Gagal mengirim balasan.");
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById("reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGoToProducts = () => {
    if (business?.id) {
      navigate(`/business/${business.id}/products`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="business-detail-page">
        <Navbar />
        <div className="bd-container" style={{ paddingTop: "140px", paddingBottom: "140px" }}>
          <InlineSpinner text="Memuat data profil usaha..." />
        </div>
      </div>
    );
  }

  // Not found state
  if (!business) {
    return (
      <div className="business-detail-page">
        <Navbar />
        <div className="bd-container flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 py-20">
          <Building2 size={56} className="text-slate-300" />
          <h2 className="text-2xl font-bold text-slate-800">Bisnis Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 max-w-md">Profil bisnis yang Anda cari mungkin telah dipindahkan atau dinonaktifkan.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#007570] text-white font-bold text-sm shadow-sm hover:bg-[#005a58] transition-all">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isSuspendedOrReported = Boolean(
    business.status === "suspended" ||
    business.is_active === false ||
    business.is_active === 0 ||
    business.active_report ||
    business.suspend_reason
  );

  // Jika bisnis dilaporkan / ditangguhkan, pengunjung umum tidak dapat mengakses dan melihat pemberitahuan resmi
  if (isSuspendedOrReported && !isOwner && currentUser?.role !== "admin") {
    return (
      <div className="business-detail-page bg-slate-50 min-h-screen">
        <Navbar />
        <div className="bd-container flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 py-28 px-4 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-md border border-amber-200">
            <AlertTriangle size={42} className="text-amber-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <ShieldAlert size={14} /> Status: Sedang Dalam Peninjauan Laporan
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Usaha Ini Sementara Tidak Dapat Diakses
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              Profil usaha <strong>{business.name}</strong> saat ini sedang dinonaktifkan sementara dan dalam proses peninjauan oleh tim admin Surade.com demi menjaga keamanan dan perlindungan bersama.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#007570] text-white font-bold text-sm shadow-md hover:bg-[#005a58] transition-all cursor-pointer"
            >
              Kembali ke Beranda
            </Link>
            <Link
              to="/category"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-bold text-sm border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Jelajahi Usaha Lainnya
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Merasa ini sebuah kekeliruan? <Link to="/contact" className="text-[#007570] font-bold hover:underline">Hubungi Bantuan / Tim Admin Surade.com</Link>
          </p>
        </div>
      </div>
    );
  }

  // Extract categories & location
  const rawCat = business.category;
  const isCatObj = rawCat && typeof rawCat === "object";
  const mainCategory = isCatObj ? (rawCat.parent || rawCat) : rawCat;
  const subCategory = isCatObj && rawCat.parent ? rawCat : null;
  const categoryName = typeof mainCategory === "object" ? (mainCategory?.name || "Umum") : (typeof rawCat === "string" ? rawCat : "Umum");
  const subCategoryName = subCategory?.name || null;
  const cityName = typeof business.city === "object" ? (business.city?.name || "Lokasi") : (business.city || "Indonesia");

  // Computed Rating
  const computedAvg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : null;
  const displayRating = computedAvg !== null
    ? parseFloat(computedAvg.toFixed(1))
    : (business.rating ?? business.averageRating ?? 0);
  const displayReviews = reviews.length > 0
    ? reviews.length
    : (business.rating_count ?? business.reviews_count ?? business.reviews ?? business.total_rating ?? 0);

  // Current user & their review
  const myExistingReview = reviews.find(
    (r) => currentUser && (r.user_id === currentUser.id || r.user?.id === currentUser.id)
  );

  // Rating Distribution breakdown (1-5 stars)
  const ratingDistribution = [5, 4, 3, 2, 1].map((starVal) => {
    const count = reviews.filter((r) => Math.round(r.rating || 0) === starVal).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { starVal, count, percentage };
  });

  // Dynamic open/closed status — konsisten dengan Home.jsx & Category.jsx
  // (lihat utils/businessHours.js): kalau bisnis belum isi jadwal sama
  // sekali, dianggap "Buka" (fallback netral) supaya teks & warna badge
  // tidak saling kontradiksi (sebelumnya teks bisa bilang "Buka" padahal
  // titik/warna status menunjukkan tutup, karena null dianggap falsy).
  const openDays = business.opening_days;
  const todayName = getTodayName();
  const todaySchedule = getScheduleForDay(openDays, todayName);
  const isOpenRaw = isOpenNow(openDays);
  const isOpen = isOpenRaw === null ? true : isOpenRaw;
  const displayStatus = isOpen ? "Buka Sekarang" : "Tutup";

  // Seller info
  const seller = business.user
    ? {
        id: business.user.id,
        name: business.user.name,
        username: business.user.username,
        avatar: business.user.avatar ? getStorageUrl(business.user.avatar) : DEFAULT_AVATAR,
      }
    : {
        id: null,
        name: "Pengelola Bisnis",
        username: null,
        avatar: DEFAULT_AVATAR,
      };

  const isVerifiedBusiness = Boolean(
    (business.is_premium || business.package === "premium" || business.premium_info?.status === "active") &&
    (business.premium_expires_at === null || new Date(business.premium_expires_at) > new Date())
  );

  const isReseller = Boolean(currentUser?.role === "reseller" || currentUser?.role === "admin" || currentUser?.role === "super_admin");

  const logoUrl = business.logo ? getStorageUrl(business.logo) : null;

  return (
    <div className="business-detail-page bg-[#f8fafc] min-h-screen text-slate-800 antialiased">
      <Navbar />

      {/* ALERT BANNER JIKA BISNIS SEDANG DI-REPORT / DITANGGUHKAN (UNTUK PEMILIK / ADMIN) */}
      {isSuspendedOrReported && (
        <section className="mt-[68px] bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white shadow-md relative z-30 py-3 px-4 border-b border-rose-300">
          <div className="bd-container flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-200 shrink-0" />
              <div>
                <strong className="font-black text-amber-100">PERINGATAN MODERASI:</strong> Usaha ini sedang dinonaktifkan sementara dari akses publik karena dalam proses peninjauan pengaduan ({business.active_report?.reason || business.suspend_reason || 'Informasi Palsu / Penipuan'}).
              </div>
            </div>
            <span className="px-2.5 py-1 bg-black/20 rounded-lg font-bold border border-white/20">
              Status: Sedang Ditinjau Admin
            </span>
          </div>
        </section>
      )}

      {/* OWNER MANAGEMENT & UPGRADE BAR */}
      {isOwner && (
        <section className="mt-[68px] bg-gradient-to-r from-[#003d38] via-[#005e57] to-[#003d38] border-b border-teal-500/30 text-white shadow-md relative z-30">
          <div className="bd-container py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-xs">
                ⭐ Pemilik Usaha
              </span>
              <span className="text-xs text-teal-100 font-medium">
                Anda login sebagai pemilik resmi profil usaha ini.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {(() => {
                const subs = business.subscriptions || [];
                const latestSub = subs[0];
                const isPendingSub = Boolean(business.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending"));

                if (isVerifiedBusiness) {
                  return (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold flex items-center gap-1.5">
                      <Crown size={14} />
                      <span>⭐ Premium Aktif</span>
                    </span>
                  );
                }

                if (isPendingSub) {
                  return (
                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>⏳ Verifikasi Sedang Diproses</span>
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    onClick={() => navigate(`/add-business/${business.id}?upgrade=true`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer border-0"
                  >
                    <Crown size={14} className="text-slate-950" />
                    <span>Upgrade ke Premium</span>
                  </button>
                );
              })()}
              <button
                type="button"
                onClick={() => navigate(`/add-business/${business.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Edit size={13} />
                <span>Edit Profil Usaha</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO BUSINESS HEADER (FULL WIDTH SHOWCASE + STRUCTURED OVERLAY) */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-slate-950 overflow-hidden select-none" style={{ touchAction: 'pan-y pinch-zoom', overscrollBehaviorX: 'contain' }}>
        {/* Visual Showcase (Photo Carousel) */}
        <div className="relative w-full h-[520px] sm:h-[480px] md:h-[500px] lg:h-[520px]" style={{ touchAction: 'pan-y pinch-zoom' }}>
          {/* Multi-slide container */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentHeroSlide * 100}%)`, touchAction: 'pan-y pinch-zoom' }}
          >
            {bannerImages.map((src, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0 overflow-hidden select-none" style={{ touchAction: 'pan-y pinch-zoom' }}>
                <img
                  src={src}
                  alt={`${business.name} Foto ${idx + 1}`}
                  className="w-full h-full object-cover object-center pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Dark Gradient Overlay for clean readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-black/40 pointer-events-none" />

          {/* Slideshow Arrow Navigation */}
          {bannerImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentHeroSlide((prev) => (prev > 0 ? prev - 1 : bannerImages.length - 1));
                }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 z-20 hover:scale-105 active:scale-95 shadow-lg"
                title="Foto Sebelumnya"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentHeroSlide((prev) => (prev < bannerImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 z-20 hover:scale-105 active:scale-95 shadow-lg"
                title="Foto Selanjutnya"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Floating Pill: "Lihat Semua X Foto" */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-20">
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105"
            >
              <ImageIcon size={14} className="text-teal-400" />
              <span>Lihat semua foto galeri ({galleryImages.length})</span>
            </button>
          </div>

          {/* Hero Content Overlay (Aligned with Container + Safe Top Margin for Fixed Navbar) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5 pt-24 sm:p-7 md:p-8">
            <div className="bd-container">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 mb-2 flex-wrap font-medium">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span className="text-slate-500">/</span>
                <span className="hover:text-white transition-colors">{categoryName}</span>
                {subCategoryName && (
                  <>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-200">{subCategoryName}</span>
                  </>
                )}
                <span className="text-slate-500">/</span>
                <span className="text-teal-300 font-semibold truncate max-w-[140px] sm:max-w-[240px]">{business.name}</span>
              </div>

              {/* Business Identity Row */}
              <div className="flex items-start gap-4 sm:gap-5">
                {/* Rounded Avatar/Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/80 shadow-2xl shrink-0 backdrop-blur-xs flex items-center justify-center p-0.5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={business.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 size={28} className="text-teal-300" />
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Title and Badges */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                      {business.name}
                    </h1>

                    {/* Verified Badge */}
                    {isVerifiedBusiness ? (
                      <span className="inline-flex items-center justify-center shrink-0 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)] transition-transform hover:scale-110" title="Bisnis Terverifikasi Resmi Surade.com">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 1L9.27 3.47L5.64 3.78L4.69 7.31L1.77 9.5L2.83 13L1.77 16.5L4.69 18.69L5.64 22.22L9.27 22.53L12 25L14.73 22.53L18.36 22.22L19.31 18.69L22.23 16.5L21.17 13L22.23 9.5L19.31 7.31L18.36 3.78L14.73 3.47L12 1Z" fill="#10B981" />
                          <path d="M10.2 14.8L7.4 12L6 13.4L10.2 17.6L18 9.8L16.6 8.4L10.2 14.8Z" fill="white" />
                        </svg>
                      </span>
                    ) : (isOwner || isReseller) ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isOwner) {
                            navigate(`/add-business/${business.id}?upgrade=true`);
                          } else {
                            navigate(`/admin-user?tab=premium`);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer border-0 hover:scale-105 active:scale-95 shadow-md group"
                        style={{
                          background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                          boxShadow: "0 4px 14px rgba(217, 119, 6, 0.45), inset 0 1px 1px #ffffff, inset 0 -1.5px 1px #78350f",
                        }}
                        title="Upgrade usaha ini ke Paket Premium untuk fitur lengkap dan badge Terverifikasi"
                      >
                        <Crown size={13} className="text-slate-950 shrink-0 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                        <span>Upgrade ke Premium</span>
                      </button>
                    ) : null}

                    {/* Premium Ads Badge */}
                    {hasActiveAd && (
                      <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                        <Sparkles size={12} />
                        Iklan Premium
                      </span>
                    )}
                  </div>

                  {/* Rating & Review Counter */}
                  <div className="flex items-center gap-3 flex-wrap text-white text-xs sm:text-sm">
                    {/* Star Rating Box */}
                    <div
                      onClick={scrollToReviews}
                      className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity bg-black/30 px-3 py-1 rounded-lg backdrop-blur-xs border border-white/10"
                      title="Lihat ulasan pelanggan"
                    >
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= Math.round(displayRating) ? "#fbbf24" : "none"}
                            color={star <= Math.round(displayRating) ? "#fbbf24" : "#94a3b8"}
                          />
                        ))}
                      </div>
                      <span className="font-black text-sm text-amber-400 ml-1">{displayRating}</span>
                      <span className="text-slate-300 font-medium">({displayReviews} ulasan)</span>
                    </div>

                    <span className="text-slate-400 hidden sm:inline">•</span>

                    {/* Categories - Dipisah Kategori Utama & Subkategori */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-teal-500/25 text-teal-300 border border-teal-400/30">
                        {categoryName}
                      </span>
                      {subCategoryName && (
                        <span className="px-2.5 py-0.5 rounded-md font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                          {subCategoryName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Status & City Location */}
                  <div className="flex items-center gap-3 flex-wrap text-xs sm:text-sm text-slate-200 pt-0.5">
                    {/* Live Open / Closed Indicator */}
                    <div className="flex items-center gap-2 bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10">
                      <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                      <span className={`font-extrabold text-xs ${isOpen ? "text-emerald-400" : "text-rose-400"}`}>
                        {displayStatus}
                      </span>
                      {todaySchedule && (
                        <span className="text-slate-300 font-medium text-xs hidden sm:inline">
                          • {todaySchedule.open} - {todaySchedule.close}
                        </span>
                      )}
                    </div>

                    {/* Location Pin */}
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                      <MapPin size={13} className="text-teal-400 shrink-0" />
                      <span className="truncate">{business.address ? `${business.address.substring(0, 42)}...` : cityName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMPACT ACTION BAR (STICKY, CLEAN, PROPORTIONAL) */}
      {/* ========================================================================= */}
      {/* 2. COMPACT ACTION BAR (STICKY, CLEAN, PROPORTIONAL) */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200 shadow-xs sticky top-[60px] sm:top-[68px] z-30 w-full overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-8 py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Left Action Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tulis Ulasan CTA */}
            <button
              type="button"
              onClick={scrollToReviews}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer shrink-0 whitespace-nowrap border-0"
            >
              <Star size={14} className="fill-amber-300 text-amber-300" />
              <span>Tulis Ulasan</span>
            </button>

            {/* Produk */}
            <button
              type="button"
              onClick={handleGoToProducts}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Package size={14} className="text-amber-600" />
              <span>Produk</span>
            </button>

            {/* Prestasi Usaha */}
            {business.achievements && (
              <button
                type="button"
                onClick={() => setShowAchievementsModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
              >
                <Trophy size={14} className="text-amber-600" />
                <span>Prestasi</span>
              </button>
            )}

            {/* Chat Penjual */}
            <button
              type="button"
              onClick={handleChatWithSeller}
              disabled={startingChat}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#007570] border border-teal-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
            >
              {startingChat ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
              <span>Chat Penjual</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              disabled={waSettingsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50"
            >
              {waSettingsLoading ? <Loader2 size={16} className="animate-spin" /> : <WhatsAppIcon size={17} className="shrink-0 text-emerald-600" />}
              <span>WhatsApp</span>
            </button>

            {/* Petunjuk Arah (Hanya jika usaha verified / premium) */}
            {isVerifiedBusiness && (
              <button
                type="button"
                onClick={handleDirections}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Compass size={14} />
                <span>Petunjuk Arah</span>
              </button>
            )}

            {/* Klaim Usaha (Posisi di Sebelah Petunjuk Arah) */}
            {!isOwner && business && (
              <button
                type="button"
                onClick={handleClaimButtonClick}
                disabled={checkingClaim || (existingClaim && ['pending','under_review'].includes(existingClaim.status))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border ${
                  existingClaim?.status === 'pending'
                    ? "bg-amber-50 text-amber-700 border-amber-300 shadow-2xs"
                    : existingClaim?.status === 'under_review'
                    ? "bg-blue-50 text-blue-700 border-blue-300 shadow-2xs"
                    : existingClaim?.status === 'approved'
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                    : "bg-teal-50 hover:bg-teal-100 text-[#007570] border-teal-200 hover:border-teal-300 shadow-2xs"
                }`}
                title={existingClaim ? `Status Klaim: ${existingClaim.status}` : "Klaim Hak Kelola Usaha"}
              >
                <ShieldCheck size={15} className={existingClaim?.status === 'approved' ? "text-emerald-600" : "text-[#007570]"} />
                <span>
                  {checkingClaim ? 'Memeriksa...' :
                   existingClaim?.status === 'pending' ? 'Klaim Menunggu' :
                   existingClaim?.status === 'under_review' ? 'Dalam Tinjauan' :
                   existingClaim?.status === 'approved' ? 'Klaim Disetujui' :
                   'Klaim Usaha'}
                </span>
              </button>
            )}
          </div>

          {/* Right Action Group (Pushed to Far Right) */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Bookmark / Simpan */}
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                saved
                  ? "bg-teal-50 text-[#007570] border-teal-300 ring-1 ring-[#007570]/20"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title={saved ? "Tersimpan" : "Simpan Bisnis"}
            >
              <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
              <span>{saved ? "Disimpan" : "Simpan"}</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer relative"
              title="Bagikan Profil"
            >
              <Share2 size={15} />
              <span className="hidden md:inline">Bagikan</span>
              {copiedToast && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-md shadow-md whitespace-nowrap">
                  Link tersalin!
                </span>
              )}
            </button>

            {/* Report */}
            <button
              type="button"
              onClick={() => {
                if (requireAuth()) {
                  setShowReportModal(true);
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
              title="Laporkan Bisnis"
            >
              <Flag size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN DISCOVERY CONTENT (70% MAIN CONTENT + 30% INDEPENDENT SIDEBAR) */}
      {/* ========================================================================= */}
      <main className="bd-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          
          {/* ── LEFT COLUMN: MAIN BUSINESS CONTENT (70%) ── */}
          <div className="space-y-7 min-w-0">

            {/* CARD 1: ABOUT / TENTANG BISNIS (COMPACT, EXPANDABLE) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} className="text-[#007570]" />
                  Tentang {business.name}
                </h2>
                {business.year_established && (
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Est. {business.year_established}
                  </span>
                )}
              </div>

              {/* Rich text / expandable description */}
              <div className="relative">
                {/<[a-z][\s\S]*>/i.test(business.description || "") ? (
                  <div
                    className={`prose max-w-none text-slate-600 text-sm leading-relaxed ${
                      !isAboutExpanded ? "line-clamp-3 max-h-[85px] overflow-hidden" : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: business.description }}
                  />
                ) : (
                  <p className={`text-slate-600 text-sm leading-relaxed ${
                    !isAboutExpanded ? "line-clamp-3" : ""
                  }`}>
                    {(() => {
                      if (!business.description) return "Belum ada deskripsi detail untuk bisnis ini.";
                      const tmp = document.createElement("DIV");
                      tmp.innerHTML = business.description;
                      return tmp.textContent || tmp.innerText || "Belum ada deskripsi detail untuk bisnis ini.";
                    })()}
                  </p>
                )}

                {/* Expand / Collapse Button if text is longer */}
                {business.description && business.description.length > 180 && (
                  <button
                    type="button"
                    onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                    className="mt-2 text-xs font-bold text-[#007570] hover:text-[#005a58] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isAboutExpanded ? "Tampilkan lebih sedikit" : "Baca selengkapnya..."}</span>
                    {isAboutExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>

              {/* Highlights & Tags */}
              {displayTags.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
                    <Tag size={13} className="text-[#007570]" />
                    <span>Tags:</span>
                  </div>
                  {displayTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50/80 text-[#007570] text-xs font-bold border border-teal-200/80 shadow-2xs hover:bg-teal-100 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 2: GALLERY MOSAIC (YELP-STYLE GRID) */}
            {(galleryImages.length > 0 || galleryVideos.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#007570]" />
                    Galeri Foto &amp; Media
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dokumentasi suasana, tempat, dan layanan</p>
                </div>

                {/* Tabs for Photos / Video */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveGalleryTab("photo")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeGalleryTab === "photo" ? "bg-white text-[#007570] shadow-xs" : "text-slate-600"
                    }`}
                  >
                    Foto ({galleryImages.length})
                  </button>
                  {galleryVideos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveGalleryTab("video")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeGalleryTab === "video" ? "bg-white text-[#007570] shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <VideoIcon size={13} />
                      Video ({galleryVideos.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Free Business Gallery Notice - only for owner/reseller */}
              {!isVerifiedBusiness && (isOwner || isReseller) && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2 text-amber-900 text-xs">
                    <Crown size={15} className="text-amber-600 shrink-0" />
                    <span>
                      <strong>Paket Reguler:</strong> Galeri foto &amp; video profil penuh adalah fitur eksklusif <strong>Paket Premium</strong>.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isOwner) navigate(`/add-business/${business.id}?upgrade=true`);
                      else navigate(`/admin-user?tab=premium`);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-lg text-[11px] font-black uppercase tracking-wider shrink-0 border-0 cursor-pointer shadow-xs hover:scale-105 transition-all"
                  >
                    Upgrade
                  </button>
                </div>
              )}

              {/* Photo Mosaic Grid (1 Feature Photo + 3 Side Thumbnails) */}
              {activeGalleryTab === "photo" ? (
                galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.slice(0, 4).map((src, i) => {
                      const isLastItem = i === 3 && galleryImages.length > 4;
                      const remaining = galleryImages.length - 4;

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (isLastItem) {
                              setShowGalleryModal(true);
                            } else {
                              setPreviewImageIndex(i);
                            }
                          }}
                          className={`group relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            i === 0 ? "col-span-2 row-span-2 aspect-4/3 sm:aspect-auto min-h-[220px]" : "aspect-4/3"
                          }`}
                        >
                          <img
                            src={src}
                            alt={`${business.name} Foto ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = bannerImages[0] || logoUrl || "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                          {isLastItem && (
                            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                              <span className="text-lg sm:text-xl font-black">+{remaining}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Foto Lainnya</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada foto galeri.</p>
                )
              ) : (
                /* Video Player Grid */
                galleryVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryVideos.map((vid, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden bg-black aspect-16/9 flex items-center justify-center shadow-sm">
                        {vid.embedUrl ? (
                          <iframe
                            src={vid.embedUrl}
                            title={`Video Profil Usaha ${i + 1}`}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : vid.url ? (
                          <video controls src={vid.url} className="w-full h-full object-cover">
                            Your browser does not support video.
                          </video>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada video galeri.</p>
                )
              )}
            </div>
            )}



            {/* CARD 4: REVIEWS & RATINGS (YELP-STYLE UGC) */}
            <div id="reviews-section" className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-1 h-5 rounded-full bg-[#059669]" />
                <h3 className="text-lg font-bold text-slate-900">Rating &amp; Ulasan</h3>
              </div>

              {/* Yelp Rating Overview Breakdown Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 items-center">
                {/* Score badge */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center text-center p-2 sm:border-r sm:border-slate-200">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{displayRating}</span>
                  <div className="flex items-center gap-1 my-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= Math.round(displayRating) ? "#fbbf24" : "none"}
                        color={s <= Math.round(displayRating) ? "#fbbf24" : "#cbd5e1"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{displayReviews} Ulasan</span>
                </div>

                {/* Rating bars */}
                <div className="sm:col-span-7 space-y-1.5">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.starVal} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-bold text-slate-700 shrink-0">{dist.starVal}</span>
                      <Star size={13} fill="#fbbf24" color="#fbbf24" className="shrink-0" />
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-slate-400 font-semibold text-[11px] shrink-0">
                        {dist.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Review Box (Hanya untuk pelanggan/pengunjung biasa, pemilik bisnis tidak bisa mereview bisnis miliknya) */}
              {isOwner ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <Store size={18} />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Akun Pemilik Bisnis
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Sebagai pemilik bisnis <strong>{business.name}</strong>, Anda tidak dapat memberikan rating atau ulasan pada bisnis Anda sendiri. Namun Anda dapat membalas setiap ulasan dari pelanggan pada tombol <strong>"Balas"</strong> di bawah.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Banner Notifikasi jika BELUM akses WhatsApp */}
                  {!hasContactedWa && currentUser?.role !== "admin" && currentUser?.role !== "super_admin" ? (
                    <div id="wa-requirement-box" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-2xs space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                          <MessageCircle size={18} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 flex-wrap">
                            <span>Akses WhatsApp Diperlukan Sebelum Mengulas</span>
                          </h4>
                          <p className="text-xs leading-relaxed text-amber-900 font-medium">
                            Untuk memastikan keaslian ulasan dan pengalaman pelanggan nyata, Anda harus membuka dan menghubungi kontak WhatsApp usaha ini terlebih dahulu.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={handleWhatsApp}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                        >
                          <MessageCircle size={14} />
                          <span>Buka Akses WhatsApp Usaha</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Kontak WhatsApp Terverifikasi — Anda berhak memberikan rating &amp; ulasan</span>
                    </div>
                  )}

                  <div className={`p-4 sm:p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-3.5 transition-opacity ${
                    !hasContactedWa && currentUser?.role !== "admin" && currentUser?.role !== "super_admin" ? "opacity-75" : ""
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {myExistingReview ? "Ulasan Anda" : "Bagikan Pengalaman Anda"}
                        </h4>
                        {myExistingReview && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-[#007570]">
                            Sudah Diulas
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">Ulasan publik</span>
                    </div>

                  {/* Interactive Star Rating Selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                      >
                        <Star
                          size={24}
                          fill={(hoverRating || userRating) >= star ? "#fbbf24" : "none"}
                          color={(hoverRating || userRating) >= star ? "#fbbf24" : "#cbd5e1"}
                        />
                      </button>
                    ))}
                    {(hoverRating || userRating) > 0 && (
                      <span className="text-xs font-bold text-amber-600 ml-2">
                        {hoverRating || userRating} dari 5 Bintang
                      </span>
                    )}
                  </div>

                  {/* Textarea */}
                  <textarea
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all resize-y min-h-[90px]"
                    placeholder="Ceritakan pengalaman Anda mengenai pelayanan, produk, atau suasana di tempat ini..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007570] hover:bg-[#005a58] text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !userRating || !reviewComment.trim()}
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>{myExistingReview ? "Perbarui Ulasan" : "Kirim Ulasan"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

              {/* Reviews List */}
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ulasan Pelanggan ({reviews.length})
                  </h4>
                  {reviews.length > 5 && (
                    <button
                      onClick={() => {
                        setShowAllReviewsModal(true);
                        setAllReviewsPage(1);
                      }}
                      className="text-xs font-bold text-[#007570] hover:underline cursor-pointer"
                    >
                      Lihat Semua ({reviews.length})
                    </button>
                  )}
                </div>

                {loadingReviews ? (
                  <SuradeLoader variant="section" size="sm" text="Memuat ulasan pelanggan" minHeight="140px" />
                ) : reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {reviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="py-3.5 first:pt-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {renderUserAvatar(review.user)}
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {review.user?.name || review.name || "Pelanggan Terdaftar"}
                              </h5>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    fill={star <= (review.rating || 5) ? "#fbbf24" : "none"}
                                    color={star <= (review.rating || 5) ? "#fbbf24" : "#d1d5db"}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                            {formatRelativeDate(review.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-13">
                          "{review.review || review.comment || ""}"
                        </p>

                        {/* Like / Dislike / Reply actions */}
                        <div className="flex items-center gap-4 pl-13 pt-1">
                          <button
                            type="button"
                            onClick={() => handleReact(review.id, "like")}
                            disabled={reactingId === review.id}
                            className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-50 ${review.my_reaction === "like" ? "text-[#007570]" : "text-slate-400 hover:text-[#007570]"}`}
                          >
                            <ThumbsUp size={13} fill={review.my_reaction === "like" ? "#007570" : "none"} />
                            <span>{review.likes_count || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReact(review.id, "dislike")}
                            disabled={reactingId === review.id}
                            className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-50 ${review.my_reaction === "dislike" ? "text-rose-600" : "text-slate-400 hover:text-rose-600"}`}
                          >
                            <ThumbsDown size={13} fill={review.my_reaction === "dislike" ? "#e11d48" : "none"} />
                            <span>{review.dislikes_count || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenReplyId(openReplyId === review.id ? null : review.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#007570] cursor-pointer"
                          >
                            <MessageCircle size={13} />
                            <span>Balas</span>
                          </button>

                          {currentUser && (review.user_id === currentUser.id || review.user?.id === currentUser.id) && (
                            <button
                              type="button"
                              onClick={() => handleEditMyReview(review)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                          )}

                          {currentUser && (
                            review.user_id === currentUser.id ||
                            review.user?.id === currentUser.id ||
                            currentUser.role === "admin" ||
                            (business && business.user_id === currentUser.id)
                          ) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingReviewId === review.id}
                              className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                              <span>{deletingReviewId === review.id ? "Menghapus..." : "Hapus"}</span>
                            </button>
                          )}
                        </div>

                        {/* Reply input box */}
                        {openReplyId === review.id && (
                          <div className="pl-13 pt-2 flex items-start gap-2">
                            <input
                              type="text"
                              value={replyTexts[review.id] || ""}
                              onChange={(e) => setReplyTexts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") handleSubmitReply(review.id); }}
                              placeholder="Tulis balasan..."
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={submittingReplyId === review.id}
                              className="px-3 py-1.5 rounded-lg bg-[#007570] hover:bg-[#005a58] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {submittingReplyId === review.id ? <Loader2 size={13} className="animate-spin" /> : "Kirim"}
                            </button>
                          </div>
                        )}

                        {/* Existing replies */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="pl-13 pt-2 space-y-2">
                            {review.replies.map((rep) => (
                              <div key={rep.id} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800">{rep.user_name || "Pengguna"}</span>
                                  <span className="text-[10px] text-slate-400">{formatRelativeDate(rep.created_at)}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{rep.reply}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                    <Star size={28} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-700">Belum ada ulasan untuk bisnis ini</p>
                    <p className="text-[11px] text-slate-500">Jadilah yang pertama memberikan review & rating pengalaman Anda!</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: INDEPENDENT SIDEBAR (30% - 360px) ── */}
          <aside className="flex flex-col gap-6 w-full box-border lg:sticky lg:top-[132px]">

            {/* SIDEBAR CARD 1: JAM BUKA / OPENING HOURS */}
            {((openDays && Array.isArray(openDays) && openDays.length > 0) || business.opening_hours || business.hours) && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
              <button
                type="button"
                onClick={() => setIsHoursExpanded((v) => !v)}
                className="w-full flex items-center justify-between border-b border-slate-100 pb-3 bg-transparent cursor-pointer"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-[#007570]" />
                  Jam Operasional
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isOpen ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {isOpen ? "Buka" : "Tutup"}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform duration-200 ${isHoursExpanded ? "rotate-180 text-[#10B981]" : ""}`}
                  />
                </div>
              </button>

              {/* Table of Hours */}
              {isHoursExpanded && (
                openDays && Array.isArray(openDays) && openDays.length > 0 ? (
                  <div className="space-y-1 text-xs">
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((dayName) => {
                      const d = getScheduleForDay(openDays, dayName);
                      const isToday = dayName === todayName;
                      const dayIsOpen = !!d;
                      return (
                        <div
                          key={dayName}
                          className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                            isToday
                              ? "bg-teal-50/80 font-bold text-[#007570] border border-teal-200/70"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${dayIsOpen ? "bg-emerald-500" : "bg-rose-400"}`} />
                            {dayName}
                            {isToday && <span className="text-[9px] font-bold bg-[#007570] text-white px-1.5 py-0.2 rounded">HARI INI</span>}
                          </span>
                          {dayIsOpen ? (
                            <span className="font-semibold text-slate-800">
                              {d.open} - {d.close}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              Tutup
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 flex items-center gap-2">
                    <Clock size={15} className="text-slate-400" />
                    <span>{business.opening_hours || business.hours || "Senin - Minggu: 09:00 - 21:00"}</span>
                  </div>
                )
              )}
            </div>
            )}

            {/* SIDEBAR CARD 2: LOKASI, ALAMAT & MINI MAP (GRATIS UNTUK SEMUA BISNIS) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={16} className="text-[#007570]" />
                  Lokasi &amp; Peta
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007570] hover:text-[#005a58] transition-colors cursor-pointer bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs"
                >
                  <Maximize2 size={12} />
                  <span>Perbesar</span>
                </button>
              </div>

              {/* Mini Map Container (Aktif untuk Semua Paket) */}
              <div className="rounded-xl overflow-hidden border border-slate-200 relative h-[170px] bg-slate-100 shadow-2xs group">
                <MapContainer
                  center={
                    business.latitude && business.longitude
                      ? [parseFloat(business.latitude), parseFloat(business.longitude)]
                      : [-7.3467, 106.5861]
                  }
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <MapResizeHandler />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    subdomains={['a', 'b', 'c']}
                    maxZoom={19}
                  />
                  <Marker
                    position={
                      business.latitude && business.longitude
                        ? [parseFloat(business.latitude), parseFloat(business.longitude)]
                        : [-7.3467, 106.5861]
                    }
                  >
                    <Popup className="biz-map-popup" maxWidth={290} minWidth={260}>
                      <BusinessMapPopupCard business={business} onNavigate={handleDirections} />
                    </Popup>
                  </Marker>
                </MapContainer>

                {/* Overlay Perbesar Peta Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="absolute bottom-2 right-2 z-[400] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold shadow-md border border-slate-200 transition-all cursor-pointer backdrop-blur-xs"
                >
                  <Maximize2 size={12} className="text-[#007570]" />
                  <span>Perbesar Peta</span>
                </button>
              </div>

              {/* Address Text */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-semibold block">Alamat Usaha:</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {business.address || `${business.village ? `Desa ${business.village}, ` : ""}Kecamatan Surade, Kab. Sukabumi`}
                </p>
              </div>

              {/* Get Directions Button (Hanya jika usaha verified / premium) */}
              {isVerifiedBusiness && (
                <button
                  type="button"
                  onClick={handleDirections}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0"
                >
                  <Compass size={14} className="text-[#007570]" />
                  <span>Petunjuk Arah (Google Maps)</span>
                  <ExternalLink size={12} className="text-slate-400" />
                </button>
              )}
            </div>

            {/* SIDEBAR CARD 3: KONTAK & INFORMASI RESMI */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Phone size={16} className="text-[#007570]" />
                Informasi Kontak
              </h3>

              <div className="space-y-2 text-xs">

                {/* WhatsApp - disatukan dengan alur akses berbayar (sama seperti tombol WhatsApp di action bar) */}
                {business.phone && (
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    disabled={waSettingsLoading}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <WhatsAppIcon size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-bold">Hubungi via WhatsApp</span>
                    </div>
                    {waSettingsLoading ? (
                      <Loader2 size={12} className="animate-spin text-emerald-600" />
                    ) : (
                      <ExternalLink size={12} className="text-emerald-600" />
                    )}
                  </button>
                )}

                {/* Email */}
                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100 transition-colors truncate"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={14} className="text-[#007570] shrink-0" />
                      <span className="font-medium truncate">{business.email}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 shrink-0" />
                  </a>
                )}

                {/* Website */}
                {business.website && (
                  <a
                    href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 hover:bg-slate-100 transition-colors truncate"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Globe size={14} className="text-[#007570] shrink-0" />
                      <span className="font-medium truncate">{business.website}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 shrink-0" />
                  </a>
                )}

                {/* Instagram */}
                {business.instagram && (
                  <a
                    href={business.instagram.startsWith("http") ? business.instagram : `https://instagram.com/${business.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 text-purple-900 hover:from-purple-100 hover:to-pink-100 transition-colors truncate"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Camera size={14} className="text-purple-600 shrink-0" />
                      <span className="font-bold truncate">Instagram: {business.instagram.startsWith("@") ? business.instagram : `@${business.instagram}`}</span>
                    </div>
                    <ExternalLink size={12} className="text-purple-500 shrink-0" />
                  </a>
                )}

                {/* Facebook */}
                {business.facebook && (
                  <a
                    href={business.facebook.startsWith("http") ? business.facebook : `https://facebook.com/${business.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 hover:bg-blue-100 transition-colors truncate"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Globe size={14} className="text-blue-600 shrink-0" />
                      <span className="font-bold truncate">Facebook: {business.facebook}</span>
                    </div>
                    <ExternalLink size={12} className="text-blue-500 shrink-0" />
                  </a>
                )}
              </div>
            </div>

            {/* SIDEBAR CARD 4: PROFIL PENGELOLA */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pengelola Usaha
                </span>
                {isVerifiedBusiness && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-teal-50 text-[#007570] border border-teal-200">
                    Verified Owner
                  </span>
                )}
              </div>

              {/* Clickable Profile Info */}
              <div
                onClick={() => seller.id && navigate(`/profile/${seller.id}`)}
                className={`flex items-center gap-3.5 p-2 -mx-2 rounded-xl transition-all ${seller.id ? "hover:bg-slate-50 cursor-pointer group" : ""}`}
                title={seller.id ? "Lihat Profil Pengguna" : undefined}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 shadow-2xs bg-white shrink-0 group-hover:ring-2 group-hover:ring-[#007570]/30 transition-all">
                  <img
                    src={seller.avatar || DEFAULT_AVATAR}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#007570] transition-colors flex items-center gap-1.5">
                    <span className="truncate">{seller.name}</span>
                    {seller.id && <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {seller.username ? `@${seller.username}` : "Pemilik Profil Usaha"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {seller.id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${seller.id}`)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                  >
                    <User size={13} />
                    <span>Lihat Profil Pengelola</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleChatWithSeller}
                  disabled={startingChat}
                  className="w-full py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-0"
                >
                  {startingChat ? <Loader2 size={13} className="animate-spin" /> : <MessageCircle size={13} />}
                  <span>Kirim Pesan ke Penjual</span>
                </button>
              </div>
            </div>

            {/* PROMO & ADS BANNER SLIDER (Placed in Sidebar Beside Reviews) */}
            <div className="pt-2">
              <PromoAdsSlider />
            </div>

          </aside>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. MODALS & POPUPS */}
      {/* ========================================================================= */}

      {/* MODAL 1: PRODUCT POPUP */}
      {showProductPopup && selectedProduct && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeProductPopup}
        >
          <div
            className="bg-white rounded-[26px] p-6 sm:p-7 w-full max-w-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 text-left relative overflow-hidden space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1]">
                  <Package size={13} />
                  Detail Produk &amp; Layanan
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• {business.name}</span>
              </div>
              <button
                type="button"
                onClick={closeProductPopup}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors border-0"
                title="Tutup Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* 2-Column Responsive Body: Foto di KIRI, Info & Deskripsi di KANAN */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* SISI KIRI: Foto Produk */}
              <div className="w-full sm:w-5/12 shrink-0 flex flex-col gap-2">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group">
                  <img
                    src={selectedProduct.image ? getStorageUrlLocal(selectedProduct.image) : "https://via.placeholder.com/400"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge Tag on Image */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <Store size={10} className="text-amber-400" />
                      Produk Usaha
                    </span>
                  </div>
                </div>
              </div>

              {/* SISI KANAN: Detail, Harga, Deskripsi & Tombol Pemesanan */}
              <div className="w-full sm:w-7/12 flex flex-col justify-between min-h-[200px] space-y-3.5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug mb-1.5">
                    {selectedProduct.name}
                  </h3>

                  {/* Price Tag */}
                  <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-[#007570] my-1">
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Harga:</span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-[#007570]">
                      {selectedProduct.price != null
                        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(selectedProduct.price))
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Description Box */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Deskripsi Produk
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed max-h-[120px] overflow-y-auto pr-1">
                    {selectedProduct.description || "Tidak ada rincian deskripsi tambahan untuk produk ini. Silakan tanyakan langsung kepada penjual melalui WhatsApp."}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeProductPopup();
                      handleProductWhatsApp(selectedProduct);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-[13px] flex items-center justify-center gap-2 cursor-pointer border-0 shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <WhatsAppIcon size={18} className="shrink-0" />
                    <span>Pesan via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeProductPopup();
                      handleChatWithSeller();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border-0 transition-colors"
                    title="Kirim pesan inbox ke penjual"
                  >
                    <MessageCircle size={15} />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL GALLERY GRID MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowGalleryModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-4xl shadow-2xl border border-slate-200 space-y-5 my-8 text-left max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Galeri Foto ({galleryImages.length})</h3>
                <p className="text-xs text-slate-500 mt-0.5">{business.name}</p>
              </div>
              <button type="button" onClick={() => setShowGalleryModal(false)} className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer border-0 bg-transparent">
                <X size={22} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 overflow-y-auto pr-1 flex-1">
              {galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewImageIndex(idx)}
                  className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                >
                  <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      Perbesar
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowGalleryModal(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PETA LOKASI PERBESAR INTERAKTIF (FULLSCREEN / DIALOG) ── */}
      {showMapModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn" onClick={() => setShowMapModal(false)}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#007570] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Peta Lokasi: {business.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {business.address || `${business.village ? `Desa ${business.village}, ` : ""}Kecamatan Surade, Sukabumi`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border-0"
                title="Tutup Peta"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Large Map */}
            <div className="w-full h-[450px] sm:h-[500px] relative bg-slate-100">
              <MapContainer
                center={
                  business.latitude && business.longitude
                    ? [parseFloat(business.latitude), parseFloat(business.longitude)]
                    : [-7.3467, 106.5861]
                }
                zoom={16}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <MapResizeHandler />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  subdomains={['a', 'b', 'c']}
                  maxZoom={19}
                />
                <Marker
                  position={
                    business.latitude && business.longitude
                      ? [parseFloat(business.latitude), parseFloat(business.longitude)]
                      : [-7.3467, 106.5861]
                  }
                >
                  <Popup className="biz-map-popup" maxWidth={290} minWidth={260}>
                    <BusinessMapPopupCard business={business} onNavigate={handleDirections} />
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#007570]" />
                <span>
                  Koordinat: {business.latitude && business.longitude ? `${parseFloat(business.latitude).toFixed(5)}, ${parseFloat(business.longitude).toFixed(5)}` : "Pusat Kecamatan Surade (-7.3467, 106.5861)"}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isVerifiedBusiness && (
                  <button
                    type="button"
                    onClick={handleDirections}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold transition-all shadow-xs border-0 cursor-pointer"
                  >
                    <Compass size={14} />
                    <span>Petunjuk Arah (Google Maps)</span>
                    <ExternalLink size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer border-0"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LARGE LIGHTBOX VIEWER */}
      {previewImageIndex !== null && galleryImages[previewImageIndex] && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[1100] flex flex-col items-center justify-center p-4" onClick={() => setPreviewImageIndex(null)}>
          <div className="absolute top-4 right-4 left-4 flex items-center justify-between z-20" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/90 text-xs sm:text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-xs">
              {previewImageIndex + 1} / {galleryImages.length}
            </span>
            <button type="button" onClick={() => setPreviewImageIndex(null)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10">
              <X size={22} />
            </button>
          </div>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreviewImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1)); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 z-20"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[previewImageIndex]}
              alt={`Preview ${previewImageIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreviewImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0)); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 z-20"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}

      {/* MODAL 4: ALL REVIEWS MODAL */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAllReviewsModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-5 my-8 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" size={20} />
                  Semua Ulasan ({reviews.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{business.name}</p>
              </div>
              <button onClick={() => setShowAllReviewsModal(false)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer border-0 bg-transparent">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {(() => {
                const totalPages = Math.ceil(reviews.length / reviewsPerPage) || 1;
                const safePage = Math.min(Math.max(1, allReviewsPage), totalPages);
                const startIndex = (safePage - 1) * reviewsPerPage;
                const currentReviews = reviews.slice(startIndex, startIndex + reviewsPerPage);

                return currentReviews.map((review) => (
                  <div key={review.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {renderUserAvatar(review.user)}
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{review.user?.name || review.name || "Pengguna"}</h5>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={13}
                                fill={star <= (review.rating || 5) ? "#fbbf24" : "none"}
                                color={star <= (review.rating || 5) ? "#fbbf24" : "#d1d5db"}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {formatRelativeDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-13">
                      "{review.review || review.comment || ""}"
                    </p>

                    <div className="flex items-center gap-4 pl-13 pt-1">
                      <button
                        type="button"
                        onClick={() => handleReact(review.id, "like")}
                        disabled={reactingId === review.id}
                        className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-50 ${review.my_reaction === "like" ? "text-[#007570]" : "text-slate-400 hover:text-[#007570]"}`}
                      >
                        <ThumbsUp size={13} fill={review.my_reaction === "like" ? "#007570" : "none"} />
                        <span>{review.likes_count || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReact(review.id, "dislike")}
                        disabled={reactingId === review.id}
                        className={`flex items-center gap-1 text-[11px] font-semibold cursor-pointer disabled:opacity-50 ${review.my_reaction === "dislike" ? "text-rose-600" : "text-slate-400 hover:text-rose-600"}`}
                      >
                        <ThumbsDown size={13} fill={review.my_reaction === "dislike" ? "#e11d48" : "none"} />
                        <span>{review.dislikes_count || 0}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenReplyId(openReplyId === review.id ? null : review.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-[#007570] cursor-pointer"
                      >
                        <MessageCircle size={13} />
                        <span>Balas</span>
                      </button>

                      {currentUser && (review.user_id === currentUser.id || review.user?.id === currentUser.id) && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAllReviewsModal(false);
                            handleEditMyReview(review);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                      )}

                      {currentUser && (
                        review.user_id === currentUser.id ||
                        review.user?.id === currentUser.id ||
                        currentUser.role === "admin" ||
                        (business && business.user_id === currentUser.id)
                      ) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                          <span>{deletingReviewId === review.id ? "Menghapus..." : "Hapus"}</span>
                        </button>
                      )}
                    </div>

                    {openReplyId === review.id && (
                      <div className="pl-13 pt-2 flex items-start gap-2">
                        <input
                          type="text"
                          value={replyTexts[review.id] || ""}
                          onChange={(e) => setReplyTexts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSubmitReply(review.id); }}
                          placeholder="Tulis balasan..."
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={submittingReplyId === review.id}
                          className="px-3 py-1.5 rounded-lg bg-[#007570] hover:bg-[#005a58] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {submittingReplyId === review.id ? <Loader2 size={13} className="animate-spin" /> : "Kirim"}
                        </button>
                      </div>
                    )}

                    {review.replies && review.replies.length > 0 && (
                      <div className="pl-13 pt-2 space-y-2">
                        {review.replies.map((rep) => (
                          <div key={rep.id} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-800">{rep.user_name || "Pengguna"}</span>
                              <span className="text-[10px] text-slate-400">{formatRelativeDate(rep.created_at)}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{rep.reply}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setShowAllReviewsModal(false)} className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REPORT BUSINESS MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 my-8 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Laporkan Profil Bisnis</h3>
                  <p className="text-xs text-slate-500">Bantu kami menjaga akurasi informasi Surade.com</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer border-0 bg-transparent">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Alasan Pelaporan</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:border-[#007570] outline-none"
                >
                  <option value="Informasi Palsu / Penipuan">Informasi Palsu / Penipuan</option>
                  <option value="Konten Tidak Layak / SARA">Konten Tidak Layak / SARA</option>
                  <option value="Hak Cipta / Logo Tanpa Izin">Hak Cipta / Logo Tanpa Izin</option>
                  <option value="Bisnis Sudah Tutup">Bisnis Sudah Tutup</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Detail Keterangan</label>
                <textarea
                  required
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat alasan laporan Anda..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer border-0">
                  Batal
                </button>
                <button type="submit" disabled={submittingReport} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer border-0 disabled:opacity-50">
                  {submittingReport ? "Mengirim..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: WHATSAPP PAYMENT WALL */}
      {showWaPaymentModal && waSettings && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowWaPaymentModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden my-4 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#007570] to-[#00b3ab] px-5 py-4 text-white text-center relative">
              <button
                onClick={() => setShowWaPaymentModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer border-0 transition-all"
              >
                <X size={14} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-inner">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-black">
                {waUnlockSuccess ? "Akses WhatsApp Berhasil Dibuka" : "Pembayaran & Akses Layanan Surade.com"}
              </h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                {waUnlockSuccess ? "Kontak WhatsApp kini aktif dan siap dihubungi" : "Biaya administrasi resmi & transaksi terverifikasi Surade.com"}
              </p>
            </div>

            {/* Body */}
            {waUnlockSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border border-emerald-200">
                  <CheckCircle2 size={36} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Akses WhatsApp Berhasil Dibuka! 🎉
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                    Akses nomor WhatsApp untuk <strong>{waUnlockSuccess.businessName}</strong> kini sudah aktif dan tersimpan permanen di akun Anda.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
                  <WhatsAppIcon size={16} className="text-emerald-600" />
                  <span>{waUnlockSuccess.phone || "Nomor WhatsApp Siap Dihubungi"}</span>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (waUnlockSuccess.isProduct && waUnlockSuccess.prod) {
                        openProductWa(waUnlockSuccess.prod);
                      } else {
                        openDirectWa();
                      }
                      setShowWaPaymentModal(false);
                      setWaUnlockSuccess(null);
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-98"
                  >
                    <WhatsAppIcon size={18} />
                    <span>Lanjutkan ke Chat WhatsApp Sekarang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWaPaymentModal(false);
                      setWaUnlockSuccess(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0 transition-colors"
                  >
                    Tutup (Buka Nanti)
                  </button>
                </div>
              </div>
            ) : (
            <div className="px-5 py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* ── BAYAR INSTAN DENGAN POIN (SILVER ATAU GOLD - 10 POIN) ── */}
              {(() => {
                const waPoinCost = 10;
                const activeBalance = selectedWaCoinType === "silver" ? silverBalance : goldBalance;
                const canAfford = activeBalance >= waPoinCost;
                const ownerRewardGold = isPremiumBusiness ? 4 : 2;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border-2 border-amber-400/80 shadow-xs space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SuradeCoinIcon size={24} type={selectedWaCoinType} />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                          Bayar dengan Poin ({waPoinCost} Poin)
                        </span>
                      </div>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                        <span>{waPoinCost} Poin</span>
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      Pilih jenis poin yang ingin digunakan untuk membuka nomor WhatsApp <strong>{business?.name}</strong>:
                    </p>

                    {/* Radio Choice: Silver vs Gold */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Poin Silver */}
                      <div
                        onClick={() => setSelectedWaCoinType("silver")}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedWaCoinType === "silver"
                            ? "border-slate-800 bg-white shadow-sm ring-2 ring-slate-400/30"
                            : "border-slate-200 bg-white/70 hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <SuradeCoinIcon size={18} type="silver" />
                            <span className="text-xs font-black text-slate-900">Poin Silver</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedWaCoinType === "silver" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                          }`}>
                            {selectedWaCoinType === "silver" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold">
                          Saldo: <strong className={silverBalance >= 10 ? "text-emerald-700 font-extrabold" : "text-rose-600 font-extrabold"}>{silverBalance} Silver</strong>
                        </div>
                      </div>

                      {/* Poin Gold */}
                      <div
                        onClick={() => setSelectedWaCoinType("gold")}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedWaCoinType === "gold"
                            ? "border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/40"
                            : "border-slate-200 bg-white/70 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <SuradeCoinIcon size={18} type="gold" />
                            <span className="text-xs font-black text-slate-900">Poin Gold</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedWaCoinType === "gold" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                          }`}>
                            {selectedWaCoinType === "gold" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-600 font-semibold">
                          Saldo: <strong className={goldBalance >= 10 ? "text-amber-800 font-extrabold" : "text-rose-600 font-extrabold"}>{goldBalance} Gold</strong>
                        </div>
                      </div>
                    </div>

                    {/* Top up shortcut if insufficient */}
                    {!canAfford && (
                      <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="leading-tight">
                          <span className="font-bold">Saldo {selectedWaCoinType === "silver" ? "Silver" : "Gold"} kurang ({activeBalance}/10).</span>
                          {selectedWaCoinType === "silver" && (
                            <span className="block text-[10px] text-amber-800 mt-0.5">Silver tidak bisa di-top up (hanya dari reward harian). Beralih ke Gold untuk top up.</span>
                          )}
                        </div>
                        {selectedWaCoinType === "silver" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWaCoinType("gold");
                              if (goldBalance < 10) {
                                setBuyCoinModalInitialType("gold");
                                setShowBuyCoinModal(true);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] cursor-pointer shrink-0 self-start sm:self-auto"
                          >
                            {goldBalance >= 10 ? "Gunakan Gold" : "+ Top Up Gold"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setBuyCoinModalInitialType("gold");
                              setShowBuyCoinModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] cursor-pointer shrink-0 self-start sm:self-auto"
                          >
                            + Top Up Gold
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── REFERRAL CODE INPUT & BONUS STATUS ── */}
                    <div className="bg-white/90 p-3 rounded-xl border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                          <Share2 size={13} className="text-[#007570]" />
                          <span>Kode Referral (Opsional)</span>
                        </label>
                        {waAppliedReferral && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Terpasang: {waAppliedReferral.code || waAppliedReferral.referral_code}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Masukkan kode referral (contoh: SDR123)..."
                          value={waReferralCode}
                          onChange={(e) => setWaReferralCode(e.target.value.toUpperCase())}
                          disabled={Boolean(waAppliedReferral?.is_bound)}
                          className="flex-1 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#007570]"
                        />
                        {waAppliedReferral ? (
                          !waAppliedReferral?.is_bound && (
                            <button
                              type="button"
                              onClick={() => {
                                setWaAppliedReferral(null);
                                setWaReferralCode("");
                                setWaReferralError("");
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
                            >
                              Hapus
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApplyWaReferral()}
                            disabled={waReferralLoading || !waReferralCode.trim()}
                            className="px-3 py-1.5 text-xs font-bold bg-[#007570] hover:bg-[#005f5b] text-white rounded-lg disabled:opacity-50 transition-colors cursor-pointer border-0 flex items-center gap-1"
                          >
                            {waReferralLoading ? <Loader2 size={12} className="animate-spin" /> : "Gunakan"}
                          </button>
                        )}
                      </div>

                      {waReferralError && (
                        <p className="text-[10.5px] text-rose-600 font-semibold">{waReferralError}</p>
                      )}

                      {/* ── KETERANGAN 3 ATURAN BONUS REFERRAL ── */}
                      {selectedWaCoinType === "gold" && waAppliedReferral ? (
                        <div className="p-2 rounded-lg bg-amber-50 border border-amber-300/80 text-[11px] text-amber-950 flex items-start gap-1.5">
                          <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-900 block font-bold">Bonus Referral Aktif: +1 Poin Gold!</strong>
                            <span>Pemilik kode referral <strong>{waAppliedReferral.referrer_name || waAppliedReferral.name || waAppliedReferral.code}</strong> akan mendapatkan bonus <strong>1 Poin Gold</strong> karena Anda membuka WhatsApp dengan Gold.</span>
                          </div>
                        </div>
                      ) : selectedWaCoinType === "gold" && !waAppliedReferral ? (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Poin Gold tanpa kode referral: Tidak ada bonus referral untuk siapa pun.</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10.5px] text-slate-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          <span>Poin Silver: Tidak mendapatkan bonus referral, meskipun ada kode referral.</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handlePayWithCoinForWhatsApp}
                      disabled={waSubmittingLog || !canAfford}
                      className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        !canAfford
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                          : selectedWaCoinType === "gold"
                          ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 border border-amber-300"
                          : "bg-gradient-to-r from-slate-800 via-slate-900 to-teal-900 hover:opacity-95 text-white border border-slate-700"
                      }`}
                    >
                      {waSubmittingLog ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Membuka Kontak...</span>
                        </>
                      ) : !canAfford ? (
                        <span>Saldo Kurang (Butuh {waPoinCost} Poin {selectedWaCoinType === "silver" ? "Silver" : "Gold"})</span>
                      ) : (
                        <>
                          <Zap size={14} className={selectedWaCoinType === "gold" ? "fill-amber-950" : "fill-white"} />
                          <span>Buka WhatsApp ({waPoinCost} Poin {selectedWaCoinType === "silver" ? "Silver" : "Gold"})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">
                  atau bayar via QRIS
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Rejection notice if previously rejected */}
              {waRejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                    <span>Pengajuan Akses Sebelumnya Ditolak Admin</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed">
                    Alasan: <strong>{waRejectionReason}</strong>
                  </p>
                  <p className="text-[10.5px] text-rose-600 font-medium">
                    Silakan upload bukti transfer QRIS baru yang jelas di bawah ini.
                  </p>
                </div>
              )}

              {/* Instruction alert */}
              <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-teal-900">
                  <Sparkles size={16} className="text-[#007570] shrink-0" />
                  <span>Instruksi Pembayaran QRIS Akses WhatsApp</span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-slate-700 leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Scan kode QRIS resmi Surade.com di bawah melalui m-Banking atau E-Wallet apa saja.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Bayar tepat sejumlah nominal administrasi: <strong className="text-teal-900">Rp {Number(waSettings?.amount || 5000).toLocaleString("id-ID")}</strong>.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Unggah foto bukti struk pembayaran pada form di bawah.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <span><strong className="text-amber-900">Verifikasi oleh Admin:</strong> Diproses dan diverifikasi oleh tim admin maksimal 1x24 jam (1 hari kerja).</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                    <span>Setelah disetujui, akses kontak WhatsApp langsung terbuka permanen dan dana otomatis masuk sebagai <strong className="text-amber-700">Poin Gold ke pemilik usaha</strong>!</span>
                  </div>
                </div>
              </div>

              {/* QRIS Official Section */}
              <div className="border border-teal-100 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 rounded-2xl p-4 text-center space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Scan QRIS Resmi Surade.com
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-[#007570] px-2 py-0.5 rounded-full">
                    Semua Bank &amp; E-Wallet
                  </span>
                </div>

                {/* QR Image Display */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs inline-block mx-auto max-w-[210px]">
                  <img
                    src={waSettings?.qris_image || "/logos/qris.png"}
                    alt="QRIS Pembayaran Resmi"
                    className="w-44 h-44 object-contain rounded-lg mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = "/logos/qris.png";
                    }}
                  />
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">
                    Merchant: <strong>Surade.com</strong>
                  </p>
                </div>

                {/* Total Nominal */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Total Biaya Akses QRIS:</span>
                  <span className="text-base font-black text-[#007570]">
                    Rp {Number(waSettings?.amount || 5000).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10.5px] font-bold text-teal-800 bg-teal-100/60 py-1.5 px-3 rounded-xl">
                  <span>⏳ Verifikasi Maksimal 1x24 Jam</span>
                  <span>•</span>
                  <span>🔒 Terbuka Permanen</span>
                  <span>•</span>
                  <span>🪙 Diteruskan ke Pelaku Usaha</span>
                </div>
              </div>

              {/* Upload Proof of Payment Section */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Kirim Bukti Pembayaran QRIS:</span>
                  <span className="text-[10.5px] text-rose-600 font-extrabold uppercase bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    * Wajib Diunggah
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className={`flex-1 border-2 border-dashed ${waProofFile ? 'border-emerald-400 bg-emerald-50/50' : 'border-teal-300 hover:border-[#007570] bg-teal-50/40 hover:bg-teal-50'} p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold ${waProofFile ? 'text-emerald-700' : 'text-[#007570]'}`}>
                    <Upload size={16} />
                    <span>{waProofFile ? "Ganti Foto Bukti Pembayaran QRIS" : "Unggah Foto Bukti Pembayaran QRIS (Wajib)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setWaProofFile(file);
                          setWaProofPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {waProofPreview && (
                  <div className="relative mt-2 rounded-2xl overflow-hidden border-2 border-emerald-300 w-full h-36 bg-slate-900/5 flex items-center justify-center">
                    <img src={waProofPreview} alt="Bukti Transfer" className="h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setWaProofFile(null);
                        setWaProofPreview(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center border-0 cursor-pointer hover:bg-rose-600 transition-colors"
                      title="Hapus bukti"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleWaPaymentConfirm}
                  disabled={waSubmittingLog || !waProofFile}
                  className={`w-full py-3.5 rounded-2xl ${waProofFile ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6e]' : 'bg-slate-300 cursor-not-allowed'} text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-60`}
                >
                  {waSubmittingLog ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  )}
                  <span>
                    {waProofFile ? "Sudah Bayar & Kirim Bukti — Buka WhatsApp" : "Unggah Bukti Dahulu untuk Melanjutkan"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowWaPaymentModal(false);
                    setWaUnlockSuccess(null);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs cursor-pointer border-0 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PRESTASI & PENGHARGAAN USAHA */}
      {showAchievementsModal && business.achievements && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAchievementsModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-amber-200/80 overflow-hidden my-4 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Amber/Gold gradient */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white relative">
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer border-0 transition-all"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                  <Trophy className="w-6 h-6 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-snug">
                    Prestasi &amp; Penghargaan Usaha
                  </h3>
                  <p className="text-xs text-amber-100 mt-0.5 font-medium line-clamp-1">
                    {business.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body with Rich Formatted Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-slate-50/50">
              <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Award size={16} className="text-amber-600 shrink-0" />
                  <span>Daftar Prestasi, Sertifikasi &amp; Legalitas</span>
                </div>
                {business.achievements.includes("<") ? (
                  <div
                    className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium prose prose-sm prose-amber max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: business.achievements }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {business.achievements}
                  </p>
                )}
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Prestasi dan penghargaan resmi yang dicantumkan ini menambah reputasi &amp; kepercayaan konsumen terhadap {business.name}.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAchievementsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-0 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL UNLOCK CHAT (4 POIN SILVER / GOLD) ── */}
      {showChatUnlockModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setShowChatUnlockModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden text-left my-auto max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#007570] to-[#00a89d] px-5 py-4 text-white relative text-center shrink-0">
              <button
                type="button"
                onClick={() => setShowChatUnlockModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer border-0"
              >
                <X size={14} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm shadow-inner">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-black">Akses Kirim Pesan ke Penjual</h3>
              <p className="text-[11px] text-white/80 mt-0.5">
                Biaya akses chat resmi untuk <strong>{business?.name}</strong>: <strong>{chatSettings.points || 4} Poin</strong>
              </p>
            </div>

            {/* Navigation Tabs: Poin vs QRIS */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setChatPaymentTab("points")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 ${
                  chatPaymentTab === "points"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
              >
                <SuradeCoinIcon size={16} type="gold" />
                <span>Pakai Poin ({chatSettings.points || 4} Poin)</span>
              </button>

              <button
                type="button"
                onClick={() => setChatPaymentTab("qris")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 relative ${
                  chatPaymentTab === "qris"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
              >
                <CreditCard size={15} className="text-[#007570]" />
                <span>QRIS Instant (Rp {Number(chatSettings.amount || 4000).toLocaleString("id-ID")})</span>
                {chatQrisPending && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-2" />
                )}
              </button>
            </div>

            {/* TAB 1: BAYAR DENGAN POIN */}
            {chatPaymentTab === "points" && (() => {
              const chatCost = chatSettings.points || 4;
              const activeChatBalance = selectedChatCoinType === "silver" ? silverBalance : goldBalance;
              const canAffordChat = activeChatBalance >= chatCost;
              const ownerChatReward = isPremiumBusiness ? 2 : 1;

              return (
                <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pilih jenis poin yang ingin Anda gunakan untuk membuka akses chat percakapan dengan toko ini:
                  </p>

                  {/* Radio Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Silver Option */}
                    <div
                      onClick={() => setSelectedChatCoinType("silver")}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        selectedChatCoinType === "silver"
                          ? "border-slate-800 bg-white shadow-sm ring-2 ring-slate-400/30"
                          : "border-slate-200 bg-slate-50/60 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <SuradeCoinIcon size={18} type="silver" />
                          <span className="text-xs font-black text-slate-900">{chatCost} Silver</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedChatCoinType === "silver" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                        }`}>
                          {selectedChatCoinType === "silver" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold">
                        Saldo: <strong className={silverBalance >= chatCost ? "text-emerald-700" : "text-rose-600"}>{silverBalance} Silver</strong>
                      </div>
                    </div>

                    {/* Gold Option */}
                    <div
                      onClick={() => setSelectedChatCoinType("gold")}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        selectedChatCoinType === "gold"
                          ? "border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/40"
                          : "border-slate-200 bg-slate-50/60 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <SuradeCoinIcon size={18} type="gold" />
                          <span className="text-xs font-black text-slate-900">{chatCost} Gold</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedChatCoinType === "gold" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300"
                        }`}>
                          {selectedChatCoinType === "gold" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold">
                        Saldo: <strong className={goldBalance >= chatCost ? "text-amber-800" : "text-rose-600"}>{goldBalance} Gold</strong>
                      </div>
                    </div>
                  </div>

                  {/* Insufficient alert */}
                  {!canAffordChat && (
                    <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl text-[11px] text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="leading-tight">
                        <span className="font-bold">Saldo {selectedChatCoinType === "silver" ? "Silver" : "Gold"} tidak mencukupi ({activeChatBalance}/{chatCost}).</span>
                        {selectedChatCoinType === "silver" && (
                          <span className="block text-[10px] text-amber-800 mt-0.5">Bisa pakai QRIS atau top up Poin Gold.</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setChatPaymentTab("qris")}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10.5px] cursor-pointer shrink-0"
                      >
                        Bayar via QRIS (Rp {Number(chatSettings.amount || 4000).toLocaleString("id-ID")})
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePayWithCoinForChat}
                      disabled={chatSubmittingLog || !canAffordChat}
                      className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        !canAffordChat
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                          : selectedChatCoinType === "gold"
                          ? "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 border border-amber-300"
                          : "bg-gradient-to-r from-[#007570] to-[#00a89d] hover:opacity-95 text-white border border-teal-700"
                      }`}
                    >
                      {chatSubmittingLog ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Membuka Akses Chat...</span>
                        </>
                      ) : !canAffordChat ? (
                        <span>Saldo Tidak Cukup (Butuh {chatCost} {selectedChatCoinType === "silver" ? "Silver" : "Gold"})</span>
                      ) : (
                        <>
                          <Zap size={15} className={selectedChatCoinType === "gold" ? "fill-amber-950" : "fill-white"} />
                          <span>Buka Chat Sekarang ({chatCost} Poin {selectedChatCoinType === "silver" ? "Silver" : "Gold"})</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowChatUnlockModal(false)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer border-0"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* TAB 2: BAYAR DENGAN QRIS */}
            {chatPaymentTab === "qris" && (
              <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">
                {chatQrisPending && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5">
                    <Clock size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs text-amber-900 leading-relaxed text-left">
                      <strong className="block font-bold">Bukti Pembayaran Sedang Diverifikasi Admin</strong>
                      Permohonan akses chat Anda telah terkirim. Admin sedang memverifikasi bukti struk Anda dalam 1 hari kerja (maksimal 1x24 jam). Begitu disetujui, chat langsung otomatis terbuka dan dana diteruskan sebagai Poin Gold ke pemilik usaha!
                    </div>
                  </div>
                )}

                {chatQrisRejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5">
                    <X size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900 leading-relaxed text-left">
                      <strong className="block font-bold">Bukti Pembayaran Sebelumnya Ditolak</strong>
                      Alasan: <em>"{chatQrisRejectionReason}"</em>. Silakan unggah ulang bukti transfer yang jelas dan valid.
                    </div>
                  </div>
                )}

                {/* QRIS Card & Price */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white shadow-md border border-teal-500/30 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Biaya Akses Chat Penjual</span>
                      <div className="text-xl font-black text-amber-300">
                        Rp {Number(chatSettings.amount || 4000).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono text-xs font-bold">
                      QRIS INSTANT
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2">
                    Setelah diverifikasi admin (maksimal 1x24 jam), uang Anda otomatis diteruskan sebagai <strong>Poin Gold ke pemilik usaha</strong> dan percakapan chat langsung terbuka!
                  </p>
                </div>

                {/* Instruction Steps */}
                <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-teal-900">
                    <Sparkles size={16} className="text-[#007570] shrink-0" />
                    <span>Instruksi Pembayaran QRIS Chat Penjual</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>Scan kode QRIS resmi Surade.com di bawah menggunakan m-Banking atau E-Wallet apa saja.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>Bayar tepat sejumlah nominal: <strong className="text-teal-900">Rp {Number(chatSettings.amount || 4000).toLocaleString("id-ID")}</strong>.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Unggah foto bukti struk transfer pembayaran pada form di bawah.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span><strong className="text-amber-900">Verifikasi oleh Admin:</strong> Diproses dan diverifikasi oleh tim admin maksimal 1x24 jam (1 hari kerja).</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9.5px] flex items-center justify-center shrink-0 mt-0.5">5</span>
                      <span>Setelah disetujui, chat langsung aktif dan dana otomatis masuk sebagai <strong className="text-amber-700">Poin Gold ke pemilik usaha</strong>!</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="border border-teal-100 bg-gradient-to-br from-teal-50/60 to-emerald-50/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Scan QRIS Resmi Surade.com
                    </span>
                    <span className="text-[10px] font-bold bg-teal-100 text-[#007570] px-2 py-0.5 rounded-full">
                      Semua Bank &amp; E-Wallet
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs inline-block mx-auto max-w-[200px]">
                    <img
                      src={waSettings?.qris_image || "/logos/qris.png"}
                      alt="QRIS Chat Penjual"
                      className="w-40 h-40 object-contain rounded-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.src = "/logos/qris.png";
                      }}
                    />
                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5">
                      Merchant: <strong>Surade.com</strong>
                    </p>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Total Biaya Akses Chat:</span>
                    <span className="text-base font-black text-[#007570]">Rp 4.000</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10.5px] font-bold text-teal-800 bg-teal-100/60 py-1.5 px-3 rounded-xl">
                    <span>⏳ Verifikasi Maksimal 1x24 Jam</span>
                    <span>•</span>
                    <span>💬 Akses Chat Terbuka</span>
                    <span>•</span>
                    <span>🪙 Poin Gold ke Pelaku Usaha</span>
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left">
                    Unggah Bukti Struk Transfer QRIS *
                  </label>
                  <label className="border-2 border-dashed border-teal-400/60 hover:border-teal-600 bg-teal-50/30 hover:bg-teal-50/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                    {chatProofPreview ? (
                      <div className="relative group w-full">
                        <img
                          src={chatProofPreview}
                          alt="Preview Struk"
                          className="max-h-48 mx-auto rounded-xl object-contain shadow-xs border border-teal-200"
                        />
                        <div className="mt-2 text-center text-xs text-teal-700 font-semibold">
                          Klik untuk mengganti foto
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-2">
                          <UploadCloud size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-800">Pilih Foto Bukti Transfer / Struk QRIS</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Format JPG, PNG, atau WEBP (Maks 10MB)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setChatProofFile(file);
                          setChatProofPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleChatQrisConfirm}
                    disabled={chatSubmittingLog || !chatProofFile}
                    className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      !chatProofFile
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                        : "bg-gradient-to-r from-[#007570] to-[#00a89d] hover:opacity-95 text-white border border-teal-700"
                    }`}
                  >
                    {chatSubmittingLog ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Mengirim Bukti Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Kirim Bukti Pembayaran QRIS (Rp 4.000)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowChatUnlockModal(false)}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer border-0"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL BELI / TOP UP POIN ── */}
      <BuyCoinModal
        isOpen={showBuyCoinModal}
        onClose={() => setShowBuyCoinModal(false)}
        currentBalance={poinBalance || 0}
        initialCoinType={buyCoinModalInitialType}
        onSuccess={() => {
          fetchPoinBalance();
          setShowBuyCoinModal(false);
        }}
      />

            {/* ── MODAL LOGIN UNTUK KLAIM ── */}
      {showClaimAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Poppins',sans-serif]" onClick={() => setShowClaimAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Store size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Masuk untuk Klaim Usaha</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Untuk mengajukan klaim kepemilikan usaha ini, silakan masuk ke akun Anda atau daftar akun baru terlebih dahulu.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}
                className="w-full py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white text-xs font-bold transition-colors cursor-pointer border-0 shadow-2xs"
              >
                Masuk / Login
              </button>
              <button
                type="button"
                onClick={() => navigate(`/register?redirect=${encodeURIComponent(window.location.pathname)}`)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AKTIVASI PENJUAL UNTUK KLAIM ── */}
      {showClaimSellerModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Poppins',sans-serif]" onClick={() => setShowClaimSellerModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Sparkles size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Aktivasi Akun Penjual</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akun Anda saat ini terdaftar sebagai Pengguna Umum. Untuk dapat mengklaim dan mengelola usaha, aktifkan akun Anda sebagai Mitra Penjual terlebih dahulu (Gratis).
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleActivateSeller}
                disabled={activatingSeller}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all cursor-pointer border-0 shadow-2xs flex items-center justify-center gap-2"
              >
                {activatingSeller ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                <span>{activatingSeller ? "Mengaktifkan..." : "Aktifkan Akun Penjual Sekarang"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowClaimSellerModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ===== MODAL KLAIM USAHA (DESAIN 3D) ===== */}
      {showClaimModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingClaim) setShowClaimModal(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-gradient-to-b from-white via-[#fbfdfc] to-[#f4f8f6] rounded-[28px] border border-white/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_10px_25px_rgba(0,117,112,0.18),inset_0_2px_0_rgba(255,255,255,1)] overflow-hidden max-h-[92vh] flex flex-col transform transition-all">
            
            {/* 3D Header with Floating Badge */}
            <div className="relative p-6 pb-4 border-b border-slate-100/90 bg-gradient-to-r from-teal-50/70 via-emerald-50/40 to-sky-50/60">
              <div className="flex items-start gap-4">
                {/* 3D Icon Badge */}
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#005a58] via-[#007570] to-[#2dd4bf] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(0,117,112,0.35),0_3px_0_#004745,inset_0_2px_4px_rgba(255,255,255,0.45)] shrink-0">
                  <ShieldCheck size={26} className="drop-shadow-sm" />
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Klaim Hak Kelola Usaha
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#007570]/10 text-[#007570] border border-[#007570]/20 uppercase tracking-wide">
                      Verifikasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Ajukan bukti kepemilikan sah untuk mengelola tempat usaha <span className="font-bold text-slate-800">"{business?.name}"</span>.
                  </p>
                </div>

                {/* 3D Close Button */}
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  disabled={submittingClaim}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200/60 shadow-[0_2px_5px_rgba(0,0,0,0.08),0_1px_0_#e2e8f0] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  title="Tutup Modal"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4 overflow-y-auto">
              {/* 3D Floating Alert Box */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-sky-50/90 via-teal-50/50 to-emerald-50/80 border border-teal-200/70 shadow-[0_4px_12px_rgba(0,117,112,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles size={16} />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-extrabold text-sky-900 block mb-0.5">Informasi Verifikasi Resmi</span>
                  Pengajuan Anda akan ditinjau langsung oleh Administrator Surade.com. Hak kelola &amp; kepemilikan usaha akan dialihkan setelah proses verifikasi berkas selesai.
                </div>
              </div>

              {/* Data Akun Pengaju (Card 3D) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-[#007570]" />
                  Identitas Akun Pengaju <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-800 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-emerald-700 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-xs truncate leading-tight">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate leading-tight">{currentUser?.email} {currentUser?.role ? `• (${currentUser.role})` : ""}</p>
                  </div>
                </div>
              </div>

              {/* Alasan Klaim (Pilihan Dropdown 3D) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} className="text-[#007570]" />
                    Alasan Klaim Usaha <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Wajib dipilih</span>
                </label>
                <div className="relative">
                  <select
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/90 bg-white text-xs sm:text-sm text-slate-800 font-medium appearance-none shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-[#007570] transition-all cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Alasan Klaim Usaha --</option>
                    <option value="Saya adalah Pemilik Sah / Pendiri Tempat Usaha Ini">Saya adalah Pemilik Sah / Pendiri Tempat Usaha Ini</option>
                    <option value="Saya adalah Pengelola / Manajer Resmi yang Ditunjuk Pemilik">Saya adalah Pengelola / Manajer Resmi yang Ditunjuk Pemilik</option>
                    <option value="Usaha Keluarga / Diwariskan Secara Sah Kepada Saya">Usaha Keluarga / Diwariskan Secara Sah Kepada Saya</option>
                    <option value="Usaha Telah Diakuisisi / Pindah Tangan Kepemilikan Resmi">Usaha Telah Diakuisisi / Pindah Tangan Kepemilikan Resmi</option>
                    <option value="Perubahan Struktur Kemitraan / Manajemen Baru">Perubahan Struktur Kemitraan / Manajemen Baru</option>
                    <option value="Profil Usaha Dibuat oleh Pihak Ketiga / Belum Dikelola Pemilik Asli">Profil Usaha Dibuat oleh Pihak Ketiga / Belum Dikelola Pemilik Asli</option>
                    <option value="Lainnya">Lainnya (Jelaskan detail pada keterangan di bawah)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Detail Keterangan & Nomor Kontak WA/Telepon (3D Inset) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} className="text-[#007570]" />
                    Detail Keterangan &amp; Nomor Kontak (WA / Telepon) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Wajib diisi
                  </span>
                </label>

                {/* Banner Peringatan Kontak Wajib */}
                <div className="mb-2 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-[11.5px] text-amber-900 leading-relaxed flex items-start gap-2 shadow-2xs">
                  <span className="shrink-0 text-amber-600 font-bold text-xs mt-0.5">⚠️</span>
                  <span>
                    <strong>Wajib Cantumkan Kontak:</strong> Tuliskan nomor WhatsApp atau nomor telepon aktif Anda agar Admin dapat menghubungi Anda untuk verifikasi kepemilikan usaha ini.
                  </span>
                </div>

                <textarea
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Contoh: Nomor WhatsApp aktif saya 0812-3456-7890. Saya adalah pemilik asli toko ini dan siap dihubungi admin untuk verifikasi berkas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/90 bg-white text-xs sm:text-sm text-slate-800 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-[#007570] resize-none transition-all"
                />
              </div>

              {/* Bukti Dokumen - Multiple Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud size={13} className="text-[#007570]" />
                    Bukti Pendukung Kepemilikan
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Maks. 5MB/file &bull; Bisa lebih dari 1 file</span>
                </label>
                {/* Info box */}
                <div className="mb-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                  <span className="text-blue-500 mt-0.5 shrink-0">&#9432;</span>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Anda dapat mengunggah <strong>lebih dari 1 file</strong> sekaligus. Setiap file maksimal <strong>5MB</strong> (JPG, PNG, PDF). Contoh: foto KTP, NIB, surat usaha, foto di lokasi.
                  </p>
                </div>
                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-teal-300/80 hover:border-[#007570] rounded-2xl bg-gradient-to-b from-teal-50/40 to-slate-50/60 hover:bg-teal-50/70 transition-all cursor-pointer group shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || []);
                      const MAX_SIZE = 5 * 1024 * 1024;
                      const oversized = selected.filter(f => f.size > MAX_SIZE);
                      if (oversized.length > 0) {
                        toast.error(`File melebihi batas 5MB: ${oversized.map(f => f.name).join(', ')}`);
                      }
                      const valid = selected.filter(f => f.size <= MAX_SIZE);
                      if (valid.length > 0) {
                        setClaimProofFiles(prev => {
                          const merged = [...prev, ...valid];
                          if (merged.length > 5) {
                            toast.error('Maksimal 5 file yang dapat diunggah.');
                            return merged.slice(0, 5);
                          }
                          return merged;
                        });
                      }
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                  {claimProofFiles.length > 0 ? (
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-emerald-700">{claimProofFiles.length} file terpilih &bull; Klik untuk tambah file lagi</span>
                      </div>
                      <div className="space-y-1.5">
                        {claimProofFiles.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-slate-200 shadow-2xs">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 truncate">{f.name}</p>
                              <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); setClaimProofFiles(prev => prev.filter((_, i) => i !== idx)); }}
                              className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
                              title="Hapus file ini"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-white text-[#007570] flex items-center justify-center mx-auto mb-2 shadow-[0_4px_10px_rgba(0,117,112,0.12),0_1px_0_#cbd5e1] group-hover:scale-105 transition-transform">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Klik untuk unggah foto KTP, izin usaha, NIB, atau foto di lokasi usaha
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Format: JPG, PNG, PDF &bull; Maks. 5MB per file &bull; Bisa pilih banyak file
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* 3D Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  disabled={submittingClaim}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-[0_3px_0_#cbd5e1] active:translate-y-[2px] active:shadow-[0_1px_0_#cbd5e1] transition-all cursor-pointer border-0"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim || !claimReason.trim() || !claimDescription.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#007570] via-[#008781] to-[#0d9488] hover:from-[#005f5b] hover:to-[#0f766e] text-white font-bold text-xs sm:text-sm shadow-[0_4px_0_#004745,0_10px_20px_rgba(0,117,112,0.25)] active:translate-y-[2px] active:shadow-[0_1px_0_#004745] hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer border-0 flex items-center justify-center gap-2"
                >
                  {submittingClaim ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengirim Pengajuan...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Ajukan Klaim Sekarang</span>
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
}