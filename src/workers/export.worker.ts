/**
 * @file export.worker.ts
 * @description Web Worker للتعامل مع تصدير PDF و Excel في خلفية المتصفح
 * @description يُحسّن استجابة واجهة المستخدم أثناء عمليات التصدير الثقيلة
 * @module workers
 */

import { processArabicText } from '@/lib/utils';
import { getCairoFont } from '@/lib/fonts';

/**
 * واجهة رسائل التصدير المرسلة إلى الـ Worker
 * @interface ExportMessage
 * @property {string} id - معرّف فريد للعملية
 * @property {'PDF' | 'EXCEL' | 'CSV'} type - نوع الملف المطلوب
 * @property {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
 * @property {string} filename - اسم الملف المقترح
 * @property {Object} [options] - خيارات إضافية
 * @property {string[]} [options.headers] - عناوين الأعمدة المخصصة
 * @property {string} [options.universityName] - اسم الجامعة للعرض
 * @property {string} [options.primaryColor] - اللون الرئيسي للتنسيق
 */
interface ExportMessage {
  id: string;
  type: 'PDF' | 'EXCEL' | 'CSV';
  data: Array<Record<string, unknown>>;
  filename: string;
  options?: {
    headers?: string[];
    universityName?: string;
    primaryColor?: string;
  };
}

/**
 * واجهة نتيجة التصدير المرسلة من الـ Worker
 * @interface ExportResult
 * @property {string} id - معرّف العملية المطابق للطلب
 * @property {boolean} success - هل نجحت العملية
 * @property {Blob} [blob] - البيانات المصدرة كـ Blob
 * @property {string} [url] - URL مؤقت للبيانات (غير مستخدم حالياً)
 * @property {string} [error] - رسالة الخطأ إذا فشلت العملية
 */
interface ExportResult {
  id: string;
  success: boolean;
  blob?: Blob;
  url?: string;
  error?: string;
}

/**
 * معالج رسائل الـ Worker الرئيسي
 * @event message
 * @description يستمع للرسائل المرسلة من الخيط الرئيسي وينفذ العملية المناسبة
 */
self.onmessage = async (event: MessageEvent<ExportMessage>) => {
  const { id, type, data, filename, options } = event.data;
  
  try {
    let result: ExportResult;
    
    switch (type) {
      case 'PDF':
        result = await exportToPDF(id, data, filename, options);
        break;
      case 'EXCEL':
        result = await exportToExcel(id, data, filename, options);
        break;
      case 'CSV':
        result = await exportToCSV(id, data, filename, options);
        break;
      default:
        throw new Error(`Unsupported export type: ${type}`);
    }
    
    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * تصدير البيانات إلى PDF باستخدام jsPDF في Web Worker
 * @function exportToPDF
 * @async
 * @param {string} id - معرّف العملية
 * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
 * @param {string} filename - اسم الملف (للتتبع فقط)
 * @param {ExportMessage['options']} [options] - خيارات التصدير
 * @returns {Promise<ExportResult>} نتيجة التصدير مع Blob
 * @description يُنشئ ملف PDF منسق باستخدام خط القاهرة للدعم العربي
 * @example
 * // استخدام داخلي من معالج الرسائل
 * const result = await exportToPDF('123', students, 'report', {
 *   headers: ['الاسم', 'المعرف'],
 *   universityName: 'جامعة القاهرة',
 *   primaryColor: '30, 58, 138'
 * });
 */
async function exportToPDF(
  id: string,
  data: Array<Record<string, unknown>>,
  filename: string,
  options?: ExportMessage['options']
): Promise<ExportResult> {
  // Dynamic import of jsPDF (available in worker via bundler configuration)
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });
  
  // Load Cairo font
  const fontData = await getCairoFont();
  let fontRegistered = false;
  
  if (fontData && fontData.length > 1000) {
    try {
      doc.addFileToVFS('Cairo-Regular.ttf', fontData);
      doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
      doc.setFont('Cairo');
      fontRegistered = true;
    } catch {
      // Fallback to default font
    }
  }
  
  // University settings
  const universityName = options?.universityName || 'الجامعة الافتراضية';
  const primaryColor = options?.primaryColor || '30, 58, 138';
  const colorParts = primaryColor.split(/[\s,/]+/).map(Number).filter(n => !isNaN(n));
  const headerColor: [number, number, number] = colorParts.length >= 3
    ? [colorParts[0], colorParts[1], colorParts[2]]
    : [30, 58, 138];
  
  // Header
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'bold');
  doc.text(processArabicText(universityName), 105, 12, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'normal');
  doc.text(processArabicText('نظام إدارة الجامعة المتكامل'), 105, 20, { align: 'center' });
  
  // Date
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 30, 210, 10, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  const dateStr = new Date().toLocaleDateString('ar-EG');
  doc.text(`${processArabicText('تاريخ التقرير')}: ${dateStr}`, 195, 37, { align: 'left' });
  
  // Prepare table data
  const headers = options?.headers || Object.keys(data[0] || {});
  const body = data.map(row => 
    headers.map(header => {
      const val = row[header];
      if (typeof val === 'string') {
        return processArabicText(val);
      }
      return String(val ?? '-');
    })
  );
  
  // Table
  autoTable(doc, {
    head: [headers.map(h => processArabicText(h))],
    body: body,
    startY: 45,
    styles: {
      font: fontRegistered ? 'Cairo' : 'helvetica',
      halign: 'center',
      fontSize: 9,
      cellPadding: 4,
      lineWidth: 0.1,
      lineColor: [220, 220, 220]
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { top: 15, right: 15, bottom: 25, left: 15 }
  });
  
  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 277, 210, 17, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    processArabicText(`${universityName} - ${processArabicText('تم إنشاء هذا التقرير آلياً')}`),
    105,
    284,
    { align: 'center' }
  );
  
  // Generate blob
  const pdfBlob = doc.output('blob');
  
  return {
    id,
    success: true,
    blob: pdfBlob
  };
}

