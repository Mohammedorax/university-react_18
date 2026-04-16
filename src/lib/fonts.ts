import { logger } from '@/lib/logger';
import { toast } from 'sonner';

/**
 * @file fonts.ts
 * @description إدارة خطوط PDF ودعم اللغة العربية.
 * يوفر هذا الملف دوال لتحميل وتخزين خط Cairo اللازم لدعم اللغة العربية في ملفات PDF.
 * 
 * يتم تحميل الخط محلياً من المسار العام /fonts/Cairo-Regular.ttf لتجنب مشاكل الشبكة
 * ودعم عرض النصوص العربية في ملفات PDF المصدرة.
 */

// المسار المحلي للخط (الأولوية الأولى)
const CAIRO_FONT_LOCAL = '/fonts/Cairo-Regular.ttf';

// رابط الخط الاحتياطي (يُستخدم فقط إذا فشل التحميل المحلي)
const CAIRO_FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo-Regular.ttf';

// قيمة احتياطية للخط (سلسلة فارغة حالياً، يمكن تعبئتها ببيانات base64 فعلية للطوارئ)
export const CAIRO_FONT_BASE64: string = '';

// تخزين مؤقت للخط لتجنب إعادة التحميل المتكرر
let fontCache: string | null = null;

/**
 * تحويل Blob إلى Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed to read font blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * دالة لتحميل خط Cairo وتحويله إلى صيغة Base64.
 * تستخدم هذه الدالة التخزين المؤقت (Caching) لتحسين الأداء.
 * تُحمّل الخط محلياً أولاً، ثم تستخدم الرابط الاحتياطي عند الفشل.
 * 
 * @returns {Promise<string>} سلسلة Base64 للخط، أو سلسلة فارغة في حال الفشل.
 */
export async function getCairoFont(): Promise<string> {
  // إرجاع الخط من الذاكرة المؤقتة إذا كان موجوداً
  if (fontCache) return fontCache;

  // محاولة التحميل من المسار المحلي أولاً
  try {
    const response = await fetch(CAIRO_FONT_LOCAL);

    if (!response.ok) {
      throw new Error(`Local font download failed with status: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    if (base64 && base64.length > 1000) {
      fontCache = base64;
      logger.info('Cairo font loaded successfully from local path');
      return base64;
    }
  } catch (error) {
    logger.warn('Failed to load Cairo font from local path, trying fallback URL', error);
  }

  // محاولة التحميل من الرابط الاحتياطي
  try {
    const response = await fetch(CAIRO_FONT_URL);

    if (!response.ok) {
      throw new Error(`Font download failed with status: ${response.status}`);
    }

    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    if (base64 && base64.length > 1000) {
      fontCache = base64;
      logger.info('Cairo font loaded successfully from fallback URL');
      return base64;
    }
  } catch (error) {
    logger.warn('Failed to load Cairo font from fallback URL', error);
  }

  // محاولة استخدام الخط الاحتياطي إذا كان متوفراً
  if (CAIRO_FONT_BASE64 && CAIRO_FONT_BASE64.length > 100) {
    fontCache = CAIRO_FONT_BASE64;
    return CAIRO_FONT_BASE64;
  }

  // Notify user that Arabic text may not render correctly in PDFs
  toast.warning('خطأ في تحميل الخط', {
    description: 'فشل تحميل خط Cairo. قد لا تظهر النصوص العربية بشكل صحيح في ملفات PDF.',
    duration: 8000,
  });

  return '';
}

/**
 * التحقق مما إذا كان الخط قد تم تحميله بنجاح.
 * 
 * @returns {boolean} true إذا كان الخط متوفراً في الذاكرة أو كثابت احتياطي.
 */
export function isFontLoaded(): boolean {
  return fontCache !== null || (typeof CAIRO_FONT_BASE64 === 'string' && CAIRO_FONT_BASE64.length > 100);
}

/**
 * مسح الذاكرة المؤقتة للخط.
 * مفيد في حالات إدارة الذاكرة أو عند الرغبة في إعادة تحميل الخط.
 */
export function clearFontCache(): void {
  fontCache = null;
}
