// Security Utilities for HabibiStay Platform

import { z } from 'zod';

// Input validation schemas
export const emailSchema = z.string().email('Invalid email format').max(255);
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number and special character');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\u0600-\u06FF]+$/, 'Name contains invalid characters');

export const priceSchema = z.number()
  .min(0, 'Price must be positive')
  .max(100000, 'Price too high');

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

// Sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 1000); // Limit length
}

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Rate limiting utilities (supports per-call windows and limits)
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  constructor() {}

  // checks allowance with optional per-call maxRequests/windowMs
  isAllowed(identifier: string, maxRequests = 100, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  // Returns how many requests remain for identifier under provided window/limit
  getRemaining(identifier: string, maxRequests = 100, windowMs = 15 * 60 * 1000): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);
    if (!userRequests || now > userRequests.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - userRequests.count);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.openai.com https://api.myfatoorah.com;
    frame-src https://js.stripe.com https://checkout.stripe.com;
  `.replace(/\s+/g, ' ').trim()
};

// CSRF protection
export class CSRFProtection {
  private tokens = new Map<string, { token: string; expiry: number }>();
  
  generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
    
    this.tokens.set(sessionId, { token, expiry });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored || Date.now() > stored.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.tokens.entries()) {
      if (now > value.expiry) {
        this.tokens.delete(key);
      }
    }
  }
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.SALT || 'habibi-stay-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// JWT token utilities
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  sessionId?: string;
}

export async function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  
  const signature = await signHMAC(`${encodedHeader}.${encodedPayload}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// verifyJWT now accepts optional verification options but will perform basic checks
export async function verifyJWT(token: string, _options?: { issuer?: string; audience?: string; algorithms?: string[] }): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = await signHMAC(`${encodedHeader}.${encodedPayload}`);
    if (signature !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload)) as JWTPayload;
    
    // Check expiration
    if (Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

async function signHMAC(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.JWT_SECRET || 'habibi-stay-jwt-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// IP geolocation and blocking
export class IPSecurity {
  private blockedIPs = new Set<string>();
  private suspiciousActivity = new Map<string, { count: number; lastAttempt: number }>();

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
  }

  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  recordSuspiciousActivity(ip: string): boolean {
    const now = Date.now();
    const activity = this.suspiciousActivity.get(ip) || { count: 0, lastAttempt: 0 };
    
    // Reset count if more than 1 hour passed
    if (now - activity.lastAttempt > 60 * 60 * 1000) {
      activity.count = 0;
    }

    activity.count++;
    activity.lastAttempt = now;
    this.suspiciousActivity.set(ip, activity);

    // Block after 10 suspicious activities
    if (activity.count >= 10) {
      this.blockIP(ip);
      return true;
    }

    return false;
  }
}

// File upload security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only images allowed.' };
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
}

// SQL injection prevention helpers
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '');
}

export function validateSQLParams(params: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && (
      value.includes('DROP ') ||
      value.includes('DELETE ') ||
      value.includes('UPDATE ') ||
      value.includes('INSERT ') ||
      value.includes('UNION ') ||
      value.includes('SELECT ') ||
      value.includes('--') ||
      value.includes('/*')
    )) {
      return false;
    }
  }
  return true;
}

// Audit logging
export interface AuditLog {
  // make timestamp optional for callers; AuditLogger will fill when logging
  timestamp?: number;
  userId?: string;
  ip: string;
  action: string;
  resource?: string;
  details: Record<string, any>;
  success: boolean;
}

export class AuditLogger {
  private logs: AuditLog[] = [];

  log(log: AuditLog): void {
    this.logs.push({
      ...log,
      timestamp: Date.now()
    });

    // Keep only last 10000 logs in memory
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-10000);
    }

    // In production, send to external logging service
    console.log('AUDIT:', JSON.stringify(log));
  }

  getUserActivity(userId: string, limit = 100): AuditLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  getFailedAttempts(ip: string, timeWindow = 60 * 60 * 1000): AuditLog[] {
    const since = Date.now() - timeWindow;
    return this.logs.filter(log => 
      log.ip === ip && 
      !log.success && 
      (log.timestamp || 0) > since
    );
  }
}

