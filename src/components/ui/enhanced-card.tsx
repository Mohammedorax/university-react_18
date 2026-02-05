import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef, HTMLAttributes } from 'react'

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border hover:shadow-md hover:border-primary/20',
        elevated: 'border-transparent shadow-xl hover:shadow-2xl',
        outlined: 'border-2 border-border/50 bg-transparent',
        ghost: 'border-transparent bg-transparent hover:bg-accent/10',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md',
        gradient: 'border-transparent bg-gradient-to-br from-primary/10 to-primary/5',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      animated: {
        true: 'animate-in fade-in slide-in-from-bottom-8 duration-500',
        false: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
      animated: false,
    },
  }
)

const headerVariants = cva(
  'flex flex-col space-y-1.5 p-6',
  {
    variants: {
      bordered: {
        true: 'border-b border-border',
        false: '',
      },
      centered: {
        true: 'items-center text-center',
        false: 'items-start text-start',
      }
    },
    defaultVariants: {
      bordered: true,
      centered: false,
    },
  }
)

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  interactive?: boolean
  animated?: boolean
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof headerVariants> {
  bordered?: boolean
  centered?: boolean
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, animated, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive, animated, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, bordered, centered, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(headerVariants({ bordered, centered, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, noPadding = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          noPadding ? '' : 'p-6 pt-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, bordered = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center p-6 pt-0',
          bordered && 'border-t border-border',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter, cardVariants, headerVariants }