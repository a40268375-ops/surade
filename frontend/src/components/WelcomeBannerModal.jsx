import { useState, useEffect } from "react";
import { X } from "lucide-react";
import welcomeBanner from "../assets/welcome-banner.jpg";
import "./WelcomeBannerModal.css";

const SESSION_KEY = "surade_welcome_banner_shown";

export default function WelcomeBannerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyShown) {
      // Small delay so it doesn't flash before the page has painted
      const timer = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {}
  };

  if (!open) return null;

  return (
    <div className="welcome-banner-overlay" onClick={close}>
      <div className="welcome-banner-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="welcome-banner-modal__close"
          onClick={close}
          aria-label="Tutup"
        >
          <X size={20} />
        </button>
        <a href="/add-business" className="welcome-banner-modal__image-btn" onClick={close}>
          <img src={welcomeBanner} alt="Surade.co.id - Temukan Bisnis, Produk, Jasa & Informasi di Surade" className="welcome-banner-modal__image" />
        </a>
      </div>
    </div>
  );
}