import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useParams, Link } from "react-router-dom";
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
  Gift,
  Wallet,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Send,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  ExternalLink,
} from "lucide-react";

import logoImg from "../../assets/logo.png";

import api from "../../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../../utils/constants";

const UPGRADE_PAYMENT_METHODS = [
  {
    category: "E-Wallet",
    items: [
      { id: "DANA", name: "DANA", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#008cff] text-white" },
      { id: "GoPay", name: "GoPay", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#00a5cf] text-white" },
      { id: "OVO", name: "OVO", accountName: "Info.co.id", accountNumber: "0812-3456-7890", badgeColor: "bg-[#4c2a86] text-white" },
    ]
  },
  {
    category: "Virtual Account / Transfer Bank",
    items: [
      { id: "BCA VA", name: "BCA Virtual Account", accountName: "PT Info Media", accountNumber: "8830-1234-5678", badgeColor: "bg-[#00529c] text-white" },
      { id: "Mandiri VA", name: "Mandiri Virtual Account", accountName: "PT Info Media", accountNumber: "137-00-1234-5678", badgeColor: "bg-[#003d79] text-white" },
    ]
  }
];

const getCategoryDisplayName = (cat) => {
  if (!cat) return "Usaha";
  if (typeof cat === "string") return cat;
  if (typeof cat === "object") return cat.name || cat.title || "Usaha";
  return String(cat);
};

export default function AdminUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tab: paramTab } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname.includes("/inbox")) return "inbox";
    if (window.location.pathname.includes("/premium")) return "premium";
    return searchParams.get("tab") || paramTab || "dashboard";
  });

  useEffect(() => {
    if (window.location.pathname.includes("/inbox")) {
      setActiveTab("inbox");
    } else if (window.location.pathname.includes("/premium")) {
      setActiveTab("premium");
    } else if (paramTab) {
      setActiveTab(paramTab);
    } else if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab"));
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
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(b => ({
        ...b,
        category: getCategoryDisplayName(b.category)
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

  const getSelectedPackageObj = () => {
    if (!selectedPackage) return null;
    return adPackages.find(p => p.name === selectedPackage || p.id === selectedPackage || String(p.id) === String(selectedPackage)) || null;
  };

  const getSelectedBusinessObj = () => {
    if (!selectedBusinessForAd) return null;
    return businesses.find(b => b.id === Number(selectedBusinessForAd) || b.id === selectedBusinessForAd || String(b.id) === String(selectedBusinessForAd)) || null;
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
  const [selectedReferralTx, setSelectedReferralTx] = useState(null);

  // Real Referral State from Backend API
  const [referralStats, setReferralStats] = useState({
    referral_code: user?.referral_code || "",
    total_usages: 0,
    successful_referrals: 0,
    earned_commission: 0,
    pending_commission: 0,
    paid_commission: 0,
  });
  const [referralTransactions, setReferralTransactions] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState("");

  const fetchReferralStats = async () => {
    setLoadingReferrals(true);
    setReferralError("");
    try {
      const res = await api.get("/referrals/my-stats");
      if (res.data && res.data.success) {
        const data = res.data.data;
        setReferralStats({
          referral_code: data.referral_code || user?.referral_code || "",
          total_usages: data.total_usages || 0,
          successful_referrals: data.successful_referrals || 0,
          earned_commission: data.earned_commission || 0,
          pending_commission: data.pending_commission || 0,
          paid_commission: data.paid_commission || 0,
        });
        setReferralTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch referral stats:", err);
      setReferralError("Gagal memuat data referral.");
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (activeTab === "referral" || activeTab === "reseller") {
      fetchReferralStats();
    }
  }, [activeTab]);

  const referralCode = referralStats.referral_code || user?.referral_code || "INFO-REF";
  const totalReferralEarnings = referralStats.earned_commission;
  const pendingReferralEarnings = referralStats.pending_commission;
  const paidReferralEarnings = referralStats.paid_commission;
  const totalReferralUsage = referralStats.total_usages;
  const successReferralCount = referralStats.successful_referrals;

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
          businessName: r.business ? r.business.name : "Bisnis",
          businessLogo: r.business
            ? r.business.logo
              ? getStorageUrl(r.business.logo)
              : null
            : null,
          businessSlug: r.business ? r.business.slug : null,
          rating: r.rating || 0,
          review: r.review || "",
          user: r.user ? r.user.name : "Pengguna",
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
        setUpgradeReferralSuccessMsg(res.data.message || "Kode referral valid! Diskon 5% berhasil diterapkan.");
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
    if (!upgradeProofFile) {
      setUpgradeError("Wajib mengunggah bukti pembayaran sebelum mengirim permohonan.");
      return;
    }

    setSubmittingUpgrade(true);
    setUpgradeError("");

    try {
      const formData = new FormData();
      formData.append("business_id", targetBizId);
      formData.append("plan_id", selectedUpgradePlan.id);
      if (appliedUpgradeCoupon?.code) {
        formData.append("coupon_code", appliedUpgradeCoupon.code);
      }
      if (appliedUpgradeReferral?.referral_code) {
        formData.append("referral_code", appliedUpgradeReferral.referral_code);
      }
      formData.append("payment_method", upgradePaymentMethod);
      formData.append("proof", upgradeProofFile);

      const res = await api.post("/subscriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const bizObj = businesses.find(b => String(b.id) === String(targetBizId));
      setUpgradeSuccessData({
        businessName: bizObj?.name || "Usaha Anda",
        planName: selectedUpgradePlan.name,
        finalPrice: calculateUpgradePrice().finalPrice,
        paymentMethod: upgradePaymentMethod,
        submittedAt: new Date().toLocaleString("id-ID"),
        message: res.data?.message || "Permohonan upgrade premium berhasil diajukan!"
      });
      setPremiumStep(5);
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
            opening_hours: b.opening_hours || b.hours || "08:00 - 17:00 WIB",
            opening_days: b.opening_days || ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
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

  // Lazy Tab-based Data Loader (Prevents 7 parallel API requests on mount)
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchUserStats();
    } else if (activeTab === "bisnis") {
      fetchBusinesses();
    } else if (activeTab === "iklan") {
      fetchAdvertisements();
      fetchAdPackages();
      fetchBusinesses();
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
        return { title: "Panel Admin User", desc: "Halaman administrator portal Info.co.id" };
    }
  };

  const pageInfo = getPageInfo();

  // Sidebar Menu list configured based on request
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "bisnis", name: "Bisnis", icon: Briefcase },
    { id: "blog-event", name: "Blog & Event", icon: FileText },
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
      <main className={`flex-1 min-h-screen min-w-0 max-w-full flex flex-col transition-all duration-[280ms] overflow-x-hidden ${isCollapsed ? "ml-[68px]" : "ml-[240px]"}`}>
        <header className="sticky top-0 z-[100] flex items-center justify-between px-[28px] max-md:px-[16px] h-[60px] bg-white/85 backdrop-blur-md border-b border-[#e2e8f0] gap-[16px]">
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold text-[#0f172a] leading-[1.2] truncate">{pageInfo.title}</h1>
            <p className="text-[12px] text-[#64748b] mt-[1px] truncate">{pageInfo.desc}</p>
          </div>
          <div className="flex items-center gap-[14px] shrink-0">
            <div className="flex items-center gap-[8px] p-[6px_12px_6px_6px] rounded-full bg-[#f1f5f9] text-[13px] text-[#64748b] cursor-pointer transition-all duration-[280ms] hover:bg-[rgba(0,117,112,0.12)]" onClick={() => setActiveTab("profile")}>
              <img
                src={profileData.avatar}
                alt="user avatar"
                className="w-[24px] h-[24px] rounded-full object-cover"
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
                    <div className="text-[20px] sm:text-[22px] font-extrabold text-[#0f172a] leading-tight mb-[3px]">{userStats ? (userStats.total_events + userStats.total_blogs) : events.length}</div>
                    <div className="flex items-center gap-[3px] text-[10.5px] font-medium text-[#10b981] truncate">
                      <TrendingUp size={11} className="shrink-0" /> <span className="truncate">{userStats ? `${userStats.total_blog_views} views` : "Blog & Event"}</span>
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
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center shrink-0 bg-[#f0fdfa] text-[#007570]">
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
                      className="text-[12px] font-semibold text-[#007570] cursor-pointer px-[10px] py-[4px] rounded-[8px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa] shrink-0"
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
                        <span className="text-[10.5px] text-[#64748b] font-medium group-hover:text-[#007570] transition-colors truncate">{d.day}</span>
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
                      className="text-[12px] font-semibold text-[#007570] cursor-pointer px-[10px] py-[4px] rounded-[8px] border border-[rgba(0,117,112,0.25)] transition-all duration-[280ms] hover:bg-[#f0fdfa] shrink-0"
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
                              {act.subText} • <span className="font-semibold text-[#007570]">{act.dateStr}</span>
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
                      <div className="w-full overflow-hidden border border-[#e2e8f0] rounded-[12px] shadow-sm bg-white">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                              <th className="px-3.5 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[38%]">Bisnis & Kategori</th>
                              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] w-[26%]">Lokasi & Jam Buka</th>
                              <th className="px-2 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center w-[10%]">Produk</th>
                              <th className="px-2.5 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-center w-[12%]">Status</th>
                              <th className="px-3 py-2.5 text-[11px] font-semibold text-[#64748b] uppercase tracking-[0.05em] text-right w-[14%]">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f1f5f9]">
                            {currentItems.map((biz) => {
                              const st = (biz.status || biz.raw?.status || "").toLowerCase();
                              const isApproved = st === "approved" || st === "published" || st === "active" || st === "aktif" || st === "disetujui";
                              const isPending = st === "pending" || st === "menunggu";
                              const isRejected = st === "rejected" || st === "ditolak";

                              return (
                                <tr key={biz.id} className="hover:bg-[#f8fafc] transition-colors">
                                  {/* Bisnis & Kategori + Thumbnail Foto */}
                                  <td className="px-3.5 py-2.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-[38px] h-[38px] rounded-[10px] overflow-hidden bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center shrink-0">
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
                                          <Briefcase size={17} />
                                        </div>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-[13px] text-[#0f172a] truncate max-w-[160px] sm:max-w-[200px]" title={biz.name}>
                                            {biz.name}
                                          </span>
                                          {Boolean(biz.is_premium || biz.raw?.is_premium || biz.raw?.features?.is_premium) ? (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                                              ⭐ Premium
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                              Free
                                            </span>
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
                                          <div className="mt-1 p-1.5 bg-[#fef2f2] border border-[#fca5a5] rounded-md text-[10.5px] text-[#b91c1c]">
                                            <strong>Alasan Ditolak:</strong> {biz.rejection_reason || biz.raw?.rejection_reason || "Periksa data usaha."}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Lokasi & Jam Buka */}
                                  <td className="px-3 py-2.5">
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                                        <MapPin size={13} className="text-[#007570] shrink-0" />
                                        {biz.city || "Indonesia"}
                                      </span>
                                      {(() => {
                                        const hours = biz.opening_hours || biz.raw?.opening_hours || "08:00 - 17:00 WIB";
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
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#007570] border border-[#ccfbf1]">
                                      <Package size={11} />
                                      {biz.products?.length || 0} Item
                                    </span>
                                  </td>

                                  {/* Status & Tanggal */}
                                  <td className="px-2.5 py-2.5 text-center">
                                    <div className="flex flex-col items-center gap-0.5">
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
                                      <span className="text-[10px] text-[#94a3b8] font-medium">
                                        {biz.date}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="px-3 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      {/* View */}
                                      <button
                                        onClick={() => navigate(`/business/${biz.raw?.slug || biz.id}`)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#eff6ff] text-[#2563eb] hover:bg-[#2563eb] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Lihat Halaman Bisnis"
                                      >
                                        <Eye size={14} />
                                      </button>
                                      {/* Edit */}
                                      <button
                                        onClick={() => navigate(`/add-business/${biz.id}`)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#fefce8] text-[#ca8a04] hover:bg-[#ca8a04] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                        title="Edit Profil Bisnis"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      {/* Manage Products */}
                                      <button
                                        onClick={() => navigate(`/add-product/${biz.id}`)}
                                        className="w-[30px] h-[30px] rounded-lg bg-[#f0fdfa] text-[#007570] hover:bg-[#007570] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                      <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse table-fixed">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-3.5 w-[44%] font-semibold">Artikel & Event</th>
                              <th className="py-2.5 px-3 w-[24%] font-semibold">Kategori & Tanggal</th>
                              <th className="py-2.5 px-2.5 w-[16%] text-center font-semibold">Status</th>
                              <th className="py-2.5 px-3 w-[16%] text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentData.map((item) => {
                              const st = (item.status || "").toLowerCase();
                              const isApproved = st === "approved" || st === "published" || st === "terbit";
                              const isPending = st === "pending" || st === "menunggu";
                              const isRejected = st === "rejected" || st === "ditolak";

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
                                          className="font-bold text-slate-900 text-[13px] truncate block leading-snug cursor-pointer hover:text-[#007570] transition-colors"
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
                                          <div className="mt-1 p-1.5 bg-red-50 border border-red-200 rounded-md text-[10.5px] text-red-700">
                                            <strong>Alasan Ditolak:</strong> {item.rejection_reason || "Periksa kembali artikel/event Anda."}
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
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                        isApproved
                                          ? "bg-[#e6f4ea] text-[#137333] border border-[#bbf7d0]"
                                          : isPending
                                          ? "bg-[#fef7e0] text-[#b06000] border border-[#fef08a]"
                                          : isRejected
                                          ? "bg-[#fce8e6] text-[#c5221f] border border-[#fecaca]"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          isApproved ? "bg-[#16a34a]" : isPending ? "bg-[#ca8a04]" : "bg-[#dc2626]"
                                        }`}
                                      />
                                      {isApproved ? "Disetujui" : isPending ? "Menunggu" : isRejected ? "Ditolak" : "Draft"}
                                    </span>
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="py-2.5 px-3 text-right align-middle">
                                    <div className="flex items-center justify-end gap-1">
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
                                        onClick={() => navigate(`/add-blog/${item.id}?type=${item.itemType}`)}
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

          {/* 4. INBOX / CHAT VIEW */}
          {activeTab === "inbox" && (
            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4 md:gap-5 h-[calc(100vh-140px)] min-h-[550px] max-h-[850px] overflow-hidden">
              {/* LEFT PANEL: Daftar Conversation */}
              <div className={`bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm ${activeConversationId ? "max-md:hidden" : "w-full"}`}>
                <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Mail size={18} className="text-[#007570]" />
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
                      <Loader2 size={28} className="animate-spin text-[#007570]" />
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
                            <img
                              src={conv.business_logo ? getStorageUrl(conv.business_logo) : (conv.counterparty_avatar ? getStorageUrl(conv.counterparty_avatar) : DEFAULT_AVATAR)}
                              alt={conv.business_name}
                              className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
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

                        <img
                          src={activeChatData.business?.logo ? getStorageUrl(activeChatData.business.logo) : DEFAULT_AVATAR}
                          alt={activeChatData.business?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                          onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        />

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {activeChatData.business?.name || "Detail Bisnis"}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#007570] font-bold text-[10px]">
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
                          <Loader2 size={24} className="animate-spin text-[#007570]" />
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
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs md:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
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
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-teal-800/40">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                      <Gift size={14} /> Program Kemitraan & Referral
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Dapatkan Komisi 10% Dari Setiap Referral!
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      Bagikan kode unik Anda kepada rekan usaha atau kerabat. Teman Anda mendapat potongan harga saat bertransaksi, dan Anda otomatis menerima komisi tunai sebesar 10%.
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
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kode Referral Saya</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007570] flex items-center justify-center font-bold">
                      <Gift size={20} />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between gap-2 border border-slate-800">
                    <span className="font-mono text-base md:text-lg font-black text-teal-400 tracking-wider">
                      {referralCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        setReferralCopyToast(true);
                        setTimeout(() => setReferralCopyToast(false), 2500);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin Kode Referral"
                    >
                      {referralCopyToast ? <Check size={14} /> : <Copy size={14} />}
                      <span>{referralCopyToast ? "Tersalin!" : "Salin"}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Bonus Teman: <strong className="text-slate-800">Diskon 5%</strong></span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/register?ref=${referralCode}`;
                        navigator.clipboard.writeText(link);
                        setReferralLinkCopyToast(true);
                        setTimeout(() => setReferralLinkCopyToast(false), 2500);
                      }}
                      className="text-[#007570] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 size={12} />
                      <span>{referralLinkCopyToast ? "Link Tersalin!" : "Bagikan Link"}</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Total Pendapatan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pendapatan (Komisi)</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      Rp {totalReferralEarnings.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 size={13} /> komisi terverifikasi
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Minimal penarikan: Rp 50.000</span>
                  </div>
                </div>

                {/* Card 3: Berapa Kali Kode Dipakai */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Penggunaan Kode</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
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
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Komisi Pending</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
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

              {/* Panduan Cara Kerja Program Referral */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Target size={18} className="text-[#007570]" />
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
                        Pengguna mendaftar dengan kode Anda dan membeli Paket Premium dengan potongan diskon 5%.
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
                        Komisi tunai 10% otomatis masuk setelah pembayaran diverifikasi admin dan dapat ditarik kapan saja.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Riwayat Transaksi Referral */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={18} className="text-[#007570]" />
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
                        <th className="py-3 px-4 text-right">Komisi Anda (10%)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {loadingReferrals ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-500">
                            <Loader2 size={24} className="animate-spin mx-auto text-[#007570] mb-2" />
                            <p className="text-xs font-medium">Memuat data referral...</p>
                          </td>
                        </tr>
                      ) : filteredReferralTransactions.length > 0 ? (
                        filteredReferralTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#007570]">
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
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                              + Rp {tx.commission.toLocaleString("id-ID")}
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
                              Bagikan kode referral Anda ({referralCode}) ke rekan bisnis untuk mulai mendapatkan komisi 10% dari setiap pembelian Paket Premium.
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
                      className="px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : loadingSavedItems ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2.5">
                    <Loader2 size={32} className="animate-spin text-[#007570]" />
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

                {/* ── Table / Loading / Error / Empty ── */}
                {reviewsError ? (
                  <div className="bg-white border border-rose-200 rounded-[13px] p-[36px_24px] flex flex-col items-center justify-center text-center">
                    <div className="w-[50px] h-[50px] rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-[10px]">
                      <AlertCircle size={24} />
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-800 mb-[4px]">{reviewsError}</h4>
                    <button
                      onClick={fetchReviews}
                      className="mt-[8px] px-[14px] py-[6px] bg-[#007570] text-white font-semibold rounded-[8px] text-[12px] hover:bg-[#005a58] transition-colors cursor-pointer"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : loadingReviews ? (
                  <div className="flex flex-col items-center justify-center py-[50px] gap-[10px] bg-white border border-[#e2e8f0] rounded-[13px]">
                    <Loader2 size={28} className="text-[#007570] animate-spin" />
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
            })()
          )}


          {/* 8. PREMIUM VIEW */}
          {activeTab === "premium" && (
            <div className="flex flex-col gap-[24px] max-w-[1000px] mx-auto w-full">
              {/* Header Banner */}
              <div className="flex items-center gap-[16px] bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm">
                <Crown size={32} className="text-[#f59e0b] shrink-0" />
                <div>
                  <h2 className="text-[18px] font-bold text-[#0f172a]">Upgrade Usaha ke Premium</h2>
                  <p className="text-[13px] text-[#64748b]">Tingkatkan visibilitas, jangkauan pelanggan, dan nikmati fitur eksklusif untuk usaha Anda</p>
                </div>
              </div>

              {/* Multi-Step Indicator (Step 1 to 4) */}
              {premiumStep < 5 && (
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[16px_20px] shadow-sm overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[560px] gap-[10px]">
                    {[
                      { stepNum: 1, label: "1. Pilih Paket & Usaha", icon: Crown },
                      { stepNum: 2, label: "2. Ringkasan & Promo", icon: FileText },
                      { stepNum: 3, label: "3. Metode Bayar", icon: CreditCard },
                      { stepNum: 4, label: "4. Upload Bukti", icon: Upload },
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      const isActive = premiumStep === s.stepNum;
                      const isCompleted = premiumStep > s.stepNum;
                      return (
                        <div key={s.stepNum} className="flex items-center gap-[10px] flex-1 last:flex-initial">
                          <div className="flex items-center gap-[8px]">
                            <div
                              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                                isCompleted
                                  ? "bg-[#10b981] text-white"
                                  : isActive
                                  ? "bg-[#007570] text-white shadow-[0_0_0_3px_rgba(0,117,112,0.2)]"
                                  : "bg-[#f1f5f9] text-[#94a3b8]"
                              }`}
                            >
                              {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                            </div>
                            <span
                              className={`text-[12.5px] font-semibold whitespace-nowrap ${
                                isActive ? "text-[#007570]" : isCompleted ? "text-[#0f172a]" : "text-[#94a3b8]"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                          {idx < 3 && (
                            <div
                              className={`flex-1 h-[2px] mx-[6px] rounded-full transition-all ${
                                isCompleted ? "bg-[#10b981]" : "bg-[#e2e8f0]"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 1: PILIH USAHA & PAKET PREMIUM ── */}
              {premiumStep === 1 && (
                <div className="flex flex-col gap-[20px]">
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
                          {(businesses || []).map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({getCategoryDisplayName(b.category)}) — {b.city || "Lokasi"} {b.is_premium ? "⭐ [Sudah Premium]" : ""}
                            </option>
                          ))}
                        </select>

                        {/* Selected Business Preview Card */}
                        {(() => {
                          const currentBizId = selectedUpgradeBusiness || (businesses[0]?.id || "");
                          const currentBiz = (businesses || []).find(b => String(b.id) === String(currentBizId)) || businesses?.[0];
                          if (!currentBiz) return null;

                          return (
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
                                    <MapPin size={12} className="text-[#007570]" />
                                    <span>{currentBiz.city || "Indonesia"}</span>
                                    <span>•</span>
                                    <span>{getCategoryDisplayName(currentBiz.category)}</span>
                                  </p>
                                </div>
                              </div>
                              <div>
                                {currentBiz.is_premium ? (
                                  <span className="px-[10px] py-[4px] bg-[#fef3c7] text-[#b45309] rounded-full text-[11.5px] font-bold flex items-center gap-[4px]">
                                    ⭐ Premium Aktif
                                  </span>
                                ) : (
                                  <span className="px-[10px] py-[4px] bg-[#f1f5f9] text-[#64748b] rounded-full text-[11.5px] font-semibold">
                                    Paket Reguler / Free
                                  </span>
                                )}
                              </div>
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
                        <Loader2 size={36} className="animate-spin text-[#007570]" />
                        <p className="text-[13px] font-medium">Memuat paket premium terbaru...</p>
                      </div>
                    ) : premiumPlans.length > 0 ? (
                      <div className={`grid grid-cols-1 ${premiumPlans.length === 1 ? 'max-w-[480px] mx-auto w-full' : premiumPlans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-[20px]`}>
                        {premiumPlans.map((plan) => {
                          const isFree = Number(plan.price) === 0;
                          const isPopular = plan.priority_listing || plan.name.toLowerCase().includes("premium");
                          const isSelected = selectedUpgradePlan?.id === plan.id;
                          const formattedDuration = plan.formatted_duration || (
                            plan.duration_value
                              ? `${plan.duration_value} ${plan.duration_unit === 'day' || plan.duration_unit === 'hari' ? 'Hari' : plan.duration_unit === 'year' || plan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`
                              : "1 Bulan"
                          );

                          return (
                            <div
                              key={plan.id}
                              onClick={() => {
                                if (!isFree) setSelectedUpgradePlan(plan);
                              }}
                              className={`rounded-[20px] p-[24px] flex flex-col justify-between relative border-2 transition-all cursor-pointer overflow-hidden ${
                                isFree
                                  ? "bg-slate-50 border-slate-200"
                                  : isSelected
                                  ? "bg-gradient-to-b from-[#0c2b27] via-[#053733] to-[#021f1d] text-white border-amber-400 shadow-[0_12px_32px_rgba(0,117,112,0.35),0_0_24px_rgba(251,191,36,0.25)] -translate-y-1 ring-4 ring-amber-400/20"
                                  : "bg-gradient-to-b from-[#0e3530] via-[#082e29] to-[#041d1a] text-white border-[#009990]/40 hover:border-amber-400/70 hover:shadow-[0_8px_24px_rgba(0,117,112,0.25)]"
                              }`}
                            >
                              {!isFree && (
                                <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-amber-400/20 to-[#00c48c]/30 rounded-full blur-2xl pointer-events-none" />
                              )}

                              <div>
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  {isFree ? (
                                    <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10.5px] rounded-full uppercase tracking-wider">
                                      REGULER
                                    </span>
                                  ) : (
                                    <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-sm">
                                      <span>REKOMENDASI</span>
                                    </div>
                                  )}

                                  <div
                                    className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all ${
                                      isSelected
                                        ? "border-amber-400 bg-amber-400 text-slate-950 font-bold"
                                        : isFree
                                        ? "border-slate-300 bg-white"
                                        : "border-emerald-400/50 bg-emerald-950/40 text-emerald-300"
                                    }`}
                                  >
                                    {isSelected && <Check size={13} strokeWidth={3} />}
                                  </div>
                                </div>

                                <h3 className={`text-[17px] font-extrabold mb-1 ${isFree ? "text-[#0f172a]" : "text-white"}`}>{plan.name}</h3>

                                <div className="flex items-baseline gap-1 my-2">
                                  <span className={`text-[24px] font-black ${isFree ? "text-slate-700" : "text-white"}`}>
                                    {isFree ? "Rp 0" : `Rp ${Number(plan.price).toLocaleString("id-ID")}`}
                                  </span>
                                  <span className={`text-[11.5px] font-semibold ${isFree ? "text-slate-400" : "text-emerald-200/80"}`}>
                                    {isFree ? "selamanya" : `/ ${formattedDuration}`}
                                  </span>
                                </div>

                                {plan.description && (
                                  <p className={`text-[11.5px] mb-3 leading-relaxed ${isFree ? "text-slate-500" : "text-slate-300"}`}>{plan.description}</p>
                                )}

                                <ul className={`flex flex-col gap-[9px] my-[16px] pt-[14px] border-t ${isFree ? "border-slate-200 text-slate-700" : "border-white/15 text-slate-100"}`}>
                                  <li className="flex items-center gap-[9px] text-[12px]">
                                    {plan.can_add_map ? (
                                      <Check size={14} className={isFree ? "text-emerald-600 shrink-0" : "text-emerald-300 shrink-0"} />
                                    ) : (
                                      <X size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={plan.can_add_map ? "font-medium" : "line-through opacity-60"}>Integrasi Google Maps</span>
                                  </li>
                                  <li className="flex items-center gap-[9px] text-[12px]">
                                    {plan.can_add_gallery ? (
                                      <Check size={14} className={isFree ? "text-emerald-600 shrink-0" : "text-emerald-300 shrink-0"} />
                                    ) : (
                                      <X size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={plan.can_add_gallery ? "font-medium" : "line-through opacity-60"}>Galeri Foto &amp; Video</span>
                                  </li>
                                  <li className="flex items-center gap-[9px] text-[12px]">
                                    {plan.can_add_products !== false ? (
                                      <Check size={14} className={isFree ? "text-emerald-600 shrink-0" : "text-emerald-300 shrink-0"} />
                                    ) : (
                                      <X size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={plan.can_add_products !== false ? "font-medium" : "line-through opacity-60"}>Katalog Produk &amp; Harga</span>
                                  </li>
                                  <li className="flex items-center gap-[9px] text-[12px]">
                                    {plan.can_chat !== false ? (
                                      <Check size={14} className={isFree ? "text-emerald-600 shrink-0" : "text-emerald-300 shrink-0"} />
                                    ) : (
                                      <X size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={plan.can_chat !== false ? "font-medium" : "line-through opacity-60"}>Akses Chat Langsung</span>
                                  </li>
                                  <li className="flex items-center gap-[9px] text-[12px]">
                                    {plan.priority_listing ? (
                                      <Check size={14} className="text-amber-400 shrink-0" />
                                    ) : (
                                      <X size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <span className={plan.priority_listing ? "text-amber-300 font-bold" : "line-through opacity-60"}>Badge Bisnis Terverifikasi &amp; Prioritas</span>
                                  </li>
                                </ul>
                              </div>

                              {isFree ? (
                                <button className="w-full py-[10px] rounded-[12px] bg-slate-200 text-slate-500 font-semibold text-[13px] cursor-not-allowed border-0" disabled>
                                  Paket Reguler
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUpgradePlan(plan);
                                  }}
                                  className={`w-full py-[11px] rounded-[12px] font-bold text-[13.5px] cursor-pointer border-0 transition-all flex items-center justify-center gap-1.5 ${
                                    isSelected
                                      ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 shadow-md shadow-amber-400/30 font-black"
                                      : "bg-[#00c48c] text-slate-950 font-extrabold hover:bg-[#00b074] shadow-md"
                                  }`}
                                >
                                  <span>{isSelected ? "✓ Paket Terpilih" : "Pilih Paket Premium"}</span>
                                </button>
                              )}
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

                  {/* Step 1 Action Bar */}
                  <div className="flex items-center justify-between p-[16px_24px] bg-white border border-[#e2e8f0] rounded-[16px] shadow-sm">
                    <div className="text-[13px] text-[#64748b]">
                      {selectedUpgradePlan ? (
                        <span>
                          Paket terpilih: <strong className="text-[#007570]">{selectedUpgradePlan.name}</strong> (Rp {Number(selectedUpgradePlan.price).toLocaleString("id-ID")})
                        </span>
                      ) : (
                        <span>Pilih salah satu paket premium di atas untuk melanjutkan</span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!selectedUpgradePlan || (businesses?.length || 0) === 0}
                      onClick={() => {
                        const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                        if (!targetBizId) {
                          alert("Silakan daftarkan atau pilih usaha Anda terlebih dahulu.");
                          return;
                        }
                        if (!selectedUpgradePlan) {
                          alert("Silakan pilih salah satu paket premium terlebih dahulu.");
                          return;
                        }
                        setUpgradeError("");
                        setPremiumStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[24px] py-[12px] rounded-[12px] bg-[#007570] text-white font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#005a58] hover:shadow-md disabled:bg-[#cbd5e1] disabled:cursor-not-allowed border-0"
                    >
                      <span>Lanjut ke Ringkasan Pesanan</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: RINGKASAN PESANAN & PROMO (KUPON / REFERRAL) ── */}
              {premiumStep === 2 && (
                <div className="flex flex-col gap-[20px]">
                  {/* Summary of Chosen Business & Plan */}
                  <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[16px]">
                    <h3 className="text-[15px] font-bold text-[#0f172a] border-b border-[#f1f5f9] pb-[12px]">
                      Ringkasan Pemesanan Upgrade
                    </h3>

                    {(() => {
                      const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                      const bizObj = (businesses || []).find(b => String(b.id) === String(targetBizId)) || businesses?.[0];
                      const formattedDuration = selectedUpgradePlan?.formatted_duration || (
                        selectedUpgradePlan?.duration_value
                          ? `${selectedUpgradePlan.duration_value} ${selectedUpgradePlan.duration_unit === 'day' || selectedUpgradePlan.duration_unit === 'hari' ? 'Hari' : selectedUpgradePlan.duration_unit === 'year' || selectedUpgradePlan.duration_unit === 'tahun' ? 'Tahun' : 'Bulan'}`
                          : "1 Bulan"
                      );

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                          <div className="p-[16px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] flex items-center gap-[14px]">
                            <img
                              src={bizObj?.logo ? getStorageUrl(bizObj.logo) : DEFAULT_AVATAR}
                              alt={bizObj?.name || "Bisnis"}
                              className="w-[48px] h-[48px] rounded-[10px] object-cover border border-[#e2e8f0]"
                            />
                            <div>
                              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Usaha Yang Di-Upgrade</span>
                              <h4 className="text-[15px] font-bold text-[#0f172a]">{bizObj?.name || "Usaha Anda"}</h4>
                              <p className="text-[12px] text-[#64748b]">{getCategoryDisplayName(bizObj?.category)} • {bizObj?.city || "Indonesia"}</p>
                            </div>
                          </div>

                          <div className="p-[16px] bg-[#f0fdfa] border border-[#ccfbf1] rounded-[12px] flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-bold text-[#007570] uppercase tracking-wider">Paket Premium Pilihan</span>
                              <h4 className="text-[15px] font-bold text-[#0f172a]">{selectedUpgradePlan?.name}</h4>
                              <p className="text-[12px] text-[#64748b]">Masa Aktif: {formattedDuration}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-[#64748b]">Harga Normal</span>
                              <div className="text-[16px] font-bold text-[#007570]">
                                Rp {Number(selectedUpgradePlan?.price || 0).toLocaleString("id-ID")}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Promo & Discounts Section: Coupon & Referral */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                    {/* Kupon Diskon Card */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-sm flex flex-col justify-between gap-[12px]">
                      <div>
                        <div className="flex items-center gap-[8px] mb-[4px]">
                          <Gift size={18} className="text-[#007570]" />
                          <label className="text-[13px] font-bold text-[#0f172a]">Kupon Diskon (Opsional)</label>
                        </div>
                        <p className="text-[12px] text-[#64748b] mb-[12px]">Masukkan kode kupon promosi jika Anda memilikinya</p>

                        {!appliedUpgradeCoupon ? (
                          <div className="flex gap-[8px]">
                            <input
                              type="text"
                              value={upgradeCouponInput}
                              onChange={(e) => setUpgradeCouponInput(e.target.value.toUpperCase())}
                              placeholder="CONTOH: PROMO50"
                              className="flex-1 px-[14px] py-[10px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#0f172a] uppercase outline-none focus:border-[#007570] focus:bg-white transition-all placeholder:font-normal placeholder:normal-case"
                            />
                            <button
                              type="button"
                              onClick={handleApplyUpgradeCoupon}
                              disabled={upgradeCouponLoading || !upgradeCouponInput.trim()}
                              className="px-[16px] py-[10px] bg-[#007570] text-white text-[13px] font-bold rounded-[10px] transition-all hover:bg-[#005a58] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed border-0 cursor-pointer flex items-center gap-[6px]"
                            >
                              {upgradeCouponLoading ? <Loader2 size={16} className="animate-spin" /> : "Terapkan"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-[10px_14px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px]">
                            <div className="flex items-center gap-[8px]">
                              <CheckCircle2 size={18} className="text-[#10b981]" />
                              <div>
                                <span className="text-[12px] font-bold text-[#15803d]">Kupon: {appliedUpgradeCoupon.code}</span>
                                <p className="text-[11px] text-[#16a34a]">
                                  Potongan: Rp {Number(appliedUpgradeCoupon.discount_amount || 0).toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveUpgradeCoupon}
                              className="text-[11.5px] font-bold text-[#ef4444] hover:underline cursor-pointer bg-transparent border-0"
                            >
                              Hapus
                            </button>
                          </div>
                        )}

                        {upgradeCouponError && (
                          <p className="text-[11.5px] font-medium text-[#ef4444] mt-[6px] flex items-center gap-[4px]">
                            <AlertCircle size={14} /> {upgradeCouponError}
                          </p>
                        )}
                        {upgradeCouponSuccessMsg && !appliedUpgradeCoupon && (
                          <p className="text-[11.5px] font-medium text-[#10b981] mt-[6px] flex items-center gap-[4px]">
                            <CheckCircle2 size={14} /> {upgradeCouponSuccessMsg}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kode Referral (Eksklusif Diskon 5%) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[20px] shadow-sm flex flex-col justify-between gap-[12px]">
                      <div>
                        <div className="flex items-center gap-[8px] mb-[4px]">
                          <Share2 size={18} className="text-[#007570]" />
                          <label className="text-[13px] font-bold text-[#0f172a]">Kode Referral (Diskon 5%)</label>
                        </div>
                        <p className="text-[12px] text-[#64748b] mb-[12px]">Gunakan kode referral rekan bisnis untuk diskon langsung 5%</p>

                        {!appliedUpgradeReferral ? (
                          <div className="flex gap-[8px]">
                            <input
                              type="text"
                              value={upgradeReferralInput}
                              onChange={(e) => setUpgradeReferralInput(e.target.value.toUpperCase())}
                              placeholder="CONTOH: REF12345"
                              className="flex-1 px-[14px] py-[10px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[13px] font-bold text-[#0f172a] uppercase outline-none focus:border-[#007570] focus:bg-white transition-all placeholder:font-normal placeholder:normal-case"
                            />
                            <button
                              type="button"
                              onClick={handleApplyUpgradeReferral}
                              disabled={upgradeReferralLoading || !upgradeReferralInput.trim()}
                              className="px-[16px] py-[10px] bg-[#007570] text-white text-[13px] font-bold rounded-[10px] transition-all hover:bg-[#005a58] disabled:bg-[#cbd5e1] disabled:cursor-not-allowed border-0 cursor-pointer flex items-center gap-[6px]"
                            >
                              {upgradeReferralLoading ? <Loader2 size={16} className="animate-spin" /> : "Terapkan"}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-[10px_14px] bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px]">
                            <div className="flex items-center gap-[8px]">
                              <CheckCircle2 size={18} className="text-[#10b981]" />
                              <div>
                                <span className="text-[12px] font-bold text-[#15803d]">Referral: {appliedUpgradeReferral.referral_code}</span>
                                <p className="text-[11px] text-[#16a34a]">
                                  Diskon 5%: Rp {Number(appliedUpgradeReferral.discount_amount || Math.round(Number(selectedUpgradePlan?.price || 0) * 0.05)).toLocaleString("id-ID")}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveUpgradeReferral}
                              className="text-[11.5px] font-bold text-[#ef4444] hover:underline cursor-pointer bg-transparent border-0"
                            >
                              Hapus
                            </button>
                          </div>
                        )}

                        {upgradeReferralError && (
                          <p className="text-[11.5px] font-medium text-[#ef4444] mt-[6px] flex items-center gap-[4px]">
                            <AlertCircle size={14} /> {upgradeReferralError}
                          </p>
                        )}
                        {upgradeReferralSuccessMsg && !appliedUpgradeReferral && (
                          <p className="text-[11.5px] font-medium text-[#10b981] mt-[6px] flex items-center gap-[4px]">
                            <CheckCircle2 size={14} /> {upgradeReferralSuccessMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Breakdown Card */}
                  {(() => {
                    const { basePrice, couponDiscount, referralDiscount, finalPrice } = calculateUpgradePrice();

                    return (
                      <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[14px]">
                        <h4 className="text-[14px] font-bold text-[#0f172a] border-b border-[#f1f5f9] pb-[10px]">
                          Rincian Perhitungan Pembayaran
                        </h4>

                        <div className="flex flex-col gap-[8px] text-[13.5px]">
                          <div className="flex items-center justify-between text-[#64748b]">
                            <span>Harga Normal Paket ({selectedUpgradePlan?.name})</span>
                            <span className="font-semibold text-[#0f172a]">Rp {basePrice.toLocaleString("id-ID")}</span>
                          </div>

                          {couponDiscount > 0 && (
                            <div className="flex items-center justify-between text-[#10b981]">
                              <span>Potongan Kupon ({appliedUpgradeCoupon?.code})</span>
                              <span className="font-bold">- Rp {couponDiscount.toLocaleString("id-ID")}</span>
                            </div>
                          )}

                          {referralDiscount > 0 && (
                            <div className="flex items-center justify-between text-[#10b981]">
                              <span>Diskon Referral 5% ({appliedUpgradeReferral?.referral_code})</span>
                              <span className="font-bold">- Rp {referralDiscount.toLocaleString("id-ID")}</span>
                            </div>
                          )}

                          <div className="h-[1px] bg-[#e2e8f0] my-[6px]" />

                          <div className="flex items-center justify-between text-[16px]">
                            <span className="font-bold text-[#0f172a]">Total Tagihan Akhir</span>
                            <span className="text-[22px] font-extrabold text-[#007570]">
                              Rp {finalPrice.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 2 Actions */}
                  <div className="flex items-center justify-between p-[16px_24px] bg-white border border-[#e2e8f0] rounded-[16px] shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setPremiumStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[20px] py-[12px] rounded-[12px] border border-[#cbd5e1] bg-white text-[#0f172a] font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#f8fafc]"
                    >
                      <ChevronLeft size={18} />
                      <span>Kembali</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPremiumStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[24px] py-[12px] rounded-[12px] bg-[#007570] text-white font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#005a58] hover:shadow-md border-0"
                    >
                      <span>Lanjut ke Metode Pembayaran</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: METODE PEMBAYARAN & REKENING TUJUAN ── */}
              {premiumStep === 3 && (
                <div className="flex flex-col gap-[20px]">
                  <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[18px]">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#0f172a]">Pilih Metode Pembayaran</h3>
                      <p className="text-[12.5px] text-[#64748b] mt-[2px]">Silakan pilih saluran transfer bank atau e-wallet tujuan transfer pembayaran Anda</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                      {UPGRADE_PAYMENT_METHODS.map((cat) => (
                        <div key={cat.category} className="flex flex-col gap-[12px]">
                          <span className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">
                            {cat.category}
                          </span>
                          <div className="flex flex-col gap-[10px]">
                            {cat.items.map((item) => {
                              const isSelected = upgradePaymentMethod === item.id;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setUpgradePaymentMethod(item.id)}
                                  className={`p-[14px_16px] rounded-[12px] border-2 cursor-pointer transition-all flex items-center justify-between ${
                                    isSelected
                                      ? "border-[#007570] bg-[#f0fdfa] shadow-sm"
                                      : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
                                  }`}
                                >
                                  <div className="flex items-center gap-[12px]">
                                    <div className={`px-[10px] py-[4px] rounded-[6px] font-bold text-[12px] ${item.badgeColor}`}>
                                      {item.name}
                                    </div>
                                    <span className="text-[13px] font-semibold text-[#0f172a]">{item.accountName}</span>
                                  </div>
                                  <div
                                    className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                      isSelected
                                        ? "border-[#007570] bg-[#007570] text-white"
                                        : "border-[#cbd5e1] bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination Account Details Box */}
                  {(() => {
                    let selectedAcc = null;
                    for (const cat of UPGRADE_PAYMENT_METHODS) {
                      const found = cat.items.find(i => i.id === upgradePaymentMethod);
                      if (found) {
                        selectedAcc = found;
                        break;
                      }
                    }
                    if (!selectedAcc) selectedAcc = UPGRADE_PAYMENT_METHODS[0].items[0];

                    const { finalPrice } = calculateUpgradePrice();

                    return (
                      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-[16px] p-[24px] shadow-md flex flex-col gap-[16px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-[12px]">
                          <div className="flex items-center gap-[10px]">
                            <CreditCard size={22} className="text-[#5eead4]" />
                            <span className="text-[14px] font-bold">Rekening / E-Wallet Tujuan Transfer</span>
                          </div>
                          <span className="px-[10px] py-[3px] rounded-full text-[11px] font-bold bg-[#007570] text-white">
                            {selectedAcc.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                          <div>
                            <span className="text-[12px] text-slate-400">Nomor Rekening / No VA:</span>
                            <div className="text-[20px] font-mono font-bold tracking-wider text-[#5eead4] mt-[4px]">
                              {selectedAcc.accountNumber}
                            </div>
                            <span className="text-[12px] text-slate-400 mt-[2px] block">
                              Atas Nama: <strong className="text-white">{selectedAcc.accountName}</strong>
                            </span>
                          </div>

                          <div className="sm:text-right flex flex-col sm:items-end justify-center">
                            <span className="text-[12px] text-slate-400">Total Yang Harus Ditransfer:</span>
                            <div className="text-[24px] font-extrabold text-white mt-[2px]">
                              Rp {finalPrice.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-[10px] border-t border-slate-700/80">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedAcc.accountNumber.replace(/-/g, ''));
                              setCopiedUpgradeAccount(true);
                              setTimeout(() => setCopiedUpgradeAccount(false), 3000);
                            }}
                            className="px-[16px] py-[8px] rounded-[8px] bg-slate-800 hover:bg-slate-700 text-[#5eead4] text-[12.5px] font-bold flex items-center gap-[6px] border border-slate-600 transition-all cursor-pointer"
                          >
                            {copiedUpgradeAccount ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedUpgradeAccount ? "Nomor Tersalin!" : "Salin No Rekening"}</span>
                          </button>

                          <span className="text-[11.5px] text-slate-400">
                            Simpan bukti transfer untuk di-upload di langkah berikutnya
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 3 Actions */}
                  <div className="flex items-center justify-between p-[16px_24px] bg-white border border-[#e2e8f0] rounded-[16px] shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setPremiumStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[20px] py-[12px] rounded-[12px] border border-[#cbd5e1] bg-white text-[#0f172a] font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#f8fafc]"
                    >
                      <ChevronLeft size={18} />
                      <span>Kembali ke Ringkasan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPremiumStep(4);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[24px] py-[12px] rounded-[12px] bg-[#007570] text-white font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#005a58] hover:shadow-md border-0"
                    >
                      <span>Lanjut Upload Bukti Transfer</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: UPLOAD BUKTI PEMBAYARAN & KONFIRMASI ── */}
              {premiumStep === 4 && (
                <div className="flex flex-col gap-[20px]">
                  <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[24px] shadow-sm flex flex-col gap-[18px]">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#0f172a]">Unggah Bukti Pembayaran</h3>
                      <p className="text-[12.5px] text-[#64748b] mt-[2px]">
                        Unggah struk / tangkapan layar bukti transfer pembayaran Anda untuk diverifikasi oleh admin
                      </p>
                    </div>

                    {/* Upload Box */}
                    <div className="flex flex-col gap-[12px]">
                      <input
                        type="file"
                        ref={upgradeProofInputRef}
                        onChange={handleUpgradeProofChange}
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        className="hidden"
                      />

                      {!upgradeProofPreview ? (
                        <div
                          onClick={() => upgradeProofInputRef.current?.click()}
                          className="border-2 border-dashed border-[#cbd5e1] hover:border-[#007570] bg-[#f8fafc] hover:bg-[#f0fdfa]/30 rounded-[14px] p-[36px] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-[10px]"
                        >
                          <div className="w-[48px] h-[48px] rounded-full bg-[#f0fdfa] text-[#007570] flex items-center justify-center">
                            <Upload size={24} />
                          </div>
                          <div>
                            <span className="text-[14px] font-bold text-[#0f172a]">Klik untuk memilih file bukti transfer</span>
                            <p className="text-[12px] text-[#64748b] mt-[2px]">Format: JPG, PNG, WEBP (Maksimal 10MB)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-[16px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] flex items-center justify-between gap-[16px]">
                          <div className="flex items-center gap-[14px] overflow-hidden">
                            <img
                              src={upgradeProofPreview}
                              alt="Bukti Transfer"
                              className="w-[72px] h-[72px] rounded-[10px] object-cover border border-[#cbd5e1] shrink-0"
                            />
                            <div className="overflow-hidden">
                              <span className="text-[13px] font-bold text-[#0f172a] block truncate">
                                {upgradeProofFile?.name || "Bukti Transfer Terpilih"}
                              </span>
                              <span className="text-[11.5px] text-[#10b981] font-semibold flex items-center gap-[4px] mt-[2px]">
                                <CheckCircle2 size={13} /> Siap diunggah ({(upgradeProofFile?.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-[8px] shrink-0">
                            <button
                              type="button"
                              onClick={() => upgradeProofInputRef.current?.click()}
                              className="px-[12px] py-[8px] bg-white border border-[#cbd5e1] text-[#0f172a] rounded-[8px] text-[12px] font-bold hover:bg-[#f1f5f9] cursor-pointer"
                            >
                              Ganti
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveUpgradeProof}
                              className="px-[12px] py-[8px] bg-[#fee2e2] text-[#ef4444] rounded-[8px] text-[12px] font-bold hover:bg-[#fecaca] cursor-pointer border-0"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}

                      {upgradeError && (
                        <div className="p-[12px_16px] bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-[10px] text-[12.5px] font-medium flex items-center gap-[8px]">
                          <AlertCircle size={16} className="shrink-0" />
                          <span>{upgradeError}</span>
                        </div>
                      )}
                    </div>

                    {/* Final Recap Box */}
                    {(() => {
                      const targetBizId = selectedUpgradeBusiness || (businesses?.[0]?.id || "");
                      const bizObj = (businesses || []).find(b => String(b.id) === String(targetBizId)) || businesses?.[0];
                      const { finalPrice } = calculateUpgradePrice();

                      return (
                        <div className="p-[16px] bg-[#f0fdfa] border border-[#ccfbf1] rounded-[12px] flex items-center justify-between text-[13.5px]">
                          <div>
                            <span className="text-[11px] font-bold text-[#007570] uppercase tracking-wider">Ringkasan Pengajuan</span>
                            <div className="font-bold text-[#0f172a] mt-[2px]">
                              {bizObj?.name} ➔ Paket {selectedUpgradePlan?.name} ({upgradePaymentMethod})
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-[#64748b]">Total Pembayaran</span>
                            <div className="text-[18px] font-extrabold text-[#007570]">
                              Rp {finalPrice.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Step 4 Actions */}
                  <div className="flex items-center justify-between p-[16px_24px] bg-white border border-[#e2e8f0] rounded-[16px] shadow-sm">
                    <button
                      type="button"
                      disabled={submittingUpgrade}
                      onClick={() => {
                        setPremiumStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-[20px] py-[12px] rounded-[12px] border border-[#cbd5e1] bg-white text-[#0f172a] font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#f8fafc] disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                      <span>Kembali ke Metode Bayar</span>
                    </button>

                    <button
                      type="button"
                      disabled={submittingUpgrade || !upgradeProofFile}
                      onClick={handleSubmitUpgrade}
                      className="px-[28px] py-[12px] rounded-[12px] bg-[#007570] text-white font-bold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all hover:bg-[#005a58] hover:shadow-md disabled:bg-[#cbd5e1] disabled:cursor-not-allowed border-0"
                    >
                      {submittingUpgrade ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Mengirim Bukti...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} />
                          <span>Kirim Bukti Pembayaran & Selesaikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 5: KONFIRMASI BERHASIL DIAJUKAN ── */}
              {premiumStep === 5 && (
                <div className="bg-white border border-[#e2e8f0] rounded-[16px] p-[36px_24px] shadow-sm text-center flex flex-col items-center gap-[20px]">
                  <div className="w-[72px] h-[72px] rounded-full bg-[#f0fdf4] text-[#10b981] flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={44} />
                  </div>

                  <div className="max-w-[500px]">
                    <h3 className="text-[20px] font-bold text-[#0f172a]">Permohonan Upgrade Berhasil Diajukan!</h3>
                    <p className="text-[13px] text-[#64748b] mt-[6px] leading-relaxed">
                      Bukti pembayaran paket Premium untuk usaha <strong>"{upgradeSuccessData?.businessName}"</strong> telah kami terima. Admin kami akan memverifikasi pembayaran Anda dalam waktu 1x24 jam.
                    </p>
                  </div>

                  {upgradeSuccessData && (
                    <div className="w-full max-w-[460px] p-[18px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-left flex flex-col gap-[8px] text-[13px]">
                      <div className="flex justify-between text-[#64748b]">
                        <span>Nama Usaha:</span>
                        <strong className="text-[#0f172a]">{upgradeSuccessData.businessName}</strong>
                      </div>
                      <div className="flex justify-between text-[#64748b]">
                        <span>Paket Dipilih:</span>
                        <strong className="text-[#007570]">{upgradeSuccessData.planName}</strong>
                      </div>
                      <div className="flex justify-between text-[#64748b]">
                        <span>Metode Pembayaran:</span>
                        <strong className="text-[#0f172a]">{upgradeSuccessData.paymentMethod}</strong>
                      </div>
                      <div className="flex justify-between text-[#64748b]">
                        <span>Total Pembayaran:</span>
                        <strong className="text-[#007570] font-bold">Rp {Number(upgradeSuccessData.finalPrice).toLocaleString("id-ID")}</strong>
                      </div>
                      <div className="flex justify-between text-[#64748b] pt-[6px] border-t border-[#e2e8f0]">
                        <span>Waktu Pengajuan:</span>
                        <span>{upgradeSuccessData.submittedAt}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-[12px] flex-wrap justify-center mt-[8px]">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("bisnis");
                        handleResetUpgrade();
                      }}
                      className="px-[20px] py-[11px] rounded-[10px] bg-[#007570] text-white font-bold text-[13.5px] cursor-pointer hover:bg-[#005a58] transition-all border-0"
                    >
                      Lihat Daftar Usaha Saya
                    </button>
                    <button
                      type="button"
                      onClick={handleResetUpgrade}
                      className="px-[20px] py-[11px] rounded-[10px] bg-[#f1f5f9] text-[#0f172a] font-bold text-[13.5px] cursor-pointer hover:bg-[#e2e8f0] transition-all border-0"
                    >
                      Upgrade Usaha Lainnya
                    </button>
                  </div>
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

          {/* 9. ADVERTISING / IKLAN SAYA VIEW */}
          {activeTab === "iklan" && (
            <div className="space-y-6 w-full max-w-full">
              {/* Page Header Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 md:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,117,112,0.39)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-0"
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
                    <span className="text-lg font-black text-[#007570] truncate block">
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
                              ? "bg-[#007570] text-white shadow-xs"
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
                    <Loader2 size={32} className="animate-spin text-[#007570]" />
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
                        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#007570] flex items-center justify-center">
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
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
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
                        const status = ad.computed_status || ad.status;
                        const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                        const biz = ad.business || {};
                        const bizPhoto = biz.banner || biz.logo || (biz.media && biz.media.length > 0 ? biz.media[0].file_path : null) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";

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
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#007570] border border-teal-200">
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
                                    <span className="font-extrabold text-[#007570]">
                                      Rp {Number(ad.price || 0).toLocaleString("id-ID")}
                                    </span>
                                  </div>

                                  {/* Period & Days Remaining Info */}
                                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                                    {ad.start_date && ad.end_date ? (
                                      <div className="flex items-center gap-1.5 text-slate-600">
                                        <Clock size={12} className="text-[#007570]" />
                                        <span>
                                          Periode: <strong>{new Date(ad.start_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong> s/d <strong>{new Date(ad.end_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic">
                                        * Periode mulai aktif dihitung otomatis setelah pembayaran disetujui admin.
                                      </span>
                                    )}

                                    {status === "active" && ad.days_remaining !== null && (
                                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                                        ⏳ Sisa {ad.days_remaining} hari
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
                                      className="px-3.5 py-1.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
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
                  <Sparkles size={18} className="text-[#007570]" />
                  Perbandingan Paket Iklan Info.co.id
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
                        Format iklan eksklusif dengan foto bisnis full-width ukuran besar, minimalis tanpa teks berlebih, menampilkan rating bintang ★ dan lokasi 📍. Iklan pertama yang dilihat ribuan pengunjung saat membuka Info.co.id.
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
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#007570] text-white">
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
                        <CheckCircle size={14} className="text-[#007570] shrink-0" />
                        Animasi horizontal scroller tanpa jeda (smooth infinite loop)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#007570] shrink-0" />
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
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-teal-50 text-[#007570] border border-teal-200">
                            LANGKAH {createAdStep} DARI 3
                          </span>
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {createAdStep === 1 && "Pilih Bisnis untuk Diiklankan"}
                            {createAdStep === 2 && "Pilih Paket Iklan (Placement)"}
                            {createAdStep === 3 && "Live Preview & Checkout Pembayaran"}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {createAdStep === 1 && "Tentukan salah satu bisnis terdaftar Anda yang ingin dipromosikan."}
                          {createAdStep === 2 && "Pilih antara Premium Hero Carousel atau Standard Running Ticker."}
                          {createAdStep === 3 && "Periksa tampilan live iklan Anda, masukkan kupon, dan selesaikan pembayaran."}
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
                              ? "bg-teal-50 border-[#007570] text-[#007570]"
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
                              const photo = biz.banner || biz.logo || (biz.media && biz.media.length > 0 ? biz.media[0].file_path : null) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";

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
                                    <img src={photo} alt={biz.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{biz.name}</h4>
                                    <p className="text-xs text-slate-500 truncate">{biz.category?.name || "Kategori Usaha"}</p>
                                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                      <MapPin size={11} />
                                      {biz.city || "Indonesia"}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 size={20} className="text-[#007570] shrink-0" />
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
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
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
                                      {isSelected && <CheckCircle2 size={20} className={isPrem ? "text-amber-600" : "text-[#007570]"} />}
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
                                        <Check size={14} className={isPrem ? "text-amber-600" : "text-[#007570]"} />
                                        <span>Placement: <strong>{isPrem ? "Hero Banner Teratas" : "Continuous Running Ticker"}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Check size={14} className={isPrem ? "text-amber-600" : "text-[#007570]"} />
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
                            onClick={() => setCreateAdStep(3)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
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
                      const photo = selBiz?.banner || selBiz?.logo || (selBiz?.media && selBiz?.media.length > 0 ? selBiz?.media[0].file_path : null) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80";

                      return (
                        <div className="space-y-6">
                          {/* Live Preview Box */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                <Eye size={14} className="text-[#007570]" />
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
                                        ★ 4.8 <span className="text-slate-300 font-normal">(Ulasan Konsumen)</span>
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <MapPin size={13} className="text-teal-400" />
                                        {selBiz?.city || "Indonesia"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Standard Ads Simulation */
                                <div className="flex items-center justify-center p-4">
                                  <div className="w-full max-w-[340px] bg-white rounded-2xl border border-slate-200 p-3.5 shadow-md flex items-center gap-3.5">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                      <img src={photo} alt={selBiz?.name} className="w-full h-full object-cover" />
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
                                        {selBiz?.city || "Indonesia"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coupon Code Section */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                            <label className="block text-xs font-bold text-slate-700">Kode Kupon Diskon (Opsional)</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={couponCodeInput}
                                onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                placeholder="Contoh: IKLAN20"
                                className="flex-1 uppercase px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-[#007570]"
                              />
                              <button
                                type="button"
                                onClick={handleValidateUserCoupon}
                                disabled={validatingCoupon || !couponCodeInput}
                                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-all disabled:opacity-40 border-0"
                              >
                                {validatingCoupon ? "Memeriksa..." : "Gunakan Kupon"}
                              </button>
                            </div>
                            {couponMsg && (
                              <p className={`text-xs font-bold ${appliedCouponInfo ? "text-emerald-600" : "text-rose-600"}`}>
                                {couponMsg}
                              </p>
                            )}
                          </div>

                          {/* Payment Method Selector */}
                          <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Pilih Metode Pembayaran
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {[
                                { id: "BCA Virtual Account", name: "BCA Virtual Account", tag: "BCA", color: "bg-[#005caa]" },
                                { id: "Mandiri Virtual Account", name: "Mandiri VA", tag: "Mandiri", color: "bg-[#003865]" },
                                { id: "BRI Virtual Account", name: "BRI Virtual Account", tag: "BRI", color: "bg-[#00529c]" },
                                { id: "DANA", name: "DANA E-Wallet", tag: "DANA", color: "bg-[#008ce5]" },
                                { id: "GoPay", name: "GoPay E-Wallet", tag: "GoPay", color: "bg-[#00a5cf]" },
                                { id: "OVO", name: "OVO E-Wallet", tag: "OVO", color: "bg-[#4c2a86]" },
                              ].map((pm) => {
                                const isSelected = selectedPaymentMethod === pm.id;
                                return (
                                  <div
                                    key={pm.id}
                                    onClick={() => setSelectedPaymentMethod(pm.id)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                      isSelected
                                        ? "border-[#007570] bg-teal-50/50 shadow-xs ring-1 ring-[#007570]"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black text-white ${pm.color}`}>
                                        {pm.tag}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900 truncate">{pm.name}</span>
                                    </div>
                                    {isSelected && <CheckCircle2 size={16} className="text-[#007570] shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Account instruction */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <span className="text-slate-500">Nomor Rekening / Virtual Account ({selectedPaymentMethod}):</span>
                                <div className="text-base font-black text-slate-900 tracking-wider">
                                  {getPaymentNumber(selectedPaymentMethod)}
                                </div>
                                <span className="text-[11px] text-slate-400">a.n PT Info Media Indonesia</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(getPaymentNumber(selectedPaymentMethod));
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

                          {/* Upload Bukti Transfer (Opsional saat submit awal) */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-700">
                              Upload Bukti Pembayaran (Opsional jika sudah transfer sekarang)
                            </label>
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
                              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#007570] hover:file:bg-teal-100 cursor-pointer"
                            />
                            {adPaymentProofPreview && (
                              <div className="relative mt-2 w-24 h-24 rounded-xl overflow-hidden border border-slate-300">
                                <img src={adPaymentProofPreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdPaymentProofFile(null);
                                    setAdPaymentProofPreview(null);
                                  }}
                                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 border-0 cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
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
                            <div className="flex justify-between items-center text-sm font-black text-[#007570] border-t border-teal-200/80 pt-2 mt-1">
                              <span>Total Pembayaran:</span>
                              <span className="text-lg text-[#007570]">
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
                              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer border-0"
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
              {/* MODAL 2: DETAIL IKLAN & LIVE PREVIEW (viewingAdDetail) */}
              {/* ========================================================================= */}
              {viewingAdDetail && (() => {
                const ad = viewingAdDetail;
                const isPremium = ad.placement_type === "premium" || /premium/i.test(ad.package_name || "");
                const biz = ad.business || {};
                const photo = biz.banner || biz.logo || (biz.media && biz.media.length > 0 ? biz.media[0].file_path : null) || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80";

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
                          <span className="font-bold text-[#007570] text-sm">Rp {Number(ad.price || 0).toLocaleString("id-ID")}</span>
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
                          <div className="w-36 h-36 rounded-xl overflow-hidden border border-slate-200 cursor-pointer" onClick={() => window.open(ad.payment_proof, "_blank")}>
                            <img src={ad.payment_proof} alt="Bukti Transfer" className="w-full h-full object-cover" />
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
                      <div className="flex justify-between font-extrabold text-sm text-[#007570] border-t border-slate-200 pt-2 mt-1">
                        <span>Total Tagihan:</span>
                        <span>Rp {Number(payModalAd.price || 0).toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 block">Pilih Rekening / E-Wallet</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {["BCA Virtual Account", "Mandiri Virtual Account", "DANA", "GoPay"].map((pm) => (
                          <div
                            key={pm}
                            onClick={() => setSelectedPaymentMethod(pm)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              selectedPaymentMethod === pm ? "border-[#007570] bg-teal-50 text-[#007570] font-bold" : "border-slate-200 text-slate-700"
                            }`}
                          >
                            <span>{pm}</span>
                            {selectedPaymentMethod === pm && <CheckCircle size={14} />}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 text-[11px] block">No Rekening / VA:</span>
                          <span className="font-black text-slate-900 text-sm">{getPaymentNumber(selectedPaymentMethod)}</span>
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
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-[#007570] hover:file:bg-teal-100 cursor-pointer"
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
                        className="px-5 py-2 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs border-0 cursor-pointer disabled:opacity-50"
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
                                className="px-3.5 py-1.5 bg-[#007570] hover:bg-[#005f5b] text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
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
                              className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 bg-[#007570] hover:bg-[#005f5b] active:bg-[#004e4a] text-white px-5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <Wallet size={20} className="text-[#007570]" />
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
                  className="w-full py-2.5 rounded-xl bg-[#007570] text-white font-bold text-xs cursor-pointer hover:bg-[#005a58]"
                >
                  Tutup Window
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmittingWithdraw(true);
                  setTimeout(() => {
                    setSubmittingWithdraw(false);
                    setWithdrawSuccessMsg(
                      `Permohonan penarikan Rp ${Number(withdrawForm.amount).toLocaleString("id-ID")} ke ${withdrawForm.bank} (${withdrawForm.accountNumber}) atas nama ${withdrawForm.accountHolder} telah diterima dan sedang diproses admin.`
                    );
                  }, 1200);
                }}
                className="space-y-4"
              >
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-800">Saldo Komisi Tersedia:</span>
                  <span className="text-base font-black text-[#007570]">
                    Rp {totalReferralEarnings.toLocaleString("id-ID")}
                  </span>
                </div>

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
                    max={totalReferralEarnings || 50000}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#007570]"
                  />
                  <p className="text-[11px] text-slate-400">Minimal penarikan Rp 50.000</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWithdraw}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007570] hover:bg-[#005a58] text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
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
                  <FileText size={18} className="text-[#007570]" />
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
                  <span className="font-bold text-[#007570]">{selectedReferralTx.service}</span>
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
                  <span className="text-slate-600">Diskon Kode Referral (5%):</span>
                  <span className="font-semibold text-rose-600">- Rp {(selectedReferralTx.discount_amount || selectedReferralTx.discount || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Dibayar Pembeli:</span>
                  <span className="font-bold text-slate-900">Rp {(selectedReferralTx.final_price || selectedReferralTx.amount || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-emerald-900">Komisi Hak Anda (10%):</span>
                  <span className="font-black text-emerald-700 text-base">+ Rp {(selectedReferralTx.commission_amount || selectedReferralTx.commission || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                <span className="text-slate-600 font-semibold">Status Payout Saldo:</span>
                <span className="font-bold text-[#007570]">{selectedReferralTx.payoutStatus || selectedReferralTx.payout_status}</span>
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
    </div>
  );
}

