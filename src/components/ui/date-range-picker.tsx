import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { ar } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * @interface DateRangePickerProps
 * @description خصائص مكون اختيار نطاق التاريخ.
 */
interface DateRangePickerProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
  placeholder?: string
}

/**
 * @component DateRangePicker
 * @description مكون لاختيار نطاق زمني (تاريخ البداية والنهاية) مع دعم اللغة العربية.
 * 
 * @param {DateRangePickerProps} props - خصائص المكون
 * @returns {JSX.Element} مكون اختيار التاريخ
 */
export function DateRangePicker({
  className,
  date,
  onDateChange,
  placeholder = "اختر الفترة الزمنية"
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-right font-normal rounded-xl h-11 border-muted-foreground/20 focus:ring-primary/20",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: ar })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: ar })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: ar })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ar}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
