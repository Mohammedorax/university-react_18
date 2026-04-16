import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'

interface CriticalStudent {
  id: string
  name: string
  university_id: string
  gpa: number
}

interface CriticalAlertsProps {
  students: CriticalStudent[]
  threshold?: number
}

export const CriticalAlerts = memo(function CriticalAlerts({
  students,
  threshold = 2.5
}: CriticalAlertsProps) {
  const criticalStudents = students.filter(s => s.gpa < threshold)

  return (
    <div className="divide-y divide-border/50">
      {criticalStudents.length === 0 ? (
        <div className="p-12">
          <EmptyState
            icon={CheckCircle2}
            title="لا توجد حالات حرجة"
            description="جميع الطلاب يحافظون على نسب حضور جيدة."
          />
        </div>
      ) : (
        criticalStudents.slice(0, 5).map((student) => (
          <div
            key={student.id}
            className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold"
                aria-hidden="true"
              >
                {student.name[0]}
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{student.name}</p>
                <p className="text-[10px] text-muted-foreground font-bold">{student.university_id}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-destructive">
                <span className="font-black text-lg">18%</span>
                <ChevronRight size={14} aria-hidden="true" />
              </div>
              <p className="text-[10px] text-destructive/80 font-black uppercase">غياب</p>
            </div>
          </div>
        ))
      )}
      {criticalStudents.length > 0 && (
        <div className="p-4 bg-muted/30">
          <Button
            variant="outline"
            className="w-full rounded-xl font-bold text-muted-foreground border-border hover:bg-card"
            aria-label="عرض كافة تنبيهات الحالات الحرجة"
          >
            عرض كافة التنبيهات
          </Button>
        </div>
      )}
    </div>
  )
})
