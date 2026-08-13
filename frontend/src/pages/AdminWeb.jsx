import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  LayoutDashboard,
  Users,
  Store,
  Tags,
  Megaphone,
  Crown,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Check,
  AlertTriangle,
  Download,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  UserPlus,
  Briefcase,
  Activity,
  Globe,
  Mail,
  Phone,
  Image,
  FileSpreadsheet,
  FileDown,
  MessageSquare,
} from "lucide-react";

// ── Default avatar ──
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop";

// ── Category Modal Form Component ──
function CategoryModalForm({ category, onSubmit, onCancel, categories }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    icon: category?.icon || "",
    parent_id: category?.parent_id || "",
    is_active: category?.is_active !== undefined ? category.is_active : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      ...formData,
      parent_id: formData.parent_id || null,
    };

    const result = await onSubmit(data);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from name if slug is empty
    if (name === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && (
        <div className="admin-form-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-form-group">
        <label className="admin-form-label">Nama Kategori *</label>
        <input
          type="text"
          name="name"
          className="admin-form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="Contoh: Kuliner"
          required
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Slug</label>
        <input
          type="text"
          name="slug"
          className="admin-form-input"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Contoh: kuliner"
        />
        <small className="admin-form-hint">Slug akan digenerate otomatis dari nama jika dikosongkan</small>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Icon</label>
        <input
          type="text"
          name="icon"
          className="admin-form-input"
          value={formData.icon}
          onChange={handleChange}
          placeholder="Contoh: store, coffee, smartphone"
        />
        <small className="admin-form-hint">Nama icon dari Lucide React</small>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Kategori Induk</label>
        <select
          name="parent_id"
          className="admin-form-select"
          value={formData.parent_id}
          onChange={handleChange}
        >
          <option value="">Tidak ada</option>
          {categories
            .filter(c => c.id !== category?.id)
            .map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </div>

      <div className="admin-form-group admin-form-group--checkbox">
        <label className="admin-form-checkbox">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
          <span>Aktif</span>
        </label>
      </div>

      <div className="admin-modal__footer">
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel} disabled={loading}>
          Batal
        </button>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

// ── Sidebar menu items ──
const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "users", label: "Kelola User", icon: <Users size={20} /> },
  { id: "businesses", label: "Kelola Bisnis", icon: <Store size={20} /> },
  { id: "categories", label: "Kelola Kategori", icon: <Tags size={20} /> },
  { id: "ads", label: "Kelola Iklan", icon: <Megaphone size={20} /> },
  { id: "premium", label: "Paket Premium", icon: <Crown size={20} /> },
  { id: "blogs", label: "Kelola Blog", icon: <FileText size={20} /> },
  { id: "reports", label: "Laporan", icon: <BarChart3 size={20} /> },
  { id: "settings", label: "Pengaturan", icon: <Settings size={20} /> },
];

// ── Mock data for dashboard ──
const MOCK_STATS = {
  totalUsers: 1248,
  totalBusinesses: 567,
  totalCategories: 9,
  totalActiveAds: 23,
  totalPremiumBusinesses: 45,
  monthlyRevenue: 28500000,
  userGrowth: [12, 19, 15, 22, 28, 24, 35, 40, 32, 45, 50, 55],
  businessGrowth: [5, 8, 6, 12, 10, 14, 18, 16, 20, 22, 25, 28],
};

const MOCK_USERS = [
  { id: 1, name: "Admin Utama", email: "admin@info.co.id", role: "admin", status: "active", avatar: DEFAULT_AVATAR, joined: "2024-01-15", businesses: 0 },
  { id: 2, name: "Budi Santoso", email: "budi@gmail.com", role: "user", status: "active", avatar: DEFAULT_AVATAR, joined: "2024-03-20", businesses: 2 },
  { id: 3, name: "Siti Nurhaliza", email: "siti@gmail.com", role: "user", status: "active", avatar: DEFAULT_AVATAR, joined: "2024-04-10", businesses: 1 },
  { id: 4, name: "Ahmad Rizki", email: "ahmad@gmail.com", role: "user", status: "inactive", avatar: DEFAULT_AVATAR, joined: "2024-05-05", businesses: 0 },
  { id: 5, name: "Dewi Lestari", email: "dewi@gmail.com", role: "user", status: "active", avatar: DEFAULT_AVATAR, joined: "2024-02-14", businesses: 5 },
];

