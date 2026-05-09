"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name, value) {
    if (!value)
        throw new Error(`Missing required env variable: ${name}`);
    return value;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: Number(process.env.PORT ?? 5000),
    /** Primary client URL (also merged into CORS allowlist in src/config/cors.ts). */
    clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
    mongoUri: required("MONGO_URI", process.env.MONGO_URI),
    jwtSecret: required("JWT_SECRET", process.env.JWT_SECRET),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER ?? "",
    /** Gmail “app passwords” are often pasted with spaces; nodemailer expects 16 chars without spaces. */
    smtpPass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
    smtpFromEmail: process.env.SMTP_FROM_EMAIL ?? "",
    smtpFromName: process.env.SMTP_FROM_NAME ?? "ServiceHub",
};
