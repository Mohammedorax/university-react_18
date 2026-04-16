import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Printer, FileSpreadsheet } from 'lucide-react'

interface ExportOptionsProps {
  isExporting: boolean
  onExportExcel: () => void
  onPrint: () => void
}

export const ExportOptions = memo(function ExportOptions({
  isExporting,
  onExportExcel,
  onPrint
}: ExportOptionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 print:hidden">
      <Button
        onClick={onExportExcel}
        className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white gap-3 rounded-2xl px-6 h-12 transition-all hover:scale-[1.02] active:scale-95 shadow-lg font-bold"
        disabled={isExporting}
        aria-label="تصدير البيانات بصيغة إكسل"
      >
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
        )}
        تصدير Excel
      </Button>
      <Button
        onClick={onPrint}
        className="bg-white text-primary hover:bg-white/90 border-none gap-3 rounded-2xl px-6 h-12 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 font-bold"
        aria-label="طباعة التقارير الحالية"
      >
        <Printer className="h-5 w-5" aria-hidden="true" />
        طباعة التقارير
      </Button>
    </div>
  )
})
