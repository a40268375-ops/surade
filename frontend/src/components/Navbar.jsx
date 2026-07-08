import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import logoImg from "../assets/logo.png";
import { INFO_MENU } from "../data/infoMenu";
import "./Navbar.css";

export { INFO_MENU };

export default function Navbar() {
  const [activeCategory, setActiveCategory] = useState(INFO_MENU[0].slug);

  const activeItem = INFO_MENU.find((item) => item.slug === activeCategory) ?? INFO_MENU[0];

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
          <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
          <button type="button" className="home-nav__button">
            <Plus size={15} /><span>Add Bisnis</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
