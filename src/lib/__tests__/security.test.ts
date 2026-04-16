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
  generateCSPNonce,
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
  detectInjectionAttempt
} from '../security';

// Mock crypto for consistent testing
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      digest: async (algorithm: string, data: Uint8Array) => {
        // Simple mock hash for testing
        const hash = new Uint8Array(32);
        for (let i = 0; i < hash.length; i++) {
          hash[i] = data[i % data.length] ^ i;
        }
        return hash.buffer;
      }
    }
  }
});

describe('Security Functions', () => {
  describe('sanitizeHTML', () => {
    it('should sanitize basic HTML', () => {
      const dirty = '<script>alert("xss")</script><p>Hello</p>';
      const clean = sanitizeHTML(dirty);
      expect(clean).toBe('<p>Hello</p>');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
    });

    it('should allow safe tags', () => {
      const dirty = '<b>Bold</b><i>Italic</i><a href="#link">Link</a>';
      const clean = sanitizeHTML(dirty);
      expect(clean).toContain('<b>Bold</b>');
      expect(clean).toContain('<i>Italic</i>');
      expect(clean).toContain('<a href="#link">Link</a>');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const dirty = '<script>alert("xss")</script><p>Hello <b>World</b></p>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Hello World');
    });

    it('should handle empty input', () => {
      expect(sanitizeText('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidSaudiPhone', () => {
    it('should validate Saudi phone numbers', () => {
      expect(isValidSaudiPhone('0512345678')).toBe(true);
      expect(isValidSaudiPhone('512345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidSaudiPhone('1234567890')).toBe(false);
      expect(isValidSaudiPhone('051234567')).toBe(false);
      expect(isValidSaudiPhone('abc1234567')).toBe(false);
    });
  });

  describe('isValidUniversityId', () => {
    it('should validate university IDs', () => {
      expect(isValidUniversityId('12345678')).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidUniversityId('1234567')).toBe(false);
      expect(isValidUniversityId('123456789')).toBe(false);
      expect(isValidUniversityId('abcdefgh')).toBe(false);
    });
  });

  describe('maskEmail', () => {
    it('should mask emails correctly', () => {
      expect(maskEmail('a@example.com')).toBe('a***@example.com');
      expect(maskEmail('test@example.com')).toBe('t***@example.com');
    });

    it('should return invalid emails as-is', () => {
      expect(maskEmail('invalid')).toBe('invalid');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone numbers', () => {
      expect(maskPhone('0512345678')).toBe('05*****678');
    });

    it('should handle short numbers', () => {
      expect(maskPhone('123')).toBe('123');
    });
  });

  describe('checkPasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = checkPasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(4);
    });

    it('should reject weak passwords', () => {
      const result = checkPasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string values', () => {
      const obj = { name: '<script>alert()</script>John', age: 25 };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.name).toBe('John');
      expect(sanitized.age).toBe(25);
    });

    it('should handle nested objects', () => {
      const obj = { user: { name: '<b>John</b>' } };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.user.name).toBe('John');
    });
  });

  describe('containsDangerousContent', () => {
    it('should detect script tags', () => {
      expect(containsDangerousContent('<script>alert()</script>')).toBe(true);
    });

    it('should detect javascript protocol', () => {
      expect(containsDangerousContent('javascript:alert()')).toBe(true);
    });

    it('should allow safe content', () => {
      expect(containsDangerousContent('Hello World')).toBe(false);
    });
  });

  describe('generateCSPNonce', () => {
    it('should generate a nonce', () => {
      const nonce = generateCSPNonce();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });
  });

  describe('isValidURL', () => {
    it('should validate URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
    });
  });

  describe('isSafeURL', () => {
    it('should allow safe URLs', () => {
      expect(isSafeURL('https://example.com')).toBe(true);
    });

    it('should reject javascript URLs', () => {
      expect(isSafeURL('javascript:alert()')).toBe(false);
    });

    it('should reject data HTML URLs', () => {
      expect(isSafeURL('data:text/html,<script>alert()</script>')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<script>.txt')).toBe('file.txt');
    });

    it('should remove path traversal', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
    });
  });

  describe('isAllowedFileType', () => {
    it('should allow permitted extensions', () => {
      expect(isAllowedFileType('document.pdf')).toBe(true);
      expect(isAllowedFileType('image.jpg')).toBe(true);
    });

    it('should reject forbidden extensions', () => {
      expect(isAllowedFileType('script.exe')).toBe(false);
    });
  });

  describe('isAllowedFileSize', () => {
    it('should allow files within limit', () => {
      expect(isAllowedFileSize(1024 * 1024)).toBe(true); // 1MB
    });

    it('should reject oversized files', () => {
      expect(isAllowedFileSize(20 * 1024 * 1024)).toBe(false); // 20MB
    });
  });

  describe('hashPassword', () => {
    it('should hash passwords', async () => {
      const hash = await hashPassword('password123');
      expect(typeof hash).toBe('string');
      expect(hash.startsWith('pbkdf2$')).toBe(true);
      expect(hash.split('$')).toHaveLength(4);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct passwords', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const hash = await hashPassword('password123');
      const isValid = await verifyPassword('wrongpassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('CSRF Token functions', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    describe('generateCSRFToken', () => {
      it('should generate and store token', () => {
        const token = generateCSRFToken();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
        expect(sessionStorage.getItem('csrf_token')).toBeTruthy();
      });
    });

    describe('getCSRFToken', () => {
      it('should return existing token', () => {
        const token1 = generateCSRFToken();
        const token2 = getCSRFToken();
        expect(token1).toBe(token2);
      });

      it('should generate new token if expired', () => {
        const pastTime = Date.now() - 4000000; // 4000 seconds ago
        sessionStorage.setItem('csrf_token', JSON.stringify({
          token: 'old_token',
          expiresAt: pastTime
        }));
        const newToken = getCSRFToken();
        expect(newToken).not.toBe('old_token');
      });
    });

    describe('validateCSRFToken', () => {
      it('should validate correct tokens', () => {
        const token = generateCSRFToken();
        expect(validateCSRFToken(token)).toBe(true);
      });

      it('should reject invalid tokens', () => {
        generateCSRFToken();
        expect(validateCSRFToken('invalid')).toBe(false);
      });

      it('should reject expired tokens', () => {
        sessionStorage.setItem('csrf_token', JSON.stringify({
          token: 'expired',
          expiresAt: Date.now() - 1000
        }));
        expect(validateCSRFToken('expired')).toBe(false);
      });
    });

    describe('clearCSRFToken', () => {
      it('should clear token from storage', () => {
        generateCSRFToken();
        clearCSRFToken();
        expect(sessionStorage.getItem('csrf_token')).toBeNull();
      });
    });
  });

  describe('strictSanitizeHTML', () => {
    it('should remove all attributes and forbidden tags', () => {
      const dirty = '<script>alert()</script><p onclick="evil()">Test</p><b>Bold</b>';
      const clean = strictSanitizeHTML(dirty);
      expect(clean).not.toContain('script');
      expect(clean).not.toContain('onclick');
      expect(clean).toContain('<b>Bold</b>');
    });
  });

  describe('sanitizeForDatabase', () => {
    it('should preserve valid user characters', () => {
      const input = "O'Connor 50%";
      const sanitized = sanitizeForDatabase(input);
      expect(sanitized).toBe("O'Connor 50%");
    });

    it('should remove null byte characters', () => {
      const sanitized = sanitizeForDatabase('ab\u0000cd');
      expect(sanitized).toBe('abcd');
    });
  });

  describe('detectInjectionAttempt', () => {
    it('should detect SQL injection', () => {
      expect(detectInjectionAttempt("SELECT * FROM users WHERE id = '1' OR '1'='1'")).toBe(true);
    });

    it('should detect script injection', () => {
      expect(detectInjectionAttempt('<script>alert()</script>')).toBe(true);
    });

    it('should detect template injection', () => {
      expect(detectInjectionAttempt('${process.env.SECRET}')).toBe(true);
    });

    it('should allow safe input', () => {
      expect(detectInjectionAttempt('Hello World 123')).toBe(false);
    });
  });
});