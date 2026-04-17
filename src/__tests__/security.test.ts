import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  sanitizeHTML,
  sanitizeText,
  isValidEmail,
  isValidSaudiPhone,
  isValidUniversityId,
  maskEmail,
  maskPhone,
  checkPasswordStrength,
  sanitizeObject,
  containsDangerousContent,
  isValidURL,
  isSafeURL,
  sanitizeFilename,
  isAllowedFileType,
  isAllowedFileSize,
  hashPassword,
  verifyPassword,
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFToken,
  strictSanitizeHTML,
  sanitizeForDatabase,
  detectInjectionAttempt,
  generateCSPNonce,
} from '../lib/security'

describe('sanitizeHTML', () => {
  it('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>'
    const result = sanitizeHTML(dirty)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<p>Hello</p>')
  })

  it('should return empty string for empty input', () => {
    expect(sanitizeHTML('')).toBe('')
    expect(sanitizeHTML(null as unknown as string)).toBe('')
  })

  it('should allow safe tags', () => {
    const input = '<b>bold</b><i>italic</i><a href="https://example.com">link</a>'
    const result = sanitizeHTML(input)
    expect(result).toContain('<b>')
    expect(result).toContain('<i>')
    expect(result).toContain('<a')
  })
})

describe('sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const dirty = '<p>Hello <b>World</b></p>'
    expect(sanitizeText(dirty)).toBe('Hello World')
  })

  it('should return empty string for empty input', () => {
    expect(sanitizeText('')).toBe('')
  })
})

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@domain')).toBe(false)
    expect(isValidEmail('user@domain.')).toBe(false)
  })
})

describe('isValidSaudiPhone', () => {
  it('should validate Saudi phone numbers', () => {
    expect(isValidSaudiPhone('0551234567')).toBe(true)
    expect(isValidSaudiPhone('512345678')).toBe(true)
  })

  it('should reject invalid Saudi phone numbers', () => {
    expect(isValidSaudiPhone('')).toBe(false)
    expect(isValidSaudiPhone('055123456')).toBe(false)
    expect(isValidSaudiPhone('05512345678')).toBe(false)
    expect(isValidSaudiPhone('0612345678')).toBe(false)
    expect(isValidSaudiPhone('1234567890')).toBe(false)
  })
})

describe('isValidUniversityId', () => {
  it('should validate 8-digit university IDs', () => {
    expect(isValidUniversityId('12345678')).toBe(true)
    expect(isValidUniversityId('00000000')).toBe(true)
  })

  it('should reject invalid university IDs', () => {
    expect(isValidUniversityId('')).toBe(false)
    expect(isValidUniversityId('1234567')).toBe(false)
    expect(isValidUniversityId('123456789')).toBe(false)
    expect(isValidUniversityId('abcdefgh')).toBe(false)
  })
})

describe('maskEmail', () => {
  it('should mask email correctly', () => {
    expect(maskEmail('test@example.com')).toBe('t***@example.com')
    expect(maskEmail('ab@domain.org')).toBe('a*@domain.org')
  })

  it('should return original for invalid emails', () => {
    expect(maskEmail('invalid')).toBe('invalid')
    expect(maskEmail('')).toBe('')
  })
})

describe('maskPhone', () => {
  it('should mask phone correctly', () => {
    expect(maskPhone('0551234567')).toBe('05*****567')
    expect(maskPhone('5123456789')).toBe('51*****789')
  })

  it('should return original for short phones', () => {
    expect(maskPhone('12345')).toBe('12345')
    expect(maskPhone('')).toBe('')
  })
})

