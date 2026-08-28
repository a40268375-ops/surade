import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-cols">
          {/* Brand/Logo Col */}
          <div className="footer-col footer-col--brand">
            <Link to="/" className="footer-logo">
              <img src={logoImg} alt="Info.co.id" className="footer-logo__img" />
            </Link>
            <p className="footer-desc">
              info.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
            </p>
            <div className="footer-social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://wa.me/628111919711" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social__link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1 - Tentang Kami */}
          <div className="footer-col">
            <h4 className="footer-heading">Tentang Kami</h4>
            <ul className="footer-links">
              <li><Link to="/about">Tentang Info.co.id</Link></li>
              <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
              <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
            </ul>
          </div>

          {/* Col 2 - Bantuan */}
          <div className="footer-col">
            <h4 className="footer-heading">Bantuan</h4>
            <ul className="footer-links">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
              <li><Link to="/contact">Hubungi Kami</Link></li>
            </ul>
          </div>

          {/* Col 3 - Kontak Kami */}
          <div className="footer-col">
            <h4 className="footer-heading">Kontak Kami</h4>
            <ul className="footer-links">
              <li>
                <a href="tel:08071001500" className="footer-link">
                  <strong>Call Center:</strong> 0807 - 100 - 1500
                </a>
              </li>
              <li>
                <a href="https://wa.me/628111919711" target="_blank" rel="noopener noreferrer" className="footer-link">
                  <strong>WhatsApp:</strong> +62 811-1919-711
                </a>
              </li>
              <li>
                <a href="mailto:support@info.co.id" className="footer-link">
                  <strong>Email:</strong> support@info.co.id
                </a>
              </li>
              <li>
                <span className="footer-text leading-relaxed block">
                  Jl. Saturnus No.13 Blk. F, RT.2/RW.5, Ciherang, Kec. Dramaga, Kabupaten Bogor, Jawa Barat 16680
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner">
          <p className="footer-copyright">
            &copy; 2026 Info.co.id. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms#privasi">Privasi</Link>
            <Link to="/terms">Syarat &amp; Ketentuan</Link>
            <Link to="/faq">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
