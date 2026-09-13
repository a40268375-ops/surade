import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
import PackageSelectionModal from "../../components/PackageSelectionModal";
import PackageCheckoutModal from "../../components/PackageCheckoutModal";
import ContentPaymentModal from "../../components/ContentPaymentModal";
import SafeImage from "../../components/SafeImage";
import ImageCropper from "../../components/ImageCropper";
import PaymentMethodSelector from "../../components/PaymentMethodSelector";
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
  Gift,
  Wallet,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Send,
  AlertCircle,
  Sparkles,
  Store,
  ArrowRight,
  Layers,
  ExternalLink,
  Trophy,
  Award,
  Zap,
  ThumbsUp,
  Flame,
  Tag,
  Ticket,
} from "lucide-react";

import logoImg from "../../assets/logo-surade.png";

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
  const { tab: paramTab } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab) return queryTab;
    if (paramTab) return paramTab;
    if (window.location.pathname.endsWith("/inbox")) return "inbox";
    if (window.location.pathname.endsWith("/premium")) return "premium";
    return "dashboard";
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: tabId }, { replace: true });
    }
  };

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    if (queryTab) {
      setActiveTab(queryTab);
    } else if (paramTab) {
      setActiveTab(paramTab);
    } else if (window.location.pathname.endsWith("/inbox")) {
      setActiveTab("inbox");
    } else if (window.location.pathname.endsWith("/premium")) {
      setActiveTab("premium");
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams, paramTab]);
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
          location: user.location || "",
          role: user.role || "User",
          bio: user.bio || "",
          avatar: avatarUrl,
          banner: bannerUrl,
        });
        
        setPhotoPreview(avatarUrl);
        setBannerPreview(bannerUrl);
        setDisplayName(user.username || user.name || "");
        
        console.log("Profile data synced:", { avatarUrl, bannerUrl, name: user.name });
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
      const cached = localStorage.getItem("cached_my_businesses");
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(b => ({
        ...b,
        category: getCategoryDisplayName(b.category),
        opening_hours: formatBizOpeningHours(b)
      }));
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
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "mandiri", name: "Bank Mandiri", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/200px-Bank_Mandiri_logo_2016.svg.png", account_number: "133-0011-409-331", account_holder: "Triwala Mitra Bestari" },
    { id: "bni", name: "Bank BNI", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/200px-BNI_logo.svg.png", account_number: "0973607008", account_holder: "Triwala Mitra Bestari" },
    { id: "bca", name: "Bank BCA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/200px-Bank_Central_Asia.svg.png", account_number: "0954152045", account_holder: "Triwala Mitra Bestari" },
    { id: "maybank", name: "Maybank", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Maybank_Logo.svg/200px-Maybank_Logo.svg.png", account_number: "2097000009", account_holder: "Triwala Mitra Bestari" },
    { id: "bjb", name: "Bank BJB", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/2/27/Bank_bjb_logo.svg/200px-Bank_bjb_logo.svg.png", account_number: "0119213282001", account_holder: "Triwala Mitra Bestari" },
    { id: "ovo", name: "OVO", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/200px-Logo_ovo_purple.svg.png", account_number: "0811-1919-711", account_holder: "Triwala Mitra Bestari" },
    { id: "dana", name: "DANA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/200px-Logo_dana_blue.svg.png", account_number: "XXX", account_holder: "Triwala Mitra Bestari" },
    { id: "gopay", name: "GoPay", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/200px-Gopay_logo.svg.png", account_number: "XXX", account_holder: "Triwala Mitra Bestari" },
  ]);

  const getPaymentNumber = (method) => {
    if (!method) return '0954152045';
    const m = String(method).toLowerCase();
    if (m.includes('mandiri')) return '133-0011-409-331';
    if (m.includes('bni')) return '0973607008';
    if (m.includes('bca')) return '0954152045';
    if (m.includes('maybank')) return '2097000009';
    if (m.includes('bjb')) return '0119213282001';
    if (m.includes('ovo')) return '0811-1919-711';
    if (m.includes('dana') || m.includes('gopay') || m.includes('shopee')) return 'XXX (Belum Terdaftar)';
    return '0954152045';
  };

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
      biz.banner ||
      biz.logo ||
      biz.image ||
      biz.thumbnail ||
      (biz.media && biz.media.length > 0 ? biz.media[0].file_path : null) ||
      biz.raw?.banner ||
      biz.raw?.logo ||
      biz.raw?.image ||
      (biz.raw?.media && biz.raw.media.length > 0 ? biz.raw.media[0].file_path : null);

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

  const getSelectedPackagePrice = () => {
    if (!selectedPackage) return 0;
    const found = getSelectedPackageObj();
    if (found && found.price) return Number(found.price);
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('basic')) return 50000;
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('standard')) return 150000;
    if (typeof selectedPackage === 'string' && selectedPackage.toLowerCase().includes('premium')) return 350000;
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
  const [reviewsError, setReviewsError] = useState("");
  const [resellers, setResellers] = useState([]);

  // States for Referral Feature

  const [referralSearch, setReferralSearch] = useState("");
  const [referralStatusFilter, setReferralStatusFilter] = useState("all");
  const [referralPage, setReferralPage] = useState(1);
  const [referralCopyToast, setReferralCopyToast] = useState(false);
  const [referralLinkCopyToast, setReferralLinkCopyToast] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    bank: "BCA",
    accountNumber: "",
    accountHolder: user?.name || "",
    amount: "50000",
  });
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
          if (parsed && parsed.referral_code) {
            return parsed;
          }
        }
      }
    } catch (e) {}

    // Instant deterministic code for current logged-in user so it renders in 0ms
    const cleanName = (user?.name || "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    const instantCode = user?.referral_code || (user?.id ? `INFO-${cleanName}-${user.id}` : "");

    return {
      referral_code: instantCode,
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
    } catch (e) {}
    return [];
  });
  const [referralWithdrawals, setReferralWithdrawals] = useState(() => {
    try {
      if (user?.id) {
        const cached = localStorage.getItem(`cached_referral_wd_${user.id}`);
        if (cached) return JSON.parse(cached);
      }
    } catch (e) {}
    return [];
  });
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState("");

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
        const cleanName = (user?.username || user?.name || "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const finalCode = data.referral_code || user?.referral_code || (user?.id ? `INFO-${cleanName}-${user.id}` : "");

        const newStats = {
          referral_code: finalCode,
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

          // Sync into user object in localStorage if referral_code was missing
          if (finalCode && user.referral_code !== finalCode) {
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

  const cleanCurrentName = (user?.username || user?.name || "USER").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const currentFallbackCode = user?.id ? `INFO-${cleanCurrentName}-${user.id}` : "INFO-REF";
  const referralCode = referralStats.referral_code || user?.referral_code || currentFallbackCode;
  const totalReferralEarnings = referralStats.earned_commission;
  const availableReferralBalance = referralStats.available_balance !== undefined ? referralStats.available_balance : Math.max(0, totalReferralEarnings - referralStats.paid_commission);
  const pendingReferralEarnings = referralStats.pending_commission;
  const paidReferralEarnings = referralStats.paid_commission;
  const totalReferralUsage = referralStats.total_usages;
  const successReferralCount = referralStats.successful_referrals;

  const promoTemplates = useMemo(() => {
    const code = referralCode;
    const link = `${window.location.origin}/register?ref=${code}`;
    return {
      diskon: `🎉 *PROMO DISKON Rp 5.000 SURADE.CO.ID!* 🎉\n\nDapatkan potongan Rp 5.000 saat mendaftar atau membeli Paket Premium Usaha di Surade.co.id!\n\nGunakan kode referral saya: *${code}*\natau klik link langsung: ${link}\n\nSolusi terbaik mempromosikan bisnis UMKM di Surade! 🚀`,
      bisnis: `💼 *TINGKATKAN PENJUALAN USAHA ANDA DI SURADE!* 💼\n\nIngin toko/jasa Anda tampil teratas & mendapat badge verified? Daftar sekarang dan nikmati bonus hemat Rp 5.000 dengan kode promo: *${code}*\n\nDaftar instan di sini: ${link}\nMari sukseskan bisnis lokal bersama! 💥`,
      heboh: `🔥 *PENAWARAN SPESIAL TERBATAS!* 🔥\n\nGunakan kode referral *${code}* saat checkout Paket Premium Surade.co.id untuk klaim cashback/diskon Rp 5.000!\n\nLink promo: ${link}\nSiapa cepat dia dapat! 👍`,
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
      const matchesSearch =
        !q ||
        (tx.id && tx.id.toLowerCase().includes(q)) ||
        (tx.userName && tx.userName.toLowerCase().includes(q)) ||
        (tx.service && tx.service.toLowerCase().includes(q)) ||
        (tx.businessName && tx.businessName.toLowerCase().includes(q));

      const matchesStatus =
        referralStatusFilter === "all" ||
        (referralStatusFilter === "success" && (tx.status === "approved" || tx.status === "earned" || tx.status === "paid" || tx.status === "success")) ||
        (referralStatusFilter === "pending" && tx.status === "pending") ||
        (referralStatusFilter === "cancelled" && tx.status === "cancelled");

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

  /* ── Real Inbox / Chat States & Handlers ── */
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

  // Persistent Cache for Messages to ensure 0ms instant loading & zero flickering
  const chatMessagesCacheRef = useRef({});

  // Sync activeConversationId from searchParams when URL changes
  useEffect(() => {
    const convParam = searchParams.get("conversation");
    if (convParam) {
      setActiveConversationId(convParam);
    } else {
      setActiveConversationId(null);
      setActiveChatData(null);
    }
  }, [searchParams]);

  // Fetch Conversations List
  const fetchConversationsList = async (showLoading = false) => {
    if (showLoading && conversations.length === 0) setLoadingConversations(true);
    try {
      const res = await api.get("/inbox");
      if (res.data && res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
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

    // Hydrate activeChatData immediately with zero delay
    if (!isPoll) {
      setActiveChatData((prev) => {
        if (prev && String(prev.id) === String(convId) && prev.messages && prev.messages.length > 0) {
          return prev;
        }

        if (foundConv) {
          return {
            id: foundConv.id,
            conversation_id: foundConv.id,
            business_id: foundConv.business_id,
            business: { id: foundConv.business_id, name: foundConv.business_name, logo: foundConv.business_logo },
            counterparty_name: foundConv.counterparty_name,
            counterparty_avatar: foundConv.counterparty_avatar,
            counterparty_role: foundConv.counterparty_role,
            messages: cachedMessages,
          };
        }

        return prev;
      });

      if (showLoading && cachedMessages.length === 0 && (!activeChatData?.messages || activeChatData.messages.length === 0)) {
        setLoadingChatDetails(true);
      }
    }

    try {
      const currentMsgs = chatMessagesCacheRef.current[convId] || activeChatData?.messages || [];
      const latestRealMsg = [...currentMsgs].reverse().find(m => m && m.id && !String(m.id).startsWith("temp-"));
      const latestMsgId = latestRealMsg ? latestRealMsg.id : null;

      const url = (isPoll && latestMsgId)
        ? `/inbox/${convId}?after_id=${latestMsgId}`
        : `/inbox/${convId}?limit=30`;

      const res = await api.get(url);
      if (res.data && res.data.success) {
        const fetchedData = res.data.data;
        const newMessages = fetchedData.messages || [];

        if (isPoll && latestMsgId) {
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
          chatMessagesCacheRef.current[convId] = newMessages;
          setActiveChatData(fetchedData);
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
      console.error("Failed to fetch active chat details:", err);
    } finally {
      if (showLoading) setLoadingChatDetails(false);
    }
  };

  // On tab switch to inbox: fetch list
  useEffect(() => {
    if (activeTab === "inbox") {
      fetchConversationsList(conversations.length === 0);
    }
  }, [activeTab]);

  // On activeConversationId or activeTab change: fetch active chat
  useEffect(() => {
    if (activeTab === "inbox" && activeConversationId) {
      fetchActiveChatDetails(activeConversationId, true);
    } else if (activeTab !== "inbox") {
      setActiveChatData(null);
    }
  }, [activeTab, activeConversationId]);

  // Background sync every 10 seconds when Inbox tab is active and document is visible
  useEffect(() => {
    if (activeTab !== "inbox") return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchConversationsList(false);
      if (activeConversationId) {
        fetchActiveChatDetails(activeConversationId, false, true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, activeConversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChatData?.messages?.length]);

  // Calculate Total Unread Messages for sidebar badge & header count
  const totalInboxUnreadCount = useMemo(() => {
    return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  }, [conversations]);

  // Filtered conversations by search query
  const filteredConversations = useMemo(() => {
    if (!inboxSearchQuery.trim()) return conversations;
    const q = inboxSearchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.business_name && c.business_name.toLowerCase().includes(q)) ||
        (c.counterparty_name && c.counterparty_name.toLowerCase().includes(q)) ||
        (c.last_message && c.last_message.toLowerCase().includes(q))
    );
  }, [conversations, inboxSearchQuery]);

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

  // True Optimistic UI Message Sender
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !activeConversationId || sendingChatMessage) return;

    const messageText = chatMessageInput.trim();
    const tempId = "temp-" + Date.now();
    setChatMessageInput("");
    setSendingChatMessage(true);

    const optimisticMessage = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: user.id,
      message: messageText,
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
      return {
        ...prev,
        messages: updatedMessages,
      };
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
      const res = await api.post(`/inbox/${activeConversationId}/messages`, {
        message: messageText,
      });

      if (res.data && res.data.success) {
        const savedMessage = { ...res.data.data, status: "sent" };
        setActiveChatData((prev) => {
          if (!prev) return prev;
          const updatedMessages = (prev.messages || []).map((m) =>
            m.id === tempId ? savedMessage : m
          );
          chatMessagesCacheRef.current[activeConversationId] = updatedMessages;
          return {
            ...prev,
            messages: updatedMessages,
          };
        });
      }
    } catch (err) {
      console.error("Failed to send chat message:", err);
      setActiveChatData((prev) => {
        if (!prev) return prev;
        const updatedMessages = (prev.messages || []).map((m) =>
          m.id === tempId ? { ...m, status: "failed" } : m
        );
        chatMessagesCacheRef.current[activeConversationId] = updatedMessages;
        return {
          ...prev,
          messages: updatedMessages,
        };
      });
    } finally {
      setSendingChatMessage(false);
    }
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
        setUpgradeReferralSuccessMsg(res.data.message || "Kode referral valid! Diskon Rp 5.000 berhasil diterapkan.");
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
      if (file.size > 10 * 1024 * 1024) {
        setUpgradeError("Ukuran file bukti pembayaran maksimal 10MB.");
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
    if (!isUpgradeResubmit && !upgradeProofFile) {
      setUpgradeError("Wajib mengunggah bukti pembayaran sebelum mengirim permohonan.");
      return;
    }

    setSubmittingUpgrade(true);
    setUpgradeError("");

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
          title: "Selamat datang di Portal Surade.co.id",
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
      console.log('[AdminUser] Cleared businesses cache');
    } catch (e) {}
    
    setLoadingBusinesses(true);
    setBusinessFetchError(null);
    try {
      console.log("Fetching businesses...");
      // Add timestamp to bypass cache
      const res = await api.get(`/my-businesses?_t=${Date.now()}`);
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
            is_premium: Boolean(b.is_premium),
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
        console.log("Mapped businesses:", mapped);
        setBusinesses(mapped);
        if (mapped.length > 0) {
          setSelectedBusinessForProducts((prev) => {
            if (prev && mapped.some(b => String(b.id) === String(prev))) return prev;
            return mapped[0].id;
          });
        }
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

  // Fetch advertisements from API
  const fetchAdvertisements = async () => {
    setLoadingAdvertisements(true);
    try {
      const res = await api.get("/my-advertisements");
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data?.data || []);
      setAdvertisements(list);
      if (res.data?.stats) {
        setAdStats(res.data.stats);
      } else {
        setAdStats({
          total_ads: list.length,
          active_ads: list.filter(a => (a.computed_status || a.status) === 'active' || (a.computed_status || a.status) === 'approved').length,
          pending_payment: list.filter(a => (a.computed_status || a.payment_status) === 'pending_payment' || a.payment_status === 'unpaid').length,
          waiting_approval: list.filter(a => (a.computed_status || a.payment_status) === 'waiting_approval' || (a.payment_status === 'pending' && a.status === 'pending')).length,
          expired_ads: list.filter(a => (a.computed_status || a.status) === 'expired').length,
          rejected_ads: list.filter(a => (a.computed_status || a.status) === 'rejected').length,
          total_spending: list.filter(a => a.payment_status === 'paid' || a.status === 'approved').reduce((acc, curr) => acc + Number(curr.price || 0), 0)
        });
      }
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
      } catch (e) {}
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
        } catch (e) {}
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
    // Clear stale cache on mount
    try {
      const keys = Object.keys(localStorage);
      const userKeys = keys.filter(k => k.startsWith('cached_my_'));
      userKeys.forEach(key => localStorage.removeItem(key));
      console.log('[AdminUser Mount] Cleared', userKeys.length, 'cache entries');
    } catch (e) {}

    if (activeTab === "dashboard") {
      fetchUserStats();
    } else if (activeTab === "bisnis") {
      fetchBusinesses();
    } else if (activeTab === "paket-premium") {
      // Admin only - manage premium plans
      fetchAdminPlans();
    } else if (activeTab === "iklan") {
      fetchAdvertisements();
      fetchAdPackages();
      fetchBusinesses();
      fetchAvailableCoupons();
    } else if (activeTab === "blog-event") {
      fetchBlogs();
      fetchEvents();
    } else if (activeTab === "simpan") {
      fetchSavedItems();
    } else if (activeTab === "inbox") {
      fetchConversationsList(conversations.length === 0);
    } else if (activeTab === "premium") {
      fetchPremiumPlans();
      fetchBusinesses();
    } else if (activeTab === "produk") {
      fetchBusinesses();
    } else if (activeTab === "ulasan") {
      fetchMyRatings();
    } else if (activeTab === "referral" || activeTab === "reseller") {
      fetchReferralStats();
    }
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

  const handleOpenCreateAdModal = () => {
    setSelectedBusinessForAd(businesses.length > 0 ? businesses[0].id : null);
    setSelectedPackage(adPackages.length > 0 ? (adPackages[0].name || adPackages[0].id) : null);
    setAdNotes('');
    setCouponCodeInput('');
    setAppliedCouponInfo(null);
    setCouponMsg('');
    setSelectedPaymentMethod('Transfer Bank BCA');
    setAdPaymentProofFile(null);
    setAdPaymentProofPreview(null);
    setCreateAdStep(1);
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
    if (!selectedBusinessForAd) {
      alert('Pilih bisnis yang ingin diiklankan');
      return;
    }
    if (!selectedPackage) {
      alert('Pilih paket iklan');
      return;
    }

    setSubmittingAd(true);
    try {
      const formData = new FormData();
      formData.append('business_id', selectedBusinessForAd);

      const pkgObj = getSelectedPackageObj();
      if (pkgObj && pkgObj.id) {
        formData.append('ad_package_id', pkgObj.id);
        formData.append('package_name', pkgObj.name);
      } else {
        formData.append('package_name', typeof selectedPackage === 'string' ? selectedPackage : 'Standard Iklan');
      }

      const finalPrice = getFinalPrice();
      formData.append('price', finalPrice);

      if (appliedCouponInfo && appliedCouponInfo.code) {
        formData.append('coupon_code', appliedCouponInfo.code);
      }

      formData.append('payment_method', selectedPaymentMethod);

      if (adPaymentProofFile) {
        formData.append('payment_proof', adPaymentProofFile);
      }

      if (adNotes) {
        formData.append('notes', adNotes);
      }

      await api.post('/advertisements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Iklan berhasil diajukan! ' + (adPaymentProofFile ? 'Bukti pembayaran telah dikirim dan menunggu konfirmasi admin.' : 'Silakan lakukan pembayaran.'));
      setShowCreateAdModal(false);
      setCreateAdStep(1);
      setSelectedBusinessForAd(null);
      setSelectedPackage(null);
      setAdNotes('');
      setCouponCodeInput('');
      setAppliedCouponInfo(null);
      setCouponMsg('');
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
        amount: basePrice
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
    console.log("🔄 Fetching user profile from API...");
    
    try {
      const res = await api.get("/user/profile");
      const userData = res.data?.data || res.data;
      
      console.log("📥 API Response:", userData);
      
      if (userData) {
        const avatarUrl = userData.avatar ? getStorageUrl(userData.avatar) : DEFAULT_AVATAR;
        const bannerUrl = userData.banner ? getStorageUrl(userData.banner) : DEFAULT_BANNER;
        
        console.log("🖼️ Generated URLs:", { 
          avatarUrl, 
          bannerUrl,
          originalAvatar: userData.avatar,
          originalBanner: userData.banner 
        });
        
        const profileObj = {
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          role: userData.role || "User",
          bio: userData.bio || "",
          avatar: avatarUrl,
          banner: bannerUrl,
        };
        
        console.log("💾 Setting profile data:", profileObj);
        
        setProfileData(profileObj);
        setPhotoPreview(avatarUrl);
        setBannerPreview(bannerUrl);
        setDisplayName(userData.username || userData.name || "");
        
        // Update user state with new data
        const userObj = { 
          ...user,
          ...userData, 
          avatar: avatarUrl, 
          banner: bannerUrl 
        };
        
        console.log("👤 Updating user state:", userObj);
        
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        
        // Trigger a re-render for all components that depend on user data
        window.dispatchEvent(new Event("userAuthChanged"));
        
        console.log("✅ Profile data updated successfully");
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
      alert("Bisnis berhasil diperbarui!");
    } catch (err) {
      console.error("Failed to update business:", err);
      alert(err.response?.data?.message || "Gagal memperbarui bisnis.");
    } finally {
      setSavingBusiness(false);
    }
  };

  // ========== BLOG/EVENT EDIT FUNCTIONS ==========
  
  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogEditForm({
      title: blog.title || "",
      content: blog.content || "",
      blog_category: blog.blog_category || "",
    });
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
    if (!confirm("Apakah Anda yakin ingin menghapus bisnis ini?")) {
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
      
      alert("Bisnis berhasil dihapus!");
    } catch (err) {
      console.error("Failed to delete business:", err);
      const msg = err?.response?.data?.message || "Gagal menghapus bisnis.";
      alert(msg);
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
      try {
        await api.delete(`/events/${id}`);
      } catch (err) {
        await api.delete(`/blogs/${id}`);
      }
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
    
    console.log("🚀 Starting profile save...", {
      profileData,
      hasProfilePhoto: !!profilePhoto,
      hasProfileBanner: !!profileBanner
    });

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", profileData.name || "");
      formData.append("email", profileData.email || "");
      formData.append("phone", profileData.phone || "");
      formData.append("location", profileData.location || "");
      formData.append("bio", profileData.bio || "");

      if (profilePhoto) {
        formData.append("avatar", profilePhoto);
        console.log("📷 Uploading new avatar:", profilePhoto.name);
      } else if (removeAvatarFlag) {
        formData.append("remove_avatar", "true");
        console.log("🗑️ Removing avatar");
      }

      if (profileBanner) {
        formData.append("banner", profileBanner);
        console.log("🖼️ Uploading new banner:", profileBanner.name);
      } else if (removeBannerFlag) {
        formData.append("remove_banner", "true");
        console.log("🗑️ Removing banner");
      }

      console.log("📤 Sending profile update to API...");
      const res = await api.post("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📥 Save response:", res.data);
      
      const updatedUser = res.data?.data || res.data?.user || res.data;
      const successMsg = res.data?.message || "✅ Profil berhasil diperbarui!";

      if (!updatedUser) {
        throw new Error("No user data in response");
      }

      // Update profile data immediately with response data
      const newAvatarUrl = updatedUser.avatar ? getStorageUrl(updatedUser.avatar) : DEFAULT_AVATAR;
      const newBannerUrl = updatedUser.banner ? getStorageUrl(updatedUser.banner) : DEFAULT_BANNER;
      
      console.log("🔄 Updating UI with new data:", { newAvatarUrl, newBannerUrl });
      
      setProfileData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
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

      console.log("✅ Profile save successful, data updated immediately");
      
      // Force a complete profile refresh after a delay to ensure consistency
      setTimeout(async () => {
        console.log("🔄 Force refreshing profile data from server...");
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
      case "referral":
      case "reseller":
        return { title: "Program Referral", desc: "Kelola kode referral Anda, pantau pendapatan komisi, penggunaan kode, dan riwayat transaksi." };
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
        return { title: "Panel Admin User", desc: "Halaman administrator portal Surade.co.id" };
    }
  };

  const pageInfo = getPageInfo();

  // Sidebar Menu list configured based on request
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "bisnis", name: "Bisnis", icon: Briefcase },
    { id: "blog-event", name: "Blog & Event", icon: FileText },
    // Admin only menu
    ...(user?.role === 'admin' ? [
      { id: "paket-premium", name: "Paket Premium", icon: Crown }
    ] : []),
    { id: "inbox", name: totalInboxUnreadCount > 0 ? `Inbox (${totalInboxUnreadCount})` : "Inbox", icon: Mail },
    { id: "referral", name: "Referral", icon: Share2 },
    { id: "premium", name: "Premium", icon: Crown },
    { id: "iklan", name: "Iklan", icon: Megaphone },
    { id: "produk", name: "Produk", icon: Package },
    { id: "simpan", name: "Simpan", icon: Bookmark },
    { id: "ulasan", name: "Ulasan", icon: Star }
  ];

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-['Poppins',sans-serif] text-[#0f172a]">
      {/* ── Collapsible Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen ${isCollapsed ? "w-[68px]" : "w-[240px]"} bg-gradient-to-b from-[#0b6b45] via-[#0a5c3c] to-[#083d28] flex flex-col z-[200] transition-[width] duration-[280ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] overflow-hidden border-r border-[rgba(255,255,255,0.08)]`}>
        <div className="flex items-center justify-between p-[16px_14px_14px] border-b border-[rgba(255,255,255,0.07)] shrink-0">
          <div className="flex items-center gap-[10px] overflow-hidden flex-1 min-w-0">
            {/* branding surade.co.id */}
            {!isCollapsed && (
              <img src={logoImg} alt="Surade.co.id" className="h-[28px] w-auto shrink-0" />
            )}
            <div className={`flex flex-col gap-[3px] min-w-0 transition-all duration-[280ms] ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : ""}`}>
              <span className="text-[15px] font-bold text-white whitespace-nowrap leading-none">Surade.co.id</span>
              <span className="bg-[rgba(255,255,255,0.18)] border border-[rgba(255,255,255,0.30)] text-[#a7f3d0] text-[0.62rem] px-[7px] py-[2px] rounded-[6px] font-bold whitespace-nowrap w-fit">User</span>
            </div>
          </div>
          <div className="shrink-0 w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[#6ee7b7] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(255,255,255,0.08)] hover:text-white" onClick={() => setIsCollapsed(!isCollapsed)}>
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
                <div className={`flex items-center gap-[12px] px-[12px] py-[10px] rounded-[10px] cursor-pointer transition-all duration-[280ms] whitespace-nowrap ${isActive ? "bg-white text-[#0a5c3c] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.18)]" : "text-[rgba(255,255,255,0.82)] hover:bg-[rgba(255,255,255,0.10)] hover:text-white"}`} onClick={() => handleTabChange(item.id)}>
                  <Icon className="shrink-0" size={20} />
                  <span className={`text-[13.5px] font-medium whitespace-nowrap transition-all duration-[280ms] overflow-hidden ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : ""}`}>{item.name}</span>
                </div>
                <span className={`absolute left-[76px] top-1/2 -translate-y-1/2 bg-[#083d28] text-white text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 ${isCollapsed ? "group-hover:opacity-100" : ""} transition-opacity duration-150 z-[300] before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-[5px] before:border-transparent before:border-r-[#083d28]`}>{item.name}</span>
              </li>
            );
          })}
        </ul>

        {/* Back to Website Button */}
        <div className="p-[8px_8px_4px] shrink-0">
          <Link to="/" className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[10px] bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.25)] text-white text-[13px] font-medium font-['Poppins',sans-serif] overflow-hidden whitespace-nowrap transition-all duration-[280ms] hover:bg-[rgba(255,255,255,0.22)] hover:border-[rgba(255,255,255,0.4)]" title="Kembali ke Website">
            <Home size={18} className="shrink-0" />
            <span className={`transition-all duration-[280ms] overflow-hidden whitespace-nowrap ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : ""}`}>Kembali ke Website</span>
          </Link>
        </div>

        {/* Profile Footer Section */}
        <div className="flex items-center justify-between p-[12px_10px] border-t border-[rgba(255,255,255,0.07)] gap-[8px] shrink-0 overflow-hidden">
          <div className="flex items-center gap-[10px] flex-1 min-w-0 rounded-[8px] p-[4px_6px] transition-all duration-[280ms] hover:bg-[rgba(255,255,255,0.07)] cursor-pointer" onClick={() => handleTabChange("profile")}>
            <SafeImage 
              src={profileData.avatar || photoPreview || DEFAULT_AVATAR} 
              alt="Profile" 
              className="w-[36px] h-[36px] rounded-full object-cover shrink-0 border-2 border-[rgba(0,117,112,0.5)]"
              fallback={DEFAULT_AVATAR}
              onError={(e) => {
                console.warn("Sidebar avatar failed to load:", e.currentTarget.src);
              }}
            />
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
      <main className={`flex-1 min-h-screen min-w-0 max-w-full flex flex-col transition-all duration-[280ms] overflow-x-hidden ${isCollapsed ? "ml-[68px]" : "ml-[240px]"}`}>
        <header className="sticky top-0 z-[100] flex items-center justify-between px-[28px] max-md:px-[16px] h-[60px] bg-white/85 backdrop-blur-md border-b border-[#e2e8f0] gap-[16px]">
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold text-[#0f172a] leading-[1.2] truncate">{pageInfo.title}</h1>
            <p className="text-[12px] text-[#64748b] mt-[1px] truncate">{pageInfo.desc}</p>
          </div>
          <div className="flex items-center gap-[14px] shrink-0">
            <div className="flex items-center gap-[8px] p-[6px_12px_6px_6px] rounded-full bg-[#f1f5f9] text-[13px] text-[#64748b] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(0,117,112,0.12)]" onClick={() => handleTabChange("profile")}>
              <SafeImage
                src={profileData.avatar}
                alt="user avatar"
                className="w-[24px] h-[24px] rounded-full object-cover"
                fallback={DEFAULT_AVATAR}
              />
              <span className="truncate max-w-[140px]">
                Halo, <strong>{displayName}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Active Page View Container */}
        <section className="flex-1 min-w-0 max-w-full p-[24px_28px] max-md:p-[16px] overflow-y-auto overflow-x-hidden">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="w-full max-w-full min-w-0 flex flex-col gap-[20px]">
              {/* Stats Cards — Compact 4-column row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] sm:gap-[14px] w-full min-w-0">
                <div className="bg-white border border-[#e2e8f0] rounded-[11px] p-[12px_16px] flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-[250ms] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] cursor-pointer min-w-0" onClick={() => setActiveTab("bisnis")}>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-[2px] truncate">Total Bisnis</h3>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0f172a] leading-tight mb-[3px]">{userStats ? userStats.total_businesses : businesses.length}</div>
                    <div className="flex items-center gap-[3px] text-[10.5px] font-medium text-[#10b981] truncate">
                      <TrendingUp size={11} className="shrink-0" /> <span className="truncate">{userStats ? `${userStats.total_business_views} views` : "Bisnis Terdaftar"}</span>
                    </div>
                  </div>
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0 bg-[#eff6ff] text-[#3b82f6]">
                    <Briefcase size={18} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[11px] p-[12px_16px] flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-[250ms] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] cursor-pointer min-w-0" onClick={() => setActiveTab("blog-event")}>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-[2px] truncate">Total Event / Blog</h3>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0f172a] leading-tight mb-[3px]">{userStats ? ((userStats.total_events || 0) + (userStats.total_blogs || 0)) : events.length}</div>
                    <div className="flex items-center gap-[3px] text-[10.5px] font-medium text-[#10b981] truncate">
                      <TrendingUp size={11} className="shrink-0" /> <span className="truncate">{userStats ? `${userStats.total_blog_views || 0} views` : "Blog & Event"}</span>
                    </div>
                  </div>
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0 bg-[#f0fdf4] text-[#10b981]">
                    <Calendar size={18} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[11px] p-[12px_16px] flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-[250ms] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] cursor-pointer min-w-0" onClick={() => setActiveTab("ulasan")}>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-[2px] truncate">Total Ulasan</h3>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0f172a] leading-tight mb-[3px]">{userStats ? userStats.total_reviews : reviews.length}</div>
                    <div className="flex items-center gap-[3px] text-[10.5px] font-medium text-[#10b981] truncate">
                      <TrendingUp size={11} className="shrink-0" /> <span className="truncate">Ulasan Usaha</span>
                    </div>
                  </div>
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0 bg-[#fef9c3] text-[#ca8a04]">
                    <Star size={18} />
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-[11px] p-[12px_16px] flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-[250ms] hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] cursor-pointer min-w-0" onClick={() => setShowChartDetailModal(true)}>
                  <div className="min-w-0 pr-2">
                    <h3 className="text-[10px] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-[2px] truncate">Total Views Konten</h3>
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0f172a] leading-tight mb-[3px] truncate">{userStats ? userStats.total_views.toLocaleString("id-ID") : 0}</div>
                    <div className="flex items-center gap-[3px] text-[10.5px] font-medium text-[#10b981] truncate">
                      <TrendingUp size={11} className="shrink-0" /> <span className="truncate">Bisnis & Blog</span>
                    </div>
                  </div>
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0 bg-[#f0fdfa] text-[#059669]">
                    <Eye size={18} />
                  </div>
                </div>
              </div>

              {/* Graphical & Activity Panels — 12-column responsive layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px] w-full min-w-0">
                {/* 1. KUNJUNGAN PORTAL MINGGUAN CHART PANEL */}
                <div className="lg:col-span-5 bg-white rounded-[14px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-[20px] flex flex-col justify-between min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-[16px] gap-2">
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-bold text-[#0f172a] truncate">Kunjungan Portal Mingguan</h2>
                      <p className="text-[11.5px] text-[#64748b] mt-[2px] truncate">Statistik kunjungan minggu ini</p>
                    </div>
                    <button
                      onClick={() => setShowChartDetailModal(true)}
                      className="text-[12px] font-semibold text-[#059669] cursor-pointer px-[10px] py-[4px] rounded-[8px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa] shrink-0"
                    >
                      Lihat Detail
                    </button>
                  </div>

                  <div className="flex items-end gap-[8px] sm:gap-[10px] h-[160px] pt-[10px] w-full min-w-0">
                    {weeklyChartStats.chartData.map((d) => (
                      <div key={d.day} className="flex-1 min-w-0 flex flex-col items-center gap-[6px] h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-[6px] bg-[#0f172a] text-white text-[10px] font-medium px-[7px] py-[3px] rounded-[4px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-sm">
                          {d.visits.toLocaleString('id-ID')}
                        </div>
                        <div
                          className="w-full bg-gradient-to-b from-[#007570] to-[#00a8a2] rounded-t-[5px] min-h-[6px] transition-all duration-[280ms] group-hover:opacity-85"
                          style={{ height: d.heightPercentage }}
                        ></div>
                        <span className="text-[10.5px] text-[#64748b] font-medium group-hover:text-[#059669] transition-colors truncate">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. AKTIVITAS TERBARU PANEL */}
                <div className="lg:col-span-7 bg-white rounded-[14px] border border-[#e2e8f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-[20px] flex flex-col justify-between min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-[16px] gap-2">
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-bold text-[#0f172a] truncate">Aktivitas Terbaru</h2>
                      <p className="text-[11.5px] text-[#64748b] mt-[2px] truncate">Aktivitas konten usaha, blog & event terkini</p>
                    </div>
                    <button
                      onClick={() => setShowAllActivitiesModal(true)}
                      className="text-[12px] font-semibold text-[#059669] cursor-pointer px-[10px] py-[4px] rounded-[8px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa] shrink-0"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="flex flex-col gap-[10px] min-w-0">
                    {recentActivitiesList.slice(0, 4).map((act) => {
                      const IconComp = act.icon;
                      return (
                        <div
                          key={act.id}
                          className="flex gap-[12px] items-center p-[8px_10px] rounded-[10px] transition-colors hover:bg-[#f8fafc] cursor-pointer min-w-0 overflow-hidden"
                          onClick={() => {
                            if (act.link) navigate(act.link);
                            else if (act.tab) setActiveTab(act.tab);
                          }}
                        >
                          <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 ${act.colorClass}`}>
                            <IconComp size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-semibold text-[#0f172a] truncate">
                              {act.title}
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-[1px] truncate">
                              {act.subText} • <span className="font-semibold text-[#059669]">{act.dateStr}</span>
                            </div>
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
              <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-[24px_28px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px]">
                <div className="space-y-[4px] z-10">
                  <h2 className="text-[20px] md:text-[22px] font-extrabold tracking-tight flex items-center gap-[10px]">
                    <Briefcase className="text-[#5eead4]" size={24} />
                    Kelola Bisnis Saya
                  </h2>
                  <p className="text-[13px] text-slate-300 max-w-[640px] font-normal leading-relaxed">
                    Daftar seluruh profil bisnis dan usaha yang Anda miliki di portal Surade.co.id. Atur informasi, kategori, dan produk usaha Anda di sini.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/add-business")}
                  className="w-full md:w-auto h-[42px] inline-flex items-center justify-center gap-[8px] bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-[20px] rounded-[11px] font-bold text-[13px] transition-all shadow-sm shrink-0 cursor-pointer"
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
                  <div className="flex flex-col items-center justify-center py-[60px] gap-[10px] text-[#64748b]">
                    <Loader2 className="animate-spin text-[#059669]" size={32} />
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
                              <th className="px-3.5 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[35%]">Bisnis &amp; Kategori</th>
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
                              const isPrem = Boolean(biz.is_premium || biz.raw?.is_premium || biz.raw?.features?.is_premium);
                              const subs = biz.subscriptions || biz.raw?.subscriptions || [];
                              const latestSub = subs[0];
                              const isPendingSub = biz.has_pending_subscription || (latestSub?.status === "pending" && latestSub?.payment?.status === "pending");

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
                                          {isPrem ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                                              <Crown size={10} className="text-amber-600 shrink-0" />
                                              <span>Premium</span>
                                            </span>
                                          ) : isPendingSub || (latestSub?.plan && Number(latestSub.plan.price) > 0) ? (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold bg-amber-100 text-amber-900 border border-amber-400 shrink-0" title="Paket Premium sedang diverifikasi admin">
                                              <Crown size={10} className="text-amber-700 shrink-0" />
                                              <span>{latestSub?.plan?.name || "Premium"} (Menunggu)</span>
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/add-business/${biz.id}?upgrade=true`);
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
                                          )}
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
                                        {isRejected && (
                                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold text-rose-900">
                                              <AlertCircle size={13} className="text-rose-600 shrink-0" />
                                              <span>Alasan Ditolak Admin:</span>
                                            </div>
                                            <p className="text-[11.5px] text-rose-700 leading-snug pl-4">
                                              {biz.rejection_reason || biz.raw?.rejection_reason || "Data usaha belum memenuhi ketentuan."}
                                            </p>
                                            <div className="pt-1 pl-4">
                                              <button
                                                type="button"
                                                onClick={() => navigate(`/add-business/${biz.id}`)}
                                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                                              >
                                                <Edit size={11} />
                                                <span>Perbaiki &amp; Ajukan Ulang</span>
                                              </button>
                                            </div>
                                          </div>
                                        )}
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
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#059669] border border-[#ccfbf1]">
                                      <Package size={11} />
                                      {biz.products?.length || 0} Item
                                    </span>
                                  </td>

                                  {/* Status & Tanggal */}
                                  <td className="px-2.5 py-2.5 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                          isApproved
                                            ? "bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]"
                                            : isPending
                                            ? "bg-[#fefce8] text-[#a16207] border border-[#fef08a]"
                                            : isRejected
                                            ? "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]"
                                            : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            isApproved ? "bg-[#16a34a]" : isPending ? "bg-[#ca8a04]" : "bg-[#dc2626]"
                                          }`}
                                        />
                                        {isApproved ? "Disetujui" : isPending ? "Menunggu" : isRejected ? "Ditolak" : "Nonaktif"}
                                      </span>
                                      {isPendingSub && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                          <Clock size={10} /> Diproses
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
                                      {/* Upgrade button only for Free businesses without pending subscription */}
                                      {!isPrem && !isPendingSub && (
                                        <button
                                          onClick={() => navigate(`/add-business/${biz.id}?upgrade=true`)}
                                          className="h-[30px] px-2.5 rounded-lg text-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer border-0 hover:scale-105 active:scale-95 font-bold text-[11px] shrink-0"
                                          style={{
                                            background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 55%, #d97706 100%)",
                                            boxShadow: "0 2px 6px rgba(217, 119, 6, 0.4), inset 0 1px 0 #ffffff, inset 0 -1px 0 #78350f",
                                          }}
                                          title="Upgrade bisnis ini ke Paket Premium"
                                        >
                                          <Crown size={13} className="shrink-0 text-slate-950" strokeWidth={2.5} />
                                          <span className="hidden sm:inline">Upgrade</span>
                                        </button>
                                      )}
                                      {/* View */}
                                      <button
                                        onClick={() => navigate(`/business/${biz.raw?.slug || biz.id}`)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Lihat Halaman Bisnis"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      {/* Edit / Perbaiki */}
                                      <button
                                        onClick={() => handleEditBusiness(biz)}
                                        className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                          isRejected
                                            ? "bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white"
                                            : "bg-[#fefce8] text-[#ca8a04] hover:bg-[#ca8a04] hover:text-white"
                                        }`}
                                        title={isRejected ? "Perbaiki Bisnis (Ditolak)" : "Edit Profil Bisnis"}
                                      >
                                        <Edit size={14} />
                                      </button>
                                      {/* Manage Products */}
                                      <button
                                        onClick={() => navigate(`/add-product/${biz.id}`)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#f0fdfa] text-[#059669] hover:bg-[#059669] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Kelola Produk Bisnis"
                                      >
                                        <Package size={14} />
                                      </button>
                                      {/* Delete */}
                                      <button
                                        onClick={() => handleDeleteBusiness(biz.id)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#fef2f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Hapus Bisnis"
                                      >
                                        <Trash2 size={14} />
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
                          <span className="font-bold text-[#059669]">{totalItems}</span> bisnis
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
                        <h3 className="text-[15px] font-bold text-[#0f172a]">Belum Ada Bisnis</h3>
                        <p className="text-[12.5px] text-[#64748b] mt-[4px] max-w-[340px] leading-relaxed">
                          {businessSearch || businessCategoryFilter !== "Semua" || businessStatusFilter !== "Semua"
                            ? "Tidak ada bisnis yang cocok dengan kata kunci atau filter yang Anda pilih."
                            : "Anda belum mendaftarkan profil bisnis di portal Surade.co.id."}
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

              {/* 1.5 PRICING CARDS SHOWCASE (PAY PER POST) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blog Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-teal-50/40 border border-teal-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#059669] flex items-center justify-center font-bold">
                          <FileText size={16} />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Publikasi Artikel Blog</h3>
                      </div>
                      <span className="bg-teal-100 text-[#059669] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Aktif 1 Tahun
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Publikasikan artikel promosi, edukasi, atau cerita bisnis Anda. Tayang selama 365 hari penuh dengan optimasi SEO.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tarif Upload</span>
                      <span className="text-lg font-black text-[#059669]">
                        Rp {contentPricing.blog.toLocaleString("id-ID")} <span className="text-[11px] font-medium text-slate-500">/ posting</span>
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/add-blog?type=blog")}
                      className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Buat Blog Baru</span>
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
                        Aktif 1 Tahun
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Promosikan acara festival, webinar, workshop, atau konser Anda ke ribuan pengguna platform Surade.co.id.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tarif Upload</span>
                      <span className="text-lg font-black text-purple-700">
                        Rp {contentPricing.event.toLocaleString("id-ID")} <span className="text-[11px] font-medium text-slate-500">/ posting</span>
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
                {/* SEARCH BAR & BUAT BLOG BARU BUTTON IN ONE FULL-WIDTH ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  {/* Search input - fills all remaining space */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari judul artikel atau event..."
                      value={blogSearch}
                      onChange={(e) => {
                        setBlogSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007570]/20 focus:border-[#007570] transition-all shadow-2xs"
                    />
                  </div>

                  {/* Buat Blog & Buat Event Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => navigate("/add-blog?type=blog")}
                      className="flex-1 sm:flex-none h-11 flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4b] text-white px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      <span>Buat Blog Baru</span>
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
                <div className="flex items-center gap-6 border-b border-slate-100 pb-0 overflow-x-auto text-xs sm:text-sm font-semibold">
                  {["Semua", "Blog", "Event", "Published", "Menunggu Persetujuan", "Ditolak", "Draft"].map((tab) => {
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
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="animate-spin text-[#059669]" size={40} />
                  </div>
                ) : (() => {
                  // Combined list of blogs + events
                  const combinedList = [
                    ...blogs.map((b) => ({ ...b, itemType: "blog" })),
                    ...events.map((e) => ({ ...e, itemType: "event" })),
                  ];

                  // Filter based on tab and search keyword
                  const filtered = combinedList.filter((item) => {
                    const st = (item.status || "").toLowerCase();
                    // Tab filter
                    if (filterTab === "Blog" && item.itemType !== "blog") return false;
                    if (filterTab === "Event" && item.itemType !== "event") return false;
                    if (filterTab === "Published" && !(st === "published" || st === "approved" || st === "terbit")) return false;
                    if (filterTab === "Menunggu Persetujuan" && !(st === "waiting_payment" || st === "pending" || st === "menunggu")) return false;
                    if (filterTab === "Ditolak" && !(st === "rejected" || st === "failed" || st === "ditolak")) return false;
                    if (filterTab === "Draft" && st !== "draft") return false;

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
                      <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-3.5 w-[42%] font-semibold">Artikel & Event</th>
                              <th className="py-2.5 px-3 w-[22%] font-semibold">Kategori & Tanggal</th>
                              <th className="py-2.5 px-2.5 w-[18%] text-center font-semibold">Status</th>
                              <th className="py-2.5 px-3 w-[18%] text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentData.map((item) => {
                              const st = (item.status || "").toLowerCase();
                              const isPublished = st === "approved" || st === "published" || st === "terbit";
                              const isWaitingPayment = st === "waiting_payment" || st === "pending" || st === "menunggu";
                              const isDraft = st === "draft";
                              const isRejected = st === "rejected" || st === "failed" || st === "ditolak";

                              return (
                                <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-50/60 transition-colors">
                                  {/* Artikel & Event (Cover + Judul + Tipe/Penulis) */}
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
                                            {item.itemType === "event" ? "🎪 Event" : "📝 Blog"}
                                          </span>
                                          <span>·</span>
                                          <span className="truncate text-slate-400">oleh {item.author || "User"}</span>
                                        </div>

                                        {isRejected && (
                                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 space-y-0.5">
                                            <div className="flex items-center gap-1 font-bold text-rose-900">
                                              <AlertCircle size={13} className="text-rose-600 shrink-0" />
                                              <span>Alasan Penolakan dari Admin:</span>
                                            </div>
                                            <p className="text-[10.5px] leading-relaxed text-rose-700 pl-4">
                                              {item.rejection_reason || "Konten belum memenuhi syarat. Silakan klik 'Perbaiki' untuk memperbarui dan mengajukan kembali."}
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
                                        📅 {item.date}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-2.5 px-2.5 text-center align-middle">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                                        isPublished
                                          ? "bg-[#e6f4ea] text-[#137333] border border-[#bbf7d0]"
                                          : isWaitingPayment
                                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                                          : isRejected
                                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          isPublished
                                            ? "bg-[#16a34a]"
                                            : isWaitingPayment
                                            ? "bg-amber-500 animate-pulse"
                                            : isRejected
                                            ? "bg-rose-600"
                                            : "bg-slate-400"
                                        }`}
                                      />
                                      {isPublished
                                        ? "Published"
                                        : isWaitingPayment
                                        ? "Menunggu Persetujuan"
                                        : isRejected
                                        ? "Ditolak / Revisi"
                                        : "Draft"}
                                    </span>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="py-2.5 px-3 text-right align-middle">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Bayar Draft Button */}
                                      {isDraft && (
                                        <button
                                          onClick={() => {
                                            setSelectedBlogForPayment(item);
                                            setShowPaymentModal(true);
                                          }}
                                          title="Lanjutkan Pembayaran"
                                          className="h-[30px] px-2.5 rounded-lg bg-[#059669] hover:bg-[#005f5b] text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                                        >
                                          <CreditCard size={13} />
                                          <span className="hidden sm:inline">Bayar</span>
                                        </button>
                                      )}

                                      {/* Perbaiki / Ajukan Ulang jika ditolak */}
                                      {isRejected && (
                                        <button
                                          onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
                                          title="Perbaiki & Ajukan Ulang"
                                          className="h-[30px] px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
                                        >
                                          <Edit size={13} />
                                          <span className="hidden sm:inline">Perbaiki</span>
                                        </button>
                                      )}

                                      {/* View Button */}
                                      <button
                                        onClick={() => navigate(`/blog/${item.id}`)}
                                        title="Lihat"
                                        className="w-[30px] h-[30px] rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                      >
                                        <Eye size={14} />
                                      </button>

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
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
                                    ? "bg-[#059669] text-white shadow-2xs"
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

          {/* 4. INBOX / CHAT VIEW */}
          {activeTab === "inbox" && (
            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 md:gap-5 h-[calc(100vh-140px)] min-h-[550px] max-h-[850px] overflow-hidden">
              {/* LEFT PANEL: Daftar Conversation */}
              <div className={`bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm ${activeConversationId ? "max-md:hidden" : "w-full"}`}>
                <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Mail size={18} className="text-[#059669]" />
                      Kotak Masuk
                    </h2>
                    {totalInboxUnreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-xs animate-pulse">
                        {totalInboxUnreadCount} baru
                      </span>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={inboxSearchQuery}
                      onChange={(e) => setInboxSearchQuery(e.target.value)}
                      placeholder="Cari pesan atau bisnis..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#007570] focus:ring-1 focus:ring-[#007570]"
                    />
                  </div>
                </div>

                {/* Conversation List Container */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loadingConversations ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-2">
                      <Loader2 size={28} className="animate-spin text-[#059669]" />
                      <p className="text-xs font-medium">Memuat percakapan...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => {
                      const isActive = String(activeConversationId) === String(conv.id);
                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            setActiveConversationId(conv.id);
                            navigate(`/dashboard?tab=inbox&conversation=${conv.id}`, { replace: true });
                          }}
                          className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${isActive ? "bg-teal-50/70 border-l-4 border-l-[#007570]" : "hover:bg-slate-50"} ${conv.unread_count > 0 ? "bg-slate-50/90 font-semibold" : ""}`}
                        >
                          {/* Avatar / Logo */}
                          <div className="relative shrink-0">
                            <SafeImage
                              src={conv.business_logo ? getStorageUrl(conv.business_logo) : (conv.counterparty_avatar ? getStorageUrl(conv.counterparty_avatar) : DEFAULT_AVATAR)}
                              alt={conv.business_name}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                              fallback={DEFAULT_AVATAR}
                            />
                            {conv.unread_count > 0 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>

                          {/* Content info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {conv.business_name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                {formatChatTimestamp(conv.last_message_at)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                                {conv.counterparty_role}
                              </span>
                              <span className="truncate">{conv.counterparty_name}</span>
                            </div>
                            <p className={`text-xs truncate ${conv.unread_count > 0 ? "font-bold text-slate-900" : "text-slate-500"}`}>
                              {conv.last_message || "Belum ada pesan."}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
                      <Mail size={40} className="text-slate-300 stroke-[1.5]" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">Belum Ada Pesan</p>
                        <p className="text-xs text-slate-500 max-w-[200px]">
                          Pesan dari bisnis yang Anda hubungi akan muncul di sini.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: Chat Detail & Window */}
              <div className={`bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm ${!activeConversationId ? "max-md:hidden" : "w-full"}`}>
                {activeConversationId && activeChatData ? (
                  <>
                    {/* Header Chat Window */}
                    <div className="p-3.5 md:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile Back Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveConversationId(null);
                            setActiveChatData(null);
                            navigate(`/dashboard?tab=inbox`, { replace: true });
                          }}
                          className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="Kembali ke Daftar Pesan"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <SafeImage
                          src={activeChatData.business?.logo ? getStorageUrl(activeChatData.business.logo) : DEFAULT_AVATAR}
                          alt={activeChatData.business?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                          fallback={DEFAULT_AVATAR}
                        />

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {activeChatData.business?.name || "Detail Bisnis"}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#059669] font-bold text-[10px]">
                              {activeChatData.counterparty_role}
                            </span>
                            <span className="truncate">{activeChatData.counterparty_name}</span>
                          </p>
                        </div>
                      </div>

                      {/* Desktop Close/Exit Chat Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveConversationId(null);
                          setActiveChatData(null);
                          navigate(`/dashboard?tab=inbox`, { replace: true });
                        }}
                        className="hidden md:flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer font-medium"
                        title="Tutup Percakapan"
                      >
                        <X size={15} />
                        <span>Tutup</span>
                      </button>
                    </div>

                    {/* Body: Messages List */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3.5 bg-slate-50/40">
                      {loadingChatDetails ? (
                        <div className="flex items-center justify-center h-full text-slate-400 space-y-2">
                          <Loader2 size={24} className="animate-spin text-[#059669]" />
                          <span className="text-xs ml-2 font-semibold">Memuat pesan...</span>
                        </div>
                      ) : activeChatData.messages && activeChatData.messages.length > 0 ? (
                        activeChatData.messages.map((msg) => {
                          const isMine = String(msg.sender_id) === String(user?.id);
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                            >
                              {!isMine && (
                                <img
                                  src={msg.sender?.avatar ? getStorageUrl(msg.sender.avatar) : DEFAULT_AVATAR}
                                  alt={msg.sender?.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mb-1"
                                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                />
                              )}
                              <div
                                className={`max-w-[78%] md:max-w-[68%] rounded-2xl p-3.5 shadow-xs space-y-1 ${
                                  isMine
                                    ? "bg-gradient-to-r from-[#007570] to-teal-700 text-white rounded-br-none"
                                    : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-none"
                                }`}
                              >
                                <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap break-words">
                                  {msg.message}
                                </p>
                                <div className={`text-[10px] font-medium flex items-center justify-end gap-1 ${isMine ? "text-teal-200" : "text-slate-400"}`}>
                                  <span>{formatChatTimestamp(msg.created_at)}</span>
                                  {isMine && <CheckCircle size={11} className="text-teal-200" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2 py-10">
                          <MessageCircle size={36} className="text-slate-300" />
                          <p className="text-xs font-semibold text-slate-600">Belum ada pesan dalam percakapan ini.</p>
                          <p className="text-[11px] text-slate-400">Kirim pesan pertama Anda di bawah ini.</p>
                        </div>
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form
                      onSubmit={handleSendChatMessage}
                      className="p-3 md:p-4 border-t border-slate-100 bg-white flex items-center gap-2 md:gap-3 shrink-0"
                    >
                      <input
                        type="text"
                        value={chatMessageInput}
                        onChange={(e) => setChatMessageInput(e.target.value)}
                        placeholder={`Tulis pesan untuk ${activeChatData.counterparty_name || "pemilik"}...`}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#007570] focus:ring-1 focus:ring-[#007570]"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessageInput.trim() || sendingChatMessage}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs md:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                      >
                        {sendingChatMessage ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                        <span>Kirim</span>
                      </button>
                    </form>
                  </>
                ) : (
                  /* Empty state when no conversation is selected */
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 p-8 text-center bg-slate-50/30">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                      <Mail size={32} className="stroke-[1.5]" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold text-slate-800">Ruang Obrolan</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Pilih pesan dari menu sebelah kiri untuk membaca detail isi percakapan atau membalas pesan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. REFERRAL VIEW */}
          {(activeTab === "referral" || activeTab === "reseller") && (
            <div className="space-y-6 w-full max-w-full">
              {/* Header Banner Program Referral */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a4d3a] via-[#0b6b45] to-[#0f7a52] text-white p-6 md:p-8 shadow-xl border border-teal-800/40">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                      <Gift size={14} /> Program Kemitraan & Referral
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Dapatkan Komisi Rp 10.000 Dari Setiap Referral!
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      Bagikan kode unik Anda kepada rekan usaha atau kerabat. Teman Anda mendapat potongan harga Rp 5.000 saat bertransaksi, dan Anda otomatis menerima komisi tunai sebesar Rp 10.000.
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

                    {/* Action Buttons: Salin Kode & Bagi Link */}
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
                        onClick={() => {
                          const link = `${window.location.origin}/register?ref=${referralCode}`;
                          navigator.clipboard.writeText(link);
                          setReferralLinkCopyToast(true);
                          setTimeout(() => setReferralLinkCopyToast(false), 2500);
                        }}
                        className="w-full py-1.5 px-2 rounded-md bg-slate-900 hover:bg-slate-800 active:scale-95 text-teal-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-800"
                        title="Salin Link Pendaftaran"
                      >
                        <Share2 size={12} />
                        <span>{referralLinkCopyToast ? "Tersalin!" : "Bagi Link"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bonus Teman Footer */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 text-[11px]">Bonus Teman:</span>
                    <span className="text-emerald-700 font-extrabold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Diskon Rp 5.000
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
                    Penerima kode Anda langsung mendapat <strong className="text-emerald-700 font-extrabold bg-white px-1.5 py-0.5 rounded border border-emerald-300/60">Diskon Instan Rp 5.000</strong> saat mendaftar atau membeli Paket Premium. Ini adalah <em>Win-Win Solution</em> — Teman Anda hemat Rp 5.000, Anda mendapat Komisi Rp 10.000!
                  </p>
                </div>

                {/* Template Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Pilih Template Pesan Promosi:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedPromoTemplate("diskon")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedPromoTemplate === "diskon"
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Gift size={14} />
                      <span>1. Promo Diskon Hemat (Umum)</span>
                    </button>
                    <button
                      onClick={() => setSelectedPromoTemplate("bisnis")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedPromoTemplate === "bisnis"
                          ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Briefcase size={14} />
                      <span>2. Penawaran Pelaku UMKM / Bisnis</span>
                    </button>
                    <button
                      onClick={() => setSelectedPromoTemplate("heboh")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedPromoTemplate === "heboh"
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
                        Pengguna mendaftar dengan kode Anda dan membeli Paket Premium dengan potongan diskon Rp 5.000.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      3
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Nikmati Komisi Rp 10.000</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Komisi tunai Rp 10.000 otomatis masuk setelah pembayaran diverifikasi admin dan dapat ditarik kapan saja.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Katalog Kode Referral Komunitas (Pengguna Lain) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users size={18} className="text-teal-600" />
                      Katalog Kode Referral Komunitas (Pengguna Lain)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingin menggunakan kode referral milik mitra lain untuk mendapatkan diskon Rp 5.000? Pilih dan gunakan kode di bawah ini tanpa perlu bertanya!
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
                  <div className="py-12 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-teal-600 mb-2" />
                    <p className="text-xs font-medium">Memuat kode referral komunitas...</p>
                  </div>
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
                            Diskon Rp 5.000
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
                      Top 10 mitra dengan hasil perolehan komisi dan pengguna terbanyak di Surade.co.id
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
                  <div className="py-8 text-center text-slate-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-xs font-medium">Memuat papan peringkat...</p>
                  </div>
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
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">ID Transaksi</th>
                        <th className="py-3 px-4">Pengguna / Pembeli</th>
                        <th className="py-3 px-4">Layanan & Bisnis</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4 text-right">Total Transaksi</th>
                        <th className="py-3 px-4 text-right">Komisi Anda (Rp 10.000)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loadingReferrals ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <Loader2 size={24} className="animate-spin mx-auto text-[#059669] mb-2" />
                            <p className="text-xs font-medium">Memuat data referral...</p>
                          </td>
                        </tr>
                      ) : filteredReferralTransactions.length > 0 ? (
                        filteredReferralTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#059669]">
                              {tx.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={tx.userAvatar}
                                  alt={tx.userName}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{tx.userName}</div>
                                  <div className="text-[11px] text-slate-500">{tx.userEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{tx.service}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Briefcase size={11} className="text-slate-400" />
                                {tx.businessName}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                              Rp {(tx.amount || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                              + Rp {(tx.commission || 0).toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {(tx.status === "approved" || tx.status === "earned" || tx.status === "paid" || tx.status === "success") && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                  <CheckCircle size={12} /> Berhasil
                                </span>
                              )}
                              {tx.status === "pending" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                  <Clock size={12} /> Menunggu Verifikasi
                                </span>
                              )}
                              {(tx.status === "cancelled" || tx.status === "failed") && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                                  <X size={12} /> Dibatalkan
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => setSelectedReferralTx(tx)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500 space-y-2">
                            <Share2 size={36} className="mx-auto text-slate-300" />
                            <p className="font-bold text-sm text-slate-800">Belum ada referral yang berhasil.</p>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                              Bagikan kode referral Anda ({referralCode}) ke rekan bisnis untuk mulai mendapatkan komisi Rp 10.000 dari setiap pembelian Paket Premium.
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
                              <div className="font-bold text-slate-900">{w.bank}</div>
                              <div className="text-[11.5px] text-slate-600 font-mono">{w.account_number}</div>
                              <div className="text-[11px] text-slate-500">an {w.account_holder}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-base text-slate-900 whitespace-nowrap">
                              Rp {w.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
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
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              {w.status === "rejected" && w.rejection_reason ? (
                                <div className="text-xs text-rose-700 bg-rose-50/60 p-2 rounded-lg border border-rose-200">
                                  <span className="font-bold block text-[10.5px] uppercase">Alasan Penolakan:</span>
                                  <span className="leading-relaxed">{w.rejection_reason}</span>
                                </div>
                              ) : w.status === "paid" && w.processed_at ? (
                                <span className="text-slate-500 text-[11px]">
                                  Ditransfer pada: <strong>{w.processed_at}</strong>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 space-y-1">
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
                    Daftar bisnis, artikel blog, dan event yang Anda simpan dari portal Surade.co.id.
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
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2.5">
                    <Loader2 size={32} className="animate-spin text-[#059669]" />
                    <p className="text-xs font-semibold text-slate-600">Memuat bookmark tersimpan...</p>
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
                                          className="text-sm font-bold text-slate-900 truncate hover:text-[#059669] cursor-pointer transition-colors"
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
                  <div className="flex flex-col items-center justify-center py-[50px] gap-[10px] bg-white border border-[#e2e8f0] rounded-[13px]">
                    <Loader2 size={28} className="text-[#059669] animate-spin" />
                    <span className="text-[13px] text-[#64748b]">Tunggu, sedang memuat ulasan...</span>
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
                                  <span className="text-[12px] font-medium text-[#1e293b] truncate max-w-[120px]">
                                    {rev.user || "Pelanggan"}
                                  </span>
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
                                    p === safePage ? "bg-[#059669] text-white" : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]"
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
                        className={`bg-white rounded-2xl border-2 p-6 shadow-md transition-all hover:shadow-xl ${
                          isActive ? 'border-teal-200' : 'border-gray-200 opacity-75'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-1">{plan.name}</h3>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              isActive 
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
                            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold rounded-xl text-sm transition-colors ${
                              isActive
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
              <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1a1408] via-[#241b09] to-[#1a1408] border border-[#f5c451]/25 p-[26px_28px] shadow-xl flex items-center gap-[20px]">
                {/* Cahaya dekoratif */}
                <div className="absolute -right-10 -top-14 w-64 h-64 rounded-full bg-[#f5c451]/12 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-20 w-48 h-48 rounded-full bg-[#fbbf24]/10 blur-3xl pointer-events-none" />

                {/* Badge ikon mahkota bergaya 3D (gradasi emas + bayangan
                    berlapis: highlight terang di atas, bayangan gelap di
                    bawah, supaya terkesan timbul seperti lencana logam). */}
                <div
                  className="relative z-10 shrink-0 w-[62px] h-[62px] rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #fde68a 0%, #f5c451 38%, #b8860b 100%)",
                    boxShadow:
                      "0 10px 24px rgba(184,134,11,0.45), inset 0 2px 3px rgba(255,255,255,0.65), inset 0 -3px 5px rgba(0,0,0,0.28)",
                  }}
                >
                  <Crown size={30} className="text-[#3d2c05]" strokeWidth={2.3} />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-[6px] px-[10px] py-[3px] rounded-full bg-[#f5c451]/15 border border-[#f5c451]/30 text-[#f5d876] text-[11px] font-bold uppercase tracking-wider mb-[6px]">
                    <Sparkles size={11} /> Fitur Eksklusif
                  </div>
                  <h2 className="text-[19px] md:text-[21px] font-extrabold tracking-tight text-white">Upgrade Usaha ke Premium</h2>
                  <p className="text-[13px] text-[#d9cba3] mt-[2px]">Pilih profil usaha Anda dan paket premium untuk membuka fitur peta lokasi, galeri, dan badge prioritas.</p>
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
                            <div className="flex items-center justify-between p-[14px_16px] rounded-[12px] bg-[#f8fafc] border border-[#e2e8f0]">
                              <div className="flex items-center gap-[12px]">
                                <img
                                  src={currentBiz.logo ? getStorageUrl(currentBiz.logo) : DEFAULT_AVATAR}
                                  alt={currentBiz.name || "Bisnis"}
                                  className="w-[44px] h-[44px] rounded-[10px] object-cover border border-[#e2e8f0]"
                                />
                                <div>
                                  <h4 className="text-[14px] font-bold text-[#0f172a]">{currentBiz.name}</h4>
                                  <p className="text-[12px] text-[#64748b] flex items-center gap-[4px] mt-[1px]">
                                    <MapPin size={12} className="text-[#059669]" />
                                    <span>{currentBiz.city || "Indonesia"}</span>
                                    <span>•</span>
                                    <span>{getCategoryDisplayName(currentBiz.category)}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                {isPrem ? (
                                  <span className="px-[10px] py-[4px] bg-[#fef3c7] text-[#b45309] rounded-full text-[11.5px] font-bold flex items-center gap-[4px]">
                                    ⭐ Premium Aktif
                                  </span>
                                ) : isPendingSub ? (
                                  <span className="px-[10px] py-[4px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11.5px] font-bold flex items-center gap-[4px]">
                                    ⏳ Verifikasi Sedang Diproses
                                  </span>
                                ) : (
                                  <span className="px-[10px] py-[4px] bg-[#f1f5f9] text-[#64748b] rounded-full text-[11.5px] font-semibold">
                                    Paket Reguler / Free
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Alert if already premium */}
                            {isPrem && (
                              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-3 animate-fadeIn">
                                <Crown size={22} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-200 text-amber-900 uppercase tracking-wider">
                                      Sudah Premium
                                    </span>
                                    <h4 className="text-xs font-bold text-amber-950">
                                      Usaha "{currentBiz.name}" Sudah Memiliki Paket Premium Aktif
                                    </h4>
                                  </div>
                                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                    Profil usaha ini sudah berstatus <strong>Premium Aktif</strong> dengan seluruh fitur lengkap. Anda tidak dapat melakukan upgrade ganda pada usaha yang sama. Silakan pilih usaha Anda yang lain di atas untuk di-upgrade.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Alert if pending verification */}
                            {isPendingSub && (
                              <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-start gap-3 animate-fadeIn">
                                <Clock size={22} className="text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-200 text-blue-900 uppercase tracking-wider">
                                      Sedang Diverifikasi
                                    </span>
                                    <h4 className="text-xs font-bold text-blue-950">
                                      Pengajuan Paket Premium untuk "{currentBiz.name}" Sedang Diproses
                                    </h4>
                                  </div>
                                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
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
                    <div className="flex flex-col items-center justify-center py-[48px] gap-[12px] text-[#64748b]">
                      <Loader2 size={36} className="animate-spin text-[#059669]" />
                      <p className="text-[13px] font-medium">Memuat paket premium terbaru...</p>
                    </div>
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
                            className={`rounded-[24px] p-[26px] flex flex-col justify-between relative transition-all duration-300 cursor-pointer overflow-hidden select-none transform-gpu group ${
                              isFree
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
                                  className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all ${
                                    isSelected
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
                                        className={`w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0 ${
                                          isFree
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
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                                    if (!targetBizId) {
                                      alert("Silakan daftarkan atau pilih usaha Anda terlebih dahulu.");
                                      return;
                                    }
                                    navigate(`/add-business/${targetBizId}?upgrade=true`);
                                  }}
                                  className={`w-full py-[12px] rounded-[14px] font-black text-[14px] cursor-pointer border-0 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                                    isSelected
                                      ? "text-slate-950"
                                      : "text-slate-950"
                                  }`}
                                  style={
                                    isSelected
                                      ? {
                                          background: "linear-gradient(180deg, #fde047 0%, #f59e0b 55%, #d97706 100%)",
                                          boxShadow: "0 8px 24px rgba(217, 119, 6, 0.55), inset 0 1.5px 0 #ffffff, inset 0 -2px 0 #78350f",
                                        }
                                      : {
                                          background: "linear-gradient(180deg, #34d399 0%, #059669 55%, #047857 100%)",
                                          boxShadow: "0 8px 20px rgba(5, 150, 105, 0.45), inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(2, 44, 34, 0.5)",
                                        }
                                  }
                                >
                                  <span>Upgrade Usaha ke Paket Ini</span>
                                  <ChevronRight size={17} strokeWidth={2.8} />
                                </button>
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
                          navigate(`/add-business/${targetBizId}?upgrade=true`);
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
                      <h4 className="text-[14px] font-semibold text-[#0f172a]">Chat via Inbox</h4>
                      <p className="text-[12.5px] text-[#64748b]">Komunikasi langsung dengan pelanggan melalui inbox</p>
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
                  <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {[
                      { id: "all", label: "Semua", count: adStats.total_ads },
                      { id: "active", label: "Aktif", count: adStats.active_ads, badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                      { id: "pending_payment", label: "Menunggu Pembayaran", count: adStats.pending_payment, badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
                      { id: "waiting_approval", label: "Menunggu Approval", count: adStats.waiting_approval, badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
                      { id: "expired", label: "Berakhir", count: adStats.expired_ads },
                      { id: "rejected", label: "Ditolak", count: adStats.rejected_ads, badgeBg: "bg-rose-50 text-rose-700 border-rose-200" },
                    ].map((tab) => {
                      const isActive = adFilterTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAdFilterTab(tab.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            isActive
                              ? "bg-[#059669] text-white shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                              isActive
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
                  <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-500">
                    <Loader2 size={32} className="animate-spin text-[#059669]" />
                    <p className="text-xs font-semibold">Memuat daftar iklan Anda...</p>
                  </div>
                ) : (() => {
                  const filtered = advertisements.filter((ad) => {
                    const status = ad.computed_status || ad.status;
                    if (adFilterTab === "all") return true;
                    if (adFilterTab === "active") return status === "active" || status === "approved";
                    if (adFilterTab === "pending_payment") return status === "pending_payment" || ad.payment_status === "unpaid" || ad.payment_status === "pending_payment";
                    if (adFilterTab === "waiting_approval") return status === "waiting_approval" || (ad.payment_status === "pending" && status === "pending");
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
                        // PERBAIKAN: sebelumnya field "Sisa hari" mengandalkan
                        // ad.days_remaining & ad.computed_status dari backend,
                        // yang ternyata tidak selalu terisi (makanya tampil
                        // "Sisa hari" tanpa angka). Sekarang dihitung langsung
                        // dari tanggal end_date, jadi selalu akurat dan tidak
                        // bergantung proses lain di server.
                        const endDate = ad.end_date ? new Date(ad.end_date) : null;
                        const daysRemaining = endDate
                          ? Math.ceil((endDate.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
                          : null;
                        const isExpired = daysRemaining !== null && daysRemaining < 0;
                        const status = isExpired ? "expired" : (ad.computed_status || ad.status);
                        const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                        const biz = ad.business || {};
                        const bizPhoto = getBusinessPhoto(biz);

                        return (
                          <div
                            key={`user-ad-${ad.id}`}
                            className={`group relative bg-white border rounded-2xl p-5 transition-all duration-200 hover:shadow-md ${
                              isPremium
                                ? "border-amber-200/90 bg-gradient-to-br from-white via-amber-50/20 to-white"
                                : "border-slate-200 hover:border-teal-300"
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Left info */}
                              <div className="flex items-start gap-4 min-w-0">
                                {/* Thumbnail */}
                                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
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
                                <div className="min-w-0 space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-base font-bold text-slate-900 truncate">
                                      {biz.name || "Nama Bisnis Tidak Ditemukan"}
                                    </h4>

                                    {/* Placement Pill */}
                                    {isPremium ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs">
                                        <Sparkles size={11} />
                                        Premium Hero Placement
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#059669] border border-teal-200">
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
                                    <span>Durasi: <strong>{ad.duration_days || 7} Hari</strong></span>
                                    <span>•</span>
                                    <span className="font-extrabold text-[#059669]">
                                      Rp {Number(ad.price || 0).toLocaleString("id-ID")}
                                    </span>
                                  </div>

                                  {/* Period & Days Remaining Info */}
                                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                                    {ad.start_date && ad.end_date ? (
                                      <div className="flex items-center gap-1.5 text-slate-600">
                                        <Clock size={12} className="text-[#059669]" />
                                        <span>
                                          Periode: <strong>{new Date(ad.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong> s/d <strong>{new Date(ad.end_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic">
                                        * Periode mulai aktif dihitung otomatis setelah pembayaran disetujui admin.
                                      </span>
                                    )}

                                    {status === "active" && daysRemaining !== null && daysRemaining >= 0 && (
                                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                                        daysRemaining <= 3 ? "bg-red-100 text-red-700" : daysRemaining <= 7 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                                      }`}>
                                        ⏳ {daysRemaining === 0 ? "Berakhir hari ini" : `Sisa ${daysRemaining} hari`}
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-200 text-slate-600">
                                        ⏹️ Masa tayang berakhir
                                      </span>
                                    )}
                                  </div>

                                  {/* Rejection Alert if rejected */}
                                  {status === "rejected" && (
                                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                                      <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                                      <div>
                                        <span className="font-bold">Alasan Penolakan Admin: </span>
                                        <span>{ad.rejection_reason || ad.notes || "Bukti transfer tidak valid atau foto bisnis belum memenuhi syarat."}</span>
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
                                  {status === "rejected" && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenResubmitAdModal(ad)}
                                      className="px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                                    >
                                      <RefreshCw size={14} />
                                      Ajukan Ulang Iklan
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

                                  {(status === "pending" || status === "pending_payment") && (
                                    <button
                                      type="button"
                                      onClick={() => handleAdCancel(ad.id)}
                                      className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                                      title="Batalkan Iklan"
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
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#059669]" />
                  Perbandingan Paket Iklan Surade.co.id
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Premium Ads info card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                          ⭐ PREMIUM ADS
                        </span>
                        <span className="text-xs font-bold text-amber-800">Posisi Paling Atas (Hero)</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">Large Hero Visual Carousel</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Format iklan eksklusif dengan foto bisnis full-width ukuran besar, minimalis tanpa teks berlebih, menampilkan rating bintang ★ dan lokasi 📍. Iklan pertama yang dilihat ribuan pengunjung saat membuka Surade.co.id.
                      </p>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pt-2 border-t border-amber-200/60">
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-amber-600 shrink-0" />
                        Ukuran visual raksasa di section teratas halaman Home
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
                          ⚡ STANDARD ADS
                        </span>
                        <span className="text-xs font-bold text-teal-800">Continuous Running Ticker</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">Infinite Horizontal Stream</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Format kartu kecil modern yang bergerak otomatis secara halus dari kanan ke kiri tanpa henti (continuous ticker). Sangat dinamis, eye-catching, dan efisien untuk mempromosikan bisnis Anda.
                      </p>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5 font-medium pt-2 border-t border-teal-200/60">
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
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                            createAdStep === item.step
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
                                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                                    isSelected
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
                                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                                    isSelected
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
                                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                                          isPrem
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
                              {/* Standard fallback */}
                              <div
                                onClick={() => setSelectedPackage("Standard Iklan")}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                  selectedPackage === "Standard Iklan"
                                    ? "border-[#007570] bg-teal-50/40 shadow-md"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="space-y-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900">Standard Ads</span>
                                  <h4 className="text-base font-extrabold text-slate-900">Standard Ticker (7 Hari)</h4>
                                  <span className="text-xl font-black text-slate-900">Rp 150.000</span>
                                  <p className="text-xs text-slate-600">Running ticker continuous scroller.</p>
                                </div>
                              </div>

                              {/* Premium fallback */}
                              <div
                                onClick={() => setSelectedPackage("Premium Iklan")}
                                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                  selectedPackage === "Premium Iklan"
                                    ? "border-amber-500 bg-amber-50/40 shadow-md"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <div className="space-y-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900">Premium Ads</span>
                                  <h4 className="text-base font-extrabold text-slate-900">Premium Hero (7 Hari)</h4>
                                  <span className="text-xl font-black text-slate-900">Rp 75.000</span>
                                  <p className="text-xs text-slate-600">Large Hero Carousel di posisi paling atas.</p>
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
                                        ★ 4.8 <span className="text-slate-300 font-normal">({categoryName})</span>
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
                                        <span className="text-[11px] font-bold text-amber-500">★ 4.8</span>
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

                            {/* Daftar Kupon Tersedia */}
                            {!appliedCouponInfo && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                    <Sparkles size={12} />
                                    Kupon Promo Tersedia:
                                  </span>
                                  <span className="text-[10px] text-slate-400">Klik kupon untuk pakai langsung</span>
                                </div>

                                {availableCouponsLoading ? (
                                  <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                                    <Loader2 size={13} className="animate-spin text-emerald-600" />
                                    Memuat daftar kupon aktif...
                                  </div>
                                ) : availableCoupons.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 pt-0.5">
                                    {availableCoupons.map((c) => {
                                      const isPercentage = c.discount_type === 'percentage';
                                      const discountLabel = isPercentage 
                                        ? `Diskon ${Number(c.discount_value)}%`
                                        : `Diskon Rp ${Number(c.discount_value).toLocaleString('id-ID')}`;
                                      return (
                                        <button
                                          key={c.code}
                                          type="button"
                                          onClick={() => handleValidateUserCoupon(c.code)}
                                          disabled={validatingCoupon}
                                          className="group flex items-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 rounded-xl px-3 py-1.5 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                                          title={c.description || c.name || `Kupon ${c.code}`}
                                        >
                                          <div className="flex items-center gap-1">
                                            <Tag size={12} className="text-emerald-600 group-hover:rotate-12 transition-transform" />
                                            <span className="font-mono font-extrabold text-xs text-slate-900 tracking-wide">
                                              {c.code}
                                            </span>
                                          </div>
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                            {discountLabel}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-slate-500 italic">
                                    Ketik kode kupon promo yang Anda miliki di kotak bawah.
                                  </p>
                                )}
                              </div>
                            )}

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

                          {/* Payment Method Selector - NEW UI with Logos */}
                          <PaymentMethodSelector
                            methods={paymentMethods}
                            selectedMethod={selectedPaymentMethod}
                            onSelect={(method) => setSelectedPaymentMethod(method.name)}
                            title="Pilih Metode Pembayaran"
                          />

                          {/* Upload Bukti Transfer (Opsional saat submit / resubmit) */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>Upload Bukti Pembayaran (Opsional)</span>
                              {adPaymentProofPreview && (
                                <span className="text-[11px] text-[#059669] font-semibold">
                                  {adPaymentProofFile ? "Foto baru dipilih" : "Bukti pembayaran tersimpan"}
                                </span>
                              )}
                            </label>

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
                                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#059669] hover:file:bg-teal-100 cursor-pointer"
                                />
                                {resubmittingAdId && removeExistingProof && (
                                  <span className="text-[11px] text-amber-600 font-medium block mt-1">
                                    * Foto bukti sebelumnya telah dihapus. Anda dapat mengunggah foto bukti baru atau menyimpannya tanpa bukti.
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
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              isPremium ? "bg-amber-100 text-amber-800" : "bg-teal-50 text-[#059669]"
                            }`}>
                              {isPremium ? "Premium Hero Ads" : "Standard Ticker Ads"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                            <span>Paket: <strong>{ad.package_name || "Iklan"}</strong></span>
                            <span>•</span>
                            <span>Durasi: <strong>{ad.duration_days || 7} Hari</strong></span>
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

                      {/* Payment Account Instruction */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          1. Metode Pembayaran & Rekening Tujuan
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: "Transfer Bank Mandiri", tag: "Mandiri", color: "bg-[#003d79]" },
                            { name: "Transfer Bank BNI", tag: "BNI", color: "bg-[#f15a24]" },
                            { name: "Transfer Bank BCA", tag: "BCA", color: "bg-[#00529c]" },
                            { name: "Transfer Bank Maybank", tag: "Maybank", color: "bg-[#ffc800] !text-slate-900" },
                            { name: "Transfer Bank BJB", tag: "BJB", color: "bg-[#0072bc]" },
                            { name: "OVO", tag: "OVO", color: "bg-[#4c2a86]" },
                            { name: "DANA", tag: "DANA", color: "bg-[#008ce5]" },
                            { name: "GoPay", tag: "GoPay", color: "bg-[#00a5cf]" },
                          ].map((pm) => {
                            const isSelected = resubmitPaymentMethod === pm.name;
                            return (
                              <div
                                key={pm.name}
                                onClick={() => setResubmitPaymentMethod(pm.name)}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-[#007570] bg-teal-50/50 text-[#059669] font-bold shadow-2xs"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-black text-white ${pm.color} mb-1`}>
                                  {pm.tag}
                                </span>
                                <span className="block truncate text-[11px] font-semibold">{pm.name}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-slate-500">Nomor Rekening / E-Wallet ({resubmitPaymentMethod}):</span>
                            <div className="text-base font-black text-slate-900 tracking-wider">
                              {getPaymentNumber(resubmitPaymentMethod)}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">a.n {OFFICIAL_ACCOUNT_HOLDER}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(getPaymentNumber(resubmitPaymentMethod));
                              setCopyToast(true);
                              setTimeout(() => setCopyToast(false), 2000);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
                          >
                            <Copy size={13} />
                            {copyToast ? "Tersalin!" : "Salin No"}
                          </button>
                        </div>
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
                          <span className="font-bold text-slate-900">{ad.duration_days || 7} Hari</span>
                        </div>
                        {ad.start_date && (
                          <div>
                            <span className="text-slate-400 block font-medium">Tanggal Mulai:</span>
                            <span className="font-bold text-slate-900">{new Date(ad.start_date).toLocaleDateString("id-ID")}</span>
                          </div>
                        )}
                        {ad.end_date && (
                          <div>
                            <span className="text-slate-400 block font-medium">Tanggal Selesai:</span>
                            <span className="font-bold text-slate-900">{new Date(ad.end_date).toLocaleDateString("id-ID")}</span>
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

                      <div className="flex justify-end pt-2">
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
                      <label className="text-xs font-bold text-slate-700 block">Pilih Rekening / E-Wallet</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          "Transfer Bank Mandiri",
                          "Transfer Bank BNI",
                          "Transfer Bank BCA",
                          "Transfer Bank Maybank",
                          "Transfer Bank BJB",
                          "OVO",
                          "DANA",
                          "GoPay"
                        ].map((pm) => (
                          <div
                            key={pm}
                            onClick={() => setSelectedPaymentMethod(pm)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              selectedPaymentMethod === pm ? "border-[#007570] bg-teal-50 text-[#059669] font-bold" : "border-slate-200 text-slate-700"
                            }`}
                          >
                            <span>{pm}</span>
                            {selectedPaymentMethod === pm && <CheckCircle size={14} />}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 text-[11px] block">No Rekening / E-Wallet ({selectedPaymentMethod}):</span>
                          <span className="font-black text-slate-900 text-sm">{getPaymentNumber(selectedPaymentMethod)}</span>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">a.n {OFFICIAL_ACCOUNT_HOLDER}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getPaymentNumber(selectedPaymentMethod));
                            setCopyToast(true);
                            setTimeout(() => setCopyToast(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          {copyToast ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
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
                    {(() => {
                      const activeProdBiz = businesses.find(b => String(b.id) === String(selectedBusinessForProducts));
                      const isActiveProdBizPrem = Boolean(activeProdBiz?.is_premium || activeProdBiz?.raw?.is_premium || activeProdBiz?.raw?.features?.is_premium);
                      const isProdLimit3Reached = !isActiveProdBizPrem && products.length >= 3;

                      return (
                        <>
                          {isProdLimit3Reached && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                              <div className="flex items-start gap-2.5">
                                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                <div>
                                  <p className="font-bold">Batas Maksimal 3 Produk Tercapai (Paket Free)</p>
                                  <p className="text-amber-700 text-[11.5px] mt-0.5">
                                    Bisnis <strong>{activeProdBiz?.name}</strong> menggunakan paket Free ({products.length}/3 produk). Upgrade ke Premium untuk produk tanpa batas.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveTab("premium")}
                                className="px-3.5 py-1.5 bg-[#059669] hover:bg-[#005f5b] text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
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
                              className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                if (isProdLimit3Reached) {
                                  alert("Bisnis Free dibatasi maksimal 3 produk. Silakan upgrade ke paket Premium untuk menambahkan produk tanpa batas.");
                                  setActiveTab("premium");
                                } else {
                                  navigate(`/add-product/${selectedBusinessForProducts}`);
                                }
                              }}
                              disabled={!selectedBusinessForProducts}
                            >
                              <Plus size={18} strokeWidth={2.5} />
                              <span>Tambah Produk</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}

                    {/* Loading State */}
                    {loadingProducts ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                        <Loader2 className="animate-spin text-[#059669]" size={42} />
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
                                      src={product.image ? getStorageUrl(product.image) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='176'%3E%3Crect width='200' height='176' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2364748b'%3EProduk%3C/text%3E%3C/svg%3E"}
                                      alt={product.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      onError={(e) => { e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='176'%3E%3Crect width='200' height='176' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2364748b'%3EProduk%3C/text%3E%3C/svg%3E"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                <div className="flex flex-col items-center justify-center p-[80px_20px] gap-[16px] text-[#64748b] text-[14px] font-medium">
                  <Loader2 size={36} className="animate-spin text-[#059669]" />
                  <p>Memuat data profil...</p>
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
                              console.log("Avatar image loaded successfully:", photoPreview);
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
                    placeholder="Jakarta"
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
                  placeholder="DKI Jakarta"
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
                  <BarChart size={20} className="text-[#059669]" />
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
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                        <Calendar size={14} className="text-[#059669]" />
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
                  <Loader2 size={24} className="animate-spin text-[#059669]" />
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
                      className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
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
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-colors shadow-md cursor-pointer active:scale-95"
              >
                <Camera size={16} />
                <span>Jepret Foto Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL PENARIKAN SALDO REFERRAL ── */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1100] flex items-center justify-center p-4"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet size={20} className="text-[#059669]" />
                Penarikan Saldo Komisi Referral
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {withdrawSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Pengajuan Penarikan Berhasil!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{withdrawSuccessMsg}</p>
                <button
                  onClick={() => {
                    setWithdrawSuccessMsg("");
                    setShowWithdrawModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#059669] text-white font-bold text-xs cursor-pointer hover:bg-[#005a58]"
                >
                  Tutup Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setWithdrawErrorMsg("");
                  setSubmittingWithdraw(true);
                  try {
                    const res = await api.post("/referrals/withdraw", {
                      bank: withdrawForm.bank,
                      account_number: withdrawForm.accountNumber,
                      account_holder: withdrawForm.accountHolder,
                      amount: Number(withdrawForm.amount),
                    });
                    if (res.data?.success) {
                      setWithdrawSuccessMsg(
                        res.data.message ||
                        `Permohonan penarikan Rp ${Number(withdrawForm.amount).toLocaleString("id-ID")} ke ${withdrawForm.bank} (${withdrawForm.accountNumber}) atas nama ${withdrawForm.accountHolder} telah diterima dan sedang diproses admin.`
                      );
                      fetchReferralStats();
                    }
                  } catch (err) {
                    setWithdrawErrorMsg(err.response?.data?.message || "Gagal mengajukan penarikan saldo. Pastikan saldo mencukupi dan data benar.");
                  } finally {
                    setSubmittingWithdraw(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-800">Saldo Komisi Tersedia:</span>
                  <span className="text-base font-black text-[#059669]">
                    Rp {availableReferralBalance.toLocaleString("id-ID")}
                  </span>
                </div>

                {withdrawErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>{withdrawErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Metode Penarikan (Bank / E-Wallet)</label>
                  <select
                    value={withdrawForm.bank}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, bank: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007570]"
                  >
                    <option value="BCA">Bank BCA</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="DANA">DANA</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Rekening / HP E-Wallet</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 8830123456"
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#007570]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai nama di buku tabungan / akun"
                    value={withdrawForm.accountHolder}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#007570]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Jumlah Penarikan (Rp)</label>
                  <input
                    type="number"
                    required
                    min={50000}
                    max={availableReferralBalance || 50000}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#007570]"
                  />
                  <p className="text-[11px] text-slate-400">Minimal penarikan Rp 50.000</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawErrorMsg("");
                      setShowWithdrawModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWithdraw || availableReferralBalance < 50000}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#005a58] text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {submittingWithdraw ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Kirim Pengajuan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
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
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedReferralTx.id}</p>
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
                  <span className="font-bold text-slate-900">{selectedReferralTx.userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedReferralTx.userEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bisnis Terkait:</span>
                  <span className="font-semibold text-slate-800">{selectedReferralTx.businessName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Layanan Pembelian:</span>
                  <span className="font-bold text-[#059669]">{selectedReferralTx.service}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Waktu Transaksi:</span>
                  <span className="font-semibold text-slate-700">{selectedReferralTx.date}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Harga Layanan (Normal):</span>
                  <span className="font-bold text-slate-900">Rp {(selectedReferralTx.original_amount || selectedReferralTx.amount || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Diskon Kode Referral (Rp 5.000):</span>
                  <span className="font-semibold text-rose-600">- Rp {(selectedReferralTx.discount_amount || selectedReferralTx.discount || 5000).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Dibayar Pembeli:</span>
                  <span className="font-bold text-slate-900">Rp {(selectedReferralTx.final_price || selectedReferralTx.amount || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-emerald-900">Komisi Hak Anda (Rp 10.000):</span>
                  <span className="font-black text-emerald-700 text-base">+ Rp {(selectedReferralTx.commission_amount || selectedReferralTx.commission || 10000).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                <span className="text-slate-600 font-semibold">Status Payout Saldo:</span>
                <span className="font-bold text-[#059669]">{selectedReferralTx.payoutStatus || selectedReferralTx.payout_status}</span>
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
    </div>
  );
}