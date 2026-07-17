import { z } from "zod";
import { idSchema, isoUtcSchema } from "./fields";

export const conflictPartySchema = z.enum(["interviewer", "candidate"]);
export type ConflictParty = z.infer<typeof conflictPartySchema>;

/** Detail attached to a 409 so the UI can name who is already booked. */
export const conflictDetailSchema = z.object({
  party: conflictPartySchema,
  interviewId: idSchema,
  candidateName: z.string().min(1),
  interviewerName: z.string().min(1),
  start: isoUtcSchema,
  end: isoUtcSchema,
});
export type ConflictDetail = z.infer<typeof conflictDetailSchema>;

/** Canonical error envelope returned by every non-2xx API response. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

/** Machine-readable error codes used across the API. */
export const ERROR_CODES = {
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  INTERVIEW_CONFLICT: "INTERVIEW_CONFLICT",
  HAS_FUTURE_INTERVIEWS: "HAS_FUTURE_INTERVIEWS",
  INTERNAL: "INTERNAL_ERROR",
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
