import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PersianShaper } from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();
const reshape = PersianShaper.convertArabic;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @function processArabicText
 * @description معالجة النصوص العربية للعرض الصحيح في PDF
 * يعتمد على jsPDF AutoTable لتوجيه النص تلقائياً
 */
export const processArabicText = (text: string): string => {
  if (!text) return '';
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  
  // إعادة تشكيل الحروف العربية (Reshaping)
  const reshaped = reshape(text);
  
  // إرجاع النص كما هو لأن jsPDF مع خطوط RTL يتعامل مع الاتجاه تلقائياً
  return reshaped;
};

/**
 * @function fixArabicForPDF
 * @description إصلاح النص العربي لـ PDF - يستخدم فقط عند الحاجة لإعادة الترتيب اليدوي
 */
export const fixArabicForPDF = (text: string): string => {
  if (!text) return '';
  if (!/[\u0600-\u06FF]/.test(text)) return text;
  
  const reshaped = reshape(text);
  
  return bidi.getInlineJoinLevel(reshaped) === 0 ? reshaped : bidi.getVisuallyOrdered(reshaped);
};
