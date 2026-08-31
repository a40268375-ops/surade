import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Konfirmasi', 
  message = 'Apakah Anda yakin?', 
  type = 'warning', // 'warning', 'danger', 'info'
  confirmText = 'Ya', 
  cancelText = 'Batal',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={48} className="confirm-icon confirm-icon--danger" />;
      case 'info':
        return <CheckCircle size={48} className="confirm-icon confirm-icon--info" />;
      case 'warning':
      default:
        return <AlertTriangle size={48} className="confirm-icon confirm-icon--warning" />;
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="confirm-overlay" onClick={handleCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          {getIcon()}
          <h3 className="confirm-title">{title}</h3>
          <button 
            className="confirm-close"
            onClick={handleCancel}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="confirm-footer">
          <button 
            className="confirm-btn confirm-btn--cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm-btn--${type} ${loading ? 'confirm-btn--loading' : ''}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="confirm-spinner"></div>
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;