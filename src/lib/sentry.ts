import * as Sentry from '@sentry/react';
import { logger } from './logger';

/**
 * إعدادات Sentry للتتبع والمراقبة.
 */
type SentryConfig = {
  enabled: boolean;
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
};

/**
 * عميل Sentry لإدارة التتبع والأخطاء.
 */
class SentryClient {
  private config: SentryConfig;
  private isInitialized = false;

  constructor(config: SentryConfig) {
    this.config = {
      enabled: false,
      tracesSampleRate: 0.1,
      ...config
    };
  }

  /**
   * تهيئة عميل Sentry.
   */
  init(): void {
    if (this.isInitialized) {
      logger.warn('Sentry already initialized');
      return;
    }

    if (!this.config.enabled) {
      logger.info('Sentry is disabled');
      return;
    }

    if (!this.config.dsn) {
      logger.error('Sentry DSN not provided');
      return;
    }

    try {
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment || import.meta.env.MODE || 'development',
        release: this.config.release || import.meta.env.VITE_APP_VERSION || '1.0.0',
        tracesSampleRate: this.config.tracesSampleRate || 0.1,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        beforeSend(event) {
          if (event.exception) {
            logger.error('Sentry error captured:', { eventId: event.event_id, message: event.message });
          }
          return event;
        },
      });

      this.isInitialized = true;
      logger.info('Sentry initialized', { environment: this.config.environment });
    } catch (error) {
      logger.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * التقاط استثناء وإرساله إلى Sentry.
   * @param error الخطأ المراد التقاطه
   * @param context معلومات إضافية عن الخطأ
   */
  captureException(error: Error | unknown, context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      logger.error('Sentry not initialized, logging error locally:', { error: error instanceof Error ? error.message : String(error), context });
      return;
    }

    try {
      Sentry.captureException(error, {
        extra: context,
      });
      logger.error('Exception captured by Sentry:', { error: error instanceof Error ? error.message : String(error), context });
    } catch (err) {
      logger.error('Failed to capture exception in Sentry:', { error: err instanceof Error ? err.message : String(err) });
    }
  }

  /**
   * التقاط رسالة وإرسالها إلى Sentry.
   * @param message الرسالة
   * @param level مستوى الرسالة
   * @param context معلومات إضافية
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      logger[level](message, context);
      return;
    }

    try {
      Sentry.captureMessage(message, level);
      logger[level]('Message captured by Sentry:', { message, context });
    } catch (err) {
      logger.error('Failed to capture message in Sentry:', err);
    }
  }

  /**
   * تعيين معلومات المستخدم في Sentry.
   * @param user معلومات المستخدم
   */
  setUser(user: { id?: string; email?: string; username?: string }): void {
    if (!this.isInitialized) {
      logger.info('Sentry not initialized, user not set:', user);
      return;
    }

    try {
      Sentry.setUser(user);
      logger.info('User set in Sentry:', user);
    } catch (err) {
      logger.error('Failed to set user in Sentry:', err);
    }
  }

  /**
   * مسح معلومات المستخدم من Sentry.
   */
  clearUser(): void {
    if (!this.isInitialized) {
      logger.info('Sentry not initialized, user not cleared');
      return;
    }

    try {
      Sentry.setUser(null);
      logger.info('User cleared from Sentry');
    } catch (err) {
      logger.error('Failed to clear user in Sentry:', err);
    }
  }

  /**
   * إضافة breadcrumb للتتبع.
   * @param breadcrumb معلومات التتبع
   */
  addBreadcrumb(breadcrumb: {
    category?: string;
    message: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    if (!this.isInitialized) {
      logger.info('Sentry not initialized, breadcrumb not added:', breadcrumb);
      return;
    }

    try {
      Sentry.addBreadcrumb(breadcrumb);
      logger.info('Breadcrumb added to Sentry:', breadcrumb);
    } catch (err) {
      logger.error('Failed to add breadcrumb in Sentry:', err);
    }
  }

  /**
   * بدء معاملة للتتبع.
   * @param name اسم المعاملة
   * @param op نوع العملية
   */
  startTransaction(name: string, op: string): void {
    if (!this.isInitialized) {
      logger.info('Sentry not initialized, transaction not started:', { name, op });
      return;
    }

    try {
      Sentry.startSpan({ name, op }, () => {
        logger.info('Transaction started in Sentry:', { name, op });
      });
    } catch (err) {
      logger.error('Failed to start transaction in Sentry:', err);
    }
  }

  /**
   * التحقق من تمكين Sentry.
   * @returns true إذا كان Sentry مفعل ومهيأ
   */
  isEnabled(): boolean {
    return this.isInitialized && this.config.enabled;
  }
}

const sentryConfig: SentryConfig = {
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
  tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
};

export const sentry = new SentryClient(sentryConfig);

/**
 * تهيئة Sentry عند بدء التطبيق.
 */
export function initSentry(): void {
  sentry.init();
}

export { Sentry };
