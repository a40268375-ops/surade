import React from 'react';
import { X } from 'lucide-react';
import './MobileMenu.css';

/**
 * MobileMenu Component
 * 
 * Enhanced mobile navigation menu with better UX
 */
const MobileMenu = ({ 
  isOpen, 
  onClose, 
  children,
  title = "Menu"
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`mobile-menu-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h3 className="mobile-menu-title">{title}</h3>
          <button 
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mobile-menu-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;