import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Home
} from "lucide-react";

import logoImg from "../../assets/logo.png";

import "./AdminUser.css";

// Profile picture URL (beautiful avatar)
const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

// Generate random username like user1, user2, user3...
const generateRandomUsername = () => {
  const num = Math.floor(Math.random() * 9000) + 1;
  return `user${num}`;
};

// Load or initialize username from localStorage
const getInitialUsername = () => {
  const stored = localStorage.getItem("displayName");
  if (stored) return stored;
  const generated = generateRandomUsername();
  localStorage.setItem("displayName", generated);
  return generated;
};

export default function AdminUser() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Username state – random on first login, editable after
  const [displayName, setDisplayName] = useState(getInitialUsername);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  // Sample data states
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) return JSON.parse(saved);
    return {
      firstName: "Daffa",
      lastName: "Dharmaksatria",
      email: "daffa@info.co.id",
      phone: "+62 811 152 900",
      role: "Super Admin",
      bio: "Administrator Utama platform portal bisnis terpercaya Indonesia Info.co.id.",
      avatar: defaultAvatar
    };
  });

  const [businesses, setBusinesses] = useState([
    { id: 1, name: "Warung Nasi Ampera", category: "Kuliner", city: "Bandung", status: "active", date: "2026-07-10" },
    { id: 2, name: "Barberia Barbershop", category: "Jasa", city: "Jakarta", status: "pending", date: "2026-07-14" },
    { id: 3, name: "Toko Buku Semesta", category: "Retail", city: "Surabaya", status: "active", date: "2026-06-25" },
    { id: 4, name: "Klinik Sehat Keluarga", category: "Kesehatan", city: "Depok", status: "inactive", date: "2026-07-02" },
    { id: 5, name: "Hotel Grand Surya", category: "Akomodasi", city: "Yogyakarta", status: "active", date: "2026-07-12" }
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: "Festival Kuliner Nusantara 2026", date: "2026-08-20", location: "Gelora Bung Karno, Jakarta", category: "Festival", status: "upcoming", bg: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
    { id: 2, title: "Workshop Digital Marketing UKM", date: "2026-07-28", location: "Menara Kadin, Bandung", category: "Edukasi", status: "upcoming", bg: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
    { id: 3, title: "Info.co.id Business Networking", date: "2026-07-15", location: "Hotel JW Marriott, Surabaya", category: "Networking", status: "ongoing", bg: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
    { id: 4, title: "Pameran Kerajinan Tangan Kreatif", date: "2026-06-10", location: "JEC, Yogyakarta", category: "Exhibition", status: "past", bg: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: "Budi Santoso", email: "budi.s@gmail.com", subject: "Pertanyaan Kemitraan Bisnis", body: "Halo Admin,\n\nSaya tertarik untuk mendaftarkan jaringan bisnis kuliner saya secara massal di portal Info.co.id. Apakah ada paket reseller atau kemitraan khusus? Terima kasih.\n\nSalam,\nBudi Santoso", time: "09:30 AM", unread: true },
    { id: 2, sender: "Siti Rahma", email: "siti.rahma@yahoo.com", subject: "Laporan Ulasan Palsu", body: "Yth. Administrator,\n\nSaya ingin melaporkan ulasan negatif mencurigakan di profil toko saya (Toko Hijab Syari). Peninjau sepertinya menggunakan bot atau akun kompetitor. Mohon bantuannya untuk memverifikasi. Terima kasih banyak.", time: "Kemarin", unread: false },
    { id: 3, sender: "Anto Wijaya", email: "anto.wijaya@outlook.com", subject: "Kesalahan Teknis Pendaftaran", body: "Selamat sore,\n\nSaat saya mencoba mendaftarkan event baru, form pendaftaran stuck di loading. Saya sudah mencoba 3 kali dengan koneksi berbeda namun hasilnya sama. Mohon solusinya.", time: "12 Jul", unread: false }
  ]);
  const [selectedMessage, setSelectedMessage] = useState(messages[0]);

  const [resellers, setResellers] = useState([
    { id: 1, name: "Hermawan Susanto", region: "Jawa Barat", sales: 142, rating: 4.8, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
    { id: 2, name: "Dewi Lestari", region: "DKI Jakarta", sales: 295, rating: 4.9, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { id: 3, name: "Rahmat Hidayat", region: "Jawa Timur", sales: 88, rating: 4.6, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
    { id: 4, name: "Novi Amelia", region: "Jawa Tengah", sales: 115, rating: 4.7, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150" }
  ]);

  const [savedItems, setSavedItems] = useState([
    { id: 1, title: "Kopi Kenangan Senayan", type: "Bisnis", date: "Disimpan 15 Menit Lalu" },
    { id: 2, title: "Festival Kuliner Nusantara 2026", type: "Event", date: "Disimpan Kemarin" },
    { id: 3, title: "Klinik Gigi Premium Indah", type: "Bisnis", date: "Disimpan 3 Hari Lalu" }
  ]);

  const [reviews, setReviews] = useState([
    { id: 1, user: "Rian Permana", target: "Warung Nasi Ampera", text: "Makanannya sangat lezat dan otentik Sunda! Harganya terjangkau. Layanan super cepat bahkan saat jam makan siang.", rating: 5, date: "2026-07-14", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100" },
    { id: 2, user: "Sari Indah", target: "Toko Buku Semesta", text: "Koleksi bukunya cukup lengkap, tetapi pelayanannya agak lambat karena kasirnya hanya satu yang buka hari Minggu.", rating: 3.5, date: "2026-07-13", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100" },
    { id: 3, user: "Doni Prasetyo", target: "Hotel Grand Surya", text: "Kamar bersih dan luas. Lokasi strategis dekat dengan mal. Sarapannya bervariasi dan enak sekali.", rating: 4.8, date: "2026-07-11", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" }
  ]);

  // Handle logout action
  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("profileData", JSON.stringify(profileData));
    alert("Profil berhasil diperbarui!");
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
      case "event":
        return { title: "Manajemen Event", desc: "Kelola acara, workshop, dan agenda kota" };
      case "inbox":
        return { title: "Kotak Masuk Pesan", desc: "Lihat dan balas pesan keluhan atau pertanyaan pengguna" };
      case "reseller":
        return { title: "Direktori Reseller", desc: "Kelola kemitraan dan agen reseller wilayah portal" };
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
    { id: "event", name: "Event", icon: Calendar },
    { id: "inbox", name: "Inbox", icon: Mail },
    { id: "reseller", name: "Reseller", icon: Users },
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
                  <button className="btn-primary">
                    <Plus size={16} /> Tambah Bisnis
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Bisnis</th>
                      <th>Kategori</th>
                      <th>Kota</th>
                      <th>Tanggal Daftar</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((biz) => (
                      <tr key={biz.id}>
                        <td className="table-cell-bold">{biz.name}</td>
                        <td>{biz.category}</td>
                        <td>{biz.city}</td>
                        <td>{biz.date}</td>
                        <td>
                          <span className={`badge ${biz.status}`}>
                            {biz.status === "active" ? "Aktif" : biz.status === "pending" ? "Menunggu" : "Nonaktif"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn view" title="Lihat">
                              <Eye size={16} />
                            </button>
                            <button className="action-btn edit" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button className="action-btn delete" title="Hapus">
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
          )}

          {/* 3. EVENT VIEW */}
          {activeTab === "event" && (
            <div>
              <div className="table-controls" style={{ marginBottom: "25px" }}>
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Cari agenda event..." />
                </div>
                <button className="btn-primary">
                  <Plus size={16} /> Buat Event Baru
                </button>
              </div>

              <div className="cards-grid">
                {events.map((ev) => (
                  <div className="event-card" key={ev.id}>
                    <div className="event-card-img" style={{ backgroundImage: ev.bg }}>
                      <span className="event-category-badge">{ev.category}</span>
                    </div>
                    <div className="event-card-body">
                      <h3>{ev.title}</h3>
                      <div className="event-details-row">
                        <Calendar size={14} />
                        <span>{ev.date}</span>
                      </div>
                      <div className="event-details-row">
                        <MapPin size={14} />
                        <span>{ev.location}</span>
                      </div>
                      <div className="event-card-footer">
                        <span className={`event-status ${ev.status}`}>
                          {ev.status === "upcoming" ? "Akan Datang" : ev.status === "ongoing" ? "Berjalan" : "Selesai"}
                        </span>
                        <div className="table-actions">
                          <button className="action-btn edit" title="Edit">
                            <Edit size={14} />
                          </button>
                          <button className="action-btn delete" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

          {/* 8. PROFILE VIEW */}
          {activeTab === "profile" && (
            <div className="profile-settings-layout">
              <div className="profile-sidebar-pic">
                <img src={profileData.avatar} alt="Large Profile" className="profile-avatar-large" />
                <button className="profile-pic-btn">Ubah Foto Profil</button>

                {/* Username Section */}
                <div className="username-section">
                  <span className="username-label">Username</span>
                  {editingUsername ? (
                    <div className="username-edit-row">
                      <input
                        id="username-input"
                        type="text"
                        className="username-input"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
                        autoFocus
                        placeholder="Masukkan username..."
                      />
                      <div className="username-edit-actions">
                        <button className="btn-primary" style={{ padding: "6px 14px", fontSize: "13px" }} onClick={handleSaveUsername}>
                          Simpan
                        </button>
                        <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => setEditingUsername(false)}>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="username-display-row">
                      <span className="username-display-value">@{displayName}</span>
                      <button className="username-edit-btn" onClick={handleEditUsername} title="Edit username">
                        <Edit size={14} /> Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <form className="profile-form-grid" onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label htmlFor="first-name">Nama Depan</label>
                  <input
                    type="text"
                    id="first-name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Nama Belakang</label>
                  <input
                    type="text"
                    id="last-name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">No. Handphone</label>
                  <input
                    type="text"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="role">Role Kredensial</label>
                  <input type="text" id="role" value={profileData.role} disabled style={{ backgroundColor: "#f1f5f9" }} />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="bio">Tentang Saya (Bio)</label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  ></textarea>
                </div>
                <div className="profile-form-footer full-width">
                  <button type="submit" className="btn-primary">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

