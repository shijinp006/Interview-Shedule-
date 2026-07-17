import { formatInTimeZone } from "date-fns-tz";

/**
 * Half-open overlap: two windows `[aStart, aEnd)` and `[bStart, bEnd)` overlap
 * iff `aStart < bEnd && bStart < aEnd`. Back-to-back windows (aEnd == bStart) do
 * NOT overlap. Pure — no I/O, exhaustively testable.
 */
export function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export interface WorkingHours {
  timeZone: string;
  workingDays: number[]; // 0 = Sunday … 6 = Saturday
  workStart: string; // "HH:mm"
  workEnd: string; // "HH:mm"
}

export interface Check {
  ok: boolean;
  reason?: string;
}

/**
 * Structural window guardrails (independent of any interviewer): valid ordering,
 * not in the past, and within min/max duration.
 */
export function validateWindow(
  start: Date,
  end: Date,
  opts: { minMinutes: number; maxMinutes: number; now?: Date },
): Check {
  const now = opts.now ?? new Date();
  if (!(start < end)) return { ok: false, reason: "start must be before end" };
  if (start.getTime() < now.getTime()) {
    return { ok: false, reason: "Cannot schedule an interview in the past" };
  }
  const minutes = (end.getTime() - start.getTime()) / 60_000;
  if (minutes < opts.minMinutes) {
    return { ok: false, reason: `Interview must be at least ${opts.minMinutes} minutes` };
  }
  if (minutes > opts.maxMinutes) {
    return { ok: false, reason: `Interview must be at most ${opts.maxMinutes} minutes` };
  }
  return { ok: true };
}

/**
 * Whether `[start, end)` (UTC) falls on a working day and entirely within the
 * interviewer's working hours, evaluated in the interviewer's own timezone.
 */
export function withinWorkingHours(start: Date, end: Date, wh: WorkingHours): Check {
  const tz = wh.timeZone;
  const startDay = formatInTimeZone(start, tz, "yyyy-MM-dd");
  const endDay = formatInTimeZone(end, tz, "yyyy-MM-dd");
  if (startDay !== endDay) {
    return {
      ok: false,
      reason: "Interview must start and end on the same day in the interviewer's timezone",
    };
  }

  // date-fns "i" = ISO day of week 1..7 (Mon..Sun); convert to JS 0..6 (Sun..Sat).
  const isoDow = Number(formatInTimeZone(start, tz, "i"));
  const jsDow = isoDow % 7;
  if (!wh.workingDays.includes(jsDow)) {
    return { ok: false, reason: "Interviewer is not available on that weekday" };
  }

  // Zero-padded "HH:mm" compares correctly as strings.
  const startHM = formatInTimeZone(start, tz, "HH:mm");
  const endHM = formatInTimeZone(end, tz, "HH:mm");
  if (startHM < wh.workStart || endHM > wh.workEnd) {
    return {
      ok: false,
      reason: `Outside the interviewer's working hours (${wh.workStart}–${wh.workEnd} ${tz})`,
    };
  }
  return { ok: true };
}
