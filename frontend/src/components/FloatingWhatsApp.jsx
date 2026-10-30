import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import csAvatar from "../assets/wa-cs-avatar.jpg";
import "./FloatingWhatsApp.css";

const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const popupRef = useRef(null);
  const widgetRef = useRef(null);
  const whatsappNumber = "628111919711"; // +62 811-1919-711
  const message = "Halo, saya ingin bertanya tentang Surade.com";

  // Jangan tampilkan tombol WhatsApp di halaman dashboard/admin
  const hiddenOnPrefixes = ["/dashboard", "/admin"];
  const isHiddenPage = hiddenOnPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        popupRef.current &&
        widgetRef.current &&
        !popupRef.current.contains(event.target) &&
        !widgetRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (isHiddenPage) return null;

  const togglePopup = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setIsOpen(false); // Close popup after opening WhatsApp
  };

  const handleClosePopup = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <div className="floating-whatsapp">
      <div 
        ref={widgetRef}
        className="chat-widget" 
        onClick={togglePopup}
      >
        <div className="avatar-wrapper">
          <div className="avatar-inner">
            <img src={csAvatar} alt="CS Surade" className="avatar-img" />
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div ref={popupRef} className="floating-whatsapp__popup">
          <div className="floating-whatsapp__popup-header">
            <div className="floating-whatsapp__popup-avatar">
              <img src={csAvatar} alt="CS Surade" />
            </div>
            <div className="floating-whatsapp__popup-info">
              <div className="floating-whatsapp__popup-name">Surade.com</div>
              <div className="floating-whatsapp__popup-status">
                <span className="floating-whatsapp__popup-status-dot"></span>
                Online
              </div>
            </div>
            <button 
              className="floating-whatsapp__popup-close" 
              onClick={handleClosePopup}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="floating-whatsapp__popup-body">
            <div className="floating-whatsapp__popup-message">
              <p>Halo! 👋</p>
              <p>Ada yang bisa kami bantu?</p>
            </div>
          </div>
          <button className="floating-whatsapp__popup-cta" onClick={handleWhatsAppClick}>
            Mulai Chat WhatsApp →
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingWhatsApp;