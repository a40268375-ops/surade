import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Plus, LogOut,
  User, Settings, Loader2, Menu, X, LayoutDashboard, Mail, Sparkles,
} from "lucide-react";
import logoImg from "../assets/logo-surade.png";
import { DEFAULT_AVATAR, getStorageUrl } from "../utils/constants";
import MobileMenu from "./MobileMenu";
import MobileBottomNav from "./MobileBottomNav";
import { getSubcategoryIcon } from "../utils/subcategoryIcons";
import { getCompleteNavbarCategories } from "../utils/categoryIcons";

// Helper to sort categories strictly by their configured order
const sortCategoriesList = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .filter((c) => {
      const slug = String(c.slug || c.name || "").toLowerCase();
      return slug !== "umkm" && slug !== "nomor-penting" && !slug.includes("nomor penting") && !slug.includes("darurat");
    })
    .sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });
};

// In-memory module cache for instant sub-millisecond access across page transitions
let memoryCategoriesCache = null;

const getCachedCategories = () => {
  if (memoryCategoriesCache && memoryCategoriesCache.length >= 15) {
    return memoryCategoriesCache;
  }
  try {
    // Clear legacy caches
    localStorage.removeItem("cached_navbar_categories");
    localStorage.removeItem("cached_navbar_blog_categories");
    localStorage.removeItem("cached_navbar_categories_v3");
    localStorage.removeItem("cached_navbar_categories_v4");
    
    // Load navbar categories cache v5
    const raw = localStorage.getItem("cached_navbar_categories_v5");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 15) {
        const sorted = sortCategoriesList(parsed);
        memoryCategoriesCache = sorted;
        return sorted;
      }
    }
  } catch (e) {
    console.warn("Navbar category cache read error:", e);
  }
  
  const fallback = getCompleteNavbarCategories();
  memoryCategoriesCache = fallback;
  return fallback;
};

