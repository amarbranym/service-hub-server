import app from "../src/app";
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

function setCorsHeaders(req: RequestLike, res: ResponseLike) {
  // Match app.ts: wide-open CORS for now (Vercel entry must set headers before Express runs).
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");

  const rawHeaders = req.headers as Record<string, string | string[] | undefined> | undefined;
  const requested =
    typeof rawHeaders?.["access-control-request-headers"] === "string"
      ? rawHeaders["access-control-request-headers"]
      : Array.isArray(rawHeaders?.["access-control-request-headers"])
        ? rawHeaders["access-control-request-headers"].join(", ")
        : undefined;
  if (requested) {
    res.setHeader("Access-Control-Allow-Headers", requested);
  }
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
