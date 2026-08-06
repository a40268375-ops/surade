import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Tag,
  Megaphone,
  Crown,
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
import "./AdminWeb.css";

// ── Mini Bar Chart Component ──
const MiniBarChart = ({ data = [], color = "#007570", height = 140, labels = [] }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      {data.map((val, i) => (
        <div key={i} className="chart-bar-wrapper">
          <div
            className="chart-bar"
            style={{
              height: `${(val / max) * 100}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
            }}
          />
          {labels[i] && <span className="chart-label">{labels[i]}</span>}
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
  { id: "blogs", label: "Kelola Blog", icon: <FileText size={20} strokeWidth={1.7} /> },
  { id: "reports", label: "Laporan", icon: <BarChart3 size={20} strokeWidth={1.7} /> },
  { id: "settings", label: "Pengaturan", icon: <Settings size={20} strokeWidth={1.7} /> },
];

export default function AdminWeb() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
  const [showActionMenu, setShowActionMenu] = useState(null);

  // ── Data states ──
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalCategories: 0,
    totalActiveAds: 0,
    totalPremium: 0,
    monthlyRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // Listen for user auth changes
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    try {
      // Fetch stats from admin API
      const statsRes = await api.get('/admin/stats');
      const statsData = statsRes.data || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalBusinesses: statsData.totalBusinesses || 0,
        totalCategories: statsData.totalCategories || 0,
        totalActiveAds: statsData.totalActiveAds || 0,
        totalPremium: statsData.totalPremium || 0,
        monthlyRevenue: statsData.monthlyRevenue || 0,
      });

      // Fetch users from admin API
      const usersRes = await api.get('/admin/users');
      const usersData = usersRes.data?.data || usersRes.data || [];
      const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
      
      setUsers(usersList.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || 'active',
        phone: u.phone || '-',
        joined: u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-',
        businesses: u.businesses_count || 0,
        avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}`
      })));

      // Fetch businesses from admin API
      const businessesRes = await api.get('/admin/businesses');
      const businessesData = businessesRes.data?.data || businessesRes.data || [];
      const businessesList = Array.isArray(businessesData) ? businessesData : (businessesData?.data || []);
      setBusinesses(businessesList);

      // Fetch categories from admin API
      const categoriesRes = await api.get('/admin/categories');
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || [];
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
      setCategories(categoriesList);

      // Fetch blogs from admin API
      const blogsRes = await api.get('/admin/blogs');
      const blogsData = blogsRes.data?.data || blogsRes.data || [];
      const blogsList = Array.isArray(blogsData) ? blogsData : (blogsData?.data || []);
      setBlogs(blogsList);

      // Fetch advertisements from API
      const adsRes = await api.get('/admin/advertisements');
      const adsData = adsRes.data?.data || adsRes.data || [];
      const adsList = Array.isArray(adsData) ? adsData : (adsData?.data || []);
      setAdvertisements(adsList);

      // Fetch payments from admin API
      const paymentsRes = await api.get('/admin/payments');
      const paymentsData = paymentsRes.data?.data || paymentsRes.data || [];
      const paymentsList = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.data || []);
      setPayments(paymentsList);

    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      // Fallback to empty arrays
      setUsers([]);
      setBusinesses([]);
      setCategories([]);
      setBlogs([]);
      setPayments([]);
      setStats({
        totalUsers: 0,
        totalBusinesses: 0,
        totalCategories: 0,
        totalActiveAds: 0,
        totalPremium: 0,
        monthlyRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userAuthChanged"));
    navigate("/login");
  };

  const handleModal = (type, data = null) => {
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
      alert('Iklan berhasil diakhiri');
      fetchAllData();
    } catch (err) {
      console.error('Failed to expire advertisement:', err);
      alert('Gagal mengakhiri iklan');
    }
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
    if (!confirm('Apakah Anda yakin ingin menanggu bisnis ini?')) return;

    try {
      await api.put(`/admin/businesses/${businessId}/suspend`);
      alert('Bisnis berhasil ditanggu');
      fetchAllData();
    } catch (err) {
      console.error('Failed to suspend business:', err);
      alert('Gagal menanggu bisnis');
    }
  };

  // ── Blog handlers ──
  const handleApproveBlog = async (blogId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui blog ini?')) return;

    try {
      await api.put(`/admin/blogs/${blogId}/approve`);
      alert('Blog berhasil disetujui');
      fetchAllData();
    } catch (err) {
      console.error('Failed to approve blog:', err);
      alert('Gagal menyetujui blog');
    }
  };

  const handleRejectBlog = async (blogId) => {
    if (!confirm('Apakah Anda yakin ingin menolak blog ini?')) return;

    try {
      await api.put(`/admin/blogs/${blogId}/reject`);
      alert('Blog berhasil ditolak');
      fetchAllData();
    } catch (err) {
      console.error('Failed to reject blog:', err);
      alert('Gagal menolak blog');
    }
  };

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

  // ── Render functions for each section ──
  const renderDashboard = () => (
    <div className="admin-section">
      <h2 className="admin-section__title">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--users">
                        <Users size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalUsers}</span>
            <span className="admin-stat-card__label">Total User</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+12%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--business">
                        <Building2 size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalBusinesses}</span>
            <span className="admin-stat-card__label">Total Bisnis</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+8%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--category">
                        <Tag size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalCategories}</span>
            <span className="admin-stat-card__label">Total Kategori</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+5%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--ads">
                        <Megaphone size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalActiveAds}</span>
            <span className="admin-stat-card__label">Iklan Aktif</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+15%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--premium">
                        <Crown size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalPremium}</span>
            <span className="admin-stat-card__label">Bisnis Premium</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+20%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--revenue">
                        <DollarSign size={24} strokeWidth={1.7} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">Rp {(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
            <span className="admin-stat-card__label">Pendapatan Bulan Ini</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
                        <TrendingUp size={16} strokeWidth={2} />
            <span>+25%</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Grafik Pendaftaran User</h3>
          <MiniBarChart
            data={[12, 19, 15, 25, 22, 30, 28, 35, 40, 38, 45, 50]}
            color="#007570"
            height={140}
            labels={['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']}
          />
        </div>

        <div className="admin-chart-card">
          <h3 className="admin-chart-card__title">Grafik Bisnis Baru</h3>
          <MiniBarChart
            data={[8, 12, 10, 18, 15, 22, 20, 28, 32, 30, 38, 42]}
            color="#0ea5e9"
            height={140}
            labels={['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-activity">
        <h3 className="admin-recent-activity__title">Aktivitas Terbaru</h3>
        <div className="admin-activity-list">
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--success">
                            <Check size={18} strokeWidth={2} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">Bisnis "Toko Elektronik Jaya" disetujui</span>
              <span className="admin-activity-item__time">2 jam yang lalu</span>
            </div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--warning">
                            <Clock size={18} strokeWidth={2} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">Pembayaran premium dari Budi Santoso menunggu persetujuan</span>
              <span className="admin-activity-item__time">4 jam yang lalu</span>
            </div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--success">
                            <User size={18} strokeWidth={2} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">User baru terdaftar: Dewi Lestari</span>
              <span className="admin-activity-item__time">6 jam yang lalu</span>
            </div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--error">
                            <X size={18} strokeWidth={2} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">Iklan "Warung Makan Sederhana" ditolak</span>
              <span className="admin-activity-item__time">8 jam yang lalu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola User</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => handleModal("addUser")}>
                    <Plus size={18} strokeWidth={2} />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="admin-search-bar">
                <Search size={18} strokeWidth={2} className="admin-search-bar__icon" />
        <input
          type="text"
          placeholder="Cari user..."
          className="admin-search-bar__input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Bisnis</th>
              <th>Tanggal Gabung</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-table-cell--user">
                      <img src={user.avatar} alt={user.name} className="admin-table-cell__avatar" />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${user.status}`}>
                      {user.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>{user.businesses_count ?? 0}</td>
                  <td>{user.joined}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-table-action" onClick={() => handleModal("editUser", user)} title="Edit">
                                                <Edit size={16} strokeWidth={2} />
                      </button>
                      <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteUser", user)} title="Hapus">
                                                <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Bisnis</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => handleModal("addBusiness")}>
                    <Plus size={18} strokeWidth={2} />
          <span>Tambah Bisnis</span>
        </button>
      </div>

      <div className="admin-search-bar">
                <Search size={18} strokeWidth={2} className="admin-search-bar__icon" />
        <input
          type="text"
          placeholder="Cari bisnis..."
          className="admin-search-bar__input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Bisnis</th>
              <th>Kategori</th>
              <th>Pemilik</th>
              <th>Status</th>
              <th>Premium</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {businesses
              .filter((b) =>
                b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.category?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((business) => (
                <tr key={business.id}>
                  <td>
                    <div className="admin-table-cell--business">
                      <img src={business.img || "https://via.placeholder.com/40"} alt={business.name} className="admin-table-cell__img" />
                      <span>{business.name}</span>
                    </div>
                  </td>
                  <td>{business.category?.name ?? "-"}</td>
                  <td>{business.owner || "Unknown"}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${business.status === "published" ? "success" : "warning"}`}>
                      {business.status === "published" ? "Aktif" : "Pending"}
                    </span>
                  </td>
                  <td>
                    {business.is_premium ? (
                      <span className="admin-badge admin-badge--premium">
                                                <Crown size={14} strokeWidth={2} />
                        Premium
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge--gray">Free</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-table-action" onClick={() => handleModal("viewBusiness", business)} title="Lihat">
                                                <Eye size={16} strokeWidth={2} />
                      </button>
                      <button className="admin-table-action" onClick={() => handleModal("editBusiness", business)} title="Edit">
                                                <Edit size={16} strokeWidth={2} />
                      </button>
                      {business.status !== "published" && (
                        <button className="admin-table-action admin-table-action--success" onClick={() => handleModal("approveBusiness", business)} title="Approve">
                                                    <Check size={16} strokeWidth={2} />
                        </button>
                      )}
                      <button className="admin-table-action admin-table-action--warning" onClick={() => handleModal("suspendBusiness", business)} title="Suspend">
                                                <Ban size={16} strokeWidth={2} />
                      </button>
                      <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteBusiness", business)} title="Hapus">
                                                <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Kategori</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => handleModal("addCategory")}>
                    <Plus size={18} strokeWidth={2} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama Kategori</th>
              <th>Warna</th>
              <th>Jumlah Bisnis</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <div className="admin-color-preview" style={{ backgroundColor: category.color }} />
                </td>
                <td>{businesses.filter((b) => b.category === category.name).length}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-table-action" onClick={() => handleModal("editCategory", category)} title="Edit">
                                              <Edit size={16} strokeWidth={2} />
                    </button>
                    <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteCategory", category)} title="Hapus">
                                              <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAds = () => (
    <div className="admin-section admin-section--ads">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Iklan</h2>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats-grid admin-stats-grid--ads">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <Megaphone size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Total Order</p>
            <p className="admin-stat-card__value">{adsStats.totalOrders}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <Clock size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Menunggu Persetujuan</p>
            <p className="admin-stat-card__value">{adsStats.pending}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <Check size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Iklan Aktif</p>
            <p className="admin-stat-card__value">{adsStats.active}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <Activity size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Iklan Selesai</p>
            <p className="admin-stat-card__value">{adsStats.completed}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--danger">
            <X size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Iklan Ditolak</p>
            <p className="admin-stat-card__value">{adsStats.rejected}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--premium">
            <DollarSign size={24} strokeWidth={2} />
          </div>
          <div className="admin-stat-card__content">
            <p className="admin-stat-card__label">Total Pendapatan</p>
            <p className="admin-stat-card__value">Rp {adsStats.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${adsTab === "orders" ? "admin-tab--active" : ""}`}
          onClick={() => setAdsTab("orders")}
        >
          <Megaphone size={18} strokeWidth={1.7} />
          <span>Pesanan Iklan</span>
        </button>
        <button
          className={`admin-tab ${adsTab === "packages" ? "admin-tab--active" : ""}`}
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
          <div className="admin-filter-section">
            <div className="admin-filter-row">
              <div className="admin-filter-group">
                <Search size={16} className="admin-filter-icon" />
                <input
                  type="text"
                  placeholder="Cari nama bisnis / pemilik..."
                  value={adsFilters.search}
                  onChange={(e) => setAdsFilters({ ...adsFilters, search: e.target.value })}
                  className="admin-filter-input"
                />
              </div>
              <select
                value={adsFilters.status}
                onChange={(e) => setAdsFilters({ ...adsFilters, status: e.target.value })}
                className="admin-filter-select"
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
                className="admin-filter-select"
              >
                <option value="">Semua Paket</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={adsFilters.payment}
                onChange={(e) => setAdsFilters({ ...adsFilters, payment: e.target.value })}
                className="admin-filter-select"
              >
                <option value="">Semua Pembayaran</option>
                <option value="paid">Lunas</option>
                <option value="unpaid">Belum Bayar</option>
              </select>
              <input
                type="date"
                value={adsFilters.dateFrom}
                onChange={(e) => setAdsFilters({ ...adsFilters, dateFrom: e.target.value })}
                className="admin-filter-input admin-filter-input--date"
              />
              <input
                type="date"
                value={adsFilters.dateTo}
                onChange={(e) => setAdsFilters({ ...adsFilters, dateTo: e.target.value })}
                className="admin-filter-input admin-filter-input--date"
              />
              <button className="admin-filter-btn admin-filter-btn--primary">
                <Filter size={16} strokeWidth={1.7} />
                Filter
              </button>
              <button
                className="admin-filter-btn admin-filter-btn--secondary"
                onClick={() => setAdsFilters({ search: "", status: "", package: "", payment: "", dateFrom: "", dateTo: "" })}
              >
                <RefreshCw size={16} strokeWidth={1.7} />
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="admin-table-container admin-table-container--ads">
            <table className="admin-table admin-table--ads">
              <thead>
                <tr>
                  <th>Bisnis</th>
                  <th>Pemilik</th>
                  <th>Email</th>
                  <th>Paket</th>
                  <th>Harga</th>
                  <th>Status</th>
                  <th>Pembayaran</th>
                  <th>Bukti</th>
                  <th>Tanggal</th>
                  <th>Periode</th>
                  <th>Expired</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="admin-table-empty">
                      <div className="admin-empty-state">
                        <Megaphone size={64} strokeWidth={1} className="admin-empty-state__icon" />
                        <p className="admin-empty-state__text">Belum ada pengajuan iklan.</p>
                        <button className="admin-empty-state__btn">
                          Lihat Paket Iklan
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  advertisements.map((ad) => (
                    <tr key={ad.id}>
                      <td>
                        <div className="admin-table-cell--business">
                          <img
                            src={ad.business?.logo || "https://via.placeholder.com/40"}
                            alt={ad.business?.name}
                            className="admin-table-cell__img"
                          />
                          <span>{ad.business?.name || '-'}</span>
                        </div>
                      </td>
                      <td>{ad.user?.name || '-'}</td>
                      <td>{ad.user?.email || '-'}</td>
                      <td>
                        <span className="admin-table-cell--package">
                          {ad.package_name}
                        </span>
                      </td>
                      <td>Rp {ad.price?.toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${ad.status}`}>
                          {ad.status === 'approved' ? 'Aktif' : ad.status === 'rejected' ? 'Ditolak' : ad.status === 'expired' ? 'Kedaluwarsa' : ad.status === 'completed' ? 'Selesai' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${ad.payment_status}`}>
                          {ad.payment_status === 'paid' ? 'Lunas' : ad.payment_status === 'unpaid' ? 'Belum Bayar' : ad.payment_status}
                        </span>
                      </td>
                      <td>
                        {ad.payment_proof ? (
                          <button
                            className="admin-table-link"
                            onClick={() => window.open(ad.payment_proof, '_blank')}
                          >
                            <Eye size={14} strokeWidth={2} />
                            Lihat
                          </button>
                        ) : (
                          <span className="admin-table-cell--empty">-</span>
                        )}
                      </td>
                      <td>{ad.created_at ? new Date(ad.created_at).toLocaleDateString('id-ID') : '-'}</td>
                      <td>{ad.duration || '-'}</td>
                      <td>{ad.expired_at ? new Date(ad.expired_at).toLocaleDateString('id-ID') : '-'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <div className="admin-action-dropdown">
                            <button
                              className="admin-table-action"
                              onClick={() => setShowActionMenu(showActionMenu === ad.id ? null : ad.id)}
                            >
                              <MoreHorizontal size={16} strokeWidth={2} />
                            </button>
                            {showActionMenu === ad.id && (
                              <div className="admin-action-menu">
                                <button
                                  className="admin-action-item"
                                  onClick={() => {
                                    handleModal("viewAdDetail", ad);
                                    setShowActionMenu(null);
                                  }}
                                >
                                  <Eye size={14} strokeWidth={2} />
                                  Lihat Detail
                                </button>
                                {ad.status === 'pending' && ad.payment_status === 'paid' && (
                                  <button
                                    className="admin-action-item admin-action-item--success"
                                    onClick={() => {
                                      handleApproveAd(ad.id);
                                      setShowActionMenu(null);
                                    }}
                                  >
                                    <Check size={14} strokeWidth={2} />
                                    Approve
                                  </button>
                                )}
                                {ad.status === 'pending' && (
                                  <button
                                    className="admin-action-item admin-action-item--danger"
                                    onClick={() => {
                                      handleRejectAd(ad.id);
                                      setShowActionMenu(null);
                                    }}
                                  >
                                    <X size={14} strokeWidth={2} />
                                    Reject
                                  </button>
                                )}
                                {ad.status === 'approved' && (
                                  <>
                                    <button
                                      className="admin-action-item admin-action-item--warning"
                                      onClick={() => {
                                        handleExpireAd(ad.id);
                                        setShowActionMenu(null);
                                      }}
                                    >
                                      <Clock size={14} strokeWidth={2} />
                                      Nonaktifkan
                                    </button>
                                    <button
                                      className="admin-action-item"
                                      onClick={() => {
                                        handleModal("extendAd", ad);
                                        setShowActionMenu(null);
                                      }}
                                    >
                                      <RefreshCw size={14} strokeWidth={2} />
                                      Perpanjang
                                    </button>
                                  </>
                                )}
                                <button
                                  className="admin-action-item"
                                  onClick={() => {
                                    handleModal("completeAd", ad);
                                    setShowActionMenu(null);
                                  }}
                                >
                                  <Check size={14} strokeWidth={2} />
                                  Tandai Selesai
                                </button>
                                <button
                                  className="admin-action-item admin-action-item--danger"
                                  onClick={() => {
                                    handleModal("deleteAd", ad);
                                    setShowActionMenu(null);
                                  }}
                                >
                                  <Trash2 size={14} strokeWidth={2} />
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
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
        <div className="admin-packages-grid">
          {packages.length === 0 ? (
            <div className="admin-empty-state admin-empty-state--full">
              <Crown size={64} strokeWidth={1} className="admin-empty-state__icon" />
              <p className="admin-empty-state__text">Belum ada paket iklan.</p>
              <button
                className="admin-empty-state__btn"
                onClick={() => handleModal("addPackage", null)}
              >
                <Plus size={16} strokeWidth={2} />
                Tambah Paket
              </button>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg.id} className="admin-package-card">
                <div className="admin-package-card__header">
                  <div className="admin-package-card__icon">
                    <Crown size={32} strokeWidth={2} />
                  </div>
                  <h3 className="admin-package-card__name">{pkg.name}</h3>
                  <p className="admin-package-card__price">Rp {pkg.price?.toLocaleString('id-ID')}</p>
                </div>
                <div className="admin-package-card__body">
                  <div className="admin-package-card__info">
                    <span className="admin-package-card__label">Durasi</span>
                    <span className="admin-package-card__value">{pkg.duration}</span>
                  </div>
                  <div className="admin-package-card__info">
                    <span className="admin-package-card__label">Fitur</span>
                    <span className="admin-package-card__value">{pkg.features_count || 0} fitur</span>
                  </div>
                  <div className="admin-package-card__info">
                    <span className="admin-package-card__label">User Aktif</span>
                    <span className="admin-package-card__value">{pkg.active_users || 0}</span>
                  </div>
                  <div className="admin-package-card__info">
                    <span className="admin-package-card__label">Pendapatan</span>
                    <span className="admin-package-card__value">Rp {pkg.revenue?.toLocaleString('id-ID') || 0}</span>
                  </div>
                </div>
                <div className="admin-package-card__footer">
                  <button
                    className="admin-package-card__btn admin-package-card__btn--edit"
                    onClick={() => handleModal("editPackage", pkg)}
                  >
                    <Edit size={16} strokeWidth={2} />
                    Edit
                  </button>
                  <button
                    className="admin-package-card__btn admin-package-card__btn--delete"
                    onClick={() => handleModal("deletePackage", pkg)}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderPremium = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Paket Premium</h2>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Paket</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.userName}</td>
                <td>{payment.package}</td>
                <td>Rp {payment.amount.toLocaleString()}</td>
                <td>
                  <span className={`admin-badge admin-badge--${payment.status}`}>
                    {payment.status === "approved" ? "Disetujui" : "Menunggu"}
                  </span>
                </td>
                <td>{payment.date}</td>
                <td>
                  <div className="admin-table-actions">
                    {payment.status === "pending" && (
                      <>
                        <button className="admin-table-action admin-table-action--success" onClick={() => handleModal("approvePayment", payment)} title="Approve">
                                                    <Check size={16} strokeWidth={2} />
                        </button>
                        <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("rejectPayment", payment)} title="Tolak">
                                                <X size={16} strokeWidth={2} />
                        </button>
                      </>
                    )}
                    <button className="admin-table-action" onClick={() => handleModal("changePremiumStatus", payment)} title="Ubah Status">
                                            <RefreshCw size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBlogs = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Blog</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => handleModal("addBlog")}>
                    <Plus size={18} strokeWidth={2} />
          <span>Tambah Artikel</span>
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Penulis</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td>{blog.title}</td>
                <td>{blog.author || "Admin"}</td>
                <td>{blog.category?.name ?? "Umum"}</td>
                <td>{blog.created_at || "2024-07-20"}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-table-action" onClick={() => handleModal("editBlog", blog)} title="Edit">
                                              <Edit size={16} strokeWidth={2} />
                    </button>
                    <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteBlog", blog)} title="Hapus">
                                              <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Laporan</h2>
        <button className="admin-btn admin-btn--secondary" onClick={() => handleModal("downloadReport")}>
                    <Download size={18} strokeWidth={2} />
          <span>Download PDF/Excel</span>
        </button>
      </div>

      <div className="admin-reports-grid">
        <div className="admin-report-card">
          <div className="admin-report-card__icon">
                        <Eye size={24} strokeWidth={1.7} />
          </div>
          <h3 className="admin-report-card__title">Jumlah Pengunjung</h3>
          <span className="admin-report-card__value">12,458</span>
          <span className="admin-report-card__change admin-report-card__change--up">+15% dari bulan lalu</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
                        <Building2 size={24} strokeWidth={1.7} />
          </div>
          <h3 className="admin-report-card__title">Bisnis Paling Banyak Dilihat</h3>
          <span className="admin-report-card__value">Toko Elektronik Jaya</span>
          <span className="admin-report-card__change">2,345 views</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
                        <Tag size={24} strokeWidth={1.7} />
          </div>
          <h3 className="admin-report-card__title">Kategori Terpopuler</h3>
          <span className="admin-report-card__value">Cafe & Restaurant</span>
          <span className="admin-report-card__change">45 bisnis aktif</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
                        <DollarSign size={24} strokeWidth={1.7} />
          </div>
          <h3 className="admin-report-card__title">Pendapatan</h3>
          <span className="admin-report-card__value">Rp 1,250,000</span>
          <span className="admin-report-card__change admin-report-card__change--up">+25% dari bulan lalu</span>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-section">
      <h2 className="admin-section__title">Pengaturan Website</h2>

      <div className="admin-settings-grid">
        <div className="admin-settings-card">
          <h3 className="admin-settings-card__title">Informasi Website</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">Nama Website</label>
            <input type="text" className="admin-form-input" defaultValue="Info.co.id" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Logo</label>
            <input type="file" className="admin-form-input" accept="image/*" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Banner</label>
            <input type="file" className="admin-form-input" accept="image/*" multiple />
          </div>
        </div>

        <div className="admin-settings-card">
          <h3 className="admin-settings-card__title">Kontak</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input type="email" className="admin-form-input" defaultValue="info@info.co.id" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Telepon</label>
            <input type="tel" className="admin-form-input" defaultValue="+62 21 1234 5678" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Alamat</label>
            <textarea className="admin-form-textarea" defaultValue="Jakarta, Indonesia" rows={3} />
          </div>
        </div>

        <div className="admin-settings-card">
          <h3 className="admin-settings-card__title">Media Sosial</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">            <Globe size={16} strokeWidth={2} /> Instagram</label>
            <input type="url" className="admin-form-input" defaultValue="https://instagram.com/info.co.id" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">            <Globe size={16} strokeWidth={2} /> Facebook</label>
            <input type="url" className="admin-form-input" defaultValue="https://facebook.com/info.co.id" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">            <Globe size={16} strokeWidth={2} /> Website</label>
            <input type="url" className="admin-form-input" defaultValue="https://info.co.id" />
          </div>
        </div>

        <div className="admin-settings-card">
          <h3 className="admin-settings-card__title">SEO Dasar</h3>
          <div className="admin-form-group">
            <label className="admin-form-label">Meta Title</label>
            <input type="text" className="admin-form-input" defaultValue="Info.co.id - Semua Ada Disini" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Meta Description</label>
            <textarea className="admin-form-textarea" defaultValue="Platform informasi bisnis terlengkap di Indonesia" rows={3} />
          </div>
        </div>
      </div>

      <button className="admin-btn admin-btn--primary">Simpan Perubahan</button>
    </div>
  );

  const renderNotifications = () => (
    <div className="admin-section">
      <h2 className="admin-section__title">Notifikasi</h2>

      <div className="admin-notifications-list">
        <div className="admin-notification-item admin-notification-item--unread">
          <div className="admin-notification-item__icon admin-notification-item__icon--warning">
                          <Clock size={18} strokeWidth={2} />
          </div>
          <div className="admin-notification-item__content">
            <span className="admin-notification-item__title">Bisnis Menunggu Persetujuan</span>
            <span className="admin-notification-item__text">3 bisnis baru menunggu persetujuan admin</span>
            <span className="admin-notification-item__time">Baru saja</span>
          </div>
          <button className="admin-notification-item__action">Lihat</button>
        </div>

        <div className="admin-notification-item admin-notification-item--unread">
          <div className="admin-notification-item__icon admin-notification-item__icon--success">
                        <DollarSign size={18} strokeWidth={2} />
          </div>
          <div className="admin-notification-item__content">
            <span className="admin-notification-item__title">Pembayaran Baru</span>
            <span className="admin-notification-item__text">2 pembayaran premium baru masuk</span>
            <span className="admin-notification-item__time">1 jam yang lalu</span>
          </div>
          <button className="admin-notification-item__action">Lihat</button>
        </div>

        <div className="admin-notification-item">
          <div className="admin-notification-item__icon admin-notification-item__icon--info">
                        <AlertTriangle size={18} strokeWidth={2} />
          </div>
          <div className="admin-notification-item__content">
            <span className="admin-notification-item__title">Laporan dari User</span>
            <span className="admin-notification-item__text">1 laporan baru dari user tentang bisnis</span>
            <span className="admin-notification-item__time">3 jam yang lalu</span>
          </div>
          <button className="admin-notification-item__action">Lihat</button>
        </div>

        <div className="admin-notification-item">
          <div className="admin-notification-item__icon admin-notification-item__icon--success">
                          <User size={18} strokeWidth={2} />
          </div>
          <div className="admin-notification-item__content">
            <span className="admin-notification-item__title">User Baru Terdaftar</span>
            <span className="admin-notification-item__text">Dewi Lestari mendaftar sebagai user baru</span>
            <span className="admin-notification-item__time">6 jam yang lalu</span>
          </div>
          <button className="admin-notification-item__action">Lihat</button>
        </div>
      </div>
    </div>
  );

  // ── Modal Component ──
  const renderModal = () => {
    if (!modal.show) return null;

    return (
      <div className="admin-modal-overlay" onClick={closeModal}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal__header">
            <h3 className="admin-modal__title">
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
              {modal.type === "addPackage" && "Tambah Paket"}
              {modal.type === "editPackage" && "Edit Paket"}
              {modal.type === "deletePackage" && "Hapus Paket"}
              {modal.type === "extendAd" && "Perpanjang Iklan"}
              {modal.type === "completeAd" && "Tandai Selesai"}
              {modal.type === "deleteAd" && "Hapus Iklan"}
            </h3>
            <button className="admin-modal__close" onClick={closeModal}>
                            <CloseIcon size={20} strokeWidth={2} />
            </button>
          </div>
          <div className="admin-modal__body">
            {modal.type === "viewAdDetail" && modal.data && (
              <div className="admin-modal-detail">
                <div className="admin-modal-detail__section">
                  <h4 className="admin-modal-detail__title">Informasi Bisnis</h4>
                  <div className="admin-modal-detail__row">
                    <img
                      src={modal.data.business?.logo || "https://via.placeholder.com/60"}
                      alt={modal.data.business?.name}
                      className="admin-modal-detail__logo"
                    />
                    <div className="admin-modal-detail__info">
                      <p className="admin-modal-detail__label">Nama Bisnis</p>
                      <p className="admin-modal-detail__value">{modal.data.business?.name || '-'}</p>
                      <p className="admin-modal-detail__label">Pemilik</p>
                      <p className="admin-modal-detail__value">{modal.data.user?.name || '-'}</p>
                      <p className="admin-modal-detail__label">Email</p>
                      <p className="admin-modal-detail__value">{modal.data.user?.email || '-'}</p>
                      <p className="admin-modal-detail__label">Nomor HP</p>
                      <p className="admin-modal-detail__value">{modal.data.user?.phone || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-detail__divider" />
                <div className="admin-modal-detail__section">
                  <h4 className="admin-modal-detail__title">Informasi Paket</h4>
                  <div className="admin-modal-detail__info">
                    <p className="admin-modal-detail__label">Nama Paket</p>
                    <p className="admin-modal-detail__value">{modal.data.package_name || '-'}</p>
                    <p className="admin-modal-detail__label">Harga</p>
                    <p className="admin-modal-detail__value">Rp {modal.data.price?.toLocaleString('id-ID') || 0}</p>
                    <p className="admin-modal-detail__label">Durasi</p>
                    <p className="admin-modal-detail__value">{modal.data.duration || '-'}</p>
                    <p className="admin-modal-detail__label">Fitur Paket</p>
                    <div className="admin-modal-detail__features">
                      <span className="admin-modal-detail__feature">✓ Banner Homepage</span>
                      <span className="admin-modal-detail__feature">✓ Prioritas Pencarian</span>
                      <span className="admin-modal-detail__feature">✓ Highlight Listing</span>
                      <span className="admin-modal-detail__feature">✓ Badge Premium</span>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-detail__divider" />
                <div className="admin-modal-detail__section">
                  <h4 className="admin-modal-detail__title">Informasi Pembayaran</h4>
                  <div className="admin-modal-detail__info">
                    <p className="admin-modal-detail__label">Metode Pembayaran</p>
                    <p className="admin-modal-detail__value">{modal.data.payment_method || 'Transfer Bank'}</p>
                    <p className="admin-modal-detail__label">Nominal</p>
                    <p className="admin-modal-detail__value">Rp {modal.data.price?.toLocaleString('id-ID') || 0}</p>
                    <p className="admin-modal-detail__label">Tanggal Bayar</p>
                    <p className="admin-modal-detail__value">{modal.data.paid_at ? new Date(modal.data.paid_at).toLocaleDateString('id-ID') : '-'}</p>
                    <p className="admin-modal-detail__label">Bukti Transfer</p>
                    {modal.data.payment_proof ? (
                      <button
                        className="admin-modal-detail__proof-btn"
                        onClick={() => window.open(modal.data.payment_proof, '_blank')}
                      >
                        <Eye size={14} strokeWidth={2} />
                        Lihat Bukti
                      </button>
                    ) : (
                      <p className="admin-modal-detail__value">-</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {modal.type.includes("delete") || modal.type.includes("reject") ? (
              <p>Apakah Anda yakin ingin menghapus/menolak item ini?</p>
            ) : modal.type === "approvePayment" ? (
              <p>Apakah Anda yakin ingin menyetujui pembayaran ini?</p>
            ) : modal.type === "downloadReport" ? (
              <p>Pilih format laporan yang ingin diunduh:</p>
            ) : modal.type === "extendAd" ? (
              <div className="admin-form-group">
                <label className="admin-form-label">Durasi Perpanjangan (hari)</label>
                <input type="number" className="admin-form-input" defaultValue="30" min="1" />
              </div>
            ) : modal.type === "addPackage" || modal.type === "editPackage" ? (
              <div className="admin-form-group">
                <label className="admin-form-label">Nama Paket</label>
                <input type="text" className="admin-form-input" defaultValue={modal.data?.name || ""} />
                <label className="admin-form-label">Harga</label>
                <input type="number" className="admin-form-input" defaultValue={modal.data?.price || ""} />
                <label className="admin-form-label">Durasi</label>
                <input type="text" className="admin-form-input" defaultValue={modal.data?.duration || ""} />
              </div>
            ) : (
              <div className="admin-form-group">
                <label className="admin-form-label">Nama</label>
                <input type="text" className="admin-form-input" defaultValue={modal.data?.name || ""} />
              </div>
            )}
          </div>
          <div className="admin-modal__footer">
            <button className="admin-btn admin-btn--secondary" onClick={closeModal}>
              Batal
            </button>
            <button className="admin-btn admin-btn--primary" onClick={closeModal}>
              {modal.type.includes("delete") || modal.type.includes("reject") ? "Hapus/Tolak" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
                <RefreshCw className="admin-loading__icon" />
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Header / Brand */}
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-text">Info.co.id</span>
            <span className="admin-sidebar__logo-badge">Admin</span>
          </div>
          {/* Toggle button – always visible inside fixed sidebar, z-index safe */}
          <button
            className="admin-sidebar__toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          >
            {sidebarCollapsed
              ? <ChevronRight size={18} strokeWidth={2} />
              : <ChevronLeft size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar__nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {sidebarCollapsed && (
                <span className="admin-sidebar__tooltip">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Keluar" : undefined}
          >
            <LogOut size={18} strokeWidth={2} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ──
           Uses CSS sibling selector: .admin-sidebar.collapsed ~ .admin-main
           to automatically shift when sidebar collapses. The sidebar is fixed
           (z-index 200) so it always renders above the main content.
      */}
      <main className="admin-main">
        {/* Sticky Header */}
        <header className="admin-header">
          <div className="admin-header__left">
            <Link to="/" className="admin-header__back-btn">
              <ArrowLeft size={16} strokeWidth={2} />
              <span>Kembali ke Website</span>
            </Link>
            <h1 className="admin-header__title">
              {NAV_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="admin-header__right">
            <button
              className="admin-header__notification"
              onClick={() => setActiveTab("notifications")}
              title="Notifikasi"
            >
              <Bell size={18} strokeWidth={1.7} />
              <span className="admin-header__notification-badge">3</span>
            </button>
            <div className="admin-header__user">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || "Admin"}
                className="admin-header__user-avatar"
              />
              <span className="admin-header__user-name">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          {activeTab === "dashboard"     && renderDashboard()}
          {activeTab === "users"         && renderUsers()}
          {activeTab === "businesses"    && renderBusinesses()}
          {activeTab === "categories"    && renderCategories()}
          {activeTab === "ads"           && renderAds()}
          {activeTab === "premium"       && renderPremium()}
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
