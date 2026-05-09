import dotenv from "dotenv";

dotenv.config();

function required(name: string, value?: string): string {
  if (!value) throw new Error(`Missing required env variable: ${name}`);
  return value;
}

export const env = {
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
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL ?? "",
  smtpFromName: process.env.SMTP_FROM_NAME ?? "ServiceHub",
};
