import type { ZodType } from "zod";
import {
  apiErrorSchema,
  conflictDetailSchema,
  ERROR_CODES,
  type ConflictDetail,
} from "@micro-ats/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Typed conflict detail when this is a 409 INTERVIEW_CONFLICT. */
  get conflict(): ConflictDetail | undefined {
    if (this.code !== ERROR_CODES.INTERVIEW_CONFLICT) return undefined;
    const parsed = conflictDetailSchema.safeParse(this.details);
    return parsed.success ? parsed.data : undefined;
  }
}

type RequestOpts<T> = {
  body?: unknown;
  /** When set, successful JSON is parsed with this schema. Omit for 204. */
  response?: ZodType<T>;
};

async function request<T>(method: string, path: string, opts: RequestOpts<T> = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: opts.body !== undefined ? { "content-type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) {
    if (opts.response) {
      throw new ApiError("Expected a response body", res.status);
    }
    return undefined as T;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(data);
    if (parsed.success) {
      throw new ApiError(
        parsed.data.error.message,
        res.status,
        parsed.data.error.code,
        parsed.data.error.details,
      );
    }
    throw new ApiError(res.statusText || "Request failed", res.status);
  }

  if (!opts.response) {
    throw new ApiError("Missing response schema for JSON response", res.status);
  }
  return opts.response.parse(data);
}

export const api = {
  get: <T>(path: string, response: ZodType<T>) => request<T>("GET", path, { response }),
  post: <T>(path: string, body: unknown, response: ZodType<T>) =>
    request<T>("POST", path, { body, response }),
  patch: <T>(path: string, body: unknown | undefined, response: ZodType<T>) =>
    request<T>("PATCH", path, { body, response }),
  del: (path: string) => request<void>("DELETE", path),
};
