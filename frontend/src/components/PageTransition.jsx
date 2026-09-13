import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useAnimation';
import './PageTransition.css';

/**
 * PageTransition Component
 * 
 * Smooth page transitions with fade/slide effects
 */
const PageTransition = ({ 
  children, 
  className = '',
  type = 'fade', // fade, slideLeft, slideRight, slideUp, slideDown
  duration = 300,
  isVisible = true,
  onTransitionComplete
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setShouldRender(isVisible);
      if (onTransitionComplete) {
        onTransitionComplete(isVisible);
      }
      return;
    }

    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure element is rendered before animation
      setTimeout(() => {
        setAnimationClass(`page-transition--${type}-in`);
      }, 10);
    } else {
      setAnimationClass(`page-transition--${type}-out`);
      // Hide element after animation completes
      setTimeout(() => {
        setShouldRender(false);
        if (onTransitionComplete) {
          onTransitionComplete(false);
        }
      }, duration);
    }
  }, [isVisible, type, duration, prefersReducedMotion, onTransitionComplete]);

  if (!shouldRender) {
    return null;
  }

  const transitionClasses = [
    'page-transition',
    animationClass,
    className
  ].filter(Boolean).join(' ');

  const transitionStyle = {
    animationDuration: `${duration}ms`
  };

  return (
    <div 
      className={transitionClasses}
      style={transitionStyle}
    >
      {children}
    </div>
  );
};

/**
 * TabTransition Component
 * 
 * Specialized transition for tab content
 */
export const TabTransition = ({ 
  activeTab, 
  tabKey, 
  children, 
  className = '' 
}) => {
  const isVisible = activeTab === tabKey;
  
  return (
    <PageTransition
      isVisible={isVisible}
      type="fade"
      className={`tab-transition ${className}`}
    >
      {children}
    </PageTransition>
  );
};

export default PageTransition;