import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getCairoFont } from '@/lib/fonts';
import { processArabicText } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { DataTableColumn } from '@/components/data-table/types';

/**
 * إعدادات تصدير البيانات
 */
export interface ExportOptions {
  fileName?: string;
  universityName?: string;
  reportHeaderSubtitle?: string;
  reportFooterText?: string;
  primaryColor?: string;
}

/**
 * تصدير البيانات إلى ملف CSV
 */
export const exportToCSV = <T>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  fileName: string = 'export'
) => {
  if (data.length === 0) return;

  const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
  const headers = visibleCols.map(col => col.title).join(',');

  const rows = data.map(item =>
    visibleCols.map(col => {
      const val = (item as Record<string, unknown>)[col.key as string];
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * تصدير البيانات إلى ملف Excel
 */
export const exportToExcel = <T>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  fileName: string = 'export'
) => {
  if (data.length === 0) return;

  const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
  const exportData = data.map(item => {
    const row: Record<string, string | number> = {};
    visibleCols.forEach(col => {
      row[col.title] = (item as Record<string, string | number>)[col.key as string];
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  worksheet['!dir'] = 'rtl';

  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cell_address]) continue;
      if (!worksheet[cell_address].s) worksheet[cell_address].s = {};

      worksheet[cell_address].s.alignment = {
        horizontal: 'right',
        readingOrder: 2
      };
    }
  }

  XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};

/**
 * تصدير البيانات إلى ملف PDF
 */
export const exportToPDF = async <T>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  options?: ExportOptions
) => {
  if (data.length === 0) return;

  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      filters: ['ASCIIHexEncode']
    });

    const universityName = options?.universityName || 'جامعة العرب';
    const primaryColorRGB = options?.primaryColor || '30, 58, 138';
    const colorParts = primaryColorRGB.split(/[\s,/]+/).map(Number).filter(n => !isNaN(n));
    const headerColor: [number, number, number] = colorParts.length >= 3
      ? [colorParts[0], colorParts[1], colorParts[2]]
      : [30, 58, 138];

    let fontRegistered = false;
    try {
      const fontData = await getCairoFont();

      if (fontData && fontData.length > 1000) {
        try {
          // Ensure clean base64 without data URI prefix
          const cleanBase64 = fontData.includes(',') ? fontData.split(',')[1] : fontData;
          doc.addFileToVFS('Cairo-Regular.ttf', cleanBase64);
          doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
          doc.setFont('Cairo', 'normal');
          fontRegistered = true;
          logger.info('Cairo font registered successfully in PDF');
        } catch (fontError) {
          logger.warn('Could not register Cairo font, using fallback', fontError);
        }
      } else {
        logger.warn('Cairo font data is too short or empty');
      }
    } catch (fontFetchError) {
      logger.warn('Failed to fetch Cairo font', fontFetchError);
    }

    const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
    const headers = visibleCols.map(col => processArabicText(col.title));

    const body = data.map(item =>
      visibleCols.map(col => {
        const val = (item as Record<string, unknown>)[col.key as string];
        if (typeof val === 'string') {
          return processArabicText(val);
        }
        return String(val ?? '-');
      })
    );

    // Header background
    doc.setFillColor(...headerColor);
    doc.rect(0, 0, 210, 30, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'bold');

    const headerTitle = universityName;
    doc.text(processArabicText(headerTitle, { visualOrder: true }), 105, 12, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'normal');
    const headerSubtitle = options?.reportHeaderSubtitle || 'نظام إدارة الجامعة المتكامل';
    doc.text(processArabicText(headerSubtitle, { visualOrder: true }), 105, 20, { align: 'center' });

    // Date bar
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 30, 210, 10, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    const dateString = format(new Date(), 'PPP', { locale: ar });
    doc.text(processArabicText(dateString, { visualOrder: true }), 195, 37, { align: 'left' });

    const tableStartY = 45;

    autoTable(doc, {
      head: [headers],
      body: body,
      startY: tableStartY,
      theme: 'striped',
      styles: {
        font: fontRegistered ? 'Cairo' : 'helvetica',
        halign: 'right',
        fontSize: 10,
        cellPadding: 5,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
      },
      columnStyles: {},
      alternateRowStyles: {
        fillColor: [250, 252, 255]
      },
      margin: { top: tableStartY, right: 14, bottom: 25, left: 14 },
      didDrawPage: (drawData) => {
        // Footer background
        doc.setFillColor(245, 247, 250);
        doc.rect(0, 277, 210, 17, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'normal');

        const footerMain = `صفحة ${drawData.pageNumber} - ${universityName}`;
        doc.text(
          processArabicText(footerMain, { visualOrder: true }),
          105,
          285,
          { align: 'center' }
        );

        const footerSub = options?.reportFooterText || 'تم إنشاء هذا التقرير آلياً';
        doc.text(
          processArabicText(footerSub, { visualOrder: true }),
          105,
          290,
          { align: 'center' }
        );
      }
    });

    const safeUniversityName = universityName.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '_');
    const fileName = options?.fileName || safeUniversityName;
    doc.save(`${fileName}_تقرير_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    logger.error('Error exporting PDF:', error);
    throw error;
  }
};
