/**
 * @file csrf.ts
 * @description حماية CSRF - توليد والتحقق من CSRF Tokens
 */

import { logger } from '@/lib/logger';

/**
 * اسم مفتاح CSRF في localStorage
 */
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_META_NAME = 'csrf-token';

/**
 * تخزين CSRF Token في Meta Tag
 */
export function setCSRFTokenMeta(token: string): void {
  const meta = document.querySelector(`meta[name="${CSRF_META_NAME}"]`);
  
  if (meta) {
    (meta as HTMLMetaElement).content = token;
    logger.info('CSRF token set in meta', { token: token.substring(0, 10) + '...' });
  } else {
    logger.warn('CSRF meta tag not found');
  }
}

/**
 * الحصول على CSRF Token من Meta Tag
 */
export function getCSRFTokenFromMeta(): string | null {
  const meta = document.querySelector(`meta[name="${CSRF_META_NAME}"]`);
  
  if (meta) {
    return (meta as HTMLMetaElement).content;
  }
  
  return null;
}

/**
 * تخزين CSRF Token في localStorage (للمصادقة فقط)
 */
export function setCSRFToken(token: string): void {
  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
    logger.info('CSRF token stored', { token: token.substring(0, 10) + '...' });
  } catch (error) {
    logger.error('Failed to store CSRF token', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * الحصول على CSRF Token من localStorage
 */
export function getCSRFToken(): string | null {
  try {
    return localStorage.getItem(CSRF_TOKEN_KEY);
  } catch (error) {
    logger.error('Failed to get CSRF token', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * حذف CSRF Token
 */
export function clearCSRFToken(): void {
  try {
    localStorage.removeItem(CSRF_TOKEN_KEY);
    logger.info('CSRF token cleared');
  } catch (error) {
    logger.error('Failed to clear CSRF token', { error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * توليد CSRF Token جديد
 * @param length - طول التوكن (افتراضي 32)
 */
export function generateCSRFToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * التحقق من صحة CSRF Token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  
  return token === expectedToken;
}

/**
 * إضافة CSRF Token إلى جميع الطلبات
 */
export function addCSRFToHeaders(headers: HeadersInit): HeadersInit {
  const token = getCSRFToken();
  
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    } as HeadersInit;
  }
  
  return headers;
}

/**
 * جلب CSRF Token جديد من الخادم (محاكاة)
 */
export async function fetchCSRFToken(): Promise<string> {
  try {
    // في الواقع، هذا سيجلب من الخادم
    // هنا نُنشئ توكن وهمي
    const token = generateCSRFToken();
    
    setCSRFTokenMeta(token);
    setCSRFToken(token);
    
    logger.info('CSRF token fetched', { token: token.substring(0, 10) + '...' });
    
    return token;
  } catch (error) {
    logger.error('Failed to fetch CSRF token', { error: error instanceof Error ? error.message : String(error) });
    
    // إرجاع توكن وهمي في حالة الفشل
    return generateCSRFToken();
  }
}

/**
 * التحقق من CSRF Token في الطلبات
 */
export function verifyCSRFToken(request: Request): boolean {
  const token = request.headers.get('X-CSRF-Token');
  
  if (!token) {
    return false;
  }
  
  const storedToken = getCSRFToken();
  
  return validateCSRFToken(token, storedToken || '');
}

/**
 * إضافة CSRF Token إلى FormData
 */
export function addCSRFToFormData(formData: FormData): void {
  const token = getCSRFToken();
  
  if (token) {
    formData.append('_csrf_token', token);
  }
}

/**
 * إضافة CSRF Token إلى URLs (Query Parameters)
 */
export function addCSRFToUrl(url: string, token: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_csrf_token=${encodeURIComponent(token)}`;
}
