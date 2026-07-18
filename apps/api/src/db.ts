import mongoose from "mongoose";
import type { MongoClient } from "mongodb";
import { env } from "./env";
import { logger } from "./logger";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  logger.info("Connected to MongoDB");
}

console.log("sda");

/**
 * The native MongoClient underlying the Mongoose connection — reused by the
 * better-auth MongoDB adapter so auth and domain data share one connection/db.
 */
export function getMongoClient(): MongoClient {
  return mongoose.connection.getClient() as unknown as MongoClient;
}

export async function pingDb(): Promise<boolean> {
  try {
    await mongoose.connection.db?.admin().ping();
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
