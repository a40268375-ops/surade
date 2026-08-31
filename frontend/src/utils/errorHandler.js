/**
 * Error Handler Utility
 * 
 * Centralized error handling and user-friendly error messages
 */

// Error types enum
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Parse and categorize API errors
 */
export const parseApiError = (error) => {
  // Default error structure
  const parsedError = {
    type: ErrorTypes.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: 'Terjadi kesalahan yang tidak diketahui',
    originalMessage: '',
    statusCode: null,
    details: null,
    retryable: false,
    userMessage: ''
  };

  // Handle network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        ...parsedError,
        type: ErrorTypes.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Tidak dapat terhubung ke server',
        userMessage: 'Periksa koneksi internet Anda dan coba lagi',
        retryable: true
      };
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        ...parsedError,
        type: ErrorTypes.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Koneksi timeout',
        userMessage: 'Server membutuhkan waktu terlalu lama untuk merespons',
        retryable: true
      };
    }
  }

  // Handle HTTP response errors
  if (error.response) {
    const { status, data } = error.response;
    parsedError.statusCode = status;
    parsedError.originalMessage = data?.message || error.message || '';
    parsedError.details = data?.errors || data?.details || null;

    switch (status) {
      case 400:
        return {
          ...parsedError,
          type: ErrorTypes.VALIDATION,
          severity: ErrorSeverity.LOW,
          message: data?.message || 'Data yang dikirim tidak valid',
          userMessage: 'Periksa kembali data yang Anda masukkan',
          retryable: false
        };

      case 401:
        return {
          ...parsedError,
          type: ErrorTypes.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: 'Sesi telah berakhir',
          userMessage: 'Silakan login kembali untuk melanjutkan',
          retryable: false
        };

      case 403:
        return {
          ...parsedError,
          type: ErrorTypes.AUTHORIZATION,
          severity: ErrorSeverity.MEDIUM,
          message: 'Akses ditolak',
          userMessage: 'Anda tidak memiliki izin untuk melakukan tindakan ini',
          retryable: false
        };

      case 404:
        return {
          ...parsedError,
          type: ErrorTypes.NOT_FOUND,
          severity: ErrorSeverity.LOW,
          message: 'Data tidak ditemukan',
          userMessage: 'Data yang Anda cari tidak ditemukan atau telah dihapus',
          retryable: false
        };

      case 422:
        return {
          ...parsedError,
          type: ErrorTypes.VALIDATION,
          severity: ErrorSeverity.LOW,
          message: data?.message || 'Data tidak dapat diproses',
          userMessage: 'Periksa kembali data yang Anda masukkan',
          details: data?.errors,
          retryable: false
        };

      case 429:
        return {
          ...parsedError,
          type: ErrorTypes.CLIENT,
          severity: ErrorSeverity.MEDIUM,
          message: 'Terlalu banyak permintaan',
          userMessage: 'Tunggu beberapa saat sebelum mencoba lagi',
          retryable: true
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          ...parsedError,
          type: ErrorTypes.SERVER,
          severity: ErrorSeverity.HIGH,
          message: 'Server sedang mengalami gangguan',
          userMessage: 'Terjadi kesalahan pada server, silakan coba lagi nanti',
          retryable: true
        };

      default:
        return {
          ...parsedError,
          type: status >= 500 ? ErrorTypes.SERVER : ErrorTypes.CLIENT,
          severity: status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
          message: data?.message || `Error ${status}`,
          userMessage: 'Terjadi kesalahan, silakan coba lagi',
          retryable: status >= 500
        };
    }
  }

  // Handle JavaScript errors
  if (error instanceof TypeError) {
    return {
      ...parsedError,
      type: ErrorTypes.CLIENT,
      severity: ErrorSeverity.MEDIUM,
      message: 'Kesalahan aplikasi',
      userMessage: 'Terjadi kesalahan pada aplikasi, silakan refresh halaman',
      retryable: false
    };
  }

  return parsedError;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = 'Terjadi kesalahan') => {
  const parsedError = parseApiError(error);
  return parsedError.userMessage || parsedError.message || fallbackMessage;
};

/**
 * Get error title based on type
 */
export const getErrorTitle = (errorType) => {
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return 'Masalah Koneksi';
    case ErrorTypes.AUTHENTICATION:
      return 'Sesi Berakhir';
    case ErrorTypes.AUTHORIZATION:
      return 'Akses Ditolak';
    case ErrorTypes.NOT_FOUND:
      return 'Data Tidak Ditemukan';
    case ErrorTypes.VALIDATION:
      return 'Data Tidak Valid';
    case ErrorTypes.SERVER:
      return 'Server Error';
    case ErrorTypes.TIMEOUT:
      return 'Koneksi Timeout';
    default:
      return 'Terjadi Kesalahan';
  }
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const parsedError = parseApiError(error);
  return parsedError.retryable;
};

/**
 * Get error icon based on type
 */
export const getErrorIcon = (errorType) => {
  switch (errorType) {
    case ErrorTypes.NETWORK:
    case ErrorTypes.TIMEOUT:
      return '🌐';
    case ErrorTypes.AUTHENTICATION:
      return '🔐';
    case ErrorTypes.AUTHORIZATION:
      return '🚫';
    case ErrorTypes.NOT_FOUND:
      return '🔍';
    case ErrorTypes.VALIDATION:
      return '⚠️';
    case ErrorTypes.SERVER:
      return '🛠️';
    default:
      return '❌';
  }
};

/**
 * Format validation errors for form display
 */
export const formatValidationErrors = (error) => {
  const parsedError = parseApiError(error);
  
  if (parsedError.type === ErrorTypes.VALIDATION && parsedError.details) {
    // Laravel validation errors format: { field: ["error1", "error2"] }
    const formattedErrors = {};
    
    Object.keys(parsedError.details).forEach(field => {
      const fieldErrors = parsedError.details[field];
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        formattedErrors[field] = fieldErrors[0]; // Take first error message
      }
    });
    
    return formattedErrors;
  }
  
  return {};
};

/**
 * Log error for debugging (in development mode)
 */
export const logError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    const parsedError = parseApiError(error);
    
    console.group(`🔥 Error ${context ? `in ${context}` : ''}`);
    console.error('Original Error:', error);
    console.log('Parsed Error:', parsedError);
    console.log('Stack Trace:', error.stack);
    console.groupEnd();
  }
};

/**
 * Error boundary helper
 */
export const handleGlobalError = (error, errorInfo = {}) => {
  logError(error, errorInfo.componentStack ? 'React Component' : 'Global');
  
  // Here you could send errors to external logging service
  // Example: Sentry, LogRocket, etc.
  
  return parseApiError(error);
};

/**
 * Create error response for consistent error handling
 */
export const createErrorResponse = (message, type = ErrorTypes.UNKNOWN, details = null) => {
  return {
    error: true,
    message,
    type,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Retry delay calculator with exponential backoff
 */
export const calculateRetryDelay = (retryCount, baseDelay = 1000, maxDelay = 10000) => {
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
};

export default {
  parseApiError,
  getErrorMessage,
  getErrorTitle,
  getErrorIcon,
  isRetryableError,
  formatValidationErrors,
  logError,
  handleGlobalError,
  createErrorResponse,
  calculateRetryDelay,
  ErrorTypes,
  ErrorSeverity
};