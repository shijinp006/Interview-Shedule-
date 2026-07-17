import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import type { Auth } from "./auth";
import { env } from "./env";
import { logger } from "./logger";
import { requireAuth } from "./middleware/requireAuth";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { healthRouter } from "./routes/health";
import { interviewersRouter } from "./routes/interviewers";
import { candidatesRouter } from "./routes/candidates";
import { interviewsRouter } from "./routes/interviews";

export function createApp(auth: Auth) {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
  );

  // Health first — no auth, no body parsing needed.
  app.use(healthRouter);

  // better-auth catch-all MUST be mounted before express.json() (Express 5
  // named-splat wildcard; the client hangs if the JSON parser runs first).
  app.all("/api/auth/*splat", toNodeHandler(auth));

  // JSON body parser applies only to our own routes below.
  app.use(express.json());

  const authGate = requireAuth(auth);
  app.use("/api/interviewers", authGate, interviewersRouter);
  app.use("/api/candidates", authGate, candidatesRouter);
  app.use("/api", authGate, interviewsRouter); // /schedule + /interviews/*

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
