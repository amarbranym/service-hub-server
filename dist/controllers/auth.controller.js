"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLoginOtp = exports.chooseRole = exports.signup = exports.sendLoginOtpCode = exports.sendOtp = exports.me = exports.login = exports.register = void 0;
const http_1 = require("../constants/http");
const async_handler_1 = require("../utils/async-handler");
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
exports.register = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_validator_1.validateRegisterInput)(req.body);
    const data = await (0, auth_service_1.registerUser)(payload);
    res.status(http_1.StatusCodes.CREATED).json({
        success: true,
        message: "User registered successfully.",
        data,
    });
});
exports.login = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_validator_1.validateLoginInput)(req.body);
    const data = await (0, auth_service_1.loginUser)(payload);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        message: "Login successful.",
        data,
    });
});
exports.me = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const data = await (0, auth_service_1.getCurrentUser)(req.user.userId);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        data,
    });
});
exports.sendOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { email } = (0, auth_validator_1.validateSendOtpInput)(req.body);
    await (0, auth_service_1.sendSignupOtp)(email);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        message: "OTP sent successfully.",
    });
});
exports.sendLoginOtpCode = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { email } = (0, auth_validator_1.validateSendOtpInput)(req.body);
    await (0, auth_service_1.sendLoginOtp)(email);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        message: "Login OTP sent successfully.",
    });
});
exports.signup = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_validator_1.validateSignupWithOtpInput)(req.body);
    const data = await (0, auth_service_1.signupWithOtp)(payload);
    res.status(http_1.StatusCodes.CREATED).json({
        success: true,
        message: "Signup completed successfully.",
        data,
    });
});
exports.chooseRole = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { role } = (0, auth_validator_1.validateChooseRoleInput)(req.body);
    const data = await (0, auth_service_1.chooseUserRole)(req.user.userId, role);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        message: "Role updated successfully.",
        data,
    });
});
exports.verifyLoginOtp = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_validator_1.validateVerifyLoginOtpInput)(req.body);
    const data = await (0, auth_service_1.loginWithOtp)(payload);
    res.status(http_1.StatusCodes.OK).json({
        success: true,
        message: "Login successful.",
        data,
    });
});
