import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';
import { sentry } from '@/lib/sentry';

/**
 * Serializes an error object into a readable string format.
 * Handles both Error instances and generic unknown errors.
 *
 * @param error - The error to serialize
 * @returns {string} Formatted error string with message and stack trace if available
 */
const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

/**
 * React Error Boundary component that catches JavaScript errors anywhere in the component tree.
 * Logs errors and displays a user-friendly error message with recovery options.
 * Integrates with logging and error reporting services.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | unknown }
> {
  /**
   * Creates an instance of ErrorBoundary.
   * @param props - Component props containing children to render
   */
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Static method called when an error is thrown by a descendant component.
   * Updates state to trigger error UI rendering.
   *
   * @param error - The error that was thrown
   * @returns {Object} Updated state object
   */
  static getDerivedStateFromError(error: Error | unknown) {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component.
   * Logs the error and sends it to error reporting service.
   *
   * @param error - The error that was thrown
   * @param errorInfo - Information about the error including component stack
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Uncaught error:', { message: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    sentry.captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  /**
   * Handles resetting the error boundary and navigating to home page.
   * Clears error state and redirects user to root route.
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  /**
   * Handles reloading the current page.
   * Triggers a full page reload to attempt recovery from error state.
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Renders either the error UI or the children components.
   * Shows error details in development mode and provides recovery options.
   *
   * @returns {JSX.Element} Error UI if error occurred, otherwise renders children
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background" dir="rtl">
          <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-2xl shadow-xl border border-border text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2" aria-live="assertive" role="alert">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">عذراً، حدث خطأ غير متوقع</h1>
              <p className="text-muted-foreground">
                واجه النظام مشكلة تقنية غير متوقعة. يرجى محاولة إعادة تحميل الصفحة أو العودة للرئيسية.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-left overflow-auto max-h-48">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {serializeError(this.state.error)}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={this.handleReload} 
                variant="default"
                className="flex-1 gap-2 font-bold"
              >
                <RefreshCcw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              <Button 
                onClick={this.handleReset} 
                variant="outline"
                className="flex-1 gap-2 font-bold"
              >
                <Home className="h-4 w-4" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}