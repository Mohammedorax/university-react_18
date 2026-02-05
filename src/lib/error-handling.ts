import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n.hooks';
import { logger } from '@/lib/logger';

/**
 * مستويات خطورة الأخطاء المستخدمة في النظام
 * @typedef {'low' | 'medium' | 'high' | 'critical'} ErrorSeverity
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * واجهة معلومات الخطأ
 * @interface ErrorInfo
 * @property {string} message - رسالة الخطأ الرئيسية
 * @property {string} [description] - وصف تفصيلي للخطأ
 * @property {ErrorSeverity} severity - مستوى خطورة الخطأ
 * @property {Object} [action] - إجراء يمكن اتخاذه
 * @property {string} action.label - نص الزر
 * @property {Function} action.onClick - دالة تنفيذية عند الضغط
 * @property {number} [duration] - مدة عرض الإشعار بالمللي ثانية
 */
export interface ErrorInfo {
  message: string;
  description?: string;
  severity: ErrorSeverity;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

/**
 * فئة الخطأ التطبيقي المخصص
 * @class AppError
 * @extends Error
 * @description تستخدم لإنشاء أخطاء مخصصة مع معلومات إضافية مثل مستوى الخطورة والوصف والإجراءات
 * @example
 * // إنشاء خطأ بسيط
 * throw new AppError('فشل في تحميل البيانات');
 * 
 * // إنشاء خطأ مع مستوى خطورة
 * throw new AppError('فشل في الاتصال بالخادم', 'critical');
 * 
 * // إنشاء خطأ مع جميع الخيارات
 * throw new AppError(
 *   'خطأ في المصادقة',
 *   'high',
 *   'فشل في التحقق من بيانات الاعتماد',
 *   { label: 'إعادة المحاولة', onClick: () => retryAuth() },
 *   10000
 * );
 */
export class AppError extends Error {
  /** مستوى خطورة الخطأ */
  public readonly severity: ErrorSeverity;
  /** وصف تفصيلي للخطأ */
  public readonly description?: string;
  /** إجراء قابل للتنفيذ */
  public readonly action?: ErrorInfo['action'];
  /** مدة عرض الإشعار */
  public readonly duration?: number;

