import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary for Booking Flow
 * Catches errors in the booking process and provides recovery options
 */
export class BookingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Booking Error Boundary caught error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service if available
    const errorReporter = (window as unknown as { errorReporter?: { logError: (err: Error, context: Record<string, unknown>) => void } }).errorReporter;
    if (errorReporter) {
      errorReporter.logError(error, {
        context: 'BookingFlow',
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Reload the page to reset state
    window.location.href = '/routes';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Error
            </h2>
            
            <p className="text-gray-600 mb-6">
              We encountered an issue while processing your booking. Your information has been saved.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm text-gray-700 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              
              <a
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home size={20} />
                Go Home
              </a>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Need help? Contact support at{' '}
              <a href="mailto:support@discovergroup.com" className="text-blue-600 underline">
                support@discovergroup.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BookingErrorBoundary;
