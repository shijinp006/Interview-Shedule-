import { z } from "zod";
import { interviewStatusSchema } from "./enums";

/**
 * ISO-8601 timestamp that MUST carry a timezone (offset or `Z`). Naive/ambiguous
 * timestamps are rejected — the server stores everything in UTC.
 */
export const isoUtcSchema = z.iso.datetime({ offset: true });

export const scheduleSchema = z
  .object({
    candidateId: z.string().min(1, "candidateId is required"),
    interviewerId: z.string().min(1, "interviewerId is required"),
    start: isoUtcSchema,
    end: isoUtcSchema,
  })
  .refine((v) => new Date(v.start) < new Date(v.end), {
    message: "start must be before end",
    path: ["end"],
  });

export const rescheduleSchema = z
  .object({
    start: isoUtcSchema,
    end: isoUtcSchema,
  })
  .refine((v) => new Date(v.start) < new Date(v.end), {
    message: "start must be before end",
    path: ["end"],
  });

export const interviewQuerySchema = z.object({
  interviewerId: z.string().optional(),
  candidateId: z.string().optional(),
  from: isoUtcSchema.optional(),
  to: isoUtcSchema.optional(),
  status: interviewStatusSchema.optional(),
});

export const interviewResponseSchema = z.object({
  id: z.string(),
  interviewerId: z.string(),
  interviewerName: z.string(),
  interviewerTimeZone: z.string(),
  candidateId: z.string(),
  candidateName: z.string(),
  start: z.string(),
  end: z.string(),
  status: interviewStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
export type InterviewQuery = z.infer<typeof interviewQuerySchema>;
export type Interview = z.infer<typeof interviewResponseSchema>;
