import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/api";
import logoImg from "../assets/logo.png";
import { INFO_MENU } from "../data/infoMenu";
import NavbarWindLeaves from "./NavbarWindLeaves";
import "./Navbar.css";

export { INFO_MENU };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  // PERMINTAAN: animasinya jangan cuma nyala pas lagi discroll doang terus
  // berhenti - tapi TERUS jalan selama posisinya bukan di paling atas.
  // Baru dimatikan begitu balik ke posisi paling atas (y <= 40). Jadi
  // "leavesActive" sekarang murni ngikutin posisi scroll (scrolled atau
  // tidak), bukan ngikutin "lagi gerak scroll" atau tidak.
  const [leavesActive, setLeavesActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setLeavesActive(y > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className={`home-header ${scrolled ? "home-header--scrolled" : ""}`}>
      {/* Efek angin + daun berguguran - dikunci di dalam batas navbar saja
          (bukan menutupi seluruh halaman), aktif cuma pas scroll ke bawah. */}
      <NavbarWindLeaves active={leavesActive} />
      <div className="home-header__inner">
        <Link to="/" className="home-logo">
          <img src={logoImg} alt="Surade.co.id" className="home-logo__img" />
        </Link>
        <nav className="home-nav">
          <Link to="/" className="home-nav__link">Home</Link>

          <div className="home-nav__dropdown-wrapper">
            <button type="button" className="home-nav__link home-nav__link--dropdown">
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </button>
            <div className="home-nav__dropdown-menu home-nav__dropdown-menu--simple">
              {INFO_MENU.map((item) => (
                <div key={item.slug} className="home-nav__submenu-wrapper">
                  <Link
                    to={`/category/${item.slug}`}
                    className="home-nav__dropdown-item"
                  >
                    <span>{item.label}</span>
                    {item.children?.length > 0 && (
                      <ChevronRight size={14} className="home-nav__dropdown-chevron" />
                    )}
                  </Link>

                  {item.children?.length > 0 && (
                    <div className="home-nav__submenu-flyout">
                      {item.children.map((child) => (
                        <Link
                          key={child.slug}
                          to={`/category/${child.slug}`}
                          className="home-nav__sub-item"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Link to="/blog" className="home-nav__link">Blog</Link>
          <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
          {user ? (
            <div className="home-nav__dropdown-wrapper">
              <button type="button" className="home-nav__link home-nav__link--dropdown home-nav__user-trigger">
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

                <Link to="/dashboard" className="home-nav__dropdown-item">
                  <LayoutDashboard size={15} />
                  <span>Dasbor</span>
                </Link>
                <Link to="/dashboard?tab=profile" className="home-nav__dropdown-item">
                  <UserIcon size={15} />
                  <span>Profil Saya</span>
                </Link>

                <div className="home-nav__dropdown-divider" />

                <button
                  type="button"
                  className="home-nav__dropdown-item home-nav__dropdown-item--danger"
                  onClick={handleLogout}
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
    </header>
  );
}