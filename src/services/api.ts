import { api as prodApi } from './api.prod';

type MockApi = typeof import('./mockApi').mockApi;

function createDevApi(): MockApi {
  let loadedApi: MockApi | null = null;

  return new Proxy({} as MockApi, {
    get(_, prop: keyof MockApi) {
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

export const api = import.meta.env.DEV ? createDevApi() : prodApi;

export type {
  Notification,
  NotificationType,
  Discount,
  StudentDocument,
} from './mockApi/types';