describe('checkPasswordStrength', () => {
  it('should return valid for strong passwords', () => {
    const result = checkPasswordStrength('Pass@word1')
    expect(result.isValid).toBe(true)
    expect(result.score).toBe(4)
  })

  it('should return invalid for weak passwords', () => {
    const result = checkPasswordStrength('weak')
    expect(result.isValid).toBe(false)
    expect(result.score).toBe(0)
    expect(result.feedback.length).toBeGreaterThan(0)
  })

  it('should give feedback for missing requirements', () => {
    const result = checkPasswordStrength('password')
    expect(result.feedback).toContain('يجب إضافة حرف كبير')
    expect(result.feedback).toContain('يجب إضافة رقم')
    expect(result.feedback).toContain('يجب إضافة رمز خاص')
  })

  it('should require minimum 8 characters', () => {
    const result = checkPasswordStrength('Aa1!')
    expect(result.feedback).toContain('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  })
})

describe('sanitizeObject', () => {
  it('should sanitize string values in object', () => {
    const input = { name: '<script>alert(1)</script>', age: 25 }
    const result = sanitizeObject(input)
    expect(result.name).not.toContain('<script>')
    expect(result.age).toBe(25)
  })

  it('should recursively sanitize nested objects', () => {
    const input = { user: { name: '<b>Test</b>' } }
    const result = sanitizeObject(input)
    expect(result.user.name).toBe('Test')
  })

it('should handle empty object', () => {
    expect(sanitizeObject({})).toEqual({})
  })
})

describe('containsDangerousContent', () => {
  it('should detect script tags', () => {
    expect(containsDangerousContent('<script>alert(1)</script>')).toBe(true)
  })

  it('should detect javascript: protocol', () => {
    expect(containsDangerousContent('javascript:alert(1)')).toBe(true)
  })

  it('should detect inline event handlers', () => {
    expect(containsDangerousContent('<img onerror="alert(1)">')).toBe(true)
  })

  it('should return false for safe content', () => {
    expect(containsDangerousContent('Hello World')).toBe(false)
  })
})

describe('generateCSPNonce', () => {
  it('should generate a non-empty string', () => {
    const nonce = generateCSPNonce()
    expect(typeof nonce).toBe('string')
    expect(nonce.length).toBeGreaterThan(0)
  })
})

describe('isValidURL', () => {
  it('should validate correct URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true)
    expect(isValidURL('http://test.org/path')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(isValidURL('')).toBe(false)
    expect(isValidURL('not-a-url')).toBe(false)
  })
})

describe('isSafeURL', () => {
  it('should reject javascript: protocol', () => {
    expect(isSafeURL('javascript:alert(1)')).toBe(false)
  })

  it('should reject data:text/html', () => {
    expect(isSafeURL('data:text/html,<script>')).toBe(false)
  })

  it('should accept normal URLs', () => {
    expect(isSafeURL('https://example.com')).toBe(true)
    expect(isSafeURL('')).toBe(true)
  })
})

describe('sanitizeFilename', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeFilename('file<>.txt')).toBe('file.txt')
    expect(sanitizeFilename('file:name.txt')).toBe('filename.txt')
  })

  it('should remove path traversal', () => {
    expect(sanitizeFilename('../secret.txt')).toBe('secret.txt')
  })

  it('should trim whitespace', () => {
    expect(sanitizeFilename('  file.txt  ')).toBe('file.txt')
  })
})

describe('isAllowedFileType', () => {
  it('should allow configured extensions', () => {
    expect(isAllowedFileType('doc.pdf')).toBe(true)
    expect(isAllowedFileType('image.png')).toBe(true)
    expect(isAllowedFileType('file.jpg')).toBe(true)
  })

  it('should reject disallowed extensions', () => {
    expect(isAllowedFileType('malware.exe')).toBe(false)
    expect(isAllowedFileType('script.js')).toBe(false)
  })

  it('should be case insensitive', () => {
    expect(isAllowedFileType('file.PDF')).toBe(true)
    expect(isAllowedFileType('file.PNG')).toBe(true)
  })

  it('should accept custom allowed extensions', () => {
    expect(isAllowedFileType('file.csv', ['.csv', '.xlsx'])).toBe(true)
    expect(isAllowedFileType('file.pdf', ['.csv', '.xlsx'])).toBe(false)
  })
})

describe('isAllowedFileSize', () => {
  it('should validate file size within limit', () => {
    expect(isAllowedFileSize(1024 * 1024 * 5, 10)).toBe(true)
    expect(isAllowedFileSize(0, 10)).toBe(true)
  })

  it('should reject files exceeding limit', () => {
    expect(isAllowedFileSize(1024 * 1024 * 15, 10)).toBe(false)
  })

  it('should use default limit of 10MB', () => {
    expect(isAllowedFileSize(1024 * 1024 * 5)).toBe(true)
    expect(isAllowedFileSize(1024 * 1024 * 15)).toBe(false)
  })
})

