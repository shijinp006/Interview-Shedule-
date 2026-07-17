import { z } from "zod";
import { weekdaySchema } from "./enums";

/** ISO-8601 timestamp that MUST carry a timezone (offset or `Z`). */
export const isoUtcSchema = z.iso.datetime({ offset: true });

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

/** Non-empty resource id string. */
export const idSchema = z.string().min(1);

/** Unique working-days list (JS weekday 0–6). */
export const workingDaysSchema = z
  .array(weekdaySchema)
  .min(1, "Pick at least one working day")
  .max(7)
  .refine((days) => new Set(days).size === days.length, {
    message: "Working days must be unique",
  });
