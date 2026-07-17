import { z } from "zod";
import { weekdaySchema } from "./enums";

/** `HH:mm` 24-hour time-of-day, e.g. "09:00", "17:30". */
export const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be HH:mm (24-hour)");

/** A valid IANA time zone identifier (e.g. "America/New_York"). */
export const ianaTimeZoneSchema = z.string().refine(
  (tz) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid IANA time zone" },
);

const interviewerFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email().optional(),
  timeZone: ianaTimeZoneSchema,
  workingDays: z
    .array(weekdaySchema)
    .min(1, "Pick at least one working day")
    .max(7)
    .refine((days) => new Set(days).size === days.length, {
      message: "Working days must be unique",
    }),
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
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  timeZone: z.string(),
  workingDays: z.array(z.number()),
  workStart: z.string(),
  workEnd: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type InterviewerCreateInput = z.infer<typeof interviewerCreateSchema>;
export type InterviewerUpdateInput = z.infer<typeof interviewerUpdateSchema>;
export type Interviewer = z.infer<typeof interviewerResponseSchema>;