  /**
   * @constructor
   * @param {string} message - رسالة الخطأ
   * @param {ErrorSeverity} [severity='medium'] - مستوى الخطورة
   * @param {string} [description] - الوصف التفصيلي
   * @param {ErrorInfo['action']} [action] - الإجراء القابل للتنفيذ
   * @param {number} [duration] - مدة العرض
   */
  constructor(
    message: string,
    severity: ErrorSeverity = 'medium',
    description?: string,
    action?: ErrorInfo['action'],
    duration?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.description = description;
    this.action = action;
    this.duration = duration;
  }
}

/**
 * معالج الأخطاء الرئيسي
 * @function handleError
 * @param {unknown} error - الخطأ المراد معالجته
 * @param {Function} [t] - دالة الترجمة
 * @description يقوم بمعالجة الأخطاء المختلفة وعرض إشعارات مناسبة
 * @example
 * // معالجة خطأ بسيط
 * handleError(new Error('حدث خطأ'));
 * 
 * // معالجة خطأ مع الترجمة
 * const { t } = useTranslation();
 * handleError(error, t);
 */
export function handleError(error: unknown, t?: (key: string) => string): void {
  const translate = t || ((key: string) => key);

  if (error instanceof AppError) {
    showAppError(error, translate);
  } else if (error instanceof Error) {
    showGenericError(error, translate);
  } else {
    showUnknownError(error, translate);
  }
}

/**
 * عرض خطأ تطبيقي مع إشعار
 * @function showAppError
 * @param {AppError} error - خطأ تطبيقي
 * @param {Function} t - دالة الترجمة
 * @private
 */
function showAppError(error: AppError, t: (key: string) => string): void {
  const config: Record<ErrorSeverity, { style: object }> = {
    low: { style: { background: '#f59e0b' } },
    medium: { style: { background: '#ef4444' } },
    high: { style: { background: '#dc2626' } },
    critical: { style: { background: '#991b1b' } },
  };

  toast.error(error.message, {
    description: error.description,
    duration: error.duration || getDurationBySeverity(error.severity),
    action: error.action,
    style: config[error.severity].style,
  });
}

/**
 * عرض خطأ عام مع إشعار
 * @function showGenericError
 * @param {Error} error - خطأ JavaScript
 * @param {Function} t - دالة الترجمة
 * @private
 */
function showGenericError(error: Error, t: (key: string) => string): void {
  logger.error('Application error:', { message: error.message, stack: error.stack });

  toast.error(t('errors.generic') || 'حدث خطأ', {
    description: error.message || t('errors.unknown') || 'خطأ غير معروف',
    duration: 5000,
  });
}

/**
 * عرض خطأ غير معروف
 * @function showUnknownError
 * @param {unknown} error - خطأ غير معروف النوع
 * @param {Function} t - دالة الترجمة
 * @private
 */
function showUnknownError(error: unknown, t: (key: string) => string): void {
  logger.error('Unknown error:', { error: String(error) });

  toast.error(t('errors.unknown') || 'خطأ غير معروف', {
    description: String(error),
    duration: 5000,
  });
}

/**
 * الحصول على مدة العرض بناءً على مستوى الخطورة
 * @function getDurationBySeverity
 * @param {ErrorSeverity} severity - مستوى الخطورة
 * @returns {number} مدة العرض بالمللي ثانية
 * @private
 */
function getDurationBySeverity(severity: ErrorSeverity): number {
  const durations: Record<ErrorSeverity, number> = {
    low: 3000,
    medium: 5000,
    high: 8000,
    critical: 10000,
  };
  return durations[severity];
}

/**
 * إنشاء معالج أخطاء مخصص
 * @function createErrorHandler
 * @param {Function} t - دالة الترجمة
 * @returns {Function} معالج أخطاء مخصص
 * @example
 * const errorHandler = createErrorHandler(t);
 * errorHandler(new Error('حدث خطأ'));
 */
export function createErrorHandler(t: (key: string) => string) {
  return (error: unknown) => handleError(error, t);
}

/**
 * مزخرف للدوال لإضافة معالجة الأخطاء
 * @function withErrorHandling
 * @template T - نوع الدالة
 * @param {T} fn - الدالة المراد تغليفها
 * @param {Function} [errorHandler] - معالج أخطاء مخصص
 * @returns {T} دالة مزخرفة مع معالجة الأخطاء
 * @description يغلف دالة غير متزامنة بمعالجة الأخطاء التلقائية
 * @example
 * // تغليف دالة غير متزامنة
 * const safeFetch = withErrorHandling(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 * 
 * // استخدام مع معالج أخطاء مخصص
 * const safeFetch = withErrorHandling(
 *   async () => fetchData(),
 *   (err) => console.error('فشل جلب البيانات:', err)
 * );
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args) as ReturnType<T>;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        handleError(error);
      }
      throw error;
    }
  }) as T;
}

/**
 * Hook لإدارة الأخطاء والإشعارات
 * @function useErrorHandler
 * @returns {Object} أدوات إدارة الأخطاء والإشعارات
 * @returns {Function} handleError - معالج الأخطاء مع الترجمة
 * @returns {Function} showSuccess - عرض إشعار نجاح
 * @returns {Function} showInfo - عرض إشعار معلومات
 * @returns {Function} showWarning - عرض إشعار تحذير
 * @description Hook React يوفر أدوات لعرض الإشعارات ومعالجة الأخطاء
 * @example
 * function MyComponent() {
 *   const { handleError, showSuccess, showInfo, showWarning } = useErrorHandler();
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await saveData();
 *       showSuccess('تم الحفظ بنجاح');
 *     } catch (error) {
 *       handleError(error);
 *     }
 *   };
 *   
 *   return (
 *     <Button onClick={() => showWarning('يرجى التحقق من البيانات')}>
 *       تحذير
 *     </Button>
 *   );
 * }
 */
export function useErrorHandler() {
  const { t } = useTranslation();

  return {
    /** معالج الأخطاء مع الترجمة التلقائية */
    handleError: (error: unknown) => handleError(error, t),
    /** عرض إشعار نجاح */
    showSuccess: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    /** عرض إشعار معلومات */
    showInfo: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    /** عرض إشعار تحذير */
    showWarning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
  };
}
