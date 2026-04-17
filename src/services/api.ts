import { api as prodApi } from './api.prod';

type MockApi = typeof import('./mockApi').mockApi;

function createDevApi(): MockApi {
  let loadedApi: MockApi | null = null;

  return new Proxy({} as MockApi, {
    get(_, prop: keyof MockApi) {
      if (prop === 'subscribeToNotifications') {
        return ((...args: unknown[]) => {
          let cleanup: (() => void) | undefined;
          let disposed = false;

          void import('./mockApi').then((mod) => {
            if (disposed) {
              return;
            }

            loadedApi = mod.mockApi;
            const method = loadedApi[prop] as unknown;
            if (typeof method !== 'function') {
              throw new Error(`API.${String(prop)} غير صالح أو غير موجود في mockApi.`);
            }

            const result = (method as (...a: unknown[]) => unknown)(...args);
            if (typeof result === 'function') {
              cleanup = result;
            }
          });

          return () => {
            disposed = true;
            cleanup?.();
          };
        }) as MockApi[typeof prop];
      }

      return async (...args: unknown[]) => {
        if (!loadedApi) {
          const mod = await import('./mockApi');
          loadedApi = mod.mockApi;
        }

        const method = loadedApi[prop] as unknown;
        if (typeof method !== 'function') {
          throw new Error(`API.${String(prop)} غير صالح أو غير موجود في mockApi.`);
        }

        return (method as (...a: unknown[]) => unknown)(...args);
      };
    },
  });
}

/**
 * - التطوير: دائماً mockApi.
 * - الإنتاج: mockApi فقط إذا `VITE_USE_MOCK_API=true` (مثلاً نشر تجريبي على Netlify).
 *   عند ربط باكند حقيقي: احذف المتغير أو عيّنه `false` واستخدم عميل HTTP حقيقي بدل prodApi الحالي.
 */
function shouldUseMockApi(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_USE_MOCK_API === 'true';
}

export const api = shouldUseMockApi() ? createDevApi() : prodApi;

export type {
  Notification,
  NotificationType,
  Discount,
  StudentDocument,
} from './mockApi/types';
