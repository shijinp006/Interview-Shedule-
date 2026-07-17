import { z } from "zod";

export const conflictPartySchema = z.enum(["interviewer", "candidate"]);
export type ConflictParty = z.infer<typeof conflictPartySchema>;

/** Detail attached to a 409 so the UI can name who is already booked. */
export const conflictDetailSchema = z.object({
  party: conflictPartySchema,
  interviewId: z.string(),
  candidateName: z.string(),
  interviewerName: z.string(),
  start: z.string(),
  end: z.string(),
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
export type ApiError = z.infer<typeof apiErrorSchema>;

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
