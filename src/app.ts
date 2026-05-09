import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import router from "./routes";

const app = express();

// Temporary: allow any origin / method / header (dev + cross-domain client until you lock this down).
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");

  const requested = req.header("access-control-request-headers");
  if (requested) {
    res.setHeader("Access-Control-Allow-Headers", requested);
  }

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
