import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown, ChevronRight, Plus, LogOut,
  User, Settings, Loader2, Menu, X, LayoutDashboard,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import { DEFAULT_AVATAR, getStorageUrl } from "../utils/constants";

export default function Navbar() {
  const navigate = useNavigate();

  const [categories,       setCategories]       = useState([]);
  const [activeCategory,   setActiveCategory]   = useState(null);
  const [loadingCategories,setLoadingCategories]= useState(true);
  const [user,             setUser]             = useState(null);
  const [showUserMenu,     setShowUserMenu]     = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);

  const userMenuRef = useRef(null);
  const activeItem  = categories.find((c) => c.slug === activeCategory) ?? categories[0];

  /* fetch categories */
  useEffect(() => {
    const fetch_ = async () => {
      setLoadingCategories(true);
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0 && !activeCategory) setActiveCategory(data[0].slug);
        }
      } catch (e) { console.error("fetch categories:", e); }
      finally    { setLoadingCategories(false); }
    };
    fetch_();
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

  /* close user menu on outside click */
  useEffect(() => {
    const h = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
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
    "after:rounded-sm after:bg-gradient-to-r after:from-[#007570] after:to-[#00B4A9]",
    "after:transition-transform after:duration-[250ms] after:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
    isActive
      ? "text-[#00B4A9] font-semibold after:scale-x-100 after:origin-left"
      : "text-white/[0.82] after:scale-x-0 after:origin-right hover:text-[#00B4A9] hover:after:scale-x-100 hover:after:origin-left",
  ].join(" ");

  /* ── Shared CTA button class ── */
  const ctaClass = [
    "inline-flex items-center justify-center gap-1.5 no-underline whitespace-nowrap",
    "rounded-full px-4 h-[38px]",
    "bg-gradient-to-br from-[#007570] to-[#008f89]",
    "text-white font-semibold text-[0.82rem] font-[inherit]",
    "shadow-[0_3px_10px_rgba(0,117,112,0.3)]",
    "transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
    "hover:from-[#008f89] hover:to-[#00B4A9] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_rgba(0,180,169,0.4)]",
  ].join(" ");

  return (
    <>
      {/* ════════════════════════════════════════
          NAVBAR  —  fixed, glassmorphism
      ════════════════════════════════════════ */}
      <header className={[
        /* position & stacking */
        "fixed top-0 left-0 right-0 z-[200]",
        /* glassmorphism — matches original exactly */
        "bg-[rgba(10,15,22,0.82)] backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]",
        "border-b border-white/[0.08]",
        "shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
        "transition-[background,box-shadow] duration-300",
      ].join(" ")}>

        {/* inner container — 1240px, 68px tall, 28px side padding */}
        <div className="max-w-[1240px] mx-auto px-7 h-[68px] flex items-center justify-between gap-5">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="inline-flex items-center shrink-0 no-underline transition-opacity duration-[250ms] hover:opacity-90 group"
          >
            <img
              src={logoImg}
              alt="Info.co.id"
              className="h-[38px] w-auto block transition-transform duration-[250ms] group-hover:scale-[1.02]"
            />
          </Link>

          {/* ── Desktop nav — gap:20px ── */}
          <nav className="hidden min-[900px]:flex items-center gap-5">

            <NavLink to="/" end className={navLinkClass}>Home</NavLink>

            {/* ── Informasi dropdown — group hover, original behaviour ── */}
            <div className="relative group">
              <button
                type="button"
                className={[
                  "relative inline-flex items-center gap-1.5 py-1.5",
                  "text-[0.85rem] font-medium whitespace-nowrap text-white/[0.82]",
                  "bg-transparent border-none cursor-pointer font-[inherit]",
                  "transition-colors duration-[250ms] hover:text-[#00B4A9]",
                ].join(" ")}
              >
                <span>Informasi</span>
                <ChevronDown
                  size={14}
                  className="opacity-70 transition-[opacity,transform] duration-[250ms] group-hover:opacity-100 group-hover:text-[#00B4A9] group-hover:rotate-180"
                />
              </button>

              {/* mega dropdown panel */}
              <div className={[
                "absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 translate-y-[6px]",
                "before:block before:absolute before:-top-4 before:left-0 before:w-full before:h-4",
                "bg-white rounded overflow-hidden",
                "shadow-[0_10px_40px_rgba(0,0,0,0.18)]",
                "min-w-[480px] z-[1000]",
                "opacity-0 invisible pointer-events-none",
                "transition-[opacity,transform,visibility] duration-200",
                "group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0",
              ].join(" ")}>

                {/* arrow caret */}
                <span className="absolute -top-[6px] left-1/2 -translate-x-1/2 rotate-45 w-3 h-3 bg-white shadow-[-2px_-2px_4px_rgba(0,0,0,0.04)]" />

                <div className="flex min-h-[320px]">
                  {loadingCategories ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-slate-500 text-[0.9rem] w-full">
                      <Loader2 size={20} className="animate-spin" />
                      <span>Memuat kategori...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      {/* main col — min-width:240px, border-right */}
                      <div className="flex flex-col py-1.5 min-w-[240px] border-r border-slate-200">
                        {categories.map((item) => (
                          <Link
                            key={item.id}
                            to={`/category/${item.slug}`}
                            onMouseEnter={() => setActiveCategory(item.slug)}
                            onFocus={() => setActiveCategory(item.slug)}
                            className={[
                              "flex items-center justify-between gap-3 px-[18px] py-[11px]",
                              "text-[0.875rem] font-medium no-underline",
                              "transition-[background,color] duration-150",
                              activeCategory === item.slug
                                ? "bg-slate-50 text-[#007570]"
                                : "text-slate-600 hover:bg-slate-50 hover:text-[#007570]",
                            ].join(" ")}
                          >
                            <span>{item.name}</span>
                            {item.children?.length > 0 && (
                              <ChevronRight
                                size={14}
                                className={[
                                  "shrink-0 transition-[color,transform] duration-150",
                                  activeCategory === item.slug
                                    ? "text-[#007570] translate-x-0.5"
                                    : "text-slate-400",
                                ].join(" ")}
                              />
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* sub col */}
                      <div className="flex flex-col py-1.5 flex-1 min-w-[220px]">
                        {activeItem?.children?.length > 0 ? (
                          activeItem.children.map((child) => (
                            <Link
                              key={child.id}
                              to={`/category/${child.slug}`}
                              className="block px-5 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#007570]"
                            >
                              {child.name}
                            </Link>
                          ))
                        ) : (
                          <div className="flex items-center justify-center px-5 py-10 text-slate-400 text-[0.875rem]">
                            Tidak ada sub kategori
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
                      "bg-white/[0.06] border border-white/[0.12] rounded-full",
                      "pl-1 pr-3 py-1",
                      "text-white/[0.92] text-[0.82rem] font-semibold",
                      "transition-all duration-[250ms]",
                      "hover:bg-white/[0.12] hover:border-[rgba(0,180,169,0.4)] hover:-translate-y-px",
                    ].join(" ")}
                  >
                    <img
                      src={getUserAvatar()}
                      alt={getDisplayName()}
                      onError={handleImgError}
                      className="w-[34px] h-[34px] rounded-full object-cover border-2 border-white/30 shrink-0 transition-[border-color] duration-[250ms]"
                    />
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
                        className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#007570]"
                      >
                        <LayoutDashboard size={15} /><span>Dashboard Saya</span>
                      </Link>
                      <Link
                        to={getProfileLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-[10px] w-full px-4 py-[10px] text-[0.875rem] font-medium text-slate-600 no-underline transition-[background,color] duration-150 hover:bg-slate-50 hover:text-[#007570]"
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
                  className="text-[0.85rem] font-semibold text-[#00B4A9] no-underline transition-colors duration-[250ms]"
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
            className="min-[900px]:hidden ml-auto inline-flex items-center justify-center w-9 h-9 rounded-xl text-white/80 bg-white/[0.07] border border-white/[0.10] transition-colors duration-150 hover:bg-white/[0.14]"
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
            className="fixed top-0 right-0 bottom-0 z-[260] w-[300px] bg-[rgba(10,15,22,0.97)] border-l border-white/[0.07] flex flex-col min-[900px]:hidden overflow-y-auto"
            style={{ animation: "sidebarSlide 0.28s cubic-bezier(0.4,0,0.2,1) both" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-white/[0.07] shrink-0">
              <img src={logoImg} alt="Info.co.id" className="h-10 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
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
                        ? "bg-[rgba(0,117,112,0.15)] text-[#00B4A9] font-semibold"
                        : "text-white/[0.75] hover:bg-white/[0.06] hover:text-white",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}

              {/* categories */}
              {categories.length > 0 && (
                <div className="px-4 pt-4 pb-1">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/30 mb-2">
                    Kategori
                  </p>
                  <div className="flex flex-col gap-0.5 max-h-44 overflow-y-auto">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-2 py-2 rounded-lg text-[0.84rem] font-medium text-white/55 no-underline transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <span>{c.name}</span>
                        {c.children?.length > 0 && (
                          <ChevronRight size={13} className="text-white/25" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {/* auth */}
            <div className="px-4 pb-6 pt-4 border-t border-white/[0.07] flex flex-col gap-3 shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={getUserAvatar()}
                      alt={getDisplayName()}
                      onError={handleImgError}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[0.85rem] font-bold text-white truncate m-0">{getDisplayName()}</p>
                      <p className="text-[0.72rem] text-white/40 truncate m-0">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[0.875rem] font-medium text-white/70 no-underline bg-white/[0.06] transition-colors hover:bg-white/[0.12] hover:text-white"
                  >
                    <LayoutDashboard size={15} /><span>Dashboard Saya</span>
                  </Link>
                  <Link to="/add-business" onClick={() => setMobileOpen(false)} className={ctaClass + " justify-center"}>
                    <Plus size={15} /><span>Tambah Usaha</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[0.875rem] font-medium text-red-400 bg-transparent border border-red-500/20 cursor-pointer font-[inherit] transition-colors hover:bg-red-500/[0.10] hover:text-red-300"
                  >
                    <LogOut size={15} /><span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-[0.875rem] font-semibold text-[#00B4A9] no-underline border border-[rgba(0,117,112,0.4)] transition-colors hover:bg-[rgba(0,117,112,0.1)]"
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
