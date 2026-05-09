import type { Request, Response } from "express";

import { StatusCodes } from "../constants/http";
import { asyncHandler } from "../utils/async-handler";
import {
  chooseUserRole,
  getCurrentUser,
  loginUser,
  loginWithOtp,
  registerUser,
  sendLoginOtp,
  sendSignupOtp,
  signupWithOtp,
} from "../services/auth.service";
import {
  validateChooseRoleInput,
  validateLoginInput,
  validateRegisterInput,
  validateSendOtpInput,
  validateSignupWithOtpInput,
  validateVerifyLoginOtpInput,
} from "../validators/auth.validator";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = validateRegisterInput(req.body);
  const data = await registerUser(payload);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "User registered successfully.",
    data,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = validateLoginInput(req.body);
  const data = await loginUser(payload);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful.",
    data,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCurrentUser(req.user!.userId);
  res.status(StatusCodes.OK).json({
    success: true,
    data,
  });
});

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = validateSendOtpInput(req.body);
  await sendSignupOtp(email);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "OTP sent successfully.",
  });
});

export const sendLoginOtpCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = validateSendOtpInput(req.body);
  await sendLoginOtp(email);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login OTP sent successfully.",
  });
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const payload = validateSignupWithOtpInput(req.body);
  const data = await signupWithOtp(payload);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Signup completed successfully.",
    data,
  });
});

export const chooseRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = validateChooseRoleInput(req.body);
  const data = await chooseUserRole(req.user!.userId, role);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Role updated successfully.",
    data,
  });
});

export const verifyLoginOtp = asyncHandler(async (req: Request, res: Response) => {
  const payload = validateVerifyLoginOtpInput(req.body);
  const data = await loginWithOtp(payload);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Login successful.",
    data,
  });
});
