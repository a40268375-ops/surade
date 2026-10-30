import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import "./ScrollToTopButton.css";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Hide on login, register, admin, user dashboard, and management pages
  const isHiddenRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/premium") ||
    location.pathname.startsWith("/add-") ||
    location.pathname.startsWith("/order-website");

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility(); // Check initial

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isHiddenRoute || !isVisible) return null;

  return (
    <div className="global-scroll-to-top-wrapper">
      <button
        type="button"
        onClick={scrollToTop}
        className="global-scroll-to-top"
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={20} strokeWidth={2.8} className="scroll-arrow-icon" />
        <span className="scroll-tooltip">Ke Atas</span>
      </button>
    </div>
  );
}

