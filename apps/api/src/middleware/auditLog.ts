import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import logger from '../utils/logger';

/**
 * Audit Logging Middleware
 * Logs admin actions for security monitoring and compliance
 */

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

/**
 * Determine action type from HTTP method
 */
function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'READ';
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Extract resource name from path
 * e.g., /admin/tours/123 -> tours
 */
function extractResource(path: string): string {
  const parts = path.split('/').filter(Boolean);
  
  // Remove 'admin' and 'api' prefixes
  const filtered = parts.filter(p => p !== 'admin' && p !== 'api');
  
  // Return first meaningful segment
  if (filtered.length > 0) {
    // Remove IDs (MongoDB ObjectIds or UUIDs)
    const resource = filtered[0];
    if (resource.match(/^[0-9a-f]{24}$/i) || resource.match(/^[0-9a-f-]{36}$/i)) {
      return filtered[1] || 'unknown';
    }
    return resource;
  }
  
  return 'unknown';
}

/**
 * Extract resource ID from path
 */
function extractResourceId(path: string): string | undefined {
  const parts = path.split('/').filter(Boolean);
  
  // Look for MongoDB ObjectId or UUID patterns
  for (const part of parts) {
    if (part.match(/^[0-9a-f]{24}$/i) || part.match(/^[0-9a-f-]{36}$/i)) {
      return part;
    }
  }
  
  return undefined;
}

/**
 * Middleware to log admin actions
 */
function extractErrorMessage(responseBody: unknown): string {
  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (responseBody && typeof responseBody === 'object') {
    const body = responseBody as Record<string, unknown>;
    if (typeof body.error === 'string') {
      return body.error;
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
  }

  return 'Unknown error';
}

export function auditLog(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Capture original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  let responseBody: unknown;
  let responseSent = false;

  // Override res.send to capture response
  res.send = function(body: unknown): Response {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
      logAudit();
    }
    return originalSend.call(this, body);
  };

  // Override res.json to capture response
  res.json = function(body: unknown): Response {
    if (!responseSent) {
      responseBody = body;
      responseSent = true;
      logAudit();
    }
    return originalJson.call(this, body);
  };

  async function logAudit(): Promise<void> {
    try {
      const duration = Date.now() - startTime;
      const user = req.user;
      
      // Only log if user is authenticated
      if (!user) {
        return;
      }

      const action = getActionFromMethod(req.method);
      const resource = extractResource(req.path);
      const resourceId = extractResourceId(req.path);

      const auditData: Record<string, unknown> = {
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName,
        action,
        resource,
        resourceId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        duration,
        timestamp: new Date(),
      };

      // Capture error messages for failed requests
      if (res.statusCode >= 400) {
        auditData.errorMessage = extractErrorMessage(responseBody);
      }

      // For UPDATE/DELETE actions, try to capture changes
      if ((action === 'UPDATE' || action === 'DELETE') && req.body) {
        auditData.changes = {
          after: req.body as Record<string, unknown>,
        };
      }

      await AuditLog.create(auditData);
    } catch (error) {
      // Don't fail the request if audit logging fails
      logger.error('Failed to create audit log:', error);
    }
  }

  // If response is sent via next() or other means, ensure we log
  res.on('finish', () => {
    if (!responseSent) {
      responseSent = true;
      logAudit();
    }
  });

  next();
}

/**
 * Middleware to skip audit logging for specific routes
 */
export function skipAudit(req: Request, res: Response, next: NextFunction): void {
  // Mark request to skip audit
  (req as Request & { skipAudit?: boolean }).skipAudit = true;
  next();
}

/**
 * Log specific security events (login, logout, access denied)
 */
export async function logSecurityEvent(
  userId: string,
  userEmail: string,
  userName: string,
  action: 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED',
  path: string,
  req: Request
): Promise<void> {
  try {
    await AuditLog.create({
      userId,
      userEmail,
      userName,
      action,
      resource: 'auth',
      method: req.method,
      path,
      statusCode: action === 'ACCESS_DENIED' ? 403 : 200,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
}

export default auditLog;
