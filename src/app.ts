import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { applyCorsHeaders } from "./config/cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import router from "./routes";

const app = express();

// CORS: allow production client + local dev (see src/config/cors.ts and CORS_ORIGINS env).
app.use((req, res, next) => {
  applyCorsHeaders(req.get("Origin"), req.headers as Record<string, string | string[] | undefined>, (name, value) => {
    res.setHeader(name, value);
  });

  if (req.method?.toUpperCase() === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

// Default helmet sets Cross-Origin-Resource-Policy: same-origin, which breaks cross-origin API reads.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
