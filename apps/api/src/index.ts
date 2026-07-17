import { env } from "./env";
import { logger } from "./logger";
import { connectDb, getMongoClient } from "./db";
import { createAuth } from "./auth";
import { createApp } from "./app";

async function main() {
  await connectDb();
  const auth = createAuth(getMongoClient());
  const app = createApp(auth);

  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error({ err }, "Failed to start API");
  process.exit(1);
});
