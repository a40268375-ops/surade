import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../utils/api";
import logoImg from "../assets/logo.png";
import { INFO_MENU } from "../data/infoMenu";
import { iconForCategory } from "../utils/categoryIcons.jsx";
import NavbarWindLeaves from "./NavbarWindLeaves";
import "./Navbar.css";

export { INFO_MENU };

function mapInfoMenuFallback() {
  return INFO_MENU.map((item) => ({
    id: item.slug,
    name: item.label,
    slug: item.slug,
    children: item.children.map((child) => ({
      id: child.slug,
      name: child.label,
      slug: child.slug,
    })),
  }));
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [leavesActive, setLeavesActive] = useState(false);
  const [navCategories, setNavCategories] = useState(mapInfoMenuFallback());
  const [activeParentIdx, setActiveParentIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setLeavesActive(y > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    api.get("/categories/tree")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNavCategories(data);
        }
      })
      .catch(() => {
        setNavCategories(mapInfoMenuFallback());
      });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when location changes
  useEffect(() => {
    setDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const activeParent = navCategories[activeParentIdx] || navCategories[0];
  const activeChildren = activeParent?.children || [];

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.home-nav__dropdown-wrapper')) {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <header className={`home-header ${scrolled ? "home-header--scrolled" : ""}`}>
      <NavbarWindLeaves active={leavesActive} />
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Surade.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <Link to="/" className="home-nav__link">Home</Link>

          <div className={`home-nav__dropdown-wrapper home-nav__dropdown-wrapper--mega ${dropdownOpen ? 'open' : ''}`}>
            <button 
              type="button" 
              className="home-nav__link home-nav__link--dropdown"
              onClick={toggleDropdown}
            >
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </button>
            <div className="home-nav__dropdown-menu home-nav__dropdown-menu--mega">
              <div className="home-nav__mega-col home-nav__mega-col--parents">
                {navCategories.map((item, idx) => (
                  <Link
                    key={item.slug || item.id}
                    to={`/category/${item.slug}`}
                    className={`home-nav__dropdown-item${idx === activeParentIdx ? " active" : ""}`}
                    onMouseEnter={() => setActiveParentIdx(idx)}
                    onFocus={() => setActiveParentIdx(idx)}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span className="home-nav__dropdown-label">
                      <span className="home-nav__dropdown-icon">{iconForCategory(item.name, { size: 16, iconKey: item.icon })}</span>
                      <span>{item.name}</span>
                    </span>

                    {(item.children?.length ?? 0) > 0 && (
                      <ChevronRight size={14} className="home-nav__dropdown-chevron" />
                    )}
                  </Link>
                ))}
              </div>
              <div className="home-nav__mega-col home-nav__mega-col--children">
                {activeChildren.length > 0 ? (
                  activeChildren.map((child) => (
                    <Link
                      key={child.slug || child.id}
                      to={`/category/${child.slug}`}
                      className="home-nav__sub-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="home-nav__dropdown-icon">{iconForCategory(child.name, { size: 15, iconKey: child.icon })}</span>

                      {child.name}
                    </Link>
                  ))
                ) : (
                  <span className="home-nav__mega-empty">Tidak ada subkategori</span>
                )}
              </div>
            </div>
          </div>

          {/* Blog & Event sekarang satu halaman gabungan (tab di dalamnya),
              jadi cukup satu link nav saja. */}
          <Link to="/blog" className="home-nav__link">Blog &amp; Event</Link>
          <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
          {user ? (
            <div className={`home-nav__dropdown-wrapper ${userDropdownOpen ? 'open' : ''}`}>
              <button 
                type="button" 
                className="home-nav__link home-nav__link--dropdown home-nav__user-trigger"
                onClick={toggleUserDropdown}
              >
                <span className="home-nav__avatar">
                  {user.avatar ? (
                    <img src={getImageUrl(user.avatar)} alt={user.name || "Profil"} />
                  ) : user.name ? (
                    user.name.trim().charAt(0).toUpperCase()
                  ) : (
                    <UserIcon size={14} />
                  )}
                </span>
                <span>{user.name ? user.name.split(" ")[0] : "Akun"}</span>
                <ChevronDown size={15} className="home-nav__caret" />
              </button>
              <div className="home-nav__dropdown-menu home-nav__dropdown-menu--simple home-nav__dropdown-menu--user">
                <div className="home-nav__dropdown-header">
                  <span className="home-nav__dropdown-header-avatar">
                    {user.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt={user.name || "Profil"} />
                    ) : user.name ? (
                      user.name.trim().charAt(0).toUpperCase()
                    ) : (
                      <UserIcon size={18} />
                    )}
                  </span>
                  <span className="home-nav__dropdown-header-text">
                    <strong>{user.name || "Pengguna"}</strong>
                    {user.email && <span>{user.email}</span>}
                  </span>
                </div>

                <Link to="/dashboard" className="home-nav__dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                  <LayoutDashboard size={15} />
                  <span>Dasbor</span>
                </Link>
                <Link to="/dashboard?tab=profile" className="home-nav__dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                  <UserIcon size={15} />
                  <span>Profil Saya</span>
                </Link>

                <div className="home-nav__dropdown-divider" />

                <button
                  type="button"
                  className="home-nav__dropdown-item home-nav__dropdown-item--danger"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
          )}
          <Link to="/dashboard" className="home-nav__button">
            <Plus size={15} /><span>Usaha</span>
          </Link>
        </nav>
      </div>

      {/* Tombol WhatsApp bulat mengambang di pojok kanan bawah, muncul di
          semua halaman (Navbar dipakai di semua page). */}
      <a
        href="https://wa.me/628111919711"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat via WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff">
          <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.29.63 4.43 1.72 6.26L4 29l7.94-1.68A11.93 11.93 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.7c-1.98 0-3.83-.55-5.41-1.5l-.39-.23-4.71 1 1.02-4.59-.25-.4A9.66 9.66 0 0 1 6.3 15c0-5.36 4.35-9.7 9.7-9.7 5.36 0 9.7 4.35 9.7 9.7 0 5.36-4.35 9.7-9.7 9.7Zm5.32-7.27c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.19.29-.75.95-.92 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.51h-.56c-.19 0-.51.07-.78.36-.27.29-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3.01.15.19 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.34.19 1.84.11.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z"/>
        </svg>
      </a>
    </header>
  );
}