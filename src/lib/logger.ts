/**
 * @file logger.ts
 * @description نظام تسجيل احترافي - يمنع تسريب البيانات الحساسة
 */

import { sentry } from './sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * كلمات حساسة يجب إخفاؤها
 */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'creditCard',
  'ssn',
  'email',
  'phone',
];

/**
 * تنظيف البيانات الحساسة
 */
function sanitizeData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * نظام التسجيل الرئيسي
 */
class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() { }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? sanitizeData(context) as Record<string, unknown> : undefined,
    };

    this.logs.push(entry);

    // الحفاظ على حجم الذاكرة
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // في التطوير فقط، نستخدم console
    if (import.meta.env.DEV) {
      const prefix = `[${level.toUpperCase()}]`;
      switch (level) {
        case 'debug':
          console.debug(prefix, message, entry.context);
          break;
        case 'info':
          console.info(prefix, message, entry.context);
          break;
        case 'warn':
          console.warn(prefix, message, entry.context);
          break;
        case 'error':
          console.error(prefix, message, entry.context);
          break;
      }
    }

    if (import.meta.env.PROD && level === 'error') {
      sentry.captureException(new Error(message), {
        ...entry.context,
        logLevel: level,
        timestamp: entry.timestamp,
      });
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
    if (sentry.isEnabled()) {
      sentry.captureMessage(message, 'error', context);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();
