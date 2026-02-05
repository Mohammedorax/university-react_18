import { logger } from '@/lib/logger';

/**
 * @file fonts.ts
 * @description إدارة خطوط PDF ودعم اللغة العربية
 */

export const CAIRO_FONT_URL = 'https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvajtK.woff2';

export const CAIRO_FONT_BASE64: string = '';

let fontCache: string | null = null;

export async function getCairoFont(): Promise<string> {
  if (fontCache) return fontCache;
  
  try {
    const response = await fetch(CAIRO_FONT_URL);
    if (!response.ok) throw new Error('Font download failed');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        fontCache = reader.result as string;
        resolve(fontCache);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    logger.warn('Failed to load Cairo font, using fallback');
    return '';
  }
}

export function isFontLoaded(): boolean {
  return fontCache !== null;
}

export function clearFontCache(): void {
  fontCache = null;
}
