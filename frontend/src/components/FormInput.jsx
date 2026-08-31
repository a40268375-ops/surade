import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const FormInput = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  help,
  required = false,
  disabled = false,
  className = '',
  rows,
  options, // for select
  ...props
}) => {
  const fieldClassName = `db-form-field ${error ? 'error' : success ? 'success' : ''} ${className}`;
  
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 4}
          {...props}
        />
      );
    }
    
    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    );
  };

  return (
    <div className={fieldClassName}>
      {label && (
        <label>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {error && (
        <div className="db-form-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="db-form-success">
          <CheckCircle size={14} />
          {success}
        </div>
      )}
      
      {help && !error && (
        <div className="db-form-help">
          {help}
        </div>
      )}
    </div>
  );
};

export default FormInput;