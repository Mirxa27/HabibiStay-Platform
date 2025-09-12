// Security Middleware for HabibiStay Backend - Production Ready

import { MiddlewareHandler } from 'hono';
import {
  rateLimiter,
  csrfProtection,
  ipSecurity,
  auditLogger,
  securityHeaders,
  verifyJWT,
  sanitizeString,
  SessionManager,
  UserPermissions
} from './security-utils';
import {
  authMiddleware as mochaAuthMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { z } from 'zod';

// Enhanced rate limiting with user-specific limits
export const rateLimitMiddleware = (
  maxRequests = 100, 
  windowMs = 15 * 60 * 1000,
  userMultiplier = 2 // Authenticated users get 2x limit
): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userId = c.get('userId') as string;
    
    // Use user-specific limit if authenticated
    const effectiveLimit = userId ? maxRequests * userMultiplier : maxRequests;
    const rateLimitKey = userId ? `user:${userId}` : `ip:${ip}`;
    
    if (!rateLimiter.isAllowed(rateLimitKey, effectiveLimit, windowMs)) {
      auditLogger.log({
        userId: userId || undefined,
        ip,
        action: 'RATE_LIMIT_EXCEEDED',
        resource: c.req.url,
        details: { maxRequests: effectiveLimit, windowMs, type: userId ? 'user' : 'ip' },
        success: false
      });
      
      return c.json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      }, 429);
    }
    
    // Add rate limit headers
    const remaining = rateLimiter.getRemaining(rateLimitKey, effectiveLimit, windowMs);
    c.res.headers.set('X-RateLimit-Limit', effectiveLimit.toString());
    c.res.headers.set('X-RateLimit-Remaining', remaining.toString());
    c.res.headers.set('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());
    
    await next();
  };
};

// IP blocking middleware
export const ipBlockingMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  if (ipSecurity.isBlocked(ip)) {
    auditLogger.log({
      userId: undefined,
      ip,
      action: 'BLOCKED_IP_ACCESS',
      resource: c.req.url,
      details: {},
      success: false
    });
    
    return c.json({ error: 'Access denied' }, 403);
  }
  
  await next();
};

// Security headers middleware
export const securityHeadersMiddleware: MiddlewareHandler = async (c, next) => {
  await next();
  
  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    c.res.headers.set(key, value);
  });
};

// Enhanced JWT authentication middleware with session management
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await auditLogger.log({
        userId: undefined,
        ip,
        action: 'MISSING_AUTH_TOKEN',
        resource: c.req.url,
        details: { userAgent },
        success: false
      });
      
      return c.json({ 
        error: 'Authentication required',
        code: 'MISSING_TOKEN'
      }, 401);
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT with comprehensive validation
    const payload = await verifyJWT(token, {
      issuer: c.env.JWT_ISSUER || 'habibistay',
      audience: c.env.JWT_AUDIENCE || 'habibistay-api',
      algorithms: ['HS256', 'RS256']
    });
    
    if (!payload) {
      await auditLogger.log({
        userId: undefined,
        ip,
        action: 'INVALID_AUTH_TOKEN',
        resource: c.req.url,
        details: { 
          tokenPrefix: token.substring(0, 10) + '...',
          userAgent
        },
        success: false
      });
      
      return c.json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, 401);
    }
    
    // Check session validity and get user profile
    const sessionManager = new SessionManager(c.env.DB);
    const session = await sessionManager.validateSession(payload.sessionId, ip, userAgent);
    
    if (!session || !session.isValid) {
      await auditLogger.log({
        userId: payload.sub,
        ip,
        action: 'INVALID_SESSION',
        resource: c.req.url,
        details: { 
          sessionId: payload.sessionId,
          reason: session?.invalidReason || 'session_not_found'
        },
        success: false
      });
      
      return c.json({ 
        error: 'Session expired or invalid',
        code: 'INVALID_SESSION'
      }, 401);
    }
    
    // Get full user profile with permissions
    const userProfile = await getUserProfile(payload.sub, c.env.DB);
    if (!userProfile || !userProfile.is_active) {
      await auditLogger.log({
        userId: payload.sub,
        ip,
        action: 'INACTIVE_USER_ACCESS',
        resource: c.req.url,
        details: { userExists: !!userProfile },
        success: false
      });
      
      return c.json({ 
        error: 'User account is inactive',
        code: 'INACTIVE_USER'
      }, 403);
    }
    
    // Store comprehensive user context
    c.set('user', userProfile);
    c.set('userId', payload.sub);
    c.set('userRole', userProfile.role);
    c.set('session', session);
    c.set('permissions', userProfile.permissions || []);
    
    // Update session last activity
    if (session.session?.id) {
      await sessionManager.updateLastActivity(session.session.id);
    }

    await auditLogger.log({
      userId: payload.sub,
      ip,
      action: 'AUTHENTICATED_ACCESS',
      resource: c.req.url,
      details: {
        email: userProfile.email,
        role: userProfile.role,
        sessionId: session.session?.id || payload.sessionId
      },
      success: true
    });
    
    await next();
  } catch (error) {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    
    await auditLogger.log({
      userId: undefined,
      ip,
      action: 'AUTH_MIDDLEWARE_ERROR',
      resource: c.req.url,
      details: { 
        error: error.message,
        stack: error.stack
      },
      success: false
    });
    
    return c.json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    }, 500);
  }
};

