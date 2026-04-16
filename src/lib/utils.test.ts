/**
 * @file utils.test.ts
 * @description Unit tests for utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, processArabicText } from '@/lib/utils'

describe('cn (className utility)', () => {
  it('should merge classNames correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const condition1 = true
    const condition2 = false
    expect(cn('base', condition1 && 'conditional')).toBe('base conditional')
    expect(cn('base', condition2 && 'conditional')).toBe('base')
  })

  it('should handle Tailwind merge', () => {
    expect(cn('p-4 p-2')).toBe('p-2')
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('processArabicText', () => {
  it('should return empty string for empty input', () => {
    expect(processArabicText('')).toBe('')
    expect(processArabicText(null as unknown as string)).toBe('')
    expect(processArabicText(undefined as unknown as string)).toBe('')
  })

  it('should return text as-is for non-Arabic text', () => {
    expect(processArabicText('Hello World')).toBe('Hello World')
    expect(processArabicText('12345')).toBe('12345')
  })

  it('should handle Arabic text', () => {
    const result = processArabicText('مرحبا بالعالم')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle mixed Arabic and English', () => {
    const result = processArabicText('Hello مرحبا World')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('should handle Arabic with numbers', () => {
    const result = processArabicText('الدرجة: 95')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('should handle special Arabic characters', () => {
    const result = processArabicText('مَرْحَبَا بِكُمْ')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('should handle visualOrder option', () => {
    const text = 'مرحبا'
    const result = processArabicText(text, { visualOrder: true })
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})

describe('Arabic text edge cases', () => {
  it('should handle long Arabic text', () => {
    const longText = 'هذا نص عربي طويل جداً يحتوي على الكثير من الكلمات والجمل لاختبار كيفية التعامل مع النصوص الطويلة في النظام'
    const result = processArabicText(longText)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    // Note: reshaping may change character count due to Arabic letter joining
  })

  it('should handle Arabic with punctuation', () => {
    const result = processArabicText('مرحبا، كيف حالك؟ أنا بخير، شكراً!')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('should handle Arabic diacritics (tashkeel)', () => {
    const result = processArabicText('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ')
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})
