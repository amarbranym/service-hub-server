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

function getOrigin(req: RequestLike): string {
  const origin = req.headers?.origin;
  if (typeof origin === "string" && origin.length > 0) {
    return origin;
  }
  return "*";
}

function setCorsHeaders(req: RequestLike, res: ResponseLike) {
  res.setHeader("Access-Control-Allow-Origin", getOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req: unknown, res: unknown) {
  const request = req as RequestLike;
  const response = res as ResponseLike;

  setCorsHeaders(request, response);
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  await connectDB();
  return app(req as never, res as never);
}
