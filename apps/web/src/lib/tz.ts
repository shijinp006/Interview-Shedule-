import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { Interviewer } from "@micro-ats/shared";

/** The viewer's own IANA timezone, resolved from the browser. */
export const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * A UTC ISO string becomes a JS Date. The calendar renders it via local getters,
 * i.e. in the viewer's local timezone — which is exactly what we want.
 */
export function isoToDate(iso: string): Date {
  return new Date(iso);
}

/** A local wall-clock Date (from the calendar/picker) back to a UTC ISO string. */
export function dateToUtcIso(d: Date): string {
  return d.toISOString();
}

/** Short timezone label for a given instant, e.g. "EDT", "GMT+1". */
export function tzLabel(tz: string, at: Date = new Date()): string {
  return formatInTimeZone(at, tz, "zzz");
}

/** City part of an IANA id, human-readable: "America/New_York" → "New York". */
export function tzCity(tz: string): string {
  return (tz.split("/").pop() ?? tz).replace(/_/g, " ");
}

/** Full IANA path, human-readable: "America/New_York" → "America/New York". */
export function tzPretty(tz: string): string {
  return tz.replace(/_/g, " ");
}

/** Friendly label with current abbreviation: "New York (EDT)". */
export function tzDisplay(tz: string, at: Date = new Date()): string {
  return `${tzCity(tz)} (${tzLabel(tz, at)})`;
}

/** Format an instant in a specific timezone. */
export function formatInTz(value: string | Date, tz: string, fmt = "MMM d, h:mm a"): string {
  return formatInTimeZone(typeof value === "string" ? new Date(value) : value, tz, fmt);
}

/** Format an instant in the viewer's local timezone. */
export function formatLocal(value: string | Date, fmt = "MMM d, h:mm a"): string {
  return format(typeof value === "string" ? new Date(value) : value, fmt);
}

/**
 * An interviewer's working hours expressed both in their own timezone and,
 * converted, in the viewer's local timezone — the headline timezone value.
 */
export function interviewerHours(interviewer: Interviewer, refDate: Date = new Date()) {
  const dayISO = formatInTimeZone(refDate, interviewer.timeZone, "yyyy-MM-dd");
  const startUtc = fromZonedTime(`${dayISO}T${interviewer.workStart}:00`, interviewer.timeZone);
  const endUtc = fromZonedTime(`${dayISO}T${interviewer.workEnd}:00`, interviewer.timeZone);
  return {
    interviewerTz: interviewer.timeZone,
    interviewerRange: `${interviewer.workStart}–${interviewer.workEnd}`,
    viewerRange: `${format(startUtc, "h:mm a")}–${format(endUtc, "h:mm a")}`,
  };
}
