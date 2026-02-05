import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'
import { LucideIcon } from 'lucide-react'

const statCardVariants = cva(
  'rounded-xl border bg-card p-6 shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border hover:shadow-md hover:border-primary/20',
        gradient: 'border-transparent bg-gradient-to-br from-primary/10 to-primary/5',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md',
        elevated: 'border-transparent shadow-xl hover:shadow-2xl',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      animated: {
        true: 'animate-in fade-in slide-in-from-bottom-8 duration-500',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animated: false,
    },
  }
)

export interface StatCardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  loading?: boolean
  animated?: boolean
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, size, animated, title, value, description, icon: Icon, trend, loading, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, size, animated, className }))}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              ) : (
                value
              )}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center',
              variant === 'gradient' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-border">
            {children}
          </div>
        )}
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

export { StatCard, statCardVariants }