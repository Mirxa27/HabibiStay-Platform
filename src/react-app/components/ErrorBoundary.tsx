import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router';
import { responsiveClasses, containers, utils, cn } from '../utils/responsive';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className={containers.narrow}>
            <div className={cn(
              responsiveClasses.card.base,
              responsiveClasses.card.padding,
              'text-center'
            )}>
              <div className="mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className={cn(
                  responsiveClasses.text.h2,
                  'text-gray-900 mb-2'
                )}>
                  Oops! Something went wrong
                </h1>
                <p className={cn(
                  responsiveClasses.text.body,
                  'text-gray-600 mb-6'
                )}>
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-x-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              <div className={cn(
                responsiveClasses.button.group,
                'justify-center'
              )}>
                <button
                  onClick={this.handleRetry}
                  className={cn(
                    utils.touchButton,
                    utils.focusVisible,
                    'bg-[#2957c3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center'
                  )}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                <Link
                  to="/"
                  className={cn(
                    utils.touchButton,
                    utils.focusVisible,
                    'border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center'
                  )}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
    
    // In a real application, you would send this to a monitoring service
    // Example: Sentry.captureException(error, { tags: { context } });
  };

  return { handleError };
}