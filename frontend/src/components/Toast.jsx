import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div 
      className={`toast toast--${notification.type} ${isVisible ? 'toast--visible' : ''} ${isRemoving ? 'toast--removing' : ''}`}
    >
      <div className="toast__icon">
        {getIcon()}
      </div>
      <div className="toast__content">
        <p className="toast__message">{notification.message}</p>
      </div>
      <button 
        className="toast__close"
        onClick={handleRemove}
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export { Toast, ToastContainer };
export default ToastContainer;