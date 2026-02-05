import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon | React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

/**
 * مكون يعرض حالة "لا توجد بيانات" أو "نتائج فارغة" بشكل مرئي جذاب.
 * يتضمن أيقونة، عنوان، وصف، وزر اختياري لاتخاذ إجراء.
 * 
 * @component EmptyState
 * @param {EmptyStateProps} props - خصائص المكون
 * @returns {JSX.Element} مكون الحالة الفارغة
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    
    // التحقق مما إذا كان الأيقونة عنصراً صالحاً في ريأكت
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    // التحقق مما إذا كان الأيقونة مكوناً (دالة أو كائن forwardRef)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
      const IconComponent = Icon as React.ElementType;
      return <IconComponent size={40} className="text-primary" />;
    }
    
    // Fallback لأي عقدة ريأكت أخرى
    return Icon as React.ReactNode;
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500",
        "border-2 border-dashed border-muted rounded-3xl bg-muted/5",
        className
      )}
      role="status"
      aria-labelledby="empty-state-title"
      aria-describedby="empty-state-desc"
    >
      <div className="bg-primary/10 p-4 rounded-full mb-4" aria-hidden="true">
        {renderIcon()}
      </div>
      <h3 id="empty-state-title" className="text-xl font-bold mb-2 text-foreground">{title}</h3>
      <p id="empty-state-desc" className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl px-6" aria-label={actionLabel}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
