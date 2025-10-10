import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<Record<string, never>>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<Record<string, never>>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  onRetry,
  title = "Oops! Something went wrong",
  message = "We're sorry for the inconvenience. Please try again or contact support if the problem persists."
}) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
    <div className="bg-red-100 rounded-full p-4 mb-4">
      <AlertTriangle className="w-8 h-8 text-red-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600 mb-6 max-w-md">{message}</p>
    <div className="flex gap-4">
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
      >
        <Home className="w-4 h-4" />
        Go Home
      </Link>
    </div>
  </div>
);

export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorFallback
    title="Connection Problem"
    message="Unable to load tours. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const NotFoundError: React.FC = () => (
  <ErrorFallback
    title="Tour Not Found"
    message="The tour you're looking for doesn't exist or has been removed. Let's find you something amazing!"
  />
);