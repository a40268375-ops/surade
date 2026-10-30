import React from 'react';
import { RefreshCw, AlertTriangle, Search, Package, Users, FileText, MessageCircle, Calendar, Building2, User, Zap } from 'lucide-react';
import SuradeLoader from './SuradeLoader';
import ArcDotsLoader from './ArcDotsLoader';
import './StateComponents.css';

export { default as ArcDotsLoader } from './ArcDotsLoader';

// Enhanced Loading Component powered by SuradeLoader & ArcDotsLoader
export const LoadingSpinner = ({
  size = 'md',
  text = '',
  inline = false,
  overlay = false,
  subtext = '',
  variant,
  preset = 'emerald',
  ...props
}) => {
  if (variant === 'arc' || props.arc) {
    if (overlay) {
      return (
        <SuradeLoader
          variant="screen"
          text={text || 'Memuat data...'}
          subtext={subtext}
          {...props}
        />
      );
    }

    return (
      <SuradeLoader
        variant={inline ? 'inline' : 'section'}
        size={size || (inline ? 'sm' : 'md')}
        text={text || 'Memuat data...'}
        subtext={subtext}
        {...props}
      />
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content p-6">
          <SuradeLoader
            variant="section"
            size={size}
            text={text || "Memuat..."}
            subtext={subtext}
            minHeight="180px"
          />
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <SuradeLoader
        variant="inline"
        size={size === 'lg' || size === 'xl' ? 'md' : 'sm'}
        text={text}
      />
    );
  }

  return (
    <div className="loading-container w-full">
      <SuradeLoader
        variant="section"
        size={size}
        text={text || "Memuat data..."}
        subtext={subtext}
        minHeight="180px"
      />
    </div>
  );
};

// Enhanced Error Component
export const ErrorState = ({ 
  title = 'Terjadi Kesalahan',
  message = 'Gagal memuat data. Silakan coba lagi.',
  icon = AlertTriangle,
  retry = null,
  retryText = 'Coba Lagi',
  type = 'error' // 'error', 'network', 'unauthorized', 'not-found'
}) => {
  const Icon = icon;
  
  const getTypeStyles = () => {
    switch (type) {
      case 'network':
        return { icon: 'error-icon--network', bg: 'error-state--network' };
      case 'unauthorized':
        return { icon: 'error-icon--warning', bg: 'error-state--warning' };
      case 'not-found':
        return { icon: 'error-icon--info', bg: 'error-state--info' };
      default:
        return { icon: 'error-icon--error', bg: 'error-state--error' };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`error-state ${styles.bg}`}>
      <div className="error-content">
        <div className={`error-icon ${styles.icon}`}>
          <Icon size={48} />
        </div>
        <h3 className="error-title">{title}</h3>
        <p className="error-message">{message}</p>
        {retry && (
          <button 
            onClick={retry} 
            className="error-retry-btn"
          >
            <RefreshCw size={18} />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

// Enhanced Empty State Component
export const EmptyState = ({ 
  title = 'Tidak Ada Data',
  message = 'Belum ada data untuk ditampilkan.',
  icon = Package,
  action = null,
  actionText = 'Tambah Data',
  type = 'default' // 'default', 'search', 'users', 'businesses', etc.
}) => {
  const Icon = icon;

  const getEmptyStateConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: 'Hasil Pencarian Kosong',
          message: 'Tidak ada hasil yang cocok dengan pencarian Anda. Coba gunakan kata kunci yang berbeda.',
          className: 'empty-state--search'
        };
      case 'users':
        return {
          icon: Users,
          title: 'Belum Ada Pengguna',
          message: 'Belum ada pengguna yang terdaftar. Tambahkan pengguna pertama untuk memulai.',
          className: 'empty-state--users'
        };
      case 'businesses':
        return {
          icon: Building2,
          title: 'Belum Ada Bisnis',
          message: 'Belum ada bisnis yang terdaftar. Daftarkan bisnis pertama untuk memulai.',
          className: 'empty-state--businesses'
        };
      case 'products':
        return {
          icon: Package,
          title: 'Belum Ada Produk',
          message: 'Belum ada produk yang ditambahkan. Tambahkan produk pertama untuk memulai.',
          className: 'empty-state--products'
        };
      case 'messages':
        return {
          icon: MessageCircle,
          title: 'Belum Ada Pesan',
          message: 'Kotak masuk Anda masih kosong. Pesan baru akan muncul di sini.',
          className: 'empty-state--messages'
        };
      case 'events':
        return {
          icon: Calendar,
          title: 'Belum Ada Event',
          message: 'Belum ada event yang dijadwalkan. Buat event pertama untuk memulai.',
          className: 'empty-state--events'
        };
      case 'blog':
        return {
          icon: FileText,
          title: 'Belum Ada Artikel',
          message: 'Belum ada artikel blog yang dipublikasikan. Tulis artikel pertama untuk memulai.',
          className: 'empty-state--blog'
        };
      default:
        return {
          icon: Icon,
          title,
          message,
          className: 'empty-state--default'
        };
    }
  };

  const config = getEmptyStateConfig();
  const EmptyIcon = config.icon;

  return (
    <div className={`empty-state ${config.className}`}>
      <div className="empty-content">
        <div className="empty-icon">
          <EmptyIcon size={64} />
        </div>
        <h3 className="empty-title">{config.title}</h3>
        <p className="empty-message">{config.message}</p>
        {action && (
          <button 
            onClick={action} 
            className="empty-action-btn"
          >
            <Zap size={18} />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

// Form Field Error Component
export const FieldError = ({ message, show = true }) => {
  if (!show || !message) return null;
  
  return (
    <div className="field-error">
      <AlertTriangle size={14} />
      <span>{message}</span>
    </div>
  );
};

// Inline Alert Component
export const InlineAlert = ({ 
  type = 'info', 
  title = '',
  message = '',
  dismissible = false,
  onDismiss = null,
  icon = null
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', className: 'inline-alert--success' };
      case 'warning':
        return { icon: '⚠️', className: 'inline-alert--warning' };
      case 'error':
        return { icon: '❌', className: 'inline-alert--error' };
      case 'info':
      default:
        return { icon: 'ℹ️', className: 'inline-alert--info' };
    }
  };

  const config = getAlertConfig();

  return (
    <div className={`inline-alert ${config.className}`}>
      <div className="inline-alert-icon">
        {icon || config.icon}
      </div>
      <div className="inline-alert-content">
        {title && <div className="inline-alert-title">{title}</div>}
        <div className="inline-alert-message">{message}</div>
      </div>
      {dismissible && (
        <button 
          className="inline-alert-dismiss"
          onClick={onDismiss}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Skeleton Loading Components
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-header">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-text skeleton-text--title"></div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-text skeleton-text--line"></div>
      <div className="skeleton-text skeleton-text--line skeleton-text--short"></div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton-text skeleton-text--header"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="skeleton-text skeleton-text--cell"></div>
        ))}
      </div>
    ))}
  </div>
);

// Progress Indicator
export const ProgressBar = ({ value = 0, max = 100, label = '', color = 'primary' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-fill--${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="progress-text">{Math.round(percentage)}%</div>
    </div>
  );
};

// Retry Button Component
export const RetryButton = ({ onRetry, loading = false, text = 'Coba Lagi' }) => (
  <button 
    className={`retry-button ${loading ? 'retry-button--loading' : ''}`}
    onClick={onRetry}
    disabled={loading}
  >
    <RefreshCw size={16} className={loading ? 'retry-icon--spinning' : ''} />
    {loading ? 'Mencoba...' : text}
  </button>
);