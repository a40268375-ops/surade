import { useState, useEffect } from "react";
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
} from "lucide-react";

import logoImg from "../../assets/logo.png";

import api from "../../services/api";
import { DEFAULT_AVATAR, DEFAULT_BANNER, getStorageUrl } from "../../utils/constants";

import "./AdminUser.css";


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
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Banner states – initialize from user data
  const [profileBanner, setProfileBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(user?.banner || DEFAULT_BANNER);
  const [showBannerOptions, setShowBannerOptions] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Profile data states - initialized from user state (from database via API)
  const [profileData, setProfileData] = useState(() => {
    return {
      firstName: user?.name?.split(" ")[0] || "User",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "User",
      bio: user?.bio || "",
      avatar: user?.avatar || DEFAULT_AVATAR,
      banner: user?.banner || DEFAULT_BANNER
    };
  });

  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
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
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [advertisements, setAdvertisements] = useState([]);
  const [loadingAdvertisements, setLoadingAdvertisements] = useState(false);
  const [selectedBusinessForAd, setSelectedBusinessForAd] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [adNotes, setAdNotes] = useState('');
  const [submittingAd, setSubmittingAd] = useState(false);

  // Fetch businesses from API (only user's own businesses)
  const fetchBusinesses = async () => {
    setLoadingBusinesses(true);
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

          return {
            id: b.id,
            name: b.name,
            category: categoryName,
            subCategory: subCategoryName,
            city: b.city || "Indonesia",
            status: "active",
            date: b.created_at ? new Date(b.created_at).toLocaleDateString("id-ID") : "-",
            products: b.products || []
          };
        });
        console.log("Mapped businesses:", mapped);
        setBusinesses(mapped);
      } else {
        console.warn("Businesses data is not an array:", data);
        setBusinesses([]);
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
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

  // Fetch advertisements on mount
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  // Handle advertisement submission
  const handleAdSubmit = async () => {
    if (!selectedBusinessForAd || !selectedPackage) {
      alert('Pilih bisnis dan paket terlebih dahulu');
      return;
    }

    setSubmittingAd(true);
    try {
      const res = await api.post('/advertisements', {
        business_id: selectedBusinessForAd,
        package_name: selectedPackage,
        notes: adNotes
      });

      alert('Iklan berhasil diajukan! Silakan lakukan pembayaran.');
      setSelectedBusinessForAd(null);
      setSelectedPackage(null);
      setAdNotes('');
      fetchAdvertisements();
    } catch (err) {
      console.error('Failed to submit advertisement:', err);
      alert('Gagal mengajukan iklan. Silakan coba lagi.');
    } finally {
      setSubmittingAd(false);
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

  // Sync profileData when user changes (from API/database)
  useEffect(() => {
    if (user && user.id) {
      setProfileData({
        firstName: user.name?.split(" ")[0] || "User",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "User",
        bio: user.bio || "",
        avatar: user.avatar || DEFAULT_AVATAR,
        banner: user.banner || DEFAULT_BANNER
      });
      setPhotoPreview(user.avatar || DEFAULT_AVATAR);
      setBannerPreview(user.banner || DEFAULT_BANNER);
      // Sync displayName with username from database
      setDisplayName(user.username || user.name || "");
    }
  }, [user]);

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
            status: b.status === "published" ? "published" : "draft"
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
            date: e.event_date || e.created_at ? new Date(e.created_at).toLocaleDateString("id-ID") : "-",
            location: e.event_location || "Indonesia",
            category: e.blog_category || "Umum",
            status: e.status === "published" ? "upcoming" : "past"
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

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [resellers, setResellers] = useState([]);

  const [savedItems, setSavedItems] = useState([]);

  const [reviews, setReviews] = useState([]);

  // Handle logout action
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userAuthChanged"));
      navigate("/");
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
    try {
      const formData = new FormData();
      formData.append('name', `${profileData.firstName} ${profileData.lastName}`);
      formData.append('bio', profileData.bio);
      formData.append('location', profileData.location || "");
      formData.append('phone', profileData.phone);
      formData.append('email', profileData.email);
      // Jika sedang edit username, gunakan nilai baru dari usernameInput
      const finalUsername = editingUsername && usernameInput.trim() ? usernameInput.trim() : displayName;
      formData.append('username', finalUsername);
      if (editingUsername && usernameInput.trim()) {
        setDisplayName(usernameInput.trim());
        setEditingUsername(false);
      }
      
      console.log("Sending to API:", {
        name: `${profileData.firstName} ${profileData.lastName}`,
        username: displayName,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        phone: profileData.phone
      });
      
      if (profilePhoto) {
        formData.append('avatar', profilePhoto);
      } else if (photoPreview === defaultAvatar && profileData.avatar !== defaultAvatar) {
        // User removed photo
        formData.append('remove_avatar', 'true');
      }

      if (profileBanner) {
        formData.append('banner', profileBanner);
      } else if (bannerPreview === defaultBanner && profileData.banner !== defaultBanner) {
        // User removed banner
        formData.append('remove_banner', 'true');
      }

      const res = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log("API Response:", res.data);

      const updatedUser = res.data?.data || res.data;
      const newAvatar = updatedUser.avatar || DEFAULT_AVATAR;
      const newBanner = updatedUser.banner || DEFAULT_BANNER;
      
      // Update localStorage user
      const updatedUserObj = {
        ...user,
        ...updatedUser,
        avatar: newAvatar,
        banner: newBanner,
        username: displayName,
        name: `${profileData.firstName} ${profileData.lastName}`,
        bio: profileData.bio,
        location: profileData.location || "",
        phone: profileData.phone,
        email: profileData.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUserObj));
      
      // Update user state to trigger re-render
      setUser(updatedUserObj);
      
      // Dispatch event to notify other components (like Navbar)
      window.dispatchEvent(new Event('userAuthChanged'));

      // Update profileData state with new avatar and banner
      const updatedProfileData = {
        ...profileData,
        avatar: newAvatar,
        banner: newBanner,
      };
      setProfileData(updatedProfileData);

      // Update photo preview
      setPhotoPreview(newAvatar);
      setBannerPreview(newBanner);
      setProfilePhoto(null);
      setProfileBanner(null);
      
      alert("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Failed to update profile via API, using localStorage fallback:", err);
      
      // Fallback to localStorage if API fails
      const newAvatar = photoPreview || DEFAULT_AVATAR;
      const newBanner = bannerPreview || DEFAULT_BANNER;
      const updatedUserObj = {
        ...user,
        name: `${profileData.firstName} ${profileData.lastName}`,
        bio: profileData.bio,
        location: profileData.location || "",
        phone: profileData.phone,
        email: profileData.email,
        avatar: newAvatar,
        banner: newBanner,
        username: displayName,
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUserObj));
      setUser(updatedUserObj);
      
      // Dispatch event to notify other components (like Navbar)
      window.dispatchEvent(new Event('userAuthChanged'));

      const updatedProfileData = {
        ...profileData,
        avatar: newAvatar,
        banner: newBanner,
      };
      setProfileData(updatedProfileData);

      setProfilePhoto(null);
      setProfileBanner(null);
      alert("Profil berhasil diperbarui (disimpan lokal)!");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePhotoUpload = (file) => {
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setShowPhotoOptions(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(defaultAvatar);
    setShowPhotoOptions(false);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      
      setTimeout(() => {
        canvas.getContext('2d').drawImage(video, 0, 0);
        stream.getTracks().forEach(track => track.stop());
        
        canvas.toBlob((blob) => {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          handlePhotoUpload(file);
        });
      }, 1000);
      
      setShowPhotoOptions(false);
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Akses kamera ditolak atau tidak tersedia");
    }
  };

  // Banner handlers
  const handleBannerUpload = (file) => {
    if (file) {
      setProfileBanner(file);
      setBannerPreview(URL.createObjectURL(file));
      setShowBannerOptions(false);
    }
  };

  const handleRemoveBanner = () => {
    setProfileBanner(null);
    setBannerPreview(defaultBanner);
    setShowBannerOptions(false);
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
    <div className="admin-layout">
      {/* ── Collapsible Sidebar ── */}
      <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-content">
            {/* branding info.co.id */}
            <img src={logoImg} alt="Info.co.id" className="sidebar-logo-img" />
            <span className="logo-name">Info.co.id</span>
          </div>
          <div className="sidebar-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu size={22} />
          </div>
        </div>

        {/* Search Box */}
        <div className="sidebar-search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder={isCollapsed ? "" : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Items */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="menu-item-wrapper">
                <div className={`menu-item ${isActive ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
                  <Icon className="menu-icon" size={20} />
                  <span className="menu-text">{item.name}</span>
                </div>
                <span className="sidebar-tooltip">{item.name}</span>
              </li>
            );
          })}
        </ul>

        {/* Back to Website Button */}
        <div className="sidebar-back-to-web">
          <Link to="/" className={`back-to-web-btn ${isCollapsed ? "collapsed" : ""}`} title="Kembali ke Website">
            <Home size={18} className="back-to-web-icon" />
            <span className="back-to-web-text">Kembali ke Website</span>
          </Link>
        </div>

        {/* Profile Footer Section */}
        <div className="sidebar-profile">
          <div className="profile-info" onClick={() => setActiveTab("profile")} style={{ cursor: "pointer" }}>
            <img src={profileData.avatar} alt="Profile" className="profile-avatar" />
            <div className="profile-details">
              <span className="profile-name">{displayName}</span>
              <span className="profile-role">{profileData.role}</span>
            </div>
          </div>
          <div className="logout-icon-btn" onClick={handleLogout} title="Keluar Panel Admin User">
            <LogOut size={18} />
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="admin-main-content">
        <header className="admin-navbar">
          <div className="admin-page-title">
            <h1>{pageInfo.title}</h1>
            <p>{pageInfo.desc}</p>
          </div>
          <div className="admin-nav-actions">
            <div className="notifications-bell" title="Pemberitahuan">
              <Bell size={20} />
              <div className="bell-badge"></div>
            </div>
            <div className="current-user-badge">
              <img
                src={profileData.avatar}
                alt="user avatar"
                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span>
                Halo, <strong>{displayName}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Active Page View Container */}
        <section className="admin-view-container">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-info">
                    <h3>Total Bisnis</h3>
                    <div className="stat-value">{businesses.length}</div>
                    <div className="stat-change up">
                      <TrendingUp size={14} /> <span>+12.5% bulan ini</span>
                    </div>
                  </div>
                  <div className="stat-card-icon bisnis-icon">
                    <Briefcase size={22} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-info">
                    <h3>Total Event</h3>
                    <div className="stat-value">{events.length}</div>
                    <div className="stat-change up">
                      <TrendingUp size={14} /> <span>+8% minggu ini</span>
                    </div>
                  </div>
                  <div className="stat-card-icon event-icon">
                    <Calendar size={22} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-info">
                    <h3>Total Ulasan</h3>
                    <div className="stat-value">{reviews.length}</div>
                    <div className="stat-change up">
                      <TrendingUp size={14} /> <span>+4.2% rating</span>
                    </div>
                  </div>
                  <div className="stat-card-icon dashboard-icon">
                    <Star size={22} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-card-info">
                    <h3>Total Reseller</h3>
                    <div className="stat-value">{resellers.length}</div>
                    <div className="stat-change up">
                      <TrendingUp size={14} /> <span>Aktif 100%</span>
                    </div>
                  </div>
                  <div className="stat-card-icon reseller-icon">
                    <Users size={22} />
                  </div>
                </div>
              </div>

              {/* Graphical & Activity Panels */}
              <div className="dashboard-details-grid">
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h2>Kunjungan Portal Mingguan</h2>
                    <span className="panel-action-btn">Lihat Detail</span>
                  </div>
                  <div className="chart-container">
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "45%" }} data-value="450"></div>
                      <span className="chart-label">Sen</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "60%" }} data-value="600"></div>
                      <span className="chart-label">Sel</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "85%" }} data-value="850"></div>
                      <span className="chart-label">Rab</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "70%" }} data-value="700"></div>
                      <span className="chart-label">Kam</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "95%" }} data-value="950"></div>
                      <span className="chart-label">Jum</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "55%" }} data-value="550"></div>
                      <span className="chart-label">Sab</span>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar" style={{ height: "30%" }} data-value="300"></div>
                      <span className="chart-label">Min</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h2>Aktivitas Terbaru</h2>
                    <span className="panel-action-btn">Lihat Semua</span>
                  </div>
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon-badge new-business">
                        <Briefcase size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          Bisnis baru <strong>Warung Nasi Ampera</strong> terdaftar.
                        </div>
                        <div className="activity-time">5 menit yang lalu</div>
                      </div>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon-badge new-review">
                        <Star size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <strong>Rian Permana</strong> memberikan bintang 5.
                        </div>
                        <div className="activity-time">10 menit yang lalu</div>
                      </div>
                    </div>

                    <div className="activity-item">
                      <div className="activity-icon-badge new-event">
                        <Calendar size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          Event <strong>Festival Kuliner</strong> disetujui.
                        </div>
                        <div className="activity-time">1 jam yang lalu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BISNIS VIEW */}
          {activeTab === "bisnis" && (
            <div className="dashboard-panel">
              <div className="table-controls">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Cari nama bisnis, kategori, atau kota..." />
                </div>
                <div className="filter-actions">
                  <button className="btn-secondary">Filter Kategori</button>
                  <button className="btn-primary" onClick={() => navigate("/add-business")}>
                    <Plus size={16} /> Tambah Bisnis
                  </button>
                </div>
              </div>

              {loadingBusinesses ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 20px" }}>
                  <Loader2 size={40} className="spin" style={{ color: "#007570" }} />
                </div>
              ) : businesses && businesses.length > 0 ? (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nama Bisnis</th>
                        <th>Kategori</th>
                        <th>Kota</th>
                        <th>Produk</th>
                        <th>Tanggal Daftar</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businesses.map((biz) => (
                        <tr key={biz.id}>
                          <td className="table-cell-bold">{biz.name}</td>
                          <td>
                            <div className="table-category">
                              <span>{biz.category}</span>
                              {biz.subCategory && (
                                <>
                                  <span className="table-category-separator">›</span>
                                  <span className="table-category-sub">{biz.subCategory}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>{biz.city}</td>
                          <td>
                            <div className="table-products">
                              <span className="product-count">{biz.products?.length || 0} Produk</span>
                              {biz.products && biz.products.length > 0 && (
                                <div className="product-list">
                                  {biz.products.slice(0, 3).map((product) => (
                                    <div key={product.id} className="product-item">
                                      <span className="product-name">{product.name}</span>
                                      <span className="product-price">Rp {product.price?.toLocaleString('id-ID')}</span>
                                    </div>
                                  ))}
                                  {biz.products.length > 3 && (
                                    <span className="product-more">+{biz.products.length - 3} lainnya</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{biz.date}</td>
                          <td>
                            <span className={`badge ${biz.status}`}>
                              {biz.status === "active" ? "Aktif" : biz.status === "pending" ? "Menunggu" : "Nonaktif"}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="action-btn view" title="Lihat" onClick={() => navigate(`/business/${biz.id}`)}>
                                <Eye size={16} />
                              </button>
                              <button className="action-btn edit" title="Edit" onClick={() => navigate(`/add-business/${biz.id}`)}>
                                <Edit size={16} />
                              </button>
                              <button className="action-btn add-product" title="Tambah Produk" onClick={() => navigate(`/add-product/${biz.id}`)}>
                                <Plus size={16} />
                              </button>
                              <button className="action-btn delete" title="Hapus" onClick={() => handleDeleteBusiness(biz.id)}>
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
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <Briefcase size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Bisnis</h3>
                  <p style={{ fontSize: "13px", marginBottom: "20px" }}>Anda belum memiliki bisnis yang terdaftar</p>
                  <button className="btn-primary" onClick={() => navigate("/add-business")}>
                    <Plus size={16} /> Tambah Bisnis Pertama
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. BLOG & EVENT COMBINED VIEW */}
          {activeTab === "blog-event" && (
            <div>
              {/* Sub-tabs for Blog and Event */}
              <div className="sub-tabs" style={{ marginBottom: "25px" }}>
                <button
                  className={`sub-tab ${blogEventTab === "blog" ? "active" : ""}`}
                  onClick={() => setBlogEventTab("blog")}
                >
                  <FileText size={16} /> Blog
                </button>
                <button
                  className={`sub-tab ${blogEventTab === "event" ? "active" : ""}`}
                  onClick={() => setBlogEventTab("event")}
                >
                  <Calendar size={16} /> Event
                </button>
              </div>

              {/* BLOG SUB-TAB */}
              {blogEventTab === "blog" && (
                <div>
                  <div className="table-controls" style={{ marginBottom: "25px" }}>
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input type="text" placeholder="Cari artikel blog..." />
                    </div>
                    <button className="btn-primary" onClick={() => navigate("/add-blog?type=blog")}>
                      <Plus size={16} /> Buat Blog Baru
                    </button>
                  </div>

                  <div className="blog-event-grid">
                    {blogs.map((blog) => (
                      <div key={blog.id} className="blog-event-card">
                        <div className="blog-event-card__header">
                          <div className="blog-event-card__icon">
                            <FileText size={24} />
                          </div>
                          <span className={`badge ${blog.status}`}>
                            {blog.status === "published" ? "Terbit" : "Draft"}
                          </span>
                        </div>
                        <h3 className="blog-event-card__title">{blog.title}</h3>
                        <div className="blog-event-card__meta">
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Kategori:</span>
                            <span className="meta-value">{blog.category}</span>
                          </span>
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Penulis:</span>
                            <span className="meta-value">{blog.author}</span>
                          </span>
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Tanggal:</span>
                            <span className="meta-value">{blog.date}</span>
                          </span>
                        </div>
                        <div className="blog-event-card__actions">
                          <button className="action-btn view" title="Lihat" onClick={() => navigate(`/blog/${blog.id}`)}>
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit" title="Edit" onClick={() => navigate(`/add-blog/${blog.id}?type=blog`)}>
                            <Edit size={16} />
                          </button>
                          <button className="action-btn delete" title="Hapus" onClick={() => handleDeleteBlog(blog.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EVENT SUB-TAB */}
              {blogEventTab === "event" && (
                <div>
                  <div className="table-controls" style={{ marginBottom: "25px" }}>
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input type="text" placeholder="Cari agenda event..." />
                    </div>
                    <button className="btn-primary" onClick={() => navigate("/add-blog?type=event")}>
                      <Plus size={16} /> Buat Event Baru
                    </button>
                  </div>

                  <div className="blog-event-grid">
                    {events.map((ev) => (
                      <div key={ev.id} className="blog-event-card">
                        <div className="blog-event-card__header">
                          <div className="blog-event-card__icon">
                            <Calendar size={24} />
                          </div>
                          <span className={`badge ${ev.status}`}>
                            {ev.status === "upcoming" ? "Akan Datang" : ev.status === "ongoing" ? "Berjalan" : "Selesai"}
                          </span>
                        </div>
                        <h3 className="blog-event-card__title">{ev.title}</h3>
                        <div className="blog-event-card__meta">
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Kategori:</span>
                            <span className="meta-value">{ev.category}</span>
                          </span>
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Tanggal:</span>
                            <span className="meta-value">{ev.date}</span>
                          </span>
                          <span className="blog-event-card__meta-item">
                            <span className="meta-label">Lokasi:</span>
                            <span className="meta-value">{ev.location}</span>
                          </span>
                        </div>
                        <div className="blog-event-card__actions">
                          <button className="action-btn view" title="Lihat">
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit" title="Edit" onClick={() => navigate(`/add-blog/${ev.id}?type=event`)}>
                            <Edit size={16} />
                          </button>
                          <button className="action-btn delete" title="Hapus" onClick={() => handleDeleteEvent(ev.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. INBOX VIEW */}
          {activeTab === "inbox" && (
            <div className="inbox-layout">
              {/* Inbox List */}
              <div className="inbox-list-pane">
                <div className="inbox-pane-header">
                  <h2>Kotak Masuk ({messages.filter((m) => m.unread).length})</h2>
                </div>
                <div className="inbox-messages-scroller">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-item-card ${msg.unread ? "unread" : ""} ${selectedMessage?.id === msg.id ? "selected" : ""}`}
                      onClick={() => selectMessage(msg)}
                    >
                      <div className="message-item-header">
                        <span className="message-sender">{msg.sender}</span>
                        <span className="message-time-stamp">{msg.time}</span>
                      </div>
                      <div className="message-item-subject">{msg.subject}</div>
                      <div className="message-item-preview">{msg.body}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inbox Details */}
              <div className="inbox-detail-view">
                {selectedMessage ? (
                  <>
                    <div className="inbox-detail-header">
                      <div className="inbox-detail-subject">{selectedMessage.subject}</div>
                      <div className="inbox-detail-meta">
                        <div className="meta-sender-info">
                          <div className="meta-avatar">{selectedMessage.sender.charAt(0)}</div>
                          <div>
                            <div className="meta-sender-name">{selectedMessage.sender}</div>
                            <div className="meta-sender-email">{selectedMessage.email}</div>
                          </div>
                        </div>
                        <div className="message-time-stamp">{selectedMessage.time}</div>
                      </div>
                    </div>
                    <div className="inbox-detail-body">
                      {selectedMessage.body.split("\n").map((para, i) => (
                        <p key={i} style={{ marginBottom: "12px" }}>
                          {para}
                        </p>
                      ))}
                    </div>
                    <div className="inbox-detail-reply">
                      <input type="text" placeholder={`Tulis balasan untuk ${selectedMessage.sender}...`} />
                      <button className="btn-primary">Kirim Balasan</button>
                    </div>
                  </>
                ) : (
                  <div className="inbox-detail-empty">
                    <Mail size={48} className="inbox-detail-empty-icon" />
                    <p>Pilih pesan dari menu kiri untuk membaca detail isi email.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. RESELLER VIEW */}
          {activeTab === "reseller" && (
            <div>
              <div className="table-controls" style={{ marginBottom: "25px" }}>
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Cari nama reseller atau wilayah..." />
                </div>
                <button className="btn-primary">
                  <Plus size={16} /> Tambah Reseller
                </button>
              </div>

              <div className="reseller-grid">
                {resellers.map((reseller) => (
                  <div className="reseller-card" key={reseller.id}>
                    <img src={reseller.avatar} alt={reseller.name} className="reseller-avatar-large" />
                    <div className="reseller-name">{reseller.name}</div>
                    <div className="reseller-region">
                      <MapPin size={14} className="text-muted" />
                      <span>{reseller.region}</span>
                    </div>
                    <div className="reseller-stats-row">
                      <div className="reseller-stat-item">
                        <span className="reseller-stat-val">{reseller.sales}</span>
                        <span className="reseller-stat-lbl">Penjualan</span>
                      </div>
                      <div className="reseller-stat-item">
                        <span className="reseller-stat-val">★ {reseller.rating}</span>
                        <span className="reseller-stat-lbl">Rating</span>
                      </div>
                    </div>
                    <button className="btn-secondary" style={{ width: "100%" }}>
                      Hubungi Agen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SIMPAN (BOOKMARKS) VIEW */}
          {activeTab === "simpan" && (
            <div className="dashboard-panel">
              <div className="saved-list">
                {savedItems.map((item) => (
                  <div className="saved-item-row" key={item.id}>
                    <div className="saved-item-info">
                      <div className="saved-item-icon-box">
                        {item.type === "Bisnis" ? <Briefcase size={20} /> : <Calendar size={20} />}
                      </div>
                      <div className="saved-item-text">
                        <h3>{item.title}</h3>
                        <p>
                          {item.type} • {item.date}
                        </p>
                      </div>
                    </div>
                    <button
                      className="action-btn delete"
                      title="Hapus bookmark"
                      onClick={() => setSavedItems(savedItems.filter((i) => i.id !== item.id))}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. ULASAN VIEW */}
          {activeTab === "ulasan" && (
            <div className="reviews-feed">
              {reviews.map((rev) => (
                <div className="review-card" key={rev.id}>
                  <div className="review-card-header">
                    <div className="reviewer-meta">
                      <img src={rev.avatar} alt={rev.user} className="reviewer-avatar" />
                      <div>
                        <div className="reviewer-name">{rev.user}</div>
                        <div className="reviewed-target">
                          Mengulas: <strong>{rev.target}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="review-rating-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.floor(rev.rating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <div className="review-content">"{rev.text}"</div>
                  <div className="review-actions-bar">
                    <span className="review-date">Diposting pada {rev.date}</span>
                    <span className="review-reply-btn">Balas Ulasan</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 8. PREMIUM VIEW */}
          {activeTab === "premium" && (
            <div className="premium-container">
              <div className="premium-header">
                <Crown size={32} className="premium-icon" />
                <div>
                  <h2>Upgrade ke Premium</h2>
                  <p>Dapatkan fitur eksklusif untuk bisnis Anda</p>
                </div>
              </div>

              <div className="premium-plans-grid">
                {/* Free Plan */}
                <div className="premium-plan-card free-plan">
                  <div className="plan-header">
                    <h3>Gratis</h3>
                    <div className="plan-price">Rp 0</div>
                    <div className="plan-period">selamanya</div>
                  </div>
                  <ul className="plan-features">
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>1 Bisnis</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Listing dasar</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Ulasan pelanggan</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Chat via Inbox</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>WhatsApp & Email</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Galeri Foto</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Link Video</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Google Maps</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Tambah Produk</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Sosial Media</span>
                    </li>
                    <li className="feature-item disabled">
                      <X size={16} className="feature-icon" />
                      <span>Add Blog & Event</span>
                    </li>
                  </ul>
                  <button className="plan-btn plan-btn--disabled" disabled>Paket Saat Ini</button>
                </div>

                {/* Premium Plan */}
                <div className="premium-plan-card premium-plan">
                  <div className="plan-badge">POPULER</div>
                  <div className="plan-header">
                    <h3>Premium</h3>
                    <div className="plan-price">Rp 150.000</div>
                    <div className="plan-period">/bulan</div>
                  </div>
                  <ul className="plan-features">
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Chat via Inbox</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>WhatsApp & Email</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Galeri Foto</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Link Video</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Google Maps</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Tambah Produk</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Sosial Media</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Add Blog & Event</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Badge Premium</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Listing Prioritas</span>
                    </li>
                    <li className="feature-item">
                      <Check size={16} className="feature-icon" />
                      <span>Support Prioritas</span>
                    </li>
                  </ul>
                  <button className="plan-btn plan-btn--primary">Upgrade Sekarang</button>
                </div>
              </div>

              <div className="premium-benefits">
                <h3>Keuntungan Premium</h3>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <MessageSquare size={24} className="benefit-icon" />
                    <div>
                      <h4>Chat via Inbox</h4>
                      <p>Komunikasi langsung dengan pelanggan melalui inbox</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <Phone size={24} className="benefit-icon" />
                    <div>
                      <h4>WhatsApp & Email</h4>
                      <p>Tampilkan kontak WA dan email untuk bisnis Anda</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <ImageIcon size={24} className="benefit-icon" />
                    <div>
                      <h4>Galeri Foto</h4>
                      <p>Upload galeri foto untuk menampilkan produk</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <Video size={24} className="benefit-icon" />
                    <div>
                      <h4>Link Video</h4>
                      <p>Embed video untuk promosi bisnis Anda</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <MapPin size={24} className="benefit-icon" />
                    <div>
                      <h4>Google Maps</h4>
                      <p>Integrasi lokasi bisnis dengan Google Maps</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <Package size={24} className="benefit-icon" />
                    <div>
                      <h4>Tambah Produk</h4>
                      <p>Kelola dan produk jualan Anda dengan mudah</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <Share2 size={24} className="benefit-icon" />
                    <div>
                      <h4>Sosial Media</h4>
                      <p>Link sosial media untuk branding bisnis</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <FileText size={24} className="benefit-icon" />
                    <div>
                      <h4>Add Blog & Event</h4>
                      <p>Publish blog dan event untuk promosi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. IKLAN VIEW */}
          {activeTab === "iklan" && (
            <div className="iklan-container">
              <div className="iklan-header">
                <Megaphone size={32} className="iklan-icon" />
                <div>
                  <h2>Pasang Iklan</h2>
                  <p>Promosikan bisnis Anda ke ribuan pengunjung</p>
                </div>
              </div>

              {/* Advertisement Submission Form */}
              <div className="iklan-form-section">
                <h3>Ajukan Iklan Baru</h3>
                <div className="iklan-form-grid">
                  <div className="form-group">
                    <label>Pilih Bisnis</label>
                    <select 
                      value={selectedBusinessForAd || ''} 
                      onChange={(e) => setSelectedBusinessForAd(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Pilih Bisnis --</option>
                      {businesses.map(biz => (
                        <option key={biz.id} value={biz.id}>{biz.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Pilih Paket</label>
                    <select 
                      value={selectedPackage || ''} 
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Pilih Paket --</option>
                      <option value="basic">Basic - Rp 50.000 (7 hari)</option>
                      <option value="standard">Standard - Rp 150.000 (30 hari)</option>
                      <option value="premium">Premium - Rp 350.000 (90 hari)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Catatan (Opsional)</label>
                    <textarea 
                      value={adNotes}
                      onChange={(e) => setAdNotes(e.target.value)}
                      className="form-textarea"
                      placeholder="Tambahkan catatan untuk admin..."
                      rows={3}
                    />
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleAdSubmit}
                  disabled={submittingAd}
                >
                  {submittingAd ? 'Mengajukan...' : 'Ajukan Iklan'}
                </button>
              </div>

              {/* Existing Advertisements */}
              <div className="iklan-list-section">
                <h3>Iklan Saya</h3>
                {loadingAdvertisements ? (
                  <div className="loading-state">
                    <Loader2 size={32} className="spin" />
                    <p>Memuat iklan...</p>
                  </div>
                ) : advertisements.length === 0 ? (
                  <div className="empty-state">
                    <Megaphone size={48} style={{ opacity: 0.5 }} />
                    <p>Belum ada iklan yang diajukan</p>
                  </div>
                ) : (
                  <div className="iklan-list">
                    {advertisements.map(ad => (
                      <div key={ad.id} className="iklan-card">
                        <div className="iklan-card-header">
                          <div>
                            < h4>{ad.business?.name || 'Bisnis'}</h4>
                            <span className={`badge ${ad.status}`}>{ad.status}</span>
                            <span className={`badge ${ad.payment_status}`}>{ad.payment_status}</span>
                          </div>
                          <div className="iklan-package">
                            <span className="package-name">{ad.package_name}</span>
                            <span className="package-price">Rp {ad.price?.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                        
                        <div className="iklan-card-body">
                          <div className="iklan-details">
                            <div className="detail-item">
                              <span>Durasi:</span>
                              <span>{ad.duration_days} hari</span>
                            </div>
                            {ad.start_date && (
                              <div className="detail-item">
                                <span>Mulai:</span>
                                <span>{new Date(ad.start_date).toLocaleDateString('id-ID')}</span>
                              </div>
                            )}
                            {ad.end_date && (
                              <div className="detail-item">
                                <span>Selesai:</span>
                                <span>{new Date(ad.end_date).toLocaleDateString('id-ID')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="iklan-card-actions">
                          {ad.payment_status === 'unpaid' && ad.status === 'pending' && (
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleAdPayment(ad.id)}
                            >
                              Bayar Sekarang
                            </button>
                          )}
                          {ad.status === 'pending' && (
                            <button 
                              className="btn btn-danger"
                              onClick={() => handleAdCancel(ad.id)}
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="iklan-benefits">
                <h3>Keuntungan Beriklan</h3>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <Eye size={24} className="benefit-icon" />
                    <div>
                      <h4>Visibilitas Tinggi</h4>
                      <p>Bisnis Anda tampil di halaman utama dengan posisi strategis</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <Target size={24} className="benefit-icon" />
                    <div>
                      <h4>Target Tepat</h4>
                      <p>Menjangkau audiens yang relevan dengan bisnis Anda</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <TrendingUp size={24} className="benefit-icon" />
                    <div>
                      <h4>Traffic Meningkat</h4>
                      <p>Tingkatkan kunjungan dan potensi konversi</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <BarChart size={24} className="benefit-icon" />
                    <div>
                      <h4>Laporan Detail</h4>
                      <p>Pantau performa iklan dengan statistik lengkap</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. PRODUK VIEW */}
          {activeTab === "produk" && (
            <div className="produk-container">
              <div className="produk-header">
                <Package size={32} className="produk-icon" />
                <div>
                  <h2>Manajemen Produk</h2>
                  <p>Kelola produk untuk bisnis Anda</p>
                </div>
              </div>

              {/* Business Selection */}
              <div className="business-selector">
                <label>Pilih Bisnis:</label>
                <select
                  value={selectedBusinessForProducts || ""}
                  onChange={(e) => setSelectedBusinessForProducts(e.target.value)}
                  className="business-select"
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
                  <div className="produk-controls">
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Cari nama produk..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={() => navigate(`/add-product/${selectedBusinessForProducts}`)} disabled={!selectedBusinessForProducts}>
                      <Plus size={16} /> Tambah Produk
                    </button>
                  </div>

                  {loadingProducts ? (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 20px" }}>
                      <Loader2 size={40} className="spin" style={{ color: "#007570" }} />
                    </div>
                  ) : products && products.length > 0 ? (
                    (() => {
                      const filtered = products.filter(p =>
                        !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
                      );
                      return filtered.length > 0 ? (
                        <div className="produk-grid">
                          {filtered.map((product) => (
                            <div key={product.id} className="produk-card">
                              <div className="produk-card__image">
                                <img
                                  src={product.image ? getStorageUrl(product.image) : "https://via.placeholder.com/200"}
                                  alt={product.name}
                                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/200"; }}
                                />
                              </div>
                              <div className="produk-card__content">
                                <h4 className="produk-card__name">{product.name}</h4>
                                <p className="produk-card__price">
                                  {product.price != null
                                    ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
                                    : "-"}
                                </p>
                                <p className="produk-card__description">{product.description || "-"}</p>
                                <div className="produk-card__actions">
                                  <button className="action-btn edit" title="Edit" onClick={() => handleEditProduct(product)}>
                                    <Edit size={16} />
                                  </button>
                                  <button className="action-btn delete" title="Hapus" onClick={() => handleDeleteProduct(product.id)}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                          <Search size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
                          <p style={{ fontSize: "14px" }}>Tidak ada produk yang cocok dengan pencarian.</p>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                      <Package size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Produk</h3>
                      <p style={{ fontSize: "13px", marginBottom: "20px" }}>Bisnis ini belum memiliki produk</p>
                      <button className="btn-primary" onClick={() => navigate(`/add-product/${selectedBusinessForProducts}`)}>
                        <Plus size={16} /> Tambah Produk Pertama
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                  <Briefcase size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Pilih Bisnis Terlebih Dahulu</h3>
                  <p style={{ fontSize: "13px" }}>Silakan pilih bisnis untuk mengelola produknya</p>
                </div>
              )}
            </div>
          )}

          {/* 11. PROFILE VIEW */}
          {activeTab === "profile" && (
            <div className="profile-settings-container">
              <div className="profile-settings-layout">
                {/* ── LEFT COLUMN: Banner & Foto Profile ── */}
                <div className="profile-left-card">
                  {/* Banner Section */}
                  <div className="profile-banner-box">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner"
                        className="profile-banner-img"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div
                      className="profile-banner-placeholder"
                      style={{ display: bannerPreview ? 'none' : 'flex' }}
                    >
                      <ImageIcon size={32} />
                      <span>Banner Profil</span>
                    </div>

                    <button
                      type="button"
                      className="profile-banner-edit-btn"
                      onClick={() => setShowBannerOptions(!showBannerOptions)}
                      title="Ubah Banner"
                    >
                      <Camera size={16} />
                    </button>

                    {showBannerOptions && (
                      <div className="profile-photo-dropdown">
                        <button
                          type="button"
                          className="photo-dropdown-item"
                          onClick={() => document.getElementById('admin-banner-upload').click()}
                        >
                          <Upload size={14} />
                          <span>Upload Banner</span>
                        </button>
                        <button
                          type="button"
                          className="photo-dropdown-item photo-dropdown-item--danger"
                          onClick={handleRemoveBanner}
                        >
                          <X size={14} />
                          <span>Hapus Banner</span>
                        </button>
                        <input
                          id="admin-banner-upload"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleBannerUpload(e.target.files[0])}
                        />
                      </div>
                    )}
                  </div>

                  {/* Avatar Section */}
                  <div className="profile-avatar-box">
                    <div className="profile-avatar-wrapper">
                      <img
                        src={photoPreview || profileData.avatar}
                        alt="Profile Avatar"
                        className="profile-avatar-img"
                        onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                      />
                      <button
                        type="button"
                        className="profile-avatar-edit-btn"
                        onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                        title="Ubah Foto Profil"
                      >
                        <Camera size={14} />
                      </button>

                      {showPhotoOptions && (
                        <div className="profile-photo-dropdown profile-photo-dropdown--avatar">
                          <button
                            type="button"
                            className="photo-dropdown-item"
                            onClick={() => document.getElementById('admin-photo-upload').click()}
                          >
                            <Upload size={14} />
                            <span>Upload Foto</span>
                          </button>
                          <button
                            type="button"
                            className="photo-dropdown-item"
                            onClick={handleCameraCapture}
                          >
                            <Camera size={14} />
                            <span>Ambil Foto</span>
                          </button>
                          <button
                            type="button"
                            className="photo-dropdown-item photo-dropdown-item--danger"
                            onClick={handleRemovePhoto}
                          >
                            <X size={14} />
                            <span>Hapus Foto</span>
                          </button>
                          <input
                            id="admin-photo-upload"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handlePhotoUpload(e.target.files[0])}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Left Meta Info (Email & Role) */}
                  <div className="profile-left-meta">
                    <p className="profile-meta-email">{profileData.email || user.email}</p>
                    <span className="profile-meta-role">{profileData.role || user.role || "Administrator"}</span>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Informasi Pribadi Form ── */}
                <div className="profile-right-card">
                  <h3 className="profile-form-title">Informasi Pribadi</h3>
                  <form onSubmit={handleSaveProfile} className="profile-form">
                    <div className="profile-form-grid">
                      <div className="form-group">
                        <label htmlFor="first-name">Nama Depan</label>
                        <input
                          type="text"
                          id="first-name"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          placeholder="Masukkan nama depan"
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="last-name">Nama Belakang</label>
                        <input
                          type="text"
                          id="last-name"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          placeholder="Masukkan nama belakang"
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="username-field">Username</label>
                        <div className="username-input-wrapper">
                          <input
                            type="text"
                            id="username-field"
                            value={editingUsername ? usernameInput : `@${displayName}`}
                            readOnly={!editingUsername}
                            onChange={(e) => setUsernameInput(e.target.value.replace(/^@/, ''))}
                            onFocus={() => {
                              if (!editingUsername) handleEditUsername();
                            }}
                            className={`profile-input ${editingUsername ? 'editing' : ''}`}
                          />
                          {!editingUsername && (
                            <button
                              type="button"
                              className="username-inline-edit"
                              onClick={handleEditUsername}
                              title="Edit Username"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group form-group--full">
                        <label htmlFor="phone">No. Handphone</label>
                        <input
                          type="text"
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+62 812 3456 7890"
                          className="profile-input"
                        />
                      </div>
                      <div className="form-group form-group--full">
                        <label htmlFor="bio">Tentang Saya (Bio)</label>
                        <textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Ceritakan sedikit tentang diri Anda..."
                          rows={4}
                          className="profile-input profile-textarea"
                        ></textarea>
                      </div>
                    </div>

                    <div className="profile-form-submit">
                      <button
                        type="submit"
                        className="btn-primary-submit"
                        disabled={isUploadingProfile}
                      >
                        {isUploadingProfile ? (
                          <><Loader2 size={18} className="spin" /> Menyimpan...</>
                        ) : (
                          <><Save size={18} /> Simpan Perubahan</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── MODAL EDIT PRODUK ── */}
      {editingProduct && (
        <div
          className="modal-overlay"
          onClick={handleCloseEditModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Edit Produk</h3>
              <button onClick={handleCloseEditModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Nama Produk *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  placeholder="Nama produk"
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Harga *</label>
                <input
                  type="text"
                  name="price"
                  value={editPriceDisplay}
                  onChange={handleEditFormChange}
                  inputMode="numeric"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  placeholder="Contoh: Rp 25.000"
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Deskripsi</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
                  placeholder="Deskripsi produk"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={handleCloseEditModal}
                style={{ flex: 1, padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "14px", color: "#64748b" }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct || !editForm.name || !editForm.price}
                style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#007570", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, opacity: (savingProduct || !editForm.name || !editForm.price) ? 0.6 : 1 }}
              >
                {savingProduct ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

