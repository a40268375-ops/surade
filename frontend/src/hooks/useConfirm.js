import { useState, useCallback } from 'react';

/**
 * useConfirm Hook
 * 
 * Provides a better alternative to confirm() with customizable dialog
 */
export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Ya',
    cancelText: 'Batal',
    loading: false,
    resolver: null
  });

  const confirm = useCallback((options = {}) => {
    const {
      title = 'Konfirmasi',
      message = 'Apakah Anda yakin?',
      type = 'warning',
      confirmText = 'Ya',
      cancelText = 'Batal'
    } = options;

    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        loading: false,
        resolver: resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, loading: true }));
    
    setTimeout(() => {
      if (confirmState.resolver) {
        confirmState.resolver(true);
      }
      setConfirmState({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Ya',
        cancelText: 'Batal',
        loading: false,
        resolver: null
      });
    }, 300); // Small delay for better UX
  }, [confirmState.resolver]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolver) {
      confirmState.resolver(false);
    }
    setConfirmState({
      isOpen: false,
      title: '',
      message: '',
      type: 'warning',
      confirmText: 'Ya',
      cancelText: 'Batal',
      loading: false,
      resolver: null
    });
  }, [confirmState.resolver]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel
  };
};

export default useConfirm;