import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { CAIRO_FONT_BASE64, getCairoFont, isFontLoaded } from '@/lib/fonts';
import { processArabicText } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { DataTableColumn } from './types';

export function useDataTableExport<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  visibleColumns: Set<string>,
  systemSettings?: { universityName?: string },
  primaryColor?: string
) {
  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
    const headers = visibleCols.map(col => col.title).join(',');
    
    const rows = data.map(item => 
      visibleCols.map(col => {
        const val = (item as any)[col.key];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
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
    
    XLSX.writeFile(workbook, `export_${new Date().getTime()}.xlsx`);
  };

  const exportToPDF = async () => {
    if (data.length === 0) return;

    try {
      const doc = new jsPDF({ 
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        putOnlyUsedFonts: true
      });
      
      const universityName = systemSettings?.universityName || 'الجامعة الافتراضية';
      const primaryColorRGB = primaryColor || '30, 58, 138';
      const colorParts = primaryColorRGB.split(/[\s,/]+/).map(Number).filter(n => !isNaN(n));
      const headerColor: [number, number, number] = colorParts.length >= 3 
        ? [colorParts[0], colorParts[1], colorParts[2]] 
        : [30, 58, 138];
      
      let fontRegistered = false;
      let fontData = CAIRO_FONT_BASE64;
      
      if (!fontData && isFontLoaded()) {
        fontData = await getCairoFont();
      }
      
      if (fontData && fontData.length > 1000) {
        try {
          doc.addFileToVFS('Cairo-Regular.ttf', fontData);
          doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
          doc.setFont('Cairo');
          fontRegistered = true;
        } catch (fontError) {
          logger.warn('Could not register Cairo font, using fallback');
        }
      }

      const visibleCols = columns.filter(col => visibleColumns.has(String(col.key)) && !col.hidden);
      const headers = visibleCols.map(col => processArabicText(col.title));
      
      const body = data.map(item => 
        visibleCols.map(col => {
          const val = (item as any)[col.key];
          if (typeof val === 'string') {
            return processArabicText(val);
          }
          return String(val ?? '-');
        })
      );

      doc.setFillColor(...headerColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'bold');
      doc.text(processArabicText(universityName), 105, 12, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont(fontRegistered ? 'Cairo' : 'helvetica', 'normal');
      doc.text(processArabicText('نظام إدارة الجامعة المتكامل'), 105, 20, { align: 'center' });

      doc.setFillColor(245, 247, 250);
      doc.rect(0, 30, 210, 10, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(format(new Date(), 'PPP', { locale: ar }), 195, 37, { align: 'left' });

      const tableStartY = 45;

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: tableStartY,
        styles: { 
          font: fontRegistered ? 'Cairo' : 'helvetica',
          halign: 'center',
          fontSize: 8,
          cellPadding: 4,
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
          minCellHeight: 7
        },
        headStyles: { 
          fillColor: headerColor as [number, number, number], 
          textColor: [255, 255, 255] as [number, number, number],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          cellPadding: 5
        },
        bodyStyles: {
          halign: 'right',
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: tableStartY, right: 14, bottom: 25, left: 14 },
        didDrawPage: (data) => {
          doc.setFillColor(245, 247, 250);
          doc.rect(0, 277, 210, 17, 'F');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            processArabicText(`صفحة ${data.pageNumber} - ${universityName}`), 
            105, 
            285, 
            { align: 'center' }
          );
          doc.text(
            processArabicText('تم إنشاء هذا التقرير آلياً'), 
            105, 
            290, 
            { align: 'center' }
          );
        }
      });

      doc.save(`${processArabicText(universityName)}_تقرير_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      logger.error('Error exporting PDF:', error);
      toast.error('حدث خطأ أثناء تصدير PDF');
    }
  };

  return { exportToCSV, exportToExcel, exportToPDF };
}
