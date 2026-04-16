import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersianShaper } from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

// تهيئة مكتبة bidi-js مرة واحدة
const bidi = bidiFactory();
// تهيئة دالة التشكيل (Reshaping)
const reshape = PersianShaper.convertArabic;

/**
 * دالة لدمج فئات CSS باستخدام clsx و tailwind-merge.
 * مفيدة جداً عند استخدام Tailwind CSS لضمان عدم تضارب الفئات.
 * 
 * @param inputs - قائمة الفئات المراد دمجها
 * @returns {string} سلسلة نصية تحتوي على الفئات المدمجة
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ذاكرة مؤقتة بسيطة لتخزين نتائج معالجة النصوص العربية
// هذا يحسن الأداء عند تكرار نفس النص في الجداول
const textCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * معالجة النصوص العربية للعرض الصحيح في ملفات PDF.
 * تقوم هذه الدالة بإعادة تشكيل الحروف العربية (Reshaping) وترتيبها (Bidi) إذا لزم الأمر.
 * تستخدم التخزين المؤقت (Caching) لتحسين الأداء.
 * 
 * @param {string} text - النص المراد معالجته
 * @param {Object} options - خيارات إضافية
 * @param {boolean} [options.visualOrder] - هل يجب إعادة ترتيب النص بصرياً (للمكتبات التي لا تدعم Bidi تلقائياً)
 * @returns {string} النص المعالج
 */
export const processArabicText = (text: string, options?: { visualOrder?: boolean }): string => {
  if (!text) return '';
  
  // التحقق مما إذا كان النص يحتوي على حروف عربية لتجنب المعالجة غير الضرورية
  // النطاق \u0600-\u06FF يغطي معظم الحروف العربية
  if (!/[\u0600-\u06FF]/.test(text)) return text;

  // إنشاء مفتاح للكاش يتضمن النص والخيارات
  const cacheKey = `${text}_${options?.visualOrder ? 'v' : 'n'}`;
  
  if (textCache.has(cacheKey)) {
    return textCache.get(cacheKey)!;
  }

  // إعادة تشكيل الحروف (تحويل الحروف المنفصلة إلى متصلة حسب السياق)
  const reshaped = reshape(text);
  let result = reshaped;

  // الترتيب البصري (Visual Ordering) - مفيد لـ jsPDF عندما لا نستخدم autoTable
  if (options?.visualOrder) {
    result = bidi.getVisuallyOrdered(reshaped);
  }

  // إدارة حجم الكاش لتجنب استهلاك الذاكرة
  // استخدام استراتيجية LRU مبسطة: حذف أقدم 50% من الإدخالات بدلاً من مسح الكل
  if (textCache.size >= MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(textCache.keys()).slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    keysToDelete.forEach(key => textCache.delete(key));
  }
  
  textCache.set(cacheKey, result);

  return result;
};

/**
 * إصلاح النص العربي لـ PDF - نسخة مبسطة للحالات الخاصة.
 * يستخدم هذا التابع للتحقق مما إذا كان النص يحتاج إلى ترتيب بصري إجباري.
 * 
 * @param {string} text - النص المراد معالجته
 * @returns {string} النص المعالج
 */
export const fixArabicForPDF = (text: string): string => {
  if (!text) return '';
  if (!/[\u0600-\u06FF]/.test(text)) return text;

  const reshaped = reshape(text);

  // التحقق من مستوى الدمج لتحديد ما إذا كان يجب تطبيق الترتيب البصري
  return bidi.getInlineJoinLevel(reshaped) === 0 ? reshaped : bidi.getVisuallyOrdered(reshaped);
};
