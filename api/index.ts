import { randomUUID } from "node:crypto";
import type { ServerResponse } from "node:http";

import app from "../src/app";
import { applyCorsHeaders } from "../src/config/cors";
import { connectDB } from "../src/config/db";
import { StatusCodes } from "../src/constants/http";
import { ApiError } from "../src/utils/api-error";

type RequestLike = {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
};

function getHeader(headers: RequestLike["headers"], name: string): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  const value = headers[lower] ?? headers[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function setCorsHeaders(req: RequestLike, res: ServerResponse) {
  applyCorsHeaders(getHeader(req.headers, "origin"), req.headers, (name, value) => res.setHeader(name, value));
}

function getMethod(req: unknown): string {
  const r = req as RequestLike & { method?: string };
  return (r.method ?? "").toUpperCase();
}

function getUrlPath(req: RequestLike): string {
  const raw = req.url ?? "";
  try {
    return new URL(raw, "http://localhost").pathname;
  } catch {
    return raw.split("?")[0] ?? "";
  }
}

function writeJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendJsonError(res: ServerResponse, statusCode: number, code: string, message: string, details?: unknown): void {
  const body: Record<string, unknown> = {
    success: false,
    code,
    message,
    requestId: randomUUID(),
  };
  if (details !== undefined) {
    body.details = details;
  }
  writeJson(res, statusCode, body);
}

function mapConnectFailure(error: unknown): { statusCode: number; code: string; message: string; details?: unknown } {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, code: "API_ERROR", message: error.message, details: error.details };
  }

  if (error instanceof Error) {
    const name = error.name;
    const msg = error.message ?? "";
    if (
      name === "MongooseServerSelectionError" ||
      name === "MongoServerSelectionError" ||
      name === "MongoNetworkError" ||
      msg.includes("buffering timed out") ||
      msg.includes("ECONNREFUSED")
    ) {
      return {
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: "DATABASE_UNAVAILABLE",
        message:
          "Cannot reach the database. On MongoDB Atlas: allow IP 0.0.0.0/0 (or Vercel egress), confirm MONGO_URI in Vercel Environment Variables, and ensure the cluster is not paused.",
      };
    }
  }

  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again later.",
  };
}

export default async function handler(req: unknown, res: unknown) {
  const request = req as RequestLike;
  const response = res as ServerResponse;

  setCorsHeaders(request, response);

  // Preflight must succeed without DB/auth. Normalize method (some runtimes vary casing).
  if (getMethod(req) === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  // Liveness probe: do not require Mongo so deploys and monitors can distinguish "up" vs DB issues.
  if (getMethod(req) === "GET" && getUrlPath(request) === "/api/v1/health") {
    writeJson(response, StatusCodes.OK, { success: true, message: "ServiceHub API is healthy." });
    return;
  }

  try {
    await connectDB();
  } catch (error: unknown) {
    const mapped = mapConnectFailure(error);
    sendJsonError(response, mapped.statusCode, mapped.code, mapped.message, mapped.details);
    return;
  }

  return app(req as never, res as never);
}
