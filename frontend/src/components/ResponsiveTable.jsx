import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ResponsiveTable Component
 * 
 * Provides responsive table functionality with:
 * - Horizontal scrolling on mobile
 * - Column hiding on small screens
 * - Touch-friendly navigation
 * - Pagination for large datasets
 */
const ResponsiveTable = ({ 
  children, 
  className = '',
  minWidth = '600px',
  showPagination = false,
  itemsPerPage = 10,
  totalItems = 0
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    setScrollPosition(scrollLeft);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollTable = (direction) => {
    const container = document.querySelector('.responsive-table-container');
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newScrollLeft = direction === 'left' 
      ? Math.max(0, container.scrollLeft - scrollAmount)
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="responsive-table-wrapper">
      {isMobile && (canScrollLeft || canScrollRight) && (
        <div className="table-scroll-controls">
          <button 
            className={`table-scroll-btn ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scrollTable('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll table left"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="table-scroll-indicator">
            Geser untuk melihat lebih banyak
          </span>
          <button 
            className={`table-scroll-btn ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scrollTable('right')}
            disabled={!canScrollRight}
            aria-label="Scroll table right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      
      <div 
        className={`responsive-table-container ${className}`}
        onScroll={handleScroll}
        style={{ minWidth }}
      >
        {children}
      </div>
      
      {showPagination && (
        <div className="table-pagination">
          <span className="table-pagination-info">
            Showing {Math.min(itemsPerPage, totalItems)} of {totalItems} items
          </span>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;