import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

export type AuthUser = {
  id: string;
  role: "TOURIST" | "GUIDE" | "ADMIN";
  email?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authGuard =
  (allowedRoles?: AuthUser["role"][]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const secret = (process.env.JWT_SECRET ?? "CHANGE_ME") as string;

      // Fix: cast through unknown
      const decoded = jwt.verify(token!, secret) as unknown as AuthUser;

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return next(new ApiError(403, "Forbidden"));
      }

      req.user = decoded;
      next();
    } catch {
      next(new ApiError(401, "Invalid token"));
    }
  };
