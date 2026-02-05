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
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-primary-foreground/10 p-4 rounded-2xl backdrop-blur-sm border border-primary-foreground/10 print:hidden">
      <div className="relative group w-full sm:w-64">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60 group-focus-within:text-primary-foreground transition-colors" aria-hidden="true" />
        <Input
          placeholder="بحث في التقارير..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 pr-11 bg-primary-foreground/10 border-none text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary-foreground/30"
          aria-label="البحث في بيانات التقارير"
        />
      </div>
      <div className="h-8 w-[1px] bg-primary-foreground/20 hidden sm:block" aria-hidden="true" />
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Filter className="h-5 w-5 text-primary-foreground/70 shrink-0" aria-hidden="true" />
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-primary-foreground/10 border-none text-primary-foreground font-bold rounded-xl focus:ring-primary-foreground/30" aria-label="تصفية حسب القسم">
            <SelectValue placeholder="تصفية حسب القسم" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-muted">
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {departments.filter(d => d !== 'all').map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-8 w-[1px] bg-primary-foreground/20 hidden sm:block" aria-hidden="true" />
      <DateRangePicker 
        date={dateRange} 
        onDateChange={onDateRangeChange}
        className="w-full sm:w-auto"
      />
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 rounded-xl text-primary-foreground hover:bg-primary-foreground/20 shrink-0 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
          onClick={onRefresh}
          aria-label="تحديث البيانات"
        >
          <RefreshCcw className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 rounded-xl text-primary-foreground hover:bg-primary-foreground/20 shrink-0 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
          onClick={onReset}
          aria-label="إعادة ضبط فلاتر البحث"
        >
          <Filter className="h-5 w-5 rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
})

export default ReportFilters
