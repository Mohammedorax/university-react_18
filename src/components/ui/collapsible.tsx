import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CollapsibleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  children: React.ReactNode
  description?: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  icon?: React.ReactNode
  badge?: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
}

/**
 * مكون قابل للطي يدعم الوضعين المتحكم وغير المتحكم ويعتمد على ألوان الثيم الحالية.
 * صُمم ليعرض النص الكامل حتى على الشاشات المتوسطة بدون قص أو إخفاء.
 */
const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    {
      title,
      children,
      description,
      defaultOpen = false,
      open,
      onOpenChange,
      disabled = false,
      icon,
      badge,
      className,
      triggerClassName,
      contentClassName,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId().replace(/:/g, "")
    const baseId = id ?? `collapsible-${generatedId}`
    const triggerId = `${baseId}-trigger`
    const contentId = `${baseId}-content`
    const isControlled = open !== undefined
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
    const isOpen = isControlled ? open : internalOpen
    const regionRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (regionRef.current) {
        regionRef.current.inert = !isOpen
      }
    }, [isOpen])

    const handleToggle = () => {
      if (disabled) return

      const nextOpen = !isOpen

      if (!isControlled) {
        setInternalOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    }

    return (
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "w-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-colors",
          "supports-[backdrop-filter]:bg-card/95",
          disabled && "opacity-70",
          className
        )}
        {...props}
      >
        <button
          id={triggerId}
          type="button"
          aria-controls={contentId}
          aria-expanded={isOpen}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "flex w-full items-start gap-3 rounded-2xl px-4 py-4 text-right transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "hover:bg-accent/50 disabled:cursor-not-allowed",
            isOpen && "bg-primary/5 text-foreground",
            triggerClassName
          )}
        >
          {icon ? (
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="whitespace-normal break-words text-sm font-semibold leading-6 text-foreground md:text-base">
                {title}
              </span>
              {badge}
            </span>

            {description ? (
              <span className="mt-1 block whitespace-normal break-words text-sm leading-6 text-muted-foreground">
                {description}
              </span>
            ) : null}
          </span>

          <ChevronDown
            className={cn(
              "mt-1 h-5 w-5 shrink-0 text-primary transition-transform duration-300 motion-reduce:transition-none",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
          data-state={isOpen ? "open" : "closed"}
        >
          <div className="overflow-hidden">
            <div
              ref={regionRef}
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={cn(
                "border-t border-border/70 px-4 pb-4 pt-3 text-sm leading-7 text-foreground md:text-base",
                "whitespace-normal break-words",
                contentClassName
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Collapsible.displayName = "Collapsible"

export { Collapsible }
