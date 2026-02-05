import { ReactNode } from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

export interface ErrorDisplayProps {
  error: Error | string
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'modal' | 'toast'
  className?: string
}

export const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss, 
  variant = 'inline',
  className 
}: ErrorDisplayProps) => {
  const errorMessage = error instanceof Error ? error.message : error
  
  const variants = {
    inline: 'border border-destructive/20 bg-destructive/5 p-4 rounded-lg',
    modal: 'p-6 rounded-xl border border-destructive/20 bg-destructive/5',
    toast: 'p-3 rounded-lg border border-destructive/20 bg-destructive/5'
  }
  
  return (
    <div className={cn(variants[variant], className)} role="alert" aria-live="assertive">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-destructive">
            حدث خطأ
          </h3>
          <p className="text-sm text-destructive/80">
            {errorMessage}
          </p>
          
          {onRetry && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCcw className="h-3 w-3" />
                إعادة المحاولة
              </Button>
            </div>
          )}
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive"
            aria-label="إغلاق رسالة الخطأ"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export const LoadingState = ({ 
  message = 'جاري التحميل...', 
  variant = 'default' 
}: { 
  message?: string
  variant?: 'default' | 'skeleton' | 'spinner' 
}) => {
  if (variant === 'skeleton') {
    return (
      <div className="space-y-4" role="status" aria-label="جاري التحميل">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    )
  }
  
  if (variant === 'spinner') {
    return (
      <div className="flex items-center justify-center p-8" role="status" aria-label="جاري التحميل">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="جاري التحميل">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}

export const EmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  action 
}: { 
  title: string
  description?: string
  icon?: React.ComponentType<any>
  action?: ReactNode
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="status">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {title}
      </h3>
      
      {description && (
        <p className="mb-4 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}