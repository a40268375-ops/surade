import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../utils/api";
import "./Dashboard.css";
import Loading from "../components/Loading";
import { DESA_LIST } from "../data/desaList";
import {
  Building2,
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
  Clock,
  Mail,
  Shield,
  Search,
  Megaphone,
  CalendarDays,
  Crown,
  Gift,
  Receipt,
  Lock,
  Home,
  ArrowLeft,
} from "lucide-react";

export default function Dashboard() {
  const { user, loading: authLoading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("businesses");
  
  // Data lists
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [events, setEvents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState({});
  const [resellerData, setResellerData] = useState(null); // legacy, unused now that Reseller tab is removed
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [savedBusinesses, setSavedBusinesses] = useState([]);

  // Loading/Error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [showBizModal, setShowBizModal] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState(null);
  
  const [showCatModal, setShowCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showSubModal, setShowSubModal] = useState(false);

  // Search/Filters
  const [bizSearch, setBizSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [adSearch, setAdSearch] = useState("");

  // Biz Form state
  const [bizTitle, setBizTitle] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizDescription, setBizDescription] = useState("");
  const [bizAddress, setBizAddress] = useState("");
  const [bizVillage, setBizVillage] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizHours, setBizHours] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizImageFile, setBizImageFile] = useState(null);
  const [bizImagePreview, setBizImagePreview] = useState("");
  const [bizGalleryFiles, setBizGalleryFiles] = useState([]); // newly-selected File objects
  const [bizGalleryPreviews, setBizGalleryPreviews] = useState([]); // { url, isExisting, path? }
  const [bizVideoUrl, setBizVideoUrl] = useState("");
  const [bizClosedDays, setBizClosedDays] = useState([]);
  const [bizTags, setBizTags] = useState("");

  const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Cat Form state
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("");

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

  useEffect(() => {
    // Wait for AuthContext to finish checking localStorage/the token before
    // deciding whether to bounce to /login - otherwise a page refresh (where
    // `user` is briefly null while the profile is re-fetched) always kicks a
    // logged-in person back out.
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [user, authLoading, activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "businesses") {
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
          api.get("/advertisements?status=verified"),
          api.get("/advertisements?status=rejected"),
        ]);
        setAds([...pending, ...approved, ...rejected]);
        const myBiz = await api.get(isAdmin ? "/businesses?status=all" : "/my-businesses");
        setBusinesses(myBiz);
      } else if (activeTab === "events") {
        const data = await api.get("/events");
        setEvents(data);
      } else if (activeTab === "premium") {
        const [myBiz, subs, planData] = await Promise.all([
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
          api.get("/subscriptions"),
          api.get("/subscription-plans"),
        ]);
        setBusinesses(myBiz);
        setSubscriptions(subs);
        setPlans(planData);
      } else if (activeTab === "booking") {
        const data = await api.get("/my-bookings");
        setBookings(data);
      } else if (activeTab === "announcements") {
        const data = await api.get("/announcements");
        setAnnouncements(data);
      } else if (activeTab === "coupons") {
        const [couponData, myBiz] = await Promise.all([
          api.get("/my-coupons"),
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
        ]);
        setCoupons(couponData);
        setBusinesses(myBiz);
      } else if (activeTab === "menu") {
        const [menuData, myBiz] = await Promise.all([
          api.get("/my-menu-items"),
          api.get(isAdmin ? "/businesses?status=all" : "/my-businesses"),
        ]);
        setMenuItems(menuData);
        setBusinesses(myBiz);
      } else if (activeTab === "inbox") {
        const data = await api.get("/my-messages");
        setMessages(data);
      } else if (activeTab === "saved") {
        const data = await api.get("/my-saved-businesses");
        setSavedBusinesses(data);
      }
      
      // Always prefetch categories for select dropdown
      const cats = await api.get("/categories");
      setCategories(cats);
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
      setLoading(false);
    }
  };

  // --- BUSINESS CRUD HANDLERS ---
  const handleOpenBizModal = (biz = null) => {
    setSelectedBiz(biz);
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
      setBizImageFile(null);
      setBizImagePreview(biz.image ? getImageUrl(biz.image) : "");
      setBizGalleryFiles([]);
      setBizGalleryPreviews(
        (biz.images || []).map((path) => ({ url: getImageUrl(path), isExisting: true, path }))
      );
      setBizVideoUrl(biz.video_url || "");
      setBizClosedDays(biz.closed_days || []);
      setBizTags((biz.tags || []).join(", "));
    } else {
      setBizTitle("");
      setBizCategory(categories[0]?.id || "");
      setBizDescription("");
      setBizAddress("");
      setBizVillage("");
      setBizPhone("");
      setBizEmail("");
      setBizHours("");
      setBizWebsite("");
      setBizImageFile(null);
      setBizImagePreview("");
      setBizGalleryFiles([]);
      setBizGalleryPreviews([]);
      setBizVideoUrl("");
      setBizClosedDays([]);
      setBizTags("");
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
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", bizTitle);
      formData.append("category_id", bizCategory);
      formData.append("description", bizDescription);
      formData.append("address", bizAddress);
      if (bizVillage) formData.append("village", bizVillage);
      formData.append("phone", bizPhone);
      if (bizEmail) formData.append("email", bizEmail);
      if (bizHours) formData.append("operating_hours", bizHours);
      if (bizWebsite) formData.append("website", bizWebsite);
      if (bizImageFile) {
        formData.append("image", bizImageFile);
      }
      if (bizVideoUrl) formData.append("video_url", bizVideoUrl);
      bizTags.split(",").map((t) => t.trim()).filter(Boolean).forEach((tag) => formData.append("tags[]", tag));
      bizClosedDays.forEach((day) => formData.append("closed_days[]", day));
      bizGalleryFiles.forEach((file) => formData.append("images[]", file));
      if (selectedBiz) {
        // Existing gallery entries the user removed in the edit modal need
        // to be deleted server-side too.
        const keptPaths = bizGalleryPreviews.filter((p) => p.isExisting).map((p) => p.path);
        const removedPaths = (selectedBiz.images || []).filter((p) => !keptPaths.includes(p));
        removedPaths.forEach((path) => formData.append("remove_gallery[]", path));
      }

      if (selectedBiz) {
        // Edit flow
        // Laravel PUT routes don't natively parse multipart/form-data. So we use POST with simulated method or handles POST endpoint.
        await api.post(`/businesses/${selectedBiz.id}`, formData);
      } else {
        // Create flow
        await api.post("/businesses", formData);
      }
      setShowBizModal(false);
      fetchInitialData();
    } catch (err) {
      console.error("handleSaveBusiness failed:", err);
      if (err?.isNetworkError) {
        alert(err.message || "Tidak dapat terhubung ke server.");
      } else if (err?.data?.errors) {
        // Laravel validation error shape: { errors: { field: ["message", ...] } }
        const messages = Object.values(err.data.errors).flat().join("\n");
        alert("Gagal menyimpan bisnis:\n\n" + messages);
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
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus bisnis.");
    }
  };

  const handleApproveBusiness = async (id) => {
    try {
      await api.post(`/admin/businesses/${id}/approve`);
      fetchInitialData();
    } catch (err) {
      alert("Gagal menyetujui bisnis.");
    }
  };

  const handleTogglePremium = async (id) => {
    try {
      await api.post(`/admin/businesses/${id}/toggle-premium`);
      fetchInitialData();
    } catch (err) {
      alert("Gagal mengubah status premium.");
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleOpenCatModal = (cat = null) => {
    setSelectedCat(cat);
    if (cat) {
      setCatName(cat.name);
      setCatIcon(cat.icon || "");
    } else {
      setCatName("");
      setCatIcon("Store");
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
      fetchInitialData();
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
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus kategori.");
    }
  };

  // --- ANNOUNCEMENT CRUD HANDLERS (admin only) ---
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState(null);
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
      fetchInitialData();
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
      fetchInitialData();
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
      fetchInitialData();
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
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus kupon.");
    }
  };

  // --- MENU CRUD HANDLERS ---
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [mnBusinessId, setMnBusinessId] = useState("");
  const [mnName, setMnName] = useState("");
  const [mnDescription, setMnDescription] = useState("");
  const [mnPrice, setMnPrice] = useState("");
  const [mnImage, setMnImage] = useState(null);

  const handleOpenMenuModal = (item = null) => {
    const myBiz = businesses.filter((b) => isAdmin || b.user_id === user?.id);
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
      formData.append("price", mnPrice);
      if (mnImage) formData.append("image", mnImage);

      if (selectedMenu) {
        await api.post(`/menu-items/${selectedMenu.id}`, formData);
      } else {
        await api.post("/menu-items", formData);
      }
      setShowMenuModal(false);
      fetchInitialData();
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
      fetchInitialData();
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
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus pesan.");
    }
  };

  // --- SAVED (Simpan) HANDLERS ---
  const handleUnsaveBusiness = async (id) => {
    if (!confirm("Hapus dari daftar simpanan?")) return;
    try {
      await api.delete(`/saved-businesses/${id}`);
      fetchInitialData();
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
      fetchInitialData();
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
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus user.");
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
    } else {
      setAdTitle("");
      setAdCategory(categories[0]?.id || "");
      setAdDescription("");
      setAdCompany("");
      setAdLocation("");
      setAdPhone("");
      setAdWebsite("");
    }
    setShowAdModal(true);
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        title: adTitle,
        category_id: adCategory,
        description: adDescription,
        company_name: adCompany,
        location: adLocation,
        phone: adPhone,
        website: adWebsite,
      };
      if (selectedAd) {
        await api.put(`/advertisements/${selectedAd.id}`, payload);
      } else {
        await api.post("/advertisements", payload);
      }
      setShowAdModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err?.data?.message || "Gagal menyimpan iklan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Hapus iklan ini?")) return;
    try {
      await api.delete(`/advertisements/${id}`);
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus iklan.");
    }
  };

  const handleAdStatus = async (id, status) => {
    try {
      await api.put(`/advertisements/${id}`, { status });
      fetchInitialData();
    } catch (err) {
      alert("Gagal mengubah status iklan.");
    }
  };

  // --- EVENT CRUD HANDLERS (admin) ---
  const handleOpenEventModal = (ev = null) => {
    setSelectedEvent(ev);
    if (ev) {
      setEvTitle(ev.title);
      setEvDescription(ev.description || "");
      setEvLocation(ev.location || "");
      setEvDate(ev.event_date ? ev.event_date.slice(0, 16) : "");
      setEvImage(ev.image || "");
    } else {
      setEvTitle("");
      setEvDescription("");
      setEvLocation("");
      setEvDate("");
      setEvImage("");
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { title: evTitle, description: evDescription, location: evLocation, event_date: evDate || null, image: evImage };
      if (selectedEvent) {
        // FIX: backend cuma menyediakan PUT /admin/events/{id} (di dalam
        // grup rute admin), bukan /events/{id} - sebelumnya salah alamat
        // sehingga selalu gagal dengan pesan "Gagal menyimpan event."
        await api.put(`/admin/events/${selectedEvent.id}`, payload);
      } else {
        // FIX: sama seperti di atas, endpoint yang benar POST /admin/events
        await api.post("/admin/events", payload);
      }
      setShowEventModal(false);
      fetchInitialData();
    } catch (err) {
      alert(err?.data?.message || "Gagal menyimpan event.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Hapus event ini?")) return;
    try {
      // FIX: endpoint yang benar DELETE /admin/events/{id}
      await api.delete(`/admin/events/${id}`);
      fetchInitialData();
    } catch (err) {
      alert("Gagal menghapus event.");
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
      fetchInitialData();
    } catch (err) {
      alert(err?.data?.message || "Gagal memproses langganan.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatRupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";
  const daysLeft = (d) => {
    if (!d) return null;
    const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Filter lists
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
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="db-sidebar">
          <div className="db-profile-card">
            <div className="db-avatar">
              <UserIcon size={32} />
            </div>
            <div className="db-profile-info">
              <h3>{user?.name}</h3>
              <span className={`db-role-badge db-role--${user?.role}`}>
                {user?.role === "admin" ? "Administrator" : user?.role === "reseller" ? "Reseller" : "User"}
              </span>
            </div>
          </div>

          <nav className="db-menu">
            <button
              className={`db-menu-btn ${activeTab === "businesses" ? "active" : ""}`}
              onClick={() => setActiveTab("businesses")}
            >
              <Building2 size={18} />
              <span>Daftar Bisnis</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "ads" ? "active" : ""}`}
              onClick={() => setActiveTab("ads")}
            >
              <Megaphone size={18} />
              <span>Iklan</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "premium" ? "active" : ""}`}
              onClick={() => setActiveTab("premium")}
            >
              <Crown size={18} />
              <span>Premium & Invoice</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "booking" ? "active" : ""}`}
              onClick={() => setActiveTab("booking")}
            >
              <CalendarDays size={18} />
              <span>Booking</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "announcements" ? "active" : ""}`}
              onClick={() => setActiveTab("announcements")}
            >
              <Megaphone size={18} />
              <span>Pengumuman</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "coupons" ? "active" : ""}`}
              onClick={() => setActiveTab("coupons")}
            >
              <Gift size={18} />
              <span>Kupon</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "menu" ? "active" : ""}`}
              onClick={() => setActiveTab("menu")}
            >
              <Grid size={18} />
              <span>Menu</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "inbox" ? "active" : ""}`}
              onClick={() => setActiveTab("inbox")}
            >
              <Mail size={18} />
              <span>Inbox</span>
            </button>

            <button
              className={`db-menu-btn ${activeTab === "saved" ? "active" : ""}`}
              onClick={() => setActiveTab("saved")}
            >
              <Star size={18} />
              <span>Simpan</span>
            </button>

            {isAdmin && (
              <>
                <button
                  className={`db-menu-btn ${activeTab === "categories" ? "active" : ""}`}
                  onClick={() => setActiveTab("categories")}
                >
                  <Grid size={18} />
                  <span>Kategori</span>
                </button>
                <button
                  className={`db-menu-btn ${activeTab === "events" ? "active" : ""}`}
                  onClick={() => setActiveTab("events")}
                >
                  <CalendarDays size={18} />
                  <span>Event</span>
                </button>
                <button
                  className={`db-menu-btn ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => setActiveTab("users")}
                >
                  <Users size={18} />
                  <span>Kelola User</span>
                </button>
              </>
            )}

            <button className="db-menu-btn" onClick={() => navigate("/")}>
              <Home size={18} />
              <span>Kembali ke Website</span>
            </button>

            <button className="db-menu-btn db-menu-btn--logout" onClick={logout}>
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="db-content">
          {error && <div className="db-error-alert">{error}</div>}

          {/* TAB: BUSINESSES */}
          {activeTab === "businesses" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>{isAdmin ? "Semua Bisnis Terdaftar" : "Bisnis Saya"}</h2>
                <button className="db-action-btn" onClick={() => handleOpenBizModal()}>
                  <Plus size={16} />
                  <span>Tambah Bisnis</span>
                </button>
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
                            <img
                              src={biz.image ? getImageUrl(biz.image) : "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=80&fit=crop"}
                              alt={biz.title}
                              className="db-table-thumb"
                            />
                          </td>
                          <td>
                            <div className="db-table-title">{biz.title}</div>
                            <div className="db-table-subtitle">{biz.address}</div>
                          </td>
                          <td>{biz.category?.name || "-"}</td>
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
                              {isAdmin && biz.status === "pending" && (
                                <button
                                  className="db-table-btn db-btn-approve"
                                  onClick={() => handleApproveBusiness(biz.id)}
                                  title="Setujui"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              <button
                                className="db-table-btn db-btn-edit"
                                onClick={() => handleOpenBizModal(biz)}
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="db-table-btn db-btn-delete"
                                onClick={() => handleDeleteBusiness(biz.id)}
                                title="Hapus"
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
                <div className="db-empty-state">Belum ada bisnis yang didaftarkan.</div>
              )}
            </div>
          )}

          {/* TAB: ADS (IKLAN) */}
          {activeTab === "ads" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>{isAdmin ? "Moderasi Iklan" : "Iklan Saya"}</h2>
                <button className="db-action-btn" onClick={() => handleOpenAdModal()}>
                  <Plus size={16} />
                  <span>Pasang Iklan</span>
                </button>
              </div>

              {!isAdmin && !canPostAds && (
                <div className="db-info-banner">
                  <Lock size={16} />
                  <span>
                    Akun <strong>Free</strong> tidak bisa memasang iklan. Berlangganan{" "}
                    <strong>Premium</strong> pada salah satu bisnis Anda di tab{" "}
                    <em>Premium & Invoice</em> agar bisa memasang iklan dan tampil di beranda.
                  </span>
                </div>
              )}

              <div className="db-filters">
                <div className="db-search-input">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Cari iklan berdasarkan judul atau nama usaha..."
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
                        <th>Judul Iklan</th>
                        <th>Nama Usaha</th>
                        <th>Lokasi</th>
                        <th>Status</th>
                        <th>Tampil di Web?</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAds.map((ad) => (
                        <tr key={ad.id}>
                          <td>
                            <div className="db-table-title">{ad.title}</div>
                            <div className="db-table-subtitle">{ad.category?.name || "-"}</div>
                          </td>
                          <td>{ad.company_name}</td>
                          <td>{ad.location}</td>
                          <td>
                            <span className={`db-status-badge db-status--${ad.status}`}>
                              {ad.status === "verified" ? "Disetujui" : ad.status === "pending" ? "Tertunda" : "Ditolak"}
                            </span>
                          </td>
                          <td>
                            {ad.status === "verified" && (isAdmin || canPostAds) ? (
                              <span className="db-visible-badge db-visible--yes">
                                <Crown size={13} /> Tampil
                              </span>
                            ) : (
                              <span className="db-visible-badge db-visible--no">
                                <Lock size={13} /> {ad.status !== "verified" ? "Menunggu" : "Premium nonaktif"}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="db-table-actions">
                              {isAdmin && ad.status === "pending" && (
                                <>
                                  <button className="db-table-btn db-btn-approve" onClick={() => handleAdStatus(ad.id, "verified")} title="Setujui">
                                    <CheckCircle size={16} />
                                  </button>
                                  <button className="db-table-btn db-btn-delete" onClick={() => handleAdStatus(ad.id, "rejected")} title="Tolak">
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenAdModal(ad)} title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteAd(ad.id)} title="Hapus">
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
                <div className="db-empty-state">Belum ada iklan.</div>
              )}
            </div>
          )}

          {/* TAB: PREMIUM & INVOICE */}
          {activeTab === "premium" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Premium & Invoice Langganan</h2>
                <button className="db-action-btn" onClick={handleOpenSubModal}>
                  <Crown size={16} />
                  <span>Berlangganan Premium</span>
                </button>
              </div>

              <h3 className="db-subheading">Status Bisnis Saya</h3>
              <div className="db-plan-cards">
                {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((biz) => (
                  <div key={biz.id} className={`db-biz-status-card ${biz.is_premium_active ? "is-premium" : "is-free"}`}>
                    <div className="db-biz-status-card__top">
                      <strong>{biz.title}</strong>
                      {biz.is_premium_active ? (
                        <span className="db-plan-badge db-plan-badge--premium"><Crown size={13} /> Premium</span>
                      ) : (
                        <span className="db-plan-badge db-plan-badge--free">Free</span>
                      )}
                    </div>
                    <p className="db-biz-status-card__desc">
                      {biz.is_premium_active
                        ? <>Bisa pasang iklan. Aktif s.d. <strong>{formatDate(biz.premium_expires_at)}</strong> ({daysLeft(biz.premium_expires_at)} hari lagi).</>
                        : "Tidak bisa pasang iklan. Berlangganan premium agar iklan bisnis ini tampil di website."}
                    </p>
                  </div>
                ))}
                {businesses.filter((b) => isAdmin || b.user_id === user?.id).length === 0 && (
                  <div className="db-empty-state">Anda belum memiliki bisnis. Tambahkan bisnis dulu di tab Daftar Bisnis.</div>
                )}
              </div>

              <h3 className="db-subheading">Riwayat Invoice</h3>
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
                        <th>No. Invoice</th>
                        <th>Bisnis</th>
                        <th>Paket</th>
                        <th>Biaya</th>
                        <th>Berlaku Hingga</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.invoice_number}</strong></td>
                          <td>{s.business?.title || "-"}</td>
                          <td>{plans[s.plan]?.label || s.plan}</td>
                          <td>{formatRupiah(s.amount)}</td>
                          <td>{formatDate(s.expires_at)}</td>
                          <td><span className="db-status-badge db-status--approved">Lunas</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-empty-state">Belum ada riwayat invoice.</div>
              )}
            </div>
          )}

          {/* TAB: BOOKING */}
          {activeTab === "booking" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>{isAdmin ? "Semua Booking" : "Booking Masuk"}</h2>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat booking...</span>
                </div>
              ) : bookings.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Pelanggan</th>
                        <th>Kontak</th>
                        {isAdmin && <th>Bisnis</th>}
                        <th>Tanggal &amp; Jam</th>
                        <th>Catatan</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td><strong>{b.customer_name}</strong></td>
                          <td>{b.customer_phone}</td>
                          {isAdmin && <td>{b.business?.title || "-"}</td>}
                          <td>
                            {new Date(b.booking_date).toLocaleDateString("id-ID")}
                            {b.booking_time ? ` · ${b.booking_time}` : ""}
                          </td>
                          <td>{b.notes || "-"}</td>
                          <td>
                            <span className={`db-status-badge db-status--${b.status === "confirmed" ? "approved" : b.status === "cancelled" ? "rejected" : b.status === "completed" ? "approved" : "pending"}`}>
                              {b.status === "pending" && "Menunggu"}
                              {b.status === "confirmed" && "Dikonfirmasi"}
                              {b.status === "completed" && "Selesai"}
                              {b.status === "cancelled" && "Dibatalkan"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              {b.status === "pending" && (
                                <button
                                  className="db-table-btn db-btn-edit"
                                  title="Konfirmasi"
                                  onClick={async () => {
                                    await api.put(`/bookings/${b.id}`, { status: "confirmed" });
                                    setBookings((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "confirmed" } : x));
                                  }}
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {b.status === "confirmed" && (
                                <button
                                  className="db-table-btn db-btn-edit"
                                  title="Tandai selesai"
                                  onClick={async () => {
                                    await api.put(`/bookings/${b.id}`, { status: "completed" });
                                    setBookings((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "completed" } : x));
                                  }}
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {(b.status === "pending" || b.status === "confirmed") && (
                                <button
                                  className="db-table-btn db-btn-delete"
                                  title="Batalkan"
                                  onClick={async () => {
                                    await api.put(`/bookings/${b.id}`, { status: "cancelled" });
                                    setBookings((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "cancelled" } : x));
                                  }}
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              <button
                                className="db-table-btn db-btn-delete"
                                title="Hapus"
                                onClick={async () => {
                                  if (!confirm("Hapus booking ini?")) return;
                                  await api.delete(`/bookings/${b.id}`);
                                  setBookings((prev) => prev.filter((x) => x.id !== b.id));
                                }}
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
                <div className="db-empty-state">Belum ada booking yang masuk.</div>
              )}
            </div>
          )}

          {/* TAB: PENGUMUMAN */}
          {activeTab === "announcements" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Pengumuman</h2>
                {isAdmin && (
                  <button className="db-action-btn" onClick={() => handleOpenAnnModal()}>
                    <Plus size={16} />
                    <span>Tambah Pengumuman</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : announcements.length > 0 ? (
                <div className="db-announcement-list">
                  {announcements.map((a) => (
                    <div key={a.id} className="db-announcement-card">
                      <div className="db-announcement-card__top">
                        <strong>{a.title}</strong>
                        <span className="db-announcement-card__date">{new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                      <p>{a.body}</p>
                      {isAdmin && (
                        <div className="db-table-actions">
                          <button className="db-table-btn db-btn-edit" onClick={() => handleOpenAnnModal(a)}><Edit2 size={14} /></button>
                          <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteAnnouncement(a.id)}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-empty-state">Belum ada pengumuman.</div>
              )}
            </div>
          )}

          {/* TAB: KUPON */}
          {activeTab === "coupons" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Kupon</h2>
                <button className="db-action-btn" onClick={() => handleOpenCouponModal()}>
                  <Plus size={16} />
                  <span>Tambah Kupon</span>
                </button>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : coupons.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Bisnis</th>
                        <th>Diskon</th>
                        <th>Terpakai</th>
                        <th>Kadaluarsa</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.code}</strong></td>
                          <td>{c.business?.title || "-"}</td>
                          <td>{c.discount_type === "percentage" ? `${c.discount_value}%` : formatRupiah(c.discount_value)}</td>
                          <td>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                          <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("id-ID") : "-"}</td>
                          <td>
                            <span className={`db-status-badge db-status--${c.is_active ? "verified" : "rejected"}`}>
                              {c.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenCouponModal(c)}><Edit2 size={14} /></button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteCoupon(c.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-empty-state">Belum ada kupon.</div>
              )}
            </div>
          )}

          {/* TAB: MENU */}
          {activeTab === "menu" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Menu</h2>
                <button className="db-action-btn" onClick={() => handleOpenMenuModal()}>
                  <Plus size={16} />
                  <span>Tambah Menu</span>
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
                <div className="db-empty-state">Belum ada menu.</div>
              )}
            </div>
          )}

          {/* TAB: INBOX */}
          {activeTab === "inbox" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Inbox</h2>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : messages.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Pengirim</th>
                        <th>Kontak</th>
                        <th>Bisnis</th>
                        <th>Pesan</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr key={m.id}>
                          <td><strong>{m.sender_name}</strong></td>
                          <td>{m.sender_contact || "-"}</td>
                          <td>{m.business?.title || "-"}</td>
                          <td className="db-message-cell">{m.message}</td>
                          <td>
                            <span className={`db-status-badge db-status--${m.is_read ? "verified" : "pending"}`}>
                              {m.is_read ? "Dibaca" : "Baru"}
                            </span>
                          </td>
                          <td>
                            <div className="db-table-actions">
                              {!m.is_read && (
                                <button className="db-table-btn db-btn-edit" title="Tandai dibaca" onClick={() => handleMarkMessageRead(m.id)}><CheckCircle size={14} /></button>
                              )}
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteMessage(m.id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-empty-state">Belum ada pesan masuk.</div>
              )}
            </div>
          )}

          {/* TAB: SIMPAN */}
          {activeTab === "saved" && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Bisnis Tersimpan</h2>
              </div>

              {loading ? (
                <div className="db-loader-wrap"><div className="db-spinner" /><span>Memuat...</span></div>
              ) : savedBusinesses.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Nama Bisnis</th>
                        <th>Kategori</th>
                        <th>Alamat</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedBusinesses.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.business?.title || "-"}</strong></td>
                          <td>{s.business?.category?.name || "-"}</td>
                          <td>{s.business?.address || "-"}</td>
                          <td>
                            <button className="db-table-btn db-btn-delete" onClick={() => handleUnsaveBusiness(s.id)}><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="db-empty-state">Belum ada bisnis yang disimpan.</div>
              )}
            </div>
          )}

          {/* TAB: EVENTS (admin) */}
          {activeTab === "events" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Kelola Event</h2>
                <button className="db-action-btn" onClick={() => handleOpenEventModal()}>
                  <Plus size={16} />
                  <span>Tambah Event</span>
                </button>
              </div>

              {loading ? (
                <div className="db-loader-wrap">
                  <div className="db-spinner" />
                  <span>Memuat event...</span>
                </div>
              ) : events.length > 0 ? (
                <div className="db-table-responsive">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Judul</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr key={ev.id}>
                          <td><strong>{ev.title}</strong></td>
                          <td>{ev.location || "-"}</td>
                          <td>{ev.event_date ? new Date(ev.event_date).toLocaleString("id-ID") : "-"}</td>
                          <td>
                            <div className="db-table-actions">
                              <button className="db-table-btn db-btn-edit" onClick={() => handleOpenEventModal(ev)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="db-table-btn db-btn-delete" onClick={() => handleDeleteEvent(ev.id)}>
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
                <div className="db-empty-state">Belum ada event.</div>
              )}
            </div>
          )}

          {/* TAB: RESELLER */}
          {/* TAB: CATEGORIES */}
          {activeTab === "categories" && isAdmin && (
            <div className="db-panel">
              <div className="db-panel-header">
                <h2>Kelola Kategori</h2>
                <button className="db-action-btn" onClick={() => handleOpenCatModal()}>
                  <Plus size={16} />
                  <span>Tambah Kategori</span>
                </button>
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
                <div className="db-empty-state">Belum ada kategori.</div>
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
        </main>
      </div>

      {/* --- BUSINESS FORM MODAL --- */}
      {showBizModal && (
        <div className="db-modal-overlay" onClick={() => setShowBizModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedBiz ? "Edit Bisnis" : "Daftarkan Bisnis Baru"}</h3>
              <button className="db-modal-close" onClick={() => setShowBizModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveBusiness} className="db-modal-body">
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Nama Bisnis <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={bizTitle}
                    onChange={(e) => setBizTitle(e.target.value)}
                    placeholder="Nama Toko / Perusahaan / UMKM"
                  />
                </div>
                <div className="db-form-group">
                  <label>Kategori <span className="req">*</span></label>
                  <select
                    required
                    value={bizCategory}
                    onChange={(e) => setBizCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="db-form-group">
                <label>Deskripsi Layanan <span className="req">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={bizDescription}
                  onChange={(e) => setBizDescription(e.target.value)}
                  placeholder="Jelaskan produk atau layanan utama bisnis Anda..."
                />
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Alamat Lengkap <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    placeholder="Nama jalan, kota, provinsi"
                  />
                </div>
                <div className="db-form-group">
                  <label>Desa / Kelurahan</label>
                  <select
                    value={bizVillage}
                    onChange={(e) => setBizVillage(e.target.value)}
                  >
                    <option value="">Pilih desa/kelurahan...</option>
                    {DESA_LIST.map((desa) => (
                      <option key={desa} value={desa}>{desa}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>No. HP / WhatsApp <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                  />
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Email Bisnis</label>
                  <input
                    type="email"
                    value={bizEmail}
                    onChange={(e) => setBizEmail(e.target.value)}
                    placeholder="info@bisnisanda.com"
                  />
                </div>
                <div className="db-form-group">
                  <label>Jam Operasional</label>
                  <input
                    type="text"
                    value={bizHours}
                    onChange={(e) => setBizHours(e.target.value)}
                    placeholder="Contoh: 08:00 - 17:00 WIB"
                  />
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={bizWebsite}
                    onChange={(e) => setBizWebsite(e.target.value)}
                    placeholder="https://bisnisanda.com"
                  />
                </div>
                <div className="db-form-group">
                  <label>Unggah Gambar / Logo Toko</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBizImageFile(e.target.files[0]);
                        setBizImagePreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </div>
              </div>

              {bizImagePreview && (
                <div className="db-img-preview-wrap">
                  <img src={bizImagePreview} alt="Pratinjau" className="db-form-preview-img" />
                </div>
              )}

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Galeri Foto Tambahan (boleh pilih banyak sekaligus)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleAddGalleryFiles(e.target.files);
                        e.target.value = ""; // allow re-selecting the same file again later
                      }
                    }}
                  />
                </div>
                <div className="db-form-group">
                  <label>Link Video (YouTube, dll — opsional)</label>
                  <input
                    type="url"
                    value={bizVideoUrl}
                    onChange={(e) => setBizVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="db-form-group">
                <label>Tags (pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={bizTags}
                  onChange={(e) => setBizTags(e.target.value)}
                  placeholder="Contoh: Tour Murah, Wisata Keluarga, Open Trip"
                />
              </div>

              {bizGalleryPreviews.length > 0 && (
                <div className="db-img-preview-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {bizGalleryPreviews.map((p, idx) => (
                    <div key={idx} style={{ position: "relative" }}>
                      <img
                        src={p.url}
                        alt={`Galeri ${idx + 1}`}
                        className="db-form-preview-img"
                        style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8 }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryPreview(idx)}
                        aria-label="Hapus foto ini"
                        style={{
                          position: "absolute", top: -8, right: -8,
                          background: "#dc2626", color: "#fff", border: "2px solid #fff",
                          borderRadius: "50%", width: 22, height: 22, cursor: "pointer",
                          fontSize: 13, lineHeight: 1, fontWeight: 700,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="db-form-group">
                <label>Hari Tutup (centang hari yang libur, kosongkan jika buka setiap hari)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {HARI_LIST.map((day) => (
                    <label key={day} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
                      <input
                        type="checkbox"
                        checked={bizClosedDays.includes(day)}
                        onChange={() => toggleClosedDay(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowBizModal(false)}>
                  Batal
                </button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan Bisnis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ANNOUNCEMENT FORM MODAL (admin) --- */}
      {showAnnModal && (
        <div className="db-modal-overlay" onClick={() => setShowAnnModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedAnn ? "Edit Pengumuman" : "Tambah Pengumuman"}</h3>
              <button className="db-modal-close" onClick={() => setShowAnnModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveAnnouncement} className="db-modal-body">
              <div className="db-form-group">
                <label>Judul <span className="req">*</span></label>
                <input type="text" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Isi Pengumuman <span className="req">*</span></label>
                <textarea required rows={5} value={annBody} onChange={(e) => setAnnBody(e.target.value)} />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowAnnModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COUPON FORM MODAL --- */}
      {showCouponModal && (
        <div className="db-modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedCoupon ? "Edit Kupon" : "Tambah Kupon"}</h3>
              <button className="db-modal-close" onClick={() => setShowCouponModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCoupon} className="db-modal-body">
              <div className="db-form-group">
                <label>Bisnis <span className="req">*</span></label>
                <select required value={cpBusinessId} onChange={(e) => setCpBusinessId(e.target.value)}>
                  {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="db-form-group">
                <label>Kode Kupon <span className="req">*</span></label>
                <input type="text" required value={cpCode} onChange={(e) => setCpCode(e.target.value.toUpperCase())} placeholder="Contoh: HEMAT10" />
              </div>
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Tipe Diskon <span className="req">*</span></label>
                  <select value={cpType} onChange={(e) => setCpType(e.target.value)}>
                    <option value="percentage">Persen (%)</option>
                    <option value="fixed">Nominal (Rp)</option>
                  </select>
                </div>
                <div className="db-form-group">
                  <label>Nilai Diskon <span className="req">*</span></label>
                  <input type="number" required min="1" value={cpValue} onChange={(e) => setCpValue(e.target.value)} />
                </div>
              </div>
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Maks. Pemakaian</label>
                  <input type="number" min="1" value={cpMaxUses} onChange={(e) => setCpMaxUses(e.target.value)} placeholder="Tanpa batas" />
                </div>
                <div className="db-form-group">
                  <label>Kadaluarsa</label>
                  <input type="date" value={cpExpiresAt} onChange={(e) => setCpExpiresAt(e.target.value)} />
                </div>
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowCouponModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MENU FORM MODAL --- */}
      {showMenuModal && (
        <div className="db-modal-overlay" onClick={() => setShowMenuModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedMenu ? "Edit Menu" : "Tambah Menu"}</h3>
              <button className="db-modal-close" onClick={() => setShowMenuModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveMenu} className="db-modal-body">
              <div className="db-form-group">
                <label>Bisnis <span className="req">*</span></label>
                <select required value={mnBusinessId} onChange={(e) => setMnBusinessId(e.target.value)}>
                  {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>
              <div className="db-form-group">
                <label>Nama Menu <span className="req">*</span></label>
                <input type="text" required value={mnName} onChange={(e) => setMnName(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Deskripsi</label>
                <textarea rows={3} value={mnDescription} onChange={(e) => setMnDescription(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Harga (Rp) <span className="req">*</span></label>
                <input type="number" required min="0" value={mnPrice} onChange={(e) => setMnPrice(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Foto Menu</label>
                <input type="file" accept="image/*" onChange={(e) => setMnImage(e.target.files?.[0] || null)} />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowMenuModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY FORM MODAL --- */}
      {showCatModal && (
        <div className="db-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedCat ? "Edit Kategori" : "Tambah Kategori"}</h3>
              <button className="db-modal-close" onClick={() => setShowCatModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveCategory} className="db-modal-body">
              <div className="db-form-group">
                <label>Nama Kategori <span className="req">*</span></label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Kuliner, Otomotif"
                />
              </div>
              <div className="db-form-group">
                <label>Icon Kategori (Lucide-react name)</label>
                <input
                  type="text"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Contoh: Store, Coffee, Car"
                />
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowCatModal(false)}>
                  Batal
                </button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* --- AD (IKLAN) FORM MODAL --- */}
      {showAdModal && (
        <div className="db-modal-overlay" onClick={() => setShowAdModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedAd ? "Edit Iklan" : "Pasang Iklan Baru"}</h3>
              <button className="db-modal-close" onClick={() => setShowAdModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveAd} className="db-modal-body">
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Judul Iklan <span className="req">*</span></label>
                  <input type="text" required value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="Contoh: Promo Diskon 20%" />
                </div>
                <div className="db-form-group">
                  <label>Kategori <span className="req">*</span></label>
                  <select required value={adCategory} onChange={(e) => setAdCategory(e.target.value)}>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="db-form-group">
                <label>Deskripsi <span className="req">*</span></label>
                <textarea required rows={4} value={adDescription} onChange={(e) => setAdDescription(e.target.value)} placeholder="Deskripsi singkat iklan Anda..." />
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Nama Usaha <span className="req">*</span></label>
                  <input type="text" required value={adCompany} onChange={(e) => setAdCompany(e.target.value)} />
                </div>
                <div className="db-form-group">
                  <label>Lokasi <span className="req">*</span></label>
                  <input type="text" required value={adLocation} onChange={(e) => setAdLocation(e.target.value)} />
                </div>
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>No. Telepon</label>
                  <input type="text" value={adPhone} onChange={(e) => setAdPhone(e.target.value)} />
                </div>
                <div className="db-form-group">
                  <label>Website</label>
                  <input type="url" value={adWebsite} onChange={(e) => setAdWebsite(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowAdModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan Iklan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EVENT FORM MODAL --- */}
      {showEventModal && (
        <div className="db-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>{selectedEvent ? "Edit Event" : "Tambah Event"}</h3>
              <button className="db-modal-close" onClick={() => setShowEventModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEvent} className="db-modal-body">
              <div className="db-form-group">
                <label>Judul Event <span className="req">*</span></label>
                <input type="text" required value={evTitle} onChange={(e) => setEvTitle(e.target.value)} />
              </div>
              <div className="db-form-group">
                <label>Deskripsi</label>
                <textarea rows={3} value={evDescription} onChange={(e) => setEvDescription(e.target.value)} />
              </div>
              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Lokasi</label>
                  <input type="text" value={evLocation} onChange={(e) => setEvLocation(e.target.value)} />
                </div>
                <div className="db-form-group">
                  <label>Tanggal & Waktu</label>
                  <input type="datetime-local" value={evDate} onChange={(e) => setEvDate(e.target.value)} />
                </div>
              </div>
              <div className="db-form-group">
                <label>URL Gambar</label>
                <input type="url" value={evImage} onChange={(e) => setEvImage(e.target.value)} placeholder="https://..." />
              </div>
              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowEventModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Menyimpan..." : "Simpan Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUBSCRIBE PREMIUM MODAL --- */}
      {showSubModal && (
        <div className="db-modal-overlay" onClick={() => setShowSubModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3>Berlangganan Premium</h3>
              <button className="db-modal-close" onClick={() => setShowSubModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubscribe} className="db-modal-body">
              <div className="db-form-group">
                <label>Pilih Bisnis <span className="req">*</span></label>
                <select required value={subBusinessId} onChange={(e) => setSubBusinessId(e.target.value)}>
                  {businesses.filter((b) => isAdmin || b.user_id === user?.id).map((b) => (
                    <option key={b.id} value={b.id}>{b.title} {b.is_premium_active ? "(sudah premium - perpanjang)" : "(free)"}</option>
                  ))}
                </select>
              </div>

              <div className="db-form-group">
                <label>Pilih Paket <span className="req">*</span></label>
                <div className="db-plan-select-group">
                  {Object.entries(plans).map(([key, p]) => (
                    <label key={key} className={`db-plan-option ${subPlan === key ? "selected" : ""}`}>
                      <input type="radio" name="plan" value={key} checked={subPlan === key} onChange={() => setSubPlan(key)} />
                      <span className="db-plan-option__label">{p.label}</span>
                      <span className="db-plan-option__price">{formatRupiah(p.amount)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="db-plan-note">
                Bisnis <strong>Premium</strong> bisa memasang iklan yang tampil otomatis di beranda website.
                Saat masa langganan habis, iklan &amp; status premium akan hilang dengan sendirinya.
              </p>

              <div className="db-modal-footer">
                <button type="button" className="db-btn-cancel" onClick={() => setShowSubModal(false)}>Batal</button>
                <button type="submit" className="db-btn-submit" disabled={actionLoading}>
                  {actionLoading ? "Memproses..." : "Bayar & Aktifkan"}
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
    </div>
  );
}