import { Request, Response, NextFunction } from "express";

export function requireAdmin(_req: Request, _res: Response, next: NextFunction) {
  // Placeholder: implement JWT/SSO + RBAC verification here
  // For now allow all requests through on the scaffold branch
  next();
}