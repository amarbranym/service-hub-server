import nodemailer from "nodemailer";

import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { StatusCodes } from "../constants/http";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpPort === 465,
  auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
});

function getFromField(): string {
  const email = env.smtpFromEmail || env.smtpUser;
  if (!email) {
    throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "SMTP_FROM_EMAIL or SMTP_USER must be configured.");
  }
  return `"${env.smtpFromName}" <${email}>`;
}

export async function sendSignupOtpEmail(toEmail: string, otp: string): Promise<void> {
  if (!env.smtpHost) {
    throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Email is not configured. Set SMTP_HOST and related variables on the server.");
  }

  try {
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
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    // eslint-disable-next-line no-console
    console.error("[email] sendMail failed:", message);
    throw new ApiError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "Failed to send email. Verify SMTP_USER, SMTP_PASS, and SMTP_FROM_EMAIL on the server (Vercel env).",
      env.nodeEnv === "development" ? { cause: message } : undefined
    );
  }
}
