import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    role?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Verify JWT token and attach user to request
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          error: 'Token expired',
          message: 'Please login again' 
        });
        return;
      }
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ 
          error: 'Invalid token',
          message: 'Authentication failed' 
        });
        return;
      }
      throw err;
    }

    // Get user from database (without password)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ 
        error: 'User not found',
        message: 'Invalid authentication' 
      });
      return;
    }

    // Check if user is active
    if (!user.isActive || user.isArchived) {
      res.status(403).json({ 
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.' 
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.fullName,
      fullName: user.fullName,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error' 
    });
  }
}

// Require admin role
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First verify authentication
    await requireAuth(req, res, () => {
      // Check if user has admin role
      if (!req.user) {
        res.status(401).json({ 
          error: 'Authentication required',
          message: 'Please login to continue' 
        });
        return;
      }

      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        res.status(403).json({ 
          error: 'Access denied',
          message: 'Admin privileges required' 
        });
        return;
      }

      next();
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({ 
      error: 'Authorization failed',
      message: 'Internal server error' 
    });
  }
}

// Generate JWT token
export function generateToken(userId: string, email: string, role: string = 'user'): string {
  return jwt.sign(
    { 
      userId, 
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'discovergroup-api',
      audience: 'discovergroup-client',
    }
  );
}

// Verify token without requiring request/response
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: string; email: string; role: string };
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
    };
  } catch {
    return null;
  }
}

// Optional authentication - attach user if token exists, but don't require it
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive && !user.isArchived) {
          req.user = {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            fullName: user.fullName,
            role: user.role,
          };
        }
      }
    }
  } catch (error) {
    // Silently fail - authentication is optional
    console.log('Optional auth failed:', error);
  }
  
  next();
}

// Check if request is from admin
export function isAdmin(req: AuthenticatedRequest): boolean {
  return req.user?.role === 'admin' || req.user?.role === 'superadmin';
}

// Check if request is from owner or admin
export function isOwnerOrAdmin(req: AuthenticatedRequest, resourceUserId: string): boolean {
  if (!req.user) return false;
  return req.user.id === resourceUserId || isAdmin(req);
}
