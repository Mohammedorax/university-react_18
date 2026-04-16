import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Search, Filter, RefreshCcw } from 'lucide-react'

interface ReportFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  departments: string[]
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  onRefresh: () => void
  onReset: () => void
}

export const ReportFilters = memo(function ReportFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  dateRange,
  onDateRangeChange,
  onRefresh,
  onReset
}: ReportFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-background/10 dark:bg-primary/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 dark:border-primary/20 print:hidden shadow-2xl">
      <div className="relative group w-full sm:w-80">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60 group-focus-within:text-white dark:group-focus-within:text-white transition-colors" aria-hidden="true" />
        <Input
          placeholder="بحث في التقارير..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-12 pr-11 bg-white/10 dark:bg-white/5 border-none text-white dark:text-white placeholder:text-white/40 dark:placeholder:text-white/30 rounded-2xl focus-visible:ring-2 focus-visible:ring-white/30 transition-all font-medium"
          aria-label="البحث في بيانات التقارير"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white/10 dark:bg-white/5 border-none text-white dark:text-white font-bold rounded-2xl focus:ring-2 focus:ring-white/30 transition-all" aria-label="تصفية حسب القسم">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 opacity-70" />
              <SelectValue placeholder="تصفية حسب القسم" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl">
            <SelectItem value="all" className="font-bold">جميع الأقسام</SelectItem>
            {departments.filter(d => d !== 'all').map(dept => (
              <SelectItem key={dept} value={dept} className="font-bold">{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DateRangePicker
        date={dateRange}
        onDateChange={onDateRangeChange}
        className="w-full sm:w-auto [&>button]:h-12 [&>button]:rounded-2xl [&>button]:bg-white/10 dark:[&>button]:bg-white/5 [&>button]:border-none [&>button]:text-white dark:[&>button]:text-white [&>button]:font-bold"
      />

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12 rounded-2xl bg-white shadow-xl text-primary hover:bg-white/90 active:scale-95 transition-all"
          onClick={onRefresh}
          aria-label="تحديث البيانات"
        >
          <RefreshCcw className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-2xl border-dashed border-white/30 dark:border-white/20 text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/20 active:scale-95 transition-all"
          onClick={onReset}
          aria-label="إعادة ضبط فلاتر البحث"
        >
          <RefreshCcw className="h-5 w-5 rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
})
