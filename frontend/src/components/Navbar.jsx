import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Plus, LogOut,
  User, Settings, Loader2, Menu, X, LayoutDashboard, Mail,
} from "lucide-react";
import logoImg from "../assets/logo-surade.png";
import { DEFAULT_AVATAR, getStorageUrl } from "../utils/constants";

// In-memory module cache for instant sub-millisecond access across page transitions
let memoryCategoriesCache = null;

const getCachedCategories = () => {
  if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    return memoryCategoriesCache;
  }
  try {
    // Clear old cache first
    localStorage.removeItem("cached_navbar_blog_categories");
    
    // Load navbar categories cache (untuk navbar informasi dengan subcategories)
    const raw = localStorage.getItem("cached_navbar_categories");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategoriesCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Navbar category cache read error:", e);
  }
  return [];
};

export default function Navbar() {
  const navigate = useNavigate();

  const initialCats = getCachedCategories();
  const [categories,       setCategories]       = useState(initialCats);
  const [activeCategory,   setActiveCategory]   = useState(initialCats[0]?.slug || null);
  const [loadingCategories,setLoadingCategories]= useState(initialCats.length === 0);
  const [user,             setUser]             = useState(null);
  const [showUserMenu,     setShowUserMenu]     = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [infoOpen,         setInfoOpen]         = useState(false);
  const [inboxUnread,      setInboxUnread]      = useState(0);
  const prevInboxUnread    = useRef(0);

  const userMenuRef    = useRef(null);
  const infoRef        = useRef(null);
  const infoTimeoutRef = useRef(null);

  const activeItem  = categories.find((c) => c.slug === activeCategory) ?? categories[0];

  const handleInfoMouseEnter = () => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
      infoTimeoutRef.current = null;
    }
    setInfoOpen(true);
  };

  const handleInfoMouseLeave = () => {
    if (infoTimeoutRef.current) {
      clearTimeout(infoTimeoutRef.current);
    }
    infoTimeoutRef.current = setTimeout(() => {
      setInfoOpen(false);
    }, 300); // 300ms buffer so moving cursor never accidentally closes the menu
  };

  /* SWR background fetch categories - instant 0ms with background revalidation */
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      if (categories.length === 0) {
        setLoadingCategories(true);
      }
      try {
        // Navbar Informasi menggunakan NAVBAR CATEGORIES (10 parent + 95 subcategories)
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/navbar-categories`);
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data);
          memoryCategoriesCache = data;
          try {
            localStorage.setItem("cached_navbar_categories", JSON.stringify(data));
          } catch (_) {}
          if (!activeCategory) {
            setActiveCategory(data[0].slug);
          }
        }
      } catch (e) {
        console.error("fetch blog categories:", e);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  /* load user */
  useEffect(() => {
    const load = () => {
      const token = localStorage.getItem("token");
      const str   = localStorage.getItem("user");
      if (token && str) { try { setUser(JSON.parse(str)); } catch { setUser(null); } }
      else setUser(null);
    };
    load();
    window.addEventListener("storage",         load);
    window.addEventListener("userAuthChanged", load);
    return () => {
      window.removeEventListener("storage",         load);
      window.removeEventListener("userAuthChanged", load);
    };
  }, []);

  /* Poll inbox unread count every 15s for logged-in users */
  useEffect(() => {
    const token = localStorage.getItem("token");
    // PERBAIKAN: backend membatasi endpoint ini cuma untuk role "user"
    // (Route::middleware('role:user') di routes/api.php) - dulu di sini
    // dipanggil untuk SEMUA akun yang login termasuk admin, jadi admin
    // selalu dapat error 403 berulang-ulang (tiap 15 detik) di console.
    // Sekarang dilewati sama sekali kalau bukan role "user".
    if (!token || user?.role !== "user") return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/inbox/unread-count`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        const count = data?.count ?? 0;
        setInboxUnread(count);
        // show browser notification if count increased
        if (count > prevInboxUnread.current && prevInboxUnread.current !== null) {
          if (typeof window !== "undefined" && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Pesan Baru - Surade.co.id', {
              body: `Anda memiliki ${count} pesan belum dibaca`,
              icon: '/favicon.ico',
            });
          }
        }
        prevInboxUnread.current = count;
      } catch (_) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  /* close menus on outside click */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => {
      document.removeEventListener("mousedown", h);
      if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
    };
  }, []);

  /* close mobile on resize */
  useEffect(() => {
    const h = () => { if (window.innerWidth >= 900) setMobileOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowUserMenu(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("userAuthChanged"));
    navigate("/");
  };

  const getUserAvatar = () => {
    if (!user) return DEFAULT_AVATAR;
    if (user.avatar) {
      if (user.avatar.startsWith("http") || user.avatar.startsWith("data:"))
        return user.avatar;
      return getStorageUrl(user.avatar);
    }
    return DEFAULT_AVATAR;
  };

  const handleImgError  = (e) => { e.target.src = DEFAULT_AVATAR; };
  const getDisplayName  = ()  => user ? (user.username || user.name || user.email || "User") : "";
  const getDashboardLink = () => user?.role === "admin" ? "/admin/dashboard" : "/admin-user";
  const getProfileLink  = ()  => user?.role === "admin" ? "/admin/settings" : "/admin-user?tab=profile";

  /* ── NavLink class — pixel-matched to original CSS ── */
  const navLinkClass = ({ isActive }) => [
    /* base — matches .home-nav__link */
    "relative inline-flex items-center gap-1.5 py-1.5",
    "text-[0.85rem] font-medium whitespace-nowrap no-underline",
    "transition-colors duration-[250ms]",
    /* underline pseudo — 2.5px gradient, scale-x animation */
    "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px]",
    "after:rounded-sm after:bg-gradient-to-r after:from-[#059669] after:to-[#10B981]",
    "after:transition-transform after:duration-[250ms] after:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
    isActive
      ? "text-[#10B981] font-semibold after:scale-x-100 after:origin-left"
      : "text-slate-700 after:scale-x-0 after:origin-right hover:text-[#10B981] hover:after:scale-x-100 hover:after:origin-left",
  ].join(" ");

  /* ── Shared CTA button class ── */
  const ctaClass = [
    "inline-flex items-center justify-center gap-1.5 no-underline whitespace-nowrap",
    "rounded-full px-4 h-[38px]",
    "bg-gradient-to-br from-[#059669] to-[#10B981]",
    "text-white font-semibold text-[0.82rem] font-[inherit]",
    "shadow-[0_3px_10px_rgba(16,185,129,0.3)]",
    "transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
    "hover:from-[#10B981] hover:to-[#34D399] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(52,211,153,0.4)]",
  ].join(" ");

  return (
    <>
      {/* ════════════════════════════════════════
          NAVBAR  —  fixed, light theme + wave hijau
      ════════════════════════════════════════ */}
      <header className={[
        /* position & stacking */
        "fixed top-0 left-0 right-0 z-[200]",
        /* PERBAIKAN: sebelumnya gelap (glassmorphism dark) - sekarang
           terang dengan aksen hijau tipis, sesuai desain baru. */
        "bg-white/[0.94] backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]",
        "border-b border-emerald-100",
        "shadow-[0_4px_20px_rgba(16,185,129,0.06)]",
        "transition-[background,box-shadow] duration-300",
      ].join(" ")}>

        {/* Dekorasi wave hijau yang bergerak pelan - hanya lapisan visual,
            tidak mengganggu klik/interaksi apa pun di atasnya. */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
          <svg
            className="absolute -top-2 left-0 w-[200%] h-full"
            viewBox="0 0 2400 100"
            preserveAspectRatio="none"
            style={{ animation: "navbarWaveDrift 22s linear infinite" }}
          >
            <path
              d="M0,60 C300,10 600,90 900,50 C1200,10 1500,90 1800,50 C2100,10 2300,60 2400,50 L2400,0 L0,0 Z"
              fill="rgba(16,185,129,0.07)"
            />
            <path
              d="M0,75 C300,35 600,95 900,65 C1200,35 1500,95 1800,65 C2100,35 2300,75 2400,65 L2400,0 L0,0 Z"
              fill="rgba(52,211,153,0.06)"
            />
          </svg>
        </div>

        {/* inner container — 1240px, 68px tall, 28px side padding */}
        <div className="relative z-10 max-w-[1240px] mx-auto px-7 h-[68px] flex items-center justify-between gap-5">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="inline-flex items-center shrink-0 no-underline transition-opacity duration-[250ms] hover:opacity-90 group"
          >
            <img
              src={logoImg}
              alt="Surade.co.id"
              className="h-[38px] w-auto block transition-transform duration-[250ms] group-hover:scale-[1.02]"
            />
          </Link>

          {/* ── Desktop nav — gap:20px ── */}
          <nav className="hidden min-[900px]:flex items-center gap-5">

            <NavLink to="/" end className={navLinkClass}>Home</NavLink>

            {/* ── Informasi dropdown — responsive hover stay + click toggle ── */}
            <div
              className="relative"
              ref={infoRef}
              onMouseEnter={handleInfoMouseEnter}
              onMouseLeave={handleInfoMouseLeave}
            >
              <button
                type="button"
                onClick={() => setInfoOpen((v) => !v)}
                className={[
                  "relative inline-flex items-center gap-1.5 py-1.5",
                  "text-[0.85rem] font-medium whitespace-nowrap",
                  infoOpen ? "text-[#10B981]" : "text-slate-700",
                  "bg-transparent border-none cursor-pointer font-[inherit]",
                  "transition-colors duration-[250ms] hover:text-[#10B981]",
                ].join(" ")}
              >
                <span>Informasi</span>
                <ChevronDown
                  size={14}
                  className={`opacity-70 transition-[opacity,transform] duration-[250ms] ${
                    infoOpen ? "opacity-100 text-[#10B981] rotate-180" : "hover:opacity-100"
                  }`}
                />
              </button>

              {/* mega dropdown panel */}
              <div
                className={[
                  "absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
                  "before:block before:absolute before:-top-4 before:left-0 before:w-full before:h-5",
                  "bg-white rounded-2xl overflow-hidden",
                  "border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.06)]",
                  "min-w-[520px] max-w-[600px] z-[1000]",
                  "transition-all duration-200 ease-out origin-top",
                  infoOpen
                    ? "opacity-100 visible pointer-events-auto translate-y-0 scale-100"
                    : "opacity-0 invisible pointer-events-none translate-y-2 scale-[0.98]",
                ].join(" ")}
              >
                {/* arrow caret */}
                <span className="absolute -top-[5px] left-1/2 -translate-x-1/2 rotate-45 w-2.5 h-2.5 bg-white border-t border-l border-slate-200/80" />

                {/* Header bar inside dropdown */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100 text-[12px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5 text-[#059669]">
                    <span>Kategori Bisnis & Jasa</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {categories.length} Kategori
                  </span>
                </div>

                <div className="flex min-h-[340px] max-h-[400px]">
                  {loadingCategories ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-slate-500 text-[0.9rem] w-full">
                      <Loader2 size={20} className="animate-spin text-[#059669]" />
                      <span>Memuat kategori...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      {/* Main Category Column — scrollable */}
                      <div className="flex flex-col py-2 min-w-[250px] max-w-[260px] border-r border-slate-100 overflow-y-auto max-h-[350px]">
                        {categories.map((item) => {
                          const isSelected = (activeItem?.slug || activeCategory) === item.slug;
                          return (
                            <Link
                              key={item.id}
                              to={`/category/${item.slug}`}
                              onClick={() => setInfoOpen(false)}
                              onMouseEnter={() => setActiveCategory(item.slug)}
                              onFocus={() => setActiveCategory(item.slug)}
                              className={[
                                "flex items-center justify-between gap-2.5 mx-2 px-3.5 py-2.5 rounded-xl",
                                "text-[13px] font-semibold no-underline",
                                "transition-all duration-150",
                                isSelected
                                  ? "bg-[#059669] text-white shadow-sm"
                                  : "text-slate-700 hover:bg-slate-100/80 hover:text-[#059669]",
                              ].join(" ")}
                            >
                              <span className="truncate">{item.name}</span>
                              {item.children?.length > 0 && (
                                <ChevronRight
                                  size={14}
                                  className={[
                                    "shrink-0 transition-transform duration-150",
                                    isSelected ? "text-white translate-x-0.5" : "text-slate-400",
                                  ].join(" ")}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Sub Category Column — scrollable */}
                      <div className="flex flex-col py-2 flex-1 min-w-[240px] overflow-y-auto max-h-[350px] bg-slate-50/40">
                        {activeItem?.children?.length > 0 ? (
                          <>
                            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Sub Kategori {activeItem.name}
                            </div>
                            <div className="flex flex-col gap-0.5 px-2">
                              {activeItem.children.map((child) => (
                                <Link
                                  key={child.id}
                                  to={`/category/${child.slug}`}
                                  onClick={() => setInfoOpen(false)}
                                  className="flex items-center px-3.5 py-2 rounded-lg text-[13px] font-medium text-slate-600 no-underline transition-colors hover:bg-white hover:text-[#059669] hover:shadow-xs"
                                >
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-[12.5px] text-center h-full">
                            <span className="font-semibold text-slate-600 mb-1">{activeItem?.name || "Kategori"}</span>
                            <span>Tidak ada sub kategori spesifik. Klik kategori utama untuk melihat semua usaha.</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-10 text-slate-400 text-[0.9rem] w-full">
                      Tidak ada kategori tersedia
                    </div>
                  )}
                </div>
              </div>
            </div>

            <NavLink to="/blog"    className={navLinkClass}>Blog</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Hubungi Kami</NavLink>

            {/* ── Auth ── */}
            {user ? (
              <>
                {/* user pill */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((v) => !v)}
                    className={[
                      "inline-flex items-center gap-2 cursor-pointer font-[inherit]",
                      "bg-slate-50 border border-slate-200 rounded-full",
                      "pl-1 pr-3 py-1",
                      "text-slate-800 text-[0.82rem] font-semibold",
                      "transition-all duration-[250ms]",
                      "hover:bg-emerald-50 hover:border-[rgba(16,185,129,0.4)] hover:-translate-y-px",
                    ].join(" ")}
                  >
                    {/* Avatar with unread badge */}
                    <span className="relative shrink-0">
                      <img
                        src={getUserAvatar()}
                        alt={getDisplayName()}
                        onError={handleImgError}
                        className="w-[34px] h-[34px] rounded-full object-cover border-2 border-slate-200 transition-[border-color] duration-[250ms]"
                      />
                      {inboxUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm animate-pulse">
                          {inboxUnread > 99 ? '99+' : inboxUnread}
                        </span>
                      )}
                    </span>
                    <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {getDisplayName()}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`opacity-70 transition-transform duration-[250ms] ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* user dropdown */}
                  {showUserMenu && (
                    <div className={[
                      "absolute top-[calc(100%+12px)] right-0 bg-white",
                      "rounded-2xl border border-black/[0.06]",
                      "shadow-[0_16px_40px_rgba(0,0,0,0.16),0_2px_10px_rgba(0,0,0,0.06)]",
                      "min-w-[240px] py-2.5 z-[1000]",
                      "[animation:userMenuFadeIn_0.2s_cubic-bezier(0.16,1,0.3,1)]",
                    ].join(" ")}>
                      {/* header */}
                      <div className="flex items-center gap-[10px] px-4 py-3">
                        <img
                          src={getUserAvatar()}
                          alt={getDisplayName()}
                          onError={handleImgError}
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="text-[0.875rem] font-bold text-slate-800 m-0 leading-snug">
                            {getDisplayName()}
                          </p>
                          <p className="text-[0.75rem] text-slate-400 m-0 leading-snug max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="h-px bg-slate-100 my-1.5" />
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#059669]"
                      >
                        <LayoutDashboard size={15} /><span>Dashboard Saya</span>
                      </Link>
                      <Link
                        to="/dashboard?tab=inbox"
                        onClick={() => { setShowUserMenu(false); setInboxUnread(0); }}
                        className="flex items-center justify-between gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#059669]"
                      >
                        <span className="flex items-center gap-[10px]">
                          <Mail size={15} /><span>Inbox Pesan</span>
                        </span>
                        {inboxUnread > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {inboxUnread > 99 ? '99+' : inboxUnread}
                          </span>
                        )}
                      </Link>
                      <Link
                        to={getProfileLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#059669]"
                      >
                        <Settings size={15} /><span>Pengaturan</span>
                      </Link>
                      <div className="h-px bg-slate-100 my-1.5" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-red-500 bg-transparent border-none cursor-pointer font-[inherit] text-left transition-[background,color] duration-150 hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut size={15} /><span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/add-business" className={ctaClass}>
                  <Plus size={14} /><span>Usaha</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[0.85rem] font-semibold text-[#10B981] no-underline transition-colors duration-[250ms]"
                >
                  Login
                </Link>
                <Link to="/add-business" className={ctaClass}>
                  <Plus size={14} /><span>Tambah Usaha</span>
                </Link>
              </>
            )}
          </nav>

          {/* ── Hamburger (mobile < 900px) ── */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="min-[900px]:hidden ml-auto inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-700 bg-slate-100 border border-slate-200 transition-colors duration-150 hover:bg-slate-200"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE SIDEBAR
      ════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm min-[900px]:hidden"
            style={{ animation: "userMenuFadeIn 0.2s ease both" }}
            onClick={() => setMobileOpen(false)}
          />

          {/* panel */}
          <aside
            className="fixed top-0 right-0 bottom-0 z-[260] w-[300px] bg-white border-l border-slate-200 flex flex-col min-[900px]:hidden overflow-y-auto"
            style={{ animation: "sidebarSlide 0.28s cubic-bezier(0.4,0,0.2,1) both" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100 shrink-0">
              <img src={logoImg} alt="Surade.co.id" className="h-10 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* links */}
            <nav className="flex flex-col px-3 py-4 gap-0.5 flex-1">
              {[
                { to: "/",        label: "Home",         end: true },
                { to: "/blog",    label: "Blog" },
                { to: "/contact", label: "Hubungi Kami" },
              ].map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center px-4 py-3 rounded-xl text-[0.9rem] font-medium no-underline transition-colors duration-150",
                      isActive
                        ? "bg-[rgba(16,185,129,0.1)] text-[#059669] font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}

              {/* categories */}
              {categories.length > 0 && (
                <div className="px-4 pt-4 pb-1">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
                    Kategori
                  </p>
                  <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-2 py-2 rounded-lg text-[0.84rem] font-medium text-slate-600 no-underline transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span>{c.name}</span>
                        {c.children?.length > 0 && (
                          <ChevronRight size={13} className="text-slate-300" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* auth */}
            <div className="px-4 pb-6 pt-4 border-t border-slate-100 flex flex-col gap-3 shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={getUserAvatar()}
                      alt={getDisplayName()}
                      onError={handleImgError}
                      className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.85rem] font-bold text-slate-800 truncate m-0">{getDisplayName()}</p>
                      <p className="text-[0.72rem] text-slate-400 truncate m-0">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[0.875rem] font-medium text-slate-700 no-underline bg-slate-50 transition-colors hover:bg-slate-100"
                  >
                    <LayoutDashboard size={15} /><span>Dashboard Saya</span>
                  </Link>
                  <Link to="/add-business" onClick={() => setMobileOpen(false)} className={ctaClass + " justify-center"}>
                    <Plus size={15} /><span>Tambah Usaha</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[0.875rem] font-medium text-red-500 bg-transparent border border-red-200 cursor-pointer font-[inherit] transition-colors hover:bg-red-50"
                  >
                    <LogOut size={15} /><span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#10B981] no-underline border border-[rgba(16,185,129,0.4)] transition-colors hover:bg-[rgba(16,185,129,0.1)]"
                  >
                    Login
                  </Link>
                  <Link to="/add-business" onClick={() => setMobileOpen(false)} className={ctaClass + " justify-center"}>
                    <Plus size={15} /><span>Tambah Usaha</span>
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}