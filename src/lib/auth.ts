/**
 * @file auth.ts
 * @description نظام المصادقة الآمن - تشفير كلمات المرور + JWT + Rate Limiting
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/store/slices/authSlice';
import { logger } from '@/lib/logger';

/**
 * مفتاح JWT السري (يجب أن يكون من البيئة)
 */
const JWT_SECRET = process.env.VITE_JWT_SECRET || 'university-secret-key-change-in-production';
const JWT_EXPIRY = '24h'; // انتهاء التوكن بعد 24 ساعة

/**
 * عدد كلمات المرور لتشفير bcrypt
 */
const SALT_ROUNDS = 12;

/**
 * تخزين محاولات تسجيل الدخول للـ Rate Limiting
 */
interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

/**
 * تحقق من صحة كلمة المرور
 * @param password - كلمة المرور الواردة
 * @param hashedPassword - كلمة المرور المشفرة من قاعدة البيانات
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    logger.error('Password verification failed', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * تشفير كلمة المرور
 * @param password - كلمة المرور الواردة
 * @returns كلمة المرور المشفرة
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    logger.error('Password hashing failed', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('فشل تشفير كلمة المرور');
  }
}

/**
 * التحقق من قوة كلمة المرور
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  score: number;
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
    feedback.push('يجب إضافة حرف كبير (A-Z)');
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة حرف صغير (a-z)');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('يجب إضافة رقم (0-9)');
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
 * إنشاء JWT Token مع توقيع
 */
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });

  logger.info('JWT token created', { userId: user.id, role: user.role });
  
  return token;
}

/**
 * التحقق من JWT Token
 */
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    
    logger.info('JWT token verified', { userId: decoded.id, role: decoded.role });
    
    return decoded;
  } catch (error) {
    logger.error('JWT verification failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * التحقق من انتهاء التوكن
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    
    if (!decoded.exp) {
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    logger.error('Token expiration check failed', { error: error instanceof Error ? error.message : String(error) });
    return true; // إذا فشل التحقق، افترض أنه منتهي
  }
}

/**
 * التحقق من Rate Limiting
 */
export function checkRateLimit(email: string): { canLogin: boolean; remainingAttempts?: number } {
  const now = Date.now();
  const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 دقيقة
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 دقيقة حظر

  const attempts = loginAttempts.get(email);

  if (!attempts) {
    // أول محاولة
    loginAttempts.set(email, {
      count: 1,
      lastAttempt: now,
    });
    return { canLogin: true };
  }

  // التحقق من انتهاء فترة الحظر
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    // إعادة تعيين المحاولات
    loginAttempts.set(email, {
      count: 1,
      lastAttempt: now,
    });
    return { canLogin: true };
  }

  // الحساب محظور
  if (now - attempts.lastAttempt < LOCKOUT_DURATION) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 60000); // بالدقائق
    
    return {
      canLogin: false,
      remainingAttempts: remainingTime,
    };
  }

  // التحقق من عدد المحاولات في النافذة
  if (now - attempts.lastAttempt < ATTEMPT_WINDOW) {
    if (attempts.count >= MAX_ATTEMPTS) {
      const remainingTime = Math.ceil((ATTEMPT_WINDOW - (now - attempts.lastAttempt)) / 60000);
      
      return {
        canLogin: false,
        remainingAttempts: remainingTime,
      };
    }

    // إضافة محاولة جديدة
    loginAttempts.set(email, {
      count: attempts.count + 1,
      lastAttempt: now,
    });

    return { canLogin: true };
  }

  // إعادة تعيين المحاولات إذا انتهت النافذة
  loginAttempts.set(email, {
    count: 1,
    lastAttempt: now,
  });

  return { canLogin: true };
}

/**
 * تنظيف محاولات تسجيل الدخول الناجحة
 */
export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
  logger.info('Login attempts cleared', { email });
}

/**
 * التحقق من قوة كلمة المرور
 */
export function getPasswordRequirements(): {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
} {
  return {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  };
}
