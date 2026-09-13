import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Form state and validation methods
 */
export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules
  const validators = {
    required: (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return 'Field ini wajib diisi';
      }
      return null;
    },
    email: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return 'Format email tidak valid';
      }
      return null;
    },
    minLength: (min) => (value) => {
      if (value && value.length < min) {
        return `Minimal ${min} karakter`;
      }
      return null;
    },
    maxLength: (max) => (value) => {
      if (value && value.length > max) {
        return `Maksimal ${max} karakter`;
      }
      return null;
    },
    url: (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return 'Format URL tidak valid';
      }
    },
    phone: (value) => {
      if (!value) return null;
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
      if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
        return 'Format nomor telepon tidak valid';
      }
      return null;
    }
  };

  // Validate single field
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    for (const rule of rules) {
      if (typeof rule === 'string' && validators[rule]) {
        const error = validators[rule](value);
        if (error) return error;
      } else if (typeof rule === 'function') {
        const error = rule(value);
        if (error) return error;
      } else if (typeof rule === 'object' && rule.validator && rule.params) {
        const error = validators[rule.validator](...rule.params)(value);
        if (error) return error;
      }
    }
    return null;
  }, [validationRules]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField, validationRules]);

  // Handle input change
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [errors]);

  // Handle input blur
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field on blur
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [validateField, values]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set form values
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).every(key => !errors[key]);

  // Get field props for easy integration with inputs
  const getFieldProps = useCallback((fieldName) => ({
    value: values[fieldName] || '',
    onChange: (e) => handleChange(fieldName, e.target.value),
    onBlur: () => handleBlur(fieldName),
    error: touched[fieldName] && errors[fieldName],
    className: touched[fieldName] && errors[fieldName] ? 'error' : 
               touched[fieldName] && !errors[fieldName] ? 'success' : ''
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setFormValues,
    getFieldProps
  };
};

export default useFormValidation;