import type { NextFunction, Request, Response } from "express";

import { StatusCodes } from "../constants/http";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Route not found.",
  });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details ?? undefined,
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    ...(env.nodeEnv === "development" && error instanceof Error ? { stack: error.stack } : {}),
  });
}
