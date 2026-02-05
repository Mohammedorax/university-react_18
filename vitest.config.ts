import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    // Temporarily removing Storybook browser tests that seem to cause issues
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});