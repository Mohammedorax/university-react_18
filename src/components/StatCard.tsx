import React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon | React.ReactNode
  label?: string
  title?: string
  value: string | number
  description?: string
  isWarning?: boolean
  colorClass?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  className?: string
}

/**
 * مكون لعرض الإحصائيات بشكل جذاب وبسيط.
 * يستخدم في لوحات التحكم لعرض البيانات الرقمية الهامة مع أيقونة توضيحية.
 * 
 * @component StatCard
 * @param {StatCardProps} props - خصائص المكون
 * @returns {JSX.Element} بطاقة إحصائية مصممة بتنسيق Tailwind
 */
export function StatCard({
  icon: Icon,
  label,
  title,
  value,
  description,
  isWarning,
  colorClass,
  variant,
  className
}: StatCardProps) {
  const displayLabel = label || title || '';

  const renderIcon = () => {
    if (!Icon) return null;

    // Check if Icon is a valid React element (already rendered)
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    // Check if Icon is a component (function or forwardRef/memo object)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
      const IconComponent = Icon as React.ElementType;
      return <IconComponent size={28} />;
    }

    // Fallback for other React nodes (string, number, etc.)
    return Icon as React.ReactNode;
  }

  const getVariantStyles = () => {
    if (variant === 'primary') return "bg-primary/5 border-primary/10 text-primary hover:bg-primary/10";
    if (variant === 'secondary') return "bg-secondary/10 border-secondary/20 text-secondary hover:bg-secondary/15";
    return "bg-card border-muted text-foreground hover:bg-muted/50 dark:hover:bg-muted/30";
  }

  const getIconStyles = () => {
    if (isWarning) return "bg-destructive/10 text-destructive shadow-none dark:bg-destructive/20";
    if (variant === 'primary') return "bg-primary text-primary-foreground shadow-lg shadow-primary/20";
    if (colorClass) return cn(colorClass, "shadow-none");
    return "bg-muted/80 text-primary dark:bg-muted/30 dark:text-primary shadow-sm border border-muted/50";
  }

  return (
    <div
      className={cn(
        "rounded-3xl p-6 border bg-card/40 backdrop-blur-sm flex items-center gap-5 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
        getVariantStyles(),
        className
      )}
      role="status"
      aria-label={`${displayLabel}: ${value}`}
    >
      <div
        className={cn(
          "p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
          getIconStyles()
        )}
        aria-hidden="true"
      >
        {renderIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-muted-foreground/80 dark:text-muted-foreground/70 mb-1">{displayLabel}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{value}</p>
        </div>
        {description && <p className="text-xs text-muted-foreground/60 dark:text-muted-foreground/50 mt-1 font-medium">{description}</p>}
      </div>
    </div>
  )
}
