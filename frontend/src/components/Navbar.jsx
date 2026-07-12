import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";
import { INFO_MENU } from "../data/infoMenu";
import "./Navbar.css";

export { INFO_MENU };

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="home-header">
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
            <Link to="/dashboard" className="home-nav__link home-nav__link--login">Dashboard</Link>
          ) : (
            <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
          )}
          <Link to="/dashboard" className="home-nav__button">
            <Plus size={15} /><span>Add Bisnis</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}