const MOCK_BUSINESSES = [
  { id: 1, name: "Amel Irwanto cake", owner: "Budi Santoso", category: "Pertokoan", status: "approved", city: "Kabupaten Bogor", phone: "081234567890", created: "2024-05-01", views: 1234 },
  { id: 2, name: "Warung Makan Sederhana", owner: "Siti Nurhaliza", category: "Cafe & Restaurant", status: "approved", city: "Kota Bogor", phone: "081234567891", created: "2024-05-10", views: 856 },
  { id: 3, name: "Toko Elektronik Jaya", owner: "Ahmad Rizki", category: "Elektronik & Gadget", status: "pending", city: "Kabupaten Bogor", phone: "081234567892", created: "2024-06-01", views: 0 },
  { id: 4, name: "Salon & Spa Cantik", owner: "Dewi Lestari", category: "Pertokoan", status: "suspended", city: "Kota Depok", phone: "081234567893", created: "2024-04-15", views: 456 },
  { id: 5, name: "Bengkel Motor Makmur", owner: "Budi Santoso", category: "Servis & Tukang", status: "approved", city: "Kabupaten Bekasi", phone: "081234567894", created: "2024-05-20", views: 2345 },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Bisnis & Market", slug: "bisnis", icon: "store", businessCount: 120 },
  { id: 2, name: "Cafe & Restaurant", slug: "cafe", icon: "coffee", businessCount: 85 },
  { id: 3, name: "Elektronik & Gadget", slug: "elektronik", icon: "smartphone", businessCount: 62 },
  { id: 4, name: "Fashion", slug: "fashion", icon: "shirt", businessCount: 48 },
  { id: 5, name: "Servis & Tukang", slug: "servis", icon: "wrench", businessCount: 56 },
  { id: 6, name: "Wisata", slug: "wisata", icon: "map-pin", businessCount: 34 },
  { id: 7, name: "Pertokoan", slug: "pertokoan", icon: "store", businessCount: 95 },
  { id: 8, name: "Yayasan", slug: "yayasan", icon: "building", businessCount: 22 },
  { id: 9, name: "Kantor Pemerintah", slug: "kantor-pemerintah", icon: "landmark", businessCount: 18 },
];

const MOCK_ADS = [
  { id: 1, businessName: "Amel Irwanto cake", owner: "Budi Santoso", status: "active", startDate: "2024-06-01", endDate: "2024-07-01", budget: 500000 },
  { id: 2, businessName: "Warung Makan Sederhana", owner: "Siti Nurhaliza", status: "pending", startDate: "-", endDate: "-", budget: 300000 },
  { id: 3, businessName: "Toko Elektronik Jaya", owner: "Ahmad Rizki", status: "rejected", startDate: "-", endDate: "-", budget: 0 },
  { id: 4, businessName: "Bengkel Motor Makmur", owner: "Budi Santoso", status: "active", startDate: "2024-05-15", endDate: "2024-06-15", budget: 750000 },
];

const MOCK_PAYMENTS = [
  { id: 1, userName: "Budi Santoso", planName: "Premium Bulanan", amount: 150000, status: "approved", date: "2024-06-01", method: "Bank Transfer" },
  { id: 2, userName: "Siti Nurhaliza", planName: "Premium 3 Bulan", amount: 450000, status: "approved", date: "2024-06-10", method: "Bank Transfer" },
  { id: 3, userName: "Dewi Lestari", planName: "Premium Bulanan", amount: 150000, status: "pending", date: "2024-06-15", method: "Bank Transfer" },
];

const MOCK_BLOGS = [
  { id: 1, title: "Tips Memulai Bisnis Online di Tahun 2024", author: "Admin", category: "Bisnis", created_at: "2024-06-15" },
  { id: 2, title: "5 Cafe Terbaik di Bogor", author: "Admin", category: "Kuliner", created_at: "2024-06-12" },
  { id: 3, title: "Panduan Digital Marketing untuk UKM", author: "Admin", category: "Marketing", created_at: "2024-06-10" },
];

