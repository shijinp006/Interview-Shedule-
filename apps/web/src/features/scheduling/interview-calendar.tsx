import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Interview, Interviewer, InterviewStatus } from "@micro-ats/shared";
import {
  EventCalendar,
  type CalendarEvent,
  type CalendarViewport,
  type EventColor,
} from "@/components/event-calendar";
import { TimezoneBridge } from "@/components/timezone-bridge";
import { ApiError } from "@/lib/api";
import { dateToUtcIso } from "@/lib/tz";
import { ScheduleDialog } from "./schedule-dialog";
import { InterviewActionsDialog } from "./interview-actions-dialog";
import { useInterviews, useReschedule } from "./queries";

const STATUS_COLOR: Record<InterviewStatus, EventColor> = {
  Scheduled: "sky",
  Completed: "emerald",
  Cancelled: "rose",
};

/**
 * Product calendar for one Interviewer: viewport-driven fetch, timezone bridge,
 * schedule/actions dialogs, and DnD reschedule. The vendored EventCalendar is a
 * private time-grid adapter behind this module.
 */
export function InterviewCalendar({ interviewer }: { interviewer: Interviewer }) {
  const [viewport, setViewport] = useState<CalendarViewport | null>(null);
  const [scheduleStart, setScheduleStart] = useState<Date | null>(null);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  const { data: interviews } = useInterviews({
    interviewerId: interviewer.id,
    from: viewport?.start.toISOString(),
    to: viewport?.end.toISOString(),
  });

  const reschedule = useReschedule();

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

  function onEventMove(ev: CalendarEvent) {
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
    <>
      <TimezoneBridge interviewer={interviewer} />
      <EventCalendar
        events={events}
        initialView="week"
        onViewportChange={setViewport}
        onSlotSelect={(start) => setScheduleStart(start)}
        onEventSelect={(ev) => {
          const iv = byEventId.get(ev.id);
          if (iv) setActiveInterview(iv);
        }}
        onEventMove={onEventMove}
      />

      <ScheduleDialog
        open={Boolean(scheduleStart)}
        onOpenChange={(o) => !o && setScheduleStart(null)}
        interviewerId={interviewer.id}
        interviewerName={interviewer.name}
        start={scheduleStart}
      />

      <InterviewActionsDialog
        open={Boolean(activeInterview)}
        onOpenChange={(o) => !o && setActiveInterview(null)}
        interview={activeInterview}
      />
    </>
  );
}
