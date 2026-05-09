import mongoose from "mongoose";

import { env } from "./env";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15_000,
    // Prefer IPv4; some Windows/Atlas setups fail SRV resolution over IPv6.
    family: 4,
  });
  isConnected = true;
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}