export default function AdminWeb() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data states ──
  const [stats, setStats] = useState(MOCK_STATS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [blogs, setBlogs] = useState(MOCK_BLOGS);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  // ── Modal state ──
  const [modal, setModal] = useState({ show: false, type: "", data: null });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { }
    }
    setLoading(false);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await api.get("/admin/categories");
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryError("Gagal memuat data kategori");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
      // Proceed with local cleanup even if API call fails
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      Object.keys(localStorage)
        .filter((k) => k.startsWith("admin_cache_"))
        .forEach((k) => localStorage.removeItem(k));
      window.dispatchEvent(new Event("userAuthChanged"));
      navigate("/login");
    }
  };

  const handleModal = (type, data = null) => {
    setModal({ show: true, type, data });
  };

  const closeModal = () => {
    setModal({ show: false, type: "", data: null });
  };

  // Category handlers
  const handleAddCategory = async (formData) => {
    try {
      const response = await api.post("/admin/categories", formData);
      await fetchCategories();
      closeModal();
      return { success: true };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, error: error.response?.data?.message || "Gagal menambah kategori" };
    }
  };

  const handleEditCategory = async (formData) => {
    try {
      const response = await api.put(`/admin/categories/${modal.data.id}`, formData);
      await fetchCategories();
      closeModal();
      return { success: true };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error: error.response?.data?.message || "Gagal mengupdate kategori" };
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await api.delete(`/admin/categories/${modal.data.id}`);
      await fetchCategories();
      closeModal();
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorMessage = error.response?.data?.message || "Gagal menghapus kategori";
      alert(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleToggleCategoryStatus = async (category) => {
    try {
      await api.put(`/admin/categories/${category.id}/toggle-status`);
      await fetchCategories();
    } catch (error) {
      console.error("Error toggling category status:", error);
      alert("Gagal mengubah status kategori");
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
            <Users size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalUsers}</span>
            <span className="admin-stat-card__label">Total User</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+12%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--business">
            <Store size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalBusinesses}</span>
            <span className="admin-stat-card__label">Total Bisnis</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+8%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--category">
            <Tags size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalCategories}</span>
            <span className="admin-stat-card__label">Total Kategori</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+5%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--ads">
            <Megaphone size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalActiveAds}</span>
            <span className="admin-stat-card__label">Iklan Aktif</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+15%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--premium">
            <Crown size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">{stats.totalPremiumBusinesses}</span>
            <span className="admin-stat-card__label">Bisnis Premium</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+20%</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--revenue">
            <DollarSign size={24} />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__value">Rp {(stats.monthlyRevenue / 1000).toFixed(0)}K</span>
            <span className="admin-stat-card__label">Pendapatan Bulan Ini</span>
          </div>
          <div className="admin-stat-card__trend admin-stat-card__trend--up">
            <TrendingUp size={16} />
            <span>+25%</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-activity">
        <h3 className="admin-recent-activity__title">Aktivitas Terbaru</h3>
        <div className="admin-activity-list">
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--success">
              <CheckCircle size={20} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">Bisnis "Toko Elektronik Jaya" disetujui</span>
              <span className="admin-activity-item__time">2 jam yang lalu</span>
            </div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--warning">
              <Clock size={20} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">Pembayaran premium dari Budi Santoso menunggu persetujuan</span>
              <span className="admin-activity-item__time">4 jam yang lalu</span>
            </div>
          </div>
          <div className="admin-activity-item">
            <div className="admin-activity-item__icon admin-activity-item__icon--success">
              <UserPlus size={20} />
            </div>
            <div className="admin-activity-item__content">
              <span className="admin-activity-item__text">User baru terdaftar: Dewi Lestari</span>
              <span className="admin-activity-item__time">6 jam yang lalu</span>
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
          <Plus size={18} />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="admin-search-bar">
        <Search size={18} className="admin-search-bar__icon" />
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
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-table-cell--user">
                      <img src={u.avatar} alt={u.name} className="admin-table-cell__avatar" />
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${u.status}`}>
                      {u.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>{u.businesses}</td>
                  <td>{u.joined}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-table-action" onClick={() => handleModal("editUser", u)} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteUser", u)} title="Hapus">
                        <Trash2 size={16} />
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
          <Plus size={18} />
          <span>Tambah Bisnis</span>
        </button>
      </div>

      <div className="admin-search-bar">
        <Search size={18} className="admin-search-bar__icon" />
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
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {businesses
              .filter((b) =>
                b.name?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((business) => (
                <tr key={business.id}>
                  <td>
                    <div className="admin-table-cell--business">
                      <span>{business.name}</span>
                    </div>
                  </td>
                  <td>{business.category}</td>
                  <td>{business.owner || "Unknown"}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${business.status === "approved" ? "success" : "warning"}`}>
                      {business.status === "approved" ? "Aktif" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-table-action" onClick={() => handleModal("editBusiness", business)} title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteBusiness", business)} title="Hapus">
                        <Trash2 size={16} />
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
          <Plus size={18} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="admin-search-bar">
        <Search size={18} className="admin-search-bar__icon" />
        <input
          type="text"
          placeholder="Cari kategori..."
          className="admin-search-bar__input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {categoryLoading ? (
        <div className="admin-loading">
          <div className="admin-loading__icon">⏳</div>
          <p>Memuat data kategori...</p>
        </div>
      ) : categoryError ? (
        <div className="admin-error">
          <AlertTriangle size={20} />
          <span>{categoryError}</span>
          <button className="admin-btn admin-btn--secondary" onClick={fetchCategories}>
            Coba Lagi
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">
          <Tags size={48} />
          <p>Belum ada kategori</p>
          <button className="admin-btn admin-btn--primary" onClick={() => handleModal("addCategory")}>
            <Plus size={18} />
            <span>Tambah Kategori Pertama</span>
          </button>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Kategori</th>
                <th>Slug</th>
                <th>Jumlah Bisnis</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .filter((c) =>
                  c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.businesses_count || category.businessCount || 0}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${category.is_active ? "success" : "warning"}`}>
                        {category.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-table-action" onClick={() => handleModal("editCategory", category)} title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="admin-table-action" onClick={() => handleToggleCategoryStatus(category)} title="Toggle Status">
                          {category.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteCategory", category)} title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAds = () => (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Kelola Iklan</h2>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Bisnis</th>
              <th>Status</th>
              <th>Masa Tayang</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ADS.slice(0, 5).map((ad) => (
              <tr key={ad.id}>
                <td>{ad.businessName}</td>
                <td>
                  <span className={`admin-badge admin-badge--${ad.status === "active" ? "success" : "warning"}`}>
                    {ad.status === "active" ? "Aktif" : "Pending"}
                  </span>
                </td>
                <td>{ad.startDate} - {ad.endDate}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteAd", ad)} title="Hapus">
                      <Trash2 size={16} />
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
                <td>{payment.planName}</td>
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
                        <button className="admin-table-action admin-table-action--success" title="Approve">
                          <CheckCircle size={16} />
                        </button>
                        <button className="admin-table-action admin-table-action--danger" title="Tolak">
                          <X size={16} />
                        </button>
                      </>
                    )}
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
          <Plus size={18} />
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
                <td>{blog.category || "Umum"}</td>
                <td>{blog.created_at}</td>
                <td>
                  <div className="admin-table-actions">
                    <button className="admin-table-action" onClick={() => handleModal("editBlog", blog)} title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button className="admin-table-action admin-table-action--danger" onClick={() => handleModal("deleteBlog", blog)} title="Hapus">
                      <Trash2 size={16} />
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
        <button className="admin-btn admin-btn--secondary">
          <Download size={18} />
          <span>Download PDF/Excel</span>
        </button>
      </div>

      <div className="admin-reports-grid">
        <div className="admin-report-card">
          <div className="admin-report-card__icon">
            <Eye size={32} />
          </div>
          <h3 className="admin-report-card__title">Jumlah Pengunjung</h3>
          <span className="admin-report-card__value">12,458</span>
          <span className="admin-report-card__change admin-report-card__change--up">+15% dari bulan lalu</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
            <Store size={32} />
          </div>
          <h3 className="admin-report-card__title">Bisnis Paling Banyak Dilihat</h3>
          <span className="admin-report-card__value">Bengkel Motor Makmur</span>
          <span className="admin-report-card__change">2,345 views</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
            <Tags size={32} />
          </div>
          <h3 className="admin-report-card__title">Kategori Terpopuler</h3>
          <span className="admin-report-card__value">Bisnis & Market</span>
          <span className="admin-report-card__change">120 bisnis aktif</span>
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__icon">
            <DollarSign size={32} />
          </div>
          <h3 className="admin-report-card__title">Pendapatan</h3>
          <span className="admin-report-card__value">Rp {stats.monthlyRevenue.toLocaleString()}</span>
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
        </div>

        <div className="admin-settings-card">
          <h3 className="admin-settings-card__title">Media Sosial</h3>
          <div className="admin-form-group">
            <label className="admin-form-label"><Globe size={16} /> Instagram</label>
            <input type="url" className="admin-form-input" defaultValue="https://instagram.com/info.co.id" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label"><Globe size={16} /> Facebook</label>
            <input type="url" className="admin-form-input" defaultValue="https://facebook.com/info.co.id" />
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
            <Clock size={20} />
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
            <DollarSign size={20} />
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
            <AlertTriangle size={20} />
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
            <UserPlus size={20} />
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

    const isCategoryModal = modal.type === "addCategory" || modal.type === "editCategory" || modal.type === "deleteCategory";
    const isDeleteModal = modal.type && modal.type.includes("delete");

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
              {(!modal.type || modal.type === "") && "Konfirmasi"}
            </h3>
            <button className="admin-modal__close" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>
          <div className="admin-modal__body">
            {isCategoryModal ? (
              isDeleteModal ? (
                <div className="admin-modal-delete">
                  <AlertTriangle size={48} className="admin-modal-delete__icon" />
                  <p>Apakah Anda yakin ingin menghapus kategori <strong>"{modal.data?.name}"</strong>?</p>
                  <p className="admin-modal-delete__warning">
                    {modal.data?.businesses_count > 0 
                      ? `Peringatan: Kategori ini masih digunakan oleh ${modal.data.businesses_count} bisnis.`
                      : "Kategori akan dihapus secara permanen."}
                  </p>
                </div>
              ) : (
                <CategoryModalForm 
                  category={modal.data} 
                  onSubmit={modal.type === "addCategory" ? handleAddCategory : handleEditCategory}
                  onCancel={closeModal}
                  categories={categories}
                />
              )
            ) : isDeleteModal ? (
              <p>Apakah Anda yakin ingin menghapus item ini?</p>
            ) : (
              <div className="admin-form-group">
                <label className="admin-form-label">Nama</label>
                <input type="text" className="admin-form-input" defaultValue={modal.data?.name || ""} placeholder="Masukkan nama..." />
              </div>
            )}
          </div>
          {!isCategoryModal && (
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={closeModal}>
                Batal
              </button>
              <button className="admin-btn admin-btn--primary" onClick={closeModal}>
                {isDeleteModal ? "Hapus" : "Simpan"}
              </button>
            </div>
          )}
          {isCategoryModal && isDeleteModal && (
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={closeModal}>
                Batal
              </button>
              <button 
                className="admin-btn admin-btn--danger" 
                onClick={handleDeleteCategory}
                disabled={modal.data?.businesses_count > 0}
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__icon">⏳</div>
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-text">Info.co.id</span>
            <span className="admin-sidebar__logo-badge">Admin</span>
          </div>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`admin-sidebar__nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">{MENU_ITEMS.find((i) => i.id === activeTab)?.label}</h1>
          </div>
          <div className="admin-header__right">
            <button className="admin-header__notification" onClick={() => setActiveTab("notifications")}>
              <Bell size={20} />
              <span className="admin-header__notification-badge">3</span>
            </button>
            <div className="admin-header__user">
              <img src={user?.avatar || DEFAULT_AVATAR} alt="Admin" className="admin-header__user-avatar" />
              <span className="admin-header__user-name">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "businesses" && renderBusinesses()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "ads" && renderAds()}
          {activeTab === "premium" && renderPremium()}
          {activeTab === "blogs" && renderBlogs()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "settings" && renderSettings()}
          {activeTab === "notifications" && renderNotifications()}
        </div>
      </main>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}

