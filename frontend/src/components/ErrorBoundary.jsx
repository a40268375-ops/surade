import React from 'react';
import { ErrorState } from './StateComponents';
import errorHandler from '../utils/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    errorHandler.logError(error, errorInfo.componentStack || 'ErrorBoundary');
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    errorHandler.handleGlobalError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const parsedError = errorHandler.parseApiError(this.state.error);
      
      return (
        <div style={{ 
          minHeight: '50vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px'
        }}>
          <ErrorState
            title="Terjadi Kesalahan pada Aplikasi"
            message={parsedError.userMessage || "Terjadi kesalahan tidak terduga. Silakan muat ulang halaman."}
            retry={() => window.location.reload()}
            retryText="Muat Ulang Halaman"
            type="error"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;