import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportPreviewProps {
  isExporting: boolean
  exportProgress: number
}

export const ReportPreview = memo(function ReportPreview({
  isExporting,
  exportProgress
}: ReportPreviewProps) {
  if (!isExporting) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
      role="alert"
      aria-busy="true"
      aria-label="جاري تصدير التقرير"
    >
      <Card className="w-[400px] border-none shadow-2xl overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-bold text-lg">جاري تصدير التقرير</h2>
              <p className="text-sm text-muted-foreground">يرجى الانتظار قليلاً...</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Download className="h-6 w-6 text-primary animate-bounce" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>{exportProgress}% مكتمل</span>
              <span className="text-primary">{exportProgress === 100 ? 'تم بنجاح' : 'جاري المعالجة...'}</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${exportProgress}%` }}
                role="progressbar"
                aria-valuenow={exportProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[20, 50, 80].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1 rounded-full transition-colors duration-500",
                  exportProgress >= step ? "bg-primary" : "bg-muted"
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
})
