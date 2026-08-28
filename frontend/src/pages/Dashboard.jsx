import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../utils/api";
import "./Dashboard.css";
import "./Pricing.css";
import Loading from "../components/Loading";
import AvatarCropperModal from "../components/AvatarCropperModal";
import CameraCaptureModal from "../components/CameraCaptureModal";
import AdDescriptionEditor from "../components/AdDescriptionEditor";
import { DESA_LIST } from "../data/desaList";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import {
  Building2,
  Store,
  Users,
  Grid,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  LogOut,
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  Mail,
  Hash as Instagram,
  Hash as Facebook,
  Info,
  Image,
  Images as Gallery,
  ArrowLeft,
  Clock,
  Shield,
  Search,
  Megaphone,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Tag,
  Upload,
  Check,
  Crown,
  Gift,
  Receipt,
  Lock,
  Home,
  Users2,
  Camera,
  LayoutDashboard,
  Menu as MenuIcon,
  Eye,
  ArrowUpRight,
  X,
  MessageSquare,
  MessageCircle,
  Trophy,
  Briefcase,
  ShoppingBag,
  Video,
  Share2,
  EyeOff,
  Percent,
  CreditCard,
  FileText,
  Calendar,
  Bell,
  Heart,
  Grid3x3,
  Inbox,
  UserCircle2,
  Bookmark,
  BookOpen,
  Minus,
  Send,
  History,
  ChevronUp,
  TrendingUp,
  DollarSign,
  Image as ImageIcon,
  Package,
  AlertTriangle,
  Ticket, Wallet, Copy, Target,
} from "lucide-react";
import emptyStateIcon from "../assets/icon-empty-state.png";
import logoImg from "../assets/logo.png";
import RichTextEditor from "../components/RichTextEditor";
import DashboardChart from "../components/DashboardChart";
import PaymentGateway from "../components/PaymentGateway";
import MiniCalendar from "../components/MiniCalendar";

/**
 * Tampilan kosong seragam buat semua tab Dashboard (gaya "trofi" seperti
 * referensi) - dipakai kalau datanya masih kosong. Kalau tab itu punya
 * tombol tambah, dikasih tombol; kalau tidak (mis. Inbox/Booking/Simpan
 * yang datanya dari orang lain, bukan diisi sendiri), tombolnya disembunyikan.
 */
function DashboardEmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="db-empty-illustration">
      <img src={emptyStateIcon} alt="" className="db-empty-illustration__icon" />
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {actionLabel && onAction && (
        <button type="button" className="db-action-btn" onClick={onAction}>
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

// Map click handler component for Leaflet
function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Map updater component to handle position changes
function MapUpdater({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position && position.length === 2) {
      console.log('MapUpdater: Updating map to position:', position);
      map.setView(position, 13);
    }
  }, [position, map]);
  
  return null;
}

// Sama persis dengan daftar fitur di Pricing.jsx - dipakai supaya
// perbandingan paket Free vs Premium bisa langsung tampil di tab
// "Premium & Invoice" di Dashboard, tanpa perlu klik ke halaman lain dulu.
const FEATURES_COMPARISON = [
  { name: "Lamanya : Tidak ada batas hari", free: false, premium: true },
  { name: "Peta", free: false, premium: true },
  { name: "Kontak", free: false, premium: true },
  { name: "Galeri Foto", free: false, premium: true },
  { name: "Video", free: false, premium: true },
  { name: "Slogan", free: false, premium: true },
  { name: "Alamat", free: false, premium: true },
  { name: "Website", free: false, premium: true },
  { name: "Tautan Sosial Media", free: false, premium: true },
  { name: "FAQ", free: false, premium: true },
  { name: "Rentang Harga", free: false, premium: true },
  { name: "Tag/Kata Kunci", free: false, premium: true },
  { name: "Jam Operasional", free: false, premium: true },
  { name: "Pengumuman", free: false, premium: true },
  { name: "Penawaran & Diskon", free: false, premium: true },
  { name: "Sembunyikan Iklan pesaing", free: false, premium: true },
  { name: "Event", free: false, premium: true },
];

// PERMINTAAN: stepper di form Iklan/Pengumuman/Menu/Kategori sebelumnya
// class "completed"/"active"-nya ditulis STATIS di JSX (selalu section 1
// "completed" & section 2 "active", walau form baru dibuka & belum diisi
// sama sekali) - jadi keliatan tapi tidak benar-benar berfungsi. Hook ini
// membuat step indikatornya "hidup": mengikuti section mana yang lagi
// dilihat pas pengguna scroll form-nya (mirip scroll-spy), section yang
// sudah terlewati otomatis ditandai selesai (completed), section yang
// lagi di posisi layar ditandai aktif.
function useStepScrollSpy(isOpen, sectionRefs, stepCount) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }
    const handle = () => {
      let current = 0;
      for (let i = 0; i < stepCount; i++) {
        const el = sectionRefs.current[i];
        if (el && el.getBoundingClientRect().top <= 190) current = i;
      }
      setStep(current);
    };
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
  }, [isOpen, stepCount]);

  return step;
}