/**
 * تصدير البيانات إلى Excel باستخدام xlsx في Web Worker
 * @function exportToExcel
 * @async
 * @param {string} id - معرّف العملية
 * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
 * @param {string} filename - اسم الملف (للتتبع فقط)
 * @param {ExportMessage['options']} [options] - خيارات التصدير
 * @returns {Promise<ExportResult>} نتيجة التصدير مع Blob
 * @description يُنشئ ملف Excel (.xlsx) مع دعم RTL للعربية
 * @example
 * // استخدام داخلي من معالج الرسائل
 * const result = await exportToExcel('123', students, 'report', {
 *   headers: ['الاسم', 'المعرف', 'القسم']
 * });
 */
async function exportToExcel(
  id: string,
  data: Array<Record<string, unknown>>,
  filename: string,
  options?: ExportMessage['options']
): Promise<ExportResult> {
  const XLSX = await import('xlsx');
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Apply RTL
  worksheet['!dir'] = 'rtl';
  
  // Set column widths
  const headers = options?.headers || Object.keys(data[0] || {});
  worksheet['!cols'] = headers.map(() => ({ wch: 25 }));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return {
    id,
    success: true,
    blob: excelBlob
  };
}

/**
 * تصدير البيانات إلى CSV في Web Worker
 * @function exportToCSV
 * @async
 * @param {string} id - معرّف العملية
 * @param {Array<Record<string, unknown>>} data - البيانات المراد تصديرها
 * @param {string} filename - اسم الملف (للتتبع فقط)
 * @param {ExportMessage['options']} [options] - خيارات التصدير
 * @returns {Promise<ExportResult>} نتيجة التصدير مع Blob
 * @description يُنشئ ملف CSV مع التعامل الصحيح مع الفواصل والعلامات
 * @example
 * // استخدام داخلي من معالج الرسائل
 * const result = await exportToCSV('123', students, 'report', {
 *   headers: ['الاسم', 'المعرف']
 * });
 */
async function exportToCSV(
  id: string,
  data: Array<Record<string, unknown>>,
  filename: string,
  options?: ExportMessage['options']
): Promise<ExportResult> {
  if (data.length === 0) {
    return {
      id,
      success: false,
      error: 'No data to export'
    };
  }
  
  const headers = options?.headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const val = row[header];
        // Escape values with commas or quotes
        const stringVal = String(val ?? '');
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      }).join(',')
    )
  ];
  
  const csvContent = csvRows.join('\n');
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  return {
    id,
    success: true,
    blob: csvBlob
  };
}

// Export for TypeScript
export {};
