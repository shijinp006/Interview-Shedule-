import { z } from "zod";

/** Candidate hiring-funnel stage. Free transitions; `Applied` is the default. */
export const STAGES = [
  "Applied",
  "Technical Round",
  "Offered",
  "Hired",
  "Rejected",
] as const;
export const stageSchema = z.enum(STAGES);
export type Stage = z.infer<typeof stageSchema>;

/** Interview lifecycle. `Cancelled` frees the time window and is ignored by conflict detection. */
export const INTERVIEW_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;
export const interviewStatusSchema = z.enum(INTERVIEW_STATUSES);
export type InterviewStatus = z.infer<typeof interviewStatusSchema>;

/** Statuses that occupy an interviewer/candidate's time (i.e. count for conflicts). */
export const BLOCKING_STATUSES: InterviewStatus[] = ["Scheduled", "Completed"];

/** Weekday index, matching JS `Date.getDay()` / date-fns: 0 = Sunday … 6 = Saturday. */
export const weekdaySchema = z.number().int().min(0).max(6);
export type Weekday = z.infer<typeof weekdaySchema>;

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
