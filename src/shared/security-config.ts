// Security Configuration for HabibiStay Platform

export interface SecurityConfig {
  // Authentication settings
  jwt: {
    secret: string;
    expiresIn: string;
    algorithm: 'HS256' | 'HS384' | 'HS512';
    issuer: string;
  };
  
  // Rate limiting settings
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  
  // Password security
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    saltRounds: number;
  };
  
  // Session management
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  
  // CORS settings
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  
  // File upload security
  fileUpload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    scanForMalware: boolean;
  };
  
  // API security
  api: {
    maxRequestSize: number;
    timeout: number;
    enableCompression: boolean;
    logRequests: boolean;
  };
  
  // Database security
  database: {
    enableQueryLogging: boolean;
    maxConnectionPool: number;
    queryTimeout: number;
    enableSSL: boolean;
  };
  
  // External services
  external: {
    openai: {
      timeout: number;
      maxRetries: number;
      enableLogging: boolean;
    };
    payments: {
      timeout: number;
      verifyWebhooks: boolean;
      enableLogging: boolean;
    };
  };
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'habibi-stay-jwt-secret-change-in-production',
    expiresIn: '24h',
    algorithm: 'HS256',
    issuer: 'habibistay.com'
  },
  
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12
  },
  
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },
  
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'https://habibistay.com',
      'https://www.habibistay.com',
      'https://*.habibistay.com'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Session-ID',
      'X-Requested-With'
    ],
    credentials: true
  },
  
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    scanForMalware: process.env.NODE_ENV === 'production'
  },
  
  api: {
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    timeout: 30000, // 30 seconds
    enableCompression: true,
    logRequests: true
  },
  
  database: {
    enableQueryLogging: process.env.NODE_ENV !== 'production',
    maxConnectionPool: 10,
    queryTimeout: 30000, // 30 seconds
    enableSSL: process.env.NODE_ENV === 'production'
  },
  
  external: {
    openai: {
      timeout: 30000,
      maxRetries: 3,
      enableLogging: process.env.NODE_ENV !== 'production'
    },
    payments: {
      timeout: 30000,
      verifyWebhooks: true,
      enableLogging: true
    }
  }
};

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.openai.com https://api.myfatoorah.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

// Environment validation
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const required = [
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'MYFATOORAH_API_KEY',
    'DATABASE_URL'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate other security settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DOMAIN_NAME) {
      errors.push('DOMAIN_NAME is required in production');
    }
    
    if (!process.env.SSL_CERT_PATH) {
      errors.push('SSL_CERT_PATH is required in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Security audit configuration
export interface SecurityAuditEvent {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  event: string;
  userId?: string;
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
}

export const AUDIT_EVENTS = {
  // Authentication events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  
  // Authorization events
  ACCESS_DENIED: 'ACCESS_DENIED',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  
  // Data events
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_DELETION: 'DATA_DELETION',
  SENSITIVE_DATA_ACCESS: 'SENSITIVE_DATA_ACCESS',
  
  // Security events
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  MALWARE_DETECTED: 'MALWARE_DETECTED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // System events
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CONFIGURATION_CHANGE: 'CONFIGURATION_CHANGE'
} as const;

// Security monitoring thresholds
export const SECURITY_THRESHOLDS = {
  maxFailedLogins: 5,
  maxRequestsPerMinute: 60,
  maxUploadSize: 10 * 1024 * 1024,
  sessionTimeout: 24 * 60 * 60 * 1000,
  passwordExpiry: 90 * 24 * 60 * 60 * 1000,
  maxConcurrentSessions: 5
};

// Compliance settings (GDPR, PCI DSS, etc.)
export const COMPLIANCE_CONFIG = {
  gdpr: {
    enabled: true,
    dataRetentionDays: 365 * 2, // 2 years
    requireConsent: true,
    allowDataExport: true,
    allowDataDeletion: true
  },
  
  pciDss: {
    enabled: true,
    tokenizeCards: true,
    encryptTransmission: true,
    logCardAccess: true,
    requireStrongAuth: true
  },
  
  dataLocalization: {
    enabled: true,
    allowedRegions: ['SAR', 'GCC'], // Saudi Arabia, GCC countries
    encryptAtRest: true,
    encryptInTransit: true
  }
};

export default {
  DEFAULT_SECURITY_CONFIG,
  SECURITY_HEADERS,
  validateEnvironment,
  AUDIT_EVENTS,
  SECURITY_THRESHOLDS,
  COMPLIANCE_CONFIG
};