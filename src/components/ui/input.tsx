import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * خصائص مكون حقل الإدخال
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** @deprecated Use InputHTMLAttributes instead if no extra props are needed */
  _extra?: never;
}

/**
 * مكون حقل إدخال نص أساسي مع دعم الاتجاه من اليمين إلى اليسار.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background ps-3 pe-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-start",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }