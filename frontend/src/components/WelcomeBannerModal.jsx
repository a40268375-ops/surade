import { useState, useEffect } from "react";
import { X } from "lucide-react";
import welcomeBanner from "../assets/banner-surade-umkm.jpg";
import "./WelcomeBannerModal.css";

const COOKIE_NAME = "surade_welcome_banner_shown";

function isBannerSeen() {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + COOKIE_NAME + "=([^;]+)"));
    if (match) return true;
  } catch (e) {}
  return false;
}

function markBannerSeen() {
  try {
    // Session cookie without expires/max-age header is shared across all tabs,
    // but automatically cleared when the user closes/exits the browser window.
    document.cookie = `${COOKIE_NAME}=1; path=/; SameSite=Lax`;
    localStorage.removeItem(COOKIE_NAME);
    sessionStorage.removeItem(COOKIE_NAME);
  } catch (e) {}
}

export default function WelcomeBannerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show banner only if not seen in current browser session across any tab
    if (!isBannerSeen()) {
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setOpen(false);
    markBannerSeen();
  };

  const handleBannerClick = (e) => {
    e.preventDefault();
    close();
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    close();

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  };

  if (!open) return null;

  return (
    <div className="welcome-banner-overlay" onClick={close}>
      <div className="welcome-banner-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="welcome-banner-modal__close"
          onClick={close}
          aria-label="Tutup Banner"
        >
          <X size={18} />
        </button>

        <div className="welcome-banner-modal__container" onClick={handleBannerClick}>
          <img
            src={welcomeBanner}
            alt="Surade.com - Surade Maju Bersama UMKM!"
            className="welcome-banner-modal__image"
          />

          {/* Interactive 'Daftar Now' Hotspot Button */}
          <button
            type="button"
            className="welcome-banner-modal__register-btn"
            onClick={handleRegisterClick}
            aria-label="Daftar Now - Ke Halaman Login"
          />
        </div>
      </div>
    </div>
  );
}