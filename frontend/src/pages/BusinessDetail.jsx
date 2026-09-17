import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import ProductCoverflowCarousel from "../components/ProductCoverflowCarousel";
import { InlineSpinner } from "../components/LoadingScreen";
import api from "../services/api";
import { getStorageUrl, DEFAULT_AVATAR, OFFICIAL_BANK_ACCOUNTS, OFFICIAL_EWALLET_ACCOUNTS, OFFICIAL_ACCOUNT_HOLDER } from "../utils/constants";
import { requireAuth, isUserLoggedIn } from "../utils/authCheck";
import { isOpenNow } from "../utils/businessHours";
import WhatsAppIcon from "../components/icons/WhatsAppIcon";
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
  Flag,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  ExternalLink,
  Compass,
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
  Camera,
  Check,
  Tag,
  Ticket,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

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

function getTodayName() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
  return today;
}

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

  // WhatsApp Payment Wall States
  const [showWaPaymentModal, setShowWaPaymentModal] = useState(false);
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
  const [waSubmittingLog, setWaSubmittingLog] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponInfo, setAppliedCouponInfo] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableCouponsLoading, setAvailableCouponsLoading] = useState(false);

  useEffect(() => {
    setAvailableCouponsLoading(true);
    api.get("/coupons/public-codes")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const filtered = Array.isArray(list)
          ? list.filter(c => !c.applies_to || c.applies_to === 'all')
          : [];
        setAvailableCoupons(filtered);
      })
      .catch((err) => console.error("Gagal memuat daftar kupon:", err))
      .finally(() => setAvailableCouponsLoading(false));
  }, []);

  const getStorageUrlLocal = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/i, "");
    return `${baseUrl}/storage/${path}`;
  };

  // Build hero & gallery images list
  const allImages = useMemo(() => {
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

    // 3. Gallery array (strings or objects)
    if (Array.isArray(business.gallery)) {
      business.gallery.forEach((g) => {
        if (typeof g === "string") addUrl(g);
        else if (g?.file_path) addUrl(g.file_path);
        else if (g?.url) addUrl(g.url);
      });
    }

    // 4. Media relation (from backend)
    if (Array.isArray(business.media)) {
      business.media.forEach((m) => {
        if (m.type !== "video" && m.file_path) addUrl(m.file_path);
      });
    }

    // 5. Logo
    if (business.logo) addUrl(business.logo);

    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80");
    }

    return list;
  }, [business]);

  const isPremiumBusiness = Boolean(
    business?.is_premium ||
    business?.features?.is_premium ||
    business?.premium_info?.status === "active"
  );

  const displayTags = useMemo(() => {
    let raw = business?.tags;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((t) => (typeof t === "object" ? (t?.name || t?.title || String(t)) : String(t))).filter(Boolean);
    }
    const fallbacks = [];
    if (business?.category?.name) fallbacks.push(business.category.name);
    if (business?.village) fallbacks.push(business.village);
    if (Array.isArray(products) && products.length > 0) {
      products.slice(0, 3).forEach((p) => {
        if (p?.name && !fallbacks.includes(p.name)) fallbacks.push(p.name);
      });
    }
    return fallbacks.length > 0 ? fallbacks : ["UMKM Surade", "Produk Lokal"];
  }, [business?.tags, business?.category?.name, business?.village, products]);

  const galleryImages = useMemo(() => {
    return allImages;
  }, [allImages]);

  const videoMedia = useMemo(() => {
    if (!business) return null;
    const allMedia = Array.isArray(business.media) ? business.media : (Array.isArray(business.gallery) ? business.gallery : []);
    const videoItem = allMedia.find((m) => m.type === "video");
    if (videoItem) {
      const raw = videoItem.url || videoItem.file_path;
      if (!raw) return null;
      const isUrl = raw.startsWith("http://") || raw.startsWith("https://");
      const fullUrl = isUrl ? raw : getStorageUrlLocal(raw);
      const embedUrl = getYouTubeEmbedUrl(fullUrl);
      return { url: fullUrl, embedUrl };
    }
    if (business.video) {
      const isUrl = business.video.startsWith("http://") || business.video.startsWith("https://");
      const fullUrl = isUrl ? business.video : getStorageUrlLocal(business.video);
      const embedUrl = getYouTubeEmbedUrl(fullUrl);
      return { url: fullUrl, embedUrl };
    }
    return null;
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
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % allImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [allImages.length]);

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
        await navigator.share({ title: business?.name || "Surade.co.id", url });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
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
        toast.success("Bisnis dihapus dari simpanan.");
      } else {
        await api.post(`/favorites/${business.id}`);
        toast.success("Bisnis berhasil disimpan!");
      }
      window.dispatchEvent(new Event("bookmarkChanged"));
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setSaved(isCurrentlySaved);
      toast.error("Terjadi kesalahan saat menyimpan bisnis.");
    } finally {
      setIsSaving(false);
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

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (business && business.user_id && currentUser.id === business.user_id) {
      toast("Anda adalah pemilik bisnis ini.", { icon: "ℹ️" });
      return;
    }

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

  const handleWhatsApp = async () => {
    if (!isUserLoggedIn()) {
      toast.error("Silakan login terlebih dahulu untuk menghubungi via WhatsApp.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    if (!business?.phone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }
    const openDirectWa = () => {
      const phone = business.phone.replace(/\D/g, "");
      const formattedPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
      window.open(`https://wa.me/${formattedPhone}`, "_blank");
    };

    setWaSettingsLoading(true);
    try {
      // Cek dulu: kalau user sudah pernah disetujui admin untuk bisnis INI,
      // langsung buka WhatsApp tanpa minta bayar lagi.
      try {
        const statusRes = await api.get(`/whatsapp-access-status?business_id=${business.id}`);
        if (statusRes?.data?.data?.has_access) {
          openDirectWa();
          return;
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
    if (!business?.phone) {
      toast.error("Nomor WhatsApp belum tersedia untuk bisnis ini.");
      return;
    }
    // Fetch WA payment settings and show modal if fee enabled
    setWaSettingsLoading(true);
    try {
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
        // No fee, go directly
        const cleanPhone = business.phone.replace(/\D/g, "");
        const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
        const priceFormatted = prod?.price != null ? `(Rp ${Number(prod.price).toLocaleString("id-ID")})` : "";
        const msg = encodeURIComponent(
          `Halo ${business.name}, saya ingin memesan/menanyakan produk "${prod?.name || 'ini'}" ${priceFormatted} yang saya lihat di Surade.co.id. Apakah produk ini masih tersedia?`
        );
        window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
      }
    } catch (err) {
      // On error, allow access
      const cleanPhone = business.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
      const priceFormatted = prod?.price != null ? `(Rp ${Number(prod.price).toLocaleString("id-ID")})` : "";
      const msg = encodeURIComponent(
        `Halo ${business.name}, saya ingin memesan/menanyakan produk "${prod?.name || 'ini'}" ${priceFormatted} yang saya lihat di Surade.co.id. Apakah produk ini masih tersedia?`
      );
      window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
    } finally {
      setWaSettingsLoading(false);
    }
  };
const handleWaPaymentConfirm = async () => {
    setWaSubmittingLog(true);
    try {
      const formData = new FormData();
      if (business?.id) formData.append("business_id", business.id);
      if (business?.name) formData.append("business_name", business.name);
      const finalAmount = Math.max(0, Number(waSettings?.amount || 2000) - Number(couponDiscount || 0));
      formData.append("fee_amount", finalAmount);
      if (appliedCouponInfo?.code) {
        formData.append("coupon_code", appliedCouponInfo.code);
      }

      const selectedAcc =
        OFFICIAL_BANK_ACCOUNTS.find((b) => b.id === selectedPaymentMethod) ||
        OFFICIAL_EWALLET_ACCOUNTS.find((e) => e.id === selectedPaymentMethod);
      formData.append("payment_method", selectedAcc?.name || (selectedPaymentMethod === "qris" ? "QRIS (Semua E-Wallet & Bank)" : selectedPaymentMethod));

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
    } catch (e) {
      console.error("Error logging WA access:", e);
    } finally {
      setWaSubmittingLog(false);
    }

    // Close modal and show pending confirmation UI
    setShowWaPaymentModal(false);
    setWaProofFile(null);
    setWaProofPreview(null);
    toast.success("Bukti pembayaran terkirim. Menunggu verifikasi admin.");
    // Start polling status
    setWaPaymentConfirmed(true);
  };



  const handleDirections = () => {
    // Use lat/lng coordinates if available for precise navigation
    const lat = business.latitude || business.lat;
    const lng = business.longitude || business.lng || business.long;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else {
      const query = encodeURIComponent(business.address || `${business.name}, ${business.city?.name || business.city || "Sukabumi"}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

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
            toast.success("Admin menyetujui akses WhatsApp. Membuka chat...");
            const phone = business.phone.replace(/\\D/g, "");
            const formattedPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
            window.open(`https://wa.me/${formattedPhone}`, "_blank");
          } else if (data.status === "rejected") {
            const reason = data.rejection_reason || "Bukti pembayaran tidak sesuai atau tidak valid.";
            toast.error(`Akses WhatsApp ditolak: ${reason}`);
          }
        }
      } catch (e) {
        console.error("Error checking WA access status:", e);
      }
    }, 5000);
    return () => {
      if (waPollingRef.current) clearInterval(waPollingRef.current);
    };
  }, [waPaymentConfirmed, waLogId, business]);

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
    setSelectedProduct(product);
    setShowProductPopup(true);
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
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
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
  const todaySchedule = Array.isArray(openDays) ? openDays.find((d) => d.day === todayName) : null;
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
    business.is_verified ||
    business.is_premium ||
    business.premium_info?.status === "active" ||
    business.user?.role === "premium"
  );

  const isOwner = Boolean(currentUser?.id && business?.user_id && Number(currentUser.id) === Number(business.user_id));

  const logoUrl = business.logo ? getStorageUrl(business.logo) : null;

  return (
    <div className="business-detail-page bg-[#f8fafc] min-h-screen text-slate-800 antialiased">
      <Navbar />

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
      <section className="relative w-full bg-slate-950 overflow-hidden">
        {/* Visual Showcase (Photo Carousel) */}
        <div className="relative w-full h-[320px] sm:h-[380px] md:h-[430px] lg:h-[460px]">
          {/* Multi-slide container */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
          >
            {allImages.map((src, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0 overflow-hidden select-none">
                <img
                  src={src}
                  alt={`${business.name} Foto ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Dark Gradient Overlay for clean readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-black/35 pointer-events-none" />

          {/* Slideshow Arrow Navigation */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentHeroSlide((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/15 z-20 hover:scale-105"
                title="Foto Sebelumnya"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentHeroSlide((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/15 z-20 hover:scale-105"
                title="Foto Selanjutnya"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Floating Pill: "Lihat Semua X Foto" */}
          <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-8 z-20">
            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105"
            >
              <ImageIcon size={15} className="text-teal-400" />
              <span>Lihat semua {allImages.length} foto</span>
            </button>
          </div>

          {/* Hero Content Overlay (Aligned with Container) */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-7 md:p-8">
            <div className="bd-container">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-2.5 flex-wrap">
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
                <span className="text-teal-300 font-semibold truncate max-w-[240px]">{business.name}</span>
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-xs backdrop-blur-xs">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        Terverifikasi
                      </span>
                    ) : (
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
                    )}

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

                    {/* Categories */}
                    <div className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm">
                      <span className="font-semibold text-teal-300">{categoryName}</span>
                      {subCategoryName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-300">{subCategoryName}</span>
                        </>
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

                  {/* Tags Badges in Hero */}
                  {displayTags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                      {displayTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/25 transition-all shadow-xs"
                        >
                          <Tag size={10} className="text-teal-300" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COMPACT ACTION BAR (STICKY, CLEAN, PROPORTIONAL) */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200 shadow-2xs sticky top-[68px] z-30">
        <div className="bd-container py-3 flex items-center justify-between gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Left Action Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tulis Ulasan CTA */}
            <button
              type="button"
              onClick={scrollToReviews}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border-0"
            >
              <Star size={15} className="fill-amber-300 text-amber-300" />
              <span>Tulis Ulasan</span>
            </button>

            {/* Chat Penjual */}
            <button
              type="button"
              onClick={handleChatWithSeller}
              disabled={startingChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#007570] border border-teal-200 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {startingChat ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
              <span>Chat Penjual</span>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <WhatsAppIcon size={15} />
              <span>WhatsApp</span>
            </button>

            {/* Petunjuk Arah */}
            {isVerifiedBusiness ? (
              <button
                type="button"
                onClick={handleDirections}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Compass size={15} />
                <span className="hidden sm:inline">Petunjuk Arah</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isOwner) navigate(`/add-business/${business.id}?upgrade=true`);
                  else navigate(`/admin-user?tab=premium`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                title="Fitur Petunjuk Arah khusus untuk usaha Premium"
              >
                <Lock size={14} className="text-amber-600" />
                <span className="hidden sm:inline">Petunjuk Arah (Premium)</span>
              </button>
            )}
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 shrink-0">
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
                    {business.description || "Belum ada deskripsi detail untuk bisnis ini."}
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
                  {videoMedia && (
                    <button
                      type="button"
                      onClick={() => setActiveGalleryTab("video")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        activeGalleryTab === "video" ? "bg-white text-[#007570] shadow-xs" : "text-slate-600"
                      }`}
                    >
                      <VideoIcon size={13} />
                      Video
                    </button>
                  )}
                </div>
              </div>

              {/* Free Business Gallery Notice */}
              {!isVerifiedBusiness && (
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
                /* Video Player */
                <div className="rounded-2xl overflow-hidden bg-black aspect-16/9 flex items-center justify-center">
                  {videoMedia?.embedUrl ? (
                    <iframe
                      src={videoMedia.embedUrl}
                      title="Video Profil Usaha"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : videoMedia?.url ? (
                    <video controls src={videoMedia.url} className="w-full h-full object-cover">
                      Your browser does not support video.
                    </video>
                  ) : (
                    <p className="text-xs text-slate-400">Video tidak dapat dimuat.</p>
                  )}
                </div>
              )}
            </div>

            {/* CARD 3: PRODUCTS & SERVICES (UNIFORM COMPACT GRID) */}
            {products.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Package size={18} className="text-[#007570]" />
                      Katalog Produk &amp; Layanan ({products.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Pilihan produk unggulan dari {business.name}</p>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#007570]" />
                    <span className="text-xs font-semibold">Memuat produk...</span>
                  </div>
                ) : (
                  <>
                    <ProductCoverflowCarousel
                      sectionLabel={isPremiumBusiness ? "KATALOG PRODUK" : "PRODUK UNGGULAN"}
                      items={displayedProducts.map((product) => ({
                        img: product.image ? getStorageUrlLocal(product.image) : "https://via.placeholder.com/270x400?text=Produk",
                        titleLine1: product.name,
                        titleLine2:
                          product.price != null
                            ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                            : null,
                        desc: product.description,
                        ctaText: "Lihat Detail",
                        onCta: () => handleProductClick(product),
                      }))}
                    />

                    {/* Bisnis non-premium hanya menampilkan maksimal 3 produk.
                        Ajakan upgrade supaya semua produk bisa tampil. */}
                    {!isPremiumBusiness && products.length > 3 && (
                      <p className="text-center text-xs text-slate-500 pt-1">
                        Menampilkan 3 dari {products.length} produk.{" "}
                        <span className="text-[#007570] font-semibold">Upgrade ke Premium</span> untuk menampilkan semua produk.
                      </p>
                    )}
                  </>
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

              {/* Submit Review Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-3.5">
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
                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
                    <Loader2 size={20} className="animate-spin text-[#007570]" />
                    <span className="text-xs">Memuat ulasan...</span>
                  </div>
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
                      const d = openDays.find((od) => od.day === dayName);
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

            {/* SIDEBAR CARD 2: LOKASI, ALAMAT & MINI MAP */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={16} className="text-[#007570]" />
                  Lokasi &amp; Peta
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {business.village?.name || business.village || business.district || cityName}
                </span>
              </div>

              {/* Mini Map Container */}
              <div className="rounded-xl overflow-hidden border border-slate-200 relative h-[160px] bg-slate-100">
                {!isVerifiedBusiness ? (
                  <div className="w-full h-full relative flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-slate-100 to-slate-200">
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#007570_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                        <Lock size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-[12px] font-black text-slate-800">Peta Rute (Khusus Premium)</span>
                      <p className="text-[10.5px] text-slate-600 max-w-[220px] leading-tight">
                        Peta interaktif Leaflet aktif untuk usaha yang telah di-upgrade ke Paket Premium.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (isOwner) navigate(`/add-business/${business.id}?upgrade=true`);
                          else navigate(`/admin-user?tab=premium`);
                        }}
                        className="mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs hover:scale-105 transition-all cursor-pointer border-0"
                      >
                        BUKA PETA (UPGRADE)
                      </button>
                    </div>
                  </div>
                ) : business.latitude && business.longitude ? (
                  <MapContainer
                    center={[parseFloat(business.latitude), parseFloat(business.longitude)]}
                    zoom={15}
                    style={{ height: "160px", width: "100%" }}
                    scrollWheelZoom={false}
                    zoomControl={false}
                  >
                    <MapResizeHandler />
                    <TileLayer
                      attribution='&copy; OpenStreetMap'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[parseFloat(business.latitude), parseFloat(business.longitude)]}>
                      <Popup>{business.name}</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div
                    onClick={handleDirections}
                    className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <MapPin size={26} className="text-[#007570] mb-1 animate-bounce" />
                    <span className="text-xs font-bold text-slate-800">Buka Peta Interaktif</span>
                    <span className="text-[10px] text-slate-500">Klik untuk melihat rute di Google Maps</span>
                  </div>
                )}
              </div>

              {/* Address Text */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-semibold block">Alamat Lengkap:</span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {business.address || `${cityName}, Indonesia`}
                </p>
              </div>

              {/* Get Directions Button */}
              {!isVerifiedBusiness ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isOwner) navigate(`/add-business/${business.id}?upgrade=true`);
                    else navigate(`/admin-user?tab=premium`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock size={14} className="text-amber-600" />
                  <span>Petunjuk Arah (Khusus Premium)</span>
                </button>
              ) : (
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
                {/* Telepon - khusus Premium */}
                {isVerifiedBusiness && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                      <Phone size={14} className="text-[#007570] shrink-0" />
                      <span className="font-bold truncate">
                        {showPhone ? business.phone : `${(business.phone || "08123456789").slice(0, 4)} **** ****`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPhone(!showPhone)}
                      className="text-[#007570] font-bold text-[11px] hover:underline cursor-pointer shrink-0 border-0 bg-transparent"
                    >
                      {showPhone ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  </div>
                )}

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
              </div>
            </div>

            {/* SIDEBAR CARD 4: PROFIL PENGELOLA */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Pengelola Bisnis
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
                    {seller.username ? `@${seller.username}` : "Pemilik Profil Bisnis"}
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
                      Produk Toko
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
                    <WhatsAppIcon size={16} />
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
                  <p className="text-xs text-slate-500">Bantu kami menjaga akurasi informasi Surade.co.id</p>
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
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowWaPaymentModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl sm:max-w-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#007570] to-[#00b3ab] px-6 py-5 text-white text-center relative">
              <button
                onClick={() => setShowWaPaymentModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer border-0 transition-all"
              >
                <X size={16} />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2.5 backdrop-blur-sm shadow-inner">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-black">Pembayaran &amp; Akses Layanan Surade.co.id</h3>
              <p className="text-xs text-white/80 mt-0.5">Biaya administrasi resmi &amp; transaksi terverifikasi Surade.co.id</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Fee amount banner */}
              <div className="text-center bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl py-3.5">
                <p className="text-xs text-slate-500 font-semibold mb-0.5">Biaya Akses</p>
                <p className="text-3xl font-black text-[#007570]">
                  Rp {Number(waSettings.amount || 2000).toLocaleString("id-ID")}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Sekali bayar per akses</p>
              </div>

              {/* Instruction alert */}
              {waSettings.instruction && (
                <p className="text-xs text-slate-600 leading-relaxed text-center bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                  {waSettings.instruction}
                </p>
              )}

              {/* Coupon Code Input Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Ticket size={14} className="text-[#007570]" />
                    Kode Kupon Diskon (Opsional)
                  </label>
                  {appliedCouponInfo && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 size={11} /> Terpasang
                    </span>
                  )}
                </div>

                {/* Daftar Kupon Tersedia */}
                {!appliedCouponInfo && (
                  <div className="space-y-1.5">
                    {availableCouponsLoading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                        <Loader2 size={12} className="animate-spin text-[#007570]" />
                        <span className="text-[11px]">Memuat kupon promo...</span>
                      </div>
                    ) : availableCoupons.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {availableCoupons.map((c) => {
                          const isPercentage = c.discount_type === 'percentage';
                          const discountLabel = isPercentage 
                            ? `-${Number(c.discount_value)}%`
                            : `-Rp${Number(c.discount_value).toLocaleString('id-ID')}`;
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={async () => {
                                setCouponCode(c.code);
                                setValidatingCoupon(true);
                                setCouponMsg("");
                                const baseAmount = Number(waSettings?.amount || 0);
                                try {
                                  const res = await api.post("/coupons/validate", {
                                    code: c.code,
                                    amount: baseAmount,
                                  });
                                  const data = res.data?.data || res.data;
                                  if (data?.valid) {
                                    const discountAmt = Number(data.discount_amount ?? data.discount ?? 0);
                                    setAppliedCouponInfo(data);
                                    setCouponDiscount(discountAmt);
                                    setCouponMsg("");
                                    toast.success("Kupon berhasil! Hemat Rp " + discountAmt.toLocaleString("id-ID"));
                                  } else {
                                    setAppliedCouponInfo(null);
                                    setCouponDiscount(0);
                                    const msg = data?.message || "Kode kupon tidak valid.";
                                    setCouponMsg(msg);
                                    toast.error(msg);
                                  }
                                } catch (err) {
                                  setAppliedCouponInfo(null);
                                  setCouponDiscount(0);
                                  const msg = err.response?.data?.message || "Kode kupon tidak valid atau sudah kadaluarsa.";
                                  setCouponMsg(msg);
                                  toast.error(msg);
                                } finally {
                                  setValidatingCoupon(false);
                                }
                              }}
                              disabled={validatingCoupon}
                              className="group inline-flex items-center gap-1.5 bg-emerald-50/70 hover:bg-emerald-100/90 border border-emerald-200 hover:border-emerald-300 rounded-lg px-2.5 py-1 text-left transition-all cursor-pointer text-xs"
                              title={c.description || `Gunakan ${c.code}`}
                            >
                              <Tag size={11} className="text-emerald-700" />
                              <span className="font-mono font-extrabold text-[11px] text-slate-800">{c.code}</span>
                              <span className="text-[10px] font-bold text-emerald-700">{discountLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CONTOH: IKLAN20"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (appliedCouponInfo) {
                        setAppliedCouponInfo(null);
                        setCouponDiscount(0);
                        setCouponMsg("");
                      }
                    }}
                    disabled={!!appliedCouponInfo}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:border-[#007570] focus:ring-2 focus:ring-[#007570]/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 font-mono uppercase"
                  />
                  {appliedCouponInfo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCouponInfo(null);
                        setCouponDiscount(0);
                        setCouponCode("");
                        setCouponMsg("");
                      }}
                      className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-0 shrink-0 flex items-center gap-1"
                    >
                      <X size={13} />
                      Hapus
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={validatingCoupon || !couponCode.trim()}
                      onClick={async () => {
                        if (!couponCode.trim()) {
                          toast.error("Masukkan kode kupon terlebih dahulu");
                          return;
                        }
                        setValidatingCoupon(true);
                        setCouponMsg("");
                        const baseAmount = Number(waSettings?.amount || 0);
                        try {
                          const res = await api.post("/coupons/validate", {
                            code: couponCode.trim(),
                            amount: baseAmount,
                          });
                          const data = res.data?.data || res.data;
                          if (data?.valid) {
                            const discountAmt = Number(data.discount_amount ?? data.discount ?? 0);
                            setAppliedCouponInfo(data);
                            setCouponDiscount(discountAmt);
                            setCouponMsg("");
                            toast.success("Kupon berhasil! Hemat Rp " + discountAmt.toLocaleString("id-ID"));
                          } else {
                            setAppliedCouponInfo(null);
                            setCouponDiscount(0);
                            const msg = data?.message || "Kode kupon tidak valid.";
                            setCouponMsg(msg);
                            toast.error(msg);
                          }
                        } catch (err) {
                          setAppliedCouponInfo(null);
                          setCouponDiscount(0);
                          const msg = err.response?.data?.message || "Kode kupon tidak valid atau sudah kadaluarsa.";
                          setCouponMsg(msg);
                          toast.error(msg);
                        } finally {
                          setValidatingCoupon(false);
                        }
                      }}
                      className="px-4 py-2.5 bg-[#007570] hover:bg-[#005a58] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                    >
                      {validatingCoupon ? (
                        <><Loader2 size={13} className="animate-spin" /><span>Cek...</span></>
                      ) : (
                        "Gunakan Kupon"
                      )}
                    </button>
                  )}
                </div>

                {/* Applied coupon success banner */}
                {appliedCouponInfo && couponDiscount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs space-y-1">
                    <p className="text-green-700 font-bold flex items-center gap-1.5">
                      <span>&#x2705;</span>
                      Kupon <span className="font-black">{appliedCouponInfo.code}</span> berhasil diterapkan!
                    </p>
                    <p className="text-green-600">
                      Diskon:{" "}
                      <span className="font-bold">Rp {Number(couponDiscount).toLocaleString("id-ID")}</span>
                      {"  |  "}Bayar:{" "}
                      <span className="font-bold">
                        Rp {Math.max(0, Number(waSettings?.amount || 0) - couponDiscount).toLocaleString("id-ID")}
                      </span>
                    </p>
                    {appliedCouponInfo.description && (
                      <p className="text-green-500 italic">{appliedCouponInfo.description}</p>
                    )}
                  </div>
                )}

                {/* Error message */}
                {couponMsg && !appliedCouponInfo && (
                  <p className="text-xs text-rose-600 font-semibold">
                    &#x26A0;&#xFE0F; {couponMsg}
                  </p>
                )}
              </div>


              {/* Payment Method Selector - Standardized UI with Official Logos */}
              <div className="space-y-4">
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onSelect={(method) => setSelectedPaymentMethod(method.id)}
                  qrisImage={waSettings?.qris_image}
                  customAccount={{
                    bankName: waSettings?.bank_name,
                    accountNumber: waSettings?.account_number,
                    accountName: waSettings?.account_holder,
                  }}
                  showInstruction={true}
                />

                {/* Ringkasan Total Tagihan */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Total Biaya Akses WhatsApp</span>
                    {couponDiscount > 0 && (
                      <span className="text-[11px] text-emerald-700 font-bold">
                        Hemat Rp {Number(couponDiscount).toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-black text-[#007570]">
                    Rp {Math.max(0, Number(waSettings?.amount || 2000) - couponDiscount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Upload Proof of Payment Section */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Kirim Bukti Pembayaran:</span>
                  <span className="text-[10px] text-[#007570] font-bold">(Disarankan)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-teal-200 hover:border-[#007570] bg-teal-50/40 hover:bg-teal-50 p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-bold text-[#007570]">
                    <Upload size={16} />
                    <span>{waProofFile ? "Ganti Bukti Transfer" : "Unggah Foto Bukti Transfer"}</span>
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
                  <div className="relative mt-2 rounded-2xl overflow-hidden border border-teal-300 w-full h-32 bg-slate-900/5 flex items-center justify-center">
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
                  disabled={waSubmittingLog}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6e] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {waSubmittingLog ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <WhatsAppIcon className="w-5 h-5 text-white" />
                  )}
                  <span>
                    {waProofFile ? "Sudah Bayar & Kirim Bukti — Buka WhatsApp" : "Sudah Bayar — Buka WhatsApp"}
                  </span>
                </button>
                <button
                  onClick={() => setShowWaPaymentModal(false)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs cursor-pointer border-0 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}