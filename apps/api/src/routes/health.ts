import express from "express";
import { pingDb } from "../db";

export const healthRouter = express.Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

healthRouter.get("/ready", async (_req, res) => {
  const ok = await pingDb();
  res.status(ok ? 200 : 503).json({ status: ok ? "ready" : "not-ready" });
});
