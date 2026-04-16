import { toast } from 'sonner';
import type { DataTableColumn } from './types';

/**
 * يستخدم dynamic imports لتأجيل تحميل xlsx/jspdf حتى نقطة الاستخدام الفعلي
 * (تصدير فعلي من المستخدم). يُخفّض حجم الـ initial bundle بشكل كبير.
 */
export function useDataTableExport<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  systemSettings?: {
    universityName?: string;
    reportHeaderSubtitle?: string;
    reportFooterText?: string;
  },
  primaryColor?: string
) {
  const handleExportCSV = async () => {
    try {
      const { exportToCSV } = await import('@/lib/export-utils');
      exportToCSV(data, columns, visibleColumns);
      toast.success('تم تصدير ملف CSV بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء تصدير ملف CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const { exportToExcel } = await import('@/lib/export-utils');
      exportToExcel(data, columns, visibleColumns);
      toast.success('تم تصدير ملف Excel بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء تصدير ملف Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const { exportToPDF } = await import('@/lib/export-utils');
      await exportToPDF(data, columns, visibleColumns, {
        universityName: systemSettings?.universityName,
        reportHeaderSubtitle: systemSettings?.reportHeaderSubtitle,
        reportFooterText: systemSettings?.reportFooterText,
        primaryColor,
      });
      toast.success('تم تصدير ملف PDF بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء تصدير ملف PDF');
    }
  };

  return {
    exportToCSV: handleExportCSV,
    exportToExcel: handleExportExcel,
    exportToPDF: handleExportPDF,
  };
}
