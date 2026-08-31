import React, { useState } from 'react';
import { useReducedMotion } from '../hooks/useAnimation';
import './FloatingActionButton.css';

/**
 * FloatingActionButton Component
 * 
 * Material Design-inspired FAB with smooth animations
 */
const FloatingActionButton = ({
  icon,
  onClick,
  className = '',
  size = 'md', // sm, md, lg
  variant = 'primary', // primary, secondary, success, warning, danger
  position = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
  tooltip = '',
  disabled = false,
  loading = false,
  children, // For extended FAB with text
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const fabClasses = [
    'fab',
    `fab--${size}`,
    `fab--${variant}`,
    `fab--${position}`,
    children ? 'fab--extended' : '',
    disabled ? 'fab--disabled' : '',
    loading ? 'fab--loading' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  const handleMouseEnter = () => {
    if (tooltip && !disabled) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <button
        className={fabClasses}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || loading}
        aria-label={tooltip || 'Floating action button'}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="fab__spinner">
            <svg 
              className="spin" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className={`fab__content ${loading ? 'fab__content--hidden' : ''}`}>
          {icon && <span className="fab__icon">{icon}</span>}
          {children && <span className="fab__text">{children}</span>}
        </div>

        {/* Ripple Effect */}
        {!prefersReducedMotion && (
          <span className="fab__ripple"></span>
        )}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && !loading && (
        <div className={`fab-tooltip fab-tooltip--${position}`}>
          {tooltip}
        </div>
      )}
    </>
  );
};

/**
 * FABGroup Component
 * 
 * Group of FABs with staggered animations
 */
export const FABGroup = ({
  children,
  className = '',
  position = 'bottom-right',
  isOpen = false,
  onToggle,
  mainFab
}) => {
  const groupClasses = [
    'fab-group',
    `fab-group--${position}`,
    isOpen ? 'fab-group--open' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={groupClasses}>
      {/* Child FABs */}
      {isOpen && (
        <div className="fab-group__items">
          {React.Children.map(children, (child, index) => (
            <div 
              className="fab-group__item"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {child}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <div className="fab-group__main" onClick={onToggle}>
        {mainFab}
      </div>
    </div>
  );
};

export default FloatingActionButton;