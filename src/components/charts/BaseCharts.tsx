import { memo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts'

// Fix for Recharts type errors in strict mode
const ResponsiveContainerAny = ResponsiveContainer as any;
const AreaChartAny = AreaChart as any;
const AreaAny = Area as any;
const XAxisAny = XAxis as any;
const YAxisAny = YAxis as any;
const CartesianGridAny = CartesianGrid as any;
const TooltipAny = Tooltip as any;
const PieChartAny = PieChart as any;
const PieAny = Pie as any;
const CellAny = Cell as any;
const LegendAny = Legend as any;
const BarChartAny = BarChart as any;
const BarAny = Bar as any;

interface ChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
  strokeDasharray?: string;
}

/**
 * @interface ChartProps
 * @description الخصائص المشتركة لمكونات الرسوم البيانية.
 */
interface ChartProps {
  data: Array<Record<string, unknown>>;
  height?: number | string;
  ariaLabel?: string;
  /** العنوان المخفي للجدول التوضيحي */
  tableCaption?: string;
}

/**
 * @component ChartDataTable
 * @description جدول مخفي يعرض بيانات الرسم البياني لمساعدة قارئات الشاشة.
 */
const ChartDataTable = ({ data, caption, categoryKey = "name", dataKey = "value", series }: { 
  data: Array<Record<string, unknown>>, 
  caption: string, 
  categoryKey?: string, 
  dataKey?: string,
  series?: ChartSeries[]
}) => {
  const chartSeries = series || [{ dataKey, name: 'القيمة' }];
  
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>الفئة</th>
          {chartSeries.map((s, i) => (
            <th key={i}>{s.name || s.dataKey}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            <td>{String(item[categoryKey])}</td>
            {chartSeries.map((s, j) => (
              <td key={j}>{String(item[s.dataKey || dataKey])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * @component BaseAreaChart
 * @description رسم بياني مساحي (Area Chart) موحد ومحسن الأداء.
 */
export const BaseAreaChart = memo(({ 
  data, 
  height = 300, 
  ariaLabel = "رسم بياني مساحي",
  tableCaption,
  dataKey = "value",
  categoryKey = "name",
  color = "hsl(var(--primary))",
  showGrid = true,
  showYAxis = false,
  series
}: ChartProps & { 
  dataKey?: string, 
  categoryKey?: string, 
  color?: string, 
  showGrid?: boolean, 
  showYAxis?: boolean,
  series?: ChartSeries[]
}) => {
  const chartSeries = series || [{ dataKey, color }];

  return (
    <div className="w-full h-full" role="region" aria-label={ariaLabel}>
      <ChartDataTable 
        data={data} 
        caption={tableCaption || ariaLabel} 
        categoryKey={categoryKey} 
        dataKey={dataKey} 
        series={series}
      />
      <ResponsiveContainerAny width="100%" height={height}>
        <AreaChartAny data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            {chartSeries.map((s, i) => (
              <linearGradient key={i} id={`color-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color || color} stopOpacity={s.fillOpacity ?? 0.3}/>
                <stop offset="95%" stopColor={s.color || color} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          {showGrid && <CartesianGridAny strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />}
          <XAxisAny 
            dataKey={categoryKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxisAny 
            hide={!showYAxis}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
          />
          <TooltipAny 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderRadius: '16px', 
              border: '1px solid hsl(var(--border))', 
              boxShadow: '0 20px 25px -5px hsl(var(--foreground) / 0.1)',
              color: 'hsl(var(--foreground))',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          {series && <LegendAny verticalAlign="top" height={36} />}
          {chartSeries.map((s, i) => (
            <AreaAny 
              key={i}
              type="monotone" 
              dataKey={s.dataKey} 
              name={s.name}
              stroke={s.color || color} 
              strokeWidth={s.strokeDasharray ? 2 : 3} 
              strokeDasharray={s.strokeDasharray}
              fillOpacity={1} 
              fill={s.fillOpacity === 0 ? "transparent" : `url(#color-${s.dataKey})`}
              animationBegin={0}
              animationDuration={1500}
            />
          ))}
        </AreaChartAny>
      </ResponsiveContainerAny>
    </div>
  )
})

/**
 * @component BasePieChart
 * @description رسم بياني دائري (Pie Chart) موحد ومحسن الأداء.
 */
export const BasePieChart = memo(({ 
  data, 
  height = 300, 
  ariaLabel = "رسم بياني دائري",
  tableCaption,
  colors = ['hsl(var(--primary))', 'hsl(var(--primary)/0.8)', 'hsl(var(--primary)/0.6)', 'hsl(var(--primary)/0.4)']
}: ChartProps & { colors?: string[] }) => (
  <div className="w-full h-full" role="region" aria-label={ariaLabel}>
    <ChartDataTable data={data} caption={tableCaption || ariaLabel} />
    <ResponsiveContainerAny width="100%" height={height}>
      <PieChartAny>
        <PieAny
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          animationBegin={0}
          animationDuration={1500}
        >
          {data.map((_item: Record<string, unknown>, index: number) => (
            <CellAny key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </PieAny>
        <TooltipAny 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderRadius: '16px', 
            border: '1px solid hsl(var(--border))', 
            boxShadow: '0 20px 25px -5px hsl(var(--foreground) / 0.1)',
            color: 'hsl(var(--foreground))',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        />
        <LegendAny verticalAlign="bottom" height={36} iconType="circle" />
      </PieChartAny>
    </ResponsiveContainerAny>
  </div>
))

/**
 * @component BaseBarChart
 * @description رسم بياني أعمدة (Bar Chart) موحد ومحسن الأداء.
 */
export const BaseBarChart = memo(({ 
  data, 
  height = 300, 
  ariaLabel = "رسم بياني أعمدة",
  tableCaption,
  color = "hsl(var(--primary))",
  layout = "horizontal",
  renderCustomBarLabel
}: ChartProps & { 
  color?: string, 
  layout?: "horizontal" | "vertical",
  renderCustomBarLabel?: (props: Record<string, unknown>) => React.ReactNode
}) => (
  <div className="w-full h-full" role="region" aria-label={ariaLabel}>
    <ChartDataTable data={data} caption={tableCaption || ariaLabel} />
    <ResponsiveContainerAny width="100%" height={height}>
      <BarChartAny data={data} layout={layout} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
        <CartesianGridAny strokeDasharray="3 3" horizontal={layout === "horizontal"} vertical={layout === "vertical"} stroke="hsl(var(--border))" />
        <XAxisAny 
          dataKey={layout === "horizontal" ? "name" : undefined} 
          type={layout === "horizontal" ? "category" : "number"}
          hide={layout === "vertical"}
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
        />
        <YAxisAny 
          dataKey={layout === "vertical" ? "name" : undefined}
          type={layout === "vertical" ? "category" : "number"}
          hide={layout === "horizontal"}
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
          width={layout === "vertical" ? 100 : 0}
        />
        <TooltipAny 
          cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderRadius: '16px', 
            border: '1px solid hsl(var(--border))', 
            boxShadow: '0 20px 25px -5px hsl(var(--foreground) / 0.1)',
            color: 'hsl(var(--foreground))',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        />
        <BarAny 
          dataKey="value" 
          fill={color} 
          radius={layout === "horizontal" ? [8, 8, 0, 0] : [0, 8, 8, 0]} 
          barSize={24}
          animationBegin={0}
          animationDuration={1500}
          label={renderCustomBarLabel}
        />
      </BarChartAny>
    </ResponsiveContainerAny>
  </div>
))

BaseAreaChart.displayName = 'BaseAreaChart'
BasePieChart.displayName = 'BasePieChart'
BaseBarChart.displayName = 'BaseBarChart'