// Enhanced role-based authorization with granular permissions
export const requireRole = (requiredRoles: string[]): MiddlewareHandler => {
  return async (c, next) => {
    const userRole = c.get('userRole') as string;
    const userId = c.get('userId') as string;
    const user = c.get('user') as any;
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      await auditLogger.log({
        userId,
        ip,
        action: 'INSUFFICIENT_ROLE_PERMISSIONS',
        resource: c.req.url,
        details: { 
          userRole, 
          requiredRoles,
          email: user?.email
        },
        success: false
      });
      
      return c.json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        required: requiredRoles,
        current: userRole
      }, 403);
    }
    
    await next();
  };
};

// Permission-based authorization for fine-grained access control
export const requirePermissions = (requiredPermissions: string[]): MiddlewareHandler => {
  return async (c, next) => {
    const userPermissions = c.get('permissions') as string[];
    const userId = c.get('userId') as string;
    const user = c.get('user') as any;
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions?.includes(permission)
    );
    
    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => 
        !userPermissions?.includes(permission)
      );
      
      await auditLogger.log({
        userId,
        ip,
        action: 'INSUFFICIENT_PERMISSIONS',
        resource: c.req.url,
        details: { 
          userPermissions: userPermissions || [],
          requiredPermissions,
          missingPermissions,
          email: user?.email
        },
        success: false
      });
      
      return c.json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermissions,
        missing: missingPermissions
      }, 403);
    }
    
    await next();
  };
};

// Resource ownership validation (for users accessing their own resources)
export const requireOwnership = (resourceIdParam: string = 'id'): MiddlewareHandler => {
  return async (c, next) => {
    const userId = c.get('userId') as string;
    const userRole = c.get('userRole') as string;
    const resourceId = c.req.param(resourceIdParam);
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    
    // Admins can access any resource
    if (userRole === 'admin') {
      await next();
      return;
    }
    
    // For other users, check ownership
    const isOwner = await validateResourceOwnership(userId, resourceId, c.req.url, c.env.DB);
    
    if (!isOwner) {
      await auditLogger.log({
        userId,
        ip,
        action: 'UNAUTHORIZED_RESOURCE_ACCESS',
        resource: c.req.url,
        details: { 
          resourceId,
          resourceType: getResourceTypeFromUrl(c.req.url)
        },
        success: false
      });
      
      return c.json({ 
        error: 'Access denied. You can only access your own resources.',
        code: 'OWNERSHIP_REQUIRED'
      }, 403);
    }
    
    await next();
  };
};

// CSRF protection middleware
export const csrfMiddleware: MiddlewareHandler = async (c, next) => {
  const method = c.req.method;
  
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    await next();
    return;
  }
  
  const sessionId = c.req.header('x-session-id');
  const csrfToken = c.req.header('x-csrf-token');
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  if (!sessionId || !csrfToken) {
    auditLogger.log({
      userId: c.get('userId'),
      ip,
      action: 'MISSING_CSRF_TOKEN',
      resource: c.req.url,
      details: { method },
      success: false
    });
    
    return c.json({ error: 'CSRF token required' }, 403);
  }
  
  if (!csrfProtection.validateToken(sessionId, csrfToken)) {
    auditLogger.log({
      userId: c.get('userId'),
      ip,
      action: 'INVALID_CSRF_TOKEN',
      resource: c.req.url,
      details: { method, sessionId },
      success: false
    });
    
    return c.json({ error: 'Invalid CSRF token' }, 403);
  }
  
  await next();
};

// Input validation middleware
export const inputValidationMiddleware: MiddlewareHandler = async (c, next) => {
  const method = c.req.method;
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const contentType = c.req.header('content-type');
      
      if (contentType?.includes('application/json')) {
        const body = await c.req.json();
        
        // Sanitize all string values in the request body
        const sanitizedBody = sanitizeRequestBody(body);
        
        // Store sanitized body in context
        c.set('sanitizedBody', sanitizedBody);
        
        auditLogger.log({
          userId: c.get('userId'),
          ip,
          action: 'INPUT_SANITIZED',
          resource: c.req.url,
          details: { originalKeys: Object.keys(body), sanitizedKeys: Object.keys(sanitizedBody) },
          success: true
        });
      }
    } catch (error) {
      auditLogger.log({
        userId: c.get('userId'),
        ip,
        action: 'INVALID_JSON_PAYLOAD',
        resource: c.req.url,
        details: { error: error.message },
        success: false
      });
      
      return c.json({ error: 'Invalid JSON payload' }, 400);
    }
  }
  
  await next();
};

