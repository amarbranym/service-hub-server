import { Router } from "express";

import { chooseRole, login, me, register, sendLoginOtpCode, sendOtp, signup, verifyLoginOtp } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";

const authRouter = Router();

authRouter.post("/register", authRateLimiter, register);
authRouter.post("/login", authRateLimiter, login);
authRouter.get("/me", requireAuth, me);
authRouter.post("/send-otp", authRateLimiter, sendOtp);
authRouter.post("/signup", authRateLimiter, signup);
authRouter.post("/login/send-otp", authRateLimiter, sendLoginOtpCode);
authRouter.post("/login/verify-otp", authRateLimiter, verifyLoginOtp);
authRouter.patch("/choose-role", requireAuth, chooseRole);

export default authRouter;
