import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import type { Interview, InterviewStatus } from "@micro-ats/shared";
import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { TimezoneBridge } from "@/components/timezone-bridge";
import { useInterviewers } from "../interviewers/queries";
import { useInterviews, useReschedule } from "./queries";
import { BookingDialog } from "./booking-dialog";
import { EventActionsDialog } from "./event-actions-dialog";
import { ApiError } from "@/lib/api";
import { dateToUtcIso, viewerTz, tzCity, tzDisplay } from "@/lib/tz";

const STATUS_COLOR: Record<InterviewStatus, EventColor> = {
  Scheduled: "sky",
  Completed: "emerald",
  Cancelled: "rose",
};

// Broad window so week/day navigation always has data (calendar owns its own date).
const RANGE_FROM = new Date(Date.now() - 30 * 864e5).toISOString();
const RANGE_TO = new Date(Date.now() + 120 * 864e5).toISOString();

export function CalendarPage() {
  const { data: interviewers } = useInterviewers();
  const [interviewerId, setInterviewerId] = useState<string>("");

  const selected = interviewers?.find((i) => i.id === interviewerId);
  const { data: interviews } = useInterviews({
    interviewerId,
    from: RANGE_FROM,
    to: RANGE_TO,
  });

  const reschedule = useReschedule();

  const [booking, setBooking] = useState<{ start: Date } | null>(null);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  const byEventId = useMemo(() => {
    const map = new Map<string, Interview>();
    interviews?.forEach((iv) => map.set(iv.id, iv));
    return map;
  }, [interviews]);

  const events: CalendarEvent[] = useMemo(
    () =>
      (interviews ?? []).map((iv) => ({
        id: iv.id,
        title: iv.candidateName,
        start: new Date(iv.start),
        end: new Date(iv.end),
        color: STATUS_COLOR[iv.status],
        allDay: false,
      })),
    [interviews],
  );

  function onEventUpdate(ev: CalendarEvent) {
    const interview = byEventId.get(ev.id);
    if (!interview) return;
    if (interview.status !== "Scheduled") {
      toast.error("Only scheduled interviews can be moved");
      return;
    }
    reschedule.mutate(
      { id: ev.id, input: { start: dateToUtcIso(ev.start), end: dateToUtcIso(ev.end) } },
      {
        onSuccess: () => toast.success("Interview rescheduled"),
        onError: (err) => {
          if (err instanceof ApiError && err.conflict) {
            toast.error(err.message, { description: "Move rejected — conflict" });
          } else {
            toast.error(err instanceof Error ? err.message : "Reschedule failed");
          }
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Times shown in your timezone ({tzDisplay(viewerTz)}). Click an empty slot to book.
          </p>
        </div>
        <div className="w-64">
          <Select value={interviewerId} onValueChange={setInterviewerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an interviewer…" />
            </SelectTrigger>
            <SelectContent>
              {interviewers?.map((iv) => (
                <SelectItem key={iv.id} value={iv.id}>
                  {iv.name} · {tzCity(iv.timeZone)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selected ? (
        <Card className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <CalendarClock className="text-muted-foreground/60 size-8" />
          <p className="font-medium">Pick an interviewer to open their calendar</p>
          <p className="text-muted-foreground text-sm">
            You'll see their week in your timezone, with their working hours mapped across.
          </p>
        </Card>
      ) : (
        <>
          <TimezoneBridge interviewer={selected} />
          <EventCalendar
            events={events}
            initialView="week"
            onSlotSelect={(start) => setBooking({ start })}
            onEventClick={(ev) => {
              const iv = byEventId.get(ev.id);
              if (iv) setActiveInterview(iv);
            }}
            onEventUpdate={onEventUpdate}
          />
        </>
      )}

      {selected && (
        <BookingDialog
          open={Boolean(booking)}
          onOpenChange={(o) => !o && setBooking(null)}
          interviewerId={selected.id}
          interviewerName={selected.name}
          start={booking?.start ?? null}
        />
      )}

      <EventActionsDialog
        open={Boolean(activeInterview)}
        onOpenChange={(o) => !o && setActiveInterview(null)}
        interview={activeInterview}
      />
    </div>
  );
}
