import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import logger from "../utils/logger";

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    role: string;
  };
  body: Record<string, unknown>;
  params: Record<string, string>;
}

interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to require authentication via JWT token
 * Verifies JWT token from Authorization header and attaches user to request
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token - will throw if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Fetch user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found. Token invalid.' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Contact support.' });
    }
    
    if (user.isArchived) {
      return res.status(403).json({ error: 'Account is archived. Contact support.' });
    }
    
    // Attach user info to request
 req.user = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      name: user.fullName,
      role: user.role,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token attempt');
      return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token attempt');
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
}

/**
 * Middleware to require admin role
 * Must be used AFTER requireAuth middleware
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  
  const adminRoles = ['admin', 'superadmin'];
  
  if (!adminRoles.includes(req.user.role)) {
    logger.warn(`Unauthorized admin access attempt by user: ${req.user.email} (role: ${req.user.role})`);
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
}

/**
 * Middleware to require specific role(s)
 * Must be used AFTER requireAuth middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user: ${req.user.email} (role: ${req.user.role}, required: ${allowedRoles.join(', ')})`);
      return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
    }
    
    next();
  };
}