export default function Navbar({ forceSolid = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // Automatic detection for pages with light backgrounds (e.g. Login, Register, Forgot Password, Dashboard)
  const isLightPage = forceSolid || [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/dashboard",
    "/admin-user",
    "/admin",
  ].some((path) => location.pathname.startsWith(path));

  const initialCats = getCachedCategories();
  const [categories,       setCategories]       = useState(initialCats);
  const [activeCategory,   setActiveCategory]   = useState(initialCats[0]?.slug || null);
  const [loadingCategories,setLoadingCategories]= useState(initialCats.length === 0);
  const [user,             setUser]             = useState(null);
  const [showUserMenu,     setShowUserMenu]     = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [infoOpen,         setInfoOpen]         = useState(false);
  const [inboxUnread,      setInboxUnread]      = useState(0);
  const [isScrolledState,  setIsScrolledState]  = useState(false);
  const prevInboxUnread    = useRef(0);

  const isScrolled = isScrolledState || isLightPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledState(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/navbar-categories`);
        const data = await res.json();
        if (isMounted && Array.isArray(data) && data.length >= 15) {
          const sorted = sortCategoriesList(data);
          setCategories(sorted);
          memoryCategoriesCache = sorted;
          try {
            localStorage.setItem("cached_navbar_categories_v5", JSON.stringify(sorted));
          } catch (_) {}
          if (!activeCategory || !sorted.some(c => c.slug === activeCategory)) {
            setActiveCategory(sorted[0]?.slug || null);
          }
        } else if (isMounted && (!categories || categories.length < 15)) {
          const complete = getCompleteNavbarCategories();
          setCategories(complete);
          if (!activeCategory || !complete.some(c => c.slug === activeCategory)) {
            setActiveCategory(complete[0]?.slug || null);
          }
        }
      } catch (e) {
        if (isMounted && (!categories || categories.length < 15)) {
          const complete = getCompleteNavbarCategories();
          setCategories(complete);
          if (!activeCategory) {
            setActiveCategory(complete[0]?.slug || null);
          }
        }
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
      if (token && str) {
        try {
          const parsed = JSON.parse(str);
          const u = (parsed && parsed.data && (parsed.data.role || parsed.data.email)) ? parsed.data : parsed;
          setUser(u);
        } catch {
          setUser(null);
        }
      }
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
    if (!token || user?.role === "admin" || user?.role === "super_admin") return;

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
            new Notification('Pesan Baru - Surade.com', {
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

  const handleLogout = async () => {
    try {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace("localhost", "127.0.0.1");
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${apiBase}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (_) {}
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
  const getDashboardLink = () => {
    const role = (user?.role || "").toLowerCase();
    return (role === "admin" || role === "super_admin") ? "/admin/dashboard" : "/admin-user";
  };
  const getProfileLink = () => {
    const role = (user?.role || "").toLowerCase();
    return (role === "admin" || role === "super_admin") ? "/admin/settings" : "/admin-user?tab=profile";
  };

  /* ── NavLink class — pixel-matched to original CSS with transparent support ── */
  const navLinkClass = ({ isActive }) => [
    /* base — matches .home-nav__link */
    "relative inline-flex items-center gap-1.5 py-1.5",
    "text-[0.88rem] font-semibold whitespace-nowrap no-underline",
    "transition-colors duration-[250ms]",
    /* underline pseudo — 2.5px gradient, scale-x animation */
    "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px]",
    "after:rounded-sm after:bg-gradient-to-r after:from-[#10B981] after:to-[#34D399]",
    "after:transition-transform after:duration-[250ms] after:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
    isActive
      ? isScrolled
        ? "text-[#059669] font-bold after:scale-x-100 after:origin-left"
        : "text-[#34D399] font-bold after:scale-x-100 after:origin-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
      : isScrolled
        ? "text-slate-700 after:scale-x-0 after:origin-right hover:text-[#059669] hover:after:scale-x-100 hover:after:origin-left"
        : "text-white after:scale-x-0 after:origin-right hover:text-emerald-300 hover:after:scale-x-100 hover:after:origin-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
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
          NAVBAR  —  fixed, transparent at top / glass on scroll
      ════════════════════════════════════════ */}
      <header className={[
        /* position & stacking */
        "fixed top-0 left-0 right-0 z-[200]",
        "transition-all duration-300 ease-out",
        isScrolled
          ? "bg-white/90 backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)] border-b border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent border-b border-transparent shadow-none",
      ].join(" ")}>

        {/* inner container — 1240px, 68px tall, 28px side padding */}
        <div className="relative z-10 max-w-[1240px] mx-auto px-7 h-[68px] flex items-center justify-between gap-5">

          {/* ── Logo with surade.com Title ── */}
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 shrink-0 no-underline transition-opacity duration-[250ms] hover:opacity-90 group"
          >
            <img
              src={logoImg}
              alt="Surade.com"
              className="h-[38px] w-auto block transition-transform duration-[250ms] group-hover:scale-[1.03]"
            />
            <span className="text-[1.3rem] font-black tracking-tight flex items-center select-none leading-none">
              <span className={isScrolled ? "text-[#059669]" : "text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"}>
                Surade
              </span>
              <span className={isScrolled ? "text-slate-800" : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"}>
                .com
              </span>
            </span>
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
                  "text-[0.88rem] font-semibold whitespace-nowrap",
                  infoOpen
                    ? isScrolled ? "text-[#059669]" : "text-[#34D399]"
                    : isScrolled ? "text-slate-700 hover:text-[#059669]" : "text-white hover:text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
                  "bg-transparent border-none cursor-pointer font-[inherit]",
                  "transition-colors duration-[250ms]",
                ].join(" ")}
              >
                <span>Informasi</span>
                <ChevronDown
                  size={14}
                  className={`transition-[opacity,transform] duration-[250ms] ${
                    infoOpen
                      ? "opacity-100 rotate-180 " + (isScrolled ? "text-[#059669]" : "text-[#34D399]")
                      : (isScrolled ? "text-slate-500 opacity-70" : "text-white/90 opacity-90")
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
                  "min-w-[620px] max-w-[680px] z-[1000]",
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

                <div className="flex min-h-[360px] max-h-[440px]">
                  {loadingCategories ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-slate-500 text-[0.9rem] w-full">
                      <Loader2 size={20} className="animate-spin text-[#059669]" />
                      <span>Memuat kategori...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      {/* Main Category Column — scrollable */}
                      <div className="flex flex-col py-2 min-w-[260px] max-w-[280px] border-r border-slate-100 overflow-y-auto max-h-[400px]">
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
                      <div className="flex flex-col py-2 flex-1 min-w-[340px] max-w-[420px] overflow-y-auto max-h-[400px] bg-slate-50/40">
                        {activeItem?.children?.length > 0 ? (
                          <>
                            <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              Sub Kategori {activeItem.name} ({activeItem.children.length})
                            </div>
                            <div className="flex flex-col gap-0.5 px-2">
                              {activeItem.children.map((child) => (
                                <Link
                                  key={child.id || child.slug}
                                  to={`/category/${child.slug}`}
                                  onClick={() => setInfoOpen(false)}
                                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-slate-700 no-underline transition-colors hover:bg-white hover:text-[#059669] hover:shadow-xs"
                                >
                                  <span className="shrink-0">{getSubcategoryIcon(child.name)}</span>
                                  <span className="leading-snug text-left">{child.name}</span>
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

            <NavLink to="/nomor-penting" className={navLinkClass}>Nomor Penting</NavLink>
            <NavLink to="/blog"    className={navLinkClass}>Berita</NavLink>
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
                      {(user?.role !== "admin" && user?.role !== "super_admin") && (
                        <Link
                          to="/dashboard?tab=inbox"
                          onClick={() => { setShowUserMenu(false); setInboxUnread(0); }}
                          className="flex items-center justify-between gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#059669]"
                        >
                          <span className="flex items-center gap-[10px]">
                            <Mail size={15} /><span>Pesan</span>
                          </span>
                          {inboxUnread > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {inboxUnread > 99 ? '99+' : inboxUnread}
                            </span>
                          )}
                        </Link>
                      )}
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

          {/* ── Mobile Right Actions (< 900px) — Masuk button or User Avatar ── */}
          <div className="min-[900px]:hidden ml-auto flex items-center gap-2">
            {user ? (
              <Link
                to={getDashboardLink()}
                className="relative inline-flex items-center justify-center p-0.5 rounded-full border-2 border-emerald-400 transition-transform active:scale-95 shadow-sm"
                title={getDisplayName()}
                aria-label="Dashboard"
              >
                <img
                  src={getUserAvatar()}
                  alt={getDisplayName()}
                  onError={handleImgError}
                  className="w-8 h-8 rounded-full object-cover"
                />
                {inboxUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white animate-pulse">
                    {inboxUnread > 9 ? "9+" : inboxUnread}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className={`text-[0.8rem] font-bold px-3.5 py-1.5 rounded-full transition-all border shadow-sm ${
                  isScrolled
                    ? "bg-[#059669] text-white border-[#059669] hover:bg-[#047857]"
                    : "bg-emerald-600/90 text-white border-emerald-400/50 hover:bg-emerald-600 backdrop-blur-md"
                }`}
                aria-label="Masuk Akun"
              >
                Masuk
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* ════════════════════════════════════════
          ENHANCED MOBILE NAVIGATION DRAWER
      ════════════════════════════════════════ */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        inboxUnread={inboxUnread}
        categories={categories}
        onLogout={handleLogout}
        getUserAvatar={getUserAvatar}
        getDisplayName={getDisplayName}
        getDashboardLink={getDashboardLink}
        getProfileLink={getProfileLink}
        handleImgError={handleImgError}
      />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        user={user}
        inboxUnread={inboxUnread}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />
    </>
  );
}