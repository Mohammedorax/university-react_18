import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'
import { Search, Eye, EyeOff, AlertCircle } from 'lucide-react'

const inputVariants = cva(
  'flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border focus-visible:border-primary',
        error: 'border-destructive focus-visible:border-destructive',
        success: 'border-green-500 focus-visible:border-green-500',
        ghost: 'border-transparent bg-transparent focus-visible:bg-accent/50',
        filled: 'border-transparent bg-muted focus-visible:bg-background',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      withIcon: {
        true: 'pr-10',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: true,
      withIcon: false,
    },
  }
)

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
  withIcon?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, fullWidth, withIcon, label, error, helperText, icon, loading, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        
        <div className="relative">
          {withIcon && icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              inputVariants({ variant, size, fullWidth, withIcon }),
              withIcon && 'pl-10',
              error && 'border-destructive focus-visible:border-destructive',
              className
            )}
            placeholder={props.placeholder}
            disabled={loading || props.disabled}
            {...props}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        
        {helperText && !error && (
          <div className="text-xs text-muted-foreground">
            {helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }