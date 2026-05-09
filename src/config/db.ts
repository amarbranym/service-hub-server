import mongoose from "mongoose";

import { env } from "./env";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  mongoose.set("strictQuery", true);
  connectionPromise = mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15_000,
    // Fail fast if DB is unreachable instead of buffering model operations.
    bufferCommands: false,
  });

  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}
