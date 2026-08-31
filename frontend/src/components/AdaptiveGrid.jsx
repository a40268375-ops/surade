import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
import './AdaptiveGrid.css';

/**
 * AdaptiveGrid Component
 * 
 * Responsive grid that adapts to different screen sizes
 */
const AdaptiveGrid = ({ 
  children, 
  className = '',
  minItemWidth = '250px',
  gap = '20px',
  cols = {
    xs: 1,
    sm: 1, 
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 5
  }
}) => {
  const { breakpoint } = useResponsive();
  const columns = cols[breakpoint] || cols.md;

  const gridStyle = {
    '--grid-columns': columns,
    '--grid-min-width': minItemWidth,
    '--grid-gap': gap
  };

  return (
    <div 
      className={`adaptive-grid ${className}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

/**
 * AdaptiveGridItem Component
 * 
 * Grid item with responsive behavior
 */
export const AdaptiveGridItem = ({ 
  children, 
  className = '',
  span = 1,
  spanMobile = null
}) => {
  const { isMobile } = useResponsive();
  const actualSpan = isMobile && spanMobile ? spanMobile : span;

  return (
    <div 
      className={`adaptive-grid-item ${className}`}
      style={{ '--item-span': actualSpan }}
    >
      {children}
    </div>
  );
};

export default AdaptiveGrid;