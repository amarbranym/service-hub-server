import mongoose from "mongoose";

import { env } from "./env";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15_000,
    // Prefer IPv4; some Windows/Atlas setups fail SRV resolution over IPv6.
    family: 4,
  });
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}
