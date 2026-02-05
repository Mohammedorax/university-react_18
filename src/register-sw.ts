import { logger } from '@/lib/logger';

/**
 * @file register-sw.ts
 * @description تسجيل Service Worker لتطبيق الويب التقدمي (PWA)
 * @module pwa
 */

/**
 * تسجيل Service Worker
 * @function registerServiceWorker
 * @description يُسجّل Service Worker لتمكين ميزات PWA مثل:
 * - التخزين المؤقت للعمل بلا إنترنت
 * - الإشعارات الفورية عند توفر تحديثات
 * - التحديثات في الخلفية
 * @example
 * // في main.tsx أو App.tsx
 * import { registerServiceWorker } from '@/register-sw';
 * 
 * registerServiceWorker();
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL || '/'}service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          logger.info('[PWA] Service Worker registered', { scope: registration.scope });

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  logger.info('[PWA] New content is available; please refresh.');
                  if (confirm('تحديث جديد متاح! هل تريد تحديث الصفحة الآن؟')) {
                    window.location.reload();
                  }
                } else {
                  logger.info('[PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          logger.error('[PWA] Service Worker registration failed', { error: error instanceof Error ? error.message : String(error) });
        });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('[PWA] Service Worker controller changed');
      });
    });
  } else {
    logger.info('[PWA] Service Worker not supported in this browser');
  }
}

/**
 * إلغاء تسجيل Service Worker
 * @function unregisterServiceWorker
 * @description يُلغي تسجيل Service Worker الحالي
 * @example
 * // عند تسجيل الخروج أو إعادة تعيين التطبيق
 * unregisterServiceWorker();
 */
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        logger.error('[PWA] Service Worker unregistration failed', { error: error instanceof Error ? error.message : String(error) });
      });
  }
}

/**
 * التحقق من وجود تحديثات للـ Service Worker
 * @function checkForUpdates
 * @async
 * @description يتحقق يدوياً من وجود إصدارات جديدة من Service Worker
 * @returns {Promise<void>}
 * @example
 * // زر التحقق من التحديثات
 * function UpdateButton() {
 *   const handleCheck = async () => {
 *     await checkForUpdates();
 *   };
 *   
 *   return <button onClick={handleCheck}>تحقق من التحديثات</button>;
 * }
 */
export async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.update();
      logger.info('[PWA] Checked for service worker updates');
    } catch (error) {
      logger.error('[PWA] Error checking for updates', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}
