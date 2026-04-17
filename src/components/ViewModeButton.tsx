import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface ViewModeButtonProps {
  active: boolean
  onClick: () => void
  icon: LucideIcon | React.ReactNode
  label: string
  className?: string
}

/**
 * زر للتبديل بين وضع العرض الشبكي والجدولي.
 * يوفر تجربة مستخدم سلسة للتبديل بين طرق عرض البيانات المختلفة.
 * 
 * @component ViewModeButton
 * @param {ViewModeButtonProps} props - خصائص المكون
 * @returns {JSX.Element} زر تبديل وضع العرض
 */
export function ViewModeButton({
  active,
  onClick,
  icon: Icon,
  label,
  className
}: ViewModeButtonProps) {
  const renderIcon = () => {
    if (!Icon) return null;

    // Check if Icon is a valid React element (already rendered)
    if (React.isValidElement(Icon)) {
      return Icon;
    }

    // التحقق مما إذا كان الأيقونة مكوناً (دالة أو كائن forwardRef)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && 'render' in Icon)) {
      const IconComponent = Icon as React.ElementType;
      return <IconComponent size={18} />;
    }

    // Fallback for other React nodes (string, number, etc.)
    return Icon as React.ReactNode;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-10 px-4 gap-2.5 rounded-xl transition-all font-bold whitespace-nowrap",
        active
          ? "bg-card shadow-sm text-primary border border-muted dark:bg-muted/40 dark:border-muted/50"
          : "text-muted-foreground hover:bg-transparent hover:text-foreground dark:hover:bg-muted/20",
        className
      )}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      <span aria-hidden="true" className="shrink-0">
        {renderIcon()}
      </span>
      <span className="hidden sm:inline leading-none">{label}</span>
    </Button>
  )
}
