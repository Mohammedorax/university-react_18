/**
 * @file security.ts
 * @description أدوات الأمان - تطهير المدخلات وحماية XSS
 */

import DOMPurify from 'dompurify';

/**
 * CSRF Token storage and management
 */
const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_EXPIRY = 3600000; // 1 hour

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
  const maskedSuffix = localPart.length === 1
    ? '***'
    : '*'.repeat(Math.max(localPart.length - 1, 1));
  const maskedLocal = localPart.charAt(0) + maskedSuffix;
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
  const hasLowercase = /[a-z]/.test(password);

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

  if (!hasLowercase) {
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
    feedback.push('يجب إضافة رمز خاص');
  }

  return {
    isValid: score >= 4 && hasLowercase,
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
    .replace(/<[^>]*>/g, '')
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

const PASSWORD_HASH_PREFIX = 'pbkdf2';
const PASSWORD_HASH_ITERATIONS = 120_000;
const SALT_LENGTH_BYTES = 16;
const DERIVED_KEY_LENGTH_BYTES = 32;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex input');
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Password hashing (client-side mock/demo only).
 * Uses PBKDF2 + random salt instead of raw SHA-256 to avoid trivial brute-force attacks.
 * Production authentication must always hash and verify on the server.
 */
export async function hashPassword(password: string): Promise<string> {
  const subtle = crypto?.subtle;
  if (!subtle?.importKey) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
    const encoder = new TextEncoder();
    const payload = new Uint8Array([...salt, ...encoder.encode(password)]);
    const hashBuffer = await crypto.subtle.digest('SHA-256', payload);
    const hash = bytesToHex(new Uint8Array(hashBuffer));
    return `${PASSWORD_HASH_PREFIX}$1$${bytesToHex(salt)}$${hash}`;
  }

  const encoder = new TextEncoder();
  const passwordKey = await subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const derivedBits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_HASH_ITERATIONS,
    },
    passwordKey,
    DERIVED_KEY_LENGTH_BYTES * 8
  );

  const hash = bytesToHex(new Uint8Array(derivedBits));
  const saltHex = bytesToHex(salt);
  return `${PASSWORD_HASH_PREFIX}$${PASSWORD_HASH_ITERATIONS}$${saltHex}$${hash}`;
}

/**
 * Verify a password against a hash (client-side mock/demo only).
 * Supports both legacy SHA-256 hex hashes and the new PBKDF2 format.
 * @param password - The plain text password to verify
 * @param hashedPassword - The stored hash to compare against
 * @returns true if the password matches the hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const parts = hashedPassword.split('$');
  if (parts.length === 4 && parts[0] === PASSWORD_HASH_PREFIX) {
    const [, iterationsRaw, saltHex, expectedHash] = parts;
    const iterations = Number.parseInt(iterationsRaw, 10);

    if (!Number.isFinite(iterations) || iterations <= 0) {
      return false;
    }

    try {
      let hash: string;
      const subtle = crypto?.subtle;
      if (!subtle?.importKey || iterations === 1) {
        const encoder = new TextEncoder();
        const salt = hexToBytes(saltHex);
        const payload = new Uint8Array([...salt, ...encoder.encode(password)]);
        const hashBuffer = await crypto.subtle.digest('SHA-256', payload);
        hash = bytesToHex(new Uint8Array(hashBuffer));
      } else {
        const encoder = new TextEncoder();
        const passwordKey = await subtle.importKey(
          'raw',
          encoder.encode(password),
          { name: 'PBKDF2' },
          false,
          ['deriveBits']
        );

        const derivedBits = await subtle.deriveBits(
          {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: hexToBytes(saltHex),
            iterations,
          },
          passwordKey,
          DERIVED_KEY_LENGTH_BYTES * 8
        );

        hash = bytesToHex(new Uint8Array(derivedBits));
      }
      return hash === expectedHash;
    } catch {
      return false;
    }
  }

  // Legacy fallback for previously stored SHA-256 hashes.
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const legacyHash = bytesToHex(new Uint8Array(hashBuffer));
  return legacyHash === hashedPassword;
}

/**
 * إنشاء وتخزين توكن CSRF جديد
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = btoa(String.fromCharCode(...array));
  
  sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify({
    token,
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY
  }));
  
  return token;
}

/**
 * الحصول على توكن CSRF الحالي أو إنشاء جديد
 */
export function getCSRFToken(): string {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (stored) {
    try {
      const { token, expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) {
        return token;
      }
    } catch {
      // Invalid stored token
    }
  }
  
  return generateCSRFToken();
}

/**
 * التحقق من صحة توكن CSRF
 */
export function validateCSRFToken(token: string): boolean {
  const stored = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (!stored) return false;
  
  try {
    const { token: storedToken, expiresAt } = JSON.parse(stored);
    return Date.now() < expiresAt && storedToken === token;
  } catch {
    return false;
  }
}

/**
 * إزالة توكن CSRF
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

/**
 * تطهير متقدم ضد XSS مع إيقاف جميع الأحداث
 */
export function strictSanitizeHTML(dirty: string): string {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['on*', 'src', 'href', 'style', 'class', 'id', 'name'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    SAFE_FOR_TEMPLATES: false
  });
}

/**
 * حماية المدخلات من محاولات الحقن SQL و NoSQL
 */
export function sanitizeForDatabase(input: string): string {
  if (!input) return '';

  // Do not strip SQL-significant/user-significant characters on the client.
  // Real SQL injection protection must be handled via parameterized queries on the server.
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/\u0000/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * التحقق من وجود محاولات حقن في النص
 */
export function detectInjectionAttempt(text: string): boolean {
  const injectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /('\s*OR\s*'?1'?\s*=\s*'?1)/i,
    /(<script|javascript:|vbscript:)/i,
    /(--|#|\/\*)/,
    /(\$\{|\{\{)/
  ];
  
  return injectionPatterns.some(pattern => pattern.test(text));
}
