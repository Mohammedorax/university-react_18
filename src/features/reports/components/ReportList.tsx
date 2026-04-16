import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, DataTableColumn } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { UserX, BookX, TrendingUp, CheckCircle2, FileText, Calendar, Filter, BookOpen } from 'lucide-react'

interface ReportListProps {
  title: string
  description: string
  icon?: 'file' | 'chart' | 'calendar' | 'filter' | 'book'
  data: Array<Record<string, unknown>>
  columns: DataTableColumn<any>[]
  pageSize?: number
  searchPlaceholder?: string
  virtualized?: boolean
  emptyState?: {
    icon: 'user' | 'book' | 'chart' | 'check'
    title: string
    description: string
  }
  isEmpty?: boolean
}

const iconMap = {
  file: FileText,
  chart: TrendingUp,
  calendar: Calendar,
  filter: Filter,
  book: BookOpen
}

const emptyIconMap = {
  user: UserX,
  book: BookX,
  chart: TrendingUp,
  check: CheckCircle2
}

export const ReportList = memo(function ReportList({
  title,
  description,
  icon = 'file',
  data,
  columns,
  pageSize = 10,
  searchPlaceholder = "بحث...",
  virtualized = false,
  emptyState,
  isEmpty = false
}: ReportListProps) {
  const IconComponent = iconMap[icon]
  const EmptyIconComponent = emptyState ? emptyIconMap[emptyState.icon] : null

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden" role="region" aria-label={title}>
      <CardHeader className="bg-card border-b border-border/50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-black text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <IconComponent className="text-muted-foreground h-5 w-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className={isEmpty ? "p-6 h-[400px] flex items-center justify-center" : "p-0"}>
        {isEmpty && EmptyIconComponent ? (
          <EmptyState
            icon={EmptyIconComponent}
            title={emptyState!.title}
            description={emptyState!.description}
          />
        ) : (
          <DataTable
            data={data}
            columns={columns}
            pageSize={pageSize}
            searchPlaceholder={searchPlaceholder}
            virtualized={virtualized}
            virtualHeight={400}
          />
        )}
      </CardContent>
    </Card>
  )
})
