import React from 'react';
import { useIntersectionAnimation, useHover, useReducedMotion } from '../hooks/useAnimation';
import './AnimatedCard.css';

/**
 * AnimatedCard Component
 * 
 * Card with entrance animations and hover effects
 */
const AnimatedCard = ({
  children,
  className = '',
  variant = 'default', // default, elevated, outlined, ghost
  hover = 'lift', // lift, scale, glow, none
  entrance = 'slideUp', // slideUp, slideLeft, slideRight, fadeIn, scaleIn
  delay = 0,
  onClick,
  ...props
}) => {
  const { elementRef, shouldAnimate } = useIntersectionAnimation({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const { hoverRef, isHovered } = useHover();
  const prefersReducedMotion = useReducedMotion();

  const cardClasses = [
    'animated-card',
    `animated-card--${variant}`,
    hover && !prefersReducedMotion ? `animated-card--hover-${hover}` : '',
    shouldAnimate && !prefersReducedMotion ? `animated-card--${entrance}` : '',
    isHovered ? 'animated-card--hovered' : '',
    onClick ? 'animated-card--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  const cardStyle = {
    animationDelay: !prefersReducedMotion ? `${delay}ms` : '0ms',
    ...props.style
  };

  return (
    <div
      ref={(node) => {
        elementRef.current = node;
        hoverRef.current = node;
      }}
      className={cardClasses}
      style={cardStyle}
      onClick={onClick}
      {...props}
    >
      <div className="animated-card__content">
        {children}
      </div>
    </div>
  );
};

/**
 * AnimatedCardHeader Component
 */
export const AnimatedCardHeader = ({ children, className = '', ...props }) => (
  <div className={`animated-card__header ${className}`} {...props}>
    {children}
  </div>
);

/**
 * AnimatedCardBody Component  
 */
export const AnimatedCardBody = ({ children, className = '', ...props }) => (
  <div className={`animated-card__body ${className}`} {...props}>
    {children}
  </div>
);

/**
 * AnimatedCardFooter Component
 */
export const AnimatedCardFooter = ({ children, className = '', ...props }) => (
  <div className={`animated-card__footer ${className}`} {...props}>
    {children}
  </div>
);

export default AnimatedCard;