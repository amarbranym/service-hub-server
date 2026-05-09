"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegisterInput = validateRegisterInput;
exports.validateLoginInput = validateLoginInput;
exports.validateSendOtpInput = validateSendOtpInput;
exports.validateSignupWithOtpInput = validateSignupWithOtpInput;
exports.validateChooseRoleInput = validateChooseRoleInput;
const validator_1 = __importDefault(require("validator"));
const api_error_1 = require("../utils/api-error");
const http_1 = require("../constants/http");
function validateRegisterInput(input) {
    const fullName = input.fullName?.trim();
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    const role = input.role ?? "customer";
    if (!fullName || fullName.length < 2) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Full name must be at least 2 characters.");
    }
    if (!email || !validator_1.default.isEmail(email)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "A valid email is required.");
    }
    if (!password || password.length < 6) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Password must be at least 6 characters.");
    }
    if (!["customer", "provider", "admin"].includes(role)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Invalid role selected.");
    }
    return { fullName, email, password, role };
}
function validateLoginInput(input) {
    const email = input.email?.trim().toLowerCase();
    const password = input.password;
    if (!email || !validator_1.default.isEmail(email)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "A valid email is required.");
    }
    if (!password) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Password is required.");
    }
    return { email, password };
}
const phoneRegex = /^[+]?[0-9()\-\s]{7,20}$/;
function validateSendOtpInput(input) {
    const email = input.email?.trim().toLowerCase();
    if (!email || !validator_1.default.isEmail(email)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "A valid email is required.");
    }
    return { email };
}
function validateSignupWithOtpInput(input) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim() || "";
    const email = input.email?.trim().toLowerCase();
    const phoneNumber = input.phoneNumber?.trim() || "";
    const otp = input.otp?.trim();
    if (!firstName || firstName.length < 2 || firstName.length > 50) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "First name must be between 2 and 50 characters.");
    }
    if (lastName && lastName.length > 50) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Last name must be 50 characters or less.");
    }
    if (!email || !validator_1.default.isEmail(email)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "A valid email is required.");
    }
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Please enter a valid phone number.");
    }
    if (!otp || !/^\d{8}$/.test(otp)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "OTP must be exactly 8 digits.");
    }
    return { firstName, lastName, email, phoneNumber, otp };
}
function validateChooseRoleInput(input) {
    const role = input.role ?? "customer";
    if (!["customer", "provider"].includes(role)) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Role must be customer or provider.");
    }
    return { role };
}
