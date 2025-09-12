// Security utilities tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeHtml,
  sanitizeFilename,
  hashPassword,
  verifyPassword,
  createJWT,
  verifyJWT,
  validateFileUpload,
  escapeSQL,
  validateSQLParams,
  RateLimiter,
  CSRFProtection,
  IPSecurity,
  AuditLogger,
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  priceSchema,
} from '@/shared/security-utils';

describe('Security Utils', () => {
  describe('Input Sanitization', () => {
    it('should sanitize strings by removing dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
      expect(sanitizeString('Normal text')).toBe('Normal text');
      expect(sanitizeString("Text with 'quotes' and \"double quotes\"")).toBe('Text with quotes and double quotes');
      expect(sanitizeString('  Trimmed text  ')).toBe('Trimmed text');
    });

    it('should sanitize HTML by encoding dangerous characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
      expect(sanitizeHtml('<div>Safe content</div>')).toBe('&lt;div&gt;Safe content&lt;&#x2F;div&gt;');
    });

    it('should sanitize filenames', () => {
      expect(sanitizeFilename('normal-file.jpg')).toBe('normal-file.jpg');
      expect(sanitizeFilename('file with spaces.png')).toBe('file_with_spaces.png');
      expect(sanitizeFilename('../../dangerous/path.txt')).toBe('.._.._dangerous_path.txt');
      expect(sanitizeFilename('file@#$%^&*().pdf')).toBe('file_______.pdf');
    });
  });

  describe('Password Security', () => {
    beforeEach(() => {
      // Set up environment for testing
      process.env.SALT = 'test-salt-for-hashing';
    });

    it('should hash passwords consistently', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).toBe(hash2);
      // SHA-256 produces a 64-character hex string
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword(password, hash)).toBe(true);
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    beforeEach(() => {
      // Mock environment
      process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing';
      process.env.SALT = 'test-salt-for-hashing';
    });

    it('should create and verify JWT tokens', async () => {
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
      };

      const token = await createJWT(payload);
      // JWT format: base64url.base64url.signature
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);

      const verified = await verifyJWT(token);
      expect(verified).toBeTruthy();
      expect(verified?.sub).toBe('user123');
      expect(verified?.email).toBe('test@example.com');
      expect(verified?.role).toBe('user');
    });

    it('should reject invalid JWT tokens', async () => {
      expect(await verifyJWT('invalid.token.here')).toBeNull();
      expect(await verifyJWT('not-a-token')).toBeNull();
      expect(await verifyJWT('')).toBeNull();
    });

    it('should reject expired tokens', async () => {
      // Mock Date.now to test expiration
      const originalNow = Date.now;
      Date.now = vi.fn(() => 1000000);

      const token = await createJWT({
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
      });

      // Move time forward past expiration
      Date.now = vi.fn(() => 1000000 + (25 * 60 * 60 * 1000)); // 25 hours later

      expect(await verifyJWT(token)).toBeNull();

      Date.now = originalNow;
    });
  });

  describe('File Upload Validation', () => {
    it('should validate file uploads correctly', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validateFileUpload(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 }); // 20MB

      const result = validateFileUpload(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/octet-stream' });
      Object.defineProperty(invalidFile, 'size', { value: 1024 });

      const result = validateFileUpload(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should escape SQL strings', () => {
      expect(escapeSQL("normal text")).toBe("normal text");
      expect(escapeSQL("text with 'quote'")).toBe("text with ''quote''");
      expect(escapeSQL("text with ; semicolon")).toBe("text with  semicolon");
    });

    it('should validate SQL parameters', () => {
      expect(validateSQLParams({ name: 'John', age: 25 })).toBe(true);
      expect(validateSQLParams({ name: 'John', age: '25' })).toBe(true);
      expect(validateSQLParams({ name: 'DROP TABLE users;' })).toBe(false);
      expect(validateSQLParams({ query: 'SELECT * FROM users' })).toBe(false);
      expect(validateSQLParams({ comment: 'Nice place -- very clean' })).toBe(false);
    });
  });

  describe('Rate Limiter', () => {
    it('should allow requests within limit', () => {
      const limiter = new RateLimiter();
      
      expect(limiter.isAllowed('127.0.0.1', 3, 60000)).toBe(true);
      expect(limiter.isAllowed('127.0.0.1', 3, 60000)).toBe(true);
      expect(limiter.isAllowed('127.0.0.1', 3, 60000)).toBe(true);
    });

    it('should block requests that exceed limit', () => {
      const limiter = new RateLimiter();
      
      expect(limiter.isAllowed('127.0.0.1', 2, 60000)).toBe(true);
      expect(limiter.isAllowed('127.0.0.1', 2, 60000)).toBe(true);
      expect(limiter.isAllowed('127.0.0.1', 2, 60000)).toBe(false); // Third request blocked
    });

    it('should reset limits after window expires', async () => {
      const limiter = new RateLimiter();
      
      expect(limiter.isAllowed('127.0.0.1', 1, 50)).toBe(true);
      expect(limiter.isAllowed('127.0.0.1', 1, 50)).toBe(false);
      
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(limiter.isAllowed('127.0.0.1', 1, 50)).toBe(true);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate and validate CSRF tokens', () => {
      const csrf = new CSRFProtection();
      const sessionId = 'session123';
      
      const token = csrf.generateToken(sessionId);
      // UUID v4 format
      expect(token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      
      expect(csrf.validateToken(sessionId, token)).toBe(true);
      expect(csrf.validateToken(sessionId, 'invalid-token')).toBe(false);
      expect(csrf.validateToken('invalid-session', token)).toBe(false);
    });

    it('should expire tokens after timeout', () => {
      const csrf = new CSRFProtection();
      const sessionId = 'session123';
      
      const token = csrf.generateToken(sessionId);
      
      // Mock token as expired by manipulating internal state
      csrf['tokens'].set(sessionId, { 
        token, 
        expiry: Date.now() - 1000 // Already expired
      });
      
      expect(csrf.validateToken(sessionId, token)).toBe(false);
    });
  });

  describe('IP Security', () => {
    it('should block IPs correctly', () => {
      const ipSec = new IPSecurity();
      const ip = '192.168.1.100';
      
      expect(ipSec.isBlocked(ip)).toBe(false);
      
      ipSec.blockIP(ip);
      expect(ipSec.isBlocked(ip)).toBe(true);
    });

    it('should track suspicious activity', () => {
      const ipSec = new IPSecurity();
      const ip = '192.168.1.100';
      
      // Record multiple suspicious activities
      for (let i = 0; i < 9; i++) {
        expect(ipSec.recordSuspiciousActivity(ip)).toBe(false);
      }
      
      // 10th activity should trigger block
      expect(ipSec.recordSuspiciousActivity(ip)).toBe(true);
      expect(ipSec.isBlocked(ip)).toBe(true);
    });
  });

  describe('Audit Logger', () => {
    it('should log audit events', () => {
      const logger = new AuditLogger();
      const event = {
        userId: 'user123',
        ip: '127.0.0.1',
        action: 'LOGIN_SUCCESS',
        resource: '/api/login',
        details: { method: 'POST' },
        success: true,
        timestamp: Date.now(),
      };
      
      logger.log(event);
      
      const userActivity = logger.getUserActivity('user123');
      expect(userActivity).toHaveLength(1);
      expect(userActivity[0].action).toBe('LOGIN_SUCCESS');
    });

    it('should track failed attempts by IP', () => {
      const logger = new AuditLogger();
      const ip = '192.168.1.100';
      
      logger.log({
        ip,
        action: 'LOGIN_FAILED',
        resource: '/api/login',
        details: {},
        success: false,
        timestamp: Date.now(),
      });
      
      const failedAttempts = logger.getFailedAttempts(ip);
      expect(failedAttempts).toHaveLength(1);
      expect(failedAttempts[0].success).toBe(false);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate email addresses', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true);
      expect(emailSchema.safeParse('invalid-email').success).toBe(false);
      expect(emailSchema.safeParse('').success).toBe(false);
    });

    it('should validate passwords', () => {
      expect(passwordSchema.safeParse('Password123!').success).toBe(true);
      expect(passwordSchema.safeParse('weak').success).toBe(false);
      expect(passwordSchema.safeParse('nouppercaseorno123!').success).toBe(false);
      expect(passwordSchema.safeParse('NOLOWERCASE123!').success).toBe(false);
      expect(passwordSchema.safeParse('NoNumbers!').success).toBe(false);
      expect(passwordSchema.safeParse('NoSpecialChar123').success).toBe(false);
    });

    it('should validate phone numbers', () => {
      expect(phoneSchema.safeParse('+966501234567').success).toBe(true);
      expect(phoneSchema.safeParse('966501234567').success).toBe(true);
      expect(phoneSchema.safeParse('invalid-phone').success).toBe(false);
    });

    it('should validate names', () => {
      expect(nameSchema.safeParse('John Doe').success).toBe(true);
      expect(nameSchema.safeParse('أحمد محمد').success).toBe(true);
      expect(nameSchema.safeParse('A').success).toBe(false); // Too short
      expect(nameSchema.safeParse('John123').success).toBe(false); // Contains numbers
    });

    it('should validate prices', () => {
      expect(priceSchema.safeParse(100).success).toBe(true);
      expect(priceSchema.safeParse(0).success).toBe(true);
      expect(priceSchema.safeParse(-50).success).toBe(false);
      expect(priceSchema.safeParse(200000).success).toBe(false); // Too high
    });
  });
});