describe('hashPassword', () => {
  it('should produce different hashes for same password due to random salt', async () => {
    const hash1 = await hashPassword('testpass123')
    const hash2 = await hashPassword('testpass123')
    expect(hash1).not.toBe(hash2)
  })

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')
    expect(hash1).not.toBe(hash2)
  })

  it('should return PBKDF2 hash format', async () => {
    const hash = await hashPassword('test')
    expect(hash.startsWith('pbkdf2$')).toBe(true)
    expect(hash.split('$')).toHaveLength(4)
  })
})

describe('verifyPassword', () => {
  it('should return true for correct password', async () => {
    const hash = await hashPassword('mypassword')
    expect(await verifyPassword('mypassword', hash)).toBe(true)
  })

  it('should return false for incorrect password', async () => {
    const hash = await hashPassword('mypassword')
    expect(await verifyPassword('wrongpassword', hash)).toBe(false)
  })
})

describe('CSRF Token functions', () => {
  beforeEach(() => {
    clearCSRFToken()
    sessionStorage.clear()
  })

  afterEach(() => {
    clearCSRFToken()
    sessionStorage.clear()
  })

  it('generateCSRFToken should create and store token', () => {
    const token = generateCSRFToken()
    expect(token).toBeTruthy()
    expect(token.length).toBeGreaterThan(0)
  })

  it('getCSRFToken should return existing token', () => {
    const token1 = getCSRFToken()
    const token2 = getCSRFToken()
    expect(token1).toBe(token2)
  })

  it('validateCSRFToken should validate correct token', () => {
    const token = generateCSRFToken()
    expect(validateCSRFToken(token)).toBe(true)
  })

  it('validateCSRFToken should reject invalid token', () => {
    generateCSRFToken()
    expect(validateCSRFToken('invalid-token')).toBe(false)
  })

  it('clearCSRFToken should remove token', () => {
    generateCSRFToken()
    clearCSRFToken()
    const token = getCSRFToken()
    expect(token).toBeTruthy()
  })
})

describe('strictSanitizeHTML', () => {
  it('should remove all attributes', () => {
    const input = '<p style="color:red" onclick="alert(1)">text</p>'
    const result = strictSanitizeHTML(input)
    expect(result).not.toContain('style')
    expect(result).not.toContain('onclick')
  })

  it('should remove scripts and iframes', () => {
    expect(strictSanitizeHTML('<script>x</script>')).toBe('')
    expect(strictSanitizeHTML('<iframe></iframe>')).toBe('')
  })
})

describe('sanitizeForDatabase', () => {
  it('should preserve user input characters', () => {
    expect(sanitizeForDatabase("O'Connor")).toBe("O'Connor")
    expect(sanitizeForDatabase('50% discount')).toBe('50% discount')
  })

  it('should return empty for empty input', () => {
    expect(sanitizeForDatabase('')).toBe('')
  })

  it('should normalize whitespace', () => {
    expect(sanitizeForDatabase('test    spaces')).toBe('test spaces')
  })

  it('should strip null bytes', () => {
    expect(sanitizeForDatabase('ab\u0000cd')).toBe('abcd')
  })
})

describe('detectInjectionAttempt', () => {
  it('should detect SQL keywords', () => {
    expect(detectInjectionAttempt('SELECT * FROM users')).toBe(true)
    expect(detectInjectionAttempt('INSERT INTO data')).toBe(true)
  })

  it('should detect OR injection', () => {
    expect(detectInjectionAttempt("' OR '1'='1")).toBe(true)
  })

  it('should detect XSS attempts', () => {
    expect(detectInjectionAttempt('<script>alert(1)</script>')).toBe(true)
    expect(detectInjectionAttempt('javascript:alert(1)')).toBe(true)
  })

  it('should return false for normal text', () => {
    expect(detectInjectionAttempt('Hello World')).toBe(false)
    expect(detectInjectionAttempt('Normal user input')).toBe(false)
  })
})