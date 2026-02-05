import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'e2e',
    include: ['tests/e2e/**/*.spec.ts', 'tests/e2e/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      name: 'chromium',
      provider: 'playwright',
      // Options: chromium, firefox, webkit
    },
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/e2e/setup.ts'],
    // Increase timeout for E2E tests
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Server configuration for tests
  server: {
    port: 5173,
    host: true,
  },
});
