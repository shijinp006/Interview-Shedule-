import { useEffect, useState } from "react";
import { getTimezoneOffset } from "date-fns-tz";
import type { Interviewer } from "@micro-ats/shared";
import { cn } from "@/lib/utils";
import { formatInTz, interviewerHours, tzCity, tzLabel, viewerTz } from "@/lib/tz";

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function isOpenNow(interviewer: Interviewer, now: Date): boolean {
  const isoDow = Number(formatInTz(now, interviewer.timeZone, "i")); // 1=Mon…7=Sun
  const jsDow = isoDow % 7;
  if (!interviewer.workingDays.includes(jsDow)) return false;
  const hm = formatInTz(now, interviewer.timeZone, "HH:mm");
  return hm >= interviewer.workStart && hm < interviewer.workEnd;
}

function deltaLabel(tz: string, now: Date): string {
  const min = Math.round((getTimezoneOffset(tz, now) - getTimezoneOffset(viewerTz, now)) / 60_000);
  if (min === 0) return "same time as you";
  const ahead = min > 0;
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const parts = [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
  return `${parts} ${ahead ? "ahead" : "behind"}`;
}

function Clock({
  eyebrow,
  city,
  now,
  tz,
}: {
  eyebrow: string;
  city: string;
  now: Date;
  tz: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
        {eyebrow} · {city}
      </div>
      <div className="text-foreground mt-1 font-mono text-2xl leading-none font-medium">
        {formatInTz(now, tz, "HH:mm")}
        <span className="text-muted-foreground text-base">:{formatInTz(now, tz, "ss")}</span>
      </div>
      <div className="text-muted-foreground mt-1.5 font-mono text-xs">
        {formatInTz(now, tz, "EEE, MMM d")} · {tzLabel(tz, now)}
      </div>
    </div>
  );
}

export function TimezoneBridge({ interviewer }: { interviewer: Interviewer }) {
  const now = useNow();
  const open = isOpenNow(interviewer, now);
  const hours = interviewerHours(interviewer);

  return (
    <div className="bg-card rounded-lg border">
      <div className="flex flex-col gap-4 p-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
        <Clock eyebrow="You" city={tzCity(viewerTz)} now={now} tz={viewerTz} />

        <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-1 px-1 text-center justify-center">
          <div className="bg-border h-px flex-1 sm:flex-none sm:w-16" />
          <div className="text-muted-foreground font-mono text-[11px] whitespace-nowrap px-2 sm:px-0">
            {deltaLabel(interviewer.timeZone, now)}
          </div>
          <div className="bg-border h-px flex-1 sm:flex-none sm:w-16" />
        </div>

        <div className="flex items-start sm:justify-end gap-3">
          <div className="text-left sm:text-right">
            <Clock
              eyebrow={interviewer.name.split(" ")[0] ?? "Them"}
              city={tzCity(interviewer.timeZone)}
              now={now}
              tz={interviewer.timeZone}
            />
          </div>
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t px-4 py-2.5 text-xs">
        <span>
          Working hours{" "}
          <span className="text-foreground font-mono">{hours.interviewerRange}</span> local ={" "}
          <span className="text-foreground font-mono">{hours.viewerRange}</span> your time
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ring-1 ring-inset",
            open
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-slate-100 text-slate-500 ring-slate-200",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              open ? "animate-pulse bg-emerald-500 motion-reduce:animate-none" : "bg-slate-400",
            )}
          />
          {open ? "Available now" : "Outside hours"}
        </span>
      </div>
    </div>
  );
}
