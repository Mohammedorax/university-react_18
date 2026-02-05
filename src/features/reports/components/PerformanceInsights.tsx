import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'

interface PerformanceInsightsProps {
  avgGpa: number
  successRate: number
  failingCount: number
  filteredStudentsCount: number
}

export const PerformanceInsights = memo(function PerformanceInsights({
  avgGpa,
  successRate,
  failingCount,
  filteredStudentsCount
}: PerformanceInsightsProps) {
  if (filteredStudentsCount === 0) {
    return (
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
        <CardContent className="p-12">
          <EmptyState
            icon={TrendingUp}
            title="لا توجد بيانات"
            description="لا تتوفر بيانات طلاب لتحليل الأداء."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-primary/5 border border-primary/10">
      <CardHeader>
        <CardTitle className="text-xl font-black text-primary flex items-center gap-2">
          <ArrowUpRight className="h-6 w-6" />
          تحليل الأداء العام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
          <p className="text-sm text-muted-foreground mb-1 font-bold">متوسط المعدل التراكمي للجامعة</p>
          <h3 className="text-4xl font-black text-foreground">
            {avgGpa.toFixed(2)}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <p className="text-[10px] text-emerald-600 font-black uppercase mb-1">نسبة النجاح الكلية</p>
            <p className="text-2xl font-black text-emerald-700">{successRate.toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <p className="text-[10px] text-amber-600 font-black uppercase mb-1">الطلاب المتعثرين</p>
            <p className="text-2xl font-black text-amber-700">{failingCount}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <h4 className="text-sm font-black text-foreground">توصيات أكاديمية:</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>تكثيف الساعات المكتبية في الأقسام التي تقل نسبة النجاح فيها عن 75%.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>تفعيل برنامج الإرشاد الأكاديمي للطلاب الحاصلين على معدل أقل من 2.0.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
})

export default PerformanceInsights
