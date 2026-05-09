import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "../constants/http";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/token";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization token is required.");
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (_error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid or expired token.");
  }
}

export function requireRole(roles: Array<"customer" | "provider" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to access this resource.");
    }
    next();
  };
}
