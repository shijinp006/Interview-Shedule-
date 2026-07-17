import { z } from "zod";
import {
  idSchema,
  ianaTimeZoneSchema,
  isoUtcSchema,
  timeOfDaySchema,
  workingDaysSchema,
} from "./fields";

const interviewerFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email().optional(),
  timeZone: ianaTimeZoneSchema,
  workingDays: workingDaysSchema,
  workStart: timeOfDaySchema,
  workEnd: timeOfDaySchema,
};

const interviewerBase = z.object(interviewerFields);

export const interviewerCreateSchema = interviewerBase.refine(
  (v) => v.workStart < v.workEnd,
  { message: "workStart must be before workEnd", path: ["workEnd"] },
);

export const interviewerUpdateSchema = interviewerBase.partial().refine(
  (v) => v.workStart == null || v.workEnd == null || v.workStart < v.workEnd,
  { message: "workStart must be before workEnd", path: ["workEnd"] },
);

export const interviewerResponseSchema = z.object({
  id: idSchema,
  name: interviewerFields.name,
  email: z.email().optional(),
  timeZone: ianaTimeZoneSchema,
  workingDays: workingDaysSchema,
  workStart: timeOfDaySchema,
  workEnd: timeOfDaySchema,
  createdAt: isoUtcSchema,
  updatedAt: isoUtcSchema,
});

export type InterviewerCreateInput = z.infer<typeof interviewerCreateSchema>;
export type InterviewerUpdateInput = z.infer<typeof interviewerUpdateSchema>;
export type Interviewer = z.infer<typeof interviewerResponseSchema>;
