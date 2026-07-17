import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { ERROR_CODES } from "@micro-ats/shared";
import { AppError } from "../errors";
import { logger } from "../logger";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { code: ERROR_CODES.NOT_FOUND, message: "Route not found" } });
}

// Express requires the 4-arg signature to recognize this as an error handler.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: ERROR_CODES.VALIDATION, message: "Validation failed", details: err.issues },
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ error: { code: ERROR_CODES.VALIDATION, message: `Invalid value for '${err.path}'` } });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    return res
      .status(400)
      .json({ error: { code: ERROR_CODES.VALIDATION, message: err.message } });
  }
  logger.error({ err }, "Unhandled error");
  return res
    .status(500)
    .json({ error: { code: ERROR_CODES.INTERNAL, message: "Internal server error" } });
}