// Request logging middleware
export const requestLoggingMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const userAgent = c.req.header('user-agent') || 'unknown';
  
  await next();
  
  const duration = Date.now() - start;
  
  auditLogger.log({
    userId: c.get('userId'),
    ip,
    action: 'HTTP_REQUEST',
    resource: c.req.url,
    details: {
      method: c.req.method,
      status: c.res.status,
      duration,
      userAgent
    },
    success: c.res.status < 400
  });
};

// Suspicious activity detection middleware
export const suspiciousActivityMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  await next();
  
  // Check for suspicious patterns
  const isSuspicious = checkSuspiciousActivity(c);
  
  if (isSuspicious) {
    const blocked = ipSecurity.recordSuspiciousActivity(ip);
    
    auditLogger.log({
      userId: c.get('userId'),
      ip,
      action: 'SUSPICIOUS_ACTIVITY_DETECTED',
      resource: c.req.url,
      details: { blocked, status: c.res.status },
      success: false
    });
  }
};

// SQL injection detection middleware
export const sqlInjectionMiddleware: MiddlewareHandler = async (c, next) => {
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const url = c.req.url;
  const query = new URL(url).searchParams;
  
  // Check query parameters for SQL injection patterns
  for (const [key, value] of query.entries()) {
    if (containsSQLInjection(value)) {
      auditLogger.log({
        userId: c.get('userId'),
        ip,
        action: 'SQL_INJECTION_ATTEMPT',
        resource: c.req.url,
        details: { parameter: key, value: value.substring(0, 100) },
        success: false
      });
      
      return c.json({ error: 'Invalid request parameters' }, 400);
    }
  }
  
  // Check request body for SQL injection
  const body = c.get('sanitizedBody');
  if (body && typeof body === 'object') {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && containsSQLInjection(value)) {
        auditLogger.log({
          userId: c.get('userId'),
          ip,
          action: 'SQL_INJECTION_ATTEMPT',
          resource: c.req.url,
          details: { field: key, value: value.substring(0, 100) },
          success: false
        });
        
        return c.json({ error: 'Invalid request data' }, 400);
      }
    }
  }
  
  await next();
};

// Helper functions
function sanitizeRequestBody(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeRequestBody);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeRequestBody(value);
    }
    return sanitized;
  }
  
  return obj;
}

function checkSuspiciousActivity(c: any): boolean {
  const status = c.res.status;
  const method = c.req.method;
  const url = c.req.url;
  
  // Multiple failed auth attempts
  if (status === 401 || status === 403) {
    return true;
  }
  
  // Unusual request patterns
  if (method === 'POST' && url.includes('..')) {
    return true;
  }
  
  // High frequency of errors
  if (status >= 400) {
    return true;
  }
  
  return false;
}

function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\|\||&|%|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|exec|execute|fetch|kill|open|select|sys|sysobjects|syscolumns|table|update)/i,
    /('(''|[^'])*')/,
    /(;|\)|')(\s)*(union|select|insert|delete|update|create|drop|exec|execute|sp_|xp_)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Helper function to get user profile with permissions
async function getUserProfile(userId: string, db: any): Promise<any> {
  try {
    if (!userId) {
      console.error('getUserProfile: userId is required');
      return null;
    }

    const user = await db.prepare(`
      SELECT u.*, GROUP_CONCAT(p.permission_name) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id
      LEFT JOIN permissions p ON up.permission_id = p.id
      WHERE u.id = ?
      GROUP BY u.id
    `).bind(userId).first();
    
    if (user && user.permissions) {
      user.permissions = user.permissions.split(',').filter(Boolean);
    } else {
      user.permissions = [];
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Helper function to validate resource ownership
async function validateResourceOwnership(userId: string, resourceId: string, url: string, db: any): Promise<boolean> {
  try {
    const resourceType = getResourceTypeFromUrl(url);
    
    switch (resourceType) {
      case 'properties':
        const property = await db.prepare('SELECT owner_id FROM properties WHERE id = ?').bind(resourceId).first();
        return property?.owner_id === userId;
        
      case 'bookings':
        const booking = await db.prepare('SELECT user_id FROM bookings WHERE id = ?').bind(resourceId).first();
        return booking?.user_id === userId;
        
      case 'reviews':
        const review = await db.prepare('SELECT user_id FROM reviews WHERE id = ?').bind(resourceId).first();
        return review?.user_id === userId;
        
      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating resource ownership:', error);
    return false;
  }
}

// Helper function to extract resource type from URL
function getResourceTypeFromUrl(url: string): string {
  const urlPath = new URL(url).pathname;
  const pathSegments = urlPath.split('/').filter(Boolean);
  
  // Extract resource type from API path (e.g., /api/properties/123 -> properties)
  if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
    return pathSegments[1];
  }
  
  return 'unknown';
}

export default {
  rateLimitMiddleware,
  ipBlockingMiddleware,
  securityHeadersMiddleware,
  authMiddleware,
  requireRole,
  csrfMiddleware,
  inputValidationMiddleware,
  requestLoggingMiddleware,
  suspiciousActivityMiddleware,
  sqlInjectionMiddleware
};
