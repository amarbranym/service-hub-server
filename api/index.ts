import app from "../src/app";
import { applyCorsHeaders } from "../src/config/cors";
import { connectDB } from "../src/config/db";

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ResponseLike;
  end: () => void;
};

function getHeader(headers: RequestLike["headers"], name: string): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  const value = headers[lower] ?? headers[name];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function setCorsHeaders(req: RequestLike, res: ResponseLike) {
  applyCorsHeaders(getHeader(req.headers, "origin"), req.headers, (name, value) => res.setHeader(name, value));
}

function getMethod(req: unknown): string {
  const r = req as RequestLike & { method?: string };
  return (r.method ?? "").toUpperCase();
}

export default async function handler(req: unknown, res: unknown) {
  const request = req as RequestLike;
  const response = res as ResponseLike;

  setCorsHeaders(request, response);

  // Preflight must succeed without DB/auth. Normalize method (some runtimes vary casing).
  if (getMethod(req) === "OPTIONS") {
    response.status(204).end();
    return;
  }

  await connectDB();
  return app(req as never, res as never);
}
