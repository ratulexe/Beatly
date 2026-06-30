import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-beatly-dark text-white p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-gray-400 max-w-md text-center mb-8">
            An unexpected error occurred in this section of the application. We've logged the issue.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-beatly-primary text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
          >
            <RefreshCw className="h-5 w-5" />
            Reload Page
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 bg-black/50 p-4 rounded-lg w-full max-w-3xl overflow-auto text-sm text-red-400 font-mono text-left">
              <p className="font-bold mb-2">{this.state.error.toString()}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
