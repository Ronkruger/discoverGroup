import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import logger from '../utils/logger';

/**
 * CSRF Protection Middleware Configuration
 * 
 * Protects against Cross-Site Request Forgery attacks by requiring
 * a valid CSRF token for all state-changing operations (POST, PUT, PATCH, DELETE)
 */

// Configure CSRF protection
// Uses double-submit cookie pattern with httpOnly cookies for security
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Strict same-site policy
    maxAge: 3600000, // 1 hour
  }
});

/**
 * CSRF Error Handler
 * Provides user-friendly error messages for CSRF validation failures
 */
export function csrfErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  const maybeError = err as { code?: string } | null;
  if (!maybeError || maybeError.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Log CSRF validation failures for security monitoring
  logger.warn('CSRF token validation failed', {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent')
  });

  // Return user-friendly error
  res.status(403).json({
    error: 'Invalid CSRF token',
    message: 'Your security token has expired or is invalid. Please refresh the page and try again.',
    code: 'CSRF_TOKEN_INVALID'
  });
}

/**
 * Middleware to attach CSRF token to response locals
 * Makes token available to route handlers
 */
export function attachCsrfToken(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}

/**
 * Conditional CSRF protection - only applies to state-changing methods
 * GET, HEAD, OPTIONS are safe methods and don't need CSRF protection
 */
export function conditionalCsrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for safe HTTP methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Apply CSRF protection for state-changing methods
  csrfProtection(req, res, next);
}

/**
 * Express route to generate and send CSRF token to client
 * Client should call this endpoint before making state-changing requests
 */
export function getCsrfToken(req: Request, res: Response) {
  res.json({
    csrfToken: req.csrfToken(),
    expiresIn: 3600 // seconds
  });
}
