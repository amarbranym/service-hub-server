import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { StatusCodes } from "../constants/http";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

type ErrorResponseBody = {
  success: false;
  message: string;
  code: string;
  requestId: string;
  details?: unknown;
  stack?: string;
};

function getRequestId(request: Request): string {
  const headerValue = request.header("x-request-id");
  if (headerValue) {
    return headerValue;
  }
  return randomUUID();
}

function sendError(
  request: Request,
  response: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
  stack?: string
) {
  const body: ErrorResponseBody = {
    success: false,
    code,
    message,
    requestId: getRequestId(request),
  };

  if (details !== undefined) {
    body.details = details;
  }
  if (stack) {
    body.stack = stack;
  }

  response.status(statusCode).json(body);
}

function mapUnknownError(error: unknown): { statusCode: number; code: string; message: string; details?: unknown } {
  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: "VALIDATION_ERROR",
      message: "Validation failed for one or more fields.",
      details: Object.values(error.errors).map((item) => item.message),
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: "INVALID_ID",
      message: `Invalid ${error.path} provided.`,
      details: { value: error.value },
    };
  }

  if (error && typeof error === "object" && "code" in error && error.code === 11000) {
    const duplicateKeyError = error as { keyValue?: Record<string, unknown> };
    return {
      statusCode: StatusCodes.CONFLICT,
      code: "DUPLICATE_RESOURCE",
      message: "A record with the same value already exists.",
      details: duplicateKeyError.keyValue,
    };
  }

  if (error instanceof jwt.TokenExpiredError) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      code: "TOKEN_EXPIRED",
      message: "Authentication token has expired.",
    };
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      code: "INVALID_TOKEN",
      message: "Authentication token is invalid.",
    };
  }

  if (error instanceof SyntaxError && "body" in error) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      code: "INVALID_JSON",
      message: "Request body contains invalid JSON.",
    };
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again later.",
  };
}

export function notFoundHandler(request: Request, res: Response): void {
  sendError(request, res, StatusCodes.NOT_FOUND, "ROUTE_NOT_FOUND", `Route not found: ${request.method} ${request.originalUrl}`);
}

export function errorHandler(error: unknown, request: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    sendError(request, res, error.statusCode, "API_ERROR", error.message, error.details, env.nodeEnv === "development" ? error.stack : undefined);
    return;
  }

  const mapped = mapUnknownError(error);
  sendError(
    request,
    res,
    mapped.statusCode,
    mapped.code,
    mapped.message,
    mapped.details,
    env.nodeEnv === "development" && error instanceof Error ? error.stack : undefined
  );
}