// Session manager (lightweight implementation used by middleware)
export class SessionManager {
  constructor(private db: any) {}

  async createSession(userId: string, ip: string, userAgent: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at, created_at, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      userId,
      ip,
      userAgent,
      expiresAt.toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    return sessionId;
  }

  async validateSession(sessionId: string, ip: string, userAgent: string): Promise<{
    isValid: boolean;
    session?: any;
    invalidReason?: string;
  }> {
    try {
      const session = await this.db.prepare(`
        SELECT * FROM user_sessions WHERE id = ?
      `).bind(sessionId).first();

      if (!session) {
        return { isValid: false, invalidReason: 'session_not_found' };
      }

      if (new Date(session.expires_at) < new Date()) {
        await this.deleteSession(sessionId);
        return { isValid: false, invalidReason: 'session_expired' };
      }

      if (session.is_revoked) {
        return { isValid: false, invalidReason: 'session_revoked' };
      }

      // Optional: Check IP consistency for security
      if (session.ip_address !== ip) {
        console.warn(`IP mismatch for session ${sessionId}: ${session.ip_address} vs ${ip}`);
      }

      return { isValid: true, session };
    } catch (error) {
      console.error('Session validation error:', error);
      return { isValid: false, invalidReason: 'validation_error' };
    }
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE user_sessions SET last_activity = ? WHERE id = ?
    `).bind(new Date().toISOString(), sessionId).run();
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.prepare(`
      DELETE FROM user_sessions WHERE id = ?
    `).bind(sessionId).run();
  }

  async revokeUserSessions(userId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE user_sessions SET is_revoked = 1 WHERE user_id = ?
    `).bind(userId).run();
  }
}

// User Permissions simple helper (placeholder for more advanced implementations)
export class UserPermissions {
  constructor(private db: any) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const result = await this.db.prepare(`
        SELECT p.permission_name
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ?
      `).bind(userId).all();

      return result.results?.map((row: any) => row.permission_name) || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT 1
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.permission_name = ?
      `).bind(userId, permission).first();

      return !!result;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async grantPermission(userId: string, permission: string): Promise<void> {
    try {
      // Get permission ID
      const permissionRecord = await this.db.prepare(`
        SELECT id FROM permissions WHERE permission_name = ?
      `).bind(permission).first();

      if (!permissionRecord) {
        throw new Error(`Permission ${permission} not found`);
      }

      // Grant permission
      await this.db.prepare(`
        INSERT OR IGNORE INTO user_permissions (user_id, permission_id)
        VALUES (?, ?)
      `).bind(userId, permissionRecord.id).run();
    } catch (error) {
      console.error('Error granting permission:', error);
      throw error;
    }
  }

  async revokePermission(userId: string, permission: string): Promise<void> {
    try {
      await this.db.prepare(`
        DELETE FROM user_permissions
        WHERE user_id = ? AND permission_id = (
          SELECT id FROM permissions WHERE permission_name = ?
        )
      `).bind(userId, permission).run();
    } catch (error) {
      console.error('Error revoking permission:', error);
      throw error;
    }
  }
}

// Export instances
export const rateLimiter = new RateLimiter();
export const csrfProtection = new CSRFProtection();
export const ipSecurity = new IPSecurity();
export const auditLogger = new AuditLogger();

// Cleanup intervals (run periodically)
setInterval(() => {
  rateLimiter.cleanup();
  csrfProtection.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes

export default {
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
  securityHeaders,
  rateLimiter,
  csrfProtection,
  ipSecurity,
  auditLogger,
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  priceSchema,
  coordinatesSchema,
  SessionManager,
  UserPermissions
};
