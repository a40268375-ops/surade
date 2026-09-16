import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  X,
  Search,
  Home,
  Layers,
  BookOpen,
  Building2,
  Info,
  PhoneCall,
  HelpCircle,
  Plus,
  Mail,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  User,
  Compass,
} from "lucide-react";
import logoImg from "../assets/logo-surade.png";
import "./MobileMenu.css";

/**
 * Enhanced, Responsive & Professional Mobile Menu Drawer
 * Designed for optimal ergonomics, accessibility, and aesthetics.
 */
export default function MobileMenu({
  isOpen,
  onClose,
  user,
  inboxUnread = 0,
  categories = [],
  onLogout,
  getUserAvatar,
  getDisplayName,
  getDashboardLink,
  getProfileLink,
  handleImgError,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Lock body scroll when drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Quick Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    navigate(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Toggle category accordion inside drawer
  const toggleCategoryExpand = (catId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCatId((prev) => (prev === catId ? null : catId));
  };

  // Filter categories if user types inside category filter
  const filteredCategories = categories.filter((cat) => {
    if (!categoryFilter.trim()) return true;
    const q = categoryFilter.toLowerCase();
    const matchParent = cat.name?.toLowerCase().includes(q);
    const matchChild = cat.children?.some((ch) => ch.name?.toLowerCase().includes(q));
    return matchParent || matchChild;
  });

  // WhatsApp CS contact link
  const waNumber = "628111919711";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Admin Surade.co.id, saya ingin bertanya...")}`;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`surade-mobile-backdrop ${isOpen ? "active" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer ── */}
      <aside
        className={`surade-mobile-drawer ${isOpen ? "open" : ""}`}
        aria-label="Mobile Navigation"
        role="dialog"
        aria-modal="true"
      >
        {/* ── 1. Drawer Header ── */}
        <div className="surade-mobile-header">
          <Link to="/" onClick={onClose} className="surade-mobile-logo-wrap">
            <img src={logoImg} alt="Surade.co.id" className="surade-mobile-logo" />
            <span className="surade-mobile-brand-title">
              Surade<span>.co.id</span>
            </span>
          </Link>
          <button
            type="button"
            className="surade-mobile-close-btn"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── 2. Scrollable Body ── */}
        <div className="surade-mobile-body">
          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="surade-mobile-search-form">
            <Search size={16} className="surade-mobile-search-icon" />
            <input
              type="text"
              placeholder="Cari bisnis, jasa, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="surade-mobile-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="surade-mobile-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Bersihkan pencarian"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* ── User Status Card ── */}
          {user ? (
            <div className="surade-mobile-user-card">
              <div className="surade-mobile-user-profile">
                <div className="surade-mobile-avatar-wrap">
                  <img
                    src={getUserAvatar?.() || "/avatar.png"}
                    alt={getDisplayName?.() || "User"}
                    onError={handleImgError}
                    className="surade-mobile-avatar"
                  />
                  <span className="surade-mobile-status-dot" title="Online" />
                </div>
                <div className="surade-mobile-user-info">
                  <h4 className="surade-mobile-user-name">{getDisplayName?.()}</h4>
                  <div className="surade-mobile-user-meta">
                    <span className={`surade-mobile-user-role ${user.role === "admin" ? "admin" : "user"}`}>
                      {user.role === "admin" ? "Admin" : "Mitra"}
                    </span>
                    <p className="surade-mobile-user-email">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="surade-mobile-user-actions">
                <Link
                  to={getDashboardLink?.() || "/admin-user"}
                  onClick={onClose}
                  className="surade-mobile-action-pill"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/dashboard?tab=inbox"
                  onClick={onClose}
                  className="surade-mobile-action-pill"
                >
                  <Mail size={16} />
                  <span>Inbox</span>
                  {inboxUnread > 0 && (
                    <span className="surade-mobile-badge">
                      {inboxUnread > 99 ? "99+" : inboxUnread}
                    </span>
                  )}
                </Link>

                <Link
                  to={getProfileLink?.() || "/admin-user?tab=profile"}
                  onClick={onClose}
                  className="surade-mobile-action-pill"
                >
                  <Settings size={16} />
                  <span>Profil</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="surade-mobile-guest-card">
              <div>
                <h4 className="surade-mobile-guest-title">Selamat Datang di Surade.co.id</h4>
                <p className="surade-mobile-guest-desc">
                  Temukan direktori bisnis lokal dan promosikan usaha Anda secara gratis & mudah.
                </p>
              </div>
              <div className="surade-mobile-guest-buttons">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="surade-mobile-btn-guest-login"
                >
                  Masuk Akun
                </Link>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="surade-mobile-btn-guest-register"
                >
                  Daftar
                </Link>
              </div>
            </div>
          )}

          {/* ── Navigation Links ── */}
          <div>
            <div className="surade-mobile-section-label">Menu Utama</div>
            <nav className="surade-mobile-nav-list">
              {/* Home */}
              <NavLink
                to="/"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <Home size={18} />
                  </span>
                  <span>Beranda</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Category / Directory Accordion */}
              <div
                className={`surade-mobile-accordion ${
                  categoriesExpanded ? "expanded" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCategoriesExpanded((v) => !v)}
                  className="surade-mobile-accordion-toggle"
                >
                  <span className="surade-mobile-nav-link-left">
                    <span className="surade-mobile-accordion-icon">
                      <Layers size={18} />
                    </span>
                    <span className="font-semibold text-[13.5px] text-slate-800">
                      Kategori Direktori
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="surade-mobile-accordion-badge">
                      {categories.length}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${
                        categoriesExpanded ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </div>
                </button>

                <div className="surade-mobile-accordion-panel">
                  {/* Category mini filter if more than 5 */}
                  {categories.length > 5 && (
                    <div className="surade-mobile-cat-filter">
                      <input
                        type="text"
                        placeholder="Filter kategori..."
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      />
                    </div>
                  )}

                  {/* List of categories */}
                  {filteredCategories.map((cat) => {
                    const isParentExpanded = expandedCatId === cat.id;
                    const hasChildren = cat.children && cat.children.length > 0;

                    return (
                      <div key={cat.id} className="surade-mobile-cat-item">
                        <div className="surade-mobile-cat-header">
                          <Link
                            to={`/category/${cat.slug}`}
                            onClick={onClose}
                            className="surade-mobile-cat-link"
                          >
                            <span>{cat.name}</span>
                            {hasChildren && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold">
                                {cat.children.length}
                              </span>
                            )}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => toggleCategoryExpand(cat.id, e)}
                              className="surade-mobile-cat-expand-btn"
                              aria-label={`Lihat subkategori ${cat.name}`}
                            >
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isParentExpanded ? "rotate-180 text-emerald-600" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategories list */}
                        {hasChildren && isParentExpanded && (
                          <div className="surade-mobile-subcat-list">
                            {cat.children.map((child) => (
                              <Link
                                key={child.id}
                                to={`/category/${child.slug}`}
                                onClick={onClose}
                                className="surade-mobile-subcat-link"
                              >
                                <span>{child.name}</span>
                                <ChevronRight size={12} className="opacity-40" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    to="/category"
                    onClick={onClose}
                    className="surade-mobile-cat-all"
                  >
                    <span>Jelajahi Semua Kategori Bisnis</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>

              {/* Blog */}
              <NavLink
                to="/blog"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <BookOpen size={18} />
                  </span>
                  <span>Blog & Kabar Daerah</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Smart City */}
              <NavLink
                to="/smart-city"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <Building2 size={18} />
                  </span>
                  <span>Smart City Surade</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Tentang Kami */}
              <NavLink
                to="/about"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <Info size={18} />
                  </span>
                  <span>Tentang Surade</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Hubungi Kami */}
              <NavLink
                to="/contact"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <PhoneCall size={18} />
                  </span>
                  <span>Hubungi Kami</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Panduan Penggunaan */}
              <NavLink
                to="/panduan"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <Compass size={18} />
                  </span>
                  <span>Panduan Penggunaan</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* FAQ */}
              <NavLink
                to="/faq"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon">
                    <HelpCircle size={18} />
                  </span>
                  <span>Bantuan & FAQ</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>
            </nav>
          </div>

          {/* ── Call To Action Buttons ── */}
          <div className="surade-mobile-cta-section">
            <Link
              to="/add-business"
              onClick={onClose}
              className="surade-mobile-cta-btn"
            >
              <Plus size={18} />
              <span>Pasang Iklan / Tambah Usaha</span>
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="surade-mobile-wa-btn"
            >
              <MessageCircle size={17} />
              <span>Chat WhatsApp Admin CS</span>
            </a>
          </div>
        </div>

        {/* ── 3. Drawer Footer ── */}
        <div className="surade-mobile-footer">
          {user && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout?.();
              }}
              className="surade-mobile-logout-btn"
            >
              <LogOut size={16} />
              <span>Keluar dari Akun</span>
            </button>
          )}

          <p className="surade-mobile-footer-text">
            © {new Date().getFullYear()} Surade.co.id • Sukabumi Selatan
          </p>
        </div>
      </aside>
    </>
  );
}