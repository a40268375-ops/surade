import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useAnimation';
import './AnimatedInput.css';

/**
 * AnimatedInput Component
 * 
 * Enhanced input with smooth animations and micro-interactions
 */
const AnimatedInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const inputRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    if (onChange) onChange(e);
  };

  const containerClasses = [
    'animated-input',
    isFocused ? 'animated-input--focused' : '',
    hasValue ? 'animated-input--has-value' : '',
    error ? 'animated-input--error' : '',
    success ? 'animated-input--success' : '',
    disabled ? 'animated-input--disabled' : '',
    icon ? `animated-input--with-icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Icon */}
      {icon && (
        <div className={`animated-input__icon animated-input__icon--${iconPosition}`}>
          {icon}
        </div>
      )}

      {/* Input Field */}
      <input
        ref={inputRef}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className="animated-input__field"
        placeholder={!label ? placeholder : ''}
        {...props}
      />

      {/* Floating Label */}
      {label && (
        <label className="animated-input__label">
          {label}
          {required && <span className="animated-input__required">*</span>}
        </label>
      )}

      {/* Focus Ring */}
      {!prefersReducedMotion && (
        <div className="animated-input__focus-ring"></div>
      )}

      {/* Error/Success Message */}
      {(error || success) && (
        <div className={`animated-input__message ${error ? 'animated-input__message--error' : 'animated-input__message--success'}`}>
          {error || success}
        </div>
      )}
    </div>
  );
};

/**
 * AnimatedTextarea Component
 */
export const AnimatedTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  success,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  const textareaRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setHasValue(Boolean(value));
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    if (onChange) onChange(e);
  };

  const containerClasses = [
    'animated-input animated-input--textarea',
    isFocused ? 'animated-input--focused' : '',
    hasValue ? 'animated-input--has-value' : '',
    error ? 'animated-input--error' : '',
    success ? 'animated-input--success' : '',
    disabled ? 'animated-input--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Textarea Field */}
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        className="animated-input__field"
        placeholder={!label ? placeholder : ''}
        {...props}
      />

      {/* Floating Label */}
      {label && (
        <label className="animated-input__label">
          {label}
          {required && <span className="animated-input__required">*</span>}
        </label>
      )}

      {/* Focus Ring */}
      {!prefersReducedMotion && (
        <div className="animated-input__focus-ring"></div>
      )}

      {/* Error/Success Message */}
      {(error || success) && (
        <div className={`animated-input__message ${error ? 'animated-input__message--error' : 'animated-input__message--success'}`}>
          {error || success}
        </div>
      )}
    </div>
  );
};

export default AnimatedInput;