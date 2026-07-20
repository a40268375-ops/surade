import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, LogOut, User, Settings } from "lucide-react";
import logoImg from "../assets/logo.png";
import { INFO_MENU } from "../data/infoMenu";
import "./Navbar.css";

export { INFO_MENU };

const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

export default function Navbar() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(INFO_MENU[0].slug);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const activeItem = INFO_MENU.find((item) => item.slug === activeCategory) ?? INFO_MENU[0];

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
    if (!user) return defaultAvatar;
    if (user.avatar) {
      return user.avatar.startsWith("http")
        ? user.avatar
        : `${import.meta.env.VITE_API_URL}/storage/${user.avatar}`;
    }
    return defaultAvatar;
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.name || user.email || "User";
  };

  return (
    <header className="home-header">
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Info.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <Link to="/" className="home-nav__link">Home</Link>

          <div className="home-nav__dropdown-wrapper">
            <button type="button" className="home-nav__link home-nav__link--dropdown">
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </button>
            <div className="home-nav__dropdown-menu">
              <div className="home-nav__mega">
                <div className="home-nav__mega-col home-nav__mega-col--main">
                  {INFO_MENU.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/category/${item.slug}`}
                      className={`home-nav__dropdown-item${activeCategory === item.slug ? " active" : ""}`}
                      onMouseEnter={() => setActiveCategory(item.slug)}
                      onFocus={() => setActiveCategory(item.slug)}
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={14} className="home-nav__dropdown-chevron" />
                    </Link>
                  ))}
                </div>
                <div className="home-nav__mega-col home-nav__mega-col--sub">
                  {activeItem.children.map((child) => (
                    <Link
                      key={child.slug}
                      to={`/category/${child.slug}`}
                      className="home-nav__sub-item"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link to="/blog" className="home-nav__link">Blog</Link>
          <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>

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
                      to="/admin-user"
                      className="home-nav__user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={15} />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      to="/admin-user"
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

              <button type="button" className="home-nav__button">
                <Plus size={15} /><span>Jual</span>
              </button>
            </>
          ) : (
            /* LOGGED OUT STATE */
            <>
              <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
              <button type="button" className="home-nav__button">
                <Plus size={15} /><span>Add Bisnis</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
