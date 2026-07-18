import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url().default(" http://localhost:4000"),
  WEB_ORIGIN: z.url().default(" http://localhost:5200"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  MIN_INTERVIEW_MINUTES: z.coerce.number().int().positive().default(15),
  MAX_INTERVIEW_MINUTES: z.coerce.number().int().positive().default(480),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Fail fast with a readable report.
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
