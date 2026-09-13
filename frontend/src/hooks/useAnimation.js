import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAnimation Hook
 * 
 * Provides utilities for managing animations and micro-interactions
 */
export const useAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);

  const startAnimation = useCallback((callback, duration = 300) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (callback) callback();
    
    animationRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, [isAnimating]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    startAnimation,
    stopAnimation
  };
};

/**
 * useStaggeredAnimation Hook
 * 
 * Creates staggered animations for lists
 */
export const useStaggeredAnimation = (items = [], delay = 50) => {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    setVisibleItems([]);
    
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, item]);
      }, index * delay);
    });
  }, [items, delay]);

  return visibleItems;
};

/**
 * useIntersectionAnimation Hook
 * 
 * Triggers animations when elements come into viewport
 */
export const useIntersectionAnimation = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        
        if (inView && !hasAnimated) {
          setHasAnimated(true);
        }
        
        if (!triggerOnce) {
          setHasAnimated(inView);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasAnimated]);

  return {
    elementRef,
    isInView,
    hasAnimated,
    shouldAnimate: isInView || hasAnimated
  };
};

/**
 * useHover Hook
 * 
 * Enhanced hover state management with animations
 */
export const useHover = (onHover, onLeave) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (onHover) onHover();
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (onLeave) onLeave();
  }, [onLeave]);

  useEffect(() => {
    const element = hoverRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return {
    hoverRef,
    isHovered
  };
};

/**
 * useRippleEffect Hook
 * 
 * Creates Material Design-style ripple effects
 */
export const useRippleEffect = () => {
  const [ripples, setRipples] = useState([]);
  const rippleRef = useRef(null);

  const createRipple = useCallback((event) => {
    const element = rippleRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  useEffect(() => {
    const element = rippleRef.current;
    if (!element) return;

    element.addEventListener('mousedown', createRipple);
    return () => element.removeEventListener('mousedown', createRipple);
  }, [createRipple]);

  return {
    rippleRef,
    ripples
  };
};

/**
 * useSpring Hook
 * 
 * Simple spring animation for values
 */
export const useSpring = (targetValue, config = {}) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef();
  
  const {
    tension = 170,
    friction = 26,
    mass = 1
  } = config;

  useEffect(() => {
    if (currentValue === targetValue) return;

    let velocity = 0;
    let position = currentValue;

    const animate = () => {
      const springForce = -tension * (position - targetValue);
      const dampingForce = -friction * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * (1 / 60);
      position += velocity * (1 / 60);

      setCurrentValue(position);

      if (Math.abs(velocity) > 0.01 || Math.abs(position - targetValue) > 0.01) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, tension, friction, mass, currentValue]);

  return currentValue;
};

/**
 * useReducedMotion Hook
 * 
 * Detects user's motion preferences
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

export default useAnimation;