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
        className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 backdrop-blur-md text-primary-foreground gap-2 rounded-2xl px-6 py-6 h-auto transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
        disabled={isExporting}
        aria-label="تصدير البيانات بصيغة إكسل"
      >
        {isExporting ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
        )}
        تصدير البيانات
      </Button>
      <Button 
        onClick={onPrint} 
        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none gap-2 rounded-2xl px-6 py-6 h-auto shadow-xl transition-all hover:scale-105 font-bold focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2"
        aria-label="طباعة التقارير الحالية"
      >
        <Printer className="h-5 w-5" aria-hidden="true" />
        طباعة التقارير
      </Button>
    </div>
  )
})

export default ExportOptions
