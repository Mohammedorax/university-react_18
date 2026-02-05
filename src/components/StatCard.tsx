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
    return "bg-card border-muted text-foreground hover:bg-muted/50";
  }

  const getIconStyles = () => {
    if (isWarning) return "bg-destructive/10 text-destructive shadow-none";
    if (variant === 'primary') return "bg-primary text-primary-foreground shadow-lg shadow-primary/20";
    if (colorClass) return cn(colorClass, "shadow-none");
    return "bg-muted text-muted-foreground shadow-none";
  }

  return (
    <div 
      className={cn(
        "rounded-2xl p-6 border flex items-center gap-5 transition-all duration-300 group",
        getVariantStyles(),
        className
      )}
      role="status"
      aria-label={`${displayLabel}: ${value}`}
    >
      <div 
        className={cn(
          "p-3.5 rounded-xl transition-transform group-hover:scale-110",
          getIconStyles()
        )}
        aria-hidden="true"
      >
        {renderIcon()}
      </div>
      <div>
        <p className="text-sm font-bold opacity-70 mb-1">{displayLabel}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
        {description && <p className="text-xs opacity-60 mt-1 font-medium">{description}</p>}
      </div>
    </div>
  )
}
