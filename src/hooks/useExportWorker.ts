/**
 * @file useExportWorker.ts
 * @description Hook للتعامل مع Web Worker للتصدير
 * @module hooks
 */

import { useCallback, useRef, useState } from 'react';
import { useErrorHandler } from '@/lib/error-handling';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useTheme } from '@/components/ThemeProvider';

/**
 * خيارات التصدير
 * @interface ExportOptions
 * @property {string[]} [headers] - قائمة عناوين الأعمدة
 * @example
 * const options: ExportOptions = {
 *   headers: ['الاسم', 'المعرف', 'القسم']
 * };
 */
interface ExportOptions {
  headers?: string[];
}

/**
 * نتيجة عملية التصدير
 * @interface ExportResult
 * @property {boolean} success - هل نجحت العملية
 * @property {Blob} [blob] - البيانات المصدرة
 * @property {string} [error] - رسالة الخطأ إذا فشلت
 */
interface ExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

/**
 * Hook لتصدير البيانات باستخدام Web Worker
 * @function useExportWorker
 * @returns {Object} أدوات التصدير
 * @returns {Function} exportToPDF - تصدير إلى PDF
 * @returns {Function} exportToExcel - تصدير إلى Excel
 * @returns {Function} exportToCSV - تصدير إلى CSV
 * @returns {boolean} isExporting - حالة التصدير الحالية
 * @description يستخدم Web Worker لتنفيذ عمليات التصدير في خلفية المتصفح دون تأثير على الأداء
 * @example
 * function StudentsList() {
 *   const { exportToPDF, exportToExcel, exportToCSV, isExporting } = useExportWorker();
 *   const students = [{ id: 1, name: 'أحمد' }, { id: 2, name: 'محمد' }];
 *   
 *   const handleExport = async (type: 'PDF' | 'EXCEL' | 'CSV') => {
 *     switch (type) {
 *       case 'PDF':
 *         await exportToPDF(students, 'قائمة-الطلاب');
 *         break;
 *       case 'EXCEL':
 *         await exportToExcel(students, 'قائمة-الطلاب');
 *         break;
 *       case 'CSV':
 *         await exportToCSV(students, 'قائمة-الطلاب');
 *         break;
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <Button onClick={() => handleExport('PDF')} disabled={isExporting}>
 *         تصدير PDF
 *       </Button>
 *       <Button onClick={() => handleExport('EXCEL')} disabled={isExporting}>
 *         تصدير Excel
 *       </Button>
 *     </div>
 *   );
 * }
 */
export function useExportWorker() {
  const workerRef = useRef<Worker | null>(null);
  const { handleError, showSuccess } = useErrorHandler();
  const { data: systemSettings } = useSettings();
  const { primaryColor } = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  // Initialize worker on first use
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/export.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  /**
   * دالة التصدير الرئيسية
   * @param {'PDF' | 'EXCEL' | 'CSV'} type - نوع الملف
   * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
   * @param {string} filename - اسم الملف
   * @param {ExportOptions} [options] - خيارات التصدير
   * @returns {Promise<ExportResult>} نتيجة التصدير
   * @private
   */
  const exportData = useCallback(async (
    type: 'PDF' | 'EXCEL' | 'CSV',
    data: Array<Record<string, unknown>>,
    filename: string,
    options?: ExportOptions
  ): Promise<ExportResult> => {
    setIsExporting(true);
    
    try {
      const worker = getWorker();
      const id = `${Date.now()}-${Math.random()}`;
      
      return new Promise((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.data.id === id) {
            worker.removeEventListener('message', handleMessage);
            
            if (event.data.success && event.data.blob) {
              // Download the file
              const url = URL.createObjectURL(event.data.blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${filename}.${type.toLowerCase()}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              showSuccess(
                `تم تصدير ${type} بنجاح`,
                `تم حفظ الملف: ${filename}.${type.toLowerCase()}`
              );
              
              resolve({ success: true, blob: event.data.blob });
            } else {
              handleError(new Error(event.data.error || 'Export failed'));
              resolve({ success: false, error: event.data.error });
            }
            
            setIsExporting(false);
          }
        };
        
        worker.addEventListener('message', handleMessage);
        
        worker.postMessage({
          id,
          type,
          data,
          filename,
          options: {
            ...options,
            universityName: systemSettings?.universityName,
            primaryColor
          }
        });
      });
    } catch (error) {
      handleError(error);
      setIsExporting(false);
      return { success: false, error: String(error) };
    }
  }, [getWorker, handleError, showSuccess, systemSettings, primaryColor]);

  /**
   * تصدير البيانات إلى PDF
   * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
   * @param {string} filename - اسم الملف بدون الامتداد
   * @param {ExportOptions} [options] - خيارات التصدير
   * @returns {Promise<ExportResult>} نتيجة التصدير
   * @example
   * const { exportToPDF } = useExportWorker();
   * const data = [{ name: 'أحمد', age: 20 }];
   * await exportToPDF(data, 'تقرير-الطلاب', { headers: ['الاسم', 'العمر'] });
   */
  const exportToPDF = useCallback(async (
    data: Array<Record<string, unknown>>,
    filename: string,
    options?: ExportOptions
  ) => {
    return exportData('PDF', data, filename, options);
  }, [exportData]);

  /**
   * تصدير البيانات إلى Excel
   * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
   * @param {string} filename - اسم الملف بدون الامتداد
   * @param {ExportOptions} [options] - خيارات التصدير
   * @returns {Promise<ExportResult>} نتيجة التصدير
   * @example
   * const { exportToExcel } = useExportWorker();
   * const data = [{ name: 'أحمد', age: 20 }];
   * await exportToExcel(data, 'بيانات-الطلاب', { headers: ['الاسم', 'العمر'] });
   */
  const exportToExcel = useCallback(async (
    data: Array<Record<string, unknown>>,
    filename: string,
    options?: ExportOptions
  ) => {
    return exportData('EXCEL', data, filename, options);
  }, [exportData]);

  /**
   * تصدير البيانات إلى CSV
   * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
   * @param {string} filename - اسم الملف بدون الامتداد
   * @param {ExportOptions} [options] - خيارات التصدير
   * @returns {Promise<ExportResult>} نتيجة التصدير
   * @example
   * const { exportToCSV } = useExportWorker();
   * const data = [{ name: 'أحمد', age: 20 }];
   * await exportToCSV(data, 'بيانات-الطلاب', { headers: ['الاسم', 'العمر'] });
   */
  const exportToCSV = useCallback(async (
    data: Array<Record<string, unknown>>,
    filename: string,
    options?: ExportOptions
  ) => {
    return exportData('CSV', data, filename, options);
  }, [exportData]);

  return {
    exportToPDF,
    exportToExcel,
    exportToCSV,
    isExporting
  };
}