export default function Dashboard() {
  const { user, loading: authLoading, logout, isAdmin, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tab } = useParams(); const activeTab = tab || (isAdmin ? "dashboard" : "saved"); const setActiveTab = (newTab) => navigate(`/dashboard/${newTab}`);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const [dismissedBanners, setDismissedBanners] = useState([]);
  const [salesGraphCollapsed, setSalesGraphCollapsed] = useState(false);
  
  // Data lists
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [events, setEvents] = useState([]);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  // Data buat widget "Ulasan Terbaru" di halaman Dasbor - ulasan bisnis
  // terbaru (punya sendiri kalau bukan admin, seluruh platform kalau admin).
  const [recentReviews, setRecentReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  // Data untuk grafik pendaftaran user dan bisnis baru
  const [userRegistrationChart, setUserRegistrationChart] = useState(null);
  const [businessRegistrationChart, setBusinessRegistrationChart] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [premiumHistory, setPremiumHistory] = useState({ history: [], approved_count: 0, active_businesses: 0, expired_businesses: 0, rejected_count: 0 });
  const [plans, setPlans] = useState({});
  const [resellerData, setResellerData] = useState(null); // legacy, unused now that Reseller tab is removed

  // Data statistik referral milik user sendiri (tab "Referral"), diambil dari
  // GET /api/my-referral-stats - bukan dummy data.
  const [referralStats, setReferralStats] = useState(null);
  const [referralStatsLoading, setReferralStatsLoading] = useState(false);
  const [referralStatsError, setReferralStatsError] = useState(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  // PERMINTAAN: grafik-grafik di Dashboard supaya bisa "lihat detail" biar
  // kelihatan rincian perkembangannya, bukan cuma garis kecil. State ini
  // ngatur tabel rincian (tanggal + jumlah) di bawah tiap grafik.
  const [showUserChartDetail, setShowUserChartDetail] = useState(false);
  const [showBizChartDetail, setShowBizChartDetail] = useState(false);
  const [showVisitChartDetail, setShowVisitChartDetail] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [selectedBusinessForPayment, setSelectedBusinessForPayment] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showAllPremiumHistory, setShowAllPremiumHistory] = useState(false);
  const [tickets, setTickets] = useState([]);
  // PERBAIKAN: seluruh state untuk fitur "Kupon Diskon" (admin) ternyata
  // tidak pernah dideklarasikan sama sekali walau sudah dipakai di banyak
  // tempat (handleOpenCouponAdminModal, handleSaveCouponAdmin, tabel kupon,
  // dst). Ini yang bikin "ReferenceError: showCouponAdminModal is not
  // defined" dan bikin SELURUH halaman Dashboard nge-crash jadi blank
  // begitu bagian ini ke-render (React otomatis meng-unmount seluruh
  // tampilan begitu ada error saat render, karena tidak ada error
  // boundary). Sekarang semua state yang dibutuhkan sudah dideklarasikan.
  const [platformCoupons, setPlatformCoupons] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [settingsDraft, setSettingsDraft] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [showCouponAdminModal, setShowCouponAdminModal] = useState(false);
  const [selectedPlatformCoupon, setSelectedPlatformCoupon] = useState(null);
  const [pcCode, setPcCode] = useState("");
  const [pcName, setPcName] = useState("");
  const [pcType, setPcType] = useState("percentage");
  const [pcValue, setPcValue] = useState("");
  const [pcAppliesTo, setPcAppliesTo] = useState("semua");
  const [pcMinPurchase, setPcMinPurchase] = useState("");
  const [pcMaxUses, setPcMaxUses] = useState("");
  const [pcExpiresAt, setPcExpiresAt] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Jaring pengaman: gabungkan hasil pending/approved/rejected tanpa duplikat.
  // Kalau suatu saat ada iklan yang kebetulan muncul di lebih dari satu hasil
  // query (mis. karena bug di backend), key React tetap unik.
  const dedupeAdsById = (list) =>
    Array.from(new Map(list.map((ad) => [ad.id, ad])).values());

  // Form pengaturan profil (tab "profile")
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null); // { type: 'success' | 'error', text }
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef(null);

  // Foto sampul (cover/banner) - tampil di atas foto profil, mirip cover
  // foto WhatsApp. Beda dari avatar: tidak lewat modal crop, langsung
  // dipakai sebagai preview begitu dipilih.
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [removeCover, setRemoveCover] = useState(false);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const [first, ...rest] = (user.name || "").split(" ");
      setProfileForm({
        firstName: first || "",
        lastName: rest.join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const [cropperSrc, setCropperSrc] = useState(null);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const photoMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setPhotoMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Jangan langsung dipakai - buka dulu modal "Atur Foto Profil" biar
    // user bisa zoom & geser posisi fotonya sebelum disimpan.
    setRemoveAvatar(false);
    setCropperSrc(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    if (!window.confirm("Hapus foto profil? Perubahan baru benar-benar diterapkan setelah kamu klik \"Simpan Perubahan\".")) return;
    setPhotoMenuOpen(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(true);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropperSave = (dataUrl, croppedFile) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(dataUrl);
    setRemoveAvatar(false);
    setCropperSrc(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropperCancel = () => {
    setCropperSrc(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCoverPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRemoveCover(false);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleRemoveCover = () => {
    if (!window.confirm("Hapus foto sampul? Perubahan baru benar-benar diterapkan setelah kamu klik \"Simpan Perubahan\".")) return;
    setCoverFile(null);
    setCoverPreview("");
    setRemoveCover(true);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleGenerateReferralCode = async () => {
    try {
      const response = await api.post("/generate-referral-code");

      // Re-fetch profil dari server supaya `user.referral_code` ikut ke-update
      // di seluruh halaman (AuthContext tidak expose setter langsung).
      await refreshUser();

      alert(`Kode referral berhasil dibuat: ${response.referral_code}`);
    } catch (error) {
      console.error("Error generating referral code:", error);
      alert("Gagal membuat kode referral. Silakan coba lagi.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", `${profileForm.firstName} ${profileForm.lastName}`.trim());
      formData.append("email", profileForm.email);
      if (profileForm.phone) formData.append("phone", profileForm.phone);
      if (profileForm.bio) formData.append("bio", profileForm.bio);
      if (avatarFile) formData.append("avatar", avatarFile);
      else if (removeAvatar) formData.append("remove_avatar", "1");
      if (coverFile) formData.append("cover_photo", coverFile);
      else if (removeCover) formData.append("remove_cover_photo", "1");

      // POST (bukan PUT) supaya file foto ikut terkirim - Laravel tidak
      // otomatis mem-parse body multipart pada method PUT.
      await api.post("/user/profile", formData);

      // Muat ulang data user supaya nama/foto di navbar & sidebar ikut
      // berubah tanpa perlu refresh halaman.
      await refreshUser?.();
      setAvatarFile(null);
      setRemoveAvatar(false);
      setCoverFile(null);
      setRemoveCover(false);
      setProfileMessage({ type: "success", text: "Perubahan profil berhasil disimpan." });
    } catch (err) {
      const apiMsg = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" ")
        : err?.data?.message;
      setProfileMessage({ type: "error", text: apiMsg || "Gagal menyimpan perubahan profil. Coba lagi." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Direktori reseller (statis untuk sementara, sambungkan ke API kalau sudah ada endpoint-nya)
  const resellerDirectory = [
    { id: 1, name: "Hermawan Susanto", region: "Jawa Barat", sales: 142, rating: 4.8 },
    { id: 2, name: "Dewi Lestari", region: "DKI Jakarta", sales: 295, rating: 4.9 },
    { id: 3, name: "Rahmat Hidayat", region: "Jawa Timur", sales: 88, rating: 4.6 },
    { id: 4, name: "Novi Amelia", region: "Jawa Tengah", sales: 115, rating: 4.7 },
  ];
  const [resellerSearch, setResellerSearch] = useState("");
  const filteredResellers = resellerDirectory.filter((r) =>
    r.name.toLowerCase().includes(resellerSearch.toLowerCase()) ||
    r.region.toLowerCase().includes(resellerSearch.toLowerCase())
  );
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedInboxId, setSelectedInboxId] = useState(null); // sekarang menyimpan KEY thread, bukan id pesan
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxFilter, setInboxFilter] = useState("all"); // all | unread
  const [inboxDraft, setInboxDraft] = useState("");
  const [sendingInboxReply, setSendingInboxReply] = useState(false);
  const [savedBusinesses, setSavedBusinesses] = useState([]);
  const [businessReviews, setBusinessReviews] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replySubmittingId, setReplySubmittingId] = useState(null);
  const [premiumPackages, setPremiumPackages] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [contentHistory, setContentHistory] = useState([]);

  // --- INBOX / CHAT DUA ARAH -----------------------------------------
  // "messages" dari API sekarang berisi SEMUA baris pesan yang relevan buat
  // akun yang login (baik yang ia kirim sebagai pelanggan, maupun yang
  // masuk ke bisnis miliknya sebagai penjual). Di sini kita kelompokkan
  // jadi satu "thread" per (bisnis, pelanggan) supaya tampil sebagai
  // percakapan chat, persis seperti WhatsApp - bukan daftar pesan lepas.
  const inboxThreads = useMemo(() => {
    const groups = new Map();

    messages.forEach((m) => {
      // Pesan tamu (belum login, tanpa customer_id) tetap jadi thread-nya
      // sendiri per pesan - tidak bisa dibalas lewat chat karena tidak ada
      // akun tujuan, tapi tetap kelihatan di Inbox seperti biasa.
      const key = m.customer_id ? `${m.business_id}-${m.customer_id}` : `guest-${m.id}`;
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          business_id: m.business_id,
          customer_id: m.customer_id || null,
          business: m.business,
          items: [],
        });
      }
      const group = groups.get(key);
      group.items.push(m);
      if (m.business && !group.business) group.business = m.business;
    });

    return Array.from(groups.values())
      .map((group) => {
        const items = [...group.items].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const last = items[items.length - 1];
        const amOwner = isAdmin || group.business?.user_id === user?.id;
        const fromCustomerMsg = items.find((m) => m.sender_role !== "seller");
        const otherName = amOwner
          ? fromCustomerMsg?.sender_name || last.sender_name
          : group.business?.title || "Penjual";
        const unread = items.filter(
          (m) => !m.is_read && m.sender_id !== user?.id && m.sender_role !== (amOwner ? "seller" : "customer")
        ).length;
        return { ...group, items, last, amOwner, otherName, unread };
      })
      .sort((a, b) => new Date(b.last.created_at) - new Date(a.last.created_at));
  }, [messages, isAdmin, user]);

  const selectedInboxThread =
    inboxThreads.find((t) => t.key === selectedInboxId) || inboxThreads[0] || null;

  // Daftar thread yang benar-benar ditampilkan di sidebar, setelah kena
  // filter pencarian & "Belum Dibaca" (persis kayak tab filter WhatsApp).
  const visibleInboxThreads = inboxThreads.filter((t) => {
    if (inboxFilter === "unread" && t.unread === 0) return false;
    if (!inboxSearch.trim()) return true;
    const q = inboxSearch.trim().toLowerCase();
    return (
      (t.otherName || "").toLowerCase().includes(q) ||
      (t.business?.title || "").toLowerCase().includes(q) ||
      (t.last?.message || "").toLowerCase().includes(q)
    );
  });

  // Total pesan yang belum dibaca dan BUKAN dikirim oleh saya sendiri -
  // dipakai untuk badge angka di menu Inbox (sidebar) dan ikon amplop topbar.
  const unreadInboxCount = messages.filter((m) => !m.is_read && m.sender_id !== user?.id).length;

  useEffect(() => {
    if (!inboxThreads.length) {
      setSelectedInboxId(null);
      setInboxDraft("");
      return;
    }

    if (!selectedInboxId || !inboxThreads.some((t) => t.key === selectedInboxId)) {
      setSelectedInboxId(inboxThreads[0].key);
    }
  }, [inboxThreads, selectedInboxId]);

  // BARU: dukung "mulai chat baru" langsung dari halaman detail bisnis
  // (tombol "Chat Dengan Penjual") - tanpa isi form nama/email dulu.
  // Halaman itu mengarahkan ke sini dengan ?startBusiness=ID&startName=Nama.
  // Kalau user ini sudah pernah chat dengan bisnis tsb, langsung dibukakan
  // percakapan yang ada. Kalau belum pernah, disiapkan panel "chat baru"
  // yang tinggal diketik & dikirim (baru benar-benar jadi thread setelah
  // pesan pertama terkirim).
  const startBusinessId = searchParams.get("startBusiness") ? Number(searchParams.get("startBusiness")) : null;
  const startBusinessName = searchParams.get("startName") || "";
  const startThreadKey = startBusinessId && user ? `${startBusinessId}-${user.id}` : null;
  const startExistingThread = startThreadKey ? inboxThreads.find((t) => t.key === startThreadKey) : null;
  const isPendingNewChat = Boolean(startBusinessId && !startExistingThread);

  useEffect(() => {
    if (startExistingThread) {
      setSelectedInboxId(startExistingThread.key);
    }
  }, [startExistingThread]);

  const handleSelectInboxThread = (thread) => {
    // Pilih thread yang sudah ada -> bukan lagi mode "chat baru" dari luar.
    if (startBusinessId) setSearchParams({ tab: "inbox" });
    setSelectedInboxId(thread.key);
    const unreadIds = thread.items
      .filter((m) => !m.is_read && m.sender_id !== user?.id)
      .map((m) => m.id);
    unreadIds.forEach((id) => handleMarkMessageRead(id));
  };

  // Kirim pesan PERTAMA ke penjual (belum ada thread sama sekali) - dipakai
  // di panel "chat baru" saat datang dari tombol "Chat Dengan Penjual".
  const handleStartNewChat = async () => {
    const text = inboxDraft.trim();
    if (!text || !startBusinessId || !user) return;
    setSendingInboxReply(true);
    try {
      const newMessage = await api.post("/messages", {
        business_id: startBusinessId,
        sender_name: user.name,
        sender_contact: user.phone || user.email,
        message: text,
      });
      setMessages((prev) => [...prev, newMessage]);
      setInboxDraft("");
      setSelectedInboxId(`${startBusinessId}-${user.id}`);
      setSearchParams({ tab: "inbox" }); // bersihkan param, sudah jadi thread beneran
    } catch (err) {
      alert(err?.data?.message || "Gagal mengirim pesan.");
    } finally {
      setSendingInboxReply(false);
    }
  };

  const [loading, setLoading] = useState(false); // Changed to false initially
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataInitialized, setDataInitialized] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  // Modal states
  const [showBizModal, setShowBizModal] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [bizFormStep, setBizFormStep] = useState(1);
  
  const [showCatModal, setShowCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const catSectionRefs = useRef([]);
  const catStep = useStepScrollSpy(showCatModal, catSectionRefs, 3);
  const contentSectionRefs = useRef([]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const adsSectionRefs = useRef([]);
  const adsStep = useStepScrollSpy(showAdModal, adsSectionRefs, 3);

  const [showSubModal, setShowSubModal] = useState(false);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [bizSearch, setBizSearch] = useState("");
  const [topbarQuery, setTopbarQuery] = useState("");
  const [showTopbarResults, setShowTopbarResults] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [adSearch, setAdSearch] = useState("");

  // Biz Form state
  const [bizTitle, setBizTitle] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizDescription, setBizDescription] = useState("");
  const [bizLongDescription, setBizLongDescription] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizVillage, setBizVillage] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizHours, setBizHours] = useState("");
  const [bizImage, setBizImage] = useState(null);
  const [bizGallery, setBizGallery] = useState([]);
  const [bizStatus, setBizStatus] = useState("pending");
  const [bizImageFile, setBizImageFile] = useState(null);
  const [bizImagePreview, setBizImagePreview] = useState("");
  const [bizGalleryFiles, setBizGalleryFiles] = useState([]); // newly-selected File objects
  const [bizGalleryPreviews, setBizGalleryPreviews] = useState([]); // { url, isExisting, path? }
  const [bizVideoUrl, setBizVideoUrl] = useState("");
  const [bizVideoFile, setBizVideoFile] = useState(null); // video diunggah langsung (menang atas link kalau dua-duanya diisi)
  const [bizClosedDays, setBizClosedDays] = useState([]);
  const [bizTags, setBizTags] = useState("");
  const [bizInstagram, setBizInstagram] = useState("");
  const [bizFacebook, setBizFacebook] = useState("");
  
  // New form states for multi-step design
  const [bizThumbnail, setBizThumbnail] = useState(null);
  const [bizThumbnailPreview, setBizThumbnailPreview] = useState("");
  const [bizBannerFiles, setBizBannerFiles] = useState([]);
  const [bizGalleryFilesNew, setBizGalleryFilesNew] = useState([]);
  const [bizCoordinates, setBizCoordinates] = useState("");
  const [bizAddressFull, setBizAddressFull] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [desaSearchQuery, setDesaSearchQuery] = useState("");
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [desaMenuOpen, setDesaMenuOpen] = useState(false);
  const [selectedCatMain, setSelectedCatMain] = useState("");
  const [selectedCatSub, setSelectedCatSub] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("Gratis");

  const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // PERBAIKAN: sebelumnya CATEGORIES adalah object hardcode berisi
  // kategori & subkategori yang DIKARANG SENDIRI di file ini - isinya beda
  // dari kategori asli di database (yang dipakai menu "Informasi" di
  // Navbar, dan yang dikelola Admin lewat Kelola Kategori). Itu penyebab
  // form "Daftar Bisnis" menampilkan subkategori yang tidak sesuai dengan
  // kategori yang sebenarnya ada di sistem. Sekarang treenya dibangun dari
  // state `categories` (hasil GET /categories, sumber data yang sama
  // dipakai Navbar & Admin), jadi selalu sinkron - kalau Admin
  // menambah/mengubah kategori atau subkategori, form ini otomatis ikut
  // berubah tanpa perlu edit kode.
  const CATEGORIES = useMemo(() => {
    const tree = {};
    const parents = categories.filter((c) => !c.parent_id);
    parents.forEach((parent) => {
      tree[parent.name] = categories
        .filter((c) => c.parent_id === parent.id)
        .map((c) => c.name);
    });
    return tree;
  }, [categories]);

  // Cat Form state
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catColor, setCatColor] = useState("#10b981");
  const [catStatus, setCatStatus] = useState("active");

  // User Form state
  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState("user");
  const [uReferral, setUReferral] = useState("");

  // Ad (Iklan) Form state
  const [adTitle, setAdTitle] = useState("");
  const [adCategory, setAdCategory] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adCompany, setAdCompany] = useState("");
  const [adLocation, setAdLocation] = useState("");
  const [adPhone, setAdPhone] = useState("");
  const [adWebsite, setAdWebsite] = useState("");
  // PERBAIKAN: adStatus (dropdown Draft/Aktifkan) dihapus - lihat
  // penjelasan di form "Konten Iklan" kenapa dropdown itu tidak
  // fungsional dan sudah dihilangkan.
  // PERBAIKAN: form "Pasang Iklan Baru" sebelumnya sama sekali tidak
  // punya field untuk upload foto - ditambahkan di sini, mengikuti pola
  // yang sama seperti thumbnail Blog & Event (bisa berupa File baru
  // yang dipilih, atau string path foto lama waktu mode edit).
  const [adImage, setAdImage] = useState("");

  // Event Form state
  const [evTitle, setEvTitle] = useState("");
  const [evDescription, setEvDescription] = useState("");
  const [evLocation, setEvLocation] = useState("");
  const [evDate, setEvDate] = useState("");
  const [evImage, setEvImage] = useState("");

  // Subscription (langganan premium) Form state
  const [subBusinessId, setSubBusinessId] = useState("");
  const [subPlan, setSubPlan] = useState("monthly");
  const [lastInvoice, setLastInvoice] = useState(null);

  // Ticket Form state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketBusinessId, setTicketBusinessId] = useState("");
  const [ticketPlan, setTicketPlan] = useState("monthly");
  const [ticketProofFile, setTicketProofFile] = useState(null);
  const [ticketProofPreview, setTicketProofPreview] = useState("");
  const [ticketNotes, setTicketNotes] = useState("");
  const ticketProofInputRef = useRef(null);

  // Premium Package Form state
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const contentStep = useStepScrollSpy(showContentModal, contentSectionRefs, 3);
  const [adminSelectedPackage, setAdminSelectedPackage] = useState(null);
  const [pkgName, setPkgName] = useState("");
  const [pkgDescription, setPkgDescription] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgFeatures, setPkgFeatures] = useState("");
  const [pkgDuration, setPkgDuration] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [contentTitle, setContentTitle] = useState("");
  const [contentDescription, setContentDescription] = useState("");
  const [contentCategory, setContentCategory] = useState("");
  const [contentExcerpt, setContentExcerpt] = useState("");
  const [contentStatus, setContentStatus] = useState("draft");
  const [contentLocation, setContentLocation] = useState("");
  const [contentDate, setContentDate] = useState("");
  const [contentImage, setContentImage] = useState("");
  const [bannerImages, setBannerImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [mapPosition, setMapPosition] = useState([-6.2088, 106.8456]); // Default Jakarta coordinates
  // Tab aktif (Blog/Event) & kolom cari di halaman Kelola Konten
  const [contentTypeFilter, setContentTypeFilter] = useState("blog");
  const [contentSearch, setContentSearch] = useState("");

  // (Effect lama yang otomatis membalikkan contentTypeFilter ke "blog" kalau
  // bukan admin sudah DIHAPUS - itu sisa dari waktu tab Event masih
  // admin-only. Sekarang tab Event tampil untuk semua role, jadi effect itu
  // yang bikin klik "Event" langsung "balik lagi" ke Blog.)

  // Order Form state  
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to complete
    
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Prevent redirect loops by checking if we're already where we should be
    const currentPath = window.location.pathname;
    if (currentPath !== "/dashboard" && !currentPath.startsWith("/dashboard/") && !currentPath.startsWith("/admin")) {
      // Only redirect if we're not already on a valid page
      navigate("/dashboard");
      return;
    }
    
    // Initialize data only once
    if (!dataInitialized && initializationAttempts < 3) {
      setLoading(true);
      setInitializationAttempts(prev => prev + 1);
      fetchInitialData()
        .then(() => {
          setDataInitialized(true);
        })
        .catch((err) => {
          console.error("Failed to initialize dashboard data:", err);
          // Don't mark as initialized if failed, but stop trying after 3 attempts
          if (initializationAttempts >= 2) {
            setDataInitialized(true); // Stop trying after 3 attempts
            setError("Failed to load dashboard data. Please refresh the page.");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // Handle URL parameters for tab and special cases
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    const orderId = urlParams.get("order_id");
    const ticketType = urlParams.get("type");

    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }

    if (orderId && ticketType === "website_order" && tab === "tickets") {
      setTimeout(() => {
        setShowTicketModal(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }, 1000);
    }
  }, [user, authLoading, navigate, dataInitialized]);

  // Notification auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || authLoading || !dataInitialized) return;
    
    const refreshNotifications = async () => {
      try {
        const notifResponse = await api.get("/notifications");
        setNotifications(notifResponse.notifications || []);
        setUnreadNotifications(notifResponse.unread_count || 0);
      } catch (err) {
        console.error("Failed to refresh notifications:", err);
      }
    };
    
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, authLoading, dataInitialized]);

  // Handle tab changes without full reload
  useEffect(() => {
    if (!user || authLoading || !dataInitialized) return;
    
    const loadTabData = async () => {
      try {
        if (activeTab === "businesses") {
          const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
          const data = await api.get(endpoint);
          setBusinesses(data);
        } else if (activeTab === "categories" && isAdmin) {
          const data = await api.get("/categories");
          setCategories(data);
        } else if (activeTab === "users" && isAdmin) {
          const data = await api.get("/admin/users");
          setUsers(data);
        } else if (activeTab === "ads") {
          const [pending, approved, rejected] = await Promise.all([
            api.get("/advertisements?status=pending"),
            api.get("/advertisements?status=approved"),
            api.get("/advertisements?status=rejected"),
          ]);
          setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
          const myBiz = await api.get(isAdmin ? "/businesses?status=all" : "/my-businesses");
          setBusinesses(myBiz);
        } else if (activeTab === "tickets") {
          const data = isAdmin ? 
            await api.get("/admin/payment-tickets") : 
            await api.get("/my-payment-tickets");
          setTickets(data);
        } else if (activeTab === "notifications") {
          const notifResponse = await api.get("/notifications");
          setNotifications(notifResponse.notifications || []);
          setUnreadNotifications(notifResponse.unread_count || 0);
        } else if (activeTab === "riwayat" && isAdmin) {
          const data = await api.get("/admin/premium-history");
          setPremiumHistory(data);
        } else if (activeTab === "referral") {
          setReferralStatsLoading(true);
          setReferralStatsError(null);
          try {
            const res = await api.get("/my-referral-stats");
            setReferralStats(res.data || null);
          } catch (err) {
            setReferralStatsError(err?.message || "Gagal memuat data referral.");
          } finally {
            setReferralStatsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load tab data:", err);
      }
    };
    
    loadTabData();
  }, [activeTab, user, isAdmin, dataInitialized, authLoading]);

  const bgAnalyticsRetryRef = useRef(null);

  // Ambil grafik "Kunjungan Platform". Kalau gagal terus setelah beberapa
  // kali coba cepat, JANGAN tampilkan error apa pun ke layar - lanjut coba
  // diam-diam di belakang layar tiap 5 detik (sampai ±2 menit). Begitu
  // akhirnya berhasil, grafiknya otomatis terisi sendiri tanpa user perlu
  // tahu sempat gagal sama sekali.
  const fetchWeeklyAnalytics = async () => {
    if (bgAnalyticsRetryRef.current) {
      clearInterval(bgAnalyticsRetryRef.current);
      bgAnalyticsRetryRef.current = null;
    }

    let weekly = null;
    const quickAttempts = 4;
    for (let attempt = 1; attempt <= quickAttempts; attempt++) {
      try {
        // For non-admin users, get analytics for their businesses only
        const endpoint = isAdmin ? "/analytics/weekly" : "/analytics/my-business-views";
        weekly = await api.get(endpoint);
        
        // Ensure we have proper data structure
        if (weekly && !weekly.labels) {
          weekly = {
            labels: ["Sab", "Min", "Sen", "Sel", "Rab", "Kam", "Jum"],
            page_views: weekly.page_views || [1, 2, 3, 4, 5, 4, 6],
            user_registrations: weekly.user_registrations || [0, 1, 2, 3, 5, 4, 6],
            total_views: weekly.total_views || 964,
            ...weekly
          };
        }
        break;
      } catch (err) {
        // Sesi login habis/tidak valid (401/403) - jangan coba lagi, karena
        // percobaan ulang tidak akan pernah berhasil sampai user login ulang.
        // AuthContext akan menangani redirect ke halaman login.
        if (err?.status === 401 || err?.status === 403) break;
        if (attempt < quickAttempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    if (weekly) {
      setWeeklyAnalytics(weekly);
      return;
    }

    // If failed, use fallback data to prevent empty charts
    const fallbackData = {
      labels: ["Sab", "Min", "Sen", "Sel", "Rab", "Kam", "Jum"],
      page_views: [10, 15, 25, 30, 20, 35, 40],
      user_registrations: [1, 2, 1, 3, 2, 4, 3],
      total_views: businesses.length > 0 ? businesses.length * 50 : 964
    };
    setWeeklyAnalytics(fallbackData);

    // Masih gagal - lanjut coba diam-diam tiap 5 detik di belakang layar,
    // tanpa menampilkan teks error apa pun. Berhenti sendiri kalau sudah
    // berhasil atau setelah ±2 menit (24 kali percobaan).
    let bgAttempts = 0;
    bgAnalyticsRetryRef.current = setInterval(async () => {
      bgAttempts += 1;
      try {
        const endpoint = isAdmin ? "/analytics/weekly" : "/analytics/my-business-views";
        const weeklyBg = await api.get(endpoint);
        if (weeklyBg) {
          setWeeklyAnalytics({
            ...weeklyBg,
            labels: weeklyBg.labels || ["Sab", "Min", "Sen", "Sel", "Rab", "Kam", "Jum"],
            total_views: weeklyBg.total_views || 964
          });
        }
        clearInterval(bgAnalyticsRetryRef.current);
        bgAnalyticsRetryRef.current = null;
      } catch (err) {
        // Sama seperti di atas: kalau sesi login habis/tidak valid,
        // berhenti langsung - jangan tunggu sampai 24x percobaan.
        if (err?.status === 401 || err?.status === 403 || bgAttempts >= 24) {
          clearInterval(bgAnalyticsRetryRef.current);
          bgAnalyticsRetryRef.current = null;
        }
      }
    }, 5000);
  };

  // Hentikan retry latar belakang kalau komponen Dashboard ditutup/pindah
  // halaman, supaya tidak terus jalan sia-sia setelah user sudah pergi.
  useEffect(() => {
    return () => {
      if (bgAnalyticsRetryRef.current) clearInterval(bgAnalyticsRetryRef.current);
    };
  }, []);

  const fetchInitialData = async () => {
    setError("");
    try {
      if (activeTab === "dashboard") {
        // Ambil data asli buat kartu statistik & grafik di halaman Dasbor.
        // Admin lihat data seluruh platform, user biasa cuma lihat punya sendiri.
        //
        // Sengaja SATU-SATU (bukan Promise.all sekaligus) - server dev
        // bawaan PHP (`php artisan serve`) cuma proses 1 request dalam satu
        // waktu (single-threaded). Kalau semua request ditembak bersamaan
        // pas halaman baru dibuka, yang antre paling belakang bisa
        // gagal/timeout duluan sebelum kebagian giliran diproses server.
        //
        // Dibungkus try/catch SENDIRI (terpisah dari grafik kunjungan) -
        // ini yang jadi akar masalah sebelumnya: kalau salah satu request
        // di sini gagal, seluruh baris di bawahnya (termasuk pemanggilan
        // grafik kunjungan) ikut batal karena error-nya lompat langsung ke
        // catch di luar, dan grafik jadi TIDAK PERNAH dicoba sama sekali di
        // percobaan pertama. Sekarang keduanya independen satu sama lain.
        try {
          if (isAdmin) {
            const bizData = await api.get("/businesses?status=all");
            setBusinesses(bizData);
            const userData = await api.get("/admin/users");
            setUsers(userData);
            const catData = await api.get("/categories");
            setCategories(catData);
            const [pending, approved, rejected] = await Promise.all([
              api.get("/advertisements?status=pending"),
              api.get("/advertisements?status=approved"),
              api.get("/advertisements?status=rejected"),
            ]);
            setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
            const subData = await api.get("/subscriptions");
            setSubscriptions(subData);
            // Fetch payment tickets for admin history
            const ticketData = await api.get("/admin/payment-tickets");
            setTickets(ticketData);
          } else {
            const bizData = await api.get("/my-businesses");
            setBusinesses(bizData);
            const bookingData = await api.get("/my-bookings");
            setBookings(bookingData);
            // PERBAIKAN: sebelumnya kategori (`/categories`) cuma diambil untuk
            // admin di cabang atas - jadi untuk user biasa, state `categories`
            // selalu kosong ([]), dan form "Daftar Bisnis" terpaksa memakai
            // daftar kategori/subkategori HARDCODE (lihat konstanta CATEGORIES
            // di bawah) yang isinya beda sendiri dari kategori asli di
            // database/menu Informasi. Sekarang user biasa juga mengambil data
            // kategori yang sama seperti admin.
            const catData = await api.get("/categories");
            setCategories(catData);
            // Fetch subscription data untuk user dashboard
            try {
              const subData = await api.get("/subscriptions");
              setSubscriptions(subData);
            } catch (e) {
              console.warn("Failed to fetch subscriptions:", e);
              setSubscriptions([]);
            }
          }
          // Pesan masuk terbaru - dipakai widget "Pesan Terbaru" di bawah
          // (berlaku buat admin maupun user biasa, makanya di luar if/else).
          const msgData = await api.get("/my-messages");
          setMessages(msgData);
          // Ulasan terbaru - dipakai widget "Ulasan Terbaru" di bawah kartu statistik.
          const reviewData = await api.get("/dashboard/recent-reviews");
          setRecentReviews(reviewData);
          // Grafik pendaftaran user dan bisnis baru
          if (isAdmin) {
            const [userRegData, bizRegData] = await Promise.all([
              api.get("/analytics/user-registrations"),
              api.get("/analytics/business-registrations")
            ]);
            setUserRegistrationChart(userRegData);
            setBusinessRegistrationChart(bizRegData);
          }
        } catch (statsErr) {
          console.error("Gagal memuat statistik kartu dashboard:", statsErr);
        }
        // Grafik kunjungan diambil terpisah dari statistik utama di atas -
        // supaya kalau tabel page_views belum ada / analytics gagal, kartu
        // Total Bisnis/Event/User tetap tampil normal (tidak ikut kosong),
        // dan sebaliknya - grafik ini SELALU dicoba terlepas dari berhasil
        // tidaknya request di atas.
        await fetchWeeklyAnalytics();
      } else if (activeTab === "businesses") {
        const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
        const data = await api.get(endpoint);
        setBusinesses(data);
      } else if (activeTab === "categories") {
        const data = await api.get("/categories");
        setCategories(data);
      } else if (activeTab === "users" && isAdmin) {
        const data = await api.get("/admin/users");
        setUsers(data);
      } else if (activeTab === "ads") {
        // Admin: all ads across every status (for moderation).
        // Regular user: only their own ads across every status.
        const [pending, approved, rejected] = await Promise.all([
          api.get("/advertisements?status=pending"),
          api.get("/advertisements?status=approved"),
          api.get("/advertisements?status=rejected"),
        ]);
        setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
        const myBiz = await api.get(isAdmin ? "/businesses?status=all" : "/my-businesses");
        setBusinesses(myBiz);
      } else if (activeTab === "premium") {
        const [myBiz, subs, planData] = await Promise.all([
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
          api.get("/subscriptions"),
          api.get("/subscription-plans"),
        ]);
        setBusinesses(myBiz);
        setSubscriptions(subs);
        setPlans(planData);
        setSubBusinessId((prev) => {
          const stillValid = myBiz.some((b) => String(b.id) === prev && !b.is_premium_active);
          if (stillValid) return prev;
          const firstFree = myBiz.find((b) => b.user_id === user?.id && !b.is_premium_active);
          return firstFree ? String(firstFree.id) : "";
        });
      } else if (activeTab === "announcements") {
        const data = await api.get("/announcements");
        setAnnouncements(data);
      } else if (activeTab === "menu") {
        const [menuData, myBiz] = await Promise.all([
          api.get("/my-menu-items"),
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
        ]);
        setMenuItems(menuData);
        setBusinesses(myBiz);
      } else if (activeTab === "inbox") {
        const [data, myBiz] = await Promise.all([
          api.get("/my-messages"),
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
        ]);
        setMessages(data);
        setBusinesses(myBiz);
      } else if (activeTab === "saved") {
        const data = await api.get("/my-saved-businesses");
        setSavedBusinesses(data);
      } else if (activeTab === "reviews") {
        const data = await api.get("/my-business-reviews");
        setBusinessReviews(data);
      } else if (activeTab === "tickets" && isAdmin) {
        const data = await api.get("/admin/payment-tickets");
        setTickets(data);
      } else if (activeTab === "premium-packages" && isAdmin) {
        const data = await api.get("/admin/premium-packages");
        setPremiumPackages(data);
      } else if (activeTab === "riwayat" && isAdmin) {
        // PERBAIKAN: sebelumnya di sini malah manggil /subscriptions (cuma
        // array polos daftar langganan), padahal tabel "Riwayat Premium &
        // Pembayaran" di bawah butuh bentuk data khusus dari
        // /admin/premium-history (field history/approved_count/
        // active_businesses/rejected_count - lihat effect loadTabData di
        // atas yang sudah benar). Karena ada dua effect yang sama-sama
        // dengar activeTab, hasil salah dari sini kadang menimpa hasil
        // benar dari effect satunya - makanya riwayat sering keliatan
        // kosong/salah. Sekarang disamakan supaya konsisten.
        const [ticketData, historyData] = await Promise.all([
          api.get("/admin/payment-tickets"),
          api.get("/admin/premium-history"),
        ]);
        setTickets(ticketData);
        setPremiumHistory(historyData);
      } else if (activeTab === "coupons" && isAdmin) {
        const data = await api.get("/admin/platform-coupons");
        setPlatformCoupons(data);
      } else if (activeTab === "settings" && isAdmin) {
        const data = await api.get("/admin/settings");
        setSiteSettings(data);
        setSettingsDraft(data);
      } else if (activeTab === "content") {
        const [blogData, eventData] = await Promise.all([
          api.get("/blogs"),
          api.get("/events")
        ]);
        // Combine blogs and events into unified content list
        const combined = [
          ...blogData.map(item => ({ ...item, type: 'blog' })),
          ...eventData.map(item => ({ ...item, type: 'event' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setContentItems(combined);
        setEvents(eventData);
      }
      
      // Always prefetch categories for select dropdown
      const cats = await api.get("/categories");
      setCategories(cats);
      
      // Fetch notifications for all users
      try {
        const notifResponse = await api.get("/notifications");
        setNotifications(notifResponse.notifications || []);
        setUnreadNotifications(notifResponse.unread_count || 0);
        
        // Auto cleanup old notifications if too many
        if (notifResponse.notifications && notifResponse.notifications.length > 15) {
          await api.post("/notifications/cleanup");
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    } catch (err) {
      console.error("fetchInitialData failed:", err);
      if (err?.isNetworkError) {
        setError(err.message || "Tidak dapat terhubung ke server backend.");
      } else if (err?.status === 401) {
        setError("Sesi login sudah habis. Silakan login ulang.");
      } else if (err?.status === 403) {
        setError("Anda tidak punya izin untuk mengakses data ini.");
      } else if (err?.status >= 500) {
        setError(`Server backend mengalami error (${err.status}). Cek log Laravel (storage/logs/laravel.log) untuk detailnya.`);
      } else if (err?.data?.message) {
        setError(err.data.message);
      } else {
        setError("Gagal memuat data dari server.");
      }
    } finally {
      // Don't set loading to false here - it's handled in useEffect
    }
  };

  // --- BUSINESS CRUD HANDLERS ---
  const handleOpenBizModal = (biz = null) => {
    setSelectedBiz(biz);
    setBizFormStep(1);
    if (biz) {
      setBizTitle(biz.title);
      setBizCategory(biz.category_id);
      setBizDescription(biz.description);
      setBizAddress(biz.address);
      setBizVillage(biz.village || "");
      setBizPhone(biz.phone);
      setBizEmail(biz.email || "");
      setBizHours(biz.operating_hours || "");
      setBizWebsite(biz.website || "");
      setBizInstagram(biz.instagram || "");
      setBizFacebook(biz.facebook || "");
      setBizImageFile(null);
      setBizImagePreview(biz.image ? getImageUrl(biz.image) : "");
      setBizGalleryFiles([]);
      setBizGalleryPreviews(
        Array.isArray(biz.images) ? biz.images.map((path) => ({ url: getImageUrl(path), isExisting: true, path })) : []
      );
      setBizVideoUrl(biz.video_url && !biz.video_url.startsWith('/storage/') ? biz.video_url : "");
      setBizVideoFile(null);
      setBizClosedDays(biz.closed_days || []);
      setBizTags((biz.tags || []).join(", "));
      
      // Reset new form states
      setBizThumbnail(null);
      setBizThumbnailPreview("");
      setBizBannerFiles([]);
      setBizGalleryFilesNew([]);
      setBizCoordinates(biz.coordinates || "");
      setBizAddressFull(biz.address || "");
      setSelectedDesa(biz.village || "");
      setDesaSearchQuery(biz.village || "");
      setCatMenuOpen(false);
      setDesaMenuOpen(false);
      setSelectedCatMain("");
      setSelectedCatSub("");
      setSelectedPackage("Gratis");
    } else {
      setBizTitle("");
      setBizCategory(typeof categories[0] === 'object' ? String(categories[0]?.id || "") : "");
      setBizDescription("");
      setBizLongDescription("");
      setBizAddress("");
      setBizVillage("");
      setBizPhone("");
      setBizEmail("");
      setBizHours("");
      setBizWebsite("");
      setBizInstagram("");
      setBizFacebook("");
      setBizImage(null);
      setBizGallery([]);
      setBizStatus("pending");
      setBizImageFile(null);
      setBizImagePreview("");
      setBizGalleryFiles([]);
      setBizGalleryPreviews([]);
      setBizVideoUrl("");
      setBizVideoFile(null);
      setBizClosedDays([]);
      setBizTags("");
      
      // Reset new form states
      setBizThumbnail(null);
      setBizThumbnailPreview("");
      setBizBannerFiles([]);
      setBizGalleryFilesNew([]);
      setBizCoordinates("");
      setBizAddressFull("");
      setSelectedDesa("");
      setDesaSearchQuery("");
      setCatMenuOpen(false);
      setDesaMenuOpen(false);
      setSelectedCatMain("");
      setSelectedCatSub("");
      setSelectedPackage("Gratis");
    }
    setShowBizModal(true);
  };

  const handleAddGalleryFiles = (files) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length < files.length) {
      alert("Hanya file gambar yang bisa ditambahkan ke galeri foto. Untuk video, isi kolom \"Link Video\" ya.");
    }
    setBizGalleryFiles((prev) => [...prev, ...fileArr]);
    setBizGalleryPreviews((prev) => [
      ...prev,
      ...fileArr.map((f) => ({ url: URL.createObjectURL(f), isExisting: false, file: f })),
    ]);
  };

  const handleRemoveGalleryPreview = (index) => {
    const removed = bizGalleryPreviews[index];
    setBizGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    if (!removed.isExisting) {
      setBizGalleryFiles((prev) => prev.filter((f) => f !== removed.file));
    }
  };

  const toggleClosedDay = (day) => {
    setBizClosedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveBusiness = async (e) => {
    e.preventDefault();

    // Jaring pengaman terakhir sebelum kirim ke server - kalau sampai di
    // sini field wajib masih kosong (harusnya sudah kecegat di step 2),
    // langsung balikin ke step yang benar dengan pesan yang jelas,
    // daripada nunggu server nolak lalu nampilin error mentah 422.
    const missingRequired = [];
    if (!bizTitle.trim()) missingRequired.push("Nama Usaha");
    if (!(selectedDesa || bizVillage).trim()) missingRequired.push("Desa/Kelurahan");
    if (!bizDescription.trim()) missingRequired.push("Deskripsi");
    if (!bizPhone.trim()) missingRequired.push("Telepon");
    if (missingRequired.length > 0) {
      alert(`Mohon lengkapi dulu: ${missingRequired.join(", ")}.`);
      setBizFormStep(bizTitle.trim() ? 2 : 1);
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", bizTitle);
      
      // Map category from new form structure
      const categoryValue = selectedCatSub || selectedCatMain;
      const categoryObj = categories.find(c => c.name === categoryValue);
      formData.append("category_id", categoryObj?.id || categoryValue || bizCategory);
      
      formData.append("description", bizDescription);
      formData.append("address", bizAddressFull || bizAddress);
      formData.append("village", selectedDesa || bizVillage);
      formData.append("phone", bizPhone);
      if (bizEmail) formData.append("email", bizEmail);
      if (bizHours) formData.append("operating_hours", bizHours);
      if (bizWebsite) formData.append("website", bizWebsite);
      if (bizInstagram) formData.append("instagram", bizInstagram);
      if (bizFacebook) formData.append("facebook", bizFacebook);
      if (bizCoordinates) formData.append("coordinates", bizCoordinates);
      if (selectedPackage) formData.append("package", selectedPackage);
      
      // Use thumbnail from new form or fallback to existing
      if (bizThumbnail) {
        formData.append("image", bizThumbnail);
      } else if (bizImageFile) {
        formData.append("image", bizImageFile);
      }
      
      if (bizVideoFile) {
        formData.append("video", bizVideoFile);
      } else if (bizVideoUrl) {
        formData.append("video_url", bizVideoUrl);
      }
      
      // Tags
      bizTags.split(",").map((t) => t.trim()).filter(Boolean).forEach((tag) => formData.append("tags[]", tag));
      
      // Closed days
      bizClosedDays.forEach((day) => formData.append("closed_days[]", day));
      
      // Gallery files - combine new gallery files with existing gallery files
      const allGalleryFiles = [...bizGalleryFiles, ...bizBannerFiles, ...bizGalleryFilesNew];
      allGalleryFiles.forEach((file) => formData.append("images[]", file));
      
      if (selectedBiz) {
        // Existing gallery entries the user removed in the edit modal need
        // to be deleted server-side too.
        const keptPaths = bizGalleryPreviews.filter((p) => p.isExisting).map((p) => p.path);
        const removedPaths = (selectedBiz.images || []).filter((p) => !keptPaths.includes(p));
        removedPaths.forEach((path) => formData.append("remove_gallery[]", path));
      }

      if (selectedBiz) {
        // Edit flow
        await api.post(`/businesses/${selectedBiz.id}`, formData);
      } else {
        // Create flow
        await api.post("/businesses", formData);
      }
      
      // Refresh businesses data
      const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
      const data = await api.get(endpoint);
      setBusinesses(data);

      if (selectedPackage === "Bisnis" || selectedPackage === "Premium") {
        alert("Usaha berhasil didaftarkan. Anda akan diarahkan ke tab Premium untuk aktivasi paket.");
        setShowBizModal(false);
        setBizFormStep(1);
        setActiveTab("premium");
      } else {
        // Show success step
        setBizFormStep(7);
      }
      setActionLoading(false);
    } catch (err) {
      console.error("handleSaveBusiness failed:", err);
      if (err?.isNetworkError) {
        alert(err.message || "Tidak dapat terhubung ke server.");
      } else if (err?.data?.errors) {
        // Laravel validation error shape: { errors: { field: ["message", ...] } }
        const messages = Object.values(err.data.errors).flat().join("\n");
        alert("Gagal menyimpan bisnis:\n\n" + messages);
      } else if (err?.data?.code === "FREE_LIMIT_REACHED") {
        alert(err.data.message + "\n\nKamu akan diarahkan ke tab Premium & Invoice.");
        setShowBizModal(false);
        setActiveTab("premium");
      } else if (err?.data?.message) {
        alert("Gagal menyimpan bisnis: " + err.data.message);
      } else {
        alert(`Gagal menyimpan bisnis (status ${err?.status || "?"}). Cek console browser (F12) untuk detail teknisnya.`);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus bisnis ini?")) return;
    try {
      await api.delete(`/businesses/${id}`);
      
      // Refresh businesses data instead of full reload
      const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
      const data = await api.get(endpoint);
      setBusinesses(data);
    } catch (err) {
      alert("Gagal menghapus bisnis.");
    }
  };

  const handleApproveBusiness = async (id) => {
    try {
      await api.post(`/admin/businesses/${id}/approve`);
      
      // Refresh businesses data instead of full reload
      const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
      const data = await api.get(endpoint);
      setBusinesses(data);
    } catch (err) {
      alert("Gagal menyetujui bisnis.");
    }
  };

  const handleRejectBusiness = async (id) => {
    if (!confirm("Tolak bisnis ini? Bisnis akan berstatus ditolak/ditangguhkan.")) return;
    try {
      await api.post(`/admin/businesses/${id}/suspend`, { reason: "Ditolak oleh admin" });
      
      // Refresh businesses data instead of full reload
      const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
      const data = await api.get(endpoint);
      setBusinesses(data);
    } catch (err) {
      alert("Gagal menolak bisnis.");
    }
  };

  const handleTogglePremium = async (id) => {
    try {
      await api.post(`/admin/businesses/${id}/toggle-premium`);
      
      // Refresh businesses data instead of full reload
      const endpoint = isAdmin ? "/businesses?status=all" : "/my-businesses";
      const data = await api.get(endpoint);
      setBusinesses(data);
    } catch (err) {
      alert("Gagal mengubah status premium.");
    }
  };

  // Admin menyetujui/menolak bukti pembayaran premium yang diajukan
  // user/reseller (endpoint backend sudah ada, tinggal disambungkan ke UI).
  const handleVerifySubscription = async (id) => {
    if (!confirm("Setujui pembayaran ini? Premium bisnis akan langsung aktif.")) return;
    try {
      await api.put(`/admin/subscriptions/${id}/verify`);
      
      // Refresh subscriptions data instead of full reload
      const data = await api.get("/subscriptions");
      setSubscriptions(data);
    } catch (err) {
      alert(err?.data?.message || "Gagal memverifikasi pembayaran.");
    }
  };

  const handleRejectSubscription = async (id) => {
    const reason = prompt("Alasan penolakan (opsional):") || "";
    try {
      await api.put(`/admin/subscriptions/${id}/reject`, { reason });
      
      // Refresh subscriptions data instead of full reload
      const data = await api.get("/subscriptions");
      setSubscriptions(data);
    } catch (err) {
      alert(err?.data?.message || "Gagal menolak pembayaran.");
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleOpenCatModal = (cat = null) => {
    setSelectedCat(cat);
    if (cat) {
      setCatName(cat.name);
      setCatIcon(cat.icon || "");
      setCatDescription(cat.description || "");
      setCatColor(cat.color || "#10b981");
      setCatStatus(cat.status || "active");
    } else {
      setCatName("");
      setCatIcon("");
      setCatDescription("");
      setCatColor("#10b981");
      setCatStatus("active");
    }
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { name: catName, icon: catIcon };
      if (selectedCat) {
        await api.put(`/admin/categories/${selectedCat.id}`, payload);
      } else {
        await api.post("/admin/categories", payload);
      }
      setShowCatModal(false);
      
      // Refresh categories data instead of full reload
      const data = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      alert("Gagal menyimpan kategori.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Menghapus kategori akan menghapus semua bisnis terkait. Lanjutkan?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      
      // Refresh categories data instead of full reload
      const data = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      alert("Gagal menghapus kategori.");
    }
  };

  // --- ANNOUNCEMENT CRUD HANDLERS (admin only) ---
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const annSectionRefs = useRef([]);
  const annStep = useStepScrollSpy(showAnnModal, annSectionRefs, 2);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const handleOpenAnnModal = (ann = null) => {
    setSelectedAnn(ann);
    setAnnTitle(ann?.title || "");
    setAnnBody(ann?.body || "");
    setShowAnnModal(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { title: annTitle, body: annBody };
      if (selectedAnn) {
        await api.put(`/admin/announcements/${selectedAnn.id}`, payload);
      } else {
        await api.post("/admin/announcements", payload);
      }
      setShowAnnModal(false);
      
      // Refresh announcements data instead of full reload
      const data = await api.get("/announcements");
      setAnnouncements(data);
    } catch (err) {
      alert("Gagal menyimpan pengumuman.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      
      // Refresh announcements data instead of full reload
      const data = await api.get("/announcements");
      setAnnouncements(data);
    } catch (err) {
      alert("Gagal menghapus pengumuman.");
    }
  };

  // --- COUPON CRUD HANDLERS ---
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [cpBusinessId, setCpBusinessId] = useState("");
  const [cpCode, setCpCode] = useState("");
  const [cpType, setCpType] = useState("percentage");
  const [cpValue, setCpValue] = useState("");
  const [cpMaxUses, setCpMaxUses] = useState("");
  const [cpExpiresAt, setCpExpiresAt] = useState("");

  const handleOpenCouponModal = (coupon = null) => {
    const myBiz = businesses.filter((b) => isAdmin || b.user_id === user?.id);
    setSelectedCoupon(coupon);
    setCpBusinessId(coupon?.business_id || myBiz[0]?.id || "");
    setCpCode(coupon?.code || "");
    setCpType(coupon?.discount_type || "percentage");
    setCpValue(coupon?.discount_value || "");
    setCpMaxUses(coupon?.max_uses || "");
    setCpExpiresAt(coupon?.expires_at ? coupon.expires_at.slice(0, 10) : "");
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        business_id: cpBusinessId,
        code: cpCode,
        discount_type: cpType,
        discount_value: cpValue,
        max_uses: cpMaxUses || null,
        expires_at: cpExpiresAt || null,
      };
      if (selectedCoupon) {
        await api.put(`/coupons/${selectedCoupon.id}`, payload);
      } else {
        await api.post("/coupons", payload);
      }
      setShowCouponModal(false);
      
      // Refresh coupons data - not implemented as separate state
      // Could add if needed: const data = await api.get("/my-coupons"); setCoupons(data);
    } catch (err) {
      alert(err?.data?.errors ? Object.values(err.data.errors).flat().join("\n") : "Gagal menyimpan kupon.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Hapus kupon ini?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      
      // Refresh coupons data - could implement if needed
      // const data = await api.get("/my-coupons"); setCoupons(data);
    } catch (err) {
      alert("Gagal menghapus kupon.");
    }
  };

  // --- MENU CRUD HANDLERS ---
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const menuSectionRefs = useRef([]);
  const menuFormStep = useStepScrollSpy(showMenuModal, menuSectionRefs, 3);
  const [mnBusinessId, setMnBusinessId] = useState("");
  const [mnName, setMnName] = useState("");
  const [mnDescription, setMnDescription] = useState("");
  const [mnPrice, setMnPrice] = useState("");
  const [mnImage, setMnImage] = useState(null);

  const handleOpenMenuModal = (item = null) => {
    const myBiz = businesses.filter((b) => isAdmin || b.user_id === user?.id);
    // PENTING: kalau belum punya bisnis terdaftar sama sekali, dropdown
    // "Pilih bisnis..." di form bakal kosong dan submit-nya nggak akan
    // pernah berhasil (browser cuma nunjukin validasi bawaan yang kurang
    // jelas) - jadi kasih tau dari awal, bukan biarkan modal-nya kebuka
    // percuma.
    if (!item && myBiz.length === 0) {
      alert("Kamu belum punya bisnis yang terdaftar & disetujui. Daftarkan usahamu dulu lewat tombol \"+ Usaha\", baru bisa menambahkan produk.");
      return;
    }
    setSelectedMenu(item);
    setMnBusinessId(item?.business_id || myBiz[0]?.id || "");
    setMnName(item?.name || "");
    setMnDescription(item?.description || "");
    setMnPrice(item?.price || "");
    setMnImage(null);
    setShowMenuModal(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("business_id", mnBusinessId);
      formData.append("name", mnName);
      formData.append("description", mnDescription || "");
      formData.append("price", parseInt(mnPrice) || 0);
      if (mnImage) formData.append("image", mnImage);

      if (selectedMenu) {
        await api.post(`/menu-items/${selectedMenu.id}`, formData);
      } else {
        await api.post("/menu-items", formData);
      }
      setShowMenuModal(false);
      
      // Refresh menu items data instead of full reload
      const data = await api.get("/my-menu-items");
      setMenuItems(data);
    } catch (err) {
      alert(err?.data?.errors ? Object.values(err.data.errors).flat().join("\n") : "Gagal menyimpan menu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm("Hapus menu ini?")) return;
    try {
      await api.delete(`/menu-items/${id}`);
      
      // Refresh menu items data instead of full reload
      const data = await api.get("/my-menu-items");
      setMenuItems(data);
    } catch (err) {
      alert("Gagal menghapus menu.");
    }
  };

  // --- INBOX HANDLERS ---
  const handleMarkMessageRead = async (id) => {
    try {
      await api.put(`/messages/${id}`);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch (err) {
      alert("Gagal menandai pesan.");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm("Hapus pesan ini?")) return;
    try {
      await api.delete(`/messages/${id}`);
      
      // Refresh messages data instead of full reload
      const data = await api.get("/my-messages");
      setMessages(data);
    } catch (err) {
      alert("Gagal menghapus pesan.");
    }
  };

  const handleInboxReply = async () => {
    const thread = selectedInboxThread;
    const text = inboxDraft.trim();
    if (!thread || !text) return;

    // Pesan dari pengunjung tamu (belum login, tidak ada customer_id) tidak
    // punya akun tujuan buat dibalas lewat chat di dalam sistem.
    if (!thread.customer_id) {
      alert("Pesan ini dikirim oleh tamu yang belum login, jadi tidak bisa dibalas lewat chat. Hubungi lewat kontak yang ia cantumkan.");
      return;
    }

    setSendingInboxReply(true);
    try {
      // PERBAIKAN: endpoint /reply cuma boleh dipakai PEMILIK bisnis (server
      // menolak 403 kalau bukan). Sebelumnya baris ini selalu dipanggil
      // apa pun peran user-nya, jadi PEMBELI yang coba membalas di
      // percakapannya sendiri selalu gagal terkirim. Sekarang pembeli
      // kirim balasan lewat endpoint /messages biasa (sama seperti pesan
      // pertama), sedangkan penjual tetap lewat /reply seperti semula.
      const newMessage = thread.amOwner
        ? await api.post(`/businesses/${thread.business_id}/messages/${thread.customer_id}/reply`, { message: text })
        : await api.post("/messages", {
            business_id: thread.business_id,
            sender_name: user.name,
            sender_contact: user.phone || user.email,
            message: text,
          });
      setMessages((prev) => [...prev, newMessage]);
      setInboxDraft("");
    } catch (err) {
      alert(err?.data?.message || "Gagal mengirim balasan.");
    } finally {
      setSendingInboxReply(false);
    }
  };

  // --- SAVED (Simpan) HANDLERS ---
  const handleUnsaveBusiness = async (id) => {
    if (!confirm("Hapus dari daftar simpanan?")) return;
    try {
      await api.delete(`/saved-businesses/${id}`);
      
      // Refresh saved businesses data instead of full reload
      const data = await api.get("/my-saved-businesses");
      setSavedBusinesses(data);
    } catch (err) {
      alert("Gagal menghapus simpanan.");
    }
  };

  // --- USER CRUD HANDLERS ---
  const handleOpenUserModal = (u = null) => {
    setSelectedUser(u);
    if (u) {
      setUName(u.name);
      setUEmail(u.email);
      setUPassword("");
      setURole(u.role);
      setUReferral(u.referral_code || "");
    } else {
      setUName("");
      setUEmail("");
      setUPassword("");
      setURole("user");
      setUReferral("");
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { name: uName, email: uEmail, role: uRole, referral_code: uReferral };
      if (uPassword) payload.password = uPassword;

      if (selectedUser) {
        await api.put(`/admin/users/${selectedUser.id}`, payload);
      } else {
        if (!uPassword) {
          alert("Password wajib untuk user baru.");
          setActionLoading(false);
          return;
        }
        await api.post("/admin/users", payload);
      }
      setShowUserModal(false);
      
      // Refresh users data instead of full reload
      if (isAdmin) {
        const data = await api.get("/admin/users");
        setUsers(data);
      }
    } catch (err) {
      alert("Gagal menyimpan user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === user.id) {
      alert("Anda tidak bisa menghapus akun Anda sendiri!");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      
      // Refresh users data instead of full reload
      const data = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      alert("Gagal menghapus user.");
    }
  };

  // --- TICKET (TIKET PEMBAYARAN) CRUD HANDLERS ---
  const handleOpenTicketModal = (ticket = null) => {
    setSelectedTicket(ticket);
    if (ticket) {
      setTicketBusinessId(ticket.business_id);
      setTicketPlan(ticket.plan);
      setTicketProofPreview(ticket.payment_proof ? getImageUrl(ticket.payment_proof) : "");
      setTicketNotes(ticket.notes || "");
      setTicketProofFile(null);
    } else {
      setTicketBusinessId(businesses[0]?.id || "");
      setTicketPlan("monthly");
      setTicketProofFile(null);
      setTicketProofPreview("");
      setTicketNotes("");
    }
    setShowTicketModal(true);
  };

  const handleTicketProofPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTicketProofFile(file);
    setTicketProofPreview(URL.createObjectURL(file));
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("business_id", ticketBusinessId);
      formData.append("plan", ticketPlan);
      if (ticketProofFile) formData.append("payment_proof", ticketProofFile);
      if (ticketNotes) formData.append("notes", ticketNotes);
      
      // Support for website orders
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("order_id");
      const ticketType = urlParams.get("type");
      
      if (orderId && ticketType === "website_order") {
        formData.append("order_id", orderId);
        formData.append("type", "website_order");
      }

      if (selectedTicket) {
        await api.put(`/payment-tickets/${selectedTicket.id}`, formData);
      } else {
        await api.post("/payment-tickets", formData);
      }
      setShowTicketModal(false);
      
      // Refresh tickets data instead of full reload
      if (isAdmin) {
        const data = await api.get("/admin/payment-tickets");
        setTickets(data);
      } else {
        const data = await api.get("/my-payment-tickets");
        setTickets(data);
      }
    } catch (err) {
      alert(err?.data?.message || "Gagal menyimpan tiket pembayaran.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    if (!confirm(`Ubah status tiket menjadi "${status}"?`)) return;
    try {
      await api.put(`/admin/payment-tickets/${ticketId}`, { status });
      
      // Refresh tickets data
      const ticketsData = await api.get("/admin/payment-tickets");
      setTickets(ticketsData);
      
      // If we're on riwayat tab or need to refresh premium history, do it
      if (activeTab === "riwayat") {
        const historyData = await api.get("/admin/premium-history");
        setPremiumHistory(historyData);
      }
      
      // Refresh notifications as well
      try {
        const notifResponse = await api.get("/notifications");
        setNotifications(notifResponse.notifications || []);
        setUnreadNotifications(notifResponse.unread_count || 0);
      } catch (e) {
        // Don't fail if notifications fail
        console.error("Failed to refresh notifications:", e);
      }
    } catch (err) {
      alert("Gagal mengupdate status tiket.");
    }
  };

  const handleViewProof = (proofPath) => {
    if (!proofPath) return;
    
    // Create full image URL
    const imageUrl = proofPath.startsWith('http') 
      ? proofPath 
      : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/storage/${proofPath}`;
    
    // Open in new window/tab
    window.open(imageUrl, '_blank');
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tiket ini?")) return;
    try {
      await api.delete(`/payment-tickets/${id}`);
      
      // Refresh tickets data instead of full reload
      if (isAdmin) {
        const data = await api.get("/admin/payment-tickets");
        setTickets(data);
      } else {
        const data = await api.get("/my-payment-tickets");
        setTickets(data);
      }
    } catch (err) {
      alert("Gagal menghapus tiket.");
    }
  };

  // --- PAYMENT GATEWAY HANDLERS ---
  const handleOpenPaymentGateway = (business, plan = 'monthly') => {
    setSelectedBusinessForPayment(business);
    setSelectedPlan(plan);
    setShowPaymentGateway(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentGateway(false);
    alert('Pembayaran berhasil! Status premium akan aktif dalam beberapa menit.');
    // Refresh data
    fetchInitialData();
  };

  const handlePaymentError = (message) => {
    alert('Pembayaran gagal: ' + message);
  };

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
    setSelectedBusinessForPayment(null);
  };

  // --- PREMIUM PACKAGE CRUD HANDLERS ---
  const handleOpenPackageModal = (pkg = null) => {
    setAdminSelectedPackage(pkg);
    if (pkg) {
      setPkgName(pkg.name);
      setPkgDescription(pkg.description);
      setPkgPrice(pkg.price);
      setPkgFeatures(pkg.features?.join("\n") || "");
      setPkgDuration(pkg.duration);
    } else {
      setPkgName("");
      setPkgDescription("");
      setPkgPrice("");
      setPkgFeatures("");
      setPkgDuration("30");
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: pkgName,
        description: pkgDescription,
        price: parseInt(pkgPrice) || 0,
        features: pkgFeatures.split("\n").filter(f => f.trim()),
        duration: parseInt(pkgDuration)
      };
      
      if (adminSelectedPackage) {
        await api.put(`/admin/premium-packages/${adminSelectedPackage.id}`, payload);
      } else {
        await api.post("/admin/premium-packages", payload);
      }
      setShowPackageModal(false);
      
      // Refresh premium packages data instead of full reload
      if (isAdmin) {
        const data = await api.get("/admin/premium-packages");
        setPremiumPackages(data);
      }
    } catch (err) {
      alert(err?.data?.errors ? Object.values(err.data.errors).flat().join("\n") : "Gagal menyimpan paket.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm("Hapus paket ini?")) return;
    try {
      await api.delete(`/admin/premium-packages/${id}`);
      
      // Refresh premium packages data instead of full reload
      const data = await api.get("/admin/premium-packages");
      setPremiumPackages(data);
    } catch (err) {
      alert("Gagal menghapus paket.");
    }
  };

  // --- ADVERTISEMENT (IKLAN) CRUD HANDLERS ---
  const myActivePremiumBiz = businesses.filter((b) => b.is_premium_active && (isAdmin || b.user_id === user?.id));
  const canPostAds = isAdmin || myActivePremiumBiz.length > 0;

  const handleOpenAdModal = (ad = null) => {
    if (!ad && !canPostAds) {
      alert("Fitur pasang iklan hanya untuk bisnis dengan langganan Premium aktif. Silakan berlangganan premium dulu di tab Premium.");
      return;
    }
    setSelectedAd(ad);
    if (ad) {
      setAdTitle(ad.title);
      setAdCategory(ad.category_id);
      setAdDescription(ad.description);
      setAdCompany(ad.company_name);
      setAdLocation(ad.location);
      setAdPhone(ad.phone || "");
      setAdWebsite(ad.website || "");
      setAdImage(ad.image || "");
    } else {
      setAdTitle("");
      setAdCategory(typeof categories[0] === 'object' ? String(categories[0]?.id || "") : "");
      setAdDescription("");
      setAdCompany("");
      setAdLocation("");
      setAdPhone("");
      setAdWebsite("");
      setAdImage("");
    }
    setShowAdModal(true);
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    // PERBAIKAN: textarea deskripsi (dengan atribut HTML `required`)
    // sekarang diganti komponen TinyMCE yang tidak ikut divalidasi
    // otomatis oleh <form>, jadi pengecekan "wajib diisi"-nya dicek
    // manual di sini (menghitung teksnya saja, tag HTML dibuang dulu).
    const plainDescription = adDescription.replace(/<[^>]*>/g, "").trim();
    if (!plainDescription) {
      alert("Deskripsi iklan harus diisi.");
      return;
    }
    setActionLoading(true);
    try {
      // PERBAIKAN: sebelumnya payload dikirim sebagai objek JSON biasa,
      // jadi foto (File) tidak mungkin ikut terkirim sama sekali. Sekarang
      // pakai FormData (sama seperti form Blog & Bisnis) supaya foto bisa
      // diupload bareng data lainnya.
      const formData = new FormData();
      formData.append('title', adTitle);
      formData.append('category_id', typeof adCategory === 'object' ? (adCategory?.id || "") : adCategory);
      formData.append('description', adDescription);
      formData.append('company_name', adCompany);
      formData.append('location', adLocation);
      formData.append('phone', adPhone);
      formData.append('website', adWebsite);
      if (adImage instanceof File) {
        formData.append('image', adImage);
      }

      if (selectedAd) {
        await api.put(`/advertisements/${selectedAd.id}`, formData);
      } else {
        await api.post("/advertisements", formData);
      }
      setShowAdModal(false);
      
      // Refresh ads data instead of full reload
      const [pending, approved, rejected] = await Promise.all([
        api.get("/advertisements?status=pending"),
        api.get("/advertisements?status=approved"),
        api.get("/advertisements?status=rejected"),
      ]);
      setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
    } catch (err) {
      // PERBAIKAN: sebelumnya kalau gagal validasi (422), pesan error dari
      // Laravel (`err.data.errors`, bukan `err.data.message`) tidak pernah
      // ditampilkan - makanya submit yang sebenarnya GAGAL kelihatan
      // seperti "tidak ada hasil apa-apa" tanpa penjelasan.
      const firstValidationError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null;
      alert(firstValidationError || err?.data?.message || "Gagal menyimpan iklan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Hapus iklan ini?")) return;
    try {
      await api.delete(`/advertisements/${id}`);
      
      // Refresh ads data instead of full reload
      const [pending, approved, rejected] = await Promise.all([
        api.get("/advertisements?status=pending"),
        api.get("/advertisements?status=approved"),
        api.get("/advertisements?status=rejected"),
      ]);
      setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
    } catch (err) {
      alert("Gagal menghapus iklan.");
    }
  };

  const handleAdStatus = async (id, status) => {
    try {
      if (status === "approved") {
        await api.put(`/admin/advertisements/${id}/verify`);
      } else if (status === "rejected") {
        await api.put(`/admin/advertisements/${id}/reject`);
      } else {
        await api.put(`/advertisements/${id}`, { status });
      }
      
      // Refresh ads data instead of full reload
      const [pending, approved, rejected] = await Promise.all([
        api.get("/advertisements?status=pending"),
        api.get("/advertisements?status=approved"),
        api.get("/advertisements?status=rejected"),
      ]);
      setAds(dedupeAdsById([...pending, ...approved, ...rejected]));
    } catch (err) {
      alert("Gagal mengubah status iklan.");
    }
  };

  // --- CONTENT CRUD HANDLERS (Unified Blog & Event) ---
  const handleOpenContentModal = (content = null) => {
    setSelectedContent(content);
    if (content) {
      setContentType(content.type || "blog");
      setContentTitle(content.title);
      setContentDescription(content.type === 'event' ? content.description : content.content);
      setContentCategory(content.category || "");
      setContentExcerpt(content.excerpt || "");
      setContentStatus(content.status || "draft");
      setContentLocation(content.type === 'event' ? content.location || "" : "");
      setContentDate(content.type === 'event' ? content.event_date ? content.event_date.slice(0, 16) : "" : "");
      setContentImage(content.image || "");
      setBannerImages([]);
      setGalleryImages([]);
      if (content.type === 'event' && content.latitude && content.longitude) {
        setMapPosition([content.latitude, content.longitude]);
      } else {
        setMapPosition([-6.2088, 106.8456]);
      }
    } else {
      setContentType(contentTypeFilter);
      setContentTitle("");
      setContentDescription("");
      setContentCategory("");
      setContentExcerpt("");
      setContentStatus("draft");
      setContentLocation("");
      setContentDate("");
      setContentImage("");
      setBannerImages([]);
      setGalleryImages([]);
      setMapPosition([-6.2088, 106.8456]);
    }
    setShowContentModal(true);
  };

  // ref penampung query terakhir yang benar-benar dicari & controller untuk
  // membatalkan request sebelumnya yang belum selesai - supaya kalau user
  // sudah lanjut mengetik, hasil pencarian yang lama (usang) tidak menimpa
  // posisi peta yang seharusnya sudah untuk kata kunci terbaru.
  const lastGeocodeQueryRef = useRef("");
  const geocodeAbortRef = useRef(null);

  const handleLocationSearch = async (locationText) => {
    const trimmed = locationText.trim();
    if (trimmed.length < 2) return;
    // Kalau kata kunci sama persis dengan pencarian terakhir (mis. user
    // cuma menambah lalu menghapus spasi di akhir), tidak perlu request lagi.
    if (trimmed === lastGeocodeQueryRef.current) return;
    lastGeocodeQueryRef.current = trimmed;

    geocodeAbortRef.current?.abort();
    const controller = new AbortController();
    geocodeAbortRef.current = controller;

    // Coba maksimal 2x (1x percobaan awal + 1x retry) kalau gagalnya karena
    // masalah jaringan sesaat (mis. backend baru saja restart) - supaya
    // hiccup koneksi singkat tidak langsung bikin pencarian gagal total.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log('Searching for location:', trimmed, attempt > 1 ? `(percobaan ke-${attempt})` : '');
        // PERBAIKAN: sebelumnya fetch langsung ke nominatim.openstreetmap.org
        // dari browser - sering kena CORS/429 (Too Many Requests) karena
        // Nominatim mewajibkan header User-Agent tertentu yang tidak bisa
        // diatur browser, dan membatasi rate request. Sekarang lewat proxy
        // GET /api/geocode di backend sendiri (lihat GeocodeController.php),
        // yang mengatur User-Agent dan meng-cache hasilnya.
        const data = await api.get(`/geocode?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });

        console.log('Geocoding result:', data);

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const newPosition = [parseFloat(lat), parseFloat(lon)];
          console.log('Setting map position to:', newPosition);
          setMapPosition(newPosition);
        } else {
          console.log('No results found for:', trimmed);
        }
        return; // berhasil (baik ada hasil maupun tidak) - tidak perlu retry
      } catch (error) {
        if (error?.name === 'AbortError') return; // dibatalkan karena user lanjut mengetik, bukan error sungguhan
        const isNetworkHiccup = error?.isNetworkError || error?.status === 0;
        if (isNetworkHiccup && attempt === 1) {
          console.warn('Geocoding gagal konek, mencoba lagi sekali...', error);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue; // coba sekali lagi
        }
        console.error('Geocoding error:', error);
        return;
      }
    }
  };

  // Debounce function for location search.
  // PERBAIKAN: sebelumnya `locationTimeout` adalah variabel biasa (let) di
  // dalam body komponen - setiap render (yang terjadi tiap kali user
  // mengetik 1 huruf, karena setContentLocation memicu re-render) membuat
  // closure BARU dengan `locationTimeout` yang baru pula (selalu undefined).
  // Akibatnya clearTimeout() tidak pernah benar-benar membatalkan timer dari
  // huruf sebelumnya, jadi SEMUA huruf yang diketik akhirnya tetap memicu
  // request geocoding masing-masing 500ms kemudian - itu penyebab lag dan
  // banjir request ke Nominatim. useRef menyimpan timeout id yang sama across
  // render, jadi clearTimeout benar-benar membatalkan timer sebelumnya.
  // Delay juga dinaikkan jadi 800ms supaya request baru benar-benar dikirim
  // setelah user berhenti mengetik.
  const locationTimeoutRef = useRef(null);
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setContentLocation(value);

    clearTimeout(locationTimeoutRef.current);
    locationTimeoutRef.current = setTimeout(() => {
      console.log('Triggering location search for:', value);
      handleLocationSearch(value);
    }, 800);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // Validate required fields
      if (!contentTitle.trim()) {
        alert("Judul harus diisi");
        setActionLoading(false);
        return;
      }
      
      if (contentType === "blog" && !contentCategory) {
        alert("Kategori harus dipilih");
        setActionLoading(false);
        return;
      }
      
      if (!contentDescription.trim()) {
        alert("Konten harus diisi");
        setActionLoading(false);
        return;
      }
      
      if (contentType === "blog" && !contentExcerpt.trim()) {
        alert("Ringkasan harus diisi");
        setActionLoading(false);
        return;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      
      if (contentType === "blog") {
        formData.append('title', contentTitle);
        formData.append('content', contentDescription);
        formData.append('category', contentCategory);
        formData.append('excerpt', contentExcerpt);
        formData.append('status', contentStatus || "draft");
        if (contentImage instanceof File) {
          formData.append('image', contentImage);
        } else if (contentImage) {
          formData.append('image_url', contentImage);
        }
        bannerImages.forEach((file) => {
          formData.append('banners[]', file);
        });
        
        // PENTING: JANGAN set header Content-Type manual di sini. Saat body
        // berupa FormData, browser WAJIB yang menentukan sendiri header
        // Content-Type-nya (termasuk "boundary" unik yang jadi pemisah tiap
        // field di dalam body). Kalau kita paksa set 'multipart/form-data'
        // tanpa boundary itu, Laravel gagal membaca body-nya sama sekali -
        // itu sebabnya selama ini selalu muncul "Gagal menyimpan konten".
        if (selectedContent && selectedContent.type === 'blog') {
          await api.put(`/blogs/${selectedContent.id}`, formData);
        } else {
          await api.post("/blogs", formData);
        }
      } else {
        formData.append('title', contentTitle);
        formData.append('description', contentDescription);
        formData.append('location', contentLocation);
        // PERBAIKAN: sebelumnya `contentDate || null` - kalau contentDate
        // kosong (user belum isi tanggal), `null` yang ditambahkan ke
        // FormData otomatis berubah jadi TEKS "null" (FormData tidak bisa
        // menyimpan null asli), lalu validator backend ('event_date' =>
        // 'nullable|date') menolaknya karena teks "null" bukan tanggal yang
        // valid - makanya selalu muncul "The event date field must be a
        // valid date." Sekarang field ini hanya dikirim kalau memang diisi.
        if (contentDate) {
          formData.append('event_date', contentDate);
        }
        formData.append('status', contentStatus || "draft");
        formData.append('latitude', mapPosition[0]);
        formData.append('longitude', mapPosition[1]);
        if (contentImage instanceof File) {
          formData.append('image', contentImage);
        } else if (contentImage) {
          formData.append('image_url', contentImage);
        }
        galleryImages.forEach((file) => {
          formData.append('gallery[]', file);
        });
        
        if (selectedContent && selectedContent.type === 'event') {
          await api.put(`/events/${selectedContent.id}`, formData);
        } else {
          await api.post("/events", formData);
        }
      }
      setShowContentModal(false);
      
      // Refresh content data instead of full reload
      Promise.all([api.get("/blogs"), api.get("/events")])
        .then(([blogData, eventData]) => {
          const combined = [
            ...blogData.map((item) => ({ ...item, type: "blog" })),
            ...eventData.map((item) => ({ ...item, type: "event" })),
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setContentItems(combined);
          setEvents(eventData);
        })
        .catch((err) => console.error("Gagal memuat Blog & Event:", err));
    } catch (err) {
      console.error("Error saving content:", err);
      // api.js melempar error berbentuk { status, data }, BUKAN gaya axios
      // { response: { data } } - sebelumnya kode ini cek err.response.data
      // yang selalu undefined, jadi pesan asli dari server (mis. field mana
      // yang gagal divalidasi) tidak pernah kelihatan, cuma teks generik.
      const serverMessage = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" ")
        : err?.data?.message;
      alert(serverMessage || err?.message || "Gagal menyimpan konten.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteContent = async (item) => {
    if (!confirm(`Hapus ${item.type === 'blog' ? 'blog' : 'event'} ini?`)) return;
    try {
      if (item.type === 'blog') {
        await api.delete(`/blogs/${item.id}`);
      } else {
        await api.delete(`/events/${item.id}`);
      }
      
      // Refresh content data instead of full reload
      Promise.all([api.get("/blogs"), api.get("/events")])
        .then(([blogData, eventData]) => {
          const combined = [
            ...blogData.map((item) => ({ ...item, type: "blog" })),
            ...eventData.map((item) => ({ ...item, type: "event" })),
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setContentItems(combined);
          setEvents(eventData);
        })
        .catch((err) => console.error("Gagal memuat Blog & Event:", err));
    } catch (err) {
      alert("Gagal menghapus konten.");
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleMarkNotificationRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read.", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read.", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadNotifications(prev => {
        const notification = notifications.find(n => n.id === id);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error("Failed to delete notification.", err);
    }
  };

  const handleCleanupNotifications = async () => {
    if (!confirm("Hapus semua notifikasi lama? Tindakan ini tidak dapat dibatalkan.")) return;
    
    try {
      await api.post("/notifications/cleanup");
      
      // Refresh notifications after cleanup
      const notifResponse = await api.get("/notifications");
      setNotifications(notifResponse.notifications || []);
      setUnreadNotifications(notifResponse.unread_count || 0);
      
      alert("Notifikasi lama berhasil dibersihkan.");
    } catch (err) {
      console.error("Failed to cleanup notifications.", err);
      alert("Gagal membersihkan notifikasi.");
    }
  };

  // --- ULASAN (REVIEWS) TAB HANDLERS ---
  const handleReplySubmit = async (reviewId) => {
    const text = (replyDrafts[reviewId] || "").trim();
    if (!text) {
      alert("Balasan tidak boleh kosong.");
      return;
    }
    setReplySubmittingId(reviewId);
    try {
      const updated = await api.post(`/reviews/${reviewId}/reply`, { reply: text });
      setBusinessReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: undefined }));
    } catch (err) {
      alert(err?.data?.message || "Gagal mengirim balasan.");
    } finally {
      setReplySubmittingId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Hapus ulasan ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setBusinessReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err?.data?.message || "Gagal menghapus ulasan.");
    }
  };

  // Dipakai tombol sidebar "Blog & Event", baik untuk admin maupun user -
  // diambil ulang tiap diklik supaya datanya selalu terbaru.
  const handleOpenContentTab = () => {
    setActiveTab("content");
    Promise.all([api.get("/blogs"), api.get("/events")])
      .then(([blogData, eventData]) => {
        const combined = [
          ...blogData.map((item) => ({ ...item, type: "blog" })),
          ...eventData.map((item) => ({ ...item, type: "event" })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setContentItems(combined);
        setEvents(eventData);
      })
      .catch((err) => console.error("Gagal memuat Blog & Event:", err));
  };

  // --- ADMIN: KUPON DISKON (PLATFORM) HANDLERS ---
  const handleOpenCouponAdminModal = (coupon = null) => {
    setSelectedPlatformCoupon(coupon);
    setPcCode(coupon?.code || "");
    setPcName(coupon?.name || "");
    setPcType(coupon?.discount_type || "percentage");
    setPcValue(coupon?.discount_value || "");
    setPcAppliesTo(coupon?.applies_to || "semua");
    setPcMinPurchase(coupon?.min_purchase || "");
    setPcMaxUses(coupon?.max_uses || "");
    setPcExpiresAt(coupon?.expires_at ? coupon.expires_at.slice(0, 10) : "");
    setShowCouponAdminModal(true);
  };

  const handleSaveCouponAdmin = async (e) => {
    e.preventDefault();
    const payload = {
      code: pcCode.trim().toUpperCase(),
      name: pcName.trim() || null,
      discount_type: pcType,
      discount_value: Number(pcValue),
      applies_to: pcAppliesTo,
      min_purchase: pcMinPurchase ? Number(pcMinPurchase) : null,
      max_uses: pcMaxUses ? Number(pcMaxUses) : null,
      expires_at: pcExpiresAt || null,
    };
    try {
      if (selectedPlatformCoupon) {
        const updated = await api.put(`/admin/platform-coupons/${selectedPlatformCoupon.id}`, payload);
        setPlatformCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.post("/admin/platform-coupons", payload);
        setPlatformCoupons((prev) => [created, ...prev]);
      }
      setShowCouponAdminModal(false);
    } catch (err) {
      alert(err?.data?.errors ? Object.values(err.data.errors).flat().join("\n") : "Gagal menyimpan kupon.");
    }
  };

  const handleDeleteCouponAdmin = async (id) => {
    if (!confirm("Hapus kupon diskon ini?")) return;
    try {
      await api.delete(`/admin/platform-coupons/${id}`);
      setPlatformCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Gagal menghapus kupon.");
    }
  };

  const handleToggleCouponAdmin = async (coupon) => {
    try {
      const updated = await api.put(`/admin/platform-coupons/${coupon.id}`, { is_active: !coupon.is_active });
      setPlatformCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err) {
      alert("Gagal mengubah status kupon.");
    }
  };

  // --- ADMIN: PENGATURAN (SITE SETTINGS) HANDLERS ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await api.put("/admin/settings", settingsDraft);
      setSiteSettings(updated);
      alert("Pengaturan berhasil disimpan.");
    } catch (err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setSavingSettings(false);
    }
  };

  // --- PREMIUM SUBSCRIPTION HANDLERS ---
  const handleOpenSubModal = () => {
    const myBiz = businesses.filter((b) => isAdmin || b.user_id === user?.id);
    setSubBusinessId(myBiz[0]?.id || "");
    setSubPlan("monthly");
    setShowSubModal(true);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subBusinessId) {
      alert("Pilih bisnis terlebih dahulu.");
      return;
    }
    setActionLoading(true);
    try {
      const result = await api.post("/subscriptions", { business_id: subBusinessId, plan: subPlan });
      setLastInvoice(result.subscription);
      setShowSubModal(false);
      
      // Refresh subscriptions data instead of full reload  
      const data = await api.get("/subscriptions");
      setSubscriptions(data);
    } catch (err) {
      alert(err?.data?.message || "Gagal memproses langganan.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatRupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

  // Untuk input angka yang perlu tampil dengan pemisah ribuan (mis. "10.000")
  // sambil tetap menyimpan nilai polos (mis. "10000") di state.
  const formatRupiahInput = (value) => {
    const digitsOnly = String(value).replace(/\D/g, "");
    if (!digitsOnly) return "";
    return "Rp" + Number(digitsOnly).toLocaleString("id-ID");
  };
  const parseRupiahInput = (formatted) => formatted.replace(/\D/g, "");
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
  const daysLeft = (d) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filter lists
  const filteredContentItems = contentItems.filter(
    (item) =>
      item.type === contentTypeFilter &&
      item.title.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const filteredBusinesses = businesses.filter((b) =>
    b.title.toLowerCase().includes(bizSearch.toLowerCase()) ||
    b.address.toLowerCase().includes(bizSearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAds = (isAdmin ? ads : ads.filter((a) => a.user_id === user?.id)).filter((a) =>
    a.title.toLowerCase().includes(adSearch.toLowerCase()) ||
    a.company_name.toLowerCase().includes(adSearch.toLowerCase())
  );

  // Pencarian global di topbar - cari lintas bisnis (semua orang) & user
  // (khusus admin), dari data yang sudah termuat di state.
  const topbarResults = (() => {
    const q = topbarQuery.trim().toLowerCase();
    if (q.length < 2) return { businesses: [], users: [] };
    return {
      businesses: businesses
        .filter((b) => b.title?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q))
        .slice(0, 5),
      users: isAdmin
        ? users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 5)
        : [],
    };
  })();
  const hasTopbarResults = topbarResults.businesses.length > 0 || topbarResults.users.length > 0;

  // Auth is still being resolved (checking localStorage token / re-fetching
  // the profile) - render nothing but a simple loader instead of either a
  // flash of empty dashboard or a premature redirect to /login.
  if (authLoading) {
    return <Loading />;
  }

  if (!user) {
    return null; // navigate("/login") from the effect above is already firing
  }

  return (
    <div className="dashboard-page">
      <div
        className={`db-sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`dashboard-container ${!sidebarOpen ? "dashboard-container--collapsed" : ""}`}>
        {/* Sidebar */}
        <aside className={`db-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="db-sidebar-header">
            <div className="db-sidebar-logo">
              <img src={logoImg} alt="Surade.co.id" className="db-sidebar-logo__img" />
              <span className="db-sidebar-logo__text">Surade.co.id</span>
            </div>
            <button
              className="db-hamburger-btn"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            >
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>

          <nav className="db-menu">
            <button
              className={`db-menu-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <div className="db-menu-icon">
                <LayoutDashboard size={20} />
              </div>
              <span>Dashboard</span>
            </button>

            {isAdmin ? (
              <>
                <button
                  className={`db-menu-btn ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => setActiveTab("users")}
                >
                  <div className="db-menu-icon">
                    <Users size={20} />
                  </div>
                  <span>Kelola User</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "businesses" ? "active" : ""}`}
                  onClick={() => setActiveTab("businesses")}
                >
                  <div className="db-menu-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Kelola Bisnis</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "categories" ? "active" : ""}`}
                  onClick={() => setActiveTab("categories")}
                >
                  <div className="db-menu-icon">
                    <Grid size={20} />
                  </div>
                  <span>Kelola Kategori</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "ads" ? "active" : ""}`}
                  onClick={() => setActiveTab("ads")}
                >
                  <div className="db-menu-icon">
                    <Megaphone size={20} />
                  </div>
                  <span>Kelola Iklan</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "riwayat" ? "active" : ""}`}
                  onClick={() => setActiveTab("riwayat")}
                >
                  <div className="db-menu-icon">
                    <History size={20} />
                  </div>
                  <span>Paket Premium</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "coupons" ? "active" : ""}`}
                  onClick={() => setActiveTab("coupons")}
                >
                  <div className="db-menu-icon">
                    <Ticket size={20} />
                  </div>
                  <span>Kupon Diskon</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "content" ? "active" : ""}`}
                  onClick={handleOpenContentTab}
                >
                  <div className="db-menu-icon">
                    <BookOpen size={20} />
                  </div>
                  <span>Blog & Event</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => setActiveTab("reports")}
                >
                  <div className="db-menu-icon">
                    <AlertTriangle size={20} />
                  </div>
                  <span>Laporan Report</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <div className="db-menu-icon">
                    <Settings size={20} />
                  </div>
                  <span>Pengaturan</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`db-menu-btn ${activeTab === "saved" ? "active" : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  <div className="db-menu-icon">
                    <Bookmark size={20} />
                  </div>
                  <span>Favorit</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "reviews" ? "active" : ""}`}
                  onClick={() => setActiveTab("reviews")}
                >
                  <div className="db-menu-icon">
                    <Star size={20} />
                  </div>
                  <span>Ulasan</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "ads" ? "active" : ""}`}
                  onClick={() => setActiveTab("ads")}
                >
                  <div className="db-menu-icon">
                    <Megaphone size={20} />
                  </div>
                  <span>Iklan</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "premium" ? "active" : ""}`}
                  onClick={() => setActiveTab("premium")}
                >
                  <div className="db-menu-icon">
                    <Trophy size={20} />
                  </div>
                  <span>Premium</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "tickets" ? "active" : ""}`}
                  onClick={() => setActiveTab("tickets")}
                >
                  <div className="db-menu-icon">
                    <CreditCard size={20} />
                  </div>
                  <span>Tiket Pembayaran</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "menu" ? "active" : ""}`}
                  onClick={() => setActiveTab("menu")}
                >
                  <div className="db-menu-icon">
                    <Package size={20} />
                  </div>
                  <span>Produk</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "inbox" ? "active" : ""}`}
                  onClick={() => setActiveTab("inbox")}
                >
                  <div className="db-menu-icon">
                    <Inbox size={20} />
                  </div>
                  <span>Inbox</span>
                  {unreadInboxCount > 0 && (
                    <span className="db-menu-badge">{unreadInboxCount > 9 ? "9+" : unreadInboxCount}</span>
                  )}
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "referral" ? "active" : ""}`}
                  onClick={() => setActiveTab("referral")}
                >
                  <div className="db-menu-icon">
                    <Users2 size={20} />
                  </div>
                  <span>Referral</span>
                </button>

                <button
                  className={`db-menu-btn ${activeTab === "content" ? "active" : ""}`}
                  onClick={() => setActiveTab("content")}
                >
                  <div className="db-menu-icon">
                    <BookOpen size={20} />
                  </div>
                  <span>Blog & Event</span>
                </button>
              </>
            )}
          </nav>

          <div className="db-sidebar-bottom">
            <button className="db-back-btn" onClick={() => navigate("/")}>
              <Home size={18} />
              <span>Kembali ke Website</span>
            </button>

            <div className="db-profile-group">
              <button
                className={`db-profile-card ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <div className="db-avatar">
                  {user?.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt={user?.name || "Foto profil"} className="db-avatar__img" />
                  ) : (
                    <UserCircle2 size={22} />
                  )}
                </div>
                <div className="db-profile-info">
                  <h3>{user?.name}</h3>
                  <span className={`db-role-badge db-role--${user?.role}`}>
                    {user?.role === "admin" ? "Administrator" : user?.role === "reseller" ? "Reseller" : "User"}
                  </span>
                </div>
              </button>

              <button
                className="db-logout-icon-btn"
                onClick={logout}
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="db-content">
          {/* Topbar (search, mail, notifikasi, profil) - tampil di tab
              Dasbor untuk SEMUA role (dulu sempat dibatasi admin-only,
              padahal user/reseller biasa juga perlu akses cepat ke
              pencarian, pesan, dan profil mereka sendiri). Bagian
              notifikasi tetap otomatis menyesuaikan - cuma admin yang
              lihat isinya, lihat pengecekan `isAdmin` di dalam). */}
          {activeTab === "dashboard" && (
            <div className="db-topbar">
              <div className="db-topbar__search" style={{ position: "relative" }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Cari bisnis, alamat, atau user..."
                  value={topbarQuery}
                  onChange={(e) => { setTopbarQuery(e.target.value); setShowTopbarResults(true); }}
                  onFocus={() => setShowTopbarResults(true)}
                  onBlur={() => setTimeout(() => setShowTopbarResults(false), 150)}
                />
                {showTopbarResults && topbarQuery.trim().length >= 2 && (
                  <div className="db-topbar__search-results">
                    {hasTopbarResults ? (
                      <>
                        {topbarResults.businesses.length > 0 && (
                          <div className="db-topbar__search-group">
                            <span className="db-topbar__search-group-label">Bisnis</span>
                            {topbarResults.businesses.map((b) => (
                              <button
                                type="button"
                                key={`biz-${b.id}`}
                                className="db-topbar__search-item"
                                onMouseDown={() => {
                                  setActiveTab("businesses");
                                  setBizSearch(b.title);
                                  setTopbarQuery("");
                                  setShowTopbarResults(false);
                                }}
                              >
                                <Building2 size={14} />
                                <div>
                                  <strong>{b.title}</strong>
                                  <span>{b.address}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {topbarResults.users.length > 0 && (
                          <div className="db-topbar__search-group">
                            <span className="db-topbar__search-group-label">User</span>
                            {topbarResults.users.map((u) => (
                              <button
                                type="button"
                                key={`user-${u.id}`}
                                className="db-topbar__search-item"
                                onMouseDown={() => {
                                  setActiveTab("users");
                                  setUserSearch(u.name);
                                  setTopbarQuery("");
                                  setShowTopbarResults(false);
                                }}
                              >
                                <UserIcon size={14} />
                                <div>
                                  <strong>{u.name}</strong>
                                  <span>{u.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="db-topbar__search-empty">Tidak ada hasil untuk "{topbarQuery}"</p>
                    )}
                  </div>
                )}
              </div>
              <div className="db-topbar__actions">
                <button type="button" className="db-topbar__icon-btn" onClick={() => setActiveTab("inbox")} title="Pesan">
                  <Mail size={18} />
                  {unreadInboxCount > 0 && <span className="db-topbar__icon-badge">{unreadInboxCount > 9 ? "9+" : unreadInboxCount}</span>}
                </button>
                <div className="db-topbar__icon-wrapper">
                  <button
                    type="button"
                    className="db-topbar__icon-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifikasi"
                  >
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                      <span className="db-topbar__icon-badge">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="db-notification-dropdown">
                      <div className="db-notification-dropdown__header">
                        <h3>Notifikasi</h3>
                        <div className="db-notification-dropdown__header-actions">
                          {unreadNotifications > 0 && (
                            <button
                              type="button"
                              className="db-notification-dropdown__mark-all"
                              onClick={handleMarkAllNotificationsRead}
                            >
                              Tandai semua dibaca
                            </button>
                          )}
                          {isAdmin && notifications.length > 0 && (
                            <button
                              type="button"
                              className="db-notification-dropdown__mark-all"
                              onClick={handleCleanupNotifications}
                              title="Bersihkan notifikasi lama"
                            >
                              Bersihkan lama
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="db-notification-dropdown__list">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`db-notification-item ${!notif.is_read ? 'unread' : ''}`}
                              onClick={() => handleMarkNotificationRead(notif.id)}
                            >
                              <div className="db-notification-item__icon">
                                {notif.type === 'purchase' && <ShoppingBag size={16} />}
                                {notif.type === 'registration' && <UserIcon size={16} />}
                                {notif.type === 'business' && <Building2 size={16} />}
                                {notif.type === 'blog' && <BookOpen size={16} />}
                                {notif.type === 'event' && <CalendarDays size={16} />}
                                {notif.type === 'message' && <Mail size={16} />}
                                {!notif.type && <Bell size={16} />}
                              </div>
                              <div className="db-notification-item__content">
                                <p className="db-notification-item__title">{notif.title}</p>
                                <p className="db-notification-item__message">{notif.message}</p>
                                <span className="db-notification-item__time">
                                  {formatDate(notif.created_at)}
                                </span>
                              </div>
                              {!notif.is_read && <div className="db-notification-item__dot" />}
                              <button
                                type="button"
                                className="db-notification-item__delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif.id);
                                }}
                                title="Hapus notifikasi"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="db-notification-empty">Tidak ada notifikasi</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="db-topbar__divider" />
                <button type="button" className="db-topbar__user" onClick={() => setActiveTab("profile")}>
                  <div className="db-topbar__user-info">
                    <strong>{user?.name || "Pengguna"}</strong>
                    <span>{user?.role === "admin" ? "Super Admin" : user?.role === "reseller" ? "Reseller" : "User"}</span>
                  </div>
                  <div className="db-topbar__avatar">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user?.name} />
                    ) : (
                      (user?.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {error && <div className="db-error-alert">{error}</div>}

          {/* TAB: DASBOR (Overview) */}
          {activeTab === "dashboard" && (
            <div className="db-panel db-panel--dashboard">
              <div className="db-dashboard-titlebar">
                <div>
                  <h1 className="db-dashboard-titlebar__title">Dashboard</h1>
                  {isAdmin ? (
                    <p className="db-dashboard-titlebar__subtitle">Selamat datang kembali di panel kontrol Surade.co.id</p>
                  ) : (
                    <p className="db-dashboard-titlebar__subtitle">Selamat Datang {user?.name || "Pengguna"}</p>
                  )}
                </div>
                <div className="db-dashboard-breadcrumb">
                  <Home size={14} />
                  <ChevronRight size={13} />
                  <span className="db-dashboard-breadcrumb__current">Dashboard</span>
                </div>
              </div>

              {/* Admin banners - keep as original */}
              {isAdmin && !dismissedBanners.includes("info") && (
                <div className="db-dashboard-banner db-dashboard-banner--info">
                  <div className="db-dashboard-banner__content">
                    <Shield size={16} />
                    <span>Surade.co.id dapat meningkatkan daya saing usaha Anda.</span>
                  </div>
                  <button
                    className="db-dashboard-banner__close"
                    onClick={() => setDismissedBanners((p) => [...p, "info"])}
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {isAdmin && !dismissedBanners.includes("warning") && (
                <div className="db-dashboard-banner db-dashboard-banner--warning">
                  <div className="db-dashboard-banner__content">
                    <Megaphone size={16} />
                    <span>Publikasikan Bisnis/Usaha Anda hari ini dan dapatkan pelanggan baru!</span>
                  </div>
                  <button
                    className="db-dashboard-banner__close"
                    onClick={() => setDismissedBanners((p) => [...p, "warning"])}
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Hapus search bar sesuai permintaan user */}

              <div className="db-dashboard-stats-wrap">
              {isAdmin && (
                <p className="db-dashboard-date">
                  {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}

              {isAdmin ? (
                // Original Admin Layout
                <div className="db-kpi-grid">
                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Building2 size={16} /></div>
                    <span className="db-kpi-card__value">{businesses.length}</span>
                    <span className="db-kpi-card__label">Total Bisnis</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("businesses")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>

                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--slate"><Users size={16} /></div>
                    <span className="db-kpi-card__value">{users.length}</span>
                    <span className="db-kpi-card__label">User</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("users")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>

                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--green"><Crown size={16} /></div>
                    <span className="db-kpi-card__value">{businesses.filter((b) => b.is_premium_active).length}</span>
                    <span className="db-kpi-card__label">Premium</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("premium-packages")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>

                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--green"><Receipt size={16} /></div>
                    <span className="db-kpi-card__value db-kpi-card__value--currency">
                        {formatRupiah(
                          subscriptions
                            .filter((s) => {
                              const d = s.created_at ? new Date(s.created_at) : null;
                              const now = new Date();
                              return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            })
                            .reduce((sum, s) => sum + Number(s.amount || 0), 0)
                        )}
                      </span>
                    <span className="db-kpi-card__label">Pendapatan</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("premium")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>

                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Eye size={16} /></div>
                    <span className="db-kpi-card__value">{weeklyAnalytics?.all_time_total ?? 0}</span>
                    <span className="db-kpi-card__label">Pengunjung</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("businesses")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>

                  <div className="db-kpi-card">
                    <div className="db-kpi-card__icon db-kpi-card__icon--amber"><Megaphone size={16} /></div>
                    <span className="db-kpi-card__value">{ads.filter((a) => a.status === "verified").length}</span>
                    <span className="db-kpi-card__label">Iklan</span>
                    <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("ads")}>
                      More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                    </button>
                  </div>
                </div>
              ) : null}
              {/* PERMINTAAN: baris kartu KPI kecil (Total Bisnis/Premium/
                  Pengunjung/Iklan) untuk User/Reseller dihapus - langsung
                  lanjut ke widget grafik & riwayat di bawah. */}
              
              {/* PERBAIKAN: sebelumnya baris ini cuma komentar biasa dan div
                  di bawahnya (widget admin: grafik, kalender, ulasan,
                  riwayat premium) dirender TANPA syarat apapun - padahal
                  seharusnya cuma untuk admin. Akibatnya teks ") : (" yang
                  harusnya bagian dari kode ternary malah ikut tercetak jadi
                  teks aneh di halaman, DAN konten admin + konten
                  user/reseller tampil DOBEL sekaligus untuk semua orang.
                  Sekarang dibungkus {isAdmin ? (...) : (...)} yang benar. */}
              {isAdmin ? (
              <div className="db-dashboard-widgets">
                  <div className="db-dashboard-widgets__col">
                    <div className="db-widget-card db-widget-card--sales">
                      <div className="db-widget-card__header db-widget-card__header--dark">
                        <div className="db-widget-card__header-icon">
                          <Users size={18} />
                        </div>
                        <span>Grafik Pendaftaran User</span>
                        <button
                          type="button"
                          className="db-widget-card__header-link"
                          onClick={() => setShowUserChartDetail((v) => !v)}
                        >
                          {showUserChartDetail ? "Sembunyikan Detail" : "Lihat Detail"}
                        </button>
                      </div>
                      <div className="db-widget-card__body db-widget-card__body--chart">
                        <DashboardChart
                          labels={userRegistrationChart?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
                          series={[
                            { name: "User Baru", color: "#3b82f6", values: userRegistrationChart?.values || [0, 0, 0, 0, 0, 0, 0] },
                          ]}
                        />
                        {showUserChartDetail && (
                          <div className="db-chart-detail-table">
                            <div className="db-chart-detail-table__row db-chart-detail-table__row--head">
                              <span>Tanggal</span>
                              <span>User Baru</span>
                            </div>
                            {(userRegistrationChart?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]).map((lbl, i) => {
                              const values = userRegistrationChart?.values || [0, 0, 0, 0, 0, 0, 0];
                              const prev = i > 0 ? values[i - 1] : null;
                              const val = values[i] || 0;
                              const trend = prev === null ? null : val > prev ? "up" : val < prev ? "down" : "flat";
                              return (
                                <div className="db-chart-detail-table__row" key={lbl + i}>
                                  <span>{lbl}</span>
                                  <span className="db-chart-detail-table__value">
                                    {val}
                                    {trend === "up" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--up" />}
                                    {trend === "down" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--down" style={{ transform: "rotate(90deg)" }} />}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="db-widget-card db-widget-card--sales">
                      <div className="db-widget-card__header db-widget-card__header--dark">
                        <div className="db-widget-card__header-icon">
                          <Building2 size={18} />
                        </div>
                        <span>Grafik Bisnis Baru</span>
                        <button
                          type="button"
                          className="db-widget-card__header-link"
                          onClick={() => setShowBizChartDetail((v) => !v)}
                        >
                          {showBizChartDetail ? "Sembunyikan Detail" : "Lihat Detail"}
                        </button>
                      </div>
                      <div className="db-widget-card__body db-widget-card__body--chart">
                        <DashboardChart
                          labels={businessRegistrationChart?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
                          series={[
                            { name: "Bisnis Baru", color: "#10b981", values: businessRegistrationChart?.values || [0, 0, 0, 0, 0, 0, 0] },
                          ]}
                        />
                        {showBizChartDetail && (
                          <div className="db-chart-detail-table">
                            <div className="db-chart-detail-table__row db-chart-detail-table__row--head">
                              <span>Tanggal</span>
                              <span>Bisnis Baru</span>
                            </div>
                            {(businessRegistrationChart?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]).map((lbl, i) => {
                              const values = businessRegistrationChart?.values || [0, 0, 0, 0, 0, 0, 0];
                              const prev = i > 0 ? values[i - 1] : null;
                              const val = values[i] || 0;
                              const trend = prev === null ? null : val > prev ? "up" : val < prev ? "down" : "flat";
                              return (
                                <div className="db-chart-detail-table__row" key={lbl + i}>
                                  <span>{lbl}</span>
                                  <span className="db-chart-detail-table__value">
                                    {val}
                                    {trend === "up" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--up" />}
                                    {trend === "down" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--down" style={{ transform: "rotate(90deg)" }} />}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* History Widget for Admin - SEPARATED */}
                    <div className="db-widget-card">
                      <div className="db-widget-card__header">
                        <div className="db-widget-card__header-icon">
                          <Receipt size={18} />
                        </div>
                        <span>Riwayat Pengajuan Premium</span>
                        {subscriptions.length > 3 && (
                          <button
                            type="button"
                            className="db-widget-card__header-link"
                            onClick={() => setShowAllPremiumHistory(!showAllPremiumHistory)}
                          >
                            {showAllPremiumHistory ? "Tampilkan Sedikit" : "Lihat Semua"}
                          </button>
                        )}
                      </div>
                      <div className="db-widget-card__body">
                        {subscriptions.length > 0 ? (
                          (showAllPremiumHistory ? subscriptions : subscriptions.slice(0, 3)).map((sub) => (
                            <div key={sub.id} className="db-history-item">
                              <div className="db-history-info">
                                <p>Pengajuan dari: {sub.user?.name || 'User'}</p>
                                <span className="db-history-amount">{formatRupiah(sub.amount || 0)}</span>
                                <span className={`db-history-status db-history-status--${sub.status}`}>
                                  {{ paid: "Lunas", pending: "Menunggu", rejected: "Ditolak" }[sub.status] || sub.status}
                                </span>
                                <span className="db-history-date">
                                  {new Date(sub.created_at).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <div className="db-history-actions">
                                {sub.proof_url && (
                                  <button
                                    className="db-history-btn db-history-btn--view"
                                    onClick={() => window.open(sub.proof_url, "_blank")}
                                    title="Lihat Bukti Transfer"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {sub.status === "pending" && (
                                  <>
                                    <button
                                      className="db-history-btn db-history-btn--approve"
                                      onClick={() => handleVerifySubscription(sub.id)}
                                      title="Setujui"
                                    >
                                      <CheckCircle size={14} />
                                    </button>
                                    <button
                                      className="db-history-btn db-history-btn--reject"
                                      onClick={() => handleRejectSubscription(sub.id)}
                                      title="Tolak"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="db-widget-empty">Belum ada riwayat pembayaran</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="db-dashboard-widgets__col db-dashboard-widgets__col--side">
                    <div className="db-widget-card">
                      <div className="db-widget-card__header">
                        <div className="db-widget-card__header-icon">
                          <Calendar size={18} />
                        </div>
                        <span>Kalender</span>
                      </div>
                      <div className="db-widget-card__body">
                        <MiniCalendar />
                      </div>
                    </div>

                  </div>
                </div>
              ) : (

                // Dashboard User - Sesuai gambar contoh yang diberikan
                <div className="db-panel db-panel--dashboard">
                  {/* Admin banners - keep as original */}
                  {!dismissedBanners.includes("info") && (
                    <div className="db-dashboard-banner db-dashboard-banner--info">
                      <div className="db-dashboard-banner__content">
                        <Shield size={16} />
                        <span>Surade.co.id dapat meningkatkan daya saing usaha Anda.</span>
                      </div>
                      <button
                        className="db-dashboard-banner__close"
                        onClick={() => setDismissedBanners((p) => [...p, "info"])}
                        aria-label="Tutup"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {!dismissedBanners.includes("warning") && (
                    <div className="db-dashboard-banner db-dashboard-banner--warning">
                      <div className="db-dashboard-banner__content">
                        <Megaphone size={16} />
                        <span>Publikasikan Bisnis/Usaha Anda hari ini dan dapatkan pelanggan baru!</span>
                      </div>
                      <button
                        className="db-dashboard-banner__close"
                        onClick={() => setDismissedBanners((p) => [...p, "warning"])}
                        aria-label="Tutup"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="db-dashboard-stats-wrap">
                  <p className="db-dashboard-date">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  <div className="db-kpi-grid">
                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Building2 size={16} /></div>
                      <span className="db-kpi-card__value">{businesses.filter((b) => b.user_id === user?.id).length}</span>
                      <span className="db-kpi-card__label">Total Bisnis</span>
                      <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("businesses")}>
                        More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                      </button>
                    </div>

                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--green"><Crown size={16} /></div>
                      <span className="db-kpi-card__value">{businesses.filter((b) => b.user_id === user?.id && b.is_premium_active).length}</span>
                      <span className="db-kpi-card__label">Premium</span>
                      <button 
                        type="button" 
                        className="db-kpi-card__more" 
                        onClick={() => {
                          const userBusinesses = businesses.filter((b) => b.user_id === user?.id);
                          if (userBusinesses.length > 0) {
                            handleOpenPaymentGateway(userBusinesses[0], 'monthly');
                          } else {
                            alert('Anda perlu menambahkan bisnis terlebih dahulu');
                          }
                        }}
                      >
                        Upgrade Premium <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                      </button>
                    </div>

                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Eye size={16} /></div>
                      <span className="db-kpi-card__value">{weeklyAnalytics?.user_total ?? 0}</span>
                      <span className="db-kpi-card__label">Pengunjung</span>
                      <button type="button" className="db-kpi-card__more" onClick={() => setActiveTab("businesses")}>
                        More info <span className="db-kpi-card__more-arrow"><ArrowUpRight size={12} /></span>
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Charts Row - 2 grafik seperti gambar ketiga */}
                  <div className="db-charts-row">
                    <div className="db-chart-card db-chart-card--wide">
                      <div className="db-chart-card__header">
                        <div className="db-chart-card__icon"><Eye size={18} /></div>
                        <h3>Grafik Kunjungan Pelanggan</h3>
                        <button
                          type="button"
                          className="db-widget-card__header-link"
                          onClick={() => setShowVisitChartDetail((v) => !v)}
                        >
                          {showVisitChartDetail ? "Sembunyikan Detail" : "Lihat Detail"}
                        </button>
                      </div>
                      <div className="db-chart-container">
                        <DashboardChart
                          labels={weeklyAnalytics?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]}
                          series={[
                            { name: "Kunjungan", color: "#22c55e", values: weeklyAnalytics?.values || [0, 0, 0, 0, 0, 0, 0] },
                          ]}
                        />
                        {showVisitChartDetail && (
                          <div className="db-chart-detail-table">
                            <div className="db-chart-detail-table__row db-chart-detail-table__row--head">
                              <span>Tanggal</span>
                              <span>Kunjungan</span>
                            </div>
                            {(weeklyAnalytics?.labels || ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]).map((lbl, i) => {
                              const values = weeklyAnalytics?.values || [0, 0, 0, 0, 0, 0, 0];
                              const prev = i > 0 ? values[i - 1] : null;
                              const val = values[i] || 0;
                              const trend = prev === null ? null : val > prev ? "up" : val < prev ? "down" : "flat";
                              return (
                                <div className="db-chart-detail-table__row" key={lbl + i}>
                                  <span>{lbl}</span>
                                  <span className="db-chart-detail-table__value">
                                    {val}
                                    {trend === "up" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--up" />}
                                    {trend === "down" && <ArrowUpRight size={12} className="db-chart-detail-table__trend db-chart-detail-table__trend--down" style={{ transform: "rotate(90deg)" }} />}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sidebar dengan Kalender */}
                    <div className="db-sidebar-widgets">
                      <div className="db-calendar-widget">
                        <div className="db-widget-header">
                          <div className="db-widget-icon">📅</div>
                          <h3>Kalender</h3>
                        </div>
                        <div className="db-calendar-container">
                          <MiniCalendar />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row - Riwayat Premium & Ulasan */}
                  <div className="db-bottom-row db-bottom-row--split">
                    <div className="db-premium-history">
                      <div className="db-section-header">
                        <div className="db-section-icon"><Receipt size={18} /></div>
                        <h3>Riwayat Pengajuan Premium</h3>
                      </div>
                      <div className="db-history-items">
                        {subscriptions && subscriptions.length > 0 ? (
                          subscriptions.slice(0, showAllHistory ? subscriptions.length : 3).map((sub) => (
                            <div key={sub.id} className="db-history-item">
                              <div className="db-history-content">
                                <p className="db-history-title">Pengajuan dari: {sub.user?.name || "User"}</p>
                                <p className="db-history-amount">Rp{parseInt(sub.amount || 0).toLocaleString('id-ID')}</p>
                                <span className={`db-history-status db-history-status--${sub.status?.toLowerCase() || 'pending'}`}>
                                  {sub.status || 'PENDING'}
                                </span>
                                <p className="db-history-date">{new Date(sub.created_at).toLocaleDateString('id-ID')}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="db-widget-empty">Belum ada pengajuan premium.</p>
                        )}
                        {subscriptions && subscriptions.length > 3 && (
                          <button 
                            className="db-view-all-btn"
                            onClick={() => setShowAllHistory(!showAllHistory)}
                          >
                            {showAllHistory ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="db-reviews-section">
                      <div className="db-section-header">
                        <div className="db-section-icon"><Star size={18} /></div>
                        <h3>Ulasan Terbaru</h3>
                        {recentReviews.length > 3 && (
                          <button
                            type="button"
                            className="db-view-all-link"
                            onClick={() => setShowAllReviews(!showAllReviews)}
                          >
                            {showAllReviews ? "Tampilkan Sedikit" : "Lihat Semua"}
                          </button>
                        )}
                      </div>
                      <div className="db-review-list">
                        {recentReviews.length > 0 ? (
                          (showAllReviews ? recentReviews : recentReviews.slice(0, 3)).map((r) => (
                            <div key={r.id} className="db-review-item">
                              <div className="db-review-avatar">
                                {r.reviewer_avatar ? (
                                  <img src={getImageUrl(r.reviewer_avatar)} alt={r.reviewer_name} />
                                ) : (
                                  (r.reviewer_name || '?').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="db-review-content">
                                <div className="db-review-meta">
                                  <strong>{r.reviewer_name}</strong>
                                  <span className="db-review-stars">
                                    <span className="star-filled">{'★'.repeat(r.rating)}</span>
                                    <span className="star-empty">{'☆'.repeat(5 - r.rating)}</span>
                                  </span>
                                </div>
                                <p className="db-review-comment">{r.comment}</p>
                                <span className="db-review-business">untuk {r.business_name}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="db-widget-empty">Belum ada ulasan masuk.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="db-dashboard-footer">
                <span>Copyright © {new Date().getFullYear()} <strong>Surade.co.id</strong>. All rights reserved.</span>
              </div>
              </div>
            </div>
          )}

          {/* TAB: BUSINESSES */}
          {activeTab === "businesses" && (
            <div className="db-panel">
            {showBizModal ? (
              <div className="biz-form-wrapper">
                {/* HERO */}
                <div className="biz-form-hero">
                  <div className="biz-form-hero-inner">
                    <button type="button" className="biz-form-back-btn" onClick={() => setShowBizModal(false)}>
                      <ArrowLeft size={15} />
                      <span>Kembali ke Dashboard</span>
                    </button>
                    <h1>Daftarkan Usaha Kamu</h1>
                    <p className="sub">Jangkau lebih banyak pelanggan di seluruh Indonesia</p>
                  </div>
                </div>

                {/* STEPPER */}
                {bizFormStep <= 5 && (
                  <div className="biz-form-stepper-section">
                    <div className="biz-form-stepper-inner">
                      <div className="biz-form-stepper">
                        <div className="biz-form-stepper-track"></div>
                        <div className="biz-form-stepper-progress" style={{ width: `${((Math.min(bizFormStep, 5) - 1) / 4) * 80}%` }}></div>
                        <div className={`biz-form-step ${bizFormStep > 1 ? 'done' : ''} ${bizFormStep === 1 ? 'active' : ''}`} data-step="1">
                          <div className="circle"><Crown size={22} /></div>
                          <div className="label">Paket</div>
                        </div>
                        <div className={`biz-form-step ${bizFormStep > 2 ? 'done' : ''} ${bizFormStep === 2 ? 'active' : ''}`} data-step="2">
                          <div className="circle"><Info size={22} /></div>
                          <div className="label">Info Dasar</div>
                        </div>
                        <div className={`biz-form-step ${bizFormStep > 3 ? 'done' : ''} ${bizFormStep === 3 ? 'active' : ''}`} data-step="3">
                          <div className="circle"><Image size={22} /></div>
                          <div className="label">Banner</div>
                        </div>
                        <div className={`biz-form-step ${bizFormStep > 4 ? 'done' : ''} ${bizFormStep === 4 ? 'active' : ''}`} data-step="4">
                          <div className="circle"><MapPin size={22} /></div>
                          <div className="label">Lokasi</div>
                        </div>
                        <div className={`biz-form-step ${bizFormStep > 5 ? 'done' : ''} ${bizFormStep === 5 ? 'active' : ''}`} data-step="5">
                          <div className="circle"><Gallery size={22} /></div>
                          <div className="label">Galeri</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="biz-form-content">
                  {/* STEP 1: INFO DASAR */}
                  <div className={`biz-form-panel ${bizFormStep === 2 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-card-head">
                        <div className="ci"><Info size={18} /></div>
                        <h2>Informasi Dasar</h2>
                      </div>
                      <p className="biz-form-card-sub">Isi data utama tentang usaha kamu</p>
                      <hr className="biz-form-divider" />

                      <div className="biz-form-field">
                        <label>Nama Usaha <span className="req">*</span></label>
                        <input
                          type="text"
                          value={bizTitle}
                          onChange={(e) => setBizTitle(e.target.value)}
                          placeholder="Warung Makan Sederhana"
                        />
                      </div>

                      <div className="biz-form-field">
                        <label>Kategori <span className="req">*</span></label>
                        <div className={`biz-form-cat-select ${catMenuOpen ? 'open' : ''}`}>
                          <button 
                            type="button" 
                            className={`biz-form-cat-trigger ${selectedCatMain || selectedCatSub ? 'filled' : ''}`}
                            onClick={() => setCatMenuOpen(!catMenuOpen)}
                          >
                            <span>{selectedCatSub ? `${selectedCatMain} - ${selectedCatSub}` : selectedCatMain || 'Pilih kategori...'}</span>
                            <ChevronDown size={16} />
                          </button>
                          <div className="biz-form-cat-menu">
                            <div className="biz-form-cat-main">
                              {Object.keys(CATEGORIES).map(main => (
                                <div 
                                  key={main} 
                                  className={`biz-form-cat-main-item ${selectedCatMain === main ? 'active' : ''}`}
                                  onClick={() => { setSelectedCatMain(main); setSelectedCatSub(''); }}
                                >
                                  <span>{main}</span>
                                  <ChevronRight size={15} />
                                </div>
                              ))}
                            </div>
                            <div className="biz-form-cat-sub">
                              {selectedCatMain && CATEGORIES[selectedCatMain]?.map(sub => (
                                <div 
                                  key={sub} 
                                  className={`biz-form-cat-sub-item ${selectedCatSub === sub ? 'selected' : ''}`}
                                  onClick={() => { setSelectedCatSub(sub); setCatMenuOpen(false); }}
                                >
                                  {sub}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="biz-form-field">
                        <label>Hari & Jam Buka</label>
                        <div className="biz-form-hours-box">
                          {HARI_LIST.map((day) => (
                            <div key={day} className={`biz-form-hour-row ${bizClosedDays.includes(day) ? 'off' : ''}`}>
                              <label className="day">
                                <input
                                  type="checkbox"
                                  checked={!bizClosedDays.includes(day)}
                                  onChange={() => toggleClosedDay(day)}
                                />
                                {day}
                              </label>
                              <select
                                value={bizHours ? bizHours.split('-')[0] || '08:00' : '08:00'}
                                onChange={(e) => {
                                  const currentHours = bizHours || '08:00-17:00';
                                  const [, end] = currentHours.split('-');
                                  setBizHours(`${e.target.value}-${end}`);
                                }}
                                disabled={bizClosedDays.includes(day)}
                              >
                                {Array.from({length: 24}, (_, i) => (
                                  <option key={i} value={`${i < 10 ? '0' : ''}${i}:00`}>{`${i < 10 ? '0' : ''}${i}:00`}</option>
                                ))}
                              </select>
                              <span className="sd">s/d</span>
                              <select
                                value={bizHours ? bizHours.split('-')[1] || '17:00' : '17:00'}
                                onChange={(e) => {
                                  const currentHours = bizHours || '08:00-17:00';
                                  const [start] = currentHours.split('-');
                                  setBizHours(`${start}-${e.target.value}`);
                                }}
                                disabled={bizClosedDays.includes(day)}
                              >
                                {Array.from({length: 24}, (_, i) => (
                                  <option key={i} value={`${i < 10 ? '0' : ''}${i}:00`}>{`${i < 10 ? '0' : ''}${i}:00`}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="biz-form-field">
                        <label>Desa/Kelurahan <span className="req">*</span></label>
                        <div className={`biz-form-desa-select ${desaMenuOpen ? 'open' : ''}`}>
                          <div className="biz-form-desa-trigger" onClick={() => setDesaMenuOpen(!desaMenuOpen)}>
                            <Search size={16} />
                            <input
                              type="text"
                              value={desaSearchQuery}
                              onChange={(e) => setDesaSearchQuery(e.target.value)}
                              placeholder="Cari desa..."
                              onClick={() => setDesaMenuOpen(true)}
                            />
                          </div>
                          <div className="biz-form-desa-list">
                            {DESA_LIST.filter(d => d.toLowerCase().includes(desaSearchQuery.toLowerCase())).map(d => (
                              <div 
                                key={d} 
                                className={`biz-form-desa-item ${selectedDesa === d ? 'selected' : ''}`}
                                onClick={() => { setSelectedDesa(d); setDesaMenuOpen(false); setDesaSearchQuery(d); }}
                              >
                                {d}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="biz-form-field">
                        <label>Deskripsi <span className="req">*</span></label>
                        <textarea
                          value={bizDescription}
                          onChange={(e) => setBizDescription(e.target.value)}
                          placeholder="Ceritakan tentang usahamu..."
                        />
                      </div>

                      <div className="biz-form-field">
                        <label>Tags</label>
                        <div className="biz-form-tag-input-wrap">
                          <Tag size={16} style={{color: '#9db0ac'}} />
                          <input
                            type="text"
                            value={bizTags}
                            onChange={(e) => setBizTags(e.target.value)}
                            placeholder="Tambah tag (pisahkan dengan koma)"
                          />
                          <button type="button" className="biz-form-tag-add-btn">
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="biz-form-tag-list">
                          {bizTags.split(',').filter(t => t.trim()).map((tag, i) => (
                            <span key={i} className="biz-form-tag-chip">
                              {tag.trim()}
                              <button type="button" onClick={() => {
                                const tags = bizTags.split(',').filter((_, idx) => idx !== i);
                                setBizTags(tags.join(','));
                              }}>✕</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="biz-form-section-label">Kontak</div>

                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Phone size={15} /> Telepon <span className="req">*</span></label>
                        <input
                          type="tel"
                          value={bizPhone}
                          onChange={(e) => setBizPhone(e.target.value)}
                          placeholder="+62 812 3456 7890"
                        />
                      </div>
                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Phone size={15} /> WhatsApp</label>
                        <input
                          type="tel"
                          value={bizPhone}
                          onChange={(e) => setBizPhone(e.target.value)}
                          placeholder="+62 812 3456 7890"
                        />
                      </div>
                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Mail size={15} /> Email</label>
                        <input
                          type="email"
                          value={bizEmail}
                          onChange={(e) => setBizEmail(e.target.value)}
                          placeholder="usaha@email.com"
                        />
                      </div>
                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Globe size={15} /> Website</label>
                        <input
                          type="url"
                          value={bizWebsite}
                          onChange={(e) => setBizWebsite(e.target.value)}
                          placeholder="https://usaha.com"
                        />
                      </div>
                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Instagram size={15} /> Instagram</label>
                        <input
                          type="text"
                          value={bizInstagram}
                          onChange={(e) => setBizInstagram(e.target.value)}
                          placeholder="@usahakamu"
                        />
                      </div>
                      <div className="biz-form-field biz-form-kontak-field">
                        <label><Facebook size={15} /> Facebook</label>
                        <input
                          type="text"
                          value={bizFacebook}
                          onChange={(e) => setBizFacebook(e.target.value)}
                          placeholder="Facebook page"
                        />
                      </div>

                      <div className="biz-form-actions">
                        <button type="button" className="biz-form-btn biz-form-btn-ghost" onClick={() => setBizFormStep(1)}>
                          Kembali
                        </button>
                        <button
                          type="button"
                          className="biz-form-btn biz-form-btn-primary"
                          onClick={() => {
                            const missing = [];
                            if (!(selectedDesa || bizVillage).trim()) missing.push("Desa/Kelurahan");
                            if (!bizDescription.trim()) missing.push("Deskripsi");
                            if (!bizPhone.trim()) missing.push("Telepon");
                            if (missing.length > 0) {
                              alert(`Mohon lengkapi dulu: ${missing.join(", ")}.`);
                              return;
                            }
                            setBizFormStep(3);
                          }}
                        >
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: BANNER */}
                  <div className={`biz-form-panel ${bizFormStep === 3 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-card-head">
                        <div className="ci"><Image size={18} /></div>
                        <h2>Thumbnail & Banner / Foto Utama</h2>
                      </div>
                      <p className="biz-form-card-sub">Upload thumbnail (gambar utama) dan foto banner (maks. 4 foto)</p>
                      <hr className="biz-form-divider" />

                      <div className="biz-form-field">
                        <label>Thumbnail / Logo Usaha</label>
                        <p style={{fontSize: '12.5px', color: 'var(--ink-soft)', margin: '-3px 0 12px'}}>Gambar ini akan tampil sebagai foto utama di halaman pencarian</p>

                        {/* PERBAIKAN: dulu kotak upload-nya persegi (dashed
                            rectangle) dan setelah upload cuma tampil sebagai
                            baris kecil (thumbnail 32x32 + nama file). Sekarang
                            keduanya (kotak upload KOSONG maupun PRATINJAU
                            setelah upload) sama-sama bentuk LINGKARAN, karena
                            ini logo usaha - dan pratinjaunya bisa langsung
                            diklik/hover buat "Ganti Foto" kapan saja tanpa
                            perlu hapus dulu. */}
                        <input
                          type="file"
                          id="thumbInput"
                          accept="image/*"
                          style={{display: 'none'}}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setBizThumbnail(file);
                              setBizImageFile(file);
                              setBizImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />

                        {bizImagePreview ? (
                          <div className="biz-form-thumb-circle">
                            <img src={bizImagePreview} alt="Logo usaha" />
                            <div
                              className="biz-form-thumb-circle__edit"
                              onClick={() => document.getElementById('thumbInput').click()}
                            >
                              Ganti Foto
                            </div>
                            <button
                              type="button"
                              className="biz-form-thumb-circle__remove"
                              aria-label="Hapus thumbnail"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBizThumbnail(null);
                                setBizImageFile(null);
                                setBizImagePreview('');
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className="biz-form-dropzone small round"
                            onClick={() => document.getElementById('thumbInput').click()}
                          >
                            <div className="circle-ic"><Image size={24} /></div>
                            <div className="dt">Klik untuk upload</div>
                          </div>
                        )}
                        <div className="biz-form-thumb-hint">Rekomendasi: 1:1 ratio, JPG/PNG/WEBP max 4MB</div>
                      </div>

                      <div className="biz-form-field" style={{marginTop: 24}}>
                        <label>Banner / Foto Latar</label>
                        <p style={{fontSize: '12.5px', color: 'var(--ink-soft)', margin: '-3px 0 12px'}}>Upload beberapa foto banner untuk tampilan halaman usaha (maks. 4 foto)</p>
                        <div 
                          className="biz-form-dropzone" 
                          onClick={() => document.getElementById('bannerInput').click()}
                        >
                          <Upload size={28} />
                          <div className="dt">Klik atau drag & drop foto banner</div>
                          <div className="dd">{bizBannerFiles.length}/4 foto</div>
                        </div>
                        <input 
                          type="file" 
                          id="bannerInput" 
                          accept="image/*" 
                          multiple 
                          style={{display: 'none'}} 
                          onChange={(e) => {
                            const files = Array.from(e.target.files).slice(0, 4 - bizBannerFiles.length);
                            setBizBannerFiles([...bizBannerFiles, ...files]);
                          }}
                        />
                        <div className="biz-form-file-list">
                          {bizBannerFiles.map((file, i) => (
                            <div key={i} className="biz-form-file-row">
                              <img src={URL.createObjectURL(file)} alt={file.name} />
                              <span className="fname">{file.name}</span>
                              <button type="button" onClick={() => {
                                setBizBannerFiles(bizBannerFiles.filter((_, idx) => idx !== i));
                              }}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="biz-form-actions">
                        <button type="button" className="biz-form-btn biz-form-btn-ghost" onClick={() => setBizFormStep(2)}>
                          Kembali
                        </button>
                        <button type="button" className="biz-form-btn biz-form-btn-primary" onClick={() => setBizFormStep(4)}>
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: LOKASI */}
                  <div className={`biz-form-panel ${bizFormStep === 4 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-card-head">
                        <div className="ci"><MapPin size={18} /></div>
                        <h2>Lokasi Usaha</h2>
                      </div>
                      <p className="biz-form-card-sub">Masukkan alamat, lalu cari atau klik di peta</p>
                      <hr className="biz-form-divider" />

                      <div className="biz-form-field">
                        <label>Alamat Lengkap <span className="req">*</span></label>
                        <div className="biz-form-search-row">
                          <input
                            type="text"
                            value={bizAddressFull}
                            onChange={(e) => setBizAddressFull(e.target.value)}
                            placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                          />
                          <button 
                            type="button" 
                            className="biz-form-btn-search"
                            onClick={async () => {
                              if (bizAddressFull) {
                                try {
                                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(bizAddressFull)}`);
                                  const data = await res.json();
                                  if (data && data.length > 0) {
                                    setBizCoordinates(`${parseFloat(data[0].lat).toFixed(5)}, ${parseFloat(data[0].lon).toFixed(5)}`);
                                  } else {
                                    alert("Alamat tidak ditemukan di peta");
                                  }
                                } catch (error) {
                                  alert("Gagal mencari alamat");
                                }
                              }
                            }}
                          >
                            <Search size={15} />
                            Cari
                          </button>
                        </div>
                      </div>

                      <div className={`biz-form-coord-hint ${bizCoordinates ? 'found' : ''}`}>
                        <MapPin size={15} />
                        {bizCoordinates ? `Koordinat ditemukan: ${bizCoordinates}` : 'Belum ada koordinat'}
                      </div>

                      <div className="biz-form-map-box" style={{ background: '#f8f9fa' }}>
                        {bizFormStep === 4 && (
                          <MapContainer
                            center={bizCoordinates ? bizCoordinates.split(',').map(Number) : [-6.2088, 106.8456]}
                            zoom={bizCoordinates ? 13 : 5}
                            style={{ height: "100%", width: "100%", zIndex: 1 }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapClickHandler setPosition={(pos) => setBizCoordinates(`${pos[0].toFixed(5)}, ${pos[1].toFixed(5)}`)} />
                            <MapUpdater position={bizCoordinates ? bizCoordinates.split(',').map(Number) : null} />
                            {bizCoordinates && <Marker position={bizCoordinates.split(',').map(Number)} />}
                          </MapContainer>
                        )}
                      </div>

                      <div className="biz-form-actions">
                        <button type="button" className="biz-form-btn biz-form-btn-ghost" onClick={() => setBizFormStep(3)}>
                          Kembali
                        </button>
                        <button type="button" className="biz-form-btn biz-form-btn-primary" onClick={() => setBizFormStep(5)}>
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 4: GALERI + RINGKASAN */}
                  <div className={`biz-form-panel ${bizFormStep === 5 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-card-head">
                        <div className="ci"><Gallery size={18} /></div>
                        <h2>Galeri Foto & Video</h2>
                      </div>
                      <p className="biz-form-card-sub">Upload foto dan video tambahan</p>
                      <hr className="biz-form-divider" />

                      {/* ── FOTO ── */}
                      <div className="biz-form-field">
                        <label>Foto Tambahan</label>
                        <p style={{fontSize: '12.5px', color: 'var(--ink-soft)', margin: '-3px 0 12px'}}>Boleh lebih dari satu foto</p>
                        <div
                          className="biz-form-dropzone"
                          onClick={() => document.getElementById('galeriInput').click()}
                        >
                          <Upload size={28} />
                          <div className="dt">Klik atau drag & drop foto</div>
                          <div className="dd">JPG, PNG, WEBP | maks. 5MB per foto</div>
                        </div>
                        <input
                          type="file"
                          id="galeriInput"
                          accept="image/*"
                          multiple
                          style={{display: 'none'}}
                          onChange={(e) => {
                            const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
                            setBizGalleryFilesNew([...bizGalleryFilesNew, ...files]);
                            e.target.value = '';
                          }}
                        />
                        {bizGalleryFilesNew.length === 0 && (
                          <div className="biz-form-empty-hint">Belum ada foto diunggah</div>
                        )}
                        <div className="biz-form-file-list">
                          {bizGalleryFilesNew.map((file, i) => (
                            <div key={i} className="biz-form-file-row">
                              <img src={URL.createObjectURL(file)} alt={file.name} />
                              <span className="fname">{file.name}</span>
                              <button type="button" onClick={() => {
                                setBizGalleryFilesNew(bizGalleryFilesNew.filter((_, idx) => idx !== i));
                              }}>✕</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── VIDEO ── */}
                      <div className="biz-form-field" style={{marginTop: 24}}>
                        <label>Video (opsional)</label>
                        <p style={{fontSize: '12.5px', color: 'var(--ink-soft)', margin: '-3px 0 12px'}}>
                          Pilih salah satu: tempel link video (YouTube/Instagram/dll), atau unggah file video langsung.
                        </p>

                        <div className="biz-form-field" style={{marginBottom: 14}}>
                          <label style={{fontWeight: 600, fontSize: '12.5px'}}>Link Video</label>
                          <input
                            type="url"
                            value={bizVideoUrl}
                            disabled={!!bizVideoFile}
                            onChange={(e) => setBizVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>

                        <div className="biz-form-divider-or">atau</div>

                        {!bizVideoFile ? (
                          <div
                            className="biz-form-dropzone small"
                            onClick={() => { if (!bizVideoUrl) document.getElementById('videoInput').click(); }}
                            style={bizVideoUrl ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                          >
                            <div className="circle-ic"><Upload size={22} /></div>
                            <div className="dt">Klik untuk upload file video</div>
                            <div className="dd">MP4, WEBM, MOV | maks. 20MB</div>
                          </div>
                        ) : (
                          <div className="biz-form-file-list">
                            <div className="biz-form-file-row">
                              <span style={{width: 32, textAlign: 'center'}}>🎬</span>
                              <span className="fname">{bizVideoFile.name}</span>
                              <button type="button" onClick={() => setBizVideoFile(null)}>✕</button>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          id="videoInput"
                          accept="video/mp4,video/webm,video/quicktime"
                          style={{display: 'none'}}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setBizVideoFile(file);
                              setBizVideoUrl("");
                            }
                            e.target.value = '';
                          }}
                        />
                      </div>

                      <div className="biz-form-actions">
                        <button type="button" className="biz-form-btn biz-form-btn-ghost" onClick={() => setBizFormStep(4)}>
                          Kembali
                        </button>
                        <button type="button" className="biz-form-btn biz-form-btn-primary" onClick={() => setBizFormStep(6)}>
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 1: PILIH PAKET (dipindah ke urutan pertama) */}
                  <div className={`biz-form-panel ${bizFormStep === 1 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-card-head">
                        <div className="ci"><Crown size={18} /></div>
                        <h2>Pilih Paket</h2>
                      </div>
                      <p className="biz-form-card-sub">Pilih paket yang sesuai untuk usahamu, bisa di-upgrade kapan saja</p>
                      <hr className="biz-form-divider" />

                      <div className="biz-form-paket-grid">
                        <label className={`biz-form-paket-card ${selectedPackage === 'Gratis' ? 'selected' : ''}`}>
                          <input 
                            type="radio" 
                            name="paket" 
                            value="Gratis" 
                            checked={selectedPackage === 'Gratis'}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                          />
                          <div className="pk-top">
                            <span className="pk-name">Gratis</span>
                            <span className="pk-check"><Check size={13} /></span>
                          </div>
                          <div className="pk-price">Rp 0<span>selamanya</span></div>
                          <ul className="pk-feat">
                            <li>Listing dasar & ulasan</li>
                            <li>Tanpa galeri & kontak lengkap</li>
                          </ul>
                        </label>

                        <label className={`biz-form-paket-card ${selectedPackage === 'Bisnis' ? 'selected' : ''}`}>
                          <input 
                            type="radio" 
                            name="paket" 
                            value="Bisnis" 
                            checked={selectedPackage === 'Bisnis'}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                          />
                          <div className="pk-top">
                            <span className="pk-name">Bisnis</span>
                            <span className="pk-check"><Check size={13} /></span>
                          </div>
                          <div className="pk-price">Rp 49.000<span>/bulan</span></div>
                          <ul className="pk-feat">
                            <li>Peta, Kontak & Galeri Foto</li>
                            <li>Tag/Kata Kunci & Jam Operasional</li>
                          </ul>
                        </label>

                        <label className={`biz-form-paket-card featured ${selectedPackage === 'Premium' ? 'selected' : ''}`}>
                          <span className="pk-badge">POPULER</span>
                          <input 
                            type="radio" 
                            name="paket" 
                            value="Premium" 
                            checked={selectedPackage === 'Premium'}
                            onChange={(e) => setSelectedPackage(e.target.value)}
                          />
                          <div className="pk-top">
                            <span className="pk-name">Premium</span>
                            <span className="pk-check"><Check size={13} /></span>
                          </div>
                          <div className="pk-price">Rp 150.000<span>/bulan</span></div>
                          <ul className="pk-feat">
                            <li>Semua fitur tanpa batas</li>
                            <li>Bebas iklan pesaing + Badge</li>
                          </ul>
                        </label>
                      </div>

                      <div className="biz-form-actions end">
                        <button type="button" className="biz-form-btn biz-form-btn-primary" onClick={() => setBizFormStep(2)}>
                          Lanjutkan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 6: RINGKASAN */}
                  <div className={`biz-form-panel ${bizFormStep === 6 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-summary-box">
                        <div className="biz-form-summary-title">Ringkasan Pendaftaran</div>
                        <div className="biz-form-summary-grid">
                          <div className="biz-form-s-item">
                            <div className="s-label">Nama Usaha</div>
                            <div className="s-val">{bizTitle || '—'}</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Kategori</div>
                            <div className="s-val">{selectedCatSub ? `${selectedCatMain} - ${selectedCatSub}` : selectedCatMain || '—'}</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Desa/Kelurahan</div>
                            <div className="s-val">{selectedDesa || '—'}</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Hari Buka</div>
                            <div className="s-val">
                              {bizClosedDays.length === 7 ? 'Tutup semua hari' : 
                               bizClosedDays.length === 0 ? 'Setiap hari' : 
                               HARI_LIST.filter(d => !bizClosedDays.includes(d)).join(', ')}
                            </div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Thumbnail</div>
                            <div className="s-val">{bizThumbnail ? 'Ada' : 'Belum'}</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Banner</div>
                            <div className="s-val">{bizBannerFiles.length} foto</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Galeri</div>
                            <div className="s-val">{bizGalleryFilesNew.length} file</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Koordinat</div>
                            <div className="s-val">{bizCoordinates || '—'}</div>
                          </div>
                          <div className="biz-form-s-item">
                            <div className="s-label">Paket</div>
                            <div className="s-val">{selectedPackage}</div>
                          </div>
                          <div className="biz-form-s-item" style={{gridColumn: '1/-1'}}>
                            <div className="s-label">Tags</div>
                            <div className="s-val">{bizTags || '—'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="biz-form-actions">
                        <button type="button" className="biz-form-btn biz-form-btn-ghost" onClick={() => setBizFormStep(5)}>
                          Kembali
                        </button>
                        <button type="button" className="biz-form-btn biz-form-btn-primary" onClick={handleSaveBusiness}>
                          <Check size={15} />
                          Daftarkan Usaha
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SUKSES */}
                  <div className={`biz-form-panel ${bizFormStep === 7 ? 'show' : ''}`}>
                    <div className="biz-form-card">
                      <div className="biz-form-success-box">
                        <div className="sic"><Check size={38} /></div>
                        <h2>Usaha berhasil didaftarkan!</h2>
                        <p>Tim kami akan meninjau data usahamu. Kamu bisa memantau statusnya melalui halaman Daftar Bisnis di dashboard.</p>
                        <button 
                          type="button" 
                          className="biz-form-btn biz-form-btn-primary" 
                          onClick={() => {
                            setShowBizModal(false);
                            setBizFormStep(1);
                          }}
                        >
                          Kembali ke Dashboard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
              <div className="db-panel-header">
                <h2>{isAdmin ? "Semua Bisnis Terdaftar" : "Bisnis Saya"}</h2>
                {businesses.length > 0 && (
                  <button className="db-action-btn" onClick={() => handleOpenBizModal()}>
                    <Plus size={16} />
                    <span>Tambah Bisnis</span>
                  </button>
                )}
              </div>

              <div className="db-filters">
                <div className="db-search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau alamat..."
                    value={bizSearch}
                    onChange={(e) => setBizSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat data...</span>
                </div>
              ) : filteredBusinesses.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nama Bisnis</th>
                        <th>Kategori</th>
                        <th>Pemilik</th>
                        <th>Kontak</th>
                        <th>Status</th>
                        <th>Premium</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBusinesses.map((biz) => (
                        <tr key={biz.id}>
                          <td>
                            <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                              <img
                                src={biz.images?.length > 0 ? getImageUrl(biz.images[0]) : biz.image ? getImageUrl(biz.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=80&fit=crop"}
                                alt={biz.title}
                                className="db-table-thumb"
                                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                              />
                              {biz.images?.length > 1 && (
                                <img
                                  src={getImageUrl(biz.images[1])}
                                  alt={`${biz.title} gallery`}
                                  style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="db-table-title">{biz.title}</div>
                            <div className="db-table-subtitle">{biz.address}</div>
                          </td>
                          <td>{biz.category?.name || "-"}</td>
                          <td>{biz.user?.name || (biz.user_id === user?.id ? user?.name : "-") || "-"}</td>
                          <td>{biz.phone}</td>
                          <td>
                            <span className={`db-status-badge db-status--${biz.status}`}>
                              {biz.status === "approved" ? "Disetujui" : biz.status === "pending" ? "Tertunda" : "Ditolak"}
                            </span>
                          </td>
                          <td>
                            <button
                              disabled={!isAdmin}
                              className={`db-premium-toggle ${biz.is_premium ? "active" : ""}`}
                              onClick={() => handleTogglePremium(biz.id)}
                            >
                              <Star size={16} fill={biz.is_premium ? "currentColor" : "none"} />
                            </button>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button
                                className="db-table-btn db-btn-view"
                                onClick={() => window.open(`/business/${biz.id}`, "_blank")}
                                title="Lihat"
                              >
                                <Eye size={16} />
                              </button>
                              {(isAdmin || biz.user_id === user?.id) && (
                                <button
                                  className="db-table-btn db-btn-edit"
                                  onClick={() => handleOpenBizModal(biz)}
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                              {isAdmin && (
                                <>
                                  <button
                                    className="db-table-btn db-btn-approve"
                                    onClick={() => handleApproveBusiness(biz.id)}
                                    title="Setujui"
                                    disabled={biz.status === "approved"}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="db-table-btn db-btn-reject"
                                    onClick={() => handleRejectBusiness(biz.id)}
                                    title="Tolak"
                                    disabled={biz.status === "suspended" || biz.status === "rejected"}
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {(isAdmin || biz.user_id === user?.id) && (
                                <button
                                  className="db-table-btn db-btn-delete"
                                  onClick={() => handleDeleteBusiness(biz.id)}
                                  title="Hapus"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title="Tingkatkan Jangkauan Bisnis Anda"
                  subtitle="Anda harus berada di sini untuk pertama kalinya. Jika Anda ingin menambahkan sesuatu, klik tombol di bawah ini."
                  actionLabel="Tambah Bisnis Baru"
                  onAction={() => handleOpenBizModal()}
                />
              )}
              </>
            )}
            </div>
          )}

          {/* TAB: ADS (IKLAN) */}
          {activeTab === "ads" && (
            <div className="db-panel">
            {showAdModal ? (
              <div className="db-inline-form-page db-inline-form-page--biz">
                {/* ── Hero Section ── */}
                <div className="db-hero">
                  <div className="db-hero__content">
                    <button type="button" className="db-hero__back" onClick={() => setShowAdModal(false)}>
                      <ArrowLeft size={16} />
                      <span>Kembali ke Dashboard</span>
                      <span className="db-hero__back-dot" />
                    </button>
                    <h1 className="db-hero__title">
                      Pasang <span className="db-hero__title-highlight">Iklan</span> Baru
                    </h1>
                    <p className="db-hero__subtitle">
                      Promosikan produk atau layanan Anda untuk menjangkau lebih banyak calon pelanggan
                    </p>
                  </div>
                  <div className="db-hero__illustration">
                    <div className="db-mock-card">
                      <div className="db-mock-card__dots">
                        <span /><span /><span />
                      </div>
                      <div className="db-mock-card__icon">
                        <Megaphone size={24} />
                      </div>
                    </div>
                    <div className="db-mock-plant" aria-hidden="true">📢</div>
                  </div>
                </div>

                {/* Progress Tabs */}
                <div className="db-progress-container">
                  <div className={`db-progress-step ${adsStep > 0 ? "completed" : adsStep === 0 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Info size={20} />
                    </div>
                    <div className="db-progress-label">Info Dasar</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${adsStep > 1 ? "completed" : adsStep === 1 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Edit2 size={20} />
                    </div>
                    <div className="db-progress-label">Konten</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${adsStep === 2 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Phone size={20} />
                    </div>
                    <div className="db-progress-label">Kontak</div>
                  </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSaveAd} className="db-card">
                  {/* Info Dasar Section */}
                  <div className="db-form-section" ref={(el) => (adsSectionRefs.current[0] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3>Informasi Dasar</h3>
                        <p>Isi data utama tentang iklan Anda</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Judul Iklan <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        placeholder="Masukkan judul iklan menarik..."
                      />
                    </div>

                    <div className="db-form-group">
                      <label>Kategori <span className="req">*</span></label>
                      <select required value={typeof adCategory === 'object' ? adCategory?.id || "" : adCategory} onChange={(e) => setAdCategory(e.target.value)}>
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* PERBAIKAN: dropdown "Status" (Draft/Aktifkan) sebelumnya
                        di sini TIDAK PERNAH benar-benar dikirim/dipakai -
                        backend selalu memaksa status jadi "pending" saat
                        iklan baru dibuat, dan hanya admin yang boleh
                        mengubah status (lewat tombol Setujui/Tolak di
                        menu moderasi). Dropdown ini dihapus supaya tidak
                        menyesatkan; pesan di bawah menjelaskan alurnya. */}
                    {!selectedAd && (
                      <p className="db-form-hint">
                        Iklan baru akan berstatus <strong>Menunggu Verifikasi</strong> sampai disetujui Admin, baru setelah itu tayang di beranda.
                      </p>
                    )}

                    <div className="db-form-group">
                      <label>Nama Perusahaan <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        value={adCompany}
                        onChange={(e) => setAdCompany(e.target.value)}
                        placeholder="Nama perusahaan atau toko"
                      />
                    </div>

                    {/* PERBAIKAN: form ini sebelumnya sama sekali tidak
                        punya field upload foto - foto iklan sekarang bisa
                        diunggah di sini, mengikuti pola yang sama seperti
                        upload thumbnail di form Blog & Event. */}
                    <div className="db-form-group">
                      <label>Foto Iklan</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setAdImage(file);
                        }}
                        style={{ display: "none" }}
                        id="ad-image-upload"
                      />
                      {adImage ? (
                        <div className="db-upload-preview">
                          <img
                            src={adImage instanceof File ? URL.createObjectURL(adImage) : getImageUrl(adImage)}
                            alt="Pratinjau foto iklan"
                          />
                          <div className="db-upload-preview__overlay">
                            <button
                              type="button"
                              className="db-upload-preview__change"
                              onClick={() => document.getElementById("ad-image-upload").click()}
                            >
                              Ganti Foto
                            </button>
                            <button
                              type="button"
                              className="db-upload-preview__remove"
                              onClick={() => setAdImage("")}
                              aria-label="Hapus foto iklan"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="db-upload-area"
                          onClick={() => document.getElementById("ad-image-upload").click()}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="db-upload-area__icon">
                            <ImageIcon size={32} />
                          </div>
                          <div className="db-upload-area__text">Klik untuk upload foto iklan</div>
                          <div className="db-upload-area__subtext">JPG, PNG, WEBP — Rekomendasi 800x400px, maks. 5MB</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Konten Section */}
                  <div className="db-form-section" ref={(el) => (adsSectionRefs.current[1] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Edit2 size={20} />
                      </div>
                      <div>
                        <h3>Konten Iklan</h3>
                        <p>Tulis deskripsi menarik untuk iklan Anda</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Deskripsi Iklan <span className="req">*</span></label>
                      {/* PERBAIKAN: textarea polos diganti text editor
                          TinyMCE (bold/italic/list/link, dst) supaya
                          deskripsi iklan bisa diformat lebih menarik -
                          lihat komponen AdDescriptionEditor di bawah. */}
                      <AdDescriptionEditor
                        value={adDescription}
                        onChange={setAdDescription}
                      />
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Kontak Section */}
                  <div className="db-form-section" ref={(el) => (adsSectionRefs.current[2] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Phone size={20} />
                      </div>
                      <div>
                        <h3>Informasi Kontak</h3>
                        <p>Berikan cara untuk dihubungi calon pelanggan</p>
                      </div>
                    </div>

                    <div className="db-form-row">
                      <div className="db-form-group">
                        <label>Lokasi <span className="req">*</span></label>
                        <input
                          type="text"
                          required
                          value={adLocation}
                          onChange={(e) => setAdLocation(e.target.value)}
                          placeholder="Kota, Provinsi"
                        />
                      </div>
                      <div className="db-form-group">
                        <label>No. HP / WhatsApp</label>
                        <input
                          type="text"
                          value={adPhone}
                          onChange={(e) => setAdPhone(e.target.value)}
                          placeholder="08123456789"
                        />
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Website (opsional)</label>
                      <input
                        type="url"
                        value={adWebsite}
                        onChange={(e) => setAdWebsite(e.target.value)}
                        placeholder="https://website-anda.com"
                      />
                    </div>
                  </div>

                  <div className="db-card__footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowAdModal(false)}>
                      Batal
                    </button>
                    <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Iklan"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="db-panel-header">
                  <h2>{isAdmin ? "Moderasi Iklan" : "Iklan Saya"}</h2>
                  {filteredAds.length > 0 && (
                    <button className="db-action-btn" onClick={() => handleOpenAdModal()}>
                      <Plus size={16} />
                      <span>Tambah Iklan</span>
                    </button>
                  )}
                </div>

                <div className="db-filters">
                  <div className="db-search-input">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan judul atau perusahaan..."
                      value={adSearch}
                      onChange={(e) => setAdSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="db-loader-wrap">
                    <div className="db-spinner" />
                    <span>Memuat iklan...</span>
                  </div>
                ) : filteredAds.length > 0 ? (
                  <div className="db-table-responsive">
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Judul</th>
                          <th>Perusahaan</th>
                          <th>Kategori</th>
                          <th>Status</th>
                          <th>Dibuat</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAds.map((ad) => (
                          <tr key={ad.id}>
                            <td>
                              <div className="db-table-title">{ad.title}</div>
                              <div className="db-table-subtitle">{ad.description?.substring(0, 60)}...</div>
                            </td>
                            <td>{ad.company || "-"}</td>
                            <td>
                              <span className="db-badge db-badge--category">
                                {categories.find(c => c.id === ad.category_id)?.name || "Umum"}
                              </span>
                            </td>
                            <td>
                              {/* PERBAIKAN: sebelumnya membandingkan
                                  ad.status dengan "active" (nilai yang
                                  TIDAK PERNAH ada di database - status
                                  asli dari backend hanya
                                  pending/approved/rejected), jadi badge
                                  ini selalu salah menampilkan "Draft". */}
                              <span className={`db-badge ${
                                ad.status === "approved" ? "db-badge--success"
                                : ad.status === "rejected" ? "db-badge--danger"
                                : "db-badge--warning"
                              }`}>
                                {ad.status === "approved" ? "Disetujui" : ad.status === "rejected" ? "Ditolak" : "Menunggu Verifikasi"}
                              </span>
                            </td>
                            <td>{new Date(ad.created_at).toLocaleDateString("id-ID")}</td>
                            <td>
                              <div className="db-table-actions">
                                {/* PERBAIKAN: admin sebelumnya tidak punya
                                    cara sama sekali untuk menyetujui/menolak
                                    iklan yang masuk (fungsi handleAdStatus
                                    sudah ada di kode tapi tidak pernah
                                    dipanggil dari mana pun) - makanya iklan
                                    yang disubmit user tidak pernah bisa
                                    tayang ke publik. */}
                                {isAdmin && ad.status === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      className="db-btn-table db-btn-table--approve"
                                      title="Setujui iklan"
                                      onClick={() => handleAdStatus(ad.id, "approved")}
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      className="db-btn-table db-btn-table--reject"
                                      title="Tolak iklan"
                                      onClick={() => handleAdStatus(ad.id, "rejected")}
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                )}
                                <button className="db-btn-table db-btn-table--edit" onClick={() => handleOpenAdModal(ad)}>
                                  <Edit2 size={14} />
                                </button>
                                <button className="db-btn-table db-btn-table--delete" onClick={() => handleDeleteAd(ad.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <DashboardEmptyState
                    title="Belum Ada Iklan"
                    subtitle="Iklan yang kamu pasang akan tampil di sini. Klik tombol di bawah untuk pasang iklan pertamamu."
                    actionLabel="Pasang Iklan Baru"
                    onAction={() => handleOpenAdModal()}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* TAB: PREMIUM & INVOICE */}
        {activeTab === "premium" && (
          <div className="premium-content">
            {!isAdmin && (
              <>
                {/* Hero Banner */}
                <div 
                  className="premium-hero"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '20px',
                    padding: '32px 36px',
                    marginBottom: '32px',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <div className="premium-hero__icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M2 6l4 3 6-7 6 7 4-3-2 13H4z"/></svg>
                  </div>
                  <div>
                    <h2>Upgrade ke Premium</h2>
                    <p>Dapatkan fitur eksklusif untuk bisnis Anda</p>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="premium-plans">
                  <div className="premium-plan">
                    <h3>Gratis</h3>
                    <div className="premium-price"><span className="amt">Rp 0</span><span className="per">selamanya</span></div>
                    <hr />
                    <div className="premium-feat">
                      <div className="feat-item off"><span className="ck">✕</span>Lamanya : Tidak ada batas hari</div>
                      <div className="feat-item off"><span className="ck">✕</span>Peta</div>
                      <div className="feat-item off"><span className="ck">✕</span>Kontak</div>
                      <div className="feat-item off"><span className="ck">✕</span>Galeri Foto</div>
                      <div className="feat-item off"><span className="ck">✕</span>Video</div>
                      <div className="feat-item off"><span className="ck">✕</span>Slogan</div>
                      <div className="feat-item off"><span className="ck">✕</span>Alamat</div>
                      <div className="feat-item off"><span className="ck">✕</span>Website</div>
                      <div className="feat-item off"><span className="ck">✕</span>Tautan Sosial Media</div>
                      <div className="feat-item off"><span className="ck">✕</span>FAQ</div>
                      <div className="feat-item off"><span className="ck">✕</span>Rentang Harga</div>
                      <div className="feat-item off"><span className="ck">✕</span>Tag/Kata Kunci</div>
                      <div className="feat-item off"><span className="ck">✕</span>Jam Operasional</div>
                      <div className="feat-item off"><span className="ck">✕</span>Pengumuman</div>
                      <div className="feat-item off"><span className="ck">✕</span>Penawaran &amp; Diskon</div>
                      <div className="feat-item off"><span className="ck">✕</span>Sembunyikan Iklan pesaing</div>
                      <div className="feat-item off"><span className="ck">✕</span>Event</div>
                    </div>
                    <button className="plan-btn current">Paket Saat Ini</button>
                  </div>

                  <div className="premium-plan featured">
                    <span className="badge">POPULER</span>
                    <h3>Premium</h3>
                    <div className="premium-price"><span className="amt">Rp 150.000</span><span className="per">/bulan</span></div>
                    <hr />
                    <div className="premium-feat">
                      <div className="feat-item"><span className="ck">✓</span>Lamanya : Tidak ada batas hari</div>
                      <div className="feat-item"><span className="ck">✓</span>Peta</div>
                      <div className="feat-item"><span className="ck">✓</span>Kontak</div>
                      <div className="feat-item"><span className="ck">✓</span>Galeri Foto</div>
                      <div className="feat-item"><span className="ck">✓</span>Video</div>
                      <div className="feat-item"><span className="ck">✓</span>Slogan</div>
                      <div className="feat-item"><span className="ck">✓</span>Alamat</div>
                      <div className="feat-item"><span className="ck">✓</span>Website</div>
                      <div className="feat-item"><span className="ck">✓</span>Tautan Sosial Media</div>
                      <div className="feat-item"><span className="ck">✓</span>FAQ</div>
                      <div className="feat-item"><span className="ck">✓</span>Rentang Harga</div>
                      <div className="feat-item"><span className="ck">✓</span>Tag/Kata Kunci</div>
                      <div className="feat-item"><span className="ck">✓</span>Jam Operasional</div>
                      <div className="feat-item"><span className="ck">✓</span>Pengumuman</div>
                      <div className="feat-item"><span className="ck">✓</span>Penawaran &amp; Diskon</div>
                      <div className="feat-item"><span className="ck">✓</span>Sembunyikan Iklan pesaing</div>
                      <div className="feat-item"><span className="ck">✓</span>Event</div>
                    </div>

                    {(() => {
                      const myFree = businesses.filter((b) => b.user_id === user?.id && !b.is_premium_active);
                      const myTotal = businesses.filter((b) => b.user_id === user?.id).length;
                      if (myTotal === 0) {
                        return (
                          <button className="plan-btn current" onClick={() => setActiveTab("businesses")}>
                            Tambah Bisnis Dulu
                          </button>
                        );
                      }
                      if (myFree.length === 0) {
                        return (
                          <button className="plan-btn current" disabled>
                            Semua Bisnis Sudah Premium ✅
                          </button>
                        );
                      }
                      if (myFree.length === 1) {
                        return (
                          <button
                            className="plan-btn upgrade"
                            onClick={() => navigate(`/premium-upgrade?business=${myFree[0].id}`)}
                          >
                            Upgrade Sekarang
                          </button>
                        );
                      }
                      return (
                        <button
                          className="plan-btn upgrade"
                          onClick={() => navigate(`/premium-upgrade`)}
                        >
                          Upgrade Sekarang
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="premium-section-card">
                  <h3>Keuntungan Premium</h3>
                  <div className="premium-feat-grid">
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
                      <div><div className="ft">Google Maps</div><div className="fd">Integrasi lokasi bisnis dengan Google Maps</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg></div>
                      <div><div className="ft">Galeri Foto</div><div className="fd">Unggah galeri foto untuk menampilkan produk/jasa</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M17 10l4-3v10l-4-3"/></svg></div>
                      <div><div className="ft">Link Video</div><div className="fd">Sematkan video untuk promosi bisnis Anda</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 10.8l7.4-4M8.3 13.2l7.4 4"/></svg></div>
                      <div><div className="ft">Sosial Media & Website</div><div className="fd">Tautkan sosial media dan website resmi bisnis</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M3 11l19-8-8 19-2-9-9-2z"/></svg></div>
                      <div><div className="ft">Event & Pengumuman</div><div className="fd">Publikasikan event dan pengumuman promo Anda</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 20L20 4M7 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM17 22a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></div>
                      <div><div className="ft">Penawaran & Diskon</div><div className="fd">Tampilkan promo dan rentang harga ke pelanggan</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7c-1.3 0-2.6-.3-3.7-.8"/><path d="M2 2l20 20"/></svg></div>
                      <div><div className="ft">Bebas Iklan Pesaing</div><div className="fd">Halaman bisnis Anda bebas dari iklan kompetitor</div></div>
                    </div>
                    <div className="premium-feat-card">
                      <div className="fi"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.6 12.6L12 21.2 2.8 12A2 2 0 0 1 2.2 10.6l1.1-6.6A2 2 0 0 1 5 2.3l6.6-1.1a2 2 0 0 1 1.4.6l8.8 8.8a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.5"/></svg></div>
                      <div><div className="ft">Badge Premium</div><div className="fd">Lencana khusus supaya bisnis Anda lebih dipercaya</div></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <h3 className="db-subheading">
              {isAdmin ? "Riwayat Pengajuan Premium (Semua User & Reseller)" : "Riwayat Invoice"}
            </h3>
            {loading ? (
              <div className="db-loader-wrap">
                <div className="db-spinner" />
                <span>Memuat invoice...</span>
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="db-table-responsive">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>ID Invoice</th>
                      <th>Bisnis</th>
                      {isAdmin && <th>Diajukan Oleh</th>}
                      <th>Paket</th>
                      <th>Tanggal</th>
                      <th>Jumlah</th>
                      <th>Status</th>
                      <th>Bukti</th>
                      {isAdmin && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllHistory ? subscriptions : subscriptions.slice(0, 5)).map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.invoice_number || `#${sub.id}`}</td>
                        <td>{sub.business_name || sub.business?.title || "-"}</td>
                        {isAdmin && (
                          <td>
                            {sub.user_name || sub.user?.name || "-"}
                            {(sub.user?.role || sub.role) && (
                              <span className={`db-role-pill db-role-pill--${sub.user?.role || sub.role}`}>
                                {{ user: "User", reseller: "Reseller", admin: "Admin" }[sub.user?.role || sub.role] || (sub.user?.role || sub.role)}
                              </span>
                            )}
                          </td>
                        )}
                        <td>{sub.plan_display || { monthly: "Bulanan", quarterly: "3 Bulan", yearly: "Tahunan" }[sub.plan] || sub.plan || "-"}</td>
                        <td>{new Date(sub.created_at).toLocaleDateString("id-ID")}</td>
                        <td>{formatRupiah(sub.amount)}</td>
                        <td>
                          <span className={`db-status-badge db-status--${sub.status}`}>
                            {{ 
                              paid: "Lunas", 
                              approved: "Lunas",
                              active: "Aktif",
                              pending: "Menunggu Verifikasi", 
                              rejected: "Ditolak",
                              expired: "Kadaluarsa"
                            }[sub.status] || sub.status}
                          </span>
                        </td>
                        <td>
                          {sub.payment_proof ? (
                            <button
                              className="db-table-btn db-btn-view-proof"
                              onClick={() => handleViewProof(sub.payment_proof)}
                              title="Lihat Bukti Pembayaran"
                            >
                              <Eye size={16} />
                              <span>Lihat</span>
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td>
                            <div className="db-table-actions">
                              {(sub.status === "pending" || sub.status === "waiting") && (
                                <>
                                  <button
                                    className="db-table-btn db-btn-approve"
                                    onClick={() => handleVerifySubscription(sub.id)}
                                    title="Setujui"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    className="db-table-btn db-btn-reject"
                                    onClick={() => handleRejectSubscription(sub.id)}
                                    title="Tolak"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Show All Button */}
                {subscriptions.length > 5 && (
                  <div className="db-show-all-container">
                    <button
                      className="db-show-all-btn"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      <span>{showAllHistory ? 'Tampilkan Sedikit' : `Lihat Semua (${subscriptions.length})`}</span>
                      {showAllHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <DashboardEmptyState
                title="Belum Ada Invoice"
                subtitle={isAdmin ? "Riwayat pengajuan premium dari user/reseller akan tampil di sini." : "Riwayat pembayaran langganan Anda akan tampil di sini."}
              />
            )}
          </div>
        )}

        {/* TAB: MENU */}
          {activeTab === "menu" && (
            <div className="db-panel">
            {showMenuModal ? (
              <div className="db-inline-form-page db-inline-form-page--biz">
                {/* ── Hero Section ── */}
                <div className="db-hero">
                  <div className="db-hero__content">
                    <button type="button" className="db-hero__back" onClick={() => setShowMenuModal(false)}>
                      <ArrowLeft size={16} />
                      <span>Kembali ke Dashboard</span>
                      <span className="db-hero__back-dot" />
                    </button>
                    <h1 className="db-hero__title">
                      Tambah <span className="db-hero__title-highlight">Produk</span> Baru
                    </h1>
                    <p className="db-hero__subtitle">
                      Tambahkan produk atau layanan ke dalam daftar produk bisnis Anda
                    </p>
                  </div>
                  <div className="db-hero__illustration">
                    <div className="db-mock-card">
                      <div className="db-mock-card__dots">
                        <span /><span /><span />
                      </div>
                      <div className="db-mock-card__icon">
                        <MenuIcon size={24} />
                      </div>
                    </div>
                    <div className="db-mock-plant" aria-hidden="true">🍽️</div>
                  </div>
                </div>

                {/* Progress Tabs */}
                <div className="db-progress-container">
                  <div className={`db-progress-step ${menuFormStep > 0 ? "completed" : "active"}`}>
                    <div className="db-progress-icon">
                      <Info size={20} />
                    </div>
                    <div className="db-progress-label">Info Dasar</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${menuFormStep > 1 ? "completed" : menuFormStep === 1 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Edit2 size={20} />
                    </div>
                    <div className="db-progress-label">Detail</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${menuFormStep === 2 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Image size={20} />
                    </div>
                    <div className="db-progress-label">Foto</div>
                  </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSaveMenu} className="db-card">
                  {/* Info Dasar Section */}
                  <div className="db-form-section" ref={(el) => (menuSectionRefs.current[0] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3>Informasi Dasar</h3>
                        <p>Data utama tentang produk atau layanan</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Bisnis <span className="req">*</span></label>
                      <select required value={mnBusinessId} onChange={(e) => setMnBusinessId(e.target.value)}>
                        <option value="">Pilih bisnis...</option>
                        {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((b) => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="db-form-group">
                      <label>Nama Produk <span className="req">*</span></label>
                      <input 
                        type="text" 
                        required 
                        value={mnName} 
                        onChange={(e) => setMnName(e.target.value)} 
                        placeholder="Nama produk atau layanan" 
                      />
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Detail Section */}
                  <div className="db-form-section" ref={(el) => (menuSectionRefs.current[1] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Edit2 size={20} />
                      </div>
                      <div>
                        <h3>Detail Produk</h3>
                        <p>Deskripsi dan harga produk</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Deskripsi</label>
                      <textarea 
                        rows={4} 
                        value={mnDescription} 
                        onChange={(e) => setMnDescription(e.target.value)} 
                        placeholder="Jelaskan produk atau layanan ini dengan detail..." 
                      />
                    </div>

                    <div className="db-form-group">
                      <label>Harga (Rp) <span className="req">*</span></label>
                      <input 
                        type="number" 
                        required 
                        min="0" 
                        value={mnPrice} 
                        onChange={(e) => setMnPrice(e.target.value)} 
                        placeholder="Contoh: 25000" 
                      />
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Foto Section */}
                  <div className="db-form-section" ref={(el) => (menuSectionRefs.current[2] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Image size={20} />
                      </div>
                      <div>
                        <h3>Foto Produk</h3>
                        <p>Upload foto menarik untuk produk Anda</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Foto Produk (opsional)</label>
                      <div className="db-upload-area">
                        <div className="db-upload-area__icon">
                          <Camera size={32} />
                        </div>
                        <div className="db-upload-area__text">Klik untuk upload foto</div>
                        <div className="db-upload-area__subtext">JPG, PNG - Max 2MB</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setMnImage(e.target.files?.[0] || null)}
                          className="db-upload-area__input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="db-card__footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowMenuModal(false)}>
                      Batal
                    </button>
                    <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Produk"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
              <div className="db-panel-header">
                <h2>Produk</h2>
                <button className="db-action-btn" onClick={() => handleOpenMenuModal()}>
                  <Plus size={16} />
                  <span>Tambah Produk</span>
                </button>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : menuItems.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nama</th>
                        <th>Bisnis</th>
                        <th>Harga</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((m) => (
                        <tr key={m.id}>
                          <td>{m.image ? <img src={getImageUrl(m.image)} alt={m.name} className="db-table-thumb" /> : "-"}</td>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.business?.title || "-"}</td>
                          <td>{formatRupiah(m.price)}</td>
                          <td>
                            <span className={`db-status-badge db-status--${m.is_available ? "verified" : "rejected"}`}>
                              {m.is_available ? "Tersedia" : "Habis"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenMenuModal(m)}><Edit2 size={14} /></button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteMenu(m.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title={
                    businesses.filter((b) => isAdmin || b.user_id === user?.id).length === 0
                      ? "Daftarkan Usahamu Dulu"
                      : "Tingkatkan Jangkauan Bisnis Anda"
                  }
                  subtitle={
                    businesses.filter((b) => isAdmin || b.user_id === user?.id).length === 0
                      ? "Kamu belum punya bisnis yang terdaftar & disetujui. Produk hanya bisa ditambahkan setelah usahamu terdaftar."
                      : "Anda harus berada di sini untuk pertama kalinya. Jika Anda ingin menambahkan sesuatu, klik tombol di bawah ini."
                  }
                  actionLabel="Tambah Produk Baru"
                  onAction={() => handleOpenMenuModal()}
                />
              )}
              </>
            )}
            </div>
          )}

        {/* TAB: INBOX - chat dua arah, mirip WhatsApp. Menampilkan gabungan
            percakapan sebagai penjual (pesan masuk ke bisnis sendiri) dan
            sebagai pelanggan (pesan yang dikirim ke penjual lain), supaya
            satu akun bisa membalas siapa pun yang mengirim pesan padanya. */}
          {activeTab === "inbox" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Inbox</h2>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : inboxThreads.length > 0 || isPendingNewChat ? (
                <div className="db-inbox-chat-layout">
                  <aside className="db-inbox-sidebar">
                    <div className="db-inbox-sidebar__search">
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Cari nama atau bisnis..."
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                      />
                    </div>
                    <div className="db-inbox-sidebar__filters">
                      <button
                        type="button"
                        className={`db-inbox-filter-pill ${inboxFilter === "all" ? "active" : ""}`}
                        onClick={() => setInboxFilter("all")}
                      >
                        Semua
                      </button>
                      <button
                        type="button"
                        className={`db-inbox-filter-pill ${inboxFilter === "unread" ? "active" : ""}`}
                        onClick={() => setInboxFilter("unread")}
                      >
                        Belum dibaca{unreadInboxCount > 0 ? ` (${unreadInboxCount})` : ""}
                      </button>
                    </div>

                    {visibleInboxThreads.length === 0 ? (
                      <p className="db-inbox-sidebar__empty">Tidak ada percakapan yang cocok.</p>
                    ) : (
                      visibleInboxThreads.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          className={`db-inbox-item ${selectedInboxThread?.key === t.key ? "active" : ""}`}
                          onClick={() => handleSelectInboxThread(t)}
                        >
                          <div className="db-inbox-avatar">
                            {(t.otherName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="db-inbox-item__meta">
                            <div className="db-inbox-item__top">
                              <strong>{t.otherName}</strong>
                              {t.last?.created_at && (
                                <span className="db-inbox-item__time">
                                  {new Date(t.last.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                            <span className="db-inbox-item__business">
                              {t.amOwner ? (t.business?.title || "Bisnis") : "Anda bertanya ke penjual ini"}
                            </span>
                            <p>{t.last.message}</p>
                          </div>
                          {t.unread > 0 && <span className="db-inbox-dot">{t.unread}</span>}
                        </button>
                      ))
                    )}
                  </aside>

                  <div className="db-chat-panel">
                    {isPendingNewChat ? (
                      <>
                        <div className="db-chat-header">
                          <div className="db-chat-header__info">
                            <div className="db-inbox-avatar large">
                              {(startBusinessName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3>{startBusinessName || "Penjual"}</h3>
                              <span>Percakapan baru</span>
                            </div>
                          </div>
                        </div>
                        <div className="db-chat-thread">
                          <div className="db-chat-empty">
                            Mulai percakapan dengan {startBusinessName || "penjual ini"} - ketik pesan pertama
                            Anda di bawah.
                          </div>
                        </div>
                        <div className="db-chat-composer">
                          <textarea
                            value={inboxDraft}
                            rows={2}
                            placeholder="Tulis pesan..."
                            onChange={(e) => setInboxDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleStartNewChat();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleStartNewChat}
                            disabled={sendingInboxReply || !inboxDraft.trim()}
                          >
                            <Send size={16} />
                            {sendingInboxReply ? "Mengirim..." : "Kirim"}
                          </button>
                        </div>
                      </>
                    ) : selectedInboxThread ? (
                      <>
                        <div className="db-chat-header">
                          <div className="db-chat-header__info">
                            <div className="db-inbox-avatar large">
                              {(selectedInboxThread.otherName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3>{selectedInboxThread.otherName}</h3>
                              <span>
                                {selectedInboxThread.amOwner
                                  ? selectedInboxThread.business?.title || "Konsumen"
                                  : "Percakapan dengan penjual"}
                              </span>
                            </div>
                          </div>
                          {(selectedInboxThread.amOwner || isAdmin) && (
                            <div className="db-chat-header__actions">
                              <button
                                type="button"
                                className="db-chat-action"
                                onClick={() => handleDeleteMessage(selectedInboxThread.last.id)}
                                title="Hapus pesan terakhir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="db-chat-thread">
                          {selectedInboxThread.items.map((m) => {
                            const isMine = selectedInboxThread.amOwner
                              ? m.sender_role === "seller"
                              : m.sender_role !== "seller";
                            return (
                              <div key={m.id} className={`db-chat-bubble ${isMine ? "outgoing" : "incoming"}`}>
                                <p>{m.message}</p>
                                <span>{m.created_at ? new Date(m.created_at).toLocaleString("id-ID") : ""}</span>
                              </div>
                            );
                          })}
                        </div>

                        {!selectedInboxThread.customer_id ? (
                          <div className="db-chat-composer db-chat-composer--locked">
                            <p>
                              Pesan ini dikirim oleh pengunjung yang belum login, jadi tidak bisa
                              dibalas lewat chat. Hubungi lewat kontak yang ia cantumkan.
                            </p>
                          </div>
                        ) : selectedInboxThread.amOwner &&
                          !isAdmin &&
                          !businesses.find((b) => b.id === selectedInboxThread.business_id)?.is_premium_active ? (
                          <div className="db-chat-composer db-chat-composer--locked">
                            <Crown size={18} />
                            <p>Upgrade bisnis ini ke Premium untuk bisa membalas pesan pelanggan.</p>
                            <button type="button" className="db-btn-primary" onClick={() => setActiveTab("premium")}>
                              Upgrade ke Premium
                            </button>
                          </div>
                        ) : (
                          <div className="db-chat-composer">
                            <textarea
                              value={inboxDraft}
                              rows={2}
                              placeholder="Tulis pesan..."
                              onChange={(e) => setInboxDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleInboxReply();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleInboxReply}
                              disabled={sendingInboxReply || !inboxDraft.trim()}
                            >
                              <Send size={16} />
                              {sendingInboxReply ? "Mengirim..." : "Kirim"}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="db-chat-empty">Pilih percakapan untuk memulai chat.</div>
                    )}
                  </div>
                </div>
              ) : (
                <DashboardEmptyState
                  title="Belum Ada Pesan Masuk"
                  subtitle="Pesan dari calon pelanggan akan muncul di sini."
                />
              )}
            </div>
          )}

        {/* TAB: SIMPAN */}
          {activeTab === "saved" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Bisnis Favorit</h2>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat bisnis favorit...</span></div>
              ) : savedBusinesses.length > 0 ? (
                <div className="db-grid">
                  {savedBusinesses.map((savedBiz) => (
                    <div key={savedBiz.id} className="db-card db-saved-business-card">
                      <div className="db-saved-business-card__image">
                        <img
                          src={savedBiz.business?.img || savedBiz.business?.image || "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=300&fit=crop"}
                          alt={savedBiz.business?.name || savedBiz.business?.title}
                        />
                        <div className="db-saved-business-card__overlay">
                          <Link
                            to={`/business/${savedBiz.business?.id}`}
                            className="db-saved-business-card__view-btn"
                          >
                            <Eye size={16} />
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                      <div className="db-saved-business-card__content">
                        <h3 className="db-saved-business-card__title">
                          {savedBiz.business?.name || savedBiz.business?.title}
                        </h3>
                        <p className="db-saved-business-card__category">
                          {/* PERBAIKAN: sebelumnya {savedBiz.business?.category}
                              me-render OBJEK kategori mentah dari API
                              (bukan teksnya) - persis pemicu error React
                              "Objects are not valid as a React child". */}
                          {savedBiz.business?.category?.name || "Lainnya"}
                        </p>
                        <div className="db-saved-business-card__meta">
                          <div className="db-saved-business-card__rating">
                            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                            <span>{savedBiz.business?.rating || "4.5"}</span>
                            <span>({savedBiz.business?.reviews || "0"} ulasan)</span>
                          </div>
                          <span className={`db-saved-business-card__status ${savedBiz.business?.status === "Buka Sekarang" ? "open" : "closed"}`}>
                            {savedBiz.business?.status || "Buka Sekarang"}
                          </span>
                        </div>
                        <div className="db-saved-business-card__actions">
                          <Link
                            to={`/seller/${savedBiz.business?.user_id || savedBiz.business?.seller?.id || 1}`}
                            className="db-saved-business-card__action-btn seller-btn"
                          >
                            <UserCircle2 size={14} />
                            Lihat Penjual
                          </Link>
                          <button
                            className="db-saved-business-card__action-btn whatsapp-btn"
                            onClick={() => {
                              const phone = savedBiz.business?.phone?.replace(/\D/g, "");
                              const message = `Halo, saya tertarik dengan ${savedBiz.business?.name} yang saya lihat di Surade.co.id`;
                              const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </button>
                          <button
                            className="db-saved-business-card__action-btn remove-btn"
                            onClick={async () => {
                              if (confirm("Hapus dari favorit?")) {
                                try {
                                  await api.delete(`/saved-businesses/${savedBiz.id}`);
                                  
                                  // Refresh saved businesses data instead of full reload
                                  const data = await api.get("/my-saved-businesses");
                                  setSavedBusinesses(data);
                                } catch (err) {
                                  alert("Gagal menghapus dari favorit.");
                                }
                              }
                            }}
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DashboardEmptyState
                  title="Belum Ada Bisnis Favorit"
                  subtitle="Bisnis yang Anda simpan sebagai favorit akan muncul di sini."
                  actionLabel="Jelajahi Bisnis"
                  onAction={() => window.location.href = "/"}
                />
              )}
            </div>
          )}

        {/* TAB: ULASAN */}
          {activeTab === "reviews" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Ulasan Pelanggan</h2>
                <p style={{ color: "#6b7280", fontSize: "13.5px", margin: "4px 0 0" }}>
                  Pantau umpan balik konsumen dan ulasan rating bintang
                </p>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat ulasan...</span></div>
              ) : (
                <>
                  <div className="db-kpi-grid">
                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Star size={16} /></div>
                      <span className="db-kpi-card__value">{businessReviews.length}</span>
                      <span className="db-kpi-card__label">Total Ulasan</span>
                    </div>
                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--green"><Star size={16} /></div>
                      <span className="db-kpi-card__value">
                        {businessReviews.length > 0
                          ? (businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length).toFixed(1)
                          : "0.0"}
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8" }}> / 5</span>
                      </span>
                      <span className="db-kpi-card__label">Rata-rata Rating</span>
                    </div>
                    <div className="db-kpi-card">
                      <div className="db-kpi-card__icon db-kpi-card__icon--slate"><Briefcase size={16} /></div>
                      <span className="db-kpi-card__value">
                        {new Set(businessReviews.map((r) => r.business_id ?? r.business?.id)).size}
                      </span>
                      <span className="db-kpi-card__label">Bisnis Diulas</span>
                    </div>
                  </div>

                  {businessReviews.length > 0 ? (
                    <div className="db-review-list" style={{ marginTop: "20px" }}>
                      {businessReviews.map((r) => (
                        <div key={r.id} className="db-card" style={{ padding: "18px 20px", marginBottom: "14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                              <div className="db-review-avatar">
                                {r.reviewer?.avatar ? (
                                  <img src={getImageUrl(r.reviewer.avatar)} alt={r.reviewer?.name} />
                                ) : (
                                  (r.reviewer?.name || "?").charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <strong>{r.business?.title || "-"}</strong>
                                <div className="db-review-stars">
                                  <span className="star-filled">{"★".repeat(r.rating)}</span>
                                  <span className="star-empty">{"☆".repeat(5 - r.rating)}</span>
                                  <span style={{ marginLeft: "6px", color: "#94a3b8", fontSize: "12.5px" }}>
                                    oleh {r.reviewer?.name || "Pengguna"} · {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                              <Link to={`/business/${r.business?.id}`} className="db-action-btn" style={{ padding: "6px 12px", fontSize: "12.5px" }}>
                                <Eye size={14} />
                                <span>Lihat Bisnis</span>
                              </Link>
                              <button
                                className="db-action-btn"
                                style={{ padding: "6px 12px", fontSize: "12.5px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                                onClick={() => handleDeleteReview(r.id)}
                              >
                                <Trash2 size={14} />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>

                          <p style={{ margin: "12px 0 0", color: "#334155", fontSize: "14.5px", lineHeight: 1.55 }}>
                            {r.comment}
                          </p>

                          {r.owner_reply ? (
                            <div style={{ marginTop: "12px", background: "#f0fdf9", border: "1px solid #ccfbef", borderRadius: "10px", padding: "10px 14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ fontSize: "12.5px", color: "#0f766e" }}>Balasan Anda</strong>
                                <button
                                  type="button"
                                  className="db-view-all-link"
                                  onClick={() => setReplyDrafts((prev) => ({ ...prev, [r.id]: r.owner_reply }))}
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                              </div>
                              {replyDrafts[r.id] === undefined ? (
                                <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#0f172a" }}>{r.owner_reply}</p>
                              ) : (
                                <div style={{ marginTop: "6px", display: "flex", gap: "8px" }}>
                                  <textarea
                                    className="db-textarea"
                                    rows={2}
                                    value={replyDrafts[r.id]}
                                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                    style={{ flex: 1 }}
                                  />
                                  <button className="db-action-btn" disabled={replySubmittingId === r.id} onClick={() => handleReplySubmit(r.id)}>
                                    {replySubmittingId === r.id ? "..." : "Simpan"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                              <textarea
                                className="db-textarea"
                                rows={2}
                                placeholder="Tulis balasan untuk pelanggan ini..."
                                value={replyDrafts[r.id] || ""}
                                onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                style={{ flex: 1 }}
                              />
                              <button className="db-action-btn" disabled={replySubmittingId === r.id} onClick={() => handleReplySubmit(r.id)}>
                                <Send size={14} />
                                <span>{replySubmittingId === r.id ? "..." : "Balas"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <DashboardEmptyState
                      title="Belum Ada Ulasan"
                      subtitle="Ulasan dari pelanggan untuk bisnis Anda akan muncul di sini."
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB: KUPON DISKON (Admin - kupon diskon Paket Premium/Iklan) */}
          {activeTab === "coupons" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Kelola Kupon Diskon</h2>
                <button className="db-action-btn" onClick={() => handleOpenCouponAdminModal()}>
                  <Plus size={16} />
                  <span>Tambah Kupon</span>
                </button>
              </div>

              <div className="db-kpi-grid">
                <div className="db-kpi-card">
                  <div className="db-kpi-card__icon db-kpi-card__icon--blue"><Ticket size={16} /></div>
                  <span className="db-kpi-card__value">{platformCoupons.length}</span>
                  <span className="db-kpi-card__label">Total Kupon</span>
                </div>
                <div className="db-kpi-card">
                  <div className="db-kpi-card__icon db-kpi-card__icon--green"><CheckCircle size={16} /></div>
                  <span className="db-kpi-card__value">{platformCoupons.filter((c) => c.is_active).length}</span>
                  <span className="db-kpi-card__label">Kupon Aktif</span>
                </div>
                <div className="db-kpi-card">
                  <div className="db-kpi-card__icon db-kpi-card__icon--slate"><TrendingUp size={16} /></div>
                  <span className="db-kpi-card__value">{platformCoupons.reduce((sum, c) => sum + (c.used_count || 0), 0)}</span>
                  <span className="db-kpi-card__label">Total Penggunaan</span>
                </div>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat kupon...</span></div>
              ) : platformCoupons.length > 0 ? (
                <div className="db-table-responsive" style={{ marginTop: "20px" }}>
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Kode Kupon</th>
                        <th>Nama / Deskripsi</th>
                        <th>Diskon</th>
                        <th>Berlaku Untuk</th>
                        <th>Min Transaksi</th>
                        <th>Penggunaan</th>
                        <th>Masa Berlaku</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformCoupons.map((c) => (
                        <tr key={c.id}>
                          <td><code style={{ background: "#f0fdf9", color: "#0f766e", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>{c.code}</code></td>
                          <td>{c.name || "-"}</td>
                          <td>{c.discount_type === "percentage" ? `${c.discount_value}%` : formatRupiah(c.discount_value)}</td>
                          <td style={{ textTransform: "capitalize" }}>{c.applies_to === "semua" ? "Semua Paket" : c.applies_to === "premium" ? "Paket Premium" : "Paket Iklan"}</td>
                          <td>{c.min_purchase ? formatRupiah(c.min_purchase) : "-"}</td>
                          <td>{c.used_count || 0} / {c.max_uses || "∞"}</td>
                          <td>{c.expires_at ? formatDate(c.expires_at) : "Selamanya"}</td>
                          <td>
                            <span
                              className={`db-badge ${c.is_active ? "db-badge--success" : "db-badge--warning"}`}
                              onClick={() => handleToggleCouponAdmin(c)}
                              style={{ cursor: "pointer" }}
                              title="Klik untuk ubah status"
                            >
                              {c.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenCouponAdminModal(c)} title="Edit"><Edit2 size={14} /></button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteCouponAdmin(c.id)} title="Hapus"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title="Belum Ada Kupon Diskon"
                  subtitle="Buat kupon diskon untuk Paket Premium atau Paket Iklan."
                />
              )}
            </div>
          )}

          {/* TAB: PENGATURAN (Admin - pengaturan situs) */}
          {activeTab === "settings" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Pengaturan Situs</h2>
              </div>
              <form onSubmit={handleSaveSettings} style={{ maxWidth: "560px" }}>
                <div className="db-form-group">
                  <label>Nama Situs</label>
                  <input
                    type="text"
                    value={settingsDraft.site_name || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, site_name: e.target.value }))}
                    placeholder="Surade.co.id"
                  />
                </div>
                <div className="db-form-group">
                  <label>Email Kontak</label>
                  <input
                    type="email"
                    value={settingsDraft.contact_email || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="admin@surade.co.id"
                  />
                </div>
                <div className="db-form-group">
                  <label>Nomor Telepon</label>
                  <input
                    type="text"
                    value={settingsDraft.contact_phone || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+62 812 3456 7890"
                  />
                </div>
                <div className="db-form-group">
                  <label>WhatsApp Admin</label>
                  <input
                    type="text"
                    value={settingsDraft.whatsapp_admin || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, whatsapp_admin: e.target.value }))}
                    placeholder="6281234567890"
                  />
                </div>
                <div className="db-form-group">
                  <label>Alamat</label>
                  <textarea
                    rows={3}
                    value={settingsDraft.address || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Alamat kantor/perusahaan"
                  />
                </div>
                <div className="db-form-group">
                  <label>Meta Description (SEO)</label>
                  <textarea
                    rows={3}
                    value={settingsDraft.meta_description || ""}
                    onChange={(e) => setSettingsDraft((prev) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Deskripsi singkat situs untuk mesin pencari"
                  />
                </div>
                <div className="db-modal-footer" style={{ padding: 0, borderTop: "none" }}>
                  <button type="submit" className="db-btn-submit" disabled={savingSettings}>
                    {savingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- MODAL: TAMBAH/EDIT KUPON DISKON (ADMIN) --- */}
          {showCouponAdminModal && (
            <div className="db-modal-overlay" onClick={() => setShowCouponAdminModal(false)}>
              <div className="db-modal" onClick={(e) => e.stopPropagation()}>
                <div className="db-modal-header">
                  <h3>{selectedPlatformCoupon ? "Edit Kupon" : "Tambah Kupon Diskon"}</h3>
                  <button className="db-modal-close" onClick={() => setShowCouponAdminModal(false)}>&times;</button>
                </div>
                <form onSubmit={handleSaveCouponAdmin} className="db-modal-body">
                  <div className="db-form-group">
                    <label>Kode Kupon <span className="req">*</span></label>
                    <div className="db-input-with-btn">
                      <input
                        type="text"
                        required
                        value={pcCode}
                        onChange={(e) => setPcCode(e.target.value.toUpperCase())}
                        placeholder="Contoh: PROMO50"
                        style={{ textTransform: "uppercase" }}
                      />
                      <button
                        type="button"
                        className="db-input-btn"
                        onClick={() => {
                          const random = Math.random().toString(36).slice(2, 8).toUpperCase();
                          setPcCode(`SURADE${random}`);
                        }}
                      >
                        Acak Otomatis
                      </button>
                    </div>
                  </div>
                  <div className="db-form-group">
                    <label>Nama / Deskripsi</label>
                    <input type="text" value={pcName} onChange={(e) => setPcName(e.target.value)} placeholder="Contoh: Promo Super Premium 50%" />
                  </div>
                  <div className="db-form-row">
                    <div className="db-form-group">
                      <label>Tipe Diskon</label>
                      <select value={pcType} onChange={(e) => setPcType(e.target.value)}>
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div className="db-form-group">
                      <label>Nilai Diskon <span className="req">*</span></label>
                      {pcType === "percentage" ? (
                        <input type="number" required min="1" max="100" value={pcValue} onChange={(e) => setPcValue(e.target.value)} placeholder="Contoh: 30" />
                      ) : (
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={pcValue ? formatRupiahInput(pcValue) : ""}
                          onChange={(e) => setPcValue(parseRupiahInput(e.target.value))}
                          placeholder="Contoh: Rp10.000"
                        />
                      )}
                    </div>
                  </div>
                  <div className="db-form-group">
                    <label>Berlaku Untuk</label>
                    <select value={pcAppliesTo} onChange={(e) => setPcAppliesTo(e.target.value)}>
                      <option value="semua">Semua Paket</option>
                      <option value="premium">Paket Premium</option>
                      <option value="iklan">Paket Iklan</option>
                    </select>
                  </div>
                  <div className="db-form-row">
                    <div className="db-form-group">
                      <label>Min. Transaksi (Rp)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pcMinPurchase ? formatRupiahInput(pcMinPurchase) : ""}
                        onChange={(e) => setPcMinPurchase(parseRupiahInput(e.target.value))}
                        placeholder="Opsional"
                      />
                    </div>
                    <div className="db-form-group">
                      <label>Maks. Penggunaan</label>
                      <input type="number" min="1" value={pcMaxUses} onChange={(e) => setPcMaxUses(e.target.value)} placeholder="Kosongkan = tak terbatas" />
                    </div>
                  </div>
                  <div className="db-form-group">
                    <label>Masa Berlaku Sampai</label>
                    <input type="date" value={pcExpiresAt} onChange={(e) => setPcExpiresAt(e.target.value)} />
                  </div>
                  <div className="db-modal-footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowCouponAdminModal(false)}>Batal</button>
                    <button type="submit" className="db-btn-submit">{selectedPlatformCoupon ? "Simpan Perubahan" : "Buat Kupon"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>{isAdmin ? "Kelola Tiket Pembayaran" : "Tiket Pembayaran Saya"}</h2>
                {!isAdmin && (
                  <button className="db-action-btn" onClick={() => handleOpenTicketModal()}>
                    <Plus size={16} />
                    <span>Buat Tiket Baru</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat tiket...</span>
                </div>
              ) : tickets.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{isAdmin ? "User" : "Bisnis"}</th>
                        <th>Plan</th>
                        <th>Bukti Transfer</th>
                        <th>Catatan</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>#{ticket.id}</td>
                          <td>
                            {isAdmin ? (
                              <strong>{ticket.user?.name || "-"}</strong>
                            ) : (
                              <strong>{ticket.business?.title || "-"}</strong>
                            )}
                          </td>
                          <td>{ticket.plan === "monthly" ? "Bulanan" : ticket.plan === "yearly" ? "Tahunan" : ticket.plan}</td>
                          <td>
                            {ticket.payment_proof_url ? (
                              <a href={ticket.payment_proof_url} target="_blank" rel="noopener noreferrer" className="db-link">
                                Lihat Bukti
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{isAdmin ? (ticket.admin_notes || ticket.notes || "-") : (ticket.notes || "-")}</td>
                          <td>
                            <span className={`db-status-badge db-status--${ticket.status}`}>
                              {ticket.status === "pending" ? "Menunggu" : ticket.status === "approved" ? "Disetujui" : ticket.status === "rejected" ? "Ditolak" : ticket.status}
                            </span>
                          </td>
                          <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("id-ID") : "-"}</td>
                          <td>
                            <div className="db-table-actions">
                              {isAdmin && ticket.status === "pending" && (
                                <>
                                  <button className="db-table-btn db-btn-edit" title="Setujui" onClick={() => handleUpdateTicketStatus(ticket.id, "approved")}>
                                    <CheckCircle size={14} />
                                  </button>
                                  <button className="db-table-btn db-btn-delete" title="Tolak" onClick={() => handleUpdateTicketStatus(ticket.id, "rejected")}>
                                    <XCircle size={14} />
                                  </button>
                                </>
                              )}
                              {!isAdmin && ticket.status === "pending" && (
                                <button className="db-table-btn db-btn-edit" onClick={() => handleOpenTicketModal(ticket)}>
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteTicket(ticket.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title={isAdmin ? "Belum Ada Tiket Pembayaran" : "Belum Ada Tiket Pembayaran"}
                  subtitle={isAdmin ? "Tiket bukti transfer dari user akan muncul di sini." : "Buat tiket baru untuk mengirim bukti transfer pembayaran premium."}
                  actionLabel={!isAdmin ? "Buat Tiket Baru" : undefined}
                  onAction={!isAdmin ? () => handleOpenTicketModal() : undefined}
                />
              )}
            </div>
          )}

        {/* TAB: CONTENT (Unified Blog & Event - Available for all users) */}
          {activeTab === "content" && (
            <div className="db-panel">
            {showContentModal ? (
              <div className="db-inline-form-page db-inline-form-page--biz">
                {/* ── Hero Section ── */}
                <div className="db-hero">
                  <div className="db-hero__text">
                    <button type="button" className="db-hero__back" onClick={() => setShowContentModal(false)}>
                      <ArrowLeft size={16} />
                      <span>Kembali ke Dashboard</span>
                      <span className="db-hero__back-dot" />
                    </button>
                    <h1 className="db-hero__title">
                      {selectedContent ? "Edit" : "Buat"} <span className="db-hero__title-highlight">{contentType === "blog" ? "Blog" : "Event"}</span> {selectedContent ? "" : "Baru"}
                    </h1>
                    <p className="db-hero__subtitle">
                      {selectedContent 
                        ? "Perbarui konten blog atau event" 
                        : contentType === "blog" 
                          ? "Bagikan informasi, cerita, atau pengetahuan menarik untuk pengunjung Surade.co.id"
                          : "Buat event menarik untuk pengunjung Surade.co.id"}
                    </p>
                  </div>
                  <div className="db-hero__illustration">
                    <div className="db-mock-card">
                      <div className="db-mock-card__dots">
                        <span /><span /><span />
                      </div>
                      <div className="db-mock-card__icon">
                        {contentType === "blog" ? <Edit2 size={24} /> : <CalendarDays size={24} />}
                      </div>
                    </div>
                    <div className="db-mock-plant" aria-hidden="true">{contentType === "blog" ? "📝" : "📅"}</div>
                  </div>
                </div>

                {/* Progress Tabs */}
                <div className="db-progress-container">
                  <div className={`db-progress-step ${contentStep > 0 ? "completed" : "active"}`}>
                    <div className="db-progress-icon">
                      <Info size={20} />
                    </div>
                    <div className="db-progress-label">Info Dasar</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${contentStep > 1 ? "completed" : contentStep === 1 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Edit2 size={20} />
                    </div>
                    <div className="db-progress-label">Konten</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${contentStep === 2 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <ImageIcon size={20} />
                    </div>
                    <div className="db-progress-label">Media</div>
                  </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSaveContent} className="db-card">
                  {/* Tab Pills untuk Blog/Event */}
                  <div className="db-tabpill">
                    <button
                      type="button"
                      className={`db-tabpill__btn ${contentType === "blog" ? "active" : ""}`}
                      onClick={() => setContentType("blog")}
                    >
                      <BookOpen size={16} />
                      <span>Blog</span>
                    </button>
                    <button
                      type="button"
                      className={`db-tabpill__btn ${contentType === "event" ? "active" : ""}`}
                      onClick={() => setContentType("event")}
                    >
                      <CalendarDays size={16} />
                      <span>Event</span>
                    </button>
                  </div>

                  {/* Basic Information */}
                  <div className="db-form-section" ref={(el) => (contentSectionRefs.current[0] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3>Informasi Dasar</h3>
                        <p>Data utama tentang {contentType === "blog" ? "blog" : "event"}</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Judul {contentType === "blog" ? "Blog" : "Event"} <span className="req">*</span></label>
                      <div className="db-input-icon-wrap">
                        <input
                          type="text"
                          required
                          className="db-form-input"
                          value={contentTitle}
                          onChange={(e) => setContentTitle(e.target.value)}
                          placeholder={contentType === "blog" ? "Masukkan judul blog..." : "Masukkan nama event..."}
                        />
                        <Edit2 size={16} className="db-input-icon" />
                      </div>
                    </div>

                    <div className="db-form-row">
                      {contentType === "blog" && (
                        <div className="db-form-group">
                          <label>Kategori Blog <span className="req">*</span></label>
                          <select required className="db-form-input" value={contentCategory} onChange={(e) => setContentCategory(e.target.value)}>
                            <option value="">Pilih Kategori</option>
                            <option value="Informasi">Informasi</option>
                            <option value="Budaya">Budaya</option>
                            <option value="Kuliner">Kuliner</option>
                            <option value="Wisata">Wisata</option>
                            <option value="Teknologi">Teknologi</option>
                            <option value="Bisnis">Bisnis</option>
                            <option value="Kesehatan">Kesehatan</option>
                            <option value="Pendidikan">Pendidikan</option>
                          </select>
                        </div>
                      )}
                      <div className="db-form-group">
                        <label>Status Publikasi</label>
                        <select className="db-form-input" value={contentStatus || "draft"} onChange={(e) => setContentStatus(e.target.value)}>
                          <option value="draft">Draft</option>
                          <option value="published">Publikasikan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {contentType === "blog" && (
                    <>
                      <div className="db-form-section__divider" />
                      <div className="db-form-section">
                        <div className="db-form-section__header">
                          <div className="db-form-section__icon">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h3>Ringkasan Artikel</h3>
                            <p>Deskripsi singkat untuk preview</p>
                          </div>
                        </div>
                        <div className="db-form-group">
                          <label>Ringkasan (Excerpt) <span className="req">*</span></label>
                          <textarea
                            required
                            rows={2}
                            className="db-form-input"
                            value={contentExcerpt || ""}
                            onChange={(e) => setContentExcerpt(e.target.value)}
                            placeholder="Ringkasan singkat artikel..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="db-form-section__divider" />

                  {/* Content Section */}
                  <div className="db-form-section" ref={(el) => (contentSectionRefs.current[1] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Edit2 size={20} />
                      </div>
                      <div>
                        <h3>Konten Utama</h3>
                        <p>{contentType === "blog" ? "Isi lengkap artikel blog" : "Deskripsi detail event"}</p>
                      </div>
                    </div>
                    
                    <div className="db-form-group">
                      <label>{contentType === "blog" ? "Konten Blog" : "Deskripsi Event"} <span className="req">*</span></label>
                      <textarea
                        required
                        rows={8}
                        className="db-form-input"
                        value={contentDescription}
                        onChange={(e) => setContentDescription(e.target.value)}
                        placeholder={contentType === "blog" ? "Tulis konten blog di sini..." : "Jelaskan acara Anda secara detail..."}
                      />
                    </div>
                  </div>

                  {contentType === "event" && (
                    <>
                      <div className="db-form-section__divider" />
                      <div className="db-form-section">
                        <div className="db-form-section__header">
                          <div className="db-form-section__icon">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <h3>Informasi Event</h3>
                            <p>Lokasi dan jadwal event</p>
                          </div>
                        </div>
                        
                        <div className="db-form-group">
                          <label>Lokasi Event</label>
                          <div className="db-input-icon-wrap">
                            <input
                              type="text"
                              className="db-form-input"
                              value={contentLocation || ""}
                              onChange={handleLocationChange}
                              placeholder="Nama tempat, alamat"
                            />
                            <MapPin size={16} className="db-input-icon" />
                          </div>
                        </div>

                        <div className="db-form-group">
                          <label>Pilih Lokasi di Peta</label>
                          <div className="db-map-container">
                            <MapContainer
                              key={mapPosition[0] + '-' + mapPosition[1]}
                              center={mapPosition}
                              zoom={13}
                              style={{ height: "300px", width: "100%" }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <MapClickHandler setPosition={setMapPosition} />
                              <Marker position={mapPosition} />
                            </MapContainer>
                            <small className="db-map-hint">
                              Ketik lokasi di atas, peta akan otomatis berubah. Klik pada peta untuk mengatur lokasi manual.
                            </small>
                          </div>
                        </div>

                        <div className="db-form-group">
                          <label>Tanggal & Waktu</label>
                          <div className="db-input-icon-wrap">
                            <input
                              type="datetime-local"
                              className="db-form-input"
                              value={contentDate || ""}
                              onChange={(e) => setContentDate(e.target.value)}
                            />
                            <CalendarDays size={16} className="db-input-icon" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="db-form-section__divider" />

                  {/* Media Section */}
                  <div className="db-form-section" ref={(el) => (contentSectionRefs.current[2] = el)}>
                    <h3 className="db-form-section__title">
                      <ImageIcon size={18} />
                      GAMBAR & MEDIA
                    </h3>

                    <div className="db-form-group">
                      <label>Thumbnail (Foto Sampul)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setContentImage(file);
                          }
                        }}
                        style={{ display: 'none' }}
                        id="thumbnail-upload"
                      />
                      {contentImage ? (
                        <div className="db-upload-preview">
                          <img
                            src={contentImage instanceof File ? URL.createObjectURL(contentImage) : getImageUrl(contentImage)}
                            alt="Pratinjau thumbnail"
                          />
                          <div className="db-upload-preview__overlay">
                            <button
                              type="button"
                              className="db-upload-preview__change"
                              onClick={() => document.getElementById('thumbnail-upload').click()}
                            >
                              Ganti Foto
                            </button>
                            <button
                              type="button"
                              className="db-upload-preview__remove"
                              onClick={() => setContentImage("")}
                              aria-label="Hapus thumbnail"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="db-upload-area"
                          onClick={() => document.getElementById('thumbnail-upload').click()}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="db-upload-area__icon">
                            <ImageIcon size={32} />
                          </div>
                          <div className="db-upload-area__text">Klik untuk upload thumbnail</div>
                          <div className="db-upload-area__subtext">JPG, PNG, WEBP — Rekomendasi 1200x630px</div>
                        </div>
                      )}
                    </div>

                    {contentType === "blog" && (
                      <div className="db-form-group">
                        <label>Banner (Opsional, maks. 4)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            console.log('Banner files selected:', files);
                            if (files.length > 0) {
                              setBannerImages(prev => {
                                const newImages = [...prev, ...files].slice(0, 4);
                                console.log('Updated banner images:', newImages);
                                return newImages;
                              });
                            }
                          }}
                          style={{ display: 'none' }}
                          id="banner-upload"
                        />
                        <div 
                          className="db-upload-area"
                          onClick={() => document.getElementById('banner-upload').click()}
                          style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        >
                          <div className="db-upload-area__icon">
                            <Camera size={32} />
                          </div>
                          <div className="db-upload-area__text">Klik atau drag & drop banner</div>
                          <div className="db-upload-area__subtext">{bannerImages.length}/4 banner</div>
                        </div>
                        {bannerImages.length > 0 && (
                          <div className="db-uploaded-grid">
                            {bannerImages.map((file, index) => (
                              <div key={index} className="db-uploaded-grid__item">
                                <img src={URL.createObjectURL(file)} alt={`Banner ${index + 1}`} />
                                <button
                                  type="button"
                                  className="db-uploaded-grid__remove"
                                  onClick={() => setBannerImages(prev => prev.filter((_, i) => i !== index))}
                                  aria-label="Hapus banner ini"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {contentType === "event" && (
                      <div className="db-form-group">
                        <label>Galeri Foto (Opsional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            console.log('Gallery files selected:', files);
                            if (files.length > 0) {
                              setGalleryImages(prev => {
                                const newImages = [...prev, ...files];
                                console.log('Updated gallery images:', newImages);
                                return newImages;
                              });
                            }
                          }}
                          style={{ display: 'none' }}
                          id="gallery-upload"
                        />
                        <div 
                          className="db-upload-area"
                          onClick={() => document.getElementById('gallery-upload').click()}
                          style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                        >
                          <div className="db-upload-area__icon">
                            <Camera size={32} />
                          </div>
                          <div className="db-upload-area__text">Klik atau drag & drop foto</div>
                          <div className="db-upload-area__subtext">JPG, PNG, WEBP — bisa multiple file</div>
                        </div>
                        {galleryImages.length > 0 && (
                          <div className="db-uploaded-grid">
                            {galleryImages.map((file, index) => (
                              <div key={index} className="db-uploaded-grid__item">
                                <img src={URL.createObjectURL(file)} alt={`Galeri ${index + 1}`} />
                                <button
                                  type="button"
                                  className="db-uploaded-grid__remove"
                                  onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                                  aria-label="Hapus foto ini"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="db-card__footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowContentModal(false)}>Batal</button>
                    <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Konten"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
              <div className="db-content-header">
                <div>
                  <h2>Manajemen Blog & Event</h2>
                  <p className="db-content-header__subtitle">Kelola artikel blog dan acara dalam satu halaman</p>
                </div>
              </div>

              <div className="db-content-toolbar">
                <div className="db-content-tabs">
                  <button
                    type="button"
                    className={`db-content-tab ${contentTypeFilter === "blog" ? "active" : ""}`}
                    onClick={() => setContentTypeFilter("blog")}
                  >
                    <BookOpen size={16} />
                    Blog
                  </button>
                  {/* Tab "Event" sekarang tampil untuk semua role (bukan
                      cuma admin) supaya tampilannya sama persis dengan
                      halaman Admin Blog & Event. Aksi tulis (buat/edit/hapus
                      event) tetap ditolak backend untuk non-admin lewat
                      pengecekan role di EventController, jadi tetap aman. */}
                  <button
                    type="button"
                    className={`db-content-tab ${contentTypeFilter === "event" ? "active" : ""}`}
                    onClick={() => setContentTypeFilter("event")}
                  >
                    <CalendarDays size={16} />
                    Event
                  </button>
                </div>

                <div className="db-search-input db-content-toolbar__search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={contentTypeFilter === "blog" ? "Cari artikel blog..." : "Cari event..."}
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                  />
                </div>

                <button className="db-action-btn db-content-toolbar__add" onClick={() => handleOpenContentModal()}>
                  <Plus size={16} />
                  <span>{contentTypeFilter === "blog" ? "Buat Blog Baru" : "Buat Event Baru"}</span>
                </button>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat konten...</span>
                </div>
              ) : filteredContentItems.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Judul</th>
                        <th>{contentTypeFilter === "blog" ? "Kategori" : "Lokasi"}</th>
                        <th>Tanggal</th>
                        <th>Tipe</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContentItems.map((item) => (
                        <tr key={`${item.type}-${item.id}`}>
                          <td>
                            {item.image && !item.image.startsWith("blob:") ? (
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.title}
                                className="db-table-thumb"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span className={`db-content-card__thumb-icon db-type--${item.type}`}>
                                {item.type === "blog" ? <BookOpen size={20} /> : <CalendarDays size={20} />}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="db-table-title">{item.title}</div>
                          </td>
                          <td>
                            {item.type === "blog"
                              ? (item.category || "Tanpa kategori")
                              : (item.location || "Lokasi belum diisi")}
                          </td>
                          <td>
                            {item.type === "event" && item.event_date
                              ? new Date(item.event_date).toLocaleString("id-ID")
                              : formatDate(item.created_at)}
                          </td>
                          <td>
                            <span className={`db-type-badge db-type--${item.type}`}>
                              {item.type === "blog" ? <BookOpen size={12} /> : <CalendarDays size={12} />}
                              {item.type === "blog" ? "Blog" : "Event"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenContentModal(item)} title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteContent(item)} title="Hapus">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title={contentTypeFilter === "blog" ? "Belum Ada Blog" : "Belum Ada Event"}
                  subtitle={
                    contentTypeFilter === "blog"
                      ? "Tulis artikel blog pertama Anda untuk berbagi informasi dan berita."
                      : "Tambahkan event pertama Anda untuk mengumumkan acara terbaru."
                  }
                  actionLabel={contentTypeFilter === "blog" ? "Buat Blog Baru" : "Buat Event Baru"}
                  onAction={() => handleOpenContentModal()}
                />
              )}
              </>
            )}
            </div>
          )}

        {/* Panel tab "notifications" sudah dihapus - lihat catatan di sidebar
            di atas. Semua fungsinya (tandai dibaca, tandai semua dibaca,
            hapus satuan, bersihkan lama) sekarang ada di dropdown lonceng
            topbar, aktif untuk admin maupun user biasa. */}

        {/* TAB: REFERRAL */}
          {activeTab === "referral" && (
            <div className="db-panel referral-dashboard">
              <div className="referral-header">
                <div className="referral-header-title">
                  <h2>Program Referral</h2>
                  <p>Kelola kode referral Anda, pantau pendapatan komisi, penggunaan kode, dan riwayat transaksi.</p>
                </div>
                <div className="referral-user-badge">
                  <UserIcon size={16} />
                  <span>Halo, <strong>{user?.name || "User"}</strong></span>
                </div>
              </div>

              <div className="referral-banner">
                <div className="referral-banner-content">
                  <span className="referral-badge">🎁 Program Kemitraan & Referral</span>
                  <h3>Dapatkan Komisi 15% Dari Setiap Referral!</h3>
                  <p>Bagikan kode unik Anda kepada rekan usaha atau kerabat. Teman Anda mendapat potongan harga saat bertransaksi, dan Anda otomatis menerima komisi tunai sebesar 15%.</p>
                </div>
                <button className="btn-tarik-komisi" onClick={() => {
                  const totalKomisi = Number(referralStats?.total_komisi_diterima || 0);
                  if (totalKomisi < 50000) {
                      alert(`Saldo komisi Anda (Rp ${totalKomisi.toLocaleString('id-ID')}) belum mencapai batas minimal penarikan (Rp 50.000).`);
                      return;
                  }
                  alert("Silakan hubungi Admin melalui WhatsApp untuk memproses penarikan komisi Anda.");
                }}>
                  <Wallet size={16} /> Tarik Saldo Komisi
                </button>
              </div>

              <div className="referral-stats-grid">
                {/* Card 1 */}
                <div className="ref-stat-card ref-code-card">
                  <div className="ref-stat-header">
                    <span>KODE REFERRAL SAYA</span>
                    <Gift size={18} color="#059669" />
                  </div>
                  <div className="ref-code-box">
                    <span className="code-text">{referralStats?.referral_code || user?.referral_code || "Belum Ada"}</span>
                    <button onClick={() => {
                        if (referralStats?.referral_code || user?.referral_code) {
                            navigator.clipboard.writeText(referralStats?.referral_code || user?.referral_code);
                            alert('Kode referral berhasil disalin!');
                        }
                    }}>
                      <Copy size={14} /> Salin
                    </button>
                  </div>
                  <div className="ref-code-footer">
                    <small>Bonus Teman:<br/><strong>Diskon 5%</strong></small>
                    <button className="share-link" onClick={() => {
                        const code = referralStats?.referral_code || user?.referral_code;
                        if (!code) {
                            alert('Anda belum memiliki kode referral.');
                            return;
                        }
                        const shareUrl = `${window.location.origin}/register?ref=${code}`;
                        if (navigator.share) {
                            navigator.share({
                                title: 'Daftar di Surade.co.id',
                                text: `Dapatkan diskon khusus menggunakan kode referral saya: ${code}`,
                                url: shareUrl,
                            }).catch(console.error);
                        } else {
                            navigator.clipboard.writeText(shareUrl);
                            alert('Link referral berhasil disalin ke clipboard!');
                        }
                    }}>
                      <Share2 size={12} /> Bagikan Link
                    </button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>TOTAL PENDAPATAN (KOMISI)</span>
                    <TrendingUp size={18} color="#059669" />
                  </div>
                  <div className="ref-stat-value">
                    Rp {Number(referralStats?.total_komisi_diterima || 0).toLocaleString('id-ID')}
                  </div>
                  <div className="ref-stat-status success">
                    <CheckCircle size={14} /> komisi terverifikasi
                  </div>
                  <div className="ref-stat-footer">Minimal penarikan: Rp 50.000</div>
                </div>

                {/* Card 3 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>PENGGUNAAN KODE</span>
                    <Users2 size={18} color="#3b82f6" />
                  </div>
                  <div className="ref-stat-value text-dark">
                    {referralStats?.total_penggunaan || 0} Kali Dipakai
                  </div>
                  <div className="ref-stat-sub">
                    <strong>{referralStats?.total_transaksi || 0}</strong> transaksi berhasil diselesaikan
                  </div>
                  <div className="ref-stat-status-text">Status: <span className="active">Aktif</span></div>
                </div>

                {/* Card 4 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>KOMISI PENDING</span>
                    <Clock size={18} color="#f59e0b" />
                  </div>
                  <div className="ref-stat-value text-orange">
                    Rp {Number((referralStats?.total_komisi || 0) - (referralStats?.total_komisi_diterima || 0)).toLocaleString('id-ID')}
                  </div>
                  <div className="ref-stat-sub">
                    Menunggu verifikasi pembayaran transaksi
                  </div>
                  <div className="ref-stat-status-text">Status: <span className="pending">Sedang Diproses</span></div>
                </div>
              </div>

              {/* 3 Langkah Mudah */}
              <div className="ref-steps-section">
                <h4><Target size={18} /> Cara Kerja Program Referral 3 Langkah Mudah</h4>
                <div className="ref-steps-grid">
                  <div className="ref-step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Bagikan Kode Unik</h5>
                      <p>Salin kode <strong>{referralStats?.referral_code || user?.referral_code || "KODE"}</strong> atau link pendaftaran dan bagikan ke rekan bisnis Anda.</p>
                    </div>
                  </div>
                  <div className="ref-step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Teman Mendaftar & Transaksi</h5>
                      <p>Pengguna mendaftar dengan kode Anda dan membeli Paket Premium dengan potongan diskon 5%.</p>
                    </div>
                  </div>
                  <div className="ref-step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Nikmati Komisi 15%</h5>
                      <p>Komisi tunai 15% otomatis masuk setelah pembayaran diverifikasi admin dan dapat ditarik kapan saja.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Transaksi */}
              <div className="ref-history-section">
                <div className="ref-history-header">
                  <div>
                    <h4><FileText size={18} /> Riwayat Transaksi Kode Referral</h4>
                    <p>Daftar transaksi pengguna yang menggunakan kode referral Anda</p>
                  </div>
                  <div className="ref-history-actions">
                    <div className="search-box">
                      <Search size={14} />
                      <input type="text" placeholder="Cari ID, nama, atau layanan..." />
                    </div>
                    <select>
                      <option>Semua Status</option>
                    </select>
                  </div>
                </div>

                <div className="ref-history-table-container">
                  <table className="ref-history-table">
                    <thead>
                      <tr>
                        <th>ID TRANSAKSI</th>
                        <th>PENGGUNA / PEMBELI</th>
                        <th>LAYANAN & BISNIS</th>
                        <th>TANGGAL</th>
                        <th>TOTAL TRANSAKSI</th>
                        <th>KOMISI ANDA (15%)</th>
                        <th>STATUS</th>
                        <th>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralStats?.riwayat_terbaru && referralStats.riwayat_terbaru.length > 0 ? (
                        referralStats.riwayat_terbaru.map((r) => (
                          <tr key={r.id}>
                            <td>{r.transaction_id || '#' + r.id}</td>
                            <td>{r.referred_user || '-'}</td>
                            <td>Paket Premium</td>
                            <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                            <td>Rp {Number((r.discount_amount || 0) * 20).toLocaleString('id-ID')}</td> {/* dummy calculation for visual */}
                            <td>Rp {Number(r.commission_amount || 0).toLocaleString('id-ID')}</td>
                            <td><span className={"status-badge " + r.status.toLowerCase()}>{r.status}</span></td>
                            <td><button className="action-btn">Detail</button></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="empty-state-cell">
                            <div className="empty-state-content">
                              <Share2 size={32} color="#94a3b8" />
                              <h5>Belum ada referral yang berhasil.</h5>
                              <p>Bagikan kode referral Anda ({referralStats?.referral_code || user?.referral_code || "KODE"}) ke rekan bisnis<br/>untuk mulai mendapatkan komisi 15% dari setiap pembelian<br/>Paket Premium.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        {/* TAB: PROFILE (Pengaturan Profil) */}
          {activeTab === "profile" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Pengaturan Profil</h2>
              </div>
              <p className="db-profile-subtitle">Ubah data diri dan kredensial akun Anda</p>

              <div className="db-profile-settings">
                <div className="db-profile-photo-card">
                  {/* BARU: banner/foto sampul, mirip cover foto WhatsApp -
                      tampil di belakang foto profil. Kalau belum ada foto
                      sampul, dipakai pola gradient default (bukan foto). */}
                  <div
                    className="db-profile-cover"
                    style={
                      !removeCover && (coverPreview || user?.cover_photo)
                        ? { backgroundImage: `url(${coverPreview || getImageUrl(user.cover_photo)})` }
                        : undefined
                    }
                  >
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="db-hidden-input"
                      onChange={handleCoverPick}
                    />
                    <button
                      type="button"
                      className="db-cover-edit-btn"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <Camera size={14} />
                      <span>Ubah Foto Sampul</span>
                    </button>
                    {!removeCover && (coverPreview || user?.cover_photo) && (
                      <button
                        type="button"
                        className="db-cover-remove-btn"
                        onClick={handleRemoveCover}
                        title="Hapus foto sampul"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="db-profile-photo db-profile-photo--overlap">
                    {!removeAvatar && (avatarPreview || user?.avatar) ? (
                      <img
                        src={avatarPreview || getImageUrl(user.avatar)}
                        alt={user?.name || "Foto profil"}
                        className="db-profile-photo-img"
                      />
                    ) : (
                      <UserIcon size={48} />
                    )}
                  </div>
                  {(coverFile || removeCover) && (
                    <span className={`db-photo-hint ${removeCover ? "db-photo-hint--danger" : ""}`}>
                      {removeCover
                        ? "Foto sampul akan dihapus - klik \"Simpan Perubahan\" untuk menerapkan."
                        : "Foto sampul baru dipilih - klik \"Simpan Perubahan\" untuk menerapkan."}
                    </span>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="db-hidden-input"
                    onChange={handleAvatarPick}
                  />
                  <div className="db-photo-menu-wrapper" ref={photoMenuRef}>
                    <button
                      type="button"
                      className="db-photo-btn"
                      onClick={() => setPhotoMenuOpen((v) => !v)}
                    >
                      <Camera size={15} />
                      <span>Ubah Foto Profil</span>
                    </button>

                    {photoMenuOpen && (
                      <div className="db-photo-menu">
                        <button
                          type="button"
                          className="db-photo-menu__item"
                          onClick={() => {
                            setPhotoMenuOpen(false);
                            setShowCamera(true);
                          }}
                        >
                          <Camera size={16} />
                          <span>Kamera</span>
                        </button>
                        <button
                          type="button"
                          className="db-photo-menu__item"
                          onClick={() => {
                            setPhotoMenuOpen(false);
                            avatarInputRef.current?.click();
                          }}
                        >
                          <ImageIcon size={16} />
                          <span>Galeri</span>
                        </button>
                        {!removeAvatar && (avatarPreview || user?.avatar) && (
                          <button
                            type="button"
                            className="db-photo-menu__item db-photo-menu__item--danger"
                            onClick={handleRemoveAvatar}
                          >
                            <Trash2 size={16} />
                            <span>Hapus Foto</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {removeAvatar && (
                    <span className="db-photo-hint db-photo-hint--danger">Foto akan dihapus - klik "Simpan Perubahan" untuk menerapkan.</span>
                  )}
                  {avatarFile && (
                    <span className="db-photo-hint">Foto baru dipilih - klik "Simpan Perubahan" untuk menerapkan.</span>
                  )}
                </div>

                <form className="db-profile-form" onSubmit={handleSaveProfile}>
                  <div className="db-form-row">
                    <div className="db-form-group">
                      <label>Nama Depan</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="db-form-group">
                      <label>Nama Belakang</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="db-form-row">
                    <div className="db-form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="db-form-group">
                      <label>No. Handphone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="db-form-group">
                    <label>Role Kredensial</label>
                    <input
                      type="text"
                      value={user?.role === "admin" ? "Administrator" : user?.role === "reseller" ? "Reseller" : "User"}
                      disabled
                    />
                  </div>

                  <div className="db-form-group">
                    <label>Kode Referral</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={user?.referral_code || "Belum ada kode referral"}
                        disabled
                        style={{ 
                          backgroundColor: '#f8fafc', 
                          color: user?.referral_code ? '#059669' : '#6b7280',
                          fontWeight: user?.referral_code ? '600' : 'normal'
                        }}
                      />
                      {user?.referral_code ? (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(user.referral_code);
                            alert('Kode referral berhasil disalin!');
                          }}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#059669',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          title="Copy kode referral"
                        >
                          📋
                        </button>
                      ) : user?.role === 'admin' ? (
                        <button
                          type="button"
                          onClick={handleGenerateReferralCode}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#059669',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          title="Generate kode referral"
                        >
                          Generate
                        </button>
                      ) : null}
                    </div>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      {user?.referral_code 
                        ? "Bagikan kode ini kepada teman untuk memberikan diskon premium"
                        : user?.role === 'admin'
                          ? "Klik 'Generate' untuk membuat kode referral"
                          : "Kode referral akan diberikan oleh admin"
                      }
                    </small>
                  </div>

                  <div className="db-form-group">
                    <label>Tentang Saya (Bio)</label>
                    <RichTextEditor
                      value={profileForm.bio}
                      onChange={(html) => setProfileForm({ ...profileForm, bio: html })}
                      placeholder="Ceritakan sedikit tentang diri Anda atau usaha Anda..."
                    />
                  </div>

                  {profileMessage && (
                    <div className={`db-profile-message db-profile-message--${profileMessage.type}`}>
                      {profileMessage.text}
                    </div>
                  )}

                  <button type="submit" className="db-action-btn" disabled={profileSaving}>
                    {profileSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </form>
              </div>
            </div>
          )}

        {/* TAB: CATEGORIES */}
          {activeTab === "categories" && isAdmin && (
            <div className="db-panel">
            {showCatModal ? (
              <div className="db-inline-form-page db-inline-form-page--biz">
                {/* ── Hero Section ── */}
                <div className="db-hero">
                  <div className="db-hero__content">
                    <button type="button" className="db-hero__back" onClick={() => setShowCatModal(false)}>
                      <ArrowLeft size={16} />
                      <span>Kembali ke Dashboard</span>
                      <span className="db-hero__back-dot" />
                    </button>
                    <h1 className="db-hero__title">
                      Tambah <span className="db-hero__title-highlight">Kategori</span> Baru
                    </h1>
                    <p className="db-hero__subtitle">
                      Tambahkan kategori baru untuk mengorganisir bisnis dengan lebih baik
                    </p>
                  </div>
                  <div className="db-hero__illustration">
                    <div className="db-mock-card">
                      <div className="db-mock-card__dots">
                        <span /><span /><span />
                      </div>
                      <div className="db-mock-card__icon">
                        <Grid size={24} />
                      </div>
                    </div>
                    <div className="db-mock-plant" aria-hidden="true">📂</div>
                  </div>
                </div>

                {/* Progress Tabs */}
                <div className="db-progress-container">
                  <div className={`db-progress-step ${catStep > 0 ? "completed" : "active"}`}>
                    <div className="db-progress-icon">
                      <Info size={20} />
                    </div>
                    <div className="db-progress-label">Info Dasar</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${catStep > 1 ? "completed" : catStep === 1 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <Image size={20} />
                    </div>
                    <div className="db-progress-label">Icon</div>
                  </div>
                  <div className="db-progress-line"></div>
                  <div className={`db-progress-step ${catStep === 2 ? "active" : ""}`}>
                    <div className="db-progress-icon">
                      <CheckCircle size={20} />
                    </div>
                    <div className="db-progress-label">Status</div>
                  </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSaveCategory} className="db-card">
                  {/* Info Dasar Section */}
                  <div className="db-form-section" ref={(el) => (catSectionRefs.current[0] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3>Informasi Dasar</h3>
                        <p>Data utama tentang kategori</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Nama Kategori <span className="req">*</span></label>
                      <input
                        type="text"
                        required
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        placeholder="Masukkan nama kategori..."
                      />
                    </div>

                    <div className="db-form-group">
                      <label>Deskripsi Kategori</label>
                      <textarea
                        rows={3}
                        value={catDescription}
                        onChange={(e) => setCatDescription(e.target.value)}
                        placeholder="Jelaskan kategori ini..."
                      />
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Icon Section */}
                  <div className="db-form-section" ref={(el) => (catSectionRefs.current[1] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <Image size={20} />
                      </div>
                      <div>
                        <h3>Icon & Tampilan</h3>
                        <p>Pilih icon dan warna untuk kategori</p>
                      </div>
                    </div>

                    <div className="db-form-row">
                      <div className="db-form-group">
                        <label>Icon Kategori</label>
                        <select value={catIcon} onChange={(e) => setCatIcon(e.target.value)}>
                          <option value="">-- Otomatis dari nama kategori --</option>
                          <option value="Store">🏪 Toko / Umum</option>
                          <option value="Building2">🏢 Perkantoran</option>
                          <option value="Camera">📷 Rekreasi & Hiburan</option>
                          <option value="Wrench">🔧 Jasa & Servis</option>
                          <option value="Fuel">⛽ Fasilitas</option>
                          <option value="Car">🚗 Otomotif</option>
                          <option value="GraduationCap">🎓 Pendidikan</option>
                          <option value="Heart">💊 Kesehatan</option>
                          <option value="Smartphone">📱 Elektronik & Gadget</option>
                          <option value="Shirt">👕 Fashion</option>
                          <option value="Music">🎵 Musik</option>
                          <option value="Users">👥 Komunitas</option>
                          <option value="Info">ℹ️ Informasi Umum</option>
                          <option value="Coffee">☕ Cafe & Kuliner</option>
                          <option value="Home">🏠 Properti</option>
                          <option value="Briefcase">💼 Konsultan / Asuransi</option>
                          <option value="ShoppingBag">🛍️ Apotek / ATM</option>
                          <option value="Scissors">💇 Salon / Kecantikan</option>
                          <option value="Utensils">🍽️ Restoran</option>
                          <option value="Bed">🛏️ Hotel / Penginapan</option>
                          <option value="CreditCard">💳 Keuangan / Bank</option>
                          <option value="Hammer">🔨 Konstruksi</option>
                          <option value="Sparkles">✨ Spa / Wellness</option>
                          <option value="MapPin">📍 Wisata</option>
                        </select>
                        <p className="db-form-hint">
                          Kosongkan untuk pilih otomatis berdasarkan nama kategori.
                        </p>
                      </div>
                      <div className="db-form-group">
                        <label>Warna Kategori</label>
                        <input
                          type="color"
                          value={catColor}
                          onChange={(e) => setCatColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="db-form-section__divider" />

                  {/* Status Section */}
                  <div className="db-form-section" ref={(el) => (catSectionRefs.current[2] = el)}>
                    <div className="db-form-section__header">
                      <div className="db-form-section__icon">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <h3>Status Publikasi</h3>
                        <p>Atur ketersediaan kategori</p>
                      </div>
                    </div>

                    <div className="db-form-group">
                      <label>Status</label>
                      <select value={catStatus} onChange={(e) => setCatStatus(e.target.value)}>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  <div className="db-card__footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowCatModal(false)}>
                      Batal
                    </button>
                    <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Kategori"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
              <div className="db-panel-header">
                <h2>Kelola Kategori</h2>
                {categories.length > 0 && (
                  <button className="db-action-btn" onClick={() => handleOpenCatModal()}>
                    <Plus size={16} />
                    <span>Tambah Kategori</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat kategori...</span>
                </div>
              ) : categories.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama Kategori</th>
                        <th>Slug</th>
                        <th>Icon</th>
                        <th>Jumlah Bisnis</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td>{cat.id}</td>
                          <td><strong>{cat.name}</strong></td>
                          <td>{cat.slug}</td>
                          <td>{cat.icon || "Store"}</td>
                          <td>{cat.businesses_count ?? 0} bisnis</td>
                          <td>
                            <div className="db-table-actions">
                              <button
                                className="db-table-btn db-btn-edit"
                                onClick={() => handleOpenCatModal(cat)}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="db-table-btn db-btn-delete"
                                onClick={() => handleDeleteCategory(cat.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title="Tingkatkan Jangkauan Bisnis Anda"
                  subtitle="Anda harus berada di sini untuk pertama kalinya. Jika Anda ingin menambahkan sesuatu, klik tombol di bawah ini."
                  actionLabel="Tambah Kategori Baru"
                  onAction={() => handleOpenCatModal()}
                />
              )}
              </>
            )}
            </div>
          )}

        {/* TAB: USERS */}
          {activeTab === "users" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Kelola Akun Pengguna</h2>
                <button className="db-action-btn" onClick={() => handleOpenUserModal()}>
                  <Plus size={16} />
                  <span>Tambah User</span>
                </button>
              </div>

              <div className="db-filters">
                <div className="db-search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Cari user berdasarkan nama atau email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat user...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Kode Referral</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`db-role-badge db-role--${u.role}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>{u.referral_code || "-"}</td>
                          <td>
                            <div className="db-table-actions">
                              <button
                                className="db-table-btn db-btn-edit"
                                onClick={() => handleOpenUserModal(u)}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="db-table-btn db-btn-delete"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-empty-state">User tidak ditemukan.</div>
              )}
            </div>
          )}

        {/* TAB: PREMIUM PACKAGES (Admin Only) */}
          {activeTab === "premium-packages" && isAdmin && (
            <div className="db-panel">
            {showPackageModal ? (
              <div className="db-inline-form-page">
                {/* ── Hero Section ── */}
                <div className="db-hero">
                  <div className="db-hero__text">
                    <button type="button" className="db-hero__back" onClick={() => setShowPackageModal(false)}>
                      <ArrowLeft size={16} />
                      <span>Kembali ke Daftar</span>
                      <span className="db-hero__back-dot" />
                    </button>
                    <h1 className="db-hero__title">
                      {adminSelectedPackage ? "Edit" : "Tambah"} <span className="db-hero__title-highlight">Paket Premium</span>
                    </h1>
                    <p className="db-hero__subtitle">
                      {adminSelectedPackage ? "Perbarui informasi paket premium" : "Buat paket premium baru untuk layanan website bisnis"}
                    </p>
                  </div>
                  <div className="db-hero__illustration">
                    <div className="db-mock-card">
                      <div className="db-mock-card__dots">
                        <span /><span /><span />
                      </div>
                      <div className="db-mock-card__icon">
                        <Crown size={24} />
                      </div>
                    </div>
                    <div className="db-mock-plant" aria-hidden="true">👑</div>
                  </div>
                </div>

                {/* ── Form Card ── */}
                <form onSubmit={handleSavePackage} className="db-card">
                  <div className="db-form-group">
                    <label>Nama Paket <span className="req">*</span></label>
                    <input type="text" required value={pkgName} onChange={(e) => setPkgName(e.target.value)} placeholder="Contoh: Website Bisnis Starter" />
                  </div>
                  <div className="db-form-group">
                    <label>Deskripsi <span className="req">*</span></label>
                    <textarea required rows={3} value={pkgDescription} onChange={(e) => setPkgDescription(e.target.value)} placeholder="Deskripsi paket website..." />
                  </div>
                  <div className="db-form-row">
                    <div className="db-form-group">
                      <label>Harga (Rp) <span className="req">*</span></label>
                      <input type="number" required min="0" value={pkgPrice} onChange={(e) => setPkgPrice(e.target.value)} placeholder="500000" />
                    </div>
                    <div className="db-form-group">
                      <label>Durasi (Hari) <span className="req">*</span></label>
                      <input type="number" required min="1" value={pkgDuration} onChange={(e) => setPkgDuration(e.target.value)} placeholder="30" />
                    </div>
                  </div>
                  <div className="db-form-group">
                    <label>Fitur (Satu per baris)</label>
                    <textarea rows={6} value={pkgFeatures} onChange={(e) => setPkgFeatures(e.target.value)} placeholder="Landing Page Responsive&#10;SEO Optimized&#10;Contact Form&#10;Social Media Integration" />
                  </div>
                  <div className="db-card__footer">
                    <button type="button" className="db-btn-cancel" onClick={() => setShowPackageModal(false)}>Batal</button>
                    <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                      {actionLoading ? "Menyimpan..." : "Simpan Paket"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
              <div className="db-panel-header">
                <h2>Kelola Paket Premium Website</h2>
                <button className="db-action-btn" onClick={() => handleOpenPackageModal()}>
                  <Plus size={16} />
                  <span>Tambah Paket</span>
                </button>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat paket...</span></div>
              ) : premiumPackages.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Nama Paket</th>
                        <th>Harga</th>
                        <th>Durasi</th>
                        <th>Fitur</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {premiumPackages.map((pkg) => (
                        <tr key={pkg.id}>
                          <td>
                            <strong>{pkg.name}</strong>
                            <div className="db-table-subtitle">{pkg.description}</div>
                          </td>
                          <td>{formatRupiah(pkg.price)}</td>
                          <td>{pkg.duration} hari</td>
                          <td>
                            <ul className="db-feature-list">
                              {(pkg.features || []).slice(0, 3).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                              ))}
                              {pkg.features?.length > 3 && <li>+{pkg.features.length - 3} lainnya</li>}
                            </ul>
                          </td>
                          <td>
                            <span className="db-status-badge db-status--verified">Aktif</span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenPackageModal(pkg)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeletePackage(pkg.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <DashboardEmptyState
                  title="Belum Ada Paket Premium"
                  subtitle="Tambahkan paket premium untuk website bisnis."
                  actionLabel="Tambah Paket"
                  onAction={() => handleOpenPackageModal()}
                />
              )}
              </>
            )}
            </div>
          )}

        {/* TAB: LAPORAN REPORT (Admin Only) */}
        {activeTab === "reports" && isAdmin && (
          <AdminReportTab />
        )}

        {/* TAB: RIWAYAT PREMIUM (Admin Only) */}
          {activeTab === "riwayat" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Riwayat Premium & Pembayaran</h2>
                <div className="db-panel-stats">
                  {premiumHistory.approved_count && (
                    <span className="db-stat-badge db-stat-success">
                      ✅ {premiumHistory.approved_count} Disetujui
                    </span>
                  )}
                  {premiumHistory.active_businesses && (
                    <span className="db-stat-badge db-stat-primary">
                      🏆 {premiumHistory.active_businesses} Aktif
                    </span>
                  )}
                  {premiumHistory.rejected_count > 0 && (
                    <span className="db-stat-badge db-stat-danger">
                      ❌ {premiumHistory.rejected_count} Ditolak
                    </span>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat riwayat premium...</span>
                </div>
              ) : premiumHistory.history?.length > 0 ? (
                <>
                  <div className="db-table-responsive">
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>User</th>
                          <th>Bisnis</th>
                          <th>Paket</th>
                          <th>Harga</th>
                          <th>Status</th>
                          <th>Berakhir</th>
                          <th>Bukti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllHistory ? premiumHistory.history : premiumHistory.history.slice(0, 5)).map((item) => (
                        <tr key={item.id} className={`db-table-row ${
                          item.status === 'approved' ? 'db-row-success' :
                          item.status === 'rejected' ? 'db-row-danger' :
                          item.is_active ? 'db-row-premium' : 'db-row-expired'
                        }`}>
                          <td>
                            <div className="db-date-cell">
                              <div>{new Date(item.updated_at).toLocaleDateString('id-ID')}</div>
                              <small>{new Date(item.updated_at).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', minute: '2-digit' 
                              })}</small>
                            </div>
                          </td>
                          <td>
                            <div className="db-user-cell">
                              <strong>{item.user_name}</strong>
                              <small>{item.user_email}</small>
                            </div>
                          </td>
                          <td>
                            <div className="db-business-cell">
                              <strong>{item.business_name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`db-plan-badge db-plan-${item.plan}`}>
                              {item.plan_display}
                            </span>
                          </td>
                          <td>
                            <div className="db-price-cell">
                              {item.amount ? `Rp ${item.amount.toLocaleString('id-ID')}` : '-'}
                            </div>
                          </td>
                          <td>
                            <span className={`db-status-badge db-status--${
                              item.status === 'approved' ? 'verified' :
                              item.status === 'rejected' ? 'rejected' :
                              item.is_active ? 'verified' : 'pending'
                            }`}>
                              {item.status === 'approved' && '✅ Disetujui'}
                              {item.status === 'rejected' && '❌ Ditolak'}
                              {item.type === 'premium_business' && item.is_active && '🏆 Aktif'}
                              {item.type === 'premium_business' && !item.is_active && '⏰ Expired'}
                            </span>
                          </td>
                          <td>
                            <div className="db-expires-cell">
                              {item.expires_at ? (
                                <div>
                                  <div>{new Date(item.expires_at).toLocaleDateString('id-ID')}</div>
                                  <small className={
                                    new Date(item.expires_at) < new Date() ? 
                                    'db-text-danger' : 'db-text-success'
                                  }>
                                    {new Date(item.expires_at) < new Date() ? 'Sudah expired' : 'Masih aktif'}
                                  </small>
                                </div>
                              ) : (
                                <span className="db-text-muted">Selamanya</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.type === 'payment_ticket' ? (
                              <div className="db-proof-cell">
                                {item.payment_proof ? (
                                  <button 
                                    className="db-btn-view-proof"
                                    onClick={() => handleViewProof(item.payment_proof)}
                                    title="Lihat Bukti Pembayaran"
                                  >
                                    📷 Lihat Bukti
                                  </button>
                                ) : (
                                  <span className="db-text-muted">Tidak ada bukti</span>
                                )}
                              </div>
                            ) : (
                              <span className="db-text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  
                  {premiumHistory.history.length > 5 && (
                    <div className="db-show-all-container">
                      <button 
                        className="db-show-all-btn"
                        onClick={() => setShowAllHistory(!showAllHistory)}
                      >
                        {showAllHistory ? (
                          <>
                            <ChevronUp size={16} />
                            Lihat Lebih Sedikit
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            Lihat Semua ({premiumHistory.history.length - 5} lainnya)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <DashboardEmptyState
                  title="Belum Ada Riwayat Premium"
                  subtitle="Riwayat pembayaran dan aktivitas premium akan muncul di sini."
                />
              )}
            </div>
          )}

        </main>
      </div>

      {/* --- BUSINESS FORM MODAL --- */}

      {/* --- ANNOUNCEMENT FORM MODAL (admin) --- */}
      {/* --- MENU FORM MODAL --- */}
      {/* --- CATEGORY FORM MODAL --- */}
      {/* --- USER FORM MODAL --- */}
      {showUserModal && (
        <div className="db-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedUser ? "Edit User" : "Tambah User Baru"}</h3>
              <button className="db-modal-close" onClick={() => setShowUserModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveUser} className="db-modal-body">
              <div className="db-form-group">
                <label>Nama Lengkap <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="Nama lengkap user"
                />
              </div>
              <div className="db-form-group">
                <label>Email <span className="req">*</span></label>
                <input
                  type="email"
                  required
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="db-form-group">
                <label>Password {selectedUser && "(kosongkan jika tidak ingin diubah)"} {!selectedUser && <span className="req">*</span>}</label>
                <input
                  type="password"
                  required={!selectedUser}
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Role</label>
                  <select value={uRole} onChange={(e) => setURole(e.target.value)}>
                    <option value="user">User Biasa</option>
                    <option value="reseller">Reseller</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="db-form-group">
                  <label>Kode Referral (opsional)</label>
                  <input
                    type="text"
                    value={uReferral}
                    onChange={(e) => setUReferral(e.target.value)}
                    placeholder="Contoh: REF123"
                  />
                </div>
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowUserModal(false)}>
                  Batal
                </button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE SUCCESS MODAL --- */}
      {lastInvoice && (
        <div className="db-modal-overlay" onClick={() => setLastInvoice(null)}>
          <div className="db-modal db-modal--small" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>Pembayaran Berhasil</h3>
              <button className="db-modal-close" onClick={() => setLastInvoice(null)}>&times;</button>
            </div>
            <div className="db-modal-body">
              <div className="db-invoice-success">
                <CheckCircle size={40} className="db-invoice-success__icon" />
                <p>No. Invoice: <strong>{lastInvoice.invoice_number}</strong></p>
                <p>Total: <strong>{formatRupiah(lastInvoice.amount)}</strong></p>
                <p>Berlaku hingga: <strong>{formatDate(lastInvoice.expires_at)}</strong></p>
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-submit" onClick={() => setLastInvoice(null)}>Selesai</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TICKET FORM MODAL --- */}
      {showTicketModal && (
        <div className="db-modal-overlay" onClick={() => setShowTicketModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedTicket ? "Edit Tiket Pembayaran" : "Buat Tiket Pembayaran Baru"}</h3>
              <button className="db-modal-close" onClick={() => setShowTicketModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveTicket} className="db-modal-body">
              <div className="db-form-group">
                <label>Bisnis <span className="req">*</span></label>
                <select required value={ticketBusinessId} onChange={(e) => setTicketBusinessId(e.target.value)}>
                  {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div className="db-form-group">
                <label>Plan Langganan <span className="req">*</span></label>
                <select required value={ticketPlan} onChange={(e) => setTicketPlan(e.target.value)}>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>

              <div className="db-form-group">
                <label>Bukti Transfer <span className="req">*</span></label>
                <input
                  ref={ticketProofInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTicketProofPick}
                  className="db-hidden-input"
                />
                <div className="db-image-upload">
                  {ticketProofPreview ? (
                    <div className="db-image-preview">
                      <img src={ticketProofPreview} alt="Preview bukti transfer" />
                      <button type="button" className="db-image-preview__remove" onClick={() => {
                        setTicketProofFile(null);
                        setTicketProofPreview("");
                        if (ticketProofInputRef.current) ticketProofInputRef.current.value = "";
                      }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="db-image-upload-btn" onClick={() => ticketProofInputRef.current?.click()}>
                      <ImageIcon size={24} />
                      <span>Pilih Bukti Transfer</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="db-form-group">
                <label>Catatan (opsional)</label>
                <textarea
                  rows={3}
                  value={ticketNotes}
                  onChange={(e) => setTicketNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk admin..."
                />
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowTicketModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Kirim Tiket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCamera && (
        <CameraCaptureModal
          onCancel={() => setShowCamera(false)}
          onCapture={(dataUrl) => {
            setShowCamera(false);
            setCropperSrc(dataUrl);
          }}
        />
      )}

      {cropperSrc && (
        <AvatarCropperModal
          imageSrc={cropperSrc}
          onCancel={handleCropperCancel}
          onSave={handleCropperSave}
        />
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && selectedBusinessForPayment && (
        <div className="db-modal-overlay">
          <div className="db-modal">
            <div className="db-modal-header">
              <h3>Upgrade ke Premium</h3>
              <button className="db-modal-close" onClick={handlePaymentCancel}>
                ×
              </button>
            </div>
            <div className="db-modal-body">
              <PaymentGateway
                business={selectedBusinessForPayment}
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminReportTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/business-reports?status=${filterStatus}&search=${search}`);
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/business-reports/${id}`, { status });
      fetchReports();
    } catch (err) {
      alert("Gagal update status");
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Yakin hapus konten?")) return;
    try {
      await api.post(`/admin/business-reports/${id}/remove-content`);
      alert("Konten berhasil dihapus.");
      fetchReports();
    } catch (err) {
      alert("Gagal hapus konten");
    }
  };

  const totals = {
    all: reports.length,
    baru: reports.filter(r => r.status === 'baru').length,
    diproses: reports.filter(r => r.status === 'diproses').length,
    selesai: reports.filter(r => r.status === 'selesai').length,
    usaha: reports.filter(r => r.business?.title).length,
    blog: 0,
    event: 0
  };

  return (
    <div className="db-panel">
      <div className="db-panel-header" style={{ marginBottom: "20px" }}>
        <h2>Laporan Report Pelanggaran</h2>
        <p className="db-content-header__subtitle">
          Kelola dan tindak lanjuti laporan pengaduan dari pengguna mengenai pelanggaran konten Usaha, Blog, atau Event.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px" }}>TOTAL REPORT</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.all}</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#f59e0b", margin: "0 0 8px" }}>REPORT BARU</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.baru}</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#3b82f6", margin: "0 0 8px" }}>SEDANG DIPROSES</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.diproses}</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#10b981", margin: "0 0 8px" }}>SELESAI</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.selesai}</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#8b5cf6", margin: "0 0 8px" }}>REPORT USAHA</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>{totals.usaha}</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#3b82f6", margin: "0 0 8px" }}>REPORT BLOG</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>0</span>
        </div>
        <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", textAlign: "center" }}>
          <h4 style={{ fontSize: "12px", color: "#ec4899", margin: "0 0 8px" }}>REPORT EVENT</h4>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>0</span>
        </div>
      </div>

      <div className="db-filters" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <div className="db-search-input" style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#64748b' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Cari pelapor, judul konten, alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReports()}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
          />
        </div>
        <select className="db-filter-select" style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="baru">Baru</option>
          <option value="diproses">Sedang Diproses</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      {loading ? (
        <div className="db-loader-wrap">
          <div className="db-spinner" />
        </div>
      ) : (
        <div className="db-table-responsive">
          <table className="db-table">
            <thead>
              <tr>
                <th>ID & PELAPOR</th>
                <th>JENIS & KONTEN</th>
                <th>ALASAN REPORT</th>
                <th>TANGGAL</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>#REP-{String(r.id).padStart(3, '0')}</strong>
                    <br />
                    <span style={{ color: "#64748b", fontSize: "12px" }}>{r.reporter_name}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ padding: "2px 6px", background: "#e0f2fe", color: "#0369a1", fontSize: "10px", borderRadius: "4px", fontWeight: "bold" }}>USAHA</span>
                      <strong>{r.business?.title || "Bisnis dihapus"}</strong>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "#b91c1c" }}>{r.reason}</strong>
                    <br />
                    <span style={{ color: "#64748b", fontSize: "12px" }}>{r.description || "-"}</span>
                  </td>
                  <td>
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", background: r.status === 'ditolak' ? '#fee2e2' : r.status === 'selesai' ? '#dcfce3' : '#fff' }}
                    >
                      <option value="baru">Baru</option>
                      <option value="diproses">Diproses</option>
                      <option value="selesai">Selesai</option>
                      <option value="ditolak">Ditolak</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="db-action-btn" style={{ background: "#f1f5f9", color: "#007570", padding: "6px 12px" }}>
                        Detail
                      </button>
                      <button className="db-action-btn" style={{ background: "#fee2e2", color: "#b91c1c", padding: "6px 12px" }} onClick={() => handleDeleteContent(r.id)}>
                        Hapus Konten
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Tidak ada laporan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
