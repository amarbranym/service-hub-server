import { rateLimit } from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  // Never rate-limit CORS preflight (and avoid odd interactions with proxies).
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many auth requests. Try again later.",
  },
});
