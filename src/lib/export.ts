import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { logger } from '@/lib/logger';

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';
export type ExportOptions = {
  data: Record<string, unknown>[];
  filename?: string;
  format: ExportFormat;
  title?: string;
  sheetName?: string;
  columns?: { key: string; header: string }[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
};

export async function exportData(options: ExportOptions): Promise<void> {
  const { data, format, filename, title, sheetName, onProgress, onComplete } = options;

  try {
    onProgress?.(10);

    switch (format) {
      case 'excel':
        exportToExcel(data, filename, sheetName, title, onProgress);
        break;
      case 'pdf':
        exportToPDF(data, filename, title, onProgress);
        break;
      case 'csv':
        exportToCSV(data, filename, onProgress);
        break;
      case 'json':
        exportToJSON(data, filename, onProgress);
        break;
    }

    onProgress?.(100);
    onComplete?.();
  } catch (error) {
    logger.error('Export failed:', error);
    throw error;
  }
}

function exportToExcel<T>(data: T[], filename?: string, sheetName = 'Sheet1', title?: string, onProgress?: (progress: number) => void): void {
  onProgress?.(20);

  const workbook = XLSX.utils.book_new();

  const worksheetData = title ? [title, ...data] : data;

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx' });

  onProgress?.(80);

  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = filename || `export-${Date.now()}.xlsx`;

  saveAs(blob, fileName);
  logger.info('Excel export completed', { filename: fileName, records: data.length });
}

function exportToPDF<T>(data: T[], filename?: string, title?: string, onProgress?: (progress: number) => void): void {
  onProgress?.(20);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const tableData = data.map((item, index) => [
    index + 1,
    ...Object.values(item).map(v => String(v ?? ''))
  ]);

  const columns = ['#', ...Object.keys(data[0] || {})];

  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: title ? 30 : 10,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
    },
  });

  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 15, { align: 'center' });
  }

  onProgress?.(80);

  const blob = doc.output('blob');
  const fileName = filename || `export-${Date.now()}.pdf`;

  saveAs(blob, fileName);
  logger.info('PDF export completed', { filename: fileName, pages: (doc as any).internal?.numberOfPages || 1 });
}

function exportToCSV<T>(data: T[], filename?: string, onProgress?: (progress: number) => void): void {
  onProgress?.(20);

  const headers = Object.keys(data[0] || {});

  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header as keyof T];
        const stringValue = String(value ?? '');
        const needsQuotes = stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"');
        return needsQuotes ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');

  onProgress?.(80);

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const fileName = filename || `export-${Date.now()}.csv`;

  saveAs(blob, fileName);
  logger.info('CSV export completed', { filename: fileName, records: data.length });
}

function exportToJSON<T>(data: T[], filename?: string, onProgress?: (progress: number) => void): void {
  onProgress?.(20);

  const jsonContent = JSON.stringify(data, null, 2);

  onProgress?.(80);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const fileName = filename || `export-${Date.now()}.json`;

  saveAs(blob, fileName);
  logger.info('JSON export completed', { filename: fileName, records: data.length });
}

export function exportWithProgress(options: ExportOptions): { promise: Promise<void>; cancel: () => void } {
  let cancelled = false;

  const promise = new Promise<void>((resolve, reject) => {
    if (cancelled) {
      reject(new Error('Export cancelled'));
      return;
    }

    exportData(options)
      .then(() => {
        if (!cancelled) resolve();
      })
      .catch(reject);
  });

  return {
    promise,
    cancel: () => {
      cancelled = true;
    },
  };
}

export function getExportFilename(baseName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -1);
  return `${baseName}_${timestamp}.${format}`;
}

export function validateExportData<T>(data: T[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('البيانات يجب أن تكون مصفوفة');
    return { valid: false, errors };
  }

  if (data.length === 0) {
    errors.push('البيانات فارغة');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`العنصر ${index + 1} غير صالح`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function estimateExportSize(data: Record<string, unknown>[]): { size: number; formatted: string } {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;

  let formatted: string;
  if (sizeInMB >= 1) {
    formatted = `${sizeInMB.toFixed(2)} MB`;
  } else if (sizeInKB >= 1) {
    formatted = `${sizeInKB.toFixed(2)} KB`;
  } else {
    formatted = `${sizeInBytes} B`;
  }

  return { size: sizeInBytes, formatted };
}
