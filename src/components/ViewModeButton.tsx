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
        "h-9 px-4 gap-2 rounded-lg transition-all font-bold",
        active ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-transparent",
        className
      )}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      <span aria-hidden="true">
        {renderIcon()}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
