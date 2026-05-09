"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSignupOtpEmail = sendSignupOtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
const http_1 = require("../constants/http");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.smtpHost,
    port: env_1.env.smtpPort,
    secure: env_1.env.smtpPort === 465,
    auth: env_1.env.smtpUser && env_1.env.smtpPass ? { user: env_1.env.smtpUser, pass: env_1.env.smtpPass } : undefined,
});
function getFromField() {
    const email = env_1.env.smtpFromEmail || env_1.env.smtpUser;
    if (!email) {
        throw new api_error_1.ApiError(http_1.StatusCodes.INTERNAL_SERVER_ERROR, "SMTP_FROM_EMAIL or SMTP_USER must be configured.");
    }
    return `"${env_1.env.smtpFromName}" <${email}>`;
}
async function sendSignupOtpEmail(toEmail, otp) {
    if (!env_1.env.smtpHost) {
        throw new api_error_1.ApiError(http_1.StatusCodes.INTERNAL_SERVER_ERROR, "SMTP_HOST is not configured.");
    }
    await transporter.sendMail({
        from: getFromField(),
        to: toEmail,
        subject: "Your ServiceHub verification code",
        text: `Your ServiceHub OTP is ${otp}. It expires in 10 minutes.`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Verify your email</h2>
      <p>Your 8-digit OTP is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    </div>`,
    });
}
