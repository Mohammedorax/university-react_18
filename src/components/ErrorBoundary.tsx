import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | unknown }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error | unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Here you would typically log the error to an error reporting service
    logger.error('Uncaught error:', { message: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

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
            
            <div className="space-y-2">
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