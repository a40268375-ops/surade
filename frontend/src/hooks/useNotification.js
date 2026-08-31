import { useState, useCallback, useRef } from 'react';

/**
 * useNotification Hook
 * 
 * Provides a better alternative to alert() with toast-style notifications
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const nextId = useRef(0);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = ++nextId.current;
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const removeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);
    
  const error = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);
    
  const warning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);
    
  const info = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    success,
    error,
    warning,
    info
  };
};

export default useNotification;