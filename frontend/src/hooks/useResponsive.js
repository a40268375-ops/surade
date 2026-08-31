import { useState, useEffect } from 'react';

/**
 * useResponsive Hook
 * 
 * Provides responsive breakpoint detection and utilities
 * Based on the design system breakpoints defined in Dashboard.css
 */

const breakpoints = {
  xs: 480,
  sm: 640, 
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < breakpoints.md;
  const isTablet = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isDesktop = windowWidth >= breakpoints.lg;
  
  const isXs = windowWidth < breakpoints.xs;
  const isSm = windowWidth >= breakpoints.xs && windowWidth < breakpoints.sm;
  const isMd = windowWidth >= breakpoints.sm && windowWidth < breakpoints.md;
  const isLg = windowWidth >= breakpoints.md && windowWidth < breakpoints.lg;
  const isXl = windowWidth >= breakpoints.lg && windowWidth < breakpoints.xl;
  const is2Xl = windowWidth >= breakpoints.xl;

  const breakpoint = (() => {
    if (isXs) return 'xs';
    if (isSm) return 'sm'; 
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return '2xl';
  })();

  return {
    windowWidth,
    breakpoint,
    isMobile,
    isTablet, 
    isDesktop,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    up: (bp) => windowWidth >= breakpoints[bp],
    down: (bp) => windowWidth < breakpoints[bp],
    between: (min, max) => windowWidth >= breakpoints[min] && windowWidth < breakpoints[max]
  };
};

/**
 * useMediaQuery Hook
 * 
 * Simple media query hook for custom breakpoints
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
};

export default useResponsive;