// Authentication utilities for HabibiStay
// JWT token management, password hashing, and security functions

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface SessionData {
  id: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Failed to verify password');
  }
};

// JWT token generation
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'habibistay',
      audience: 'habibistay-users'
    });
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'habibistay',
      audience: 'habibistay-refresh'
    });
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

// JWT token verification
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'habibistay',
      audience: 'habibistay-users'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'habibistay',
      audience: 'habibistay-refresh'
    }) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

// Token generation with both access and refresh tokens
export const generateAuthTokens = (
  userId: string,
  email: string,
  role: string,
  sessionId: string,
  tokenVersion: number = 1
): AuthTokens => {
  const accessToken = generateAccessToken({ userId, email, role, sessionId });
  const refreshToken = generateRefreshToken({ userId, sessionId, tokenVersion });
  
  // Calculate expiration time in seconds
  const decoded = jwt.decode(accessToken) as JWTPayload;
  const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
  
  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer'
  };
};

// Session management
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /login/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  if (email.length > 254) {
    errors.push('Email address is too long');
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Rate limiting helpers
export const generateRateLimitKey = (identifier: string, action: string): string => {
  return `rate_limit:${action}:${identifier}`;
};

export const generateLoginAttemptKey = (identifier: string): string => {
  return `login_attempts:${identifier}`;
};

// Security headers
export const getSecurityHeaders = () => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('base64');
};

export const verifyCSRFToken = (token: string, expected: string): boolean => {
  if (!token || !expected) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
};

// Password reset token
export const generatePasswordResetToken = (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  return { token, hashedToken, expiresAt };
};

export const verifyPasswordResetToken = (token: string, hashedToken: string): boolean => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hashedToken));
};

// Email verification token
export const generateEmailVerificationToken = (): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return { token, hashedToken, expiresAt };
};

// OAuth state token
export const generateOAuthState = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

export const verifyOAuthState = (state: string, expected: string): boolean => {
  if (!state || !expected) return false;
  return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expected));
};

// Audit logging helpers
export const createAuditLog = (
  userId: string,
  action: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) => {
  return {
    userId,
    action,
    details: JSON.stringify(details),
    ipAddress,
    userAgent,
    timestamp: new Date(),
    success: true
  };
};

export const createFailedAuditLog = (
  identifier: string,
  action: string,
  error: string,
  ipAddress?: string,
  userAgent?: string
) => {
  return {
    userId: null,
    action,
    details: JSON.stringify({ identifier, error }),
    ipAddress,
    userAgent,
    timestamp: new Date(),
    success: false
  };
};

// Token blacklist helpers
export const generateTokenBlacklistKey = (jti: string): string => {
  return `blacklist:${jti}`;
};

export const generateSessionBlacklistKey = (sessionId: string): string => {
  return `session_blacklist:${sessionId}`;
};

// Two-factor authentication helpers
export const generateTOTPSecret = (): string => {
  return crypto.randomBytes(20).toString('base32');
};

export const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

export default {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateAuthTokens,
  generateSessionId,
  generateSecureToken,
  validatePassword,
  validateEmail,
  generateRateLimitKey,
  generateLoginAttemptKey,
  getSecurityHeaders,
  generateCSRFToken,
  verifyCSRFToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  generateOAuthState,
  verifyOAuthState,
  createAuditLog,
  createFailedAuditLog,
  generateTokenBlacklistKey,
  generateSessionBlacklistKey,
  generateTOTPSecret,
  generateBackupCodes
};