/**
 * @file fonts.test.ts
 * @description اختبارات الوحدات لملف fonts.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCairoFont, isFontLoaded, clearFontCache, CAIRO_FONT_BASE64 } from './fonts';

// Mock fetch
global.fetch = vi.fn();

describe('fonts.ts', () => {
  beforeEach(() => {
    clearFontCache();
    vi.clearAllMocks();
  });

  describe('getCairoFont', () => {
    it('should fetch font successfully and return base64', async () => {
      const mockBase64 = 'mock-base64-font-data';
      const mockBlob = new Blob([mockBase64], { type: 'font/woff2' });
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onloadend: null as any,
        onerror: null as any,
        result: `data:font/woff2;base64,${mockBase64}`,
      };
      
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const fontPromise = getCairoFont();
      
      // Simulate FileReader behavior
      setTimeout(() => {
        mockFileReader.onloadend();
      }, 0);

      const result = await fontPromise;
      expect(result).toBe(mockBase64);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached font if already loaded', async () => {
      // First load (mocked)
      const mockBase64 = 'cached-font';
      // ... setup mocks ...
      // For simplicity in this test, we can just manually set the cache if we could, 
      // but since we can't access the variable directly, we rely on the implementation behavior.
      
      // Let's simulate a successful fetch first
      const mockBlob = new Blob(['data'], { type: 'font/woff2' });
      (global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });
      
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onloadend: null as any,
        result: `data:font/woff2;base64,${mockBase64}`,
      };
      vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

      const p1 = getCairoFont();
      setTimeout(() => mockFileReader.onloadend(), 0);
      await p1;

      // Second call
      const p2 = getCairoFont();
      const res2 = await p2;
      
      expect(res2).toBe(mockBase64);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Should typically be 1 if cached correctly
    });

    it('should return fallback or empty string on fetch failure', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await getCairoFont();
      
      expect(result).toBe(CAIRO_FONT_BASE64 || '');
    });
  });

  describe('isFontLoaded', () => {
    it('should return false initially', () => {
      expect(isFontLoaded()).toBe(false);
    });

    // Note: To test true, we need to successfully load the font first or mock the module state
  });
});
