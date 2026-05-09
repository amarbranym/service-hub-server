import validator from "validator";

import { ApiError } from "../utils/api-error";
import { StatusCodes } from "../constants/http";

type RegisterInput = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: "customer" | "provider" | "admin";
};

type LoginInput = {
  email?: string;
  password?: string;
};

type SendOtpInput = {
  email?: string;
};

type VerifyLoginOtpInput = {
  email?: string;
  otp?: string;
};

type SignupWithOtpInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  otp?: string;
};

type ChooseRoleInput = {
  role?: "customer" | "provider";
};

export function validateRegisterInput(input: RegisterInput): Required<Pick<RegisterInput, "fullName" | "email" | "password">> & {
  role: "customer" | "provider" | "admin";
} {
  const fullName = input.fullName?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const role = input.role ?? "customer";

  if (!fullName || fullName.length < 2) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Full name must be at least 2 characters.");
  }
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid email is required.");
  }
  if (!password || password.length < 6) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password must be at least 6 characters.");
  }
  if (!["customer", "provider", "admin"].includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid role selected.");
  }

  return { fullName, email, password, role };
}

export function validateLoginInput(input: LoginInput): Required<LoginInput> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password;

  if (!email || !validator.isEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid email is required.");
  }
  if (!password) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is required.");
  }

  return { email, password };
}

const phoneRegex = /^[+]?[0-9()\-\s]{7,20}$/;

export function validateSendOtpInput(input: SendOtpInput): { email: string } {
  const email = input.email?.trim().toLowerCase();
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid email is required.");
  }
  return { email };
}

export function validateSignupWithOtpInput(input: SignupWithOtpInput) {
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim() || "";
  const email = input.email?.trim().toLowerCase();
  const phoneNumber = input.phoneNumber?.trim() || "";
  const otp = input.otp?.trim();

  if (!firstName || firstName.length < 2 || firstName.length > 50) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "First name must be between 2 and 50 characters.");
  }
  if (lastName && lastName.length > 50) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Last name must be 50 characters or less.");
  }
  if (!email || !validator.isEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid email is required.");
  }
  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Please enter a valid phone number.");
  }
  if (!otp || !/^\d{8}$/.test(otp)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP must be exactly 8 digits.");
  }

  return { firstName, lastName, email, phoneNumber, otp };
}

export function validateChooseRoleInput(input: ChooseRoleInput): { role: "customer" | "provider" } {
  const role = input.role ?? "customer";
  if (!["customer", "provider"].includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role must be customer or provider.");
  }
  return { role };
}

export function validateVerifyLoginOtpInput(input: VerifyLoginOtpInput): { email: string; otp: string } {
  const email = input.email?.trim().toLowerCase();
  const otp = input.otp?.trim();

  if (!email || !validator.isEmail(email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "A valid email is required.");
  }
  if (!otp || !/^\d{8}$/.test(otp)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP must be exactly 8 digits.");
  }

  return { email, otp };
}
