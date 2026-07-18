import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import type { MongoClient } from "mongodb";
import { env } from "./env";

/**
 * better-auth instance backed by the same MongoDB connection Mongoose uses
 * (passing `client` also enables the adapter's transaction support). No schema
 * migration step is needed for the Mongo adapter — collections are created lazily.
 */
export function createAuth(client: MongoClient) {
  return betterAuth({
    database: mongodbAdapter(client.db(), { client }),
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.WEB_ORIGIN],
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
