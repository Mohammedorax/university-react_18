/**
 * @file security.ts
 * @description أدوات الأمان - تطهير المدخلات وحماية XSS
 */

import DOMPurify from 'dompurify';

/**
 * خيارات التطهير الافتراضية
 */
const DEFAULT_PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  KEEP_CONTENT: true,
};

/**
 * تطهير نص HTML من scripts و tags خطرة
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, DEFAULT_PURIFY_CONFIG);
}

/**
 * تطهير نص عادي (إزالة جميع tags)
 */
export function sanitizeText(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف السعودي
 */
export function isValidSaudiPhone(phone: string): boolean {
  const phoneRegex = /^(05|5)\d{8}$/;
  return phoneRegex.test(phone);
}

/**
 * التحقق من صحة الرقم الجامعي
 */
export function isValidUniversityId(id: string): boolean {
  const idRegex = /^\d{8}$/;
  return idRegex.test(id);
}

/**
 * إخفاء جزء من البريد الإلكتروني
 * مثال: a***@example.com
 */
export function maskEmail(email: string): string {
  if (!isValidEmail(email)) return email;
  
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

/**
 * إخفاء جزء من رقم الهاتف
 * مثال: 05*****123
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 10) return phone;
  
  return phone.slice(0, 2) + '*'.repeat(5) + phone.slice(-3);
}

/**
 * التحقق من قوة كلمة المرور
 * يجب أن تحتوي على:
 * - 8 أحرف على الأقل
 * - حرف كبير
 * - حرف صغير
 * - رقم
 * - رمز خاص
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة حرف كبير');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة حرف صغير');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة رقم');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة رمز خاص (!@#$%^&*)');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

/**
 * تطهير كائن كامل (object)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * التحقق من وجود كود JavaScript خطر في النص
 */
export function containsDangerousContent(text: string): boolean {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onload, onclick, etc.
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return dangerousPatterns.some(pattern => pattern.test(text));
}

/**
 * إنشاء CSP (Content Security Policy) nonce
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * التحقق من صحة URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من أن URL آمن (لا يحتوي على javascript:)
 */
export function isSafeURL(url: string): boolean {
  if (!url) return true;
  
  const lowerUrl = url.toLowerCase().trim();
  
  // رفض javascript: protocol
  if (lowerUrl.startsWith('javascript:')) {
    return false;
  }
  
  // رفض data: protocol للـ HTML
  if (lowerUrl.startsWith('data:text/html')) {
    return false;
  }
  
  return true;
}

/**
 * تطهير اسم الملف
 */
export function sanitizeFilename(filename: string): string {
  // إزالة الأحرف الخطرة
  const dangerousChars = '<>:"/\\\\|?*';
  return filename
    .replace(new RegExp(`[${dangerousChars}]`, 'g'), '')
    .replace(/\.\./g, '')
    .trim();
}

/**
 * التحقق من نوع الملف المسموح به
 */
export function isAllowedFileType(
  filename: string,
  allowedExtensions: string[] = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * التحقق من حجم الملف
 */
export function isAllowedFileSize(
  sizeInBytes: number,
  maxSizeInMB: number = 10
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}
