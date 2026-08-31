import React from 'react';
import { useRippleEffect, useReducedMotion } from '../hooks/useAnimation';
import './AnimatedButton.css';

/**
 * AnimatedButton Component
 * 
 * Enhanced button with smooth animations and micro-interactions
 */
const AnimatedButton = ({
  children,
  className = '',
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left', // left, right, only
  ripple = true,
  hover = 'lift', // lift, scale, glow, none
  onClick,
  ...props
}) => {
  const { rippleRef, ripples } = useRippleEffect();
  const prefersReducedMotion = useReducedMotion();

  const buttonClasses = [
    'animated-btn',
    `animated-btn--${variant}`,
    `animated-btn--${size}`,
    hover && !prefersReducedMotion ? `animated-btn--hover-${hover}` : '',
    disabled ? 'animated-btn--disabled' : '',
    loading ? 'animated-btn--loading' : '',
    iconPosition === 'only' ? 'animated-btn--icon-only' : '',
    ripple && !prefersReducedMotion ? 'animated-btn--ripple' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={ripple ? rippleRef : null}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effects */}
      {ripple && !prefersReducedMotion && (
        <span className="animated-btn__ripples">
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              className="animated-btn__ripple"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size
              }}
            />
          ))}
        </span>
      )}

      {/* Loading Spinner */}
      {loading && (
        <span className="animated-btn__spinner">
          <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </svg>
        </span>
      )}

      {/* Content Container */}
      <span className={`animated-btn__content ${loading ? 'animated-btn__content--hidden' : ''}`}>
        {/* Icon Left */}
        {icon && (iconPosition === 'left' || iconPosition === 'only') && (
          <span className="animated-btn__icon animated-btn__icon--left">
            {icon}
          </span>
        )}

        {/* Text */}
        {iconPosition !== 'only' && (
          <span className="animated-btn__text">
            {children}
          </span>
        )}

        {/* Icon Right */}
        {icon && iconPosition === 'right' && (
          <span className="animated-btn__icon animated-btn__icon--right">
            {icon}
          </span>
        )}
      </span>
    </button>
  );
};

export default AnimatedButton;