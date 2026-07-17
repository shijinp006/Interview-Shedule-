import { z } from "zod";
import { interviewStatusSchema } from "./enums";
import { idSchema, ianaTimeZoneSchema, isoUtcSchema } from "./fields";

export const scheduleSchema = z
  .object({
    candidateId: idSchema,
    interviewerId: idSchema,
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
  interviewerId: idSchema.optional(),
  candidateId: idSchema.optional(),
  from: isoUtcSchema.optional(),
  to: isoUtcSchema.optional(),
  status: interviewStatusSchema.optional(),
});

export const interviewResponseSchema = z.object({
  id: idSchema,
  interviewerId: idSchema,
  interviewerName: z.string().min(1),
  interviewerTimeZone: ianaTimeZoneSchema,
  candidateId: idSchema,
  candidateName: z.string().min(1),
  start: isoUtcSchema,
  end: isoUtcSchema,
  status: interviewStatusSchema,
  createdAt: isoUtcSchema,
  updatedAt: isoUtcSchema,
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;
export type InterviewQuery = z.infer<typeof interviewQuerySchema>;
export type Interview = z.infer<typeof interviewResponseSchema>;
