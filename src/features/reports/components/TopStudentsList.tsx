import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, DataTableColumn } from '@/components/data-table'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Student } from '@/features/students/types'
import { cn } from '@/lib/utils'

interface TopStudentsListProps {
  students: Student[]
  maxDisplay?: number
  onExportPdf?: () => void
  isExporting?: boolean
}

const topStudentsColumns: DataTableColumn<Student>[] = [
  {
    key: 'name',
    title: 'الطالب',
    sortable: true,
    render: (value: unknown) => <span className="font-bold">{value as string}</span>
  },
  {
    key: 'department',
    title: 'القسم'
  },
  {
    key: 'gpa',
    title: 'المعدل',
    sortable: true,
    render: (value: number) => (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-black bg-primary text-primary-foreground">
        {value.toFixed(2)}
      </span>
    )
  },
]

export const TopStudentsList = memo(function TopStudentsList({
  students,
  maxDisplay = 6,
  onExportPdf,
  isExporting = false,
}: TopStudentsListProps) {
  const topStudents = students.slice(0, maxDisplay)

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden" role="region" aria-label="قائمة الطلاب الأوائل">
      <CardHeader className="bg-card border-b border-border/50">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-xl font-black text-foreground">أوائل الطلاب</CardTitle>
          </div>
          {onExportPdf ? (
            <Button size="sm" className="ms-auto" onClick={onExportPdf} disabled={isExporting}>
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <DataTable
            data={topStudents}
            columns={topStudentsColumns}
            pageSize={maxDisplay}
            searchPlaceholder="البحث في الطلاب..."
          />
        </div>
      </CardContent>
    </Card>
  )
})
