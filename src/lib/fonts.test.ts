/**
 * @file fonts.test.ts
 * @description اختبارات خفيفة لـ fonts.ts (تجنّب اختبارات شبكة/FileReader المعقّدة في CI)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCairoFont, isFontLoaded, clearFontCache, CAIRO_FONT_BASE64 } from './fonts'

describe('fonts.ts', () => {
  beforeEach(() => {
    clearFontCache()
    vi.clearAllMocks()
  })

  it('clearFontCache resets loaded state', () => {
    clearFontCache()
    expect(isFontLoaded()).toBe(false)
  })

  it('returns string on fetch failure (empty or fallback)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'))
    const result = await getCairoFont()
    expect(typeof result).toBe('string')
    expect(result).toBe(CAIRO_FONT_BASE64 || '')
  })

  it('isFontLoaded reflects CAIRO_FONT_BASE64 when set', () => {
    clearFontCache()
    if (CAIRO_FONT_BASE64 && CAIRO_FONT_BASE64.length > 100) {
      expect(isFontLoaded()).toBe(true)
    } else {
      expect(isFontLoaded()).toBe(false)
    }
  })
})
