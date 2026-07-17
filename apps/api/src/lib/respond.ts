import type { Response } from "express";
import type { ZodType } from "zod";

/** Parse a DTO with the shared response schema, then send JSON. */
export function sendJson<T>(res: Response, schema: ZodType<T>, data: unknown, status = 200) {
  res.status(status).json(schema.parse(data));
}
