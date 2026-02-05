import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * @interface RouteErrorBoundaryProps
 * @description خصائص حدود الخطأ للمسارات
 */
interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName: string;
  onReset?: () => void;
}

/**
 * @interface RouteErrorBoundaryState
 * @description حالة حدود الخطأ للمسارات
 */
interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * @class RouteErrorBoundary
 * @description حدود خطأ مخصصة للمسارات الفردية
 * تعزل أخطاء كل مسار عن باقي التطبيق
 * 
 * @example
 * ```tsx
 * <RouteErrorBoundary routeName="Students Page">
 *   <StudentsPage />
 * </RouteErrorBoundary>
 * ```
 */
export class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // تسجيل الخطأ مع اسم المسار
    logger.error(`Error in route ${this.props.routeName}`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      route: this.props.routeName,
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-2xl shadow-xl border border-border text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                خطأ في تحميل الصفحة
              </h2>
              <p className="text-muted-foreground">
                حدث خطأ أثناء تحميل {this.props.routeName}. يمكنك المحاولة مرة أخرى أو العودة.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-muted rounded-lg text-left overflow-auto max-h-32 text-xs font-mono">
                  <p className="font-semibold text-destructive">{this.state.error.message}</p>
                  <p className="text-muted-foreground mt-2">{this.state.error.stack}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={this.handleReset} 
                variant="default"
                className="w-full gap-2 font-bold"
              >
                <RefreshCcw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  onClick={this.handleGoBack} 
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  رجوع
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Home className="h-4 w-4" />
                  الرئيسية
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * @component withRouteErrorBoundary
 * @description Higher-Order Component لإضافة حدود خطأ لأي مكون
 * 
 * @example
 * ```tsx
 * const StudentsPageWithErrorBoundary = withRouteErrorBoundary(StudentsPage, 'Students');
 * ```
 */
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  routeName: string
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <RouteErrorBoundary routeName={routeName}>
        <Component {...props} />
      </RouteErrorBoundary>
    );
  };
}
