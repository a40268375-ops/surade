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
import WhatsAppIcon from "./icons/WhatsAppIcon";
import { SMART_CITIES } from "../data/smartCities";
import { getCompleteNavbarCategories } from "../utils/categoryIcons";
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
  const [smartVillageExpanded, setSmartVillageExpanded] = useState(false);
  const [villageCounts, setVillageCounts] = useState({});

  // Fetch dynamic real business counts per village from API
  useEffect(() => {
    const fetchRealVillageCounts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/home-summary`);
        if (res.ok) {
          const data = await res.json();
          const cities = data?.smart_cities || [];
          if (Array.isArray(cities) && cities.length > 0) {
            const countsMap = {};
            cities.forEach((c) => {
              const bCount = Number(c.bisnis ?? c.businesses_count ?? 0);
              if (c.name) countsMap[c.name.toLowerCase().trim()] = bCount;
              if (c.slug) countsMap[c.slug.toLowerCase().trim()] = bCount;
            });
            setVillageCounts(countsMap);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch real village counts:", err);
      }
    };
    fetchRealVillageCounts();
  }, []);

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

  const sanitizeCategories = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter((cat) => {
      const slug = String(cat.slug || cat.name || "").toLowerCase();
      return slug !== "umkm" && slug !== "nomor-penting" && !slug.includes("nomor penting") && !slug.includes("darurat");
    });
  };

  const [menuCategories, setMenuCategories] = useState(() => {
    const base = Array.isArray(categories) && categories.length >= 15
      ? categories
      : getCompleteNavbarCategories();
    return sanitizeCategories(base);
  });

  // Sync menuCategories with categories prop or fetch from API fallback
  useEffect(() => {
    if (Array.isArray(categories) && categories.length >= 15) {
      setMenuCategories(sanitizeCategories(categories));
    } else {
      const fetchCats = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/navbar-categories`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length >= 15) {
              setMenuCategories(sanitizeCategories(data));
            } else {
              setMenuCategories(sanitizeCategories(getCompleteNavbarCategories()));
            }
          } else {
            setMenuCategories(sanitizeCategories(getCompleteNavbarCategories()));
          }
        } catch (e) {
          setMenuCategories(sanitizeCategories(getCompleteNavbarCategories()));
        }
      };
      fetchCats();
    }
  }, [categories]);

  // Filter categories if user types inside category filter
  const filteredCategories = menuCategories.filter((cat) => {
    if (!categoryFilter.trim()) return true;
    const q = categoryFilter.toLowerCase();
    const catName = (cat.name || cat.label || "").toLowerCase();
    const matchParent = catName.includes(q);
    const subList = cat.children || cat.subcategories || [];
    const matchChild = subList.some((ch) => (ch.name || ch.label || "").toLowerCase().includes(q));
    return matchParent || matchChild;
  });

  // WhatsApp CS contact link
  const waNumber = "628111919711";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Admin Surade.com, saya ingin bertanya...")}`;

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
            <img src={logoImg} alt="Surade.com" className="surade-mobile-logo" />
            <span className="surade-mobile-brand-title">
              Surade<span>.com</span>
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              document.activeElement?.blur?.();
              handleSearchSubmit(e);
            }}
            className="surade-mobile-search-form"
          >
            <Search size={16} className="surade-mobile-search-icon" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Cari bisnis, jasa, atau produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13) {
                  e.currentTarget.blur?.();
                  handleSearchSubmit(e);
                }
              }}
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
                  <span>Pesan</span>
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
                <h4 className="surade-mobile-guest-title">Selamat Datang di Surade.com</h4>
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
                  to="/register"
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
                      Direktori
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="surade-mobile-accordion-badge">
                      {menuCategories.length || categories.length}
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
                  {(menuCategories.length || categories.length) > 5 && (
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
                    const subList = cat.children || cat.subcategories || [];
                    const hasChildren = subList.length > 0;
                    const catSlug = cat.slug || String(cat.id);

                    return (
                      <div key={cat.id} className="surade-mobile-cat-item">
                        <div className="surade-mobile-cat-header">
                          <Link
                            to={`/category/${catSlug}`}
                            onClick={onClose}
                            className="surade-mobile-cat-link"
                          >
                            <span>{cat.name || cat.label}</span>
                            {hasChildren && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold">
                                {subList.length}
                              </span>
                            )}
                          </Link>

                          {hasChildren && (
                            <button
                              type="button"
                              onClick={(e) => toggleCategoryExpand(cat.id, e)}
                              className="surade-mobile-cat-expand-btn"
                              aria-label={`Lihat subkategori ${cat.name || cat.label}`}
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
                            {subList.map((child) => {
                              const childSlug = child.slug || String(child.id);
                              return (
                                <Link
                                  key={child.id || child.slug}
                                  to={`/category/${catSlug}?sub=${childSlug}`}
                                  onClick={onClose}
                                  className="surade-mobile-subcat-link"
                                >
                                  <span>{child.name || child.label}</span>
                                  <ChevronRight size={12} className="opacity-40" />
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    to="/category/all"
                    onClick={onClose}
                    className="surade-mobile-cat-all"
                  >
                    <span>Lihat Semua Direktori Kategori</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Nomor Penting */}
              <NavLink
                to="/nomor-penting"
                onClick={onClose}
                className={({ isActive }) =>
                  `surade-mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="surade-mobile-nav-link-left">
                  <span className="surade-mobile-nav-icon text-rose-500">
                    <PhoneCall size={18} />
                  </span>
                  <span className="font-semibold text-rose-700">Nomor Penting & Darurat</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Berita */}
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
                  <span>Berita</span>
                </span>
                <ChevronRight size={15} className="opacity-40" />
              </NavLink>

              {/* Smart Village Accordion */}
              <div
                className={`surade-mobile-accordion ${
                  smartVillageExpanded ? "expanded" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSmartVillageExpanded((v) => !v)}
                  className="surade-mobile-accordion-toggle"
                >
                  <span className="surade-mobile-nav-link-left">
                    <span className="surade-mobile-accordion-icon">
                      <Building2 size={18} />
                    </span>
                    <span className="font-semibold text-[13.5px] text-slate-800">
                      Smart Village Surade
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="surade-mobile-accordion-badge">
                      {SMART_CITIES.length}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${
                        smartVillageExpanded ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </div>
                </button>

                <div className="surade-mobile-accordion-panel">
                  {SMART_CITIES.map((village) => {
                    const villageSlug = village.slug || village.name.toLowerCase().replace(/\s+/g, "-");
                    const nameKey = village.name.toLowerCase().trim();
                    const slugKey = villageSlug.toLowerCase().trim();
                    const realBisnis = villageCounts[nameKey] ?? villageCounts[slugKey] ?? village.bisnis;

                    return (
                      <div key={village.id} className="surade-mobile-cat-item">
                        <div className="surade-mobile-cat-header">
                          <Link
                            to={`/smart-city/${villageSlug}`}
                            onClick={onClose}
                            className="surade-mobile-cat-link"
                          >
                            <span className="font-medium text-slate-700">{village.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100/80">
                              {realBisnis} UMKM
                            </span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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

              {/* Cara Penggunaan */}
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
                  <span>Cara Penggunaan</span>
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
              <WhatsAppIcon size={17} />
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
            © {new Date().getFullYear()} Surade.com • Sukabumi Selatan
          </p>
        </div>
      </aside>
    </>
  );
}