"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
exports.sendSignupOtp = sendSignupOtp;
exports.sendLoginOtp = sendLoginOtp;
exports.signupWithOtp = signupWithOtp;
exports.chooseUserRole = chooseUserRole;
exports.loginWithOtp = loginWithOtp;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const http_1 = require("../constants/http");
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const token_1 = require("../utils/token");
const otp_model_1 = require("../models/otp.model");
const email_service_1 = require("./email.service");
async function registerUser(payload) {
    const existing = await user_model_1.UserModel.findOne({ email: payload.email });
    if (existing) {
        throw new api_error_1.ApiError(http_1.StatusCodes.CONFLICT, "Email already exists.");
    }
    const user = await user_model_1.UserModel.create(payload);
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
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
async function loginUser(payload) {
    const user = await user_model_1.UserModel.findOne({ email: payload.email }).select("+password");
    if (!user) {
        throw new api_error_1.ApiError(http_1.StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }
    const isMatch = await user.comparePassword(payload.password);
    if (!isMatch) {
        throw new api_error_1.ApiError(http_1.StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
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
async function getCurrentUser(userId) {
    const user = await user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new api_error_1.ApiError(http_1.StatusCodes.NOT_FOUND, "User not found.");
    }
    return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    };
}
function generateEightDigitOtp() {
    return String(node_crypto_1.default.randomInt(10000000, 100000000));
}
async function sendSignupOtp(email) {
    const existingUser = await user_model_1.UserModel.findOne({ email });
    if (existingUser) {
        throw new api_error_1.ApiError(http_1.StatusCodes.CONFLICT, "Email already exists. Please login.");
    }
    const existingOtp = await otp_model_1.OtpModel.findOne({ email, purpose: "signup" });
    if (existingOtp) {
        const secondsSinceLastSent = Math.floor((Date.now() - existingOtp.lastSentAt.getTime()) / 1000);
        if (secondsSinceLastSent < 30) {
            throw new api_error_1.ApiError(http_1.StatusCodes.TOO_MANY_REQUESTS, `Please wait ${30 - secondsSinceLastSent}s before resending OTP.`);
        }
    }
    const otp = generateEightDigitOtp();
    const codeHash = await bcryptjs_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otp_model_1.OtpModel.findOneAndUpdate({ email, purpose: "signup" }, {
        email,
        purpose: "signup",
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await (0, email_service_1.sendSignupOtpEmail)(email, otp);
}
async function sendLoginOtp(email) {
    const user = await user_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new api_error_1.ApiError(http_1.StatusCodes.NOT_FOUND, "No account found for this email.");
    }
    const existingOtp = await otp_model_1.OtpModel.findOne({ email, purpose: "login" });
    if (existingOtp) {
        const secondsSinceLastSent = Math.floor((Date.now() - existingOtp.lastSentAt.getTime()) / 1000);
        if (secondsSinceLastSent < 30) {
            throw new api_error_1.ApiError(http_1.StatusCodes.TOO_MANY_REQUESTS, `Please wait ${30 - secondsSinceLastSent}s before resending OTP.`);
        }
    }
    const otp = generateEightDigitOtp();
    const codeHash = await bcryptjs_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otp_model_1.OtpModel.findOneAndUpdate({ email, purpose: "login" }, {
        email,
        purpose: "login",
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
    }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await (0, email_service_1.sendSignupOtpEmail)(email, otp);
}
async function signupWithOtp(payload) {
    const otpRecord = await otp_model_1.OtpModel.findOne({ email: payload.email, purpose: "signup" });
    if (!otpRecord) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "OTP not found. Please request a new code.");
    }
    if (otpRecord.expiresAt.getTime() < Date.now()) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "OTP expired. Please request a new code.");
    }
    if (otpRecord.attempts >= 5) {
        throw new api_error_1.ApiError(http_1.StatusCodes.TOO_MANY_REQUESTS, "Too many invalid OTP attempts. Request a new OTP.");
    }
    const isOtpValid = await bcryptjs_1.default.compare(payload.otp, otpRecord.codeHash);
    if (!isOtpValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Invalid OTP code.");
    }
    const existingUser = await user_model_1.UserModel.findOne({ email: payload.email });
    if (existingUser) {
        throw new api_error_1.ApiError(http_1.StatusCodes.CONFLICT, "Email already exists. Please login.");
    }
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ");
    const user = await user_model_1.UserModel.create({
        fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber || "",
        role: "customer",
    });
    await otp_model_1.OtpModel.deleteOne({ _id: otpRecord._id });
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
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
async function chooseUserRole(userId, role) {
    const user = await user_model_1.UserModel.findById(userId);
    if (!user) {
        throw new api_error_1.ApiError(http_1.StatusCodes.NOT_FOUND, "User not found.");
    }
    user.role = role;
    await user.save();
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
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
async function loginWithOtp(payload) {
    const otpRecord = await otp_model_1.OtpModel.findOne({ email: payload.email, purpose: "login" });
    if (!otpRecord) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "OTP not found. Please request a new code.");
    }
    if (otpRecord.expiresAt.getTime() < Date.now()) {
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "OTP expired. Please request a new code.");
    }
    if (otpRecord.attempts >= 5) {
        throw new api_error_1.ApiError(http_1.StatusCodes.TOO_MANY_REQUESTS, "Too many invalid OTP attempts. Request a new OTP.");
    }
    const isOtpValid = await bcryptjs_1.default.compare(payload.otp, otpRecord.codeHash);
    if (!isOtpValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new api_error_1.ApiError(http_1.StatusCodes.BAD_REQUEST, "Invalid OTP code.");
    }
    const user = await user_model_1.UserModel.findOne({ email: payload.email });
    if (!user) {
        throw new api_error_1.ApiError(http_1.StatusCodes.NOT_FOUND, "No account found for this email.");
    }
    await otp_model_1.OtpModel.deleteOne({ _id: otpRecord._id });
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
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
