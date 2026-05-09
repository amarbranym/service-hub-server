import { Router } from "express";

import authRouter from "./auth.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ServiceHub API is healthy.",
  });
});

router.use("/auth", authRouter);

export default router;
