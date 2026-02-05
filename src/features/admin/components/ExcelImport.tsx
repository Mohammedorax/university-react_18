import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { logger } from '@/lib/logger';
import * as XLSX from 'xlsx';

interface ExcelImportProps {
  onImport?: (data: Record<string, any>[]) => void;
  allowedTypes?: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

/**
 * Excel Import Feature
 * استيراد البيانات من ملفات Excel
 */
export function ExcelImport({ onImport, allowedTypes = ['xlsx', 'xls', 'csv'] }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [validations, setValidations] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension && allowedTypes.includes(extension)) {
        setFile(selectedFile);
        setError(null);
        setValidations([]);
        parseFile(selectedFile);
      } else {
        setError(`نوع الملف غير مدعوم. الرجاء اختيار ملف: ${allowedTypes.join(', ')}`);
      }
    }
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        setPreviewData(jsonData.slice(0, 10));
        validateData(jsonData);
        setIsProcessing(false);
        logger.info(`تم قراءة ملف Excel: ${jsonData.length} صفوف`);
      } catch (err) {
        setError('حدث خطأ أثناء قراءة الملف');
        setIsProcessing(false);
        logger.error('Excel parse error:', err);
      }
    };

    reader.onerror = () => {
      setError('حدث خطأ أثناء قراءة الملف');
      setIsProcessing(false);
      logger.error('FileReader error');
    };

    reader.readAsBinaryString(file);
  };

  const validateData = (data: Record<string, any>[]) => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      if (!row.name && !row.id) {
        errors.push({
          row: index + 1,
          field: 'general',
          message: 'الصف يجب أن يحتوي على معرف أو اسم'
        });
      }
    });

    setValidations(errors);
  };

  const handleImport = () => {
    if (previewData.length > 0 && validations.length === 0) {
      onImport?.(previewData);
      setFile(null);
      setPreviewData([]);
      setValidations([]);
      logger.info(`تم استيراد ${previewData.length} صفوف من Excel`);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        id: '1',
        name: 'مثال الطالب',
        email: 'student@example.com',
        phone: '05xxxxxxxx',
        grade: 'أولى'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب');
    XLSX.writeFile(wb, 'template.xlsx');
    logger.info('تم تنزيل قالب Excel');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5" />
        استيراد من Excel
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>اختر ملف Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>تحميل القالب</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            جاري معالجة الملف...
          </div>
        )}

        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-800">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>
                تم قراءة الملف بنجاح. {previewData.length} صفوف جاهزة للاستيراد
              </span>
            </div>

            {validations.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  تنبيهات التحقق ({validations.length})
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {validations.slice(0, 5).map((v, i) => (
                    <li key={i}>
                      الصف {v.row} - {v.message}
                    </li>
                  ))}
                  {validations.length > 5 && (
                    <li className="text-yellow-600">
                      و {validations.length - 5} تنبيهات أخرى...
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-2 text-right font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-gray-200">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 text-right">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={validations.length > 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              استيراد البيانات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
