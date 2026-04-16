type UnsupportedApi = Record<string, (...args: unknown[]) => Promise<never>>;

export const api = new Proxy({} as UnsupportedApi, {
  get(_, prop) {
    return async () => {
      throw new Error(
        `API.${String(prop)}() غير متاح في الإنتاج. يرجى ربط API حقيقي بدلاً من mockApi.`
      );
    };
  },
});
