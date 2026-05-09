import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { StatusCodes } from "../constants/http";
import { UserModel, type UserRole } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { signAccessToken } from "../utils/token";
import { OtpModel } from "../models/otp.model";
import { sendSignupOtpEmail } from "./email.service";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  const existing = await UserModel.findOne({ email: payload.email });
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists.");
  }

  const user = await UserModel.create(payload);
  const token = signAccessToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

export async function loginUser(payload: LoginPayload) {
  const user = await UserModel.findOne({ email: payload.email }).select("+password");
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const isMatch = await user.comparePassword(payload.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const token = signAccessToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

type SignupWithOtpPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  otp: string;
};

function generateEightDigitOtp(): string {
  return String(crypto.randomInt(10000000, 100000000));
}

export async function sendSignupOtp(email: string) {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists. Please login.");
  }

  const existingOtp = await OtpModel.findOne({ email, purpose: "signup" });
  if (existingOtp) {
    const secondsSinceLastSent = Math.floor((Date.now() - existingOtp.lastSentAt.getTime()) / 1000);
    if (secondsSinceLastSent < 30) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, `Please wait ${30 - secondsSinceLastSent}s before resending OTP.`);
    }
  }

  const otp = generateEightDigitOtp();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpModel.findOneAndUpdate(
    { email, purpose: "signup" },
    {
      email,
      purpose: "signup",
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendSignupOtpEmail(email, otp);
}

export async function sendLoginOtp(email: string) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No account found for this email.");
  }

  const existingOtp = await OtpModel.findOne({ email, purpose: "login" });
  if (existingOtp) {
    const secondsSinceLastSent = Math.floor((Date.now() - existingOtp.lastSentAt.getTime()) / 1000);
    if (secondsSinceLastSent < 30) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, `Please wait ${30 - secondsSinceLastSent}s before resending OTP.`);
    }
  }

  const otp = generateEightDigitOtp();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OtpModel.findOneAndUpdate(
    { email, purpose: "login" },
    {
      email,
      purpose: "login",
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendSignupOtpEmail(email, otp);
}

export async function signupWithOtp(payload: SignupWithOtpPayload) {
  const otpRecord = await OtpModel.findOne({ email: payload.email, purpose: "signup" });
  if (!otpRecord) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP not found. Please request a new code.");
  }
  if (otpRecord.expiresAt.getTime() < Date.now()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP expired. Please request a new code.");
  }
  if (otpRecord.attempts >= 5) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many invalid OTP attempts. Request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(payload.otp, otpRecord.codeHash);
  if (!isOtpValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP code.");
  }

  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, "Email already exists. Please login.");
  }

  const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
  const user = await UserModel.create({
    fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber || "",
    role: "customer" as UserRole,
  });

  await OtpModel.deleteOne({ _id: otpRecord._id });

  const token = signAccessToken({ userId: user._id.toString(), role: user.role });
  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

export async function chooseUserRole(userId: string, role: "customer" | "provider") {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found.");
  }

  user.role = role;
  await user.save();

  const token = signAccessToken({ userId: user._id.toString(), role: user.role });
  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

export async function loginWithOtp(payload: { email: string; otp: string }) {
  const otpRecord = await OtpModel.findOne({ email: payload.email, purpose: "login" });
  if (!otpRecord) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP not found. Please request a new code.");
  }
  if (otpRecord.expiresAt.getTime() < Date.now()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP expired. Please request a new code.");
  }
  if (otpRecord.attempts >= 5) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "Too many invalid OTP attempts. Request a new OTP.");
  }

  const isOtpValid = await bcrypt.compare(payload.otp, otpRecord.codeHash);
  if (!isOtpValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP code.");
  }

  const user = await UserModel.findOne({ email: payload.email });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No account found for this email.");
  }

  await OtpModel.deleteOne({ _id: otpRecord._id });

  const token = signAccessToken({ userId: user._id.toString(), role: user.role });
  return {
    token,
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      avatar: user.avatar,
    },
  };
}
