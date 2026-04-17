/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** عند `true` يُستخدم mockApi في بناء الإنتاج (نشر تجريبي). */
  readonly VITE_USE_MOCK_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
