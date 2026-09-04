import type { Request, Response, NextFunction } from "express";
import type { Role } from "@repo/types";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient role permissions" });
    }
    next();
  };
}