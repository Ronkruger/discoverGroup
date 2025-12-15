import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import slowDown from 'express-slow-down';

// Sanitize MongoDB queries - prevents NoSQL injection
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`[SECURITY] Potential NoSQL injection attempt blocked - Key: ${key}`);
  },
});

// Prevent HTTP Parameter Pollution
export const preventParameterPollution = hpp({
  whitelist: [
    'price',
    'duration',
    'difficulty',
    'rating',
    'sort',
    'page',
    'limit',
    'fields',
  ],
});

// Slow down repeated requests to prevent brute force
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after the limit
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// Custom middleware to set additional security headers
export const additionalSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy (formerly Feature Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Input validation helper - sanitize user inputs
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Validate password strength
export const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

// Check for SQL injection patterns
export const hasSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(;|--|\/\*|\*\/)/,
    /('|(\\')|"|(\\"))/,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Middleware to detect and block potential SQL injection
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkObject = (obj: Record<string, unknown>, path = ''): boolean => {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && hasSQLInjection(value)) {
        console.warn(`[SECURITY] SQL injection attempt detected in ${currentPath}: ${value}`);
        return true;
      }
      
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value as Record<string, unknown>, currentPath)) return true;
      }
    }
    return false;
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      error: 'Invalid request - potential security threat detected',
    });
  }
  
  next();
};

// Middleware to log suspicious activity
export const suspiciousActivityLogger = (req: Request, _res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    '/admin',
    '/wp-admin',
    '/phpmyadmin',
    '/.env',
    '/config',
    '/../',
    '/etc/passwd',
  ];
  
  const path = req.path.toLowerCase();
  const suspicious = suspiciousPatterns.some(pattern => path.includes(pattern.toLowerCase()));
  
  if (suspicious && !path.startsWith('/admin/') && !path.startsWith('/api/')) {
    console.warn(`[SECURITY] Suspicious activity detected:`, {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

// Request size limiter
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
    });
  }
  
  next();
};
