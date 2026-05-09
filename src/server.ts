import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await connectDB();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  if (error && typeof error === "object" && "name" in error && error.name === "MongooseServerSelectionError") {
    // eslint-disable-next-line no-console
    console.error(`
MongoDB could not be reached. Check:
  • Atlas → Network Access: allow your current IP (or 0.0.0.0/0 for local dev only).
  • Atlas → Database: user/password match the connection string (URL-encode special chars in the password).
  • Cluster is not paused (Atlas UI → Resume).
  • Or use a local URI: MONGO_URI=mongodb://127.0.0.1:27017/servicehub
Docs: https://www.mongodb.com/docs/atlas/troubleshoot-connection/
`);
  }
  process.exit(1);
});
