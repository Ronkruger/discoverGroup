import { Request, Response, NextFunction } from "express";

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
  };
}

export function requireAdmin(_req: Request, _res: Response, next: NextFunction) {
  // Placeholder: implement JWT/SSO + RBAC verification here
  // For now allow all requests through on the scaffold branch
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Placeholder: implement JWT/SSO verification here
  // For now, simulate a logged-in user for development
  req.user = {
    id: 'dev-user-123',
    email: 'dev@example.com',
    name: 'Development User',
    fullName: 'Development User'
  };
  next();
}