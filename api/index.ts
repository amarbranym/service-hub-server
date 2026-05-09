import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(req: unknown, res: unknown) {
  await connectDB();
  return app(req as never, res as never);
}
