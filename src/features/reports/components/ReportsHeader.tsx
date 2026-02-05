import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/StatCard'
import { PieChartIcon, Users, BookOpen, TrendingUp, AlertCircle } from 'lucide-react'

interface ReportsHeaderProps {
  isLoading: boolean
  totalStudents: number
  totalCourses: number
  successRate: number
  failingStudentsCount: number
}

const ReportsHeaderSkeleton = memo(function ReportsHeaderSkeleton() {
  return (
    <div className="bg-primary/90 text-primary-foreground pb-32 pt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
            <Skeleton className="h-20 w-20 rounded-3xl bg-primary-foreground/20" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-64 bg-primary-foreground/20" />
              <Skeleton className="h-6 w-96 bg-primary-foreground/20" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-14 w-40 rounded-2xl bg-primary-foreground/20" />
            <Skeleton className="h-14 w-40 rounded-2xl bg-primary-foreground/20" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-primary-foreground/20" />
          ))}
        </div>
      </div>
    </div>
  )
})

export const ReportsHeader = memo(function ReportsHeader({
  isLoading,
  totalStudents,
  totalCourses,
  successRate,
  failingStudentsCount
}: ReportsHeaderProps) {
  if (isLoading) {
    return <ReportsHeaderSkeleton />
  }

  return (
    <div className="relative overflow-hidden bg-primary/90 text-primary-foreground pb-40 pt-12">
      <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
        <TrendingUp size={400} aria-hidden="true" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
            <div className="bg-primary-foreground/10 backdrop-blur-xl p-5 rounded-3xl border border-primary-foreground/20 shadow-2xl">
              <PieChartIcon size={56} className="text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">التقارير التحليلية</h1>
              <p className="text-primary-foreground/80 text-lg max-w-xl">مركز البيانات الذكي لمراقبة الأداء الأكاديمي وتحليل اتجاهات الجامعة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="إحصائيات عامة">
          <StatCard icon={Users} label="إجمالي الطلاب" value={totalStudents} />
          <StatCard icon={BookOpen} label="المقررات" value={totalCourses} />
          <StatCard icon={TrendingUp} label="نسبة النجاح" value={`${successRate.toFixed(1)}%`} />
          <StatCard 
            icon={AlertCircle} 
            label="طلاب متعثرين" 
            value={failingStudentsCount} 
            isWarning={failingStudentsCount > 0} 
          />
        </div>
      </div>
    </div>
  )
})

export default ReportsHeader
