import jwt from "jsonwebtoken";

import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: "customer" | "provider" | "admin";
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
