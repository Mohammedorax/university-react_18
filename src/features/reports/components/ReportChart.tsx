import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/EmptyState'
import {
  BaseAreaChart,
  BasePieChart,
  BaseBarChart
} from '@/components/charts/BaseCharts'
import { UserX, BookX, TrendingUp } from 'lucide-react'

type ChartType = 'pie' | 'bar' | 'area'

interface ChartDataItem {
  name: string
  value?: number
  count?: number
  [key: string]: unknown
}

interface SeriesConfig {
  dataKey: string
  name: string
  color: string
  fillOpacity?: number
  strokeDasharray?: string
}

interface ReportChartProps {
  title: string
  description: string
  type: ChartType
  data: ChartDataItem[]
  height?: number
  isEmpty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  // Pie chart specific
  colors?: string[]
  // Bar chart specific
  layout?: 'vertical' | 'horizontal'
  color?: string
  renderCustomBarLabel?: (props: Record<string, unknown>) => React.ReactNode
  // Area chart specific
  dataKey?: string
  categoryKey?: string
  showYAxis?: boolean
  series?: SeriesConfig[]
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.8)',
  'hsl(var(--primary) / 0.6)',
  'hsl(var(--primary) / 0.4)',
  'hsl(var(--primary) / 0.2)',
  'hsl(var(--muted-foreground))'
]

export const ReportChart = memo(function ReportChart({
  title,
  description,
  type,
  data,
  height = 350,
  isEmpty = false,
  emptyTitle = "لا توجد بيانات",
  emptyDescription = "لا تتوفر بيانات حالياً لعرض التحليل.",
  // Pie
  colors = COLORS,
  // Bar
  layout = 'horizontal',
  color = 'hsl(var(--primary))',
  renderCustomBarLabel,
  // Area
  dataKey = 'value',
  categoryKey = 'name',
  showYAxis = false,
  series
}: ReportChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <BasePieChart
            data={data}
            colors={colors}
            ariaLabel={title}
            height={height}
          />
        )
      case 'bar':
        return (
          <BaseBarChart
            data={data}
            color={color}
            layout={layout}
            ariaLabel={title}
            height={height}
            renderCustomBarLabel={renderCustomBarLabel}
          />
        )
      case 'area':
        return (
          <BaseAreaChart
            data={data}
            dataKey={dataKey}
            categoryKey={categoryKey}
            ariaLabel={title}
            showYAxis={showYAxis}
            height={height}
            series={series}
          />
        )
      default:
        return null
    }
  }

  const getEmptyIcon = () => {
    if (title.includes('مقرر') || title.includes('المقررات')) return BookX
    if (title.includes('نجاح') || title.includes('أداء')) return TrendingUp
    return UserX
  }

  const EmptyIcon = getEmptyIcon()

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden" role="region" aria-label={title}>
      <CardHeader className="bg-card border-b border-border/50">
        <CardTitle className="text-xl font-black text-foreground">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6" style={{ height: height + 50 }}>
        {isEmpty ? (
          <EmptyState
            icon={EmptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  )
})
