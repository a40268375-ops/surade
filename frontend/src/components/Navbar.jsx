import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, LogOut, User, Settings, Loader2 } from "lucide-react";
import logoImg from "../assets/logo.png";
import { DEFAULT_AVATAR, getStorageUrl } from "../utils/constants";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const activeItem = categories.find((item) => item.slug === activeCategory) ?? categories[0];

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
          // Set first category as active if none selected
          if (data.length > 0 && !activeCategory) {
            setActiveCategory(data[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Listen for storage changes (e.g. login/logout from another tab)
    window.addEventListener("storage", loadUser);

    // Also listen for a custom event for same-tab login/logout
    window.addEventListener("userAuthChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userAuthChanged", loadUser);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new Event("userAuthChanged"));
    navigate("/");
  };

  const getUserAvatar = () => {
    if (!user) return DEFAULT_AVATAR;
    if (user.avatar) {
      if (user.avatar.startsWith("http")) return user.avatar;
      if (user.avatar.startsWith("data:")) return user.avatar;
      return getStorageUrl(user.avatar);
    }
    return DEFAULT_AVATAR;
  };

  const handleImageError = (e) => {
    e.target.src = DEFAULT_AVATAR;
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.username || user.name || user.email || "User";
  };

  const getProfileLink = () => {
    // Redirect based on user role
    if (user.role === "admin") {
      return "/admin/dashboard";
    }
    // Default for regular users
    return "/admin-user?tab=profile";
  };

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Info.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <NavLink to="/" end className={({ isActive }) => `home-nav__link${isActive ? " active" : ""}`}>
            Home
          </NavLink>

          <div className="home-nav__dropdown-wrapper">
            <button type="button" className="home-nav__link home-nav__link--dropdown">
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </button>
            <div className="home-nav__dropdown-menu">
              <div className="home-nav__mega">
                {loadingCategories ? (
                  <div className="home-nav__mega-loading">
                    <Loader2 size={20} className="spin" />
                    <span>Memuat kategori...</span>
                  </div>
                ) : categories.length > 0 ? (
                  <>
                    <div className="home-nav__mega-col home-nav__mega-col--main">
                      {categories.map((item) => (
                        <Link
                          key={item.id}
                          to={`/category/${item.slug}`}
                          className={`home-nav__dropdown-item${activeCategory === item.slug ? " active" : ""}`}
                          onMouseEnter={() => setActiveCategory(item.slug)}
                          onFocus={() => setActiveCategory(item.slug)}
                        >
                          <span>{item.name}</span>
                          {item.children && item.children.length > 0 && (
                            <ChevronRight size={14} className="home-nav__dropdown-chevron" />
                          )}
                        </Link>
                      ))}
                    </div>
                    <div className="home-nav__mega-col home-nav__mega-col--sub">
                      {activeItem && activeItem.children && activeItem.children.length > 0 ? (
                        activeItem.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            className="home-nav__sub-item"
                          >
                            {child.name}
                          </Link>
                        ))
                      ) : (
                        <div className="home-nav__sub-empty">
                          Tidak ada sub kategori
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="home-nav__mega-empty">
                    Tidak ada kategori tersedia
                  </div>
                )}
              </div>
            </div>
          </div>

          <NavLink to="/blog" className={({ isActive }) => `home-nav__link${isActive ? " active" : ""}`}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `home-nav__link${isActive ? " active" : ""}`}>
            Hubungi Kami
          </NavLink>

          {/* ── Auth Section ── */}
          {user ? (
            /* LOGGED IN STATE */
            <>
              <div className="home-nav__user-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="home-nav__user-btn"
                  onClick={() => setShowUserMenu((v) => !v)}
                >
                  <img
                    src={getUserAvatar()}
                    alt={getDisplayName()}
                    className="home-nav__user-avatar"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                  />
                  <span className="home-nav__user-name">{getDisplayName()}</span>
                  <ChevronDown
                    size={15}
                    className={`home-nav__caret ${showUserMenu ? "home-nav__caret--open" : ""}`}
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="home-nav__user-menu">
                    <div className="home-nav__user-menu-header">
                      <img
                        src={getUserAvatar()}
                        alt={getDisplayName()}
                        className="home-nav__user-menu-avatar"
                        onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                      />
                      <div>
                        <p className="home-nav__user-menu-name">{getDisplayName()}</p>
                        <p className="home-nav__user-menu-email">{user.email}</p>
                      </div>
                    </div>
                    <div className="home-nav__user-menu-divider" />
                    <Link
                      to={getProfileLink()}
                      className="home-nav__user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={15} />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      to={getProfileLink()}
                      className="home-nav__user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={15} />
                      <span>Pengaturan</span>
                    </Link>
                    <div className="home-nav__user-menu-divider" />
                    <button
                      type="button"
                      className="home-nav__user-menu-item home-nav__user-menu-item--logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>

              <Link to="/add-business" className="home-nav__button">
                <Plus size={15} /><span>Usaha</span>
              </Link>
            </>
          ) : (
            /* LOGGED OUT STATE */
            <>
              <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
              <Link to="/add-business" className="home-nav__button">
                <Plus size={15} /><span>Tambah Usaha</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
